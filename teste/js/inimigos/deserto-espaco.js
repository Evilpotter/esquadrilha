// ---------- Inimigos do Deserto e do Espaço ----------
const GROUND = 60;
function nextScene() {
  const opts = SCENE_KEYS.filter(k => k !== S.scene);
  S.scene = pick(opts, 1)[0];
}
function rockShape() { return [...Array(9)].map(() => .75 + Math.random() * .35); }
function addRock(x, y, r, big, vx) {
  const e = addEnemy('rock', x, y, { r, big, vx, rs: rnd(-1.5, 1.5), shape: rockShape() });
  e.hp = e.maxHp = e.maxHp * (big ? r / 26 : .3);
  return e;
}
function spawnSceneWave(type, x0) {
  switch (type) {
    case 'jeep': { const s = Math.random() < .5 ? -1 : 1; for (let k = 0; k < 3; k++) addEnemy('jeep', clamp(x0 - s * k * 40, 20, W - 20), -20 - k * 40, { vx: s * rnd(60, 110) }); return true; }
    case 'heli': { const n = 1 + (Math.random() < .5 ? 1 : 0); for (let k = 0; k < n; k++) addEnemy('heli', rnd(60, W - 60), -30 - k * 50, { stopY: rnd(90, 220), dir: Math.random() < .5 ? -1 : 1 }); return true; }
    case 'tank': { const n = 1 + (Math.random() < .3 + S.phase * .05 ? 1 : 0); for (let k = 0; k < n; k++) addEnemy('tank', rnd(50, W - 50), -30 - k * 60, { vx: rnd(-25, 25), aim: Math.PI / 2 }); return true; }
    case 'flak': addEnemy('flak', rnd(60, W - 60), -30, { aim: Math.PI / 2 }); return true;
    case 'base': addEnemy('base', rnd(80, W - 80), -50); return true;
    case 'swarm': { const n = 5 + Math.min(3, S.phase >> 1); for (let k = 0; k < n; k++) addEnemy('swarm', x0, -20 - k * 28, { ph0: k * .5 }); return true; }
    case 'ufo': { const n = 1 + (Math.random() < .5 ? 1 : 0); for (let k = 0; k < n; k++) addEnemy('ufo', rnd(60, W - 60), -30 - k * 50, { stopY: rnd(90, 240) }); return true; }
    case 'rock': { const n = 1 + Math.floor(Math.random() * 2); for (let k = 0; k < n; k++) addRock(rnd(40, W - 40), -40 - k * 70, rnd(20, 30), true, rnd(-40, 40)); return true; }
    case 'beamer': addEnemy('beamer', rnd(60, W - 60), -30, { stopY: rnd(80, 170) }); return true;
    case 'blinker': addEnemy('blinker', rnd(60, W - 60), 120, { mode: 'in', mt: .3, alpha: 0, invuln: true }); return true;
  }
  return false;
}
function aimAt(e, p) { return p ? Math.atan2(p.y - e.y, p.x - e.x) : Math.PI / 2; }
function turnTo(cur, target, max) { let d = target - cur; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return cur + clamp(d, -max, max); }
function updateSceneEnemy(e, t, p, dt, sp, rate, bs) {
  switch (e.type) {
    case 'jeep':
      e.y += (GROUND + 70 * sp) * dt; e.x += e.vx * dt; if (e.x < 20 || e.x > W - 20) e.vx *= -1;
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20 && p) { e.shootT = 1.1; const a = aimAt(e, p); eFire(e, 'metralhadora', e.x, e.y, a - .1, bs * .9, 4); eFire(e, 'metralhadora', e.x, e.y, a + .1, bs * .9, 4); }
      break;
    case 'heli':
      if (e.y < e.stopY || e.stay > 7) e.y += 100 * sp * dt * (e.stay > 7 ? 1.5 : 1);
      else { e.stay += dt; e.x += e.dir * 110 * sp * dt; if (e.x < 40) e.dir = 1; if (e.x > W - 40) e.dir = -1; }
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20 && p) { e.shootT = 1.4; eFire(e, 'metralhadora', e.x, e.y + 10, aimAt(e, p), bs); }
      break;
    case 'tank':
      e.y += (GROUND + 20 * sp) * dt; e.x += e.vx * dt; if (e.x < 30 || e.x > W - 30) e.vx *= -1;
      e.aim = turnTo(e.aim, aimAt(e, p), 1.8 * dt);
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20) { e.shootT = 2 * rnd(.85, 1.15); eFire(e, 'missil', e.x + Math.cos(e.aim) * 26, e.y + Math.sin(e.aim) * 26, e.aim, bs * .85, 7); }
      // metralhadora do tanque: rajada curta entre um míssil e outro
      e.mgT = (e.mgT === undefined ? TANQUE_METRALHA.intervalo / 2 : e.mgT) - dt * rate;
      if (e.mgT <= 0 && e.y > 20 && p) { e.mgT = TANQUE_METRALHA.intervalo;
        for (let w = 0; w < TANQUE_METRALHA.tiros; w++) setTimeoutFx(w * TANQUE_METRALHA.espaco, () => { if (e.dead) return; const q = nearestPlayer(e); if (q) eFire(e, 'metralhadora', e.x, e.y, aimAt(e, q), bs * TANQUE_METRALHA.vel, 3); }); }
      break;
    case 'flak':
      e.y += GROUND * dt; e.aim = turnTo(e.aim, aimAt(e, p), 2 * dt);
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20 && p) {
        e.shootT = 2.4;
        const a = aimAt(e, p), spd = bs * .6, dist = Math.sqrt(d2(e, p));
        S.ebullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 8, d: ETIROS.granada.dano * eDmg(), burst: dist / spd, shell: true, k: 'granada', c: ETYPES.flak.color });
      }
      break;
    case 'base':
      e.y += GROUND * dt;
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 30 && e.y < H - 120) {
        e.shootT = 2.2; e.alt = !e.alt;
        if (e.alt) ring(e.x, e.y, 8 + Math.min(4, S.phase >> 1), bs * .6, 6, undefined, undefined, 'metralhadora');
        else if (p) for (const [dx, dy] of [[-24, -24], [24, -24], [-24, 24], [24, 24]]) eFire(e, 'missil', e.x + dx, e.y + dy, Math.atan2(p.y - e.y - dy, p.x - e.x - dx), bs * .9, 5);
      }
      break;
    case 'swarm':
      e.y += 170 * sp * dt; e.x = e.x0 + Math.sin(e.t * 4 + e.ph0) * 60;
      break;
    case 'ufo':
      if (e.y < e.stopY && !e.stay) e.y += 120 * sp * dt;
      else if (e.stay > 7) e.y += 160 * dt;
      else { e.stay += dt; e.x += Math.sin(e.t * 1.3) * 90 * dt; e.y += Math.cos(e.t * 2) * 30 * dt; }
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20) { e.shootT = 1.8; ring(e.x, e.y, 6, bs * .55, 5, undefined, undefined, 'plasma', ETYPES.ufo.color); }
      break;
    case 'rock':
      e.y += (e.big ? 70 : 110) * sp * dt; e.x += e.vx * dt; e.rot = (e.rot || 0) + e.rs * dt;
      break;
    case 'beamer':
      if (e.y < e.stopY || e.stay > 9) e.y += 100 * sp * dt * (e.stay > 9 ? 1.6 : 1);
      else {
        e.stay += dt;
        e.cool = (e.cool === undefined ? .5 : e.cool) - dt * rate;
        if (e.cool <= 0) { e.cool = 3; beam(e.x, e.y + 20, 28, .9, .5); e.charge = .9; }
      }
      if (e.charge > 0) e.charge -= dt;
      break;
    case 'blinker':
      e.mt -= dt;
      if (e.mode === 'out') {
        e.alpha = Math.max(0, e.mt / .3); e.invuln = true;
        if (e.mt <= 0) { e.x = rnd(50, W - 50); e.y = rnd(70, H * .45); e.mode = 'in'; e.mt = .3; }
      } else if (e.mode === 'in') {
        e.alpha = clamp(1 - e.mt / .3, 0, 1);
        if (e.mt <= 0) {
          e.mode = 'show'; e.mt = 1.6; e.invuln = false; e.alpha = 1;
          for (let w = 0; w < 3; w++) setTimeoutFx(w * .12, () => { if (!e.dead && !e.invuln) { const q = nearestPlayer(e); if (q) eFire(e, 'laser', e.x, e.y, aimAt(e, q), bs * 1.1, 5); } });
        }
      } else if (e.mt <= 0) {
        e.jumps = (e.jumps || 0) + 1;
        if (e.jumps > 5) e.dead = true; else { e.mode = 'out'; e.mt = .3; }
      }
      break;
  }
}
function drawSceneEnemy(e) {
  const t = ETYPES[e.type], f = e.flash > 0, c = f ? '#fff' : t.color, d = f ? '#fff' : t.dark;
  cx.save(); cx.translate(e.x, e.y);
  switch (e.type) {
    case 'jeep':
      cx.fillStyle = '#222'; for (const [x, y] of [[-10, -9], [10, -9], [-10, 9], [10, 9]]) cx.fillRect(x - 3, y - 4, 6, 8);
      cx.fillStyle = c; roundRect(-9, -14, 18, 28, 4); cx.fill();
      cx.fillStyle = d; cx.fillRect(-7, -3, 14, 9); cx.fillStyle = '#333'; cx.fillRect(-1.5, 4, 3, 12);
      break;
    case 'tank':
      cx.fillStyle = '#2a2a22'; cx.fillRect(-20, -22, 8, 44); cx.fillRect(12, -22, 8, 44);
      cx.fillStyle = c; cx.fillRect(-13, -19, 26, 38);
      cx.rotate(e.aim - Math.PI / 2);
      cx.fillStyle = d; cx.fillRect(-3, 0, 6, 28); cx.beginPath(); cx.arc(0, 0, 10, 0, TAU); cx.fill();
      break;
    case 'flak':
      cx.fillStyle = d; cx.fillRect(-18, -18, 36, 36);
      cx.fillStyle = c; cx.beginPath(); cx.arc(0, 0, 13, 0, TAU); cx.fill();
      cx.rotate(e.aim - Math.PI / 2); cx.fillStyle = '#2a2a22'; cx.fillRect(-7, 0, 4, 24); cx.fillRect(3, 0, 4, 24);
      break;
    case 'base':
      cx.fillStyle = f ? '#fff' : '#c9b48a'; roundRect(-44, -44, 88, 88, 10); cx.fill();
      cx.fillStyle = c; cx.fillRect(-34, -34, 68, 68);
      cx.fillStyle = d;
      for (const [x, y] of [[-24, -24], [24, -24], [-24, 24], [24, 24]]) { cx.beginPath(); cx.arc(x, y, 8, 0, TAU); cx.fill(); }
      cx.beginPath(); cx.arc(0, 0, 16, 0, TAU); cx.fill();
      cx.fillStyle = f ? '#fff' : '#c0392b'; cx.beginPath(); cx.arc(0, 0, 6, 0, TAU); cx.fill();
      break;
    case 'heli':
      cx.fillStyle = d; cx.fillRect(-2, -34, 4, 24); cx.fillRect(-7, -36, 14, 3);
      cx.fillStyle = c; cx.beginPath(); cx.ellipse(0, 2, 10, 17, 0, 0, TAU); cx.fill();
      cx.fillStyle = f ? '#fff' : '#bfe6ff'; cx.beginPath(); cx.arc(0, 10, 6, 0, TAU); cx.fill();
      cx.strokeStyle = 'rgba(30,30,30,.6)'; cx.lineWidth = 3; cx.rotate(e.t * 18);
      cx.beginPath(); cx.moveTo(-28, 0); cx.lineTo(28, 0); cx.moveTo(0, -28); cx.lineTo(0, 28); cx.stroke();
      break;
    case 'swarm':
      cx.rotate(Math.cos(e.t * 4 + e.ph0) * .6);
      cx.fillStyle = c; cx.beginPath(); cx.moveTo(0, 12); cx.lineTo(10, -8); cx.lineTo(0, -3); cx.lineTo(-10, -8); cx.closePath(); cx.fill();
      cx.fillStyle = f ? '#fff' : '#ffe14a'; cx.beginPath(); cx.arc(0, 2, 2.5, 0, TAU); cx.fill();
      break;
    case 'ufo':
      cx.fillStyle = f ? '#fff' : '#bfe6ff'; cx.beginPath(); cx.ellipse(0, -2, 10, 10, 0, Math.PI, TAU); cx.fill();
      cx.fillStyle = c; cx.beginPath(); cx.ellipse(0, 2, 23, 8, 0, 0, TAU); cx.fill();
      for (let k = 0; k < 5; k++) { cx.fillStyle = (Math.floor(e.t * 6) + k) % 2 ? '#ffe14a' : d; cx.beginPath(); cx.arc(-14 + k * 7, 3, 2, 0, TAU); cx.fill(); }
      break;
    case 'rock':
      cx.rotate(e.rot || 0); cx.fillStyle = c; cx.beginPath();
      e.shape.forEach((m, k) => { const a = k / e.shape.length * TAU; cx.lineTo(Math.cos(a) * e.r * m, Math.sin(a) * e.r * m); });
      cx.closePath(); cx.fill();
      cx.fillStyle = d;
      cx.beginPath(); cx.arc(e.r * .25, -e.r * .2, e.r * .22, 0, TAU); cx.fill();
      cx.beginPath(); cx.arc(-e.r * .3, e.r * .25, e.r * .15, 0, TAU); cx.fill();
      break;
    case 'beamer':
      cx.fillStyle = d; for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(s * 12, -4); cx.lineTo(s * 28, -14); cx.lineTo(s * 24, 8); cx.closePath(); cx.fill(); }
      cx.fillStyle = c; cx.beginPath(); cx.arc(0, 0, 15, 0, TAU); cx.fill();
      cx.fillStyle = e.charge > 0 && Math.floor(e.charge * 14) % 2 ? '#fff' : '#ffe14a'; cx.beginPath(); cx.arc(0, 6, 6, 0, TAU); cx.fill();
      break;
    case 'blinker':
      cx.globalAlpha = e.alpha === undefined ? 1 : e.alpha;
      cx.fillStyle = c; cx.beginPath(); cx.moveTo(0, -18); cx.lineTo(16, 0); cx.lineTo(0, 18); cx.lineTo(-16, 0); cx.closePath(); cx.fill();
      cx.fillStyle = d; cx.beginPath(); cx.arc(0, 0, 6, 0, TAU); cx.fill();
      cx.globalAlpha = 1;
      break;
  }
  cx.restore();
}
