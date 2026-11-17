/* BETTER FREE 3D — renders the pinball table as a real machine on the rooftop.
   The physics stay in fireball.js; this module only draws. window.MSPB3D = {init, render, resize, ok} */
import * as THREE from "./vendor/three.module.min.js";
import { EffectComposer } from "./vendor/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./vendor/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./vendor/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "./vendor/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "./vendor/jsm/environments/RoomEnvironment.js";

const TILT = 6.5 * Math.PI / 180;
const PINK = 0xff3d7f, CYAN = 0x46dcff, AMBER = 0xffaa46, FIRE = 0xff5a28;
let renderer, scene, camera, composer, bloom, host, W0, table, refs = {}, phone = false;

const tx = (x) => x - 200, tz = (y) => y - 360;
function canvasTex(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

function smileyTex(hot) {
  return canvasTex(256, 256, (c) => {
    c.fillStyle = hot ? "#ff8ab0" : "#d81b60"; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill();
    c.lineWidth = 14; c.strokeStyle = "#ffd0e0"; c.stroke();
    c.fillStyle = "#14040b"; c.beginPath(); c.arc(88, 100, 16, 0, 7); c.arc(168, 100, 16, 0, 7); c.fill();
    c.lineWidth = 16; c.lineCap = "round"; c.strokeStyle = "#14040b"; c.beginPath(); c.arc(128, 128, 62, .18 * Math.PI, .82 * Math.PI); c.stroke();
  });
}
function backglassTex() {
  return canvasTex(1024, 720, (c, w, h) => {
    const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "#ff7a1a"); g.addColorStop(.35, "#c81d4e"); g.addColorStop(1, "#16040e"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = Math.random() * w, fh = 120 + Math.random() * 320; const fg = c.createLinearGradient(x, h, x, h - fh);
      fg.addColorStop(0, "rgba(255,210,80,.55)"); fg.addColorStop(1, "rgba(255,60,60,0)"); c.fillStyle = fg; c.beginPath(); c.moveTo(x - 40, h);
      c.quadraticCurveTo(x - 20, h - fh * .5, x + Math.random() * 30 - 15, h - fh); c.quadraticCurveTo(x + 25, h - fh * .5, x + 40, h); c.fill(); }
    // fireball
    const fb = c.createRadialGradient(330, 300, 10, 330, 300, 150); fb.addColorStop(0, "#fff6c8"); fb.addColorStop(.35, "#ffb02e"); fb.addColorStop(.7, "rgba(255,70,30,.8)"); fb.addColorStop(1, "rgba(255,40,40,0)");
    c.fillStyle = fb; c.beginPath(); c.arc(330, 300, 150, 0, 7); c.fill();
    c.save(); c.translate(w / 2, 300); c.rotate(-.1); c.font = "italic 900 128px 'Arial Black', Impact, sans-serif"; c.textAlign = "center";
    c.lineWidth = 16; c.strokeStyle = "#2a0610"; c.strokeText("BETTER FREE", 0, 0); const tg = c.createLinearGradient(0, -130, 0, 20); tg.addColorStop(0, "#fff3b0"); tg.addColorStop(1, "#ff8a1e");
    c.fillStyle = tg; c.fillText("BETTER FREE", 0, 0); c.restore();
    c.font = "bold 42px monospace"; c.textAlign = "center"; c.fillStyle = "#ffd0e0"; c.fillText("MOTEL SMILE · ROOFTOP ARCADE", w / 2, 450);
    c.strokeStyle = "#ffd36a"; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
  });
}
function flameSideTex() {
  return canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = "#0d0509"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const x = Math.random() * w, fh = 40 + Math.random() * 80; const fg = c.createLinearGradient(x, h, x, h - fh);
      fg.addColorStop(0, "rgba(255,120,30,.9)"); fg.addColorStop(1, "rgba(255,40,90,0)"); c.fillStyle = fg; c.beginPath(); c.moveTo(x - 14, h); c.quadraticCurveTo(x, h - fh, x + 14, h); c.fill(); }
  });
}
function blobTex() { return canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(0,0,0,.75)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }); }

