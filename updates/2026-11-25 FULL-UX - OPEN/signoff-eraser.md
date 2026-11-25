# FULL-UX sign-off (Eraser)

Walked on 25 Nov 2026 against `walkthrough-columbo.md` (§0–§16) and `cuts-eraser.md` (X1–X35).

How each line was checked:
- **live**: clicked in the running app (`.scratch/walk-eraser.mjs`, 31 checks, all pass, plus manual clicks).
- **script**: `scripts/walk-full-ux.mjs` step passes (25 of 30 steps pass. The 5 that fail look for wording I changed on purpose; see "For Columbo" at the end).
- **code**: read in the block source, not clicked.

✓ = as the checklist says. **Fix** = I changed it during this walk (commits e6d3ae2, 25adb79). **Gap** / **Deviation** = recorded, not changed.

## 0. Before you start
- ✓ `npm run build:app` finishes; `dist/Agent Creator.app` exists.
- **Gap (open, waiting on user check, Pixel asked)**: the window launch. The rebuilt bundle's own server (`Contents/Resources/app`) starts and serves the app, and the Home walk passes with no page errors. **Not checked:** the Chrome `--app` window itself. My shell refuses `open`, so someone with Start or Finder should double-click it once.
- ✓ The top bar shows `Agent Creator` as plain text on Home, with the `Demo` pill on the far right (live).
- ✓ `Show mock values` outlines the mock-fed elements and removes the outlines when turned off (live).
- ✓ No "Settings", "Library", "Insight" or "Know" tab, mode or menu item (live).

## UJ1 · First run
- **Gap**: 0 agents → A2. `boot()` has the rule, but the demo always seeds 6 agents, so it can't be reached in the build. Recorded, no UI added (§16).
- **Gap**: 1 agent → straight into it. Same reason as above. The rule is in `boot()`.
- ✓ `+ New agent` and ⌘⇧N both open A2 (live).
- ✓ The A2 line and the three P2 chips (live).
- **Fix**: the door words now read `Or bring their references` / `Drop a folder or files here, or paste a path` / `Your files stay on this Mac · Claude reads them to study`.
- **Fix**: the composer is now focused on A2. There is no ＋ while the door shows (X7).
- ✓ A2's top bar shows only `Agent Creator`: no mode switch, no agent button (live).
- ✓ Offline: the C11 banner shows, Send is disabled, typing still works (P2 banner, code + live).
- ✓ Offline: the door still lays out. `Start studying` waits with `Claude isn't reachable · Check again` (code).
- ✓ Home shows no offline banner.
- **Fix**: on drag-over, the door's border turns solid accent (`body.dragging`). The C15 overlay text has no context line on A2.
- ✓ After the first message, the door and chips go and ＋ `Add references` appears, with no motion.
- ✓ A path-only message is treated as references (script: B1 path rule).

