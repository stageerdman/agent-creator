# Build notes (Jony): the condensed spec I build from

Condensed from blocks-jony.md and design-jony-block-A..F.md after the cuts,
so the build doesn't re-read the long files.

## Data (src/server/mock/demoAgents.mjs, served by GET /mock/demo)
Agent fields: id, draft{name,persona,instructions,status}, keptAt,
face{kind photo|icon|letter, src, iconOptions[3]}, moreIcons[3], photoOffer (Edie),
firstWords{line,at}, openedAt, importedFrom, references{root,total,size,
files[{id,name,folder,kind,size,pile knows|sounds,ease,easeReason}],
groups[{id,name,pile,kind,count,size,unit}], aside[{name,reason}], packed?, flat?},
study (Ines seeded: studying, listening, current, done 251, total 298, etaMin 25,
resumed, corrected, firstImpressions{draft,map}), run (Ines), map[{id,level,text,
refs[SourceRef{fileId,location,passage,words,span}],short?,roughReason?,topic?}],
likeness{reasons[{good,text,ref}],example{text,ref},rating}, likenessAfterMoney (Rex),
traits[{id,label,value,sketchLine{1..5}}], palette[{id,label,detail,colour,share}],
talks[{id,title,updatedAt,messages[{role,text,sources?,ownView?,blankLineId?,planted?,divider?}]}].
Ines extra: finalMap, finalDraft, voiceSample, gapAnswer, finalLikeness.
demo.scripts[agentId] = [{id,ask,match[],reply,fixed?,needs?,before?}], scripts.continued['rex-t2'];
demo.fixes.rex{open,example,reply,patch}; demo.sketcherLines; demo.pickerFiles
{folders,topUps,broken,photos}; demo.imports; demo.extras{moneyFile,moneyRef,rexMoneyAfter}.

Ines counts: 312 files · 38.4 GB. Before the correction: knows 267 (Books 3,
Transcripts 120, Notes 116, Live Q&A 18, Bonus 10), sounds 41 (Course), aside 4.
After "Skip Bonus. Her voice from the Live Q&A only.": knows 280, sounds 18, aside 14.
298 to study; finish = 297 studied · 15 set aside (Day 2 – Part 4.mp4 damaged).
(The design said 297/296; the groups add up to 298/297, so the build uses those.)

## Screens and words
- Top bar: `Agent Creator` (a link home inside an agent) › face 24 + name ▾ (menu:
  Palette (only once named) · Export [Name]… (only once kept) · ─ · Delete [Name]…) ·
  Studying line button · `[ Talk | Sketcher ]` (only once kept) · `Demo` pill.
- Demo popover: Skip time ▸ · Claude reachable on/off · Start UJ2 fresh · Show mock
  values · Reset demo · import chips Juno.agent.zip / Marcus.agent.zip / Old coach.agent.zip.
- Keys: ⌘N New talk · ⌘⇧N New agent · ⌘1/⌘2 · ⌘↑ Home · ⌘F search · ⌘E export ·
  ⌘⇧I import · Esc.
