(() => {
  if(window.__toolViewRecorded || window.top!==window.self)return;
  const script=document.currentScript,tool=script?.dataset.tool;
  if(!['fraud-lab','sales-team','n7k2-jl9x','dream-library','expert-council','tool'].includes(tool))return;
  if(location.hostname!=='jacky95188888.github.io'||/admin|analytics|preview|test|demo/i.test(location.pathname)||navigator.webdriver)return;
  window.__toolViewRecorded=true;
  const id=crypto.randomUUID();
  const send=async()=>{
    try{
      const response=await fetch('https://sales-team.rhtm9y855y.workers.dev/tool-analytics/track',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({tool,id,page:location.pathname}),keepalive:true
      });
      if(!response.ok)console.warn('瀏覽統計暫時無法寫入：',response.status);
    }catch{console.warn('瀏覽統計連線失敗，不影響工具使用。');}
  };
  if(document.visibilityState==='visible')send();
  else document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')send();},{once:true});
})();
