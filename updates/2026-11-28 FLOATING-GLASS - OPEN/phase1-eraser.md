# Phase 1: Eraser's review (glass only on the floating chat)

**Verdict: APPROVED. Signed off: Eraser, 2026-11-28.**

I checked Jony's Phase 1 work (commits f518614 and 3551d37, notes in `phase1-jony.md`) against `00-roadmap.md` Phase 1. There is nothing to fix. Three watch-outs for later phases are listed at the end.

## Goal
Open the Sketcher chat on /new and read it easily, with the likeness still showing through the chat. Nothing else on the screen is glass.

## Step count (open, read, close)
1. Press the arrow tab, or Enter or Space on it. The panel slides out and the box gets focus.
2. Read and type. Enter sends.
3. Press the arrow again, or Esc. The panel closes and focus goes back to the arrow.

**3 steps, the same as before Phase 1.** No step was added. Glass is a look, not a step, and it doesn't make anyone guess what to do.

| # | Step | Mark | Why |
|---|------|------|-----|
| 1 | Open with the arrow | Keep | One control. There is still no second close arrow in the panel (step 3 and step 10 check this). |
| 2 | Read / type, Enter sends | Keep | No send button was added (roadmap rule, open question 2). |
| 3 | Close with the arrow or Esc | Keep | Esc is the usual keyboard way out, not a second control on screen. A click in the gap does **not** close the panel, so a stray click can't make you lose your place. |

## What I checked

### 1. No glass on /new except `#sketcher`: clean
- `new-agent.html` has `backdrop-filter` only on `#sketcher` (lines 149–150, inside `@supports`). `#sheet::backdrop` is the dialog's dimming layer, not glass.
- In the browser (step 11, Chrome and WebKit, desktop and narrow): with `html.glass` added, `html` is solid `rgb(11,20,16)`, the body keeps its solid gradient, and no element other than `#sketcher` has a backdrop-filter (`filters: []`).

### 2. No old or duplicate glass rules: clean
- The `html.glass #sketcher { … .88 }` rule is gone.
- The `html.glass { background: transparent; --field: rgba(…) }` rule on /new is gone, so the field is no longer tinted see-through.
- `app.test.mjs` now locks this in: /new has no `html.glass` rule, the blur appears only on `#sketcher`, and the panel's alpha is under .6. The `/` and `/agents` pages keep their window glass, as the roadmap scoped it ("Out of scope", open question 1).
- There is one background per situation: `.92` when blur isn't supported, `.36` + blur when it is, and `.94` for reduced transparency. Each covers a different case, so none is a duplicate.

### 3. Only one way to open and one way to close: clean
- `left-side.js:282`: the handle's click toggles the panel. `:283–286`: Esc closes it. Nothing else opens or closes it.
- The check's step 3 and step 10 (×4) pass "one arrow, no second close button".

### 4. Text is readable over a bright background: passes AA
I measured this from pixels with a full lime (#D8F26A) sheet behind the panel:
| Where | Worst message | Contrast |
|---|---|---|
| Chrome desktop | Sketcher reply (md) | 4.83:1 |
| Chrome narrow | Sketcher reply (md) | 4.75:1 |
| WebKit desktop / narrow | Sketcher reply (md) | 4.80:1 |
| Error line `.err` (my own probe, not in the check) | "Sketcher couldn't answer…" | 4.69 (Chrome) / 4.72 (WebKit) |

All of these are at or above 4.5:1. The thinking line (`.wait`) is part of the check and passes.

### 5. Tests
- `npm test`: **386 tests, 384 pass, 0 fail**. This checkout first needed `npm install`, because the `unpdf` package was missing. That was a setup problem, not a code problem.
- `node checks/left-side-check.cjs http://localhost:3506 --home <scratch>` against `checks/mock-engine-server.mjs`: **ALL PASS**, steps 1–11, Chrome and WebKit, 1200×820 and 390×700. A few runs printed "browser quit from outside", and the check retried them as it is built to. Each retry passed.

## Watch-outs (not blocking)
1. **The error line is close to the limit and no test locks it in.** At 4.69:1 it passes, but the check only measures the messages it seeds. Any later tint change (Phase 4's firefly thinking, for example) could push `.err` under 4.5 without a test failing. Add an `.err` line to step 11's contrast pass, the same way `.wait` was added.
2. **The gap is written twice.** `12px`/`8px` appears in `left/top/bottom` and again in the closed `translateX(calc(-100% - …))`. JS reads `left` itself, so the JS has one source. A single `--gap` custom property would keep the CSS from drifting (change one, forget the other, and the closed panel peeks out).
3. **Headless WebKit doesn't paint the blur.** In WebKit the blur is checked by its computed style only. The real eye test is the Phase 2 gate: the user looks at the glass in the installed Mac app. Don't skip it.

## Not checked here
I didn't build or install the Mac app (that is Phase 2's gate). The `src-tauri` code was not touched in Phase 1.
