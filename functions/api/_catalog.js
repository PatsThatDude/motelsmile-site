// Is this a real song? One check: MusicBrainz (free, open music database, no key).
export const norm=s=>String(s||"").toLowerCase().replace(/^the\s+/,"").replace(/&/g,"and").replace(/[^a-z0-9]/g,"");
export async function verify(t,a){
  const q=`recording:"${t.replace(/"/g,"")}"`+(a?` AND artist:"${a.replace(/"/g,"")}"`:"");
  for(let tries=0;tries<3;tries++) try{
    const r=await fetch("https://musicbrainz.org/ws/2/recording/?fmt=json&limit=10&query="+encodeURIComponent(q),{headers:{"user-agent":"MotelSmile/1.0 ( https://motelsmile.pages.dev )","accept":"application/json"}});
    if(r.status===503){ await new Promise(z=>setTimeout(z,1100)); continue; }
    if(!r.ok) return null;
    const d=await r.json(), nt=norm(t), na=norm(a);
    for(const x of d.recordings||[]){
      const ar=(x["artist-credit"]||[]).map(c=>c.name).join(" ");
      if(norm(x.title)===nt&&(!na||norm(ar).includes(na)||na.includes(norm(ar)))) return {t:x.title,a:(x["artist-credit"]||[])[0]?.name||a};
    }
    return null;
  }catch(e){ return null; }
  return null;
}
