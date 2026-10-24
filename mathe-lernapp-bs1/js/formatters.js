/**
 * formatters.js
 * Modul für typografisch korrekte Zahlenformatierung & native HTML-Mathematik (Anti-LaTeX).
 * - Maximal 2 Nachkommastellen
 * - Deutsches Dezimalkomma (,)
 * - Echtes typografisches Minuszeichen (&minus; im DOM, − auf Canvas)
 * - Flexbox-Brüche (.math-fraction)
 */
(function (global) {
  'use strict';

  var MatheApp = global.MatheApp = global.MatheApp || {};

  var UNICODE_MINUS = '\u2212'; // −

  /**
   * Rundet eine Zahl auf maximal maxDecimals Nachkommastellen (Standard: 2)
   * und gibt Betrag sowie Vorzeichen getrennt zurück.
   */
  function normalizeNumber(value, maxDecimals, forceDecimals) {
    var decimals = typeof maxDecimals === 'number' ? maxDecimals : 2;
    if (decimals > 2) decimals = 2;

    var num = typeof value === 'number' ? value : parseGermanNumber(value);
    if (isNaN(num)) {
      return { valid: false, isNegative: false, formattedAbs: '' };
    }

    var factor = Math.pow(10, decimals);
    var rounded = Math.round(num * factor) / factor;
    // -0 abfangen
    if (rounded === 0) {
      rounded = 0;
    }

    var isNegative = rounded < 0;
    var absVal = Math.abs(rounded);

    var str;
    if (typeof forceDecimals === 'number') {
      var fd = Math.min(forceDecimals, 2);
      str = absVal.toFixed(fd);
    } else {
      // Bis zu 2 Nachkommastellen ohne unnötige Endnullen
      str = absVal.toFixed(decimals).replace(/\.?0+$/, '');
    }

    var germanAbs = str.replace('.', ',');
    return {
      valid: true,
      isNegative: isNegative,
      formattedAbs: germanAbs
    };
  }

  /**
   * Formatiert eine Zahl für das DOM mit &minus; und deutschem Komma.
   */
  function formatNumberHTML(value, unit, forceDecimals) {
    var norm = normalizeNumber(value, 2, forceDecimals);
    if (!norm.valid) return '';
    var prefix = norm.isNegative ? '&minus;' : '';
    var suffix = unit ? '&nbsp;' + unit : '';
    return prefix + norm.formattedAbs + suffix;
  }

  /**
   * Formatiert eine Zahl für Canvas-Beschriftungen mit echtem Unicode-Minus (−) und deutschem Komma.
   */
  function formatNumberCanvas(value, unit, forceDecimals) {
    var norm = normalizeNumber(value, 2, forceDecimals);
    if (!norm.valid) return '';
    var prefix = norm.isNegative ? UNICODE_MINUS : '';
    var suffix = unit ? ' ' + unit : '';
    return prefix + norm.formattedAbs + suffix;
  }

  /**
   * Parst eine Benutzereingabe (z. B. "-18,5", "−18,5", "28.5") fehlertolerant in eine JS-Zahl.
   * Prüft außerdem, ob der Nutzer einen englischen Punkt verwendet hat, um ggf. formativ hinzuweisen.
   */
  function parseGermanNumber(rawInput) {
    if (typeof rawInput === 'number') return rawInput;
    if (typeof rawInput !== 'string') return NaN;

    var cleaned = rawInput
      .trim()
      .replace(/\s+/g, '')
      .replace(/&minus;/gi, '-')
      .replace(/\u2212/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '-')
      // Einheiten am Ende tolerant ignorieren (z. B. °C, kW, h)
      .replace(/(°c|kw|uhr|std|h|stück|st)$/i, '')
      .replace(',', '.');

    if (cleaned === '' || cleaned === '-' || cleaned === '+') return NaN;
    if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return NaN;

    return parseFloat(cleaned);
  }

  /**
   * Prüft, ob die Roh-Eingabe einen Dezimalpunkt statt eines deutschen Kommas enthält.
   */
  function usedEnglishDecimalPoint(rawInput) {
    if (typeof rawInput !== 'string') return false;
    return /\d+\.\d+/.test(rawInput.trim());
  }

  /**
   * Erzeugt einen nativen HTML-Flexbox-Bruch ohne LaTeX.
   */
  function renderFractionHTML(numeratorHTML, denominatorHTML, isNegative) {
    var sign = isNegative ? '<span class="math-sign">&minus;</span>' : '';
    return (
      '<span class="math-expr">' +
      sign +
      '<span class="math-fraction" role="math">' +
      '<span class="math-fraction-num">' + numeratorHTML + '</span>' +
      '<span class="math-fraction-den">' + denominatorHTML + '</span>' +
      '</span>' +
      '</span>'
    );
  }

  /**
   * Escaped Benutzereingaben sicher für HTML-Ausgaben.
   */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  MatheApp.Formatters = {
    UNICODE_MINUS: UNICODE_MINUS,
    formatNumberHTML: formatNumberHTML,
    formatNumberCanvas: formatNumberCanvas,
    parseGermanNumber: parseGermanNumber,
    usedEnglishDecimalPoint: usedEnglishDecimalPoint,
    renderFractionHTML: renderFractionHTML,
    escapeHTML: escapeHTML
  };
})(window);
