'use strict';

(function attachMeihuaNarrative(root){
  const VERSION='1.0.0';
  const TOPICS={
    exam:{subject:'這次考試／證照結果',actor:'題目難度、及格標準、臨場表現與成績認定',checkpoint:'官方成績、合格通知或證照核發結果',action:'先核對考試範圍、及格門檻與放榜日期；考後記下有把握與不確定的題目比例'},
    career:{subject:'這件工作／事業進展',actor:'對方的決策流程、名額與資源',checkpoint:'正式通知、決策人回覆或下一階段安排',action:'把負責人、條件與回覆期限列成一張追蹤表'},
    relationship:{subject:'這段關係的互動',actor:'對方的投入、回應與界線',checkpoint:'一次明確對話以及之後是否持續行動',action:'用一個具體問題確認彼此期待，之後只觀察可重複的行動'},
    finance:{subject:'這筆財務／收款進展',actor:'合約、付款條件與現金流',checkpoint:'正式帳務、入帳或具約束力的文件',action:'先核對金額、付款節點、責任與最壞損失'},
    decision:{subject:'這項選擇',actor:'兩個方案的成本、期限與退出條件',checkpoint:'最能改變選擇的關鍵資料',action:'先做可逆的小步測試，再決定是否擴大投入'},
    general:{subject:'所問之事',actor:'外部條件與實際承諾',checkpoint:'一個能被日期與事件核對的結果',action:'把問題拆成下一個可完成、可查證的行動'}
  };
  const RELATION_TEXT={
    用生體:'外部條件正在回補你，主導權不必全靠自己硬撐',
    比和:'你與外部條件方向相近，協調成本相對較低',
    體克用:'你仍能控制局面，但需要持續投入管理與執行成本',
    體生用:'目前主要由你輸出資源，若對方沒有回應，容易形成單向消耗',
    用克體:'外部規則或對方決定正在壓制你，短期不宜只靠意志硬推'
  };
  const LINE_TEXT={
    1:'初爻動，變化剛開始，現在最重要的是確認起點與第一個訊號，不宜把早期跡象當成結果。',
    2:'二爻動，事情已進入實際互動層，執行細節與身邊人的配合會直接影響後續。',
    3:'三爻動，正處於內外轉折處；原有做法開始碰到邊界，適合先停下來核對條件。',
    4:'四爻動，外部環境已開始介入，決策人、制度或對方態度比個人期待更關鍵。',
    5:'五爻動，事情接近核心決策層，真正有權拍板的人與正式承諾將決定結果。',
    6:'上爻動，原局已走到收尾或過度之處，應評估結案、轉向或停止追加成本。'
  };

  function topicKey(category){
    if(/考試|證照|檢定|測驗|成績/.test(category))return'exam';
    if(/感情|人際|婚/.test(category))return'relationship';
    if(/財|收入|收款|投資/.test(category))return'finance';
    if(/工作|事業|求職|升遷|合作/.test(category))return'career';
    if(/選擇|決策/.test(category))return'decision';
    return'general';
  }
  function unique(values){return[...new Set(values.filter(Boolean))]}
  function paragraph(title,text,evidenceRefs){return{title,text,evidenceRefs:unique(evidenceRefs)}}
  function stageTurn(initial,final,topic){
    if(initial.polarity==='resistance'&&final.polarity==='support')return`起初${topic.actor}形成限制，但末段轉為${final.relation}，代表後續存在條件回補或關係重新協調的空間。這不是立即翻盤，而是要等外部節點真正成立。`;
    if(initial.polarity==='support'&&final.polarity==='resistance')return`起初條件較順，但末段轉為${final.relation}，表示越接近結果越要注意成本、規則或對方態度的反轉；前段順利不能直接外推成最後成功。`;
    if(initial.polarity==='support'&&final.polarity==='support')return`起段與末段都偏支持，方向具有延續性；不過仍須以${topic.checkpoint}確認，避免把象意上的順勢當成已完成。`;
    return`起段與末段都帶阻力，表示問題不是一次溝通即可解除；應先處理${topic.actor}，再判斷是否值得繼續投入。`;
  }
  function middleText(events,hexagram){
    const names=unique(events.map(x=>x.relation));
    if(names.length===1)return`互卦${hexagram.fullName}的兩個中段訊號同為「${names[0]}」，內部發展方向較一致：${RELATION_TEXT[names[0]]}。`;
    return`互卦${hexagram.fullName}同時出現「${names.join('」與「')}」，表示中途不是單一路線；一邊提供助力，另一邊仍要求付出或承受限制，需分開核對。`;
  }
  function seasonText(result,topic){
    const month=result.monthContext;const strength=result.strength;const body=result.core.bodyUse.body;
    if(!month.available)return`目前沒有可核對的月支，因此${topic.subject}的時令強弱保持未判；本次只能談結構與條件，不能把時間說得過度精確。`;
    const state=strength.bodyState;
    const meaning=state==='旺'||state==='相'?'你有較多承接與調整空間':state==='囚'||state==='死'?'你的承受力偏弱，應降低同時處理的成本':'力量平常，成敗更依賴外部條件是否落實';
    return`${month.monthZhi}月屬${month.season}，體卦${body.name}${body.element}為「${state}」：${meaning}。這一層只修正可承受程度，不會覆蓋本卦到變卦的方向。`;
  }
  function conclusionText(result,topic){
    const o=result.outcome;const conflict=result.evidenceLedger.support.length&&result.evidenceLedger.resistance.length;
    if(o.direction==='favorable')return`綜合判為「${o.label}」：目前支持證據較完整，但真正可以當成進展的不是感覺變好，而是${topic.checkpoint}。在節點出現前，採取可逆行動最安全。`;
    if(o.direction==='blocked')return`綜合判為「${o.label}」：現階段先處理阻力，比繼續加碼更重要。若${topic.checkpoint}仍未出現，就應把延後、換方案或停止投入列入選項。`;
    return`綜合判為「${o.label}」：${conflict?'支持與阻力同時存在，哪一方先被現實事件引動，才會決定方向':'現有證據不足以可靠地分成成功或失敗'}。下一步應以${topic.checkpoint}作為揭盲點。`;
  }
  function directAnswer(result,question,topic){
    const o=result.outcome;
    if(o.direction==='favorable')return`直接回答「${question}」：目前卦局偏向有利，較接近「有機會達成」，但不能直接寫成一定成功。最後仍以${topic.checkpoint}為準。`;
    if(o.direction==='blocked')return`直接回答「${question}」：目前阻力高於支持，較接近「不容易達成」；若要改變結果，必須先出現能解除主要限制的明確事件。`;
    if(o.direction==='conditional')return`直接回答「${question}」：目前不是穩過或穩不過，而是接近條件局；關鍵在支持條件能否先於阻力落實。`;
    return`直接回答「${question}」：目前證據不足，不能負責任地判定成功或失敗；需要更多可核對條件才能下結論。`;
  }
  function compose(result,input){
    if(!result||!result.core||!result.timeline)throw new Error('梅花敘事層缺少判斷結果');
    const topic=TOPICS[topicKey(result.core.request.category)];
    const c=result.core;const initial=result.timeline.initial.event;const middle=result.timeline.middle.events;const final=result.timeline.final.event;
    const paragraphs=[
      paragraph('問題焦點',`你問的是「${c.request.question}」。本卦${c.primary.fullName}以${c.bodyUse.body.name}${c.bodyUse.body.element}為體、${c.bodyUse.use.name}${c.bodyUse.use.element}為用；體代表你可承接與控制的部分，用代表${topic.actor}。${LINE_TEXT[c.movingLine]}`,['REQUEST','PRIMARY_HEXAGRAM','BODY_USE',`MOVING_LINE_${c.movingLine}`]),
      paragraph('直接回答',directAnswer(result,c.request.question,topic),['QUESTION_DIRECT_ANSWER',`OUTCOME_${result.outcome.direction}`]),
      paragraph('起段判讀',`起段為「${initial.relation}」：${RELATION_TEXT[initial.relation]}。放到${topic.subject}來看，這描述的是目前的作用方式，不是單獨一句吉凶。`,['INITIAL_RELATION',initial.relation]),
      paragraph('中段與轉折',`${middleText(middle,c.mutual)} ${stageTurn(initial,final,topic)}`,['MUTUAL_HEXAGRAM',...middle.map(x=>x.relation),'FINAL_RELATION',final.relation]),
      paragraph('時令承受力',seasonText(result,topic),[result.monthContext.available?'MONTH_STRENGTH':'MONTH_UNRESOLVED',`BODY_STATE_${result.strength.bodyState}`]),
      paragraph('成敗關鍵',`支持分 ${result.outcome.supportScore}、阻力分 ${result.outcome.resistanceScore}，只用來檢查判斷是否一致。真正關鍵是：${topic.actor}是否在期限內形成可核對結果；若末段「${final.relation}」所代表的條件沒有落實，就不能只憑前段順勢認定成功。`,['EVIDENCE_BALANCE','FINAL_RELATION',final.relation]),
      paragraph('綜合裁決',conclusionText(result,topic),['EVIDENCE_BALANCE',`OUTCOME_${result.outcome.direction}`])
    ];
    const directionAction=result.outcome.direction==='favorable'?'先用一個低成本、可回收的小步行動測試支持條件是否真的存在':result.outcome.direction==='blocked'?'先降低新增投入，集中處理最強的外部限制': '設定一個等待期限；期限內只蒐集能改變判斷的新證據';
    const advice={
      canDo:unique([`${topic.action}；完成後記錄日期與對方實際回覆`,directionAction,initial.polarity==='resistance'?'先處理眼前最強的外部限制，再決定是否追加投入':null]),
      avoid:unique([...result.advice.avoid,final.polarity==='resistance'?'不要因起步順利就忽略末段成本上升或條件反轉':null,result.outcome.direction==='favorable'?'不要把「偏有利」改寫成「一定成功」':null]),
      verify:unique([`${topic.checkpoint}是否在你設定的期限內出現`,...result.advice.verify]),
      timing:unique(result.advice.timing)
    };
    return{engine:'tianheng-meihua-narrative',version:VERSION,mode:'deterministic_evidence_narrative',usesExternalApi:false,legacyOverride:false,topic:topicKey(c.request.category),paragraphs,advice,evidenceTrace:unique(paragraphs.flatMap(x=>x.evidenceRefs))};
  }
  const api={version:VERSION,legacyOverride:false,usesExternalApi:false,compose};
  root.TianhengMeihuaNarrative=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
