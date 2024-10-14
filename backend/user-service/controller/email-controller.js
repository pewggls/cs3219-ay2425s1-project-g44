import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email, link } = req.body;

    // Set up the transporter for nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      service: 'outlook',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email for PeerPrep',
      html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    return res.status(200).json({ message: 'Verification email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
};