## UJ2 · Make from material (Ines)
- ✓ References chip `Ines Duarte – The Quiet Deal` / `312 files · 38.4 GB ▸` (live, uj2).
- ✓ `Sketcher` + `Laying out…` shows for under 1 s.
- ✓ The right pane switches to `What it knows` with faint placeholders and no spinner.
- **Fix**: the pane said `Only you see this. The agent doesn't.`. It now names her: `Only you see this. Ines doesn't.`
- ✓ The References line shows `312 files · 38.4 GB`.
- **Fix**: `What Ines knows · 267 files` (was `What it knows`), with the user's folder names and sizes.
- ✓ `How Ines sounds · 41 files`.
- ✓ `Set aside · 4 · why ▸` gives one row per file, each with its reason.
- ✓ The estimate line sits above `Start studying`, which is the only primary.
- ✓ The Sketcher's laid-out reply.
- ✓ The `Say what to change, like "skip Bonus"…` placeholder.
- ✓ Only file names show, never contents.
- ✓ The `Done. Bonus is set aside.` reply and the Split change line (live, uj2).
- **Deviation**: the counts after the correction are 280 · 18 · 14 set aside (= 312, consistent). The study then counts `of 297`, and the end is `297 studied · 15 set aside` (= 312). The checklist says 296; the build's numbers agree with each other on screen, which is what §16 asked for.
- ✓ ↗ scrolls to the first moved stack.
- ✓ `go` doesn't start studying: `Press Start studying when it looks right.` (live).
- ✓ Rows can't be dragged.
- ✓ The `Studying · [real file] ([stage]) · n of 297` line (live).
- **Fix**: the time line now counts in minutes (`about … min left · … · you can close the app, it keeps going`), with a quiet `Stop`. No bar, no stages line.
- ✓ The top bar shows `Studying · about … min left` and opens `What Ines knows` when clicked.
- ✓ Home's Ines row reads `Studying · about … min left`, and nothing pops up.
- ✓ First impressions: 3 Rough lines at 60%, no counts, rows don't expand.
- ✓ Likeness is hidden while studying.
- ✓ The Sketch gets name + persona tagged `first impressions`, and the update dot shows.
- ✓ The `First impressions, from 20 of 297` chat line and its change line.
- ✓ The Palette strip gains segments.
- **Fix**: `Picked up where it left off · 251 of 297` now shows for 10 s, then the normal line. It never restarts from 0.
- ✓ The seeded Ines shows the resumed state (live).
- ✓ Stop has no sheet: `Stopped · 251 of 297 studied · Study the rest` (live).
- ✓ `Study the rest` resumes where it stopped.
- ✓ The Finished summary has no button (X10, X11) (script: B4).
- ✓ There is one `set aside` list with the damaged `Day 2 – Part 4.mp4` reason and no `Couldn't be read` list.
- ✓ The finished chat line + voice card + change line (counts as in the Deviation above).
- ✓ Home reads `Ready` until opened, with no chime.
- ✓ The map arrives once per batch, Sharp → Rough → Blank.
- ✓ The map is 4 Sharp / 2 Rough / 2 Blank, in words.
- ✓ The `why Rough on pricing?` hint and its answer with `Day 4 – Session 8.mp4 · 22:05`.
- ✓ After the first visit, the summary collapses.
- ✓ The voice card caption + `Where from · Live Q&A 7.mp3 · 03:10`.
- ✓ The passage panel underlines the sample words. `✕` returns.
- ✓ `✎ yours` fields aren't overwritten; the Sketcher asks first (P2 behaviour).
- ✓ The face slot shows the first of three icons, `new`, and the one-time line (script: B4).
- ✓ The face slot opens `Ines's face`, and doing nothing keeps the first icon.
- ✓ The Keep card has 3 lines in the C8 box and no praise (script: B6).
- ✓ The whole box is one button with no link inside (X15).
- ✓ `Talk to Ines →` shows, and the mode switch fades in at the same moment.
- **Fix**: Keep now hides for good after Keep (X4, `renderKeep`).
- ✓ Ines's First words line (script: B6).

## UJ3 · Make from one line
- ✓ The P2 flow is unchanged (real `/agents` + `/ask`).
- ✓ The switch reads `[ Sketch | What it knows ]`, then `What [Name] knows`.
- ✓ The B7 box words.
- ✓ The B7 box is not a button; its one action is `Add references` (X15).
- ✓ C3 has the same words and one primary, with no map or Likeness.
- ✓ The real agent in Talk answers with a marked `(Demo) …` line, outlined by Show mock values.
- ✓ Marcus shows C3 before the pick.
- ✓ The one-pile batch says `Studying 4 references. They go into what Marcus knows.` (code, block-e.js:90). The open panel offers 4 demo docs (§16).
- ✓ A short Study block, then the map with marks.

