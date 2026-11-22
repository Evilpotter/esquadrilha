// ---------- Âncora Negra: desenho (nave, âncora, armas piratas e dragão de água) ----------
// A nave "Original" é montada aqui com as cores do jogador (pirataSVG). As skins ficam em
// arte/naves/pirata/<skin>.svg (geradas por ferramentas/arte/pirata.js a partir desta mesma função).
// O dragão é desenhado no canvas porque o corpo ondula e segue a nave.
const PIRATA_OUT = '#24160c';

// ---------- Nave (SVG) ----------
// pal: casco, convés, vela, asa, enfeite, emblema · deco: emblema e pontas das asas de cada skin
function pirataSVG(pal, deco) {
  deco = deco || {};
  const O = PIRATA_OUT, st = `stroke="${O}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const casco = 'M100 14 C126 34 140 74 139 126 C138 166 128 192 114 198 L86 198 C72 192 62 166 61 126 C60 74 74 34 100 14 Z';
  const asaE = 'M64 110 L16 138 L10 162 L30 160 L66 148 Z', asaD = 'M136 110 L184 138 L190 162 L170 160 L134 148 Z';
  let g = '';
  // gurupés (ponta da frente)
  g += `<path d="M100 18 L100 -2" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M100 18 L100 -2" stroke="${pal.enfeite}" stroke-width="4" stroke-linecap="round"/>`;
  // asas
  g += `<path d="${asaE}" fill="${pal.asa}" ${st}/><path d="${asaD}" fill="${pal.asa}" ${st}/>`;
  g += `<path d="M58 126 L22 148 M142 126 L178 148" stroke="#fff" stroke-opacity=".3" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  g += pontasAsas(deco.pontas, pal);
  // canhões
  for (const [x, y] of [[46, 118], [48, 146], [138, 118], [136, 146]])
    g += `<rect x="${x}" y="${y}" width="16" height="10" rx="3" fill="#3a3a3a" stroke="${O}" stroke-width="3.5"/>`;
  // casco, convés e tábuas
  g += `<path d="${casco}" fill="${pal.casco}" ${st}/>`;
  g += `<path d="${casco}" fill="${pal.conves}" transform="translate(100 118) scale(.76 .8) translate(-100 -118)"/>`;
  g += `<path d="M90 50 L90 186 M110 50 L110 186 M100 40 L100 190" stroke="${O}" stroke-opacity=".28" stroke-width="2.5" fill="none"/>`;
  if (deco.rebites) for (const [x, y] of [[70, 80], [130, 80], [66, 120], [134, 120], [70, 170], [130, 170]]) g += `<circle cx="${x}" cy="${y}" r="3.2" fill="${pal.enfeite}" stroke="${O}" stroke-width="1.5"/>`;
  if (deco.costelas) g += `<path d="M72 70 Q100 82 128 70 M66 132 Q100 146 134 132 M68 160 Q100 174 132 160" stroke="${pal.enfeite}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  // bandeira na popa
  g += `<path d="M100 180 Q114 188 130 184 Q120 198 100 196 Z" fill="#1c1c1c" ${st.replace('5', '3.5')}/><circle cx="115" cy="189" r="3" fill="#fff"/>`;
  // velas
  const rasgo = deco.rasgada ? ' L150 118 L144 110 L138 119 L120 112 L112 118' : '';
  g += `<path d="M60 56 Q100 40 140 56 L136 74 Q100 62 64 74 Z" fill="${pal.vela}" ${st}/>`;
  g += `<path d="M34 94 Q100 70 166 94 L160 122${rasgo} Q100 102 40 122 Z" fill="${pal.vela}" ${st}/>`;
  g += `<path d="M42 116 Q100 98 158 116" stroke="${O}" stroke-opacity=".25" stroke-width="4" fill="none"/>`;
  if (deco.remendo) g += `<rect x="50" y="98" width="18" height="13" fill="${pal.enfeite}" stroke="${O}" stroke-width="2.5" transform="rotate(-8 59 104)"/><path d="M52 100 l3 3 M60 98 l3 3" stroke="${O}" stroke-width="1.5"/>`;
  g += `<circle cx="100" cy="64" r="5" fill="${pal.enfeite}" stroke="${O}" stroke-width="3"/>`;
  g += emblema(deco.emblema || 'caveira', 100, 100, pal);
  return { vb: [0, -6, 200, 210], pv: [100, 110], g };
}
function pontasAsas(tipo, pal) {
  const O = PIRATA_OUT, st = `stroke="${O}" stroke-width="3" stroke-linejoin="round"`;
  const par = s => s + s.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => (200 - x) + ' ' + y);
  if (tipo === 'espinhos') return par(`<path d="M16 138 L2 128 L18 146 Z M12 150 L-2 150 L12 158 Z" fill="${pal.enfeite}" ${st}/>`);
  if (tipo === 'folhas') return par(`<path d="M14 150 Q-6 138 4 124 Q20 132 14 150 Z" fill="${pal.enfeite}" ${st}/>`);
  if (tipo === 'gelo') return par(`<path d="M14 140 L0 120 L22 136 Z M12 156 L-4 162 L14 162 Z" fill="#ffffff" ${st}/>`);
  if (tipo === 'lamina') return par(`<path d="M12 160 L-2 172 L30 160 Z" fill="${pal.enfeite}" ${st}/>`);
  if (tipo === 'chamas') return par(`<path d="M12 160 Q2 146 10 136 Q14 150 22 150 Q20 140 28 134 Q32 152 24 160 Z" fill="${pal.enfeite}" ${st}/>`);
  if (tipo === 'ossos') return par(`<path d="M30 152 L18 140 M44 146 L34 132 M56 140 L50 126" stroke="${pal.enfeite}" stroke-width="5" stroke-linecap="round"/>`);
  if (tipo === 'morcego') return par(`<path d="M64 112 L22 128 M66 130 L16 150 M66 146 L30 160" stroke="${O}" stroke-width="3" fill="none"/>`);
  return '';
}
function emblema(tipo, x, y, pal) {
  const O = PIRATA_OUT, c = pal.emblema;
  if (tipo === 'engrenagem') {
    let d = '';
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; d += `<rect x="${x - 3}" y="${y - 15}" width="6" height="8" fill="${c}" stroke="${O}" stroke-width="2" transform="rotate(${a * 180 / Math.PI} ${x} ${y})"/>`; }
    return d + `<circle cx="${x}" cy="${y}" r="10" fill="${c}" stroke="${O}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3.5" fill="${O}"/>`;
  }
  if (tipo === 'folha') return `<path d="M${x} ${y - 13} Q${x + 13} ${y} ${x} ${y + 13} Q${x - 13} ${y} ${x} ${y - 13} Z" fill="${c}" stroke="${O}" stroke-width="3"/><path d="M${x} ${y - 10} L${x} ${y + 10}" stroke="${O}" stroke-width="2"/>`;
  if (tipo === 'garra') return `<path d="M${x - 9} ${y + 9} Q${x - 12} ${y - 6} ${x - 4} ${y - 13} Q${x - 4} ${y} ${x - 2} ${y + 9} Z M${x - 1} ${y + 9} Q${x - 2} ${y - 8} ${x + 5} ${y - 14} Q${x + 3} ${y} ${x + 6} ${y + 9} Z M${x + 6} ${y + 9} Q${x + 8} ${y - 4} ${x + 13} ${y - 8} Q${x + 11} ${y + 2} ${x + 12} ${y + 9} Z" fill="${c}" stroke="${O}" stroke-width="2.5"/>`;
  if (tipo === 'floco') return `<path d="M${x} ${y - 13} L${x} ${y + 13} M${x - 11} ${y - 6} L${x + 11} ${y + 6} M${x - 11} ${y + 6} L${x + 11} ${y - 6}" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M${x} ${y - 13} L${x} ${y + 13} M${x - 11} ${y - 6} L${x + 11} ${y + 6} M${x - 11} ${y + 6} L${x + 11} ${y - 6}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (tipo === 'sol') {
    let d = '';
    for (let k = 0; k < 8; k++) d += `<path d="M${x} ${y - 16} L${x + 3} ${y - 9} L${x - 3} ${y - 9} Z" fill="${c}" stroke="${O}" stroke-width="1.5" transform="rotate(${k * 45} ${x} ${y})"/>`;
    return d + `<circle cx="${x}" cy="${y}" r="8" fill="${c}" stroke="${O}" stroke-width="3"/>`;
  }
  if (tipo === 'chama') return `<path d="M${x} ${y - 15} Q${x + 12} ${y - 2} ${x + 7} ${y + 10} Q${x} ${y + 15} ${x - 7} ${y + 10} Q${x - 12} ${y - 2} ${x - 3} ${y - 8} Q${x - 1} ${y} ${x + 2} ${y - 2} Q${x + 4} ${y - 9} ${x} ${y - 15} Z" fill="${c}" stroke="${O}" stroke-width="3"/>`;
  if (tipo === 'dragao') return `<path d="M${x - 12} ${y + 8} Q${x - 14} ${y - 6} ${x - 6} ${y - 10} L${x - 10} ${y - 18} L${x - 1} ${y - 11} L${x + 1} ${y - 11} L${x + 10} ${y - 18} L${x + 6} ${y - 10} Q${x + 14} ${y - 6} ${x + 12} ${y + 8} Q${x} ${y + 14} ${x - 12} ${y + 8} Z" fill="${c}" stroke="${O}" stroke-width="3"/><circle cx="${x - 5}" cy="${y - 2}" r="2.4" fill="${O}"/><circle cx="${x + 5}" cy="${y - 2}" r="2.4" fill="${O}"/>`;
  // caveira (padrão); olhos coloridos se a skin pedir
  const olho = pal.olhos || O, ossos = `M${x - 15} ${y + 13} L${x + 15} ${y - 11} M${x - 15} ${y - 11} L${x + 15} ${y + 13}`;
  return `<path d="${ossos}" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="${ossos}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` +
    `<circle cx="${x}" cy="${y - 2}" r="10" fill="${c}" stroke="${O}" stroke-width="3"/><rect x="${x - 5.5}" y="${y + 5}" width="11" height="7" rx="2" fill="${c}" stroke="${O}" stroke-width="2.5"/>` +
    `<circle cx="${x - 4}" cy="${y - 2}" r="3" fill="${olho}"/><circle cx="${x + 4}" cy="${y - 2}" r="3" fill="${olho}"/>`;
}
// paleta e enfeites de cada skin (as skins ficam prontas em arte/naves/pirata/)
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

