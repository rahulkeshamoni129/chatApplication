import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: "System is under maintenance. Please try again later."
    }
}, { timestamps: true });

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;
