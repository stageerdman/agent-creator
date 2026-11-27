# Fireflies DNA: fresh-browser sign-off (Eraser, 2026-11-26)

**Verdict: APPROVED.**

Page checked: `file:///Users/stage/dev/agent-creator/playground/fireflies-dna.html` (dev folder on `main` at 6b6f5a4, clean; the page last changed in 5f3d08b). Each browser ran in a new context with no cache, like a private window. Probe: `.tmp-test/fresh-check.cjs` (git-ignored, read-only).

## The three things asked

| Check | Chrome | WebKit |
|---|---|---|
| Real UI: Size slider set to 1.0 MB, 5.1 MB, 12 MB, then Add pressed 3 times fast | dots 1 / 5 / 12, count +18 | dots 1 / 5 / 12, count +18 |
| Lit file by file, in the order added | 1 · 5 · 12 | 1 · 5 · 12 |
| Lit 150 ms after the last click (old way = all of them) | 1 dot | 1 dot |
| Pace | 90 ms per dot, 250 ms between files | same |
| Exact 1 / 5 / 12 MiB files (hook) | 18 dots, lit m1×1, m5×5, m12×12 | same |
| Console | clean | clean |

No old all-at-once glow when files arrive. (The pixel check in 7b2d34e covers the glow itself: old dots never flash together while files land, and there is no haze.)

## No extra controls or second ways (Jony's fix)
Jony's fix changed no code (see `Reports/fireflies-dna-main-folder-check.md`): the page was already right, and what looked "old" was a stale tab. Controls on the page are still name, the remove `x` (one per file), file name, Add, Size, Smallest and Largest. That is the same set approved in 7b2d34e. There is one Add and one remove per file. Nothing was added.

## Step count for "see the new pace": 3
1. Open the page in a fresh window (or press ⌘⇧R): Keep. It is needed to drop the stale copy.
2. Press Add: Keep. This is the action being shown.
3. Watch the dots land: Keep.
Target: 3. It is already there.

## Watch later (not blocking)
- **MB label vs dots.** The Size label counts 1 MB as 1,000,000 bytes, but a dot holds 1,048,576 bytes. At 29 of 81 slider positions the label rounded up doesn't match the dots: "17 MB" gives 16 dots and "5.1 MB" gives 5 dots. For 1, 5 and 12 MB they match. If the user reads it as "1 dot per MB", use one unit for both.
- **The open screen still lights the sample all at once** (the first beat at 400 ms, on purpose). It is the main reason the page can look "old" before you press Add. Columbo already has this as an open product choice.

## The one line for the user
**Open `playground/fireflies-dna.html` in a new private window (or press ⌘⇧R), then press Add a few times: each file's dots light up one after another, 1 dot per MB.**