## UJ4 · Check how good it is
- ✓ The switch shows and there's no Keep for Rex (live).
- ✓ `Only you see this. Rex doesn't.` (live).
- ✓ The 4 Sharp lines with ref counts (live).
- ✓ The 2 Rough lines (live).
- ✓ 2 Blank lines with `Add a reference for this` (live).
- ✓ No generic lines; levels are words.
- ✓ 3-Breath expands to the 4 named refs (live).
- ✓ The passage panel has `← What Rex knows`, the file title, the underline and `Behind:` (live).
- ✓ No pager, and the passage swaps in place (live).
- ✓ Esc returns with the row still expanded and focused (live).
- ✓ Relationships shows one row + `Only Day 4 covers this.`; Blank rows don't expand.
- ✓ The Likeness reasons and example (live).
- ✓ The example line with its source.
- ✓ `8 of 10` comes last, small, with no colour or motion (live).
- ✓ No "captured", "you" or "accurate".
- ✓ One `References · 186 · 3 hard to study ▸` row (live).
- ✓ When expanded, the 3 hard files come first with structural reasons, then the piles.
- ✓ `Add a reference for this` on Money opens the file panel (script: E1).
- ✓ Edie's map lines.
- ✓ Edie's Likeness: 2 reasons, then `7 of 10`.
- ✓ Edie's References: `Reader emails.txt` comes first.
- ✓ While Ines is studying: the Study block is on top, Rough lines at 60%, Likeness hidden.

## UJ5 · Ask a question
- **Fix**: the cards show faces, names and Sharp lines. Rex now reads `Ladder of Excuses · hard conversations` and `Last: The job offer · yesterday`. Edie and Marcus match the checklist (live).
- ✓ The Sketches rows (Ines studying, Untitled sketch · yesterday), then `New agent` (live).
- ✓ No search, sort, filters, card buttons or context menus on Home (live).
- ✓ One mark per card (X9).
- ✓ A new talk opens: empty, `Talk to Rex…` focused, no greeting, no ＋ (live).
- ✓ `Past talks` + `New talk` + `Search past talks` (live).
- ✓ Streaming starts under 1 s, with the 24 px face before `Rex`.
- ✓ The new row shows the first words at 60%, then the title (X21).
- ✓ The face fills in together with the first streamed line (X23) (script: F3, B6).
- ✓ The `First words · 25 Nov` mark; reopening never greets.
- ✓ Offline on a never-opened agent: no first words, the face stays an outline, the banner shows (code, block-d.js).
- ✓ `Where from · Day 2 – Hard Calls.mp4 · 14:20 · No Soft Days.pdf · p. 88` fades in, with one link per source (live).
- ✓ The passage panel over Past talks has the underline + `Used in this answer`.
- ✓ The second source swaps in place, with no pager.
- ✓ `✕`/Esc → Past talks, focus back on the link; the panel never opens on its own.
- ✓ `Rex's own view · no reference` is plain text (live).
- ✓ `Not my lane…` never mentions the map (live).
- ✓ The C8 strip: `Blank in what Rex knows` · `Add a reference for this` (live).
- ✓ Free text → `(Demo) Rex would answer here.` with 4 chips that type the question (script).
- ✓ Marcus: own view on every answer, with no banner.

## UJ6 · Pick up an earlier conversation
- ✓ `The job offer` opens continued, scrolled to the end, with the last two lines and no recap (live).
- **Deviation**: 14 talks, newest first. `Landlord call` moved to 20 Nov so that the card's `Last: The job offer · yesterday` holds. The checklist asked for both, which contradicts itself. The titles are topics and there are no previews.
- ✓ Search filters as you type, with the `…call them **Friday** at 9…` snippet (live).
- ✓ Opening a match scrolls to it with a 1 s highlight.
- ✓ `mortgage` → `No talks with "mortgage".`, and Esc clears it (live).
- ✓ `Last time you were going to call them Friday. Did you?` + own view.
- ✓ The row `⋯` menu has only `Rename` (inline) and `Delete…`.
- ✓ The talk delete sheet wording; deleting the open talk leaves an empty new talk.

