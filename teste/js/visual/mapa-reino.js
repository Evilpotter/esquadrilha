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
// ---------- Castelo (visto de cima e de frente, 3/4, no estilo cartoon) ----------
const PEDRA = { face: '#9AA0A8', topo: '#C9CDD2', escura: '#7E848C', junta: 'rgba(36,22,12,.35)' };
// parede de pedras: retângulo com fileiras de pedras desencontradas
function pedras(g, x, y, w, h, cor, alt) {
  g.fillStyle = cor || PEDRA.face; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.strokeStyle = PEDRA.junta; g.lineWidth = 1.3;
  const ph = alt || 7;
  for (let row = 0, yy = y; yy < y + h; row++, yy += ph) {
    g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke();
    for (let xx = x + (row % 2 ? 6 : 0); xx < x + w; xx += 13) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + ph); g.stroke(); }
    // algumas pedras mais claras/escuras
    for (let xx = x + (row % 2 ? 6 : 0) + 2; xx < x + w - 4; xx += 39) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(xx, yy + 1.5, 9, ph - 3); }
  }
  g.restore();
  g.lineWidth = 2.6; g.strokeStyle = MAP_OUT; g.strokeRect(x, y, w, h);
}
// ameias (dentes da muralha) ao longo de uma borda horizontal
function ameias(g, x, y, w, alt) {
  for (let xx = x + 2; xx < x + w - 6; xx += 14) {
    g.fillStyle = PEDRA.topo; g.fillRect(xx, y - (alt || 8), 8, alt || 8);
    g.lineWidth = 2; g.strokeStyle = MAP_OUT; g.strokeRect(xx, y - (alt || 8), 8, alt || 8);
  }
}
function janela(g, x, y, w, h, luz) {
  g.fillStyle = luz ? '#FFD84A' : '#2a2030';
  g.beginPath(); g.moveTo(x - w / 2, y + h); g.lineTo(x - w / 2, y + w / 2); g.arc(x, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y + h); g.closePath(); g.fill();
  g.lineWidth = 1.6; g.strokeStyle = MAP_OUT; g.stroke();
}
function bandeira(g, x, y, cor) {
  g.strokeStyle = MAP_OUT; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 22); g.stroke();
  g.fillStyle = cor; g.beginPath(); g.moveTo(x, y - 22); g.quadraticCurveTo(x + 10, y - 24, x + 18, y - 18); g.quadraticCurveTo(x + 10, y - 16, x, y - 13); g.closePath(); g.fill();
  g.lineWidth = 1.6; g.stroke();
}
// torre redonda: corpo de pedra (cilindro), ameias ou telhado em cone, janela e bandeira
function torreRedonda(g, cx0, base, r, h, teto, cor) {
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(cx0 + 10, base + 4, r * 1.2, r * .42, 0, 0, TAU); g.fill();
  // corpo
  g.save(); g.beginPath(); g.rect(cx0 - r, base - h, r * 2, h); g.ellipse(cx0, base, r, r * .38, 0, 0, Math.PI); g.clip();
  pedras(g, cx0 - r, base - h, r * 2, h + r * .4, PEDRA.face);
  // sombra lateral do cilindro
  const gr = g.createLinearGradient(cx0 - r, 0, cx0 + r, 0); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.28)');
  g.fillStyle = gr; g.fillRect(cx0 - r, base - h, r * 2, h + r);
  g.restore();
  g.lineWidth = 2.6; g.strokeStyle = MAP_OUT;
  g.beginPath(); g.moveTo(cx0 - r, base - h); g.lineTo(cx0 - r, base); g.ellipse(cx0, base, r, r * .38, 0, Math.PI, 0, true); g.lineTo(cx0 + r, base - h); g.stroke();
  janela(g, cx0, base - h * .62, r * .45, r * .6, false);
  if (teto) {
    // telhado em cone com beiral
    const top = base - h, alt = r * 2.4;
    g.fillStyle = teto[0]; g.beginPath(); g.moveTo(cx0 - r - 5, top); g.lineTo(cx0, top - alt); g.lineTo(cx0 + r + 5, top); g.ellipse(cx0, top, r + 5, (r + 5) * .38, 0, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = teto[1]; g.beginPath(); g.moveTo(cx0, top - alt); g.lineTo(cx0 + r + 5, top); g.ellipse(cx0, top, r + 5, (r + 5) * .38, 0, 0, Math.PI / 2); g.lineTo(cx0 + r * .2, top + (r + 5) * .38); g.closePath(); g.fill();
    g.lineWidth = 2.6; g.strokeStyle = MAP_OUT;
    g.beginPath(); g.moveTo(cx0 - r - 5, top); g.lineTo(cx0, top - alt); g.lineTo(cx0 + r + 5, top); g.ellipse(cx0, top, r + 5, (r + 5) * .38, 0, 0, Math.PI); g.closePath(); g.stroke();
    g.strokeStyle = 'rgba(36,22,12,.3)'; g.lineWidth = 1.4;
    for (const f of [-.5, 0, .5]) { g.beginPath(); g.moveTo(cx0, top - alt); g.lineTo(cx0 + f * (r + 5), top + (r + 5) * .38 * Math.sqrt(1 - f * f)); g.stroke(); }
    bandeira(g, cx0, top - alt + 2, cor || '#C2362B');
  } else {
    // topo plano com ameias em volta
    const top = base - h;
    g.fillStyle = PEDRA.topo; g.beginPath(); g.ellipse(cx0, top, r, r * .38, 0, 0, TAU); g.fill(); g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.stroke();
    g.fillStyle = PEDRA.escura; g.beginPath(); g.ellipse(cx0, top + 1, r * .7, r * .25, 0, 0, TAU); g.fill();
    for (let k = 0; k < 7; k++) { const a = Math.PI + k / 6 * Math.PI, mx = cx0 + Math.cos(a) * r * .92, my = top + Math.sin(a) * r * .35;
      g.fillStyle = PEDRA.topo; g.fillRect(mx - 3.5, my - 7, 7, 7); g.lineWidth = 1.6; g.strokeRect(mx - 3.5, my - 7, 7, 7); }
    for (let k = 0; k < 5; k++) { const a = (k + .5) / 5 * Math.PI, mx = cx0 + Math.cos(a) * r * .92, my = top + Math.sin(a) * r * .35;
      g.fillStyle = PEDRA.topo; g.fillRect(mx - 3.5, my - 7, 7, 7); g.lineWidth = 1.6; g.strokeRect(mx - 3.5, my - 7, 7, 7); }
    bandeira(g, cx0, top - 2, cor || '#FFD84A');
  }
}
// muralha "de frente": topo (passarela) + face de pedra + ameias
function muralhaFrente(g, x, y, w, h) {
  g.fillStyle = PEDRA.topo; g.fillRect(x, y - 10, w, 10); g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.strokeRect(x, y - 10, w, 10);
  ameias(g, x, y - 10, w, 8);
  pedras(g, x, y, w, h);
}
// muralha lateral: vista de cima e um pouco de lado (passarela de pedra, parede de dentro e ameias para fora)
function muralhaLado(g, x, y0, y1, lado) {
  const fora = lado < 0 ? x - 9 : x + 9;
  pedras(g, x - 9, y0, 18, y1 - y0, PEDRA.face, 9);
  g.fillStyle = PEDRA.topo; g.fillRect(x - 9 + (lado < 0 ? 6 : 0), y0, 12, y1 - y0);
  g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.strokeRect(x - 9, y0, 18, y1 - y0);
  g.strokeStyle = 'rgba(36,22,12,.3)'; g.lineWidth = 1.2;
  for (let yy = y0 + 9; yy < y1; yy += 9) { g.beginPath(); g.moveTo(x - 9, yy); g.lineTo(x + 9, yy); g.stroke(); }
  for (let yy = y0 + 4; yy < y1 - 8; yy += 15) {
    const mx = lado < 0 ? fora - 2 : fora - 6;
    g.fillStyle = PEDRA.topo; g.fillRect(mx, yy, 8, 9); g.lineWidth = 1.8; g.strokeStyle = MAP_OUT; g.strokeRect(mx, yy, 8, 9);
  }
}
function castelo(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const AZUL = ['#3B6FC8', '#2A55A0'], VERM = ['#C2362B', '#962a20'];
  // fosso (água em volta) com margem de terra
  const fosso = blobPts(0, 10, 172, 128, 14, .04);
  blobDraw(g, fosso, 1.06, '#C9A87A', 3);
  blobDraw(g, fosso, 1, '#3F9AD0', 3);
  blobDraw(g, fosso, .86, '#5FA845', 3);
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; g.setLineDash([12, 14]); blobPath(g, fosso, .93); g.stroke(); g.setLineDash([]);
  // sombra do castelo
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-112, -62, 240, 168);
  // pátio
  g.fillStyle = '#C9B48A'; g.fillRect(-110, -72, 220, 150);
  g.fillStyle = '#7FC85A'; g.fillRect(-92, 20, 60, 44); g.fillRect(32, 20, 60, 44);
  g.lineWidth = 2; g.strokeStyle = MAP_OUT; g.strokeRect(-92, 20, 60, 44); g.strokeRect(32, 20, 60, 44);
  florzinhas(g, -62, 42, 5); florzinhas(g, 62, 42, 5);
  g.fillStyle = '#B5976A'; g.fillRect(-12, 12, 24, 72);
  // muralha de trás (vemos a face de dentro)
  muralhaFrente(g, -110, -70, 220, 24);
  // torres de trás
  torreRedonda(g, -110, -52, 22, 52, AZUL, '#FFD84A');
  torreRedonda(g, 110, -52, 22, 52, AZUL, '#FFD84A');
  // muralhas dos lados
  muralhaLado(g, -110, -56, 86, -1);
  muralhaLado(g, 110, -56, 86, 1);
  // fortaleza do meio (torre de menagem) com duas torrinhas pontudas
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-40, 4, 96, 14);
  pedras(g, -46, -40, 92, 50, '#B5BAC0');
  janela(g, -26, -28, 10, 16, true); janela(g, 0, -30, 12, 20, true); janela(g, 26, -28, 10, 16, true);
  // porta da fortaleza
  g.fillStyle = '#6a4424'; g.beginPath(); g.moveTo(-9, 10); g.lineTo(-9, -6); g.arc(0, -6, 9, Math.PI, 0); g.lineTo(9, 10); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = MAP_OUT; g.stroke();
  // telhado da fortaleza
  g.fillStyle = VERM[0]; g.beginPath(); g.moveTo(-52, -40); g.lineTo(-30, -78); g.lineTo(30, -78); g.lineTo(52, -40); g.closePath(); g.fill();
  g.fillStyle = VERM[1]; g.beginPath(); g.moveTo(30, -78); g.lineTo(52, -40); g.lineTo(20, -40); g.closePath(); g.fill();
  g.lineWidth = 2.6; g.strokeStyle = MAP_OUT; g.beginPath(); g.moveTo(-52, -40); g.lineTo(-30, -78); g.lineTo(30, -78); g.lineTo(52, -40); g.closePath(); g.stroke();
  g.strokeStyle = 'rgba(36,22,12,.3)'; g.lineWidth = 1.4; for (let k = -40; k <= 40; k += 10) { g.beginPath(); g.moveTo(k * .55, -78); g.lineTo(k, -40); g.stroke(); }
  torreRedonda(g, -40, -36, 13, 58, VERM, '#5FA8FF');
  torreRedonda(g, 40, -36, 13, 58, VERM, '#5FA8FF');
  torreRedonda(g, 0, -52, 15, 74, AZUL, '#FFD84A');
  // muralha da frente com o portão
  muralhaFrente(g, -110, 78, 84, 26);
  muralhaFrente(g, 26, 78, 84, 26);
  // portão: duas torrinhas, arco com grade e ponte levadiça
  g.fillStyle = '#9B6A3C'; g.fillRect(-14, 104, 28, 40); g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.strokeRect(-14, 104, 28, 40);
  g.strokeStyle = '#6a4424'; g.lineWidth = 1.6; for (let yy = 110; yy < 144; yy += 6) { g.beginPath(); g.moveTo(-14, yy); g.lineTo(14, yy); g.stroke(); }
  g.strokeStyle = '#3a3a3a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-14, 106); g.lineTo(-22, 84); g.moveTo(14, 106); g.lineTo(22, 84); g.stroke();
  pedras(g, -26, 70, 52, 36, '#B5BAC0');
  g.fillStyle = '#1e1a22'; g.beginPath(); g.moveTo(-14, 106); g.lineTo(-14, 86); g.arc(0, 86, 14, Math.PI, 0); g.lineTo(14, 106); g.closePath(); g.fill();
  g.strokeStyle = '#8A8F96'; g.lineWidth = 2; for (let xx = -10; xx <= 10; xx += 5) { g.beginPath(); g.moveTo(xx, 76); g.lineTo(xx, 98); g.stroke(); }
  for (const yy of [82, 90]) { g.beginPath(); g.moveTo(-13, yy); g.lineTo(13, yy); g.stroke(); }
  g.lineWidth = 2.4; g.strokeStyle = MAP_OUT; g.beginPath(); g.moveTo(-14, 106); g.lineTo(-14, 86); g.arc(0, 86, 14, Math.PI, 0); g.lineTo(14, 106); g.stroke();
  g.fillStyle = PEDRA.topo; g.fillRect(-26, 62, 52, 8); g.lineWidth = 2.2; g.strokeRect(-26, 62, 52, 8); ameias(g, -26, 62, 52, 7);
  torreRedonda(g, -26, 106, 13, 44, null, '#C2362B');
  torreRedonda(g, 26, 106, 13, 44, null, '#C2362B');
  // torres da frente (cantos)
  torreRedonda(g, -110, 106, 24, 56, AZUL, '#C2362B');
  torreRedonda(g, 110, 106, 24, 56, AZUL, '#C2362B');
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
  const cas = scatter(1, 0, p => foraRio(p, 230) && p.x > 180 && p.x < W - 180)[0];
  if (cas) { const s = W < 700 ? .75 : 1; cas.d = 170 * s; grandes.push(cas); wrapDraw(cas.y, 200 * s, dy => castelo(g, cas.x, cas.y + dy, s)); }
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
