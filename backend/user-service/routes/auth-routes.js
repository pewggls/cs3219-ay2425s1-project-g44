import express from "express";

import { handleLogin, handleVerifyToken, resetPassword, verifOTP } from "../controller/auth-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifOTP);
router.get("/verify-token", verifyAccessToken, handleVerifyToken);

export default router;