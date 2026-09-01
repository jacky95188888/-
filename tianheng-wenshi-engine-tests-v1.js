'use strict';
const E=require('./tianheng-wenshi-engine-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function input(){return{question:'這次面試能否取得下一輪通知？',category:'事業／工作',topic:'career_job',askedAt:'2025-01-02T09:00:00+08:00',timezone:'Asia/Taipei',casts:[7,7,7,7,7,7],calendar:{monthZhi:'巳',dayGan:'甲',dayZhi:'午',source:'固定測試曆例'}};}
function metadata(){return{caseId:'BLIND-001',mode:'retrospective_blind',createdAt:'2026-01-11T09:00:00+08:00',probability:.7,confidence:'medium',timingWindow:null,blindProtocol:{outcomeSealed:true,operatorHadOutcomeAccess:false,caseFrozenAt:'2026-01-10T09:00:00+08:00',outcomeRevealedAt:'2026-01-12T09:00:00+08:00'}};}
assert('總引擎完整保留問題起卦結構裁決互動與建議層',()=>{
 const r=E.analyze(input());return r.layers.question&&r.layers.casting&&r.layers.structure&&r.layers.adjudication&&r.layers.interactions&&r.layers.provisionalOutcome&&r.layers.narrative&&r.layers.originalAdvice&&r.layers.advice;
});
assert('未驗證前不宣稱正式準確率或接站完成',()=>{
 const r=E.analyze(input());return !r.release.formalAccuracyClaim&&!r.release.siteIntegrationReady;
});
assert('封存預測不包含實際結果',()=>{
 const r=E.sealPrediction(input(),metadata()).sealed;return !Object.prototype.hasOwnProperty.call(r,'actual')&&r.prediction.outcome==='positive';
});
assert('封存時必須人工明示未校準機率',()=>{
 try{const m=metadata();delete m.probability;E.sealPrediction(input(),m);return false}catch(e){return e.message.includes('明確填入')}
});
assert('歷史盲測可在封存後揭盲計分',()=>{
 const sealed=E.sealPrediction(input(),metadata()).sealed;
 const actual={knownAt:'2025-01-10T18:00:00+08:00',outcome:'positive',eventWindow:null,source:'去識別化事件紀錄'};
 const r=E.revealAndScore(sealed,actual);return r.score.directionHit===true&&r.score.leakageCheck==='retrospective_blind_protocol_passed';
});
assert('safeAnalyze 攔截不完整起卦輸入',()=>!E.safeAnalyze({question:'x'}).ok);
assert('問事總引擎不覆蓋八字或舊命理結果',()=>E.legacyOverride===false&&E.analyze(input()).legacyOverride===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
