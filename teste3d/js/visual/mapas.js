// ---------- Mapas pintados (Oceano, Deserto, Espaço; Mar dos Piratas em mapa-piratas.js; Reino Encantado em mapa-reino.js) ----------
// Cada cenário vira uma "faixa" pré-desenhada (MAP_TH de altura) que se repete sem emenda.
// Camadas: fundo (faixa), meio (planetas / sombras de nuvem) e frente (nuvens / poeira).
const MAP_TH = 1200;
const MAP_OUT = 'rgba(36,22,12,.8)';
let mapCache = {}, mapRatio = 1, mapW = 0, mapLayers = null;

function mapWantRatio() { return clamp((scale || 1) * (window.devicePixelRatio || 1), 1, 1.5); }
function mapReset() { mapCache = {}; mapW = W; mapRatio = mapWantRatio(); mapLayers = null; }

// ---------- utilitários de desenho ----------
function blobPts(x, y, rx, ry, n, j) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + rnd(-j, j); pts.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]); }
  return { x, y, pts };
}
function blobPath(g, b, k, dx, dy) {
  k = k || 1; dx = dx || 0; dy = dy || 0;
  const P = b.pts.map(p => [b.x + dx + p[0] * k, b.y + dy + p[1] * k]), n = P.length;
  const M = P.map((p, i) => [(p[0] + P[(i + 1) % n][0]) / 2, (p[1] + P[(i + 1) % n][1]) / 2]);
  g.beginPath(); g.moveTo(M[n - 1][0], M[n - 1][1]);
  for (let i = 0; i < n; i++) g.quadraticCurveTo(P[i][0], P[i][1], M[i][0], M[i][1]);
  g.closePath();
}
function blobDraw(g, b, k, fill, lw, stroke, dx, dy, alpha) {
  blobPath(g, b, k, dx, dy);
  if (alpha !== undefined) g.globalAlpha = alpha;
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (lw) { g.lineWidth = lw; g.strokeStyle = stroke || MAP_OUT; g.lineJoin = 'round'; g.stroke(); }
  g.globalAlpha = 1;
}
function sparkle(g, x, y, s, c, a) {
  g.globalAlpha = a; g.fillStyle = c; g.beginPath();
  g.moveTo(x, y - s); g.quadraticCurveTo(x + s * .18, y - s * .18, x + s, y); g.quadraticCurveTo(x + s * .18, y + s * .18, x, y + s);
  g.quadraticCurveTo(x - s * .18, y + s * .18, x - s, y); g.quadraticCurveTo(x - s * .18, y - s * .18, x, y - s); g.fill(); g.globalAlpha = 1;
}
function newLayer(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * mapRatio)); c.height = Math.max(1, Math.round(h * mapRatio));
  const g = c.getContext('2d'); g.scale(mapRatio, mapRatio); g.lineCap = 'round'; g.lineJoin = 'round';
  return { c, g };
}
// sorteia posições sem amontoar (d = distância mínima entre centros)
function scatter(n, minD, ok) {
  const out = [];
  for (let t = 0; t < n * 40 && out.length < n; t++) {
    const p = { x: rnd(0, W), y: rnd(0, MAP_TH) };
    if (ok && !ok(p)) continue;
    if (out.some(q => { const dy = Math.min(Math.abs(q.y - p.y), MAP_TH - Math.abs(q.y - p.y)); return (q.x - p.x) ** 2 + dy * dy < (minD + (q.d || 0)) ** 2; })) continue;
    out.push(p);
  }
  return out;
}
// desenha um item repetindo em cima/embaixo para a faixa emendar sem corte
function wrapDraw(y, s, fn) { for (const dy of [-MAP_TH, 0, MAP_TH]) if (y + dy + s > 0 && y + dy - s < MAP_TH) fn(dy); }

