// GET /api/songsearch?q=black hole  -> {ok, songs:[{t,a,art}]}
import {search} from "./_catalog.js";
const J=(o,s=200,c="public, max-age=86400")=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":c}});
export async function onRequestGet({request}){
  const q=(new URL(request.url).searchParams.get("q")||"").replace(/\s+/g," ").trim().slice(0,60);
  if(q.length<2) return J({ok:true,songs:[]});
  const songs=await search(q,7);
  return J({ok:songs.length>0,songs},200,songs.length?"public, max-age=86400":"no-store");
}
