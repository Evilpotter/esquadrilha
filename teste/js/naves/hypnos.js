// ---------- Hypnos: espirais hipnóticas, aliados, Lacaios fiéis e armas da mente ----------
// Números em js/dados/armas.js (WEAPONS hypno/grito/clone/ima/rei e HYPNOS).
// Desenho em js/visual/hypnos.js. Habilidade ativa (Onda psíquica) em js/naves/habilidades.js.
// Aliados ficam em S.aliados (não entram em targets(): os inimigos e os tiros do jogador não mexem neles).

// ---------- Hipnose (marcas) ----------
function podeConverter(t, rei) {
  if (!t || t.dead || t.boss || t.elite || t.invuln || t.y < 0) return false; // elite (mini-chefe) não vira aliado
  if (rei) return t.type !== 'mine' && t.type !== 'rock';
  return !HYPNOS.naoConverte.includes(t.type) && t.r <= HYPNOS.hipnose.raioMax;
}
function aliadosDe(p) { return (S.aliados || []).filter(a => a.dono === p && !a.rei && !a.morto); }
// cada acerto põe n marcas; com 3 o inimigo vira aliado (se o dono ainda tiver vaga)
function marcaHipnose(t, p, n) {
  if (!t || t.dead || t.boss || !p) return;
  const H0 = HYPNOS.hipnose;
  t.hipN = Math.min(H0.marcas, (t.hipT > 0 ? t.hipN : 0) + (n || 1));
  t.hipT = H0.tempoMarca; t.hipP = p;
  if (t.hipN >= H0.marcas && podeConverter(t) && aliadosDe(p).length < H0.max) converte(t, p, null);
}
// o inimigo sai da lista de inimigos e volta como aliado (conta como abate e solta os cristais)
function converte(e, p, rei) {
  e.dead = true;
  const xp = ETYPES[e.type].xp;
  S.kills++; p.kills++;
  const m = xpMult(); // Saraivada da Âncora Negra: XP em dobro
  if (xp >= 5) { for (let k = 0; k < 3; k++) S.gems.push({ x: e.x + rnd(-15, 15), y: e.y + rnd(-15, 15), v: 2 * m }); }
  else S.gems.push({ x: e.x, y: e.y, v: xp * m });
  const A = HYPNOS.aliado, R = HYPNOS.rei;
  const vida = rei ? R.dura + R.maisDura * rei.pierce : HYPNOS.hipnose.aliado;
  if (!S.aliados) S.aliados = [];
  S.aliados.push({ type: e.type, x: e.x, y: e.y, r: e.r, t: e.t || 0, dono: p, rei: !!rei, vida, max: vida,
    forca: rei ? R.forca * rei.dmgM : 1, cool: rnd(.1, .4), escudo: A.escudo * (rei ? 2 : 1), flash: 0, giro: rnd(0, 6) });
  som(rei ? 'rei_lacaios' : 'hipnose_converte', e.x);
  S.fx.push({ type: 'ring', x: e.x, y: e.y, r: e.r * 2.4, t: 0, life: .4, color: rei ? '#ffd36b' : '#c77dff' });
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; S.fx.push({ type: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, t: 0, life: .35, color: k % 2 ? '#f0d8ff' : '#b06cff' }); }
}

// ---------- Tontura (Grito psíquico): lentoDt (js/naves/pirata.js) para o inimigo enquanto stunT > 0 ----------
function atordoa(t, tempo) {
  if (!t || t.dead) return;
  t.stunT = Math.max(t.stunT || 0, t.boss ? tempo * HYPNOS.grito.chefao : tempo);
}

