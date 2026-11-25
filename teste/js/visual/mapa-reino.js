// ---------- Mapa do Reino Encantado (desde 1.2.0) ----------
// Mesmo jeito dos outros mapas (js/visual/mapas.js): uma faixa pintada de MAP_TH que se repete.
// Peças: campos com flores, rio que serpenteia com pontes de pedra, castelo com torres e bandeiras,
// floresta encantada (árvores redondas e mágicas, cogumelos), círculo de fadas, cristais.
// Na frente: pó de fada brilhando e pétalas passando devagar.

function arvore(g, x, y, s, magica) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(7, 9, 24, 20, 0, 0, TAU); g.fill();
  const c = magica ? ['#B57BFF', '#7a4ad0', '#E3C8FF'] : ['#3E8A3A', '#2E6A2C', '#6BBF4A'];
  for (const [dx, dy, r] of [[-9, 4, 13], [9, 5, 12], [0, -7, 14]]) { g.fillStyle = c[0]; g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.fill(); g.lineWidth = 2.6; g.strokeStyle = MAP_OUT; g.stroke(); }
  g.fillStyle = c[0]; g.beginPath(); g.arc(0, 1, 12, 0, TAU); g.fill();
  g.fillStyle = c[1]; g.beginPath(); g.arc(4, 6, 8, 0, TAU); g.fill();
  g.fillStyle = c[2]; g.beginPath(); g.arc(-5, -8, 5, 0, TAU); g.fill();
  if (magica) for (const [dx, dy] of [[-10, 2], [8, -4], [2, 9]]) sparkle(g, dx, dy, 3.2, '#fff8d0', .95);
  g.restore();
}
function cogumelo(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#D9473A'; g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = MAP_OUT; g.stroke();
  g.fillStyle = '#fff'; for (const [dx, dy, r] of [[-3, -2, 1.6], [3, -1, 1.3], [0, 3, 1.2]]) { g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.fill(); }
  g.restore();
}
// flores: sorteio próprio pela posição (a cópia de cima/embaixo da faixa sai igual)
function florzinhas(g, x, y, n) {
  const cores = ['#FFD84A', '#ff8fc8', '#ffffff', '#b8a0ff'];
  let s = Math.abs(Math.round(x * 7.3 + (((y % MAP_TH) + MAP_TH) % MAP_TH) * 3.1)) + 1;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < n; i++) {
    const fx = x + (r() * 60 - 30), fy = y + (r() * 40 - 20), c = cores[Math.floor(r() * 4)];
    g.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.beginPath(); g.arc(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2, 0, TAU); g.fill(); }
    g.fillStyle = '#F2B233'; g.beginPath(); g.arc(fx, fy, 1.4, 0, TAU); g.fill();
  }
}
function torre(g, x, y, r, teto, bandeira) {
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.arc(x + 6, y + 8, r + 2, 0, TAU); g.fill();
  g.fillStyle = '#C9C2B2'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.stroke();
  // telhado em cone visto de cima (fatias claras e escuras)
  for (let k = 0; k < 8; k++) {
    const a0 = k * TAU / 8, a1 = (k + 1) * TAU / 8;
    g.fillStyle = k % 2 ? teto[0] : teto[1]; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r * .82, a0, a1); g.closePath(); g.fill();
  }
  g.beginPath(); g.arc(x, y, r * .82, 0, TAU); g.lineWidth = 2.2; g.stroke();
  g.fillStyle = '#FFD84A'; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); g.lineWidth = 1.4; g.stroke();
  if (bandeira) {
    g.fillStyle = bandeira; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r * .9, y - r * .55); g.lineTo(x + r * .75, y - r * .05); g.closePath(); g.fill(); g.lineWidth = 1.6; g.stroke();
  }
}
function castelo(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const L = 70, teto = ['#3B6FC8', '#5A8FE0'];
  // fosso
  g.fillStyle = '#4BA3D8'; g.beginPath(); g.roundRect ? g.roundRect(-L - 26, -L - 26, (L + 26) * 2, (L + 26) * 2, 30) : g.rect(-L - 26, -L - 26, (L + 26) * 2, (L + 26) * 2); g.fill();
  g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.stroke();
  g.fillStyle = '#6DB84A'; g.fillRect(-L - 12, -L - 12, (L + 12) * 2, (L + 12) * 2);
  // ponte levadiça
  g.fillStyle = '#9B6A3C'; g.fillRect(-9, L, 18, 30); g.lineWidth = 2.4; g.strokeRect(-9, L, 18, 30);
  g.strokeStyle = '#6a4424'; g.lineWidth = 1.4; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(-9, L + k * 6); g.lineTo(9, L + k * 6); g.stroke(); }
  // muralha com ameias
  g.fillStyle = '#B5AE9E'; g.fillRect(-L, -L, L * 2, L * 2); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.strokeRect(-L, -L, L * 2, L * 2);
  g.fillStyle = '#7FC85A'; g.fillRect(-L + 12, -L + 12, L * 2 - 24, L * 2 - 24); g.lineWidth = 2.4; g.strokeRect(-L + 12, -L + 12, L * 2 - 24, L * 2 - 24);
  g.fillStyle = '#D9D2C2'; for (let k = -L + 6; k < L - 4; k += 12) for (const [ax, ay] of [[k, -L + 2], [k, L - 8], [-L + 2, k], [L - 8, k]]) g.fillRect(ax, ay, 6, 6);
  // pátio: caminho e jardim
  g.fillStyle = '#C9A87A'; g.fillRect(-7, 20, 14, L - 32);
  florzinhas(g, -34, 34, 6); florzinhas(g, 34, 34, 6);
  // castelo central (torre de menagem) e 4 torres
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-26, -34, 58, 60);
  g.fillStyle = '#D9D2C2'; g.fillRect(-30, -40, 60, 60); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.strokeRect(-30, -40, 60, 60);
  g.fillStyle = teto[0]; g.beginPath(); g.moveTo(-30, -40); g.lineTo(0, -10); g.lineTo(-30, 20); g.closePath(); g.fill();
  g.fillStyle = teto[1]; g.beginPath(); g.moveTo(30, -40); g.lineTo(0, -10); g.lineTo(30, 20); g.closePath(); g.fill();
  g.fillStyle = '#2F5FA8'; g.beginPath(); g.moveTo(-30, 20); g.lineTo(0, -10); g.lineTo(30, 20); g.closePath(); g.fill();
  g.lineWidth = 2; g.beginPath(); g.moveTo(-30, -40); g.lineTo(30, 20); g.moveTo(30, -40); g.lineTo(-30, 20); g.stroke();
  torre(g, 0, -10, 13, ['#C2362B', '#E0574A'], '#FFD84A');
  for (const [tx, ty] of [[-L, -L], [L, -L], [-L, L], [L, L]]) torre(g, tx, ty, 19, teto, tx < 0 ? '#C2362B' : '#FFD84A');
  g.restore();
}
function ponte(g, x, y) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-56, -10, 116, 26);
  g.fillStyle = '#B5AE9E'; g.fillRect(-60, -14, 120, 28); g.lineWidth = 3; g.strokeStyle = MAP_OUT; g.strokeRect(-60, -14, 120, 28);
  g.fillStyle = '#D9D2C2'; g.fillRect(-60, -14, 120, 6); g.fillRect(-60, 8, 120, 6);
  g.lineWidth = 1.6; g.strokeStyle = 'rgba(36,22,12,.5)'; for (let k = -48; k < 60; k += 16) { g.beginPath(); g.moveTo(k, -8); g.lineTo(k, 8); g.stroke(); }
  g.restore();
}
function cristal(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(5, 7, 16, 10, 0, 0, TAU); g.fill();
  for (const [dx, dy, h, rot, c] of [[-7, 2, 16, -.4, '#9be0ff'], [6, 3, 14, .45, '#c8a0ff'], [0, 0, 22, 0, '#7fd3ff']]) {
    g.save(); g.translate(dx, dy); g.rotate(rot);
    g.fillStyle = c; g.beginPath(); g.moveTo(0, -h); g.lineTo(5, -h * .55); g.lineTo(4, 4); g.lineTo(-4, 4); g.lineTo(-5, -h * .55); g.closePath(); g.fill();
    g.lineWidth = 2; g.strokeStyle = MAP_OUT; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.moveTo(0, -h); g.lineTo(-5, -h * .55); g.lineTo(-1, -h * .4); g.closePath(); g.fill();
    g.restore();
  }
  sparkle(g, 2, -14, 4, '#fff', .95);
  g.restore();
}
function paintReino(g) {
  const k = W * MAP_TH / 1e6;
  g.fillStyle = '#5FA845'; g.fillRect(0, 0, W, MAP_TH);
  // manchas de grama clara e escura
  for (let i = 0; i < Math.ceil(6 * k); i++) { const b = blobPts(rnd(0, W), rnd(0, MAP_TH), rnd(120, 280), rnd(60, 130), 9, .22); wrapDraw(b.y, 300, dy => blobDraw(g, b, 1, '#6BB84E', 0, 0, 0, dy)); }
  for (let i = 0; i < Math.ceil(4 * k); i++) { const b = blobPts(rnd(0, W), rnd(0, MAP_TH), rnd(90, 200), rnd(40, 90), 9, .25); wrapDraw(b.y, 220, dy => blobDraw(g, b, 1, '#54983E', 0, 0, 0, dy, .8)); }
  // tufos de grama
  g.strokeStyle = 'rgba(40,90,30,.45)'; g.lineWidth = 2;
  for (let i = 0; i < Math.ceil(90 * k); i++) { const x = rnd(0, W), y = rnd(0, MAP_TH); wrapDraw(y, 10, dy => { g.beginPath(); g.moveTo(x - 4, y + dy); g.lineTo(x - 2, y + dy - 6); g.moveTo(x, y + dy); g.lineTo(x + 1, y + dy - 8); g.moveTo(x + 4, y + dy); g.lineTo(x + 5, y + dy - 6); g.stroke(); }); }
  // rio que serpenteia (emenda perfeita em cima e embaixo) com pontes
  const R = { x0: rnd(W * .25, W * .75), a: Math.min(W * .2, 240), b: Math.min(W * .05, 60), ph: rnd(0, TAU) };
  const rio = (lw, col, dash) => {
    g.setLineDash(dash || []); g.lineWidth = lw; g.strokeStyle = col; g.beginPath();
    for (let y = -20; y <= MAP_TH + 20; y += 10) { const x = roadX(y, R); y === -20 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke(); g.setLineDash([]);
  };
  rio(74, MAP_OUT); rio(66, '#C9A87A'); rio(54, '#3F9AD0'); rio(30, '#58B2E2'); rio(3, 'rgba(255,255,255,.55)', [14, 22]);
  const pontes = [MAP_TH * rnd(.15, .3), MAP_TH * rnd(.6, .8)];
  for (const py of pontes) ponte(g, roadX(py, R), py);
  const foraRio = (p, m) => Math.abs(p.x - roadX(p.y, R)) > m;
  const grandes = [];
  const longe = (p, d) => !grandes.some(q => { const dy = Math.min(Math.abs(q.y - p.y), MAP_TH - Math.abs(q.y - p.y)); return (q.x - p.x) ** 2 + dy * dy < (d + (q.d || 0)) ** 2; });
  // castelo (um por faixa, longe do rio)
  const cas = scatter(1, 0, p => foraRio(p, 170) && p.x > 120 && p.x < W - 120)[0];
  if (cas) { const s = W < 700 ? .8 : 1; cas.d = 110 * s; grandes.push(cas); wrapDraw(cas.y, 120 * s, dy => castelo(g, cas.x, cas.y + dy, s)); }
  // floresta encantada (bosques de árvores, algumas mágicas, com cogumelos)
  for (const p of scatter(Math.max(2, Math.round(2.6 * k)), 160, p => foraRio(p, 110) && longe(p, 90))) {
    p.d = 70; grandes.push(p);
    const arv = [...Array(4 + Math.floor(rnd(0, 4)))].map(() => [p.x + rnd(-60, 60), p.y + rnd(-45, 45), rnd(.8, 1.15), Math.random() < .3]);
    arv.sort((a, b) => a[1] - b[1]);
    const cog = [...Array(3)].map(() => [p.x + rnd(-70, 70), p.y + rnd(-55, 55), rnd(.7, 1)]);
    wrapDraw(p.y, 110, dy => { for (const c of cog) cogumelo(g, c[0], c[1] + dy, c[2]); for (const a of arv) arvore(g, a[0], a[1] + dy, a[2], a[3]); });
  }
  // círculo de fadas (cogumelos em roda com brilho no meio)
  for (const p of scatter(Math.max(1, Math.round(.8 * k)), 0, p => foraRio(p, 90) && longe(p, 60))) {
    p.d = 40; grandes.push(p);
    wrapDraw(p.y, 50, dy => {
      g.fillStyle = 'rgba(255,240,180,.25)'; g.beginPath(); g.arc(p.x, p.y + dy, 30, 0, TAU); g.fill();
      for (let q = 0; q < 9; q++) { const a = q * TAU / 9; cogumelo(g, p.x + Math.cos(a) * 30, p.y + dy + Math.sin(a) * 30, .75); }
      sparkle(g, p.x, p.y + dy, 7, '#fff8d0', .9);
    });
  }
  // cristais
  for (const p of scatter(Math.ceil(2 * k), 120, p => foraRio(p, 70) && longe(p, 50))) { const s = rnd(.8, 1.2); p.d = 25; grandes.push(p); wrapDraw(p.y, 40, dy => cristal(g, p.x, p.y + dy, s)); }
  // árvores soltas e flores
  for (const p of scatter(Math.ceil(5 * k), 80, p => foraRio(p, 60) && longe(p, 40))) { const s = rnd(.7, 1), m = Math.random() < .2; wrapDraw(p.y, 40, dy => arvore(g, p.x, p.y + dy, s, m)); }
  for (const p of scatter(Math.ceil(10 * k), 50, p => foraRio(p, 50) && longe(p, 30))) { wrapDraw(p.y, 40, dy => florzinhas(g, p.x, p.y + dy, 5)); }
}
// pó de fada e pétalas (camada da frente)
function drawPoMagico() {
  if (!mapLayers.po) mapLayers.po = [...Array(Math.max(18, Math.ceil(26 * W / 1000)))].map(() => ({ x: rnd(0, W), y: rnd(0, mapLayers.span), v: rnd(.8, 1.6), f: rnd(0, 6), s: rnd(2, 4.5), c: Math.random() < .5 ? '#FFE88A' : Math.random() < .5 ? '#ffb8e0' : '#c8b8ff', petala: Math.random() < .3 }));
  const t = performance.now() / 1000;
  for (const q of mapLayers.po) {
    const y = (q.y + bgScroll * q.v) % mapLayers.span - 300, x = q.x + Math.sin(t * .8 + q.f) * 18;
    if (y < -20 || y > H + 20) continue;
    if (q.petala) {
      cx.save(); cx.translate(x, y); cx.rotate(t * 1.5 + q.f); cx.globalAlpha = .55; cx.fillStyle = q.c;
      cx.beginPath(); cx.ellipse(0, 0, q.s * 1.4, q.s * .7, 0, 0, TAU); cx.fill(); cx.restore();
    } else {
      const a = .35 + .3 * Math.sin(t * 3 + q.f);
      cx.globalAlpha = a * .4; cx.fillStyle = q.c; cx.beginPath(); cx.arc(x, y, q.s * 2.2, 0, TAU); cx.fill();
      cx.globalAlpha = a; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x, y, q.s * .55, 0, TAU); cx.fill();
    }
  }
  cx.globalAlpha = 1;
}
