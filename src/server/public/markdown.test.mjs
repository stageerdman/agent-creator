// Tests for the one safe markdown renderer (Reports/chat-markdown-roadmap.md).
// No DOM library in the repo, so a tiny fake document stands in: just what renderMarkdown uses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, safeHref } from './markdown.js';

class Node {
  constructor(name, text = '') { this.nodeName = name; this.childNodes = []; this.parentNode = null; this.attrs = {}; this.text = text; }
  get firstChild() { return this.childNodes[0] || null; }
  _take(n) {
    if (n.nodeName === '#document-fragment') return [...n.childNodes].flatMap(k => this._take(k));
    if (n.parentNode) n.remove();
    n.parentNode = this; return [n];
  }
  append(...ns) { for (const n of ns) this.childNodes.push(...this._take(n)); }
  prepend(...ns) { this.childNodes.unshift(...ns.flatMap(n => this._take(n))); }
  remove() { const p = this.parentNode; if (p) { p.childNodes.splice(p.childNodes.indexOf(this), 1); this.parentNode = null; } }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  get textContent() { return this.nodeName === '#text' ? this.text : this.childNodes.map(k => k.textContent).join(''); }
  set textContent(v) { this.childNodes = []; if (v !== '') this.append(new Node('#text', String(v))); }
}
const doc = {
  createElement: t => new Node(t.toUpperCase()),
  createTextNode: s => new Node('#text', String(s)),
  createDocumentFragment: () => new Node('#document-fragment'),
};

// A readable serialization: <tag a="v">kids</tag>, text as-is (only for asserting structure).
const html = n => n.nodeName === '#text' ? n.text
  : n.nodeName === '#document-fragment' ? n.childNodes.map(html).join('')
  : `<${n.nodeName.toLowerCase()}${Object.entries(n.attrs).map(([k, v]) => ` ${k}="${v}"`).join('')}>${n.childNodes.map(html).join('')}</${n.nodeName.toLowerCase()}>`;
const all = (n, name) => [...(n.nodeName === name ? [n] : []), ...n.childNodes.flatMap(k => all(k, name))];
const render = t => renderMarkdown(doc, t);

const RELEASE_COACH = `I've sketched **Release Coach**: a calm helper that turns your merged changes into clear release notes.

**Files:**
1. \`note.md\` → instructions (it shapes how Release Coach writes)
2. \`changelog/\` → rag (it looks things up there when it answers)
3. \`screenshots/\` → not routed yet

Here's how it might sound:
> **Release Coach:** Three fixes and one new button this week. Lead with the button: that's what people will notice.

Should \`screenshots/\` go to rag too? I'd say *no*, since they're images. If that's Release Coach, press Keep.`;

test('Release Coach sample: no ** or backtick survives; strong, ol/li, code, quote and em appear', () => {
  const f = render(RELEASE_COACH), text = f.textContent;
  assert.ok(!text.includes('**'), text);
  assert.ok(!text.includes('`'), text);
  assert.deepEqual(all(f, 'STRONG').map(s => s.textContent), ['Release Coach', 'Files:', 'Release Coach:']);
  const ol = all(f, 'OL');
  assert.equal(ol.length, 1);
  assert.equal(ol[0].getAttribute('start'), null);
  assert.equal(all(ol[0], 'LI').length, 3);
  assert.deepEqual(all(f, 'CODE').map(c => c.textContent), ['note.md', 'changelog/', 'screenshots/', 'screenshots/']);
  const q = all(f, 'BLOCKQUOTE');
  assert.equal(q.length, 1);
  assert.equal(all(q[0], 'STRONG')[0].textContent, 'Release Coach:');
  assert.ok(!q[0].textContent.startsWith('>'));
  assert.deepEqual(all(f, 'EM').map(e => e.textContent), ['no']);
  assert.ok(text.includes('→'));
  assert.equal(all(f, 'A').length, 0);
});

