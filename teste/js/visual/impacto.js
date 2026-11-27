// ---------- Impacto e animação das naves (só visual) ----------
// Tremor, pausa de impacto, câmera lenta do chefão, aviões caindo, crateras, fumaça com vida baixa,
// números de dano, inclinação, sombra, entrada na fase, looping de vitória, nível e pose da habilidade.
// Nada aqui usa Math.random nem muda o jogo: o sorteio próprio (rfx) deixa o jogo e os testes iguais.
// Números em js/dados/impacto.js. Ganchos: dano.js (impDano impMorte impBoom impChefaoCai impChefao),
// habilidades.js (impHab), selecoes.js (impNivel impEntrada), estado.js (impEntrada), main.js (impTempo).

let rfxS = 98765;
function rfx(a, b) { rfxS = rfxS + 0x6D2B79F5 | 0; let t = Math.imul(rfxS ^ rfxS >>> 15, 1 | rfxS); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; const u = ((t ^ t >>> 14) >>> 0) / 4294967296; return a + (b - a) * u; }

// opções (menu de pausa), guardadas no navegador
const IMP_CFG = { tremor: true, numeros: true };
try { Object.assign(IMP_CFG, JSON.parse(localStorage.getItem('esquadrilha.efeitos.v1') || '{}')); } catch (e) {}
function impCfgTroca(k) { IMP_CFG[k] = !IMP_CFG[k]; try { localStorage.setItem('esquadrilha.efeitos.v1', JSON.stringify(IMP_CFG)); } catch (e) {} }

// relógio do jogo (main.js): pausa de impacto e câmera lenta, em tempo real
const IMP_T = { parada: 0, lento: 0, ultParada: 0 };
function impTempo(dt) {
  IMP_T.ultParada += dt;
  if (IMP_T.parada > 0) { IMP_T.parada -= dt; return 0; }
  if (IMP_T.lento > 0) { IMP_T.lento -= dt; return dt * IMPACTO.lento.escala; }
  return dt;
}
function impPara(t) {
  if (IMP_T.ultParada < IMPACTO.parada.intervalo) return;
  IMP_T.parada = Math.max(IMP_T.parada, t); IMP_T.ultParada = 0;
}
function impTremor(v) { if (S.shake !== undefined && S.shake < v) S.shake = Math.min(IMPACTO.tremor.max * 1.5, v); }

// estado visual (recomeça a cada jogo novo)
let IMP = null;
function impEstado() {
  if (!IMP || IMP.S !== S) IMP = { S, queda: [], crateras: [], part: [], part2: [], nums: [], aneis: [], nivel: null, clarao: 0, t: 0, entra: [], vit: null, pose: [], ult: [], vento: [], fumo: [] };
  return IMP;
}
function impPart(lista, o) { const I = impEstado(); if (I.part.length + I.part2.length < IMPACTO.particulasMax) lista.push(o); }

