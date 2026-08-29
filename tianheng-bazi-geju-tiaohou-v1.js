/* 天衡・九維命理｜透干成格 + 調候用神 v1｜add-only */
(function(root){'use strict';
var WX={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var YANG={甲:1,丙:1,戊:1,庚:1,壬:1};
var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'},KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
var GEJU={正官:'正官格',七殺:'七殺格',正財:'正財格',偏財:'偏財格',正印:'正印格',偏印:'偏印格（梟神格）',食神:'食神格',傷官:'傷官格',比肩:'建祿格',劫財:'羊刃格'};
var TIAOHOU={子:{qihou:'寒',xuqiu:['丙','丁'],desc:'仲冬嚴寒，需丙火解凍'},丑:{qihou:'寒',xuqiu:['丙','丁'],desc:'季冬寒凍，丙火為要'},寅:{qihou:'微寒轉暖',xuqiu:['丙'],desc:'初春餘寒未盡，仍需丙火'},卯:{qihou:'溫',xuqiu:[],desc:'仲春氣候平和，調候需求降低，視格局而定'},辰:{qihou:'溫濕',xuqiu:['甲','丙'],desc:'季春濕土重，需甲疏土、丙暖局'},巳:{qihou:'熱',xuqiu:['壬','癸'],desc:'初夏漸熱，需水潤局'},午:{qihou:'炎熱',xuqiu:['壬','癸'],desc:'仲夏最熱，急需壬癸潤澤'},未:{qihou:'熱燥',xuqiu:['壬','癸'],desc:'季夏燥土，需水潤土'},申:{qihou:'轉涼',xuqiu:['壬','丁'],desc:'初秋餘熱漸退，視格局用壬或丁'},酉:{qihou:'涼',xuqiu:['丙','丁'],desc:'仲秋轉涼，金旺需火煉'},戌:{qihou:'涼燥',xuqiu:['甲','壬'],desc:'季秋燥土，需甲疏土、壬潤局'},亥:{qihou:'寒',xuqiu:['丙','丁'],desc:'初冬轉寒，需丙丁暖局'}};
function tenGod(dm,g){var a=WX[dm],b=WX[g],samePol=!!YANG[dm]===!!YANG[g];if(a===b)return samePol?'比肩':'劫財';if(SHENG[a]===b)return samePol?'食神':'傷官';if(KE[a]===b)return samePol?'偏財':'正財';if(KE[b]===a)return samePol?'七殺':'正官';if(SHENG[b]===a)return samePol?'偏印':'正印';return '未知';}
function layers(zhi){var adv=root.TianhengBaziAdvanced;if(!adv||!adv.getCangGan)throw Error('需先載入 tianheng-bazi-advanced-v1.js');return adv.getCangGan(zhi);}
function geju(p){if(!Array.isArray(p)||p.length!==4)throw Error('需要四柱');var dm=p[2].gan,yz=p[1].zhi,ls=layers(yz),visible=[p[0].gan,p[1].gan,p[3].gan],found=null;for(var i=0;i<ls.length;i++){if(visible.indexOf(ls[i].gan)>=0){found=ls[i];break;}}
 if(found){var tg=tenGod(dm,found.gan),geName=GEJU[tg]||tg+'格';if(tg==='劫財'&&found.type==='本氣')geName=YANG[dm]?'羊刃格':'月刃格';return {geJu:geName,shiShen:tg,touGanCeng:found.type,touGanGan:found.gan,yueLingDiZhi:yz,strength:found.type==='本氣'?'純正':found.type==='中氣'?'偏格':'假格'};}
 var main=ls[0],mainGod=main?tenGod(dm,main.gan):null;if(main&&WX[main.gan]===WX[dm]){var name=mainGod==='比肩'?'建祿格':(mainGod==='劫財'&&YANG[dm]?'羊刃格':'月刃格');return {geJu:name,shiShen:mainGod,touGanCeng:'月令特例',touGanGan:null,yueLingDiZhi:yz,strength:'月令自旺',special:true};}
 return {geJu:'格局待定',shiShen:mainGod,touGanCeng:null,touGanGan:null,yueLingDiZhi:yz,strength:'待定',monthHidden:ls.map(function(x){return x.gan;})};}
function presentGan(p,g){if(p.some(function(x){return x.gan===g;}))return true;return p.some(function(x){return layers(x.zhi).some(function(c){return (c.type==='本氣'||c.type==='中氣')&&c.gan===g;});});}
function supportive(dm,g){var a=WX[dm],b=WX[g];return a===b||SHENG[b]===a;}
function tiaohou(p,rootStrength){var yz=p[1].zhi,t=TIAOHOU[yz],dm=p[2].gan;if(!t)throw Error('月支無效');var have=t.xuqiu.filter(function(g){return presentGan(p,g);}),missing=t.xuqiu.filter(function(g){return !presentGan(p,g);}),conflicts=[];if(rootStrength==='身弱')conflicts=t.xuqiu.filter(function(g){return !supportive(dm,g);});else if(rootStrength==='身強')conflicts=t.xuqiu.filter(function(g){return supportive(dm,g);});return {yueLing:yz,qihouShuxing:t.qihou,tiaohouXuqiu:t.xuqiu.slice(),yiJuBei:have,queShi:missing,yongShenChongTu:conflicts.length>0,chongTuGan:conflicts,desc:t.desc,note:'衝突僅標記調候與通根身強弱取向不同，兩套判斷並存，不互相覆蓋'};}
function analyze(p,phase1){var g=geju(p),strength=phase1&&phase1.tongGen&&phase1.tongGen.riZhu?phase1.tongGen.riZhu.strength:null;return {version:'1.0',geJu:g,tiaoHou:tiaohou(p,strength),riZhuStrength:strength};}
var api=Object.freeze({GEJU_NAME_MAP:GEJU,TIAOHOU_TABLE:TIAOHOU,getTenGod:tenGod,judgeGeJu:geju,judgeTiaoHou:tiaohou,analyze:analyze});if(!root.TianhengBaziGeJuTiaoHou)root.TianhengBaziGeJuTiaoHou=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
