'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-ziping-qi-v2.js');
require('./tianheng-ziping-pattern-v2.js');
require('./tianheng-ziping-flow-v2.js');
require('./tianheng-ziping-officer-kill-v2.js');
require('./tianheng-bazi-combinations-v1.js');
require('./tianheng-ziping-fortune-combinations-v2.js');
require('./tianheng-ziping-combination-effect-v2.js');
require('./tianheng-ziping-fortune-v2.js');
require('./tianheng-ziping-classics-v2.js');
const C=globalThis.TianhengZipingClassics;
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}

assert('兩批古例共十二例',()=>C.CASES.length===12);
assert('每例都有原文定位與引擎解讀',()=>C.audit().every(x=>x.ok));
assert('古書摘要與引擎解讀分欄',()=>C.CASES.every(x=>x.ancientSummary&&x.interpretationNote&&x.ancientSummary!==x.interpretationNote));
assert('每例四柱完整',()=>C.CASES.every(x=>x.pillars.length===4&&x.pillars.every(p=>p.length===2)));
assert('每例標明覆蓋或缺口',()=>C.CASES.every(x=>['supported','partial','gap'].includes(x.engineExpectation.coverage)));

const c1=C.run('DT-SHIZHONG-001',{strength:'身中和'});
const c2=C.run('DT-SHIZHONG-002',{strength:'身中和'});
const c3=C.run('DT-SHIZHONG-003',{strength:'身中和'});
assert('始終例一辨傷官月令骨架',()=>c1.coverage.resolvedPatternMatches&&c1.engine.basePattern==='傷官格');
assert('始終例二辨印格骨架',()=>c2.coverage.resolvedPatternMatches&&c2.engine.basePattern==='印格');
assert('始終例三辨官格骨架',()=>c3.coverage.resolvedPatternMatches&&c3.engine.basePattern==='官格');
assert('三個始終古例已補上源流鏈',()=>[c1,c2,c3].every(x=>x.engine.flow&&x.engine.flow.primaryChain.elementCoverage.length>=4));
assert('源流鏈完成後移除既有缺口碼',()=>[c1,c2,c3].every(x=>!x.coverage.gaps.includes('FLOW_CHAIN')));

const image1=C.run('DT-XIANG-004',{strength:'身強'});
const image2=C.run('DT-XIANG-005',{strength:'身強'});
const image3=C.run('DT-XIANG-006',{strength:'身強'});
assert('木火兩氣例保留常格並覆核成象',()=>image1.engine.basePattern==='陽刃格'&&image1.engine.resolvedPattern==='兩氣成象・木火'&&image1.coverage.resolvedPatternMatches);
assert('炎上例保留月劫並覆核炎上',()=>image2.engine.basePattern==='建祿月劫格'&&image2.engine.resolvedPattern==='炎上格'&&image2.coverage.resolvedPatternMatches);
assert('火土兩氣例保留食神並覆核成象',()=>image3.engine.basePattern==='食神格'&&image3.engine.resolvedPattern==='兩氣成象・火土'&&image3.coverage.resolvedPatternMatches);
assert('古例執行保留來源',()=>image1.source.book==='滴天髓闡微'&&image1.source.url.startsWith('https://zh.wikisource.org/'));

const second=C.CASES.slice(6);
assert('第二批每例都有運程對照',()=>second.every(x=>Array.isArray(x.fortuneExamples)&&x.fortuneExamples.length>0));
assert('第二批保留古註效果與引擎解讀',()=>second.every(x=>x.fortuneExamples.every(f=>f.ancientEffect&&f.expected)&&x.interpretationNote));
const mixed=C.runFortune('DT-GUANSHA-009',0,{strength:'身中和'});
assert('官殺去留規則補齊後方向符合古註',()=>mixed.comparison.matched&&mixed.engine.types.includes('被重塑'));
const hurtBreak=C.runFortune('DT-SHANGGUAN-011',1,{strength:'身中和'});
assert('酉運沖卯可辨運程破壞',()=>hurtBreak.engine.types.includes('被破壞')&&hurtBreak.comparison.matched);
const flowGap=C.run('DT-YUANLIU-007',{strength:'身中和'});
assert('斷流例能辨元素缺口',()=>flowGap.engine.flow.blockedTransitions.some(x=>x.from==='火'&&x.to==='土'));
const woodTransform=C.runFortune('DT-YUANLIU-008',1,{strength:'身強'});
assert('丁亥運辨干支共同引木並判重塑',()=>woodTransform.comparison.matched&&woodTransform.engine.combinations.stemCombinations.some(x=>x.name==='丁壬合木'));
const fireExcess=C.runFortune('DT-YUANLIU-008',0,{strength:'身強'});
assert('火局增印辨梟神奪食並符合破壞方向',()=>fireExcess.comparison.matched&&fireExcess.engine.combinationEffects.effects.some(x=>x.codes.includes('OWL_STEALS_FOOD')));
assert('合化方向完成但強度仍列待量化',()=>fireExcess.gapCodes.includes('COMBINATION_TRANSFORM_STRENGTH'));
assert('命例不因未覆蓋而偽稱一致',()=>second.some(x=>x.engineExpectation.coverage==='gap'));

console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail)process.exit(1);
