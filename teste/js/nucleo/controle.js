// ---------- Controle (gamepad: Xbox, PlayStation e similares) ----------
// Controle 1 = Jogador 1, controle 2 = Jogador 2. Com 1 jogador, qualquer controle move a nave.
// Analógico esquerdo ou direcional: move a nave e navega nos menus.
// A/✕ confirma · B/○ volta · Start pausa · Select liga/desliga o som · na tela inicial: A = 1 jogador, Y/△ = 2 jogadores.
// Nos menus, cada controle "aperta" as mesmas teclas do jogador dele (W A S D/Espaço ou setas/Enter).
const PAD_ZONA = .2;   // zona morta do analógico
const PAD_MENU = .55;  // inclinação do analógico que conta como um toque nos menus
const PAD_TECLAS = [
  { ok: 'Space', cima: 'KeyW', baixo: 'KeyS', esq: 'KeyA', dir: 'KeyD' },
  { ok: 'Enter', cima: 'ArrowUp', baixo: 'ArrowDown', esq: 'ArrowLeft', dir: 'ArrowRight' },
];
const padMov = [{ x: 0, y: 0, on: false }, { x: 0, y: 0, on: false }];
let padQtd = 0;
let padAntes = {};

function padEixo(v) { return Math.abs(v) < PAD_ZONA ? 0 : (v - Math.sign(v) * PAD_ZONA) / (1 - PAD_ZONA); }

function lerControles() {
  let lista = [];
  try { if (navigator.getGamepads) lista = Array.from(navigator.getGamepads()).filter(g => g && g.connected); } catch (e) {}
  padQtd = lista.length;
  for (const m of padMov) { m.x = 0; m.y = 0; m.on = false; }
  const agora = {};
  lista.slice(0, 2).forEach((g, n) => {
    const bt = i => !!(g.buttons[i] && g.buttons[i].pressed);
    const ax = padEixo(g.axes[0] || 0), ay = padEixo(g.axes[1] || 0);
    let x = ax + (bt(15) ? 1 : 0) - (bt(14) ? 1 : 0), y = ay + (bt(13) ? 1 : 0) - (bt(12) ? 1 : 0);
    const len = Math.hypot(x, y); if (len > 1) { x /= len; y /= len; }
    // movimento: com 1 jogador os dois controles somam no Jogador 1
    const m = padMov[S.np === 2 ? n : 0];
    if (x || y) { m.x = clamp(m.x + x, -1, 1); m.y = clamp(m.y + y, -1, 1); m.on = true; }
    // botões "virtuais" para os menus
    const b = {
      ok: bt(0), volta: bt(1), y2: bt(3), start: bt(9), select: bt(8),
      cima: bt(12) || ay < -PAD_MENU, baixo: bt(13) || ay > PAD_MENU,
      esq: bt(14) || ax < -PAD_MENU, dir: bt(15) || ax > PAD_MENU,
    };
    const antes = padAntes[g.index] || {};
    agora[g.index] = b;
    for (const k in b) if (b[k] && !antes[k]) padAperta(n, k);
  });
  padAntes = agora;
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
