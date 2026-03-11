import express from "express";
import { deleteMessage, getMessage, sendMessage, markMessagesAsSeen, editMessage, searchMessages, toggleStarMessage, toggleReaction, forwardMessage, broadcastMessage, getStarredMessages } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

router.post("/send/:id", secureRoute, sendMessage);
router.post("/forward", secureRoute, forwardMessage);
router.post("/broadcast", secureRoute, broadcastMessage);
router.get("/get/:id", secureRoute, getMessage);
router.get("/starred", secureRoute, getStarredMessages);
router.delete("/delete/:id", secureRoute, deleteMessage);

// Phase 2 Message Status additions
router.put("/seen/:id", secureRoute, markMessagesAsSeen);
router.put("/edit/:id", secureRoute, editMessage);
router.get("/search/:id", secureRoute, searchMessages);
router.put("/star/:id", secureRoute, toggleStarMessage);
router.put("/reaction/:id", secureRoute, toggleReaction);

export default router;