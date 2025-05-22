import express from "express";
import { generateClassReports } from "../controllers/reportGeneratorController.js";

const router = express.Router();

router.get("/generate/class/:classId", generateClassReports);

export default router;
