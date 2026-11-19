// ---------- Naves ----------
// stats: 0 a 5 pontos, só para mostrar na tela de escolha
const SHIPS = [
  { id: 'falcon', name: 'Falcão', weapon: 'gun', rate: 1.25, tag: 'Nave base',
    desc: 'Tiro reto e rápido. Começa com +25% de velocidade de ataque.',
    short: 'Tiro reto e rápido. +25% de velocidade de ataque.',
    stats: [['Dano', 4], ['Cadência', 5], ['Perfuração', 1], ['Área', 0]] },
  { id: 'boomer', name: 'Bumerangue', weapon: 'boomerang', rate: 1, tag: 'Atravessa tudo',
    desc: 'Lança um disco que atravessa todos os inimigos, faz a curva e volta para a nave acertando de novo. Dano um pouco menor.',
    short: 'Atravessa todos os inimigos e volta acertando de novo. Dano menor.',
    stats: [['Dano', 3], ['Cadência', 3], ['Perfuração', 5], ['Área', 0]] },
  { id: 'artillery', name: 'Artilheiro', weapon: 'barrage', rate: 1, tag: 'Saraivada',
    desc: 'Dispara uma saraivada de mísseis balísticos em linha reta. Dano baixo por míssil, com pequena explosão em área.',
    short: 'Saraivada de mísseis em linha reta, com pequena explosão.',
    stats: [['Dano', 2], ['Cadência', 4], ['Perfuração', 1], ['Área', 4]] },
];

