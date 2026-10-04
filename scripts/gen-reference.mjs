#!/usr/bin/env node
// Generates the reference pages under src/content/docs/reference/ from the project's own .act/.
// No dependencies (fs/path only). Deterministic: same input gives byte-identical output.
//
//   node scripts/gen-reference.mjs                 write the pages
//   node scripts/gen-reference.mjs --check         exit 1 and list pages that would change
//   node scripts/gen-reference.mjs --act <dir>     read another .act directory (tests)
//   node scripts/gen-reference.mjs --out <dir>     write to another directory (tests)
//   node scripts/gen-reference.mjs --translations <dir>  read the German catalogs from another directory (tests)
//   node scripts/gen-reference.mjs --skeleton      add missing catalog entries (English text + todo marker), never overwrite
//   node scripts/gen-reference.mjs --entries       print every catalog entry id with its source hash as JSON

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashText, parseCatalog, serializeMap } from './catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const check = argv.includes('--check');
function fail(msg) {
  console.error(`gen-reference: ${msg}`);
  process.exit(2);
}
function optValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  if (i + 1 >= argv.length) fail(`${name} needs a directory argument`);
  return path.resolve(argv[i + 1]);
}
const actDir = optValue('--act') ?? path.join(root, '.act');
const outDir = optValue('--out') ?? path.join(root, 'src', 'content', 'docs', 'reference');

// ---------- reading ----------
function read(rel) {
  const p = path.join(actDir, rel);
  if (!fs.existsSync(p)) fail(`missing input file ${p}`);
  return fs.readFileSync(p, 'utf8').replace(/\r\n?/g, '\n').replace(/^﻿/, '');
}
function list(rel, ext = '.md') {
  const p = path.join(actDir, rel);
  if (!fs.existsSync(p)) fail(`missing input directory ${p}`);
  return fs.readdirSync(p).filter((f) => f.endsWith(ext)).sort();
}
function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->\n?/g, '');
}
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

