/* Tianheng production loader: LINE + four free/open books. */
(function(){'use strict';
var stamp='20260827b';
var scripts=['./tianheng-v9-line.js?v='+stamp,'./tianheng-v10-gates.js?v='+stamp];
function load(i){if(i>=scripts.length){document.documentElement.setAttribute('data-th-live','ready');return;}var s=document.createElement('script');s.src=scripts[i];s.async=false;s.onload=function(){load(i+1)};s.onerror=function(){console.error('[天衡] 載入失敗:',scripts[i]);load(i+1)};(document.head||document.documentElement).appendChild(s)}
load(0);
})();