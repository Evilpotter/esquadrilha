// ---------- Âncora Negra: armas piratas (ideia do Bryan, 21/11/2026) ----------
// Números em js/dados/armas.js (WEAPONS anchor/wave/dragon/broadside/barrel/parrot/whirl e PIRATA).
// Desenho em js/visual/pirata.js. Tudo automático: nenhuma tecla nova.

// ---------- Lentidão (Onda) ----------
// a = quanto fica mais lento (0,4 = 40%), t = segundos
function aplicaLento(e, a, t) {
  if (!e || e.dead) return;
  if (!(e.slowT > 0) || a >= e.slowA) e.slowA = a;
  e.slowT = Math.max(e.slowT || 0, t);
}
// devolve o multiplicador do tempo do inimigo (1 = normal) e desconta a lentidão
function lentoDt(e, dt) {
  if (!(e.slowT > 0)) return dt;
  e.slowT -= dt;
  return dt * (1 - e.slowA);
}

// ---------- Disparos (chamado por firePlayer quando a recarga termina) ----------
// devolve false para não contar o disparo (tenta de novo logo)
const PIRATA_TIRO = {
  anchor(p, w, d, dmg, n, col) {
    const T = targets().filter(t => !t.dead && !t.invuln && t.y > 0);
    const R = d.range * w.range, from = { x: p.x, y: p.y - 14 };
    const alvos = T.filter(t => d2(t, from) < (R + t.r) ** 2).sort((a, b) => d2(a, from) - d2(b, from));
    if (!alvos.length) return false;
    somTiro('anchor', p.x);
    for (let k = 0; k < n; k++) {
      const t = alvos[k % alvos.length], dist = Math.sqrt(d2(t, from));
      const ang = Math.atan2(t.y - from.y, t.x - from.x) + (k >= alvos.length ? (k % 2 ? .25 : -.25) : 0);
      S.bullets.push({ x: from.x, y: from.y, vx: Math.cos(ang) * d.spd, vy: Math.sin(ang) * d.spd, r: d.r, dmg, p,
        explo: w.explosive, splash: .6, color: col, sk: p.skin, life: 4, type: 'anchor', anc: true,
        ida: Math.min(R, dist + 24), andou: 0, ret: false, age: 0, hitT: new Map(), hook: null });
    }
    return true;
  },
  wave(p, w, d, dmg, n) {
    if (!targets().some(t => !t.dead && t.y > 0)) return false;
    const O = PIRATA.onda, tempo = O.tempo + O.tempoMelhoria * w.pierce;
    for (let k = 0; k < n; k++) {
      const game = S;
      setTimeoutFx(k * .35, () => {
        if (S !== game || !p.alive) return;
        somTiro('wave', p.x);
        S.bullets.push({ x: p.x, y: p.y, vx: 0, vy: 0, R: 10, r: 0, dmg, p, type: 'wave', spd: d.spd, tempo, life: 9, hit: new Set(), color: d.color });
      });
    }
    return true;
  },
  dragon(p, w) {
    if (!targets().some(t => !t.dead && t.y > 0)) return false;
    const D = PIRATA.dragao;
    p.dragonT = p.dragonMax = D.dura + w.pierce * 1;
    p.dragonW = w; p.jetT = 0;
    somTiro('dragon', p.x);
    S.fx.push({ type: 'ring', x: p.x, y: p.y, r: 70, t: 0, life: .4, color: '#8fe6ff' });
    for (let k = 0; k < 10; k++) S.fx.push({ type: 'spark', x: p.x, y: p.y, vx: rnd(-180, 180), vy: rnd(-180, 180), t: 0, life: rnd(.3, .55), color: '#bff2ff' });
    return true;
  },
  broadside(p, w, d, dmg, n, col) {
    somTiro('broadside', p.x);
    const ab = PIRATA.canhao.abertura;
    for (const s of [-1, 1]) for (let k = 0; k < n; k++) {
      const ang = s * (Math.PI / 2 - ab - k * .09);
      S.bullets.push({ x: p.x + s * 16, y: p.y - 4 + k * 8, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd, r: d.r, dmg, p,
        pierce: w.pierce, hit: null, explo: w.explosive, color: col, life: 3, type: 'cannon' });
      S.fx.push({ type: 'smoke', x: p.x + s * 24, y: p.y - 4 + k * 8, r: 4, t: 0, life: .35 });
    }
    return true;
  },
  barrel(p, w, d, dmg, n) {
    somTiro('barrel', p.x);
    for (let k = 0; k < n; k++) {
      const o = k - (n - 1) / 2;
      S.bullets.push({ x: p.x + o * 26, y: p.y + 22, vx: o * 40, vy: 0, r: d.r, dmg, p, explo: w.explosive, type: 'barrel',
        life: PIRATA.barril.pavio, rot: rnd(-.4, .4) });
    }
    return true;
  },
  whirl(p, w, d, dmg, n) {
    const RD = PIRATA.redemoinho, T = targets().filter(t => !t.dead && !t.invuln && t.y > 0);
    const perto = T.filter(t => d2(t, p) < 460 * 460).sort((a, b) => d2(a, p) - d2(b, p));
    somTiro('whirl', p.x);
    for (let k = 0; k < n; k++) {
      const t = perto[k];
      const x = t ? t.x : clamp(p.x + (k - (n - 1) / 2) * 180, 60, W - 60), y = t ? Math.max(90, t.y) : Math.max(110, p.y - RD.distancia);
      S.bullets.push({ x, y, vx: 0, vy: 0, r: 0, R: d.r * w.range, dmg, p, type: 'whirl', life: RD.dura, dura: RD.dura, tick: 0, rot: 0 });
    }
    return true;
  },
};

