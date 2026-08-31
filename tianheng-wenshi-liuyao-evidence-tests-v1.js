'use strict';

const E = require('./tianheng-wenshi-liuyao-evidence-v1.js');
let pass=0, fail=0;
function assert(name, fn) {
  try { if (!fn()) throw new Error('assert false'); console.log('PASS', name); pass++; }
  catch (error) { console.error('FAIL', name, '::', error.message); fail++; }
}
function request(topic='career_job') {
  return {
    question:'這次面試能否在月底前取得錄取通知？', category:'事業／工作', topic,
    askedAt:'2026-08-30T12:00:00+08:00', timezone:'Asia/Taipei', casts:[7,7,7,7,7,7],
    calendar:{ monthZhi:'寅', dayGan:'甲', dayZhi:'午', source:'測試固定曆例', timezone:'Asia/Taipei' }
  };
}

assert('題型必須明示而非猜關鍵字', () => !E.safeAnalyze({ ...request(), topic:null }).ok);
assert('求職以官鬼為主要用神', () => {
  const r=E.analyze(request('career_job'));
  return r.targets.primary[0].definition.value==='官鬼' && r.targets.primary[0].candidates[0].position===4;
});
assert('合作以應爻為主要觀察對象', () => {
  const r=E.analyze(request('cooperation'));
  return r.targets.primary[0].definition.value==='應爻' && r.targets.primary[0].candidates.length===1;
});
assert('感情不依性別自動套妻財官鬼', () => {
  const r=E.analyze(request('relationship'));
  return r.targets.primary.length===1 && r.targets.primary[0].definition.value==='應爻' && r.topic.note.includes('不依性別');
});
assert('同輩家人題型明示後取兄弟爻', () => {
  const r=E.analyze(request('family_peer'));
  return r.targets.primary[0].definition.value==='兄弟'&&r.topic.note.includes('不由');
});
assert('寅月寅木為旺', () => {
  const r=E.analyze(request());
  const line=r.lines.find(x=>x.zhi==='寅');
  return line.calendar.seasonalState==='旺' && line.calendar.monthSameBranch;
});
assert('寅月子水為休', () => E.analyze(request()).lines.find(x=>x.zhi==='子').calendar.seasonalState==='休');
assert('午日沖子爻獨立標記', () => E.analyze(request()).lines.find(x=>x.zhi==='子').calendar.dayClash===true);
assert('缺少可信曆法來源會攔截', () => {
  const bad=request(); bad.calendar={ monthZhi:'寅',dayGan:'甲',dayZhi:'午',source:'' };
  return !E.safeAnalyze(bad).ok;
});
assert('證據層不冒充最終裁決', () => {
  const r=E.analyze(request());
  return r.status==='evidence_complete_decision_pending' && r.evidenceLedger.unresolved.length>0;
});
assert('不覆蓋既有引擎', () => E.legacyOverride===false);

console.log(`\nRESULT ${pass}/${pass+fail} passed`);
if(fail>0) process.exit(1);
