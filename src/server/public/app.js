// The agent-creation chat screen (design-jony.md, R1–R11 applied).
// Chat left, Sketch right. The server is the one source of truth for the
// draft; this file renders it, streams the Sketcher's replies, saves hand
// edits, and drives the magic.css classes. Testable logic is in sketch.js.

import {
  FIELDS, mergePersona, readEvents, isEmptyDraft, applyDraftEvent, changeLine, firstSentence,
  errorLine, splitPaste, wordCount, replyBlocks, inlineRuns, switcherRows,
} from "/sketch.js";
import { installTabFocus } from "/tab-focus.js";

installTabFocus();

const $ = (id) => document.getElementById(id);
const els = {
  switcherBtn: $("switcher-btn"), switcherName: $("switcher-name"), menu: $("switcher-menu"),
  viewChat: $("view-chat"), viewSketch: $("view-sketch"), panes: $("panes"),
  chatScroll: $("chat-scroll"), note: $("note"), empty: $("empty"), log: $("log"),
  banner: $("banner"), bannerBtn: $("banner-btn"), howtoBtn: $("howto-btn"), howto: $("howto"),
  composer: $("composer"), message: $("message"), send: $("send"),
  sketch: $("sketch"), sketchTitle: $("sketch-title"), keep: $("keep"), sketchScroll: $("sketch-scroll"),
  keepCard: $("keep-card"),
};

const fields = Object.fromEntries(FIELDS.map((name) => {
  const wrap = document.querySelector(`.draft-field[data-field="${name}"]`);
  return [name, {
    wrap, input: wrap.querySelector(".field"), tag: wrap.querySelector(".tag"), retry: wrap.querySelector(".retry"),
    timer: 0, inflight: null, pending: false, failed: false, savedFlash: false, flashTimer: 0,
  }];
}));

const state = {
  agent: null, // { id, draft, sessionId }
  phase: "idle", // idle | sketching
  installed: true,
  fresh: new Set(), // "new" tags, cleared on the next send
  yours: new Set(), // "✎ yours", memory only
  firstVoiceShown: false,
  hint: null, // the once-only placeholder after the first sketch
  turn: null, // the running chat turn
  failedTurn: null, // { message, userEl } for the offline banner's Try again
  sending: false, // a send is saving hand edits first
  keepBusy: false,
  keepFailed: false,
  keepFailTimer: 0,
  pasteAt: -1,
  replay: new Set(), // narrow: bars to play when the Sketch view opens
};

els.message.focus();

// ── Server ────────────────────────────────────────────────────────────────

// FULL-UX: demo agents (blocks A–F) answer here from memory; real agents
// still go to the server and the real CLI.
const hooks = (window.ACHooks ??= {});