// ---------- ganchos chamados pelo jogo ----------
function impDano(t, v, crit, src) {
  if (!IMP_CFG.numeros || !(v > 0)) return;
  const I = impEstado(), N = IMPACTO.numeros, fogo = src === 'burn';
  for (const n of I.nums) if (n.alvo === t && n.fogo === fogo && !n.crit && !crit && n.t < (fogo ? N.juntaFogo : N.junta)) { n.v += v; n.x = t.x; return; }
  if (I.nums.length >= N.max) I.nums.shift();
  let k = 0; for (const n of I.nums) if (n.alvo === t) k++; // vários números no mesmo alvo: um em cima do outro
  I.nums.push({ alvo: t, v, crit: !!crit, fogo, chefe: !!t.boss || !!t.elite, x: t.x + rfx(-12, 12), y0: t.y - t.r - 13 * (k % 3), t: 0 });
}
function impBoom(x, y, r) {
  const T = IMPACTO.tremor;
  if (r >= T.boomMin) impTremor(Math.min(T.max, r * T.porRaio));
}
function impMorte(e) {
  const I = impEstado(), et = ETYPES[e.type];
  if (e.elite) { impPara(IMPACTO.parada.elite); impTremor(IMPACTO.tremor.elite); }
  else if (et.xp >= 5) impPara(IMPACTO.parada.forte);
  if (e.type === 'rock' || e.type === 'kraken' || e.type === 'fantasma') return;
  const corpo = Object.assign({}, e, { x: 0, y: 0, flash: 0, dead: false, alpha: 1, sub: 0, hp: e.maxHp });
  if (et.ground) {
    if (et.scene === 'piratas') { I.queda.push({ k: 'afunda', e: corpo, x: e.x, y: e.y, r: e.r, t: 0, life: IMPACTO.afunda.tempo }); return; }
    if (I.crateras.length >= IMPACTO.cratera.max) I.crateras.shift();
    const pedras = []; for (let k = 0; k < 5; k++) pedras.push([rfx(0, TAU), rfx(.7, 1.25), rfx(1.5, 3)]);
    I.crateras.push({ x: e.x, y: e.y, r: e.r * 1.05, t: 0, pedras, rot: rfx(0, TAU) });
    return;
  }
  if (I.queda.length >= IMPACTO.queda.max) I.queda.shift();
  I.queda.push({ k: 'cai', e: corpo, x: e.x, y: e.y, r: e.r, vx: rfx(-45, 45), vy: rfx(25, 55), rot: 0, vr: rfx(-1, 1) < 0 ? -IMPACTO.queda.giro : IMPACTO.queda.giro, t: 0, life: IMPACTO.queda.tempo, fum: 0 });
}
function impChefaoCai(b) {
  const I = impEstado(), C = IMPACTO.chefaoCai;
  I.queda.push({ k: 'chefao', e: Object.assign({}, b, { x: 0, y: 0, flash: 0, dead: false, hp: b.maxHp }), x: b.x, y: b.y, r: 60, vx: 0, vy: 30, rot: 0, vr: C.giro, t: 0, life: C.tempo, fum: 0 });
}
function impChefao() {
  const I = impEstado();
  IMP_T.lento = IMPACTO.lento.tempo; I.clarao = IMPACTO.clarao.chefao;
  impTremor(IMPACTO.tremor.chefao);
  I.vit = { t: 0 };
}
function impHab(p) {
  const I = impEstado(), id = SHIPS[p.ship].id;
  impTremor(IMPACTO.tremor.habilidade);
  I.pose[p.i] = { id, t: 0, max: IMPACTO.pose[id] || .5 };
  I.aneis.push({ x: p.x, y: p.y, r: 70, t: 0, life: .45, cor: naveCor(p.skin, PCOL[p.i].body, PCOL[p.i].dark).brilho, w: 5 });
}
function impNivel() {
  const I = impEstado();
  I.nivel = { t: 0, n: S.level };
  for (const p of S.players) if (p.alive) {
    I.aneis.push({ x: p.x, y: p.y, r: 90, t: 0, life: .6, cor: '#7dff8a', w: 6 });
    I.aneis.push({ x: p.x, y: p.y, r: 60, t: -.12, life: .5, cor: '#fff6c0', w: 3 });
  }
}
function impEntrada(i) {
  const I = impEstado();
  if (i === undefined) { for (const p of S.players || []) I.entra[p.i] = { t: 0 }; }
  else I.entra[i] = { t: 0 };
}

