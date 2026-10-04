// Shared helpers for the German translation catalogs under src/translations/de/reference/<page>.md.
// No dependencies. A catalog is plain Markdown, one section per entry:
//
//   ## <id>
//   <!-- source: <first 16 hex of sha256 of the English source text> -->
//   <!-- todo: translate -->        (only while the text is still the English placeholder)
//   German text, may span lines and contain Markdown
//
// Entry ids may contain any character except a line break; "## " lines inside fenced blocks are text.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const TODO_MARK = '<!-- todo: translate -->';

export function hashText(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex').slice(0, 16);
}

// Returns Map id -> { source, todo, text }; a missing file is an empty catalog.
export function parseCatalog(file) {
  const entries = new Map();
  if (!fs.existsSync(file)) return entries;
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').replace(/^﻿/, '');
  let cur = null;
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (!fence && line.startsWith('## ')) {
      cur = { id: line.slice(3).trim(), lines: [] };
      if (entries.has(cur.id)) throw new Error(`${file}: duplicate entry id "${cur.id}"`);
      entries.set(cur.id, cur);
    } else if (cur) cur.lines.push(line);
  }
  for (const [id, e] of entries) {
    let source = '';
    let todo = false;
    const body = [];
    let head = true;
    for (const line of e.lines) {
      const s = /^<!-- source: ([0-9a-f]+) -->$/.exec(line.trim());
      if (head && s) source = s[1];
      else if (head && line.trim() === TODO_MARK) todo = true;
      else {
        if (line.trim() !== '' || body.length) head = false;
        body.push(line);
      }
    }
    entries.set(id, { source, todo, text: body.join('\n').replace(/^\n+|\n+$/g, '') });
  }
  return entries;
}

function entryBlock(id, source, todo, text) {
  return [`## ${id}`, `<!-- source: ${source} -->`, ...(todo ? [TODO_MARK] : []), text.replace(/^\n+|\n+$/g, ''), ''].join('\n');
}

export function writeCatalog(file, page, entries) {
  const head = [
    `<!-- German catalog for the reference page "${page}". One section per entry: the id is the heading, the`,
    'source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.',
    'Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and',
    'scripts/check-translations.mjs; see README "Editing the site". -->',
    '',
  ].join('\n');
  const body = entries.map((e) => entryBlock(e.id, e.source, e.todo, e.text)).join('\n');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${head}\n${body}`, 'utf8');
}

// Same as writeCatalog, but starting from the parsed map (keeps the order of the map).
export function serializeMap(file, page, map) {
  writeCatalog(file, page, [...map].map(([id, e]) => ({ id, ...e })));
}
