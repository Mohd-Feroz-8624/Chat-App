import express from "express";
import { protectRoute } from "../middleWare/auth.js";
import {
  signUp,
  login,
  checkAuth,
  updateProfile,
} from "../controls/userController.js";

export const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
