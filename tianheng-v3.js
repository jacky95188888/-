/* 天衡入口載入器：鎖定版本，避免 raw/main 快取造成前後版本混用 */
(function(){'use strict';
  var V4='https://raw.githubusercontent.com/jacky95188888/-/23fe02e655fc6c6b33f75b283e5e0d0cda5f57fb/tianheng-v3.js';
  var V5='https://raw.githubusercontent.com/jacky95188888/-/5083c3f931cfdaa8b1ebe98ab2751b0cf2976596/tianheng-v5.js';
  var V6='https://raw.githubusercontent.com/jacky95188888/-/630018505be94199c15f0313f83ecf7462217805/tianheng-v6.js';
  var V7='https://raw.githubusercontent.com/jacky95188888/-/3b7c6f52de793a1de225ac7ca4ee2d6638f1c62b/tianheng-v7.js';
  var V8='https://raw.githubusercontent.com/jacky95188888/-/83e9ba1a669877536a529ccc09ed5fa3ccf5cd29/tianheng-v8.js';
  var V9='https://raw.githubusercontent.com/jacky95188888/-/90c440619113c3bf00aab74b8b6463f7673b2271/tianheng-v9-line.js';
  var V10='https://raw.githubusercontent.com/jacky95188888/-/52d5e271487b64ccc4c85d16ab2018fa22c3a438/tianheng-v10-gates.js';
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=done||function(){};
    s.onerror=function(){console.error('[天衡] 載入失敗：',src);(done||function(){})();};
    document.head.appendChild(s);
  }
  load(V4,function(){load(V5,function(){load(V6,function(){load(V7,function(){load(V8,function(){load(V9,function(){load(V10);});});});});});});
})();
