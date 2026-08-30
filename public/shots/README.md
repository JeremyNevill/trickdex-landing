# Hero screenshots

`tricks.png`, `bag.png`, `train.png` are the phone screenshots shown in the hero
and feature pillars on the landing page.

> ⚠️ The files currently checked in are **placeholders** (they carry a
> "PLACEHOLDER" watermark). Replace them with real captures from
> **app.wakeboard.com** before going live.

## How to capture

Capture at phone width against the production app so the UI matches what a new
rider sees.

1. Sign in to https://app.wakeboard.com (the Playwright `iPhone 14` profile /
   test rider account has good demo data).
2. In Chrome DevTools device toolbar, choose **iPhone 14 Pro** (390×844) or use
   a real phone.
3. Capture each screen full-bleed (no browser chrome):
   - `tricks.png` — the Tricks list / trick database (search visible)
   - `bag.png`    — My Bag, showing the landed / learning / consistent breakdown
   - `train.png`  — Train, showing plans and a competition run
4. Export as PNG. Recommended source size **780×1608** (2× of 390×804) so they
   stay crisp inside the phone frame.
5. Drop them in this folder with the same filenames — no code changes needed.

The `Phone` component crops with `object-fit: cover` from the top, so a little
extra height at the bottom is fine.
