# FIREFLIES-BUILD: how people will use the + build screen (Columbo)

## Summary

People open this screen for one job: **"start my new agent from the
stuff I already have."** They have a folder on their Mac: a course, a
pile of books, notes, recordings. They want to hand it over in one move
and feel that the agent is now on its way.

It happens rarely (once per agent), but it is a big moment. It is the
start of something, so it carries hope and a little doubt ("will it take
all of this?"). The user's design fits that well: a quiet, dim ring of
fireflies around an empty middle feels like "something is waiting for
you here". The burst after a pick or drop answers the doubt: "yes, got
it."

The user's rules are **fixed**: dim fireflies circling the middle, each
at its own speed; hover the middle and **Select Folder** shows very
faintly in the firefly colour and glow while a few nearby fireflies
brighten; a click opens the Finder folder picker; a drop works anywhere;
after a pick or drop every firefly lights up and speeds up, then the
screen moves on to a calm placeholder. Fireflies DNA look, dot radius
2.5 to 6.0, no size controls, Reduce Motion respected, one way to do
each thing.

**Nothing gets added.** Every finding below is about how those parts
behave in each moment. The biggest risks are not visual: a first-timer
who doesn't know where to aim, a drop that silently does nothing in the
app, and a huge folder that freezes the screen before the burst.

Journey step: **UJ2 · 1, "Brings a folder, files or a path"**
(`updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`).

## Scope

**In (this stage):**
- arriving on `/new` from the plus on home or from Cmd+N
- the orbit at rest, and hovering the middle to find **Select Folder**
- clicking the middle to open the Finder folder picker, and cancelling it
- dropping a folder or loose files anywhere on the window
- dropping something that isn't a folder or file
- picking or dropping a huge folder
- the burst and the hand-off to the calm placeholder
- leaving with Esc or Back
- all of it with Reduce Motion on
- the browser dev server, the real app and the installed build

**Out (and why):**
- **what is in the folder** (the inventory, UJ2 · 2): needs reading the
  files and its own design. Phase 3 in the roadmap.
- **the proposed split and the Sketcher chat** (UJ2 · 3): depends on
  the inventory. Phase 4.
- **learning, the wait and "done"** (UJ2 · 4–6): a large background
  piece. Phase 5.
- **making an agent from one line with no folder** (UJ3): the user's
  brief for this screen is folder only. Open question Q1.
- **adding material to an existing agent** (UJ8): starts from the agent
  page, not the plus.
- **typing or pasting a path**: the brief names click and drop only; a
  path field would be a second way and a new element. The power user's
  path habit is noted in Q6.
- **mobile and touch**: the app is a desktop window with mouse and
  keyboard (assumption, same as AGENT-HOME).

## Who uses it

- **The clone-maker** (core): has a folder of a teacher's courses and
  books ready. Came here on purpose.
- **The first-timer**: just installed, pressed the plus to see what
  happens. Doesn't know yet what the app wants.
- **The Finder dragger**: a long-time Mac user with Finder open beside
  the app. Drags things into windows by habit.
- **The corpus power user**: a 10–40 GB folder, thousands of files.
- **The curious clicker**: pressed the plus "just to look", or by
  mistake.
- **The Reduce Motion user**: has it on for comfort or because motion
  makes them feel sick.
- **The keyboard person**: Cmd+N to get here, Esc to leave.

## Behavior table

Sorted by combined score (likelihood + frequency). Frequency is capped
by how often people make agents: nothing on this screen is a daily
habit. So a 5 here means "every time they make an agent".

| # | Behavior | Likelihood | Frequency | Reason |
|---|----------|-----------:|----------:|--------|
| B1 | **Arrive from the plus or Cmd+N** | 10 | 5 | Every new agent starts here. Cmd+N is scored inside this: keyboard people use it, most click. |
| B2 | **Click the middle, pick a folder in Finder** | 9 | 5 | The main way. "Select Folder" says exactly this, and the Finder dialog is familiar to every Mac user. |
| B3 | **Hover and find the hidden "Select Folder"** | 8 | 5 | The mouse drifts to the middle because the fireflies circle it. Lower than 10: some will click before the faint word fully shows. |
| B4 | **Look and wait, unsure what to do** (first visit) | 7 | 2 | The screen has no words until hover. Many first-timers pause 1–3 seconds. Only on the first one or two visits. |
| B5 | **Drop a folder anywhere** | 7 | 4 | Mac users drag from Finder by habit, and the brief says the whole window takes it. Scored below the click: on the first visit most people don't know a drop is welcome. |
| B6 | **Cancel the Finder picker** | 7 | 3 | People open Finder, look, realise the folder is elsewhere or not ready, and cancel. Common in every app with a picker. |
| B7 | **Leave with Esc or Back** | 7 | 3 | Plus pressed to look, or by mistake, or they change their mind. |
| B8 | **Pick or drop a huge folder** (1,000+ files, GBs) | 6 | 3 | Real material is big (A3 in the journeys). For the clone-maker this is the normal case, not the edge. Scored 6 because not every agent has big material. |
| B9 | **Drop loose files** (several selected in Finder) | 6 | 3 | Some people keep material loose on the Desktop, or pick "just these three PDFs". |
| B10 | **Pick a folder through Finder's sidebar shortcuts** (Desktop, Downloads, iCloud) | 6 | 3 | Typical folder picker use. The picked folder is often bigger than they meant ("all of Downloads"). |
| B11 | **Use it with Reduce Motion on** | 3 | 5 | Few users have it on (assumption: a few percent), but for them it is every visit. Scored lower on likelihood, kept high on care: see W5. |
| B12 | **Click again, or drop again, during the burst** | 5 | 2 | Impatient double-clicks, or a second drop of "the other folder too". |
| B13 | **Drag over the window, then change their mind and drag away** | 5 | 2 | Normal drag hesitation. |
| B14 | **Use the keyboard to pick** (Tab to the middle, Enter or Space) | 3 | 3 | Keyboard and screen reader users. Same action, reached by keys, not a second way. |
| B15 | **Drop something that isn't a folder or file** (a link, selected text, an image from a web page) | 3 | 1 | Rare, mostly by mistake. Low score, but see W2. |
| B16 | **Pick an empty folder** | 2 | 1 | A freshly made folder they forgot to fill. Rare. |
| B17 | **Drop a Mac app or a package** (`.app`, `.photoslibrary`) | 2 | 1 | Rare. macOS shows these as one file, but they are folders with thousands of files inside. See W3. |

**Watch out** (low score, but can break trust):
- **W1 · The drop does nothing in the app.** In the Tauri window, a drop
  from Finder is caught by the app shell, not by the page, unless the
  build listens for the native drop event (this is how Tauri v2 works by
  default; Jony decides how). If drop works on the dev server but not in
  the installed app, the user thinks the screen is broken. Must be tested
  in the installed build.
- **W2 · A bad drop feels like an error, or like success.** A link or
  text dropped must not light the burst and must not show an error box.
  A gentle settle back, as if the fireflies "looked and found nothing".
  No agent is made.
- **W3 · Hidden giants.** A `.app`, a photo library, a `node_modules` or
  `.git` folder, or the whole home folder: one drop, tens of thousands
  of files. The screen must never freeze. (Assumption: hidden files and
  dot-folders are left out of `entries`; Jony confirms. Open question Q4.)
- **W4 · An agent made by accident.** Pressing the plus, hovering, or
  cancelling Finder must create nothing. Only a real pick or drop with at
  least one file makes the agent (`POST /api/agents` then
  `POST /api/agents/:id/files`). Esc before that leaves no trace on home.
- **W5 · Reduce Motion users get circling dots.** For someone who feels
  sick from motion, an orbit or a speed-up is not a style issue. No
  orbit movement, no speed-up, no zoom; brightness changes only.
- **W6 · Private material leaves the Mac.** Clone-makers may drop client
  calls. Paths and sizes go only to the local app server. (Fact today;
  keep it true. No magic or words about it on this screen.)
- **W7 · The browser asks "Upload N files to this site?"** On the dev
  server, Chrome shows its own confirm after a folder pick. It can't be
  styled or hidden. Fine for the dev server; the real app uses the native
  Finder dialog and has no such prompt. Eraser should know this is not a
  bug in our screen.

## Deep dives

The brief asks for both scores at 7 or more. Because frequency is capped
at 5 on this screen (one visit per agent), no behavior reaches 7 on both.
I took the top behaviors by combined score instead, plus the ones the
brief names (huge folder, Reduce Motion, bad drop).

### B1 · Arrive from the plus or Cmd+N

- **Moment:** Weekend afternoon or a free evening, at the desk. They
  were on home, looking at their agents, or had just opened the app.
- **Trigger:** "I finally have the course downloaded. Let's make Tony."
  Or, for a first-timer: "What does the plus do?"
- **Thoughts:** "Okay… new one." Then, a second later: "Where do I put
  my stuff?"
- **Emotions:** Before: anticipation, a little resolve. During the
  arrival: the fade from home feels like walking into a new room.
  After: quiet attention, waiting to be told what to do.
- **Expectations:** The screen is there at once, on the same dark
  Fireflies background, no white flash. The fireflies are already
  circling or start circling right away; no long intro. The plus's
  fade (`glade.call`) flows into the orbit without a jump.
- **Success:** "This feels like the place where agents are born."
- **Friction and fears:** A blank dark moment before the fireflies show
  ("is it loading?"). The orbit starting with a jolt after the fade.
  Feeling that pressing the plus already made something (W4).
- **Product insight:** The orbit should be visible within the arrival
  fade, not after it. Arrival from Cmd+N and from a click look the
  same. Nothing is saved on arrival.

### B2 · Click the middle, pick a folder in Finder

- **Moment:** Right after arriving. Mouse in hand. Finder is closed or
  behind the app.
- **Trigger:** They see "Select Folder" (or simply click the empty middle
  because everything circles it).
- **Thoughts:** "Select folder, yes." Finder opens: "Where did I put
  it… Documents, Courses, Tony… there." Click **Open**.
- **Emotions:** Before: purpose. During Finder: familiar, routine,
  a little search effort. After the click on **Open**: a small moment of
  "did it take it?" that the burst answers within a blink.
- **Expectations:** One click opens the real macOS folder dialog, not a
  web-style file list. It picks folders, not single files (the word
  says "Folder"). After **Open**, something visible happens immediately,
  well under half a second. The burst feels like an answer, not a wait.
- **Success:** "Click, pick, and the fireflies went wild. Got it."
- **Friction and fears:** The dialog takes a second to appear and they
  click again (two dialogs, or none). The burst only starts after all
  file sizes were read, so a big folder feels frozen (see B8). The
  dialog opens somewhere odd (another screen, behind the window).
- **Product insight:** The burst starts the moment a folder is chosen,
  before any slow work, and the slow work (listing files, the two API
  calls) runs inside it. A second click while the dialog is open does
  nothing. Pick and drop end in the same `onChosen(entries)`, so the
  rest of the screen cannot tell them apart.

### B3 · Hover and find the hidden "Select Folder"

- **Moment:** The first few seconds on the screen. The mouse is wherever
  it was when they pressed the plus, often bottom left (where the plus
  is on home).
- **Trigger:** The eye follows the circling fireflies to their centre;
  the hand follows the eye.
- **Thoughts:** "Something's in the middle… oh, 'Select Folder'."
  Some will think "that's pretty" and enjoy the fireflies leaning in.
- **Emotions:** Before: mild uncertainty. During: a small, pleasant
  discovery, like a secret being whispered. After: confident.
- **Expectations:** The word appears softly once the mouse is near the
  middle, not only exactly on it. It's readable when they look for it,
  even though it is very faint. The nearby fireflies brightening says
  "yes, here". It fades away when the mouse leaves, without flicker
  when the mouse sits on the edge of the area. The pointer turns into a
  hand over the middle, like any clickable thing (assumption: the
  cursor change is not a new element; Q2).
- **Success:** "I didn't need to be told. It showed me."
- **Friction and fears:** The word is so faint it's unreadable on some
  screens or in a bright room (the user wants it very faint; the risk is
  real). The hover area is so small they must hunt for it. Flicker on
  the edge. A first-timer who never moves the mouse to the middle sees
  no words at all (B4).
- **Product insight:** "Very faint" should mean *quiet*, not *invisible*:
  Eraser checks it with pixels, as the team's design rules say. The
  hover area should be generous, about the size of the empty centre the
  fireflies circle, so aiming is easy. In and out are slow fades.

### B4 · Look and wait, unsure what to do

- **Moment:** First visit only. Just installed, pressed the plus out of
  curiosity.
- **Trigger:** The screen has fireflies and no words.
- **Thoughts:** "Pretty. Now what? Am I supposed to do something?"
- **Emotions:** Before: curious. During: one to three seconds of mild
  doubt. After: delight if the middle answers their mouse; slight
  frustration if nothing tells them.
- **Expectations:** Something will guide them without a tour. The
  centre of a ring is where people look and aim (Don Norman's
  signifier: the orbit *is* the sign that the middle matters).
- **Success:** Within a few seconds the mouse reaches the middle, the
  word whispers, they click.
- **Friction and fears:** Moving the mouse around the edges and finding
  nothing. Thinking the screen is still loading.
- **Product insight:** The orbit alone carries the "aim here" message;
  no extra hint text (one way to do each thing, and the user's layout).
  Open question Q3: should the word show once on its own on the very
  first visit? This is a product call, not ours to make; until answered,
  it shows on hover only, as the user wrote.

### B5 · Drop a folder anywhere (and B9, loose files)

- **Moment:** Finder open next to the app. The folder is right there,
  on the Desktop or in a Finder window.
- **Trigger:** "Easier to just drag it in."
- **Thoughts:** While dragging: "Will it take it here? Do I have to hit
  the middle?" On release: "There."
- **Emotions:** Before: efficient, a bit of habit. During the drag:
  a moment of "is this the right spot?" After: satisfied, the same as a
  pick.
- **Expectations:** The window shows, quietly, that it will accept the
  drop as soon as the drag enters it (Apple's guidance: clear feedback
  while dragging, and only while over the target). Releasing anywhere
  works, not only on the middle. A drop of several loose files works the
  same as a folder. Dragging away again undoes the sign.
- **Success:** "Drag, let go, burst. Didn't even have to aim."
- **Friction and fears:** Nothing happens while dragging, so they aim
  carefully for the middle "just in case". The drop works in the browser
  but not in the app (W1). Loose files are refused because "it said
  Folder".
- **Product insight:** The drag sign uses the same light language
  (fireflies stirring, the middle warming), not a box or an outline. It
  appears on enter and disappears on leave without flicker as the drag
  crosses inner parts of the page. Loose files are welcome: "Select
  Folder" names the click, not a rule about drops.

### B6 · Cancel the Finder picker

- **Moment:** Finder dialog open. They realise the folder isn't ready,
  or they picked this screen too early.
- **Trigger:** "Not now" or "wrong place". They press Cancel or Esc in
  the dialog.
- **Thoughts:** "Never mind." Then: "Did it do anything?"
- **Emotions:** Before: mild change of mind. After: calm, if the screen
  is just as it was.
- **Expectations:** Back to the same orbit, as if nothing happened. No
  error, no message, no burst, no agent made. The hover word fades
  normally. They can click again right away.
- **Success:** "Okay, nothing happened. Good."
- **Friction and fears:** An error box ("No folder selected"). A half
  burst that looks like success. The screen stuck in a "waiting" look.
  An empty agent on home later (W4).
- **Product insight:** Cancel is a non-event: a gentle settle back to the
  rest state. Esc pressed inside the Finder dialog closes only the
  dialog, not the screen; a second Esc then goes home.

### B7 · Leave with Esc or Back

- **Moment:** Any time before a pick. Often seconds after arrival.
- **Trigger:** Plus pressed by mistake, or "I'll do it later."
- **Thoughts:** "Back."
- **Emotions:** Neutral. A small worry if they're not sure the exit
  worked or if something was made.
- **Expectations:** Esc (and the browser or app Back) goes straight to
  home, the list unchanged. Fast, no exit animation that delays them.
- **Success:** Home, as they left it.
- **Friction and fears:** Esc does nothing. Esc goes home while the
  Finder dialog is open, leaving the dialog floating. A new empty agent
  on the list.
- **Product insight:** Esc is the one way out (plus Back, which the
  browser and app already give). Before a pick it leaves no trace. After
  the burst, on the placeholder, Esc still goes home, where the new
  agent is now at the top.

### B8 · Pick or drop a huge folder

- **Moment:** The clone-maker's big day. The folder is 12 GB: 300
  videos, transcripts, books, a "Bonus" folder.
- **Trigger:** "This is everything. Let's go."
- **Thoughts:** "Will it choke? That's a lot." During the burst: "It's
  taking it." If the screen stalls: "Did it crash?"
- **Emotions:** Before: excitement mixed with worry. During: relief if
  the burst starts at once. After: trust, or, if it froze, a strong
  doubt that colours everything after.
- **Expectations:** The same instant response as a small folder. No
  freeze, no beach ball. They don't expect the reading to be done now,
  only that the app took it.
- **Success:** "It didn't even blink."
- **Friction and fears:** The page freezes while every file size is
  read. The burst plays, then the screen stalls before the placeholder.
  The upload fails silently on a very long list.
- **Product insight:** Listing files and sizes must not block the
  burst. Only paths and sizes are sent, never the file contents (a
  thousands-of-entries list is small). If listing takes longer than the
  burst, the burst holds its glow until it's done rather than jumping
  to the placeholder early or dropping files. Test with a folder of
  10,000+ files and with a `.app` dropped (W3).

### B11 · Use it with Reduce Motion on

- **Moment:** Any visit, for someone who turned on Reduce Motion in
  macOS settings.
- **Trigger:** Same as B1.
- **Thoughts:** They don't think about motion at all, if it's done
  right. If it isn't: "Ugh, spinning dots."
- **Emotions:** Calm when the screen is still. Discomfort, sometimes
  real nausea, when things circle or zoom.
- **Expectations:** The screen keeps its meaning without movement:
  still dim dots around the middle, the hover word, nearby dots
  brightening, and on a pick or drop a brightening of all dots, then
  the placeholder. No circling, no speed-up, no flying dots.
- **Success:** "Same screen, just still."
- **Friction and fears:** The orbit still turns, only slower. The burst
  still speeds up. The arrival fade from home still zooms.
- **Product insight:** Brightness is the only language under Reduce
  Motion. Every state (rest, hover, drag over, burst, settle) must still
  be visible as a change in light. Checked for both the app's own media
  query and the macOS setting in the installed build.

### B15 · Drop something that isn't a folder or file

- **Moment:** Rare. A link dragged from Safari, a text selection, an
  image dragged from a web page by mistake.
- **Thoughts:** "Oops." Or "maybe it takes a link?"
- **Expectations:** Nothing bad happens. Either it is calmly ignored or,
  if the item really is a file (an image saved from the page), it counts
  as a file.
- **Product insight:** No burst unless at least one real file arrives.
  The drag sign may show during the drag (we can't always know what it
  is until the drop), and then it settles back gently. No error box, no
  words (team rule: no magic on errors, and here no message at all is
  the calmest answer).

## Key insights

1. **The job is "take my stuff and start".** Once per agent, high
   emotion. The burst is the receipt: it must come at once.
2. **The orbit is the signpost.** A ring points to its centre. That is
   why a hidden word can work: the eye and hand go to the middle on
   their own. The hover area should be generous.
3. **"Very faint" must still be readable when looked at.** Quiet, not
   invisible. Checked with pixels, not only with internal state.
4. **Pick and drop are one path after the choice.** Both end in
   `onChosen(entries)` → burst → placeholder. The user can't tell which
   way they came, and neither can the rest of the code.
5. **Nothing is made until something real is chosen.** Arrival, hover,
   cancel, a bad drop and Esc all leave no trace.
6. **Big folders are the normal case for the core user.** The burst must
   never wait on file listing; the slow part runs inside it.
7. **The app is not the browser.** Drops and the folder dialog work
   differently in the Tauri window. The installed build is the real
   test, not the dev server.
8. **Under Reduce Motion, light carries everything.** Every state is a
   brightness change; nothing moves.

## Open questions (with the assumption we work with until answered)

- **Q1 · No folder yet.** UJ1 says the first screen should let people
  either bring a folder or type one line. This screen is folder only.
  *Assumption:* the user chose folder only for now; making from one line
  comes later from somewhere else. Not our call; flagged for the
  orchestrator.
- **Q2 · The pointer over the middle.** *Assumption:* the hand cursor
  shows over the hover area. It is standard and adds no element.
- **Q3 · First visit, no hover.** Should "Select Folder" show once by
  itself on the very first visit? *Assumption:* no, hover only, as the
  user wrote. Watch how first-timers behave.
- **Q4 · Hidden files and packages.** *Assumption:* dot-files and
  dot-folders (`.DS_Store`, `.git`) are left out of `entries`; packages
  like `.app` are taken as they come. Jony confirms in
  `03-jony-build.md`.
- **Q5 · Path shape.** The browser gives paths relative to the chosen
  folder; the app can give full paths. *Assumption:* `path` starts with
  the chosen folder's own name (`Tony Course/Books/a.pdf`), the same in
  browser and app, matching the server tests (`notes/deep/a.md`).
- **Q6 · Path by typing.** The power user may want to paste a path.
  *Assumption:* out now (it would be a second way and a new element).
  Finder's own Cmd+Shift+G inside the picker already covers it.
- **Q7 · The placeholder.** What does it say? *Assumption:* a calm state
  of `/new` with no controls, at most the agent's first quiet sign of
  life. Merlin names the moment; any words go through the team's word
  list (§6 of `magic-merlin.md`).
- **Q8 · Second pick during the burst.** *Assumption:* ignored. One
  folder per new agent now; adding more is UJ8.

## Sources

- Apple Human Interface Guidelines, drag and drop (clear feedback while
  dragging, highlight the target only while over it, show feedback when
  a drop fails):
  https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- Nielsen Norman Group, drag and drop (feedback on grab and on what the
  drop will do): https://www.nngroup.com/articles/drag-drop/
- react-dropzone, using with Tauri (native drop events carry paths; the
  webview's own drop events don't, by default):
  https://react-dropzone.js.org/guide/tauri/
- Tauri drag and drop issues write-up (`dragDropEnabled` and the
  native drop handler): https://wyhinton.github.io/2026/01/14/Tauri-DragAndDrop-Issues
- Smashing Magazine, uploading directories with `webkitdirectory`:
  https://www.smashingmagazine.com/2017/09/uploading-directories-with-webkitdirectory
- Browser confirm for folder uploads (Chrome since v66):
  https://shardimage.com/blog/browser-alert-for-uploading-complete-folders-10
- Earlier team research: `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`
  (D8, UJ1, UJ2) and `updates/2026-11-26 AGENT-HOME/01-columbo-report.md`.
