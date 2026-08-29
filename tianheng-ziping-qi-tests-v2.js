'use strict';
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-ziping-qi-v2.js');
const Q=globalThis.TianhengZipingQi;
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
const woodFire=Q.analyze([{gan:'甲',zhi:'午'},{gan:'丁',zhi:'卯'},{gan:'甲',zhi:'午'},{gan:'丁',zhi:'卯'}]);
assert('木火兩氣占比達門檻',()=>woodFire.qualifies&&woodFire.topShare>=.88);
assert('木火相生判兩氣成象',()=>woodFire.pattern==='兩氣成象・木火'&&woodFire.generatingRelation);
const fireFollow=Q.analyze([{gan:'丁',zhi:'卯'},{gan:'乙',zhi:'巳'},{gan:'丁',zhi:'卯'},{gan:'乙',zhi:'巳'}]);
assert('夏令火日木從火勢判炎上',()=>fireFollow.qualifies&&fireFollow.pattern==='炎上格');
const fireEarth=Q.analyze([{gan:'丙',zhi:'午'},{gan:'戊',zhi:'戌'},{gan:'丙',zhi:'午'},{gan:'戊',zhi:'戌'}]);
assert('火土相生判兩氣成象',()=>fireEarth.pattern==='兩氣成象・火土');
const mixed=Q.analyze([{gan:'甲',zhi:'子'},{gan:'丙',zhi:'午'},{gan:'戊',zhi:'辰'},{gan:'庚',zhi:'酉'}]);
assert('五行混雜不強判成象',()=>mixed.qualifies===false&&mixed.pattern===null);
assert('保留常格不覆寫聲明',()=>woodFire.conventionalOverride===false);
const moved=Q.analyzeFortune([{gan:'甲',zhi:'午'},{gan:'丁',zhi:'卯'},{gan:'甲',zhi:'午'},{gan:'丁',zhi:'卯'}],{type:'大運',gan:'庚',zhi:'子'});
assert('氣勢運前運後分開保存',()=>moved.before.pattern==='兩氣成象・木火'&&moved.after.pattern!==moved.before.pattern&&moved.legacyOverride===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
