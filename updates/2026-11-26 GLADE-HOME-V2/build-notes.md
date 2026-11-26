# Glade Home v2 · build notes

Open `index.html` and pick a concept. Each concept is one standalone HTML file with no build step.

**Demo bar (top of every concept):** `← All concepts`, the concept name, `Agents 0 · 1 · 12 · 50`, and `Reduced motion`.
The URL accepts `?n=0|1|12|50` and `?rm=1` (reduced motion on). The bar belongs to the demo, not to Home.

## How to try the two jobs

| | A · The Path | B · The Field Guide | C · The Groves |
|---|---|---|---|
| **New agent** | `+ New agent`, the pinned first row of the left list | `+ New agent` in the gate along the bottom edge | Click anywhere on the tall door on the left |
| **Find by eye** | Click a name in the list (recent first, grouped by day). This only highlights it; the clearing on the right shows who it is | Guide words over each column (A–Z), then click the name | Grove heading (Work, Writing…), then click the name (recent first in each grove) |
| **Find by typing** | Just type (`con`). The list filters, and the first match is highlighted | Just type. Non-matches dim where they stand; the first match gets focus | Just type. Non-matches and empty grove headings dim; the first match gets focus |
| **Chat** | `Chat` in the clearing, or `Return` | Click the card, or `Return` | Click the row, or `Return` |
| **Edit** | `Edit` in the clearing (`Tab` reaches it) | The `Edit` word on the card | The `Edit` word on the row |
| **Keys** | `↑ ↓` move the highlight | `← → ↑ ↓` between lit cards | `↑ ↓` in a grove, `← →` to the next grove with a match |

The same in all three:
- `Esc` clears the find. On a Chat, Edit or New agent screen, `Esc` is the same as `Back to Home`.
- Back on Home, focus returns to the agent you just opened.
- Drag a folder over the window: the New agent place lights up. Dropping it opens New agent with the folder named.
- New agent: type anything, then `Keep` or `Return`. In the demo, Keep always makes **Nell · Mum's recipes**, who then shows on Home.
- Good tries at 50: type `con` (Amara, the contract lawyer), find Rex by eye, Edit Vera.

## What I checked in a real browser

Chrome via Playwright, 1024×768, at 0, 1, 12 and 50 agents in each concept (scratch script, not committed). **All checks pass, with no console errors.**

- index.html has three links that work.
- 0 agents: Home *is* the New agent start, and there is no Back.
- 1, 12 and 50: Home fits with no scroll in B and C (A's list scrolls at 50 by design; New agent and Find stay pinned). In B, the page never runs under the gate. New agent is visible.
- Find chip: hidden at 1 agent, `Type to find` at 12 and 50.
- Typing `con` then `Return` opens `Chat · Amara`. In B and C, focus is already on Amara after typing.
- `Esc` returns to Home. A second `Esc` clears the find.
- Edit by mouse opens `Edit · Lena` (12), `Edit · Vera` (50) and `Edit · Rex` (1). C's Edit screen shows the grove. `Back` returns Home.
- Arrow keys land on a real agent.
- Typing `zzq` shows `No one called "zzq"`, and `Return` does nothing.
- New agent puts focus in the "who" field. Typing and `Return` lead back to Home, with Nell on Home. B and C still fit with no scroll after Nell is added.
- C: the planted line `Nell is in Home & life. Move her in Edit.` shows on the door, and it is gone on the next Home visit.
- `?rm=1` turns reduced motion on.
- Screenshots checked by eye: A, B and C at 50; B find at 12; C planted at 50.

**Not testable headless:** dragging a folder in from the desktop. The drop code is in place, but I couldn't drive it in the test.

### Bugs found in the browser and fixed
1. **Return in New agent opened Nell's chat.** The Enter that made Nell also "clicked" her row once focus moved to it (B, C). Fix: the who field now swallows that Enter (shared core, all three files).
2. **Return on no match opened the wrong person.** Focus stayed on the last row you arrowed to (B, C). Fix: when nothing matches, the row lets go of focus.
3. **C at 50 cut roles to two words** ("Career …"), which hurt finding by role. Fix: `Edit` stays always visible but sits on the name line only, so the role gets the full row width. Grove columns now share the space evenly (max 200px). The door stays at 240px.

## Where the build differs from concepts.md
- **Keep always makes Nell, Mum's recipes**, not Bea. Bea is already row 40 of the 50, so making her would create a duplicate. C's planted line reads `Nell is in Home & life. Move her in Edit.` and disappears on the next Home visit.
- **No-match wording:** the chip reads `No one called "x"`. `Return` there does nothing; it never makes an agent.
- **Empty chip** reads `Type to find`. It is hidden at 0 and 1 agents (nothing to find).
- **Esc on a stub screen = Back to Home.**
- **0 agents:** the New agent screen *is* Home, with no Back.
- **Demo bar** also has `0` and a `Reduced motion` toggle (it also follows the OS setting).
- **A's "They answer" flash** uses the Web Animations API, and plays after the chat screen is shown.
- **Folder drop lights the door in all three** (concepts.md spells it out for A only).
- **B guide words** use the first word of the name (`Untitled sketch` files under U). The third line on a card shows only for a state other than Ready, or for `today` / `yesterday`.
- **C** shows a state line only when it isn't Ready. `Unsorted` sits under the shortest column. `Edit` sits on the name line (see fix 3).
- **Fireflies** in B and C are off at 50, as the concept says. A keeps a few in the clearing.

## Eraser cuts
*(filled in after eraser-review.md comes back)*
