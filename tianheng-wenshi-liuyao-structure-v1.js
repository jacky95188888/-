'use strict';

(function attachLiuYaoStructure(root) {
  const Core = root.TianhengWenshiLiuYao ||
    (typeof require === 'function' ? require('./tianheng-wenshi-liuyao-v1.js') : null);
  const VERSION = '1.0.0';

  const PALACE_ELEMENTS = { 乾: '金', 兌: '金', 離: '火', 震: '木', 巽: '木', 坎: '水', 艮: '土', 坤: '土' };
  const ZHI_ELEMENTS = {
    子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
    午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水'
  };
  const NAJIA = {
    乾: { inner: ['甲子','甲寅','甲辰'], outer: ['壬午','壬申','壬戌'] },
    兌: { inner: ['丁巳','丁卯','丁丑'], outer: ['丁亥','丁酉','丁未'] },
    離: { inner: ['己卯','己丑','己亥'], outer: ['己酉','己未','己巳'] },
    震: { inner: ['庚子','庚寅','庚辰'], outer: ['庚午','庚申','庚戌'] },
    巽: { inner: ['辛丑','辛亥','辛酉'], outer: ['辛未','辛巳','辛卯'] },
    坎: { inner: ['戊寅','戊辰','戊午'], outer: ['戊申','戊戌','戊子'] },
    艮: { inner: ['丙辰','丙午','丙申'], outer: ['丙戌','丙子','丙寅'] },
    坤: { inner: ['乙未','乙巳','乙卯'], outer: ['癸丑','癸亥','癸酉'] }
  };
  const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const STAGES = [
    { name: '本宮', shi: 6 },
    { name: '一世', shi: 1 },
    { name: '二世', shi: 2 },
    { name: '三世', shi: 3 },
    { name: '四世', shi: 4 },
    { name: '五世', shi: 5 },
    { name: '遊魂', shi: 4 },
    { name: '歸魂', shi: 3 }
  ];

  function flip(bits, positions) {
    const next = bits.slice();
    positions.forEach(position => { next[position] = next[position] ? 0 : 1; });
    return next;
  }

  function buildPalaceIndex() {
    const index = {};
    Object.entries(Core.trigrams).forEach(([trigramBits, trigram]) => {
      const pure = trigramBits.split('').map(Number).concat(trigramBits.split('').map(Number));
      const sequences = [pure];
      sequences.push(flip(sequences[0], [0]));
      sequences.push(flip(sequences[1], [1]));
      sequences.push(flip(sequences[2], [2]));
      sequences.push(flip(sequences[3], [3]));
      sequences.push(flip(sequences[4], [4]));
      sequences.push(flip(sequences[5], [3]));
      sequences.push(flip(sequences[6], [0, 1, 2]));
      sequences.forEach((bits, stageIndex) => {
        const hexagram = Core.hexagramFromBits(bits);
        const stage = STAGES[stageIndex];
        index[hexagram.number] = {
          palace: trigram.name,
          palaceElement: PALACE_ELEMENTS[trigram.name],
          stage: stage.name,
          shiPosition: stage.shi,
          yingPosition: stage.shi <= 3 ? stage.shi + 3 : stage.shi - 3
        };
      });
    });
    return index;
  }

  const PALACE_INDEX = buildPalaceIndex();

  function relation(palaceElement, lineElement) {
    if (palaceElement === lineElement) return '兄弟';
    if (GENERATES[palaceElement] === lineElement) return '子孫';
    if (GENERATES[lineElement] === palaceElement) return '父母';
    if (CONTROLS[palaceElement] === lineElement) return '妻財';
    if (CONTROLS[lineElement] === palaceElement) return '官鬼';
    throw new Error(`無法判定六親：${palaceElement}/${lineElement}`);
  }

  function najiaForHexagram(hexagram) {
    return NAJIA[hexagram.lower.name].inner.concat(NAJIA[hexagram.upper.name].outer);
  }

  function enrichLines(hexagram, palaceInfo, sourceLines) {
    const najia = najiaForHexagram(hexagram);
    return najia.map((ganZhi, index) => {
      const zhi = ganZhi.slice(1);
      const element = ZHI_ELEMENTS[zhi];
      const source = sourceLines ? sourceLines[index] : null;
      return {
        position: index + 1,
        label: index === 0 ? '初爻' : index === 5 ? '上爻' : `${index + 1}爻`,
        yinYang: hexagram.bits[index] ? '陽' : '陰',
        moving: source ? source.moving : false,
        value: source ? source.value : null,
        najia: ganZhi,
        gan: ganZhi[0],
        zhi,
        element,
        relation: relation(palaceInfo.palaceElement, element),
        shi: index + 1 === palaceInfo.shiPosition,
        ying: index + 1 === palaceInfo.yingPosition
      };
    });
  }

  function analyze(input) {
    if (!Core) throw new Error('缺少六爻起卦核心');
    const casting = Core.analyze(input);
    const palace = PALACE_INDEX[casting.primary.number];
    if (!palace) throw new Error(`找不到第 ${casting.primary.number} 卦的八宮資料`);
    const primaryLines = enrichLines(casting.primary, palace, casting.casting.lines);
    const changedLines = enrichLines(casting.changed, palace, null).map((line, index) => ({
      ...line,
      activatedByMovingLine: casting.casting.lines[index].moving
    }));
    return {
      engine: 'tianheng-wenshi-liuyao-structure',
      version: VERSION,
      legacyOverride: false,
      casting,
      palace: {
        ...palace,
        relationBasis: 'primaryPalace'
      },
      primaryLines,
      changedLines,
      changeEvents: casting.movingLines.map(position => ({
        position,
        from: primaryLines[position - 1],
        to: changedLines[position - 1]
      })),
      layers: {
        originalCasting: casting.casting,
        primaryStructure: { hexagram: casting.primary, lines: primaryLines },
        changeEventsSeparate: true,
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
    palaceIndex: PALACE_INDEX,
    najia: NAJIA,
    relation,
    analyze,
    safeAnalyze
  };

  root.TianhengWenshiLiuYaoStructure = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

