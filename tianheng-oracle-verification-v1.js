(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.TianhengOracleVerificationV1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const LABELS={favorable:'偏向有利',blocked:'目前受阻',conditional:'有條件',unresolved:'證據不足'};
  function inferEventDate(question,nowValue){
    const text=String(question||'');
    const now=nowValue?new Date(nowValue):new Date();
    let m=text.match(/(20\d{2})\s*[年\/-]\s*(\d{1,2})\s*[月\/-]\s*(\d{1,2})\s*日?/);
    let year,month,day;
    if(m){year=Number(m[1]);month=Number(m[2]);day=Number(m[3]);}
    else{
      m=text.match(/(?:^|[^\d])(\d{1,2})\s*(?:月|\/)\s*(\d{1,2})\s*日?/);
      if(!m)return null;
      year=now.getFullYear();month=Number(m[1]);day=Number(m[2]);
    }
    const date=new Date(year,month-1,day,23,59,59,999);
    if(date.getFullYear()!==year||date.getMonth()!==month-1||date.getDate()!==day)return null;
    return date.toISOString();
  }
  function modeFor(question,nowValue){
    const eventDate=inferEventDate(question,nowValue);
    return{mode:eventDate&&new Date(eventDate)<new Date(nowValue||Date.now())?'retrospective':'prospective',eventDate};
  }
  function verdict(outcome){
    const direction=outcome&&outcome.direction||'unresolved';
    const label=LABELS[direction]||outcome&&outcome.label||'證據不足';
    const text={
      favorable:'支持條件較多，但仍需核對現實門檻，不能解讀為保證成功。',
      blocked:'主要阻力目前較強，先處理限制，再判斷是否繼續投入。',
      conditional:'支持與阻力同時存在，結果取決於關鍵條件是否真正落實。',
      unresolved:'現有證據不足以可靠二分成敗，先補資料或等待可驗證事件。'
    }[direction];
    return{direction,label,text,confidence:outcome&&outcome.confidence||'low'};
  }
  function makeRecord(input,outcome,actual,nowValue){
    const createdAt=new Date(nowValue||Date.now()).toISOString();
    return{
      schema:'tianheng-oracle-verification-v1',id:`THV-${createdAt.replace(/\D/g,'').slice(0,14)}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,
      createdAt,mode:modeFor(input.question,createdAt),
      originalPrediction:{createdAt,input:JSON.parse(JSON.stringify(input)),outcome:JSON.parse(JSON.stringify(outcome))},
      actual:{recordedAt:createdAt,outcome:actual.outcome,note:String(actual.note||'').trim()}
    };
  }
  return Object.freeze({inferEventDate,modeFor,verdict,makeRecord});
});
