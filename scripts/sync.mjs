#!/usr/bin/env node
// Pulls the template state into this project and lists what to review.
//
//   node scripts/sync.mjs [--source <path>]            plan only (update.py --plan), nothing changes
//   node scripts/sync.mjs --apply [--source <path>]    update.py --yes, regenerate reference, list pages
//   --from <commit>                                    override the last-synced commit (testing, re-review)
//
// The last processed template commit is kept in .act-lock.json; the report works from the difference
// between it and the new commit (git history of the source). Without history it falls back to the
// reference diff. Ends with the translation report. Exit 0 unless a step failed (then 1, naming the step).

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
const fi = argv.indexOf('--from');
const fromCommit = fi >= 0 ? argv[fi + 1] : null;
if (fi >= 0 && !fromCommit) {
  console.error('sync: --from needs a commit');
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

function readLock() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, '.act-lock.json'), 'utf8')).template || {};
  } catch {
    return {};
  }
}
const lockBefore = readLock();
const oldCommit = fromCommit || lockBefore.commit || null;
const sourcePath = source || lockBefore.source || null;
function git(args) {
  return spawnSync('git', ['-C', sourcePath, ...args], { encoding: 'utf8' });
}
const isGit = !!sourcePath && fs.existsSync(sourcePath) && git(['rev-parse', '--git-dir']).status === 0;

const handDirs = ['start', 'getting-started', 'concepts', 'guides'].flatMap((d) => [
  path.join(root, docs, d),
  path.join(root, docs, 'de', d),
]);
// whole-name match: 'ide' must not hit 'guide', 'init.py' not 'reinit.py'
function hasName(text, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w-])${esc}(?![\\w-])`).test(text);
}
function listHandPages(tokens) {
  const hits = new Map();
  for (const f of handDirs.flatMap(walk)) {
    const text = fs.readFileSync(f, 'utf8');
    const found = [...tokens].filter((t) => hasName(text, t));
    if (found.length) hits.set(path.relative(root, f).split(path.sep).join('/'), found);
  }
  return hits;
}
function printHandPages(hits) {
  if (!hits.size) return console.log('hand pages to review: none');
  console.log('hand pages to review:');
  for (const [f, found] of hits) {
    console.log(`  ${f}  (${found.slice(0, 5).join(', ')}${found.length > 5 ? ', ...' : ''})`);
  }
}

// A unit of the template the docs cover, from a changed path (null: not covered).
function unitOf(file) {
  let m;
  if ((m = file.match(/^\.act\/skills\/([^/]+)\//))) return { kind: 'skill', name: m[1] };
  if ((m = file.match(/^\.act\/scripts\/([^/]+\.py)$/))) return { kind: 'script', name: m[1] };
  if ((m = file.match(/^\.act\/rules\/topics\/([^/]+)\.md$/))) return { kind: 'topic', name: m[1] };
  if ((m = file.match(/^\.act\/rules\/(?:shared|orchestrator)\/([^/]+\.md)$/))) return { kind: 'rule file', name: m[1] };
  if (file === '.act/skeleton/config.md') return { kind: 'config', name: 'config.md' };
  if ((m = file.match(/^\.act\/agents\/([^/]+)\.md$/)) && m[1] !== 'README') return { kind: 'role', name: m[1] };
  if ((m = file.match(/^\.act\/bridges\/agents\/([^/.]+)/))) return { kind: 'role', name: m[1] };
  if ((m = file.match(/^\.act\/coding\/([^/]+)\.md$/))) return { kind: 'coding set', name: m[1] };
  if (file === '.act/tiers.json') return { kind: 'tiers', name: 'tiers.json' };
  return null;
}
const COVERED = [
  'skills/', 'scripts/', 'rules/', 'skeleton/config.md', 'agents/', 'bridges/agents/', 'coding/', 'tiers.json',
].map((p) => `.act/${p}`);

// Prints the changes old..new; returns the names to look for on hand pages, or null (fall back).
let unchanged = false;
function reportChanges(oldC, newC) {
  console.log('\n== template changes since the last sync ==');
  if (!isGit) {
    console.log(`(source ${sourcePath || 'unknown'} is not a git checkout: no history; falling back to the reference diff)`);
    return null;
  }
  const resolve = (c) => git(['rev-parse', '--verify', '--quiet', `${c}^{commit}`]);
  const o = oldC ? resolve(oldC) : null;
  const n = resolve(newC || 'HEAD');
  if (!o || o.status !== 0) {
    console.log(
      `old commit ${oldC || '(none recorded)'} is unknown to the source history (update.py will refuse to apply it); falling back to the reference diff`,
    );
    return null;
  }
  if (n.status !== 0) {
    console.log(`new commit ${newC} is unknown to the source; falling back to the reference diff`);
    return null;
  }
  const oldFull = o.stdout.trim();
  const newFull = n.stdout.trim();
  console.log(`template changes since the last sync (${oldFull.slice(0, 12)} -> ${newFull.slice(0, 12)})`);
  if (oldFull === newFull) {
    console.log('template unchanged since the last sync');
    unchanged = true;
    return new Set();
  }
  const range = `${oldFull}..${newFull}`;
  const subjects = git(['log', '--oneline', range, '--', '.act/']).stdout.split(/\r?\n/).filter(Boolean);
  console.log(`commits touching .act/ (${subjects.length}):`);
  for (const l of subjects) console.log(`  ${l}`);
  const stat = git(['diff', '--stat=120', range, '--', ...COVERED]).stdout || '';
  console.log('diffstat, units the docs cover:');
  console.log(stat.split(/\r?\n/).filter(Boolean).map((l) => `  ${l}`).join('\n') || '  (none)');

  const names = git(['diff', '--name-only', range, '--', ...COVERED]).stdout.split(/\r?\n/).filter(Boolean);
  const units = new Map();
  for (const f of names) {
    const u = unitOf(f);
    if (!u) continue;
    const k = `${u.kind}\0${u.name}`;
    if (!units.has(k)) units.set(k, { ...u, files: [] });
    units.get(k).files.push(f);
  }
  const tokens = new Set();
  const byKind = new Map();
  for (const u of units.values()) {
    if (!byKind.has(u.kind)) byKind.set(u.kind, []);
    byKind.get(u.kind).push(u.name);
    if (u.kind !== 'config') tokens.add(u.name); // config.md is named everywhere; its keys decide
    if (!['rule file', 'coding set', 'config'].includes(u.kind)) continue;
    // rule ids and config keys named on the changed lines
    for (const f of u.files) {
      const d = git(['diff', '-U0', range, '--', f]).stdout;
      for (const l of d.split(/\r?\n/)) {
        if (!/^[+-](?![+-])/.test(l)) continue;
        for (const m of l.matchAll(/\b((?:R|CR)-[a-z]+(?:-[a-z0-9]+)+)\b/g)) tokens.add(m[1]);
        if (u.kind !== 'config') continue;
        const k = l.match(/^[+-]\s*(?:[-*]\s+)?`?([a-z][a-z0-9]*(?:-[a-z0-9]+)*)`?\s*:/);
        if (k && k[1].length > 3) tokens.add(k[1]);
        for (const m of l.matchAll(/`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g)) tokens.add(m[1]);
      }
    }
  }
  console.log('changed units:');
  if (!byKind.size) console.log('  (none)');
  for (const [kind, ns] of byKind) console.log(`  ${kind}: ${ns.join(', ')}`);
  return tokens;
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

