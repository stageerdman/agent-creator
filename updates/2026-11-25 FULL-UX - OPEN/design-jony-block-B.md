# Block B · Make (from references or from one line)

*Jony, 2026-11-25. Shared frame, components (C1–C14), data shapes and flags
live in `blocks-jony.md`. Journeys: **UJ2, UJ3**. The P2 creation chat
(Sketcher + Sketch, S0–S12) is **real and unchanged**; this block adds
references, Studying and the map around it.*

## User goal

> "I drop everything I have of this person. It shows me what it found, I
> fix the split in one sentence, I go for a walk, and I come back to
> someone who's really them. Then I keep it."

**One primary action per state:**
- Laid out (B2): **Start studying**.
- Studying (B3): none. Leave, or keep shaping in the Sketcher.
- Finished (B4): none. The map arrives on its own the first time the view
  is visible (X10); the next step is reading it.
- Shaping (B5): the composer (P2).
- End: **Keep** (P2).

## What I removed, and why

| Removed | Why |
|---|---|
| A rules form ("what goes where") | Rules are a correction of a proposal, said in the Sketcher chat (insight 5). |
| A separate intake screen or wizard | References arrive in the same Sketcher mode as the one-line make. One place to make. |
| A progress bar / percentage | Merlin cut; the file name, count and honest time say more. |
| A file-by-file preview of contents | Privacy (no-magic list): names only, never contents. |
| A modal "Studying…" that blocks the app | The user can leave at once (D8). Studying shrinks to one line. |
| `Start studying` for one-pile batches | Nothing to correct, so nothing to confirm (F4). |
| A "Talk to [Name]" button on Finished before Keep | It would bypass Keep (F5). Talk comes after Keep. |
| Choosing an icon before Keep | The first icon is a smart default; the other two are one click away on the face. |
| `See what [Name] knows` on the Finished card | X10: it opened the view the user was already in, only to start the map arrival. The arrival now plays on its own, once per batch. |
| `Talk to [Name]` on a top-up Finished card | X11: the mode switch is one click away, and the quiz invitation (E2) is the better door. |
| The "Stop studying?" sheet | X12: stopping loses nothing; the `Study the rest` line is the undo. |
| The stages line (`✓ reading · ● listening · ○ studying`) | X13: a second counter beside the Studying line. The slow stage goes into the time line. |
| A separate `Couldn't be read` list | X14: one `Set aside` list; each row's reason says what happened. |
| Keep after the first Keep | X4: once kept, every change is live and saved. |

## The right pane in Sketcher mode

P2's Sketch header gains a two-part switch, P2's own segmented control:

