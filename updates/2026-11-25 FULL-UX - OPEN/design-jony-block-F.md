# Block F · Share (export and import)

*Jony, 2026-11-25. Shared frame, components (C1–C14), data shapes and flags
live in `blocks-jony.md`. Journeys: **UJ10, UJ11**. Owns Merlin 13 Packed
for travel. The imported agent's first open uses ★5 (D2). Utility screens:
plain on purpose; the only "magic" is the honest `Stays here` line.*

## User goal

> "Take Rex to my other app exactly as he is, and know what's in the file.
> Or bring one in, see what's in it first, and don't lose the one I
> already have."

**One primary action per sheet:** Export → **Export** · Import →
**Import** (or **Keep both** on a name clash).

## What I removed, and why

| Removed | Why |
|---|---|
| Export options (include face? include talks? format?) | No journey asks for a choice. One file, one honest list (OQ7: the face travels, listed). |
| Exporting talks | Talks are the user's conversations, not the agent. Said plainly in `Stays here`, not left to omission. |
| A map toggle in export | OQ4: the map never travels. One line says so. |
| An import wizard | One sheet: what's in it, one button. |
| "Merge" on a name clash | Two agents can't be merged meaningfully. Keep both or replace. |
| A progress screen for export | Mock: instant. Real: a few seconds; the button shows `Exporting…`. |
| An Import button on Home | Drop or File › Import…, the macOS way. No new chrome for a rare job. |
| The save panel on every export | X29: the sheet already says where the file goes; `Change…` opens the panel only when asked. |
| The "unkept changes" line in Export | X4: there are no unkept changes after Keep; the file is the agent as it is. |
| The update dot on the title after Import | X30: Import goes Home, where `new here` is the one mark. |
| `Imported from Juno.agent.zip` in the Sketch | X32: a third "this is new" signal no journey step needs. |

## F1 · Export (UJ10 · 1–2, Merlin 13)

Agent menu › `Export Rex…` (also File › Export Rex…, ⌘E). A C10 sheet:

```
┌──────────────────────────────────────────────────────┐
│ Export Rex Hart                                      │
│                                                      │
│ Packed                                               │
│  (R) Name           Rex Hart                         │
│      Persona        212 words                        │
│      Instructions   188 words                        │
│      Face           photo                            │
│      Knowledge      from 186 references · 2.3 GB     │
│                                                      │
│ Stays here                                           │
│      What Rex knows (only you see it)                │
│      Palette (only you see it)                       │
│      Your talks with Rex                             │
│                                                      │
│ One file: Rex Hart.agent.zip · about 2.3 GB          │
│ Desktop · Change…                                    │
│                                                      │
│                            [ Cancel ]  [ Export ]    │
└──────────────────────────────────────────────────────┘
```

- **Packed:** the P2 draft fields (Name, Persona, Instructions) as counts,
  the face kind, and the knowledge as `from 186 references · 2.3 GB` (the
  built knowledge, not the raw files, F6). Values are 13 px; labels 15 px.
- **Stays here** (Merlin 13), its own group, 13 px, 60%: `What Rex knows
  (only you see it)`, `Palette (only you see it)` (X35; the trait
  sentences already live in the persona, which travels) and `Your talks
  with Rex`. The honest exclusion, complete.
- **Where it goes** (X29), one line under the file line: the last-used
  folder (first time: `Desktop`) and `Change…` (text button). `Change…`
  opens the macOS save panel only when asked; on Save the line shows the
  new folder and the sheet stays.
- **Export** (primary) writes the file at once, no second dialog. The
  button shows `Exporting…` (real), then the done state. A file with the
  same name in that folder gets ` 2` (`Rex Hart 2.agent.zip`), never
  silently overwritten.
- **Done:** the sheet's body becomes one line `Exported · Rex Hart.agent.zip`
  with `Show in Finder` (primary) and `Done`. Esc = Done.
- **UJ10 · 2** (open in another app) is outside the prototype; the done
  state is the end of the journey here.

### States
- **F1.1 Ready** (as drawn) · **F1.2 Exporting** · **F1.3 Done**.
- **F1.4 Sketch never kept:** menu item reads `Export Rex…` only after the
  first Keep; before, it isn't in the menu (an unkept sketch isn't an agent
  yet, F5).
- *(F1.5 Unkept changes is cut, X4: after the first Keep every change is
  live, so the file is always the agent as it is.)*
- **F1.6 Still studying:** `Knowledge · from 251 of 297 references so far`
  and the line `Studying isn't finished. The file has what's studied so
  far.` Export still allowed.
- **F1.7 No references** (Marcus): `Knowledge · none, only the Sketch`.
- **F1.8 Errors:** `Couldn't export · there isn't enough space on this
  disk. · Try again` or `Couldn't export · Agent Creator can't write to
  this folder. · Try again` (error colour, under the list). Try again
  re-runs the export to the same place; `Change…` stays there to pick
  another folder.

## F2 · Import (UJ11 · 1–2, Merlin 13)

Ways in: drop a `.agent.zip` anywhere on the window (overlay `Drop · import
this agent`), or File › Import… (⌘⇧I) → open panel. Then a C10 sheet:

