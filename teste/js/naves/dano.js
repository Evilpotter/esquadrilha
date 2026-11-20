// ---------- Dano ----------
function dealDmg(t, dmg, p) {
  if (t.dead || t.invuln) return;
  if (p && Math.random() < p.crit) dmg *= 2;
  t.hp -= dmg; t.flash = .07;
  if (t.hp > 0) som(t.boss ? 'acerto_chefao' : 'acerto', t.x);
  if (t.hp <= 0) {
    t.dead = true;
    if (t.boss) {
      boom(t.x, t.y, 80, '#ffa030');
      if (S.bosses.every(b => b.dead)) bossDie(t);
      else S.bosses.forEach(b => { b.rage2 = true; });
    } else killEnemy(t, p);
  }
}
function killEnemy(e, p) {
  const xp = ETYPES[e.type].xp;
  if (e.type === 'mine') { boom(e.x, e.y, 20, '#ffb040'); return; }
  if (e.type === 'splitter') for (const s of [-1, 1]) addEnemy('mini', e.x + s * 12, e.y, { vx: s * 110 });
  if (e.type === 'rock' && e.big) for (const s of [-1, 1]) addRock(e.x + s * 10, e.y, 13, false, s * rnd(60, 100));
  S.kills++; if (p) p.kills++;
  boom(e.x, e.y, e.r * 1.6, '#ffb040');
  if (xp >= 5) { for (let k = 0; k < 3; k++) S.gems.push({ x: e.x + rnd(-15, 15), y: e.y + rnd(-15, 15), v: 2 }); }
  else S.gems.push({ x: e.x, y: e.y, v: xp });
}
function explode(x, y, rad, dmg, p) {
  S.fx.push({ type: 'ring', x, y, r: rad, t: 0, life: .3, color: '#ffcf60' });
  som('explosao_area', x);
  for (const t of targets()) if (!t.dead && d2(t, { x, y }) < (rad + t.r) ** 2) dealDmg(t, dmg, p);
}
function boom(x, y, r, color) {
  S.fx.push({ type: 'boom', x, y, r, t: 0, life: .45, color });
  somExplosao(x, r);
  for (let k = 0; k < 6; k++) S.fx.push({ type: 'spark', x, y, vx: rnd(-160, 160), vy: rnd(-160, 160), t: 0, life: rnd(.3, .6), color });
}
function hurt(p, dmg) {
  if (p.inv > 0 || !p.alive) return;
  const a = Math.min(p.sh, dmg); p.sh -= a; dmg -= a;
  p.hp -= dmg; p.inv = .7; p.shT = 3; S.shake = .2;
  som('dano_jogador', p.x);
  if (p.hp <= 0) {
    p.hp = 0; p.alive = false; som('jogador_abatido', p.x);
    boom(p.x, p.y, 50, '#ff6040');
    if (S.players.every(q => !q.alive)) S.overT = 2;
  }
}
function bossDie(b) {
  skinOnBoss(BOSS_ORDER[(S.phase - 1) % BOSS_ORDER.length]);
  for (let k = 0; k < 8; k++) setTimeoutFx(k * .12, () => boom(b.x + rnd(-60, 60), b.y + rnd(-40, 40), 70, '#ffa030'));
  S.ebullets = []; S.hazards = [];
  S.enemies.forEach(e => { if (e.type === 'mine') e.dead = true; });
  S.bosses = []; S.shake = .5;
  S.rewardT = 2.2;
  for (const g of S.gems) addXp(g.v);
  S.gems = [];
}
const delayed = [];
function setTimeoutFx(t, fn) { delayed.push({ t, fn }); }

function addXp(v) {
  S.xp += v;
  while (S.xp >= S.xpNext) { S.xp -= S.xpNext; S.level++; S.xpNext = xpFor(S.level); S.pendingLv++; }
}
