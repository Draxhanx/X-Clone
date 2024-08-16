import User from "../model/user.model.js";
import jwt from "jsonwebtoken"

export const protecteded = async (req, res, next) => {
  const token = req.cookies.jwt;
 

  try {
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied, no token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // now i have to check user

    const user = await User.findById(decodedToken.userId).select("-password")

    if (!user) {
      res.status(401).json({ message: "Access denied , No user found" });
    }
    // if user is valid then continue to protected route
     req.user = user
   next()

  } catch (error) {
    res.status(401).json({ message: "user didn't have a valid token" });
    console.error(error + "user not have a token");
  }
};
