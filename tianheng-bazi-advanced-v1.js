/* Tianheng Bazi Advanced v1 - additive only */
(function(root){
'use strict';
var WX={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var CG={子:[['癸','本氣',1]],丑:[['己','本氣',.6],['癸','中氣',.3],['辛','餘氣',.1]],寅:[['甲','本氣',.6],['丙','中氣',.3],['戊','餘氣',.1]],卯:[['乙','本氣',1]],辰:[['戊','本氣',.6],['乙','中氣',.3],['癸','餘氣',.1]],巳:[['丙','本氣',.6],['庚','中氣',.3],['戊','餘氣',.1]],午:[['丁','本氣',.7],['己','中氣',.3]],未:[['己','本氣',.6],['丁','中氣',.3],['乙','餘氣',.1]],申:[['庚','本氣',.6],['壬','中氣',.3],['戊','餘氣',.1]],酉:[['辛','本氣',1]],戌:[['戊','本氣',.6],['辛','中氣',.3],['丁','餘氣',.1]],亥:[['壬','本氣',.7],['甲','中氣',.3]]};
var TF={本氣:1,中氣:.7,餘氣:.4},CS=['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'],Z=['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'];
var YS={甲:'亥',丙:'寅',戊:'寅',庚:'巳',壬:'申'},NS={乙:'午',丁:'酉',己:'酉',辛:'子',癸:'卯'},YG={甲:1,丙:1,戊:1,庚:1,壬:1};
function hidden(z){return (CG[z]||[]).map(function(x){return {gan:x[0],type:x[1],weight:x[2],wuxing:WX[x[0]]};});}
function changsheng(g,z){var yang=!!YG[g],start=(yang?YS:NS)[g],s=Z.indexOf(start),t=Z.indexOf(z);if(s<0||t<0)return null;var n=yang?(t-s+12)%12:(s-t+12)%12;return CS[n];}
function pos(t,z){if(t===2)return z===1?1.2:z===2?1:z===3?.8:.6;return t===z?1:.6;}
function rootScore(g,t,zs){var raw=0,details=[];zs.forEach(function(z,zi){hidden(z).forEach(function(c){if(WX[g]!==c.wuxing)return;var p=pos(t,zi),v=c.weight*p*TF[c.type]*100;raw+=v;details.push({zhi:z,zhiIndex:zi,hiddenGan:c.gan,type:c.type,positionWeight:p,score:+v.toFixed(2)});});});var score=Math.min(100,+raw.toFixed(2));return {gan:g,rawScore:+raw.toFixed(2),score:score,level:score>=70?'旺根（得令得地）':score>=40?'中根':score>=20?'弱根':'無根',details:details};}
function analyze(p){if(!Array.isArray(p)||p.length!==4)throw Error('需要四柱');var zs=p.map(function(x){return x.zhi;}),roots=p.map(function(x,i){return rootScore(x.gan,i,zs);}),r=roots[2];return {version:'1.0-phase1',cangGan:p.map(function(x,i){return {pillarIndex:i,zhi:x.zhi,layers:hidden(x.zhi)};}),tongGen:{all:roots,riZhu:Object.assign({},r,{strength:r.score>=70?'身強':r.score>=40?'身中和':'身弱'})},changSheng:{riGan:p[2].gan,byPillar:p.map(function(x,i){return {pillarIndex:i,zhi:x.zhi,stage:changsheng(p[2].gan,x.zhi)};})}};}
var api=Object.freeze({getCangGan:hidden,getChangSheng:changsheng,calcRootForGan:rootScore,analyze:analyze});
if(!root.TianhengBaziAdvanced)root.TianhengBaziAdvanced=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
