// ---------- Tela de escolha de nave ----------
// S.ss = { who: [índices dos jogadores que escolhem], cur, done, lock, add }
function openShipSelect(np) {
  S = { mode: 'ship', np, ss: { who: [...Array(np).keys()], cur: [0, 0], done: [false, false], pick: [0, 0], skin: [skinLast(0), skinLast(1)], lock: .3, add: false } };
}
function openShipAdd() {
  S.prevMode = 'paused';
  S.mode = 'ship';
  S.ss = { who: [1], cur: [0, 0], done: [false, false], pick: [0, 0], skin: ['classic', skinLast(1)], lock: .3, add: true };
}
function shipLayout() {
  const ss = S.ss, out = [], panels = [];
  const n = ss.who.length, side = n === 2 && W >= 1000, N = SHIPS.length, largo = N > 4, larg6 = N > 5; // 5 ou 6 naves: painel mais largo
  for (let k = 0; k < n; k++) {
    const pi = ss.who[k];
    let x, w, top, ch;
    if (n === 1) { w = Math.min(W - 40, larg6 ? 1100 : largo ? 900 : 760); x = (W - w) / 2; top = H / 2 - 240; ch = 325; }
    else if (side) { w = Math.min(W / 2 - 40, larg6 ? 1040 : largo ? 860 : 680); x = pi ? W / 2 + 20 : W / 2 - 20 - w; top = H / 2 - 240; ch = 325; }
    else { w = W - 40; x = 20; top = pi ? 466 : 96; ch = 286; }
    panels.push({ pi, x, w, top });
    let cols = N, cw = (w - 12 * (N - 1)) / N, chh = ch;
    if ((cw < 150 && n === 1) || (cw < 140 && side)) { // tela estreita: 2 linhas (2 ou 3 colunas), cartão sem a descrição
      cols = Math.ceil(N / 2); cw = (w - 12 * (cols - 1)) / cols; chh = 236; top = Math.max(60, top - 120); panels[panels.length - 1].top = top;
    }
    for (let j = 0; j < N; j++) {
      const c = j % cols, l = Math.floor(j / cols);
      out.push({ pi, j, x: x + c * (cw + 12), y: top + 36 + l * (chh + 12), w: cw, h: chh });
    }
  }
  return { cards: out, panels, compact: n === 2 && !side };
}
function shipChoose(pi, j) {
  const ss = S.ss;
  if (!ss || ss.lock > 0 || ss.done[pi] || !ss.who.includes(pi)) return;
  ss.cur[pi] = j; ss.pick[pi] = j; ss.done[pi] = true;
  if (ss.who.every(i => ss.done[i])) ss.closeT = .45;
}
function shipFinish() {
  const ss = S.ss;
  for (const pi of ss.who) skinRemember(pi, ss.skin[pi]);
  if (ss.add) { S.ss = null; addPlayer2(ss.pick[1], ss.skin[1]); }
  else newGame(S.np, ss.pick.slice(0, S.np), ss.skin.slice(0, S.np));
}
function shipBack() {
  if (S.ss.add) { S.ss = null; S.mode = 'paused'; }
  else S = { mode: 'title' };
}
function shipKey(code) {
  const ss = S.ss;
  if (code === 'Escape') { shipBack(); return; }
  if (ss.lock > 0) return;
  if (skinKey(code)) return;
  const single = ss.who.length === 1;
  const maps = {
    0: { l: ['KeyA'], r: ['KeyD'], ok: ['Space'], d: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'] },
    1: { l: ['ArrowLeft'], r: ['ArrowRight'], ok: ['Enter', 'NumpadEnter'], d: ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6'] },
  };
  for (const pi of ss.who) {
    if (ss.done[pi]) continue;
    let m = maps[pi];
    if (single) m = { l: maps[0].l.concat(maps[1].l), r: maps[0].r.concat(maps[1].r), ok: maps[0].ok.concat(maps[1].ok), d: maps[0].d.concat(maps[1].d) };
    const N = SHIPS.length;
    if (m.l.includes(code)) ss.cur[pi] = (ss.cur[pi] + N - 1) % N;
    if (m.r.includes(code)) ss.cur[pi] = (ss.cur[pi] + 1) % N;
    if (m.ok.includes(code)) shipChoose(pi, ss.cur[pi]);
    const di = m.d.indexOf(code);
    if (di >= 0 && di % 6 < N) shipChoose(pi, di % 6);
  }
}
function stepShip(dt) {
  const ss = S.ss;
  if (ss.lock > 0) ss.lock -= dt;
  if (ss.info) { ss.info.t -= dt; if (ss.info.t <= 0) ss.info = null; }
  if (ss.closeT !== undefined) { ss.closeT -= dt; if (ss.closeT <= 0) shipFinish(); }
}
function drawShipSelect() {
  const ss = S.ss;
  if (ss.add) drawGame(); else { drawBg(); drawClouds(); }
  cx.fillStyle = 'rgba(5,12,22,.8)'; cx.fillRect(0, 0, W, H);
  const L = shipLayout();
  const title = ss.add ? 'Jogador 2: escolha sua nave' : 'Escolha sua nave';
  txt(title, W / 2, L.compact ? 50 : L.panels[0].top - 30, 30, '#fff', 'center', 800);
  for (const P of L.panels) {
    const c = PCOL[P.pi], single = ss.who.length === 1;
    const nn = SHIPS.length, hint = single ? '←/→ ou A/D e Enter/Espaço · ou 1 a ' + nn + ' · clique' : (P.pi === 0 ? 'A/D + Espaço · ou 1 a ' + nn : '←/→ + Enter · ou Num 1 a ' + nn);
    txt(c.name, P.x, P.top + 22, 16, c.body);
    txt(ss.done[P.pi] ? 'Pronto' : hint, P.x + P.w, P.top + 22, 12, ss.done[P.pi] ? '#7dff8a' : '#9fb3c8', 'right', 500);
  }
  for (const card of L.cards) {
    const sh = SHIPS[card.j], c = PCOL[card.pi];
    const sel = ss.cur[card.pi] === card.j, done = ss.done[card.pi], chosen = done && ss.pick[card.pi] === card.j;
    cx.globalAlpha = done && !chosen ? .35 : 1;
    cx.fillStyle = sel ? '#183553' : '#14263a'; roundRect(card.x, card.y, card.w, card.h, 12); cx.fill();
    cx.strokeStyle = sel ? c.body : '#3a5672'; cx.lineWidth = sel ? 3 : 1.2; roundRect(card.x, card.y, card.w, card.h, 12); cx.stroke();
    const cxm = card.x + card.w / 2, px = card.x + 12, mw = card.w - 24;
    // prévia da nave com tiro animado
    const py = card.y + 62;
    drawShipPreview(card.j, cxm, py, card.w);
    drawShip(card.j, cxm, py, Math.min(1.5, (card.w - 6) / 74), c.body, c.dark, sel ? Math.sin(titleT * 3) * .3 : 0, false, ss.skin[card.pi]);
    let y = card.y + 120;
    txt(sh.name, cxm, y, Math.min(19, card.w / 7.2), '#fff', 'center', 800);
    txt(sh.tag, cxm, y + 18, 12, '#ffd36b', 'center', 600);
    y += 40;
    const barW = Math.min(mw - 76, 110);
    if (card.w >= 140) for (const [lab, v] of sh.stats) { // cartão estreito: só nave, nome e tipo
      txt(lab, px, y, 12, '#b8c8d8', 'left', 500);
      for (let k = 0; k < 5; k++) {
        cx.fillStyle = k < v ? c.body : 'rgba(255,255,255,.12)';
        cx.fillRect(px + mw - barW + k * (barW / 5), y - 9, barW / 5 - 3, 9);
      }
      y += 18;
    }
    cx.font = '400 12.5px system-ui,sans-serif'; cx.fillStyle = '#d6e2ee'; cx.textAlign = 'left';
    if (card.h >= 280 && card.w >= 140) wrap(card.w < 200 ? sh.short : sh.desc, px, y + 10, mw, 16);
    txt(String(card.j + 1), card.x + card.w - 10, card.y + 18, 12, '#7f93a8', 'right', 600);
    if (chosen) txt('Escolhida', cxm, card.y + card.h - 12, 14, '#7dff8a', 'center', 700);
    cx.globalAlpha = 1;
  }
  drawSkinBars(L);
  const bottom = Math.max(...skinBars(L).map(b => b.y + b.h));
  txt('Esc: voltar', W / 2, Math.min(H - 14, bottom + 26), 12, '#9fb3c8', 'center', 500);
}
// pequena animação do tiro de cada nave acima da prévia
function drawShipPreview(j, x, y, cw) {
  const t = titleT, top = y - 52;
  cx.save();
  cx.beginPath(); cx.rect(x - cw / 2 + 4, top - 6, cw - 8, 70); cx.clip();
  if (j === 0) {
    cx.fillStyle = '#fff4a0';
    for (let k = 0; k < 4; k++) { const yy = y - 20 - ((t * 260 + k * 18) % 72); cx.beginPath(); cx.ellipse(x, yy, 2.4, 6, 0, 0, 7); cx.fill(); }
  } else if (j === 1) {
    const ph = (t * .9) % 1, d = Math.sin(ph * Math.PI) * 16;
    drawBoomerang(x + Math.sin(ph * Math.PI * 2) * 16, y - 28 - d, t * 16, '#7ff0c8', false);
  } else if (j === 3) {
    drawPirataPreview(x, y - 20);
  } else if (j === 4) {
    drawFenixPreview(x, y - 20);
  } else if (j === 5) {
    drawHypnosPreview(x, y - 20);
  } else {
    for (let k = 0; k < 5; k++) {
      const ph = (t * 1.1 + k * .09) % 1, s = k % 2 ? 1 : -1;
      const mx = x + s * (10 + (k >> 1) * 5) + (k - 2) * ph * 6, my = y - 10 - ph * ph * 42;
      if (ph > .92) { cx.fillStyle = 'rgba(255,176,64,.7)'; cx.beginPath(); cx.arc(mx, my, 8, 0, 7); cx.fill(); }
      else drawBallistic(mx, my, -Math.PI / 2 + (k - 2) * .045, '#ffcf60');
    }
  }
  cx.restore();
}

// ---------- Hangar: escolha da skin na tela de nave ----------
function skinKey(code) {
  const ss = S.ss, single = ss.who.length === 1;
  const up = { 0: ['KeyW'], 1: ['ArrowUp'] }, dn = { 0: ['KeyS'], 1: ['ArrowDown'] };
  for (const pi of ss.who) {
    if (ss.done[pi]) continue;
    const u = single ? up[0].concat(up[1]) : up[pi], d = single ? dn[0].concat(dn[1]) : dn[pi];
    if (u.includes(code)) { ss.skin[pi] = skinCycle(ss.skin[pi], -1); ss.info = null; return true; }
    if (d.includes(code)) { ss.skin[pi] = skinCycle(ss.skin[pi], 1); ss.info = null; return true; }
  }
  return false;
}
function skinBars(L) {
  // L: shipLayout(); devolve a faixa de skins de cada painel
  return L.panels.map(P => {
    const top = Math.max(...L.cards.filter(c => c.pi === P.pi).map(c => c.y + c.h)) + (L.compact ? 6 : 14);
    return { pi: P.pi, x: P.x, w: P.w, y: top, h: L.compact ? 32 : 96, compact: L.compact };
  });
}
function skinThumbs(b) {
  const n = SKINS.length, gap = 6, sz = Math.min(46, (b.w - 24 - gap * (n - 1)) / n);
  const x0 = b.x + (b.w - (sz * n + gap * (n - 1))) / 2;
  return SKINS.map((sk, i) => ({ sk, x: x0 + i * (sz + gap), y: b.y + 44, s: sz }));
}
function skinClick(g) {
  const ss = S.ss; if (!ss || !ss.skin) return false;
  for (const b of skinBars(shipLayout())) {
    if (ss.done[b.pi] || g.y < b.y || g.y > b.y + b.h || g.x < b.x || g.x > b.x + b.w) continue;
    if (b.compact) { ss.skin[b.pi] = skinCycle(ss.skin[b.pi], g.x < b.x + b.w / 2 ? -1 : 1); return true; }
    for (const t of skinThumbs(b)) if (g.x > t.x && g.x < t.x + t.s && g.y > t.y && g.y < t.y + t.s) {
      if (skinUnlocked(t.sk.id)) { ss.skin[b.pi] = t.sk.id; ss.info = null; }
      else ss.info = { pi: b.pi, t: 3, text: 'Bloqueada · ' + t.sk.how };
      return true;
    }
    return true;
  }
  return false;
}
function drawLock(x, y, s) {
  cx.strokeStyle = '#cfd6de'; cx.lineWidth = s * .14; cx.beginPath(); cx.arc(x, y - s * .12, s * .22, Math.PI, 0); cx.stroke();
  cx.fillStyle = '#cfd6de'; roundRect(x - s * .32, y - s * .1, s * .64, s * .46, s * .08); cx.fill();
  cx.fillStyle = '#1c1822'; cx.beginPath(); cx.arc(x, y + s * .1, s * .07, 0, TAU); cx.fill();
}
function drawSkinBars(L) {
  const ss = S.ss;
  for (const b of skinBars(L)) {
    const sk = skinById(ss.skin[b.pi]), rar = RARITY[sk.rar], done = ss.done[b.pi], single = ss.who.length === 1;
    const keys = single ? 'W/S ou ↑/↓' : (b.pi === 0 ? 'W/S' : '↑/↓');
    cx.globalAlpha = done ? .55 : 1;
    cx.fillStyle = '#1c1822'; roundRect(b.x, b.y, b.w, b.h, 12); cx.fill();
    cx.strokeStyle = rar[1]; cx.lineWidth = 2; roundRect(b.x, b.y, b.w, b.h, 12); cx.stroke();
    if (b.compact) {
      txt('◀', b.x + 14, b.y + 22, 14, '#cfe3f5', 'left', 700); txt('▶', b.x + b.w - 14, b.y + 22, 14, '#cfe3f5', 'right', 700);
      txt('Skin: ' + sk.name, b.x + b.w / 2, b.y + 21, 14, rar[1], 'center', 700);
    } else {
      txt('Skin', b.x + 14, b.y + 26, 13, '#9fb3c8', 'left', 600);
      txt(sk.name, b.x + 54, b.y + 27, 17, '#fff', 'left', 800);
      const info = ss.info && ss.info.pi === b.pi ? ss.info.text : rar[0] + ' · ' + keys + ' troca';
      txt(info, b.x + b.w - 14, b.y + 26, 12, ss.info && ss.info.pi === b.pi ? '#ffb0b0' : rar[1], 'right', 600);
      const ship = ss.cur[b.pi];
      for (const t of skinThumbs(b)) {
        const sel = t.sk.id === ss.skin[b.pi], ok = skinUnlocked(t.sk.id), rc = RARITY[t.sk.rar][1];
        cx.fillStyle = sel ? '#3a3046' : '#2a2433'; roundRect(t.x, t.y, t.s, t.s, 8); cx.fill();
        cx.strokeStyle = sel ? '#fff' : rc; cx.lineWidth = sel ? 2.5 : 1.2; roundRect(t.x, t.y, t.s, t.s, 8); cx.stroke();
        cx.save(); cx.beginPath(); cx.rect(t.x + 1, t.y + 1, t.s - 2, t.s - 2); cx.clip();
        if (!ok) cx.globalAlpha *= .35;
        drawShip(ship, t.x + t.s / 2, t.y + t.s / 2 + 1, t.s / 74, PCOL[b.pi].body, PCOL[b.pi].dark, 0, false, t.sk.id);
        cx.restore();
        if (!ok) drawLock(t.x + t.s / 2, t.y + t.s / 2, t.s * .5);
      }
    }
    cx.globalAlpha = 1;
  }
}

