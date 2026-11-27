/* The one safe markdown renderer for AI text (Reports/chat-markdown-roadmap.md).
   renderMarkdown(doc, text) → DocumentFragment, built from DOM nodes only: no innerHTML, ever.
   Supported: bold, italics, numbered and bullet lists, inline code, code blocks, quotes, links,
   paragraphs and line breaks. Headings show as one bold line. Everything else (HTML, tables,
   images, rules…) stays as the plain characters that were written.
   Streaming: a marker with no closer yet (a lone ** or `) is plain text; an open ``` fence is a
   code block that grows. The same text always gives the same result, so live equals reload. */

const SAFE = /^(https?:\/\/|mailto:)/i;
const PUNCT = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
const WORD = /[\p{L}\p{N}]/u;
const SPACE = /\s/;

/* A link target we let through: http, https or mailto, nothing hidden in it, and it parses. */
export function safeHref(url) {
  const u = String(url || '').trim();
  if (!SAFE.test(u) || /[\s\x00-\x1f\x7f]/.test(u)) return null;
  try { const p = new URL(u); return /^(https?|mailto):$/.test(p.protocol) ? u : null; } catch { return null; }
}

/* ------------------------------------------------------------------ inline ---- */
/* → a list of pieces: strings, { t: 'code' | 'strong' | 'em' | 'a', ... }. */
function inline(s, inLink = false) {
  const out = []; let buf = '', i = 0;
  const flush = () => { if (buf) out.push(buf); buf = ''; };
  while (i < s.length) {
    const c = s[i];
    if (c === '\\' && PUNCT.test(s[i + 1] || '')) { buf += s[i + 1]; i += 2; continue; }
    if (c === '`') {
      const n = run(s, i, '`'), end = findTicks(s, i + n, n);
      if (end < 0) { buf += s.slice(i, i + n); i += n; continue; }   // no closer (yet): plain
      let code = s.slice(i + n, end).replace(/\n/g, ' ');
      if (code.length > 2 && code[0] === ' ' && code[code.length - 1] === ' ' && code.trim()) code = code.slice(1, -1);
      flush(); out.push({ t: 'code', text: code }); i = end + n; continue;
    }
    if (c === '[' && !inLink && s[i - 1] !== '!') {
      const l = link(s, i);
      if (l) { flush(); out.push({ t: 'a', href: l.href, kids: inline(l.text, true) }); i = l.end; continue; }
    }
    if (!inLink && (c === 'h' || c === 'H') && !WORD.test(s[i - 1] || '') && /^https?:\/\//i.test(s.slice(i, i + 8))) {
      const u = bare(s, i), href = u && safeHref(u);
      if (href) { flush(); out.push({ t: 'a', href, kids: [u] }); i += u.length; continue; }
    }
    if (c === '*' || c === '_') {
      const n = run(s, i, c);
      if (n === 2 || n === 1) {
        const end = opens(s, i, c, n) ? findClose(s, i + n, c, n) : -1;
        if (end > i + n) { flush(); out.push({ t: n === 2 ? 'strong' : 'em', kids: inline(s.slice(i + n, end), inLink) }); i = end + n; continue; }
      }
      buf += s.slice(i, i + n); i += n; continue;   // a lone marker, or *** and longer: plain
    }
    buf += c; i++;
  }
  flush();
  return out;
}

const run = (s, i, c) => { let n = 0; while (s[i + n] === c) n++; return n; };

/* The next backtick run of exactly n, from i. */
function findTicks(s, i, n) {
  for (let j = s.indexOf('`', i); j >= 0; j = s.indexOf('`', j)) {
    const m = run(s, j, '`'); if (m === n) return j; j += m;
  }
  return -1;
}

/* Can a run of n markers at i open emphasis? Followed by non-space; _ never inside a word. */
function opens(s, i, c, n) {
  const next = s[i + n] || '', prev = s[i - 1] || '';
  if (!next || SPACE.test(next)) return false;
  return c !== '_' || !WORD.test(prev);
}

/* The matching closer for a run of n markers c, skipping code spans, escapes and the other width. */
function findClose(s, i, c, n) {
  for (let j = i; j < s.length;) {
    const ch = s[j];
    if (ch === '\\') { j += 2; continue; }
    if (ch === '`') { const m = run(s, j, '`'), e = findTicks(s, j + m, m); j = e < 0 ? j + m : e + m; continue; }
    if (ch === c) {
      const m = run(s, j, c), prev = s[j - 1] || '', next = s[j + m] || '';
      const closes = !SPACE.test(prev) && (c !== '_' || !WORD.test(next));
      if (m === n && closes) return j;
      if (m !== n && opens(s, j, c, m)) {   // an inner span of the other width: step over it whole
        const e = findClose(s, j + m, c, m); if (e > 0) { j = e + m; continue; }
      }
      j += m; continue;
    }
    j++;
  }
  return -1;
}

/* [text](url) at i → { text, href, end } when the url is safe; else null (it stays plain). */
function link(s, i) {
  let depth = 0, j = i;
  for (; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue; }
    if (s[j] === '[') depth++;
    else if (s[j] === ']' && --depth === 0) break;
  }
  if (j >= s.length || s[j + 1] !== '(') return null;
  const close = s.indexOf(')', j + 2);
  if (close < 0) return null;
  const href = safeHref(s.slice(j + 2, close));
  return href && j > i + 1 ? { text: s.slice(i + 1, j), href, end: close + 1 } : null;
}

