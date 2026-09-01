'use strict';

(function attachMeihuaValidation(root) {
  const VERSION = '1.0.0';
  const OUTCOMES = new Set(['positive','negative','mixed','unresolved']);
  const MODES = new Set(['retrospective_blind','holdout','prospective']);

  function text(value, label) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} 不可空白`);
  }
  function time(value, label) {
    const result = Date.parse(value);
    if (!Number.isFinite(result)) throw new Error(`${label} 必須是有效時間`);
    return result;
  }
  function windowValue(value, label) {
    if (value == null) return null;
    const start = time(value.start, `${label}.start`);
    const end = time(value.end, `${label}.end`);
    if (start > end) throw new Error(`${label}.start 不可晚於 end`);
    return { start: new Date(start).toISOString(), end: new Date(end).toISOString() };
  }

  function validateCase(input) {
    if (!input || typeof input !== 'object') throw new Error('驗證案例必須是物件');
    ['caseId','mode','method','methodVersion','category','question','timezone'].forEach(key => text(input[key], key));
    if (!MODES.has(input.mode)) throw new Error(`mode 無效：${input.mode}`);
    if (!OUTCOMES.has(input.prediction && input.prediction.outcome)) throw new Error('prediction.outcome 無效');
    if (!OUTCOMES.has(input.actual && input.actual.outcome)) throw new Error('actual.outcome 無效');
    const askedAt = time(input.askedAt, 'askedAt');
    const createdAt = time(input.prediction.createdAt, 'prediction.createdAt');
    const knownAt = time(input.actual.knownAt, 'actual.knownAt');
    if (createdAt < askedAt) throw new Error('預測時間不可早於提問時間');
    let integrity;
    if (input.mode === 'retrospective_blind') {
      const p = input.blindProtocol;
      if (!p || p.outcomeSealed !== true || p.operatorHadOutcomeAccess !== false) throw new Error('歷史盲測必須證明結果已封存且操作者無答案權限');
      if (time(p.caseFrozenAt, 'blindProtocol.caseFrozenAt') > createdAt) throw new Error('歷史盲測案例必須在預測前凍結');
      if (time(p.outcomeRevealedAt, 'blindProtocol.outcomeRevealedAt') <= createdAt) throw new Error('資料洩漏：揭盲必須晚於預測鎖定');
      integrity = 'retrospective_blind_protocol_passed';
    } else {
      if (createdAt >= knownAt) throw new Error('資料洩漏：前瞻／保留預測必須早於結果揭曉');
      integrity = 'prediction_precedes_outcome';
    }
    const probability = Number(input.prediction.probability);
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new Error('prediction.probability 必須介於 0～1');
    const evidence = input.prediction.evidence;
    if (!evidence || !Array.isArray(evidence.support) || !Array.isArray(evidence.resistance)) throw new Error('支持與阻力證據必須分開保存');
    if (!Array.isArray(input.prediction.actions) || !Array.isArray(input.prediction.avoid)) throw new Error('actions 與 avoid 必須是陣列');
    return {
      ...input,
      askedAt: new Date(askedAt).toISOString(),
      prediction: { ...input.prediction, probability, timingWindow: windowValue(input.prediction.timingWindow, 'prediction.timingWindow') },
      actual: { ...input.actual, knownAt: new Date(knownAt).toISOString(), eventWindow: windowValue(input.actual.eventWindow, 'actual.eventWindow') },
      validationIntegrity: integrity
    };
  }

  function overlap(a, b) {
    if (!a || !b) return null;
    return Date.parse(a.start) <= Date.parse(b.end) && Date.parse(b.start) <= Date.parse(a.end);
  }
  function binary(outcome) {
    if (outcome === 'positive') return 1;
    if (outcome === 'negative') return 0;
    return null;
  }
  function scoreCase(input) {
    const item = validateCase(input);
    const resolved = item.prediction.outcome !== 'unresolved' && item.actual.outcome !== 'unresolved';
    const actualBinary = binary(item.actual.outcome);
    return {
      caseId: item.caseId,
      mode: item.mode,
      directionHit: resolved ? item.prediction.outcome === item.actual.outcome : null,
      timingHit: overlap(item.prediction.timingWindow, item.actual.eventWindow),
      brierScore: actualBinary == null ? null : Math.pow(item.prediction.probability - actualBinary, 2),
      abstained: item.prediction.outcome === 'unresolved',
      evidenceComplete: item.prediction.evidence.support.length > 0 && item.prediction.evidence.resistance.length > 0,
      leakageCheck: item.validationIntegrity
    };
  }
  function mean(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null; }
  function summarize(inputs) {
    if (!Array.isArray(inputs) || !inputs.length) throw new Error('至少需要一筆驗證案例');
    const ids = new Set();
    const results = inputs.map(item => {
      if (ids.has(item.caseId)) throw new Error(`caseId 重複：${item.caseId}`);
      ids.add(item.caseId);
      return scoreCase(item);
    });
    const resolved = results.filter(x => x.directionHit !== null);
    const timed = results.filter(x => x.timingHit !== null);
    const briers = results.filter(x => x.brierScore !== null);
    return {
      version: VERSION,
      sampleSize: results.length,
      resolvedSampleSize: resolved.length,
      coverage: resolved.length / results.length,
      directionAccuracy: mean(resolved.map(x => Number(x.directionHit))),
      timingAccuracy: mean(timed.map(x => Number(x.timingHit))),
      brierScore: mean(briers.map(x => x.brierScore)),
      evidenceCompleteness: mean(results.map(x => Number(x.evidenceComplete))),
      results
    };
  }

  const api = { version: VERSION, legacyOverride: false, validateCase, scoreCase, summarize };
  root.TianhengMeihuaValidation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

