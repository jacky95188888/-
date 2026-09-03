'use strict';

(function attachWenshiNarrative(root){
  const VERSION='1.2.0';
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
  function decisionSummary(synthesis){
    const outcome=synthesis.outcome;const support=synthesis.evidenceLedger.support.length;const resistance=synthesis.evidenceLedger.resistance.length;
    let label='五五波／條件局',tone='mixed';
    if(outcome.direction==='favorable'){label=support>=3?'明顯偏向達成':'略偏達成';tone='positive'}
    else if(outcome.direction==='blocked'){label=resistance>=3?'明顯偏向未達成':'略偏未達成';tone='negative'}
    else if(outcome.direction==='unresolved'){label='證據不足，暫不判';tone='open'}
    const moving=(synthesis.interactions.adjudication.changeEvents||[]).length>0;
    const processLabel=moving?'變化進行中／等待動爻落實':outcome.direction==='favorable'?'全程較順':outcome.direction==='blocked'?'阻力持續':'等待外部條件';
    return{label,strength:`結果方向：${label}`,processLabel,tone};
  }
  function contextText(input,t){
    const c=input&&input.eventContext;
    if(!c||!Object.values(c).some(Boolean))return`目前沒有補充${t.subject}的現實資料。六爻可以保存用神與日月動變，但不能自行知道當事人的準備程度、上次結果或實際門檻；若要判得更貼近事件，請補上這些資料。`;
    const parts=[];
    if(c.attempt)parts.push(`本次狀態：${c.attempt}`);
    if(c.eventDate)parts.push(`事件日期：${c.eventDate}`);
    if(c.priorResult)parts.push(`上次結果：${c.priorResult}`);
    if(c.preparation)parts.push(`目前準備：${c.preparation}`);
    if(c.knownFacts)parts.push(`其他已知事實：${c.knownFacts}`);
    return`本次判讀已納入你提供的現實資料：${parts.join('；')}。這些內容只用來對準具體事件，不會改動原始卦象；最後仍以${t.checkpoint}揭曉。`;
  }
  function examMetrics(input){
    const m=input&&input.eventContext&&input.eventContext.examMetrics||{};const number=value=>value===''||value==null?null:Number(value);
    return{priorScore:number(m.priorScore),passScore:number(m.passScore),mockScore:number(m.mockScore)};
  }
  function eventWord(input){return input.topic==='exam_certification'?'通過':input.topic==='relationship'?'改善':input.topic==='finance_income'?'入帳':'達成'}
  function evidenceQuality(input){const c=input&&input.eventContext||{};let count=0;['eventDate','priorResult','preparation','successDefinition','knownObstacle','strongestEvidence'].forEach(k=>{if(c[k])count++});const m=examMetrics(input);if(m.passScore!=null)count++;if(m.mockScore!=null)count++;return count>=6?'資料較完整':count>=3?'資料中等':'資料不足'}
  function realitySignal(input){
    if(input.topic!=='exam_certification')return'尚未提供可計算的現實門檻；卦象方向與實際條件需分開核對。';
    const m=examMetrics(input);
    if(m.mockScore!=null&&m.passScore!=null){const gap=Number((m.mockScore-m.passScore).toFixed(2));return gap>=0?`最近模擬成績已高於及格門檻 ${gap} 分；現實資料目前支持通過，但仍需維持計時作答穩定度。`:`最近模擬成績仍低於及格門檻 ${Math.abs(gap)} 分；現實資料尚未支持穩定通過。`;}
    if(m.priorScore!=null&&m.passScore!=null){const gap=Number((m.passScore-m.priorScore).toFixed(2));return gap>0?`上次成績距及格門檻尚差 ${gap} 分；這是本次重考最明確的補強目標。`:`上次成績已到門檻，需確認未通過原因是否另有科目、資格或程序限制。`;}
    return'尚未填入上次成績、及格門檻與模擬成績，因此不能把卦象強度換算成通過機率。';
  }
  function specificAction(input,t){
    if(input.topic!=='exam_certification')return`把「${t.checkpoint}」拆成一個負責人、一個期限與一項可驗證結果，下一次只追蹤這三項。`;
    const m=examMetrics(input);const scoreLine=m.passScore!=null?`以 ${m.passScore} 分為及格線，考前至少完成三次完整計時模考；連續兩次高於門檻，才算準備已落實。`:'先查清楚正式及格分數，再完成三次完整計時模考；連續兩次高於門檻，才算準備已落實。';
    return`${scoreLine} 把錯題只分成四類：知識缺口、題意誤判、時間不足、粗心；先處理失分最多的一類，而不是籠統要求自己更努力。`;
  }
  function processOutcome(synthesis,t){
    const changes=synthesis.interactions.adjudication.changeEvents||[];
    if(changes.length)return`動爻表示事情正在變化，描述的是「過程如何推進」，不是單獨等同成功或失敗。最後仍要回到用神是否得助、主要阻力是否解除，以及${t.checkpoint}是否出現。`;
    return`本卦目前沒有動爻，代表可見變化較少；這不等於沒有結果，也不代表努力無效。過程中的辛苦與當事人的努力要另外記錄，最終成敗仍看用神、日月與${t.checkpoint}。`;
  }
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
    const decision=decisionSummary(synthesis);decision.realitySignal=realitySignal(input);decision.evidenceQuality=evidenceQuality(input);
    const paragraphs=[
      paragraph('問題與卦局',`你問的是「${input.question}」。主卦${structure.casting.primary.fullName}、變卦${structure.casting.changed.fullName}，所問類型是${t.subject}。卦名只描述局勢背景，真正裁決仍由用神、日月、動變與沖合共同完成。`,['REQUEST','PRIMARY_HEXAGRAM','CHANGED_HEXAGRAM']),
      paragraph('直接回答',directAnswer(synthesis,input,t).replace('有機會達成',`較可能${eventWord(input)}`).replace('不容易達成',`較可能未${eventWord(input)}`),['QUESTION_DIRECT_ANSWER',`OUTCOME_${synthesis.outcome.direction}`]),
      paragraph('本次事件校正',contextText(input,t),['USER_EVENT_CONTEXT','REALITY_CHECK']),
      paragraph('成功標準與真正阻力',`本題的成功標準是「${input?.eventContext?.successDefinition||t.checkpoint}」；目前最需要排除的阻力是「${input?.eventContext?.knownObstacle||'尚未提供'}」。已知最強證據為「${input?.eventContext?.strongestEvidence||'尚未提供'}」。未提供的部分維持未判，不用套語補成答案。`,['SUCCESS_DEFINITION','KNOWN_OBSTACLE','STRONGEST_REALITY_EVIDENCE']),
      paragraph('具體補強目標',specificAction(input,t),['REALITY_THRESHOLD','ACTIONABLE_NEXT_STEP']),
      paragraph('過程不等於結果',processOutcome(synthesis,t),['CHANGE_EVENTS','USEFUL_GOD','DECISION_CHECKPOINT']),
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
    return{engine:'tianheng-wenshi-narrative',version:VERSION,mode:'deterministic_evidence_narrative',usesExternalApi:false,legacyOverride:false,topic:input.topic,decisionSummary:{...decision,probability:null,note:'不顯示虛構百分比；卦象只給方向，現實門檻另行校正。'},eventContext:input&&input.eventContext||null,paragraphs,advice,evidenceTrace:unique(paragraphs.flatMap(x=>x.evidenceRefs))};
  }
  const api={version:VERSION,legacyOverride:false,usesExternalApi:false,compose};
  root.TianhengWenshiNarrative=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
