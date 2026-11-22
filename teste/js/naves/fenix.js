// ---------- Fênix: penas de fogo, queimadura, renascer e armas de fogo ----------
// Números em js/dados/armas.js (WEAPONS feather/wings/meteor/chick/sun e FENIX).
// Desenho em js/visual/fenix.js. Tudo automático: nenhuma tecla nova.

// ---------- Queimadura (dano contínuo) ----------
// cada aplicação acende mais uma chama (até FENIX.queima.max) e renova o tempo
// dps = dano por segundo de cada chama (já com os bônus de quem queimou)
function aplicaQueima(t, p, dps, chamas) {
  if (!t || t.dead || t.invuln) return;
  const Q = FENIX.queima, acesa = t.burnT > 0;
  t.burnN = Math.min(Q.max, (acesa ? t.burnN : 0) + (chamas || 1));
  t.burnDps = Math.max(acesa ? t.burnDps : 0, dps);
  t.burnT = Q.tempo;
  t.burnP = p;
  if (!(t.burnTick > 0)) t.burnTick = Q.tick;
}
function dpsQueima(p, w) { return FENIX.queima.dps * p.dmg * (w ? w.dmgM : 1); }
function updateQueimas(dt) {
  const Q = FENIX.queima;
  for (const t of targets()) {
    if (t.dead || !(t.burnT > 0)) continue;
    t.burnT -= dt; t.burnTick -= dt;
    if (t.burnTick <= 0) {
      t.burnTick += Q.tick;
      if (!t.invuln) dealDmg(t, t.burnN * t.burnDps * Q.tick, t.burnP, 'burn');
    }
    if (t.burnT <= 0) { t.burnT = 0; t.burnN = 0; }
  }
}

// ---------- Disparos (chamado por firePlayer quando a recarga termina) ----------
// devolve false para não contar o disparo (tenta de novo logo)
const FENIX_TIRO = {
  feather(p, w, d, dmg, n, col) {
    somTiro('feather', p.x);
    const F = FENIX.pena, arc = Math.min(1.3, F.abertura + .08 * (n - 3)), q = dpsQueima(p, w);
    for (let k = 0; k < n; k++) {
      const ang = n === 1 ? 0 : -arc / 2 + arc * k / (n - 1);
      S.bullets.push({ x: p.x + Math.sin(ang) * 10, y: p.y - 16, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd, r: d.r, dmg, p,
        pierce: w.pierce, hit: null, explo: w.explosive, color: col, sk: p.skin, life: F.vida, vida: F.vida, type: 'feather', queima: q });
    }
    return true;
  },
  wings(p, w, d, dmg, n) {
    const A = FENIX.asas, vida = A.vida * (1 + A.maisVida * w.pierce / 2), q = dpsQueima(p, w);
    for (let k = 0; k < n; k++) {
      const o = k - (n - 1) / 2;
      S.bullets.push({ x: p.x + o * 30 + rnd(-4, 4), y: p.y + 22 + rnd(-3, 3), vx: 0, vy: 0, r: 0, R: d.r, dmg, p, type: 'chama',
        life: vida, vida, tick: 0, queima: q, sk: p.skin, seed: rnd(0, 6) });
    }
    if (Math.random() < .25) somTiro('wings', p.x);
    return true;
  },
  meteor(p, w, d, dmg, n) {
    const T = targets().filter(t => !t.dead && !t.invuln && t.y > 40 && t.y < H - 40);
    if (!T.length) return false;
    const M = FENIX.meteoro, q = dpsQueima(p, w);
    // um meteoro por inimigo (os mais perto primeiro); sobrando meteoro, cai perto de um deles
    const alvos = T.slice().sort((a, b) => d2(a, p) - d2(b, p));
    somTiro('meteor', p.x);
    for (let k = 0; k < n; k++) {
      const t = alvos[k % alvos.length], extra = k >= alvos.length;
      // mira um pouco à frente de quem anda
      const lead = M.aviso + M.queda, vx = t.vx || 0, vy = t.boss ? 0 : (t.vy || 60);
      const x = clamp(t.x + (t.boss ? 0 : vx * lead * .5) + (extra ? rnd(-70, 70) : 0), 30, W - 30);
      const y = clamp(t.y + (t.boss ? 0 : vy * lead * .5) + (extra ? rnd(-50, 50) : 0), 60, H - 40);
      S.bullets.push({ x, y, vx: 0, vy: 0, r: 0, dmg, p, type: 'meteor', R: w.explosive, aviso: M.aviso + k * .12, queda: M.queda,
        t: 0, queima: q, life: 9, rot: rnd(0, 6) });
    }
    return true;
  },
  sun(p, w, d, dmg, n) {
    if (!targets().some(t => !t.dead && t.y > 0)) return false;
    const chamas = FENIX.sol.chamas + w.pierce, q = dpsQueima(p, w);
    for (let k = 0; k < n; k++) {
      const game = S;
      setTimeoutFx(k * .4, () => {
        if (S !== game || !p.alive) return;
        somTiro('sun', p.x);
        S.bullets.push({ x: p.x, y: p.y, vx: 0, vy: 0, R: 10, r: 0, dmg, p, type: 'sun', spd: d.spd, chamas, queima: q, life: 9, hit: new Set() });
      });
    }
    return true;
  },
};

