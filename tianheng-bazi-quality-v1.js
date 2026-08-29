/* 天衡・九維命理｜格局高低與破格 v1｜add-only */
(function(root){'use strict';
var WX={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
var CHONG=[['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
var GANHE=[['甲','己'],['乙','庚'],['丙','辛'],['丁','壬'],['戊','癸']];
var LAYER={本氣:30,中氣:20,餘氣:10,'月令特例':30};
function need(){var a=root.TianhengBaziAdvanced,g=root.TianhengBaziGeJuTiaoHou;if(!a||!g)throw Error('需先載入 advanced 與 geju-tiaohou 模組');return {a:a,g:g};}
function gLayers(z){return root.TianhengBaziAdvanced.getCangGan(z);}
function gods(p,g){var dm=p[2].gan,r=[];p.forEach(function(x,i){r.push({where:'天干',index:i,gan:x.gan,god:g.getTenGod(dm,x.gan)});gLayers(x.zhi).forEach(function(c){r.push({where:'藏干',index:i,gan:c.gan,type:c.type,god:g.getTenGod(dm,c.gan)});});});return r;}
function hasGod(gs,name,visibleOnly){return gs.some(function(x){return x.god===name&&(!visibleOnly||x.where==='天干');});}
function adjacentGod(gs,a,b){var aa=gs.filter(function(x){return x.god===a;}),bb=gs.filter(function(x){return x.god===b;});return aa.some(function(x){return bb.some(function(y){return Math.abs(x.index-y.index)<=1;});});}
function monthClashed(p){var m=p[1].zhi;return p.some(function(x,i){return i!==1&&CHONG.some(function(c){return c.indexOf(m)>=0&&c.indexOf(x.zhi)>=0;});});}
function ganCombined(p,gan){var i=p.findIndex(function(x){return x.gan===gan;});if(i<0)return false;return p.some(function(x,j){return i!==j&&Math.abs(i-j)===1&&GANHE.some(function(h){return h.indexOf(gan)>=0&&h.indexOf(x.gan)>=0;});});}
function flow(p){var present={};p.forEach(function(x){present[WX[x.gan]]=1;gLayers(x.zhi).forEach(function(c){if(c.type!=='餘氣')present[c.wuxing]=1;});});var els=Object.keys(present),links=els.filter(function(e){return present[SHENG[e]];}).length,ratio=els.length?links/els.length:0;return ratio>=.75?{name:'流通',score:20}:ratio>=.4?{name:'半流通',score:10}:{name:'阻滯',score:0};}
function purity(gs){var visible={};gs.filter(function(x){return x.where==='天干'&&x.index!==2;}).forEach(function(x){visible[x.god]=1;});var n=Object.keys(visible).length;return n<=2?{name:'清',score:20,count:n}:{name:'濁',score:5,count:n};}
function breaks(p,gj,gs){var out=[],isYin=gj.geJu==='正印格'||String(gj.geJu).indexOf('偏印格')===0;if(monthClashed(p))out.push({name:'格神被沖',severity:'重度',huaJie:false});if(gj.touGanGan&&ganCombined(p,gj.touGanGan))out.push({name:'格神被合絆',severity:'中度',huaJie:false});if((gj.geJu==='正官格'||gj.geJu==='七殺格')&&hasGod(gs,'正官',true)&&hasGod(gs,'七殺',true))out.push({name:'官殺混雜',severity:'中度',huaJie:false});if(gj.geJu==='傷官格'&&hasGod(gs,'正官',false)){var yin=hasGod(gs,'正印',false)||hasGod(gs,'偏印',false);out.push({name:'傷官見官',severity:'重度',huaJie:yin,huaJieShen:yin?'印星':null});}if(isYin&&(adjacentGod(gs,'正財','正印')||adjacentGod(gs,'偏財','偏印')))out.push({name:'財壞印',severity:'中度',huaJie:false});if(gj.geJu==='食神格'&&adjacentGod(gs,'偏印','食神'))out.push({name:'梟神奪食',severity:'中度',huaJie:false});return out;}
function grade(n){return n>=80?'上格':n>=65?'中上':n>=45?'中平':'下格';}
function normalizeGeJu(input,g,p){if(input&&input.geJu&&typeof input.geJu==='object')return input.geJu;if(input&&typeof input.geJu==='string')return input;return g.judgeGeJu(p);}
function analyze(p,phase1,gejuResult){var dep=need(),gj=normalizeGeJu(gejuResult,dep.g,p),gs=gods(p,dep.g),f=flow(p),q=purity(gs),rootScore=phase1&&phase1.tongGen&&phase1.tongGen.riZhu?phase1.tongGen.riZhu.score:0,rootPart=Math.min(30,rootScore*.3),layer=LAYER[gj.touGanCeng]||0,base=+(layer+rootPart+f.score+q.score).toFixed(2),po=breaks(p,gj,gs),factor=1;po.forEach(function(x){var k=x.severity==='重度'?.5:.7;if(x.huaJie)k=Math.min(1,k+.2);factor*=k;});var corrected=+(base*factor).toFixed(2);return {version:'1.0',geJu:gj.geJu,jiBenFen:base,factors:{touGanCeng:{name:gj.touGanCeng,score:layer},genQiFen:{source:rootScore,score:+rootPart.toFixed(2)},wuXingLiuTong:f,qingZhuo:q},poGeJianCe:po,xiuZhengXiShu:+factor.toFixed(4),xiuZhengHouFen:corrected,gaoDiPingJi:grade(corrected),note:'評分為規格化輔助量表；原始因子與修正係數完整保留供教師查核，不覆蓋既有格局判斷'};}
var api=Object.freeze({analyze:analyze});if(!root.TianhengBaziQuality)root.TianhengBaziQuality=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
