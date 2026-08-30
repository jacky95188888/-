const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js','tianheng-ziping-engine-v2.js','tianheng-bazi-yongshen-v3.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
function run(p,fortune,strength){const a=TianhengBaziEngine.analyze(p),z=TianhengZipingEngine.analyzeFortune(p,fortune,{strength});return TianhengBaziYongShenV3.analyze(p,a,z);}
const weakP=[{gan:'己',zhi:'丑'},{gan:'癸',zhi:'丑'},{gan:'庚',zhi:'午'},{gan:'甲',zhi:'寅'}],weak=run(weakP,{gan:'丙',zhi:'午'},'身弱');
t('六路用神資料完整保存',()=>ok(['fuyi','tiaohou','tongguan','bingyao','geju','special'].every(k=>weak.schools[k])));
t('身弱扶抑先取印比',()=>ok(weak.schools.fuyi.favorableElements.includes('土')&&weak.schools.fuyi.favorableElements.includes('金')));
t('身弱扶抑慎財官食傷',()=>ok(['木','火','水'].every(x=>weak.schools.fuyi.adverseElements.includes(x))));
t('丑月調候保留丙丁火需求',()=>ok(weak.schools.tiaohou.favorableElements.includes('火')));
t('調候扶抑衝突標示限量而非硬補',()=>ok(weak.ranking.find(x=>x.element==='火').conflict&&weak.ranking.find(x=>x.element==='火').useMode==='限量調候'));
t('財壞印病藥可辨比劫制財護印',()=>ok(weak.schools.bingyao.evidence.some(x=>x.includes('財壞印'))&&weak.schools.bingyao.favorableElements.includes('金')));
t('輸出第一第二用神與忌神',()=>ok(weak.primary&&weak.secondary&&Array.isArray(weak.avoid)));
t('每個候選保留正反證據',()=>ok(weak.ranking.every(x=>Array.isArray(x.positive)&&Array.isArray(x.negative))));
const strongP=[{gan:'甲',zhi:'子'},{gan:'辛',zhi:'酉'},{gan:'甲',zhi:'卯'},{gan:'丙',zhi:'寅'}],strong=run(strongP,{gan:'丁',zhi:'酉'},'身強');
t('身強扶抑取食傷財官',()=>ok(['火','土','金'].every(x=>strong.schools.fuyi.favorableElements.includes(x))));
t('身強與身弱第一用神裁決不同',()=>ok(strong.primary.element!==weak.primary.element||strong.primary.reason!==weak.primary.reason));
const qiP=[{gan:'甲',zhi:'午'},{gan:'丁',zhi:'卯'},{gan:'甲',zhi:'午'},{gan:'丁',zhi:'卯'}],qi=run(qiP,{gan:'丁',zhi:'巳'},'身強');
t('兩氣成象啟動專旺優先',()=>ok(qi.schools.special.favorableElements.length===2&&qi.ranking.some(x=>x.useMode==='專旺優先')));
t('專旺判斷不刪除一般扶抑證據',()=>ok(qi.schools.fuyi.evidence.length&&qi.schools.special.evidence.length));
t('用神結果不覆寫舊引擎',()=>ok(weak.legacyOverride===false));
t('錯誤輸入安全攔截',()=>ok(!TianhengBaziYongShenV3.safeAnalyze([],null,null).ok));
t('不以最缺五行直接當用神',()=>ok(weak.schools.bingyao.direction.includes('不用最缺五行')));
t('不做越多越好的錯誤承諾',()=>ok(weak.disclaimer.includes('不代表某五行越多越好')));
console.log(`\nRESULT ${pass}/${total} passed`);