// ---------- Balas especiais (atualizadas no laço de tiros) ----------
const FENIX_BALA = {
  // chama parada do rastro das Asas de fogo
  chama(b, dt, T) {
    b.life -= dt; b.tick -= dt;
    if (b.tick <= 0) {
      b.tick = FENIX.asas.tick;
      for (const t of T) if (!t.dead && !t.invuln && d2(t, b) < (b.R + t.r) ** 2) {
        dealDmg(t, b.dmg, b.p, 'burn'); aplicaQueima(t, b.p, b.queima);
      }
    }
    if (b.life <= 0) b.dead = true;
  },
  meteor(b, dt) {
    b.t += dt; b.rot += dt * 5;
    if (b.t < b.aviso + b.queda) return;
    b.dead = true;
    boom(b.x, b.y, b.R * .8, '#ff7a2a');
    S.shake = Math.max(S.shake, .12);
    explode(b.x, b.y, b.R, b.dmg, b.p);
    for (const t of targets()) if (!t.dead && d2(t, b) < (b.R + t.r) ** 2) aplicaQueima(t, b.p, b.queima);
    for (let k = 0; k < 8; k++) S.fx.push({ type: 'spark', x: b.x, y: b.y, vx: rnd(-220, 220), vy: rnd(-220, 120), t: 0, life: rnd(.3, .7), color: k % 2 ? '#ffd23a' : '#ff6a2a' });
  },
  sun(b, dt, T) {
    b.R += b.spd * dt; b.life -= dt;
    for (const t of T) {
      if (t.dead || b.hit.has(t)) continue;
      if (d2(t, b) < (b.R + t.r) ** 2) {
        b.hit.add(t);
        if (!t.invuln) { dealDmg(t, b.dmg, b.p, 'burn'); aplicaQueima(t, b.p, b.queima, b.chamas); }
      }
    }
    // derrete os tiros dos inimigos que a borda da onda alcança
    const fx = FENIX.sol.raioTiro;
    for (const e of S.ebullets) {
      if (e.dead) continue;
      const dd = Math.sqrt(d2(e, b));
      if (dd < b.R + fx && dd > b.R - fx - 30) {
        e.dead = true;
        S.fx.push({ type: 'spark', x: e.x, y: e.y, vx: rnd(-40, 40), vy: rnd(-60, 0), t: 0, life: .25, color: '#ffd23a' });
      }
    }
    if (b.R > Math.hypot(W, H) + 60 || b.life <= 0) b.dead = true;
  },
};

// ---------- Filhotes de fênix (voam junto e mergulham nos inimigos) ----------
function filhoteCasa(p, k) {
  const s = k % 2 ? 1 : -1, j = k >> 1;
  return { x: p.x + s * (40 + j * 22), y: p.y + 6 + j * 16 + Math.sin(S.phaseT * 3 + k * 1.7) * 5 };
}
function updateFilhotes(dt) {
  const T = targets(), d = WEAPONS.chick, F = FENIX.filhote;
  for (const p of S.players) {
    if (!p.alive) continue;
    for (const w of p.weapons) {
      if (w.type !== 'chick') continue;
      if (!w.birds) w.birds = [];
      const dmg = d.dmg * w.dmgM * p.dmg, cd = d.cd * w.cdM / p.rate, q = dpsQueima(p, w);
      for (let k = 0; k < w.shots; k++) {
        const casa = filhoteCasa(p, k);
        const bd = w.birds[k] || (w.birds[k] = { x: casa.x, y: casa.y, cool: k * .3, alvo: null, dir: -Math.PI / 2, flap: k });
        bd.cool -= dt; bd.flap += dt * 16;
        if (bd.alvo && (bd.alvo.dead || bd.alvo.invuln)) bd.alvo = null;
        if (!bd.alvo && bd.cool <= 0) { // escolhe o inimigo mais perto que ainda não está queimando forte
          let best = null, bdd = F.alcance * F.alcance;
          for (const t of T) {
            if (t.dead || t.invuln || t.y < 20) continue;
            const dd = d2(t, p) * (t.burnN >= FENIX.queima.max ? 2 : 1);
            if (dd < bdd) { bdd = dd; best = t; }
          }
          bd.alvo = best;
        }
        const ga = bd.alvo, gx = ga ? ga.x : casa.x, gy = ga ? ga.y : casa.y;
        const dx = gx - bd.x, dy = gy - bd.y, dd = Math.hypot(dx, dy) || 1;
        const mv = Math.min(dd, (ga ? F.mergulho : F.voo * (dd > 60 ? 2 : 1)) * dt);
        bd.x += dx / dd * mv; bd.y += dy / dd * mv;
        if (dd > 3) bd.dir = Math.atan2(dy, dx);
        if (ga && d2(ga, bd) < (ga.r + d.r) ** 2) {
          dealDmg(ga, dmg, p, 'chick'); aplicaQueima(ga, p, q);
          som('filhote', bd.x);
          if (w.explosive) explode(bd.x, bd.y, w.explosive, dmg * .6, p);
          for (let m = 0; m < 5; m++) S.fx.push({ type: 'spark', x: bd.x, y: bd.y, vx: rnd(-120, 120), vy: rnd(-120, 60), t: 0, life: rnd(.2, .4), color: m % 2 ? '#ffd23a' : '#ff7a2a' });
          bd.alvo = null; bd.cool = cd;
        }
      }
    }
  }
}

