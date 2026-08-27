/* 天衡 V8：整站視覺統一 + Mobile QA + 重複/溢出防護 */
(function(){'use strict';
function addStyle(){if(document.getElementById('th-v8-style'))return;var s=document.createElement('style');s.id='th-v8-style';s.textContent='\
:root{--th-gold:#d8b768;--th-gold2:#f0d894;--th-ink:#090a10;--th-panel:#17121e;--th-text:#e7dcc8;--th-muted:#9b907f;--th-green:#87ad92;--th-red:#c98478;}\
#th-v4-report,#th-v5-cross,#th-v6-timeline,#th-v7-today{width:min(100%,960px)!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important;}\
#th-v4-report *,#th-v5-cross *,#th-v6-timeline *,#th-v7-today *{box-sizing:border-box;min-width:0;}\
#th-v4-report img,#th-v5-cross img,#th-v6-timeline img,#th-v7-today img{max-width:100%;height:auto;}\
.th4-card,.th5-cross,.th6-wrap,.th7-card{border-color:rgba(216,183,104,.46)!important;background:radial-gradient(circle at 90% 0%,rgba(216,183,104,.08),transparent 28%),linear-gradient(148deg,rgba(27,20,34,.97),rgba(7,8,14,.99))!important;box-shadow:0 16px 40px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.025)!important;}\
.th4-title,.th5-cross-title,.th6-title,.th7-title{color:#f0e3c9!important;font-weight:500!important;text-shadow:0 0 22px rgba(214,174,91,.08);}\
.th4-kicker,.th5-cross-k,.th6-k,.th7-k{color:var(--th-gold)!important;font-weight:500!important;}\
.th4-section p,.th5-insight p,.th6-detail p,.th7-action p{color:var(--th-text)!important;}\
.th4-note,.th5-method,.th6-note,.th7-note{color:#8f8577!important;}\
.th4-card,.th5-cross,.th6-wrap,.th7-card,.th5-dim{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}\
.th5-dim{margin-bottom:10px!important;}\
.th5-dim:hover,.th6-month:hover{transform:translateY(-1px);}\
.th6-month,.th5-dim{transition:transform .18s ease,border-color .18s ease,background .18s ease;}\
.th6-month:focus-visible,.th5-dim:focus-visible{outline:2px solid rgba(240,216,148,.65);outline-offset:2px;}\
.th7-strategy{border-color:rgba(216,183,104,.28)!important;background:linear-gradient(135deg,rgba(216,183,104,.07),rgba(128,87,143,.045))!important;}\
@media(max-width:700px){\
  #th-v4-report,#th-v5-cross,#th-v6-timeline,#th-v7-today{width:100%!important;margin-top:18px!important;margin-bottom:18px!important;padding-left:0!important;padding-right:0!important;}\
  .th4-card,.th5-cross,.th6-wrap,.th7-card{border-radius:18px!important;padding-left:15px!important;padding-right:15px!important;}\
  .th4-grid{gap:12px!important}.th4-title,.th5-cross-title,.th6-title,.th7-title{font-size:20px!important;line-height:1.35!important;letter-spacing:.08em!important;}\
  .th4-kicker,.th5-cross-k,.th6-k,.th7-k{font-size:11px!important;letter-spacing:.2em!important;}\
  .th4-section p,.th5-insight p,.th6-detail p,.th7-action p,.th7-strategy{font-size:14px!important;line-height:1.82!important;}\
  .th7-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;}\
  .th7-mini{padding:10px 4px!important}.th7-mini b{font-size:19px!important;}\
  .th6-months{grid-template-columns:repeat(2,minmax(0,1fr))!important;}\
  .th6-row{grid-template-columns:34px minmax(0,1fr) 28px!important;gap:5px!important;}\
  .th5-cross-grid{grid-template-columns:1fr!important;}\
}\
@media(max-width:430px){\
  body{overflow-x:hidden;}\
  #th-v4-report,#th-v5-cross,#th-v6-timeline,#th-v7-today{max-width:100vw!important;}\
  .th4-head{align-items:flex-start!important}.th4-score b{font-size:31px!important;}\
  .th4-timegrid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important}.th4-time{padding:9px 2px!important;}\
  .th6-months{gap:7px!important}.th6-month{padding:11px 9px!important;border-radius:14px!important;}\
  .th7-bottom,.th7-actions{gap:8px!important;}\
}\
@media(prefers-reduced-motion:reduce){.th5-dim,.th6-month{transition:none!important}.th5-dim:hover,.th6-month:hover{transform:none!important;}}';document.head.appendChild(s)}
function dedupe(id){var all=document.querySelectorAll('#'+id);for(var i=1;i<all.length;i++)all[i].remove()}
function repair(){['th-v4-report','th-v5-cross','th-v6-timeline','th-v7-today'].forEach(dedupe);var cards=document.querySelectorAll('.th6-month');for(var i=0;i<cards.length;i++){if(!cards[i].hasAttribute('role'))cards[i].setAttribute('role','button');if(!cards[i].hasAttribute('aria-expanded'))cards[i].setAttribute('aria-expanded',cards[i].classList.contains('is-open')?'true':'false');if(!cards[i].dataset.th8aria){cards[i].dataset.th8aria='1';cards[i].addEventListener('click',function(){this.setAttribute('aria-expanded',this.classList.contains('is-open')?'true':'false')});}}
var dims=document.querySelectorAll('.th5-dim');for(var j=0;j<dims.length;j++){if(!dims[j].hasAttribute('tabindex')&&(dims[j].tagName==='DIV'||dims[j].tagName==='SECTION'||dims[j].tagName==='ARTICLE'))dims[j].setAttribute('tabindex','0');}
}
function run(){try{addStyle();repair()}catch(e){}}
var tm;function schedule(){clearTimeout(tm);tm=setTimeout(run,180)}
if(document.body){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()}else document.addEventListener('DOMContentLoaded',function(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()})
})();