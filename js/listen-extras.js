/* Motel Smile: extras for the Listen window (#lw), the one music player used on the roof and on the intro.
   Adds a progress bar you can drag (elapsed / remaining), previous / next, and a volume slider (desktop).
   The record spin-to-scrub, EQ bars, shelf and band moments are untouched. */
(() => {
  const lw = document.getElementById("lw"), au = document.getElementById("lg-audio");
  if (!lw || !au) return;

  const css = `
  #lw .lw-time{display:none!important}
  #lw .lw-sk{display:flex;align-items:center;gap:9px;width:84%;font:500 11.5px var(--mono,monospace);color:rgba(255,255,255,.75);
    font-variant-numeric:tabular-nums;user-select:none;-webkit-user-select:none;margin:6px 0 0}
  #lw .lw-sk span{min-width:36px;text-align:left}#lw .lw-sk span:last-child{text-align:right}
  #lw .lw-tr,#lw .lw-vl{position:relative;flex:1;height:24px;cursor:pointer;touch-action:none}
  #lw .lw-tr::before,#lw .lw-vl::before{content:"";position:absolute;left:0;right:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:rgba(255,255,255,.16)}
  #lw .lw-tr i,#lw .lw-vl i{position:absolute;left:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:var(--pink);box-shadow:0 0 8px rgba(255,61,127,.7)}
  #lw .lw-tr b,#lw .lw-vl b{position:absolute;top:50%;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:#fff;
    box-shadow:0 0 0 3px rgba(255,61,127,.5),0 0 10px rgba(255,61,127,.8);transition:transform .15s}
  #lw .drag b{transform:scale(1.3)}
  #lw .lw-ctl{gap:16px!important}
  #lw .lw-skb{all:unset;cursor:pointer;width:38px;height:38px;display:grid;place-items:center;border-radius:50%;color:#fff;opacity:.85;flex:none}
  #lw .lw-skb:hover{opacity:1;background:rgba(255,255,255,.07)}
  #lw .lw-skb svg{width:20px;height:20px;fill:currentColor;filter:drop-shadow(0 0 6px rgba(255,61,127,.6))}
  #lw .lw-vol{display:flex;align-items:center;gap:8px;width:130px;margin-left:10px;color:rgba(255,255,255,.65)}
  #lw .lw-vol svg{width:16px;height:16px;fill:currentColor;flex:none}
  body.ph #lw .lw-vol{display:none}
  @media (hover:none){#lw .lw-vol{display:none}}

  /* desktop strip: progress under the title, controls under that */
  body:not(.ph) #lw{grid-template-rows:auto auto auto auto 1fr!important}
  body:not(.ph) #lw .lw-sk{grid-column:2;grid-row:3;width:100%;margin:10px 0 0}
  body:not(.ph) #lw .lw-ctl{grid-row:4!important;margin:4px 0 0!important}
  body:not(.ph) #lw .lw-rec{grid-row:1/6!important}
  body:not(.ph) #lw .lw-row{grid-row:1/6!important}
  body:not(.ph) #lw .lw-h{align-self:end}

  /* phone: a little more room for the bar */
  body.ph #lw{height:min(calc(100% - var(--barh,110px) - 190px),430px)!important}
  body.ph #lw .lw-ctl{margin:2px 0 0!important}

  /* short phones (iPhone SE etc.): everything a bit smaller so the shelf stays inside the card */
  @media (max-height:700px) and (orientation:portrait){
    body.ph #lw{height:min(calc(100% - var(--barh,110px) - 140px),430px)!important;padding-top:10px!important}
    body.ph #lw .lw-rec{width:84px!important;margin:2px 0!important}
    body.ph #lw .lw-t{font-size:18px!important}
    body.ph #lw .lw-sk{margin-top:2px}
    body.ph #lw .lw-ctl .lg-pp{width:36px!important;height:36px!important}
    body.ph #lw .lw-skb{width:32px;height:32px}
    body.ph #lw .lw-row{height:112px!important;padding-top:4px!important}
    body.ph #lw .lw-h{display:none}
  }

  /* phone on its side: row layout (record | title, bar, controls | shelf) */
  @media (max-height:500px) and (orientation:landscape){
    body.ph #lw{position:fixed!important;top:12px!important;bottom:12px!important;left:max(12px,env(safe-area-inset-left))!important;right:max(12px,env(safe-area-inset-right))!important;
      height:auto!important;display:grid!important;grid-template-columns:auto minmax(170px,1fr) minmax(0,1.3fr);grid-template-rows:1fr auto auto auto auto 1fr;
      column-gap:22px;align-items:center;justify-items:start;padding:12px 52px 12px 20px!important}
    body.ph #lw .lw-rec{grid-column:1;grid-row:1/7;width:min(150px,calc(100vh - 70px))!important;margin:0!important;align-self:center}
    body.ph #lw .lw-h{grid-column:2;grid-row:2;align-self:end}
    body.ph #lw .lw-t{grid-column:2;grid-row:3;font-size:22px!important;margin:2px 0 0!important;max-width:100%}
    body.ph #lw .lw-sk{grid-column:2;grid-row:4;width:100%}
    body.ph #lw .lw-ctl{grid-column:2;grid-row:5;margin:2px 0 0!important}
    body.ph #lw .lw-row{grid-column:3;grid-row:1/7;align-self:center;margin:0!important;width:100%}
    body.ph #lw .lw-x{top:8px;right:10px}
  }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const fmt = x => { x = Math.max(0, Math.floor(x || 0)); return Math.floor(x / 60) + ":" + String(x % 60).padStart(2, "0"); };
  const I = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  let tr, vl, el, rm, dragging = false;

  function build() {
    if (lw.querySelector(".lw-sk")) return true;
    const t = lw.querySelector(".lw-t"), ctl = lw.querySelector(".lw-ctl"), pp = lw.querySelector("#lw-pp");
    if (!t || !ctl || !pp) return false;
    const sk = document.createElement("div"); sk.className = "lw-sk";
    sk.innerHTML = `<span>0:00</span><div class="lw-tr" role="slider" tabindex="0" aria-label="Song position"><i></i><b></b></div><span>-0:00</span>`;
    t.after(sk);
    [el, , rm] = sk.children; tr = sk.querySelector(".lw-tr");
    const prev = document.createElement("button"); prev.className = "lw-skb"; prev.setAttribute("aria-label", "Previous"); prev.innerHTML = I("M6 5h2v14H6zM20 5v14L9 12z");
    const next = document.createElement("button"); next.className = "lw-skb"; next.setAttribute("aria-label", "Next"); next.innerHTML = I("M16 5h2v14h-2zM4 5v14l11-7z");
    pp.before(prev); pp.after(next);
    const vol = document.createElement("div"); vol.className = "lw-vol";
    vol.innerHTML = I("M4 9v6h4l5 4V5L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z") + `<div class="lw-vl" role="slider" tabindex="0" aria-label="Volume"><i></i><b></b></div>`;
    ctl.appendChild(vol); vl = vol.querySelector(".lw-vl");

    prev.addEventListener("click", () => { if (au.currentTime > 3 || !step(-1)) { au.currentTime = 0; paint(); } });
    next.addEventListener("click", () => step(1));

    const at = (e, x) => { const r = e.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
    let f = 0;
    tr.addEventListener("pointerdown", e => { if (!isFinite(au.duration)) return; e.stopPropagation(); dragging = true; tr.classList.add("drag"); tr.setPointerCapture(e.pointerId); f = at(tr, e.clientX); show(f * au.duration); });
    tr.addEventListener("pointermove", e => { if (dragging) { f = at(tr, e.clientX); show(f * au.duration); } });
    const end = () => { if (!dragging) return; dragging = false; tr.classList.remove("drag"); au.currentTime = f * au.duration; paint(); };
    tr.addEventListener("pointerup", end); tr.addEventListener("pointercancel", end);
    tr.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { au.currentTime = Math.min(au.duration || 0, au.currentTime + 5); e.preventDefault(); }
      if (e.key === "ArrowLeft") { au.currentTime = Math.max(0, au.currentTime - 5); e.preventDefault(); }
      paint();
    });
    const setV = v => { au.volume = v; vl.querySelector("i").style.width = v * 100 + "%"; vl.querySelector("b").style.left = v * 100 + "%"; vl.setAttribute("aria-valuenow", Math.round(v * 100)); };
    setV(au.volume);
    let vd = false;
    vl.addEventListener("pointerdown", e => { e.stopPropagation(); vd = true; vl.classList.add("drag"); vl.setPointerCapture(e.pointerId); setV(at(vl, e.clientX)); });
    vl.addEventListener("pointermove", e => { if (vd) setV(at(vl, e.clientX)); });
    const vend = () => { vd = false; vl.classList.remove("drag"); };
    vl.addEventListener("pointerup", vend); vl.addEventListener("pointercancel", vend);
    vl.addEventListener("keydown", e => { if (e.key === "ArrowRight") setV(Math.min(1, au.volume + .05)); if (e.key === "ArrowLeft") setV(Math.max(0, au.volume - .05)); });
    return true;
  }
  // previous / next on the shelf: playable songs switch; "soon" ones shake and say coming soon (the shelf's own click does that)
  function step(d) {
    const rs = [...lw.querySelectorAll(".lw-r")], i = rs.findIndex(r => r.classList.contains("cur"));
    if (!rs.length) return false;
    for (let k = 1; k < rs.length; k++) {
      const r = rs[((i + d * k) % rs.length + rs.length) % rs.length];
      if (!r.classList.contains("soon")) { if (r !== rs[i]) { r.click(); return true; } break; }
    }
    const n = rs[i + d]; if (n) { n.click(); n.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }
    return false;
  }
  function show(t) {
    if (!tr) return;
    const d = isFinite(au.duration) ? au.duration : 0, f = d ? t / d : 0;
    tr.querySelector("i").style.width = f * 100 + "%"; tr.querySelector("b").style.left = f * 100 + "%";
    el.textContent = fmt(t); rm.textContent = "-" + fmt(d - t);
    tr.setAttribute("aria-valuenow", Math.round(t)); tr.setAttribute("aria-valuemax", Math.round(d));
  }
  function paint() { if (!dragging) show(au.currentTime); }
  ["timeupdate", "loadedmetadata", "durationchange", "seeked", "emptied"].forEach(k => au.addEventListener(k, paint));
  let raf = 0;
  const loop = () => { paint(); raf = lw.classList.contains("open") ? requestAnimationFrame(loop) : 0; };
  new MutationObserver(() => { if (lw.classList.contains("open")) { build(); paint(); if (!raf) raf = requestAnimationFrame(loop); } })
    .observe(lw, { attributes: true, attributeFilter: ["class"] });
  build(); paint();
})();
