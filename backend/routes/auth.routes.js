import express from "express";
import { getME, login, logout, signup } from "../controllers/auth.controllers.js";
import { protecteded } from "../middlewares/protected.js";

const router = express.Router();

// Define routes
router.get('/me',protecteded, getME )

router.post('/signup' , signup)

router.post('/login', login)

router.post('/logout', logout)

export default router;

