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
  <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Arial, sans-serif; 
              border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">

    <!-- Header with gradient & background image -->
    <div style="background: linear-gradient(to right, rgba(31,180,223,0.95), rgba(20,184,166,0.95), rgba(255,165,0,0.9)),
                url('https://www.transparenttextures.com/patterns/white-diamond.png');
                background-size: cover; background-position: center;
                padding: 28px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 22px; font-weight: 600;">📩 You Have a New Message</h2>
      <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">${timestamp}</p>
    </div>

    <!-- Body -->
    <div style="background-color: white; padding: 24px;">
      <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong>${receiverName}</strong>,</p>
      <p style="font-size: 15px; color: #444; margin-bottom: 16px;">
        <strong style="color: #14b8a6;">${senderName}</strong> has sent you a new message:
      </p>

      <blockquote style="background: #f9fafb; border-left: 4px solid #14b8a6; padding: 14px 18px; 
                         color: #333; font-style: italic; border-radius: 6px; margin: 0 0 20px;">
        ${messagePreview}
      </blockquote>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${conversationLink}" 
           style="display: inline-block; background: linear-gradient(to right, #1fb4df, #14b8a6, orange); 
                  color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; 
                  font-weight: bold; font-size: 15px; box-shadow: 0 3px 6px rgba(0,0,0,0.1);
                  transition: all 0.2s ease-in-out;">
          Reply Now
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f3f4f6; padding: 16px; text-align: center; 
                font-size: 12px; color: #777;">
      This is an automated notification — please do not reply directly.
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
