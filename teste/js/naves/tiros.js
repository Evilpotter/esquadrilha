// ---------- Tiros ----------
function firePlayer(p, dt) {
  for (const w of p.weapons) {
    const d = WEAPONS[w.type];
    if (w.type === 'saw' || w.type === 'parrot' || w.type === 'chick') continue; // serra, papagaio e filhote são atualizados à parte
    if (w.type === 'anchor' && p.dragonT > 0) continue;    // dragão de água: o jato substitui a âncora
    w.t -= dt * p.rate * habCadencia(p); // fúria do Falcão
    if (w.t > 0) continue;
    w.t += d.cd * w.cdM;
    if (w.t < 0) w.t = 0;
    const dmg = d.dmg * w.dmgM * p.dmg, n = w.shots, col = shotColor(p, w, d.color), sk = shotSkin(p, w);
    if (PIRATA_TIRO[w.type]) { if (!PIRATA_TIRO[w.type](p, w, d, dmg, n, col)) w.t = .1; continue; } // js/naves/pirata.js
    if (FENIX_TIRO[w.type]) { if (!FENIX_TIRO[w.type](p, w, d, dmg, n, col)) w.t = .1; continue; }   // js/naves/fenix.js
    if (HYPNOS_TIRO[w.type]) { if (!HYPNOS_TIRO[w.type](p, w, d, dmg, n, col)) w.t = .1; continue; } // js/naves/hypnos.js
    if (w.type !== 'chain') somTiro(w.type, p.x);
    const mk = (x, y, ang) => S.bullets.push({
      x, y, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd, r: d.r, dmg, p,
      pierce: w.pierce, hit: null, explo: w.explosive, homing: !!d.homing, color: col, sk, life: 3, type: w.type,
    });
    if (w.type === 'gun') {
      for (let k = 0; k < n; k++) { const o = k - (n - 1) / 2; mk(p.x + o * 9, p.y - 18, o * .05); }
    } else if (w.type === 'spread') {
      const arc = .35 + .07 * n;
      for (let k = 0; k < n; k++) mk(p.x, p.y - 14, n === 1 ? 0 : -arc / 2 + arc * k / (n - 1));
    } else if (w.type === 'missile') {
      for (let k = 0; k < n; k++) { const s = k % 2 ? 1 : -1, j = k >> 1; mk(p.x + s * (14 + 7 * j), p.y, s * (.5 + .15 * j)); }
    } else if (w.type === 'plasma') {
      for (let k = 0; k < n; k++) { const o = k - (n - 1) / 2; mk(p.x + o * 22, p.y - 22, o * .08); }
    } else if (w.type === 'drone') {
      for (let k = 0; k < n; k++) { const dp = dronePos(p, k); mk(dp.x, dp.y - 8, 0); }
    } else if (w.type === 'boomerang') {
      for (let k = 0; k < n; k++) {
        const ang = (k - (n - 1) / 2) * .32;
        S.bullets.push({ x: p.x, y: p.y - 18, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd, r: d.r, dmg, p,
          explo: w.explosive, splash: .6, color: col, sk, life: 6, type: 'boomerang', boom: true,
          range: d.range * w.range, ret: false, rot: 0, age: 0, hitT: new Map() });
      }
    } else if (w.type === 'ricochet') {
      w.side = -(w.side || 1);
      for (let k = 0; k < n; k++) {
        const ang = w.side * .45 + (k - (n - 1) / 2) * .3;
        S.bullets.push({ x: p.x, y: p.y - 16, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd, r: d.r, dmg, p,
          pierce: 0, bounce: 3 + w.pierce, explo: w.explosive, color: col, life: 4, type: 'ricochet' });
      }
    } else if (w.type === 'chain') {
      fireChain(p, w, dmg, n);
    } else if (w.type === 'barrage') {
      const game = S;
      for (let k = 0; k < n; k++) {
        const s = k % 2 ? 1 : -1, j = k >> 1;
        setTimeoutFx(k * .055, () => {
          if (S !== game || !p.alive) return;
          const ang = (k - (n - 1) / 2) * .045 + rnd(-.025, .025);
          S.bullets.push({ x: p.x + s * (20 + 4 * (j % 2)), y: p.y - 6, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd,
            acc: 1000, max: 800, r: d.r, dmg, p, pierce: w.pierce, explo: w.explosive, splash: d.splash,
            color: col, sk, life: 3, type: 'barrage', smokeT: 0 });
        });
      }
    }
  }
}
// ---------- Raio em cadeia ----------
function chainBlocked(a, t) {
  if (t.kind !== 'guardian') return false;
  const dd = Math.sqrt(d2(a, t)) || 1;
  if (dd <= t.shR) return false;
  return shieldBlocks({ x: t.x + (a.x - t.x) / dd * t.shR, y: t.y + (a.y - t.y) / dd * t.shR, r: 0 });
}
function fireChain(p, w, dmg, n) {
  const T = targets().filter(t => !t.dead && !t.invuln && t.y > 0);
  const range = 460, hop = 210, jumps = 3 + w.pierce;
  const from0 = { x: p.x, y: p.y - 16 };
  const firsts = T.filter(t => d2(t, from0) < range * range && !chainBlocked(from0, t)).sort((a, b) => d2(a, from0) - d2(b, from0));
  if (!firsts.length) { w.t = .1; return; }
  somTiro('chain', p.x);
  for (let k = 0; k < n; k++) {
    let cur = firsts[k % firsts.length], dm = dmg;
    const hit = new Set(), pts = [from0];
    for (let j = 0; j <= jumps && cur; j++) {
      hit.add(cur); pts.push({ x: cur.x, y: cur.y });
      dealDmg(cur, dm, p);
      if (w.explosive) explode(cur.x, cur.y, w.explosive, dm * .6, p);
      dm *= .8;
      let nx = null, nd = hop * hop;
      for (const t of T) if (!hit.has(t) && !t.dead && d2(t, cur) < nd && !chainBlocked(cur, t)) { nd = d2(t, cur); nx = t; }
      cur = nx;
    }
    S.fx.push({ type: 'bolt', pts, t: 0, life: .18 });
  }
}

