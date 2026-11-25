// ---------- Habilidades ativas: uma por nave, no botão (desde 1.2.0) ----------
// Números em js/dados/habilidades.js (HAB); desenho em js/visual/habilidades.js.
// Botão: J1 Espaço · J2 Enter (com 1 jogador, os dois) · controle A · celular botão ★ (entrada.js / controle.js).
// Campos no jogador: habT (recarga que falta; 0 = pronta) habMax · mergulho: dashT dashVx dashVy dashHit · furiaT ·
// ciclone: cicloneT cicloneAng cicloneHits · baforada: bafT bafTick. Global: S.xpDobroT (Saraivada), S.habFx (efeitos).

function habDe(p) { return HAB[SHIPS[p.ship].id]; }
function habPronta(p) { return p && p.alive && !(p.ovoT > 0) && !(p.habT > 0); }
function xpMult() { return S.xpDobroT > 0 ? 2 : 1; } // Saraivada da Âncora Negra: XP em dobro
function habTexto(p, texto, cor) {
  (S.habFx = S.habFx || []).push({ type: 'nome', x: p.x, y: p.y - 46, t: 0, life: 1.2, text: texto, color: cor || PCOL[p.i].body });
}

// aperta o botão (i = jogador); devolve true se usou
function usarHab(i) {
  if (S.mode !== 'play' || !S.players) return false;
  const p = S.players[i];
  if (!habPronta(p)) return false;
  const id = SHIPS[p.ship].id, h = HAB[id];
  if (!HAB_USO[id](p, h)) return false;
  p.habT = p.habMax = h.recarga;
  habTexto(p, h.nome + '!');
  return true;
}

const HAB_USO = {
  falcon(p, h) {
    const M = h.mergulho, dx = p.dirX || 0, dy = p.dirY === undefined ? -1 : p.dirY, dd = Math.hypot(dx, dy) || 1;
    const vx = dd > .01 ? dx / dd : 0, vy = dd > .01 ? dy / dd : -1;
    p.dashT = M.tempo; p.dashVx = vx * M.dist / M.tempo; p.dashVy = vy * M.dist / M.tempo; p.dashHit = new Set();
    p.inv = Math.max(p.inv, M.inv);
    p.furiaT = M.tempo + h.furia.tempo;
    som('hab_mergulho', p.x);
    return true;
  },
  boomer(p, h) {
    p.cicloneT = h.tempo; p.cicloneAng = 0; p.cicloneHits = [...Array(h.laminas)].map(() => new Map());
    som('hab_ciclone', p.x);
    return true;
  },
  artillery(p, h) {
    const T = targets().filter(t => !t.dead && !t.invuln && t.y > 0 && t.y < H && t.x > 0 && t.x < W);
    if (!T.length) return false;
    const perto = T.filter(t => !t.boss).sort((a, b) => d2(a, p) - d2(b, p)).slice(0, h.alvos);
    const fortes = T.slice().sort((a, b) => (b.boss ? 1e9 : b.hp) - (a.boss ? 1e9 : a.hp));
    const alvos = perto.slice();
    for (let k = 0; alvos.length < h.alvos; k++) alvos.push(fortes[k % fortes.length]); // sobras: chefão / mais forte
    S.habFx = S.habFx || [];
    for (const t of new Set(alvos)) S.habFx.push({ type: 'mira', alvo: t, t: 0, life: h.mira + .25 });
    const game = S;
    alvos.forEach((t, k) => setTimeoutFx(h.mira + k * h.intervalo, () => {
      if (S !== game || !p.alive) return;
      const s = k % 2 ? 1 : -1, ang = s * (.5 + .1 * (k >> 1));
      S.bullets.push({ x: p.x + s * 20, y: p.y - 8, vx: Math.sin(ang) * h.vel * .6, vy: -Math.cos(ang) * h.vel * .6,
        r: 5, dmg: h.dano * p.dmg, p, alvo: t, type: 'hab_missil', life: 3, smokeT: 0 });
      somTiro('missile', p.x);
    }));
    som('hab_bombardeio', p.x);
    return true;
  },
  pirate(p, h) {
    const game = S;
    for (let r = 0; r < h.rajadas; r++) setTimeoutFx(r * h.intervalo, () => {
      if (S !== game || !p.alive) return;
      const giro = r * Math.PI / h.balas; // cada rajada sai um pouco girada (cobre os buracos da anterior)
      for (let k = 0; k < h.balas; k++) {
        const a = giro + k / h.balas * TAU;
        S.bullets.push({ x: p.x + Math.sin(a) * 18, y: p.y - Math.cos(a) * 18, vx: Math.sin(a) * h.vel, vy: -Math.cos(a) * h.vel,
          r: 6, dmg: h.dano * p.dmg, p, pierce: 0, hit: null, explo: h.explosao, splash: 1, color: '#3a3a3a', life: h.vida, type: 'hab_bala' });
      }
      som('hab_saraivada', p.x);
      S.shake = Math.max(S.shake, .12);
    });
    S.xpDobroT = h.xpDobro;
    return true;
  },
  phoenix(p, h) {
    p.bafT = h.tempo; p.bafTick = 0;
    som('hab_baforada', p.x);
    return true;
  },
  hypnos(p, h) {
    const lista = S.enemies.filter(t => podeConverter(t)).sort((a, b) => d2(a, p) - d2(b, p)).slice(0, h.converte);
    for (const t of lista) converte(t, p, null); // passa do limite de 4 aliados (a habilidade não conta o limite)
    S.bullets.push({ x: p.x, y: p.y, vx: 0, vy: 0, R: 10, r: 0, dmg: 0, p, type: 'hab_onda', life: 3, hit: new Set(), tonto: h.tonto, spd: h.vel });
    som('hab_onda', p.x);
    return true;
  },
};

