// GET /api/songsearch?q=black hole  -> {ok, songs:[{t,a,art}]}  (Apple's public iTunes catalog, cached)
const J=(o,s=200,c="public, max-age=86400")=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":c}});
export async function onRequestGet({request}){
  const q=(new URL(request.url).searchParams.get("q")||"").replace(/\s+/g," ").trim().slice(0,60);
  if(q.length<2) return J({ok:true,songs:[]});
  try{
    const r=await fetch("https://itunes.apple.com/search?entity=song&limit=25&country=US&term="+encodeURIComponent(q),{cf:{cacheTtl:86400,cacheEverything:true}});
    const d=await r.json(), seen=new Set(), out=[];
    for(const x of d.results||[]){
      const t=String(x.trackName||"").replace(/\s*[\(\[](feat\.|with|remaster|remastered|live|\d{4} remaster|mono|stereo|single version|album version|radio edit)[^\)\]]*[\)\]]/ig,"").replace(/\s+-\s+(\d{4} )?remaster(ed)?.*$/i,"").trim();
      const a=String(x.artistName||"").trim(); if(!t||!a) continue;
      const k=(t+"|"+a).toLowerCase().replace(/[^a-z0-9|]/g,""); if(seen.has(k)) continue; seen.add(k);
      out.push({t,a,art:String(x.artworkUrl60||"")}); if(out.length>=7) break;
    }
    return J({ok:true,songs:out});
  }catch(e){ return J({ok:false,songs:[]},200,"no-store"); }
}
