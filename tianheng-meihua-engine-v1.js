'use strict';

(function attachMeihuaEngine(root) {
  const Judgment = root.TianhengMeihuaJudgment || (typeof require === 'function' ? require('./tianheng-meihua-judgment-v1.js') : null);
  const Validation = root.TianhengMeihuaValidation || (typeof require === 'function' ? require('./tianheng-meihua-validation-v1.js') : null);
  const VERSION = '1.0.0';
  const OUTCOME_MAP = { favorable: 'positive', blocked: 'negative', conditional: 'mixed' };

  function analyze(input) {
    if (!Judgment) throw new Error('缺少梅花易數判斷層');
    const result = Judgment.analyze(input);
    return {
      engine: 'tianheng-meihua-engine',
      version: VERSION,
      method: result.core.casting.method,
      legacyOverride: false,
      result,
      layers: {
        question: result.core.request,
        casting: result.core.casting,
        primary: result.core.primary,
        mutual: result.core.mutual,
        changed: result.core.changed,
        bodyUse: result.core.bodyUse,
        monthStrength: result.strength,
        evidence: result.evidenceLedger,
        provisionalOutcome: result.outcome,
        advice: result.advice
      },
      release: {
        formalAccuracyClaim: false,
        siteIntegrationReady: false,
        reason: '核心規則已可重現；等待歷史盲測、保留樣本與前瞻驗證'
      }
    };
  }

  function probability(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 1) throw new Error('封存機率必須明確填入 0～1，不能由未校準分數冒充');
    return number;
  }

  function sealPrediction(input, metadata) {
    if (!metadata || typeof metadata !== 'object') throw new Error('缺少封存 metadata');
    if (typeof metadata.caseId !== 'string' || !metadata.caseId.trim()) throw new Error('caseId 不可空白');
    if (!Number.isFinite(Date.parse(metadata.createdAt))) throw new Error('createdAt 必須是有效時間');
    const analysis = analyze(input);
    return {
      sealed: {
        caseId: metadata.caseId,
        mode: metadata.mode || 'prospective',
        method: analysis.method,
        methodVersion: VERSION,
        category: analysis.layers.question.category,
        question: analysis.layers.question.question,
        askedAt: analysis.layers.question.askedAt,
        timezone: analysis.layers.question.timezone,
        castingInput: analysis.layers.casting,
        prediction: {
          createdAt: metadata.createdAt,
          outcome: OUTCOME_MAP[analysis.result.outcome.direction],
          probability: probability(metadata.probability),
          confidence: analysis.result.outcome.confidence,
          evidence: analysis.layers.evidence,
          timingWindow: metadata.timingWindow || null,
          actions: analysis.layers.advice.canDo,
          avoid: analysis.layers.advice.avoid,
          verify: analysis.layers.advice.verify,
          engineVersion: VERSION
        }
      },
      analysis
    };
  }

  function sealPredictionWithProtocol(input, metadata) {
    const result = sealPrediction(input, metadata);
    if (metadata.mode === 'retrospective_blind') result.sealed.blindProtocol = metadata.blindProtocol;
    return result;
  }

  function revealAndScore(sealed, actual) {
    if (!Validation) throw new Error('缺少梅花易數驗證層');
    const complete = { ...sealed, actual };
    return { case: Validation.validateCase(complete), score: Validation.scoreCase(complete) };
  }

  function safeAnalyze(input) {
    try { return { ok: true, result: analyze(input) }; }
    catch (error) { return { ok: false, error: error.message }; }
  }

  const api = { version: VERSION, legacyOverride: false, analyze, safeAnalyze, sealPrediction: sealPredictionWithProtocol, revealAndScore };
  root.TianhengMeihuaEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