```
│ [ Sketch | What Ines knows ]                       [ Keep ] │   header, 52
```
- Before a name exists: `[ Sketch | What it knows ]` (P2's reserved label).
- During a Sketcher turn the first part reads `Sketching…` (P2 R7).
- **Keep** stays on the right in both views (P2 S8 rules) **until the first
  Keep**. Once `keptAt` is set, Keep is gone for good (X4, flag F8): every
  later change is live and saved, and its change line says so. The header
  of a kept agent is just the switch.
- `What [Name] knows` is Block C's view (C1). It holds the map, Likeness,
  and **References** (laid-out piles, Studying, files). This block only
  adds its references and Studying states.
- When references are dropped, the pane switches to `What [Name] knows`
  **because the user just acted** (not on its own). Later switches are the
  user's.
- The P2 Sketch view gains one thing: the **face slot** (C5, 48 px) to the
  left of the Name field. Before a face exists it's the P2 letter circle
  (or an outline if empty).

## B1 · Bringing references (UJ2 · 1)

Ways in, all ending in the same place (the Sketcher chat + the laid-out
references):
1. Drop a folder, files, or both, anywhere on the window (A2 door, A1 Home,
   any agent in either mode). A drop in Talk switches to Sketcher mode on
   drop (the user just acted).
2. ＋ in the Sketcher composer (C3), or click the A2 door → macOS open panel
   (on first run only the door is shown, X7).
3. A message that is only a path.

**Drop overlay** (C15, the one reference text everywhere, X5):
```
            Drop · your files stay on this Mac
               Claude reads them to study  (13 px)
                     adds to Rex Hart      (13 px, 60%)
```
The context line is `adds to [Name]` inside any named agent (Talk or
Sketcher), `for a new agent` on Home, and absent on A2 First run. The
privacy lines are always there. The overlay settles **down** on drop (8 px,
200 ms), never up or away (Merlin 6). Reduced motion: it just goes.

**In the chat** (user side), a **references chip** (C4), P2 pasted-note
style:
```
                       ┌──────────────────────────────────────────┐
                       │ References · Ines Duarte – The Quiet Deal │
                       │ 312 files · 38.4 GB                    ▸ │
                       └──────────────────────────────────────────┘
```
Below it: `Sketcher` + `Laying out…` (P2 dots). The scan is local: mock
returns in under 1 s; real: a few seconds per thousand files.

### States
- **B1.1 Scanning:** as above. The right pane shows the References section
  with faint stack placeholders (no spinner).
- **B1.2 Nothing readable** (a folder of only `.exe`, `.dmg`, empty):
  the error line under the chip: `Nothing here Agent Creator can read. It
  reads text, PDF, Word, Markdown, audio and video.` No Try again (nothing
  to retry). The chip stays.
- **B1.3 Path not found:** `Can't find ~/Courses/quiet-deal. Check the
  path.` under the bubble. The bubble keeps the text so it can be edited
  in the composer (↑ recalls it, P2 composer).
- **B1.4 No permission** (macOS blocks the folder): `Agent Creator can't
  open this folder. Allow it in System Settings › Privacy & Security ›
  Files and Folders, then drop it again.`
- **B1.5 Huge folder** (40 GB+, thousands of files): not an error. Laying
  out may take longer: after 3 s, `Laying out · 1,840 files so far`.

## B2 · Laid out: the inventory and the two piles (UJ2 · 2–3, Merlin 6)

Right pane, `What Ines knows` view, top section **References** on the
behind-the-canvas surface (C8):

```
│ [ Sketch | What it knows ]                                [ Keep ]    │
│───────────────────────────────────────────────────────────────────────│
│ Only you see this. Ines doesn't.                                       │
│                                                                       │
│ References · Ines Duarte – The Quiet Deal          312 files · 38.4 GB │
│                                                                       │
│ What Ines knows                                         267 files     │
│   ▸ 📄 Books                       3 PDF · 46 MB                       │
│   ▸ 📄 Transcripts               120 text · 9 MB                       │
│   ▸ 📄 Notes                     116 Markdown · 2 MB                   │
│   ▸ 🎙 Live Q&A                   18 audio · 2.1 GB                     │
│   ▸ 📄 Bonus                      10 PDF · 31 MB                       │
│                                                                       │
│ How Ines sounds                                          41 files     │
│   ▸ 🎬 Course – The Quiet Deal    41 video · 36.2 GB                   │
│                                                                       │
│ Set aside · 4                                                   why ▸ │
│                                                                       │
│ About 40 min to study · you can close the app, it keeps going         │
│                                                     [ Start studying ] │
```
(Glyphs here stand for small monochrome kind icons, not emoji.)

- Stacks use **the user's own folder names** (C12 rows), with counts by
  kind and sizes. ▸ expands to the file list.
- `Set aside · 4 · why ▸` expands to one row per file with its reason:
  `Workbook.pages · Agent Creator can't read Pages files. Export it as PDF
  and drop it again.` · `Setup.dmg · an app installer, not a reference` ·
  `Notes/Week 2 (copy).md · duplicate of Week 2.md` (×2).
- **Start studying** (accent, filled, 44 px high), the only primary in the
  pane. The estimate line sits above it (13 px).

**In the chat**, the Sketcher's reply (scripted mock, F7):
```
Sketcher
I laid out 312 files. Books, transcripts, notes and the Live Q&A go into
what Ines knows. The course videos are how she sounds. I set aside 4 I
can't use. Change anything in one sentence, then press Start studying.
```
The composer placeholder for the next turn: `Say what to change, like
"skip Bonus"…` (once, P2 S3 pattern).

**The correction (UJ2 · 3):** the user types `Skip Bonus. Her voice from
the Live Q&A only.` Sketcher reply:
```
Sketcher
Done. Bonus is set aside. Her voice now comes from the 18 Live Q&A
recordings; the course videos go into what she knows.
Split: 18 recordings moved to How Ines sounds · 41 videos moved to What
Ines knows · Bonus set aside  ↗
```
- The last line is a **change line** (P2 S4 style, 13 px, 60%, ↗ scrolls
  the pane to the first moved stack). It's built from the split change,
  never from the AI's words.
- The moved stacks **slide** to their new pile (250 ms) and the counts
  change. Unmoved stacks do nothing. Reduced motion: they jump.
- After: What Ines knows 280 files (Books, Transcripts, Notes, Course
  videos) · How Ines sounds 18 · Set aside 14.
- "Go", "ok", "start" typed in the chat do **not** start studying (F4). The
  Sketcher answers `Press Start studying when it looks right.`

### States
- **B2.1 Proposed** (as drawn) · **B2.2 Corrected** (after the sentence).
- **B2.3 One-pile batch** (every file in one pile, nothing set aside, for
  example 4 docs or 1 PDF): no piles, no button. Studying starts at once.
  The Sketcher's reply says where it went: `Studying Money Has Rules.pdf. It
  goes into what Rex knows.` (E1).
- **B2.4 Hand-dragged split:** not supported. One way: the sentence. (Rows
  are not draggable.)
- **B2.5 More references while laid out:** a second drop adds to the same
  layout and the Sketcher restates the totals.
- **B2.6 Claude not reachable:** the layout still appears (local). The
  button is disabled with the reason under it in the error colour:
  `Claude isn't reachable · Check again` (the C11 banner is also above the
  composer).
