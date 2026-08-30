const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-bazi-integration-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js','tianheng-ziping-engine-v2.js','tianheng-ziping-integration-v2.js','tianheng-bazi-yongshen-v3.js','tianheng-bazi-yongshen-fortune-v3.js','tianheng-bazi-integration-v3.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
const p=[{gan:'己',zhi:'丑'},{gan:'癸',zhi:'丑'},{gan:'庚',zhi:'午'},{gan:'甲',zhi:'寅'}],legacy={strengthInfo:{strength:'原站身強'},keep:'不可覆寫'},r=TianhengBaziIntegrationV3.analyzeAlongsideLegacy(p,legacy,{gan:'丙',zhi:'午'},{legacyStrengthPath:'strengthInfo.strength',strength:'身弱',period:'2026 丙午'});
t('舊站至三階仍保留同一引用',()=>ok(r.legacy.result===legacy&&legacy.keep==='不可覆寫'));
t('進階 v1 子平 v2 用神 v3 同時存在',()=>ok(r.advancedV1.advanced&&r.zipingV2.original&&r.yongShenV3.primary));
t('本命用神與歲運作用後狀態同時存在',()=>ok(r.yongShenFortuneV3.primaryAfterFortune&&r.separation.natalYongShen&&r.separation.fortuneYongShenEvents.primary));
t('六路用神與排名衝突分欄保存',()=>ok(r.separation.yongShenSchools.fuyi&&Array.isArray(r.separation.yongShenRanking)&&Array.isArray(r.separation.yongShenConflicts)));
t('原始合化事件最終力量仍分欄',()=>ok(r.separation.originalCombinationStrength&&Array.isArray(r.separation.transformEvents)&&r.separation.finalCombinationStrength));
t('調候原判斷與用神裁決分開',()=>ok(r.separation.tiaoHou!==r.separation.yongShenSchools.tiaohou));
t('本命用神與歲運作用事件不同引用',()=>ok(r.separation.natalYongShen.primary===r.yongShenV3.primary&&r.separation.fortuneYongShenEvents.primary!==r.yongShenV3.primary));
t('三階禁止覆蓋舊引擎',()=>ok(r.legacyOverride===false&&r.yongShenV3.legacyOverride===false));
t('錯誤輸入安全攔截',()=>ok(!TianhengBaziIntegrationV3.safeAnalyzeAlongsideLegacy([],legacy,{},{}).ok));
const html=fs.readFileSync('index.html','utf8');
t('正式首頁依相依順序載入三階模組',()=>ok(html.indexOf('tianheng-ziping-integration-v2.js')<html.indexOf('tianheng-bazi-yongshen-v3.js')&&html.indexOf('tianheng-bazi-yongshen-v3.js')<html.indexOf('tianheng-bazi-integration-v3.js')&&html.indexOf('tianheng-bazi-integration-v3.js')<html.indexOf('tianheng-bazi-yongshen-explanation-v3.js')));
t('正式首頁新增三階完整講解且保留舊調候卡',()=>ok(html.includes('三階用神裁決')&&html.includes('renderBaziExplanation(yongExplain)')&&html.includes('調候用神')));
console.log(`\nRESULT ${pass}/${total} passed`);