// ---------- peças do Oceano ----------
function palm(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(rnd(0, 1));
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(6, 8, 24, 17, 0, 0, TAU); g.fill();
  for (let i = 0; i < 6; i++) {
    g.save(); g.rotate(i * TAU / 6);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(8, -12, 26, -8); g.quadraticCurveTo(18, -1, 0, 0); g.closePath();
    g.fillStyle = '#4C9B3A'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = MAP_OUT; g.stroke();
    g.beginPath(); g.moveTo(3, -2); g.quadraticCurveTo(12, -7, 22, -7); g.lineWidth = 1.6; g.strokeStyle = '#8DD46A'; g.stroke();
    g.restore();
  }
  g.fillStyle = '#8A5A2E'; g.lineWidth = 1.6; g.strokeStyle = MAP_OUT;
  for (const [a, b] of [[-3, 1.5], [3, -1.5]]) { g.beginPath(); g.arc(a, b, 3.4, 0, TAU); g.fill(); g.stroke(); }
  g.restore();
}
function island(g, it, dy) {
  const b = it.b, y = dy;
  blobDraw(g, b, 1.6, '#4BB9D3', 0, 0, 0, y);
  blobPath(g, b, 1.32, 0, y); g.setLineDash([16, 10]); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke(); g.setLineDash([]);
  blobDraw(g, b, 1.18, '#EFD08A', 3.5, null, 0, y);
  blobDraw(g, it.gr, 1, '#5DAE4A', 3, null, 0, y);
  blobDraw(g, it.gr, .58, '#3E8A3A', 0, 0, it.r * .2, y + it.r * .22, .85);
  blobDraw(g, it.gr, .32, '#8DD46A', 0, 0, -it.r * .3, y - it.r * .28, .9);
  for (const p of it.palms) palm(g, it.b.x + p[0], it.b.y + y + p[1], p[2]);
  if (it.light) {
    const lx = it.b.x + it.r * .55, ly = it.b.y + y - it.r * .2;
    g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.arc(lx + 3, ly + 4, 14, 0, TAU); g.fill();
    for (const [r, c, lw] of [[12, '#F4F1E6', 3], [8, '#C2362B', 2.4], [4.5, '#FFE07A', 2]]) { g.fillStyle = c; g.beginPath(); g.arc(lx, ly, r, 0, TAU); g.fill(); g.lineWidth = lw; g.strokeStyle = MAP_OUT; g.stroke(); }
  }
}
function boat(g, x, y, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(-4, 26); g.quadraticCurveTo(-18, 46, -26, 80); g.moveTo(4, 26); g.quadraticCurveTo(18, 46, 26, 80); g.stroke();
  g.beginPath(); g.moveTo(0, -26); g.bezierCurveTo(11, -16, 12, 12, 8, 28); g.lineTo(-8, 28); g.bezierCurveTo(-12, 12, -11, -16, 0, -26); g.closePath();
  g.fillStyle = '#9B6A3C'; g.fill(); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.stroke();
  g.fillStyle = '#C99A5E'; g.beginPath(); g.ellipse(0, 2, 5, 18, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-20, -2); g.quadraticCurveTo(0, -12, 20, -2); g.lineTo(17, 4); g.quadraticCurveTo(0, -4, -17, 4); g.closePath();
  g.fillStyle = '#F4F1E6'; g.fill(); g.lineWidth = 2.4; g.stroke();
  g.restore();
}
function rockSea(g, x, y, s) {
  const b = blobPts(x, y, s, s * .8, 7, .25);
  blobDraw(g, b, 1.5, 'rgba(255,255,255,.35)');
  blobDraw(g, b, 1, '#8A8F96', 3);
  blobDraw(g, b, .42, '#C9CDD2', 0, 0, -s * .25, -s * .25);
}
function paintSea(g) {
  const k = W * MAP_TH / 1e6;
  g.fillStyle = '#2680BB'; g.fillRect(0, 0, W, MAP_TH);
  for (let i = 0; i < Math.ceil(5 * k); i++) { const b = blobPts(rnd(0, W), rnd(0, MAP_TH), rnd(140, 320), rnd(60, 130), 9, .22); wrapDraw(b.y, 340, dy => blobDraw(g, b, 1, '#2273AE', 0, 0, 0, dy)); }
  g.lineWidth = 2.5;
  for (let i = 0; i < Math.ceil(70 * k); i++) {
    const x = rnd(0, W), y = rnd(0, MAP_TH), w = rnd(14, 28); g.strokeStyle = 'rgba(255,255,255,' + rnd(.2, .42).toFixed(2) + ')';
    wrapDraw(y, 20, dy => { g.beginPath(); g.moveTo(x, y + dy); g.quadraticCurveTo(x + w / 2, y + dy + w * .35, x + w, y + dy); g.stroke(); });
  }
  for (let i = 0; i < Math.ceil(22 * k); i++) { const x = rnd(0, W), y = rnd(0, MAP_TH), s = rnd(3, 5.5), a = rnd(.45, .85); wrapDraw(y, 8, dy => sparkle(g, x, y + dy, s, '#BFF2FF', a)); }
  const isl = scatter(Math.max(2, Math.round(2.2 * k)), 300);
  isl.forEach((p, i) => {
    const r = rnd(48, 92);
    const it = { r, b: blobPts(p.x, p.y, r, r * rnd(.6, .8), 10, .14), light: i === 0 && W > 700, palms: [] };
    it.gr = blobPts(p.x - r * .06, p.y - r * .05, r * .92, r * .62, 9, .2);
    for (let q = 0; q < 1 + Math.floor(r / 34); q++) it.palms.push([rnd(-r * .5, r * .4), rnd(-r * .3, r * .3), rnd(.8, 1.1)]);
    wrapDraw(p.y, r * 1.7, dy => island(g, it, dy));
  });
  for (const p of scatter(Math.ceil(5 * k), 160, p => !isl.some(q => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < 200 ** 2))) { const s = rnd(10, 22); wrapDraw(p.y, s * 2, dy => rockSea(g, p.x, p.y + dy, s)); }
  for (const p of scatter(Math.ceil(1.5 * k), 260, p => !isl.some(q => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < 240 ** 2))) { const r = rnd(-.5, .5); wrapDraw(p.y, 90, dy => boat(g, p.x, p.y + dy, r)); }
}

