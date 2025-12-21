import express from "express";
import { patchStudentsGenderToMale, patchNewStudentsAcademicRecords, patchOldClassesToNewFormat } from "../controllers/patchController.js";

const router = express.Router();

router.patch("/patch-empty-records", patchNewStudentsAcademicRecords);
router.patch("/patch-old-classes", patchOldClassesToNewFormat);
router.patch("/students/patch-gender", patchStudentsGenderToMale);


export default router;