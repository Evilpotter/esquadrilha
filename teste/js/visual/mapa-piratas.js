// ---------- Mapa do Mar dos Piratas ----------
// Mesmo jeito dos outros mapas (js/visual/mapas.js): uma faixa pintada de MAP_TH que se repete.
// Peças: mar verde-azulado, Ilha da Caveira, ilhas do tesouro (baú + X), navios naufragados,
// barris e tábuas boiando, recifes. Na frente: neblina passando devagar.

function barrilBoia(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(0, 0, 19, 14, 0, 0, TAU); g.stroke();
  g.fillStyle = '#9B6A3C'; g.beginPath(); g.ellipse(0, 0, 13, 9, 0, 0, TAU); g.fill(); g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.stroke();
  g.strokeStyle = '#4a3a2a'; g.lineWidth = 2;
  for (const xx of [-7, 7]) { g.beginPath(); g.moveTo(xx, -8.5); g.lineTo(xx, 8.5); g.stroke(); }
  g.fillStyle = '#C99A5E'; g.beginPath(); g.ellipse(-3, -3, 4, 2.4, 0, 0, TAU); g.fill();
  g.restore();
}
function tabua(g, x, y, rot, w) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-w / 2 - 4, -8, w + 8, 16);
  g.fillStyle = '#A9784A'; g.fillRect(-w / 2, -5, w, 10); g.lineWidth = 2.2; g.strokeStyle = MAP_OUT; g.strokeRect(-w / 2, -5, w, 10);
  g.strokeStyle = '#7a5230'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-w / 2 + 6, 0); g.lineTo(w / 2 - 10, -1); g.stroke();
  g.fillStyle = '#3a3a3a'; g.beginPath(); g.arc(-w / 2 + 4, 0, 1.4, 0, TAU); g.arc(w / 2 - 4, 0, 1.4, 0, TAU); g.fill();
  g.restore();
}
function bau(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-12, -6, 30, 22);
  g.fillStyle = '#8A5A2E'; g.fillRect(-15, -10, 30, 20); g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.strokeRect(-15, -10, 30, 20);
  g.fillStyle = '#B07A42'; g.fillRect(-15, -10, 30, 7); g.strokeRect(-15, -10, 30, 7);
  g.fillStyle = '#E8B83A'; for (const xx of [-11, 8]) { g.fillRect(xx, -10, 3, 20); }
  g.fillRect(-3, -5, 6, 6); g.lineWidth = 1.4; g.strokeRect(-3, -5, 6, 6);
  // moedas transbordando
  for (const [mx, my] of [[-8, -12], [-2, -13], [5, -12], [11, -11], [2, -15]]) { g.fillStyle = '#FFD84A'; g.beginPath(); g.arc(mx, my, 2.6, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke(); }
  g.restore();
}
function marcaX(g, x, y, s) {
  g.save(); g.translate(x, y); g.lineCap = 'round';
  for (const [lw, c] of [[s * .5, MAP_OUT], [s * .3, '#C2362B']]) { g.lineWidth = lw; g.strokeStyle = c; g.beginPath(); g.moveTo(-s, -s); g.lineTo(s, s); g.moveTo(s, -s); g.lineTo(-s, s); g.stroke(); }
  g.restore();
}
function ilhaTesouro(g, it, dy) {
  const b = it.b, y = dy;
  blobDraw(g, b, 1.55, '#3FA6A6', 0, 0, 0, y);
  blobPath(g, b, 1.3, 0, y); g.setLineDash([14, 10]); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.6)'; g.stroke(); g.setLineDash([]);
  blobDraw(g, b, 1.15, '#E9C987', 3.5, null, 0, y);
  blobDraw(g, b, .5, '#F6DFA8', 0, 0, -it.r * .25, y - it.r * .2, .9);
  // pegadas até o X
  g.fillStyle = 'rgba(140,100,50,.55)';
  for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(b.x - it.r * .55 + k * it.r * .17, b.y + y + it.r * .25 - (k % 2) * 6, 2.6, 1.8, .3, 0, TAU); g.fill(); }
  marcaX(g, b.x + it.r * .35, b.y + y + it.r * .1, 9);
  bau(g, b.x - it.r * .1, b.y + y - it.r * .25, .9);
  for (const p of it.palms) palm(g, b.x + p[0], b.y + y + p[1], p[2]);
}
function ilhaCaveira(g, x, y, r) {
  // base de pedra com espuma
  const b = blobPts(x, y, r, r * .85, 10, .12);
  blobDraw(g, b, 1.45, 'rgba(255,255,255,.3)');
  blobDraw(g, b, 1.2, '#3FA6A6');
  blobDraw(g, b, 1, '#7E848C', 4);
  blobDraw(g, b, .8, '#9AA0A8', 0, 0, -r * .05, -r * .08);
  // crânio (topo da rocha)
  g.save(); g.translate(x, y - r * .08);
  g.fillStyle = '#D9D6CC'; g.beginPath(); g.ellipse(0, -r * .1, r * .55, r * .48, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.stroke();
  g.beginPath(); g.rect(-r * .3, r * .22, r * .6, r * .24); g.fill(); g.stroke();
  g.fillStyle = '#24160c';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .21, -r * .1, r * .14, r * .17, s * .3, 0, TAU); g.fill(); }
  g.beginPath(); g.moveTo(0, r * .08); g.lineTo(-r * .06, r * .18); g.lineTo(r * .06, r * .18); g.closePath(); g.fill();
  g.lineWidth = 2; g.strokeStyle = MAP_OUT;
  for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(k * r * .12, r * .24); g.lineTo(k * r * .12, r * .44); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-r * .25, -r * .38, r * .14, r * .06, -.5, 0, TAU); g.fill();
  g.restore();
  // brilho verde nos olhos
  for (const s of [-1, 1]) sparkle(g, x + s * r * .21, y - r * .18, 4, '#8CFFB0', .9);
}
function naufragio(g, x, y, rot, s) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  // casco meio afundado (sombra da parte submersa)
  g.fillStyle = 'rgba(10,40,45,.45)'; g.beginPath(); g.ellipse(0, 10, 26, 62, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -8, 24, 46, 0, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(0, -56); g.bezierCurveTo(22, -40, 22, 10, 16, 30); g.lineTo(-16, 30); g.bezierCurveTo(-22, 10, -22, -40, 0, -56); g.closePath();
  g.fillStyle = '#6E4A2C'; g.fill(); g.lineWidth = 3.4; g.strokeStyle = MAP_OUT; g.stroke();
  // buraco no casco e tábuas
  g.fillStyle = '#24160c'; g.beginPath(); g.moveTo(-6, -10); g.lineTo(8, -16); g.lineTo(10, 2); g.lineTo(-4, 8); g.lineTo(-10, -2); g.closePath(); g.fill();
  g.strokeStyle = '#4e321c'; g.lineWidth = 2; for (const yy of [-36, -22, 14]) { g.beginPath(); g.moveTo(-15, yy); g.lineTo(15, yy + 2); g.stroke(); }
  // mastro quebrado caído + vela rasgada
  g.save(); g.rotate(.7);
  g.fillStyle = '#8A5A2E'; g.fillRect(-3, -12, 6, 70); g.lineWidth = 2.2; g.strokeStyle = MAP_OUT; g.strokeRect(-3, -12, 6, 70);
  g.fillStyle = '#E6DCC2'; g.beginPath(); g.moveTo(3, 6); g.lineTo(30, 14); g.lineTo(22, 26); g.lineTo(30, 34); g.lineTo(3, 44); g.closePath(); g.fill(); g.stroke();
  g.restore();
  g.restore();
}
function recife(g, x, y, s) {
  const b = blobPts(x, y, s * 1.6, s, 8, .3);
  blobDraw(g, b, 1.5, '#2E8F94');
  blobDraw(g, b, 1.18, 'rgba(255,255,255,.35)');
  for (let k = 0; k < 3; k++) { const q = blobPts(x + (k - 1) * s * .9, y + rnd(-s * .3, s * .3), s * .55, s * .45, 7, .25); blobDraw(g, q, 1, '#6E757D', 2.4); blobDraw(g, q, .4, '#A5ABB2', 0, 0, -s * .15, -s * .15); }
}
function paintPiratas(g) {
  const k = W * MAP_TH / 1e6;
  g.fillStyle = '#1D6E78'; g.fillRect(0, 0, W, MAP_TH);
  // manchas de água funda e rasa
  for (let i = 0; i < Math.ceil(5 * k); i++) { const b = blobPts(rnd(0, W), rnd(0, MAP_TH), rnd(140, 320), rnd(60, 130), 9, .22); wrapDraw(b.y, 340, dy => blobDraw(g, b, 1, '#185E68', 0, 0, 0, dy)); }
  for (let i = 0; i < Math.ceil(3 * k); i++) { const b = blobPts(rnd(0, W), rnd(0, MAP_TH), rnd(90, 200), rnd(40, 90), 9, .25); wrapDraw(b.y, 220, dy => blobDraw(g, b, 1, '#23808A', 0, 0, 0, dy, .8)); }
  // ondinhas e brilhos
  g.lineWidth = 2.5;
  for (let i = 0; i < Math.ceil(70 * k); i++) {
    const x = rnd(0, W), y = rnd(0, MAP_TH), w = rnd(14, 28); g.strokeStyle = 'rgba(220,255,250,' + rnd(.16, .36).toFixed(2) + ')';
    wrapDraw(y, 20, dy => { g.beginPath(); g.moveTo(x, y + dy); g.quadraticCurveTo(x + w / 2, y + dy + w * .35, x + w, y + dy); g.stroke(); });
  }
  for (let i = 0; i < Math.ceil(18 * k); i++) { const x = rnd(0, W), y = rnd(0, MAP_TH), s = rnd(3, 5.5), a = rnd(.4, .8); wrapDraw(y, 8, dy => sparkle(g, x, y + dy, s, '#C8FFF0', a)); }
  // Ilha da Caveira (uma por faixa) e ilhas do tesouro
  const grandes = [];
  const cav = scatter(1, 0)[0];
  if (cav) { const r = rnd(70, 90); cav.d = r; grandes.push(cav); wrapDraw(cav.y, r * 1.5, dy => ilhaCaveira(g, cav.x, cav.y + dy, r)); }
  const longe = (p, d) => !grandes.some(q => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < (d + (q.d || 0)) ** 2);
  for (const p of scatter(Math.max(1, Math.round(1.6 * k)), 280, p => longe(p, 200))) {
    const r = rnd(50, 78);
    const it = { r, b: blobPts(p.x, p.y, r, r * rnd(.6, .75), 10, .14), palms: [] };
    for (let q = 0; q < 1 + Math.floor(r / 40); q++) it.palms.push([rnd(-r * .6, -r * .2), rnd(-r * .1, r * .35), rnd(.8, 1)]);
    p.d = r; grandes.push(p);
    wrapDraw(p.y, r * 1.6, dy => ilhaTesouro(g, it, dy));
  }
  for (const p of scatter(Math.max(1, Math.round(1.2 * k)), 220, p => longe(p, 170))) { const rot = rnd(-.8, .8), s = rnd(.8, 1.05); p.d = 60; grandes.push(p); wrapDraw(p.y, 80, dy => naufragio(g, p.x, p.y + dy, rot, s)); }
  for (const p of scatter(Math.ceil(3 * k), 150, p => longe(p, 110))) { const s = rnd(14, 22); p.d = s * 2; grandes.push(p); wrapDraw(p.y, s * 3, dy => recife(g, p.x, p.y + dy, s)); }
  for (const p of scatter(Math.ceil(7 * k), 90, p => longe(p, 50))) {
    const tipo = Math.random(), rot = rnd(0, TAU), s = rnd(.8, 1.1), w = rnd(36, 60);
    wrapDraw(p.y, 40, dy => tipo < .55 ? barrilBoia(g, p.x, p.y + dy, s, rot) : tabua(g, p.x, p.y + dy, rot, w));
  }
}
// neblina (camada da frente)
function neblinaSprite() {
  const L = newLayer(420, 160), g = L.g;
  g.filter = 'blur(14px)';
  for (let i = 0; i < 6; i++) { const b = blobPts(210 + rnd(-110, 110), 80 + rnd(-22, 22), rnd(60, 110), rnd(18, 32), 8, .25); blobDraw(g, b, 1, '#E4F2EE'); }
  return L.c;
}
function drawNeblina() {
  if (!mapLayers.neblina) mapLayers.neblina = [...Array(Math.max(3, Math.ceil(3.5 * W / 1000)))].map(() => ({ x: rnd(-100, W), y: rnd(0, mapLayers.span), v: rnd(-14, 14), spr: neblinaSprite() }));
  cx.globalAlpha = .3;
  for (const n of mapLayers.neblina) {
    const y = (n.y + bgScroll * 1.3) % mapLayers.span - 300, x = ((n.x + bgScroll * n.v * .02) % (W + 420) + W + 420) % (W + 420) - 210;
    cx.drawImage(n.spr, x - 210, y - 80, 420, 160);
  }
  cx.globalAlpha = 1;
}