- Opening at launch: 0 → A2 · 1 → that agent · 2+ → Home. Going home on purpose is always Home.
- A1 Home: cards (kept/imported) sorted by latest talk; face 72, name, top Sharp
  `short`s joined by " · " (else the persona's first sentence), `Last: [title] · [when]`
  (its own link, continues that talk). One mark at most: `new here` > `Ready` > Studying line.
  `Sketches` (heading only if there are agents too): outline face, name or
  `Untitled sketch`, status. Dashed card `+ New agent` / `one line, or drop a folder`.
- Drop overlay: `Drop · your files stay on this Mac` / `Claude reads them to study` /
  `for a new agent` | `adds to [Name]` | none on A2. `.agent.zip`: `Drop · import this agent`.
- A2: P2 empty state + the references door (no ＋ while the door shows).
- A3: `Delete Rex Hart?` · counts · `Your files on this Mac aren't touched.` ·
  (`Studying stops.`) · `This can't be undone.` · Cancel has focus · `Delete Rex Hart`.
- B: chip `References · [root]` / `312 files · 38.4 GB`; `Laying out…`; piles in
  `What [Name] knows`; `Set aside · n · why ▸`; `About 40 min to study · you can close the app, it keeps going`;
  `Start studying`; study block; `Stop` → `Stopped · … · Study the rest`; `Picked up where it left off`;
  `Studying paused · Claude isn't reachable · Check again`; `Finished studying · 297 references studied · 15 set aside ▸`;
  Keep card with the C8 box and `Talk to [Name] →`.
- C: map rows, refs expand in place, passage panel (`← What Rex knows`, `Behind: …`),
  `Add a reference for this`, Likeness (number last), References (hard first, piles, Remove).
- D: Talk with Where from / own view / Blank strip / `Not Rex`; First words; Past talks
  with search, rename, delete; fix panel `Sketcher · fixing Rex`; dividers.
- E: one-pile top-up, the map moves (`was Blank`, quiz link), Remove + Undo, Face sheet, Palette.
- F: Export sheet (Packed / Stays here / Desktop · Change… / Exported · Show in Finder),
  Import sheet, name clash (`Keep both` → `Marcus 2`, Replace line always shown), broken file.
## Details that matter
- Sketcher right header: `[ Sketch | What [Name] knows ]` (`What it knows` before a name;
  `Sketching…` during a turn) + Keep only until keptAt. Face slot 48 px left of Name → E4.
- B1: a message that is only a path (`/…`, `~/…`) = references; unknown → `Can't find ~/x. Check the path.`
  Installers folder → `Nothing here Agent Creator can read. It reads text, PDF, Word, Markdown, audio and video.`
- B2 placeholder `Say what to change, like "skip Bonus"…`; change line `Split: 18 recordings moved to
  How Ines sounds · 41 videos moved to What Ines knows · Bonus set aside ↗`; "go/ok/start" → pressStart.
- B3 lines: `Studying · [file] ([stage]) · 251 of 298` / `about 25 min left · listening is the slow part ·
  you can close the app, it keeps going` + Stop. Palette strip small + `stand-in look`. First impressions
  heading `What Ines knows · first impressions · from 20 of 298`, rows at 60%; `Likeness comes when studying
  is done.`; `First impressions after about 20 files.`; field tag `first impressions`; change line
  `Sketch: name and persona updated`. Skip time: → 20 → each palette group → finished.
- B4: map arrival fade Sharp → Rough → Blank 80 ms, once per batch. Chat: inesFinished + voice card
  (caption `sample, from the current sketch and her references`, `Where from · Live Q&A 7.mp3 · 03:10`)
  + `Sketch: persona and instructions updated`; face slot icon 1 tag `new` + inesFaces line; Home `Ready`;
  later `297 references · studied 25 Nov`. Placeholder `Ask about any line, like "why Rough on pricing?"…` → gapAnswer.
- B6 Keep card: C8 box `What Ines knows · only you see this` (top Sharp, one Rough, one Blank; whole box is a
  button) · `Talk to Ines →` → Talk D2; the mode switch appears. B7: `Marcus knows only what's in the Sketch.
  Add references to teach him more.` + `Add references` (box not a button).
- C: row `Sharp  text  5 refs ▸`; Rough 1 ref shows roughReason; marks `was Blank`,
  `was Sharp · now Rough · after removing "Old seminar 2009.mp4"`. Likeness ✓/– with ref links,
  `Example: "…"`, `8 of 10` (` · was 8`). `References · 186 · 3 hard to study ▸`. Remove tooltip
  `Rex stops using it. The file stays on your Mac.` C3 (Marcus) + `Add references` filled.
  Juno: `Packed knowledge from Juno.agent.zip · 48 MB`, no Likeness.
- D: stream 400 ms then ~40 chars / 50 ms. `Where from · file · loc` links → passage (✕, `Used in this answer`);
  `Rex's own view · no reference`; `Blank in what Rex knows · Add a reference for this`; `Not Rex`
  (latest always at 60%, older on hover; aria `Not Rex: fix this answer`). Unknown text →
  `(Demo) Rex would answer here. Try one of:` + chips that type the ask (data-mock).
  Divider `Rex was redrawn · persona updated` (click → `+ patch` and `See the Sketch ↗`); `First words · 25 Nov`.
  First words: outline face fills in (600 ms) while the line streams; typing cancels; offline → nothing.
  Past talks: `Past talks` + `New talk`; `Search past talks` (≥ 3 talks); `No talks with "x".`;
  when = today / yesterday / weekday / `18 Nov`; ⋯ Rename / Delete… (`Delete "title"? The talk goes. Rex stays as he is.`);
  `Your talks with Rex will be here.` Fix panel: `Sketcher · fixing Rex ✕`, pinned `Rex: "…"`, fixes.rex.open,
  `Say what's wrong…`, reply + `Sketch: persona updated · from your talk ↗`; Sketcher chat divider
  `From your talk · "How do I get started…"`; close → redrawn divider after the wrong message +
  composer prefilled with the question. Offline: `Rex can't reach Claude right now.`
- E1: chip `References · Money Has Rules.pdf · 1 file · 4 MB`; `Studying Money Has Rules.pdf. It goes into
  what Rex knows, under money.`; `Finished studying · 1 reference studied`. E2: moved line first, `was Blank`,
  `Ask Rex about it: "What's the first rule of money?"` (new talk, typed not sent), `9 of 10 · was 8`,
  `I studied Money Has Rules.pdf. Money is no longer Blank.` + `What Rex knows: Money and investing, Blank → Sharp ↗`.
  Marcus: `Studying 4 references. They go into what Marcus knows.` E3: `Removed. Rex no longer uses
  "Old seminar 2009.mp4". · Undo`; rex-promise Sharp → Rough; `References: removed "…"` / `put back "…"`;
  old talks show `name · removed`. E4: `Rex's face`, 3 × 96 radio (current first), `Draw three more`
  (`Drawing…` 800 ms), `Use a photo…`, `or drop a photo here`, Cancel / Use (disabled until changed);
  change line `Face: new photo`. E5: `Palette · what Rex is mixed from · 186 references, 4 traits ✕`, band 48 px,
  segment titles, bloom once, trait radios + sentence; change → user message `Directness: 4 → 5` +
  `Sketch: persona updated ↗`.
- F1: `Export Rex Hart`; Packed dl (Name, Persona n words, Instructions n words, Face, Knowledge
  `from 186 references · 2.3 GB` | `none, only the Sketch` | `from 251 of 298 references so far` +
  `Studying isn't finished. The file has what's studied so far.`); Stays here; `One file: Rex Hart.agent.zip ·
  about 2.3 GB`; `Desktop · Change…`; Export → `Exporting…` → `Exported · Rex Hart.agent.zip` + Show in Finder / Done.
  F2: `Import Juno?` + `Nothing is added until you press Import.` → Home, `new here`. Clash: `You already have Marcus.`
  Replace Marcus / Keep both (→ `Marcus 2`) + `Replace: your Marcus and his 3 talks go. This can't be undone.`
  Broken: `Can't import Old coach.agent.zip` / `This file can't be opened. It's from an older version of Agent
  Creator, or it's damaged.` / Details ▸ / OK.
- Seeded Juno exists, so importing Juno.agent.zip shows the clash sheet; the valid sheet shows after deleting Juno.
- Never shown: Couldn't be read, Imported from [file], Change face…, See what [Name] knows,
  Add more on this, Library, Settings.
