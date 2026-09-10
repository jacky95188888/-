/* 天衡・支持系統 v2｜低門檻支持 + 轉換事件追蹤（不改命理引擎） */
(function(){'use strict';
if(!document.querySelector('link[rel="icon"]')){var icon=document.createElement('link');icon.rel='icon';icon.href='./tianheng-icon.svg';document.head.appendChild(icon);}
if(!document.querySelector('link[data-th-readability]')){var readability=document.createElement('link');readability.rel='stylesheet';readability.href='./tianheng-readability.css?v=20260910-quality2';readability.setAttribute('data-th-readability','1');document.head.appendChild(readability);}
if(document.querySelector('.th2-float'))return;
var ACCOUNT='093540015944';
var AMOUNTS=[39,69,99];
var EVENT_KEY='th_support_seen_v2';
var firebaseConfig={
  apiKey:'AIzaSyCxKCj8wnBYAfHIv93yug162RaWrPC3Pyk',
  authDomain:'jacky-1fdd1.firebaseapp.com',
  databaseURL:'https://jacky-1fdd1-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:'jacky-1fdd1',
  storageBucket:'jacky-1fdd1.firebasestorage.app',
  messagingSenderId:'520720595730',
  appId:'1:520720595730:web:867795fa5e58b08606d1cb'
};
var dbPromise=null;
function getDb(){
  if(dbPromise)return dbPromise;
  dbPromise=Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js')
  ]).then(function(m){
    var app=m[0].initializeApp(firebaseConfig,'th-support-v2');
    return {db:m[1].getDatabase(app),ref:m[1].ref,runTransaction:m[1].runTransaction};
  }).catch(function(){return null;});
  return dbPromise;
}
function day(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function track(name,amount){
  getDb().then(function(x){if(!x)return;var base='supportFunnel/'+day()+'/'+name;var writes=[x.runTransaction(x.ref(x.db,base),(n)=>(Number(n)||0)+1)];if(amount)writes.push(x.runTransaction(x.ref(x.db,'supportFunnel/'+day()+'/amount_'+amount),(n)=>(Number(n)||0)+1));return Promise.all(writes);}).catch(function(){/* 統計失敗不影響支持介面與解析。 */});
}
var css='.th2-float{position:fixed;right:14px;bottom:max(18px,env(safe-area-inset-bottom));z-index:9990;border:1px solid rgba(218,185,108,.72);border-radius:999px;background:rgba(24,16,29,.95);color:#f2d78d;padding:11px 16px;box-shadow:0 8px 30px rgba(0,0,0,.4);font:700 13px/1 system-ui;letter-spacing:.06em}.th2-card{max-width:760px;margin:24px auto;padding:25px 18px;text-align:center;border:1px solid rgba(218,185,108,.55);border-radius:20px;background:linear-gradient(145deg,rgba(35,23,40,.98),rgba(12,9,16,.98));color:#e9dfcd;box-shadow:0 14px 38px rgba(0,0,0,.32)}.th2-card h2{margin:0;color:#efd18a;font-size:21px;letter-spacing:.12em}.th2-card .lead{margin:10px auto 4px;color:#eee1c9;font-size:14px;line-height:1.85}.th2-card .story{margin:4px auto 14px;color:#bba98b;font-size:12px;line-height:1.8}.th2-amounts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.th2-amount{border:1px solid rgba(218,185,108,.38);border-radius:13px;padding:11px 7px;background:rgba(202,168,93,.07);color:#f1d487;font:700 14px system-ui;cursor:pointer}.th2-amount small{display:block;margin-top:3px;color:#a99b82;font-size:10px;font-weight:500}.th2-account{display:none;align-items:center;gap:9px;margin-top:13px;padding:12px;border:1px solid rgba(218,185,108,.35);border-radius:12px;background:rgba(0,0,0,.22)}.th2-account.show{display:flex}.th2-account strong{flex:1;text-align:left;color:#f5dda4;font:16px/1.25 ui-monospace,monospace}.th2-copy{padding:9px 11px;border:1px solid #caa85d;border-radius:9px;background:rgba(202,168,93,.1);color:#efd18a;font-size:12px}.th2-free{margin-top:12px;color:#817663;font-size:10px;line-height:1.7}.th2-selected{margin:0 0 8px;color:#d7bd7a;font-size:12px}@media(max-width:520px){.th2-card{margin:18px 0;padding:22px 13px}.th2-float{right:10px}.th2-amounts{gap:6px}.th2-account strong{font-size:14px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
function copy(btn){function ok(){btn.textContent='已複製';track('copy_account');setTimeout(function(){btn.textContent='複製帳號';},1600);}if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(ACCOUNT).then(ok).catch(function(){fallback(ok);});else fallback(ok);}
function fallback(done){var i=document.createElement('input');i.value=ACCOUNT;document.body.appendChild(i);i.select();try{document.execCommand('copy');done();}catch(e){}i.remove();}
function card(){
  var s=document.createElement('section');s.className='th2-card';s.setAttribute('data-th-support-v2','1');
  s.innerHTML='<h2>♡ 如果這次真的有幫到你</h2><p class="lead">天衡會繼續把基本工具免費留下來。</p><p class="story">如果這份解析讓你多看懂自己一點，可以用一杯飲料的方式支持後續維護、資料校正與新功能開發。</p><div class="th2-amounts"></div><div class="th2-selected"></div><div class="th2-account"><strong>中國信託 0935-4001-5944</strong><button class="th2-copy" type="button">複製帳號</button></div><p class="th2-free">完全自由支持；不支持也不影響任何免費功能與分析結果。</p>';
  var wrap=s.querySelector('.th2-amounts'),sel=s.querySelector('.th2-selected'),acc=s.querySelector('.th2-account');
  [['39','小小支持'],['69','請杯飲料'],['99','支持開發']].forEach(function(a){var b=document.createElement('button');b.className='th2-amount';b.type='button';b.innerHTML='NT$'+a[0]+'<small>'+a[1]+'</small>';b.onclick=function(){sel.textContent='你選擇 NT$'+a[0]+'，謝謝你的心意。';acc.classList.add('show');track('choose_amount',Number(a[0]));};wrap.appendChild(b);});
  s.querySelector('.th2-copy').onclick=function(){copy(this);};
  track('support_view');
  return s;
}
function existing(){return document.querySelector('[data-th-support-v2]');}
function reveal(){var old=existing();if(old){old.scrollIntoView({behavior:'smooth',block:'center'});track('float_click');return;}var result=document.getElementById('result'),c=card();if(result)result.insertAdjacentElement('afterend',c);else (document.querySelector('main')||document.body).appendChild(c);c.scrollIntoView({behavior:'smooth',block:'center'});track('float_click');}
var floating=document.createElement('button');floating.type='button';floating.className='th2-float';floating.textContent='♡ 支持天衡';floating.setAttribute('aria-label','支持天衡');floating.onclick=reveal;document.body.appendChild(floating);
var result=document.getElementById('result');if(result){var obs=new MutationObserver(function(){if(!result.textContent.trim()||existing())return;var c=card();result.insertAdjacentElement('afterend',c);try{if(!sessionStorage.getItem(EVENT_KEY)){sessionStorage.setItem(EVENT_KEY,'1');track('result_complete');}}catch(e){}});obs.observe(result,{childList:true,subtree:true,characterData:true});}
})();
