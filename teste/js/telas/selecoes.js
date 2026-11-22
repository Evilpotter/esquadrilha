// ---------- Seleções ----------
function openLevelUp() {
  S.pendingLv--;
  S.mode = 'levelup';
  S.sel = {
    kind: 'lv', lock: .45, cur: [0, 0],
    opts: S.players.map(p => p.alive ? pick(SUPS, 3) : null),
    done: S.players.map(p => !p.alive),
  };
}
function bossOpts(p) {
  const owned = p.weapons.map(w => w.type);
  // Âncora Negra só recebe armas piratas e a Fênix só armas de fogo; as outras naves nunca recebem essas
  const grupo = SHIPS[p.ship].exclusivas || '';
  const grupoDa = d => d.pirata ? 'pirata' : d.fenix ? 'fenix' : '';
  const avail = Object.keys(WEAPONS).filter(t => !owned.includes(t) && !WEAPONS[t].ship && grupoDa(WEAPONS[t]) === grupo);
  const o = [];
  if (avail.length) o.push({ kind: 'new', type: pick(avail, 1)[0] });
  const ups = [];
  p.weapons.forEach(w => WUPS.forEach(u => { if (!(WEAPONS[w.type].noUp || []).includes(u.id)) ups.push({ kind: 'up', w, u }); }));
  o.push(...pick(ups, 2 - o.length));
  return o;
}
function openReward() {
  for (const p of S.players) {
    if (!p.alive) { p.alive = true; p.hp = p.maxHp * .5; p.inv = 2; p.x = W / 2; p.y = H - 150; }
    else p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .3);
  }
  S.mode = 'reward';
  S.sel = { kind: 'boss', lock: .6, cur: [0, 0], opts: S.players.map(bossOpts), done: S.players.map(() => false) };
}
function choose(pi, j) {
  const s = S.sel;
  if (!s || s.done[pi] || s.lock > 0 || !s.opts[pi] || j >= s.opts[pi].length) return;
  const p = S.players[pi], o = s.opts[pi][j];
  s.cur[pi] = j;
  if (s.kind === 'lv') o.apply(p);
  else if (o.kind === 'new') p.weapons.push(newWeapon(o.type));
  else { o.u.apply(o.w); o.w.lvl++; }
  s.done[pi] = true;
  s.chosen = s.chosen || []; s.chosen[pi] = j;
  if (s.done.every(Boolean)) {
    s.closeT = .35;
  }
}
function closeSel() {
  const kind = S.sel.kind;
  S.sel = null; S.mode = 'play';
  if (kind === 'boss') {
    S.phase++; skinOnPhase(S.phase); S.phaseT = 0; S.bossSpawned = false; S.spawnT = 1.5;
    nextScene(); S.enemies = []; S.ebullets = []; S.hazards = [];
    S.banner = { t: 2.5, text: 'Fase ' + S.phase + ' · ' + SCENES[S.scene].name };
  }
}
function selKey(code) {
  const s = S.sel; if (!s || s.lock > 0) return;
  const one = S.np === 1;
  const maps = [
    { l: ['KeyA'].concat(one ? ['ArrowLeft'] : []), r: ['KeyD'].concat(one ? ['ArrowRight'] : []),
      ok: ['Space'].concat(one ? ['Enter', 'NumpadEnter'] : []), d: ['Digit1', 'Digit2', 'Digit3'].concat(one ? ['Numpad1', 'Numpad2', 'Numpad3'] : []) },
    { l: ['ArrowLeft'], r: ['ArrowRight'], ok: ['Enter', 'NumpadEnter'], d: ['Numpad1', 'Numpad2', 'Numpad3'] },
  ];
  for (let pi = 0; pi < S.np; pi++) {
    const m = maps[pi], opts = s.opts[pi];
    if (!opts || s.done[pi]) continue;
    const n = opts.length;
    if (m.l.includes(code)) s.cur[pi] = (s.cur[pi] + n - 1) % n;
    if (m.r.includes(code)) s.cur[pi] = (s.cur[pi] + 1) % n;
    if (m.ok.includes(code)) choose(pi, s.cur[pi]);
    const di = m.d.indexOf(code) % 3;
    if (m.d.includes(code) && di < n) choose(pi, di);
  }
}
function selLayout() {
  const s = S.sel, out = [];
  const side = S.np === 2 && W >= 1000;
  const panels = [];
  for (let pi = 0; pi < S.np; pi++) {
    let x, w, top;
    if (S.np === 1) { w = Math.min(W - 40, 760); x = (W - w) / 2; top = H / 2 - 150; }
    else if (side) { w = Math.min(W / 2 - 40, 760); x = pi ? W / 2 + 20 : W / 2 - 20 - w; top = H / 2 - 150; }
    else { w = Math.min(W - 40, 760); x = (W - w) / 2; top = pi ? 490 : 120; }
    panels.push({ x, w, top });
    const opts = s.opts[pi]; if (!opts) continue;
    const k = opts.length, cw = (w - (k - 1) * 12) / k, ch = s.kind === 'boss' ? 240 : 160;
    for (let j = 0; j < k; j++) out.push({ pi, j, x: x + j * (cw + 12), y: top + 40, w: cw, h: ch });
  }
  return { cards: out, panels };
}
