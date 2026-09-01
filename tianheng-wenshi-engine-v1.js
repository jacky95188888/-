'use strict';

(function attachWenshiEngine(root){
  const Synthesis=root.TianhengWenshiLiuYaoSynthesis||(typeof require==='function'?require('./tianheng-wenshi-liuyao-synthesis-v1.js'):null);
  const Narrative=root.TianhengWenshiNarrative||(typeof require==='function'?require('./tianheng-wenshi-narrative-v1.js'):null);
  const Validation=root.TianhengWenshiValidation||(typeof require==='function'?require('./tianheng-wenshi-validation-v1.js'):null);
  const VERSION='1.0.0';
  const OUTCOME_MAP={favorable:'positive',blocked:'negative',conditional:'mixed',unresolved:'unresolved'};

  function analyze(input){
    if(!Synthesis||!Narrative)throw new Error('缺少六爻綜合或敘事層');
    const synthesis=Synthesis.analyze(input);
    const narrative=Narrative.compose(synthesis,input);
    const result={...synthesis,narrative};
    return{
      engine:'tianheng-wenshi-engine',version:VERSION,method:'liuyao_three_coins',legacyOverride:false,
      result,
      layers:{
        question:synthesis.interactions.adjudication.evidence.structure.casting.request,
        casting:synthesis.interactions.adjudication.evidence.structure.casting.casting,
        structure:synthesis.interactions.adjudication.evidence.structure,
        adjudication:synthesis.interactions.adjudication,
        interactions:synthesis.interactions,
        provisionalOutcome:synthesis.outcome,
        narrative,
        originalAdvice:synthesis.advice,
        advice:narrative.advice
      },
      release:{formalAccuracyClaim:false,siteIntegrationReady:false,reason:'等待歷史盲測與前瞻驗證'}
    };
  }

  function requireProbability(value){
    const number=Number(value);
    if(!Number.isFinite(number)||number<0||number>1)throw new Error('封存預測必須由操作者明確填入 0～1 機率，不沿用未校準假數字');
    return number;
  }

  function sealPrediction(input,metadata){
    if(!metadata||typeof metadata!=='object')throw new Error('缺少驗證 metadata');
    if(typeof metadata.caseId!=='string'||!metadata.caseId.trim())throw new Error('caseId 不可空白');
    const analysis=analyze(input);
    const predictionOutcome=OUTCOME_MAP[analysis.result.outcome.direction];
    const createdAt=metadata.createdAt;
    if(!Number.isFinite(Date.parse(createdAt)))throw new Error('createdAt 必須是有效時間');
    const confidence=metadata.confidence||analysis.result.outcome.confidence;
    const sealed={
      caseId:metadata.caseId,
      mode:metadata.mode,
      method:'liuyao_three_coins',
      methodVersion:VERSION,
      category:input.category,
      question:input.question,
      askedAt:input.askedAt,
      timezone:input.timezone,
      castingInput:{topic:input.topic,casts:input.casts,calendar:input.calendar},
      prediction:{
        createdAt,
        outcome:predictionOutcome,
        probability:requireProbability(metadata.probability),
        confidence,
        timingWindow:metadata.timingWindow||null,
        evidence:{support:analysis.result.evidenceLedger.support,resistance:analysis.result.evidenceLedger.resistance},
        actions:analysis.layers.advice.canDo,
        avoid:analysis.layers.advice.avoid,
        engineDirection:analysis.result.outcome.direction,
        engineVersion:VERSION
      }
    };
    if(metadata.mode==='retrospective_blind')sealed.blindProtocol=metadata.blindProtocol;
    return{sealed,analysis};
  }

  function revealAndScore(sealedPrediction,actual){
    const complete={...sealedPrediction,actual};
    return{case:Validation.validateCase(complete),score:Validation.scoreCase(complete)};
  }

  function safeAnalyze(input){try{return{ok:true,result:analyze(input)}}catch(error){return{ok:false,error:error.message}}}
  const api={version:VERSION,legacyOverride:false,analyze,safeAnalyze,sealPrediction,revealAndScore};
  root.TianhengWenshiEngine=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
