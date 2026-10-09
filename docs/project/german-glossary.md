# German glossary for the site

Rules for the German pages under `src/content/docs/de/` — for anyone translating or editing them, human or
assistant (`act-docs-sync` in the maintenance repo reads this file before a translation pass).

## Principle

German developers read the common English technical terms every day; translating them makes a page harder to
read, not easier. So:

1. **An established English term stays English** — in titles above all. Where a short German explanation helps,
   it goes into the text below, once, in parentheses or as a half sentence — never as a coined German word.
2. **A German word is used where German developers use it themselves** (Rollen, Regeln, Aufgaben, Einstellungen).
3. **One term, one word** across every page: the same title wording in the sidebar, the page and the links.
4. Code, commands, flags, paths, config keys and values, ids and skill/role names never change.
5. **Example chat input is translated**, since a German user types German: what the reader would say to the
   assistant (`Erstelle hier im Verzeichnis ein neues Projekt.`, `weiter`, the trigger phrases in the skills
   catalog) appears in German. Names inside it stay as rule 4 says — script, skill, rule and role names, paths,
   ids, a trigger keyword such as `feedback:` — and so do English terms per rule 1. Script output and messages
   quoted from the template stay English, because that is what the reader will see.

## Terms

| English | German page uses | Note |
| :--- | :--- | :--- |
| template | Template | the agentic-coding-template; "Vorlage" only in running prose where "Template" would repeat awkwardly |
| override(s) | Override(s) | explained once as "eigene Fassung, die die des Templates ersetzt" |
| layer(s) | Schicht(en) | common German in architecture talk |
| skill(s) | Skill(s) | |
| worker / orchestrator | Worker / Orchestrator | |
| role(s) | Rolle(n) | |
| rule(s) / rule set | Regel(n) / Regelsatz | |
| task(s) | Aufgabe(n) | the assistant's own tasks (`T<n>`) |
| inbox, backlog, board, journal | Inbox, Backlog, Board, Journal | |
| todo | Todo | (`U<n>`) |
| feedback | Feedback | the key `feedback` and the skill `act-feedback` anyway |
| scope (write scope, feedback scope) | Scope (Write Scope) | |
| tier, reasoning, cap | Tier, Reasoning, Cap | |
| hook, commit, branch, merge, push, pull request, issue | unchanged | |
| update | Update | |
| setup | Einrichtung | |
| adopt / adoption | übernehmen / Übernahme | "ein bestehendes Projekt übernehmen" |
| security check | Sicherheitsprüfung | the key `security-check` stays |
| topic(s) (rule topics) | Topic(s) | as in `.act/rules/topics/` |
| configuration | Konfiguration | |
| finding | Befund | |
| session start | Sitzungsstart | |

Change this table to change the wording for every page; the next translation pass applies it.
