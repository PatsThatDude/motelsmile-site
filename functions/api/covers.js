// Request line: fans vote on the next Mystery Cover Tune.
// GET -> {ok, songs:[{k,t,a,n}], mine}   POST {k,hp} -> one vote per visitor per day
const J=(o,s=200,c="no-store")=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":c}});
const DEF=[["sunshine","Sunshine of Your Love","Cream"],["whycantthis","Why Can't This Be Love","Van Halen"],["sledgehammer","Sledgehammer","Peter Gabriel"],["ishotsheriff","I Shot the Sheriff",""],["waituntil","Wait Until Tomorrow","John Mayer Trio"],["alwaysrun","Always on the Run","Lenny Kravitz"],["thedoor","The Door","Teddy Swims"]];
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)))].slice(0,10).map(b=>b.toString(16).padStart(2,"0")).join("");
async function songs(request){
  try{ const r=await fetch(new URL("/content.json",request.url)); const c=await r.json(); const L=(c.covers||[]).filter(x=>x&&x.k&&x.t); if(L.length) return L.map(x=>[String(x.k),String(x.t),String(x.a||"")]); }catch(e){}
  return DEF;
}
const tally=async env=>{ try{ return JSON.parse(await env.LIST.get("cov:tally")||"{}"); }catch(e){ return {}; } };
const who=async request=>"cov:v:"+await sha((request.headers.get("cf-connecting-ip")||"x")+"|"+new Date().toISOString().slice(0,10));
export async function onRequestGet({request,env}){
  const S=await songs(request);
  if(!env.LIST) return J({ok:true,offline:true,songs:S.map(([k,t,a])=>({k,t,a,n:0}))});
  const T=await tally(env), mine=await env.LIST.get(await who(request));
  return J({ok:true,songs:S.map(([k,t,a])=>({k,t,a,n:T[k]|0})),mine});
}
export async function onRequestPost({request,env}){
  if(!env.LIST) return J({ok:false,error:"The request line is down. Try later."},503);
  let d={}; try{ d=await request.json(); }catch(e){ return J({ok:false,error:"bad request"},400); }
  if(d.hp) return J({ok:true});
  const S=await songs(request), k=String(d.k||"");
  if(!S.some(s=>s[0]===k)) return J({ok:false,error:"Pick one from the list."},400);
  const w=await who(request), prev=await env.LIST.get(w);
  if(prev) return J({ok:false,error:"One request per night. Come back tomorrow.",mine:prev},429);
  await env.LIST.put(w,k,{expirationTtl:60*60*26});
  const T=await tally(env); T[k]=(T[k]|0)+1; await env.LIST.put("cov:tally",JSON.stringify(T));
  return J({ok:true,mine:k,songs:S.map(([kk,t,a])=>({k:kk,t,a,n:T[kk]|0}))});
}
