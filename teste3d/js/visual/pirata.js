// ---------- Âncora Negra: desenho (nave, âncora, armas piratas e dragão de água) ----------
// A nave é desenhada no canvas (Original nas cores do jogador; skins com PIRATA_SKIN).
// O dragão é desenhado no canvas porque o corpo ondula e segue a nave.
const PIRATA_OUT = '#24160c';

// paleta e enfeites de cada skin
const PIRATA_SKIN = {
  sucata:   { pal: { casco: '#E08A2E', conves: '#C9B27A', vela: '#8A8F96', asa: '#5a5f68', enfeite: '#C9B27A', emblema: '#d0d4d8' }, deco: { emblema: 'engrenagem', rebites: true, remendo: true, pontas: 'espinhos' } },
  bosque:   { pal: { casco: '#9B6A3C', conves: '#c49a62', vela: '#5DAE4A', asa: '#3E8A3A', enfeite: '#7CCB5C', emblema: '#F4C542' }, deco: { emblema: 'folha', pontas: 'folhas' } },
  garra:    { pal: { casco: '#4A4E55', conves: '#6a6f78', vela: '#C2362B', asa: '#4A4E55', enfeite: '#c9ccd1', emblema: '#c9ccd1' }, deco: { emblema: 'garra', rebites: true, pontas: 'espinhos' } },
  geada:    { pal: { casco: '#2F6FB5', conves: '#8FD8F2', vela: '#e8f8ff', asa: '#2F6FB5', enfeite: '#ffffff', emblema: '#8FD8F2' }, deco: { emblema: 'floco', pontas: 'gelo' } },
  lamina:   { pal: { casco: '#F4F1E6', conves: '#e2dccb', vela: '#2A55B8', asa: '#2A55B8', enfeite: '#F2C230', emblema: '#F2C230' }, deco: { emblema: 'sol', pontas: 'lamina' } },
  vazio:    { pal: { casco: '#3a1a5c', conves: '#5a2a86', vela: '#2a1240', asa: '#5a2a86', enfeite: '#8CF04A', emblema: '#8CF04A' }, deco: { emblema: 'chama', pontas: 'chamas', rasgada: true } },
  espectro: { pal: { casco: '#6b6455', conves: '#8a8270', vela: '#EDE3C8', asa: '#cfc4a6', enfeite: '#EDE3C8', emblema: '#EDE3C8', olhos: '#2fd9a0' }, deco: { emblema: 'caveira', costelas: true, pontas: 'ossos', rasgada: true } },
  dragao:   { pal: { casco: '#7a1610', conves: '#B8231A', vela: '#B8231A', asa: '#7a1610', enfeite: '#FFC23D', emblema: '#FFC23D' }, deco: { emblema: 'dragao', pontas: 'morcego' } },
};

