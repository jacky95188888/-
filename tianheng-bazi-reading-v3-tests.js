'use strict';
const assert=require('node:assert/strict');
require('./tianheng-bazi-reading-v3.js');

const api=global.TianhengBaziReadingV3;
assert.ok(api,'個人化解盤 API 未匯出');

const sample={
  details:[
    {label:'年柱',gan:'癸',ganElement:'水',zhi:'丑',hidden:[{gan:'己',weight:0.6},{gan:'癸',weight:0.3},{gan:'辛',weight:0.1}]},
    {label:'月柱',gan:'乙',ganElement:'木',zhi:'丑',hidden:[{gan:'己',weight:0.6},{gan:'癸',weight:0.3},{gan:'辛',weight:0.1}]},
    {label:'日柱',gan:'辛',ganElement:'金',zhi:'酉',hidden:[{gan:'辛',weight:1}]},
    {label:'時柱',gan:'庚',ganElement:'金',zhi:'寅',hidden:[{gan:'甲',weight:0.6},{gan:'丙',weight:0.3},{gan:'戊',weight:0.1}]}
  ],
  strength:{counts:{木:1.6,火:0.3,土:1.3,金:2.2,水:1.6}}
};

assert.deepEqual(api.source(sample,'火'),['時柱寅藏 丙（0.3）'],'火 0.3 應追溯到寅中餘氣丙火');
assert.equal(api.rank(sample)[0][0],'火','最低五行排序錯誤');
assert.equal(api.ACTION.火.length,3,'火的生活化調整不足');
for(const god of ['比肩','劫財','食神','傷官','偏財','正財','七殺','正官','偏印','正印'])assert.ok(api.GOD[god],`缺少 ${god} 解讀`);
console.log('PASS 五行來源、最低值、補法與十神個人化解讀');
