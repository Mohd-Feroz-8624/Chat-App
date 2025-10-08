import User from "../models/User.js";
import jwt from "jsonwebtoken";

//this is a middleware to authenticate the user using jwt token and then it will allow the user to access the protected routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.json({ success: false, message: "Not authorized, token failed" });
  }
};