// ---------- Nave: galeão voador com carranca, velas que enchem de vento e bandeira tremulando ----------
// Desenhada no canvas (desde 1.2.0), no mesmo padrão da Fênix e da Hypnos (peças em js/visual/naves-base.js).
// Original = cores do jogador; skins = PIRATA_SKIN (paleta e enfeites).
const PIRATA_TITULO = ['#c0563a', '#6e2a1c']; // tela inicial: casco vermelho-ferrugem
function pirataCor(skin, c1, c2) {
  const C = naveCor(skin, c1, c2), ps = PIRATA_SKIN[skin];
  if (!ps) return Object.assign(C, { casco: c1, conves: c2, vela: '#f2ead8', asa: c2, enfeite: '#ffd23a', emblema: '#f2ead8', olhos: '#24160c', deco: {} });
  const P = ps.pal;
  return Object.assign(C, { casco: P.casco, conves: P.conves, vela: P.vela, asa: P.asa, enfeite: P.enfeite, emblema: P.emblema, olhos: P.olhos || SKIN_OUT, deco: ps.deco });
}
function caveira(x, y, e, cor, olho, F, st) {
  cx.save(); cx.translate(x, y); cx.scale(e, e);
  cx.strokeStyle = F(SKIN_OUT); cx.lineWidth = 3.2; cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(-6, 5); cx.lineTo(6, -4); cx.moveTo(-6, -4); cx.lineTo(6, 5); cx.stroke();
  cx.strokeStyle = F(cor); cx.lineWidth = 1.6; cx.stroke();
  cx.fillStyle = F(cor); cx.beginPath(); cx.arc(0, -1, 4, 0, TAU); cx.fill(); st(1.2);
  cx.beginPath(); cx.rect(-2.2, 2, 4.4, 2.8); cx.fill(); st(1);
  cx.fillStyle = F(olho); cx.beginPath(); cx.arc(-1.6, -1, 1.2, 0, TAU); cx.arc(1.6, -1, 1.2, 0, TAU); cx.fill();
  cx.restore();
}
function drawPirataShip(x, y, s, c1, c2, tilt, flash, skin) {
  const C = pirataCor(skin, c1, c2), D = C.deco, t = performance.now() / 1000, { F, st } = naveKit(C, flash);
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  naveAura(C, flash, t, 33, 0);
  naveMotor(C, flash, 0, 25, 4.5, 10, t, 4);
  // bandeira tremulando na popa
  const bw = Math.sin(t * 7);
  cx.fillStyle = F('#1c1c1c');
  cx.beginPath(); cx.moveTo(1, 20); cx.quadraticCurveTo(7, 22 + bw * 2, 13, 21 + bw * 3); cx.lineTo(12, 27 + bw * 2); cx.quadraticCurveTo(7, 27 - bw, 1, 25); cx.closePath(); cx.fill(); st(1.2);
  if (!flash) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(7.5, 23.5 + bw, 1.3, 0, TAU); cx.fill(); }
  // velas laterais (asas) com varetas, batendo devagar
  const ab = .88 + .12 * Math.sin(t * 3.2);
  for (const sd of [-1, 1]) {
    const X = v => sd * v * ab;
    cx.fillStyle = F(C.asa);
    cx.beginPath(); cx.moveTo(sd * 9, -4); cx.lineTo(X(33), 6); cx.quadraticCurveTo(X(29), 10, X(31), 15); cx.quadraticCurveTo(X(24), 12, X(22), 17); cx.quadraticCurveTo(X(16), 12, sd * 10, 14); cx.closePath(); cx.fill(); st(1.8);
    if (!flash) {
      cx.strokeStyle = C.contorno ? SKIN_OUT : 'rgba(0,0,0,.3)'; cx.lineWidth = 1.1;
      cx.beginPath(); cx.moveTo(sd * 10, 0); cx.lineTo(X(31), 14); cx.moveTo(sd * 10, 4); cx.lineTo(X(22), 16); cx.stroke();
      naveListra(C, [[sd * 11, -2], [X(31), 7]], t);
      naveEnfeite(C, X(33), 6, sd * 1.3, 1, t);
    }
    // canhões saindo do casco
    for (const cy of [-10, -2, 6]) {
      cx.fillStyle = F('#3a3a3a'); cx.beginPath(); cx.rect(sd * 11.5 + (sd < 0 ? -6 : 0), cy - 1.6, 6, 3.2); cx.fill(); st(1);
    }
  }
  // casco com carranca na proa
  cx.fillStyle = F(C.casco);
  cx.beginPath(); cx.moveTo(0, -28); cx.quadraticCurveTo(14, -18, 13.5, 2); cx.quadraticCurveTo(13, 17, 7, 22); cx.lineTo(-7, 22); cx.quadraticCurveTo(-13, 17, -13.5, 2); cx.quadraticCurveTo(-14, -18, 0, -28); cx.closePath(); cx.fill(); st(2);
  // convés com tábuas
  cx.fillStyle = F(C.conves);
  cx.beginPath(); cx.moveTo(0, -22); cx.quadraticCurveTo(10, -14, 10, 2); cx.quadraticCurveTo(10, 14, 5, 18); cx.lineTo(-5, 18); cx.quadraticCurveTo(-10, 14, -10, 2); cx.quadraticCurveTo(-10, -14, 0, -22); cx.closePath(); cx.fill();
  if (!flash) {
    cx.strokeStyle = 'rgba(36,22,12,.3)'; cx.lineWidth = 1; cx.beginPath();
    for (const px of [-5, 0, 5]) { cx.moveTo(px, -16 + Math.abs(px)); cx.lineTo(px, 17); } cx.stroke();
    if (D.costelas) naveListra(Object.assign({}, C, { estilo: 'espectro' }), [[0, -14], [0, 16]], t);
    if (D.rebites) for (const [rx, ry] of [[-9, -6], [9, -6], [-10, 8], [10, 8]]) naveEnfeite(Object.assign({}, C, { estilo: 'sucata' }), rx, ry, 0, .55, t);
  }
  // lanterna da popa
  if (!flash) { cx.globalAlpha = .4 + .2 * Math.sin(t * 5); cx.fillStyle = C.brilho; cx.beginPath(); cx.arc(0, 17, 4.5, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
  cx.fillStyle = F('#ffe08a'); cx.beginPath(); cx.arc(0, 17, 1.8, 0, TAU); cx.fill(); st(1);
  // carranca (cabeça entalhada na ponta)
  caveira(0, -27, .55, C.enfeite, C.olhos, F, st);
  // velas que enchem de vento
  const enche = 2.5 + 1.5 * Math.sin(t * 2.4);
  const vela = (y0, w, h, rasgo) => {
    cx.fillStyle = F(C.vela);
    cx.beginPath(); cx.moveTo(-w, y0); cx.quadraticCurveTo(0, y0 - enche - 2, w, y0); cx.lineTo(w * .92, y0 + h);
    if (rasgo && !flash) { cx.lineTo(w * .6, y0 + h - 3); cx.lineTo(w * .45, y0 + h + 1); }
    cx.quadraticCurveTo(0, y0 + h - enche, -w * .92, y0 + h); cx.closePath(); cx.fill(); st(1.6);
    if (!flash) { cx.strokeStyle = 'rgba(36,22,12,.25)'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(-w * .85, y0 + h * .55); cx.quadraticCurveTo(0, y0 + h * .55 - enche, w * .85, y0 + h * .55); cx.stroke(); }
  };
  vela(-17, 11, 6, false);
  vela(-5, 19, 10, D.rasgada);
  if (D.remendo && !flash) { cx.fillStyle = C.enfeite; cx.save(); cx.translate(-12, 0); cx.rotate(-.15); cx.fillRect(-2.5, -2, 5, 4); cx.strokeStyle = SKIN_OUT; cx.lineWidth = .8; cx.strokeRect(-2.5, -2, 5, 4); cx.restore(); }
  // emblema na vela grande
  const em = D.emblema || 'caveira';
  if (em === 'caveira' || em === 'chama' || !C.estilo) caveira(0, 0, .75, C.emblema, C.olhos, F, st);
  else if (!flash) naveEnfeite(C, 0, 1.5, 0, 1.4, t);
  // cesto da gávea
  cx.fillStyle = F(C.conves); cx.beginPath(); cx.arc(0, -11, 2.4, 0, TAU); cx.fill(); st(1.2);
  cx.restore();
}

// ---------- Cores do dragão de água por skin ----------
const DRAGAO_COR = {
  classic:  { corpo: '#2f8fd8', barriga: '#9fe6ff', crista: '#1f5fa0', olho: '#ffe14d', agua: '#8fe6ff', chifre: '#e8f8ff', estilo: 'agua' },
  sucata:   { corpo: '#8A8F96', barriga: '#E08A2E', crista: '#5a5f68', olho: '#7FD3E8', agua: '#9fd8ff', chifre: '#C9B27A', estilo: 'sucata' },
  bosque:   { corpo: '#5DAE4A', barriga: '#c8e89a', crista: '#3E8A3A', olho: '#F4C542', agua: '#a8f0c0', chifre: '#9B6A3C', estilo: 'folhas' },
  garra:    { corpo: '#4A4E55', barriga: '#c9ccd1', crista: '#C2362B', olho: '#F2A33A', agua: '#cfe6ff', chifre: '#c9ccd1', estilo: 'espinhos' },
  geada:    { corpo: '#8FD8F2', barriga: '#ffffff', crista: '#2F6FB5', olho: '#C9A8FF', agua: '#dff6ff', chifre: '#ffffff', estilo: 'gelo' },
  lamina:   { corpo: '#F4F1E6', barriga: '#F2C230', crista: '#2A55B8', olho: '#7FD3E8', agua: '#bfe9ff', chifre: '#F2C230', estilo: 'dourado' },
  vazio:    { corpo: '#5a2a86', barriga: '#8CF04A', crista: '#2a1240', olho: '#8CF04A', agua: '#b8ff8a', chifre: '#8CF04A', estilo: 'chamas' },
  espectro: { corpo: '#EDE3C8', barriga: '#7CF5C8', crista: '#cfc4a6', olho: '#7CF5C8', agua: '#a8ffe0', chifre: '#EDE3C8', estilo: 'ossos' },
  dragao:   { corpo: '#B8231A', barriga: '#FFC23D', crista: '#7a1610', olho: '#FFE14D', agua: '#ffcf8a', chifre: '#FFE14D', estilo: 'lava' },
};
function dragaoCor(skin) { return DRAGAO_COR[skin] || DRAGAO_COR.classic; }

// ---------- Dragão de água ----------
function drawDragao(p, x, y, sc, skin, rastro, t) {
  const C = dragaoCor(skin), O = PIRATA_OUT, N = 10;
  x = x === undefined ? p.x : x; y = y === undefined ? p.y : y; sc = sc || PIRATA.dragao.escala;
  t = t === undefined ? titleT : t; rastro = rastro || (p && p.rastro) || [];
  const segs = [];
  for (let k = 0; k < N; k++) {
    const rx = rastro[Math.min(rastro.length - 1, k * 3)];
    const ox = (rx !== undefined ? (rx - x) * .8 : 0) + Math.sin(t * 6 - k * .8) * 6 * k / N;
    segs.push({ x: x + ox * sc, y: y + (6 + k * 8.5) * sc, r: (12.5 - k * .9) * sc });
  }
  cx.save();
  // aura de água (defesa)
  cx.globalAlpha = .22 + .08 * Math.sin(t * 8); cx.fillStyle = C.agua;
  cx.beginPath(); cx.arc(x, y + 22 * sc, 46 * sc, 0, TAU); cx.fill(); cx.globalAlpha = 1;
  // nadadeiras
  for (const s of [-1, 1]) {
    const b = segs[2], ab = Math.sin(t * 7) * .25;
    cx.save(); cx.translate(b.x + s * b.r * .7, b.y); cx.rotate(s * (.5 + ab));
    cx.fillStyle = C.crista; cx.strokeStyle = O; cx.lineWidth = 2.5 * sc; cx.lineJoin = 'round';
    cx.beginPath(); cx.moveTo(0, -4 * sc); cx.quadraticCurveTo(s * 26 * sc, -10 * sc, s * 30 * sc, 10 * sc); cx.quadraticCurveTo(s * 16 * sc, 4 * sc, 0, 8 * sc); cx.closePath(); cx.fill(); cx.stroke();
    if (C.estilo === 'ossos') { cx.strokeStyle = C.chifre; cx.lineWidth = 2 * sc; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(s * 26 * sc, 4 * sc); cx.stroke(); }
    cx.restore();
  }
  // corpo: contorno, cor, barriga
  for (let k = N - 1; k >= 0; k--) { const g = segs[k]; cx.fillStyle = O; cx.beginPath(); cx.arc(g.x, g.y, g.r + 2.5 * sc, 0, TAU); cx.fill(); }
  for (let k = N - 1; k >= 0; k--) {
    const g = segs[k];
    cx.fillStyle = C.corpo; cx.globalAlpha = C.estilo === 'ossos' ? .75 : 1;
    cx.beginPath(); cx.arc(g.x, g.y, g.r, 0, TAU); cx.fill(); cx.globalAlpha = 1;
    cx.fillStyle = C.barriga; cx.beginPath(); cx.arc(g.x, g.y, g.r * .45, 0, TAU); cx.fill();
    // detalhes de cada skin
    if (C.estilo === 'ossos') { cx.strokeStyle = C.chifre; cx.lineWidth = 2.2 * sc; cx.beginPath(); cx.moveTo(g.x - g.r * .9, g.y); cx.lineTo(g.x + g.r * .9, g.y); cx.stroke(); }
    else if (C.estilo === 'lava' && k % 2) { cx.strokeStyle = '#FFB52E'; cx.lineWidth = 1.6 * sc; cx.beginPath(); cx.moveTo(g.x - g.r * .7, g.y - g.r * .3); cx.lineTo(g.x - g.r * .1, g.y + g.r * .2); cx.lineTo(g.x + g.r * .5, g.y - g.r * .2); cx.stroke(); }
    else if (C.estilo === 'sucata') { cx.fillStyle = C.chifre; for (const s of [-1, 1]) { cx.beginPath(); cx.arc(g.x + s * g.r * .65, g.y, 1.6 * sc, 0, TAU); cx.fill(); } }
    else if (C.estilo === 'dourado' && k % 3 === 1) { cx.strokeStyle = C.chifre; cx.lineWidth = 2.5 * sc; cx.beginPath(); cx.arc(g.x, g.y, g.r * .8, 0, TAU); cx.stroke(); }
    else if (C.estilo === 'agua' && k % 3 === 2) { cx.fillStyle = 'rgba(255,255,255,.7)'; cx.beginPath(); cx.arc(g.x + g.r * .4, g.y - g.r * .4, 2 * sc, 0, TAU); cx.fill(); }
  }
  // crista nas costas (alternada)
  for (let k = 1; k < N - 1; k++) {
    const g = segs[k], s = k % 2 ? 1 : -1, h = (C.estilo === 'espinhos' || C.estilo === 'gelo' ? 11 : 7) * sc * (1 - k / N * .5);
    cx.fillStyle = C.estilo === 'gelo' ? '#ffffff' : C.estilo === 'folhas' ? (k % 3 ? '#7CCB5C' : '#F4F06A') : C.estilo === 'chamas' ? C.barriga : C.crista;
    cx.strokeStyle = O; cx.lineWidth = 2 * sc;
    cx.beginPath(); cx.moveTo(g.x + s * g.r * .6, g.y - 3 * sc); cx.lineTo(g.x + s * (g.r + h), g.y + 1 * sc); cx.lineTo(g.x + s * g.r * .6, g.y + 5 * sc); cx.closePath(); cx.fill(); cx.stroke();
  }
  // cauda
  const ul = segs[N - 1];
  cx.fillStyle = C.estilo === 'chamas' ? C.barriga : C.crista; cx.strokeStyle = O; cx.lineWidth = 2.5 * sc;
  cx.beginPath(); cx.moveTo(ul.x, ul.y); cx.quadraticCurveTo(ul.x - 14 * sc, ul.y + 14 * sc, ul.x - 6 * sc, ul.y + 22 * sc);
  cx.lineTo(ul.x, ul.y + 12 * sc); cx.lineTo(ul.x + 6 * sc, ul.y + 22 * sc); cx.quadraticCurveTo(ul.x + 14 * sc, ul.y + 14 * sc, ul.x, ul.y); cx.fill(); cx.stroke();
  // cabeça
  cx.translate(x, y - 6 * sc); cx.scale(sc, sc);
  cx.lineJoin = 'round'; cx.strokeStyle = O; cx.lineWidth = 3;
  for (const s of [-1, 1]) { // chifres
    cx.fillStyle = C.chifre;
    cx.beginPath(); cx.moveTo(s * 6, -4); cx.quadraticCurveTo(s * 20, 0, s * 22, 16); cx.quadraticCurveTo(s * 14, 6, s * 3, 2); cx.closePath(); cx.fill(); cx.stroke();
  }
  cx.fillStyle = C.corpo; // focinho
  cx.beginPath(); cx.moveTo(0, -30); cx.quadraticCurveTo(13, -24, 13, -6); cx.quadraticCurveTo(13, 8, 0, 10); cx.quadraticCurveTo(-13, 8, -13, -6); cx.quadraticCurveTo(-13, -24, 0, -30); cx.fill(); cx.stroke();
  cx.fillStyle = C.agua; cx.globalAlpha = .85 + .15 * Math.sin(t * 20); // boca brilhando de água
  cx.beginPath(); cx.ellipse(0, -27, 5, 3.5, 0, 0, TAU); cx.fill(); cx.globalAlpha = 1;
  cx.fillStyle = C.barriga; cx.beginPath(); cx.ellipse(0, -14, 5, 8, 0, 0, TAU); cx.fill();
  for (const s of [-1, 1]) { // olhos
    cx.fillStyle = C.olho; cx.beginPath(); cx.ellipse(s * 7, -10, 3.6, 4.6, s * .3, 0, TAU); cx.fill(); cx.lineWidth = 2; cx.stroke();
    cx.fillStyle = O; cx.beginPath(); cx.ellipse(s * 7.4, -10, 1.2, 3, 0, 0, TAU); cx.fill();
  }
  // bigodes de água
  cx.strokeStyle = C.agua; cx.lineWidth = 2;
  for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(s * 10, -22); cx.quadraticCurveTo(s * 22, -26 + Math.sin(t * 9) * 3, s * 26, -14); cx.stroke(); }
  cx.restore();
}
// faíscas do dragão: bolhas, gelo, chamas… conforme a skin
function dragaoRastro(p, dt) {
  p.drT = (p.drT || 0) - dt; if (p.drT > 0) return;
  p.drT = .05;
  const C = dragaoCor(p.skin), sk = skinById(p.skin);
  S.fx.push({ type: 'trail', k: sk.trail || 'mist', x: p.x + rnd(-10, 10), y: p.y + 90, vx: rnd(-20, 20), vy: rnd(60, 110), t: 0, life: rnd(.3, .5), r: rnd(2.5, 4.5), color: sk.tcol || C.agua, rot: rnd(0, 6) });
}

