// get all users except the loggoed in user
import message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password ",
    );
    const unseenMesages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await message.find({
        senderId: user._id,
        reciverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMesages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMesages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get all messages for selected users
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await message.find({
      $or: [
        { senderId: myId, reciverId: selectedUserId },
        { senderId: selectedUserId, reciverId: myId },
      ],
    });

    const unseenMessages = await message.find({
      senderId: selectedUserId,
      reciverId: myId,
      status: { $ne: "seen" },
    });

    if (unseenMessages.length > 0) {
      const unseenIds = unseenMessages.map((msg) => msg._id);
      await message.updateMany(
        { _id: { $in: unseenIds } },
        { seen: true, status: "seen" },
      );

      const senderSocketId = userSocketMap[selectedUserId?.toString()];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusBulkUpdated", {
          messageIds: unseenIds,
          status: "seen",
        });
      }
    }

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//api to mark messages as seen using selected user id
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMessage = await message.findByIdAndUpdate(
      id,
      { seen: true, status: "seen" },
      { new: true },
    );

    if (updatedMessage) {
      const senderSocketId = userSocketMap[updatedMessage.senderId?.toString()];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId: updatedMessage._id,
          status: "seen",
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//send message to selecred user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const reciverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newNMessage = await message.create({
      senderId,
      reciverId,
      text,
      image: imageUrl,
      status: "sent",
      seen: false,
    });

    //emit the new messaage to the reciver 's socket

    const receiverSocketId = userSocketMap[reciverId];
    console.debug(
      "sendMessage: reciverId=",
      reciverId,
      "receiverSocketId=",
      receiverSocketId,
    );
    if (receiverSocketId) {
      const deliveredMessage = await message.findByIdAndUpdate(
        newNMessage._id,
        { status: "delivered" },
        { new: true },
      );

      io.to(receiverSocketId).emit("newMessage", deliveredMessage);
      const senderSocketId = userSocketMap[senderId?.toString()];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId: newNMessage._id,
          status: "delivered",
        });
      }
      console.debug(
        "sendMessage: emitted newMessage to socket",
        receiverSocketId,
      );
      return res.json({ success: true, message: deliveredMessage });
    } else {
      console.debug("sendMessage: receiver not connected, cannot emit");
    }

    res.json({ success: true, message: newNMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
