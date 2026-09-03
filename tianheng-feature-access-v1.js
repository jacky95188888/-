/* 天衡・進階功能解鎖 v1｜僅傳送解鎖碼、功能代號與隨機裝置識別 */
(function(){'use strict';
  var API='https://tianheng-bazi-access.rhtm9y855y.workers.dev';
  var DEVICE_KEY='tianheng_bazi_device_v1';
  var featureNames={wenshi:'六爻問事',meihua:'梅花易數'};
  function normalize(v){return String(v||'').trim().toUpperCase().replace(/\s+/g,'')}
  function storageKey(feature){return 'tianheng_feature_access_'+feature+'_v1'}
  function deviceId(){try{var saved=localStorage.getItem(DEVICE_KEY);if(saved)return saved;var bytes=new Uint8Array(16);crypto.getRandomValues(bytes);var id=Array.from(bytes).map(function(b){return b.toString(16).padStart(2,'0')}).join('');localStorage.setItem(DEVICE_KEY,id);return id}catch(e){return 'browser-'+Math.random().toString(36).slice(2)+Date.now().toString(36)}}
  function hasAccess(feature){try{var data=JSON.parse(localStorage.getItem(storageKey(feature))||'null');return !!(data&&Number(data.expiresAt)>Date.now())}catch(e){return false}}
  function save(feature,expiresAt){try{localStorage.setItem(storageKey(feature),JSON.stringify({feature:feature,expiresAt:Number(expiresAt),unlockedAt:Date.now(),source:'worker'}))}catch(e){}}
  function message(code){return {invalid_code:'解鎖碼格式不正確。',invalid_or_expired:'找不到解鎖碼，或解鎖碼已到期。',expired:'解鎖碼已到期，請聯絡三寶爸。',revoked:'此解鎖碼已停用。',already_redeemed:'此碼已綁定另一台裝置。',wrong_feature:'這組碼不是用來開通此功能。'}[code]||'目前無法完成驗證，請稍後重試。'}
  async function redeem(feature,code){var response=await fetch(API+'/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code,feature:feature,device:deviceId()})});var data=await response.json().catch(function(){return {ok:false,error:'bad_response'}});if(!response.ok||!data.ok)throw Object.assign(new Error(data.error||'request_failed'),{code:data.error||'request_failed'});return data}
  function unlock(zone,target,feature){target.disabled=false;zone.classList.add('is-unlocked');zone.innerHTML='<div class="feature-access-ok"><b>✓ '+featureNames[feature]+'已開通</b><small>本裝置可使用至解鎖碼到期日。</small></div>'}
  function init(zone){if(zone.dataset.ready)return;zone.dataset.ready='1';var feature=zone.dataset.thAccessFeature;var target=document.querySelector(zone.dataset.thAccessTarget);var input=zone.querySelector('[data-th-access-code]');var submit=zone.querySelector('[data-th-access-submit]');var status=zone.querySelector('[data-th-access-status]');if(!featureNames[feature]||!target||!input||!submit)return;if(hasAccess(feature)){unlock(zone,target,feature);return}target.disabled=true;submit.onclick=async function(){var code=normalize(input.value);if(!/^TH9-[A-Z2-9]{5}-[A-Z2-9]{5}$/.test(code)){status.textContent=message('invalid_code');input.select();return}submit.disabled=true;submit.textContent='驗證中…';status.textContent='';try{var data=await redeem(feature,code);save(feature,data.expiresAt);unlock(zone,target,feature)}catch(e){status.textContent=message(e.code);submit.disabled=false;submit.textContent='驗 證 開 通 碼';input.select()}}}
  function start(){document.querySelectorAll('[data-th-access-feature]').forEach(init)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.TianhengFeatureAccessV1={version:'1.0.0',usesExternalApi:true,api:API,isUnlocked:hasAccess};
})();
