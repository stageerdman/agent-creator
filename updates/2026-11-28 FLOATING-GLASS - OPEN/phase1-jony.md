# Phase 1 — left side solid again, glass only on the floating chat (Jony)

## User goal
Read Sketcher's words over the likeness, and still feel the likeness behind them. The field is the scene; the chat is the one window floating over it.

## What changed
**`src/server/public/new-agent.html`**
- Removed the `html.glass` rule on /new and the old `html.glass #sketcher` .88 near-solid rule. `html` is solid `--field`, `body` keeps its solid radial gradient, in the browser and in the Mac app alike.
- `#sketcher` floats: `left/top/bottom: 12px` (8px under 640px), `border-radius: 16px` on all corners, a 1px hairline `rgba(232,239,224,.08)`, shadow `0 12px 40px rgba(0,0,0,.45)`.
- Glass: `rgba(12,14,10,.36)` + `backdrop-filter: blur(24px) saturate(1.3)` (and `-webkit-`), inside `@supports`; without support it falls back to `.92`. `prefers-reduced-transparency: reduce` gives `.94`.
- Closed, it sits `translateX(calc(-100% - gap))` off-screen, so its right edge is at 0 and the arrow rides that edge.
- Reading tint behind the messages only: `#sketcher-log` `rgba(6,9,6,.72)`, padding 8px, radius 12px, pulled out 8px each side. The title and frame stay glass. `.wait` is `rgba(232,239,224,.72)`.
  - The tint was .55 in my first pass. The new contrast check measured **3.7:1** over a fully lit likeness, so I raised it to .72. The worst case is now **4.75:1** (a code block in a Sketcher reply).

**`src/server/public/left-side.js`**: `gap()` reads the panel's CSS `left`. On narrow screens the width is `W − 2·gap`. Open, the arrow sits at `min(gap + width, W − tabW)`.

**`src/server/app.test.mjs`**: /new is no longer in the html.glass test. A new test checks that /new has no `html.glass` rule, that `backdrop-filter` appears only on `#sketcher`, and that its alpha is under .6.

**`checks/left-side-check.cjs`**
- Step 6: the narrow panel is 374px (390 less 8px on each side).
- Step 10: the ride formula and the open edge use `gap + width`.
- New step 11 runs in Chrome and WebKit at 1200×820 and 390×700:
  - With `html.glass` added, html stays opaque, the body keeps its solid gradient, and nothing but `#sketcher` has a backdrop-filter.
  - The panel has a blur, its background alpha is under .6, it keeps a gap of 8px or more from the left, top and bottom, all four radii are 12px or more, and it has a shadow.
  - Pixels: a hard-edged lime sheet goes behind the panel. It must show through (brighter), and in Chrome its edge must turn soft (62px).
  - Contrast: the words are hidden, then the brightest pixel behind each message is measured against that message's own colour, the thinking line included. Each must be 4.5:1 or more.
  - Use `GLASS_ONLY=<agent id>` to run step 11 alone. Screenshots go to `.tmp-test/floating-glass/` (gitignored).

## Removed
- `html.glass` on /new, so the field is no longer see-through.
- The .88 near-solid rule.
- Any glass on the field or the left side.
- Nothing new was added to open or close the panel. A click in the gap does not close it: the arrow and Esc stay the only ways out.

## Not touched
`src-tauri/src/main.rs`. The app's `html.glass` class now does nothing on /new. `backdrop-filter` blurs page content in WKWebView, which is what we want here, so it needs no window change.

## How it was checked
- `npm test`: 384 pass, 0 fail.
- `node checks/left-side-check.cjs http://localhost:3506 --home <scratch>` against `checks/mock-engine-server.mjs`: **ALL PASS** (steps 1–11, Chrome and WebKit).
- One honest gap: Playwright's headless WebKit paints backdrop-filter's see-through but not its blur. So in WebKit the blur is checked through its computed style, not its pixels (the check prints an INFO line). Safari and the Mac app do blur. The user's glass check at the roadmap gate is the eye test for that.
