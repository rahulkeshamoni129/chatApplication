import express from "express";
import { allUsers, login, logout, signup, updateProfile, changePassword, togglePinChat, createGroup, allGroups, toggleBlockUser } from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
const router = express.Router();
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);
router.get("/allgroups", secureRoute, allGroups);

// Management Routes
router.put("/update", secureRoute, updateProfile);
router.put("/change-password", secureRoute, changePassword);
router.put("/pin-chat", secureRoute, togglePinChat);
router.post("/create-group", secureRoute, createGroup);
router.put("/toggle-block/:id", secureRoute, toggleBlockUser);

export default router;