/* 天衡・九維命理｜運程引動總裁決 v2.0-alpha
 * 合併格局成敗、源流與氣勢前後狀態；只輸出證據，不直接生成吉凶罐頭。
 */
(function(root){'use strict';
var GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
var GOD_DOMAIN={正官:'制度／職責',七殺:'壓力／決斷',正財:'資源／收入',偏財:'機會／交易',正印:'學習／支持',偏印:'方法／轉型',食神:'產出／表達',傷官:'突破／表達',比肩:'自主／同儕',劫財:'競爭／合作'};
function deps(){var p=root.TianhengZipingPattern,f=root.TianhengZipingFlow,q=root.TianhengZipingQi,o=root.TianhengZipingOfficerKill,c=root.TianhengZipingFortuneCombinations,e=root.TianhengZipingCombinationEffect;if(!p||!f||!q||!o||!c||!e)throw Error('需先載入二階格局、源流、氣勢、官殺、合會與作用裁決模組');return {p:p,f:f,q:q,o:o,c:c,e:e};}
function valid(p,f){if(!Array.isArray(p)||p.length!==4||p.some(function(x){return !x||GAN.indexOf(x.gan)<0||ZHI.indexOf(x.zhi)<0;}))throw Error('需要有效完整四柱');if(!f||GAN.indexOf(f.gan)<0||ZHI.indexOf(f.zhi)<0)throw Error('運程干支無效');}
function add(xs,x){if(xs.indexOf(x)<0)xs.push(x);}
function dimensionEvidence(t){var career=[],relationship=[];t.transition.relations.forEach(function(r){if(r.targetPillarIndex===1)career.push({code:'MONTH_'+r.type,text:'運支'+r.type+'月支，工作環境與制度位置受動',relation:r});if(r.targetPillarIndex===2)relationship.push({code:'DAY_'+r.type,text:'運支'+r.type+'日支，伴侶／互動宮位受動',relation:r});});career.push({code:'FORTUNE_GOD',text:'運干十神為'+t.fortune.god+'，主要議題偏向'+(GOD_DOMAIN[t.fortune.god]||'待覆核'),god:t.fortune.god});return {career:career,relationship:relationship};}
function analyze(pillars,fortune,options){valid(pillars,fortune);var d=deps(),pt=d.p.analyzeFortune(pillars,fortune,options||{}),ft=d.f.analyzeFortune(pillars,fortune),qt=d.q.analyzeFortune(pillars,fortune),ot=d.o.analyzeFortune(pillars,fortune),ct=d.c.analyze(pillars,fortune),ce=d.e.analyze(pillars,fortune,options||{}),qb=qt.before,qa=qt.after,rawTypes=pt.transition.types.slice(),types=rawTypes.slice(),qiEvent=null,conflicts=[];
 if(qb.qualifies&&(!qa.qualifies||qa.pattern!==qb.pattern)){add(types,'被破壞');qiEvent={type:'氣勢破象',before:qb.pattern,after:qa.pattern,reason:'運程加入後原有成象條件不再成立或改變'};}
 else if(!qb.qualifies&&qa.qualifies){add(types,'被重塑');qiEvent={type:'氣勢成象',before:null,after:qa.pattern,reason:'運程加入後形成高純度相生氣勢'};}
 else if(qb.qualifies&&qa.qualifies&&qa.pattern===qb.pattern)qiEvent={type:'氣勢延續',before:qb.pattern,after:qa.pattern,reason:'運程未破壞原有成象條件'};
 if(ot.after.resolvedToPure&&pt.transition.newFailures.length&&pt.transition.newFailures.every(function(x){return x.code==='OFFICER_HURT';})){types=types.filter(function(x){return x!=='被破壞';});add(types,'被重塑');conflicts.push({rawRule:'OFFICER_HURT',resolvedBy:ot.after.events[0].code,decision:ot.after.events[0].type,reason:'官殺並見時，傷官制官可構成去官留殺，不能沿用單一官格結論'});}
 if(ct.addedEvents.length||ct.brokenBindings.length||ct.stemCombinations.length)add(types,'被重塑');
 if(ce.harmfulEffects.length)add(types,'被破壞');if(ce.helpfulEffects.length)add(types,'被引動');types=types.filter(function(x,i,a){return x!=='格局延續'||a.length===1;});
 var dims=dimensionEvidence(pt);return {engine:'TianhengZipingFortune',version:'2.0-alpha',mode:'evidence-first',fortune:pt.fortune,original:{pattern:pt.base,flow:ft.before,qi:qb,officerKill:ot.before,combinationEvents:ct.originalEvents},afterFortune:{pattern:pt.after,flow:ft.after,qi:qa,officerKill:ot.after,combinationEvents:ct.afterEvents},transition:{types:types,rawTypes:rawTypes,pattern:pt.transition,flow:{changed:ft.flowChanged,deltaStrength:ft.deltaStrength},qi:qiEvent,combinations:ct,combinationEffects:ce,conflictResolutions:conflicts},adviceEvidence:dims,adviceGenerated:false,legacyOverride:false,notes:['原局與運後資料分開保存','底層傷官見官證據不刪除，由官殺清純層記錄去留裁決','成局事件與助格／增忌作用分開保存']};}
function safeAnalyze(p,f,o){try{return {ok:true,result:analyze(p,f,o)};}catch(e){return {ok:false,error:e.message};}}
var api=Object.freeze({analyze:analyze,safeAnalyze:safeAnalyze});if(!root.TianhengZipingFortune)root.TianhengZipingFortune=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
