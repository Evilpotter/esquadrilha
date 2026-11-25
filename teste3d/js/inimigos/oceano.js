// ---------- Inimigos do Oceano ----------
// ---------- Spawns ----------
function addEnemy(type, x, y, extra) {
  const t = ETYPES[type];
  const hp = t.hp * hpMult();
  const e = Object.assign({ type, x, y, x0: x, r: t.r, hp, maxHp: hp, t: 0, flash: 0, shootT: rnd(.5, 1.5), stopY: rnd(110, 260), stay: 0 }, extra || {});
  S.enemies.push(e);
  return e;
}
function spawnWave() {
  const pool = Object.keys(ETYPES).filter(k => ETYPES[k].from <= S.phase && ETYPES[k].w > 0 && ETYPES[k].scene === S.scene);
  let tot = 0; for (const k of pool) tot += ETYPES[k].w;
  let r = Math.random() * tot, type = pool[0];
  for (const k of pool) { r -= ETYPES[k].w; if (r <= 0) { type = k; break; } }
  const x0 = rnd(80, W - 80);
  if (spawnSceneWave(type, x0)) return;
  if (type === 'scout') {
    const n = 3 + Math.min(3, Math.floor(S.phase / 2));
    for (let k = 0; k < n; k++) { const o = k - (n - 1) / 2; addEnemy('scout', clamp(x0 + o * 34, 20, W - 20), -20 - Math.abs(o) * 30); }
  } else if (type === 'zig') {
    for (let k = 0; k < 3 + Math.min(2, Math.floor(S.phase / 3)); k++) addEnemy('zig', x0, -20 - k * 50, { ph0: k * .6 });
  } else if (type === 'swooper') {
    const side = Math.random() < .5 ? -1 : 1, cy = rnd(110, 240);
    for (let k = 0; k < 4; k++) addEnemy('swooper', side < 0 ? -30 : W + 30, cy, { side, delay: k * .35, cyBase: cy });
  } else if (type === 'kamikaze') {
    const n = 1 + (S.phase > 3 ? 1 : 0) + (Math.random() < .4 ? 1 : 0);
    for (let k = 0; k < n; k++) addEnemy('kamikaze', rnd(50, W - 50), -20 - k * 40, { stopY: rnd(60, 200) });
  } else if (type === 'gunner') {
    const n = 1 + (Math.random() < .25 + S.phase * .05 ? 1 : 0);
    for (let k = 0; k < n; k++) addEnemy('gunner', rnd(50, W - 50), -30);
  } else if (type === 'sniper') {
    addEnemy('sniper', rnd(60, W - 60), -30, { stopY: rnd(60, 130) });
  } else if (type === 'spinner') {
    addEnemy('spinner', rnd(80, W - 80), -30, { stopY: rnd(110, 230) });
  } else {
    addEnemy(type, rnd(70, W - 70), -40);
  }
}
function mineBlast(e) {
  if (e.dead) return;
  e.dead = true;
  boom(e.x, e.y, 34, '#ff4a4a');
  const n = 8 + Math.min(6, S.phase);
  for (let k = 0; k < n; k++) eShoot(e.x, e.y, k / n * Math.PI * 2, ebs() * .7, 5, undefined, 'bala');
}

