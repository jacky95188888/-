/* 天衡・八字進階人工解鎖 v2
 * 一碼一裝置：只把解鎖碼與隨機裝置識別送至天衡驗證 Worker。
 * 不傳姓名、生日、四柱或命盤結果；既有已解鎖裝置仍可沿用至原到期日。
 */
(function(){
  'use strict';
  var API='https://tianheng-bazi-access.rhtm9y855y.workers.dev';
  var STORAGE_KEY='tianheng_bazi_advanced_access_v1';
  var DEVICE_KEY='tianheng_bazi_device_v1';
  var attempts=0,blockedUntil=0;

  function normalize(v){return String(v||'').trim().toUpperCase().replace(/\s+/g,'');}
  function deviceId(){
    try{
      var saved=localStorage.getItem(DEVICE_KEY);
      if(saved)return saved;
      var bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
      var id=Array.from(bytes).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
      localStorage.setItem(DEVICE_KEY,id);return id;
    }catch(e){return 'browser-'+Math.random().toString(36).slice(2)+Date.now().toString(36);}
  }
  function access(){
    try{var data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return !!(data&&Number(data.expiresAt)>Date.now())}catch(e){return false}
  }
  function saveAccess(expiresAt){
    var fallback=Date.now()+30*86400000;
    var safeExpiry=Number(expiresAt)>Date.now()?Number(expiresAt):fallback;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({unlockedAt:Date.now(),expiresAt:safeExpiry,version:2,source:'worker'}))}catch(e){}
  }
  function reveal(zone){
    var gate=zone.querySelector('[data-bazi-access-gate]');
    var content=zone.querySelector('[data-bazi-advanced-content]');
    if(content){content.hidden=false;content.setAttribute('data-unlocked','1')}
    if(gate){
      gate.classList.add('is-unlocked');
      gate.innerHTML='<div class="bazi-access-success"><span>✓</span><div><b>八字進階分析已解鎖</b><small>本裝置可閱讀完整內容，至解鎖碼到期日為止。</small></div></div>';
    }
  }
  function lock(zone){var content=zone.querySelector('[data-bazi-advanced-content]');if(content)content.hidden=true;}
  function message(error){
    var map={
      invalid_code:'解鎖碼格式不正確，請核對英文字母與數字。',
      invalid_or_expired:'找不到此解鎖碼，或解鎖碼已到期。',
      expired:'此解鎖碼已到期，請透過 LINE 聯絡更新。',
      revoked:'此解鎖碼已停用，請透過 LINE 聯絡。',
      already_redeemed:'此解鎖碼已綁定另一台裝置，請使用原裝置或透過 LINE 聯絡。'
    };
    return map[error]||'目前無法完成驗證，請稍後重試。';
  }
  async function redeem(code){
    var response=await fetch(API+'/redeem',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({code:code,device:deviceId()})
    });
    var data=await response.json().catch(function(){return {ok:false,error:'bad_response'}});
    if(!response.ok||!data.ok)throw Object.assign(new Error(data.error||'request_failed'),{code:data.error||'request_failed'});
    return data;
  }
  function initZone(zone){
    if(zone.dataset.accessReady)return;
    zone.dataset.accessReady='1';
    if(access()){reveal(zone);return}
    lock(zone);
    var button=zone.querySelector('[data-bazi-unlock]');
    var input=zone.querySelector('[data-bazi-code]');
    var status=zone.querySelector('[data-bazi-status]');
    if(!button||!input)return;
    async function submit(){
      if(Date.now()<blockedUntil){status.textContent='嘗試次數過多，請稍後一分鐘再試。';return}
      var value=normalize(input.value);
      if(!value){status.textContent='請先輸入解鎖碼。';input.focus();return}
      if(!/^TH9-[A-Z2-9]{5}-[A-Z2-9]{5}$/.test(value)){status.textContent=message('invalid_code');input.select();return}
      button.disabled=true;button.textContent='安全驗證中…';status.textContent='';
      try{
        var data=await redeem(value);saveAccess(data.expiresAt);attempts=0;reveal(zone);zone.scrollIntoView({behavior:'smooth',block:'start'});return;
      }catch(e){
        attempts+=1;status.textContent=message(e.code);
        if(attempts>=5){blockedUntil=Date.now()+60000;attempts=0;status.textContent='連續輸入錯誤，已暫停一分鐘。'}
        input.select();
      }
      button.disabled=false;button.textContent='解 鎖 完 整 分 析';
    }
    button.addEventListener('click',submit);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit()}});
  }
  function scan(){document.querySelectorAll('[data-bazi-advanced-zone]').forEach(initZone)}
  function start(){scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.TianhengBaziAccessV1={version:'2.0.0',usesExternalApi:true,api:API,isUnlocked:access};
})();
