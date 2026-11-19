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
