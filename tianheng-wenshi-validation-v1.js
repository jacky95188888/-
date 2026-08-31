'use strict';

(function attachWenshiValidation(root) {
  const VERSION = '1.0.0';
  const OUTCOMES = new Set(['positive', 'negative', 'mixed', 'unresolved']);
  const CONFIDENCE_LEVELS = new Set(['low', 'medium', 'high']);
  const MODES = new Set(['retrospective_blind', 'holdout', 'prospective']);

  function isoTime(value, field) {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) throw new Error(`${field} 必須是有效 ISO 時間`);
    return time;
  }

  function assertText(value, field) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} 不可空白`);
  }

  function normalizeWindow(window) {
    if (window == null) return null;
    const start = isoTime(window.start, 'timingWindow.start');
    const end = isoTime(window.end, 'timingWindow.end');
    if (start > end) throw new Error('timingWindow.start 不可晚於 end');
    return { start: new Date(start).toISOString(), end: new Date(end).toISOString() };
  }

  function validateCase(input) {
    if (!input || typeof input !== 'object') throw new Error('驗證案例必須是物件');
    assertText(input.caseId, 'caseId');
    assertText(input.mode, 'mode');
    assertText(input.method, 'method');
    assertText(input.methodVersion, 'methodVersion');
    assertText(input.category, 'category');
    assertText(input.question, 'question');

    if (!MODES.has(input.mode)) throw new Error(`mode 無效：${input.mode}`);
    if (!OUTCOMES.has(input.prediction?.outcome)) throw new Error('prediction.outcome 無效');
    if (!OUTCOMES.has(input.actual?.outcome)) throw new Error('actual.outcome 無效');
    if (!CONFIDENCE_LEVELS.has(input.prediction?.confidence)) throw new Error('prediction.confidence 無效');

    const askedAt = isoTime(input.askedAt, 'askedAt');
    const predictedAt = isoTime(input.prediction.createdAt, 'prediction.createdAt');
    const outcomeKnownAt = isoTime(input.actual.knownAt, 'actual.knownAt');
    if (predictedAt < askedAt) throw new Error('預測時間不可早於提問時間');
    let validationIntegrity;
    if (input.mode === 'retrospective_blind') {
      const protocol = input.blindProtocol;
      if (!protocol || protocol.outcomeSealed !== true || protocol.operatorHadOutcomeAccess !== false) {
        throw new Error('歷史盲測必須證明結果已封存且操作者無答案權限');
      }
      const caseFrozenAt = isoTime(protocol.caseFrozenAt, 'blindProtocol.caseFrozenAt');
      const outcomeRevealedAt = isoTime(protocol.outcomeRevealedAt, 'blindProtocol.outcomeRevealedAt');
      if (caseFrozenAt > predictedAt) throw new Error('歷史盲測案例必須在預測前凍結');
      if (outcomeRevealedAt <= predictedAt) throw new Error('資料洩漏：歷史盲測必須在預測鎖定後才揭盲');
      validationIntegrity = 'retrospective_blind_protocol_passed';
    } else {
      if (predictedAt >= outcomeKnownAt) throw new Error('資料洩漏：前瞻／保留測試的預測必須早於結果揭曉');
      validationIntegrity = 'prediction_precedes_outcome';
    }

    const probability = Number(input.prediction.probability);
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
      throw new Error('prediction.probability 必須介於 0 與 1');
    }

    const evidence = input.prediction.evidence;
    if (!evidence || !Array.isArray(evidence.support) || !Array.isArray(evidence.resistance)) {
      throw new Error('prediction.evidence 必須分開保存 support 與 resistance');
    }
    if (!Array.isArray(input.prediction.actions) || !Array.isArray(input.prediction.avoid)) {
      throw new Error('prediction.actions 與 avoid 必須為陣列');
    }

    const predictionWindow = normalizeWindow(input.prediction.timingWindow);
    const actualWindow = normalizeWindow(input.actual.eventWindow);

    return {
      ...input,
      askedAt: new Date(askedAt).toISOString(),
      prediction: { ...input.prediction, probability, timingWindow: predictionWindow },
      actual: { ...input.actual, knownAt: new Date(outcomeKnownAt).toISOString(), eventWindow: actualWindow },
      validationIntegrity
    };
  }

  function isResolved(outcome) {
    return outcome !== 'unresolved';
  }

  function directionHit(predicted, actual) {
    if (!isResolved(predicted) || !isResolved(actual)) return null;
    return predicted === actual;
  }

  function timingHit(predictedWindow, actualWindow) {
    if (!predictedWindow || !actualWindow) return null;
    return Date.parse(predictedWindow.start) <= Date.parse(actualWindow.end) &&
      Date.parse(actualWindow.start) <= Date.parse(predictedWindow.end);
  }

  function actualBinary(outcome) {
    if (outcome === 'positive') return 1;
    if (outcome === 'negative') return 0;
    return null;
  }

  function scoreCase(input) {
    const item = validateCase(input);
    const binary = actualBinary(item.actual.outcome);
    const direction = directionHit(item.prediction.outcome, item.actual.outcome);
    const timing = timingHit(item.prediction.timingWindow, item.actual.eventWindow);
    return {
      caseId: item.caseId,
      mode: item.mode,
      directionHit: direction,
      timingHit: timing,
      brierScore: binary == null ? null : Math.pow(item.prediction.probability - binary, 2),
      abstained: item.prediction.outcome === 'unresolved',
      evidenceComplete: item.prediction.evidence.support.length > 0 &&
        item.prediction.evidence.resistance.length > 0,
      leakageCheck: item.validationIntegrity
    };
  }

  function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  function summarize(inputs) {
    if (!Array.isArray(inputs) || inputs.length === 0) throw new Error('至少需要一筆驗證案例');
    const ids = new Set();
    const results = inputs.map(input => {
      if (ids.has(input.caseId)) throw new Error(`caseId 重複：${input.caseId}`);
      ids.add(input.caseId);
      return scoreCase(input);
    });
    const resolvedDirections = results.filter(x => x.directionHit !== null);
    const timed = results.filter(x => x.timingHit !== null);
    const briers = results.map(x => x.brierScore).filter(x => x !== null);
    return {
      version: VERSION,
      sampleSize: results.length,
      resolvedSampleSize: resolvedDirections.length,
      coverage: resolvedDirections.length / results.length,
      directionAccuracy: mean(resolvedDirections.map(x => Number(x.directionHit))),
      timingAccuracy: mean(timed.map(x => Number(x.timingHit))),
      brierScore: mean(briers),
      evidenceCompleteness: mean(results.map(x => Number(x.evidenceComplete))),
      byMode: Array.from(MODES).reduce((acc, mode) => {
        const subset = inputs.filter(x => x.mode === mode);
        if (subset.length) acc[mode] = summarizeSingleMode(subset);
        return acc;
      }, {}),
      results
    };
  }

  function summarizeSingleMode(inputs) {
    const results = inputs.map(scoreCase);
    const resolved = results.filter(x => x.directionHit !== null);
    return {
      sampleSize: results.length,
      coverage: resolved.length / results.length,
      directionAccuracy: mean(resolved.map(x => Number(x.directionHit)))
    };
  }

  function blindView(input) {
    const item = validateCase(input);
    return {
      caseId: item.caseId,
      mode: item.mode,
      method: item.method,
      methodVersion: item.methodVersion,
      category: item.category,
      question: item.question,
      askedAt: item.askedAt,
      timezone: item.timezone,
      castingInput: item.castingInput,
      actual: { sealed: true }
    };
  }

  const api = {
    version: VERSION,
    legacyOverride: false,
    validateCase,
    scoreCase,
    summarize,
    blindView
  };

  root.TianhengWenshiValidation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
