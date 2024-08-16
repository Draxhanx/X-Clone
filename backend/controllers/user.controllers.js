import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

//models
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";

export const getUserProfile = async (req, res) => {
  const username = req.params;
  try {
    if (!username) {
      return res.status(400).json({ error: "Username is not valid" });
    }
    //find user by username database main find karo
    const user = await User.findOne(username).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
    console.error(error + "error in getUserProfile");
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const findUserFollowedByMe = await User.findById(userId).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !findUserFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = filteredUsers.slice(0, 4);

    suggestedUser.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUser);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
    console.error(error + " error in suggestedUser");
  }
};

export const getFollowUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const modifyUser = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    console.log(currentUser);

    //check if user herself follow him
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    //check both user are exits or not
    if (!modifyUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    //check if user already following this user
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "user unfollowed succesfully" });
    } else {
      //follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      //notification send to the user jisko follow kiya
      const notifiaction = new Notification({
        type: "follow",
        from: req.user._id,
        to: id,
      });

      await notifiaction.save();

      res.status(200).json({ message: "user followed succesfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
    console.error(error + " error in getFollowUnfollowUser");
  }
};

export const getUpdateUser = async (req, res) => {
    const { fullname, username, email, currentPassword, newPassword, bio, link } = req.body;
    const { profileImg, coverImg } = req.body;
    const userId = req.user._id;
  
  
    try {
      let user = await User.findById(userId);
  
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
  
      if ((!currentPassword && newPassword) || (!newPassword && currentPassword)) {
        return res.status(400).json({ error: "Please provide both current and new password" });
      }
  
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: "Current password is incorrect" });
        }
  
        if (newPassword.length < 6) {
          return res.status(400).json({ error: "New password should be greater than 6 characters" });
        }
  
        // Hash the new password and update it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
      }
  
      // Update images
      if (profileImg) {
        if (user.profileImg) {
          await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        }
        const uploadedImg = await cloudinary.uploader.upload(profileImg);
        user.profileImg = uploadedImg.secure_url;
      }
  
      if (coverImg) {
        if (user.coverImg) {
          await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        }
        const uploadedImg = await cloudinary.uploader.upload(coverImg);
        user.coverImg = uploadedImg.secure_url;
      }
  
      // Update other user details
      user.fullname = fullname || user.fullname;
      user.username = username || user.username;
      user.email = email || user.email;
      user.bio = bio || user.bio;
      user.link = link || user.link;
  
      await user.save();
  
      user.password = undefined; // Clear password before sending back to client
  
      res.status(200).json(user);
  
    } catch (error) {
      res.status(500).json({ error: "Server Error" });
      console.error(error + " error in update User");
    }
  };
  

//this another logic
// //check if user is already following this user
// if (modifyUser.followers.includes(currentUser._id)) {
//     modifyUser.followers = modifyUser.followers.filter(
//       (follower) => follower.toString()!== currentUser._id.toString()
//     );
//     modifyUser.save();
//     currentUser.following = currentUser.following.filter(
//       (following) => following.toString()!== modifyUser._id.toString()
//     );
//     currentUser.save();
//     return res.status(200).json({ message: "User unfollowed" });
//   }
