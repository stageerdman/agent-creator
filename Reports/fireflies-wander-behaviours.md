# FIREFLIES WANDER: how people watch the left side, and why it looks stuck (Columbo)

## Summary

This report covers the left side of the creation screen once the files
have landed there: the loose cloud of dim fireflies, one per file, while
the user names the agent and works in the menu on the right.

The job people hire this field for is small but important: **"Show me my
material is in there, alive and taken care of, without making me read
anything."** There are no counts and no status lines (fixes 1 and 7), so
the fireflies are the only sign that the app has the files and is still
running.

**Why they look stuck today.** Each firefly sways at most 1.2–3 px around
its fixed spot, once every 14–26 seconds (`DRIFT_MAX = 3`, `flyParams` /
`flyAt` in `src/server/public/creation-screen.js`). That is about
0.3–1.3 px per second, on a 1.8 px dot. My estimate: at normal viewing
distance this is at or below the speed the eye notices as motion,
especially for small dim dots seen from the side of the eye. So people
don't see "calm". They see a **still picture of dots**, and sometimes a
faint shimmer they can't place. A still picture on a page that should be
alive reads as "frozen" or "hung".

The main findings:

1. **"Stuck" means "the app stopped", not "the flies are slow".** With no
   counts on screen, a field that doesn't visibly move is read as a
   stalled upload or a hung tab (D1). Motion is the progress bar here.
2. **People watch from the corner of their eye most of the time.** They
   are typing a name or dropping files on the right. Motion seen from the
   side of the eye pulls attention very strongly. So the wander must be
   slow, smooth and unhurried: visible when you look, ignorable when you
   don't (D2).
3. **"Real fireflies" means a few clear things to people:** slow drift,
   soft curves, hovering in place now and then, each one on its own path,
   and a light that comes and goes faintly. It does **not** mean buzzing,
   jitter, zig-zags, all flies moving the same way, or blinking in sync
   (D3, D4).
4. **The flies must never look like controls.** They must not brighten
   under the pointer, change the cursor, or follow a drag. Wandering
   flies are even more tempting to "catch" than still ones (W1).
5. **Smoothness is part of the look.** A fly that stutters on a 10,000-file
   folder looks broken, not calm. And Reduce Motion users must get a
   still field, with no shine (W3, W4).

## Scope

**In:**
- the left-side field after the flights from the orbit have landed:
  1 to 10,000 files (only the first 3,000 are drawn, `FIELD_CAP`)
- how people watch it: glancing, watching from the side of the eye while
  working on the right, following one fly, coming back to the tab
- what "stuck" means to them, and what "real fireflies" means to them
- what breaks trust: busy motion, looking clickable or draggable, slow
  frames, Reduce Motion

**Out (and why):**
- **the exact motion numbers** (speed, turn rate, pause length): that is
  Merlin's recipe (`Reports/fireflies-wander-motion.md`). Here I only say
  what people must *see and feel*.
- **the orbit and the flight from the orbit to the field:** covered in
  `Reports/one-flow-plus-to-chaos-behaviours.md`. Only the landing matters
  here: no jump at the moment a fly starts to wander.
- **the small fly clusters inside the right-side menu:** a different job
  (showing what a section holds). Their motion is not part of this task.
- **routing, removing and the menu itself:** covered in
  `Reports/creation-screen-behaviours.md`.
- **phones:** the creation screen is a desktop screen with Finder drops;
  phone use is very unlikely at this stage.

**Assumptions (marked, not checked with real users):**
- A1. People sit at a laptop or desktop, about 50–70 cm from the screen.
- A2. Most of the time their eyes are on the right side (name, menu), not
  on the field.
- A3. The field means "my files, in general". Nobody needs a fly to stay
  in one spot to find a file again: the field takes no pointer and shows
  no names. (If that changes, wandering would need a rethink.)

## Behavior table

Scores are 1–10. Sorted by the two scores together. When unsure, I chose
the lower score.

