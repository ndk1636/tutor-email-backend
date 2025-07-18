// api/send-email.js

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  res.status(200).json({ message: 'API is working!' });
}
