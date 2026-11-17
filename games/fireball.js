/* FIREBALL — Motel Smile pinball. Loaded on demand from the game corner. window.MSPinball.open() */
(()=>{
  const W=400,H=720,R=9,G=980;
  const ac=()=>window.MSAC&&window.MSAC();
  function tone(f,d,type,vol,slide){ const a=ac(); if(!a) return; const t=a.currentTime, o=a.createOscillator(), g=a.createGain();
    o.type=type||"square"; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+d);
    g.gain.setValueAtTime(vol||.08,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g).connect(a.destination); o.start(t); o.stop(t+d+.02); }
  function noise(d,f,vol){ const a=ac(); if(!a) return; const t=a.currentTime, n=a.createBuffer(1,Math.max(1,a.sampleRate*d|0),a.sampleRate), x=n.getChannelData(0);
    for(let i=0;i<x.length;i++) x[i]=(Math.random()*2-1)*Math.pow(1-i/x.length,2);
    const s=a.createBufferSource(), b=a.createBiquadFilter(), g=a.createGain(); s.buffer=n; b.type="bandpass"; b.frequency.value=f; g.gain.value=vol; s.connect(b).connect(g).connect(a.destination); s.start(t); }
  const SFX={
    flip:()=>noise(.06,1800,.35), pop:()=>{tone(880,.09,"square",.07,440);}, sling:()=>tone(300,.08,"sawtooth",.06,150),
    target:()=>tone(1200,.12,"triangle",.09,900), lane:()=>tone(1568,.1,"sine",.07), launch:()=>noise(.35,700,.5),
    drain:()=>tone(330,.7,"sawtooth",.07,80), wall:()=>noise(.02,3000,.08),
    jingle:()=>[523,659,784,1046,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.12,"square",.06),i*90)),
    fire:()=>{ [392,523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.16,"square",.07),i*70)); setTimeout(()=>noise(.6,500,.5),420); }
  };

  /* ---------- table geometry ---------- */
  const segs=[]; // {a:[x,y],b:[x,y],e,kick,kind,oneway}
  const S=(ax,ay,bx,by,o={})=>segs.push(Object.assign({a:[ax,ay],b:[bx,by],e:.5},o));
  // top arc
  const ARC=[]; for(let i=0;i<=22;i++){ const t=Math.PI+Math.PI*i/22; ARC.push([200+200*Math.cos(t),205+190*Math.sin(t)]); }
  for(let i=0;i<ARC.length-1;i++) S(ARC[i][0],ARC[i][1],ARC[i+1][0],ARC[i+1][1]);
  S(0,205,0,560); S(400,205,400,H+40);                 // side walls
  S(366,250,366,H+40,{e:.3});                           // plunger lane wall
  S(366,250,400,214,{e:.4,oneway:true});                // one-way gate back into the lane
  // outlanes / inlanes
  S(0,560,22,575); S(22,575,22,600); S(22,600,112,652); // left guide to flipper
  S(366,560,344,575); S(344,575,344,600); S(344,600,254,652);
  S(46,520,46,590,{e:.3}); S(320,520,320,590,{e:.3});   // inlane posts
  // slingshots (kick faces)
  S(70,500,70,560); S(70,560,110,590); S(70,500,110,590,{kick:520,kind:"sling",id:"L"});
  S(296,500,296,560); S(296,560,256,590); S(256,590,296,500,{kick:520,kind:"sling",id:"R"});
  // top lanes posts
  [[110,60],[160,48],[210,48],[260,60]].forEach(([x,y])=>S(x,y,x,y+30,{e:.3}));
  const LANES=[{x:135,y:70,lit:false,ch:"M"},{x:185,y:62,lit:false,ch:"S"},{x:235,y:70,lit:false,ch:"★"}];
  const BUMP=[{x:140,y:205,r:24,t:0},{x:236,y:205,r:24,t:0},{x:188,y:285,r:24,t:0}];
  const TGT=[{x:96,y:380,ch:"F"},{x:96,y:412,ch:"I"},{x:96,y:444,ch:"R"},{x:96,y:476,ch:"E"}].map(t=>Object.assign(t,{down:false,w:8,h:26}));
  const SPIN={x:300,y:330,a:0,v:0};
  const FL=[{px:112,py:652,len:66,side:1,ang:0,up:false,w:0},{px:254,py:652,len:66,side:-1,ang:0,up:false,w:0}];
  const REST=.48, UP=-.42, FSPD=28;

  /* ---------- state ---------- */
  let cv,cx,box,ui,raf=0,last=0,open=false,best=0;
  let ball,balls,score,mult,state,plunge,charge,save,msg,msgT,shake,fireT,litLanes;
  function reset(){ score=0; balls=3; mult=1; litLanes=0; TGT.forEach(t=>t.down=false); LANES.forEach(l=>l.lit=false); newBall(); state="ready"; }
  function newBall(){ ball={x:383,y:690,vx:0,vy:0,inLane:true}; charge=0; plunge=false; save=0; }
  function say(s,t){ msg=s; msgT=t||1.6; }
  function add(p){ score+=p*mult; }

  /* ---------- physics ---------- */
  function closest(px,py,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay, l=dx*dx+dy*dy||1; let t=((px-ax)*dx+(py-ay)*dy)/l; t=Math.max(0,Math.min(1,t)); return [ax+dx*t,ay+dy*t]; }
  function collideSeg(s){
    const [cx_,cy_]=closest(ball.x,ball.y,s.a[0],s.a[1],s.b[0],s.b[1]); let nx=ball.x-cx_, ny=ball.y-cy_, d=Math.hypot(nx,ny);
    if(d>=R||d===0) return; nx/=d; ny/=d;
    if(s.oneway&&ball.vy<=0) return;
    ball.x+=nx*(R-d); ball.y+=ny*(R-d); const vn=ball.vx*nx+ball.vy*ny;
    if(vn<0){ ball.vx-=(1+s.e)*vn*nx; ball.vy-=(1+s.e)*vn*ny; if(-vn>260) SFX.wall(); }
    if(s.kick&&-vn>60){ ball.vx+=nx*s.kick; ball.vy+=ny*s.kick; add(10); SFX.sling(); s.t=.15; shake=3; }
  }
  function tip(f){ const th=f.side>0?f.ang:Math.PI-f.ang; return [f.px+Math.cos(th)*f.len,f.py+Math.sin(th)*f.len]; }
  function collideFlip(f){
    const [ex,ey]=tip(f); const [qx,qy]=closest(ball.x,ball.y,f.px,f.py,ex,ey);
    const along=Math.hypot(qx-f.px,qy-f.py)/f.len, rad=7-3*along;
    let nx=ball.x-qx, ny=ball.y-qy, d=Math.hypot(nx,ny); if(d>=R+rad||d===0) return; nx/=d; ny/=d;
    ball.x+=nx*(R+rad-d); ball.y+=ny*(R+rad-d);
    const omega=f.w*(f.side>0?1:-1), rx=qx-f.px, ry=qy-f.py, svx=-omega*ry, svy=omega*rx; // surface velocity
    const rvx=ball.vx-svx, rvy=ball.vy-svy, vn=rvx*nx+rvy*ny;
    if(vn<0){ const e=.25; ball.vx-=(1+e)*vn*nx; ball.vy-=(1+e)*vn*ny; }
  }
  function step(dt){
    // flippers
    for(const f of FL){ const tgt=f.up?UP:REST, prev=f.ang; f.ang+=Math.sign(tgt-f.ang)*Math.min(Math.abs(tgt-f.ang),FSPD*dt); f.w=(f.ang-prev)/dt; }
    if(ball.inLane){ if(plunge){ charge=Math.min(1,charge+dt*1.4); } ball.vx=0; if(ball.y>=690){ ball.y=690; if(!plunge&&ball.vy>=0) ball.vy=0; } }
    ball.vy+=G*dt; ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
    const sp=Math.hypot(ball.vx,ball.vy); if(sp>1500){ ball.vx*=1500/sp; ball.vy*=1500/sp; }
    if(ball.inLane&&ball.y<250) ball.inLane=false;
    for(const s of segs) collideSeg(s);
    for(const f of FL) collideFlip(f);
    for(const b of BUMP){ let nx=ball.x-b.x, ny=ball.y-b.y, d=Math.hypot(nx,ny); if(d<b.r+R&&d>0){ nx/=d; ny/=d; ball.x=b.x+nx*(b.r+R); ball.y=b.y+ny*(b.r+R);
      const vn=ball.vx*nx+ball.vy*ny; if(vn<0){ ball.vx-=2*vn*nx; ball.vy-=2*vn*ny; } ball.vx+=nx*380; ball.vy+=ny*380; b.t=.18; add(100); SFX.pop(); shake=2; } }
    for(const t of TGT){ if(t.down) continue; if(ball.x+R>t.x-t.w/2&&ball.x-R<t.x+t.w/2&&ball.y+R>t.y-t.h/2&&ball.y-R<t.y+t.h/2){
        t.down=true; ball.vx=Math.abs(ball.vx)*.6+120; add(500); SFX.target();
        if(TGT.every(t=>t.down)){ add(5000); mult=Math.min(5,mult+1); fireT=1.6; say("FIREBALL!  x"+mult,2); SFX.fire(); setTimeout(()=>TGT.forEach(t=>t.down=false),1200); } } }
    for(const l of LANES){ if(!l.lit&&Math.abs(ball.x-l.x)<12&&Math.abs(ball.y-l.y)<14&&ball.vy>0){ l.lit=true; add(250); SFX.lane();
        if(LANES.every(l=>l.lit)){ add(2500); say("MOTEL SMILE BONUS",1.6); SFX.jingle(); setTimeout(()=>LANES.forEach(l=>l.lit=false),900); } } }
    if(Math.abs(ball.x-SPIN.x)<14&&Math.abs(ball.y-SPIN.y)<6&&Math.abs(ball.vy)>80){ SPIN.v=Math.max(SPIN.v,Math.abs(ball.vy)/30); }
    if(ball.y>H+30){
      if(save>0){ newBall(); say("BALL SAVED",1.4); SFX.lane(); }
      else { balls--; SFX.drain(); if(balls<=0){ state="over"; best=Math.max(best,score); say("GAME OVER",99); } else { newBall(); say("BALL "+(4-balls),1.2); } }
    }
  }
  function update(dt){
    if(state!=="play") { for(const f of FL){ const tgt=f.up?UP:REST; f.ang+=Math.sign(tgt-f.ang)*Math.min(Math.abs(tgt-f.ang),FSPD*dt);} return; }
    const n=10, h=dt/n; for(let i=0;i<n;i++) step(h);
    BUMP.forEach(b=>b.t=Math.max(0,b.t-dt)); segs.forEach(s=>s.t&&(s.t=Math.max(0,s.t-dt)));
    if(save>0) save-=dt; msgT-=dt; shake=Math.max(0,(shake||0)-dt*20); fireT=Math.max(0,(fireT||0)-dt);
    if(SPIN.v>0){ const before=Math.floor(SPIN.a/Math.PI); SPIN.a+=SPIN.v*dt*6; SPIN.v=Math.max(0,SPIN.v-dt*6); if(Math.floor(SPIN.a/Math.PI)>before){ add(25); tone(2000,.03,"square",.04); } }
  }

  /* ---------- drawing ---------- */
  const NEON="#ff3d7f", CYAN="#46dcff", AMBER="#ffaa46";
  function glowLine(c,ax,ay,bx,by,col,w,bl){ c.strokeStyle=col; c.lineWidth=w; c.shadowColor=col; c.shadowBlur=bl; c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke(); }
  let bg=null;
  function makeBg(){ bg=document.createElement("canvas"); bg.width=W*2; bg.height=H*2; const c=bg.getContext("2d"); c.scale(2,2);
    const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,"#12060f"); g.addColorStop(.55,"#1d0812"); g.addColorStop(1,"#3a0d0a"); c.fillStyle=g; c.fillRect(0,0,W,H);
    // flames
    for(let i=0;i<46;i++){ const x=Math.random()*366, h=60+Math.random()*170, y=H; const fg=c.createLinearGradient(x,y,x,y-h); fg.addColorStop(0,"rgba(255,120,30,.35)"); fg.addColorStop(.6,"rgba(255,50,90,.12)"); fg.addColorStop(1,"rgba(255,50,90,0)");
      c.fillStyle=fg; c.beginPath(); c.moveTo(x-18,y); c.quadraticCurveTo(x-10,y-h*.5,x+Math.random()*16-8,y-h); c.quadraticCurveTo(x+12,y-h*.5,x+18,y); c.fill(); }
    // grit
    for(let i=0;i<2600;i++){ c.fillStyle=`rgba(${Math.random()<.5?255:0},${Math.random()*80|0},${Math.random()*80|0},${Math.random()*.06})`; c.fillRect(Math.random()*W,Math.random()*H,1.5,1.5); }
    // logo
    c.save(); c.translate(183,520); c.rotate(-.12); c.font="italic 900 46px 'Arial Black',Impact,sans-serif"; c.textAlign="center"; c.fillStyle="rgba(255,90,40,.18)"; c.fillText("FIREBALL",0,0); c.restore();
    c.font="11px monospace"; c.fillStyle="rgba(255,200,220,.25)"; c.textAlign="center"; c.fillText("MOTEL SMILE · ROOFTOP ARCADE",183,548);
    // plunger lane
    c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(366,250,34,H-250);
  }
  function smiley(c,x,y,r,hot){
    c.shadowColor=NEON; c.shadowBlur=hot?30:12; c.fillStyle=hot?"#ff7aa6":"#c21a55"; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
    c.shadowBlur=0; c.lineWidth=3; c.strokeStyle=hot?"#fff":"#ffb3cc"; c.stroke();
    c.fillStyle="#14040b"; c.beginPath(); c.arc(x-7,y-5,3.4,0,7); c.arc(x+7,y-5,3.4,0,7); c.fill();
    c.beginPath(); c.arc(x,y+2,10,.15*Math.PI,.85*Math.PI); c.lineWidth=3; c.strokeStyle="#14040b"; c.stroke(); }
  function draw(){
    const cw=cv.width, ch=cv.height, dpr=cv._dpr; cx.setTransform(1,0,0,1,0,0); cx.fillStyle="#05060a"; cx.fillRect(0,0,cw,ch);
    const head=70*dpr, s=Math.min(cw/W,(ch-head-10*dpr)/H), ox=(cw-W*s)/2+(shake?(Math.random()-.5)*shake*dpr:0), oy=head+(ch-head-H*s)/2;
    // header (backglass)
    cx.textAlign="center"; cx.fillStyle="#fff"; cx.shadowColor=AMBER; cx.shadowBlur=14*dpr;
    cx.font=`italic 900 ${22*dpr}px 'Arial Black',Impact,sans-serif`; cx.fillStyle="#ffd36a"; cx.fillText("FIREBALL",cw/2,28*dpr);
    cx.shadowBlur=0; cx.font=`${13*dpr}px monospace`; cx.fillStyle="#ffc2da";
    cx.fillText(`SCORE ${score}   BALL ${state==="over"?"-":Math.min(3,4-balls)}/3   x${mult}   BEST ${best}`,cw/2,58*dpr);
    cx.setTransform(s,0,0,s,ox,oy);
    cx.save(); cx.beginPath(); cx.rect(0,0,W,H); cx.clip(); cx.drawImage(bg,0,0,W,H);
    if(fireT>0){ cx.fillStyle=`rgba(255,110,30,${.25*fireT})`; cx.fillRect(0,0,W,H); }
    // walls
    cx.lineCap="round";
    for(const sg of segs){ const hot=sg.t>0; glowLine(cx,sg.a[0],sg.a[1],sg.b[0],sg.b[1],sg.kind==="sling"?(hot?"#fff":CYAN):NEON,sg.kind==="sling"?4:3,hot?24:8); }
    cx.shadowBlur=0;
    // lanes
    for(const l of LANES){ cx.fillStyle=l.lit?AMBER:"rgba(255,170,70,.18)"; cx.shadowColor=AMBER; cx.shadowBlur=l.lit?18:0; cx.beginPath(); cx.arc(l.x,l.y+22,7,0,7); cx.fill();
      cx.shadowBlur=0; cx.fillStyle=l.lit?"#14040b":"rgba(255,220,180,.6)"; cx.font="bold 9px sans-serif"; cx.textAlign="center"; cx.fillText(l.ch,l.x,l.y+25); }
    // targets
    for(const t of TGT){ cx.fillStyle=t.down?"rgba(255,90,40,.15)":"#ff5a28"; cx.shadowColor="#ff5a28"; cx.shadowBlur=t.down?0:14; cx.fillRect(t.x-t.w/2,t.y-t.h/2,t.w,t.h);
      cx.shadowBlur=0; cx.fillStyle=t.down?"rgba(255,160,120,.35)":"#ffd36a"; cx.font="bold 12px sans-serif"; cx.textAlign="left"; cx.fillText(t.ch,t.x+9,t.y+4); }
    // spinner
    const sw=Math.abs(Math.cos(SPIN.a))*14+2; cx.fillStyle=CYAN; cx.shadowColor=CYAN; cx.shadowBlur=10; cx.fillRect(SPIN.x-14,SPIN.y-sw/4,28,sw/2); cx.shadowBlur=0;
    cx.fillStyle="rgba(70,220,255,.5)"; cx.font="8px monospace"; cx.textAlign="center"; cx.fillText("SPIN",SPIN.x,SPIN.y+16);
    // bumpers
    for(const b of BUMP) smiley(cx,b.x,b.y,b.r,b.t>0);
    // flippers
    for(const f of FL){ const [ex,ey]=tip(f); cx.strokeStyle="#fff"; cx.shadowColor=NEON; cx.shadowBlur=14; cx.lineWidth=13; cx.beginPath(); cx.moveTo(f.px,f.py); cx.lineTo(ex,ey); cx.stroke();
      cx.strokeStyle="#ff9cc0"; cx.lineWidth=6; cx.shadowBlur=0; cx.stroke(); cx.fillStyle="#14040b"; cx.beginPath(); cx.arc(f.px,f.py,3,0,7); cx.fill(); }
    // plunger
    const py=700+charge*28; cx.fillStyle="#9aa0aa"; cx.fillRect(375,py,16,H-py); cx.fillStyle=NEON; cx.fillRect(375,py,16,4);
    if(ball.inLane&&state==="play"){ cx.fillStyle="rgba(255,255,255,.6)"; cx.font="9px monospace"; cx.textAlign="center"; cx.fillText("HOLD",383,600); cx.fillText("▲",383,612); }
    // ball
    const bg2=cx.createRadialGradient(ball.x-3,ball.y-4,1,ball.x,ball.y,R); bg2.addColorStop(0,"#fff"); bg2.addColorStop(.4,"#c8ccd6"); bg2.addColorStop(1,"#4a4e58");
    cx.fillStyle=bg2; cx.shadowColor=fireT>0?AMBER:"rgba(255,255,255,.5)"; cx.shadowBlur=fireT>0?20:6; cx.beginPath(); cx.arc(ball.x,ball.y,R,0,7); cx.fill(); cx.shadowBlur=0;
    if(save>0&&state==="play"){ cx.fillStyle=`rgba(70,220,255,${.4+.4*Math.sin(performance.now()/120)})`; cx.font="bold 10px monospace"; cx.textAlign="center"; cx.fillText("BALL SAVE",183,700); }
    cx.restore();
    // messages
    if(state==="ready"||state==="over"||msgT>0){
      cx.textAlign="center"; cx.shadowColor=NEON; cx.shadowBlur=18;
      const big=state==="ready"?"TAP TO PLAY":state==="over"?"GAME OVER":msg;
      cx.fillStyle="#fff"; cx.font="italic 900 30px 'Arial Black',Impact,sans-serif"; cx.fillText(big,183,300);
      cx.shadowBlur=0; cx.font="12px monospace"; cx.fillStyle="#ffc2da";
      if(state==="ready"){ const L=ui.touch?["Tap left side: left flipper","Tap right side: right flipper","Hold right side: pull the plunger"]:["← or Z: left flipper","→ or M: right flipper","Hold SPACE: pull the plunger"]; L.forEach((t,i)=>cx.fillText(t,183,332+i*18)); }
      if(state==="over"){ cx.fillText("Score "+score+(score>=best&&score>0?"  — new best!":""),183,330); cx.fillText("Tap to play again",183,350); }
    }
  }
  function loop(t){ raf=0; if(!open) return; const dt=Math.min(.033,(t-(last||t))/1000); last=t; update(dt); draw(); raf=requestAnimationFrame(loop); }

  /* ---------- input ---------- */
  function setFlip(i,v){ const f=FL[i]; if(v&&!f.up) SFX.flip(); f.up=v; }
  function press(side,v){
    if(state==="ready"&&v){ state="play"; SFX.jingle(); say("BALL 1",1.2); return; }
    if(state==="over"&&v){ reset(); state="play"; SFX.jingle(); return; }
    if(side===1&&ball.inLane&&state==="play"){ if(v){ plunge=true; } else if(plunge){ plunge=false; ball.vy=-(650+charge*900); ball.y-=2; save=8; SFX.launch(); charge=0; } return; }
    setFlip(side,v);
  }
  const keys={ArrowLeft:0,KeyZ:0,ShiftLeft:0,ArrowRight:1,KeyM:1,Slash:1,ShiftRight:1,Space:1,ArrowDown:1};
  function kd(e){ if(!open) return; if(e.key==="Escape"){ close(); return; } if(e.code in keys){ e.preventDefault(); if(!e.repeat) press(keys[e.code],true); } }
  function ku(e){ if(!open) return; if(e.code in keys){ e.preventDefault(); press(keys[e.code],false); } }
  const touches=new Map();
  function tside(t){ const r=cv.getBoundingClientRect(); return (t.clientX-r.left)<r.width/2?0:1; }
  function ts(e){ e.preventDefault(); window.MSAC&&window.MSAC(); for(const t of e.changedTouches){ const s=tside(t); touches.set(t.identifier,s); press(s,true); } }
  function te(e){ e.preventDefault(); for(const t of e.changedTouches){ const s=touches.get(t.identifier); touches.delete(t.identifier); if(s!==undefined&&![...touches.values()].includes(s)) press(s,false); } }
  function md(e){ if(e.pointerType==="touch") return; window.MSAC&&window.MSAC(); const s=e.offsetX<cv.clientWidth/2?0:1; md.s=s; press(s,true); }
  function mu(e){ if(e.pointerType==="touch") return; if(md.s!==undefined){ press(md.s,false); md.s=undefined; } }

  function size(){ const dpr=Math.min(2,window.devicePixelRatio||1); cv._dpr=dpr; cv.width=box.clientWidth*dpr; cv.height=box.clientHeight*dpr; }
  function build(){
    box=document.createElement("div"); box.id="pb"; box.setAttribute("role","dialog"); box.setAttribute("aria-label","Fireball pinball");
    box.innerHTML='<canvas aria-label="Pinball table"></canvas><button class="pb-x" aria-label="Close pinball, back to the arcade">✕</button>';
    document.body.appendChild(box); cv=box.querySelector("canvas"); cx=cv.getContext("2d");
    box.querySelector(".pb-x").addEventListener("click",close);
    cv.addEventListener("touchstart",ts,{passive:false}); cv.addEventListener("touchend",te,{passive:false}); cv.addEventListener("touchcancel",te,{passive:false});
    cv.addEventListener("pointerdown",md); addEventListener("pointerup",mu);
    addEventListener("keydown",kd); addEventListener("keyup",ku); addEventListener("resize",()=>open&&size());
    ui={touch:matchMedia("(pointer:coarse)").matches}; makeBg();
  }
  function openG(){ if(!box) build(); open=true; box.classList.add("on"); size(); reset(); msgT=0; last=0; if(!raf) raf=requestAnimationFrame(loop); }
  function close(){ open=false; box&&box.classList.remove("on"); FL.forEach(f=>f.up=false); if(box&&box.dataset.from) box.dataset.from=""; }
  window.MSPinball={open:openG,close,isOpen:()=>open,_dbg:()=>({ball,score,state,balls,charge})};
})();
