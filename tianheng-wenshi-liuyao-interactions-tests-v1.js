'use strict';
const I=require('./tianheng-wenshi-liuyao-interactions-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function req(topic='career_job',casts=[7,7,7,7,7,7]){return{question:'月底前是否有明確結果？',category:'事業／工作',topic,askedAt:'2026-08-30T12:00:00+08:00',timezone:'Asia/Taipei',casts,calendar:{monthZhi:'子',dayGan:'甲',dayZhi:'子',source:'固定測試曆例'}};}
assert('用神不現時回本宮首卦尋伏神',()=>{
 const r=I.analyze(req('career_job',[7,8,8,8,8,7]));
 return r.adjudication.evidence.structure.casting.primary.name==='頤'&&!r.adjudication.usefulGod.selected&&r.hiddenGod.found&&r.hiddenGod.candidates.length>0;
});
assert('伏神與飛神分開保存',()=>{
 const r=I.analyze(req('career_job',[7,8,8,8,8,7]));const c=r.hiddenGod.candidates[0];
 return c.hidden.position===c.flying.position&&!!c.relation;
});
assert('飛伏關係只記錄不直接斷吉凶',()=>I.analyze(req('career_job',[7,8,8,8,8,7])).hiddenGod.note.includes('仍須合參'));
assert('乾卦三組六沖均被保存',()=>I.analyze(req()).interactions.branchPairs.filter(x=>x.type==='六沖').length===3);
assert('靜爻沖只記結構未標為發動',()=>I.analyze(req()).interactions.branchPairs.every(x=>x.active===false));
assert('乾卦寅午戌三合火支序齊備',()=>{
 const t=I.analyze(req()).interactions.trines.find(x=>x.element==='火');return t&&t.positions.join(',')==='2,4,6'&&!t.transformed;
});
assert('三合有動爻時只標記引動不強制化氣',()=>{
 const t=I.analyze(req('career_job',[7,9,7,7,7,7])).interactions.trines.find(x=>x.element==='火');
 return t.active&&t.activePositions.includes(2)&&!t.transformed;
});
assert('沖合事件不覆蓋原裁決資料',()=>{
 const r=I.analyze(req());return r.layers.originalAdjudication===r.adjudication&&r.layers.interactionEventsSeparate;
});
assert('尚未冒充最終結果',()=>I.analyze(req()).status.endsWith('outcome_pending'));
assert('不覆蓋既有命理引擎',()=>I.legacyOverride===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);

