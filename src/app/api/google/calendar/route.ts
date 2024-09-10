import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  const { accessToken, dateTime, timeZone } = await request.json();

  if (!accessToken || !dateTime || !timeZone) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });
    const appointmentDate = new Date(dateTime);
    const event = {
      summary: 'Doctor Appointment',
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: timeZone,
      },
    };

    console.log('Event to be created:', JSON.stringify(event, null, 2));

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
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ message: 'Failed to book appointment. Please try again.' }, { status: 500 });
  }
}