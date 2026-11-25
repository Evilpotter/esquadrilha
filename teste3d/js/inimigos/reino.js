// ---------- Inimigos do Reino Encantado (desde 1.2.0) ----------
// Cenário de fantasia que combina com a Fênix. Números em REINO_INI (js/dados/inimigos.js).
// Desenhos em arte/inimigos/<tipo>.svg (+ gargula_pedra); tiros em js/visual/tiros-inimigos.js.
function spawnReinoWave(type, x0) {
  const R = REINO_INI;
  switch (type) {
    case 'mago': {
      const n = R.mago.grupo + (S.phase >= 4 && Math.random() < .5 ? 1 : 0);
      for (let k = 0; k < n; k++) addEnemy('mago', clamp(x0 + (k - (n - 1) / 2) * 90, 40, W - 40), -24 - k * 40,
        { stopY: rnd(R.mago.paraMin, R.mago.paraMax), ph0: k * 1.7, cool: .6 + k * .5 });
      return true;
    }
    case 'grifo': {
      const n = R.grifo.grupo + Math.min(2, S.phase >> 2), side = Math.random() < .5 ? -1 : 1, cy = rnd(80, 190);
      for (let k = 0; k < n; k++) addEnemy('grifo', side < 0 ? -40 : W + 40, cy + k * 16, { side, delay: k * .3, cy: cy + k * 16 });
      som('grifo_grito', side < 0 ? 0 : W);
      return true;
    }
    case 'draco': {
      const n = 1 + (Math.random() < .3 + S.phase * .05 ? 1 : 0);
      for (let k = 0; k < n; k++) addEnemy('draco', rnd(70, W - 70), -30 - k * 70, { ph0: rnd(0, 6), cool: rnd(.8, 1.6) });
      return true;
    }
    case 'bruxa':
      addEnemy('bruxa', rnd(60, W - 60), -40, { stopY: rnd(R.bruxa.paraMin, R.bruxa.paraMax), dir: Math.random() < .5 ? -1 : 1, cool: 1 });
      som('bruxa_risada');
      return true;
    case 'gargula': {
      const n = 1 + (S.phase >= 4 && Math.random() < .5 ? 1 : 0);
      for (let k = 0; k < n; k++) addEnemy('gargula', rnd(70, W - 70), -40 - k * 80, { mode: 'pedra', mt: R.gargula.pedra * rnd(.6, 1), pedra: 1, invuln: true, cool: .5 });
      return true;
    }
    case 'anciao':
      addEnemy('anciao', rnd(120, W - 120), -60, { mode: 'chega', cool: 1.2, alt: false, aviso: 0 });
      som('anciao_rugido');
      return true;
  }
  return false;
}

