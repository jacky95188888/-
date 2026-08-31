'use strict';

(function attachLiuYaoEvidence(root) {
  const Structure = root.TianhengWenshiLiuYaoStructure ||
    (typeof require === 'function' ? require('./tianheng-wenshi-liuyao-structure-v1.js') : null);
  const VERSION = '1.0.0';
  const GAN = new Set('甲乙丙丁戊己庚辛壬癸'.split(''));
  const ZHI = new Set('子丑寅卯辰巳午未申酉戌亥'.split(''));
  const ZHI_ELEMENTS = {
    子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',
    午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'
  };
  const GENERATES = { 木:'火',火:'土',土:'金',金:'水',水:'木' };
  const CONTROLS = { 木:'土',土:'水',水:'火',火:'金',金:'木' };
  const CLASH = { 子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳' };
  const HARMONY = { 子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午' };

  const TOPICS = {
    career_job: {
      label: '求職／工作', primary: [{ type:'relation', value:'官鬼' }],
      secondary: [{ type:'relation', value:'父母' }, { type:'marker', value:'世爻' }]
    },
    career_promotion: {
      label: '升遷／職位', primary: [{ type:'relation', value:'官鬼' }],
      secondary: [{ type:'relation', value:'父母' }, { type:'marker', value:'世爻' }]
    },
    finance_income: {
      label: '收入／收款', primary: [{ type:'relation', value:'妻財' }],
      secondary: [{ type:'relation', value:'子孫' }, { type:'marker', value:'世爻' }]
    },
    cooperation: {
      label: '合作／客戶', primary: [{ type:'marker', value:'應爻' }],
      secondary: [{ type:'relation', value:'妻財' }, { type:'relation', value:'父母' }, { type:'marker', value:'世爻' }]
    },
    contract: {
      label: '合約／文件', primary: [{ type:'relation', value:'父母' }],
      secondary: [{ type:'marker', value:'應爻' }, { type:'marker', value:'世爻' }]
    },
    relationship: {
      label: '感情／人際', primary: [{ type:'marker', value:'應爻' }],
      secondary: [{ type:'marker', value:'世爻' }],
      note: '不依性別自動指定妻財或官鬼；若要採古法配偶用神，必須由使用者明示角色。'
    },
    family_peer: {
      label: '兄弟姊妹／同輩家人', primary: [{ type:'relation', value:'兄弟' }],
      secondary: [{ type:'marker', value:'世爻' }],
      note: '僅在提問對象確為兄弟姊妹或同輩家人時使用，不由「家人」關鍵字自動套用。'
    },
    decision: {
      label: '選擇／決策', primary: [{ type:'marker', value:'世爻' }, { type:'marker', value:'應爻' }],
      secondary: [],
      note: '兩個互斥方案應分別明確提問，不以同一卦替兩案硬排高低。'
    }
  };

  function validateCalendar(calendar) {
    if (!calendar || typeof calendar !== 'object') throw new Error('缺少 calendar，不能判斷日月旺衰');
    if (!ZHI.has(calendar.monthZhi)) throw new Error('calendar.monthZhi 無效');
    if (!GAN.has(calendar.dayGan)) throw new Error('calendar.dayGan 無效');
    if (!ZHI.has(calendar.dayZhi)) throw new Error('calendar.dayZhi 無效');
    if (typeof calendar.source !== 'string' || !calendar.source.trim()) {
      throw new Error('calendar.source 不可空白，必須保留曆法來源');
    }
    return {
      monthZhi: calendar.monthZhi,
      dayGan: calendar.dayGan,
      dayZhi: calendar.dayZhi,
      source: calendar.source.trim(),
      timezone: calendar.timezone || null
    };
  }

  function fivePhaseRelation(from, to) {
    if (from === to) return 'same';
    if (GENERATES[from] === to) return 'generates';
    if (CONTROLS[from] === to) return 'controls';
    if (GENERATES[to] === from) return 'generatedBy';
    if (CONTROLS[to] === from) return 'controlledBy';
    throw new Error(`五行關係無法判斷：${from}/${to}`);
  }

  function seasonalState(monthElement, lineElement) {
    if (monthElement === lineElement) return '旺';
    if (GENERATES[monthElement] === lineElement) return '相';
    if (GENERATES[lineElement] === monthElement) return '休';
    if (CONTROLS[lineElement] === monthElement) return '囚';
    return '死';
  }

  function lineEvidence(line, calendar) {
    const monthElement = ZHI_ELEMENTS[calendar.monthZhi];
    const dayElement = ZHI_ELEMENTS[calendar.dayZhi];
    return {
      ...line,
      calendar: {
        monthZhi: calendar.monthZhi,
        monthElement,
        seasonalState: seasonalState(monthElement, line.element),
        monthSameBranch: line.zhi === calendar.monthZhi,
        monthClash: CLASH[line.zhi] === calendar.monthZhi,
        monthHarmony: HARMONY[line.zhi] === calendar.monthZhi,
        monthElementRelation: fivePhaseRelation(monthElement, line.element),
        dayZhi: calendar.dayZhi,
        dayElement,
        daySameBranch: line.zhi === calendar.dayZhi,
        dayClash: CLASH[line.zhi] === calendar.dayZhi,
        dayHarmony: HARMONY[line.zhi] === calendar.dayZhi,
        dayElementRelation: fivePhaseRelation(dayElement, line.element)
      }
    };
  }

  function linesForTarget(lines, target) {
    if (target.type === 'relation') return lines.filter(line => line.relation === target.value);
    if (target.type === 'marker' && target.value === '世爻') return lines.filter(line => line.shi);
    if (target.type === 'marker' && target.value === '應爻') return lines.filter(line => line.ying);
    return [];
  }

  function resolveTargets(lines, definitions) {
    return definitions.map(definition => ({
      definition,
      candidates: linesForTarget(lines, definition)
    }));
  }

  function analyze(input) {
    if (!input || !TOPICS[input.topic]) throw new Error('topic 無效或尚未支援，不可用關鍵字自行猜測用神');
    const calendar = validateCalendar(input.calendar);
    const structure = Structure.analyze(input);
    const lines = structure.primaryLines.map(line => lineEvidence(line, calendar));
    const topic = TOPICS[input.topic];
    const primaryTargets = resolveTargets(lines, topic.primary);
    const secondaryTargets = resolveTargets(lines, topic.secondary);
    return {
      engine: 'tianheng-wenshi-liuyao-evidence',
      version: VERSION,
      legacyOverride: false,
      status: 'evidence_complete_decision_pending',
      structure,
      calendar,
      topic: { code: input.topic, ...topic },
      lines,
      targets: {
        primary: primaryTargets,
        secondary: secondaryTargets,
        selectionRule: 'explicit_topic_not_keyword_guess'
      },
      evidenceLedger: {
        support: [],
        resistance: [],
        unresolved: ['尚未裁決旺衰合力、動變生剋與應期'],
        originalFactsPreserved: true
      }
    };
  }

  function safeAnalyze(input) {
    try { return { ok:true, result:analyze(input) }; }
    catch (error) { return { ok:false, error:error.message }; }
  }

  const api = {
    version: VERSION,
    legacyOverride: false,
    topics: TOPICS,
    seasonalState,
    analyze,
    safeAnalyze
  };
  root.TianhengWenshiLiuYaoEvidence = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
