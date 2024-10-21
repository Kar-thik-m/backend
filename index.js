import express from "express";
import connectToDb from "./DataBase/Database.js";
import userRouter from "./Router/UserRouter.js";
import MessageRouter from "./Router/Message.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import { app, server } from "./socket.io/socket.js";
import cors from "cors";

connectToDb();
dotenv.config();


cloudinary.v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_Api,
  api_secret: process.env.Cloud_Secret,
});


app.use(express.json());


app.use(cors());

app.use("/user", userRouter);
app.use("/api", MessageRouter);


app.get("/", (req, res) => {
  res.send("Hello World");
});


server.listen(4000, () => {
  console.log("Server running on port 4000");
});
