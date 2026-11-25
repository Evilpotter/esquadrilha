// ---------- Desenho dos tiros dos inimigos ----------
// Um desenho por tipo (ETIROS, em js/dados/inimigos.js). e.k = tipo, e.c = cor de quem atirou.
// Os tiros "compridos" (laser, metralhadora, míssil) apontam para onde estão indo.
const ETIRO_DESENHO = {
  bala(e) {
    cx.fillStyle = '#ff3d6e'; cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, TAU); cx.fill();
    cx.fillStyle = '#ffe0ea'; cx.beginPath(); cx.arc(e.x, e.y, e.r * .45, 0, TAU); cx.fill();
  },
  laser(e, a) { laserRisco(e, a, e.r * 4.6, e.r * 1.25, e.c || '#ff3d6e'); },
  laserForte(e, a, t) {
    laserRisco(e, a, e.r * 8, e.r * 1.6, e.c || '#ff3d6e');
    cx.fillStyle = '#fff'; cx.globalAlpha = .6 + .4 * Math.sin(t * 40);
    cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.2, 0, TAU); cx.fill(); cx.globalAlpha = 1;
  },
  metralhadora(e, a) {
    const L = e.r * 5, hx = Math.cos(a), hy = Math.sin(a);
    cx.lineCap = 'round';
    cx.strokeStyle = 'rgba(255,150,40,.75)'; cx.lineWidth = e.r * 1.5;
    cx.beginPath(); cx.moveTo(e.x - hx * L, e.y - hy * L); cx.lineTo(e.x, e.y); cx.stroke();
    cx.strokeStyle = '#fff3b0'; cx.lineWidth = e.r * .7;
    cx.beginPath(); cx.moveTo(e.x - hx * L * .7, e.y - hy * L * .7); cx.lineTo(e.x, e.y); cx.stroke();
    cx.lineCap = 'butt';
    cx.fillStyle = '#ffd34a'; cx.beginPath(); cx.arc(e.x, e.y, e.r * .8, 0, TAU); cx.fill();
  },
  plasma(e, a, t) {
    const c = e.c || '#9be37a', pul = 1 + .15 * Math.sin(t * 14 + e.x * .05);
    cx.globalAlpha = .35; cx.fillStyle = c; cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.9 * pul, 0, TAU); cx.fill();
    cx.globalAlpha = 1; cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.05, 0, TAU); cx.fill();
    cx.strokeStyle = '#eaffd8'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.45 * pul, t * 6, t * 6 + 3.6); cx.stroke();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(e.x, e.y, e.r * .45, 0, TAU); cx.fill();
  },
  granada(e, a, t) {
    // granada de artilharia: pisca cada vez mais rápido perto de estourar
    cx.fillStyle = '#3d3a2c'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = e.c || '#8a7a5a'; cx.fillRect(e.x - e.r, e.y - e.r * .25, e.r * 2, e.r * .5);
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.arc(e.x - e.r * .35, e.y - e.r * .4, e.r * .3, 0, TAU); cx.fill();
    const pisca = (e.burst || 0) < .4 ? 30 : 12;
    if (Math.sin(t * pisca) > 0) { cx.fillStyle = '#ff2a2a'; cx.beginPath(); cx.arc(e.x, e.y - e.r * .55, e.r * .32, 0, TAU); cx.fill(); }
  },
  missil(e, a, t) {
    const r = e.r, c = e.c || '#c0392b';
    cx.save(); cx.translate(e.x, e.y); cx.rotate(a);
    // fogo
    const f = 1 + .3 * Math.sin(t * 50 + e.y);
    cx.fillStyle = '#ff8a1f'; cx.beginPath(); cx.moveTo(-r * 1.9, -r * .45); cx.lineTo(-r * (1.9 + 1.8 * f), 0); cx.lineTo(-r * 1.9, r * .45); cx.fill();
    cx.fillStyle = '#ffe680'; cx.beginPath(); cx.moveTo(-r * 1.9, -r * .25); cx.lineTo(-r * (1.9 + .9 * f), 0); cx.lineTo(-r * 1.9, r * .25); cx.fill();
    cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.6; cx.lineJoin = 'round';
    // aletas
    cx.fillStyle = c;
    for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(-r * 1.1, s * r * .45); cx.lineTo(-r * 2, s * r * 1.15); cx.lineTo(-r * 2, s * r * .45); cx.closePath(); cx.fill(); cx.stroke(); }
    // corpo e ponta
    cx.fillStyle = '#e9e6dc'; cx.beginPath(); cx.rect(-r * 2, -r * .5, r * 2.9, r); cx.fill(); cx.stroke();
    cx.fillStyle = c; cx.beginPath(); cx.moveTo(r * .9, -r * .5); cx.lineTo(r * 1.9, 0); cx.lineTo(r * .9, r * .5); cx.closePath(); cx.fill(); cx.stroke();
    cx.fillRect(-r * .9, -r * .5, r * .35, r);
    cx.lineJoin = 'miter'; cx.restore();
  },
  chefao(e, a, t) {
    const pul = 1 + .12 * Math.sin(t * 12 + e.x * .03);
    cx.globalAlpha = .35; cx.fillStyle = '#ff2a4a'; cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.75 * pul, 0, TAU); cx.fill();
    cx.globalAlpha = 1; cx.fillStyle = '#e8203f'; cx.strokeStyle = '#4a0012'; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = '#ffb04a'; cx.beginPath(); cx.arc(e.x, e.y, e.r * .6, 0, TAU); cx.fill();
    cx.fillStyle = '#fff4d0'; cx.beginPath(); cx.arc(e.x, e.y, e.r * .3, 0, TAU); cx.fill();
  },
  orbe(e, a, t) {
    const pul = 1 + .2 * Math.sin(t * 9 + e.x * .02);
    cx.globalAlpha = .3; cx.fillStyle = '#b04dff'; cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.9 * pul, 0, TAU); cx.fill();
    cx.globalAlpha = 1; cx.fillStyle = '#8a2be2'; cx.strokeStyle = '#2a0a4a'; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = '#efe0ff'; cx.beginPath(); cx.arc(e.x - e.r * .2, e.y - e.r * .2, e.r * .4, 0, TAU); cx.fill();
  },
  semente(e, a, t) {
    // semente do Semeador: incha e pisca antes de estourar
    const q = (e.burst || 0) < .5 ? 1 + .25 * Math.abs(Math.sin(t * 25)) : 1, r = e.r * q;
    cx.save(); cx.translate(e.x, e.y); cx.rotate(t * 3 + e.x * .01);
    cx.fillStyle = '#6bbf3a'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2;
    cx.beginPath(); cx.ellipse(0, 0, r * .8, r * 1.15, 0, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = '#c8f07a'; cx.beginPath(); cx.ellipse(-r * .2, -r * .3, r * .22, r * .4, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#3e7a1e'; cx.beginPath(); cx.ellipse(0, -r * 1.2, r * .25, r * .45, .6, 0, TAU); cx.fill();
    cx.restore();
  },
  // ---------- Mar dos Piratas ----------
  mosquete(e, a) {
    // bolinha de chumbo com rastro de fumaça
    const hx = Math.cos(a), hy = Math.sin(a), L = e.r * 4;
    cx.lineCap = 'round'; cx.strokeStyle = 'rgba(220,220,210,.5)'; cx.lineWidth = e.r * 1.6;
    cx.beginPath(); cx.moveTo(e.x - hx * L, e.y - hy * L); cx.lineTo(e.x, e.y); cx.stroke(); cx.lineCap = 'butt';
    cx.fillStyle = '#4a4a50'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.5;
    cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = '#c8ccd2'; cx.beginPath(); cx.arc(e.x - e.r * .3, e.y - e.r * .3, e.r * .35, 0, TAU); cx.fill();
  },
  balaCanhao(e, a) {
    const hx = Math.cos(a), hy = Math.sin(a), r = e.r;
    cx.globalAlpha = .3; cx.fillStyle = '#24160c';
    for (let k = 1; k <= 3; k++) { cx.beginPath(); cx.arc(e.x - hx * r * k * .9, e.y - hy * r * k * .9, r * (1 - k * .2), 0, TAU); cx.fill(); }
    cx.globalAlpha = 1; cx.fillStyle = '#1e1e22'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(e.x, e.y, r, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.arc(e.x - r * .35, e.y - r * .35, r * .32, 0, TAU); cx.fill();
  },
  barril(e, a, t) {
    // barril de pólvora girando, pavio aceso; pisca cada vez mais rápido perto de estourar
    const r = e.r;
    cx.save(); cx.translate(e.x, e.y); cx.rotate(t * 5 + e.x * .01);
    cx.fillStyle = '#9B6A3C'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2;
    cx.beginPath(); cx.ellipse(0, 0, r * .8, r, 0, 0, TAU); cx.fill(); cx.stroke();
    cx.strokeStyle = '#3a3a3a'; cx.lineWidth = 2;
    for (const y of [-.55, .55]) { cx.beginPath(); cx.moveTo(-r * .72, y * r); cx.lineTo(r * .72, y * r); cx.stroke(); }
    cx.fillStyle = '#2b2b2b'; cx.font = 'bold ' + Math.round(r) + 'px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('X', 0, 1);
    cx.strokeStyle = '#3a2a1a'; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(0, -r); cx.quadraticCurveTo(r * .4, -r * 1.4, r * .2, -r * 1.7); cx.stroke();
    const pisca = (e.burst || 0) < .4 ? 30 : 12;
    cx.fillStyle = Math.sin(t * pisca) > 0 ? '#fff3b0' : '#ff7a1f'; cx.beginPath(); cx.arc(r * .2, -r * 1.75, r * .32, 0, TAU); cx.fill();
    cx.restore();
  },
  tinta(e, a, t) {
    // gota de tinta do Kraken (treme um pouco) com rastro de pingos
    const hx = Math.cos(a), hy = Math.sin(a), r = e.r, w = 1 + .12 * Math.sin(t * 18 + e.y * .1);
    cx.fillStyle = '#2a0f3a';
    for (let k = 1; k <= 3; k++) { cx.beginPath(); cx.arc(e.x - hx * r * (1 + k * .8), e.y - hy * r * (1 + k * .8), r * (.5 - k * .1), 0, TAU); cx.fill(); }
    cx.save(); cx.translate(e.x, e.y); cx.rotate(a);
    cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2; cx.fillStyle = '#3d1652';
    cx.beginPath(); cx.ellipse(0, 0, r * 1.15 * w, r / w, 0, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = e.c || '#9a4ab0'; cx.globalAlpha = .6; cx.beginPath(); cx.ellipse(r * .2, -r * .25, r * .45, r * .3, 0, 0, TAU); cx.fill();
    cx.globalAlpha = 1; cx.restore();
  },
  // ---------- Reino Encantado ----------
  estrela(e, a, t) {
    // estrela dourada girando com brilho e rastro de faíscas
    const r = e.r, c = e.c || '#FFD84A', hx = Math.cos(a), hy = Math.sin(a);
    cx.fillStyle = c; for (let k = 1; k <= 3; k++) { cx.globalAlpha = .45 - k * .12; cx.beginPath(); cx.arc(e.x - hx * r * k * 1.1, e.y - hy * r * k * 1.1, r * (.5 - k * .1), 0, TAU); cx.fill(); }
    cx.globalAlpha = .3; cx.beginPath(); cx.arc(e.x, e.y, r * 1.8, 0, TAU); cx.fill(); cx.globalAlpha = 1;
    cx.save(); cx.translate(e.x, e.y); cx.rotate(t * 6 + e.y * .02);
    cx.beginPath(); for (let k = 0; k < 10; k++) { const aa = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .5 : r * 1.25; k ? cx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : cx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
    cx.closePath(); cx.fillStyle = c; cx.fill(); cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.6; cx.stroke();
    cx.fillStyle = '#fff8d0'; cx.beginPath(); cx.arc(0, 0, r * .3, 0, TAU); cx.fill();
    cx.restore();
  },
  bolaFogo(e, a, t) {
    // bola de fogo: brilho, chama para trás e miolo claro
    // fogo mágico na cor do inimigo (verde/azul), para não confundir com o fogo da Fênix
    const r = e.r, c = e.c || '#7CF04A';
    cx.globalAlpha = .3; cx.fillStyle = c; cx.beginPath(); cx.arc(e.x, e.y, r * 1.9, 0, TAU); cx.fill(); cx.globalAlpha = 1;
    chamaForma(e.x, e.y, r * .95, r * 3.2, a - Math.PI / 2, c, '#f4fff0', t, e.x * .03);
    cx.fillStyle = c; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(e.x, e.y, r * .8, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(e.x - r * .25, e.y - r * .25, r * .28, 0, TAU); cx.fill();
  },
  sopro(e, a, t) {
    // sopro do dragão ancião: chama grande e tremida
    const r = e.r * (1 + .12 * Math.sin(t * 22 + e.x * .05));
    cx.globalAlpha = .35; cx.fillStyle = '#2a7ae0'; cx.beginPath(); cx.arc(e.x, e.y, r * 2, 0, TAU); cx.fill(); cx.globalAlpha = 1;
    chamaForma(e.x, e.y, r * 1.1, r * 3.6, a - Math.PI / 2, '#2a7ae0', '#9fe6ff', t, e.y * .03);
    cx.fillStyle = '#9fe6ff'; cx.beginPath(); cx.arc(e.x, e.y, r * .85, 0, TAU); cx.fill();
    cx.fillStyle = '#f0fbff'; cx.beginPath(); cx.arc(e.x, e.y, r * .4, 0, TAU); cx.fill();
  },
  pocao(e, a, t) {
    // frasco de poção girando (pisca mais rápido perto de estourar)
    const r = e.r, c = e.c || '#8CF04A';
    cx.save(); cx.translate(e.x, e.y); cx.rotate(t * 6 + e.x * .01);
    cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2;
    cx.fillStyle = '#e8f8ff'; cx.beginPath(); cx.arc(0, r * .2, r * .95, 0, TAU); cx.fill(); cx.stroke();
    cx.fillStyle = c; cx.beginPath(); cx.arc(0, r * .2, r * .95, .15, Math.PI - .15); cx.closePath(); cx.fill();
    cx.fillStyle = '#e8f8ff'; cx.fillRect(-r * .3, -r * 1.2, r * .6, r * .6); cx.strokeRect(-r * .3, -r * 1.2, r * .6, r * .6);
    cx.fillStyle = '#9B6A3C'; cx.fillRect(-r * .35, -r * 1.45, r * .7, r * .3);
    const pisca = (e.burst || 0) < .4 ? 30 : 10;
    if (Math.sin(t * pisca) > 0) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(-r * .3, 0, r * .22, 0, TAU); cx.fill(); }
    cx.restore();
  },
  gota(e, a, t) {
    // gota da poção (verde, brilhante)
    const r = e.r, c = e.c || '#8CF04A';
    cx.save(); cx.translate(e.x, e.y); cx.rotate(a + Math.PI / 2);
    cx.fillStyle = c; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.5;
    cx.beginPath(); cx.moveTo(0, r * 1.6); cx.quadraticCurveTo(r * 1.1, 0, 0, -r); cx.quadraticCurveTo(-r * 1.1, 0, 0, r * 1.6); cx.fill(); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.7)'; cx.beginPath(); cx.arc(-r * .25, -r * .1, r * .28, 0, TAU); cx.fill();
    cx.restore();
  },
  pedra(e, a, t) {
    // lasca de pedra girando
    const r = e.r * 1.1;
    cx.save(); cx.translate(e.x, e.y); cx.rotate(t * 8 + e.x * .02);
    cx.fillStyle = '#8A8F96'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.8;
    cx.beginPath(); cx.moveTo(0, -r * 1.2); cx.lineTo(r * .9, -r * .2); cx.lineTo(r * .5, r); cx.lineTo(-r * .7, r * .6); cx.lineTo(-r, -r * .4); cx.closePath(); cx.fill(); cx.stroke();
    cx.fillStyle = '#C9CDD2'; cx.beginPath(); cx.moveTo(0, -r * .9); cx.lineTo(r * .5, -r * .2); cx.lineTo(-r * .3, -r * .1); cx.closePath(); cx.fill();
    cx.restore();
  },
  chamaFantasma(e, a, t) {
    // chama verde do navio fantasma: brilho + língua de fogo apontando para trás
    const c = e.c || '#7af0c0', r = e.r, pul = 1 + .18 * Math.sin(t * 16 + e.x * .05);
    cx.globalAlpha = .3; cx.fillStyle = c; cx.beginPath(); cx.arc(e.x, e.y, r * 2 * pul, 0, TAU); cx.fill(); cx.globalAlpha = 1;
    cx.save(); cx.translate(e.x, e.y); cx.rotate(a);
    cx.fillStyle = c; cx.beginPath(); cx.moveTo(r * 1.1, 0); cx.quadraticCurveTo(r * .6, -r * 1.2, -r * 2.6 * pul, -r * .2 * Math.sin(t * 20));
    cx.quadraticCurveTo(r * .6, r * 1.2, r * 1.1, 0); cx.fill();
    cx.fillStyle = '#e8fff4'; cx.beginPath(); cx.arc(r * .3, 0, r * .5, 0, TAU); cx.fill();
    cx.restore();
  },
};
// risco de laser: brilho na cor do inimigo + miolo branco, cabeça na posição do tiro
function laserRisco(e, a, L, w, c) {
  const hx = Math.cos(a), hy = Math.sin(a), x0 = e.x - hx * L, y0 = e.y - hy * L;
  cx.lineCap = 'round';
  cx.globalAlpha = .4; cx.strokeStyle = c; cx.lineWidth = w * 2.2;
  cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(e.x, e.y); cx.stroke();
  cx.globalAlpha = 1; cx.lineWidth = w * 1.2; cx.stroke();
  cx.strokeStyle = '#fff'; cx.lineWidth = w * .5;
  cx.beginPath(); cx.moveTo(e.x - hx * L * .8, e.y - hy * L * .8); cx.lineTo(e.x, e.y); cx.stroke();
  cx.lineCap = 'butt';
}
function drawEnemyShot(e) {
  const f = ETIRO_DESENHO[e.k] || ETIRO_DESENHO.bala;
  f(e, Math.atan2(e.vy, e.vx), performance.now() / 1000);
}