if (!apply) {
  // plan mode: the new commit is the HEAD of the source checkout
  const tokens = reportChanges(oldCommit, 'HEAD');
  if (tokens && tokens.size) printHandPages(listHandPages(tokens));
  else if (tokens && !unchanged) console.log('hand pages to review: none (no changed units)');
}

if (apply) {
  console.log('\n== 2. update ==');
  const up = run(py, [...pyPre, ...updateArgs, '--yes'], { stdio: 'inherit' });
  if (up.status !== 0) failStep('update.py --yes');

  // apply mode: the new commit is what update.py recorded in the lock
  const histTokens = reportChanges(oldCommit, readLock().commit || null);

  console.log('\n== 3. regenerate reference ==');
  const gen = run('node', ['scripts/gen-reference.mjs'], { stdio: 'inherit' });
  if (gen.status !== 0) failStep('gen-reference.mjs');

  console.log('\n== 4. changed reference pages ==');
  const refDirs = [`${docs}/reference`, `${docs}/de/reference`];
  const names = run('git', ['diff', '--name-only', 'HEAD', '--', ...refDirs]);
  if (names.status !== 0) failStep('git diff (reference pages)');
  const changed = names.stdout.split(/\r?\n/).filter(Boolean);
  console.log(changed.length ? changed.join('\n') : '(none)');

  if (histTokens) {
    if (histTokens.size) printHandPages(listHandPages(histTokens));
    else console.log('hand pages to review: none (no changed units)');
  } else {
    // fallback without history: names of changed skills/scripts/keys on the changed reference lines
    const diff = run('git', ['diff', '-U0', 'HEAD', '--', ...refDirs]);
    const tokens = new Set();
    for (const l of diff.stdout.split(/\r?\n/)) {
      if (!/^[+-](?![+-])/.test(l)) continue;
      for (const m of l.matchAll(/`([A-Za-z][\w./:-]{3,})`/g)) tokens.add(m[1]);
      const h = l.match(/^[+-]#{2,4}\s+`?([A-Za-z][\w./:-]{3,})`?/);
      if (h) tokens.add(h[1]);
    }
    printHandPages(listHandPages(tokens));
  }
}

console.log('\n== translation report ==');
const tr = run('node', ['scripts/check-translations.mjs']);
process.stdout.write(tr.stdout || '');
process.stderr.write(tr.stderr || '');
const stale = tr.status === 0 ? 'no stale German pages' : 'German pages need attention (see report)';
console.log(`\nsync: ${apply ? 'applied' : 'plan only'}; ${moved ? 'template moved' : 'no template change reported'}; ${stale}.`);
process.exit(0);
