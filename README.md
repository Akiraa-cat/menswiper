# Minesweeper RnG

Minesweeper with deterministic seeds, daily challenges, player accounts, and a Google Apps Script-backed leaderboard.

## Development

Requires Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, then serve it with `npm run preview`.

## Apps Script Leaderboard

1. Open [script.google.com](https://script.google.com/) and create a standalone Apps Script project.
2. Paste the contents of `google-apps-script/Code.gs` into the script editor.
3. In **Project Settings > Script Properties**, add `API_SHARED_SECRET` with a long random value.
4. Deploy as a **Web app**, execute as yourself, and allow access to anyone. Copy the deployed URL ending in `/exec`.
5. Set these server-only environment variables before starting Nuxt:

```sh
NUXT_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
NUXT_APPS_SCRIPT_SHARED_SECRET=the-same-random-value-as-API_SHARED_SECRET
NUXT_SESSION_SECRET=replace-with-a-random-secret-at-least-32-characters-long
```

The script uses the first worksheet in spreadsheet `1_1Z2_-IvotOsDF1JIs-Zaz2D6vzHl8rIqSFeyQxnfmM`, with columns A-D for index, username, salted PBKDF2-SHA256 password hash, and cumulative score. The first row is the header; account rows start at row 2. The Apps Script runs with the owner's access, so the owner must be able to edit the spreadsheet. New accounts begin at zero points. Each completed win adds its score to the signed-in player's total; losses add nothing. Keep the shared secret and session secret out of source control.
