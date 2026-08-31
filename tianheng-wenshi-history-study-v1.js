'use strict';

(function attachHistoryStudy(root){
  const Engine=root.TianhengWenshiEngine||(typeof require==='function'?require('./tianheng-wenshi-engine-v1.js'):null);
  const VERSION='1.0.0';
  const OUTCOMES=new Set(['positive','negative','mixed','unresolved']);

  function present(value){return typeof value==='string'?Boolean(value.trim()):value!==null&&value!==undefined;}
  function qualifyRecord(record){
    const reasons=[];
    if(!present(record?.caseId))reasons.push('缺少 caseId');
    if(!present(record?.input?.question))reasons.push('缺少當時原始問題');
    if(!Number.isFinite(Date.parse(record?.input?.askedAt)))reasons.push('缺少有效原始提問時間');
    if(!Array.isArray(record?.input?.casts)||record.input.casts.length!==6)reasons.push('缺少完整六次起卦紀錄');
    if(!present(record?.input?.calendar?.source))reasons.push('缺少當時曆法來源');
    if(!OUTCOMES.has(record?.actual?.outcome))reasons.push('缺少可分類的實際結果');
    if(!Number.isFinite(Date.parse(record?.actual?.knownAt)))reasons.push('缺少結果確認時間');
    if(!present(record?.actual?.source))reasons.push('缺少結果證據來源');
    if(record?.archiveEvidence?.questionRecord!==true)reasons.push('原始提問紀錄未核實');
    if(record?.archiveEvidence?.castingRecord!==true)reasons.push('原始起卦紀錄未核實');
    if(record?.archiveEvidence?.outcomeRecord!==true)reasons.push('事件結果紀錄未核實');
    return{caseId:record?.caseId||null,eligible:reasons.length===0,reasons,validationClass:reasons.length?'retrospective_explanation_only':'retrospective_blind_candidate'};
  }

  function createBlindPacket(record,curation){
    const qualification=qualifyRecord(record);
    if(!qualification.eligible)throw new Error(`案例不符合盲測：${qualification.reasons.join('；')}`);
    if(!curation||!Number.isFinite(Date.parse(curation.caseFrozenAt)))throw new Error('caseFrozenAt 必須有效');
    if(!present(curation.sealedOutcomeRef))throw new Error('sealedOutcomeRef 不可空白');
    return{
      studyVersion:VERSION,caseId:record.caseId,mode:'retrospective_blind',
      caseFrozenAt:curation.caseFrozenAt,sealedOutcomeRef:curation.sealedOutcomeRef,
      operatorHadOutcomeAccess:false,
      input:JSON.parse(JSON.stringify(record.input)),
      sealedFields:['actual','archiveEvidence'],
      actual:{sealed:true}
    };
  }

  function sealOperatorPrediction(packet,operator){
    if(packet?.actual?.sealed!==true||packet.operatorHadOutcomeAccess!==false)throw new Error('盲包完整性無效');
    if(!operator||!Number.isFinite(Date.parse(operator.plannedRevealAt)))throw new Error('plannedRevealAt 必須有效');
    return Engine.sealPrediction(packet.input,{
      caseId:packet.caseId,mode:'retrospective_blind',createdAt:operator.createdAt,
      probability:operator.probability,confidence:operator.confidence,timingWindow:operator.timingWindow||null,
      blindProtocol:{
        outcomeSealed:true,operatorHadOutcomeAccess:false,caseFrozenAt:packet.caseFrozenAt,
        outcomeRevealedAt:operator.plannedRevealAt,sealedOutcomeRef:packet.sealedOutcomeRef
      }
    });
  }

  function reveal(record,sealedPrediction){
    const qualification=qualifyRecord(record);
    if(!qualification.eligible)throw new Error('不合格案例不可揭盲計分');
    if(record.caseId!==sealedPrediction.caseId)throw new Error('揭盲案例編號不一致');
    return Engine.revealAndScore(sealedPrediction,record.actual);
  }

  const api={version:VERSION,qualifyRecord,createBlindPacket,sealOperatorPrediction,reveal};
  root.TianhengWenshiHistoryStudy=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

