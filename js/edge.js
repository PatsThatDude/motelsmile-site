/* Motel Smile intro, "edge of the roof" version (preview: ?edge, framing ?edge=a|b|c).
   During the close-up the roof is swapped for a generated shot taken from the near edge of the roof
   (img/roof-edge.webp: spotlight overhead, the whole roof and the skyline far behind), and the band
   stands at the front of it from the ankles up. On "Step onto the roof" it cross-fades back to the
   normal roof while the camera pulls back. */
(() => {
  const m = location.search.match(/[?&]edge(?:=([abc]))?/);
  if (!m) return;
  const MODE = m[1] || "b";
  // where each of us stands, in band heights (H) from the centre line; z = drawing order (Jordan in front)
  const LAYOUT = {
    a: { pat: -.25, jac: .0, jor: .27 },          // tight: shoulders overlapping
    b: { pat: -.34, jac: .02, jor: .37 },         // spread (the mock)
    c: { pat: -.30, jac: .02, jor: .33 }          // like b, but pushed right of the title on wide screens
  }[MODE];
  const SP = {
    pat: { src: "img/band/p1-real.webp?v=b4", ar: 267 / 520, h: 1, z: 2 },
    jac: { src: "img/band/jbh2-real.webp?v=1", ar: 153 / 520, h: .88, z: 1, dy: -.03 },
    jor: { src: "img/band/jdh3b-real.webp?v=1", ar: 223 / 520, h: 1.04, z: 3, dy: .02 }
  };
  const css = `
  #ms-edge{position:fixed;inset:0;z-index:58;pointer-events:none;opacity:0;transition:opacity .9s;background:#04050a}
  #ms-edge .bd{position:absolute;inset:0;background:url(img/roof-edge.webp?v=1) 50% 100%/cover no-repeat}
  #ms-edge img{position:absolute;display:block;filter:drop-shadow(0 0 1px rgba(0,0,0,.6))}
  #ms-edge .lt{position:absolute;pointer-events:none}
  body.ms-edge-on #ms-edge{opacity:1}
  body.ms-edge-on #stage{opacity:0!important}
  body.ms-edge-on.ms-out #stage{opacity:1!important;transition:opacity 1.2s .2s}
  body.ms-edge-on.ms-out #ms-edge{opacity:0;transition:opacity 1.1s}
  body.ms-edge-on .sky .sign{opacity:0!important}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const box = document.createElement("div"); box.id = "ms-edge"; box.innerHTML = `<div class="bd"></div>`;
  const imgs = {};
  for (const k of ["jac", "pat", "jor"]) { const i = document.createElement("img"); i.src = SP[k].src; i.alt = ""; i.style.zIndex = SP[k].z; box.appendChild(i); imgs[k] = i; }
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
    const cx = W * (MODE === "c" && !ph ? .6 : .5), base = barTop + H * .06;
    for (const k of Object.keys(LAYOUT)) {
      const s = SP[k], h = H * s.h, w = h * s.ar, x = cx + LAYOUT[k] * H - w / 2, y = base + (s.dy || 0) * H - h;
      Object.assign(imgs[k].style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
    }
    Object.assign(lt.style, { left: 0, top: 0, width: W + "px", height: Hh + "px",
      background: `linear-gradient(to bottom, rgba(0,0,0,0) ${Math.round(base - H * .55)}px, rgba(4,5,10,.55) ${Math.round(base)}px)` });
    lt.style.zIndex = 4;
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
