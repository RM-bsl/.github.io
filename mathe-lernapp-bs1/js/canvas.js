/**
 * canvas.js
 * High-DPI Canvas-Visualisierungen (skaliert über window.devicePixelRatio).
 * Enthält:
 *  1. Euler-Mengendiagramm (Bereich 1)
 *  2. Animierter Zahlenstrahl (Bereich 1)
 *  3. Pfeildiagramme für Funktion vs. Relation (Bereich 3.1)
 *  4. Koordinatensysteme mit interaktivem Vertikalentest (Bereich 3.2)
 *
 * Alle negativen Zahlen nutzen das echte typografische Minuszeichen (−, \u2212)
 * und das deutsche Dezimalkomma (,).
 */
(function (global) {
  'use strict';

  var MatheApp = global.MatheApp = global.MatheApp || {};
  var F = MatheApp.Formatters;
  var D = MatheApp.Data;

  var FONT_SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

  var setAnimFrameId = null;
  var vertTestAnimFrameId = null;

  /**
   * Skaliert ein Canvas-Element scharf für Retina-/High-DPI-Displays.
   */
  function setupHighDPICanvas(canvas, logicalHeight) {
    if (!canvas) return null;
    var parent = canvas.parentElement;
    var rectWidth = parent ? parent.clientWidth : 600;
    var width = Math.max(260, Math.floor(rectWidth));
    var height = logicalHeight;
    var dpr = Math.max(1, global.devicePixelRatio || 1);

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx: ctx, width: width, height: height };
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawArrowHead(ctx, fromX, fromY, toX, toY, size, color) {
    var angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - size * Math.cos(angle - Math.PI / 6.5),
      toY - size * Math.sin(angle - Math.PI / 6.5)
    );
    ctx.lineTo(
      toX - size * Math.cos(angle + Math.PI / 6.5),
      toY - size * Math.sin(angle + Math.PI / 6.5)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 1A. EULER-MENGENDIAGRAMM (ℕ ⊂ ℕ₀ ⊂ ℤ ⊂ ℚ ⊂ ℝ)
  // =========================================================================
  function drawEulerDiagram(canvas, stageProgress) {
    var isCompact = global.innerWidth < 560;
    var targetH = isCompact ? 270 : 300;
    var env = setupHighDPICanvas(canvas, targetH);
    if (!env) return;

    var ctx = env.ctx;
    var w = env.width;
    var h = env.height;
    var sets = D.NUMBER_SETS;

    // Hintergrund dezent
    drawRoundedRect(ctx, 2, 2, w - 4, h - 4, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Von außen (R = Index 4) nach innen (N = Index 0) zeichnen,
    // damit die inneren Mengen sauber über den äußeren liegen.
    var maxRx = (w - 36) / 2;
    var maxRy = (h - 32) / 2;
    var minRx = Math.max(54, maxRx * 0.28);
    var minRy = Math.max(32, maxRy * 0.27);

    // Leicht nach links-unten versetztes Zentrum, damit rechts/oben Platz für Labels & Beispiele bleibt
    var baseCx = w * 0.34;
    var baseCy = h * 0.56;

    var ringSamples = [
      '1;  2;  12',
      '0',
      '\u221218;  \u22123',
      '\u22122,5;  0,75',
      '\u221A2;  \u03C0'
    ];

    // Speichere Ellipsen-Geometrie für Klick-Erkennung auf dem Canvas
    var hitRegions = [];

    for (var i = 4; i >= 0; i--) {
      var t = i / 4; // 0 (innen) .. 1 (außen)
      var rx = minRx + (maxRx - minRx) * t;
      var ry = minRy + (maxRy - minRy) * t;
      var cx = baseCx + (w * 0.5 - baseCx) * t;
      var cy = baseCy + (h * 0.5 - baseCy) * t;

      // Sichtbarkeitsfaktor aus stageProgress (0..4)
      var alpha = 0;
      if (stageProgress >= i) {
        alpha = 1;
      } else if (stageProgress > i - 1) {
        alpha = stageProgress - (i - 1);
      }

      var isFuture = alpha <= 0.02;
      var setObj = sets[i];

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

      if (isFuture) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.globalAlpha = Math.min(1, 0.25 + 0.75 * alpha);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.fillStyle = setObj.fillSoft;
        ctx.fill();

        var isHighlighted = Math.round(stageProgress) === i;
        ctx.lineWidth = isHighlighted ? 3 : 1.8;
        ctx.strokeStyle = setObj.color;
        ctx.stroke();

        // Mengen-Symbol + Beispiele rechts oben in der jeweiligen Schale positionieren
        var labelAngle = -0.36; // rechts-oben im Ring
        var innerRx = i === 0 ? 0 : minRx + (maxRx - minRx) * ((i - 1) / 4);
        var innerCx = i === 0 ? cx : baseCx + (w * 0.5 - baseCx) * ((i - 1) / 4);

        var labelX;
        var labelY;
        if (i === 0) {
          labelX = cx;
          labelY = cy;
        } else {
          var rightOuter = cx + rx * Math.cos(labelAngle);
          var rightInner = innerCx + innerRx * Math.cos(labelAngle);
          labelX = (rightOuter + rightInner) * 0.5;
          labelY = cy + ry * Math.sin(labelAngle) * 0.55;
        }

        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '700 ' + (isCompact ? '14px ' : '16px ') + FONT_SANS;
        ctx.fillStyle = setObj.color;
        ctx.fillText(setObj.symbolCanvas, labelX, labelY - (isCompact ? 7 : 9));

        ctx.font = '600 ' + (isCompact ? '11px ' : '12px ') + FONT_SANS;
        ctx.fillStyle = '#334155';
        ctx.fillText(ringSamples[i], labelX, labelY + (isCompact ? 9 : 10));
      }
      ctx.restore();

      hitRegions.unshift({ index: i, cx: cx, cy: cy, rx: rx, ry: ry });
    }

    canvas._eulerRegions = hitRegions;
  }

  /**
   * Ermittelt, auf welche Mengenschale im Euler-Diagramm geklickt wurde (von innen nach außen).
   */
  function hitTestEulerDiagram(canvas, clientX, clientY) {
    if (!canvas || !canvas._eulerRegions) return -1;
    var rect = canvas.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var regions = canvas._eulerRegions; // sortiert 0..4 (innen nach außen)
    for (var i = 0; i < regions.length; i++) {
      var r = regions[i];
      var normDist =
        Math.pow((x - r.cx) / r.rx, 2) + Math.pow((y - r.cy) / r.ry, 2);
      if (normDist <= 1) {
        return r.index;
      }
    }
    return -1;
  }

  // =========================================================================
  // 1B. ANIMIERTER ZAHLENSTRAHL (Ausbreitung ℕ → ℕ₀ → ℤ → ℚ → ℝ)
  // =========================================================================
  function drawNumberLine(canvas, stageProgress) {
    var isCompact = global.innerWidth < 560;
    var targetH = isCompact ? 175 : 190;
    var env = setupHighDPICanvas(canvas, targetH);
    if (!env) return;

    var ctx = env.ctx;
    var w = env.width;
    var h = env.height;
    var sets = D.NUMBER_SETS;

    drawRoundedRect(ctx, 2, 2, w - 4, h - 4, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    var padX = isCompact ? 28 : 44;
    var axisY = Math.round(h * 0.56);
    var minVal = -4.4;
    var maxVal = 4.4;

    function valToX(v) {
      return padX + ((v - minVal) / (maxVal - minVal)) * (w - 2 * padX);
    }

    // Basis-Gerade (blass im Hintergrund)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX - 10, axisY);
    ctx.lineTo(w - padX + 10, axisY);
    ctx.stroke();
    drawArrowHead(ctx, w - padX - 8, axisY, w - padX + 12, axisY, 8, '#94a3b8');
    if (stageProgress >= 1.2) {
      drawArrowHead(ctx, padX + 8, axisY, padX - 12, axisY, 8, '#94a3b8');
    }

    // Dezente Skalenstriche
    for (var tick = -4; tick <= 4; tick++) {
      var tx = valToX(tick);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, axisY - 6);
      ctx.lineTo(tx, axisY + 6);
      ctx.stroke();

      ctx.font = '500 ' + (isCompact ? '11px ' : '12px ') + FONT_SANS;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(F.formatNumberCanvas(tick), tx, axisY + 12);
    }

    // Stufe 4 (ℝ): Durchgehende lückenlose Zahlengerade (breitet sich von 0 nach außen aus)
    if (stageProgress > 3) {
      var rAlpha = Math.min(1, stageProgress - 3);
      var span = (w * 0.5 - (padX - 10)) * rAlpha;
      var center = valToX(0);

      ctx.save();
      ctx.strokeStyle = sets[4].color;
      ctx.lineWidth = 7;
      ctx.globalAlpha = 0.32 * rAlpha;
      ctx.beginPath();
      ctx.moveTo(center - span, axisY);
      ctx.lineTo(center + span, axisY);
      ctx.stroke();

      ctx.globalAlpha = rAlpha;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(center - span, axisY);
      ctx.lineTo(center + span, axisY);
      ctx.stroke();
      if (rAlpha > 0.85) {
        drawArrowHead(ctx, w - padX - 4, axisY, w - padX + 13, axisY, 9, sets[4].color);
        drawArrowHead(ctx, padX + 4, axisY, padX - 13, axisY, 9, sets[4].color);
      }
      ctx.restore();
    }

    // Stufe 3 (ℚ): Dichte rationale Zwischenpunkte
    if (stageProgress > 2) {
      var qAlpha = Math.min(1, stageProgress - 2);
      ctx.save();
      ctx.globalAlpha = qAlpha;
      ctx.fillStyle = sets[3].color;

      for (var q = -4; q < 4; q++) {
        var subOffsets = [0.25, 0.5, 0.75];
        for (var s = 0; s < subOffsets.length; s++) {
          var qVal = q + subOffsets[s];
          var qx = valToX(qVal);
          ctx.beginPath();
          ctx.arc(qx, axisY, subOffsets[s] === 0.5 ? 3.4 : 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Hervorgehobene Bruch-Beispiele (-2,5 und 0,75)
      var qHighlights = [
        { val: -2.5, label: F.formatNumberCanvas(-2.5) },
        { val: 0.75, label: F.formatNumberCanvas(0.75) }
      ];
      qHighlights.forEach(function (item) {
        var hx = valToX(item.val);
        ctx.beginPath();
        ctx.arc(hx, axisY, 4.8, 0, Math.PI * 2);
        ctx.fillStyle = sets[3].color;
        ctx.fill();

        ctx.font = '700 ' + (isCompact ? '10px ' : '11px ') + FONT_SANS;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(item.label, hx, axisY - 12);
      });

      // Bei ℚ (aber noch vor ℝ) offene Lücken bei √2 und π andeuten!
      if (stageProgress < 3.6) {
        var gapAlpha = qAlpha * (1 - Math.max(0, (stageProgress - 3) / 0.6));
        ctx.globalAlpha = gapAlpha;
        [
          { val: Math.SQRT2, label: '\u221A2?' },
          { val: Math.PI, label: '\u03C0?' }
        ].forEach(function (g) {
          var gx = valToX(g.val);
          ctx.beginPath();
          ctx.arc(gx, axisY, 4.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = '#d97706';
          ctx.stroke();

          ctx.font = '600 10px ' + FONT_SANS;
          ctx.fillStyle = '#b45309';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(g.label, gx, axisY - 25);
        });
      }
      ctx.restore();
    }

    // Stufe 2 (ℤ): Negative ganze Zahlen (-1 bis -4 + Hinweis auf -18 links)
    if (stageProgress > 1) {
      var zAlpha = Math.min(1, stageProgress - 1);
      ctx.save();
      ctx.globalAlpha = zAlpha;
      for (var z = -1; z >= -4; z--) {
        var zx = valToX(z);
        ctx.beginPath();
        ctx.arc(zx, axisY, 5.8, 0, Math.PI * 2);
        ctx.fillStyle = sets[2].color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.font = '700 ' + (isCompact ? '11px ' : '12px ') + FONT_SANS;
        ctx.fillStyle = sets[2].color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(F.formatNumberCanvas(z), zx, axisY + 12);
      }

      // Kleines Hinweisschild links oben: ← −18 °C liegt weiter links in ℤ
      var badgeW = isCompact ? 96 : 112;
      drawRoundedRect(ctx, 12, 12, badgeW, 24, 12);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
      ctx.fill();
      ctx.font = '700 ' + (isCompact ? '10.5px ' : '11.5px ') + FONT_SANS;
      ctx.fillStyle = sets[2].color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2190 ' + F.formatNumberCanvas(-18, '°C') + ' (\u2124)', 12 + badgeW / 2, 24);
      ctx.restore();
    }

    // Stufe 1 (ℕ₀): Die Null kommt neu hinzu
    if (stageProgress > 0) {
      var n0Alpha = Math.min(1, stageProgress);
      var x0 = valToX(0);
      ctx.save();
      ctx.globalAlpha = n0Alpha;
      ctx.beginPath();
      ctx.arc(x0, axisY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = sets[1].color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '700 ' + (isCompact ? '12px ' : '13px ') + FONT_SANS;
      ctx.fillStyle = sets[1].color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('0', x0, axisY + 12);
      ctx.restore();
    }

    // Stufe 0 (ℕ): Natürliche Zahlen 1, 2, 3, 4 (immer sichtbar)
    ctx.save();
    for (var n = 1; n <= 4; n++) {
      var nx = valToX(n);
      ctx.beginPath();
      ctx.arc(nx, axisY, 6, 0, Math.PI * 2);
      ctx.fillStyle = sets[0].color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '700 ' + (isCompact ? '11.5px ' : '12.5px ') + FONT_SANS;
      ctx.fillStyle = sets[0].color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(F.formatNumberCanvas(n), nx, axisY + 12);
    }
    ctx.restore();

    // Stufe 4 (ℝ): Irrationale Marker √2 ≈ 1,41 und π ≈ 3,14 fest eintragen
    if (stageProgress > 3.2) {
      var irAlpha = Math.min(1, (stageProgress - 3.2) / 0.8);
      ctx.save();
      ctx.globalAlpha = irAlpha;
      [
        { val: Math.SQRT2, text: '\u221A2 \u2248 ' + F.formatNumberCanvas(1.41) },
        { val: Math.PI, text: '\u03C0 \u2248 ' + F.formatNumberCanvas(3.14) }
      ].forEach(function (ir) {
        var ix = valToX(ir.val);
        ctx.strokeStyle = sets[4].color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ix, axisY - 6);
        ctx.lineTo(ix, axisY - 26);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ix, axisY, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = sets[4].color;
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.font = '700 ' + (isCompact ? '10.5px ' : '11.5px ') + FONT_SANS;
        ctx.fillStyle = '#b45309';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(ir.text, ix, axisY - 28);
      });
      ctx.restore();
    }

    // Aktive Mengen-Überschrift oben rechts im Zahlenstrahl
    var currentIndex = Math.min(4, Math.max(0, Math.round(stageProgress)));
    var activeSet = sets[currentIndex];
    ctx.font = '700 ' + (isCompact ? '12px ' : '13px ') + FONT_SANS;
    ctx.fillStyle = activeSet.color;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Aktive Stufe: ' + activeSet.symbolCanvas + ' (' + activeSet.name + ')',
      w - 14,
      24
    );
  }

  /**
   * Animiert weich von einem Startwert zu einem Ziel-Index (z. B. Komplettdurchlauf 0 -> 4).
   */
  function animateSetStage(fromVal, toVal, durationMs, onProgress, onComplete) {
    if (setAnimFrameId) {
      global.cancelAnimationFrame(setAnimFrameId);
      setAnimFrameId = null;
    }
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var t = Math.min(1, elapsed / durationMs);
      // Sanftes Ease-In-Out
      var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var current = fromVal + (toVal - fromVal) * eased;
      onProgress(current);
      if (t < 1) {
        setAnimFrameId = global.requestAnimationFrame(step);
      } else {
        setAnimFrameId = null;
        if (onComplete) onComplete();
      }
    }
    setAnimFrameId = global.requestAnimationFrame(step);
  }

  // =========================================================================
  // 3A. PFEILDIAGRAMM (Bereich 3, Schritt 3.1: Funktion vs. Relation)
  // =========================================================================
  function drawArrowDiagram(canvas, pairs, xTitle, yTitle, xUnit, yUnit) {
    var isCompact = global.innerWidth < 520;
    var targetH = isCompact ? 295 : 310;
    var env = setupHighDPICanvas(canvas, targetH);
    if (!env) return;

    var ctx = env.ctx;
    var w = env.width;
    var h = env.height;

    drawRoundedRect(ctx, 2, 2, w - 4, h - 4, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Eindeutige sortierte x- und y-Werte ermitteln
    var xValues = [];
    var yValues = [];
    var outCountByX = {};

    pairs.forEach(function (p) {
      if (xValues.indexOf(p.x) === -1) xValues.push(p.x);
      if (yValues.indexOf(p.y) === -1) yValues.push(p.y);
      outCountByX[p.x] = (outCountByX[p.x] || 0) + 1;
    });

    xValues.sort(function (a, b) { return a - b; });
    yValues.sort(function (a, b) { return a - b; });

    var headerH = 38;
    var ovalTop = headerH + 8;
    var ovalH = h - ovalTop - 14;
    var colW = Math.min(126, Math.max(88, Math.floor(w * 0.28)));
    var leftColX = isCompact ? 14 : 24;
    var rightColX = w - colW - (isCompact ? 14 : 24);

    // Spaltenüberschriften
    ctx.font = '700 ' + (isCompact ? '11.5px ' : '13px ') + FONT_SANS;
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(xTitle, leftColX + colW / 2, 21);
    ctx.fillText(yTitle, rightColX + colW / 2, 21);

    // Mengen-Container links & rechts
    drawRoundedRect(ctx, leftColX, ovalTop, colW, ovalH, 24);
    ctx.fillStyle = '#eff6ff';
    ctx.fill();
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawRoundedRect(ctx, rightColX, ovalTop, colW, ovalH, 24);
    ctx.fillStyle = '#f5f3ff';
    ctx.fill();
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Knotenpositionen berechnen
    var xPosMap = {};
    var yPosMap = {};
    var pillH = 26;
    var pillW = colW - 20;

    xValues.forEach(function (xv, idx) {
      var cy = ovalTop + ((idx + 0.5) / xValues.length) * ovalH;
      xPosMap[xv] = { x: leftColX + colW / 2, y: cy };
    });

    yValues.forEach(function (yv, idx) {
      var cy = ovalTop + ((idx + 0.5) / yValues.length) * ovalH;
      yPosMap[yv] = { x: rightColX + colW / 2, y: cy };
    });

    // Zuerst Pfeile zeichnen
    pairs.forEach(function (pair) {
      var start = xPosMap[pair.x];
      var end = yPosMap[pair.y];
      var isMulti = outCountByX[pair.x] > 1;

      var sx = start.x + pillW / 2 + 2;
      var sy = start.y;
      var ex = end.x - pillW / 2 - 4;
      var ey = end.y;

      var arrowColor = isMulti ? '#dc2626' : '#2563eb';
      ctx.save();
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = isMulti ? 2.6 : 1.9;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      var cp1x = sx + (ex - sx) * 0.42;
      var cp2x = sx + (ex - sx) * 0.58;
      ctx.bezierCurveTo(cp1x, sy, cp2x, ey, ex, ey);
      ctx.stroke();

      // Tangentenwinkel am Zielpunkt für saubere Pfeilspitze
      drawArrowHead(ctx, cp2x, ey, ex, ey, isMulti ? 9 : 8, arrowColor);
      ctx.restore();
    });

    // Danach Knoten-Pills links (Ausgangswerte x) zeichnen
    xValues.forEach(function (xv) {
      var pos = xPosMap[xv];
      var count = outCountByX[xv];
      var isMulti = count > 1;

      drawRoundedRect(ctx, pos.x - pillW / 2, pos.y - pillH / 2, pillW, pillH, 13);
      ctx.fillStyle = isMulti ? '#fef2f2' : '#ffffff';
      ctx.fill();
      ctx.lineWidth = isMulti ? 2.2 : 1.4;
      ctx.strokeStyle = isMulti ? '#dc2626' : '#3b82f6';
      ctx.stroke();

      ctx.font = '700 ' + (isCompact ? '11px ' : '12px ') + FONT_SANS;
      ctx.fillStyle = isMulti ? '#991b1b' : '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(F.formatNumberCanvas(xv, xUnit), pos.x, pos.y);
    });

    // Knoten-Pills rechts (Zielwerte y) zeichnen
    yValues.forEach(function (yv) {
      var pos = yPosMap[yv];
      drawRoundedRect(ctx, pos.x - pillW / 2, pos.y - pillH / 2, pillW, pillH, 13);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#8b5cf6';
      ctx.stroke();

      ctx.font = '700 ' + (isCompact ? '11px ' : '12px ') + FONT_SANS;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(F.formatNumberCanvas(yv, yUnit), pos.x, pos.y);
    });
  }

  // =========================================================================
  // 3B. KOORDINATENSYSTEM MIT VERTIKALENTEST (Bereich 3, Schritt 3.2)
  // =========================================================================
  function drawVerticalTestChart(canvas, pairs, allPairsForScale, testXVal, xLabel, yLabel, xUnit, yUnit) {
    var isCompact = global.innerWidth < 520;
    var targetH = isCompact ? 265 : 285;
    var env = setupHighDPICanvas(canvas, targetH);
    if (!env) return;

    var ctx = env.ctx;
    var w = env.width;
    var h = env.height;

    drawRoundedRect(ctx, 2, 2, w - 4, h - 4, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    var padLeft = isCompact ? 50 : 58;
    var padRight = 22;
    var padTop = 44;
    var padBottom = 42;
    var plotW = w - padLeft - padRight;
    var plotH = h - padTop - padBottom;

    var refPairs = allPairsForScale && allPairsForScale.length ? allPairsForScale : pairs;
    var xs = refPairs.map(function (p) { return p.x; });
    var ys = refPairs.map(function (p) { return p.y; });

    var uniqueX = [];
    xs.forEach(function (v) {
      if (uniqueX.indexOf(v) === -1) uniqueX.push(v);
    });
    uniqueX.sort(function (a, b) { return a - b; });

    var minX = Math.min.apply(null, uniqueX);
    var maxX = Math.max.apply(null, uniqueX);
    var xSpan = Math.max(1, maxX - minX);
    var xDomainMin = minX - xSpan * 0.1;
    var xDomainMax = maxX + xSpan * 0.1;

    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);
    var ySpan = Math.max(2, maxY - minY);
    var yDomainMin = Math.floor((minY - ySpan * 0.18) * 2) / 2;
    var yDomainMax = Math.ceil((maxY + ySpan * 0.18) * 2) / 2;

    function mapX(xv) {
      return padLeft + ((xv - xDomainMin) / (xDomainMax - xDomainMin)) * plotW;
    }

    function mapY(yv) {
      return padTop + plotH - ((yv - yDomainMin) / (yDomainMax - yDomainMin)) * plotH;
    }

    // Waagrechte Hilfslinien + y-Achsen-Beschriftung
    var ySteps = 4;
    ctx.font = '500 ' + (isCompact ? '10.5px ' : '11.5px ') + FONT_SANS;
    for (var s = 0; s <= ySteps; s++) {
      var yVal = yDomainMin + ((yDomainMax - yDomainMin) * s) / ySteps;
      var py = mapY(yVal);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, py);
      ctx.lineTo(padLeft + plotW, py);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(F.formatNumberCanvas(yVal), padLeft - 7, py);
    }

    // Senkrechte Hilfslinien an den x-Messpunkten + x-Achsen-Beschriftung
    uniqueX.forEach(function (xv) {
      var px = mapX(xv);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, padTop);
      ctx.lineTo(px, padTop + plotH);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '600 ' + (isCompact ? '10.5px ' : '11.5px ') + FONT_SANS;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(F.formatNumberCanvas(xv), px, padTop + plotH + 7);
    });

    // Koordinatenachsen mit Pfeilen
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop - 6);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW + 6, padTop + plotH);
    ctx.stroke();
    drawArrowHead(ctx, padLeft, padTop + 4, padLeft, padTop - 8, 7, '#334155');
    drawArrowHead(ctx, padLeft + plotW - 4, padTop + plotH, padLeft + plotW + 8, padTop + plotH, 7, '#334155');

    // Achsentitel
    ctx.font = '700 11px ' + FONT_SANS;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(yLabel + ' (' + yUnit + ')', 10, padTop - 12);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(xLabel + ' (' + xUnit + ')', w - 12, h - 4);

    // Schnittpunkte mit der senkrechten Prüfgeraden bei testXVal ermitteln
    var hits = pairs.filter(function (p) {
      return Math.abs(p.x - testXVal) < 0.001;
    });
    var isConflict = hits.length > 1;
    var lineColor = isConflict ? '#dc2626' : '#16a34a';
    var testLineX = mapX(testXVal);

    // Senkrechte Prüfgerade (Vertikalentest)
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 10;
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.moveTo(testLineX, padTop - 4);
    ctx.lineTo(testLineX, padTop + plotH);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(testLineX, padTop - 4);
    ctx.lineTo(testLineX, padTop + plotH);
    ctx.stroke();
    ctx.restore();

    // Alle Einzeldaten-Punkte (x | y) zeichnen
    pairs.forEach(function (p) {
      var px = mapX(p.x);
      var py = mapY(p.y);
      var isHit = Math.abs(p.x - testXVal) < 0.001;

      if (isHit) {
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = isConflict ? 'rgba(220, 38, 38, 0.22)' : 'rgba(22, 163, 74, 0.22)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, isHit ? 6.2 : 4.8, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? lineColor : '#1d4ed8';
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    // Status-Badge oben rechts im Diagramm
    var statusText = isConflict
      ? 'x = ' + F.formatNumberCanvas(testXVal) + ': ' + hits.length + ' Punkte senkrecht übereinander!'
      : 'x = ' + F.formatNumberCanvas(testXVal) + ': ' + hits.length + ' Schnittpunkt (eindeutig)';

    ctx.font = '700 ' + (isCompact ? '10.5px ' : '11.5px ') + FONT_SANS;
    var textW = ctx.measureText(statusText).width;
    var badgeW = textW + 20;
    var badgeX = w - badgeW - 10;
    var badgeY = 8;

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, 24, 12);
    ctx.fillStyle = isConflict ? '#fee2e2' : '#dcfce7';
    ctx.fill();
    ctx.fillStyle = isConflict ? '#991b1b' : '#166534';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(statusText, badgeX + badgeW / 2, badgeY + 12);
  }

  /**
   * Spielt den Vertikalentest schrittweise über alle x-Werte der Wertetabelle ab.
   */
  function animateVerticalTestSteps(totalSteps, onStepIndex, onDone) {
    if (vertTestAnimFrameId) {
      global.clearTimeout(vertTestAnimFrameId);
      vertTestAnimFrameId = null;
    }
    var idx = 0;
    function next() {
      onStepIndex(idx);
      idx++;
      if (idx < totalSteps) {
        vertTestAnimFrameId = global.setTimeout(next, 650);
      } else {
        vertTestAnimFrameId = null;
        if (onDone) onDone();
      }
    }
    next();
  }

  MatheApp.Canvas = {
    drawEulerDiagram: drawEulerDiagram,
    hitTestEulerDiagram: hitTestEulerDiagram,
    drawNumberLine: drawNumberLine,
    animateSetStage: animateSetStage,
    drawArrowDiagram: drawArrowDiagram,
    drawVerticalTestChart: drawVerticalTestChart,
    animateVerticalTestSteps: animateVerticalTestSteps
  };
})(window);
