import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { accessToken, dateTime } = req.body;

  if (!accessToken || !dateTime) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });
    const event = {
      summary: 'Doctor Appointment',
      start: {
        dateTime: dateTime,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(new Date(dateTime).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    res.status(200).json({ message: `Appointment booked successfully for ${dateTime}` });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Failed to book appointment. Please try again.' });
  }
}