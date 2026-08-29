'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-combinations-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-bazi-quality-v1.js');
require('./tianheng-bazi-engine-v1.js');
require('./tianheng-bazi-integration-v1.js');

const A=globalThis.TianhengBaziAdvanced;
const C=globalThis.TianhengBaziCombinations;
const G=globalThis.TianhengBaziGeJuTiaoHou;
const Q=globalThis.TianhengBaziQuality;
const E=globalThis.TianhengBaziEngine;
const I=globalThis.TianhengBaziIntegration;
let pass=0, fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}

Object.keys({子:1,丑:1,寅:1,卯:1,辰:1,巳:1,午:1,未:1,申:1,酉:1,戌:1,亥:1}).forEach(z=>assert(z+'藏干權重合計=1',()=>Math.abs(A.getCangGan(z).reduce((s,x)=>s+x.weight,0)-1)<1e-9));
assert('甲亥長生',()=>A.getChangSheng('甲','亥')==='長生');
assert('甲卯帝旺',()=>A.getChangSheng('甲','卯')==='帝旺');
assert('乙午長生',()=>A.getChangSheng('乙','午')==='長生');
assert('乙卯臨官',()=>A.getChangSheng('乙','卯')==='臨官');

const sanhe=[{gan:'庚',zhi:'申'},{gan:'丙',zhi:'子'},{gan:'壬',zhi:'辰'},{gan:'甲',zhi:'申'}];
const r=E.analyze(sanhe);
assert('總整合七層存在',()=>!!(r.cangGan&&r.tongGen&&r.changSheng&&r.heHuiJu&&r.geJu&&r.tiaoHou&&r.quality));
assert('申子辰三合水',()=>r.heHuiJu.sanHe.some(x=>x.name==='申子辰三合水局'&&x.power===1));
assert('子月調候丙丁',()=>r.tiaoHou.tiaohouXuqiu.join('')==='丙丁');
assert('通根顯示分<=100',()=>r.tongGen.all.every(x=>x.score<=100));
assert('通根保留rawScore',()=>r.tongGen.all.every(x=>typeof x.rawScore==='number'));
assert('不覆蓋舊引擎',()=>r.legacyOverride===false);

const half=C.analyze([{gan:'甲',zhi:'申'},{gan:'乙',zhi:'子'},{gan:'丙',zhi:'午'},{gan:'丁',zhi:'酉'}]);
assert('申子半合水50%',()=>half.sanHe.some(x=>x.type==='半合'&&x.huaQi==='水'&&x.power===.5));
const arch=C.analyze([{gan:'甲',zhi:'申'},{gan:'乙',zhi:'辰'},{gan:'丙',zhi:'午'},{gan:'丁',zhi:'酉'}]);
assert('申辰拱合水30%',()=>arch.sanHe.some(x=>x.type==='拱合'&&x.huaQi==='水'&&x.power===.3));
const hui=C.analyze([{gan:'甲',zhi:'寅'},{gan:'乙',zhi:'卯'},{gan:'丙',zhi:'辰'},{gan:'丁',zhi:'午'}]);
assert('寅卯辰三會木115%',()=>hui.sanHui.some(x=>x.huaQi==='木'&&x.power===1.15));
const wuWei=C.analyze([{gan:'甲',zhi:'子'},{gan:'乙',zhi:'午'},{gan:'丙',zhi:'未'},{gan:'丁',zhi:'酉'}]);
assert('午未只論合絆',()=>wuWei.liuHe.some(x=>x.pair.join('')==='午未'&&x.status==='合絆'&&!x.canTransform));

const ge=G.judgeGeJu([{gan:'辛',zhi:'巳'},{gan:'庚',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'丁',zhi:'未'}]);
assert('月令本氣透干優先',()=>ge.touGanCeng==='本氣'&&ge.touGanGan==='辛');
const th=G.judgeTiaoHou([{gan:'甲',zhi:'寅'},{gan:'乙',zhi:'午'},{gan:'丙',zhi:'申'},{gan:'壬',zhi:'子'}],'身強');
assert('午月調候識別壬已具備',()=>th.yiJuBei.includes('壬'));

