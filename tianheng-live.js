/* Tianheng live stable loader: production LINE + four coming-soon gates only. Payment intentionally disabled until ECPay/Cloudflare verification is live. */
(function(){'use strict';
var scripts=['./tianheng-v9-line.js?v=20260827a','./tianheng-v10-gates.js?v=20260827a'];
function load(i){if(i>=scripts.length){document.documentElement.setAttribute('data-th-live','ready');return;}var s=document.createElement('script');s.src=scripts[i];s.async=false;s.onload=function(){load(i+1)};s.onerror=function(){console.error('[天衡] 載入失敗:',scripts[i]);load(i+1)};(document.head||document.documentElement).appendChild(s)}
load(0);
})();
