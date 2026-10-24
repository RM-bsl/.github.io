/**
 * app.js
 * Hauptsteuerung (Advance Organizer, Stufen-Freischaltung, Interaktionen, Resize-Handling).
 * Arbeitet zu 100 % clientseitig und offline-fähig ohne externe Bibliotheken.
 */
(function (global) {
  'use strict';

  var MatheApp = global.MatheApp = global.MatheApp || {};
  var F = MatheApp.Formatters;
  var D = MatheApp.Data;
  var E = MatheApp.Evaluators;
  var S = MatheApp.State;
  var C = MatheApp.Canvas;

  // Aktueller Animationsfortschritt für Bereich 1 (0..4)
  var currentEulerAnimVal = 0;
  // Temporäre Prüfmeldungen (nicht persistent nötig)
  var sec1CheckFeedback = null;
  var sec1MiniFeedback = null;
  var sec2NumbersFeedback = null;

  function isCategoryUnlocked(catId) {
    var st = S.get();
    if (catId === 1) return true;
    if (catId === 2) return !!st.completed[1];
    if (catId === 3) return !!st.completed[2];
    return false;
  }

  function renderHeader() {
    var st = S.get();
    var doneCount =
      (st.completed[1] ? 1 : 0) +
      (st.completed[2] ? 1 : 0) +
      (st.completed[3] ? 1 : 0);

    var headerActions = document.getElementById('header-actions');
    if (!headerActions) return;

    var backBtnHTML =
      st.activeView !== 'home'
        ? '<button type="button" class="btn btn-secondary btn-sm" data-action="go-home">&larr; Startseite</button>'
        : '';

    headerActions.innerHTML =
      backBtnHTML +
      '<div class="progress-pill" aria-label="Lernfortschritt">' +
        '<span class="progress-dots">' +
          '<span class="progress-dot ' + (st.completed[1] ? 'is-done' : '') + '"></span>' +
          '<span class="progress-dot ' + (st.completed[2] ? 'is-done' : '') + '"></span>' +
          '<span class="progress-dot ' + (st.completed[3] ? 'is-done' : '') + '"></span>' +
        '</span>' +
        '<span>' + doneCount + ' von 3 gelöst</span>' +
      '</div>' +
      '<button type="button" class="btn btn-ghost-danger" data-action="open-reset-modal">Lernstand zurücksetzen</button>';
  }

  function renderMerkblattHTML(catId) {
    var st = S.get();
    if (!st.completed[catId] || !st.merkblattOpen[catId]) return '';
    var sheet = D.SUMMARY_SHEETS[catId];
    if (!sheet) return '';

    return (
      '<section class="merkblatt-panel" aria-label="' + F.escapeHTML(sheet.title) + '">' +
        '<div class="merkblatt-header">' +
          '<h3>' + sheet.title + '</h3>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="toggle-merkblatt" data-cat="' + catId + '">Merkblatt einklappen</button>' +
        '</div>' +
        sheet.html +
      '</section>'
    );
  }

  function renderWorksheetCalloutHTML(catId, includeNextBtn) {
    var st = S.get();
    if (!st.completed[catId]) return '';
    var cat = D.CATEGORIES[catId - 1];
    if (!cat) return '';

    var nextBtnHTML = '';
    if (includeNextBtn) {
      if (catId < 3) {
        nextBtnHTML =
          '<button type="button" class="btn btn-primary" data-action="open-category" data-cat="' + (catId + 1) + '">' +
            'Weiter zu Lernbereich ' + (catId + 1) + ' &rarr;' +
          '</button>';
      } else {
        nextBtnHTML =
          '<button type="button" class="btn btn-success" data-action="go-home">' +
            'Zur Gesamtübersicht (alle 3 gelöst &#10003;)' +
          '</button>';
      }
    }

    return (
      '<div class="worksheet-callout" role="region" aria-label="Arbeitsblatt-Auftrag">' +
        '<div class="worksheet-callout-body">' +
          '<span class="worksheet-tag">Jetzt schriftlich sichern &middot; 1. Arbeitsblatt</span>' +
          '<h4>Bitte bearbeite jetzt: ' + cat.worksheetTask + '</h4>' +
          '<p>' + cat.worksheetPromptHTML + '</p>' +
        '</div>' +
        (nextBtnHTML ? '<div>' + nextBtnHTML + '</div>' : '') +
      '</div>'
    );
  }

  // =========================================================================
  // STARTSEITE (ADVANCE ORGANIZER)
  // =========================================================================
  function renderHome(container) {
    var st = S.get();

    var cardsHTML = D.CATEGORIES.map(function (cat) {
      var unlocked = isCategoryUnlocked(cat.id);
      var done = !!st.completed[cat.id];
      var cardClasses = ['category-card'];
      if (unlocked) cardClasses.push('is-unlocked');
      else cardClasses.push('is-locked');
      if (done) cardClasses.push('is-completed');

      var statusBadge = '';
      if (done) {
        statusBadge = '<span class="status-badge status-badge-done">&#10003; Vollständig gelöst</span>';
      } else if (unlocked) {
        statusBadge = '<span class="status-badge status-badge-active">Jetzt freigeschaltet</span>';
      } else {
        statusBadge =
          '<span class="status-badge status-badge-locked">&#128274; Gesperrt &ndash; erst Lernbereich ' +
          (cat.id - 1) +
          ' abschließen</span>';
      }

      var checkIcon = done
        ? '<span class="check-circle" title="Gelöst" aria-label="Gelöst">&#10003;</span>'
        : '';

      var openBtnLabel = done ? 'Bereich wiederholen' : 'Lernbereich starten &rarr;';
      var openBtnClass = done ? 'btn btn-secondary' : 'btn btn-primary';

      var merkblattToggleBtn = done
        ? '<button type="button" class="btn btn-secondary btn-sm" data-action="toggle-merkblatt" data-cat="' +
          cat.id +
          '">' +
          (st.merkblattOpen[cat.id] ? 'Merkblatt ausblenden' : 'Merkblatt anzeigen') +
          '</button>'
        : '';

      var extraHTML = '';
      if (done) {
        extraHTML =
          '<div class="category-extra">' +
            renderWorksheetCalloutHTML(cat.id, false) +
            renderMerkblattHTML(cat.id) +
          '</div>';
      }

      return (
        '<article class="' + cardClasses.join(' ') + '">' +
          '<div class="category-card-top">' +
            '<div class="category-info">' +
              '<div class="category-status-row">' +
                checkIcon +
                statusBadge +
              '</div>' +
              '<h3 class="category-title">' + cat.title + '</h3>' +
              '<p class="category-subtitle">' + cat.subtitle + '</p>' +
            '</div>' +
            '<div class="category-actions">' +
              '<button type="button" class="' + openBtnClass + '" data-action="open-category" data-cat="' + cat.id + '" ' +
                (unlocked ? '' : 'disabled aria-disabled="true"') + '>' +
                openBtnLabel +
              '</button>' +
              merkblattToggleBtn +
            '</div>' +
          '</div>' +
          extraHTML +
        '</article>'
      );
    }).join('');

    container.innerHTML =
      '<section class="hero-intro">' +
        '<h2>Dein Lernpfad: Von Zahlenmengen zu Relationen &amp; Funktionen</h2>' +
        '<p>Arbeite die <strong>3 Lernbereiche Schritt für Schritt</strong> durch. Jeder abgeschlossene Bereich schaltet dein kompaktes <strong>Merkblatt</strong>, den passenden Auftrag auf dem <strong>1.&nbsp;Arbeitsblatt</strong> sowie die nächste Stufe frei.</p>' +
      '</section>' +
      '<div class="organizer-list">' +
        cardsHTML +
      '</div>';
  }

  // =========================================================================
  // BEREICH 1: ZAHLENMENGEN & SCHREIBWEISEN-BAUKASTEN
  // =========================================================================
  function getActiveExamplePair() {
    var st = S.get();
    var start = st.sec1.pairGroup === 1 ? 2 : 0;
    return D.REAL_NUMBER_EXAMPLES.slice(start, start + 2);
  }

  function renderSection1(container) {
    var st = S.get();
    var cat = D.CATEGORIES[0];
    var activeSet = D.NUMBER_SETS[st.sec1.activeSetIndex] || D.NUMBER_SETS[0];
    var pairExamples = getActiveExamplePair();

    // Schachtelketten-Buttons
    var chainButtonsHTML = D.NUMBER_SETS.map(function (s, idx) {
      var isAct = idx === st.sec1.activeSetIndex;
      var styleAttr = isAct
        ? 'style="background:' + s.color + ';border-color:' + s.color + ';"'
        : '';
      var subSep = idx < D.NUMBER_SETS.length - 1 ? '<span class="chain-sub-op">&sub;</span>' : '';
      return (
        '<button type="button" class="set-pill-btn ' + (isAct ? 'is-active' : '') + '" ' +
          styleAttr +
          ' data-action="select-number-set" data-index="' + idx + '">' +
          s.symbolHTML +
        '</button>' +
        subSep
      );
    }).join('');

    // 2 reale Zahlenbeispiele samt Alltagsbedeutung (Schritt 1.1)
    var assignCardsHTML = pairExamples.map(function (ex) {
      var userAns = st.sec1.assignments[ex.id] || { set: '', meaning: '' };
      var cardDone = userAns.set === ex.correctSet && userAns.meaning === ex.correctMeaningId && st.sec1.step1_1Solved;

      var setBtns = D.NUMBER_SETS.map(function (s) {
        var sel = userAns.set === s.key;
        return (
          '<button type="button" class="set-choice-btn ' + (sel ? 'is-selected' : '') + '" ' +
            'data-action="assign-example-set" data-ex="' + ex.id + '" data-set="' + s.key + '">' +
            s.symbolHTML +
          '</button>'
        );
      }).join('');

      var meaningRadios = ex.meaningOptions.map(function (opt) {
        var sel = userAns.meaning === opt.id;
        return (
          '<label class="meaning-option ' + (sel ? 'is-selected' : '') + '">' +
            '<input type="radio" name="meaning_' + ex.id + '" value="' + opt.id + '" ' +
              (sel ? 'checked' : '') +
              ' data-action="assign-example-meaning" data-ex="' + ex.id + '" data-meaning="' + opt.id + '">' +
            '<span>' + opt.label + '</span>' +
          '</label>'
        );
      }).join('');

      return (
        '<div class="example-assign-card ' + (cardDone ? 'is-correct' : '') + '">' +
          '<span class="context-badge">' + ex.contextBadge + '</span>' +
          '<h4>' + ex.promptTitle + '</h4>' +
          '<div class="example-value-hero">' + ex.valueHTML + '</div>' +
          '<span class="field-label">1. Kleinste passende Zahlenmenge wählen:</span>' +
          '<div class="set-choice-row">' + setBtns + '</div>' +
          '<span class="field-label">2. Passende Alltagsbedeutung &amp; Eigenschaft zuordnen:</span>' +
          '<div class="meaning-radio-list">' + meaningRadios + '</div>' +
        '</div>'
      );
    }).join('');

    var step1FeedbackHTML = '';
    if (sec1CheckFeedback) {
      step1FeedbackHTML =
        '<div class="feedback-banner ' + (sec1CheckFeedback.passed ? 'feedback-success' : 'feedback-hint') + '">' +
          '<strong class="feedback-title">' + sec1CheckFeedback.title + '</strong>' +
          '<div>' + sec1CheckFeedback.messageHTML + '</div>' +
        '</div>';
    } else if (st.sec1.step1_1Solved) {
      step1FeedbackHTML =
        '<div class="feedback-banner feedback-success">' +
          '<strong class="feedback-title">&#10003; Zuordnung gelöst!</strong>' +
          '<div>Beide Zahlenbeispiele samt Alltagsbedeutung sind richtig eingeordnet. Unten ist jetzt der <strong>Schreibweisen-Baukasten</strong> geöffnet.</div>' +
        '</div>';
    }

    // Schritt 1.2: Schreibweisen-Baukasten (erst nach korrekter Zuordnung geöffnet!)
    var baukastenContentHTML = '';
    if (!st.sec1.step1_1Solved) {
      baukastenContentHTML =
        '<section class="step-card is-step-locked" aria-disabled="true">' +
          '<span class="step-eyebrow">Schritt 1.2 &middot; Noch gesperrt</span>' +
          '<h3>&#128274; Interaktiver Schreibweisen-Baukasten</h3>' +
          '<p class="step-lead" style="margin-bottom:0;">Ordne zuerst oben die <strong>2 realen Zahlenbeispiele samt Alltagsbedeutung</strong> richtig zu. Direkt danach öffnet sich hier der interaktive Baukasten zu allen Mengensymbolen (<code>{ }</code>, <code>;</code>, <code>...</code>, <code>&cup;</code>, <code>|</code>, <code>&isin;</code>, <code>&sub;</code>).</p>' +
        '</section>';
    } else {
      var activeSym = D.NOTATION_SYMBOLS.filter(function (sym) {
        return sym.id === st.sec1.activeSymbolId;
      })[0] || D.NOTATION_SYMBOLS[0];

      var tilesHTML = D.NOTATION_SYMBOLS.map(function (sym) {
        var isVis = st.sec1.visitedSymbols.indexOf(sym.id) !== -1;
        var isAct = sym.id === activeSym.id;
        var cls = ['symbol-tile'];
        if (isVis) cls.push('is-visited');
        if (isAct) cls.push('is-active');
        return (
          '<button type="button" class="' + cls.join(' ') + '" data-action="select-symbol" data-sym="' + sym.id + '">' +
            '<span class="symbol-tile-token">' + sym.tokenHTML + '</span>' +
            '<span class="symbol-tile-name">' + sym.title + '</span>' +
          '</button>'
        );
      }).join('');

      var miniRowsHTML = D.NOTATION_MINI_CHECKS.map(function (mc) {
        var picked = st.sec1.miniChecks[mc.id] || '';
        var optsHTML = mc.options.map(function (o) {
          var isP = picked === o.val;
          return (
            '<button type="button" class="mini-opt-btn ' + (isP ? 'is-picked' : '') + '" ' +
              'data-action="pick-mini-symbol" data-mc="' + mc.id + '" data-val="' + o.val + '">' +
              o.labelHTML +
            '</button>'
          );
        }).join('');

        return (
          '<div class="mini-check-row">' +
            '<div>' +
              '<div class="mini-check-expr">' +
                '<span>' + mc.beforeHTML + '</span>' +
                '<span class="gap-placeholder">' + (picked ? F.escapeHTML(picked) : '?') + '</span>' +
                '<span>' + mc.afterHTML + '</span>' +
              '</div>' +
              '<div style="font-size:0.8rem;color:#64748b;">' + mc.hint + '</div>' +
            '</div>' +
            '<div class="mini-check-opts">' + optsHTML + '</div>' +
          '</div>'
        );
      }).join('');

      var miniFeedbackHTML = '';
      if (sec1MiniFeedback) {
        miniFeedbackHTML =
          '<div class="feedback-banner ' + (sec1MiniFeedback.passed ? 'feedback-success' : 'feedback-hint') + '">' +
            '<strong class="feedback-title">' + sec1MiniFeedback.title + '</strong>' +
            '<div>' + sec1MiniFeedback.messageHTML + '</div>' +
          '</div>';
      }

      baukastenContentHTML =
        '<section class="step-card" id="sec1-baukasten">' +
          '<span class="step-eyebrow">Schritt 1.2 &middot; Schreibweisen-Baukasten</span>' +
          '<h3>Mathematische Symbole einzeln entschlüsseln</h3>' +
          '<p class="step-lead">Klicke jedes der <strong>7 Symbole</strong> einmal an, um seine genaue Bedeutung in der Mengenschreibweise zu entdecken (' +
            st.sec1.visitedSymbols.length + ' von 7 erkundet).</p>' +
          '<div class="baukasten-formula-bar">' +
            '<span>Beispielausdrücke: &nbsp; <code>&#8469;<sub>0</sub> = {0; 1; 2; ...} = &#8469; &cup; {0}</code> &nbsp;&middot;&nbsp; <code>&minus;18 &isin; &#8484; &sub; &#8477;</code> &nbsp;&middot;&nbsp; <code>{x &isin; &#8477; | x &ge; 0}</code></span>' +
            '<span class="status-badge status-badge-active">' + st.sec1.visitedSymbols.length + ' / 7 Symbole entdeckt</span>' +
          '</div>' +
          '<div class="symbol-tiles">' + tilesHTML + '</div>' +
          '<div class="symbol-explain-card">' +
            '<h4>Symbol <code>' + activeSym.tokenHTML + '</code> &ndash; ' + activeSym.title + '</h4>' +
            '<p class="symbol-spoken">So sprichst du es aus: ' + activeSym.spokenAs + '</p>' +
            '<p style="margin:0 0 0.45rem;">' + activeSym.explanationHTML + '</p>' +
            '<div class="symbol-example-pill">Beispiel: ' + activeSym.exampleHTML + '</div>' +
            '<p style="margin:0.35rem 0 0;font-size:0.87rem;color:#1e3a8a;"><strong>Praxis-Merke:</strong> ' + activeSym.tipHTML + '</p>' +
          '</div>' +
          '<div class="mini-check-box">' +
            '<h4 style="margin:0 0 0.35rem;">Kurzer Baukasten-Check: Welches Symbol passt in die Lücke?</h4>' +
            miniRowsHTML +
            '<div style="margin-top:0.85rem;display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
              '<button type="button" class="btn btn-primary" data-action="check-sec1-baukasten">Baukasten-Check prüfen &amp; Bereich 1 abschließen</button>' +
            '</div>' +
            miniFeedbackHTML +
          '</div>' +
        '</section>';
    }

    container.innerHTML =
      '<div class="section-topbar">' +
        '<button type="button" class="btn btn-secondary btn-sm" data-action="go-home">&larr; Zurück zur Übersicht</button>' +
        (st.completed[1]
          ? '<button type="button" class="btn btn-secondary btn-sm" data-action="toggle-merkblatt" data-cat="1">' +
              (st.merkblattOpen[1] ? 'Merkblatt 1 ausblenden' : 'Merkblatt 1 anzeigen') +
            '</button>'
          : '') +
      '</div>' +
      '<header class="section-header-card">' +
        '<div class="section-header-row">' +
          '<h2>' +
            (st.completed[1] ? '<span class="check-circle">&#10003;</span>' : '') +
            '<span>' + cat.title + '</span>' +
          '</h2>' +
          '<span class="status-badge ' + (st.completed[1] ? 'status-badge-done' : 'status-badge-active') + '">' +
            (st.completed[1] ? '&#10003; Bereich gelöst' : 'Lernbereich 1 von 3') +
          '</span>' +
        '</div>' +
        '<p>' + cat.subtitle + '</p>' +
        renderMerkblattHTML(1) +
      '</header>' +

      // Visuelle Schachtelkette: Euler-Diagramm + Animierter Zahlenstrahl
      '<section class="step-card">' +
        '<span class="step-eyebrow">Entdecken &middot; Die Schachtelkette</span>' +
        '<h3>Wie sich die Zahlenmengen schrittweise ausbreiten: &#8469; &sub; &#8469;<sub>0</sub> &sub; &#8484; &sub; &#8474; &sub; &#8477;</h3>' +
        '<p class="step-lead">Jede neue Zahlenmenge schließt die vorherige komplett ein. Klicke auf die Mengen-Buttons, direkt in die Ringe oder starte die Animation.</p>' +
        '<div class="chain-banner">' +
          '<div class="chain-pills">' + chainButtonsHTML + '</div>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="play-set-expansion">&#9654; Ausbreitung animieren (&#8469; &rarr; &#8477;)</button>' +
        '</div>' +
        '<div class="vis-two-col">' +
          '<div class="canvas-box">' +
            '<canvas id="euler-canvas" aria-label="Euler-Mengendiagramm der Zahlenmengen"></canvas>' +
            '<p class="canvas-caption">Euler-Mengendiagramm (Tipp: Klicke direkt auf eine Schale)</p>' +
          '</div>' +
          '<div class="set-detail-panel" style="border-color:' + activeSet.color + ';">' +
            '<div>' +
              '<h4 class="set-detail-title" style="color:' + activeSet.color + ';">' +
                '<span style="font-size:1.35rem;">' + activeSet.symbolHTML + '</span>' +
                '<span>&ndash; ' + activeSet.name + '</span>' +
              '</h4>' +
              '<div class="set-def-box">' + activeSet.definitionHTML + '</div>' +
              '<p class="set-meta-item"><strong>Alltagsbedeutung:</strong> ' + activeSet.everydayMeaning + '</p>' +
              '<p class="set-meta-item"><strong>Typische Beispiele:</strong> ' + activeSet.examplesHTML + '</p>' +
            '</div>' +
            '<p class="set-meta-item" style="margin-bottom:0;padding-top:0.55rem;border-top:1px solid #e2e8f0;">' +
              '<strong>Blick auf den Zahlenstrahl:</strong> ' + activeSet.numberLineHint +
            '</p>' +
          '</div>' +
        '</div>' +
        '<div class="canvas-box">' +
          '<canvas id="numberline-canvas" aria-label="Animierter Zahlenstrahl"></canvas>' +
          '<p class="canvas-caption">Animierter Zahlenstrahl: Beobachte, wie sich die Lücken von einzelnen Zählpunkten (&#8469;) bis zur lückenlosen Zahlengeraden (&#8477;) füllen.</p>' +
        '</div>' +
      '</section>' +

      // Schritt 1.1: 2 reale Zahlenbeispiele samt Alltagsbedeutung eigenständig zuordnen
      '<section class="step-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;flex-wrap:wrap;">' +
          '<div>' +
            '<span class="step-eyebrow">Schritt 1.1 &middot; Eigenständige Zuordnung</span>' +
            '<h3>2 reale Zahlenbeispiele samt Alltagsbedeutung zuordnen</h3>' +
          '</div>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="switch-example-pair">' +
            (st.sec1.pairGroup === 0 ? 'Weiteres Paar zeigen (&radic;2 &amp; 3/4&nbsp;Zoll)' : 'Standard-Paar zeigen (&minus;18&nbsp;°C &amp; &pi;)') +
          '</button>' +
        '</div>' +
        '<p class="step-lead">Wähle für beide Praxiswerte jeweils die <strong>kleinste passende Zahlenmenge</strong> und die zutreffende <strong>Alltagsbedeutung</strong>. Erst danach öffnet sich der Schreibweisen-Baukasten.</p>' +
        '<div class="assignment-grid">' + assignCardsHTML + '</div>' +
        '<button type="button" class="btn btn-primary" data-action="check-sec1-examples">Zuordnung prüfen</button>' +
        step1FeedbackHTML +
      '</section>' +

      baukastenContentHTML +
      renderWorksheetCalloutHTML(1, true);

    currentEulerAnimVal = st.sec1.activeSetIndex;
    redrawSection1Canvases(currentEulerAnimVal);
    bindEulerCanvasClick();
  }

  function redrawSection1Canvases(stageVal) {
    var eulerCanvas = document.getElementById('euler-canvas');
    var lineCanvas = document.getElementById('numberline-canvas');
    if (eulerCanvas) C.drawEulerDiagram(eulerCanvas, stageVal);
    if (lineCanvas) C.drawNumberLine(lineCanvas, stageVal);
  }

  function bindEulerCanvasClick() {
    var eulerCanvas = document.getElementById('euler-canvas');
    if (!eulerCanvas) return;
    eulerCanvas.onclick = function (ev) {
      var idx = C.hitTestEulerDiagram(eulerCanvas, ev.clientX, ev.clientY);
      if (idx >= 0) {
        selectNumberSetWithAnimation(idx);
      }
    };
  }

  function selectNumberSetWithAnimation(targetIdx) {
    var st = S.get();
    var startVal = currentEulerAnimVal;
    st.sec1.activeSetIndex = targetIdx;
    S.save();
    renderSection1(document.getElementById('app-main'));
    C.animateSetStage(startVal, targetIdx, 420, function (val) {
      currentEulerAnimVal = val;
      redrawSection1Canvases(val);
    });
  }

  // =========================================================================
  // BEREICH 2: PRAXISDATEN MIT EINER WERTETABELLE STRUKTURIEREN
  // =========================================================================
  function renderSection2(container) {
    var st = S.get();
    var cat = D.CATEGORIES[1];
    var ctxKey = st.sec2.selectedContext;
    var ctxData = ctxKey ? D.PRAXIS_CONTEXTS[ctxKey] : null;

    var contextCardsHTML = ['kuehlhaus', 'festival', 'stanzmaschine'].map(function (key) {
      var item = D.PRAXIS_CONTEXTS[key];
      var isSel = ctxKey === key;
      return (
        '<button type="button" class="context-card ' + (isSel ? 'is-selected' : '') + '" ' +
          'data-action="select-praxis-context" data-context="' + key + '">' +
          '<div>' +
            '<span class="context-badge">' + item.badge + '</span>' +
            '<h4>' + item.title + '</h4>' +
            '<p>' + item.cardSummary + '</p>' +
          '</div>' +
          '<div style="margin-top:0.85rem;font-size:0.83rem;font-weight:700;color:#1d4ed8;">' +
            (isSel ? '&#10003; Ausgewählter Praxiskontext' : 'Praxiskontext auswählen &rarr;') +
          '</div>' +
        '</button>'
      );
    }).join('');

    // WICHTIG (Spezifikation 2.1): Vor dem Klick auf einen Praxiskontext wird NUR die Auswahl angezeigt!
    var afterContextHTML = '';
    if (ctxData) {
      var userInputs = st.sec2.tableInputs[ctxKey] || {};
      var step2_2Unlocked = st.sec2.freetextSolved;
      var isThisContextSolved = !!(st.sec2.solvedContexts && st.sec2.solvedContexts[ctxKey]);

      var tableRowsHTML = ctxData.rows.map(function (row) {
        var cellYHTML = '';
        if (!row.missing) {
          cellYHTML = '<strong>' + F.formatNumberHTML(row.y) + '</strong>';
        } else if (!step2_2Unlocked) {
          cellYHTML = '<span class="gap-placeholder">Lücke (Schritt&nbsp;2.2)</span>';
        } else if (isThisContextSolved) {
          cellYHTML = '<strong style="color:#15803d;">' + F.formatNumberHTML(row.y) + ' &#10003;</strong>';
        } else {
          var savedVal = userInputs[row.x] !== undefined ? userInputs[row.x] : '';
          cellYHTML =
            '<input type="text" inputmode="decimal" class="table-num-input" ' +
              'aria-label="Fehlender Wert für x = ' + row.x + '" ' +
              'placeholder="Wert?" ' +
              'data-action="input-table-val" data-x="' + row.x + '" ' +
              'value="' + F.escapeHTML(savedVal) + '">';
        }

        return (
          '<tr>' +
            '<td>' + F.formatNumberHTML(row.x) + '</td>' +
            '<td>' + cellYHTML + '</td>' +
          '</tr>'
        );
      }).join('');

      var freetextBannerHTML = '';
      if (st.sec2.freetextFeedback) {
        var fb = st.sec2.freetextFeedback;
        freetextBannerHTML =
          '<div class="feedback-banner ' + (fb.status === 'success' ? 'feedback-success' : 'feedback-hint') + '">' +
            '<strong class="feedback-title">' + fb.title + '</strong>' +
            '<div>' + fb.messageHTML + '</div>' +
          '</div>';
      }

      var step2_2SectionHTML = '';
      if (!step2_2Unlocked) {
        step2_2SectionHTML =
          '<section class="step-card is-step-locked" aria-disabled="true">' +
            '<span class="step-eyebrow">Schritt 2.2 &middot; Noch gesperrt</span>' +
            '<h3>&#128274; 3 fehlende Werte in die Wertetabelle übertragen</h3>' +
            '<p class="step-lead" style="margin-bottom:0;">Begründe zuerst in Schritt&nbsp;2.1 in eigenen Worten den Nutzen der Wertetabelle. Danach werden die 3 Eingabefelder in der Tabelle freigeschaltet.</p>' +
          '</section>';
      } else {
        var numFbHTML = '';
        if (sec2NumbersFeedback) {
          numFbHTML =
            '<div class="feedback-banner ' + (sec2NumbersFeedback.passed ? 'feedback-success' : 'feedback-hint') + '">' +
              '<strong class="feedback-title">' + sec2NumbersFeedback.title + '</strong>' +
              '<div>' + sec2NumbersFeedback.messageHTML + '</div>' +
            '</div>';
        } else if (isThisContextSolved) {
          numFbHTML =
            '<div class="feedback-banner feedback-success">' +
              '<strong class="feedback-title">&#10003; Alle 3 Werte richtig übertragen!</strong>' +
              '<div>Deine Wertetabelle zum Kontext <strong>' + ctxData.title + '</strong> ist jetzt vollständig und wird in Lernbereich&nbsp;3 direkt weiterverwendet.</div>' +
            '</div>';
        }

        step2_2SectionHTML =
          '<section class="step-card" id="sec2-step2">' +
            '<span class="step-eyebrow">Schritt 2.2 &middot; Daten übertragen</span>' +
            '<h3>3 fehlende Messwerte aus der Notiz ergänzen</h3>' +
            '<p class="step-lead">Suche die <strong>3 fehlenden Werte</strong> im gelben Notizzettel oben heraus und trage sie direkt in die freien Felder der Wertetabelle ein (bitte deutsches Komma nutzen, z.&nbsp;B. <code>&minus;17,5</code> oder <code>24,5</code>).</p>' +
            (isThisContextSolved
              ? ''
              : '<button type="button" class="btn btn-primary" data-action="check-sec2-table">Eingetragene Werte prüfen</button>') +
            numFbHTML +
          '</section>';
      }

      afterContextHTML =
        '<div class="note-vs-table-grid">' +
          '<div class="clipboard-note">' +
            '<h4>' + ctxData.noteTitle + '</h4>' +
            '<p class="clipboard-meta">' + ctxData.noteAuthor + ' (ungeordnete Rohnotiz)</p>' +
            '<p class="clipboard-text">' + ctxData.noteTextHTML + '</p>' +
          '</div>' +
          '<div class="table-panel">' +
            '<h4>Strukturierte Wertetabelle (' + ctxData.title + ')</h4>' +
            '<div class="data-table-wrap">' +
              '<table class="wertetabelle">' +
                '<thead>' +
                  '<tr>' +
                    '<th>' + ctxData.xHeaderHTML + '</th>' +
                    '<th>' + ctxData.yHeaderHTML + '</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' + tableRowsHTML + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="freetext-box">' +
          '<span class="step-eyebrow">Freitextaufgabe zu Schritt 2.1</span>' +
          '<h4 style="margin:0.15rem 0 0.35rem;">Warum lohnt sich die Wertetabelle gegenüber der ungeordneten Notiz?</h4>' +
          '<p style="margin:0;font-size:0.9rem;color:#334155;">Beschreibe in eigenen Worten, was in der Wertetabelle mit den Daten gemacht wird und welchen Vorteil das beim Arbeiten in der Praxis bringt.</p>' +
          '<textarea id="sec2-freetext-input" class="freetext-textarea" placeholder="Schreibe hier deine Begründung in 1–2 ganzen Sätzen ...">' +
            F.escapeHTML(st.sec2.freetext) +
          '</textarea>' +
          '<button type="button" class="btn btn-primary" data-action="check-sec2-freetext">Begründung prüfen</button>' +
          freetextBannerHTML +
        '</div>';
    }

    container.innerHTML =
      '<div class="section-topbar">' +
        '<button type="button" class="btn btn-secondary btn-sm" data-action="go-home">&larr; Zurück zur Übersicht</button>' +
        (st.completed[2]
          ? '<button type="button" class="btn btn-secondary btn-sm" data-action="toggle-merkblatt" data-cat="2">' +
              (st.merkblattOpen[2] ? 'Merkblatt 2 ausblenden' : 'Merkblatt 2 anzeigen') +
            '</button>'
          : '') +
      '</div>' +
      '<header class="section-header-card">' +
        '<div class="section-header-row">' +
          '<h2>' +
            (st.completed[2] ? '<span class="check-circle">&#10003;</span>' : '') +
            '<span>' + cat.title + '</span>' +
          '</h2>' +
          '<span class="status-badge ' + (st.completed[2] ? 'status-badge-done' : 'status-badge-active') + '">' +
            (st.completed[2] ? '&#10003; Bereich gelöst' : 'Lernbereich 2 von 3') +
          '</span>' +
        '</div>' +
        '<p>' + cat.subtitle + '</p>' +
        renderMerkblattHTML(2) +
      '</header>' +

      '<section class="step-card">' +
        '<span class="step-eyebrow">Schritt 2.1 &middot; Praxiskontext wählen &amp; vergleichen</span>' +
        '<h3>Wähle einen Praxiskontext aus deinem Berufsalltag</h3>' +
        '<p class="step-lead">' +
          (ctxData
            ? 'Vergleiche die ungeordnete Schichtnotiz links mit der geordneten Wertetabelle rechts.'
            : 'Klicke zuerst auf <strong>einen der drei Praxiskontexte</strong>, um die Praxis-Notiz und die Wertetabelle aufzudecken.') +
        '</p>' +
        '<div class="context-grid">' + contextCardsHTML + '</div>' +
        afterContextHTML +
      '</section>' +

      (ctxData ? step2_2SectionHTML : '') +
      renderWorksheetCalloutHTML(2, true);
  }

  // =========================================================================
  // BEREICH 3: EINZELDATEN ZUORDNEN (RELATION VS. FUNKTION)
  // =========================================================================
  function getSection3ContextData() {
    var st = S.get();
    var sel = st.sec2.selectedContext;
    var key =
      (sel && st.sec2.solvedContexts && st.sec2.solvedContexts[sel] ? sel : null) ||
      st.sec2.lastSolvedContext ||
      sel ||
      'kuehlhaus';
    return D.PRAXIS_CONTEXTS[key] || D.PRAXIS_CONTEXTS.kuehlhaus;
  }

  function renderSection3(container) {
    var st = S.get();
    var cat = D.CATEGORIES[2];
    var ctxData = getSection3ContextData();

    // Fertige horizontale/kompakte Wertetabelle aus Bereich 2 direkt anzeigen (keine Matrizen!)
    var xCellsHTML = ctxData.rows.map(function (r) {
      return '<td><strong>' + F.formatNumberHTML(r.x) + '</strong></td>';
    }).join('');
    var yCellsHTML = ctxData.rows.map(function (r) {
      return '<td>' + F.formatNumberHTML(r.y) + '</td>';
    }).join('');

    var bothRevealed = st.sec3.variant1Revealed && st.sec3.variant2Revealed;

    var var1BoxHTML = st.sec3.variant1Revealed
      ? '<h4>' + ctxData.variant1Title + '</h4>' +
        '<p class="variant-desc">' + ctxData.variant1DescHTML + '</p>' +
        '<div class="canvas-box"><canvas id="arrow-canvas-v1" aria-label="Pfeildiagramm Variante 1"></canvas></div>'
      : '<div class="variant-cover">' +
          '<strong>Zuordnungsvariante 1</strong>' +
          '<p style="margin:0;font-size:0.88rem;color:#64748b;">Klicke aktiv auf den Button, um das erste Pfeildiagramm aufzudecken.</p>' +
          '<button type="button" class="btn btn-primary" data-action="reveal-variant" data-var="1">Variante 1 aufdecken</button>' +
        '</div>';

    var var2BoxHTML = st.sec3.variant2Revealed
      ? '<h4>' + ctxData.variant2Title + '</h4>' +
        '<p class="variant-desc">' + ctxData.variant2DescHTML + '</p>' +
        '<div class="canvas-box"><canvas id="arrow-canvas-v2" aria-label="Pfeildiagramm Variante 2"></canvas></div>'
      : '<div class="variant-cover">' +
          '<strong>Zuordnungsvariante 2</strong>' +
          '<p style="margin:0;font-size:0.88rem;color:#64748b;">Klicke aktiv auf den Button, um das zweite Pfeildiagramm zum Vergleich aufzudecken.</p>' +
          '<button type="button" class="btn btn-primary" data-action="reveal-variant" data-var="2">Variante 2 aufdecken</button>' +
        '</div>';

    var sec3FreetextHTML = '';
    if (!bothRevealed) {
      sec3FreetextHTML =
        '<div class="freetext-box" style="opacity:0.7;">' +
          '<strong>Freitextvergleich (wird freigeschaltet, sobald beide Varianten aufgedeckt sind):</strong>' +
          '<p style="margin:0.3rem 0 0;font-size:0.9rem;color:#475569;">Decke oben zuerst <em>Zuordnungsvariante&nbsp;1</em> und <em>Zuordnungsvariante&nbsp;2</em> per Klick auf, um die Pfeildiagramme zu vergleichen.</p>' +
        '</div>';
    } else {
      var fb3HTML = '';
      if (st.sec3.freetextFeedback) {
        var fb3 = st.sec3.freetextFeedback;
        fb3HTML =
          '<div class="feedback-banner ' + (fb3.status === 'success' ? 'feedback-success' : 'feedback-hint') + '">' +
            '<strong class="feedback-title">' + fb3.title + '</strong>' +
            '<div>' + fb3.messageHTML + '</div>' +
          '</div>';
      }

      sec3FreetextHTML =
        '<div class="freetext-box">' +
          '<span class="step-eyebrow">Freitextaufgabe zu Schritt 3.1</span>' +
          '<h4 style="margin:0.15rem 0 0.35rem;">Worin unterscheiden sich Variante 1 und Variante 2 bei der Pfeilanzahl pro Ausgangswert x?</h4>' +
          '<p style="margin:0;font-size:0.9rem;color:#334155;">Schaue genau auf die linke Menge (die Ausgangswerte <strong>x</strong>) und beschreibe den Unterschied in eigenen Worten.</p>' +
          '<textarea id="sec3-freetext-input" class="freetext-textarea" placeholder="Vergleiche hier die Anzahl der startenden Pfeile pro Ausgangswert x in Variante 1 und Variante 2 ...">' +
            F.escapeHTML(st.sec3.freetext) +
          '</textarea>' +
          '<button type="button" class="btn btn-primary" data-action="check-sec3-freetext">Beschreibung prüfen</button>' +
          fb3HTML +
        '</div>';
    }

    // Schritt 3.2: Didaktische Reduktion (Eindeutige Funktion vs. Mehrdeutige Relation & Vertikalentest)
    var step3_2HTML = '';
    if (!st.sec3.freetextSolved) {
      step3_2HTML =
        '<section class="step-card is-step-locked" aria-disabled="true">' +
          '<span class="step-eyebrow">Schritt 3.2 &middot; Noch gesperrt</span>' +
          '<h3>&#128274; Eindeutige Funktion vs. Mehrdeutige Relation im Koordinatensystem (Vertikalentest)</h3>' +
          '<p class="step-lead" style="margin-bottom:0;">Löse zuerst den Freitextvergleich der Pfeildiagramme in Schritt&nbsp;3.1, um den interaktiven Vertikalentest freizuschalten.</p>' +
        '</section>';
    } else {
      var xIdx = Math.min(ctxData.rows.length - 1, Math.max(0, st.sec3.verticalTestXIndex));
      var activeX = ctxData.rows[xIdx].x;

      var xStepBtnsHTML = ctxData.rows.map(function (r, idx) {
        var isMulti = ctxData.multiXValues.indexOf(r.x) !== -1;
        var cls = ['x-step-btn'];
        if (idx === xIdx) cls.push('is-active');
        if (isMulti) cls.push('is-multi-marker');
        return (
          '<button type="button" class="' + cls.join(' ') + '" data-action="set-vertical-x" data-index="' + idx + '">' +
            'x = ' + F.formatNumberHTML(r.x) +
          '</button>'
        );
      }).join('');

      var finishAreaHTML = '';
      if (st.completed[3]) {
        finishAreaHTML =
          '<div class="feedback-banner feedback-success" style="margin-top:1rem;">' +
            '<strong class="feedback-title">&#10003; Lernbereich 3 erfolgreich abgeschlossen!</strong>' +
            '<div>Du kannst eindeutige Funktionen und mehrdeutige Relationen sowohl am Pfeildiagramm als auch mit dem Vertikalentest sicher unterscheiden.</div>' +
          '</div>';
      } else if (st.sec3.inspectedMultiX) {
        finishAreaHTML =
          '<div style="margin-top:1.1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;background:#f0fdf4;border:1.5px solid #86efac;padding:0.95rem 1.15rem;border-radius:10px;">' +
            '<span style="font-size:0.92rem;color:#14532d;"><strong>Stark beobachtet!</strong> Du hast mit der senkrechten Prüfgeraden die übereinanderliegenden Punkte der Relation aufgespürt.</span>' +
            '<button type="button" class="btn btn-success" data-action="complete-sec3">Lernbereich 3 abschließen &#10003;</button>' +
          '</div>';
      } else {
        finishAreaHTML =
          '<div class="feedback-banner feedback-hint" style="margin-top:1rem;">' +
            '<strong class="feedback-title">Probier den Vertikalentest aus!</strong>' +
            '<div>Bewege die senkrechte Prüfgerade über die verschiedenen <strong>x-Werte</strong> (oder klicke auf <em>„Vertikalentest automatisch prüfen“</em>), bis du siehst, wo bei der Relation Punkte senkrecht übereinander liegen.</div>' +
          '</div>';
      }

      step3_2HTML =
        '<section class="step-card" id="sec3-step2">' +
          '<span class="step-eyebrow">Schritt 3.2 &middot; Beziehungsarten &amp; Vertikalentest</span>' +
          '<h3>Eindeutige Funktion vs. Mehrdeutige Relation im Koordinatensystem</h3>' +
          '<p class="step-lead">Überträgt man die Einzeldaten als Punkte <code>(x | y)</code> ins Koordinatensystem, macht eine <strong>senkrechte Prüfgerade (Vertikalentest)</strong> den Unterschied sofort sichtbar:</p>' +
          '<div class="vertical-test-controls">' +
            '<div>' +
              '<span style="display:block;font-size:0.82rem;font-weight:700;color:#475569;margin-bottom:0.35rem;">Senkrechte Prüfgerade auf Ausgangswert x setzen (aktuell: x = ' + F.formatNumberHTML(activeX, ctxData.xUnit) + '):</span>' +
              '<div class="x-step-buttons">' + xStepBtnsHTML + '</div>' +
            '</div>' +
            '<button type="button" class="btn btn-primary btn-sm" data-action="play-vertical-test">&#9654; Vertikalentest automatisch prüfen</button>' +
          '</div>' +
          '<div class="variants-grid">' +
            '<div class="canvas-box">' +
              '<h4 style="margin:0.15rem 0 0.45rem;color:#15803d;">Eindeutige Funktion (Variante 1)</h4>' +
              '<canvas id="vtest-canvas-func" aria-label="Koordinatensystem Eindeutige Funktion mit Vertikalentest"></canvas>' +
            '</div>' +
            '<div class="canvas-box">' +
              '<h4 style="margin:0.15rem 0 0.45rem;color:#b91c1c;">Mehrdeutige Relation (Variante 2)</h4>' +
              '<canvas id="vtest-canvas-rel" aria-label="Koordinatensystem Mehrdeutige Relation mit Vertikalentest"></canvas>' +
            '</div>' +
          '</div>' +
          '<div class="comparison-summary-cards">' +
            '<div class="comp-card comp-card-func">' +
              '<h4 style="color:#15803d;">&#10003; Eindeutige Funktion</h4>' +
              '<p style="margin:0;">Von jedem Ausgangswert <strong>x</strong> startet <strong>genau 1&nbsp;Pfeil</strong>. Jede senkrechte Linie im Koordinatensystem (Vertikalentest) trifft <strong>höchstens 1&nbsp;Punkt</strong>.</p>' +
            '</div>' +
            '<div class="comp-card comp-card-rel">' +
              '<h4 style="color:#b91c1c;">&#9888; Mehrdeutige Relation</h4>' +
              '<p style="margin:0;">Von mindestens einem Ausgangswert <strong>x</strong> gehen <strong>mehrere Pfeile</strong> aus. Im Koordinatensystem liegen an dieser Stelle <strong>Punkte senkrecht übereinander</strong>.</p>' +
            '</div>' +
          '</div>' +
          finishAreaHTML +
        '</section>';
    }

    container.innerHTML =
      '<div class="section-topbar">' +
        '<button type="button" class="btn btn-secondary btn-sm" data-action="go-home">&larr; Zurück zur Übersicht</button>' +
        (st.completed[3]
          ? '<button type="button" class="btn btn-secondary btn-sm" data-action="toggle-merkblatt" data-cat="3">' +
              (st.merkblattOpen[3] ? 'Merkblatt 3 ausblenden' : 'Merkblatt 3 anzeigen') +
            '</button>'
          : '') +
      '</div>' +
      '<header class="section-header-card">' +
        '<div class="section-header-row">' +
          '<h2>' +
            (st.completed[3] ? '<span class="check-circle">&#10003;</span>' : '') +
            '<span>' + cat.title + '</span>' +
          '</h2>' +
          '<span class="status-badge ' + (st.completed[3] ? 'status-badge-done' : 'status-badge-active') + '">' +
            (st.completed[3] ? '&#10003; Bereich gelöst' : 'Lernbereich 3 von 3') +
          '</span>' +
        '</div>' +
        '<p>' + cat.subtitle + '</p>' +
        renderMerkblattHTML(3) +
      '</header>' +

      // Fertige Wertetabelle aus Bereich 2 direkt oben angezeigt
      '<section class="step-card">' +
        '<span class="step-eyebrow">Grundlage aus Lernbereich 2 &middot; Praxiskontext ' + ctxData.title + '</span>' +
        '<h3>Deine fertige Wertetabelle</h3>' +
        '<div class="data-table-wrap">' +
          '<table class="wertetabelle">' +
            '<tbody>' +
              '<tr><th>' + ctxData.xHeaderHTML + '</th>' + xCellsHTML + '</tr>' +
              '<tr><th>' + ctxData.yHeaderHTML + '</th>' + yCellsHTML + '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</section>' +

      '<section class="step-card">' +
        '<span class="step-eyebrow">Schritt 3.1 &middot; Pfeildiagramme aufdecken &amp; vergleichen</span>' +
        '<h3>Zwei mögliche Zuordnungen im Praxisbetrieb</h3>' +
        '<p class="step-lead">Klicke nacheinander auf <strong>Variante&nbsp;1</strong> und <strong>Variante&nbsp;2</strong>, um die zugehörigen Pfeildiagramme aufzudecken.</p>' +
        '<div class="variants-grid">' +
          '<div class="variant-box">' + var1BoxHTML + '</div>' +
          '<div class="variant-box">' + var2BoxHTML + '</div>' +
        '</div>' +
        sec3FreetextHTML +
      '</section>' +

      step3_2HTML +
      renderWorksheetCalloutHTML(3, true);

    redrawSection3Canvases();
  }

  function redrawSection3Canvases() {
    var st = S.get();
    var ctxData = getSection3ContextData();

    if (st.sec3.variant1Revealed) {
      var c1 = document.getElementById('arrow-canvas-v1');
      if (c1) {
        C.drawArrowDiagram(
          c1,
          ctxData.variant1Pairs,
          ctxData.xShortLabel,
          ctxData.yShortLabel,
          ctxData.xUnit,
          ctxData.yUnit
        );
      }
    }
    if (st.sec3.variant2Revealed) {
      var c2 = document.getElementById('arrow-canvas-v2');
      if (c2) {
        C.drawArrowDiagram(
          c2,
          ctxData.variant2Pairs,
          ctxData.xShortLabel,
          ctxData.yShortLabel,
          ctxData.xUnit,
          ctxData.yUnit
        );
      }
    }
    if (st.sec3.freetextSolved) {
      var cf = document.getElementById('vtest-canvas-func');
      var cr = document.getElementById('vtest-canvas-rel');
      var xIdx = Math.min(ctxData.rows.length - 1, Math.max(0, st.sec3.verticalTestXIndex));
      var testXVal = ctxData.rows[xIdx].x;
      var combinedScalePairs = ctxData.variant1Pairs.concat(ctxData.variant2Pairs);

      if (cf) {
        C.drawVerticalTestChart(
          cf,
          ctxData.variant1Pairs,
          combinedScalePairs,
          testXVal,
          ctxData.xShortLabel,
          ctxData.yShortLabel,
          ctxData.xUnit,
          ctxData.yUnit
        );
      }
      if (cr) {
        C.drawVerticalTestChart(
          cr,
          ctxData.variant2Pairs,
          combinedScalePairs,
          testXVal,
          ctxData.xShortLabel,
          ctxData.yShortLabel,
          ctxData.xUnit,
          ctxData.yUnit
        );
      }
    }
  }

  // =========================================================================
  // HAUPT-RENDERER
  // =========================================================================
  function renderApp() {
    renderHeader();
    var main = document.getElementById('app-main');
    if (!main) return;
    var st = S.get();

    if (st.activeView === 1) {
      renderSection1(main);
    } else if (st.activeView === 2 && isCategoryUnlocked(2)) {
      renderSection2(main);
    } else if (st.activeView === 3 && isCategoryUnlocked(3)) {
      renderSection3(main);
    } else {
      st.activeView = 'home';
      renderHome(main);
    }
  }

  // =========================================================================
  // PRÜFLOGIK FÜR DIE EINZELNEN LERNSCHRITTE
  // =========================================================================
  function handleCheckSec1Examples() {
    var st = S.get();
    var pair = getActiveExamplePair();
    var setOrder = ['N', 'N0', 'Z', 'Q', 'R'];

    for (var i = 0; i < pair.length; i++) {
      var ex = pair[i];
      var ans = st.sec1.assignments[ex.id] || { set: '', meaning: '' };

      if (!ans.set || !ans.meaning) {
        sec1CheckFeedback = {
          passed: false,
          title: 'Noch nicht ganz vollständig',
          messageHTML:
            'Bitte wähle bei <strong>beiden</strong> Zahlenbeispielen sowohl eine <strong>Zahlenmenge</strong> als auch die passende <strong>Alltagsbedeutung</strong> aus.'
        };
        renderApp();
        return;
      }

      if (ans.set !== ex.correctSet) {
        var chosenIdx = setOrder.indexOf(ans.set);
        var correctIdx = setOrder.indexOf(ex.correctSet);
        var hintMsg = chosenIdx > correctIdx && ex.supersetHint ? ex.supersetHint : ex.subsetHint;
        sec1CheckFeedback = {
          passed: false,
          title: 'Schau noch einmal auf ' + ex.promptTitle,
          messageHTML: hintMsg
        };
        renderApp();
        return;
      }

      if (ans.meaning !== ex.correctMeaningId) {
        sec1CheckFeedback = {
          passed: false,
          title: 'Zahlenmenge stimmt – prüfe noch die Alltagsbedeutung!',
          messageHTML:
            'Bei <strong>' + ex.promptTitle + '</strong> hast du die richtige Zahlenmenge gewählt. Lies dir darunter noch einmal die drei Beschreibungen zur Alltagsbedeutung genau durch.'
        };
        renderApp();
        return;
      }
    }

    st.sec1.step1_1Solved = true;
    sec1CheckFeedback = {
      passed: true,
      title: 'Perfekt zugeordnet!',
      messageHTML:
        'Beide realen Zahlenbeispiele und ihre Alltagsbedeutung stimmen! Direkt darunter hat sich jetzt der <strong>interaktive Schreibweisen-Baukasten</strong> geöffnet.'
    };
    S.save();
    renderApp();

    var bk = document.getElementById('sec1-baukasten');
    if (bk && bk.scrollIntoView) {
      bk.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleCheckSec1Baukasten() {
    var st = S.get();
    var checks = D.NOTATION_MINI_CHECKS;

    for (var i = 0; i < checks.length; i++) {
      var mc = checks[i];
      var picked = st.sec1.miniChecks[mc.id];
      if (!picked) {
        sec1MiniFeedback = {
          passed: false,
          title: 'Bitte fülle alle 3 Symbol-Lücken aus',
          messageHTML: 'Wähle in jeder der 3 Zeilen rechts eines der vorgeschlagenen mathematischen Symbole aus.'
        };
        renderApp();
        return;
      }
      if (picked !== mc.correct) {
        sec1MiniFeedback = {
          passed: false,
          title: 'Schau dir Zeile ' + (i + 1) + ' noch einmal genau an',
          messageHTML:
            mc.hint + ' Klicke oben im Baukasten gerne noch einmal auf <code>&isin;</code>, <code>&sub;</code> und <code>&cup;</code> zum Vergleich.'
        };
        renderApp();
        return;
      }
    }

    if (st.sec1.visitedSymbols.length < D.NOTATION_SYMBOLS.length) {
      sec1MiniFeedback = {
        passed: false,
        title: 'Die 3 Lücken stimmen schon! Entdecke noch kurz alle 7 Symbole oben',
        messageHTML:
          'Du hast bisher <strong>' +
          st.sec1.visitedSymbols.length +
          ' von 7 Symbol-Kacheln</strong> angeklickt. Klicke oben im Baukasten noch kurz die übrigen Symbole ohne grünen Haken an, damit dir kein Zeichen entgeht!'
      };
      renderApp();
      return;
    }

    st.sec1.step1_2Solved = true;
    st.completed[1] = true;
    st.merkblattOpen[1] = true;
    sec1MiniFeedback = {
      passed: true,
      title: 'Lernbereich 1 vollständig gemeistert!',
      messageHTML:
        'Klasse! Dein <strong>Merkblatt 1</strong>, die Aufgabe auf dem <strong>1.&nbsp;Arbeitsblatt (Aufgabe 2a)</strong> und <strong>Lernbereich&nbsp;2</strong> sind jetzt freigeschaltet.'
    };
    S.save();
    renderApp();
  }

  function handleCheckSec2Table() {
    var st = S.get();
    var ctxKey = st.sec2.selectedContext;
    if (!ctxKey) return;
    var ctxData = D.PRAXIS_CONTEXTS[ctxKey];
    var inputs = st.sec2.tableInputs[ctxKey] || {};

    var missingRows = ctxData.rows.filter(function (r) { return r.missing; });
    var usedDot = false;

    for (var i = 0; i < missingRows.length; i++) {
      var row = missingRows[i];
      var raw = inputs[row.x];
      if (raw === undefined || String(raw).trim() === '') {
        sec2NumbersFeedback = {
          passed: false,
          title: 'Es fehlen noch Eintragungen',
          messageHTML:
            'Bitte trage für alle 3 freien Zeilen einen Zahlenwert aus der Notiz ein (z.&nbsp;B. fehlt noch der Wert bei <strong>x = ' +
            F.formatNumberHTML(row.x) +
            '</strong>).'
        };
        renderApp();
        return;
      }

      if (F.usedEnglishDecimalPoint(raw)) {
        usedDot = true;
      }

      var parsed = F.parseGermanNumber(raw);
      if (isNaN(parsed)) {
        sec2NumbersFeedback = {
          passed: false,
          title: 'Ungültige Zahleneingabe bei x = ' + F.formatNumberHTML(row.x),
          messageHTML:
            'Bitte gib eine gültige Zahl mit deutschem Dezimalkomma ein (z.&nbsp;B. <code>&minus;17,5</code> oder <code>36,5</code>).'
        };
        renderApp();
        return;
      }

      if (Math.abs(parsed - row.y) > 0.001) {
        sec2NumbersFeedback = {
          passed: false,
          title: 'Prüfe noch einmal den Wert bei x = ' + F.formatNumberHTML(row.x, ctxData.xUnit),
          messageHTML:
            'Suche im gelben Notizzettel genau nach der Stelle zu <strong>' +
            F.formatNumberHTML(row.x, ctxData.xUnit) +
            '</strong> (achte auch auf Vorzeichen und Nachkommastelle).'
        };
        renderApp();
        return;
      }

      // Sauber mit deutschem Dezimalkomma normieren
      inputs[row.x] = F.formatNumberCanvas(row.y);
    }

    st.sec2.solvedContexts = st.sec2.solvedContexts || {};
    st.sec2.solvedContexts[ctxKey] = true;
    st.sec2.lastSolvedContext = ctxKey;
    st.sec2.step2_2Solved = true;
    st.completed[2] = true;
    st.merkblattOpen[2] = true;
    sec2NumbersFeedback = {
      passed: true,
      title: 'Alle 3 Messwerte stimmen exakt!',
      messageHTML:
        (usedDot
          ? 'Hinweis: Wir haben deinen Dezimalpunkt direkt in das deutsche Dezimalkomma umgewandelt. '
          : '') +
        'Lernbereich&nbsp;2 ist gelöst &ndash; bearbeite jetzt <strong>Aufgabe 2b auf dem 1.&nbsp;AB</strong>!'
    };
    S.save();
    renderApp();
  }

  // =========================================================================
  // ZENTRALES EVENT-HANDLING
  // =========================================================================
  function setupEventListeners() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var st = S.get();

      if (action === 'go-home') {
        st.activeView = 'home';
        S.save();
        renderApp();
        global.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'open-category') {
        var catId = parseInt(btn.getAttribute('data-cat'), 10);
        if (isCategoryUnlocked(catId)) {
          st.activeView = catId;
          S.save();
          renderApp();
          global.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (action === 'toggle-merkblatt') {
        var mCat = parseInt(btn.getAttribute('data-cat'), 10);
        if (st.completed[mCat]) {
          st.merkblattOpen[mCat] = !st.merkblattOpen[mCat];
          S.save();
          renderApp();
        }
      } else if (action === 'open-reset-modal') {
        var modal = document.getElementById('reset-modal');
        if (modal) modal.hidden = false;
      } else if (action === 'cancel-reset') {
        var modalCancel = document.getElementById('reset-modal');
        if (modalCancel) modalCancel.hidden = true;
      } else if (action === 'confirm-reset') {
        sec1CheckFeedback = null;
        sec1MiniFeedback = null;
        sec2NumbersFeedback = null;
        S.reset();
        var modalConfirm = document.getElementById('reset-modal');
        if (modalConfirm) modalConfirm.hidden = true;
        renderApp();
        global.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'select-number-set') {
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        selectNumberSetWithAnimation(idx);
      } else if (action === 'play-set-expansion') {
        st.sec1.activeSetIndex = 4;
        S.save();
        renderSection1(document.getElementById('app-main'));
        C.animateSetStage(0, 4, 2600, function (val) {
          currentEulerAnimVal = val;
          redrawSection1Canvases(val);
        });
      } else if (action === 'switch-example-pair') {
        st.sec1.pairGroup = st.sec1.pairGroup === 0 ? 1 : 0;
        sec1CheckFeedback = null;
        S.save();
        renderApp();
      } else if (action === 'assign-example-set') {
        var exId = btn.getAttribute('data-ex');
        var setKey = btn.getAttribute('data-set');
        st.sec1.assignments[exId] = st.sec1.assignments[exId] || { set: '', meaning: '' };
        st.sec1.assignments[exId].set = setKey;
        sec1CheckFeedback = null;
        S.save();
        renderApp();
      } else if (action === 'check-sec1-examples') {
        handleCheckSec1Examples();
      } else if (action === 'select-symbol') {
        var symId = btn.getAttribute('data-sym');
        st.sec1.activeSymbolId = symId;
        if (st.sec1.visitedSymbols.indexOf(symId) === -1) {
          st.sec1.visitedSymbols.push(symId);
        }
        sec1MiniFeedback = null;
        S.save();
        renderApp();
      } else if (action === 'pick-mini-symbol') {
        var mcId = btn.getAttribute('data-mc');
        var val = btn.getAttribute('data-val');
        st.sec1.miniChecks[mcId] = val;
        sec1MiniFeedback = null;
        S.save();
        renderApp();
      } else if (action === 'check-sec1-baukasten') {
        handleCheckSec1Baukasten();
      } else if (action === 'select-praxis-context') {
        var newCtx = btn.getAttribute('data-context');
        if (st.sec2.selectedContext !== newCtx) {
          st.sec2.selectedContext = newCtx;
          sec2NumbersFeedback = null;
          S.save();
          renderApp();
        }
      } else if (action === 'check-sec2-freetext') {
        var ta2 = document.getElementById('sec2-freetext-input');
        if (ta2) st.sec2.freetext = ta2.value;
        var res2 = E.evaluateTableBenefit(st.sec2.freetext);
        st.sec2.freetextFeedback = res2;
        if (res2.passed) {
          st.sec2.freetextSolved = true;
        }
        S.save();
        renderApp();
      } else if (action === 'check-sec2-table') {
        handleCheckSec2Table();
      } else if (action === 'reveal-variant') {
        var vNum = btn.getAttribute('data-var');
        if (vNum === '1') st.sec3.variant1Revealed = true;
        if (vNum === '2') st.sec3.variant2Revealed = true;
        S.save();
        renderApp();
      } else if (action === 'check-sec3-freetext') {
        var ta3 = document.getElementById('sec3-freetext-input');
        if (ta3) st.sec3.freetext = ta3.value;
        var res3 = E.evaluateArrowDifference(st.sec3.freetext);
        st.sec3.freetextFeedback = res3;
        if (res3.passed) {
          st.sec3.freetextSolved = true;
        }
        S.save();
        renderApp();
        if (res3.passed) {
          var s32 = document.getElementById('sec3-step2');
          if (s32 && s32.scrollIntoView) {
            s32.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      } else if (action === 'set-vertical-x') {
        var xIdx = parseInt(btn.getAttribute('data-index'), 10);
        var ctxData = getSection3ContextData();
        st.sec3.verticalTestXIndex = xIdx;
        var chosenX = ctxData.rows[xIdx].x;
        if (ctxData.multiXValues.indexOf(chosenX) !== -1) {
          st.sec3.inspectedMultiX = true;
        }
        S.save();
        renderApp();
      } else if (action === 'play-vertical-test') {
        var ctxDataAnim = getSection3ContextData();
        C.animateVerticalTestSteps(
          ctxDataAnim.rows.length,
          function (stepIdx) {
            var stNow = S.get();
            if (stNow.activeView !== 3) return;
            stNow.sec3.verticalTestXIndex = stepIdx;
            var curX = ctxDataAnim.rows[stepIdx].x;
            if (ctxDataAnim.multiXValues.indexOf(curX) !== -1) {
              stNow.sec3.inspectedMultiX = true;
            }
            S.save();
            renderApp();
          }
        );
      } else if (action === 'complete-sec3') {
        st.sec3.step3_2Solved = true;
        st.completed[3] = true;
        st.merkblattOpen[3] = true;
        S.save();
        renderApp();
      }
    });

    // Radio-Buttons & Texteingaben laufend im State sichern
    document.addEventListener('change', function (ev) {
      var target = ev.target;
      var st = S.get();
      if (target.getAttribute('data-action') === 'assign-example-meaning') {
        var exId = target.getAttribute('data-ex');
        var mId = target.getAttribute('data-meaning');
        st.sec1.assignments[exId] = st.sec1.assignments[exId] || { set: '', meaning: '' };
        st.sec1.assignments[exId].meaning = mId;
        sec1CheckFeedback = null;
        S.save();
        renderApp();
      }
    });

    document.addEventListener('input', function (ev) {
      var target = ev.target;
      var st = S.get();
      if (target.id === 'sec2-freetext-input') {
        st.sec2.freetext = target.value;
        S.save();
      } else if (target.id === 'sec3-freetext-input') {
        st.sec3.freetext = target.value;
        S.save();
      } else if (target.getAttribute('data-action') === 'input-table-val') {
        var ctxKey = st.sec2.selectedContext;
        var xVal = target.getAttribute('data-x');
        if (ctxKey && xVal !== null) {
          st.sec2.tableInputs[ctxKey] = st.sec2.tableInputs[ctxKey] || {};
          st.sec2.tableInputs[ctxKey][xVal] = target.value;
          S.save();
        }
      }
    });

    // Scharfe Neuzeichnung aller Canvas-Elemente bei Fenster-/Tablet-Drehung oder iFrame-Resize
    var resizeTimer = null;
    global.addEventListener('resize', function () {
      if (resizeTimer) global.clearTimeout(resizeTimer);
      resizeTimer = global.setTimeout(function () {
        var st = S.get();
        if (st.activeView === 1) {
          redrawSection1Canvases(currentEulerAnimVal);
        } else if (st.activeView === 3) {
          redrawSection3Canvases();
        }
      }, 90);
    });
  }

  function init() {
    S.load();
    setupEventListeners();
    renderApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
