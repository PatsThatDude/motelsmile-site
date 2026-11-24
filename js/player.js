/* Motel Smile: full-size music player.
   Turns the Listen window (#lw, opened from the Now playing box) into a player sized for the screen:
   phone = tall sheet from under the peeking band to the bottom of the screen; desktop = big centered card.
   Adds what people expect from a player: artist line, a draggable progress bar with elapsed / remaining time,
   previous / play / next, and volume on desktop. The band peek, spinning record and record shelf stay. */
(() => {
  const lw = document.getElementById("lw"), au = document.getElementById("lg-audio");
  if (!lw || !au) return;

  const css = `
  :root{--lwtop-ph:max(150px,calc(100dvh - 560px));--lwtop-dt:max(190px,calc(50vh - 220px))}
  /* phone: tall sheet */
  body.ph #lw#lw{position:fixed!important;left:0!important;right:0!important;top:var(--lwtop-ph)!important;bottom:0!important;height:auto!important;
    width:auto!important;margin:0!important;border-radius:22px 22px 0 0;border-bottom:0;z-index:40;
    display:flex!important;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;
    padding:14px 0 calc(10px + env(safe-area-inset-bottom))!important}
  body.ph #lw-band#lw-band{position:fixed!important;top:var(--lwtop-ph)!important;z-index:41}
  body.ph #lw-block{z-index:39}
  body.ph #lw .lw-rec{width:min(58vw,calc(100dvh - var(--lwtop-ph) - 330px),230px)!important;min-width:120px;margin:6px 0 4px!important}
  body.ph #lw .lw-t{font-size:24px!important;margin:6px 0 0!important;max-width:86%}
  body.ph #lw .lw-row{height:118px;margin-top:auto!important;flex:none}

  /* desktop: big centered card */
  body:not(.ph) #lw#lw{position:fixed!important;top:var(--lwtop-dt)!important;bottom:auto!important;
    left:max(16px,calc(50% - 480px))!important;right:max(16px,calc(50% - 480px))!important;width:auto!important;
    height:min(510px,calc(100vh - var(--lwtop-dt) - 20px))!important;z-index:40;
    display:grid!important;grid-template-columns:minmax(200px,300px) 1fr;grid-template-rows:auto auto auto auto auto 1fr auto;
    column-gap:40px;row-gap:0;align-items:start;justify-items:stretch;padding:28px 44px 18px 36px!important;border-radius:22px}
  body:not(.ph) #lw-band#lw-band{position:fixed!important;top:var(--lwtop-dt)!important;z-index:41;
    left:max(16px,calc(50% - 480px))!important;right:max(16px,calc(50% - 480px))!important}
  body:not(.ph) #lw-block{z-index:39;background:rgba(5,4,10,.5)}
  body:not(.ph) #lw .lw-rec{grid-column:1;grid-row:1/7;width:100%!important;max-width:300px;align-self:center;margin:0!important}
  body:not(.ph) #lw .lw-h{grid-column:2;grid-row:1;align-self:end;justify-self:start;margin-top:84px}
  body:not(.ph) #lw .lw-t{grid-column:2;grid-row:2;font-size:38px!important;margin:6px 0 0!important;max-width:100%;justify-self:start}
  body:not(.ph) #lw .lw-a{grid-column:2;grid-row:3;justify-self:start}
  body:not(.ph) #lw .lw-seek{grid-column:2;grid-row:4;width:100%;max-width:none;margin:26px 0 0}
  body:not(.ph) #lw .lw-ctl{grid-column:2;grid-row:5;justify-self:stretch;justify-content:flex-start;margin:12px 0 0!important}
  body:not(.ph) #lw .lw-row{grid-column:1/3;grid-row:7;align-self:end;width:100%;height:122px;margin:10px 0 0!important}

  /* shared pieces */
  #lw .lw-time{display:none!important}
  #lw .lw-a{font:500 12px var(--mono,monospace);letter-spacing:.22em;text-transform:uppercase;color:rgba(214,240,255,.75);margin-top:3px}
  #lw .lw-seek{display:flex;align-items:center;gap:10px;width:86%;max-width:420px;margin:14px 0 0;font:500 11.5px var(--mono,monospace);
    color:rgba(255,255,255,.72);font-variant-numeric:tabular-nums;user-select:none;-webkit-user-select:none}
  #lw .lw-seek span{min-width:38px}#lw .lw-seek span:last-child{text-align:right}
  #lw .lw-tr{position:relative;flex:1;height:26px;cursor:pointer;touch-action:none}
  #lw .lw-tr::before{content:"";position:absolute;left:0;right:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:rgba(255,255,255,.18)}
  #lw .lw-tr i{position:absolute;left:0;top:50%;height:4px;margin-top:-2px;border-radius:4px;background:var(--pink);box-shadow:0 0 8px rgba(255,61,127,.7);width:0}
  #lw .lw-tr b{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,61,127,.55),0 0 10px rgba(255,61,127,.8);left:0;transition:transform .15s}
  #lw .lw-tr.drag b,#lw .lw-tr:hover b{transform:scale(1.25)}
  #lw .lw-ctl{display:flex!important;align-items:center;justify-content:center;gap:22px!important;margin:8px 0 0!important}
  #lw .lw-ctl .lg-pp{width:62px!important;height:62px!important;flex:none}
  #lw .lw-sk{all:unset;cursor:pointer;width:44px;height:44px;display:grid;place-items:center;border-radius:50%;color:#fff;opacity:.85}
  #lw .lw-sk:hover{opacity:1;background:rgba(255,255,255,.07)}
  #lw .lw-sk svg{width:24px;height:24px;fill:currentColor;filter:drop-shadow(0 0 6px rgba(255,61,127,.5))}
  #lw .lw-vol{display:flex;align-items:center;gap:8px;margin-left:auto;color:rgba(255,255,255,.7)}
  #lw .lw-vol svg{width:18px;height:18px;fill:currentColor}
  #lw .lw-vol input{width:110px;accent-color:#ff3d7f;cursor:pointer}
  body.ph #lw .lw-vol{display:none}
  @media (hover:none){#lw .lw-vol{display:none}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const ico = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  let seek, fill, knob, el, rem, tr, dragging = false;
  function build() {
    if (lw.querySelector(".lw-seek")) return;
    const t = lw.querySelector(".lw-t"), ctl = lw.querySelector(".lw-ctl"), pp = ctl && ctl.querySelector(".lg-pp");
    if (!t || !ctl || !pp) return;
    const a = document.createElement("div"); a.className = "lw-a"; a.textContent = "Motel Smile"; t.after(a);
    seek = document.createElement("div"); seek.className = "lw-seek";
    seek.innerHTML = `<span class="el">0:00</span><div class="lw-tr" role="slider" tabindex="0" aria-label="Song position"><i></i><b></b></div><span class="rem">-0:00</span>`;
    a.after(seek);
    tr = seek.querySelector(".lw-tr"); fill = tr.querySelector("i"); knob = tr.querySelector("b");
    el = seek.querySelector(".el"); rem = seek.querySelector(".rem");
    const prev = document.createElement("button"); prev.className = "lw-sk"; prev.setAttribute("aria-label", "Previous");
    prev.innerHTML = ico("M6 5h2v14H6zM20 5v14L9 12z");
    const next = document.createElement("button"); next.className = "lw-sk"; next.setAttribute("aria-label", "Next");
    next.innerHTML = ico("M16 5h2v14h-2zM4 5v14l11-7z");
    pp.before(prev); pp.after(next);
    const vol = document.createElement("label"); vol.className = "lw-vol";
    vol.innerHTML = ico("M4 9v6h4l5 4V5L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z") + `<input type="range" min="0" max="1" step="0.01" aria-label="Volume">`;
    next.after(vol);
    const vin = vol.querySelector("input"); vin.value = au.volume;
    vin.addEventListener("input", () => { au.volume = +vin.value; });
    prev.addEventListener("click", e => { e.stopPropagation(); if (au.currentTime > 3 || !step(-1)) { au.currentTime = 0; paint(); } });
    next.addEventListener("click", e => { e.stopPropagation(); step(1); });

    // drag / tap the bar to move through the song
    const at = x => { const r = tr.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
    let p = 0;
    tr.addEventListener("pointerdown", e => { if (!isFinite(au.duration)) return; dragging = true; tr.classList.add("drag"); tr.setPointerCapture(e.pointerId); p = at(e.clientX); show(p * au.duration); e.stopPropagation(); });
    tr.addEventListener("pointermove", e => { if (!dragging) return; p = at(e.clientX); show(p * au.duration); });
    const end = () => { if (!dragging) return; dragging = false; tr.classList.remove("drag"); au.currentTime = p * au.duration; paint(); };
    tr.addEventListener("pointerup", end); tr.addEventListener("pointercancel", end);
    tr.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { au.currentTime = Math.min(au.duration || 0, au.currentTime + 5); paint(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { au.currentTime = Math.max(0, au.currentTime - 5); paint(); e.preventDefault(); }
    });
    ["click", "touchstart"].forEach(k => seek.addEventListener(k, e => e.stopPropagation(), { passive: true }));
  }
  // previous / next playable song on the shelf; songs marked "soon" shake and say so (that's the shelf's own behavior)
  function step(d) {
    const rs = [...lw.querySelectorAll(".lw-r")], i = rs.findIndex(r => r.classList.contains("cur"));
    if (!rs.length) return false;
    for (let k = 1; k < rs.length; k++) {
      const r = rs[(i + d * k + rs.length * k) % rs.length];
      if (!r.classList.contains("soon")) { r.click(); return true; }
    }
    const n = rs[i + d]; if (n) { n.click(); n.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }
    return false;
  }
  function show(t) {
    const d = au.duration;
    const f = isFinite(d) && d > 0 ? t / d : 0;
    fill.style.width = f * 100 + "%"; knob.style.left = f * 100 + "%";
    el.textContent = fmt(t); rem.textContent = "-" + fmt((isFinite(d) ? d : 0) - t);
    tr.setAttribute("aria-valuenow", Math.round(t)); tr.setAttribute("aria-valuemax", Math.round(isFinite(d) ? d : 0));
  }
  function paint() { if (seek && !dragging) show(au.currentTime); }
  ["timeupdate", "loadedmetadata", "durationchange", "seeked", "emptied"].forEach(k => au.addEventListener(k, paint));
  // keep the bar smooth while the window is open
  let raf = 0;
  const loop = () => { paint(); raf = lw.classList.contains("open") ? requestAnimationFrame(loop) : 0; };
  new MutationObserver(() => { if (lw.classList.contains("open")) { build(); paint(); if (!raf) raf = requestAnimationFrame(loop); } })
    .observe(lw, { attributes: true, attributeFilter: ["class"] });
  build();
})();
