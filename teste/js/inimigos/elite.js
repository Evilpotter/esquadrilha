// ---------- Elite (mini-chefe no meio das ondas) e baú do tesouro ----------
// Números em ELITE (js/dados/inimigos.js); desenho em js/visual/elite.js.
// O elite é um inimigo comum (S.enemies) com e.elite = true: leva dano, fogo, lentidão e tontura como os outros,
// mas não segue o comportamento do tipo base (updateEnemies chama updateElite) e não pode ser hipnotizado.
function spawnElite() {
  S.eliteFeito = true;
  const C = ELITE.cenas[S.scene]; if (!C) return;
  const hp = BOSS_HP.base * (1 + BOSS_HP.porFase * (S.phase - 1)) * (S.np === 2 ? BOSS_HP.doisJogadores : 1) * ELITE.vidaChefao;
  S.elite = addEnemy(C.tipo, W / 2, -70, { elite: true, cena: S.scene, nome: C.nome, r: ELITE.raio, hp, maxHp: hp, atkT: 1.2, atk: 0, pt: 0 });
  S.banner = { t: 2.5, text: 'Elite à vista: ' + C.nome + '!' };
  som('chefao_alerta', W / 2);
}
function eliteVivo() { return S.elite && !S.elite.dead ? S.elite : null; }
function updateElite(e, dt, p, rate, bs) {
  const E = ELITE, A = E.ataques, C = E.cenas[e.cena];
  if (!e.foge && (S.bossSpawned || e.t > E.fica)) { e.foge = true; S.banner = { t: 2.5, text: 'O ' + e.nome + ' fugiu!' }; }
  if (e.foge) { e.y -= 170 * dt; if (e.y < -90) { e.dead = true; S.elite = null; } return; }
  if (!e.chegou) { e.y += E.desce * dt; if (e.y >= E.altura) e.chegou = true; return; } // chegando: não atira
  e.pt += dt;
  e.x = clamp(W / 2 + Math.sin(e.pt * .55) * Math.min(W * E.patrulha, E.patrulhaMax), 60, W - 60);
  e.y = E.altura + Math.sin(e.pt * 1.3) * 18;
  const furia = e.hp < e.maxHp / 2;
  if (furia && !e.furia) { e.furia = true; som('chefao_furia', e.x); }
  e.atkT -= dt * rate * (furia ? A.furia : 1);
  if (e.atkT > 0) return;
  e.atkT = A.espera;
  const k = e.atk++ % 3, ang = p ? Math.atan2(p.y - e.y, p.x - e.x) : Math.PI / 2;
  if (k === 0) for (let i = 0; i < A.leque; i++) eFire(e, C.tiro, e.x, e.y + e.r * .5, ang + (i - (A.leque - 1) / 2) * A.abre, bs * .9, 6); // leque mirado
  else if (k === 1) { const n = furia ? A.anelFuria : A.anel; for (let i = 0; i < n; i++) eFire(e, C.tiro2, e.x, e.y, e.pt + i / n * TAU, bs * .6, 5); } // anel
  else for (let w = 0; w < A.rajada; w++) setTimeoutFx(w * .15, () => { // rajada mirada
    if (e.dead || e.foge || !S.enemies) return; const q = nearestPlayer(e); if (q) eFire(e, C.tiro2, e.x, e.y + e.r * .5, Math.atan2(q.y - e.y, q.x - e.x), bs * 1.15, 5);
  });
}
// derrotado: cristais grandes e o baú (chamado por killEnemy)
function eliteMorre(e, m) {
  S.elite = null;
  for (let k = 0; k < ELITE.cristais; k++) S.gems.push({ x: e.x + Math.cos(k / ELITE.cristais * TAU) * 26, y: e.y + Math.sin(k / ELITE.cristais * TAU) * 26, v: 3 * m });
  (S.baus = S.baus || []).push({ x: e.x, y: e.y, t: 0 });
  S.banner = { t: 2.5, text: e.nome + ' derrotado! Pegue o baú!' };
  som('conquista', e.x);
}
// baú: cai devagar, é puxado pelo ímã e, ao ser pego, dá uma melhoria em dobro (S.bauPend → openLevelUp)
function updateBaus(dt) {
  if (!S.baus || !S.baus.length) return;
  for (const b of S.baus) {
    b.t += dt;
    let got = null, puxa = false;
    for (const p of S.players) {
      if (!p.alive) continue;
      const dd = Math.sqrt(d2(p, b));
      if (dd < p.r + 20) { got = p; break; }
      const ima = p.mag * ELITE.bau.ima;
      if (dd < ima) { const s = 300 * dt / dd; b.x += (p.x - b.x) * Math.min(1, s); b.y += (p.y - b.y) * Math.min(1, s); puxa = true; }
    }
    if (got) { b.dead = true; S.bauPend = (S.bauPend || 0) + 1; som('conquista', b.x); continue; }
    if (!puxa) b.y += ELITE.bau.cai * dt;
    if (b.y > H + 30) b.dead = true;
  }
  S.baus = S.baus.filter(b => !b.dead);
}
