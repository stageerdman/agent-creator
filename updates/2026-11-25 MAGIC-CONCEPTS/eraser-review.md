# Eraser review — MAGIC-CONCEPTS pages

*Eraser, 2026-11-25. Checked `index.html`, `glade-fireflies.html`, `remembering-sea.html` and `neon-after-rain.html` against `concepts.md`, `moments.md` and `principles/magic-ux/`.*

**Goal I checked against:** the user picks an agent and talks to them, or gives them files and can see, honestly and at a glance, what was learned.

**First verdict: RETURNED** (now APPROVED, see the re-check below). **There were 5 small cuts, all for Jony.** The flows are already lean. Home → Talk is one click on every page, Birth can be skipped, and Talk never waits on the magic. The cuts are about labels, honesty and dead controls, not extra steps.

## Cuts

1. **All three · The Files count line uses a theme word.** Glade says "18 of 30 in step", Sea says "18 of 30 sunk in" and Neon says "18 of 30 lit". Meanwhile the rows say "Learned" and Home says "Studying · 18 of 30". That's three words for one state. **Fix:** make the count say "18 of 30 learned" on every page. The world can carry the theme in its light, but the label stays plain.
2. **All three · "Try again" on the scanned PDF fakes success.** The shared `retry()` sets `fail = false`, so one click turns the same unreadable scan into "Learned" when nothing has changed. That's progress that isn't honest. **Fix:** remove Try again for the scan and put a plain next step in the reason instead ("It's a scan · add a text version"). Keep Try again only where a retry can really work, and if the cause hasn't changed, the retry has to fail again.
3. **All three · The Sound switch shows where nothing plays.** It sits in the top bar on every scene, but sound only plays on Birth (all pages) and on Talk (Sea and Neon). It's a dead control on Home and Files everywhere, and on Glade's Talk too. **Fix:** show the switch only on scenes that can make sound.
4. **Sea · The film grain moves over text, sources and errors.** `.grain` is at z-index 40, so it animates (it steps every .54 s) over the shore panel, the "Where from" quote, the failed-file reasons and the whole Talk chat. That puts magic on sources and errors, plus constant motion in Talk. **Fix:** put the grain under the panels (below `.scene`) or keep it still. No grain on any text.
5. **build-notes.md · The Glade Home description is wrong.** It says "Ready ones glow steady; studying ones pulse slowly", but the page shows in step = ready and scattered = still learning. **Fix:** correct that line.

## Re-check (Eraser, after Jony's rework — commits ef4d09b + 34c4c19)

I checked each of the 5 cuts in the code:
1. **Count:** `${c.learned} of ${c.total} learned` on all three pages. Done.
2. **Scan:** it reads "It’s a scan · add a text version". `retry()`, the Try again button, the retry field and `world.fileRetry` are gone from all three pages (a search for "retry" finds nothing), and nothing sets `fail` back to false. Failed rows show only their reason. That's one dead control fewer than asked for. Done.
3. **Sound:** it's hidden off Birth on Glade, and off Birth and Talk on Sea and Neon. `body.dataset.scene` is set in `go()`, which every scene change and the first load go through. Its space is kept, so the bar doesn't shift. Done.
4. **Sea grain:** grain is at z 1, scenes at 2, Birth at 5 and the bar at 10. Grain only falls on the sea canvas, never on text, sources or errors. Done.
5. **build-notes.md:** the Glade line now reads "Ready ones fly in step; ones still learning are scattered." Done.

The inline scripts parse on all three pages. No new steps, controls or labels were added. The common path is still **3 steps** (target 3).

**Watch later:** if a file can ever really be retried (for example, after a text version is added), offer the retry on the new file and not as a button on the old row.

**Signed: APPROVED.** Eraser, 2026-11-25.

## Checked and clean

- **index.html:** three links, each with a name and pitch. Nothing to cut.
- **Neon:** the rain on the glass sits under the panels (z-index 1 vs 2), so no text gets rained on. The street only slows once the first words appear, so Talk never waits on it. The neon lights the sign, not the sources, quotes or errors. Failed files get a cracked tube plus a plain reason.
- **Talk on all three:** the answer comes first and the effect follows it. The "Where from" panel is matte and plain.

## Kept on purpose (not cuts)

- **Birth: the Skip button, click anywhere and any key.** These are three ways into one act, but the visible Skip is the only one people can discover; click and key are the concept's shortcut. Keep all three.
- **"Talk to Maya" after birth, plus the Talk tab.** The top bar is demo navigation between moments, not app UI. Keep.
- **Home says "Studying", the rows say "Learned".** "Studying" is the agent's state and "Learned" is the file's state. They're plain words for two different things, so this isn't a double label.

**Step count (common path, Home → answer):** 1 click on the agent, 1 typed question, 1 send = **3**. The target is 3, so it's already met.
