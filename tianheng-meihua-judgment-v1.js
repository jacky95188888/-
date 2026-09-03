'use strict';

(function attachMeihuaJudgment(root) {
  const Core = root.TianhengMeihuaCore || (typeof require === 'function' ? require('./tianheng-meihua-core-v1.js') : null);
  const VERSION = '1.0.0';
  const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const MONTH_SEASON = {
    寅: '春', 卯: '春', 辰: '四季土',
    巳: '夏', 午: '夏', 未: '四季土',
    申: '秋', 酉: '秋', 戌: '四季土',
    亥: '冬', 子: '冬', 丑: '四季土'
  };
  const LUNAR_MONTH_ZHI = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
  const SEASON_STATES = {
    春: { 木: '旺', 火: '相', 水: '休', 金: '囚', 土: '死' },
    夏: { 火: '旺', 土: '相', 木: '休', 水: '囚', 金: '死' },
    秋: { 金: '旺', 水: '相', 土: '休', 火: '囚', 木: '死' },
    冬: { 水: '旺', 木: '相', 金: '休', 土: '囚', 火: '死' },
    四季土: { 土: '旺', 金: '相', 火: '休', 木: '囚', 水: '死' }
  };
  const RELATION_RULES = {
    用生體: { polarity: 'support', weight: 2, explanation: '外在條件回補主體' },
    比和: { polarity: 'support', weight: 1.25, explanation: '主客同氣，條件較易協調' },
    體克用: { polarity: 'support', weight: 0.75, explanation: '主體能約束事情，但仍需付出控制成本' },
    體生用: { polarity: 'resistance', weight: 1, explanation: '主體持續輸出，容易耗力' },
    用克體: { polarity: 'resistance', weight: 2, explanation: '外在條件直接壓制主體' }
  };

  function relation(actorElement, bodyElement) {
    let name;
    if (actorElement === bodyElement) name = '比和';
    else if (GENERATES[actorElement] === bodyElement) name = '用生體';
    else if (CONTROLS[actorElement] === bodyElement) name = '用克體';
    else if (GENERATES[bodyElement] === actorElement) name = '體生用';
    else if (CONTROLS[bodyElement] === actorElement) name = '體克用';
    else throw new Error(`無法判定五行生剋：${actorElement}/${bodyElement}`);
    return { name, ...RELATION_RULES[name] };
  }

  function monthContext(input, core) {
    const explicit = input.monthZhi || (input.calendar && input.calendar.monthZhi);
    const derived = core.casting.method === 'lunar_time' ? LUNAR_MONTH_ZHI[core.casting.original.lunarMonth - 1] : null;
    if (explicit && !MONTH_SEASON[explicit]) throw new Error('monthZhi 必須是十二地支');
    const monthZhi = explicit || derived;
    if (!monthZhi || !MONTH_SEASON[monthZhi]) {
      return { available: false, monthZhi: null, season: null, source: null, states: null, warning: '未提供月支，旺衰層保留未判' };
    }
    return {
      available: true,
      monthZhi,
      season: MONTH_SEASON[monthZhi],
      source: explicit ? 'operator_month_zhi' : 'derived_from_lunar_month_number',
      states: { ...SEASON_STATES[MONTH_SEASON[monthZhi]] },
      warning: null
    };
  }

  function event(stage, role, trigram, body, multiplier) {
    const rel = relation(trigram.element, body.element);
    return {
      stage,
      role,
      actor: { name: trigram.name, image: trigram.image, element: trigram.element },
      body: { name: body.name, image: body.image, element: body.element },
      relation: rel.name,
      polarity: rel.polarity,
      rawWeight: rel.weight,
      stageMultiplier: multiplier,
      weightedValue: Number((rel.weight * multiplier).toFixed(3)),
      explanation: rel.explanation,
      evidence: `${stage}：${trigram.name}${trigram.element}對體卦${body.name}${body.element}為「${rel.name}」，${rel.explanation}`
    };
  }

  function topicKey(category) {
    if (/考試|證照|檢定|測驗|成績/.test(category)) return 'exam';
    if (/感情|人際|婚/.test(category)) return 'relationship';
    if (/財|收入|收款|投資/.test(category)) return 'finance';
    if (/工作|事業|求職|升遷|合作/.test(category)) return 'career';
    if (/選擇|決策/.test(category)) return 'decision';
    return 'general';
  }

  const TOPIC_ACTIONS = {
    exam: {
      canDo: '核對考試範圍、及格門檻、成績公告與補考規則',
      avoid: '不要把考後感覺好壞直接當成正式成績',
      verify: '以官方成績、合格通知或證照核發資料確認結果'
    },
    career: {
      canDo: '把職務條件、決策人與回覆期限整理成可追蹤事項',
      avoid: '不要只憑氣氛判定錄取、升遷或合作已經成立',
      verify: '查明名額、預算、決策流程與下一個明確節點'
    },
    relationship: {
      canDo: '安排一次具體且不帶試探的對話，確認雙方需求與界線',
      avoid: '不要把沉默、已讀或短期情緒直接解讀成最終答案',
      verify: '觀察對方是否有持續、可重複的實際投入'
    },
    finance: {
      canDo: '先核對金額、付款條件、期限與可承受損失',
      avoid: '不要因單一有利象意承諾借貸或保證投資獲利',
      verify: '以帳務、合約、現金流與正式通知確認結果'
    },
    decision: {
      canDo: '把兩個方案的成本、期限與退出條件並列比較',
      avoid: '不要在關鍵資訊缺失時逼自己立刻二選一',
      verify: '先補齊最能改變選擇的那一項現實資訊'
    },
    general: {
      canDo: '把問題拆成下一個可以觀察與完成的具體行動',
      avoid: '不要把卦象當成替代現實查證的唯一答案',
      verify: '設定期限並記錄實際發生的事件，供後續揭盲核對'
    }
  };

  function strengthEvidence(month, body, use) {
    if (!month.available) return { bodyState: '未判', useState: '未判', support: [], resistance: [], unresolved: [month.warning] };
    const bodyState = month.states[body.element];
    const useState = month.states[use.element];
    const result = { bodyState, useState, support: [], resistance: [], unresolved: [] };
    if (bodyState === '旺') result.support.push(`體卦${body.name}${body.element}在${month.monthZhi}月得旺`);
    else if (bodyState === '相') result.support.push(`體卦${body.name}${body.element}在${month.monthZhi}月得相`);
    else if (bodyState === '囚') result.resistance.push(`體卦${body.name}${body.element}在${month.monthZhi}月受囚`);
    else if (bodyState === '死') result.resistance.push(`體卦${body.name}${body.element}在${month.monthZhi}月氣弱`);
    return result;
  }

  function normalizeExternalResponse(value) {
    if (value == null) return null;
    if (typeof value !== 'object' || Array.isArray(value)) throw new Error('externalResponse 必須是物件');
    if (typeof value.note !== 'string' || !value.note.trim()) throw new Error('externalResponse.note 不可空白');
    if (value.recordedAt != null && !Number.isFinite(Date.parse(value.recordedAt))) throw new Error('externalResponse.recordedAt 必須是有效時間');
    return { ...value, note: value.note.trim() };
  }

  function outcome(events, strength) {
    const supportEvents = events.filter(x => x.polarity === 'support');
    const resistanceEvents = events.filter(x => x.polarity === 'resistance');
    let supportScore = supportEvents.reduce((sum, x) => sum + x.weightedValue, 0);
    let resistanceScore = resistanceEvents.reduce((sum, x) => sum + x.weightedValue, 0);
    if (strength.bodyState === '旺') supportScore += 1;
    if (strength.bodyState === '相') supportScore += 0.5;
    if (strength.bodyState === '囚') resistanceScore += 0.5;
    if (strength.bodyState === '死') resistanceScore += 1;
    supportScore = Number(supportScore.toFixed(3));
    resistanceScore = Number(resistanceScore.toFixed(3));
    const balance = Number((supportScore - resistanceScore).toFixed(3));
    let direction = 'conditional';
    if (balance >= 2) direction = 'favorable';
    if (balance <= -2) direction = 'blocked';
    const conflict = supportEvents.length > 0 && resistanceEvents.length > 0;
    const confidence = strength.bodyState === '未判' ? 'low' : Math.abs(balance) >= 3 && !conflict ? 'high' : 'medium';
    return {
      direction,
      label: direction === 'favorable' ? '偏有利' : direction === 'blocked' ? '阻力偏強' : '條件未定',
      confidence,
      supportScore,
      resistanceScore,
      balance,
      auxiliaryScoreOnly: true,
      rule: '證據鏈優先，分數只供一致性檢查，不取代體用互變判斷'
    };
  }

  function analyze(input) {
    if (!Core) throw new Error('缺少梅花易數核心');
    const core = Core.analyze(input);
    const body = core.bodyUse.body;
    const use = core.bodyUse.use;
    const changedUse = core.changed[core.bodyUse.usePart];
    const month = monthContext(input, core);
    const externalResponse = normalizeExternalResponse(input.externalResponse);
    const events = [
      event('本卦起段', '本卦用', use, body, 1.2),
      event('互卦中段', '下互', core.mutual.lower, body, 0.65),
      event('互卦中段', '上互', core.mutual.upper, body, 0.65),
      event('變卦末段', '變後用', changedUse, body, 1)
    ];
    const strength = strengthEvidence(month, body, use);
    const result = outcome(events, strength);
    const adviceBase = TOPIC_ACTIONS[topicKey(core.request.category)];
    const initial = events[0];
    const final = events[3];
    const support = events.filter(x => x.polarity === 'support').map(x => x.evidence).concat(strength.support);
    const resistance = events.filter(x => x.polarity === 'resistance').map(x => x.evidence).concat(strength.resistance);
    const unresolved = strength.unresolved.slice();
    if (externalResponse) {
      unresolved.push(`外應另存：${externalResponse.note}（尚未納入自動定向）`);
    }
    return {
      engine: 'tianheng-meihua-judgment',
      version: VERSION,
      legacyOverride: false,
      core,
      monthContext: month,
      strength,
      timeline: {
        initial: { hexagram: core.primary, event: initial },
        middle: { hexagram: core.mutual, events: events.slice(1, 3) },
        final: { hexagram: core.changed, event: final }
      },
      evidenceLedger: { support, resistance, unresolved, events },
      outcome: result,
      explanation: {
        headline: `${core.primary.fullName}，${core.movingLine}爻動；體為${body.name}${body.element}，用為${use.name}${use.element}`,
        process: `起段為${initial.relation}；互卦${core.mutual.fullName}看中段；變為${core.changed.fullName}，末段為${final.relation}`,
        season: month.available ? `${month.monthZhi}月屬${month.season}，體卦為${strength.bodyState}、用卦為${strength.useState}` : month.warning,
        conclusion: `${result.label}（${result.confidence} 信心）；此結論由本卦、互卦、變卦與旺衰證據共同形成`
      },
      advice: {
        canDo: [adviceBase.canDo],
        avoid: [adviceBase.avoid],
        verify: [adviceBase.verify],
        timing: result.direction === 'conditional' ? ['先等待一個可驗證節點成立，再決定是否擴大行動'] : ['依提問期限記錄結果；v1 尚不硬給未校準精確日期']
      },
      externalResponse,
      disclaimer: '梅花易數推演供文化研究與生活規劃參考，不替代醫療、法律、投資或其他專業判斷。'
    };
  }

  function safeAnalyze(input) {
    try { return { ok: true, result: analyze(input) }; }
    catch (error) { return { ok: false, error: error.message }; }
  }

  const api = { version: VERSION, legacyOverride: false, relation, monthSeason: MONTH_SEASON, seasonStates: SEASON_STATES, analyze, safeAnalyze };
  root.TianhengMeihuaJudgment = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
