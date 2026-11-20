// Fan graffiti wall.  GET -> approved names.  POST {name,color,hp} -> pending (band approves).
// Admin: POST {admin:<key>, action:"list"|"approve"|"reject"|"remove", id}
const J=(o,s=200,c="no-store")=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":c}});
const ADMIN_SHA256="361ee6ece6ff7358d56d103110a6ddda8ff5b8ce0291147ebe4faadb983bde7a";
const COLORS=["pink","cyan","yellow","green","white"];
const BAD=/(fuck|shit|cunt|nigg|fag|bitch|whore|slut|nazi|kike|chink|retard|porn|dick|cock|pussy|http|www\.|\.com)/i;
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,"0")).join("");
const get=async(env,k)=>{ try{ return JSON.parse(await env.LIST.get(k)||"[]"); }catch(e){ return []; } };
export async function onRequestGet({env}){
  if(!env.LIST) return J({ok:false,names:[]},503);
  const a=await get(env,"wall:approved");
  return J({ok:true,names:a.map(x=>({id:x.id,n:x.n,c:x.c}))},200,"public, max-age=60");
}
export async function onRequestPost({request,env}){
  if(!env.LIST) return J({ok:false,error:"not set up"},503);
  let d={}; try{ d=await request.json(); }catch(e){ return J({ok:false,error:"bad request"},400); }
  if(d.admin!==undefined){
    if(await sha(String(d.admin))!==ADMIN_SHA256) return J({ok:false,error:"wrong key"},403);
    let p=await get(env,"wall:pending"), a=await get(env,"wall:approved");
    if(d.action==="approve"){ const x=p.find(x=>x.id===d.id); if(x){ p=p.filter(y=>y.id!==d.id); a.unshift({...x,ok:new Date().toISOString()}); a=a.slice(0,40); } }
    if(d.action==="reject") p=p.filter(y=>y.id!==d.id);
    if(d.action==="remove") a=a.filter(y=>y.id!==d.id);
    if(d.action!=="list"){ await env.LIST.put("wall:pending",JSON.stringify(p)); await env.LIST.put("wall:approved",JSON.stringify(a)); }
    return J({ok:true,pending:p,approved:a});
  }
  if(d.hp) return J({ok:true});
  const n=String(d.name||"").replace(/\s+/g," ").trim();
  if(n.length<1||n.length>18||!/^[\p{L}\p{N} '&!.?♥★-]+$/u.test(n)) return J({ok:false,error:"Up to 18 letters or numbers."},400);
  if(BAD.test(n.replace(/[^a-z]/gi,""))) return J({ok:false,error:"Keep it clean for the roof."},400);
  const ip=request.headers.get("cf-connecting-ip")||"x", rl="wall:rl:"+ip;
  if(await env.LIST.get(rl)) return J({ok:false,error:"One tag at a time. Try again in a few minutes."},429);
  await env.LIST.put(rl,"1",{expirationTtl:600});
  const p=await get(env,"wall:pending"); if(p.length>=200) return J({ok:false,error:"The wall's full of tags waiting. Try later."},429);
  p.push({id:crypto.randomUUID().slice(0,8),n,c:COLORS.includes(d.color)?d.color:"pink",t:new Date().toISOString(),country:(request.cf&&request.cf.country)||""});
  await env.LIST.put("wall:pending",JSON.stringify(p));
  return J({ok:true});
}
