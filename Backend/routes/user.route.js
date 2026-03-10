import express from "express";
import { allUsers, login, logout, signup, updateProfile, changePassword } from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
const router = express.Router();
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);

// Profile Management Routes
router.put("/update", secureRoute, updateProfile);
router.put("/change-password", secureRoute, changePassword);

export default router;