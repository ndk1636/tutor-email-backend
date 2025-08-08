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
  <div style="max-width: 640px; margin: auto; font-family: 'Segoe UI', Arial, sans-serif; 
              border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">

    <!-- Elegant Header -->
    <div style="background: linear-gradient(135deg, #1fb4df, #14b8a6, orange);
                padding: 40px 30px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">
        New Message Received
      </h1>
      <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.85;">
        ${timestamp}
      </p>
    </div>

    <!-- Body -->
    <div style="background-color: #ffffff; padding: 30px;">
      <p style="font-size: 16px; margin-bottom: 12px; color: #333;">
        Hi <strong>${receiverName}</strong>,
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 20px;">
        <strong style="color: #14b8a6;">${senderName}</strong> has sent you the following message:
      </p>

      <div style="background: #f9fafb; border-left: 4px solid #14b8a6; padding: 16px 20px; 
                  border-radius: 6px; margin-bottom: 24px;">
        <p style="margin: 0; font-style: italic; color: #444; line-height: 1.6;">
          ${messagePreview}
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${conversationLink}" 
           style="display: inline-block; background: linear-gradient(to right, #1fb4df, #14b8a6, orange); 
                  color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; 
                  font-weight: 600; font-size: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.12);
                  transition: all 0.2s ease-in-out;">
          Reply Now
        </a>
      </div>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background-color: #e5e7eb;"></div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 18px 30px; text-align: center; 
                font-size: 12px; color: #888; line-height: 1.5;">
      This is an automated notification — please do not reply directly.<br>
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
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
