// ---------- Fênix: desenho (pássaro de fogo, penas, chamas, meteoros, sol, filhotes, ovo) ----------
// Tudo desenhado no canvas: as asas batem e as chamas tremulam. Cada skin muda as cores e os enfeites
// (paleta das skins em js/dados/skins.js + cor do fogo em FENIX_FOGO).
const FENIX_TITULO = ['#e8501f', '#8a1f10']; // tela inicial: pássaro vermelho-fogo
// cor do fogo de cada skin: [chama, miolo claro]
const FENIX_FOGO = {
  classic: ['#ff8a2a', '#ffe066'], sucata: ['#ff9a3c', '#ffe6a0'], bosque: ['#8ee05a', '#efffc0'], garra: ['#ff6a2a', '#ffd08a'],
  geada: ['#6fd6ff', '#f0fbff'], lamina: ['#ffd23a', '#fff8d0'], vazio: ['#8CF04A', '#e6ffc8'], espectro: ['#7CF5C8', '#e6fff8'], dragao: ['#ff4a12', '#ffd23a'],
};
function fenixFogo(skin) { return FENIX_FOGO[skin] || FENIX_FOGO.classic; }
function fenixCor(skin, c1, c2) {
  const f = fenixFogo(skin);
  if (!skin || skin === 'classic') return { corpo: c1, asa: c1, escuro: c2, olho: '#bfe6ff', enfeite: '#ffd23a', chama: f[0], miolo: f[1], contorno: false, estilo: '' };
  const sk = skinById(skin), P = sk.pal;
  return { corpo: P.body, asa: P.wing, escuro: P.dark, olho: P.ck, enfeite: P.trim, chama: f[0], miolo: f[1], contorno: true, estilo: skin };
}
// língua de fogo apontando para "ang" (0 = para cima), base em x,y
function chamaForma(x, y, w, h, ang, c1, c2, t, seed) {
  const tre = Math.sin(t * 18 + (seed || 0) * 3.1) * .18, hh = h * (1 + Math.sin(t * 23 + (seed || 0)) * .12);
  cx.save(); cx.translate(x, y); cx.rotate(ang + tre * .4);
  cx.fillStyle = c1;
  cx.beginPath(); cx.moveTo(-w, 0); cx.quadraticCurveTo(-w, -hh * .55, w * tre * 2, -hh); cx.quadraticCurveTo(w, -hh * .55, w, 0); cx.quadraticCurveTo(0, w * .8, -w, 0); cx.fill();
  cx.fillStyle = c2;
  cx.beginPath(); cx.moveTo(-w * .5, 0); cx.quadraticCurveTo(-w * .5, -hh * .4, w * tre, -hh * .62); cx.quadraticCurveTo(w * .5, -hh * .4, w * .5, 0); cx.quadraticCurveTo(0, w * .4, -w * .5, 0); cx.fill();
  cx.restore();
}

