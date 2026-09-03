const fs=require('fs');
const assert=require('assert');
const pages=['index.html','compat.html','ziwei.html','tianheng-wenshi-qa-v1.html','tianheng-meihua-qa-v1.html'];
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name,'-',e.message);process.exitCode=1}}
test('SVG 品牌圖示存在',()=>assert(fs.existsSync('tianheng-icon.svg')));
test('192 PNG 存在',()=>assert(fs.existsSync('icon-192.png')));
test('512 PNG 存在',()=>assert(fs.existsSync('icon-512.png')));
test('Apple 圖示存在',()=>assert(fs.existsSync('apple-touch-icon.png')));
test('manifest 指向 192 與 512 圖示',()=>{const m=JSON.parse(fs.readFileSync('manifest.json'));assert(m.icons.some(x=>x.sizes==='192x192'));assert(m.icons.some(x=>x.sizes==='512x512'))});
pages.forEach(page=>test(page+' 載入天衡圖示',()=>assert(fs.readFileSync(page,'utf8').includes('tianheng-icon.svg'))));
['tianheng-name-v1.html','tianheng-rename-v1.html'].forEach(page=>test(page+' 由全站元件補入圖示',()=>{assert(fs.readFileSync(page,'utf8').includes('tianheng-support-v1.js'));assert(fs.readFileSync('tianheng-support-v1.js','utf8').includes('tianheng-icon.svg'))}));
test('SVG 使用天秤與星環且不依賴中文字型',()=>{const s=fs.readFileSync('tianheng-icon.svg','utf8');assert(s.includes('ellipse'));assert(s.includes('M186 205h140'));assert(!s.includes('<text'))});
if(!process.exitCode)console.log(`\n${passed}/${passed} passed`);
