# REQUIREMENTS AUDIT: every user requirement vs. the app on main

Audited by Columbo on 2026-11-27, against main `544f761`. My only commit on top is the audit notes. I changed no app code.

## Count

| Total | Met | Partly | Missing |
|---|---|---|---|
| 80 | 59 | 7 | 14 |

*After Eraser's review: 82 rows, of which two are duplicates and are not counted (G10 is the same as C6, and G3 is folded into G1/G2). One row is new (C9). Columbo's first count was 81 = 60 / 7 / 14.*

## How I checked

- `npm test`: **226 pass, 1 skipped (live CLI), 0 fail**.
- I ran the bare server from main with a scratch home: `AGENT_CREATOR_HOME=.tmp-test/audit-home PORT=3505 npm start`.
- `node checks/left-side-check.cjs http://localhost:3505 --home …`: **ALL PASS**. It covered: the handle after a drop; opening with click, Enter and Space; closing with Esc and ‹; focus going back to the handle; the likeness getting brighter at 25/50/100 % (lit pixels 6 → 182 → 264 → 668); Reduce Motion; the small screen; no page errors. It ran in Chrome (the script's default). I did not run a separate WebKit pass, so Eraser should do one.
- I read the code for anything a check does not cover. Each file:line is listed in its row.
- **Big finding:** commit `793c876` (2026-11-26) deleted `index.html`, `app.js`, `app.css`, `magic.css`, `components.js`, `block-a…f.js`, `sketch.js`, `tab-focus.js` and `glade-fireflies.html`. Main now has three pages: `agent-home.html` (home), `new-agent.html` (/new: build and creation), `agent-page.html` (/agents/:id). Several features still marked *shipped* (Sketch Profile/DNA switches, Talk, Know, Identity, Share) were built on the deleted screens and **are not in the app any more**. I judged them as missing, whatever the old sign-offs say.

Owners: **chat-formatting item**, **glass-window item**, or a Magic UX member: **Jony** (design and build), **Merlin** (magic), **Eraser** (review), **Columbo** (research).

---

## A. Engine and data (CLAUDE.md, INIT, AI-ENGINE, AGENT-CREATOR v1)

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| A1 | AI runs through the user's local `claude` CLI, no API key | CLAUDE.md, AI-ENGINE update v1 | met | tests: `args: -p -- <message> is always last`, `resolveBinary`, `checkCli reports version` | — |
| A2 | User's own MCP servers never loaded (`--strict-mcp-config`) | AI-ENGINE v1 | met | test `args: the user's own MCP servers are never loaded` | — |
| A3 | Streaming answers (SSE), cancel kills a hung CLI | AI-ENGINE v1 | met | tests `POST /api/ask streams deltas`, `askAgent: aborting kills a hung CLI` | — |
| A4 | Clear state when the CLI is missing | AI-ENGINE v1, AGENT-CREATOR v1 | met | tests `a missing CLI is an error event with kind not-installed`, `GET /api/health reports the CLI` | — |
| A5 | Agents saved under `~/.agent-creator`, found again after restart | AGENT-CREATOR v1 | met | src-tauri/src/main.rs:47; tests `store round trip`, `store writes only under its home` | — |
| A6 | Autosave; hand edits win over creator edits | AGENT-CREATOR v1 | met | tests `agents: a chat turn applies the patch, autosaves it`, `a hand edit reaches the prompt and survives a patch` | — |
| A7 | Creator's hidden draft block never shown in chat | AGENT-CREATOR v1 | met | tests `streamFilter never leaks a draft tag`, `chat streams … the block never shows` | — |
| A8 | Files never go into the chat; creator routes by path, never reads content | Feature "build via chat/drag", CREATION-SCREEN | met | tests `the turn message lists file paths and feeds, never content`, `dropped files land in the DNA list, never the chat` | — |
| A9 | Raw source material never committed | CLAUDE.md, ROBBINS | met | `.gitignore` excludes the corpus; ROBBINS folder CLOSED | — |
| A10 | Personality clone `instructions.md` per person (Robbins instance) | CLAUDE.md, ROBBINS | met | offline deliverable, gitignored, ROBBINS CLOSED | — |
| A11 | RAG knowledge base: files really embedded and searchable | CLAUDE.md, Feature "RAG builder", CREATION-SCREEN rules | **missing** | no embedding code in `src/` (grep `embed` finds nothing); test `knowledge is read-only text`; issues.txt says "RAG unscoped" | **Columbo**: fixed means a scoped RAG plan exists, then a dropped Knowledge file turns bright only after it is really embedded |
| A12 | Memory kept as plain txt per agent | Feature "txt memory" | **missing** | no memory file in `src/` (grep) | **Columbo**: fixed means researched and scoped into a plan with an owner |

## B. Native shell and window (NATIVE-SHELL)

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| B1 | Real Mac app (Tauri), no Chrome | NATIVE-SHELL v1 | met | src-tauri/src/main.rs:56 `WebviewWindowBuilder` (WKWebView) | — |
| B2 | Installed in /Applications, found by Spotlight; Start opens the newest build | NATIVE-SHELL v1, fresh-build-check.md | met | test `Start builds, replaces the installed app, then opens that copy`; 544f761 records a fresh install | — |
| B3 | Server dies with the shell | NATIVE-SHELL v1 | met | main.rs `start_server` owns the server process; covered by `npm run test:shell` (not run in this audit) | — |
| B4 | No white flash at launch, dark tone | NATIVE-SHELL regressions | met | main.rs:63 `visible(false)`, :67 dark background before `show()`; new-agent.html:14 `html` background | — |
| B5 | Finder drops reach the page | NATIVE-SHELL regressions | met | main.rs:62 `disable_drag_drop_handler()`; file-intake tests pass | — |
| B6 | Narrow window works (one-pane layout) | NATIVE-SHELL regressions | met | main.rs:60 min 640; left-side-check "small screen" PASS | — |
| B7 | **Glassy, see-through window** (the desktop shows through, blurred) | User ask (goal of this round), Feature LEFT SIDE | **missing** | main.rs:56-65 builds the window with no `.transparent(true)` and no vibrancy; :67 + :73-74 paint it solid `Color(0x0B,0x14,0x10,0xff)` (alpha 0xff = opaque); `tauri.conf.json` has no `macOSPrivateApi`; all three pages paint an opaque `html` background: new-agent.html:14, agent-home.html:20, agent-page.html:14 (Eraser: WebKit reads `rgb(11, 20, 16)`, fully opaque) | **glass-window item**: fixed means the window is transparent with macOS vibrancy, so the desktop shows through blurred, text stays readable, and a launch still never flashes white |

## C. Home (AGENT-SELECTION-HOME, AGENT-HOME, GLADE-HOME-V2, Feature "AI souls not faces")

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| C1 | Home does one thing: pick an agent or make one (rows, one search, one plus, no header or footer) | AGENT-SELECTION-HOME rule 1, GLADE-HOME-V2 brief | met | agent-home.html; test `the home loads its modules`; `checks/real-home-check.cjs` in WebKit, ALL PASS: `exactly one way to start a new agent (the plus)`, `search is a centred search field`, `no leftover old-home wording` (Eraser: the old evidence, AGENT-HOME `check-eraser.mjs`, is stale on main. It crashes at line 79 because `#field` is gone, so it can't be cited) | — |
| C2 | Newest first, by createdAt (falls back to updatedAt) | AGENT-SELECTION-HOME | met | tests `sortAgents: newest createdAt first`, `summary() returns createdAt` | — |
| C3 | Live search on every letter, name and description, calm no-match line | AGENT-HOME, AGENT-SELECTION-HOME | met | test `filterAgents: one letter, full name, case, description words, no match` | — |
| C4 | Each agent shown as its firefly constellation (soul), not a face | Feature "AI souls not faces" | met | agent-home.html rows draw a canvas per row (`agent-list.js`); no face images on main | — |
| C5 | Plus → fireflies gather → blank /new | AGENT-SELECTION-HOME ph.3 | met | tests `the call flies into the 30 ring slots`, `reduced motion: no fireflies, resolves within 200 ms` | — |
| C6 | A row opens a real agent page, never raw JSON | AGENT-HOME sign-off | met | test `a home row opens a real page: /agents/:id is HTML` | — |
| C7 | Empty agents hidden and reused | AGENT-CREATOR fixes (R8) | met | test `agents: empty agents are hidden from the list and reused by create` | — |
| C8 | Original Fireflies look is the base; `glade-fireflies.html` kept byte for byte | AGENT-SELECTION-HOME rule 2-3 | partly | the look lives on in agent-home.html and new-agent.html:10, but `glade-fireflies.html` was deleted in 793c876 | **Columbo** (Eraser's ruling: retire rule 3. A reference page that the user never sees is not a user requirement, and bringing it back would add a second Fireflies page) — fixed means the roadmap records rule 3 as retired |
| C9 | **Find an existing agent to edit it** (the home is "built around two actions: add a new agent, find an existing one to edit or chat") | GLADE-HOME-V2 brief §2 (*added by Eraser, missed by the list*) | **missing** | a row opens /agents/:id. agent-page.html:31 has only `← Agents`, with no way back into /new?agent=… to keep building. An agent can be found but not edited. (Chat is G4) | **Jony**: fixed means one obvious step from an agent's page (or its row) reopens it in the build screen with its files and Sketcher talk |

## D. Build screen /new (FIREFLIES-BUILD)

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| D1 | Dim fireflies circle the middle, each at its own speed | FIREFLIES-BUILD fixed rules | met | test `orbit: 30 seeded fireflies in three rings` | — |
| D2 | Hover the middle: faint "Select Folder" in firefly light, a few flies brighten | FIREFLIES-BUILD | met | test `orbit: hover lifts the word to .36, 5 fireflies lean in` | — |
| D3 | Click opens the Finder folder picker | FIREFLIES-BUILD | met | new-agent.html `#pick`; test `picks keep the folder's own name and leave hidden files out` | — |
| D4 | Drop works anywhere on the screen | FIREFLIES-BUILD | met | left-side-check drops on `document.body` PASS; test `a dropped folder is walked to any depth` | — |
| D5 | After a pick or drop, every fly lights up and speeds up | FIREFLIES-BUILD | met | test `orbit: release hands over 30 live flies … wake to .8 in 120 ms` | — |
| D6 | Cancel or empty drop: gentle settle, nothing created; Esc goes home | FIREFLIES-BUILD | met | test `nothing usable → no start, 'no files found' and no agent is made` | — |
| D7 | Dot radius fixed 2.5–6.0, no size controls | FIREFLIES-BUILD, FIREFLIES-DNA | met | test `dot size is fixed, 2.5 to 6.0, with no way to change it` | — |
| D8 | Start from one line, with no folder | FULL-UX UJ3 (named later in FIREFLIES-BUILD) | **missing** | /new accepts only a folder or files (new-agent.html `#pick`) | **Columbo**: fixed means the research says whether UJ3 still belongs in the MVP, and the roadmap gives it an owner |

## E. Creation screen (CREATION-SCREEN, AGENT-CREATOR v2 nine fixes)

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| E1 | Scan walks every subfolder; one file = one firefly; hidden files left out | CREATION-SCREEN fixed rules | met | tests `finds every file in every subfolder … hidden ones left out`, `10,000 files: fed in batches without a freeze` | — |
| E2 | Right-side menu: System prompt, Knowledge, Skills | CREATION-SCREEN | met | test `the three zones and their labels` | — |
| E3 | While dragging, the parts become drop zones: Adjust DNA / Adjust Knowledge / Create new skill | CREATION-SCREEN | met | tests `the three zones and their labels`, `against the server: each zone sends the files to its own section` | — |
| E4 | Dim until really used; bright once used; red if removed but still baked in | CREATION-SCREEN | partly | test `dim if unprocessed, bright if processed, red if removed`. But "used" for Knowledge cannot mean embedded, because there is no embedding (A11) | **Jony**: fixed means a Knowledge file turns bright only on a real embed event from the server (after A11) |
| E5 | No file count, no status lines (F1, F7) | AGENT-CREATOR v2 | met | test `no count line and no status helpers are left in the screen` | — |
| E6 | No firefly names shown (F9); no fly dragging (F3) | AGENT-CREATOR v2 | met | creation-screen tests; left-side-check found no labels on the field | — |
| E7 | Flies drift with a dim, rare shine, still under Reduce Motion (F2) | AGENT-CREATOR v2 | met | tests `wander: … no glow under reduced motion`, `shine is rare` | — |
| E8 | Loose seeded clusters, never a row (F5) | AGENT-CREATOR v2 | met | test `cluster spots: seeded, inside the box, spread out, never a row` | — |
| E9 | Skill names shown (F4); tap a cluster, it flies to spots with names and back (F6) | AGENT-CREATOR v2 | met | tests `skills: made from dropped files, listed`, `a flight starts and ends where it should and bows` | — |
| E10 | Click the name to rename: Enter/blur keep, Esc revert, empty keeps the old name, saved (F8) | AGENT-CREATOR v2 | met | tests `a rename keeps what was typed`, `against the server: a rename is saved and comes back` | — |
| E11 | Remove a file says "removed from Agent, not from your Mac" with Undo | CREATION-SCREEN build | met | tests `remove: a file never used leaves every list`, `against the server: remove, red until a full rebuild` | — |
| E12 | One-word section empty state ("nothing yet · drag files here") | CREATION-SCREEN sign-off | met | test `a section says nothing when it has files, only the empty hint` | — |

## F. Left side and Sketcher chat (LEFT-SIDE, Feature "The Left Side")

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| F1 | Starts as a loose mess; it only adds up into the AI identity as files are processed | LEFT-SIDE fixed rules | met | left-side-check step 1 `the likeness is still empty`, step 4 brighter at 25/50/100 %; tests 1-5 | — |
| F2 | Gathering never goes backwards (except gently on removal) | LEFT-SIDE ph.3 | met | tests `2. processing one by one never lowers shown`, `3. … a removal may` | — |
| F3 | Final state is the Fireflies DNA mark | Feature LEFT SIDE | met | left-side-check `all used: the whole likeness is shown {shown:40,live:40}` | — |
| F4 | Small arrow on the left edge pulls out the creator chat; one way in | LEFT-SIDE fixed rules | met | left-side-check step 2-3 (click, Enter, Space open it) | — |
| F5 | One way out: back arrow on top (Esc is the same action); focus back on the arrow; the DNA shows again | LEFT-SIDE fixed rules | met | left-side-check `Esc closes it`, `the ‹ close button closes it`, `focus goes back to the handle` | — |
| F6 | Chat panel is glassy and blurs what is behind it | LEFT-SIDE fixed rules | met | new-agent.html:134-135 `backdrop-filter: blur(18px) saturate(1.2)` on `#sketcher` over the field (in-page glass; for the window itself see B7). Eraser, WebKit: computed `blur(18px) saturate(1.2)` over `rgba(12,14,10,.64)`. **On screen the glass hardly shows**, because it sits over a near-black field of the same tone. It becomes visible only once B7 lets the desktop through | — (re-check with B7) |
| F7 | Two rounded corners on the right, merged with the left edge | LEFT-SIDE fixed rules | met | `#sketcher` styles in new-agent.html; LEFT-SIDE review round 3 APPROVED (4dd4d36); seen in the check's open-panel step. Eraser, WebKit: computed `border-radius: 0 16px 16px 0` (new-agent.html:132). The corners are faint on screen for the same reason as F6 | — (re-check with B7) |
| F8 | **Chat replies are formatted** (bold, lists, code look like text, not symbols) | User ask (goal of this round) | **missing** | left-side.js:255 `p.textContent = text` and :262 `reply.textContent = text`: the reply is put in as plain text, so `**bold**`, `1.` lists and `` `code` `` show as raw markdown. Eraser, seen in WebKit: a faked reply with bold, italics, a numbered list, a bullet, inline code and a fenced block came out with `**`, `*`, `` ` `` and ```` ``` ```` as literal characters, and 0 `strong`/`li`/`code` elements | **chat-formatting item**: fixed means bold, italics, numbered and bulleted lists, inline code and code blocks show formatted while streaming and after a reload; no raw HTML from the model is ever run |
| F9 | Chat history kept when closed and opened again, and after a reload | LEFT-SIDE ph.4 | met | test `the Sketcher panel: … the talk is there after a reload` | — |
| F10 | When the AI is ready it offers to build: **Create**, or ask more, or keep chatting | Feature LEFT SIDE | partly | test `Keep shows only when proposed`: the button reads **Keep**, not Create; the ready signal is found by words (issues.txt "CHAT ready flag via words, fragile") | **Jony**: fixed means one Create button appears from a real server flag, not from word matching |
| F11 | Reduce Motion respected; small screens keep a way out | LEFT-SIDE | met | left-side-check step 5 and 6 PASS | — |
| F12 | Creator allocates files on request ("move outstanding files to knowledge, X, Y for transcript") | Feature LEFT SIDE | partly | tests `routeFiles: own entry beats the deepest folder`, `the creator's routing keeps skill feeds`: the creator can route by path, but there is no visual for it and no check of a real sentence (out of scope in LEFT-SIDE v1) | **Merlin**: fixed means a moment shows the files moving when the chat allocates them, and a check drives it with that sentence |
| F13 | Middle fireflies glow one by one as files are allocated into the final DNA | Feature LEFT SIDE | partly | test `M4. the likeness grows as it fills`; flyers leave one by one (test 6), but this is tied to "processed", not to allocation | **Merlin**: fixed means the per-file glow follows each allocation event |
| F14 | Barely noticeable chat with the **built agent** over the DNA, showing its skill and RAG use | Feature LEFT SIDE | **missing** | not on /new or /agents/:id; named out of scope in LEFT-SIDE update v1 | **Jony**: fixed means an agent can be talked to over its DNA, and each answer shows which skill or file it used |
| F15 | Access to the files from the left side | Feature LEFT SIDE | partly | files are listed in the right-hand sections (E2); the left field gives no way to open a file | **Columbo**: fixed means research confirms what "access" means to the user, and the roadmap holds it |

## G. Agent page and the screens deleted in 793c876 (FULL-UX, SKETCH-REWORK, MAGIC-PASS, Features)

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| G1 | Sketch **Profile** switch: face/soul, name, description, Good at / Medium / Not trained for | Feature, SKETCH-REWORK | **missing** | sketch.js and block-a deleted in 793c876; agent-page.html has no Profile view | **Jony**: fixed means /agents/:id shows the profile with the three level words |
| G2 | Sketch **DNA** switch: instructions → made from → RAG files → quality | Feature, SKETCH-REWORK | **missing** | deleted in 793c876 | **Jony**: fixed means /agents/:id shows the DNA view in that order |
| G3 | Sketch shows instructions only, no Talk section | Feature "Sketch instructions only" | *duplicate, folded into G1/G2* | it is a rule for the same rebuilt screen, not a separate thing to build. Not counted | see G1/G2: their rebuild must show instructions only |
| G4 | Talk with a finished agent | FULL-UX UJ4-7 | **missing** | block-d.js deleted; no talk on agent-page.html | **Jony**: fixed means the user can chat with a kept agent (shares the formatter from F8) |
| G5 | Know / Identity / Share-export screens | FULL-UX UJ8-11 | **missing** | block-c/e/f deleted in 793c876 | **Columbo**: fixed means research says which of these the MVP still needs, and the features are updated to match |
| G6 | "Studying" top bar removed | Feature (shipped) | met | not present in any of the three pages (the old screen is gone) | — |
| G7 | Magic pass details (signature moments) | MAGIC-PASS, Feature (shipped) | partly | the moments on home, /new and the left side exist (C5, D5, F1); the moments on the deleted screens are gone | **Merlin**: fixed means the magic list names only moments that exist on main |
| G8 | Full UX prototype: every journey UJ1-12 clickable as the .app | FULL-UX | **missing** | only UJ1-2 (home, build, creation) and part of UJ12 remain | **Columbo**: fixed means the Features list stops marking the full UX as shipped, and the remaining journeys are planned |
| G9 | Mocks never leak into agent.json | FULL-UX | met | tests `mock routes are read-only`, `the map never lives inside the draft` | — |
| G10 | The agent page is real (not "Not found") | AGENT-HOME sign-off | *duplicate of C6* | same requirement, same source, same test. Not counted | see C6 |

## H. Look and principles across the app (MAGIC-CONCEPTS, FIREFLIES-DNA, team principles)

| # | Requirement | Source | Verdict | Evidence | Owner / fixed means |
|---|---|---|---|---|---|
| H1 | Reduce Motion respected everywhere | every roadmap | met | Reduce Motion tests for gather, orbit, wander, left side; left-side-check step 5 | — |
| H2 | One way to do each thing; no dead UI | principles, every roadmap | met | real-home-check `exactly one way to start a new agent (the plus)` (WebKit PASS); left-side one in / one out | — |
| H3 | DNA blinks follow the rate files were added, never all at once | FIREFLIES-DNA-CLUSTER ("all shining at once") | met | tests `files added 1 s apart blink about 650 ms apart`, `long gaps are log-squashed` | — |
| H4 | One dot per MB, extra past 60 only adds glow | FIREFLIES-DNA | met | tests `one dot per started MB`, `past 60 dots, extra MB only add glow` | — |
| H5 | Never looks like a loop; randomness stays | FIREFLIES-DNA rule 3 | met | test `wander: every fly really roams (never stuck)`; seeded random sparks | — |
| H6 | Words stay readable over the field | FIREFLIES-DNA rule 4, FIREFLIES-BUILD Columbo ("quiet, not invisible") | met | test `orbit: rest is dim … Select Folder readable at .24` | — |
| H7 | Magic concepts as HTML pages, plus a plain-text twin | MAGIC-CONCEPTS | met | files in `updates/2026-11-25 MAGIC-CONCEPTS/` (design deliverable, not app) | — |
| H8 | Planned features P3-P12 | Features | **missing** (planned) | not started; listed so nothing is lost | **Columbo**: fixed means each one has a roadmap slot when its turn comes |
| H9 | Every open issue in issues.txt has an owner | issues.txt | **missing** | open: RAG unscoped, SKILL.md in Chinese, eye-check flaky, per-file blink, ethics of real-person clones, FIREFLIES-DNA run.cjs flaky, CLUSTER run.cjs stale (8 fails), CHAT ready flag via words | **Eraser**: fixed means each line in issues.txt names an owner or is closed |

---

## Watch out (works today, but at risk)

1. **Shipped features with no screen.** The Features list still says shipped for things deleted in 793c876 (G1-G5, G8). Anyone who trusts that list will think the app does more than it does.
2. **Glass vs. readability.** When B7 makes the window see-through, the Sketcher panel (`backdrop-filter` over a transparent page) and the faint "Select Folder" word (.24 opacity) can become hard to read on a bright desktop. Re-check H6 and F6 after the glass change.
3. **No white flash vs. transparency.** B4 relies on an opaque dark background (main.rs:67). A transparent window must still not flash at launch.
4. **Formatting vs. safety.** F8 must never put model output in with `innerHTML` without cleaning it first. The hidden draft-block filter (A7) must keep working before formatting is applied.
5. **The ready signal is found by words** (F10). A small wording change in the creator prompt breaks the Create/Keep offer without warning.
6. **Browser checks are flaky.** The left-side check had "Chrome was closed from outside" twice in this run and recovered. FIREFLIES-DNA run.cjs is flaky and CLUSTER run.cjs is stale (issues.txt). A real break could hide in that noise.
7. **Ethics of real-person clones** (issues.txt). The Robbins instance works; consent and use of a real person's voice are still unanswered.

## Key insights and open questions

- The app on main is now a strong **make** flow: home → build → creation → left side. The **use** flow (talk, profile, DNA view) is gone. The user's job "make an agent **and then use it**" is only half covered.
- Open: should the deleted Sketch/Talk screens come back on `/agents/:id`, or did the user drop them on purpose in 793c876? The commit message doesn't say. **Assumption:** removed by mistake or as a temporary cut, so they count as missing.
- Open: does "Create" (user's word) replace "Keep" (app's word)? Two words for one action is a risk.

---

## Eraser sign-off

Checked by Eraser on 2026-11-27, against main `544f761` (this branch adds only audit notes, no app code).

### What I ran

- `npm test`: **226 pass, 1 skipped, 0 fail**. This matches Columbo's run.
- I started a server from this checkout with a scratch home: `AGENT_CREATOR_HOME=.tmp-test/eraser-audit-home PORT=3505 npm start`.
- `node checks/real-home-check.cjs http://localhost:3505 webkit`: **ALL PASS** (home, the one plus, search, DNA logos, blink timing, one dot per MB, Reduce Motion, no page errors).
- `node checks/left-side-check.cjs http://localhost:3505 --home …` (Chrome): **ALL PASS**. Lit pixels 6 → 146 → 227 → 1153, and Chrome quit from outside once, then recovered. The script is hard-wired to Chrome, so I covered the WebKit part with my own probe (next point).
- My WebKit probe (scratch, not committed): it opened the Sketcher panel, read its computed glass and corners, and sent one faked reply with bold, italics, lists, inline code and a code block. Then it looked at what showed on screen. No page errors.
- `updates/2026-11-26 AGENT-HOME/checks/check-eraser.mjs` (WebKit) **crashes on main** at line 79 (`#field` no longer exists). The check is stale; it isn't an app bug.

### Rows re-checked

- **All chat-formatting and glass rows:** B4, B7, F4, F5, F6, F7, F8, F9, F10, F11 (code and browser).
- **19 picked at random:** A3, A4, A5, B6, C1, C2, C3, C6, C7, D2, D6, D7, E5, E11, E12, G10, H2, H3, H4. I checked each against its test in this run's output, or against the file:line it cites. Every one holds, apart from the corrections below.
- **Every remaining row:** count of met / partly / missing re-added by section (A 10/0/2, B 6/0/1, C 7/1/1, D 7/0/1, E 11/1/0, F 9/4/2, G 2/1/5, H 7/0/2 after my changes). Every partly or missing row has an owner.

### What I changed, and why

1. **C1, H2 evidence:** the cited AGENT-HOME `check-eraser.mjs` crashes on main, so I swapped in `checks/real-home-check.cjs` (WebKit, ALL PASS). The verdict stays **met**.
2. **B7 evidence:** the list named only new-agent.html. The home and agent page paint the same opaque `html` background too (agent-home.html:20, agent-page.html:14). The glass-window item has to change all three. The verdict stays **missing**.
3. **F8 evidence:** I added what the eye sees in WebKit. Markdown shows as raw symbols. The verdict stays **missing**.
4. **F6, F7 notes:** both are met in code, but on screen the glass and the rounded corners hardly show over the dark field. I left them **met** and marked them "re-check with B7", so nobody reads them as done-and-visible.
5. **G10 → duplicate of C6** (same requirement, source and test). Not counted.
6. **G3 → folded into G1/G2.** "Instructions only" is a rule for the same rebuilt screen, not a separate build. Not counted.
7. **C9 added, missed by the list.** The GLADE-HOME-V2 brief says the home is for "find an existing one to **edit** or chat". On main an agent page (agent-page.html:31) has only `← Agents`, with no way back into the build screen. **Missing; owner Jony.**
8. **C8 owner** moved from Eraser to Columbo, with my ruling: retire rule 3 (`glade-fireflies.html`). A reference page the user never sees isn't a user requirement, and a second Fireflies page would be clutter. Columbo records it in the roadmap.
9. **Count** goes from 81 = 60/7/14 to 80 = 59/7/14 (−G10, −G3, +C9).

### Watch for (clutter, seen in the app)

- With the Sketcher panel open, the handle's `›` still shows faintly at the left edge, next to the panel's `‹`. If both close the panel, the panel has two ways out (rule: one way out). **Jony** should confirm the handle is hidden or inert while the panel is open.
- The failed-send line on main reads "Sketcher couldn't answer. **Press Enter** to try again." (left-side.js:269). LEFT-SIDE M1/M3 signed "…Try again." Small, but it is a second wording for the same moment.
- The F10 "Keep" vs. the user's "Create": one word has to win before the chat-formatting item touches that button.
- H9 (an owner for each issues.txt line) is still mine. It is out of scope for this pass (I may only edit these two files) and stays open as a follow-up.

### Verdict

Every row is now either confirmed or corrected, duplicates are marked, the one missed requirement is added with an owner, and no gap is left without an owner. The list is a true picture of main.

**APPROVED** (the audit). The app gaps it lists (B7, F8, C9, G1–G8 and the rest) are owned work, not defects in the list.

— Eraser

---

## Gaps by owner (integration roll-up, Columbo)

Every partly or missing row, plus Eraser's watch-for notes, has exactly one owner:

- **chat-formatting item:** F8 (formatted replies, safe, while streaming and after a reload).
- **glass-window item:** B7 (transparent window with vibrancy on all three pages, no white flash). Afterwards it re-checks F6, F7 and H6 (watch-outs 2 and 3).
- **Jony:** C9 (edit an existing agent), E4 (Knowledge bright only on a real embed), F10 (one Create button from a server flag; settle Keep vs. Create first), F14 (talk to the built agent over its DNA), G1, G2 (with G3's rule), G4. Also Eraser's watch-for notes: the handle `›` showing while the panel is open, and the "Press Enter to try again" wording (left-side.js:269) vs. the signed "Try again."
- **Merlin:** F12 (show files moving when the chat allocates them), F13 (per-file glow on allocation), G7 (the magic list names only moments that exist on main).
- **Columbo:** A11 (RAG plan), A12 (txt memory), C8 (retire rule 3 in the roadmap), D8 (one-line start), F15 (what "access to files" means), G5 (which of Know/Identity/Share the MVP needs), G8 (Features list stops marking the full UX as shipped), H8 (planned features get roadmap slots).
- **Eraser:** H9 (an owner for every open line in issues.txt).

---

## Research rows: what changed (Columbo, 2026-11-28)

Details are in `research-roadmap-columbo.md` (same folder).

| # | What changed | Row now reads |
|---|---|---|
| A11 | RAG plan written. "Really embedded" means: extracted, chunked, embedded locally, stored per agent, and found again by a search. The server then sends `{type:"embedded", file}`. Owner: Uncle Bob (slot 1). | **planned**: the research part is met; the app part is still missing until slot 1 ships |
| A12 | txt memory means a `.txt` copy of every used source, kept per agent (step 1 of A11). Owner: Uncle Bob (slot 1). | **planned**: the research part is met |
| C8 | Rule 3 marked RETIRED in `AGENT-SELECTION-HOME/00-roadmap.md`. Rule 2 (the look) still holds. | **met** (rule retired) |
| D8 | Ruling: out of the MVP for now (folder-first was the user's own design). Owner: Jony (slot 5). | **planned, out of MVP** |
| F15 | "Access" means the Sketcher chat can see, move, edit and, when asked, **read** the files. Reading on request is the gap. Owner: Uncle Bob (slot 2). | **partly**: the meaning is settled; the read-on-request part is still missing |
| G5 | Know = C9 (no separate screen). Identity → slot 7. Share → slot 6. Profile, DNA and Talk come back on `/agents/:id` (Jony). | **met** (scoped); later screens planned |
| G8 | Features: "Full UX prototype" goes back to *now*. Sketch Profile and DNA show their real progress. Every remaining journey has a slot. | **met** (list corrected) |
| H8 | P3–P12 and the four other planned features each have a roadmap slot (1–10). | **met** (slotted) |

E4 note for Jony: the `embedded` event **does not exist yet**, so E4 stays as it is for now.
