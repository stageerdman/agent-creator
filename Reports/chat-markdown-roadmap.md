# Chat markdown: phased roadmap and how people read AI replies

*Columbo (UX research), 2026-11-27. Item: "Render markdown in every AI chat". Requirement F8 in `Reports/requirements-audit.md`. No code in this file.*

## Summary

Sketcher's replies come in as plain text, so people see `**`, `1.` and backticks instead of bold, lists and code. People don't read these replies line by line. They **scan** them: the bold label, the list, the file name in code, and the "press Keep" line. Raw symbols break that scan, and the creator prompt *asks* for markdown (a bold-named blockquote for every voice sample, `creatorPrompt.mjs:22-23`).

**Phase 1 (now):** one safe renderer, `src/server/public/markdown.js` → `renderMarkdown(doc, text)`, used for every Sketcher line on the Left Side.
**Phase 2 (later):** Talk and any other AI-text screen reuse that same renderer. Nothing new gets invented.

We support exactly **bold, italics, numbered lists, bullet lists, inline code, code blocks, quotes and links**. Everything else stays plain text.

## Scope

**In (Phase 1, now):** the creator chat on the Left Side (`new-agent.html` + `left-side.js`). Today this is the only screen in the app that shows AI text. Every Sketcher line goes in through `textContent`, in three places:
- `left-side.js:255`, the `line()` helper. It is used for live replies, and for the **chat history redrawn after a reload** (`:200`). That history must come back formatted too, not raw.
- `left-side.js:262`, `onText`, which runs on every streamed piece of the reply.
- The fixed app lines (`:269` error, `:278` "Yours…", `:279` "Couldn't keep it…") are app words, not AI text, and stay plain.

The user's own lines (`you`) stay plain text. People expect to see exactly what they typed.

**Out, and why:**
- **Talk with an agent (G4)** and **Profile/DNA (G1, G2).** These were deleted in `793c876` (Nov 26), so there is nothing to render into yet. That work is Phase 2.
- **The editable draft fields** (name, persona, instructions). The user types into them by hand, so they stay plain editable text and are never rendered.
- **A copy button, tables, images, big headings.** See "Left out on purpose" below.

## Phased roadmap