// ---------- Nave ----------
function drawFenixShip(x, y, s, c1, c2, tilt, flash, skin) {
  const C = fenixCor(skin, c1, c2), t = performance.now() / 1000, F = v => flash ? '#fff' : v;
  const O = C.contorno ? SKIN_OUT : null, st = lw => { if (O) { cx.strokeStyle = O; cx.lineWidth = lw; cx.lineJoin = 'round'; cx.stroke(); } };
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s); cx.translate(0, -3);
  // brilho do fogo
  if (!flash) { cx.globalAlpha = .22 + .06 * Math.sin(t * 7); cx.fillStyle = C.chama; cx.beginPath(); cx.arc(0, 4, 30, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
  // cauda: 3 penas longas com fogo na ponta
  for (const k of [-1, 1, 0]) {
    const ex = k * 10, ey = k ? 27 : 32;
    if (!flash) chamaForma(ex, ey - 2, 5, 12 + (k ? 0 : 3), Math.PI + k * .35, C.chama, C.miolo, t, k + 2);
    cx.fillStyle = F(k ? C.escuro : C.asa);
    cx.beginPath(); cx.moveTo(k * 2 - 3, 8); cx.quadraticCurveTo(ex - 6, ey - 12, ex, ey); cx.quadraticCurveTo(ex + 6, ey - 12, k * 2 + 3, 8); cx.closePath(); cx.fill(); st(1.6);
  }
  // asas batendo (vistas de cima: a envergadura abre e fecha)
  const ab = .82 + .18 * Math.sin(t * 9);
  for (const sd of [-1, 1]) {
    const X = v => sd * v * ab;
    // fogo nas pontas das penas
    if (!flash) for (const [px, py, k] of [[34, -5, 0], [29, 3, 1], [22, 8, 2]]) chamaForma(X(px), py, 3.4, 9, sd * (1.25 + k * .3), C.chama, C.miolo, t, k + sd);
    cx.fillStyle = F(C.asa);
    cx.beginPath(); cx.moveTo(sd * 5, -7);
    cx.quadraticCurveTo(X(18), -19, X(36), -8);
    cx.lineTo(X(30), -1); cx.lineTo(X(32), 4); cx.lineTo(X(24), 3); cx.lineTo(X(24), 10); cx.lineTo(X(15), 6); cx.lineTo(X(12), 12); cx.lineTo(sd * 5, 8);
    cx.closePath(); cx.fill(); st(2);
    // faixa escura das penas
    cx.fillStyle = F(C.escuro);
    cx.beginPath(); cx.moveTo(sd * 6, -3); cx.quadraticCurveTo(X(18), -11, X(31), -5); cx.lineTo(X(26), -1); cx.quadraticCurveTo(X(16), -4, sd * 6, 3); cx.closePath(); cx.fill();
    // enfeites de cada skin
    if (!flash) fenixEnfeiteAsa(C, sd, X, t);
  }
  // corpo e barriga de fogo
  cx.fillStyle = F(C.corpo); cx.beginPath(); cx.ellipse(0, 2, 7.5, 15, 0, 0, TAU); cx.fill(); st(2);
  cx.fillStyle = F(C.estilo ? C.enfeite : C.miolo); cx.beginPath(); cx.ellipse(0, 5, 3.6, 9, 0, 0, TAU); cx.fill();
  // crista de fogo saindo da cabeça para trás
  if (!flash) for (const k of [-1, 0, 1]) chamaForma(k * 3.5, -12, 2.8, 9, Math.PI + k * .5, C.chama, C.miolo, t, k + 5);
  // cabeça, bico e olhos
  cx.fillStyle = F(C.corpo); cx.beginPath(); cx.arc(0, -15, 6.5, 0, TAU); cx.fill(); st(2);
  cx.fillStyle = F(C.enfeite); cx.beginPath(); cx.moveTo(-3, -20); cx.lineTo(0, -28); cx.lineTo(3, -20); cx.closePath(); cx.fill(); st(1.5);
  for (const sd of [-1, 1]) {
    cx.fillStyle = F(C.olho); cx.beginPath(); cx.ellipse(sd * 3.2, -16.5, 1.9, 2.4, sd * .3, 0, TAU); cx.fill();
    if (!flash) { cx.fillStyle = '#1c1210'; cx.beginPath(); cx.arc(sd * 3.4, -17, .9, 0, TAU); cx.fill(); }
  }
  cx.restore();
}
function fenixEnfeiteAsa(C, sd, X, t) {
  const e = C.enfeite;
  switch (C.estilo) {
    case 'sucata': cx.fillStyle = e; for (const px of [11, 18, 25]) { cx.beginPath(); cx.arc(X(px), -6 + px * .1, 1.5, 0, TAU); cx.fill(); } break;
    case 'bosque': cx.fillStyle = '#7CCB5C'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2;
      cx.beginPath(); cx.ellipse(X(37), -10, 5, 2.6, sd * -.5, 0, TAU); cx.fill(); cx.stroke(); break;
    case 'garra': cx.fillStyle = e; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2;
      for (const px of [14, 22, 30]) { cx.beginPath(); cx.moveTo(X(px - 3), -12 + px * .1); cx.lineTo(X(px), -19 + px * .15); cx.lineTo(X(px + 3), -10 + px * .1); cx.closePath(); cx.fill(); cx.stroke(); } break;
    case 'geada': cx.fillStyle = '#ffffff'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2;
      for (const [px, py] of [[36, -8], [31, 4]]) { cx.beginPath(); cx.moveTo(X(px), py - 4); cx.lineTo(X(px + 2.5), py); cx.lineTo(X(px), py + 4); cx.lineTo(X(px - 2.5), py); cx.closePath(); cx.fill(); cx.stroke(); } break;
    case 'lamina': cx.strokeStyle = e; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(sd * 6, -8); cx.quadraticCurveTo(X(18), -18, X(35), -8); cx.stroke(); break;
    case 'vazio': cx.fillStyle = e; cx.globalAlpha = .5 + .3 * Math.sin(t * 6); cx.beginPath(); cx.arc(X(20), -5, 2.2, 0, TAU); cx.fill(); cx.globalAlpha = 1; break;
    case 'espectro': cx.strokeStyle = e; cx.lineWidth = 1.6; cx.beginPath();
      for (const px of [12, 19, 26]) { cx.moveTo(X(px - 4), -8 + px * .15); cx.lineTo(X(px + 2), 4 + px * .05); }
      cx.stroke(); break;
    case 'dragao': cx.strokeStyle = '#FFB52E'; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(X(10), -8); cx.lineTo(X(17), -4); cx.lineTo(X(22), -9); cx.lineTo(X(29), -4); cx.stroke(); break;
  }
}

// ---------- Penas, chamas do rastro, meteoros e sol ----------
function drawPena(b) {
  const a = Math.atan2(b.vx, -b.vy), k = clamp(b.life / b.vida, 0, 1), f = fenixFogo(b.sk), t = performance.now() / 1000;
  cx.save(); cx.translate(b.x, b.y); cx.rotate(a);
  cx.globalAlpha = Math.min(1, k * 3);
  chamaForma(0, 6, 4, 14, Math.PI, f[0], f[1], t, b.x * .01);
  cx.fillStyle = b.explo ? '#ffb347' : (b.color || f[0]);
  cx.beginPath(); cx.moveTo(0, -10); cx.quadraticCurveTo(5.5, -3, 3, 7); cx.lineTo(0, 9); cx.lineTo(-3, 7); cx.quadraticCurveTo(-5.5, -3, 0, -10); cx.fill();
  cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2; cx.stroke();
  cx.strokeStyle = f[1]; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(0, -8); cx.lineTo(0, 10); cx.stroke(); // haste
  cx.restore();
}
function drawChama(b) {
  const f = fenixFogo(b.sk), t = performance.now() / 1000, k = clamp(b.life / b.vida, 0, 1);
  const tam = Math.min(1, (b.vida - b.life) / .15 + .3) * (.45 + .55 * k);
  cx.save(); cx.globalAlpha = .18 * k; cx.fillStyle = f[0]; cx.beginPath(); cx.ellipse(b.x, b.y + 4, b.R * tam, b.R * .55 * tam, 0, 0, TAU); cx.fill();
  cx.globalAlpha = .9;
  for (let j = 0; j < 3; j++) chamaForma(b.x + (j - 1) * b.R * .45 * tam, b.y + 4 + (j === 1 ? 2 : 0), 5 * tam, (j === 1 ? 20 : 14) * tam, 0, f[0], f[1], t, b.seed + j);
  cx.restore();
}
function meteoroPos(b) { // posição da pedra caindo (vem do alto, um pouco de lado)
  const u = clamp((b.t - b.aviso) / b.queda, 0, 1);
  return { x: b.x + (1 - u) * 140, y: b.y - (1 - u) * 460, u };
}
function drawSombraMeteoro(b) {
  const k = clamp(b.t / (b.aviso + b.queda), 0, 1), pis = .5 + .5 * Math.sin(b.t * 22);
  cx.save();
  cx.globalAlpha = .15 + .2 * k; cx.fillStyle = '#ff3a1a'; cx.beginPath(); cx.arc(b.x, b.y, b.R * (.4 + .6 * k), 0, TAU); cx.fill();
  cx.globalAlpha = .5 + .4 * pis; cx.strokeStyle = '#ffd23a'; cx.lineWidth = 2.5; cx.setLineDash([10, 7]); cx.lineDashOffset = b.t * 40;
  cx.beginPath(); cx.arc(b.x, b.y, b.R, 0, TAU); cx.stroke();
  cx.restore();
}
function drawMeteoro(b) {
  if (b.t < b.aviso) return;
  const m = meteoroPos(b), t = performance.now() / 1000, L = Math.hypot(140, 460), tx = 140 / L, ty = -460 / L; // cauda aponta para onde veio
  cx.save();
  for (let j = 4; j >= 1; j--) { // cauda de fogo
    cx.globalAlpha = .18 * (5 - j); cx.fillStyle = j > 2 ? '#ff6a2a' : '#ffd23a';
    cx.beginPath(); cx.arc(m.x + tx * j * 14, m.y + ty * j * 14, 13 - j * 1.5, 0, TAU); cx.fill();
  }
  cx.globalAlpha = 1;
  chamaForma(m.x, m.y, 12, 30, Math.atan2(tx, -ty), '#ff6a2a', '#ffd23a', t, b.rot);
  cx.translate(m.x, m.y); cx.rotate(b.rot);
  cx.fillStyle = '#5a3a2a'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2.5;
  cx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, r = 11 + (k % 3) * 1.6; k ? cx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : cx.moveTo(r, 0); } cx.closePath(); cx.fill(); cx.stroke();
  cx.strokeStyle = '#ffb52e'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-6, -3); cx.lineTo(0, 1); cx.lineTo(5, -4); cx.moveTo(0, 1); cx.lineTo(2, 7); cx.stroke();
  cx.restore();
}
function drawSol(b) {
  const a = clamp(1 - b.R / (Math.hypot(W, H) + 60), 0, 1);
  cx.save();
  cx.globalAlpha = .35 * a + .08; cx.strokeStyle = '#ff8a2a'; cx.lineWidth = 34;
  cx.beginPath(); cx.arc(b.x, b.y, b.R, 0, TAU); cx.stroke();
  cx.globalAlpha = .7 * a + .15; cx.strokeStyle = '#ffd23a'; cx.lineWidth = 5; cx.beginPath();
  const n = 72; // borda ondulada (calor)
  for (let k = 0; k <= n; k++) { const an = k / n * TAU, r = b.R + 10 + Math.sin(an * 12 + b.R * .05) * 6; k ? cx.lineTo(b.x + Math.cos(an) * r, b.y + Math.sin(an) * r) : cx.moveTo(b.x + r, b.y); }
  cx.stroke();
  cx.globalAlpha = .9 * a; cx.strokeStyle = '#fff6c8'; cx.lineWidth = 2; cx.beginPath(); cx.arc(b.x, b.y, b.R - 8, 0, TAU); cx.stroke();
  cx.restore();
}
// embaixo das naves: chamas do rastro e sombras dos meteoros
function drawFenixChao() {
  for (const b of S.bullets) {
    if (b.type === 'chama') drawChama(b);
    else if (b.type === 'meteor') drawSombraMeteoro(b);
  }
}
function drawFenixBala(b) {
  if (b.type === 'feather') { drawPena(b); return true; }
  if (b.type === 'chama') return true; // já desenhada em drawFenixChao
  if (b.type === 'meteor') { drawMeteoro(b); return true; }
  if (b.type === 'sun') { drawSol(b); return true; }
  return false;
}

