const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("index.html", "utf8");
const baziEngine = fs.readFileSync("tianheng-bazi-engine-v1.js", "utf8");
let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("正式首頁仍是完整大型首頁", () => {
  assert.ok(html.length > 100000, "index.html 疑似被局部頁面覆蓋");
  assert.ok(html.includes('id="form"'));
  assert.ok(html.includes('id="result"'));
  assert.ok(html.includes('id="go"'));
});

test("首頁保留今日運勢與雙人合度入口", () => {
  assert.ok(html.includes('id="dailyEntry"'));
  assert.ok(html.includes('href="compat.html"'));
});

test("首頁提供六爻問事入口", () => {
  const target = './tianheng-wenshi-qa-v1.html?v=20260831-wenshi-main';
  assert.ok(html.split(target).length - 1 >= 2, "頂部入口與更新公告均應連到獨立問事頁");
  assert.ok(html.includes("六爻問事開放驗證"));
});

test("問事仍採獨立頁延遲進入", () => {
  assert.ok(!/<script[^>]+src=["'][^"']*tianheng-wenshi-/i.test(html), "首頁不應直接載入問事引擎");
});

test("首頁明示 QA 階段且不宣稱準確率", () => {
  assert.ok(html.includes("目前開放 QA，不宣稱未驗證的準確率"));
});

test("舊命理與八字進階接入仍保留", () => {
  assert.ok(html.includes("tianheng-bazi-engine-v1.js"));
  assert.ok(html.includes("tianheng-ziping-engine-v2.js"));
  assert.ok(/legacyOverride\s*:\s*false/.test(baziEngine));
});

console.log(`\nRESULT ${passed}/${passed} passed`);
