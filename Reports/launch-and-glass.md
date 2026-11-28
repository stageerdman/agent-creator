# LAUNCH AND GLASS: what people notice in the first seconds and in the glass chat (Columbo)

Journey steps: **UJ1 · open the app**, **UJ2 · 3 the Sketcher chat**.
For Jony (build) and Eraser (sign-off). Research only: no design, no code.

## Summary

People hire the first second of an app for one job: *"Show me it's ready
and it's the same app I left."* Any change of colour or see-through-ness
after the window appears reads as **"it's loading something wrong" or
"it's broken"**. It never reads as polish. Today the Mac app shows up to
three different backgrounds in the first second: the native blurred
desktop, then a 62 % tinted glass page (home), then a solid page when you
go to /new. Each step is a visible jump.

In the chat, people want the opposite: **clearly see-through, but they
never have to work to read it.** "Real glass" to a Mac user means a
Control Centre or sheet look: you can see colour and soft shapes behind it,
never sharp detail, with a thin light edge. The words sit on something
calm.

## Scope

**In:** cold open (Dock, Spotlight, after a restart or login), switching
screens (home → agent page → /new and back), reading and typing in the
floating Sketcher chat over a busy page or a bright desktop. A full list of
every background source.

**Out:** chat behaviour (stop, queue, Create card): other items. Exact
values for opacity, blur and colour: Jony's call. Firefly motion.

**Assumptions (not checked with real users):**
- A1. The design rule holds: *glass is for what floats, never for the
  ground* (`principles/magic-ux/design-rules.md`). So the page is solid on
  every screen, in the browser and in the Mac app, and only the Sketcher
  chat is glass. What shows through the chat is the page (likeness, flies,
  field), not the desktop.
- A2. Most people open the app from the Dock or Spotlight on a laptop, and
  their desktop is often bright (a photo wallpaper, white windows behind).

## The moments

### M1. Opening the app cold (Dock, Spotlight, after a restart). Likelihood 10, frequency 9

- **The moment:** morning, first coffee, or right after a restart. Click
  the Dock icon, or ⌘-Space, "agent", Return. Eyes are on the spot where
  the window will appear.
- **Thoughts:** *"Come on…"*. Then either *"there it is"* or *"wait, what
  was that flash?"*
- **What they expect:** one window that arrives **already in its final
  colour**, then content fades or draws in on top. A dark app shows dark
  from frame one. A short wait is fine (after a restart the server takes
  longer) **if the wait looks like the app**: the same dark field, empty.
- **What reads as broken:**
  - A white or grey frame, or the desktop showing through, before the dark
    page.
  - The background **changing tone** after it first appears, from the
    blurred desktop to a tinted glass to solid. Even a 100 ms step is seen,
    because the eyes are fixed on the window right then. People read it as
    "it reloaded" or "a glitch".
  - The window showing up first and the page painting later in a different
    colour. That is what happens today (see the checklist, item 1).
- **After a restart:** the server is slowest here, so the gap between
  "window visible" and "page painted" is longest. Whatever the window shows
  during that gap is what people remember. It must be the final background.
- **Product insight:** the native window's own colour, the page's first
  paint and the page after scripts must be **the same colour**. No class
  added later, no fade between two backgrounds.

### M2. Switching between screens. Likelihood 9, frequency 9

- **The moment:** home → click an agent → its page → Back. Or home → + →
  /new. Many times a session.
- **Thoughts:** *"Same place, different room."*
- **What they expect:** the ground stays put. Only the content changes.
  Like Finder or Notes: the window never changes colour when you change
  folders.
- **What reads as broken:**
  - A blink between pages: a white or transparent frame during navigation.
  - **The ground changing material.** Today home and the agent page are
    glass in the Mac app (desktop blurred through a 62 % tint), and /new is
    solid. Going home → /new, the desktop behind suddenly disappears. People
    don't think "different design". They think "something went wrong".
  - The radial shadow at the edges jumping, because one page uses
    `min-height` and another uses `height`, or one is fixed and one scrolls.
- **Product insight:** one background, defined once, used by every page.
  If any page differs, people will see it on the first switch.