- **B2.7 The user leaves before starting:** the layout stays on the agent
  (a Sketch row on Home: `References laid out · not studying yet`).

## B3 · Studying (UJ2 · 4–5, Merlin ★3)

After **Start studying**, the References section becomes the **Study
block** (C9; the same component carries B4), at the top of `What Ines
knows`:

```
│ Only you see this. Ines doesn't.                                       │
│                                                                       │
│ Studying · Day 3 – Session 2.mp4 (listening) · 251 of 297              │
│ about 25 min left · listening is the slow part · you can close the     │
│ app, it keeps going                                             Stop  │
│                                                                       │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ (Palette strip, C13)       stand-in look        │
│ Books · Transcripts · Notes                                           │
│                                                                       │
│ What Ines knows · first impressions · from 20 of 297                   │
│ Rough  The Quiet Anchor: never name a number first                     │
│ Rough  Silence as a tool: count to seven before answering              │
│ Rough  Walk-away line: decide it before you sit down                   │
│                                                                       │
│ References                                         297 to study · 14 set aside ▸ │
```

- **The Studying line** (C9, long form, 15 px for the file part): the file
  being studied **right now, by its own name**, the stage word in brackets
  (`reading`, `listening`, `studying`), the count. Names only, never
  contents. Updates at most every 500 ms (no flicker).
- **The time line:** `about 25 min left · you can close the app, it keeps
  going`. Rounded (`about 2 min`, `about 25 min`, `about 3 h`). It never
  goes **up** without a reason; if it must, it says why: `about 30 min left
  · the videos are longer than expected`.
- **No stages line** (X13). The stage word is already in the Studying line
  (`(listening)`). When one stage dominates the wait, the time line says so
  in a few words: `about 25 min left · listening is the slow part`. Two
  lines to read, not three, and one counter.
