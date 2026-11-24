// ---------- Hypnos: desenho (nave mariposa com olho hipnótico, espirais, grito, ímã, aliados e clones) ----------
// Tudo desenhado no canvas. Cada skin muda as cores (paleta das skins em js/dados/skins.js + brilho em HYPNOS_BRILHO).
const HYPNOS_TITULO = ['#8a4fd8', '#3a1a6c']; // tela inicial: roxo
// brilho hipnótico de cada skin: [espiral/aura, miolo claro]
const HYPNOS_BRILHO = {
  classic: ['#c77dff', '#f3e3ff'], sucata: ['#ffb347', '#fff0c8'], bosque: ['#9be36a', '#f0ffd8'], garra: ['#ff6a4a', '#ffd8c8'],
  geada: ['#7fdcff', '#f0fbff'], lamina: ['#ffd23a', '#fff8d0'], vazio: ['#8CF04A', '#e6ffc8'], espectro: ['#7CF5C8', '#e6fff8'], dragao: ['#ff7a2a', '#ffe08a'],
};
function hypnosBrilho(skin) { return HYPNOS_BRILHO[skin] || HYPNOS_BRILHO.classic; }
function hypnosCor(skin, c1, c2) {
  const b = hypnosBrilho(skin);
  if (!skin || skin === 'classic') return { corpo: c1, asa: c1, escuro: c2, enfeite: '#f3e3ff', brilho: b[0], miolo: b[1], contorno: false };
  const P = skinById(skin).pal;
  return { corpo: P.body, asa: P.wing, escuro: P.dark, enfeite: P.trim, brilho: b[0], miolo: b[1], contorno: true };
}
// espiral (o símbolo da hipnose); R = raio, rot = giro
function espiral(x, y, R, rot, cor, lw, voltas) {
  voltas = voltas || 2.5;
  cx.save(); cx.translate(x, y); cx.rotate(rot);
  cx.strokeStyle = cor; cx.lineWidth = lw; cx.lineCap = 'round';
  cx.beginPath();
  const n = Math.ceil(voltas * 18);
  for (let k = 0; k <= n; k++) { const u = k / n, a = u * voltas * TAU, r = R * u; k ? cx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : cx.moveTo(0, 0); }
  cx.stroke(); cx.restore();
}

