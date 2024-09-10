import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  const { accessToken, query } = await request.json();

  if (!accessToken || !query) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    let messages;
    switch (query) {
      case 'unread':
        messages = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });
        break;
      case 'important':
        messages = await gmail.users.messages.list({ userId: 'me', q: 'is:important' });
        break;
      case 'sent':
        messages = await gmail.users.messages.list({ userId: 'me', labelIds: ['SENT'] });
        break;
      case 'draft':
        messages = await gmail.users.messages.list({ userId: 'me', labelIds: ['DRAFT'] });
        break;
      case 'recent':
      default:
        messages = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
        break;
    }

    // Process and format the email data as needed
    const formattedMessages = await Promise.all(messages.data.messages?.map(async (message) => {
      if (!message.id) {
        return null;
      }
      const fullMessage = await gmail.users.messages.get({ userId: 'me', id: message.id });
      
      const headers = fullMessage.data.payload?.headers ?? [];
      return {
        subject: headers.find(header => header.name === 'Subject')?.value ?? 'No Subject',
        from: headers.find(header => header.name === 'From')?.value ?? 'Unknown Sender',
        snippet: fullMessage.data.snippet ?? 'No preview available'
      };
    }).filter((message): message is NonNullable<typeof message> => message !== null) ?? []);

    return NextResponse.json({ 
      message: `Here are your ${query} emails: ${JSON.stringify(formattedMessages)}` 
    });

  } catch (error) {
    console.error('Error reading email:', error);
    return NextResponse.json({ message: 'Failed to read email. Please try again.' }, { status: 500 });
  }
}