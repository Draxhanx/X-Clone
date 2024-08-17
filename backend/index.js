import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary'

import { connectDB } from "./config/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_SECRET,
})


const app = express();
const PORT = process.env.PORT || 5000;

console.log(process.env.PORT)

 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);


 
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
