import express from "express";
import { deleteMessage, getMessage, sendMessage, markMessagesAsSeen, editMessage, searchMessages, toggleStarMessage, toggleReaction, forwardMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

router.post("/send/:id", secureRoute, sendMessage);
router.post("/forward", secureRoute, forwardMessage);
router.get("/get/:id", secureRoute, getMessage);
router.delete("/delete/:id", secureRoute, deleteMessage);

// Phase 2 Message Status additions
router.put("/seen/:id", secureRoute, markMessagesAsSeen);
router.put("/edit/:id", secureRoute, editMessage);
router.get("/search/:id", secureRoute, searchMessages);
router.put("/star/:id", secureRoute, toggleStarMessage);
router.put("/reaction/:id", secureRoute, toggleReaction);

export default router;