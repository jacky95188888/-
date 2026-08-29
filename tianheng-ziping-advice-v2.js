/* 天衡・九維命理｜子平二階近期建議 v2.0
 * 僅依運程總裁決的可追溯證據生成；不預言事件、不使用固定命盤罐頭。
 */
(function(root){'use strict';
var DOMAIN={正官:'職責、制度與職位',七殺:'壓力、決斷與風險',正財:'穩定收入與資源',偏財:'交易、客源與機會',正印:'學習、支持與憑證',偏印:'方法調整與轉型',食神:'作品、服務與表達',傷官:'突破、提案與表達',比肩:'自主、同儕與分工',劫財:'競爭、合作與分配'};
function unique(xs){return xs.filter(function(x,i,a){return x&&a.indexOf(x)===i;});}
function relEvidence(result,domain){return ((result.adviceEvidence&&result.adviceEvidence[domain])||[]).map(function(x){return x.text;});}
function hasCode(result,domain,part){return ((result.adviceEvidence&&result.adviceEvidence[domain])||[]).some(function(x){return String(x.code).indexOf(part)>=0;});}
function effectTexts(result,kind){var e=result.transition&&result.transition.combinationEffects;return e&&e[kind]||[];}
function failureCodes(result){var p=result.transition&&result.transition.pattern;return p&&p.newFailures?p.newFailures.map(function(x){return x.code;}):[];}
function rescueCodes(result){var p=result.transition&&result.transition.pattern;return p&&p.newRescues?p.newRescues.map(function(x){return x.code;}):[];}
function career(result){var god=result.fortune.god,domain=DOMAIN[god]||'近期責任與資源',types=result.transition.types||[],fail=failureCodes(result),rescue=rescueCodes(result),actions=[],avoid=[],reading=[];
 reading.push('本期由「'+god+'」引動'+domain+'，宜把抽象運勢落到可檢查的工作安排。');
 if(hasCode(result,'career','MONTH_沖')){reading.push('月支受沖，工作環境、制度或合作節奏容易調整。');actions.push('先盤點目前最重要的職責與交付期限，替可能的變動預留緩衝。');avoid.push('在資訊未齊時倉促離職、擴張或承諾全部要求。');}
 if(hasCode(result,'career','MONTH_合')){reading.push('月支遇合，合作、資源整併或責任綁定的機會增加。');actions.push('把合作對象、權責、分潤與驗收方式寫成可確認的條件。');avoid.push('只憑關係或口頭承諾推進重要合作。');}
 if(god==='正官'||god==='七殺'){actions.push('用成果、時程與風險清單回應主管或客戶，不以情緒硬碰制度。');avoid.push('同時接受多個互相衝突的指令。');}
 else if(god==='正財'||god==='偏財'){actions.push('先核對現金流、成本與回款，再選一項最能轉成收入的機會。');avoid.push('因短期機會犧牲信用、品質或必要準備。');}
 else if(god==='食神'||god==='傷官'){actions.push('把想法做成一份可展示、可交付的作品或提案。');avoid.push('只求表達痛快，忽略對方的決策程序。');}
 else if(god==='正印'||god==='偏印'){actions.push('補齊一項會直接改善成果的知識、工具或專業證明。');avoid.push('反覆研究卻不設定交付日期。');}
 else {actions.push('先界定自己與他人的責任，再集中完成一項可量化成果。');avoid.push('權責不清時替所有人收尾。');}
 if(types.indexOf('被破壞')>=0){reading.push('格局或氣勢出現受損證據，近期宜先守住基本盤。');actions.push('重大決定分成試行與正式兩階段，先用小成本驗證。');}
 if(types.indexOf('被重塑')>=0){reading.push('原有做法正在重組，調整角色或流程比硬守舊方法有效。');actions.push('保留有效核心，替新流程設定兩週至一個月的檢核點。');}
 if(fail.indexOf('OFFICER_HURT')>=0)avoid.push('用尖銳語氣挑戰主管、客戶或正式規範。');
 if(rescue.length)reading.push('命局同時出現救應線索，問題可藉由合適方法或資源緩解，並非只論受損。');
 effectTexts(result,'helpfulEffects').forEach(function(x){reading.push('合會作用有助格證據：'+(x.reason||x.verdict||'可用'));});
 effectTexts(result,'harmfulEffects').forEach(function(x){reading.push('合會作用有增忌證據：'+(x.reason||x.verdict||'需慎'));});
 return {theme:domain,reading:unique(reading).join(''),actions:unique(actions).slice(0,3),avoid:unique(avoid).slice(0,2),evidence:unique(relEvidence(result,'career').concat(types.map(function(x){return '格局動態：'+x;}),fail.map(function(x){return '新增敗格：'+x;}),rescue.map(function(x){return '新增救應：'+x;})))};
}
function relationship(result){var god=result.fortune.god,actions=[],avoid=[],reading=[],evidence=relEvidence(result,'relationship');
 if(hasCode(result,'relationship','DAY_沖')){reading.push('日支受沖，親密關係、相處方式或彼此時間安排容易出現變動。');actions.push('重要決定先確認事實與雙方時間表，情緒降下來後再定案。');avoid.push('在衝突當下逼對方立即表態。');}
 if(hasCode(result,'relationship','DAY_合')){reading.push('日支遇合，互動靠近與關係協調的條件增加，也可能帶來彼此牽制。');actions.push('把期待、界線與實際安排說清楚，觀察對方是否持續做到。');avoid.push('把一時熱絡直接等同長期承諾。');}
 if(hasCode(result,'relationship','DAY_刑')||hasCode(result,'relationship','DAY_害')){reading.push('日支出現刑害證據，誤會、語氣或隱性不滿需要主動處理。');actions.push('用具體事件說明感受與需求，避免猜測對方動機。');avoid.push('冷處理、試探或翻舊帳。');}
 if(!reading.length){reading.push('本期未見流年直接沖合日支，關係重點較偏向日常經營，而非強行判定大事件。');actions.push('維持一次有品質的對話或共同活動，從回應穩定度判斷關係。');avoid.push('因命理沒有強烈訊號就忽略真實相處問題。');evidence.push('日支未見直接沖合刑害');}
 if(god==='食神'||god==='傷官')actions.push('先聽完對方，再表達自己的立場與需求。');
 else if(god==='正官'||god==='七殺')avoid.push('把關心變成要求、考核或控制。');
 else if(god==='正財'||god==='偏財')actions.push('可談生活安排、時間投入與共同目標，但不要只衡量條件。');
 else if(god==='正印'||god==='偏印')actions.push('給彼此理解與消化的空間，用持續回應建立安全感。');
 else actions.push('保留彼此自主空間，也把責任分工說明白。');
 return {theme:hasCode(result,'relationship','DAY_沖')?'關係節奏調整':hasCode(result,'relationship','DAY_合')?'靠近與界線並重':'日常回應與穩定度',reading:unique(reading).join(''),actions:unique(actions).slice(0,3),avoid:unique(avoid).slice(0,2),evidence:unique(evidence.concat(['運干十神：'+god]))};
}
function generate(result,context){if(!result||result.engine!=='TianhengZipingFortune'||!result.fortune)throw Error('需要有效的子平運程總裁決結果');var c=career(result),r=relationship(result),count=c.evidence.length+r.evidence.length,period=context&&context.period||result.fortune.gan+result.fortune.zhi;return {engine:'TianhengZipingAdvice',version:'2.0',period:period,headline:period+'・格局動態行動建議',overview:'本期以「'+result.fortune.god+'」為主要引動，格局狀態為'+(result.transition.types||[]).join('、')+'。以下建議由命局與運程證據生成，不等同事件預言。',career:c,relationship:r,actionPlan:unique(c.actions.slice(0,2).concat(r.actions.slice(0,1))),confidence:{level:count>=7?'證據較多':count>=4?'證據中等':'證據有限',evidenceCount:count},generatedFromEvidence:true,legacyOverride:false,disclaimer:'命理分析供文化研究與生活規劃參考；重大職涯、感情與財務決定仍應依實際資訊及專業意見判斷。'};}
function safeGenerate(r,c){try{return {ok:true,result:generate(r,c)};}catch(e){return {ok:false,error:String(e&&e.message||e)};}}
var api=Object.freeze({generate:generate,safeGenerate:safeGenerate});if(!root.TianhengZipingAdvice)root.TianhengZipingAdvice=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
