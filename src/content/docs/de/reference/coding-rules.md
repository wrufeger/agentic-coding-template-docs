---
title: "Coding-Regeln"
description: "Die Coding-Regelsätze je Sprache oder Framework mit ihren Gruppenkennungen."
sidebar:
  order: 8
---

:::note
Diese Seite wird aus dem Template 2.0.0 (Commit 1829319) erzeugt; die deutschen Texte stammen aus einem Katalog unter `src/translations/de/reference/`. Nicht von Hand ändern, neu erzeugen mit `npm run gen`.
:::

11 Regelsätze mit 39 Gruppen. Ein Projekt schaltet einen Satz in `docs/project/coding_rules.md` ein; Gruppen-IDs `CR-<set>-<name>` sind stabil.

## bash

**Coding-Regeln — Bash**

Quelle: `.act/coding/bash.md`

Kurzfassung: Strict Mode, Quoting, Exit-Codes, Fehlermeldungen, shellcheck, Fallstricke

Regeln für Bash-Skripte. Gruppen-IDs (`CR-bash-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-bash-basics

**Strict Mode, Quoting, Fehlerbehandlung, shellcheck**

Kurzfassung: set -euo pipefail, Quoting, bewusste Exit-Codes, Fehler auf stderr, shellcheck, Fallstricke

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

### CR-bash-script-shape

**Ein Skript, ein Zweck**

Kurzfassung: Kopfkommentar, Funktionen statt Duplikation, Skripte mit nur einem Zweck

- Mit einem Kopfkommentar beginnen, der Zweck, einen Beispielaufruf und die erwartete Ausgabe bzw. das
  Exit-Verhalten nennt.
- Wiederverwendbare Abschnitte als Funktionen schreiben, statt dieselbe Befehlsfolge zu kopieren.
- Ein Skript, ein klar benannter Zweck — kein Mehrzweck-Skript mit Modus-Flags für unzusammenhängende
  Aufgaben.

## csharp

**Coding-Regeln — C#**

Quelle: `.act/coding/csharp.md`

Kurzfassung: Nullable-Kontext, async-Konventionen, Fehlerbehandlung, Analyzer, DI, Bibliothekscode

Regeln für C#-Projekte. Gruppen-IDs (`CR-csharp-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-csharp-basics

**Nullable-Kontext, async, Fehlerbehandlung, Analyzer**

Kurzfassung: Nullable aktiviert, Async-Suffix, kein async void, kein Blockieren auf Tasks, using, Exceptions

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

### CR-csharp-conventions

**var, Records, ein Typ pro Datei**

Kurzfassung: var nur bei offensichtlichem Typ, Records für Value Objects, ein öffentlicher Typ pro Datei

- `var` nur verwenden, wenn der Typ aus der rechten Seite offensichtlich ist, sonst den Typ ausschreiben.
- Records für unveränderliche Value Objects/DTOs verwenden, Klassen für Objekte mit Identität und
  Verhalten.
- Ein öffentlicher Typ pro Datei, der Dateiname entspricht dem Typnamen.

### CR-csharp-dependency-injection

**Constructor Injection**

Kurzfassung: Constructor Injection, kein Service Locator

- Abhängigkeiten über den Konstruktor injizieren; kein versteckter Zugriff über einen Service Locator.

### CR-csharp-library-code

**ConfigureAwait in Bibliothekscode**

Kurzfassung: ConfigureAwait(false) in Code ohne UI-Kontext

- In Bibliothekscode ohne Abhängigkeit von einem UI-Kontext `ConfigureAwait(false)` verwenden.

## go

**Coding-Regeln — Go**

Quelle: `.act/coding/go.md`

Kurzfassung: strikte Fehlerprüfung, Werkzeuge für statische Analyse, Paketdesign

Regeln für Go-Projekte. Gruppen-IDs (`CR-go-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-go-basics

**Fehlerbehandlung, Formatierung, statische Analyse**

Kurzfassung: Fehler prüfen und wrappen, mit gofmt formatieren, vet/staticcheck ausführen, Panics und Leaks vermeiden

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

### CR-go-package-design

**Kleine Interfaces, keine Sammelpakete**

Kurzfassung: Interfaces vom Konsumenten definiert, Pakete nach Domäne benannt und geschnitten

- Interfaces auf der Seite des Konsumenten definieren (klein, oft ein oder zwei Methoden), nicht vorab vom
  Anbieter, der sie implementiert.
- Pakete mit kurzen, aussagekräftigen Namen nach Domäne schneiden; kein Sammelpaket `util`/`common` ohne
  eigenen Gegenstand.

## java

**Coding-Regeln — Java**

Quelle: `.act/coding/java.md`

Kurzfassung: Nullability, Fehlerbehandlung, Struktur, Toolchain, Tests

Regeln für Java-Projekte. Gruppen-IDs (`CR-java-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-java-basics

**Nullability, Fehlerbehandlung, bekannte Fallstricke**

Kurzfassung: explizite Nullability, keine Raw Types, korrekte Exception-Behandlung, sicheres Logging und SQL

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

### CR-java-modern-idioms

**Records, Sealed Types, Text Blocks, Virtual Threads**

Kurzfassung: moderne Sprachfeatures, meist ab Java 17, Virtual Threads ab Java 21

- Records für unveränderliche Datenträger (DTOs, Value Objects) verwenden statt einer handgeschriebenen
  Klasse mit Gettern, `equals`, `hashCode` und Konstruktor — erfordert Java 17 (Records) bzw. 16 (Preview).
- Sealed Interfaces/Classes mit Pattern Matching (`switch` auf den Typ) statt `instanceof`-Ketten
  verwenden — erfordert Java 17.
- Text Blocks für mehrzeilige Strings (SQL, JSON-Vorlagen) statt Konkatenation verwenden — erfordert
  Java 17.
- Virtual Threads nur verwenden, wo die Laufzeit und jede Bibliothek auf dem Weg sie unterstützen —
  erfordert Java 21.

### CR-java-structure

**Paketschnitt, Immutability, Constructor Injection**

Kurzfassung: Pakete nach Domäne, Immutability als Standard, Constructor Injection

- Pakete nach fachlicher Domäne schneiden, nicht nach technischer Schicht.
- Sichtbarkeit so eng wie möglich halten, Felder `final`, kein Setter ohne Grund — Immutability ist der
  Standard und der beste Schutz gegen Nebenläufigkeitsfehler.
- Constructor Injection statt Field Injection verwenden, auch außerhalb eines DI-Containers.

### CR-java-toolchain

**Build- und Analysewerkzeuge**

Kurzfassung: standardmäßig Maven oder Gradle; statische Analyse mit dem, was das Projekt eingerichtet hat

- Mit Maven oder Gradle bauen — das Projekt entscheidet, womit.
- Formatierung und statische Analyse in der CI erzwingen: Spotless oder google-java-format für die
  Formatierung, dazu Checkstyle, SpotBugs, Error Prone oder PMD — die übliche Wahl des Templates; ausführen,
  was das Projekt tatsächlich eingerichtet hat (siehe `R-code-tools`).

### CR-java-tests

**Standardmäßig JUnit 5 mit AssertJ**

Kurzfassung: standardmäßig JUnit 5/AssertJ, Testnamen beschreiben das Verhalten, keine Zufallswerte ohne Seed, kein Thread.sleep

- Tests mit JUnit 5 und AssertJ schreiben — die übliche Wahl des Templates; stattdessen das Test-Framework
  verwenden, das das Projekt tatsächlich eingerichtet hat (siehe `R-code-tools`).
- Tests nach dem erwarteten Verhalten benennen, nicht nach der getesteten Methode.
- Nie Zufall ohne festen Seed verwenden.
- Nie mit `Thread.sleep` warten; stattdessen auf die tatsächliche Bedingung warten.

## nuxt

**Coding-Regeln — Nuxt**

Quelle: `.act/coding/nuxt.md`

Kurzfassung: Verzeichniskonventionen, Datenabruf, Runtime-Konfiguration, SSR-Modus, Tooling

requires: vue, typescript

Regeln für Nuxt-Projekte. Gruppen-IDs (`CR-nuxt-<name>`) sind stabil und werden nie neu vergeben; eine
Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-nuxt-basics

**Bewährte Nuxt-Standards**

Kurzfassung: Verzeichnisstruktur, Datenabruf, typisierte Handler, Runtime-Konfiguration, Fallstricke

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

- Pfad-Aliase in `tsconfig.json` **und** `nuxt.config.ts` deklarieren. Seit Nuxt 4 zeigt `~` auf `app/`,
  ohne eigenen Eintrag löst `~/types` also woanders auf als `~types`.
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
    den nächsten freien Port aus, und HMR-/WebSocket-Fehler folgen. Den laufenden Prozess beenden
    (`netstat -ano | findstr :3000`, `taskkill /PID <pid> /F`; `lsof -i :3000`, `kill <pid>`), statt einen
    eigenen HMR-Port zu konfigurieren.

### CR-nuxt-root-folders

**Feste Root-Ordner mit eigenen Aliasen**

Kurzfassung: /types, /constants und /server im Repo-Root, jeweils der einzige Ort seiner Art

- Drei Ordner im Repository-Root halten, jeweils mit eigenem Alias und jeweils der einzige Ort seiner Art:
  `/types` (`~types`, gemeinsame Typen und Interfaces), `/constants` (`~constants`, Konstanten,
  Enumerationen, feste Schlüssel), `/server` (`~server`, das Nitro-Backend).
- Typen und Konstanten von dort importieren, statt sie in Komponenten zu duplizieren. Ein zweiter
  Typen-Ordner unter `app/types/` ist ein Fehler, keine Ergänzung.

### CR-nuxt-ssr

**Den SSR-Modus bewusst wählen**

Kurzfassung: vor der Annahme von SSR fragen, die Hydration-Kosten kennen, nach SSR-Arbeit auf Mismatches prüfen

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

### CR-nuxt-toolchain

**Lint- und Format-Tooling**

Kurzfassung: ESLint mit `@nuxt/eslint` plus Prettier, oder was das Projekt eingerichtet hat

- ESLint mit `@nuxt/eslint`, konfiguriert in `eslint.config.mjs`, und Prettier für die Formatierung sind die
  übliche Wahl des Templates; maßgeblich ist, was das Projekt tatsächlich installiert und konfiguriert hat
  (siehe `R-code-tools`).

### CR-nuxt-tests

**Unit- und End-to-End-Tests**

Kurzfassung: standardmäßig vitest/Playwright, aber die Suite, die das Projekt ausführt, muss bestehen

- `vitest` (`vitest.config.ts`) für Unit- und Komponententests, `@playwright/test`
  (`playwright.config.ts`) für End-to-End-Tests — die übliche Wahl des Templates; hat das Projekt einen
  anderen Test Runner installiert und konfiguriert (z. B. Selenium, Nightwatch, Cypress), stattdessen diesen
  verwenden (siehe `R-code-tools`).
- Welche Test-Suiten das Projekt tatsächlich hat, die existieren und laufen; eine Änderung, die sie bricht,
  ist nicht fertig.

## php

**Coding-Regeln — PHP**

Quelle: `.act/coding/php.md`

Kurzfassung: strict types, PSR-12/PSR-4, Exceptions, Prepared Statements, Toolchain

Regeln für PHP-Projekte (8.x und neuer). Gruppen-IDs (`CR-php-<name>`) sind stabil und werden nie neu
vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

### CR-php-basics

**Strict Types, sichere Fehler, sichere Abfragen**

Kurzfassung: strict_types, PSR-12/PSR-4, typisierte Methoden, Exceptions, PDO, Fehler in Produktion, statische Analyse

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

### CR-php-conventions

**Closures statt globaler Callbacks**

Kurzfassung: Arrow Functions und Closures statt globaler Callback-Funktionen

- Arrow Functions/Closures statt globaler Callback-Funktionen verwenden.

### CR-php-toolchain

**Formatter und Werkzeuge für statische Analyse**

Kurzfassung: standardmäßig PHP-CS-Fixer/PHP_CodeSniffer plus PHPStan/Psalm, oder was das Projekt eingerichtet hat

- PHP-CS-Fixer oder PHP_CodeSniffer, für PSR-12 konfiguriert, und PHPStan oder Psalm für die statische
  Analyse — die übliche Wahl des Templates; ausführen, was das Projekt tatsächlich eingerichtet hat
  (siehe `R-code-tools`).

## python

**Coding-Regeln — Python**

Quelle: `.act/coding/python.md`

Kurzfassung: strikte Annotationen, stdlib zuerst, Datenmodelle, Modulaufbau, Toolchain, Tests

Regeln für Python 3 mit Typannotationen, einer Vorliebe für die Standardbibliothek und automatisiertem
Linting. Gruppen-IDs (`CR-python-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck
nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-python-basics

**Bewährte Python-Standards**

Kurzfassung: Annotationen, f-strings, Context Manager, Exception-Behandlung, venv, Lint

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

### CR-python-stdlib-first

**Standardbibliothek vor einer neuen Abhängigkeit**

Kurzfassung: zuerst zur stdlib greifen, bevor ein Paket hinzukommt

- Die Standardbibliothek einer zusätzlichen externen Abhängigkeit vorziehen; eine hinzufügen, nur wo die
  stdlib wirklich nicht ausreicht.

### CR-python-data-models

**Typisierte Daten statt loser dicts**

Kurzfassung: dataclasses, TypedDict oder pydantic für strukturierte Daten

- Strukturierte Daten mit `dataclasses`, `TypedDict` oder `pydantic` modellieren, nicht mit einem losen
  `dict`.

### CR-python-module-structure

**Ein Modul pro Verantwortung**

Kurzfassung: Modulgrenzen, keine zirkulären Imports

- Ein Modul pro fachlicher Verantwortung, kein Sammelmodul ohne klare Grenze.
- Zirkuläre Imports durch Korrektur der Modulgrenzen auflösen, nicht durch Umgehung mit verzögerten oder
  lokalen Imports.

### CR-python-toolchain

**Lint- und Format-Tooling**

Kurzfassung: standardmäßig ruff für Lint und Formatierung, oder was das Projekt eingerichtet hat

- `ruff` für Linting und Formatierung ist die übliche Wahl des Templates; `black` bleibt in bestehenden
  Projekten eine verbreitete Alternative für die Formatierung — in beiden Fällen ausführen, was das Projekt
  tatsächlich konfiguriert hat (siehe `R-code-tools`).

### CR-python-tests

**Unit-Tests**

Kurzfassung: standardmäßig pytest, oder der Test Runner, den das Projekt eingerichtet hat

- `pytest` ist die übliche Wahl des Templates, mit Fixtures statt wiederholtem Setup-Code in jedem
  Testmodul; den Test Runner verwenden, den das Projekt tatsächlich konfiguriert hat (siehe `R-code-tools`).

## sql

**Coding-Regeln — SQL**

Quelle: `.act/coding/sql.md`

Kurzfassung: Abfragesicherheit, Transaktionen, Indizes, Benennung, Migrationen

Regeln für Schemaänderungen und Datenbankzugriff aus Anwendungscode. Gruppen-IDs (`CR-sql-<name>`) sind
stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird
in diesem Kopf als `retired:` aufgeführt.

### CR-sql-basics

**Abfragesicherheit und Schemadisziplin**

Kurzfassung: parametrisierte Abfragen, Transaktionen, UTC, Indizes, keine versteckte Logik, Locking

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

### CR-sql-naming

**Benennung von Bezeichnern**

Kurzfassung: snake_case, Tabellen im Plural, Spalten im Singular

- Tabellen und Spalten in `snake_case` benennen.
- Für Tabellennamen den Plural verwenden, für Spaltennamen den Singular.

### CR-sql-migrations

**Migrationsdisziplin**

Kurzfassung: versionierte Benennung, idempotent, umkehrbar, ein Werkzeug

- Migrationen mit einer Version (laufende Nummer oder Zeitstempel) plus Beschreibung benennen; eine Datei
  pro Änderung.
- Migrationen idempotent schreiben (`IF NOT EXISTS` oder eine Existenzprüfung) — ein erneuter Lauf über
  einen bereits migrierten Stand darf nicht fehlschlagen.
- Zu jeder Migration eine Down-Migration mitliefern, wo das Migrationswerkzeug das unterstützt.
- Ein Migrationswerkzeug konsequent verwenden (z. B. Flyway, Prisma Migrate, Alembic); nicht mischen.

## tailwind

**Coding-Regeln — Tailwind**

Quelle: `.act/coding/tailwind.md`

Kurzfassung: Utility-first-Styling, Design Tokens, Dark Mode, Sortierung der Klassen

Regeln für Tailwind CSS, meist innerhalb eines Frontend-Frameworks eingesetzt. Gruppen-IDs
(`CR-tailwind-<name>`) sind stabil und werden nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt,
bekommt eine neue ID und wird in diesem Kopf als `retired:` aufgeführt.

### CR-tailwind-basics

**Bewährte Tailwind-Standards**

Kurzfassung: Utilities im Markup, Tokens, Theme, Dark Mode, Extraktion, Tooling, Fallstricke

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
  - Die `content`-Pfade in der Konfiguration korrekt halten — ein falscher oder fehlender Pfad lässt
    entweder tatsächlich genutzte Klassen wegfallen oder lässt ungenutzte Utility-Klassen im Build.

## typescript

**Coding-Regeln — TypeScript**

Quelle: `.act/coding/typescript.md`

Kurzfassung: Strict Mode, kein any, typisierte Fehler, Modulaufbau, Tooling

Regeln für TypeScript-Projekte im Strict Mode. Gruppen-IDs (`CR-typescript-<name>`) sind stabil und werden
nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

### CR-typescript-basics

**Strict Mode, Narrowing, typisierte Fehler**

Kurzfassung: strict, kein any, Rückgabetypen, as/!, Fehlerbehandlung, Lint

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

### CR-typescript-conventions

**interface, type, Generics**

Kurzfassung: interface für Strukturen, type für Unions, keine Enums, Generics ab der zweiten Verwendung

- `interface` für Objektstrukturen/Verträge verwenden, `type` für Unions, Intersections und abgeleitete
  Typen.
- Enums vermeiden — stattdessen `as const`-Objekte oder Union-Literaltypen verwenden.
- Ein Generic erst einführen, wenn es eine zweite konkrete Verwendung gibt; für die erste genügt ein
  konkreter Typ.

### CR-typescript-module-structure

**Zentrale Typen, explizite Exports**

Kurzfassung: gemeinsame Typen an einem Ort, öffentliche Exports über einen Index

- Gemeinsame Typen/Schemas an einer zentralen Stelle definieren und von dort importieren, statt sie pro
  Modul neu zu deklarieren.
- Die öffentliche API eines Moduls über einen expliziten Index bereitstellen, nicht über tiefe Importpfade
  in ein anderes Modul.

### CR-typescript-toolchain

**Lint- und Format-Tooling**

Kurzfassung: standardmäßig ESLint mit `@typescript-eslint` plus Prettier, oder was das Projekt eingerichtet hat

- ESLint mit `@typescript-eslint` und Prettier für die Formatierung sind die übliche Wahl des Templates;
  maßgeblich ist, was das Projekt tatsächlich installiert und konfiguriert hat (siehe `R-code-tools`).

## vue

**Coding-Regeln — Vue**

Quelle: `.act/coding/vue.md`

Kurzfassung: Composition API, typisierte Props, SFC-Reihenfolge, gemeinsamer Zustand, Tooling

requires: typescript

Regeln für Vue-3-Komponenten mit der Composition API. Gruppen-IDs (`CR-vue-<name>`) sind stabil und werden
nie neu vergeben; eine Gruppe, deren Zweck nicht mehr gilt, bekommt eine neue ID und wird in diesem Kopf als
`retired:` aufgeführt.

### CR-vue-basics

**Composition API, typisierte Props, sichere Formulare**

Kurzfassung: script setup, typisierte Props/Emits, Konventionen, Fehlerbehandlung, Fallstricke

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

### CR-vue-sfc-order

**Feste Reihenfolge der SFC-Blöcke**

Kurzfassung: template, script setup, style

- SFC-Blöcke in der Reihenfolge `<template>`, `<script setup>`, `<style>` anordnen.

### CR-vue-state-store

**Store-Modul für gemeinsamen Zustand**

Kurzfassung: Pinia-Store statt provide/inject

- Zustand, der in der ganzen App geteilt wird, in einem eigenen Store-Modul (Pinia) halten, nicht in
  `provide`/`inject`.

### CR-vue-toolchain

**Lint- und Format-Tooling**

Kurzfassung: standardmäßig ESLint mit eslint-plugin-vue plus Prettier, oder was das Projekt eingerichtet hat

- ESLint mit `eslint-plugin-vue` und Prettier für die Formatierung sind die übliche Wahl des Templates;
  maßgeblich ist, was das Projekt tatsächlich installiert und konfiguriert hat (siehe `R-code-tools`).