### F2.1 Valid file
```
┌──────────────────────────────────────────────────────┐
│ Import Juno?                                         │
│                                                      │
│  (J) Name           Juno                             │
│      Persona        164 words                        │
│      Instructions   120 words                        │
│      Face           icon                             │
│      Knowledge      packed · 48 MB                   │
│                                                      │
│ Nothing is added until you press Import.             │
│                                                      │
│                           [ Cancel ]  [ Import ]     │
└──────────────────────────────────────────────────────┘
```
- Same list as export (Merlin: "the same list shows before anything is
  added"), 48 px face. No `Stays here` group (nothing stayed with us).
- **Import** → the sheet closes and the app goes **Home**, from anywhere
  (X30), where Juno's card shows `new here` (F3). The user just asked for
  this agent; showing it is the answer. No title dot, and no auto-open
  (the agent isn't opened; the user didn't ask to talk).
- The persona and instructions are shown as counts, not text: the user can
  read them in the Sketch after import. (A preview of words would be a
  second Sketch view.)

### F2.2 Name clash (`Marcus.agent.zip`, UJ11 · 2)
```
│ Import Marcus?                                       │
│  (M) …same list…                                     │
│                                                      │
│ You already have Marcus.                             │
│                                                      │
│              [ Replace Marcus ]  [ Keep both ]       │
│ Replace: your Marcus and his 3 talks go. This can't  │
│ be undone.                                           │
```
- **Keep both** (primary, accent): imports as `Marcus 2` (the Name field
  can be changed in its Sketch). Safe default.
- **Replace Marcus** (secondary): the button text alone isn't enough for a
  destructive act, so one 13 px line is **always shown** under the buttons
  in the clash state (X31), never hover-only: `Replace: your Marcus and his
  3 talks go. This can't be undone.` (With references: `Replace: your
  Marcus, his references and 3 talks go…`.) A second click isn't needed;
  the visible line is the warning (one confirmation, like A3).
- Cancel stays on the left (Esc).

### F2.3 Broken or old file (`Old coach.agent.zip`)
```
│ Can't import Old coach.agent.zip                     │
│                                                      │
│ This file can't be opened. It's from an older        │
│ version of Agent Creator, or it's damaged.           │
│ Details ▸                                            │
│                                                      │
│                                         [ OK ]       │
```
- `Details ▸` expands the reason in 13 px monospace (`format 0.3, expected
  1.x` / `zip: unexpected end of file`).
- Not a zip / not an agent file at all: `This isn't an agent file.`
  (dropping a random PDF on the window goes to B1 instead; only
  `.agent.zip` takes this path).

### States
F2.1 Valid · F2.2 Name clash · F2.3 Broken · F2.4 Importing (`Importing…`
on the button, real only) · F2.5 Several files dropped at once: one sheet
per file, in turn (rare; no batch UI).

## F3 · The imported agent before first open (UJ11 → UJ5 / UJ4)

- **Home card** (A1): Juno's icon, name, `new here` (13 px semibold) on the
  name row, and her persona's first sentence (no Sharp lines yet, the map
  is being drawn). `new here` stays until first opened (★5).
- **Map** (OQ4, C1.6): right after import, a short study of the packed
  knowledge runs in the background: the card shows `Studying · about 1 min
  left` (C9) instead of the persona line, then her top Sharp lines.
- **Kept state:** an imported agent counts as kept (`keptAt` = import
  time): the mode switch shows, Talk is the default mode.
- **First open:** Talk, D2 First words (`Paste the clause that worries you.
  I'll tell you what it means in plain words.`), the face fills in,
  `First words · 25 Nov` mark. Then UJ5 or UJ4 (switch to Sketcher ›
  `What Juno knows`).
- **Sketch:** fields arrive filled, no `new` marks (they weren't drawn
  here). No "imported from" line (X32): `new here` and First words already
  say it.

## Accessibility (block F)
- Sheets are modal dialogs (`role="dialog"`, `aria-modal`), focus starts on
  the primary button, Esc cancels, focus returns where it was.
- The Packed / Stays here lists are definition lists (`dl`), read as
  "Knowledge: from 186 references, 2.3 GB".
- Replace's consequence line is always visible and linked to the button by
  `aria-describedby`, so it's read on focus too.
- Drop areas have a keyboard path (File › Import…).

## Mock data (block F)
- **Rex export summary:** counts (persona 212 words, instructions 188),
  face photo, knowledge 186 references · 2.3 GB, file name.
- **`Juno.agent.zip`** (valid): name, persona (164 words), instructions
  (120), icon, packed knowledge 48 MB, and the after-import map (C mock).
- **`Marcus.agent.zip`** (clash): a different Marcus (same name), so Keep
  both yields `Marcus 2`.
- **`Old coach.agent.zip`** (broken, old format), with its Details text.
- The demo panel (C14) offers these three files as draggable chips, since
  the prototype can't count on them being in Finder.

## Kept plain (no magic, checked)
Utility sheets, no motion · the map and the Palette never travel and say so · talks stay
here and say so · nothing is added before Import · replacing says exactly
what goes.

## Journey trace
UJ10 · 1 → F1 (one sheet, Export writes) · 2 → F1.3 done (outside the prototype). UJ11 · 1 → F2 drop
or File › Import… (valid F2.1 / broken F2.3) · 2 → F2.1 list, F2.2 clash →
F3 → D2 First words.
