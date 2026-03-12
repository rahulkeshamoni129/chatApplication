import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import SystemConfig from "../models/systemConfig.model.js";


const secureRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "No token,Authorisation denied" })
    }
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid Token" })

    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "NO user found" })
    }

    // Check Maintenance Mode
    const config = await SystemConfig.findOne();
    if (config?.maintenanceMode && !user.isAdmin) {
      return res.status(503).json({ error: "System is under maintenance. Please try again later." });
    }

    req.user = user
    next();
  } catch (error) {
    console.log("Error in secureRoute :",error);
    res.status(500).json({error:"Internal server error"});
  }
  
}
export default secureRoute