async function api(path, { method = "GET", body } = {}) {
  const local = hooks.mockApi?.(path, { method, body });
  if (local !== undefined) return local;
  const response = await fetch(path, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${method} ${path} → ${response.status}`);
  return response.json();
}

const agentUrl = (suffix = "") => `/api/agents/${state.agent.id}${suffix}`;

// ── The Sketch fields ─────────────────────────────────────────────────────

function grow(element) {
  if (element.tagName !== "TEXTAREA") return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight + 2}px`;
}

function setFieldValue(name, value) {
  const { input } = fields[name];
  if (input.value !== value) input.value = value;
  grow(input);
}

function renderTag(name) {
  const f = fields[name];
  const busy = state.phase === "sketching";
  let text = "";
  let kind = "";
  if (busy) { /* R7: the tag spots stay empty while the Sketcher replies */ }
  else if (f.failed) [text, kind] = ["Not saved ·", "failed"];
  else if (f.savedFlash) [text, kind] = ["✓ saved", "saved"];
  else if (state.fresh.has(name)) [text, kind] = ["new", "new"];
  else if (state.yours.has(name)) [text, kind] = ["✎ yours", "yours"];
  f.tag.textContent = text && ` ${text}`;
  f.tag.className = `tag ${kind}`;
  f.retry.hidden = !(f.failed && !busy);
  f.wrap.classList.toggle("edited", state.yours.has(name) && !state.fresh.has(name));
}

const renderTags = () => FIELDS.forEach(renderTag);

// Takes a draft from the server without touching a field the user is still typing in.
function takeDraft(raw) {
  const draft = mergePersona(raw); // SKETCH-REWORK: Persona lives inside Instructions
  state.agent.draft = draft;
  for (const name of FIELDS) {
    if (!fields[name].pending && !fields[name].failed) setFieldValue(name, draft[name]);
  }
  renderKeep();
  renderName();
  renderPlaceholder();
  hooks.onDraft?.(draft);
}

// Plays the fresh-line bar (and glow) once: magic.css .draft-field.updated.
function markUpdated(name) {
  const { wrap } = fields[name];
  wrap.classList.remove("updated");
  void wrap.offsetWidth;
  wrap.classList.add("updated");
  clearTimeout(wrap.updatedTimer);
  wrap.updatedTimer = setTimeout(() => wrap.classList.remove("updated"), 600);
}

function flashSaved(name) {
  const f = fields[name];
  f.savedFlash = true;
  renderTag(name);
  clearTimeout(f.flashTimer);
  f.flashTimer = setTimeout(() => {
    f.savedFlash = false;
    renderTag(name);
  }, 1500);
}

// H1: one PUT per field, after 1 s of no typing or on blur. Never one per keystroke.
function onFieldInput(name) {
  const f = fields[name];
  grow(f.input);
  f.pending = f.input.value !== state.agent.draft[name];
  clearTimeout(f.timer);
  if (f.pending) f.timer = setTimeout(() => saveField(name), 1000);
  if (name === "name") renderName();
  renderKeep();
}

// Saves one field if it has unsaved text. Resolves true when nothing is left unsaved.
async function saveField(name) {
  const f = fields[name];
  clearTimeout(f.timer);
  while (f.inflight) await f.inflight;
  if (!f.pending && !f.failed) return true;
  const id = state.agent.id;
  const value = f.input.value;
  f.pending = false;
  let ok = true;
  f.inflight = (async () => {
    try {
      // The first Instructions save also empties the old Persona on the server,
      // so the merged text is stored once.
      const clear = name === "instructions" && state.agent.hadPersona ? { persona: "" } : {};
      const draft = await api(`/api/agents/${id}/draft`, { method: "PUT", body: { [name]: value, ...clear } });
      if (state.agent.id !== id) return;
      if (clear.persona === "") state.agent.hadPersona = false;
      f.failed = false;
      state.yours.add(name);
      state.fresh.delete(name);
      takeDraft(draft);
      flashSaved(name);
    } catch {
      ok = false;
      if (state.agent.id !== id) return;
      f.failed = true; // H6: the text stays in the field
      renderTag(name);
      renderKeep();
    } finally {
      f.inflight = null;
    }
  })();
  await f.inflight;
  return ok && !f.failed;
}

// Before a send, a Keep, or a switch: save every unsaved hand edit (H3, R5).
async function flushAll() {
  const results = await Promise.all(FIELDS.map((name) => {
    const f = fields[name];
    return f.pending || f.failed || f.inflight ? saveField(name) : true;
  }));
  return results.every(Boolean);
}

for (const name of FIELDS) {
  const f = fields[name];
  f.input.addEventListener("input", () => onFieldInput(name));
  f.input.addEventListener("blur", () => { if (f.pending) saveField(name); });
  f.retry.addEventListener("click", () => saveField(name));
}

// A reload within the 1 s idle window still saves the edit.
addEventListener("pagehide", () => {
  for (const name of FIELDS) {
    if (!fields[name].pending || !state.agent) continue;
    fetch(agentUrl("/draft"), {
      method: "PUT", keepalive: true, headers: { "content-type": "application/json" },
      body: JSON.stringify({ [name]: fields[name].input.value }),
    });
  }
});

// ── Keep ──────────────────────────────────────────────────────────────────

function renderKeep() {
  const btn = els.keep;
  if (state.keepBusy || !state.agent) return;
  const saved = state.agent.draft.status === "saved";
  const named = Boolean(fields.name.input.value.trim());
  const busy = state.phase === "sketching";
  btn.classList.toggle("saved", saved && !state.keepFailed);
  btn.classList.toggle("failed", state.keepFailed);
  if (state.keepFailed) {
    btn.textContent = "Couldn't keep · Try again";
    btn.disabled = busy;
    btn.title = "";
  } else {
    btn.textContent = saved ? "Kept ✓" : "Keep";
    btn.disabled = saved || !named || busy;
    btn.title = !saved && !named ? "Give it a name first" : "";
  }
  btn.hidden = saved && !state.keepFailed; // X4: Keep happens once, then every change is live
  els.keepCard.hidden = !saved;
  if (saved) {
    const { name, instructions } = state.agent.draft;
    els.keepCard.querySelector(".keep-name").textContent = name;
    els.keepCard.querySelector(".keep-line").textContent = firstSentence(instructions);
  } else {
    els.sketch.classList.remove("agent-born");
  }
}

async function keep() {
  if (state.keepBusy || state.phase === "sketching") return;
  const btn = els.keep;
  state.keepBusy = true; // a second click is ignored (W3)
  clearTimeout(state.keepFailTimer);
  state.keepFailed = false;
  btn.classList.remove("failed");
  btn.classList.add("saving");
  btn.disabled = true;
  btn.textContent = "Keep";
  const id = state.agent.id;
  let draft = null;
  try {
    if (await flushAll()) draft = await api(`/api/agents/${id}/save`, { method: "POST" });
  } catch { /* shown below */ }
  state.keepBusy = false;
  btn.classList.remove("saving");
  if (state.agent.id !== id) return renderKeep();
  if (!draft) {
    state.keepFailed = true;
    renderKeep();
    state.keepFailTimer = setTimeout(() => {
      state.keepFailed = false;
      renderKeep();
    }, 4000);
    return;
  }
  takeDraft(draft);
  await hooks.afterKeep?.(state.agent);
  // MAGIC-PASS beat 4, for every agent: Profile first, so the ring plays where they look.
  $("rs-profile")?.click();
  els.sketch.classList.remove("agent-born");
  void els.sketch.offsetWidth;
  els.sketch.classList.add("agent-born");
  setTimeout(() => els.sketch.classList.remove("agent-born"), 1000);
  // Same frame: pencil → ink.
  for (const face of document.querySelectorAll("#top-face .face, #face-slot .face")) {
    face.classList.remove("outline");
    face.classList.add("fill-in");
  }
  // +300 ms: the Talk tab beckons, and stays still until Talk is opened.
  state.beckon = id;
  setTimeout(() => hooks.renderTop?.(), reducedMotion() ? 0 : 300);
}

els.keep.addEventListener("click", keep);

// ── Top bar name, composer, placeholder ───────────────────────────────────

function renderName() {
  els.switcherName.textContent = fields.name.input.value.trim() || "New agent";
}

function renderPlaceholder() {
  if (!state.agent) return;
  els.message.placeholder = isEmptyDraft(state.agent.draft) && !els.log.childElementCount
    ? (state.filesWaiting ? "Who is this? e.g. my old coach, from his seminar notes" : "Type here…")
    : state.hint ?? "Reply to the Sketcher…";
}

// MAGIC-PASS D2: files dropped before any words. The empty state asks for the
// one line the files can't give; the chips hide (they'd ignore the files).
const emptyQ = els.empty.querySelector(".empty-q");
const emptyQText = emptyQ.textContent;
function waitForWords(count) {
  if (!isEmptyDraft(state.agent.draft) || !count) return;
  state.filesWaiting = count;
  emptyQ.textContent = `${count} ${count === 1 ? "file is" : "files are"} in the DNA. Now say who this is, in one line.`;
  els.empty.querySelector(".chips").hidden = true;
  els.empty.hidden = false;
  els.note.hidden = true;
  renderPlaceholder();
}
function clearWaitForWords() {
  state.filesWaiting = 0;
  emptyQ.textContent = emptyQText;
  els.empty.querySelector(".chips").hidden = false;
}

function renderSend() {
  const busy = state.phase === "sketching";
  els.send.classList.toggle("stop", busy);
  els.send.setAttribute("aria-label", busy ? "Stop" : "Send");
  els.send.disabled = busy ? false : !els.message.value.trim() || !state.installed;
}

function growComposer() {
  els.message.style.height = "auto";
  els.message.style.height = `${els.message.scrollHeight}px`;
}

els.message.addEventListener("input", () => {
  if (!els.message.value) state.pasteAt = -1;
  growComposer();
  renderSend();
});

els.message.addEventListener("paste", () => {
  if (state.pasteAt < 0) state.pasteAt = els.message.selectionStart;
});

els.message.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (state.phase === "idle") sendFromComposer();
  } else if (event.key === "Escape" && state.phase === "sketching") {
    event.preventDefault();
    stop();
  }
});

