import express from "express";
import { patchNewStudentsAcademicRecords } from "../controllers/patchController.js";

const router = express.Router();

router.patch("/patch-empty-records", patchNewStudentsAcademicRecords);

export default router;