'use strict';
const B=require('./tianheng-wenshi-classics-benchmark-v1.js');
const E=require('./tianheng-wenshi-engine-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
const c=B.cases[0];const r=E.analyze(c.input).result;const expected=c.expectedFacts;
assert('古例明列非盲測準確率',()=>c.validationClass==='classics_rule_calibration_not_blind_accuracy'&&c.limitation.includes('不能計入'));
assert('兌為澤變雷水解與動爻還原正確',()=>r.interactions.adjudication.evidence.structure.casting.primary.name===expected.primary&&r.interactions.adjudication.evidence.structure.casting.changed.name===expected.changed&&r.interactions.adjudication.evidence.structure.casting.movingLines.join(',')===expected.movingLines.join(','));
assert('本卦財爻卯木同時月破旬空',()=>{
 const u=r.interactions.adjudication.usefulGod.selected;return u.zhi===expected.primaryUsefulZhi&&u.adjudicationFacts.monthBreak===expected.primaryUsefulMonthBreak&&u.adjudicationFacts.xunEmpty===expected.primaryUsefulXunEmpty;
});
assert('動爻變出寅木妻財被辨識為救應',()=>r.evidenceLedger.support.some(x=>x.code==='CHANGED_USEFUL_APPEARS'&&x.text.includes(expected.changedUsefulZhi)));
assert('變出寅木仍旬空被保留為等待條件',()=>r.evidenceLedger.unresolved.some(x=>x.code==='CHANGED_USEFUL_XUN_EMPTY'));
assert('空破與變爻救應並見時不判死',()=>r.outcome.direction===expected.provisionalDirection);
assert('應期保存寅木出空條件而不虛構公曆日',()=>r.timing.conditions.some(x=>x.includes('寅')&&x.includes('出空'))&&!r.timing.dateResolved);
const c2=B.cases[1];const r2=E.analyze(c2.input).result;const e2=c2.expectedFacts;
assert('第二古例復卦變震卦與四爻動還原正確',()=>r2.interactions.adjudication.evidence.structure.casting.primary.name===e2.primary&&r2.interactions.adjudication.evidence.structure.casting.changed.name===e2.changed&&r2.interactions.adjudication.evidence.structure.casting.movingLines.join(',')===e2.movingLines.join(','));
assert('兄弟丑土用神受卯月判為死地',()=>{
 const u=r2.interactions.adjudication.usefulGod.selected;return u.zhi===e2.primaryUsefulZhi&&u.calendar.seasonalState===e2.primaryUsefulSeason;
});
assert('兄弟丑土動化午火回頭生被辨識',()=>r2.interactions.adjudication.changeEvents.some(x=>x.position===4&&x.events.includes(e2.changeEvent))&&r2.evidenceLedger.support.some(x=>x.code==='RETURN_GENERATES'));
assert('日月克與回頭生並見保留有條件救應',()=>r2.outcome.direction===e2.provisionalDirection&&r2.evidenceLedger.resistance.length>0&&r2.evidenceLedger.support.length>0);
const c3=B.cases[2];const r3=E.analyze(c3.input).result;const e3=c3.expectedFacts;
assert('第三古例離卦變震卦與三上爻動還原正確',()=>r3.interactions.adjudication.evidence.structure.casting.primary.name===e3.primary&&r3.interactions.adjudication.evidence.structure.casting.changed.name===e3.changed&&r3.interactions.adjudication.evidence.structure.casting.movingLines.join(',')===e3.movingLines.join(','));
assert('升遷官鬼亥水動化辰土回頭克',()=>{
 const u=r3.interactions.adjudication.usefulGod.selected;
 return u.zhi===e3.primaryUsefulZhi&&r3.interactions.adjudication.changeEvents.some(x=>x.position===u.position&&x.events.includes(e3.changeEvent));
});
assert('官鬼回頭克且無強救應判目前受阻',()=>r3.outcome.direction===e3.provisionalDirection&&r3.evidenceLedger.resistance.some(x=>x.code==='RETURN_CONTROLS'));
assert('古例災禍語句不進入現代引擎輸出',()=>!JSON.stringify(r3).includes('刑獄')&&!JSON.stringify(r3).includes('大凶'));
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
