'use strict';

(function attachWenshiClassicsBenchmark(root){
  const VERSION='1.0.0';
  const CASES=[{
    id:'ZENGSHAN-10-WEALTH-YOU-XINHAI',
    source:{work:'增刪卜易',chapter:'元神忌神衰旺章第十',url:'https://zh.wikisource.org/wiki/增刪卜易/10',lines:'115-125'},
    validationClass:'classics_rule_calibration_not_blind_accuracy',
    questionSummary:'酉月辛亥日占求財',
    input:{
      question:'所求之財何時能見？',category:'財務／交易',topic:'finance_income',
      askedAt:'2026-08-30T12:00:00+08:00',timezone:'Asia/Taipei',
      casts:[9,7,8,7,9,8],
      calendar:{monthZhi:'酉',dayGan:'辛',dayZhi:'亥',source:'《增刪卜易》固定古例'}
    },
    expectedFacts:{
      primary:'兌',changed:'解',movingLines:[1,5],primaryUsefulZhi:'卯',
      primaryUsefulMonthBreak:true,primaryUsefulXunEmpty:true,changedUsefulZhi:'寅',
      provisionalDirection:'conditional'
    },
    classicalOutcome:'待寅木出空後見財；書載果於寅日得財。',
    limitation:'此例已知答案，只能校準規則與反例，不能計入盲測命中率。'
  },{
    id:'ZENGSHAN-11-SIBLING-RETURN-GENERATES',
    source:{work:'增刪卜易',chapter:'五行相生章第十一',url:'https://zh.wikisource.org/zh-hans/增刪卜易',lines:'650-660'},
    validationClass:'classics_rule_calibration_not_blind_accuracy',
    questionSummary:'卯月己卯日，弟占兄重罪能否得救',
    input:{
      question:'兄長所涉重罪能否出現救應？',category:'家庭／生活',topic:'family_peer',
      askedAt:'2026-08-30T12:00:00+08:00',timezone:'Asia/Taipei',
      casts:[7,8,8,6,8,8],
      calendar:{monthZhi:'卯',dayGan:'己',dayZhi:'卯',source:'《增刪卜易》固定古例'}
    },
    expectedFacts:{
      primary:'復',changed:'震',movingLines:[4],primaryUsefulZhi:'丑',
      primaryUsefulSeason:'死',changeEvent:'回頭生',provisionalDirection:'conditional'
    },
    classicalOutcome:'兄弟丑土雖受日月木克，動化午火回頭生，書載後蒙恩免死。',
    limitation:'此例已知答案，只能校準克處逢生規則，不能計入盲測命中率。'
  },{
    id:'ZENGSHAN-CAREER-RETURN-CONTROLS',
    source:{work:'增刪卜易',chapter:'動爻空破與功名例',url:'https://zh.wikisource.org/zh-hans/增刪卜易',lines:'2095-2102'},
    validationClass:'classics_rule_calibration_not_blind_accuracy',
    questionSummary:'卯月戊戌日占目前功名能否升遷',
    input:{
      question:'目前職位能否順利升遷？',category:'事業／工作',topic:'career_promotion',
      askedAt:'2026-08-30T12:00:00+08:00',timezone:'Asia/Taipei',
      casts:[7,8,9,7,8,9],
      calendar:{monthZhi:'卯',dayGan:'戊',dayZhi:'戌',source:'《增刪卜易》固定古例'}
    },
    expectedFacts:{primary:'離',changed:'震',movingLines:[3,6],primaryUsefulZhi:'亥',changeEvent:'回頭克',provisionalDirection:'blocked'},
    classicalOutcome:'官鬼亥水動化辰土回頭克，古例判不宜期待升遷。',
    limitation:'此例只校準官鬼回頭克的阻力規則；不採用古例對刑獄或災禍的必然預言。'
  }];
  const api={version:VERSION,cases:CASES};
  root.TianhengWenshiClassicsBenchmark=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