function build(world) {
  scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();
  loader.load("img/fireball-room.webp?v=1", (t) => { t.colorSpace = THREE.SRGBColorSpace; scene.background = t; });
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .18;

  scene.add(new THREE.HemisphereLight(0xff9ccf, 0x1a0820, .35));
  const key = new THREE.PointLight(0xffd7a8, 1.1, 0, 0); key.position.set(0, 330, 120); scene.add(key); refs.key = key;
  const pinkL = new THREE.PointLight(PINK, .7, 0, 0); pinkL.position.set(-500, 260, -400); scene.add(pinkL);
  const cyanL = new THREE.PointLight(CYAN, .45, 0, 0); cyanL.position.set(520, 220, 200); scene.add(cyanL);

  // floor (wet roof)

  table = new THREE.Group(); table.rotation.x = TILT; scene.add(table);
  // playfield
  const pfTex = new THREE.CanvasTexture(world.bg()); pfTex.colorSpace = THREE.SRGBColorSpace; pfTex.anisotropy = 8;
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(400, 720), new THREE.MeshStandardMaterial({ map: pfTex, roughness: .45, metalness: .05, emissive: 0xffffff, emissiveMap: pfTex, emissiveIntensity: .4 }));
  pf.rotation.x = -Math.PI / 2; table.add(pf); refs.pf = pf;
  const under = new THREE.Mesh(new THREE.BoxGeometry(440, 30, 780), new THREE.MeshStandardMaterial({ color: 0x0b0508, roughness: .7 }));
  under.position.set(0, -16, 0); table.add(under);

  // walls: dark plastic with a neon strip on top
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b0a14, roughness: .5, metalness: .2 });
  refs.walls = []; const posts = new Set();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .35, metalness: .1 }), rubberMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .8 });
  for (const s of world.segs) {
    const ax = tx(s.a[0]), az = tz(s.a[1]), bx = tx(s.b[0]), bz = tz(s.b[1]); const L = Math.hypot(bx - ax, bz - az); if (L < .5) continue;
    const g = new THREE.Group(); g.position.set((ax + bx) / 2, 0, (az + bz) / 2); g.rotation.y = -Math.atan2(bz - az, bx - ax);
    const sling = s.kind === "sling"; const inner = Math.min(s.a[0], s.b[0]) > 10 && Math.max(s.a[0], s.b[0]) < 356 && Math.min(s.a[1], s.b[1]) > 230;
    const lanePost = s.a[0] === s.b[0] && Math.max(s.a[1], s.b[1]) < 100; const hgt = sling ? 22 : inner || lanePost ? 26 : 38;
    if (inner || lanePost) for (const p of [s.a, s.b]) { const k = p[0] + "," + p[1]; if (posts.has(k)) continue; posts.add(k);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 32, 14), postMat); post.position.set(tx(p[0]), 16, tz(p[1])); table.add(post);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 1.8, 8, 18), rubberMat); ring.rotation.x = Math.PI / 2; ring.position.set(tx(p[0]), 12, tz(p[1])); table.add(ring);
      const top = new THREE.Mesh(new THREE.SphereGeometry(4.2, 12, 8, 0, 6.3, 0, 1.6), postMat); top.position.set(tx(p[0]), 32, tz(p[1])); table.add(top); }
    const body = new THREE.Mesh(new THREE.BoxGeometry(L + 4, hgt, 5), wallMat); body.position.y = hgt / 2; g.add(body);
    const stripMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: sling ? CYAN : PINK, emissiveIntensity: 1.6 });
    const strip = new THREE.Mesh(new THREE.BoxGeometry(L + 4, 2.2, 5.6), stripMat); strip.position.y = hgt + 1; g.add(strip);
    table.add(g); refs.walls.push({ s, m: stripMat, sling });
  }
  // bumpers
  refs.bump = world.BUMP.map((b) => {
    const g = new THREE.Group(); g.position.set(tx(b.x), 0, tz(b.y));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(b.r + 3, b.r + 4, 4, 40), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .4 })); base.position.y = 2; g.add(base);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(b.r + 1, b.r + 2, 6, 40), new THREE.MeshStandardMaterial({ color: 0xffd36a, emissive: AMBER, emissiveIntensity: .35, roughness: .4 })); skirt.position.y = 8; g.add(skirt);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(b.r - 7, b.r - 7, 26, 32), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: .15 })); body.position.y = 18; g.add(body);
    const topCold = smileyTex(false), topHot = smileyTex(true);
    const capMat = new THREE.MeshStandardMaterial({ map: topCold, emissive: 0xffffff, emissiveMap: topCold, emissiveIntensity: .45, roughness: .3 });
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xff3d7f, emissive: PINK, emissiveIntensity: .8, roughness: .3, transparent: true, opacity: .92 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(b.r, b.r, 9, 40), [sideMat, capMat, sideMat]); cap.position.y = 34; cap.rotation.y = Math.PI / 2; g.add(cap);
    table.add(g); return { b, capMat, sideMat, topCold, topHot, cap };
  });
  // drop targets
  refs.tgt = world.TGT.map((t) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(t.w, 30, t.h), new THREE.MeshStandardMaterial({ color: FIRE, emissive: FIRE, emissiveIntensity: 1.2, roughness: .4 }));
    m.position.set(tx(t.x), 15, tz(t.y)); table.add(m);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(64, 64, (c) => { c.font = "bold 52px sans-serif"; c.textAlign = "center"; c.fillStyle = "#ffd36a"; c.fillText(t.ch, 32, 50); }) }));
    lab.rotation.x = -Math.PI / 2; lab.position.set(tx(t.x) + 14, .4, tz(t.y)); table.add(lab);
    return { t, m };
  });
  // lane inserts
  refs.lanes = world.LANES.map((l) => {
    const mat = new THREE.MeshStandardMaterial({ color: 0x331a08, emissive: AMBER, emissiveIntensity: .15, roughness: .3 });
    const m = new THREE.Mesh(new THREE.CircleGeometry(7, 24), mat); m.rotation.x = -Math.PI / 2; m.position.set(tx(l.x), .3, tz(l.y + 22)); table.add(m); return { l, mat };
  });
  // spinner
  { const g = new THREE.Group(); g.position.set(tx(world.SPIN.x), 28, tz(world.SPIN.y));
    const wire = new THREE.Mesh(new THREE.TorusGeometry(17, 1, 6, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: .2 })); wire.rotation.y = Math.PI / 2; wire.rotation.z = 0; wire.position.y = -1;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 1.4), new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 1.2, metalness: .3 })); blade.position.y = -7;
    const pivot = new THREE.Group(); pivot.add(blade); g.add(pivot); table.add(g); refs.spin = pivot; }
  // flippers
  refs.fl = world.FL.map((f) => {
    const sh = new THREE.Shape(); const r0 = 7, r1 = 4, L = f.len, a = Math.asin((r0 - r1) / L);
    sh.absarc(0, 0, r0, Math.PI / 2 + a, 3 * Math.PI / 2 - a, false); sh.absarc(L, 0, r1, -Math.PI / 2 - a, Math.PI / 2 + a, false);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 2, curveSegments: 16 });
    const m = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: .35 }), new THREE.MeshStandardMaterial({ color: 0xff7aa6, emissive: PINK, emissiveIntensity: .9, roughness: .5 })]);
    m.rotation.x = -Math.PI / 2; const piv = new THREE.Group(); piv.position.set(tx(f.px), 1, tz(f.py)); piv.add(m);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 15, 12), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: .8 })); cap.position.y = 7; piv.add(cap);
    table.add(piv); return { f, piv };
  });
  // plunger
  { const rod = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 60, 16), new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 1, roughness: .2 }));
    rod.rotation.x = Math.PI / 2; const tipM = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 6, 16), new THREE.MeshStandardMaterial({ color: PINK, emissive: PINK, emissiveIntensity: .6 }));
    tipM.rotation.x = Math.PI / 2; tipM.position.z = -30; const g = new THREE.Group(); g.add(rod); g.add(tipM); g.position.set(tx(383), 9, 0); table.add(g); refs.plunger = g; }
  // ball + contact shadow
  refs.ball = new THREE.Mesh(new THREE.SphereGeometry(world.R, 32, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .06, envMapIntensity: 2.2 })); table.add(refs.ball);
  refs.shadow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false })); refs.shadow.rotation.x = -Math.PI / 2; table.add(refs.shadow);
  refs.ballLight = new THREE.PointLight(AMBER, 0, 120, 2); table.add(refs.ballLight);

  // cabinet: side rails with flame decals, apron + lockdown bar, legs, glass
  const sideTex = flameSideTex(); const sideMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: sideTex, roughness: .55 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x0a0608, roughness: .6, metalness: .2 });
  const innerTex = canvasTex(512, 64, (c, w, h) => { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "#2a0f1c"); g.addColorStop(1, "#4a1b2c"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,170,90,.18)"; c.fillRect(0, h * .55, w, 2); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * .25})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 1); } });
  const innerMat = new THREE.MeshStandardMaterial({ map: innerTex, roughness: .55, metalness: .1 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0x8a8a90, metalness: 1, roughness: .35 });
  for (const sx of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(22, 156, 800), sx < 0 ? [innerMat, sideMat, blackMat, blackMat, blackMat, blackMat] : [sideMat, innerMat, blackMat, blackMat, blackMat, blackMat]);
    rail.position.set(sx * 222, 38, 0); table.add(rail);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(26, 4, 800), chrome); trim.position.set(sx * 222, 118, 0); table.add(trim);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 800), chrome); lip.position.set(sx * 209, 112, 0); table.add(lip);
    const body = new THREE.Mesh(new THREE.BoxGeometry(20, 150, 800), [sideMat, sideMat, blackMat, blackMat, blackMat, blackMat]); body.position.set(sx * 222, -110, 0); table.add(body);
  }
  const apron = new THREE.Mesh(new THREE.BoxGeometry(424, 44, 44), blackMat); apron.position.set(0, -6, 386); table.add(apron);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(444, 156, 18), [blackMat, blackMat, blackMat, blackMat, innerMat, blackMat]); backWall.position.set(0, 38, -371); table.add(backWall);
  const bwTrim = new THREE.Mesh(new THREE.BoxGeometry(450, 4, 22), chrome); bwTrim.position.set(0, 118, -371); table.add(bwTrim);
  // glass: faint streaky reflections, edges catch the light
  const glassTex = canvasTex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 5; i++) { const x = Math.random() * w, ww = 10 + Math.random() * 40; const g = c.createLinearGradient(x, 0, x + ww, 0);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, `rgba(255,235,245,${.05 + Math.random() * .08})`); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.save(); c.translate(x, 0); c.transform(1, 0, -.35, 1, 0, 0); c.fillRect(0, 0, ww, h); c.restore(); } });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(424, 760), new THREE.MeshBasicMaterial({ map: glassTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
  glass.rotation.x = -Math.PI / 2; glass.position.y = 112; table.add(glass);
  // warm GI bulbs around the playfield
  for (const [x, y] of [[30, 470], [336, 470], [30, 300], [336, 300], [90, 110], [280, 110], [60, 610], [306, 610]]) {
    const L = new THREE.PointLight(0xffb060, .9, 150, 2); L.position.set(tx(x), 18, tz(y)); table.add(L);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(3.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); bulb.position.set(tx(x), 6, tz(y)); table.add(bulb); }
  // slingshot plastics
  for (const tri of [[[70, 500], [70, 560], [110, 590]], [[296, 500], [296, 560], [256, 590]]]) {
    const sh = new THREE.Shape(); sh.moveTo(tx(tri[0][0]), -tz(tri[0][1])); sh.lineTo(tx(tri[1][0]), -tz(tri[1][1])); sh.lineTo(tx(tri[2][0]), -tz(tri[2][1])); sh.closePath();
    const pl = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0xff5a9a, emissive: PINK, emissiveIntensity: .5, transparent: true, opacity: .75, side: THREE.DoubleSide, roughness: .2 }));
    pl.rotation.x = -Math.PI / 2; pl.position.y = 34; table.add(pl); }
  // instruction apron over the bottom of the playfield (like a real machine)
  const apTex = canvasTex(1024, 220, (c, w, h) => {
    c.fillStyle = "#14060c"; c.fillRect(0, 0, w, h);
    const card = (x, cw, bgc, fn) => { c.save(); c.translate(x, 22); c.fillStyle = bgc; c.beginPath(); c.roundRect(0, 0, cw, h - 44, 14); c.fill(); fn(cw, h - 44); c.restore(); };
    card(24, 330, "#ffd36a", (cw, ch) => { c.fillStyle = "#1b0a05"; c.font = "bold 26px sans-serif"; c.fillText("HOW TO PLAY", 18, 36); c.font = "17px sans-serif";
      ["Spell F-R-E-E: x2 multiplier", "Light M · S · ★: bonus", "Smiley bumpers: 100", "Spinner: 25 a spin"].forEach((t, i) => c.fillText("• " + t, 18, 68 + i * 26)); });
    card(374, 290, "#c81d4e", (cw, ch) => { c.fillStyle = "#ffd36a"; c.font = "italic 900 40px 'Arial Black', Impact, sans-serif"; c.textAlign = "center"; c.fillText("BETTER FREE", cw / 2, 92);
      c.font = "bold 18px monospace"; c.fillStyle = "#ffe3ec"; c.fillText("MOTEL SMILE", cw / 2, 128); c.font = "13px monospace"; c.fillText("3 BALLS PER PLAY", cw / 2, 152); });
    card(684, 316, "#ff3d7f", (cw, ch) => { c.fillStyle = "#fff"; c.font = "bold 24px sans-serif"; c.fillText("FREE THE GIRLS", 18, 36); c.font = "16px sans-serif"; c.fillStyle = "#1b0a05";
      ["Find the jars on the roof", "Hear 'Don't Mind It'", "in the Smile Lounge"].forEach((t, i) => c.fillText(t, 18, 70 + i * 26)); c.font = "bold 16px monospace"; c.fillText("motelsmile.com", 18, 152); });
  });
  const apMat = new THREE.MeshStandardMaterial({ map: apTex, roughness: .5, emissive: 0xffffff, emissiveMap: apTex, emissiveIntensity: .25 });
  const ap = new THREE.Mesh(new THREE.BoxGeometry(372, 18, 70), [blackMat, blackMat, apMat, blackMat, blackMat, blackMat]); ap.position.set(tx(183), 9, 372); table.add(ap);
  const startBtn = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 6, 24), new THREE.MeshStandardMaterial({ color: 0x46ff9e, emissive: 0x2bdc7a, emissiveIntensity: 1.2, roughness: .3 }));
  startBtn.rotation.x = Math.PI / 2; startBtn.position.set(0, 0, 413); table.add(startBtn);
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 440, 20), chrome); lock.rotation.z = Math.PI / 2; lock.position.set(0, 22, 392); table.add(lock);
  const front = new THREE.Mesh(new THREE.BoxGeometry(464, 180, 16), [blackMat, blackMat, blackMat, blackMat, sideMat, blackMat]); front.position.set(0, -110, 404); table.add(front);
  // legs (world space, under the tilted cabinet)
  for (const [lx, lz] of [[-215, 360], [215, 360], [-215, -350], [215, -350]]) {
    const top = new THREE.Vector3(lx, -60, lz).applyEuler(table.rotation);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(14, top.y + 600, 14), chrome); leg.position.set(top.x, (top.y - 600) / 2, top.z); scene.add(leg);
  }
  // backbox (stands upright at the far end)
  const far = new THREE.Vector3(0, 118, -390).applyEuler(table.rotation);
  const bb = new THREE.Group(); bb.position.set(0, far.y, far.z - 10); scene.add(bb);
  const box = new THREE.Mesh(new THREE.BoxGeometry(450, 330, 80), [sideMat, sideMat, blackMat, blackMat, blackMat, blackMat]); box.position.y = 205; bb.add(box);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(450, 40, 70), blackMat); neck.position.y = 20; bb.add(neck);
  const bgTex = backglassTex();
  const glassArt = new THREE.Mesh(new THREE.PlaneGeometry(410, 236), new THREE.MeshStandardMaterial({ map: bgTex, emissive: 0xffffff, emissiveMap: bgTex, emissiveIntensity: .5, roughness: .2 }));
  glassArt.position.set(0, 244, 40.5); bb.add(glassArt); refs.backglass = glassArt.material;
  refs.dmdC = document.createElement("canvas"); refs.dmdC.width = 640; refs.dmdC.height = 128; refs.dmdT = new THREE.CanvasTexture(refs.dmdC); refs.dmdT.colorSpace = THREE.SRGBColorSpace;
  const dmd = new THREE.Mesh(new THREE.PlaneGeometry(360, 72), new THREE.MeshBasicMaterial({ map: refs.dmdT, toneMapped: false })); dmd.position.set(0, 84, 40.6); bb.add(dmd);
  const dmdFrame = new THREE.Mesh(new THREE.PlaneGeometry(372, 84), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .4 })); dmdFrame.position.set(0, 84, 40.4); bb.add(dmdFrame);
  const bbTrim = new THREE.Mesh(new THREE.BoxGeometry(456, 6, 84), chrome); bbTrim.position.y = 373; bb.add(bbTrim);
}

