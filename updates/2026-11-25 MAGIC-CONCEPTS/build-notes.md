# Build notes — Magic concepts

Open `index.html` by double-click. No install, no server, no network: every page has its CSS, JS and mock data inline.

## The pages

- **index.html** — the three concepts, each with its name and a one-line pitch. Click one to open it.
- **glade-fireflies.html** (Concept A) — agents are fireflies in a night glade. Ready ones glow steady; studying ones pulse slowly.
- **remembering-sea.html** (Concept B) — agents are lights in a calm sea. Files sink in as they are learned.
- **neon-after-rain.html** (Concept C) — agents are neon signs on a wet street. Files travel as sparks along a wire into the sign.

Each page has a small "← All concepts" link back to the index.

## How to click through

The top bar has **Home · Birth · Files · Talk**. Every moment works on its own; you can jump in any order.

1. **Home** — three agents. Tony and Ada are *Ready*; Marcus shows *Studying · 18 of 30*. You can tell them apart at a glance by light alone, and the label says it in plain words.
2. **Birth** — Maya arrives. It takes its time; **Skip** jumps straight to the end. **Sound off/on** toggles the soft sound (off by default).
3. **Files** — Marcus's files: what went in, what is still going, and what failed, readable without watching. Two files fail with a plain reason: a scanned 1998 diary PDF and a voice memo (.m4a). You can drop real files onto the page: they are added to Marcus and stay on this Mac (nothing is uploaded).
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
