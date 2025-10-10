import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import { userRouter } from "./Routes/userRoutes.js";
import { protectRoute } from "./middleWare/auth.js";
import messagesRoutes from "./Routes/messagesRoutes.js";
import { Server } from "socket.io";

//creating Express app and HTTP server
const app = express();
const server = http.createServer(app);

//omotialisation of sokcet io
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//store online users
export const userSocketMap = {}; //{userId: socketId}

//sokcet.io connection function
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("user connected", userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  //emit online users to all connected users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // handle client disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("API is working"));
app.use("/api/auth", userRouter);
app.use("/api/message", messagesRoutes);

// Debug endpoints to inspect request headers and auth behavior
app.get("/api/debug/echo-headers", (req, res) => {
  res.json({ success: true, headers: req.headers });
});

app.get("/api/debug/echo-protected", protectRoute, (req, res) => {
  res.json({ success: true, headers: req.headers, user: req.user });
});

//conection to mongoDB
await connectDB();

//PORT number setting up and server listening
if(process.env.NODE_ENV !== "production" ){

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
//exporting for deployment
export default server