- **First impressions** (after ~20 files, within the first minute of the
  mock run):
  - in this view: 3–4 map lines, **all Rough**, row text at 60%, under the
    heading `What Ines knows · first impressions · from 20 of 297`. As
    studying goes on, lines firm up faint → clear (opacity 60% → 100%, 400
    ms, once per line). A line turns **Sharp** only when enough references
    back it (the mock says when).
  - in the Sketch view: Name and a persona line or two fill in, P2 S3
    stagger, with the tag `first impressions` in each field's tag slot
    (instead of `new`). The Sketch switch shows P2's dot (•) if the user is
    on the other view.
  - in the chat, one Sketcher line (scripted): `First impressions, from 20
    of 297: she's calm, slow to answer, never names a number first. I'll
    sharpen this as I study.` + change line `Sketch: name and persona
    updated`.
- **The Palette strip** (C13): one named colour segment arrives each time a
  reference group is done (Books, Transcripts, Notes, Course videos, Live
  Q&A). Under it, the names of the groups so far (13 px).
- **References** below: collapsed to one row; ▸ shows the piles (B2) with
  per-file state (`studied`, `studying`, `waiting`). A file that fails
  during studying moves to **Set aside** with its reason (X14); the
  `Set aside · n` count grows by one. One list, one word.
- **Leaving:** the user can switch to the Sketch view, talk to the Sketcher,
  go Home, open another agent or quit. Studying shrinks to the **top bar
  line** `Studying · about 25 min left` (C1, a button back here) and the
  Home row line. Nothing pops up until it's finished.
- **Shaping while studying:** allowed (P2 rules). Hand edits win: the
  generated persona at the end never overwrites a `✎ yours` field without
  the Sketcher asking (P2 H4).
- **Keep while studying:** allowed once there's a name (P2 rule). The Keep
  card's map lines then carry `first impressions` (B6).

### States
- **B3.1 Reading** (fast, text) · **B3.2 Listening** (video, audio) ·
  **B3.3 Studying** (`studying · building how Ines sounds and what she
  knows`, no file name, `about 4 min left`).
- **B3.4 First impressions arrived** (as drawn).
- **B3.5 Picked up where it left off** (the demo Ines; after the app was
  closed or the Mac slept): the line reads `Picked up where it left off ·
  251 of 297` for 10 s, then the normal line. Nothing is studied twice.
- **B3.6 Paused · Claude not reachable:** `Studying paused · Claude isn't
  reachable · Check again` (C9 paused, error colour). Done work is kept.
- **B3.7 Paused · references missing** (a disconnected drive, a moved
  folder): `Studying paused · can't find "Ines Duarte – The Quiet Deal".
  Reconnect the drive or put the folder back.` It resumes on its own when
  the folder is back (checked every 30 s and on window focus).
- **B3.8 Paused · Mac out of space:** `Studying paused · this Mac is out of
  space. Free 2 GB to go on.`
- **B3.9 Stop studying:** in the Study block, a quiet text button `Stop`
  (13 px, right of the time line, 44 px target). **No sheet** (X12):
  stopping loses nothing. It stops at once and the block reads `Stopped ·
  251 of 297 studied · Study the rest` (one button). That line is the undo.
  Everything studied so far is kept.
- **B3.10 Prototype skip:** C14 `Skip time ▸` jumps: start → First
  impressions → (each Palette group) → Finished.

## B4 · Finished studying (UJ2 · 6, ★3)

The Study block (C9) turns into its **finished** state: a summary, with
**no button** (X10). It already sits inside `What Ines knows`, so there is
nothing to open:

```
│ Finished studying · 296 references studied · 15 set aside ▸           │
```
- `15 set aside ▸` opens the one Set aside list (X14), a reason per file,
  the damaged video among them: `Course – The Quiet Deal/Day 2 – Part
  4.mp4 · damaged: no sound track found. Re-export it and drop it again.`
- **The map arrives on its own** (C1, ★4) the first time this view is
  visible after the batch finishes: right away if the user is looking at
  it, else on their next visit (switch, top bar line, notification click,
  Home row). Once per batch, as specced in C1. The map takes the space
  under the summary.
- After that first visit, the summary collapses to one line in the
  References row: `296 references · studied 25 Nov`.
