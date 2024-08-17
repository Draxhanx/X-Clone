import express from "express";
import { protecteded } from "../middlewares/protected.js";
import { commentPost, createPost, deletePost, getAllPost, getFollowingPost, getLikedPost, getUserPost, likeUnlikePost } from "../controllers/post.controllers.js";

const router = express.Router();


router.get("/getallpost", protecteded, getAllPost);
router.get("/following", protecteded, getFollowingPost);
router.get("/userpost/:username", protecteded, getUserPost);


router.get("/likepost/:id", protecteded, getLikedPost);

router.post("/create", protecteded, createPost);
router.post("/like/:id", protecteded, likeUnlikePost);
router.post("/comments/:id", protecteded, commentPost);
router.delete("/:id", protecteded, deletePost);

export default router;
