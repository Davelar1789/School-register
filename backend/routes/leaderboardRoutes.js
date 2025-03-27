import express from "express";
import { getUserRanking, getTopRankings } from "../controllers/general/leaderboard.controller.js";
import { authToken } from "../middleware/authToken.js";

const router = express.Router();

// Endpoint to get the user's ranking
router.get("/user-ranking", authToken, getUserRanking);

// Endpoint to get the top 10 rankings
router.get("/top-ranking", getTopRankings);

export default router;
