// ---------- Falcão, Bumerangue e Artilheiro: desenho no canvas (desde 1.2.0) ----------
// Mesmo padrão da Fênix e da Hypnos: cada nave tem "personagem", aura, contorno nas skins e animação.
// "Original" = cores do jogador, sem contorno. Skins = paleta de js/dados/skins.js + enfeites por skin.
//   Falcão     – ave de rapina mecânica: bico, olhos, asas com penas de metal que planam, garras-canhão.
//   Bumerangue – lâmina curva com bumerangues girando nas pontas.
//   Artilheiro – fortaleza voadora: blindagem, torre giratória e casulos de mísseis.
// A Âncora Negra usa as mesmas peças (js/visual/pirata.js).

// cores da nave: Original (cores do jogador) ou skin
function naveCor(skin, c1, c2) {
  if (!skin || skin === 'classic')
    return { corpo: c1, asa: c1, escuro: c2, cabine: '#bfe6ff', enfeite: '#f2ead8', brilho: c1, chama: '#ffb347', miolo: '#fff0b0', contorno: false, estilo: '' };
  const sk = skinById(skin), P = sk.pal;
  return { corpo: P.body, asa: P.wing, escuro: P.dark, cabine: P.ck, enfeite: P.trim, brilho: sk.shot, chama: sk.shot, miolo: '#fff6d8', contorno: true, estilo: skin };
}
// ferramentas de desenho de uma nave (F = cor ou branco no pisca; st = contorno só nas skins)
function naveKit(C, flash) {
  return {
    F: v => flash ? '#fff' : v,
    st: lw => { if (C.contorno) { cx.strokeStyle = SKIN_OUT; cx.lineWidth = lw; cx.lineJoin = 'round'; cx.stroke(); } },
  };
}
function naveAura(C, flash, t, R, y) {
  if (flash) return;
  cx.globalAlpha = .2 + .06 * Math.sin(t * 4); cx.fillStyle = C.brilho;
  cx.beginPath(); cx.arc(0, y || 0, R, 0, TAU); cx.fill(); cx.globalAlpha = 1;
}
function navePoli(pts) { cx.beginPath(); pts.forEach(([a, b], k) => k ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); }
function naveMotor(C, flash, x, y, w, h, t, seed) { if (!flash) chamaForma(x, y, w, h, Math.PI, C.chama, C.miolo, t, seed); }

