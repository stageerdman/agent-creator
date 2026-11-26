# Glade Home concepts: roadmap

*Columbo, 2026-11-26. Goal: three wild, clearly different Home concepts in the
Glade (synchronous fireflies) style, as HTML the user can open. Everything
lives in this folder. Order follows the team rule: research → magic → design
→ cut review.*

| Phase | Who | Writes | Done when |
|---|---|---|---|
| 1 · Brief | Columbo | `roadmap.md`, `home-brief.md` | Both files exist and Merlin can design from `home-brief.md` alone. |
| 2 · Three concepts | Merlin | `concepts.md` | Three named concepts, each covering all four jobs in clicks, with studying-vs-ready signals, first-run state, 2–4 timed motions, Glade names, plus a "how they differ" table; Jony can build without asking. |
| 3 · HTML + click-through | Jony | `index.html`, one `<concept-name>.html` per concept, `build-notes.md` | `index.html` opens all three; every job really works on each page (find, make new, see status, open a past talk), each page shows its empty first run, and `build-notes.md` lists what was clicked in a real browser. |
| 4 · Clutter review + sign-off | Eraser | `eraser-review.md` | Every cut is checked in a browser and marked done, and the file is signed APPROVED. |

**Then:** Columbo merges the parts on the team branch, checks that
`index.html` opens, and tells the orchestrator it's ready.

**Out of scope:** Birth, Files flowing in and Talk (already in
`updates/2026-11-25 MAGIC-CONCEPTS/`), rename/delete flows, and wiring into
the real app. These are concepts to feel, not the build.
