#!/usr/bin/env node
// Checks the external links of the "Further reading" pages: reachable, redirected, dead, review due.
// No dependencies (fs/path and the built-in fetch only).
//
//   node scripts/check-links.mjs                 check both further-reading pages (English and German)
//   node scripts/check-links.mjs <file...>       check the external links of these Markdown files instead
//   --max-age <days>                             age after which an assessment counts as due (default 183)
//
// Every distinct http(s) URL is fetched once (HEAD, then GET where HEAD is refused), redirects are
// followed by hand up to 10 hops so the chain can be shown. Result per URL:
//   ok        2xx without a redirect
//   moved     2xx at the end of a redirect chain - update the link to the final address
//   blocked   401/403/429 - the server answers but refuses automated clients; check it in a browser
//   dead      404/410, any other 4xx, 5xx, or no answer at all (after one retry)
// A list item whose date (YYYY-MM-DD) is older than --max-age days is reported as "due": its assessment
// is to be rewritten. Exit 1 when at least one link is dead, else 0; moved, blocked and due only report.
// Internal links are left to starlight-links-validator in the build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultFiles = [
  path.join(root, 'src', 'content', 'docs', 'guides', 'further-reading.md'),
  path.join(root, 'src', 'content', 'docs', 'de', 'guides', 'further-reading.md'),
];
const TIMEOUT_MS = 20000;
const MAX_HOPS = 10;
const CONCURRENCY = 6;
const USER_AGENT = 'Mozilla/5.0 (compatible; agentic-coding-template-docs link check; +https://github.com/wrufeger/agentic-coding-template-docs)';

const argv = process.argv.slice(2);
let maxAgeDays = 183;
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--max-age') {
    maxAgeDays = Number(argv[++i]);
    if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0) {
      console.error(`check-links: --max-age needs a number of days, got ${argv[i]}`);
      process.exit(2);
    }
  } else if (argv[i] === '--help' || argv[i] === '-h') {
    console.log('usage: node scripts/check-links.mjs [--max-age <days>] [<file.md> ...]');
    process.exit(0);
  } else files.push(path.resolve(argv[i]));
}
const targets = files.length ? files : defaultFiles;

// Collects external links per file with their line, and the newest date of each list item.
const linkRe = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>/g;
const dateRe = /\b(\d{4}-\d{2}-\d{2})\b/g;
const uses = new Map(); // url without fragment -> [{ file, line }]
const due = [];
const today = new Date();
for (const file of targets) {
  if (!fs.existsSync(file)) {
    console.error(`check-links: no such file ${file}`);
    process.exit(2);
  }
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const relFile = path.relative(root, file).split(path.sep).join('/');
  let inFence = false;
  lines.forEach((text, i) => {
    if (/^\s*(```|~~~)/.test(text)) inFence = !inFence;
    if (inFence) return;
    let found = false;
    for (const m of text.matchAll(linkRe)) {
      const url = (m[1] ?? m[2]).replace(/#.*$/, '');
      if (!uses.has(url)) uses.set(url, []);
      uses.get(url).push({ file: relFile, line: i + 1 });
      found = true;
    }
    if (found && /^\s*[-*] /.test(text)) {
      const prose = text.replace(linkRe, ' '); // a date inside a URL is not a check date
      const dates = [...prose.matchAll(dateRe)].map((d) => d[1]).sort();
      const newest = dates.at(-1);
      if (newest) {
        const age = (today - new Date(`${newest}T00:00:00Z`)) / 86400000;
        if (age > maxAgeDays) due.push(`${relFile}:${i + 1} checked ${newest} (${Math.floor(age)} days ago)`);
      }
    }
  });
}

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'manual',
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

// Follows redirects by hand; returns { status, chain, error }.
async function probe(url) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    let res;
    try {
      res = await request(current, 'HEAD');
      if ([403, 404, 405, 429, 501].includes(res.status) || res.status >= 500) {
        await res.body?.cancel();
        res = await request(current, 'GET');
      }
    } catch {
      try {
        res = await request(current, 'GET');
      } catch (err) {
        return { status: 0, chain, error: err.cause?.code ?? err.name ?? String(err) };
      }
    }
    await res.body?.cancel();
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      const next = new URL(location, current).href;
      chain.push({ status: res.status, to: next });
      current = next;
      continue;
    }
    return { status: res.status, chain };
  }
  return { status: 0, chain, error: `more than ${MAX_HOPS} redirects` };
}

// Not a move: a chain that only adds or drops a trailing slash, or one from a site's root ("/") to a page on
// the same host (a docs site sending its root to the current start page; linking that page would go stale).
function isMove(url, last) {
  if (url.replace(/\/+$/, '') === last.replace(/\/+$/, '')) return false;
  const from = new URL(url);
  const to = new URL(last);
  return !(from.pathname === '/' && !from.search && from.host === to.host);
}

function classify(result, url) {
  const s = result.status;
  if (s >= 200 && s < 300) {
    const last = result.chain.at(-1)?.to;
    return last && isMove(url, last) ? 'moved' : 'ok';
  }
  if ([401, 403, 429].includes(s)) return 'blocked';
  return 'dead';
}

async function check(url) {
  let result = await probe(url);
  if (classify(result, url) === 'dead') result = await probe(url); // one retry against a passing hiccup
  return { url, ...result, kind: classify(result, url) };
}

const urls = [...uses.keys()];
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.push(await check(url));
    }
  }),
);
results.sort((a, b) => urls.indexOf(a.url) - urls.indexOf(b.url));

const counts = { ok: 0, moved: 0, blocked: 0, dead: 0 };
for (const r of results) {
  counts[r.kind]++;
  const where = uses.get(r.url).map((u) => `${u.file}:${u.line}`).join(', ');
  const status = r.status || r.error;
  if (r.kind === 'ok') console.log(`ok      ${r.status} ${r.url}`);
  else if (r.kind === 'moved') {
    const hops = r.chain.map((c) => c.status).join('>');
    console.log(`moved   ${hops}>${r.status} ${r.url} -> ${r.chain.at(-1).to}  (${where})`);
  } else console.log(`${r.kind.padEnd(7)} ${status} ${r.url}  (${where})`);
}
for (const d of due) console.log(`due     ${d}`);
console.log(
  `check-links: ${results.length} links, ${counts.ok} ok, ${counts.moved} moved, ${counts.blocked} blocked, ` +
    `${counts.dead} dead, ${due.length} due (older than ${maxAgeDays} days)`,
);
process.exit(counts.dead ? 1 : 0);
