import express from "express";
import { createTermSession, getCurrentTermSession, getAllTermSessions } from "../controllers/termSessionController.js";

const router = express.Router();

router.post("/create", createTermSession);
router.get("/current/:schoolId", getCurrentTermSession);
router.get("/all/:schoolId", getAllTermSessions);

export default router;
