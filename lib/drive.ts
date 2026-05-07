import { google } from 'googleapis';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

const drive = google.drive({ version: 'v3', auth });

export async function getSiteMedia(folderId: string) {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    console.warn("GOOGLE_REFRESH_TOKEN missing. Drive integration disabled.");
    return [];
  }
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/'`,
    fields: 'files(id, name, thumbnailLink, webViewLink)',
  });
  return response.data.files || [];
}