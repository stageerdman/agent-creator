# 03 · Jony — the Fireflies DNA playground

**File:** `playground/fireflies-dna.html`. It's one file with no installs, no server and nothing fetched from the web. Open it straight from Finder.
**Checks:** `node "updates/2026-11-26 FIREFLIES-DNA/checks/run.cjs" chrome|webkit` (needs `npm install --no-save playwright-core`). Both engines pass all 19 checks. The console is empty. With 672 lights it runs at 60 fps (worst frame 17–18 ms). Merlin's block is byte-identical to the one in `02-merlin-magic.md`.

## User goal

You should be able to *see* an agent's history as fireflies, play with the four rules, and understand them without reading anything. The page is alive the moment it opens.

## Layout

- **Field** on the left: one canvas, the Fireflies field `#0B1410` with soft glow. It has its own grid cell, so text never covers a light.
- **Panel** on the right (320 px, solid background), read from top to bottom in the order you use it: Add a file → Add an event → Build embeddings → Tune.
- **Timeline** along the bottom, under the field: one play button and the scrub bar.
- Below 760 px wide everything stacks: field, then timeline, then panel.

## What I removed or folded in, and why

- **No topic picker.** The folder is the topic: `recipes/x.txt` → recipes, and a file with no folder becomes its own species. That's one less control, and it's how real files work. One hint line says so: "The folder is the topic." The name field always holds a suggested name that rotates through travel/recipes/garden/letters, so Add file works on the first click.
- **No legend.** Each event button carries its own colour dot, so the control *is* the legend. Files explain themselves when you hover them.
- **No separate Replay, Play, Pause and Reset buttons.** One button says *Replay* when you're at now, *Pause* while playing and *Play* when you've scrubbed back.
- **No "back to now" button.** Adding anything while scrubbed back jumps to now first, so the new light is always visible.
- **No second build button or toggle.** *Build embeddings* turns into a disabled "Embeddings built". It comes back as "Build embeddings (n new)" when plain files are waiting.

## The four rules, and where to see them

**A · File size → seed head of dots.** A small file is one dot. Bigger files grow full dots plus a falling tail in a golden-angle seed head. The size slider is logarithmic from 0 B to 5 GB, so you can feel the steps (text note, PDF, zip of photos). *Min/Max dot size* reshape every head live. Seed: `garden/seed-list.csv` (900 B) is a single spark. `garden/rose-bed-photos.zip` (1.4 GB) is the biggest head on the field.

**B · Embedding → colour, similar files look alike.** Files start out in plain colour. *Build embeddings* fades each one to its colour over 1.4 s, in a gentle wave in time order. Files in the same folder land on neighbouring hues of the cool arc: recipes, letters and garden each read as one species. A file added later stays plain until the next build, so you can see the difference.

**C · Event colours, plus timeline replay and scrub.** Edits, changes and activity are single warm dots, in the colour on their button. Every item has a coloured tick on the timeline. Time is squeezed (log gaps), so a busy afternoon doesn't vanish next to a quiet week. *Replay* plays the history in 16 s, and lights appear one by one with a small birth glow. Dragging the scrub shows the field at that moment: the date floats above the handle, and later ticks dim.

**D · Blinks follow time, and random sparks chain.** In every pass, lights blink in the order they happened (`DNA.blinkTimes`). Within a seed head, the dots ripple out from its heart 30 ms apart. *Blink speed* and *Randomness* restart the pass at once, so you see the change. Every so often a random light sparks (`DNA.sparkChain`, newest file weighted ×3) and nearby members of its family answer in a short chain. "Family" means the same file before a build and the same topic after one. *Chain strength* sets how often sparks come and how far they travel. When you let go of that slider, a spark fires half a second later so you see the effect.

## Hover and tap

Pointing at a light lights up its whole family and shows a card beside the seed head with name, size and time. Plain files also say "no embedding yet". Events show their kind, a plain line and the time. On touch, a tap does the same, and tapping empty space clears it.

## States

- **On open:** a seeded history of 12 files and 12 events over 20 days. It is the same on every reload.
- **Newest item:** a 700 ms burst into place plus a 2.6 s glow, so you can find it.
- **Scrubbed back:** future lights are hidden and their ticks dimmed. The button says Play.
- **Crowded field:** placement takes the roomiest spot it can find. There's no failure, even with hundreds of lights (fixed in this pass).
- **Reduced motion:** no drift and no burst (newcomers fade in). Blinks are softer and slower opacity changes. Chains are a soft step-by-step glow, with delays stretched ×1.6.

## Accessibility

- Every control is a real button, input or range with a label.
- The play button and sliders work by keyboard.
- The scrub reads out its date through `aria-valuetext`.
- The canvas label gives the counts.
- A hidden ordered list reads the whole history, oldest first, to screen readers.
- The footer count is a polite live region.

## Built only on window.DNA

The playground calls only `fileToDots`, `embeddingToColor`, `fakeEmbedding`, `eventColor`, `plainColor`, `blinkTimes` and `sparkChain`. Everything else on the page is layout, input and drawing. Drawing is one canvas and one rAF loop, with a cached glow sprite per colour plus a core arc, blended with `lighter`.
