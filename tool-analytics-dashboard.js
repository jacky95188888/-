const tools={'fraud-lab':'反詐實驗室','sales-team':'AI 顧問團','n7k2-jl9x':'筠玲易數','dream-library':'夢境圖書館','expert-council':'專家決策團','tool':'作品推廣工具'};
const q=new URLSearchParams(location.search),tool=q.get('tool')||'sales-team';
const el=id=>document.getElementById(id),status=el('status'),results=el('results'),button=el('refresh');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const day=(i=0)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+i*864e5));
const num=n=>Math.max(0,Number(n)||0),fmt=n=>num(n).toLocaleString('zh-TW');
el('chooser').innerHTML='<a href="./admin.html#tianheng-stats">天衡</a>'+Object.entries(tools).map(([key,name])=>`<a href="?tool=${key}" ${key===tool?'aria-current="page"':''}>${name}</a>`).join('');
async function load(){
  if(!tools[tool]){status.textContent='找不到這個工具，請從上方選擇。';results.setAttribute('aria-busy','false');button.disabled=true;return;}
  el('title').textContent=tools[tool]+'・瀏覽統計';document.title=tools[tool]+'・瀏覽統計';
  button.disabled=true;results.setAttribute('aria-busy','true');status.textContent='正在讀取統計…';
  try{
    const r=await fetch('https://sales-team.rhtm9y855y.workers.dev/tool-analytics/stats?tool='+encodeURIComponent(tool),{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json();if(d.ok!==true||!d.daily||typeof d.total!=='number')throw new Error('資料格式尚未就緒');
    const daily=d.daily;let week=0;for(let i=0;i<7;i++)week+=num(daily[day(-i)]);
    const days=Array.from({length:14},(_,i)=>({day:day(i-13),n:num(daily[day(i-13)])})),max=Math.max(1,...days.map(v=>v.n));
    const bars=days.map(v=>`<div class="bar-col"><div class="bar" style="height:${Math.max(v.n?3:0,Math.round(v.n/max*155))}px" aria-label="${v.day}：${v.n} 次"><span class="v">${v.n}</span></div><div class="bar-label">${v.day.slice(5)}</div></div>`).join('');
    const pages=Object.entries(d.pages||{}).sort((a,b)=>num(b[1])-num(a[1])).slice(0,20);
    results.innerHTML=`<div class="summary"><div class="metric"><div class="label">今天瀏覽</div><div class="num">${fmt(daily[day()])}</div></div><div class="metric"><div class="label">近 7 天</div><div class="num">${fmt(week)}</div></div><div class="metric"><div class="label">啟用後累積</div><div class="num">${fmt(d.total)}</div></div></div><p class="sub">${d.startedAt?'首次記錄：'+esc(d.startedAt):'尚未收到瀏覽紀錄；請開啟正式網站後稍候重新整理。'}</p><section class="box"><h2>近 14 天每日瀏覽</h2><p class="sub">手機可左右滑動查看完整日期。</p><div class="bars-scroll" tabindex="0" aria-label="每日瀏覽圖表，可左右滑動"><div class="bars">${bars}</div></div><details><summary>每日數字</summary>${days.map(v=>`<div class="frow"><b>${v.day}</b><span>${fmt(v.n)}</span></div>`).join('')}</details></section><section class="box"><h2>近 14 天頁面排行</h2>${pages.length?pages.map(([p,n])=>`<div class="frow"><b>${esc(p)}</b><span>${fmt(n)} 次</span></div>`).join(''):'<p class="state">尚無瀏覽紀錄。</p>'}</section>${tool==='fraud-lab'?'<p class="sub"><a class="home" href="https://jacky95188888.github.io/fraud-lab/admin.html#analytics">查看反詐原有統計與事件紀錄</a></p>':''}`;
    status.textContent='更新於 '+new Date().toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
  }catch(e){status.textContent='統計暫時無法讀取';results.innerHTML='<div class="box"><p class="state">統計服務尚未接通或暫時無法連線，請稍後重新整理。這不表示瀏覽數為零。</p><p class="sub">連線狀態：'+esc(e.message)+'</p></div>';}
  finally{results.setAttribute('aria-busy','false');button.disabled=false;}
}
button.addEventListener('click',load);load();
