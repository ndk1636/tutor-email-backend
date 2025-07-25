const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>📨 Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background-color: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 10px;">
        ${message}
      </blockquote>
    </div>
  `;

  const mailOptions = {
    from: `"${name}" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_CONTACT_EMAIL || process.env.GMAIL_USER,
    subject: `📥 Contact Form: ${subject}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, info });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
