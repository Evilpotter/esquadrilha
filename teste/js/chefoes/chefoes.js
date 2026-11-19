// ---------- Chefões ----------
function patrol(b, dt, spd) {
  b.x += b.dir * spd * dt;
  const m = Math.min(110, W * .2);
  if (b.x < m) b.dir = 1; if (b.x > W - m) b.dir = -1;
}
function enter(b, dt) { if (b.y < b.ty) { b.y += 90 * dt; return true; } return false; }
function rage(b) { return b.hp < b.maxHp / 2 || b.rage2; }
function ring(x, y, n, spd, r, off) { const o = off === undefined ? Math.random() : off; for (let k = 0; k < n; k++) eShoot(x, y, (k + o) / n * TAU, spd, r || 6); }
function aimed(b, n, spread, spd, r) {
  const p = nearestPlayer(b); if (!p) return;
  const a = Math.atan2(p.y - b.y, p.x - b.x);
  for (let k = 0; k < n; k++) eShoot(b.x, b.y + 20, a + (k - (n - 1) / 2) * spread, spd, r);
}
function beam(x, y0, w, warn, life) { S.hazards.push({ x, y0, w, warn, life, max: warn }); }

const BOSSES = {
  fortress: {
    name: 'Fortaleza Voadora', r: 60,
    update(b, dt) {
      if (enter(b, dt)) return;
      patrol(b, dt, rage(b) ? 120 : 70);
      b.patT -= dt;
      if (b.patT > 0) return;
      b.patT = rage(b) ? 1.3 : 2.1;
      const pat = (b.pat = (b.pat || 0) + 1) % 3, sp = ebs() * .9;
      if (pat === 0) ring(b.x, b.y, 14 + S.phase * 2, sp, 6);
      else if (pat === 1) for (let w = 0; w < 3; w++) setTimeoutFx(w * .18, () => { if (!b.dead) aimed(b, 3, .14, sp * 1.2); });
      else for (let k = 0; k < 9; k++) eShoot(b.x, b.y + 30, Math.PI / 2 + (k - 4) * .17, sp, 7);
    },
    draw(b) { drawBoss(b); },
  },
  carrier: {
    name: 'Porta-aviões', r: 64, hpM: 1.1,
    update(b, dt) {
      if (enter(b, dt)) return;
      patrol(b, dt, 50);
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = rage(b) ? 2 : 3;
        b.wave = (b.wave || 0) + 1;
        const type = rage(b) && b.wave % 2 ? 'kamikaze' : 'scout';
        for (const s of [-1, 1]) for (let k = 0; k < 2; k++) addEnemy(type, b.x + s * (70 + k * 20), b.y + 20, { stopY: rnd(150, 300) });
      }
      b.ringT = (b.ringT || 2.5) - dt;
      if (b.ringT <= 0) { b.ringT = 2.5; ring(b.x, b.y, 10 + S.phase, ebs() * .55, 7); }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y);
      cx.fillStyle = f ? '#fff' : '#4d5a4a'; roundRect(-45, -70, 90, 140, 14); cx.fill();
      cx.fillStyle = f ? '#fff' : '#39443a'; cx.fillRect(-95, -14, 190, 26);
      cx.strokeStyle = '#d8e0d0'; cx.lineWidth = 2; cx.setLineDash([10, 8]);
      cx.beginPath(); cx.moveTo(0, -60); cx.lineTo(0, 60); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = f ? '#fff' : '#c9a227';
      for (const s of [-1, 1]) { cx.beginPath(); cx.arc(s * 75, 0, 9, 0, TAU); cx.fill(); }
      cx.fillStyle = f ? '#fff' : '#9ec2a0'; cx.fillRect(18, -30, 16, 30);
      cx.restore();
    },
  },
  laser: {
    name: 'Colosso do Raio', r: 58,
    update(b, dt) {
      if (enter(b, dt)) return;
      const p = nearestPlayer(b);
      if (p) b.x += clamp(p.x - b.x, -70 * dt, 70 * dt);
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = rage(b) ? 2.2 : 3;
        const px = p ? p.x : b.x;
        beam(px, b.y + 40, 38, 1, .8);
        if (rage(b)) { beam(px - 160, b.y + 40, 38, 1.3, .8); beam(px + 160, b.y + 40, 38, 1.3, .8); }
      }
      b.shotT = (b.shotT || 1.5) - dt;
      if (b.shotT <= 0) { b.shotT = 1.5; aimed(b, 2, .2, ebs(), 5); }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y);
      cx.fillStyle = f ? '#fff' : '#5a1e1e';
      cx.beginPath(); cx.moveTo(-90, -20); cx.lineTo(90, -20); cx.lineTo(50, 40); cx.lineTo(-50, 40); cx.closePath(); cx.fill();
      cx.fillStyle = f ? '#fff' : '#2a0e0e'; cx.beginPath(); cx.arc(0, 0, 36, 0, TAU); cx.fill();
      cx.fillStyle = f ? '#fff' : '#ff3b3b'; cx.beginPath(); cx.arc(0, 8, 16, 0, TAU); cx.fill();
      cx.fillStyle = '#fff0f0'; cx.beginPath(); cx.arc(0, 8, 6, 0, TAU); cx.fill();
      cx.restore();
    },
  },
  vortex: {
    name: 'Vórtice', r: 54,
    update(b, dt) {
      if (enter(b, dt)) return;
      b.x = W / 2 + Math.sin(b.t * .5) * Math.min(W * .25, 300);
      b.cyc = (b.cyc || 0) + dt;
      const on = b.cyc % 6.5 < 5;
      b.spin = (b.spin || 0) + dt * (rage(b) ? 2.3 : 1.7);
      if (!on) return;
      b.shotT = (b.shotT || 0) - dt;
      if (b.shotT <= 0) {
        b.shotT = .1;
        const arms = rage(b) ? 4 : 3;
        for (let k = 0; k < arms; k++) eShoot(b.x, b.y, b.spin + k / arms * TAU, ebs() * .6, 5);
      }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.spin || 0);
      cx.fillStyle = f ? '#fff' : '#1f5f8a';
      for (let k = 0; k < 4; k++) { cx.rotate(TAU / 4); cx.beginPath(); cx.ellipse(34, 0, 34, 12, 0, 0, TAU); cx.fill(); }
      cx.fillStyle = f ? '#fff' : '#0e3550'; cx.beginPath(); cx.arc(0, 0, 30, 0, TAU); cx.fill();
      cx.fillStyle = f ? '#fff' : '#7fe0ff'; cx.beginPath(); cx.arc(0, 0, 12, 0, TAU); cx.fill();
      cx.restore();
    },
  },
  ram: {
    name: 'Aríete', r: 50, hpM: .9,
    update(b, dt) {
      if (!b.mode && enter(b, dt)) return;
      if (!b.mode) b.mode = 'patrol';
      if (b.mode === 'patrol') {
        patrol(b, dt, 90);
        b.patT -= dt;
        if (b.patT <= 0) { b.mode = 'warn'; b.wt = rage(b) ? .45 : .75; }
        if (Math.random() < dt * 1.2) aimed(b, 1, 0, ebs());
      } else if (b.mode === 'warn') {
        b.wt -= dt; const p = nearestPlayer(b); if (p) { b.tx = p.x; b.ty2 = p.y; }
        if (b.wt <= 0) { const a = Math.atan2((b.ty2 || H) - b.y, (b.tx || b.x) - b.x); b.vx = Math.cos(a) * 700; b.vy = Math.sin(a) * 700; b.mode = 'charge'; }
      } else if (b.mode === 'charge') {
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.dropT = (b.dropT || 0) - dt;
        if (b.dropT <= 0) { b.dropT = .07; eShoot(b.x, b.y, Math.atan2(b.vy, b.vx) + Math.PI / 2, ebs() * .45, 5); eShoot(b.x, b.y, Math.atan2(b.vy, b.vx) - Math.PI / 2, ebs() * .45, 5); }
        if (b.y > H - 60 || b.x < 40 || b.x > W - 40 || b.y < 40) { b.mode = 'back'; b.x = clamp(b.x, 40, W - 40); b.y = clamp(b.y, 40, H - 60); }
      } else {
        const dy = b.ty - b.y; b.y += clamp(dy, -260 * dt, 260 * dt);
        if (Math.abs(dy) < 2) { b.mode = 'patrol'; b.patT = rage(b) ? 1.8 : 3; ring(b.x, b.y, 12, ebs() * .6, 6); }
      }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y);
      if (b.mode === 'charge' || b.mode === 'warn') cx.rotate(Math.atan2((b.ty2 || H) - b.y, (b.tx || b.x) - b.x) - Math.PI / 2);
      cx.fillStyle = f || (b.mode === 'warn' && Math.floor(b.t * 16) % 2) ? '#fff' : '#8a3b12';
      cx.beginPath(); cx.moveTo(0, 62); cx.lineTo(55, -40); cx.lineTo(20, -30); cx.lineTo(0, -55); cx.lineTo(-20, -30); cx.lineTo(-55, -40); cx.closePath(); cx.fill();
      cx.fillStyle = f ? '#fff' : '#d9d9d9'; cx.beginPath(); cx.moveTo(0, 62); cx.lineTo(16, 30); cx.lineTo(-16, 30); cx.closePath(); cx.fill();
      cx.fillStyle = f ? '#fff' : '#ffb347'; cx.beginPath(); cx.arc(0, -8, 10, 0, TAU); cx.fill();
      cx.restore();
    },
  },
  twins: {
    name: 'Gêmeos', r: 42,
    update(b, dt) {
      if (enter(b, dt)) return;
      const rad = Math.min(W / 2 - 80, 320);
      b.ang = (b.ang === undefined ? b.idx * Math.PI : b.ang) + dt * (b.rage2 ? 1.4 : .8);
      b.x = W / 2 + Math.cos(b.ang) * rad; b.y = b.ty + Math.sin(b.ang) * 60;
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = b.rage2 ? .9 : 1.6;
        aimed(b, 2, .12, ebs() * 1.05);
        if (b.rage2) ring(b.x, b.y, 12, ebs() * .6, 5);
      }
    },
    draw(b) { const c = b.idx ? ['#b03050', '#5a1428'] : ['#3060b0', '#142c5a']; drawPlane(b.x, b.y, 2.4, c[0], c[1], true, 0, b.flash > 0); },
  },
  sower: {
    name: 'Semeador', r: 56,
    update(b, dt) {
      if (enter(b, dt)) return;
      patrol(b, dt, 80);
      b.patT -= dt;
      if (b.patT <= 0) { b.patT = rage(b) ? .8 : 1.2; addEnemy('mine', b.x + rnd(-50, 50), b.y + 30, { fuse: 5 }); }
      b.orbT = (b.orbT || 2) - dt;
      if (b.orbT <= 0) {
        b.orbT = rage(b) ? 1.6 : 2.6;
        for (const s of [-1, 1]) S.ebullets.push({ x: b.x + s * 40, y: b.y, vx: s * 80, vy: 60, r: 8, d: 14 * eDmg(), home: true, life: 5 });
      }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y);
      cx.fillStyle = f ? '#fff' : '#5a3a1a'; cx.beginPath(); cx.ellipse(0, 0, 80, 34, 0, 0, TAU); cx.fill();
      cx.fillStyle = f ? '#fff' : '#3a2410';
      for (const s of [-50, -17, 17, 50]) { cx.beginPath(); cx.arc(s, 18, 11, 0, TAU); cx.fill(); }
      cx.fillStyle = f ? '#fff' : '#ff6a3a'; cx.beginPath(); cx.arc(0, -6, 12, 0, TAU); cx.fill();
      cx.restore();
    },
  },
  ghost: {
    name: 'Fantasma', r: 50,
    update(b, dt) {
      if (enter(b, dt)) return;
      if (!b.mode) { b.mode = 'show'; b.mt = 2.5; }
      b.mt -= dt;
      if (b.mode === 'show') {
        b.alpha = 1; b.invuln = false; patrol(b, dt, 60);
        b.patT -= dt; if (b.patT <= 0) { b.patT = rage(b) ? .9 : 1.4; aimed(b, 5, .16, ebs()); }
        if (b.mt <= 0) { b.mode = 'fade'; b.mt = .5; }
      } else if (b.mode === 'fade') {
        b.alpha = Math.max(.08, b.mt / .5); b.invuln = true;
        if (b.mt <= 0) { b.mode = 'hidden'; b.mt = .6; b.x = rnd(100, W - 100); b.y = rnd(100, 300); }
      } else if (b.mode === 'hidden') {
        b.alpha = .08;
        if (b.mt <= 0) { b.mode = 'show'; b.mt = rage(b) ? 2 : 2.8; ring(b.x, b.y, 16 + S.phase, ebs() * .65, 6); }
      }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.globalAlpha = b.alpha === undefined ? 1 : b.alpha; cx.translate(b.x, b.y);
      cx.fillStyle = f ? '#fff' : '#8a6bd6';
      cx.beginPath(); cx.arc(0, -10, 46, Math.PI, 0);
      for (let k = 0; k <= 6; k++) cx.lineTo(46 - k * 92 / 6, 34 + (k % 2 ? -12 : 0));
      cx.closePath(); cx.fill();
      cx.fillStyle = '#1a0f33';
      cx.beginPath(); cx.ellipse(-16, -14, 8, 12, 0, 0, TAU); cx.ellipse(16, -14, 8, 12, 0, 0, TAU); cx.fill();
      cx.restore(); cx.globalAlpha = 1;
    },
  },
  guardian: {
    name: 'Guardião', r: 48, hpM: .9,
    init(b) { b.shR = 92; b.rot = 0; b.arc = 1.25; },
    update(b, dt) {
      b.rot += dt * (rage(b) ? 2.1 : 1.2);
      if (enter(b, dt)) return;
      patrol(b, dt, 55);
      b.patT -= dt;
      if (b.patT <= 0) { b.patT = rage(b) ? 1 : 1.4; aimed(b, 3, .12, ebs()); }
      b.ringT = (b.ringT || 4) - dt;
      if (b.ringT <= 0) { b.ringT = rage(b) ? 2.5 : 4; ring(b.x, b.y, 18, ebs() * .6, 6); }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y);
      cx.strokeStyle = '#78e6ff'; cx.lineWidth = 9; cx.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const a = b.rot + k * TAU / 3; cx.beginPath(); cx.arc(0, 0, b.shR, a, a + b.arc); cx.stroke(); }
      cx.lineCap = 'butt';
      cx.fillStyle = f ? '#fff' : '#1d5a6b';
      cx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; cx.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); } cx.closePath(); cx.fill();
      cx.fillStyle = f ? '#fff' : '#b8f4ff'; cx.beginPath(); cx.arc(0, 0, 16, 0, TAU); cx.fill();
      cx.restore();
    },
  },
  storm: {
    name: 'Tempestade', r: 60, hpM: 1.1,
    update(b, dt) {
      if (enter(b, dt)) return;
      b.x = W / 2 + Math.sin(b.t * .4) * Math.min(W * .3, 260);
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = rage(b) ? 2 : 2.6;
        const gap = rnd(80, W - 80), gw = 150;
        for (let x = 15; x < W; x += 44) if (Math.abs(x - gap) > gw / 2) eShoot(x, -10, Math.PI / 2, ebs() * .55, 6);
      }
      b.boltT = (b.boltT || 1.5) - dt;
      if (b.boltT <= 0) {
        b.boltT = rage(b) ? 1.6 : 2.4;
        const n = rage(b) ? 4 : 2;
        for (let k = 0; k < n; k++) { const p = k === 0 ? nearestPlayer(b) : null; beam(p ? p.x : rnd(40, W - 40), 0, 44, 1.1, .35); }
      }
    },
    draw(b) {
      const f = b.flash > 0;
      cx.save(); cx.translate(b.x, b.y);
      cx.fillStyle = f ? '#fff' : '#3b4252';
      for (const [x, y, r] of [[-55, 5, 38], [0, -10, 50], [55, 5, 38], [-25, 20, 34], [25, 20, 34]]) { cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill(); }
      cx.fillStyle = f ? '#fff' : '#ffd43b';
      cx.beginPath(); cx.moveTo(4, 10); cx.lineTo(-14, 44); cx.lineTo(0, 44); cx.lineTo(-8, 72); cx.lineTo(18, 34); cx.lineTo(4, 34); cx.lineTo(14, 10); cx.closePath(); cx.fill();
      cx.restore();
    },
  },
};
const BOSS_ORDER = ['fortress', 'carrier', 'laser', 'vortex', 'ram', 'twins', 'sower', 'ghost', 'guardian', 'storm'];

