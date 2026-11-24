// ---------- Desenho ----------
function drawBg() { drawMap(S.scene || 'sea'); }
function drawClouds() { drawMapFront(S.scene || 'sea'); }
function drawPlane(x, y, s, c1, c2, down, tilt, flash, rot) {
  cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), down ? -s : s);
  const body = flash ? '#fff' : c1, dk = flash ? '#fff' : c2;
  cx.fillStyle = dk;
  cx.beginPath(); cx.moveTo(-9, 14); cx.lineTo(9, 14); cx.lineTo(7, 20); cx.lineTo(-7, 20); cx.closePath(); cx.fill();
  cx.fillStyle = body;
  cx.beginPath(); cx.moveTo(-25, 0); cx.lineTo(25, 0); cx.lineTo(21, 8); cx.lineTo(-21, 8); cx.closePath(); cx.fill();
  cx.fillStyle = dk;
  cx.beginPath(); cx.ellipse(0, 2, 5.5, 19, 0, 0, 7); cx.fill();
  cx.fillStyle = flash ? '#fff' : '#bfe6ff';
  cx.beginPath(); cx.ellipse(0, -5, 3, 5, 0, 0, 7); cx.fill();
  cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.5;
  const pr = Math.sin(performance.now() / 30) * 7;
  cx.beginPath(); cx.moveTo(-pr, -20); cx.lineTo(pr, -20); cx.stroke();
  cx.restore();
}
function drawBoss(b) {
  cx.save(); cx.translate(b.x, b.y);
  const f = b.flash > 0;
  cx.fillStyle = f ? '#fff' : '#2f3340';
  cx.beginPath(); cx.moveTo(-95, -10); cx.lineTo(95, -10); cx.lineTo(80, 18); cx.lineTo(-80, 18); cx.closePath(); cx.fill();
  cx.beginPath(); cx.moveTo(-34, -48); cx.lineTo(34, -48); cx.lineTo(26, -36); cx.lineTo(-26, -36); cx.closePath(); cx.fill();
  cx.fillStyle = f ? '#fff' : '#4a4f60';
  cx.beginPath(); cx.ellipse(0, 0, 18, 58, 0, 0, 7); cx.fill();
  cx.fillStyle = f ? '#fff' : '#c0392b';
  for (const ex of [-62, -32, 32, 62]) { cx.beginPath(); cx.ellipse(ex, 10, 8, 16, 0, 0, 7); cx.fill(); }
  cx.fillStyle = f ? '#fff' : '#ffd36b';
  cx.beginPath(); cx.ellipse(0, 30, 7, 10, 0, 0, 7); cx.fill();
  cx.restore();
}
function drawGame() {
  const sh = S.shake > 0 ? S.shake * 14 : 0;
  cx.save(); cx.translate(rnd(-sh, sh), rnd(-sh, sh));
  drawBg();
  for (const g of S.gems) {
    cx.fillStyle = g.v >= 3 ? '#6fd3ff' : '#7dff8a';
    const s = g.v >= 3 ? 7 : 5;
    cx.beginPath(); cx.moveTo(g.x, g.y - s); cx.lineTo(g.x + s, g.y); cx.lineTo(g.x, g.y + s); cx.lineTo(g.x - s, g.y); cx.fill();
  }
  drawHazards();
  for (const e of S.enemies) if (ETYPES[e.type].ground) drawEnemy(e);
  for (const e of S.enemies) if (!ETYPES[e.type].ground) drawEnemy(e);
  for (const b of S.bosses) if (!b.dead && !drawBossArt(b)) BOSSES[b.kind].draw(b);
  drawLentos(); // inimigos lentos pela Onda (js/visual/pirata.js)
  drawQueimas(); // inimigos pegando fogo (js/visual/fenix.js)
  drawFenixChao(); // chamas do rastro e sombras dos meteoros, embaixo das naves
  drawHipnose();   // marcas, inimigos tontos, ímãs e aliados hipnotizados (js/visual/hypnos.js)
  S.players.forEach(p => {
    if (!p.alive) return;
    if (p.inv > 0 && Math.floor(p.inv * 12) % 2) return;
    const c = PCOL[p.i];
    for (const w of p.weapons) if (w.type === 'drone') for (let k = 0; k < w.shots; k++) {
      const dp = dronePos(p, k);
      cx.fillStyle = '#5bd65b'; cx.beginPath(); cx.arc(dp.x, dp.y, 6, 0, 7); cx.fill();
      cx.fillStyle = '#1f6e1f'; cx.beginPath(); cx.arc(dp.x, dp.y, 2.5, 0, 7); cx.fill();
    }
    for (const w of p.weapons) if (w.type === 'saw') for (let k = 0; k < w.shots; k++) {
      const sp = sawPos(p, w, k); drawSaw(sp.x, sp.y, (w.ang || 0) * 3, !!w.explosive);
    }
    drawPapagaios(p);
    drawFilhotes(p);
    drawClones(p); // clones da Hypnos
    if (p.skin && p.skin !== 'classic') drawPlayerMark(p);
    if (p.ovoT > 0) { drawOvo(p); return; } // ovo da Fênix
    if (p.dragonT > 0) drawDragao(p, p.x, p.y, 0, p.skin, p.rastro, S.phaseT); // Dragão de água
    else drawShip(p.ship, p.x, p.y, 1, c.body, c.dark, p.tilt, false, p.skin);
    if (p.sh > 0) {
      cx.strokeStyle = 'rgba(120,230,255,' + (.25 + .5 * p.sh / Math.max(1, p.maxSh)) + ')'; cx.lineWidth = 2;
      cx.beginPath(); cx.arc(p.x, p.y, 28, 0, 7); cx.stroke();
    }
  });
  for (const b of S.bullets) {
    if (drawPirataBala(b)) continue; // âncora e armas piratas (js/visual/pirata.js)
    if (drawFenixBala(b)) continue;  // penas, meteoros e sol (js/visual/fenix.js)
    if (drawHypnosBala(b)) continue; // espirais, grito e tiros dos aliados (js/visual/hypnos.js)
    if (b.type === 'boomerang') {
      if (!(b.sk && drawSkinBoomerang(b.sk, b.x, b.y, b.rot, !!b.explo))) drawBoomerang(b.x, b.y, b.rot, b.color, !!b.explo);
    } else if (b.type === 'barrage') {
      if (!(b.sk && drawSkinShot(b.sk, b.x, b.y, Math.atan2(b.vx, -b.vy), 1.15))) drawBallistic(b.x, b.y, Math.atan2(b.vy, b.vx), b.color);
    } else if (b.type === 'ricochet') {
      cx.fillStyle = 'rgba(255,224,102,.3)'; cx.beginPath(); cx.arc(b.x, b.y, b.r + 5, 0, 7); cx.fill();
      cx.fillStyle = b.explo ? '#ffb347' : '#fff6c8'; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 7); cx.fill();
    } else if (b.type === 'missile') {
      cx.save(); cx.translate(b.x, b.y); cx.rotate(Math.atan2(b.vx, -b.vy));
      cx.fillStyle = '#ddd'; cx.fillRect(-2.5, -8, 5, 14);
      cx.fillStyle = b.color; cx.beginPath(); cx.arc(0, 8, 3, 0, 7); cx.fill();
      cx.restore();
    } else if (b.type === 'plasma') {
      cx.fillStyle = 'rgba(199,139,255,.35)'; cx.beginPath(); cx.arc(b.x, b.y, b.r + 6, 0, 7); cx.fill();
      cx.fillStyle = '#efe0ff'; cx.beginPath(); cx.arc(b.x, b.y, b.r * .6, 0, 7); cx.fill();
    } else {
      if (b.sk && drawSkinShot(b.sk, b.x, b.y, Math.atan2(b.vx, -b.vy), 1.45)) continue;
      cx.fillStyle = b.explo ? '#ffb347' : b.color;
      cx.beginPath(); cx.ellipse(b.x, b.y, b.r * .8, b.r * 1.8, Math.atan2(b.vx, -b.vy), 0, 7); cx.fill();
    }
  }
  for (const e of S.ebullets) drawEnemyShot(e);   // js/visual/tiros-inimigos.js
  for (const f of S.fx) {
    const k = f.t / f.life;
    cx.globalAlpha = 1 - k;
    if (f.type === 'boom') { cx.fillStyle = f.color; cx.beginPath(); cx.arc(f.x, f.y, f.r * (.4 + k * .8), 0, 7); cx.fill(); cx.fillStyle = '#fff6c0'; cx.beginPath(); cx.arc(f.x, f.y, f.r * .3 * (1 - k), 0, 7); cx.fill(); }
    else if (f.type === 'bolt') {
      cx.lineJoin = 'round';
      for (const [lw, col] of [[6, 'rgba(120,200,255,.45)'], [2, '#f0fbff']]) {
        cx.strokeStyle = col; cx.lineWidth = lw; cx.beginPath();
        for (let i = 0; i < f.pts.length - 1; i++) {
          const a = f.pts[i], c = f.pts[i + 1];
          if (i === 0) cx.moveTo(a.x, a.y);
          for (let s = 1; s <= 4; s++) { const u = s / 4, j = s < 4 ? rnd(-9, 9) : 0; cx.lineTo(a.x + (c.x - a.x) * u + j, a.y + (c.y - a.y) * u + j * .6); }
        }
        cx.stroke();
      }
      cx.lineJoin = 'miter';
    }
    else if (f.type === 'trail') drawTrail(f, k);
    else if (f.type === 'smoke') { cx.fillStyle = 'rgba(210,210,210,.55)'; cx.beginPath(); cx.arc(f.x, f.y, f.r * (1 + k * 2.2), 0, 7); cx.fill(); }
    else if (f.type === 'ring') { cx.strokeStyle = f.color; cx.lineWidth = 3; cx.beginPath(); cx.arc(f.x, f.y, f.r * (.3 + k * .7), 0, 7); cx.stroke(); }
    else { cx.fillStyle = f.color; cx.fillRect(f.x - 2, f.y - 2, 4, 4); }
    cx.globalAlpha = 1;
  }
  drawClouds();
  cx.restore();
  drawHud();
}
function txt(s, x, y, size, color, align, weight) {
  cx.font = (weight || 600) + ' ' + size + 'px system-ui,-apple-system,"Segoe UI",sans-serif';
  cx.fillStyle = color; cx.textAlign = align || 'left'; cx.textBaseline = 'alphabetic';
  cx.fillText(s, x, y);
}
function wrap(s, x, y, maxW, lh) {
  const words = s.split(' '); let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (cx.measureText(t).width > maxW && line) { cx.fillText(line, x, y); y += lh; line = w; } else line = t;
  }
  if (line) cx.fillText(line, x, y);
  return y + lh;
}
function bar(x, y, w, h, v, color, bg) {
  cx.fillStyle = bg || 'rgba(0,0,0,.45)'; cx.fillRect(x, y, w, h);
  cx.fillStyle = color; cx.fillRect(x, y, w * clamp(v, 0, 1), h);
}
function drawHud() {
  cx.fillStyle = 'rgba(8,20,32,.55)'; cx.fillRect(0, 0, W, 50);
  txt('Fase ' + S.phase + ' · ' + SCENES[S.scene].name, 14, 24, 17, '#fff');
  txt('Nível ' + S.level, W - 14, 24, 17, '#7dff8a', 'right');
  txt('Abates ' + S.kills, W / 2, 24, 14, '#cfe3f5', 'center', 500);
  bar(0, 34, W, 7, S.xp / S.xpNext, '#7dff8a');
  if (S.bosses.length) {
    let hp = 0, mx = 0; for (const b of S.bosses) { hp += Math.max(0, b.hp); mx += b.maxHp; }
    { const bw = Math.min(W - 120, 800); bar((W - bw) / 2, 58, bw, 10, hp / mx, '#ff4a4a'); }
    txt(S.bossName, W / 2, 84, 13, '#ffd0d0', 'center', 600);
  } else if (!S.bossSpawned) {
    bar(14, 44, W - 28, 3, S.phaseT / PHASE_LEN, '#ffcf60', 'rgba(0,0,0,.25)');
  }
  S.players.forEach((p, i) => {
    // lista de armas em linhas de até 170 px (a caixa cresce para cima)
    cx.font = '500 11px system-ui,-apple-system,"Segoe UI",sans-serif';
    const linhas = [];
    for (const nome of p.weapons.map(w => WEAPONS[w.type].name.split(' ')[0] + (w.lvl > 1 ? ' +' + (w.lvl - 1) : ''))) {
      const l = linhas.length ? linhas[linhas.length - 1] + ' · ' + nome : nome;
      if (linhas.length && cx.measureText(l).width <= 170) linhas[linhas.length - 1] = l; else linhas.push(nome);
    }
    const x = i === 0 ? 12 : W - 182, y = H - 52 - (linhas.length - 1) * 13;
    cx.fillStyle = 'rgba(8,20,32,.55)'; cx.fillRect(x - 4, y - 18, 178, 64 + (linhas.length - 1) * 13);
    txt(PCOL[i].name + ' · ' + SHIPS[p.ship].name + (p.alive ? (p.ovoT > 0 ? ' – renascendo' : '') : ' – abatido'), x, y - 4, 12, PCOL[i].body);
    if (SHIPS[p.ship].renascer) drawRenascerIcone(x + 160, y - 9, renascerDisponivel(p));
    bar(x, y + 2, 170, 9, p.ovoT > 0 ? 1 - p.ovoT / p.ovoMax : p.hp / p.maxHp, p.ovoT > 0 ? '#ffb347' : p.dragonT > 0 ? '#6fd6ff' : '#4cd964');
    if (p.maxSh > 0) bar(x, y + 13, 170, 4, p.sh / p.maxSh, '#78e6ff');
    linhas.forEach((l, k) => txt(l, x, y + 32 + k * 13, 11, '#cfe3f5', 'left', 500));
  });
  drawSkinToast();
  if (S.banner) {
    cx.globalAlpha = clamp(S.banner.t, 0, 1);
    txt(S.banner.text, W / 2, H / 2 - 60, 38, '#fff', 'center', 800);
    cx.globalAlpha = 1;
  }
}
function drawSel() {
  cx.fillStyle = 'rgba(5,12,22,.78)'; cx.fillRect(0, 0, W, H);
  const s = S.sel, L = selLayout();
  const boss = s.kind === 'boss';
  txt(boss ? 'Chefão derrotado!' : 'Nível ' + S.level + '!', W / 2, boss ? 66 : 72, 30, boss ? '#ffd36b' : '#7dff8a', 'center', 800);
  if (boss) txt('Escolha 1 recompensa: nova arma ou melhoria forte', W / 2, 94, 14, '#e8eef5', 'center', 500);
  for (let pi = 0; pi < S.np; pi++) {
    const P = L.panels[pi], top = P.top, c = PCOL[pi];
    const hint = S.np === 1 ? '←/→ ou A/D e Enter/Espaço · ou 1, 2, 3' : (pi === 0 ? 'A/D + Espaço · ou 1, 2, 3' : '←/→ + Enter · ou Num 1, 2, 3');
    txt(c.name, P.x, top + 26, 16, c.body);
    txt(s.done[pi] ? 'Pronto' : hint, P.x + P.w, top + 26, 12, s.done[pi] ? '#7dff8a' : '#9fb3c8', 'right', 500);
    if (!s.opts[pi]) { txt('Abatido – volta ao fim da fase', P.x + P.w / 2, top + 120, 15, '#9fb3c8', 'center', 500); }
  }
  for (const card of L.cards) {
    const o = s.opts[card.pi][card.j], c = PCOL[card.pi];
    const sel = s.cur[card.pi] === card.j, done = s.done[card.pi], chosen = done && s.chosen && s.chosen[card.pi] === card.j;
    cx.globalAlpha = done && !chosen ? .35 : 1;
    cx.fillStyle = boss ? '#2a2412' : '#14263a';
    roundRect(card.x, card.y, card.w, card.h, 12); cx.fill();
    cx.lineWidth = sel ? 3 : 1.2;
    cx.strokeStyle = sel ? c.body : (boss ? '#8a6d2a' : '#3a5672');
    roundRect(card.x, card.y, card.w, card.h, 12); cx.stroke();
    const px = card.x + 12, mw = card.w - 24;
    let y = card.y + 28;
    txt(String(card.j + 1), card.x + card.w - 14, y, 13, '#7f93a8', 'right', 600);
    if (!boss) {
      cx.font = '700 17px system-ui,sans-serif'; cx.fillStyle = '#fff'; cx.textAlign = 'left';
      y = wrap(o.name, px, y + 14, mw, 21);
      cx.font = '400 13px system-ui,sans-serif'; cx.fillStyle = '#b8c8d8';
      wrap(o.desc, px, y + 8, mw, 17);
    } else {
      const isNew = o.kind === 'new';
      txt(isNew ? 'Nova arma' : 'Melhoria de arma', px, y, 12, isNew ? '#ffd36b' : '#ff9f6b', 'left', 700);
      cx.font = '700 18px system-ui,sans-serif'; cx.fillStyle = '#fff'; cx.textAlign = 'left';
      y = wrap(isNew ? WEAPONS[o.type].name : o.u.name(o.w), px, y + 30, mw, 22);
      cx.font = '400 13px system-ui,sans-serif'; cx.fillStyle = '#d8ccb0';
      if (!isNew) { txt(WEAPONS[o.w.type].name, px, y + 4, 13, '#ffd36b', 'left', 600); y += 24; cx.font = '400 13px system-ui,sans-serif'; cx.fillStyle = '#d8ccb0'; }
      wrap(isNew ? WEAPONS[o.type].desc : o.u.desc(o.w), px, y + 6, mw, 17);
    }
    if (chosen) txt('Escolhido', card.x + card.w / 2, card.y + card.h - 16, 14, '#7dff8a', 'center', 700);
    cx.globalAlpha = 1;
  }
}
function roundRect(x, y, w, h, r) {
  cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r);
  cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath();
}
function drawTitle() {
  drawBg();
  const tx = Math.min(110, (W - 90) / 5), ts = Math.min(1, tx / 100); // 6 naves: menores em tela estreita
  drawShip(1, W / 2 - 2.5 * tx, 352 + Math.sin(titleT * 2 + 2) * 8, 1.55 * ts, '#5fbf9f', '#2a6b55', 0);
  drawShip(0, W / 2 - 1.5 * tx, 336 + Math.sin(titleT * 2) * 8, 1.7 * ts, PCOL[0].body, PCOL[0].dark, 0);
  drawShip(4, W / 2 - .5 * tx, 326 + Math.sin(titleT * 2 + 4) * 8, 1.85 * ts, FENIX_TITULO[0], FENIX_TITULO[1], 0);
  drawShip(5, W / 2 + .5 * tx, 326 + Math.sin(titleT * 2 + 5) * 8, 1.85 * ts, HYPNOS_TITULO[0], HYPNOS_TITULO[1], 0);
  drawShip(3, W / 2 + 1.5 * tx, 336 + Math.sin(titleT * 2 + 3) * 8, 1.7 * ts, PIRATA_TITULO[0], PIRATA_TITULO[1], 0);
  drawShip(2, W / 2 + 2.5 * tx, 352 + Math.sin(titleT * 2 + 1) * 8, 1.55 * ts, PCOL[1].body, PCOL[1].dark, 0);
  drawClouds();
  cx.fillStyle = 'rgba(5,12,22,.8)'; cx.fillRect(0, 130, W, 120);
  txt('Esquadrilha', W / 2, 200, 52, '#fff', 'center', 800);
  txt('pai e filho', W / 2, 232, 18, '#ffd36b', 'center', 600);
  for (const [i, label] of [[0, '1 jogador'], [1, '2 jogadores']]) {
    const w = Math.min(W / 2 - 40, 230), x = i ? W / 2 + 10 : W / 2 - 10 - w;
    cx.fillStyle = i ? PCOL[1].dark : PCOL[0].dark; roundRect(x, 470, w, 60, 12); cx.fill();
    txt(label, x + w / 2, 507, 20, '#fff', 'center', 700);
    txt('tecla ' + (i + 1) + (padQtd ? (i ? ' ou Y' : ' ou A') : ''), x + w / 2, 550, 12, '#cfe3f5', 'center', 500);
  }
  cx.fillStyle = 'rgba(5,12,22,.85)'; cx.fillRect(W / 2 - Math.min(W / 2 - 20, 260), 586, Math.min(W - 40, 520), 262);
  const lines = [
    'Naves: Falcão, Bumerangue, Artilheiro, Âncora Negra, Fênix e Hypnos.',
    'Tiro automático. Desvie e colete os cristais verdes (XP).',
    'Jogador 1: W A S D        Jogador 2: setas',
    'Cada nível: escolha 1 de 3 melhorias.',
    'Fim da fase: chefão. Derrotando, escolha nova arma',
    'ou uma melhoria forte de arma.',
    padQtd ? 'Controle: analógico move · A confirma · Start pausa · Select som' : 'P ou Esc: pausa    F: tela cheia    M: som',
    'Celular: arraste para mover',
  ];
  lines.forEach((l, k) => txt(l, W / 2, 618 + k * 29, 14, k === 0 ? '#ffd36b' : '#e8eef5', 'center', 500));
  const ps = padStatus(); if (ps) txt(ps, W / 2, 572, 12, '#9fe3b0', 'center', 600);
  const vt = versaoTexto(); cx.font = '500 12px system-ui, sans-serif'; const vl = cx.measureText(vt).width + 16;
  cx.fillStyle = 'rgba(5,12,22,.6)'; roundRect(W - vl - 8, H - 31, vl, 22, 8); cx.fill();
  txt(vt, W - 16, H - 15, 12, 'rgba(232,238,245,.85)', 'right', 500);
}
function draw() {
  cx.clearRect(0, 0, W, H);
  if (S.mode === 'title') { drawTitle(); drawSomBotao(); return; }
  if (S.mode === 'ship') { drawShipSelect(); return; }
  drawGame();
  if (S.mode === 'levelup' || S.mode === 'reward') drawSel();
  if (S.mode === 'paused') drawMenu();
  if (S.mode === 'gameover') {
    cx.fillStyle = 'rgba(5,12,22,.75)'; cx.fillRect(0, 0, W, H);
    txt('Fim de jogo', W / 2, H / 2 - 40, 44, '#fff', 'center', 800);
    txt('Fase ' + S.phase + ' · Nível ' + S.level + ' · ' + S.kills + ' abates', W / 2, H / 2, 17, '#ffd36b', 'center', 600);
    S.players.forEach((p, i) => txt(PCOL[i].name + ' (' + SHIPS[p.ship].name + '): ' + p.kills + ' abates', W / 2, H / 2 + 34 + i * 24, 14, PCOL[i].body, 'center', 600));
    txt('Espaço, Enter ou toque para voltar', W / 2, H / 2 + 110, 14, '#cfe3f5', 'center', 500);
  }
  drawSomBotao();
}
