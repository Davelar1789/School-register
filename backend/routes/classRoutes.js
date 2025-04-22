// routes/classRoutes.js
import express from "express";
import { createClass, getClassesBySchool, assignTeacherToClass } from "../controllers/classController.js";

const router = express.Router();

// POST /api/classes/
router.post("/", createClass);

// GET /api/classes/school/:schoolId
router.get("/school/:schoolId", getClassesBySchool);
router.post('/assign-teacher', assignTeacherToClass);


export default router;
