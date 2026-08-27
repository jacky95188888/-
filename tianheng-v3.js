/* 天衡入口載入器：V4 個人命書 + V5 九維交叉升級 */
(function(){'use strict';
  var V4='https://raw.githubusercontent.com/jacky95188888/-/23fe02e655fc6c6b33f75b283e5e0d0cda5f57fb/tianheng-v3.js';
  var V5='https://raw.githubusercontent.com/jacky95188888/-/main/tianheng-v5.js';
  function load(src,done){var s=document.createElement('script');s.src=src;s.onload=done||function(){};s.onerror=done||function(){};document.head.appendChild(s)}
  load(V4,function(){load(V5);});
})();