## UJ7 · Fix a wrong note
- ✓ The off-voice answer has no Where from and no own-view line (live).
- ✓ `Not Rex` shows at 60% on the latest answer without hover; on older ones only on hover or focus; never on user messages or while streaming (live).
- **Gap (not tested)**: the 10-second first-timer test needs a real person; that's for Phase 7 user testing. In the build the button is visible without hover, bottom-right of the latest answer.
- ✓ `Sketcher · fixing Rex ✕` opens, the talk stays put, and focus moves to the fix composer (live).
- ✓ The warm left rule + the pinned quote.
- ✓ The fixed opening line.
- ✓ The reply + `Sketch: persona updated · from your talk ↗`, with no Keep (live).
- ✓ ↗ opens Sketcher with `new` / `from your talk` and the fix turns under `From your talk · "…"` (X22).
- ✓ The `Rex was redrawn · persona updated` divider + `See the Sketch ↗` (live).
- ✓ The composer is prefilled, focused, and not sent (live).
- ✓ The Morning Standard answer + `Where from · No Soft Days.pdf · p. 12` (live).
- ✓ Opening and closing with no change: no divider, no prefill, and the mark goes (script: D Not Rex).
- ✓ `be blunter` in Talk changes nothing.

## UJ8 · Add more material
- ✓ The chip `Money Has Rules.pdf · 1 file · 4 MB` + the Sketcher line (script: E1).
- ✓ One-pile batch: no piles, no Start studying.
- ✓ The Study block `1 of 1` sits over the old, usable map.
- ✓ The top bar shows `Studying · about 1 min left`, and Talk still works.
- ✓ `Finished studying · 1 reference studied`, with no buttons.
- ✓ The new Sharp line comes first, faint → clear, with `was Blank` (script: E2).
- ✓ `✓ Has his money rules, word for word` and `9 of 10 · was 8`, with no motion.
- ✓ The chat line + `Blank → Sharp ↗` change line.
- ✓ On the next visit, the line is back in normal order with no marks.
- ✓ The quiz opens a new talk with the question typed, not sent (script: E2).
- ✓ `Pay the future first.` + its source + the underline.
- ✓ The Remove tooltip wording.
- ✓ No confirm; the `Removed. … · Undo` line, focus on Undo (script: E3).
- ✓ Rough + `was Sharp · now Rough · after removing …`; Likeness unchanged.
- ✓ The `References: removed …` change line.
- ✓ New answers never cite the removed file, and old talks show `· removed`.
- ✓ Undo puts it back with nothing re-studied, + the `put back` line.
- ✓ Removing a group gives the same line with no sheet (script: E3 group).

## UJ9 · Make it a character
- ✓ The `Edie's face` sheet: current face first, `Use` disabled until the choice differs (script: E4).
- ✓ `Draw three more` → `Drawing…`, and the current face stays first (X28).
- ✓ `Use a photo…` adds a fourth, circle-cropped choice.
- ✓ The face crossfades everywhere it shows.
- **Deviation**: the change line reads `Face: new photo` for a photo and `Face: new face` for an icon, with no Keep.
- ✓ The agent menu reads `Palette · Export Edie… · Delete Edie…`, with no `Change face…` (live).
- ✓ The Palette header with 4 traits and no footer (script: E5).
- ✓ The mix band blooms once; hovering names a segment.
- ✓ The four traits on five-step scales.
- ✓ The Palette opens in Sketcher mode.
- ✓ `Directness: 4 → 5` as a user message + change line, and the new trait sentence.
- ✓ The scales are disabled with `Sketching…` while a turn runs.
- ✓ `✕`/Esc goes back.
- ✓ Marcus's header shows `· 3 traits`.

## UJ10 · Export
- **Deviation**: the sheet and Packed list are right, but Persona/Instructions show the real word counts of the mock text (Rex 45 / 34), not 212/188. That's honest, so it stays.
- ✓ The `Stays here` three lines (live).
- ✓ `One file: Rex Hart.agent.zip · about 2.3 GB` / `Desktop · Change…`.
- ✓ No options and no "unkept changes" line (X4) (live).
- ✓ No save panel; `Exported · …` with `Show in Finder` and `Done`; Esc = Done (script: F1).
- ✓ A second export is named `Rex Hart 2.agent.zip`.
- ✓ `Change…` only opens when clicked, and the sheet stays.
- ✓ Marcus shows `Knowledge · none, only the Sketch`; the untitled sketch has no Export.

