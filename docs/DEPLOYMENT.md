# Deployment checklist

## Fastest live version

1. Install Node.js.
2. In this folder, run:

```bash
npm install
npm run dev
```

3. Test the form locally.
4. Create a GitHub repo.
5. Push the code.
6. Import the repo into Vercel.
7. Deploy.

## What this MVP supports tonight

- Any player can open the live site.
- They can upload a screenshot preview.
- They can enter their stat totals.
- The site generates their Association card in the current format.

## What comes next

- Supabase database for saved submissions.
- Supabase Storage for saved screenshots.
- Shareable `/player/[id]` pages.
- Admin dashboard.
- OCR/AI stat extraction from card screenshots.
