/* BETTER FREE — Motel Smile pinball. Loaded on demand from the game corner. window.MSPinball.open()
   v3: THE CLIMB. 4 tables stacked up the motel: 1 Rooftop, 2 Motel Hallway, 3 Smile Lounge, 4 Giant Grace (boss).
   Clear a floor -> its ramp lights -> shoot it to climb. Drain upstairs -> fall one floor (no ball lost).
   Beat Giant Grace -> everyone's free -> you win. Design: claude/better-free-climb-design.md */
(()=>{
  const W=400,H=720,R=9,G=600,VMAX=950;
  const ac=()=>window.MSAC&&window.MSAC();
  function tone(f,d,type,vol,slide){ const a=ac(); if(!a) return; const t=a.currentTime, o=a.createOscillator(), g=a.createGain();
    o.type=type||"square"; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+d);
    g.gain.setValueAtTime(vol||.08,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g).connect(a.destination); o.start(t); o.stop(t+d+.02); }
  function noise(d,f,vol){ const a=ac(); if(!a) return; const t=a.currentTime, n=a.createBuffer(1,Math.max(1,a.sampleRate*d|0),a.sampleRate), x=n.getChannelData(0);
    for(let i=0;i<x.length;i++) x[i]=(Math.random()*2-1)*Math.pow(1-i/x.length,2);
    const s=a.createBufferSource(), b=a.createBiquadFilter(), g=a.createGain(); s.buffer=n; b.type="bandpass"; b.frequency.value=f; g.gain.value=vol; s.connect(b).connect(g).connect(a.destination); s.start(t); }
  const arp=(fs,step,vol,type)=>fs.forEach((f,i)=>setTimeout(()=>tone(f,.12,type||"square",vol||.06),i*step));
  const SFX={
    flip:()=>noise(.06,1800,.35), pop:()=>tone(880,.09,"square",.07,440), sling:()=>tone(300,.08,"sawtooth",.06,150),
    target:()=>tone(1200,.12,"triangle",.09,900), lane:()=>tone(1568,.1,"sine",.07), launch:()=>noise(.35,700,.5),
    drain:()=>tone(330,.7,"sawtooth",.07,80), wall:()=>noise(.02,3000,.08),
    jingle:()=>arp([523,659,784,1046,784,1046],90),
    fire:()=>{ arp([392,523,659,784,1046,1318],70,.07); setTimeout(()=>noise(.6,500,.5),420); },
    jarUp:()=>{ tone(200,.35,"square",.06,800); noise(.25,400,.25); },
    jarDown:()=>tone(700,.4,"square",.05,150),
    clink:()=>{ tone(2637,.18,"sine",.09); tone(3520,.12,"sine",.05); },
    crack:()=>{ noise(.12,4500,.5); tone(1800,.1,"triangle",.06,900); },
    shatter:()=>{ noise(.5,3800,.7); [2093,2637,3136,3951,4699].forEach((f,k)=>setTimeout(()=>tone(f*(1+Math.random()*.05),.4,"sine",.07),k*35)); },
    scoop:()=>{ tone(160,.25,"square",.08,60); noise(.15,300,.4); },
    eject:()=>{ noise(.2,900,.5); tone(120,.15,"square",.08,300); },
    ramp:()=>arp([659,784,988,1319],55,.06),
    rampDone:()=>arp([1319,1568,2093],60,.07),
    jackpot:()=>{ arp([523,659,784,1046,1318,1568,2093],65,.08); setTimeout(()=>noise(.8,600,.5),450); },
    mode:()=>arp([392,494,587,784,587,784,988],80,.07,"sawtooth"),
    tick:()=>tone(1500,.03,"square",.04), warn:()=>tone(220,.3,"sawtooth",.08,180), tilt:()=>{ tone(110,1.2,"sawtooth",.1,55); },
    bell:()=>{ tone(2489,.5,"sine",.1); tone(3729,.3,"sine",.04); },
    key:()=>{ [3520,4186,3951].forEach((f,k)=>setTimeout(()=>tone(f,.07,"triangle",.05),k*45)); },
    door:()=>{ tone(90,.5,"sawtooth",.05,140); noise(.4,700,.2); },
    locked:()=>{ tone(160,.1,"square",.07); setTimeout(()=>tone(160,.1,"square",.07),120); },
    power:()=>{ noise(.25,120,.9); tone(55,1.2,"sawtooth",.09,110); setTimeout(()=>arp([262,330,392,523,659,784],60,.07,"sawtooth"),300); },
    beat:()=>{ tone(110,.12,"sine",.14,60); tone(1760,.05,"square",.03); },
    record:()=>{ tone(600,.18,"triangle",.06,300); noise(.1,2500,.2); },
    climb:()=>{ arp([392,523,659,784,1046,1318,1568,2093],70,.07,"sawtooth"); },
    fall:()=>{ tone(880,1.1,"square",.07,70); noise(.9,300,.3); },
    stompWarn:()=>{ tone(70,.5,"sawtooth",.1,60); },
    stomp:()=>{ noise(.6,90,1); tone(45,.6,"sine",.2,30); },
    swish:()=>{ noise(.35,1400,.5); },
    hp:()=>{ tone(196,.25,"square",.09,98); noise(.2,2000,.4); },
    laugh:()=>{ [660,620,700,640,720].forEach((f,k)=>setTimeout(()=>tone(f,.09,"triangle",.07,f*.8),k*95)); },
    win:()=>{ arp([523,659,784,1046,784,1046,1318,1568,2093,2637],110,.09,"sawtooth"); setTimeout(()=>noise(1.4,500,.5),900); }
  };

  /* ---------- soundtrack: Better Free chiptune, one continuous loop across every floor ---------- */
  const MUS={buf:null,src:null,g:null,lp:null,loading:false,want:false};
  function musLoad(){ const a=ac(); if(!a||MUS.buf||MUS.loading) return; MUS.loading=true;
    fetch("audio/better-free-chip.mp3?v=1").then(r=>r.arrayBuffer()).then(b=>a.decodeAudioData(b)).then(b=>{ MUS.buf=b; if(MUS.want) musStart(); }).catch(()=>{ MUS.loading=false; }); }
  function musStart(){ const a=ac(); MUS.want=true; if(!a) return; if(!MUS.buf){ musLoad(); return; } if(MUS.src) return;
    const s=a.createBufferSource(); s.buffer=MUS.buf; s.loop=true; s.loopStart=.86; s.loopEnd=Math.min(212.83,MUS.buf.duration);
    const lp=a.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=18000; const g=a.createGain(); const t=a.currentTime;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.5,t+.4); s.connect(lp).connect(g).connect(a.destination); s.start(t); MUS.src=s; MUS.g=g; MUS.lp=lp; }
  function musStop(fade){ MUS.want=false; const a=ac(); if(!a||!MUS.src) return; const s=MUS.src, g=MUS.g, t=a.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.linearRampToValueAtTime(0,t+Math.max(.02,fade)); try{ s.stop(t+Math.max(.03,fade)+.05); }catch(e){} MUS.src=null; }
  function musFilter(hz,secs,back){ const a=ac(); if(!a||!MUS.src) return; const t=a.currentTime, f=MUS.lp.frequency;
    f.cancelScheduledValues(t); f.setValueAtTime(f.value,t); f.exponentialRampToValueAtTime(hz,t+.15); if(back){ f.setValueAtTime(hz,t+secs); f.exponentialRampToValueAtTime(back,t+secs+.8); } }
  function musLevel(v){ const a=ac(); if(!a||!MUS.src) return; const g=MUS.g.gain, t=a.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value,t); g.linearRampToValueAtTime(v,t+.5); }
  // per-floor mix: lounge is filtered until the power comes on, boss runs hot
  function musScene(){ if(!MUS.src) return; const f=level===3&&!L3S.power?1400:18000; musFilter(f,0); musLevel(level===4?.62:mode||mb?.6:.5); }

  /* ---------- shared table: walls, plunger lane, slings, flippers (same on every floor) ---------- */
  const seg=(ax,ay,bx,by,o={})=>Object.assign({a:[ax,ay],b:[bx,by],e:.5},o);
  const BASE=[];
  const ARC=[]; for(let i=0;i<=22;i++){ const t=Math.PI+Math.PI*i/22; ARC.push([200+200*Math.cos(t),205+190*Math.sin(t)]); }
  for(let i=0;i<ARC.length-1;i++) BASE.push(seg(ARC[i][0],ARC[i][1],ARC[i+1][0],ARC[i+1][1]));
  BASE.push(seg(0,205,0,560), seg(400,205,400,H+40), seg(366,250,366,H+40,{e:.3}), seg(366,250,400,214,{e:.4,oneway:true}),
    seg(0,560,22,575), seg(22,575,22,586.5), seg(22,586.5,112.5,645.4,{e:0}), seg(366,560,344,575), seg(344,575,344,586.5), seg(344,586.5,253.5,645.4,{e:0}),
    seg(46,520,46,570,{e:.3}), seg(320,520,320,570,{e:.3}),
    seg(70,500,70,560), seg(70,560,110,590), seg(70,500,110,590,{kick:330,kind:"sling",id:"L"}),
    seg(296,500,296,560), seg(296,560,256,590), seg(256,590,296,500,{kick:330,kind:"sling",id:"R"}));
  const RAMP_POSTS=()=>[seg(146,440,148,418,{e:.35,kind:"ramp"}), seg(194,440,192,418,{e:.35,kind:"ramp"})];
  const FL=[{px:110,py:652,len:64,side:1,ang:0,up:false,w:0},{px:256,py:652,len:64,side:-1,ang:0,up:false,w:0}];
  const REST=.53, UP=-.42, FSPD=20;
  const RAMP={mx0:150,mx1:190,my:432,exit:[332,512],path:[[170,432,2],[176,386,22],[198,338,46],[238,300,60],[290,272,64],[334,300,60],[346,372,46],[342,446,24],[332,512,6]],flash:0};
  const GIRLS=["GRACE","SOPHIA","MEGAN","ARI","LIV","GIANNA","JILL"];

  // object makers
  const T=(id,x,y,w,h,o={})=>Object.assign({id,x,y,w,h,kind:"stand",on:true,down:false,t:0,lit:false,cool:0,e:.5,label:""},o);
  const J=(id,x,y,o={})=>Object.assign({id,x,y,r:13,up:false,h:0,hits:0,need:3,cool:0,flash:0,timer:0,max:0,girl:"",gold:false,value:0},o);
  const B=(id,x,y,r)=>({id,x,y,r:r||24,t:0});
  const RO=(id,x,y,w,h,o={})=>Object.assign({id,x,y,w,h,lit:false,hot:false,t:0},o);

  /* ---------- the four floors ---------- */
  const L1={id:1,name:"THE ROOFTOP",exit:"STAIRS UP",ramp:true,
    segs:[...[[110,60],[160,48],[210,48],[260,60]].map(([x,y])=>seg(x,y,x,y+30,{e:.3})),...RAMP_POSTS()],
    bumps:[B("b1",140,205),B("b2",236,205),B("b3",188,285)],
    tgts:["F","R","E","E"].map((c,i)=>T("free"+i,96,380+i*32,8,26,{kind:"drop",label:c})),
    jars:GIRLS.map((n,i)=>{ const p=[[188,145],[92,150],[290,160],[70,300],[112,250],[244,418],[300,402]][i]; return J("j"+i,p[0],p[1],{girl:n,r:16}); }),
    rolls:[RO("lane0",135,70,24,28,{label:"M"}),RO("lane1",185,62,24,28,{label:"S"}),RO("lane2",235,70,24,28,{label:"★"})],
    scoop:{x:24,y:258,r:14,lit:false,flash:0,label:"MOTEL"}, spin:{x:300,y:330,a:0,v:0}};
  const L2={id:2,name:"THE MOTEL HALLWAY",exit:"STAIRS UP",ramp:true,
    segs:[...RAMP_POSTS()],
    bumps:[B("bell",183,205,22)],
    tgts:[T("d201",90,150,56,10,{kind:"door",label:"201",state:"locked"}),T("d202",276,150,56,10,{kind:"door",label:"202",state:"locked"}),
          T("d203",80,300,56,10,{kind:"door",label:"203",state:"locked"}),T("d204",286,300,56,10,{kind:"door",label:"204",state:"locked"}),
          T("k0",147,335,12,12,{kind:"key"}),T("k1",183,335,12,12,{kind:"key"}),T("k2",219,335,12,12,{kind:"key"})],
    jars:["201","202","203","204"].map(n=>{ const d={"201":[90,136],"202":[276,136],"203":[80,286],"204":[286,286]}[n]; return J("r"+n,d[0],d[1],{need:1,r:16}); }),
    rolls:[], scoop:{x:24,y:420,r:14,lit:false,flash:0,label:"GET BACK"}, spin:{x:300,y:392,a:0,v:0}};
  const TILES=[]; for(let r=0;r<4;r++) for(let c=0;c<4;c++) TILES.push(RO("t"+(r*4+c),143+c*30,220+r*40,30,40,{r,c}));
  const L3={id:3,name:"THE SMILE LOUNGE",exit:"BOSS",ramp:true,
    segs:[...RAMP_POSTS()],
    bumps:[],
    tgts:[T("couch",80,158,84,36,{kind:"prop",e:.75}),T("rp",292,160,64,34,{kind:"rp"}),T("act",353,300,26,44,{kind:"act"}),
          ...["A","B","C"].map((c,i)=>T("rec"+i,96,330+i*32,8,26,{kind:"drop",label:c})),
          T("beat0",78,250,10,26,{kind:"beat"}),T("beat1",300,250,10,26,{kind:"beat"})],
    jars:[], rolls:TILES, scoop:{x:24,y:258,r:14,lit:false,flash:0,label:"DJ"}, spin:null};
  const L4={id:4,name:"GIANT GRACE",exit:"",ramp:false,
    segs:[],
    bumps:[B("gb0",96,440,22),B("gb1",270,440,22)],
    tgts:[T("wristL",86,200,80,14,{kind:"weak"}),T("wristR",280,200,80,14,{kind:"weak"}),T("tooth",183,128,50,16,{kind:"weak"}),
          T("shoe",86,330,70,56,{kind:"shoe",on:false,e:.6})],
    jars:[], rolls:[], scoop:{x:24,y:258,r:14,lit:false,flash:0,label:"SHIELD"}, spin:null};
  const LEVELS={1:L1,2:L2,3:L3,4:L4};
  LEVELS[1].segsAll=[...BASE,...L1.segs]; LEVELS[2].segsAll=[...BASE,...L2.segs]; LEVELS[3].segsAll=[...BASE,...L3.segs]; LEVELS[4].segsAll=[...BASE];

  /* ---------- state ---------- */
  let cv,cx,box,ui,raf=0,last=0,open=false,best=0;
  let BALLS=[],ballsLeft,score,mult,state,plunge,charge,save,msg,msgT,msg2,shake,fireT,lanePhase,skill,
      bumpHits,mb,mbT,mode,modeT,combo,comboT,nudges,nudgeT,tilted,flash,dark,level,LV,cleared,visited,freed,trans,won,lostBall,beenWrong,hintT,stuck,lanePhaseT,whoaT;
  let L1S={},L2S={},L3S={},BOSS={};
  const live=()=>BALLS.filter(b=>!b.dead);
  function reset(){
    score=0; save=0; ballsLeft=3; mult=1; bumpHits=0; mb=false; mbT=0; mode=null; modeT=0; combo=0; comboT=0; nudges=0; nudgeT=0; tilted=false;
    flash=0; dark=0; msg2=""; msg=""; msgT=0; shake=0; fireT=0; cleared={1:false,2:false,3:false,4:false}; visited={}; freed=new Set(); trans=null; won=false; lostBall=false; beenWrong=false; hintT=0; stuck=0; lanePhaseT=0; lanePhase=0; whoaT=0;
    for(const L of Object.values(LEVELS)){ L.tgts.forEach(t=>Object.assign(t,{down:false,t:0,lit:false,cool:0,on:t.kind!=="shoe"})); L.jars.forEach(j=>Object.assign(j,{up:false,h:0,hits:0,cool:0,flash:0,gold:false})); L.rolls.forEach(r=>Object.assign(r,{lit:false,hot:false,t:0})); if(L.scoop) Object.assign(L.scoop,{lit:false,flash:0}); }
    L2.tgts.filter(t=>t.kind==="door").forEach(d=>{ d.state="locked"; d.girl=""; });
    L1S={autoT:3,noJar:0,goldNext:false}; L2S={keys:0,rescues:0,bells:0,liar:"",noKey:0,motT:45,spins:[],spinX2:0,gbFirst:false};
    L3S={records:0,rp:false,power:false,beats:0,dj:false,finale:false,hotT:0,noBeat:0,allHot:0,party:0};
    BOSS={hp:12,phase:1,atk:null,atkT:15,noDmg:0,pity:0,wrist:0,toothFlash:0,toothT:8,intro:false,dodged:0};
    setLevel(1); BALLS=[]; newBall(false); state="ready"; }
  function setLevel(n){ level=n; LV=LEVELS[n]; visited[n]=(visited[n]||0)+1; if(LV.spin){ LV.spin.v=0; } }
  function mkBall(x,y){ return {x,y,vx:0,vy:0,z:0,inLane:true,held:0,ramp:null,auto:false,_in:{}}; }
  function newBall(auto){ BALLS=[mkBall(383,690)]; BALLS[0].auto=!!auto; charge=0; plunge=false; skill=0; tilted=false; nudges=0; }
  function say(s,t,s2){ msg=s; msgT=t||1.6; msg2=s2||""; }
  function add(p,bonus){ score+=Math.round(p*(bonus?1:mult*(mb?2:1))); }
  function progress(){ hintT=0; }
  const nextTrapped=()=>GIRLS.find(n=>!freed.has(n)&&!L2.tgts.some(d=>d.kind==="door"&&d.state==="open"&&d.girl===n));
  function setFree(name){ if(!name||freed.has(name)) return false; freed.add(name); return true; }
  function startMode(id,name,t,sub){ if(mode) return false; mode={id,name,lv:level}; modeT=t; SFX.mode(); say(name,2.4,sub); musScene(); return true; }
  function endMode(){ if(!mode) return; const m=mode; mode=null; if(m.id==="liar") L2S.liar=""; say(m.name,1.4,"COMPLETE"); musScene(); }
  const modeIs=id=>mode&&mode.id===id&&mode.lv===level;

  /* ---------- transitions: climb up / fall down / win ---------- */
  function climb(){ const to=level+1; add(level===1?100000:level===2?200000:300000,true); SFX.climb(); musFilter(900,.9,level+1===3&&!L3S.power?1400:18000);
    trans={kind:"climb",t:0,dur:window.MSPB3D&&window.MSPB3D.ok?2.6:1.6,to,swapped:false}; say(to===4?"GIANT GRACE":"CLIMBING",1.6,to===4?"FINAL FLOOR":LEVELS[to].name); }
  function fall(){ const to=level-1; SFX.fall(); if(level===4){ SFX.laugh(); } musFilter(500,1.2,to===3&&!L3S.power?1400:18000);
    trans={kind:"fall",t:0,dur:window.MSPB3D&&window.MSPB3D.ok?2.2:1.4,to,swapped:false}; say("GET BACK!",1.6,"DOWN TO "+LEVELS[to].name); }
  function arrive(){
    const n=trans.to; if(mode) endMode(); mb=false; mbT=0; setLevel(n); BALLS=[]; newBall(true); comboT=0;
    if(trans.kind==="fall"){ Object.assign(BALLS[0],{x:60,y:230,vx:90,vy:40,inLane:false,auto:false}); }
    save=Math.max(save,trans.kind==="fall"&&trans.from===4?10:5); musScene();
    if(n===2) L2enter(); if(n===3) L3enter(); if(n===4) bossEnter(); if(n===1&&trans.kind==="climb") {}
    if(trans.kind==="fall"&&n===3&&trans.from===4) L3S.safe=10; }
  function win(){ trans={kind:"win",t:0,dur:9,to:4,swapped:true}; BALLS.forEach(b=>{ b.held=99; }); SFX.win(); flash=1.5;
    GIRLS.forEach(setFree); say("BETTER FREE!",3,"EVERYONE'S FREE!"); musLevel(.75); }

  /* ---------- floor 1: rooftop ---------- */
  function raiseJar(reason,t,gold){ const c=L1.jars.filter(j=>!freed.has(j.girl)&&!j.up&&j.cool<=0); if(!c.length) return null;
    const j=c[Math.floor(Math.random()*c.length)]; j.up=true; j.hits=0; j.need=2; j.max=t||22; j.timer=j.max; j.flash=.6; j.gold=!!gold; SFX.jarUp();
    if(reason) say(j.girl+" — BREAK THE JAR!",1.8,reason); return j; }
  function L1jar(j){ L1S.noJar=0; progress(); j.hits++; j.flash=.35; shake=4; const k=j.gold?2:1;
    if(j.hits<j.need){ add(10000*k); SFX.crack(); say(j.girl,1,"CRACKED! ONE MORE"); return; }
    j.up=false; add(25000*k); SFX.shatter(); fireT=1.2; flash=.6;
    if(setFree(j.girl)){ const pts=75000+Math.round(25000*(j.timer/j.max)); add(pts,true); say(j.girl+" IS FREE!",2.4,freed.size+" OF 7 · +"+pts.toLocaleString()); }
    if(freed.size>=3&&!cleared[1]){ cleared[1]=true; add(100000,true); setTimeout(()=>{ say("STAIRS UP LIT!",2.6,"SHOOT THE RAMP TO CLIMB"); SFX.jackpot(); },1600); } }
  /* ---------- floor 2: motel hallway ---------- */
  const doors=()=>L2.tgts.filter(t=>t.kind==="door");
  function L2enter(){ if(visited[2]===1){ L2S.noKey=0; setTimeout(()=>{ if(level===2){ say("THE MOTEL HALLWAY",2.4,"FREE 2 GIRLS · HIT THE KEY RACK"); giveKey("FRONT DESK KEY"); } },400); } L2S.motT=Math.max(L2S.motT,20); }
  function giveKey(why){ const d=doors().find(d=>d.state==="locked"); L2S.noKey=0; SFX.key(); add(20000);
    if(!d){ add(30000); say(why||"KEY!",1.6,"+50,000"); return; } d.state="unlocked"; say(why||"KEY!",2,"ROOM "+d.label+" UNLOCKED"); progress(); }
  function L2door(d){ progress();
    if(modeIs("liar")){ if(d.id===L2S.liar){ add(5000); say("DIRTY LITTLE LIAR!",1.6,"WRONG DOOR!"); SFX.locked(); return; } add(75000); say("RIGHT DOOR",1.2,"+75,000"); }
    if(modeIs("getback")) add(20000);
    if(d.state==="locked"){ add(10000); SFX.locked(); say("LOCKED",1.2,"HIT THE KEY RACK"); return; }
    if(d.state==="unlocked"){ add(30000); SFX.door(); d.state="open"; d.on=false; const g=nextTrapped(); const j=L2.jars.find(j=>j.id==="r"+d.label);
      if(g){ d.girl=g; Object.assign(j,{up:true,hits:0,need:1,girl:g,flash:.6,timer:999,max:999}); say("ROOM "+d.label,1.8,g+" IS INSIDE! HIT THE JAR"); SFX.jarUp(); }
      else { d.state="done"; say("ROOM "+d.label,1.4,"EMPTY · +30,000"); } } }
  function L2jar(j){ progress(); j.hits++; j.flash=.35; shake=4; add(25000);
    if(j.hits<j.need){ SFX.crack(); say(j.girl,1,"ONE MORE HIT"); return; }
    j.up=false; SFX.shatter(); flash=.6; fireT=1; const d=doors().find(d=>"r"+d.label===j.id); d.state="done";
    if(setFree(j.girl)){ L2S.rescues++; add(150000,true); if(modeIs("getback")&&!L2S.gbFirst){ L2S.gbFirst=true; add(100000,true); }
      if(modeIs("mot")) add(150000,true); say(j.girl+" IS FREE!",2.4,freed.size+" OF 7"); }
    if(L2S.rescues>=2&&!cleared[2]){ cleared[2]=true; add(150000,true); setTimeout(()=>{ whoaT=1.5; dark=1.5; SFX.door(); setTimeout(()=>{ say("STAIRS UP LIT!",2.6,"SHOOT THE RAMP TO CLIMB"); SFX.jackpot(); flash=.8; },1500); },1200); } }
  /* ---------- floor 3: smile lounge ---------- */
  function L3enter(){ if(visited[3]===1) setTimeout(()=>{ if(level===3) say("THE SMILE LOUNGE",2.4,"HIT THE RECORD CRATE A · B · C"); },400); }
  function L3beat(){ if(!L3S.power) return; progress(); L3S.beats++; L3S.noBeat=0; SFX.beat(); add(35000);
    if(L3S.beats===6){ add(200000,true); L3S.dj=true; L3.scoop.lit=true; say("SIX BEATS!",2,"SHOOT THE DJ SCOOP OR THE RAMP"); SFX.jackpot(); }
    else if(L3S.beats<6) say("BEAT "+L3S.beats+" OF 6",1); }
  function L3hot(){ TILES.forEach(t=>t.hot=false); const p=[...TILES].sort(()=>Math.random()-.5).slice(0,4); p.forEach(t=>t.hot=true); }
  function L3finale(b){ L3S.finale=true; L3.scoop.lit=false; whoaT=3; flash=1; SFX.jackpot();
    const left=GIRLS.filter(n=>!freed.has(n)); left.forEach(setFree); add(250000,true); cleared[3]=true;
    say("DON'T MIND IT!",3,left.length?"EVERYONE IN THE LOUNGE IS FREE!":"PARTY TIME!");
    setTimeout(()=>{ if(level!==3||state!=="play") return; startMultiball(); say("DON'T MIND IT!",2.4,"MULTIBALL! · BOSS RAMP LIT"); },3000); }
  function startMultiball(){ mb=true; mbT=20; save=Math.max(save,8); const b=mkBall(383,690); b.auto=true; BALLS.push(b); musScene(); }
  /* ---------- floor 4: giant grace ---------- */
  function bossEnter(){ if(!BOSS.intro){ BOSS.intro=true; BOSS.atkT=15; setTimeout(()=>{ if(level===4){ say("WATCH YOUR TONE!",2.6,"GRACE IS MAD!"); SFX.laugh(); } },600); } else { BOSS.atkT=Math.max(BOSS.atkT,6); say("GIANT GRACE",1.6,BOSS.hp+" HP LEFT"); } }
  function weakActive(t){ if(BOSS.pity>0) return true; const p=BOSS.phase;
    if(p===1) return t.id!=="tooth";
    if(p===2) return t.id==="tooth"?BOSS.toothFlash>0:(t.id==="wristL")===(BOSS.wrist===0);
    return t.id==="tooth"||(t.id==="wristL")===(BOSS.wrist===0); }
  function bossHit(t){ t.cool=.75; t.t=.4;
    if(!weakActive(t)){ add(5000); SFX.target(); return; }
    progress(); BOSS.hp--; BOSS.noDmg=0; BOSS.pity=0; shake=8; flash=.5; SFX.hp(); add(t.id==="tooth"?200000:100000);
    BOSS.wrist^=1; if(BOSS.hp<=0){ add(500000+1000000,true); if(!lostBall) add(1000000,true); win(); return; }
    if(BOSS.hp===8){ BOSS.phase=2; add(250000,true); BOSS.atk=null; BOSS.atkT=6; say("NEVER EVER BE!",2.4,"SHE'S GETTING COMPETITIVE"); SFX.laugh(); }
    else if(BOSS.hp===4){ BOSS.phase=3; add(350000,true); BOSS.atk=null; BOSS.atkT=6; say("BETTER FREE!",2.4,"HIT THE GOLD TOOTH"); SFX.laugh(); musLevel(.68); }
    else say("-1 HP",.9,"GIANT GRACE "+BOSS.hp+" / 12"); }
  function bossUpdate(dt){
    BOSS.noDmg+=dt; if(BOSS.noDmg>25&&BOSS.pity<=0){ BOSS.pity=10; BOSS.noDmg=0; say("SHE'S WIDE OPEN!",1.8,"HIT ANYTHING THAT GLOWS"); }
    if(BOSS.pity>0) BOSS.pity-=dt;
    BOSS.toothT-=dt; if(BOSS.toothT<=0){ BOSS.toothT=8; BOSS.toothFlash=3; } if(BOSS.toothFlash>0) BOSS.toothFlash-=dt;
    const shoe=L4.tgts.find(t=>t.id==="shoe");
    const a=BOSS.atk;
    if(!a){ BOSS.atkT-=dt; if(BOSS.atkT<=0){ const busy=live().some(b=>b.inLane||b.held>0||b.ramp); if(busy){ BOSS.atkT=1; return; }
        const kind=BOSS.phase===1?"stomp":BOSS.phase===2?"shoe":"swat"; const side=Math.random()<.5?0:1;
        BOSS.atk={kind,side,warn:kind==="shoe"?2.5:2,act:kind==="shoe"?4:kind==="swat"?.5:.3,t:0};
        if(kind==="stomp"){ say("STOMP INCOMING!",1.6,side?"RIGHT SIDE":"LEFT SIDE"); SFX.stompWarn(); }
        if(kind==="shoe"){ say("NEVER EVER BE!",1.6,"SHOE INCOMING!"); SFX.stompWarn(); }
        if(kind==="swat"){ say("HAND SWAT!",1.4,"HOLD IT OR AIM LEFT"); SFX.warn(); } }
      return; }
    a.t+=dt;
    if(a.t>=a.warn&&!a.hit){ a.hit=true;
      if(a.kind==="stomp"){ SFX.stomp(); shake=14; for(const b of live()) if(!b.held&&!b.ramp&&!b.inLane&&b.y<580){ b.vy-=140; b.vx+=(a.side?-1:1)*90+(Math.random()-.5)*60; } }
      if(a.kind==="shoe"){ SFX.stomp(); shake=10; shoe.on=true; for(const b of live()){ if(b.x>shoe.x-shoe.w/2-R&&b.x<shoe.x+shoe.w/2+R&&b.y>shoe.y-shoe.h/2-R&&b.y<shoe.y+shoe.h/2+R){ b.x=shoe.x+shoe.w/2+R+2; b.vx=220; b.vy=120; } } }
      if(a.kind==="swat"){ SFX.swish(); } }
    if(a.hit&&a.kind==="swat"&&a.t<a.warn+a.act){ for(const b of live()) if(!b.held&&!b.inLane&&b.x>232&&b.x<330&&b.y>270&&b.y<380){ b.vx=-380; b.vy=220; shake=5; } }
    if(a.t>=a.warn+a.act){ if(a.kind==="shoe") shoe.on=false; BOSS.atk=null; BOSS.atkT=BOSS.phase===1?12:BOSS.phase===2?15:10; add(25000); } }

  /* ---------- physics ---------- */
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  function closest(px,py,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay, l=dx*dx+dy*dy||1; let t=((px-ax)*dx+(py-ay)*dy)/l; t=clamp(t,0,1); return [ax+dx*t,ay+dy*t]; }
  function collideSeg(b,s){
    const [cx_,cy_]=closest(b.x,b.y,s.a[0],s.a[1],s.b[0],s.b[1]); let nx=b.x-cx_, ny=b.y-cy_, d=Math.hypot(nx,ny);
    if(d>=R||d===0) return; nx/=d; ny/=d;
    if(s.oneway&&b.vy<=0) return;
    b.x+=nx*(R-d); b.y+=ny*(R-d); const vn=b.vx*nx+b.vy*ny;
    if(vn<0){ b.vx-=(1+s.e)*vn*nx; b.vy-=(1+s.e)*vn*ny; if(-vn>260) SFX.wall(); }
    if(s.kick&&-vn>60&&!tilted){ b.vx+=nx*s.kick; b.vy+=ny*s.kick; add(10); SFX.sling(); s.t=.15; shake=3; }
  }
  function collideRect(b,t){ // returns impact speed or 0
    const hw=t.w/2, hh=t.h/2; let qx=clamp(b.x,t.x-hw,t.x+hw), qy=clamp(b.y,t.y-hh,t.y+hh), nx=b.x-qx, ny=b.y-qy, d=Math.hypot(nx,ny);
    if(d>=R) return 0;
    if(d===0){ const dl=b.x-(t.x-hw), dr=t.x+hw-b.x, du=b.y-(t.y-hh), dd=t.y+hh-b.y, m=Math.min(dl,dr,du,dd);
      if(m===dl){ nx=-1; ny=0; qx=t.x-hw; } else if(m===dr){ nx=1; ny=0; qx=t.x+hw; } else if(m===du){ nx=0; ny=-1; qy=t.y-hh; } else { nx=0; ny=1; qy=t.y+hh; } qx=nx?qx:b.x; qy=ny?qy:b.y; d=0; }
    else { nx/=d; ny/=d; }
    b.x=qx+nx*R; b.y=qy+ny*R; const vn=b.vx*nx+b.vy*ny;
    if(ny<-.7&&t.w>t.h) b.vx+=(b.x>=t.x?1:-1)*.5;
    if(vn<0){ b.vx-=(1+t.e)*vn*nx; b.vy-=(1+t.e)*vn*ny; return -vn; } return 0; }
  function tip(f){ const th=f.side>0?f.ang:Math.PI-f.ang; return [f.px+Math.cos(th)*f.len,f.py+Math.sin(th)*f.len]; }
  function collideFlip(b,f){
    const [ex,ey]=tip(f); const [qx,qy]=closest(b.x,b.y,f.px,f.py,ex,ey);
    const along=Math.hypot(qx-f.px,qy-f.py)/f.len, rad=7-3*along;
    let nx=b.x-qx, ny=b.y-qy, d=Math.hypot(nx,ny); if(d>=R+rad||d===0) return; nx/=d; ny/=d;
    b.x+=nx*(R+rad-d); b.y+=ny*(R+rad-d);
    const omega=f.w*(f.side>0?1:-1), rx=qx-f.px, ry=qy-f.py, svx=-omega*ry, svy=omega*rx;
    const rvx=b.vx-svx, rvy=b.vy-svy, vn=rvx*nx+rvy*ny;
    if(vn<0){ const e=Math.abs(f.w)>1?.25:.05; b.vx-=(1+e)*vn*nx; b.vy-=(1+e)*vn*ny;
      if(Math.abs(f.w)>2&&(f.side>0?f.w<0:f.w<0)&&!tilted) aimAssist(b); }
  }
  // ---- fun helpers: flipper shots bend toward whatever you should hit next; jars pull the ball in a little
  function goals(){ const g=[], up=j=>j.up&&j.h>.5;
    if(level===1){ L1.jars.forEach(j=>up(j)&&g.push([j.x,j.y])); if(cleared[1]) g.push([170,420]); }
    if(level===2){ doors().forEach(d=>d.state==="unlocked"&&g.push([d.x,d.y+4])); L2.jars.forEach(j=>up(j)&&g.push([j.x,j.y]));
      if(!g.length&&doors().some(d=>d.state==="locked")) L2.tgts.filter(t=>t.kind==="key").forEach(t=>g.push([t.x,t.y+4])); if(cleared[2]) g.push([170,420]); }
    if(level===3){ if(cleared[3]) g.push([170,420]); else if(!L3S.setDone) L3.tgts.filter(t=>t.kind==="drop"&&!t.down).forEach(t=>g.push([t.x+6,t.y]));
      else if(!L3S.rp) g.push([292,178]); else if(!L3S.power) g.push([338,300]); else if(L3S.dj) g.push([170,420]);
      else { TILES.filter(t=>t.lit).forEach(t=>g.push([t.x,t.y])); L3.tgts.filter(t=>t.kind==="beat").forEach(t=>g.push([t.x+(t.x<183?6:-6),t.y])); } }
    if(level===4) L4.tgts.filter(t=>t.kind==="weak"&&weakActive(t)).forEach(t=>g.push([t.x,t.y+8]));
    return g; }
  function aimAssist(b){ const now=performance.now(); if(b.aimT&&now-b.aimT<250) return; const sp=Math.hypot(b.vx,b.vy); if(sp<350||b.vy>-150) return;
    const cur=Math.atan2(b.vy,b.vx); let best=null, bd=.5;
    for(const [gx,gy] of goals()){ const d=Math.hypot(gx-b.x,gy-b.y), t=d/sp, ay=gy-.5*G*t*t, want=Math.atan2(ay-b.y,gx-b.x); let df=want-cur; df=Math.atan2(Math.sin(df),Math.cos(df)); if(Math.abs(df)<Math.abs(bd)) { bd=df; best=1; } }
    if(!best) return; b.aimT=now; const a=cur+bd*.85; b.vx=Math.cos(a)*sp; b.vy=Math.sin(a)*sp; }
  function magnet(b,dt){ for(const j of LV.jars){ if(!j.up||j.h<.6) continue; const dx=j.x-b.x, dy=j.y-b.y, d=Math.hypot(dx,dy); if(d<j.r+R+40&&d>j.r+R){ const k=520*dt*(1-(d-j.r-R)/40); b.vx+=dx/d*k; b.vy+=dy/d*k; } }
    if(level===4) for(const t of L4.tgts){ if(t.kind!=="weak"||!weakActive(t)) continue; const dx=t.x-b.x, dy=t.y-b.y, d=Math.hypot(dx,dy); if(d<70&&d>15){ const k=420*dt*(1-d/70); b.vx+=dx/d*k; b.vy+=dy/d*k; } } }
  function rampPos(s){ const P=RAMP.path, n=P.length-1, f=Math.min(n-1e-6,s*n), i=Math.floor(f), u=f-i, a=P[i], c=P[i+1];
    return [a[0]+(c[0]-a[0])*u,a[1]+(c[1]-a[1])*u,a[2]+(c[2]-a[2])*u]; }
  function onTarget(t,b,imp){
    const k=t.kind;
    if(k==="drop"){ t.down=true; SFX.target(); progress();
      if(level===1){ add(5000); if(L1.tgts.every(x=>x.down)){ add(30000); mult=Math.min(3,mult+1); fireT=1.6; say("F·R·E·E!",2,"x"+mult+" · A JAR RISES"); SFX.fire(); raiseJar(null,16); setTimeout(()=>L1.tgts.forEach(x=>x.down=false),1200); } }
      if(level===3){ SFX.record(); const first=L3S.records===0; L3S.records=L3.tgts.filter(x=>x.kind==="drop"&&x.down).length; add(modeIs("ikwyn")?30000:20000);
        if(first) startMode("ikwyn","I KNOW WHAT YOU NEED!",30,"RECORD FOUND! · GET ALL THREE");
        else say("RECORD FOUND!",1.2,L3S.records+" OF 3");
        if(L3S.records>=3&&!L3S.setDone){ L3S.setDone=true; add(100000+(modeIs("ikwyn")?120000:0),true); say("RECORDS COMPLETE",2,"HIT THE RECORD PLAYER"); SFX.jingle(); } }
      return; }
    if(t.cool>0||imp<15) return; t.cool=.3; t.t=.25;
    if(k==="door"){ L2door(t); return; }
    if(k==="key"){ SFX.key(); add(15000); progress(); const n=modeIs("mot")?2:1;
      t.lit=true; setTimeout(()=>t.lit=false,600); for(let i=0;i<n;i++) giveKey(n===2?"DOUBLE KEY!":"KEY!"); return; }
    if(k==="prop"){ add(1000); SFX.sling(); return; }
    if(k==="rp"){ add(40000); SFX.record(); progress(); if(L3S.setDone&&!L3S.rp){ L3S.rp=true; say("NEEDLE DROP",2,"NOW THROW THE POWER LEVER →"); SFX.jingle(); } else if(!L3S.setDone) say("NO RECORDS YET",1.2,"HIT A · B · C"); return; }
    if(k==="act"){ add(50000); progress(); if(L3S.rp&&!L3S.power){ L3S.power=true; add(150000,true); SFX.power(); flash=1; L3hot(); L3S.hotT=10; L3S.noBeat=0; musScene();
        if(mode) endMode(); startMode("fences","FENCES!",40,"LIGHT THE FLOOR! · 6 BEATS"); }
      else if(!L3S.power){ SFX.locked(); say("NO POWER",1.2,L3S.setDone?"HIT THE RECORD PLAYER":"FIND THE RECORDS FIRST"); } else SFX.target(); return; }
    if(k==="beat"){ add(modeIs("fences")?25000:10000); if(L3S.power) L3beat(); else { SFX.target(); say("DANCE FLOOR'S OFF",1.2,"FIND THE POWER"); } return; }
    if(k==="weak"){ bossHit(t); return; }
    if(k==="shoe"){ add(1000); SFX.sling(); return; }
  }
  function stepBall(b,dt){
    if(b.dead) return;
    const sc=LV.scoop;
    if(b.held>0){ b.held-=dt; b.x=sc.x; b.y=sc.y; b.vx=b.vy=0; if(b.held<=0){ b.vx=260; b.vy=-420; b.x=sc.x+16; b.y=sc.y-6; SFX.eject(); shake=3; } return; }
    if(b.ramp){ b.ramp.s+=dt/1.15; const p=rampPos(b.ramp.s); b.x=p[0]; b.y=p[1]; b.z=p[2];
      if(b.ramp.s>=1){ b.ramp=null; b.z=0; b.x=RAMP.exit[0]; b.y=RAMP.exit[1]; b.vx=-40; b.vy=160; rampMade(b); } return; }
    if(b.inLane){ if(b.auto){ b.vy=-(900); b.inLane=false; b.auto=false; SFX.launch(); }
      else { if(plunge) charge=Math.min(1,charge+dt*1.4); b.vx=0; if(b.y>=690){ b.y=690; if(!plunge&&b.vy>=0) b.vy=0; } } }
    b.vy+=G*dt; if(!b.inLane&&!tilted) magnet(b,dt); b.x+=b.vx*dt; b.y+=b.vy*dt;
    const sp=Math.hypot(b.vx,b.vy); if(sp>VMAX){ b.vx*=VMAX/sp; b.vy*=VMAX/sp; }
    if(b.inLane&&b.y<250) b.inLane=false;
    if(!b.inLane&&b.x>366&&b.y>600){ b.inLane=true; b.x=383; }
    for(const s of LV.segsAll) collideSeg(b,s);
    if(!tilted) for(const f of FL) collideFlip(b,f);
    for(const bp of LV.bumps){ let nx=b.x-bp.x, ny=b.y-bp.y, d=Math.hypot(nx,ny); if(d<bp.r+R&&d>0){ nx/=d; ny/=d; b.x=bp.x+nx*(bp.r+R); b.y=bp.y+ny*(bp.r+R);
      const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=2*vn*nx; b.vy-=2*vn*ny; }
      if(!tilted){ b.vx+=nx*240; b.vy+=ny*240; bp.t=.18; SFX.pop(); shake=2; bumpHit(bp); } } }
    for(const j of LV.jars){ if(!j.up||j.h<.6) continue; let nx=b.x-j.x, ny=b.y-j.y, d=Math.hypot(nx,ny);
      if(d<j.r+R&&d>0){ nx/=d; ny/=d; b.x=j.x+nx*(j.r+R); b.y=j.y+ny*(j.r+R); const vn=b.vx*nx+b.vy*ny;
        if(vn<0){ b.vx-=1.6*vn*nx; b.vy-=1.6*vn*ny; if(-vn>25&&!tilted&&j.cool<=0){ j.cool=.25; if(level===1) L1jar(j); else L2jar(j); } } } }
    for(const t of LV.tgts){ if(!t.on||t.down) continue; const imp=collideRect(b,t); if(imp>0&&!tilted){ if(t.kind==="drop"){ b.vx=b.vx*.9; } onTarget(t,b,imp); } }
    for(const r of LV.rolls){ const inside=Math.abs(b.x-r.x)<r.w/2&&Math.abs(b.y-r.y)<r.h/2; if(inside&&!b._in[r.id]){ b._in[r.id]=1; onRoll(r,b); } else if(!inside) b._in[r.id]=0; }
    const sp_=LV.spin; if(sp_&&Math.abs(b.x-sp_.x)<14&&Math.abs(b.y-sp_.y)<6&&Math.abs(b.vy)>80){ sp_.v=Math.max(sp_.v,Math.abs(b.vy)/30); }
    if(sc&&Math.hypot(b.x-sc.x,b.y-sc.y)<sc.r&&!tilted){ b.held=1.3; SFX.scoop(); scoopMade(b); return; }
    if(LV.ramp&&b.vy<-180&&b.x>RAMP.mx0+2&&b.x<RAMP.mx1-2&&b.y<RAMP.my&&b.y>RAMP.my-14&&!tilted){ b.ramp={s:0}; SFX.ramp(); return; }
    if(b.y>H+30) drain(b);
  }
  function bumpHit(bp){ bumpHits++;
    if(level===1){ add(1000); if(bumpHits%15===0) raiseJar("BUMPERS",14); }
    else if(level===2){ add(3000); SFX.bell(); L2S.bells++; if(L2S.bells%5===0&&!mode){ const c=doors().filter(d=>d.state==="locked"||d.state==="unlocked"); if(c.length>1){ L2S.liar=c[Math.floor(Math.random()*c.length)].id; startMode("liar","DIRTY LITTLE LIAR!",30,"ONE DOOR IS LYING · HIT ANOTHER"); } } }
    else add(5000); }
  function onRoll(r,b){
    if(level===1&&r.id.startsWith("lane")){ if(b.vy<=0) return; const i=+r.id[4];
      if(skill>0&&i===lanePhase%3){ skill=0; add(25000); say("SKILL SHOT!",1.8,"GET BACK · 25,000"); SFX.jackpot(); }
      if(!r.lit){ r.lit=true; add(5000); SFX.lane(); if(L1.rolls.every(l=>l.lit)){ add(10000); say("LANES COMPLETE",1.6,"MOTEL SCOOP LIT · VACANCY"); SFX.jingle(); L1.scoop.lit=true; setTimeout(()=>L1.rolls.forEach(l=>l.lit=false),900); } } return; }
    if(level===3&&r.id[0]==="t"){ r.t=.4; if(!L3S.power) return; if(modeIs("fences")) add(15000); else add(r.hot?10000:1000);
      if(r.hot||L3S.allHot>0){ r.hot=false; L3beat(); } }
  }
  function comboHit(name){ if(comboT>0){ combo++; const v=5000*combo; add(v); say(combo+"x COMBO",1.4,name+" · +"+v.toLocaleString()); SFX.rampDone(); } else combo=0; comboT=4; }
  function rampMade(b){ RAMP.flash=.8; SFX.rampDone(); progress();
    if(level===3&&L3S.dj&&!L3S.finale){ add(75000); b.x=L3.scoop.x; b.y=L3.scoop.y; b.held=3.2; L3finale(b); return; }
    if(cleared[level]&&level<4){ if(mb&&live().length>1){ BALLS.forEach(x=>{ if(x!==b) x.dead=true; }); } climb(); return; }
    add(level===1?25000:level===2?30000:40000); comboHit("RAMP"); }
  function scoopMade(b){ const sc=LV.scoop; sc.flash=1.3; progress();
    if(level===1){ add(15000); if(sc.lit){ sc.lit=false; const r=Math.random();
        if(r<.5) raiseJar("VACANCY",16); else if(r<.8){ add(25000); say("VACANCY",1.6,"+25,000"); } else { save=Math.max(save,15); say("VACANCY",1.6,"BALL SAVE 15s"); } } else comboHit("MOTEL"); return; }
    if(level===2){ add(20000); if(!startMode("getback","GET BACK!",25,"DOORS +20K · BALL SAVE")) comboHit("SCOOP"); else save=Math.max(save,10); return; }
    if(level===3){ add(75000); if(L3S.dj&&!L3S.finale){ b.held=3.2; L3finale(b); } else comboHit("DJ"); return; }
    if(level===4){ add(50000); save=Math.max(save,10); say("SMILEY SHIELD",1.6,"BALL SAVE 10s"); SFX.jingle(); }
  }
  function drain(b){
    if(save>0&&!tilted){ b.x=383; b.y=690; b.vx=b.vy=0; b.inLane=true; b.auto=true; b._in={}; say("GET BACK!",1.2,"BALL SAVED"); SFX.lane(); return; }
    b.dead=true; const L=live();
    if(L.length>0){ if(L.length===1&&mb){ mb=false; musScene(); say("MULTIBALL OVER",1.4); } return; }
    mb=false; if(mode) endMode();
    if(level>1&&!tilted){ fall(); trans.from=level; return; }
    SFX.drain(); lostBall=true; ballsLeft--;
    if(ballsLeft<=0){ state="over"; best=Math.max(best,score); say("GAME OVER",99,rank()); musStop(2.5); }
    else { newBall(false); if(!beenWrong){ beenWrong=true; save=0; L1S.beenWrong=20; say("BEEN WRONG",1.8,"NEXT BALL: 20s BALL SAVE"); } else say("WHAT'S MISSING",1.4,"BALL "+(4-ballsLeft)); musFilter(500,1,18000); }
  }
  function rank(){ if(won) return lostBall?"BETTER FREE":"GOLDEN SMILE"; if(visited[4]) return "GRACE CHASER"; if(visited[3]) return "LOUNGE LEGEND"; if(visited[2]) return "HALLWAY HUSTLER"; if(freed.size>=3) return "JAR BREAKER"; return "ROOFTOP ROOKIE"; }
  function nudge(){ if(state!=="play"||tilted||trans) return; nudges++; nudgeT=2.5; shake=6;
    for(const b of live()) if(!b.held&&!b.ramp&&!b.inLane){ b.vy-=110; b.vx+=(Math.random()-.5)*120; }
    noise(.15,200,.6);
    if(nudges===3){ say("WATCH YOUR TONE",1.4,"DANGER"); SFX.warn(); }
    if(nudges>=4){ tilted=true; say("TILT",3,"DIRTY LITTLE LIAR"); SFX.tilt(); FL.forEach(f=>f.up=false); } }
  function step(dt){
    for(const f of FL){ const tgt=(f.up&&!tilted)?UP:REST, prev=f.ang; f.ang+=Math.sign(tgt-f.ang)*Math.min(Math.abs(tgt-f.ang),FSPD*dt); f.w=(f.ang-prev)/dt; }
    for(const b of BALLS) stepBall(b,dt);
    ballCollide();
  }
  function ballCollide(){ const L=live().filter(b=>!b.held&&!b.ramp);
    for(let i=0;i<L.length;i++) for(let k=i+1;k<L.length;k++){ const a=L[i], c=L[k]; let nx=c.x-a.x, ny=c.y-a.y, d=Math.hypot(nx,ny);
      if(d<2*R&&d>0){ nx/=d; ny/=d; const o=(2*R-d)/2; a.x-=nx*o; a.y-=ny*o; c.x+=nx*o; c.y+=ny*o;
        const rv=(c.vx-a.vx)*nx+(c.vy-a.vy)*ny; if(rv<0){ a.vx+=rv*nx*.95; a.vy+=rv*ny*.95; c.vx-=rv*nx*.95; c.vy-=rv*ny*.95; } } } }
  const HINTS={1:()=>cleared[1]?"SHOOT THE RAMP TO CLIMB":"BREAK 3 JARS",2:()=>cleared[2]?"SHOOT THE RAMP TO CLIMB":doors().some(d=>d.state==="unlocked")?"HIT THE FLASHING DOOR":L2.jars.some(j=>j.up)?"HIT THE JAR":"HIT THE KEY RACK",
    3:()=>cleared[3]?"SHOOT THE BOSS RAMP":L3S.dj?"SHOOT THE DJ SCOOP OR THE RAMP":L3S.power?"ROLL OVER THE LIT TILES":L3S.rp?"HIT THE POWER LEVER":L3S.setDone?"HIT THE RECORD PLAYER":"HIT THE RECORD CRATE",4:()=>"HIT WHAT GLOWS"};
  function update(dt){
        for(const f of FL) if(state!=="play"||trans){ const tgt=f.up?UP:REST; f.ang+=Math.sign(tgt-f.ang)*Math.min(Math.abs(tgt-f.ang),FSPD*dt); }
    msgT-=dt; shake=Math.max(0,(shake||0)-dt*20); flash=Math.max(0,flash-dt); dark=Math.max(0,dark-dt); whoaT=Math.max(0,whoaT-dt);
    if(state!=="play") { for(const L of Object.values(LEVELS)) L.jars.forEach(j=>j.h=Math.max(0,j.h-dt*2)); return; }
    if(trans){ trans.t+=dt;
      if(trans.kind==="win"){ if(trans.t>3&&!trans.m1){ trans.m1=1; say("GRACE IS FREE",3,"THE SPELL IS BROKEN"); SFX.jingle(); }
        if(trans.t>6&&!trans.m2){ trans.m2=1; say("MOTEL SMILE",3,"BETTER FREE — YOU WIN!"); SFX.jackpot(); flash=1; }
        if(trans.t>=trans.dur){ trans=null; won=true; state="over"; best=Math.max(best,score); say("YOU WIN!",99,rank()); BALLS=[]; } return; }
      if(!trans.swapped&&trans.t>=trans.dur/2){ trans.swapped=true; arrive(); }
      if(trans.t>=trans.dur) trans=null; return; }
    const n=10, h=dt/n; for(let i=0;i<n;i++){ step(h); if(trans) break; }
    BALLS=BALLS.filter(b=>!b.dead);
    if(trans) return;
    LV.bumps.forEach(b=>b.t=Math.max(0,b.t-dt)); LV.segsAll.forEach(s=>s.t&&(s.t=Math.max(0,s.t-dt)));
    LV.tgts.forEach(t=>{ t.t=Math.max(0,t.t-dt); t.cool=Math.max(0,t.cool-dt); }); LV.rolls.forEach(r=>r.t=Math.max(0,r.t-dt));
    const m=BALLS[0]; if(m&&BALLS.length===1){ const still_=Math.hypot(m.vx,m.vy)<20&&!m.inLane&&!m.held&&!m.ramp&&!FL[0].up&&!FL[1].up; stuck=still_?stuck+dt:0;
      if(stuck>2.5){ stuck=0; m.vy=-200; m.vx=(m.x<183?1:-1)*(120+Math.random()*120); SFX.sling(); } }
    for(const j of LV.jars){ j.cool=Math.max(0,j.cool-dt); j.flash=Math.max(0,j.flash-dt); j.h+=((j.up?1:0)-j.h)*Math.min(1,dt*6);
      if(j.up&&level===1){ j.timer-=dt; if(j.timer<=0){ j.up=false; j.cool=2; SFX.jarDown(); say(j.girl+" SANK",1.2,"WHAT'S MISSING"); } else if(j.timer<4&&Math.floor(j.timer*2)!==Math.floor((j.timer+dt)*2)) SFX.tick(); } }
    // floor rules
    if(level===1){ L1S.noJar+=dt; if(L1S.beenWrong>0){ L1S.beenWrong-=dt; save=Math.max(save,Math.min(L1S.beenWrong,20)); }
      if(L1.jars.filter(j=>j.up).length<3){ L1S.autoT-=dt; if(L1S.autoT<=0){ L1S.autoT=3; if(L1S.noJar>20){ L1S.noJar=0; if(raiseJar(null,24,true)) say("WHAT'S MISSING?",2,"FIND THE GOLD JAR · x2"); } else raiseJar(null,22); } } }
    if(level===2){ L2S.noKey+=dt; if(!cleared[2]){ L2S.motT-=dt; if(L2S.motT<=0&&!mode){ L2S.motT=999; startMode("mot","MATTER OF TIME!",30,"HURRY UP! · KEYS COUNT DOUBLE"); } }
      if(L2S.noKey>20&&!doors().some(d=>d.state==="unlocked")&&doors().some(d=>d.state==="locked")) giveKey("FRONT DESK!");
      if(L2S.spinX2>0) L2S.spinX2-=dt; }
    if(level===3){ if(L3S.power){ L3S.hotT-=dt; L3S.noBeat+=dt; if(L3S.hotT<=0){ L3S.hotT=10; L3hot(); } if(L3S.noBeat>15&&L3S.allHot<=0&&L3S.beats<6){ L3S.allHot=10; L3S.noBeat=0; say("THE WHOLE FLOOR IS LIT",1.6,"EVERY TILE COUNTS"); } }
      if(L3S.allHot>0){ L3S.allHot-=dt; TILES.forEach(t=>t.lit=true); } else TILES.forEach(t=>t.lit=t.hot);
      if(L3S.safe>0){ L3S.safe-=dt; save=Math.max(save,.1); } }
    if(level===4) bossUpdate(dt);
    if(mb){ mbT-=dt; if(mbT<=0){ mb=false; musScene(); } }
    if(mode){ modeT-=dt; if(modeT<=0) endMode(); }
    if(skill>0) skill-=dt; lanePhaseT+=dt; if(lanePhaseT>.45){ lanePhaseT=0; lanePhase++; }
    if(comboT>0) comboT-=dt; if(nudgeT>0){ nudgeT-=dt; if(nudgeT<=0&&!tilted) nudges=Math.max(0,nudges-1); }
    if(save>0) save-=dt; fireT=Math.max(0,fireT-dt);
    if(LV.scoop) LV.scoop.flash=Math.max(0,LV.scoop.flash-dt); RAMP.flash=Math.max(0,RAMP.flash-dt);
    hintT+=dt; if(hintT>15&&msgT<=0&&!BALLS.some(b=>b.inLane)){ hintT=0; say(HINTS[level](),2); }
    const sp=LV.spin; if(sp&&sp.v>0){ const before=Math.floor(sp.a/(2*Math.PI)); sp.a+=sp.v*dt*6; sp.v=Math.max(0,sp.v-dt*6);
      if(Math.floor(sp.a/(2*Math.PI))>before){ tone(2000,.03,"square",.04);
        if(level===1){ add(1000); for(const j of L1.jars) if(j.up) j.value+=250; }
        if(level===2){ add(2000*(L2S.spinX2>0?2:1)); const now=performance.now()/1000; L2S.spins.push(now); L2S.spins=L2S.spins.filter(x=>now-x<30);
          if(L2S.spins.length>=20){ L2S.spins=[]; add(50000); L2S.spinX2=15; say("SOMETIMES",1.6,"+50,000 · SPINNER x2"); SFX.jingle(); } } } }
  }

  /* ---------- playfield art, one per floor (also the 3D playfield texture) ---------- */
  const NEON="#ff3d7f", CYAN="#46dcff", AMBER="#ffaa46";
  const BGS={};
  function bgFor(n){ if(BGS[n]) return BGS[n]; const bg=document.createElement("canvas"); bg.width=W*2; bg.height=H*2; const c=bg.getContext("2d"); c.scale(2,2); const L=LEVELS[n];
    const grad=(stops)=>{ const g=c.createLinearGradient(0,0,0,H); stops.forEach(([p,col])=>g.addColorStop(p,col)); c.fillStyle=g; c.fillRect(0,0,W,H); };
    const speck=(n_,a)=>{ for(let i=0;i<n_;i++){ c.fillStyle=`rgba(${Math.random()<.5?255:0},${Math.random()*80|0},${Math.random()*80|0},${Math.random()*a})`; c.fillRect(Math.random()*W,Math.random()*H,1.5,1.5); } };
    const tag=(t,x,y,rot,size,col)=>{ c.save(); c.translate(x,y); c.rotate(rot); c.font=`italic 900 ${size}px 'Arial Black',Impact,sans-serif`; c.textAlign="center"; c.fillStyle=col; c.fillText(t,0,0); c.restore(); };
    if(n===1){ grad([[0,"#12060f"],[.55,"#1d0812"],[1,"#3a0d0a"]]);
      for(let i=0;i<46;i++){ const x=Math.random()*366, h=60+Math.random()*170, y=H; const fg=c.createLinearGradient(x,y,x,y-h); fg.addColorStop(0,"rgba(255,120,30,.35)"); fg.addColorStop(.6,"rgba(255,50,90,.12)"); fg.addColorStop(1,"rgba(255,50,90,0)");
        c.fillStyle=fg; c.beginPath(); c.moveTo(x-18,y); c.quadraticCurveTo(x-10,y-h*.5,x+Math.random()*16-8,y-h); c.quadraticCurveTo(x+12,y-h*.5,x+18,y); c.fill(); }
      speck(2600,.06); tag("BETTER FREE",183,540,-.12,27,"rgba(255,90,40,.18)");
      c.font="bold 7px monospace"; c.textAlign="center";
      for(const j of L1.jars){ c.strokeStyle="rgba(255,120,190,.35)"; c.lineWidth=2; c.beginPath(); c.arc(j.x,j.y,15,0,7); c.stroke(); c.fillStyle="rgba(255,200,225,.45)"; c.fillText(j.girl,j.x,j.y+24); }
      c.fillStyle="rgba(255,200,225,.4)"; c.font="bold 8px monospace"; c.fillText("MOTEL",L1.scoop.x+18,L1.scoop.y+26); }
    if(n===2){ // 70s motel carpet: burgundy with orange scallops, a runner up the middle
      c.fillStyle="#2a0a0c"; c.fillRect(0,0,W,H);
      for(let y=0;y<H+20;y+=16) for(let x=(y/16%2)*12;x<W+24;x+=24){ c.strokeStyle="rgba(214,98,40,.45)"; c.lineWidth=2; c.beginPath(); c.arc(x,y,11,Math.PI,0); c.stroke(); c.strokeStyle="rgba(120,30,30,.6)"; c.beginPath(); c.arc(x,y,6,Math.PI,0); c.stroke(); }
      const run=c.createLinearGradient(110,0,256,0); run.addColorStop(0,"rgba(0,0,0,.35)"); run.addColorStop(.5,"rgba(0,0,0,0)"); run.addColorStop(1,"rgba(0,0,0,.35)"); c.fillStyle=run; c.fillRect(110,0,146,H);
      for(let y=60;y<H;y+=90){ c.fillStyle="rgba(140,210,255,.10)"; c.fillRect(120,y,126,6); } // fluorescent reflections
      for(let i=0;i<9;i++){ c.fillStyle="rgba(10,4,4,.45)"; const x=170+Math.sin(i)*14, y=470+i*28; c.beginPath(); c.ellipse(x+(i%2?9:-9),y,4,7,0,0,7); c.fill(); } // wet footprints
      speck(1800,.05); tag("MOTEL SMILE",183,560,-.08,24,"rgba(255,170,80,.16)");
      c.fillStyle="rgba(255,200,160,.5)"; c.font="bold 8px monospace"; c.textAlign="center"; c.fillText("GET BACK",L2.scoop.x+22,L2.scoop.y+26); c.fillText("KEYS",183,360); c.fillText("FRONT DESK",183,240); }
    if(n===3){ // grimy dark glass, rusty seams
      grad([[0,"#0b0710"],[.6,"#120a12"],[1,"#1c0d0c"]]);
      c.strokeStyle="rgba(150,80,40,.25)"; c.lineWidth=1.5; for(let x=0;x<W;x+=40){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); } for(let y=0;y<H;y+=40){ c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }
      for(let i=0;i<30;i++){ c.fillStyle=`rgba(${Math.random()<.5?"255,61,127":"70,220,255"},${Math.random()*.08})`; c.fillRect(Math.random()*W,Math.random()*H,4+Math.random()*30,1); }
      speck(1500,.05); tag("SMILE LOUNGE",183,555,-.1,24,"rgba(255,61,127,.16)");
      c.fillStyle="rgba(255,200,225,.5)"; c.font="bold 8px monospace"; c.textAlign="center"; c.fillText("DJ",L3.scoop.x+16,L3.scoop.y+26); c.fillText("RECORDS",96,428); }
    if(n===4){ // wet rooftop, a giant gold-tooth smiley painted on the roof
      grad([[0,"#08070f"],[.5,"#100914"],[1,"#1a0a10"]]); speck(2200,.06);
      c.save(); c.globalAlpha=.22; c.translate(183,350); c.strokeStyle="#ffd36a"; c.lineWidth=6; c.beginPath(); c.arc(0,0,92,0,7); c.stroke();
      c.fillStyle="#ffd36a"; c.beginPath(); c.arc(-32,-26,11,0,7); c.arc(32,-26,11,0,7); c.fill(); c.beginPath(); c.arc(0,4,56,.15*Math.PI,.85*Math.PI); c.stroke(); c.fillRect(-10,52,20,16); c.restore();
      for(let i=0;i<14;i++){ c.strokeStyle="rgba(255,211,106,.12)"; c.lineWidth=2; c.beginPath(); c.moveTo(183,350); c.lineTo(183+Math.cos(i/14*6.28)*200,350+Math.sin(i/14*6.28)*200); c.stroke(); }
      tag("BETTER FREE",183,560,-.1,26,"rgba(255,211,106,.16)"); c.fillStyle="rgba(255,220,160,.5)"; c.font="bold 8px monospace"; c.textAlign="center"; c.fillText("SHIELD",L4.scoop.x+22,L4.scoop.y+26); }
    c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(366,250,34,H-250);
    BGS[n]=bg; return bg; }

  /* ---------- 2D fallback renderer (no WebGL) ---------- */
  function glowLine(c,ax,ay,bx,by,col,w,bl){ c.strokeStyle=col; c.lineWidth=w; c.shadowColor=col; c.shadowBlur=bl; c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke(); }
  function smiley(c,x,y,r,hot){
    c.shadowColor=NEON; c.shadowBlur=hot?30:12; c.fillStyle=hot?"#ff7aa6":"#c21a55"; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
    c.shadowBlur=0; c.lineWidth=3; c.strokeStyle=hot?"#fff":"#ffb3cc"; c.stroke();
    c.fillStyle="#14040b"; c.beginPath(); c.arc(x-7,y-5,3.4,0,7); c.arc(x+7,y-5,3.4,0,7); c.fill();
    c.beginPath(); c.arc(x,y+2,10,.15*Math.PI,.85*Math.PI); c.lineWidth=3; c.strokeStyle="#14040b"; c.stroke(); }
  function tgtColor(t){ if(t.kind==="door") return t.state==="unlocked"?(Math.floor(performance.now()/150)%2?"#ffffff":CYAN):t.state==="locked"?"#2fb8d8":"#ff8ab8";
    if(t.kind==="key") return t.lit?AMBER:"#7a4a20"; if(t.kind==="weak") return weakActive(t)?"#ffd36a":"#7a5a3a"; if(t.kind==="beat") return L3S.power?NEON:"#552233";
    if(t.kind==="act") return L3S.power?"#46ff9e":L3S.rp?CYAN:"#666"; if(t.kind==="rp") return L3S.rp?AMBER:"#8a4a2a"; if(t.kind==="prop") return "#8a1420"; if(t.kind==="shoe") return "#111"; return "#ff5a28"; }
  function draw(){
    const cw=cv.width, ch=cv.height, dpr=cv._dpr; cx.setTransform(1,0,0,1,0,0);
    const R3=window.MSPB3D&&window.MSPB3D.ok?window.MSPB3D:null;
    if(R3){ cx.clearRect(0,0,cw,ch); R3.render(WORLD); overlay(cw,ch);
      if(state==="ready"||state==="over"){ const s2=Math.min(cw/W,ch/H)*(cw<ch?.95:.75); cx.setTransform(s2,0,0,s2,(cw-W*s2)/2+17*s2,ch*.12);
        const m=msgT; msgT=0; messages(); msgT=m; }
      return; }
    cx.fillStyle="#05060a"; cx.fillRect(0,0,cw,ch);
    const head=70*dpr, s=Math.min(cw/W,(ch-head-10*dpr)/H), ox=(cw-W*s)/2+(shake?(Math.random()-.5)*shake*dpr:0), oy=head+(ch-head-H*s)/2;
    cx.textAlign="center"; cx.shadowColor=AMBER; cx.shadowBlur=14*dpr;
    cx.font=`italic 900 ${22*dpr}px 'Arial Black',Impact,sans-serif`; cx.fillStyle="#ffd36a"; cx.fillText(msgT>0?msg:(level===4?"GIANT GRACE "+BOSS.hp+"/12":LV.name),cw/2,28*dpr);
    cx.shadowBlur=0; cx.font=`${13*dpr}px monospace`; cx.fillStyle="#ffc2da";
    cx.fillText(msgT>0&&msg2?msg2:`SCORE ${score.toLocaleString()}   BALL ${state==="over"?"-":Math.min(3,4-ballsLeft)}/3   FREE ${freed.size}/7`,cw/2,58*dpr);
    cx.setTransform(s,0,0,s,ox,oy);
    cx.save(); cx.beginPath(); cx.rect(0,0,W,H); cx.clip(); cx.drawImage(bgFor(level),0,0,W,H);
    if(fireT>0){ cx.fillStyle=`rgba(255,110,30,${.25*fireT})`; cx.fillRect(0,0,W,H); }
    cx.lineCap="round";
    for(const sg of LV.segsAll){ const hot=sg.t>0; glowLine(cx,sg.a[0],sg.a[1],sg.b[0],sg.b[1],sg.kind==="sling"?(hot?"#fff":CYAN):NEON,sg.kind==="sling"?4:3,hot?24:8); }
    cx.shadowBlur=0;
    if(LV.ramp){ cx.strokeStyle=cleared[level]?`rgba(255,61,127,${.6+.4*Math.sin(performance.now()/150)})`:`rgba(70,220,255,${.35+RAMP.flash*.6})`; cx.lineWidth=18; cx.beginPath(); RAMP.path.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])); cx.stroke(); }
    for(const r of LV.rolls){ cx.fillStyle=r.label?(r.lit?AMBER:"rgba(255,170,70,.18)"):(r.lit?(r.hot?NEON:CYAN):L3S.power?"rgba(255,61,127,.12)":"rgba(255,255,255,.03)"); if(r.label){ cx.beginPath(); cx.arc(r.x,r.y+22,7,0,7); cx.fill(); } else cx.fillRect(r.x-r.w/2+1,r.y-r.h/2+1,r.w-2,r.h-2); }
    const sc=LV.scoop; if(sc){ cx.fillStyle="#000"; cx.beginPath(); cx.arc(sc.x,sc.y,sc.r,0,7); cx.fill(); cx.strokeStyle=sc.lit?AMBER:"#555"; cx.lineWidth=3; cx.stroke(); }
    for(const t of LV.tgts){ if(!t.on||t.down) continue; cx.fillStyle=tgtColor(t); cx.fillRect(t.x-t.w/2,t.y-t.h/2,t.w,t.h); if(t.label){ cx.fillStyle="#ffd36a"; cx.font="bold 10px sans-serif"; cx.textAlign="center"; cx.fillText(t.label,t.x+(t.kind==="drop"?12:0),t.y+(t.kind==="drop"?4:-8)); } }
    const sp=LV.spin; if(sp){ const sw=Math.abs(Math.cos(sp.a))*14+2; cx.fillStyle=CYAN; cx.fillRect(sp.x-14,sp.y-sw/4,28,sw/2); }
    for(const j of LV.jars){ if(j.h<.05) continue; cx.globalAlpha=j.h; cx.fillStyle=j.gold?"#ffd36a":j.hits>=2?"#ffd0e4":j.hits===1?"#ff8ab8":"#ff3d7f"; cx.shadowColor=NEON; cx.shadowBlur=14; cx.beginPath(); cx.arc(j.x,j.y,j.r,0,7); cx.fill(); cx.shadowBlur=0; cx.globalAlpha=1; }
    for(const b of LV.bumps) smiley(cx,b.x,b.y,b.r,b.t>0);
    for(const f of FL){ const [ex,ey]=tip(f); cx.strokeStyle="#fff"; cx.lineWidth=13; cx.beginPath(); cx.moveTo(f.px,f.py); cx.lineTo(ex,ey); cx.stroke(); }
    const py=700+charge*28; cx.fillStyle="#9aa0aa"; cx.fillRect(375,py,16,H-py);
    for(const b of BALLS){ cx.fillStyle="#d8dbe2"; cx.beginPath(); cx.arc(b.x,b.y,R*(1+(b.z||0)/120),0,7); cx.fill(); }
    cx.restore(); cx.setTransform(1,0,0,1,0,0); overlay(cw,ch); cx.setTransform(s,0,0,s,ox,oy); messages(); }
  function overlay(cw,ch){ let a=0; const fly=window.MSPB3D&&window.MSPB3D.ok&&window.MSPB3D.flies; if(trans&&trans.kind!=="win"&&!fly){ const u=trans.t/trans.dur; a=u<.5?u*2:(1-u)*2; } if(dark>0) a=Math.max(a,Math.min(1,dark*1.2)*.85);
    if(a>0){ cx.fillStyle=`rgba(0,0,0,${Math.min(1,a)})`; cx.fillRect(0,0,cw,ch);
      if(trans&&trans.kind!=="win"&&!fly){ cx.textAlign="center"; cx.fillStyle=`rgba(255,${trans.kind==="climb"?211:120},${trans.kind==="climb"?106:160},${Math.min(1,a*1.4)})`; const s=Math.min(cw,ch)/12; cx.font=`italic 900 ${s}px 'Arial Black',Impact,sans-serif`;
        cx.fillText(trans.kind==="climb"?"▲ "+LEVELS[trans.to].name:"▼ "+LEVELS[trans.to].name,cw/2,ch/2); } }
    if(flash>0){ cx.fillStyle=`rgba(255,240,250,${Math.min(.35,flash*.3)})`; cx.fillRect(0,0,cw,ch); } }
  function messages(){
    if(state==="ready"||state==="over"||msgT>0){
      cx.textAlign="center"; cx.shadowColor=NEON; cx.shadowBlur=18;
      const big=state==="ready"?"TAP TO PLAY":state==="over"?(won?"YOU WIN!":"GAME OVER"):msg;
      cx.fillStyle="#fff"; cx.font="italic 900 30px 'Arial Black',Impact,sans-serif"; cx.fillText(big,183,300);
      cx.shadowBlur=0; cx.font="12px monospace"; cx.fillStyle="#ffc2da";
      if(state==="ready"){ const L=ui.touch?["Tap left side: left flipper","Tap right side: right flipper","Hold right side: pull the plunger","Swipe up: nudge (careful)","","Climb the motel. Free the girls.","Beat Giant Grace."]:["← or Z: left flipper","→ or M: right flipper","Hold SPACE: pull the plunger","↑ or N: nudge (careful)","","Climb the motel. Free the girls.","Beat Giant Grace."]; L.forEach((t,i)=>cx.fillText(t,183,332+i*18)); }
      if(state==="over"){ cx.font="bold 15px monospace"; cx.fillStyle="#ffd36a"; cx.fillText(rank(),183,328); cx.font="12px monospace"; cx.fillStyle="#ffc2da";
        cx.fillText("Score "+score.toLocaleString()+(score>=best&&score>0?"  — new best!":""),183,352); cx.fillText(freed.size+" of 7 girls freed · reached "+LEVELS[Math.max(...Object.keys(visited).map(Number))].name.toLowerCase(),183,370);
        if(visited[4]&&!won) cx.fillText("Giant Grace: "+BOSS.hp+" / 12 HP left",183,388); cx.fillText("Tap to play again",183,412); }
    }
  }
  const WORLD={BASE,FL,RAMP,LEVELS,TILES,GIRLS,tip,rampPos,W,H,R,bg:(n)=>bgFor(n||level),weakActive,
    get level(){return level}, get LV(){return LV}, get cleared(){return cleared}, get rampLit(){return !!cleared[level]&&level<4},
    get balls(){return BALLS}, get ball(){return BALLS[0]||{x:383,y:690,vx:0,vy:0,z:0}}, get charge(){return charge},get fireT(){return fireT||0},get shake(){return shake||0},get state(){return state},
    get save(){return save},get ballsLeft(){return ballsLeft},get score(){return score},get mult(){return mult},get best(){return best},
    get msg(){return msgT>0?msg:""}, get msg2(){return msgT>0?msg2:""}, get freed(){return freed}, get mb(){return mb}, get mode(){return mode?{name:mode.name,t:modeT}:null},
    get skill(){return skill>0?lanePhase%3:-1}, get flash(){return flash||0}, get tilted(){return tilted}, get trans(){return trans}, get dark(){return dark}, get whoa(){return whoaT},
    get L2S(){return L2S}, get L3S(){return L3S}, get BOSS(){return BOSS}, get won(){return won}, get rank(){return rank()}};
  function load3D(){ if(load3D.done||window.MSPB3D_OFF) return; load3D.done=1; const m=document.createElement("script"); m.type="module"; m.src="games/fireball3d.js?v=8"; m.onload=()=>window.MSPB3D&&window.MSPB3D.init(box,WORLD); document.head.appendChild(m); }
  function loop(t){ raf=0; if(!open) return; const dt=Math.min(.033,(t-(last||t))/1000); last=t; update(dt); draw(); raf=requestAnimationFrame(loop); }

  /* ---------- input ---------- */
  function setFlip(i,v){ const f=FL[i]; if(v&&!f.up&&!tilted) SFX.flip(); f.up=v; }
  function press(side,v){
    if(state==="ready"&&v){ state="play"; SFX.jingle(); say("THE ROOFTOP",1.6,"BREAK 3 JARS · FREE THE GIRLS"); musStart(); return; }
    if(state==="over"&&v){ reset(); state="play"; SFX.jingle(); musStart(); musScene(); return; }
    if(trans){ setFlip(side,v); return; }
    const lane=BALLS.find(b=>b.inLane&&!b.auto);
    if(side===1&&lane&&state==="play"&&!BALLS.some(b=>!b.inLane)){ if(v){ plunge=true; } else if(plunge){ plunge=false; lane.vy=-(720+charge*280); lane.y-=2; save=Math.max(save,8); SFX.launch(); charge=0; if(level===1){ skill=4; say("GET BACK",.9,"SKILL SHOT: HIT THE BLINKING LANE"); } } return; }
    if(side===1&&lane&&plunge&&!v){ plunge=false; lane.vy=-(720+charge*280); lane.y-=2; SFX.launch(); charge=0; return; }
    if(side===1&&lane&&v&&!BALLS.some(b=>!b.inLane&&!b.dead)){ plunge=true; return; }
    setFlip(side,v);
  }
  const keys={ArrowLeft:0,KeyZ:0,KeyA:0,ShiftLeft:0,ArrowRight:1,KeyM:1,KeyD:1,Slash:1,ShiftRight:1,Space:1,ArrowDown:1};
  function kd(e){ if(!open) return; if(e.key==="Escape"){ close(); return; } if((e.code==="ArrowUp"||e.code==="KeyN")&&!e.repeat){ e.preventDefault(); nudge(); return; } if(e.code in keys){ e.preventDefault(); if(!e.repeat) press(keys[e.code],true); } }
  function ku(e){ if(!open) return; if(e.code in keys){ e.preventDefault(); press(keys[e.code],false); } }
  const touches=new Map();
  function tside(t){ const r=cv.getBoundingClientRect(); return (t.clientX-r.left)<r.width/2?0:1; }
  function ts(e){ e.preventDefault(); window.MSAC&&window.MSAC(); for(const t of e.changedTouches){ const s=tside(t); touches.set(t.identifier,{s,y:t.clientY,t:performance.now()}); press(s,true); } }
  function te(e){ e.preventDefault(); for(const t of e.changedTouches){ const o=touches.get(t.identifier); touches.delete(t.identifier); if(!o) continue;
      if(o.y-t.clientY>70&&performance.now()-o.t<350) nudge();
      if(![...touches.values()].some(x=>x.s===o.s)) press(o.s,false); } }
  function md(e){ if(e.pointerType==="touch") return; window.MSAC&&window.MSAC(); const s=e.offsetX<cv.clientWidth/2?0:1; md.s=s; press(s,true); }
  function mu(e){ if(e.pointerType==="touch") return; if(md.s!==undefined){ press(md.s,false); md.s=undefined; } }

  function size(){ const dpr=Math.min(2,window.devicePixelRatio||1); cv._dpr=dpr; cv.width=box.clientWidth*dpr; cv.height=box.clientHeight*dpr; }
  function build(){
    box=document.createElement("div"); box.id="pb"; box.setAttribute("role","dialog"); box.setAttribute("aria-label","Better Free pinball");
    box.innerHTML='<div class="pb-3d"></div><canvas aria-label="Pinball table"></canvas><button class="pb-x" aria-label="Close pinball, back to the arcade">✕</button>';
    document.body.appendChild(box); cv=box.querySelector("canvas"); cx=cv.getContext("2d");
    box.querySelector(".pb-x").addEventListener("click",close);
    cv.addEventListener("touchstart",ts,{passive:false}); cv.addEventListener("touchend",te,{passive:false}); cv.addEventListener("touchcancel",te,{passive:false});
    cv.addEventListener("pointerdown",md); addEventListener("pointerup",mu);
    addEventListener("keydown",kd); addEventListener("keyup",ku); addEventListener("resize",()=>{ if(open){ size(); window.MSPB3D&&window.MSPB3D.ok&&window.MSPB3D.resize(); } });
    ui={touch:matchMedia("(pointer:coarse)").matches};
  }
  function openG(){ if(!box) build(); reset(); load3D(); musLoad(); open=true; box.classList.add("on"); size(); msgT=0; last=0; if(!raf) raf=requestAnimationFrame(loop); }
  function close(){ musStop(.3); open=false; box&&box.classList.remove("on"); FL.forEach(f=>f.up=false); }
  window.MSPinball={open:openG,close,isOpen:()=>open,
    _dbg:()=>({balls:BALLS,score,state,ballsLeft,level,cleared,freed:[...freed],mode,trans,L1S,L2S,L3S,BOSS,msg,msg2}),
    _sim:(t,hold)=>{ if(state==="ready") state="play"; for(const f of FL) f.up=false; if(hold!=null) FL[hold].up=true; for(let i=0;i<t*60;i++) update(1/60); const b=BALLS[0]||{}; return [b.x,b.y,b.vx,b.vy]; },
    _put:(x,y,vx,vy)=>{ const b=BALLS[0]||mkBall(x,y); Object.assign(b,{x,y,vx,vy,inLane:false,auto:false,held:0,ramp:null}); BALLS=[b]; },
    _go:(n)=>{ state="play"; trans={kind:"climb",t:0,dur:.01,to:n,swapped:false}; for(let i=1;i<n;i++) cleared[i]=true; update(.02); },
    _clear:()=>{ cleared[level]=true; }, _free:(n)=>{ GIRLS.slice(0,n).forEach(setFree); }, _hit:(id)=>{ const t=LV.tgts.find(t=>t.id===id); if(t){ t.cool=0; onTarget(t,BALLS[0]||{},100); } }, _boss:()=>BOSS, _win:()=>win(),
    _tick:(dt,l,r)=>{ FL[0].up=l; FL[1].up=r; const lane=BALLS.find(b=>b.inLane&&!b.auto); if(lane&&state==="play"&&!trans&&!BALLS.some(b=>!b.inLane)){ lane.vy=-(720+Math.random()*280); lane.y-=2; } update(dt); }};
})();
