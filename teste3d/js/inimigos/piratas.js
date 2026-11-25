// ---------- Inimigos do Mar dos Piratas ----------
// Números (tempos, velocidades, quantidades) em PIRATAS_INI (js/dados/inimigos.js).
// Desenhos em arte/inimigos/<tipo>.svg (+ escuna_top, a vela que balança); tiros em js/visual/tiros-inimigos.js.
function spawnPirataWave(type, x0) {
  const P = PIRATAS_INI;
  switch (type) {
    case 'bote': {
      const n = P.bote.grupo, s = Math.random() < .5 ? -1 : 1;
      for (let k = 0; k < n; k++) addEnemy('bote', clamp(x0 + (k - (n - 1) / 2) * 46, 24, W - 24), -24 - k * 30, { ph0: k * .9, vx: s * rnd(15, 35) });
      return true;
    }
    case 'gaivota': {
      const n = P.gaivota.grupo + Math.min(2, S.phase >> 2);
      for (let k = 0; k < n; k++) { const o = k - (n - 1) / 2; addEnemy('gaivota', clamp(x0 + o * 32, 20, W - 20), -20 - Math.abs(o) * 26, { ph0: k * .7 }); }
      som('gaivota', x0);
      return true;
    }
    case 'escuna': {
      const n = 1 + (Math.random() < .25 + S.phase * .04 ? 1 : 0);
      for (let k = 0; k < n; k++) addEnemy('escuna', rnd(70, W - 70), -40 - k * 90, { aim: Math.PI / 2, tiros: 0, vx: rnd(-12, 12) });
      return true;
    }
    case 'balao': addEnemy('balao', rnd(60, W - 60), -40, { stopY: rnd(P.balao.paraMin, P.balao.paraMax), dir: Math.random() < .5 ? -1 : 1 }); return true;
    case 'kraken': {
      const n = 1 + (S.phase >= 4 && Math.random() < .5 ? 1 : 0);
      for (let k = 0; k < n; k++) addEnemy('kraken', rnd(70, W - 70), rnd(90, H * .4), { mode: 'sobe', mt: P.kraken.sobe, sub: 1, invuln: true, cool: .4 });
      som('kraken_sobe');
      return true;
    }
    case 'fantasma': addEnemy('fantasma', rnd(90, W - 90), -50, { alpha: 1, mode: 'aqui', mt: P.fantasma.aparece, cool: 1 }); return true;
  }
  return false;
}

