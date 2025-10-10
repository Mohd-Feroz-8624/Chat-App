import User from "../models/User.js";
import jwt from "jsonwebtoken";

//this is a middleware to authenticate the user using jwt token and then it will allow the user to access the protected routes
export const protectRoute = async (req, res, next) => {
  try {
    // Support token sent in custom header `token` or standard `Authorization: Bearer <token>`
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    if (!token) {
      // No token provided
      console.debug("protectRoute: no token provided");
      return res
        .status(401)
        .json({
          success: false,
          message: "No token provided, authorization denied",
        });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.debug("protectRoute: decoded token =", decoded);
    } catch (err) {
      console.debug("protectRoute: token verification failed", err.message);
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid token, authorization denied",
        });
    }

    // Lookup user by id from token
    console.debug("protectRoute: looking up user with id", decoded.userId);
    const user = await User.findById(decoded.userId).select("-password");
    console.debug("protectRoute: user lookup result =", !!user);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error in auth middleware" });
  }
};