// ---------- Balas especiais (chamadas no laço dos tiros, como PIRATA_BALA) ----------
const HAB_BALA = {
  hab_missil(b, dt, T) {
    // míssil teleguiado no alvo marcado; se o alvo cair, procura o mais perto
    if (!b.alvo || b.alvo.dead) { let best = null, bd = 1e12; for (const t of T) if (!t.dead && !t.invuln) { const d = d2(t, b); if (d < bd) { bd = d; best = t; } } b.alvo = best; }
    const sp = Math.min(HAB.artillery.vel * 1.6, Math.hypot(b.vx, b.vy) + 900 * dt);
    if (b.alvo) {
      const a = Math.atan2(b.vy, b.vx), ta = Math.atan2(b.alvo.y - b.y, b.alvo.x - b.x);
      let da = ta - a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      const na = a + clamp(da, -9 * dt, 9 * dt);
      b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
    }
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    b.smokeT -= dt;
    if (b.smokeT <= 0) { b.smokeT = .04; S.fx.push({ type: 'smoke', x: b.x - b.vx / sp * 8, y: b.y - b.vy / sp * 8, r: 2.4, t: 0, life: .3 }); }
    if (b.life <= 0) { b.dead = true; return; }
    for (const t of T) if (!t.dead && !t.invuln && d2(t, b) < (t.r + b.r) ** 2) {
      b.dead = true;
      dealDmg(t, b.dmg, b.p, 'hab_missil');
      explode(b.x, b.y, HAB.artillery.explosao, b.dmg * .5, b.p);
      S.fx.push({ type: 'boom', x: b.x, y: b.y, r: HAB.artillery.explosao * .6, t: 0, life: .3, color: '#ffb040' });
      return;
    }
  },
  hab_onda(b, dt, T) {
    // anel que cresce pela tela toda deixando todos tontos (chefão: metade, como no Grito psíquico)
    b.R += b.spd * dt; b.life -= dt;
    if (b.R > Math.hypot(W, H) || b.life <= 0) { b.dead = true; return; }
    for (const t of T) if (!t.dead && !b.hit.has(t) && d2(t, b) < (b.R + t.r) ** 2) { b.hit.add(t); atordoa(t, b.tonto); }
  },
};

