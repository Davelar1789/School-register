// models/WhatsAppSession.js
import mongoose from "mongoose";

const WhatsAppSessionSchema = new mongoose.Schema({
  name: { type: String, default: "default-session" },
  data: Object, // e.g., { "session.json": "<base64string>", ... }
});

export default mongoose.model("WhatsAppSession", WhatsAppSessionSchema);
