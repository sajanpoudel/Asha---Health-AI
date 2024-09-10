import { google } from 'googleapis';

export const createOAuth2Client = (accessToken: string) => {
  const client = new google.auth.OAuth2();
  client.setCredentials({ access_token: accessToken });
  return client;
};