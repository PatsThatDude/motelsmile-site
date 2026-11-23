// shared song lookup: Apple iTunes catalog first, Deezer as backup (both public, no keys)
const UA={"user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15","accept":"application/json"};
const clean=t=>String(t||"").replace(/\s*[\(\[](feat\.?|ft\.?|with|remaster|remastered|live|\d{4} remaster|mono|stereo|single version|album version|radio edit|as made famous)[^\)\]]*[\)\]]/ig,"").replace(/\s+-\s+(\d{4} )?(remaster(ed)?|live|single|radio edit|mono|stereo).*$/i,"").trim();
export const norm=s=>String(s||"").toLowerCase().replace(/^the\s+/,"").replace(/&/g,"and").replace(/[^a-z0-9]/g,"");
export async function search(q,n=7){
  const out=[], seen=new Set();
  const add=(t,a,art)=>{ t=clean(t); a=String(a||"").trim(); if(!t||!a) return; if(/karaoke|tribute|made famous|in the style of|cover version/i.test(t+" "+a)) return; const k=norm(t)+"|"+norm(a); if(seen.has(k)) return; seen.add(k); out.push({t,a,art:art||""}); };
  try{ const r=await fetch("https://itunes.apple.com/search?entity=song&limit=25&country=US&term="+encodeURIComponent(q),{headers:UA,cf:{cacheTtl:86400,cacheEverything:true}});
    if(r.ok){ const d=await r.json(); (d.results||[]).forEach(x=>add(x.trackName,x.artistName,x.artworkUrl60)); } }catch(e){}
  if(out.length<3){ try{ const r=await fetch("https://api.deezer.com/search?limit=25&q="+encodeURIComponent(q),{headers:UA,cf:{cacheTtl:86400,cacheEverything:true}});
    if(r.ok){ const d=await r.json(); (d.data||[]).sort((x,y)=>(y.rank|0)-(x.rank|0)).forEach(x=>add(x.title_short||x.title,x.artist&&x.artist.name,x.album&&x.album.cover_small)); } }catch(e){} }
  return out.slice(0,n);
}
const match=(x,nt,na)=>norm(x.t)===nt&&(!na||norm(x.a).includes(na)||na.includes(norm(x.a)));
export async function verify(t,a){
  const nt=norm(clean(t)), na=norm(a);
  const L=await search((t+" "+(a||"")).trim(),25); const hit=L.find(x=>match(x,nt,na)); if(hit) return hit;
  // MusicBrainz: open music database, good for catalog Deezer/Apple can't serve from here
  try{ const q=`recording:"${t.replace(/"/g,"")}"`+(a?` AND artist:"${a.replace(/"/g,"")}"`:"");
    const r=await fetch("https://musicbrainz.org/ws/2/recording/?fmt=json&limit=15&query="+encodeURIComponent(q),{headers:{"user-agent":"MotelSmile/1.0 ( https://motelsmile.pages.dev )","accept":"application/json"}});
    if(r.ok){ const d=await r.json(); for(const x of d.recordings||[]){ const c={t:clean(x.title),a:((x["artist-credit"]||[])[0]||{}).name||"",art:""}; if(match(c,nt,na)) return c; } } }catch(e){}
  return null;
}