function updateReinoEnemy(e, t, p, dt, sp, rate, bs) {
  const R = REINO_INI;
  switch (e.type) {
    case 'mago': {
      // desce, para no alto voando em zigue-zague na vassoura, atira estrelas miradas e vai embora
      const M = R.mago, vai = e.stay > M.fica;
      if (e.y < e.stopY || vai) e.y += M.desce * sp * dt * (vai ? 1.5 : 1); else e.stay += dt;
      e.x = clamp(e.x0 + Math.sin(e.t * 1.6 + e.ph0) * M.zigue, 20, W - 20);
      e.cool -= dt * rate;
      if (e.cool <= 0 && e.y > 30 && !vai && p) {
        e.cool = M.estrela * rnd(.85, 1.15);
        eFire(e, 'estrela', e.x, e.y + 14, aimAt(e, p), bs * M.vel, 7);
        S.fx.push({ type: 'spark', x: e.x, y: e.y + 14, vx: 0, vy: 30, t: 0, life: .3, color: '#FFD84A' });
      }
      break;
    }
    case 'grifo': {
      // entra pelo lado em curva e mergulha na nave (não atira)
      const G = R.grifo;
      if (e.t < e.delay) break;
      const tt = e.t - e.delay;
      if (!e.mergulho) {
        e.x += -e.side * G.vem * Math.max(1, W / 1200) * sp * dt;
        e.y = e.cy + Math.sin(tt * 2.2) * 40;
        if (tt > G.curva && p) { const a = aimAt(e, p); e.mergulho = true; e.vx = Math.cos(a) * G.mergulho * sp; e.vy = Math.max(.3, Math.sin(a)) * G.mergulho * sp; }
      } else { e.x += e.vx * dt; e.y += e.vy * dt; }
      break;
    }
    case 'draco': {
      // voa em zigue-zague largo e cospe 3 bolas de fogo em leque
      const D = R.draco;
      e.y += D.desce * sp * dt; e.x = clamp(e.x0 + Math.sin(e.t * 1.3 + e.ph0) * D.onda, 24, W - 24);
      e.cool -= dt * rate;
      if (e.cool <= 0 && e.y > 20 && e.y < H - 160 && p) {
        e.cool = D.cospe * rnd(.85, 1.15); e.cospe = .25;
        const a = aimAt(e, p);
        for (let k = 0; k < D.tiros; k++) eFire(e, 'bolaFogo', e.x, e.y + 16, a + (k - (D.tiros - 1) / 2) * D.abre, bs * D.vel, 6);
      }
      if (e.cospe > 0) e.cospe -= dt;
      break;
    }
    case 'bruxa': {
      // para no alto, desliza para os lados e joga poção que estoura em gotas
      const B = R.bruxa;
      if (e.y < e.stopY || e.stay > B.fica) e.y += B.desce * sp * dt * (e.stay > B.fica ? 1.6 : 1);
      else { e.stay += dt; e.x += e.dir * B.deriva * sp * dt; if (e.x < 50) e.dir = 1; if (e.x > W - 50) e.dir = -1; }
      e.cool -= dt * rate;
      if (e.cool <= 0 && e.y > 30 && p) {
        e.cool = B.pocao * rnd(.9, 1.1);
        const a = aimAt(e, p), spd = bs * B.vel, dist = Math.sqrt(d2(e, p));
        S.ebullets.push({ x: e.x, y: e.y + 16, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 8, d: ETIROS.pocao.dano * eDmg(), burst: dist / spd,
          nEst: B.gotas, kEst: 'gota', shell: true, k: 'pocao', c: ETYPES.bruxa.color });
        somTiroInimigo('pocao', e.x);
      }
      break;
    }
    case 'gargula': {
      // vira pedra (não leva dano, não atira) e acorda (olhos vermelhos): anel de lascas e leque mirado
      const G = R.gargula;
      e.y += G.desce * sp * dt; e.mt -= dt;
      if (e.mode === 'pedra') {
        e.pedra = Math.min(1, (e.pedra || 0) + dt * 4); e.invuln = true;
        if (e.mt <= 0 && e.y > 40) { e.mode = 'acorda'; e.mt = G.acorda; e.invuln = false; e.cool = .35; som('gargula_acorda', e.x); }
      } else {
        e.pedra = Math.max(0, e.pedra - dt * 4);
        e.cool -= dt * rate;
        if (e.cool <= 0) {
          e.cool = G.mira; e.alt = !e.alt;
          if (e.alt) ring(e.x, e.y, G.anel, bs * G.velAnel, 6, undefined, undefined, 'pedra', ETYPES.gargula.color);
          else if (p) { const a = aimAt(e, p); for (let k = 0; k < G.tiros; k++) eFire(e, 'pedra', e.x, e.y + 18, a + (k - (G.tiros - 1) / 2) * G.abre, bs * G.vel, 6); }
        }
        if (e.mt <= 0) { e.mode = 'pedra'; e.mt = G.pedra; }
      }
      break;
    }
    case 'anciao': {
      // chega, fica no alto balançando; alterna sopro em leque mirado (com aviso) e anel de bolas de fogo; depois vai embora
      const A = R.anciao;
      if (e.mode === 'chega') { e.y += A.desce * sp * dt * 2; if (e.y >= A.paraY) e.mode = 'fica'; }
      else if (e.mode === 'fica') {
        e.stay += dt; e.x = clamp(e.x0 + Math.sin(e.t * .6) * 90, 60, W - 60);
        if (e.aviso > 0) {
          e.aviso -= dt;
          if (p && e.aviso > .25) e.mira = aimAt(e, p);
          if (e.aviso <= 0) {
            for (let k = 0; k < A.sopro; k++) eFire(e, 'sopro', e.x, e.y + 40, e.mira + (k - (A.sopro - 1) / 2) * A.abre / (A.sopro - 1), bs * A.velSopro * rnd(.9, 1.1), 8);
            som('anciao_sopro', e.x);
          }
        } else {
          e.cool -= dt * rate;
          if (e.cool <= 0) {
            e.cool = A.recarga; e.alt = !e.alt;
            if (e.alt && p) { e.aviso = A.aviso; e.mira = aimAt(e, p); }
            else { ring(e.x, e.y, A.asas, bs * A.velAsas, 7, undefined, undefined, 'bolaFogo', ETYPES.anciao.color); som('anciao_rugido', e.x, 2, .6); }
          }
        }
        if (e.stay > A.fica && !(e.aviso > 0)) e.mode = 'vai';
      } else e.y += A.desce * sp * dt * 1.6;
      break;
    }
  }
}