function frameCamera() {
  const w = host.clientWidth, h = host.clientHeight, asp = w / h; phone = asp < .8;
  camera.aspect = asp;
  if (phone) { camera.fov = 62; refs.camPos = new THREE.Vector3(0, 440, 720); refs.camLook = new THREE.Vector3(0, -40, -40); }
  else { camera.fov = 46; refs.camPos = new THREE.Vector3(0, 440, 720); refs.camLook = new THREE.Vector3(0, -40, -15); }
  if (window.PB_CAM) { const o = window.PB_CAM; camera.fov = o.fov; refs.camPos = new THREE.Vector3(...o.pos); refs.camLook = new THREE.Vector3(...o.look); }
  const off = phone ? 0 : 0; camera.setViewOffset(w, h, 0, h * off, w, h);
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
    build(world);
    composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .4, .82); composer.addPass(bloom); composer.addPass(new OutputPass());
    resize(); api.ok = true;
  } catch (e) { console.warn("Fireball 3D unavailable, using 2D", e); api.ok = false; }
}
function resize() { if (!renderer) return; const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); composer.setSize(w, h); frameCamera(); }

function render(w) {
  const now = performance.now();
  // ball
  const b = w.ball; refs.ball.position.set(tx(b.x), w.R, tz(b.y)); refs.ball.rotation.x += (b.vy || 0) * .0006; refs.ball.rotation.z -= (b.vx || 0) * .0006;
  refs.shadow.position.set(tx(b.x) + 4, .4, tz(b.y) + 6);
  refs.ballLight.position.set(tx(b.x), w.R + 6, tz(b.y)); refs.ballLight.intensity = w.fireT > 0 ? 2 + w.fireT * 4 : 0;
  // flippers
  for (const r of refs.fl) { const th = r.f.side > 0 ? r.f.ang : Math.PI - r.f.ang; r.piv.rotation.y = -th; }
  // bumpers
  for (const r of refs.bump) { const hot = r.b.t > 0; r.capMat.emissiveMap = hot ? r.topHot : r.topCold; r.capMat.map = r.capMat.emissiveMap;
    r.capMat.emissiveIntensity = hot ? 2.2 : .7; r.sideMat.emissiveIntensity = hot ? 3 : .8; r.cap.position.y = hot ? 30 : 34; }
  for (const r of refs.walls) r.m.emissiveIntensity = r.s.t > 0 ? 5 : (r.sling ? 1.4 : 1.6);
  for (const r of refs.tgt) { const y = r.t.down ? -16 : 15; r.m.position.y += (y - r.m.position.y) * .4; }
  for (const r of refs.lanes) r.mat.emissiveIntensity = r.l.lit ? 2.6 : .15;
  refs.spin.rotation.x = w.SPIN.a;
  refs.plunger.position.z = tz(700 + w.charge * 28) + 30;
  refs.key.intensity = 1.1 + (w.fireT > 0 ? w.fireT * 3 : 0);
  refs.backglass.emissiveIntensity = .5 + (w.fireT > 0 ? .6 * Math.sin(now / 50) : 0) + (w.state === "ready" ? .15 * Math.sin(now / 300) : 0);
  // camera: tiny shake on big hits
  const sk = w.shake || 0; camera.position.set(refs.camPos.x + (Math.random() - .5) * sk * 1.5, refs.camPos.y + (Math.random() - .5) * sk, refs.camPos.z); camera.lookAt(refs.camLook);
  dmdDraw(w, now);
  composer.render();
}
let dmdKey = "";
function dmdDraw(w, now) {
  const big = w.msg || "", flash = big && Math.floor(now / 160) % 2 === 0;
  const key = w.score + "|" + w.balls + "|" + w.mult + "|" + w.state + "|" + big + "|" + (big ? flash : "");
  if (key === dmdKey) return; dmdKey = key;
  const c = refs.dmdC.getContext("2d"), W_ = 640, H_ = 128; c.fillStyle = "#120300"; c.fillRect(0, 0, W_, H_);
  c.fillStyle = "#ff8a1e"; c.textAlign = "center"; c.textBaseline = "middle";
  if (big) { c.font = "bold 56px monospace"; const fw = c.measureText(big).width; if (fw > 600) c.font = `bold ${Math.floor(56 * 600 / fw)}px monospace`; if (flash) c.fillStyle = "#ffd36a"; c.fillText(big, W_ / 2, H_ / 2); }
  else if (w.state === "ready") { c.font = "bold 44px monospace"; c.fillText("BETTER FREE", W_ / 2, 40); c.font = "28px monospace"; c.fillText("BEST " + w.best, W_ / 2, 92); }
  else { c.font = "bold 60px monospace"; c.fillText(String(w.score).replace(/\B(?=(\d{3})+(?!\d))/g, ","), W_ / 2, 52);
    c.font = "24px monospace"; c.textAlign = "left"; c.fillText("BALL " + (w.state === "over" ? "-" : Math.min(3, 4 - w.balls)) + "/3", 18, 106);
    c.textAlign = "right"; c.fillText("x" + w.mult + "  BEST " + w.best, W_ - 18, 106); }
  // dot-matrix grid
  c.fillStyle = "rgba(0,0,0,.55)"; for (let x = 0; x < W_; x += 4) c.fillRect(x, 0, 1.4, H_); for (let y = 0; y < H_; y += 4) c.fillRect(0, y, W_, 1.4);
  refs.dmdT.needsUpdate = true;
}

const api = { init, render, resize, ok: false };
window.MSPB3D = api;
