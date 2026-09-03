'use strict';

(function attachWenshiNarrative(root){
  const VERSION='1.0.0';
  const TOPICS={
    exam_certification:{subject:'考試／證照結果',checkpoint:'官方成績、合格通知或證照核發結果',action:'核對及格標準、放榜日期與補考規則，考後另記有把握與不確定題目'},
    career_job:{subject:'求職／工作進展',checkpoint:'職缺是否仍有效、誰有決定權、何時正式回覆',action:'把職務條件、決策人與回覆期限整理成可追蹤事項'},
    career_promotion:{subject:'升遷／職位變動',checkpoint:'名額、評核標準與主管正式決定',action:'確認升遷標準、競爭條件與下一次評核節點'},
    cooperation:{subject:'合作／客戶進展',checkpoint:'權責、交付、付款與退出條款是否被確認',action:'把口頭共識轉成含期限與負責人的書面項目'},
    contract:{subject:'合約／文件結果',checkpoint:'有權簽署者與正式文件是否完成',action:'逐條核對責任、金額、違約與退出條件'},
    finance_income:{subject:'收入／收款進展',checkpoint:'款項是否依條件實際入帳',action:'核對金額、付款節點、憑證與逾期處理方式'},
    relationship:{subject:'感情／人際互動',checkpoint:'對方回覆後是否有持續且一致的行動',action:'用一次具體對話確認期待、界線與可投入程度'},
    family_peer:{subject:'家庭／生活問題',checkpoint:'相關人的分工與實際承諾是否落實',action:'把責任、期限與可調整範圍逐項說清楚'},
    decision:{subject:'選擇／決策',checkpoint:'最能改變選擇的現實資料是否補齊',action:'先做可逆的小步測試，設定停止與轉向條件'}
  };
  const CODE_TEXT={
    MONTH_SAME:'用神臨月建，所問事項在當期得到直接支撐',DAY_SAME:'用神臨日，當下有明確承接點',SOURCE_MOVING:'元神發動，支持力量不是完全靜止',RETURN_GENERATES:'用神回頭生，行動後有回補',ADVANCE_CHANGE:'用神化進，後續動能增加',CHANGED_USEFUL_APPEARS:'變爻出現用神，轉機在變化後才顯現',MONTH_BREAK:'用神月破，當期結構受損，不能只靠催促修復',XUN_EMPTY:'用神旬空，承諾或條件尚未落實',RETURN_CONTROLS:'用神回頭克，事情推進後反而增加限制',RETREAT_CHANGE:'用神化退，後續動能減弱',SEASON_WEAK:'用神失令，承接事情的力量不足',CALENDAR_CONTROLS:'日月克制用神，外部時間條件形成壓力',ACTIVE_CLASH_USEFUL:'用神受動爻沖，局面容易被突發變化打斷'};
  function unique(values){return[...new Set(values.filter(Boolean))]}
  function paragraph(title,text,evidenceRefs){return{title,text,evidenceRefs:unique(evidenceRefs)}}
  function topic(input){return TOPICS[input.topic]||{subject:'所問之事',checkpoint:'一個可記錄日期與結果的現實節點',action:'先確認成功標準、期限與可逆的下一步'}}
  function lineRole(line){
    const roles=[];if(line.shi)roles.push('世爻');if(line.ying)roles.push('應爻');if(line.moving)roles.push('動爻');
    return roles.length?roles.join('、'):'靜爻';
  }
  function evidenceSentence(items,empty){
    if(!items.length)return empty;
    return items.map(item=>CODE_TEXT[item.code]||item.text).join('；')+'。';
  }
  function changeSentence(synthesis,selected){
    if(!selected)return'用神未明現，需先完成伏神與出伏條件，不能跳過此層硬斷成敗。';
    const changes=synthesis.interactions.adjudication.changeEvents.filter(x=>x.position===selected.position);
    if(!changes.length)return`用神所在第${selected.position}爻沒有發動，本次判斷主要看日月、沖合與其他動爻是否引動它，而不是把「靜」直接解讀成沒有結果。`;
    const change=changes[0];
    return`第${selected.position}爻由${change.from.najia}${change.from.relation}變為${change.to.najia}${change.to.relation}，事件為「${change.events.join('、')||'一般動變'}」；因此後續要看變爻是補強、消耗還是反向控制原用神。`;
  }
  function conclusion(synthesis,t){
    const o=synthesis.outcome;
    if(o.direction==='favorable')return`目前判為「${o.label}」，意思是支持條件較集中，不等於保證成功。只有在現實上能確認「${t.checkpoint}」時，才能把卦上的支持轉成結果。`;
    if(o.direction==='blocked')return`目前判為「${o.label}」，重點是先解除最強阻斷，而不是繼續加碼。若到了期限仍無法確認「${t.checkpoint}」，就應評估延後、改路徑或停止投入。`;
    if(o.direction==='conditional')return`目前判為「${o.label}」：支持與阻力同時存在，結果取決於哪一組條件先被引動。下一步以「${t.checkpoint}」是否被確認作為分界。`;
    return`目前判為「${o.label}」：證據不足以可靠分成成功或失敗。先補齊「${t.checkpoint}」，再重新判讀會比硬猜更有價值。`;
  }
  function directAnswer(synthesis,input,t){
    const o=synthesis.outcome;
    if(o.direction==='favorable')return`直接回答「${input.question}」：目前支持條件較集中，較接近有機會達成，但仍不能當成保證；最後以${t.checkpoint}為準。`;
    if(o.direction==='blocked')return`直接回答「${input.question}」：目前主要阻力偏強，較接近不容易達成；除非後續出現明確救應，否則不宜先當成已通過。`;
    if(o.direction==='conditional')return`直接回答「${input.question}」：目前是有條件局，不能簡化成一定會或一定不會；支持與阻力哪一方先落實，才會決定結果。`;
    return`直接回答「${input.question}」：目前證據不足，暫時不能可靠判定成功或失敗，應等待${t.checkpoint}揭曉。`;
  }
  function compose(synthesis,input){
    if(!synthesis||!synthesis.interactions)throw new Error('六爻敘事層缺少綜合結果');
    const t=topic(input);const a=synthesis.interactions.adjudication;const structure=a.evidence.structure;const selected=a.usefulGod.selected;
    const support=synthesis.evidenceLedger.support;const resistance=synthesis.evidenceLedger.resistance;const unresolved=synthesis.evidenceLedger.unresolved;
    const usefulText=selected?`本題以${a.usefulGod.definition.value}為用神，取第${selected.position}爻${selected.najia}${selected.relation}；此爻屬${lineRole(selected)}，月令為${selected.calendar.seasonalState}${selected.adjudicationFacts.xunEmpty?'、旬空':''}${selected.adjudicationFacts.monthBreak?'、月破':''}${selected.adjudicationFacts.dayClash?'、日沖':''}。`:`本題應取${a.usefulGod.definition.value}，但本卦沒有足以直接定向的明現用神，因此伏神與出伏條件必須保留。`;
    const paragraphs=[
      paragraph('問題與卦局',`你問的是「${input.question}」。主卦${structure.casting.primary.fullName}、變卦${structure.casting.changed.fullName}，所問類型是${t.subject}。卦名只描述局勢背景，真正裁決仍由用神、日月、動變與沖合共同完成。`,['REQUEST','PRIMARY_HEXAGRAM','CHANGED_HEXAGRAM']),
      paragraph('直接回答',directAnswer(synthesis,input,t),['QUESTION_DIRECT_ANSWER',`OUTCOME_${synthesis.outcome.direction}`]),
      paragraph('用神落點',usefulText,['USEFUL_GOD',selected?`LINE_${selected.position}`:'USEFUL_HIDDEN',selected?`SEASON_${selected.calendar.seasonalState}`:null]),
      paragraph('支持條件',evidenceSentence(support,'目前沒有足以直接定向的支持證據；這不等於一定失敗，只代表不能把期待當成助力。'),support.length?support.map(x=>x.code):['SUPPORT_NONE']),
      paragraph('阻力與未定處',`${evidenceSentence(resistance,'未見主要硬阻力。')}${unresolved.length?' 尚未裁定：'+unresolved.map(x=>x.text).join('；')+'。':''}`,[...resistance,...unresolved].length?[...resistance,...unresolved].map(x=>x.code):['RESISTANCE_NONE']),
      paragraph('動變過程',changeSentence(synthesis,selected),['CHANGE_EVENTS']),
      paragraph('成敗關鍵',`目前共有 ${support.length} 項支持、${resistance.length} 項阻力與 ${unresolved.length} 項未定證據。真正分界不是卦名好不好，而是「${t.checkpoint}」能否在期限內被正式確認；未確認以前只能保留暫定方向。`,['EVIDENCE_LEDGER','DECISION_CHECKPOINT']),
      paragraph('綜合裁決',conclusion(synthesis,t),[`OUTCOME_${synthesis.outcome.direction}`,'EVIDENCE_LEDGER'])
    ];
    const codes=unique([...support,...resistance,...unresolved].map(x=>x.code));
    const advice={
      canDo:unique([`${t.action}；每一項都附上負責人與可查證日期`,...synthesis.advice.canDo.slice(1),codes.includes('MONTH_BREAK')?'先處理當期結構性阻斷，再選擇下一個窗口':null]),
      avoid:unique([...synthesis.advice.avoid,codes.includes('XUN_EMPTY')?'不要把口頭承諾、曖昧訊號或未簽文件當成已落實':null,synthesis.outcome.direction==='favorable'?'不要因「偏支持」就省略合約、名額或對方行動的核對':null]),
      verify:unique([t.checkpoint,...synthesis.advice.verify.slice(1)]),
      timing:unique(synthesis.timing.conditions)
    };
    return{engine:'tianheng-wenshi-narrative',version:VERSION,mode:'deterministic_evidence_narrative',usesExternalApi:false,legacyOverride:false,topic:input.topic,paragraphs,advice,evidenceTrace:unique(paragraphs.flatMap(x=>x.evidenceRefs))};
  }
  const api={version:VERSION,legacyOverride:false,usesExternalApi:false,compose};
  root.TianhengWenshiNarrative=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