els.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.phase === "sketching") stop();
  else sendFromComposer();
});

for (const chip of els.empty.querySelectorAll(".chip")) {
  chip.addEventListener("click", () => {
    els.message.value = chip.textContent; // fills the box, never sends
    state.pasteAt = -1;
    els.message.focus();
    els.message.setSelectionRange(els.message.value.length, els.message.value.length);
    growComposer();
    renderSend();
  });
}

// ── Chat messages ─────────────────────────────────────────────────────────

const atBottom = () => els.chatScroll.scrollHeight - els.chatScroll.scrollTop - els.chatScroll.clientHeight < 48;

// Follows the stream only if the user was already at the bottom.
function stick(change, force = false) {
  const follow = force || atBottom();
  change();
  if (follow) els.chatScroll.scrollTop = els.chatScroll.scrollHeight;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function addUserBubble(message, pasteAt) {
  const msg = el("div", "msg user");
  msg.append(el("div", "who", "You"));
  const bubble = el("div", "bubble");
  const { lead, note } = splitPaste(message, pasteAt);
  if (lead) bubble.append(document.createTextNode(lead));
  if (note) {
    const chip = el("button", "paste-chip");
    chip.type = "button";
    chip.setAttribute("aria-expanded", "false");
    const words = wordCount(note).toLocaleString("en-US");
    const full = el("div", "paste-text", note);
    full.hidden = true;
    const label = (open) => `Pasted note · ${words} words ${open ? "▾" : "▸"}`;
    chip.textContent = label(false);
    chip.addEventListener("click", () => {
      full.hidden = !full.hidden;
      chip.textContent = label(!full.hidden);
      chip.setAttribute("aria-expanded", String(!full.hidden));
    });
    bubble.append(chip, full);
  }
  msg.append(bubble);
  stick(() => els.log.append(msg), true);
  return msg;
}

function addSketcherMessage() {
  const msg = el("div", "msg sketcher");
  const waiting = el("span", "waiting", "Sketching… ");
  const say = el("div", "say streaming"); // stays truly empty until text arrives (magic.css dots)
  msg.append(el("div", "who", "Sketcher"), waiting, say);
  stick(() => els.log.append(msg), true);
  return { msg, waiting, say };
}

function runs(parent, text) {
  for (const run of inlineRuns(text)) parent.append(run.bold ? el("strong", "", run.text) : document.createTextNode(run.text));
  return parent;
}

// The final reply: paragraphs, quotes and voice cards (S7). Only after `done`.
function renderReply(say, text) {
  say.classList.remove("streaming");
  say.replaceChildren();
  for (const block of replyBlocks(text)) {
    if (block.type === "text") say.append(runs(el("p"), block.text));
    else if (block.type === "quote") say.append(runs(el("div", "quote"), block.text));
    else say.append(voiceCard(block));
  }
}

function voiceCard({ name, text }) {
  const card = el("figure", "voice-card");
  if (!state.firstVoiceShown) {
    card.classList.add("first-voice");
    state.firstVoiceShown = true;
  }
  const head = el("figcaption", "voice-head");
  const avatar = el("span", "voice-avatar", name.charAt(0).toUpperCase());
  avatar.setAttribute("aria-hidden", "true");
  head.append(avatar, el("span", "", name));
  card.append(head, runs(el("blockquote", "voice-text"), text), ...(hooks.voiceCaption?.(state.agent) ?? [el("p", "voice-caption", "sample, from the current sketch")]));
  return card;
}

// FULL-UX: a change line with its own words and click (B2, B4, E2, E5).
function addCustomLine(msg, { text, onClick }) {
  const line = el("button", "change-line", text);
  line.type = "button";
  line.addEventListener("click", () => onClick?.());
  msg.append(line);
  return line;
}

function addChangeLine(msg, changed, isFirst = false) {
  // MAGIC-PASS beat 2: the first draft is named for where the portrait forms.
  const line = el("button", "change-line", `${isFirst ? "First sketch · Instructions" : changeLine(changed)} ↗`);
  line.type = "button";
  line.addEventListener("click", () => {
    if (isNarrow()) setView("sketch");
    const first = isFirst ? "instructions" : FIELDS.find((name) => changed.includes(name));
    // Name lives in Profile, Instructions in DNA: open the switch that holds it.
    if (fields[first].wrap.closest("[hidden]")) $(fields[first].wrap.closest("#dna") ? "rs-dna" : "rs-profile")?.click();
    fields[first].wrap.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    for (const name of changed) markUpdated(name);
  });
  msg.append(line);
}

function addTurnError(userEl, outcome, message) {
  userEl.querySelector(".turn-error")?.remove();
  const line = errorLine(outcome.kind);
  const box = el("div", `turn-error${line.neutral ? " neutral" : ""}`);
  box.append(document.createTextNode(line.text));
  if (line.retry && state.installed) {
    const retry = el("button", "link-btn", "Try again");
    retry.type = "button";
    retry.addEventListener("click", () => retryTurn(message, userEl));
    box.append(" · ", retry);
  }
  if (line.details && (outcome.message || outcome.traceId)) {
    const toggle = el("button", "link-btn", "Details");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    const pre = el("pre", "", [outcome.message, outcome.traceId && `trace ${outcome.traceId}`].filter(Boolean).join("\n"));
    pre.hidden = true;
    toggle.addEventListener("click", () => {
      pre.hidden = !pre.hidden;
      toggle.setAttribute("aria-expanded", String(!pre.hidden));
    });
    box.append(" · ", toggle, pre);
  }
  stick(() => userEl.append(box));
}

// ── A chat turn ───────────────────────────────────────────────────────────

function setPhase(phase) {
  state.phase = phase;
  const busy = phase === "sketching";
  for (const name of FIELDS) fields[name].input.readOnly = busy; // H3: readonly, not disabled
  els.sketch.setAttribute("aria-busy", String(busy));
  els.log.setAttribute("aria-busy", String(busy)); // one announcement on done, not per delta
  els.sketchTitle.textContent = busy ? "Sketching…" : "Sketch";
  renderTags();
  renderSend();
  renderKeep();
  renderPlaceholder();
}

async function sendFromComposer() {
  const raw = els.message.value;
  if (!raw.trim() || state.phase !== "idle" || !state.installed || state.sending) return;
  state.sending = true;
  const saved = await flushAll(); // R5: a pending hand edit goes first; if it fails, nothing is sent
  state.sending = false;
  if (!saved || state.phase !== "idle") return;
  if (await hooks.beforeSend?.(raw.trim())) return;
  const message = raw.trim();
  const pasteAt = state.pasteAt - (raw.length - raw.trimStart().length);
  state.pasteAt = -1;
  els.message.value = "";
  growComposer();
  runTurn(message, addUserBubble(message, pasteAt));
}

async function retryTurn(message, userEl) {
  if (state.phase !== "idle" || state.sending || !state.installed) return;
  state.sending = true;
  const saved = await flushAll();
  state.sending = false;
  if (saved && state.phase === "idle") runTurn(message, userEl);
}

function stop() {
  state.turn?.controller.abort();
}

// Beat 1: the question steps aside (180 ms) as their line lands.
function leaveEmpty() {
  if (els.empty.hidden || reducedMotion()) { els.empty.hidden = true; return; }
  els.empty.classList.add("is-leaving");
  setTimeout(() => {
    els.empty.hidden = true;
    els.empty.classList.remove("is-leaving");
  }, 180);
}

async function runTurn(message, userEl) {
  userEl.querySelector(".turn-error")?.remove();
  state.failedTurn = null;
  renderBanner();
  leaveEmpty(); // the chips are gone for good
  state.fresh.clear();
  state.hint = null;
  for (const name of FIELDS) fields[name].wrap.classList.remove("updated");
  const reply = addSketcherMessage();
  const controller = new AbortController();
  const turn = { controller, changed: [], lines: [] };
  state.turn = turn;
  setPhase("sketching");

  let outcome = null;
  const scripted = hooks.mockTurn?.(state.agent, message, controller.signal);
  try {
    if (scripted) {
      for await (const { event, data } of scripted) {
        if (controller.signal.aborted) throw new Error("aborted");
        if (event === "delta") onDelta(reply, data.text);
        else if (event === "draft") onDraft(turn, data);
        else if (event === "line") turn.lines.push(data);
        else if (event === "done") outcome = { kind: "done", ...data };
        else if (event === "error") outcome = data;
      }
      outcome ??= { kind: "network" };
    } else {
    const response = await fetch(agentUrl("/chat"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      outcome = { kind: "failed", message: body.error ?? `HTTP ${response.status}`, traceId: body.traceId };
    } else {
      for await (const { event, data } of readEvents(response.body)) {
        if (event === "delta") onDelta(reply, data.text);
        else if (event === "draft") onDraft(turn, data);
        else if (event === "files") hooks.onFiles?.(data);
        else if (event === "done") outcome = { kind: "done", ...data };
        else if (event === "error") outcome = data;
      }
      outcome ??= { kind: "network" }; // the stream ended without done
    }
    }
  } catch {
    outcome = { kind: controller.signal.aborted ? "cancelled" : "network" };
  }
  state.turn = null;

  if (outcome.kind === "done") {
    state.agent.sessionId = outcome.sessionId;
    stick(() => {
      reply.waiting.remove();
      renderReply(reply.say, outcome.say);
      if (turn.changed.length && !outcome.noChangeLine) addChangeLine(reply.msg, turn.changed, turn.firstSketch);
      for (const line of turn.lines) addCustomLine(reply.msg, line);
    });
    setPhase("idle");
    outcome.after?.(reply);
    return;
  } else {
    reply.msg.remove(); // partial text goes; the draft is untouched
    if (outcome.kind === "not-installed") {
      state.installed = false;
      state.failedTurn = { message, userEl };
      renderBanner();
    }
    addTurnError(userEl, outcome, message);
  }
  setPhase("idle");
}

function onDelta(reply, text) {
  if (!text) return;
  stick(() => {
    reply.waiting.remove();
    reply.say.textContent += text;
  });
}

// S3/S4: only the fields in `changed` react. The pane keeps its scroll.
function onDraft(turn, data) {
  const result = applyDraftEvent({ draft: state.agent.draft, yours: state.yours }, data);
  const scrollTop = els.sketchScroll.scrollTop;
  state.fresh = result.fresh;
  state.yours = result.yours;
  turn.changed = result.changed;
  turn.firstSketch ||= result.firstSketch;
  takeDraft(result.draft);
  els.sketchScroll.scrollTop = scrollTop;
  const still = reducedMotion();
  for (const name of result.changed) {
    if (result.firstSketch) {
      const { wrap } = fields[name];
      wrap.classList.add("filling");
      setTimeout(() => wrap.classList.remove("filling"), 400);
    } else if (inHiddenSwitch(name)) {
      dotSwitch(name); // C1: point to the other switch; the glow plays when it opens
    } else {
      markUpdated(name); // MAGIC-PASS §6: no nudge glow on the first draft
    }
  }
  if (result.firstSketch) firstSketch(result.draft, still);
  if (result.firstSketch) state.hint = `Ask how ${result.draft.name.trim() || "they"} would answer something real…`;
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── MAGIC-PASS: the first sketch (beats 2 and 3), once per agent ──────────

// Beat 2: one warm wash on Instructions. Beat 3: the name settles in after the fill.
function firstSketch(draft, still) {
  const { wrap } = fields.instructions;
  wrap.classList.remove("first-sketch");
  void wrap.offsetWidth;
  wrap.classList.add("first-sketch");
  setTimeout(() => wrap.classList.remove("first-sketch"), still ? 2000 : 500);
  if (!draft.name.trim()) return;
  const id = state.agent.id;
  els.switcherName.textContent = "New agent";
  const arrive = () => {
    if (state.agent.id !== id) return;
    renderName();
    if (still) return;
    els.switcherName.classList.add("name-arrive");
    setTimeout(() => els.switcherName.classList.remove("name-arrive"), 300);
  };
  if (still) arrive();
  else setTimeout(arrive, 550); // the fill takes 400 ms; the name lands ~150 ms later
}

// ── C1: a still dot on the switch that holds a change you can't see ───────

const paneOf = (name) => (fields[name].wrap.closest("#dna") ? "dna" : "profile");
const switchesFor = (pane) => (pane === "dna" ? ["rs-dna", "view-knows"] : ["rs-profile", "view-sketch"]).map($);
const DOT_WORDS = { dna: "DNA changed", profile: "Profile changed" };

function inHiddenSwitch(name) {
  if (isNarrow() && els.panes.dataset.view === "chat") return true;
  return Boolean(fields[name].wrap.closest("[hidden]"));
}

function dotSwitch(name) {
  const pane = paneOf(name);
  state.replay.add(name);
  for (const button of switchesFor(pane)) {
    if (!button || button.querySelector(".switch-dot")) continue;
    const dot = el("span", "switch-dot");
    dot.append(el("span", "sr-only", DOT_WORDS[pane]));
    button.append(dot);
  }
}

// Opening a switch clears its dot and plays the glow there (seen, not missed).
function openedSwitch(pane) {
  if (isNarrow() && els.panes.dataset.view === "chat") return;
  for (const button of switchesFor(pane)) button?.querySelector(".switch-dot")?.remove();
  const names = [...state.replay].filter((name) => paneOf(name) === pane);
  for (const name of names) state.replay.delete(name);
  requestAnimationFrame(() => names.forEach(markUpdated));
}

function clearDots() {
  state.replay.clear();
  for (const dot of document.querySelectorAll(".switch-dot")) dot.remove();
}

for (const [id, pane] of [["rs-profile", "profile"], ["view-sketch", "profile"], ["rs-dna", "dna"], ["view-knows", "dna"]]) {
  $(id)?.addEventListener("click", () => setTimeout(() => openedSwitch(pane)));
}

// ── Offline banner (S10) ──────────────────────────────────────────────────

function renderBanner() {
  els.banner.hidden = state.installed;
  els.bannerBtn.textContent = state.failedTurn ? "Try again" : "Check again"; // R4: one button, two labels
  renderSend();
}

els.bannerBtn.addEventListener("click", async () => {
  els.bannerBtn.disabled = true;
  const health = await api("/api/health").catch(() => ({ installed: false }));
  els.bannerBtn.disabled = false;
  state.installed = Boolean(health.installed);
  if (!state.installed) return;
  const failed = state.failedTurn;
  state.failedTurn = null;
  renderBanner();
  if (failed) retryTurn(failed.message, failed.userEl);
});

els.howtoBtn.addEventListener("click", () => {
  els.howto.hidden = !els.howto.hidden;
  els.howtoBtn.setAttribute("aria-expanded", String(!els.howto.hidden));
  els.howtoBtn.textContent = els.howto.hidden ? "How to fix ▸" : "How to fix ▾";
});

// ── Agent switcher (top bar) ──────────────────────────────────────────────

const menuItems = () => [...els.menu.querySelectorAll('[role="menuitem"]')];

function menuItem(onChoose, ...children) {
  const item = el("button");
  item.type = "button";
  item.setAttribute("role", "menuitem");
  item.append(...children);
  if (state.phase === "sketching") { // R9
    item.setAttribute("aria-disabled", "true");
    item.title = "Wait for the Sketcher to finish";
  }
  item.addEventListener("click", () => {
    if (item.getAttribute("aria-disabled") === "true") return;
    closeMenu();
    onChoose();
  });
  return item;
}

async function openMenu() {
  const custom = hooks.menu?.();
  if (custom) {
    els.menu.replaceChildren(...custom.map((it) => (it === "-" ? el("hr") : menuItem(it.run, el("span", "row-name", it.label)))));
    els.menu.hidden = false;
    els.switcherBtn.setAttribute("aria-expanded", "true");
    return menuItems()[0]?.focus();
  }
  const list = await api("/api/agents").catch(() => []);
  const items = [menuItem(newAgent, el("span", "row-name", "+ New agent")), el("hr")];
  for (const row of switcherRows(list)) {
    items.push(menuItem(() => chooseAgent(row.id), el("span", "row-name", row.name), el("span", "row-meta", `${row.status} · ${row.when}`)));
  }
  if (items.length === 2) items.pop();
  els.menu.replaceChildren(...items);
  els.menu.hidden = false;
  els.switcherBtn.setAttribute("aria-expanded", "true");
  menuItems()[0]?.focus();
}

function closeMenu(refocus = false) {
  if (els.menu.hidden) return;
  els.menu.hidden = true;
  els.switcherBtn.setAttribute("aria-expanded", "false");
  if (refocus) els.switcherBtn.focus();
}

els.switcherBtn.addEventListener("click", () => (els.menu.hidden ? openMenu() : closeMenu()));

els.menu.addEventListener("keydown", (event) => {
  const items = menuItems();
  const at = items.indexOf(document.activeElement);
  if (event.key === "ArrowDown") items[(at + 1) % items.length].focus();
  else if (event.key === "ArrowUp") items[(at - 1 + items.length) % items.length].focus();
  else if (event.key === "Escape") closeMenu(true);
  else return;
  event.preventDefault();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".switcher")) closeMenu();
});

const currentIsEmpty = () => FIELDS.every((name) => !fields[name].input.value.trim());

async function newAgent() {
  if (currentIsEmpty()) return els.message.focus(); // R8: stay on the same empty screen
  if (!(await flushAll())) return;
  const { id } = await api("/api/agents", { method: "POST" });
  await loadAgent(id);
}

async function chooseAgent(id) {
  if (id === state.agent.id) return els.message.focus();
  if (!(await flushAll())) return;
  await loadAgent(id);
}

// S1 or S9: a fresh chat with the agent's saved draft and no old marks.
async function loadAgent(id) {
  const loaded = await api(`/api/agents/${id}`);
  const agent = { ...loaded, draft: mergePersona(loaded.draft), hadPersona: Boolean(loaded.draft?.persona?.trim()) };
  state.agent = agent;
  state.fresh = new Set();
  state.yours = new Set();
  state.firstVoiceShown = false;
  state.hint = null;
  state.failedTurn = null;
  state.keepFailed = false;
  clearTimeout(state.keepFailTimer);
  clearWaitForWords();
  for (const name of FIELDS) {
    const f = fields[name];
    clearTimeout(f.timer);
    clearTimeout(f.flashTimer);
    Object.assign(f, { pending: false, failed: false, savedFlash: false });
    f.wrap.classList.remove("updated", "edited", "filling");
    setFieldValue(name, agent.draft[name]);
  }
  els.sketch.classList.remove("agent-born");
  els.switcherName.classList.remove("name-arrive");
  clearDots();
  els.log.replaceChildren();
  const empty = isEmptyDraft(agent.draft);
  els.empty.hidden = !empty;
  els.note.hidden = empty;
  els.note.textContent = `Back to ${agent.draft.name.trim() || "your sketch"}.`;
  renderName();
  renderTags();
  renderKeep();
  renderBanner();
  renderPlaceholder();
  els.message.focus();
  hooks.afterLoad?.(agent);
}

// ── Narrow screens: Chat | Sketch ─────────────────────────────────────────

const isNarrow = () => matchMedia("(width < 860px)").matches;

function setView(view) {
  els.panes.dataset.view = view;
  els.viewChat.setAttribute("aria-selected", String(view === "chat"));
  els.viewSketch.setAttribute("aria-selected", String(view === "sketch"));
}

els.viewChat.addEventListener("click", () => setView("chat"));
els.viewSketch.addEventListener("click", () => setView("sketch"));

// ── Open (S0) ─────────────────────────────────────────────────────────────

// FULL-UX: blocks A–F drive the screens; the P2 Sketcher is one of them.
Object.assign(window.ACP2 ??= {}, {
  state, els, fields, api, loadAgent, takeDraft, markUpdated, setPhase, renderKeep, renderBanner,
  renderPlaceholder, waitForWords, renderSend, growComposer, addUserBubble, addSketcherMessage, renderReply,
  addChangeLine, addCustomLine, stick, setView, isNarrow, flushAll, closeMenu, el,
  async newAgent() {
    if (!(await flushAll())) return;
    const { id } = await api("/api/agents", { method: "POST" });
    await loadAgent(id);
    return id;
  },
});

const health = await api("/api/health").catch(() => ({ installed: false }));
state.installed = Boolean(health.installed);
const { boot } = await import("/block-a.js");
await boot();
