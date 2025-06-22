// index.js
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

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