// enfeite pequeno de cada skin num ponto (ang = para onde aponta, 0 = para cima)
function naveEnfeite(C, x, y, ang, e, t) {
  if (!C.estilo) return;
  e = e || 1; const O = SKIN_OUT;
  cx.save(); cx.translate(x, y); cx.rotate(ang || 0); cx.scale(e, e);
  cx.strokeStyle = O; cx.lineWidth = 1.2; cx.lineJoin = 'round';
  switch (C.estilo) {
    case 'sucata': // parafuso
      cx.fillStyle = C.enfeite; cx.beginPath(); cx.arc(0, 0, 2.6, 0, TAU); cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-1.5, 0); cx.lineTo(1.5, 0); cx.stroke(); break;
    case 'bosque': // folha
      cx.fillStyle = '#7CCB5C'; cx.beginPath(); cx.moveTo(0, 3); cx.quadraticCurveTo(-4.5, -3, 0, -8); cx.quadraticCurveTo(4.5, -3, 0, 3); cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(0, 2); cx.lineTo(0, -6); cx.stroke(); break;
    case 'garra': // espinho
      cx.fillStyle = C.enfeite; navePoli([[-2.6, 1], [0, -7], [2.6, 1]]); cx.fill(); cx.stroke(); break;
    case 'geada': // cristal de gelo
      cx.fillStyle = '#ffffff'; navePoli([[0, -7], [2.6, -1], [0, 3], [-2.6, -1]]); cx.fill(); cx.stroke();
      cx.fillStyle = '#8FD8F2'; navePoli([[0, -5], [1, -1], [0, 1], [-1, -1]]); cx.fill(); break;
    case 'lamina': // pedra dourada com brilho
      cx.fillStyle = C.enfeite; navePoli([[0, -4], [3, 0], [0, 4], [-3, 0]]); cx.fill(); cx.stroke();
      cx.fillStyle = '#fff8d0'; cx.beginPath(); cx.arc(-.8, -1, .9, 0, TAU); cx.fill(); break;
    case 'vazio': // orbe verde pulsando
      cx.fillStyle = C.enfeite; cx.globalAlpha = .35; cx.beginPath(); cx.arc(0, 0, 4.5 + Math.sin(t * 6 + x) * 1, 0, TAU); cx.fill();
      cx.globalAlpha = 1; cx.beginPath(); cx.arc(0, 0, 2.2, 0, TAU); cx.fill(); break;
    case 'espectro': // osso
      cx.fillStyle = C.enfeite; cx.fillRect(-1, -5, 2, 8); cx.strokeRect(-1, -5, 2, 8);
      for (const yy of [-5.5, 3.5]) for (const xx of [-1.3, 1.3]) { cx.beginPath(); cx.arc(xx, yy, 1.5, 0, TAU); cx.fill(); cx.stroke(); } break;
    case 'dragao': // chifre
      cx.fillStyle = C.enfeite; cx.beginPath(); cx.moveTo(-2.6, 1.5); cx.quadraticCurveTo(-2, -5, 2, -8); cx.quadraticCurveTo(0, -3, 2.6, 1.5); cx.closePath(); cx.fill(); cx.stroke(); break;
  }
  cx.restore();
}
// faixa de cada skin ao longo de uma linha (pts) – costelas, escamas, rebites, filete dourado...
function naveListra(C, pts, t) {
  if (!C.estilo) return;
  const seg = [];
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = pts[k - 1], [bx, by] = pts[k], L = Math.hypot(bx - ax, by - ay);
    for (let d = 0; d < L; d += 4) seg.push([ax + (bx - ax) * d / L, ay + (by - ay) * d / L, Math.atan2(by - ay, bx - ax)]);
  }
  const linha = (cor, lw) => { cx.strokeStyle = cor; cx.lineWidth = lw; cx.lineCap = 'round'; cx.beginPath(); pts.forEach(([a, b], k) => k ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.stroke(); };
  cx.save();
  switch (C.estilo) {
    case 'sucata': case 'garra':
      cx.fillStyle = C.enfeite; cx.strokeStyle = SKIN_OUT; cx.lineWidth = .8;
      seg.forEach(([x, y], k) => { if (k % 2 === 0) { cx.beginPath(); cx.arc(x, y, 1.1, 0, TAU); cx.fill(); cx.stroke(); } }); break;
    case 'bosque':
      linha('#3E8A3A', 1.6);
      cx.fillStyle = '#7CCB5C'; seg.forEach(([x, y, a], k) => { if (k % 3 === 1) { cx.beginPath(); cx.ellipse(x, y, 2.2, 1.1, a + (k % 2 ? .8 : -.8), 0, TAU); cx.fill(); } }); break;
    case 'geada':
      cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.1;
      seg.forEach(([x, y, a], k) => { if (k % 2 === 0) { cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(a - 1) * 3, y + Math.sin(a - 1) * 3); cx.stroke(); } }); break;
    case 'lamina': linha(C.enfeite, 1.8); break;
    case 'vazio':
      cx.fillStyle = C.enfeite; seg.forEach(([x, y], k) => { cx.globalAlpha = .45 + .45 * Math.sin(t * 5 - k * .8); cx.beginPath(); cx.arc(x, y, .9, 0, TAU); cx.fill(); }); break;
    case 'espectro':
      cx.strokeStyle = C.enfeite; cx.lineWidth = 1.3;
      seg.forEach(([x, y, a], k) => { if (k % 2 === 0) { cx.beginPath(); cx.moveTo(x - Math.cos(a + 1.57) * 2.5, y - Math.sin(a + 1.57) * 2.5); cx.lineTo(x + Math.cos(a + 1.57) * 2.5, y + Math.sin(a + 1.57) * 2.5); cx.stroke(); } }); break;
    case 'dragao':
      cx.strokeStyle = '#FFB52E'; cx.lineWidth = 1.2; cx.beginPath();
      seg.forEach(([x, y, a], k) => { const o = (k % 2 ? 1.8 : -1.8); const px = x + Math.cos(a + 1.57) * o, py = y + Math.sin(a + 1.57) * o; k ? cx.lineTo(px, py) : cx.moveTo(px, py); });
      cx.stroke(); break;
  }
  cx.restore();
}
// hélice (Engenhoca de Sucata)
function naveHelice(x, y, R, t, flash) {
  if (flash) return;
  cx.save(); cx.translate(x, y);
  cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 2; const a = Math.sin(t * 40) * R;
  cx.beginPath(); cx.moveTo(-a, 0); cx.lineTo(a, 0); cx.stroke();
  cx.fillStyle = '#C9B27A'; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1; cx.beginPath(); cx.arc(0, 0, 2, 0, TAU); cx.fill(); cx.stroke();
  cx.restore();
}

