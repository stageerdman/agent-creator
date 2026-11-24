# Design: The agent-creation chat screen (P2)

*Jony, UI Design. 2026-11-24. For Uncle Bob (build), Eraser (review) and
Columbo. Built on `research-columbo.md`, `magic-merlin.md` and the Roadmap in
`update v1.md`. Build the version Eraser signs off in `review-eraser.md`.*

> **Build this file as it stands.** Eraser's required changes R1–R11
> (`review-eraser.md`) were applied during integration on 2026-11-24. Each
> change is marked *(R#)* where it lands. The review explains why.
> Rule from R1: the words *keep / kept* are used only for the Keep action
> and its status.

## 1. The user goal

> "I type one line about someone. A likeness appears. I correct it, by chat
> or by hand, until I say *that's them*, and it's mine."

The screen has one job: make the time from first line to first sketch
short, and make every change after that easy to see and safe.

**One primary action per state:**
- Before the first sketch: **send the first line**.
- While shaping: **send a reply** (the chat input is always the primary).
- At the end: **Keep**, the only finish action, which never competes with
  Send. It sits in the Sketch header, quietly, until the sketch has a name.

## 2. What I removed, and why

| Removed | Why |
|---|---|
| A separate "Create" vs "Configure" mode or tab | Two modes that fight is the top trust-breaker in rival tools (research #6, insight 4). One Sketch, always editable, is the only mode. |
| An "Apply" or "Update draft" button | The draft updates on its own (research #2). |
| A Save button next to Keep | Autosave already saves everything. Keep is the only finish (Merlin ★5). |
| Per-field "Regenerate" / "Ask AI to rewrite" buttons | A second way to talk to the Sketcher. The chat already does it: "make the persona shorter". |
| Quick-reply chips under the Sketcher's questions | A second input. Each question already comes with a suggested answer, and typing "ok" accepts it. Chips stay only on the empty screen, where nothing else exists yet. |
| An Undo button (research open question 2) | Left out of P2. The Sketcher has the whole session, so "put the last version back" works by chat. Logged as assumption **J3** with a check. |
| A "that's them" button on voice cards | A second way to finish (Merlin cut it too). Microcopy points to Keep. |
| Progress bar or "70% done" | A fake number. Done is a feeling (research #7). |
| A sidebar list of agents | Making many agents is rare (research #19). One small switcher in the top bar does the job. |
| Visible "later" placeholders for uploads and the map | Dead UI makes people click and stop. The spots are reserved in the layout and the code, not shown (see §9). |
| "Kept · changed since" status (Merlin ★5) | A third status to explain. A change after Keep simply returns the panel to "Sketch" and Keep becomes pressable again. Two states, no new words. |
| Editing fields while the Sketcher is replying | The only real conflict between chat and hand edits. Fields are read-only for the few seconds of a reply (§6, rule H3). One rule, no merge logic. |
| Streaming the draft live, typewriter text, confetti, sound | Cut by Merlin; I agree. |

## 3. User model check

Checked against `research-columbo.md` (the user model for P2):

| Top behavior (score) | Where the design serves it |
|---|---|
| #1 Describe in one line (18) | Empty state: one question, three example chips, input focused (§6 S1). First reply fills all three fields (S3). |
| #2 Glance at the draft (18) | Fresh lines + "new" tag + change line under the reply (S4). |
| #3 Answer questions (17) | Normal bubble, suggested answer inline, skipping is fine (S5). |
| #4 Nudge by chat (17) | The chat input is always primary. Only changed fields react. |
| #5 Try it out (15) | Voice card (S7). |
| #6 Fix by hand (15) | Every field is a plain editable field, always visible, "✓ saved" and "yours" (S6). |
| #7 Keep (13) | One button, card, "you can keep changing it" (S8). |
| #8 Paste text (12) | Long-paste chip (S11). |
| #10 Come back (12) | Opens the last agent, "Back to [Name]" line (S9). |
| #20 Phone (4) | Narrow layout is simple and complete, but not the design driver (§7). |

**Assumptions (mine, please check):**
- **J1.** People read the chat left and the sketch right on a laptop.
  *Check:* in the Phase 6 live run, note where the eyes go first after a
  reply. If it's the Sketch every time, consider swapping sides.
- **J2.** Locking fields for the few seconds of a reply won't annoy anyone,
  because replies are short (research A3). *Check:* time 10 replies in
  Phase 6. If the median is over ~15 s, revisit rule H3.
- **J3.** No Undo button is fine for P2. *Check:* in Phase 6, nudge too far
  once and ask "put the last version back". If the Sketcher can't do it
  reliably, add a one-step Undo on the change line (it can reuse
  `PUT /draft`).
- **J4.** Opening straight into the most recent agent is right for most
  visits (research #10 vs. #19).

## 4. Names and words

From Merlin, used lightly. Plain labels; the world lives in microcopy.

| Thing | On screen |
|---|---|
| The creator AI | **Sketcher** (bubble label) |
| The draft panel | **Sketch** (panel title) |
| Finish | **Keep** (button), **Kept ✓** (status) |
| Persona field | **Persona**, hint "Who they are: voice, character, point of view" |
| Instructions field | **Instructions**, hint "What they do: job, rules, limits" |
| Name field | **Name**, no hint |
| Waiting | **Sketching…** |
| Creator changed a field | tag **new** |
| User changed a field | tag **✎ yours** |
| Hand edit saved | **✓ saved** (1.5 s) *(R1)* |

## 5. Layout

### Wide (≥ 860 px): two panes

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Agent Creator     [ Tony ▾ ]                                              │  top bar, 52px
├──────────────────────────────────────┬────────────────────────────────────┤
│                                      │ Sketch                    [ Keep ] │  panel header, 52px
│  You                                 │────────────────────────────────────│
│  ┌────────────────────────────────┐  │ Name                         new   │
│  │ A tough-love coach like Tony   │  │ ┃ Tony                             │
│  │ Robbins                        │  │                                    │
│  └────────────────────────────────┘  │ Persona                      new   │
│                                      │ Who they are: voice, character,    │
│  Sketcher                            │ point of view                      │
│  Here's a first sketch. He's direct, │ ┃ A high-energy coach who …        │
│  warm under the push, and talks in   │ ┃ …                                │
│  short bursts. Should he swear a     │                                    │
│  little, or keep it clean? I'd keep  │ Instructions                 new   │
│  it clean.                           │ What they do: job, rules, limits   │
│  Sketch: name, persona,              │ ┃ Help the user take one action …  │
│  instructions updated                │ ┃ …                                │
│                                      │                                    │
│                                      │ ┄┄ (later: P12 "What it knows") ┄┄ │  reserved, not rendered
│ ┌──────────────────────────────────┐ │                                    │
│ │ Reply to the Sketcher…        (↑)│ │                                    │
│ └──────────────────────────────────┘ │                                    │
└──────────────────────────────────────┴────────────────────────────────────┘
```

- **Chat pane (left):** flexible, min 420 px. Messages column max 680 px,
  centred in the pane. The composer is pinned to the bottom of the pane.
- **Sketch pane (right):** 44% of the width, min 380 px, max 560 px. Its
  own scroll. A 1 px divider between panes (8% currentColor). The Sketch
  pane sits on a very slightly raised surface (3% currentColor tint) so it
  reads as "the thing being made".
- Each pane scrolls on its own. The top bar and both headers stay put.
- **Why chat left, sketch right:** you speak, then it draws. The eye ends on
  the result. (Assumption J1.)

### Top bar
- Left: "Agent Creator" (17 px, semibold).
- Next to it: the **agent switcher**, a quiet button showing the current
  name (or "New agent" while the name is empty) and a ▾. It opens a small
  menu:
  ```
  + New agent
  ─────────────
  Tony            Kept   · 2 min ago
  Newsletter ed.  Sketch · yesterday
  ```
  Sorted by `updatedAt` (from `GET /api/agents`). An agent whose name,
  persona and instructions are all empty is not listed *(R8)*. An agent
  with a persona but an empty name shows as "Untitled sketch". Choosing one
  loads it (S9). The menu is the only list of agents in P2.
- Nothing on the right. (The P1 CLI status line is gone; health shows only
  when it's bad, see S10.)

### Type, space, color
- Font: `system-ui`. **Three sizes only:** 17 px (titles), 15 px (body,
  fields, bubbles), 13 px (labels, hints, tags, change line).
- Line height 1.5 for body and fields.
- Spacing on an 8 px grid: 8 inside tight groups, 16 between fields' parts,
  24 between fields and between messages from different senders.
- Color: neutral text and surfaces (`color-scheme: light dark`). **One
  accent**, the P1 blue `#2d6cdf`, for user bubbles, Send and Keep.
  **One warm mark color** for fresh lines: `#E8A33D` (light) / `#F0B95A`
  (dark) for the margin bar; the "new" tag *text* uses `#8A5A00` (light) /
  `#F0B95A` (dark) to keep ≥ 4.5:1 contrast. Errors use `#c0392b` (light) /
  `#ff6b5b` (dark).
- Bubbles: user = accent background, white text, right-aligned, max 80%.
  Sketcher = no bubble background at all, just text with a 13 px "Sketcher"
  label above it. The Sketcher's words are calm; the user's words are the
  colored ones.

### Composer
- One auto-growing textarea (1 to 8 lines, then it scrolls), radius 12 px,
  min height 44 px.
- Placeholder: empty agent → "Type here…" *(R11: the S1 heading already
  asks the question)*; otherwise → "Reply to the Sketcher…".
- **Enter sends, Shift+Enter adds a line.** A round Send button (44 × 44,
  arrow icon, `aria-label="Send"`) inside the right edge. Disabled when the
  box is empty.
- While sketching, the same button becomes **Stop** (square icon,
  `aria-label="Stop"`). Esc in the composer also stops.
- **Reserved, later (P3):** the left edge of the composer is the spot for
  an "add references" control. In P2 it is not rendered (see §9).

### The Sketch fields
- **Name:** single-line input. **Persona** and **Instructions:** textareas
  that grow to fit their text (no inner scroll; the pane scrolls).
- Each field: label (13 px, semibold) on the left, tag ("new" / "✎ yours")
  on the right of the label row, hint below the label (13 px, 60%
  opacity), then the field.
- Fields look like text, not like form boxes: no border at rest, a 1 px
  border on hover, a 2 px accent focus ring on focus. A pencil cursor isn't
  needed; the hover border and the I-beam say "editable".
- The fresh-line mark is a 3 px bar on the field's left edge (the ┃ in the
  sketches).

## 6. Every state

Event names refer to the server SSE stream in the Roadmap (Phase 4):
`delta`, `draft { draft, changed }`, `done { say, sessionId }`,
`error { kind, message, traceId }`.

### S0. Loading (under ~300 ms, usually invisible)
- On open: `GET /api/health` and `GET /api/agents` in parallel.
- If there is at least one agent → load the most recent (`GET
  /api/agents/:id`) and go to S9 (or S1 if its draft is empty).
- If there is none → `POST /api/agents`, then S1.
- While loading: panes and headers render; fields show their placeholder
  lines; no spinner. If loading takes over 1 s, the chat shows "Opening…"
  (13 px, 60%).

### S1. Empty, first visit (Merlin ★3)
```
Chat pane (vertically centred in the pane):

        Who should this agent be? One line is enough.

        [ A tough-love coach like Tony Robbins ]
        [ A blunt editor for my newsletter ]
        [ Me, for answering client emails ]

  ┌──────────────────────────────────────┐
  │ Type here…                        (↑)│
  └──────────────────────────────────────┘

Sketch pane:
  Sketch                          [Keep] (disabled)
  Name          ▁▁▁▁▁▁▁▁                 (faint placeholder bar)
  Persona       ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
                ▁▁▁▁▁▁▁▁▁▁▁
  Instructions  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
                ▁▁▁▁▁▁▁▁▁▁▁▁
```
- The composer has focus.
- **Chips:** clicking one puts its text in the composer (not sent), and
  places the cursor at the end, so the user can add "…but gentler" before
  sending. Chips are 36 px high with 8 px between them (tap area padded to
  44 px). Chips disappear for good once the first message is sent.
- Fields are editable even now. A power user can type a name by hand
  first; that's fine (it just becomes "✎ yours").
- Placeholder text inside empty fields (shown as the faint bars, and as
  real `placeholder` text for screen readers): Name "A name", Persona
  "Appears after your first message", Instructions "Appears after your
  first message".
- Keep is disabled (tooltip: "Give it a name first").

### S2. First message sent, waiting for the first sketch (★3)
- The user bubble appears at once. The chips are gone.
- Below it: "Sketcher" label and **Sketching…** with three dots that pulse
  in sequence (a pencil rhythm, 1.2 s loop).
- Sketch header: the title reads **Sketching…** in place of "Sketch". This
  happens on **every** turn, not only the first. It is the only place
  besides the chat that says "Sketching…" *(R7)*.
- The three fields get a slow, faint shimmer (left-to-right sheen, 1.6 s
  loop, 6% opacity). **This is the only time fields shimmer.**
- Fields are read-only (rule H3).
- As `delta` events arrive, the Sketcher's text streams in under its label
  and the dots disappear. Auto-scroll follows the stream only if the user
  was already at the bottom.

### S3. The first sketch lands (★3)
- On the `draft` event: fields fill **top to bottom**, Name first, each
  fading in 80 ms after the one above (200 ms fade each). Total under
  0.3 s.
- Each changed field gets the fresh-line mark and the "new" tag (S4).
- The top bar switcher now shows the name.
- Under the reply: the change line (S4).
- A quiet hint appears once, as the composer placeholder for the next turn:
  "Ask how Tony would answer something real…" (uses the current name). After
  that turn, the placeholder goes back to "Reply to the Sketcher…".

### S4. Draft growing (Merlin ★1)
On every `draft { draft, changed }` event:
- **Only fields in `changed` react:**
  - the 3 px warm bar on the left edge appears at full strength and fades
    to nothing over 4 s;
  - the **new** tag appears in the label row and stays until the next
    message is sent;
  - the field's text is replaced in place. The caret and scroll position of
    the pane are kept.
- Unchanged fields do nothing at all.
- **Change line**, under the Sketcher's reply, built from `changed` only,
  never from the AI's words, in field order:
  - one field: `Sketch: persona updated`
  - two: `Sketch: name and persona updated`
  - three: `Sketch: name, persona and instructions updated`
  - 13 px, 60% opacity, with a small ↗ glyph. It's a button: clicking it
    scrolls the Sketch pane to the first changed field and briefly
    re-shows its bar (on narrow screens it switches to the Sketch view
    first).
- A reply with no `draft` event (no block, broken block, or nothing
  changed) shows **no change line** and moves nothing. That silence is
  honest.
- Line-level tint in Instructions (Merlin's optional step 2) is **not in
  P2**. The whole-field bar is enough to start. Add it later if long
  instructions make changes hard to find.

### S5. The Sketcher asks a question
- A normal Sketcher reply. No special card, no chips, no form.
- The question carries its suggested answer in the same sentence ("Should
  he swear a little, or keep it clean? I'd keep it clean."). The creator
  prompt owns this; the screen does nothing special.
- The user may answer, answer only part, type "ok", or ignore it and say
  something else. All are normal sends.

### S6. The user edits a field by hand (Merlin ★2)
**Rules (one source of truth, hand edits win):**
- **H1. Save:** a hand edit is sent with `PUT /api/agents/:id/draft` with
  just that field, on blur, and also after 1 s of no typing. On success, a
  quiet **✓ saved** *(R1)* shows in the label row for 1.5 s, then the tag
  becomes **✎ yours**.
- **H2. Yours:** "✎ yours" stays on that field until a `draft` event lists
  that field in `changed`. Then it becomes "new" (never both at once). The
  client keeps the `yours` set in memory only; on reload the marks are gone
  (the edits are not — they're saved).
- **H3. No edits during a reply:** when the user sends a message, any
  unsaved hand edit is saved first (PUT, then the chat POST). While
  sketching, all three fields are read-only (`readonly`, not `disabled`, so
  text can still be selected and read by screen readers). The tag area of
  each label row stays empty while the reply runs; there is no per-field
  "Sketching…" *(R7)*. When `done` or `error` arrives, fields open again. This removes the one real conflict between
  chat and hand edits.
- **H4. The Sketcher knows:** every turn the server sends the whole current
  draft (with hand edits) into the prompt, plus the names of fields edited
  by hand since the Sketcher last changed them, so it asks before touching
  them. *Simplest choice:* the server tracks those field names itself (a
  field PUT by hand is "yours" until a patch changes it), so the chat
  request stays `{ message }`.
- **H5. Clearing a field:** allowed. An empty Name disables Keep again.
- **H6. Save failed:** if the PUT fails, the label row shows
  "Not saved · Try again" (error color) *(R4)*. The text stays in the
  field. Try again resends. A failed or pending hand save never blocks
  Send or Keep *(R5)*: pressing Send retries the PUT first. If it fails
  again, the turn doesn't go out, the field keeps "Not saved · Try again",
  and the composer keeps its text. The Sketcher never sees an old draft.

### S7. It speaks: a voice card (Merlin ★4)
- Rendering rule: inside a Sketcher reply, a markdown blockquote that
  starts with `**[Name]:**` renders as a **voice card**:
  ```
  Sketcher
  Here's how he'd answer that:

      ┌───────────────────────────────────────┐
      │ (T) Tony                              │
      │ Get up. Not in an hour, now. Put your │
      │ feet on the floor and say out loud …  │
      │ sample, from the current sketch       │
      └───────────────────────────────────────┘

  If that's him, press Keep.
  ```
  - "If that's [them], press Keep." comes at most **once per agent**, after
    the first voice card, and never after Keep. The creator prompt owns
    this *(R10)*.
  - Indented 24 px, 1 px border, radius 12 px, 16 px padding.
  - Header: a 24 px circle with the name's first letter, then the name
    (13 px semibold). Uses the name in the blockquote, so it matches what
    the Sketcher wrote.
  - Body: 15 px, the same font in *italic* — readable, a different voice.
  - Caption: "sample, from the current sketch" (13 px, 60%).
- The first voice card per agent rises in (scale 0.98 → 1 and fade, 250 ms).
  Later ones just appear. The "first" flag is client memory only.
- Any other blockquote renders as a plain quote.
- While streaming, the blockquote renders as plain text until `done`, then
  becomes the card (no half-built cards).

### S8. Finish: Keep (Merlin ★5)
- **Keep** is a button in the Sketch header, right side. Accent outline
  style (not filled) so it never shouts over Send.
- **Enabled when:** the name is not empty, status is `'draft'`, and nothing
  is sketching. A pending hand save does not disable it *(R5)*.
- **On click:** first save any pending hand edit (PUT), then
  `POST /api/agents/:id/save`. If either fails, see "Save failed" below.
  On success:
  - The button is replaced by the status text **Kept ✓** (13 px, semibold,
    not a button).
  - A card settles at the top of the Sketch pane (fade + 8 px slide down,
    200 ms):
    ```
    ┌──────────────────────────────────────┐
    │ Tony                                 │
    │ A high-energy coach who pushes you   │
    │ to act today.                        │
    │ Yours. You can keep changing it.     │
    └──────────────────────────────────────┘
    ```
    The second line is the persona's first sentence (up to the first `.`,
    `!` or `?`, max 140 characters, with "…" if cut). No AI call. The card
    has no "Kept ✓" of its own, because the header right above it already
    says so *(R3)*.
  - Nothing is added to the chat *(R3)*.
  - The switcher menu shows "Kept" next to it.
  - If the user types "save it" or "done" in the chat, the Sketcher never
    claims it saved or kept the agent. It says the work is autosaved and
    points to Keep. Keep is the only way to finish *(R2, creator prompt)*.
- **Reserved, later (P12):** the Keep card has one held line under
  "Yours…" for the short capability summary. Not rendered in P2.
- **After Keep:** fields stay editable and the chat stays open. Any change
  (hand edit or `draft` event) autosaves with status `'draft'`: the card
  goes away, the header shows **Keep** again (enabled). Nothing else
  happens; no warning, no dialog.
- **Save failed:** the button shows "Couldn't keep · Try again" for 4 s,
  then returns to Keep. The work is safe (autosaved), so no alarm.

### S9. Coming back (Merlin "Back to [Name]")
- On open, the most recent agent loads with its draft, its status and
  **no old chat bubbles** (chat history is P9). The chat shows one centred
  line: **Back to Tony.** (13 px, 60%), and the composer has focus.
- If the agent has a `sessionId`, the first message continues that session
  (`--resume`), so the Sketcher knows the history. There is no AI call on
  open, so opening is instant and free. There is **no automatic recap**
  either: the Sketch on screen is the recap. The Sketcher gives one only
  when asked ("where were we?") *(R6)*.
- No marks show on fields after a reload (no "new", no "yours").

### S10. Errors and the CLI offline (Merlin "Sketcher is away")
**One rule for every failed turn:** the user's message bubble stays, and
under it a line in the error color says what happened and offers
**Try again**, which resends the same message. Any partial Sketcher text
from that turn is removed. The draft is never touched by a failed turn.
Fields open again. **While the offline banner shows, the line under the
bubble has no Try again of its own.** The banner's button does the job
*(R4)*.

| Cause | When | Line under the user's bubble | Extra |
|---|---|---|---|
| CLI not installed | `GET /api/health` → `installed: false` on open | — (no bubble yet) | **Offline banner** above the composer (below). Send disabled; typing allowed. |
| `error.kind = 'not-installed'` | mid-turn | "The Sketcher can't reach Claude right now." (no link, R4) | Offline banner appears, its button reads **Try again**. |
| `error.kind = 'failed'` | the CLI ran and failed (includes not signed in) | "Something went wrong on Claude's side. · Try again · Details" | **Details** expands the `message` and `traceId` in 13 px monospace. |
| `error.kind = 'bad-output'` | odd CLI output | "The Sketcher's reply came back garbled. · Try again" | Details as above. |
| `error.kind = 'cancelled'` / user pressed Stop | | "Stopped. · Try again" (neutral color, not red) | — |
| Network / server down (fetch throws, stream ends without `done`) | | "Lost the connection to the app. · Try again" | — |

**Offline banner** (only when health says not installed):
```
┌──────────────────────────────────────────────────────────┐
│ The Sketcher can't reach Claude right now.               │
│ Your text stays here.            [ Check again ]  How to fix ▸ │
└──────────────────────────────────────────────────────────┘
```
- "Your text stays here." replaces "Your message is kept." *(R1)*.
- Sits directly above the composer, full composer width, error-tinted
  surface (6% error color), 13 px text.
- "How to fix ▸" expands: "Agent Creator uses Claude Code on this
  computer. Install it, run `claude` once in a terminal to sign in, then
  press the button again."
- **One button, two labels** *(R4)*: **Try again** when there is a failed
  turn, **Check again** when there isn't (for example on open). Both re-run
  `GET /api/health`. If it's back, the banner goes away, Send is enabled,
  and with Try again the failed turn is sent again. Clicking it is the
  user's go-ahead, so the resend isn't a surprise.
- Text in the composer is never cleared by an error.
- `role="alert"` for the banner, so it's announced once.

### S11. A long paste (Merlin "pasted note")
- When a sent message is over 300 words, its bubble shows a collapsed
  chip: **Pasted note · 1,240 words ▸**, plus any short text the user typed
  before the paste as normal bubble text. *Simplest choice:* the whole
  message is one text; the chip shows the first line and the word count,
  and ▸ expands the full text in place.
- The composer accepts any length; it grows to 8 lines then scrolls.
- Nothing is sent differently: the server gets the full message.

### S12. New agent
- From the switcher: **+ New agent** → `POST /api/agents` → S1 with a clean
  chat. The previous agent is already autosaved; no prompt.
- If the current agent is still empty (no name, persona or instructions),
  **+ New agent** does nothing new: it stays on the same S1 *(R8)*.
- While sketching, **+ New agent and every agent row** in the menu are
  disabled, with the tooltip "Wait for the Sketcher to finish" *(R9)*. The
  switcher button itself still opens the menu, so the reason can be read.

## 7. Narrow screens (< 860 px)

Rare (research #20), so: simple, complete, no extra features.

```
┌──────────────────────────────┐
│ Agent Creator   [ Tony ▾ ]   │  top bar
│ [  Chat  |  Sketch •  ]      │  segmented switch, 44px high
├──────────────────────────────┤
│                              │
│  (the chat, or the sketch)   │
│                              │
├──────────────────────────────┤
│ Reply to the Sketcher…   (↑) │  composer, only in the Chat view
└──────────────────────────────┘
```
- One pane at a time, chosen by a two-part switch **Chat | Sketch** under
  the top bar. Chat is the default.
- When a `draft` event changes fields while the Chat view is open, a dot
  (•, warm mark color, plus `aria-label="Sketch, updated"`) shows on
  "Sketch" until the user opens it. The change line in the chat also
  switches to the Sketch view and scrolls to the field.
- The Sketch view has the same header (Sketch + Keep) and fields. It has no
  composer. The fresh-line bars play when the user opens the view if they
  haven't played yet (so they're seen, not missed).
- The first sketch (S3) does **not** auto-switch views; the dot and the
  change line invite the user. Focus never moves on its own.
- Margins 16 px. Bubbles max 88%. Voice card indent 12 px.
- Keyboard on phones: the composer stays above it (`interactive-widget=
  resizes-content` in the viewport meta, plus `100dvh` layout).

## 8. Motion and accessibility

**Motion** (all under 300 ms, except the 4 s fresh-line fade, which never
blocks anything):
| Motion | Duration |
|---|---|
| First-sketch stagger | 200 ms fade each, 80 ms apart |
| Fresh-line bar fade | 4 s, ease-out |
| ✓ saved | shows 1.5 s, 150 ms fade out |
| First voice card rise | 250 ms |
| Keep card settle | 200 ms |
| Sketching dots | 1.2 s loop |
| First-run shimmer | 1.6 s loop, only during S2 |

**`prefers-reduced-motion`:** fades and rises are instant; the shimmer and
dots become the static word "Sketching…"; the fresh-line bar shows solid
until the next turn instead of fading. Tags stay (they carry the meaning).

**Accessibility:**
- Contrast: all text ≥ 4.5:1, including 13 px hints at 60% opacity (check
  in both color schemes; raise opacity if a scheme fails).
- Tap targets ≥ 44 × 44 px (Send/Stop, Keep, chips' padded area, switch,
  Try again).
- Never color only: "new", "✎ yours", "✓ saved", "Kept ✓" are words.
- Chat list: `role="log"`, `aria-live="polite"`. Deltas are **not**
  announced one by one; on `done`, one announcement: the reply text, then
  the change line ("Sketch: persona updated").
- Each field: a real `<label>`, the hint tied with `aria-describedby`, the
  tag inside the label as visually-small text so it's read with the label
  ("Persona, new").
- Read-only during sketching uses `readonly` + `aria-busy="true"` on the
  Sketch region.
- Keyboard: Tab order is top bar → chat → composer → Send → Sketch header
  (Keep) → Name → Persona → Instructions. Enter sends; Shift+Enter new
  line; Esc stops sketching. The switcher menu works with arrow keys and
  Esc.
- **Focus never moves on its own.** After a reply, focus stays where the
  user left it (usually the composer).

## 9. Reserved spots for later (not built in P2)

Reserved in the layout and the markup, **not visible to users in P2** (an
empty container with a comment and `hidden`), so P3 and P12 slot in
without moving anything.

| Spot | Feature | Where | P2 markup |
|---|---|---|---|
| **References** (uploads) | **P3 — later** | Left edge of the composer (an "add references" button), and a thin row under the Sketch header listing what's pinned. Pasted-note chips (S11) are P2's only references. | `<div class="composer-lead" data-later="P3" hidden></div>` and `<section class="references" data-later="P3" hidden></section>` |
| **What it knows** (capability map, only the user sees it) | **P12 — later** | In the Sketch pane under Instructions, on a visibly different surface (inset, dashed top border, label "What it knows · only you see this"), so it never reads as part of the agent. | `<section class="capability-map" data-later="P12" hidden></section>` |
| **Keep card capability line** | **P12 — later** | One line in the Keep card, under "Yours. You can keep changing it." | `<p class="keep-capability" data-later="P12" hidden></p>` |

## 10. Data note: the draft and how the chat updates it

**The draft** (server is the one source of truth):
```js
{ name: string, persona: string, instructions: string, status: 'draft' | 'saved' }
```
Nothing else goes into it. The P12 map never does.

**Client state** (the small non-DOM module from Roadmap Phase 5):
```js
{
  agent:   { id, draft, sessionId },
  phase:   'idle' | 'sketching' | 'error',
  health:  { installed: boolean },
  fresh:   Set<'name'|'persona'|'instructions'>, // "new" tags, cleared on next send
  yours:   Set<'name'|'persona'|'instructions'>, // "✎ yours", memory only
  pending: Set<field>,                            // hand edits not yet saved
  firstVoiceShown: boolean                        // memory only
}
```

**How the chat updates it:**
1. User sends → save any `pending` or failed hand edit (PUT; if it fails,
   stop here, R5) → `fresh` cleared →
   `phase = 'sketching'` → `POST /api/agents/:id/chat { message }`.
2. `delta` → append text to the streaming Sketcher bubble (the server has
   already removed the `<draft>` block).
3. `draft { draft, changed }` → `agent.draft = draft` (replace, don't
   merge: the server already merged); `fresh = changed`; remove `changed`
   fields from `yours`; play ★1 (or ★3 on the first sketch); if
   `status` was `'saved'`, it's now `'draft'` and the Keep card goes.
4. `done { say, sessionId }` → replace the streamed text with `say` (the
   final result wins); render voice cards; add the change line if step 3
   happened; `agent.sessionId = sessionId`; `phase = 'idle'`.
5. `error { kind, message, traceId }` → remove partial text; S10 line;
   `phase = 'idle'` (or offline if `kind = 'not-installed'`). Draft
   untouched.

**Hand edit:** `PUT /api/agents/:id/draft { [field]: value }` → response
is the full draft → `agent.draft = it`; add field to `yours`; ✓ saved.

**Keep:** save any `pending` hand edit (PUT) → `POST /api/agents/:id/save`
→ `status = 'saved'`.

**What the server does** (confirmed in the Roadmap, Phases 3–4):
- `PUT /draft` and `POST /save` return the full draft.
- Any autosave after Keep (hand edit or chat patch) sets `status` back to
  `'draft'`.
- The server tracks which fields were edited by hand since the creator
  last changed them, and passes those names into the creator prompt (H4).
  These names are kept in the agent record as `handEdited`.
- `GET /api/agents` items are `{ id, draft: { name, status }, updatedAt }`
  for the switcher. Empty agents are left out (R8).

## 11. Magic moments from Merlin: in or out

| Moment | Verdict | Note |
|---|---|---|
| ★1 Fresh lines (bar, "new", change line) | **In** | Line-level tint in Instructions: later. |
| ★2 Your own line ("✓ saved", "✎ yours", ask before changing) | **In** | Plus rule H3 (read-only while sketching). "✓ kept" renamed (R1). |
| ★3 First sketch (chips, shimmer, stagger) | **In** | Chips fill the box, they don't send. |
| ★4 It speaks (voice card, first-breath rise) | **In** | Blockquote rule; card only after `done`. |
| ★5 Keep (button, card, "yours") | **In** | "Kept · changed since" cut: back to Keep instead. Local chat line cut (R3). |
| Sketching… dots | **In** | |
| Back to [Name] | **In** | Static line on open; no AI call on open and no automatic recap (R6). |
| Pasted note chip | **In** | |
| Sketcher is away | **In** | Offline banner + one error rule. |
| References (P3) / What it knows (P12) | **Reserved, later** | Hidden in P2. |
| Sound on Keep | **Out** | Merlin agrees: none in P2. |

## 12. Labels, all in one place

| Where | Text |
|---|---|
| App title | Agent Creator |
| Switcher (no name) | New agent |
| Switcher menu | + New agent · [Name] Kept/Sketch · [time] · Untitled sketch |
| Empty prompt | Who should this agent be? One line is enough. |
| Chips | A tough-love coach like Tony Robbins · A blunt editor for my newsletter · Me, for answering client emails |
| Composer placeholder | Type here… (empty agent) / Reply to the Sketcher… / Ask how [Name] would answer something real… (once) |
| Send / Stop | aria: Send / Stop |
| Chat sender labels | You · Sketcher |
| Sketch title | Sketch / Sketching… |
| Field labels | Name · Persona · Instructions |
| Field hints | Who they are: voice, character, point of view · What they do: job, rules, limits |
| Empty field placeholders | A name · Appears after your first message |
| Tags | new · ✎ yours · ✓ saved · Not saved · Try again |
| Change line | Sketch: [fields] updated |
| Voice card caption | sample, from the current sketch |
| Keep | Keep · Kept ✓ · Couldn't keep · Try again · tooltip: Give it a name first |
| Keep card | [Name] · [first sentence of persona] · Yours. You can keep changing it. |
| Return | Back to [Name]. |
| Loading (> 1 s) | Opening… |
| Errors | see S10 table |
| Offline banner | The Sketcher can't reach Claude right now. Your text stays here. · Try again (failed turn) / Check again (none) · How to fix ▸ |
| How to fix | Agent Creator uses Claude Code on this computer. Install it, run `claude` once in a terminal to sign in, then press the button again. |
| Switcher blocked tooltip (New agent and every row, while sketching) | Wait for the Sketcher to finish |

## 13. Build order and checks (for Uncle Bob)

Build and check each piece on its own before joining them:
1. Static layout, wide and narrow, with a fake draft (S1, S9 look).
2. The field component: label row with tag slot, hint, auto-grow, save on
   blur/idle, ✓ saved, yours, readonly mode.
3. The chat list: user bubble, Sketcher text, change line, voice card,
   pasted-note chip, error line.
4. The non-DOM module: SSE parser, the reducer in §10, health → offline.
   Unit-test it (Roadmap Phase 5).
5. Wire to the real routes; walk S1 → S12 by hand in both color schemes,
   with reduced motion on once, and with keyboard only once.
