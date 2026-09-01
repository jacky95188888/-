'use strict';

const E = require('./tianheng-meihua-engine-v1.js');
let pass = 0;
let fail = 0;
function assert(name, fn) {
  try { if (!fn()) throw new Error('assert false'); console.log('PASS', name); pass++; }
  catch (error) { console.error('FAIL', name, '::', error.message); fail++; }
}
function input() {
  return { question:'九月內能否進入第二輪面試？',category:'求職／工作',askedAt:'2026-09-01T08:00:00+08:00',timezone:'Asia/Taipei',method:'two_numbers',numbers:{first:17,second:26},monthZhi:'申' };
}

assert('總引擎保存問題起卦本互變體用旺衰證據結果與建議', () => {
  const l = E.analyze(input()).layers;
  return l.question && l.casting && l.primary && l.mutual && l.changed && l.bodyUse && l.monthStrength && l.evidence && l.provisionalOutcome && l.advice;
});
assert('未完成實證前不宣稱準確率或可接正式站', () => {
  const r = E.analyze(input());
  return !r.release.formalAccuracyClaim && !r.release.siteIntegrationReady;
});
assert('封存預測不包含事後結果', () => {
  const r = E.sealPrediction(input(),{caseId:'MH-001',mode:'prospective',createdAt:'2026-09-01T08:01:00+08:00',probability:.55}).sealed;
  return !Object.prototype.hasOwnProperty.call(r,'actual') && r.prediction.engineVersion === '1.0.0';
});
assert('未明示機率不得封存', () => {
  try { E.sealPrediction(input(),{caseId:'MH-002',createdAt:'2026-09-01T08:01:00+08:00'}); return false; }
  catch (error) { return error.message.includes('明確填入'); }
});
assert('safeAnalyze 攔截不完整輸入', () => !E.safeAnalyze({question:'x'}).ok);
assert('梅花總引擎不覆蓋舊命理結果', () => E.legacyOverride === false && E.analyze(input()).legacyOverride === false);

console.log(`\nRESULT ${pass}/${pass + fail} passed`);
if (fail) process.exit(1);

