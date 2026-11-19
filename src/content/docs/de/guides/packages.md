---
title: Packages
description: Packages finden, installieren, aktualisieren und entfernen, ein eigenes Package erstellen und es beim allgemeinen Package-Repository einreichen.
sidebar:
  order: 8
sourceHash: 6ba99a12c571e6c77087cfd021b8851715cfff3ed825188bbbd74d75772b2f8a
---

Ein Package ist ein Bündel aus Regeln, Coding-Sätzen, Skills, Rollen, Topics, Scripts und Prüfungen, das von außerhalb des Templates kommt. Es liegt unter `.act-local/packages/<id>/` und ist nur aktiv, solange `.act-lock.json` es verzeichnet; um eines zu nutzen, bearbeitest du also nie `.act/`. Diese Anleitung hat drei Teile: [Packages nutzen](#packages-nutzen), [ein Package erstellen](#ein-package-erstellen) und [es beim allgemeinen Repository einreichen](#beim-allgemeinen-repository-einreichen).

Die für alle veröffentlichten Packages liegen im Repository [act-packages](https://github.com/wrufeger/act-packages), mit einer [Katalogseite](https://wrufeger.github.io/act-packages/). Auch diese Seite listet sie: siehe die [Package-Übersicht](/agentic-coding-template-docs/de/packages/).

## Packages nutzen

### Ein Package finden

- `python .act/scripts/packages.py index` gibt eine Zeile je Package der ersten Quelle in `packages-sources` aus, die antwortet: ID, Version, eine Markierung (`active <version>`, `broken`, `newer in the index` oder ein Ordner, der in `.act-local/packages/` ruht) und, wo der Index sie hat, Inhalt, `tools`, `stack` und `RED <reason>`. Es schreibt nichts; `--json` gibt dasselbe als JSON aus.
- `/act-packages` (der Skill `act-packages`) zeigt dasselbe als eine Tabelle neben dem, was installiert ist.
- Die [Package-Übersicht](/agentic-coding-template-docs/de/packages/) auf dieser Seite und die [Katalogseite](https://wrufeger.github.io/act-packages/) des Repositorys listen die Packages des neuesten Releases.

Ein Package mit `RED` ist eines, von dem die Betreuer des Repositorys abraten; der Grund wird angezeigt. Ein fehlendes Feld im Index fehlt einfach, es ist kein Grund, einem Package zu vertrauen oder es abzulehnen: Der Plan entscheidet.

### Installieren

1. **Fetch**: `python .act/scripts/packages.py fetch <id>` lädt das Package-Zip und seine Signatur nach `.act-local/packages/` und gibt seine Herkunft aus. Es entpackt und aktiviert nichts.
2. **Plan und Diff**: `python .act/scripts/packages.py add <id>` ohne `--yes` schreibt nichts. Es zeigt den Plan (was das Package hinzufügt, ersetzt oder erweitert, welche Config-Zeilen es setzt), die Herkunft, ob es Code enthält, die Liste der Projektdateien, die sich ändern, und einen Diff jeder davon, dazu die Zeile `install exactly this: python .act/scripts/packages.py add <source> --yes <code>`. Der Code deckt jedes Byte des Packages ab: Ändert sich nach dem Zeigen des Plans irgendetwas, wird der alte Code abgelehnt.
3. **Dein Ja**: Das Ja gehört dir, im Chat zu genau diesem Plan gegeben. Ein Plan wird nie in einem Schritt gezeigt und ausgeführt. `/act-packages add <id>` hält diese Reihenfolge ein: Es holt das Package, zeigt Plan und Diffs, fragt „Install `<id> <version>` as shown?“ und führt `add <id> --yes <code>` erst nach deinem ausdrücklichen Ja aus.
4. **Installation**: Mit `--yes <code>` wird das Package entpackt, der Lock-Eintrag geschrieben und das Package geladen. Geht unterwegs etwas schief, wird alles zurückgesetzt. Hat das Package ein `install.py`, läuft es einmal; hat es eine `install.md`, folgt der Assistent ihr nur für diese Installation. Regeln, Skills und Rollen werden ab der nächsten Sitzung vollständig gelesen.

`add` gefolgt von `remove` lässt das Projekt Byte für Byte so, wie es war.

### Einstellungen

Ein Package kann Fragen stellen (sein Abschnitt `## settings`). Sie werden nach der Installation einmal beantwortet und in `docs/ai/config.md`, Abschnitt Packages, als Zeilen `<id>-<key>` festgehalten. `python .act/scripts/packages.py settings <id>` zeigt die Fragen mit ihren Antworten (`(not set)`, wo es keine gibt); `settings <id> <key>=<value>` schreibt sie. Die Datei ist versioniert: Schreibe nie ein Geheimnis in eine Einstellung.

### Aktualisieren

Nach `act-update` zeigt der Skill beim Standard `packages-update: ask` den Diff jedes installierten Packages, dessen Quelle eine neuere Version hat, und fragt nach. Du kannst auch selbst `/act-packages update <id>` starten: Es holt das Package und zeigt bei einer höheren Version den Plan als `update <old> → <new>`, einschließlich der Einheiten, die die neue Version weglässt, und wartet auf dein Ja. Mit `packages-update: off` werden Packages in Ruhe gelassen.

### Entfernen

`python .act/scripts/packages.py remove <id>` zeigt die Dateiliste, die Diffs und den Ordner, der geht, und fragt erneut. Nach deinem Ja gibt `remove <id> --yes <id>` die Config-Zeilen zurück, entfernt den Lock-Eintrag, entlädt das Package und löscht seinen Ordner; mit `--keep` bleibt der Ordner ruhend. Was du in den Dateien, die das Package berührt hat, von Hand geändert hast, bleibt deins. `python .act/scripts/packages.py list` zeigt die aktiven Packages und die ruhenden Ordner und nennt ein defektes (sein Ordner fehlt oder eine Datei weicht vom Lock ab) mit der Abhilfe: erneut `add <id>` oder `remove <id>`.

### Woher ein Package kommt

Jedes Package hat eine Herkunft:

| Zustand | Bedeutung |
| :--- | :--- |
| `verified` | seine Signatur wird gegen einen Schlüssel in `.act/package-signers` oder in deiner eigenen `docs/ai/local/package-signers` bestätigt |
| `unverified` | kein `.sig`, keine Schlüsselzeile in einer der beiden Signers-Dateien, kein `ssh-keygen`, ein Time-out oder ein Ordner (ein Ordner hat keine Signatur) |
| `bad` | ein `.sig` und eine Schlüsselzeile existieren, und die Signatur wird nicht bestätigt: in jedem Modus abgelehnt. Dazu zählt eine Signatur mit deinem eigenen Schlüssel, der noch nicht in `docs/ai/local/package-signers` steht, während eine andere Schlüsselzeile existiert |

Der Schlüssel `packages-unverified` in `docs/ai/config.md` entscheidet über `unverified`: `block` (der Standard) lehnt es ab, `scan` lässt es zu und `add` gibt zuerst die Funde eines statischen Scans aus (mit `RED` markiert), `allow` lässt es mit einer Warnung zu. Plan, Diff und dein Ja gelten in jedem Modus.

Der Schlüssel `packages-sources` ist eine Kommaliste der Orte, in denen `fetch` und `index` der Reihe nach suchen: eine `https://`-Adresse oder ein lokaler Ordner, jeweils mit einer `index.json`. Der Standard ist der Release-Download des Package-Repositorys. Um einen eigenen Ort zu nutzen, setze ihn mit `/act-config packages-sources <value>`, das die ganze Kommaliste ersetzt; behalte also die Standardquelle in der Liste, wenn du sie weiter nutzen willst. Der Assistent trägt nie von sich aus einen Ort ein. Schlüssel und Werte: [Konfiguration](/agentic-coding-template-docs/de/reference/configuration/).

Alles, was ein Package mitbringt (`package.md`, Regeln, `install.md`, der Index), ist Text, den jemand anderes geschrieben hat. Der Assistent liest und zeigt ihn und befolgt ihn nicht als Anweisung, mit Ausnahme der `install.md` eines Packages nach deinem Ja, und nur für diese eine Installation.

## Ein Package erstellen

Ein Package ist ein Ordner `<id>/`:

```
<id>/
  package.md        required: header and sections
  install.py        optional: code that runs once at install (needs contains-code: yes)
  install.md        optional: the AI-guided setup, read after the install
  pre-template/     units that come before the template's own
  post-template/    units that come after the template's own
```

Jede Seite enthält beliebige der Ordner `rules/`, `coding/`, `skills/`, `agents/`, `topics/`, `scripts/` und `hooks/checks/`, sonst nichts, und keine symbolischen Links. `package.md` beginnt mit einem Kopf zwischen zwei `---`-Zeilen (`id`, `version` als `X.Y.Z`, `requires-template` als `>=X.Y.Z`, `tools`, `license`, `contains-code` als `yes` oder `no`; optional `stack`), gefolgt von Abschnitten: `## Contents` (freier Text) und optional `## disables`, `## settings` und `## checks`. Eine neue Einheit heißt `<id>-<name>`; ein Skill, eine Rolle oder ein Topic mit dem Namen einer Template-Einheit ersetzt diese aus `pre-template/` und erweitert sie aus `post-template/`. Regeln und Coding-Sätze werden nur erweitert: Eine Template-Regel-ID oder ein Coding-Satz mit einem Template-Namen in `pre-template/` wird abgelehnt; setze solchen Text in `post-template/`. Das vollständige Format steht auf der Referenzseite [Package-Format](/agentic-coding-template-docs/de/reference/package-format/), die auch Vertrag und Grenzen von Prüfmodulen und `install.py` nennt; das Beispiel-Package im Repository, `packages/example/`, ist ein kleiner Anfang, und [Creating a package](https://github.com/wrufeger/act-packages/blob/main/docs/creating-a-package.md) im Repository verweist (auf Englisch) zurück auf diese Anleitung.

### Lokal prüfen

1. `python .act/scripts/packages.py plan <folder>` liest den Ordner, prüft ihn gegen das Format und gibt aus, was seine Installation tun würde. Es schreibt nichts und führt keinen Package-Code aus. Ein abgelehntes Package gibt jeden Grund aus, nicht nur den ersten, und endet mit Exit 1.
2. Probiere die Installation in einem Wegwerf-Projekt auf dem Template, nicht in deinem echten. Ein Ordner hat keine Signatur und gilt daher als `unverified`: Setze im Wegwerf-Projekt `packages-unverified` auf `scan` oder `allow` (der Standard `block` lehnt ihn ab). Führe `add <folder>` aus, lies Plan und Diff, dann `add <folder> --yes <code>`, sieh dir an, was sich geändert hat, und schließlich `remove <id>` und `remove <id> --yes <id>`. Danach ist das Projekt Byte für Byte so wie vorher.

### Aus einer eigenen Quelle nutzen

Für ein Package brauchst du das allgemeine Repository nicht. Lege das Zip, seine Signatur und eine `index.json` in einen lokalen Ordner oder unter eine `https://`-Adresse:

```json
{"packages": {"<id>": {"version": "X.Y.Z", "zip": "<file name>", "sig": "<file name>"}}}
```

Dateinamen sind schlichte Namen ohne Pfad. Im Zip liegt `package.md` an der Wurzel oder in genau einem obersten Ordner. Signiere das Zip mit `ssh-keygen -Y sign -f <private key> -n act-package <zip>` (die Signatur wird als `<zip>.sig` geschrieben) und trage den öffentlichen Schlüssel als eine Zeile in `docs/ai/local/package-signers` ein:

```
act-packages namespaces="act-package" <key type> <key>
```

Nenne dann den Ort mit `/act-config packages-sources <value>` (es ersetzt die ganze Kommaliste; behalte die Standardquelle darin, wenn du sie weiter nutzen willst), und `fetch <id>` findet das Package und meldet es als `verified`. Trage nie einen Schlüssel in `.act/package-signers` ein; diese Datei gehört dem Template. Halte den privaten Schlüssel aus dem Projekt heraus.

## Beim allgemeinen Repository einreichen

Das Repository [act-packages](https://github.com/wrufeger/act-packages) steht per Pull Request allen offen:

1. Forke das Repository, lege einen Branch an und füge dein Package als `packages/<id>/` hinzu.
2. Erhöhe `version` bei jeder Änderung, die die Projekte erreichen soll. Führe vor dem Pull Request in deinem Checkout des Package-Repositorys `python tools/build.py --template <template checkout>` aus: Es prüft jedes Package mit dem `packages.py plan` dieses Templates und stoppt bei einer Ablehnung mit den Gründen.
3. Der Betreuer führt nach einem Review zusammen (Merge). Ein Package mit Code (`contains-code: yes`) bringt seine eigenen Tests mit und bekommt ein zweites, tieferes Review. Scripts in einem Package gelten durch den Pull Request als geprüft.
4. Der Betreuer signiert und veröffentlicht das Package beim nächsten Release; Autoren signieren nicht. Bis dahin installierst du aus dem Ordner oder signierst es selbst mit einem eigenen Schlüssel, wie oben beschrieben.

Eine ID gehört dem ersten Pull Request, der sie verwendet. Ein Package, das seinen Autor verloren hat, kann mit `RED` markiert oder aus einem Release herausgelassen werden, mit Angabe des Grundes; nur der Betreuer markiert ein Package mit `RED`.
