/**
 * state.js
 * Verwaltet und speichert den gesamten Lernstand dauerhaft im localStorage.
 * Enthält einen speichersicheren Fallback (z. B. für restriktive iFrame-Umgebungen).
 */
(function (global) {
  'use strict';

  var MatheApp = global.MatheApp = global.MatheApp || {};
  var STORAGE_KEY = 'antigravity_bs1_mathe_lernapp_state_v1';
  var memoryFallback = null;

  function createDefaultState() {
    return {
      activeView: 'home', // 'home' | 1 | 2 | 3
      completed: {
        1: false,
        2: false,
        3: false
      },
      merkblattOpen: {
        1: false,
        2: false,
        3: false
      },
      sec1: {
        activeSetIndex: 0, // 0: N, 1: N0, 2: Z, 3: Q, 4: R
        pairGroup: 0, // 0 -> Beispielpaar 1 (-18 °C & pi), 1 -> Beispielpaar 2 (sqrt(2) & 3/4)
        assignments: {
          ex_minus18: { set: '', meaning: '' },
          ex_pi: { set: '', meaning: '' },
          ex_sqrt2: { set: '', meaning: '' },
          ex_three_quarter: { set: '', meaning: '' }
        },
        step1_1Solved: false,
        activeSymbolId: 'braces',
        visitedSymbols: ['braces'],
        miniChecks: {
          nc1: '',
          nc2: '',
          nc3: ''
        },
        step1_2Solved: false
      },
      sec2: {
        selectedContext: null, // 'kuehlhaus' | 'festival' | 'stanzmaschine' | null
        freetext: '',
        freetextSolved: false,
        freetextFeedback: null,
        tableInputs: {
          kuehlhaus: {},
          festival: {},
          stanzmaschine: {}
        },
        solvedContexts: {
          kuehlhaus: false,
          festival: false,
          stanzmaschine: false
        },
        lastSolvedContext: null,
        step2_2Solved: false
      },
      sec3: {
        variant1Revealed: false,
        variant2Revealed: false,
        freetext: '',
        freetextSolved: false,
        freetextFeedback: null,
        verticalTestXIndex: 0,
        inspectedMultiX: false,
        step3_2Solved: false
      }
    };
  }

  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (key) {
      var srcVal = source[key];
      var tgtVal = target[key];
      if (Array.isArray(srcVal)) {
        target[key] = srcVal.slice();
      } else if (srcVal && typeof srcVal === 'object' && tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)) {
        deepMerge(tgtVal, srcVal);
      } else if (srcVal !== undefined) {
        target[key] = srcVal;
      }
    });
    return target;
  }

  var currentState = createDefaultState();

  function load() {
    var base = createDefaultState();
    try {
      var raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : memoryFallback;
      if (raw) {
        var parsed = JSON.parse(raw);
        deepMerge(base, parsed);
      }
    } catch (err) {
      if (memoryFallback) {
        try {
          deepMerge(base, JSON.parse(memoryFallback));
        } catch (e2) {
          // Standardzustand nutzen
        }
      }
    }
    // Sicherheitsprüfung: Gesperrte Bereiche dürfen nicht als activeView aktiv sein
    if (base.activeView === 2 && !base.completed[1]) {
      base.activeView = 'home';
    }
    if (base.activeView === 3 && !base.completed[2]) {
      base.activeView = 'home';
    }
    currentState = base;
    return currentState;
  }

  function save() {
    var serialized = JSON.stringify(currentState);
    memoryFallback = serialized;
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, serialized);
      }
    } catch (err) {
      // Speicher im RAM-Fallback gehalten
    }
  }

  function reset() {
    currentState = createDefaultState();
    memoryFallback = null;
    try {
      if (global.localStorage) {
        global.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      // Ignorieren
    }
    return currentState;
  }

  function get() {
    return currentState;
  }

  MatheApp.State = {
    load: load,
    save: save,
    reset: reset,
    get: get
  };
})(window);
