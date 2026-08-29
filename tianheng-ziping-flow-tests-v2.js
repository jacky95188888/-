'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-ziping-flow-v2.js');
const F=globalThis.TianhengZipingFlow;
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function p(s){return s.map(x=>({gan:x[0],zhi:x[1]}));}
const a=F.analyze(p([['壬','寅'],['甲','辰'],['丁','亥'],['己','酉']]));
const b=F.analyze(p([['戊','戌'],['庚','申'],['癸','亥'],['乙','卯']]));
const c=F.analyze(p([['甲','子'],['丙','寅'],['己','巳'],['辛','未']]));
assert('始終例一形成水木火土金五氣鏈',()=>/水木火土金/.test(a.primaryChain.elements.join(''))&&a.flowState==='五氣接續');
assert('始終例二形成土金水木接續鏈',()=>/土金水木/.test(b.primaryChain.elements.join(''))&&b.primaryChain.elementCoverage.length>=4);
assert('始終例三跨干支形成水木火土金鏈',()=>/水木火土金/.test(c.primaryChain.elements.join(''))&&c.flowState==='五氣接續');
assert('原始加權五行力量獨立保存',()=>Object.keys(a.weightedStrength).length===5&&a.weightedStrength.木>0);
assert('節點保留天干與藏干證據',()=>a.nodes.some(x=>x.layer==='天干')&&a.nodes.some(x=>x.layer==='本氣'));
assert('主鏈保留起點終點與十神',()=>a.primaryChain.source&&a.primaryChain.sink&&a.primaryChain.nodes.every(x=>x.god));
assert('不覆寫舊引擎',()=>a.legacyOverride===false);
assert('錯誤輸入由 safeAnalyze 攔截',()=>F.safeAnalyze([{gan:'甲',zhi:'子'}]).ok===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail)process.exit(1);
