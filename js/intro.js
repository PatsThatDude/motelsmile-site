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
  /* intro music player: same look as the roof's Listen window (EQ bars, record, shelf), no band */
  #ms-pl{position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(5,4,10,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    animation:msFade .35s both;text-align:center;font-family:var(--mono)}
  #ms-pl[hidden]{display:none}
  #ms-pl .card{position:relative;overflow:hidden;width:min(520px,92vw);max-height:94vh;box-sizing:border-box;padding:26px 0 18px;border-radius:20px;border:1.5px solid var(--pink);
    background:radial-gradient(120% 60% at 50% 20%,rgba(255,61,127,.28),transparent 60%),linear-gradient(#150b1b,#07050b);
    box-shadow:0 0 24px rgba(255,61,127,.35),0 20px 40px rgba(0,0,0,.7);display:flex;flex-direction:column;align-items:center;animation:msUp .38s cubic-bezier(.2,.9,.25,1.1) both}
  @keyframes msUp{from{transform:translateY(40px);opacity:0}}
  #ms-pl canvas.eq{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;border-radius:inherit}
  #ms-pl .card>:not(canvas){position:relative;z-index:1}
  #ms-pl .x{all:unset;cursor:pointer;position:absolute!important;top:10px;right:12px;width:36px;height:36px;display:grid;place-items:center;font:400 22px system-ui;color:#fff;opacity:.8;z-index:3!important}
  #ms-pl .x:hover{opacity:1}
  #ms-pl .h{font:600 11px var(--mono);letter-spacing:.22em;color:var(--pink);text-shadow:0 0 8px rgba(255,61,127,.6);text-transform:uppercase}
  #ms-pl .rec{position:relative;width:min(230px,52vw,30vh);aspect-ratio:1;margin:14px 0 12px;border-radius:50%;flex:none}
  #ms-pl .disc{position:absolute;inset:0;border-radius:50%;background:repeating-radial-gradient(circle,#0b0b0e 0 2px,#17171c 2px 3px);
    box-shadow:0 0 0 2px #26262e,0 12px 30px rgba(0,0,0,.75),0 0 40px rgba(255,61,127,.2);will-change:transform}
  #ms-pl .rec{cursor:grab;touch-action:none}#ms-pl .rec.grab{cursor:grabbing}
  #ms-pl .hint{font:500 9.5px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin:-4px 0 6px;transition:opacity .4s}
  #ms-pl .hint.off{opacity:0}
  #ms-pl .disc::after{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,transparent 0 12%,rgba(255,255,255,.08) 16%,transparent 22% 62%,rgba(255,255,255,.06) 66%,transparent 72%)}
  #ms-pl .lab{position:absolute;inset:31%;border-radius:50%;background:center/cover no-repeat #ff3d7f;box-shadow:0 0 0 5px #ff3d7f}
  #ms-pl .sheen{position:absolute;inset:0;border-radius:50%;pointer-events:none;background:linear-gradient(130deg,rgba(255,255,255,.09),transparent 40%)}
  @keyframes msSpin{to{transform:rotate(360deg)}}
  #ms-pl .t{font:400 28px "Tilt Neon",system-ui;color:#fff;text-shadow:0 0 10px rgba(255,61,127,.6);max-width:88%;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ms-pl .a{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:rgba(214,240,255,.7);margin-top:2px}
  #ms-pl .sk{display:flex;align-items:center;gap:10px;width:84%;margin-top:14px;font:500 12px var(--mono);color:rgba(255,255,255,.8);font-variant-numeric:tabular-nums;user-select:none;-webkit-user-select:none}
  #ms-pl .sk span{min-width:38px;text-align:left}#ms-pl .sk span:last-child{text-align:right}
  #ms-pl .tr,#ms-pl .vl{position:relative;flex:1;height:28px;cursor:pointer;touch-action:none}
  #ms-pl .tr::before,#ms-pl .vl::before{content:"";position:absolute;left:0;right:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:rgba(255,255,255,.16)}
  #ms-pl .tr i,#ms-pl .vl i{position:absolute;left:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:var(--pink);box-shadow:0 0 8px rgba(255,61,127,.7)}
  #ms-pl .tr b,#ms-pl .vl b{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,61,127,.5),0 0 10px rgba(255,61,127,.8);transition:transform .15s}
  #ms-pl .drag b{transform:scale(1.3)}
  #ms-pl .ctl{display:flex;align-items:center;justify-content:center;gap:26px;margin-top:6px}
  #ms-pl .ctl .s{all:unset;cursor:pointer;width:44px;height:44px;display:grid;place-items:center;border-radius:50%;color:#fff;opacity:.85}
  #ms-pl .ctl .s:hover{opacity:1;background:rgba(255,255,255,.07)}
  #ms-pl .ctl .s svg{width:22px;height:22px;fill:currentColor;filter:drop-shadow(0 0 6px rgba(255,61,127,.6))}
  #ms-pl .ctl .lg-pp{width:58px!important;height:58px!important;background:rgba(5,4,10,.4)}
  #ms-pl .vol{display:flex;align-items:center;gap:10px;width:52%;margin-top:6px;color:rgba(255,255,255,.65)}
  #ms-pl .vol svg{width:16px;height:16px;fill:currentColor;flex:none}
  @media (hover:none){#ms-pl .vol{display:none}}
  #ms-pl .shelf{width:100%;margin-top:14px;height:118px;overflow-x:auto;overflow-y:visible;white-space:nowrap;scroll-snap-type:x mandatory;
    padding:8px calc(50% - 40px) 2px;box-sizing:border-box;scrollbar-width:none}
  #ms-pl .shelf::-webkit-scrollbar{display:none}
  #ms-pl .r{all:unset;cursor:pointer;display:inline-flex;flex-direction:column;align-items:center;vertical-align:top;width:80px;margin:0 2px;scroll-snap-align:center}
  #ms-pl .cv{position:relative;width:80px;height:80px;border-radius:3px;overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08);background:var(--cb);
    display:flex;flex-direction:column;justify-content:space-between;padding:6px;box-sizing:border-box;text-align:left;white-space:normal}
  #ms-pl .cv::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 45%),repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0 2px,transparent 2px 4px);pointer-events:none}
  #ms-pl .cv b{font:400 13px/1.02 "Tilt Neon",system-ui;color:var(--ct);text-shadow:0 0 6px var(--ct);position:relative}
  #ms-pl .cv small{font:600 6.5px var(--mono);letter-spacing:.18em;color:rgba(255,255,255,.7);position:relative}
  #ms-pl .cv img{position:absolute;right:5px;bottom:5px;width:18px;height:18px;opacity:.9}
  #ms-pl .cv.art{padding:0}#ms-pl .cv.art img{position:static;width:100%;height:100%;opacity:1}
  #ms-pl .r em{display:block;margin-top:6px;width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;font:400 11px "Tilt Neon",system-ui;font-style:normal;color:#fff}
  #ms-pl .r small.so{display:block;font:600 7.5px var(--mono);letter-spacing:.14em;color:rgba(255,255,255,.4)}
  #ms-pl .r.soon .cv{filter:saturate(.55) brightness(.75)}#ms-pl .r.soon em{color:rgba(255,255,255,.45)}
  #ms-pl .r.cur .cv{box-shadow:0 0 0 2px var(--pink),0 0 18px rgba(255,61,127,.6),0 8px 18px rgba(0,0,0,.7)}
  #ms-pl .r.shake .cv{animation:msShake .4s}
  @keyframes msShake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}
  #ms-pl .toast{position:absolute;left:50%;bottom:132px;transform:translateX(-50%);background:rgba(0,0,0,.8);border:1px solid rgba(255,255,255,.2);border-radius:10px;
    padding:5px 10px;font:500 11px var(--mono);color:#fff;white-space:nowrap;opacity:0;transition:opacity .25s;z-index:4!important;pointer-events:none}
  #ms-pl .toast.on{opacity:1}
  @media (max-width:700px){
    #ms-pl{background:none;backdrop-filter:none;-webkit-backdrop-filter:none}
    #ms-pl .card{width:100%;height:100%;max-height:none;border-radius:0;border:0;justify-content:center;padding:calc(40px + env(safe-area-inset-top)) 0 calc(16px + env(safe-area-inset-bottom))}
    #ms-pl .x{top:calc(8px + env(safe-area-inset-top));right:auto;left:8px;font-size:28px;width:44px;height:44px}
    #ms-pl .rec{width:min(66vw,38vh)}
  }
  @media (max-height:500px) and (orientation:landscape){
    #ms-pl .card{width:min(760px,94vw);display:grid;grid-template-columns:auto 1fr;column-gap:24px;align-items:center;padding:16px 24px 10px;height:auto}
    #ms-pl .rec{grid-row:1/9;width:min(40vh,170px);margin:0}
    #ms-pl .sk{width:100%}#ms-pl .shelf{grid-column:1/3;height:100px;margin-top:6px}
  }
