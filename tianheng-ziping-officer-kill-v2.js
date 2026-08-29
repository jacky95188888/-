/* 天衡・九維命理｜官殺清純裁決 v2.0-alpha
 * 區分官殺並見、去官留殺、制殺留官與合去候選；不刪除底層十神證據。
 */
(function(root){'use strict';
var GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
var HE={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
function deps(){var a=root.TianhengBaziAdvanced,g=root.TianhengBaziGeJuTiaoHou;if(!a||!g)throw Error('需先載入 advanced 與 geju-tiaohou');return {a:a,g:g};}
function valid(p){if(!Array.isArray(p)||p.length<4||p.some(function(x){return !x||GAN.indexOf(x.gan)<0||ZHI.indexOf(x.zhi)<0;}))throw Error('需要有效四柱或運後干支組');}
function facts(p){var d=deps(),dm=p[2].gan,out=[];p.forEach(function(x,i){if(i!==2)out.push({gan:x.gan,god:d.g.getTenGod(dm,x.gan),visible:true,pillarIndex:i,source:i===4?'運干':'天干'});d.a.getCangGan(x.zhi).forEach(function(c){out.push({gan:c.gan,god:d.g.getTenGod(dm,c.gan),visible:false,pillarIndex:i,source:i===4?'運支藏干':'藏干',layer:c.type,weight:c.weight});});});return out;}
function visible(fs,god){return fs.filter(function(x){return x.visible&&x.god===god;});}
function present(fs,gods){return fs.filter(function(x){return gods.indexOf(x.god)>=0;});}
function combined(target,fs){return fs.some(function(x){return x.visible&&x.gan!==target.gan&&HE[target.gan]===x.gan;});}
function judge(p){valid(p);var fs=facts(p),off=visible(fs,'正官'),kill=visible(fs,'七殺'),hurt=visible(fs,'傷官'),food=visible(fs,'食神'),seal=present(fs,['正印','偏印']),mixed=off.length>0&&kill.length>0,events=[],status=mixed?'官殺並見待裁':'未成官殺混雜',resolved=false;
 if(mixed&&hurt.length){events.push({code:'REMOVE_OFFICER_KEEP_KILL',type:'去官留殺',text:'傷官制去正官，使七殺單獨受制化',evidence:{officer:off,hurt:hurt,kill:kill}});resolved=true;status=seal.length?'去官留殺・殺印相生':'去官留殺・七殺仍須制化';}
 if(mixed&&food.length){events.push({code:'CONTROL_KILL_KEEP_OFFICER',type:'制殺留官',text:'食神制七殺，使正官得以保持清純',evidence:{officer:off,food:food,kill:kill}});resolved=true;status='制殺留官';}
 off.forEach(function(x){if(combined(x,fs))events.push({code:'COMBINE_OFFICER_CANDIDATE',type:'合官留殺候選',text:'正官遇五合，是否合去仍須檢查位置與化氣條件',evidence:x});});
 kill.forEach(function(x){if(combined(x,fs))events.push({code:'COMBINE_KILL_CANDIDATE',type:'合殺留官候選',text:'七殺遇五合，是否合去仍須檢查位置與化氣條件',evidence:x});});
 if(mixed&&!resolved&&seal.length){events.push({code:'SEAL_TRANSFORMS_MIX',type:'官殺印化',text:'官殺並見但有印星承化，不能直接等同混雜破格',evidence:seal});status='官殺並見・有印承化';}
 return {version:'2.0-alpha',mixed:mixed,visibleOfficer:off,visibleKill:kill,events:events,resolvedToPure:resolved,status:status,rawEvidence:fs,legacyOverride:false,note:'合官、合殺目前只列候選；未驗證位置與化氣前不直接視為合去。'};}
function analyze(p){if(!Array.isArray(p)||p.length!==4)throw Error('需要有效完整四柱');return judge(p);}
function analyzeFortune(p,f){if(!Array.isArray(p)||p.length!==4)throw Error('需要有效完整四柱');if(!f||GAN.indexOf(f.gan)<0||ZHI.indexOf(f.zhi)<0)throw Error('運程干支無效');return {fortune:{type:f.type||'流年',gan:f.gan,zhi:f.zhi},before:judge(p),after:judge(p.concat([{gan:f.gan,zhi:f.zhi}])),legacyOverride:false};}
function safeAnalyze(p){try{return {ok:true,result:analyze(p)};}catch(e){return {ok:false,error:e.message};}}
var api=Object.freeze({analyze:analyze,analyzeFortune:analyzeFortune,safeAnalyze:safeAnalyze});if(!root.TianhengZipingOfficerKill)root.TianhengZipingOfficerKill=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
