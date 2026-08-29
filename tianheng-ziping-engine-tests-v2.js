const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js','tianheng-ziping-engine-v2.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
const p=[{gan:'甲',zhi:'子'},{gan:'辛',zhi:'酉'},{gan:'甲',zhi:'卯'},{gan:'丙',zhi:'寅'}],r=TianhengZipingEngine.analyzeFortune(p,{gan:'丁',zhi:'酉'},{period:'2026 丁酉'});
t('二階原局四層存在',()=>ok(r.original.pattern&&r.original.flow&&r.original.qi&&r.original.officerKill));
t('運後與轉態分開保存',()=>ok(r.fortune.after&&r.fortune.transition));
t('近期建議已生成',()=>ok(r.advice.generatedFromEvidence));
t('原局不被運後覆寫',()=>ok(r.original.pattern!==r.fortune.after.pattern));
t('不覆蓋舊引擎',()=>ok(r.legacyOverride===false));
t('錯誤四柱由安全入口攔截',()=>ok(!TianhengZipingEngine.safeAnalyzeFortune([],{},{}).ok));
console.log(`\nRESULT ${pass}/${total} passed`);
