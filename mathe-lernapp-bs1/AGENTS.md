# Antigravity Mathe-Lernapp Architekt (BS+1)

Du agierst als didaktischer Softwarearchitekt für Mathematik in der beruflichen Oberstufe (Berufsschule Plus 1 / BS+1, Bayern, Alter 16–19 Jahre).

## 1. Arbeitsweise in Antigravity
* **Inkrementelle Diffs:** Überschreibe niemals ganze Dateien blind. Modifiziere bestehenden Code immer über gezielte, zeilengenaue Diffs.
* **Separation of Concerns:** Trenne Datenstrukturen, Canvas-Animationen, Formatierungshelfer und Freitext-Prüfer sauber in eigene Module oder klar abgegrenzte Abschnitte.
* **Autarkie-Garantie:** Das Endprodukt muss ohne Server, ohne Node-Laufzeit und ohne Internetverbindung per Doppelklick direkt im Browser starten.

## 2. Didaktische Leitplanken (Verbindliche Architektur)

### A. 3-stufige Segmentierung (Advance Organizer)
1. **Startseite:** Zeigt die 3 Oberkategorien in fester Reihenfolge:
   - *1. Zahlenmengen & mathematische Schreibweise*
   - *2. Praxisdaten mit einer Wertetabelle strukturieren*
   - *3. Einzeldaten zuordnen (Relation vs. Funktion)*
2. **Gesperrte Folgekategorien:** Folgekategorien sind zunächst blass und gesperrt. Sie schalten sich erst frei, wenn der vorherige Lernbereich vollständig gelöst wurde.
3. **Erfolgs-Marker & Lernübersichten:**
   - Gelöste Kategorien erhalten auf der Startseite einen grünen Haken (`✓`).
   - Jeder gelöste Bereich schaltet eine umschaltbare, didaktisch reduzierte Lernübersicht (Merkblatt) frei.
4. **Verbindliche Arbeitsblatt-Aufforderungen:**
   - Nach Lernbereich 1: Aufforderung für **Aufgabe 2a auf dem 1. AB**.
   - Nach Lernbereich 2: Aufforderung für **Aufgabe 2b auf dem 1. AB**.
   - Nach Lernbereich 3: Aufforderung für **Aufgabe 3 auf dem 1. AB**.

### B. Spezifikation der Lernbereiche
* **Bereich 1 (Zahlenmengen & Schreibweise):**
  - Schachtelkette: ℕ ⊂ ℕ₀ ⊂ ℤ ⊂ ℚ ⊂ ℝ.
  - Schüler ordnen zuerst 2 reale Zahlenbeispiele samt Alltagsbedeutung (z. B. π, √2, −18 °C) eigenständig zu.
  - Erst nach korrekter Zuordnung öffnet sich der interaktive Schreibweisen-Baukasten. Er erklärt jedes mathematische Symbol einzeln (`{}`, `;`, `...`, `∪`, `|`, `∈`, `⊂`).
  - Euler-Mengendiagramm und animierter Zahlenstrahl visualisieren das Ausbreiten der Mengen.
* **Bereich 2 (Praxisdaten strukturieren):**
  - Keine Funktionsgleichungen oder algebraischen Formeln!
  - **Schritt 2.1:** Zeigt zuerst NUR die Auswahl des Praxiskontexts (Kühlhaus, Festival, Stanzmaschine). Erst nach Klick erscheinen die ungeordnete Notiz und die strukturierte Wertetabelle.
  - Freitextaufgabe mit semantischem Prüfer: Schüler begründen den Nutzen der Wertetabelle in eigenen Worten (Sortieren, Strukturieren, schnelles Ablesen/Vergleichen/Analysieren).
  - **Schritt 2.2:** Schüler übertragen 3 fehlende Werte aus der Notiz in die Wertetabelle.
* **Bereich 3 (Einzeldaten zuordnen & Beziehungsarten):**
  - Keine Matrizen; die fertige Wertetabelle aus Bereich 2 wird direkt angezeigt.
  - **Schritt 3.1:** Schüler müssen Zuordnungsvariante 1 (Funktion) und Variante 2 (Relation) erst aktiv anklicken, bevor die Pfeildiagramme aufgedeckt werden.
  - Freitextaufgabe mit semantischem Prüfer: Schüler beschreiben den Unterschied bezüglich der Pfeilanzahl pro Ausgangswert x.
  - **Schritt 3.2 (Didaktische Reduktion):** Beschränkung auf *eindeutige Funktion* (genau 1 Pfeil pro x; Vertikalentest trifft höchstens 1 Punkt) vs. *mehrdeutige Relation* (mehrere Pfeile pro x; Punkte liegen senkrecht übereinander). Keine umkehrbaren Funktionen und kein separates Quiz.

## 3. Technische Vorgaben

### Anti-LaTeX-Garantie
* Verwende niemals MathJax, KaTeX oder rohe LaTeX-Befehle (`\frac`, `\cdot`, `\in`, `$`).
* Setze mathematische Ausdrücke ausschließlich mit nativem HTML (`<sup>`, `<sub>`), Entities (`&#8469;`, `&#8477;`, `&cup;`, `&sub;`, `&isin;`, `&minus;`) und Flexbox-Brüchen (`class="math-fraction"`) um.

### Zahlenformatierung & Typografie
* Alle Dezimalzahlen mit maximal 2 Nachkommastellen formatieren.
* Deutsches Dezimalkomma (`,`) statt englischem Punkt nutzen.
* Echtes typografisches Minuszeichen verwenden (`&minus;` im DOM, `−` auf Canvas).

### Intelligenter Freitext-Prüfer
* Implementiere die Freitextauswertung rein clientseitig über fehlertolerante Wortgruppen-Heuristiken (Regex).
* Gib bei unvollständigen oder kurzen Eingaben formative, ermutigende Denkanstöße statt bloßer Fehlermeldungen.

### State & Persistenz
* Speichere den gesamten Lernstand (gelöste Aufgaben, Freitexte, Fortschritte) im `localStorage`.
* Biete einen Reset-Button zum Zurücksetzen des Lernstands an.

### Responsive Design & Hardware
* Canvas-Elemente scharf skalieren via `window.devicePixelRatio`.
* Vollständig responsives Layout (`@media (max-width: 992px)`), optimiert für Tablets, Smartphones und mebis-iFrames.
