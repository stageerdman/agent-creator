# Magic — Moments and names for the agent-creation chat (P2)

*Merlin, Magic Director. 2026-11-24. For Jony (design), Eraser (review),
Columbo, and the build team. Built on `research-columbo.md` and the Roadmap
in `update v1.md`.*

## Summary

**The world: a portrait sitting.** The user is the only person in the
room who knows what the subject really looks like. The creator AI is a
sketch artist who never met them. It draws fast, the user corrects, and it
ends when the user says **"that's them."**

- The draft panel is **the Sketch**.
- The creator is **the Sketcher**.
- The finish step is **Keep**.

There are five moments, ranked below. All of them are light: a fade, a mark,
a label, a card. None of them adds a step or a wait.

## 1. The person and the true job

- **Mood on arrival:** evening, curious, a little skeptical. The person or
  role is fresh in their head. They don't want to write a prompt (research
  #1).
- **What the product really does:** it does not *write a prompt*. It
  turns a memory of someone into a **likeness** that the user can recognise.
- **The human truth nobody uses:** in this product the user is not the
  customer. **They are the witness.** The AI has never met Tony Robbins the
  way the user has, through hundreds of hours of listening. Only the user
  can say "that's him." Every moment below gives that authority back to
  them:
  - their hand edits are their own lines, so nobody draws over them;
  - "done" is their recognition, not the AI's claim.

## 2. Things that do the same job

| # | Source | Mapping | Verdict |
|---|---|---|---|
| 1 | **Sketch artist working from a witness's memory** | You describe, it sketches in seconds, you say "jaw wider", it changes only that, you say "that's him". Matches research #1, #2, #4, #6 and #7 almost one to one. | **Keep, recommended.** I use the warm portrait version, not the police one ("suspect" is the wrong feeling). |
| 2 | **Nüwa shaping people from clay**: the myth behind this repo's `nuwa-skill` | Soft clay = draft. Your thumbprint stays in the clay = hand edits are sacred. Breath = the first time it speaks. | **Backup A.** It's beautiful and it's native to the repo. But the natural finish is firing in a kiln, which says *final*, and that's the fear the research warns about (#7). Also very grand for a ten-minute evening. |
| 3 | **Casting and rehearsal**: an actor reads lines, the director gives notes | Nudges = director's notes ("less hype"). Try it out = the read-through. Keep = "you're cast". | **Backup B.** Great for try it out (#5). Weak for hand edits, because you don't rewrite an actor by hand. |
| 4 | **Tailor's fitting**: basting stitches, pins, try it on | Basting = temporary draft. Pins = nudges. | Dropped. Good for *fit*, but nothing in it maps to *voice*. A role-builder world, not a clone-maker one. |
| 5 | **Tuning an instrument** | Strike a note = try it out. In tune = done. | Dropped. It covers only one moment. Nothing maps to name, persona or instructions. |
| 6 | **Ghostwriter** | Writes in someone's voice. | Dropped. Too close to what the product literally is, so it explains nothing. And the user isn't hiring someone to hide behind. |
| 7 | **Perfumer's accords** | Small, precise adjustments to a whole. | Dropped. It needs explaining. |

## 3. The world: a portrait sitting

One language, used lightly. The labels stay plain. The world lives in
microcopy, marks and motion, never in words the user has to decode.

| In the product | In the world | Plain label on screen |
|---|---|---|
| Draft panel (name, persona, instructions) | **The Sketch** | "Sketch" |
| Creator AI | **The Sketcher**: fast, humble, asks the witness | "Sketcher" |
| Persona | how they *are* | "Persona: who they are" |
| Instructions | what they *do* | "Instructions: what they do" |
| A creator change | **fresh lines** | the mark "new" |
| A hand edit | **your own line** (the witness took the pencil) | the mark "yours" |
| Waiting for a reply | sketching | "Sketching…" |
| Sample answer in the agent's voice | **it speaks** | the agent's own name on the bubble |
| Finish | **"That's them"**, and you keep it | button "Keep"; status "Kept" |
| Autosave | the sketch never leaves the easel | "Saved as a sketch" (quiet) |
| Coming back | the sitting continues | "Back to [Name]" |
| P3 uploads (later) | **references** pinned beside the easel | "References" (later) |
| P12 map (later) | **where the likeness is sharp, rough or blank** | "What it knows" (later) |

**What success, failure, waiting and returning mean here:**
- **Success** is recognition, not completion.
- **Failure** is a wrong line, and it's cheap: you redraw it.
- **Waiting** is the pencil moving, and it's short.
- **Coming back** means the sketch is still on the easel, just as you left
  it.
- **Nothing ever hardens.** "Kept" means *yours*, not *final*. This answers
  the fear in research #7.

## 4. The magic moments (ranked)

Ranked by: how much trust or feeling they carry × how often they happen ×
how light they are.

### ★1. Fresh lines: what just changed is visible
- **Behavior it serves:** #2, glancing at the draft after each reply (9/9,
  the top behavior), plus #4 nudges and the fear "the chat says it changed
  but did it?"