### M3. Reading in the floating Sketcher chat over a busy page. Likelihood 9, frequency 9

- **The moment:** /new, the likeness is forming, flies wander, a long
  reply is streaming in.
- **Thoughts:** *"What did it do?"*. And on looking up: *"oh nice, I can
  see my agent behind it."*
- **What they expect:** words as crisp as on a solid panel. Behind them,
  colour and glow, never readable detail or sharp moving dots.
- **What reads as broken:** a bright dot sharp right behind a word.
  Shimmer while reading. A solid dark box behind the whole chat (it reads
  as a hole in the glass: an earlier fix, keep it). A light halo or shine
  that doesn't belong to anything (the old shine behind Create).

### M4. Typing in the chat. Likelihood 9, frequency 8

- **What they expect:** the box and caret are always clear. The box can be
  a bit more solid than the panel, because it's a "field". Sending is one
  key. The send dot lands in the new message (an earlier fix, keep it).
- **What reads as broken:** a box so see-through that the caret gets lost
  over a lit dot. The placeholder vanishing over a bright area.

### M5. The chat over a bright desktop. Likelihood 4, frequency 3 (watch out)

- With a solid page (A1), the desktop never shows through the chat. It
  only matters if the page itself is see-through, which is today's Mac
  app on home and the agent page. If it comes back, a white desktop
  through two layers of glass would crush text contrast. That is one more
  reason for **one glass layer only**.

## How see-through can the chat get?

People's limit is set by **reading, not by looks**:

- **Fill:** macOS "real glass" is mostly *blur*, not a clear window.
  Control Centre and sheets let colour and soft shapes through, but no
  edges you can read. A low panel fill (well below today's 36 %) feels like
  glass **only if the blur is strong enough** that a lime dot becomes a
  soft glow, not a sharp spot. Low fill with weak blur = "a dirty window".
- **Text:** the hard limit is WCAG AA, 4.5:1 for message text, measured
  **at the brightest point behind the text** (a fully lit, glowing mark
  dot), not over the dark average. The panel can be very clear *between*
  messages if each message keeps its own darker glass (as it does today).
  Then the panel looks like glass and the words sit on a calm patch.
- **Dim text** ("Sketching…", quiet helper lines) and lime links fail
  first. Check them, not only body text.
- **Reduce Transparency** (macOS setting): people who turned it on want it
  near-solid. Today's rule handles it. Keep it.
- **Uncertain:** I can't give one opacity number. It depends on blur
  strength and the brightest dot. Eraser's eye check in the real Mac app is
  the test.

## What "real glass" means to people

From macOS (Control Centre, Notification Centre, sheets, menus) and
iOS/macOS 26 "Liquid Glass":

1. **You can see that something is behind it**: its colour, light and
   rough shape, **never what it says**. Blur does this job.
2. **A thin light edge** (a 1 px highlight, brighter at the top) separates
   glass from the scene. Without it, low-opacity glass melts into the page.
3. **It floats**: a soft shadow, rounded corners, a gap from the window
   edge.
4. **The colour behind gently tints it** (saturation lifts a little). Grey
   glass over a green scene looks dead.
5. **Text on it stays bold and calm.** Apple's 2025 Liquid Glass got loud
   complaints about readability and had to add a "Tinted" (more solid)
   option. People love glass until they squint.

## Checklist: every place that sets the screen background today

For Jony to bring under one shared background, and for Eraser to search
again after.

1. **`src-tauri/src/main.rs` `open_window`**
   - `.transparent(true)`: the native window has no colour of its own.
     The desktop shows through until the page paints.
   - `.effects(glass())`: `glass()` is a `WindowEffectsConfig` with
     `Effect::UnderWindowBackground`, `EffectState::Active`. That is macOS
     vibrancy, the blurred desktop behind the whole window.
   - `.theme(Some(Theme::Dark))`: picks the dark vibrancy material.
   - `.visible(false)` then `window.show()` straight after `build()`: the
     window appears **before the page has painted**. So the first frames
     are the bare vibrancy, then the page arrives in another tone. **Likely
     cause #1 of the launch flicker.**
   - No native background colour is set, so nothing matches the page's
     `#0B1410` before it paints.
2. **`src-tauri/src/main.rs` `GLASS_PAGE`** (passed to
   `.initialization_script`): **JavaScript that adds the `glass` class**
   to `<html>`. If `<html>` doesn't exist yet, it waits with a
   `MutationObserver` and adds it later. It runs in the Mac app only, on
   every page. So the browser and the app show different backgrounds, and
   the class can land after the first paint. **Likely cause #2 of the
   switch partway through loading.** It's the only JS that touches the
   background. I found no page script that sets `style.background` or
   classes on `<html>`/`<body>`.
3. **`src-tauri/tauri.conf.json`**: `"macOSPrivateApi": true`. This is
   needed for the transparent window and vibrancy. If transparency goes,
   check whether this can go too.
4. **`src/server/public/agent-page.html`** (lines 10–21):
   - `:root { --field: #0B1410; --shadow: #060B08; … }`
   - `html { background: var(--field); }`
   - `html.glass { background: transparent; --field: rgba(11,20,16,.62);
     --shadow: rgba(6,11,8,.8); }`: makes the page glass in the app.
   - `html, body { margin: 0; min-height: 100%; }` (note: `min-height`)
   - `body { background: radial-gradient(120% 90% at 50% 45%, var(--field)
     0%, var(--field) 55%, var(--shadow) 100%) fixed; }`
5. **`src/server/public/agent-home.html`** (lines 9–25): the same `:root`
   tokens, `html`, `html.glass` and `body` gradient rules, but
   `html, body { height: 100%; }` (note: `height`, not `min-height`).
6. **`src/server/public/new-agent.html`** (lines 8–18): the same tokens,
   `html` and `body` gradient (plus `overflow: hidden`). **No `html.glass`
   rule**, so it stays solid in the app. That's why home → /new changes
   material.
7. **Not the screen background, but glass. Leave as the one glass:**
   `#sketcher` in `new-agent.html` (lines 146–153: 92 % fallback, 36 % +
   `blur(24px) saturate(1.3)` with backdrop-filter, 94 % for Reduce
   Transparency), and the per-message `--ink: rgba(6,9,6,.72)` on
   `#sketcher-log > div` (lines 163–169).
8. **Look-alikes to check aren't a second glass:** `new-agent.html` `#menu`
   (`rgba(6,11,8,.72)`), `#sheet::backdrop`, the Talk box on the agent page
   (`rgba(11,20,16,.86)`), and the home rows' hover fill. They're
   translucent fills on a solid page, not glass over the desktop. They're
   fine as long as nothing behind them is see-through.

## Key insights

1. **The first frame is the background.** Native window colour = page
   first paint = page after scripts. Any difference is seen as broken.
2. **The window must not appear before the page has its colour**, or the
   native window must already be that colour.
3. **No JavaScript decides the background.** Today's `GLASS_PAGE` script
   is the late switch.
4. **One ground on every screen.** Home and the agent page are glass in
   the app today, and /new is solid. That's a visible jump on every switch.
5. **Chat glass = strong blur + low fill + light edge + darker patch
   behind each message.** AA is measured at the brightest dot.

## Open questions

- **Q1.** Solid native window (no vibrancy) or vibrancy kept but fully
  covered? My lean: solid, the same `#0B1410`. Then nothing can show
  through during a slow start. Jony and Uncle Bob decide.
- **Q2.** Does the window wait to show until the page has painted? My lean:
  it matters less once the native colour matches the page. Eraser's three
  cold opens will tell.
- **Q3.** Real-eye check: all of this comes from the code, earlier reports
  and how macOS apps behave. Eraser's cold opens and the user's own look
  are the real test.

## Sources

- `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json`,
  `src/server/public/{agent-page,agent-home,new-agent}.html` (read
  2026-11-28).
- `Reports/floating-glass-behaviours.md` (W1 contrast at the brightest dot,
  W6 glass that spreads).
- `principles/magic-ux/design-rules.md` (glass is for what floats).
- Apple Human Interface Guidelines, Materials.
- Six Colors, "Soaping up Liquid Glass: less transparency, more contrast"
  (2025-11).