// ---------- passo (chamado no step, só no modo de jogo) ----------
function impPasso(dt) {
  const I = impEstado(); I.t += dt;
  if (I.clarao > 0) I.clarao = Math.max(0, I.clarao - dt * IMPACTO.clarao.some);
  for (const q of I.queda) {
    q.t += dt;
    if (q.k === 'afunda') { if (Math.floor(q.t / .25) !== Math.floor((q.t - dt) / .25)) impPart(I.part, { k: 'onda', x: q.x + rfx(-6, 6), y: q.y + rfx(-4, 4), r: q.r * .8, t: 0, life: .8 }); q.y += 60 * dt; continue; }
    q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
    q.fum -= dt;
    if (q.fum <= 0) {
      q.fum = IMPACTO.queda.fumaca * (q.k === 'chefao' ? .5 : 1);
      const u = q.t / q.life, s = 1 - (1 - IMPACTO.queda.escalaFim) * u, rr = q.r * s;
      impPart(I.part, { k: 'fumo', x: q.x + rfx(-rr, rr) * .4, y: q.y + rfx(-rr, rr) * .4, r: rfx(3, 6) * (q.k === 'chefao' ? 2.4 : 1) * (q.r / 18), t: 0, life: rfx(.5, .9), vx: rfx(-10, 10), vy: 55, escuro: rfx(0, 1) < .6 });
      if (rfx(0, 1) < .35) impPart(I.part, { k: 'brasa', x: q.x, y: q.y, r: 2, t: 0, life: .3, vx: rfx(-60, 60), vy: rfx(-60, 30) });
    }
    if (q.t >= q.life && q.k !== 'afunda') {
      // bateu no chão / na água: anel e poeira
      const agua = S.scene === 'sea' || S.scene === 'piratas';
      impPart(I.part, { k: agua ? 'onda' : 'poeira', x: q.x, y: q.y, r: q.r * (q.k === 'chefao' ? 2.2 : 1.1), t: 0, life: agua ? .9 : .6 });
      if (!agua && q.k !== 'chefao' && I.crateras.length < IMPACTO.cratera.max) {
        const pedras = []; for (let k = 0; k < 4; k++) pedras.push([rfx(0, TAU), rfx(.7, 1.2), rfx(1.2, 2.4)]);
        I.crateras.push({ x: q.x, y: q.y, r: q.r * .55, t: 0, pedras, rot: rfx(0, TAU) });
      }
    }
  }
  I.queda = I.queda.filter(q => q.t < q.life);
  for (const c of I.crateras) { c.t += dt; c.y += 60 * dt; }
  I.crateras = I.crateras.filter(c => c.t < IMPACTO.cratera.tempo && c.y < H + 60);
  for (const lista of [I.part, I.part2]) for (const f of lista) { f.t += dt; if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; } }
  I.part = I.part.filter(f => f.t < f.life); I.part2 = I.part2.filter(f => f.t < f.life);
  for (const n of I.nums) n.t += dt;
  I.nums = I.nums.filter(n => n.t < IMPACTO.numeros.tempo);
  for (const a of I.aneis) a.t += dt;
  I.aneis = I.aneis.filter(a => a.t < a.life);
  if (I.nivel) { I.nivel.t += dt; if (I.nivel.t > IMPACTO.nivel) I.nivel = null; }
  if (I.vit) { I.vit.t += dt; if (I.vit.t > IMPACTO.vitoria) I.vit = null; }
  for (const p of S.players) {
    const i = p.i;
    if (I.entra[i]) { I.entra[i].t += dt; if (I.entra[i].t > IMPACTO.entrada) I.entra[i] = null; }
    if (I.pose[i]) { I.pose[i].t += dt; if (I.pose[i].t > I.pose[i].max) I.pose[i] = null; }
    const u = I.ult[i] || { x: p.x, y: p.y }, vx = dt > 0 ? (p.x - u.x) / dt : 0, vy = dt > 0 ? (p.y - u.y) / dt : 0;
    I.ult[i] = { x: p.x, y: p.y };
    if (!p.alive || p.ovoT > 0) continue;
    // rastro de vento nas pontas das asas
    I.vento[i] = (I.vento[i] || 0) - dt;
    if (Math.hypot(vx, vy) > IMPACTO.vento.vel && I.vento[i] <= 0 && !(p.dashT > 0)) {
      I.vento[i] = IMPACTO.vento.cada;
      const a = (p.tilt || 0) * IMPACTO.inclina, ca = Math.cos(a), sa = Math.sin(a);
      for (const s of [-1, 1]) impPart(I.part2, { k: 'vento', x: p.x + s * 21 * ca, y: p.y + 4 + s * 21 * sa, t: 0, life: .22, vx: -vx * .15, vy: -vy * .15 + 40 });
    }
    // vida baixa: fumaça e faíscas
    I.fumo[i] = (I.fumo[i] || 0) - dt;
    if (p.hp < p.maxHp * IMPACTO.vidaBaixa && I.fumo[i] <= 0) {
      I.fumo[i] = .07;
      impPart(I.part2, { k: 'fumo', x: p.x + rfx(-9, 9), y: p.y + rfx(0, 10), r: rfx(3, 5.5), t: 0, life: rfx(.45, .75), vx: rfx(-12, 12), vy: rfx(70, 110), escuro: true });
      if (rfx(0, 1) < .3) impPart(I.part2, { k: 'brasa', x: p.x + rfx(-12, 12), y: p.y + rfx(-6, 8), r: 1.8, t: 0, life: .28, vx: rfx(-90, 90), vy: rfx(-40, 90) });
    }
  }
}

