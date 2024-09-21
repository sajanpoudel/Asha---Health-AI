
export const createOAuth2Client = (accessToken: string) => {
  // This function will now be used only in API routes
  if (typeof window === 'undefined') {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
  } else {
    console.error('This function should only be called from server-side code');
    return null;
  }
};