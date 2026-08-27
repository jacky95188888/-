/* 天衡金流後端（Cloudflare Worker）
 * ECPay AIO：建立訂單 / ReturnURL 驗證 / 訂單狀態 / 解鎖驗證
 *
 * 綁定：KV namespace -> ORDERS
 * Secrets（正式環境）：ECPAY_MERCHANT_ID / ECPAY_HASH_KEY / ECPAY_HASH_IV / UNLOCK_SECRET
 * Vars：SITE_URL=https://jacky95188888.github.io/-/  ECPAY_STAGE=false
 * 測試環境若未設 ECPAY_*，會使用綠界公開測試資料。
 */
const GATES={love:'感情深度命書',career:'事業深度命書',health:'健康調候命書',wealth:'財富深度命書'};
const PRICE=99;
const TEST={id:'3002607',key:'pwFHCqoQZGmho4w6',iv:'EkRm7iFT261dpevs'};

export default {
  async fetch(req,env){
    const url=new URL(req.url);
    if(req.method==='OPTIONS') return cors(new Response(null,{status:204}));
    try{
      if(url.pathname==='/health') return json({ok:true,service:'tianheng-pay'});
      if(url.pathname==='/create'&&req.method==='POST') return cors(await createOrder(req,env,url));
      if(url.pathname==='/return'&&req.method==='POST') return await paymentReturn(req,env);
      if(url.pathname==='/result') return await paymentResult(req,env,url);
      if(url.pathname==='/status') return cors(await orderStatus(url,env));
      if(url.pathname==='/verify') return cors(await verifyUnlock(url,env));
      return cors(json({ok:false,error:'not_found'},404));
    }catch(e){return cors(json({ok:false,error:e.message||String(e)},500));}
  }
};

