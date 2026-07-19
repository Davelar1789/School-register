import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // adjust to your actual middleware name
import { getTeacherSchemeScope, accessScheme } from "../controllers/markingScheme.controller.js";

const router = express.Router();

router.get("/my-scope", protect, getTeacherSchemeScope);
router.get("/access/:schemeId", protect, accessScheme);

export default router;