import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  const { accessToken, query } = await request.json();

  if (!accessToken || !query) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
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
      return NextResponse.json({ message: decodedBody });
    } else {
      return NextResponse.json({ message: 'No emails found matching your query.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error reading email:', error);
    return NextResponse.json({ message: 'Failed to read email. Please try again.' }, { status: 500 });
  }
}