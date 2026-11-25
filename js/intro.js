/* Motel Smile: band close-up intro (test). Opens tight on the band like a classic band homepage,
   then pulls back to the full roof on "Step onto the roof", scroll/swipe/keys, or a 20 s countdown on the button.
   Returning visitors skip it (localStorage ms-intro-seen); ?intro forces it; the Motel Smile logo (top left) replays it. */
(() => {
  const st = document.getElementById("stage"), play = document.getElementById("play");
  if (!st || !play) return;
  const q = new URLSearchParams(location.search);
  if (q.has("nointro")) return;
  let seen = false;
  // shows on every visit (Pat, 2026-11-25); the old once-per-browser skip is off
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
  #ms-in .go{all:unset;cursor:pointer;position:relative;font-family:var(--tube);font-size:17px;
    padding:6px 7px 6px 20px;border-radius:40px;border:2.5px solid rgba(255,178,61,.28);color:#fff;background:rgba(5,6,10,.6);
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
  }
  @media (max-height:500px) and (orientation:landscape){
    #ms-in{padding:0 max(20px,env(safe-area-inset-right)) 16px max(20px,env(safe-area-inset-left));
      background:linear-gradient(90deg,rgba(5,6,10,.8),rgba(5,6,10,.25) 45%,rgba(5,6,10,.25) 62%,rgba(5,6,10,.85)),linear-gradient(transparent 55%,rgba(5,6,10,.85))}
    #ms-in h1{font-size:46px}#ms-in .tag{margin:2px 0 8px 2px;font-size:10px}
    #ms-in .show{font-size:15px;margin:0 0 10px 2px}#ms-in .show small{font-size:9px}
    #ms-in .row{gap:8px}#ms-in .row .pill{font-size:13px;padding:6px 12px}
    #ms-in .go{font-size:13px;padding:4px 5px 4px 13px}
    #ms-in .go .cd{font-size:12px}
  }
  /* Play on the close-up opens the site's own Listen window (#lw), moved above the intro, with no band peek */
  body.ms-in #lw{z-index:80!important}
  body.ms-in.lw-on #play,body.ms-in.lw-on #play *{animation-play-state:running!important}
  #ms-in.lwon>*{opacity:.18;transition:opacity .3s}
  body.ms-barup #bar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;z-index:66!important;opacity:1!important;pointer-events:auto!important;transform:none!important}
  body.ms-barup #bar [data-open=shows],body.ms-barup #bar [data-open=list]{display:none!important}
  body.ms-barup:not(.ph) #bar{grid-template-columns:7fr 2fr!important}
  body.ms-barup:not(.ph) #bar [data-open=follow]{grid-column:2!important;grid-row:1!important}
  body.ms-barup.ph #bar{grid-template-columns:1.15fr 1fr!important}
  body.ms-barup.ph #bar [data-open=follow]{grid-column:2!important;grid-row:1/-1!important;align-self:stretch!important;height:auto!important;min-height:0!important}
  body.ms-in #lw{z-index:80!important}
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

  // the roof's own Now playing + Follow cards sit under the close-up (same cards, lifted out of the zoomed roof); Shows stays as the text line
  let barHome = null, barHooked = false;
  function liftBar() {
    const bar = document.getElementById("bar"); if (!bar || !ui) return;
    if (!barHome) barHome = { p: bar.parentNode, n: bar.nextSibling };
    document.body.appendChild(bar); document.body.classList.add("ms-barup");
    const fit = () => { if (ui) ui.style.paddingBottom = (bar.getBoundingClientRect().height + 16) + "px"; };
    fit(); requestAnimationFrame(fit);
    if (!barHooked) {
      barHooked = true;
      bar.addEventListener("click", e => {
        if (!live) return;
        if (e.target.closest("#np-t")) { e.stopPropagation(); e.preventDefault(); openPlayer(); return; }
        const fo = e.target.closest('[data-open="follow"]');
        if (fo) { e.stopPropagation(); e.preventDefault(); reveal(() => fo.click()); return; }
        if (e.target.closest("#np-pp")) bump(30000);
      }, true);
    }
  }
  function dropBar() {
    const bar = document.getElementById("bar"); document.body.classList.remove("ms-barup");
    if (bar && barHome) barHome.p.insertBefore(bar, barHome.n && barHome.n.parentNode === barHome.p ? barHome.n : null);
  }
  function build() {
    ui = document.createElement("div"); ui.id = "ms-in";
    const when = txt("ss-a").trim(), cnt = txt("ss-b").trim();
    ui.innerHTML = `<h1>Motel Smile</h1><div class="tag">New York Rock</div>
      ${when ? `<button class="show" data-k="shows"><small>Next show</small>${when}${cnt ? " · " + cnt : ""}</button>` : ""}
      <div class="row"><button class="go" data-k="go"><svg><rect pathLength="100"/></svg>Step onto the roof<i>↗</i><b class="cd"></b></button></div>`;
    document.body.appendChild(ui);
    liftBar();
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

  // ---------- Play: the site's own player (Listen window), no band animations ----------
  const lw = () => document.getElementById("lw");
  const lwOpen = () => { const e = lw(); return !!e && (e.classList.contains("open") || e.classList.contains("drop")); };
  let plOn = false, lwHome = null, lwObs = null;
  const au = document.getElementById("lg-audio");
  function openPlayer() {
    const e = lw(); if (!ui || !e || !window.MSListenOpen) return;
    if (!lwHome) lwHome = { p: e.parentNode, n: e.nextSibling };
    document.body.appendChild(e);                  // out of the zoomed roof so it shows at its normal size
    plOn = true; ui.classList.add("lwon");
    clearTimeout(timer); cancelAnimationFrame(raf);  // the countdown waits while the player is open
    window.MSListenOpen();
    if (au && au.paused && window.MSLgToggle) window.MSLgToggle();
    if (lwObs) lwObs.disconnect();
    lwObs = new MutationObserver(() => { if (!lwOpen()) closed(); });
    lwObs.observe(e, { attributes: true, attributeFilter: ["class"] });
  }
  function closed() {
    if (lwObs) { lwObs.disconnect(); lwObs = null; }
    const e = lw(); if (e && lwHome) lwHome.p.insertBefore(e, lwHome.n && lwHome.n.parentNode === lwHome.p ? lwHome.n : null);
    if (!plOn) return; plOn = false;
    if (ui) { ui.classList.remove("lwon"); const lab = ui.querySelector(".pl"); if (lab && au && !au.paused) lab.textContent = "Now playing"; }
    if (ui && live) bump(idle);
  }
  function closePlayer() { const x = document.querySelector("#lw .lw-x"); if (x && lwOpen()) x.click(); }
  const onWheel = () => { if (!plOn) reveal(); };
  let ty0 = null;
  const onTs = e => { ty0 = e.touches[0].clientY; };
  const onTm = e => { if (!plOn && ty0 != null && Math.abs(e.touches[0].clientY - ty0) > 30) reveal(); };
  const onKey = e => { if (plOn) return; if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", " ", "PageDown", "Enter", "Escape"].includes(e.key)) reveal(); };
  const onResize = () => { if (live && !st.classList.contains("ms-cam")) setCam(cam()); };

  // keep the band where the camera framed them: no director scenes or wandering during the close-up
  let held = false;
  const hold = on => {
    if (on === held) return; held = on;
    try { const d = window.MSDir; if (d) on ? d.start() : d.end(); } catch (e) {}
  };
  const away0 = window.MSAway;
  window.MSAway = () => (document.body.classList.contains("ms-in") || (away0 ? away0() : false));
  // Jacob stands between Pat and Jordan for the close-up (hero shot), half a step back; back on his kit after the pull-back
  let standEl = null;
  function standIn(on) {
    const kit = play.querySelector(".bm-kit");
    if (on) {
      if (standEl || !kit || getComputedStyle(kit).visibility === "hidden") return;   // only when he's sitting at the kit
      const bms = [...play.querySelectorAll(".bm")].filter(e => e.offsetWidth > 20).sort((x, y) => parseFloat(x.style.left) - parseFloat(y.style.left));
      if (bms.length < 2) return;
      const g = e => ({ l: parseFloat(e.style.left), t: parseFloat(e.style.top), w: parseFloat(e.style.width), h: parseFloat(e.style.height) });
      const a = g(bms[0]), b = g(bms[bms.length - 1]);
      const h = b.h * .92, w = h * 166 / 520, cx = (a.l + a.w / 2 + b.l + b.w / 2) / 2, feet = Math.max(a.t + a.h, b.t + b.h) - 14 * (b.h / 520);
      standEl = document.createElement("img"); standEl.src = "img/band/jbh-real.webp?v=1"; standEl.alt = ""; standEl.className = "ms-stand";
      Object.assign(standEl.style, { position: "absolute", left: cx - w / 2 + "px", top: feet - h + "px", width: w + "px", height: h + "px", zIndex: 80, pointerEvents: "none", transition: "opacity .6s" });
      bms[0].parentNode.appendChild(standEl);
      kit.style.visibility = "hidden";
    } else if (standEl) {
      const s = standEl; standEl = null; s.style.opacity = 0; setTimeout(() => s.remove(), 700);
      if (kit) kit.style.visibility = "visible";
    }
  }
  function start() {
    const c = cam(); if (!c) return;
    live = true; hold(true); standIn(true);
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
    if (!live) return; live = false; hold(false); standIn(false); clearTimeout(timer); cancelAnimationFrame(raf); if (plOn) closePlayer();
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
      dropBar(); ui.remove(); ui = null; st.classList.remove("ms-cam"); document.body.classList.remove("ms-out");
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
    document.documentElement.classList.add("ms-lock"); hold(true); standIn(true);
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
