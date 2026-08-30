'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-ziping-pattern-v2.js');
const Z=globalThis.TianhengZipingPattern;
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function has(a,code){return a.some(x=>x.code===code);}

const officer=Z.analyze([{gan:'己',zhi:'亥'},{gan:'丙',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'癸',zhi:'未'}],{strength:'身中和'});
assert('官格以酉月辛官為骨架',()=>officer.basePattern.pattern==='官格'&&officer.patternGod.gan==='辛');
assert('官逢財印成格',()=>has(officer.formation,'OFFICER_WITH_WEALTH')&&has(officer.formation,'OFFICER_WITH_SEAL')&&officer.status==='成格');

const officerHurt=Z.analyze([{gan:'丁',zhi:'亥'},{gan:'丙',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'戊',zhi:'未'}],{strength:'身中和'});
assert('官見傷為病',()=>has(officerHurt.failures,'OFFICER_HURT'));
const officerSaved=Z.analyze([{gan:'丁',zhi:'亥'},{gan:'癸',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'己',zhi:'未'}],{strength:'身弱'});
assert('印制傷護官為救應',()=>has(officerSaved.rescues,'SEAL_CONTROLS_HURT')&&officerSaved.status.includes('救'));

const wealth=Z.analyze([{gan:'辛',zhi:'亥'},{gan:'丙',zhi:'丑'},{gan:'甲',zhi:'辰'},{gan:'丁',zhi:'未'}],{strength:'身強'});
assert('財格財旺生官',()=>wealth.basePattern.pattern==='財格'&&has(wealth.formation,'WEALTH_BIRTH_OFFICER'));

const food=Z.analyze([{gan:'己',zhi:'子'},{gan:'戊',zhi:'巳'},{gan:'甲',zhi:'辰'},{gan:'乙',zhi:'未'}],{strength:'身強'});
assert('食神格食神生財',()=>food.basePattern.pattern==='食神格'&&has(food.formation,'FOOD_BIRTH_WEALTH'));

const kill=Z.analyze([{gan:'丙',zhi:'子'},{gan:'壬',zhi:'申'},{gan:'甲',zhi:'辰'},{gan:'乙',zhi:'午'}],{strength:'身強'});
assert('煞格食神制煞',()=>kill.basePattern.pattern==='煞格'&&has(kill.formation,'FOOD_CONTROLS_KILL'));

const hurtSeal=Z.analyze([{gan:'癸',zhi:'子'},{gan:'丙',zhi:'午'},{gan:'甲',zhi:'辰'},{gan:'壬',zhi:'未'}],{strength:'身弱'});
assert('傷官格身弱佩印',()=>hurtSeal.basePattern.pattern==='傷官格'&&has(hurtSeal.formation,'HURT_WITH_SEAL')&&hurtSeal.variant==='傷官佩印');

const blade=Z.analyze([{gan:'辛',zhi:'子'},{gan:'丙',zhi:'卯'},{gan:'甲',zhi:'辰'},{gan:'己',zhi:'未'}],{strength:'身強'});
assert('陽日主劫財月令判陽刃',()=>blade.basePattern.pattern==='陽刃格');
assert('陽刃得官制',()=>has(blade.formation,'OFFICER_KILL_CONTROLS_BLADE'));
const earthBlade=Z.analyze([{gan:'壬',zhi:'戌'},{gan:'丁',zhi:'午'},{gan:'戊',zhi:'申'},{gan:'乙',zhi:'卯'}],{strength:'身強'});
const earthRob=Z.analyze([{gan:'壬',zhi:'戌'},{gan:'丁',zhi:'未'},{gan:'戊',zhi:'申'},{gan:'乙',zhi:'卯'}],{strength:'身強'});
assert('戊日只有午月劫財可判陽刃',()=>earthBlade.basePattern.pattern==='陽刃格');
assert('戊日未月不得誤判陽刃',()=>earthRob.basePattern.pattern==='建祿月劫格');
assert('戊午以中氣己土為刃神而非誤取丁印',()=>earthBlade.basePattern.monthMainGan==='己'&&earthBlade.basePattern.layer==='中氣');
const fiveBlades=[['甲','卯'],['丙','午'],['戊','午'],['庚','酉'],['壬','子']].map(([gan,zhi])=>Z.analyze([{gan:'辛',zhi:'亥'},{gan:'癸',zhi},{gan,zhi:'辰'},{gan:'己',zhi:'未'}],{strength:'身強'}));
assert('五個陽干固定刃位全部可辨',()=>fiveBlades.every(x=>x.basePattern.pattern==='陽刃格'&&x.basePattern.monthMainGod==='劫財'));

