# Theeke Family Site — Google Photos Setup

One-time setup to connect your Google Photos. Takes about 10 minutes.

---

## Step 1 — Create a Google Cloud Project

1. Go to **https://console.cloud.google.com**
2. Click **"New Project"** → name it `Theeke Family Site` → Create
3. Make sure the new project is selected in the top dropdown

---

## Step 2 — Enable the Photos Library API

1. In the left menu, go to **APIs & Services → Library**
2. Search for **"Photos Library API"**
3. Click it and hit **Enable**

---

## Step 3 — Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials" → OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User type: **External** (or Internal if you have Google Workspace)
   - App name: `Theeke Family`
   - Add your email as a test user
4. Back in Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Theeke Family`
   - Under **Authorized JavaScript origins**, add:
     - `https://dtheeke1.github.io` (or whatever domain this lives on)
     - `http://localhost` (for local testing)
5. Click **Create**
6. Copy the **Client ID** — it ends in `.apps.googleusercontent.com`

---

## Step 4 — Paste Your Client ID

Open **`family/js/config.js`** and replace:

```js
CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```

with your actual Client ID:

```js
CLIENT_ID: '123456789-abcdefg.apps.googleusercontent.com',
```

---

## Step 5 — Add Your Family Members

In `config.js`, update the PEOPLE list with your kids' names:

```js
PEOPLE: ['David', 'Jake', 'Emma'],
```

Then in **Google Photos**, create albums named exactly after each person.
Those albums will appear in the **People** section automatically.

---

## Step 6 — Your Two Family Albums

Your shared albums are already saved in the site:
```
https://photos.app.goo.gl/d4CFPEyxfiex2mRx6
https://photos.app.goo.gl/ktXZKcBKdxW338dKA
```

**If you're the owner of these albums:** They will appear automatically in the Events
page as soon as you sign in with your Google account. No extra steps needed.

**If the albums don't appear automatically:**
1. Click one of the short links above in your browser
2. It will open the album in Google Photos
3. Copy the full URL from your address bar — it will look like:
   `https://photos.google.com/share/AF1Qip.../...?key=ABCDEF...`
4. On the family site home page, paste that full URL into the "Join Album" box
5. Click Join — the album is now linked and appears in Events

---

## How It Works

- **No uploading** — photos come directly from your Google Photos library
- **Auto-synced** — add a photo to Google Photos on your phone, it appears here
- **Events** — every Google Photos album shows up as an event
- **People** — albums you name after family members appear in the People section
- **Slideshow** — plays any album or all recent photos with Ken Burns effect
- **Collages** — auto-generates from any album, 6 layout styles, regenerate button

---

## People View — Quick Setup

Google Photos doesn't expose its face-recognition "people" feature through its API.
The workaround (which works great):

1. In Google Photos, create an album called **"Jake"** (or whatever names you use)
2. Add photos of Jake to it
3. They appear in the People section on this site automatically
4. You can keep adding photos to those albums any time from your phone