const bad=E.safeAnalyze([{gan:'甲',zhi:'子'}]);
assert('safeAnalyze攔截錯誤輸入',()=>bad.ok===false&&!!bad.error);

const invalidGan=E.safeAnalyze([{gan:'A',zhi:'子'},{gan:'乙',zhi:'丑'},{gan:'丙',zhi:'寅'},{gan:'丁',zhi:'卯'}]);
const invalidZhi=E.safeAnalyze([{gan:'甲',zhi:'子'},{gan:'乙',zhi:'丑'},{gan:'丙',zhi:'X'},{gan:'丁',zhi:'卯'}]);
assert('safeAnalyze攔截無效天干',()=>invalidGan.ok===false&&invalidGan.error.includes('天干無效'));
assert('safeAnalyze攔截無效地支',()=>invalidZhi.ok===false&&invalidZhi.error.includes('地支無效'));

const strong=E.analyze([{gan:'丙',zhi:'寅'},{gan:'戊',zhi:'卯'},{gan:'甲',zhi:'亥'},{gan:'庚',zhi:'寅'}]);
const balanced=E.analyze([{gan:'丙',zhi:'子'},{gan:'戊',zhi:'酉'},{gan:'甲',zhi:'寅'},{gan:'庚',zhi:'午'}]);
const weak=E.analyze([{gan:'丙',zhi:'午'},{gan:'戊',zhi:'酉'},{gan:'甲',zhi:'子'},{gan:'庚',zhi:'丑'}]);
assert('身強命例',()=>strong.tongGen.riZhu.strength==='身強'&&strong.tongGen.riZhu.rawScore>100&&strong.tongGen.riZhu.score===100);
assert('身中和命例',()=>balanced.tongGen.riZhu.strength==='身中和'&&balanced.tongGen.riZhu.score===60);
assert('身弱命例',()=>weak.tongGen.riZhu.strength==='身弱'&&weak.tongGen.riZhu.score===0);

function gejuCase(monthZhi, visibleGan, dayGan='甲'){
  return G.judgeGeJu([{gan:visibleGan,zhi:'子'},{gan:'丙',zhi:monthZhi},{gan:dayGan,zhi:'辰'},{gan:'丁',zhi:'未'}]);
}
assert('正官格命例',()=>gejuCase('酉','辛').geJu==='正官格');
assert('七殺格命例',()=>gejuCase('申','庚').geJu==='七殺格');
assert('正財格命例',()=>gejuCase('丑','己').geJu==='正財格');
assert('偏財格命例',()=>gejuCase('辰','戊').geJu==='偏財格');
assert('正印格命例',()=>gejuCase('子','癸').geJu==='正印格');
assert('偏印格命例',()=>gejuCase('亥','壬').geJu.startsWith('偏印格'));
assert('食神格命例',()=>gejuCase('巳','丙').geJu==='食神格');
assert('傷官格命例',()=>gejuCase('午','丁').geJu==='傷官格');
assert('建祿格命例',()=>gejuCase('寅','甲').geJu==='建祿格');
assert('陽日主羊刃格命例',()=>gejuCase('卯','乙').geJu==='羊刃格');
assert('陰日主月刃格命例',()=>gejuCase('寅','甲','乙').geJu==='月刃格');

const liuheTransform=C.analyze([{gan:'甲',zhi:'子'},{gan:'戊',zhi:'丑'},{gan:'丙',zhi:'辰'},{gan:'丁',zhi:'午'}]);
const liuheApart=C.analyze([{gan:'甲',zhi:'子'},{gan:'乙',zhi:'辰'},{gan:'丙',zhi:'丑'},{gan:'丁',zhi:'午'}]);
assert('六合得透干支持可合化',()=>liuheTransform.liuHe.some(x=>x.name==='子丑六合'&&x.canTransform&&x.ganSupports));
assert('六合不相鄰不成立',()=>!liuheApart.liuHe.some(x=>x.name==='子丑六合'));
const clashed=C.analyze([{gan:'甲',zhi:'申'},{gan:'乙',zhi:'子'},{gan:'丙',zhi:'午'},{gan:'丁',zhi:'辰'}]);
assert('合局受相鄰沖減力30%',()=>clashed.conflicts.selected.some(x=>x.name==='申子辰三合水局'&&x.effectivePower===.7));
const competing=C.analyze([{gan:'甲',zhi:'申'},{gan:'乙',zhi:'子'},{gan:'丙',zhi:'辰'},{gan:'辛',zhi:'酉'}]);
assert('競爭合局保留落選原因',()=>competing.conflicts.rejected.some(x=>x.name==='辰酉六合'&&!!x.rejectedReason));
assert('合化前後五行分開保存',()=>competing.strength.originalStrength!==competing.strength.finalStrength&&Array.isArray(competing.strength.transformEvents));

