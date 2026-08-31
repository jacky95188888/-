'use strict';

const S = require('./tianheng-wenshi-liuyao-structure-v1.js');
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
    casts
  };
}

assert('六十四卦均有唯一八宮歸屬', () => Object.keys(S.palaceIndex).length === 64);
assert('乾為天屬乾宮本宮世六應三', () => {
  const r = S.analyze(request([7,7,7,7,7,7]));
  return r.palace.palace === '乾' && r.palace.stage === '本宮' &&
    r.palace.shiPosition === 6 && r.palace.yingPosition === 3;
});
assert('天風姤屬乾宮一世', () => {
  const r = S.analyze(request([8,7,7,7,7,7]));
  return r.casting.primary.name === '姤' && r.palace.palace === '乾' &&
    r.palace.stage === '一世' && r.palace.shiPosition === 1;
});
assert('火地晉屬乾宮遊魂', () => {
  const r = S.analyze(request([8,8,8,7,8,7]));
  return r.casting.primary.name === '晉' && r.palace.palace === '乾' &&
    r.palace.stage === '遊魂' && r.palace.shiPosition === 4;
});
assert('火天大有屬乾宮歸魂', () => {
  const r = S.analyze(request([7,7,7,7,8,7]));
  return r.casting.primary.name === '大有' && r.palace.palace === '乾' &&
    r.palace.stage === '歸魂' && r.palace.shiPosition === 3;
});
assert('乾卦納甲完整', () => {
  const r = S.analyze(request([7,7,7,7,7,7]));
  return r.primaryLines.map(x => x.najia).join(',') === '甲子,甲寅,甲辰,壬午,壬申,壬戌';
});
assert('乾宮六親依宮五行判定', () => {
  const r = S.analyze(request([7,7,7,7,7,7]));
  return r.primaryLines.map(x => x.relation).join(',') === '子孫,妻財,父母,官鬼,兄弟,父母';
});
assert('世應標記只各一爻', () => {
  const r = S.analyze(request([7,8,8,8,7,8]));
  return r.primaryLines.filter(x => x.shi).length === 1 && r.primaryLines.filter(x => x.ying).length === 1;
});
assert('動爻前後事件分開保存', () => {
  const r = S.analyze(request([9,7,7,7,7,7]));
  return r.changeEvents.length === 1 && r.changeEvents[0].from.najia === '甲子' &&
    r.changeEvents[0].to.najia === '辛丑' && r.layers.changeEventsSeparate;
});
assert('變爻六親仍以本卦宮五行為基準', () => {
  const r = S.analyze(request([9,7,7,7,7,7]));
  return r.palace.relationBasis === 'primaryPalace' && r.changeEvents[0].to.relation === '父母';
});
assert('結構層不直接附會吉凶裁決', () => !S.analyze(request([7,7,7,7,7,7])).layers.adjudicationAttached);
assert('不覆蓋既有命理引擎', () => S.legacyOverride === false);

console.log(`\nRESULT ${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);

