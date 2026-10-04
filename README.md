# Agentic Coding Template: documentation site

Source of the documentation site for the agentic coding template, built with Astro and Starlight, in English
and German. The reference pages under `reference/` are generated from the template; the other pages are
written by hand, German pages are translations of the English ones.

```
npm install                    # once
npm run dev                    # local preview
npm run build                  # production build (checks the generated reference first)
npm run gen                    # regenerate the reference pages from the template
npm run check:translations     # report stale German pages
npm run sync                   # plan: what a template update would change
npm run sync -- --apply        # update the template state, regenerate, list pages to review
```

`sync` calls `.act/scripts/update.py` (pass `--source <path>` to use another template checkout) and ends with
the translation report.

Deploy: a GitHub Actions workflow builds and publishes on every push to `main`. Publishing happens only on
the owner's word.

## Editing the site

- Pages are Markdown files under `src/content/docs/` (English, root locale) and `src/content/docs/de/` (German,
  same relative path). Frontmatter: `title`, `description`, `sidebar.order`.
- The sidebar is `sidebar` in `astro.config.mjs`, one `autogenerate` directory per group. A new page is a new
  file in a group folder; a new group is a new folder plus an entry there with a German label
  (`translations.de`).
- The landing page is `src/content/docs/index.mdx` (and `de/index.mdx`).
- Reference pages are generated: change the template or `scripts/gen-reference.mjs`, then `npm run gen`.
- After changing an English page, `npm run check:translations` lists the stale German page; after updating it,
  run `node scripts/check-translations.mjs --stamp <de-file>`.
- German wording follows `docs/project/german-glossary.md`.
- Preview with `npm run dev` (http://localhost:4321/agentic-coding-template-docs/), check with `npm run build`.
- Look and feel (title, logo, social links, custom CSS) are set in `astro.config.mjs`, see the Starlight docs.