- **In the chat** (scripted): `I finished studying. Here's Ines from 296
  references.` + a **voice card** that quotes the material (B5) + change
  line `Sketch: persona and instructions updated`.
- **Notification** (if the window isn't focused, or the app is closed):
  macOS notification `Ines finished studying. 296 references.` Click →
  opens this view (and the arrival plays there). Only the system sound.
- Home: the Ines row reads `Ready` until opened.
- No Talk button on the summary, ever (X11). Before Keep, Talk doesn't
  exist (F5); after Keep, the mode switch is in the top bar.

### States
- **B4.1 All clean:** `Finished studying · 296 references studied` alone
  (no "0 set aside").
- **B4.2 Some set aside** (as drawn).
- **B4.3 Top-up finished** (kept agent, E1): the same summary, nothing
  added (X11).
- **B4.4 Nothing could be studied** (e.g. all videos damaged): `Finished
  studying · nothing could be studied · 41 set aside ▸`, no map arrival,
  the Sketcher says what to do.

## B5 · The generated Sketch (UJ2 · 8–9)

P2 S4–S7, real, plus:
- **Generated fields** (P5, mock): the draft event fills Name, Persona and
  Instructions with `new` marks (P2 S4). Fields marked `✎ yours` are not
  touched; the Sketcher asks first (P2 H4).
- **Voice cards quote the material** (Merlin ★1 in UJ2 · 8): under a voice
  card's caption, a Where from line (D1 spec) when the sample leans on a
  reference: `Where from · Live Q&A 7.mp3 · 03:10`. Clicking opens the
  passage panel (C7) in the right pane, `✕` back to the Sketch. The P2
  caption changes to `sample, from the current sketch and her references`.
- **Face slot** (UJ2 · 9, Merlin 11): when the name first lands, the slot
  shows the first of three AI icons (mock), tag `new`. The Sketcher's reply
  carries one sentence, once: `I drew three faces for Ines. Click hers to
  pick another.` Clicking the face → E4 Face sheet. Doing nothing = the
  first one stays (the smart default).
- After the map has arrived, the Sketcher composer placeholder, once:
  `Ask about any line, like "why Rough on pricing?"…` (UJ2 · 7, #12).
  Scripted answer for the demo: B mock data.

## B6 · Keep, with the capability lines (UJ2 · 10, ★4)

P2 S8, unchanged, with the reserved capability spot now filled, and one
next step (F5):

```
┌──────────────────────────────────────────────┐
│ Ines Duarte                                  │
│ A calm negotiator who never names a number   │
│ first.                                       │
│ Yours. You can keep changing it.             │
│ ┌──────────────────────────────────────────┐ │
│ │ What Ines knows · only you see this      │ │  C8 surface
│ │ Sharp  The Quiet Anchor                  │ │
│ │ Rough  Pricing in long contracts         │ │
│ │ Blank  Salary talks                      │ │
│ └──────────────────────────────────────────┘ │
│ Talk to Ines →                               │
└──────────────────────────────────────────────┘
```
- Three lines only: the top Sharp, one Rough, one Blank. No praise.
  Clicking the box → `What Ines knows`.
- If Keep happened while studying: the box title reads `What Ines knows ·
  first impressions`, and lines are Rough.
- **`Talk to Ines →`** (15 px, accent text link) → Talk mode, First words
  (D2). At the same moment the **mode switch appears** in the top bar
  (fade 200 ms). This link is the only new thing on the P2 card.
- All P2 Keep rules hold (status text `Kept ✓`, card goes away on a change,
  `Couldn't keep · Try again`).

## B7 · Keep from one line (UJ3 · 1–3, ★4)

UJ3 · 1 is P2, all of it (S1–S8). At Keep, the box in the card reads:
```
│ │ What Marcus knows · only you see this     │ │
│ │ Marcus knows only what's in the Sketch.   │ │
│ │ Add references to teach him more.         │ │
```
- **One target (X15):** in B7 the box is **not** a button (there is no map
  to open). Its one action is the `Add references` text button → the macOS
  open panel → B1 for this agent. (B6 is the reverse: the whole box is one
  button to `What Ines knows`, with no link inside it.)
  (Pronoun: the template is `[Name] knows only what's in the Sketch. Add
  references to teach [Name] more.`; the mock may use the persona's
  pronoun if the Sketch has one, else the name.)
- UJ3 · 3 (a few files later): a 4-file one-pile batch → B2.3 → E1/E2
  before/after.

## Accessibility (block B)
- The Study block (C9) has one `aria-live="polite"` region, announced on
  stage change, every ~25 files, and on finish (Merlin §8).
- Drop areas also open the file panel by click/keyboard.
- Stacks are a tree (`role="tree"`), ▸ is `aria-expanded`.
- Start studying, Stop, Study the rest: 44 px targets.
- Map levels, `first impressions`, `set aside` and each reason are words.
- Reduced motion: stack slides, line firming, overlay settle and Palette
  segments appear without motion.

## Mock data (block B)
- **The Ines folder** `Ines Duarte – The Quiet Deal/` (312 files, 38.4 GB):
  `Books/` 3 PDF (`The Quiet Deal.pdf`, `Walk Away Rich.pdf`, `Seven
  Seconds.pdf`) · `Course – The Quiet Deal/` 41 video (`Day 1 – Session
  1.mp4` … `Day 4 – Session 10.mp4`; `Day 2 – Part 4.mp4` is the damaged
  one) · `Transcripts/` 120 .txt · `Notes/` 118 .md (2 duplicates `(copy)`)
  · `Live Q&A/` 18 .mp3 (`Live Q&A 1.mp3` …) · `Bonus/` 10 PDF
  (`Affiliate offer.pdf`…) · root: `Workbook.pages`, `Setup.dmg`.
  Totals: 297 to study · 296 studied · 15 set aside (10 Bonus, 2
  duplicates, 2 can't read, 1 damaged during studying), all in one list.
- **Split** before and after the correction (B2), and the two scripted
  Sketcher replies plus the `Press Start studying…` reply.
- **Study run:** stages reading 239 (3 min) · listening 58 (35 min) ·
  studying (4 min); `etaMin` counting down; a current-file pointer through
  the real names; first impressions at 20 files; Palette groups (Books
  `#7A8CA8`, Transcripts `#9AA88A`, Notes `#C9B37E`, Course videos
  `#B9877A`, Live Q&A `#8E7AA8` — stand-in colours); seeded Ines at
  listening, 251 of 297, `resumed: true`.
- **First impressions:** draft `{ name: 'Ines Duarte', persona: 'Calm,
  slow to answer, never names a number first.' }`; 3 Rough lines (B3).
- **Final Ines:** generated persona and instructions (≈ 200 words each, in
  her voice rules), map 4 Sharp / 2 Rough / 2 Blank (C mock data), a voice
  card sample `"Let them talk. The first number on the table belongs to
  whoever is more nervous. Make sure it isn't you."` from `Live Q&A
  7.mp3 · 03:10`, whose passage contains those words.
- **Gap answer** (scripted, UJ2 · 7): `why Rough on pricing?` → `Only Day 4
  covers pricing, and only for short deals. Add her pricing workshop if you
  have it.` with refs `Day 4 – Session 8.mp4 · 22:05`.
- **Faces:** 3 icon options per new agent (Ines, and one generic set for
  any real one-line agent).
- **First words** lines per agent: see D2 mock data.

## Kept plain (no magic, checked)
File names only, no contents · no motion up or away on drop · failed and
set-aside files listed with reasons, never hidden · no chime or confetti on
Finished · estimate never jumps silently.

## Journey trace
UJ2 · 1 → B1 · 2 → B2 stacks, Set aside · 3 → B2 correction · 4 → B3 ·
5 → B3.4 · 6 → B4 summary · 7 → C1 arrival on first view (+ B5
placeholder) · 8 → B5 · 9 → E4 (from the B5 face slot) · 10 → B6. UJ3 · 1 → P2 · 2 → B7 · 3 → B7
→ E1.