// ---------- Falcão: ave de rapina mecânica ----------
function drawFalcaoShip(x, y, s, c1, c2, tilt, flash, skin) {
  const C = naveCor(skin, c1, c2), t = performance.now() / 1000, { F, st } = naveKit(C, flash);
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  naveAura(C, flash, t, 31, 0);
  // motor
  naveMotor(C, flash, 0, 20, 4.5, 11, t, 1);
  // cauda em leque: 3 penas de metal
  const ab = .9 + .1 * Math.sin(t * 2.6); // as asas planam (abrem e fecham devagar)
  for (const k of [-1, 1, 0]) {
    const a = k * .38 + Math.sin(t * 2.6 + k) * .04;
    cx.save(); cx.translate(0, 13); cx.rotate(a);
    cx.fillStyle = F(k ? C.escuro : C.corpo);
    navePoli([[-3.2, 0], [-4, 12], [0, 16], [4, 12], [3.2, 0]]); cx.fill(); st(1.5);
    cx.restore();
  }
  // garras-canhão embaixo das asas (só o cano aparece na frente)
  for (const sd of [-1, 1]) { cx.fillStyle = F(C.escuro); cx.beginPath(); cx.rect(sd * 13 - 1.8, -16, 3.6, 8); cx.fill(); st(1.2); }
  for (const sd of [-1, 1]) {
    const X = v => sd * v * ab;
    // asa de rapina com 4 penas de metal na ponta
    cx.fillStyle = F(C.asa);
    navePoli([[sd * 5, -9], [X(16), -14], [X(29), -12], [X(37), -6], [X(36), -2], [X(32), 0], [X(33), 3], [X(28), 4], [X(28), 8], [X(22), 7], [X(20), 11], [X(14), 7], [sd * 6, 6]]);
    cx.fill(); st(2);
    // bordo de ataque escuro
    cx.fillStyle = F(C.escuro);
    navePoli([[sd * 6, -8], [X(16), -13], [X(29), -11], [X(35), -6], [X(27), -6], [X(16), -6], [sd * 6, -2]]); cx.fill();
    // divisões das penas
    if (!flash) {
      cx.strokeStyle = C.contorno ? SKIN_OUT : 'rgba(0,0,0,.25)'; cx.lineWidth = 1;
      cx.beginPath(); for (const [ax, ay, bx, by] of [[24, -5, 31, 1], [20, -4, 26, 5], [15, -4, 18, 8]]) { cx.moveTo(X(ax), ay); cx.lineTo(X(bx), by); } cx.stroke();
      naveListra(C, [[X(9), -11], [X(22), -12.5], [X(33), -8]], t);
    }
    if (!flash) naveEnfeite(C, X(36), -7, sd * 1.2, 1, t);
  }
  // corpo
  cx.fillStyle = F(C.corpo); cx.beginPath(); cx.ellipse(0, 1, 7, 15, 0, 0, TAU); cx.fill(); st(2);
  cx.fillStyle = F(C.escuro); cx.beginPath(); cx.ellipse(0, 6, 3.4, 7, 0, 0, TAU); cx.fill();
  if (!flash) naveListra(C, [[0, 0], [0, 12]], t);
  // cabeça com bico curvo e olhos (a cabine)
  cx.fillStyle = F(C.corpo); cx.beginPath(); cx.arc(0, -15, 6.8, 0, TAU); cx.fill(); st(2);
  cx.fillStyle = F(C.contorno ? C.enfeite : '#ffd23a');
  cx.beginPath(); cx.moveTo(-3.4, -20); cx.quadraticCurveTo(0, -31, 3.4, -20); cx.quadraticCurveTo(0, -22, -3.4, -20); cx.fill(); st(1.4);
  for (const sd of [-1, 1]) {
    cx.fillStyle = F(C.cabine); navePoli([[sd * 1.2, -18], [sd * 5.4, -17.5], [sd * 4.4, -14.2], [sd * 1.6, -15.2]]); cx.fill();
    if (!flash) { cx.fillStyle = '#1c1210'; cx.beginPath(); cx.arc(sd * 3.4, -16.4, .9, 0, TAU); cx.fill();
      cx.strokeStyle = C.contorno ? SKIN_OUT : C.escuro; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(sd * 1, -19.2); cx.lineTo(sd * 5.8, -18.4); cx.stroke(); } // sobrancelha brava
  }
  if (C.estilo === 'sucata') naveHelice(0, -29, 7, t, flash);
  if (!flash) { naveEnfeite(C, -4.5, -20, -.5, .9, t); naveEnfeite(C, 4.5, -20, .5, .9, t); }
  cx.restore();
}

