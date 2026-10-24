/**
 * data.js
 * Fachdidaktische Datenstrukturen (BS+1 Bayern, 16–19 Jahre).
 * Strikt Anti-LaTeX: ausschließlich natives HTML, HTML-Entities und Formatters-Helfer.
 * Keine Funktionsgleichungen oder algebraischen Formeln!
 */
(function (global) {
  'use strict';

  var MatheApp = global.MatheApp = global.MatheApp || {};
  var F = MatheApp.Formatters;

  // =========================================================================
  // 1. ADVANCE ORGANIZER: 3 OBERKATEGORIEN & ARBEITSBLATT-AUFFORDERUNGEN
  // =========================================================================
  var CATEGORIES = [
    {
      id: 1,
      title: '1. Zahlenmengen & mathematische Schreibweise',
      shortTitle: 'Zahlenmengen & Schreibweise',
      subtitle: 'Schachtelkette von den natürlichen bis zu den reellen Zahlen und Symbole der Mengensprache verstehen.',
      worksheetTask: 'Aufgabe 2a auf dem 1. AB',
      worksheetPromptHTML:
        'Du hast Lernbereich 1 erfolgreich abgeschlossen! Nimm dir jetzt dein <strong>1. Arbeitsblatt (1.&nbsp;AB)</strong> zur Hand und bearbeite dort <strong>Aufgabe 2a</strong>, bevor du zum nächsten Lernbereich wechselst.'
    },
    {
      id: 2,
      title: '2. Praxisdaten mit einer Wertetabelle strukturieren',
      shortTitle: 'Praxisdaten & Wertetabelle',
      subtitle: 'Ungeordnete Mess- und Betriebsdaten aus dem Berufsalltag übersichtlich sortieren und auswerten.',
      worksheetTask: 'Aufgabe 2b auf dem 1. AB',
      worksheetPromptHTML:
        'Klasse gemacht! Lernbereich 2 ist vollständig gelöst. Bearbeite jetzt schriftlich <strong>Aufgabe 2b auf dem 1.&nbsp;AB</strong>, um dein Wissen zu sichern.'
    },
    {
      id: 3,
      title: '3. Einzeldaten zuordnen (Relation vs. Funktion)',
      shortTitle: 'Relation vs. Funktion',
      subtitle: 'Pfeildiagramme und Vertikalentest nutzen, um eindeutige Funktionen von mehrdeutigen Relationen zu unterscheiden.',
      worksheetTask: 'Aufgabe 3 auf dem 1. AB',
      worksheetPromptHTML:
        'Stark – alle 3 Lernbereiche sind gemeistert! Bearbeite nun zum Abschluss <strong>Aufgabe 3 auf dem 1.&nbsp;AB</strong>.'
    }
  ];

  // =========================================================================
  // 2. LERNBEREICH 1: ZAHLENMENGEN & SCHREIBWEISEN-BAUKASTEN
  // =========================================================================
  var NUMBER_SETS = [
    {
      key: 'N',
      symbolHTML: '&#8469;',
      symbolCanvas: '\u2115',
      name: 'Natürliche Zahlen',
      color: '#059669',
      fillSoft: 'rgba(5, 150, 105, 0.14)',
      definitionHTML: '&#8469; = {1; 2; 3; 4; ...}',
      everydayMeaning: 'Zählzahlen für ganze Stückzahlen ab 1 im Betriebsalltag (z. B. Kartons, Werkstücke, Schichten).',
      examplesHTML: '1; 3; 12; 250',
      numberLineHint: 'Einzelne positive Punkte ab 1 in festen Einerschritten nach rechts.'
    },
    {
      key: 'N0',
      symbolHTML: '&#8469;<sub>0</sub>',
      symbolCanvas: '\u2115\u2080',
      name: 'Natürliche Zahlen mit Null',
      color: '#0891b2',
      fillSoft: 'rgba(8, 145, 178, 0.13)',
      definitionHTML: '&#8469;<sub>0</sub> = {0; 1; 2; 3; ...} = &#8469; &cup; {0}',
      everydayMeaning: 'Zählzahlen inklusive 0 – wichtig für leere Bestände, 0 Ausschuss-Teile oder den Startpunkt einer Messung.',
      examplesHTML: '0 (neu!) sowie 1; 2; 12; ...',
      numberLineHint: 'Der Punkt 0 kommt links neben der 1 neu hinzu.'
    },
    {
      key: 'Z',
      symbolHTML: '&#8484;',
      symbolCanvas: '\u2124',
      name: 'Ganze Zahlen',
      color: '#2563eb',
      fillSoft: 'rgba(37, 99, 235, 0.12)',
      definitionHTML: '&#8484; = {...; &minus;3; &minus;2; &minus;1; 0; 1; 2; 3; ...}',
      everydayMeaning: 'Alle positiven und negativen ganzen Zahlen inklusive 0 (z. B. Frosttemperaturen wie &minus;18 °C, Untergeschosse, Soll/Haben-Differenzen in ganzen Euro).',
      examplesHTML: '&minus;18; &minus;3; &minus;1 (neu!) sowie 0; 1; 12; ...',
      numberLineHint: 'Die Punkte breiten sich jetzt spiegelbildlich auch nach links ins Negative aus.'
    },
    {
      key: 'Q',
      symbolHTML: '&#8474;',
      symbolCanvas: '\u211A',
      name: 'Rationale Zahlen',
      color: '#7c3aed',
      fillSoft: 'rgba(124, 58, 237, 0.11)',
      definitionHTML:
        '&#8474; = {' +
        F.renderFractionHTML('p', 'q', false) +
        ' | p &isin; &#8484;; q &isin; &#8469;}',
      everydayMeaning: 'Alle Zahlen, die sich als Bruch zweier ganzer Zahlen schreiben lassen – also Brüche sowie endliche und periodische Dezimalzahlen (z. B. Rohrgewinde, Preise, Messwerte wie &minus;16,5 °C).',
      examplesHTML:
        F.renderFractionHTML('3', '4', false) +
        '; ' +
        F.renderFractionHTML('1', '2', true) +
        '; &minus;2,5; 0,75; 1,33...',
      numberLineHint: 'Zwischen den ganzen Zahlen füllen sich unendlich viele dichte Zwischenpunkte – aber winzige Lücken (wie bei \u221A2 oder \u03C0) bleiben noch.'
    },
    {
      key: 'R',
      symbolHTML: '&#8477;',
      symbolCanvas: '\u211D',
      name: 'Reelle Zahlen',
      color: '#d97706',
      fillSoft: 'rgba(217, 119, 6, 0.11)',
      definitionHTML: '&#8477; = &#8474; &cup; {irrationale Zahlen wie &radic;2; &pi;; ...}',
      everydayMeaning: 'Alle Punkte auf der lückenlosen Zahlengeraden: zu den Brüchen kommen die irrationalen Zahlen (unendliche, nicht-periodische Dezimalzahlen wie Kreiszahl &pi; oder &radic;2) hinzu.',
      examplesHTML: '&radic;2 &approx; 1,41; &pi; &approx; 3,14 (neu!) sowie alle Zahlen aus &#8474;',
      numberLineHint: 'Alle restlichen Lücken schließen sich: Es entsteht die durchgehende, lückenlose Zahlengerade.'
    }
  ];

  // Pool realer Zahlenbeispiele für Aufgabe 1.1 (Standardmäßig werden die ersten 2 geladen;
  // optional lassen sich weitere Paare zum Vertiefen durchspielen)
  var REAL_NUMBER_EXAMPLES = [
    {
      id: 'ex_minus18',
      valueHTML: '&minus;18&nbsp;°C',
      valueCanvas: '\u221218',
      numericApprox: -18,
      contextBadge: 'Kältetechnik',
      promptTitle: 'Messwert 1: &minus;18&nbsp;°C im Tiefkühllager',
      correctSet: 'Z',
      correctMeaningId: 'm_frost',
      meaningOptions: [
        {
          id: 'm_count',
          label: 'Stückzahl beim Abzählen einzelner Kartons ab 1'
        },
        {
          id: 'm_frost',
          label: 'Solltemperatur unter dem Gefrierpunkt – ganze negative Zahl ohne Nachkommastelle'
        },
        {
          id: 'm_irrat',
          label: 'Unendliche, nicht-periodische Dezimalzahl bei Kreisberechnungen'
        }
      ],
      supersetHint:
        'Fast! &minus;18 liegt wegen der Schachtelkette &#8484; &sub; &#8474; &sub; &#8477; zwar auch in größeren Mengen – gesucht ist hier aber die <strong>kleinste passende Zahlenmenge</strong>, in der negative ganze Zahlen neu dazukommen.',
      subsetHint:
        'Schau genau auf das Vorzeichen: In &#8469; und &#8469;<sub>0</sub> gibt es noch keine negativen Zahlen unter null.'
    },
    {
      id: 'ex_pi',
      valueHTML: '&pi; &approx; 3,14',
      valueCanvas: '\u03C0',
      numericApprox: 3.14,
      contextBadge: 'Metallbau & Rohrtechnik',
      promptTitle: 'Messwert 2: Kreiszahl &pi; (&approx; 3,14) am Rohrquerschnitt',
      correctSet: 'R',
      correctMeaningId: 'm_circle',
      meaningOptions: [
        {
          id: 'm_fraction',
          label: 'Exakter Bruch aus zwei ganzen Zahlen beim Aufteilen einer Länge'
        },
        {
          id: 'm_zero',
          label: 'Leerer Lagerbestand mit dem exakten Wert null'
        },
        {
          id: 'm_circle',
          label: 'Umfangs-/Flächenberechnung am Kreis – unendliche, nicht-periodische Dezimalzahl (kein Bruch möglich)'
        }
      ],
      supersetHint: '',
      subsetHint:
        'Achtung: 3,14 ist nur ein gerundeter Näherungswert! Die exakte Kreiszahl &pi; hat unendlich viele, nicht-periodische Nachkommastellen und lässt sich nicht als Bruch in &#8474; darstellen.'
    },
    {
      id: 'ex_sqrt2',
      valueHTML: '&radic;2&nbsp;m &approx; 1,41&nbsp;m',
      valueCanvas: '\u221A2',
      numericApprox: 1.41,
      contextBadge: 'Bau & Innenausbau',
      promptTitle: 'Praxiswert: Diagonale &radic;2&nbsp;m (&approx; 1,41&nbsp;m) einer 1-m-Fliese',
      correctSet: 'R',
      correctMeaningId: 'm_diag',
      meaningOptions: [
        {
          id: 'm_diag',
          label: 'Diagonalenlänge eines Quadrats – irrationale Wurzelzahl ohne Bruchdarstellung'
        },
        {
          id: 'm_negint',
          label: 'Ganze Minuszahl unter dem Nullpunkt'
        },
        {
          id: 'm_pack',
          label: 'Abzählbare Verpackungseinheit im Versandlager'
        }
      ],
      supersetHint: '',
      subsetHint:
        '&radic;2 lässt sich nicht exakt als Bruch schreiben (1,41 ist gerundet). In welcher Menge liegen solche irrationalen Zahlen?'
    },
    {
      id: 'ex_three_quarter',
      valueHTML: F.renderFractionHTML('3', '4', false) + '&nbsp;Zoll (= 0,75&nbsp;Zoll)',
      valueCanvas: '0,75',
      numericApprox: 0.75,
      contextBadge: 'Sanitär & Hydraulik',
      promptTitle: 'Praxiswert: Rohrgewinde mit ' + F.renderFractionHTML('3', '4', false) + '&nbsp;Zoll',
      correctSet: 'Q',
      correctMeaningId: 'm_pipe',
      meaningOptions: [
        {
          id: 'm_pipe',
          label: 'Normmaß für Rohranschlüsse – echter Anteil/Bruch aus zwei ganzen Zahlen'
        },
        {
          id: 'm_whole',
          label: 'Reine Zählzahl für ganze Paletten im Lager'
        },
        {
          id: 'm_irrat2',
          label: 'Nicht-periodische Zahl, die nicht als Bruch darstellbar ist'
        }
      ],
      supersetHint:
        'Stimmt, jeder Bruch liegt auch in &#8477;. Wähle aber die <strong>kleinste passende Zahlenmenge</strong>, in der Brüche neu hinzukommen!',
      subsetHint:
        'Ein Dreiviertel-Zoll (0,75) liegt zwischen 0 und 1 – in &#8469;, &#8469;<sub>0</sub> und &#8484; gibt es nur ganze Zahlen.'
    }
  ];

  // Alle 7 geforderten Symbole für den interaktiven Schreibweisen-Baukasten
  var NOTATION_SYMBOLS = [
    {
      id: 'braces',
      tokenHTML: '{ }',
      title: 'Mengenklammern',
      spokenAs: '„Die Menge mit den Elementen …“',
      explanationHTML:
        'Geschweifte Klammern bilden den <strong>Behälter</strong> einer Zahlenmenge. Alles, was zwischen <code>{</code> und <code>}</code> steht, gehört zu dieser Menge.',
      exampleHTML: 'A = <strong>{</strong>2; 4; 6<strong>}</strong>',
      tipHTML: 'Verwechsle <code>{ }</code> nicht mit runden Klammern <code>( )</code> für Koordinatenpunkte!'
    },
    {
      id: 'semicolon',
      tokenHTML: ';',
      title: 'Trennzeichen (Semikolon)',
      spokenAs: 'kurze Sprechpause zwischen zwei Zahlen',
      explanationHTML:
        'Das Semikolon trennt die einzelnen Zahlen innerhalb der Mengenklammern sauber voneinander.',
      exampleHTML: 'M = {&minus;1,5<strong>;</strong> 0<strong>;</strong> 2,5}',
      tipHTML:
        'Warum kein Komma? Weil im Deutschen das Komma schon als <strong>Dezimalkomma</strong> (z. B. bei <code>2,5</code>) gebraucht wird! Mit Komma wäre <code>{2,5}</code> nicht von <code>{2; 5}</code> unterscheidbar.'
    },
    {
      id: 'ellipsis',
      tokenHTML: '...',
      title: 'Auslassungspunkte',
      spokenAs: '„und so weiter (nach demselben Muster)“',
      explanationHTML:
        'Drei Punkte zeigen an, dass eine Zahlenfolge nach dem erkennbaren Muster (oft unendlich weit) fortgesetzt wird.',
      exampleHTML: '&#8469; = {1; 2; 3; <strong>...</strong>}',
      tipHTML: 'Bei &#8484; stehen die Punkte auf beiden Seiten: <code>{...; &minus;2; &minus;1; 0; 1; 2; ...}</code>.'
    },
    {
      id: 'union',
      tokenHTML: '&cup;',
      title: 'Vereinigungsmenge',
      spokenAs: '„vereinigt mit“',
      explanationHTML:
        'Das Symbol <strong>&cup;</strong> wirft zwei Mengen in einen gemeinsamen Topf: Alle Elemente aus der ersten <em>oder</em> der zweiten Menge sind danach enthalten.',
      exampleHTML: '&#8469;<sub>0</sub> = &#8469; <strong>&cup;</strong> {0}',
      tipHTML: 'Eselsbrücke: Das Zeichen <strong>&cup;</strong> ist nach oben geöffnet wie eine Schüssel, in die man beide Mengen zusammenschüttet.'
    },
    {
      id: 'pipe',
      tokenHTML: '|',
      title: 'Eigenschafts-Strich',
      spokenAs: '„für die gilt:“',
      explanationHTML:
        'Steht in der beschreibenden Mengenschreibweise: Links vom Strich steht, aus welcher Grundmenge die Zahl <code>x</code> stammt; rechts steht die Bedingung, die <code>x</code> erfüllen muss.',
      exampleHTML: 'T = {x &isin; &#8477; <strong>|</strong> x &ge; &minus;18}',
      tipHTML: 'Lies den Ausdruck von links nach rechts: „Menge aller reellen Zahlen x, <em>für die gilt</em>: x ist mindestens &minus;18.“'
    },
    {
      id: 'element',
      tokenHTML: '&isin;',
      title: 'Element-Zeichen',
      spokenAs: '„ist Element von“ / „gehört zur Menge“',
      explanationHTML:
        'Verbindet eine <strong>einzelne Zahl</strong> (links) mit einer <strong>Menge</strong> (rechts), in der diese Zahl liegt.',
      exampleHTML: '&minus;18 <strong>&isin;</strong> &#8484; &nbsp;und&nbsp; &pi; <strong>&isin;</strong> &#8477;',
      tipHTML: 'Links von <strong>&isin;</strong> steht ein einzelnes Element (z. B. <code>&minus;18</code>), keine ganze Menge.'
    },
    {
      id: 'subset',
      tokenHTML: '&sub;',
      title: 'Teilmengen-Zeichen',
      spokenAs: '„ist echte Teilmenge von“ / „steckt komplett in“',
      explanationHTML:
        'Verbindet <strong>zwei Mengen</strong> miteinander: Jede Zahl der kleineren Menge (links) ist automatisch auch in der größeren Menge (rechts) enthalten.',
      exampleHTML: '&#8469; <strong>&sub;</strong> &#8469;<sub>0</sub> <strong>&sub;</strong> &#8484; <strong>&sub;</strong> &#8474; <strong>&sub;</strong> &#8477;',
      tipHTML: 'Wie beim Kleiner-Zeichen <code>&lt;</code> zeigt der schmale Bogen auf die kleinere Menge links und öffnet sich zur größeren Menge rechts.'
    }
  ];

  // Kurzer Baukasten-Sicherungscheck am Ende von Bereich 1
  var NOTATION_MINI_CHECKS = [
    {
      id: 'nc1',
      beforeHTML: '&minus;18',
      afterHTML: '&#8484;',
      hint: 'Links steht eine einzelne Zahl, rechts eine Zahlenmenge.',
      correct: '∈',
      options: [
        { val: '∈', labelHTML: '&isin;' },
        { val: '⊂', labelHTML: '&sub;' },
        { val: '∪', labelHTML: '&cup;' }
      ]
    },
    {
      id: 'nc2',
      beforeHTML: '&#8484;',
      afterHTML: '&#8474;',
      hint: 'Beide Seiten sind komplette Zahlenmengen der Schachtelkette.',
      correct: '⊂',
      options: [
        { val: '∈', labelHTML: '&isin;' },
        { val: '⊂', labelHTML: '&sub;' },
        { val: '|', labelHTML: '|' }
      ]
    },
    {
      id: 'nc3',
      beforeHTML: '&#8469;<sub>0</sub> = &#8469;',
      afterHTML: '{0}',
      hint: 'Die Menge &#8469; und die Menge {0} werden zu einer Menge zusammengefügt.',
      correct: '∪',
      options: [
        { val: ';', labelHTML: ';' },
        { val: '⊂', labelHTML: '&sub;' },
        { val: '∪', labelHTML: '&cup;' }
      ]
    }
  ];

  // =========================================================================
  // 3. LERNBEREICH 2 & 3: PRAXISKONTEXTE (OHNE FUNKTIONSGLEICHUNGEN!)
  // =========================================================================
  var PRAXIS_CONTEXTS = {
    kuehlhaus: {
      id: 'kuehlhaus',
      title: 'Kühlhaus',
      badge: 'Logistik & Kältetechnik',
      cardSummary: 'Temperaturkontrolle im Tiefkühllager während einer Schicht mit Warenanlieferung.',
      noteTitle: 'Handschriftliche Schichtnotiz – Tiefkühlhalle B',
      noteAuthor: 'Lagermeister M. Huber · Tagschicht',
      noteTextHTML:
        '„Um <strong>10&nbsp;Uhr</strong> stand bei der Warenanlieferung das Rolltor kurz offen, da stieg die Anzeige auf <strong>&minus;16,5&nbsp;°C</strong>. Direkt zu Schichtbeginn um <strong>6&nbsp;Uhr</strong> hatten wir saubere <strong>&minus;19&nbsp;°C</strong>. Am Nachmittag um <strong>14&nbsp;Uhr</strong> zeigte das Thermometer <strong>&minus;18,5&nbsp;°C</strong>. Mittags um <strong>12&nbsp;Uhr</strong> lagen wir bei <strong>&minus;17,5&nbsp;°C</strong>. Zum Schichtende um <strong>16&nbsp;Uhr</strong> waren es wieder <strong>&minus;19&nbsp;°C</strong>, und vormittags um <strong>8&nbsp;Uhr</strong> habe ich <strong>&minus;18&nbsp;°C</strong> abgelesen.“',
      xHeaderHTML: 'Uhrzeit x (in Uhr)',
      yHeaderHTML: 'Temperatur y (in °C)',
      xShortLabel: 'Uhrzeit x',
      yShortLabel: 'Temperatur y',
      xUnit: 'Uhr',
      yUnit: '°C',
      rows: [
        { x: 6, y: -19, missing: false },
        { x: 8, y: -18, missing: true },
        { x: 10, y: -16.5, missing: false },
        { x: 12, y: -17.5, missing: true },
        { x: 14, y: -18.5, missing: false },
        { x: 16, y: -19, missing: true }
      ],
      // Daten für Bereich 3 (Zuordnungsvariante 1 = Funktion vs. Variante 2 = Relation)
      variant1Title: 'Zuordnungsvariante 1: Ein Hauptsensor in der Hallenmitte',
      variant1DescHTML:
        'Zu jeder gemessenen Uhrzeit <strong>x</strong> wird der Temperaturwert <strong>y</strong> dieses einen Hauptsensors zugeordnet.',
      variant1Pairs: [
        { x: 6, y: -19 },
        { x: 8, y: -18 },
        { x: 10, y: -16.5 },
        { x: 12, y: -17.5 },
        { x: 14, y: -18.5 },
        { x: 16, y: -19 }
      ],
      variant2Title: 'Zuordnungsvariante 2: Gleichzeitige Messung an Rolltor & Rückwand',
      variant2DescHTML:
        'Um <strong>10&nbsp;Uhr</strong> und um <strong>12&nbsp;Uhr</strong> wurden gleichzeitig <em>zwei Sensoren</em> (am warmen Rolltor und an der kühlen Rückwand) derselben Uhrzeit <strong>x</strong> zugeordnet.',
      variant2Pairs: [
        { x: 6, y: -19 },
        { x: 8, y: -18 },
        { x: 10, y: -16.5 },
        { x: 10, y: -19 },
        { x: 12, y: -17.5 },
        { x: 12, y: -19 },
        { x: 14, y: -18.5 },
        { x: 16, y: -19 }
      ],
      multiXValues: [10, 12]
    },

    festival: {
      id: 'festival',
      title: 'Festival',
      badge: 'Veranstaltung & Elektrotechnik',
      cardSummary: 'Stromlast-Messung am Hauptverteiler einer Open-Air-Bühne vom Soundcheck bis zum Abend.',
      noteTitle: 'Technik-Notizzettel – Open-Air Hauptbühne',
      noteAuthor: 'Bühnentechnikerin L. König · Abendbetrieb',
      noteTextHTML:
        '„Beim Hauptact um <strong>20&nbsp;Uhr</strong> lief die Anlage mit <strong>38,5&nbsp;kW</strong> Spitzenlast. Nachmittags beim Soundcheck um <strong>16&nbsp;Uhr</strong> waren es erst ruhige <strong>14&nbsp;kW</strong>. Beim Ausklang um <strong>21&nbsp;Uhr</strong> sank die Last wieder auf <strong>24,5&nbsp;kW</strong>. Zum Einlass um <strong>17&nbsp;Uhr</strong> zeigte das Messgerät <strong>18,5&nbsp;kW</strong>. Um <strong>19&nbsp;Uhr</strong> beim Co-Headliner lagen <strong>32&nbsp;kW</strong> an, und um <strong>18&nbsp;Uhr</strong> zur ersten Vorband hatten wir <strong>24,5&nbsp;kW</strong>.“',
      xHeaderHTML: 'Uhrzeit x (in Uhr)',
      yHeaderHTML: 'Stromlast y (in kW)',
      xShortLabel: 'Uhrzeit x',
      yShortLabel: 'Stromlast y',
      xUnit: 'Uhr',
      yUnit: 'kW',
      rows: [
        { x: 16, y: 14, missing: false },
        { x: 17, y: 18.5, missing: true },
        { x: 18, y: 24.5, missing: false },
        { x: 19, y: 32, missing: true },
        { x: 20, y: 38.5, missing: false },
        { x: 21, y: 24.5, missing: true }
      ],
      variant1Title: 'Zuordnungsvariante 1: Ein Gesamtstromzähler für die Hauptbühne',
      variant1DescHTML:
        'Jeder vollen Stunde <strong>x</strong> wird genau die gemessene Gesamtstromlast <strong>y</strong> am Hauptzähler zugeordnet.',
      variant1Pairs: [
        { x: 16, y: 14 },
        { x: 17, y: 18.5 },
        { x: 18, y: 24.5 },
        { x: 19, y: 32 },
        { x: 20, y: 38.5 },
        { x: 21, y: 24.5 }
      ],
      variant2Title: 'Zuordnungsvariante 2: Getrennte Ablesung an Haupt- & Nebenbühne',
      variant2DescHTML:
        'Um <strong>18&nbsp;Uhr</strong> und um <strong>20&nbsp;Uhr</strong> wurden zur selben Uhrzeit <strong>x</strong> jeweils <em>zwei verschiedene Stromlasten</em> (Hauptbühne und Zeltbühne) eingetragen.',
      variant2Pairs: [
        { x: 16, y: 14 },
        { x: 17, y: 18.5 },
        { x: 18, y: 24.5 },
        { x: 18, y: 14 },
        { x: 19, y: 32 },
        { x: 20, y: 38.5 },
        { x: 20, y: 18.5 },
        { x: 21, y: 24.5 }
      ],
      multiXValues: [18, 20]
    },

    stanzmaschine: {
      id: 'stanzmaschine',
      title: 'Stanzmaschine',
      badge: 'Industrie & Metalltechnik',
      cardSummary: 'Werkzeugtemperatur einer hydraulischen Stanzpresse im Verlauf einer 6-Stunden-Schicht.',
      noteTitle: 'Prüfnotiz – Hydraulikpresse Linie 4',
      noteAuthor: 'Industriemechaniker T. Yilmaz · Frühschicht',
      noteTextHTML:
        '„Nach <strong>4&nbsp;Stunden</strong> Laufzeit erreichte das Stanzwerkzeug mit <strong>44,5&nbsp;°C</strong> den Spitzenwert, bevor die Zusatzkühlung ansprang. Nach <strong>1&nbsp;Stunde</strong> lag die Temperatur noch bei <strong>29&nbsp;°C</strong>. Zum Schichtende nach <strong>6&nbsp;Stunden</strong> standen <strong>41,5&nbsp;°C</strong> auf der Anzeige. Nach <strong>3&nbsp;Stunden</strong> hatten wir ebenfalls <strong>41,5&nbsp;°C</strong> notiert, nach <strong>5&nbsp;Stunden</strong> geregelte <strong>40&nbsp;°C</strong>, und nach <strong>2&nbsp;Stunden</strong> waren es <strong>36,5&nbsp;°C</strong>.“',
      xHeaderHTML: 'Laufzeit x (in h)',
      yHeaderHTML: 'Werkzeugtemperatur y (in °C)',
      xShortLabel: 'Laufzeit x',
      yShortLabel: 'Temperatur y',
      xUnit: 'h',
      yUnit: '°C',
      rows: [
        { x: 1, y: 29, missing: false },
        { x: 2, y: 36.5, missing: true },
        { x: 3, y: 41.5, missing: false },
        { x: 4, y: 44.5, missing: true },
        { x: 5, y: 40, missing: false },
        { x: 6, y: 41.5, missing: true }
      ],
      variant1Title: 'Zuordnungsvariante 1: Ein Temperatursensor am Stanzwerkzeug',
      variant1DescHTML:
        'Jeder Laufzeit <strong>x</strong> wird genau ein gemessener Temperaturwert <strong>y</strong> zugeordnet.',
      variant1Pairs: [
        { x: 1, y: 29 },
        { x: 2, y: 36.5 },
        { x: 3, y: 41.5 },
        { x: 4, y: 44.5 },
        { x: 5, y: 40 },
        { x: 6, y: 41.5 }
      ],
      variant2Title: 'Zuordnungsvariante 2: Gleichzeitige Messung an Ober- & Unterwerkzeug',
      variant2DescHTML:
        'Nach <strong>3&nbsp;h</strong> und nach <strong>4&nbsp;h</strong> wurden derselben Laufzeit <strong>x</strong> jeweils <em>zwei verschiedene Temperaturen</em> (heißer Stempel oben und kühleres Unterwerkzeug) zugeordnet.',
      variant2Pairs: [
        { x: 1, y: 29 },
        { x: 2, y: 36.5 },
        { x: 3, y: 41.5 },
        { x: 3, y: 29 },
        { x: 4, y: 44.5 },
        { x: 4, y: 36.5 },
        { x: 5, y: 40 },
        { x: 6, y: 41.5 }
      ],
      multiXValues: [3, 4]
    }
  };

  // =========================================================================
  // 4. DIDAKTISCH REDUZIERTE LERNÜBERSICHTEN (MERKBLÄTTER 1–3)
  // =========================================================================
  var SUMMARY_SHEETS = {
    1: {
      title: 'Merkblatt 1: Zahlenmengen & mathematische Schreibweise',
      html:
        '<div class="merkblatt-grid">' +
          '<div class="merkblatt-block">' +
            '<h4>1. Die Schachtelkette der Zahlenmengen</h4>' +
            '<p class="merkblatt-chain">&#8469; &sub; &#8469;<sub>0</sub> &sub; &#8484; &sub; &#8474; &sub; &#8477;</p>' +
            '<ul class="merkblatt-list">' +
              '<li><strong>&#8469;</strong> = {1; 2; 3; ...} &ndash; Natürliche Zählzahlen ab 1</li>' +
              '<li><strong>&#8469;<sub>0</sub></strong> = {0; 1; 2; ...} &ndash; Natürliche Zahlen inklusive 0</li>' +
              '<li><strong>&#8484;</strong> = {...; &minus;2; &minus;1; 0; 1; 2; ...} &ndash; Ganze Zahlen</li>' +
              '<li><strong>&#8474;</strong> &ndash; Rationale Zahlen: alle Brüche ' + F.renderFractionHTML('p', 'q', false) + ' (endliche &amp; periodische Dezimalzahlen, z.&nbsp;B. &minus;2,5 oder 0,75)</li>' +
              '<li><strong>&#8477;</strong> &ndash; Reelle Zahlen: füllen die Zahlengerade lückenlos (inklusive irrationaler Zahlen wie &radic;2 &approx; 1,41 und &pi; &approx; 3,14)</li>' +
            '</ul>' +
          '</div>' +
          '<div class="merkblatt-block">' +
            '<h4>2. Wichtige Symbole der Mengenschreibweise</h4>' +
            '<ul class="merkblatt-list">' +
              '<li><code>{ }</code> <strong>Mengenklammern</strong> fassen Elemente zusammen; <code>;</code> <strong>trennt</strong> sie sauber vom Dezimalkomma.</li>' +
              '<li><code>...</code> steht für „und so weiter“; <strong>&cup;</strong> vereinigt zwei Mengen.</li>' +
              '<li><strong>&isin;</strong> („ist Element von“): Einzelne Zahl gehört zur Menge, z.&nbsp;B. &minus;18 &isin; &#8484;.</li>' +
              '<li><strong>&sub;</strong> („ist echte Teilmenge von“): Ganze Menge steckt in größerer Menge, z.&nbsp;B. &#8484; &sub; &#8474;.</li>' +
              '<li><code>|</code> („für die gilt“): Beschreibt Eigenschaften, z.&nbsp;B. {x &isin; &#8477; | x &ge; 0}.</li>' +
            '</ul>' +
          '</div>' +
        '</div>'
    },
    2: {
      title: 'Merkblatt 2: Praxisdaten mit einer Wertetabelle strukturieren',
      html:
        '<div class="merkblatt-grid">' +
          '<div class="merkblatt-block">' +
            '<h4>Warum nutzt man Wertetabellen in der Praxis?</h4>' +
            '<ul class="merkblatt-list">' +
              '<li><strong>Struktur &amp; Sortierung:</strong> Ungeordnete Rohdaten werden nach der Ausgangsgröße <strong>x</strong> aufsteigend geordnet.</li>' +
              '<li><strong>Schnelles Ablesen:</strong> Zu jedem Zeitpunkt oder Prüfwert <strong>x</strong> findet man sofort den zugehörigen Messwert <strong>y</strong>.</li>' +
              '<li><strong>Vergleichen &amp; Analysieren:</strong> Schwankungen, Spitzenwerte, Ausreißer oder fehlende Messungen fallen auf einen Blick auf.</li>' +
            '</ul>' +
          '</div>' +
          '<div class="merkblatt-block">' +
            '<h4>Aufbau einer sauberen Wertetabelle</h4>' +
            '<ul class="merkblatt-list">' +
              '<li><strong>1. Zeile / Spalte (Ausgangsgröße x):</strong> Geordnet aufsteigend notieren – immer mit klarer Größenbezeichnung und Einheit.</li>' +
              '<li><strong>2. Zeile / Spalte (Zugeordnete Größe y):</strong> Passgenau unter bzw. neben dem zugehörigen x-Wert eintragen.</li>' +
            '</ul>' +
          '</div>' +
        '</div>'
    },
    3: {
      title: 'Merkblatt 3: Eindeutige Funktion vs. Mehrdeutige Relation',
      html:
        '<div class="merkblatt-grid">' +
          '<div class="merkblatt-block merkblatt-highlight-func">' +
            '<h4>Eindeutige Funktion</h4>' +
            '<ul class="merkblatt-list">' +
              '<li><strong>Zuordnungsregel:</strong> Jedem Ausgangswert <strong>x</strong> wird <strong>genau ein</strong> Wert <strong>y</strong> zugeordnet.</li>' +
              '<li><strong>Im Pfeildiagramm:</strong> Von jedem Ausgangswert <strong>x</strong> startet <strong>genau 1 Pfeil</strong>.</li>' +
              '<li><strong>Im Koordinatensystem (Vertikalentest):</strong> Jede senkrechte Prüfgerade trifft <strong>höchstens 1 Punkt</strong>.</li>' +
            '</ul>' +
          '</div>' +
          '<div class="merkblatt-block merkblatt-highlight-rel">' +
            '<h4>Mehrdeutige Relation</h4>' +
            '<ul class="merkblatt-list">' +
              '<li><strong>Zuordnungsregel:</strong> Mindestens einem Ausgangswert <strong>x</strong> werden <strong>mehrere</strong> Werte <strong>y</strong> zugeordnet.</li>' +
              '<li><strong>Im Pfeildiagramm:</strong> Von mindestens einem <strong>x</strong> gehen <strong>2 oder mehr Pfeile</strong> aus.</li>' +
              '<li><strong>Im Koordinatensystem (Vertikalentest):</strong> Es liegen Punkte <strong>senkrecht übereinander</strong> (eine Senkrechte trifft mehrere Punkte).</li>' +
            '</ul>' +
          '</div>' +
        '</div>'
    }
  };

  MatheApp.Data = {
    CATEGORIES: CATEGORIES,
    NUMBER_SETS: NUMBER_SETS,
    REAL_NUMBER_EXAMPLES: REAL_NUMBER_EXAMPLES,
    NOTATION_SYMBOLS: NOTATION_SYMBOLS,
    NOTATION_MINI_CHECKS: NOTATION_MINI_CHECKS,
    PRAXIS_CONTEXTS: PRAXIS_CONTEXTS,
    SUMMARY_SHEETS: SUMMARY_SHEETS
  };
})(window);
