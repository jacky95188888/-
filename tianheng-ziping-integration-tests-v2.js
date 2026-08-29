const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-bazi-integration-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js','tianheng-ziping-engine-v2.js','tianheng-ziping-integration-v2.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
const p=[{gan:'甲',zhi:'子'},{gan:'辛',zhi:'酉'},{gan:'甲',zhi:'卯'},{gan:'丙',zhi:'寅'}],legacy={strengthInfo:{strength:'原站身中和'},keep:'不可覆寫'},r=TianhengZipingIntegrationV2.analyzeAlongsideLegacy(p,legacy,{gan:'丁',zhi:'酉'},{legacyStrengthPath:'strengthInfo.strength',period:'2026 丁酉'});
t('舊結果原引用保留',()=>ok(r.legacy.result===legacy&&legacy.keep==='不可覆寫'));
t('進階 v1 與子平 v2 並存',()=>ok(r.advancedV1.advanced&&r.zipingV2.original));
t('四種強弱與調候資料分欄',()=>ok(r.separation.legacyStrength&&r.separation.tongGenStrength&&r.separation.tiaoHou));
t('原始合化事件最終力量分欄',()=>ok(r.separation.originalCombinationStrength&&Array.isArray(r.separation.transformEvents)&&r.separation.finalCombinationStrength));
t('原局運後建議分欄',()=>ok(r.separation.zipingOriginal&&r.separation.zipingAfterFortune&&r.separation.advice));
t('不覆蓋舊引擎',()=>ok(r.legacyOverride===false));
t('錯誤輸入安全攔截',()=>ok(!TianhengZipingIntegrationV2.safeAnalyzeAlongsideLegacy([],legacy,{},{}).ok));
const html=fs.readFileSync('index.html','utf8');
t('正式首頁以正確順序載入二階接入層',()=>ok(html.indexOf('tianheng-ziping-fortune-v2.js')<html.indexOf('tianheng-ziping-advice-v2.js')&&html.indexOf('tianheng-ziping-engine-v2.js')<html.indexOf('tianheng-ziping-integration-v2.js')));
t('正式首頁改用證據建議而非舊罐頭函式',()=>ok(html.includes('const recentGuidance=buildZipingV2Guidance(ziping)')&&!html.includes('const recentGuidance=buildRecentBaziGuidance(a,r)')));
console.log(`\nRESULT ${pass}/${total} passed`);
