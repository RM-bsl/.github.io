# BS+1 Mathematik-Lernapp: Zahlenmengen, Wertetabellen & Zuordnungen

Didaktisch reduzierte, vollständig autarke Web-Lernanwendung für die **Berufsschule Plus 1 (BS+1, Bayern, 16–19 Jahre)** – abgestimmt auf das **1. Arbeitsblatt (Aufgaben 2a, 2b und 3)**.

## Sofortstart (Autarkie-Garantie)
* **Lokal per Doppelklick:** Öffnen Sie einfach `index.html` direkt im Browser – es werden **kein Webserver**, **kein Node.js** und **keine Internetverbindung** benötigt.
* **GitHub Pages & QR-Code:** Laden Sie den gesamten Ordner unverändert in ein GitHub-Repository hoch und aktivieren Sie *GitHub Pages* (`main`-Branch). Die entstehende URL lässt sich direkt als QR-Code auf Arbeitsblättern abdrucken.
* **mebis (Moodle-iFrame):** Binden Sie die gehostete URL oder das hochgeladene Verzeichnispaket in einem mebis-Textfeld per `<iframe>` ein:
  ```html
  <iframe src="index.html" width="100%" height="820" style="border:0; border-radius:12px;" allowfullscreen></iframe>
  ```

## Modulare Projektstruktur (Separation of Concerns)
* `index.html` – Einstiegsdatei (reines HTML5, strikt ohne LaTeX/MathJax/KaTeX)
* `css/styles.css` – Responsives Design-System (`@media (max-width: 992px)`), Flexbox-Brüche (`.math-fraction`)
* `js/formatters.js` – Deutsche Zahlenformatierung (max. 2 Nachkommastellen, Dezimalkomma `,`, echtes Minus `&minus;` / `−`)
* `js/data.js` – Fachdaten für Zahlenmengen, Schreibweisen-Baukasten, 3 Praxiskontexte (*Kühlhaus, Festival, Stanzmaschine*) und Merkblätter
* `js/evaluators.js` – Fehlertoleranter clientseitiger Freitext-Prüfer mit formativen Denkanstößen
* `js/state.js` – Persistente Speicherung des gesamten Lernstands im `localStorage` inkl. Reset
* `js/canvas.js` – `devicePixelRatio`-skalierte Canvas-Grafiken (Euler-Diagramm, animierter Zahlenstrahl, Pfeildiagramme, Vertikalentest)
* `js/app.js` – Steuerung des 3-stufigen Advance Organizers, Stufenfreischaltung und Arbeitsblatt-Aufforderungen
* `AGENTS.md` – Verbindliches Antigravity-Architektur-Regelwerk für künftige Weiterentwicklungen