| Phase | When | What | Done means |
|---|---|---|---|
| **1. Creator chat** | now (Jony builds, Eraser signs) | `markdown.js` exports `renderMarkdown(doc, text) → DocumentFragment`, built from DOM nodes only. `left-side.js` uses `el.replaceChildren(renderMarkdown(doc, text))` for Sketcher lines, both live (`:262`) and in history (`:255` via `:200`). There are quiet styles for the 8 elements, unit tests, and a WebKit check. | The sample below shows no `**` and no backtick in WebKit, while streaming and after a reload. Every element meets "rendered well" (below). Every item on the watch-out list is covered by a test. |
| **2. Every other AI-text screen** | once Talk (G4) or any other AI-text screen comes back | That screen calls the **same** `renderMarkdown` with the **same** styles. No second parser, no "simple" variant, no per-screen rules. If a screen needs something new (say, tables), it is added to `markdown.js` once, for every screen, after research shows people need it. | `markdown.js` stays the only place AI text is turned into formatting (Eraser's clutter check). The Phase 1 tests pass unchanged. |
| **3. Only if asked** | not planned | A copy button on code blocks, or tables. Only if real use shows people copy code or get tables often (see the behaviour table: both are rare today). | n/a. The design rules say no placeholders and no dead UI. |

## How people read AI replies (behaviour table)

Scores go from 1 to 10. **L** is how likely people are to do it, **F** is how often. Sorted by L+F.

| # | Behaviour | L | F | Reason |
|---|---|---|---|---|
| B1 | **Read while it streams in** | 10 | 10 | Every reply streams (`onText` on each chunk). People start reading at the first words, and they don't wait. |
| B2 | **Scan bold labels to find their part** (`**Files:**`, `**Persona:**`) | 9 | 9 | People skim chat replies, read the bold first and skip the rest. Bold is how Sketcher signposts. |
| B3 | **Read the voice sample quote** (`> **Release Coach:** …`) | 9 | 8 | The prompt asks for it whenever Sketcher shows how the agent sounds. It's the "is it really them?" moment, so the most-read lines. |
| B4 | **Scan a numbered list and answer by number or "ok"** | 8 | 8 | Sketcher gives 1-2 questions with suggested answers, often numbered. People answer "2" or "ok", which only works if the numbers show. |
| B5 | **Match a file name in code to the files on screen** (`note.md`, `changelog/`) | 8 | 7 | File routing is a core job. People check "did it put *my* file where I meant?". The name has to stand out and match exactly. |
| B6 | **Read a bullet list of what changed** | 7 | 7 | After an edit, people look for "what did it change?". Bullets are the usual shape. |
| B7 | **Re-read earlier replies after reopening or reloading** | 7 | 6 | History is kept (F9). People come back later and scroll up to remember. Raw history next to formatted new replies would look broken. |
| B8 | **Notice an italic word** (*no*, *only*) | 6 | 6 | Sketcher uses it for soft emphasis. A stray `*` mid-sentence reads like a typo. |
| B9 | **Read in a narrow panel or small window** | 6 | 6 | The panel is a side strip. Long lines and wide blocks must not push it wider. |
| B10 | **Select and copy a file name or phrase** | 6 | 4 | To paste into the Sketch or Finder. Normal text selection must keep working, with no symbols copied along. |
| B11 | **Paste long text that already has markdown or HTML, and see it echoed** | 5 | 3 | The prompt invites pasting notes and bios (rule 10). Quotes from it can come back in the reply. |
| B12 | **Copy a whole code block** | 4 | 3 | Sketcher has no tools and rarely writes code. It only happens when someone asks for a snippet or a prompt. Kept low on purpose. |
| B13 | **Click a link** | 3 | 2 | Sketcher has no web access, so links are rare: mostly an echoed URL the user pasted. |
| B14 | **Expect a table or heading to look like a document** | 3 | 2 | Short, warm replies (rule 11) seldom carry tables or headings. When one appears, plain but tidy is enough. |

**Assumptions:** these scores come from the creator prompt, the Left Side research (`Reports/left-side-behaviours.md`) and how people commonly use ChatGPT- and Claude-style chats. They don't come from watching our own users. Where I was unsure I took the lower score (B10, B12, B13).

## Deep dives (both scores 7 or more)

### B1: Read while it streams in
- **Moment:** at the desk, on a laptop, right after pressing Enter. Their eyes are already on the reply area.
- **Thoughts:** "Did it get what I meant? … ok, it's naming it… what's it asking me?"
- **Emotions:** a little curious before. Calm or jittery during, depending on whether the text stays still. Relieved when it settles.
- **Expectations:** words appear at once and *stay put*. Text that jumps, flashes or rewraps every chunk is tiring to read.
- **Friction and fears:** a lone `**` that flashes for a moment and then turns bold. A half-done `[text](` showing as junk. A list that renumbers or a block that changes shape mid-read. A reply that scrolls away while they read it.
- **Insight:** half-finished markers show as plain characters. They only turn into formatting once the closing marker arrives, so the switch is one small change and never broken formatting. An open code fence (```` ``` ```` with no end yet) shows as a code block that grows. Each chunk replaces the whole reply, so the result after the last chunk must be exactly what a reload shows.

### B2: Scan bold labels
- **Moment:** a reply of 4-8 lines has just finished. The person wants one thing from it, like "where did my files go?".
- **Trigger:** they dropped files or asked a question. They hunt for the label.
- **Thoughts:** "Files… there."
- **Expectations:** bold is clearly heavier than the text around it, in the same font and colour. They find it in under a second.
- **Friction:** `**Files:**` shown raw. Bold so loud or so colourful that it looks like a button.
- **Insight:** bold is a weight change only. No colour change, no size change.

### B3: Read the voice sample quote
- **Moment:** the most important line of the session. They judge whether this agent sounds like the one in their head.
- **Thoughts:** "Would Release Coach really say that? Yes… almost."
- **Emotions:** hope, then recognition or doubt. This is the emotional peak of the Left Side.
- **Expectations:** the sample looks like *someone else speaking*. It's set apart from Sketcher's own words, with the agent's name in bold at the start.
- **Friction:** a `>` at the start of the line makes it look like code or an email reply. If the quote merges into Sketcher's text, they can't tell who is talking.
- **Insight:** the quote is a thin left rule plus a gentle indent, with the bold name kept inside it. A quote that runs over several `>` lines stays one block.

### B4: Scan a numbered list and answer by number
- **Moment:** Sketcher asked "Which one? 1. … 2. …". The person's hand is already on the keyboard.
- **Thoughts:** "Two. Type 2."
- **Expectations:** the numbers are the ones Sketcher wrote, so their "2" means Sketcher's item 2. The list is indented like a normal list, and long items wrap under their own text, not under the number.
- **Friction:** a list that restarts at 1 after a code span or a blank line. A list that starts at 3 but shows 1.
- **Insight:** keep the start number the author wrote. Items split by a blank line still count as one list.

### B5: Match a file name in code to the files on screen
- **Moment:** just after a drop, with the files on the right side lighting up.
- **Thoughts:** "`note.md` → instructions. Good, that's the one I meant."
- **Expectations:** the name looks like a name, in monospace on a faint tint, and matches the file letter for letter (dots, slashes and underscores kept). They can select it and copy just the name.
- **Friction:** the backticks themselves get copied. `my_file_v2.md` gets mangled by italics (`_` read as emphasis). A slash path breaks the line in the middle of the name.
- **Insight:** inside code nothing else is parsed. Underscores inside words are never italics. A code span doesn't wrap mid-name unless it's too long for the panel.

### B6: Read a bullet list of what changed
- **Moment:** after asking for an edit ("make it warmer").
- **Thoughts:** "What did it actually change?"
- **Expectations:** a short list with bullets and normal indents, tight spacing, nothing that looks like a form.
- **Insight:** `-`, `*` and `+` all make bullets. One nested level indents. It's the same element as numbered lists, just a different marker.

### B7: Re-read history after a reload
- **Moment:** the next morning, they open the agent again, open the panel and scroll up.
- **Expectations:** yesterday's replies look exactly as they did live.
- **Friction:** new replies formatted but old ones raw (`:200` → `:255` still `textContent`). That would look like a bug, and like the app forgot.
- **Insight:** the history path uses the same renderer. It's the same function in one place.

## What we support, and what "rendered well" means

| Element | Written as | Rendered well means |
|---|---|---|
| **Bold** | `**x**` (also `__x__`) | Heavier weight, same font, colour and size. No markers left. A lone `**` stays as typed text. |
| **Italics** | `*x*`, `_x_` | Slanted, same colour. `snake_case_names` and `2 * 3 * 4` are never italic. A lone `*` stays as text. |
| **Numbered list** | `1.` / `1)` | Real numbers in a normal indent. Keeps the author's start number. Wrapped lines line up with the text, not the number. Items split by blank lines stay one list. |
| **Bullet list** | `-`, `*`, `+` | Small bullets in a normal indent with tight spacing. One nested level indents further. |
| **Inline code** | `` `note.md` `` | Monospace on a faint tint with small padding, same text colour. No backticks shown or copied. Nothing inside is parsed (`**` inside stays `**`). |
| **Code block** | ```` ``` ```` fences, optional language word | Monospace on the same faint tint, small rounded box. Whitespace kept exactly. **Long lines scroll sideways inside the block.** The panel never gets wider. The language word isn't shown as text. While open (streaming) it shows as a growing block. |
| **Quote** | `> ` | Thin left rule and an indent, same text colour (at most a touch softer). Several `>` lines make one block. Bold, italics and code still work inside, so `> **Release Coach:** …` shows a bold name in the quote. |
| **Link** | `[text](https://…)`, bare `https://…` | Looks like a link (underline or the app's accent). Opens **outside the app** in the user's default browser, with `rel="noopener noreferrer"`. Never navigates the app window away from the chat. Only `http:`, `https:` and `mailto:`. Anything else shows as plain text. |
| Paragraphs and line breaks | blank line / single newline | Paragraphs get a small gap. A single newline inside a paragraph stays a line break, because people write chat that way and expect it. |

## Left out on purpose

- **Tables.** They're rare in short chat replies (B14). They don't fit a narrow side panel, and they're the hardest part to stream without jumping. The `|` lines stay as plain text.
- **Images** (`![alt](url)`). Sketcher has no tools, so it can't have a real image. Loading a remote URL would quietly contact an outside server from a private app. The line stays as plain text and nothing loads.
- **Headings drawn as big text** (`#`, `##`, `###`). Big type turns a chat bubble into a document and shouts louder than the voice sample. The heading's words show as **one bold line** (the `#` marks removed), because a raw `###` would be just as broken as a raw `**`.
- **Also plain text:** horizontal rules, strikethrough, task boxes, footnotes, raw HTML, maths. None of these are part of Sketcher's job, and each one is more code to keep safe.

## Watch-out list (low likelihood, high harm)

1. **Raw HTML or a script in a reply** (`<script>`, `<img src=x onerror=…>`, `<b>`). Show it as literal text, exactly as written. Never run it and never use `innerHTML` on reply text. It can arrive through B11: the user pastes something and Sketcher quotes it.
2. **`javascript:` links**, including the tricks: `JaVaScRiPt:`, leading spaces, `java&#115;cript:`, `data:`, `vbscript:`, `file:`. Allow-list `http`, `https` and `mailto` after trimming and lower-casing. Anything else is plain text, not a dead link.
3. **Links that leave the app.** In the Mac app's window a normal link could replace the chat page. It must open in the system browser. **Open question for Jony:** how the Tauri shell hands this off.
4. **Half-finished `**`, `` ` ``, `[`, ```` ``` ```` while streaming.** They show as plain characters until closed and never break the rest of the reply (B1). The final render equals the reload render.
5. **Very long code lines or unbroken strings** (long URLs, base64, paths). Code scrolls sideways inside its block. Long words in normal text wrap (`overflow-wrap: anywhere`) so they never widen the panel.
6. **The hidden `<draft>{…}</draft>` block** (A7) is removed on the server (`src/creator/creatorReply.mjs`) before the text reaches the page. The renderer must not be the thing that hides it. If it ever leaks, it shows as plain text, which is a visible bug, not hidden behaviour.
7. **Formatting the user's own line.** Never. A user who types `**x**` sees `**x**`. Their words are evidence, and the witness must see what they wrote.
8. **Look-alike link text** (`[apple.com](https://evil.example)`). This is low risk because Sketcher has no web access. Opening outside the app, in a browser that shows the real address, is enough for now.
9. **Huge replies** (a pasted transcript echoed back). The whole reply is re-rendered on every streamed chunk, so it must stay fast and not stutter the panel's motion. Eraser should watch this in the WebKit check.

## Test sample (Release Coach)

**Reconstruction, not the user's original text.** The real reply isn't stored anywhere in the repo, and the orchestrator doesn't have a copy either. This version keeps the three things we know were in it: a bold **Files:** label, a numbered list and `` `note.md` `` in inline code. It also follows the creator prompt's real shape: a bold-named voice quote and the one "press Keep" line. Swap in the user's own text if they send it.

~~~~text
I've sketched **Release Coach**: a calm helper that turns your merged changes into clear release notes.

**Files:**
1. `note.md` → instructions (it shapes how Release Coach writes)
2. `changelog/` → rag (it looks things up there when it answers)
3. `screenshots/` → not routed yet

Here's how it might sound:
> **Release Coach:** Three fixes and one new button this week. Lead with the button: that's what people will notice.

Should `screenshots/` go to rag too? I'd say *no*, since they're images. If that's Release Coach, press Keep.
~~~~

**Rendered well, for this sample:** "Release Coach" and "Files:" are bold. The list shows 1-3 as real numbers. `note.md`, `changelog/` and `screenshots/` are code with no backticks. The quote has a left rule with a bold "Release Coach:". "no" is italic. The arrows `→` stay. **Zero `**`, zero `` ` ``, zero `>` at a line start** in the visible text. The same result comes live, after each streamed chunk has settled, and after a reload.

**Edge sample** (for the tests, beside the one above):

~~~~text
- one bullet with my_file_v2.md and 2 * 3 * 4
- second bullet

```js
const veryLongLineThatMustScrollSidewaysInsideItsOwnBlockAndNeverWidenThePanel = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
```

### Next step
Read [the guide](https://example.com/guide) or mail [us](mailto:hi@example.com).
<script>alert(1)</script> <img src=x onerror=alert(1)>
[click me](javascript:alert(1)) [also](  JaVaScRiPt:alert(1))
Half-streamed: **not closed yet and `open code
~~~~

Expected: two bullets, with `my_file_v2.md` and `2 * 3 * 4` unchanged. One code block that scrolls sideways. "Next step" as a bold line, not big. Two working links (https, mailto). The script and img tags as literal text, with no script node and no img node. Both javascript links as plain text, with no `<a>`. The last line keeps its `**` and `` ` `` as typed characters.

## Key insights

1. People **scan** replies. Bold, list numbers and code file names are the handholds, so these are the elements that matter most.
2. The **voice quote** is the emotional peak of the Left Side, and the prompt already asks for it. The quote style carries real weight.
3. **History must match live.** Both go through one renderer (`:255` and `:262`).
4. **Streaming is the normal case,** not an edge case. Unfinished markers stay plain, and the final render equals the reload render.
5. **Quiet is right.** These are weight, slant, a tint and a thin rule in the app's own font and colours. No new colours, no copy buttons, nothing that looks clickable except links.

## Open questions

1. **Links in the Mac app:** how does the Tauri shell open them in the default browser? (Jony)
2. **The real Release Coach text:** if the user can share it, it replaces the reconstruction as the test sample.
3. **Copy button on code blocks:** left out for now. Revisit only if Phase 2 (Talk) shows people copying code often.
