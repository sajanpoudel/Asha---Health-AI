// @/utils/apiUtils.ts
import { NextResponse } from 'next/server';

export const bookAppointment = async (accessToken: string, dateTime: string, timeZone: string) => {
  try {
    const response = await fetch('/api/google/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, dateTime, timeZone }),
    });

    if (!response.ok) {
      throw new Error('Failed to book appointment');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const fetchEmails = async (accessToken: string, query: string) => {
  try {
    const response = await fetch('/api/google/gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, query }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};