function drawShip(shipIdx, x, y, s, c1, c2, tilt, flash, skin) {
  if (skin && skin !== 'classic' && !flash && drawSkinShip(shipIdx, skin, x, y, s, tilt)) return;
  const id = SHIPS[shipIdx || 0].id;
  if (id === 'falcon') return drawPlane(x, y, s, c1, c2, false, tilt, flash);
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  const body = flash ? '#fff' : c1, dk = flash ? '#fff' : c2;
  const fl = 5 + Math.sin(performance.now() / 40) * 2;
  if (id === 'boomer') {
    // chama do motor
    cx.fillStyle = '#ffb347'; cx.beginPath(); cx.moveTo(-4, 15); cx.lineTo(4, 15); cx.lineTo(0, 16 + fl * 1.6); cx.closePath(); cx.fill();
    // asa delta
    cx.fillStyle = body;
    cx.beginPath(); cx.moveTo(0, -24); cx.lineTo(23, 14); cx.lineTo(8, 10); cx.lineTo(0, 16); cx.lineTo(-8, 10); cx.lineTo(-23, 14); cx.closePath(); cx.fill();
    cx.fillStyle = dk;
    cx.beginPath(); cx.moveTo(0, -14); cx.lineTo(7, 9); cx.lineTo(0, 13); cx.lineTo(-7, 9); cx.closePath(); cx.fill();
    // lançador de disco nas pontas
    cx.fillStyle = flash ? '#fff' : '#7ff0c8';
    cx.beginPath(); cx.arc(-17, 10, 3.5, 0, 7); cx.arc(17, 10, 3.5, 0, 7); cx.fill();
    cx.fillStyle = flash ? '#fff' : '#bfe6ff'; cx.beginPath(); cx.ellipse(0, -6, 3, 6, 0, 0, 7); cx.fill();
  } else {
    // artilheiro: bimotor de cauda dupla com casulos de mísseis
    cx.fillStyle = '#ffb347';
    for (const sx of [-13, 13]) { cx.beginPath(); cx.moveTo(sx - 2.5, 19); cx.lineTo(sx + 2.5, 19); cx.lineTo(sx, 19 + fl); cx.closePath(); cx.fill(); }
    cx.fillStyle = body; cx.fillRect(-28, -3, 56, 10);
    cx.fillStyle = dk;
    cx.fillRect(-16, -12, 6, 31); cx.fillRect(10, -12, 6, 31); cx.fillRect(-16, 15, 32, 4);
    cx.beginPath(); cx.ellipse(0, 0, 6.5, 17, 0, 0, 7); cx.fill();
    // casulos de mísseis
    for (const sx of [-24, -20, 20, 24]) {
      cx.fillStyle = flash ? '#fff' : '#e8e8e8'; cx.fillRect(sx - 1.5, -9, 3, 9);
      cx.fillStyle = flash ? '#fff' : '#e74c3c'; cx.fillRect(sx - 1.5, -11, 3, 3);
    }
    cx.fillStyle = flash ? '#fff' : '#bfe6ff'; cx.beginPath(); cx.ellipse(0, -7, 3, 5, 0, 0, 7); cx.fill();
  }
  cx.restore();
}

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
  const n = ss.who.length, side = n === 2 && W >= 1000;
  for (let k = 0; k < n; k++) {
    const pi = ss.who[k];
    let x, w, top, ch;
    if (n === 1) { w = Math.min(W - 40, 760); x = (W - w) / 2; top = H / 2 - 240; ch = 325; }
    else if (side) { w = Math.min(W / 2 - 40, 680); x = pi ? W / 2 + 20 : W / 2 - 20 - w; top = H / 2 - 240; ch = 325; }
    else { w = W - 40; x = 20; top = pi ? 466 : 96; ch = 286; }
    panels.push({ pi, x, w, top });
    const cw = (w - 24) / 3;
    for (let j = 0; j < 3; j++) out.push({ pi, j, x: x + j * (cw + 12), y: top + 36, w: cw, h: ch });
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
    0: { l: ['KeyA'], r: ['KeyD'], ok: ['Space'], d: ['Digit1', 'Digit2', 'Digit3'] },
    1: { l: ['ArrowLeft'], r: ['ArrowRight'], ok: ['Enter', 'NumpadEnter'], d: ['Numpad1', 'Numpad2', 'Numpad3'] },
  };
  for (const pi of ss.who) {
    if (ss.done[pi]) continue;
    let m = maps[pi];
    if (single) m = { l: maps[0].l.concat(maps[1].l), r: maps[0].r.concat(maps[1].r), ok: maps[0].ok.concat(maps[1].ok), d: maps[0].d.concat(maps[1].d) };
    if (m.l.includes(code)) ss.cur[pi] = (ss.cur[pi] + 2) % 3;
    if (m.r.includes(code)) ss.cur[pi] = (ss.cur[pi] + 1) % 3;
    if (m.ok.includes(code)) shipChoose(pi, ss.cur[pi]);
    const di = m.d.indexOf(code);
    if (di >= 0) shipChoose(pi, di % 3);
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
    const hint = single ? '←/→ ou A/D e Enter/Espaço · ou 1, 2, 3 · clique' : (P.pi === 0 ? 'A/D + Espaço · ou 1, 2, 3' : '←/→ + Enter · ou Num 1, 2, 3');
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
    drawShip(card.j, cxm, py, 1.5, c.body, c.dark, sel ? Math.sin(titleT * 3) * .3 : 0, false, ss.skin[card.pi]);
    let y = card.y + 120;
    txt(sh.name, cxm, y, 19, '#fff', 'center', 800);
    txt(sh.tag, cxm, y + 18, 12, '#ffd36b', 'center', 600);
    y += 40;
    const barW = Math.min(mw - 76, 110);
    for (const [lab, v] of sh.stats) {
      txt(lab, px, y, 12, '#b8c8d8', 'left', 500);
      for (let k = 0; k < 5; k++) {
        cx.fillStyle = k < v ? c.body : 'rgba(255,255,255,.12)';
        cx.fillRect(px + mw - barW + k * (barW / 5), y - 9, barW / 5 - 3, 9);
      }
      y += 18;
    }
    cx.font = '400 12.5px system-ui,sans-serif'; cx.fillStyle = '#d6e2ee'; cx.textAlign = 'left';
    wrap(card.w < 200 ? sh.short : sh.desc, px, y + 10, mw, 16);
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
function drawBoomerang(x, y, rot, color, explo) {
  cx.save(); cx.translate(x, y); cx.rotate(rot);
  cx.fillStyle = 'rgba(127,240,200,.18)'; cx.beginPath(); cx.arc(0, 0, 14, 0, 7); cx.fill();
  cx.strokeStyle = explo ? '#ffb347' : color; cx.lineWidth = 5; cx.lineCap = 'round'; cx.lineJoin = 'round';
  cx.beginPath(); cx.moveTo(-11, 6); cx.quadraticCurveTo(-3, -1, 0, -8); cx.quadraticCurveTo(3, -1, 11, 6); cx.stroke();
  cx.lineCap = 'butt'; cx.lineJoin = 'miter';
  cx.restore();
}
function drawBallistic(x, y, ang, color) {
  cx.save(); cx.translate(x, y); cx.rotate(ang + Math.PI / 2);
  cx.fillStyle = '#ffcf60'; cx.beginPath(); cx.moveTo(-2, 6); cx.lineTo(2, 6); cx.lineTo(0, 11 + Math.random() * 4); cx.closePath(); cx.fill();
  cx.fillStyle = '#e8e8e8'; cx.fillRect(-1.8, -5, 3.6, 11);
  cx.fillStyle = '#e74c3c'; cx.beginPath(); cx.moveTo(-1.8, -5); cx.lineTo(1.8, -5); cx.lineTo(0, -9); cx.closePath(); cx.fill();
  cx.fillStyle = '#9aa'; cx.fillRect(-3.2, 3, 6.4, 2);
  cx.restore();
}
