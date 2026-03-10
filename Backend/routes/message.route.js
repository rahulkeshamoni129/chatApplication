import express from "express";
import { getMessage, sendMessage, deleteMessage, markMessagesAsSeen, editMessage, searchMessages, toggleStarMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
const router = express.Router()//with the help of this we weill create the routesx
//storing the message in the database
router.post("/send/:id", secureRoute, sendMessage)
router.get("/get/:id", secureRoute, getMessage)
router.delete("/delete/:id", secureRoute, deleteMessage)

// Phase 2 Message Status additions
router.put("/seen/:id", secureRoute, markMessagesAsSeen)
router.put("/edit/:id", secureRoute, editMessage)
router.get("/search/:id", secureRoute, searchMessages)
router.put("/star/:id", secureRoute, toggleStarMessage)

export default router