// ---------- Balas especiais (atualizadas no laço de tiros; devolvem true = já tratada) ----------
const PIRATA_BALA = {
  wave(b, dt, T) {
    b.R += b.spd * dt; b.life -= dt;
    const O = PIRATA.onda;
    for (const t of T) {
      if (t.dead || b.hit.has(t)) continue;
      if (d2(t, b) < (b.R + t.r) ** 2) {
        b.hit.add(t);
        if (!t.invuln) dealDmg(t, b.dmg, b.p, 'wave');
        aplicaLento(t, t.boss ? O.lento * O.chefao : O.lento, b.tempo);
      }
    }
    if (b.R > Math.hypot(W, H) + 60 || b.life <= 0) b.dead = true;
  },
  barrel(b, dt, T) {
    b.life -= dt; b.y += PIRATA.barril.desce * dt; b.x += b.vx * dt; b.vx *= Math.max(0, 1 - 3 * dt); b.rot += dt * 1.5;
    let bate = b.life <= 0 || b.y > H + 30;
    if (!bate) for (const t of T) if (!t.dead && !t.invuln && d2(t, b) < (t.r + b.r) ** 2) { bate = true; break; }
    if (bate) {
      b.dead = true;
      boom(b.x, b.y, b.explo * .7, '#ff9a30');
      explode(b.x, b.y, b.explo, b.dmg, b.p);
      for (let k = 0; k < 5; k++) S.fx.push({ type: 'spark', x: b.x, y: b.y, vx: rnd(-200, 200), vy: rnd(-200, 200), t: 0, life: rnd(.3, .6), color: '#a0662e' });
    }
  },
  whirl(b, dt, T) {
    b.life -= dt; b.rot += dt * 7; b.tick -= dt;
    const RD = PIRATA.redemoinho;
    for (const t of T) {
      if (t.dead || t.boss || ETYPES[t.type].ground) continue;
      const dx = b.x - t.x, dy = b.y - t.y, dd = Math.hypot(dx, dy);
      if (dd > b.R + t.r || dd < 4) continue;
      const m = Math.min(dd, RD.puxa * dt) / dd;
      t.x += dx * m; t.y += dy * m;
      if (t.x0 !== undefined) t.x0 += dx * m;
    }
    if (b.tick <= 0) {
      b.tick = RD.tick;
      for (const t of T) if (!t.dead && !t.invuln && d2(t, b) < (b.R + t.r) ** 2) dealDmg(t, b.dmg, b.p, 'whirl');
    }
    if (b.life <= 0) b.dead = true;
  },
};

// movimento da âncora (ida até o alvo/alcance, volta puxando a corrente)
function moveAncora(b, dt) {
  b.age += dt;
  const sp = Math.hypot(b.vx, b.vy) || 1;
  if (!b.ret) {
    b.andou += sp * dt;
    if (b.andou >= b.ida) voltaAncora(b);
  } else {
    const o = b.p, dx = o.x - b.x, dy = o.y - 14 - b.y, dd = Math.hypot(dx, dy) || 1, v = PIRATA.ancora.volta;
    b.vx = dx / dd * v; b.vy = dy / dd * v;
    if (b.hook && (dd < PIRATA.ancora.solta || !o.alive)) { // chegou perto: solta o preso com o golpe da volta
      const t = b.hook; soltaGancho(b);
      if (!t.dead) dealDmg(t, b.dmg, b.p, 'anchor');
    }
    if (dd < v * dt + 6 || !o.alive) { b.dead = true; return true; }
  }
  return false;
}
function voltaAncora(b) { if (!b.ret) { b.ret = true; b.hitT.clear(); } }
function soltaGancho(b) { if (b.hook) { b.hook.preso = null; b.hook = null; } }
// acerto da âncora: inimigo pequeno fica preso e é puxado
function ancoraAcerta(b, t) {
  if (b.ret || b.hook || t.boss || (t.preso && !t.preso.dead)) return;
  const tp = ETYPES[t.type];
  if (!tp || tp.ground || t.type === 'mine' || t.r > PIRATA.ancora.puxaRaio) return;
  b.hook = t; t.preso = b;
  som('ancora_pega', t.x);
  voltaAncora(b);
}
// depois do movimento dos inimigos: o preso vai junto com a âncora
function arrastaPresos() {
  for (const b of S.bullets) {
    if (!b.anc || !b.hook) continue;
    if (b.dead || b.hook.dead) { soltaGancho(b); continue; }
    b.hook.x = b.x; b.hook.y = b.y;
    if (b.hook.x0 !== undefined) b.hook.x0 = b.x;
  }
}