test('every streamed prefix of the samples renders without throwing, and never shows a broken tag', () => {
  for (const s of [RELEASE_COACH, EDGE]) {
    for (let i = 0; i <= s.length; i++) {
      const f = render(s.slice(0, i));
      assert.equal(all(f, 'SCRIPT').length + all(f, 'IMG').length, 0);
    }
  }
});

test('a single newline inside a paragraph stays a line break; a blank line starts a new paragraph', () => {
  assert.equal(html(render('one\ntwo\n\nthree')), '<p>one<br></br>two</p><p>three</p>');
});

test('snake_case names and 2 * 3 * 4 are never italic', () => {
  const f = render('my_file_v2.md and 2 * 3 * 4 and __init__ name');
  assert.equal(f.textContent, 'my_file_v2.md and 2 * 3 * 4 and __init__ name'.replace('__init__', 'init'));
  assert.equal(all(f, 'EM').length, 0);
  const g = render('my_file_v2.md and 2 * 3 * 4');
  assert.equal(g.textContent, 'my_file_v2.md and 2 * 3 * 4');
  assert.equal(all(g, 'EM').length + all(g, 'STRONG').length, 0);
});

test('italics and bold in both spellings', () => {
  assert.equal(html(render('*a* _b_ **c** __d__')), '<p><em>a</em> <em>b</em> <strong>c</strong> <strong>d</strong></p>');
  assert.equal(html(render('**bold with *inner* italics**')), '<p><strong>bold with <em>inner</em> italics</strong></p>');
});

test('bullets with -, * and +, one nested level, tight items', () => {
  assert.equal(html(render('- a\n* b\n+ c')), '<ul><li>a</li><li>b</li><li>c</li></ul>');
  assert.equal(html(render('- a\n- b')), '<ul><li>a</li><li>b</li></ul>');
  assert.equal(html(render('- a\n  - inner\n- b')), '<ul><li>a<ul><li>inner</li></ul></li><li>b</li></ul>');
});

test('numbered list keeps the author\'s start number, and blank-line items stay one list', () => {
  const f = render('3. three\n\n4. four\n\n5) five');
  const ol = all(f, 'OL');
  assert.equal(ol.length, 1);
  assert.equal(ol[0].getAttribute('start'), '3');
  assert.equal(all(ol[0], 'LI').length, 3);
});

test('code block: language hidden, nothing parsed inside, an open fence grows', () => {
  const f = render('```js\nconst a = **b** <i>;\n```\nafter');
  assert.equal(html(f), '<pre><code>const a = **b** <i>;</code></pre><p>after</p>');
  assert.equal(all(f, 'I').length, 0);
  assert.ok(!f.textContent.includes('js'));
  assert.equal(html(render('```\nline one\nline tw')), '<pre><code>line one\nline tw</code></pre>');
  assert.equal(html(render('```')), '<pre><code></code></pre>');
});

test('inline code: nothing inside is parsed, double ticks may hold a backtick', () => {
  assert.equal(html(render('`**x** _y_`')), '<p><code>**x** _y_</code></p>');
  assert.equal(html(render('`` a`b ``')), '<p><code>a`b</code></p>');
});

test('several > lines make one quote, with formatting inside', () => {
  const f = render('> one *two*\n> three');
  assert.equal(html(f), '<blockquote><p>one <em>two</em><br></br>three</p></blockquote>');
});

test('https and mailto links open outside, safely; bare https addresses too', () => {
  const f = render('Read [the guide](https://example.com/guide) or mail [us](mailto:hi@example.com). See https://example.com/x.');
  const a = all(f, 'A');
  assert.equal(a.length, 3);
  assert.deepEqual(a.map(x => x.getAttribute('href')), ['https://example.com/guide', 'mailto:hi@example.com', 'https://example.com/x']);
  for (const x of a) { assert.equal(x.getAttribute('target'), '_blank'); assert.equal(x.getAttribute('rel'), 'noopener noreferrer'); }
  assert.equal(a[0].textContent, 'the guide');
  assert.ok(f.textContent.endsWith('https://example.com/x.'));
});