// ---------- Serra orbital ----------
function sawPos(p, w, k) {
  const a = (w.ang || 0) + k / w.shots * TAU, R = 58 * w.range;
  return { x: p.x + Math.cos(a) * R, y: p.y + Math.sin(a) * R };
}
function updateSaws(dt) {
  const T = targets(), d = WEAPONS.saw;
  for (const p of S.players) {
    if (!p.alive) continue;
    for (const w of p.weapons) {
      if (w.type !== 'saw') continue;
      w.ang = (w.ang || 0) + dt * 3.6 * p.rate / w.cdM;
      if (!w.hits) w.hits = [];
      const dmg = d.dmg * w.dmgM * p.dmg, cd = d.cd * w.cdM / p.rate;
      for (let k = 0; k < w.shots; k++) {
        const hits = w.hits[k] || (w.hits[k] = new Map());
        for (const [t, c] of hits) { if (c - dt <= 0 || t.dead) hits.delete(t); else hits.set(t, c - dt); }
        const bp = sawPos(p, w, k);
        for (const t of T) {
          if (t.dead || t.invuln || hits.has(t)) continue;
          if (d2(t, bp) < (t.r + d.r) ** 2) {
            dealDmg(t, dmg, p); hits.set(t, cd); som('serra_corte', bp.x);
            if (w.explosive) explode(bp.x, bp.y, w.explosive, dmg * .6, p);
            S.fx.push({ type: 'spark', x: bp.x, y: bp.y, vx: rnd(-90, 90), vy: rnd(-90, 90), t: 0, life: .18, color: '#fff' });
          }
        }
        for (const e of S.ebullets) if (!e.dead && d2(e, bp) < (e.r + d.r) ** 2) {
          e.dead = true;
          S.fx.push({ type: 'spark', x: e.x, y: e.y, vx: rnd(-60, 60), vy: rnd(-60, 60), t: 0, life: .15, color: '#d8e4ee' });
        }
      }
    }
  }
  S.ebullets = S.ebullets.filter(e => !e.dead);
}
function drawSaw(x, y, rot, explo) {
  cx.save(); cx.translate(x, y); cx.rotate(rot);
  cx.fillStyle = 'rgba(216,228,238,.18)'; cx.beginPath(); cx.arc(0, 0, 16, 0, TAU); cx.fill();
  cx.fillStyle = explo ? '#ffb347' : '#d8e4ee';
  cx.beginPath();
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, rr = k % 2 ? 8 : 12.5; cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  cx.closePath(); cx.fill();
  cx.fillStyle = '#5a6b7a'; cx.beginPath(); cx.arc(0, 0, 3.5, 0, TAU); cx.fill();
  cx.restore();
}

function dronePos(p, k) {
  const s = k % 2 ? 1 : -1, j = k >> 1;
  return { x: p.x + s * (40 + j * 22), y: p.y + 12 + j * 14 + Math.sin(performance.now() / 300 + k) * 3 };
}
// k = tipo do tiro (ETIROS, em js/dados/inimigos.js); c = cor de quem atirou (desenho)
function eShoot(x, y, ang, spd, r, d, k, c) {
  k = k || 'bala';
  somTiroInimigo(k, x);
  S.ebullets.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: r || 5, d: d || (ETIROS[k] || ETIROS.bala).dano * eDmg(), k, c });
}
// atalho para inimigos comuns: tipo do tiro + cor do inimigo
function eFire(e, k, x, y, ang, spd, r) { eShoot(x, y, ang, spd, r, undefined, k, ETYPES[e.type].color); }
function nearestPlayer(e) {
  let best = null, bd = 1e12;
  for (const p of S.players) if (p.alive) { const dd = d2(p, e); if (dd < bd) { bd = dd; best = p; } }
  return best;
}
function targets() { return S.bosses.length ? S.enemies.concat(S.bosses.filter(b => !b.dead && !b.invuln)) : S.enemies; }
