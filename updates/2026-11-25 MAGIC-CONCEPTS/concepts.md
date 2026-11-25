# Three wild magic concepts for Agent Creator

*Merlin, 2026-11-25. Read with Columbo's `moments.md` next to it. These start
fresh, not from the current UI. Each one is a whole world Jony can build as
its own HTML page. Labels stay plain in all three: the world lives in light,
motion and a few words of microcopy, never in button names.*

## What all three must carry (from Columbo)

- **Home:** "there they are", alive and waiting, ready vs learning felt at a glance. Never in the way.
- **Birth:** *someone arrives*, not "file saved". Rare, so it may take its time (and can be skipped).
- **Files → DNA:** honest progress *is* the show. What went in, what's going, what didn't, all readable without watching.
- **Talk:** presence, not effects. First words never wait. No magic on sources, quotes or errors.

## Where I looked (and what I dropped)

I tested about a dozen sources against the real job ("have the person who
would know, right here"):

| Source | Kept? | Why |
|---|---|---|
| Synchronous fireflies | **Kept → A** | Many separate lights learning one shared beat is exactly "lots of files becoming one person". Sync = done, and you can see it from across a room. |
| An ocean that gives back a person from memory (the mood of Tarkovsky's *Solaris*) | **Kept → B** | The film's own question is the user's fear: "is it really them, or an imitation?" And "sink in" is already how people talk about learning. |
| Night-city neon, rain and smeared time (the mood of Wong Kar-wai's *Chungking Express* / *In the Mood for Love*) | **Kept → C** | A lit sign in a window is how you know someone's home. Neon tubes lighting one by one are a progress bar nobody has used. |
| Murmuration | Dropped | Beautiful, but a flock hides individuals. Files would vanish into it: the exact trust break Columbo warns about. |
| Mycelium | Dropped | Every AI "knowledge network" deck already uses it. |
| Darkroom photo developing | Dropped | Too close to the old portrait studio; the user asked for fresh. |
| Cell division | Dropped | Splitting reads as copying, the opposite of "one real person". |
| Aurora | Dropped | Gorgeous, means nothing here. |
| Séance / radio static | Dropped | Talking to the dead. Users feel protective of the real person; this would hurt. |

---

## Concept A — **Glade**
*Inspiration: nature. The synchronous fireflies of the Smoky Mountains and the
mangrove "firefly trees" of Southeast Asia, where thousands of insects that
start blinking at random slowly fall into one shared flash.*

**The soul is a rhythm.** Every file the agent learns becomes one light. At
first each light blinks on its own. As the agent truly takes in the material,
the lights find each other and pulse together. An agent in perfect sync is
fully itself. Each agent has its own tempo (seeded from its name), so you
know Tony's pulse from Marcus's the way you know a friend's walk.

**Palette and light**
- Night moss `#0B1410` (the field), deeper shadow `#060B08`
- Firefly cold light `#D8F26A`, halo the same at 25% blurred 12px
- Moon-silver text `#E6EEE8`, quiet text `#8C9A90`
- Didn't-make-it ember `#E89A4A` (steady, never blinking)
- Light comes only from the points. No gradients, no glow on panels. Text sits on solid `#101A15` panels with a hairline `#1E2B24`.

### 1. Home
- **Look:** a dark field. Each agent is a loose cluster of 12–40 small points (about one per file, capped) floating around their name. Name and state ("Ready" / "Learning · 18 of 30") in plain silver text under the cluster.
- **Move:** a ready agent's lights flash *together*, once per its own tempo (2.4–3.4 s). Each flash: rise 120 ms ease-out, fall 900 ms ease-in, the real firefly shape. A learning agent's lights blink out of step, at random. You read the state from the far side of the room: **in step = ready, scattered = still learning.** Points drift 1–2 px, very slowly (sine, 8 s).
- **Hover:** the cluster flashes once right away, out of turn, like real fireflies answering a torch. "They noticed you." Then back to its beat.
- **Click:** opens Talk at once. No exit animation.
- **Sound:** none.

### 2. Birth
- **0–0.6 s:** the panel fades out to the bare field, ease-in-out.
- **0.6–3 s:** points drift in from the edges, one per learned file, each blinking on its own random rhythm. A soft night hush (filtered noise, −30 dB).
- **3–8 s:** the lights pull into step. Little pockets sync first, then pockets join pockets. (Build it as real phase coupling: each point nudges its timing toward its neighbours a little every frame. It's cheap, and it looks truly alive.)
- **~8 s:** **the one flash.** Every light fires at once. The whole field lifts to a faint green wash (8% opacity, 160 ms in, 1.2 s out, ease-out). One low, soft *thum*, like a breath let out.
- **8.5 s on:** in the afterglow the name appears in silver (fade 400 ms), and their first words type in below at normal speed.
- **Skip:** any click or key jumps straight to the flash. The whole thing is never longer than 9 s.

### 3. Files flowing in
- **Drop:** each file becomes a light with its name in small type beside it. It flies from the drop point to the edge of the glade on a soft curve (700 ms, ease-out). The plain list on the right gets a row: name · size · "Reading".
- **Reading:** the light blinks on its *own* rhythm, out of step.
- **Learned:** over its next one or two flashes it slides into the agent's beat and joins the cluster. The row turns to "Learned". The counter reads **"18 of 30 in step"**.
- **Didn't make it:** the light stops blinking. It sits as a steady, dim ember at the edge with its name and the plain reason ("Couldn't read this PDF · Try again"). Not blinking = not in. Nobody can mistake it for success.
- **Walk away:** nothing needs watching. The tab title shows "18/30". When the last one joins, the whole cluster gives one shared flash (smaller than the birth flash, no sound).

### 4. Talk
- **Look:** the agent's cluster sits small and dim (15%) behind the top corner, never under text. The chat is solid panels, plain type.
- **Send:** the first words appear immediately. The cluster flashes once *at the same moment* the first words land, never before them.
- **While answering:** the cluster keeps its slow tempo, so you feel them "breathing" as they speak.
- **Outside what it learned:** the cluster goes still, with no flash, next to the plain line saying it isn't in the material. Stillness means "I don't know this", and it's never decoration.
- **Sound:** none by default.

**Signature moment:** the birth sync. Chaos falls into one heartbeat and the
whole field flashes as one. People will try to describe it to a friend
("they all just... found each other").

**What stays calm:** all text, buttons and file lists sit on solid panels.
Lights live only in the background field and never blink under words.

**Risk:** flashing light and photosensitivity. Keep flashes low-contrast,
never full-screen bright, never more than one every 2 s, and give a
reduced-motion mode where every point just glows steadily (scattered dim =
learning, even bright = ready). Also, green on black can drift toward
"hacker terminal" if the points get too sharp. Keep them soft and warm-green.

---

## Concept B — **The Remembering Sea**
*Inspiration: a film mood. The spirit of Tarkovsky's* Solaris*: an overcast
ocean that holds everything you remember and gives a person back. Long, slow
takes, rain you can hear, water moving like thought, one warm lamp in a grey
world. Mood only: no characters, shots, station, or music from the film.*

**The soul is what has sunk in.** Everything the user gives the agent sinks
into a calm grey sea. The agent is whatever rises back out of it. "Did it
sink in?" is the question the whole world answers, literally.

**Palette and light**
- Pewter sea `#2E3B3F`, deep water `#1C2629`
- Sea-glass `#8FB3A8`, foam `#E9EEE9`
- One warm lamp `#E8C48A`, used only for the agent's name and "Ready"
- Overcast light: soft, from above, no hard shadows. A faint 2% film grain over everything.
- Text sits on a dry "shore" panel `#E9EEE9` with ink `#1C2629`, so it always reads like paper, never like water.

### 1. Home
- **Look:** a wide grey sea across the lower half. Each agent is a point on the water with their name lit in warm lamp light just above it.
- **Move:** around a ready agent the water is calm, with one slow ring swelling outward every 10 s (sine in-out). The water around a learning agent shivers with fine quick ripples. Calm = ready, restless = still learning. The whole view drifts sideways about 1 px every 2 s, like a long take that never cuts. You barely notice it, but the place feels alive.
- **Click:** opens Talk at once. The sea doesn't play anything.
- **Sound:** none.

### 2. Birth
- **0–1.2 s:** the view sinks below the surface (slow ease-in). The light goes green-grey and the sound of rain goes muffled.
- **1.2–4 s:** on the sea floor lie pale shapes, one per learned file, labelled faintly. They loosen into fine silver threads that rise and slowly turn around one point (ease-in-out, nothing fast).
- **4–7 s:** the view rises with them (3 s, very slow ease-in-out). It breaks the surface. Rain on water, close.
- **7–9 s:** **the rising.** Their *name* lifts out of the sea, letter by letter, as standing water, with water running off each letter (each letter 300 ms, staggered 120 ms). No face and no fake portrait: the real person is honoured, not imitated.
- **9–10 s:** the rain stops. The sea goes mirror-flat. The name catches the warm lamp light. One single drip. Then silence.
- **10 s on:** their first words appear on the shore panel. Their reflection shows in the water for 600 ms, then settles away.
- **Skip:** any click jumps to the mirror-still moment.

### 3. Files flowing in
- **Drop:** each file falls into the sea with a ring (ripple 1.4 s, ease-out). It shows as a pale tile with its name, visible through the water.
- **Reading:** the tile sinks slowly. **Depth is progress**: a faint depth scale at the side, with the plain % next to each name in the shore list.
- **Learned:** it settles on the floor and gives one faint glow, then joins the bed of everything else. The row says "Learned".
- **Didn't make it:** **it floats.** It stays on the surface, bobbing gently (4 s sine), with its name and the plain reason. What didn't sink in, floats. You can't miss it and you can't mistake it.
- **Walk away:** the tab title shows "18/30". When the last file settles, one wide calm ring crosses the whole sea (2.5 s, ease-out).

### 4. Talk
- **Look:** a thin strip of still water along the bottom 15% of the screen. Everything else is the dry shore panel: plain, readable chat.
- **Send:** the user's message drops a small ring into the strip (600 ms). The answer's first words appear at once at full strength. After that, each new line surfaces from 70% to 100% opacity over 200 ms. That's the only motion, and it never holds a word back.
- **Outside what it learned:** no ring, no motion. Just the plain line.
- **Sound:** optional soft rain bed, off by default, one switch to turn it on.

**Signature moment:** the mirror. The rain stops, the sea goes perfectly
still, and their name hangs above the water in warm light with one drop
falling from it. It's the quietest moment in the app, and the one people
remember.

**What stays calm:** the shore panel. All text, sources and buttons live on
dry paper-coloured ground. The water only ever sits around the edges.

**Risk:** slowness and grief. This world is beautiful but heavy. For an agent
built from a living mentor it can feel like a memorial. Keep the warm lamp
light generous, keep birth at 10 s or less, and never let Home or Talk
inherit the slow tempo. Build: real water simulation would be too heavy.
Fake it with 2D canvas rings and CSS, no WebGL.

---

## Concept C — **Neon After Rain**
*Inspiration: a film mood. The spirit of Wong Kar-wai's nights:* Chungking
Express *and* In the Mood for Love*. Wet streets, saturated red and jade,
light leaking through rain, smeared slow-shutter crowds around two people in
sharp focus, and the feeling of a crowded city that falls away when you're
with the one person you came to see. Mood only: no characters, places,
scenes or songs.*

**The soul is a lit sign.** Every agent has its own neon sign: their name,
bent in glass tube, in its own colour. Their sign is lit = they're home.
Each file they learn wires in one more tube, so the sign *is* the progress
bar. You know whose window it is from down the street.

**Palette and light**
- Wet asphalt `#120E12`, smoke haze `#2A2228`
- Neon red `#FF3B4E`, jade `#19C2A6`, sodium amber `#FFB547`, cold blue `#5B8CFF`. Each agent gets one, chosen from their name.
- Unlit glass tube `#3A3036` (you can see the letter, it just isn't glowing)
- Text on matte panels `#1A1418`, ink `#F2E9EC`. Neon *never* touches body text.
- Light: neon bloom on the signs only (blur 8px + 18px, two layers), with their reflections smeared in a wet ground strip below.

### 1. Home
- **Look:** a night street through a rainy window. The agents are shop signs in a row, each their name in tube script, reflected and smeared in the wet ground below. Under each sign, in plain small type: "Ready" or "Learning · 18 of 30".
- **Move:** a ready sign is fully lit. Every 15–25 s (random per sign) one tube flutters once (two dips of 40 ms), the way real neon does. A learning sign is *partly lit*: the lit share of tubes matches the learned share of files. Half-lit sign = half learned. Rain streaks slowly down the glass in front (CSS, slow, no flashing).
- **Hover:** that sign buzzes 10% brighter over 120 ms, ease-out.
- **Click:** opens Talk at once.
- **Sound:** none.

### 2. Birth
- **0–0.8 s:** the street goes quiet. The crowd behind smears into slow-shutter streaks, step-printed at about 8 fps with trails, while the sign stays sharp. Rain hush.
- **0.8–2 s:** a dark, unlit sign of their name hangs in the middle. The ballast ticks twice (*tk… tk*).
- **2–5 s:** **the strike.** Letters try to light, sputter and fail. Real neon timing: flickers of 40–120 ms, some letters catch, one stubborn letter dies twice. Each catch adds a faint crackle.
- **5 s:** the whole name locks on at once. A low hum (about 2 s, fading to nothing). Light spills across the wet ground; the reflection ripples once (800 ms, ease-out).
- **5.5–7 s:** a slow focus pull. The sign softens to a blur and their first words come into sharp focus in a lit window below (600 ms, ease-in-out).
- **Skip:** any click jumps to the lock-on.

### 3. Files flowing in
- **Look:** the sign up top. Below it, a plain list of files, one row each, with a small tube mark at the start of each row.
- **Reading:** the row's tube glows at 30% with a slow shimmer (1.6 s sine). It's warming up.
- **Learned:** the tube lights full. A spark runs along a thin wire from the row up to the sign (500 ms, ease-in-out) and one more tube on the sign lights. The counter: **"18 of 30 lit"**.
- **Didn't make it:** the row's tube shows as *cracked glass*, dark with a hairline crack, plus the plain reason and "Try again". No spark goes up, so the sign keeps a visible dark gap. A gap means something didn't make it in.
- **Walk away:** the tab title shows "18/30". When the last tube lights, the sign does one full flutter-and-hold (like the birth strike, but 600 ms and silent).

### 4. Talk
- **Look:** the agent's sign glows small at the top. The chat sits on matte panels.
- **Send:** the first words appear at once, crisp. While the answer streams, the street behind the panels step-prints: the city smears and slows, the only sharp things are the two of you. When the answer ends, the street picks up its normal pace again (400 ms). The effect runs *alongside* the words, never before them.
- **Outside what it learned:** the sign dims to 60% while that plain line shows. They look away, honestly.
- **Sound:** none by default. An optional rain bed.

**Signature moment:** the strike. Their name in dark glass sputters, fails,
catches, and then locks on with a hum while light floods the wet street.
People will make others watch it.

**What stays calm:** body text, sources and buttons never sit on neon or
over the smear. Matte panels, plain type. The city lives behind and around them.

**Risk:** too cool for a working tool. Saturated night colours can tire the
eyes at 10 a.m. and feel like a nightlife app. Give it a "day" version
(signs unlit-but-visible glass on a pale rainy street, colour only in the
lit tubes). Flicker must respect reduced motion: signs just appear lit, and
the strike becomes a 300 ms fade.

---

## Rules for all three (for Jony and the builders)

- **Reduced motion:** every effect has a still version that still tells the truth (sync, depth, lit tubes all become static states with the same plain text).
- **Sound:** off by default, one mute for all, never louder than −24 dB. Only the birth has a "voice" (thum, drip, hum).
- **Honesty:** every visual state has a plain text twin right next to it: Ready / Learning · n of m / Learned / Couldn't read · reason.
- **Talk:** nothing plays before the first words. Ever.
- **Birth:** skippable with any click or key, 10 s at most.
- **Each concept is one standalone HTML page** with the four moments as scenes and a small switcher to jump between them.

## Side by side

| | A · Glade | B · The Remembering Sea | C · Neon After Rain |
|---|---|---|---|
| Source | Nature: synchronous fireflies | Film mood: *Solaris* | Film mood: Wong Kar-wai nights |
| The soul is… | a shared rhythm | what has sunk in | a lit sign |
| Palette | moss-black, cold yellow-green | pewter, sea-glass, one warm lamp | wet asphalt, saturated neon |
| Tempo | quick pulse, organic | very slow, long takes | stutter then hold |
| Ready vs learning | in step vs scattered | calm water vs restless | fully lit vs partly lit |
| A failed file | a steady ember that doesn't blink | it floats | cracked glass, a gap in the sign |
| Birth | chaos falls into one flash | the name rises from the sea | the name strikes and locks on |
| Talk presence | they "breathe" as they speak | lines surface | the city smears away |
| Signature | the sync flash | the mirror-still sea | the neon strike |
| Feels like | wonder, alive | awe, quiet, intimate | thrill, cinematic, close |
| Main risk | flashing / photosensitivity | heavy, memorial feel | too stylish for daytime work |
| Build weight | light (2D canvas points) | medium (canvas rings, CSS) | light–medium (CSS glow, blur) |

**My pick, if forced:** **A · Glade**. Its picture of progress is the most
honest of the three: you can *see* "in step" from across the room. Its
birth is the most surprising. It's also the lightest to build. B is the
most moving and C is the most fun. Build all three so the user can feel the
difference.
