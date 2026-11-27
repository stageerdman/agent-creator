# Chat markdown: Eraser's clutter check and sign-off

*Eraser, 2026-11-27. Checks Jony's commits `5fc46af`, `d636b58` and `ce7ebd1` against `Reports/chat-markdown-roadmap.md` (Columbo).*

*Note: an earlier Eraser pass on `ce7ebd1` (main `4a3b88f`) APPROVED it and listed Mac-shell links as "watch later". This later pass is stricter and makes links (F1) and the `>` check (F2) part of "done". It replaces the earlier text.*

## Verdict: RETURNED (2 small fixes for Jony)

The formatting is clean, lean and quiet. There is one renderer, there are no new controls, and the Release Coach sample shows no raw `**` or backtick in WebKit. Two things from the roadmap's "Done means" list are not covered yet. Both are small. Jony owns the fixes; I re-check and sign once they are in.

## Goal

The user reads Sketcher's reply and finds the bold label, the numbered item, the file name and the voice quote at a glance, with no raw symbols in the way.

## Step count (reading a reply)

| # | Step | Mark | Why |
|---|---|---|---|
| 1 | Send a message (already exists) | Keep | Unchanged. |
| 2 | Read the reply as it streams, formatted | Keep | Same `say()` runs on every chunk and on reload. |
| 3 | Scan bold, list numbers, code names, quote | Keep | This is the goal. |
| 4 | Click a link (rare, B13) | **Fix** | In the Mac app the link may do nothing. See F1. |

**Current: 3 steps on the common path, plus 1 broken step on a rare path. Target: the same 3, and the rare link opens the browser in one click.** No step was added: there is no copy button, toggle, "show raw" switch or new icon.

## The four checks

| Check | Result | Evidence |
|---|---|---|
| **One renderer, no second way** | Pass | `renderMarkdown` lives only in `src/server/public/markdown.js:225`. Its only caller is `left-side.js:258` (`say`), which is used for live chunks (`:270`) and history after a reload (`:201`, through `line(..., md)`). No `innerHTML` on reply text (the only `innerHTML` in `public/` is a fixed SVG in `creation-screen.js:408`). No other parser or "simple" variant exists. User lines and app lines stay `textContent` (`:261`). |
| **No extra controls** | Pass | No copy buttons, icons, toggles or headings-as-big-type. The roadmap's left-out list (tables, images, rules, strikethrough, HTML) all stay plain text, and there are tests for each. |
| **Quiet styles that match the app** | Pass | `new-agent.html:149-162`: bold is weight 600 in the same colour. Code is monospace on `rgba(232,239,224,.08)`. The quote is a 2 px rule at `.25`. Links use the app's own `--fly` accent, underlined. No new colours, no size changes. Long code scrolls inside its block. |
| **No raw `**` or backtick (Release Coach)** | Pass | Unit test "Release Coach sample: no ** or backtick survives" passes. WebKit check 7 passes on screen (3 bold, 1 list with 3 items, 4 code, 1 quote, 1 italic). The user's own `**release**` stays plain. |

## Runs

- `npm test`: **245 pass, 1 skipped** (the live-AI test), 0 fail.
- `node checks/left-side-check.cjs http://localhost:3505 --home .scratch/eraser-md` (Chrome steps 1-6, WebKit step 7): **ALL PASS**. Long code: block scrollWidth 963 > clientWidth 332, and the log did not widen (396 = 396). `<script>` stayed text, with no script node.

## Fixes for Jony

**F1. Links must open in the default browser from the Mac app (roadmap watch-out 3 and open question 1).**
`markdown.js:131` sets `target="_blank"`, but the Tauri shell (`src-tauri/src/main.rs`) has no navigation or new-window handler, and no opener. In a Tauri WebKit window a `_blank` link either does nothing (a dead link, which breaks "no dead UI") or isn't proven to work. Nobody has answered the open question, and no check covers it.
*Done means:* clicking an `https:` or `mailto:` link in the **built Mac app** opens the default browser or mail app, and the chat stays on screen. Write down how you checked it (in your notes or as a check). Use the smallest fix you can: one handler in the shell, not a new page-side control.

**F2. The WebKit check must also prove there is no `>` at the start of a visible line.**
The roadmap's "rendered well" asks for "zero `**`, zero `` ` ``, zero `>` at a line start". Check 7 tests the first two only (`checks/left-side-check.cjs`, the `coachText` assertion). Add `!/^\s*>/m.test(r.coachText)` to that check.

## Watch later (not blockers)

- **Huge replies (watch-out 9).** The whole reply is re-rendered on every chunk. No one has timed this with a long echoed paste in WebKit. If Talk (Phase 2) brings longer replies, measure it then.
- **Streaming on screen.** WebKit checks the reloaded history. Streaming is covered by the unit test "every streamed prefix… never shows a broken tag", through the same `say()`. That's enough for now. A real-stream WebKit pass would be stronger.
- **Phase 2.** When Talk returns, it must import this same `renderMarkdown` and reuse the `.md` styles. A second parser or a per-screen variant gets returned.

## Sign-off

*Pending F1 and F2. Eraser re-checks and signs here.*
