# Build notes — Magic concepts

Open `index.html` by double-click. No install, no server, no network: every page has its CSS, JS and mock data inline.

## The pages

- **index.html** — the three concepts, each with its name and a one-line pitch. Click one to open it.
- **glade-fireflies.html** (Concept A) — agents are fireflies in a night glade. Ready ones fly in step; ones still learning are scattered.
- **remembering-sea.html** (Concept B) — agents are lights in a calm sea. Files sink in as they are learned.
- **neon-after-rain.html** (Concept C) — agents are neon signs on a wet street. Files travel as sparks along a wire into the sign.

Each page has a small "← All concepts" link back to the index.

## How to click through

The top bar has **Home · Birth · Files · Talk**. Every moment works on its own; you can jump in any order.

1. **Home** — three agents. Tony and Ada are *Ready*; Marcus shows *Studying · 18 of 30*. You can tell them apart at a glance by light alone, and the label says it in plain words.
2. **Birth** — Maya arrives. It takes its time; **Skip** jumps straight to the end. **Sound off/on** toggles the soft sound (off by default).
3. **Files** — Marcus's files: what went in, what is still going, and what failed, readable without watching. Two files fail with a plain reason and next step: a scanned 1998 diary PDF ("It's a scan · add a text version") and a voice memo (.m4a). Neither offers Try again, since retrying the same file can't change the result. The count reads "18 of 30 learned" on every page. The Sound switch shows only where sound plays: Birth on all pages, plus Talk on Sea and Neon. You can drop real files onto the page: they are added to Marcus and stay on this Mac (nothing is uploaded).
4. **Talk** — a question is already filled in; press **Send**. The first words appear at once. The answer shows a plain **Where from** source with a quote. The second prefilled question shows an honest "Not in Marcus's references" reply. Sources, quotes and errors get no magic.

## Mock data

- Tony — ready. Marcus — studying, 18 of 30 files, 2 failing. Ada — ready. Maya — born in Birth.
- Neon colours: Tony jade, Marcus blue, Ada red, Maya amber.

## Browsers checked

Checked with Playwright in **Chromium** (Chrome's engine) and **WebKit** (Safari's engine) — not the installed Chrome and Safari apps. All four pages, in normal and in reduced motion:

- zero console errors, warnings or page errors;
- about 60 fps on Home on all three concepts;
- each concept page links back to the index; the index links all three.

With reduced motion, birth completes at once (so Skip is hidden).

## Fixed during the check

- Neon: the spark wire ran across the file list; it now routes around it.
- Neon: removed the dark "crowd" shapes on the street — they read as clutter.

## Choices made

- State label is "Studying · n of m" (the concept said "Learning"): plainer and closer to what is happening.
- Neon has no day version; the concept lives at night.
- Index fireflies blink on their own; a synced blink looked like a jump, so it was dropped.

## Restore: Fireflies home is Start again (2026-11-26, Jony)

Glade Home v2 is no longer the direction. Start now opens this page, unchanged.

- **Source commit:** `c83a7b3^` (= `ecdafbe`, the last change to this file: Eraser's MAGIC-CONCEPTS cuts d037be7 + the ecdafbe re-check). `concepts.md` (Concept A, Glade fireflies, Home moment) describes the same page, so no other commit is a candidate.
- **`glade-fireflies.html` here:** never changed after the source commit. `git diff c83a7b3^ -- "updates/2026-11-25 MAGIC-CONCEPTS/glade-fireflies.html"` is empty.
- **Restored file:** `src/server/public/glade-fireflies.html`, a byte-for-byte copy, so the built Mac app bundles it (the app only ships `src/`). `git diff --no-index` against the source shows nothing. It is self-contained (inline CSS, JS and mock data, no shared core, no assets), so it needs no other files. I made no path fixes.
- **The one line repointed:** `src/server/app.mjs`, `"GET /": staticFile("index.html", …)` → `"GET /": staticFile("glade-fireflies.html", …)`. Start opens the Tauri app, which opens the server's `/`, so `/` now serves Fireflies. The page opens on Home (no hash → `home`).
- **Glade Home v2:** Start never linked to it. `updates/2026-11-26 GLADE-HOME-V2/` and `GLADE-HOME-CONCEPTS/` stay untouched. No app code points at them.
- **Known, left as before:** the page's "← All concepts" link goes to `index.html`, which the app doesn't serve, so it 404s inside the app. Fixing it would change the file. The old app screen (`public/index.html`) is still in the repo but Start no longer shows it.
- **Checked:** `npm test` passes (121 pass, 1 live skip). The server on PORT 3505 serves `/` identical to the source file (40418 chars).
