import express from "express";
import { patchNewStudentsAcademicRecords, patchOldClassesToNewFormat } from "../controllers/patchController.js";

const router = express.Router();

router.patch("/patch-empty-records", patchNewStudentsAcademicRecords);
router.patch("/patch-old-classes", patchOldClassesToNewFormat);


export default router;