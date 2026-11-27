// ---------- Atualização ----------
function step(dt) {
  bgScroll += dt * (S.mode === 'play' || S.mode === 'title' || (S.mode === 'ship' && !S.ss.add) ? 60 : 0);
  titleT += dt;
  if (S.mode === 'ship') { stepShip(dt); return; }
  if (S.mode === 'levelup' || S.mode === 'reward') {
    const s = S.sel;
    if (s.lock > 0) s.lock -= dt;
    if (s.closeT !== undefined) { s.closeT -= dt; if (s.closeT <= 0) closeSel(); }
    return;
  }
  if (S.mode !== 'play') return;

  for (let k = delayed.length - 1; k >= 0; k--) { delayed[k].t -= dt; if (delayed[k].t <= 0) { delayed[k].fn(); delayed.splice(k, 1); } }
  if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
  if (S.skinMsg) { S.skinMsg.t -= dt; if (S.skinMsg.t <= 0) S.skinMsg = null; }
  if (S.players) for (const p of S.players) { skinTrail(p, dt); fenixBrasas(p, dt); }
  if (S.shake > 0) S.shake -= dt;
  impPasso(dt); // efeitos só visuais (js/visual/impacto.js)

  // fase / chefão
  S.phaseT += dt;
  if (!S.bossSpawned) {
    if (S.phaseT < PHASE_LEN) {
      S.spawnT -= dt;
      if (S.spawnT <= 0) { spawnWave(); S.spawnT = Math.max(1.05, 2.9 - .15 * S.phase) * rnd(.8, 1.2) * (S.np === 2 ? .9 : 1) / Math.pow(W / 540, .6); }
    } else {
      S.bossSpawned = true; S.bossTimer = BOSS_ESPERA; S.banner = { t: 2.5, text: 'Chefão chegando!' };
    }
  } else if (S.bossTimer > 0) {
    S.bossTimer -= dt; if (S.bossTimer <= 0) spawnBoss();
  }
  if (S.rewardT > 0) { S.rewardT -= dt; if (S.rewardT <= 0) { openReward(); return; } }
  if (S.overT > 0) { S.overT -= dt; if (S.overT <= 0) { S.mode = 'gameover'; return; } }

  // jogadores
  const one = S.np === 1;
  S.players.forEach((p, i) => {
    if (!p.alive) return;
    if (p.ovoT > 0) { ovoPasso(p, dt); return; } // ovo da Fênix: parado até renascer (js/naves/fenix.js)
    let mx = 0, my = 0;
    const k1 = i === 0, k2 = i === 1 || one;
    if (k1) { if (keys.KeyA) mx--; if (keys.KeyD) mx++; if (keys.KeyW) my--; if (keys.KeyS) my++; }
    if (k2) { if (keys.ArrowLeft) mx--; if (keys.ArrowRight) mx++; if (keys.ArrowUp) my--; if (keys.ArrowDown) my++; }
    const pm = padMov[one ? 0 : i];
    if (pm.on) { mx += pm.x; my += pm.y; }
    mx = clamp(mx, -1, 1); my = clamp(my, -1, 1);
    const len = Math.max(1, Math.hypot(mx, my)); // analógico do controle pode ir mais devagar
    if (mx || my) { const l = Math.hypot(mx, my); p.dirX = mx / l; p.dirY = my / l; } // direção do Mergulho de rapina
    p.x += mx / len * p.spd * dt; p.y += my / len * p.spd * dt;
    if (i === 0 && S.touch && S.touch.cx !== undefined) {
      const tx = S.touch.px + (S.touch.cx - S.touch.x), ty = S.touch.py + (S.touch.cy - S.touch.y);
      const dx = tx - p.x, dy = ty - p.y, dd = Math.hypot(dx, dy), mv = p.spd * 1.4 * dt;
      if (dd > 1) { p.x += dx / dd * Math.min(dd, mv); p.y += dy / dd * Math.min(dd, mv); mx = Math.sign(dx); }
    }
    p.x = clamp(p.x, 20, W - 20); p.y = clamp(p.y, 80, H - 70);
    mergulhoPasso(p, dt); // habilidade do Falcão (js/naves/habilidades.js)
    p.tilt += (mx - p.tilt) * Math.min(1, dt * 10);
    if (p.inv > 0) p.inv -= dt;
    if (p.regen) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
    p.shT -= dt;
    if (p.shT <= 0 && p.sh < p.maxSh) p.sh = Math.min(p.maxSh, p.sh + p.maxSh * .3 * dt);
    firePlayer(p, dt);
  });

  // tiros do jogador
  const T = targets();
  for (const b of S.bullets) {
    if (PIRATA_BALA[b.type]) { PIRATA_BALA[b.type](b, dt, T); continue; } // onda, barril, redemoinho (js/naves/pirata.js)
    if (FENIX_BALA[b.type]) { FENIX_BALA[b.type](b, dt, T); continue; }   // chama, meteoro, sol (js/naves/fenix.js)
    if (HYPNOS_BALA[b.type]) { HYPNOS_BALA[b.type](b, dt, T); continue; } // grito, ímã (js/naves/hypnos.js)
    if (HAB_BALA[b.type]) { HAB_BALA[b.type](b, dt, T); continue; }       // míssil do Bombardeio, Onda psíquica (js/naves/habilidades.js)
    skinBoomTrail(b, dt);
    if (b.anc && moveAncora(b, dt)) continue;
    if (b.homing) {
      let best = null, bd = 1e12;
      for (const t of T) if (!t.dead) { const dd = d2(t, b); if (dd < bd) { bd = dd; best = t; } }
      if (best) {
        const a = Math.atan2(b.vy, b.vx), ta = Math.atan2(best.y - b.y, best.x - b.x);
        let da = ta - a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        const na = a + clamp(da, -5 * dt, 5 * dt), sp = Math.hypot(b.vx, b.vy) + 300 * dt;
        b.vx = Math.cos(na) * Math.min(sp, 620); b.vy = Math.sin(na) * Math.min(sp, 620);
      }
    }
    if (b.boom) {
      b.age += dt; b.rot += dt * 16;
      const sp = Math.hypot(b.vx, b.vy) || 1;
      if (!b.ret) {
        const dec = WEAPONS.boomerang.spd ** 2 / (2 * b.range), ns = sp - dec * dt;
        if (ns <= 40 || b.y < 24) { b.ret = true; b.hitT.clear(); }
        else { b.vx *= ns / sp; b.vy *= ns / sp; }
      } else {
        const o = b.p, dx = o.x - b.x, dy = o.y - b.y, dd = Math.hypot(dx, dy) || 1;
        const ns = Math.min(780, Math.max(sp, 60) + 950 * dt), k = Math.min(1, 9 * dt);
        b.vx += (dx / dd * ns - b.vx) * k; b.vy += (dy / dd * ns - b.vy) * k;
        if (o.alive && dd < o.r + 14) { b.dead = true; som('bumerangue_pega', o.x); S.fx.push({ type: 'ring', x: o.x, y: o.y - 6, r: 16, t: 0, life: .18, color: b.color }); continue; }
      }
    }
    if (b.type === 'barrage') {
      const sp = Math.hypot(b.vx, b.vy) || 1, ns = Math.min(b.max, sp + b.acc * dt);
      b.vx *= ns / sp; b.vy *= ns / sp;
      b.smokeT -= dt;
      if (b.smokeT <= 0) { b.smokeT = .045; S.fx.push({ type: 'smoke', x: b.x - b.vx / ns * 8, y: b.y - b.vy / ns * 8, r: 2.2, t: 0, life: .25 }); }
    }
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.type === 'ricochet' && b.bounce > 0) {
      let hw = false;
      if (b.x < b.r && b.vx < 0) { b.vx = -b.vx; hw = true; }
      if (b.x > W - b.r && b.vx > 0) { b.vx = -b.vx; hw = true; }
      if (b.y < 56 && b.vy < 0) { b.vy = -b.vy; hw = true; }
      if (b.y > H - b.r && b.vy > 0) { b.vy = -b.vy; hw = true; }
      if (hw) { b.bounce--; b.hit = null; som('ricochete_quique', b.x); S.fx.push({ type: 'spark', x: b.x, y: b.y, vx: rnd(-60, 60), vy: rnd(-60, 60), t: 0, life: .15, color: b.color }); }
    }
    if (b.life <= 0 || (!b.boom && !b.anc && (b.y < -30 || b.y > H + 30 || b.x < -30 || b.x > W + 30))) { b.dead = true; continue; }
    if (S.bosses.length && shieldBlocks(b)) {
      som('escudo_bloqueio', b.x);
      S.fx.push({ type: 'spark', x: b.x, y: b.y, vx: rnd(-80, 80), vy: rnd(-80, 0), t: 0, life: .2, color: '#78e6ff' });
      if (b.boom) { if (!b.ret) { b.ret = true; b.hitT.clear(); } }
      else if (b.anc) voltaAncora(b);
      else { b.dead = true; continue; }
    }
    for (const t of T) {
      if (t.dead || t.invuln || (b.hit && b.hit.has(t))) continue;
      if ((b.boom || b.anc) && (b.hitT.get(t) || 0) > b.age) continue;
      if (b.anc && t.preso && !t.preso.dead) continue; // o inimigo preso na âncora já levou o golpe
      if (d2(t, b) < (t.r + b.r) ** 2) {
        dealDmg(t, b.dmg, b.p, b.type);
        if (b.queima) aplicaQueima(t, b.p, b.queima); // penas da Fênix
        if (b.hip) marcaHipnose(t, b.p, b.hip);       // espirais da Hypnos
        if (b.explo) {
          explode(b.x, b.y, b.explo, b.dmg * (b.splash || .6), b.p);
          if (b.type === 'barrage') S.fx.push({ type: 'boom', x: b.x, y: b.y, r: b.explo * .55, t: 0, life: .3, color: '#ffb040' });
        }
        else S.fx.push({ type: 'spark', x: b.x, y: b.y, vx: rnd(-60, 60), vy: rnd(-60, 0), t: 0, life: .15, color: b.color });
        if (b.boom) { b.hitT.set(t, 1e9); continue; } // 1 acerto na ida e 1 na volta
        if (b.anc) { b.hitT.set(t, 1e9); if (!t.dead) ancoraAcerta(b, t); continue; }
        if (b.type === 'ricochet' && b.bounce > 0) {
          const dx = b.x - t.x, dy = b.y - t.y, dd = Math.hypot(dx, dy) || 1, nx = dx / dd, ny = dy / dd, dot = b.vx * nx + b.vy * ny;
          if (dot < 0) { b.vx -= 2 * dot * nx; b.vy -= 2 * dot * ny; }
          b.bounce--; b.hit = new Set([t]);
          break;
        }
        if (b.pierce > 0) { b.pierce--; (b.hit = b.hit || new Set()).add(t); }
        else { b.dead = true; break; }
      }
    }
  }
  S.bullets = S.bullets.filter(b => !b.dead);

  updateSaws(dt);
  updatePapagaios(dt);
  updateDragoes(dt);
  updateFilhotes(dt);
  updateAliados(dt);   // aliados hipnotizados (js/naves/hypnos.js)
  updateHab(dt);       // habilidades ativas (js/naves/habilidades.js)
  updateQueimas(dt);
  updateEnemies(dt);
  arrastaPresos();
  updateBosses(dt);
  updateHazards(dt);

  // tiros inimigos
  for (const e of S.ebullets) {
    if (e.home) {
      e.life -= dt; if (e.life <= 0) { e.dead = true; continue; }
      const p = nearestPlayer(e);
      if (p) { const a = Math.atan2(e.vy, e.vx), ta = Math.atan2(p.y - e.y, p.x - e.x); let da = ta - a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        const na = a + clamp(da, -1.6 * dt, 1.6 * dt), sp = 150; e.vx = Math.cos(na) * sp; e.vy = Math.sin(na) * sp; }
    }
    if (e.burst !== undefined) { e.burst -= dt; if (e.burst <= 0) { e.dead = true; boom(e.x, e.y, 22, e.kEst ? e.c : '#ffb040'); ring(e.x, e.y, e.nEst || 8, ebs() * .5, 5, undefined, e.bd, e.bd ? 'chefao' : (e.kEst || 'bala'), e.kEst ? e.c : undefined); continue; } }
    if (e.k === 'missil') { e.st = (e.st || 0) - dt; if (e.st <= 0) { e.st = .05; const v = Math.hypot(e.vx, e.vy) || 1; S.fx.push({ type: 'smoke', x: e.x - e.vx / v * e.r * 2.4, y: e.y - e.vy / v * e.r * 2.4, r: e.r * .35, t: 0, life: .3 }); } }
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (e.y < -40 || e.y > H + 20 || e.x < -20 || e.x > W + 20) { e.dead = true; continue; }
    for (const p of S.players) if (p.alive && d2(p, e) < (p.r - 5 + e.r) ** 2) { hurt(p, e.d); e.dead = true; break; }
  }
  S.ebullets = S.ebullets.filter(e => !e.dead);

  // cristais de XP
  for (const g of S.gems) {
    let got = null;
    for (const p of S.players) {
      if (!p.alive) continue;
      const dd = Math.sqrt(d2(p, g));
      if (dd < p.r + 8) { got = p; break; }
      if (dd < p.mag) { const s = 520 * dt / dd; g.x += (p.x - g.x) * Math.min(1, s); g.y += (p.y - g.y) * Math.min(1, s); g.pulled = true; }
    }
    if (got) { g.dead = true; addXp(g.v); somXp(g.x); continue; }
    if (!g.pulled) g.y += 50 * dt;
    g.pulled = false;
    if (g.y > H + 20) g.dead = true;
  }
  S.gems = S.gems.filter(g => !g.dead);

  // efeitos
  for (const f of S.fx) { f.t += dt; if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; } }
  S.fx = S.fx.filter(f => f.t < f.life);

  if (S.pendingLv > 0 && S.mode === 'play' && S.overT <= 0) openLevelUp();
}