| # | Behavior | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| B1 | **Check it's working**: glance at the field while files pour in or right after | 9 | 9 | No counts on screen, so the field is the only proof. Every user glances, many times in the first minute. |
| B2 | **Work beside it**: name the agent or use the menu with the flies at the edge of view | 9 | 8 | This is where the eyes are most of the session; the field is always in the side of view. |
| B3 | **Rest the eyes on it**: watch it idly while thinking what to name the agent or what to drop next | 8 | 7 | Pauses in thought are natural; a living field invites a few seconds of watching. |
| B4 | **Follow one fly**: pick a single dot and track it | 7 | 7 | It's what people do with any field of moving dots (aquariums, snow, stars). It is also how they decide if it is "real" or "fake". |
| B5 | **Come back to the tab**: return after Finder, another app or a break | 7 | 7 | Gathering material means switching away; on return they check the screen is still alive in one glance. |
| B6 | **Read the bright and red flies**: notice used (bright) and removed (red) flies among the dim ones | 6 | 6 | They appear once the agent uses files; people look for them but don't stare. |
| B7 | **Try to touch a fly**: hover, click or try to drag one | 6 | 4 | Moving things invite a poke, more than still ones. Usually once or twice, then they learn. |
| B8 | **Drop a huge folder** (thousands of files) and watch whether the screen keeps up | 6 | 4 | Real for people with notes or code folders; done once or twice per agent. |
| B9 | **Resize the window** or move it to another screen | 5 | 4 | Happens when arranging Finder next to the app. |
| B10 | **Use Reduce Motion** and expect stillness | 4 | 8 | A minority, but they see this screen every single time with the setting on. |
| B11 | **Leave it open as ambient decoration**, or show it to someone | 4 | 3 | Some will enjoy it; not a core job. |
| B12 | **Look for one specific file** among the flies | 3 | 3 | There are no names on the field, so most give up at once; they use the menu instead. |

### Watch out (low scores, but they can break trust)

- **W1. Flies look like buttons or seem draggable.** If a fly brightens
  under the pointer, the cursor changes, or a fly seems to move toward or
  away from the mouse, people think they can pick it up. When nothing
  happens they feel the screen is broken, or they fear they moved a file.
  (B7)
- **W2. Flies so busy they distract.** Fast or sudden motion at the edge
  of view pulls the eyes away from typing, again and again. People feel
  nagged, then irritated, then look for a way to turn it off. (B2)
- **W3. Slow frames with many files.** A field that stutters or freezes
  for a moment reads as "it's choking on my folder". The laptop fan
  spinning up while the screen only shows dots also feels wrong. (B8)
- **W4. Motion for Reduce Motion users.** For people with vestibular
  problems, drifting dots across half the screen can cause real
  discomfort. Any motion when the setting is on breaks a promise the
  system made them. (B10)
- **W5. All flies in step.** If all flies move the same way or shine
  together, the field looks like a scrolling picture or a loading pulse,
  not like fireflies. Real fireflies can flash in sync. That is
  beautiful outdoors, but here it reads as "the app is doing something".
- **W6. Flies piling up at the edges.** Dots stuck against the border of
  the field, or a bare middle after a few minutes, look like a bug
  ("they are trapped").
- **W7. A jump on landing or resize.** A fly that lands from the orbit and
  then snaps to another place, or a whole field that jumps when the
  window is resized, looks like a glitch.
- **W8. The "hung tab" freeze.** If the browser pauses the animation
  in a background tab, the field must not "rush" to catch up when the
  user comes back. It should simply look alive again in the very next
  frame. (B5)

## Deep dives

### D1. Check it's working (B1: 9 / 9)

- **The moment:** A weekday, at a desk, laptop. They just dropped a
  folder of meeting notes or picked one in Finder. The flies left the
  orbit and landed on the left. The menu slid in on the right.
- **The trigger:** "Did it take everything? Is it still going?" There is
  no number to read, so they look at the field.
- **Thoughts:** *"OK, they landed… are they still doing something?"*
  *"Did it freeze? Nothing's moving."* *"Is it still loading the rest?"*
  With today's 3 px sway: *"Hm, it just stopped."*
- **Emotions:** Before: a little tense. They just handed over private
  material. During: relief if the field is clearly alive; unease if it
  looks like a picture. After: trust ("it has my stuff") or doubt
  ("let me reload to be sure").
