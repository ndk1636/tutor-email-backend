const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  // --- CORS Headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { toEmail, receiverName, senderName, messagePreview } = req.body;

  if (!toEmail || !receiverName || !senderName || !messagePreview) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  // --- Gmail SMTP Transporter ---
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // --- HTML Email Template ---
  const htmlContent = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #e6e6e6; border-radius: 8px;">
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <h2>📩 New Message Notification</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hi ${receiverName},</p>
        <p><strong>${senderName}</strong> sent you a message:</p>
        <blockquote style="background: #f9f9f9; border-left: 4px solid #1fb4df; padding: 10px; color: #333;">
          <em>${messagePreview}</em>
        </blockquote>
        <p>Please log in to your account to reply.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        This is an automated message. Do not reply directly.
      </div>
    </div>
  `;

  // --- Email Options ---
  const mailOptions = {
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `💬 New Message from ${senderName}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
