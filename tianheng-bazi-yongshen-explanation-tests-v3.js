const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js','tianheng-ziping-engine-v2.js','tianheng-bazi-yongshen-v3.js','tianheng-bazi-yongshen-explanation-v3.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
function run(p,f,s){const a=TianhengBaziEngine.analyze(p),z=TianhengZipingEngine.analyzeFortune(p,f,{strength:s}),y=TianhengBaziYongShenV3.analyze(p,a,z);return {y,e:TianhengBaziYongShenExplanationV3.explain(y)};}
const weak=run([{gan:'己',zhi:'丑'},{gan:'癸',zhi:'丑'},{gan:'庚',zhi:'午'},{gan:'甲',zhi:'寅'}],{gan:'丙',zhi:'午'},'身弱');
t('完整講解含結論原因影響行動避免證據',()=>ok(weak.e.title&&weak.e.summary&&weak.e.why&&weak.e.impact&&weak.e.actions.length&&weak.e.avoid.length&&weak.e.evidence.length));
t('六路不是只顯示標籤',()=>ok(weak.e.details.length===6&&weak.e.details.every(x=>(x.text+x.reading).length>55&&x.reading.includes('證據'))));
t('第一第二用神有順位說明',()=>ok(weak.e.title.includes('第一用神')&&weak.e.why.includes('第二順位')));
t('衝突說明不是硬補',()=>ok(weak.e.impact.includes('逐項限縮')&&weak.e.evidence.some(x=>x.includes('不作全面增補'))));
t('用神轉成生活功能而非幸運色',()=>ok(weak.e.impact.includes('生活上要落實')&&weak.e.avoid.some(x=>x.includes('幸運色'))));
t('保留原始證據且禁止覆寫',()=>ok(weak.e.generatedFromEvidence&&weak.e.legacyOverride===false));
const strong=run([{gan:'甲',zhi:'子'},{gan:'辛',zhi:'酉'},{gan:'甲',zhi:'卯'},{gan:'丙',zhi:'寅'}],{gan:'丁',zhi:'酉'},'身強');
t('不同命盤產生不同裁決講解',()=>ok(weak.e.title!==strong.e.title||weak.e.why!==strong.e.why));
t('不同命盤六路證據不同',()=>ok(JSON.stringify(weak.e.details)!==JSON.stringify(strong.e.details)));
t('沒有保證式斷語與未定義字樣',()=>ok(!/一定成功|必然發生|undefined|null・null/.test(JSON.stringify(weak.e)+JSON.stringify(strong.e))));
t('錯誤輸入安全攔截',()=>ok(!TianhengBaziYongShenExplanationV3.safeExplain(null).ok));
console.log(`\nRESULT ${pass}/${total} passed`);