const conflictTH=G.judgeTiaoHou([{gan:'甲',zhi:'寅'},{gan:'乙',zhi:'午'},{gan:'丙',zhi:'卯'},{gan:'壬',zhi:'辰'}],'身弱');
const missingTH=G.judgeTiaoHou([{gan:'甲',zhi:'寅'},{gan:'乙',zhi:'午'},{gan:'丙',zhi:'卯'},{gan:'庚',zhi:'辰'}],'身弱');
assert('調候存在與缺失分開保存',()=>conflictTH.yiJuBei.includes('壬')&&conflictTH.queShi.includes('癸'));
assert('調候用神衝突標記',()=>conflictTH.yongShenChongTu&&conflictTH.chongTuGan.includes('壬'));
assert('調候缺失命例',()=>missingTH.queShi.includes('壬')&&missingTH.queShi.includes('癸'));

function breakNames(p){const a=A.analyze(p),g=G.analyze(p,a);return Q.analyze(p,a,g).poGeJianCe;}
const mixed=breakNames([{gan:'辛',zhi:'子'},{gan:'丙',zhi:'酉'},{gan:'甲',zhi:'辰'},{gan:'庚',zhi:'午'}]);
const hurtOfficer=breakNames([{gan:'丁',zhi:'子'},{gan:'丙',zhi:'午'},{gan:'甲',zhi:'亥'},{gan:'辛',zhi:'辰'}]);
const wealthBreaksSeal=breakNames([{gan:'己',zhi:'子'},{gan:'壬',zhi:'亥'},{gan:'甲',zhi:'辰'},{gan:'丁',zhi:'未'}]);
const owlStealsFood=breakNames([{gan:'丙',zhi:'子'},{gan:'壬',zhi:'巳'},{gan:'甲',zhi:'辰'},{gan:'丁',zhi:'未'}]);
assert('官殺混雜命例',()=>mixed.some(x=>x.name==='官殺混雜'));
assert('傷官見官且印星化解',()=>hurtOfficer.some(x=>x.name==='傷官見官'&&x.huaJie&&x.huaJieShen==='印星'));
assert('財壞印命例',()=>wealthBreaksSeal.some(x=>x.name==='財壞印'));
assert('梟神奪食命例',()=>owlStealsFood.some(x=>x.name==='梟神奪食'));

const legacy={summary:{strength:'原站身弱'},untouched:{value:42}};
const integrated=I.analyzeAlongsideLegacy(sanhe,legacy,{legacyStrengthPath:'summary.strength'});
assert('正式接入層保留舊結果引用',()=>integrated.legacy.result===legacy&&integrated.legacy.result.untouched.value===42);
assert('正式接入層不覆蓋舊引擎',()=>integrated.legacyOverride===false&&integrated.mode==='side-by-side');
assert('原站與通根身強弱分開保存',()=>integrated.comparison.legacyStrength==='原站身弱'&&integrated.comparison.tongGenStrength.strength===integrated.advanced.tongGen.riZhu.strength);
assert('合化原始事件最終值分開保存',()=>!!integrated.comparison.combinationStrength.originalStrength&&Array.isArray(integrated.comparison.combinationStrength.transformEvents)&&!!integrated.comparison.combinationStrength.finalStrength);
assert('調候資料獨立保存',()=>integrated.comparison.tiaoHou===integrated.advanced.tiaoHou);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail>0)process.exit(1);