// Splits at lines starting with `prefix` (outside fenced blocks).
function splitSections(text, prefix = '## ') {
  const pre = [];
  const sections = [];
  let cur = null;
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (!fence && line.startsWith(prefix)) {
      cur = { heading: line.slice(prefix.length).trim(), lines: [] };
      sections.push(cur);
    } else (cur ? cur.lines : pre).push(line);
  }
  const body = (l) => l.join('\n').replace(/^\n+|\n+$/g, '');
  return { pre: body(pre), sections: sections.map((s) => ({ heading: s.heading, body: body(s.lines) })) };
}
function h1(text) {
  const m = /^# (.+)$/m.exec(text);
  return m ? m[1].trim() : '';
}
function takeSummary(body) {
  const m = /^summary:\s*(.*)\n?/m.exec(body);
  if (!m) return { summary: '', rest: body };
  return { summary: m[1].trim(), rest: (body.slice(0, m.index) + body.slice(m.index + m[0].length)).replace(/^\n+|\n+$/g, '') };
}
function firstParagraph(text) {
  const rest = text.replace(/^# .*\n/, '').replace(/^\s+/, '');
  return rest.split(/\n\s*\n/)[0].trim();
}

// ---------- escaping ----------
// Outside inline code spans and fenced blocks: `<`, `{`, `}` become entities so neither raw HTML
// nor expressions can reach the Astro build. Code spans are matched per paragraph, so a span that
// wraps across lines is still recognised. Table pipes are already escaped in the source files.
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

// ---------- language and translation catalog ----------
// Every builder runs once per language. `tr`/`trParts` return the English source text for `en`; for `de`
// the catalog text if the entry exists, is not marked todo and its source hash matches the current English
// text, else the English text plus a visible marker. Verbatim material (--help output, commands, keys,
// ids, code) never goes through `tr`.
const FALLBACK_MARK = '_(noch nicht übersetzt)_';
const DE_LABELS = {
  Source: 'Quelle',
  Summary: 'Kurzfassung',
  Overview: 'Überblick',
  Script: 'Script',
  Purpose: 'Zweck',
  Call: 'Aufruf',
  Tier: 'Tier',
  Reasoning: 'Reasoning',
  Tools: 'Werkzeuge',
  Pages: 'Seiten',
  'Tier mapping (Claude Code)': 'Tier-Zuordnung (Claude Code)',
  'Model alias': 'Modell-Alias',
  ' (reasoning one step higher)': ' (Reasoning eine Stufe höher)',
  '(no description)': '(keine Beschreibung)',
};
let lang = 'en';
const L = (s) => (lang === 'de' ? (DE_LABELS[s] ?? s) : s);
const pick = (en, de) => (lang === 'de' ? de : en);

const transDir = optValue('--translations') ?? path.join(root, 'src', 'translations', 'de', 'reference');
const catalogs = new Map(); // page -> Map id -> entry
function catalog(page) {
  if (!catalogs.has(page)) catalogs.set(page, parseCatalog(path.join(transDir, `${page}.md`)));
  return catalogs.get(page);
}
const recorded = new Map(); // page -> Map id -> { hash, text }
let curPage = '';
let fellBack = 0;
function begin(page) {
  curPage = page;
  fellBack = 0;
  if (!recorded.has(page)) recorded.set(page, new Map());
}
function lookup(id, en) {
  const rec = recorded.get(curPage);
  const hash = hashText(en);
  if (rec.has(id) && rec.get(id).hash !== hash) fail(`page ${curPage}: entry id "${id}" used for two different texts`);
  rec.set(id, { hash, text: en });
  if (lang === 'en') return { text: en, ok: true };
  const c = catalog(curPage).get(id);
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
// Entry made of a title line, an optional summary and a body: "title\nsummary: s\n\nrest".
function compose({ title, summary, rest }) {
  return title + (summary ? `\nsummary: ${summary}` : '') + (rest ? `\n\n${rest}` : '');
}
function parseParts(text) {
  const lines = text.split('\n');
  const title = lines.shift().trim();
  let summary = '';
  const m = lines.length ? /^summary:\s*(.*)$/.exec(lines[0]) : null;
  if (m) {
    summary = m[1].trim();
    lines.shift();
  }
  return { title, summary, rest: lines.join('\n').replace(/^\n+|\n+$/g, '') };
}
function trParts(id, parts) {
  const r = lookup(id, compose(parts));
  if (r.ok) return parseParts(r.text);
  return { ...parts, rest: parts.rest ? `${parts.rest}\n\n${FALLBACK_MARK}` : FALLBACK_MARK };
}

// ---------- version ----------
const versionText = read('VERSION');
const verField = (k) => (new RegExp(`^${k}=(.*)$`, 'm').exec(versionText)?.[1] ?? '').trim();
const version = verField('version') || 'unknown';
let commit = verField('commit');
const lockPath = path.join(path.dirname(actDir), '.act-lock.json');
if (!commit && fs.existsSync(lockPath)) {
  try {
    commit = JSON.parse(fs.readFileSync(lockPath, 'utf8')).template?.commit ?? '';
  } catch (e) {
    fail(`cannot parse ${lockPath}: ${e.message}`);
  }
}
const commitShort = commit ? commit.slice(0, 7) : 'unknown';
const stampEn = `Generated from template version ${version} (commit ${commitShort}) — do not edit by hand. Regenerate with ${code('npm run gen')}.`;
const stampDe = `Diese Seite wird aus dem Template ${version} (Commit ${commitShort}) erzeugt; die deutschen Texte stammen aus einem Katalog unter ${code('src/translations/de/reference/')}. Nicht von Hand ändern, neu erzeugen mit ${code('npm run gen')}.`;
const fallbackNoteDe = `Einzelne Einträge dieser Seite sind noch nicht übersetzt oder veraltet; sie stehen auf Englisch da und sind mit ${FALLBACK_MARK} markiert.`;

const DE_META = {
  index: ['Referenz', 'Referenzseiten, erzeugt aus dem Template-Stand, auf den dieses Projekt festgelegt ist.'],
  skills: ['Skills', 'Alle Skills des Templates mit ihrer einzeiligen Beschreibung.'],
  scripts: ['Scripts', 'Alle Scripts unter .act/scripts mit Zweck und Kommandozeilenhilfe.'],
  configuration: ['Konfiguration', 'Die Schlüssel in docs/ai/config.md: Abschnitte, Werte und die Prüftabelle.'],
  rules: ['Regeln', 'Die Regeln des Templates mit ihren stabilen Kennungen, nach Regeldatei gruppiert.'],
  topics: ['Topics', 'Topics: Detailseiten, auf die Regeln als topics/<name>.md verweisen.'],
  roles: ['Rollen', 'Die Worker-Rollen mit Tier, Reasoning und Werkzeugen.'],
  'coding-rules': ['Coding-Regeln', 'Die Coding-Regelsätze je Sprache oder Framework mit ihren Gruppenkennungen.'],
};

function page({ name, title, description, order, intro, body }) {
  const t = lang === 'de' ? DE_META[name][0] : title;
  const d = lang === 'de' ? DE_META[name][1] : description;
  const note = lang === 'de' ? stampDe + (fellBack ? `\n\n${fallbackNoteDe}` : '') : stampEn;
  fellBack = 0;
  return [
    '---',
    `title: ${JSON.stringify(t)}`,
    `description: ${JSON.stringify(d)}`,
    'sidebar:',
    `  order: ${order}`,
    '---',
    '',
    ':::note',
    note,
    ':::',
    '',
    ...(intro ? [intro, ''] : []),
    body.replace(/\n+$/g, ''),
    '',
  ].join('\n');
}

// ---------- skills ----------
function buildSkills() {
  begin('skills');
  const names = fs
    .readdirSync(path.join(actDir, 'skills'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(actDir, 'skills', d.name, 'SKILL.md')))
    .map((d) => d.name)
    .sort();
  const parts = names.map((n) => {
    const { data } = frontmatter(read(`skills/${n}/SKILL.md`));
    const desc = tr(n, data.description || '(no description)', 'inline');
    return `## ${n}\n\n${esc(desc)}\n\n${L('Source')}: ${code(`.act/skills/${n}/SKILL.md`)}\n`;
  });
  const lead = pick(`${names.length} skills. `, `${names.length} Skills. `);
  const intro = lead + tr('_intro', 'A skill is a reusable procedure the assistant runs on request or when its description matches the situation.', 'inline');
  return {
    count: names.length,
    text: page({
      name: 'skills',
      title: 'Skills',
      description: 'Every skill the template ships, with its one-line description.',
      order: 2,
      intro: esc(intro),
      body: parts.join('\n'),
    }),
  };
}

// ---------- scripts ----------
function buildScripts() {
  begin('scripts');
  const text = read('scripts/README.md');
  const { pre, sections } = splitSections(stripComments(text));
  const tableLines = pre.split('\n').filter((l) => l.startsWith('|'));
  const withSection = new Set();
  for (const s of sections) {
    const m = /^`([^`]+\.py)`$/.exec(s.heading);
    if (m) withSection.add(m[1]);
  }
  const split = (l) => l.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());
  const rows = tableLines.slice(2).map(split);
  const table = [
    `| ${L('Script')} | ${L('Purpose')} | ${L('Call')} |`,
    '| :--- | :--- | :--- |',
    ...rows.map(([name, purpose, call]) => {
      const bare = name.replace(/`/g, '');
      const link = withSection.has(bare) ? `[${code(bare)}](#${bare.toLowerCase().replace(/[^a-z0-9_-]/g, '')})` : esc(name);
      return `| ${link} | ${esc(tr(`table:${bare}`, purpose, 'cell'))} | ${esc(call)} |`;
    }),
  ].join('\n');
  const introEn = pre.split('\n').filter((l) => l.trim() && !l.startsWith('|') && !l.startsWith('# ')).join(' ');
  const intro = esc(tr('_intro', introEn, 'inline'));
  const parts = sections
    .filter((s) => /^`[^`]+\.py`$/.test(s.heading))
    .map((s) => `## ${s.heading.replace(/`/g, '')}\n\n${esc(s.body)}\n`);
  return {
    count: parts.length,
    text: page({
      name: 'scripts',
      title: 'Scripts',
      description: 'Every script under .act/scripts with its purpose and command-line help.',
      order: 3,
      intro,
      body: `## ${L('Overview')}\n\n${table}\n\n${parts.join('\n')}`,
    }),
  };
}

