import { genrateTokenAndSetCookie } from "../lib/utils/gernrateToken.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullname, username, password, email } = req.body;

    // const emailRegex =

    if (!fullname || !username || !password || !email) {
      res.status(404).json({ message: "All fields required" });
    }

    // // check if username is exits or not
    // const exsistingUser = await User.findOne({ username });
    // if (exsistingUser) {
    //   return res.status(400).json({ message: "User already exists" });
    // }

    // // check if email is exits or noi
    // const existingEmail = await User.findOne({ email });
    // if (existingEmail) {
    //   return res.status(400).json({ message: "Email already exists" });
    // }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const message =
        existingUser.username === username
          ? "Username already exists"
          : "Email already exists";
      return res.status(400).json({ message });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // now you had been checked all condition now you can create user if all conditon meets true

    const newUser = new User({
      fullname,
      email,
      password: hashPassword,
      username,
    });

    // if our user is created than we can set jwt tokens
    // jwt token will be stored in cookie or local storage of client side
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // res.json({ token });

    if (newUser) {
      genrateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullname: newUser.fullname,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        // bio: newUser.bio,
        // links: newUser.links,
      });
    } else {
      res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error in server " });
    console.error(error + "error in signup controller ");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if user name and password are fiiled or not
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // if  fields are correct than check on data base is they exist
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // compare password

    const isMatch = await bcrypt.compare(password, user?.password || "");

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
  // if password is correct than generate token and send it to client side
    genrateTokenAndSetCookie(user._id, res);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      // bio: user.bio,
      // links: user.links,
    })

  } catch (error) {
    console.error(error + "Please signup first");
  }
};

export const logout = (req, res) => {
  try {
    res.cookie('jwt',"",{maxAge:0})
    res.status(200).json({message:"logout sucessfully"})
    
  } catch (error) {
    res.status(500).json({ error: "internal server error"})
    console.error(error + "error in logout controller")
    
  }
};

export const getME = async(req, res) => {

  const userId = req.user._id

  try {
    const user = await User.findOne(userId).select("-password")
    res.status(200).json(user)
    
  } catch (error) {
    res.status(500).json({ error: "internal server error"})
    console.error(error + "error in getME controller")
    
  }
};