test('HTML and scripts are literal text, never nodes', () => {
  const s = '<script>alert(1)</script> <img src=x onerror=alert(1)> <b>hi</b>';
  const f = render(s);
  assert.equal(f.textContent, s);
  assert.equal(all(f, 'SCRIPT').length + all(f, 'IMG').length + all(f, 'B').length, 0);
});

test('javascript:, data:, vbscript:, file: and entity tricks are plain text, never a link', () => {
  for (const u of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', '  JaVaScRiPt:alert(1)', 'java&#115;cript:alert(1)',
    'data:text/html,<script>alert(1)</script>', 'vbscript:x', 'file:///etc/passwd', 'https://ok.example/ x', '//evil.example']) {
    const f = render(`[click me](${u})`);
    assert.equal(all(f, 'A').length, 0, u);
    assert.equal(f.textContent, `[click me](${u})`, u);
    assert.equal(safeHref(u), null, u);
  }
});

test('an image is plain text and nothing loads', () => {
  const f = render('![a](https://x.example/p.png)');
  assert.equal(all(f, 'A').length + all(f, 'IMG').length, 0);
  assert.equal(f.textContent, '![a](https://x.example/p.png)');
});

test('half-streamed markers stay as typed characters', () => {
  const f = render('Half-streamed: **not closed yet and `open code');
  assert.equal(f.textContent, 'Half-streamed: **not closed yet and `open code');
  assert.equal(all(f, 'STRONG').length + all(f, 'CODE').length, 0);
  assert.equal(render('a [half](https://exa').textContent, 'a [half](https://exa');
  assert.equal(render('lone * star and lone ** pair').textContent, 'lone * star and lone ** pair');
});

test('a heading is one bold line, not big type', () => {
  assert.equal(html(render('### Next step\ntext')), '<p><strong>Next step</strong></p><p>text</p>');
});

test('tables, rules and strikethrough stay plain', () => {
  assert.equal(html(render('| a | b |\n|---|---|')), '<p>| a | b |<br></br>|---|---|</p>');
  assert.equal(render('---').textContent, '---');
  assert.equal(render('~~gone~~').textContent, '~~gone~~');
});

test('empty, null and CRLF input', () => {
  assert.equal(render('').childNodes.length, 0);
  assert.equal(render(null).childNodes.length, 0);
  assert.equal(html(render('a\r\nb')), '<p>a<br></br>b</p>');
});

const EDGE = `- one bullet with my_file_v2.md and 2 * 3 * 4
- second bullet

\`\`\`js
const veryLongLineThatMustScrollSidewaysInsideItsOwnBlockAndNeverWidenThePanel = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
\`\`\`

### Next step
Read [the guide](https://example.com/guide) or mail [us](mailto:hi@example.com).
<script>alert(1)</script> <img src=x onerror=alert(1)>
[click me](javascript:alert(1)) [also](  JaVaScRiPt:alert(1))
Half-streamed: **not closed yet and \`open code`;

test('edge sample from the roadmap', () => {
  const f = render(EDGE);
  const ul = all(f, 'UL');
  assert.equal(ul.length, 1);
  assert.equal(all(ul[0], 'LI').length, 2);
  assert.equal(all(ul[0], 'LI')[0].textContent, 'one bullet with my_file_v2.md and 2 * 3 * 4');
  assert.equal(all(f, 'PRE').length, 1);
  assert.equal(all(f, 'STRONG')[0].textContent, 'Next step');
  assert.deepEqual(all(f, 'A').map(a => a.getAttribute('href')), ['https://example.com/guide', 'mailto:hi@example.com']);
  assert.equal(all(f, 'SCRIPT').length + all(f, 'IMG').length, 0);
  assert.ok(f.textContent.includes('<script>alert(1)</script> <img src=x onerror=alert(1)>'));
  assert.ok(f.textContent.includes('[click me](javascript:alert(1)) [also](  JaVaScRiPt:alert(1))'));
  assert.ok(f.textContent.endsWith('Half-streamed: **not closed yet and `open code'));
});