// ---------- Âncora e corrente ----------
function corAncora(skin) { const s = PIRATA_SKIN[skin]; return s ? s.pal.enfeite : '#c9ccd1'; }
function drawAncora(b) {
  const o = b.p, ox = o.x, oy = o.y - 14, dx = b.x - ox, dy = b.y - oy, dd = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx), metal = corAncora(b.sk);
  // corrente: elos alternados
  cx.save();
  for (let s = 8, k = 0; s < dd - 10; s += 9, k++) {
    const x = ox + dx / dd * s, y = oy + dy / dd * s;
    cx.save(); cx.translate(x, y); cx.rotate(ang + (k % 2 ? Math.PI / 2 : 0));
    cx.strokeStyle = PIRATA_OUT; cx.lineWidth = 4.2; cx.beginPath(); cx.ellipse(0, 0, 5.5, k % 2 ? 2 : 3.2, 0, 0, TAU); cx.stroke();
    cx.strokeStyle = '#8a929c'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(0, 0, 5.5, k % 2 ? 2 : 3.2, 0, 0, TAU); cx.stroke();
    cx.restore();
  }
  // âncora (as pontas viradas para a frente)
  cx.translate(b.x, b.y); cx.rotate(ang + Math.PI / 2 + (b.ret ? Math.PI : 0));
  cx.rotate(b.ret ? 0 : Math.sin(b.age * 30) * .08);
  cx.strokeStyle = PIRATA_OUT; cx.lineJoin = 'round'; cx.lineCap = 'round';
  const forma = () => {
    cx.beginPath(); cx.moveTo(0, 14); cx.lineTo(0, -12);           // haste
    cx.moveTo(-7, 8); cx.lineTo(7, 8);                               // trava
    cx.moveTo(-13, -6); cx.quadraticCurveTo(-12, -16, 0, -16); cx.quadraticCurveTo(12, -16, 13, -6); // braços
  };
  cx.lineWidth = 9; forma(); cx.stroke();
  cx.strokeStyle = b.explo ? '#ffb347' : metal; cx.lineWidth = 4.5; forma(); cx.stroke();
  for (const s of [-1, 1]) { // pontas
    cx.fillStyle = b.explo ? '#ffb347' : metal; cx.lineWidth = 2.5; cx.strokeStyle = PIRATA_OUT;
    cx.beginPath(); cx.moveTo(s * 13, -6); cx.lineTo(s * 18, -4); cx.lineTo(s * 12, -13); cx.closePath(); cx.fill(); cx.stroke();
  }
  cx.fillStyle = metal; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(0, 17, 4, 0, TAU); cx.fill(); cx.stroke(); // argola
  cx.restore();
}

