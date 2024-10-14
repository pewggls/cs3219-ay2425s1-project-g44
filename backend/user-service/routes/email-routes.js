import express from 'express';

import { sendVerificationEmail } from '../controller/email-controller';

const router = express.Router();

router.post('/send-verification-email', sendVerificationEmail);

export default router;