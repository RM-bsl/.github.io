/**
 * evaluators.js
 * Intelligenter, rein clientseitiger Freitext-Prüfer (BS+1).
 * Nutzt fehlertolerante Wortgruppen-Heuristiken (Regex) und gibt bei kurzen
 * oder unvollständigen Antworten ermutigende, formative Denkanstöße.
 */
(function (global) {
  'use strict';

  var MatheApp = global.MatheApp = global.MatheApp || {};

  /**
   * Normalisiert deutschen Text für fehlertolerantes Regex-Matching
   * (Kleinschreibung, Umlaute aufgelöst, Mehrfachleerzeichen bereinigt).
   */
  function normalizeText(raw) {
    if (typeof raw !== 'string') return '';
    return raw
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function countWords(text) {
    if (!text) return 0;
    var parts = text.trim().split(/\s+/).filter(Boolean);
    return parts.length;
  }

  /**
   * Prüfer für Lernbereich 2 (Schritt 2.1):
   * Nutzen einer Wertetabelle gegenüber einer ungeordneten Praxis-Notiz begründen.
   * Erwartete Sinngruppen:
   *  - Struktur / Sortierung / Übersicht
   *  - Praktischer Nutzen: schnelles Ablesen, Vergleichen, Analysieren, Verlauf/Kontrolle
   */
  function evaluateTableBenefit(rawInput) {
    var trimmed = (rawInput || '').trim();
    var norm = normalizeText(trimmed);
    var words = countWords(norm);

    if (words === 0) {
      return {
        passed: false,
        status: 'hint',
        title: 'Dein Gedanke ist gefragt',
        messageHTML:
          'Notiere in 1&ndash;2 Sätzen: Welchen Vorteil hat die <strong>Wertetabelle</strong> im Vergleich zum ungeordneten Notizzettel?'
      };
    }

    if (words < 4 || trimmed.length < 18) {
      return {
        passed: false,
        status: 'hint',
        title: 'Guter Einstieg – führe deinen Gedanken noch kurz aus!',
        messageHTML:
          'Formuliere deinen Stichpunkt ruhig als ganzen Satz: Was passiert in der Tabelle mit der <strong>Reihenfolge/Ordnung</strong> der Daten, und wie hilft dir das beim <strong>Ablesen oder Vergleichen</strong>?'
      };
    }

    var hasStructure =
      /(sortier|geordnet|ordn|struktur|uebersicht|aufgeraeumt|systemat|reihenfolg|aufsteigend|chronolog|zeitlich|gegliedert|klar|sauber|nicht durcheinander|kein chaos)/.test(norm);

    var hasReading =
      /(ables|find|seh|erkenn|blick|schnell|sofort|leicht|einfach|nachschau|nachles|zuordn|direkt)/.test(norm);

    var hasAnalysis =
      /(vergleich|analys|auswert|verlauf|entwicklung|schwank|spitz|hoechst|tiefst|tendenz|trend|kontroll|pruef|fehler|lueck|zusammenhang|unterschied|veraender)/.test(norm);

    if (hasStructure && (hasReading || hasAnalysis)) {
      var praisedAspects = ['<strong>Struktur &amp; Sortierung</strong>'];
      if (hasReading) praisedAspects.push('<strong>schnelles Ablesen</strong>');
      if (hasAnalysis) praisedAspects.push('<strong>Vergleichen/Analysieren</strong>');

      return {
        passed: true,
        status: 'success',
        title: 'Stark begründet!',
        messageHTML:
          'Genau darum geht es in der Praxis: Du hast ' +
          praisedAspects.join(' und ') +
          ' treffend beschrieben. Schritt&nbsp;2.2 ist jetzt für dich freigeschaltet!'
      };
    }

    if (hasStructure && !hasReading && !hasAnalysis) {
      return {
        passed: false,
        status: 'hint',
        title: 'Sehr gut erkannt – fast komplett!',
        messageHTML:
          'Du hast schon richtig benannt, dass die Daten in der Wertetabelle <strong>sortiert und übersichtlich strukturiert</strong> sind. Ergänze noch kurz den praktischen Nutzen: Was gelingt dadurch beim Arbeiten mit den Zahlen schneller oder besser (z.&nbsp;B. <em>Ablesen, Vergleichen oder Analysieren</em>)?'
      };
    }

    if (!hasStructure && (hasReading || hasAnalysis)) {
      return {
        passed: false,
        status: 'hint',
        title: 'Richtige Spur – ergänze noch das „Warum“!',
        messageHTML:
          'Stimmt genau: Man kann Werte viel besser <strong>ablesen, vergleichen oder auswerten</strong>! Erkläre noch in einem Halbsatz, <em>wodurch</em> die Tabelle das ermöglicht (z.&nbsp;B. durch das <strong>Sortieren und Strukturieren</strong> der vorher ungeordneten Daten).'
      };
    }

    return {
      passed: false,
      status: 'hint',
      title: 'Denkanstoß zum Weiterdenken',
      messageHTML:
        'Vergleiche links den chaotischen Notizzettel mit rechts der Tabelle: Achte darauf, wie die Werte <strong>sortiert/strukturiert</strong> wurden und wie dir das beim <strong>schnellen Ablesen oder Vergleichen</strong> hilft.'
    };
  }

  /**
   * Prüfer für Lernbereich 3 (Schritt 3.1):
   * Unterschied zwischen Zuordnungsvariante 1 (Funktion) und Variante 2 (Relation)
   * bezüglich der Pfeilanzahl pro Ausgangswert x beschreiben.
   */
  function evaluateArrowDifference(rawInput) {
    var trimmed = (rawInput || '').trim();
    var norm = normalizeText(trimmed);
    var words = countWords(norm);

    if (words === 0) {
      return {
        passed: false,
        status: 'hint',
        title: 'Vergleiche die Pfeile an den Ausgangswerten x',
        messageHTML:
          'Beschreibe in eigenen Worten: Wie viele Pfeile starten jeweils bei einem Ausgangswert <strong>x</strong> in Variante&nbsp;1 – und wie sieht es in Variante&nbsp;2 aus?'
      };
    }

    if (words < 5 || trimmed.length < 20) {
      return {
        passed: false,
        status: 'hint',
        title: 'Guter Anfang – vergleiche beide Varianten im ganzen Satz!',
        messageHTML:
          'Gehe auf <strong>beide</strong> Pfeildiagramme ein: Wie viele Pfeile gehen in <em>Variante&nbsp;1</em> von jedem Ausgangswert <strong>x</strong> aus, und was ändert sich in <em>Variante&nbsp;2</em>?'
      };
    }

    var hasSingleArrow =
      /(genau\s*(1|ein)|nur\s*(1|ein)|immer\s*(1|ein)|jeweils\s*(1|ein)|jedes\s*mal\s*(1|ein)|pro\s*\S+\s*(1|ein)|(1|ein|einen|einem|einzig\w*)\s*pfeil|eindeutig|jedem\s*\S+\s*(1|ein\w*)\s*(wert|pfeil|ziel|temperatur|stromlast))/.test(norm);

    var hasMultiArrows =
      /(mehrere|zwei|\b2\b|mehr\s*als\s*(1|ein)|mehrfach|mehrdeutig|doppelt|verschiedene\s*(pfeile|werte|y|temperaturen|ziel)|zweite\w*\s*pfeil)/.test(norm);

    var hasXReference =
      /(\bx\b|x-wert|ausgangs|start|links|uhrzeit|laufzeit|stunde|zeitpunkt|pro\s+wert|jedem\s+wert|einem\s+wert)/.test(norm);

    if (hasSingleArrow && hasMultiArrows && hasXReference) {
      return {
        passed: true,
        status: 'success',
        title: 'Auf den Punkt gebracht!',
        messageHTML:
          'Exakt beobachtet: In <strong>Variante&nbsp;1 (Funktion)</strong> startet von jedem Ausgangswert <strong>x</strong> genau <strong>1&nbsp;Pfeil</strong>. In <strong>Variante&nbsp;2 (Relation)</strong> gehen von mindestens einem Ausgangswert <strong>x</strong> <strong>mehrere Pfeile</strong> aus. Schritt&nbsp;3.2 ist jetzt freigeschaltet!'
      };
    }

    if (hasSingleArrow && hasMultiArrows && !hasXReference) {
      return {
        passed: false,
        status: 'hint',
        title: 'Fast perfekt – nur noch eine kleine Präzisierung!',
        messageHTML:
          'Du hast den Unterschied von <strong>1&nbsp;Pfeil</strong> vs. <strong>mehreren/2&nbsp;Pfeilen</strong> bereits richtig erkannt! Ergänze nur noch kurz, <strong>wo</strong> diese Pfeile starten (nämlich <em>pro Ausgangswert x</em> bzw. auf der linken Seite), denn bei einer Funktion dürfen beim selben y-Wert durchaus mehrere Pfeile ankommen.'
      };
    }

    if (hasSingleArrow && !hasMultiArrows) {
      return {
        passed: false,
        status: 'hint',
        title: 'Variante 1 stimmt schon – was passiert bei Variante 2?',
        messageHTML:
          'Richtig erkannt: Bei Variante&nbsp;1 startet von jedem Ausgangswert <strong>x</strong> genau <strong>ein Pfeil</strong>! Schau dir nun zum Vergleich <strong>Variante&nbsp;2</strong> an (z.&nbsp;B. die farbig hervorgehobenen Ausgangswerte x) und ergänze, wie viele Pfeile dort von einem x-Wert ausgehen.'
      };
    }

    if (!hasSingleArrow && hasMultiArrows) {
      return {
        passed: false,
        status: 'hint',
        title: 'Variante 2 stimmt schon – ergänze noch Variante 1!',
        messageHTML:
          'Sehr gut gesehen: Bei Variante&nbsp;2 gehen von manchen Ausgangswerten <strong>x</strong> <strong>mehrere (zwei) Pfeile</strong> weg! Ergänze zum direkten Vergleich noch, wie viele Pfeile es bei <strong>Variante&nbsp;1</strong> pro Ausgangswert <strong>x</strong> sind.'
      };
    }

    return {
      passed: false,
      status: 'hint',
      title: 'Tipp für deinen Vergleich',
      messageHTML:
        'Zähle in beiden Diagrammen direkt an den linken Kästen (den <strong>Ausgangswerten x</strong>), wie viele Pfeile dort jeweils <em>weggehen</em>: Wie viele sind es in Variante&nbsp;1 pro x, und wie viele in Variante&nbsp;2?'
    };
  }

  MatheApp.Evaluators = {
    evaluateTableBenefit: evaluateTableBenefit,
    evaluateArrowDifference: evaluateArrowDifference
  };
})(window);
