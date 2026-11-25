// ---------- Habilidades ativas: desenho (desde 1.2.0) ----------
// Lâminas do Ciclone, fúria e rastro do Mergulho, cone da Baforada, mísseis e miras do Bombardeio,
// balas de canhão da Saraivada, anel da Onda psíquica, ícone de recarga no HUD e botão ★ do celular.

function isToque() {
  if (S.toque) return true;
  try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; }
}

// ---------- Em volta da nave (antes de desenhar a nave) ----------
function drawHabAntes(p) {
  const t = performance.now() / 1000;
  // fúria do Falcão: aura laranja pulsando e riscos de velocidade
  if (p.furiaT > 0) {
    cx.save(); cx.globalAlpha = .25 + .15 * Math.sin(t * 20); cx.fillStyle = '#ffb347';
    cx.beginPath(); cx.arc(p.x, p.y, 36, 0, TAU); cx.fill();
    cx.globalAlpha = .6; cx.strokeStyle = '#fff4a0'; cx.lineWidth = 2;
    for (let k = 0; k < 4; k++) { const ox = (k - 1.5) * 12, u = (t * 4 + k * .27) % 1; cx.beginPath(); cx.moveTo(p.x + ox, p.y + 24 + u * 30); cx.lineTo(p.x + ox, p.y + 34 + u * 30); cx.stroke(); }
    cx.restore();
  }
  // Baforada de fogo: cone de 90° para a frente até a borda da tela
  if (p.bafT > 0) {
    const h = HAB.phoenix, f = fenixFogo(p.skin), ox = p.x, oy = p.y - 24, R = Math.hypot(W, oy) + 20, meia = h.abertura / 2;
    const forte = Math.min(1, p.bafT / .3, (h.tempo - p.bafT) / .15);
    cx.save();
    const g = cx.createRadialGradient(ox, oy, 10, ox, oy, R);
    g.addColorStop(0, f[1]); g.addColorStop(.12, f[0]); g.addColorStop(.5, f[0]); g.addColorStop(1, 'rgba(0,0,0,0)');
    cx.globalAlpha = (.2 + .05 * Math.sin(t * 30)) * forte; cx.fillStyle = g;
    cx.beginPath(); cx.moveTo(ox, oy); cx.arc(ox, oy, R, -Math.PI / 2 - meia, -Math.PI / 2 + meia); cx.closePath(); cx.fill();
    cx.globalAlpha = .9 * forte;
    for (let k = 0; k < 40; k++) {
      const u = (t * 1.6 + k * .137) % 1, a = -meia + ((k * .618) % 1) * 2 * meia, d = 20 + u * (oy - 20) / Math.cos(a) * .95;
      chamaForma(ox + Math.sin(a) * d, oy - Math.cos(a) * d, 4 + u * 10, 10 + u * 22, a, f[0], f[1], t, k);
    }
    cx.restore();
  }
}
// ---------- Depois da nave ----------
function drawHabDepois(p) {
  if (p.cicloneT > 0) {
    const h = HAB.boomer, C = naveCor(p.skin, PCOL[p.i].body, PCOL[p.i].dark), { st } = naveKit(C, false);
    const cor = C.contorno ? C.enfeite : '#7ff0c8', k0 = Math.min(1, p.cicloneT / .3);
    cx.save(); cx.globalAlpha = .18 * k0; cx.strokeStyle = cor; cx.lineWidth = h.tamanho * 1.4;
    cx.beginPath(); cx.arc(p.x, p.y, h.raio, 0, TAU); cx.stroke(); cx.restore();
    cx.save(); cx.globalAlpha = k0;
    for (let k = 0; k < h.laminas; k++) { const bp = laminaPos(p, k); miniBumerangue(bp.x, bp.y, h.tamanho, p.cicloneAng * 2.5, cor, C.escuro, false, st); }
    cx.restore();
  }
}

// ---------- Balas ----------
function drawHabBala(b) {
  if (b.type === 'hab_missil') {
    cx.save(); cx.translate(b.x, b.y); cx.rotate(Math.atan2(b.vx, -b.vy));
    chamaForma(0, 8, 3, 9, Math.PI, '#ffb347', '#fff0b0', performance.now() / 1000, b.x);
    cx.fillStyle = '#e8e8e8'; cx.fillRect(-2.6, -7, 5.2, 14);
    cx.fillStyle = '#e74c3c'; cx.beginPath(); cx.moveTo(-2.6, -7); cx.lineTo(0, -12); cx.lineTo(2.6, -7); cx.fill();
    cx.fillStyle = '#9aa'; cx.fillRect(-4.5, 4, 9, 2.5);
    cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1; cx.strokeRect(-2.6, -7, 5.2, 14);
    cx.restore();
    return true;
  }
  if (b.type === 'hab_bala') {
    const sp = Math.hypot(b.vx, b.vy) || 1;
    cx.fillStyle = 'rgba(200,200,200,.35)';
    for (let i = 1; i <= 2; i++) { cx.beginPath(); cx.arc(b.x - b.vx / sp * i * 8, b.y - b.vy / sp * i * 8, b.r * (1 - i * .25), 0, TAU); cx.fill(); }
    cx.fillStyle = '#2a2a2a'; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill();
    cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2; cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.arc(b.x - b.r * .35, b.y - b.r * .35, b.r * .3, 0, TAU); cx.fill();
    return true;
  }
  if (b.type === 'hab_onda') {
    const a = Math.max(0, 1 - b.R / (Math.hypot(W, H) * .95));
    cx.save();
    for (const [dr, lw, al] of [[0, 8, .6], [-30, 4, .35], [-60, 2, .2]]) {
      const R = b.R + dr; if (R <= 0) continue;
      cx.globalAlpha = al * a; cx.strokeStyle = '#c77dff'; cx.lineWidth = lw;
      cx.beginPath(); cx.arc(b.x, b.y, R, 0, TAU); cx.stroke();
    }
    cx.globalAlpha = .5 * a; espiral(b.x, b.y, Math.min(60, b.R * .3), b.R * .02, '#f3e3ff', 3, 2.5);
    cx.restore();
    return true;
  }
  return false;
}

