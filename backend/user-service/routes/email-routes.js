import express from 'express';

import { sendEmail, sendOTPEmail, sendVerificationEmail } from '../controller/email-controller.js';

const router = express.Router();

router.post('/send-email', sendEmail);
router.post('/send-otp-email', sendOTPEmail);
router.post('/send-verification-email', sendVerificationEmail);

export default router;