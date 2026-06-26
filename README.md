# The Association MVP

A starter Next.js site for NBA 2K REC player evaluations.

## What it does

- Landing page
- Player card screenshot upload preview
- Manual stat entry
- Association evaluation card
- Per-game grades
- Advanced Offensive Profile
- Fastbreak Creation Average
- True Contribution v3.1
- Badges, tier, role, and scouting read

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to Vercel and import the repo.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output: default.
6. Deploy.

## Important MVP note

The screenshot upload is a browser preview in this first version. It proves the player can upload the card and see it on the evaluation page, but it does not permanently store the image yet. Add Supabase Storage next when you want saved images and shareable player pages.
