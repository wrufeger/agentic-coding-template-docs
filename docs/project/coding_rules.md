<!-- act:default -->
# Coding rules

Rule sets for whoever writes or reviews code in this project — read with
`.act/scripts/rules.py`, or by hand if that script is unavailable: this file only says which sets
and groups are in use, the rule text itself lives under `.act/coding/<set>.md`.

Check a box below to turn a rule set on, uncheck one to turn it off; the boxes below were
pre-checked from what `init` detected in this project (see `docs/ai/config.md` § `stack` to
correct it), adjust freely — the project always overrides the template (`R-work-override`). A
checked set lists its groups underneath, also checked; uncheck a single group to switch it off,
optionally with a reason after " — ". A checked set is imported (`@` before its path, set at
session start), so its whole file loads: an unchecked group in it is **off** — ignore its text.

## Rule sets from the template

- [x] use: @../../.act/coding/typescript.md
  - [x] `CR-typescript-basics`
  - [x] `CR-typescript-conventions`
  - [x] `CR-typescript-module-structure`
  - [x] `CR-typescript-toolchain`
- [ ] use: .act/coding/bash.md
- [ ] use: .act/coding/csharp.md
- [ ] use: .act/coding/go.md
- [ ] use: .act/coding/java.md
- [ ] use: .act/coding/nuxt.md
- [ ] use: .act/coding/php.md
- [ ] use: .act/coding/python.md
- [ ] use: .act/coding/sql.md
- [ ] use: .act/coding/tailwind.md
- [ ] use: .act/coding/vue.md

## Overrides
<!-- act:overrides -->

<!-- replaces `CR-...`: <your version> -->

## Own rules
<!-- act:own-rules -->

<!-- one item per rule, no counterpart in the template -->

## Known deviations
<!-- act:known-deviations -->

<!-- The rule above stays the rule. An existing part of the codebase that deviates from it is named
     here instead of being silently ignored or force-fixed on sight — one line per case: where, and
     why it was checked and deliberately left as is. -->
