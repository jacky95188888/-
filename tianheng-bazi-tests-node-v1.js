'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-combinations-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-bazi-quality-v1.js');
require('./tianheng-bazi-engine-v1.js');

const A=globalThis.TianhengBaziAdvanced;
const C=globalThis.TianhengBaziCombinations;
const G=globalThis.TianhengBaziGeJuTiaoHou;
const E=globalThis.TianhengBaziEngine;
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
console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail>0)process.exit(1);
