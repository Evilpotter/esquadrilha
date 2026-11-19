// ---------- Menu de pausa ----------
function menuItems() {
  const it = [{ id: 'cont', label: 'Continuar' }];
  if (S.np === 1) it.push({ id: 'add', label: 'Adicionar Jogador 2' });
  it.push({ id: 'quit', label: 'Sair para o início' });
  return it;
}
function menuLayout() {
  const items = menuItems(), w = Math.min(360, W - 60), h = 56, gap = 14;
  const y0 = H / 2 - (items.length * (h + gap) - gap) / 2 + 20;
  return items.map((it, i) => Object.assign({}, it, { x: (W - w) / 2, y: y0 + i * (h + gap), w, h }));
}
function openMenu() { S.mode = 'paused'; S.menuSel = 0; }
function menuDo(id) {
  if (id === 'cont') S.mode = 'play';
  else if (id === 'add') openShipAdd();
  else if (id === 'quit') S = { mode: 'title' };
}
function addPlayer2(ship, skin) {
  const p = newPlayer(1, 2, ship || 0, skin);
  p.x = clamp(S.players[0].x + 120, 40, W - 40); p.inv = 2.5;
  S.players.push(p); S.np = 2; S.mode = 'play';
  S.banner = { t: 2.5, text: 'Jogador 2 entrou: ' + SHIPS[p.ship].name + '!' };
}
function menuKey(code) {
  const items = menuItems();
  S.menuSel = clamp(S.menuSel || 0, 0, items.length - 1);
  if (code === 'Escape' || code === 'KeyP') S.mode = 'play';
  else if (code === 'ArrowUp' || code === 'KeyW') S.menuSel = (S.menuSel + items.length - 1) % items.length;
  else if (code === 'ArrowDown' || code === 'KeyS') S.menuSel = (S.menuSel + 1) % items.length;
  else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') menuDo(items[S.menuSel].id);
}
function drawMenu() {
  cx.fillStyle = 'rgba(5,12,22,.78)'; cx.fillRect(0, 0, W, H);
  const L = menuLayout();
  txt('Pausa', W / 2, L[0].y - 40, 40, '#fff', 'center', 800);
  L.forEach((it, i) => {
    const sel = i === S.menuSel;
    cx.fillStyle = sel ? '#1d4f86' : '#14263a'; roundRect(it.x, it.y, it.w, it.h, 12); cx.fill();
    cx.strokeStyle = sel ? '#7fc0ff' : '#3a5672'; cx.lineWidth = sel ? 2.5 : 1; roundRect(it.x, it.y, it.w, it.h, 12); cx.stroke();
    txt(it.label, W / 2, it.y + 36, 19, '#fff', 'center', 700);
  });
  const last = L[L.length - 1];
  txt('↑/↓ ou W/S para escolher · Enter ou Espaço para confirmar · Esc volta ao jogo', W / 2, last.y + last.h + 34, 13, '#9fb3c8', 'center', 500);
  if (S.np === 1) txt('O Jogador 2 entra com as setas e começa do zero.', W / 2, last.y + last.h + 56, 13, '#9fb3c8', 'center', 500);
}
