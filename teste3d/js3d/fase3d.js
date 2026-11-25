// ---------- Teste 3D: uma fase só, no Reino Encantado, com a Fênix ----------
// Carregado depois de todos os scripts do jogo (cópia de teste/js) e antes de js/nucleo/main.js.
// A lógica do jogo é a mesma (inimigos, tiros, chefão, sons, níveis). Aqui só muda:
//  - cenário sempre o Reino Encantado; nave sempre a Fênix (J1 e J2); sem hangar;
//  - os 6 inimigos do Reino aparecem já na fase 1 (bruxa e gárgula a partir de 30 s, dragão ancião a partir de 60 s);
//  - chefão: o primeiro (Fortaleza Voadora); depois da recompensa, tela de fim do teste;
//  - desenho: o mundo é 3D (js3d/mundo3d.js). Os efeitos 2D (chamas, anéis, faíscas, Baforada, meteoros…)
//    são pintados numa camada que vira a textura de um plano no mundo 3D. O HUD continua 2D por cima.
const NAVE_3D = 4; // Fênix (SHIPS)
const LIBERA_3D = { 1: 0, 2: 30, 3: 60 }; // segundos da fase em que entram os inimigos de "from" 1, 2 e 3

const fxCv = document.createElement('canvas'); // camada de efeitos (textura do plano no mundo 3D)
const fxCx = fxCv.getContext('2d');
const hudCx = cx;
const FX_RES = matchMedia('(pointer: coarse)').matches ? 1 : 1.5;

function startScene() { S.scene = 'reino'; S.banner = { t: 2.5, text: 'Fase 1 · ' + SCENES.reino.name }; }
function nextScene() { S.scene = 'reino'; }
function openShipSelect(n) { newGame(n, [NAVE_3D, NAVE_3D]); }
function closeSel() {
  const kind = S.sel.kind;
  S.sel = null; S.mode = 'play';
  if (kind === 'boss') { S.mode = 'fim3d'; S.fimT = 0; }
}
function spawnWave() {
  const pool = Object.keys(ETYPES).filter(k => ETYPES[k].scene === 'reino' && ETYPES[k].w > 0 && S.phaseT >= (LIBERA_3D[ETYPES[k].from] ?? 999));
  let tot = 0; for (const k of pool) tot += ETYPES[k].w;
  let r = Math.random() * tot, type = pool[0];
  for (const k of pool) { r -= ETYPES[k].w; if (r <= 0) { type = k; break; } }
  spawnSceneWave(type, rnd(80, W - 80));
}

