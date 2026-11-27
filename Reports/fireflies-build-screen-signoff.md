# Sign-off: the fireflies build screen behind +

**Verdict: RETURNED (1 fix needed).** Full detail: `updates/2026-11-27 FIREFLIES-BUILD/04-eraser-signoff.md`.

- Build checked: `4c7deb7`. Check: `checks/build-screen-check.cjs` (`5e6f711`).
- Tested in Chrome, in WebKit, and in the installed Mac app opened with Start. The installed app was checked read-only against the real home.
- 75 of 76 checks pass everywhere.

**Step count:** press +, click the middle, choose a folder (3 steps). Or press +, drop a folder (2 steps). Then a ~1.5 s burst ends in first light. There are no names, fields or confirms. That's the target.

**The one fix:** if a save fails right after a drop, the ring stays faster and brighter forever. The cause is one missing line in `firefly-orbit.js` `answer()`. Jony has the task.

**Still to try by hand:** the real Finder panel and a real Finder drag in the installed app.
