# Build to-do (Jony, working note for blocks E, F, CSS, packaging)

## APIs available
- /components.js: P2, hooks, el(tag, attrs|cls, ...kids), btn(label,onclick,cls='link-btn',extra), bus{on,emit}, store{demo,agents,real,templates,online,screen,current,notes}, mockAgent, nameOf, shortName, subj, pronoun, fileById, note(agentId,{kind:'say'|'divider'|'user',text,lines}), when, dayMonth, nowIso, face(a,size,{outline,onclick,label}), mapLine, refLink, passagePanel, c8Surface, studyBlock, sheet({title,body[],actions[],onClose,wide,label}), closeSheet, sheetOpen, picker(title, items[{name,detail}], onPick), refRow, paletteStrip(palette,{filled:Set,small,titles,bloom}), stream, wait, toast(text, actionNode).
- block-b: sketcherSay(a,text,{lines:[{text,onClick}]}) (queues as a note if a isn't open in the Sketcher), renderStudy(a), stopTimers(a), piles, afterLoad, replayNotes. userChip is not exported; replicate it: el("div","msg user", el("div","who","You"), el("div","bubble refs-bubble", el("span","refs-chip", el("strong","",title), el("span","",detail)))), then P2.stick(()=>P2.els.log.append(msg),true) and P2.els.empty.hidden=true.
- block-c: showKnows(a), showSketch(), renderKnows(a), showingKnows(a), showPassage(a,r,line). C reads a.marks{lineId:{mark,quiz,redraw}}, a.moved, a.likenessWas and a.removal{file,label,focus}, and clears them on the next visit.
- nav (block-a): home(), open(id,mode,{talkId}) (async), renderTop, renderHome, current(). bus.emit('changed') re-renders the top bar and Home.

## E exports: openFace(a), topUp(a), topUpFiles(a,files), addForLine(a,line), removeFile(a,file), removeGroup(a,g), undoRemove(a), openPalette(a)
- E1 money (Rex): picker of pickerFiles.topUps for a.id → nav.open sketcher → chip `References · Money Has Rules.pdf` / `1 file · 4 MB` → say `Studying Money Has Rules.pdf. It goes into what Rex knows, under money.` → study {studying, reading, current, done 0, total 1, etaMin 1} → about 3 s → study {finished, studied 1, total 1}. Then: the map line becomes extras.rexMoneyAfter; marks {'rex-money':{mark:'was Blank',quiz:"What's the first rule of money?",redraw:true}}; moved='rex-money'; likenessWas=8; rating=9; reasons.unshift(likenessAfterMoney.reason); files.push(moneyFile); total+1. Say `I studied Money Has Rules.pdf. Money is no longer Blank.` + line `What Rex knows: Money and investing, Blank → Sharp ↗` → C.showKnows.
- Marcus: 4 docs → `Studying 4 references. They go into what Marcus knows.` → a flat file list + a map of 2 Sharp and 1 Blank (each ref's passage must contain its words; span = indexOf).
- E3 remove: file.removed; rex-promise goes from Sharp to Rough (drop the removed refs); mark `was Sharp · now Rough · after removing "Old seminar 2009.mp4"`; a.removal; note `References: removed "…"`. Undo restores it and notes `References: put back "…"`. A group removes all of its files.
- E4 face sheet: `Rex's face`, 3 × 96 radios (current first), `Draw three more` (`Drawing…` 800 ms → moreIcons), `Use a photo…` (pickerFiles.photos / photoOffer), `or drop a photo here`, Cancel / Use (disabled until changed). Change line `Face: new photo`.
- E5 palette in #knows: `Palette · what Rex is mixed from · 186 references, 4 traits` ✕, band (titles, bloom), trait radios 1–5 + sketchLine sentence; on change: user bubble `Directness: 4 → 5` + `Sketch: persona updated ↗`.

## F: openExport(a), importFile(name). See build-notes lines 107-115.

## CSS: nothing exists yet for the new classes (see the class names in components.js and blocks a-d). body[data-screen=home|sketcher|talk] shows #home | #panes | #talk.

## Packaging: build-plan-jony.md (port 3517, node path recorded at build time, Chrome --app, else open the URL, data in ~/.agent-creator).

## Summary must mention
- The mock routes are registered in app.mjs (router.mjs has no table).
- Ines counts are 298/297.
- Juno.agent.zip shows the clash sheet while the seeded Juno exists.
- '+ New agent' makes a real P2 agent, and the Ines folder turns it into the demo Ines.
- Real agents in Talk get only a marked '(Demo)' line.
- Fix-panel replies are scripted; for agents other than Rex, the user's sentence is appended to the persona.
