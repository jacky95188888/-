/* 天衡・九維命理｜合會局作用裁決 v2.0-alpha
 * 判斷運程新成之五行對月令格局是助格、增忌或待裁；事件與作用分層保存。
 */
(function(root){'use strict';
var WX={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
var KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
function deps(){var p=root.TianhengZipingPattern,c=root.TianhengZipingFortuneCombinations,g=root.TianhengBaziGeJuTiaoHou;if(!p||!c||!g)throw Error('需先載入 pattern、fortune-combinations 與 geju-tiaohou');return {p:p,c:c,g:g};}
function family(dm,q){var d=WX[dm];if(d===q)return '比劫';if(SHENG[d]===q)return '食傷';if(SHENG[q]===d)return '印';if(KE[d]===q)return '財';if(KE[q]===d)return '官殺';return '未知';}
function verdict(pattern,role,strong,weak){var help=[],harm=[];
 if(pattern==='官格'){help=['財','印'];harm=['食傷'];}
 else if(pattern==='財格'){help=['食傷','官殺'];harm=['比劫'];}
 else if(pattern==='印格'){if(strong){help=['財','食傷'];harm=['印'];}else if(weak){help=['官殺','印'];harm=['財'];}else{help=['官殺'];harm=[];}}
 else if(pattern==='食神格'){help=['財'];harm=['印'];}
 else if(pattern==='煞格'){help=['食傷','印'];harm=['財'];}
 else if(pattern==='傷官格'){help=strong?['財']:weak?['印']:['財'];harm=strong?['印','官殺']:['官殺'];}
 else if(pattern==='陽刃格'||pattern==='建祿月劫格'){help=['官殺'];harm=['比劫'];}
 if(help.indexOf(role)>=0)return '助格';if(harm.indexOf(role)>=0)return '增忌';return '待裁';}
function analyze(p,f,options){var d=deps(),strength=options&&options.strength||'未裁定',strong=strength==='身強'||strength==='極強',weak=strength==='身弱'||strength==='極弱',base=d.p.analyze(p,options||{}),comb=d.c.analyze(p,f),pattern=base.basePattern.pattern,events=comb.completedGroups.concat(comb.addedEvents.filter(function(x){return !x.fortuneCompletes;})).concat(comb.stemCombinations.filter(function(x){return x.status==='合化候選';})),seen={},effects=[];
 events.forEach(function(e){var key=e.type+'|'+(e.name||'')+'|'+e.huaQi;if(seen[key]||!e.huaQi||e.huaQi.indexOf('/')>=0)return;seen[key]=1;var role=family(p[2].gan,e.huaQi),v=verdict(pattern,role,strong,weak),codes=[];if(v==='助格')codes.push('COMBINATION_SUPPORTS_PATTERN');if(v==='增忌')codes.push('COMBINATION_STRENGTHENS_ADVERSE_ROLE');effects.push({event:e,transformedElement:e.huaQi,roleFamily:role,pattern:pattern,strengthInput:strength,verdict:v,codes:codes});});
 var fortuneGod=d.g.getTenGod(p[2].gan,f.gan),hasFood=base.evidence.some(function(x){return x.god==='食神'&&x.visible;}),owl=fortuneGod==='偏印'&&hasFood&&effects.some(function(x){return x.roleFamily==='印'&&x.verdict==='增忌';});if(owl)effects.push({event:{type:'運干作用',name:f.gan+'偏印透出'},transformedElement:WX[f.gan],roleFamily:'印',pattern:pattern,strengthInput:strength,verdict:'增忌',codes:['OWL_STEALS_FOOD'],text:'偏印透出，又得印局助勢，制約原局食神'});
 var harmful=effects.filter(function(x){return x.verdict==='增忌';}),helpful=effects.filter(function(x){return x.verdict==='助格';}),overall=harmful.length&&helpful.length?'利弊並見':harmful.length?'增忌破格':helpful.length?'助格引動':effects.length?'作用待裁':'無新增成局';return {engine:'TianhengZipingCombinationEffect',version:'2.0-alpha',fortune:{type:f.type||'流年',gan:f.gan,zhi:f.zhi,god:fortuneGod},basePattern:pattern,strengthInput:strength,combinationEvidence:comb,effects:effects,helpfulEffects:helpful,harmfulEffects:harmful,overall:overall,legacyOverride:false,note:'先保存合會事件，再依格局與身強弱裁作用；合化實際強度仍須另層量化。'};}
function safeAnalyze(p,f,o){try{return {ok:true,result:analyze(p,f,o)};}catch(e){return {ok:false,error:e.message};}}
var api=Object.freeze({analyze:analyze,safeAnalyze:safeAnalyze});if(!root.TianhengZipingCombinationEffect)root.TianhengZipingCombinationEffect=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
