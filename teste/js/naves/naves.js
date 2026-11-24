// ---------- Naves: desenho padrão, bumerangue e míssil ----------
function drawShip(shipIdx, x, y, s, c1, c2, tilt, flash, skin) {
  if (skin && skin !== 'classic' && !flash && drawSkinShip(shipIdx, skin, x, y, s, tilt)) return;
  const id = SHIPS[shipIdx || 0].id;
  if (id === 'falcon') return drawPlane(x, y, s, c1, c2, false, tilt, flash);
  if (id === 'pirate') return drawPirataShip(x, y, s, c1, c2, tilt, flash); // js/visual/pirata.js
  if (id === 'phoenix') return drawFenixShip(x, y, s, c1, c2, tilt, flash, skin); // js/visual/fenix.js
  if (id === 'hypnos') return drawHypnosShip(x, y, s, c1, c2, tilt, flash, skin); // js/visual/hypnos.js
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  const body = flash ? '#fff' : c1, dk = flash ? '#fff' : c2;
  const fl = 5 + Math.sin(performance.now() / 40) * 2;
  if (id === 'boomer') {
    // chama do motor
    cx.fillStyle = '#ffb347'; cx.beginPath(); cx.moveTo(-4, 15); cx.lineTo(4, 15); cx.lineTo(0, 16 + fl * 1.6); cx.closePath(); cx.fill();
    // asa delta
    cx.fillStyle = body;
    cx.beginPath(); cx.moveTo(0, -24); cx.lineTo(23, 14); cx.lineTo(8, 10); cx.lineTo(0, 16); cx.lineTo(-8, 10); cx.lineTo(-23, 14); cx.closePath(); cx.fill();
    cx.fillStyle = dk;
    cx.beginPath(); cx.moveTo(0, -14); cx.lineTo(7, 9); cx.lineTo(0, 13); cx.lineTo(-7, 9); cx.closePath(); cx.fill();
    // lançador de disco nas pontas
    cx.fillStyle = flash ? '#fff' : '#7ff0c8';
    cx.beginPath(); cx.arc(-17, 10, 3.5, 0, 7); cx.arc(17, 10, 3.5, 0, 7); cx.fill();
    cx.fillStyle = flash ? '#fff' : '#bfe6ff'; cx.beginPath(); cx.ellipse(0, -6, 3, 6, 0, 0, 7); cx.fill();
  } else {
    // artilheiro: bimotor de cauda dupla com casulos de mísseis
    cx.fillStyle = '#ffb347';
    for (const sx of [-13, 13]) { cx.beginPath(); cx.moveTo(sx - 2.5, 19); cx.lineTo(sx + 2.5, 19); cx.lineTo(sx, 19 + fl); cx.closePath(); cx.fill(); }
    cx.fillStyle = body; cx.fillRect(-28, -3, 56, 10);
    cx.fillStyle = dk;
    cx.fillRect(-16, -12, 6, 31); cx.fillRect(10, -12, 6, 31); cx.fillRect(-16, 15, 32, 4);
    cx.beginPath(); cx.ellipse(0, 0, 6.5, 17, 0, 0, 7); cx.fill();
    // casulos de mísseis
    for (const sx of [-24, -20, 20, 24]) {
      cx.fillStyle = flash ? '#fff' : '#e8e8e8'; cx.fillRect(sx - 1.5, -9, 3, 9);
      cx.fillStyle = flash ? '#fff' : '#e74c3c'; cx.fillRect(sx - 1.5, -11, 3, 3);
    }
    cx.fillStyle = flash ? '#fff' : '#bfe6ff'; cx.beginPath(); cx.ellipse(0, -7, 3, 5, 0, 0, 7); cx.fill();
  }
  cx.restore();
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
