const fs = require('node:fs');
const path = require('node:path');

function findSessions(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'attachments' ? [] : findSessions(file);
    return entry.name === 'session.json' ? [JSON.parse(fs.readFileSync(file, 'utf8'))] : [];
  });
}

const sessions = findSessions('test-results/cloud');
if (!sessions.length) {
  console.error('No TestMu cloud session IDs exist. Run npm run test:cloud with your credentials first. Local test runs cannot produce TestMu IDs.');
  process.exitCode = 1;
} else {
  sessions.sort((a, b) => a.project.localeCompare(b.project) || a.test.localeCompare(b.test));
  const projects = new Set(sessions.map(s => s.project));
  const ids = new Set(sessions.map(s => s.sessionId));
  const overlap = sessions.some(a => sessions.some(b =>
    a.project !== b.project && Date.parse(a.started) < Date.parse(b.finished) && Date.parse(b.started) < Date.parse(a.finished)));
  const complete = sessions.length === 6 && ids.size === 6 && projects.size === 2 &&
    [...projects].every(project => new Set(sessions.filter(s => s.project === project).map(s => s.test)).size === 3) &&
    sessions.every(s => s.sessionId && s.status === 'passed') && overlap;
  const lines = [
    '# TestMu AI session IDs', '',
    `Six passing sessions across two parallel projects: ${complete ? 'YES' : 'NO - inspect results'}`, '',
    '| Project | Test | Session ID | Status |', '| --- | --- | --- | --- |',
    ...sessions.map(s => `| ${s.project} | ${s.test} | ${s.sessionId} | ${s.status} |`), '',
    'Confirm actual OS/browser and all four cloud artifacts in the TestMu dashboard before submitting.',
  ];
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/cloud-sessions.md', lines.join('\n'));
  console.log(lines.join('\n'));
  if (!complete) process.exitCode = 1;
}
