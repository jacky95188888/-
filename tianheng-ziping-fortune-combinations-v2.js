/* 天衡・九維命理｜運程合會引動 v2.0-alpha
 * 比較原局與運後三合、三會、六合、沖與伏吟；不覆寫 v1 合會局結果。
 */
(function(root){'use strict';
var SANHE=[{z:['申','子','辰'],q:'水',n:'申子辰三合水局'},{z:['亥','卯','未'],q:'木',n:'亥卯未三合木局'},{z:['寅','午','戌'],q:'火',n:'寅午戌三合火局'},{z:['巳','酉','丑'],q:'金',n:'巳酉丑三合金局'}];
var SANHUI=[{z:['寅','卯','辰'],q:'木',n:'寅卯辰三會木局'},{z:['巳','午','未'],q:'火',n:'巳午未三會火局'},{z:['申','酉','戌'],q:'金',n:'申酉戌三會金局'},{z:['亥','子','丑'],q:'水',n:'亥子丑三會水局'}];
var LIUHE=[{z:['子','丑'],q:'土'},{z:['寅','亥'],q:'木'},{z:['卯','戌'],q:'火'},{z:['辰','酉'],q:'金'},{z:['巳','申'],q:'水'},{z:['午','未'],q:'火/土',no:true}];
var CHONG={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
var GANHE=[{g:['甲','己'],q:'土'},{g:['乙','庚'],q:'金'},{g:['丙','辛'],q:'水'},{g:['丁','壬'],q:'木'},{g:['戊','癸'],q:'火'}];
var WXGAN={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var WXZHI={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
var GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
function valid(p,f){if(!Array.isArray(p)||p.length!==4||p.some(function(x){return !x||GAN.indexOf(x.gan)<0||ZHI.indexOf(x.zhi)<0;}))throw Error('需要有效完整四柱');if(!f||GAN.indexOf(f.gan)<0||ZHI.indexOf(f.zhi)<0)throw Error('運程干支無效');}
function all(zs,need){return need.every(function(x){return zs.indexOf(x)>=0;});}
function sig(x){return x.type+'|'+x.zhi.slice().sort().join('')+'|'+(x.huaQi||'');}
function natalGroups(p){if(!root.TianhengBaziCombinations)throw Error('需先載入 tianheng-bazi-combinations-v1.js');var x=root.TianhengBaziCombinations.analyze(p);return x.sanHe.concat(x.sanHui,x.liuHe).map(function(e){return Object.assign({scope:'原局'},e);});}
function dynamicGroups(p,f){var natal=p.map(function(x){return x.zhi;}),zs=natal.concat(f.zhi),gans=p.map(function(x){return x.gan;}).concat(f.gan),out=[];
 SANHE.forEach(function(x){if(all(zs,x.z)&&x.z.indexOf(f.zhi)>=0)out.push({type:'三合',name:x.n,zhi:x.z.slice(),huaQi:x.q,scope:'運程補局',fortuneCompletes:!all(natal,x.z)});});
 SANHUI.forEach(function(x){if(all(zs,x.z)&&x.z.indexOf(f.zhi)>=0)out.push({type:'三會',name:x.n,zhi:x.z.slice(),huaQi:x.q,scope:'運程補局',fortuneCompletes:!all(natal,x.z)});});
 LIUHE.forEach(function(x){var other=x.z[0]===f.zhi?x.z[1]:x.z[1]===f.zhi?x.z[0]:null;if(!other||natal.indexOf(other)<0)return;var monthOK=!x.no&&WXZHI[p[1].zhi]===x.q,ganOK=!x.no&&gans.some(function(g){return WXGAN[g]===x.q;}),can=monthOK||ganOK;out.push({type:'六合',name:x.z.join('')+'六合',zhi:x.z.slice(),huaQi:x.q,scope:'運來合局',targetPillars:natal.map(function(z,i){return z===other?i:-1;}).filter(function(i){return i>=0;}),status:x.no?'合絆':can?'合化':'合絆',canTransform:!!can,monthSupports:monthOK,ganSupports:ganOK});});
 return out;}
function stemGroups(p,f,dynamic){var out=[];GANHE.forEach(function(x){var other=x.g[0]===f.gan?x.g[1]:x.g[1]===f.gan?x.g[0]:null;if(!other)return;var ids=[];p.forEach(function(v,i){if(v.gan===other)ids.push(i);});if(!ids.length)return;var monthOK=WXZHI[p[1].zhi]===x.q,branchSupport=dynamic.some(function(e){return e.huaQi===x.q&&(e.type==='六合'||e.type==='三合'||e.type==='三會');});out.push({type:'天干五合',name:x.g.join('')+'合'+x.q,gan:x.g.slice(),huaQi:x.q,targetPillars:ids,monthSupports:monthOK,branchSupports:branchSupport,status:monthOK||branchSupport?'合化候選':'合絆候選',note:'須再核對位置、爭合與化神強弱，不直接視為已化'});});return out;}
function analyze(p,f){valid(p,f);var before=natalGroups(p),dynamic=dynamicGroups(p,f),after=before.concat(dynamic),stems=stemGroups(p,f,dynamic),clashes=[],repeats=[];p.forEach(function(x,i){if(CHONG[x.zhi]===f.zhi)clashes.push({type:'沖',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:f.zhi});if(x.zhi===f.zhi)repeats.push({type:'伏吟',targetPillarIndex:i,targetZhi:x.zhi,fortuneZhi:f.zhi});});var brokenBindings=[];before.filter(function(x){return x.type==='六合'&&x.status==='合絆';}).forEach(function(x){var hit=x.zhi.find(function(z){return CHONG[z]===f.zhi;});if(hit)brokenBindings.push({type:'沖開合絆',baseGroup:x.name,clashedMember:hit,fortuneZhi:f.zhi});});var beforeS={};before.forEach(function(x){beforeS[sig(x)]=1;});var added=dynamic.filter(function(x){return !beforeS[sig(x)];}),completed=added.filter(function(x){return x.fortuneCompletes;});return {engine:'TianhengZipingFortuneCombinations',version:'2.0-alpha',fortune:{type:f.type||'流年',gan:f.gan,zhi:f.zhi},originalEvents:before,afterEvents:after,addedEvents:added,completedGroups:completed,stemCombinations:stems,clashes:clashes,repeats:repeats,brokenBindings:brokenBindings,patternInteractions:{month:clashes.filter(function(x){return x.targetPillarIndex===1;}),day:clashes.filter(function(x){return x.targetPillarIndex===2;}),dayCombinations:added.filter(function(x){return x.type==='六合'&&x.targetPillars.indexOf(2)>=0;})},legacyOverride:false,notes:['運支視為外來引動，可與任一原局地支論沖合','原局事件與運後新增事件分開保存','天干五合先列合化候選，保留位置與化神強弱的後續裁決']};}
function safeAnalyze(p,f){try{return {ok:true,result:analyze(p,f)};}catch(e){return {ok:false,error:e.message};}}
var api=Object.freeze({analyze:analyze,safeAnalyze:safeAnalyze});if(!root.TianhengZipingFortuneCombinations)root.TianhengZipingFortuneCombinations=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
