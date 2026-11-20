// ---------- Som (Web Audio) ----------
// Efeitos: som(nome, x, tom) · Música: escolhida sozinha a cada quadro em somQuadro(), olhando o estado do jogo.
// O navegador só libera o áudio depois do primeiro toque, clique ou tecla (regra dos navegadores).
// Não usa Math.random (o sorteio do jogo fica igual com ou sem som; os testes dependem disso).
const SOM_PREF = 'esquadrilha.som.v1';
const somCfg = Object.assign({}, SOM_PADRAO);
try { Object.assign(somCfg, JSON.parse(localStorage.getItem(SOM_PREF) || '{}')); } catch (e) {}
let somCtx = null, somBus = null;
const somBuf = {}, somCarregando = {}, somVozes = {}, somUlt = {};
let somSem = 1;
function somRnd() { somSem = somSem * 16807 % 2147483647; return somSem / 2147483647; }
function somSalvar() { try { localStorage.setItem(SOM_PREF, JSON.stringify(somCfg)); } catch (e) {} }

// ---------- liga o áudio no primeiro gesto ----------
function somLigar() {
  if (somCtx) { if (somCtx.state === 'suspended' && !document.hidden) somCtx.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { somCtx = new AC(); } catch (e) { somCtx = null; return; }
  const c = somCtx;
  const lim = c.createDynamicsCompressor(); // segura os picos quando muita coisa explode junto
  lim.threshold.value = -10; lim.knee.value = 6; lim.ratio.value = 12; lim.attack.value = .003; lim.release.value = .2;
  const mestre = c.createGain(), efeitos = c.createGain(), musica = c.createGain(), filtro = c.createBiquadFilter();
  filtro.type = 'lowpass'; filtro.frequency.value = 20000; filtro.Q.value = .5;
  efeitos.connect(mestre); musica.connect(filtro); filtro.connect(mestre); mestre.connect(lim); lim.connect(c.destination);
  somBus = { mestre, efeitos, musica, filtro };
  somVolumes(true);
  // efeitos primeiro, depois as músicas
  Promise.all(Object.keys(SONS).map(k => somCarregar('efeitos/' + k))).then(() => {
    for (const k of Object.keys(MUSICAS)) somCarregar('musica/' + k);
  });
}
for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, somLigar, true);
document.addEventListener('visibilitychange', () => {
  if (!somCtx) return;
  if (document.hidden) somCtx.suspend().catch(() => {}); else somCtx.resume().catch(() => {});
});

function somCarregar(cam) {
  if (somBuf[cam] || somCarregando[cam]) return somCarregando[cam];
  const emb = window.SOM_EMBUTIDO && window.SOM_EMBUTIDO['som/' + cam + '.ogg'];
  const dados = emb
    ? Promise.resolve(Uint8Array.from(atob(emb), ch => ch.charCodeAt(0)).buffer)
    : fetch('som/' + cam + '.ogg').then(r => { if (!r.ok) throw new Error(cam); return r.arrayBuffer(); });
  return somCarregando[cam] = dados
    .then(b => new Promise((ok, erro) => somCtx.decodeAudioData(b, ok, erro)))
    .then(buf => { somBuf[cam] = buf; })
    .catch(() => {}); // sem o arquivo: fica em silêncio, o jogo segue
}

function somVolumes(ja) {
  if (!somBus) return;
  const t = somCtx.currentTime, mudo = somCfg.mudo ? 0 : 1;
  const alvo = (p, v) => { if (ja) p.value = v; else p.setTargetAtTime(v, t, .05); };
  alvo(somBus.mestre.gain, mudo);
  alvo(somBus.efeitos.gain, somCfg.efeitos);
  alvo(somBus.musica.gain, somCfg.musica);
}
function somMudo() { somLigar(); somCfg.mudo = !somCfg.mudo; somSalvar(); somVolumes(); }
function somAjusta(qual, passo) {
  somCfg[qual] = Math.round(clamp(somCfg[qual] + passo, 0, 1) * 10) / 10;
  if (somCfg[qual] > 0) somCfg.mudo = false;
  somSalvar(); somVolumes();
  if (qual === 'efeitos') som('menu_mover');
}

