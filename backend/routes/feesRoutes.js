// routes/feesRoutes.js
import express from "express";
import { setClassFees, makePayment, fetchFees, getRecentPayments, fetchTotalFeesPaid, setFeedingFee } from "../controllers/feesController.js";
import { protect } from "../middleware/authMiddleware.js"; // If you have auth

const router = express.Router();

router.post("/set-fees", protect, setClassFees);
router.post("/make-payment", protect, makePayment);
router.post("/set-feeding-fee", setFeedingFee);
router.get('/fetch-fees/:studentId', fetchFees);
router.get('/recent-payments/:studentId', getRecentPayments);
router.get('/total-paid/:schoolId', fetchTotalFeesPaid);

export default router;
