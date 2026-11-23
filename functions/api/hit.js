// Tiny visit stats (no cookies, nothing personal). One beacon per visit: POST {e:{event:count}}.
// GET /api/hit?days=14 -> {ok, days:[{d, visits, events:{...}}], total:{...}}
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const OKE=/^[a-z_]{2,24}$/;
const day=(o=0)=>new Date(Date.now()-o*864e5).toISOString().slice(0,10);
export async function onRequestPost({request,env}){
  if(!env.LIST) return J({ok:false},503);
  let b; try{ b=await request.json(); }catch(e){ return J({ok:false},400); }
  const ev=b&&b.e&&typeof b.e==="object"?b.e:{}; const k="st:"+day();
  let cur; try{ cur=JSON.parse(await env.LIST.get(k)||"null")||{visits:0,events:{}}; }catch(e){ cur={visits:0,events:{}}; }
  cur.visits++; for(const [n,c] of Object.entries(ev).slice(0,30)){ if(OKE.test(n)) cur.events[n]=(cur.events[n]|0)+Math.max(0,Math.min(50,c|0)); }
  await env.LIST.put(k,JSON.stringify(cur),{expirationTtl:60*60*24*120}); return J({ok:true});
}
export async function onRequestGet({request,env}){
  if(!env.LIST) return J({ok:false},503);
  const n=Math.max(1,Math.min(60,+new URL(request.url).searchParams.get("days")||14)), days=[], total={visits:0};
  for(let i=0;i<n;i++){ const d=day(i); let v=null; try{ v=JSON.parse(await env.LIST.get("st:"+d)||"null"); }catch(e){} if(!v) continue; days.push({d,...v}); total.visits+=v.visits; for(const [k,c] of Object.entries(v.events||{})) total[k]=(total[k]|0)+c; }
  return J({ok:true,total,days});
}
