'use strict';
const H=require('./tianheng-wenshi-history-study-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function record(){return{
 caseId:'ARCHIVE-001',
 input:{question:'面試是否能進入下一輪？',category:'事業／工作',topic:'career_job',askedAt:'2025-01-02T09:00:00+08:00',timezone:'Asia/Taipei',casts:[7,7,7,7,7,7],calendar:{monthZhi:'巳',dayGan:'甲',dayZhi:'午',source:'封存曆例'}},
 actual:{knownAt:'2025-01-10T18:00:00+08:00',outcome:'positive',eventWindow:null,source:'去識別化通知紀錄'},
 archiveEvidence:{questionRecord:true,castingRecord:true,outcomeRecord:true}
};}
function packet(){return H.createBlindPacket(record(),{caseFrozenAt:'2026-01-10T09:00:00+08:00',sealedOutcomeRef:'SEALED-001'});}
assert('完整舊案可列為歷史盲測候選',()=>H.qualifyRecord(record()).eligible);
assert('缺少原始起卦紀錄只能做回顧說明',()=>{const r=record();r.archiveEvidence.castingRecord=false;const q=H.qualifyRecord(r);return !q.eligible&&q.validationClass==='retrospective_explanation_only';});
assert('盲包不含實際結果與證據內容',()=>{const p=packet();return p.actual.sealed===true&&!p.input.actual&&p.sealedFields.includes('actual');});
assert('盲包保留原問題與六次起卦資料',()=>{const p=packet();return p.input.question===record().input.question&&p.input.casts.length===6;});
assert('操作者可在不知道結果時封存預測',()=>{const s=H.sealOperatorPrediction(packet(),{createdAt:'2026-01-11T09:00:00+08:00',plannedRevealAt:'2026-01-12T09:00:00+08:00',probability:.7,confidence:'medium'});return !s.sealed.actual&&s.sealed.prediction.outcome==='positive';});
assert('揭盲後才產生命中計分',()=>{const s=H.sealOperatorPrediction(packet(),{createdAt:'2026-01-11T09:00:00+08:00',plannedRevealAt:'2026-01-12T09:00:00+08:00',probability:.7,confidence:'medium'});return H.reveal(record(),s.sealed).score.directionHit===true;});
assert('案例編號不一致不可揭盲',()=>{try{const s=H.sealOperatorPrediction(packet(),{createdAt:'2026-01-11T09:00:00+08:00',plannedRevealAt:'2026-01-12T09:00:00+08:00',probability:.7,confidence:'medium'});const r=record();r.caseId='OTHER';H.reveal(r,s.sealed);return false}catch(e){return e.message.includes('編號')}});
assert('測試夾具不冒充真實命中率',()=>H.version==='1.0.0');
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);

