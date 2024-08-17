import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import Notification from "../model/notification.model.js";
// import { v2 as cloudinary } from "cloudinary";

import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;

    const userId = req.user._id.toString(); //jwt

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ msg: "Please provide text and image" });
    }
    if (img) {
      const uplodedImg = await cloudinary.uploader.upload(img);
      img = uplodedImg.secure_url;
    }

    const newPost = new Post({
      userId: userId,
      text,
      img,
    }); 

    await newPost.save();

    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
    console.error(error + "error in postController");
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params; // Corrected the typo
    console.log(id);
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ msg: "Post not found" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Corrected the ownership check
    if (post.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ msg: "Not authenticated to delete this post" });
    }

    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.error(error + " error in deletePostController");
    res.status(500).json({ msg: "Server Error" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ msg: "Please provide a comment text" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error + " error in commentPostController");
    res.status(500).json({ msg: "Server Error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const likedPost = post.likes.includes(userId);
    if (likedPost) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likes: postId } }); 
      res.status(200).json({ msg: "post unliked" });
    } else {
      // Like the post
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likes: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.userId,
        type: "like",
      });

      await notification.save();
      res.status(200).json({ msg: "like successfully" });
    }
  } catch (error) {
    console.error(error + " error in likeUnlikePostController");
    res.status(500).json({ msg: "Server Error" });
  }
};


export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ crearted: -1 })
      .populate({
        path: "userId",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: ["-password", "-email"],
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error(error + " error in getAllPostController");
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getLikedPost = async (req, res) => {
  const userIdParam = req.params.id; // Renamed for clarity

  try {
    const user = await User.findById(userIdParam);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPost } })
      .populate({
        path: "userId", // Ensure this matches the field name in the Post schema
        select: "-password",
      })
      .populate({
        path: "comments.user", // Ensure this matches the field name in the Post schema
        select: ["-password", "-email"],
      });

    res.status(200).json({ likedPosts });
  } catch (error) {
    console.error(error + " error in getLikedPostController");
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getFollowingPost = async (req, res) =>{

 try {

  const userId = req.user._id ;

  const user =  await User.findById(userId)
  console.log(user);

  if(!user){
    return res.status(404).json({msg : "User not found"})
  }

  const feedPosts = await Post.find({userId : {$in : user.following}})
  // .populate({
  //   path: "userId",
  //   select: "-password",
  // }).populate({
  //   path: "comments.user",
  //   select: ["-password", "-email"],
  // })

  res.status(200).json(feedPosts)

  
 } catch (error) {
   console.error(error + " error in getFollowingPostController");
   res.status(500).json({ msg: "Server Error" });
  
 }
}

export const getUserPost = async (req,res)=>{
    const{ username} = req.params
    console.log(username);

  try {
    const user = await User.findOne({username})
    if(!user){
      return res.status(404).json({msg : "User not found"})
    }

    const userPosts = await Post.find({userId : user._id}).sort({createdAt: -1})
    .populate({
      path: "userId",
      select: "-password",
    }).populate({
      path: "comments.user",
      select: ["-password", "-email"],
    })

    res.status(200).json(userPosts)


  } catch (error) {
     console.error(error + " error in getUserPostController");
     res.status(500).json({ msg: "Server Error" });
    
  }
}

