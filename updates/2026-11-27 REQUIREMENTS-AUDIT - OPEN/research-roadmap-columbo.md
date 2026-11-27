# Research and roadmap for the audit's open rows (Columbo, 2026-11-28)

Covers audit rows **A11, A12, C8, D8, F15, G5, G8, H8** in `checklist.md`.
This is a plan, not app code. Nothing in `src/` changed.

**The user's job (JTBD):** "Turn what I have about one person into an agent,
**then use it**." Main covers the *make* half well (home → build → creation →
left side). The *use* half is what is missing. Most of the slots below exist
to close that half.

---

## A11. RAG plan: what "really embedded" means

**Ruling.** A Knowledge file counts as *really embedded* only when all of
these are true for it:

1. Its text was pulled out into plain text (the A12 copy below).
2. That text was cut into chunks (about 1,500 characters each, 200 overlap).
3. Every chunk was turned into a vector by a **local** model (no API key,
   no network after the first model download) and saved in the agent's own
   store under `~/.agent-creator`.
4. A search of that store with a line from the file finds a chunk of that
   file. That is the proof, and the test checks it.

Only then does the server send, on the agent's event stream:

```json
{"type": "embedded", "file": "<relative path, as in the Knowledge list>"}
```

If a file can't be embedded (wrong type, empty, unreadable), the server sends
`{"type": "embed-failed", "file": "<path>", "reason": "<plain words>"}` and the
file stays dim with that reason (rule: nothing blocks without a visible
reason).

**Shape: copy what already works.** The P4 feature says to model this on
`dev/masters-wheel`, and that app already does it (`src-tauri/src/knowledge/`):
extract → chunk → embed on device (`fastembed`, all-MiniLM-L6-v2, 384
numbers) → one SQLite + `sqlite-vec` file per agent → put the best chunks
into each turn's system prompt, with the reference text first and the
persona last. Agent Creator's server is Node, not Rust, so the libraries
differ. Choosing the Node library is the first step of the backend work, done
as a spike in the update folder (CLAUDE.md: the RAG stack is an open decision
until it is spiked and written into a wiki).

**Scope for now:** `.txt`, `.md` and `.pdf` only. Audio, video and epub come
later with P3. Retrieval used in talk (G4/F14) and the `used` line
(`{used:[{kind:"file", name}]}`) are in scope, because Talk is what makes
"embedded" worth anything to the user.

**Owner:** Uncle Bob (backend). **Does the event exist yet?** No. Until it
ships, **E4 stays as it is** (bright means "processed"). Jony leaves E4 alone
and writes one line saying why.

## A12. txt memory per agent

**What the user means** (Feature "All sources become .txt in app memory"):
every file used for an agent's instructions or its knowledge is saved as
plain `.txt` inside the app, **so the agent never depends on the original
file staying where it was.** This is about keeping a copy of the *source
text*, not about chat memory. (Chat memory is P9.)

**Plan.** This is step 1 of A11, and both are built as one piece:

- When a file is used, its text is saved under the agent's own folder,
  `~/.agent-creator/…/<agent>/sources/<relative path>.txt`.
- Removing a file deletes its `.txt` on the next rebuild (it stays red until
  then, as E11 already shows).
- The text never leaves `~/.agent-creator` and is never committed (CLAUDE.md:
  source material is sensitive).
- Test: move or delete the original file, and the agent still answers from it.

**Owner:** Uncle Bob, in the same item as A11.

## C8. The `glade-fireflies.html` rule: retired