// ---------- Renascer ----------
// chamado por hurt() quando um jogador ia cair. Devolve true se ele virou ovo.
// A própria Fênix usa o renascer dela; se outro jogador cair, uma Fênix viva gasta o renascer para salvá-lo.
function renascerDisponivel(q) { return SHIPS[q.ship].renascer && q.renasceFase !== S.phase; }
function fenixSalva(p) {
  let dono = null;
  if (renascerDisponivel(p)) dono = p;
  else dono = S.players.find(q => q !== p && q.alive && !(q.ovoT > 0) && renascerDisponivel(q)) || null;
  if (!dono) return false;
  const R = FENIX.renascer;
  dono.renasceFase = S.phase;
  p.hp = 0; p.ovoT = p.ovoMax = R.ovo; p.dragonT = 0; p.inv = 0;
  som('fenix_ovo', p.x);
  S.fx.push({ type: 'ring', x: p.x, y: p.y, r: 60, t: 0, life: .4, color: '#ffd23a' });
  for (let k = 0; k < 10; k++) S.fx.push({ type: 'spark', x: p.x, y: p.y, vx: rnd(-160, 160), vy: rnd(-160, 160), t: 0, life: rnd(.3, .6), color: k % 2 ? '#ffd23a' : '#ff6a2a' });
  if (dono !== p) S.banner = { t: 2.2, text: 'A Fênix salvou o ' + PCOL[p.i].name + '!' };
  return true;
}
// enquanto é ovo: não anda nem atira e não leva dano; no fim, explode em fogo e volta
function ovoPasso(p, dt) {
  p.ovoT -= dt;
  if (p.ovoT > 0) return;
  const R = FENIX.renascer;
  p.ovoT = 0; p.hp = p.maxHp * R.vida; p.inv = R.inv;
  som('fenix_renasce', p.x);
  boom(p.x, p.y, 70, '#ff8a2a');
  S.fx.push({ type: 'ring', x: p.x, y: p.y, r: R.raio, t: 0, life: .45, color: '#ffd23a' });
  const q = dpsQueima(p);
  for (const t of targets()) if (!t.dead && !t.invuln && d2(t, p) < (R.raio + t.r) ** 2) { dealDmg(t, R.dano * p.dmg, p, 'burn'); aplicaQueima(t, p, q, 2); }
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; S.fx.push({ type: 'spark', x: p.x, y: p.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, t: 0, life: .5, color: k % 2 ? '#ffd23a' : '#ff6a2a' }); }
}

// ---------- Brasas da Fênix "Original" (as skins usam o rastro da skin) ----------
function fenixBrasas(p, dt) {
  if (SHIPS[p.ship].id !== 'phoenix' || !p.alive || p.ovoT > 0 || (p.skin && p.skin !== 'classic')) return;
  p.trT = (p.trT || 0) - dt; if (p.trT > 0) return;
  p.trT = .05;
  S.fx.push({ type: 'trail', k: 'ember', x: p.x + rnd(-6, 6), y: p.y + 30, vx: rnd(-18, 18), vy: rnd(60, 110), t: 0, life: rnd(.3, .5), r: rnd(2.5, 4), color: '#FF9A2E', rot: 0 });
}
