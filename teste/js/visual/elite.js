// ---------- Desenho do elite, do baú e da barra de vida do elite ----------
function drawElite(e) {
  const t = performance.now() / 1000, cor = e.furia ? '255,90,60' : '255,210,80';
  // aura dourada (vermelha na fúria) e anel girando
  const g = cx.createRadialGradient(e.x, e.y, e.r * .3, e.x, e.y, e.r * 1.55);
  g.addColorStop(0, 'rgba(' + cor + ',.38)'); g.addColorStop(1, 'rgba(' + cor + ',0)');
  cx.fillStyle = g; cx.beginPath(); cx.arc(e.x, e.y, e.r * 1.55, 0, TAU); cx.fill();
  cx.save(); cx.translate(e.x, e.y); cx.rotate(t * 1.2);
  cx.strokeStyle = 'rgba(' + cor + ',.75)'; cx.lineWidth = 2.5; cx.setLineDash([10, 8]);
  cx.beginPath(); cx.arc(0, 0, e.r * 1.2, 0, TAU); cx.stroke(); cx.setLineDash([]);
  cx.restore();
  drawEnemy(e);
  // coroa em cima
  const cy = e.y - e.r - 14 + Math.sin(t * 3) * 2;
  cx.save(); cx.translate(e.x, cy);
  cx.beginPath(); cx.moveTo(-13, 7); cx.lineTo(-15, -6); cx.lineTo(-7, 0); cx.lineTo(0, -10); cx.lineTo(7, 0); cx.lineTo(15, -6); cx.lineTo(13, 7); cx.closePath();
  cx.fillStyle = '#ffd34a'; cx.fill(); cx.strokeStyle = '#24160c'; cx.lineWidth = 2.5; cx.lineJoin = 'round'; cx.stroke();
  cx.fillStyle = '#e8344a'; cx.beginPath(); cx.arc(0, 2, 2.6, 0, TAU); cx.fill();
  cx.fillStyle = '#5ad0ff'; for (const x of [-8, 8]) { cx.beginPath(); cx.arc(x, 3, 1.9, 0, TAU); cx.fill(); }
  cx.restore(); cx.lineJoin = 'miter';
}
function drawBaus() {
  if (!S.baus) return;
  const t = performance.now() / 1000;
  for (const b of S.baus) {
    const y = b.y + Math.sin(t * 3 + b.x) * 3;
    cx.globalAlpha = .35 + .15 * Math.sin(t * 5); cx.fillStyle = '#ffe28a';
    cx.beginPath(); cx.arc(b.x, y, 30, 0, TAU); cx.fill(); cx.globalAlpha = 1;
    cx.save(); cx.translate(b.x, y); cx.lineJoin = 'round';
    // caixa
    cx.fillStyle = '#9a5a2a'; cx.strokeStyle = '#24160c'; cx.lineWidth = 2.5;
    roundRect(-17, -4, 34, 20, 3); cx.fill(); cx.stroke();
    // tampa
    cx.fillStyle = '#b8743a'; cx.beginPath(); cx.moveTo(-17, -3); cx.lineTo(-17, -9); cx.quadraticCurveTo(0, -22, 17, -9); cx.lineTo(17, -3); cx.closePath(); cx.fill(); cx.stroke();
    // faixas douradas e fechadura
    cx.fillStyle = '#ffd34a';
    for (const x of [-11, 8]) { cx.fillRect(x, -15, 3.5, 30); cx.strokeRect(x, -15, 3.5, 30); }
    roundRect(-4, -6, 8, 9, 2); cx.fill(); cx.stroke();
    cx.restore(); cx.lineJoin = 'miter';
    // brilhinhos
    for (let k = 0; k < 3; k++) {
      const a = t * 1.6 + k * 2.1, r = 24 + 4 * Math.sin(t * 4 + k);
      const sx = b.x + Math.cos(a) * r, sy = y + Math.sin(a) * r * .7, s = 2.5 + 1.5 * Math.sin(t * 6 + k * 2);
      cx.fillStyle = '#fff6c0'; cx.beginPath(); cx.moveTo(sx, sy - s * 1.6); cx.lineTo(sx + s * .5, sy); cx.lineTo(sx, sy + s * 1.6); cx.lineTo(sx - s * .5, sy); cx.closePath(); cx.fill();
    }
  }
}
// barra de vida do elite (embaixo do topo, no lugar da barra do chefão) e marca da coroa na barra da fase
function drawEliteHud() {
  const e = eliteVivo();
  if (e && e.chegou && !e.foge) {
    const bw = Math.min(W - 160, 460);
    bar((W - bw) / 2, 58, bw, 8, e.hp / e.maxHp, e.furia ? '#ff7a4a' : '#ffcf40');
    txt('★ ' + e.nome + ' ★', W / 2, 82, 13, '#ffe7a0', 'center', 700);
  }
  if (!S.bossSpawned && !S.eliteFeito && ELITE.cenas[S.scene]) {
    const x = 14 + (W - 28) * ELITE.quando;
    cx.fillStyle = '#ffd34a'; cx.strokeStyle = '#24160c'; cx.lineWidth = 1.5;
    cx.beginPath(); cx.moveTo(x - 6, 52); cx.lineTo(x - 7, 45); cx.lineTo(x - 3, 48); cx.lineTo(x, 43); cx.lineTo(x + 3, 48); cx.lineTo(x + 7, 45); cx.lineTo(x + 6, 52); cx.closePath(); cx.fill(); cx.stroke();
  }
}