function mkBoss(kind, hp, extra) {
  const def = BOSSES[kind];
  const b = Object.assign({ boss: true, kind, x: W / 2, y: -100, ty: 160, r: def.r, hp, maxHp: hp, t: 0, patT: 2, dir: 1, flash: 0, alpha: 1 }, extra || {});
  if (def.init) def.init(b);
  return b;
}
function spawnBoss() {
  const kind = BOSS_ORDER[(S.phase - 1) % BOSS_ORDER.length], def = BOSSES[kind];
  const hp = 900 * (1 + .5 * (S.phase - 1)) * (S.np === 2 ? 1.4 : 1) * (def.hpM || 1);
  if (kind === 'twins') { for (let i = 0; i < 2; i++) S.bosses.push(mkBoss(kind, hp * .55, { idx: i })); }
  else S.bosses.push(mkBoss(kind, hp));
  S.bossName = def.name + (S.phase > BOSS_ORDER.length ? ' +' + Math.floor((S.phase - 1) / BOSS_ORDER.length) : '');
  S.banner = { t: 2.5, text: S.bossName };
}
function updateBosses(dt) {
  for (const b of S.bosses) {
    if (b.dead) continue;
    b.t += dt; if (b.flash > 0) b.flash -= dt;
    BOSSES[b.kind].update(b, dt);
    if (!b.invuln) for (const p of S.players) if (p.alive && d2(p, b) < (p.r + b.r - 10) ** 2) hurt(p, (b.kind === 'ram' ? 40 : 30) * eDmg());
  }
}
function updateHazards(dt) {
  for (const h of S.hazards) {
    if (h.warn > 0) { h.warn -= dt; continue; }
    h.life -= dt;
    for (const p of S.players) if (p.alive && p.y > h.y0 && Math.abs(p.x - h.x) < h.w / 2 + p.r * .6) hurt(p, 25 * eDmg());
  }
  S.hazards = S.hazards.filter(h => h.warn > 0 || h.life > 0);
}
function shieldBlocks(b) {
  for (const g of S.bosses) {
    if (g.dead || g.kind !== 'guardian') continue;
    const dx = b.x - g.x, dy = b.y - g.y, dd = Math.hypot(dx, dy);
    if (Math.abs(dd - g.shR) > 9 + b.r) continue;
    let a = Math.atan2(dy, dx) - g.rot; a = ((a % TAU) + TAU) % TAU;
    if (a % (TAU / 3) < g.arc) return true;
  }
  return false;
}