// ---------- efeitos ----------
// x: posição na tela (som vai mais para o lado esquerdo/direito) · tom: semitons · ganho: multiplica o volume
function som(nome, x, tom, ganho) {
  if (!somCtx || somCtx.state !== 'running' || somCfg.mudo) return;
  const d = SONS[nome], buf = somBuf['efeitos/' + nome];
  if (!d || !buf) return;
  const agora = somCtx.currentTime;
  if (d.int && agora - (somUlt[nome] || -9) < d.int) return;
  somUlt[nome] = agora;
  const lista = somVozes[nome] || (somVozes[nome] = []);
  while (lista.length >= (d.max || 4)) somParar(lista.shift());
  let total = 0; for (const k in somVozes) total += somVozes[k].length;
  if (total >= SOM_VOZES) return;
  const src = somCtx.createBufferSource(), g = somCtx.createGain();
  src.buffer = buf;
  const st = (tom || 0) + (d.var ? (somRnd() * 2 - 1) * d.var : 0);
  src.playbackRate.value = Math.pow(2, st / 12);
  g.gain.value = d.vol * (ganho || 1);
  let saida = g;
  if (x !== undefined && somCtx.createStereoPanner) {
    const p = somCtx.createStereoPanner();
    p.pan.value = clamp((x / W) * 2 - 1, -1, 1) * .55;
    g.connect(p); saida = p;
  }
  src.connect(g); saida.connect(somBus.efeitos);
  const v = { src, g };
  lista.push(v);
  src.onended = () => { const i = lista.indexOf(v); if (i >= 0) lista.splice(i, 1); };
  src.start();
}
function somParar(v) {
  try { const t = somCtx.currentTime; v.g.gain.setTargetAtTime(0, t, .015); v.src.stop(t + .08); } catch (e) {}
}

// cristais de XP: pegando vários em seguida, o som vai subindo na escala
const SOM_XP_ESCALA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
let somXpN = 0, somXpT = -9;
function somXp(x) {
  if (!somCtx) return;
  const agora = somCtx.currentTime;
  somXpN = agora - somXpT < .6 ? somXpN + 1 : 0; somXpT = agora;
  som('xp', x, SOM_XP_ESCALA[Math.min(somXpN, SOM_XP_ESCALA.length - 1)]);
}
function somTiro(tipo, x) { const n = SOM_ARMA[tipo]; if (n) som(n, x); }
function somTiroInimigo(k, x) { const s = SOM_TIRO_INIMIGO[k]; if (s) som(s[0], x, s[1], s[2]); }
function somExplosao(x, r) { som(r < 26 ? 'explosao_pequena' : r < 60 ? 'explosao_media' : 'explosao_grande', x); }

// ---------- música ----------
let somMus = null; // { nome, src, g }
function somTocarMusica(nome) {
  if (!somCtx) return;
  if (somMus && somMus.nome === nome) return;
  const t = somCtx.currentTime;
  if (somMus) { const m = somMus; m.g.gain.cancelScheduledValues(t); m.g.gain.setTargetAtTime(0, t, SOM_TROCA / 4); try { m.src.stop(t + SOM_TROCA * 1.5); } catch (e) {} }
  somMus = null;
  if (!nome) return;
  const buf = somBuf['musica/' + nome];
  if (!buf) return; // ainda carregando: tenta de novo no próximo quadro
  const d = MUSICAS[nome], src = somCtx.createBufferSource(), g = somCtx.createGain();
  src.buffer = buf; src.loop = d.laco;
  g.gain.value = 0; g.gain.setTargetAtTime(d.vol, t, d.laco ? SOM_TROCA / 4 : .01);
  src.connect(g); g.connect(somBus.musica); src.start();
  somMus = { nome, src, g, laco: d.laco };
  src.onended = () => { if (somMus && somMus.src === src) somMus = { nome, src, g, laco: false, fim: true }; };
}

