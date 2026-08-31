'use strict';

const L = require('./tianheng-wenshi-liuyao-v1.js');
let pass = 0;
let fail = 0;

function assert(name, fn) {
  try {
    if (!fn()) throw new Error('assert false');
    console.log('PASS', name);
    pass++;
  } catch (error) {
    console.error('FAIL', name, '::', error.message);
    fail++;
  }
}

function request(casts) {
  return {
    question: '這次合作是否適合在三個月內簽約？',
    category: '合作／客戶',
    askedAt: '2026-08-30T12:00:00+08:00',
    timezone: 'Asia/Taipei',
    role: '提案方',
    deadline: '2026-11-30',
    casts
  };
}

assert('六十四卦資料完整', () => Object.keys(L.hexagrams).length === 64);
assert('六十四卦序號唯一', () => new Set(Object.values(L.hexagrams).map(x => x.number)).size === 64);
assert('八經卦資料完整', () => Object.keys(L.trigrams).length === 8);
assert('全少陽為乾為天第一卦', () => {
  const r = L.analyze(request([7, 7, 7, 7, 7, 7]));
  return r.primary.name === '乾' && r.primary.number === 1 && r.primary.fullName === '乾為天';
});
assert('全少陰為坤為地第二卦', () => {
  const r = L.analyze(request([8, 8, 8, 8, 8, 8]));
  return r.primary.name === '坤' && r.primary.number === 2 && r.primary.fullName === '坤為地';
});
assert('水雷屯映射正確', () => {
  const r = L.analyze(request([7, 8, 8, 8, 7, 8]));
  return r.primary.name === '屯' && r.primary.number === 3 && r.primary.fullName === '水雷屯';
});
assert('乾卦初爻動變天風姤', () => {
  const r = L.analyze(request([9, 7, 7, 7, 7, 7]));
  return r.primary.name === '乾' && r.movingLines.join('') === '1' && r.changed.name === '姤';
});
assert('三枚銅錢值可轉成老少陰陽', () => {
  const r = L.analyze(request([[2,2,2],[2,2,3],[2,3,3],[3,3,3],7,8]));
  return r.casting.lines.map(x => x.stage).join(',') === '老陰,少陽,少陰,老陽,少陽,少陰';
});
assert('原始銅錢與衍生卦分開保存', () => {
  const r = L.analyze(request([[2,2,2],[2,2,3],[2,3,3],[3,3,3],7,8]));
  return r.layers.originalCastsPreserved && r.layers.derivedHexagramsSeparate &&
    r.casting.lines[0].rawCoins.join('') === '222';
});
assert('錯卦逐爻陰陽相反', () => {
  const r = L.analyze(request([7,8,7,8,7,8]));
  return r.opposite.bits.every((bit, i) => bit !== r.primary.bits[i]);
});
assert('綜卦上下倒置', () => {
  const r = L.analyze(request([7,7,8,8,7,8]));
  return r.reversed.bits.join('') === r.primary.bits.slice().reverse().join('');
});
assert('無效爻數由 safeAnalyze 攔截', () => !L.safeAnalyze(request([7,8])).ok);
assert('無效銅錢值由 safeAnalyze 攔截', () => !L.safeAnalyze(request([[1,2,3],7,7,7,7,7])).ok);
assert('不覆蓋八字與既有命理引擎', () => L.legacyOverride === false && L.analyze(request([7,7,7,7,7,7])).legacyOverride === false);

console.log(`\nRESULT ${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);

