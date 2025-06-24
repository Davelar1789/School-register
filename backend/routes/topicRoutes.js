// routes/topicRoutes.js
import express from "express";
import { addTopic, getTopics } from "../controllers/topicController.js";
import { protect } from "../middleware/authMiddleware.js"; // assume auth

const router = express.Router();

router.post("/subjects/:subjectId/topics", protect, addTopic);
router.get("/subjects/:subjectId/topics", protect, getTopics);

export default router;