// ---------- Efeitos soltos (S.habFx) ----------
function drawHabFx() {
  if (!S.habFx) return;
  for (const f of S.habFx) {
    const k = f.t / f.life;
    if (f.type === 'rastro') {
      cx.save(); cx.globalAlpha = .35 * (1 - k);
      drawShip(f.ship, f.x, f.y, 1, PCOL[f.i].body, PCOL[f.i].dark, f.tilt, true, f.skin);
      cx.restore();
    } else if (f.type === 'mira' && f.alvo && !f.alvo.dead) {
      const R = (f.alvo.r + 10) * (1.6 - .6 * Math.min(1, k * 2));
      cx.save(); cx.translate(f.alvo.x, f.alvo.y); cx.rotate(k * 3);
      cx.globalAlpha = 1 - Math.max(0, k - .7) / .3; cx.strokeStyle = '#ff4a3a'; cx.lineWidth = 2.5;
      cx.beginPath(); cx.arc(0, 0, R, 0, TAU); cx.stroke();
      cx.beginPath(); for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; cx.moveTo(Math.cos(a) * (R - 6), Math.sin(a) * (R - 6)); cx.lineTo(Math.cos(a) * (R + 6), Math.sin(a) * (R + 6)); } cx.stroke();
      cx.restore();
    } else if (f.type === 'nome') {
      cx.save(); cx.globalAlpha = 1 - Math.max(0, k - .6) / .4;
      cx.font = '800 16px system-ui,sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 5;
      cx.strokeStyle = f.color; cx.strokeText(f.text, f.x, f.y - k * 24); cx.fillStyle = '#fff'; cx.fillText(f.text, f.x, f.y - k * 24);
      cx.restore();
    }
  }
  // XP em dobro (Saraivada da Âncora Negra)
  if (S.xpDobroT > 0) {
    const a = Math.min(1, S.xpDobroT * 2);
    cx.save(); cx.globalAlpha = a * (.75 + .25 * Math.sin(performance.now() / 120));
    txt('XP em dobro! ' + Math.ceil(S.xpDobroT) + ' s', W / 2, 62, 16, '#7dff8a', 'center', 800);
    cx.restore();
  }
}

// ---------- Ícone de recarga no HUD ----------
function drawHabIcone(p, x, y) {
  const h = habDe(p), pronta = habPronta(p), v = p.habMax ? 1 - (p.habT || 0) / p.habMax : 1, t = performance.now() / 1000;
  const cor = PCOL[p.i].body;
  cx.save();
  if (pronta) { cx.globalAlpha = .35 + .25 * Math.sin(t * 6); cx.fillStyle = cor; cx.beginPath(); cx.arc(x, y, 17, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
  cx.fillStyle = 'rgba(8,20,32,.85)'; cx.beginPath(); cx.arc(x, y, 13, 0, TAU); cx.fill();
  cx.strokeStyle = pronta ? '#ffd36b' : cor; cx.lineWidth = 3;
  cx.beginPath(); cx.arc(x, y, 11.5, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(v, 0, 1)); cx.stroke();
  estrela(x, y, 6.5, pronta ? '#ffd36b' : 'rgba(255,255,255,.35)');
  cx.restore();
  const tecla = padDono[p.i] !== null && padDono[p.i] !== undefined ? 'A' : (S.np === 2 && p.i === 1 ? 'Enter' : 'Espaço');
  txt(pronta ? tecla : String(Math.ceil(p.habT)), x, y + 25, 10, pronta ? '#ffd36b' : '#9fb3c8', 'center', 700);
  return h;
}
function estrela(x, y, R, cor) {
  cx.fillStyle = cor; cx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? R * .45 : R; k ? cx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : cx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  cx.closePath(); cx.fill();
}

// ---------- Botão ★ do celular (Jogador 1) ----------
function habBotaoPos() { return { x: W - 64, y: H - 150, r: 40 }; }
function habBotaoToque(g) {
  if (!isToque() || !S.players) return false;
  const b = habBotaoPos(); return Math.hypot(g.x - b.x, g.y - b.y) < b.r + 12;
}
function drawHabBotao() {
  if (!isToque() || !S.players || S.np !== 1) return;
  const p = S.players[0], b = habBotaoPos(), pronta = habPronta(p), v = p.habMax ? 1 - (p.habT || 0) / p.habMax : 1;
  cx.save();
  cx.globalAlpha = pronta ? .9 : .55;
  cx.fillStyle = 'rgba(8,20,32,.7)'; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill();
  cx.strokeStyle = pronta ? '#ffd36b' : PCOL[0].body; cx.lineWidth = 5;
  cx.beginPath(); cx.arc(b.x, b.y, b.r - 4, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(v, 0, 1)); cx.stroke();
  estrela(b.x, b.y, 18, pronta ? '#ffd36b' : 'rgba(255,255,255,.4)');
  if (!pronta) txt(String(Math.ceil(p.habT)), b.x, b.y + 6, 16, '#fff', 'center', 800);
  cx.restore();
}
