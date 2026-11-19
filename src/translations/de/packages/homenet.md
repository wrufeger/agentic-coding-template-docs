<!-- German catalog for the package "homenet". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-packages.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## title
<!-- source: 2d7d7ce9edb2dfd4 -->
homenet — Administration des Heimnetzes

## summary
<!-- source: d82544eb37f76b33 -->
Regeln, Rollen und Skills, um ein Heimnetz oder Homelab aus einem Projekt auf dem Template zu betreiben: LAN und WLAN, Router und Netzwerk-Controller, Hypervisor, Raspberry Pi und andere Server, DNS-Filter, Geräte, Firewall und Home Assistant.

## contents
<!-- source: 984fbf904e1d0949 -->
Regeln, Rollen und Skills, um ein Heimnetz oder Homelab aus einem Projekt auf dem Template zu betreiben: LAN und WLAN,
Router und Netzwerk-Controller, Hypervisor, Raspberry Pi und andere Server, DNS-Filter, Geräte, Firewall und Home
Assistant. Das Package enthält keine Netzwerkdaten (keine Adressen, Hostnamen oder Zugangsdaten); die Einrichtung hält
sie im Projekt unter `docs/project/homenet/` fest. Es baut auf `R-safe-approval` und
`.act/rules/topics/live-systems.md` auf und wiederholt beides nicht.

- Regeln: `R-homenet-access` (eine Rechtetabelle je System und Weg; ein datierter Eintrag dort ist die dauerhafte
  Freigabe für eine benannte Klasse von Aktionen), `R-homenet-never` (der harte Kern, den keine dauerhafte Freigabe
  abdeckt), `R-homenet-ssh`, `R-homenet-rename`, `R-homenet-names`, `R-homenet-exports`, `R-homenet-handoff`; eine
  Erweiterung von `R-safe-approval`, die auf die Rechtetabelle verweist.
- Rollen: `homenet-reader` (liest nur, scannt nie, prüft jeden Schreibvorgang über seinen eigenen Weg gegen) und
  `homenet-writer` (sichert zuerst, löscht nie, ein Schreibvorgang gilt erst nach der Gegenprüfung des Readers als
  erledigt).
- Skills: `homenet-inventory` (erste Bestandsaufnahme und Prüfung der Doku gegen den Live-Stand) und
  `homenet-add-device`.
- Topic: `homenet-mcp` (MCP-Server und APIs für Home Assistant, Netzwerk-Controller, Hypervisor, Monitoring und NAS,
  Lesen und Schreiben getrennt gehalten).
- Code: `install.py` meldet nur, welche Werkzeuge vorhanden sind (`ssh`, Python, Interpreter-Fallen unter Windows); es
  öffnet keine Verbindung und schreibt nichts. Das Prüfmodul `homenet_no_scan` verweigert Port-Scanner (`nmap`,
  `masscan`, `zmap` und ähnliche, `nc -z` über mehr als einen Port) in Shell-Aufrufen von Claude Code.

## settings:homenet-home-assistant
<!-- source: 6756080148ee4957 -->
Gehört Home Assistant zu diesem Netz (ja oder nein)?