`;
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
  // One shared tap on the song so this player and the roof's Listen window can both draw EQ bars:
  // the first createMediaElementSource for an element builds source -> hub -> speakers; later calls
  // hand back a stand-in that taps the hub (and their analyser -> speakers hop is skipped so nothing doubles).
  const au = document.getElementById("lg-audio");
  (() => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC || AC.prototype.__msHub) return;
    const orig = AC.prototype.createMediaElementSource, oc = AudioNode.prototype.connect, hubs = new WeakMap(), tapped = new WeakSet();
    AC.prototype.__msHub = 1;
    AC.prototype.createMediaElementSource = function (el) {
      let g = hubs.get(el);
      if (!g) { const src = orig.call(this, el); g = this.createGain(); oc.call(src, g); oc.call(g, this.destination); hubs.set(el, g); }
      return { connect: (n, ...r) => { tapped.add(n); return oc.call(g, n, ...r); }, disconnect() {} };
    };
    AudioNode.prototype.connect = function (n, ...r) {
      if (tapped.has(this) && typeof AudioDestinationNode !== "undefined" && n instanceof AudioDestinationNode) return n;
      return oc.call(this, n, ...r);
    };
  })();
  let an = null, abuf = null;
  const tap = () => {
    if (an || !au) return;
    try { const c = window.MSAC && window.MSAC(); if (!c) return; const src = c.createMediaElementSource(au);
      an = c.createAnalyser(); an.fftSize = 128; an.smoothingTimeConstant = .5; src.connect(an); abuf = new Uint8Array(an.frequencyBinCount); } catch (e) { an = null; }
  };
  let pl = null, plOn = false, plRaf = 0, dragging = false, spinning = false, ang = 0, lastNow = 0;
  const fmt = x => { x = Math.max(0, Math.floor(x || 0)); return Math.floor(x / 60) + ":" + String(x % 60).padStart(2, "0"); };
  const I = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const isOn = () => au && !au.paused;
  const toggle = () => { const b = document.getElementById("np-pp"); if (b) b.click(); else if (au) au.paused ? au.play() : au.pause(); };
  // the same record shelf the roof uses (read from its Listen window)
  const shelf = () => [...document.querySelectorAll("#lw-row .lw-r")].map(r => ({
    cv: (r.querySelector(".cv") || {}).outerHTML || "", name: (r.querySelector("em") || {}).textContent || "",
    soon: r.classList.contains("soon"), cur: r.classList.contains("cur") }));
  function buildPlayer() {
    pl = document.createElement("div"); pl.id = "ms-pl"; pl.setAttribute("role", "dialog"); pl.setAttribute("aria-label", "Music player");
    const title = (txt("np-title") || "Don't Mind It").trim();
    const recs = shelf();
    const lab = (document.getElementById("lw-lab") || {}).style?.backgroundImage;
    pl.innerHTML = `<div class="card"><canvas class="eq" aria-hidden="true"></canvas><button class="x" aria-label="Close player">✕</button><div class="h">Listen</div>
      <div class="rec" title="Spin the record to rewind or fast-forward"><div class="disc"><div class="lab"></div></div><div class="sheen"></div></div>
      <div class="hint">↺ spin the record to rewind · fast-forward ↻</div>
      <div class="t">${title}</div><div class="a">Motel Smile</div>
      <div class="sk"><span class="el">0:00</span><div class="tr" role="slider" tabindex="0" aria-label="Song position"><i></i><b></b></div><span class="rm">-0:00</span></div>
      <div class="ctl"><button class="s pv" aria-label="Previous">${I("M6 5h2v14H6zM20 5v14L9 12z")}</button>
        <button class="lg-pp" aria-label="Play"><i></i></button>
        <button class="s nx-b" aria-label="Next">${I("M16 5h2v14h-2zM4 5v14l11-7z")}</button></div>
      <div class="vol">${I("M4 9v6h4l5 4V5L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z")}<div class="vl" role="slider" tabindex="0" aria-label="Volume"><i></i><b></b></div></div>
      ${recs.length ? `<div class="shelf">${recs.map((r, k) => `<button class="r${r.soon ? " soon" : ""}${r.cur || (!r.soon && !recs.some(x => x.cur) && k === 0) ? " cur" : ""}" data-i="${k}">${r.cv}<em>${r.name}</em>${r.soon ? '<small class="so">SOON</small>' : ""}</button>`).join("")}</div>` : ""}
      <div class="toast"></div></div>`;
    ui.appendChild(pl);
    const q = c => pl.querySelector(c), tr = q(".tr"), vl = q(".vl");
    q(".lab").style.backgroundImage = lab && lab !== "none" ? lab : "url(img/smile-label-256.webp)";
    pl.addEventListener("click", e => { e.stopPropagation(); if (e.target === pl) closePlayer(); });
    q(".x").addEventListener("click", closePlayer);
    q(".lg-pp").addEventListener("click", () => { tap(); toggle(); });
    q(".pv").addEventListener("click", () => { if (au) { au.currentTime = 0; paintP(); } });
    let tt = 0;
    const toast = m => { const t = q(".toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 1500); };
    const soon = r => { r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake"); toast(r.querySelector("em").textContent + " · coming soon"); };
    q(".nx-b").addEventListener("click", () => { const c = q(".r.cur"), n = c && c.nextElementSibling; if (n && n.classList.contains("r")) { n.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); n.classList.contains("soon") ? soon(n) : null; } else toast("More songs coming soon"); });
    pl.querySelectorAll(".r").forEach(r => r.addEventListener("click", () => { if (r.classList.contains("soon")) soon(r); else if (!isOn()) { tap(); toggle(); } }));
    // sliders: progress (drag/tap/arrow keys) and volume
    const at = (el, x) => { const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
    let f = 0;
    tr.addEventListener("pointerdown", e => { if (!au || !isFinite(au.duration)) return; dragging = true; tr.classList.add("drag"); tr.setPointerCapture(e.pointerId); f = at(tr, e.clientX); showP(f * au.duration); });
    tr.addEventListener("pointermove", e => { if (dragging) { f = at(tr, e.clientX); showP(f * au.duration); } });
    const end = () => { if (!dragging) return; dragging = false; tr.classList.remove("drag"); au.currentTime = f * au.duration; paintP(); };
    tr.addEventListener("pointerup", end); tr.addEventListener("pointercancel", end);
    tr.addEventListener("keydown", e => {
      if (!au) return;
      if (e.key === "ArrowRight") { au.currentTime = Math.min(au.duration || 0, au.currentTime + 5); e.preventDefault(); }
      if (e.key === "ArrowLeft") { au.currentTime = Math.max(0, au.currentTime - 5); e.preventDefault(); }
      paintP();
    });
    const setV = v => { if (au) au.volume = v; vl.querySelector("i").style.width = v * 100 + "%"; vl.querySelector("b").style.left = v * 100 + "%"; vl.setAttribute("aria-valuenow", Math.round(v * 100)); };
    setV(au ? au.volume : 1);
    let vd = false;
    vl.addEventListener("pointerdown", e => { vd = true; vl.classList.add("drag"); vl.setPointerCapture(e.pointerId); setV(at(vl, e.clientX)); });
    vl.addEventListener("pointermove", e => { if (vd) setV(at(vl, e.clientX)); });
    const vend = () => { vd = false; vl.classList.remove("drag"); };
    vl.addEventListener("pointerup", vend); vl.addEventListener("pointercancel", vend);
    vl.addEventListener("keydown", e => { if (!au) return; if (e.key === "ArrowRight") setV(Math.min(1, au.volume + .05)); if (e.key === "ArrowLeft") setV(Math.max(0, au.volume - .05)); });
    // spin the record by hand to rewind / fast-forward (one full turn = 12 s), like the roof's record
    const rec = q(".rec");
    let last = null, acc = 0, seekT = 0;
    const angAt = e => { const r = rec.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    rec.addEventListener("pointerdown", e => {
      if (!au || !isFinite(au.duration)) return;
      spinning = true; rec.classList.add("grab"); rec.setPointerCapture(e.pointerId); last = angAt(e); acc = au.currentTime; seekT = 0;
      q(".hint").classList.add("off");
    });
    rec.addEventListener("pointermove", e => {
      if (!spinning) return;
      const a = angAt(e); let d = a - last; if (d > 180) d -= 360; if (d < -180) d += 360; last = a;
      ang += d; acc = Math.min(au.duration - .1, Math.max(0, acc + d / 360 * 12));
      showP(acc);
      const now = performance.now(); if (now - seekT > 90) { seekT = now; au.currentTime = acc; }
    });
    const spinEnd = () => { if (!spinning) return; spinning = false; rec.classList.remove("grab"); au.currentTime = acc; paintP(); };
    rec.addEventListener("pointerup", spinEnd); rec.addEventListener("pointercancel", spinEnd);
    const cur = q(".r.cur"); if (cur) requestAnimationFrame(() => cur.scrollIntoView({ inline: "center", block: "nearest" }));
  }
  function showP(t) {
    if (!pl) return;
    const d = au && isFinite(au.duration) ? au.duration : 0, f = d ? t / d : 0;
    pl.querySelector(".tr i").style.width = f * 100 + "%"; pl.querySelector(".tr b").style.left = f * 100 + "%";
    pl.querySelector(".el").textContent = fmt(t); pl.querySelector(".rm").textContent = "-" + fmt(d - t);
    const on = isOn(); pl.classList.toggle("on", on);
    const pp = pl.querySelector(".lg-pp"); pp.classList.toggle("playing", on); pp.setAttribute("aria-label", on ? "Pause" : "Play");
  }
  function paintP() { if (pl && !dragging && !spinning) showP(au ? au.currentTime : 0); }
  // the record turns on its own while the song plays (33 rpm-ish look: one turn per 1.8 s) and follows your hand when held
  function spin(now) {
    const dt = lastNow ? Math.min(.1, (now - lastNow) / 1000) : 0; lastNow = now;
    if (!spinning && isOn()) ang += dt * 200;
    const d = pl && pl.querySelector(".disc"); if (d) d.style.transform = `rotate(${ang}deg)`;
  }
  // EQ bars: same drawing as the roof's Listen window
  const NB = 24, eh = new Array(NB).fill(0), ef = new Array(NB).fill(.3), ec = new Array(NB).fill(.6);
  function drawEq(now) {
    const cv = pl && pl.querySelector("canvas.eq"); if (!cv) return;
    const a = cv.getContext("2d"), m = cv.getBoundingClientRect(), w = Math.min(2, devicePixelRatio || 1), g = Math.round(m.width * w), y = Math.round(m.height * w);
    if (cv.width !== g || cv.height !== y) { cv.width = g; cv.height = y; }
    if (!an && isOn()) tap();
    const p = isOn() && !au.muted;
    if (p && an) an.getByteFrequencyData(abuf);
    a.clearRect(0, 0, g, y);
    const C = .6 * y, A = .36 * y, S = .008 * g, bw = (.92 * g - 23 * S) / NB, B = .04 * g;
    for (let t = 0; t < NB; t++) {
      let e;
      if (p && an) {
        const n = Math.floor(Math.pow(t / NB, 1.6) * abuf.length * .85) + 1, z = Math.max(n + 1, Math.floor(Math.pow((t + 1) / NB, 1.6) * abuf.length * .85) + 1);
        let o = 0; for (let k = n; k < z; k++) o += abuf[k];
        const r = o / (z - n) / 255;
        ef[t] += (r - ef[t]) * (r < ef[t] ? .3 : .07); ec[t] = Math.max(r, .985 * ec[t], ef[t] + .12);
        const l = Math.min(1, Math.pow(Math.max(0, (r - ef[t]) / (ec[t] - ef[t])), 1.7));
        e = .2 * Math.min(1, Math.pow(r * (1 + t / NB * 1.1), 1.3)) + .8 * l;
      } else e = p ? .25 + .35 * Math.abs(Math.sin(now / 260 + .9 * t) * Math.sin(now / 410 + .37 * t)) : .04 + .03 * Math.sin(now / 900 + .5 * t);
      eh[t] += (e - eh[t]) * (e > eh[t] ? .65 : .22);
      const n = Math.max(2 * w, eh[t] * A), x = B + t * (bw + S), l = t / 23, gr = a.createLinearGradient(0, C - n, 0, C);
      gr.addColorStop(0, `rgba(${Math.round(255 - 195 * l)},${Math.round(61 + 169 * l)},${Math.round(127 + 128 * l)},.9)`); gr.addColorStop(1, "rgba(255,61,127,.15)");
      a.fillStyle = gr; a.shadowColor = `rgba(${Math.round(255 - 195 * l)},${Math.round(61 + 169 * l)},255,.8)`; a.shadowBlur = 10 * w;
      const d = 5 * w; for (let k = C - d; k > C - n; k -= d + 2 * w) a.fillRect(x, k, bw, d);
      a.shadowBlur = 0; a.fillStyle = `rgba(255,61,127,${.12 * eh[t] + .03})`; a.fillRect(x, C + 3 * w, bw, .35 * n);
    }
    const rg = a.createRadialGradient(g / 2, .32 * y, .05 * g, g / 2, .32 * y, .6 * g);
    rg.addColorStop(0, "rgba(8,5,12,.35)"); rg.addColorStop(1, "rgba(8,5,12,0)"); a.fillStyle = rg; a.fillRect(0, 0, g, y);
  }
  function openPlayer() {
    if (!ui) return;
    if (!pl) buildPlayer();
    pl.hidden = false; plOn = true;
    clearTimeout(timer); cancelAnimationFrame(raf);          // the countdown waits while the player is open
    tap(); if (!isOn()) toggle();
    lastNow = 0;
    const loop = now => { paintP(); spin(now); drawEq(now); if (plOn) plRaf = requestAnimationFrame(loop); };
    cancelAnimationFrame(plRaf); plRaf = requestAnimationFrame(loop);
    setTimeout(() => pl && pl.querySelector(".lg-pp").focus({ preventScroll: true }), 50);
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
