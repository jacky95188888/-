'use strict';
const S=require('./tianheng-wenshi-liuyao-synthesis-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function req(topic='career_job',casts=[7,7,7,7,7,7],calendar={monthZhi:'巳',dayGan:'甲',dayZhi:'午',source:'固定測試曆例'}){return{question:'月底前是否有明確結果？',category:'事業／工作',topic,askedAt:'2026-08-30T12:00:00+08:00',timezone:'Asia/Taipei',casts,calendar};}
assert('用神得日月且無硬阻力時偏支持',()=>S.analyze(req()).outcome.direction==='favorable');
assert('用神月破且無救應時判目前受阻',()=>{
 const r=S.analyze(req('career_job',[7,7,7,7,7,7],{monthZhi:'子',dayGan:'甲',dayZhi:'子',source:'固定測試曆例'}));
 return r.outcome.direction==='blocked'&&r.evidenceLedger.resistance.some(x=>x.code==='MONTH_BREAK');
});
assert('強支持與硬阻力並見時保留有條件',()=>{
 const r=S.analyze(req('career_job',[7,7,7,7,7,7],{monthZhi:'午',dayGan:'甲',dayZhi:'子',source:'固定測試曆例'}));
 return r.outcome.direction==='conditional';
});
assert('用神伏藏時不硬斷',()=>S.analyze(req('career_job',[7,8,8,8,8,7])).outcome.direction==='unresolved');
assert('信心上限未經盲測不給高',()=>['low','medium'].includes(S.analyze(req()).outcome.confidence));
assert('未經盲測不虛構機率',()=>S.analyze(req()).outcome.probability===null&&S.analyze(req()).outcome.calibrationStatus==='awaiting_blind_validation');
assert('應期未接萬年曆不虛構日期',()=>S.analyze(req()).timing.dateResolved===false);
assert('解釋明列用神位置與支持阻力',()=>{
 const r=S.analyze(req());return r.explanation.basis.includes('第4爻')&&r.explanation.support&&r.explanation.resistance;
});
assert('建議連結實際證據代碼',()=>Array.isArray(S.analyze(req()).advice.linkedEvidence));
assert('受阻時提供可執行查證而非宿命句',()=>{
 const r=S.analyze(req('career_job',[7,7,7,7,7,7],{monthZhi:'子',dayGan:'甲',dayZhi:'子',source:'固定測試曆例'}));
 return r.advice.verify.length>0&&r.advice.avoid.length>0;
});
assert('原始事件與暫定結果分開保存',()=>S.analyze(req()).layers.provisionalOutcomeSeparate);
assert('安全聲明要求現實查證',()=>S.analyze(req()).safety.requiresRealWorldVerification);
assert('不覆蓋既有命理引擎',()=>S.legacyOverride===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);