// ---------- peças do Deserto ----------
function roadX(y, R) { return R.x0 + R.a * Math.sin(TAU * y / MAP_TH + R.ph) + R.b * Math.sin(2 * TAU * y / MAP_TH); }
function dune(g, x, y, w, h) {
  g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w * .45, y - h, x + w * .05, y - h * .95); g.quadraticCurveTo(x + w * .55, y - h * .9, x + w, y); g.quadraticCurveTo(x, y + h * .45, x - w, y); g.closePath();
  g.fillStyle = '#F0C67C'; g.fill(); g.lineWidth = 3.2; g.strokeStyle = MAP_OUT; g.stroke();
  g.beginPath(); g.moveTo(x - w * .82, y - h * .25); g.quadraticCurveTo(x - w * .2, y - h * .55, x + w * .15, y - h * .5); g.quadraticCurveTo(x + w * .6, y - h * .45, x + w * .98, y - h * .02);
  g.quadraticCurveTo(x, y + h * .43, x - w * .97, y - h * .02); g.closePath(); g.fillStyle = 'rgba(190,128,62,.9)'; g.fill();
  g.beginPath(); g.moveTo(x - w * .82, y - h * .25); g.quadraticCurveTo(x - w * .2, y - h * .55, x + w * .15, y - h * .5); g.quadraticCurveTo(x + w * .6, y - h * .45, x + w * .98, y - h * .02);
  g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.stroke();
  g.strokeStyle = '#C48A45'; g.lineWidth = 2;
  for (let q = 0; q < 3; q++) { const yy = y - h * (.66 + q * .09); g.beginPath(); g.moveTo(x - w * .45 + q * 10, yy + 7); g.quadraticCurveTo(x - w * .1, yy - 7, x + w * .3 - q * 8, yy + 3); g.stroke(); }
  g.strokeStyle = 'rgba(255,240,194,.8)'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x - w * .5, y - h * .72); g.quadraticCurveTo(x - w * .2, y - h * .92, x + w * .05, y - h * .88); g.stroke();
}
function mesa(g, it, dy) {
  const b = it.b, r = it.r;
  blobDraw(g, b, 1.05, 'rgba(0,0,0,.18)', 0, 0, 12, dy + 22);
  blobDraw(g, b, 1, '#8E4A2B', 4, null, 0, dy + 16);
  g.strokeStyle = '#6b3420'; g.lineWidth = 2.2;
  for (const t of [-.6, -.15, .35, .75]) { const x = b.x + t * r, y = b.y + dy + r * .55 * (1 - Math.abs(t) * .5); g.beginPath(); g.moveTo(x, y + 6); g.quadraticCurveTo(x + 8, y + 14, x + 3, y + 22); g.stroke(); }
  blobDraw(g, b, 1, '#D27A45', 4, null, 0, dy);
  blobDraw(g, b, .58, '#E89A5E', 0, 0, -r * .2, dy - r * .12);
  blobDraw(g, b, .34, '#B5603A', 0, 0, r * .35, dy + r * .2, .8);
  g.strokeStyle = MAP_OUT; g.lineWidth = 2.2; g.beginPath(); g.moveTo(b.x - r * .3, b.y + dy - 4); g.lineTo(b.x - r * .3 + 16, b.y + dy + 6); g.lineTo(b.x - r * .3 + 20, b.y + dy + 20); g.stroke();
}
function cactus(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(6, 8, 16, 11, 0, 0, TAU); g.fill();
  g.fillStyle = '#5DAE4A'; g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill(); g.lineWidth = 2.6; g.strokeStyle = MAP_OUT; g.stroke();
  g.strokeStyle = '#3E8A3A'; g.lineWidth = 2.2;
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g.beginPath(); g.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); g.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); g.stroke(); }
  g.fillStyle = '#8DD46A'; g.beginPath(); g.arc(-3, -4, 4, 0, TAU); g.fill();
  g.fillStyle = '#FF6FA3'; g.beginPath(); g.arc(3, -9, 3, 0, TAU); g.fill(); g.lineWidth = 1.2; g.strokeStyle = MAP_OUT; g.stroke();
  g.restore();
}
function paintDesert(g) {
  const k = W * MAP_TH / 1e6;
  g.fillStyle = '#DBA75C'; g.fillRect(0, 0, W, MAP_TH);
  g.strokeStyle = 'rgba(190,128,62,.5)'; g.lineWidth = 2;
  for (let i = 0; i < Math.ceil(80 * k); i++) {
    const x = rnd(0, W), y = rnd(0, MAP_TH);
    wrapDraw(y, 12, dy => { g.beginPath(); g.moveTo(x, y + dy); g.quadraticCurveTo(x + 18, y + dy - 7, x + 36, y + dy); g.quadraticCurveTo(x + 54, y + dy + 7, x + 72, y + dy); g.stroke(); });
  }
  g.fillStyle = 'rgba(150,100,50,.25)';
  for (let i = 0; i < Math.ceil(260 * k); i++) { g.beginPath(); g.arc(rnd(0, W), rnd(0, MAP_TH), rnd(1, 2.2), 0, TAU); g.fill(); }
  // estrada de terra que serpenteia (emenda perfeita em cima e embaixo)
  const R = { x0: rnd(W * .25, W * .75), a: Math.min(W * .18, 220), b: Math.min(W * .06, 70), ph: rnd(0, TAU) };
  const road = (lw, col, dash, off) => {
    g.setLineDash(dash || []); g.lineWidth = lw; g.strokeStyle = col; g.beginPath();
    for (let y = -20; y <= MAP_TH + 20; y += 10) { const x = roadX(y, R) + (off || 0); y === -20 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke(); g.setLineDash([]);
  };
  road(54, MAP_OUT); road(46, '#C99A5E'); road(5, 'rgba(150,100,50,.55)', [12, 9], -10); road(5, 'rgba(150,100,50,.55)', [12, 9], 10); road(7, 'rgba(230,190,130,.5)');
  const offRoad = (p, m) => Math.abs(p.x - roadX(p.y, R)) > m;
  const mesas = scatter(Math.max(1, Math.round(1.1 * k)), 340, p => offRoad(p, 190));
  for (const p of mesas) { const r = rnd(70, 120); const it = { r, b: blobPts(p.x, p.y, r, r * rnd(.45, .6), 10, .15) }; p.d = r; wrapDraw(p.y, r + 40, dy => mesa(g, it, dy)); }
  const away = (p, d) => !mesas.some(q => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < (d + q.d) ** 2);
  for (const p of scatter(Math.ceil(5 * k), 170, p => offRoad(p, 150) && away(p, 120))) { const w = rnd(70, 140), h = rnd(30, 55); wrapDraw(p.y, h + 20, dy => dune(g, p.x, p.y + dy, w, h)); }
  if (W > 760) {
    const o = scatter(1, 0, p => offRoad(p, 200) && away(p, 160))[0];
    if (o) wrapDraw(o.y, 90, dy => {
      const b = blobPts(o.x, o.y + dy, 90, 50, 10, .12);
      blobDraw(g, b, 1, '#7BBF4A', 4); blobDraw(g, b, .72, '#3FB6C9', 3.5); blobDraw(g, b, .4, '#8AE0EC', 0, 0, -12, -6);
      sparkle(g, o.x + 14, o.y + dy + 4, 6, '#fff', .9);
      palm(g, o.x - 70, o.y + dy - 18, .9); palm(g, o.x + 74, o.y + dy + 22, 1); palm(g, o.x + 50, o.y + dy - 36, .8);
    });
  }
  const ru = scatter(1, 0, p => offRoad(p, 150) && away(p, 120))[0];
  if (ru) wrapDraw(ru.y, 70, dy => {
    g.fillStyle = '#C7B488'; g.beginPath(); g.moveTo(ru.x - 70, ru.y + dy + 34); g.lineTo(ru.x + 70, ru.y + dy + 34); g.lineTo(ru.x + 66, ru.y + dy + 48); g.lineTo(ru.x - 30, ru.y + dy + 48); g.lineTo(ru.x - 34, ru.y + dy + 42); g.lineTo(ru.x - 66, ru.y + dy + 44); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.stroke();
    for (const ox of [-46, 0, 46]) {
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.arc(ru.x + ox + 4, ru.y + dy + 5, 14, 0, TAU); g.fill();
      g.fillStyle = '#D9C79C'; g.beginPath(); g.arc(ru.x + ox, ru.y + dy + (ox ? 0 : -10), 12, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.stroke();
      g.fillStyle = '#F2E6C4'; g.beginPath(); g.arc(ru.x + ox - 3, ru.y + dy + (ox ? 0 : -10) - 3, 5, 0, TAU); g.fill();
    }
  });
  for (const p of scatter(Math.ceil(4 * k), 120, p => offRoad(p, 60) && away(p, 30))) { const s = rnd(.75, 1); wrapDraw(p.y, 24, dy => cactus(g, p.x, p.y + dy, s)); }
  for (const p of scatter(Math.ceil(7 * k), 90, p => offRoad(p, 40) && away(p, 20))) {
    const s = rnd(7, 15), b = blobPts(p.x, p.y, s, s * .8, 7, .25);
    wrapDraw(p.y, s * 2, dy => { blobDraw(g, b, 1, '#A7754A', 2.8, null, 0, dy); blobDraw(g, b, .4, '#D19A62', 0, 0, -s * .3, dy - s * .3); });
  }
}

// ---------- peças do Espaço ----------
function paintSpace(g) {
  const k = W * MAP_TH / 1e6;
  g.fillStyle = '#130C2C'; g.fillRect(0, 0, W, MAP_TH);
  // nebulosas: pintadas numa imagem 8x menor e ampliadas (fica suave e é rápido)
  const q = 8, pad = 160, sm = document.createElement('canvas'); sm.width = Math.ceil(W / q); sm.height = Math.ceil((MAP_TH + pad * 2) / q);
  const h = sm.getContext('2d'); h.scale(1 / q, 1 / q); h.translate(0, pad);
  const neb = [['#2E1A5E', .9, 1], ['#1E2F66', .8, 1], ['#5A2A8A', .55, .6], ['#1F7A8A', .45, .55], ['#C24A9A', .28, .35], ['#5CE6F0', .14, .3]];
  for (let i = 0; i < Math.ceil(3 * k); i++) for (const [c, a, sz] of neb) {
    const b = blobPts(rnd(0, W), rnd(0, MAP_TH), rnd(200, 420) * sz, rnd(90, 200) * sz, 10, .25);
    for (const dy of [-MAP_TH, 0, MAP_TH]) blobDraw(h, b, 1, c, 0, 0, 0, dy, a);
  }
  const sm2 = document.createElement('canvas'); sm2.width = sm.width; sm2.height = sm.height;
  const h2 = sm2.getContext('2d'); h2.filter = 'blur(3px)'; h2.drawImage(sm, 0, 0);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(sm2, 0, pad / q, sm.width, MAP_TH / q, 0, 0, W, MAP_TH);
  for (let i = 0; i < Math.ceil(260 * k); i++) {
    const x = rnd(0, W), y = rnd(0, MAP_TH), z = Math.random();
    g.globalAlpha = .3 + z * .55; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, .7 + z * 1.4, 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < Math.ceil(16 * k); i++) { const x = rnd(0, W), y = rnd(0, MAP_TH), s = rnd(4, 8), c = pick(['#ffffff', '#BFF2FF', '#FFE6A8'], 1)[0]; wrapDraw(y, 10, dy => sparkle(g, x, y + dy, s, c, .9)); }
}
// planetas e lua (camada do meio, desenhados uma vez como imagem)
function planetSprite(kind) {
  const R = kind === 'giant' ? 120 : kind === 'moon' ? 46 : 70, pad = kind === 'giant' ? 190 : 12;
  const L = newLayer((R + pad) * 2, (R + pad) * 2), g = L.g, c = R + pad;
  const ring = (front) => {
    g.save(); g.translate(c, c); g.rotate(-.32);
    if (front) { g.beginPath(); g.rect(-R * 3, 0, R * 6, R * 3); g.clip(); }
    for (const [lw, col] of [[18, MAP_OUT], [11, '#E8C27A'], [3, '#B58A4A']]) { g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); g.ellipse(0, 0, R * 1.6, R * .36, 0, 0, TAU); g.stroke(); }
    g.restore();
  };
  if (kind === 'giant') ring(false);
  const base = kind === 'giant' ? '#E0784A' : kind === 'moon' ? '#9AB6C8' : '#4F8FD8';
  g.save(); g.beginPath(); g.arc(c, c, R, 0, TAU); g.fillStyle = base; g.fill(); g.clip();
  if (kind === 'giant') {
    for (const [y, h, col] of [[-.6, .16, '#F2A06A'], [-.15, .12, '#B8502E'], [.25, .18, '#F2A06A'], [.62, .1, '#B8502E']]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(c - R, c + y * R); g.quadraticCurveTo(c, c + (y - .12) * R, c + R, c + y * R); g.lineTo(c + R, c + (y + h) * R); g.quadraticCurveTo(c, c + (y + h - .12) * R, c - R, c + (y + h) * R); g.fill();
    }
  } else if (kind === 'moon') {
    for (const [x, y, r] of [[-.35, -.3, .24], [.3, .25, .17], [-.1, .45, .1], [.4, -.35, .12]]) { g.fillStyle = '#7C98AA'; g.beginPath(); g.arc(c + x * R, c + y * R, r * R, 0, TAU); g.fill(); g.lineWidth = 2.5; g.strokeStyle = MAP_OUT; g.stroke(); }
  } else {
    for (let i = 0; i < 4; i++) { const b = blobPts(c + rnd(-.5, .5) * R, c + rnd(-.5, .5) * R, R * rnd(.2, .35), R * rnd(.12, .25), 8, .3); blobDraw(g, b, 1, '#5DAE4A', 2.5); }
    g.globalAlpha = .7; g.strokeStyle = '#fff'; g.lineWidth = 5;
    for (const y of [-.5, .1, .55]) { g.beginPath(); g.moveTo(c - R * .8, c + y * R); g.quadraticCurveTo(c, c + (y - .15) * R, c + R * .7, c + y * R + 6); g.stroke(); }
    g.globalAlpha = 1;
  }
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(c + R * .45, c + R * .4, R * 1.05, 0, TAU); g.fill();
  g.restore();
  g.lineWidth = 5; g.strokeStyle = MAP_OUT; g.beginPath(); g.arc(c, c, R, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 6; g.beginPath(); g.arc(c, c, R - 9, Math.PI * 1.05, Math.PI * 1.45); g.stroke();
  if (kind === 'giant') ring(true);
  return { c: L.c, w: (R + pad) * 2 };
}
function cloudSprite() {
  const circles = [...Array(6)].map(() => [rnd(-60, 60), rnd(-18, 18), rnd(26, 42)]).concat([[0, 0, 46]]);
  const L = newLayer(260, 160), g = L.g, ox = 130, oy = 80;
  const all = (dx, dy, k, col) => { g.fillStyle = col; for (const [x, y, r] of circles) { g.beginPath(); g.arc(ox + x + dx, oy + y + dy, r * k, 0, TAU); g.fill(); } };
  g.lineWidth = 9; g.strokeStyle = '#6f93b5'; for (const [x, y, r] of circles) { g.beginPath(); g.arc(ox + x, oy + y, r, 0, TAU); g.stroke(); }
  all(0, 0, 1, '#ffffff'); all(6, 10, .62, '#d7e6f3'); all(-4, -4, .62, '#ffffff');
  const S2 = newLayer(260, 160); S2.g.fillStyle = '#0b3f66'; for (const [x, y, r] of circles) { S2.g.beginPath(); S2.g.arc(ox + x, oy + y, r, 0, TAU); S2.g.fill(); }
  return { c: L.c, sh: S2.c };
}
function dustSprite() {
  const L = newLayer(320, 140), g = L.g;
  g.filter = 'blur(12px)';
  for (let i = 0; i < 5; i++) { const b = blobPts(160 + rnd(-70, 70), 70 + rnd(-20, 20), rnd(50, 90), rnd(20, 35), 8, .25); blobDraw(g, b, 1, '#F7D9A0'); }
  return L.c;
}
function genMapLayers() {
  const k = W / 1000;
  const span = H + 700;
  mapLayers = {
    clouds: [...Array(Math.max(3, Math.ceil(4 * k)))].map(() => ({ x: rnd(-40, W + 40), y: rnd(0, span), s: rnd(.75, 1.2), spr: cloudSprite() })),
    dust: [...Array(Math.max(2, Math.ceil(3 * k)))].map(() => ({ x: rnd(0, W), y: rnd(0, span), spr: dustSprite() })),
    planets: [],
    near: [...Array(Math.ceil(50 * k))].map(() => ({ x: rnd(0, W), y: rnd(0, H), z: rnd(.6, 1) })),
  };
  const kinds = ['giant', 'moon', 'blue'];
  const pspan = H * 3.2;
  kinds.forEach((kd, i) => {
    const sp = planetSprite(kd);
    mapLayers.planets.push({ x: i === 0 ? rnd(0, W * .25) : rnd(W * .15, W * .9), y: pspan * (i / kinds.length) + rnd(0, 200), spr: sp });
  });
  mapLayers.pspan = pspan; mapLayers.span = span;
}
function mapTile(sc) {
  if (!mapCache[sc]) {
    const L = newLayer(W, MAP_TH);
    if (sc === 'desert') paintDesert(L.g); else if (sc === 'space') paintSpace(L.g); else if (sc === 'piratas') paintPiratas(L.g); else if (sc === 'reino') paintReino(L.g); else paintSea(L.g);
    mapCache[sc] = L.c;
  }
  return mapCache[sc];
}
// camada de fundo (+ meio)
function drawMap(sc) {
  if (mapW !== W || Math.abs(mapWantRatio() - mapRatio) > .2) mapReset();
  if (!mapLayers) genMapLayers();
  const t = mapTile(sc), spd = sc === 'space' ? .35 : 1;
  const off = (bgScroll * spd) % MAP_TH;
  cx.drawImage(t, 0, off - MAP_TH, W, MAP_TH);
  cx.drawImage(t, 0, off, W, MAP_TH);
  if (sc === 'sea') {
    cx.globalAlpha = .16;
    for (const c of mapLayers.clouds) { const y = (c.y + bgScroll * 2.2) % mapLayers.span - 300; cx.drawImage(c.spr.sh, c.x - 130 * c.s + 70, y - 80 * c.s + 90, 260 * c.s, 160 * c.s); }
    cx.globalAlpha = 1;
  } else if (sc === 'space') {
    for (const p of mapLayers.planets) {
      const w = p.spr.w, y = (p.y + bgScroll * .7) % mapLayers.pspan - w;
      if (y > -w && y < H + w) cx.drawImage(p.spr.c, p.x - w / 2, y - w / 2, w, w);
    }
    cx.fillStyle = '#fff';
    for (const s of mapLayers.near) {
      const y = (s.y + bgScroll * (1.4 + s.z)) % H;
      cx.globalAlpha = .5 + s.z * .4; cx.fillRect(s.x, y, 1.6, 3 + s.z * 3);
    }
    cx.globalAlpha = 1;
  }
}
// camada da frente (por cima do combate, bem transparente)
function drawMapFront(sc) {
  if (!mapLayers) return;
  if (sc === 'sea') {
    cx.globalAlpha = .5;
    for (const c of mapLayers.clouds) { const y = (c.y + bgScroll * 2.2) % mapLayers.span - 300; cx.drawImage(c.spr.c, c.x - 130 * c.s, y - 80 * c.s, 260 * c.s, 160 * c.s); }
    cx.globalAlpha = 1;
  } else if (sc === 'desert') {
    cx.globalAlpha = .28;
    for (const d of mapLayers.dust) { const y = (d.y + bgScroll * 1.7) % mapLayers.span - 300; cx.drawImage(d.spr, d.x - 160, y - 70, 320, 140); }
    cx.globalAlpha = 1;
  } else if (sc === 'piratas') drawNeblina(); // js/visual/mapa-piratas.js
  else if (sc === 'reino') drawPoMagico(); // js/visual/mapa-reino.js
}

// ---------- Fundo ----------
let bgScroll = 0;
function genBg() { mapReset(); }
