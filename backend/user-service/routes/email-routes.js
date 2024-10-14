import express from 'express';

import { sendVerificationEmail, verifyEmail } from '../controller/email-controller.js';
import { verifyAccessToken } from "../middleware/basic-access-control.js";


const router = express.Router();

router.post('/send-verification-email', sendVerificationEmail);
router.get('/verify-email', verifyEmail);

export default router;