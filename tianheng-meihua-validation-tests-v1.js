'use strict';

const E = require('./tianheng-meihua-engine-v1.js');
const V = require('./tianheng-meihua-validation-v1.js');
let pass = 0;
let fail = 0;
function assert(name, fn) { try { if (!fn()) throw new Error('assert false'); console.log('PASS',name); pass++; } catch (error) { console.error('FAIL',name,'::',error.message); fail++; } }
function input() { return { question:'是否收到面試通知？',category:'求職／工作',askedAt:'2026-09-01T08:00:00+08:00',timezone:'Asia/Taipei',method:'two_numbers',numbers:{first:17,second:26},monthZhi:'申' }; }
function sealed(mode='prospective') {
  return E.sealPrediction(input(),{caseId:`MH-${mode}`,mode,createdAt:'2026-09-01T08:01:00+08:00',probability:.55,timingWindow:{start:'2026-09-02T00:00:00+08:00',end:'2026-09-10T23:59:59+08:00'},blindProtocol:mode==='retrospective_blind'?{outcomeSealed:true,operatorHadOutcomeAccess:false,caseFrozenAt:'2026-09-01T08:00:30+08:00',outcomeRevealedAt:'2026-09-12T08:00:00+08:00'}:undefined}).sealed;
}
function complete(mode='prospective', outcome='positive') { return {...sealed(mode),actual:{knownAt:'2026-09-11T09:00:00+08:00',outcome,eventWindow:{start:'2026-09-05T09:00:00+08:00',end:'2026-09-05T10:00:00+08:00'},source:'去識別化事件紀錄'}}; }

assert('驗證層不覆蓋舊引擎',()=>V.legacyOverride===false);
assert('前瞻預測早於結果可通過',()=>V.validateCase(complete()).validationIntegrity==='prediction_precedes_outcome');
assert('方向命中與應期重疊可計分',()=>{const s=V.scoreCase(complete());return typeof s.directionHit==='boolean'&&s.timingHit===true;});
assert('Brier 分數可計算',()=>Math.abs(V.scoreCase(complete()).brierScore-Math.pow(.55-1,2))<1e-12);
assert('歷史盲測封存後揭盲可通過',()=>V.validateCase(complete('retrospective_blind')).validationIntegrity==='retrospective_blind_protocol_passed');
assert('歷史盲測若操作者看過答案會攔截',()=>{try{const x=complete('retrospective_blind');x.blindProtocol.operatorHadOutcomeAccess=true;V.validateCase(x);return false}catch(e){return e.message.includes('無答案權限')}});
assert('前瞻預測若晚於結果會攔截',()=>{try{const x=complete();x.actual.knownAt='2026-09-01T08:00:30+08:00';V.validateCase(x);return false}catch(e){return e.message.includes('資料洩漏')}});
assert('未定案例不灌入方向準確率',()=>{const a=complete();const b=complete();b.caseId='MH-UNRESOLVED';b.prediction.outcome='unresolved';const r=V.summarize([a,b]);return r.sampleSize===2&&r.resolvedSampleSize===1&&r.coverage===.5;});
assert('總引擎可在揭盲後計分',()=>E.revealAndScore(sealed(),complete().actual).score.caseId==='MH-prospective');

console.log(`\nRESULT ${pass}/${pass+fail} passed`); if(fail)process.exit(1);

