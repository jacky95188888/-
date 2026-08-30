'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-ziping-qi-v2.js');
require('./tianheng-ziping-pattern-v2.js');
require('./tianheng-ziping-flow-v2.js');
require('./tianheng-ziping-classics-v2.js');
require('./tianheng-bazi-classics-benchmark-v7.js');
const B=globalThis.TianhengBaziClassicsBenchmarkV7;
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}

assert('既有十二例與新增十例共同校準',()=>B.cases().length===22&&B.NEW_CASES.length===10);
assert('三部古籍都在校準庫',()=>['滴天髓闡微','子平真詮評注','三命通會'].every(book=>B.cases().some(c=>c.book===book)));
assert('全部案例通過來源與標註稽核',()=>B.audit().every(x=>x.ok));
assert('來源指紋可重算且未被竄改',()=>B.cases().every(c=>B.fingerprint(c.sourceExcerpt)===c.sourceFingerprint));
assert('來源、人工標註、引擎快照與比對四層分開',()=>{const x=B.run('ZP-OFFICER-001');return x.source&&x.humanAnnotation&&x.engineSnapshot&&x.comparison;});
assert('人工標註不被引擎結果覆寫',()=>{const c=B.get('ZP-OFFICER-002'),before=JSON.stringify(c.humanExpectation),r=B.run(c.id);return before===JSON.stringify(c.humanExpectation)&&r.humanAnnotation.expectation!==r.engineSnapshot;});

const xue=B.run('ZP-OFFICER-001');
assert('薛相公命辨官格與財印兩輔',()=>xue.comparison.patternMatch&&xue.comparison.matchedCodes.includes('OFFICER_WITH_WEALTH')&&xue.comparison.matchedCodes.includes('OFFICER_WITH_SEAL'));
assert('尚未辨財印位置時只標 partial',()=>xue.comparison.status==='partial'&&xue.comparison.missingCapabilities.includes('POSITIONAL_WEALTH_SEAL_NON_CONFLICT'));
const low=B.run('ZP-OFFICER-002');
assert('雜氣正官反例如實暴露月令選格差異',()=>low.comparison.status==='mismatch'&&low.engineSnapshot.basePattern!=='官格');
assert('戊日未月不再誤標陽刃',()=>low.engineSnapshot.basePattern==='建祿月劫格');
const li=B.run('ZP-OFFICER-005');
assert('合煞留官仍保留缺口而不偽稱一致',()=>li.comparison.status==='partial'&&li.comparison.missingCapabilities.includes('STEM_COMBINATION_KEEP_OFFICER_REMOVE_KILL'));
const ge=B.run('ZP-WEALTH-006');
assert('葛參政命辨財旺生官',()=>ge.comparison.patternMatch&&ge.comparison.matchedCodes.includes('WEALTH_BIRTH_OFFICER'));
const good=B.run('ZP-WEALTH-008'),bad=B.run('ZP-WEALTH-009');
assert('財印有情與財印相礙不被合併成同一結論',()=>good.humanAnnotation.expectation.requiredCapabilities[0]!==bad.humanAnnotation.expectation.requiredCapabilities[0]);
assert('位置裁決未完成前兩例都只標 partial',()=>good.comparison.status==='partial'&&bad.comparison.status==='partial');
const hurt=B.run('SM-HURT-010');
assert('三命通會傷官反例保留傷官與氣勢兩層',()=>hurt.engineSnapshot.basePattern==='傷官格'&&hurt.engineSnapshot.resolvedPattern==='兩氣成象・火土');
assert('傷官傷盡不自動判成格',()=>hurt.engineSnapshot.status!=='成格'&&hurt.humanAnnotation.expectation.antiRule.includes('不可把'));
assert('火過無財規則缺口清楚列出',()=>hurt.comparison.status==='partial'&&hurt.comparison.missingCapabilities.includes('EXCESS_FIRE_NO_WEALTH_OUTLET'));
const summary=B.summary();
assert('校準報告不把 partial 與 mismatch 算成通過',()=>summary.total===22&&summary.counts.partial>0&&summary.counts.mismatch>0&&summary.notFullyMatched.length===summary.total-summary.counts.match);
assert('校準層維持 add-only',()=>summary.legacyOverride===false&&B.run('ZP-OFFICER-001').engineSnapshot.legacyOverride===false);

console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail)process.exit(1);
