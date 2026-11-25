# Jony: build notes (MAGIC-PASS)

Built from `magic-merlin.md` §3–6 and §9, against `research-columbo.md`.
Only `src/server/public/` changed. No server, creator or engine change.
Every motion has a still form under `prefers-reduced-motion: reduce`
(one list at the end of `magic.css`). No new button, link or route: each
moment points at a control that already exists.

Branch `studio/build-the-magic-into-the-real-app-rebuil-2345d803`, commits
`b946400`, `3edca56`, `1996093`, `2e0bd78` and the notes commit.

## The creation arc (f-creating-a-soul-the-magical-creation-mom)

| Beat | Built | Where |
|---|---|---|
| **Q1** Sketch opens on DNA until Keep, Profile after (narrow view too) | yes | `app.js` |
| **1** First line: `#empty.is-leaving` fades 180 ms, then hidden. Shimmer only on Instructions | yes | `app.js`, `magic.css` |
| **2** First draft: `.draft-field.first-sketch` warm wash 500 ms, once per agent; no `.updated` glow on the first draft; change line **First sketch · Instructions** | yes. Still form: 2 px accent bar for 2 s | `app.js`, `magic.css` |
| **3** Name: `#switcher-name.name-arrive` (fade + rise 3 px, 240 ms) after the fill, first name only; a rename is instant | yes | `app.js`, `magic.css` |
| **3 nice** Outline stroke drawing in | skipped: a plain outline is fine (Merlin) and saves a new SVG path | — |
| **4** Keep, in `app.js keep()` so real agents get it too: switch to Profile → faces `.fill-in` 300 ms → `#mode-talk.beckon` underline that stays until Talk opens; Keep card line **Say hello in Talk, at the top.** | yes | `app.js`, `block-a.js`, `block-b.js`, `index.html`, `magic.css` |
| **5** Demo line **(Demo) First words would be here.** removed; composer **Say hello to [Name]…** until the first send; mark **First words · [day Month]** fades in once above the first answer | yes (see note) | `block-d.js`, `components.js`, `magic.css` |
| **5 nice** Agent speaks first + held breath 400 ms | skipped: needs an engine call when Talk opens (new server data) | — |
| Coming back: `.card.just-kept` settles once on Home | yes | `block-a.js` |

**Note on beat 5 for real agents.** The mark is stored per agent
(`localStorage ac-first-words-<id>`) and only placed on a real, non-mock
first answer. Real-agent Talk answers are still "(Demo) … would answer
here" placeholders, so for real agents the mark stays dormant until Talk
gets a real route (engine + route work, out of my lane). Marking a
placeholder as First words would be a lie (W2). Demo agents show it.

## The other screens (f-make-the-whole-app-feel-much-more-magica)

| Moment | Built | Where |
|---|---|---|
| **H1** `.mark.ready.is-new` warm wash once, when Home first shows a Ready mark it hadn't shown before | yes | `block-a.js` |
| **H2** everything else on Home still | yes (unchanged) | — |
| **C1** `.switch-dot` on the other switch / narrow view label when a change lands in the hidden pane; sr label **DNA changed** / **Profile changed**; removed when opened | yes | `app.js`, `magic.css` |
| **C2** Streaming unchanged | — | — |
| **S1–S3** | S1 = Q1; S2 = D1; S3 unchanged | — |
| **T1** fix divider words **[Name] was redrawn · from what you said** | yes | `block-d.js` |
| **T1** "after your fix" mark on the next answer | skipped: needs per-answer state, and real Talk answers are still mocks. Worth it once Talk is real | — |
| **D1** toast **N files added to [Name]'s DNA** / **the DNA**, **Already in …**; toast rises 4 px 200 ms; still **new** mark on just-added file rows until DNA is next opened; overlay already instant (opacity only) | yes | `block-c.js`, `magic.css` |
| **D2** after a Home drop with no words: **N files are in the DNA. Now say who this is, in one line.**, chips hidden, placeholder **Who is this? e.g. my old coach, from his seminar notes** | yes | `app.js`, `block-b.js` |
| **E1** errors and empty states still | yes (unchanged) | — |

## §6 Quieting

- Shimmer only on Instructions: done.
- No `.updated` on the first draft: done.
- `.face.fill-in` 300 ms, at Keep, not at First words: done (the Talk
  outline-then-fill is gone; Talk uses the inked face).
- `.palette-band.bloom`: **skipped and removed end to end** (class, CSS,
  keyframes, `bloom` option in `paletteStrip`, the Set in `block-e.js`).
  The **Palette** menu item itself is left for Eraser to cut (a second home
  for "what it's made of").
- `.agent-born` ring: kept, plays after the switch to Profile.

## Skipped, and what it would need

1. Agent speaks first + held breath: one engine call on first Talk open.
2. Photo faces for real agents: server storage for a face file.
3. "after your fix" mark: real Talk answers first.
4. Real-agent First words mark: dormant until Talk has a real route.
5. Screen-reader one-time announcements ("First sketch ready", "[Name]
   kept", "[Name] is ready"): not added as separate live regions; the
   change line, Keep card and toast already land in polite live regions.
   Eraser to judge whether a dedicated line is needed.

## Changed files

- `src/server/public/magic.css`: MAGIC-PASS section (first-sketch,
  name-arrive, beckon, first-words, switch-dot, just-kept, ready wash,
  empty leaving, toast rise), bloom removed, reduced-motion list.
- `src/server/public/app.js`: Q1 default view, beat 1–4 sequencing, keep(),
  switch dots, waitForWords / clearWaitForWords.
- `src/server/public/app.css`: one rule removed (superseded by magic.css).
- `src/server/public/block-a.js`: beckon in the top bar, inked top-bar face,
  card settle and Ready wash once.
- `src/server/public/block-b.js`: Keep card / demo keep path, Home drop flow.
- `src/server/public/block-c.js`: drop receipt words, **new** on file rows.
- `src/server/public/block-d.js`: First words mark, composer words, demo line
  removed, redrawn words.
- `src/server/public/block-e.js`: palette bloom removed.
- `src/server/public/components.js`: `paletteStrip` bloom option removed,
  `outlineFace` export removed.
- `src/server/public/index.html`: `.keep-next` line.
