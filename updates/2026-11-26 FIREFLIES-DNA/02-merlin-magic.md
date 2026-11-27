# FIREFLIES-DNA: the magic rules

*Merlin, 2026-11-26. Reads `01-columbo-behaviors.md`. For Jony (`03`) and Eraser (`04`).*

## The world in one line

**A meadow of real fireflies at night.** Each file is a **seed head** that
glows. Each event is a **lone flash**. The field **flashes in the order the
agent lived**. Sometimes one firefly flashes and its neighbours **answer**.

This is not a metaphor I had to bend into shape. Real fireflies do all four
things. A flash means "I am here, this is who I am". The colour and rhythm
tell their species. In some species (the synchronous fireflies of the
Smoky Mountains, the mangrove fireflies of Southeast Asia) one flash sets off
its neighbours, and a wave runs across the dark. So nothing in the
playground needs explaining: you watch it the same way you'd watch a real
field.

Labels stay plain (principle: words plain, world only in motion). The UI
says "file", "event", "build embeddings". The world shows up only in how
things move and light up.

---

## Rule A · Dot size from file size: the seed head

**In plain words.** We measure a file's size in orders of magnitude (log
scale). The sizes fall into three steps you can feel without reading a
number:

| Step | Size (about) | What you see |
|---|---|---|
| **Small** | 0 B to ~200 KB | **one** dot, from smallest to nearly full size |
| **Medium** | ~200 KB to ~10 MB | **1–3 full dots** plus a short tail of 3–8 smaller ones |
| **Big** | ~10 MB to 1 GB+ | **3–6 full dots** plus a falling tail of up to 13 |

The dots are placed like the seeds in a sunflower (the golden-angle
spiral): the biggest at the heart, the tail getting smaller toward the
edge. Each dot gets a little jitter in size (±8%), angle and distance, so
no two files look stamped from the same mould. A 0-byte file still gets one
small dot. Anything past ~1 GB stops growing: **19 dots at most per file**,
so 20 giant files are still about 380 dots.

