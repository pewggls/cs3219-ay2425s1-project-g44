import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { 
    findUserById as _findUserById,
    findUserByEmail as _findUserByEmail,
} from "../model/repository.js";

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
}

const generateOTPforUser = async (email) => {
    const user = await _findUserByEmail(email);

    if (!user) {
        throw new Error("User not found.");
    }

    user.otp = generateOtp();
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    return user.otp;
}

export const sendEmail = async (req, res) => {
  try {
    const { email, title, html } = req.body;
    // Check if all required fields are present
    if (!email || !title || !html) {
        return res.status(400).json({ message: 'Missing required fields: email, title, and html are all required.' });
    }

    // Set up the transporter for nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: title,
      html: html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    console.log("successfully send")
    return res.status(200).json({ message: 'Email sent successfully!'});
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

export const sendOTPEmail = async (req, res) => {
    const { username, email } = req.body;
    const otp = await generateOTPforUser(email);
    const resetPasswordLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/forget-password/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`

    req.body = {
        email: email,
        title: 'Reset Your Password for PeerPrep',
        html: `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        padding: 20px;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .email-body {
                        text-align: center;
                    }
                    .email-body h1 {
                        font-size: 24px;
                        color: #333;
                    }
                    .email-body p {
                        font-size: 16px;
                        color: #555;
                    }
                    .verification-code {
                        font-size: 30px;
                        color: #333;
                        padding: 10px;
                        border: 1px solid #ddd;
                        display: inline-block;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #999;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-body">
                        <h1>Hi ${username},</h1>
                        <p>We received a request to reset your password. Enter the following verification code to complete the process:</p>
                        <div class="verification-code">${otp}</div>
                    </div>
                    <div class="footer">
                        <p>If you didn't request a password reset, please ignore this email.</p>
                        <p>Best regards, <br> The PeerPrep Team</p>
                    </div>
                </div>
            </body>
            </html>`
    }
    sendEmail(req, res);
}

export const sendVerificationEmail = async (req, res) => {
    const { username, email, id, type } = req.body;

    let verificationLink;
    if (type === 'sign-up') {
        // For sign-up, only include the user ID in the verification link
        verificationLink = `${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/auth/verify-email?type=sign-up&id=${encodeURIComponent(id)}`;
    } else if (type === 'email-update') {
        // For email update, include user ID, email, and username
        verificationLink = `${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/auth/verify-email?type=update&id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`;
    }

    let emailTitle;
    let emailMessage;
    if (type === 'sign-up') {
        emailTitle = 'Confirm Your Email Address for PeerPrep';
        emailMessage = `
            <p>Thank you for signing up for <strong>PeerPrep</strong>! To start using your account, please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email</a>
            <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
            <div class="verification-link">${verificationLink}</div>
        `;
    } else if (type === 'email-update') {
        emailTitle = 'Confirm Your New Email Address for PeerPrep';
        emailMessage = `
            <p>You recently requested to update your email for <strong>PeerPrep</strong>. To complete the process, please verify your new email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email</a>
            <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
            <div class="verification-link">${verificationLink}</div>
        `;
    }

    req.body = {
        email: email,
        title: emailTitle,
        html: `
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f2f2f2;
                  padding: 20px;
              }
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .email-body {
                  text-align: center;
              }
              .email-body h1 {
                  font-size: 24px;
                  color: #333;
              }
              .email-body p {
                  font-size: 16px;
                  color: #555;
              }
              .verification-link {
                  font-size: 14px;
                  color: #333;
                  padding: 10px;
                  border: 1px solid #ddd;
                  display: inline-block;
                  margin: 20px 0;
                  word-wrap: break-word; 
              }
              .button {
                  display: inline-block;
                  background-color: #87cefa;
                  color: white;
                  border-radius: 10px;
                  padding: 10px 20px;
                  text-align: center;
                  text-decoration: none;
                  font-size: 16px;
                  cursor: pointer;
                  transition: all 0.3s ease;
              }
              .button:hover {
                  background-color: #add8e6;
              }
              .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #999;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-body">
                  <h1>Welcome, ${username}!</h1>
                  ${emailMessage}
              </div>
              <div class="footer">
                  <p>If you didn't request this, please ignore this email.</p>
                  <p>Best regards, <br> The PeerPrep Team</p>
              </div>
          </div>
      </body>
      </html>`,
    }
    return sendEmail(req, res);
}