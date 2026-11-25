# Magic UX: design rules (settled 2026-11-24, P2)

- One word per action, one action per word. A finish word (like *Keep*) is
  never reused for a smaller thing (like "saved").
- One way to do each thing. No second button for something the chat or
  autosave already does.
- No dead UI. Later features get spots reserved in the markup (`hidden`),
  never visible placeholders.
- Hand edits win. The AI never quietly overwrites what the user typed.
- Nothing blocks without a visible reason. An action that needs a save
  first does the save itself.
- Every screen and moment points to a journey step (`UJ# · step` in
  `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`). No journey
  step, no screen.
- Order of work: research (Columbo) → magic (Merlin) → design (Jony) →
  cut review (Eraser). The captain applies the review's required changes
  into the design, so the build team reads one file.
