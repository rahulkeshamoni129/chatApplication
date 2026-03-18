// index.js
import path from "path";
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoute from './routes/user.route.js'; // ⚠️ include `.js` extension if using ESM
import messageRoute from './routes/message.route.js'; 
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { app, server } from './SockedIo/server.js';
dotenv.config();


//middleware
app.use(express.json());
app.use(cookieParser())
app.use(cors())
const PORT = process.env.PORT || 4000;
const URI = process.env.MONGODB_URI;

try {
  await mongoose.connect(URI);
  console.log("Connected to MongoDB");
} catch (err) {
  console.log(err);
}

app.use("/api/users", userRoute);
app.use("/api/message", messageRoute);

// Serving Static Frontend Files (Build)
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "Frontend", "dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
    });
}

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
