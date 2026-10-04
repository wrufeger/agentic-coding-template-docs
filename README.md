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
