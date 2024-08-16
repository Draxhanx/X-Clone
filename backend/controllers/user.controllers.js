import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import bcrypt from 'bcryptjs'

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

   const userId = req.user._id
   const findUserFollowedByMe = await User.findById(userId).select("following")

   const users =  await User.aggregate([
    {
        $match : {
            _id : {$ne:userId}
        }
    },
    {$sample : {size : 10}}
   ])
    
   const filteredUsers =  users.filter(user=> !findUserFollowedByMe.following.includes(user._id))
   const suggestedUser =  filteredUsers.slice(0,4)

   suggestedUser.forEach(user =>user.password = null)

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
    const {fullname , username ,email, currentPassword , newPassword , bio , link} = req.body ;
    const {profileImg , coverImg} = req.body;
    const userId  =  req.user_id

    try {
        
        const user = await User.findById(userId)
       
        if(!user){
            return res.status(400).json({ error: "User not found" });
        }

        if(!currentPassword && newPassword || !newPassword && currentPassword){
            return res.status(400).json({ error: "Please provide current and new password" });
        }

        if(currentPassword && newPassword){
          const isMatch = bcrypt.compare(currentPassword, user.password)
          if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect" });
          }
          if(newPassword.length > 6){
            return res.status(400).json({ error: "New password should be greater than 6 characters" });
          }

          //if condition is true than hash that password through bcrypt
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
          //than set new password
          user.password = hashedPassword;
          //than save to it in database
          user.save()


        }







        
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