function cfg(env){
  const stage=String(env.ECPAY_STAGE||'true').toLowerCase()!=='false';
  return {
    stage,
    id:env.ECPAY_MERCHANT_ID||(stage?TEST.id:''),
    key:env.ECPAY_HASH_KEY||(stage?TEST.key:''),
    iv:env.ECPAY_HASH_IV||(stage?TEST.iv:''),
    site:(env.SITE_URL||'https://jacky95188888.github.io/-/').replace(/\/+$/,'/')
  };
}
function cors(r){const h=new Headers(r.headers);h.set('Access-Control-Allow-Origin','https://jacky95188888.github.io');h.set('Access-Control-Allow-Headers','content-type');h.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});}
function json(v,status=200){return new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json;charset=utf-8'}});}
function tradeNo(){const d=new Date();const p=n=>String(n).padStart(2,'0');return 'TH'+String(d.getFullYear()).slice(-2)+p(d.getMonth()+1)+p(d.getDate())+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+Math.random().toString(36).slice(2,6).toUpperCase();}
function twDate(){const d=new Date(Date.now()+8*3600e3);const p=n=>String(n).padStart(2,'0');return `${d.getUTCFullYear()}/${p(d.getUTCMonth()+1)}/${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;}

async function createOrder(req,env,url){
  const c=cfg(env); if(!c.id||!c.key||!c.iv) return json({ok:false,error:'payment_not_configured'},503);
  const body=await req.json(); const gate=String(body.gate||''); if(!GATES[gate]) return json({ok:false,error:'invalid_gate'},400);
  const no=tradeNo(); const base=url.origin;
  const p={MerchantID:c.id,MerchantTradeNo:no,MerchantTradeDate:twDate(),PaymentType:'aio',TotalAmount:String(PRICE),TradeDesc:'TianHeng premium reading',ItemName:GATES[gate],ReturnURL:base+'/return',ChoosePayment:'ALL',EncryptType:'1',ClientBackURL:c.site+'?payment=back&order='+encodeURIComponent(no),CustomField1:gate};
  p.CheckMacValue=await mac(p,c.key,c.iv);
  await env.ORDERS.put(no,JSON.stringify({order:no,gate,amount:PRICE,status:'pending',createdAt:Date.now()}),{expirationTtl:86400});
  return json({ok:true,order:no,action:c.stage?'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5':'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',fields:p});
}

async function paymentReturn(req,env){
  const form=Object.fromEntries((await req.formData()).entries()); const c=cfg(env);
  const got=String(form.CheckMacValue||'').toUpperCase(); const copy={...form}; delete copy.CheckMacValue;
  const expect=await mac(copy,c.key,c.iv); if(got!==expect) return new Response('0|CheckMacValueError');
  const no=String(form.MerchantTradeNo||''); const raw=await env.ORDERS.get(no); if(!raw) return new Response('0|OrderNotFound');
  const o=JSON.parse(raw); const paid=String(form.RtnCode)==='1'&&Number(form.TradeAmt||form.TotalAmount||o.amount)===PRICE;
  if(paid){o.status='paid';o.paidAt=Date.now();o.tradeNo=String(form.TradeNo||'');o.token=await signToken({order:no,gate:o.gate,exp:Date.now()+30*86400e3},env.UNLOCK_SECRET||c.key);await env.ORDERS.put(no,JSON.stringify(o),{expirationTtl:30*86400});}
  return new Response('1|OK');
}

async function paymentResult(req,env,url){
  // Client 端若日後使用 OrderResultURL，可在此接收再導回網站；真正付款判定仍以 /return 為主。
  if(req.method==='POST'){const f=await req.formData();const no=String(f.get('MerchantTradeNo')||'');return Response.redirect(cfg(env).site+'?payment=back&order='+encodeURIComponent(no),302);}
  return Response.redirect(cfg(env).site,302);
}
async function orderStatus(url,env){const no=url.searchParams.get('order')||'';const raw=await env.ORDERS.get(no);if(!raw)return json({ok:false,status:'missing'},404);const o=JSON.parse(raw);return json({ok:true,order:o.order,gate:o.gate,status:o.status,token:o.status==='paid'?o.token:undefined});}
async function verifyUnlock(url,env){const token=url.searchParams.get('token')||'';const c=cfg(env);const p=await verifyToken(token,env.UNLOCK_SECRET||c.key);if(!p)return json({ok:false},401);return json({ok:true,gate:p.gate,order:p.order,exp:p.exp});}

async function mac(params,key,iv){
  const ks=Object.keys(params).filter(k=>params[k]!==undefined&&params[k]!==null&&String(params[k])!=='').sort((a,b)=>a.localeCompare(b));
  const raw='HashKey='+key+'&'+ks.map(k=>k+'='+String(params[k])).join('&')+'&HashIV='+iv;
  let enc=encodeURIComponent(raw).replace(/%20/g,'+').toLowerCase();
  enc=enc.replace(/%2d/g,'-').replace(/%5f/g,'_').replace(/%2e/g,'.').replace(/%21/g,'!').replace(/%2a/g,'*').replace(/%28/g,'(').replace(/%29/g,')');
  const dig=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(enc));
  return [...new Uint8Array(dig)].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
}
function b64u(bytes){let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function fromB64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);const r=atob(s);return Uint8Array.from(r,c=>c.charCodeAt(0));}
async function signToken(payload,secret){const body=b64u(new TextEncoder().encode(JSON.stringify(payload)));const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),'HMAC',false,['sign']);const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(body)));return body+'.'+b64u(sig);}
async function verifyToken(token,secret){try{const [body,sig]=token.split('.');if(!body||!sig)return null;const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),'HMAC',false,['verify']);const ok=await crypto.subtle.verify('HMAC',key,fromB64u(sig),new TextEncoder().encode(body));if(!ok)return null;const p=JSON.parse(new TextDecoder().decode(fromB64u(body)));if(!p.exp||Date.now()>p.exp)return null;return p;}catch{return null;}}