// ---------- Disparos (chamado por firePlayer quando a recarga termina) ----------
// devolve false para não contar o disparo (tenta de novo logo)
function espirais(p, w, d, dmg, n, x, y) {
  // espirais lado a lado, abrindo pouco (as duas acertam um inimigo médio na frente)
  for (let k = 0; k < n; k++) {
    const o = k - (n - 1) / 2, ang = o * .1;
    S.bullets.push({ x: x + o * 12, y: y - 16, vx: Math.sin(ang) * d.spd, vy: -Math.cos(ang) * d.spd, r: d.r, dmg, p,
      pierce: w.pierce, hit: null, explo: w.explosive, color: d.color, life: HYPNOS.orbe.vida, vida: HYPNOS.orbe.vida, type: 'hypno', hip: 1, rot: rnd(0, 6) });
  }
}
function clonePos(p, k) {
  const s = k % 2 ? 1 : -1, j = k >> 1, D = HYPNOS.clone.distancia;
  return { x: clamp(p.x + s * D * (1 + j * .7), 20, W - 20), y: p.y + 12 + j * 10 + Math.sin(S.phaseT * 2.5 + k) * 4 };
}
const HYPNOS_TIRO = {
  hypno(p, w, d, dmg, n) {
    somTiro('hypno', p.x);
    espirais(p, w, d, dmg, n, p.x, p.y);
    // clones atiram junto (com o bônus de dano do Clone)
    const cw = p.weapons.find(q => q.type === 'clone');
    if (cw && p.cloneT > 0) for (let k = 0; k < cw.shots; k++) { const c = clonePos(p, k); espirais(p, w, d, dmg * cw.dmgM, n, c.x, c.y); }
    return true;
  },
  grito(p, w, d, dmg, n) {
    if (!targets().some(t => !t.dead && t.y > 0)) return false;
    const tonto = HYPNOS.grito.tonto + HYPNOS.grito.maisTempo * w.pierce;
    for (let k = 0; k < n; k++) {
      const game = S;
      setTimeoutFx(k * .45, () => {
        if (S !== game || !p.alive) return;
        somTiro('grito', p.x);
        S.bullets.push({ x: p.x, y: p.y, vx: 0, vy: 0, R: 10, r: 0, dmg, p, type: 'grito', spd: d.spd, tonto, life: 9, hit: new Set() });
      });
    }
    return true;
  },
  clone(p, w) {
    if (!targets().some(t => !t.dead && t.y > 0)) return false;
    somTiro('clone', p.x);
    p.cloneT = p.cloneMax = HYPNOS.clone.dura;
    for (let k = 0; k < w.shots; k++) { const c = clonePos(p, k); S.fx.push({ type: 'ring', x: c.x, y: c.y, r: 30, t: 0, life: .35, color: '#c77dff' }); }
    return true;
  },
  ima(p, w, d, dmg, n) {
    const I = HYPNOS.ima;
    const T = targets().filter(t => !t.dead && !t.invuln && !t.boss && t.y > 40 && t.y < H - 60 && d2(t, p) < 520 * 520)
      .sort((a, b) => d2(a, p) - d2(b, p));
    if (!T.length) return false;
    somTiro('ima', p.x);
    for (let k = 0; k < n; k++) {
      const t = T[k % T.length], extra = k >= T.length;
      S.bullets.push({ x: t.x + (extra ? rnd(-60, 60) : 0), y: t.y + (extra ? rnd(-40, 40) : 0), vx: 0, vy: 0, r: 0, R: d.r * w.range, dmg, p,
        type: 'ima', life: I.dura, vida: I.dura, tick: .15, rot: rnd(0, 6) });
    }
    return true;
  },
  rei(p, w, d, dmg, n) {
    let ok = false;
    for (let k = 0; k < n; k++) {
      let best = null;
      for (const t of S.enemies) if (podeConverter(t, true) && t.y > 20 && (!best || t.maxHp > best.maxHp)) best = t;
      if (!best) break;
      converte(best, p, w); ok = true;
    }
    return ok;
  },
};

// ---------- Balas especiais (atualizadas no laço de tiros) ----------
const HYPNOS_BALA = {
  // grito: anel que cresce pela tela toda
  grito(b, dt, T) {
    b.R += b.spd * dt; b.life -= dt;
    for (const t of T) {
      if (t.dead || b.hit.has(t)) continue;
      if (d2(t, b) < (b.R + t.r) ** 2) {
        b.hit.add(t);
        if (t.invuln) continue;
        atordoa(t, b.tonto);
        dealDmg(t, b.dmg, b.p, 'grito');
        marcaHipnose(t, b.p, 1);
      }
    }
    if (b.R > Math.hypot(W, H) + 60 || b.life <= 0) b.dead = true;
  },
  // ímã: puxa os inimigos para o meio, machuca e marca a cada meio segundo
  ima(b, dt, T) {
    const I = HYPNOS.ima;
    b.life -= dt; b.tick -= dt; b.rot += dt * 4;
    const tick = b.tick <= 0;
    if (tick) b.tick = I.tick;
    for (const t of T) {
      if (t.dead || t.invuln || t.boss) continue;
      const dx = b.x - t.x, dy = b.y - t.y, dd = Math.hypot(dx, dy);
      if (dd > b.R + t.r) continue;
      if (dd > 6) { const mv = Math.min(dd - 4, I.puxa * dt); t.x += dx / dd * mv; t.y += dy / dd * mv; if (t.x0 !== undefined) t.x0 += dx / dd * mv; }
      if (tick) { dealDmg(t, b.dmg, b.p, 'ima'); marcaHipnose(t, b.p, 1); }
    }
    if (b.life <= 0) b.dead = true;
  },
};

