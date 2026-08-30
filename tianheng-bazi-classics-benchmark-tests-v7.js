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
assert('跨模組已完成能力不再誤列缺口',()=>['DT-SHIZHONG-001','DT-SHIZHONG-002','DT-SHIZHONG-003'].every(id=>B.run(id).comparison.status==='match'&&B.run(id).engineSnapshot.derivedCapabilities.includes('FLOW_CHAIN')));

const xue=B.run('ZP-OFFICER-001');
assert('薛相公命辨官格與財印兩輔',()=>xue.comparison.patternMatch&&xue.comparison.matchedCodes.includes('OFFICER_WITH_WEALTH')&&xue.comparison.matchedCodes.includes('OFFICER_WITH_SEAL'));
assert('薛相公財印分隔有情已完成位置裁決',()=>xue.comparison.status==='match'&&xue.engineSnapshot.formation.some(x=>x.code==='POSITIONAL_WEALTH_SEAL_NON_CONFLICT'));
const low=B.run('ZP-OFFICER-002');
assert('雜氣正官依未受絆透干改取官格',()=>low.comparison.status==='match'&&low.engineSnapshot.basePattern==='官格'&&low.engineSnapshot.selectionEvidence.some(x=>x.code==='MIXED_QI_VISIBLE_SELECTION'));
assert('財印相合失輔後保留孤官降層結論',()=>low.engineSnapshot.status==='格成而孤・層次受限'&&low.engineSnapshot.failures.some(x=>x.code==='STEM_COMBINATION_REMOVES_SUPPORT'));
const li=B.run('ZP-OFFICER-005');
assert('乙庚相合可辨合煞留官取清',()=>li.comparison.status==='match'&&li.engineSnapshot.rescues.some(x=>x.code==='STEM_COMBINATION_KEEP_OFFICER_REMOVE_KILL'));
const hidden=B.run('ZP-OFFICER-004');
assert('亥卯未引傷與印制隱傷兩層皆符合古例',()=>hidden.comparison.status==='match'&&hidden.engineSnapshot.failures.some(x=>x.code==='HIDDEN_COMBINATION_HURT')&&hidden.engineSnapshot.rescues.some(x=>x.code==='SEAL_CONTROLS_HIDDEN_HURT')&&hidden.engineSnapshot.branchStructure.hiddenGods.some(x=>x.god==='傷官'));
const ge=B.run('ZP-WEALTH-006');
assert('葛參政命辨財旺生官且財露有官保護',()=>ge.comparison.status==='match'&&ge.comparison.matchedCodes.includes('WEALTH_BIRTH_OFFICER')&&ge.engineSnapshot.formation.some(x=>x.code==='EXPOSED_WEALTH_PROTECTED_BY_OFFICER'));
const yang=B.run('ZP-WEALTH-007');
assert('楊侍郎命一位比肩有食神通化不作奪財',()=>yang.comparison.status==='match'&&yang.engineSnapshot.formation.some(x=>x.code==='SINGLE_PEER_NOT_ROBBING_WEALTH')&&!yang.engineSnapshot.failures.some(x=>x.code==='WEALTH_ROBBED'));
const good=B.run('ZP-WEALTH-008'),bad=B.run('ZP-WEALTH-009');
assert('財印有情與財印相礙不被合併成同一結論',()=>good.humanAnnotation.expectation.requiredCapabilities[0]!==bad.humanAnnotation.expectation.requiredCapabilities[0]);
assert('財印分隔與財印相鄰兩例皆完成位置裁決',()=>good.comparison.status==='match'&&bad.comparison.status==='match'&&good.engineSnapshot.formation.some(x=>x.code==='POSITIONAL_WEALTH_SEAL_NON_CONFLICT')&&bad.engineSnapshot.failures.some(x=>x.code==='POSITIONAL_WEALTH_SEAL_CONFLICT'));
const hurt=B.run('SM-HURT-010');
assert('三命通會傷官反例保留傷官與氣勢兩層',()=>hurt.engineSnapshot.basePattern==='傷官格'&&hurt.engineSnapshot.resolvedPattern==='兩氣成象・火土');
assert('傷官傷盡不自動判成格',()=>hurt.engineSnapshot.status!=='成格'&&hurt.humanAnnotation.expectation.antiRule.includes('不可把'));
assert('火過無財即使傷盡仍判破格並符合古例',()=>hurt.comparison.status==='match'&&hurt.engineSnapshot.failures.some(x=>x.code==='EXCESS_FIRE_NO_WEALTH_OUTLET')&&hurt.engineSnapshot.status==='敗格');
const summary=B.summary();
assert('校準報告不把 partial 與 mismatch 算成通過',()=>summary.total===22&&summary.counts.partial>0&&summary.counts.mismatch>0&&summary.notFullyMatched.length===summary.total-summary.counts.match);
assert('校準層維持 add-only',()=>summary.legacyOverride===false&&B.run('ZP-OFFICER-001').engineSnapshot.legacyOverride===false);

console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail)process.exit(1);
