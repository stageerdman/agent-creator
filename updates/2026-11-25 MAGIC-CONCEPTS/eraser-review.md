# Eraser review — MAGIC-CONCEPTS pages (DRAFT, in progress)

*Eraser, 2026-11-25. Checked against `concepts.md`, `moments.md` and `principles/magic-ux/`.*

## Cuts (draft — Glade and Sea read, Neon and index still to finish)

1. **All three · Files count line uses a theme word.** Glade says "18 of 30 in step", Sea says "18 of 30 sunk in", while the rows say "Learned" and Home says "Studying · 18 of 30". That's three words for one state. **Fix:** the count says "18 of 30 learned" on every page; the world stays in the light, not the label.
2. **All three · "Try again" on the scanned PDF fakes success.** `retry()` sets `fail = false`, so the same unreadable scan turns into "Learned" after one click, with nothing changed. That's progress that isn't honest. **Fix:** no Try again for the scan. Give a plain next step in the reason instead ("It's a scan · add a text version"). Keep Try again only where a retry can really work, and make it fail again if the cause hasn't changed.
3. **All three · The Sound switch shows where nothing plays.** It sits in the top bar on Home and Files (and on Talk in Glade and Neon), but only Birth makes sound (plus the Sea's Talk rain bed). That's a dead control. **Fix:** show it only on scenes that can make sound.
4. **Sea · The film grain moves over text, sources and errors.** `.grain` is at z-index 40, so it animates (steps every .54 s) over the shore panel, the "Where from" quote, failed-file reasons and the whole Talk chat. That's magic on sources and errors, and constant motion in Talk. **Fix:** put the grain under the panels (below `.scene`), or leave it still. No grain on any text.
5. **build-notes.md · The Glade Home description is wrong.** It says "Ready ones glow steady; studying ones pulse slowly", but the page shows in step = ready, scattered = still learning. **Fix:** correct that line.

## Kept on purpose (not cuts)

- **Birth: Skip button + click anywhere + any key.** These are three entries to one act, but the visible Skip is the only one people can discover. Click and key are the concept's shortcut. Keep all three.
- **"Talk to Maya" after birth, plus the Talk tab.** The top bar is demo navigation between moments, not app UI. Keep.