- **Expectations:** Within one or two seconds of looking, they see that
  something is gently moving, without having to stare. No need to
  understand *what* the motion means, only that it is alive.
- **Success:** *"There they are, floating around. It's got my files."*
  They look away and move on to the name.
- **Friction and fears:** A still field means "hung", and they reload,
  which can interrupt a long upload. A field that suddenly looks very
  busy right after landing means "it's still working hard on
  something", and they wait for it to "finish", which never happens.
- **Product insight:** The wander is the "alive" signal, so it must be
  **visible within about 2 seconds of looking** for most of the flies,
  but it must not look like *work* (no rushing, no pulsing). Motion
  should feel the same at second 5 and at minute 10: the calm, steady
  state, not a "busy" state that later calms down.

### D2. Work beside it (B2: 9 / 8)

- **The moment:** Same session, a minute later. They click the name,
  type "Sales notes helper", then drag a PDF onto Knowledge. Eyes on the
  right; the field fills the left two-thirds of the screen, at the edge
  of their view.
- **The trigger:** None for the field. It is just there while they work.
- **Thoughts:** Mostly none about the field, which is good. If it
  distracts: *"Something moved over there."* *"Why do I keep looking
  left?"* *"Can I turn this off?"*
- **Emotions:** Best case: calm, a soft sense of company, like a quiet
  aquarium in an office. Worst case: a steady small irritation that
  builds up and spoils the whole screen.
- **Expectations:** The field stays in the background. Nothing in it
  ever asks for attention while they type: no sudden darts, no bright
  flashes, no group movements.
- **Success:** After five minutes of work they could not say what the
  flies did, yet when asked they say "they were floating around, it was
  nice".
- **Friction and fears:** Quick starts or sharp turns at the side of the
  eye pull attention, because the eye is built to notice them. Many flies
  turning at once acts like one big movement. A bright shine every few
  seconds somewhere acts like a blinking notification.
- **Product insight:** **Slow and smooth beats lively.** Speed changes
  must be gradual, turns must be soft curves, and shines must stay rare
  and faint (no more than `SHINE_MAX`). Each fly on its own path and
  timing, so the field never moves as one block. The motion must be
  calm enough that it never wins the eye over the cursor.

### D3. Rest the eyes on it (B3: 8 / 7)

- **The moment:** They have dropped their files and are thinking: what
  should this agent be called? What else should it know? They lean back
  a little and look at the field for 5 to 20 seconds.
- **The trigger:** A pause in thinking; the field is the softest thing
  on the screen.
- **Thoughts:** *"Ha, they really float around."* *"That one stopped…
  now it's going again."* *"Looks like a summer evening."* Or, today:
  *"Are they even moving? I think that one wobbled."*
- **Emotions:** Before: a bit of mental effort. During: a short rest,
  a small moment of delight. After: refreshed, a warm feeling about the
  app ("someone cared about this").
- **Expectations:** What people picture when they think "fireflies":
  slow drifting, soft loops and curves, a fly that hovers in one place
  for a moment and then drifts on, a faint light that swells and fades
  now and then. Different flies doing different things at the same time.
- **Success:** *"It feels like real fireflies on a lawn."* The field has
  variety: some drifting, a few hovering, one faintly glowing.
- **Friction and fears:** Things that make it look fake: all flies at
  the same speed, perfect circles or figure-eights that clearly repeat,
  straight lines with sharp turns at the end (like a bouncing
  screensaver), tiny trembling (jitter), and flies that never pause.
- **Product insight:** "Real" comes from **variety and pauses**, not from
  speed. A field where, at any moment, a few flies are hovering still
  while others drift is what makes it feel alive and natural.

### D4. Follow one fly (B4: 7 / 7)

- **The moment:** While resting the eyes (D3), they pick one dot and
  follow it for 10 to 30 seconds. This is the strictest test the field
  gets: one fly, watched closely.
- **The trigger:** Curiosity: *"Where is that one going?"*
- **Thoughts:** *"It's going over there… it curved… it stopped… now it's
  going back up."* With today's code: *"It's… not going anywhere. It's
  just shaking a tiny bit on its spot."* That is the moment "stuck" is
  born: **tied to a spot**, like a dot on a short string.
