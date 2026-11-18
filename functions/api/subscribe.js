// POST /api/subscribe  {email, hp}  -> saves the address in the LIST KV namespace (Cloudflare)
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export async function onRequestPost({request,env}){
  if(!env.LIST) return J({ok:false,error:"not set up"},503);
  let d={}; const ct=request.headers.get("content-type")||"";
  try{ d=ct.includes("json")?await request.json():Object.fromEntries(await request.formData()); }catch(e){ return J({ok:false,error:"bad request"},400); }
  if(d.hp) return J({ok:true});                       // honeypot: bots fill the hidden field
  const email=String(d.email||"").trim().toLowerCase();
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return J({ok:false,error:"That email doesn't look right."},400);
  const prev=await env.LIST.get(email);
  if(!prev) await env.LIST.put(email,JSON.stringify({joined:new Date().toISOString(),country:(request.cf&&request.cf.country)||""}));
  return J({ok:true,already:!!prev});
}
export const onRequestGet=()=>J({ok:false},405);