Rule 3 of `updates/2026-11-26 AGENT-SELECTION-HOME/00-roadmap.md` ("kept byte
for byte") is marked **RETIRED** there, following Eraser's ruling. Rule 2
(the Fireflies look is the base) still holds.

## D8. Start from one line, with no folder (UJ3)

**Ruling: out of the MVP for now. Owner: Jony, when its slot comes (slot 5).**

Why:
- The app's whole job is turning *material about a person* into an agent
  (CLAUDE.md). Without material there is nothing to embed and no likeness to
  gather, so the main magic (a mess that adds up into a DNA) has nothing to
  show.
- The user designed /new themselves as folder-first: click the middle to
  pick a folder, drop anywhere (FIREFLIES-BUILD). They had already named
  UJ3 as "out now" there and didn't push back.
- Likeness 4/10 (role-builders exist, but they're not the first user),
  frequency 3/10. With low scores and a deliberate cut, it stays out.

*Assumption:* the user still wants it later. When its turn comes, the one
way in should be the Sketcher chat (a line typed to Sketcher, before any
drop), not a second input on the screen.

## F15. "Access to the files from the left side": what it means

**The user's words** (Feature "The Left Side"): the Sketcher chat *"has
access to all the files and can edit anything"*, and *"agent creator gets
all the context of uploaded files and allocates them where they need to go."*

So "access" is **the chat's access, not a file browser for the user.** The
user expects to *talk about* their files: "what's in the Q&A folder?", "use X
and Y for transcripts", "drop the PDFs from knowledge".

| Part of "access" | Today on main | Gap |
|---|---|---|
| Sketcher knows every file (paths, sizes, sections) | met: each turn lists paths and feeds (A8) | — |
| Sketcher moves files between sections | met in code (routeFiles); the visible moment is Merlin's F12 | F12 |
| Sketcher reads a file's content **when the user asks** | **missing**: the creator never reads content at all | yes |
| Sketcher edits anything (prompt, names, skills) | met: the draft patch, hand edits win (A6) | — |

**Plan.** Add "read this file when the user asks for it" to the creator.
Reading is never automatic (A8 stays true), it reads the A12 `.txt` copy,
and it stays within a size limit. **Owner:** Uncle Bob, slot 2. The user
opening a file from the field is **not** part of it (*assumption*: nothing
the user said asks for it, and the right-hand lists already show each file).

## G5. Know / Identity / Share: what the MVP still needs

These were the deleted screens for UJ8 (add more material), UJ9 (make it a
character) and UJ10–11 (export and import).

| Screen | MVP? | Why |
|---|---|---|
| **Know** (add material later, UJ8) | **Yes, but not as its own screen.** | C9 (reopen the agent in the build screen) does this job: drop more files there. A second screen for the same job would break "one way to do each thing". |
| **Identity** (photo, character, UJ9) | **No.** Slot 7 (P7, P11). | The user chose "AI souls, not human faces" (shipped). The soul constellation already is the identity. |
| **Share** (export and import, UJ10–11) | **No.** Slot 6 (P6). | Low frequency. It needs the agent file standard first, and that needs real RAG (A11) so the export has something real to carry. |

**Profile, DNA and Talk come back on `/agents/:id`. Yes.** The user never
said to drop them. 793c876 was a cleanup and gave no reason, and without
them the *use* half of the job is gone. Jony owns them (G1, G2, G4, F14).

## G8. Features list correction

- "Full UX prototype of the whole app (.app)" goes back to **now**. Only
  UJ1–2 and part of UJ12 can be clicked on main.
- "Sketch · Profile switch" and "Sketch · DNA switch" show their real
  progress. The screens were deleted, and Jony is rebuilding them on
  `/agents/:id`.

(These are changed in the studio's Features list, alongside this note.)

## H8 + G8. Roadmap slots for every remaining journey and P3–P12

The order follows the job: first make the agent *real*, then let the user
*use* it, then extras.

| Slot | What | Journeys | Features | Owner |
|---|---|---|---|---|
| 1 | Real knowledge: txt memory, then embedding, then the `embedded` event | UJ1 (honest "bright") | A12 txt memory, P4 RAG, RAG builder, E4 | Uncle Bob, then Jony for E4 |
| 2 | Sketcher reads a file on request (F15), and the ready flag (F10) | UJ1, UJ2 | P2 polish | Uncle Bob |
| 3 | Use the agent: Profile, DNA, Talk on `/agents/:id`, reopen to edit | UJ4–7, UJ8 (via C9) | Sketch Profile, Sketch DNA, P8 chat with any agent | Jony (in progress) |
| 4 | Richer intake: audio, video, epub, plain-word rules ("only PDFs go to knowledge") | UJ8 | P3 | Uncle Bob, then Merlin for the moment |
| 5 | Start from one line (D8) | UJ3 | P2 + P5 persona generation | Jony |
| 6 | Agent file: export and import | UJ10, UJ11 | P6 | Uncle Bob |
| 7 | Character: icon, photo, soul visual | UJ9 | P7, P11 | Merlin, then Jony |
| 8 | Remember talks | UJ5–7, UJ12 | P9 chat history | Uncle Bob |
| 9 | How good is it: per-file score, learning insight, capability map | UJ4 gap, UJ8 | P10, per-file quality score, P12 (feeds G1's three words) | Columbo research first, then Jony |
| 10 | Library at scale (6+ agents) | UJ12 | home (built), P9 | Jony |

Every slot starts with research (Columbo), then magic, design and review,
as the team's order of work says.

## Open questions (assumptions until the user says otherwise)

1. Profile, DNA and Talk come back (assumed **yes**).
2. One-line start waits until slot 5 (assumed the user is fine with that).
3. "Access to files" means the chat's access, not a file browser (assumed).
