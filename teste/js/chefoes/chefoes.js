// ---------- Chefões: comportamento ----------
// Números (vida, tempos, quantidade de tiros…) ficam em js/dados/chefoes.js (BOSS_DATA).
const fury = (b, par) => rage(b) ? par[1] : par[0];
const lado = () => Math.random() < .5 ? -1 : 1;
function patrol(b, dt, spd) {
  b.x += b.dir * spd * dt;
  const m = Math.min(110, W * .2);
  if (b.x < m) b.dir = 1; if (b.x > W - m) b.dir = -1;
}
// entra descendo do topo até a altura b.ty (só uma vez: depois pode subir e descer à vontade)
function enter(b, dt) { if (b.in) return false; if (b.y < b.ty) { b.y += 90 * dt; return true; } b.in = true; return false; }
// sobe e desce em volta de b.ty (começa suave a partir da entrada)
function bob(b, dt, D) { b.bt = (b.bt || 0) + dt; b.y = b.ty + Math.sin(b.bt * D.balancoVel) * D.balanco; }
function rage(b) { return b.hp < b.maxHp / 2 || b.rage2; }
function ring(x, y, n, spd, r, off, d, tk, c) { const o = off === undefined ? Math.random() : off; for (let k = 0; k < n; k++) eShoot(x, y, (k + o) / n * TAU, spd, r || 6, d, tk, c); }
function aimed(b, n, spread, spd, r, d, tk) {
  const p = nearestPlayer(b); if (!p) return;
  const a = Math.atan2(p.y - b.y, p.x - b.x);
  for (let k = 0; k < n; k++) eShoot(b.x, b.y + 20, a + (k - (n - 1) / 2) * spread, spd, r, d, tk);
}
// tiros dos chefões: mesmo jeito dos inimigos, mas com o dano de chefão (BOSS_DMG.tiro)
const bDmg = () => BOSS_DMG.tiro * eDmg();
const bShoot = (x, y, a, spd, r) => eShoot(x, y, a, spd, r, bDmg(), 'chefao');
const bRing = (x, y, n, spd, r, off) => ring(x, y, n, spd, r, off, bDmg(), 'chefao');
const bAimed = (b, n, spread, spd, r) => aimed(b, n, spread, spd, r, bDmg(), 'chefao');
function aimFrom(b, x, y, spd, r) { const p = nearestPlayer(b); if (p) bShoot(x, y, Math.atan2(p.y - y, p.x - x), spd, r); }
// raio vertical; vx ≠ 0 = raio que varre para o lado depois do aviso
function beam(x, y0, w, warn, life, vx, xFim) { S.hazards.push({ x, y0, w, warn, life, max: warn, vx: vx || 0, xFim }); }
// conta o tempo de um ataque; devolve true quando dispara (o primeiro espera "primeiro" ou o próprio intervalo)
function timer(b, key, dt, every, first) {
  if (b[key] === undefined) b[key] = first === undefined ? every : first;
  b[key] -= dt; if (b[key] > 0) return false;
  b[key] += every; if (b[key] < 0) b[key] = every; return true;
}