/* A bare https://… address, without the sentence's own closing punctuation. */
function bare(s, i) {
  let u = /^[^\s<>]+/.exec(s.slice(i))[0];
  for (;;) {
    const last = u[u.length - 1];
    if (/[.,;:!?'"*_~]/.test(last)) u = u.slice(0, -1);
    else if (last === ')' && u.split('(').length < u.split(')').length) u = u.slice(0, -1);   // "(see https://x.y)"
    else break;
  }
  return /^https?:\/\/[^/]/i.test(u) ? u : null;
}

function build(doc, pieces, into) {
  for (const p of pieces) {
    if (typeof p === 'string') {
      p.split('\n').forEach((part, k) => { if (k) into.append(doc.createElement('br')); if (part) into.append(doc.createTextNode(part)); });
    } else if (p.t === 'code') {
      const el = doc.createElement('code'); el.textContent = p.text; into.append(el);
    } else {
      const el = doc.createElement(p.t);
      if (p.t === 'a') { el.setAttribute('href', p.href); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
      build(doc, p.kids, el); into.append(el);
    }
  }
  return into;
}

/* ------------------------------------------------------------------- blocks ---- */
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const HEADING = /^ {0,3}#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const QUOTE = /^ {0,3}>[ \t]?/;
const ITEM = /^([ \t]*)([*+-]|\d{1,9}[.)])[ \t]+(.*)$/;
const RULE = /^ {0,3}([-*_])([ \t]*\1){2,}[ \t]*$/;
const blank = l => !l.trim();
const indentOf = l => { let n = 0; for (const ch of l) { if (ch === ' ') n++; else if (ch === '\t') n += 4; else break; } return n; };
const dedent = (l, n) => { let k = 0, w = 0; while (k < l.length && w < n && (l[k] === ' ' || l[k] === '\t')) { w += l[k] === '\t' ? 4 : 1; k++; } return l.slice(k); };
const item = l => { if (RULE.test(l)) return null; const m = ITEM.exec(l); return m && { indent: indentOf(m[1]), ordered: /\d/.test(m[2]), num: parseInt(m[2], 10), text: m[3], pad: indentOf(m[1]) + m[2].length + 1 }; };
const startsBlock = l => FENCE.test(l) || HEADING.test(l) || QUOTE.test(l) || !!item(l);

function blocks(doc, lines, into) {
  for (let i = 0; i < lines.length;) {
    const l = lines[i];
    if (blank(l)) { i++; continue; }

    let m = FENCE.exec(l);
    if (m) {   // a code block; with no closing fence yet it runs to the end and grows
      const mark = m[1], body = [], pad = indentOf(l);
      for (i++; i < lines.length; i++) {
        const c = new RegExp(`^ {0,3}${mark[0] === '`' ? '`' : '~'}{${mark.length},}[ \\t]*$`);
        if (c.test(lines[i])) { i++; break; }
        body.push(dedent(lines[i], pad));
      }
      const pre = doc.createElement('pre'), code = doc.createElement('code');
      code.textContent = body.join('\n'); pre.append(code); into.append(pre);
      continue;
    }

    m = HEADING.exec(l);
    if (m) {   // a heading is one bold line, never big type
      const p = doc.createElement('p'), b = doc.createElement('strong');
      build(doc, inline(m[1]), b); p.append(b); into.append(p); i++;
      continue;
    }

    if (QUOTE.test(l)) {   // consecutive > lines are one quote; what's inside is rendered too
      const body = [];
      while (i < lines.length && QUOTE.test(lines[i])) body.push(lines[i++].replace(QUOTE, ''));
      into.append(blocks(doc, body, doc.createElement('blockquote')));
      continue;
    }

    const first = item(l);
    if (first) { i = list(doc, lines, i, first, into); continue; }

    const para = [l.trim()];   // a paragraph: single newlines stay line breaks
    for (i++; i < lines.length && !blank(lines[i]) && !startsBlock(lines[i]); i++) para.push(lines[i].trim());
    into.append(build(doc, inline(para.join('\n')), doc.createElement('p')));
  }
  return into;
}

/* A list from line i. Items split by blank lines stay one list; deeper lines belong to the item. */
function list(doc, lines, i, first, into) {
  const el = doc.createElement(first.ordered ? 'ol' : 'ul');
  if (first.ordered && first.num !== 1) el.setAttribute('start', String(first.num));
  const base = first.indent, same = it => it && it.ordered === first.ordered && it.indent < base + 2;
  let cur = null;
  const end = () => { if (!cur) return; const li = doc.createElement('li'); blocks(doc, cur.body, li); tight(li); el.append(li); cur = null; };
  while (i < lines.length) {
    const l = lines[i], it = item(l);
    if (same(it)) { end(); cur = { body: [it.text], pad: it.pad }; i++; continue; }
    if (it && it.indent < base + 2) break;   // the other kind of list at this level: a new list
    if (blank(l)) {
      let k = i + 1; while (k < lines.length && blank(lines[k])) k++;
      const nx = lines[k];
      if (nx === undefined || !(same(item(nx)) || indentOf(nx) >= base + 2)) break;
      if (indentOf(nx) >= base + 2) cur.body.push('');
      i = k; continue;
    }
    if (indentOf(l) >= base + 2) { cur.body.push(dedent(l, Math.min(indentOf(l), cur.pad))); i++; continue; }
    if (startsBlock(l)) break;
    cur.body.push(l.trim()); i++;   // a lazy line that goes on with the item's text
  }
  end();
  into.append(el);
  return i;
}

/* A one-paragraph item holds its words directly (no paragraph gap inside a tight list). */
function tight(li) {
  const p = li.firstChild;
  if (p && p.nodeName === 'P') { const kids = [...p.childNodes]; p.remove(); li.prepend(...kids); }
}

export function renderMarkdown(doc, text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
  return blocks(doc, lines, doc.createDocumentFragment());
}
