'use strict';

(function attachLiuYaoSynthesis(root){
  const Interactions=root.TianhengWenshiLiuYaoInteractions||(typeof require==='function'?require('./tianheng-wenshi-liuyao-interactions-v1.js'):null);
  const VERSION='1.0.0';

  function event(code,text,source,line=null){return{code,text,source,line};}

  function collect(interactions){
    const a=interactions.adjudication;
    const selected=a.usefulGod.selected;
    if(!selected)return{support:[],resistance:[],unresolved:[event('USEFUL_HIDDEN','用神未在本卦明現','伏神層')],selected:null};
    const support=a.evidenceLedger.support.map(x=>event(x.code,x.text,'日月／神煞',x.line));
    const resistance=a.evidenceLedger.resistance.map(x=>event(x.code,x.text,'日月／神煞',x.line));
    const unresolved=[];
    const change=a.changeEvents.find(x=>x.position===selected.position);
    if(change){
      if(change.events.includes('回頭生'))support.push(event('RETURN_GENERATES','用神動化回頭生','動變',selected.position));
      if(change.events.includes('化進神'))support.push(event('ADVANCE_CHANGE','用神化進神','動變',selected.position));
      if(change.events.includes('回頭克'))resistance.push(event('RETURN_CONTROLS','用神動化回頭克','動變',selected.position));
      if(change.events.includes('化退神'))resistance.push(event('RETREAT_CHANGE','用神化退神','動變',selected.position));
    }
    a.changeEvents.filter(x=>x.to.relation===a.usefulGod.definition.value).forEach(changedUseful=>{
      support.push(event('CHANGED_USEFUL_APPEARS',`第${changedUseful.position}爻動化${changedUseful.to.najia}${changedUseful.to.relation}，變爻出現用神`,'動變救應',changedUseful.position));
      if(a.calendarRules.xunKong.includes(changedUseful.to.zhi)){
        unresolved.push(event('CHANGED_USEFUL_XUN_EMPTY',`變出用神${changedUseful.to.zhi}仍在旬空，須等待出空或填實`,'動變應期',changedUseful.position));
      }
    });
    interactions.interactions.branchPairs.filter(x=>x.positions.includes(selected.position)&&x.active).forEach(pair=>{
      if(pair.type==='六沖')resistance.push(event('ACTIVE_CLASH_USEFUL',`用神所在爻受動爻六沖（${pair.pair.join('')}）`,'卦內沖合',selected.position));
      if(pair.type==='六合')unresolved.push(event('ACTIVE_HARMONY_USEFUL',`用神所在爻遇動爻六合（${pair.pair.join('')}），合助或合絆需看所問事件`,'卦內沖合',selected.position));
    });
    interactions.interactions.trines.filter(x=>x.positions.includes(selected.position)&&x.active).forEach(trine=>{
      unresolved.push(event('ACTIVE_TRINE',`用神參與${trine.branches.join('')}三合${trine.element}的引動，但尚未判定成化`,'卦內三合',selected.position));
    });
    return{support,resistance,unresolved,selected};
  }

  function decide(collected){
    if(!collected.selected)return{direction:'unresolved',label:'未定',confidence:'low',rule:'用神未明現，不以伏神直接斷成敗'};
    const supportCodes=new Set(collected.support.map(x=>x.code));
    const resistanceCodes=new Set(collected.resistance.map(x=>x.code));
    const strongSupport=['MONTH_SAME','DAY_SAME','RETURN_GENERATES','CHANGED_USEFUL_APPEARS'].some(x=>supportCodes.has(x));
    const hardResistance=['MONTH_BREAK','RETURN_CONTROLS'].some(x=>resistanceCodes.has(x));
    const activated=collected.selected.moving||strongSupport||supportCodes.has('SOURCE_MOVING');
    if(strongSupport&&hardResistance)return{direction:'conditional',label:'有條件',confidence:'medium',rule:'強支持與硬阻力並見，保留轉機條件'};
    if(hardResistance&&!strongSupport)return{direction:'blocked',label:'目前受阻',confidence:'medium',rule:'用神見月破或回頭克，且無臨日月／回頭生救應'};
    if(collected.support.length&&collected.resistance.length)return{direction:'conditional',label:'有條件',confidence:'low',rule:'支持與阻力並存，避免二分吉凶'};
    if(collected.support.length&&!collected.resistance.length&&activated)return{direction:'favorable',label:'偏支持',confidence:'medium',rule:'用神有生扶或旺動，未見主要阻斷'};
    if(collected.resistance.length&&!collected.support.length)return{direction:'blocked',label:'目前受阻',confidence:'low',rule:'阻力存在而未見明確生扶'};
    return{direction:'unresolved',label:'未定',confidence:'low',rule:'靜態證據不足，暫不強斷'};
  }

  function adviceFor(topic,decision,collected){
    const codes=new Set([...collected.support,...collected.resistance,...collected.unresolved].map(x=>x.code));
    const canDo=[];
    const avoid=[];
    const verify=[];
    if(topic==='career_job'||topic==='career_promotion'){
      canDo.push('把職務條件、決策人與回覆期限轉成可追蹤的書面事項');
      verify.push('確認職缺、名額或決策流程是否仍有效');
    }else if(topic==='cooperation'||topic==='contract'){
      canDo.push('逐項確認權責、交付、付款與退出條款');
      verify.push('取得對方有決定權者的明確回覆');
    }else if(topic==='finance_income'){
      canDo.push('核對金額、付款節點與實際入帳條件');
      verify.push('以帳務或合約資料確認，不把口頭承諾視為入帳');
    }else if(topic==='relationship'){
      canDo.push('用一次具體對話確認雙方期待與可投入程度');
      verify.push('觀察對方後續行動是否與回覆一致');
    }else{
      canDo.push('先確認成功標準、期限與可逆的下一步');
      verify.push('補足能直接改變決策的現實資料');
    }
    if(codes.has('MONTH_BREAK')){canDo.push('先處理當前阻斷，待條件或週期改變後重新確認');avoid.push('在關鍵條件尚未落實時做不可逆承諾');}
    if(codes.has('XUN_EMPTY')){verify.push('確認承諾是否已有具體人、時間與文件承接');avoid.push('把尚未落實的訊號當成已經成立');}
    if(codes.has('RETURN_CONTROLS')){canDo.push('預先設置替代方案與停止條件');avoid.push('忽略執行後反向增加的成本或限制');}
    if(decision.direction==='favorable')avoid.push('因局勢偏支持就省略現實查證');
    if(decision.direction==='unresolved')avoid.push('在證據不足時要求系統硬給肯定或否定答案');
    return{canDo:[...new Set(canDo)],avoid:[...new Set(avoid)],verify:[...new Set(verify)],linkedEvidence:[...codes]};
  }

  function timingFor(collected){
    if(!collected.selected)return{dateResolved:false,conditions:['伏神是否出伏須先成立'],note:'尚不能換算日期'};
    const conditions=[];
    const f=collected.selected.adjudicationFacts;
    if(f.xunEmpty)conditions.push(`用神${collected.selected.zhi}逢出空、填實或沖空窗口`);
    if(f.monthBreak)conditions.push(`用神${collected.selected.zhi}待出月或逢合解破窗口`);
    if(collected.selected.moving)conditions.push(`用神${collected.selected.zhi}逢值、逢合或變爻引動窗口`);
    collected.support.filter(x=>x.code==='CHANGED_USEFUL_APPEARS').forEach(item=>{
      const changedZhi=item.text.match(/動化.[子丑寅卯辰巳午未申酉戌亥]/)?.[0]?.slice(-1);
      if(changedZhi)conditions.push(`變出用神${changedZhi}逢出空、值日或填實窗口`);
    });
    if(!conditions.length)conditions.push('目前只有支序條件，尚無足夠規則換算公曆日期');
    return{dateResolved:false,conditions,note:'未接可信萬年曆前，只提供觸發條件，不虛構日期'};
  }

  function explain(interactions,collected,decision){
    if(!collected.selected)return{
      basis:`${interactions.adjudication.usefulGod.definition.value}未在本卦明現，已轉查伏神。`,
      support:'目前沒有足以直接定向的明現用神證據。',
      resistance:'用神伏藏，飛伏與出伏條件尚未完成。',
      conclusion:`判為「${decision.label}」：${decision.rule}。`
    };
    const line=collected.selected;
    return{
      basis:`本題以${interactions.adjudication.usefulGod.definition.value}為主要用神，取第${line.position}爻${line.najia}${line.relation}。`,
      support:collected.support.length?collected.support.map(x=>x.text).join('；'):'未見明確支持證據。',
      resistance:collected.resistance.length?collected.resistance.map(x=>x.text).join('；'):'未見主要阻力證據。',
      conclusion:`判為「${decision.label}」：${decision.rule}。`
    };
  }

  function analyze(input){
    const interactions=Interactions.analyze(input);
    const collected=collect(interactions);
    const decision=decide(collected);
    return{
      engine:'tianheng-wenshi-liuyao-synthesis',version:VERSION,legacyOverride:false,
      status:'provisional_outcome_unvalidated',interactions,
      outcome:{...decision,probability:null,calibrationStatus:'awaiting_blind_validation'},
      evidenceLedger:{support:collected.support,resistance:collected.resistance,unresolved:collected.unresolved},
      explanation:explain(interactions,collected,decision),
      timing:timingFor(collected),
      advice:adviceFor(input.topic,decision,collected),
      safety:{notCertainPrediction:true,requiresRealWorldVerification:true},
      layers:{originalInteractions:interactions,provisionalOutcomeSeparate:true,legacyOverride:false}
    };
  }
  function safeAnalyze(input){try{return{ok:true,result:analyze(input)}}catch(error){return{ok:false,error:error.message}}}
  const api={version:VERSION,legacyOverride:false,collect,decide,analyze,safeAnalyze};
  root.TianhengWenshiLiuYaoSynthesis=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
