import express from "express";
import { getWeeklyAttendanceSummary } from "../controllers/attendance.internal.controller.js";

const router = express.Router();

// Internal bot route — secured by API key, not JWT
router.get("/weekly-summary", async (req, res) => {
  const apiKey = req.headers["x-bot-api-key"];
  if (apiKey !== process.env.BOT_API_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return getWeeklyAttendanceSummary(req, res);
});

export default router;