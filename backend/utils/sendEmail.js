import nodemailer from "nodemailer";
import { Resend } from "resend";

import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const { email, subject, message } = options;

  // -----------------------------
  // 1️⃣ Try Gmail SMTP first (MOST COMMON FAILURE POINT)
  // -----------------------------
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_SERVICE_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVICE_USER,
      pass: process.env.EMAIL_SERVICE_PASS,
    },
  });

  const mailOptions = {
    from: `Blog App <${process.env.EMAIL_SERVICE_USER}>`,
    to: email,
    subject,
    html: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent via SMTP:", info.messageId);
    return { success: true, provider: "SMTP", id: info.messageId };
  } catch (smtpError) {
    console.error("❌ SMTP failed:", smtpError.message);
    
    try {
      // Use email or a verified domain email as 'from' for Resend
      const resendTo =
        process.env.NODE_ENV === "production" ? email : process.env.EMAIL_SERVICE_USER;

      const resendResponse = await resend.emails.send({
        from: `Blog App <onboarding@resend.dev>`, 
        to: resendTo,
        subject,
        html: message,
      });

      console.log(
        "✅ Email sent via Resend:",
        resendResponse.id || resendResponse
      );
      return { success: true, provider: "Resend", response: resendResponse };
    } catch (resendError) {
      console.error("🚨 Resend also failed:", resendError.message);
      
      throw new Error(`All email services failed. SMTP: ${smtpError.message}. Resend: ${resendError.message}`);
    }
  }
};

export default sendEmail;