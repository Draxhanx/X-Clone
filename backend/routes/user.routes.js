import express from "express";
import { getFollowUnfollowUser, getSuggestedUser, getUpdateUser, getUserProfile } from "../controllers/user.controllers.js";
import { protecteded } from "../middlewares/protected.js";

const router = express.Router()

router.get('/profile/:username',protecteded,getUserProfile)
router.get('/suggested',protecteded,getSuggestedUser)
router.post('/follow/:id',protecteded,getFollowUnfollowUser)
router.get('/update',protecteded,getUpdateUser)



export default router