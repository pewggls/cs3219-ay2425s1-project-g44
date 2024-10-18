import bcrypt from "bcrypt";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email" });
      }

      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong password" });
      }

      const accessToken = jwt.sign({
        id: user.id,
      }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({ message: "User logged in", data: { accessToken, ...formatUserResponse(user) } });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

const generateResetToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

export async function verifOTP (req, res) {  
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Both 'email' and 'otp' are required." });
    }

    const user = await _findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: `User with email '${email}' not found` });
    }

    if (!user.otp) {
      return res.status(403).json({
        message: 'No OTP request found for this user'
      });
    }

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(403).json({
          message: new Date() > user.otpExpiresAt ? 'OTP has expired': 'Incorrect OTP provided' 
        });
    }

    user.resetToken = generateResetToken();
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiration
    await user.save()

    return res.status(200).json({
      message: 'OTP verified successfully',
      data: {
        token: user.resetToken,
      }
    });
  } catch (error) {
    console.error("error: ", error.message)
    return res.status(500).json({ message: "Unknown error when verifying OTP!" });
  }
};

export async function resetPassword(req, res) {
  const { email, token, newPassword } = req.body;
  try {
    const user = await _findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetToken) {
      return res.status(400).json({ message: 'No reset token for this user' });
    }
    
    if (user.resetToken !== token) {
      return res.status(400).json({ message: 'Token not match' });
    }

    if (new Date() > user.resetTokenExpiresAt) {
      return res.status(400).json({ message: 'Expired token' });
    }

    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password matches old password' });
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;
    user.otp = undefined; // Clear otp
    user.otpExpiresAt = undefined;
    user.resetToken = undefined; // Clear reset token
    user.resetTokenExpiresAt = undefined; // Clear token expiration
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};