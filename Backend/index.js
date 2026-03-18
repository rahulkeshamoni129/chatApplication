// index.js
import path from "path";
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoute from './routes/user.route.js';
import messageRoute from './routes/message.route.js'; 
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { app, server } from './SockedIo/server.js';
dotenv.config();

// middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4000",
  "http://127.0.0.1:3000",
  "https://chatapplication-jpcf.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow all in dev OR if no origin (backend calls itself / server-to-server)
    if (!origin || process.env.NODE_ENV !== "production") return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin: ' + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

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
    app.get("/", (req, res) => {
        res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
    });
    // For all other routes, serve index.html
    app.get("/*path", (req, res) => {
        res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
    });
}

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
