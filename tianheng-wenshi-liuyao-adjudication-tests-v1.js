'use strict';
const A=require('./tianheng-wenshi-liuyao-adjudication-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function req(topic='career_job',casts=[7,7,7,7,7,7],calendar={monthZhi:'子',dayGan:'甲',dayZhi:'子',source:'固定測試曆例'}){
 return{question:'月底前能否收到明確結果？',category:'事業／工作',topic,askedAt:'2026-08-30T12:00:00+08:00',timezone:'Asia/Taipei',casts,calendar};
}
assert('甲子旬戌亥空',()=>A.xunKong('甲','子').join('')==='戌亥');
assert('甲戌旬申酉空',()=>A.xunKong('甲','戌').join('')==='申酉');
assert('甲申旬午未空',()=>A.xunKong('甲','申').join('')==='午未');
assert('無效日干支組合會攔截',()=>{try{A.xunKong('甲','丑');return false}catch(e){return e.message.includes('無效')}});
assert('求職官鬼午火遇子月為月破',()=>{
 const r=A.analyze(req());return r.usefulGod.selected.position===4&&r.usefulGod.selected.adjudicationFacts.monthBreak;
});
assert('旬空逐爻保存而不刪除原爻',()=>{
 const r=A.analyze(req());return r.lines.find(x=>x.zhi==='戌').adjudicationFacts.xunEmpty&&r.lines.length===6;
});
assert('木用神之原神水忌神金仇神土',()=>{
 const lines=[{element:'木'},{element:'水'},{element:'金'},{element:'土'}];const s=A.spiritSet(lines,'木');
 return s.source.element==='水'&&s.adverse.element==='金'&&s.enemy.element==='土';
});
assert('回頭克可辨識',()=>A.classifyChange({zhi:'子',element:'水'},{zhi:'丑',element:'土'}).includes('回頭克'));
assert('進神與退神可辨識',()=>A.classifyChange({zhi:'亥',element:'水'},{zhi:'子',element:'水'}).includes('化進神')&&A.classifyChange({zhi:'子',element:'水'},{zhi:'亥',element:'水'}).includes('化退神'));
assert('多父母爻時動爻優先取用',()=>{
 const r=A.analyze(req('contract',[7,7,7,7,7,9],{monthZhi:'子',dayGan:'甲',dayZhi:'子',source:'固定測試曆例'}));
 return r.usefulGod.selected.position===6&&r.usefulGod.alternatives.some(x=>x.position===3);
});
assert('乾初爻動保留回頭克事件',()=>{
 const r=A.analyze(req('decision',[9,7,7,7,7,7]));
 return r.changeEvents[0].position===1&&r.changeEvents[0].events.includes('回頭克');
});
assert('支持阻力分欄保存',()=>{
 const r=A.analyze(req());return Array.isArray(r.evidenceLedger.support)&&Array.isArray(r.evidenceLedger.resistance);
});
assert('尚未冒充最終吉凶',()=>{
 const r=A.analyze(req());return r.status.endsWith('outcome_pending')&&!r.layers.finalOutcomeAttached;
});
assert('不覆蓋既有命理引擎',()=>A.legacyOverride===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);

