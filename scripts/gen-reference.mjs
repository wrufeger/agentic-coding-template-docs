#!/usr/bin/env node
// Generates the reference pages under src/content/docs/reference/ from the project's own .act/.
// No dependencies (fs/path only). Deterministic: same input gives byte-identical output.
//
//   node scripts/gen-reference.mjs                 write the pages
//   node scripts/gen-reference.mjs --check         exit 1 and list pages that would change
//   node scripts/gen-reference.mjs --act <dir>     read another .act directory (tests)
//   node scripts/gen-reference.mjs --out <dir>     write to another directory (tests)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
const stamp = `Generated from template version ${version} (commit ${commitShort}) — do not edit by hand. Regenerate with ${code('npm run gen')}.`;

function page({ title, description, order, intro, body }) {
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    'sidebar:',
    `  order: ${order}`,
    '---',
    '',
    ':::note',
    stamp,
    ':::',
    '',
    ...(intro ? [intro, ''] : []),
    body.replace(/\n+$/g, ''),
    '',
  ].join('\n');
}

// ---------- skills ----------
function buildSkills() {
  const names = fs
    .readdirSync(path.join(actDir, 'skills'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(actDir, 'skills', d.name, 'SKILL.md')))
    .map((d) => d.name)
    .sort();
  const parts = names.map((n) => {
    const { data } = frontmatter(read(`skills/${n}/SKILL.md`));
    return `## ${n}\n\n${esc(data.description || '(no description)')}\n\nSource: ${code(`.act/skills/${n}/SKILL.md`)}\n`;
  });
  return {
    count: names.length,
    text: page({
      title: 'Skills',
      description: 'Every skill the template ships, with its one-line description.',
      order: 2,
      intro: `${names.length} skills. A skill is a reusable procedure the assistant runs on request or when its description matches the situation.`,
      body: parts.join('\n'),
    }),
  };
}

