#!/usr/bin/env node
// Generates the package pages under src/content/docs/packages/ (English) and src/content/docs/de/packages/
// (German) from a release tag of the package repo. Reads only the tag (git show / ls-tree), never the working
// tree of the package repo. No dependencies. Deterministic: same tag gives byte-identical output.
//
//   node scripts/gen-packages.mjs                    write the pages from the newest release tag
//   node scripts/gen-packages.mjs --check            exit 1 and list pages that would change
//   node scripts/gen-packages.mjs --packages <dir>   the package repo (default ../act-packages)
//   node scripts/gen-packages.mjs --tag <tag>        a tag of that repo (default: newest YYYY-MM-DD[.n])
//   node scripts/gen-packages.mjs --out <dir>        write the English pages to another directory, German to <dir>/de (tests)
//   node scripts/gen-packages.mjs --translations <dir>  read the German catalogs from another directory (tests)
//   node scripts/gen-packages.mjs --skeleton         add missing catalog entries (English text + todo marker), never overwrite
//   node scripts/gen-packages.mjs --entries          print every catalog entry id with its source hash as JSON
//
// German package texts (Contents, title, short summary, settings questions) come from
// src/translations/de/packages/<id>.md, one catalog per package, same form as the reference catalogs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { hashText, parseCatalog, serializeMap } from './catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const check = argv.includes('--check');
function fail(msg) {
  console.error(`gen-packages: ${msg}`);
  process.exit(2);
}
function optValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  if (i + 1 >= argv.length) fail(`${name} needs an argument`);
  return argv[i + 1];
}
const pkgDir = path.resolve(optValue('--packages') ?? path.join(root, '..', 'act-packages'));
const outDir = path.resolve(optValue('--out') ?? path.join(root, 'src', 'content', 'docs', 'packages'));
const transDir = path.resolve(optValue('--translations') ?? path.join(root, 'src', 'translations', 'de', 'packages'));

const SITE_PACKAGES = 'https://github.com/wrufeger/act-packages';
const CATALOGUE = 'https://wrufeger.github.io/act-packages/';

// ---------- reading the tag ----------
function git(...args) {
  try {
    return execFileSync('git', ['-C', pkgDir, ...args], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const err = String(e.stderr ?? e.message).trim().split('\n')[0];
    throw Object.assign(new Error(err), { git: true });
  }
}
if (!fs.existsSync(pkgDir)) fail(`package repo ${pkgDir} does not exist (use --packages <dir>)`);

function newestTag() {
  const tags = git('tag', '--list')
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => /^\d{4}-\d{2}-\d{2}(\.\d+)?$/.test(t));
  const key = (t) => {
    const [d, n] = t.split('.');
    return [d, n === undefined ? 0 : Number(n)];
  };
  tags.sort((a, b) => {
    const [da, na] = key(a);
    const [db, nb] = key(b);
    return da < db ? -1 : da > db ? 1 : na - nb;
  });
  return tags.length ? tags[tags.length - 1] : null;
}
let tag = optValue('--tag');
try {
  if (tag === null) {
    tag = newestTag();
    if (!tag) fail(`no release tag of the form YYYY-MM-DD[.n] in ${pkgDir}`);
  }
} catch (e) {
  fail(`cannot read tags of ${pkgDir}: ${e.message}`);
}
let commit;
try {
  git('show-ref', '--verify', '--quiet', `refs/tags/${tag}`);
  commit = git('rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`).trim();
} catch {
  fail(`"${tag}" is not a tag in ${pkgDir}`);
}
if (!/^[0-9a-f]{40}$/.test(commit)) fail(`"${tag}" is not a tag in ${pkgDir}`);

const files = git('ls-tree', '-r', '--name-only', commit).split('\n').filter(Boolean);
const fileSet = new Set(files);
function readFile(rel) {
  return git('show', `${commit}:${rel}`).replace(/\r\n?/g, '\n').replace(/^﻿/, '');
}

// ---------- parsing ----------
function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  const data = {};
  if (!m) return { data, body: text };
  for (const line of m[1].split('\n')) {
    const k = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (k) data[k[1]] = k[2].trim();
  }
  return { data, body: text.slice(m[0].length) };
}
function splitSections(text) {
  const pre = [];
  const sections = [];
  let cur = null;
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (!fence && line.startsWith('## ')) {
      cur = { heading: line.slice(3).trim(), lines: [] };
      sections.push(cur);
    } else (cur ? cur.lines : pre).push(line);
  }
  const body = (l) => l.join('\n').replace(/^\n+|\n+$/g, '');
  return { pre: body(pre), sections: sections.map((s) => ({ heading: s.heading, body: body(s.lines) })) };
}
function listItems(body) {
  return body
    .split('\n')
    .map((l) => /^[-*]\s+(.*)$/.exec(l))
    .filter(Boolean)
    .map((m) => m[1].trim());
}
function firstSentence(text) {
  const para = text.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ').trim();
  const m = /^(.*?[.!?])(\s|$)/.exec(para);
  return m ? m[1] : para;
}