**Why it feels nice.** The sunflower spiral is how nature packs seeds, and
the eye reads it as "grown", not "generated". The family stays together
(Columbo #1), the biggest seeds sit in the middle, and the jump from "one
dot" to "a seed head" is the medium step people feel at once.

**Edge cases.** If `minR > maxR` they are swapped. `minR` is never below
0.5 px. The spacing follows `maxR`, so dots never sit on top of each other.

**Events (Columbo's open question):** an event is always **one dot** of a
fixed size, `minR + 0.45 × (maxR − minR)`. A size that never changes reads
as "this is not a file", and the colour says the rest. All three kinds get
the same size, because a smaller "activity" would read as a tiny file.

## Rule B · Embedding colours: species of light

**In plain words.** Before embeddings are built, every file glows the same
**soft pale firefly light** (`DNA.plainColor`, a washed-out version of the
glade's own `#D8F26A`). After the build, each file takes on its species
colour:

1. The vector is normalised, so any length works.
2. It is projected onto 3 fixed directions. These come from a fixed seed,
   so they are the same on every load. Similar vectors give similar
   projections.
3. Projection 1 → **hue**, spread evenly across the **cool arc** (fresh
   green 110° → teal → sky → blue → violet 280°). This is what tells
   topics apart (Columbo: hue distance, not lightness).
4. Projection 2 → **lightness** 62–74%, and projection 3 → **saturation**
   72–92%. These are small shifts, so two files of one topic look like
   siblings, not twins.
5. Blues get a little extra lightness, because blue looks darker on the
   dark green field than green does.

All dots of a file share one colour (one file, one embedding).

`DNA.fakeEmbedding(name, topic)` makes a 64-number vector. Most of it is a
"topic direction", plus a small nudge from the name, so same-topic files
come out as siblings (about ±6° of hue). A purely random topic direction
could land two topics on the same hue. So the fake topics are **placed on
purpose**: the first 7 topics seen take fixed slots along the arc
(`[0, 0.67, 0.33, 1, 0.5, 0.17, 0.83]`), so the first 4 sit about 50° apart
and topics 5–7 about 25° from their neighbours. From the 8th topic on,
golden-ratio steps continue (the same trick sunflowers use, so it ties back
to Rule A), and the name on the hover card tells close topics apart.
(Golden steps alone can't do this: the arc doesn't wrap, so with 4 topics
two always end up ~22° apart.) `embeddingToColor` itself stays an honest
projection, so a real vector lands wherever it falls. An empty topic uses
the name, and that file becomes its own species, at a hashed spot.

**Why it feels nice.** The fade from pale to colour is the moment a crowd
of same-looking lights turns into **families**. It is the agent's "parts"
showing (Columbo #4). Keeping embeddings on the cool side makes the field
feel like one night sky, and it leaves the warm side free for events.

**For Jony:** topic spots depend on the **order topics are first seen**.
Call `fakeEmbedding` for the seeded history in a fixed order, so every
reload looks the same. Use **3 topics** in the seed, at most 4–5 in the
"add a file" picker. From the 6th topic on, neighbours get close (see
*Check*).

## Rule C · Event colours: the warm flashes

**In plain words.** Events take the **warm half** of the colour wheel.
Embeddings never land there:

| Kind | Colour | Meaning |
|---|---|---|
| `edit` | **coral** (h 6) | a hand worked on it: warm, like a forge |
| `activity` | **honey gold** (h 46) | the agent was used: a lamp in a window |
| `change` | **rose** (h 322) | the agent itself was changed: a different flower |

The gaps: rose to coral is 44°, coral to gold 40°, gold to the nearest
embedding (110°) is 64°, and violet (280°) to rose is 42°. The plain colour
sits at h 72 but has very low saturation (28%) and high lightness (82%), so
it reads as "colourless light", not as a fourth event.

**Why it feels nice.** On a dark green field, warm points pop like embers
among cool stars. So "file or event?" is answered by **temperature**
before anyone reads a hue. Then the three warm kinds are told apart by hue.

## Rule D · Blinks follow time: the field remembers its rhythm

**In plain words.** `DNA.blinkTimes(items, {speed, randomness, rand?})`
gives one **pass** of the history: an offset in ms for each item, in time
order.

- The gap between two neighbouring items in time is squeezed on a log
  scale. Seconds apart means a blink **almost together**. An hour apart is
  a clear beat. A week apart is a longer pause (but never minutes on
  screen).
- The whole pass is fitted to a length that grows with the number of items
  (about 0.45 s per item, between 8 and 40 s), divided by `speed`. It never
  drops below 2.5 s. So even if everything has the same timestamp, the
  whole field can't flash more than about once every 2.5 s (well under
  the 3 flashes per second guideline).
- **Jitter** is added on top: `0.15 + 0.85 × randomness` of the typical gap.
  At randomness 0 the 0.15 floor is still there (Columbo: jitter has a
  floor). The pass also starts after a random lead-in, so where one pass
  ends and the next begins is never the same.
- `rand` is optional. Without it, the block uses its own seeded generator,
  which **keeps moving**, so every call gives fresh jitter (same sequence on
  every reload).

**How Jony uses it.** Call `blinkTimes` once at the start of each pass. Fire
each item's blink at its offset. When the last one has fired, call again.
Because each pass gets new jitter, the field never loops. Inside a file,
let the dots ripple from the heart outward (20–40 ms per dot). Suggested
flash shape: a quick rise (~120 ms), then a slow fade (~500 ms), divided by
`sqrt(speed)`. Real firefly flashes are about that long.

**Why it feels nice.** A busy afternoon in the agent's life becomes a
little burst of light, and a quiet week becomes a pause. People feel the
rhythm of the history without a chart. And because no two passes match,
it stays a field, not a screensaver.

## Rule E · Sparks and chains: the answering flash

**In plain words.** `DNA.sparkChain(flies, originIndex, {strength, rand})`
returns `[{index, delayMs, power}]`, starting with the origin at 0 ms.

- Each lit firefly can wake **near neighbours**. The reach is 60 px plus
  90 px × strength. The chance of waking drops with distance and with each
  step.
- It can also wake **kin**: flies with the same `groupKey`, however far
  away. At most 2 kin per step. This is a "reply across the field", and it
  comes a little later.
- Each hop waits about 110 ms + 1.4 ms per px + a little randomness, so
  you see the wave **travel**. A whole chain lasts about 0.5–1.5 s.
- **It always ends:** at most `1 + 5 × strength` steps. At most
  `4 + 36 × strength` flies (so 40 at full strength), and never more than a
  quarter of the field. Each step's `power` is lower (1 → about 0.35), so
  it fades out by itself. `power` is an extra field: use it for brightness.
- `strength 0` → only the origin (a single bright flash).

**`groupKey` (Jony):** use the **file id** before embeddings are built,
and the **topic** after. That way, a chain first lights up one seed head,
and after the build it jumps between family members. That second kind of
chain shows Rule B in motion.

**How often.** The first spark comes **6–12 s after open**, so people learn
early that chains exist (Columbo #6). After that, the wait is random:
`mean = 24 − 10 × strength` seconds, drawn from an exponential, clamped to
8–35 s. Strength 0 still gives the odd lone flash. There are no sparks
while scrubbing, but they are allowed during replay. Pick the origin
weighted toward bigger dots, plus a nudge toward the newest file.

**Reduced motion.** Stretch each `delayMs` by 1.6× and show each step as a
soft opacity rise, with no movement.

**Why it feels nice.** It's the one moment the field seems to *notice*
itself. Rare enough to be a small gift (one every ~20 s), and short enough
to read as one event: it starts, it travels, it fades.

---

## Defaults and slider ranges

| Control | Default | Range | Note |
|---|---|---|---|
| Min dot size (`minR`, CSS px) | **1.5** (page: 2.5) | 2 – 9 | the page's two sliders push each other, so Smallest is never above Largest and both labels always show what is drawn |
| Max dot size (`maxR`, CSS px) | **4.5** (page: 6) | 2 – 9 | same; in code, `minR > maxR` is still swapped as a fallback |
| Blink speed | **1** | 0.25 – 4 | pass never below 2.5 s |
| Randomness | **0.35** | 0 – 1 | floor jitter of 0.15 stays |
| Chain strength | **0.5** | 0 – 1 | 0 = lone flash |
| Spark rate | first at 6–12 s, then every ~19 s at default | | from strength, not a slider |

## Columbo's insights, answered

1. **Three size steps:** yes, small/medium/big as in Rule A. Capped at 19
   dots.
2. **Hue distance, reserved zones:** yes. Embeddings use the cool arc
   110–280°, events the warm side, and plain is set apart by low
   saturation. Lightness is always ≥ 62%, so dots glow even at low blink
   opacity.
3. **Jitter floor:** yes, 0.15, plus a random lead-in, plus fresh jitter
   every pass.
4. **Chains end:** yes. Steps, size and power are all capped. First chain
   at 6–12 s.
5. **Safe ends:** min/max are swapped when crossed, the pass has a 2.5 s
   floor, chains are capped at 40 flies or 25% of the field, and 0 B and
   5 GB are both handled.
- **Open question, event size:** one fixed size for all kinds (Rule A).
- **Open question, colour after build:** I agree with Columbo. New files
  stay plain until the next build, so the build stays a moment.

## Ideas I cut, and why

- **Colour from file type** (pdf, txt…): it says less than the embedding
  and fights Rule B.
- **Click to spark:** it would be a second meaning for tap, which is
  already hover on phones.
- **Dots orbiting their file's center:** pretty, but it moves the hover
  target (Columbo #2).
- **Firefly trails during the chain:** heavy at 300+ dots and noisy at
  strength 1. The travel delay already shows the path.
- **Sound on spark:** a playground is often open beside other work. It is
  muted by default either way, so nothing is lost by cutting it.
- **Sync drift** (everyone slowly falls into one rhythm, like real
  synchronous fireflies): beautiful but it *is* a loop. It breaks rule 3
  of the roadmap.

---

## The code (paste as-is into `<script id="dna-magic">`)

```js
(function () {
  'use strict';

  // ---- small helpers -------------------------------------------------------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hashStr(s) { // FNV-1a 32-bit
    var h = 2166136261 >>> 0;
    s = String(s == null ? '' : s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rand) { // Box-Muller
    var u = 1 - rand(), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function gaussVec(seed, n) {
    var r = mulberry32(seed), out = new Array(n);
    for (var i = 0; i < n; i++) out[i] = gauss(r);
    return out;
  }
  function normalize(v) {
    var s = 0, i;
    for (i = 0; i < v.length; i++) { var x = +v[i] || 0; s += x * x; }
    s = Math.sqrt(s) || 1;
    var out = new Array(v.length);
    for (i = 0; i < v.length; i++) out[i] = (+v[i] || 0) / s;
    return out;
  }
  var ownRand = mulberry32(0xF1EF1E5); // used when no rand is passed; keeps moving

  // ---- Rule A: file size -> seed head of dots ------------------------------
  var GOLDEN = Math.PI * (3 - Math.sqrt(5)); // ~137.5 deg
  function fileToDots(sizeBytes, opts) {
    opts = opts || {};
    var rand = opts.rand || ownRand;
    var minR = +opts.minR, maxR = +opts.maxR;
    if (!(minR > 0)) minR = 1.5;
    if (!(maxR > 0)) maxR = 4.5;
    if (minR > maxR) { var sw = minR; minR = maxR; maxR = sw; }
    minR = Math.max(0.5, minR); maxR = Math.max(minR, maxR);

    var L = Math.log(Math.max(+sizeBytes || 0, 1)) / Math.LN10;  // 0 .. ~10
    var m = clamp((L - 2.5) / 6.5, 0, 1);                           // 0 at ~300 B, 1 at ~1 GB
    var radii = [];
    if (m < 0.42) {                                                 // small: one dot
      radii.push(lerp(minR, maxR, 0.88 * Math.pow(m / 0.42, 0.85)));
    } else {
      var u = (m - 0.42) / 0.58;                                    // 0 (≈200 KB) .. 1 (≈1 GB)
      var heads = 1 + Math.round(u * 5);                            // 1..6 full dots
      var tail = Math.round(3 + u * 9) + (rand() < 0.5 ? 0 : 1);    // 3..13 falling tail
      var i;
      for (i = 0; i < heads; i++) radii.push(maxR);
      for (i = 0; i < tail; i++) {
        var f = Math.pow((i + 1) / (tail + 1), 0.9);                // 0..1 down the tail
        radii.push(lerp(maxR * 0.82, minR, f));
      }
    }
    var spacing = maxR * 2.3;
    var dots = [];
    for (var k = 0; k < radii.length; k++) {
      var r = radii[k] * (0.92 + 0.16 * rand());
      r = clamp(r, minR * 0.92, maxR * 1.08);
      var ang = k * GOLDEN + (rand() - 0.5) * 0.6;
      var dist = k === 0 ? 0 : spacing * Math.sqrt(k) * (0.85 + 0.3 * rand());
      dots.push({ r: r, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist });
    }
    return dots;
  }

  // ---- Rule B: embedding -> species colour (cool arc) ----------------------
  var PROJ_SEED = 0xD7A0001;
  var projCache = {};
  function projRow(k, n) {
    var key = k + ':' + n;
    if (!projCache[key]) projCache[key] = gaussVec(PROJ_SEED + k * 7919 + n * 104729, n);
    return projCache[key];
  }
  function phi(z) { return 1 / (1 + Math.exp(-1.702 * z)); } // ~normal CDF
  var HUE_FROM = 110, HUE_TO = 280;
  function embeddingToColor(vec) {
    if (!vec || !vec.length) return { h: plainColor.h, s: plainColor.s, l: plainColor.l };
    var v = normalize(vec), n = v.length, p = [0, 0, 0];
    for (var k = 0; k < 3; k++) {
      var row = projRow(k, n), s = 0;
      for (var i = 0; i < n; i++) s += row[i] * v[i];
      p[k] = s;
    }
    var h = lerp(HUE_FROM, HUE_TO, phi(p[0] * 1.15));
    var l = lerp(62, 74, phi(p[1]));
    var sat = lerp(72, 92, phi(p[2]));
    var blue = Math.max(0, 1 - Math.abs(h - 235) / 45);  // blues read darker on green
    l = Math.min(80, l + 6 * blue);
    return { h: Math.round(h * 10) / 10, s: Math.round(sat), l: Math.round(l) };
  }
  // Fake topics are placed on purpose: the first 7 topics seen take fixed slots on
  // the hue arc (first 4 about 50 deg apart, 5-7 about 25 deg), then golden-ratio
  // steps. Five at >= 35 deg would push 7 below 20 deg: the cool arc is only 150 deg. (Real vectors would land wherever the projection puts them;
  // embeddingToColor stays honest.)
  var topicSlots = {}, topicCount = 0;
  var FIRST_SLOTS = [0, 0.67, 0.33, 1, 0.5, 0.17, 0.83];
  function probit(q) { return Math.log(q / (1 - q)) / 1.702; } // inverse of phi
  function topicBase(t, named) {
    var g = normalize(gaussVec(hashStr('topic:' + t), 64));
    var r0 = projRow(0, 64), rr = 0, gr = 0, i;
    for (i = 0; i < 64; i++) { rr += r0[i] * r0[i]; gr += g[i] * r0[i]; }
    var rn = Math.sqrt(rr), q;
    if (named) {
      if (!(t in topicSlots)) topicSlots[t] = topicCount++;
      var k = topicSlots[t];
      var fr = k < FIRST_SLOTS.length ? FIRST_SLOTS[k] : (0.15 + k * 0.6180339887) % 1;
      q = 0.06 + 0.88 * fr;
    } else {
      q = 0.06 + 0.88 * ((hashStr('own:' + t) % 10007) / 10007);
    }
    var a = clamp(probit(q) / 1.15 / rn, -0.9, 0.9);   // wanted share along r0
    var w = new Array(64), wl = 0;
    for (i = 0; i < 64; i++) { w[i] = g[i] - (gr / rr) * r0[i]; wl += w[i] * w[i]; }
    wl = Math.sqrt(wl) || 1;
    var b = Math.sqrt(1 - a * a), out = new Array(64);
    for (i = 0; i < 64; i++) out[i] = a * r0[i] / rn + b * w[i] / wl;
    return out;
  }
  function fakeEmbedding(name, topic) {
    var named = !(topic == null || topic === '');
    var t = named ? String(topic) : String(name);
    var base = topicBase(t, named);
    var nudge = normalize(gaussVec(hashStr('name:' + name + '|' + t), 64));
    var out = new Array(64);
    for (var i = 0; i < 64; i++) out[i] = base[i] + 0.07 * nudge[i];
    return out;
  }

  // ---- Rule C: event colours (warm side) and plain light -------------------
  var EVENT = {
    edit:     { h: 6,   s: 90, l: 66 },  // coral
    activity: { h: 46,  s: 95, l: 60 },  // honey gold
    change:   { h: 322, s: 80, l: 72 }   // rose
  };
  function eventColor(kind) {
    var c = EVENT[kind] || EVENT.activity;
    return { h: c.h, s: c.s, l: c.l };
  }
  var plainColor = { h: 72, s: 28, l: 82 }; // pale firefly light, before embeddings

  // ---- Rule D: blinks follow time ------------------------------------------
  function blinkTimes(items, opts) {
    opts = opts || {};
    var n = items ? items.length : 0;
    if (!n) return [];
    var rand = opts.rand || ownRand;
    var speed = clamp(+opts.speed || 1, 0.25, 4);
    var randomness = clamp(opts.randomness == null ? 0.35 : +opts.randomness, 0, 1);

    var order = [];
    for (var i = 0; i < n; i++) order.push(i);
    order.sort(function (a, b) { return (+items[a].t || 0) - (+items[b].t || 0); });

    // squeeze gaps on a log scale: seconds ~ together, hours ~ a beat, weeks ~ a pause
    var raw = new Array(n), acc = 0;
    raw[order[0]] = 0;
    for (var j = 1; j < n; j++) {
      var gap = Math.max(0, (+items[order[j]].t || 0) - (+items[order[j - 1]].t || 0));
      acc += Math.log(1 + gap / 60000) + 0.02;   // small base so equal times still ripple
      raw[order[j]] = acc;
    }
    var pass = Math.max(2500, clamp(n * 450, 8000, 40000) / speed);
    var body = pass * 0.85;
    var scale = acc > 0 ? body / acc : 0;
    var meanGap = body / Math.max(1, n - 1);
    var jit = (0.15 + 0.85 * randomness) * Math.min(meanGap, 900) * 0.6;
    var lead = rand() * pass * 0.15;

    var out = new Array(n);
    for (var k = 0; k < n; k++) {
      var o = lead + raw[k] * scale + gauss(rand) * jit;
      out[k] = Math.max(0, Math.round(o));
    }
    return out;
  }

  // ---- Rule E: spark chain (the answering flash) ---------------------------
  function sparkChain(flies, originIndex, opts) {
    opts = opts || {};
    var n = flies ? flies.length : 0;
    if (!n || originIndex == null || originIndex < 0 || originIndex >= n) return [];
    var rand = opts.rand || ownRand;
    var strength = clamp(opts.strength == null ? 0.5 : +opts.strength, 0, 1);
    var result = [{ index: originIndex, delayMs: 0, power: 1 }];
    if (strength <= 0) return result;

    var maxSteps = Math.round(1 + 5 * strength);
    var cap = Math.max(1, Math.min(Math.round(4 + 36 * strength), Math.ceil(n * 0.25)));
    var reach = 60 + 90 * strength;
    var lit = {}; lit[originIndex] = true;
    var front = [{ index: originIndex, delayMs: 0 }];

    for (var step = 1; step <= maxSteps && front.length && result.length < cap; step++) {
      var fade = Math.pow(0.62, step - 1);
      var pNear = (0.1 + 0.22 * strength) * fade;
      var pKin = (0.2 + 0.35 * strength) * fade;
      var power = Math.max(0.35, 1 - 0.65 * step / maxSteps);
      var next = [], kinUsed = 0;
      for (var f = 0; f < front.length && result.length < cap; f++) {
        var src = flies[front[f].index];
        for (var i = 0; i < n && result.length < cap; i++) {
          if (lit[i]) continue;
          var o = flies[i];
          var dx = o.x - src.x, dy = o.y - src.y, d = Math.sqrt(dx * dx + dy * dy);
          var kin = src.groupKey != null && o.groupKey === src.groupKey;
          var delay = -1;
          if (d <= reach && rand() < pNear * (1 - 0.6 * d / reach)) {
            delay = front[f].delayMs + 110 + d * 1.4 + rand() * 70;
          } else if (kin && kinUsed < 2 && rand() < pKin * 0.25) {
            kinUsed++;
            delay = front[f].delayMs + 220 + rand() * 180;
          }
          if (delay >= 0) {
            lit[i] = true;
            var item = { index: i, delayMs: Math.round(delay), power: Math.round(power * 100) / 100 };
            result.push(item); next.push(item);
          }
        }
      }
      front = next;
    }
    result.sort(function (a, b) { return a.delayMs - b.delayMs; });
    return result;
  }

  var root = typeof window !== 'undefined' ? window : globalThis;
  root.DNA = {
    fileToDots: fileToDots,
    embeddingToColor: embeddingToColor,
    fakeEmbedding: fakeEmbedding,
    eventColor: eventColor,
    plainColor: plainColor,
    blinkTimes: blinkTimes,
    sparkChain: sparkChain
  };
})();
```

## Check

I ran the block in node (`globalThis.DNA`) with minR 1.5 and maxR 4.5.

**Rule A: dots per file.** Same seed gives the same dots.

| Size | Dots | Radii (px) |
|---|---|---|
| 0 B | 1 | 1.5 |
| 2 KB | 1 | 2.5 |
| 50 KB | 1 | 3.8 |
| 200 KB | 5 | 4.1, then 3.4 → 1.8 |
| 1 MB | 8 | 2 full, tail to 1.7 |
| 10 MB | 11 | 3 full, tail to 1.8 |
| 100 MB | 16 | 5 full, tail to 1.6 |
| 1 GB / 5 GB | 19 / 19 | 6 full, tail to 1.6 (capped) |

When min > max (min 5, max 1), the values are swapped and the dots stay
sensible.

**Rule B: hue per topic, 8 files each, topics in this order.**

| Topic | Hue | l / s |
|---|---|---|
| recipes | 139–150 | 66 / 90 |
| letters | 226–236 | 70 / 91 |
| garden | 170–185 | 63 / 85 |
| travel | 119–122 | 67 / 91 |
| music | 203–214 | 72 / 78 |
| work | 150–165 | 70 / 91 (now touching recipes, hence "≤ 4–5 topics") |

Over 2000 random vectors, hue stayed in 110–280. A vector of length 3 and
one of length 1536 both work.

**Rule C: event colours.** edit h 6, activity h 46, change h 322, plain
h 72 / s 28 / l 82. None of them falls in 110–280.

**Rule D: `blinkTimes`.** The test items sat at 0 s, 1 s, 2 s, 1 min,
1 h, 1 h + 5 s, 1 day, 1 week and 1 week + 1 s. At speed 1 and randomness
0 they blinked at 844, 878, 800, 1105, 2452, 2444, 4784, 7582 and 7637 ms.
Close items blink together, and far items are further apart. At speed 4
the pass is about 4× shorter. Two calls in a row give different jitter. 30
items with one shared timestamp at speed 4 ripple across 0.5–3.3 s, with
no field-wide flash.

**Rule E: chain size (median of 60 sparks).**

| Field | Strength 0.25 | 0.5 | 1 |
|---|---|---|---|
| 400 flies on 1200×800 | 6 | 18 | 40 (cap) |
| 100 flies | 4 | 7 | 17 |
| 40 flies | 1 | 2 | 4 |

Strength 0 always gives just the origin. Every chain is over within
1.5 s.
