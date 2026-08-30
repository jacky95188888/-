/* 天衡・九維命理｜氣勢成象覆核 v2.0-alpha
 * 用途：在月令常格之外，辨識兩氣成象與炎上候選；不覆寫常格原始資料。
 */
(function(root){'use strict';
var WX={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
function need(){if(!root.TianhengBaziAdvanced)throw Error('需先載入 tianheng-bazi-advanced-v1.js');return root.TianhengBaziAdvanced;}
function strengths(p){var a=need(),s={木:0,火:0,土:0,金:0,水:0};p.forEach(function(x){s[WX[x.gan]]+=1;a.getCangGan(x.zhi).forEach(function(c){s[c.wuxing]+=c.weight;});});Object.keys(s).forEach(function(k){s[k]=+s[k].toFixed(4);});return s;}
function orderedPair(a,b){if(SHENG[a]===b)return [a,b];if(SHENG[b]===a)return [b,a];return [a,b];}
function analyzeSet(p){var s=strengths(p),rank=Object.keys(s).sort(function(a,b){return s[b]-s[a];}),a=rank[0],b=rank[1],pair=orderedPair(a,b),total=Object.keys(s).reduce(function(n,k){return n+s[k];},0),share=total?(s[a]+s[b])/total:0,minorMax=Math.max.apply(null,rank.slice(2).map(function(k){return s[k];})),generating=SHENG[a]===b||SHENG[b]===a,qualifies=share>=.88&&minorMax<=.75&&generating,dayWx=WX[p[2].gan],month=p[1].zhi,pattern=null,reason=[];
 if(qualifies){pattern='兩氣成象・'+pair.join('');reason.push('前兩大五行占全局'+Math.round(share*100)+'%');reason.push(pair[0]+'生'+pair[1]+'，氣勢可順行');}
 var fireSeason='巳午未'.indexOf(month)>=0,woodFire=pair[0]==='木'&&pair[1]==='火',waterWeak=s.水<.5;
 if(qualifies&&dayWx==='火'&&fireSeason&&woodFire&&waterWeak){pattern='炎上格';reason.push('火日主得夏令，木從火勢，水不破局');}
 var trend={code:'FOLLOW_QI_TREND',follows:pattern==='炎上格',dominant:rank[0],supporting:rank[1],reason:pattern==='炎上格'?'木氣順從夏令火勢，以火勢為主軸':'未達專旺從勢條件，不強判從勢'};
 var breakers=pattern==='兩氣成象・木火'?['金','水']:pattern==='兩氣成象・火土'?['水','木']:pattern==='炎上格'?['水','金']:[];
 return {version:'2.0-alpha',strengths:s,ranking:rank,topPair:pair,topShare:+share.toFixed(4),minorMax:+minorMax.toFixed(4),generatingRelation:generating,qualifies:qualifies,pattern:pattern,reason:reason,trendDecision:trend,imageVulnerability:{code:'FORTUNE_BREAKS_IMAGE',breakingElements:breakers,reason:breakers.length?'異質五行進局可能截斷或逆剋原有成象':'原局未形成需保護的特殊氣象'},capabilities:qualifies?['SPECIAL_QI_OVERRIDE'].concat(breakers.length?['FORTUNE_BREAKS_IMAGE']:[]).concat(trend.follows?['FOLLOW_QI_TREND']:[]):[],conventionalOverride:false,note:'氣勢覆核與月令常格並存；僅在高純度、相生兩氣條件下提出成象候選。'};
}
function analyze(p){if(!Array.isArray(p)||p.length!==4)throw Error('需要完整四柱');return analyzeSet(p);}
function analyzeFortune(p,f){if(!Array.isArray(p)||p.length!==4)throw Error('需要完整四柱');if(!f||!WX[f.gan]||typeof f.zhi!=='string')throw Error('運程干支無效');return {fortune:{type:f.type||'流年',gan:f.gan,zhi:f.zhi},before:analyzeSet(p),after:analyzeSet(p.concat([{gan:f.gan,zhi:f.zhi}])),legacyOverride:false};}
var api=Object.freeze({analyze:analyze,analyzeFortune:analyzeFortune});if(!root.TianhengZipingQi)root.TianhengZipingQi=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
