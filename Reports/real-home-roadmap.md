# Real home + Fireflies DNA logos: roadmap and behaviour report

Columbo (Magic UX), 2026-11-26. Read before building. Nothing in `src` was changed for this report.

## Part 1: The phased roadmap

### Where we start (facts from the code today)

- `GET /` serves `src/server/public/agent-home.html`. It already has the designed layout: rows, a centred search and Plus. But each row's logo is a **random firefly cluster** made from the agent's name and id (`cluster()` inside the page). It is not the DNA, and it does not use files.
- `GET /api/agents` returns `summary()` from `src/creator/agents.mjs`: `{ id, draft: { name, status, description }, createdAt, updatedAt }`. **There are no files in it.** The home cannot draw a DNA logo from what it gets today.
- `GET /api/agents/:id` returns `{ id, draft, sessionId, files }`.

### Which screens in `src/server/public` show an agent logo today

| File | Served at | Shows an agent logo? | What it draws today |
|---|---|---|---|
| `agent-home.html` | `GET /` (the app's first screen, also in the Mac app) | **Yes**, one per row (56 px canvas) | Its own random cluster (`cluster`, `drawCluster`), seeded by name + id. Not files. Not DNA. |
| `agent-page.html` | `GET /agents/:id` (a home row opens it) | **No** | Name and description only. No logo yet. |
| `new-agent.html` | `GET /new` (after Plus) | **No** | One lone firefly that fades out (the arrival of the fly-to-plus call). It is not a logo. |
| `firefly-gather.js` | used by the home's Plus | **No** | The fly-to-plus motion. It draws loose fireflies and a "glow" disc, not an agent. |
| `index.html` + `app.js` + `block-a…f.js` + `components.js` | **not served** by any route in `src/server/app.mjs` | Yes in code, but unreachable | The old sketcher app. Its faces are `face()` in `components.js` (a photo, an icon or a **letter**), used in: `#top-face` (block-a.js:103, 269), home cards and sketch rows (block-a.js:163, 173), `#face-slot` (block-b.js:88), the face sheet (block-e.js:220–281), Talk lines (block-d.js:343), the export sheet (block-f.js:50, 92). `app.js:449` draws a letter avatar (`voice-avatar`). |
| `glade-fireflies.html` | **not served** | Yes in code, but unreachable | The old concept page with its own clusters. Links to `index.html`. |
| `agent-list.js` | module for the home | No | Pure rules: `nameOf`, `descOf`, `ageLabel`, `sortAgents`, `filterAgents`, `isLearning`. |

So in the installed app the user sees an agent logo in **exactly one place today: the home rows**, and that logo is the wrong one. Plus is already the only way to `/new` on the home. The old sketcher (`index.html`, with its own "new" path) is unreachable but is still in the folder.

### P1: Data. Every file gives `{ name, sizeBytes, addedAt }`

What a file looks like today (`src/creator/files.mjs`, `newFile`): `{ path, name, size, feeds }`.

| Field the DNA needs | Today | Status |
|---|---|---|
| `name` | `name` (last part of `path`). `path` keeps the folder, which the DNA uses for the topic colour (the first folder, like the playground's `topicFromName`). | **Exists** |
| `sizeBytes` | `size`: a number, or `null` when the page did not send a valid size | **Exists under another name**, and it can be `null` |
| `addedAt` (ms epoch) | nothing | **Missing** |
| files in the home's list | `summary()` has no files | **Missing** |

Also note: `POST /api/agents/:id/files` (`requireFiles` in `src/server/http.mjs`) only checks `path`. `size` passes through as it is sent.

Simplest choices (Jony owns them; written here so everyone codes against the same shape):
- `addFiles` stamps `addedAt = now()` (ms) on each new file. One call for a whole folder → each file gets the same time → they blink in step, which is the approved rule ("added together → in step").
- Older records with no `addedAt` fall back to the agent's `createdAt` (as ms). Never `undefined`, never "now". This is the same rule `summary()` uses for `createdAt`.
- `sizeBytes` = `size` when it is a number ≥ 0, else `0`.
- `summary()` adds `files: [{ name, sizeBytes, addedAt }]`, so the home gets everything in one request. Keep `path` out of the summary unless the topic colour needs it. If it does, send `path` and let the module take the first folder.

**Done when:** `GET /api/agents` and `GET /api/agents/:id` return every file as `{ name, sizeBytes, addedAt }`, with `addedAt` a number and `sizeBytes` a number (never null). Tests cover a new file, a folder added in one call (same `addedAt`), an old record with no `addedAt`, and a file with no size. Uncle Bob's real agents load without errors.

### P2: One shared DNA module, `src/server/public/fireflies-dna.js`

Port the approved behaviour from `playground/fireflies-dna.html` **exactly**. Only the cluster comes over:
- `phaseStep` + `placeBeat`: each file blinks on its own beat, set by `addedAt`. Files 1 s apart → ~0.22 of a beat (~650 ms). 1 day → ~0.6. A year → 0.8. The step is log-squashed.
- `dotsFor` / `fills`: one dot per started MB (1 MB = 1,048,576 B). The last dot's size shows how full it is.
- `PLACED = 60`: at most 60 dots get a place. More MB only add steady glow (`level = min(.3, .06·log2(1+E))`), never a dot and never a pulse.
- Look from the name only (`makeLook`): spiral turn, squash, tilt, beat.
- Reduce Motion: dots still light one by one. The playground's `STEP_REDUCED` is 60 ms. Eraser measured ~66 ms on screen (frame rounding). Keep 60 ms in code. Each dot just turns on: no grow, no pop.
- Dot size: `MIN_R = 2.5` and `MAX_R = 6.0` as **constants**, not options. Keep the floor of 2 px and the 56 px box.
- An agent with no files gets a calm logo (see Watch out).

What does **not** come over: the file panel, "add file", the Size / Smallest / Largest sliders, `setSizeRange`, `suggest`, the `say` line, and the playground's sample files.

**Done when:** `fireflies-dna.test.mjs` passes and locks in: 1 s gap ≈ 650 ms apart; 1-day gap squashed (< 1 beat, and different from 1 s); 0 B / 1 B / 1 MB / 1 MB + 1 B → 1 / 1 / 1 / 2 dots; 61 MB and 500 MB → 60 placed dots plus glow; no exported way to change dot size; zero files draws a calm logo. `checks/blink-check.cjs` gives the same numbers on the module as on the playground (633/616 ms, 1167/1165 ms).

### P3: The home is the designed agent-selection home

`agent-home.html` keeps its layout and swaps its own `cluster()` / `drawCluster()` for `fireflies-dna.js`, fed by each agent's real files from P1.
- Rows: DNA logo, name, description, age. Newest first by `createdAt` (`sortAgents` already does this).
- A centred iOS-style search (already there: `#q`, `filterAgents`).
- Plus plays `gatherToPlus` (`firefly-gather.js`) and then opens `/new`. It is the only way to start a new agent. Remove any second path (see P4 for the old sketcher).
- Real data in the installed app. `/?demo=` mock sets are for the browser only, and their agents need files too, or they show the calm empty logo.
- Only rows on screen animate (keep the IntersectionObserver).

**Done when:** in the installed Mac app, Uncle Bob's real agents appear newest first. Each logo is the DNA of that agent's own files (two agents with different files look different, and the same agent looks the same on every load). Search filters as you type. Plus is the only "new" control, and it gathers and then opens `/new`.

### P4: Every other agent face uses the same module

- `agent-page.html`: when it shows an agent's face, it uses `fireflies-dna.js` and the same files, so the logo looks the same as on the home row.
- Old faces (`components.js` `face()`, the letter avatar in `app.js:449`, `glade-fireflies.html` clusters): these pages are not served today. Either delete the dead pages (`index.html`, the sketcher blocks, `glade-fireflies.html`) or switch their face to the DNA module. Never leave a letter or icon face that a route could bring back. Mind `PAGE_MODULES` in `src/server/app.mjs` and the `sketch.test.mjs` checks that read `index.html`.
- Grep check: no `drawCluster`/`cluster(` copy outside `fireflies-dna.js`, and no `face-letter` / `voice-avatar` on any served page.

**Done when:** every served page that shows an agent shows it through `fireflies-dna.js` and nothing else, and the grep check is clean.

### P5: Eraser signs off in the installed app

Eraser writes `Reports/real-home-signoff.md` and checks with the eye in Chrome, WebKit and the installed Mac app (`npm run start:app`) with Uncle Bob's real agents. Reuse `checks/blink-check.cjs`. Count dots in pixels.

**Done when:** the sign-off says APPROVED for a named commit. Otherwise it lists exact fixes for Jony, and they are made and checked again.

---

## Part 2: Behaviour report (this MVP only)

### Summary
People hire this home for one job: **"get me back to the right agent, now."** Making a new agent is the second job, and a much rarer one. The DNA logo earns its place only if it helps people tell agents apart at a glance, and only if it stays the same from one visit to the next. If it changes on every load, or blinks too loudly, it breaks trust in the whole list.

### Scope
- **In:** the home (rows, search, Plus), the DNA logo wherever an agent's face shows, and Reduce Motion.
- **Out:** chat, adding files, the agent page's content, export, and the knowledge base. These belong to other journeys or are not built yet. File adding is out because the DNA only *reads* files here.

### Who and when (assumptions)
The main user is Uncle Bob (the user) on a Mac, opening the installed app at their desk. They have a handful to a few dozen agents. Assumption: the list rarely goes past 50 agents in this MVP. Phone use is unlikely (it is a desktop app).

### Behaviour table (sorted by combined score)

| # | Behaviour | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| 1 | **Pick my agent from the list** (open the app, click a row) | 10 | 10 | It is why the home exists. Almost every visit. |
| 2 | **Recognise an agent by its logo** before reading the name | 8 | 9 | People scan shapes before words. True only if the logo stays the same each time (assumption). |
| 3 | **Find an agent with search** (type a few letters) | 8 | 7 | Autofocus invites typing. It is useful past ~8 rows. With few agents, people click instead. |
| 4 | **See which agent is newest** (top row, age) | 7 | 7 | Right after making one, and while tuning a fresh agent for days. |
| 5 | **Start a new agent with Plus** | 9 | 4 | Everyone does it at least once. It stays rare after setup. Scored lower on frequency on purpose. |
| 6 | **Use the app with Reduce Motion on** | 7 | 10 | Easy to underrate. Likelihood: macOS users who turn it on, and testers. Frequency: every visit, for them. |
| 7 | Watch the logo, "is it alive / learning?" | 6 | 6 | The blinking invites reading meaning into it, like "busy" or "broken". |
| 8 | Compare two agents' logos ("why is this one bigger?") | 5 | 4 | Curious users. The size is the MB of files, so it is honest if they guess right. |
| 9 | Hover rows to make them flash | 5 | 5 | It is playful, and harmless. |
| 10 | Open an agent in a new tab (Cmd-click) | 3 | 3 | This is a browser habit, and it is rare inside the Mac app. Plus must skip its motion then (it already does). |
| 11 | Look at an agent with no files yet | 6 | 3 | Every new agent starts like this, then it gets files. |
| 12 | Press Plus twice in a hurry | 4 | 2 | Impatience. It is already ignored while the gather plays. |

### Deep dives (top 5)

**1. Find my agent again fast** (behaviours 1 + 3)
- *Moment:* the morning, at the desk. They just opened the Mac app from the Dock. Before that, they had a question for "the sales one".
- *Trigger:* a task needs a specific agent.
- *Thoughts:* "Where's the sales one… there." Or, with many agents: "s-a-l…"
- *Emotions:* focused and a little impatient before. Neutral during. Relief once it opens.
- *Expectations:* the list is there at once (no splash, no animation before the rows). One click. Search answers on every key.
- *Success:* "I didn't have to think."
- *Friction and fears:* rows that appear late or jump around. The logo animation delaying the rows. Search that misses accents or descriptions. The order changing between visits.
- *Insight:* the logo must never slow the list. Rows and text come first, and the logos draw in their own place. Keep the newest-first order stable (ties sorted by id).

**2. Recognise an agent by its logo** (behaviour 2)
- *Moment:* scanning the list in a second or two, eyes on shapes before names.
- *Trigger:* the same as above. The logo is the shortcut.
- *Thoughts:* "The big, bright one is the book agent."
- *Emotions:* familiarity, a small "that's mine". Mild worry if a logo looks different from yesterday.
- *Expectations:* the same agent looks the same on every load and on every screen (home row = agent page). The look changes only when its files change.
- *Success:* they click the right row before reading.
- *Friction and fears:* random seeds (today's home seeds by name + id but ignores files). A logo that rebuilds or re-lights on every visit. Two agents with no files looking the same.
- *Insight:* this is why P4 matters. There is one module and one look per agent, built only from name + files. Open question: should the home play the dots "landing" one by one on every visit, or only when a file is new? Assumption: draw them already lit at rest. Landing is for new files.

**3. See which agent is newest** (behaviour 4)
- *Moment:* just after making an agent, or days later while still shaping it.
- *Trigger:* "Where's the one I made yesterday?"
- *Thoughts:* "Top one, 1 day. Yes."
- *Emotions:* a small pride in the new one, wanting it easy to reach.
- *Expectations:* the newest is on top. The age reads plainly ("just now", "1 day"). The order follows when the agent was made, not when it was last edited.
- *Success:* the top row is the new one, every time.
- *Friction and fears:* order by `updatedAt` (the store sorts that way, the home re-sorts by `createdAt`, which is good). Old records with no `createdAt`.
- *Insight:* keep `createdAt` as the one source for order and age. Its `addedAt` fallback (P1) must not change an agent's place.

**4. Start a new agent** (behaviour 5)
- *Moment:* a new person to capture. Usually a deliberate, calm moment.
- *Trigger:* "I want an agent for X."
- *Thoughts:* "Plus. Obviously."
- *Emotions:* anticipation. The fly-to-plus gather is the one bit of delight here.
- *Expectations:* one control, where Plus usually sits. The motion is short and never blocks. Cmd-click opens without motion.
- *Success:* "That felt alive, and it was quick."
- *Friction and fears:* a second "New" button somewhere (a leftover from the old sketcher). A gather that feels slow. A double press making two agents.
- *Insight:* Plus stays the only path. The old `index.html` path must be gone or unreachable (P4). `create()` reusing an untouched empty agent protects against duplicates already.

**5. Use it with Reduce Motion on** (behaviour 6)
- *Moment:* the same moments as above, for someone who turned on Reduce Motion (motion makes them dizzy, or they find it distracting).
- *Trigger:* any visit.
- *Thoughts:* "Please don't move." / "Is this frozen or just calm?"
- *Emotions:* wary at first. Calm if nothing pulses or pops.
- *Expectations:* no blinking, no drift, no gather. The logos are still clearly different. New dots arrive gently (one by one, no pop).
- *Success:* the page feels still, but not dead.
- *Friction and fears:* a dot popping in large. Any flash. The Plus gather playing anyway.
- *Insight:* the shape (dots, sizes, colours, glow) must carry identity without motion. Test with the eye in WebKit (the Mac app uses it).

### Key insights
1. Speed to the right row beats everything. The DNA decorates the list, it never delays it.
2. A logo is only useful if it is **stable**. Build it from name + files only, the same on every screen.
3. The data gap is real: today the home gets no files at all. P1 has to come first.
4. One way in for "new". Kill the dead second path rather than hide it.
5. Reduce Motion is a daily mode for some users, not an edge case.

### Open questions
- Should dots "land" on every home visit or only for new files? (Assumption: at rest, already lit.)
- An agent whose files are all in one folder has one topic colour. Is that distinct enough between agents? (Watch it with real data.)
- Old files with no `addedAt` all get the agent's `createdAt`, so they blink in step. Acceptable? (Assumption: yes. It is honest, because we don't know better.)

### Watch out (low score but can break trust)
- **No dot-size control may appear anywhere.** Size is fixed: smallest 2.5, biggest 6.0. They are constants in the module, not options or settings.
- **The playground's file panel and its Size, Smallest and Largest sliders must not come into the app.** Neither may "add file", the sample files or the `say` line.
- **An agent with no files must still show a calm logo:** visible, still, never blank and never looking broken or "loading". It must not blink like a busy agent.
- **An agent with more than 60 MB shows 60 dots, and the extra MB only adds glow.** The count must be what the eye sees (pixels), never more than 60, and the glow is steady (no pulse).
- A file with no size (`size: null`) must still give one dot, not crash or vanish.
- A logo that changes between visits for no reason reads as "something happened to my agent".
- Blinking can be misread as "working" or "learning". Keep it soft, and keep the learning state (`isLearning`) clearly separate if it stays.
- Mock data (`/?demo=`) must never show in the installed app as if it were real agents.
- Many agents (50): only the rows on screen animate, so the app stays smooth.
