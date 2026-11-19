// ---------- Skins: desenho das naves, rastros, tiros e bumerangues ----------
// Os desenhos ficam em arte/naves, arte/tiros e arte/bumerangues (carregados por visual/arte.js).
const SHIP_ART_KEY = ['falcon', 'boomer', 'arty'];
function skinArt(shipIdx, skinId) { return (ARTE.naves[SHIP_ART_KEY[shipIdx]] || {})[skinId] || null; }
// ---------- Imagens prontas (o SVG vira imagem uma vez só) ----------
const SKIN_U = .3;          // pixels por unidade do desenho (escala 1 do jogo)
const SKIN_RES = 4;         // resolução extra para telas grandes e para o hangar
const skinImg = {};
function buildSkinImages() {
  for (let s = 0; s < SHIPS.length; s++) for (const sk of SKINS) {
    if (sk.id === 'classic') continue;
    const key = s + ':' + sk.id, a = skinArt(s, sk.id);
    if (!a) continue;
    const [vx, vy, vw, vh] = a.vb;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw * SKIN_U * SKIN_RES}" height="${vh * SKIN_U * SKIN_RES}">${a.g}</svg>`;
    const rec = skinImg[key] = { ready: false, a };
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = Math.round(vw * SKIN_U * SKIN_RES); c.height = Math.round(vh * SKIN_U * SKIN_RES);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      rec.cv = c; rec.ready = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
function drawSkinShip(shipIdx, skinId, x, y, s, tilt) {
  const rec = skinImg[(shipIdx || 0) + ':' + skinId];
  if (!rec || !rec.ready) return false;
  const [vx, vy, vw, vh] = rec.a.vb, [px, py] = rec.a.pv, u = SKIN_U * s;
  cx.save(); cx.translate(x, y); cx.scale(1 - Math.abs(tilt || 0) * .12, 1);
  cx.drawImage(rec.cv, (vx - px) * u, (vy - py) * u, vw * u, vh * u);
  cx.restore();
  return true;
}
// marca colorida embaixo do avião para saber quem é J1 e J2
function drawPlayerMark(p) {
  const c = PCOL[p.i];
  cx.save(); cx.globalAlpha = .75;
  cx.fillStyle = c.dark; cx.beginPath(); cx.ellipse(p.x, p.y + 30, 20, 6, 0, 0, TAU); cx.fill();
  cx.strokeStyle = c.body; cx.lineWidth = 3; cx.stroke();
  cx.restore();
}

// ---------- Rastro de cada skin ----------
const SHIP_EXHAUST = [[[0, 26]], [[0, 22]], [[-10, 28], [10, 28]]];
function skinTrail(p, dt) {
  if (!p.alive || !p.skin || p.skin === 'classic') return;
  const sk = skinById(p.skin); if (!sk.trail) return;
  p.trT = (p.trT || 0) - dt; if (p.trT > 0) return;
  p.trT = sk.trail === 'puff' || sk.trail === 'smoke' ? .07 : .045;
  for (const [ox, oy] of SHIP_EXHAUST[p.ship || 0]) {
    S.fx.push({ type: 'trail', k: sk.trail, x: p.x + ox + rnd(-3, 3), y: p.y + oy, vx: rnd(-18, 18), vy: rnd(60, 110),
      t: 0, life: rnd(.35, .6), r: rnd(2.5, 4.5), color: sk.tcol, rot: rnd(0, 6) });
  }
}
function drawTrail(f, k) {
  const r = f.r;
  switch (f.k) {
    case 'puff': case 'smoke':
      cx.fillStyle = f.color; cx.globalAlpha *= .55; cx.beginPath(); cx.arc(f.x, f.y, r * (1 + k * 2.4), 0, TAU); cx.fill(); break;
    case 'mist':
      cx.fillStyle = f.color; cx.globalAlpha *= .35; cx.beginPath(); cx.arc(f.x, f.y, r * (1.2 + k * 2.6), 0, TAU); cx.fill(); break;
    case 'leaf':
      cx.save(); cx.translate(f.x, f.y); cx.rotate(f.rot + k * 4);
      cx.fillStyle = f.rot > 5 ? '#F4F06A' : f.color; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2;
      cx.beginPath(); cx.ellipse(0, 0, r * 1.1, r * .55, 0, 0, TAU); cx.fill(); cx.stroke(); cx.restore(); break;
    case 'snow':
      cx.strokeStyle = f.color; cx.lineWidth = 1.6; cx.beginPath();
      for (let a = 0; a < 3; a++) { const an = f.rot + a * Math.PI / 3, s = r * 1.1; cx.moveTo(f.x - Math.cos(an) * s, f.y - Math.sin(an) * s); cx.lineTo(f.x + Math.cos(an) * s, f.y + Math.sin(an) * s); }
      cx.stroke(); break;
    case 'spark':
      cx.fillStyle = k < .5 ? '#FFF2A8' : f.color; cx.beginPath(); const s = r * (1.2 - k * .6);
      cx.moveTo(f.x, f.y - s * 1.6); cx.lineTo(f.x + s * .6, f.y); cx.lineTo(f.x, f.y + s * 1.6); cx.lineTo(f.x - s * .6, f.y); cx.fill(); break;
    case 'flame': case 'ember':
      cx.fillStyle = f.k === 'ember' ? (k < .35 ? '#FFF3A0' : k < .7 ? '#FFB52E' : '#d2381f') : (k < .4 ? '#d8ff9a' : f.color);
      cx.beginPath(); cx.arc(f.x, f.y, r * (1.3 - k), 0, TAU); cx.fill(); break;
  }
}
function drawSkinToast() {
  if (!S.skinMsg) return;
  const a = clamp(S.skinMsg.t, 0, 1), w = Math.min(W - 40, 460), x = (W - w) / 2, y = 96;
  cx.globalAlpha = a;
  cx.fillStyle = 'rgba(28,24,34,.92)'; roundRect(x, y, w, 52, 14); cx.fill();
  cx.strokeStyle = '#F2C230'; cx.lineWidth = 2.5; roundRect(x, y, w, 52, 14); cx.stroke();
  txt('Nova skin no hangar!', W / 2, y + 21, 15, '#F2C230', 'center', 800);
  txt(S.skinMsg.name, W / 2, y + 41, 15, '#fff', 'center', 700);
  cx.globalAlpha = 1;
}

const SHOT_U = .3, shotImg = {};
function buildShotImages() {
  for (const id in SHOT_ART) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -48 48 96" width="${48 * SHOT_U * SKIN_RES}" height="${96 * SHOT_U * SKIN_RES}">${SHOT_ART[id]}</svg>`;
    const rec = shotImg[id] = { ready: false }, img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = Math.round(48 * SHOT_U * SKIN_RES); c.height = Math.round(96 * SHOT_U * SKIN_RES);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); rec.cv = c; rec.ready = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
// ang: direção do tiro (0 = para cima); spin: gira o desenho (disco do bumerangue)
function drawSkinShot(id, x, y, ang, s, spin) {
  const rec = shotImg[id]; if (!rec || !rec.ready) return false;
  const u = SHOT_U * (s || 1);
  cx.save(); cx.translate(x, y); cx.rotate(spin !== undefined ? spin : ang);
  cx.drawImage(rec.cv, -24 * u, -48 * u, 48 * u, 96 * u);
  cx.restore();
  return true;
}
// skin que vale para este tiro (só a arma da própria nave) ou null
function shotSkin(p, w) { return p.skin && p.skin !== 'classic' && w.type === SHIPS[p.ship].weapon && SHOT_ART[p.skin] ? p.skin : null; }

// ---------- Bumerangue de cada skin (só visual; gira em volta do centro 0,0) ----------
const BOOM_U = .45, boomImg = {};
function buildBoomImages() {
  for (const id in BOOM_ART) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-42 -42 84 84" width="${84 * BOOM_U * SKIN_RES}" height="${84 * BOOM_U * SKIN_RES}">${BOOM_ART[id]}</svg>`;
    const rec = boomImg[id] = { ready: false }, img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = Math.round(84 * BOOM_U * SKIN_RES);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); rec.cv = c; rec.ready = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
function drawSkinBoomerang(id, x, y, rot, explo) {
  const rec = boomImg[id]; if (!rec || !rec.ready) return false;
  const u = BOOM_U * 1.35, sk = skinById(id);
  cx.save(); cx.translate(x, y);
  cx.globalAlpha = .22; cx.fillStyle = explo ? '#ffb347' : sk.shot; cx.beginPath(); cx.arc(0, 0, 16, 0, TAU); cx.fill(); cx.globalAlpha = 1;
  cx.rotate(rot); cx.drawImage(rec.cv, -42 * u, -42 * u, 84 * u, 84 * u);
  cx.restore();
  return true;
}
// rastro do bumerangue enquanto voa (mesmo tipo de rastro da nave)
function skinBoomTrail(b, dt) {
  if (b.type !== 'boomerang' || !b.sk) return;
  b.trT = (b.trT || 0) - dt; if (b.trT > 0) return;
  const sk = skinById(b.sk); if (!sk.trail) return;
  b.trT = sk.trail === 'puff' || sk.trail === 'smoke' ? .06 : .035;
  S.fx.push({ type: 'trail', k: sk.trail, x: b.x + rnd(-5, 5), y: b.y + rnd(-5, 5), vx: rnd(-20, 20), vy: rnd(-20, 20),
    t: 0, life: rnd(.3, .5), r: rnd(2.5, 4.2), color: sk.tcol, rot: rnd(0, 6) });
}
