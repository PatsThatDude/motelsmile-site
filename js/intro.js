/* Motel Smile: band close-up intro (test). Opens tight on the band like a classic band homepage,
   then pulls back to the full roof on "Step onto the roof", scroll/swipe/keys, or ~7 s idle.
   Returning visitors skip it (localStorage ms-intro-seen); ?intro forces it; "Band view" pill replays it. */
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
    padding:12px 22px;border-radius:40px;border:2.5px solid #ffb23d;color:#fff;background:rgba(5,6,10,.55);
    box-shadow:0 0 14px #ffb23d;text-shadow:0 0 8px #ffb23d;animation:msPulse 2.4s 2s infinite}
  #ms-in .go i{font-style:normal;display:inline-block;margin-left:8px;animation:msNudge 1.2s infinite}
  @keyframes msPulse{50%{box-shadow:0 0 26px #ffb23d,0 0 4px #fff}}
  @keyframes msNudge{50%{transform:translate(4px,-3px)}}
  #ms-in .bar{position:absolute;left:0;bottom:0;height:3px;width:0;background:#ffb23d;box-shadow:0 0 8px #ffb23d;opacity:.7}
  #ms-in .bar.run{width:100%;transition:width linear}
  .ms-poi{animation:msPoi 1.6s ease-out 2}
  @keyframes msPoi{0%,100%{filter:none}40%{filter:drop-shadow(0 0 10px #ffe27a) drop-shadow(0 0 22px #ffb23d) brightness(1.35)}}
  #ms-bv{position:fixed;z-index:55;right:14px;top:56px;font-size:14px!important;padding:6px 14px!important;opacity:0;transition:opacity .6s;pointer-events:none}
  #ms-bv.on{opacity:1;pointer-events:auto}
  body.ms-in #ms-bv{opacity:0;pointer-events:none}
  @media (max-width:700px){
    #ms-in{align-items:center;text-align:center;padding:0 18px calc(26px + env(safe-area-inset-bottom))}
    #ms-in .tag{margin:6px 0 12px}#ms-in .show{margin:0 0 16px}
    #ms-in .row{justify-content:center}
    #ms-in .go{position:static;margin-top:16px}
    #ms-bv{top:62px;right:auto;left:14px}
  }`;
  const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

  const txt = id => (document.getElementById(id) || {}).textContent || "";
  const W = () => innerWidth, H = () => innerHeight, phone = () => innerWidth <= 700;

  // camera: frame the band (sprites + kit) tight, faces in the upper third
  function cam() {
    const els = [...play.querySelectorAll(".bm,.bm-kit")].map(e => e.getBoundingClientRect()).filter(r => r.width > 20);
    if (!els.length) return null;
    const x0 = Math.min(...els.map(r => r.left)), x1 = Math.max(...els.map(r => r.right));
    const y0 = Math.min(...els.map(r => r.top)), y1 = Math.max(...els.map(r => r.bottom));
    const bw = x1 - x0, bh = y1 - y0;
    let z, cx = (x0 + x1) / 2, cy, ty;
    if (phone()) { z = Math.min(1.75, 1.08 * W() / bw); cy = y0 + bh * .42; ty = H() * .36; }   // waist-up
    else { z = Math.min(2.2, .78 * H() / bh, .9 * W() / bw); cy = y0 + bh * .47; ty = H() * .44; }
    z = Math.max(1.15, z);
    return { z, tx: W() / 2 - z * cx, ty: ty - z * cy };
  }
  const setCam = c => { st.style.scale = c ? String(c.z) : ""; st.style.translate = c ? `${c.tx}px ${c.ty}px` : ""; };

  let ui, bv, timer, idle = 7000, live = false;

  function build() {
    ui = document.createElement("div"); ui.id = "ms-in";
    const when = txt("ss-a").trim(), cnt = txt("ss-b").trim();
    ui.innerHTML = `<h1>Motel Smile</h1><div class="tag">New York Rock</div>
      ${when ? `<button class="show" data-k="shows"><small>Next show</small>${when}${cnt ? " · " + cnt : ""}</button>` : ""}
      <div class="row"><button class="pill" style="--c:var(--pink)" data-k="play"><span class="tri"></span> <span class="pl">Play “${(txt("np-title") || "Don't Mind It").trim()}”</span></button>
      <button class="pill" style="--c:var(--blue)" data-k="follow">Follow</button></div>
      <button class="go" data-k="go">Step onto the roof<i>↗</i></button><div class="bar"></div>`;
    document.body.appendChild(ui);
    ui.addEventListener("click", e => {
      const k = (e.target.closest("[data-k]") || {}).dataset?.k;
      if (k === "play") { const b = document.getElementById("np-pp"); b && b.click(); bump(10000);
        const pl = ui.querySelector(".pl"); setTimeout(() => { const on = b && /pause/i.test(b.getAttribute("aria-label") || ""); pl.textContent = on ? "Playing…" : pl.textContent; }, 300); return; }
      if (k === "follow" || k === "shows") { reveal(() => { const t = document.querySelector(`#bar [data-open="${k}"]`); t && t.click(); }); return; }
      reveal();   // "Step onto the roof" or a tap anywhere else
    });
  }
  function bump(ms) {
    clearTimeout(timer); const b = ui && ui.querySelector(".bar"); if (!b) return;
    b.classList.remove("run"); b.style.transitionDuration = "0s"; void b.offsetWidth;
    b.style.transitionDuration = ms + "ms"; b.classList.add("run");
    timer = setTimeout(() => reveal(), ms);
  }
  const onWheel = () => reveal();
  let ty0 = null;
  const onTs = e => { ty0 = e.touches[0].clientY; };
  const onTm = e => { if (ty0 != null && Math.abs(e.touches[0].clientY - ty0) > 30) reveal(); };
  const onKey = e => { if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", " ", "PageDown", "Enter", "Escape"].includes(e.key)) reveal(); };
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
    if (!live) return; live = false; clearTimeout(timer);
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

  function bandBtn() {
    if (!bv) {
      bv = document.createElement("button"); bv.id = "ms-bv"; bv.className = "pill"; bv.style.setProperty("--c", "var(--pink)");
      bv.textContent = "Band view"; document.body.appendChild(bv);
      bv.addEventListener("click", () => { bv.classList.remove("on"); replay(); });
    }
    setTimeout(() => bv.classList.add("on"), 600);
  }
  function replay() {
    const c = cam(); if (!c) return;
    document.documentElement.classList.add("ms-lock");
    st.classList.add("ms-cam"); document.body.classList.add("ms-in");
    void st.offsetWidth; setCam(c);
    setTimeout(() => { st.classList.remove("ms-cam"); live = true; build(); bump(12000);
      addEventListener("wheel", onWheel, { passive: true }); addEventListener("touchstart", onTs, { passive: true });
      addEventListener("touchmove", onTm, { passive: true }); addEventListener("keydown", onKey); addEventListener("resize", onResize);
    }, 2200);
  }

  window.MSIntro = { start, reveal, replay };
  const go = () => {
    // wait until the band sprites are laid out
    let n = 0; const t = setInterval(() => {
      if (cam() || ++n > 40) { clearInterval(t); if (seen && !force) bandBtn(); else start(); document.documentElement.classList.remove("ms-pre"); }
    }, 100);
  };
  const unpre = () => document.documentElement.classList.remove("ms-pre");
  setTimeout(unpre, 6000);   // never leave the page blank
  window.__msUnpre = unpre;
  const go2 = () => setTimeout(go, 250);
  if (document.readyState === "complete") go2(); else addEventListener("load", go2);
})();
