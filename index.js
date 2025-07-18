import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.post("/send-email", async (req, res) => {
  const { toEmail, receiverName, senderName, messagePreview } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #e6e6e6; border-radius: 8px;">
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <h2>📩 New Message Notification</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hi ${receiverName},</p>
        <p><strong>${senderName}</strong> sent you a message:</p>
        <blockquote style="background: #f9f9f9; border-left: 4px solid #1fb4df; padding: 10px;">
          <em>${messagePreview}</em>
        </blockquote>
        <p>Please log in to your account to reply.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px;">
        This is an automated message. Do not reply directly.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `💬 New Message from ${senderName}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
