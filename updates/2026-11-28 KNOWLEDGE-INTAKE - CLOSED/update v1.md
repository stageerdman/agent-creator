# Knowledge intake: files, folders, paths and plain-word rules

Feature `f-p3-knowledge-intake-files-folders-paths` (step of
`f-p4-real-rag-knowledge-base`).

## Where we start

Already there: dropped/picked files join the DNA list (`files.mjs addFiles`),
whole folders on disk are walked (`folderScan.mjs`, `POST /scan`, any file
type, video and audio included), and the Sketcher routes files by path or
folder (`<draft>{"files": {"notes/": "rag"}}`, `routeFiles`). Every used file
gets a `.txt` copy; Knowledge files are embedded.

Missing: rules said in plain words that are not a path ("only PDF and MD go
to knowledge", "a random sample for the persona", "this book for the persona
and the rest for RAG"), a path typed in the chat, and a file list the
Sketcher can still read when a folder brings thousands of files.

## Design (decided)

- The Sketcher (an LLM) turns plain words into **structured rules** in its
  `<draft>` block; the backend applies them with pure, tested code. The model
  never moves files itself.
  ```
  "rules": [{ "to": "rag" | "instructions" | "both" | "none",
              "files": { "types": ["pdf", "md", "video"], "in": "books/" | ["a.pdf"], "rest": true },
              "only": true, "sample": 20 | "10%" }]
  ```
  - `files` picks non-removed files: `types` are extensions or kinds
    (text, pdf, document, audio, video, image), `in` paths or folders
    ("x/"), `rest` the files no earlier rule in this list picked. All given
    conditions must hold; none = every file.
  - `sample` keeps a random subset of those (a count, or a share of them),
    in list order. Randomness is injected, so tests are exact.
  - The picked files get the route's feeds; with `only`, every other file
    loses them. Skill feeds are never touched. Bad rules are ignored (the
    model may guess), like bad routes.
  - Applied in order, after the existing path `files` routes.
- **Kinds** (`intake/kinds.mjs`): one place that names a file's kind by its
  extension. Rules use it; extraction uses it to say audio/video need a
  transcript (`text: "media"` instead of "binary"); P12's capability map
  will use it to describe what the material is.
- **Paths in chat**: `"paths": ["/Users/me/Books"]` (also `~/…`) in the block
  → each is walked like a dropped folder before routes and rules apply, so
  "take ~/Books, only PDFs to knowledge" works in one turn. A bad path is
  reported, never fails the turn.
- **Big lists**: the `<files>` block lists every file up to 150; beyond that
  it lists folders with file counts per type and per feed, so the prompt
  stays small and rules (not paths) do the routing.
- Chat answer gains `intake: { added, skipped, rules: [{ to, picked, only }] }`;
  the chat SSE sends `found { files }` per scan batch and `intake` once.

## Phases

1. **Pure rules** — `intake/kinds.mjs`, `intake/rules.mjs` (`sortFiles`:
   routes + rules, sample, only, rest) + tests.
2. **Prompt** — `intake/fileSummary.mjs` (full list or folder summary),
   Sketcher rules for `rules` and `paths` + tests.
3. **Chat wiring** — `intake/scanAsked.mjs`, `agents.chat` uses it and
   `sortFiles`, `found`/`intake` SSE events, `media` reason in extraction +
   use-case and server tests.
4. **Ship** — npm test, Start still works, features updated.

## Status

- [x] Phase 1  - [x] Phase 2  - [x] Phase 3  - [x] Phase 4 (330 tests: 328 pass, 2 skipped by design; the server starts and answers)