// ---------- Aliados ----------
// Lacaios fiéis: os aliados voam na frente da dupla (alternando entre a Hypnos e o parceiro)
// e seguram os tiros inimigos que encostam neles.
const ALIADO_VAGA = [[-46, -78], [46, -78], [-92, -44], [92, -44], [0, -120], [-130, -10], [130, -10], [0, -160]];
function updateAliados(dt) {
  // marcas de hipnose somem com o tempo
  for (const e of S.enemies) if (e.hipT > 0) { e.hipT -= dt; if (e.hipT <= 0) { e.hipT = 0; e.hipN = 0; } }
  if (S.players) for (const p of S.players) if (p.cloneT > 0) p.cloneT -= dt;
  if (!S.aliados || !S.aliados.length) return;
  const A = HYPNOS.aliado, T = targets(), vivos = S.players.filter(q => q.alive);
  const porDono = new Map();
  for (const a of S.aliados) {
    if (a.morto) continue;
    a.t += dt; a.vida -= dt; a.cool -= dt; a.giro += dt * 5; if (a.flash > 0) a.flash -= dt;
    // vaga na frente de quem ele protege
    const lista = porDono.get(a.dono) || []; porDono.set(a.dono, lista);
    const k = lista.length; lista.push(a);
    const par = vivos.find(q => q !== a.dono);
    const guarda = (k % 2 && par) || (a.dono.alive ? a.dono : par);
    if (guarda) {
      const v = ALIADO_VAGA[k % ALIADO_VAGA.length], gx = clamp(guarda.x + v[0], 20, W - 20), gy = clamp(guarda.y + v[1], 60, H - 40);
      const dx = gx - a.x, dy = gy - a.y, dd = Math.hypot(dx, dy) || 1, mv = Math.min(dd, A.vel * (dd > 120 ? 1.6 : 1) * dt);
      a.x += dx / dd * mv; a.y += dy / dd * mv;
    }
    // atira no inimigo mais perto
    if (a.cool <= 0) {
      let best = null, bd = A.alcance * A.alcance;
      for (const t of T) if (!t.dead && !t.invuln && t.y > 0) { const d = d2(t, a); if (d < bd) { bd = d; best = t; } }
      if (best) {
        a.cool = A.cad * (a.rei ? .7 : 1);
        const ang = Math.atan2(best.y - a.y, best.x - a.x), p = a.dono;
        S.bullets.push({ x: a.x, y: a.y, vx: Math.cos(ang) * 600, vy: Math.sin(ang) * 600, r: 4, dmg: A.dano * p.dmg * a.forca, p,
          pierce: 0, hit: null, color: a.rei ? '#ffd36b' : '#e0a8ff', life: 1.2, type: 'hip_aliado' });
        som('aliado_tiro', a.x);
      } else a.cool = .15;
    }
    // segura os tiros inimigos
    for (const e of S.ebullets) if (!e.dead && d2(e, a) < (e.r + a.r) ** 2) {
      e.dead = true; a.escudo--; a.flash = .08;
      S.fx.push({ type: 'spark', x: e.x, y: e.y, vx: rnd(-60, 60), vy: rnd(-60, 0), t: 0, life: .2, color: '#e0a8ff' });
      if (a.escudo <= 0) break;
    }
    if (a.vida <= 0 || a.escudo <= 0) aliadoExplode(a);
  }
  S.aliados = S.aliados.filter(a => !a.morto);
}
function aliadoExplode(a) {
  const A = HYPNOS.aliado, p = a.dono;
  a.morto = true;
  som('aliado_explode', a.x);
  boom(a.x, a.y, a.r * 1.5, '#b06cff');
  S.fx.push({ type: 'ring', x: a.x, y: a.y, r: A.explosao, t: 0, life: .35, color: '#e0a8ff' });
  for (const t of targets()) if (!t.dead && !t.invuln && d2(t, a) < (A.explosao + t.r) ** 2) dealDmg(t, A.danoExplosao * p.dmg * a.forca, p);
}
