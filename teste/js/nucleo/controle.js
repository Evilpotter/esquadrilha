// ---------- Controle (gamepad: Xbox, PlayStation e similares) ----------
// Cada controle vira de um jogador quando aperta um botão pela primeira vez (esse aperto só conecta):
// o primeiro que apertar é o Jogador 1, o segundo é o Jogador 2. Com 1 jogador, os dois movem a nave.
// Analógico esquerdo ou direcional: move a nave e navega nos menus.
// A/✕ confirma · B/○ volta · Start pausa · Select liga/desliga o som · na tela inicial: A = 1 jogador, Y/△ = 2 jogadores.
// Nos menus, cada controle "aperta" as mesmas teclas do jogador dele (W A S D/Espaço ou setas/Enter).
// Por que não usar a ordem da lista do navegador: o Windows/Steam às vezes mostra o mesmo controle duas
// vezes (controle virtual) ou um aparelho que não é controle; aí o "segundo da lista" não era o controle 2.
const PAD_ZONA = .2;   // zona morta do analógico
const PAD_MENU = .55;  // inclinação do analógico que conta como um toque nos menus
const PAD_TECLAS = [
  { ok: 'Space', cima: 'KeyW', baixo: 'KeyS', esq: 'KeyA', dir: 'KeyD' },
  { ok: 'Enter', cima: 'ArrowUp', baixo: 'ArrowDown', esq: 'ArrowLeft', dir: 'ArrowRight' },
];
const padMov = [{ x: 0, y: 0, on: false }, { x: 0, y: 0, on: false }];
let padQtd = 0;           // aparelhos que o navegador mostra
let padDono = [null, null]; // índice do aparelho de cada jogador (null = livre)
let padNomes = ['', ''];
let padAntes = {};

function padEixo(v) { return Math.abs(v) < PAD_ZONA ? 0 : (v - Math.sign(v) * PAD_ZONA) / (1 - PAD_ZONA); }

// direcional "chapéu" dos controles genéricos (mapeamento não padrão): um eixo só com 8 posições
function padChapeu(g) {
  if (g.mapping === 'standard') return null;
  for (let i = g.axes.length - 1; i >= 4; i--) {
    const v = g.axes[i];
    if (v < -1.05 || v > 1.05) continue; // solto (costuma ficar em 1,28 ou mais)
    const p = Math.round((v + 1) / (2 / 7)); // 0..7: cima, cima-dir, dir, baixo-dir, baixo, baixo-esq, esq, cima-esq
    if (Math.abs((v + 1) - p * (2 / 7)) > .05) continue;
    const a = p * Math.PI / 4;
    return { x: Math.round(Math.sin(a)), y: -Math.round(Math.cos(a)) };
  }
  return null;
}

function padNome(g) {
  const id = (g.id || '').toLowerCase();
  if (/xbox|xinput|045e/.test(id)) return 'Xbox';
  if (/dualsense|dualshock|playstation|wireless controller|054c/.test(id)) return 'PlayStation';
  if (/switch|nintendo|057e/.test(id)) return 'Nintendo';
  return 'controle';
}

function lerControles() {
  let lista = [];
  try { if (navigator.getGamepads) lista = Array.from(navigator.getGamepads()).filter(g => g && g.connected); } catch (e) {}
  padQtd = lista.length;
  // controle desligado libera a vaga
  for (let n = 0; n < 2; n++) if (padDono[n] !== null && !lista.some(g => g.index === padDono[n])) { padDono[n] = null; padNomes[n] = ''; }
  for (const m of padMov) { m.x = 0; m.y = 0; m.on = false; }

  const agora = {}, lidos = [];
  for (const g of lista) {
    const bt = i => !!(g.buttons[i] && g.buttons[i].pressed);
    const ax = padEixo(g.axes[0] || 0), ay = padEixo(g.axes[1] || 0);
    const ch = padChapeu(g) || { x: 0, y: 0 };
    const dx = (bt(15) ? 1 : 0) - (bt(14) ? 1 : 0) + ch.x, dy = (bt(13) ? 1 : 0) - (bt(12) ? 1 : 0) + ch.y;
    const b = {
      ok: bt(0), volta: bt(1), y2: bt(3), start: bt(9), select: bt(8),
      cima: dy < 0 || ay < -PAD_MENU, baixo: dy > 0 || ay > PAD_MENU,
      esq: dx < 0 || ax < -PAD_MENU, dir: dx > 0 || ax > PAD_MENU,
    };
    const antes = padAntes[g.index] || {};
    // apertou algum botão agora (não conta analógico: aparelho que não é controle pode ter eixo "preso")
    const novo = g.buttons.some((x, i) => x && x.pressed && !(antes.bts && antes.bts[i]));
    b.bts = g.buttons.map(x => !!(x && x.pressed));
    agora[g.index] = b;
    lidos.push({ g, b, antes, novo, ax, ay, dx, dy });
  }

  // aparelho sem dono só pega vaga se apertou um botão num quadro em que nenhum controle já dono apertou
  // (o "controle virtual" repete o real no mesmo quadro, então nunca vira o Jogador 2)
  const donoApertou = lidos.some(l => l.novo && padDono.includes(l.g.index));
  if (!donoApertou) {
    const cand = lidos.filter(l => l.novo && !padDono.includes(l.g.index))
      .sort((a, b) => (b.g.mapping === 'standard') - (a.g.mapping === 'standard') || a.g.index - b.g.index);
    if (cand.length) {
      const n = padDono.indexOf(null);
      if (n >= 0) {
        padDono[n] = cand[0].g.index; padNomes[n] = padNome(cand[0].g);
        cand[0].antes = cand[0].b; // o aperto que deu a vaga só conecta o controle
        if (S.mode === 'play') S.banner = { t: 2, text: 'Controle do Jogador ' + (n + 1) + ' conectado' };
      }
    }
  }

  for (const l of lidos) {
    const n = padDono.indexOf(l.g.index);
    if (n < 0) continue;
    let x = l.ax + l.dx, y = l.ay + l.dy;
    const len = Math.hypot(x, y); if (len > 1) { x /= len; y /= len; }
    // movimento: com 1 jogador os dois controles somam no Jogador 1
    const m = padMov[S.np === 2 ? n : 0];
    if (x || y) { m.x = clamp(m.x + x, -1, 1); m.y = clamp(m.y + y, -1, 1); m.on = true; }
    for (const k in l.b) if (k !== 'bts' && l.b[k] && !l.antes[k]) padAperta(n, k);
  }
  padAntes = agora;
}

// linha da tela inicial: quantos aparelhos o navegador vê e de quem é cada controle
function padStatus() {
  if (!padQtd) return '';
  const j = n => padDono[n] !== null ? 'J' + (n + 1) + ': ' + padNomes[n] + ' ✓' : 'J' + (n + 1) + ': aperte A';
  return 'Controles encontrados: ' + padQtd + '  ·  ' + j(0) + '  ·  ' + j(1);
}

function padAperta(n, k) {
  const t = PAD_TECLAS[n], modo = S.mode;
  if (k === 'select') { onKey('KeyM'); return; }
  if (modo === 'title') {
    if (k === 'ok' || k === 'start') onKey(n === 0 ? 'Digit1' : 'Digit2');
    else if (k === 'y2') onKey('Digit2');
    return;
  }
  if (k === 'start') { onKey(modo === 'play' || modo === 'paused' ? 'Escape' : t.ok); return; }
  if (k === 'volta') { if (modo !== 'play') onKey('Escape'); return; }
  if (modo === 'play') return;
  if (t[k]) onKey(t[k]);
}
