import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";

//creating Express app and HTTP server
const app = express();
const server = http.createServer(app);

//Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("API is working"));

//conection to mongoDB
await connectDB();

//PORT number setting up and server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));