# Farm 2 Families Giving Gallop — website

Static site: no build step, no framework. Four pages, one stylesheet, one script.

```
index.html      Home
signup.html     Sign-up form (posts to Google Sheets)
course.html     Course info
faq.html        FAQs
css/style.css
js/main.js      Nav, course toggle, form handling. Set SHEET_ENDPOINT here.
img/            Logo and photos
google-sheet-script.gs   Apps Script for the Google Sheet (not deployed with the site)
```

## 1. Put the site on GitHub

1. Go to github.com and sign in (create a free account if needed).
2. New repository → name it `farm2families` → Public → Create.
3. On the empty repo page click **uploading an existing file**, then drag the whole contents of this folder in (the html files, `css`, `js`, `img`, `README.md`). Commit.

## 2. Deploy on Vercel

1. In Vercel: **Add New… → Project → Import** the `farm2families` repo.
2. Framework preset: **Other**. Leave build command and output directory blank. Deploy.
3. You'll get a `something.vercel.app` URL. Open it and click around.

Every time you change a file on GitHub, Vercel redeploys automatically.

## 3. Hook up the sign-up form

1. Create a Google Sheet named **Gallop 2026 Sign-ups**.
2. **Extensions → Apps Script**. Delete the sample code and paste in `google-sheet-script.gs`. Save.
3. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and authorize when asked.
4. Copy the **Web app URL** (ends in `/exec`).
5. Open `js/main.js` on GitHub, click the pencil to edit, and replace `PASTE_YOUR_APPS_SCRIPT_URL_HERE` with that URL. Commit.
6. Submit a test sign-up on your live site. A row should appear in the sheet within a few seconds.

If you ever change the script, you must create a **new deployment** (Manage deployments → edit → New version) for changes to take effect.

## 4. Point farm2families.com at Vercel

1. In Vercel: your project → **Settings → Domains** → add `farm2families.com` and `www.farm2families.com`.
2. Vercel shows the DNS records to add. Log in wherever the domain is registered and add them:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`
3. Wait for Vercel to show a green check (minutes to a day).

## 5. Fill in the placeholders

Search the HTML files for `[` and replace:

- `https://www.childrenshospital.org/` → your Miles for Miracles donation page (appears in all four pages)
- `[2026 GOAL]`, `[$ RAISED]`, `[# CARDS]`, `[# YEARS]` in `index.html`
- `[EMAIL]` in every footer and `faq.html`
- `[FULL WAIVER TEXT]` in `signup.html`
- The `[MAP: …]` boxes in `course.html` → drop route images into `img/` and replace each box with `<img src="img/your-map.png" alt="…">`

## Editing later

Everything is plain HTML, so editing text on GitHub (pencil icon → edit → commit) is enough. Vercel redeploys in about a minute.