// ---------- Balas piratas ----------
function drawPirataBala(b) {
  if (b.type === 'anchor') { drawAncora(b); return true; }
  if (b.type === 'cannon') {
    cx.fillStyle = PIRATA_OUT; cx.beginPath(); cx.arc(b.x, b.y, b.r + 1.5, 0, TAU); cx.fill();
    cx.fillStyle = b.explo ? '#ff9a30' : '#3a3a3a'; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.arc(b.x - b.r * .35, b.y - b.r * .35, b.r * .35, 0, TAU); cx.fill();
    return true;
  }
  if (b.type === 'jet') {
    const a = Math.atan2(b.vx, -b.vy);
    cx.save(); cx.translate(b.x, b.y); cx.rotate(a);
    cx.globalAlpha = .55; cx.fillStyle = b.color; cx.beginPath(); cx.ellipse(0, 4, b.r * 1.4, b.r * 3, 0, 0, TAU); cx.fill();
    cx.globalAlpha = 1; cx.fillStyle = '#ffffff'; cx.beginPath(); cx.ellipse(0, 0, b.r * .6, b.r * 1.6, 0, 0, TAU); cx.fill();
    cx.restore(); return true;
  }
  if (b.type === 'barrel') {
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.rot);
    cx.fillStyle = '#a0662e'; cx.strokeStyle = PIRATA_OUT; cx.lineWidth = 3;
    roundRect(-10, -13, 20, 26, 6); cx.fill(); cx.stroke();
    cx.strokeStyle = '#4a4e55'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(-10, -6); cx.lineTo(10, -6); cx.moveTo(-10, 6); cx.lineTo(10, 6); cx.stroke();
    cx.fillStyle = '#1c1c1c'; cx.font = '800 9px system-ui,sans-serif'; cx.textAlign = 'center'; cx.fillText('TNT', 0, 3.5);
    const pisca = b.life < .8 && Math.floor(b.life * 12) % 2;
    cx.fillStyle = pisca ? '#ff4a2a' : '#ffe066'; cx.beginPath(); cx.arc(0, -16, 3 + Math.random() * 1.5, 0, TAU); cx.fill(); // pavio
    cx.restore(); return true;
  }
  if (b.type === 'wave') {
    const a = clamp(1 - b.R / (Math.hypot(W, H) + 60), 0, 1);
    cx.save();
    cx.globalAlpha = .45 * a + .1; cx.strokeStyle = b.color; cx.lineWidth = 26;
    cx.beginPath(); cx.arc(b.x, b.y, b.R, 0, TAU); cx.stroke();
    cx.globalAlpha = .8 * a + .15; cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.setLineDash([18, 10]); cx.lineDashOffset = -b.R * .3;
    cx.beginPath(); cx.arc(b.x, b.y, b.R + 12, 0, TAU); cx.stroke();
    cx.restore(); return true;
  }
  if (b.type === 'whirl') {
    const a = Math.min(1, b.life / .4, (b.dura - b.life) / .3 + .2);
    cx.save(); cx.translate(b.x, b.y); cx.globalAlpha = .28 * a; cx.fillStyle = '#5fc8e8';
    cx.beginPath(); cx.arc(0, 0, b.R, 0, TAU); cx.fill();
    cx.globalAlpha = .85 * a; cx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      cx.rotate(Math.PI / 2);
      cx.strokeStyle = k % 2 ? '#ffffff' : '#9fe6ff'; cx.lineWidth = 5;
      cx.beginPath();
      for (let s = 0; s <= 20; s++) { const u = s / 20, r = b.R * (1 - u * .85), an = b.rot + u * 3.2; s ? cx.lineTo(Math.cos(an) * r, Math.sin(an) * r) : cx.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
      cx.stroke();
    }
    cx.restore(); return true;
  }
  return false;
}

