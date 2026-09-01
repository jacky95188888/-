'use strict';

const Core=require('./tianheng-meihua-core-v1.js');
const J=require('./tianheng-meihua-judgment-v1.js');
const E=require('./tianheng-meihua-engine-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(error){console.error('FAIL',name,'::',error.message);fail++;}}
const names=['乾','兌','離','震','巽','坎','艮','坤'];
const elements=['木','火','土','金','水'];
function base(extra={}){return{question:'全卦審核',category:'一般問事',askedAt:'2026-09-01T08:00:00+08:00',timezone:'Asia/Taipei',method:'manual_verified',manual:{upper:'乾',lower:'坤',movingLine:1,source:'窮舉測試'},monthZhi:'申',...extra};}

assert('六十四卦編號完整且不重複',()=>{
  const numbers=Object.values(Core.hexagrams).map(x=>x.number).sort((a,b)=>a-b);
  return numbers.length===64&&numbers.every((x,i)=>x===i+1);
});
assert('六十四卦名稱完整且不重複',()=>new Set(Object.values(Core.hexagrams).map(x=>x.name)).size===64);
assert('八卦陰陽碼完整且不重複',()=>new Set(Object.values(Core.trigrams).map(x=>x.bits.join(''))).size===8);
assert('全64卦乘6動爻共384局皆可重現',()=>{
  let count=0;
  for(const upper of names)for(const lower of names)for(let movingLine=1;movingLine<=6;movingLine++){
    const r=Core.analyze(base({manual:{upper,lower,movingLine,source:'384局窮舉'}}));
    if(!r.primary||!r.mutual||!r.changed) return false;
    count++;
  }
  return count===384;
});
assert('384局變卦都只改一爻',()=>{
  for(const upper of names)for(const lower of names)for(let movingLine=1;movingLine<=6;movingLine++){
    const r=Core.analyze(base({manual:{upper,lower,movingLine,source:'變爻窮舉'}}));
    const changed=r.primary.bits.filter((bit,i)=>bit!==r.changed.bits[i]);
    if(changed.length!==1||r.primary.bits[movingLine-1]===r.changed.bits[movingLine-1])return false;
  }
  return true;
});
assert('384局體卦保持不動而用卦確實改變',()=>{
  for(const upper of names)for(const lower of names)for(let movingLine=1;movingLine<=6;movingLine++){
    const r=Core.analyze(base({manual:{upper,lower,movingLine,source:'體用窮舉'}}));
    if(r.changed[r.bodyUse.bodyPart].name!==r.bodyUse.body.name)return false;
    if(r.changed[r.bodyUse.usePart].name===r.bodyUse.use.name)return false;
  }
  return true;
});
assert('全384局判斷分數皆為有限數且事件固定四條',()=>{
  for(const upper of names)for(const lower of names)for(let movingLine=1;movingLine<=6;movingLine++){
    const r=J.analyze(base({manual:{upper,lower,movingLine,source:'判斷窮舉'}}));
    if(r.evidenceLedger.events.length!==4||!Number.isFinite(r.outcome.supportScore)||!Number.isFinite(r.outcome.resistanceScore))return false;
  }
  return true;
});
assert('五行25種配對皆有且只有一種體用關係',()=>{
  const valid=new Set(['用生體','比和','體克用','體生用','用克體']);
  return elements.every(actor=>elements.every(body=>valid.has(J.relation(actor,body).name)));
});
assert('五季旺衰各自完整包含旺相休囚死',()=>Object.values(J.seasonStates).every(states=>Object.keys(states).length===5&&new Set(Object.values(states)).size===5));
assert('十二月支皆對應季節',()=>['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].every(zhi=>J.monthSeason[zhi]));
assert('西林寺牌額七八數重現山地剝三爻動變艮',()=>{
  const r=Core.analyze(base({method:'two_numbers',numbers:{first:7,second:8}}));
  return r.primary.name==='剝'&&r.movingLine===3&&r.changed.name==='艮';
});
assert('西林寺添勾七十數重現山澤損五爻動變中孚',()=>{
  const r=Core.analyze(base({method:'two_numbers',numbers:{first:7,second:10}}));
  return r.primary.name==='損'&&r.movingLine===5&&r.changed.name==='中孚';
});
assert('同一輸入重跑結果完全一致',()=>{
  const input=base({method:'two_numbers',numbers:{first:93,second:62}});
  return JSON.stringify(E.analyze(input).result)===JSON.stringify(E.analyze(input).result);
});
assert('分析不修改原始輸入物件',()=>{
  const input=base({method:'two_numbers',numbers:{first:93,second:62},externalResponse:{note:'忽聞鳥鳴',recordedAt:'2026-09-01T08:00:30+08:00'}});
  const before=JSON.stringify(input);E.analyze(input);return JSON.stringify(input)===before;
});
assert('缺少提問時間會攔截而非自動補現在',()=>{const input=base();delete input.askedAt;return !Core.safeAnalyze(input).ok;});
assert('缺少時區會攔截',()=>{const input=base();delete input.timezone;return !Core.safeAnalyze(input).ok;});
assert('無效月支會明確攔截',()=>!J.safeAnalyze(base({monthZhi:'錯'})).ok);
assert('錯誤外應格式會明確攔截',()=>!J.safeAnalyze(base({externalResponse:{note:''}})).ok);
assert('超過安全整數的取數會攔截',()=>!Core.safeAnalyze(base({method:'two_numbers',numbers:{first:Number.MAX_SAFE_INTEGER+1,second:2}})).ok);
assert('外應只增列未定證據不改變方向',()=>{
  const input=base();const a=J.analyze(input);const b=J.analyze({...input,externalResponse:{note:'忽聞鳥鳴',recordedAt:'2026-09-01T08:00:30+08:00'}});
  return a.outcome.direction===b.outcome.direction&&b.evidenceLedger.unresolved.length===a.evidenceLedger.unresolved.length+1;
});
assert('封存資料不含事後實際結果',()=>{
  const s=E.sealPrediction(base(),{caseId:'AUDIT-001',mode:'prospective',createdAt:'2026-09-01T08:01:00+08:00',probability:.5}).sealed;
  return !Object.prototype.hasOwnProperty.call(s,'actual');
});
assert('未完成實證前正式準確率與接站旗標皆為否',()=>{const r=E.analyze(base());return !r.release.formalAccuracyClaim&&!r.release.siteIntegrationReady;});
assert('所有層級維持legacyOverride false',()=>Core.legacyOverride===false&&J.legacyOverride===false&&E.legacyOverride===false&&E.analyze(base()).legacyOverride===false);

console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);