function updatePirataEnemy(e, t, p, dt, sp, rate, bs) {
  const P = PIRATAS_INI;
  switch (e.type) {
    case 'bote': {
      // remando: anda aos trancos (cada remada empurra)
      const remada = .6 + .6 * Math.max(0, Math.sin(e.t * 4 + e.ph0));
      e.y += (GROUND + P.bote.remo * remada * sp) * dt; e.x += e.vx * dt; if (e.x < 24 || e.x > W - 24) e.vx *= -1;
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20 && p) {
        const B = P.bote; e.shootT = B.tiro * rnd(1 - B.variacao, 1 + B.variacao);
        const a = aimAt(e, p);
        eFire(e, 'mosquete', e.x, e.y + 6, a, bs * B.vel, 4);
        S.fx.push({ type: 'smoke', x: e.x + Math.cos(a) * 14, y: e.y + 6 + Math.sin(a) * 14, r: 6, t: 0, life: .35 });
      }
      break;
    }
    case 'gaivota': {
      const G = P.gaivota;
      if (!e.mergulho) {
        e.y += G.desce * sp * dt; e.x = e.x0 + Math.sin(e.t * 2.2 + e.ph0) * 26;
        if (e.y > H * G.mergulhaY && p) { const a = aimAt(e, p); e.mergulho = true; e.vx = Math.cos(a) * G.mergulho * sp; e.vy = Math.max(.35, Math.sin(a)) * G.mergulho * sp; }
      } else { e.x += e.vx * dt; e.y += e.vy * dt; }
      break;
    }
    case 'escuna': {
      const E = P.escuna;
      e.y += (GROUND * .6 + E.desce * sp) * dt; e.x += e.vx * dt; if (e.x < 40 || e.x > W - 40) e.vx *= -1;
      e.aim = turnTo(e.aim, aimAt(e, p), 1.4 * dt);
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 20 && e.y < H - 100) {
        e.shootT = E.canhao * rnd(.85, 1.15); e.tiros++;
        if (e.tiros % 3 === 0) {
          // bordada: canhões dos dois lados do casco, abrindo em leque
          for (const s of [-1, 1]) for (let k = 0; k < E.bordada; k++) {
            const a = (s < 0 ? Math.PI - .6 : .6) + (k - (E.bordada - 1) / 2) * E.bordadaAbre;
            const ox = s * 16, oy = (k - 1) * 12;
            eFire(e, 'balaCanhao', e.x + ox, e.y + oy, a, bs * E.vel, E.raio);
            S.fx.push({ type: 'smoke', x: e.x + ox * 1.6, y: e.y + oy, r: 9, t: 0, life: .5 });
          }
        } else if (p) {
          const mx = e.x + Math.cos(e.aim) * 30, my = e.y + Math.sin(e.aim) * 30;
          eFire(e, 'balaCanhao', mx, my, e.aim, bs * E.vel, E.raio);
          S.fx.push({ type: 'smoke', x: mx, y: my, r: 10, t: 0, life: .5 });
        }
      }
      break;
    }
    case 'balao': {
      const B = P.balao;
      if (e.y < e.stopY || e.stay > B.fica) e.y += B.desce * sp * dt * (e.stay > B.fica ? 1.6 : 1);
      else { e.stay += dt; e.x += e.dir * B.deriva * sp * dt; if (e.x < 50) e.dir = 1; if (e.x > W - 50) e.dir = -1; }
      e.shootT -= dt * rate;
      if (e.shootT <= 0 && e.y > 30 && p) {
        e.shootT = B.barril * rnd(.9, 1.1);
        const a = aimAt(e, p), spd = bs * B.vel, dist = Math.sqrt(d2(e, p));
        S.ebullets.push({ x: e.x, y: e.y + 16, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 9, d: ETIROS.barril.dano * eDmg(), burst: dist / spd, nEst: B.estilhacos, shell: true, k: 'barril', c: ETYPES.balao.color });
        somTiroInimigo('barril', e.x);
      }
      break;
    }
    case 'kraken': {
      const K = P.kraken;
      e.y += GROUND * dt; e.mt -= dt;
      if (e.mode === 'sobe') { e.sub = Math.max(0, e.mt / K.sobe); if (e.mt <= 0) { e.mode = 'fica'; e.mt = K.fica; e.invuln = false; e.sub = 0; } }
      else if (e.mode === 'fica') {
        e.cool -= dt * rate;
        if (e.cool <= 0 && p) {
          e.cool = K.tinta; e.cospe = .25;
          const a = aimAt(e, p);
          for (let k = 0; k < K.tiros; k++) eFire(e, 'tinta', e.x, e.y - 18, a + (k - (K.tiros - 1) / 2) * K.abre, bs * K.vel, 7);
        }
        if (e.cospe > 0) e.cospe -= dt;
        if (e.mt <= 0) { e.mode = 'afunda'; e.mt = K.afunda; e.invuln = true; som('kraken_sobe', e.x, -4, .7); }
      } else { e.sub = 1 - Math.max(0, e.mt / K.afunda); if (e.mt <= 0) e.dead = true; }
      break;
    }
    case 'fantasma': {
      const F = P.fantasma;
      e.y += (GROUND * .5 + F.desce * sp) * dt; e.x = e.x0 + Math.sin(e.t * .7) * 40;
      e.mt -= dt;
      if (e.mode === 'aqui') {
        e.alpha = 1; e.invuln = false;
        e.cool -= dt * rate;
        if (e.cool <= 0 && e.y > 20) {
          e.cool = F.recarga; e.alt = !e.alt;
          if (e.alt) ring(e.x, e.y, F.anel, bs * F.velAnel, 7, undefined, undefined, 'chamaFantasma', ETYPES.fantasma.color);
          else if (p) { const a = aimAt(e, p); for (let k = 0; k < F.mira; k++) eFire(e, 'chamaFantasma', e.x, e.y + 20, a + (k - (F.mira - 1) / 2) * .22, bs * F.velMira, 7); }
        }
        if (e.mt <= 0) { e.mode = 'some'; e.mt = F.fade; som('navio_fantasma', e.x); }
      } else if (e.mode === 'some') {
        e.alpha = Math.max(.12, e.mt / F.fade); e.invuln = true;
        if (e.mt <= 0) { e.mode = 'longe'; e.mt = F.some; e.x0 = clamp(e.x0 + rnd(-260, 260), 90, W - 90); }
      } else if (e.mode === 'longe') {
        e.alpha = .12; e.invuln = true;
        if (e.mt <= 0) { e.mode = 'volta'; e.mt = F.fade; som('navio_fantasma', e.x, 3); }
      } else {
        e.alpha = Math.max(.12, 1 - e.mt / F.fade); e.invuln = true;
        if (e.mt <= 0) { e.mode = 'aqui'; e.mt = F.aparece; e.cool = .5; }
      }
      break;
    }
  }
}