// ---------- configuration ----------
function buildConfig() {
  begin('configuration');
  const text = stripComments(read('skeleton/config.md'));
  const { pre, sections } = splitSections(text);
  const introEn = pre.replace(/^# .*\n+/, '').replace(/\n+/g, ' ').trim();
  const intro = esc(tr('_intro', introEn, 'inline'));
  const note = esc(tr('_note', `This is the template's default ${code('config.md')}; placeholders in angle brackets are filled in by ${code('init')}.`, 'inline'));
  const parts = sections.map((s) => `## ${esc(s.heading)}\n\n${esc(tr(s.heading, s.body))}\n`);
  return {
    count: sections.length,
    text: page({
      name: 'configuration',
      title: 'Configuration',
      description: 'The keys in docs/ai/config.md: sections, values and the checks table.',
      order: 4,
      intro: `${intro}\n\n${note}`,
      body: parts.join('\n'),
    }),
  };
}

// ---------- rules ----------
function ruleFileBlock(rel) {
  const text = stripComments(read(rel));
  const { pre, sections } = splitSections(text);
  const head0 = takeSummary(pre.replace(/^# .*\n+/, ''));
  const head = trParts(rel, { title: h1(text), summary: head0.summary, rest: head0.rest });
  const out = [`## ${esc(head.title)}\n`, `${L('Source')}: ${code('.act/' + rel)}\n`];
  if (head.summary) out.push(`${L('Summary')}: ${esc(head.summary)}\n`);
  if (head.rest) out.push(esc(head.rest) + '\n');
  let rules = 0;
  for (const s of sections) {
    const m = /^`(R-[a-z0-9-]+)` — (.+)$/.exec(s.heading);
    if (m) {
      rules++;
      const { summary, rest } = takeSummary(s.body);
      const p = trParts(m[1], { title: m[2], summary, rest });
      out.push(`### ${m[1]}\n\n**${esc(p.title)}**\n`);
      if (p.summary) out.push(`${L('Summary')}: ${esc(p.summary)}\n`);
      if (p.rest) out.push(esc(p.rest) + '\n');
    } else {
      const p = trParts(`${rel}#${s.heading}`, { title: s.heading, summary: '', rest: s.body });
      out.push(`### ${esc(p.title)}\n\n${esc(p.rest)}\n`);
    }
  }
  return { text: out.join('\n'), rules };
}
function buildRules() {
  begin('rules');
  const files = [
    ...list('rules/shared').map((f) => `rules/shared/${f}`),
    ...list('rules/orchestrator').map((f) => `rules/orchestrator/${f}`),
  ];
  let count = 0;
  const parts = files.map((f) => {
    const r = ruleFileBlock(f);
    count += r.rules;
    return r.text;
  });
  const lead = pick(`${count} rules in ${files.length} files. `, `${count} Regeln in ${files.length} Dateien. `);
  const intro = lead + tr('_intro', `Rule IDs ${code('R-<area>-<name>')} are stable and never reassigned. The shared files load for every role; the orchestrator files only for the main session.`, 'inline');
  return {
    count,
    text: page({
      name: 'rules',
      title: 'Rules',
      description: 'The template rules with their stable IDs, grouped by rule file.',
      order: 5,
      intro: esc(intro),
      body: parts.join('\n'),
    }),
  };
}

// ---------- topics ----------
function buildTopics() {
  begin('topics');
  const files = list('rules/topics');
  const parts = files.map((f) => {
    const text = read(`rules/topics/${f}`);
    const name = f.replace(/\.md$/, '');
    const p = trParts(name, { title: h1(text), summary: '', rest: firstParagraph(text) });
    return `## ${name}\n\n**${esc(p.title)}**\n\n${esc(p.rest)}\n\n${L('Source')}: ${code('.act/rules/topics/' + f)}\n`;
  });
  const lead = pick(`${files.length} topic pages. `, `${files.length} Topic-Seiten. `);
  const intro = lead + tr('_intro', 'A rule points to a topic when the detail is only needed in some situations.', 'inline');
  return {
    count: files.length,
    text: page({
      name: 'topics',
      title: 'Topics',
      description: 'Detail pages that rules refer to as topics/<name>.md.',
      order: 6,
      intro: esc(intro),
      body: parts.join('\n'),
    }),
  };
}

// ---------- roles ----------
function buildRoles() {
  begin('roles');
  const roles = list('agents').filter((f) => f !== 'README.md');
  const tiers = JSON.parse(read('tiers.json'));
  const cc = tiers['claude-code'] ?? { tiers: {} };
  const parts = roles.map((f) => {
    const n = f.replace(/\.md$/, '');
    const text = read(`agents/${f}`);
    const bridgeRel = `bridges/agents/${f}`;
    const bridge = fs.existsSync(path.join(actDir, bridgeRel)) ? frontmatter(read(bridgeRel)).data : {};
    const facts = [
      ['Tier', bridge.tier],
      ['Reasoning', bridge.reasoning],
      ['Tools', bridge.tools],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `- ${L(k)}: ${code(v)}`)
      .join('\n');
    const about = firstParagraph(text);
    return [
      `## ${n}`,
      '',
      esc(tr(n, bridge.description || about, 'inline')),
      '',
      facts,
      '',
      esc(tr(`${n}#about`, about)),
      '',
      `${L('Source')}: ${code('.act/agents/' + f)}`,
      '',
    ].join('\n');
  });
  const tierRows = Object.entries(cc.tiers).map(
    ([t, v]) => `| ${code(t)} | ${code(v.model)}${v.bump_reasoning ? L(' (reasoning one step higher)') : ''} |`,
  );
  const tierTable = [`## ${L('Tier mapping (Claude Code)')}`, '', `| ${L('Tier')} | ${L('Model alias')} |`, '| :--- | :--- |', ...tierRows, ''].join('\n');
  const lead = pick(`${roles.length} roles. `, `${roles.length} Rollen. `);
  const intro = lead + tr('_intro', `A role is a bounded kind of worker; its tier says how much model capacity it gets, and ${code('.act/tiers.json')} maps tiers to concrete models only at generation time.`, 'inline');
  return {
    count: roles.length,
    text: page({
      name: 'roles',
      title: 'Roles',
      description: 'The worker roles with their tier, reasoning level and tools.',
      order: 7,
      intro: esc(intro),
      body: parts.join('\n') + '\n' + tierTable,
    }),
  };
}

// ---------- coding rules ----------
function buildCoding() {
  begin('coding-rules');
  const files = list('coding');
  let groups = 0;
  const parts = files.map((f) => {
    const set = f.replace(/\.md$/, '');
    const text = stripComments(read(`coding/${f}`));
    const { pre, sections } = splitSections(text);
    const head0 = takeSummary(pre.replace(/^# .*\n+/, ''));
    const head = trParts(set, { title: h1(text), summary: head0.summary, rest: head0.rest });
    const out = [`## ${set}\n`, `**${esc(head.title)}**\n`, `${L('Source')}: ${code('.act/coding/' + f)}\n`];
    if (head.summary) out.push(`${L('Summary')}: ${esc(head.summary)}\n`);
    if (head.rest) out.push(esc(head.rest) + '\n');
    for (const s of sections) {
      const m = /^`(CR-[a-z0-9-]+)` — (.+)$/.exec(s.heading);
      if (!m) {
        const p = trParts(`${set}#${s.heading}`, { title: s.heading, summary: '', rest: s.body });
        out.push(`### ${esc(p.title)}\n\n${esc(p.rest)}\n`);
        continue;
      }
      groups++;
      const { summary, rest } = takeSummary(s.body);
      const p = trParts(m[1], { title: m[2], summary, rest });
      out.push(`### ${m[1]}\n\n**${esc(p.title)}**\n`);
      if (p.summary) out.push(`${L('Summary')}: ${esc(p.summary)}\n`);
      if (p.rest) out.push(esc(p.rest) + '\n');
    }
    return out.join('\n');
  });
  const lead = pick(`${files.length} rule sets with ${groups} groups. `, `${files.length} Regelsätze mit ${groups} Gruppen. `);
  const intro = lead + tr('_intro', `A project switches a set on in ${code('docs/project/coding_rules.md')}; group IDs ${code('CR-<set>-<name>')} are stable.`, 'inline');
  return {
    count: files.length,
    text: page({
      name: 'coding-rules',
      title: 'Coding rules',
      description: 'The coding rule sets per language or framework, with their group IDs.',
      order: 8,
      intro: esc(intro),
      body: parts.join('\n'),
    }),
  };
}

// ---------- index ----------
// Links must carry the site's base path (the link validator rejects relative ones); it is read
// from astro.config.mjs, never hard-coded here.
function siteBase() {
  const cfg = path.join(root, 'astro.config.mjs');
  if (!fs.existsSync(cfg)) return '';
  const m = /^\s*base:\s*['"]([^'"]*)['"]/m.exec(fs.readFileSync(cfg, 'utf8'));
  return m ? m[1].replace(/\/+$/, '') : '';
}
function buildIndex(c) {
  begin('index');
  // [slug, English title, German title, English count text, German count text]
  const rows = [
    ['skills', 'Skills', 'Skills', `${c.skills} skills`, `${c.skills} Skills`],
    ['scripts', 'Scripts', 'Scripts', `${c.scripts} scripts with command-line help`, `${c.scripts} Scripts mit Kommandozeilenhilfe`],
    ['configuration', 'Configuration', 'Konfiguration', `${c.configuration} sections of ${code('docs/ai/config.md')}`, `${c.configuration} Abschnitte von ${code('docs/ai/config.md')}`],
    ['rules', 'Rules', 'Regeln', `${c.rules} rules`, `${c.rules} Regeln`],
    ['topics', 'Topics', 'Topics', `${c.topics} detail pages`, `${c.topics} Detailseiten`],
    ['roles', 'Roles', 'Rollen', `${c.roles} worker roles`, `${c.roles} Worker-Rollen`],
    ['coding-rules', 'Coding rules', 'Coding-Regeln', `${c.codingRules} rule sets`, `${c.codingRules} Regelsätze`],
  ];
  const introEn = `These pages are generated from the ${code('.act/')} directory of this repository, which is the pinned template state: template version @VERSION@, commit @COMMIT@. Nothing here is written by hand, so the pages cannot drift from the template.`;
  const intro = tr('_intro', introEn, 'inline').replace(/@VERSION@/g, () => version).replace(/@COMMIT@/g, () => commitShort);
  const prefix = `${siteBase()}${lang === 'de' ? '/de' : ''}/reference`;
  return page({
    name: 'index',
    title: 'Reference',
    description: 'Reference pages generated from the template state this project is pinned to.',
    order: 1,
    intro: esc(intro),
    body: [`## ${L('Pages')}`, '', ...rows.map(([slug, tEn, tDe, nEn, nDe]) => `- [${pick(tEn, tDe)}](${prefix}/${slug}/): ${pick(nEn, nDe)}`)].join('\n'),
  });
}

// ---------- run ----------
function buildAll(l) {
  lang = l;
  const skills = buildSkills();
  const scripts = buildScripts();
  const configuration = buildConfig();
  const rules = buildRules();
  const topics = buildTopics();
  const roles = buildRoles();
  const coding = buildCoding();
  const index = buildIndex({
    skills: skills.count,
    scripts: scripts.count,
    configuration: configuration.count,
    rules: rules.count,
    topics: topics.count,
    roles: roles.count,
    codingRules: coding.count,
  });
  return {
    'skills.md': skills.text,
    'scripts.md': scripts.text,
    'configuration.md': configuration.text,
    'rules.md': rules.text,
    'topics.md': topics.text,
    'roles.md': roles.text,
    'coding-rules.md': coding.text,
    'index.md': index,
  };
}
const pagesEn = buildAll('en');
const pagesDe = buildAll('de');

// --entries: machine-readable list of every catalog entry (used by check-translations.mjs).
if (argv.includes('--entries')) {
  const dump = {};
  for (const [pg, m] of recorded) dump[pg] = [...m].map(([id, e]) => ({ id, hash: e.hash }));
  console.log(JSON.stringify(dump));
  process.exit(0);
}

// --skeleton: add an entry (English text, todo marker) for every id without one; existing entries stay as they are.
if (argv.includes('--skeleton')) {
  let added = 0;
  for (const [pg, m] of recorded) {
    const file = path.join(transDir, `${pg}.md`);
    const have = parseCatalog(file);
    const next = new Map();
    let n = 0;
    for (const [id, e] of m) {
      if (have.has(id)) next.set(id, have.get(id));
      else {
        next.set(id, { source: e.hash, todo: true, text: e.text });
        n++;
      }
    }
    for (const [id, e] of have) if (!next.has(id)) next.set(id, e); // orphans stay, check-translations reports them
    if (n || !fs.existsSync(file)) serializeMap(file, pg, next);
    added += n;
    console.log(`gen-reference: ${pg}: ${m.size} entries, ${n} added`);
  }
  console.log(`gen-reference: skeleton added ${added} entries`);
  process.exit(0);
}

const deDir = optValue('--out') ? path.join(outDir, 'de') : path.join(root, 'src', 'content', 'docs', 'de', 'reference');
const targets = [];
for (const name of Object.keys(pagesEn).sort()) {
  targets.push({ label: name, file: path.join(outDir, name), text: pagesEn[name] });
  targets.push({ label: `de/${name}`, file: path.join(deDir, name), text: pagesDe[name] });
}
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
const total = targets.length;
if (check) {
  if (changed.length) {
    console.log(`gen-reference: ${changed.length} page(s) out of date: ${changed.join(', ')}`);
    process.exit(1);
  }
  console.log(`gen-reference: all ${total} pages up to date (template ${version}, commit ${commitShort})`);
} else {
  console.log(`gen-reference: wrote ${total} pages from template ${version} (commit ${commitShort})${changed.length ? '' : ' - no change'}`);
}
