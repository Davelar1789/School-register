// routes/feesRoutes.js
import express from "express";
import { setClassFees, makePayment } from "../controllers/feesController.js";
import { protect } from "../middleware/authMiddleware.js"; // If you have auth

const router = express.Router();

router.post("/set-fees", protect, setClassFees);
router.post("/make-payment", protect, makePayment);

export default router;