// fim do teste: Espaço/Enter/toque volta para a tela inicial
addEventListener('keydown', e => { if (S.mode === 'fim3d' && S.fimT > .6 && (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter')) S = { mode: 'title' }; });
cv.addEventListener('pointerdown', () => { if (S.mode === 'fim3d' && S.fimT > .6) S = { mode: 'title' }; });
setInterval(() => { if (S.mode === 'fim3d') S.fimT += .1; }, 100);

// efeitos que continuam 2D (vão para o plano no mundo 3D). Mesmo conteúdo do drawGame, sem mapa, inimigos, chefões,
// naves, cristais, penas e tiros inimigos (esses são 3D).
function drawEfeitos3d() {
  drawHazards();
  drawLentos(); drawQueimas(); drawFenixChao(); drawHipnose();
  for (const p of S.players) if (p.alive) drawHabAntes(p);
  S.players.forEach(p => {
    if (!p.alive) return;
    if (p.inv > 0 && !(p.dashT > 0) && Math.floor(p.inv * 12) % 2) return;
    drawPapagaios(p); drawFilhotes(p); drawClones(p);
    if (p.ovoT > 0) { drawOvo(p); return; }
    drawHabDepois(p);
    if (p.sh > 0) {
      cx.strokeStyle = 'rgba(120,230,255,' + (.25 + .5 * p.sh / Math.max(1, p.maxSh)) + ')'; cx.lineWidth = 2;
      cx.beginPath(); cx.arc(p.x, p.y, 28, 0, 7); cx.stroke();
    }
  });
  for (const b of S.bullets) {
    if (b.type === 'feather') continue; // pena: 3D
    if (drawPirataBala(b) || drawFenixBala(b) || drawHypnosBala(b) || drawHabBala(b)) continue;
    cx.fillStyle = b.explo ? '#ffb347' : (b.color || '#fff');
    cx.beginPath(); cx.ellipse(b.x, b.y, (b.r || 4) * .8, (b.r || 4) * 1.8, Math.atan2(b.vx || 0, -(b.vy || -1)), 0, 7); cx.fill();
  }
  for (const f of S.fx) {
    const k = f.t / f.life;
    cx.globalAlpha = 1 - k;
    if (f.type === 'boom') { cx.fillStyle = f.color; cx.beginPath(); cx.arc(f.x, f.y, f.r * (.4 + k * .8), 0, 7); cx.fill(); cx.fillStyle = '#fff6c0'; cx.beginPath(); cx.arc(f.x, f.y, f.r * .3 * (1 - k), 0, 7); cx.fill(); }
    else if (f.type === 'trail') drawTrail(f, k);
    else if (f.type === 'smoke') { cx.fillStyle = 'rgba(210,210,210,.55)'; cx.beginPath(); cx.arc(f.x, f.y, f.r * (1 + k * 2.2), 0, 7); cx.fill(); }
    else if (f.type === 'ring') { cx.strokeStyle = f.color; cx.lineWidth = 3; cx.beginPath(); cx.arc(f.x, f.y, f.r * (.3 + k * .7), 0, 7); cx.stroke(); }
    else if (f.type !== 'bolt') { cx.fillStyle = f.color; cx.beginPath(); cx.arc(f.x, f.y, 2.6, 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
  }
  drawHabFx();
}

function drawTitulo3d() {
  cx.fillStyle = 'rgba(5,12,22,.62)'; cx.fillRect(0, 130, W, 120);
  txt('Esquadrilha 3D', W / 2, 198, 52, '#fff', 'center', 800);
  txt('teste · Reino Encantado com a Fênix', W / 2, 232, 18, '#ffd36b', 'center', 600);
  for (const [i, label] of [[0, '1 jogador'], [1, '2 jogadores']]) {
    const w = Math.min(W / 2 - 40, 230), x = i ? W / 2 + 10 : W / 2 - 10 - w;
    cx.fillStyle = i ? PCOL[1].dark : PCOL[0].dark; roundRect(x, 470, w, 60, 12); cx.fill();
    txt(label, x + w / 2, 507, 20, '#fff', 'center', 700);
    txt('tecla ' + (i + 1) + (padQtd ? (i ? ' ou Y' : ' ou A') : ''), x + w / 2, 550, 12, '#cfe3f5', 'center', 500);
  }
  cx.fillStyle = 'rgba(5,12,22,.7)'; cx.fillRect(W / 2 - Math.min(W / 2 - 20, 260), 590, Math.min(W - 40, 520), 176);
  const lines = [
    'Uma fase só: inimigos do Reino Encantado e o chefão Fortaleza Voadora.',
    'Jogador 1: W A S D + Espaço    Jogador 2: setas + Enter',
    'Espaço/Enter/A: Baforada de fogo ★ · Celular: arraste e toque ★',
    'P ou Esc: pausa    F: tela cheia    M: som',
    'O jogo de verdade continua em 2D – isto é só um teste.',
  ];
  lines.forEach((l, k) => txt(l, W / 2, 622 + k * 30, 14, k === 0 ? '#ffd36b' : '#e8eef5', 'center', 500));
  const vt = 'teste 3D · base ' + versaoTexto(); cx.font = '500 12px system-ui, sans-serif'; const vl = cx.measureText(vt).width + 16;
  cx.fillStyle = 'rgba(5,12,22,.6)'; roundRect(W - vl - 8, H - 31, vl, 22, 8); cx.fill();
  txt(vt, W - 16, H - 15, 12, 'rgba(232,238,245,.85)', 'right', 500);
}
function drawFim3d() {
  cx.fillStyle = 'rgba(5,12,22,.6)'; cx.fillRect(0, 0, W, H);
  txt('Fase concluída!', W / 2, H / 2 - 50, 46, '#ffd36b', 'center', 800);
  txt('Nível ' + S.level + ' · ' + S.kills + ' abates', W / 2, H / 2 - 8, 18, '#fff', 'center', 600);
  S.players.forEach((p, i) => txt(PCOL[i].name + ' (Fênix): ' + p.kills + ' abates', W / 2, H / 2 + 26 + i * 24, 14, PCOL[i].body, 'center', 600));
  txt('Fim do teste 3D · Espaço, Enter ou toque para voltar', W / 2, H / 2 + 100, 14, '#cfe3f5', 'center', 500);
}

function draw() {
  // 1) efeitos 2D na camada que vira textura do plano 3D
  const fw = Math.round(W * FX_RES), fh = Math.round(H * FX_RES);
  if (fxCv.width !== fw || fxCv.height !== fh) { fxCv.width = fw; fxCv.height = fh; }
  cx = fxCx; cx.setTransform(FX_RES, 0, 0, FX_RES, 0, 0); cx.clearRect(0, 0, W, H);
  if (S.players && S.mode !== 'title') drawEfeitos3d();
  // 2) HUD e telas em 2D por cima
  cx = hudCx; cx.clearRect(0, 0, W, H);
  if (S.mode === 'title') drawTitulo3d();
  else if (S.players) {
    drawHud();
    if (S.mode === 'levelup' || S.mode === 'reward') drawSel();
    if (S.mode === 'paused') drawMenu();
    if (S.mode === 'fim3d') drawFim3d();
    if (S.mode === 'gameover') {
      cx.fillStyle = 'rgba(5,12,22,.75)'; cx.fillRect(0, 0, W, H);
      txt('Fim de jogo', W / 2, H / 2 - 40, 44, '#fff', 'center', 800);
      txt('Fase ' + S.phase + ' · Nível ' + S.level + ' · ' + S.kills + ' abates', W / 2, H / 2, 17, '#ffd36b', 'center', 600);
      txt('Espaço, Enter ou toque para voltar', W / 2, H / 2 + 110, 14, '#cfe3f5', 'center', 500);
    }
  }
  drawSomBotao();
  // 3) mundo 3D
  if (window.MUNDO3D) window.MUNDO3D.render(fxCv);
}