// ---------- Nave ----------
function drawHypnosShip(x, y, s, c1, c2, tilt, flash, skin) {
  const C = hypnosCor(skin, c1, c2), t = performance.now() / 1000, F = v => flash ? '#fff' : v;
  const O = C.contorno ? SKIN_OUT : null, st = lw => { if (O) { cx.strokeStyle = O; cx.lineWidth = lw; cx.lineJoin = 'round'; cx.stroke(); } };
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  // aura hipnótica
  if (!flash) { cx.globalAlpha = .18 + .07 * Math.sin(t * 4); cx.fillStyle = C.brilho; cx.beginPath(); cx.arc(0, 0, 32, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
  // duas caudas ondulando (fitas)
  for (const sd of [-1, 1]) {
    cx.strokeStyle = F(C.escuro); cx.lineWidth = 3; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(sd * 4, 12);
    cx.bezierCurveTo(sd * 6, 22, sd * (10 + 4 * Math.sin(t * 5 + sd)), 26, sd * (7 + 5 * Math.sin(t * 5 + sd + 1)), 34); cx.stroke();
    if (!flash) { cx.fillStyle = C.brilho; cx.beginPath(); cx.arc(sd * (7 + 5 * Math.sin(t * 5 + sd + 1)), 34, 2.4, 0, TAU); cx.fill(); }
  }
  // asas de mariposa (abrem e fecham devagar)
  const ab = .9 + .1 * Math.sin(t * 3);
  for (const sd of [-1, 1]) {
    const X = v => sd * v * ab;
    // asa de trás (menor)
    cx.fillStyle = F(C.escuro);
    cx.beginPath(); cx.moveTo(sd * 5, 4); cx.bezierCurveTo(X(16), 4, X(30), 10, X(26), 20); cx.bezierCurveTo(X(18), 24, X(10), 18, sd * 5, 12); cx.closePath(); cx.fill(); st(1.8);
    // asa da frente (grande)
    cx.fillStyle = F(C.asa);
    cx.beginPath(); cx.moveTo(sd * 5, -8); cx.bezierCurveTo(X(14), -24, X(34), -24, X(37), -10); cx.bezierCurveTo(X(38), 0, X(28), 8, X(16), 7); cx.bezierCurveTo(X(10), 7, sd * 6, 4, sd * 5, 2); cx.closePath(); cx.fill(); st(2);
    // faixa escura e "olho" da asa
    cx.fillStyle = F(C.escuro);
    cx.beginPath(); cx.moveTo(sd * 7, -6); cx.bezierCurveTo(X(16), -16, X(28), -16, X(33), -9); cx.bezierCurveTo(X(26), -12, X(16), -10, sd * 7, -1); cx.closePath(); cx.fill();
    if (!flash) {
      cx.fillStyle = C.miolo; cx.beginPath(); cx.arc(X(24), -4, 5.5, 0, TAU); cx.fill();
      espiral(X(24), -4, 4.6, t * 3 * sd, C.brilho, 1.4, 2);
    }
  }
  // corpo
  cx.fillStyle = F(C.corpo); cx.beginPath(); cx.ellipse(0, 1, 7.5, 17, 0, 0, TAU); cx.fill(); st(2);
  cx.fillStyle = F(C.escuro); for (const yy of [8, 12.5]) { cx.beginPath(); cx.ellipse(0, yy, 6, 1.4, 0, 0, TAU); cx.fill(); }
  // antenas com bolinhas brilhando
  for (const sd of [-1, 1]) {
    cx.strokeStyle = F(C.escuro); cx.lineWidth = 1.8;
    cx.beginPath(); cx.moveTo(sd * 2.5, -14); cx.quadraticCurveTo(sd * 5, -24, sd * 10, -27); cx.stroke();
    cx.fillStyle = F(C.brilho); cx.beginPath(); cx.arc(sd * 10, -27, 2.6 + .5 * Math.sin(t * 6 + sd), 0, TAU); cx.fill();
  }
  // grande olho hipnótico girando
  cx.fillStyle = F(C.miolo); cx.beginPath(); cx.arc(0, -6, 6.5, 0, TAU); cx.fill(); st(1.6);
  if (!flash) espiral(0, -6, 5.6, -t * 4, C.brilho, 1.7, 2.6);
  cx.restore();
}

// ---------- Balas ----------
function drawHypnosBala(b) {
  if (b.type === 'hypno') {
    const k = b.life / b.vida, sp = Math.hypot(b.vx, b.vy) || 1, cor = b.explo ? '#ffb347' : b.color;
    cx.globalAlpha = .25 * k; cx.fillStyle = cor;
    for (let i = 1; i <= 2; i++) { cx.beginPath(); cx.arc(b.x - b.vx / sp * i * 9, b.y - b.vy / sp * i * 9, b.r * (1 - i * .25), 0, TAU); cx.fill(); }
    cx.globalAlpha = Math.min(1, .3 + k);
    cx.fillStyle = cor; cx.beginPath(); cx.arc(b.x, b.y, b.r + 2, 0, TAU); cx.fill();
    cx.fillStyle = '#f3e3ff'; cx.beginPath(); cx.arc(b.x, b.y, b.r - 1, 0, TAU); cx.fill();
    espiral(b.x, b.y, b.r - 1.5, (b.rot || 0) + (1 - k) * 14, cor, 1.6, 2);
    cx.globalAlpha = 1;
    return true;
  }
  if (b.type === 'grito') {
    const a = Math.max(0, 1 - b.R / (Math.hypot(W, H) * .9));
    for (const [dr, lw, al] of [[0, 5, .55], [-26, 3, .35], [-50, 2, .2]]) {
      const R = b.R + dr; if (R <= 0) continue;
      cx.strokeStyle = 'rgba(224,168,255,' + al * a + ')'; cx.lineWidth = lw;
      cx.beginPath();
      for (let k = 0; k <= 64; k++) { const an = k / 64 * TAU, rr = R + Math.sin(an * 10 + R * .05) * 4; k ? cx.lineTo(b.x + Math.cos(an) * rr, b.y + Math.sin(an) * rr) : cx.moveTo(b.x + rr, b.y); }
      cx.stroke();
    }
    return true;
  }
  if (b.type === 'ima') return true; // desenhado embaixo das naves (drawHipnose)
  if (b.type === 'hip_aliado') {
    cx.fillStyle = b.color; cx.globalAlpha = .35; cx.beginPath(); cx.arc(b.x, b.y, b.r + 3, 0, TAU); cx.fill();
    cx.globalAlpha = 1; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(b.x, b.y, b.r * .7, 0, TAU); cx.fill();
    return true;
  }
  return false;
}

// ---------- Ímãs, marcas, inimigos tontos e aliados (camada dos inimigos) ----------
function drawHipnose() {
  const t = performance.now() / 1000;
  for (const b of S.bullets) if (b.type === 'ima') {
    const a = Math.min(1, b.life / .4, (b.vida - b.life) / .2 + .2);
    cx.globalAlpha = .16 * a; cx.fillStyle = '#b06cff'; cx.beginPath(); cx.arc(b.x, b.y, b.R, 0, TAU); cx.fill();
    cx.globalAlpha = .6 * a;
    espiral(b.x, b.y, b.R * .95, -b.rot, '#c77dff', 3, 3);
    espiral(b.x, b.y, b.R * .6, -b.rot * 1.4 + 1, '#f3e3ff', 2, 2.5);
    cx.globalAlpha = 1;
  }
  for (const e of S.enemies) {
    if (e.dead) continue;
    // marcas de hipnose: bolinhas roxas em cima do inimigo
    if (e.hipN > 0) for (let k = 0; k < e.hipN; k++) {
      const x = e.x + (k - (HYPNOS.hipnose.marcas - 1) / 2) * 9, y = e.y - e.r - 16;
      cx.fillStyle = '#2a1240'; cx.beginPath(); cx.arc(x, y, 4, 0, TAU); cx.fill();
      cx.fillStyle = '#c77dff'; cx.beginPath(); cx.arc(x, y, 2.8, 0, TAU); cx.fill();
    }
  }
  // tontos (inimigos e chefões): estrelinhas girando
  for (const e of targets()) if (!e.dead && e.stunT > 0) {
    for (let k = 0; k < 3; k++) {
      const a = t * 5 + k / 3 * TAU, x = e.x + Math.cos(a) * e.r * .9, y = e.y - e.r - 6 + Math.sin(a) * 5;
      cx.fillStyle = k % 2 ? '#fff3a0' : '#e0a8ff';
      cx.beginPath(); for (let j = 0; j < 10; j++) { const aa = j / 10 * TAU - Math.PI / 2, rr = j % 2 ? 1.6 : 4; cx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } cx.fill();
    }
  }
  // aliados: o desenho do inimigo virado para cima, com aura roxa e espiral nos olhos
  for (const a of S.aliados || []) {
    if (a.morto) continue;
    const pisca = a.vida < 1.5 && Math.floor(a.vida * 8) % 2;
    const cor = a.rei ? '#ffd36b' : '#c77dff';
    const g = cx.createRadialGradient(a.x, a.y, a.r * .3, a.x, a.y, a.r * 1.9);
    g.addColorStop(0, a.rei ? 'rgba(255,211,107,.45)' : 'rgba(199,125,255,.45)'); g.addColorStop(1, 'rgba(199,125,255,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(a.x, a.y, a.r * 1.9, 0, TAU); cx.fill();
    cx.save(); cx.translate(a.x, a.y); cx.rotate(Math.PI);
    if (pisca) cx.globalAlpha = .55;
    drawEnemy({ type: a.type, x: 0, y: 0, x0: 0, r: a.r, t: a.t, flash: a.flash, hp: 1, maxHp: 1, aim: Math.PI / 2, vx: 0, vy: 1, alpha: 1, sub: 0, stopY: 0, stay: 0 });
    cx.restore();
    // tempo que falta (arco) e espiral em cima
    cx.strokeStyle = cor; cx.lineWidth = 2.5; cx.globalAlpha = .8;
    cx.beginPath(); cx.arc(a.x, a.y, a.r + 7, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, a.vida / a.max)); cx.stroke();
    cx.globalAlpha = 1;
    espiral(a.x, a.y - a.r - 12, 6, a.giro, cor, 2, 2.2);
    if (a.rei) { // coroa do lacaio real
      const y = a.y - a.r - 24;
      cx.fillStyle = '#ffd36b'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.4;
      cx.beginPath(); cx.moveTo(a.x - 9, y + 5); cx.lineTo(a.x - 9, y - 3); cx.lineTo(a.x - 4.5, y + 1); cx.lineTo(a.x, y - 5); cx.lineTo(a.x + 4.5, y + 1); cx.lineTo(a.x + 9, y - 3); cx.lineTo(a.x + 9, y + 5); cx.closePath(); cx.fill(); cx.stroke();
    }
  }
}

// ---------- Clones (cópias transparentes da nave) ----------
function drawClones(p) {
  if (!(p.cloneT > 0)) return;
  const w = p.weapons.find(q => q.type === 'clone'); if (!w) return;
  const c = PCOL[p.i], fim = p.cloneT < 1 ? p.cloneT : 1, ini = Math.min(1, (p.cloneMax - p.cloneT) / .25);
  for (let k = 0; k < w.shots; k++) {
    const q = clonePos(p, k);
    cx.globalAlpha = .5 * Math.min(fim, ini) * (p.cloneT < 1 && Math.floor(p.cloneT * 10) % 2 ? .5 : 1);
    cx.fillStyle = hypnosBrilho(p.skin)[0]; cx.beginPath(); cx.arc(q.x, q.y, 30, 0, TAU); cx.fill();
    drawShip(p.ship, q.x, q.y, .9, c.body, c.dark, p.tilt, false, p.skin);
    cx.globalAlpha = 1;
  }
}

// ---------- Prévia no hangar ----------
function drawHypnosPreview(x, y) {
  const ph = (titleT * 1.4) % 1;
  for (let k = 0; k < 2; k++) {
    const ang = (k - .5) * .32, d = 10 + ph * 50;
    drawHypnosBala({ type: 'hypno', x: x + Math.sin(ang) * d, y: y - d, vx: Math.sin(ang), vy: -Math.cos(ang), r: 7, life: 1 - ph * .7, vida: 1, color: '#c77dff', rot: titleT * 6 });
  }
}