const BOSSES = {
  fortress: {
    update(b, dt) {
      const D = BOSS_DATA.fortress;
      if (enter(b, dt)) return;
      patrol(b, dt, fury(b, D.vel)); bob(b, dt, D);
      const sp = ebs() * D.velTiro;
      if (b.espT > 0) {                       // espiral: gira atirando por alguns segundos
        b.espT -= dt; b.espA = (b.espA || 0) + dt * D.espiralGiro;
        if (timer(b, 'espC', dt, D.espiralCadencia, 0)) { const n = fury(b, D.espiralBracos); for (let k = 0; k < n; k++) bShoot(b.x, b.y, b.espA + k / n * TAU, ebs() * D.espiralVel, 5); }
      }
      b.patT -= dt;
      if (b.patT > 0) return;
      b.patT = fury(b, D.intervalo);
      const pat = (b.pat = (b.pat || 0) + 1) % 4;
      if (pat === 0) bRing(b.x, b.y, D.anel + S.phase * D.anelPorFase, sp, D.anelRaio);
      else if (pat === 1) { const n = fury(b, D.rajadaTiros); for (let w = 0; w < fury(b, D.rajadas); w++) setTimeoutFx(w * D.rajadaPausa, () => { if (!b.dead) bAimed(b, n, D.rajadaAbertura, sp * D.rajadaVel); }); }
      else if (pat === 2) { const n = fury(b, D.leque); for (let k = 0; k < n; k++) bShoot(b.x, b.y + 30, Math.PI / 2 + (k - (n - 1) / 2) * D.lequeAbertura, sp, D.lequeRaio); }
      else { b.espT = D.espiralDura; b.espC = 0; b.patT += D.espiralDura; }
    },
    draw(b) { drawBoss(b); },
  },
  carrier: {
    update(b, dt) {
      const D = BOSS_DATA.carrier;
      if (enter(b, dt)) return;
      patrol(b, dt, fury(b, D.vel)); bob(b, dt, D);
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = fury(b, D.intervalo);
        b.wave = (b.wave || 0) + 1;
        const type = rage(b) && b.wave % 2 ? D.escoltaFuria : D.escolta;
        for (const s of [-1, 1]) for (let k = 0; k < fury(b, D.escoltaPorLado); k++) addEnemy(type, b.x + s * (70 + k * 20), b.y + 20, { stopY: rnd(150, 300) });
      }
      if (timer(b, 'ringT', dt, fury(b, D.anelIntervalo))) bRing(b.x, b.y, D.anel + S.phase * D.anelPorFase, ebs() * D.anelVel, D.anelRaio);
      if (timer(b, 'gunT', dt, fury(b, D.canhaoIntervalo))) for (const s of [-1, 1]) aimFrom(b, b.x + s * D.canhaoDist, b.y, ebs() * D.canhaoVel, D.canhaoRaio);
      if (timer(b, 'misT', dt, fury(b, D.misselIntervalo), 3)) {
        const n = fury(b, D.misseis);
        for (let k = 0; k < n; k++) { const s = n === 1 ? lado() : (k ? 1 : -1); S.ebullets.push({ x: b.x + s * 30, y: b.y + 40, vx: s * 70, vy: 90, r: D.misselRaio, d: D.misselDano * eDmg(), home: true, life: D.misselDura, k: 'missil', c: '#c0392b' }); }
      }
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
    update(b, dt) {
      const D = BOSS_DATA.laser;
      if (enter(b, dt)) return;
      const p = nearestPlayer(b);
      // durante a varredura (e um pouco depois) não sai raio fixo: sempre sobra lugar para fugir
      // (vale para todos os chefões do raio na tela: nenhum solta raio fixo enquanto houver varredura)
      const varrendo = S.bosses.some(o => o.sweepPend && !o.dead) || S.hazards.some(h => h.vx) || S.semRaioFixo > 0;
      if (b.dashX !== undefined) {            // salto: desliza rápido e atira o raio assim que para
        b.x += clamp(b.dashX - b.x, -D.saltoVel * dt, D.saltoVel * dt);
        if (Math.abs(b.dashX - b.x) < 2) { b.dashX = undefined; if (!varrendo) beam(p ? p.x : b.x, b.y + 40, D.raioLargura, D.raioAviso, D.raioDura); }
      } else if (p) b.x += clamp(p.x - b.x, -fury(b, D.vel) * dt, fury(b, D.vel) * dt);
      if (timer(b, 'jumpT', dt, fury(b, D.saltoIntervalo))) b.dashX = clamp((p ? p.x : b.x) + lado() * rnd(220, 420), 100, W - 100);
      b.patT -= dt;
      if (b.patT <= 0 && !varrendo) {
        b.patT = fury(b, D.intervalo);
        const px = p ? p.x : b.x;
        beam(px, b.y + 40, D.raioLargura, D.raioAviso, D.raioDura);
        if (rage(b)) { beam(px - D.raioExtraDist, b.y + 40, D.raioLargura, D.raioExtraAviso, D.raioDura); beam(px + D.raioExtraDist, b.y + 40, D.raioLargura, D.raioExtraAviso, D.raioDura); }
      }
      // varredura: raio que anda na direção do jogador. Espera os raios fixos sumirem e
      // anda no máximo até cobrir D.varreduraCobre da largura da tela (o resto fica livre)
      if (timer(b, 'sweepT', dt, fury(b, D.varreduraIntervalo))) b.sweepPend = true;
      if (b.sweepPend && !S.hazards.some(h => !h.vx)) {
        b.sweepPend = false;
        const dx = (p ? p.x : b.x) - b.x, dir = Math.abs(dx) < 20 ? lado() : Math.sign(dx);
        const anda = Math.min(D.varreduraVel * D.varreduraDura, Math.max(0, D.varreduraCobre * W - D.varreduraLargura));
        beam(b.x, b.y + 40, D.varreduraLargura, D.varreduraAviso, D.varreduraDura, dir * D.varreduraVel, b.x + dir * anda);
      }
      if (timer(b, 'shotT', dt, fury(b, D.tiroIntervalo))) bAimed(b, fury(b, D.tiros), D.tiroAbertura, ebs() * D.tiroVel, D.tiroRaio);
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
    update(b, dt) {
      const D = BOSS_DATA.vortex;
      if (enter(b, dt)) return;
      b.x = W / 2 + Math.sin(b.t * .5) * Math.min(W * .25, 300); bob(b, dt, D);
      b.cyc = (b.cyc || 0) + dt;
      const dir = Math.floor(b.cyc / D.ciclo) % 2 ? -1 : 1, on = b.cyc % D.ciclo < D.atirando;
      b.spin = (b.spin || 0) + dt * fury(b, D.giro) * dir;
      if (!on) {                               // parou de girar: solta pulsos em anel
        if (!b.pulsed) { b.pulsed = true; for (let k = 0; k < fury(b, D.pulsos); k++) setTimeoutFx(k * .35, () => { if (!b.dead) bRing(b.x, b.y, D.pulso + S.phase * D.pulsoPorFase, ebs() * D.pulsoVel, D.pulsoRaio); }); }
        return;
      }
      b.pulsed = false;
      if (timer(b, 'shotT', dt, fury(b, D.cadencia), 0)) {
        const arms = fury(b, D.bracos), anti = fury(b, D.contraBracos);
        for (let k = 0; k < arms; k++) bShoot(b.x, b.y, b.spin + k / arms * TAU, ebs() * D.velTiro, D.tiroRaio);
        for (let k = 0; k < anti; k++) bShoot(b.x, b.y, -b.spin * 1.3 + k / anti * TAU, ebs() * D.velTiro, D.tiroRaio);
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
    update(b, dt) {
      const D = BOSS_DATA.ram;
      if (!b.mode && enter(b, dt)) return;
      if (!b.mode) b.mode = 'patrol';
      if (b.mode === 'patrol') {
        patrol(b, dt, D.vel);
        b.patT -= dt;
        if (b.patT <= 0) { b.mode = 'warn'; b.wt = fury(b, D.aviso); b.left = fury(b, D.investidas); }
        if (timer(b, 'shotT', dt, fury(b, D.tiroIntervalo))) bAimed(b, D.tiros, D.tiroAbertura, ebs());
      } else if (b.mode === 'warn') {
        b.wt -= dt; const p = nearestPlayer(b); if (p) { b.tx = p.x; b.ty2 = p.y; }
        if (b.wt <= 0) { const a = Math.atan2((b.ty2 || H) - b.y, (b.tx || b.x) - b.x), v = fury(b, D.investida); b.vx = Math.cos(a) * v; b.vy = Math.sin(a) * v; b.mode = 'charge'; b.left--; }
      } else if (b.mode === 'charge') {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (timer(b, 'dropT', dt, D.rastroCadencia, 0)) { const a = Math.atan2(b.vy, b.vx); bShoot(b.x, b.y, a + Math.PI / 2, ebs() * D.rastroVel, D.rastroRaio); bShoot(b.x, b.y, a - Math.PI / 2, ebs() * D.rastroVel, D.rastroRaio); }
        if (b.y > H - 60 || b.x < 40 || b.x > W - 40 || b.y < 40) {
          b.x = clamp(b.x, 40, W - 40); b.y = clamp(b.y, 40, H - 60);
          bRing(b.x, b.y, D.impacto, ebs() * D.impactoVel, D.impactoRaio);
          if (b.left > 0) { b.mode = 'warn'; b.wt = D.avisoSeguinte; } else b.mode = 'back';
        }
      } else {
        const dy = b.ty - b.y; b.y += clamp(dy, -D.volta * dt, D.volta * dt);
        if (Math.abs(dy) < 2) { b.mode = 'patrol'; b.patT = fury(b, D.intervalo); bRing(b.x, b.y, D.anel, ebs() * D.anelVel, D.anelRaio); }
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
    update(b, dt) {
      const D = BOSS_DATA.twins, f = b.rage2 ? 1 : 0;
      b.bt = (b.bt || 0) + dt;
      const rad = Math.min(W / 2 - 80, 320) * (D.raioMin + (1 - D.raioMin) * (.5 + .5 * Math.cos(b.bt * .7)));
      if (b.ang === undefined) b.ang = b.idx * Math.PI;
      if (enter(b, dt)) { b.x = W / 2 + Math.cos(b.ang) * rad; return; }
      if (timer(b, 'swapT', dt, D.trocaGiro[f])) b.gd = -(b.gd || 1);
      b.ang += dt * D.giro[f] * (b.gd || 1);
      b.x = W / 2 + Math.cos(b.ang) * rad; b.y = b.ty + Math.sin(b.ang) * 60;
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = D.intervalo[f];
        if (b.idx && !b.rage2) for (let k = 0; k < D.leque; k++) bShoot(b.x, b.y + 20, Math.PI / 2 + (k - (D.leque - 1) / 2) * D.lequeAbertura, ebs() * D.lequeVel, 5);
        else bAimed(b, D.tiros, D.tiroAbertura, ebs() * D.tiroVel);
        if (b.rage2) bRing(b.x, b.y, D.anel, ebs() * D.anelVel, D.anelRaio);
      }
      if (timer(b, 'rjT', dt, D.rajadaIntervalo[f], D.rajadaIntervalo[f] + b.idx * 1.5))
        for (let w = 0; w < D.rajada; w++) setTimeoutFx(w * D.rajadaPausa, () => { if (!b.dead) bAimed(b, 1, 0, ebs() * D.rajadaVel); });
    },
    draw(b) { const c = b.idx ? ['#b03050', '#5a1428'] : ['#3060b0', '#142c5a']; drawPlane(b.x, b.y, 2.4, c[0], c[1], true, 0, b.flash > 0); },
  },
  sower: {
    update(b, dt) {
      const D = BOSS_DATA.sower;
      if (enter(b, dt)) return;
      patrol(b, dt, fury(b, D.vel)); bob(b, dt, D);
      b.patT -= dt;
      if (b.patT <= 0) { b.patT = fury(b, D.minaIntervalo); for (let k = 0; k < fury(b, D.minas); k++) addEnemy('mine', b.x + rnd(-60, 60), b.y + 30, { fuse: D.minaPavio }); }
      if (timer(b, 'orbT', dt, fury(b, D.orbeIntervalo), D.orbePrimeiro)) {
        const n = fury(b, D.orbes);
        for (let k = 0; k < n; k++) { const s = [-1, 1, 0][k % 3]; S.ebullets.push({ x: b.x + s * 40, y: b.y, vx: s * 80, vy: s ? 60 : 110, r: D.orbeRaio, d: D.orbeDano * eDmg(), home: true, life: D.orbeDura, k: 'orbe' }); }
      }
      if (timer(b, 'seedT', dt, fury(b, D.sementeIntervalo), D.sementePrimeiro)) {   // sementes: estouram em anel
        const n = fury(b, D.sementes);
        for (let k = 0; k < n; k++) { const a = Math.PI / 2 + (k - (n - 1) / 2) * D.sementeAbertura, v = ebs() * D.sementeVel;
          S.ebullets.push({ x: b.x, y: b.y + 30, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: D.sementeRaio, d: bDmg(), bd: bDmg(), burst: D.sementeEstoura, k: 'semente' }); }
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
    update(b, dt) {
      const D = BOSS_DATA.ghost;
      if (enter(b, dt)) return;
      if (!b.mode) { b.mode = 'show'; b.mt = D.apareceInicio; b.baseY = b.y; }
      b.mt -= dt;
      if (b.mode === 'show') {
        b.alpha = 1; b.invuln = false; patrol(b, dt, D.vel);
        b.bt = (b.bt || 0) + dt; b.y = b.baseY + Math.sin(b.bt * D.ondulaVel) * D.ondula;
        b.patT -= dt; if (b.patT <= 0) { b.patT = fury(b, D.intervalo); bAimed(b, fury(b, D.tiros), D.tiroAbertura, ebs() * D.tiroVel); }
        if (b.mt <= 0) { b.mode = 'fade'; b.mt = D.some; }
      } else if (b.mode === 'fade') {
        b.alpha = Math.max(.08, b.mt / D.some); b.invuln = true;
        if (b.mt <= 0) {
          if (rage(b)) bRing(b.x, b.y, D.anel + S.phase * D.anelPorFase, ebs() * D.anelVel, D.anelRaio);   // eco onde sumiu
          const p = nearestPlayer(b);
          b.mode = 'hidden'; b.mt = D.escondido;
          b.x = clamp((p ? p.x : W / 2) + lado() * rnd(D.pertoMin, D.pertoMax), 100, W - 100);
          b.y = b.baseY = rnd(100, 280); b.bt = 0;
        }
      } else if (b.mode === 'hidden') {
        b.alpha = .08;
        if (b.mt <= 0) { b.mode = 'show'; b.mt = fury(b, D.aparece); bRing(b.x, b.y, D.anel + S.phase * D.anelPorFase, ebs() * D.anelVel, D.anelRaio); }
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
    init(b) { const D = BOSS_DATA.guardian; b.shR = D.escudoRaio; b.rot = 0; b.arc = D.escudoArco; },
    update(b, dt) {
      const D = BOSS_DATA.guardian;
      if (timer(b, 'swapT', dt, fury(b, D.trocaGiro))) b.gd = -(b.gd || 1);
      b.rot += dt * fury(b, D.giro) * (b.gd || 1);
      if (enter(b, dt)) return;
      patrol(b, dt, fury(b, D.vel)); bob(b, dt, D);
      b.patT -= dt;
      if (b.patT <= 0) { b.patT = fury(b, D.intervalo); bAimed(b, D.tiros, D.tiroAbertura, ebs() * D.tiroVel); }
      if (timer(b, 'ringT', dt, fury(b, D.anelIntervalo))) bRing(b.x, b.y, D.anel, ebs() * D.anelVel, D.anelRaio);
      if (timer(b, 'gapT', dt, fury(b, D.brechaIntervalo))) {   // tiros saindo pelas brechas do escudo
        const n = fury(b, D.brechaTiros);
        for (let k = 0; k < 3; k++) { const a = b.rot + k * TAU / 3 + b.arc + (TAU / 3 - b.arc) / 2;
          for (let j = 0; j < n; j++) bShoot(b.x + Math.cos(a) * b.shR, b.y + Math.sin(a) * b.shR, a + (j - (n - 1) / 2) * .15, ebs() * D.brechaVel, D.brechaRaio); }
      }
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
    update(b, dt) {
      const D = BOSS_DATA.storm;
      if (enter(b, dt)) return;
      if (b.wx === undefined || (Math.abs(b.wx - b.x) < 4 && Math.abs(b.wy - b.y) < 4)) { b.wx = rnd(120, W - 120); b.wy = rnd(D.alturaMin, D.alturaMax); }
      const dx = b.wx - b.x, dy = b.wy - b.y, dd = Math.hypot(dx, dy) || 1, st = Math.min(dd, fury(b, D.vel) * dt);
      b.x += dx / dd * st; b.y += dy / dd * st;   // vaga pelo céu
      b.patT -= dt;
      if (b.patT <= 0) {
        b.patT = fury(b, D.paredeIntervalo);
        for (let k = 0; k < fury(b, D.paredes); k++) setTimeoutFx(k * D.paredePausa, () => {
          if (b.dead) return;
          const gap = rnd(80, W - 80), gw = D.buraco;
          for (let x = 15; x < W; x += D.espaco) if (Math.abs(x - gap) > gw / 2) bShoot(x, -10, Math.PI / 2, ebs() * D.paredeVel, D.paredeRaio);
        });
      }
      if (timer(b, 'boltT', dt, fury(b, D.raioIntervalo), D.raioPrimeiro)) {
        const n = fury(b, D.raios);
        for (let k = 0; k < n; k++) { const p = k === 0 ? nearestPlayer(b) : null; beam(p ? p.x : rnd(40, W - 40), 0, D.raioLargura, D.raioAviso, D.raioDura); }
      }
      b.hail = (b.hail || 0) + dt * fury(b, D.granizo);   // granizo caindo o tempo todo
      while (b.hail >= 1) { b.hail--; bShoot(rnd(20, W - 20), -10, Math.PI / 2 + rnd(-.2, .2), ebs() * D.granizoVel, D.granizoRaio); }
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

function mkBoss(kind, hp, extra) {
  const def = BOSSES[kind];
  const b = Object.assign({ boss: true, kind, x: W / 2, y: -100, ty: 160, r: BOSS_DATA[kind].r, hp, maxHp: hp, t: 0, patT: 2, dir: 1, flash: 0, alpha: 1 }, extra || {});
  if (def.init) def.init(b);
  return b;
}
function spawnBoss() {
  const kind = BOSS_ORDER[(S.phase - 1) % BOSS_ORDER.length], def = BOSS_DATA[kind];
  const hp = BOSS_HP.base * (1 + BOSS_HP.porFase * (S.phase - 1)) * (S.np === 2 ? BOSS_HP.doisJogadores : 1) * def.vida;
  if (kind === 'twins') { for (let i = 0; i < 2; i++) S.bosses.push(mkBoss(kind, hp * def.vidaCada, { idx: i })); }
  else S.bosses.push(mkBoss(kind, hp));
  S.bossName = def.name + (S.phase > BOSS_ORDER.length ? ' +' + Math.floor((S.phase - 1) / BOSS_ORDER.length) : '');
  S.banner = { t: 2.5, text: S.bossName };
}
function updateBosses(dt) {
  for (const b of S.bosses) {
    if (b.dead) continue;
    const bdt = lentoDt(b, dt); // Onda da Âncora Negra (metade do efeito nos chefões)
    b.t += bdt; if (b.flash > 0) b.flash -= dt;
    BOSSES[b.kind].update(b, bdt);
    if (!b.invuln) for (const p of S.players) if (p.alive && d2(p, b) < (p.r + b.r - 10) ** 2) hurt(p, (b.kind === 'ram' ? BOSS_DMG.toqueAriete : BOSS_DMG.toque) * eDmg());
  }
}
function updateHazards(dt) {
  // depois que a varredura some, mais um tempinho sem raio fixo (BOSS_DATA.laser.varreduraFolga)
  if (S.hazards.some(h => h.vx)) S.semRaioFixo = BOSS_DATA.laser.varreduraFolga; else if (S.semRaioFixo > 0) S.semRaioFixo -= dt;
  for (const h of S.hazards) {
    if (h.warn > 0) { h.warn -= dt; continue; }
    h.life -= dt; h.x += h.vx * dt;
    if (h.xFim !== undefined && (h.x - h.xFim) * Math.sign(h.vx) > 0) h.x = h.xFim;   // varredura para no limite
    for (const p of S.players) if (p.alive && p.y > h.y0 && Math.abs(p.x - h.x) < h.w / 2 + p.r * .6) hurt(p, BOSS_DMG.raio * eDmg());
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
