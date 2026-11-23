// ---------- Desenho de inimigos ----------
function drawEnemy(e) {
  if (drawEnemyArt(e)) { drawEnemyExtras(e); return; }
  const t = ETYPES[e.type], f = e.flash > 0;
  if (e.type === 'mine') {
    const blink = e.armed && Math.floor(e.armed * 14) % 2;
    cx.fillStyle = f || blink ? '#ff4a4a' : '#2b2b2b';
    cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, TAU); cx.fill();
    cx.strokeStyle = '#2b2b2b'; cx.lineWidth = 3;
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + e.t; cx.beginPath(); cx.moveTo(e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r); cx.lineTo(e.x + Math.cos(a) * (e.r + 5), e.y + Math.sin(a) * (e.r + 5)); cx.stroke(); }
    cx.fillStyle = '#ff6a6a'; cx.beginPath(); cx.arc(e.x, e.y, 3, 0, TAU); cx.fill();
    return;
  }
  if (t.scene === 'desert' || t.scene === 'space' || t.scene === 'piratas') {
    drawSceneEnemy(e);
  } else if (e.type === 'spinner') {
    cx.save(); cx.translate(e.x, e.y); cx.rotate(e.t * 2.2);
    cx.fillStyle = f ? '#fff' : t.dark; cx.fillRect(-28, -5, 56, 10);
    cx.fillStyle = f ? '#fff' : t.color; cx.beginPath(); cx.arc(0, 0, 18, 0, TAU); cx.fill();
    cx.fillStyle = f ? '#fff' : t.dark; cx.beginPath(); cx.arc(0, 0, 7, 0, TAU); cx.fill();
    cx.restore();
  } else if (e.type === 'kamikaze' && e.mode === 'dive') {
    drawPlane(e.x, e.y, e.r / 17, t.color, t.dark, true, 0, f, Math.atan2(e.vy, e.vx) - Math.PI / 2);
  } else {
    drawPlane(e.x, e.y, e.r / 17, t.color, t.dark, true, 0, f || (e.type === 'kamikaze' && e.mode === 'lock' && Math.floor(e.lt * 12) % 2));
  }
  if (e.type === 'miner') { cx.fillStyle = '#2b2b2b'; cx.beginPath(); cx.arc(e.x, e.y - 4, 6, 0, TAU); cx.fill(); }
  drawEnemyExtras(e);
}
// mira do franco-atirador e barra de vida (valem para o desenho novo e o antigo)
function drawEnemyExtras(e) {
  if (e.type === 'sniper' && e.aiming > 0 && e.ax !== undefined) {
    cx.strokeStyle = e.aiming < .35 ? 'rgba(255,60,60,.9)' : 'rgba(255,60,60,.35)'; cx.lineWidth = e.aiming < .35 ? 2 : 1;
    cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.x + (e.ax - e.x) * 4, e.y + (e.ay - e.y) * 4); cx.stroke();
  }
  const escondido = ETYPES[e.type].scene === 'piratas' && (e.alpha < .5 || e.sub > .5); // navio fantasma sumido, kraken embaixo d'água
  if (e.hp < e.maxHp && e.maxHp > 40 && !escondido) {
    cx.fillStyle = 'rgba(0,0,0,.4)'; cx.fillRect(e.x - 18, e.y - e.r - 10, 36, 4);
    cx.fillStyle = '#ff5a4a'; cx.fillRect(e.x - 18, e.y - e.r - 10, 36 * e.hp / e.maxHp, 4);
  }
}
function drawHazards() {
  for (const h of S.hazards) {
    if (h.warn > 0) {
      const a = .15 + .25 * (1 - h.warn / h.max);
      cx.fillStyle = 'rgba(255,70,70,' + a + ')'; cx.fillRect(h.x - h.w / 2, h.y0, h.w, H - h.y0);
      cx.strokeStyle = 'rgba(255,90,90,.7)'; cx.lineWidth = 1; cx.setLineDash([6, 6]);
      cx.strokeRect(h.x - h.w / 2, h.y0, h.w, H - h.y0); cx.setLineDash([]);
    } else {
      cx.fillStyle = 'rgba(255,80,80,.55)'; cx.fillRect(h.x - h.w / 2 - 6, h.y0, h.w + 12, H - h.y0);
      cx.fillStyle = '#fff3f0'; cx.fillRect(h.x - h.w / 4, h.y0, h.w / 2, H - h.y0);
    }
  }
}
