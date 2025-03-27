import { Router } from "express";
import { register } from "../../controllers/general/auth/register.controller.js";
import { login } from "../../controllers/general/auth/login.controller.js";
import { logout } from "../../controllers/general/auth/logout.controller.js";
import { getCurrentUser } from "../../controllers/general/auth/getCurrentUser.controller.js";
import { authToken } from "../../middleware/authToken.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/logout", logout); // Protected logout route
router.get("/user-info", authToken, getCurrentUser); // Protected user info route

export default router;
