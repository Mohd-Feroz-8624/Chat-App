import express from "express";
import message from "../models/Message.js";
import { protectRoute } from "../middleWare/auth.js";
import {
  getMessages,
  getUsersForSidebar,
  markMessagesAsSeen,
  sendMessage,
} from "../controls/messageController.js";

const messagesRouters = express.Router();
messagesRouters.get("/users", protectRoute, getUsersForSidebar);
messagesRouters.get("/:id", protectRoute, getMessages);
messagesRouters.put("/mark/:id", protectRoute, markMessagesAsSeen);
messagesRouters.post("/send/:id", protectRoute, sendMessage);

export default messagesRouters;
