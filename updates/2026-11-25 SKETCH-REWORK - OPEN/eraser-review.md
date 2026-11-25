# Eraser review — Sketch rework (Jony's build)

Reviewed against `columbo-report.md`, `merlin-magic.md` and `update-plan.md`.
Diff: `303b88f..5aa61fc` in `src/server/public/`.

**Goal of the flow:** shape an agent (who it is, what it knows) and fix it fast while talking to it.

## Step counts

| Flow | Before rework | Jony's build | After Eraser fixes | Target |
|---|---|---|---|---|
| Edit what the agent does (Persona + Instructions → one box) | 2 fields, 2 decisions | 1 field | 1 | 1 |
| See what the agent knows after Keep | 2 homes (Keep card surface, What it knows tab) | 2 homes (Keep card surface, DNA) | 1 home (DNA) | 1 |
| Talk to the agent from the Keep card | 2 ways (Talk to button, mode switch) | 1 (mode switch) | 1 | 1 |
| Watch study progress | 2 places (top-bar pill, study block) | 1 (study block in DNA) | 1 | 1 |
| Fix an Instructions line from Talk | 2 (Sketcher → Instructions) | 3 (Sketcher → Profile opens → DNA) | 3 | 2 — see O4 |

## Item by item

| # | Item | Mark | Why |
|---|---|---|---|
| 1 | One Instructions box, Persona folded in | Keep | Done. No Persona label on screen, change lines say "instructions". |
| 2 | Talk to button on Keep card | Cut | Gone. Mode switch is the one way. |
| 3 | Top-bar "Studying · about 5 min left" pill | Cut | Gone. Test guards it. |
| 4 | Name field | Merge | Only in Profile now. Exactly one `f-name`. |
| 5 | Profile \| DNA replaces "What it knows" tabs | Keep | Clear split: Profile = who, DNA = what it is made of. |
| 6 | Export counts merged | Keep | One line instead of two. |
| 7 | Keep card "What [Name] knows · only you see this" surface | **Cut — fixed (F1)** | Second home next to DNA. Removed; "Add references" stays when there is nothing yet. |
| 8 | Change line "What X knows: 2 Sharp · 1 Blank ↗" | **Automate wording — fixed (F2)** | Old name and old level words. Now "DNA: 2 Good at · 1 Not trained for ↗", same jump. |
| 9 | Quality summary glow | **Fixed (F3)** | Replayed on every re-render (chip move, toggle). Now glows once per new summary, as Merlin specified. Glow that repeats reads as "something changed" when nothing did. |
| 10 | Talk placeholder "Talk to X…", Home card aria-label | Keep | Allowed by the plan; it's the label, not a second way. |

## Fixed by Eraser (this branch)

- **F1** `block-b.js` `renderKeepExtras`: dropped the `c8Surface` "what it knows" block from the Keep card (and its unused import). `components.js` left alone.
- **F2** `block-e.js:142`: change line now says `DNA: 2 Good at · 1 Not trained for ↗`.
- **F3** `block-c.js` `renderQuality`: `dna-quality-glow` only when the summary text is new for that agent.
- Test added in `sketch.test.mjs` ("Eraser: one home for what it knows…") so these don't come back.

## Still open (for Columbo / Jony — not small, not mine)

- **O1 Palette is a second home.** `block-e` `openPalette` ("Palette · what X is mixed from") and Export "Palette (only you see it)" (`block-f.js:55`) repeat what DNA layers show. Merlin §6 says DNA is the one place. Suggest: fold into DNA or cut. Target: 1 home.
- **O2 Old level words still on screen.** "Sharp/Rough/Blank" in the block-a summary (`level sharp`), `block-d.js:347` "Blank in what X knows", block-b hint "why Rough on pricing?". Profile/DNA say Good at / Medium / Not trained for — two vocabularies for one idea. Columbo decides; pick one.
- **O3** `magic.css:61` comment still says Persona. Comment only, Merlin's file.
- **O4 Fix-from-Talk got one step longer.** Instructions live only in DNA layer 1, but the Sketcher opens on Profile. Suggest: when the user arrives from a Talk fix or a change line, open on DNA (`app.js` `addChangeLine` already clicks `rs-dna` — reuse that). Target: 2 steps.
- **O5** Description is saved in localStorage only (`block-c` `loadProfile`): not exported, lost on another machine. Fine for MVP; note it before Export ships.
- **O6 Three names in one pane.** Mode switch "Sketcher", header "Sketch", tabs "Profile | DNA". The header h2 "Sketch" adds nothing; consider dropping it.

## Checks

- `node --test src/server/public/sketch.test.mjs src/server/public/tab-focus.test.mjs`: 32 pass, 0 fail.
- `npm test`: 106 pass, 0 fail, 1 skipped (live test, on request only).
- `npm run build:app` rebuilt and installed `/Applications/Agent Creator.app`; `node scripts/check-mac-install.mjs` all PASS: Spotlight finds it, no Chrome, 4.6 MB, page and 6 demo agents served, native window on screen. Boots to Home.

## Verdict

**APPROVED with open items.** The Sketch itself is lean: one Instructions box, one way to Talk, one study place, one home for what it knows. O1, O2 and O4 are real double ways / extra steps and should be the next pass; they are outside this item's small-fix lane.

Signed: Eraser (Step Eraser), 2026-11-25 — Sketch rework approved; O1–O6 open for Columbo.

## Integration (Columbo, 2026-11-25)

- **O3 closed:** `magic.css` comment now names Name and Instructions only.
- **O4 closed:** "See the Sketch ↗" and "instructions updated · from your talk ↗" open DNA before pointing at Instructions (`block-d.js` `openDna`). Guard test "O4" in `sketch.test.mjs`. Fix from Talk is back to 2 steps.
- **Still open, next pass:** O1 (Palette as a second home), O2 (Sharp/Rough/Blank vs Good at / Medium / Not trained for — pick Profile's words), O5 (Description in localStorage only), O6 (drop the "Sketch" h2).
- Checks: `npm test` 107 pass, 0 fail, 1 skipped; `npm run build:app` + `check-mac-install.mjs` all PASS.