// ---------- transformação da nave (inclinação, entrada, looping, pose) ----------
// devolve escala, giro, deslocamento e altura (para a sombra); só desenho
function impNave(p) {
  const I = impEstado(), o = { sx: 1, sy: 1, rot: (p.tilt || 0) * IMPACTO.inclina, dy: 0, alt: 1, alfa: 1 };
  const en = I.entra[p.i];
  if (en) { const u = clamp(en.t / IMPACTO.entrada, 0, 1), v = (1 - u) * (1 - u); o.sx = o.sy = 1 + 1.3 * v; o.alt = 1 + 3 * v; o.alfa = .35 + .65 * Math.min(1, u * 1.6); }
  if (I.vit && p.alive) { const u = clamp(I.vit.t / IMPACTO.vitoria, 0, 1), e = u * u * (3 - 2 * u), b = Math.sin(Math.PI * u); o.rot += TAU * e; o.sx *= 1 + .35 * b; o.sy *= 1 + .35 * b; o.alt *= 1 + 1.2 * b; }
  if (p.dashT > 0) { o.sx *= .66; o.sy *= 1.14; }  // Falcão: encolhe as asas no mergulho
  const po = I.pose[p.i];
  if (po) {
    const u = clamp(po.t / po.max, 0, 1), b = Math.sin(Math.PI * u);
    if (po.id === 'boomer') o.rot += TAU * u * u * (3 - 2 * u);
    else if (po.id === 'artillery') { o.dy += 7 * (1 - u) * (1 - u); o.sx *= 1 - .06 * b; o.sy *= 1 - .06 * b; }
    else if (po.id === 'pirate') o.rot += Math.PI / 2 * b;
    else if (po.id === 'phoenix') { o.sx *= 1 + .28 * b; o.sy *= 1 + .18 * b; }
    else if (po.id === 'hypnos') o.sx *= 1 + .38 * b;
  }
  return o;
}
function impNaveAntes(p) {
  const o = impNave(p);
  cx.save(); cx.globalAlpha = o.alfa;
  cx.translate(p.x, p.y + o.dy); cx.rotate(o.rot); cx.scale(o.sx, o.sy); cx.translate(-p.x, -p.y);
}
function impNaveDepois() { cx.restore(); }

