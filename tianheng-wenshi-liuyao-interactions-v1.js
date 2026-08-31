'use strict';

(function attachLiuYaoInteractions(root){
  const Adjudication=root.TianhengWenshiLiuYaoAdjudication||(typeof require==='function'?require('./tianheng-wenshi-liuyao-adjudication-v1.js'):null);
  const Structure=root.TianhengWenshiLiuYaoStructure||(typeof require==='function'?require('./tianheng-wenshi-liuyao-structure-v1.js'):null);
  const Core=root.TianhengWenshiLiuYao||(typeof require==='function'?require('./tianheng-wenshi-liuyao-v1.js'):null);
  const VERSION='1.0.0';
  const GENERATES={木:'火',火:'土',土:'金',金:'水',水:'木'};
  const CONTROLS={木:'土',土:'水',水:'火',火:'金',金:'木'};
  const CLASH={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  const HARMONY={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  const TRINES=[{branches:['申','子','辰'],element:'水'},{branches:['亥','卯','未'],element:'木'},{branches:['寅','午','戌'],element:'火'},{branches:['巳','酉','丑'],element:'金'}];

  function elementRelation(from,to){
    if(from===to)return'同氣';
    if(GENERATES[from]===to)return'飛生伏';
    if(CONTROLS[from]===to)return'飛克伏';
    if(GENERATES[to]===from)return'伏生飛';
    if(CONTROLS[to]===from)return'伏克飛';
    return'未定';
  }

  function purePalaceCasts(palace){
    const entry=Object.entries(Core.trigrams).find(([,value])=>value.name===palace);
    if(!entry)throw new Error(`找不到${palace}宮經卦`);
    const bits=entry[0].split('').map(Number);
    return bits.concat(bits).map(bit=>bit?7:8);
  }

  function findHiddenGod(input, adjudication){
    if(adjudication.usefulGod.selected)return null;
    const definition=adjudication.usefulGod.definition;
    if(!definition||definition.type!=='relation')return null;
    const palaceStructure=Structure.analyze({...input,casts:purePalaceCasts(adjudication.evidence.structure.palace.palace)});
    const hiddenCandidates=palaceStructure.primaryLines.filter(line=>line.relation===definition.value);
    if(!hiddenCandidates.length)return{found:false,reason:'本宮首卦亦未找到指定六親'};
    return{
      found:true,
      palaceHexagram:palaceStructure.casting.primary,
      candidates:hiddenCandidates.map(hidden=>{
        const flying=adjudication.lines.find(line=>line.position===hidden.position);
        return{
          position:hidden.position,
          hidden:{...hidden,xunEmpty:adjudication.calendarRules.xunKong.includes(hidden.zhi),monthBreak:CLASH[hidden.zhi]===adjudication.evidence.calendar.monthZhi},
          flying,
          relation:elementRelation(flying.element,hidden.element),
          exposureFacts:{flyingMoving:flying.moving,flyingDayClash:flying.adjudicationFacts.dayClash,flyingMonthBreak:flying.adjudicationFacts.monthBreak}
        };
      }),
      note:'伏神僅補足用神位置；是否可出伏仍須合參飛神、日月與動爻。'
    };
  }

  function pairInteractions(lines){
    const events=[];
    for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){
      const a=lines[i],b=lines[j];
      if(CLASH[a.zhi]===b.zhi)events.push({type:'六沖',pair:[a.zhi,b.zhi],positions:[a.position,b.position],active:a.moving||b.moving,activePositions:[a,b].filter(x=>x.moving).map(x=>x.position)});
      if(HARMONY[a.zhi]===b.zhi)events.push({type:'六合',pair:[a.zhi,b.zhi],positions:[a.position,b.position],active:a.moving||b.moving,activePositions:[a,b].filter(x=>x.moving).map(x=>x.position)});
    }
    return events;
  }

  function trineInteractions(lines){
    return TRINES.flatMap(trine=>{
      const members=trine.branches.map(branch=>lines.filter(line=>line.zhi===branch)).flat();
      if(!trine.branches.every(branch=>members.some(line=>line.zhi===branch)))return[];
      const unique=members.filter((line,index,array)=>array.findIndex(x=>x.position===line.position)===index);
      return[{
        type:'三合',branches:trine.branches.slice(),element:trine.element,
        positions:unique.map(x=>x.position),active:unique.some(x=>x.moving),
        activePositions:unique.filter(x=>x.moving).map(x=>x.position),
        transformed:false,note:'僅記錄支序齊備；是否成局與化氣留待合力裁決。'
      }];
    });
  }

  function analyze(input){
    const adjudication=Adjudication.analyze(input);
    const hiddenGod=findHiddenGod(input,adjudication);
    const branchPairs=pairInteractions(adjudication.lines);
    const trines=trineInteractions(adjudication.lines);
    return{
      engine:'tianheng-wenshi-liuyao-interactions',version:VERSION,legacyOverride:false,
      status:'interaction_events_complete_outcome_pending',adjudication,hiddenGod,
      interactions:{branchPairs,trines,transformEvents:[]},
      evidenceLedger:{
        support:adjudication.evidenceLedger.support.slice(),
        resistance:adjudication.evidenceLedger.resistance.slice(),
        unresolved:adjudication.evidenceLedger.unresolved.concat('沖合三合目前只記錄事件，尚未直接改寫用神強弱')
      },
      layers:{originalAdjudication:adjudication,interactionEventsSeparate:true,finalOutcomeAttached:false}
    };
  }
  function safeAnalyze(input){try{return{ok:true,result:analyze(input)}}catch(error){return{ok:false,error:error.message}}}
  const api={version:VERSION,legacyOverride:false,elementRelation,pairInteractions,trineInteractions,analyze,safeAnalyze};
  root.TianhengWenshiLiuYaoInteractions=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