// ---------- Inimigos comuns ----------
function updateEnemies(dt0) {
  const sp = eSpd(), rate = eRate(), bs = ebs();
  for (const e of S.enemies) {
    if (e.dead) continue;
    const dt = lentoDt(e, dt0); // Onda da Âncora Negra deixa lento (js/naves/pirata.js)
    const t = ETYPES[e.type];
    e.t += dt; if (e.flash > 0) e.flash -= dt;
    const p = nearestPlayer(e);
    switch (e.type) {
      case 'scout': e.y += t.vy * sp * dt; break;
      case 'mini': e.y += t.vy * sp * dt; e.x += e.vx * dt; break;
      case 'zig': e.y += t.vy * sp * dt; e.x = e.x0 + Math.sin(e.t * 2.6 + (e.ph0 || 0)) * 70; break;
      case 'splitter': e.y += t.vy * sp * dt; e.x = e.x0 + Math.sin(e.t * 1.5) * 30; break;
      case 'swooper': {
        if (e.t < e.delay) break;
        const tt = e.t - e.delay;
        e.x += -e.side * 230 * Math.max(1, W / 1000) * sp * dt;
        e.y = e.cyBase + Math.sin(tt * 1.8) * 110;
        if (!e.shot && p && Math.abs(e.x - W / 2) < W * .2) { e.shot = true; eFire(e, 'laser', e.x, e.y, Math.atan2(p.y - e.y, p.x - e.x), bs); }
        if (tt > 1 && (e.x < -60 || e.x > W + 60)) e.dead = true;
        break;
      }
      case 'kamikaze':
        if (!e.mode) { e.y += t.vy * sp * dt; if (e.y >= e.stopY) { e.mode = 'lock'; e.lt = .8; } }
        else if (e.mode === 'lock') {
          e.lt -= dt; if (p) { e.tx = p.x; e.ty = p.y; }
          if (e.lt <= 0) {
            const a = e.tx !== undefined ? Math.atan2(e.ty - e.y, e.tx - e.x) : Math.PI / 2;
            e.vx = Math.cos(a) * 520 * sp; e.vy = Math.sin(a) * 520 * sp; e.mode = 'dive';
          }
        } else { e.x += e.vx * dt; e.y += e.vy * dt; if (e.y < -60) e.dead = true; }
        break;
      case 'gunner':
        if (e.y < e.stopY || e.stay > 6) e.y += t.vy * sp * dt * (e.stay > 6 ? 1.6 : 1); else e.stay += dt;
        break;
      case 'heavy': e.y += t.vy * sp * dt; break;
      case 'spinner':
        if (e.y < e.stopY || e.stay > 8) e.y += t.vy * sp * dt * (e.stay > 8 ? 2 : 1);
        else {
          e.stay += dt; e.shootT -= dt * rate;
          if (e.shootT <= 0) { e.shootT = .24; const a = e.t * 2.2; eFire(e, 'metralhadora', e.x, e.y, a, bs * .7, 5); eFire(e, 'metralhadora', e.x, e.y, a + Math.PI, bs * .7, 5); }
        }
        break;
      case 'sniper':
        if (e.y < e.stopY || e.stay > 9) e.y += t.vy * sp * dt * (e.stay > 9 ? 1.8 : 1);
        else {
          e.stay += dt;
          if (e.cool === undefined) e.cool = .6;
          if (!e.aiming) { e.cool -= dt * rate; if (e.cool <= 0 && p) e.aiming = 1.2; }
          else {
            e.aiming -= dt;
            if (e.aiming > .35 && p) { e.ax = p.x; e.ay = p.y; }
            if (e.aiming <= 0) { e.aiming = 0; e.cool = 2.2; eFire(e, 'laserForte', e.x, e.y, Math.atan2(e.ay - e.y, e.ax - e.x), bs * 2.6, 5); }
          }
        }
        break;
      case 'miner':
        e.y += t.vy * sp * dt; e.x = e.x0 + Math.sin(e.t) * 50;
        e.shootT -= dt * rate;
        if (e.shootT <= 0 && e.y > 30) { e.shootT = 1.6; addEnemy('mine', e.x, e.y + 14, { fuse: 4 }); }
        break;
      case 'mine':
        e.y += t.vy * dt; e.fuse -= dt;
        if (!e.armed && (e.fuse <= 0 || (p && d2(p, e) < 80 * 80))) e.armed = .55;
        if (e.armed) { e.armed -= dt; if (e.armed <= 0) mineBlast(e); }
        break;
      default: updateSceneEnemy(e, t, p, dt, sp, rate, bs); break;
      case 'hunter':
        if (e.y < 140) e.y += t.vy * sp * dt;
        else if (e.stay > 10) e.y += t.vy * 2 * dt;
        else { e.stay += dt; if (p) e.x += clamp(p.x - e.x, -130 * sp * dt, 130 * sp * dt); }
        break;
    }
    if (t.shoot && e.y > 20 && e.y < H - 200 && e.type !== 'spinner') {
      e.shootT -= dt * rate;
      if (e.shootT <= 0) {
        e.shootT = t.shoot * rnd(.85, 1.15);
        if (e.type === 'gunner' && p) eFire(e, 'laser', e.x, e.y + 10, Math.atan2(p.y - e.y, p.x - e.x), bs);
        if (e.type === 'heavy') { const n = S.phase >= 6 ? 5 : 3; for (let k = 0; k < n; k++) eFire(e, 'missil', e.x, e.y + 20, Math.PI / 2 + (k - (n - 1) / 2) * .28, bs * .85, 6); }
        if (e.type === 'hunter') for (let w = 0; w < 3; w++) setTimeoutFx(w * .12, () => {
          if (e.dead || !S.enemies) return; const q = nearestPlayer(e); if (q) eFire(e, 'laser', e.x, e.y + 12, Math.atan2(q.y - e.y, q.x - e.x), bs * 1.1);
        });
      }
    }
    if (!e.dead && (e.y > H + 60 || e.x < -90 || e.x > W + 90)) e.dead = true;
    if (!e.dead && !t.ground && !e.invuln) for (const pl of S.players) if (pl.alive && d2(pl, e) < (pl.r + e.r - 4) ** 2) {
      if (e.type === 'mine') { mineBlast(e); break; }
      hurt(pl, (e.type === 'kamikaze' ? 30 : 20) * eDmg());
      dealDmg(e, e.type === 'kamikaze' ? 999 : 40, null);
    }
  }
  S.enemies = S.enemies.filter(e => !e.dead);
}
