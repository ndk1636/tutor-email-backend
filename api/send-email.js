const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  // --- CORS Headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const {
    toEmail,
    receiverName,
    senderName,
    messagePreview,
    conversationLink, // new field for reply button
  } = req.body;

  if (
    !toEmail ||
    !receiverName ||
    !senderName ||
    !messagePreview ||
    !conversationLink
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields.",
    });
  }

  // Get current timestamp in readable format
  const timestamp = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

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
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
      <!-- Header with gradient -->
      <div style="background: linear-gradient(to right, #1fb4df, #14b8a6, orange); padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">📩 New Message Notification</h2>
        <p style="margin: 5px 0 0; font-size: 12px;">${timestamp}</p>
      </div>

      <!-- Body -->
      <div style="padding: 20px;">
        <p>Hi ${receiverName},</p>
        <p><strong>${senderName}</strong> sent you a message:</p>
        <blockquote style="background: #f9f9f9; border-left: 4px solid #14b8a6; padding: 10px; color: #333; font-style: italic;">
          ${messagePreview}
        </blockquote>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${conversationLink}" 
            style="display: inline-block; background: linear-gradient(to right, #1fb4df, #14b8a6, orange); 
                   color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold;">
            Reply Now
          </a>
        </div>
      </div>

      <!-- Footer -->
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