const lu=Z.analyze([{gan:'辛',zhi:'子'},{gan:'癸',zhi:'寅'},{gan:'甲',zhi:'辰'},{gan:'己',zhi:'未'}],{strength:'身強'});
assert('比肩月令判建祿月劫',()=>lu.basePattern.pattern==='建祿月劫格');
assert('建祿透官逢財印',()=>has(lu.formation,'LU_MONTH_USE_OFFICER'));

assert('候選格局保留月令本中餘氣',()=>officer.candidates.length===1&&officer.candidates[0].layer==='本氣');
assert('不以分數裁定格局',()=>officer.xiuZhengHouFen===undefined&&officer.score===undefined);
assert('保留成敗救應證據',()=>Array.isArray(officer.formation)&&Array.isArray(officer.failures)&&Array.isArray(officer.rescues)&&Array.isArray(officer.evidence));
assert('不覆蓋舊引擎',()=>officer.legacyOverride===false&&officer.mode==='add-only');
const bad=Z.safeAnalyze([{gan:'甲',zhi:'子'}]);
assert('錯誤輸入可安全攔截',()=>bad.ok===false&&!!bad.error);

const savedByLuck=Z.analyzeFortune(
  [{gan:'丁',zhi:'亥'},{gan:'丙',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'戊',zhi:'未'}],
  {type:'流年',gan:'癸',zhi:'巳'},{strength:'身弱'});
assert('流年印星加入後形成救應',()=>savedByLuck.transition.types.includes('獲得救應')&&has(savedByLuck.transition.newRescues,'SEAL_CONTROLS_HURT'));
assert('運前運後狀態分開保存',()=>!!savedByLuck.base.status&&!!savedByLuck.after.status&&savedByLuck.legacyOverride===false);

const brokenByLuck=Z.analyzeFortune(
  [{gan:'己',zhi:'亥'},{gan:'丙',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'癸',zhi:'未'}],
  {type:'流年',gan:'丁',zhi:'卯'},{strength:'身中和'});
assert('流年傷官與沖月令破壞官格',()=>brokenByLuck.transition.types.includes('被破壞')&&has(brokenByLuck.transition.newFailures,'OFFICER_HURT')&&has(brokenByLuck.transition.newFailures,'FORTUNE_CLASH_MONTH'));
assert('記錄流年沖到月柱',()=>brokenByLuck.transition.relations.some(x=>x.type==='沖'&&x.targetPillarIndex===1));

const activatedByLuck=Z.analyzeFortune(
  [{gan:'乙',zhi:'子'},{gan:'壬',zhi:'巳'},{gan:'甲',zhi:'辰'},{gan:'癸',zhi:'未'}],
  {type:'大運',gan:'己',zhi:'酉'},{strength:'身強'});
assert('大運財星引動食神生財',()=>activatedByLuck.transition.types.includes('被引動')&&has(activatedByLuck.transition.newFormation,'FOOD_BIRTH_WEALTH'));
assert('格局變體因運程被重塑',()=>activatedByLuck.transition.types.includes('被重塑')&&activatedByLuck.after.variant==='食神生財');
const badLuck=Z.safeAnalyzeFortune(officer.pillars,{gan:'X',zhi:'子'},{strength:'身中和'});
assert('錯誤運程可安全攔截',()=>badLuck.ok===false&&badLuck.error.includes('運程干支無效'));

console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail)process.exit(1);