// ---------- desenho ----------
// no chão, antes dos inimigos de solo: crateras
function impChao() {
  const I = impEstado();
  for (const c of I.crateras) {
    const a = c.t < .2 ? c.t / .2 : 1 - Math.max(0, c.t - IMPACTO.cratera.tempo + 1.2) / 1.2;
    cx.globalAlpha = clamp(a, 0, 1) * .85;
    cx.save(); cx.translate(c.x, c.y); cx.rotate(c.rot);
    cx.fillStyle = '#3a2a1a'; cx.beginPath(); cx.ellipse(0, 0, c.r * 1.25, c.r, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#1e140c'; cx.beginPath(); cx.ellipse(0, 1, c.r * .8, c.r * .6, 0, 0, TAU); cx.fill();
    cx.strokeStyle = 'rgba(255,230,180,.18)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(0, 0, c.r * 1.25, c.r, 0, Math.PI * 1.1, Math.PI * 1.9); cx.stroke();
    cx.fillStyle = '#4a3a2a';
    for (const [ang, d, rr] of c.pedras) { cx.beginPath(); cx.arc(Math.cos(ang) * c.r * 1.3 * d, Math.sin(ang) * c.r * 1.05 * d, rr, 0, TAU); cx.fill(); }
    cx.restore();
  }
  cx.globalAlpha = 1;
}
// sombra das naves no chão (deslocada; mais longe quando a nave está mais alta)
function impSombras() {
  const Sb = IMPACTO.sombra;
  for (const p of S.players) {
    if (!p.alive) continue;
    const o = impNave(p), k = o.alt, sx = p.x + Sb.dx * k, sy = p.y + Sb.dy * k, rx = Sb.rx * Math.max(o.sx, .8) * (p.dragonT > 0 ? 1.4 : 1), ry = Sb.ry * Math.max(o.sy, .8);
    cx.save(); cx.translate(sx, sy); cx.rotate(o.rot * .5); cx.scale(rx, ry);
    const g = cx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(0,0,0,' + (Sb.alfa / Math.sqrt(k)) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, 1, 0, TAU); cx.fill();
    cx.restore();
  }
}
function impParticula(f) {
  const k = f.t / f.life;
  if (f.k === 'fumo') { cx.globalAlpha = (1 - k) * .6; cx.fillStyle = f.escuro ? '#3b3632' : '#9a948c'; cx.beginPath(); cx.arc(f.x, f.y, f.r * (1 + k * 1.8), 0, TAU); cx.fill(); }
  else if (f.k === 'brasa') { cx.globalAlpha = 1 - k; cx.fillStyle = k < .5 ? '#ffe08a' : '#ff8a3a'; cx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); }
  else if (f.k === 'onda') { cx.globalAlpha = (1 - k) * .75; cx.strokeStyle = '#e8fbff'; cx.lineWidth = 2.5; cx.beginPath(); cx.ellipse(f.x, f.y, f.r * (.4 + k), f.r * (.3 + k * .7), 0, 0, TAU); cx.stroke(); }
  else if (f.k === 'poeira') { cx.globalAlpha = (1 - k) * .55; cx.fillStyle = '#c8a878'; cx.beginPath(); cx.arc(f.x, f.y, f.r * (.5 + k), 0, TAU); cx.fill(); }
  else if (f.k === 'vento') { cx.globalAlpha = (1 - k) * .45; cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(f.x - f.vx * .08, f.y - f.vy * .08 + 6); cx.stroke(); }
}
// aviões caindo, barcos afundando e a fumaça deles (abaixo das naves)
function impQueda() {
  const I = impEstado();
  for (const f of I.part) impParticula(f);
  cx.globalAlpha = 1;
  for (const q of I.queda) {
    const u = clamp(q.t / q.life, 0, 1);
    cx.save();
    try {
      if (q.k === 'afunda') {
        cx.globalAlpha = 1 - u; cx.translate(q.x, q.y); cx.scale(1 - .2 * u, 1 - .2 * u);
        if (!drawEnemyArt(q.e)) drawEnemy(q.e);
      } else if (q.k === 'chefao') {
        const s = 1 - (1 - IMPACTO.chefaoCai.escalaFim) * u * u;
        cx.globalAlpha = 1 - u * u; cx.translate(q.x, q.y); cx.rotate(q.rot); cx.scale(s, s);
        if (!drawBossArt(q.e)) BOSSES[q.e.kind].draw(q.e);
      } else {
        const s = 1 - (1 - IMPACTO.queda.escalaFim) * u;
        cx.globalAlpha = u < .8 ? 1 : (1 - u) / .2; cx.translate(q.x, q.y); cx.rotate(q.rot); cx.scale(s, s);
        if (!drawEnemyArt(q.e)) drawEnemy(q.e);
        // escurece aos poucos (queimado)
        cx.globalAlpha *= .45 * u; cx.fillStyle = '#1a1410'; cx.beginPath(); cx.arc(0, 0, q.r * .9, 0, TAU); cx.fill();
      }
    } catch (err) {}
    cx.restore();
  }
  cx.globalAlpha = 1;
}
// por cima das naves: vento, fumaça da vida baixa, anéis, números de dano, faixa do nível
function impFrente() {
  const I = impEstado();
  for (const f of I.part2) impParticula(f);
  cx.globalAlpha = 1;
  for (const a of I.aneis) {
    if (a.t < 0) continue;
    const k = a.t / a.life;
    cx.globalAlpha = 1 - k; cx.strokeStyle = a.cor; cx.lineWidth = a.w * (1 - k * .6);
    cx.beginPath(); cx.arc(a.x, a.y, a.r * (.25 + k * .9), 0, TAU); cx.stroke();
  }
  cx.globalAlpha = 1;
  if (IMP_CFG.numeros) for (const n of I.nums) {
    const k = n.t / IMPACTO.numeros.tempo, y = n.y0 - 6 - IMPACTO.numeros.sobe * k * (2 - k);
    const pop = n.t < .08 ? 1 + (1 - n.t / .08) * .5 : 1;
    const size = (n.crit ? 19 : n.chefe ? 15 : 12) * pop;
    cx.globalAlpha = k < .7 ? 1 : (1 - k) / .3;
    cx.font = '800 ' + Math.round(size) + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    const s = Math.max(1, Math.round(n.v)) + (n.crit ? '!' : '');
    cx.lineWidth = 3.5; cx.strokeStyle = 'rgba(20,10,5,.85)'; cx.lineJoin = 'round'; cx.strokeText(s, n.x, y);
    cx.fillStyle = n.crit ? '#ffe14a' : n.fogo ? '#ff9a3a' : '#ffffff'; cx.fillText(s, n.x, y);
  }
  cx.globalAlpha = 1; cx.lineJoin = 'miter';
  if (I.nivel) {
    const t = I.nivel.t, D = IMPACTO.nivel, pop = t < .18 ? .4 + .6 * (t / .18) + .25 * Math.sin(Math.PI * t / .18) : 1;
    cx.globalAlpha = t > D - .35 ? (D - t) / .35 : 1;
    cx.save(); cx.translate(W / 2, H * .38); cx.scale(pop, pop); cx.rotate(-.04);
    cx.font = '900 46px system-ui,-apple-system,"Segoe UI",sans-serif'; cx.textAlign = 'center';
    cx.lineWidth = 8; cx.strokeStyle = '#123a18'; cx.lineJoin = 'round'; cx.strokeText('NÍVEL ' + I.nivel.n + '!', 0, 0);
    const g = cx.createLinearGradient(0, -40, 0, 6); g.addColorStop(0, '#eaffb0'); g.addColorStop(1, '#4fd65a');
    cx.fillStyle = g; cx.fillText('NÍVEL ' + I.nivel.n + '!', 0, 0);
    cx.restore(); cx.globalAlpha = 1; cx.lineJoin = 'miter';
  }
}
// na tela (sem tremor): borda vermelha com vida baixa e clarão
function impTela() {
  const I = impEstado();
  if (S.players && S.players.some(p => p.alive && !(p.ovoT > 0) && p.hp < p.maxHp * IMPACTO.vidaBaixa)) {
    const a = .22 + .14 * Math.sin(I.t * 6);
    cx.save(); cx.translate(W / 2, H / 2); cx.scale(W / H, 1);
    const g = cx.createRadialGradient(0, 0, H * .32, 0, 0, H * .62);
    g.addColorStop(0, 'rgba(255,30,30,0)'); g.addColorStop(1, 'rgba(255,30,30,' + a + ')');
    cx.fillStyle = g; cx.fillRect(-H / 2 - 2, -H / 2 - 2, H + 4, H + 4);
    cx.restore();
  }
  if (I.clarao > 0) { cx.globalAlpha = Math.min(1, I.clarao); cx.fillStyle = '#fffbe8'; cx.fillRect(0, 0, W, H); cx.globalAlpha = 1; }
}