// ---------- Inimigos pegando fogo ----------
function drawQueimas() {
  const t = performance.now() / 1000;
  for (const e of S.enemies.concat(S.bosses || [])) {
    if (e.dead || !(e.burnT > 0)) continue;
    const f = fenixFogo(e.burnP && e.burnP.skin), a = Math.min(1, e.burnT * 2), tam = Math.min(1, e.r / 16) * (e.boss ? 1.6 : 1);
    cx.save(); cx.globalAlpha = .85 * a;
    for (let j = 0; j < e.burnN; j++) {
      const ox = (j - (e.burnN - 1) / 2) * e.r * (e.boss ? .45 : .6), oy = -e.r * .3 + (j % 2) * 4;
      chamaForma(e.x + ox, e.y + oy, 4.5 * tam, 15 * tam, 0, f[0], f[1], t, j + e.x * .01);
    }
    cx.restore();
  }
}

// ---------- Filhotes ----------
function drawFilhote(x, y, dir, flap, skin) {
  const f = fenixFogo(skin), t = performance.now() / 1000;
  cx.save(); cx.translate(x, y); cx.rotate(dir + Math.PI / 2);
  chamaForma(0, 6, 3.5, 13, Math.PI, f[0], f[1], t, flap);
  const ab = Math.sin(flap) * .5;
  cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.5; cx.lineJoin = 'round';
  for (const k of [-1, 1]) {
    cx.save(); cx.rotate(k * (.3 + ab));
    cx.fillStyle = f[0]; cx.beginPath(); cx.moveTo(0, -2); cx.quadraticCurveTo(k * 15, -4, k * 14, 6); cx.quadraticCurveTo(k * 6, 4, 0, 5); cx.closePath(); cx.fill(); cx.stroke();
    cx.restore();
  }
  cx.fillStyle = '#e8501f'; cx.beginPath(); cx.ellipse(0, 1, 4.5, 7, 0, 0, TAU); cx.fill(); cx.stroke();
  cx.fillStyle = f[1]; cx.beginPath(); cx.arc(0, -6, 4, 0, TAU); cx.fill(); cx.stroke();
  cx.fillStyle = '#ffd23a'; cx.beginPath(); cx.moveTo(-1.8, -9); cx.lineTo(0, -13.5); cx.lineTo(1.8, -9); cx.closePath(); cx.fill(); cx.stroke();
  cx.fillStyle = '#1c1210'; for (const k of [-1, 1]) { cx.beginPath(); cx.arc(k * 1.8, -6.5, 1, 0, TAU); cx.fill(); }
  cx.restore();
}
function drawFilhotes(p) {
  for (const w of p.weapons) if (w.type === 'chick' && w.birds) for (let k = 0; k < w.shots; k++) {
    const bd = w.birds[k]; if (bd) drawFilhote(bd.x, bd.y, bd.dir, bd.flap, p.skin);
  }
}