## UJ11 · Import
- ✓ The overlay `Drop · import this agent` with no other lines.
- **Deviation**: the `Import Juno?` sheet is right, but `Juno.agent.zip` clashes with the seeded Juno on a fresh start (by design, build-notes-jony.md:115). The clean sheet shows after deleting Juno (script: F2).
- ✓ Import goes Home, with `new here`, no title dot and no auto-open (X30).
- **Deviation**: the imported agent has no import study phase, so the card goes straight to `new here` and never to `Ready` (X9 still holds).
- ✓ `You already have Marcus.`, with `Keep both` as the primary (script: F2).
- ✓ The Replace line is always visible (X31) (live).
- ✓ `Keep both` → `Marcus 2` on Home.
- ✓ `Can't import Old coach.agent.zip` + `Details ▸` + OK, and nothing is added (live).
- ✓ Juno's First words, the face fills in, and `new here` goes (script: F3).
- ✓ Filled Sketch fields with no `new` and no `Imported from` line (X32).
- ✓ Juno's map, the one Packed knowledge row, Likeness hidden.

## UJ12 · Manage the library
- ✓ Cards sorted by latest talk; sketches are rows and never mix with cards (live).
- ✓ Card states are in words, one mark each.
- ✓ The untitled sketch row → Sketcher with `Back to …` and no switch.
- ✓ Arrow keys + Return on cards; Tab order cards → rows → New agent (code, app.js:697 + DOM order).
- ✓ The Name field is the only rename.
- **Fix**: the delete sheet now reads `This deletes Rex Hart's 14 past talks and what Rex Hart learned from 186 references. Your files on this Mac aren't touched.` / `This can't be undone.`
- ✓ Cancel has default focus, and Delete uses the error colour (live).
- ✓ Back Home with no toast; Ines adds `Studying stops.`; the untitled one reads `Delete this sketch?` (code, block-a.js:191–199).
- **Deviation**: there's no macOS menu bar because the .app is a Chrome `--app` window. The agent menu item names its target (`Delete Rex Hart…`) and never deletes a talk (X33).
- ✓ `New agent` always shows on Home; ⌘⇧N works everywhere.
- ✓ Dropping on Home shows the overlay with `for a new agent` + the privacy lines → Sketcher.

## 13. Cuts (X1–X35)
- ✓ X1 `[ Talk | Sketcher ]` and `[ Sketch | What [Name] knows ]`.
- ✓ X2 ⌘N = New talk (Talk only); ⌘⇧N = New agent (code, block-a.js:291–292).
- **Fix** X3: narrow now has one switch `[ Chat | Sketch | What [Name] knows ]` in Sketcher and `[ Chat | Past talks ]` in Talk (live).
- **Fix** X4: Keep hides after the first Keep. Fix, trait, top-up and face show only change lines, and Export has no unkept line.
- ✓ X5 drop texts: references overlay (+ context) and `import this agent` only.
- ✓ X6 only `Add a reference for this` / `Add references`.
- ✓ X7 the door is A2's only file-panel way; ＋ comes after.
- ✓ X8 the launch rule is in `boot()` only; the title link and ⌘↑ go Home.
- ✓ X10 no `See what [Name] knows`.
- ✓ X11 no `Talk to [Name]` on a top-up Finished block.
- ✓ X12 Stop has no sheet.
- ✓ X15 the B7 box isn't a button; the B6 box is one button.
- ✓ X17 no weak-material or only-Blank state.
- ✓ X24 no `Add more on this`.
- ✓ X25 remove: no confirm, Undo, no group sheet.
- ✓ X26 no `Change face…`.
- ✓ X31 the Replace line is always visible.
- ✓ Nice cuts: X9, X13, X14, X16, X18, X19, X20, X21, X22, X23, X27, X28, X29, X30, X32, X33 (agent menu; see UJ12), X34, X35 all hold.

