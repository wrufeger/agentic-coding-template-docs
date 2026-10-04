#!/usr/bin/env node
// Checks German pages against their English sources by content hash.
// No dependencies (fs/path/crypto only). Deterministic output.
//
//   node scripts/check-translations.mjs                        report; exit 1 on stale/missing/unstamped
//   node scripts/check-translations.mjs --stamp <de-file...>   write sourceHash into those German pages
//   node scripts/check-translations.mjs --stamp-all-unstamped  stamp every German page without sourceHash
//
// A German page src/content/docs/de/<rel> belongs to src/content/docs/<rel>. The hash is sha256 of the
// English file with LF line endings. de/reference/ is generated and not checked.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

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
process.exit(stale.length || missing.length || unstamped.length ? 1 : 0);
