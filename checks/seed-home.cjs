// Seeds a throwaway Agent Creator home through the app's own API, so real-home-check.cjs part A has real rows.
// Usage: start the app with AGENT_CREATOR_HOME=<scratch folder> PORT=3507, then node checks/seed-home.cjs http://localhost:3507
// Never point it at a real home: it creates agents.
const base = process.argv[2] || 'http://localhost:3507';
const MB = 1048576;
const call = async (method, path, body) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) });
  if (!r.ok) throw new Error(method + ' ' + path + ' ' + r.status + ' ' + await r.text());
  return r.json();
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AGENTS = [
  { name: 'Red Pen', description: 'Edits drafts until they are short.', files: [] },
  { name: 'Tax Helper', description: 'Reads receipts and fills forms.', files: [{ path: 'receipts/2026.pdf', size: 3.2 * MB }, { path: 'notes/rules.md', size: 4000 }] },
  { name: 'Archivist', description: 'Knows every old project.', files: [{ path: 'scans/box-1.zip', size: 120 * MB }] },
  { name: 'Coach', description: 'Plans training weeks.', files: [{ path: 'plans/week.md', size: 900 }] },
];
(async () => {
  for (const a of AGENTS) {
    const { id } = await call('POST', '/api/agents');
    await call('PUT', `/api/agents/${id}/draft`, { name: a.name, persona: a.description });   // the home's description is the persona's first sentence
    for (const f of a.files) { await call('POST', `/api/agents/${id}/files`, { files: [f] }); await sleep(1100); }
    await call('POST', `/api/agents/${id}/save`);
    console.log('made', id, a.name, a.files.length + ' files');
    await sleep(1100);
  }
})().catch(e => { console.error(e); process.exit(1); });
