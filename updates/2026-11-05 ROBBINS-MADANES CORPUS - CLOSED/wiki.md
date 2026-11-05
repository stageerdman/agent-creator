# Wiki — Robbins-Madanes corpus rebuild

Durable decisions and lessons from this update, for whoever (human or AI)
touches this project next.

## quality_check.py's Expression DNA gap is confirmed, still not patched
Second English-language run into the same documented gap from
`updates/2026-11-04 INIT - OPEN/wiki.md`: `check_expression_dna()`'s
style-marker regex is Chinese-only (句式/词汇/语气/幽默/节奏/确定性/引用/
口头禅), no English fallback. This instance's Expression DNA section has 7
populated English-labeled sub-dimensions (Sentence structure, Vocabulary,
Rhythm, Humor, Certainty, Address, Citation habit) and scores 0 on the
automated check regardless. Manually verified the actual content meets the
check's real intent. Per precedent, not patched inline — `scripts/` is a
deliberate-change-only surface, and this is the second confirmed case
rather than a one-off, which makes "extend the regex with English
synonyms" a more concrete candidate for a deliberate patch next time
someone touches this script — still not urgent enough on its own to justify
this update.

Also re-confirmed the companion fix from the same prior entry:
`check_limitations()` needs the literal word "Limitation," not "Limit" —
this instance initially used "**Limits**:" across all 7 mental models and
failed for the identical reason as last time, fixed the same way (wording,
not script).

## Honest Boundary section deliberately dropped from this instance, not a bug
User's explicit call (2026-11-05): this instance's `instructions.md` has no
Honest Boundary section — it's for personal use, not distribution, and the
hedging/disclaimer framing was judged unnecessary friction. `quality_check.py`
correctly reports this as a FAIL (`check_honest_boundary`); that's accurate,
not a script issue, and not something to fix. Recorded here so a future
session doesn't "fix" it back in without checking — if this instance is
ever shared or published beyond personal use, that's the trigger to revisit
whether a boundary section should be added back.

## Decoupling personality source from the full corpus was the real fix, not just a cost optimization
The original (v1) plan read the *entire* corpus for both knowledge.md and
the personality pipeline. The user's correction — only use transcripts
where Tony Robbins is *personally* speaking, not the full training corpus —
turned out to be a fidelity fix disguised as a cost complaint. The
filename pattern (non-Teleclass transcripts) made this fully mechanical to
detect and verify (confirmed via speaker tags in sample content, not just
filenames). Worth remembering for any future multi-speaker corpus: "this
person's material" and "material about this person's method" are
different sources, and mixing them dilutes voice fidelity even when both
are technically "primary."

## Running Phase 1 research as parallel full-corpus-subset agents instead of 6 dimension-per-agent
Both because the corpus is local (not 6 independently-searched web
sources) and because of the project's own cost-chunking goal, Phase 1 ran
as 2 parallel agents (one per balanced transcript group), each tagging all
7 dimensions (6 standard + Coaching Style) in a single read pass per file,
rather than 6 agents each re-reading the same corpus for one dimension
apiece. Measured cost: ~928K tokens combined for both groups (31
transcripts, ~396K words) — came in about 24% over the ~750K estimate, still
trivially affordable. The book supplement (batch P3, 1 file, ~202K words)
cost 309K tokens — a much higher tokens-per-word ratio than the transcript
batches, consistent with Phase 2's reasoning work (cross-checking
against existing research, not just extraction) costing more per word
than first-pass tagging.