- **Emotions:** Before: idle curiosity. During: pleasure if the path is
  a story (go, curve, hover, go). Disappointment, even a feeling of
  being tricked, if it is on a string or repeats a small loop.
- **Expectations:** Over 20 to 30 seconds one fly travels a real
  distance across the field, clearly more than its own size, more like a
  hand's width or more on screen. It changes direction in soft curves.
  It sometimes slows to a hover. It never snaps, never shakes, never
  hits a wall and bounces.
- **Success:** *"That one went all the way over there."* They lose track
  of it only because it gently mixed in with others, not because it
  jumped.
- **Friction and fears:** Shaking or trembling on the spot (jitter)
  feels nervous or buggy. A fly reaching the border and sliding along it
  looks trapped. A fly that suddenly appears somewhere else looks like a
  glitch.
- **Product insight:** Each fly needs **a path that covers the whole
  field over time**, not a sway around a home spot. Near the edges it
  should turn away gently before reaching them. Its direction from one
  frame to the next must change smoothly, so no frame ever looks like a
  twitch.

### D5. Come back to the tab (B5: 7 / 7)

- **The moment:** They went to Finder to find one more folder, or got a
  Slack message, or made coffee. Two to twenty minutes later they come
  back to the browser tab.
- **The trigger:** Returning to finish the agent.
- **Thoughts:** *"Where was I… right, still here, still alive."* Or:
  *"Did it time out? It looks dead."*
- **Emotions:** Before: a little scattered. During: reassured if the
  field looks the same calm self as before. After: ready to go on.
- **Expectations:** In the first frame they see, the flies are already
  drifting as usual. No catch-up rush, no jump, no fade-in "restart".
  The flies may be in different places than before; that's fine and
  even expected ("they kept flying while I was gone").
- **Success:** It feels like the field was alive the whole time.
- **Friction and fears:** A field that looks frozen for a second and
  then all flies zip to new places looks like it was "stuck" and
  "recovered", which makes people doubt the uploads too.
- **Product insight:** Because the position depends only on the file and
  the time, the field is simply wherever it would have been. That's the
  right feel: **no catch-up motion, ever.**

## What "stuck" means to people

| They say | What they see | What they conclude |
|---|---|---|
| "It froze" | No visible motion within a couple of seconds of looking | The app or upload hung. They may reload. **Most harmful.** |
| "They're on a string" | A fly wobbles a few px around one spot and never leaves it | Fake, mechanical; the magic is gone |
| "They're trapped" | Flies sliding along or bunched at the field's edges | A bug; something is blocking them |
| "It's on a loop" | The same small circle or figure-eight again and again | A cheap animation, not living things |
| "It's twitching" | Tiny fast shakes, or a fly snapping to a new direction | Nervous, buggy, or the computer is struggling |

Today's field mostly causes the first two.

## What "real fireflies" means to people

- **Slow:** drifting, never darting. Slower than a walking person seen
  from afar.
- **Curves:** soft bends and loose loops, never sharp corners or straight
  lines that bounce.
- **Pauses:** now and then a fly slows down and hovers, then drifts on.
- **Each on its own:** different speeds, directions and timing. Never a
  flock, never in step.
- **Faint light:** dim most of the time; once in a while one swells a
  little and fades. Rare, soft, never a flash, never in sync.
- **No jitter:** the motion is smooth at every moment, even when looked
  at closely.
- **Spread out:** over time they cover the whole field, without piling up
  anywhere.

## Must-feel checks (what a person can see on screen)

Open the app from Start, add a folder of about 200 files, and wait until
the flies have landed. Then:

1. **Alive at a glance.** Look at the field for 2 seconds. You can tell
   at once, without staring, that the flies are moving.
2. **One fly travels.** Pick one fly and follow it for 20 seconds. It
   has moved clearly away from where it started (a hand's width or more
   on screen), not just shaken on its spot.
3. **Soft curves.** The path of that fly bends gently. You never see a
   sharp corner, a sudden reverse or a bounce.
4. **Pauses.** Over 30 seconds of watching the whole field, you see some
   flies slow down and hover for a moment, then drift on.
5. **No jitter.** Look closely at a few flies. None tremble or twitch.
6. **Not in step.** The flies don't move together in one direction, and
   they never shine together.
