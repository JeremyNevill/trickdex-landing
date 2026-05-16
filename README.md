# wakeboard.com — Landing Page

Static landing page for **wakeboard.com**, the trick log built for the dock.

A single self-contained `index.html` — no build step, no dependencies, no
framework runtime to install. Deploys as-is to any static host.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy to Vercel

This is a zero-config static deploy.

### From the Vercel dashboard
1. Push this repo to GitHub (see below).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
3. Pick the repo. Leave **Framework Preset** as *Other* and all build settings empty.
4. **Deploy.**

### From the CLI
```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## Files

```
deploy/
├── index.html   # the landing page — fully self-contained
├── README.md    # this file
└── .gitignore
```
