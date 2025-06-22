import express from "express";
import { getMessage, sendMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
const router=express.Router()//with the help of this we weill create the routesx
//storing the message in the database
router.post("/send/:id",secureRoute, sendMessage)
router.get("/get/:id",secureRoute, getMessage)

export default router