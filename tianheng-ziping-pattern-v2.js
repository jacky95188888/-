/* 天衡・九維命理｜子平格局動態引擎 v2.0-alpha｜add-only
 * 骨幹：《子平真詮》月令用神、順用逆用、成敗救應。
 * 本模組輸出可追查規則，不以分數取代格局裁定。
 */
(function(root){'use strict';
var GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
var CHONG={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
var LIUHE={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
var GROUP={正官:'官格',七殺:'煞格',正財:'財格',偏財:'財格',正印:'印格',偏印:'印格',食神:'食神格',傷官:'傷官格',比肩:'建祿月劫格',劫財:'建祿月劫格'};
function deps(){var a=root.TianhengBaziAdvanced,g=root.TianhengBaziGeJuTiaoHou;if(!a||!g)throw Error('需先載入 advanced 與 geju-tiaohou');return {a:a,g:g};}
function validate(p){if(!Array.isArray(p)||p.length!==4)throw Error('需要完整四柱');p.forEach(function(x,i){if(!x||GAN.indexOf(x.gan)<0||ZHI.indexOf(x.zhi)<0)throw Error('第'+(i+1)+'柱干支無效');});return p;}
function facts(p){var d=deps(),dm=p[2].gan,items=[];p.forEach(function(x,i){if(i!==2)items.push({source:'天干',pillarIndex:i,gan:x.gan,god:d.g.getTenGod(dm,x.gan),visible:true,layer:null});d.a.getCangGan(x.zhi).forEach(function(c){items.push({source:'藏干',pillarIndex:i,zhi:x.zhi,gan:c.gan,god:d.g.getTenGod(dm,c.gan),visible:false,layer:c.type,weight:c.weight});});});return items;}
function has(fs,god,visible){return fs.some(function(x){return x.god===god&&(!visible||x.visible);});}
function any(fs,gods,visible){return gods.some(function(g){return has(fs,g,visible);});}
function entries(fs,gods){return fs.filter(function(x){return gods.indexOf(x.god)>=0;});}
function monthClash(p){var m=p[1].zhi,hits=[];p.forEach(function(x,i){if(i!==1&&CHONG[m]===x.zhi)hits.push({pillarIndex:i,zhi:x.zhi});});return hits;}
function candidateList(p,fs){var d=deps(),layers=d.a.getCangGan(p[1].zhi),visible=[p[0].gan,p[1].gan,p[3].gan];return layers.map(function(c,i){var god=d.g.getTenGod(p[2].gan,c.gan),special=(god==='比肩'||god==='劫財');return {priority:i+1,gan:c.gan,god:god,layer:c.type,weight:c.weight,visible:visible.indexOf(c.gan)>=0,pattern:special?(god==='劫財'?'月劫／刃候選':'建祿候選'):(GROUP[god]||god+'格')};});}
function push(arr,code,text,evidence){if(!arr.some(function(x){return x.code===code;}))arr.push({code:code,text:text,evidence:evidence||[]});}
function evaluate(pattern,p,fs,strength){var ok=[],bad=[],save=[],variant='';
 var strong=strength==='身強'||strength==='極強',weak=strength==='身弱'||strength==='極弱';
 var officer=has(fs,'正官',true),kill=has(fs,'七殺',true),wealth=any(fs,['正財','偏財'],true),seal=any(fs,['正印','偏印'],true),food=has(fs,'食神',true),hurt=has(fs,'傷官',true),output=food||hurt,peer=any(fs,['比肩','劫財'],true);
 var clashes=monthClash(p);if(clashes.length)push(bad,'MONTH_CLASH','月令受沖，格局骨架不穩',clashes);
 if(pattern==='官格'){
   if(wealth){push(ok,'OFFICER_WITH_WEALTH','財星生官，官格得輔');variant='財生官';}
   if(seal){push(ok,'OFFICER_WITH_SEAL','印星化官生身，官印相生');if(!variant)variant='官印相生';}
   if(!wealth&&!seal)push(bad,'OFFICER_NO_SUPPORT','官格未見財印相輔');
   if(hurt)push(bad,'OFFICER_HURT','傷官剋官，為官格之病');
   if(hurt&&seal)push(save,'SEAL_CONTROLS_HURT','印星制傷護官，可救傷官之病');
   if(officer&&entries(fs,['正官']).filter(function(x){return x.visible;}).length>1)push(bad,'OFFICER_MIXED','官星重見，清純度下降');
 }
 else if(pattern==='財格'){
   if(officer){push(ok,'WEALTH_BIRTH_OFFICER','財旺生官');variant='財旺生官';}
   if(food&&strong){push(ok,'FOOD_BIRTH_WEALTH','身有承擔，食神生財');variant=variant||'食神生財';}
   if(seal){push(ok,'WEALTH_WITH_SEAL','財印同見，須察位置是否相礙');variant=variant||'財格佩印';}
   if(peer&&!food)push(bad,'WEALTH_ROBBED','比劫見而無食神通化，財有被分奪之病');
   if(kill)push(bad,'WEALTH_FEEDS_KILL','財透煞，財轉而黨煞');
   if(peer&&food)push(save,'FOOD_TRANSFORMS_PEER','食神洩比劫而轉生財，可解奪財之病');
   if(kill&&seal)push(save,'SEAL_TRANSFORMS_KILL','印星可化煞生身，須再察財印是否相礙');
 }
 else if(pattern==='印格'){
   if(kill&&!strong){push(ok,'KILL_BIRTH_SEAL','印輕逢煞，煞印相生');variant='煞印相生';}
   if(officer){push(ok,'OFFICER_BIRTH_SEAL','官印雙全');variant=variant||'官印相生';}
   if(strong&&output){push(ok,'STRONG_SEAL_OUTPUT','身印兩旺，以食傷洩秀');variant=variant||'印旺洩秀';}
   if(strong&&wealth){push(ok,'MUCH_SEAL_LIGHT_WEALTH','印多身旺，財星裁印');variant=variant||'財裁旺印';}
   if(weak&&wealth)push(bad,'LIGHT_SEAL_MEETS_WEALTH','身弱印輕而逢財，印受財破');
   if(strong&&kill&&!output&&!wealth)push(bad,'STRONG_SEAL_MORE_KILL','身強印重再逢煞生印，旺而無洩');
   if(wealth&&peer)push(save,'PEER_RESCUES_SEAL','比劫制財護印，可救財壞印');
 }
 else if(pattern==='食神格'){
   if(wealth){push(ok,'FOOD_BIRTH_WEALTH','食神生財');variant='食神生財';}
   if(kill&&!wealth){push(ok,'FOOD_CONTROLS_KILL','食神帶煞而無財，食神制煞');variant=variant||'食神制煞';}
   if(seal)push(bad,'OWL_STEALS_FOOD','梟印見食，食神受制');
   if(wealth&&kill)push(bad,'WEALTH_FEEDS_KILL','食神生財又露煞，財轉生煞');
   if(seal&&kill&&!wealth)push(save,'ABANDON_FOOD_USE_KILL_SEAL','煞印俱透而無財，可棄食就煞、以印化煞');
 }
 else if(pattern==='煞格'){
   if(strong&&food){push(ok,'FOOD_CONTROLS_KILL','身強煞逢食制');variant='食神制煞';}
   if(weak&&seal){push(ok,'SEAL_TRANSFORMS_KILL','身弱以印化煞生身');variant=variant||'煞印相生';}
   if(wealth&&!food&&!seal)push(bad,'WEALTH_FEEDS_UNCONTROLLED_KILL','財生煞而無制化');
   if(wealth&&(food||seal))push(save,'KILL_HAS_CONTROL','煞雖得財生，仍有食制或印化可救');
   if(!food&&!seal)push(bad,'KILL_NO_CONTROL','七煞未見制化');
 }
 else if(pattern==='傷官格'){
   if(strong&&wealth){push(ok,'HURT_BIRTH_WEALTH','身強傷官生財');variant='傷官生財';}
   if(weak&&seal){push(ok,'HURT_WITH_SEAL','身弱傷旺，印有根以制傷生身');variant=variant||'傷官佩印';}
   if(kill&&!wealth){push(ok,'HURT_CONTROLS_KILL','傷官帶煞而無財，可制煞');variant=variant||'傷官駕煞';}
   if(officer)push(bad,'HURT_MEETS_OFFICER','傷官見官，為格局之病');
   if(officer&&wealth)push(save,'WEALTH_MEDIATES_HURT_OFFICER','財星位置得宜時，可通傷官生官之氣');
   if(officer&&seal)push(save,'SEAL_CONTROLS_HURT','印星制傷，可護官救應');
   if(strong&&seal&&!wealth)push(bad,'LIGHT_HURT_HEAVY_SEAL','身旺傷輕又見印，傷官秀氣受制');
   if(wealth&&kill)push(bad,'HURT_WEALTH_FEEDS_KILL','傷官生財又帶煞，財轉而生煞');
 }
 else if(pattern==='陽刃格'){
   if(officer||kill){push(ok,'OFFICER_KILL_CONTROLS_BLADE','官煞制刃');variant=officer?'官制陽刃':'煞制陽刃';}
   else push(bad,'BLADE_NO_CONTROL','陽刃未見官煞制伏');
   if((officer||kill)&&wealth&&seal)push(ok,'BLADE_WITH_WEALTH_SEAL','財印並見，輔助官煞制刃');
   if(officer&&hurt)push(bad,'HURT_BREAKS_OFFICER','傷官損官，失去制刃之神');
   if(kill&&has(fs,'劫財',true))push(save,'ROBBER_COMBINES_KILL','若劫財合煞得宜，可減煞刃相戰，須察位置');
 }
 else if(pattern==='建祿月劫格'){
   if(officer&&(wealth||seal)){push(ok,'LU_MONTH_USE_OFFICER','透官而逢財印');variant='祿劫用官';}
   if(wealth&&output){push(ok,'LU_MONTH_USE_WEALTH','透財而逢食傷');variant=variant||'祿劫用財';}
   if(kill&&food){push(ok,'LU_MONTH_USE_KILL','透煞而遇食神制伏');variant=variant||'祿劫用煞';}
   if(!officer&&!wealth&&!kill)push(bad,'LU_MONTH_NO_WEALTH_OFFICER','建祿月劫未見財官煞可用');
   if(kill&&seal&&!food)push(bad,'LU_MONTH_KILL_SEAL_NO_CONTROL','煞印相生而無制，日主更旺');
 }
 return {variant:variant||pattern,supports:ok,failures:bad,rescues:save};
}
function chooseBase(p,candidates){var d=deps(),dm=p[2].gan,main=candidates[0],god=main.god,pattern=GROUP[god]||main.pattern;if(god==='劫財')pattern=(dm==='甲'||dm==='丙'||dm==='戊'||dm==='庚'||dm==='壬')?'陽刃格':'建祿月劫格';else if(god==='比肩')pattern='建祿月劫格';return {monthBranch:p[1].zhi,monthMainGan:main.gan,monthMainGod:god,pattern:pattern,layer:main.layer,visible:main.visible};}
function statusOf(ev){var o=ev.supports.length>0,b=ev.failures.length>0,s=ev.rescues.length>0;if(o&&!b)return '成格';if(o&&b&&s)return '成中有敗・敗中有救';if(o&&b)return '成中有敗';if(!o&&b&&s)return '敗中有救';if(!o&&b)return '敗格';return '格局待定';}
function analyze(pillars,options){var p=validate(pillars),fs=facts(p),candidates=candidateList(p,fs),base=chooseBase(p,candidates),strength=options&&options.strength||'未裁定',ev=evaluate(base.pattern,p,fs,strength),status=statusOf(ev);return {engine:'TianhengZipingPattern',version:'2.0-alpha',mode:'add-only',sourceFramework:['子平真詮・月令用神','子平真詮・成敗救應'],pillars:p.map(function(x){return {gan:x.gan,zhi:x.zhi};}),strengthInput:strength,candidates:candidates,basePattern:base,variant:ev.variant,status:status,formation:ev.supports,failures:ev.failures,rescues:ev.rescues,patternGod:{god:base.monthMainGod,gan:base.monthMainGan},dynamicSkeleton:{monthCommand:base.monthBranch,base:base.pattern,variant:ev.variant,condition:status},evidence:fs,legacyOverride:false,notes:['此為原局格局裁定 alpha；古例驗證庫將由後續模組加入','不以單一分數判定上格或下格','所有成立、失敗與救應均保留規則代碼供回歸測試與老師覆核']};}
function codeSet(xs){var o={};xs.forEach(function(x){o[x.code]=1;});return o;}
function added(after,before){var b=codeSet(before);return after.filter(function(x){return !b[x.code];});}
function fortuneFacts(p,fortune){var d=deps(),dm=p[2].gan,out=[{source:fortune.type||'運',pillarIndex:4,gan:fortune.gan,god:d.g.getTenGod(dm,fortune.gan),visible:true,layer:null,fortune:true}];d.a.getCangGan(fortune.zhi).forEach(function(c){out.push({source:(fortune.type||'運')+'藏干',pillarIndex:4,zhi:fortune.zhi,gan:c.gan,god:d.g.getTenGod(dm,c.gan),visible:false,layer:c.type,weight:c.weight,fortune:true});});return out;}
function fortuneRelations(p,fortune){var out=[];p.forEach(function(x,i){if(CHONG[x.zhi]===fortune.zhi)out.push({type:'沖',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:fortune.zhi});if(LIUHE[x.zhi]===fortune.zhi)out.push({type:'合',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:fortune.zhi});if(x.zhi===fortune.zhi)out.push({type:'伏吟',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:fortune.zhi});});return out;}
function validateFortune(f){if(!f||GAN.indexOf(f.gan)<0||ZHI.indexOf(f.zhi)<0)throw Error('運程干支無效');return f;}
function analyzeFortune(pillars,fortune,options){var p=validate(pillars),f=validateFortune(fortune),baseResult=analyze(p,options),fs=baseResult.evidence.concat(fortuneFacts(p,f)),ev=evaluate(baseResult.basePattern.pattern,p,fs,baseResult.strengthInput),relations=fortuneRelations(p,f);if(CHONG[p[1].zhi]===f.zhi)push(ev.failures,'FORTUNE_CLASH_MONTH','運支沖月令，原格局骨架受動',relations.filter(function(x){return x.targetPillarIndex===1;}));var status=statusOf(ev),newSupport=added(ev.supports,baseResult.formation),newFailure=added(ev.failures,baseResult.failures),newRescue=added(ev.rescues,baseResult.rescues),types=[];if(newSupport.length)types.push('被引動');if(newFailure.length)types.push('被破壞');if(newRescue.length)types.push('獲得救應');if(ev.variant!==baseResult.variant)types.push('被重塑');if(!types.length&&relations.length)types.push('宮位被引動');if(!types.length)types.push('格局延續');return {engine:'TianhengZipingPatternFortune',version:'2.0-alpha',mode:'dynamic-transition',fortune:{type:f.type||'流年',gan:f.gan,zhi:f.zhi,god:deps().g.getTenGod(p[2].gan,f.gan)},base:{pattern:baseResult.basePattern.pattern,variant:baseResult.variant,status:baseResult.status},after:{pattern:baseResult.basePattern.pattern,variant:ev.variant,status:status,formation:ev.supports,failures:ev.failures,rescues:ev.rescues},transition:{types:types,newFormation:newSupport,newFailures:newFailure,newRescues:newRescue,relations:relations},legacyOverride:false,notes:['運程加入後重新檢查原局成敗救應','原局 base 與加入運程後 after 分開保存，不覆寫原局']};}
function safeAnalyzeFortune(p,f,o){try{return {ok:true,data:analyzeFortune(p,f,o),error:null};}catch(e){return {ok:false,data:null,error:String(e&&e.message||e)};}}
function safeAnalyze(p,o){try{return {ok:true,data:analyze(p,o),error:null};}catch(e){return {ok:false,data:null,error:String(e&&e.message||e)};}}
var api=Object.freeze({analyze:analyze,safeAnalyze:safeAnalyze,analyzeFortune:analyzeFortune,safeAnalyzeFortune:safeAnalyzeFortune});if(!root.TianhengZipingPattern)root.TianhengZipingPattern=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