## 14. Once across the app
- **Fix** narrow: one pane at a time. Where from and the fix panel open as the `side` view with `✕` back, and the update dot shows.
- ✓ Reduced motion: the `magic.css` @media turns off the fill-in, map arrival, Palette bloom and fades; `stream()` is instant (code).
- ✓ Light/dark follow `prefers-color-scheme` in app.css and magic.css (code; contrast not measured).
- ✓ Focus moves only on Not [Name], ✕/Esc, the quiz, and A2's composer (A2 per the checklist's UJ1 line).
- ✓ Keys ⌘1 ⌘2 ⌘↑ ⌘F ⌘E ⌘⇧I and Esc (code, block-a.js:279–301). ⌘⇧I opens an import picker.
- ✓ Talk errors: the bubble stays, `Rex can't reach Claude right now.` + banner (block-d.js:82, 317).
- ✓ Real P1/P2: making from one line uses the real `/agents` + `/ask`; only demo ids go to the mock.

## 15. Watch-outs (none happened)
- ✓ No made-up source: every passage I opened contains its claim, with the words underlined.
- ✓ The map never leaks into answers, Sketch fields, Packed or the Palette.
- ✓ No silent skips: one `Set aside` list with reasons; the damaged video is among the 15 (counts as in the UJ2 Deviation).
- ✓ No lost learning: resumes at 251, and Stop keeps what's done.
- ✓ No removed source in new answers.
- ✓ No second way to do the same thing: every item in the list checked (live + code).
- ✓ No chat message changes the agent except `Not [Name]`.
- ✓ No private content, only file names.
- ✓ No score as a verdict: reasons first, no colour or motion.
- ✓ No greeting or motion before words.
- ✓ No overwrite: `✎ yours` is asked first, and exports get ` 2`.
- ✓ No dead end or dead click on anything walked; Home is always reachable.
- ✓ No real person in the mock: all demo agents are invented.
- ✓ Every destructive act has its consequence line.

## 16. Gaps
- A4 0/1-agent launch: it can't be reached in the demo (always 6 agents). The rule is in `boot()`, and no UI was added. Left as a gap.
- Marcus top-up: the open panel has 4 demo docs. ✓
- Ines counts: they're consistent on screen (280 + 18 + 14 = 312; 297 studied + 15 set aside = 312). This replaces the 296 target.
- `Start UJ2 fresh` is the only way into UJ2 steps 1–3. ✓

## For Columbo
`scripts/walk-full-ux.mjs` (I may not edit it) has 5 steps that use old wording and now fail:
- B3 expects `Studying ·`. The first 10 s now show `Picked up where it left off`.
- B1 clicks `Add references`. The door now reads `Or bring their references`.
- B2 and B3 `Start studying` fail as a result of B1.
- A2 expects `a folder of their books`. The door words changed (see UJ1).

Columbo checked these against the design: **the script is out of date and the app matches the spec**. The door words are in design-jony-block-A.md:144–145, and `Picked up where it left off` is B3.5 (design-jony-block-B.md:270–271). The script fix should change only the door click: `Add references` stays the right label for the ＋, B7 and C3. The script still needs an owner.

`npm test`: 85 pass, 1 skip.

## Integration (Columbo, captain, 25 Nov)
- Script fixed: the door click is now `.door` (B1), A2 looks for `Or bring their references`, and both B3 steps accept `Studying ·` or `Picked up where it left off`. Nothing else changed.
- Rebuilt `dist/Agent Creator.app` and ran the script against the server inside the bundle: **33 of 33 pass, no page errors**. `npm test`: 85 pass, 1 skip.
- **Still open: the window launch.** My shell refuses `open` as well. Also, the studio's Start only picks up a built `.app` for Tauri or Swift/Xcode projects, so in this Node project Start runs `run: npm start`. That serves the same full UX in the browser, but it doesn't open the .app. Someone has to double-click `dist/Agent Creator.app` once (after `npm run build:app` in the main checkout, because `dist/` is git-ignored).

**Signed: Eraser, 25 Nov 2026.** The flow is lean. There's one way to do each thing, and the four trust items hold (sources, the map, `Not [Name]`, no silent skips). Approved, with the gaps and deviations above. One gap is still open: someone has to double-click `dist/Agent Creator.app` once to confirm the window opens.
