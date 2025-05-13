import express from "express";
import { markTutorialSeen, getTutorialStatus } from "../controllers/tutorialController.js";

const router = express.Router();

router.put("/mark-tutorial-seen/:teacherId", markTutorialSeen); // ✅ Mark tutorial as seen
router.get("/tutorial-status/:teacherId", getTutorialStatus); // ✅ Get tutorial status

export default router;
