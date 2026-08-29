const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
const p=[{gan:'甲',zhi:'子'},{gan:'辛',zhi:'酉'},{gan:'甲',zhi:'卯'},{gan:'丙',zhi:'寅'}];
const clash=TianhengZipingFortune.analyze(p,{gan:'丁',zhi:'酉'}),join=TianhengZipingFortune.analyze(p,{gan:'己',zhi:'戌'});
const a=TianhengZipingAdvice.generate(clash,{period:'2026 丁酉'}),b=TianhengZipingAdvice.generate(join,{period:'2027 己戌'});
t('建議由證據生成',()=>ok(a.generatedFromEvidence&&a.career.evidence.length));
t('事業與感情分欄',()=>ok(a.career.actions.length&&a.relationship.actions.length));
t('日支受沖生成關係調整建議',()=>ok(a.relationship.reading.includes('日支受沖')));
t('不同運程不是同一罐頭',()=>ok(JSON.stringify(a.actionPlan)!==JSON.stringify(b.actionPlan)||a.relationship.theme!==b.relationship.theme));
t('保留證據數與信心說明',()=>ok(a.confidence.evidenceCount>=a.career.evidence.length));
t('不做保證式預言',()=>ok(!/一定|保證|必然發生|必定/.test(JSON.stringify(a))));
t('不覆蓋舊引擎',()=>ok(a.legacyOverride===false));
t('錯誤輸入安全攔截',()=>ok(!TianhengZipingAdvice.safeGenerate({}).ok));
console.log(`\nRESULT ${pass}/${total} passed`);