// ---------- Papagaios (voam junto, bicam inimigos) ----------
function papagaioCasa(p, k) {
  const s = k % 2 ? 1 : -1, j = k >> 1;
  return { x: p.x + s * (36 + j * 20), y: p.y - 10 + j * 16 + Math.sin(S.phaseT * 3 + k) * 4 };
}
function updatePapagaios(dt) {
  const T = targets(), d = WEAPONS.parrot, PP = PIRATA.papagaio;
  for (const p of S.players) {
    if (!p.alive) continue;
    for (const w of p.weapons) {
      if (w.type !== 'parrot') continue;
      if (!w.birds) w.birds = [];
      const dmg = d.dmg * w.dmgM * p.dmg, cd = d.cd * w.cdM / p.rate;
      for (let k = 0; k < w.shots; k++) {
        const casa = papagaioCasa(p, k);
        const bd = w.birds[k] || (w.birds[k] = { x: casa.x, y: casa.y, cool: 0, back: 0, dir: 0, flap: k });
        bd.cool -= dt; bd.back -= dt; bd.flap += dt * 14;
        let alvo = null, ad = PP.alcance * PP.alcance;
        if (bd.back <= 0) for (const t of T) {
          if (t.dead || t.invuln || t.y < 10) continue;
          const dd = d2(t, p); if (dd < ad) { ad = dd; alvo = t; }
        }
        const gx = alvo ? alvo.x : casa.x, gy = alvo ? alvo.y : casa.y;
        const dx = gx - bd.x, dy = gy - bd.y, dd = Math.hypot(dx, dy) || 1, mv = Math.min(dd, PP.voo * dt * (alvo ? 1 : 1.3));
        bd.x += dx / dd * mv; bd.y += dy / dd * mv;
        if (dd > 3) bd.dir = Math.atan2(dy, dx);
        if (alvo && bd.cool <= 0 && d2(alvo, bd) < (alvo.r + d.r) ** 2) {
          dealDmg(alvo, dmg, p, 'parrot'); bd.cool = cd; bd.back = .18;
          som('papagaio', bd.x);
          if (w.explosive) explode(bd.x, bd.y, w.explosive, dmg * .6, p);
          S.fx.push({ type: 'spark', x: bd.x, y: bd.y, vx: rnd(-80, 80), vy: rnd(-80, 80), t: 0, life: .2, color: '#ffe066' });
        }
      }
    }
  }
}

// ---------- Dragão de água: tempo, rastro do corpo e jato ----------
function updateDragoes(dt) {
  const D = PIRATA.dragao;
  for (const p of S.players) {
    if (!SHIPS[p.ship].exclusivas) continue;
    p.rastro = p.rastro || [];
    p.rastro.unshift(p.x); if (p.rastro.length > 40) p.rastro.pop();
    if (!(p.dragonT > 0)) continue;
    if (!p.alive) { p.dragonT = 0; continue; }
    p.dragonT -= dt;
    if (p.dragonT <= 0) {
      p.dragonT = 0;
      S.fx.push({ type: 'ring', x: p.x, y: p.y, r: 50, t: 0, life: .3, color: '#8fe6ff' });
      continue;
    }
    dragaoRastro(p, dt); // js/visual/pirata.js
    // jato de água contínuo saindo da boca
    const w = p.dragonW, d = WEAPONS.dragon;
    p.jetT -= dt;
    if (p.jetT > 0) continue;
    p.jetT = D.cadJato / p.rate;
    som('jato_agua', p.x);
    const dmg = d.dmg * w.dmgM * p.dmg, n = w.shots, col = dragaoCor(p.skin).agua;
    for (let k = 0; k < n; k++) {
      const ang = (n === 1 ? 0 : (k / (n - 1) - .5) * .32) + rnd(-.05, .05);
      S.bullets.push({ x: p.x + Math.sin(ang) * 30, y: p.y - 30 * D.escala, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd,
        r: d.r, dmg, p, pierce: D.perfura, hit: null, explo: 0, color: col, life: D.vidaJato, type: 'jet' });
    }
  }
}
// Saque: inimigo derrotado pela âncora ou pelo jato cura um pouco
function saque(p, src) {
  if (!p || !p.alive || (src !== 'anchor' && src !== 'jet')) return;
  const v = SHIPS[p.ship].saque; if (!v) return;
  p.hp = Math.min(p.maxHp, p.hp + v);
  S.fx.push({ type: 'spark', x: p.x + rnd(-10, 10), y: p.y - 18, vx: 0, vy: -50, t: 0, life: .4, color: '#7dff8a' });
}