// ---------- a cada quadro: música e sons que nascem de mudanças no estado do jogo ----------
let somAntes = {};
const somVistos = new WeakSet(), somFuria = new WeakSet(), somRaioDisparou = new WeakSet();
function somQuadro() {
  if (!somCtx || !somBus) return;
  const A = somAntes, m = S.mode, jogo = !!S.players;
  // --- mudanças de tela ---
  if (m !== A.mode) {
    if (A.mode === 'title' && m === 'ship') som('menu_ok');
    else if ((A.mode === 'ship' || A.mode === 'paused' || A.mode === 'gameover') && m === 'title') som(A.mode === 'gameover' ? 'menu_ok' : 'menu_voltar');
    else if (m === 'paused') som('pausa');
    else if (A.mode === 'paused' && m === 'play') som('despausa');
    else if (m === 'levelup') som('nivel');
  }
  // cursores dos menus
  const cur = m === 'ship' && S.ss ? [S.ss.cur.join(), S.ss.skin.join(), S.ss.done.join()]
    : (m === 'levelup' || m === 'reward') && S.sel ? [S.sel.cur.join(), '', S.sel.done.join()]
    : m === 'paused' ? [String(S.menuSel), '', ''] : null;
  if (cur && A.cur && m === A.mode) {
    if (cur[2] !== A.cur[2]) som(m === 'ship' ? 'menu_ok' : 'escolha');
    else if (cur[0] !== A.cur[0] || cur[1] !== A.cur[1]) som('menu_mover');
  }
  // --- jogo ---
  if (jogo) {
    if (S.banner && S.banner !== A.banner) {
      const tx = S.banner.text;
      if (tx.startsWith('Fase')) som('nova_fase');
      else if (tx.startsWith('Chefão')) som('chefao_alerta');
      else if (tx.startsWith('Jogador 2')) som('entrada');
    }
    if (S.skinMsg && S.skinMsg !== A.skinMsg) som('conquista');
    const vivos = S.bosses.filter(b => !b.dead);
    if (vivos.length && !A.chefes) som('chefao_chegada');
    for (const b of vivos) if (!somFuria.has(b) && rage(b)) { somFuria.add(b); som('chefao_furia', b.x); }
    for (const h of S.hazards) {
      if (!somVistos.has(h)) { somVistos.add(h); if (h.y0 > 0) som('raio_carga', h.x); }
      if (h.warn <= 0 && !somRaioDisparou.has(h)) { somRaioDisparou.add(h); som(h.y0 > 0 ? 'raio_disparo' : 'trovao', h.x); }
    }
    if (S.rewardT > 0 && !(A.rewardT > 0)) som('explosao_chefao');
    A.chefes = vivos.length; A.rewardT = S.rewardT;
  } else A.chefes = 0;
  // --- música ---
  let mus = null;
  if (m === 'title' || (m === 'ship' && !S.ss.add)) mus = 'menu';
  else if (jogo) {
    if (m === 'gameover' || S.overT > 0) mus = 'derrota';
    else if (S.rewardT > 0 || m === 'reward') mus = 'vitoria';
    else if (S.bosses.some(b => !b.dead)) mus = 'chefao';
    else if (S.bossSpawned) mus = null; // corneta do chefão chegando
    else mus = 'fase';
  }
  if (mus === 'vitoria' || mus === 'derrota') { if (!(somMus && somMus.nome === mus)) { if (A.jingle !== mus) somTocarMusica(mus); } }
  else somTocarMusica(mus);
  A.jingle = (mus === 'vitoria' || mus === 'derrota') ? mus : null;
  // pausa: música abafada e mais baixa; escolhas de melhoria: um pouco mais baixa
  const t = somCtx.currentTime;
  somBus.filtro.frequency.setTargetAtTime(m === 'paused' ? 700 : 20000, t, .08);
  if (somMus && somMus.laco) somMus.g.gain.setTargetAtTime(MUSICAS[somMus.nome].vol * (m === 'paused' ? .6 : m === 'levelup' || m === 'reward' ? .7 : 1), t, .15);
  A.mode = m; A.cur = cur; A.banner = S.banner; A.skinMsg = S.skinMsg;
}

// ---------- botão de som (canto superior direito: tela inicial, pausa e fim de jogo) ----------
function somBotao() { return { x: W - 58, y: S.mode === 'title' ? 14 : 64, w: 44, h: 44 }; }
function somBotaoVisivel() { return S.mode === 'title' || S.mode === 'paused' || S.mode === 'gameover'; }
function drawSomBotao() {
  if (!somBotaoVisivel()) return;
  const b = somBotao(), x = b.x + b.w / 2, y = b.y + b.h / 2;
  cx.save();
  cx.fillStyle = 'rgba(5,12,22,.6)'; roundRect(b.x, b.y, b.w, b.h, 10); cx.fill();
  cx.fillStyle = '#e8eef5'; cx.strokeStyle = '#e8eef5'; cx.lineWidth = 2.4; cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(x - 11, y - 5); cx.lineTo(x - 5, y - 5); cx.lineTo(x + 2, y - 11); cx.lineTo(x + 2, y + 11); cx.lineTo(x - 5, y + 5); cx.lineTo(x - 11, y + 5); cx.closePath(); cx.fill();
  if (somCfg.mudo) { cx.beginPath(); cx.moveTo(x + 6, y - 6); cx.lineTo(x + 14, y + 6); cx.moveTo(x + 14, y - 6); cx.lineTo(x + 6, y + 6); cx.stroke(); }
  else { cx.beginPath(); cx.arc(x + 3, y, 6, -.8, .8); cx.stroke(); cx.beginPath(); cx.arc(x + 3, y, 11, -.8, .8); cx.stroke(); }
  cx.restore();
}
function somBotaoToque(g) {
  if (!somBotaoVisivel()) return false;
  const b = somBotao();
  if (g.x > b.x && g.x < b.x + b.w && g.y > b.y && g.y < b.y + b.h) { somMudo(); return true; }
  return false;
}