7. **Dim and rare light.** Most flies stay dim. A faint glow appears
   now and then on a single fly; nothing ever flashes.
8. **Ignorable.** Click the name and type a long name while looking only
   at what you type. Your eyes are not pulled to the left side.
9. **Stays inside, spread out.** After 2 minutes, no flies are bunched
   against an edge of the field or under the menu, and the middle of the
   field is not empty.
10. **Smooth landing.** Watch the flies arrive from the orbit. Each one
    lands and starts to wander with no jump or snap.
11. **Not a control.** Move the mouse over the field: the cursor stays the
    normal arrow and no fly brightens or reacts. Try to drag a fly:
    nothing follows the mouse and no text gets selected.
12. **Nothing new on screen.** No labels, counts, tooltips or controls
    appeared with the wander.
13. **10,000 files stay smooth.** Add a 10,000-file folder. The flies keep
    drifting smoothly the whole time, with no stutter or freeze, and the
    menu still reacts at once.
14. **Back from another tab.** Switch to another app for a minute and
    come back. The flies are drifting in the very first moment, with no
    rush to catch up.
15. **Resize.** Make the window narrower and wider. The flies stay inside
    the field, with no flicker or jump of the whole field.
16. **Reduce Motion.** Turn on Reduce Motion in the system settings and
    reload. The flies stay still in their places, with no glow.

## Key insights

1. In a screen with no counts, **motion = proof of life**. Today's 3 px
   sway is below what people notice, so the field reads as frozen.
2. **Wander the whole field, not a spot.** "Stuck" mostly means "on a
   string". Each fly must go somewhere over half a minute.
3. **Calm comes from slowness, softness and variety.** Not from tiny
   motion. A slow fly crossing the field is calmer than a fly trembling
   on its spot.
4. **Pauses make it real.** Hovering flies are what turn moving dots into
   fireflies.
5. **The side of the eye decides.** Most watching happens while working on
   the right. Anything sudden there costs focus and goodwill.
6. **Never a control.** Wandering raises the urge to catch a fly. Keep the
   field fully pointer-free with no hover reaction.
7. **Smooth at any size, still under Reduce Motion.** Both are about
   trust, not polish.

## Open questions

- **Q1. Do bright (used) and red (removed) flies wander too?** My guess:
  yes, the same way, so the field stays one living thing. But a red fly
  drifting around may be harder to notice than a still one. Merlin and
  Jony should decide; Eraser should check that red stays readable.
- **Q2. Pause control for people without Reduce Motion.** Accessibility
  rules (WCAG 2.2.2, "Pause, Stop, Hide") ask for a way to stop motion that
  lasts more than 5 seconds next to other content. Here the motion is
  decorative and Reduce Motion stops it, but there is no in-app pause. I
  am not suggesting a control (it would add clutter), only noting it for
  the team to judge.
- **Q3. Where exactly the field ends.** Flies should stay out from under
  the menu on the right. Is the edge of the field the menu's left edge,
  with a margin? Assumed yes.
- **Q4. Very few files.** With 1 to 5 files, a few slow dots crossing a big
  dark area may look lonely, or even lost. Not tested; worth a look in the
  sign-off.
- **Q5. Real user evidence.** All of this comes from expert reasoning, the
  team's earlier reports and the code. Nobody has watched real users with
  this screen yet. A five-minute hallway test of checks 1, 2, 8 and 16
  would confirm or correct the biggest assumptions.

## Sources

- `src/server/public/creation-screen.js`: `DRIFT_MAX`, `SHINE_MAX`,
  `flyParams`, `flyAt`, the field's `paint` (today's sway: 1.2–3 px,
  14–26 s per sway, 1.8 px dots at alpha .32, at most 3,000 drawn).
- `src/server/public/new-agent.html`: the field canvas takes no pointer.
- `Reports/one-flow-plus-to-chaos-behaviours.md`,
  `Reports/creation-screen-behaviours.md`: earlier research on this screen.
- W3C, Understanding WCAG 2.2, Success Criterion 2.2.2 Pause, Stop, Hide:
  https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- MDN, `prefers-reduced-motion`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
