/* 天衡・八字進階人工解鎖 v1
 * 純前端雜湊核對：網站不保存可讀密碼、不呼叫外部 API。
 * 解鎖有效期 30 天，僅保存於目前瀏覽器。
 */
(function(){
  'use strict';
  var STORAGE_KEY='tianheng_bazi_advanced_access_v1';
  var VALID_DAYS=30;
  var CODE_HASHES=[
    '0309217773a34b7763f07d6f2603e07e017f11182fdd750c0e6801c08518c0e0','03016c725a37d14e62c91ca81f7d4c2ef8f4fa547f0d8b6b6c1bac0d73b1eb4c','a1112cf9fe8e358c7fb70572e5d8daa785b0d991b002dd96e169d650b69f9158','6f2f785ced14337f358267a8ceeb8ce1779c153ba6868f3f36de63181cfde447','37fc4a59c0d2732c7dabb933efbb0f4d00119155c79484635254f12e5ccd8ec9','275d3d34789a06c49f9d6d14e383f3654ba35b3ae617d847ff4a40f58c60a1ef','03b27d7bd54a1262ba74a8a506e337c9d6ea4759f929ef2bd292cbd867472315','c17ee8c2af8cf6ed713d86a6bd507bb8ba8777fae874d58a69d83f7da49b18c1','23ebb7fa035e0087a41df2ecb710d7a92c300157781f23804adf13e5ed9600ab','fdc00035927946c80f2ab2d891ad75592a5c6def3f0e8d3e14247ae42ae1896e',
    '2042f9489a1162313655fb9c4ec744975a5d515a0e6e9e212af7ad431113e9ef','45c96a67f8f781acab7262db44e561b57c67129720a2da4543967d0b6d1030b6','d1f1bb01ad1e1865bf64a891a92a30a14e6172f238767159b4f744be1958c0c0','3704d65dfb447af8f0a9c2f67d1bd62c06a0a03b9175b0f4c4ca01d5711c6109','a428296908e29817ea675842218d6c9de30d5b97977d07cd13ff2b95f1cb3f2d','6f2201ccee0bb22685eef32f919e759cc050c0e2e4bb435f7b03fe70c2ee3d1a','fd0452d9f98173513495ecca8d4823ef0e3a6a5c95b432417128a999fd3c1449','ce7c85a8b186c4e7eaf32d92e932e9e14d173b05cf446c7d496f3a5e94aadfbb','8391a4bd667dcf5f38c0bda27138ddd27eb7d810dfb4cbcbbe35ebade7f0af16','9e294e50755a14341c29d8962ca91da3d408a464d26edd93a696418e32f0cfc9',
    '0a02ba6848fe40e775c1ea8af3e5a1c6dab8b022992010c79450cb753d72e0f7','d9e3016d9d5761a976b13eececc3c21e26e07958b9d21f23635d5d9d16a0f3dc','3255ce68be855c239513da0eced5c5797680d96c08154c9dc29456410110457a','4f5d79def5b814a4ab7173a6d716c8cb8259c94235a36c35463c736704b1da18','1a9636d2ad2069fb669bbdd0e94faed57cf78177f7492e60ea1f5a6af5fee5f3','a77c59ab02a271de96285bdad9e23b69dbf358ac3c6829bbce0467d3f9b8cec7','497cebcb77a36d7711f444466b979afd71ff673c78dac5a905a242528947a0c0','a5a89a77dad940cc1661e576ad65ffd46547644d56c5b1939c4696506385ca0c','19aed09a833651b197acdc6896187344733c1c184db22a8e3a11d47820e0dec3','548a9e54d0256a6e7bda76266e47a2663c51b837ec31ef9b797d9888fddae6dc'
  ];
  var attempts=0,blockedUntil=0;

  function normalize(v){return String(v||'').trim().toUpperCase().replace(/\s+/g,'');}
  async function hash(v){
    var bytes=new TextEncoder().encode(normalize(v));
    var digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
  }
  function access(){
    try{var data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return !!(data&&Number(data.expiresAt)>Date.now())}catch(e){return false}
  }
  function saveAccess(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({unlockedAt:Date.now(),expiresAt:Date.now()+VALID_DAYS*86400000,version:1}))}catch(e){}
  }
  function reveal(zone){
    var gate=zone.querySelector('[data-bazi-access-gate]');
    var content=zone.querySelector('[data-bazi-advanced-content]');
    if(content){content.hidden=false;content.setAttribute('data-unlocked','1')}
    if(gate){
      gate.classList.add('is-unlocked');
      gate.innerHTML='<div class="bazi-access-success"><span>✓</span><div><b>八字進階分析已解鎖</b><small>本裝置可閱讀完整內容，有效期 30 天。</small></div></div>';
    }
  }
  function lock(zone){
    var content=zone.querySelector('[data-bazi-advanced-content]');
    if(content)content.hidden=true;
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
      button.disabled=true;button.textContent='核對中…';
      try{
        var ok=CODE_HASHES.indexOf(await hash(value))>=0;
        if(ok){saveAccess();attempts=0;reveal(zone);zone.scrollIntoView({behavior:'smooth',block:'start'});return}
        attempts+=1;status.textContent='解鎖碼不正確，請核對英文字母與數字。';input.select();
        if(attempts>=5){blockedUntil=Date.now()+60000;attempts=0;status.textContent='連續輸入錯誤，已暫停一分鐘。'}
      }catch(e){status.textContent='目前瀏覽器無法核對，請改用 Safari 或 Chrome。'}
      button.disabled=false;button.textContent='解 鎖 完 整 分 析';
    }
    button.addEventListener('click',submit);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit()}});
  }
  function scan(){document.querySelectorAll('[data-bazi-advanced-zone]').forEach(initZone)}
  function start(){scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.TianhengBaziAccessV1={version:'1.0.0',usesExternalApi:false,validDays:VALID_DAYS,isUnlocked:access};
})();
