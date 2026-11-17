/* BETTER FREE 3D — renders the climb as a real machine on the rooftop. One cabinet, four playfields:
   1 Rooftop, 2 Motel Hallway, 3 Smile Lounge, 4 Giant Grace. Physics + rules stay in fireball.js; this only draws.
   window.MSPB3D = {init, render, resize, ok} */
import * as THREE from "./vendor/three.module.min.js";
import { EffectComposer } from "./vendor/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./vendor/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./vendor/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "./vendor/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "./vendor/jsm/environments/RoomEnvironment.js";

const TILT = 6.5 * Math.PI / 180;
const PINK = 0xff3d7f, CYAN = 0x46dcff, AMBER = 0xffaa46, FIRE = 0xff5a28, GOLD = 0xffd36a;
const BEAT = 60 / 152;
let renderer, scene, camera, composer, bloom, host, W0, table, bb, refs = {}, phone = false, curLevel = 0;
const LV3D = {};

const tx = (x) => x - 200, tz = (y) => y - 360;
const loader = new THREE.TextureLoader();
function canvasTex(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function imgTex(url, cb) { const t = loader.load(url, cb); t.colorSpace = THREE.SRGBColorSpace; return t; }
const std = (o) => new THREE.MeshStandardMaterial(o);
const glow = (col, k = 1.2, o = {}) => std(Object.assign({ color: col, emissive: col, emissiveIntensity: k, roughness: .4 }, o));
function labelTex(txt, o = {}) { return canvasTex(o.w || 128, o.h || 64, (c, w, h) => { if (o.bg) { c.fillStyle = o.bg; c.fillRect(0, 0, w, h); }
  c.font = o.font || `bold ${h * .7}px sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 12; } c.fillStyle = o.col || "#ffd36a"; c.fillText(txt, w / 2, h / 2 + (o.dy || 0)); }); }
function flatLabel(txt, x, y, size, o = {}) { const t = labelTex(txt, o); const m = new THREE.Mesh(new THREE.PlaneGeometry(size * (o.w || 128) / (o.h || 64), size), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(tx(x), .5, tz(y)); return m; }

function smileyTex(hot) {
  return canvasTex(256, 256, (c) => {
    c.fillStyle = hot ? "#ff8ab0" : "#d81b60"; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill();
    c.lineWidth = 14; c.strokeStyle = "#ffd0e0"; c.stroke();
    c.fillStyle = "#14040b"; c.beginPath(); c.arc(88, 100, 16, 0, 7); c.arc(168, 100, 16, 0, 7); c.fill();
    c.lineWidth = 16; c.lineCap = "round"; c.strokeStyle = "#14040b"; c.beginPath(); c.arc(128, 128, 62, .18 * Math.PI, .82 * Math.PI); c.stroke();
    c.fillStyle = "#ffd36a"; c.fillRect(116, 182, 24, 20);
  });
}
const BG_TITLES = { 1: "THE ROOFTOP", 2: "THE MOTEL HALLWAY", 3: "THE SMILE LOUNGE", 4: "GIANT GRACE" };
function drawBackglass(c, w, h, n) {
  const pal = { 1: ["#ff7a1a", "#c81d4e"], 2: ["#d6622a", "#5a1218"], 3: ["#ff3d7f", "#3a0a3a"], 4: ["#ffd36a", "#c81d4e"] }[n];
  const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, pal[0]); g.addColorStop(.38, pal[1]); g.addColorStop(1, "#10030c"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  // skyline
  c.fillStyle = "rgba(10,2,8,.85)"; for (let x = 0; x < w; x += 26 + (x * 7 % 30)) { const bh = 60 + (x * 13 % 170); c.fillRect(x, h - 120 - bh, 22 + (x % 18), bh + 120); }
  c.fillStyle = "rgba(255,220,150,.5)"; for (let i = 0; i < 160; i++) { const x = (i * 97) % w, y = h - 140 - ((i * 53) % 200); c.fillRect(x, y, 3, 4); }
  // the motel, floors stacked; current floor lit
  const mx = w - 230, my = 140, fw = 180, fh = 70;
  for (let f = 1; f <= 4; f++) { const y = my + (4 - f) * fh; const on = f === n; c.fillStyle = on ? "rgba(255,61,127,.85)" : "rgba(40,10,24,.9)"; c.fillRect(mx, y, fw, fh - 8);
    c.strokeStyle = on ? "#fff" : "rgba(255,120,170,.35)"; c.lineWidth = 3; c.strokeRect(mx, y, fw, fh - 8);
    c.font = "bold 20px monospace"; c.textAlign = "center"; c.fillStyle = on ? "#fff" : "rgba(255,200,225,.55)"; c.fillText(f === 4 ? "BOSS" : "FLOOR " + f, mx + fw / 2, y + 40); }
  c.save(); c.translate(w / 2 - 110, 190); c.rotate(-.08); c.font = "italic 900 104px 'Arial Black', Impact, sans-serif"; c.textAlign = "center";
  c.lineWidth = 14; c.strokeStyle = "#2a0610"; c.strokeText("BETTER FREE", 0, 0); const tg = c.createLinearGradient(0, -110, 0, 20); tg.addColorStop(0, "#fff3b0"); tg.addColorStop(1, "#ff8a1e");
  c.fillStyle = tg; c.fillText("BETTER FREE", 0, 0); c.restore();
  c.font = "bold 40px monospace"; c.textAlign = "center"; c.fillStyle = "#ffe3ec"; c.fillText(BG_TITLES[n], w / 2 - 110, 320);
  c.font = "bold 28px monospace"; c.fillStyle = "#ffd0e0"; c.fillText("MOTEL SMILE · THE CLIMB", w / 2 - 110, 370);
  c.strokeStyle = "#ffd36a"; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
}
function flameSideTex() {
  return canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = "#0d0509"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const x = Math.random() * w, fh = 40 + Math.random() * 80; const fg = c.createLinearGradient(x, h, x, h - fh);
      fg.addColorStop(0, "rgba(255,61,127,.9)"); fg.addColorStop(1, "rgba(70,220,255,0)"); c.fillStyle = fg; c.beginPath(); c.moveTo(x - 14, h); c.quadraticCurveTo(x, h - fh, x + 14, h); c.fill(); }
    c.font = "italic 900 34px 'Arial Black', Impact, sans-serif"; c.fillStyle = "rgba(255,211,106,.8)"; c.fillText("MOTEL SMILE", 30, 50);
  });
}
function blobTex() { return canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(0,0,0,.75)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }); }
function radialTex(col) { return canvasTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); }); }

/* ---------- girls: real Grace frames, the other girls as glowing silhouettes ---------- */
const GIRLTEX = { grace: [], sil: [], giant: [] };
function loadGirls() {
  for (let i = 1; i <= 8; i++) {
    GIRLTEX.grace.push(imgTex(`img/grace/d${i}.webp`));
    const c = document.createElement("canvas"); c.width = c.height = 2; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; GIRLTEX.sil.push(t);
    const im = new Image(); im.onload = () => { c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0); x.globalCompositeOperation = "source-in";
      const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, "#ffb3d1"); g.addColorStop(1, "#ff3d7f"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); t.needsUpdate = true; };
    im.src = `img/grace/d${i}.webp`;
  }
}
function setMap(m, t) { if (m.map !== t) { const had = !!m.map; m.map = t; if (!had) m.needsUpdate = true; } }
const girlTex = (name, f) => (name === "GRACE" ? GIRLTEX.grace : GIRLTEX.sil)[((f % 8) + 8) % 8];
function sprite(h) { const m = new THREE.Mesh(new THREE.PlaneGeometry(h * .38, h), new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .05, side: THREE.DoubleSide, toneMapped: false }));
  m.geometry.translate(0, h / 2, 0); return m; }

/* ---------- shared builders ---------- */
const MAT = {};
function mats() {
  MAT.wall = std({ color: 0x1b0a14, roughness: .5, metalness: .2 });
  MAT.post = std({ color: 0xf2f2f2, roughness: .35, metalness: .1 }); MAT.rubber = std({ color: 0x111111, roughness: .8 });
  MAT.chrome = std({ color: 0x9a9aa2, metalness: 1, roughness: .25 }); MAT.black = std({ color: 0x0a0608, roughness: .6, metalness: .2 });
  MAT.glass = new THREE.MeshPhysicalMaterial({ color: 0xffc8de, roughness: .05, metalness: 0, transparent: true, opacity: .32, emissive: PINK, emissiveIntensity: .25, depthWrite: false, side: THREE.DoubleSide });
}
function buildWalls(group, segs, strip = PINK) {
  const out = [], posts = new Set();
  for (const s of segs) {
    const ax = tx(s.a[0]), az = tz(s.a[1]), bx = tx(s.b[0]), bz = tz(s.b[1]); const L = Math.hypot(bx - ax, bz - az); if (L < .5) continue;
    const g = new THREE.Group(); g.position.set((ax + bx) / 2, 0, (az + bz) / 2); g.rotation.y = -Math.atan2(bz - az, bx - ax);
    const sling = s.kind === "sling"; const inner = Math.min(s.a[0], s.b[0]) > 10 && Math.max(s.a[0], s.b[0]) < 356 && Math.min(s.a[1], s.b[1]) > 230;
    const lanePost = s.a[0] === s.b[0] && Math.max(s.a[1], s.b[1]) < 100; const rampPost = s.kind === "ramp"; const hgt = sling ? 22 : inner || lanePost || rampPost ? 26 : 38;
    if (inner || lanePost || rampPost) for (const p of [s.a, s.b]) { const k = p[0] + "," + p[1]; if (posts.has(k)) continue; posts.add(k);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 32, 14), MAT.post); post.position.set(tx(p[0]), 16, tz(p[1])); group.add(post);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 1.8, 8, 18), MAT.rubber); ring.rotation.x = Math.PI / 2; ring.position.set(tx(p[0]), 12, tz(p[1])); group.add(ring); }
    const body = new THREE.Mesh(new THREE.BoxGeometry(L + 4, hgt, 5), MAT.wall); body.position.y = hgt / 2; g.add(body);
    const stripMat = std({ color: 0x000000, emissive: sling ? CYAN : strip, emissiveIntensity: 1.6 });
    const st = new THREE.Mesh(new THREE.BoxGeometry(L + 4, 2.2, 5.6), stripMat); st.position.y = hgt + 1; g.add(st);
    group.add(g); out.push({ s, m: stripMat, sling });
  }
  return out;
}
function buildBumper(group, b, style) {
  const g = new THREE.Group(); g.position.set(tx(b.x), 0, tz(b.y));
  if (style === "bell") {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(b.r + 4, b.r + 5, 6, 40), glow(PINK, .9)); base.position.y = 3; g.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(b.r - 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: 0xe8e8ee, metalness: 1, roughness: .12 })); dome.position.y = 8; g.add(dome);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), MAT.chrome); knob.position.y = 8 + b.r - 1; g.add(knob);
    group.add(g); return { b, g, dome, base, kind: "bell" };
  }
  const base = new THREE.Mesh(new THREE.CylinderGeometry(b.r + 3, b.r + 4, 4, 40), std({ color: 0x111111, roughness: .4 })); base.position.y = 2; g.add(base);
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(b.r + 1, b.r + 2, 6, 40), std({ color: 0xffd36a, emissive: AMBER, emissiveIntensity: .35, roughness: .4 })); skirt.position.y = 8; g.add(skirt);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(b.r - 7, b.r - 7, 26, 32), std({ color: 0xdddddd, metalness: 1, roughness: .15 })); body.position.y = 18; g.add(body);
  const topCold = smileyTex(false), topHot = smileyTex(true);
  const capMat = std({ map: topCold, emissive: 0xffffff, emissiveMap: topCold, emissiveIntensity: .45, roughness: .3 });
  const sideMat = std({ color: 0xff3d7f, emissive: PINK, emissiveIntensity: .8, roughness: .3, transparent: true, opacity: .92 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(b.r, b.r, 9, 40), [sideMat, capMat, sideMat]); cap.position.y = 34; cap.rotation.y = Math.PI / 2; g.add(cap);
  group.add(g); return { b, capMat, sideMat, topCold, topHot, cap, kind: "smiley" };
}
function buildJar(group, j) {
  const g = new THREE.Group(); g.position.set(tx(j.x), -50, tz(j.y));
  const glassM = MAT.glass.clone(); const body = new THREE.Mesh(new THREE.CylinderGeometry(j.r, j.r, 40, 28, 1, true), glassM); body.position.y = 20; g.add(body);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(j.r, 28), glassM); bottom.rotation.x = -Math.PI / 2; bottom.position.y = .5; g.add(bottom);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(j.r + 1.2, j.r + 1.2, 6, 28), std({ color: 0x8a6a3a, metalness: .9, roughness: .45 })); lid.position.y = 43; g.add(lid);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(j.r + 3, 1.6, 8, 28), MAT.chrome); ring.rotation.x = Math.PI / 2; ring.position.y = 1; group.add(ring); ring.position.set(tx(j.x), .8, tz(j.y));
  const girl = sprite(32); girl.position.y = 2; g.add(girl);
  const light = new THREE.PointLight(PINK, 0, 90, 2); light.position.y = 22; g.add(light);
  group.add(g); return { j, g, glassM, girl, light };
}
function buildRamp(group) {
  const P = W0.RAMP.path; const pts = P.map((p) => new THREE.Vector3(tx(p[0]), W0.R + p[2], tz(p[1])));
  const curve = new THREE.CatmullRomCurve3(pts); const rails = [];
  const railMat = std({ color: CYAN, emissive: CYAN, emissiveIntensity: .9, metalness: .8, roughness: .2 });
  for (const off of [-11, 11]) { const ps = []; for (let i = 0; i <= 60; i++) { const u = i / 60, p = curve.getPointAt(u), t = curve.getTangentAt(u); const n = new THREE.Vector3(-t.z, 0, t.x).normalize(); ps.push(p.clone().addScaledVector(n, off).add(new THREE.Vector3(0, -3, 0))); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ps), 80, 1.6, 6), railMat); group.add(m); rails.push(m); }
  // support posts under the high part
  for (const i of [2, 4, 6]) { const p = pts[i]; const post = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, p.y, 8), MAT.chrome); post.position.set(p.x, p.y / 2, p.z); group.add(post); }
  // mouth flap
  const flap = new THREE.Mesh(new THREE.BoxGeometry(40, 1.5, 18), std({ color: 0xb0b0b8, metalness: 1, roughness: .2 })); flap.position.set(tx(170), 1.2, tz(424)); flap.rotation.x = -.18; group.add(flap);
  const arrow = new THREE.Mesh(new THREE.PlaneGeometry(26, 34), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: canvasTex(64, 84, (c) => { c.fillStyle = "#fff"; c.beginPath(); c.moveTo(32, 0); c.lineTo(64, 40); c.lineTo(44, 40); c.lineTo(44, 84); c.lineTo(20, 84); c.lineTo(20, 40); c.lineTo(0, 40); c.fill(); }) }));
  arrow.rotation.x = -Math.PI / 2; arrow.position.set(tx(170), .6, tz(470)); group.add(arrow);
  return { railMat, arrow };
}
function buildScoop(group, sc) {
  const hole = new THREE.Mesh(new THREE.CircleGeometry(sc.r, 28), new THREE.MeshBasicMaterial({ color: 0x000000 })); hole.rotation.x = -Math.PI / 2; hole.position.set(tx(sc.x), .45, tz(sc.y)); group.add(hole);
  const rimM = glow(AMBER, .2); const rim = new THREE.Mesh(new THREE.TorusGeometry(sc.r + 1, 2.2, 8, 28), rimM); rim.rotation.x = Math.PI / 2; rim.position.set(tx(sc.x), 1.5, tz(sc.y)); group.add(rim);
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(sc.r + 3, sc.r + 3, 14, 20, 1, true, Math.PI * .5, Math.PI), MAT.chrome); hood.position.set(tx(sc.x), 7, tz(sc.y)); group.add(hood);
  return { sc, rimM };
}
function buildSpinner(group, sp) {
  const g = new THREE.Group(); g.position.set(tx(sp.x), 28, tz(sp.y));
  const wire = new THREE.Mesh(new THREE.TorusGeometry(17, 1, 6, 24, Math.PI), MAT.chrome); wire.rotation.y = Math.PI / 2; wire.position.y = -1; g.add(wire);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 1.4), glow(CYAN, 1.2, { metalness: .3 })); blade.position.y = -7;
  const pivot = new THREE.Group(); pivot.add(blade); g.add(pivot); group.add(g); return pivot;
}
function buildTarget(group, t, col, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(t.w, o.h || 30, t.h), glow(col, 1.1)); m.position.set(tx(t.x), (o.h || 30) / 2, tz(t.y)); group.add(m); return m;
}

/* ---------- the four floors ---------- */
function buildLevel(n) {
  const L = W0.LEVELS[n]; const g = new THREE.Group(); g.visible = false; table.add(g);
  const R_ = { g, walls: [], bump: [], tgt: {}, jars: [], rolls: [], extra: {} };
  const pfTex = new THREE.CanvasTexture(W0.bg(n)); pfTex.colorSpace = THREE.SRGBColorSpace; pfTex.anisotropy = 8;
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(400, 720), std({ map: pfTex, roughness: .45, metalness: .05, emissive: 0xffffff, emissiveMap: pfTex, emissiveIntensity: .4 }));
  pf.rotation.x = -Math.PI / 2; g.add(pf); R_.pf = pf;
  R_.walls = buildWalls(g, L.segs, n === 2 ? AMBER : PINK);
  R_.bump = L.bumps.map((b) => buildBumper(g, b, n === 2 ? "bell" : "smiley"));
  R_.jars = L.jars.map((j) => buildJar(g, j));
  if (L.scoop) R_.scoop = buildScoop(g, L.scoop);
  if (L.spin) R_.spin = buildSpinner(g, L.spin);
  if (L.ramp) R_.ramp = buildRamp(g);
  const E = R_.extra;
  if (n === 1) {
    for (const t of L.tgts) { R_.tgt[t.id] = buildTarget(g, t, FIRE); g.add(flatLabel(t.label, t.x + 14, t.y, 14, { w: 64, h: 64 })); }
    R_.rolls = L.rolls.map((l) => { const mat = std({ color: 0x331a08, emissive: AMBER, emissiveIntensity: .15, roughness: .3 });
      const m = new THREE.Mesh(new THREE.CircleGeometry(7, 24), mat); m.rotation.x = -Math.PI / 2; m.position.set(tx(l.x), .3, tz(l.y + 22)); g.add(m); return { r: l, mat }; });
    g.add(flatLabel("MOTEL", L.scoop.x + 20, L.scoop.y + 26, 9, { col: "#ffc2da" }));
  }
  if (n === 2) {
    // room doors: cream panels with brass numbers, light under the door, hinge on the outer edge
    E.doors = L.tgts.filter((t) => t.kind === "door").map((t) => {
      const hinge = new THREE.Group(); const left = t.x < 183; hinge.position.set(tx(left ? t.x - t.w / 2 : t.x + t.w / 2), 0, tz(t.y)); g.add(hinge);
      const panelTex = canvasTex(256, 192, (c, w, h) => { c.fillStyle = "#e9dcc0"; c.fillRect(0, 0, w, h); c.strokeStyle = "#b8a684"; c.lineWidth = 8; c.strokeRect(22, 18, w - 44, h - 36);
        c.fillStyle = "#c9a03a"; c.font = "bold 72px serif"; c.textAlign = "center"; c.fillText(t.label, w / 2, h / 2 + 26); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(80,50,20,${Math.random() * .15})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
      const pm = std({ map: panelTex, roughness: .7, emissive: 0xffffff, emissiveMap: panelTex, emissiveIntensity: .12 });
      const panel = new THREE.Mesh(new THREE.BoxGeometry(t.w, 40, 6), [MAT.wall, MAT.wall, MAT.wall, MAT.wall, pm, MAT.wall]);
      panel.position.set(left ? t.w / 2 : -t.w / 2, 20, 2); hinge.add(panel);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), std({ color: 0xc9a03a, metalness: 1, roughness: .3 })); knob.position.set(left ? t.w - 8 : -t.w + 8, 18, 6); hinge.add(knob);
      const under = glow(CYAN, 1.4); const strip = new THREE.Mesh(new THREE.BoxGeometry(t.w - 6, 1.5, 3), under); strip.position.set(tx(t.x), .8, tz(t.y) + 7); g.add(strip);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(t.w + 8, 46, 4), MAT.wall); frame.position.set(tx(t.x), 23, tz(t.y) - 6); g.add(frame);
      const room = new THREE.PointLight(PINK, 0, 120, 2); room.position.set(tx(t.x), 22, tz(t.y) - 14); g.add(room);
      return { t, hinge, pm, under, room, left, ang: 0 };
    });
    // key rack: backboard + three diamond key tags
    const board = new THREE.Mesh(new THREE.BoxGeometry(92, 34, 5), std({ color: 0x5a3418, roughness: .7 })); board.position.set(tx(183), 17, tz(335) - 12); g.add(board);
    E.keys = L.tgts.filter((t) => t.kind === "key").map((t, i) => { const col = [PINK, CYAN, AMBER][i]; const m = glow(col, .3);
      const tag = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 3), m); tag.rotation.z = Math.PI / 4; tag.position.set(tx(t.x), 16, tz(t.y)); g.add(tag);
      const key = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 14, 8), std({ color: 0xc9a03a, metalness: 1, roughness: .3 })); key.position.set(tx(t.x), 28, tz(t.y)); g.add(key);
      return { t, m, tag }; });
    g.add(flatLabel("GET BACK", L.scoop.x + 26, L.scoop.y + 26, 9, { col: "#ffcf9a" }));
    // EXIT sign + wall sconces + fluorescent strips on the back wall
    const exitT = labelTex("EXIT", { col: "#ff2a2a", glow: "#ff0000", bg: "#200404", w: 128, h: 48 });
    const exit = new THREE.Mesh(new THREE.PlaneGeometry(40, 15), new THREE.MeshBasicMaterial({ map: exitT, toneMapped: false })); exit.position.set(tx(183), 60, -352); g.add(exit);
    for (const x of [60, 306]) for (const y of [220, 420]) { const b = new THREE.Mesh(new THREE.SphereGeometry(4, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); b.position.set(tx(x < 183 ? 8 : 358), 30, tz(y)); g.add(b);
      const l = new THREE.PointLight(0xffb060, .7, 110, 2); l.position.copy(b.position); g.add(l); }
    E.fluor = []; for (const z of [-250, -40]) { const m = new THREE.MeshBasicMaterial({ color: 0xbfefff, toneMapped: false }); const f = new THREE.Mesh(new THREE.BoxGeometry(90, 2, 6), m); f.position.set(tx(183), 104, z); g.add(f); E.fluor.push(m); }
  }
  if (n === 3) {
    const red = std({ color: 0x8a1420, roughness: .55, metalness: .05, emissive: 0x3a0408, emissiveIntensity: .4 });
    { const t = L.tgts.find((t) => t.id === "couch"); const c = new THREE.Group(); c.position.set(tx(t.x), 0, tz(t.y)); g.add(c);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(t.w, 14, t.h), red); seat.position.y = 7; c.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(t.w, 30, 10), red); back.position.set(0, 18, -t.h / 2 + 2); c.add(back);
      for (const sx of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, t.h, 14), red); arm.rotation.x = Math.PI / 2; arm.position.set(sx * (t.w / 2 - 4), 16, 0); c.add(arm); }
      for (let i = 0; i < 8; i++) { const btn = new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 4), std({ color: 0x3a0408 })); btn.position.set(-t.w / 2 + 10 + i * 9, 26 - (i % 2) * 6, -t.h / 2 + 7.5); c.add(btn); }
      E.couch = c; }
    { const t = L.tgts.find((t) => t.id === "rp"); const c = new THREE.Group(); c.position.set(tx(t.x), 0, tz(t.y)); g.add(c);
      const wood = std({ color: 0x7a3d17, roughness: .5, metalness: .1 }); const cab = new THREE.Mesh(new THREE.BoxGeometry(t.w, 24, t.h), wood); cab.position.y = 12; c.add(cab);
      const grill = new THREE.Mesh(new THREE.PlaneGeometry(t.w - 16, 14), std({ color: 0xc8a060, roughness: .8, emissive: AMBER, emissiveIntensity: .25 })); grill.position.set(0, 12, t.h / 2 + .2); c.add(grill);
      const plat = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 2, 32), std({ color: 0x111111, roughness: .3, metalness: .3 })); plat.position.set(-6, 25, 0); c.add(plat);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 2.2, 20), glow(PINK, .8)); label.position.set(-6, 25.2, 0); c.add(label);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(t.w, 2, t.h), wood); lid.position.set(0, 24 + t.h / 2, -t.h / 2); lid.rotation.x = -Math.PI / 2; c.add(lid);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 18), MAT.chrome); arm.position.set(16, 27, 0); arm.rotation.y = .4; c.add(arm);
      E.platter = plat; E.platLabel = label; E.rpGlow = new THREE.PointLight(AMBER, 0, 120, 2); E.rpGlow.position.set(0, 40, 0); c.add(E.rpGlow); }
    { const t = L.tgts.find((t) => t.id === "act"); const c = new THREE.Group(); c.position.set(tx(t.x), 0, tz(t.y)); g.add(c);
      const boxM = std({ color: 0x8a8f94, metalness: .6, roughness: .55 }); const bx = new THREE.Mesh(new THREE.BoxGeometry(t.w, 46, t.h), boxM); bx.position.y = 23; c.add(bx);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(t.h - 6, 30), new THREE.MeshBasicMaterial({ map: canvasTex(128, 96, (x, w, h) => { x.fillStyle = "#9aa0a6"; x.fillRect(0, 0, w, h); x.fillStyle = "#c8102e"; x.fillRect(10, 8, w - 20, 22); x.fillStyle = "#fff"; x.font = "bold 16px sans-serif"; x.textAlign = "center"; x.fillText("DANGER", w / 2, 25); x.fillStyle = "#111"; x.font = "bold 22px sans-serif"; x.fillText("ON", w / 2, 58); x.fillText("OFF", w / 2, 88); }) }));
      face.rotation.y = -Math.PI / 2; face.position.set(-t.w / 2 - .3, 24, 0); c.add(face);
      const lever = new THREE.Group(); lever.position.set(-t.w / 2 - 2, 24, t.h / 2 - 4); c.add(lever);
      const rod = new THREE.Mesh(new THREE.BoxGeometry(3, 30, 3), MAT.chrome); rod.position.y = -15; lever.add(rod);
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 10, 10), std({ color: 0x111111 })); grip.rotation.z = Math.PI / 2; grip.position.set(-4, -30, 0); lever.add(grip);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(160, 80, (x, w, h) => { x.fillStyle = "#ffd200"; x.fillRect(0, 0, w, h); for (let i = -2; i < 12; i++) { x.fillStyle = "#111"; x.beginPath(); x.moveTo(i * 20, 0); x.lineTo(i * 20 + 10, 0); x.lineTo(i * 20 - 4, 12); x.lineTo(i * 20 - 14, 12); x.fill(); } x.fillStyle = "#111"; x.font = "bold 26px sans-serif"; x.textAlign = "center"; x.fillText("DANCE", w / 2, 44); x.fillText("FLOOR", w / 2, 70); }) }));
      sign.position.set(-6, 62, 0); sign.rotation.y = -Math.PI / 2 + .5; c.add(sign);
      E.lever = lever; E.actM = boxM; }
    // crate drop targets = record sleeves; beat targets
    for (const t of L.tgts.filter((t) => t.kind === "drop")) { const i = +t.id[3]; const sleeve = canvasTex(64, 64, (c) => { c.fillStyle = ["#ff3d7f", "#46dcff", "#ffaa46"][i]; c.fillRect(0, 0, 64, 64); c.fillStyle = "#111"; c.beginPath(); c.arc(32, 32, 22, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = "bold 22px sans-serif"; c.textAlign = "center"; c.fillText(t.label, 32, 40); });
      const m = new THREE.Mesh(new THREE.BoxGeometry(t.w, 28, t.h), [std({ map: sleeve, emissive: 0xffffff, emissiveMap: sleeve, emissiveIntensity: .5 }), MAT.wall, MAT.wall, MAT.wall, MAT.wall, MAT.wall]); m.position.set(tx(t.x), 14, tz(t.y)); g.add(m); R_.tgt[t.id] = m; }
    const crate = new THREE.Mesh(new THREE.BoxGeometry(22, 18, 110), std({ color: 0x9a7444, roughness: .8 })); crate.position.set(tx(78), 9, tz(362)); g.add(crate);
    for (const t of L.tgts.filter((t) => t.kind === "beat")) R_.tgt[t.id] = buildTarget(g, t, PINK);
    // dance floor tiles
    const tileCols = [PINK, CYAN, AMBER, 0xa040ff];
    R_.rolls = W0.TILES.map((r, i) => { const col = tileCols[(r.r + r.c) % 4]; const mat = std({ color: 0x0a0a10, emissive: col, emissiveIntensity: 0, roughness: .15, metalness: .3 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(r.w - 3, 1.2, r.h - 3), mat); m.position.set(tx(r.x), .6, tz(r.y)); g.add(m); return { r, mat, col }; });
    E.floorLight = new THREE.PointLight(PINK, 0, 300, 2); E.floorLight.position.set(tx(203), 40, tz(300)); g.add(E.floorLight);
    // dancers (the freed girls) on the floor
    E.dancers = [0, 1, 2, 3, 4, 5, 6].map((i) => { const s = sprite(30); const r = W0.TILES[[5, 6, 9, 10, 1, 14, 7][i]]; s.position.set(tx(r.x) + (i % 2 ? 6 : -6), 1, tz(r.y)); s.visible = false; g.add(s); return s; });
    // neon sign, lamp, string lights on the back wall
    const signT = canvasTex(512, 160, (c, w, h) => { c.font = "italic 900 84px 'Brush Script MT', 'Snell Roundhand', cursive"; c.textAlign = "center"; c.shadowColor = "#ff3d7f"; c.shadowBlur = 18; c.fillStyle = "#ff9cc4"; c.fillText("Smile Lounge", w / 2 - 30, 100);
      c.strokeStyle = "#ff9cc4"; c.lineWidth = 7; c.beginPath(); c.arc(w - 60, 70, 34, 0, 7); c.stroke(); c.beginPath(); c.arc(w - 60, 74, 20, .15 * Math.PI, .85 * Math.PI); c.stroke(); c.fillStyle = "#ff9cc4"; c.fillRect(w - 72, 56, 6, 8); c.fillRect(w - 54, 56, 6, 8); });
    E.sign = new THREE.Mesh(new THREE.PlaneGeometry(150, 47), new THREE.MeshBasicMaterial({ map: signT, transparent: true, toneMapped: false })); E.sign.position.set(tx(183), 70, -350); g.add(E.sign);
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(12, 14, 16, 1, true), glow(AMBER, 1.2, { side: THREE.DoubleSide })); lampShade.position.set(tx(30), 58, tz(120)); g.add(lampShade);
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 52, 6), MAT.chrome); lampPole.position.set(tx(30), 26, tz(120)); g.add(lampPole);
    const lamp = new THREE.PointLight(0xffb060, 1.2, 220, 2); lamp.position.set(tx(30), 50, tz(120)); g.add(lamp);
    for (let i = 0; i < 12; i++) { const x = 30 + i * 28; const b = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe0a8 })); b.position.set(tx(x), 96 - Math.sin(i / 11 * Math.PI) * 10, -330); g.add(b); }
    g.add(flatLabel("DJ", L.scoop.x + 18, L.scoop.y + 26, 10, { col: "#ff9cc4" }));
  }
  if (n === 4) {
    // weak points: glowing wrist cuffs + the gold tooth
    for (const t of L.tgts.filter((t) => t.kind === "weak")) {
      if (t.id === "tooth") { const m = new THREE.Mesh(new THREE.BoxGeometry(t.w, 26, t.h), glow(GOLD, .4, { metalness: .9, roughness: .2 })); m.position.set(tx(t.x), 13, tz(t.y)); g.add(m); R_.tgt[t.id] = m; continue; }
      const m = new THREE.Mesh(new THREE.CylinderGeometry(t.h * .9, t.h * .9, t.w, 24), glow(PINK, .4)); m.rotation.z = Math.PI / 2; m.position.set(tx(t.x), 12, tz(t.y)); g.add(m); R_.tgt[t.id] = m;
      const smile = flatLabel("☺", t.x, t.y + 22, 16, { col: "#ffd36a", w: 64, h: 64 }); g.add(smile); }
    // the stiletto (drops onto the table on attack)
    { const t = L.tgts.find((t) => t.id === "shoe"); const s = new THREE.Group(); s.position.set(tx(t.x), 240, tz(t.y)); g.add(s);
      const lac = std({ color: 0x050505, roughness: .12, metalness: .3 });
      const sole = new THREE.Mesh(new THREE.BoxGeometry(t.w * .55, 4, t.h), lac); sole.position.set(0, 2, 0); sole.rotation.x = -.05; s.add(sole);
      const heel = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.6, 46, 10), lac); heel.position.set(0, 23, -t.h / 2 + 4); s.add(heel);
      const arch = new THREE.Mesh(new THREE.BoxGeometry(t.w * .5, 4, t.h * .55), lac); arch.position.set(0, 30, -t.h * .2); arch.rotation.x = .9; s.add(arch);
      for (const z of [8, 18]) { const strap = new THREE.Mesh(new THREE.TorusGeometry(t.w * .26, 1.4, 6, 20, Math.PI), lac); strap.position.set(0, 4, z); s.add(strap); }
      E.shoe = s;
      const fp = new THREE.Mesh(new THREE.PlaneGeometry(t.w * .7, t.h + 10), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, map: canvasTex(96, 160, (c, w, h) => { c.fillStyle = "#ff3d7f"; c.beginPath(); c.ellipse(w / 2, h * .35, w * .38, h * .3, 0, 0, 7); c.fill(); c.beginPath(); c.arc(w / 2, h * .88, 9, 0, 7); c.fill(); }) }));
      fp.rotation.x = -Math.PI / 2; fp.position.set(tx(t.x), .7, tz(t.y)); g.add(fp); E.footprint = fp; }
    // swat shadow + stomp side warning
    E.hand = new THREE.Mesh(new THREE.PlaneGeometry(110, 120), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, map: canvasTex(128, 140, (c, w, h) => { c.fillStyle = "#46dcff"; c.beginPath(); c.ellipse(64, 92, 38, 40, 0, 0, 7); c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(30 + i * 22, 36 - Math.abs(i - 1.5) * 6, 8, 30, 0, 0, 7); c.fill(); } c.beginPath(); c.ellipse(110, 96, 9, 24, -.8, 0, 7); c.fill(); }) }));
    E.hand.rotation.x = -Math.PI / 2; E.hand.position.set(tx(281), .8, tz(325)); g.add(E.hand);
    E.stomp = new THREE.Mesh(new THREE.PlaneGeometry(180, 520), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, map: radialTex("rgba(255,61,127,.9)") }));
    E.stomp.rotation.x = -Math.PI / 2; E.stomp.position.y = .9; g.add(E.stomp);
    g.add(flatLabel("SHIELD", L.scoop.x + 24, L.scoop.y + 26, 9, { col: "#ffd36a" }));
  }
  LV3D[n] = R_; return R_;
}

/* ---------- Giant Grace: towers over the back of the machine on the boss floor ---------- */
function buildGiant() {
  const frames = []; for (let i = 1; i <= 8; i++) frames.push(imgTex(`img/grace/giant/g${i}.webp`));
  const H_ = window.PB_GH || 1500, m = new THREE.Mesh(new THREE.PlaneGeometry(H_ * .45, H_), new THREE.MeshBasicMaterial({ map: frames[0], transparent: true, alphaTest: .04, toneMapped: false, color: 0xdddddd }));
  refs.gBase = window.PB_GB || -700; m.position.set(0, refs.gBase + H_ / 2, window.PB_GZ || -760); m.visible = false; scene.add(m);
  const rim = new THREE.PointLight(PINK, 0, 2000, 1.2); rim.position.set(-400, 600, -500); scene.add(rim);
  const rim2 = new THREE.PointLight(CYAN, 0, 2000, 1.2); rim2.position.set(400, 500, -500); scene.add(rim2);
  refs.giant = { m, frames, rim, rim2, H_ };
}

function build(world) {
  scene = new THREE.Scene();
  loader.load("img/fireball-room.webp?v=1", (t) => { t.colorSpace = THREE.SRGBColorSpace; scene.background = t; refs.bgTex = t; });
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .18;
  mats(); loadGirls();
  scene.add(new THREE.HemisphereLight(0xff9ccf, 0x1a0820, .35));
  const key = new THREE.PointLight(0xffd7a8, 1.1, 0, 0); key.position.set(0, 330, 120); scene.add(key); refs.key = key;
  const pinkL = new THREE.PointLight(PINK, .7, 0, 0); pinkL.position.set(-500, 260, -400); scene.add(pinkL); refs.pinkL = pinkL;
  const cyanL = new THREE.PointLight(CYAN, .45, 0, 0); cyanL.position.set(520, 220, 200); scene.add(cyanL); refs.cyanL = cyanL;

  table = new THREE.Group(); table.rotation.x = TILT; scene.add(table);
  const under = new THREE.Mesh(new THREE.BoxGeometry(440, 30, 780), std({ color: 0x0b0508, roughness: .7 })); under.position.set(0, -16, 0); table.add(under);
  refs.walls = buildWalls(table, world.BASE);
  // flippers
  refs.fl = world.FL.map((f) => {
    const sh = new THREE.Shape(); const r0 = 7, r1 = 4, L = f.len, a = Math.asin((r0 - r1) / L);
    sh.absarc(0, 0, r0, Math.PI / 2 + a, 3 * Math.PI / 2 - a, false); sh.absarc(L, 0, r1, -Math.PI / 2 - a, Math.PI / 2 + a, false);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 2, curveSegments: 16 });
    const m = new THREE.Mesh(geo, [std({ color: 0xfafafa, roughness: .35 }), std({ color: 0xff7aa6, emissive: PINK, emissiveIntensity: .9, roughness: .5 })]);
    m.rotation.x = -Math.PI / 2; const piv = new THREE.Group(); piv.position.set(tx(f.px), 1, tz(f.py)); piv.add(m);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 15, 12), std({ color: 0x222222, metalness: .8 })); cap.position.y = 7; piv.add(cap);
    table.add(piv); return { f, piv };
  });
  // plunger
  { const rod = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 60, 16), std({ color: 0xbbbbbb, metalness: 1, roughness: .2 }));
    rod.rotation.x = Math.PI / 2; const tipM = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 6, 16), glow(PINK, .6));
    tipM.rotation.x = Math.PI / 2; tipM.position.z = -30; const g = new THREE.Group(); g.add(rod); g.add(tipM); g.position.set(tx(383), 9, 0); table.add(g); refs.plunger = g; }
  // balls (pool for multiball) + contact shadows
  const ballMat = std({ color: 0xffffff, metalness: 1, roughness: .06, envMapIntensity: 2.2 }); const sh = new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false });
  refs.balls = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(world.R, 32, 24), ballMat); const s = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), sh); s.rotation.x = -Math.PI / 2; table.add(m); table.add(s); m.visible = s.visible = false; return { m, s }; });
  refs.ballLight = new THREE.PointLight(AMBER, 0, 120, 2); table.add(refs.ballLight);
  // slingshot plastics
  for (const tri of [[[70, 500], [70, 560], [110, 590]], [[296, 500], [296, 560], [256, 590]]]) {
    const s = new THREE.Shape(); s.moveTo(tx(tri[0][0]), -tz(tri[0][1])); s.lineTo(tx(tri[1][0]), -tz(tri[1][1])); s.lineTo(tx(tri[2][0]), -tz(tri[2][1])); s.closePath();
    const pl = new THREE.Mesh(new THREE.ShapeGeometry(s), std({ color: 0xff5a9a, emissive: PINK, emissiveIntensity: .5, transparent: true, opacity: .75, side: THREE.DoubleSide, roughness: .2 }));
    pl.rotation.x = -Math.PI / 2; pl.position.y = 34; table.add(pl); }
  // cabinet
  const sideTex = flameSideTex(); const sideMat = std({ color: 0xffffff, map: sideTex, roughness: .55 });
  const innerTex = canvasTex(512, 64, (c, w, h) => { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "#2a0f1c"); g.addColorStop(1, "#4a1b2c"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,170,90,.18)"; c.fillRect(0, h * .55, w, 2); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * .25})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 1); } });
  const innerMat = std({ map: innerTex, roughness: .55, metalness: .1 }); refs.innerMat = innerMat;
  for (const sx of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(22, 156, 800), sx < 0 ? [innerMat, sideMat, MAT.black, MAT.black, MAT.black, MAT.black] : [sideMat, innerMat, MAT.black, MAT.black, MAT.black, MAT.black]);
    rail.position.set(sx * 222, 38, 0); table.add(rail);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(26, 4, 800), MAT.chrome); trim.position.set(sx * 222, 118, 0); table.add(trim);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 800), MAT.chrome); lip.position.set(sx * 209, 112, 0); table.add(lip);
    const body = new THREE.Mesh(new THREE.BoxGeometry(20, 150, 800), [sideMat, sideMat, MAT.black, MAT.black, MAT.black, MAT.black]); body.position.set(sx * 222, -110, 0); table.add(body);
  }
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(444, 156, 18), [MAT.black, MAT.black, MAT.black, MAT.black, innerMat, MAT.black]); backWall.position.set(0, 38, -371); table.add(backWall);
  const bwTrim = new THREE.Mesh(new THREE.BoxGeometry(450, 4, 22), MAT.chrome); bwTrim.position.set(0, 118, -371); table.add(bwTrim);
  const glassTex = canvasTex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 5; i++) { const x = Math.random() * w, ww = 10 + Math.random() * 40; const g = c.createLinearGradient(x, 0, x + ww, 0);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, `rgba(255,235,245,${.05 + Math.random() * .08})`); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.save(); c.translate(x, 0); c.transform(1, 0, -.35, 1, 0, 0); c.fillRect(0, 0, ww, h); c.restore(); } });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(424, 760), new THREE.MeshBasicMaterial({ map: glassTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
  glass.rotation.x = -Math.PI / 2; glass.position.y = 112; table.add(glass);
  refs.gi = [];
  for (const [x, y] of [[30, 470], [336, 470], [30, 300], [336, 300], [90, 110], [280, 110], [60, 610], [306, 610]]) {
    const L = new THREE.PointLight(0xffb060, .9, 150, 2); L.position.set(tx(x), 18, tz(y)); table.add(L); refs.gi.push(L);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(3.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); bulb.position.set(tx(x), 6, tz(y)); table.add(bulb); }
  // apron instruction cards
  const apTex = canvasTex(1024, 220, (c, w, h) => {
    c.fillStyle = "#14060c"; c.fillRect(0, 0, w, h);
    const card = (x, cw, bgc, fn) => { c.save(); c.translate(x, 22); c.fillStyle = bgc; c.beginPath(); c.roundRect(0, 0, cw, h - 44, 14); c.fill(); fn(cw, h - 44); c.restore(); };
    card(24, 330, "#ffd36a", () => { c.fillStyle = "#1b0a05"; c.font = "bold 26px sans-serif"; c.fillText("THE CLIMB", 18, 36); c.font = "17px sans-serif";
      ["1 Rooftop: break 3 jars", "2 Hallway: keys, doors, 2 girls", "3 Lounge: records, power, dance", "Clear a floor, shoot the ramp up"].forEach((t, i) => c.fillText("• " + t, 18, 68 + i * 26)); });
    card(374, 290, "#c81d4e", (cw) => { c.fillStyle = "#ffd36a"; c.font = "italic 900 40px 'Arial Black', Impact, sans-serif"; c.textAlign = "center"; c.fillText("BETTER FREE", cw / 2, 92);
      c.font = "bold 18px monospace"; c.fillStyle = "#ffe3ec"; c.fillText("MOTEL SMILE", cw / 2, 128); c.font = "13px monospace"; c.fillText("3 BALLS PER PLAY", cw / 2, 152); });
    card(684, 316, "#ff3d7f", () => { c.fillStyle = "#fff"; c.font = "bold 24px sans-serif"; c.fillText("GIANT GRACE", 18, 36); c.font = "16px sans-serif"; c.fillStyle = "#1b0a05";
      ["Hit what glows: wrists, gold tooth", "Watch for her shoe and hand", "Fall down? Climb back. She", "never heals. Beat her: you win."].forEach((t, i) => c.fillText(t, 18, 66 + i * 24)); });
  });
  const apMat = std({ map: apTex, roughness: .5, emissive: 0xffffff, emissiveMap: apTex, emissiveIntensity: .25 });
  const ap = new THREE.Mesh(new THREE.BoxGeometry(372, 18, 70), [MAT.black, MAT.black, apMat, MAT.black, MAT.black, MAT.black]); ap.position.set(tx(183), 9, 372); table.add(ap);
  const startBtn = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 6, 24), std({ color: 0x46ff9e, emissive: 0x2bdc7a, emissiveIntensity: 1.2, roughness: .3 }));
  startBtn.rotation.x = Math.PI / 2; startBtn.position.set(0, 0, 413); table.add(startBtn);
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 440, 20), MAT.chrome); lock.rotation.z = Math.PI / 2; lock.position.set(0, 22, 392); table.add(lock);
  const front = new THREE.Mesh(new THREE.BoxGeometry(464, 180, 16), [MAT.black, MAT.black, MAT.black, MAT.black, sideMat, MAT.black]); front.position.set(0, -110, 404); table.add(front);
  for (const [lx, lz] of [[-215, 360], [215, 360], [-215, -350], [215, -350]]) {
    const top = new THREE.Vector3(lx, -60, lz).applyEuler(table.rotation);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(14, top.y + 600, 14), MAT.chrome); leg.position.set(top.x, (top.y - 600) / 2, top.z); scene.add(leg);
  }
  // backbox
  const far = new THREE.Vector3(0, 118, -390).applyEuler(table.rotation);
  bb = new THREE.Group(); bb.position.set(0, far.y, far.z - 10); scene.add(bb);
  const box = new THREE.Mesh(new THREE.BoxGeometry(450, 330, 80), [sideMat, sideMat, MAT.black, MAT.black, MAT.black, MAT.black]); box.position.y = 205; bb.add(box);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(450, 40, 70), MAT.black); neck.position.y = 20; bb.add(neck);
  refs.bgC = document.createElement("canvas"); refs.bgC.width = 1024; refs.bgC.height = 600; refs.bgT = new THREE.CanvasTexture(refs.bgC); refs.bgT.colorSpace = THREE.SRGBColorSpace;
  const glassArt = new THREE.Mesh(new THREE.PlaneGeometry(410, 236), std({ map: refs.bgT, emissive: 0xffffff, emissiveMap: refs.bgT, emissiveIntensity: .5, roughness: .2 }));
  glassArt.position.set(0, 244, 40.5); bb.add(glassArt); refs.backglass = glassArt.material;
  refs.dmdC = document.createElement("canvas"); refs.dmdC.width = 640; refs.dmdC.height = 128; refs.dmdT = new THREE.CanvasTexture(refs.dmdC); refs.dmdT.colorSpace = THREE.SRGBColorSpace;
  const dmd = new THREE.Mesh(new THREE.PlaneGeometry(360, 72), new THREE.MeshBasicMaterial({ map: refs.dmdT, toneMapped: false })); dmd.position.set(0, 84, 40.6); bb.add(dmd);
  const dmdFrame = new THREE.Mesh(new THREE.PlaneGeometry(372, 84), std({ color: 0x050505, roughness: .4 })); dmdFrame.position.set(0, 84, 40.4); bb.add(dmdFrame);
  const bbTrim = new THREE.Mesh(new THREE.BoxGeometry(456, 6, 84), MAT.chrome); bbTrim.position.y = 373; bb.add(bbTrim);
  // topper: MOTEL SMILE neon
  const topT = canvasTex(512, 96, (c, w, h) => { c.fillStyle = "#0a0408"; c.fillRect(0, 0, w, h); c.font = "bold 62px 'Arial Black', Impact, sans-serif"; c.textAlign = "center"; c.shadowColor = "#ff3d7f"; c.shadowBlur = 16; c.fillStyle = "#ffb3d1"; c.fillText("MOTEL SMILE", w / 2, 70); });
  const topper = new THREE.Mesh(new THREE.BoxGeometry(330, 62, 20), [MAT.black, MAT.black, MAT.black, MAT.black, new THREE.MeshBasicMaterial({ map: topT, toneMapped: false }), MAT.black]); topper.position.y = 410; bb.add(topper);
  buildGiant();
  refs.hud = new THREE.Mesh(new THREE.PlaneGeometry(1, .2), new THREE.MeshBasicMaterial({ map: refs.dmdT, toneMapped: false, transparent: true, opacity: .92, depthTest: false }));
  refs.hud.renderOrder = 10; refs.hud.visible = false; camera.add(refs.hud); scene.add(camera);
}

function setLevel(n) {
  if (!LV3D[n]) buildLevel(n);
  for (const k in LV3D) LV3D[k].g.visible = +k === n;
  curLevel = n; drawBackglass(refs.bgC.getContext("2d"), 1024, 600, n); refs.bgT.needsUpdate = true;
  const giant = n === 4; refs.giant.m.visible = giant; bb.visible = !giant; refs.hud.visible = giant;
  const tint = { 1: [0xff9ccf, PINK, CYAN], 2: [0xffc89a, AMBER, 0x9fe8ff], 3: [0xff9ccf, PINK, 0xa040ff], 4: [0xffd0a0, PINK, CYAN] }[n];
  refs.pinkL.color.setHex(tint[1]); refs.cyanL.color.setHex(tint[2]);
  for (const L of refs.gi) L.color.setHex(n === 2 ? 0xffc070 : n === 3 ? 0xff80b0 : 0xffb060);
  dmdKey = ""; if (host) frameCamera();
}

function frameCamera() {
  const w = host.clientWidth, h = host.clientHeight, asp = w / h; phone = asp < .8;
  camera.aspect = asp;
  if (phone) { camera.fov = 70; refs.camPos = new THREE.Vector3(0, 250, 560); refs.camLook = new THREE.Vector3(0, -30, -180); }
  else { camera.fov = 60; refs.camPos = new THREE.Vector3(0, 250, 580); refs.camLook = new THREE.Vector3(0, -40, -120); }
  if (curLevel === 4) { const bo = window.PB_BOSSCAM || (phone ? { fov: 80, dy: 70, dz: 40 } : { fov: 72, dy: 90, dz: 60 }); camera.fov = bo.fov; refs.camLook.y += bo.dy; refs.camPos.z += bo.dz; refs.camPos.y += bo.dy * .4; }
  if (window.PB_CAM) { const o = window.PB_CAM; camera.fov = o.fov; refs.camPos = new THREE.Vector3(...o.pos); refs.camLook = new THREE.Vector3(...o.look); }
  camera.setViewOffset(w, h, 0, 0, w, h);
  if (refs.hud) { const d = 10, vh = 2 * d * Math.tan(camera.fov * Math.PI / 360), vw = vh * asp, hw = Math.min(vw * .9, vh * .6); refs.hud.scale.set(hw, hw, 1); refs.hud.position.set(0, -vh / 2 + hw * .1 + vh * .02, -d); }
  camera.position.copy(refs.camPos); camera.lookAt(refs.camLook); camera.updateProjectionMatrix();
}

function init(box, world) {
  try {
    host = box.querySelector(".pb-3d"); W0 = world;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia("(pointer:coarse)").matches ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9; renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(40, 1, 5, 6000);
    build(world); setLevel(world.level);
    composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .4, .82); composer.addPass(bloom); composer.addPass(new OutputPass());
    resize(); api.ok = true;
  } catch (e) { console.warn("Better Free 3D unavailable, using 2D", e); api.ok = false; }
}
function resize() { if (!renderer) return; const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); composer.setSize(w, h); frameCamera(); }

function render(w) {
  const now = performance.now(), t = now / 1000;
  if (w.level !== curLevel) setLevel(w.level);
  const R_ = LV3D[curLevel], L = w.LV, n = curLevel, pulse = .5 + .5 * Math.sin(now / 140);
  // balls
  const B = w.state === "play" || w.state === "ready" ? w.balls : [];
  refs.balls.forEach((r, i) => { const b = B[i]; r.m.visible = r.s.visible = !!b && !b.dead; if (!b) return;
    r.m.position.set(tx(b.x), w.R + (b.z || 0), tz(b.y)); r.m.rotation.x += (b.vy || 0) * .0006; r.m.rotation.z -= (b.vx || 0) * .0006;
    r.s.position.set(tx(b.x) + 4, .4 + (b.z || 0), tz(b.y) + 6); });
  const b0 = w.ball; refs.ballLight.position.set(tx(b0.x), w.R + 6, tz(b0.y)); refs.ballLight.intensity = w.fireT > 0 ? 2 + w.fireT * 4 : w.mb ? 1.5 : 0;
  for (const r of refs.fl) { const th = r.f.side > 0 ? r.f.ang : Math.PI - r.f.ang; r.piv.rotation.y = -th; }
  for (const r of refs.walls) r.m.emissiveIntensity = r.s.t > 0 ? 5 : (r.sling ? 1.4 : 1.6);
  for (const r of R_.walls) r.m.emissiveIntensity = 1.6;
  refs.plunger.position.z = tz(700 + w.charge * 28) + 30;
  // bumpers
  for (const r of R_.bump) { const hot = r.b.t > 0;
    if (r.kind === "bell") { r.dome.position.y = hot ? 5 : 8; r.base.material.emissiveIntensity = hot ? 4 : .9; continue; }
    r.capMat.emissiveMap = hot ? r.topHot : r.topCold; r.capMat.map = r.capMat.emissiveMap; r.capMat.emissiveIntensity = hot ? 2.2 : .7; r.sideMat.emissiveIntensity = hot ? 3 : .8; r.cap.position.y = hot ? 30 : 34; }
  // jars
  const fr = Math.floor(t / BEAT);
  for (const r of R_.jars) { const j = r.j; r.g.position.y = -50 + j.h * 50; r.g.visible = j.h > .02;
    if (j.girl) setMap(r.girl.material, girlTex(j.girl, fr + j.x));
    r.glassM.emissive.setHex(j.gold ? GOLD : PINK); r.glassM.emissiveIntensity = .25 + j.hits * .5 + j.flash * 4 + (j.gold ? .6 * pulse : 0); r.glassM.opacity = .32 + j.hits * .12;
    r.light.intensity = j.up ? 1.2 + j.flash * 6 : 0; r.girl.rotation.y = Math.sin(t * 3 + j.x) * .3; }
  if (R_.scoop) R_.scoop.rimM.emissiveIntensity = (R_.scoop.sc.lit ? 1.5 + 1.5 * pulse : .2) + R_.scoop.sc.flash * 2;
  if (R_.spin) R_.spin.rotation.x = L.spin.a;
  if (R_.ramp) { const lit = w.rampLit; R_.ramp.railMat.emissive.setHex(lit ? PINK : CYAN); R_.ramp.railMat.color.setHex(lit ? PINK : CYAN); R_.ramp.railMat.emissiveIntensity = lit ? 1.5 + 2.5 * pulse : .9 + w.RAMP.flash * 3;
    R_.ramp.arrow.material.color.setHex(lit ? PINK : 0x46dcff); R_.ramp.arrow.material.opacity = lit ? .5 + .5 * pulse : .35; }
  for (const id in R_.tgt) { const m = R_.tgt[id], tg = L.tgts.find((x) => x.id === id); if (!tg) continue;
    if (tg.kind === "drop") { const y = tg.down ? -16 : 14; m.position.y += (y - m.position.y) * .4; continue; }
    if (tg.kind === "beat") { m.material.emissiveIntensity = (w.L3S.power ? .9 + pulse : .15) + tg.t * 6; continue; }
    if (tg.kind === "weak") { const on = w.weakActive(tg); m.material.emissiveIntensity = on ? 1.4 + 2.4 * pulse : .15; m.material.emissive.setHex(tg.t > 0 ? 0xffffff : tg.id === "tooth" ? GOLD : PINK); continue; }
    if (tg.kind === "stand") m.material.emissiveIntensity = 1.1 + tg.t * 6; }
  if (n === 1) for (const r of R_.rolls) { const sk = w.skill >= 0 && L.rolls.indexOf(r.r) === w.skill; r.mat.emissiveIntensity = r.r.lit || sk ? 2.6 : .15; }
  const E = R_.extra;
  if (n === 2) {
    for (const d of E.doors) { const st = d.t.state; const want = st === "open" || st === "done" ? (d.left ? -1.5 : 1.5) : 0; d.ang += (want - d.ang) * .15; d.hinge.rotation.y = d.ang;
      const liar = w.L2S.liar === d.t.id;
      d.under.emissive.setHex(liar ? 0xff2020 : st === "done" ? PINK : st === "unlocked" ? 0xffffff : st === "open" ? PINK : CYAN);
      d.under.emissiveIntensity = st === "unlocked" || liar ? (Math.floor(now / 150) % 2 ? 4 : .3) : st === "locked" ? 1.4 : 2.5;
      d.pm.emissiveIntensity = (st === "unlocked" ? .12 + .5 * pulse : .12) + d.t.t * 2;
      d.room.intensity = st === "open" ? 1.5 + pulse : st === "done" ? .8 : 0; }
    for (const k of E.keys) { k.m.emissiveIntensity = (k.t.lit ? 2.5 : .3) + k.t.t * 6; k.tag.rotation.y = k.t.t > 0 ? Math.sin(now / 30) * .5 : 0; }
    const dk = Math.min(1, w.dark * 1.2); for (const m of E.fluor) m.color.setScalar(dk > 0 ? .05 : (Math.random() < .015 ? .3 : 1));
  }
  if (n === 3) {
    const S = w.L3S, on = S.power;
    for (const r of R_.rolls) { r.mat.emissive.setHex(r.r.lit ? r.col : r.col); r.mat.emissiveIntensity = !on ? .02 : r.r.lit ? 1.6 + 1.4 * pulse : .35 + .25 * Math.sin(t * 6 + r.r.r + r.r.c) + r.r.t * 3; }
    E.floorLight.intensity = on ? 1.5 + pulse : 0; E.floorLight.color.setHex([PINK, CYAN, AMBER, 0xa040ff][fr % 4]);
    E.platter.rotation.y += S.rp ? .15 : 0; E.rpGlow.intensity = S.rp ? 1.2 : 0;
    E.lever.rotation.x += ((on ? Math.PI : 0) - E.lever.rotation.x) * .12;
    E.actM.emissive.setHex(on ? 0x46ff9e : S.rp ? CYAN : 0x000000); E.actM.emissiveIntensity = on ? .5 : S.rp ? .4 + .6 * pulse : 0;
    E.sign.material.opacity = on ? 1 : .55 + .2 * Math.sin(t * 9) * Math.sin(t * 2.3);
    const fd = [...w.freed]; E.dancers.forEach((s, i) => { const name = fd[i]; s.visible = on && !!name; if (!s.visible) return; setMap(s.material, girlTex(name, fr + i * 3)); });
  }
  if (n === 4) {
    const Bs = w.BOSS, a = Bs.atk; const sh = w.LV.tgts.find((x) => x.id === "shoe");
    const shoeY = a && a.kind === "shoe" ? (a.t < a.warn ? 240 : a.t < a.warn + a.act ? 0 : Math.min(240, (a.t - a.warn - a.act) * 400)) : 240;
    E.shoe.position.y += (shoeY - E.shoe.position.y) * (shoeY < E.shoe.position.y ? .45 : .2); E.shoe.visible = E.shoe.position.y < 235;
    E.footprint.material.opacity = a && a.kind === "shoe" && a.t < a.warn ? .3 + .5 * pulse : 0;
    E.hand.material.opacity = a && a.kind === "swat" ? (a.t < a.warn ? .25 + .45 * pulse : Math.max(0, .9 - (a.t - a.warn) * 2)) : 0;
    E.hand.position.x = tx(281) + (a && a.kind === "swat" && a.t >= a.warn ? -(a.t - a.warn) * 260 : 0);
    E.stomp.material.opacity = a && a.kind === "stomp" && a.t < a.warn ? .25 + .35 * pulse : 0; if (a) E.stomp.position.set(tx(a.side ? 280 : 90), .9, tz(380));
    const G = refs.giant, gf = Math.floor(t / (BEAT * 2)) % 8; setMap(G.m.material, G.frames[gf]);
    const lean = a && a.t < a.warn ? 1 : 0; G.m.position.y += ((refs.gBase + G.H_ / 2 - (Bs.hp <= 0 ? 600 : 0) - lean * 40) - G.m.position.y) * .05;
    G.m.material.color.setScalar(w.flash > 0 ? 1.2 : .85); G.rim.intensity = 2.5; G.rim2.intensity = 1.8;
  } else { refs.giant.rim.intensity = 0; refs.giant.rim2.intensity = 0; }
  // lights + backglass
  const dk = Math.min(1, w.dark * 1.2); refs.key.intensity = (1.1 + (w.fireT > 0 ? w.fireT * 3 : 0)) * (1 - dk * .9);
  for (const L_ of refs.gi) L_.intensity = .9 * (1 - dk);
  refs.backglass.emissiveIntensity = .5 + (w.fireT > 0 ? .6 * Math.sin(now / 50) : 0) + (w.state === "ready" ? .15 * Math.sin(now / 300) : 0) + (w.rampLit ? .25 * pulse : 0);
  // camera: shake on big hits; the lounge finale orbits the table
  const sk = w.shake || 0; let cp = refs.camPos.clone();
  if (n === 3 && w.whoa > 0) { const u = 1 - w.whoa / 3, ang = Math.sin(u * Math.PI) * .7; const d = cp.clone().sub(refs.camLook); d.applyAxisAngle(new THREE.Vector3(0, 1, 0), ang); d.y += Math.sin(u * Math.PI) * 120; cp = refs.camLook.clone().add(d); }
  camera.position.set(cp.x + (Math.random() - .5) * sk * 1.5, cp.y + (Math.random() - .5) * sk, cp.z); camera.lookAt(refs.camLook);
  dmdDraw(w, now);
  composer.render();
}
let dmdKey = "";
function dmdDraw(w, now) {
  const big = w.msg || "", flash = big && Math.floor(now / 160) % 2 === 0, boss = w.level === 4;
  const key = [w.score, w.ballsLeft, w.mult, w.state, big, w.msg2, big ? flash : "", w.level, boss ? w.BOSS.hp : "", w.freed.size, w.won].join("|");
  if (key === dmdKey) return; dmdKey = key;
  const c = refs.dmdC.getContext("2d"), W_ = 640, H_ = 128; c.fillStyle = "#120300"; c.fillRect(0, 0, W_, H_);
  c.fillStyle = "#ff8a1e"; c.textAlign = "center"; c.textBaseline = "middle";
  const fit = (txt, px, maxw) => { c.font = `bold ${px}px monospace`; const fw = c.measureText(txt).width; if (fw > maxw) c.font = `bold ${Math.floor(px * maxw / fw)}px monospace`; };
  if (big) { fit(big, w.msg2 ? 48 : 56, 610); if (flash) c.fillStyle = "#ffd36a"; c.fillText(big, W_ / 2, w.msg2 ? 42 : H_ / 2); if (w.msg2) { c.fillStyle = "#ff8a1e"; fit(w.msg2, 28, 610); c.fillText(w.msg2, W_ / 2, 98); } }
  else if (w.state === "ready") { c.font = "bold 44px monospace"; c.fillText("BETTER FREE", W_ / 2, 40); c.font = "28px monospace"; c.fillText("BEST " + w.best, W_ / 2, 92); }
  else if (w.state === "over") { fit(w.won ? "YOU WIN! " + w.rank : w.rank, 44, 610); c.fillText(w.won ? "YOU WIN! " + w.rank : w.rank, W_ / 2, 40); c.font = "bold 36px monospace"; c.fillText(String(w.score).replace(/\B(?=(\d{3})+(?!\d))/g, ","), W_ / 2, 94); }
  else if (boss) { c.font = "bold 30px monospace"; c.fillText("GIANT GRACE", W_ / 2, 22);
    for (let i = 0; i < 12; i++) { const on = i < w.BOSS.hp; c.fillStyle = on ? "#ff3d7f" : "#3a0a14"; c.fillRect(70 + i * 42, 44, 36, 26); }
    c.fillStyle = "#ff8a1e"; c.font = "bold 30px monospace"; c.fillText(String(w.score).replace(/\B(?=(\d{3})+(?!\d))/g, ","), W_ / 2, 104);
    c.font = "20px monospace"; c.textAlign = "left"; c.fillText("BALL " + Math.min(3, 4 - w.ballsLeft), 12, 104); }
  else { c.font = "bold 56px monospace"; c.fillText(String(w.score).replace(/\B(?=(\d{3})+(?!\d))/g, ","), W_ / 2, 50);
    c.font = "22px monospace"; c.textAlign = "left"; c.fillText("BALL " + Math.min(3, 4 - w.ballsLeft) + "  FLOOR " + w.level, 14, 106);
    c.textAlign = "right"; c.fillText("FREE " + w.freed.size + "/7  x" + w.mult, W_ - 14, 106); }
  c.fillStyle = "rgba(0,0,0,.55)"; for (let x = 0; x < W_; x += 4) c.fillRect(x, 0, 1.4, H_); for (let y = 0; y < H_; y += 4) c.fillRect(0, y, W_, 1.4);
  refs.dmdT.needsUpdate = true;
}

const api = { init, render, resize, ok: false };
window.MSPB3D = api;
