// ─────────────────────────────────────────────────────────────
//  THEEKE FAMILY SITE — Configuration
//  Fill in CLIENT_ID after following SETUP.md instructions.
// ─────────────────────────────────────────────────────────────
const CONFIG = {
  // Google OAuth Client ID (from Google Cloud Console)
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // Your family name shown in the header
  FAMILY_NAME: 'Theeke',

  // Family member names — albums in Google Photos matching these names
  // will appear in the "People" view. Create albums named after each
  // person in Google Photos and they'll auto-appear here.
  PEOPLE: ['David', 'Jake', 'Emma', 'Sophie'],

  // Slideshow delay in milliseconds
  SLIDESHOW_DELAY: 4500,

  // How many recent photos to show on the home feed
  RECENT_COUNT: 60,
};
