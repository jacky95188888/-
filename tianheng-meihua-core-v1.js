'use strict';

(function attachMeihuaCore(root) {
  const VERSION = '1.0.0';
  const ZHI_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const TRIGRAMS = {
    1: { number: 1, name: '乾', image: '天', element: '金', bits: [1,1,1], direction: '西北' },
    2: { number: 2, name: '兌', image: '澤', element: '金', bits: [1,1,0], direction: '西' },
    3: { number: 3, name: '離', image: '火', element: '火', bits: [1,0,1], direction: '南' },
    4: { number: 4, name: '震', image: '雷', element: '木', bits: [1,0,0], direction: '東' },
    5: { number: 5, name: '巽', image: '風', element: '木', bits: [0,1,1], direction: '東南' },
    6: { number: 6, name: '坎', image: '水', element: '水', bits: [0,1,0], direction: '北' },
    7: { number: 7, name: '艮', image: '山', element: '土', bits: [0,0,1], direction: '東北' },
    8: { number: 8, name: '坤', image: '地', element: '土', bits: [0,0,0], direction: '西南' }
  };
  const TRIGRAM_NAMES = Object.fromEntries(Object.values(TRIGRAMS).map(x => [x.name, x]));
  const TRIGRAM_BITS = Object.fromEntries(Object.values(TRIGRAMS).map(x => [x.bits.join(''), x]));
  const ORDER = ['乾','兌','離','震','巽','坎','艮','坤'];
  const HEXAGRAM_ROWS = {
    乾: [['乾',1],['履',10],['同人',13],['無妄',25],['姤',44],['訟',6],['遯',33],['否',12]],
    兌: [['夬',43],['兌',58],['革',49],['隨',17],['大過',28],['困',47],['咸',31],['萃',45]],
    離: [['大有',14],['睽',38],['離',30],['噬嗑',21],['鼎',50],['未濟',64],['旅',56],['晉',35]],
    震: [['大壯',34],['歸妹',54],['豐',55],['震',51],['恆',32],['解',40],['小過',62],['豫',16]],
    巽: [['小畜',9],['中孚',61],['家人',37],['益',42],['巽',57],['渙',59],['漸',53],['觀',20]],
    坎: [['需',5],['節',60],['既濟',63],['屯',3],['井',48],['坎',29],['蹇',39],['比',8]],
    艮: [['大畜',26],['損',41],['賁',22],['頤',27],['蠱',18],['蒙',4],['艮',52],['剝',23]],
    坤: [['泰',11],['臨',19],['明夷',36],['復',24],['升',46],['師',7],['謙',15],['坤',2]]
  };
  const HEXAGRAMS = {};

  Object.entries(HEXAGRAM_ROWS).forEach(([upper, row]) => {
    row.forEach(([name, number], index) => {
      const lower = ORDER[index];
      const upperTrigram = TRIGRAM_NAMES[upper];
      const lowerTrigram = TRIGRAM_NAMES[lower];
      HEXAGRAMS[`${upper}|${lower}`] = {
        number,
        name,
        fullName: upper === lower ? `${upper}為${upperTrigram.image}` : `${upperTrigram.image}${lowerTrigram.image}${name}`,
        upper,
        lower
      };
    });
  });

  function assertObject(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} 必須是物件`);
  }

  function assertText(value, label) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} 不可空白`);
  }

  function positiveInteger(value, label) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error(`${label} 必須是安全範圍內的正整數`);
    return number;
  }

  function remainder(value, divisor) {
    const raw = positiveInteger(value, '取餘原數') % divisor;
    return raw === 0 ? divisor : raw;
  }

  function zhiNumber(zhi, label) {
    const index = ZHI_ORDER.indexOf(zhi);
    if (index < 0) throw new Error(`${label} 必須是十二地支`);
    return index + 1;
  }

  function normalizeQuestion(input) {
    assertObject(input, '梅花易數輸入');
    assertText(input.question, 'question');
    assertText(input.category, 'category');
    assertText(input.askedAt, 'askedAt');
    assertText(input.timezone, 'timezone');
    const askedAt = input.askedAt;
    if (!Number.isFinite(Date.parse(askedAt))) throw new Error('askedAt 必須是有效時間');
    return {
      question: input.question.trim(),
      category: input.category.trim(),
      askedAt: new Date(askedAt).toISOString(),
      timezone: input.timezone.trim(),
      deadline: input.deadline || null
    };
  }

  function castFromTime(input) {
    assertObject(input.calendar, 'calendar');
    const c = input.calendar;
    const year = zhiNumber(c.yearZhi, 'yearZhi');
    const month = positiveInteger(c.lunarMonth, 'lunarMonth');
    const day = positiveInteger(c.lunarDay, 'lunarDay');
    const hour = zhiNumber(c.hourZhi, 'hourZhi');
    if (month > 12) throw new Error('lunarMonth 必須介於 1～12');
    if (day > 30) throw new Error('lunarDay 必須介於 1～30');
    assertText(c.source, 'calendar.source');
    const upperSeed = year + month + day;
    const totalSeed = upperSeed + hour;
    return {
      method: 'lunar_time',
      original: { yearZhi: c.yearZhi, yearNumber: year, lunarMonth: month, lunarDay: day, hourZhi: c.hourZhi, hourNumber: hour, source: c.source },
      seeds: { upper: upperSeed, lower: totalSeed, moving: totalSeed },
      upperNumber: remainder(upperSeed, 8),
      lowerNumber: remainder(totalSeed, 8),
      movingLine: remainder(totalSeed, 6)
    };
  }

  function castFromNumbers(input) {
    assertObject(input.numbers, 'numbers');
    const first = positiveInteger(input.numbers.first, 'numbers.first');
    const second = positiveInteger(input.numbers.second, 'numbers.second');
    return {
      method: 'two_numbers',
      original: { first, second },
      seeds: { upper: first, lower: second, moving: first + second },
      upperNumber: remainder(first, 8),
      lowerNumber: remainder(second, 8),
      movingLine: remainder(first + second, 6)
    };
  }

  function castFromManual(input) {
    assertObject(input.manual, 'manual');
    const upper = TRIGRAM_NAMES[input.manual.upper];
    const lower = TRIGRAM_NAMES[input.manual.lower];
    if (!upper || !lower) throw new Error('manual.upper 與 manual.lower 必須是八卦名稱');
    const movingLine = positiveInteger(input.manual.movingLine, 'manual.movingLine');
    if (movingLine > 6) throw new Error('manual.movingLine 必須介於 1～6');
    return {
      method: 'manual_verified',
      original: { upper: upper.name, lower: lower.name, movingLine, source: input.manual.source || '老師人工核對' },
      seeds: null,
      upperNumber: upper.number,
      lowerNumber: lower.number,
      movingLine
    };
  }

  function normalizeCasting(input) {
    const method = input.method;
    if (method === 'lunar_time') return castFromTime(input);
    if (method === 'two_numbers') return castFromNumbers(input);
    if (method === 'manual_verified') return castFromManual(input);
    throw new Error('method 必須是 lunar_time、two_numbers 或 manual_verified');
  }

  function trigramFromBits(bits) {
    const trigram = TRIGRAM_BITS[bits.join('')];
    if (!trigram) throw new Error(`無法識別八卦：${bits.join('')}`);
    return { ...trigram, bits: trigram.bits.slice() };
  }

  function hexagramFromTrigrams(upper, lower) {
    const base = HEXAGRAMS[`${upper.name}|${lower.name}`];
    return {
      ...base,
      upper: { ...upper, bits: upper.bits.slice() },
      lower: { ...lower, bits: lower.bits.slice() },
      bits: lower.bits.concat(upper.bits)
    };
  }

  function hexagramFromBits(bits) {
    if (!Array.isArray(bits) || bits.length !== 6 || bits.some(x => x !== 0 && x !== 1)) throw new Error('六爻陰陽值不完整');
    return hexagramFromTrigrams(trigramFromBits(bits.slice(3, 6)), trigramFromBits(bits.slice(0, 3)));
  }

  function nuclearHexagram(bits) {
    return hexagramFromBits([bits[1], bits[2], bits[3], bits[2], bits[3], bits[4]]);
  }

  function changeHexagram(bits, movingLine) {
    const changed = bits.slice();
    changed[movingLine - 1] = changed[movingLine - 1] ? 0 : 1;
    return hexagramFromBits(changed);
  }

  function bodyUse(primary, movingLine) {
    const movingPart = movingLine <= 3 ? 'lower' : 'upper';
    const bodyPart = movingPart === 'lower' ? 'upper' : 'lower';
    return {
      rule: 'moving_trigram_is_use_static_trigram_is_body',
      movingPart,
      bodyPart,
      usePart: movingPart,
      body: { part: bodyPart, ...primary[bodyPart] },
      use: { part: movingPart, ...primary[movingPart] }
    };
  }

  function analyze(input) {
    const request = normalizeQuestion(input);
    const casting = normalizeCasting(input);
    const upper = TRIGRAMS[casting.upperNumber];
    const lower = TRIGRAMS[casting.lowerNumber];
    const primary = hexagramFromTrigrams(upper, lower);
    const mutual = nuclearHexagram(primary.bits);
    const changed = changeHexagram(primary.bits, casting.movingLine);
    return {
      engine: 'tianheng-meihua-core',
      version: VERSION,
      legacyOverride: false,
      request,
      casting: {
        method: casting.method,
        order: 'bottom_up',
        original: casting.original,
        seeds: casting.seeds,
        derived: { upperNumber: casting.upperNumber, lowerNumber: casting.lowerNumber, movingLine: casting.movingLine }
      },
      primary,
      mutual,
      changed,
      movingLine: casting.movingLine,
      bodyUse: bodyUse(primary, casting.movingLine),
      layers: {
        originalInputPreserved: true,
        derivedHexagramsSeparate: true,
        judgmentAttached: false
      }
    };
  }

  function safeAnalyze(input) {
    try { return { ok: true, result: analyze(input) }; }
    catch (error) { return { ok: false, error: error.message }; }
  }

  const api = { version: VERSION, legacyOverride: false, zhiOrder: ZHI_ORDER, trigrams: TRIGRAMS, hexagrams: HEXAGRAMS, remainder, hexagramFromBits, analyze, safeAnalyze };
  root.TianhengMeihuaCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