// ---------- Bumerangue: lâmina curva com bumerangues girando nas pontas ----------
function miniBumerangue(x, y, r, rot, cor, escuro, flash, st) {
  cx.save(); cx.translate(x, y); cx.rotate(rot);
  cx.fillStyle = flash ? '#fff' : cor;
  for (let k = 0; k < 3; k++) {
    cx.rotate(TAU / 3);
    cx.beginPath(); cx.moveTo(-r * .32, 0); cx.quadraticCurveTo(-r * .3, -r * .8, r * .25, -r); cx.quadraticCurveTo(r * .1, -r * .45, r * .32, 0); cx.closePath(); cx.fill(); st(1.2);
  }
  cx.fillStyle = flash ? '#fff' : escuro; cx.beginPath(); cx.arc(0, 0, r * .36, 0, TAU); cx.fill(); st(1.2);
  cx.restore();
}
function drawBumerangueShip(x, y, s, c1, c2, tilt, flash, skin) {
  const C = naveCor(skin, c1, c2), t = performance.now() / 1000, { F, st } = naveKit(C, flash);
  const disco = C.contorno ? C.enfeite : '#7ff0c8';
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  naveAura(C, flash, t, 31, 2);
  naveMotor(C, flash, 0, 17, 4.5, 11, t, 2);
  // lâmina em V (um grande bumerangue)
  cx.fillStyle = F(C.asa);
  cx.beginPath(); cx.moveTo(0, -20);
  cx.quadraticCurveTo(20, -8, 33, 12); cx.quadraticCurveTo(36, 20, 28, 19);
  cx.quadraticCurveTo(14, 6, 0, 10);
  cx.quadraticCurveTo(-14, 6, -28, 19); cx.quadraticCurveTo(-36, 20, -33, 12);
  cx.quadraticCurveTo(-20, -8, 0, -20); cx.closePath(); cx.fill(); st(2);
  // faixa escura na borda de dentro
  cx.fillStyle = F(C.escuro);
  for (const sd of [-1, 1]) {
    cx.beginPath(); cx.moveTo(0, 4); cx.quadraticCurveTo(sd * 15, 0, sd * 29, 15); cx.quadraticCurveTo(sd * 16, 7, 0, 10); cx.closePath(); cx.fill();
  }
  // brilho da curva
  if (!flash) {
    cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 2; cx.lineCap = 'round';
    for (const sd of [-1, 1]) { cx.beginPath(); cx.moveTo(sd * 4, -15); cx.quadraticCurveTo(sd * 19, -5, sd * 29, 9); cx.stroke(); }
    for (const sd of [-1, 1]) naveListra(C, [[sd * 5, -12], [sd * 17, -4], [sd * 27, 8]], t);
  }
  // bumerangues girando nas pontas (lançadores)
  for (const sd of [-1, 1]) {
    if (!flash) { cx.globalAlpha = .3; cx.fillStyle = disco; cx.beginPath(); cx.arc(sd * 30, 15, 9, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
    miniBumerangue(sd * 30, 15, 7.5, sd * t * 9, disco, C.escuro, flash, st);
  }
  // casulo central com cabine e barbatana
  cx.fillStyle = F(C.corpo);
  cx.beginPath(); cx.moveTo(0, -27); cx.quadraticCurveTo(8, -14, 7, 4); cx.quadraticCurveTo(6, 14, 0, 16); cx.quadraticCurveTo(-6, 14, -7, 4); cx.quadraticCurveTo(-8, -14, 0, -27); cx.fill(); st(2);
  cx.fillStyle = F(C.escuro); navePoli([[-1.6, 2], [0, 15], [1.6, 2]]); cx.fill();
  cx.fillStyle = F(C.cabine); cx.beginPath(); cx.ellipse(0, -11, 3.6, 7, 0, 0, TAU); cx.fill(); st(1.4);
  if (!flash) { cx.fillStyle = 'rgba(255,255,255,.7)'; cx.beginPath(); cx.ellipse(-1.2, -13, 1, 2.6, 0, 0, TAU); cx.fill(); }
  if (C.estilo === 'sucata') naveHelice(0, -27, 7, t, flash);
  if (!flash) { naveEnfeite(C, 0, -25, 0, 1, t); for (const sd of [-1, 1]) naveEnfeite(C, sd * 20, -2, sd * .9, .9, t); }
  cx.restore();
}

// ---------- Artilheiro: fortaleza voadora com torre giratória e casulos de mísseis ----------
function drawArtilheiroShip(x, y, s, c1, c2, tilt, flash, skin) {
  const C = naveCor(skin, c1, c2), t = performance.now() / 1000, { F, st } = naveKit(C, flash);
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  naveAura(C, flash, t, 33, 2);
  for (const sd of [-1, 1]) naveMotor(C, flash, sd * 12, 24, 4, 10, t, 3 + sd);
  for (const sd of [-1, 1]) {
    // asa blindada
    cx.fillStyle = F(C.asa);
    navePoli([[sd * 8, -6], [sd * 30, -4], [sd * 35, 2], [sd * 35, 9], [sd * 30, 12], [sd * 8, 10]]); cx.fill(); st(2);
    cx.fillStyle = F(C.escuro); navePoli([[sd * 9, 6], [sd * 31, 7], [sd * 30, 12], [sd * 8, 10]]); cx.fill();
    if (!flash) naveListra(C, [[sd * 12, -1.5], [sd * 30, 0]], t);
    // casulo de 3 mísseis (sobem e descem um pouco, prontos para a saraivada)
    for (let k = 0; k < 3; k++) {
      const mx = sd * (20 + k * 5), my = -9 + Math.sin(t * 5 + k * 1.3 + sd) * .8;
      cx.fillStyle = F('#e8e8e8'); cx.beginPath(); cx.rect(mx - 1.7, my, 3.4, 9); cx.fill(); st(1);
      cx.fillStyle = F('#e74c3c'); navePoli([[mx - 1.7, my], [mx, my - 3.6], [mx + 1.7, my]]); cx.fill(); st(1);
    }
    // motor (nacele)
    cx.fillStyle = F(C.escuro); cx.beginPath(); cx.rect(sd * 12 - 4, 4, 8, 19); cx.fill(); st(1.6);
    cx.fillStyle = F(C.corpo); cx.beginPath(); cx.rect(sd * 12 - 4, 4, 8, 4); cx.fill();
    if (!flash) naveEnfeite(C, sd * 35, 5, sd * 1.57, 1, t);
  }
  // casco blindado
  cx.fillStyle = F(C.corpo);
  navePoli([[0, -27], [8, -20], [9, 14], [5, 21], [-5, 21], [-9, 14], [-8, -20]]); cx.fill(); st(2);
  cx.fillStyle = F(C.escuro); navePoli([[-5, 10], [5, 10], [4, 19], [-4, 19]]); cx.fill();
  if (!flash) {
    cx.fillStyle = C.contorno ? C.enfeite : 'rgba(255,255,255,.45)';
    for (const [rx, ry] of [[-6, -16], [6, -16], [-6.5, 6], [6.5, 6]]) { cx.beginPath(); cx.arc(rx, ry, 1, 0, TAU); cx.fill(); }
  }
  // visor da cabine
  cx.fillStyle = F(C.cabine); navePoli([[-4.5, -21], [4.5, -21], [3, -17], [-3, -17]]); cx.fill(); st(1.2);
  // torre giratória com cano duplo
  const ang = Math.sin(t * 1.4) * .45;
  cx.save(); cx.translate(0, -3); cx.rotate(ang);
  cx.fillStyle = F(C.escuro); cx.fillRect(-3.4, -15, 2.4, 12); cx.fillRect(1, -15, 2.4, 12);
  if (C.contorno) { cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1; cx.strokeRect(-3.4, -15, 2.4, 12); cx.strokeRect(1, -15, 2.4, 12); }
  cx.fillStyle = F(C.enfeite); cx.fillRect(-3.4, -16, 2.4, 2); cx.fillRect(1, -16, 2.4, 2);
  cx.fillStyle = F(C.corpo); cx.beginPath(); cx.arc(0, 0, 6.5, 0, TAU); cx.fill(); st(1.8);
  cx.fillStyle = F(C.cabine); cx.beginPath(); cx.arc(0, -1, 2.4, 0, TAU); cx.fill();
  cx.restore();
  if (C.estilo === 'sucata') naveHelice(0, -27, 6, t, flash);
  if (!flash) naveEnfeite(C, 0, -26, 0, 1, t);
  cx.restore();
}
