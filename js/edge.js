/* Motel Smile intro, "edge of the roof" version (preview: ?edge, framing ?edge=a|b|c).
   During the close-up the roof is swapped for a generated shot taken from the near edge of the roof
   (img/roof-edge.webp: spotlight overhead, the whole roof and the skyline far behind), and the band
   stands at the front of it from the ankles up. On "Step onto the roof" it cross-fades back to the
   normal roof while the camera pulls back. */
(() => {
  const m = location.search.match(/[?&]edge(?:=([abc]))?/);
  if (!m) return;
  const MODE = m[1] || "b";   // Pat picked B
  // where each of us stands, in band heights (H) from the centre line; z = drawing order (Jordan in front)
  const LAYOUT = {
    a: { pat: -.25, jac: .0, jor: .27 },          // tight: shoulders overlapping
    b: { pat: -.38, jac: .02, jor: .37 },   // Pat nudged left (Pat)         // spread (the mock)
    c: { pat: -.30, jac: .02, jor: .33 }          // like b, but pushed right of the title on wide screens
  }[MODE];
  const SP = {
    pat: { src: "img/band/bl-pat.webp?v=1", ar: 262 / 520, h: 1, z: 2 },
    jac: { src: "img/band/bl-jac.webp?v=1", ar: 154 / 520, h: .95, z: 1, dy: -.02 },   // Pat is only an inch taller; Jacob a small step back
    jor: { src: "img/band/bl-jor.webp?v=1", ar: 225 / 520, h: 1.04, z: 3, dy: .02 }
  };
  const css = `
  #ms-edge{position:fixed;inset:0;z-index:58;pointer-events:none;opacity:0;transition:opacity .9s;background:#04050a}
  #ms-edge .bd{position:absolute;inset:0;background:url(img/roof-edge.webp?v=1) 50% 100%/cover no-repeat}
  #ms-edge .pp{position:absolute}
  #ms-edge .pp img{position:absolute;inset:0;width:100%;height:100%;display:block;
  }   /* bl-*: relit in ChatGPT as BACKLIT by the spotlight behind/above (Pat preferred it behind us); rl-* = the overhead version */
  /* dim the beam and the floor pool in the backdrop shot */
  #ms-edge .bd::after{content:"";position:absolute;inset:0;
    background:radial-gradient(28% 55% at 50% 22%,rgba(4,5,10,.25),rgba(4,5,10,0)),radial-gradient(40% 22% at 50% 92%,rgba(4,5,10,.45),rgba(4,5,10,0))}
  /* overhead spotlight on each of us, masked to our own outline: hot top light on head and shoulders, falling into shade at the legs */
  #ms-edge .pp i{position:absolute;inset:0;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
  #ms-edge .pp .tl{background:linear-gradient(to bottom,rgba(255,246,228,.55),rgba(255,246,228,.18) 16%,rgba(255,246,228,0) 38%);mix-blend-mode:soft-light}
  #ms-edge .pp .tl2{background:linear-gradient(to bottom,rgba(255,250,240,.22),rgba(255,250,240,0) 22%);mix-blend-mode:screen}
  #ms-edge .pp .sh{background:linear-gradient(to bottom,rgba(3,4,9,0) 34%,rgba(3,4,9,.35) 62%,rgba(3,4,9,.7) 100%)}
  #ms-edge .fl{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.75),rgba(0,0,0,0));z-index:0}
  #ms-edge .lt{position:absolute;pointer-events:none}
  body.ms-edge-on #ms-edge{opacity:1}
  body.ms-edge-on #stage{opacity:0!important}
  body.ms-edge-on.ms-out #stage{opacity:1!important;transition:opacity 1.2s .2s}
  body.ms-edge-on.ms-out #ms-edge{opacity:0;transition:opacity 1.1s}
  body.ms-edge-on .sky .sign{opacity:0!important}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const box = document.createElement("div"); box.id = "ms-edge"; box.innerHTML = `<div class="bd"></div>`;
  const imgs = {};
  for (const k of ["jac", "pat", "jor"]) {
    const d = document.createElement("div"); d.className = "pp"; d.style.zIndex = SP[k].z;
    const mk = `-webkit-mask-image:url(${SP[k].src});mask-image:url(${SP[k].src})`;
    d.innerHTML = `<img src="${SP[k].src}" alt="">`;
    box.appendChild(d); imgs[k] = d;
  }
  const fl = document.createElement("div"); fl.className = "fl"; box.appendChild(fl);   // our shadow pooled on the floor under the spot
  // top light on heads/shoulders, legs falling into shade (spotlight from above)
  const lt = document.createElement("div"); lt.className = "lt"; box.appendChild(lt);
  document.body.appendChild(box);

  function place() {
    const W = innerWidth, Hh = innerHeight, bar = document.getElementById("bar");
    const barTop = document.body.classList.contains("ms-barup") && bar ? bar.getBoundingClientRect().top : Hh;
    const ph = W < 700 || Hh > W;
    // band height: ankles at the top of the bar, heads well clear of the top; fit the group to the width
    const span = Math.max(...Object.keys(LAYOUT).map(k => Math.abs(LAYOUT[k]) + SP[k].ar * SP[k].h / 2)) * 2;
    let H = Math.min(barTop * (ph ? .86 : .9), (W * (ph ? 1.12 : .62)) / span);
    const cx = W * (MODE === "c" && !ph ? .6 : .5);
    // phone: lift the whole framing (the top of the shot was just black sky): heads near the top, the shot zoomed so the skyline rises with us
    const base = ph ? Math.min(barTop + H * .06, Hh * .09 + H * 1.0) : barTop + H * .06;
    box.querySelector(".bd").style.cssText = ph ? "background-size:auto 128%;background-position:50% 78%" : "";
    for (const k of Object.keys(LAYOUT)) {
      const s = SP[k], h = H * s.h, w = h * s.ar, x = cx + LAYOUT[k] * H - w / 2, y = base + (s.dy || 0) * H - h;
      Object.assign(imgs[k].style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
    }
    Object.assign(lt.style, { left: 0, top: 0, width: W + "px", height: Hh + "px", zIndex: 4,
      background: `linear-gradient(to bottom, rgba(0,0,0,0) ${Math.round(base - H * .4)}px, rgba(4,5,10,.35) ${Math.round(base)}px)` });
    const gw = span * H;
    Object.assign(fl.style, { left: cx - gw * .55 + "px", top: base - H * .06 + "px", width: gw * 1.1 + "px", height: H * .12 + "px" });
  }
  // follow the intro: on while the close-up is up, cross-fade out when it reveals
  const sync = () => {
    const on = document.body.classList.contains("ms-in") || document.body.classList.contains("ms-out");
    if (on && !document.body.classList.contains("ms-edge-on")) { document.body.classList.add("ms-edge-on"); place(); }
    if (!on && document.body.classList.contains("ms-edge-on")) document.body.classList.remove("ms-edge-on");
    if (on) place();
  };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", () => { if (document.body.classList.contains("ms-edge-on")) place(); });
  sync();
})();