const packages = [];
const ids = [...new Set(files.map((f) => /^packages\/([^/]+)\/package\.md$/.exec(f)?.[1]).filter(Boolean))].sort();
for (const id of ids) {
  const base = `packages/${id}`;
  const { data, body } = frontmatter(readFile(`${base}/package.md`));
  if (data.id !== id) fail(`${base}/package.md in tag ${tag}: header id "${data.id ?? ''}" differs from the folder name`);
  const { pre, sections } = splitSections(body);
  const title = (/^# (.+)$/m.exec(pre)?.[1] ?? id).trim();
  const sec = Object.fromEntries(sections.map((s) => [s.heading, s.body]));
  const content = sec.Contents ?? '';
  const found = { rules: [], skills: [], agents: [], checks: [], topics: [] };
  for (const phase of ['pre-template', 'post-template']) {
    const pf = `${base}/${phase}/`;
    for (const f of files.filter((x) => x.startsWith(pf)).map((x) => x.slice(pf.length))) {
      let m;
      if ((m = /^rules\/([^/]+)\.md$/.exec(f))) {
        const rids = [...readFile(pf + f).matchAll(/^## `(R-[a-z0-9-]+)`/gm)].map((x) => x[1]);
        for (const r of rids.length ? rids : [m[1]]) found.rules.push({ name: r, phase });
      } else if ((m = /^skills\/([^/]+)\/SKILL\.md$/.exec(f))) found.skills.push({ name: m[1], phase });
      else if ((m = /^agents\/([^/]+)\.md$/.exec(f))) found.agents.push({ name: m[1], phase });
      else if ((m = /^hooks\/checks\/([^/]+)\.py$/.exec(f)) && m[1] !== '__init__') found.checks.push({ name: m[1], phase });
      else if ((m = /^topics\/([^/]+)\.md$/.exec(f))) found.topics.push({ name: m[1], phase });
    }
  }
  for (const k of Object.keys(found)) found[k].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.phase < b.phase ? -1 : 1));
  const settings = listItems(sec.settings ?? '').map((l) => {
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(l);
    return m ? { key: m[1], question: m[2].trim() } : { key: l, question: '' };
  });
  packages.push({
    id,
    data,
    title,
    content,
    summary: firstSentence(content),
    settings,
    disables: listItems(sec.disables ?? ''),
    checkModes: listItems(sec.checks ?? ''),
    found,
    installMd: fileSet.has(`${base}/install.md`),
    installPy: fileSet.has(`${base}/install.py`),
  });
}
if (!packages.length) fail(`tag ${tag} of ${pkgDir} holds no package (packages/<id>/package.md)`);

// ---------- escaping ----------
function escProse(chunk) {
  let out = '';
  let last = 0;
  const re = /(`+)([\s\S]*?[^`])\1(?!`)/g;
  const plain = (s) => s.replace(/</g, '&lt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
  let m;
  while ((m = re.exec(chunk)) !== null) {
    out += plain(chunk.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + plain(chunk.slice(last));
}
function esc(text) {
  const out = [];
  let para = [];
  let fence = false;
  const flush = () => {
    if (para.length) out.push(escProse(para.join('\n')));
    para = [];
  };
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) {
      if (!fence) flush();
      fence = !fence;
      out.push(line);
    } else if (fence) out.push(line);
    else if (line.trim() === '') {
      flush();
      out.push(line);
    } else para.push(line);
  }
  flush();
  return out.join('\n');
}
const code = (s) => '`' + s + '`';
const cell = (s) => esc(s).replace(/\|/g, '\\|').replace(/\n+/g, ' ');

// ---------- language and translation catalog ----------
const FALLBACK_MARK = '_(noch nicht übersetzt)_';
let lang = 'en';
const pick = (en, de) => (lang === 'de' ? de : en);
const catalogs = new Map();
function catalog(id) {
  if (!catalogs.has(id)) catalogs.set(id, parseCatalog(path.join(transDir, `${id}.md`)));
  return catalogs.get(id);
}
const recorded = new Map(); // package id -> Map entry id -> { hash, text }
let curPkg = '';
let fellBack = 0;
function begin(id) {
  curPkg = id;
  if (!recorded.has(id)) recorded.set(id, new Map());
}
function lookup(id, en) {
  const rec = recorded.get(curPkg);
  const hash = hashText(en);
  if (rec.has(id) && rec.get(id).hash !== hash) fail(`package ${curPkg}: entry id "${id}" used for two different texts`);
  rec.set(id, { hash, text: en });
  if (lang === 'en') return { text: en, ok: true };
  const c = catalog(curPkg).get(id);
  if (c && !c.todo && c.source === hash && c.text) return { text: c.text, ok: true };
  fellBack++;
  return { text: en, ok: false };
}
// mode: 'inline' marker follows in the same paragraph, 'block' as its own paragraph, 'cell' no marker.
function tr(id, en, mode = 'block') {
  const r = lookup(id, en);
  if (r.ok || mode === 'cell') return r.text;
  return mode === 'inline' ? `${r.text} ${FALLBACK_MARK}` : `${r.text}\n\n${FALLBACK_MARK}`;
}

// ---------- links ----------
function siteBase() {
  const cfg = path.join(root, 'astro.config.mjs');
  if (!fs.existsSync(cfg)) return '';
  const m = /^\s*base:\s*['"]([^'"]*)['"]/m.exec(fs.readFileSync(cfg, 'utf8'));
  return m ? m[1].replace(/\/+$/, '') : '';
}
const sitePrefix = () => `${siteBase()}${lang === 'de' ? '/de' : ''}`;
const tagUrl = `${SITE_PACKAGES}/releases/tag/${tag}`;
const maintainerNote =
  '<!-- Generated by scripts/gen-packages.mjs from a release tag of the package repo - do not edit by hand, ' +
  'regenerate with npm run gen:packages. German texts come from the catalog under src/translations/de/packages/. -->';
const fallbackNoteDe = `Einzelne Texte dieser Seite sind noch nicht übersetzt oder veraltet; sie stehen auf Englisch da (mit ${FALLBACK_MARK} markiert, in Tabellen ohne Markierung).`;

function page({ title, description, order, body }) {
  const note =
    lang === 'de'
      ? `Erzeugt aus dem Release-Tag [${code(tag)}](${tagUrl}) des Package-Repositorys.${fellBack ? `\n\n${fallbackNoteDe}` : ''}`
      : `Generated from release tag [${code(tag)}](${tagUrl}) of the package repo.`;
  fellBack = 0;
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    ...(order ? ['sidebar:', `  order: ${order}`] : []),
    '---',
    '',
    maintainerNote,
    '',
    ':::note',
    note,
    ':::',
    '',
    body.replace(/\n+$/g, ''),
    '',
  ].join('\n');
}

// ---------- one package ----------
const LABELS = {
  Version: 'Version',
  Tools: 'Werkzeuge',
  'Contains code': 'Enthält Code',
  'Requires template': 'Benötigt Template',
  Licence: 'Lizenz',
  Stack: 'Stack',
  Field: 'Feld',
  Value: 'Wert',
  Contents: 'Inhalt',
  Settings: 'Einstellungen',
  Disables: 'Schaltet Regeln ab',
  'Check modes': 'Prüfmodi',
  'In this package': 'Im Package',
  Rules: 'Regeln',
  Skills: 'Skills',
  Roles: 'Rollen (agents)',
  Checks: 'Prüfungen (hooks/checks)',
  Topics: 'Topics',
  none: 'keine',
  Setup: 'Einrichtung',
  Install: 'Installieren',
  Links: 'Links',
  yes: 'ja',
  no: 'nein',
};
const L = (s) => (lang === 'de' ? (LABELS[s] ?? s) : s);
const yesNo = (v) => (/^(yes|true)$/i.test(v) ? L('yes') : /^(no|false)$/i.test(v) ? L('no') : v);

function buildPackage(p) {
  begin(p.id);
  const d = p.data;
  const title = tr('title', p.title, 'cell');
  const summary = tr('summary', p.summary, 'cell');
  const prefix = sitePrefix();
  const out = [`**${esc(title)}**`, ''];
  out.push(`| ${L('Field')} | ${L('Value')} |`, '| :--- | :--- |');
  out.push(`| ${L('Version')} | ${code(d.version ?? '?')} |`);
  out.push(`| ${L('Requires template')} | ${code(d['requires-template'] ?? '?')} |`);
  out.push(`| ${L('Tools')} | ${esc(d.tools ?? '?')} |`);
  out.push(`| ${L('Licence')} | ${esc(d.license ?? '?')} |`);
  out.push(`| ${L('Contains code')} | ${yesNo(d['contains-code'] ?? '?')} |`);
  if (d.stack) out.push(`| ${L('Stack')} | ${esc(d.stack)} |`);
  out.push('');
  out.push(`## ${L('Contents')}`, '', esc(tr('contents', p.content)), '');
  if (p.settings.length) {
    out.push(`## ${L('Settings')}`, '');
    out.push(
      pick(
        'The install asks these questions once; the answers are kept in `docs/ai/config.md`.',
        'Die Installation stellt diese Fragen einmal; die Antworten stehen in `docs/ai/config.md`.',
      ),
      '',
    );
    for (const s of p.settings) out.push(`- ${code(s.key)}: ${esc(tr(`settings:${s.key}`, s.question, 'inline'))}`);
    out.push('');
  }
  if (p.disables.length) out.push(`## ${L('Disables')}`, '', ...p.disables.map((x) => `- ${esc(x)}`), '');
  if (p.checkModes.length) out.push(`## ${L('Check modes')}`, '', ...p.checkModes.map((x) => `- ${esc(x)}`), '');
  out.push(`## ${L('In this package')}`, '');
  out.push(
    pick(
      'Names as the package folders carry them. `pre-template` loads before the template\'s own files: a skill, role or topic with a template name replaces the template\'s. Rules and coding sets are only extended: a template rule id or coding set name in `pre-template` is refused. `post-template` loads after the template\'s files and extends a unit of the same name.',
      'Namen, wie die Ordner des Packages sie tragen. `pre-template` lädt vor den eigenen Dateien des Templates: Ein Skill, eine Rolle oder ein Topic mit dem Namen einer Einheit des Templates ersetzt diese. Regeln und Coding-Sätze werden nur erweitert: Eine Regel-Id oder ein Coding-Satz-Name des Templates in `pre-template` wird abgelehnt. `post-template` lädt nach den Dateien des Templates und erweitert eine Einheit gleichen Namens.',
    ),
    '',
  );
  for (const [k, label] of [['rules', 'Rules'], ['skills', 'Skills'], ['agents', 'Roles'], ['checks', 'Checks'], ['topics', 'Topics']]) {
    const items = p.found[k];
    out.push(`### ${L(label)}`, '');
    out.push(...(items.length ? items.map((i) => `- ${code(i.name)} (${i.phase})`) : [`- ${L('none')}`]), '');
  }
  out.push(`### ${L('Setup')}`, '');
  out.push(`- ${code('install.md')}: ${p.installMd ? L('yes') : L('no')}`);
  out.push(`- ${code('install.py')}: ${p.installPy ? L('yes') : L('no')}`, '');
  out.push(`## ${L('Install')}`, '');
  out.push(pick('In a project on the template:', 'In einem Projekt auf dem Template:'), '');
  out.push('```sh', `python .act/scripts/packages.py fetch ${p.id}`, '```', '');
  out.push(pick('then, in the assistant:', 'danach im Assistenten:'), '');
  out.push('```text', `/act-packages add ${p.id}`, '```', '');
  out.push(`## ${L('Links')}`, '');
  out.push(`- [${pick('All packages', 'Alle Packages')}](${prefix}/packages/)`);
  out.push(`- [${pick('Guide: packages', 'Anleitung: Packages')}](${prefix}/guides/packages/)`);
  out.push(`- [${pick('Source in the package repo', 'Quelle im Package-Repository')}](${SITE_PACKAGES}/tree/${tag}/packages/${p.id})`);
  return page({ title: p.id, description: summary, order: 0, body: out.join('\n') });
}

// ---------- overview ----------
function buildIndex() {
  const prefix = sitePrefix();
  const rows = packages.map((p) => {
    begin(p.id);
    const d = p.data;
    const summary = tr('summary', p.summary, 'cell');
    const row = [
      `[${code(p.id)}](${prefix}/packages/${p.id}/)`,
      code(d.version ?? '?'),
      cell(summary),
      cell(d.tools ?? '?'),
      yesNo(d['contains-code'] ?? '?'),
    ];
    return `| ${row.join(' | ')} |`;
  });
  const out = [];
  out.push(
    pick(
      `A package bundles rules, roles, skills and checks that a project can add to the template. These are the packages of release ${code(tag)} of the [package repo](${SITE_PACKAGES}); the [catalogue](${CATALOGUE}) shows the same release.`,
      `Ein Package bündelt Regeln, Rollen, Skills und Prüfungen, die ein Projekt zum Template hinzufügen kann. Das sind die Packages des Releases ${code(tag)} im [Package-Repository](${SITE_PACKAGES}); der [Katalog](${CATALOGUE}) zeigt dasselbe Release.`,
    ),
    '',
  );
  // Until the next template release: the package layer is in no release yet (remove with that release).
  out.push(
    pick(
      ':::caution[Packages from the next template release]',
      ':::caution[Packages ab dem nächsten Release des Templates]',
    ),
    pick(
      `The package layer (${code('packages.py')}, ${code('/act-packages')}) is in no release of the template yet: v2.6.0 and older do not have it. It comes with the next release. Until then a project needs the [update channel](${prefix}/getting-started/update/#update-channel) ${code('latest')}: set ${code('update-channel: latest')} in ${code('docs/ai/config.md')} and run ${code('act-update')}.`,
      `Die Package-Schicht (${code('packages.py')}, ${code('/act-packages')}) steckt noch in keinem Release des Templates: v2.6.0 und älter haben sie nicht. Sie kommt mit dem nächsten Release. Bis dahin braucht ein Projekt den [Update-Channel](${prefix}/getting-started/update/#update-channel) ${code('latest')}: ${code('update-channel: latest')} in ${code('docs/ai/config.md')} setzen und ${code('act-update')} ausführen.`,
    ),
    ':::',
    '',
  );
  out.push(
    `| ${pick('Package', 'Package')} | ${L('Version')} | ${pick('Contents', 'Inhalt')} | ${L('Tools')} | ${L('Contains code')} |`,
    '| :--- | :--- | :--- | :--- | :--- |',
    ...rows,
    '',
  );
  out.push(`## ${pick('Fetch and add', 'Holen und hinzufügen')}`, '');
  out.push(
    pick(
      'In a project on the template, list what the source offers, fetch a package and add it:',
      'In einem Projekt auf dem Template: ansehen, was die Quelle anbietet, ein Package holen und hinzufügen:',
    ),
    '',
  );
  out.push('```sh', 'python .act/scripts/packages.py index', 'python .act/scripts/packages.py fetch <id>', '```', '');
  out.push(pick('then, in the assistant:', 'danach im Assistenten:'), '');
  out.push('```text', '/act-packages add <id>', '```', '');
  out.push(`## ${L('Links')}`, '');
  out.push(`- [${pick('Guide: packages', 'Anleitung: Packages')}](${prefix}/guides/packages/)`);
  out.push(`- [${pick('Package repo', 'Package-Repository')}](${SITE_PACKAGES})`);
  out.push(`- [${pick('Catalogue', 'Katalog')}](${CATALOGUE})`);
  return page({
    title: pick('Packages', 'Packages'),
    description: pick('The packages of the current release: what each one contains and how to fetch it.', 'Die Packages des aktuellen Releases: was sie enthalten und wie man sie holt.'),
    order: 1,
    body: out.join('\n'),
  });
}

function buildAll(l) {
  lang = l;
  fellBack = 0;
  const pages = {};
  for (const p of packages) pages[`${p.id}.md`] = buildPackage(p);
  fellBack = 0;
  pages['index.md'] = buildIndex(); // page() reports the fallbacks of the rows built just before it
  return pages;
}

const pagesEn = buildAll('en');
const pagesDe = buildAll('de');

if (argv.includes('--entries')) {
  const dump = {};
  for (const [id, m] of recorded) dump[id] = [...m].map(([eid, e]) => ({ id: eid, hash: e.hash }));
  console.log(JSON.stringify(dump));
  process.exit(0);
}

if (argv.includes('--skeleton')) {
  let added = 0;
  for (const [id, m] of recorded) {
    const file = path.join(transDir, `${id}.md`);
    const have = parseCatalog(file);
    const next = new Map();
    let n = 0;
    for (const [eid, e] of m) {
      if (have.has(eid)) next.set(eid, have.get(eid));
      else {
        next.set(eid, { source: e.hash, todo: true, text: e.text });
        n++;
      }
    }
    for (const [eid, e] of have) if (!next.has(eid)) next.set(eid, e);
    if (n || !fs.existsSync(file)) serializeMap(file, id, next, 'package', 'gen-packages.mjs');
    added += n;
    console.log(`gen-packages: ${id}: ${m.size} entries, ${n} added`);
  }
  console.log(`gen-packages: skeleton added ${added} entries`);
  process.exit(0);
}

// ---------- writing ----------
const deDir = optValue('--out') ? path.join(outDir, 'de') : path.join(root, 'src', 'content', 'docs', 'de', 'packages');
const targets = [];
for (const name of Object.keys(pagesEn).sort()) {
  targets.push({ label: name, file: path.join(outDir, name), text: pagesEn[name] });
  targets.push({ label: `de/${name}`, file: path.join(deDir, name), text: pagesDe[name] });
}
const wanted = new Set(targets.map((t) => t.file));
const changed = [];
for (const t of targets) {
  const cur = fs.existsSync(t.file) ? fs.readFileSync(t.file, 'utf8') : null;
  if (cur !== t.text) {
    changed.push(t.label);
    if (!check) {
      fs.mkdirSync(path.dirname(t.file), { recursive: true });
      fs.writeFileSync(t.file, t.text, 'utf8');
    }
  }
}
// A page of a package that the tag no longer holds is obsolete; only files with our own mark are touched.
for (const [dir, prefix] of [[outDir, ''], [deDir, 'de/']]) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    const file = path.join(dir, f);
    if (!f.endsWith('.md') || wanted.has(file)) continue;
    if (!fs.readFileSync(file, 'utf8').includes('Generated by scripts/gen-packages.mjs')) continue;
    changed.push(`${prefix}${f} (obsolete)`);
    if (!check) fs.unlinkSync(file);
  }
}
const total = targets.length;
if (check) {
  if (changed.length) {
    console.log(`gen-packages: ${changed.length} page(s) out of date: ${changed.join(', ')}`);
    process.exit(1);
  }
  console.log(`gen-packages: all ${total} pages up to date (tag ${tag})`);
} else {
  console.log(`gen-packages: wrote ${total} pages from tag ${tag}${changed.length ? '' : ' - no change'}`);
}
