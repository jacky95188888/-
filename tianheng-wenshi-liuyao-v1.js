'use strict';

(function attachLiuYao(root) {
  const VERSION = '1.0.0';
  const LINE_NAMES = {
    6: { yinYang: '陰', stage: '老陰', moving: true, primary: 0, changed: 1 },
    7: { yinYang: '陽', stage: '少陽', moving: false, primary: 1, changed: 1 },
    8: { yinYang: '陰', stage: '少陰', moving: false, primary: 0, changed: 0 },
    9: { yinYang: '陽', stage: '老陽', moving: true, primary: 1, changed: 0 }
  };

  const TRIGRAMS = {
    '111': { name: '乾', image: '天', element: '金' },
    '110': { name: '兌', image: '澤', element: '金' },
    '101': { name: '離', image: '火', element: '火' },
    '100': { name: '震', image: '雷', element: '木' },
    '011': { name: '巽', image: '風', element: '木' },
    '010': { name: '坎', image: '水', element: '水' },
    '001': { name: '艮', image: '山', element: '土' },
    '000': { name: '坤', image: '地', element: '土' }
  };

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
  const TRIGRAM_ORDER = ['乾', '兌', '離', '震', '巽', '坎', '艮', '坤'];
  const HEXAGRAMS = {};

  Object.entries(HEXAGRAM_ROWS).forEach(([upper, row]) => {
    row.forEach(([name, number], index) => {
      const lower = TRIGRAM_ORDER[index];
      const upperImage = Object.values(TRIGRAMS).find(x => x.name === upper).image;
      const lowerImage = Object.values(TRIGRAMS).find(x => x.name === lower).image;
      const repeated = upper === lower;
      HEXAGRAMS[`${upper}|${lower}`] = {
        number,
        name,
        fullName: repeated ? `${upper}為${upperImage}` : `${upperImage}${lowerImage}${name}`,
        upper,
        lower
      };
    });
  });

  function assertText(value, field) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} 不可空白`);
  }

  function normalizeCoinCast(cast, index) {
    if (Number.isInteger(cast) && LINE_NAMES[cast]) return { value: cast, rawCoins: null };
    if (Array.isArray(cast) && cast.length === 3 && cast.every(x => x === 2 || x === 3)) {
      const value = cast.reduce((sum, item) => sum + item, 0);
      return { value, rawCoins: cast.slice() };
    }
    throw new Error(`第 ${index + 1} 爻必須是 6、7、8、9，或三枚 2/3 銅錢值`);
  }

  function normalizeRequest(input) {
    if (!input || typeof input !== 'object') throw new Error('問事輸入必須是物件');
    assertText(input.question, 'question');
    assertText(input.category, 'category');
    assertText(input.askedAt, 'askedAt');
    assertText(input.timezone, 'timezone');
    const askedTime = Date.parse(input.askedAt);
    if (!Number.isFinite(askedTime)) throw new Error('askedAt 必須是有效時間');
    if (!Array.isArray(input.casts) || input.casts.length !== 6) {
      throw new Error('casts 必須恰好六爻，並依初爻到上爻排列');
    }
    const casts = input.casts.map(normalizeCoinCast);
    return {
      question: input.question.trim(),
      category: input.category.trim(),
      askedAt: new Date(askedTime).toISOString(),
      timezone: input.timezone,
      role: typeof input.role === 'string' ? input.role.trim() : '',
      deadline: input.deadline || null,
      castingMethod: input.castingMethod || 'three_coins_manual',
      casts
    };
  }

  function trigramFromBits(bits) {
    const key = bits.join('');
    const trigram = TRIGRAMS[key];
    if (!trigram) throw new Error(`無法識別八卦：${key}`);
    return { key, ...trigram };
  }

  function hexagramFromBits(bits) {
    if (!Array.isArray(bits) || bits.length !== 6 || bits.some(x => x !== 0 && x !== 1)) {
      throw new Error('卦象必須是由初至上的六個陰陽值');
    }
    const lower = trigramFromBits(bits.slice(0, 3));
    const upper = trigramFromBits(bits.slice(3, 6));
    const hexagram = HEXAGRAMS[`${upper.name}|${lower.name}`];
    return { ...hexagram, upper, lower, bits: bits.slice() };
  }

  function nuclearBits(bits) {
    return [bits[1], bits[2], bits[3], bits[2], bits[3], bits[4]];
  }

  function analyze(input) {
    const request = normalizeRequest(input);
    const lines = request.casts.map((cast, index) => ({
      position: index + 1,
      label: index === 0 ? '初爻' : index === 5 ? '上爻' : `${index + 1}爻`,
      value: cast.value,
      rawCoins: cast.rawCoins,
      ...LINE_NAMES[cast.value]
    }));
    const primaryBits = lines.map(x => x.primary);
    const changedBits = lines.map(x => x.changed);
    const movingLines = lines.filter(x => x.moving).map(x => x.position);

    return {
      engine: 'tianheng-wenshi-liuyao',
      version: VERSION,
      legacyOverride: false,
      status: 'casting_complete',
      request: {
        question: request.question,
        category: request.category,
        askedAt: request.askedAt,
        timezone: request.timezone,
        role: request.role,
        deadline: request.deadline
      },
      casting: {
        method: request.castingMethod,
        order: 'bottom_up',
        lines
      },
      primary: hexagramFromBits(primaryBits),
      movingLines,
      changed: hexagramFromBits(changedBits),
      nuclear: hexagramFromBits(nuclearBits(primaryBits)),
      opposite: hexagramFromBits(primaryBits.map(x => x ? 0 : 1)),
      reversed: hexagramFromBits(primaryBits.slice().reverse()),
      layers: {
        originalCastsPreserved: true,
        derivedHexagramsSeparate: true,
        adjudicationAttached: false
      }
    };
  }

  function safeAnalyze(input) {
    try {
      return { ok: true, result: analyze(input) };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  const api = {
    version: VERSION,
    legacyOverride: false,
    lineRules: LINE_NAMES,
    trigrams: TRIGRAMS,
    hexagrams: HEXAGRAMS,
    analyze,
    safeAnalyze,
    hexagramFromBits
  };

  root.TianhengWenshiLiuYao = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

