import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createOAuth2Client } from '@/utils/googleAuth';

export async function POST(request: Request) {
  try {
    const { accessToken, dateTime, timeZone } = await request.json();
    console.log('Received request:', { 
      accessToken: accessToken ? 'present' : 'missing', 
      dateTime, 
      timeZone,
      accessTokenLength: accessToken ? accessToken.length : 0
    });
    if (!accessToken || !dateTime || !timeZone) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    const oauth2Client = createOAuth2Client(accessToken);
    if (!oauth2Client) {
      return NextResponse.json({ message: 'Failed to create OAuth2 client' }, { status: 500 });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const appointmentDate = new Date(dateTime);
    const event = {
      summary: 'Doctor Appointment',
      description: 'Appointment booked via AI Health Assistant',
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: timeZone,
      },
    };

    console.log('Attempting to create event:', event);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('Event created: %s', response.data.htmlLink);
    const bookedTime = response.data.start?.dateTime
      ? new Date(response.data.start.dateTime).toLocaleString('en-US', {
          timeZone: timeZone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        })
      : 'Unknown time';

    return NextResponse.json({ message: `Appointment booked successfully for ${bookedTime}` });
  } catch (error: unknown) {
    console.error('Error booking appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { message: 'Failed to book appointment. Please try again.', error: errorMessage },
      { status: 500 }
    );
  }
}