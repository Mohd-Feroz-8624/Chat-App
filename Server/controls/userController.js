//this js file is used to control user related operations like registering a new user, login existing user etc. and update the user details

import { generateToken } from "../lib/Utils";
import User from "../models/User";
import bcrypt from "bcryptjs";

//Sign up new User
export const signUp = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "the details are missing " });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "user already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    const token = generateToken(newUser._id);
    res.json({
      success: true,
      userData,
      token,
      message: "user Account is created successfully",
    });
  } catch (error) {
    console.error("Error during user sign up:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

//controller to login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid login credentials" });
    }
    const token = generateToken(newUser._id);
    res.json({
      success: true,
      userData,
      token,
      message: "user Account is created successfully",
    });
  } catch (error) {
    console.error("Error during user sign up:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};


