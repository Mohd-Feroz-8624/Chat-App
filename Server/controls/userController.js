//this js file is used to control user related operations like registering a new user, login existing user etc. and update the user details

import { generateToken } from "../lib/Utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

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
      userData: newUser,
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
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid login credentials" });
    }
    const token = generateToken(userData._id);
    res.json({
      success: true,
      userData,
      token,
      message: "user logged in successfully",
    });
  } catch (error) {
    console.error("Error during user sign up:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// controller to change password from login page
export const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      userData.password,
    );

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Current password is wrong" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(userData._id, { password: hashedPassword });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error during change password:", error);
    return res.json({ success: false, message: "Internal server error" });
  }
};

//controller to check if user is authenticated or not
export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

//controller to update user details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true },
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true },
      );
    }
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error during updating user profile:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};
