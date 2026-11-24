/* Motel Smile: band close-up intro (test). Opens tight on the band like a classic band homepage,
   then pulls back to the full roof on "Step onto the roof", scroll/swipe/keys, or a 20 s countdown on the button.
   Returning visitors skip it (localStorage ms-intro-seen); ?intro forces it; the Motel Smile logo (top left) replays it. */
(() => {
  const st = document.getElementById("stage"), play = document.getElementById("play");
  if (!st || !play) return;
  const q = new URLSearchParams(location.search);
  if (q.has("nointro")) return;
  let seen = false;
  try { seen = localStorage.getItem("ms-intro-seen") === "1"; } catch (e) {}
  const force = q.has("intro");

  const css = `
  body.ms-in #stage>:not(#play):not(.ph-ext):not(.sky){opacity:0!important;pointer-events:none!important;transition:opacity .5s}
  body.ms-in #pill-listen,body.ms-in #tags,body.ms-in #play .pill,body.ms-in .bn-tag,body.ms-in #jar-help{opacity:0!important;pointer-events:none!important;transition:opacity .5s}
  body.ms-out #stage>:not(#play):not(.ph-ext):not(.sky){transition:opacity .9s .9s}
  #stage{transform-origin:0 0}
  html.ms-lock,html.ms-lock body{overflow:clip!important;overscroll-behavior:none}
  #stage.ms-cam{transition:scale 2.2s cubic-bezier(.65,0,.25,1),translate 2.2s cubic-bezier(.65,0,.25,1)}
  #ms-in{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;
    padding:0 max(28px,5vw) max(34px,5vh);box-sizing:border-box;color:#f6f3ff;font-family:var(--mono);
    background:linear-gradient(rgba(5,6,10,.85),rgba(5,6,10,.35) 12%,transparent 24%),radial-gradient(120% 90% at 50% 40%,transparent 45%,rgba(5,6,10,.55) 100%),linear-gradient(transparent 52%,rgba(5,6,10,.82));
    transition:opacity .8s;animation:msFade 1.2s both}
  #ms-in.bye{opacity:0;pointer-events:none}
  @keyframes msFade{from{opacity:0}}
  #ms-in h1{margin:0;font-family:var(--script);font-weight:400;font-size:clamp(54px,8vw,112px);line-height:.9;
    color:#fff;text-shadow:0 0 6px #ff3d7f,0 0 22px #ff3d7f,0 0 44px rgba(255,61,127,.6)}
  #ms-in .tag{margin:6px 0 18px 4px;font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:#d6f0ff;opacity:.85}
  #ms-in .show{all:unset;cursor:pointer;display:block;margin:0 0 20px 4px;font-family:var(--tube);font-size:20px;color:#3ce6ff;text-shadow:0 0 10px rgba(60,230,255,.7)}
  #ms-in .show small{display:block;font-family:var(--mono);font-size:11px;letter-spacing:.24em;color:#b3bccd;text-shadow:none;margin-bottom:3px}
  #ms-in .row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  #ms-in .row .pill{font-size:17px}
  #ms-in .go{all:unset;cursor:pointer;position:absolute;right:max(28px,5vw);bottom:max(34px,5vh);font-family:var(--tube);font-size:19px;
    padding:13px 18px 13px 24px;border-radius:40px;border:2.5px solid rgba(255,178,61,.28);color:#fff;background:rgba(5,6,10,.6);
    box-shadow:0 0 14px rgba(255,178,61,.45);text-shadow:0 0 8px #ffb23d;animation:msPulse 2.4s 2s infinite;display:inline-flex;align-items:center;gap:10px}
  #ms-in .go svg{position:absolute;left:-2.5px;top:-2.5px;overflow:visible;pointer-events:none}
  #ms-in .go rect{fill:none;stroke:#ffb23d;stroke-width:3px;stroke-linecap:round;filter:drop-shadow(0 0 5px #ffb23d)}
  #ms-in .go .cd{font-family:var(--mono);font-weight:600;font-size:14px;min-width:2.2em;height:2.2em;line-height:2.2em;text-align:center;border-radius:50%;
    background:#ffb23d;color:#14090a;text-shadow:none;box-shadow:0 0 10px #ffb23d}
  #ms-in .go i{font-style:normal;display:inline-block;margin-left:-2px;animation:msNudge 1.2s infinite}
  @keyframes msPulse{50%{box-shadow:0 0 26px rgba(255,178,61,.7),0 0 4px #fff}}
  @keyframes msNudge{50%{transform:translate(4px,-3px)}}
  .ms-poi{animation:msPoi 1.6s ease-out 2}
  @keyframes msPoi{0%,100%{filter:none}40%{filter:drop-shadow(0 0 10px #ffe27a) drop-shadow(0 0 22px #ffb23d) brightness(1.35)}}
  @media (max-width:700px){
    #ms-in{align-items:center;text-align:center;padding:0 18px calc(26px + env(safe-area-inset-bottom))}
    #ms-in .tag{margin:6px 0 12px}#ms-in .show{margin:0 0 16px}
    #ms-in .row{justify-content:center}
    #ms-in .go{position:relative;right:auto;bottom:auto;margin-top:16px}
  }
  @media (max-height:500px) and (orientation:landscape){
    #ms-in{padding:0 max(20px,env(safe-area-inset-right)) 16px max(20px,env(safe-area-inset-left));
      background:linear-gradient(90deg,rgba(5,6,10,.8),rgba(5,6,10,.25) 45%,rgba(5,6,10,.25) 62%,rgba(5,6,10,.85)),linear-gradient(transparent 55%,rgba(5,6,10,.85))}
    #ms-in h1{font-size:46px}#ms-in .tag{margin:2px 0 8px 2px;font-size:10px}
    #ms-in .show{font-size:15px;margin:0 0 10px 2px}#ms-in .show small{font-size:9px}
    #ms-in .row{gap:8px}#ms-in .row .pill{font-size:13px;padding:6px 12px}
    #ms-in .go{font-size:15px;padding:8px 10px 8px 16px;right:max(20px,env(safe-area-inset-right));bottom:16px}
    #ms-in .go .cd{font-size:12px}
  }
  /* intro music player: full-screen on phones, big centered card on desktop */
  #ms-pl{position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(5,4,10,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
    animation:msFade .35s both;text-align:center;font-family:var(--mono)}
  #ms-pl[hidden]{display:none}
  #ms-pl .card{position:relative;width:min(480px,92vw);max-height:92vh;box-sizing:border-box;padding:30px 34px 28px;border-radius:24px;border:1.5px solid var(--pink);
    background:radial-gradient(120% 60% at 50% 18%,rgba(255,61,127,.28),transparent 60%),linear-gradient(#150b1b,#07050b);
    box-shadow:0 0 30px rgba(255,61,127,.35),0 30px 60px rgba(0,0,0,.7);display:flex;flex-direction:column;align-items:center;animation:msUp .4s cubic-bezier(.2,.9,.25,1.1) both}
  @keyframes msUp{from{transform:translateY(40px);opacity:0}}
  #ms-pl .x{all:unset;cursor:pointer;position:absolute;top:12px;right:14px;width:40px;height:40px;display:grid;place-items:center;font:400 24px system-ui;color:#fff;opacity:.8}
  #ms-pl .x:hover{opacity:1}
  #ms-pl .h{font-size:11px;letter-spacing:.26em;color:var(--pink);text-transform:uppercase;text-shadow:0 0 8px rgba(255,61,127,.6)}
  #ms-pl .rec{position:relative;width:min(300px,62vw,38vh);aspect-ratio:1;margin:18px 0 20px;border-radius:50%;
    background:repeating-radial-gradient(circle,#0b0b0e 0 2px,#17171c 2px 3px);box-shadow:0 0 0 2px #26262e,0 16px 36px rgba(0,0,0,.75),0 0 46px rgba(255,61,127,.25);
    animation:msSpin 3.2s linear infinite;animation-play-state:paused}
  #ms-pl.on .rec{animation-play-state:running}
  #ms-pl .rec::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(130deg,rgba(255,255,255,.1),transparent 40%)}
  #ms-pl .rec img{position:absolute;inset:30%;width:40%;height:40%;border-radius:50%;object-fit:cover;box-shadow:0 0 0 6px #ff3d7f;background:#ff3d7f}
  @keyframes msSpin{to{transform:rotate(360deg)}}
  #ms-pl .t{font-family:var(--tube);font-size:32px;color:#fff;text-shadow:0 0 12px rgba(255,61,127,.6);line-height:1.15}
  #ms-pl .a{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:rgba(214,240,255,.75);margin-top:4px}
  #ms-pl .sk{display:flex;align-items:center;gap:10px;width:100%;margin-top:22px;font-size:12px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;user-select:none;-webkit-user-select:none}
  #ms-pl .sk span{min-width:40px;text-align:left}#ms-pl .sk span:last-child{text-align:right}
  #ms-pl .tr{position:relative;flex:1;height:30px;cursor:pointer;touch-action:none}
  #ms-pl .tr::before{content:"";position:absolute;left:0;right:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:rgba(255,255,255,.18)}
  #ms-pl .tr i{position:absolute;left:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:var(--pink);box-shadow:0 0 8px rgba(255,61,127,.7)}
  #ms-pl .tr b{position:absolute;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,61,127,.55),0 0 10px rgba(255,61,127,.8);transition:transform .15s}
  #ms-pl .tr.drag b{transform:scale(1.3)}
  #ms-pl .ctl{display:flex;align-items:center;justify-content:center;gap:30px;margin-top:12px}
  #ms-pl .ctl button{all:unset;cursor:pointer;display:grid;place-items:center;color:#fff;border-radius:50%}
  #ms-pl .ctl svg{fill:currentColor}
  #ms-pl .ctl .s{width:48px;height:48px;opacity:.85}#ms-pl .ctl .s svg{width:26px;height:26px}
  #ms-pl .ctl .s:hover{opacity:1;background:rgba(255,255,255,.07)}
  #ms-pl .ctl .pp{width:74px;height:74px;border:2.5px solid var(--pink);box-shadow:0 0 18px rgba(255,61,127,.6),inset 0 0 12px rgba(255,61,127,.3);background:rgba(255,61,127,.12)}
  #ms-pl .ctl .pp svg{width:30px;height:30px}
  #ms-pl .vol{display:flex;align-items:center;gap:10px;margin-top:18px;color:rgba(255,255,255,.7)}
  #ms-pl .vol svg{width:18px;height:18px;fill:currentColor}
  #ms-pl .vol input{width:160px;accent-color:#ff3d7f;cursor:pointer}
  @media (hover:none){#ms-pl .vol{display:none}}
  #ms-pl .nx{margin-top:18px;font-size:11px;letter-spacing:.14em;color:rgba(255,255,255,.45);min-height:1.2em;transition:color .3s}
  #ms-pl .nx.hi{color:#ffb23d}
  @media (max-width:700px){
    #ms-pl{background:none;backdrop-filter:none;-webkit-backdrop-filter:none}
    #ms-pl .card{width:100%;height:100%;max-height:none;border-radius:0;border:0;justify-content:center;
      padding:calc(54px + env(safe-area-inset-top)) 26px calc(26px + env(safe-area-inset-bottom))}
    #ms-pl .x{top:calc(10px + env(safe-area-inset-top));right:auto;left:10px;font-size:30px}
    #ms-pl .rec{width:min(78vw,44vh)}
    #ms-pl .t{font-size:30px}
  }
  @media (max-height:500px) and (orientation:landscape){
    #ms-pl .card{width:min(720px,94vw);display:grid;grid-template-columns:auto 1fr;column-gap:28px;align-items:center;text-align:left;padding:20px 28px}
    #ms-pl .rec{grid-row:1/8;width:min(42vh,200px);margin:0}
    #ms-pl .ctl{justify-content:flex-start}
  }`;
  const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

  const txt = id => (document.getElementById(id) || {}).textContent || "";
  const W = () => innerWidth, H = () => innerHeight, phone = () => innerWidth <= 700;

  // camera: frame the band (sprites + kit) tight, faces in the upper third
  function cam() {
    // measure in un-zoomed screen space (undo the current camera if one is applied)
    const k = cur || { z: 1, tx: 0, ty: 0 };
    const els = [...play.querySelectorAll(".bm,.bm-kit")].map(e => e.getBoundingClientRect())
      .filter(r => r.width > 20 * k.z)
      .map(r => ({ left: (r.left - k.tx) / k.z, right: (r.right - k.tx) / k.z, top: (r.top - k.ty) / k.z, bottom: (r.bottom - k.ty) / k.z }));
    if (!els.length) return null;
    const x0 = Math.min(...els.map(r => r.left)), x1 = Math.max(...els.map(r => r.right));
    const y0 = Math.min(...els.map(r => r.top)), y1 = Math.max(...els.map(r => r.bottom));
    const bw = x1 - x0, bh = y1 - y0;
    let z, cx = (x0 + x1) / 2, cy, ty;
    if (H() <= 500 && W() > H()) { z = Math.min(2.2, .9 * H() / bh, .62 * W() / bw); cy = y0 + bh * .5; ty = H() * .48; }   // phone on its side
    else if (phone()) { z = Math.min(1.75, 1.08 * W() / bw); cy = y0 + bh * .42; ty = H() * .36; }   // waist-up
    else { z = Math.min(2.2, .78 * H() / bh, .9 * W() / bw); cy = y0 + bh * .47; ty = H() * .44; }
    z = Math.max(1.15, z);
    return { z, tx: W() / 2 - z * cx, ty: ty - z * cy };
  }
  let cur = null;
  const setCam = c => { cur = c; st.style.scale = c ? String(c.z) : ""; st.style.translate = c ? `${c.tx}px ${c.ty}px` : ""; };

  let ui, bv, timer, idle = 20000, live = false;

  function build() {
    ui = document.createElement("div"); ui.id = "ms-in";
    const when = txt("ss-a").trim(), cnt = txt("ss-b").trim();
    ui.innerHTML = `<h1>Motel Smile</h1><div class="tag">New York Rock</div>
      ${when ? `<button class="show" data-k="shows"><small>Next show</small>${when}${cnt ? " · " + cnt : ""}</button>` : ""}
      <div class="row"><button class="pill" style="--c:var(--pink)" data-k="play"><span class="tri"></span> <span class="pl">Play “${(txt("np-title") || "Don't Mind It").trim()}”</span></button>
      <button class="pill" style="--c:var(--blue)" data-k="follow">Follow</button></div>
      <button class="go" data-k="go"><svg><rect pathLength="100"/></svg>Step onto the roof<i>↗</i><b class="cd"></b></button>`;
    document.body.appendChild(ui);
    ui.addEventListener("click", e => {
      const k = (e.target.closest("[data-k]") || {}).dataset?.k;
      if (k === "play") { openPlayer(); return; }
      if (k === "follow" || k === "shows") { reveal(() => { const t = document.querySelector(`#bar [data-open="${k}"]`); t && t.click(); }); return; }
      if (k === "go") reveal();   // taps elsewhere don't leave the close-up
    });
  }
  // countdown: seconds in the badge, ring around the button drains as the time runs out
  let raf = 0;
  function bump(ms) {
    clearTimeout(timer); cancelAnimationFrame(raf);
    const go = ui && ui.querySelector(".go"); if (!go) return;
    const svg = go.querySelector("svg"), r = svg.querySelector("rect"), cd = go.querySelector(".cd");
    const fit = () => { const w = go.offsetWidth, h = go.offsetHeight;
      svg.setAttribute("width", w); svg.setAttribute("height", h);
      r.setAttribute("x", 1.25); r.setAttribute("y", 1.25); r.setAttribute("width", w - 2.5); r.setAttribute("height", h - 2.5);
      r.setAttribute("rx", (h - 2.5) / 2); r.style.strokeDasharray = "100 100"; };
    fit();
    const t0 = performance.now();
    const tick = now => {
      if (!ui) return;
      const left = Math.max(0, ms - (now - t0));
      r.style.strokeDashoffset = String(-100 * (1 - left / ms));
      cd.textContent = Math.ceil(left / 1000);
      if (left > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timer = setTimeout(() => reveal(), ms);
  }

  // ---------- intro music player ----------
  const au = document.getElementById("lg-audio");
  let pl = null, plOn = false, plRaf = 0, dragging = false;
  const fmt = x => { x = Math.max(0, Math.floor(x || 0)); return Math.floor(x / 60) + ":" + String(x % 60).padStart(2, "0"); };
  const I = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const P_PLAY = "M8 5v14l11-7z", P_PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";
  const isOn = () => au && !au.paused;
  const toggle = () => { const b = document.getElementById("np-pp"); if (b) b.click(); else if (au) au.paused ? au.play() : au.pause(); };
  function buildPlayer() {
    pl = document.createElement("div"); pl.id = "ms-pl"; pl.setAttribute("role", "dialog"); pl.setAttribute("aria-label", "Music player");
    const title = (txt("np-title") || "Don't Mind It").trim();
    pl.innerHTML = `<div class="card"><button class="x" aria-label="Close player">✕</button><div class="h">Now playing</div>
      <div class="rec"><img src="img/smile-label-256.webp" alt=""></div>
      <div class="t">${title}</div><div class="a">Motel Smile</div>
      <div class="sk"><span class="el">0:00</span><div class="tr" role="slider" tabindex="0" aria-label="Song position"><i></i><b></b></div><span class="rm">-0:00</span></div>
      <div class="ctl"><button class="s pv" aria-label="Previous">${I("M6 5h2v14H6zM20 5v14L9 12z")}</button>
        <button class="pp" aria-label="Play">${I(P_PLAY)}</button>
        <button class="s nx-b" aria-label="Next">${I("M16 5h2v14h-2zM4 5v14l11-7z")}</button></div>
      <label class="vol">${I("M4 9v6h4l5 4V5L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z")}<input type="range" min="0" max="1" step="0.01" aria-label="Volume"></label>
      <div class="nx">Up next: more songs coming soon</div></div>`;
    ui.appendChild(pl);
    const q = c => pl.querySelector(c), tr = q(".tr"), vin = q(".vol input");
    pl.addEventListener("click", e => { e.stopPropagation(); if (e.target === pl) closePlayer(); });
    q(".x").addEventListener("click", closePlayer);
    q(".pp").addEventListener("click", toggle);
    q(".pv").addEventListener("click", () => { if (au) { au.currentTime = 0; paintP(); } });
    q(".nx-b").addEventListener("click", () => { const n = q(".nx"); n.textContent = "More songs coming soon"; n.classList.add("hi"); setTimeout(() => n.classList.remove("hi"), 1400); });
    if (au) { vin.value = au.volume; vin.addEventListener("input", () => { au.volume = +vin.value; }); }
    const at = x => { const r = tr.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
    let f = 0;
    tr.addEventListener("pointerdown", e => { if (!au || !isFinite(au.duration)) return; dragging = true; tr.classList.add("drag"); tr.setPointerCapture(e.pointerId); f = at(e.clientX); showP(f * au.duration); });
    tr.addEventListener("pointermove", e => { if (dragging) { f = at(e.clientX); showP(f * au.duration); } });
    const end = () => { if (!dragging) return; dragging = false; tr.classList.remove("drag"); au.currentTime = f * au.duration; paintP(); };
    tr.addEventListener("pointerup", end); tr.addEventListener("pointercancel", end);
    tr.addEventListener("keydown", e => {
      if (!au) return;
      if (e.key === "ArrowRight") { au.currentTime = Math.min(au.duration || 0, au.currentTime + 5); e.preventDefault(); }
      if (e.key === "ArrowLeft") { au.currentTime = Math.max(0, au.currentTime - 5); e.preventDefault(); }
      paintP();
    });
  }
  function showP(t) {
    if (!pl) return;
    const d = au && isFinite(au.duration) ? au.duration : 0, f = d ? t / d : 0;
    pl.querySelector(".tr i").style.width = f * 100 + "%"; pl.querySelector(".tr b").style.left = f * 100 + "%";
    pl.querySelector(".el").textContent = fmt(t); pl.querySelector(".rm").textContent = "-" + fmt(d - t);
    const on = isOn(); pl.classList.toggle("on", on);
    const pp = pl.querySelector(".pp"); pp.setAttribute("aria-label", on ? "Pause" : "Play"); pp.querySelector("path").setAttribute("d", on ? P_PAUSE : P_PLAY);
  }
  function paintP() { if (pl && !dragging) showP(au ? au.currentTime : 0); }
  function openPlayer() {
    if (!ui) return;
    if (!pl) buildPlayer();
    pl.hidden = false; plOn = true;
    clearTimeout(timer); cancelAnimationFrame(raf);          // the countdown waits while the player is open
    if (!isOn()) toggle();
    const loop = () => { paintP(); if (plOn) plRaf = requestAnimationFrame(loop); };
    cancelAnimationFrame(plRaf); plRaf = requestAnimationFrame(loop);
    setTimeout(() => pl && pl.querySelector(".pp").focus({ preventScroll: true }), 50);
  }
  function closePlayer() {
    if (!pl || !plOn) return;
    plOn = false; pl.hidden = true; cancelAnimationFrame(plRaf);
    const lab = ui && ui.querySelector(".pl"); if (lab) lab.textContent = isOn() ? "Now playing" : lab.textContent;
    if (ui && live) bump(idle);
  }

  const onWheel = () => { if (!plOn) reveal(); };
  let ty0 = null;
  const onTs = e => { ty0 = e.touches[0].clientY; };
  const onTm = e => { if (!plOn && ty0 != null && Math.abs(e.touches[0].clientY - ty0) > 30) reveal(); };
  const onKey = e => { if (plOn) { if (e.key === "Escape") closePlayer(); return; } if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", " ", "PageDown", "Enter", "Escape"].includes(e.key)) reveal(); };
  const onResize = () => { if (live && !st.classList.contains("ms-cam")) setCam(cam()); };

  function start() {
    const c = cam(); if (!c) return;
    live = true;
    document.documentElement.classList.add("ms-lock");
    document.body.classList.add("ms-in");
    st.classList.remove("ms-cam"); setCam(c);
    build(); bump(idle);
    requestAnimationFrame(() => document.documentElement.classList.remove("ms-pre"));
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onTs, { passive: true });
    addEventListener("touchmove", onTm, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("resize", onResize);
  }

  function reveal(after) {
    if (!live) return; live = false; clearTimeout(timer); cancelAnimationFrame(raf); plOn = false; cancelAnimationFrame(plRaf); pl = null;
    removeEventListener("wheel", onWheel); removeEventListener("touchstart", onTs);
    removeEventListener("touchmove", onTm); removeEventListener("keydown", onKey); removeEventListener("resize", onResize);
    try { localStorage.setItem("ms-intro-seen", "1"); } catch (e) {}
    ui.classList.add("bye");
    document.body.classList.add("ms-out");
    st.classList.add("ms-cam"); void st.offsetWidth;
    requestAnimationFrame(() => setCam(null));
    document.body.classList.remove("ms-in");
    // light up the things worth tapping while the camera pulls back
    ["pk-jar", "pk-jill", "binoc", "lng-sign", "pk-arcade", "pk-crate"].forEach((id, i) => {
      const e = document.getElementById(id); if (!e) return;
      setTimeout(() => { e.classList.add("ms-poi"); setTimeout(() => e.classList.remove("ms-poi"), 3300); }, 900 + i * 380);
    });
    setTimeout(() => {
      ui.remove(); ui = null; st.classList.remove("ms-cam"); document.body.classList.remove("ms-out");
      document.documentElement.classList.remove("ms-lock"); scrollTo(0, 0);
      bandBtn(); after && after();
    }, 2300);
  }

  // the Motel Smile logo (top left) takes you back to the band close-up
  function bandBtn() {
    if (bv) return;
    bv = document.querySelector("header.top > div"); if (!bv) return;
    bv.setAttribute("role", "button"); bv.setAttribute("tabindex", "0"); bv.setAttribute("aria-label", "Motel Smile: band view");
    bv.style.cursor = "pointer";
    const busy = () => live || st.classList.contains("ms-cam") || document.querySelector(".sheet.open, .lounge.open, .arcade.open, #lw.open")
      || /\b(in-room|dk-on|jx-on|jx-zoom|gg-on|gm-on|lw-on|gr-big)\b/.test(document.body.className);
    const goBand = () => { if (!busy()) replay(); };
    // on phones the logo box collapses, so listen on the whole header and ignore its right-hand buttons
    bv.closest("header").addEventListener("click", e => { if (e.clientX < 230 && !e.target.closest("header.top > span, button, a")) goBand(); });
    bv.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goBand(); } });
  }
  function replay() {
    const c = cam(); if (!c) return;
    document.documentElement.classList.add("ms-lock");
    st.classList.add("ms-cam"); document.body.classList.add("ms-in");
    void st.offsetWidth; setCam(c);
    setTimeout(() => { st.classList.remove("ms-cam"); live = true; build(); bump(idle);
      addEventListener("wheel", onWheel, { passive: true }); addEventListener("touchstart", onTs, { passive: true });
      addEventListener("touchmove", onTm, { passive: true }); addEventListener("keydown", onKey); addEventListener("resize", onResize);
    }, 2200);
  }

  window.MSIntro = { start, reveal, replay };
  const go = () => {
    // start as soon as the band is laid out and holding still (no waiting for every image on the page)
    let n = 0, last = "";
    const t = setInterval(() => {
      const c = cam(), key = c ? [c.z, c.tx, c.ty].map(v => Math.round(v)).join() : "";
      const ready = c && key === last;
      last = key;
      if (ready || ++n > 60) {
        clearInterval(t);
        if (seen && !force) bandBtn(); else start();
        document.documentElement.classList.remove("ms-pre");
        // re-frame once everything has loaded, in case the roof fit shifted
        const refit = () => { if (live && !st.classList.contains("ms-cam")) setCam(cam()); };
        if (document.readyState === "complete") refit(); else addEventListener("load", () => setTimeout(refit, 50));
      }
    }, 50);
  };
  const unpre = () => document.documentElement.classList.remove("ms-pre");
  setTimeout(unpre, 6000);   // never leave the page blank
  window.__msUnpre = unpre;
  if (document.readyState !== "loading") go(); else addEventListener("DOMContentLoaded", go);
})();
