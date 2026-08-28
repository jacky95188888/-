/* 天衡 V12：紫微斗數十二宮正式入口 */
(function(){
  'use strict';
  if(document.getElementById('th-ziwei-entry')) return;
  var style=document.createElement('style');
  style.id='th-ziwei-entry-style';
  style.textContent='\
    #th-ziwei-entry{display:flex;align-items:center;justify-content:center;gap:12px;width:min(100%,420px);margin:13px auto 0;padding:13px 16px;border:1px solid rgba(217,182,106,.65);border-radius:14px;background:linear-gradient(135deg,rgba(91,46,111,.82),rgba(31,19,45,.94));color:#f5ead0;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 0 22px rgba(217,182,106,.06);transition:transform .2s,border-color .2s}\
    #th-ziwei-entry:active{transform:scale(.985)}\
    #th-ziwei-entry .thz-mark{width:39px;height:39px;display:grid;place-items:center;flex:none;border:1px solid #d9b66a;border-radius:50%;color:#efd58e;font-size:18px;box-shadow:0 0 18px rgba(217,182,106,.18)}\
    #th-ziwei-entry .thz-copy{text-align:left;line-height:1.35}\
    #th-ziwei-entry b{display:block;color:#f7e5b5;font-size:15px;letter-spacing:.12em}\
    #th-ziwei-entry small{color:#c9b998;font-size:11px;letter-spacing:.06em}\
    #th-ziwei-entry .thz-go{margin-left:auto;color:#d9b66a;font-size:20px}\
    @media(max-width:420px){#th-ziwei-entry{width:calc(100% - 12px);padding:12px}#th-ziwei-entry b{font-size:14px}}';
  document.head.appendChild(style);
  var link=document.createElement('a');
  link.id='th-ziwei-entry';
  link.href='./ziwei.html';
  link.setAttribute('aria-label','進入紫微斗數十二宮命盤');
  link.innerHTML='<span class="thz-mark">紫</span><span class="thz-copy"><b>紫微斗數十二宮命盤</b><small>完整排盤・逐宮講解・感情事業財運</small></span><span class="thz-go">›</span>';
  var hero=document.querySelector('.hero');
  var daily=hero&&hero.querySelector('.daily-entry');
  if(daily) daily.insertAdjacentElement('afterend',link);
  else if(hero) hero.appendChild(link);
  else document.body.insertBefore(link,document.body.firstChild);
})();
