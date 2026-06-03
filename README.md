# Reusable Team Roster / Questionnaire Site

A small Nuxt 3 site for displaying a private team roster powered by Google Forms / Google Sheets.

This project is reusable for any team or event where members fill out a questionnaire and teammates need a password-protected site to view the responses.

## What this site does

- Shows a password popup on first visit.
- Checks the password server-side from environment variables.
- Sets an HTTP-only cookie after login.
- Displays a roster grid from Google Sheets.
- Uses local profile photos from the `public/members` folder.
- Displays each member’s questionnaire responses on a profile page.
- Includes a local JSON-powered info section for schedule/location details.
- Deploys to Netlify using Nuxt 3 + Nitro server routes.

## Tech stack

- Nuxt 3
- Vue 3
- Tailwind CSS
- Google Forms
- Google Sheets
- Google Apps Script JSON endpoint
- Netlify

## Required Node version

Use Node 18.

```bash
nvm install 18
nvm use 18
node -v
```

Add this to `.nvmrc`:

```txt
18
```

## Local setup

```bash
git clone <repo-url>
cd <project-folder>
npm install
cp .env.example .env
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Environment variables

Create `.env`:

```bash
TEAM_PASSWORD="your-team-password"
GOOGLE_SHEETS_ENDPOINT="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
GOOGLE_SHEETS_TOKEN=""
```

Required:

```txt
TEAM_PASSWORD
GOOGLE_SHEETS_ENDPOINT
```

Optional:

```txt
GOOGLE_SHEETS_TOKEN
```

## Google Sheet setup

The response sheet should include your normal form fields plus these two extra columns:

```txt
member_id
photo_url
```

### member_id

A stable slug used for profile URLs.

Examples:

```txt
john-smith
jane-smith
james-smith
```

Rules:

- lowercase
- hyphenated
- no spaces
- no special characters
- do not change once published

### photo_url

The local path to the member photo.

Examples:

```txt
/members/john-smith.jpg
/members/jane-smith.jpg
/members/default.svg
```

## Google Apps Script setup

The site does not read the normal Google Sheet URL directly. You need an Apps Script JSON endpoint.

In your Google Sheet:

```txt
Extensions → Apps Script
```

Paste:

```js
function doGet() {
  const sheetName = "Form Responses 1"; // must match the tab name at the bottom of the sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: "Sheet not found",
        availableSheets: ss.getSheets().map(s => s.getName()),
        expected: sheetName
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(h => String(h).trim());

  const rows = values
    .filter(r => r.some(cell => String(cell).trim() !== ""))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = r[i];
      });
      return obj;
    });

  return ContentService
    .createTextOutput(JSON.stringify({ rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy it:

```txt
Deploy → New deployment → Web app
```

Settings:

```txt
Execute as: Me
Who has access: Anyone
```

Copy the Web App URL. It should look like:

```txt
https://script.google.com/macros/s/XXXXX/exec
```

Use that as:

```bash
GOOGLE_SHEETS_ENDPOINT="https://script.google.com/macros/s/XXXXX/exec"
```

Do not use the regular Google Sheet URL.

Wrong:

```txt
https://docs.google.com/spreadsheets/d/...
```

Correct:

```txt
https://script.google.com/macros/s/XXXXX/exec
```

## Local photos

Put profile pictures here:

```txt
public/members/
```

Example:

```txt
public/members/john-smith.jpg
public/members/jane-smith.jpg
public/members/default.svg
```

The public URL will be:

```txt
/members/john-smith.jpg
```

Use that path in the sheet `photo_url` column.

## Downloading Facebook images with wget

Open the image on Facebook.

Right-click the image and choose:

```txt
Open image in new tab
```

Copy the direct image URL. It should usually contain:

```txt
fbcdn.net
```

Download it:

```bash
wget -O john-smith.jpg "https://scontent.xx.fbcdn.net/..."
```

Move it into the public members folder:

```bash
mkdir -p public/members
mv john-smith.jpg public/members/
```

Verify it loads locally:

```txt
http://localhost:3000/members/john-smith.jpg
```

Then add this to Google Sheets:

```txt
/members/john-smith.jpg
```

## Local event / tournament info

Static event information lives in:

```txt
assets/data/team-info.json
```

Example:

```json
{
  "highlightsTitle": "Today",
  "highlights": [
    {
      "label": "Uniform pickup",
      "value": "Cactus Yards Tent 2 @ 7AM"
    },
    {
      "label": "Play-In Game",
      "value": "Cactus Yards Dbacks field vs Team 188 @ 8AM"
    },
    {
      "label": "Group picture",
      "value": "WORLD RECORD @ 6:30PM"
    },
    {
      "label": "Bracket starts",
      "value": "7:40PM (72 teams will play)"
    }
  ],
  "whereWePlayTitle": "Where we play",
  "complexes": [
    {
      "title": "Cactus Yards",
      "address": "4536 E Elliot Rd, Gilbert, AZ 85234",
      "image": "/complexes/cactus-yards.jpg",
      "mapUrl": "https://maps.google.com/?q=4536%20E%20Elliot%20Rd%2C%20Gilbert%2C%20AZ%2085234"
    },
    {
      "title": "Freestone Complex",
      "address": "1045 E Juniper Ave, Gilbert, AZ 85234",
      "image": "/complexes/freestone-complex.jpg",
      "mapUrl": "https://maps.google.com/?q=1045%20E%20Juniper%20Ave%2C%20Gilbert%2C%20AZ%2085234"
    }
  ]
}
```

Import it in Vue:

```ts
import info from '~/assets/data/team-info.json'
```

Do not use:

```ts
import info from '~/data/team-info.json'
```

That alias does not exist by default in Nuxt.

## Complex images

Put complex images here:

```txt
public/complexes/
```

Example:

```txt
public/complexes/cactus-yards.jpg
public/complexes/freestone-complex.jpg
```

Reference them in `team-info.json`:

```json
"image": "/complexes/cactus-yards.jpg"
```

## Important Nuxt paths

Use `assets/` when importing files into Vue or TypeScript:

```txt
assets/data/team-info.json
```

Use `public/` for files served directly by URL:

```txt
public/members/john-smith.jpg
public/complexes/cactus-yards.jpg
```

Public URLs:

```txt
/members/john-smith.jpg
/complexes/cactus-yards.jpg
```

## Netlify deployment

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[functions]
  node_bundler = "esbuild"

[build.environment]
  NODE_VERSION = "18"
```

### nuxt.config.ts

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    teamPassword: process.env.TEAM_PASSWORD,
    sheets: {
      endpoint: process.env.GOOGLE_SHEETS_ENDPOINT,
      token: process.env.GOOGLE_SHEETS_TOKEN,
    },
    public: {},
  },

  nitro: {
    preset: 'netlify',
  },

  compatibilityDate: '2024-11-01',
})
```

### Netlify build settings

```txt
Build command: npm run build
Publish directory: .output/public
Base directory: /
Functions directory: leave blank unless you know exactly why you need it
```

### Netlify environment variables

Add:

```txt
TEAM_PASSWORD
GOOGLE_SHEETS_ENDPOINT
NODE_VERSION = 18
```

Optional:

```txt
GOOGLE_SHEETS_TOKEN
```

## GitHub setup

Create a private GitHub repo.

Recommended `.gitignore`:

```gitignore
node_modules/
.nuxt/
.output/
dist/
.netlify/

.env
.env.*
!.env.example

.DS_Store
Thumbs.db
*.log
.cache/
.tmp/
.vite/
.vscode/
.idea/
coverage/
```

Commit:

```bash
git init
git add .
git commit -m "Initial reusable roster site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Connect the GitHub repo to Netlify.

## Local build check before deploy

Before pushing to Netlify, run:

```bash
rm -rf .nuxt .output
npm run build
```

Confirm this folder exists:

```bash
ls -la .output/public
```

If `.output/public` does not exist, the Nuxt build failed. Fix the actual build error before deploying.

## Common issues

### Roster grid is empty

Open:

```txt
http://localhost:3000/api/members
```

It should return JSON:

```json
{
  "rows": []
}
```

or actual rows.

If it shows Google Sheets HTML, `GOOGLE_SHEETS_ENDPOINT` is wrong. Use the Apps Script URL, not the Google Sheet URL.

### Apps Script error: Cannot read properties of null reading getDataRange

The sheet tab name is wrong. Use the exact tab name shown at the bottom of Google Sheets, usually:

```txt
Form Responses 1
```

### Images do not load

Check the file exists:

```txt
public/members/john-smith.jpg
```

Check the sheet value:

```txt
/members/john-smith.jpg
```

Open directly:

```txt
http://localhost:3000/members/john-smith.jpg
```

### Tailwind is not working

Install the Nuxt Tailwind module:

```bash
npm i -D @nuxtjs/tailwindcss
```

Add this to `nuxt.config.ts`:

```ts
modules: ['@nuxtjs/tailwindcss']
```

Make sure `assets/css/main.css` contains:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Restart:

```bash
npm run dev
```

### Netlify says .output/public does not exist

The Nuxt build failed before creating the output.

Run locally:

```bash
npm run build
```

Fix the real build error.

Common causes:

- bad JSON import path
- missing file
- TypeScript error
- typo in `netlify.toml`
- wrong Node version

## Making this reusable for another team

To reuse this project:

1. Duplicate the repo.
2. Create a new Google Form.
3. Link it to a new Google Sheet.
4. Add `member_id` and `photo_url` columns.
5. Create a new Apps Script Web App endpoint.
6. Update `GOOGLE_SHEETS_ENDPOINT`.
7. Update `TEAM_PASSWORD`.
8. Replace files in `public/members`.
9. Replace files in `public/complexes`.
10. Update `assets/data/team-info.json`.
11. Deploy to Netlify.

## Recommended reusable naming convention

### Member IDs

```txt
first-last
nickname-last
coach-name
```

### Image filenames

```txt
public/members/member-id.jpg
```

### Sheet photo URLs

```txt
/members/member-id.jpg
```

### Profile URLs

```txt
/members/member-id
```

## Project structure

```txt
.
├── assets/
│   ├── css/
│   │   └── main.css
│   └── data/
│       └── team-info.json
├── components/
│   └── PasswordGate.vue
├── layouts/
│   └── default.vue
├── middleware/
│   └── auth.global.ts
├── pages/
│   ├── index.vue
│   └── members/
│       └── [id].vue
├── public/
│   ├── complexes/
│   │   ├── cactus-yards.jpg
│   │   └── freestone-complex.jpg
│   └── members/
│       ├── default.svg
│       └── member-id.jpg
├── server/
│   └── api/
│       ├── auth/
│       │   ├── login.post.ts
│       │   ├── logout.post.ts
│       │   └── me.get.ts
│       └── members.get.ts
├── .env.example
├── .gitignore
├── netlify.toml
├── nuxt.config.ts
├── package.json
└── README.md
```

## Final checklist

Before deploy:

- [ ] `npm run build` works locally
- [ ] `.output/public` exists locally after build
- [ ] `.env` has `TEAM_PASSWORD`
- [ ] `.env` has Apps Script `GOOGLE_SHEETS_ENDPOINT`
- [ ] `/api/members` returns JSON
- [ ] Sheet has `member_id`
- [ ] Sheet has `photo_url`
- [ ] Images load from `/members/...`
- [ ] `team-info.json` imports from `~/assets/data/team-info.json`
- [ ] Netlify env vars are set
- [ ] Netlify publish directory is `.output/public`
