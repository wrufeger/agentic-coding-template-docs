#!/usr/bin/env node
// Checks German pages against their English sources by content hash.
// No dependencies (fs/path/crypto only). Deterministic output.
//
//   node scripts/check-translations.mjs                        report; exit 1 on stale/missing/unstamped
//   node scripts/check-translations.mjs --stamp <de-file...>   write sourceHash into those German pages
//   node scripts/check-translations.mjs --stamp-all-unstamped  stamp every German page without sourceHash
//   node scripts/check-translations.mjs --stamp-catalog <page> set the source hash of every non-todo entry of
//                                                   src/translations/de/reference/<page>.md to the current English
//                                                   source (the translator has reviewed them; todo entries stay)
//   --act <dir>, --translations <dir>               other .act / catalog directory (tests)
//
// Besides the hand pages it checks the reference catalogs: per page the entries that are missing, stale
// (hash differs), still todo, and orphans (id no longer in the source). Any of the first three gives exit 1.
//
// A German page src/content/docs/de/<rel> belongs to src/content/docs/<rel>. The hash is sha256 of the
// English file with LF line endings. de/reference/ is generated from the catalogs (see below).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseCatalog, serializeMap } from './catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const enDir = path.join(root, 'src', 'content', 'docs');
const deDir = path.join(enDir, 'de');
const argv = process.argv.slice(2);

function fail(msg) {
  console.error(`check-translations: ${msg}`);
  process.exit(2);
}
const rel = (p) => path.relative(enDir, p).split(path.sep).join('/');
function walk(dir, skip = () => false) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (skip(p)) continue;
    if (e.isDirectory()) out.push(...walk(p, skip));
    else if (/\.(md|mdx)$/.test(e.name)) out.push(p);
  }
  return out;
}
const hashOf = (file) =>
  crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').replace(/^﻿/, '')).digest('hex');

