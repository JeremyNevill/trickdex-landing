# wakeboard.com — Landing Page

Marketing landing page for **www.wakeboard.com** — the top of the funnel for
TrickDex. It lures riders in, then hands off to the app at
**app.wakeboard.com** (every CTA points there).

Built with **Next.js (static export)** — pre-rendered HTML for fast first paint
and SEO, no client-side compilation. Deploys to Vercel as static files.

## Local development

```bash
npm install
npm run dev        # http://localhost:3001
```

## Build

```bash
npm run build      # static export to ./out
npx serve out      # preview the production build
```

## Structure

```
app/
  layout.tsx     # fonts + SEO/OG metadata
  page.tsx       # the landing page (all sections)
  globals.css    # container, nav, marquee animation, responsive rules
components/
  ui.tsx         # buttons, logo, icons, shared tokens (APP_URL, fonts)
  Phone.tsx      # phone frame wrapping a real app screenshot
public/
  shots/         # hero screenshots — SEE shots/README.md (placeholders for now)
  favicon.*, apple-touch-icon.png, og-image.png
design-source/
  original-design-export.html   # the Claude Design export this was ported from
```

## Before going live

- [ ] Replace placeholder hero screenshots in `public/shots/` with real captures
      from app.wakeboard.com (see `public/shots/README.md`).
- [ ] Point the `www.wakeboard.com` domain at this Vercel project.
- [ ] Confirm the brand primary (`--td-primary` in `globals.css`) still matches
      the app's `--primary` in `trickdex-web/src/app/globals.css` (#2563eb).

## Deploy

Zero-config Vercel deploy (framework preset: Next.js). Pushing to `main`
triggers a production build once the Vercel project is wired to this repo.