// ---------- Passo de cada quadro ----------
// mergulho do Falcão: chamado depois do movimento normal do jogador
function mergulhoPasso(p, dt) {
  if (!(p.dashT > 0)) return;
  const k = Math.min(dt, p.dashT); p.dashT -= dt;
  p.x = clamp(p.x + p.dashVx * k, 20, W - 20); p.y = clamp(p.y + p.dashVy * k, 80, H - 70);
  p.inv = Math.max(p.inv, .05);
  const M = HAB.falcon.mergulho;
  for (const t of targets()) if (!t.dead && !t.invuln && !p.dashHit.has(t) && d2(t, p) < (t.r + p.r + 10) ** 2) {
    p.dashHit.add(t); dealDmg(t, M.dano * p.dmg, p, 'hab_mergulho');
    S.fx.push({ type: 'spark', x: t.x, y: t.y, vx: rnd(-120, 120), vy: rnd(-120, 0), t: 0, life: .25, color: '#fff4a0' });
  }
  (S.habFx = S.habFx || []).push({ type: 'rastro', x: p.x, y: p.y, t: 0, life: .25, ship: p.ship, skin: p.skin, i: p.i, tilt: p.tilt });
}
// fúria do Falcão: multiplica a cadência de todas as armas (firePlayer)
function habCadencia(p) { return p.furiaT > 0 ? HAB.falcon.furia.cadencia : 1; }
function laminaPos(p, k) {
  const h = HAB.boomer, a = (p.cicloneAng || 0) + k / h.laminas * TAU;
  return { x: p.x + Math.cos(a) * h.raio, y: p.y + Math.sin(a) * h.raio, a };
}
function updateHab(dt) {
  if (S.xpDobroT > 0) S.xpDobroT -= dt;
  if (S.habFx) { for (const f of S.habFx) f.t += dt; S.habFx = S.habFx.filter(f => f.t < f.life); }
  const T = targets();
  for (const p of S.players) {
    if (p.habT > 0) { p.habT -= dt; if (p.habT <= 0 && p.alive) { p.habT = 0; som('hab_pronta', p.x); } }
    if (p.furiaT > 0) p.furiaT -= dt;
    if (!p.alive) { p.cicloneT = 0; p.bafT = 0; continue; }
    // Ciclone de lâminas
    if (p.cicloneT > 0) {
      const h = HAB.boomer;
      p.cicloneT -= dt; p.cicloneAng += dt * h.giro;
      for (let k = 0; k < h.laminas; k++) {
        const bp = laminaPos(p, k), hits = p.cicloneHits[k];
        for (const [t, c] of hits) { if (c - dt <= 0 || t.dead) hits.delete(t); else hits.set(t, c - dt); }
        for (const t of T) if (!t.dead && !t.invuln && !hits.has(t) && d2(t, bp) < (t.r + h.tamanho) ** 2) {
          dealDmg(t, h.dano * p.dmg, p, 'hab_ciclone'); hits.set(t, h.intervalo); som('serra_corte', bp.x);
          S.fx.push({ type: 'spark', x: bp.x, y: bp.y, vx: rnd(-90, 90), vy: rnd(-90, 90), t: 0, life: .18, color: '#fff' });
        }
        for (const e of S.ebullets) if (!e.dead && d2(e, bp) < (e.r + h.tamanho) ** 2) {
          e.dead = true; S.fx.push({ type: 'spark', x: e.x, y: e.y, vx: rnd(-60, 60), vy: rnd(-60, 60), t: 0, life: .15, color: '#d8e4ee' });
        }
      }
    }
    // Baforada de fogo
    if (p.bafT > 0) {
      const h = HAB.phoenix;
      p.bafT -= dt; p.bafTick -= dt;
      if (p.bafTick <= 0) {
        p.bafTick += h.tick;
        const ox = p.x, oy = p.y - 24, meia = h.abertura / 2;
        for (const t of T) {
          if (t.dead || t.invuln || t.y < -t.r) continue;
          const dx = t.x - ox, dy = t.y - oy, dd = Math.hypot(dx, dy) || 1;
          const folga = Math.asin(Math.min(1, t.r / dd)); // inimigo grande pega fogo mesmo com o centro fora do cone
          if (dy < t.r && Math.abs(Math.atan2(dx, -dy)) <= meia + folga) {
            dealDmg(t, h.dps * h.tick * p.dmg, p, 'burn');
            if (!t.dead) aplicaQueima(t, p, dpsQueima(p), h.chamas);
          }
        }
      }
    }
  }
}
