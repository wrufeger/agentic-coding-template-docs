#!/usr/bin/env node
// Pulls the template state into this project and lists what to review.
//
//   node scripts/sync.mjs [--source <path>]            plan only (update.py --plan), nothing changes
//   node scripts/sync.mjs --apply [--source <path>]    update.py --yes, regenerate reference, list pages
//
// Ends with the translation report. Exit 0 unless a step failed (then 1, naming the step).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join('src', 'content', 'docs');
const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const si = argv.indexOf('--source');
const source = si >= 0 ? argv[si + 1] : null;
if (si >= 0 && !source) {
  console.error('sync: --source needs a path');
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: root, encoding: 'utf8', ...opts });
}
function failStep(step) {
  console.error(`sync: step failed: ${step}`);
  process.exit(1);
}
function findPython() {
  // 'py -3' on Windows: the plain launcher would follow the script's shebang (python3, often the Store stub)
  const candidates = [['python3'], ['python'], ...(process.platform === 'win32' ? [['py', '-3']] : [])];
  for (const [c, ...pre] of candidates) {
    const r = run(c, [...pre, '-c', 'import sys; sys.exit(0 if sys.version_info>=(3,9) else 1)']);
    if (!r.error && r.status === 0) return [c, ...pre];
  }
  console.error('sync: no Python >= 3.9 found (tried python3, python, py on Windows)');
  process.exit(1);
}
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const [py, ...pyPre] = findPython();
const updateArgs = ['.act/scripts/update.py', ...(source ? ['--source', source] : [])];

// 1. plan (also the first half of apply: show what is about to happen)
console.log('== 1. update plan ==');
const plan = run(py, [...pyPre, ...updateArgs, '--plan']);
const planOut = (plan.stdout || '') + (plan.stderr || '');
if (plan.status !== 0) {
  process.stdout.write(planOut);
  failStep('update.py --plan');
}
const lines = planOut.split(/\r?\n/);
const summary = lines.filter((l) => /^\s*\[\d+\/\d+\]/.test(l));
console.log((summary.length ? summary : lines.filter(Boolean).slice(-15)).join('\n'));
const moved = /\b(?:[1-9]\d*)\s+(?:files?\s+)?(?:changed|differ|to (?:replace|update))|differs|will be replaced/i.test(planOut);
console.log(moved ? 'template moved: yes (see plan above)' : 'template moved: no difference reported');

if (apply) {
  console.log('\n== 2. update ==');
  const up = run(py, [...pyPre, ...updateArgs, '--yes'], { stdio: 'inherit' });
  if (up.status !== 0) failStep('update.py --yes');

  console.log('\n== 3. regenerate reference ==');
  const gen = run('node', ['scripts/gen-reference.mjs'], { stdio: 'inherit' });
  if (gen.status !== 0) failStep('gen-reference.mjs');

  console.log('\n== 4. changed reference pages ==');
  const refDirs = [`${docs}/reference`, `${docs}/de/reference`];
  const names = run('git', ['diff', '--name-only', 'HEAD', '--', ...refDirs]);
  if (names.status !== 0) failStep('git diff (reference pages)');
  const changed = names.stdout.split(/\r?\n/).filter(Boolean);
  console.log(changed.length ? changed.join('\n') : '(none)');

  // names of changed skills/scripts/keys: headings and backticked words on changed lines
  const diff = run('git', ['diff', '-U0', 'HEAD', '--', ...refDirs]);
  const tokens = new Set();
  for (const l of diff.stdout.split(/\r?\n/)) {
    if (!/^[+-](?![+-])/.test(l)) continue;
    for (const m of l.matchAll(/`([A-Za-z][\w./:-]{3,})`/g)) tokens.add(m[1]);
    const h = l.match(/^[+-]#{2,4}\s+`?([A-Za-z][\w./:-]{3,})`?/);
    if (h) tokens.add(h[1]);
  }
  const handDirs = ['start', 'getting-started', 'concepts', 'guides'].flatMap((d) => [
    path.join(root, docs, d),
    path.join(root, docs, 'de', d),
  ]);
  const hits = new Map();
  for (const f of handDirs.flatMap(walk)) {
    const text = fs.readFileSync(f, 'utf8');
    const found = [...tokens].filter((t) => text.includes(t));
    if (found.length) hits.set(path.relative(root, f).split(path.sep).join('/'), found);
  }
  if (hits.size) {
    console.log('hand pages to review:');
    for (const [f, found] of hits) console.log(`  ${f}  (${found.slice(0, 5).join(', ')}${found.length > 5 ? ', ...' : ''})`);
  } else {
    console.log('hand pages to review: none');
  }
}

console.log('\n== translation report ==');
const tr = run('node', ['scripts/check-translations.mjs']);
process.stdout.write(tr.stdout || '');
process.stderr.write(tr.stderr || '');
const stale = tr.status === 0 ? 'no stale German pages' : 'German pages need attention (see report)';
console.log(`\nsync: ${apply ? 'applied' : 'plan only'}; ${moved ? 'template moved' : 'no template change reported'}; ${stale}.`);
process.exit(0);
