const fs=require('fs'),vm=require('vm');
['tianheng-bazi-advanced-v1.js','tianheng-bazi-combinations-v1.js','tianheng-bazi-geju-tiaohou-v1.js','tianheng-bazi-quality-v1.js','tianheng-bazi-engine-v1.js','tianheng-ziping-pattern-v2.js','tianheng-ziping-flow-v2.js','tianheng-ziping-qi-v2.js','tianheng-ziping-officer-kill-v2.js','tianheng-ziping-fortune-combinations-v2.js','tianheng-ziping-combination-effect-v2.js','tianheng-ziping-fortune-v2.js','tianheng-ziping-advice-v2.js','tianheng-ziping-engine-v2.js','tianheng-bazi-yongshen-v3.js','tianheng-bazi-yongshen-fortune-v3.js','tianheng-bazi-yongshen-fortune-explanation-v3.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
let pass=0,total=0;function t(n,f){total++;try{f();pass++;console.log('PASS '+n);}catch(e){console.error('FAIL '+n+'\n '+e.message);process.exitCode=1;}}function ok(x,m){if(!x)throw Error(m||'assert');}
function run(p,f,strength){const a=TianhengBaziEngine.analyze(p),z=TianhengZipingEngine.analyzeFortune(p,f,{strength,period:'2026 '+f.gan+f.zhi}),y=TianhengBaziYongShenV3.analyze(p,a,z),r=TianhengBaziYongShenFortuneV3.analyze(p,f,y,z,{period:'2026 '+f.gan+f.zhi});return {a,z,y,r,e:TianhengBaziYongShenFortuneExplanationV3.explain(r)};}
const weakP=[{gan:'己',zhi:'丑'},{gan:'癸',zhi:'丑'},{gan:'庚',zhi:'午'},{gan:'甲',zhi:'寅'}],earth=run(weakP,{gan:'戊',zhi:'辰'},'身弱'),fire=run(weakP,{gan:'丙',zhi:'午'},'身弱');
t('本命用神與歲運作用後狀態分存',()=>ok(earth.r.natalYongShen.primary===earth.y.primary&&earth.r.primaryAfterFortune!==earth.y.primary));
t('第一用神土逢土運判得用',()=>ok(earth.r.primaryAfterFortune.element==='土'&&earth.r.primaryAfterFortune.status==='得用'));
t('火運生土但同時制第二用神金',()=>ok(fire.r.primaryAfterFortune.positive.some(x=>x.type==='生扶')&&fire.r.secondaryAfterFortune.negative.some(x=>x.type==='受制')));
t('忌神到位標示忌神增力',()=>{const wood=run(weakP,{gan:'甲',zhi:'寅'},'身弱');ok(wood.r.avoidAfterFortune.some(x=>x.element==='木'&&x.status==='忌神增力'));});
t('宮位沖合證據落回事業與感情',()=>{const clash=run(weakP,{gan:'甲',zhi:'子'},'身弱');ok(clash.r.palaceEvents.some(x=>x.area==='感情'&&x.type==='沖'));});
t('事業感情財務三域都有行動與避免',()=>ok(['career','relationship','finance'].every(k=>earth.r.domains[k].actions.length&&earth.r.domains[k].avoid.length)));
t('財務不做獲利保證',()=>ok(earth.r.domains.finance.avoid.some(x=>x.includes('保證投資獲利')&&x.includes('不因命理'))));
t('完整講解含結論原因影響行動證據',()=>ok(earth.e.title&&earth.e.summary&&earth.e.why&&earth.e.impact&&earth.e.actions.length&&earth.e.avoid.length&&earth.e.evidence.length));
t('完整講解包含事業感情財務逐域說明',()=>ok(['事業','感情','財務'].every(x=>earth.e.details.some(d=>d.label.includes(x)&&d.reading.includes('證據')))));
t('領域講解不產生重複句尾標點',()=>ok(!/。；|。。/.test(earth.e.details.map(x=>x.reading).join(''))));
t('不同歲運不共用同一段罐頭結果',()=>ok(earth.e.title!==fire.e.title&&earth.e.impact!==fire.e.impact&&JSON.stringify(earth.e.details)!==JSON.stringify(fire.e.details)));
t('歲運層不得覆寫既有引擎',()=>ok(earth.r.legacyOverride===false&&earth.e.legacyOverride===false));
t('錯誤輸入安全攔截',()=>ok(!TianhengBaziYongShenFortuneV3.safeAnalyze([],{},null,null).ok&&!TianhengBaziYongShenFortuneExplanationV3.safeExplain(null).ok));
const html=fs.readFileSync('index.html','utf8');
t('正式首頁按相依順序載入歲運得失模組',()=>ok(html.indexOf('tianheng-bazi-yongshen-v3.js')<html.indexOf('tianheng-bazi-yongshen-fortune-v3.js')&&html.indexOf('tianheng-bazi-yongshen-fortune-v3.js')<html.indexOf('tianheng-bazi-yongshen-fortune-explanation-v3.js')));
t('正式首頁新增完整歲運講解卡',()=>ok(html.includes('歲運用神得失')&&html.includes('renderBaziExplanation(yongFortuneExplain)')&&html.includes('${yongCard}')&&html.includes('${yongFortuneCard}')));
console.log(`\nRESULT ${pass}/${total} passed`);
