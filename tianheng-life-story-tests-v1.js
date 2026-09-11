'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
require('./tianheng-bazi-chart-v1.js');
require('./tianheng-bazi-advanced-v1.js');
require('./tianheng-bazi-combinations-v1.js');
require('./tianheng-bazi-geju-tiaohou-v1.js');
require('./tianheng-bazi-quality-v1.js');
require('./tianheng-bazi-engine-v1.js');
require('./tianheng-life-story-v1.js');

const api=global.TianhengLifeStoryV1;
const base={year:1974,month:1,day:29,hour:4,minute:0,sex:'男',ziSchool:'late'};
const work=api.analyze(base,'work',2026);
const love=api.analyze(base,'relationship',2026);
const other=api.analyze({year:1988,month:6,day:9,hour:15,minute:30,sex:'女',ziSchool:'late'},'work',2026);

assert.equal(work.r.pillars.length,4,'必須保存完整四柱');
assert.equal(work.story.chapters.length,4,'故事版必須有四個核心章節');
assert.equal(work.story.questions.length,3,'必須提供三個現實核對問題');
assert.ok(work.story.current.text.includes('大運'),'當前引動必須引用大運');
assert.ok(work.story.evidence.some(x=>x.startsWith('四柱：')),'必須列出四柱依據');
assert.notDeepEqual(work.story.questions,love.story.questions,'不同生活問題不得共用核對題');
assert.notEqual(work.story.lead,other.story.lead,'不同命盤不得共用同一核心故事');
assert.ok(!JSON.stringify(work.story).includes('你前世一定'),'不得把象徵敘事冒充事實');
assert.ok(work.story.avoid.text.includes('對不上'),'必須允許使用者否定不符合的故事');

const html=fs.readFileSync('tianheng-life-story-v1.html','utf8');
const home=fs.readFileSync('index.html','utf8');
for(const id of ['name','issue','birth','time','sex','zi','opening','pillars','chapters','practice','evidence'])assert.ok(html.includes(`id="${id}"`),`頁面缺少 ${id}`);
assert.ok(html.includes('不是前世身分鑑定')&&html.includes('象徵性故事'),'必須在第一屏標明定位');
assert.ok(home.includes('前世今生・生命課題書')&&home.includes('tianheng-life-story-v1.html'),'首頁第九功能未接入');
console.log('PASS 前世今生依命盤生成、依問題改寫、提供證據且不冒充事實');
