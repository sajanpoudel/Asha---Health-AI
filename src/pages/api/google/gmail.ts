import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { accessToken, query } = req.body;

  if (!accessToken || !query) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
    });

    if (response.data.messages && response.data.messages.length > 0) {
      const messageId = response.data.messages[0].id;
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const body = message.data.payload?.parts?.[0]?.body?.data || '';
      const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
      res.status(200).json({ message: decodedBody });
    } else {
      res.status(404).json({ message: 'No emails found matching your query.' });
    }
  } catch (error) {
    console.error('Error reading email:', error);
    res.status(500).json({ message: 'Failed to read email. Please try again.' });
  }
}