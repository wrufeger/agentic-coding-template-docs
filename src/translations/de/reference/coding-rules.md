<!-- German catalog for the reference page "coding-rules". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## bash
<!-- source: 5ccd706af7f08593 -->
Coding-Regeln — Bash
summary: Strict Mode, Quoting, Exit-Codes, Fehlermeldungen, shellcheck, Fallstricke

Regeln für Bash-Skripte. Gruppen-IDs (`CR-bash-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-bash-basics
<!-- source: 3031ea346436f142 -->
Strict Mode, Quoting, Fehlerbehandlung, shellcheck
summary: set -euo pipefail, Quoting, bewusste Exit-Codes, Fehler auf stderr, shellcheck, Fallstricke

- Jedes Skript beginnt mit `set -euo pipefail` als erster ausführbarer Zeile.
- Variablen konsequent quoten (`"$var"`), besonders Pfade, die Leerzeichen enthalten können.
- Exit-Codes bewusst setzen (`exit 0`/`exit 1`/bestimmte Codes), statt den Status des letzten Befehls
  stillschweigend durchzureichen.
- Argumente und Eingaben vor der Verwendung prüfen (Anzahl, ob ein Pfad existiert); Fehler auf stderr
  melden und benennen, was woran gescheitert ist — nicht nur ein pauschales „Fehler“.
- `shellcheck` als Standard-Linter des Stacks vor jedem Commit ausführen; dessen Warnungen nicht pauschal
  unterdrücken.
- Fallstricke:
  - Die Ausgabe von `ls` nie in einer Schleife auswerten — Globbing oder `find ... -print0` mit
    `read -d ''` verwenden.
  - Das Ergebnis von `cd` prüfen (`cd dir || exit 1`); sonst laufen die folgenden Befehle im falschen
    Verzeichnis.

## CR-bash-script-shape
<!-- source: 01029fe0b544ff6a -->
Ein Skript, ein Zweck
summary: Kopfkommentar, Funktionen statt Duplikation, Skripte mit nur einem Zweck

- Mit einem Kopfkommentar beginnen, der Zweck, einen Beispielaufruf und die erwartete Ausgabe bzw. das
  Exit-Verhalten nennt.
- Wiederverwendbare Abschnitte als Funktionen schreiben, statt dieselbe Befehlsfolge zu kopieren.
- Ein Skript, ein klar benannter Zweck — kein Mehrzweck-Skript mit Modus-Flags für unzusammenhängende
  Aufgaben.

## c
<!-- source: 2bc81f0e98a0ca10 -->
Coding-Regeln — C
summary: Sprachstandard, Speicherbesitz und Puffer, geprüfte Rückgabewerte, Undefined Behavior, Warnungen und Sanitizer

Regeln nur für C; sie gelten nicht für C++, dessen Idiome sich unterscheiden (RAII, Container, Exceptions) und
das einen eigenen Satz hat. Gruppen-IDs (`CR-c-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe,
deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-c-basics
<!-- source: 8a32fa5b2cd41323 -->
Standard, Build und Warnungen
summary: fester Sprachstandard, strenge Warnungen als Fehler, clang-tidy, Build-System wie konfiguriert

- Den C-Standard aus der Build-Konfiguration nehmen (`-std=c11`, `c17`, `c23` oder `CMAKE_C_STANDARD`) und
  nichts Neueres verwenden: `nullptr`, `constexpr`, `bool` als Schlüsselwort und `typeof` gibt es erst in C23;
  `_Generic`, `_Static_assert` und `<threads.h>` brauchen C11. Ohne konfigurierten Standard C11 annehmen.
- Keine C++-Gewohnheiten in C schreiben: kein Cast des `malloc`-Ergebnisses, kein `bool`/`true` ohne
  `<stdbool.h>` vor C23, und parameterlose Funktionen als `f(void)` deklarieren, nicht als `f()`.
- Warnungen ernst nehmen (`-Wall -Wextra`; MSVC `/W4`): eine im Code beheben, nicht mit einem Cast oder
  einem Pragma zum Schweigen bringen. `-Werror` (`/WX`) einmal vorschlagen; Build-Flags nie ungefragt setzen
  (`R-code-tools`).
- `clang-tidy` als üblichen Linter und `clang-format` als üblichen Formatter ausführen, oder was das Projekt
  konfiguriert hat (`R-code-tools`); beim vorhandenen Build-System bleiben (CMake, Make, Meson) und keines
  ungefragt installieren.

## CR-c-memory
<!-- source: 09f029bfd22e3c44 -->
Puffer und Besitz
summary: jeder Puffer trägt seine Größe, ein Besitzer pro Allokation, keine unbegrenzten String-Funktionen

- Einen Puffer zusammen mit seiner Größe übergeben und die Größe vor dem Schreiben prüfen; nie `gets`,
  `strcpy`, `strcat` oder `sprintf` in einen Puffer fester Größe — `snprintf` und `memcpy` mit ausdrücklicher
  Länge verwenden und Strings selbst abschließen, wo die Funktion es nicht tut (`strncpy`).
- Das Ergebnis jedes `malloc`/`calloc`/`realloc` vor der Verwendung auf `NULL` prüfen. `realloc` schreibt in
  eine temporäre Variable, damit der alte Zeiger bei einem Fehlschlag nicht verloren geht.
- Allokationsgrößen aus dem Ziel berechnen (`malloc(n * sizeof *p)`) und die Multiplikation vorher auf
  Überlauf prüfen (`calloc` übernimmt das).
- Jede Allokation hat genau einen Besitzer, benannt in einem Kommentar oder im Kopfkommentar der Funktion:
  wer sie freigibt und wer sie nur borgen darf. Einmal freigeben, den Zeiger danach auf `NULL` setzen, wo er
  im Gültigkeitsbereich bleibt, und auf jedem Fehlerpfad freigeben (ein einziger `goto cleanup`-Ausgang ist
  das anerkannte Idiom).
- Nie einen Zeiger auf eine lokale (Stack-)Variable zurückgeben oder speichern.

## CR-c-correctness
<!-- source: 40e4206a1a995d98 -->
Rückgabewerte und Undefined Behavior
summary: keine ignorierten Fehler, Integer-Überlauf, signed/unsigned und Strict Aliasing

- Den Rückgabewert jedes Aufrufs prüfen, der scheitern kann (`fopen`, `fread`, `fwrite`, `fclose`,
  Abschneiden bei `snprintf`, `read`/`write`, `pthread_*`); eine Fehlermeldung nennt den Aufruf, sein Argument
  und `errno` (`strerror`).
- Ein Überlauf bei vorzeichenbehafteten Ganzzahlen ist Undefined Behavior: die Operanden vor der Rechnung
  prüfen, nicht danach. `size_t` für Größen und Indizes verwenden und signed nie ohne ausdrückliche
  Umwandlung mit unsigned vergleichen. Schiebeweiten, Division durch null und `INT_MIN / -1` prüfen.
- Ein Objekt nicht über einen Zeiger eines unverträglichen Typs lesen (Strict Aliasing) und keine
  uninitialisierte Variable; für Type Punning `memcpy` verwenden und bei der Deklaration initialisieren.
- Ungenutzte Parameter und Durchfallen im `switch` ausdrücklich kennzeichnen (`(void)x;`, ein Kommentar oder
  in C23 `[[fallthrough]]`), nicht stillschweigend.

## CR-c-tests
<!-- source: 9c4597b4ddb9a329 -->
Tests unter Sanitizern
summary: Tests laufen mit ASan und UBSan, Test Runner wie konfiguriert

- Die Test-Suite mindestens einmal mit `-fsanitize=address,undefined -fno-omit-frame-pointer` ausführen
  (MSVC: `/fsanitize=address`); ein Sanitizer-Bericht ist ein Fehlschlag und wird nie unterdrückt, um grün zu
  werden (`R-code-checks-intact`).
- Das Test-Framework verwenden, das das Projekt eingerichtet hat (Unity, Check, CMocka oder schlicht `ctest`);
  keines ungefragt hinzufügen. Den Fehlerpfad jeder Allokation und jedes I/O-Aufrufs abdecken, nicht nur den
  Normalfall.

## ci
<!-- source: 8bc56d261eba1154 -->
Coding-Regeln — CI
summary: gepinnte Actions, minimale Berechtigungen, injektionssichere Workflows, Secrets, Caching und Concurrency für GitHub Actions und GitLab CI

Regeln für Pipeline-Definitionen: GitHub Actions (`.github/workflows/*.yml`) und GitLab CI
(`.gitlab-ci.yml`). Eine Pipeline läuft mit den Secrets und dem Schreibzugriff des Projekts, daher erweitern
diese Regeln die Sicherheitsregeln (`R-safe-no-secret-log`, `R-safe-no-secret-cli`, `R-safe-approval`).
Gruppen-IDs (`CR-ci-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr
gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-ci-supply-chain
<!-- source: 53f2b75e8ede89d2 -->
Pinnen, was die Pipeline ausführt
summary: Actions und Includes auf einen Commit-SHA gepinnt, minimale Token-Berechtigungen, automatische Updates

- GitHub: jede Action eines Dritten auf den vollständigen 40-stelligen Commit-SHA pinnen, die Version als
  Kommentar dahinter (`uses: actions/checkout@<sha> # v4.2.2`). Einen Tag oder Branch kann sein Eigentümer
  verschieben, und dann läuft unbemerkt neuer Code in deiner Pipeline. Prüfen, dass der SHA zum
  Upstream-Repository gehört.
- GitLab: `include: project`/`remote` und CI-Images auf einen Commit-SHA oder einen Image-Digest pinnen,
  nie auf `main` oder `latest`.
- `permissions:` ganz oben in jedem Workflow auf `contents: read` setzen und pro Job nur erweitern, wo ein
  Job es braucht (`pull-requests: write`, `id-token: write`). Den Standardumfang des Tokens nie der
  Repository-Einstellung überlassen.
- Kurzlebige OIDC-Zugangsdaten (`id-token: write`, GitLab `id_tokens:`) langlebigen Cloud-Schlüsseln
  vorziehen, die als Secrets liegen.
- Pins mit dem Updater des Projekts aktuell halten (Dependabot oder Renovate), nicht von Hand; ein Pin, den
  niemand aktualisiert, wird zu einer ungepatchten Abhängigkeit.
- `actions/checkout` mit `persist-credentials: false`, außer ein späterer Schritt pusht.

## CR-ci-injection
<!-- source: ea3e4e5d9d30c001 -->
Nicht vertrauenswürdige Eingaben erreichen nie eine Shell oder einen privilegierten Lauf
summary: keine Event-Daten inline in run:, kein pull_request_target mit Fork-Code, keine Secrets für Forks

- Nie `${{ github.event.* }}`, `github.head_ref`, den Titel oder Text eines Issues/PR, einen Branch-Namen
  oder eine Commit-Nachricht direkt in ein `run:`-Skript schreiben — der Text wird vor dem Parsen durch die
  Shell eingesetzt und wird zu Code. Stattdessen über `env:` durchreichen und `"$VAR"` verwenden. GitLab
  expandiert Variablen zur Laufzeit in der Shell, dort liegt die Gefahr also in unquotierter Verwendung:
  `"$CI_COMMIT_MESSAGE"`, `"$CI_MERGE_REQUEST_TITLE"` und Branch-Namen in `script:` quoten, nie per `eval` ausführen oder
  in einen Befehl einsetzen.
- `pull_request_target` und `workflow_run` laufen im Kontext des Basis-Repositorys mit Secrets und einem
  beschreibbaren Token. Dort nie den Head des Pull Requests auschecken oder ausführen
  (`ref: ${{ github.event.pull_request.head.sha }}`) und nie dessen Skripte oder Build-Schritt laufen lassen.
  Für alles, was beigesteuerten Code baut, schlichtes `pull_request` verwenden.
- Fork-Pull-Requests bekommen keine Secrets: keine Prüfung entwerfen, die bei `pull_request` eines braucht;
  sie in einen unprivilegierten Build und einen getrennten, geprüften privilegierten Schritt aufteilen.
- Ein Deploy- oder Release-Job läuft nur auf geschützten Branches und Tags (`if:` auf dem Ref, GitLab
  `rules:` mit `$CI_COMMIT_REF_PROTECTED`), hinter der geforderten Freigabe des Environments.

## CR-ci-secrets
<!-- source: d96c257076856f3b -->
Secrets bleiben aus Logs, Argumenten und Artefakten heraus
summary: Secrets über Secret Store und Umgebung, maskiert, nie ausgegeben, nie in Cache oder Artefakten

- Secrets aus dem Secret Store der Plattform nehmen (GitHub `secrets`/Environment-Secrets, GitLab maskierte
  und geschützte CI/CD-Variablen) und einem Schritt über `env:` übergeben, nicht als Argument.
- Nie ein Secret oder einen daraus abgeleiteten Wert mit `echo` ausgeben, und kein `set -x`/CI-Debug-Trace in
  einem Job mit Secrets. Einen berechneten Wert mit `::add-mask::` maskieren, bevor er ausgegeben wird.
- Kein Secret in ein Artefakt, einen Cache, ein Build-Argument (`docker build --build-arg`) oder einen
  hochgeladenen Bericht; sie überdauern den Job und sind für mehr Leute lesbar als das Secret.
- Ein Secret, das in ein Log gelangt ist, gilt als kompromittiert und wird rotiert, nicht nur aus dem Log
  gelöscht.

## CR-ci-runtime
<!-- source: e5dff1267d4372a6 -->
Caching, Concurrency, Timeouts
summary: Caches nach Lockfile benannt, Concurrency-Gruppen, Job-Timeouts, dieselben Prüfungen wie lokal

- Einen Cache über den Hash der Lockfile schlüsseln (`hashFiles('**/package-lock.json')`, GitLab
  `cache:key:files`), nie über einen festen String; heruntergeladene Abhängigkeiten cachen, nicht die
  Build-Ausgabe nicht vertrauenswürdiger Branches.
- `concurrency:` mit `cancel-in-progress: true` für Pull-Request-Prüfungen setzen; nie einen laufenden Deploy
  oder Release abbrechen — dafür eine Gruppe ohne Abbruch vergeben. GitLab: `interruptible: true` und
  `resource_group` für Deploys.
- `timeout-minutes:` (GitLab `timeout:`) an jedem Job setzen; der Standard der Plattform liegt bei Stunden.
- CI führt dieselben Befehle aus, die das Projekt für die lokale Nutzung dokumentiert (`docs/ai/config.md`,
  `R-code-tools`) — keine Prüfung, die nur in der Pipeline existiert. Eine fehlschlagende Prüfung wird im
  Code behoben, nicht übersprungen oder auf `continue-on-error` gesetzt (`R-code-checks-intact`).
- GitLab: `rules:` verwenden, nicht das veraltete `only:`/`except:`.

## cpp
<!-- source: 882454465321623c -->
Coding-Regeln — C++
summary: Sprachstandard, RAII und Besitz, const und Rule of Zero, Warnungen und Sanitizer, CMake und Tests

Regeln nur für C++; sie gelten nicht für C, dessen Code mit manueller Speicherverwaltung und C-Idiomen
geschrieben wird und das einen eigenen Satz hat. Gruppen-IDs (`CR-cpp-<name>`) sind stabil und werden nie neu
vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-cpp-basics
<!-- source: f2add71de13bc60d -->
Standard, Build und Warnungen
summary: Standard aus dem Build, davon abhängige Features, strenge Warnungen, clang-tidy, CMake

- Den Standard aus der Build-Konfiguration nehmen (`CMAKE_CXX_STANDARD`, `-std=c++17`, `20`, `23`) und
  nichts Neueres verwenden. Je Standard: `std::optional`, `std::variant`, `std::string_view` und Structured
  Bindings sind C++17; Concepts, Ranges, `std::span` und `std::format` sind C++20 (`std::format` braucht
  zudem eine aktuelle Standardbibliothek); `std::expected` und `std::print` sind C++23. Ohne konfigurierten
  Standard C++17 annehmen.
- Warnungen ernst nehmen (`-Wall -Wextra -Wpedantic`; MSVC `/W4`): eine im Code beheben, nicht mit einem
  Cast oder einem Pragma zum Schweigen bringen. `-Werror` (`/WX`) einmal vorschlagen; Build-Flags nie
  ungefragt setzen (`R-code-tools`).
- `clang-tidy` als üblichen Linter und `clang-format` als üblichen Formatter ausführen, oder was das Projekt
  konfiguriert hat (`R-code-tools`). CMake ist das übliche Build-System; das verwenden, das das Projekt hat
  (Make, Meson, Bazel), und keines ungefragt installieren.
- Kein C in C++ schreiben: kein `malloc`/`free`, keine C-Casts, kein `NULL` (`nullptr` verwenden) und keine
  rohen Arrays, wo `std::array`, `std::vector` oder `std::string` passen.

## CR-cpp-ownership
<!-- source: 8a17387d8c244d69 -->
RAII, kein rohes new und delete
summary: Ressourcen gehören Objekten, Smart Pointer, Rule of Zero

- Jede Ressource (Speicher, Datei, Lock, Handle) gehört einem Objekt, das sie in seinem Destruktor freigibt
  (RAII). Kein rohes `new`/`delete`: `std::make_unique` (Standard) oder `std::make_shared` (nur bei wirklich
  geteiltem Besitz), Container oder `std::lock_guard`/`std::scoped_lock` verwenden.
- Ein roher Zeiger oder eine Referenz ist nicht besitzend und geliehen; nie darüber `delete` aufrufen und
  nie länger als die Lebensdauer des Besitzers behalten. Keine Referenz und keinen `std::string_view` auf
  eine lokale Variable oder ein Temporary zurückgeben.
- Rule of Zero: Eine Klasse, die nur RAII-Member hält, deklariert keine der speziellen Memberfunktionen.
  Muss eines von Destruktor, Kopieren oder Verschieben geschrieben werden, alle fünf definieren oder löschen
  (Rule of Five); Move-Operationen `noexcept` markieren.
- Exceptions nicht über eine C-Schnittstelle laufen lassen und keinen Thread unbehandelt verlassen lassen;
  dem vorhandenen Fehlerstil des Projekts folgen (Exceptions oder `std::expected`/Fehlercodes), statt beide
  zu mischen.

## CR-cpp-correctness
<!-- source: b41b59d04920fd5e -->
const, Typen und Undefined Behavior
summary: const als Standard, explizite Konstruktoren, keine ungeprüften Casts, Invalidierung von Containern

- `const` als Standard für Variablen, Memberfunktionen und Parameter; große schreibgeschützte Argumente per
  `const&`, kleine per Wert übergeben. Konstruktoren mit einem Argument `explicit` und Überschreibungen
  `override` markieren.
- `static_cast` und Verwandte nur einsetzen, wo nötig; keine C-Casts und nie `reinterpret_cast` oder einen
  Cast, der `const` entfernt, ohne einen Kommentar, warum das sicher ist.
- Signed-Überlauf, `operator[]` außerhalb des Bereichs, Verwendung nach einem Move und die Verwendung eines
  Iterators nach einer Änderung des Containers sind Undefined Behavior: bei nicht vertrauenswürdiger Eingabe
  `.at()` verwenden oder Grenzen prüfen, und ein verschobenes Objekt nur zum Zuweisen wiederverwenden.
- Mit geschweiften Klammern oder bei der Deklaration initialisieren; `enum class` dem schlichten `enum`
  vorziehen.

## CR-cpp-tests
<!-- source: 896428e639470083 -->
Tests unter Sanitizern
summary: GoogleTest oder Catch2 über CTest, ASan und UBSan im Testlauf

- Das Test-Framework verwenden, das das Projekt eingerichtet hat (GoogleTest oder Catch2 sind die übliche
  Wahl), ausgeführt über `ctest`; keines ungefragt hinzufügen.
- Die Suite mindestens einmal mit `-fsanitize=address,undefined -fno-omit-frame-pointer` ausführen; ein
  Sanitizer-Bericht ist ein Fehlschlag und wird nie unterdrückt, um grün zu werden
  (`R-code-checks-intact`).

## csharp
<!-- source: 353516e5996fb867 -->
Coding-Regeln — C#
summary: Nullable-Kontext, async-Konventionen, Fehlerbehandlung, Analyzer, DI, Bibliothekscode

Regeln für C#-Projekte. Gruppen-IDs (`CR-csharp-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-csharp-basics
<!-- source: 912e974f283d9801 -->
Nullable-Kontext, async, Fehlerbehandlung, Analyzer
summary: Nullable aktiviert, Async-Suffix, kein async void, kein Blockieren auf Tasks, using, Exceptions

- Den Nullable-Kontext (`<Nullable>enable</Nullable>`) projektweit eingeschaltet lassen; die dabei
  entstehenden Warnungen nicht unterdrücken.
- Asynchrone Methoden mit dem Suffix `Async` benennen und `Task`/`Task<T>` zurückgeben.
- `async void` nie außerhalb von Event-Handlern verwenden — stattdessen `async Task`, sonst werden
  Exceptions verschluckt.
- `.Result`/`.Wait()` auf Tasks vermeiden; wer so auf einen Task blockiert, riskiert in synchronen
  Kontexten einen Deadlock.
- Jede `IDisposable`-Ressource ausschließlich über `using`/`await using` verwalten.
- Exceptions für Ausnahmefälle verwenden, nicht für den regulären Kontrollfluss — für erwartbare
  Fehlerfälle einen Rückgabetyp (`Result<T>`/`bool`) erwägen; wo immer eine Exception geworfen wird,
  nennt ihre Meldung, was woran gescheitert ist.
- `dotnet format` und die Analyzer-Regeln (`.editorconfig`, Abschnitt `dotnet_diagnostic`) als
  Standard-Linting/statische Analyse des Stacks verwenden; in jedem Projekt einrichten, ausführen, was
  installiert ist.

## CR-csharp-conventions
<!-- source: ea7611f7c92f8945 -->
var, Records, ein Typ pro Datei
summary: var nur bei offensichtlichem Typ, Records für Value Objects, ein öffentlicher Typ pro Datei

- `var` nur verwenden, wenn der Typ aus der rechten Seite offensichtlich ist, sonst den Typ ausschreiben.
- Records für unveränderliche Value Objects/DTOs verwenden, Klassen für Objekte mit Identität und
  Verhalten.
- Ein öffentlicher Typ pro Datei, der Dateiname entspricht dem Typnamen.

## CR-csharp-dependency-injection
<!-- source: 42475e085b79c7d9 -->
Constructor Injection
summary: Constructor Injection, kein Service Locator

- Abhängigkeiten über den Konstruktor injizieren; kein versteckter Zugriff über einen Service Locator.

## CR-csharp-library-code
<!-- source: 9b8d2f37173ea8e5 -->
ConfigureAwait in Bibliothekscode
summary: ConfigureAwait(false) in Code ohne UI-Kontext

- In Bibliothekscode ohne Abhängigkeit von einem UI-Kontext `ConfigureAwait(false)` verwenden.

## css
<!-- source: 73280f9bb79c1553 -->
Coding-Regeln — CSS
summary: Custom-Property-Tokens, geringe Spezifität, kein !important, Mobile-first, stylelint

Regeln für handgeschriebenes CSS (und SCSS) in Projekten, die kein Tailwind verwenden. Diesen Satz nicht in
einem Projekt ankreuzen, das `tailwind` ankreuzt: Utility-Klassen und eine handgeschriebene Kaskade ziehen in
entgegengesetzte Richtungen, und die Regeln unten würden denen von Tailwind widersprechen (`@apply`,
getrennte CSS-Dateien). Gruppen-IDs (`CR-css-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe,
deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-css-tokens
<!-- source: 27f21aba7fc01c0f -->
Design Tokens als Custom Properties
summary: ein Ort für Farben, Abstände und Schrift; keine wiederholten Literale; Dark Mode durch Neuzuordnung

- Farben, Abstände, Radien, Schriftgrößen und z-index-Ebenen einmal als Custom Properties auf `:root`
  definieren (`--color-surface`, `--space-2`) und sonst überall `var(--…)` verwenden; ein Hex-Wert oder
  `13px`, der sich in Regelrümpfen wiederholt, ist ein fehlendes Token.
- Tokens nach Rolle benennen (`--color-text-muted`), nicht nach Wert (`--grey-600`) oder Ort
  (`--header-blue`).
- Dark Mode und Themes ordnen dieselben Tokens unter einem Selektor oder `prefers-color-scheme` neu zu; nie
  ein zweiter Satz hartkodierter Farben in parallelen Regeln.
- `var()` nur dort einen Fallback geben, wo die Eigenschaft absichtlich fehlen kann, nicht um einen
  Tippfehler im Namen zu verbergen.

## CR-css-cascade
<!-- source: 3cfcf384995c8b7d -->
Spezifität und die Kaskade
summary: flache Selektoren, kein !important, keine ID-Selektoren, Layer für die Reihenfolge, ein Namensschema

- Selektoren flach halten: eine Klasse, höchstens eine weitere Ebene (`.card__title`, `.nav a`). Keine
  `#id`-Selektoren, keine Ketten aus drei oder mehr Teilen, keine Klassen mit Elementbezug (`div.card`).
- Kein `!important`. Gewinnt eine Regel nicht, die Spezifität der konkurrierenden Regel senken oder die
  Quellen mit `@layer` ordnen (seit 2022 in allen aktuellen Browsern unterstützt); eine Ausnahme für ein
  Utility, das gewinnen muss, wird an der Deklaration dokumentiert.
- Ein Namensschema wählen (BEM oder was das Projekt schon verwendet) und dabei bleiben; in einer Datei nicht
  mehrere Schemata mischen.
- Über Klassen stylen, nie über DOM-Struktur, die eine Markup-Änderung brechen würde
  (`div > div:nth-child(3)`).
- Kein `outline: none` ohne einen sichtbaren Ersatz über `:focus-visible`.

## CR-css-layout
<!-- source: ada2743baa0e42a4 -->
Layout und Responsivität
summary: Mobile-first mit min-width-Queries, Flex/Grid, relative Einheiten, logische Eigenschaften

- Die Basisregeln für den kleinsten Bildschirm schreiben und für größere `@media (min-width: …)` ergänzen;
  Breakpoints kommen aus Tokens oder einer Liste, nicht aus pro Komponente erfundenen Zahlen.
- Flexbox und Grid für das Layout verwenden, `gap` für Abstände zwischen Elementen; keine Floats und keine
  festen Höhen, die Text abschneiden.
- Text und Abstände in `rem`/`em` bemessen, nicht in `px`, damit die Schrifteinstellungen der Nutzer
  weiter wirken; `px` ist für Rahmen und Haarlinien in Ordnung.
- Logische Eigenschaften (`margin-inline`, `padding-block`) im neuen Code bevorzugen, wenn das Projekt
  Rechts-nach-links-Schrift unterstützt.
- Aussagen zur Browser-Unterstützung gegen die `browserslist` oder die genannten Ziele des Projekts prüfen,
  bevor ein neues Feature verwendet wird (Container Queries, `:has()`, Nesting); nicht annehmen, dass die
  neueste Syntax verfügbar ist.

## CR-css-toolchain
<!-- source: b5de53db0120aba2 -->
Lint- und Format-Tooling
summary: standardmäßig stylelint, Formatter des Projekts, SCSS nur wenn das Projekt es schon nutzt

- `stylelint` mit der gemeinsamen Konfiguration des Projekts ist die übliche Wahl des Templates für das
  Linting, `prettier` für die Formatierung — in beiden Fällen ausführen, was das Projekt tatsächlich
  konfiguriert hat (siehe `R-code-tools`).
- SCSS, PostCSS-Plugins oder eine CSS-in-JS-Bibliothek nicht in ein Projekt einführen, das keine hat; mit
  nativem Nesting und Custom Properties sind die meisten alten Gründe entfallen.
- In SCSS das Nesting auf höchstens drei Ebenen halten und `@use` / `@forward` verwenden, nicht `@import`,
  das seit Dart Sass 1.80 veraltet ist.

## docker
<!-- source: 07bf0a42e42f1b5a -->
Coding-Regeln — Docker
summary: gepinnte Base Images, Non-root- und Multi-Stage-Builds, Build-Kontext und Secrets, Compose, hadolint

Regeln für Dockerfiles und Compose-Dateien. Gruppen-IDs (`CR-docker-<name>`) sind stabil und werden nie neu
vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-docker-image
<!-- source: 11be356ede22f9b7 -->
Gepinntes Base Image, klein und mehrstufig
summary: Tag plus Digest, kein latest, Multi-Stage-Build, ein Prozess pro Container, Reihenfolge der Layer und Aufräumen

- Das Base Image mit Tag und Digest pinnen (`FROM python:3.12-slim@sha256:...`); nie `latest` oder einen
  nackten Major-Versions-Tag allein. Die Sprachversion aus den Projektdateien nehmen (`R-code-version`),
  nicht aus Gewohnheit, und den Digest bewusst aktualisieren, nicht durch erneutes Bauen.
- In Stufen bauen: Compiler, Dev-Abhängigkeiten und Caches bleiben in einer `builder`-Stufe; die letzte
  Stufe kopiert nur das Ergebnis (`COPY --from=builder`) in eine schlanke oder distroless Basis.
- Layer nach der Seltenheit ihrer Änderung ordnen: zuerst das Abhängigkeits-Manifest kopieren und
  installieren, den Quellcode zuletzt, damit eine Codeänderung nicht alles neu installiert. Die Installation
  und ihr Aufräumen in einem einzigen `RUN` erledigen
  (`apt-get update && apt-get install -y --no-install-recommends ... && rm -rf /var/lib/apt/lists/*`), da
  ein späteres `rm` einen früheren Layer nicht verkleinert.
- `COPY` dem `ADD` vorziehen; für `CMD` und `ENTRYPOINT` die Exec-Form verwenden (`["python", "app.py"]`),
  damit Signale das Programm erreichen; ein Hauptprozess pro Container.

## CR-docker-security
<!-- source: 0865f7a77127fe65 -->
Non-root-Nutzer, keine Secrets in Layern
summary: USER gesetzt, .dockerignore, Build Secrets statt ARG/ENV, keine Zugangsdaten im Image

- Als Non-root-Nutzer laufen: ihn anlegen (`RUN useradd --system --uid 10001 app`) und `USER` vor `CMD`
  setzen; Dateien mit `--chown` kopieren. Einen Dienst nicht als root laufen lassen, „damit es geht“.
- Neben dem Dockerfile eine `.dockerignore` führen, die mindestens `.git`, `.env*`, Abhängigkeitsordner
  (`node_modules`, `.venv`), Build-Ausgabe und lokale Daten ausschließt, damit nichts davon in den
  Build-Kontext oder einen Layer gelangt.
- Ein Secret kommt nie in `ARG`, `ENV`, `COPY` oder ein `RUN`-Argument: Jedes bleibt in der Image-History
  lesbar (`docker history`). Für die Build-Zeit einen BuildKit Secret Mount verwenden
  (`RUN --mount=type=secret,id=name ...`, übergeben mit `--secret`), für die Laufzeit die Umgebung oder eine
  eingebundene Datei (`R-safe-no-secret-cli`).
- Konfiguration, die sich je Umgebung unterscheidet, nicht ins Image einbacken; sie zur Laufzeit übergeben.

## CR-docker-compose
<!-- source: fe182158df74e4fb -->
Compose-Dateien
summary: kein version-Key, gepinnte Images, benannte Volumes, Env-Datei außerhalb der Versionsverwaltung, gesunde Abhängigkeiten

- Die Compose Specification verwenden (Docker Compose v2, `docker compose`): den veralteten Top-Level-Key
  `version:` weglassen. Die installierte Version mit `docker compose version` prüfen.
- Jedes `image:` wie oben pinnen; kein `latest`. Volumes benennen statt anonymer zu verwenden, und den
  Docker-Socket (`/var/run/docker.sock`) nicht in einen Container einbinden.
- Werte und Secrets in einer `.env`-Datei oder in `secrets:` halten, nie in `compose.yaml`; nur eine
  `.env.example` committen. Nur die nötigen Ports veröffentlichen, gebunden an `127.0.0.1`, außer der Dienst
  soll von außen erreichbar sein. Ein Host-Port kollidiert mit dem Server des Eigentümers — siehe
  `R-safe-dev-server`.
- Die Startreihenfolge real machen: `depends_on` mit `condition: service_healthy` und einem `healthcheck`,
  nicht ein Sleep.

## CR-docker-toolchain
<!-- source: 190707e25bdfb12d -->
Lint und Build-Prüfungen
summary: hadolint für Dockerfiles, docker compose config für Compose, oder was das Projekt eingerichtet hat

- `hadolint` ist der übliche Dockerfile-Linter des Templates; Compose-Dateien mit
  `docker compose config --quiet` validieren. Ausführen, was das Projekt konfiguriert hat, und nichts
  ungefragt installieren (`R-code-tools`).
- Mit BuildKit bauen (Standard im aktuellen Docker) und das Ergebnis prüfen, indem das Image einmal
  ausgeführt wird, nicht nur anhand eines grünen Builds.

## go
<!-- source: a1cf0bbe4110476f -->
Coding-Regeln — Go
summary: strikte Fehlerprüfung, Werkzeuge für statische Analyse, Paketdesign

Regeln für Go-Projekte. Gruppen-IDs (`CR-go-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-go-basics
<!-- source: f62de315fb3c3976 -->
Fehlerbehandlung, Formatierung, statische Analyse
summary: Fehler prüfen und wrappen, mit gofmt formatieren, vet/staticcheck ausführen, Panics und Leaks vermeiden

- Jede Datei vor dem Commit mit `gofmt`/`goimports` formatieren; keine handgepflegte Abweichung von beiden.
- Einen Fehler unmittelbar nach dem Aufruf prüfen, der ihn zurückgegeben hat (`if err != nil`), statt
  Fehler für später zu sammeln, und einen Rückgabewert nie mit `_` verwerfen, wenn er einen ungeprüften
  Fehler mitbringt.
- Fehler mit `%w` wrappen (`fmt.Errorf("...: %w", err)`), damit `errors.Is`/`errors.As` weiter oben in der
  Aufrufkette funktionieren; den zugrunde liegenden Fehler nie verlieren oder einebnen.
- `go vet` und `staticcheck` in der CI als Standard der statischen Analyse des Stacks ausführen — einrichten,
  aber nur ausführen, was installiert ist; fehlt ein Werkzeug, das einmal sagen und nichts ungefragt
  installieren.
- Keine Panics in Bibliothekscode für erwartbare Fehlerfälle; panic nur bei echten Programmierfehlern.
- `context.Context` ist der erste Parameter jeder Funktion, die Abbruch, eine Deadline oder
  request-bezogene Werte weitergeben muss.
- Jede Goroutine hat ein sichtbares Lebensende (`WaitGroup` oder Abbruch über den Context) — eine Goroutine
  ohne Möglichkeit zu stoppen ist ein Leak.
- Zustand, den Goroutinen gemeinsam nutzen, über Channels oder explizite Locks synchronisieren, nie
  stillschweigend.

## CR-go-package-design
<!-- source: 2a236e6b334ba672 -->
Kleine Interfaces, keine Sammelpakete
summary: Interfaces vom Konsumenten definiert, Pakete nach Domäne benannt und geschnitten

- Interfaces auf der Seite des Konsumenten definieren (klein, oft ein oder zwei Methoden), nicht vorab vom
  Anbieter, der sie implementiert.
- Pakete mit kurzen, aussagekräftigen Namen nach Domäne schneiden; kein Sammelpaket `util`/`common` ohne
  eigenen Gegenstand.

## java
<!-- source: e99152267bb70f37 -->
Coding-Regeln — Java
summary: Nullability, Fehlerbehandlung, Struktur, Toolchain, Tests

Regeln für Java-Projekte. Gruppen-IDs (`CR-java-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-java-basics
<!-- source: 484e3bbc035a0768 -->
Nullability, Fehlerbehandlung, bekannte Fallstricke
summary: explizite Nullability, keine Raw Types, korrekte Exception-Behandlung, sicheres Logging und SQL

- Nullability an Feldern, Parametern und Rückgabetypen explizit machen (JSpecify `@Nullable`/`@NonNull` oder
  die Alternative, auf die sich das Projekt festgelegt hat), statt sie implizit zu lassen.
- Kein rohes `Object`, keine Raw Types bei Generics.
- Keine leeren `catch`-Blöcke und kein `catch (Exception e)` ohne konkreten Grund; Unchecked Exceptions für
  Programmierfehler, Checked Exceptions für erwartbare, behebbare Fehler — die Meldung muss nennen, was
  woran gescheitert ist.
- Ressourcen ausschließlich über try-with-resources verwalten.
- `java.util.concurrent` (Executors, `CompletableFuture`, Concurrent Collections) statt manuellem
  `synchronized`/`wait`/`notify` verwenden.
- Über SLF4J loggen, parametrisiert (`log.info("user {} failed", id)`, nie per String-Konkatenation) —
  was gar nicht in eine Logzeile gehört, steht in `R-safe-no-secret-log`.
- `var` nur verwenden, wo der Typ aus der rechten Seite offensichtlich ist, sonst den Typ ausschreiben.
- `Optional<T>` nur als Rückgabetyp einer Methode für „möglicherweise kein Ergebnis“ zurückgeben — nie als
  Feld, als Parameter oder innerhalb einer Collection.
- Fallstricke: `equals`/`hashCode` nur gemeinsam überschreiben; `java.time` verwenden, nie
  `Date`/`Calendar`; für Geldbeträge `BigDecimal`, nie `float`/`double`; `UTF_8` ausdrücklich angeben, sich
  nie auf den Plattform-Default verlassen; ausschließlich parametrisiertes SQL verwenden, nie per
  String-Konkatenation gebaute Abfragen; eine einfache Schleife liest sich unter Umständen besser als ein
  erzwungener Stream.
- Statische Analyse ist der Standard des Stacks — einrichten, aber nur ausführen, was installiert ist; fehlt
  ein Werkzeug, das einmal sagen und nichts ungefragt installieren.

## CR-java-modern-idioms
<!-- source: 6685f30bda21814b -->
Records, Sealed Types, Text Blocks, Virtual Threads
summary: moderne Sprachfeatures, meist ab Java 17, Virtual Threads ab Java 21

- Records für unveränderliche Datenträger (DTOs, Value Objects) verwenden statt einer handgeschriebenen
  Klasse mit Gettern, `equals`, `hashCode` und Konstruktor — erfordert Java 17 (Records) bzw. 16 (Preview).
- Sealed Interfaces/Classes mit Pattern Matching (`switch` auf den Typ) statt `instanceof`-Ketten
  verwenden — erfordert Java 17.
- Text Blocks für mehrzeilige Strings (SQL, JSON-Vorlagen) statt Konkatenation verwenden — erfordert
  Java 17.
- Virtual Threads nur verwenden, wo die Laufzeit und jede Bibliothek auf dem Weg sie unterstützen —
  erfordert Java 21.

## CR-java-structure
<!-- source: bf4cc84ed8f80849 -->
Paketschnitt, Immutability, Constructor Injection
summary: Pakete nach Domäne, Immutability als Standard, Constructor Injection

- Pakete nach fachlicher Domäne schneiden, nicht nach technischer Schicht.
- Sichtbarkeit so eng wie möglich halten, Felder `final`, kein Setter ohne Grund — Immutability ist der
  Standard und der beste Schutz gegen Nebenläufigkeitsfehler.
- Constructor Injection statt Field Injection verwenden, auch außerhalb eines DI-Containers.

## CR-java-toolchain
<!-- source: 381e2c8f7ee679b2 -->
Build- und Analysewerkzeuge
summary: standardmäßig Maven oder Gradle; statische Analyse mit dem, was das Projekt eingerichtet hat

- Mit Maven oder Gradle bauen — das Projekt entscheidet, womit.
- Formatierung und statische Analyse in der CI erzwingen: Spotless oder google-java-format für die
  Formatierung, dazu Checkstyle, SpotBugs, Error Prone oder PMD — die übliche Wahl des Templates; ausführen,
  was das Projekt tatsächlich eingerichtet hat (siehe `R-code-tools`).

## CR-java-tests
<!-- source: 46082cb29b5e2077 -->
Standardmäßig JUnit 5 mit AssertJ
summary: standardmäßig JUnit 5/AssertJ, Testnamen beschreiben das Verhalten, keine Zufallswerte ohne Seed, kein Thread.sleep

- Tests mit JUnit 5 und AssertJ schreiben — die übliche Wahl des Templates; stattdessen das Test-Framework
  verwenden, das das Projekt tatsächlich eingerichtet hat (siehe `R-code-tools`).
- Tests nach dem erwarteten Verhalten benennen, nicht nach der getesteten Methode.
- Nie Zufall ohne festen Seed verwenden.
- Nie mit `Thread.sleep` warten; stattdessen auf die tatsächliche Bedingung warten.

## javascript
<!-- source: 363abc8873e17842 -->
Coding-Regeln — JavaScript
summary: ESM, moderne Syntax, gepinnte Node-Version, ESLint Flat Config, Prettier, eingebaute Tests oder Vitest, behandelte Promises

Regeln für JavaScript auf Node.js in Projekten ohne TypeScript; mit TypeScript gilt der Satz `typescript`.
Gruppen-IDs (`CR-javascript-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht
mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-javascript-basics
<!-- source: f29095c0487cdbff -->
Moderne Sprachstandards
summary: ESM, const/let, strikte Gleichheit, async/await, ausdrückliche Fehler

- ES-Module verwenden: `"type": "module"` in `package.json`, `import`/`export`, das Präfix `node:` für
  eingebaute Module (`import fs from "node:fs/promises"`) und die Dateiendung in relativen Imports. Kein
  neues CommonJS (`require`, `module.exports`); `__dirname` wird zu `import.meta.dirname` (Node 20.11+).
- `const` als Standard, `let` wo neu zugewiesen wird, nie `var`.
- Mit `===`/`!==` vergleichen; `==` nur für die bewusste Prüfung `x == null`, mit einem Kommentar.
- `async`/`await` statt `.then`-Ketten. `forEach` wartet nicht auf einen asynchronen Callback — `for…of` mit
  `await` verwenden oder `Promise.all` über `map`, wenn die Aufrufe unabhängig sind.
- `Error`-Objekte werfen (mit `cause`, wenn umhüllt wird), nie Strings. Jede Fehlermeldung nennt, was mit
  welchem Wert gescheitert ist.
- Die Standardbibliothek und eingebaute Funktionen (`fetch`, `structuredClone`, `node:test`,
  `util.parseArgs`) vor einem zusätzlichen Paket verwenden.
- Die Form strukturierter Daten mit einem JSDoc-`@typedef` beschreiben, nicht als loses Objekt
  herumreichen.

## CR-javascript-promises
<!-- source: bc26a91ebbeeecfa -->
Keine freischwebenden Promises
summary: jedes Promise erwartet, zurückgegeben oder abgefangen; unbehandelte Rejections beenden den Prozess

- Jedes Promise wird erwartet (`await`), zurückgegeben oder endet in `.catch(...)`. Der Aufruf einer
  asynchronen Funktion als bloße Anweisung verbirgt ihren Fehlschlag; ab Node 15 beendet eine unbehandelte
  Rejection den Prozess.
- Keine `async`-Funktion als Event-Handler oder `setInterval`-Callback ohne eigenes `try/catch`.
- Kein `new Promise(async (resolve) => …)`; kein `await` in einer Schleife, wo die Aufrufe unabhängig sind.
- ESLint Core findet freischwebende Promises nicht (`@typescript-eslint/no-floating-promises` braucht
  Typen), also im Review darauf achten und einen Handler auf oberster Ebene für `unhandledRejection` setzen,
  der loggt und mit Fehlercode beendet.

## CR-javascript-toolchain
<!-- source: a0f0841e71ef53ba -->
Node-Version, Lint, Format, Tests
summary: Node-Version gepinnt, ESLint 9+ Flat Config, Prettier, node:test oder Vitest, Lockfile

- Die Node.js-Version pinnen: `engines.node` in `package.json` plus `.nvmrc` (oder `.node-version`), und in
  der CI dieselbe Version verwenden. Eine aktive LTS-Linie verwenden; die installierte Version prüfen
  (`R-code-version`).
- ESLint ab v9 liest nur die Flat Config `eslint.config.js`; `.eslintrc*` ist Legacy und wird nicht
  verwendet, solange das Projekt nicht noch ESLint 8 betreibt. Ausführen, was das Projekt konfiguriert hat
  (`R-code-tools`).
- Prettier ist der übliche Formatter des Templates; ESLint deckt nur Korrektheit ab, mit
  `eslint-config-prettier`, wo beide laufen — kein zweiter Styleguide.
- Tests: der eingebaute Runner `node:test` (`node --test`) oder Vitest, je nachdem, was das Projekt
  eingerichtet hat.
- Die Lockfile des Paketmanagers committen und in der CI daraus installieren, eingefroren: `npm ci`,
  `pnpm install --frozen-lockfile` oder `yarn install --immutable`, nie eine schlichte Installation. Mit pnpm
  ersetzen `pnpm update` und `pnpm why <package>` die Befehle `npm update` / `npm ls`; Script-Argumente
  gehen ohne `--` (`pnpm run test -t name`).
- Ein fehlschlagendes Lint oder ein fehlschlagender Test wird im Code behoben, nicht mit `eslint-disable`
  zum Schweigen gebracht (`R-code-checks-intact`).

## kotlin
<!-- source: da85e8423ca0489b -->
Coding-Regeln — Kotlin
summary: Null Safety, Structured Concurrency, Datenmodellierung, Toolchain, Tests

Regeln für Kotlin-Projekte (JVM, Android oder Multiplatform). Gruppen-IDs (`CR-kotlin-<name>`) sind stabil
und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in
diesem Kopf als `retired:` aufgeführt. Ein Kotlin-Projekt nimmt normalerweise nicht den Java-Satz; bei
gemischten Quellen kreuzt `init` beide an, und wo nur gelegentlich ein Java-Aufruf vorkommt, genügt die
Interop-Regel unten.

## CR-kotlin-basics
<!-- source: 3f00c45f70353d4b -->
Null Safety, Unveränderlichkeit, Fehlerbehandlung
summary: kein !!, val vor var, spezifische Exceptions, explizite API an Grenzen, Java-Interop

- Nie `!!` verwenden. Nullability mit `?.`, `?:`, `let`, einem frühen `return` oder
  `requireNotNull(x) { "message" }` / `checkNotNull` behandeln, wo ein fehlender Wert ein Fehler ist — die
  Meldung nennt, was fehlte. `lateinit` nur für vom Framework injizierte Felder.
- `val` dem `var` vorziehen, in Signaturen schreibgeschützte Collections (`List`, `Map`) statt
  veränderlicher, und Ausdrücke (`when`, `if`) statt Mutation.
- Spezifische Exception-Typen abfangen; nie eine Exception verschlucken oder `Throwable` abfangen. In
  Coroutines nie `CancellationException` abfangen, ohne sie erneut zu werfen. `Result` oder einen Sealed
  Type für erwartbare Fehler statt Exceptions als Kontrollfluss verwenden.
- Den Typ öffentlicher Funktionen und Properties ausdrücklich deklarieren, statt sich über eine
  Modulgrenze hinweg auf Inferenz zu verlassen.
- Plattformtypen aus Java (`String!`) werden nicht vertraut: ihnen am Eintrittspunkt einen nullable oder
  nicht-null Typ geben, und Kotlin-APIs für Java-Aufrufer (`@JvmStatic`, `@JvmOverloads`, `@Throws`) nur
  dort annotieren, wo die Java-Seite es braucht.
- String-Templates statt Konkatenation verwenden, und auf der JVM `java.time`-Typen (nicht
  `Date`/`Calendar`).
- Über SLF4J oder die Logging-Fassade des Projekts loggen, mit parametrisierten Meldungen — was nie in eine
  Logzeile gehört, steht in `R-safe-no-secret-log`.

## CR-kotlin-coroutines
<!-- source: a7b51ec6cfa36261 -->
Structured Concurrency
summary: kein GlobalScope, Scopes mit Lebenszyklus, injizierte Dispatcher, kein runBlocking im Produktionscode

- Nie Arbeit im `GlobalScope` starten. Coroutines in einem Scope starten, der ihren Lebenszyklus besitzt
  (`coroutineScope`, `supervisorScope`, `viewModelScope`, der eigene `CoroutineScope` eines Dienstes), damit
  Fehler und Abbruch weitergegeben werden.
- Im Produktionscode außerhalb von `main` und Test-Brücken kein `runBlocking` aufrufen und keinen
  Coroutine-Thread mit `Thread.sleep` oder blockierendem I/O blockieren: `delay` und
  `withContext(Dispatchers.IO)` verwenden.
- Dispatcher als Parameter injizieren, statt `Dispatchers.IO`/`Default` fest zu verdrahten, damit Tests sie
  ersetzen können. Aus APIs `suspend`-Funktionen oder `Flow` bereitstellen, nicht `Deferred` oder
  Callbacks.
- Für Coroutine-Tests `kotlinx-coroutines-test` (`runTest`) verwenden; nie mit `Thread.sleep` warten.

## CR-kotlin-data-modeling
<!-- source: 9935fc2fb805a3ef -->
data class, Sealed Types, Value Classes
summary: data class für Werte, Sealed Types für geschlossene Mengen, copy statt Mutation

- Schlichte Werte als `data class` mit `val`-Properties modellieren und mit `copy()` ändern; keine Logik mit
  Nebenwirkungen in eine `data class` legen.
- Geschlossene Mengen von Fällen als `sealed interface`/`sealed class` modellieren und mit einem
  erschöpfenden `when` ohne `else`-Zweig behandeln, damit ein hinzugefügter Fall den Build bricht.
- `@JvmInline value class` für typisierte Bezeichner (IDs, Einheiten) statt nacktem `String`/`Long`
  verwenden; `enum class` nur für eine feste Menge ohne Daten je Fall.

## CR-kotlin-toolchain
<!-- source: 1dfc6e78d41c22b5 -->
Build, Formatierung, statische Analyse, Tests
summary: Gradle Kotlin DSL als Standard, ktlint und detekt, JUnit 5 oder Kotest

- Die Kotlin-Version aus der Build-Datei oder dem Version Catalog (`libs.versions.toml`) lesen und nur
  Sprachfeatures verwenden, die diese Version unterstützt (`R-code-version`): Context Parameters und
  Guard-Bedingungen in `when` sind zum Beispiel neuer als Kotlin 2.0.
- Mit Gradle und der Kotlin DSL (`build.gradle.kts`) bauen — die übliche Wahl des Templates; Versionen von
  Abhängigkeiten an einer Stelle halten und den Gradle Wrapper verwenden, den das Projekt mitbringt.
- Mit ktlint (oder `ktfmt`/Spotless) formatieren und mit detekt analysieren — die übliche Wahl des
  Templates; ausführen, was das Projekt tatsächlich eingerichtet hat (siehe `R-code-tools`), und nichts
  ungefragt installieren.
- Tests mit JUnit 5 schreiben — die übliche Wahl des Templates —, optional mit Kotest-Assertions oder
  MockK; das Framework verwenden, das das Projekt eingerichtet hat. Tests nach dem erwarteten Verhalten
  benennen; nie Zufall ohne festen Seed verwenden.

## nuxt
<!-- source: 7f4eab86966cf3c4 -->
Coding-Regeln — Nuxt
summary: Verzeichniskonventionen, Datenabruf, Runtime-Konfiguration, SSR-Modus, Tooling

requires: vue, typescript

Regeln für Nuxt-Projekte. Gruppen-IDs (`CR-nuxt-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

Auf Nuxt 5 ergänzt der Satz `nuxt5` (`.act/coding/nuxt5.md`) diesen. `init` prüft ihn, wenn `package.json` `nuxt` in
Hauptversion 5 nennt. Fehlt die Zeile des Satzes in `docs/project/coding_rules.md` in einem Nuxt-5-Projekt (eines,
das vor dem Satz eingerichtet wurde), vor Arbeit an Nuxt-Code `.act/coding/nuxt5.md` lesen und vorschlagen,
`- [x] use: .act/coding/nuxt5.md` samt seinen Gruppen hinzuzufügen; eine abgewählte Zeile ist die Entscheidung des
Eigentümers.

## CR-nuxt-basics
<!-- source: 1ff3099ed3afdbb6 -->
Bewährte Nuxt-Standards
summary: Verzeichnisstruktur, Datenabruf, typisierte Handler, Runtime-Konfiguration, Fallstricke

- Der Verzeichniskonvention folgen (`pages/`, `components/`, `composables/`, `server/`), statt eine eigene
  Struktur zu erfinden; Auto-Imports nutzen, keine manuellen Re-Exports für Dateien in diesen Verzeichnissen.
- Daten beim Rendern mit `useFetch`/`useAsyncData` lesen, `$fetch` für einmalige Schreibzugriffe und
  Aktionen verwenden.
- Den Rückgabewert von `useFetch`/`useAsyncData` nie in ein eigenes `ref` kopieren — das zurückgegebene
  Objekt durchreichen und dort `await`en, wo `data`/`status`/`error` das Template erreichen. Kopieren
  verliert die Awaitability: Der Aufruf löst sich später auf, der Server rendert ohne Daten, der Client
  füllt sie nachträglich ein, und das Ergebnis ist ein Hydration-Mismatch.

      ```ts
      // Falsch — die Awaitability geht verloren
      function useThing() {
        const result = ref()
        useFetch('/api/thing').then(r => (result.value = r.data.value))
        return result
      }

      // Richtig — das zurückgegebene Objekt unverändert durchreichen
      async function useThing() {
        return await useFetch('/api/thing')
      }
      ```

- Pfad-Aliase, je nach installierter Nuxt-Hauptversion (`R-code-version`). Seit Nuxt 4 zeigt `~` auf `app/`,
  ohne eigenen Eintrag löst `~/types` also woanders auf als `~types`.
  - Nuxt 4 und neuer: Aliase nur in `nuxt.config.ts` (`alias`) deklarieren; Nuxt übernimmt jeden in die
    erzeugten `.nuxt/tsconfig*.json`. Die `tsconfig.json` im Root enthält nichts außer `references` auf diese
    erzeugten Konfigurationen und nie eigene `paths`: Mit `files: []` plus `references` ersetzt ein `paths`
    dort nichts, es erreicht die referenzierten Projekte schlicht nicht, der Alias wirkt also nirgends. Nur
    ein Root, der eine erzeugte Konfiguration erweitert, ersetzt die ganze erzeugte Zuordnung durch seine
    `paths`, und die Framework-Aliase verschwinden.
  - Nuxt 3: Aliase ebenfalls in `nuxt.config.ts` deklarieren; eine Root-`tsconfig.json`, die
    `./.nuxt/tsconfig.json` erweitert, darf `paths` nur ergänzen, wenn sie jeden erzeugten Eintrag
    wiederholt. Nuxt 3 schreibt außerdem jeden `alias` in die erzeugten `paths`, der Eintrag in
    `nuxt.config.ts` allein genügt also; die erzeugte `.nuxt/tsconfig.json` zeigt es.
- Dateien, die die erzeugten Kontexte auslassen (Unit- und E2E-Tests, Konfigurationen des Test Runners),
  überspringt `nuxt typecheck` ohne Meldung. Sie über die TypeScript-Optionen von Nuxt in `nuxt.config.ts`
  aufnehmen (`typescript.tsConfig.include`, oder auf Nuxt 4 die Objekte je Kontext
  `typescript.sharedTsConfig` / `typescript.nodeTsConfig` / `typescript.tsConfig`; den Server-Kontext über
  `nitro.typescript.tsConfig`) und dann jeden Kontext einmal nachweisen: einen absichtlichen Typfehler in eine
  Datei davon setzen, `nuxt typecheck` fehlschlagen sehen, ihn wieder entfernen. Die Namen der Optionen in
  der Doku der installierten Nuxt-Version prüfen, bevor man sie verwendet.
- pnpm-Projekte: siehe die Hinweise zum Paketmanager in den JavaScript-Regeln.
- `runtimeConfig` für Konfigurationswerte verwenden, statt `process.env` in Komponenten zu lesen; Secrets
  gehören in den privaten Teil von `runtimeConfig`, nie unter `public`.
- Typen für Props, Emits, Store-Actions, Composables und `defineEventHandler` ausschreiben, einschließlich
  der Rückgabetypen.
- Server-Routen unter `server/api/` mit einem Verb-Suffix benennen (`login.post.ts`, `users.get.ts`) und
  Fehler mit `createError` und einem passenden HTTP-Status zurückgeben — nie einen Fehler verschlucken oder
  mit 200 antworten.
- Lint und Typecheck sind der Standard des Stacks und gehören ins Projekt; `nuxt typecheck` braucht
  `vue-tsc` als Abhängigkeit, ohne es gibt es keinen Typecheck. Ausführen, was installiert ist, nichts
  ungefragt installieren.
- Die npm-Scripts überall gleich benennen: `lint` (`eslint .`), `typecheck` (`nuxt typecheck`), dazu
  `test` (`vitest run`) und `test:e2e` (`playwright test`), wo es Tests gibt.
- Fallstricke:
  - SSR-Code darf Browser-Globals (`window`, `document`) nicht ohne Absicherung anfassen.
  - `<ClientOnly>` nur dort verwenden, wo eine Komponente auf dem Server wirklich nicht rendern kann, nicht
    als Standardlösung.
  - **Sicherheit:** nie Zustand pro Request in einem `ref`/`reactive` auf Modulebene halten. Auf dem Server
    überlebt ein solcher Wert den Request und wird zwischen Nutzern geteilt — der nächste Request sieht die
    Daten des vorigen. Für Zustand, der den Request überleben muss, `useState` verwenden.
  - Formulare mit `@submit.prevent` brauchen zusätzlich `method="post"` (siehe `CR-vue-basics`).
  - **Windows:** Ein abgebrochener Dev-Server kann seinen Port belegt halten; der nächste Start weicht auf
    den nächsten freien Port aus, und HMR-/WebSocket-Fehler folgen. Ist es ein Server, den der Assistent
    selbst gestartet hat, genau diesen Prozess beenden, statt einen eigenen HMR-Port zu konfigurieren. Die
    lauschende PID findet `(Get-NetTCPConnection -LocalPort <port> -State Listen).OwningProcess` oder
    `netstat -ano | findstr /C:":<port> " | findstr LISTENING` — ein schlichtes `findstr ":<port> "`
    trifft auch längere Portnummern, und Zeilen ohne `LISTENING` gehören zu Clients —, dann
    `taskkill /PID <pid> /F`; anderswo `lsof -iTCP:<port> -sTCP:LISTEN`, `kill <pid>`. Ein Server auf dem
    Port des Eigentümers gehört ihm: erst fragen (`R-safe-dev-server`).

## CR-nuxt-root-folders
<!-- source: a3ad57821a6f8362 -->
Feste Root-Ordner mit eigenen Aliasen
summary: /types, /constants und /server im Repo-Root, jeweils der einzige Ort seiner Art

- Drei Ordner im Repository-Root halten, jeweils mit eigenem Alias und jeweils der einzige Ort seiner Art:
  `/types` (`~types`, gemeinsame Typen und Interfaces), `/constants` (`~constants`, Konstanten,
  Enumerationen, feste Schlüssel), `/server` (`~server`, das Nitro-Backend).
- Typen und Konstanten von dort importieren, statt sie in Komponenten zu duplizieren. Ein zweiter
  Typen-Ordner unter `app/types/` ist ein Fehler, keine Ergänzung.

## CR-nuxt-ssr
<!-- source: 4301f7390de1d1f2 -->
Den SSR-Modus bewusst wählen
summary: vor der Annahme von SSR fragen, die Hydration-Kosten kennen, nach SSR-Arbeit auf Mismatches prüfen

- `ssr: false` oder eine reine SPA ist bei einer rein lokalen Oberfläche ohne SEO- oder
  First-Paint-Anforderung (z. B. ein Admin-Tool) oft die einfachere Wahl. Den Nutzer einmal fragen, wenn die
  App aufgesetzt oder umstrukturiert wird, statt ungefragt SSR als Standard zu nehmen.
- Wissen, was SSR kostet: Jedes Rendern einer Seite läuft zweimal, einmal auf dem Server und einmal auf dem
  Client. Alles, was nur im Browser existiert oder sich zwischen beiden Läufen unterscheidet — Zeitstempel,
  Zufallswerte, `window`, `localStorage`, Erkennung von Locale oder Zeitzone —, erzeugt einen
  Hydration-Mismatch.
- Nach Arbeit an einer Komponente, die serverseitig rendert, gezielt auf Hydration-Fehler prüfen: die Seite
  im Browser laden und die Konsolenwarnung „Hydration ... mismatch“ lesen — sie nennt Komponente und Knoten.
  Diese Warnung als Befund behandeln, nicht als Fußnote.
- Bekannte Ursachen und ihre Behebung in Kürze: Werte, die nur im Browser existieren, hinter
  `onMounted`/`import.meta.client` legen; request-bezogenen Zustand über `useState` teilen, nie über ein
  `ref` auf Modulebene; ungültige HTML-Verschachtelung beheben (z. B. ein Block-Element in einem `<p>`);
  `<ClientOnly>` nur als letztes Mittel einsetzen.
- Das Ergebnis von `useFetch`/`useAsyncData` in ein eigenes `ref` zu kopieren ist ebenfalls eine häufige
  Ursache für Hydration-Mismatches — Grund und Behebung stehen in `CR-nuxt-basics`, hier nicht wiederholt.

## CR-nuxt-toolchain
<!-- source: 342a42a91eb9e683 -->
Lint- und Format-Tooling
summary: ESLint mit `@nuxt/eslint` plus Prettier, oder was das Projekt eingerichtet hat

- ESLint mit `@nuxt/eslint`, konfiguriert in `eslint.config.mjs`, und Prettier für die Formatierung sind die
  übliche Wahl des Templates; maßgeblich ist, was das Projekt tatsächlich installiert und konfiguriert hat
  (siehe `R-code-tools`).

## CR-nuxt-tests
<!-- source: 0e92ef5e3df806c0 -->
Unit- und End-to-End-Tests
summary: standardmäßig vitest/Playwright, aber die Suite, die das Projekt ausführt, muss bestehen

- `vitest` (`vitest.config.ts`) für Unit- und Komponententests, `@playwright/test`
  (`playwright.config.ts`) für End-to-End-Tests — die übliche Wahl des Templates; hat das Projekt einen
  anderen Test Runner installiert und konfiguriert (z. B. Selenium, Nightwatch, Cypress), stattdessen diesen
  verwenden (siehe `R-code-tools`).
- Welche Test-Suiten das Projekt tatsächlich hat, die existieren und laufen; eine Änderung, die sie bricht,
  ist nicht fertig.

## nuxt5
<!-- source: 06bf90338447a673 -->
Coding-Regeln — Nuxt 5
summary: Nightly-Kanal, Module, Nitro 3/h3 v2, typisiertes Routing und `$fetch`, Unhead 3, Prüfungen nach jedem Update

requires: nuxt

Regeln für Projekte auf Nuxt 5, geschrieben gegen den Nightly-Kanal vor dem stabilen Release. Sie ergänzen
`CR-nuxt-*` und ersetzen davon nichts. `init` prüft diesen Satz, wenn `package.json` `nuxt` in Hauptversion 5
nennt (`^5.0.0`, `npm:nuxt-nightly@5x`). Gruppen-IDs (`CR-nuxt5-<name>`) sind stabil und werden nie neu vergeben;
eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-nuxt5-channel
<!-- source: 51978dc5be3ac792 -->
Nightly-Kanal und Versionen
summary: `nuxt-nightly@5x` als Tag, die Lockfile als einzige Festlegung, Hauptversionen im Gleichschritt mit Nuxt, DevTools ausdrücklich

- Bis zum stabilen Release `nuxt` als `"npm:nuxt-nightly@5x"` eintragen — ein Tag, nie eine Build-Nummer. Schreibt
  `npm install` eine feste Version, sie von Hand auf `@5x` zurücksetzen und erneut installieren; nur die Lockfile
  hält den Stand fest.
- Mit `npm update nuxt` vorrücken, als eigener Commit, danach die volle Prüfung aus `CR-nuxt5-checks`.
- Direkte Abhängigkeiten, die Nuxt mitbringt, bleiben auf derselben Hauptversion wie Nuxt (z. B. `vue-router` 5,
  `@unhead/vue` 3); nach jedem Update zeigt `npm ls <package>` je Paket eine Kopie.
- Mindestens Node 22.21 oder 24.11.
- `@nuxt/devtools` ausdrücklich als devDependency installieren; nur im Dev-Server und nur mit `NUXT_DEVTOOLS=1`
  ausführen, und jeden Browser einmal mit dem Code aus dem Dev-Terminal bestätigen. `devtools.disableAuthorization`
  nie setzen.
- Nach `dev` oder `build` den Diff von `package.json` lesen: Jeder Eintrag, den das Tooling von sich aus ergänzt
  hat, ist einer, den du erklären kannst.

## CR-nuxt5-modules
<!-- source: 835f2cf50feedf49 -->
Module unter Nuxt 5
summary: `NUXT_B8013` heißt abgeschaltet, Pinia 4 mit seinem Peer, der i18n-Rückweg, die Nitro-v2-Brücke nur in Modulen

- `NUXT_B8013` schaltet ein Modul ab, dessen Feld `compatibility` nicht passt, und zeigt nur eine Warnung: das
  Feld vor dem Update prüfen, die Warnungen danach lesen.
- Pinia 4: `@pinia/nuxt` 1 oder neuer, `@vue/devtools-api` ^8 als direkte Abhängigkeit.
- `@nuxtjs/i18n` 10.6, solange es Nuxt 5 nicht unterstützt: `experimental.nitroViteEnvironment: false` und
  `i18n.experimental.nitroContextDetection: false`; beides entfernen, sobald es das tut.
- Die Nitro-v2-Brücke (`NUXT_B9003`) nie im eigenen Code nachbauen.

## CR-nuxt5-server
<!-- source: 9df75b2e2a6a67e5 -->
Nitro 3 und h3 v2
summary: ausdrückliche Imports aus `nuxt/server`, `event.req` als Web-Request, typisierte Bodies, `status`/`statusText`

- In `server/` `defineEventHandler`, `readBody`, `getQuery`, `createError` … aus `nuxt/server` importieren und
  Plugins mit `definePlugin` aus `nitro` definieren; `server/utils/` bleibt auto-importiert.
- `event.req` ist der Web-`Request` (es gibt kein `event.node`); einen Multipart-Body mit `event.req.formData()`
  lesen.
- `readBody<T>()` mit einem eigenen `interface`, Fallback `.catch((): Body => ({}))`. Der Typ ist keine
  Validierung — den Body wie bisher validieren (z. B. mit einer Schema-Bibliothek).
- Eine Antwort am Rückgabewert typisieren (`const response: ApiThing = …; return response`), der Typ im
  gemeinsamen Typen-Ordner (`CR-nuxt-root-folders`).
- Fehler mit `createError({ status, statusText })`; `statusText` nur in ASCII (z. B. `'Unprocessable Entity'`),
  lokalisierter Text kommt in `data`.
- Im Client kommt `createError({ data })` unter `response._data.data` an; die Feldfehler einer 422 liegen unter
  `…data.errors` (z. B. für `UForm.setErrors` von Nuxt UI).
- `useRuntimeConfig()` ohne `event`.
- Nach dem Umbenennen oder Entfernen eines Exports in `server/utils/` den eigenen Testserver neu starten (sein
  Port, wie `R-safe-dev-server` es sagt), bevor Tests gegen ihn zählen; den Server des Eigentümers erst nach
  Rückfrage. Kein Übergangs-Alias für den alten Namen. Nie `NUXT_IGNORE_LOCK` oder `NUXT_LOCK=0` setzen.
- Jede Runtime-Abhängigkeit kommt in `package.json`, auch eine, die transitiv schon da ist.

## CR-nuxt5-app
<!-- source: 96e0fa5fc4c6aefc -->
Seiten, Routing, Datenabruf, Head
summary: `import.meta.*`, `query` statt `params`, typisiertes `$fetch` und typisierte Routenziele, Unhead 3, kein `baseUrl`

- `import.meta.*` statt `process.*` (`import.meta.client`, `import.meta.dev` …).
- `query` statt `params` in den Optionen von `$fetch`/`useFetch`.
- `$fetch` wird aus den erzeugten Server-Routen typisiert: Ein Wrapper, der freie Pfade annimmt, bekommt eine
  eigene, enge Signatur (`type FreeFetch = <R>(request: string, options: FetchOptions) => Promise<R>`) und wandelt
  `$fetch` mit `as unknown as FreeFetch` um, mit einem Kommentar, der sagt, warum.
- Mit Typed Pages und `@nuxtjs/i18n` ist ein Seitenziel ein Routenname ohne Locale-Suffix:
  `localePath({ name, params, query })` oder `<NuxtLinkLocale :to="{ name: … }">` — auch für `navigateTo`,
  `router.push`, `NuxtLink` und ein `to` von Nuxt UI; ein schlichter Pfad bekommt kein Locale-Präfix und endet in
  einer 404. Aus demselben Grund `definePageMeta({ redirect })` relativ zum aktuellen Pfad bauen.
- Unhead 3: kein `hid`/`vmid`, mit `key` deduplizieren; ein Dev-Hinweis zu `og:*` oder zur Description ist ein
  Befund.
- Jede Seite setzt ihren Titel, eine öffentliche Seite auch ihre Description; die Fallbacks (Titel-Template,
  `og:site_name`, Standard-Description) kommen in `app.vue` **und** `error.vue`, da Nuxt `error.vue` anstelle von
  `app.vue` rendert. Ein fehlender Head-Wert wird weggelassen, nie als `undefined` übergeben —
  `useSeoMeta({ description: undefined })` entfernt den Fallback.
- Kein `compilerOptions.baseUrl` in `tsconfig.json` — Nuxt ignoriert es; Aliase kommen nur in
  `nuxt.config.ts` (`CR-nuxt-basics`).

## CR-nuxt5-checks
<!-- source: 798ac4a88878eb8b -->
Prüfungen nach jedem Nuxt-Update
summary: die volle Prüfkette, die Typfehlerliste verglichen statt gezählt, Warnungen, Kopien und `invalid` im Baum, ein Protokoll

- Die Ausgabe des Typechecks vor dem Update sichern und danach die Fehler vergleichen — die Liste, nicht die Zahl.
- Dann `npm run lint`, `typecheck`, `test`, `build`, `dev` (Hauptseiten antworten mit 200, keine Hydration-Warnung)
  und `test:e2e`; `dev` als eigener Testserver (Port, wie `R-safe-dev-server` es sagt), danach beendet.
- Die Warnungen lesen (`NUXT_B8013`, `NUXT_B9003`, `[unhead]`), auf doppelte Kopien prüfen,
  `python .act/scripts/security_scan.py --deps` ausführen.
- `npm ls --all 2>&1 | grep invalid`: eine veraltete Auflösung mit `npm update <package>` beheben; bereits bekannte
  Einträge stehen im Upgrade-Log, nur neue melden.
- Jeden Bruch in einem Upgrade-Log des Projekts festhalten (z. B. `docs/project/nuxt-5-upgrade.md`): das Symptom
  kurz zitiert, die Ursache geprüft oder als **assumption** markiert, die Behebung, die Stelle. Eine allgemeine
  Lehre wird eine eigene Regel in `docs/project/coding_rules.md` und geht per `act-feedback` ans Template.

## php
<!-- source: 6d28e3173cec2ea7 -->
Coding-Regeln — PHP
summary: strict types, PSR-12/PSR-4, Exceptions, Prepared Statements, Toolchain

Regeln für PHP-Projekte (8.x und neuer). Gruppen-IDs (`CR-php-<name>`) sind stabil und werden nie neu
vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-php-basics
<!-- source: 34fdd424990e0f9f -->
Strict Types, sichere Fehler, sichere Abfragen
summary: strict_types, PSR-12/PSR-4, typisierte Methoden, Exceptions, PDO, Fehler in Produktion, statische Analyse

- `declare(strict_types=1);` als erste Anweisung in jede PHP-Datei schreiben.
- Für die Formatierung PSR-12 befolgen (Einrückung mit 4 Leerzeichen) und für Namespaces PSR-4, ein
  Namespace pro Composer-Autoload-Root.
- Eine Klasse pro Datei, der Dateiname entspricht dem Klassennamen.
- Abhängigkeiten ausschließlich über Composer verwalten; nie eine Bibliothek von Hand einbinden.
- Parameter- und Rückgabetypen an jeder öffentlichen Methode deklarieren. `mixed` nur mit einem Kommentar
  verwenden, der es begründet, und nullable Typen (`?Type`) ausdrücklich markieren, statt auf ein
  implizites `null` auszuweichen.
- Exceptions werfen, statt `false` oder einen Fehlercode zurückzugeben. Eine Exception-Klasse pro
  Fehlerdomäne definieren, statt pauschal `\Exception` zu werfen, und die Meldung nennen lassen, was woran
  gescheitert ist — eine Datenbank-Exception nennt die Abfrage oder Tabelle, eine Validierungs-Exception das
  Feld und den abgelehnten Wert.
- Geschäftslogik aus Templates (Blade, Twig, reine PHP-Templates) heraushalten; Templates rendern, sie
  entscheiden nicht.
- Auf die Datenbank ausschließlich über PDO mit Prepared Statements zugreifen; nie SQL bauen, indem Werte
  in den Abfrage-String konkateniert werden.
- `===`/`!==` verwenden, wo Typgleichheit gemeint ist, nicht die losen Operatoren.
- `display_errors` in Produktion ausschalten; Fehler gehören ins Log, nicht in die Antwort.
- Statische Analyse ist der Standard des Stacks und gehört ins Projekt. Ausführen, was installiert ist,
  nichts ungefragt installieren.

## CR-php-conventions
<!-- source: 75963d2d459eda52 -->
Closures statt globaler Callbacks
summary: Arrow Functions und Closures statt globaler Callback-Funktionen

- Arrow Functions/Closures statt globaler Callback-Funktionen verwenden.

## CR-php-toolchain
<!-- source: ff6f339a77178e02 -->
Formatter und Werkzeuge für statische Analyse
summary: standardmäßig PHP-CS-Fixer/PHP_CodeSniffer plus PHPStan/Psalm, oder was das Projekt eingerichtet hat

- PHP-CS-Fixer oder PHP_CodeSniffer, für PSR-12 konfiguriert, und PHPStan oder Psalm für die statische
  Analyse — die übliche Wahl des Templates; ausführen, was das Projekt tatsächlich eingerichtet hat
  (siehe `R-code-tools`).

## powershell
<!-- source: d6b1440d636ae49d -->
Coding-Regeln — PowerShell
summary: gepinnte PowerShell-Edition, Encoding, Strict Mode und Fehler, Exit-Codes nativer Programme, Skriptstil, PSScriptAnalyzer und Pester

Regeln für PowerShell-Skripte und -Module. Gruppen-IDs (`CR-powershell-<name>`) sind stabil und werden nie
neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-powershell-edition
<!-- source: e6088452a0be58fa -->
Die Edition pinnen, das Encoding ausdrücklich halten
summary: Windows PowerShell 5.1 gegenüber PowerShell 7, ein Ziel pro Skript, ausdrückliches Encoding, keine Bash-Syntax

- Das Ziel im Projekt benennen: Windows PowerShell 5.1 (`powershell.exe`) oder PowerShell 7+ (`pwsh`).
  `$PSVersionTable.PSVersion` und die Projektdateien prüfen, bevor etwas unten Genanntes angewendet wird
  (`R-code-version`); es im Skript mit `#Requires -Version 5.1` oder `#Requires -Version 7.0` deklarieren.
- Die beiden Editionen unterscheiden sich in den Standardwerten: 5.1 schreibt mit `>`, `>>` und `Out-File`
  UTF-16 LE, und `Set-Content` nutzt die ANSI-Codepage; 7 schreibt überall UTF-8 ohne BOM. Sich nie auf den
  Standard verlassen — jedem `Out-File`, `Set-Content`, `Add-Content` und `Export-Csv` `-Encoding utf8`
  mitgeben (5.1 fügt ein BOM hinzu; `utf8NoBOM` gibt es nur in 7) und das Encoding einer vorhandenen Datei
  beibehalten (`R-code-encoding`).
- Keine Bash-Syntax einmischen: kein `&&`/`||` zwischen Befehlen (nur PowerShell 7 kennt sie), kein
  `export VAR=...` (`$env:VAR = ...` verwenden), kein `rm -rf` (`Remove-Item -Recurse` auf einem geprüften
  Pfad verwenden).
- Pfade: mit `Join-Path` und `$PSScriptRoot` bauen, nie durch Zusammenfügen von `\`; Pfade quoten, die
  Leerzeichen enthalten können; `-LiteralPath` verwenden, wenn ein Name `[` oder `]` enthalten kann.

## CR-powershell-strictness
<!-- source: 7fa003e5f80fa308 -->
Strict Mode und Fehler, die anhalten
summary: Set-StrictMode, ErrorActionPreference Stop, Exit-Codes nativer Programme, try/catch mit dem fehlgeschlagenen Wert

- Ein Skript mit `Set-StrictMode -Version Latest` und `$ErrorActionPreference = 'Stop'` beginnen; ein nicht
  abbrechender Fehler lässt das Skript sonst mit fehlerhaften Daten weiterlaufen.
- Ein natives Programm (`git`, `docker`, `npm`) löst bei einem Fehlschlag keinen Fehler aus, und
  `$ErrorActionPreference` fängt ihn nicht ab: `$LASTEXITCODE` unmittelbar nach dem Aufruf prüfen und mit
  `throw` oder `exit` und einer Meldung beenden, die den Befehl und den Code nennt. PowerShell 7.4+ kann das
  mit `$PSNativeCommandUseErrorActionPreference = $true`; 5.1 nicht.
- Spezifische Fehler in `try`/`catch` abfangen und nennen, was mit welchem Wert gescheitert ist
  (`"Cannot read '$Path': $($_.Exception.Message)"`); nie ein leeres `catch {}`. `-ErrorAction
  SilentlyContinue` nur an einem einzelnen Aufruf verwenden, dessen Fehlschlag erwartet und danach geprüft
  wird.
- Exit-Codes bewusst setzen (`exit 0`/`exit 1`) am Ende eines Skripts, das CI oder ein anderes Programm
  aufruft; Fehler mit `Write-Error` oder `throw` ausgeben, nicht mit `Write-Host`.

## CR-powershell-style
<!-- source: 58fc1bbdbdf38bdf -->
Namen, Parameter, keine Aliase
summary: freigegebene Verben, Advanced Functions, param-Blöcke mit Typen, volle Cmdlet-Namen, Ausgabe als Objekte

- Funktionen als `Verb-Noun` mit einem freigegebenen Verb benennen (`Get-Verb` listet sie: `Get-`, `Set-`,
  `New-`, `Remove-`, `Test-`, `Invoke-` …); ein Nomen im Singular, kein `Do-`, `Run-` oder `Check-`.
- Eine Funktion als Advanced Function schreiben: `[CmdletBinding()]`, ein `param()`-Block mit einem Typ an
  jedem Parameter, `[Parameter(Mandatory)]` und `[ValidateSet()]`/`[ValidateNotNullOrEmpty()]`, wo sie
  passen. Funktionen, die Zustand ändern, mit `SupportsShouldProcess` markieren und `-WhatIf` beachten.
- Keine Aliase in einem Skript (`ls`, `gci`, `%`, `?`, `foreach` für `ForEach-Object`, `curl`, `wget`) und
  keine Positionsparameter über den ersten hinaus; das volle Cmdlet und den vollen Parameternamen
  schreiben. `curl` und `wget` sind in 5.1 Aliase von `Invoke-WebRequest`, nicht die Programme.
- Objekte zurückgeben, keinen formatierten Text: kein `Format-Table` oder `Write-Host` in einer Funktion,
  deren Ausgabe weiterverwendet wird; `Write-Verbose` für den Fortschritt und `Write-Output` oder eine
  implizite Rückgabe für das Ergebnis verwenden.

## CR-powershell-toolchain
<!-- source: 2d9a7d4ed9ab2ca9 -->
Lint und Tests
summary: PSScriptAnalyzer für Lint, Pester 5 für Tests, oder was das Projekt eingerichtet hat

- `PSScriptAnalyzer` (`Invoke-ScriptAnalyzer -Path . -Recurse`) ist der übliche Linter des Templates; seine
  Einstellungen in einer `PSScriptAnalyzerSettings.psd1` im Projekt halten und keine Regeln pauschal
  ausschließen.
- `Pester` ist der übliche Test Runner; zuerst die installierte Hauptversion prüfen (`Get-Module Pester
  -ListAvailable`) — Pester 5 braucht `BeforeAll` für das Setup, und Code zur Discovery-Zeit unterscheidet
  sich von Code zur Laufzeit, daher laufen Tests für Pester 3/4 nicht unverändert. Mit `Invoke-Pester -CI`
  ausführen.
- In beiden Fällen ausführen, was das Projekt konfiguriert hat, und nichts ungefragt installieren
  (`R-code-tools`).

## python
<!-- source: a65faf9791aea834 -->
Coding-Regeln — Python
summary: strikte Annotationen, stdlib zuerst, Datenmodelle, Modulaufbau, Toolchain, Tests

Regeln für Python 3 mit Typannotationen, einer Vorliebe für die Standardbibliothek und automatisiertem
Linting. Gruppen-IDs (`CR-python-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck
nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-python-basics
<!-- source: c03ef771d847127a -->
Bewährte Python-Standards
summary: Annotationen, f-strings, Context Manager, Exception-Behandlung, venv, Lint

- Jede Funktionssignatur annotieren (Parameter und Rückgabewert), auch interne/private Funktionen.
- f-strings verwenden, nicht `%`-Formatierung oder `.format()`.
- `with` für alles verwenden, was geöffnet und geschlossen werden muss (Dateien, Locks, Verbindungen).
- Nie ein veränderliches Default-Argument verwenden (`def f(x: list = [])`) — als Default `None` setzen und
  im Funktionsrumpf initialisieren.
- Spezifische Exception-Typen abfangen; nie ein nacktes `except Exception` ohne erneutes Auslösen oder
  Loggen. Jeder ausgelöste oder geloggte Fehler nennt, was woran gescheitert ist, mit welchem Wert — wer
  aufruft oder das Log liest, muss die Ursache finden, ohne den Quellcode zu öffnen.
- `is`/`is not` nur für Identitätsvergleiche verwenden (`None`, Singletons), nie für Werte.
- Ein Virtual Environment (`venv`) pro Projekt, Abhängigkeiten in einer Lockfile festgeschrieben
  (`requirements.txt`, `poetry.lock`); nie eine globale Installation von Projektabhängigkeiten.
- Lint ist der Standard des Stacks und gehört ins Projekt; ausführen, was installiert ist, nichts
  ungefragt installieren.

## CR-python-stdlib-first
<!-- source: 690cc47cc736f5d7 -->
Standardbibliothek vor einer neuen Abhängigkeit
summary: zuerst zur stdlib greifen, bevor ein Paket hinzukommt

- Die Standardbibliothek einer zusätzlichen externen Abhängigkeit vorziehen; eine hinzufügen, nur wo die
  stdlib wirklich nicht ausreicht.

## CR-python-data-models
<!-- source: e6059b6a4a744461 -->
Typisierte Daten statt loser dicts
summary: dataclasses, TypedDict oder pydantic für strukturierte Daten

- Strukturierte Daten mit `dataclasses`, `TypedDict` oder `pydantic` modellieren, nicht mit einem losen
  `dict`.

## CR-python-module-structure
<!-- source: 1892c2da9b9a4c86 -->
Ein Modul pro Verantwortung
summary: Modulgrenzen, keine zirkulären Imports

- Ein Modul pro fachlicher Verantwortung, kein Sammelmodul ohne klare Grenze.
- Zirkuläre Imports durch Korrektur der Modulgrenzen auflösen, nicht durch Umgehung mit verzögerten oder
  lokalen Imports.

## CR-python-toolchain
<!-- source: 0f86ea1fa0876228 -->
Lint- und Format-Tooling
summary: standardmäßig ruff für Lint und Formatierung, oder was das Projekt eingerichtet hat

- `ruff` für Linting und Formatierung ist die übliche Wahl des Templates; `black` bleibt in bestehenden
  Projekten eine verbreitete Alternative für die Formatierung — in beiden Fällen ausführen, was das Projekt
  tatsächlich konfiguriert hat (siehe `R-code-tools`).

## CR-python-tests
<!-- source: 45c09e28763d538d -->
Unit-Tests
summary: standardmäßig pytest, oder der Test Runner, den das Projekt eingerichtet hat

- `pytest` ist die übliche Wahl des Templates, mit Fixtures statt wiederholtem Setup-Code in jedem
  Testmodul; den Test Runner verwenden, den das Projekt tatsächlich konfiguriert hat (siehe `R-code-tools`).

## react
<!-- source: c0bdebf2f0ad5ae3 -->
Coding-Regeln — React
summary: Rules of Hooks, Keys, Effekte nur zur Synchronisierung, Änderungen in React 19, Server Components, Testing Library

Regeln für React. Sie gelten zusammen mit `javascript` oder `typescript` — einen der beiden ebenfalls
ankreuzen; das Template kann „eines von beiden“ nicht als Voraussetzung ausdrücken. Versionsabhängige Punkte
nennen die Version, die sie brauchen; zuerst die installierte React-Version prüfen (`R-code-version`).
Gruppen-IDs (`CR-react-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr
gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-react-components
<!-- source: 5add43eed48e1c2e -->
Komponenten, Hooks und Keys
summary: Rules of Hooks, reines Rendern, stabile Keys, kein aus Props kopierter State

- Hooks nur auf oberster Ebene einer Komponente oder eines eigenen Hooks aufrufen, nie in einer Bedingung,
  Schleife oder verschachtelten Funktion; die Regeln von `eslint-plugin-react-hooks` bleiben an und werden
  nicht zum Schweigen gebracht.
- Das Rendern rein halten: keine Mutation von Props oder State, kein Fetch, Timer oder `Date.now()` im
  Render-Rumpf.
- `key` ist eine stabile ID aus den Daten, nie der Array-Index bei einer Liste, die sich umordnen, ergänzen
  oder kürzen kann, und nie `Math.random()`.
- Eine Prop nicht in den State kopieren, um ihn zu „initialisieren“; die Prop verwenden oder den State
  nach oben verlagern.
- Komponenten auf Modulebene definieren, nie innerhalb einer anderen Komponente: Eine verschachtelte
  Definition mountet ihren Teilbaum bei jedem Rendern neu.
- Memoisieren (`useMemo`, `useCallback`, `memo`) nur bei einem gemessenen Problem; ist der React Compiler im
  Projekt aktiviert, vorhandene handgeschriebene Memoisierung in Ruhe lassen (die Doku des Compilers rät
  dazu) und keine neue hinzufügen; sie erst nach sorgfältigem Testen entfernen.

## CR-react-effects
<!-- source: c932f0759ef5d5e8 -->
Effekte nur zur Synchronisierung mit der Außenwelt
summary: kein abgeleiteter State in Effekten, vollständige Abhängigkeiten, Cleanup, Daten laden nach Wahl des Projekts

- Ein Effekt synchronisiert mit etwas außerhalb von React (Netzwerk, Subscription, DOM-API, Timer). Alles,
  was sich aus Props und State berechnen lässt, wird beim Rendern berechnet; die Folge eines Events gehört
  in den Handler.
- Ein `useEffect`, der nur `setState` aus anderem State aufruft, ist ein Fehler in Wartestellung: den Wert
  ableiten oder durch Ändern des `key` der Komponente zurücksetzen.
- Jeden reaktiven Wert, den der Effekt liest, als Abhängigkeit deklarieren; eine falsche Liste durch
  Umbau beheben, nie durch Entfernen der Abhängigkeit oder Abschalten der Lint-Regel.
- Für jede Subscription, jeden Timer und jede Anfrage ein Cleanup zurückgeben (`AbortController`); Effekte
  laufen in der Entwicklung unter `StrictMode` beim Mounten zweimal, und der Code muss das überstehen.
- Den Ansatz zum Laden von Daten verwenden, den das Projekt schon hat (TanStack Query, SWR,
  Framework-Loader); kein selbstgebautes `fetch` in einem Effekt, wo es einen gibt.

## CR-react-19
<!-- source: 5004c45165b5eac3 -->
Änderungen in React 19 und später
summary: ref als Prop, use, Actions, Context Provider, entfernte APIs

- Ab React 19 nimmt eine Funktionskomponente `ref` als normale Prop; `forwardRef` ist im neuen Code nicht
  nötig. Unter React 18 und früher bleibt `forwardRef`.
- `use(promise)` und `use(context)` lesen beim Rendern ein Promise oder einen Context und dürfen anders als
  andere Hooks in einer Bedingung aufgerufen werden. Das Promise kommt aus einem Cache oder einer
  Elternkomponente, nicht aus demselben Rendern.
- Formularbehandlung: eine Funktion als `<form action>`, `useActionState` (früher `useFormState`),
  `useFormStatus` (aus `react-dom`) und `useOptimistic` ersetzen handgeschriebenen Pending- und
  Fehler-State.
- In 19 entfernt, nicht schreiben: `propTypes` und `defaultProps` an Funktionskomponenten,
  `ReactDOM.render` und `hydrate` (`createRoot`/`hydrateRoot` verwenden), String-Refs, Legacy Context.
- `useEffectEvent` gibt es ab React 19.2; davor den neuesten Wert in einem Ref halten.

## CR-react-structure
<!-- source: 73e7069460bc028e -->
Server Components und Tests
summary: Server Components nur mit unterstützendem Framework, Grenze mit "use client", Testing Library nach Rolle

- Server Components, `"use server"` und `"use client"` brauchen ein Framework oder einen Bundler, der sie
  unterstützt (Next.js App Router; die Unterstützung in React Router ist noch experimentell). In einer
  schlichten Vite-Single-Page-App gibt es sie nicht; die Direktiven dort nicht hinzufügen.
- Mit Server Components ist eine Komponente standardmäßig eine Server Component: kein State, keine Effekte,
  keine Browser-APIs. `"use client"` auf das kleinste Blatt setzen, das Interaktivität braucht; Props über
  die Grenze müssen serialisierbar sein.
- Mit `@testing-library/react` und `user-event` testen: Elemente so finden, wie ein Nutzer es täte, nach
  Rolle, Label oder Text, nicht nach Klassenname oder Interna; `findBy…` den festen Wartezeiten vorziehen.
- Tests mit dem Runner ausführen, den das Projekt eingerichtet hat (Vitest oder Jest), und das Netzwerk an
  seiner Grenze mocken (`msw`), nicht die eigenen Module der Komponente.

## rust
<!-- source: 522b647c0d45c1ca -->
Coding-Regeln — Rust
summary: Fehlerbehandlung, Ownership und unsafe, Edition und Toolchain, Tests

Regeln für Rust-Projekte, die mit Cargo gebaut werden. Gruppen-IDs (`CR-rust-<name>`) sind stabil und werden
nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-rust-basics
<!-- source: 19dd3c6efdc43d2f -->
Fehlerbehandlung, Ownership, unsafe
summary: kein unwrap/expect in Bibliothekscode, kein clone gegen den Borrow Checker, unsafe nur mit SAFETY-Kommentar

- Bibliothekscode löst bei einem behebbaren Zustand nie einen `panic` aus: kein `unwrap()`/`expect()`, keine
  Indizierung, die bei externer Eingabe außerhalb der Grenzen liegen kann, kein `panic!` für falsche
  Argumente — `Result` zurückgeben und den Aufrufer entscheiden lassen. `unwrap()`/`expect()` sind in
  Tests, in Beispielen und in `main` bei Startfehlern erlaubt; `expect("...")` nennt dann die verletzte
  Annahme, nicht das Symptom.
- Fehler als typisierte Werte definieren: in Bibliotheken ein Fehler-`enum` (mit `thiserror`, wenn das
  Projekt es hat), `anyhow` oder `Box<dyn Error>` nur in der obersten Schicht des Binaries. Jeder Fehler
  nennt, was mit welchem Wert gescheitert ist; mit `?` weiterreichen und Kontext hinzufügen, statt die
  Ursache zu verwerfen.
- Kein `.clone()` hinzufügen, um den Borrow Checker zum Schweigen zu bringen. Zuerst Borgen versuchen
  (`&T`, `&mut T`), eine kürzere Lifetime, den Code umstrukturieren oder `Rc`/`Arc`, wo geteilter Besitz
  real ist; nur klonen, wenn ein eigener, besessener Wert gemeint ist.
- In Parametern `&str`, `&[T]` und `&Path` statt `&String`, `&Vec<T>`, `&PathBuf` nehmen.
- Jeder `unsafe`-Block trägt einen `// SAFETY:`-Kommentar, der die Invariante nennt, die ihn korrekt macht,
  und umschließt so wenig Code wie möglich; jede `unsafe fn` dokumentiert ihren Vertrag unter `# Safety`.
  Nicht zu `unsafe` greifen, um einen Compilerfehler zu umgehen.
- Ein `Result` oder einen `#[must_use]`-Wert nie ohne genannten Grund mit `let _ =` ignorieren.
- Warnungen nicht pauschal unterdrücken (`#![allow(warnings)]`); ein `#[allow(clippy::...)]` nennt die
  Lint-Regel und den Grund.

## CR-rust-edition-toolchain
<!-- source: e490f14418d307c6 -->
Edition, Formatierung, Lint
summary: Edition aus Cargo.toml, rust-version, cargo fmt, clippy mit abgelehnten Warnungen

- Die Edition (`edition = "2021"` oder `"2024"`) und die Mindestversion von Rust (`rust-version`) aus
  `Cargo.toml` lesen und Code schreiben, der unter ihnen kompiliert: Die Edition 2024 braucht Rust 1.85 oder
  neuer und ändert unter anderem die `unsafe`-Regeln für `extern`-Blöcke und den Geltungsbereich von
  Temporaries; keine Syntax und keine Bibliotheksbestandteile verwenden, die neuer sind als `rust-version`
  (`R-code-version`). Die Edition nicht ungefragt ändern.
- Mit `cargo fmt` (rustfmt) formatieren und mit `cargo clippy --all-targets -- -D warnings` linten — die
  übliche Wahl des Templates; ausführen, was das Projekt konfiguriert hat (siehe `R-code-tools`), und nichts
  ungefragt installieren.
- `Cargo.lock` für Binaries und, nach dem aktuellen Rat von Cargo, auch für Bibliotheken committen;
  Abhängigkeiten gering halten und die Standardbibliothek bevorzugen, wo sie genügt. Nur die Crate-Features
  aktivieren, die verwendet werden.

## CR-rust-tests
<!-- source: 6f119387be6a0088 -->
cargo test
summary: standardmäßig cargo test, Unit-Tests neben dem Code, Integrationstests in tests/, Doc-Tests

- `cargo test` ist der übliche Runner des Templates; den verwenden, den das Projekt eingerichtet hat (zum
  Beispiel `cargo nextest` — siehe `R-code-tools`).
- Unit-Tests in ein `#[cfg(test)] mod tests` neben den Code legen, Integrationstests in `tests/`, und
  Beispiele in Doc-Kommentaren als Doc-Tests kompilierbar halten.
- Tests nach dem erwarteten Verhalten benennen. Nie Zufall ohne festen Seed verwenden und nie mit
  `thread::sleep` warten; stattdessen auf die tatsächliche Bedingung warten.

## sql
<!-- source: d78785b1cb6b6a1e -->
Coding-Regeln — SQL
summary: Abfragesicherheit, Transaktionen, Indizes, Benennung, Migrationen

Regeln für Schemaänderungen und Datenbankzugriff aus Anwendungscode. Gruppen-IDs (`CR-sql-<name>`) sind
stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird
in diesem Kopf als `retired:` aufgeführt.

## CR-sql-basics
<!-- source: 3bc1f5f759d33efc -->
Abfragesicherheit und Schemadisziplin
summary: parametrisierte Abfragen, Transaktionen, UTC, Indizes, keine versteckte Logik, Locking

- Ausschließlich parametrisierte Abfragen verwenden — nie eine Abfrage bauen, indem Werte in den SQL-String
  konkateniert werden, in jeder Sprache und mit jedem Treiber.
- Im Anwendungscode nie `SELECT *`; Spalten ausdrücklich benennen, damit eine Schemaänderung sichtbar
  bricht, statt unbemerkt zu verändern, was eine Abfrage zurückgibt.
- Mehrschrittige Schreibvorgänge in einer Transaktion bündeln; Teilfehler nicht nachträglich von Hand
  abgleichen.
- Zeitstempel in UTC speichern; erst in der Darstellungsschicht in eine Zeitzone umrechnen.
- Jede Fremdschlüsselspalte mit einem Index versehen — ohne Index werden Joins und kaskadierende Löschungen
  mit wachsender Tabelle langsamer.
- Anwendungslogik aus Stored Procedures und Triggern heraushalten; Logik, die im Anwendungscode nicht
  sichtbar ist, lässt sich nicht reviewen.
- Eine Änderung des Spaltentyps bei einer großen Tabelle auf Lock-Verhalten und erwartete Laufzeit prüfen,
  bevor sie live ausgeführt wird.

## CR-sql-naming
<!-- source: eb7842a7f235e9c5 -->
Benennung von Bezeichnern
summary: snake_case, Tabellen im Plural, Spalten im Singular

- Tabellen und Spalten in `snake_case` benennen.
- Für Tabellennamen den Plural verwenden, für Spaltennamen den Singular.

## CR-sql-migrations
<!-- source: 1555ff10f74b12c8 -->
Migrationsdisziplin
summary: versionierte Benennung, idempotent, umkehrbar, ein Werkzeug

- Migrationen mit einer Version (laufende Nummer oder Zeitstempel) plus Beschreibung benennen; eine Datei
  pro Änderung.
- Migrationen idempotent schreiben (`IF NOT EXISTS` oder eine Existenzprüfung) — ein erneuter Lauf über
  einen bereits migrierten Stand darf nicht fehlschlagen.
- Zu jeder Migration eine Down-Migration mitliefern, wo das Migrationswerkzeug das unterstützt.
- Ein Migrationswerkzeug konsequent verwenden (z. B. Flyway, Prisma Migrate, Alembic); nicht mischen.

## tailwind
<!-- source: 64187d320bfffffa -->
Coding-Regeln — Tailwind
summary: Utility-first-Styling, Design Tokens, Dark Mode, Sortierung der Klassen

Regeln für Tailwind CSS, meist innerhalb eines Frontend-Frameworks eingesetzt. Gruppen-IDs
(`CR-tailwind-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt,
bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

## CR-tailwind-basics
<!-- source: 71bf25ae302027e0 -->
Bewährte Tailwind-Standards
summary: Utilities im Markup, Tokens, Theme, Dark Mode, Extraktion, Tooling, Fallstricke

- Utility-Klassen direkt im Markup schreiben; keine separaten CSS-Dateien ohne konkreten Grund.
- Design Tokens (die Skala für Abstände, Farben und Radien aus der Konfiguration) statt beliebiger Werte
  verwenden — `p-[13px]` nur als dokumentierte Ausnahme.
- Theme-Änderungen (Farben, Schriften, Breakpoints) zentral in der Tailwind-Konfiguration halten, nicht über
  Dateien verstreut.
- Dark Mode über die konfigurierten Tokens/Varianten abbilden, nie über parallele hartkodierte Farbwerte.
- Eine wiederholte Klassenkombination in eine Komponente/ein Partial auslagern; nie als Textschnipsel
  herumkopieren.
- Lint-/Format-Tooling ist der Standard des Stacks und gehört ins Projekt: `prettier-plugin-tailwindcss` für
  die automatische Sortierung der Klassen (Layout, Box-Modell, Typografie, Farbe, Zustand), vom Formatter
  erzwungen statt von Hand sortiert. Ausführen, was installiert ist, nichts ungefragt installieren.
- Fallstricke:
  - `@apply` nur in Ausnahmen verwenden (z. B. Basisstile einer Drittanbieter-Komponente), nie als
    Standardweg zum Stylen.
  - Die Quellenerkennung korrekt halten — v3: die `content`-Pfade in der Konfiguration; v4 und neuer:
    automatisch, mit `@source` für Ergänzungen. Eine falsche oder fehlende Quelle lässt entweder tatsächlich
    genutzte Klassen wegfallen oder lässt ungenutzte Utility-Klassen im Build.

## typescript
<!-- source: c1dd0390eb1f8881 -->
Coding-Regeln — TypeScript
summary: Strict Mode, kein any, typisierte Fehler, Modulaufbau, Tooling

Regeln für TypeScript-Projekte im Strict Mode. Gruppen-IDs (`CR-typescript-<name>`) sind stabil und werden
nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-typescript-basics
<!-- source: 995bd336a8753935 -->
Strict Mode, Narrowing, typisierte Fehler
summary: strict, kein any, Rückgabetypen, as/!, Fehlerbehandlung, Lint

- `strict: true` in `tsconfig.json` aktivieren; nur mit einem Kommentar lockern, der den Grund nennt.
- Nie `any` verwenden — unbekannte Werte als `unknown` typisieren und vor der Verwendung eingrenzen.
- Die Grenze ziehen, wo Strenge nicht mehr hilft: Ein Typ, der tiefer verschachtelt ist als der Code, den er
  beschreibt (stark verschachtelte Generics, verkettete Conditional Types, überdehnte Mapped Types), ist
  schlechter als ein einfacherer. Auf `unknown` mit einer Prüfung an der Grenze zurückfallen oder auf ein
  schmales `interface` nur für die benutzten Felder, mit einem Kommentar, der den Grund nennt — die Ausnahme
  dient der Lesbarkeit, nicht der Bequemlichkeit, und `any` bleibt auch hier ausgeschlossen.
- Exportierten Funktionen einen expliziten Rückgabetyp geben, statt sich auf Inferenz zu verlassen.
- `as Type` nur verwenden, wenn Narrowing die Aufgabe nicht erfüllen kann, und den Grund in einem Kommentar
  nennen.
- Nie die Non-null-Assertion (`!`) verwenden — sie unterdrückt eine echte Nullability-Prüfung.
- Fehler als typisierte Error-Objekte auslösen, nie einen beliebigen Wert mit `throw` werfen; was auch immer
  geworfen, geloggt oder erneut geworfen wird, dessen Meldung nennt, was woran gescheitert ist — wer
  aufruft, muss die Ursache finden, ohne den Quellcode zu öffnen.
- Lint und Typecheck (`tsc --noEmit`) sind der Standard des Stacks und gehören ins Projekt; ausführen, was
  installiert ist, nichts ungefragt installieren.

## CR-typescript-conventions
<!-- source: 8834a2e54c129055 -->
interface, type, Generics
summary: interface für Strukturen, type für Unions, keine Enums, Generics ab der zweiten Verwendung

- `interface` für Objektstrukturen/Verträge verwenden, `type` für Unions, Intersections und abgeleitete
  Typen.
- Enums vermeiden — stattdessen `as const`-Objekte oder Union-Literaltypen verwenden.
- Ein Generic erst einführen, wenn es eine zweite konkrete Verwendung gibt; für die erste genügt ein
  konkreter Typ.

## CR-typescript-module-structure
<!-- source: 71bea2bc6f737512 -->
Zentrale Typen, explizite Exports
summary: gemeinsame Typen an einem Ort, öffentliche Exports über einen Index

- Gemeinsame Typen/Schemas an einer zentralen Stelle definieren und von dort importieren, statt sie pro
  Modul neu zu deklarieren.
- Die öffentliche API eines Moduls über einen expliziten Index bereitstellen, nicht über tiefe Importpfade
  in ein anderes Modul.

## CR-typescript-toolchain
<!-- source: 05cf1f3a8aa1903a -->
Lint- und Format-Tooling
summary: standardmäßig ESLint mit `@typescript-eslint` plus Prettier, oder was das Projekt eingerichtet hat

- ESLint mit `@typescript-eslint` und Prettier für die Formatierung sind die übliche Wahl des Templates;
  maßgeblich ist, was das Projekt tatsächlich installiert und konfiguriert hat (siehe `R-code-tools`).

## vue
<!-- source: 82101ec282385d0b -->
Coding-Regeln — Vue
summary: Composition API, typisierte Props, SFC-Reihenfolge, gemeinsamer Zustand, Tooling

requires: typescript

Regeln für Vue-3-Komponenten mit der Composition API. Gruppen-IDs (`CR-vue-<name>`) sind stabil und werden
nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

## CR-vue-basics
<!-- source: cea36fff796e4b43 -->
Composition API, typisierte Props, sichere Formulare
summary: script setup, typisierte Props/Emits, Konventionen, Fehlerbehandlung, Fallstricke

- In jeder Komponente `<script setup lang="ts">` verwenden; im neuen Code keine Options API.
- `defineProps<...>()` und `defineEmits<...>()` typisieren — keine losen Objekt-Props.
- Keine Geschäftslogik im `<template>` — Berechnungen in `computed` oder eine Methode verlagern.
- `ref` für primitive/atomare Werte wählen, `reactive` nur für den zusammenhängenden Zustand eines Objekts.
- Composables mit einem Namen `useX` und einem expliziten Rückgabetyp versehen, wenn er nicht trivial
  inferiert wird.
- Einen Watcher/Effect, der eine Ressource bindet (Timer, Listener), aufräumen, sobald er nicht mehr
  gebraucht wird.
- Fehler bei Aufrufen in Komponenten und Composables bewusst abfangen: dort sichtbar machen, wo das Template
  sie anzeigen kann, oder erneut werfen — nie stillschweigend verschlucken; die Meldung nennt, was woran
  gescheitert ist. `onErrorCaptured` verwenden, um den Fehler einer Kindkomponente gezielt zu behandeln,
  nicht als globales Auffangbecken.
- Lint ist der Standard des Stacks und gehört ins Projekt; ausführen, was installiert ist, nichts
  ungefragt installieren.
- Fallstricke:
  - Nie `v-if` und `v-for` am selben Element kombinieren.
  - Eine Prop nie direkt verändern — eine Änderung dem Parent über ein Event melden.
  - **Sicherheit:** Ein Formular mit `@submit.prevent` braucht zusätzlich `method="post"` am
    `<form>`-Element. Der Handler existiert erst, wenn die Hydration abgeschlossen ist; ein Absenden vor
    diesem Zeitpunkt (ein Passwortmanager, der Enter drückt, eine langsame Verbindung, ein blockiertes
    JS-Bundle) löst das native Absenden des Browsers aus. Ohne `method` ist das ein GET auf die aktuelle
    URL — ein Formular mit Zugangsdaten legt die Werte in die Adressleiste, den Browserverlauf und das
    Serverlog. Gilt für jede serverseitig gerenderte App, nicht nur für Auth-Formulare (siehe
    GHSA-gj2h-2fpw-fhv9, derselbe Fehler in `@nuxt/ui` vor 4.8.1).

## CR-vue-sfc-order
<!-- source: ef8ad68cef09f408 -->
Feste Reihenfolge der SFC-Blöcke
summary: template, script setup, style

- SFC-Blöcke in der Reihenfolge `<template>`, `<script setup>`, `<style>` anordnen.

## CR-vue-state-store
<!-- source: aae2a239ebd6cd85 -->
Store-Modul für gemeinsamen Zustand
summary: Pinia-Store statt provide/inject

- Zustand, der in der ganzen App geteilt wird, in einem eigenen Store-Modul (Pinia) halten, nicht in
  `provide`/`inject`.

## CR-vue-toolchain
<!-- source: 01c4f76f6cb4b091 -->
Lint- und Format-Tooling
summary: standardmäßig ESLint mit eslint-plugin-vue plus Prettier, oder was das Projekt eingerichtet hat

- ESLint mit `eslint-plugin-vue` und Prettier für die Formatierung sind die übliche Wahl des Templates;
  maßgeblich ist, was das Projekt tatsächlich installiert und konfiguriert hat (siehe `R-code-tools`).

## _intro
<!-- source: 2ca805618d3642f7 -->
Ein Projekt schaltet einen Satz in `docs/project/coding_rules.md` ein; Gruppen-IDs `CR-<set>-<name>` sind stabil.
