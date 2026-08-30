/* 天衡・九維命理｜子平格局動態引擎 v2.0-alpha｜add-only
 * 骨幹：《子平真詮》月令用神、順用逆用、成敗救應。
 * 本模組輸出可追查規則，不以分數取代格局裁定。
 */
(function(root){'use strict';
var GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
var CHONG={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
var LIUHE={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
var YANG_BLADE_BRANCH={甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
var STORAGE_BRANCH='辰戌丑未';
var STEM_COMBOS=[{g:['甲','己'],q:'土'},{g:['乙','庚'],q:'金'},{g:['丙','辛'],q:'水'},{g:['丁','壬'],q:'木'},{g:['戊','癸'],q:'火'}];
var WXGAN={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
var BRANCH_GROUPS=[{type:'三合',zhi:['申','子','辰'],huaQi:'水'},{type:'三合',zhi:['亥','卯','未'],huaQi:'木'},{type:'三合',zhi:['寅','午','戌'],huaQi:'火'},{type:'三合',zhi:['巳','酉','丑'],huaQi:'金'},{type:'三會',zhi:['寅','卯','辰'],huaQi:'木'},{type:'三會',zhi:['巳','午','未'],huaQi:'火'},{type:'三會',zhi:['申','酉','戌'],huaQi:'金'},{type:'三會',zhi:['亥','子','丑'],huaQi:'水'}];
var GROUP={正官:'官格',七殺:'煞格',正財:'財格',偏財:'財格',正印:'印格',偏印:'印格',食神:'食神格',傷官:'傷官格',比肩:'建祿月劫格',劫財:'建祿月劫格'};
function deps(){var a=root.TianhengBaziAdvanced,g=root.TianhengBaziGeJuTiaoHou;if(!a||!g)throw Error('需先載入 advanced 與 geju-tiaohou');return {a:a,g:g};}
function validate(p){if(!Array.isArray(p)||p.length!==4)throw Error('需要完整四柱');p.forEach(function(x,i){if(!x||GAN.indexOf(x.gan)<0||ZHI.indexOf(x.zhi)<0)throw Error('第'+(i+1)+'柱干支無效');});return p;}
function facts(p){var d=deps(),dm=p[2].gan,items=[];p.forEach(function(x,i){if(i!==2)items.push({source:'天干',pillarIndex:i,gan:x.gan,god:d.g.getTenGod(dm,x.gan),visible:true,layer:null});d.a.getCangGan(x.zhi).forEach(function(c){items.push({source:'藏干',pillarIndex:i,zhi:x.zhi,gan:c.gan,god:d.g.getTenGod(dm,c.gan),visible:false,layer:c.type,weight:c.weight});});});return items;}
function has(fs,god,visible){return fs.some(function(x){return x.god===god&&(!visible||x.visible);});}
function any(fs,gods,visible){return gods.some(function(g){return has(fs,g,visible);});}
function entries(fs,gods){return fs.filter(function(x){return gods.indexOf(x.god)>=0;});}
function stemStructure(p){var d=deps(),dm=p[2].gan,bindings=[];for(var i=0;i<4;i++)for(var j=i+1;j<4;j++)STEM_COMBOS.forEach(function(c){if(c.g.indexOf(p[i].gan)<0||c.g.indexOf(p[j].gan)<0||p[i].gan===p[j].gan)return;var adjacent=j-i===1,gods=[d.g.getTenGod(dm,p[i].gan),d.g.getTenGod(dm,p[j].gan)];bindings.push({type:'天干五合',name:c.g.join('')+'合'+c.q,gan:[p[i].gan,p[j].gan],pillars:[i,j],gods:gods,huaQi:c.q,adjacent:adjacent,involvesDayMaster:i===2||j===2,constrainsSupport:adjacent&&i!==2&&j!==2,status:adjacent?'相鄰合絆':'遙合候選'});});var constrained=[];bindings.filter(function(x){return x.constrainsSupport;}).forEach(function(x){x.pillars.forEach(function(i){if(constrained.indexOf(i)<0)constrained.push(i);});});var visible=[];p.forEach(function(x,i){if(i!==2)visible.push({pillarIndex:i,gan:x.gan,god:d.g.getTenGod(dm,x.gan)});});var wealth=visible.filter(function(x){return x.god==='正財'||x.god==='偏財';}),seal=visible.filter(function(x){return x.god==='正印'||x.god==='偏印';}),wealthSealRelations=[];wealth.forEach(function(w){seal.forEach(function(s){var distance=Math.abs(w.pillarIndex-s.pillarIndex);wealthSealRelations.push({wealth:w,seal:s,distance:distance,relation:distance===1?'相礙':'分隔有情',separatorPillars:Array.from({length:Math.max(0,distance-1)},function(_,k){return Math.min(w.pillarIndex,s.pillarIndex)+k+1;})});});});return {bindings:bindings,constrainedPillars:constrained,wealthSealRelations:wealthSealRelations};}
function branchStructure(p){var d=deps(),dm=p[2].gan,zs=p.map(function(x){return x.zhi;}),groups=[];BRANCH_GROUPS.forEach(function(g){if(!g.zhi.every(function(z){return zs.indexOf(z)>=0;}))return;var monthLayers=d.a.getCangGan(p[1].zhi),representative=monthLayers.find(function(x){return x.wuxing===g.huaQi;});if(!representative){for(var i=0;i<g.zhi.length&&!representative;i++)representative=d.a.getCangGan(g.zhi[i]).find(function(x){return x.wuxing===g.huaQi;});}groups.push({type:g.type,name:g.zhi.join('')+g.type+g.huaQi+'局',zhi:g.zhi.slice(),indices:g.zhi.map(function(z){return zs.indexOf(z);}),huaQi:g.huaQi,representativeGan:representative&&representative.gan||null,inducedGod:representative?d.g.getTenGod(dm,representative.gan):null,source:'地支成局引出藏干十神'});});return {groups:groups,hiddenGods:groups.filter(function(x){return !!x.inducedGod;}).map(function(x){return {god:x.inducedGod,gan:x.representativeGan,huaQi:x.huaQi,event:x.name,indices:x.indices.slice()};})};}
function elementStrengths(p){var d=deps(),s={木:0,火:0,土:0,金:0,水:0};p.forEach(function(x){s[WXGAN[x.gan]]+=1;d.a.getCangGan(x.zhi).forEach(function(c){s[c.wuxing]+=c.weight;});});Object.keys(s).forEach(function(k){s[k]=+s[k].toFixed(4);});return s;}
function monthClash(p){var m=p[1].zhi,hits=[];p.forEach(function(x,i){if(i!==1&&CHONG[m]===x.zhi)hits.push({pillarIndex:i,zhi:x.zhi});});return hits;}
function candidateList(p,fs){var d=deps(),layers=d.a.getCangGan(p[1].zhi),visible=[p[0].gan,p[1].gan,p[3].gan];return layers.map(function(c,i){var god=d.g.getTenGod(p[2].gan,c.gan),special=(god==='比肩'||god==='劫財'),visiblePillars=[];p.forEach(function(x,pi){if(pi!==2&&x.gan===c.gan)visiblePillars.push(pi);});return {priority:i+1,gan:c.gan,god:god,layer:c.type,weight:c.weight,visible:visible.indexOf(c.gan)>=0,visiblePillars:visiblePillars,pattern:special?(god==='劫財'?'月劫／刃候選':'建祿候選'):(GROUP[god]||god+'格')};});}
function push(arr,code,text,evidence){if(!arr.some(function(x){return x.code===code;}))arr.push({code:code,text:text,evidence:evidence||[]});}
function evaluate(pattern,p,fs,strength,ss,bs,qi){var ok=[],bad=[],save=[],variant='';
 var strong=strength==='身強'||strength==='極強',weak=strength==='身弱'||strength==='極弱';
 var officer=has(fs,'正官',true),kill=has(fs,'七殺',true),wealth=any(fs,['正財','偏財'],true),seal=any(fs,['正印','偏印'],true),food=has(fs,'食神',true),hurt=has(fs,'傷官',true),output=food||hurt,peer=any(fs,['比肩','劫財'],true),rawKill=kill;
 var wsConflict=ss.wealthSealRelations.some(function(x){return x.relation==='相礙';}),wsClear=ss.wealthSealRelations.length&&!wsConflict,wsBinding=ss.bindings.some(function(x){return x.constrainsSupport&&x.gods.some(function(g){return g==='正財'||g==='偏財';})&&x.gods.some(function(g){return g==='正印'||g==='偏印';});}),killBinding=ss.bindings.some(function(x){return x.constrainsSupport&&x.gods.indexOf('七殺')>=0&&x.gods.some(function(g){return g==='比肩'||g==='劫財';});}),hiddenHurt=bs.hiddenGods.filter(function(x){return x.god==='傷官';});
 if(wsClear)push(ok,'POSITIONAL_WEALTH_SEAL_NON_CONFLICT','財印分隔，各得其位',ss.wealthSealRelations);
 if(wsConflict)push(bad,'POSITIONAL_WEALTH_SEAL_CONFLICT','財印相鄰相礙，須防彼此失用',ss.wealthSealRelations.filter(function(x){return x.relation==='相礙';}));
 if(wsBinding)push(bad,'STEM_COMBINATION_REMOVES_SUPPORT','財印相合，兩項輔神受絆而失其完整作用',ss.bindings.filter(function(x){return x.constrainsSupport&&x.gods.some(function(g){return g==='正財'||g==='偏財';})&&x.gods.some(function(g){return g==='正印'||g==='偏印';});}));
 var clashes=monthClash(p);if(clashes.length)push(bad,'MONTH_CLASH','月令受沖，格局骨架不穩',clashes);
 if(pattern==='官格'){
   var officerWealth=wealth&&!wsBinding,officerSeal=seal&&!wsBinding;
   if(officerWealth){push(ok,'OFFICER_WITH_WEALTH','財星生官，官格得輔');variant='財生官';}
   if(officerSeal){push(ok,'OFFICER_WITH_SEAL','印星化官生身，官印相生');if(!variant)variant='官印相生';}
   if(!officerWealth&&!officerSeal)push(bad,'OFFICER_NO_SUPPORT','官格未見未受絆的財印相輔');
   if(hurt)push(bad,'OFFICER_HURT','傷官剋官，為官格之病');
   if(hurt&&officerSeal)push(save,'SEAL_CONTROLS_HURT','印星制傷護官，可救傷官之病');
   if(hiddenHurt.length)push(bad,'HIDDEN_COMBINATION_HURT','地支合會引出藏干傷官，官格受到隱性傷官作用',hiddenHurt);
   if(hiddenHurt.length&&officerSeal)push(save,'SEAL_CONTROLS_HIDDEN_HURT','印星透出制約合會所引之傷官，保存遇傷佩印救應',hiddenHurt);
   if(officer&&entries(fs,['正官']).filter(function(x){return x.visible;}).length>1)push(bad,'OFFICER_MIXED','官星重見，清純度下降');
   if(rawKill&&killBinding)push(save,'STEM_COMBINATION_KEEP_OFFICER_REMOVE_KILL','七煞被相鄰天干合住，合煞留官而取清',ss.bindings.filter(function(x){return x.constrainsSupport&&x.gods.indexOf('七殺')>=0;}));
   else if(rawKill)push(bad,'OFFICER_KILL_MIXED','官格另見七煞，官煞混雜而清純度下降');
 }
 else if(pattern==='財格'){
   var visibleWealth=entries(fs,['正財','偏財']).filter(function(x){return x.visible;}),visiblePeers=entries(fs,['比肩','劫財']).filter(function(x){return x.visible;});
   if(officer){push(ok,'WEALTH_BIRTH_OFFICER','財旺生官');variant='財旺生官';}
   if(officer&&visibleWealth.length)push(ok,'EXPOSED_WEALTH_PROTECTED_BY_OFFICER','財星雖透，能順生官星，財露不作無護之財',{wealth:visibleWealth,officer:entries(fs,['正官']).filter(function(x){return x.visible;})});
   if(food&&strong){push(ok,'FOOD_BIRTH_WEALTH','身有承擔，食神生財');variant=variant||'食神生財';}
   if(seal){push(ok,'WEALTH_WITH_SEAL','財印同見，須察位置是否相礙');variant=variant||'財格佩印';}
   if(visiblePeers.length===1&&food)push(ok,'SINGLE_PEER_NOT_ROBBING_WEALTH','僅一位比劫且有食神洩秀生財，不逕作群比奪財',visiblePeers);
   if(peer&&!food)push(bad,'WEALTH_ROBBED','比劫見而無食神通化，財有被分奪之病');
   if(kill)push(bad,'WEALTH_FEEDS_KILL','財透煞，財轉而黨煞');
   if(kill&&food)push(save,'CROSS_PATTERN_FOOD_CONTROLS_KILL','月令雖立財格，全局食神仍可越格制殺，須與財生殺之病並列裁定',entries(fs,['食神','七殺']));
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
   var allWealth=any(fs,['正財','偏財'],false),allOfficer=any(fs,['正官','七殺'],false),totalQi=qi?Object.keys(qi.strengths).reduce(function(n,k){return n+qi.strengths[k];},0):0,fireShare=totalQi?qi.strengths.火/totalQi:0;
   if(strong&&WXGAN[p[2].gan]==='火'&&fireShare>=.65&&!allWealth)push(bad,'EXCESS_FIRE_NO_WEALTH_OUTLET','傷官雖盡，火勢過度集中且全局無財承接，不能以傷盡直接論成格',{fireShare:+fireShare.toFixed(4),wealthAnywhere:false,officerKillAnywhere:allOfficer,qiStrengths:qi&&qi.strengths});
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
function chooseBase(p,candidates,ss){var d=deps(),dm=p[2].gan,original=candidates[0],main=original,god=main.god,pattern=GROUP[god]||main.pattern,blade,mixed;if(YANG_BLADE_BRANCH[dm]===p[1].zhi){blade=candidates.find(function(x){return x.god==='劫財';});if(blade){main=blade;god=blade.god;pattern='陽刃格';}}else if(STORAGE_BRANCH.indexOf(p[1].zhi)>=0&&(god==='劫財'||god==='比肩')){mixed=candidates.slice(1).find(function(x){return x.visible&&x.visiblePillars.some(function(i){return ss.constrainedPillars.indexOf(i)<0;})&&x.god!=='比肩'&&x.god!=='劫財';});if(mixed){main=mixed;god=mixed.god;pattern=GROUP[god]||mixed.pattern;}else pattern='建祿月劫格';}else if(god==='劫財'||god==='比肩')pattern='建祿月劫格';return {monthBranch:p[1].zhi,monthMainGan:main.gan,monthMainGod:god,pattern:pattern,layer:main.layer,visible:main.visible,selectionReason:mixed?'雜氣月令取未受合絆之透干':blade?'固定陽刃位取刃神':'月令本氣取格',originalMain:{gan:original.gan,god:original.god,layer:original.layer},selectedVisiblePillars:main.visiblePillars.slice()};}
function statusOf(ev){var o=ev.supports.length>0,b=ev.failures.length>0,s=ev.rescues.length>0;if(o&&!b)return '成格';if(o&&b&&s)return '成中有敗・敗中有救';if(o&&b)return '成中有敗';if(!o&&b&&s)return '敗中有救';if(!o&&b)return '敗格';return '格局待定';}
function analyze(pillars,options){var p=validate(pillars),fs=facts(p),ss=stemStructure(p),bs=branchStructure(p),candidates=candidateList(p,fs),base=chooseBase(p,candidates,ss),strength=options&&options.strength||'未裁定',qi=root.TianhengZipingQi?root.TianhengZipingQi.analyze(p):null,ruleQi=qi||{strengths:elementStrengths(p)},ev=evaluate(base.pattern,p,fs,strength,ss,bs,ruleQi),status=statusOf(ev),selectionEvidence=[];if(base.selectionReason==='雜氣月令取未受合絆之透干')selectionEvidence.push({code:'MIXED_QI_VISIBLE_SELECTION',text:'辰戌丑未雜氣月令，取未受合絆之透干立格',evidence:{originalMain:base.originalMain,selectedGan:base.monthMainGan,selectedGod:base.monthMainGod,selectedVisiblePillars:base.selectedVisiblePillars}});if(base.pattern==='官格'&&ev.failures.some(function(x){return x.code==='STEM_COMBINATION_REMOVES_SUPPORT';})&&ev.failures.some(function(x){return x.code==='OFFICER_NO_SUPPORT';}))status='格成而孤・層次受限';var resolved=qi&&qi.qualifies&&qi.pattern?qi.pattern:base.pattern;return {engine:'TianhengZipingPattern',version:'2.0-alpha',mode:'add-only',sourceFramework:['子平真詮・月令用神','子平真詮・成敗救應','滴天髓・形象氣勢覆核'],pillars:p.map(function(x){return {gan:x.gan,zhi:x.zhi};}),strengthInput:strength,candidates:candidates,basePattern:base,selectionEvidence:selectionEvidence,resolvedPattern:resolved,resolution:qi&&qi.qualifies?'氣勢成象覆核':'月令常格',qiStructure:qi,ruleElementStrengths:ruleQi.strengths,stemStructure:ss,branchStructure:bs,variant:ev.variant,status:status,formation:ev.supports,failures:ev.failures,rescues:ev.rescues,patternGod:{god:base.monthMainGod,gan:base.monthMainGan},dynamicSkeleton:{monthCommand:base.monthBranch,base:base.pattern,resolved:resolved,variant:ev.variant,condition:status},evidence:fs,legacyOverride:false,notes:['月令常格 basePattern 與氣勢覆核 resolvedPattern 分開保存','不以單一分數判定格局高低','合會形成的隱性十神與其救應分開保存']};}
function codeSet(xs){var o={};xs.forEach(function(x){o[x.code]=1;});return o;}
function added(after,before){var b=codeSet(before);return after.filter(function(x){return !b[x.code];});}
function fortuneFacts(p,fortune){var d=deps(),dm=p[2].gan,out=[{source:fortune.type||'運',pillarIndex:4,gan:fortune.gan,god:d.g.getTenGod(dm,fortune.gan),visible:true,layer:null,fortune:true}];d.a.getCangGan(fortune.zhi).forEach(function(c){out.push({source:(fortune.type||'運')+'藏干',pillarIndex:4,zhi:fortune.zhi,gan:c.gan,god:d.g.getTenGod(dm,c.gan),visible:false,layer:c.type,weight:c.weight,fortune:true});});return out;}
function fortuneRelations(p,fortune){var out=[];p.forEach(function(x,i){if(CHONG[x.zhi]===fortune.zhi)out.push({type:'沖',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:fortune.zhi});if(LIUHE[x.zhi]===fortune.zhi)out.push({type:'合',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:fortune.zhi});if(x.zhi===fortune.zhi)out.push({type:'伏吟',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:fortune.zhi});});return out;}
function fortuneHiddenActivations(baseResult,fortune){var visibleOriginal=baseResult.evidence.filter(function(x){return x.visible;}).map(function(x){return x.gan;}),seen={},out=[];baseResult.evidence.filter(function(x){return !x.visible&&x.gan===fortune.gan&&visibleOriginal.indexOf(x.gan)<0;}).forEach(function(x){var key=x.pillarIndex+'-'+x.gan;if(seen[key])return;seen[key]=1;out.push({code:'FORTUNE_EXPOSES_ORIGINAL_HIDDEN_GOD',type:'運干透出原局伏神',fortune:{type:fortune.type||'運',gan:fortune.gan,zhi:fortune.zhi},original:{pillarIndex:x.pillarIndex,zhi:x.zhi,gan:x.gan,god:x.god,layer:x.layer,weight:x.weight},effect:'原局藏干由隱轉顯，交由格局成敗救應重新裁定'});});return out;}
function fortuneHiddenGodEffects(p,fortune){return fortuneFacts(p,fortune).filter(function(x){return !x.visible&&(x.layer==='本氣'||x.layer==='中氣');}).map(function(x){return {code:'HIDDEN_FORTUNE_GOD_EFFECT',type:'運支藏干參與作用',gan:x.gan,god:x.god,layer:x.layer,weight:x.weight,effect:x.layer==='本氣'?'運支本氣直接參與格局作用':'運支中氣列為次級作用，不等同透干'};});}
function usefulGodChange(p,fortune,baseResult,relations){var d=deps(),wx=WXGAN[baseResult.patternGod.gan],before=elementStrengths(p),after=elementStrengths(p.concat([{gan:fortune.gan,zhi:fortune.zhi}])),clashes=relations.filter(function(x){return x.type==='沖'&&x.targetPillarIndex===1;}),fortuneElements=[WXGAN[fortune.gan]],main=d.a.getCangGan(fortune.zhi)[0];if(main&&fortuneElements.indexOf(main.wuxing)<0)fortuneElements.push(main.wuxing);var controls=fortuneElements.filter(function(x){return KE[x]===wx;}),delta=+(after[wx]-before[wx]).toFixed(4),status=clashes.length?'受沖':controls.length?'受制':delta>.1?'增力':delta<-.1?'減力':'持平';return {code:'FORTUNE_USEFUL_GOD_STRENGTH',god:baseResult.patternGod.god,gan:baseResult.patternGod.gan,element:wx,before:before[wx],after:after[wx],delta:delta,status:status,clashes:clashes,controllingElements:controls,note:'以月令格神為本層用神觀察點；不覆寫三階六路用神裁決'};}
function validateFortune(f){if(!f||GAN.indexOf(f.gan)<0||ZHI.indexOf(f.zhi)<0)throw Error('運程干支無效');return f;}
function analyzeFortune(pillars,fortune,options){var p=validate(pillars),f=validateFortune(fortune),baseResult=analyze(p,options),fs=baseResult.evidence.concat(fortuneFacts(p,f)),ruleQi=baseResult.qiStructure||{strengths:baseResult.ruleElementStrengths},ev=evaluate(baseResult.basePattern.pattern,p,fs,baseResult.strengthInput,baseResult.stemStructure,baseResult.branchStructure,ruleQi),relations=fortuneRelations(p,f),hiddenActivations=fortuneHiddenActivations(baseResult,f),hiddenEffects=fortuneHiddenGodEffects(p,f),usefulChange=usefulGodChange(p,f,baseResult,relations);if(CHONG[p[1].zhi]===f.zhi)push(ev.failures,'FORTUNE_CLASH_MONTH','運支沖月令，原格局骨架受動',relations.filter(function(x){return x.targetPillarIndex===1;}));var status=statusOf(ev),newSupport=added(ev.supports,baseResult.formation),newFailure=added(ev.failures,baseResult.failures),newRescue=added(ev.rescues,baseResult.rescues),types=[];if(newSupport.length)types.push('被引動');if(newFailure.length)types.push('被破壞');if(newRescue.length)types.push('獲得救應');if(ev.variant!==baseResult.variant)types.push('被重塑');if(hiddenActivations.length)types.push('伏神被引出');if(hiddenEffects.length)types.push('運支藏神被引動');if(usefulChange.status==='受沖'||usefulChange.status==='受制')types.push('用神受損');else if(usefulChange.status==='增力')types.push('用神增力');if(!types.length&&relations.length)types.push('宮位被引動');if(!types.length)types.push('格局延續');return {engine:'TianhengZipingPatternFortune',version:'2.0-alpha',mode:'dynamic-transition',fortune:{type:f.type||'流年',gan:f.gan,zhi:f.zhi,god:deps().g.getTenGod(p[2].gan,f.gan)},base:{pattern:baseResult.basePattern.pattern,variant:baseResult.variant,status:baseResult.status},after:{pattern:baseResult.basePattern.pattern,variant:ev.variant,status:status,formation:ev.supports,failures:ev.failures,rescues:ev.rescues},transition:{types:types,newFormation:newSupport,newFailures:newFailure,newRescues:newRescue,relations:relations,hiddenActivations:hiddenActivations,hiddenFortuneGodEffects:hiddenEffects,usefulGodStrength:usefulChange},legacyOverride:false,notes:['運程加入後重新檢查原局成敗救應','原局 base 與加入運程後 after 分開保存，不覆寫原局','原局伏神與運干透出事件分開保存，不把伏神改寫為原局明透','運支本中氣與透干分層保存；月令格神歲運強弱不覆寫三階用神']};}
function safeAnalyzeFortune(p,f,o){try{return {ok:true,data:analyzeFortune(p,f,o),error:null};}catch(e){return {ok:false,data:null,error:String(e&&e.message||e)};}}
function safeAnalyze(p,o){try{return {ok:true,data:analyze(p,o),error:null};}catch(e){return {ok:false,data:null,error:String(e&&e.message||e)};}}
var api=Object.freeze({analyze:analyze,safeAnalyze:safeAnalyze,analyzeFortune:analyzeFortune,safeAnalyzeFortune:safeAnalyzeFortune});if(!root.TianhengZipingPattern)root.TianhengZipingPattern=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
