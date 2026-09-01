'use strict';

const J = require('./tianheng-meihua-judgment-v1.js');
let pass = 0;
let fail = 0;
function assert(name, fn) {
  try { if (!fn()) throw new Error('assert false'); console.log('PASS', name); pass++; }
  catch (error) { console.error('FAIL', name, '::', error.message); fail++; }
}
function input(manual, extra = {}) {
  return { question: '這份合作是否適合在本月繼續？', category: '事業／合作', askedAt: '2026-09-01T08:00:00+08:00', timezone: 'Asia/Taipei', method: 'manual_verified', manual, monthZhi: '寅', ...extra };
}

assert('用生體列為支持證據', () => J.relation('水', '木').name === '用生體' && J.relation('水', '木').polarity === 'support');
assert('用克體列為阻力證據', () => J.relation('金', '木').name === '用克體' && J.relation('金', '木').polarity === 'resistance');
assert('體生用列為耗力阻力', () => J.relation('火', '木').name === '體生用' && J.relation('火', '木').polarity === 'resistance');
assert('體克用仍標示需要控制成本', () => J.relation('土', '木').name === '體克用' && J.relation('土', '木').explanation.includes('控制成本'));
assert('春令木旺火相水休金囚土死', () => JSON.stringify(J.seasonStates.春) === JSON.stringify({ 木:'旺',火:'相',水:'休',金:'囚',土:'死' }));
assert('農曆正月自動推得寅月春令', () => {
  const r = J.analyze({ question:'觀梅古例',category:'一般',askedAt:'2026-09-01T08:00:00+08:00',method:'lunar_time',calendar:{yearZhi:'辰',lunarMonth:1,lunarDay:1,hourZhi:'子',source:'固定測試'} });
  return r.monthContext.monthZhi === '寅' && r.monthContext.source === 'derived_from_lunar_month_number';
});
assert('本卦互卦變卦形成起中末四條事件', () => {
  const r = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}));
  return r.evidenceLedger.events.length === 4 && r.timeline.initial && r.timeline.middle && r.timeline.final;
});
assert('原始卦與判斷層分開保存', () => {
  const r = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}));
  return r.core.casting.original.upper === '乾' && r.outcome && r.core.layers.judgmentAttached === false;
});
assert('輸出同時保留支持阻力與未定處', () => {
  const r = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}));
  return Array.isArray(r.evidenceLedger.support) && Array.isArray(r.evidenceLedger.resistance) && Array.isArray(r.evidenceLedger.unresolved);
});
assert('沒有月支時旺衰不硬判', () => {
  const r = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}, {monthZhi:undefined}));
  return r.strength.bodyState === '未判' && r.evidenceLedger.unresolved.some(x => x.includes('未提供月支'));
});
assert('外應獨立保存且不自動改方向', () => {
  const a = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}));
  const b = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}, {externalResponse:{note:'窗外突然有鳥鳴'}}));
  return a.outcome.direction === b.outcome.direction && b.externalResponse.note && b.evidenceLedger.unresolved.some(x => x.includes('外應另存'));
});
assert('事業建議包含可做避免與查證', () => {
  const r = J.analyze(input({upper:'乾',lower:'坎',movingLine:2}));
  return r.advice.canDo.length && r.advice.avoid.length && r.advice.verify.length;
});
assert('財務類不保證投資獲利', () => {
  const r = J.analyze({...input({upper:'坎',lower:'離',movingLine:4}),category:'財運／投資'});
  return r.advice.avoid.join('').includes('不') && r.advice.avoid.join('').includes('保證投資獲利');
});
assert('分數明示只供輔助不取代證據鏈', () => J.analyze(input({upper:'乾',lower:'坎',movingLine:2})).outcome.auxiliaryScoreOnly === true);
assert('梅花判斷層不覆蓋其他命理結果', () => J.legacyOverride === false && J.analyze(input({upper:'乾',lower:'坎',movingLine:2})).legacyOverride === false);

console.log(`\nRESULT ${pass}/${pass + fail} passed`);
if (fail) process.exit(1);

