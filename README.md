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

1. Open the Apps Script project connected to your deployed Web App.
2. Replace its code with the contents of `google-apps-script/Code.gs` and save.
3. In **Deploy > Manage deployments**, edit the Web App deployment, select **New version**, then deploy. Keep access set to **Anyone** and execution set to **Me**. The URL may stay the same.
4. Set this server-only environment variable before starting Nuxt or in Vercel Project Settings:

```sh
NUXT_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

The script uses the first worksheet in spreadsheet `1_1Z2_-IvotOsDF1JIs-Zaz2D6vzHl8rIqSFeyQxnfmM`, with columns A-D for index, username, salted PBKDF2-SHA256 password hash, and cumulative score. The first row is the header; account rows start at row 2. The Apps Script runs with the owner's access, so the owner must be able to edit the spreadsheet. New accounts begin at zero points. Each completed win adds its score to the account total; losses add nothing. Login returns a temporary token stored in an HttpOnly cookie and Apps Script CacheService for up to six hours. After two completed guest games, the game offers an optional sign-in prompt. Only `NUXT_APPS_SCRIPT_URL` is required; no shared or session secret is used.