// ---------- Papagaios ----------
function drawPapagaio(x, y, dir, flap, s) {
  s = s || 1;
  cx.save(); cx.translate(x, y); cx.rotate(dir + Math.PI / 2); cx.scale(s, s);
  cx.strokeStyle = PIRATA_OUT; cx.lineWidth = 2; cx.lineJoin = 'round';
  const asa = Math.sin(flap) * .5;
  for (const k of [-1, 1]) { // asas
    cx.save(); cx.rotate(k * (.3 + asa));
    cx.fillStyle = k < 0 ? '#2a7fd0' : '#e8c22a';
    cx.beginPath(); cx.moveTo(0, -2); cx.quadraticCurveTo(k * 16, 0, k * 14, 10); cx.quadraticCurveTo(k * 6, 6, 0, 6); cx.closePath(); cx.fill(); cx.stroke();
    cx.restore();
  }
  cx.fillStyle = '#d93a2a'; cx.beginPath(); cx.moveTo(-3, 8); cx.lineTo(0, 18); cx.lineTo(3, 8); cx.closePath(); cx.fill(); cx.stroke(); // cauda
  cx.fillStyle = '#3fbf4f'; cx.beginPath(); cx.ellipse(0, 2, 5, 8, 0, 0, TAU); cx.fill(); cx.stroke(); // corpo
  cx.fillStyle = '#d93a2a'; cx.beginPath(); cx.arc(0, -7, 5, 0, TAU); cx.fill(); cx.stroke(); // cabeça
  cx.fillStyle = '#ffe066'; cx.beginPath(); cx.moveTo(-2.5, -10); cx.quadraticCurveTo(0, -17, 2.5, -10); cx.closePath(); cx.fill(); cx.stroke(); // bico
  cx.fillStyle = '#fff'; for (const k of [-1, 1]) { cx.beginPath(); cx.arc(k * 2.6, -7.5, 1.5, 0, TAU); cx.fill(); }
  cx.restore();
}
function drawPapagaios(p) {
  for (const w of p.weapons) if (w.type === 'parrot' && w.birds) for (let k = 0; k < w.shots; k++) {
    const bd = w.birds[k]; if (bd) drawPapagaio(bd.x, bd.y, bd.dir || -Math.PI / 2, bd.flap, 1);
  }
}

