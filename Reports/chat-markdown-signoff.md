# Chat markdown: Eraser sign-off

*Eraser, 2026-11-27. Branch `studio/build-the-safe-markdown-renderer-wire-it-82270a8f`, head `ce7ebd1`. Checked against `Reports/chat-markdown-roadmap.md` (Columbo).*

## Verdict: APPROVED

Sketcher's replies now show formatted text (bold, lists, code, quote, italics). No raw `**` or backtick shows, either on screen in WebKit or in the tests. There is one renderer, no new controls and no new colours.

## Goal

The user reads a Sketcher reply and sees the formatting, not markdown symbols, both live and after a reload.

## Step Count (reading a reply)

| # | Step | Before | Now | Mark |
|---|---|---|---|---|
| 1 | Send a message | 1 | 1 | Keep |
| 2 | Read the reply as it streams in | 1 | 1 | Keep |
| 3 | Mentally strip out `**`, backticks and `>` to find the label, file name or quote | 1 | 0 | **Cut** (the renderer does it) |
| 4 | After a reload, read the old replies (raw before, formatted now) | 1 + step 3 again | 1 | **Merge** (same renderer as live) |

**Count: 5 → 3.** No new click, button or choice was added. The cut is mental work, which is the step that matters most here (B2, B4, B5 in the roadmap).

## Roadmap checks

| Roadmap asks | Found | OK |
|---|---|---|
| Exactly one renderer | `git grep renderMarkdown` lists one definition (`markdown.js:225`) and one caller (`left-side.js:258`, `say()`). Live (`onText`, :270) and reload (`line(..., md)` from :201) both go through `say()`. No other parser exists in `src/`. | ✔ |
| DOM only, no `innerHTML` | `markdown.js` uses only `createElement`, `createTextNode`, `textContent` and `setAttribute`. The one `innerHTML` in the app is a fixed SVG in `creation-screen.js:408`, which has nothing to do with chat. | ✔ |
| User's own lines and app lines stay plain | `line('you', …)`, the waiting line, the error line (:277, class reset to `sketcher err`), "Yours…" and "Couldn’t keep it…" are all `textContent`. In WebKit, the check shows `Make me a **release** helper` exactly as typed. | ✔ |
| No extra controls | No copy button, no toggle, no "show raw". There are no new buttons in the diff. | ✔ |
| Styles stay quiet | Bold is weight 600 in `color: inherit`. Code and blocks use the same faint tint `rgba(232,239,224,.08)`. The quote is a 2px rule at .25. Links use the existing `--fly` accent. There are no new colours and no size changes, and headings become one bold line. | ✔ |
| Supported set only | Bold, italics, ol/ul, inline code, fenced code, quote and links. Tables, images, rules, strikethrough and HTML stay as plain text (tests). | ✔ |
| Watch-outs 1, 2, 4, 5, 7 | HTML and script stay literal (unit test plus WebKit `__pwned` false). Unsafe links include case, space, entity, data, vbscript, file and `//`. Every streamed prefix of both samples is tested. A long code line scrolls inside its own block (pre 963 > 332, and the log does not widen). The user's line is never formatted. | ✔ |
| No raw `**` or backtick for Release Coach | Unit test 1 plus WebKit check 7: on-screen `innerText` has neither. The counts are 3 strong, 1 ol, 3 li, 4 code, 1 quote and 1 em, exactly as the roadmap describes. | ✔ |

## Checks re-run (my checkout, detached at `ce7ebd1`)

- `npm test`: **245 pass, 1 skip, 0 fail** (the 19 renderer tests are included).
- `npm install --no-save playwright-core`, then `AGENT_CREATOR_HOME=<checkout>/.scratch-home PORT=3505 npm start`, then `node checks/left-side-check.cjs http://localhost:3505 --home .scratch-home`: **ALL PASS**. That covers Chrome parts 1–6 and WebKit part 7, which has 6 checks. Chrome quit once from outside during part 4, and the check's own fresh-visit retry carried on and passed.

## Watch later (not blocking)

1. **Links in the Tauri Mac shell** may do nothing (`target="_blank"`, no opener plugin). This is already a must-fix on Uncle Bob's shell/glass item, and Columbo is tracking it.
2. **Huge replies (watch-out 9).** The whole reply is re-rendered on every chunk. That's fine for normal replies, but no check measures a long pasted transcript yet. Add a timing check if Talk (Phase 2) brings long replies.
3. **Live streaming in WebKit** is covered by the unit prefix test and by both paths sharing `say()`. Check 7 seeds the chat and tests the reload path on screen. When the real engine check (`sketcher-chat-check.cjs`) runs, it should look for the same "no raw `**`" condition on the live answer.
4. **Phase 2:** Talk must import this same `markdown.js` and these same `.md` styles. If a second parser or a "simple" variant appears, it gets returned.

Signed — Eraser, APPROVED, 2026-11-27.
