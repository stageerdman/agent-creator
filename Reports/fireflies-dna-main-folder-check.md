# Fireflies DNA: is the main folder's page old? (Jony, 2026-11-26)

**Cause, one line:** the file is not old. `/Users/stage/dev/agent-creator` is on `main`, clean, at 6b6f5a4 (includes 7b2d34e), and `playground/fireflies-dna.html` there is byte-for-byte the 7b2d34e version. What looks "old" is an old tab or cached copy, or the first screen, where the sample agent is lit at once on purpose. The pace only shows after you press Add.

## Facts checked
- `git branch --show-current` → `main`. `git status` → clean.
- `git log -1 -- playground/fireflies-dna.html` → 5f3d08b (the pace code). 7b2d34e only added the check notes and did not touch the page.
- `git diff 7b2d34e -- playground/` → no changes. `git diff main -- playground/fireflies-dna.html` → no changes.
- The page has no local `<script src>`, `<link href>` or imports. Everything is inline, so there is nothing to put a `?v=` cache-buster on, and no stale separate file it could load.

## Fresh-browser check of the exact path
I opened `file:///Users/stage/dev/agent-creator/playground/fireflies-dna.html` in a new browser context (fresh profile, no cache), then added 1 MB, 5 MB and 12 MB files.

| | Chrome | WebKit |
|---|---|---|
| New dots (expected 1+5+12 = 18) | 18 | 18 |
| Lit as blocks, one file at a time | 1 · 5 · 12 | 1 · 5 · 12 |
| Lit 150 ms after the adds | 1 dot | 1 dot |
| Gap between dots in one file | 90 ms | 90 ms |
| Pause between files | 250 ms | 250 ms |
| All lit at once | no | no |

## What changed
Nothing in the code. The page is right and no change is needed. Changing it only to "look new" would add parts for no reason.

## The one line for the user
**Open `playground/fireflies-dna.html` in a new private window (or press ⌘⇧R), then press Add a few times: each file's dots now light up one after another, 1 dot per MB.**

Still open, for Columbo: should the sample dots also land at the new pace when the page opens, so the change shows without pressing Add? This is the main reason the page can still look "old". It is a product choice and outside this fix.