// ---------- scripts ----------
function buildScripts() {
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
    '| Script | Purpose | Call |',
    '| :--- | :--- | :--- |',
    ...rows.map(([name, purpose, call]) => {
      const bare = name.replace(/`/g, '');
      const link = withSection.has(bare) ? `[${code(bare)}](#${bare.toLowerCase().replace(/[^a-z0-9_-]/g, '')})` : esc(name);
      return `| ${link} | ${esc(purpose)} | ${esc(call)} |`;
    }),
  ].join('\n');
  const intro = esc(pre.split('\n').filter((l) => l.trim() && !l.startsWith('|') && !l.startsWith('# ')).join(' '));
  const parts = sections
    .filter((s) => /^`[^`]+\.py`$/.test(s.heading))
    .map((s) => `## ${s.heading.replace(/`/g, '')}\n\n${esc(s.body)}\n`);
  return {
    count: parts.length,
    text: page({
      title: 'Scripts',
      description: 'Every script under .act/scripts with its purpose and command-line help.',
      order: 3,
      intro,
      body: `## Overview\n\n${table}\n\n${parts.join('\n')}`,
    }),
  };
}

// ---------- configuration ----------
function buildConfig() {
  const text = stripComments(read('skeleton/config.md'));
  const { pre, sections } = splitSections(text);
  const intro = esc(pre.replace(/^# .*\n+/, '').replace(/\n+/g, ' ').trim());
  const parts = sections.map((s) => `## ${esc(s.heading)}\n\n${esc(s.body)}\n`);
  return {
    count: sections.length,
    text: page({
      title: 'Configuration',
      description: 'The keys in docs/ai/config.md: sections, values and the checks table.',
      order: 4,
      intro: `${intro}\n\nThis is the template's default ${code('config.md')}; placeholders in angle brackets are filled in by ${code('init')}.`,
      body: parts.join('\n'),
    }),
  };
}

// ---------- rules ----------
function ruleFileBlock(rel) {
  const text = stripComments(read(rel));
  const title = h1(text);
  const { pre, sections } = splitSections(text);
  const head = takeSummary(pre.replace(/^# .*\n+/, ''));
  const out = [`## ${esc(title)}\n`, `Source: ${code('.act/' + rel)}\n`];
  if (head.summary) out.push(`Summary: ${esc(head.summary)}\n`);
  if (head.rest) out.push(esc(head.rest) + '\n');
  let rules = 0;
  for (const s of sections) {
    const m = /^`(R-[a-z0-9-]+)` — (.+)$/.exec(s.heading);
    if (m) {
      rules++;
      const { summary, rest } = takeSummary(s.body);
      out.push(`### ${m[1]}\n\n**${esc(m[2])}**\n`);
      if (summary) out.push(`Summary: ${esc(summary)}\n`);
      if (rest) out.push(esc(rest) + '\n');
    } else {
      out.push(`### ${esc(s.heading)}\n\n${esc(s.body)}\n`);
    }
  }
  return { text: out.join('\n'), rules };
}
function buildRules() {
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
  return {
    count,
    text: page({
      title: 'Rules',
      description: 'The template rules with their stable IDs, grouped by rule file.',
      order: 5,
      intro: `${count} rules in ${files.length} files. Rule IDs ${code('R-<area>-<name>')} are stable and never reassigned. The shared files load for every role; the orchestrator files only for the main session.`,
      body: parts.join('\n'),
    }),
  };
}

// ---------- topics ----------
function buildTopics() {
  const files = list('rules/topics');
  const parts = files.map((f) => {
    const text = read(`rules/topics/${f}`);
    return `## ${f.replace(/\.md$/, '')}\n\n**${esc(h1(text))}**\n\n${esc(firstParagraph(text))}\n\nSource: ${code('.act/rules/topics/' + f)}\n`;
  });
  return {
    count: files.length,
    text: page({
      title: 'Topics',
      description: 'Detail pages that rules refer to as topics/<name>.md.',
      order: 6,
      intro: `${files.length} topic pages. A rule points to a topic when the detail is only needed in some situations.`,
      body: parts.join('\n'),
    }),
  };
}

// ---------- roles ----------
function buildRoles() {
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
      .map(([k, v]) => `- ${k}: ${code(v)}`)
      .join('\n');
    return [
      `## ${n}`,
      '',
      esc(bridge.description || firstParagraph(text)),
      '',
      facts,
      '',
      esc(firstParagraph(text)),
      '',
      `Source: ${code('.act/agents/' + f)}`,
      '',
    ].join('\n');
  });
  const tierRows = Object.entries(cc.tiers).map(
    ([t, v]) => `| ${code(t)} | ${code(v.model)}${v.bump_reasoning ? ' (reasoning one step higher)' : ''} |`,
  );
  const tierTable = ['## Tier mapping (Claude Code)', '', '| Tier | Model alias |', '| :--- | :--- |', ...tierRows, ''].join('\n');
  return {
    count: roles.length,
    text: page({
      title: 'Roles',
      description: 'The worker roles with their tier, reasoning level and tools.',
      order: 7,
      intro: `${roles.length} roles. A role is a bounded kind of worker; its tier says how much model capacity it gets, and ${code('.act/tiers.json')} maps tiers to concrete models only at generation time.`,
      body: parts.join('\n') + '\n' + tierTable,
    }),
  };
}

// ---------- coding rules ----------
function buildCoding() {
  const files = list('coding');
  let groups = 0;
  const parts = files.map((f) => {
    const text = stripComments(read(`coding/${f}`));
    const { pre, sections } = splitSections(text);
    const head = takeSummary(pre.replace(/^# .*\n+/, ''));
    const out = [`## ${f.replace(/\.md$/, '')}\n`, `**${esc(h1(text))}**\n`, `Source: ${code('.act/coding/' + f)}\n`];
    if (head.summary) out.push(`Summary: ${esc(head.summary)}\n`);
    if (head.rest) out.push(esc(head.rest) + '\n');
    for (const s of sections) {
      const m = /^`(CR-[a-z0-9-]+)` — (.+)$/.exec(s.heading);
      if (!m) {
        out.push(`### ${esc(s.heading)}\n\n${esc(s.body)}\n`);
        continue;
      }
      groups++;
      const { summary, rest } = takeSummary(s.body);
      out.push(`### ${m[1]}\n\n**${esc(m[2])}**\n`);
      if (summary) out.push(`Summary: ${esc(summary)}\n`);
      if (rest) out.push(esc(rest) + '\n');
    }
    return out.join('\n');
  });
  return {
    count: files.length,
    text: page({
      title: 'Coding rules',
      description: 'The coding rule sets per language or framework, with their group IDs.',
      order: 8,
      intro: `${files.length} rule sets with ${groups} groups. A project switches a set on in ${code('docs/project/coding_rules.md')}; group IDs ${code('CR-<set>-<name>')} are stable.`,
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
  const rows = [
    ['skills', 'Skills', `${c.skills} skills`],
    ['scripts', 'Scripts', `${c.scripts} scripts with command-line help`],
    ['configuration', 'Configuration', `${c.configuration} sections of ${code('docs/ai/config.md')}`],
    ['rules', 'Rules', `${c.rules} rules`],
    ['topics', 'Topics', `${c.topics} detail pages`],
    ['roles', 'Roles', `${c.roles} worker roles`],
    ['coding-rules', 'Coding rules', `${c.codingRules} rule sets`],
  ];
  return page({
    title: 'Reference',
    description: 'Reference pages generated from the template state this project is pinned to.',
    order: 1,
    intro: `These pages are generated from the ${code('.act/')} directory of this repository, which is the pinned template state: template version ${version}, commit ${commitShort}. Nothing here is written by hand, so the pages cannot drift from the template.`,
    body: ['## Pages', '', ...rows.map(([slug, title, n]) => `- [${title}](${siteBase()}/reference/${slug}/): ${n}`)].join('\n'),
  });
}

// ---------- run ----------
const skills = buildSkills();
const scripts = buildScripts();
const configuration = buildConfig();
const rules = buildRules();
const topics = buildTopics();
const roles = buildRoles();
const coding = buildCoding();
const pages = {
  'skills.md': skills.text,
  'scripts.md': scripts.text,
  'configuration.md': configuration.text,
  'rules.md': rules.text,
  'topics.md': topics.text,
  'roles.md': roles.text,
  'coding-rules.md': coding.text,
};
pages['index.md'] = buildIndex({
  skills: skills.count,
  scripts: scripts.count,
  configuration: configuration.count,
  rules: rules.count,
  topics: topics.count,
  roles: roles.count,
  codingRules: coding.count,
});

// German twins: same generated body (it stays English), German title/description and note.
const deMeta = {
  'index.md': ['Referenz', 'Referenzseiten, erzeugt aus dem Vorlagenstand, auf den dieses Projekt festgelegt ist.'],
  'skills.md': ['Skills', 'Alle Skills der Vorlage mit ihrer einzeiligen Beschreibung.'],
  'scripts.md': ['Scripts', 'Alle Scripts unter .act/scripts mit Zweck und Kommandozeilenhilfe.'],
  'configuration.md': ['Konfiguration', 'Die Schlüssel in docs/ai/config.md: Abschnitte, Werte und die Prüftabelle.'],
  'rules.md': ['Regeln', 'Die Regeln der Vorlage mit ihren stabilen Kennungen, nach Regeldatei gruppiert.'],
  'topics.md': ['Themen', 'Detailseiten, auf die Regeln als topics/<name>.md verweisen.'],
  'roles.md': ['Rollen', 'Die Worker-Rollen mit Stufe, Denktiefe und Werkzeugen.'],
  'coding-rules.md': ['Coding-Regeln', 'Die Coding-Regelsätze je Sprache oder Framework mit ihren Gruppenkennungen.'],
};
const deNote = `Diese Referenz wird aus der Vorlage erzeugt und ist englisch; Stand: Vorlage ${version} (Commit ${commitShort}). Nicht von Hand ändern, neu erzeugen mit ${code('npm run gen')}.`;
function germanTwin(name, text) {
  const [title, description] = deMeta[name];
  let out = text
    .replace(/^title: .*$/m, () => `title: ${JSON.stringify(title)}`)
    .replace(/^description: .*$/m, () => `description: ${JSON.stringify(description)}`)
    .replace(stamp, () => deNote);
  if (name === 'index.md') out = out.split(`${siteBase()}/reference/`).join(`${siteBase()}/de/reference/`);
  return out;
}
const deDir = optValue('--out') ? path.join(outDir, 'de') : path.join(root, 'src', 'content', 'docs', 'de', 'reference');
const targets = [];
for (const name of Object.keys(pages).sort()) {
  targets.push({ label: name, file: path.join(outDir, name), text: pages[name] });
  targets.push({ label: `de/${name}`, file: path.join(deDir, name), text: germanTwin(name, pages[name]) });
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