// ---------- Inimigos lentos (Onda) ----------
function drawLentos() {
  const lista = S.enemies.concat(S.bosses || []);
  for (const e of lista) {
    if (e.dead || !(e.slowT > 0)) continue;
    const a = Math.min(1, e.slowT);
    cx.save(); cx.globalAlpha = .28 * a; cx.fillStyle = '#6fd6ff';
    cx.beginPath(); cx.arc(e.x, e.y, e.r + 5, 0, TAU); cx.fill();
    cx.globalAlpha = .8 * a; cx.strokeStyle = '#dff6ff'; cx.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) {
      const u = (e.t * .8 + k / 3) % 1;
      cx.beginPath(); cx.arc(e.x + Math.sin(k * 2.1 + e.t * 3) * e.r * .7, e.y + e.r * .6 - u * e.r * 1.6, 2 + k, 0, TAU); cx.stroke();
    }
    cx.restore();
  }
}

// ---------- Prévia no hangar (âncora indo e voltando) ----------
function drawPirataPreview(x, y) {
  const ph = (titleT * .9) % 1, d = Math.sin(ph * Math.PI) * 44;
  const b = { p: { x, y: y + 14 }, x: x + Math.sin(titleT * 2) * 6, y: y - d - 8, ret: ph > .5, age: titleT, sk: null, explo: 0 };
  drawAncora(b);
}
