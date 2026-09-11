(function(root){'use strict';
var GOD={
  比肩:{role:'守住自身位置、與同輩並肩的人',habit:'遇事先靠自己，直到負擔過重才讓別人知道',gift:'獨立推進、守住原則，也能理解同層夥伴的處境',cost:'把協助誤認為干涉，或在資源有限時仍堅持各做各的',step:'挑一件不必獨自完成的事，清楚說出你要的協助與界線'},
  劫財:{role:'在競爭與資源交換中求生的人',habit:'先回應人情與局勢，再處理自己的成本',gift:'快速動員、人脈整合與危機應變',cost:'替關係墊付太多，最後才發現分工、分潤或承諾不清',step:'把一項合作的責任、金額、期限與退出條件寫清楚'},
  食神:{role:'以作品、照顧或手藝讓生活安定的人',habit:'希望先把氣氛照顧好，再談自己的要求',gift:'把複雜事說清楚、做成作品，並創造讓人安心的節奏',cost:'停在舒服與準備，真正需要交付時反而延後',step:'選一項能力，在三十天內完成一個看得見、能交付的版本'},
  傷官:{role:'看見舊規則漏洞並嘗試改法的人',habit:'一感到不合理就先指出問題，較晚處理對方能否接住',gift:'洞察問題、創新表達與突破僵化流程',cost:'正確的內容因語氣或時機，變成與制度、長輩或權威對抗',step:'提出問題時，同時帶上一個替代方案與可驗收結果'},
  偏財:{role:'穿梭不同人群、交換機會與資源的人',habit:'先看外面的機會，再回頭確認自己的容量',gift:'市場感、連結外部資源與把握變化',cost:'選項太多、戰線太廣，現金與注意力被分散',step:'只保留一個最能在期限內驗證的機會，其他先列入等待'},
  正財:{role:'用穩定交付守住家庭與生活秩序的人',habit:'先完成責任，再允許自己休息或改變',gift:'務實、可靠，能把抽象期待變成可管理的成果',cost:'把安全感綁在收入與責任上，長期忽略身體和真正需求',step:'重新列出固定責任，刪掉一項已不再需要由你承擔的工作'},
  七殺:{role:'在壓力、期限與高要求中磨出能力的人',habit:'危機一來就接管局面，很少先承認自己也需要緩衝',gift:'攻堅、決斷與在限制中快速成長',cost:'習慣靠壓力啟動，事情平靜時反而不知道如何前進',step:'把目前最大壓力拆成七天內能完成的一個決定，不一次扛完整局'},
  正官:{role:'維持規則、秩序與承諾可信度的人',habit:'先問自己應不應該，再問自己真正想不想',gift:'責任感、制度能力與取得長期信任',cost:'怕犯錯而過度服從標準，讓真正意見一直延後',step:'找出一條已不合現況的規則，提出正式、可被討論的調整'},
  偏印:{role:'在陌生環境中靠觀察、研究與轉念找出口的人',habit:'先在腦中推演很多版本，確定安全才願意落地',gift:'深入研究、轉換視角與學習冷門專業',cost:'想法跳躍、實作斷續，或在需要回應時突然退回自己的世界',step:'把一個研究中的想法做成最小實驗，七天後只看結果再修正'},
  正印:{role:'保存知識、照顧傳承並替人承接經驗的人',habit:'先理解與準備，等到把握夠高才開始',gift:'學習、整合、支持別人與建立可傳承的方法',cost:'準備太久、依賴熟悉資源，錯過實際回饋',step:'停止新增資料一週，用現有知識完成一份可讓別人使用的成果'}
};
var ELEMENT={
  木:{use:'成長、規劃與協商',practice:'固定學習一項可累積能力，並把目標拆成每週一步'},
  火:{use:'啟動、表達與被看見',practice:'把作息往白天移，用規律活動與公開成果增加穩定的火'},
  土:{use:'承接、落地與守住秩序',practice:'建立固定流程、期限與完成標準，一次處理一件能落地的事'},
  金:{use:'判斷、界線與整理',practice:'刪除無效步驟，為重要決定寫下必要條件與停止條件'},
  水:{use:'觀察、變通與保存能量',practice:'保留安靜思考與休息時間，為計畫準備替代路線與緩衝'}
};
var ISSUE={
  work:{label:'工作與方向',scene:'你正在找的不是一個漂亮職稱，而是哪種工作方式能讓能力被持續使用',questions:['過去三次工作轉折，是你主動離開、環境中斷，還是責任突然增加？','你最常被交付的是救火、整理、對人，還是創造新方法？','最近一次真正有成就感的成果，是否符合本盤顯示的主要十神功能？']},
  relationship:{label:'感情與關係',scene:'要核對的不是「遇見誰」，而是你在靠近、承諾與衝突時是否重複同一種位置',questions:['過去重要關係中，你通常是先承擔、先退讓，還是先要求答案的人？','關係改變前，是否都出現相似的沉默、責任或界線問題？','目前這段關係有沒有一個能在期限內確認的實際回應？']},
  family:{label:'家庭與責任',scene:'這個領域的核心是哪些責任真的是你的，哪些只是長期習慣由你接住',questions:['家中出現問題時，第一個被找的人通常是不是你？','你承擔最多的部分，是金錢、情緒、決定，還是日常照顧？','如果少做一件事，哪件最能看出家人是否願意重新分工？']},
  money:{label:'金錢與安全感',scene:'這裡要看的不是偏財運口號，而是收入、責任與風險如何反覆影響你的選擇',questions:['最近三次金錢壓力，分別來自收入中斷、支出增加、合作，還是決策過快？','你較容易因為責任、人情，還是新機會改變原本預算？','目前哪一筆投入能設定明確上限與停止條件？']},
  self:{label:'自我與內在',scene:'反覆感不是命定懲罰，而是舊有保護方式在新階段仍自動啟動',questions:['壓力來時，你最先出現的是控制、逃開、討好，還是獨自硬撐？','哪一種稱讚或批評最容易讓你立刻改變決定？','如果不需要證明自己，你現在最想保留哪一件事？']}
};
var REL={子:{午:'六沖',丑:'六合'},丑:{未:'六沖',子:'六合'},寅:{申:'六沖',亥:'六合'},卯:{酉:'六沖',戌:'六合'},辰:{戌:'六沖',酉:'六合'},巳:{亥:'六沖',申:'六合'},午:{子:'六沖',未:'六合'},未:{丑:'六沖',午:'六合'},申:{寅:'六沖',巳:'六合'},酉:{卯:'六沖',辰:'六合'},戌:{辰:'六沖',卯:'六合'},亥:{巳:'六沖',寅:'六合'}};
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function relation(a,b){return REL[a]&&REL[a][b]||a===b&&'伏吟'||'無直接合沖'}
function currentYun(r,year){return r.dayun.list.find(function(x){return year>=x.startYear&&year<x.startYear+10})||r.dayun.list[0]}
function interactions(r){var day=r.pillars[2].zhi;return r.pillars.filter(function(x,i){return i!==2}).map(function(x){return{label:x.label,zhi:x.zhi,type:relation(day,x.zhi)}}).filter(function(x){return x.type!=='無直接合沖'})}
function build(pack,issueKey,year){var r=pack.r,a=pack.a,issue=ISSUE[issueKey]||ISSUE.self,rank=Object.entries(r.strength.counts).sort(function(a,b){return b[1]-a[1]}),high=rank[0],low=rank[rank.length-1],theme=a&&GOD[a.geJu.shiShen]?a.geJu.shiShen:r.details[1].tenGod,meta=GOD[theme]||GOD.正印,links=interactions(r),yun=currentYun(r,year),yunGod=root.TianhengBaziChartV1.tenGod(r.pillars[2].gan,yun.gan),yunMeta=GOD[yunGod]||GOD.正印,yunRel=relation(r.pillars[2].zhi,yun.zhi),pattern=a?a.geJu.geJu:'格局待核',linkText=links.length?links.map(function(x){return x.label+x.zhi+'與日支'+x.type}).join('；'):'日支與其餘三支未見直接六合、六沖或伏吟';
  return{
    title:'從「'+meta.role+'」走向能選擇自己的人',
    lead:'這份故事的核心不是替你指定某個前世身分，而是辨認一個熟悉的生存角色：'+meta.role+'。它可能曾保護你，也可能在今天變成反覆消耗。',
    chapters:[
      {title:'一、前世象徵｜曾經熟悉的角色',text:'以'+pattern+'為主軸，月柱'+r.pillars[1].gan+r.pillars[1].zhi+'把「'+theme+'」推到故事中央。象徵上，你像是'+meta.role+'；重點不是年代與姓名，而是你很熟悉如何在這種位置上生存。',proof:'月令 '+r.pillars[1].zhi+'・格局 '+pattern+'・主題十神 '+theme},
      {title:'二、未完課題｜為什麼同類問題會再來',text:meta.habit+'。'+linkText+'。因此反覆出現的往往不是同一個人或同一件事，而是你又站回熟悉的位置，用舊方法處理新的關係。',proof:'十神慣性 '+theme+'・'+linkText},
      {title:'三、帶來今生的能力',text:'這個模式留下的不是只有負擔，也帶來「'+meta.gift+'」的能力。命盤中'+high[0]+'為 '+high[1].toFixed(1)+'，代表你較常先動用'+ELEMENT[high[0]].use+'；它是資源，但用得太快也可能蓋過其他選擇。',proof:'主題十神 '+theme+'・五行最高 '+high[0]+' '+high[1].toFixed(1)},
      {title:'四、今生課題｜這次可以換一種活法',text:'你現在關注的是「'+issue.label+'」。'+issue.scene+'。真正需要鬆開的是：'+meta.cost+'。'+low[0]+'只有 '+low[1].toFixed(1)+' 並不代表一定要硬補，而是提醒你較少主動使用'+ELEMENT[low[0]].use+'。',proof:'使用者選擇 '+issue.label+'・五行最低 '+low[0]+' '+low[1].toFixed(1)}
    ],
    current:{title:'五、目前大運正在引動什麼',text:'目前落在 '+yun.gan+yun.zhi+' 大運（'+yun.startYear+'–'+(yun.startYear+9)+'），大運天干對日主為'+yunGod+'，把「'+yunMeta.role+'」的議題帶到前面。運支與日支為'+yunRel+'；這是當前容易被碰到的主題，不代表特定事件一定發生。',proof:'目前年份 '+year+'・'+yun.gan+yun.zhi+'大運・'+yunGod+'・運支與日支 '+yunRel},
    action:{title:'未來三十天的練習',text:meta.step+'；同時，'+ELEMENT[low[0]].practice+'。只選一項執行，三十天後用實際結果判斷是否有效。',proof:'主題十神的修正方式＋較少使用的'+low[0]+'元素'},
    avoid:{title:'先避免',text:'不要把「前世」當成替現在決定的理由，也不要只靠顏色、飾品或一次性消費改運。若故事與你的經歷對不上，就保留差異，不勉強套用。',proof:'象徵敘事邊界'},
    questions:issue.questions,
    evidence:['四柱：'+r.pillars.map(function(x){return x.label+x.gan+x.zhi}).join('・'),'日主：'+r.details[2].gan+r.details[2].ganElement+'；身勢：'+r.strength.label+'；扶助比例 '+(r.strength.ratio*100).toFixed(1)+'%','格局：'+pattern+'；主題十神：'+theme,'日支互動：'+linkText,'目前大運：'+yun.gan+yun.zhi+'（'+yunGod+'）','精度限制：未納入出生地真太陽時、個人完整經歷與可驗證的前世資料']
  }
}
function analyze(input,issueKey,year){var r=root.TianhengBaziChartV1.analyze(input),adv=root.TianhengBaziEngine.safeAnalyze(r.pillars);return{r:r,a:adv.ok?adv.data:null,story:build({r:r,a:adv.ok?adv.data:null},issueKey,year)}}
root.TianhengLifeStoryV1=Object.freeze({version:'1.0.0',build:build,analyze:analyze,relation:relation,GOD:GOD,ELEMENT:ELEMENT,ISSUE:ISSUE});
if(typeof document==='undefined')return;
var $=function(id){return document.getElementById(id)};
function chapter(x,no,cls){return'<article class="chapter '+(cls||'')+'" data-no="'+esc(no)+'"><h3>'+esc(x.title)+'</h3><p>'+esc(x.text)+'</p><small class="proof">依據：'+esc(x.proof)+'</small></article>'}
function render(pack){var r=pack.r,s=pack.story,name=$('name').value.trim(),prefix=name?name+'，':'';$('opening').innerHTML='<small>本次核心課題</small><h2>'+esc(s.title)+'</h2><p>'+esc(prefix+s.lead)+'</p>';$('pillars').innerHTML=r.details.map(function(x){return'<div class="pillar"><small>'+esc(x.label)+'</small><b>'+esc(x.gan+x.zhi)+'</b><em>'+esc(x.tenGod)+'</em></div>'}).join('');$('chapters').innerHTML=s.chapters.map(function(x,i){return chapter(x,'0'+(i+1))}).join('');$('practice').innerHTML=chapter(s.current,'05')+chapter(s.action,'06','action')+chapter(s.avoid,'07','avoid')+'<article class="chapter" data-no="問"><h3>三個現實核對問題</h3><ol class="questions">'+s.questions.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ol><small class="proof">只有能被經歷反覆核對的部分才保留</small></article>';$('evidence').innerHTML='<ul>'+s.evidence.map(function(x){return'<li><b>'+esc(x.split('：')[0])+'：</b>'+esc(x.split('：').slice(1).join('：'))+'</li>'}).join('')+'</ul><p class="disclaimer">本功能屬命理文化的象徵性自我整理，不是宗教認證、心理診斷或歷史事實證明，也不替代醫療、法律、財務與重大人生決策。</p>';$('result').classList.remove('hidden');$('result').scrollIntoView({behavior:'smooth'})}
$('go').addEventListener('click',function(){try{var date=$('birth').value,time=$('time').value;if(!date||!time)throw Error('請完整輸入出生日期與時間');var d=date.split('-').map(Number),t=time.split(':').map(Number);$('error').textContent='';render(analyze({year:d[0],month:d[1],day:d[2],hour:t[0],minute:t[1],sex:$('sex').value,ziSchool:$('zi').value},$('issue').value,new Date().getFullYear()))}catch(e){$('error').textContent=e&&e.message||String(e)}});
$('clear').addEventListener('click',function(){$('result').classList.add('hidden');$('opening').innerHTML='';$('chapters').innerHTML='';$('practice').innerHTML='';window.scrollTo({top:0,behavior:'smooth'})});
})(typeof window!=='undefined'?window:globalThis);
