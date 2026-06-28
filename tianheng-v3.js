/* 天衡 v3 增補：流年十槽 + 凶年替代 + 九維砍罐頭 + 個資彈窗 + 筆畫補字 */
/* 此檔以 <script src> 在主程式之後載入 */
(function(){
  "use strict";
  function init(){
    if(typeof STROKES==="undefined"||typeof GAN_WX==="undefined"){ setTimeout(init,80); return; }

    /* 1. 筆畫補字（只增不蓋）*/
    var ADD={"陸":16,"夏":10,"邱":12,"龔":22,"嚴":20,"萬":15,"顧":21,"蔣":17,"童":12,"巫":7,"麥":11,"凃":12,"塗":13,"卜":2,"尤":4,"鞏":15,"連":14,"康":11,"伍":6,"柴":10,"閔":12,"關":19,"邵":12,"湯":13,"汪":8,"白":5,"田":5,"申":5,"石":5,"任":6,"金":8,"姚":9,"秦":10,"唐":10,"凌":10,"孔":4,"毛":4,"尹":4,"水":4,"包":5,"史":5,"皮":5,"甘":5,"左":5,"冉":5,"全":6,"利":7,"吉":6,"年":6,"朵":6,"車":7,"辛":7,"谷":7,"汝":7,"池":7,"牟":6,"宓":8,"杭":8,"狄":8,"竺":8,"武":8,"花":10,"邰":12,"封":9,"姜":9,"段":9,"俞":9,"紀":9,"宣":9,"祝":10,"庫":10,"晁":10,"班":11,"婁":11,"區":11,"商":11,"崔":11,"麻":11,"那":11,"屠":11,"盛":12,"鈕":12,"閎":12,"郎":14,"管":14,"齊":14,"裴":14,"暨":14,"閣":14,"翟":14,"褚":15,"談":15,"墨":15,"養":15,"歐":15,"魯":15,"葛":15,"應":17,"勵":17,"繆":17,"蕭":18,"聶":18,"瞿":18,"鄢":18,"叢":18,"譚":19,"龐":19,"薄":19,"懷":20,"竇":20,"釋":20,"佩":8,"昀":8,"沛":8,"知":8,"承":8,"昇":8,"念":8,"宛":8,"奇":8,"果":8,"亭":9,"亮":9,"信":9,"俊":9,"勇":9,"南":9,"奕":9,"姿":9,"威":9,"屏":9,"彥":9,"柔":9,"盈":9,"芃":9,"虹":9,"軍":9,"音":9,"風":9,"倢":10,"修":10,"倫":10,"哥":10,"娟":10,"紓":10,"航":10,"芮":10,"芹":10,"倩":10,"書":10,"桓":10,"桐":10,"偵":11,"健":11,"勖":11,"婕":11,"婉":11,"梓":11,"梵":11,"翊":11,"淇":12,"淨":12,"涴":12,"琇":12,"惠":12,"晰":12,"晶":12,"皓":12,"筑":12,"貴":12,"超":12,"集":12,"意":13,"愛":13,"楨":13,"楷":13,"歆":13,"煜":13,"睦":13,"祺":13,"稚":13,"群":13,"義":13,"詩":13,"資":13,"頌":13,"鼎":13,"煦":13,"渝":13,"暄":13,"愉":13,"莛":13,"鈿":13,"鈴":13,"禎":14,"碩":14,"綵":14,"翠":14,"郡":14,"銨":14,"頗":14,"鳳":14,"嫣":14,"寧":14,"實":14,"暢":14,"槐":14,"歌":14,"精":14,"綿":14,"億":15,"儀":15,"嬋":15,"寬":15,"廣":15,"徵":15,"慶":15,"摯":15,"陶":16,"輝":15,"輔":15,"震":15,"霆":15,"霈":15,"鞍":15,"駕":15,"麾":15,"嬌":15,"摩":15,"槿":15,"蓮":17,"蔚":17,"嬪":17,"擇":17,"檀":17,"檜":17,"璐":17,"璦":17,"穗":17,"翼":18,"雙":18,"瓊":20,"瀞":20,"礦":20,"瓏":21,"鶴":21,"儷":21,"曦":20,"鑑":22};
    for(var k in ADD){ if(STROKES[k]==null) STROKES[k]=ADD[k]; }

    /* 2. 流年十槽資料 */
    var SLOT_SHISHEN={比肩:["獨立自主、靠本事立足","與同輩並肩、合作競爭並存"],劫財:["人事往來頻繁、財務宜守","群力可借但分潤難免"],食神:["才華舒展、心境輕快","福氣顯露、宜享受耕耘成果"],傷官:["創意噴發、鋒芒外露","表現慾強、易突破也易招議"],偏財:["機會與外財浮動","交際活絡、財源多向"],正財:["務實積累、財由勤得","腳踏實地、收穫看得見"],七殺:["壓力與磨練並至","挑戰升級、責任加身"],正官:["責任加身、宜守規矩","名分將近、利正途升遷"],偏印:["思慮深沉、宜內修專研","偏門靈感多、宜鑽研冷門"],正印:["貴人扶持、適合沉澱蓄能","長輩助力、利進修受蔭"]};
    var SLOT_FAV={旺:["五行正中你的喜用，順勢進取的好時機","大環境順風，把握得宜可更上層樓"],平:["吉凶參半，守住節奏、量力而為最穩","氣場中性，主動經營仍有可為"],弱:["五行剋你喜用，宜守不宜攻、沉潛蓄力","逆風之年，低調穩守為要"]};
    var SLOT_ZHI_POS={沖:"惟逢歲支相沖，難免有奔波或變動，順勢調整即可",自刑:"惟逢自刑，心緒易亂，記得別跟自己過不去",刑:"惟逢歲支相刑，人際偶有摩擦，話留三分",害:"惟逢相害，提防暗處小阻力，別把話全押",合:"加之歲支相合，貴人易近、利協商合作",比:"加之歲支同氣，做擅長之事格外順手",平:"歲支平和，按節奏推進即可"};
    var SLOT_ZHI_NEG={沖:"又逢歲支相沖，動盪加劇，重大決定務必緩行",自刑:"又逢自刑，內耗加重，更要照顧情緒、別鑽牛角尖",刑:"又逢歲支相刑，口角是非難免，凡事和為貴",害:"又逢相害，暗中阻力多，凡事留一手",合:"所幸歲支相合，仍有貴人可借力，守中待援",比:"所幸歲支同氣，守住熟悉領域仍有立足之地",平:"歲支尚平和，守穩節奏便是上策"};
    var SLOT_DOMAIN={比劫:"重點落在人際與合作",食傷:"重點落在表達與才華發揮",財星:"重點落在財務與事業經營",官殺:"重點落在事業與職場地位",印星:"重點落在學習、貴人與內在沉澱"};
    function _dayunFavOfYear(dayun,year,weak){if(!dayun||!dayun.list)return 0;var seg=null;for(var i=0;i<dayun.list.length;i++){var p=dayun.list[i];if(year>=p.startYear&&year<p.startYear+10)seg=p;}if(!seg)return 0;var gw=GAN_WX[seg.gz[0]],zw=ZHI_WX[seg.gz[1]];function f(w){if(w===weak)return 2;if(SHENG[w]===weak)return 1;if(KE[w]===weak)return-2;if(KE[weak]===w)return-1;return 0;}return f(gw)*2+f(zw);}
    var SLOT_DAYUN={順:"當前大運亦助你喜用，順勢可乘",逆:"惜當前大運偏剋喜用，旺也短難久、宜速戰速決",中:"大運態度中性，成敗多看自身經營"};
    function _cangFav(zhi,weak){var a=ZHI_CANGAN[zhi]||[];for(var i=0;i<a.length;i++){if(GAN_WX[a[i][0]]===weak)return true;}return false;}
    var WX_SEASON={木:"春（正—三月）",火:"夏（四—六月）",土:"四季土月（三六九臘）",金:"秋（七—九月）",水:"冬（十—臘月）"};
    function slot7Months(weak,yearZhi){var y=ZHI_WX[yearZhi];var r;if(y===weak||SHENG[y]===weak)r=WX_SEASON[y]+"前後氣旺、最能借力";else if(KE[y]===weak)r=WX_SEASON[y]+"前後壓力較顯、宜收斂";else r=WX_SEASON[y]+"前後為全年轉折、宜留意節奏";return "時序上"+r;}
    var SLOT_ACTION={比劫:{yi:"宜獨當一面、結盟靠譜夥伴",ji:"忌合夥糾紛、為人作保"},食傷:{yi:"宜發揮專長、創作與表達",ji:"忌口無遮攔、頂撞上位"},財星:{yi:"宜穩紮經營、置產理財",ji:"忌投機賭性、因財失義"},官殺:{yi:"宜爭取升遷、承擔重任",ji:"忌違規越矩、硬扛內耗"},印星:{yi:"宜進修受證、親近貴人",ji:"忌過度依賴、行動遲緩"}};
    var SLOT_TRIGGER={比劫:"引動比劫，利人際結盟，但防財務分潤",食傷:"引動食傷，利才華變現與名聲",財星:"引動財星，利正財偏財與務實收成",官殺:"引動官殺，利職場名分與地位",印星:"引動印星，利學習、靠山與心境沉澱"};
    var WX_ORGAN={木:"肝膽、筋骨與情緒疏泄",火:"心血管、睡眠與精神",土:"脾胃與消化",金:"肺氣、呼吸與皮膚",水:"腎氣、泌尿與精力"};
    function slot10Health(weak,tier){if(tier==="弱")return "健康上"+weak+"受抑，留意"+WX_ORGAN[weak]+"，別恃強熬夜";if(tier==="旺")return "健康上"+weak+"得氣，整體有勁，仍宜作息規律、勿過耗";return "健康平平，維持規律即可，留意"+WX_ORGAN[weak];}
    var ALT_BY_CLASS={比劫:"與其單打獨鬥硬拚，不如鞏固既有人脈、深化信任，等順流年再擴張",食傷:"與其急著表現衝撞，不如把才華沉澱成作品或專業，安靜累積待時而發",財星:"與其冒進求財，不如守穩現金流、精進本業，把基本盤顧牢",官殺:"與其硬扛求表現，不如先把份內做到無可挑剔，建口碑勝過搶功",印星:"正是進修充電的好時機，學習、考證、近貴人，蓄能勝過硬衝"};
    function altSuggestion(weak,cls){return "轉念建議："+ALT_BY_CLASS[cls]+"。趨吉可多往"+LUCKY_DIR[weak]+"走動、近"+LUCKY_COLOR[weak]+"色系與喜用"+weak+"的人事物，藉外氣補內運";}
    function _pickSlot(a,s){return a[s%a.length];}
    function lnNarrative2(L,dayGan,weak,dayZhi,dayun,prevSg){
      var gz=L.gz,year=L.year,gan=gz[0],zhi=gz[1];
      var sg=tenGod(dayGan,gan)||"比肩",cls=SHISHEN_CLASS[sg],tier=tierOf(gz,weak);
      var seed=gz.charCodeAt(0)+gz.charCodeAt(1)+year;
      var s1i=seed%2;if(prevSg===sg)s1i=(s1i+1)%2;
      var s1=SLOT_SHISHEN[sg][s1i];
      var s2=_pickSlot(SLOT_FAV[tier],seed+1);
      var zr=(typeof zhiRelation==="function")?zhiRelation(dayZhi,zhi).type:"平";
      var zhiTxt=(tier==="弱")?SLOT_ZHI_NEG[zr]:SLOT_ZHI_POS[zr];
      var s4=SLOT_DOMAIN[cls];
      var dyf=_dayunFavOfYear(dayun,year,weak);
      var s5=SLOT_DAYUN[dyf>=2?"順":dyf<=-2?"逆":"中"];
      var s6=_cangFav(zhi,weak)?(zhi+"中藏有喜用，暗處仍有助力"):"";
      var s7=slot7Months(weak,zhi);
      var act=SLOT_ACTION[cls],s9=SLOT_TRIGGER[cls],s10=slot10Health(weak,tier);
      var alt=(tier==="弱")?altSuggestion(weak,cls):"";
      var full=sg+"透干，"+s1+"；"+s2+"。"+zhiTxt+"，"+s4+(s6?"；"+s6:"")+"。"+s5+"。"+s7+"。落地建議："+act.yi+"，"+act.ji+"。"+s9+"。"+s10+"。"+alt;
      var brief=s1+"。"+s2;
      return {year:year,gz:gz,tier:tier,sg:sg,full:full,brief:brief,yi:act.yi,ji:act.ji};
    }
    window.buildLnHtmlV2=function(dayun,dayGan,weak,dayZhi){
      var prev=null,out="";
      for(var i=0;i<dayun.ln.length;i++){
        var o=lnNarrative2(dayun.ln[i],dayGan,weak,dayZhi,dayun,prev);prev=o.sg;
        var c=TIER_COLOR[o.tier],active=(i===0);
        if(active){
          out+='<div style="border:1px solid '+c+';border-radius:8px;padding:12px 14px;margin-bottom:8px;background:rgba(176,133,66,.08)"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="color:#e9d5a8;font-size:15px;font-weight:600">'+o.year+' '+o.gz+'</span><span style="color:'+c+';font-size:13px;font-weight:600;border:1px solid '+c+';border-radius:3px;padding:0 7px">'+o.tier+'</span><span style="color:#8a7c5a;font-size:11px">· 今年</span></div><div style="color:#d8cbb0;font-size:13px;line-height:1.95">'+o.full+'</div></div>';
        }else{
          out+='<div style="border:1px solid rgba(176,133,66,.25);border-radius:8px;margin-bottom:8px;background:rgba(176,133,66,.02)"><div onclick="this.parentElement.classList.toggle(\'lnopen\')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer"><span style="color:#e9d5a8;font-size:15px;font-weight:600">'+o.year+' '+o.gz+'</span><span style="color:'+c+';font-size:13px;font-weight:600;border:1px solid '+c+';border-radius:3px;padding:0 7px">'+o.tier+'</span><span style="color:#8a7c5a;font-size:11px;flex:1">'+o.brief+'</span><span style="color:#8a7c5a;font-size:11px">▼</span></div><div class="lnbody" style="max-height:0;overflow:hidden;transition:max-height .35s"><div style="color:#d8cbb0;font-size:13px;line-height:1.95;padding:0 12px 12px">'+o.full+'</div></div></div>';
        }
      }
      return out;
    };

    /* 3. 九維交叉四段 */
    var SX_WX={鼠:"水",牛:"土",虎:"木",兔:"木",龍:"土",蛇:"火",馬:"火",羊:"土",猴:"金",雞:"金",狗:"土",豬:"水"};
    var GUA_NAME={乾:"剛健開創",兌:"和悅聚緣",離:"光明顯達",震:"動中求進",巽:"柔順漸進",坎:"沉潛蓄力",艮:"穩重篤實",坤:"厚德載物"};
    function crossDayVsSx(dayGan,sx){var dw=GAN_WX[dayGan],sw=SX_WX[sx];if(dw===sw)return "日主"+dayGan+"（"+dw+"）與生肖"+sx+"同氣相挺，先天性情一致、根骨厚實";if(SHENG[sw]===dw)return "生肖"+sx+"（"+sw+"）生扶日主"+dayGan+"（"+dw+"），底氣得助、行事多一分後援";if(SHENG[dw]===sw)return "日主"+dayGan+"（"+dw+"）洩於生肖"+sx+"（"+sw+"），天生樂於付出、才華外顯但需留意耗神";if(KE[dw]===sw)return "日主"+dayGan+"（"+dw+"）駕馭生肖"+sx+"（"+sw+"），主控制力強、能成事但易過勞";if(KE[sw]===dw)return "生肖"+sx+"（"+sw+"）剋制日主"+dayGan+"（"+dw+"），內在常有自我拉扯，磨練後反成韌性";return "日主"+dayGan+"與生肖"+sx+"各有其性，剛柔並存";}
    function crossWuxing(strong,weak){if(SHENG[weak]===strong)return "命中"+strong+"旺、"+weak+"弱，而"+weak+"能生"+strong+"，補"+weak+"等於替"+strong+"添柴，補強弱項後格局更上層";if(KE[strong]===weak)return "命中"+strong+"旺剋"+weak+"，"+weak+"受壓最深，調候補"+weak+"是全局最該下手處，補起來運勢翻轉最明顯";if(SHENG[strong]===weak)return "命中"+strong+"旺、"+weak+"弱，"+strong+"本可生"+weak+"卻力有未逮，順勢引"+strong+"入"+weak+"是關鍵";if(KE[weak]===strong)return "命中"+strong+"旺、"+weak+"弱，"+weak+"雖能剋"+strong+"卻力不足，補"+weak+"方能制衡過旺的"+strong;return "命中"+strong+"主、"+weak+"需補，五行各據其位、整體可塑性高";}
    function crossEastWest(zw,sign){var h=String(zw).split("·")[0];var dyn=["牡羊","獅子","射手","水瓶"],std=["金牛","處女","摩羯","巨蟹"];if(dyn.indexOf(sign)>=0)return "西洋"+sign+"座外放進取，與東方"+h+"相互拉抬，外顯張力強、宜給自己舞台";if(std.indexOf(sign)>=0)return "西洋"+sign+"座沉穩內守，與東方"+h+"一剛一柔、內外互補，先穩後動最順";return "西洋"+sign+"座善調和，與東方"+h+"交映，性格層次豐富、能屈能伸";}
    function crossVerdictV2(g,weak,strong,overall,sx,sign){var t;if(overall>=85)t="底蘊深厚，順勢而為便能水到渠成";else if(overall>=75)t="格局中上，補強弱項可由佳轉盛";else if(overall>=65)t="根基平穩，後天調候得宜則漸入佳境";else t="先天平實，正因如此後天努力的每一分都算數";return "九維交叉之下，您屬「"+g+"」格局——"+(GUA_NAME[g]||"自成一格")+"。大運重點在補"+weak+"、調節過旺的"+strong+"；"+t+"。屬"+sx+"帶"+sign+"座之性，"+((sx.charCodeAt(0)+sign.charCodeAt(0))%2?"宜把握貴人與舞台之機":"宜穩中求進、厚積薄發")+"。";}
    window.buildCrossHtmlV2=function(r){
      var guaShort=r.gua.n.split(" ")[0];
      return '<div class="cross"><h4>◈ 九 維 交 叉 推 演</h4>'+
        '<p>'+crossDayVsSx(r.gz.dGan,r.sx)+'。</p>'+
        '<p>'+crossWuxing(r.strong,r.weak)+'。</p>'+
        '<p>'+crossEastWest(r.zw,r.sign)+'；姓名音律屬<span class="em">'+r.tone+'</span>，加乘整體氣場。</p>'+
        '<p style="color:var(--gold-bright);border-top:1px solid var(--panel-line);padding-top:12px;margin-top:14px">'+crossVerdictV2(guaShort,r.weak,r.strong,r.overall,r.sx,r.sign)+'</p></div>';
    };

    /* 5. 流年自動接管 */
    if(typeof render==="function" && !render._v3){
      var _orig=render;
      render=function(r,info){
        var html=_orig(r,info);
        try{
          var a='近六年流年細解</div>';
          var b='<div style="font-size:11px;color:#8a7c5a;margin-top:4px';
          var i1=html.indexOf(a),i2=html.indexOf(b);
          if(i1>=0&&i2>i1&&r&&r.dayun&&r.gz){
            var nl=window.buildLnHtmlV2(r.dayun,r.gz.dGan,r.weak,r.gz.dZhi);
            html=html.slice(0,i1+a.length)+nl+html.slice(i2);
          }
        }catch(e){}
        return html;
      };
      render._v3=true;
    }
  }

  /* 4. 個資彈窗 */
  var PDPA_KEY="tianheng_pdpa_agreed_v1";
  function pdpaAgreed(){try{return localStorage.getItem(PDPA_KEY)==="1";}catch(e){return false;}}
  function showPdpaModal(){
    if(pdpaAgreed())return;
    if(!document.body){setTimeout(showPdpaModal,100);return;}
    if(document.getElementById("pdpaModal"))return;
    var m=document.createElement("div");m.id="pdpaModal";
    m.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(6,6,13,.82);display:flex;align-items:center;justify-content:center;padding:24px";
    var box=document.createElement("div");
    box.style.cssText="max-width:420px;background:linear-gradient(160deg,rgba(34,26,40,.97),rgba(15,11,22,.98));border:1px solid #b08542;border-radius:10px;padding:26px 22px;color:#f0e8d6";
    box.innerHTML='<div style="font-size:16px;color:#d9b66a;letter-spacing:.1em;margin-bottom:14px;text-align:center">◈ 個資使用聲明 ◈</div><div style="font-size:13px;line-height:1.95;color:#d8cbb0">天衡為純前端命理工具，您輸入的姓名與生日<b style="color:#d9b66a">僅在您的裝置本機運算</b>，不會上傳、不會儲存於伺服器，關閉頁面即消失。瀏覽人次統計僅累計次數、不含任何個人資料。<br><br>點選下方按鈕即表示您已知悉並同意（依個人資料保護法）。</div>';
    var btn=document.createElement("button");btn.textContent="我 了 解 並 同 意";
    btn.style.cssText="width:100%;margin-top:18px;padding:13px;background:linear-gradient(135deg,#a83a2e,#7a2a20);color:#f0e8d6;border:1px solid #b08542;border-radius:6px;font-size:15px;letter-spacing:.15em;cursor:pointer;font-family:inherit";
    btn.onclick=function(){try{localStorage.setItem(PDPA_KEY,"1");}catch(e){}if(m.parentNode)m.parentNode.removeChild(m);};
    box.appendChild(btn);m.appendChild(box);document.body.appendChild(m);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){init();showPdpaModal();});
  }else{ init();showPdpaModal(); }
})();
