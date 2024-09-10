import { NextResponse } from 'next/server';

export const handleAppointmentBooking = async (userMessage: string, accessToken: string): Promise<string> => {
  console.log("Detected appointment booking request");

  const dateTimeMatch = userMessage.match(/(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))/i);
  const dateMatch = userMessage.match(/(tomorrow|today|\d{1,2}\/\d{1,2}\/\d{4})/i) || [null, "tomorrow"];
  const doctorMatch = userMessage.match(/doctor(?:'s name)?\s+(\w+\s*\w*)/i) || [null, ""];

  let time = dateTimeMatch ? dateTimeMatch[1].toLowerCase() : null;
  if (!time) {
    return "I'm sorry, I couldn't understand the time for the appointment. Could you please specify the time clearly, like '5:00 AM' or '2:30 PM'?";
  }

  time = normalizeTime(time);
  const date = getAppointmentDate(dateMatch[1]);
  const [hours, minutes] = parseTime(time);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);

  const doctorName = doctorMatch[1] || "your doctor";
  const dateTime = appointmentDate.toISOString();

  console.log(`Attempting to book appointment for ${dateTime} (${hours}:${minutes.toString().padStart(2, '0')} ${time.includes('pm') ? 'PM' : 'AM'}) with ${doctorName} in time zone ${userTimeZone}`);
  const bookingResponse = await bookAppointment(accessToken, dateTime, userTimeZone);

  const formattedDate = appointmentDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: userTimeZone
  });

  return `[with a smile in my voice] Sweet friend! I've taken care of booking the appointment for you with ${doctorName} for ${formattedDate}. ${bookingResponse}

Now, let me give you a gentle hug virtually and offer my continued support. [affectionately] It takes a lot of courage to prioritize your health, and I'm so proud of you for doing that! Remember, taking care of yourself is an act of self-love and self-care.

Is there anything else you'd like to know about the appointment or any concerns you'd like to discuss?`;
};

export const bookAppointment = async (accessToken: string, dateTime: string, timeZone: string): Promise<string> => {
  try {
    console.log(`Sending request to book appointment for ${dateTime} in time zone ${timeZone}`);
    const response = await fetch('/api/google/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, dateTime, timeZone }),
    });

    if (!response.ok) {
      console.error(`Failed to book appointment: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to book appointment: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Received response from calendar API: ${JSON.stringify(data)}`);
    return data.message;
  } catch (error) {
    console.error('Error booking appointment:', error);
    return 'Failed to book appointment. Please try again.';
  }
};

const normalizeTime = (time: string): string => {
  time = time.replace(/\./g, '').replace(/\s/g, '');
  if (time.match(/^\d{1,2}(?:am|pm)$/i)) {
    time = time.replace(/^(\d{1,2})/, '$1:00');
  }
  return time;
};

const getAppointmentDate = (dateStr: string): Date => {
  return dateStr.toLowerCase() === 'tomorrow' ? 
    new Date(new Date().setDate(new Date().getDate() + 1)) : 
    new Date();
};

const parseTime = (time: string): [number, number] => {
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr) || 0;
  const meridiem = time.includes('pm') ? 'PM' : 'AM';
  
  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return [hours, minutes];
};