'use strict';

const Core = require('./tianheng-meihua-core-v1.js');
let pass = 0;
let fail = 0;
function assert(name, fn) {
  try { if (!fn()) throw new Error('assert false'); console.log('PASS', name); pass++; }
  catch (error) { console.error('FAIL', name, '::', error.message); fail++; }
}
function base(extra) {
  return { question: '這件工作是否適合繼續推進？', category: '事業／工作', askedAt: '2026-09-01T08:00:00+08:00', timezone: 'Asia/Taipei', ...extra };
}

assert('先天八卦數為乾一兌二離三震四巽五坎六艮七坤八', () =>
  Object.values(Core.trigrams).map(x => x.name).join('') === '乾兌離震巽坎艮坤');
assert('整除八取坤八而非零', () => Core.remainder(16, 8) === 8);
assert('整除六取上爻六而非零', () => Core.remainder(12, 6) === 6);

assert('觀梅占年月日時重現澤火革初爻動', () => {
  const r = Core.analyze(base({ method: 'lunar_time', calendar: { yearZhi: '辰', lunarMonth: 12, lunarDay: 17, hourZhi: '申', source: '《梅花易數》觀梅占古例' } }));
  return r.primary.name === '革' && r.primary.upper.name === '兌' && r.primary.lower.name === '離' && r.movingLine === 1;
});
assert('觀梅占初爻變為澤山咸', () => {
  const r = Core.analyze(base({ method: 'lunar_time', calendar: { yearZhi: '辰', lunarMonth: 12, lunarDay: 17, hourZhi: '申', source: '《梅花易數》觀梅占古例' } }));
  return r.changed.name === '咸' && r.changed.lower.name === '艮';
});
assert('牡丹占重現天風姤五爻動並變火風鼎', () => {
  const r = Core.analyze(base({ method: 'lunar_time', calendar: { yearZhi: '巳', lunarMonth: 3, lunarDay: 16, hourZhi: '卯', source: '《梅花易數》牡丹占古例' } }));
  return r.primary.name === '姤' && r.movingLine === 5 && r.changed.name === '鼎';
});
assert('兩數法分開保存原數種子與取餘結果', () => {
  const r = Core.analyze(base({ method: 'two_numbers', numbers: { first: 17, second: 18 } }));
  return r.casting.original.first === 17 && r.casting.seeds.moving === 35 && r.casting.derived.upperNumber === 1 && r.casting.derived.lowerNumber === 2 && r.movingLine === 5;
});
assert('下卦動則下卦為用上卦為體', () => {
  const r = Core.analyze(base({ method: 'manual_verified', manual: { upper: '乾', lower: '坤', movingLine: 2 } }));
  return r.bodyUse.body.name === '乾' && r.bodyUse.use.name === '坤';
});
assert('上卦動則上卦為用下卦為體', () => {
  const r = Core.analyze(base({ method: 'manual_verified', manual: { upper: '乾', lower: '坤', movingLine: 5 } }));
  return r.bodyUse.body.name === '坤' && r.bodyUse.use.name === '乾';
});
assert('本卦互卦變卦與原始起卦分層保存', () => {
  const r = Core.analyze(base({ method: 'two_numbers', numbers: { first: 3, second: 5 } }));
  return r.primary && r.mutual && r.changed && r.layers.originalInputPreserved && r.layers.derivedHexagramsSeparate;
});
assert('年月日時法拒絕沒有曆法來源', () => !Core.safeAnalyze(base({ method: 'lunar_time', calendar: { yearZhi: '辰', lunarMonth: 12, lunarDay: 17, hourZhi: '申' } })).ok);
assert('年月日時法拒絕不合理農曆日期', () => !Core.safeAnalyze(base({ method: 'lunar_time', calendar: { yearZhi: '辰', lunarMonth: 13, lunarDay: 31, hourZhi: '申', source: '錯誤測試' } })).ok);
assert('錯誤方法由 safeAnalyze 攔截', () => !Core.safeAnalyze(base({ method: 'random_magic' })).ok);
assert('梅花核心不覆蓋舊命理結果', () => Core.legacyOverride === false && Core.analyze(base({ method: 'two_numbers', numbers: { first: 1, second: 2 } })).legacyOverride === false);

console.log(`\nRESULT ${pass}/${pass + fail} passed`);
if (fail) process.exit(1);

