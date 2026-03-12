import express from "express";
import { allUsers, login, logout, signup, updateProfile, changePassword, togglePinChat, createGroup, allGroups, toggleBlockUser, blockUser, addGroupMember, removeGroupMember, getLogs, getSystemConfig, toggleMaintenance } from "../controller/user.controller.js";
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
router.put("/add-member", secureRoute, addGroupMember);
router.put("/remove-member", secureRoute, removeGroupMember);
router.put("/toggle-block/:id", secureRoute, toggleBlockUser);
router.put("/block/:id", secureRoute, blockUser);

// Admin Specific Dashboard Routes
router.get("/logs", secureRoute, getLogs);
router.get("/config", secureRoute, getSystemConfig);
router.put("/toggle-maintenance", secureRoute, toggleMaintenance);

export default router;