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
- Keep happens once. After that every change is live, and its change line
  says so. (FULL-UX cut review, X4)
- Undo over "are you sure?". Reversible acts get an `Undo` line, not a
  confirm sheet; only real loss gets one plain confirm. (X12, X25)
- No button opens the view you're already in, or only plays an animation.
  (X10)
- Every screen and moment points to a journey step (`UJ# · step` in
  `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`). No journey
  step, no screen.
- Checks look at what the eye sees, not only at internal state. "Lit"
  means visibly bright on screen (pixels), and a cap means the count the
  user can see or read. Test hooks like `litOrder()`/`getDots()` alone
  passed 120 checks while the user saw every dot light at once. (Fireflies
  DNA, 2026-11-26)
- Glass is for what floats, never for the ground. Only a window that
  floats over the scene (the Sketcher chat) is see-through; the page and
  field stay solid, even in the Mac app. Text on glass keeps AA contrast
  over the brightest thing behind it. (FLOATING-GLASS, 2026-11-28)
- Order of work: research (Columbo) → magic (Merlin) → design (Jony) →
  cut review (Eraser). The captain applies the review's required changes
  into the design, so the build team reads one file.
