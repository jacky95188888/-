/* 天衡 V4 介面增強層：保留既有 V3 演算法，再加入感情／事業／30・90 日趨勢卡 */
(function(){
  'use strict';

  var LEGACY='https://raw.githubusercontent.com/jacky95188888/-/a8cff9494fd0b330a48f683dbe319423c9a0f376/tianheng-v3.js';

  function loadLegacy(done){
    if(window.__TH_LEGACY_LOADED){ done(); return; }
    window.__TH_LEGACY_LOADED=true;
    var s=document.createElement('script');
    s.src=LEGACY;
    s.onload=done;
    s.onerror=done;
    document.head.appendChild(s);
  }

  function txt(){ return (document.body && document.body.innerText) || ''; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function pickScore(label, fallback){
    var t=txt();
    var re=new RegExp(label+'[^0-9]{0,18}(\\d{2,3})');
    var m=t.match(re);
    return m?clamp(parseInt(m[1],10),35,96):fallback;
  }
  function overall(){
    var m=txt().match(/(\d{2,3})[\s\n]*命\s*運\s*綜\s*評/);
    return m?clamp(parseInt(m[1],10),35,96):72;
  }
  function weakElem(){
    var m=txt().match(/喜用神宜補([木火土金水])/);
    return m?m[1]:'木';
  }
  function zodiac(){
    var m=txt().match(/屬\s*([鼠牛虎兔龍蛇馬羊猴雞狗豬])/);
    return m?m[1]:'';
  }
  function star(){
    var m=txt().match(/(白羊|牡羊|金牛|雙子|巨蟹|獅子|處女|天秤|天蠍|射手|魔羯|摩羯|水瓶|雙魚)座/);
    return m?m[1]:'';
  }
  function tone(score){ return score>=80?'旺':score>=68?'漸旺':score>=56?'平穩':'蓄勢'; }
  function trend(score,days){
    var seed=(new Date().getMonth()+1)*7 + new Date().getDate() + days + score;
    var d=((seed%13)-6);
    return clamp(score + d,42,95);
  }

  function relationshipCopy(score){
    if(score>=80) return {
      single:'緣分活躍，容易在朋友引介、工作往來或共同興趣中出現值得留意的人。主動回應，比被動等待更容易把好感變成機會。',
      paired:'關係正處於可升溫的區段，適合安排共同計畫、旅行或談清楚下一步。少用猜測，多說真正需求，感情會更穩。',
      risk:'桃花旺時也容易分心；不要用短暫的新鮮感衡量長期關係。'
    };
    if(score>=66) return {
      single:'桃花不是爆發型，而是「越聊越有感」的慢熱走勢。熟人圈、合作場合與固定活動，比陌生社交更容易出現正緣。',
      paired:'近期適合修復生活中的小摩擦。把時間留給真正的相處，而不是只處理事情，關係會慢慢回暖。',
      risk:'最需要避免的是悶著不說，讓小誤會累積成距離。'
    };
    return {
      single:'目前更適合先整理自己的情緒與擇偶標準，不必為了「有對象」而加快節奏。穩定自己後，反而比較容易遇到適合的人。',
      paired:'關係需要耐心經營，暫時不要用一次爭執判斷未來。先處理溝通方式，再處理對錯。',
      risk:'情緒低潮時容易把對方的沉默解讀成拒絕，重要決定宜多觀察幾天。'
    };
  }

  function careerCopy(score){
    if(score>=80) return {
      now:'事業推進力強，適合主動談合作、爭取資源、推出新方案或把已準備好的計畫正式上線。',
      money:'財運重點在「靠能力擴大收入」，比追逐短線機會更有利。已有客戶、專業與人脈是最值得放大的資產。',
      risk:'旺運期最怕一次開太多戰線；先把最有把握的一件事做成，再擴張。'
    };
    if(score>=66) return {
      now:'事業屬穩中轉強，適合整理流程、重新談條件、接觸舊客戶與布局下一波機會。',
      money:'收入宜以穩定現金流為核心，先提高轉換率與回購，再考慮高風險投入。',
      risk:'不要因一兩次卡關就全面改方向；目前更需要微調，而不是推翻。'
    };
    return {
      now:'目前偏向整理期，適合補能力、清理低效工作與重整資源。重大轉職或重押投資，宜先做小規模驗證。',
      money:'守住現金流比追高報酬重要；先降低不必要支出與固定成本，再等待較清楚的機會。',
      risk:'壓力大時容易做出「想立刻翻盤」的決定，越急越要先算成本。'
    };
  }

  function injectStyle(){
    if(document.getElementById('th-v4-style')) return;
    var st=document.createElement('style');
    st.id='th-v4-style';
    st.textContent='\
      #th-v4-report{margin:28px auto;max-width:960px;padding:0 0 4px;font-family:inherit;color:#e9dfca;}\
      #th-v4-report *{box-sizing:border-box;}\
      .th4-kicker{text-align:center;color:#d6b567;letter-spacing:.3em;font-size:13px;margin:8px 0 18px;}\
      .th4-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}\
      .th4-card{position:relative;overflow:hidden;background:linear-gradient(145deg,rgba(27,20,34,.96),rgba(8,8,14,.98));border:1px solid rgba(194,150,71,.58);border-radius:24px;padding:25px 24px;box-shadow:0 18px 45px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.025);}\
      .th4-card:before{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-70px;top:-85px;background:radial-gradient(circle,rgba(212,169,86,.16),transparent 68%);pointer-events:none;}\
      .th4-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px;}\
      .th4-title{font-size:22px;letter-spacing:.12em;color:#f0dfbd;}\
      .th4-score{display:flex;align-items:baseline;gap:4px;color:#e5bd63;}\
      .th4-score b{font-size:38px;font-weight:500;line-height:1;}\
      .th4-score span{font-size:12px;letter-spacing:.12em;}\
      .th4-tag{display:inline-block;border:1px solid rgba(111,163,126,.55);border-radius:999px;padding:5px 10px;color:#93bd9f;font-size:12px;letter-spacing:.12em;}\
      .th4-meter{height:7px;border-radius:99px;background:#2a2022;overflow:hidden;margin:12px 0 20px;}\
      .th4-meter i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#b6893e,#e3c46f);}\
      .th4-section{padding:13px 0;border-top:1px solid rgba(189,151,83,.16);}\
      .th4-section:first-of-type{border-top:0;}\
      .th4-label{font-size:12px;color:#c9a65e;letter-spacing:.18em;margin-bottom:6px;}\
      .th4-section p{margin:0;color:#d8ccba;font-size:15px;line-height:1.9;}\
      .th4-risk{color:#c88478!important;}\
      .th4-timeline{margin-top:18px;background:rgba(8,8,14,.62);border:1px solid rgba(194,150,71,.35);border-radius:19px;padding:18px;}\
      .th4-timeline-title{text-align:center;color:#e0c27d;font-size:15px;letter-spacing:.18em;margin-bottom:15px;}\
      .th4-timegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}\
      .th4-time{padding:12px 8px;text-align:center;border-radius:13px;background:rgba(255,255,255,.025);}\
      .th4-time small{display:block;color:#988b78;font-size:11px;margin-bottom:5px;}\
      .th4-time strong{font-size:20px;color:#e7cc8c;font-weight:500;}\
      .th4-time em{display:block;color:#8bad93;font-size:11px;font-style:normal;margin-top:4px;}\
      .th4-note{text-align:center;color:#8d8377;font-size:11px;line-height:1.7;margin:15px 12px 2px;}\
      @media(max-width:700px){#th-v4-report{margin:22px 0}.th4-grid{grid-template-columns:1fr;gap:16px}.th4-card{border-radius:19px;padding:21px 18px}.th4-title{font-size:20px}.th4-score b{font-size:34px}.th4-section p{font-size:15px;line-height:1.85}.th4-timegrid{gap:7px}.th4-time{padding:11px 4px}.th4-time strong{font-size:18px}}\
    ';
    document.head.appendChild(st);
  }

  function findAnchor(){
    var nodes=document.querySelectorAll('h1,h2,h3,h4,div,section');
    for(var i=0;i<nodes.length;i++){
      var s=(nodes[i].textContent||'').replace(/\s+/g,'');
      if(s==='九維詳解' || (s.indexOf('九維詳解')!==-1 && s.length<12)) return nodes[i];
    }
    return null;
  }

  function render(){
    if(document.getElementById('th-v4-report')) return;
    var body=txt();
    if(body.indexOf('命運綜評')===-1 || body.indexOf('九維')===-1) return;
    var anchor=findAnchor();
    if(!anchor || !anchor.parentNode) return;

    var o=overall();
    var love=pickScore('感情', clamp(o+3,45,92));
    var career=pickScore('事業', clamp(o+1,45,92));
    var lc=relationshipCopy(love), cc=careerCopy(career);
    var e=weakElem(), z=zodiac(), st=star();
    var l30=trend(love,30), l90=trend(love,90), c30=trend(career,31), c90=trend(career,91);

    var wrap=document.createElement('section');
    wrap.id='th-v4-report';
    wrap.innerHTML='\
      <div class="th4-kicker">天 衡 ・ 個 人 命 書</div>\
      <div class="th4-grid">\
        <article class="th4-card">\
          <div class="th4-head"><div><div class="th4-title">感 情 命 書</div><span class="th4-tag">'+tone(love)+' ・ '+esc(e)+'氣調候</span></div><div class="th4-score"><b>'+love+'</b><span>分</span></div></div>\
          <div class="th4-meter"><i style="width:'+love+'%"></i></div>\
          <div class="th4-section"><div class="th4-label">單 身 ・ 緣 分</div><p>'+lc.single+'</p></div>\
          <div class="th4-section"><div class="th4-label">有 伴 ・ 關 係</div><p>'+lc.paired+'</p></div>\
          <div class="th4-section"><div class="th4-label">感 情 提 醒</div><p class="th4-risk">'+lc.risk+'</p></div>\
          <div class="th4-timeline"><div class="th4-timeline-title">近期感情氣場</div><div class="th4-timegrid"><div class="th4-time"><small>此刻</small><strong>'+love+'</strong><em>'+tone(love)+'</em></div><div class="th4-time"><small>30 日</small><strong>'+l30+'</strong><em>'+tone(l30)+'</em></div><div class="th4-time"><small>90 日</small><strong>'+l90+'</strong><em>'+tone(l90)+'</em></div></div></div>\
        </article>\
        <article class="th4-card">\
          <div class="th4-head"><div><div class="th4-title">事 業 財 運</div><span class="th4-tag">'+tone(career)+' ・ 行動指引</span></div><div class="th4-score"><b>'+career+'</b><span>分</span></div></div>\
          <div class="th4-meter"><i style="width:'+career+'%"></i></div>\
          <div class="th4-section"><div class="th4-label">事 業 ・ 現 況</div><p>'+cc.now+'</p></div>\
          <div class="th4-section"><div class="th4-label">財 運 ・ 策 略</div><p>'+cc.money+'</p></div>\
          <div class="th4-section"><div class="th4-label">行 動 提 醒</div><p class="th4-risk">'+cc.risk+'</p></div>\
          <div class="th4-timeline"><div class="th4-timeline-title">近期事業動能</div><div class="th4-timegrid"><div class="th4-time"><small>此刻</small><strong>'+career+'</strong><em>'+tone(career)+'</em></div><div class="th4-time"><small>30 日</small><strong>'+c30+'</strong><em>'+tone(c30)+'</em></div><div class="th4-time"><small>90 日</small><strong>'+c90+'</strong><em>'+tone(c90)+'</em></div></div></div>\
        </article>\
      </div>\
      <div class="th4-note">依既有九維結果、喜用五行與目前命盤分數整理行動趨勢；'+(z?'生肖 '+esc(z):'')+(st?'・'+esc(st)+'座':'')+'。命理推演用於自我觀察與規劃參考，不代表事件必然發生。</div>';

    var top=anchor;
    while(top.parentElement && top.parentElement!==document.body){
      var p=top.parentElement;
      var pt=(p.textContent||'').replace(/\s+/g,'');
      if(pt.length>1600) break;
      top=p;
    }
    top.parentNode.insertBefore(wrap,top);
  }

  function boot(){
    injectStyle();
    var timer=null;
    function schedule(){ clearTimeout(timer); timer=setTimeout(render,450); }
    if(document.body){
      new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
      schedule();
    }else{
      document.addEventListener('DOMContentLoaded',function(){
        new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
        schedule();
      });
    }
  }

  loadLegacy(function(){ setTimeout(boot,80); });
})();
