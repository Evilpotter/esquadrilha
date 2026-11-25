// ---------- Naves: escolhe o desenho de cada nave; bumerangue e míssil ----------
function drawShip(shipIdx, x, y, s, c1, c2, tilt, flash, skin) {
  const id = SHIPS[shipIdx || 0].id;
  if (id === 'falcon') return drawFalcaoShip(x, y, s, c1, c2, tilt, flash, skin);         // js/visual/naves-base.js
  if (id === 'boomer') return drawBumerangueShip(x, y, s, c1, c2, tilt, flash, skin);     // js/visual/naves-base.js
  if (id === 'artillery') return drawArtilheiroShip(x, y, s, c1, c2, tilt, flash, skin);  // js/visual/naves-base.js
  if (id === 'pirate') return drawPirataShip(x, y, s, c1, c2, tilt, flash, skin);         // js/visual/pirata.js
  if (id === 'phoenix') return drawFenixShip(x, y, s, c1, c2, tilt, flash, skin);         // js/visual/fenix.js
  if (id === 'hypnos') return drawHypnosShip(x, y, s, c1, c2, tilt, flash, skin);         // js/visual/hypnos.js
}

function drawBoomerang(x, y, rot, color, explo) {
  cx.save(); cx.translate(x, y); cx.rotate(rot);
  cx.fillStyle = 'rgba(127,240,200,.18)'; cx.beginPath(); cx.arc(0, 0, 14, 0, 7); cx.fill();
  cx.strokeStyle = explo ? '#ffb347' : color; cx.lineWidth = 5; cx.lineCap = 'round'; cx.lineJoin = 'round';
  cx.beginPath(); cx.moveTo(-11, 6); cx.quadraticCurveTo(-3, -1, 0, -8); cx.quadraticCurveTo(3, -1, 11, 6); cx.stroke();
  cx.lineCap = 'butt'; cx.lineJoin = 'miter';
  cx.restore();
}
function drawBallistic(x, y, ang, color) {
  cx.save(); cx.translate(x, y); cx.rotate(ang + Math.PI / 2);
  cx.fillStyle = '#ffcf60'; cx.beginPath(); cx.moveTo(-2, 6); cx.lineTo(2, 6); cx.lineTo(0, 11 + Math.random() * 4); cx.closePath(); cx.fill();
  cx.fillStyle = '#e8e8e8'; cx.fillRect(-1.8, -5, 3.6, 11);
  cx.fillStyle = '#e74c3c'; cx.beginPath(); cx.moveTo(-1.8, -5); cx.lineTo(1.8, -5); cx.lineTo(0, -9); cx.closePath(); cx.fill();
  cx.fillStyle = '#9aa'; cx.fillRect(-3.2, 3, 6.4, 2);
  cx.restore();
}