// ---------- Ovo (Renascer) ----------
function drawOvo(p) {
  const u = 1 - p.ovoT / p.ovoMax, t = performance.now() / 1000, f = fenixFogo(p.skin);
  const treme = u > .6 ? Math.sin(t * 60) * (u - .6) * 8 : 0;
  cx.save(); cx.translate(p.x + treme, p.y);
  cx.globalAlpha = .25 + .2 * u + .1 * Math.sin(t * (6 + u * 20)); cx.fillStyle = f[0];
  cx.beginPath(); cx.arc(0, 0, 30 + u * 14, 0, TAU); cx.fill(); cx.globalAlpha = 1;
  for (let j = 0; j < 5; j++) { const a = j / 5 * TAU + t * 2; chamaForma(Math.cos(a) * 16, Math.sin(a) * 18 + 6, 4, 12 + u * 8, 0, f[0], f[1], t, j); }
  cx.fillStyle = '#fff2c8'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 2.5;
  cx.beginPath(); cx.ellipse(0, 0, 14, 18, 0, 0, TAU); cx.fill(); cx.stroke();
  cx.fillStyle = f[0]; cx.globalAlpha = .55; // pintas de fogo
  for (const [x, y, r] of [[-5, -6, 3], [5, 2, 3.5], [-3, 9, 2.5]]) { cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill(); }
  cx.globalAlpha = 1;
  // rachaduras aumentam até chocar
  cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.8; cx.beginPath();
  const R = [[-10, -4, -4, -1], [-4, -1, -6, 5], [-4, -1, 2, -6], [2, -6, 7, -2], [7, -2, 11, 3], [-6, 5, 0, 9]];
  const n = Math.floor(u * R.length + .2);
  for (let k = 0; k < n; k++) { cx.moveTo(R[k][0], R[k][1]); cx.lineTo(R[k][2], R[k][3]); }
  cx.stroke();
  cx.restore();
}

// ---------- HUD: renascer disponível ----------
function drawRenascerIcone(x, y, ok) {
  const t = performance.now() / 1000;
  cx.save(); cx.globalAlpha = ok ? 1 : .35;
  if (ok) chamaForma(x, y + 5, 4, 12, 0, '#ff8a2a', '#ffe066', t, 1);
  else { cx.strokeStyle = '#9fb3c8'; cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(x, y, 4, 5.5, 0, 0, TAU); cx.stroke(); }
  cx.restore();
}

// ---------- Prévia no hangar (leque de penas subindo) ----------
function drawFenixPreview(x, y) {
  const ph = (titleT * 1.6) % 1;
  for (let k = 0; k < 3; k++) {
    const ang = (k - 1) * .25, d = 10 + ph * 50;
    drawPena({ x: x + Math.sin(ang) * d, y: y - d, vx: Math.sin(ang), vy: -Math.cos(ang), life: 1 - ph, vida: 1, sk: null, color: '#ffb347' });
  }
}