// Splits a page into raw frontmatter block (without delimiters), the delimiter newline style and the body.
function split(text) {
  const m = /^---(\r?\n)([\s\S]*?)\r?\n---(?=\r?\n|$)/.exec(text);
  if (!m) return null;
  return { eol: m[1], front: m[2], head: m[0], body: text.slice(m[0].length) };
}
function readHash(file) {
  const parts = split(fs.readFileSync(file, 'utf8'));
  if (!parts) return null;
  const m = /^sourceHash:\s*["']?([0-9a-f]+)["']?\s*$/m.exec(parts.front);
  return m ? m[1] : null;
}
function stamp(file, hash) {
  const text = fs.readFileSync(file, 'utf8');
  const parts = split(text);
  if (!parts) fail(`${file} has no frontmatter`);
  const line = `sourceHash: ${hash}`;
  const front = /^sourceHash:.*$/m.test(parts.front)
    ? parts.front.replace(/^sourceHash:.*$/m, line)
    : `${parts.front}${parts.eol}${line}`;
  fs.writeFileSync(file, `---${parts.eol}${front}${parts.eol}---${parts.body}`, 'utf8');
}

const dePages = walk(deDir, (p) => p === path.join(deDir, 'reference'));
const enPages = walk(enDir, (p) => p === deDir || p === path.join(enDir, 'reference'));
const enOf = (de) => path.join(enDir, path.relative(deDir, de));

function optValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  if (i + 1 >= argv.length) fail(`${name} needs a directory argument`);
  return path.resolve(argv[i + 1]);
}
const transDir = optValue('--translations') ?? path.join(root, 'src', 'translations', 'de', 'reference');
function currentEntries() {
  const args = [path.join(root, 'scripts', 'gen-reference.mjs'), '--entries'];
  for (const o of ['--act', '--translations']) if (optValue(o)) args.push(o, optValue(o));
  return JSON.parse(execFileSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}

const catIdx = argv.indexOf('--stamp-catalog');
if (catIdx !== -1) {
  const pg = argv[catIdx + 1];
  const entries = currentEntries();
  if (!pg || pg.startsWith('--') || !entries[pg]) fail(`--stamp-catalog needs one of: ${Object.keys(entries).join(', ')}`);
  const file = path.join(transDir, `${pg}.md`);
  const have = parseCatalog(file);
  const hashes = new Map(entries[pg].map((e) => [e.id, e.hash]));
  let n = 0;
  for (const [id, e] of have) {
    if (!e.todo && hashes.has(id) && e.source !== hashes.get(id)) {
      e.source = hashes.get(id);
      n++;
    }
  }
  if (n) serializeMap(file, pg, have);
  console.log(`check-translations: stamped ${n} catalog entr${n === 1 ? 'y' : 'ies'} of ${pg}`);
  process.exit(0);
}

const stampIdx = argv.indexOf('--stamp');
if (stampIdx !== -1 || argv.includes('--stamp-all-unstamped')) {
  const targets =
    stampIdx !== -1
      ? argv.slice(stampIdx + 1).filter((a) => !a.startsWith('--')).map((f) => path.resolve(f))
      : dePages.filter((p) => !readHash(p));
  if (stampIdx !== -1 && !targets.length) fail('--stamp needs at least one German page');
  for (const de of targets) {
    if (!fs.existsSync(de)) fail(`no such file ${de}`);
    if (!de.startsWith(deDir + path.sep)) fail(`${de} is not under ${deDir}`);
    const en = enOf(de);
    if (!fs.existsSync(en)) fail(`no English source ${en} for ${de}`);
    stamp(de, hashOf(en));
    console.log(`stamped de/${rel(de).slice(3)}`);
  }
  console.log(`check-translations: stamped ${targets.length} page(s)`);
  process.exit(0);
}

const stale = [], unstamped = [], orphan = [], missing = [];
let ok = 0;
for (const de of dePages) {
  const en = enOf(de);
  if (!fs.existsSync(en)) {
    orphan.push(rel(de));
    continue;
  }
  const h = readHash(de);
  if (!h) unstamped.push(rel(de));
  else if (h !== hashOf(en)) stale.push(rel(de));
  else ok++;
}
const haveDe = new Set(dePages.map((p) => path.relative(deDir, p)));
for (const en of enPages) if (!haveDe.has(path.relative(enDir, en))) missing.push(rel(en));

for (const [label, items] of [['stale', stale], ['missing', missing], ['unstamped', unstamped], ['orphan', orphan]]) {
  if (items.length) console.log(`${label} (${items.length}):\n${items.map((i) => `  ${i}`).join('\n')}`);
}
console.log(
  `check-translations: ${ok} current, ${stale.length} stale, ${missing.length} missing, ${unstamped.length} unstamped, ${orphan.length} orphan`,
);

// ---------- reference catalogs ----------
const entries = currentEntries();
let catalogBad = 0;
const totals = { current: 0, stale: 0, missing: 0, todo: 0, orphan: 0 };
for (const pg of Object.keys(entries)) {
  const have = parseCatalog(path.join(transDir, `${pg}.md`));
  const ids = new Set(entries[pg].map((e) => e.id));
  const r = { current: 0, stale: [], missing: [], todo: [], orphan: [] };
  for (const e of entries[pg]) {
    const c = have.get(e.id);
    if (!c) r.missing.push(e.id);
    else if (c.todo) r.todo.push(e.id);
    else if (c.source !== e.hash) r.stale.push(e.id);
    else r.current++;
  }
  for (const id of have.keys()) if (!ids.has(id)) r.orphan.push(id);
  console.log(
    `catalog ${pg}: ${r.current} current, ${r.stale.length} stale, ${r.missing.length} missing, ${r.todo.length} todo, ${r.orphan.length} orphan`,
  );
  for (const k of ['stale', 'missing', 'orphan']) if (r[k].length) console.log(`  ${k}: ${r[k].join(', ')}`);
  totals.current += r.current;
  for (const k of ['stale', 'missing', 'todo', 'orphan']) totals[k] += r[k].length;
}
console.log(
  `check-translations: catalogs ${totals.current} current, ${totals.stale} stale, ${totals.missing} missing, ${totals.todo} todo, ${totals.orphan} orphan`,
);
catalogBad = totals.stale + totals.missing + totals.todo + totals.orphan;
process.exit(stale.length || missing.length || unstamped.length || catalogBad ? 1 : 0);
