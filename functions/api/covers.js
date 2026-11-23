// Request line: fans vote on the next Mystery Cover Tune, and can add songs for everyone to see.
// GET -> {ok, songs:[{k,t,a,n,fan}], mine}
// POST {k}            -> vote (one per visitor per day)
// POST {suggest,artist,hp} -> adds a fan pick to the board (and votes for it if they haven't voted today)
// Admin: POST {admin:<key>, action:"remove", k}
const J=(o,s=200,c="no-store")=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":c}});
const ADMIN_SHA256="361ee6ece6ff7358d56d103110a6ddda8ff5b8ce0291147ebe4faadb983bde7a";
const DEF=[["sunshine","Sunshine of Your Love","Cream"],["whycantthis","Why Can't This Be Love","Van Halen"],["sledgehammer","Sledgehammer","Peter Gabriel"],["ishotsheriff","I Shot the Sheriff","Clapton/Marley"],["waituntil","Wait Until Tomorrow","John Mayer Trio"],["alwaysrun","Always on the Run","Lenny Kravitz"],["thedoor","The Door","Teddy Swims"]];
const BAD=/(fuck|shit|cunt|nigg|fag|bitch|whore|slut|nazi|kike|chink|retard|porn|dick|cock|pussy|rape|http|www\.|\.com|\.net)/i;
const OK=/^[\p{L}\p{N} '’&!.?,()\/:+-]+$/u;
const hx=async t=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,"0")).join("");
const norm=s=>s.toLowerCase().replace(/^the\s+/,"").replace(/[^a-z0-9]/g,"");
async function band(request){
  try{ const r=await fetch(new URL("/content.json",request.url)); const c=await r.json(); const L=(c.covers||[]).filter(x=>x&&x.k&&x.t); if(L.length) return L.map(x=>[String(x.k),String(x.t),String(x.a||"")]); }catch(e){}
  return DEF;
}
const getJ=async(env,k,d)=>{ try{ return JSON.parse(await env.LIST.get(k)||"null")||d; }catch(e){ return d; } };
const who=async request=>"cov:v:"+(await hx((request.headers.get("cf-connecting-ip")||"x")+"|"+new Date().toISOString().slice(0,10))).slice(0,20);
async function board(request,env){
  const B=await band(request), F=await getJ(env,"cov:fan",[]), T=await getJ(env,"cov:tally",{});
  return {B,F,T,songs:[...B.map(([k,t,a])=>({k,t,a,n:T[k]|0})),...F.map(x=>({k:x.k,t:x.t,a:x.a,n:T[x.k]|0,fan:1}))]};
}
export async function onRequestGet({request,env}){
  if(!env.LIST){ const B=await band(request); return J({ok:true,offline:true,songs:B.map(([k,t,a])=>({k,t,a,n:0}))}); }
  const b=await board(request,env), mine=await env.LIST.get(await who(request));
  return J({ok:true,songs:b.songs,mine});
}
export async function onRequestPost({request,env}){
  if(!env.LIST) return J({ok:false,error:"The request line is down. Try later."},503);
  let d={}; try{ d=await request.json(); }catch(e){ return J({ok:false,error:"bad request"},400); }
  if(d.admin!==undefined){
    if(await hx(String(d.admin))!==ADMIN_SHA256) return J({ok:false,error:"wrong key"},403);
    let F=await getJ(env,"cov:fan",[]);
    if(d.action==="remove"){ F=F.filter(x=>x.k!==d.k); await env.LIST.put("cov:fan",JSON.stringify(F)); }
    return J({ok:true,fan:F});
  }
  if(d.hp) return J({ok:true});
  const w=await who(request), prev=await env.LIST.get(w);
  let b=await board(request,env);
  if(d.suggest!==undefined){
    const t=String(d.suggest||"").replace(/\s+/g," ").trim(), a=String(d.artist||"").replace(/\s+/g," ").trim();
    if(t.length<2||t.length>48||a.length>40||!OK.test(t)||(a&&!OK.test(a))) return J({ok:false,error:"Song up to 48 characters, artist up to 40."},400);
    if(BAD.test((t+" "+a).replace(/[^a-z.]/gi,""))) return J({ok:false,error:"Keep it clean for the roof."},400);
    const n=norm(t), hit=b.songs.find(s=>norm(s.t)===n);
    let k=hit&&hit.k;
    if(!hit){
      const ip=request.headers.get("cf-connecting-ip")||"x", rl="cov:rl:"+(await hx(ip)).slice(0,20);
      if(await env.LIST.get(rl)) return J({ok:false,error:"One new song every few minutes. Vote for one on the board instead."},429);
      if(b.F.length>=60) return J({ok:false,error:"The board is full. Vote for one that's already up."},429);
      await env.LIST.put(rl,"1",{expirationTtl:300});
      k="f"+(await hx(n)).slice(0,10);
      b.F.push({k,t,a,at:new Date().toISOString(),country:(request.cf&&request.cf.country)||""});
      await env.LIST.put("cov:fan",JSON.stringify(b.F));
    }
    if(!prev){ await env.LIST.put(w,k,{expirationTtl:60*60*26}); b.T[k]=(b.T[k]|0)+1; await env.LIST.put("cov:tally",JSON.stringify(b.T)); }
    b=await board(request,env);
    return J({ok:true,added:!hit,k,mine:prev||k,songs:b.songs});
  }
  const k=String(d.k||"");
  if(!b.songs.some(s=>s.k===k)) return J({ok:false,error:"Pick one from the list."},400);
  if(prev) return J({ok:false,error:"One request per night. Come back tomorrow.",mine:prev,songs:b.songs},429);
  await env.LIST.put(w,k,{expirationTtl:60*60*26});
  b.T[k]=(b.T[k]|0)+1; await env.LIST.put("cov:tally",JSON.stringify(b.T));
  return J({ok:true,mine:k,songs:b.songs.map(s=>s.k===k?{...s,n:b.T[k]}:s)});
}
