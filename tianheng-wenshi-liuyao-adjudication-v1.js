'use strict';

(function attachLiuYaoAdjudication(root) {
  const Evidence = root.TianhengWenshiLiuYaoEvidence ||
    (typeof require === 'function' ? require('./tianheng-wenshi-liuyao-evidence-v1.js') : null);
  const VERSION = '1.0.0';
  const GANS = '甲乙丙丁戊己庚辛壬癸'.split('');
  const ZHIS = '子丑寅卯辰巳午未申酉戌亥'.split('');
  const ELEMENTS = ['木','火','土','金','水'];
  const GENERATES = { 木:'火',火:'土',土:'金',金:'水',水:'木' };
  const CONTROLS = { 木:'土',土:'水',水:'火',火:'金',金:'木' };
  const ADVANCES = { 寅:'卯',巳:'午',申:'酉',亥:'子',丑:'辰',辰:'未',未:'戌',戌:'丑' };
  const RETREATS = Object.fromEntries(Object.entries(ADVANCES).map(([from,to]) => [to,from]));
  const SEASON_RANK = { 死:0,囚:1,休:2,相:3,旺:4 };

  function sexagenaryIndex(dayGan, dayZhi) {
    const ganIndex = GANS.indexOf(dayGan);
    const zhiIndex = ZHIS.indexOf(dayZhi);
    if (ganIndex < 0 || zhiIndex < 0) throw new Error('日干支無效');
    for (let index=0; index<60; index++) {
      if (index%10===ganIndex && index%12===zhiIndex) return index;
    }
    throw new Error(`日干支組合無效：${dayGan}${dayZhi}`);
  }

  function xunKong(dayGan, dayZhi) {
    const index = sexagenaryIndex(dayGan, dayZhi);
    const xunStart = Math.floor(index/10)*10;
    const startZhiIndex = xunStart%12;
    return [ZHIS[(startZhiIndex+10)%12], ZHIS[(startZhiIndex+11)%12]];
  }

  function sourceElement(usefulElement) {
    return ELEMENTS.find(element => GENERATES[element]===usefulElement);
  }

  function adverseElement(usefulElement) {
    return ELEMENTS.find(element => CONTROLS[element]===usefulElement);
  }

  function enemyElement(usefulElement) {
    const source = sourceElement(usefulElement);
    const adverse = adverseElement(usefulElement);
    return ELEMENTS.find(element => CONTROLS[element]===source && GENERATES[element]===adverse);
  }

  function spiritSet(lines, usefulElement) {
    const source = sourceElement(usefulElement);
    const adverse = adverseElement(usefulElement);
    const enemy = enemyElement(usefulElement);
    return {
      useful: { element:usefulElement, lines:lines.filter(x=>x.element===usefulElement) },
      source: { label:'原神', element:source, lines:lines.filter(x=>x.element===source) },
      adverse: { label:'忌神', element:adverse, lines:lines.filter(x=>x.element===adverse) },
      enemy: { label:'仇神', element:enemy, lines:lines.filter(x=>x.element===enemy) }
    };
  }

  function classifyChange(from, to) {
    const events=[];
    if (to.element===from.element) {
      if (ADVANCES[from.zhi]===to.zhi) events.push('化進神');
      if (RETREATS[from.zhi]===to.zhi) events.push('化退神');
      if (!events.length) events.push('同五行換支');
    } else {
      if (GENERATES[to.element]===from.element) events.push('回頭生');
      if (CONTROLS[to.element]===from.element) events.push('回頭克');
      if (GENERATES[from.element]===to.element) events.push('化洩');
      if (CONTROLS[from.element]===to.element) events.push('化耗');
    }
    return events;
  }

  function decorateLine(line, emptyBranches) {
    const state=line.calendar.seasonalState;
    return {
      ...line,
      adjudicationFacts: {
        xunEmpty: emptyBranches.includes(line.zhi),
        monthBreak: line.calendar.monthClash,
        dayClash: line.calendar.dayClash,
        darkMoveCandidate: !line.moving && line.calendar.dayClash && (state==='旺'||state==='相'),
        weakDayClash: !line.moving && line.calendar.dayClash && (state==='休'||state==='囚'||state==='死')
      }
    };
  }

  function rankVector(line) {
    return [
      Number(line.moving),
      Number(line.calendar.monthSameBranch),
      Number(line.calendar.daySameBranch),
      SEASON_RANK[line.calendar.seasonalState],
      Number(!line.adjudicationFacts.monthBreak),
      Number(!line.adjudicationFacts.xunEmpty)
    ];
  }

  function compareVector(a,b) {
    for(let i=0;i<a.length;i++) if(a[i]!==b[i]) return b[i]-a[i];
    return 0;
  }

  function selectCandidate(candidates) {
    if (!candidates.length) return { selected:null, alternatives:[], unresolvedReason:'用神未現，需進入伏神層' };
    const ranked=candidates.map(line=>({ line, vector:rankVector(line) })).sort((a,b)=>compareVector(a.vector,b.vector));
    if(ranked.length>1 && compareVector(ranked[0].vector,ranked[1].vector)===0) {
      return { selected:null, alternatives:ranked.map(x=>x.line), unresolvedReason:'多個用神候選同級，暫不武斷取一' };
    }
    return {
      selected:ranked[0].line,
      alternatives:ranked.slice(1).map(x=>x.line),
      selectionBasis:['動爻優先','臨月建優先','臨日辰優先','旺相優先','避月破旬空'].filter(Boolean)
    };
  }

  function ledgerFor(selected, spirits) {
    const support=[];
    const resistance=[];
    if(!selected) return { support,resistance,unresolved:['尚未取得唯一用神'] };
    const f=selected.adjudicationFacts;
    const c=selected.calendar;
    if(selected.moving) support.push({ code:'USEFUL_MOVING', text:'用神發動', line:selected.position });
    if(c.monthSameBranch) support.push({ code:'MONTH_SAME', text:'用神臨月建', line:selected.position });
    if(c.daySameBranch) support.push({ code:'DAY_SAME', text:'用神臨日辰', line:selected.position });
    if(c.seasonalState==='旺'||c.seasonalState==='相') support.push({ code:'SEASON_SUPPORT', text:`用神得${c.seasonalState}`, line:selected.position });
    if(c.monthElementRelation==='generates'||c.dayElementRelation==='generates') support.push({ code:'CALENDAR_GENERATES', text:'日月有生扶用神', line:selected.position });
    if(f.monthBreak) resistance.push({ code:'MONTH_BREAK', text:'用神月破', line:selected.position });
    if(f.xunEmpty) resistance.push({ code:'XUN_EMPTY', text:'用神旬空', line:selected.position });
    if(c.seasonalState==='囚'||c.seasonalState==='死') resistance.push({ code:'SEASON_WEAK', text:`用神逢${c.seasonalState}`, line:selected.position });
    if(c.monthElementRelation==='controls'||c.dayElementRelation==='controls') resistance.push({ code:'CALENDAR_CONTROLS', text:'日月有克制用神', line:selected.position });
    spirits.source.lines.filter(x=>x.moving).forEach(x=>support.push({code:'SOURCE_MOVING',text:'原神發動',line:x.position}));
    spirits.adverse.lines.filter(x=>x.moving).forEach(x=>resistance.push({code:'ADVERSE_MOVING',text:'忌神發動',line:x.position}));
    spirits.enemy.lines.filter(x=>x.moving).forEach(x=>resistance.push({code:'ENEMY_MOVING',text:'仇神發動',line:x.position}));
    return { support,resistance,unresolved:['尚需合參動變、合沖、伏神與應期後才可定方向'] };
  }

  function analyze(input) {
    const evidence=Evidence.analyze(input);
    const emptyBranches=xunKong(evidence.calendar.dayGan,evidence.calendar.dayZhi);
    const lines=evidence.lines.map(line=>decorateLine(line,emptyBranches));
    const primaryDefinition=evidence.targets.primary[0].definition;
    const primaryCandidates=evidence.targets.primary[0].candidates.map(candidate=>
      lines.find(line=>line.position===candidate.position));
    const selection=selectCandidate(primaryCandidates);
    const usefulElement=selection.selected?.element || primaryCandidates[0]?.element || null;
    const spirits=usefulElement ? spiritSet(lines,usefulElement) : null;
    const changes=evidence.structure.changeEvents.map(event=>({
      position:event.position,
      from:lines.find(line=>line.position===event.position),
      to:event.to,
      events:classifyChange(event.from,event.to)
    }));
    return {
      engine:'tianheng-wenshi-liuyao-adjudication', version:VERSION, legacyOverride:false,
      status:'adjudication_events_complete_outcome_pending', evidence,
      calendarRules:{ xunKong:emptyBranches, sexagenaryIndex:sexagenaryIndex(evidence.calendar.dayGan,evidence.calendar.dayZhi) },
      lines, usefulGod:{ definition:primaryDefinition, ...selection }, spirits, changeEvents:changes,
      evidenceLedger: spirits ? ledgerFor(selection.selected,spirits) : {
        support:[],resistance:[],unresolved:['用神未現，需完成伏神層']
      },
      layers:{ originalEvidence:evidence, adjudicationFactsSeparate:true, finalOutcomeAttached:false }
    };
  }

  function safeAnalyze(input){try{return{ok:true,result:analyze(input)}}catch(error){return{ok:false,error:error.message}}}
  const api={version:VERSION,legacyOverride:false,xunKong,classifyChange,spiritSet,analyze,safeAnalyze};
  root.TianhengWenshiLiuYaoAdjudication=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

