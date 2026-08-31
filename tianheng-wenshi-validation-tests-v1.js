'use strict';

const V = require('./tianheng-wenshi-validation-v1.js');
let pass = 0;
let fail = 0;

function assert(name, fn) {
  try {
    if (!fn()) throw new Error('assert false');
    console.log('PASS', name);
    pass++;
  } catch (error) {
    console.error('FAIL', name, '::', error.message);
    fail++;
  }
}

function sample(overrides = {}) {
  const base = {
    caseId: 'WENSHI-001',
    mode: 'retrospective_blind',
    method: 'pending_selection',
    methodVersion: '0.0.0',
    category: '事業／工作',
    question: '這次面試能否進入下一階段？',
    askedAt: '2026-01-02T09:00:00+08:00',
    timezone: 'Asia/Taipei',
    castingInput: { source: 'archived_record' },
    blindProtocol: {
      outcomeSealed: true,
      operatorHadOutcomeAccess: false,
      caseFrozenAt: '2026-01-02T09:01:00+08:00',
      outcomeRevealedAt: '2026-01-12T09:00:00+08:00'
    },
    prediction: {
      createdAt: '2026-01-02T09:05:00+08:00',
      outcome: 'positive',
      probability: 0.7,
      confidence: 'medium',
      timingWindow: { start: '2026-01-05T00:00:00+08:00', end: '2026-01-12T23:59:59+08:00' },
      evidence: { support: ['示例支持證據'], resistance: ['示例阻力證據'] },
      actions: ['準備第二輪資料'],
      avoid: ['提前認定錄取']
    },
    actual: {
      knownAt: '2026-01-10T18:00:00+08:00',
      outcome: 'positive',
      eventWindow: { start: '2026-01-10T17:00:00+08:00', end: '2026-01-10T18:00:00+08:00' },
      source: '去識別化事件紀錄'
    }
  };
  return { ...base, ...overrides };
}

assert('驗證層不覆蓋既有引擎', () => V.legacyOverride === false);
assert('命中方向可計分', () => V.scoreCase(sample()).directionHit === true);
assert('應期窗口重疊可計分', () => V.scoreCase(sample()).timingHit === true);
assert('Brier 分數正確', () => Math.abs(V.scoreCase(sample()).brierScore - 0.09) < 1e-12);
assert('盲測視圖封存實際結果', () => V.blindView(sample()).actual.sealed === true && !V.blindView(sample()).prediction);
assert('前瞻預測晚於結果會攔截資料洩漏', () => {
  try {
    V.validateCase(sample({
      mode: 'prospective',
      prediction: { ...sample().prediction, createdAt: '2026-01-11T09:00:00+08:00' }
    }));
    return false;
  } catch (error) {
    return error.message.includes('資料洩漏');
  }
});
assert('歷史盲測可在事件後判讀但必須揭盲在後', () => {
  const item = sample({
    prediction: { ...sample().prediction, createdAt: '2026-01-11T09:00:00+08:00' },
    blindProtocol: { ...sample().blindProtocol, outcomeRevealedAt: '2026-01-12T09:00:00+08:00' }
  });
  return V.validateCase(item).validationIntegrity === 'retrospective_blind_protocol_passed';
});
assert('歷史盲測操作者若有答案權限會攔截', () => {
  try {
    V.validateCase(sample({ blindProtocol: { ...sample().blindProtocol, operatorHadOutcomeAccess: true } }));
    return false;
  } catch (error) {
    return error.message.includes('無答案權限');
  }
});
assert('拒答不灌入方向準確率', () => {
  const unresolved = sample({
    caseId: 'WENSHI-002',
    prediction: { ...sample().prediction, outcome: 'unresolved', probability: 0.5 }
  });
  const report = V.summarize([sample(), unresolved]);
  return report.sampleSize === 2 && report.resolvedSampleSize === 1 && report.coverage === 0.5 && report.directionAccuracy === 1;
});
assert('重複案例編號會攔截', () => {
  try {
    V.summarize([sample(), sample()]);
    return false;
  } catch (error) {
    return error.message.includes('caseId 重複');
  }
});

console.log(`\nRESULT ${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);
