import bcrypt from "bcrypt";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { isValidObjectId } from "mongoose";
import { 
    findUserById as _findUserById,
    findUserByEmail as _findUserByEmail,
    updateUserById as _updateUserById 
} from "../model/repository.js";

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
}

// Send OTP to email and save in DB
export async function sendOtp(req, res) {
    const { email } = req.body;
  
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const otp = generateOtp();
      const otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  
      await _updateUserById(user.userId, user.username, mail, hashedPassword, user.isVerified, otp, otpExpiresAt);

      // Send OTP to user's email using your email service (e.g., Nodemailer)
      await sendOtpEmail(email, otp);
  
      return res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
      return res.status(500).json({ message: "Error sending OTP" });
    }
  }

const generateOTPforUser = async (req, res) => {
    const { email } = req.body;

    const user = await _findUserByEmail(email);
    if (!user) {
        throw new Error("User not found.");
    }

    // Check if an existing OTP is still valid
    if (user.otpExpiresAt && Date.now() < user.otpExpiresAt) {
        return {
            message: 'OTP already generated and still valid',
            OTP: user.OTP
        };
    }

    const OTP = generateOtp();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await _updateUserById(user.userId, user.username, mail, hashedPassword, user.isVerified, OTP, otpExpiresAt);

    return OTP;
}

// const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;
// const createTransporter = async () => {
//     try {
//       const oauth2Client = new OAuth2(
//           process.env.CLIENT_ID,
//           process.env.CLIENT_SECRET,
//           "https://developers.google.com/oauthplayground",
//         );
 
//         oauth2Client.setCredentials({
//           refresh_token: process.env.REFRESH_TOKEN,
//         });
 
//         const accessToken = await new Promise((resolve, reject) => {
//           oauth2Client.getAccessToken((err, token) => {
//             if (err) {
//               console.log("*ERR: ", err)
//               reject();
//             }
//             resolve(token); 
//           });
//         });
 
//         const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             type: "OAuth2",
//             user: process.env.USER_EMAIL,
//             accessToken,
//             clientId: process.env.CLIENT_ID,
//             clientSecret: process.env.CLIENT_SECRET,
//             refreshToken: process.env.REFRESH_TOKEN,
//           },
//         });
//         return transporter;
//     } catch (err) {
//       return err
//     }
//   };


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
    //   auth: {
    //     type: 'OAuth2',
    //     user: process.env.EMAIL_USER,
    //     clientId: 'YOUR_CLIENT_ID',
    //     clientSecret: 'YOUR_CLIENT_SECRET',
    //     refreshToken: 'YOUR_REFRESH_TOKEN',
    //     accessToken: accessToken.token,
    //   },
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
    const OTP = generateOTPforUser(email);
    const resetLink = ""// TODO: get reset link

    req.body = {
        email: email,
        title: 'Reset Your Password for PeerPrep',
        html: `
        <!DOCTYPE html>
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
                            .email-header {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .email-header img {
                                width: 50px;
                                height: auto;
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
                            .button {
                                display: inline-block;
                                background-color: #4CAF50;
                                color: white;
                                padding: 15px 25px;
                                text-align: center;
                                text-decoration: none;
                                font-size: 16px;
                                border-radius: 5px;
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
                            <div class="email-header">
                                <img src="https://www.flaticon.com/free-icons/triangle" alt="triangle icons">
                            </div>
                            <div class="email-body">
                                <h1>Hi ${username},</h1>
                                <p>We received a request to reset your password. Enter the following verification code to complete the process:</p>
                                <div class="verification-code">${OTP}</div>
                                <p>Alternatively, you can directly change your password by clicking the button below:</p>
                                <a href="${resetLink}" class="button">Change Password</a>
                            </div>
                            <div class="footer">
                                <p>If you didn't request a password reset, please ignore this email.</p>
                                <p>Best regards, <br> The PeerPrep Team</p>
                            </div>
                        </div>
                    </body>
                    </html>`
    }
    return sendEmail(req, res);
}

export const sendVerificationEmail = async (req, res) => {
    const { username, email, verificationLink } = req.body;
    req.body = {
        email: email,
        title: 'Confirm Your Email Address for PeerPrep',
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
                    background-color: black;
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
                    background-color: #333333;
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
                    <p>Thank you for signing up for <strong>PeerPrep</strong>! To start using your account, please verify your email address by clicking the button below:</p>
                    <a href="${verificationLink}" class="button">Verify Email</a>
                    <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
                    <div class="verification-link">${verificationLink}</div>
                </div>
                <div class="footer">
                    <p>If you didn't sign up for this account, please ignore this email.</p>
                    <p>Best regards, <br> The PeerPrep Team</p>
                </div>
            </div>
        </body>
        </html>`,
    }
    return sendEmail(req, res);
}