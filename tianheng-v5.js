/* 天衡 V5：九維視覺升級 + 六大交叉結論 */
(function(){'use strict';
var DIMS={
'性格總論':['◎','氣性根本','看你做事的底層節奏與反應模式'],
'八字四柱':['柱','命局根骨','看日主強弱、十神配置與喜用方向'],
'紫微斗數':['星','命宮主星','看人生舞台、角色定位與運勢重點'],
'姓名學':['名','五格韻象','看名字的結構、聲韻與後天助力'],
'生肖':['獸','本命屬相','看天性、互動模式與歲運觸發'],
'星盤':['辰','太陽星座','看外在性格、需求與人際表現'],
'筆畫結構':['筆','形勢剛柔','看字形節奏、力量與穩定度'],
'字形象徵':['象','部首意象','看名字視覺語意與人格投射'],
'五行屬性':['行','旺衰調候','看木火土金水的平衡與補益'],
'字義會意・聲韻':['音','音義交會','看字義、讀音與整體氣場'],
'大運流年':['運','運勢走向','看未來十年節奏與年度轉折']};
function text(){return document.body?document.body.innerText:''}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function score(label,fb){var m=text().match(new RegExp(label+'[^0-9]{0,20}(\\d{2,3})'));return m?clamp(+m[1],35,96):fb}
function overall(){var m=text().match(/(\d{2,3})[\s\n]*命\s*運\s*綜\s*評/);return m?clamp(+m[1],35,96):72}
function weak(){var m=text().match(/喜用神宜補([木火土金水])/);return m?m[1]:'木'}
function tone(s){return s>=80?'強勢窗口':s>=68?'穩步上升':s>=56?'平穩可守':'蓄勢調整'}
function addStyle(){if(document.getElementById('th-v5-style'))return;var s=document.createElement('style');s.id='th-v5-style';s.textContent='\
.th5-dim{position:relative!important;overflow:hidden!important;padding:18px 18px!important;border-radius:20px!important;border:1px solid rgba(191,151,79,.38)!important;background:linear-gradient(135deg,rgba(27,21,34,.94),rgba(8,9,15,.97))!important;box-shadow:0 12px 30px rgba(0,0,0,.18)!important;}\
.th5-dim:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(#d2ad62,#6f9f82);opacity:.7}.th5-dim-top{display:flex;align-items:center;gap:13px}.th5-icon{width:44px;height:44px;flex:0 0 44px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(210,173,98,.55);color:#e6c87f;background:radial-gradient(circle,rgba(210,173,98,.12),transparent 70%);font-size:14px;letter-spacing:.05em}.th5-copy{min-width:0}.th5-name{font-size:18px;color:#eee4d2;letter-spacing:.08em}.th5-sub{margin-top:4px;font-size:12px;color:#b9995e;letter-spacing:.12em}.th5-desc{margin-top:8px;color:#a99e8c;font-size:12px;line-height:1.65}.th5-cross{margin:30px 0 18px;padding:24px 20px;border:1px solid rgba(207,165,79,.55);border-radius:24px;background:linear-gradient(150deg,rgba(29,20,34,.97),rgba(7,9,14,.98));box-shadow:0 18px 42px rgba(0,0,0,.24)}.th5-cross-k{text-align:center;color:#d9ba73;letter-spacing:.28em;font-size:12px}.th5-cross-title{text-align:center;color:#f0e3c8;font-size:24px;letter-spacing:.12em;margin:8px 0 20px}.th5-cross-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.th5-insight{padding:16px;border-radius:16px;background:rgba(255,255,255,.025);border:1px solid rgba(195,156,86,.19)}.th5-insight b{display:block;color:#d8b66a;font-size:13px;letter-spacing:.12em;margin-bottom:7px}.th5-insight p{margin:0;color:#d7ccbb;font-size:14px;line-height:1.75}.th5-method{margin-top:16px;padding-top:14px;border-top:1px solid rgba(195,156,86,.16);color:#8f8578;font-size:11px;line-height:1.7;text-align:center}@media(max-width:700px){.th5-cross{padding:21px 15px;border-radius:20px}.th5-cross-grid{grid-template-columns:1fr}.th5-cross-title{font-size:21px}.th5-dim{padding:16px!important}.th5-name{font-size:17px}}';document.head.appendChild(s)}
function normalize(s){return (s||'').replace(/\s+/g,'')}
function enhanceDims(){var nodes=document.querySelectorAll('div,section,article,button,a');Object.keys(DIMS).forEach(function(k){for(var i=0;i<nodes.length;i++){var n=nodes[i],t=normalize(n.textContent);if(n.dataset.th5dim)continue;if(t.indexOf(k)!==0||t.length>30)continue;var d=DIMS[k];n.dataset.th5dim=k;n.classList.add('th5-dim');var old=n.innerHTML;n.innerHTML='<div class="th5-dim-top"><span class="th5-icon">'+d[0]+'</span><div class="th5-copy"><div class="th5-name">'+k+'</div><div class="th5-sub">'+d[1]+'</div><div class="th5-desc">'+d[2]+'</div></div></div>';break}})}
function insightData(){var o=overall(),love=score('感情',clamp(o+3,45,92)),career=score('事業',clamp(o+1,45,92)),wealth=score('財運',clamp(career-2,42,92)),e=weak();return[
['你的優勢',o>=78?'整體命盤承載力佳，適合把既有專長放大，越主動整合資源越容易形成自己的局。':'真正優勢在穩定與耐力；先把一項能力做深，比同時追多個方向更容易形成突破。'],
['你的隱憂',o>=78?'運勢走強時容易過度承擔，最需要防的是一口氣接太多責任，反而消耗判斷力。':'遇到壓力時容易先懷疑方向；避免因短期不順就推翻長期累積。'],
['感情關鍵',love>=75?'感情氣場偏活躍，主動表達與安排相處會比等待對方猜心更加分。':'感情屬慢熱型，先建立安全感與穩定互動，比追求強烈進展更適合。'],
['事業突破',career>=75?'近期適合談合作、推出方案、爭取資源；突破點在「主動把能力變成可見成果」。':'事業更適合整理流程、回訪舊客與提升轉換，先把基本盤做厚再擴張。'],
['財富策略',wealth>=75?'財運較利靠專業、人脈與正向現金流放大；避免只靠短線投機。':'先守現金流與固定成本，穩定累積比追高報酬更重要。'],
['近期轉折','喜用偏'+e+'，接下來遇到與'+e+'氣相應的人事物、月份或環境時，可視為較適合推進的重要窗口。']]
}
function findCross(){var ns=document.querySelectorAll('h1,h2,h3,h4,div,section');for(var i=0;i<ns.length;i++){var t=normalize(ns[i].textContent);if(t.indexOf('九維交叉推演')!==-1&&t.length<40)return ns[i]}return null}
function addCross(){if(document.getElementById('th-v5-cross'))return;var a=findCross();if(!a||!a.parentNode)return;var box=document.createElement('section');box.id='th-v5-cross';box.className='th5-cross';var cards=insightData().map(function(x){return '<div class="th5-insight"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>'}).join('');box.innerHTML='<div class="th5-cross-k">九 維 交 叉 結 論</div><div class="th5-cross-title">把命理翻成可執行的方向</div><div class="th5-cross-grid">'+cards+'</div><div class="th5-method">依八字、紫微、姓名、生肖、星盤、字形、五行、聲韻與流年等既有結果交叉整理；屬趨勢參考，不代表事件必然發生。</div>';a.parentNode.insertBefore(box,a.nextSibling)}
function run(){try{addStyle();enhanceDims();addCross()}catch(e){}}
var tm;function schedule(){clearTimeout(tm);tm=setTimeout(run,250)}
if(document.body){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()}else document.addEventListener('DOMContentLoaded',function(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()})
})();