// nave "Original": desenho simples nas cores do jogador, no mesmo padrão das outras naves
// (formas chapadas, sem contorno; cabine azul-clara; detalhes brancos e vermelhos)
const PIRATA_TITULO = ['#c0563a', '#6e2a1c']; // tela inicial: casco vermelho-ferrugem
function drawPirataShip(x, y, s, c1, c2, tilt, flash) {
  cx.save(); cx.translate(x, y); cx.scale(s * (1 - Math.abs(tilt || 0) * .12), s);
  const body = flash ? '#fff' : c1, dk = flash ? '#fff' : c2, cl = (a, b) => flash ? '#fff' : (b || a);
  const fl = 5 + Math.sin(performance.now() / 40) * 2;
  // chama do motor na popa
  cx.fillStyle = '#ffb347'; cx.beginPath(); cx.moveTo(-4, 22); cx.lineTo(4, 22); cx.lineTo(0, 23 + fl * 1.6); cx.closePath(); cx.fill();
  // gurupés (ponta da frente)
  cx.fillStyle = dk; cx.fillRect(-1.5, -33, 3, 10);
  // asas
  cx.fillStyle = dk;
  cx.beginPath(); cx.moveTo(-9, 2); cx.lineTo(-27, 13); cx.lineTo(-25, 19); cx.lineTo(-9, 14); cx.closePath(); cx.fill();
  cx.beginPath(); cx.moveTo(9, 2); cx.lineTo(27, 13); cx.lineTo(25, 19); cx.lineTo(9, 14); cx.closePath(); cx.fill();
  // canhões dos lados
  cx.fillStyle = cl('#e8e8e8');
  for (const [sx, sy] of [[-16, -2], [-16, 7], [12, -2], [12, 7]]) cx.fillRect(sx, sy, 4, 4);
  // casco
  cx.fillStyle = body;
  cx.beginPath(); cx.moveTo(0, -26); cx.quadraticCurveTo(13, -16, 13, 4); cx.quadraticCurveTo(13, 18, 6, 22); cx.lineTo(-6, 22); cx.quadraticCurveTo(-13, 18, -13, 4); cx.quadraticCurveTo(-13, -16, 0, -26); cx.closePath(); cx.fill();
  // convés
  cx.fillStyle = dk; cx.beginPath(); cx.ellipse(0, 6, 6, 13, 0, 0, TAU); cx.fill();
  // vela (barra) com o emblema
  cx.fillStyle = cl('#f2ead8');
  cx.beginPath(); cx.moveTo(-21, -6); cx.quadraticCurveTo(0, -12, 21, -6); cx.lineTo(19, 1); cx.quadraticCurveTo(0, -5, -19, 1); cx.closePath(); cx.fill();
  cx.fillStyle = cl('#e74c3c'); cx.beginPath(); cx.arc(0, -4.5, 2.6, 0, TAU); cx.fill();
  // cabine
  cx.fillStyle = cl('#bfe6ff'); cx.beginPath(); cx.ellipse(0, -15, 3, 5, 0, 0, TAU); cx.fill();
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
