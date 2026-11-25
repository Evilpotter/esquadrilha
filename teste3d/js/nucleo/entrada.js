// ---------- Entrada ----------
function onKey(code) {
  if (code === 'KeyM') { somMudo(); return; }
  if (code === 'KeyF') {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    } catch (e) {}
    return;
  }
  if (S.mode === 'title') {
    if (code === 'Digit1' || code === 'Numpad1') openShipSelect(1);
    if (code === 'Digit2' || code === 'Numpad2') openShipSelect(2);
  } else if (S.mode === 'ship') {
    shipKey(code);
  } else if (S.mode === 'play') {
    if (code === 'Escape' || code === 'KeyP') openMenu();
    // habilidade ativa: J1 Espaço, J2 Enter (com 1 jogador, os dois) – js/naves/habilidades.js
    if (code === 'Space') usarHab(0);
    if (code === 'Enter' || code === 'NumpadEnter') usarHab(S.np === 2 ? 1 : 0);
  } else if (S.mode === 'paused') {
    menuKey(code);
  } else if (S.mode === 'levelup' || S.mode === 'reward') {
    selKey(code);
  } else if (S.mode === 'gameover') {
    if (code === 'Space' || code === 'Enter') S = { mode: 'title' };
  }
}
function gamePos(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
}
cv.addEventListener('pointerdown', e => {
  const g = gamePos(e);
  if (somBotaoToque(g)) return;
  if (S.mode === 'title') {
    if (g.y > 470 && g.y < 530 && Math.abs(g.x - W / 2) < 250) openShipSelect(g.x < W / 2 ? 1 : 2);
  } else if (S.mode === 'ship') {
    if (skinClick(g)) return;
    for (const c of shipLayout().cards) if (g.x > c.x && g.x < c.x + c.w && g.y > c.y && g.y < c.y + c.h) { S.ss.cur[c.pi] = c.j; shipChoose(c.pi, c.j); }
  } else if (S.mode === 'levelup' || S.mode === 'reward') {
    for (const c of selLayout().cards) if (g.x > c.x && g.x < c.x + c.w && g.y > c.y && g.y < c.y + c.h) choose(c.pi, c.j);
  } else if (S.mode === 'gameover') {
    S = { mode: 'title' };
  } else if (S.mode === 'play' && habBotaoToque(g)) {
    usarHab(0); // botão ★ da habilidade (celular)
  } else if (S.mode === 'play' && e.pointerType !== 'mouse') {
    S.toque = true;
    S.touch = { x: g.x, y: g.y, id: e.pointerId, px: S.players[0].x, py: S.players[0].y };
  } else if (S.mode === 'paused') {
    for (const it of menuLayout()) if (g.x > it.x && g.x < it.x + it.w && g.y > it.y && g.y < it.y + it.h) menuDo(it.id);
  }
});
cv.addEventListener('pointermove', e => {
  if (S.touch && e.pointerId === S.touch.id) { const g = gamePos(e); S.touch.cx = g.x; S.touch.cy = g.y; }
});
cv.addEventListener('pointerup', e => { if (S.touch && e.pointerId === S.touch.id) S.touch = null; });
cv.addEventListener('pointercancel', () => { if (S.touch) S.touch = null; });
