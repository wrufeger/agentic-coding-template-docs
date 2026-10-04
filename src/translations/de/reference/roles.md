<!-- German catalog for the reference page "roles". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## builder
<!-- source: 18febb351480ec94 -->
Setzt eine abgegrenzte Aufgabe um - Code, Migration, Tests, Konfiguration - und liefert ein Ergebnis samt Beleg; committet nie.

## builder#about
<!-- source: 311a918b3b385de6 -->
Setzt eine abgegrenzte Aufgabe um: Code, Migration, Tests, Konfiguration. Wendet `R-role-worker` an.

## debugger
<!-- source: 3bceaaa2f6c25186 -->
Sucht die Ursache eines Bugs per Hypothese statt durch Raten; reproduziert zuerst und trennt Symptom von Ursache.

## debugger#about
<!-- source: d18718184076056b -->
Sucht die Ursache eines gemeldeten Bugs, den der Orchestrator beschreibt. Behebt nichts —
die Behebung ist ein eigener Auftrag (`builder`). Wendet `R-role-worker` an.

## doc-writer
<!-- source: c290dce552652e04 -->
Pflegt docs/project/ (nie docs/ai/) - arbeitet Befunde in die Projektdoku ein und hält Querverweise und Statusmarken aktuell.

## doc-writer#about
<!-- source: 269b317dbbe11ab5 -->
Pflegt `docs/project/` — die Projektdokumentation, nicht den Arbeitsbereich der Zusammenarbeit unter
`docs/ai/`. Wendet `R-role-worker` an.

## expert-solver
<!-- source: 67097544e420609b -->
Eskalation mit hohem Reasoning, nur gerufen, wenn ein Worker dieselbe Aufgabe zweimal verfehlt hat oder auf einen unlösbaren Fehler gestoßen ist.

## expert-solver#about
<!-- source: 32c7e6675fafecf5 -->
Nur zur Eskalation nach `R-role-escalate` — gerufen, wenn ein Worker dieselbe Aufgabe zweimal verfehlt hat
oder ein Sonderfall einen normalen Worker festhält. Erfahrener Architekt und Problemlöser genau für diesen
Fall, nicht für Routine-Implementierung. Wendet `R-role-worker` an.

## explorer
<!-- source: 49430822cabdf716 -->
Lesende Recherche im Code über mehrere Dateien und Verzeichnisse; meldet Befunde mit path:line als Beleg.

## explorer#about
<!-- source: 34f0cb32fed94a65 -->
Lesende Recherche über mehrere Dateien und Verzeichnisse; Befunde mit `<path>:<line>` belegt.
Wendet `R-role-worker` an.

## optimizer
<!-- source: bde5b9671f615258 -->
Poliert frisch geschriebenen Code auf Kürze und Lesbarkeit - höchstens zwei Runden, kein Algorithmus-Tuning.

## optimizer#about
<!-- source: 564be43f4d0ed33f -->
Läuft nach `builder`, nur über den Code, den dieser Auftrag gerade geschrieben hat — Dateien und Zeilen stehen
im Auftrag, nie gewachsener Code von anderswo und nie projektweit. Wendet `R-role-worker` an.

## quick-check
<!-- source: dc952c767a01b276 -->
Feste, lesende Abfragen ohne Bewertung (git status, Tests, Dateien, Zeilenzahlen).

## quick-check#about
<!-- source: cace6d37f7fd3e1a -->
Führt eine feste Reihe lesender Abfragen aus und liefert das rohe Ergebnis, ohne Bewertung. Wendet
`R-role-worker` an.

## reviewer
<!-- source: db27b9e02fbc6b4e -->
Kritische Prüfung vor einem Commit — Bugs, Stil und Aufgabentreue — sowie ALLOW/BLOCK bei einem markierten Safeguard-Aufruf.

## reviewer#about
<!-- source: b1a43d753b082121 -->
Kritische Prüfung vor einem Commit, dazu ALLOW/BLOCK bei einem markierten Tool-Aufruf. Wendet
`R-role-worker` an.

## test-writer
<!-- source: e6dbc3c49677ea08 -->
Schreibt Tests zu bestehendem Code oder Test-first allein aus einem Konzept bzw. Interface; prüft Verhalten, nicht Implementierung.

## test-writer#about
<!-- source: 485a942ab447849c -->
Schreibt Tests — zu bestehendem Code oder Test-first allein aus einer Konzept- bzw. Interface-Beschreibung —
und belegt sie mit einem Testlauf. Wendet `R-role-worker` an.

## _intro
<!-- source: bb784335680ef087 -->
Eine Rolle ist eine abgegrenzte Art von Worker; ihr Tier legt fest, wie viel Modellleistung sie bekommt, und `.act/tiers.json` ordnet Tiers erst bei der Erzeugung konkreten Modellen zu.