- **What happens:** when a `draft` event lands, only the fields in `changed`
  react:
  - each changed field gets a warm margin mark on its left edge, which fades
    over about 4 seconds;
  - a small "new" tag sits next to the field label until the next turn;
  - unchanged fields do **nothing**. Their stillness is the message: "I kept
    what you liked."
  - **Optional, step 2:** in long fields (instructions), tint the changed
    *lines* the same way, using a simple line diff of old and new text.
- **The chat side:** under the Sketcher's reply, one small line built from
  `changed` (never from the AI's words): `Sketch: persona, instructions
  updated`. Clicking it scrolls to the first changed field. The chat and the
  draft can't disagree, because this line *is* the data.
- **Why it helps and never gets in the way:**
  - It answers "what changed?" in a glance.
  - It's honest by construction.
  - It costs nothing, so it's fine the 100th time.
  - No wait, no step.
- **Weight:** light (CSS class plus a timer; the line diff is optional).
  **Built by:** Jony specifies it, the frontend builds it, using the
  `changed` list that `applyPatch` already returns.

### ★2. Your own line: hand edits are marked and kept
- **Behavior it serves:** #6 fixing a field by hand and #11 renaming. This is
  the top trust-breaker in rival tools.
- **What happens:**
  - When the user edits a field and leaves it, a quiet "✓ kept" appears by
    the field for about 1.5 seconds. It answers "was it saved?"
  - The field label then carries a small **"yours"** mark (a pen glyph plus
    the word) until the Sketcher changes that field.
  - If the Sketcher wants to change a field marked "yours", it asks in the
    chat first. That rule is already in the creator prompt (Phase 2).
  - When it does change that field (with permission), the "yours" mark turns
    into the normal "new" mark from ★1.
- **Why it helps and never gets in the way:**
  - It shows that the rule "hand edits win" is real.
  - It's information, not decoration.
  - No modal, no extra mode.
- **Weight:** light. The client remembers which fields were hand-edited since
  the last turn. It doesn't need to be stored. **Built by:** Jony (marks),
  frontend. Creator prompt owner: the prompt should be told which fields
  are "yours" (the field names only), so it knows to ask.

### ★3. The first sketch: a likeness in seconds
- **Behavior it serves:** #1, describing in one line (9/9). The most
  important number in P2 is the time to the first draft.
- **What happens:**
  - **Empty state:** the Sketch shows three empty fields with faint
    placeholder lines. The chat shows one plain line and three example
    chips:
    ```
    Who should this agent be? One line is enough.
    [ A tough-love coach like Tony Robbins ]
    [ A blunt editor for my newsletter ]
    [ Me, for answering client emails ]
    ```
  - **While the first reply streams:** the panel header says "Sketching…"
    and the three fields get a slow, faint shimmer. This is the only time
    the fields shimmer, because the first time all three will change.
  - **When the draft lands:** the fields fill top to bottom, each fading in
    about 80 ms after the one above. The **name settles first**, which is
    the "oh, it knows who he is" jolt.
- **Why it helps and never gets in the way:**
  - The draft appears the moment the data arrives.
  - The stagger lasts under 0.3 seconds and adds no wait.
  - It plays once per agent.
  - The chips show what a good first line looks like, which the research
    asks for.
- **Weight:** light. **Built by:** Jony (empty state, chip text), frontend.

### ★4. It speaks: the first time the agent comes alive
- **Behavior it serves:** #5, trying it out. The research calls the answer
  "wow, that's him" the strongest moment in the whole flow, and the way
  people decide they're done.
- **What happens:**
  - When the Sketcher gives a sample answer in the agent's voice, it shows
    as a **voice card**, not a normal Sketcher bubble:
    - it's labelled with the agent's current name and initial (`T · Tony`),
    - it's indented,
    - it uses a slightly different text style,
    - it has a small caption "sample, from the current sketch".
  - The first voice card per agent fades in with a tiny rise (scale 0.98 →
    1, about 250 ms). That's the breath. Later voice cards just appear.
  - The empty chat can hint at it after the first draft: "Ask how
    [Name] would answer something real."
- **Data note (simplest choice, so no new parsing):** the creator prompt
  asks the Sketcher to put sample answers in a markdown blockquote that
  starts with the agent's name in bold (`> **Tony:** …`). The screen renders
  a blockquote inside a Sketcher reply as a voice card. If the team decides
  on a real "try it" box (open question 1 in the research), the voice card
  becomes that box's answer style. The look stays the same.
- **Why it helps and never gets in the way:**
  - It makes "this is the agent, not the creator" clear at a glance, which
    the research names as a fear.
  - It plays once, then stays quiet.
  - There's no extra screen.
- **Weight:** light (rendering rule plus one line in the prompt). **Built
  by:** Jony (the card), the creator prompt owner (the blockquote rule),
  frontend.

### ★5. Keep: "that's them"
- **Behavior it serves:** #7, deciding it's done and saving. It happens once
  per agent and decides the feeling.
- **What happens:**
  - There's one button, **Keep**, always in the Sketch panel header. It's
    never in the chat, so there's only one way to finish.
  - On click:
    - the status changes from "Sketch" to **"Kept"**;
    - a small card settles at the top of the panel:
      ```
      ┌──────────────────────────────────────┐
      │ Tony                          Kept ✓ │
      │ Tough-love coach who pushes you to   │
      │ act today.                           │
      │ Yours. You can keep changing it.     │
      │ [ later: What it knows — P12 ]       │
      └──────────────────────────────────────┘
      ```
    - The summary is the persona's first sentence. No AI call, no wait.
  - The fields stay editable, so nothing locks.
  - The Sketcher adds one short line, never a cheer: "Kept. Come back any
    time to change it."
  - If the user edits after Keep, the status quietly goes back to "Kept ·
    changed since", and Keep can be pressed again.
- **Why it helps and never gets in the way:**
  - It turns a technical save (autosave already did the work) into a moment
    of ownership.
  - The words "yours" and "you can keep changing it" remove the fear of
    "final".
  - One click, no extra fields.
- **Weight:** light. **Built by:** Jony (card, labels), frontend. Sound:
  none needed. If ever, one soft paper "tap" on Keep only, off by default.

### Smaller touches (keep them, they're nearly free)
- **Sketching…** replaces a spinner while a reply streams: a three-dot
  pencil rhythm next to the word. Same meaning, warmer, no extra cost.
- **Back to [Name]:** when a sketch is reopened, the Sketcher's first line
  recaps in one sentence where they left off ("Last time we made him
  blunter. Want to try him on something?"). This serves #10, the returner.
  Owner: the creator prompt, using `--resume` context. The agents list shows
  "Sketch" or "Kept" and when it was last touched.
- **The pasted note:** a long paste (more than about 300 words) shows in the
  chat as a collapsed chip, `Pasted note · 1,240 words ▸`, so it doesn't
  flood the chat. This serves #8 and the research's "don't choke on long
  pastes". It's also P2's stand-in for References (P3).
- **Sketcher is away:** when the CLI is offline, the message is plain, in
  the world but never cute: "The Sketcher can't reach Claude right now.
  Your message is kept. [How to fix]". The typed text stays in the box.

## 5. Reserved slots for later

### P3: References (uploaded materials)
- **World:** portraitists work from references pinned beside the easel.
  Uploads are **References**.
- **Where it goes:** a strip at the top of the chat, or a thin row under the
  Sketch header, labelled "References · later". In P2, pasted-note chips
  are the only references.
- **Magic to add then:** when the Sketcher uses a reference in a reply, the
  reply's change line can name it ("Sketch: persona updated · from *Awaken
  the Giant*"). The fresh lines then show *where* the likeness came from.
  The user's rules ("only PDFs go to the knowledge base") are shown as
  small notes pinned on the reference.

### P12: What it knows (capability map, only the user sees it)
- **World:** how finished each part of the portrait is. These words map
  directly to the map's three levels and need no explaining:
  - **Sharp:** good at, well trained
  - **Rough:** medium, partly covered
  - **Blank:** not trained for
- **Where it goes:**
  - a "What it knows · later" row in the Sketch panel, under the three
    fields and visually apart from them, because it is *not* part of the
    agent;
  - the line held for it on the Keep card (★5).
- **Rule to keep in the design:** the map is drawn in a "behind the
  canvas" style, on a different surface or tint from the fields, with the
  label "only you see this". That keeps it visibly outside the agent, which
  matches the roadmap rule that it never goes into the draft.
- **Until then:** if the user asks "what does it know?", the Sketcher says
  plainly that the sketch only knows what's in these fields and this chat.
  No confident guess.

## 6. Names

### The creator AI
1. **Sketcher (recommended).** Plain, humble, and it explains itself: it
   draws, you correct. It sits naturally next to "You" on chat bubbles.
2. **Nüwa.** The repo's own heritage (`nuwa-skill`): the goddess who shaped
   people from clay. It's warm and personal. But it's a name, not a role, so
   new users won't know what it does, and it pulls toward Backup A's world.
   Good as an easter-egg subtitle, not the main label.
3. **Maker.** Neutral and safe, but forgettable. Use it if the team wants
   no theme at all.

### The draft panel
1. **Sketch (recommended).** Everyone knows a sketch is unfinished and
   erasable. The status pair is "Sketch" and "Kept".
2. **Likeness.** Truer to the job, but a bit literary as a label. Better in
   microcopy ("the likeness is getting there").
3. **Draft.** Plain fallback.

### The finish step
1. **Keep (recommended).** The button says "Keep", the status says "Kept".
   It means *yours*, not *final*.
2. **"That's them".** Perfect as a feeling, awkward as a button (pronouns
   change per agent). Use it in microcopy only, for example the Sketcher's
   hint after a voice card: "If that's them, press Keep."
3. **Sign it.** Strong ownership, but it suggests a commitment you can't take
   back. Rejected for the main label.

### Field hints (from research insight #8)
- **Persona:** "who they are: voice, character, point of view"
- **Instructions:** "what they do: job, rules, limits"

## 7. All ideas I considered, and the cuts

Kept above:
- fresh-line marks
- "new" tag
- change line in the chat
- "✓ kept" tick
- "yours" mark
- example chips
- first-draft stagger
- first-run shimmer
- voice card
- first-breath rise
- Keep card
- "Kept · changed since"
- Sketching… dots
- Back to [Name] recap
- pasted-note chip
- Sketcher is away
- Sharp / Rough / Blank (P12)
- References (P3)

**Cut, and why:**
- **Typewriter effect on the draft fields:** it makes the user wait for text
  that's already there.
- **Streaming the draft live as the reply comes in:** it means parsing
  half-written JSON, it breaks P1 pitfall 8 (parse from `result` only), and
  it makes fields jump while you read.
- **Confetti or a burst on Keep:** generic, and loud for a quiet moment of
  ownership. It wears thin by the third agent.
- **"Likeness 70%" progress bar:** a fake number. "Done" is a feeling
  (research), and a bar would rush people or lie to them.
- **Kiln or firing on save:** says *final*, which is the exact fear to
  remove.
- **A handwriting font for the agent's voice:** hard to read, and bad for
  accessibility. A slightly different but readable style is enough.
- **A "That's them" quick-reply button under voice cards:** a second way to
  save. Eraser would rightly cut it. Microcopy points to Keep instead.
- **Drag a chat sentence into a field:** a second way to edit, and it
  invites conflicts.
- **Pencil-scratch sound while sketching:** sound on every turn gets
  annoying fast.
- **A generated portrait avatar:** that's P7 (characters). The initial
  letter is enough for now.
- **A continuous "breathing" glow on the agent's name:** it means nothing
  after the first look, and it costs attention.
- **A Sketcher character with its own face and mood:** charming, but it
  pulls focus from the agent being made. The star is the subject, not the
  artist.

## 8. Motion, sound and accessibility rules

- **Durations:** every motion is under 300 ms, except the fresh-line mark,
  which fades on its own over about 4 seconds and never blocks typing.
- **Reduced motion** (`prefers-reduced-motion`):
  - Fades and the rise become instant.
  - The shimmer becomes a static "Sketching…" label.
  - Marks and tags stay, because they carry information.
- **Never color only:** "new" and "yours" are words, not just tints. They're
  announced to screen readers through an `aria-live="polite"` summary of the
  change line.
- **No sound in P2.** If one is ever added, it's for Keep only, soft, and
  off by default.
- **Focus:** the magic never moves focus. After a reply, focus stays in the
  chat input.

## 9. Hand-off

- **Jony (design):**
  - Use the names Sketcher / Sketch / Keep and the field hints.
  - Place moments ★1–★5 and the smaller touches in your states:
    - empty: ★3
    - first message: ★3
    - draft growing: ★1
    - hand edit: ★2
    - question: a normal bubble
    - errors and offline: Sketcher is away
    - finish: ★5
  - Reserve the References (P3) and What it knows (P12) spots, both marked
    "later". P12 goes on a visibly separate surface.
- **Eraser (review):** please check two things:
  1. Keep is the *only* finish path.
  2. The "yours" and "new" marks never show on the same field at once (the
     rule: "new" replaces "yours" only when the Sketcher changed that field).
- **Creator prompt (Phase 2 builder):**
  - Sample answers go in a blockquote starting with `**[Name]:**`.
  - Accept a list of field names the user edited by hand, and ask before
    changing them.
  - On resume, open with a one-line recap.
  - Answer "what does it know?" honestly.
- **Frontend (Phase 5):** everything here works with `changed` from the
  `draft` event and client-side state. There's no new server route or data
  field. The draft shape stays
  `{ name, persona, instructions, status }`.
- **Sound:** nothing to do in P2.

## Backups in one line each
- **A. Clay and breath (Nüwa):** Clay / Shaper / Breathe. Use it if the
  team wants the repo's heritage up front. Swap Keep for "Set on the shelf"
  so it never feels fired and final.
- **B. Rehearsal room:** Script / Director / Cast. Use it if try it out
  becomes a real mode and the main event of P2.
