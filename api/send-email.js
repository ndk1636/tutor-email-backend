const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { toEmail, receiverName, senderName, messagePreview } = req.body;

  if (!toEmail || !receiverName || !senderName || !messagePreview) {
    return res.status(400).json({ message: 'Missing fields in request body' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'muhammadnadeem1636@gmail.com',
        pass: 'tzhl bigq opjq ojfm'
      }
    });

    const mailOptions = {
      from: `"${senderName}" <muhammadnadeem1636@gmail.com>`,
      to: toEmail,
      subject: `New message from ${senderName}`,
      html: `<p>Hi ${receiverName},</p><p>${messagePreview}</p><p>Regards,<br>${senderName}</p>`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
