import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import { isValidObjectId } from "mongoose";
import { 
    findUserById as _findUserById,
    updateUserById as _updateUserById 
} from "../model/repository.js";

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email, title, body } = req.body;

    // Check if all required fields are present
    if (!email || !title || !body) {
        return res.status(400).json({ message: 'Missing required fields: email, title, and body are all required.' });
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
      html: body,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    return res.status(200).json({ message: 'Verification email sent successfully!'});
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
};

export const verifyEmail = async (req, res) => {  
  try {
    const userId = req.query.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId); 
    const salt = bcrypt.genSaltSync(10);
    console.log(user.password)
    let hashedPassword = bcrypt.hashSync(user.password, salt);
    
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      const updatedUser = await _updateUserById(userId, user.username, user.email, hashedPassword, true);
      return res.status(200).json({ message: `Found user` });
    }
  } catch (err) {
    console.error('Error verifying user email:', err);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }  
};