// ---------- Skins (só visual: não mudam vida, dano nem velocidade) ----------
const SKIN_OUT = '#24160c';
const RARITY = { base: ['Original', '#9fb3c8'], c: ['Comum', '#6FCF5A'], r: ['Raro', '#4EA3FF'], e: ['Épico', '#B57BFF'], l: ['Lendário', '#FF9A2E'] };
const SKINS = [
  { id: 'classic', name: 'Original', rar: 'base', how: 'Sempre disponível' },
  { id: 'sucata', name: 'Engenhoca de Sucata', rar: 'c', how: 'Sempre disponível', shot: '#ff9a3c', trail: 'puff', tcol: '#9a9a9a',
    pal: { wing: '#8A8F96', body: '#E08A2E', dark: '#5a5f68', ck: '#7FD3E8', trim: '#C9B27A' } },
  { id: 'bosque', name: 'Bosque Ancestral', rar: 'c', how: 'Chegar à fase 2', req: { phase: 2 }, shot: '#8ee05a', trail: 'leaf', tcol: '#5DAE4A',
    pal: { wing: '#5DAE4A', body: '#9B6A3C', dark: '#3E8A3A', ck: '#F4C542', trim: '#7CCB5C' } },
  { id: 'garra', name: 'Garra de Ferro', rar: 'r', how: 'Vencer o Colosso do Raio (chefão 3)', req: { boss: 'laser' }, shot: '#ff7a3a', trail: 'smoke', tcol: '#3a3a3a',
    pal: { wing: '#4A4E55', body: '#C2362B', dark: '#4A4E55', ck: '#F2A33A', trim: '#c9ccd1' } },
  { id: 'geada', name: 'Geada Arcana', rar: 'r', how: 'Vencer o Vórtice (chefão 4)', req: { boss: 'vortex' }, shot: '#9fe6ff', trail: 'snow', tcol: '#e8f8ff',
    pal: { wing: '#8FD8F2', body: '#2F6FB5', dark: '#2F6FB5', ck: '#C9A8FF', trim: '#ffffff' } },
  { id: 'lamina', name: 'Lâmina Dourada', rar: 'e', how: 'Vencer o Aríete (chefão 5)', req: { boss: 'ram' }, shot: '#ffe066', trail: 'spark', tcol: '#F2C230',
    pal: { wing: '#2A55B8', body: '#F4F1E6', dark: '#2A55B8', ck: '#7FD3E8', trim: '#F2C230' } },
  { id: 'vazio', name: 'Sombra do Vazio', rar: 'e', how: 'Vencer o Semeador (chefão 7)', req: { boss: 'sower' }, shot: '#8CF04A', trail: 'flame', tcol: '#8CF04A',
    pal: { wing: '#3a1a5c', body: '#5a2a86', dark: '#2a1240', ck: '#8CF04A', trim: '#8CF04A' } },
  { id: 'espectro', name: 'Espectro Ósseo', rar: 'e', how: 'Vencer o Fantasma (chefão 8)', req: { boss: 'ghost' }, shot: '#7CF5C8', trail: 'mist', tcol: '#7CF5C8',
    pal: { wing: '#7CF5C8', body: '#EDE3C8', dark: '#cfc4a6', ck: '#7CF5C8', trim: '#EDE3C8' } },
  { id: 'dragao', name: 'Brasa do Dragão', rar: 'l', how: 'Vencer a Tempestade (chefão 10)', req: { boss: 'storm' }, shot: '#ff8a2a', trail: 'ember', tcol: '#FF9A2E',
    pal: { wing: '#7a1610', body: '#B8231A', dark: '#7a1610', ck: '#FFE14D', trim: '#FFC23D' } },
];
function skinById(id) { return SKINS.find(s => s.id === id) || SKINS[0]; }

// ---------- Desbloqueios (gravados no navegador) ----------
const SKIN_KEY = 'esquadrilha.skins.v1';
function loadSkins() {
  try { const o = JSON.parse(localStorage.getItem(SKIN_KEY)); if (o && Array.isArray(o.unlocked)) return o; } catch (e) {}
  return { unlocked: ['classic', 'sucata'], last: ['classic', 'classic'] };
}
let skinSave = loadSkins();
function saveSkins() { try { localStorage.setItem(SKIN_KEY, JSON.stringify(skinSave)); } catch (e) {} }
function skinUnlocked(id) { return id === 'classic' || id === 'sucata' || skinSave.unlocked.includes(id); }
function unlockSkin(id) {
  if (skinUnlocked(id)) return;
  skinSave.unlocked.push(id); saveSkins();
  if (S && S.players) S.skinMsg = { t: 4.5, name: skinById(id).name };
}
function skinOnPhase(ph) { for (const sk of SKINS) if (sk.req && sk.req.phase && ph >= sk.req.phase) unlockSkin(sk.id); }
function skinOnBoss(kind) { for (const sk of SKINS) if (sk.req && sk.req.boss === kind) unlockSkin(sk.id); }
function skinRemember(pi, id) { skinSave.last = skinSave.last || ['classic', 'classic']; skinSave.last[pi] = id; saveSkins(); }
function skinLast(pi) { const id = (skinSave.last || [])[pi]; return id && skinUnlocked(id) ? id : 'classic'; }
function skinCycle(id, dir) {
  const list = SKINS.filter(s => skinUnlocked(s.id));
  const i = Math.max(0, list.findIndex(s => s.id === id));
  return list[(i + dir + list.length) % list.length].id;
}
function shotColor(p, w, base) {
  if (!p.skin || p.skin === 'classic' || w.type !== SHIPS[p.ship].weapon) return base;
  return skinById(p.skin).shot || base;
}

// ---------- Desenho das skins: Falcão usa a arte do hangar; Bumerangue e Artilheiro ganham versões próprias ----------
const SHAPES = {
  boomer: {
    wing: 'M100 22 L188 170 L136 154 L100 178 L64 154 L12 170 Z',
    body: 'M100 34 C112 60 116 110 112 150 L100 172 L88 150 C84 110 88 60 100 34 Z',
    bodyR: 'M100 34 C112 60 116 110 112 150 L100 172 Z',
    lead: [[100, 26, 16, 166], [100, 26, 184, 166]], tips: [[32, 158], [168, 158]], wc: [[64, 130], [136, 130]],
    nose: [100, 30], ck: [100, 86, 10, 17], spine: [56, 160], mouth: [100, 50, 20], props: [[100, 24, 34]],
  },
  arty: {
    wing: 'M18 94 L182 94 L192 128 L8 128 Z',
    booms: 'M58 46 L74 46 L76 192 L56 192 Z M126 46 L142 46 L144 192 L124 192 Z',
    tailbar: 'M54 178 L146 178 L146 194 L54 194 Z',
    body: 'M100 26 C120 26 124 70 122 110 L116 160 Q100 170 84 160 L78 110 C76 70 80 26 100 26 Z',
    bodyR: 'M100 26 C120 26 124 70 122 110 L116 160 Q108 166 100 167 Z',
    lead: [[84, 94, 18, 94], [116, 94, 182, 94]], tips: [[16, 110], [184, 110]], wc: [[42, 112], [158, 112]],
    nose: [100, 28], ck: [100, 62, 11, 16], spine: [80, 156], mouth: [100, 40, 24], props: [[66, 40, 26], [134, 40, 26]],
    engines: [[66, 46], [134, 46]],
  },
};
const f1 = v => Math.round(v * 10) / 10;
function leadPt(l, t, off) {
  const x = l[0] + (l[2] - l[0]) * t, y = l[1] + (l[3] - l[1]) * t;
  let nx = -(l[3] - l[1]), ny = l[2] - l[0]; const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
  if (nx * (x - 100) < 0 || (Math.abs(nx) < .01 && ny > 0)) { nx = -nx; ny = -ny; }
  return [x + nx * (off || 0), y + ny * (off || 0), nx, ny];
}
function line2(d, w, c) { return `<path d="${d}" fill="none" stroke="${SKIN_OUT}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function leadD(l, a, b, off) { const p = leadPt(l, a, off), q = leadPt(l, b, off); return `M${f1(p[0])} ${f1(p[1])} L${f1(q[0])} ${f1(q[1])}`; }

function skinDecor(id, G, P, layer) {
  let o = '';
  const L = G.lead, sides = [0, 1];
  if (id === 'sucata') {
    if (layer === 'wing') for (const [x, y] of G.wc) o += `<rect x="${x - 11}" y="${y - 8}" width="22" height="16" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="3" transform="rotate(${x < 100 ? -8 : 6} ${x} ${y})"/>` + `<circle cx="${x - 6}" cy="${y + 13}" r="2.5" fill="${SKIN_OUT}"/><circle cx="${x + 7}" cy="${y + 13}" r="2.5" fill="${SKIN_OUT}"/>`;
    if (layer === 'top') {
      for (let y = G.spine[0] + 40; y < G.spine[1]; y += 26) o += `<circle cx="92" cy="${y}" r="2.5" fill="${SKIN_OUT}"/><circle cx="108" cy="${y}" r="2.5" fill="${SKIN_OUT}"/>`;
      for (const [x, y, w] of G.props) o += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="5" fill="#5a4a3a" opacity=".85" stroke="${SKIN_OUT}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="7" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="3"/>`;
    }
  } else if (id === 'bosque') {
    if (layer === 'wing') for (const s of sides) {
      const l = L[s], r = leadPt(l, .25, -16), t = leadPt(l, .92, -12);
      o += `<path d="M${f1(r[0])} ${f1(r[1])} L${f1(t[0])} ${f1(t[1])}" stroke="#2f6e2b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      for (const k of [.45, .7]) { const a = leadPt(l, k, -14), b = leadPt(l, k + .1, -2); o += `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}" stroke="#2f6e2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>`; }
    }
    if (layer === 'top') {
      const [nx, ny] = G.nose;
      o += `<path d="M93 ${G.spine[0] + 16} Q97 ${G.spine[0] + 60} 93 ${G.spine[1] - 6} M107 ${G.spine[0] + 16} Q103 ${G.spine[0] + 66} 107 ${G.spine[1] - 6}" stroke="#6e4626" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      o += `<path d="M${nx} ${ny} C${nx - 4} ${ny - 14} ${nx + 4} ${ny - 22} ${nx + 14} ${ny - 18} C${nx + 12} ${ny - 8} ${nx + 6} ${ny - 2} ${nx} ${ny} Z" fill="#7CCB5C" stroke="${SKIN_OUT}" stroke-width="3" stroke-linejoin="round"/>`;
    }
  } else if (id === 'garra') {
    if (layer === 'pre') for (const s of sides) for (const k of [.35, .58, .8]) {
      const a = leadPt(L[s], k - .06, -2), b = leadPt(L[s], k + .02, 14), c = leadPt(L[s], k + .06, -2);
      o += `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} L${f1(c[0])} ${f1(c[1])} Z" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="3" stroke-linejoin="round"/>`;
    }
    if (layer === 'wing') for (const s of sides) o += line2(leadD(L[s], .22, .9, -14), 5, '#C2362B');
    if (layer === 'top') {
      const [mx, my, mw] = G.mouth, [nx, ny] = G.nose;
      o += `<path d="M${nx - 6} ${ny + 4} L${nx} ${ny - 16} L${nx + 6} ${ny + 4} Z" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="3" stroke-linejoin="round"/>`;
      o += `<path d="M${mx - mw / 2} ${my} L${mx + mw / 2} ${my} L${mx + mw / 2 - 5} ${my + 14} L${mx - mw / 2 + 5} ${my + 14} Z" fill="#2a1410" stroke="${SKIN_OUT}" stroke-width="3" stroke-linejoin="round"/>`;
      for (let k = 0; k < 3; k++) { const x = mx - mw / 2 + 4 + k * (mw - 8) / 2.4; o += `<path d="M${f1(x)} ${my + 1} L${f1(x + 3.5)} ${my + 8} L${f1(x + 7)} ${my + 1} Z" fill="#fff" stroke="${SKIN_OUT}" stroke-width="1.5"/>`; }
      o += `<rect x="88" y="${G.spine[1] - 40}" width="24" height="30" rx="3" fill="${P.wing}" stroke="${SKIN_OUT}" stroke-width="3"/><circle cx="93" cy="${G.spine[1] - 34}" r="2.2" fill="${P.trim}"/><circle cx="107" cy="${G.spine[1] - 34}" r="2.2" fill="${P.trim}"/><circle cx="93" cy="${G.spine[1] - 16}" r="2.2" fill="${P.trim}"/><circle cx="107" cy="${G.spine[1] - 16}" r="2.2" fill="${P.trim}"/>`;
    }
  } else if (id === 'geada') {
    if (layer === 'wing') for (const s of sides) {
      const a = leadPt(L[s], .62, -4), b = leadPt(L[s], .98, -2), c = leadPt(L[s], .8, -30);
      o += `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} L${f1(c[0])} ${f1(c[1])} Z" fill="${P.body}" opacity=".35"/>`;
      o += `<path d="${leadD(L[s], .2, .85, -7)}" stroke="#fff" stroke-opacity=".85" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    if (layer === 'top') {
      const [x, y] = [100, G.spine[1] - 18];
      o += `<path d="M${x} ${y - 12} L${x + 7} ${y} L${x} ${y + 14} L${x - 7} ${y} Z" fill="${P.wing}" stroke="${SKIN_OUT}" stroke-width="3" stroke-linejoin="round"/>`;
    }
  } else if (id === 'lamina') {
    if (layer === 'wing') for (const s of sides) o += line2(leadD(L[s], .12, .97, -4), 6, P.trim);
    if (layer === 'top') {
      const y = G.spine[1] - 34;
      o += `<rect x="86" y="${G.spine[0] + 40}" width="28" height="9" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="3"/>`;
      o += `<circle cx="100" cy="${y}" r="14" fill="${P.wing}" stroke="${SKIN_OUT}" stroke-width="3"/><path d="M100 ${y - 11} L103 ${y - 3} L111 ${y} L103 ${y + 3} L100 ${y + 11} L97 ${y + 3} L89 ${y} L97 ${y - 3} Z" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="2" stroke-linejoin="round"/>`;
      o += `<circle cx="${G.nose[0]}" cy="${G.nose[1] + 2}" r="5" fill="#FFF2A8" stroke="${SKIN_OUT}" stroke-width="3"/>`;
    }
  } else if (id === 'vazio') {
    if (layer === 'wing') for (const s of sides) {
      let d = ''; for (const k of [.5, .78, 1]) { const r = leadPt(L[s], .18, -12), t = leadPt(L[s], k * .95, -10 - (1 - k) * 18); d += `M${f1(r[0])} ${f1(r[1])} L${f1(t[0])} ${f1(t[1])} `; }
      o += `<path d="${d}" stroke="#8CF04A" stroke-opacity=".25" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#8CF04A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      o += line2(leadD(L[s], .1, .97, -2), 4, '#7A3FB0');
    }
    if (layer === 'top') {
      for (const [x, y] of G.tips) o += `<path d="M${x} ${y + 4} Q${x - 10} ${y - 8} ${x - 2} ${y - 22} Q${x + 2} ${y - 10} ${x + 5} ${y - 15} Q${x + 12} ${y - 4} ${x} ${y + 4} Z" fill="#8CF04A" stroke="${SKIN_OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
      const [nx, ny] = G.nose;
      o += `<path d="M${nx - 6} ${ny + 8} Q${nx - 22} ${ny - 4} ${nx - 18} ${ny - 26} Q${nx - 12} ${ny - 8} ${nx - 2} ${ny + 2} Z M${nx + 6} ${ny + 8} Q${nx + 22} ${ny - 4} ${nx + 18} ${ny - 26} Q${nx + 12} ${ny - 8} ${nx + 2} ${ny + 2} Z" fill="#2a1240" stroke="${SKIN_OUT}" stroke-width="3.5" stroke-linejoin="round"/>`;
      for (const y of [G.spine[1] - 44, G.spine[1] - 24]) o += `<path d="M88 ${y} L100 ${y + 8} L112 ${y} L111 ${y + 10} L100 ${y + 18} L89 ${y + 10} Z" fill="${P.wing}" stroke="${SKIN_OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
    }
  } else if (id === 'espectro') {
    if (layer === 'wing') for (const s of sides) {
      const j = leadPt(L[s], .45, -6); let d = leadD(L[s], .05, 1, -3);
      for (const k of [.75, 1.05]) { const t = leadPt(L[s], k * .9, -34 - k * 10); d += ` M${f1(j[0])} ${f1(j[1])} L${f1(t[0])} ${f1(t[1])}`; }
      o += line2(d, 5, '#EDE3C8') + `<circle cx="${f1(j[0])}" cy="${f1(j[1])}" r="6" fill="#EDE3C8" stroke="${SKIN_OUT}" stroke-width="3"/>`;
    }
    if (layer === 'top') {
      let d = ''; for (let y = G.spine[0] + 34; y < G.spine[1] - 6; y += 15) d += `M96 ${y} Q84 ${y + 2} 86 ${y + 12} M104 ${y} Q116 ${y + 2} 114 ${y + 12} `;
      o += line2(d, 3.5, '#EDE3C8');
      const [x, y] = [G.ck[0], G.ck[1] + 10];
      o += `<path d="M${x} ${y - 16} Q${x - 12} ${y} ${x - 6} ${y + 16} Q${x} ${y + 6} ${x + 6} ${y + 16} Q${x + 12} ${y} ${x} ${y - 16} Z" fill="#7CF5C8" stroke="${SKIN_OUT}" stroke-width="2.5"/><path d="M${x} ${y - 6} Q${x - 4} ${y + 4} ${x} ${y + 10} Q${x + 4} ${y + 4} ${x} ${y - 6} Z" fill="#e8fff6"/>`;
      const [nx, ny] = G.nose;
      o += `<path d="M${nx - 13} ${ny + 4} C${nx - 15} ${ny - 18} ${nx + 15} ${ny - 18} ${nx + 13} ${ny + 4} L${nx + 9} ${ny + 14} L${nx - 9} ${ny + 14} Z" fill="#EDE3C8" stroke="${SKIN_OUT}" stroke-width="3.5" stroke-linejoin="round"/>`;
      o += `<ellipse cx="${nx - 5}" cy="${ny - 2}" rx="4" ry="4.5" fill="#0e1c1a"/><ellipse cx="${nx + 5}" cy="${ny - 2}" rx="4" ry="4.5" fill="#0e1c1a"/><circle cx="${nx - 5}" cy="${ny - 1.5}" r="2" fill="#7CF5C8"/><circle cx="${nx + 5}" cy="${ny - 1.5}" r="2" fill="#7CF5C8"/>`;
    }
  } else if (id === 'dragao') {
    if (layer === 'wing') for (const s of sides) {
      o += line2(leadD(L[s], .08, .98, -3), 5, P.body);
      const t = leadPt(L[s], 1, 0); o += `<path d="M${f1(t[0])} ${f1(t[1])} l${f1(t[2] * 12)} ${f1(t[3] * 12 - 4)} l${f1(-t[2] * 4 + 4)} ${f1(-t[3] * 4 + 6)} Z" fill="#EDE3C8" stroke="${SKIN_OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
    }
    if (layer === 'top') {
      for (let y = G.spine[0] + 26; y < G.spine[1] - 8; y += 18) o += `<path d="M95 ${y + 6} L100 ${y - 6} L105 ${y + 6} L100 ${y + 9} Z" fill="${P.trim}" stroke="${SKIN_OUT}" stroke-width="2.2" stroke-linejoin="round"/>`;
      o += `<path d="M92 ${G.spine[0] + 40} L97 ${G.spine[0] + 48} L93 ${G.spine[0] + 56} M108 ${G.spine[0] + 40} L103 ${G.spine[0] + 48} L107 ${G.spine[0] + 56}" stroke="#FFB52E" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      const [nx, ny] = G.nose;
      o += `<path d="M${nx} ${ny - 4} Q${nx - 14} ${ny - 12} ${nx - 9} ${ny - 28} Q${nx - 4} ${ny - 18} ${nx} ${ny - 26} Q${nx + 4} ${ny - 18} ${nx + 9} ${ny - 28} Q${nx + 14} ${ny - 12} ${nx} ${ny - 4} Z" fill="#FFB52E" stroke="${SKIN_OUT}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${nx} ${ny - 7} Q${nx - 6} ${ny - 14} ${nx - 3} ${ny - 21} Q${nx} ${ny - 15} ${nx + 3} ${ny - 21} Q${nx + 6} ${ny - 14} ${nx} ${ny - 7} Z" fill="#FFF3A0"/>`;
      o += `<path d="M${nx - 6} ${ny + 12} Q${nx - 22} ${ny + 14} ${nx - 26} ${ny + 32} Q${nx - 16} ${ny + 22} ${nx - 6} ${ny + 20} Z M${nx + 6} ${ny + 12} Q${nx + 22} ${ny + 14} ${nx + 26} ${ny + 32} Q${nx + 16} ${ny + 22} ${nx + 6} ${ny + 20} Z" fill="#EDE3C8" stroke="${SKIN_OUT}" stroke-width="3" stroke-linejoin="round"/>`;
    }
  }
  return o;
}
function shapeSVG(shape, sk) {
  const G = SHAPES[shape], P = sk.pal, id = sk.id, st = `stroke="${SKIN_OUT}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  let o = '';
  const ghost = id === 'espectro';
  if (shape === 'arty') o += `<path d="${G.booms}" fill="${P.dark}" ${st}/><path d="${G.tailbar}" fill="${P.dark}" ${st}/>`;
  o += skinDecor(id, G, P, 'pre');
  o += ghost ? `<path d="${G.wing}" fill="${P.wing}" fill-opacity=".38" stroke="${SKIN_OUT}" stroke-width="2.5" stroke-linejoin="round"/>` : `<path d="${G.wing}" fill="${P.wing}" ${st}/>`;
  if (id === 'dragao') o += `<path d="${G.wing}" fill="#FF7A1F" opacity=".38" transform="translate(100 112) scale(.78 .72) translate(-100 -112)"/>`;
  if (!ghost) for (const s of [0, 1]) o += `<path d="${leadD(G.lead[s], .14, .86, -7)}" stroke="#fff" stroke-opacity=".3" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  o += skinDecor(id, G, P, 'wing');
  if (shape === 'arty') {
    for (const x of [24, 38, 162, 176]) o += `<rect x="${x - 4}" y="66" width="8" height="28" rx="2" fill="#e8e8e8" stroke="${SKIN_OUT}" stroke-width="2.5"/><path d="M${x - 4} 68 L${x} 58 L${x + 4} 68 Z" fill="#e74c3c" stroke="${SKIN_OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
    for (const [x, y] of G.engines) o += `<circle cx="${x}" cy="${y}" r="12" fill="${P.trim}" ${st}/><circle cx="${x}" cy="${y}" r="4" fill="${SKIN_OUT}"/>`;
  }
  if (shape === 'boomer') for (const [x, y] of G.tips) o += `<circle cx="${x}" cy="${y}" r="12" fill="${sk.shot}" ${st}/><circle cx="${x - 3}" cy="${y - 3}" r="3.5" fill="#fff" opacity=".8"/>`;
  o += `<path d="${G.body}" fill="${P.body}" ${st}/><path d="${G.bodyR}" fill="#000" opacity=".14"/>`;
  const [kx, ky, krx, kry] = G.ck;
  if (id === 'geada') o += `<path d="M${kx} ${ky - kry} L${kx + krx + 3} ${ky} L${kx} ${ky + kry} L${kx - krx - 3} ${ky} Z" fill="${P.ck}" ${st}/><path d="M${kx - 4} ${ky - 4} L${kx} ${ky - 10} L${kx + 2} ${ky - 4} L${kx - 2} ${ky + 2} Z" fill="#fff" opacity=".7"/>`;
  else if (id === 'vazio') o += `<ellipse cx="${kx}" cy="${ky}" rx="${krx + 6}" ry="${kry - 3}" fill="#1a0a24" ${st}/><ellipse cx="${kx}" cy="${ky}" rx="${krx + 1}" ry="${kry - 7}" fill="#8CF04A"/><ellipse cx="${kx}" cy="${ky}" rx="2.4" ry="${kry - 7}" fill="#1a0a24"/><ellipse cx="${kx - 5}" cy="${ky - 4}" rx="2.5" ry="1.8" fill="#fff" opacity=".9"/>`;
  else if (!ghost) o += `<ellipse cx="${kx}" cy="${ky}" rx="${krx}" ry="${kry}" fill="${P.ck}" ${st}/><ellipse cx="${kx - 4}" cy="${ky - 6}" rx="3" ry="5.5" fill="#fff" opacity=".85"/>`;
  o += skinDecor(id, G, P, 'top');
  return o;
}
const SHIP_ART_KEY = ['falcon', 'boomer', 'arty'];
function skinArt(shipIdx, skinId) {
  const shape = SHIP_ART_KEY[shipIdx];
  if (shape === 'falcon') { const a = FALCON_ART[skinId]; return { vb: a.vb, pv: a.pv, g: a.g }; }
  return { vb: [0, -6, 200, 210], pv: [100, 110], g: shapeSVG(shape, skinById(skinId)) };
}

// ---------- Imagens prontas (o SVG vira imagem uma vez só) ----------
const SKIN_U = .3;          // pixels por unidade do desenho (escala 1 do jogo)
const SKIN_RES = 4;         // resolução extra para telas grandes e para o hangar
const skinImg = {};
function buildSkinImages() {
  for (let s = 0; s < SHIPS.length; s++) for (const sk of SKINS) {
    if (sk.id === 'classic') continue;
    const key = s + ':' + sk.id, a = skinArt(s, sk.id);
    const [vx, vy, vw, vh] = a.vb;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw * SKIN_U * SKIN_RES}" height="${vh * SKIN_U * SKIN_RES}">${a.g}</svg>`;
    const rec = skinImg[key] = { ready: false, a };
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = Math.round(vw * SKIN_U * SKIN_RES); c.height = Math.round(vh * SKIN_U * SKIN_RES);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      rec.cv = c; rec.ready = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
function drawSkinShip(shipIdx, skinId, x, y, s, tilt) {
  const rec = skinImg[(shipIdx || 0) + ':' + skinId];
  if (!rec || !rec.ready) return false;
  const [vx, vy, vw, vh] = rec.a.vb, [px, py] = rec.a.pv, u = SKIN_U * s;
  cx.save(); cx.translate(x, y); cx.scale(1 - Math.abs(tilt || 0) * .12, 1);
  cx.drawImage(rec.cv, (vx - px) * u, (vy - py) * u, vw * u, vh * u);
  cx.restore();
  return true;
}
// marca colorida embaixo do avião para saber quem é J1 e J2
function drawPlayerMark(p) {
  const c = PCOL[p.i];
  cx.save(); cx.globalAlpha = .75;
  cx.fillStyle = c.dark; cx.beginPath(); cx.ellipse(p.x, p.y + 30, 20, 6, 0, 0, TAU); cx.fill();
  cx.strokeStyle = c.body; cx.lineWidth = 3; cx.stroke();
  cx.restore();
}

// ---------- Rastro de cada skin ----------
const SHIP_EXHAUST = [[[0, 26]], [[0, 22]], [[-10, 28], [10, 28]]];
function skinTrail(p, dt) {
  if (!p.alive || !p.skin || p.skin === 'classic') return;
  const sk = skinById(p.skin); if (!sk.trail) return;
  p.trT = (p.trT || 0) - dt; if (p.trT > 0) return;
  p.trT = sk.trail === 'puff' || sk.trail === 'smoke' ? .07 : .045;
  for (const [ox, oy] of SHIP_EXHAUST[p.ship || 0]) {
    S.fx.push({ type: 'trail', k: sk.trail, x: p.x + ox + rnd(-3, 3), y: p.y + oy, vx: rnd(-18, 18), vy: rnd(60, 110),
      t: 0, life: rnd(.35, .6), r: rnd(2.5, 4.5), color: sk.tcol, rot: rnd(0, 6) });
  }
}
function drawTrail(f, k) {
  const r = f.r;
  switch (f.k) {
    case 'puff': case 'smoke':
      cx.fillStyle = f.color; cx.globalAlpha *= .55; cx.beginPath(); cx.arc(f.x, f.y, r * (1 + k * 2.4), 0, TAU); cx.fill(); break;
    case 'mist':
      cx.fillStyle = f.color; cx.globalAlpha *= .35; cx.beginPath(); cx.arc(f.x, f.y, r * (1.2 + k * 2.6), 0, TAU); cx.fill(); break;
    case 'leaf':
      cx.save(); cx.translate(f.x, f.y); cx.rotate(f.rot + k * 4);
      cx.fillStyle = f.rot > 5 ? '#F4F06A' : f.color; cx.strokeStyle = SKIN_OUT; cx.lineWidth = 1.2;
      cx.beginPath(); cx.ellipse(0, 0, r * 1.1, r * .55, 0, 0, TAU); cx.fill(); cx.stroke(); cx.restore(); break;
    case 'snow':
      cx.strokeStyle = f.color; cx.lineWidth = 1.6; cx.beginPath();
      for (let a = 0; a < 3; a++) { const an = f.rot + a * Math.PI / 3, s = r * 1.1; cx.moveTo(f.x - Math.cos(an) * s, f.y - Math.sin(an) * s); cx.lineTo(f.x + Math.cos(an) * s, f.y + Math.sin(an) * s); }
      cx.stroke(); break;
    case 'spark':
      cx.fillStyle = k < .5 ? '#FFF2A8' : f.color; cx.beginPath(); const s = r * (1.2 - k * .6);
      cx.moveTo(f.x, f.y - s * 1.6); cx.lineTo(f.x + s * .6, f.y); cx.lineTo(f.x, f.y + s * 1.6); cx.lineTo(f.x - s * .6, f.y); cx.fill(); break;
    case 'flame': case 'ember':
      cx.fillStyle = f.k === 'ember' ? (k < .35 ? '#FFF3A0' : k < .7 ? '#FFB52E' : '#d2381f') : (k < .4 ? '#d8ff9a' : f.color);
      cx.beginPath(); cx.arc(f.x, f.y, r * (1.3 - k), 0, TAU); cx.fill(); break;
  }
}
function drawSkinToast() {
  if (!S.skinMsg) return;
  const a = clamp(S.skinMsg.t, 0, 1), w = Math.min(W - 40, 460), x = (W - w) / 2, y = 96;
  cx.globalAlpha = a;
  cx.fillStyle = 'rgba(28,24,34,.92)'; roundRect(x, y, w, 52, 14); cx.fill();
  cx.strokeStyle = '#F2C230'; cx.lineWidth = 2.5; roundRect(x, y, w, 52, 14); cx.stroke();
  txt('Nova skin no hangar!', W / 2, y + 21, 15, '#F2C230', 'center', 800);
  txt(S.skinMsg.name, W / 2, y + 41, 15, '#fff', 'center', 700);
  cx.globalAlpha = 1;
}

// ---------- Hangar: escolha da skin na tela de nave ----------
function skinKey(code) {
  const ss = S.ss, single = ss.who.length === 1;
  const up = { 0: ['KeyW'], 1: ['ArrowUp'] }, dn = { 0: ['KeyS'], 1: ['ArrowDown'] };
  for (const pi of ss.who) {
    if (ss.done[pi]) continue;
    const u = single ? up[0].concat(up[1]) : up[pi], d = single ? dn[0].concat(dn[1]) : dn[pi];
    if (u.includes(code)) { ss.skin[pi] = skinCycle(ss.skin[pi], -1); ss.info = null; return true; }
    if (d.includes(code)) { ss.skin[pi] = skinCycle(ss.skin[pi], 1); ss.info = null; return true; }
  }
  return false;
}
function skinBars(L) {
  // L: shipLayout(); devolve a faixa de skins de cada painel
  return L.panels.map(P => {
    const top = Math.max(...L.cards.filter(c => c.pi === P.pi).map(c => c.y + c.h)) + (L.compact ? 6 : 14);
    return { pi: P.pi, x: P.x, w: P.w, y: top, h: L.compact ? 32 : 96, compact: L.compact };
  });
}
function skinThumbs(b) {
  const n = SKINS.length, gap = 6, sz = Math.min(46, (b.w - 24 - gap * (n - 1)) / n);
  const x0 = b.x + (b.w - (sz * n + gap * (n - 1))) / 2;
  return SKINS.map((sk, i) => ({ sk, x: x0 + i * (sz + gap), y: b.y + 44, s: sz }));
}
function skinClick(g) {
  const ss = S.ss; if (!ss || !ss.skin) return false;
  for (const b of skinBars(shipLayout())) {
    if (ss.done[b.pi] || g.y < b.y || g.y > b.y + b.h || g.x < b.x || g.x > b.x + b.w) continue;
    if (b.compact) { ss.skin[b.pi] = skinCycle(ss.skin[b.pi], g.x < b.x + b.w / 2 ? -1 : 1); return true; }
    for (const t of skinThumbs(b)) if (g.x > t.x && g.x < t.x + t.s && g.y > t.y && g.y < t.y + t.s) {
      if (skinUnlocked(t.sk.id)) { ss.skin[b.pi] = t.sk.id; ss.info = null; }
      else ss.info = { pi: b.pi, t: 3, text: 'Bloqueada · ' + t.sk.how };
      return true;
    }
    return true;
  }
  return false;
}
function drawLock(x, y, s) {
  cx.strokeStyle = '#cfd6de'; cx.lineWidth = s * .14; cx.beginPath(); cx.arc(x, y - s * .12, s * .22, Math.PI, 0); cx.stroke();
  cx.fillStyle = '#cfd6de'; roundRect(x - s * .32, y - s * .1, s * .64, s * .46, s * .08); cx.fill();
  cx.fillStyle = '#1c1822'; cx.beginPath(); cx.arc(x, y + s * .1, s * .07, 0, TAU); cx.fill();
}
function drawSkinBars(L) {
  const ss = S.ss;
  for (const b of skinBars(L)) {
    const sk = skinById(ss.skin[b.pi]), rar = RARITY[sk.rar], done = ss.done[b.pi], single = ss.who.length === 1;
    const keys = single ? 'W/S ou ↑/↓' : (b.pi === 0 ? 'W/S' : '↑/↓');
    cx.globalAlpha = done ? .55 : 1;
    cx.fillStyle = '#1c1822'; roundRect(b.x, b.y, b.w, b.h, 12); cx.fill();
    cx.strokeStyle = rar[1]; cx.lineWidth = 2; roundRect(b.x, b.y, b.w, b.h, 12); cx.stroke();
    if (b.compact) {
      txt('◀', b.x + 14, b.y + 22, 14, '#cfe3f5', 'left', 700); txt('▶', b.x + b.w - 14, b.y + 22, 14, '#cfe3f5', 'right', 700);
      txt('Skin: ' + sk.name, b.x + b.w / 2, b.y + 21, 14, rar[1], 'center', 700);
    } else {
      txt('Skin', b.x + 14, b.y + 26, 13, '#9fb3c8', 'left', 600);
      txt(sk.name, b.x + 54, b.y + 27, 17, '#fff', 'left', 800);
      const info = ss.info && ss.info.pi === b.pi ? ss.info.text : rar[0] + ' · ' + keys + ' troca';
      txt(info, b.x + b.w - 14, b.y + 26, 12, ss.info && ss.info.pi === b.pi ? '#ffb0b0' : rar[1], 'right', 600);
      const ship = ss.cur[b.pi];
      for (const t of skinThumbs(b)) {
        const sel = t.sk.id === ss.skin[b.pi], ok = skinUnlocked(t.sk.id), rc = RARITY[t.sk.rar][1];
        cx.fillStyle = sel ? '#3a3046' : '#2a2433'; roundRect(t.x, t.y, t.s, t.s, 8); cx.fill();
        cx.strokeStyle = sel ? '#fff' : rc; cx.lineWidth = sel ? 2.5 : 1.2; roundRect(t.x, t.y, t.s, t.s, 8); cx.stroke();
        cx.save(); cx.beginPath(); cx.rect(t.x + 1, t.y + 1, t.s - 2, t.s - 2); cx.clip();
        if (!ok) cx.globalAlpha *= .35;
        drawShip(ship, t.x + t.s / 2, t.y + t.s / 2 + 1, t.s / 74, PCOL[b.pi].body, PCOL[b.pi].dark, 0, false, t.sk.id);
        cx.restore();
        if (!ok) drawLock(t.x + t.s / 2, t.y + t.s / 2, t.s * .5);
      }
    }
    cx.globalAlpha = 1;
  }
}

// ---------- Arte do Falcão (mesma do Hangar de skins) ----------
const FALCON_ART = {"sucata": {"vb": [0.0,0.0,200.0,220.0],"pv": [100.0,110.0],"g": "<g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M70 170 L130 170 L136 194 L64 194 Z\" fill=\"#8A8F96\"/><path d=\"M28 94 L172 94 L178 130 L22 130 Z\" fill=\"#8A8F96\"/><rect x=\"38\" y=\"102\" width=\"24\" height=\"18\" fill=\"#C9B27A\" stroke-width=\"3\"/><rect x=\"140\" y=\"104\" width=\"20\" height=\"16\" fill=\"#C9B27A\" stroke-width=\"3\" transform=\"rotate(-6 150 112)\"/><path d=\"M100 26 C122 26 128 52 126 92 L120 190 Q100 198 80 190 L74 92 C72 52 78 26 100 26 Z\" fill=\"#E08A2E\"/><ellipse cx=\"100\" cy=\"80\" rx=\"13\" ry=\"18\" fill=\"#7FD3E8\"/><rect x=\"84\" y=\"128\" width=\"32\" height=\"10\" rx=\"2\" fill=\"#4a4a4a\" stroke-width=\"3\"/><path d=\"M58 22 Q100 12 142 22 Q100 32 58 22 Z\" fill=\"#5a4a3a\" opacity=\".85\" stroke-width=\"3\"/><circle cx=\"100\" cy=\"22\" r=\"8\" fill=\"#C9B27A\"/></g><g stroke=\"none\"><path d=\"M100 26 C122 26 128 52 126 92 L120 190 Q110 195 100 196 Z\" fill=\"#000\" opacity=\".14\"/><path d=\"M30 96 L170 96 L171 104 L29 104 Z\" fill=\"#fff\" opacity=\".35\"/><ellipse cx=\"95\" cy=\"73\" rx=\"4\" ry=\"7\" fill=\"#fff\" opacity=\".85\"/><circle cx=\"45\" cy=\"124\" r=\"2.5\" fill=\"#24160c\"/><circle cx=\"60\" cy=\"124\" r=\"2.5\" fill=\"#24160c\"/><circle cx=\"140\" cy=\"124\" r=\"2.5\" fill=\"#24160c\"/><circle cx=\"155\" cy=\"124\" r=\"2.5\" fill=\"#24160c\"/><circle cx=\"88\" cy=\"160\" r=\"2.5\" fill=\"#24160c\"/><circle cx=\"112\" cy=\"160\" r=\"2.5\" fill=\"#24160c\"/></g>"},"bosque": {"vb": [0.0,0.0,200.0,220.0],"pv": [100.0,110.0],"g": "<g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M94 176 C80 160 58 166 54 184 C70 194 86 190 94 182 Z\" fill=\"#3E8A3A\"/><path d=\"M106 176 C120 160 142 166 146 184 C130 194 114 190 106 182 Z\" fill=\"#3E8A3A\"/><path d=\"M92 98 C60 64 18 76 10 112 C40 132 72 126 92 114 Z\" fill=\"#5DAE4A\"/><path d=\"M108 98 C140 64 182 76 190 112 C160 132 128 126 108 114 Z\" fill=\"#5DAE4A\"/><path d=\"M100 22 C118 28 122 62 120 100 L114 190 Q100 198 86 190 L80 100 C78 62 82 28 100 22 Z\" fill=\"#9B6A3C\"/><path d=\"M100 22 C96 8 104 0 114 4 C112 14 106 20 100 22 Z\" fill=\"#7CCB5C\" stroke-width=\"3\"/><ellipse cx=\"100\" cy=\"82\" rx=\"11\" ry=\"16\" fill=\"#F4C542\"/></g><g fill=\"none\" stroke-linecap=\"round\"><path d=\"M90 106 C66 98 40 100 16 110\" stroke=\"#2f6e2b\" stroke-width=\"3\"/><path d=\"M110 106 C134 98 160 100 184 110\" stroke=\"#2f6e2b\" stroke-width=\"3\"/><path d=\"M60 102 L48 90 M40 104 L30 96 M140 102 L152 90 M160 104 L170 96\" stroke=\"#2f6e2b\" stroke-width=\"2.5\"/><path d=\"M92 112 Q96 140 92 178\" stroke=\"#6e4626\" stroke-width=\"2.5\"/><path d=\"M108 112 Q104 146 108 180\" stroke=\"#6e4626\" stroke-width=\"2.5\"/><path d=\"M22 100 C40 84 62 82 82 94\" stroke=\"#ffffff\" stroke-opacity=\".4\" stroke-width=\"4\"/></g><g stroke=\"none\"><path d=\"M100 22 C118 28 122 62 120 100 L114 190 Q107 195 100 196 Z\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"96\" cy=\"76\" rx=\"3.5\" ry=\"6\" fill=\"#fff\" opacity=\".8\"/></g>"},"garra": {"vb": [0.0,0.0,200.0,220.0],"pv": [100.0,110.0],"g": "<g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M88 168 L58 188 L64 200 L92 188 Z\" fill=\"#4A4E55\"/><path d=\"M112 168 L142 188 L136 200 L108 188 Z\" fill=\"#4A4E55\"/><g stroke-width=\"3\" fill=\"#c9ccd1\"><path d=\"M72 97 L60 84 L62 102 Z\"/><path d=\"M52 105 L40 92 L42 110 Z\"/><path d=\"M33 113 L20 102 L23 118 Z\"/><path d=\"M128 97 L140 84 L138 102 Z\"/><path d=\"M148 105 L160 92 L158 110 Z\"/><path d=\"M167 113 L180 102 L177 118 Z\"/></g><path d=\"M88 90 L16 120 L26 144 L88 130 Z\" fill=\"#4A4E55\"/><path d=\"M112 90 L184 120 L174 144 L112 130 Z\" fill=\"#4A4E55\"/><path d=\"M88 104 L24 130 L26 137 L88 117 Z\" fill=\"#C2362B\" stroke-width=\"3\"/><path d=\"M112 104 L176 130 L174 137 L112 117 Z\" fill=\"#C2362B\" stroke-width=\"3\"/><path d=\"M92 24 L100 4 L108 24 Z\" fill=\"#c9ccd1\" stroke-width=\"3\"/><path d=\"M100 20 L122 40 L126 100 L118 188 L82 188 L74 100 L78 40 Z\" fill=\"#C2362B\"/><path d=\"M82 40 L118 40 L112 58 L88 58 Z\" fill=\"#2a1410\" stroke-width=\"3\"/><g fill=\"#ffffff\" stroke-width=\"2\"><path d=\"M86 41 L90 49 L94 41 Z\"/><path d=\"M96 41 L100 50 L104 41 Z\"/><path d=\"M106 41 L110 49 L114 41 Z\"/><path d=\"M91 57 L95 50 L99 57 Z\"/><path d=\"M101 57 L105 50 L109 57 Z\"/></g><path d=\"M88 80 L112 80 L108 100 L92 100 Z\" fill=\"#F2A33A\"/><rect x=\"86\" y=\"124\" width=\"28\" height=\"42\" rx=\"3\" fill=\"#4A4E55\" stroke-width=\"3\"/></g><g stroke=\"none\"><path d=\"M100 20 L122 40 L126 100 L118 188 L100 188 Z\" fill=\"#000\" opacity=\".16\"/><path d=\"M92 82 L100 82 L98 92 L93 92 Z\" fill=\"#fff\" opacity=\".6\"/><circle cx=\"91\" cy=\"130\" r=\"2.5\" fill=\"#c9ccd1\"/><circle cx=\"109\" cy=\"130\" r=\"2.5\" fill=\"#c9ccd1\"/><circle cx=\"91\" cy=\"160\" r=\"2.5\" fill=\"#c9ccd1\"/><circle cx=\"109\" cy=\"160\" r=\"2.5\" fill=\"#c9ccd1\"/></g>"},"geada": {"vb": [0.0,0.0,200.0,220.0],"pv": [100.0,110.0],"g": "<g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M92 170 L66 158 L58 194 L92 186 Z\" fill=\"#8FD8F2\"/><path d=\"M108 170 L134 158 L142 194 L108 186 Z\" fill=\"#8FD8F2\"/><path d=\"M90 94 L42 72 L12 120 L50 112 L90 126 Z\" fill=\"#8FD8F2\"/><path d=\"M110 94 L158 72 L188 120 L150 112 L110 126 Z\" fill=\"#8FD8F2\"/><path d=\"M100 12 L118 50 L120 112 L110 190 L90 190 L80 112 L82 50 Z\" fill=\"#2F6FB5\"/><path d=\"M100 70 L113 88 L100 106 L87 88 Z\" fill=\"#C9A8FF\"/><path d=\"M94 130 L100 122 L106 130 L100 150 Z\" fill=\"#8FD8F2\" stroke-width=\"3\"/></g><g stroke=\"none\"><path d=\"M50 112 L14 119 L42 74 Z\" fill=\"#2F6FB5\" opacity=\".35\"/><path d=\"M150 112 L186 119 L158 74 Z\" fill=\"#2F6FB5\" opacity=\".35\"/><path d=\"M66 160 L60 192 L76 176 Z\" fill=\"#2F6FB5\" opacity=\".3\"/><path d=\"M134 160 L140 192 L124 176 Z\" fill=\"#2F6FB5\" opacity=\".3\"/><path d=\"M100 12 L118 50 L120 112 L110 190 L100 190 Z\" fill=\"#000\" opacity=\".15\"/><path d=\"M100 16 L88 54 L100 62 Z\" fill=\"#fff\" opacity=\".5\"/><path d=\"M95 80 L100 74 L102 80 L96 88 Z\" fill=\"#fff\" opacity=\".7\"/></g><g fill=\"none\" stroke-linecap=\"round\"><path d=\"M88 110 L44 76 M112 110 L156 76\" stroke=\"#ffffff\" stroke-opacity=\".8\" stroke-width=\"3\"/></g>"},"lamina": {"vb": [0.0,0.0,200.0,220.0],"pv": [100.0,110.0],"g": "<g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M92 166 Q72 170 60 196 L92 188 Z\" fill=\"#2A55B8\"/><path d=\"M108 166 Q128 170 140 196 L108 188 Z\" fill=\"#2A55B8\"/><path d=\"M90 92 Q48 96 14 136 L30 144 Q60 126 90 126 Z\" fill=\"#2A55B8\"/><path d=\"M110 92 Q152 96 186 136 L170 144 Q140 126 110 126 Z\" fill=\"#2A55B8\"/><path d=\"M90 92 Q48 96 14 136 L22 140 Q54 106 90 102 Z\" fill=\"#F2C230\" stroke-width=\"3\"/><path d=\"M110 92 Q152 96 186 136 L178 140 Q146 106 110 102 Z\" fill=\"#F2C230\" stroke-width=\"3\"/><path d=\"M100 10 C114 30 120 60 118 110 L112 190 Q100 198 88 190 L82 110 C80 60 86 30 100 10 Z\" fill=\"#F4F1E6\"/><path d=\"M95 124 L105 124 L104 186 L96 186 Z\" fill=\"#2A55B8\" stroke-width=\"3\"/><path d=\"M82 110 L118 110 L117 122 L83 122 Z\" fill=\"#F2C230\" stroke-width=\"3\"/><circle cx=\"100\" cy=\"152\" r=\"16\" fill=\"#2A55B8\" stroke-width=\"3\"/><path d=\"M100 139 L103.5 148.5 L113 152 L103.5 155.5 L100 165 L96.5 155.5 L87 152 L96.5 148.5 Z\" fill=\"#F2C230\" stroke-width=\"2\"/><ellipse cx=\"100\" cy=\"68\" rx=\"11\" ry=\"17\" fill=\"#7FD3E8\"/><circle cx=\"100\" cy=\"26\" r=\"5\" fill=\"#FFF2A8\" stroke-width=\"3\"/></g><g stroke=\"none\"><path d=\"M100 10 C114 30 120 60 118 110 L112 190 Q106 194 100 195 Z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"96\" cy=\"62\" rx=\"3.5\" ry=\"6\" fill=\"#fff\" opacity=\".85\"/><path d=\"M40 118 Q60 106 82 104\" fill=\"none\" stroke=\"#ffffff\" stroke-opacity=\".35\" stroke-width=\"4\" stroke-linecap=\"round\"/></g>"},"vazio": {"vb": [0.0,-24.0,240.0,264.0],"pv": [120.0,100.0],"g": "<g fill=\"none\" stroke-linecap=\"round\"><path d=\"M112 166 C102 190 90 196 82 216 M120 172 C124 196 114 212 120 234 M128 166 C138 190 150 196 158 216\" stroke=\"#24160c\" stroke-width=\"10\"/><path d=\"M112 166 C102 190 90 196 82 216 M120 172 C124 196 114 212 120 234 M128 166 C138 190 150 196 158 216\" stroke=\"#4B2470\" stroke-width=\"5\"/></g><g fill=\"#8CF04A\" stroke=\"#24160c\" stroke-width=\"2\"><circle cx=\"82\" cy=\"216\" r=\"4\"/><circle cx=\"120\" cy=\"234\" r=\"4\"/><circle cx=\"158\" cy=\"216\" r=\"4\"/></g><g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M104 84 L60 40 L10 50 L26 72 L2 88 L28 98 L6 118 L34 120 L22 144 L56 130 L66 150 L82 126 L106 124 Z\" fill=\"#3a1a5c\"/><path d=\"M136 84 L180 40 L230 50 L214 72 L238 88 L212 98 L234 118 L206 120 L218 144 L184 130 L174 150 L158 126 L134 124 Z\" fill=\"#3a1a5c\"/><path d=\"M10 50 Q0 38 8 24 Q12 36 15 31 Q22 42 10 50 Z\" fill=\"#8CF04A\" stroke-width=\"2.5\"/><path d=\"M230 50 Q240 38 232 24 Q228 36 225 31 Q218 42 230 50 Z\" fill=\"#8CF04A\" stroke-width=\"2.5\"/><path d=\"M110 30 Q94 14 99 -10 Q106 10 117 23 Z\" fill=\"#2a1240\" stroke-width=\"4\"/><path d=\"M130 30 Q146 14 141 -10 Q134 10 123 23 Z\" fill=\"#2a1240\" stroke-width=\"4\"/><path d=\"M102 72 L82 58 L100 84 Z\" fill=\"#d6c6f0\" stroke-width=\"3\"/><path d=\"M138 72 L158 58 L140 84 Z\" fill=\"#d6c6f0\" stroke-width=\"3\"/><path d=\"M120 20 C140 34 146 74 140 112 L130 168 L120 176 L110 168 L100 112 C94 74 100 34 120 20 Z\" fill=\"#5a2a86\"/><path d=\"M104 116 L120 126 L136 116 L134 130 L120 140 L106 130 Z\" fill=\"#3a1a5c\" stroke-width=\"3\"/><path d=\"M108 140 L120 148 L132 140 L130 152 L120 160 L110 152 Z\" fill=\"#3a1a5c\" stroke-width=\"3\"/><ellipse cx=\"120\" cy=\"74\" rx=\"21\" ry=\"15\" fill=\"#1a0a24\"/><path d=\"M98 66 L104 58 L108 64 M142 66 L136 58 L132 64\" fill=\"none\" stroke-width=\"3\"/></g><g stroke=\"none\"><path d=\"M120 20 C140 34 146 74 140 112 L130 168 L120 176 Z\" fill=\"#000\" opacity=\".2\"/><ellipse cx=\"120\" cy=\"74\" rx=\"15\" ry=\"10\" fill=\"#8CF04A\"/><ellipse cx=\"120\" cy=\"74\" rx=\"9\" ry=\"6\" fill=\"#c8ff8a\"/><ellipse cx=\"120\" cy=\"74\" rx=\"2.6\" ry=\"9\" fill=\"#1a0a24\"/><ellipse cx=\"113\" cy=\"70\" rx=\"3\" ry=\"2\" fill=\"#fff\" opacity=\".9\"/><circle cx=\"56\" cy=\"92\" r=\"3\" fill=\"#8CF04A\"/><circle cx=\"184\" cy=\"92\" r=\"3\" fill=\"#8CF04A\"/></g><g fill=\"none\" stroke=\"#8CF04A\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M100 96 L30 60 M100 104 L16 104 M100 112 L34 136 M102 118 L70 144 M140 96 L210 60 M140 104 L224 104 M140 112 L206 136 M138 118 L170 144\" stroke-width=\"6\" stroke-opacity=\".25\"/><path d=\"M100 96 L30 60 M100 104 L16 104 M100 112 L34 136 M102 118 L70 144 M140 96 L210 60 M140 104 L224 104 M140 112 L206 136 M138 118 L170 144\" stroke-width=\"2.5\"/></g><g fill=\"none\" stroke-linecap=\"round\"><path d=\"M104 84 L60 40 L10 50 M136 84 L180 40 L230 50\" stroke=\"#24160c\" stroke-width=\"9\"/><path d=\"M104 84 L60 40 L10 50 M136 84 L180 40 L230 50\" stroke=\"#7A3FB0\" stroke-width=\"4\"/></g>"},"espectro": {"vb": [0.0,-24.0,240.0,264.0],"pv": [120.0,100.0],"g": "<path d=\"M106 168 Q92 200 106 238 Q112 216 120 232 Q128 216 134 238 Q148 200 134 168 Z\" fill=\"#7CF5C8\" opacity=\".35\"/><g stroke=\"#24160c\" stroke-width=\"2.5\" stroke-linejoin=\"round\" fill=\"#7CF5C8\" fill-opacity=\".38\"><path d=\"M104 92 L14 80 L6 104 L20 110 L10 130 L30 132 L24 150 L50 138 L60 154 L76 132 L106 128 Z\"/><path d=\"M136 92 L226 80 L234 104 L220 110 L230 130 L210 132 L216 150 L190 138 L180 154 L164 132 L134 128 Z\"/></g><g fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M104 94 L58 66 L14 80 M58 66 L6 104 M58 66 L24 150 M58 66 L60 152 M136 94 L182 66 L226 80 M182 66 L234 104 M182 66 L216 150 M182 66 L180 152\" stroke=\"#24160c\" stroke-width=\"12\"/><path d=\"M104 94 L58 66 L14 80 M58 66 L6 104 M58 66 L24 150 M58 66 L60 152 M136 94 L182 66 L226 80 M182 66 L234 104 M182 66 L216 150 M182 66 L180 152\" stroke=\"#EDE3C8\" stroke-width=\"6\"/></g><g stroke=\"#24160c\" stroke-width=\"3\" stroke-linejoin=\"round\" fill=\"#EDE3C8\"><path d=\"M14 80 Q-4 70 4 50 Q10 68 24 74 Z\"/><path d=\"M226 80 Q244 70 236 50 Q230 68 216 74 Z\"/><circle cx=\"58\" cy=\"66\" r=\"7\"/><circle cx=\"182\" cy=\"66\" r=\"7\"/></g><path d=\"M120 76 Q100 104 110 132 Q115 116 120 126 Q125 116 130 132 Q140 104 120 76 Z\" fill=\"#7CF5C8\" stroke=\"#24160c\" stroke-width=\"2.5\"/><path d=\"M120 92 Q112 108 116 122 Q120 112 124 122 Q128 108 120 92 Z\" fill=\"#e8fff6\"/><g fill=\"none\" stroke-linecap=\"round\"><path d=\"M114 70 Q90 72 92 88 M126 70 Q150 72 148 88 M114 86 Q88 88 90 104 M126 86 Q152 88 150 104 M114 102 Q88 104 92 120 M126 102 Q152 104 148 120 M114 118 Q92 120 96 134 M126 118 Q148 120 144 134 M115 134 Q98 136 102 148 M125 134 Q142 136 138 148\" stroke=\"#24160c\" stroke-width=\"9\"/><path d=\"M114 70 Q90 72 92 88 M126 70 Q150 72 148 88 M114 86 Q88 88 90 104 M126 86 Q152 88 150 104 M114 102 Q88 104 92 120 M126 102 Q152 104 148 120 M114 118 Q92 120 96 134 M126 118 Q148 120 144 134 M115 134 Q98 136 102 148 M125 134 Q142 136 138 148\" stroke=\"#EDE3C8\" stroke-width=\"4.5\"/></g><g stroke=\"#24160c\" stroke-width=\"3\" fill=\"#EDE3C8\"><rect x=\"113\" y=\"54\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"113\" y=\"66\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"113\" y=\"78\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"113\" y=\"90\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"113\" y=\"102\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"113\" y=\"114\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"113\" y=\"126\" width=\"14\" height=\"10\" rx=\"4\"/><rect x=\"114\" y=\"138\" width=\"12\" height=\"10\" rx=\"4\"/><rect x=\"114\" y=\"150\" width=\"12\" height=\"10\" rx=\"4\"/><rect x=\"115\" y=\"162\" width=\"10\" height=\"9\" rx=\"4\"/><circle cx=\"120\" cy=\"180\" r=\"5\"/><circle cx=\"120\" cy=\"192\" r=\"4\"/><circle cx=\"120\" cy=\"202\" r=\"3\"/></g><g stroke=\"#24160c\" stroke-width=\"4\" stroke-linejoin=\"round\"><path d=\"M100 10 Q78 12 72 36 Q84 24 100 22 Z\" fill=\"#EDE3C8\"/><path d=\"M140 10 Q162 12 168 36 Q156 24 140 22 Z\" fill=\"#EDE3C8\"/><path d=\"M112 -2 L113 -16 L118 -4 Z M118 -4 L120 -22 L122 -4 Z M122 -4 L127 -16 L128 -2 Z\" fill=\"#7CF5C8\" stroke-width=\"2.5\"/><path d=\"M120 -6 C142 -6 148 12 146 26 L140 40 L100 40 L94 26 C92 12 98 -6 120 -6 Z\" fill=\"#EDE3C8\"/><path d=\"M104 40 L136 40 L132 52 L108 52 Z\" fill=\"#EDE3C8\" stroke-width=\"3\"/></g><g stroke=\"none\"><path d=\"M120 -6 C142 -6 148 12 146 26 L140 40 L120 40 Z\" fill=\"#000\" opacity=\".12\"/><ellipse cx=\"110\" cy=\"16\" rx=\"7.5\" ry=\"8.5\" fill=\"#0e1c1a\"/><ellipse cx=\"130\" cy=\"16\" rx=\"7.5\" ry=\"8.5\" fill=\"#0e1c1a\"/><circle cx=\"110\" cy=\"17\" r=\"4\" fill=\"#7CF5C8\"/><circle cx=\"130\" cy=\"17\" r=\"4\" fill=\"#7CF5C8\"/><circle cx=\"109\" cy=\"15.5\" r=\"1.4\" fill=\"#fff\"/><circle cx=\"129\" cy=\"15.5\" r=\"1.4\" fill=\"#fff\"/><path d=\"M117 31 L120 25 L123 31 Z\" fill=\"#0e1c1a\"/></g><g fill=\"none\" stroke-linecap=\"round\"><path d=\"M112 42 v9 M117 42 v10 M123 42 v10 M128 42 v9\" stroke=\"#24160c\" stroke-width=\"1.8\"/><path d=\"M104 20 Q96 36 104 50 M136 20 Q144 36 136 50\" stroke=\"#7CF5C8\" stroke-width=\"3\" stroke-opacity=\".7\"/></g>"},"dragao": {"vb": [0.0,-34.0,240.0,276.0],"pv": [120.0,100.0],"g": "<g stroke=\"#24160c\" stroke-width=\"5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M112 166 C106 196 136 206 140 224 L148 222 C148 198 130 190 128 166 Z\" fill=\"#B8231A\"/><path d=\"M140 220 L126 238 L146 233 L158 242 L152 220 Z\" fill=\"#FFC23D\" stroke-width=\"4\"/><path d=\"M106 86 L72 50 L24 46 L4 98 Q26 106 18 126 Q40 128 40 148 Q60 132 74 144 Q90 128 108 128 Z\" fill=\"#7a1610\"/><path d=\"M134 86 L168 50 L216 46 L236 98 Q214 106 222 126 Q200 128 200 148 Q180 132 166 144 Q150 128 132 128 Z\" fill=\"#7a1610\"/><path d=\"M24 46 L12 30 L30 42 Z\" fill=\"#EDE3C8\" stroke-width=\"3\"/><path d=\"M216 46 L228 30 L210 42 Z\" fill=\"#EDE3C8\" stroke-width=\"3\"/><path d=\"M106 150 L92 160 L100 163 L94 174 L112 160 Z\" fill=\"#B8231A\" stroke-width=\"4\"/><path d=\"M134 150 L148 160 L140 163 L146 174 L128 160 Z\" fill=\"#B8231A\" stroke-width=\"4\"/><path d=\"M120 -8 Q102 -16 107 -33 Q113 -24 116 -31 Q120 -22 124 -31 Q127 -24 133 -33 Q138 -16 120 -8 Z\" fill=\"#FFB52E\" stroke-width=\"3\"/><path d=\"M120 40 C138 50 142 90 138 130 C134 158 128 170 120 176 C112 170 106 158 102 130 C98 90 102 50 120 40 Z\" fill=\"#B8231A\"/><path d=\"M112 54 L113 22 L127 22 L128 54 Z\" fill=\"#B8231A\"/><path d=\"M110 22 Q92 26 84 46 Q98 36 113 29 Z\" fill=\"#EDE3C8\" stroke-width=\"4\"/><path d=\"M130 22 Q148 26 156 46 Q142 36 127 29 Z\" fill=\"#EDE3C8\" stroke-width=\"4\"/><path d=\"M107 12 L96 6 L105 19 Z\" fill=\"#EDE3C8\" stroke-width=\"3\"/><path d=\"M133 12 L144 6 L135 19 Z\" fill=\"#EDE3C8\" stroke-width=\"3\"/><path d=\"M120 -6 L132 6 L134 22 L126 31 L114 31 L106 22 L108 6 Z\" fill=\"#B8231A\"/><g fill=\"#FFC23D\" stroke-width=\"2.5\"><path d=\"M115 62 L120 50 L125 62 L120 66 Z\"/><path d=\"M115 82 L120 70 L125 82 L120 86 Z\"/><path d=\"M115 102 L120 90 L125 102 L120 106 Z\"/><path d=\"M115 122 L120 110 L125 122 L120 126 Z\"/><path d=\"M116 142 L120 131 L124 142 L120 146 Z\"/><path d=\"M117 160 L120 151 L123 160 L120 163 Z\"/></g></g><g stroke=\"none\"><path d=\"M100 92 L70 58 L30 54 L14 96 Q30 102 26 120 Q44 122 46 138 Q62 128 74 136 Q90 124 102 122 Z\" fill=\"#FF7A1F\" opacity=\".4\"/><path d=\"M140 92 L170 58 L210 54 L226 96 Q210 102 214 120 Q196 122 194 138 Q178 128 166 136 Q150 124 138 122 Z\" fill=\"#FF7A1F\" opacity=\".4\"/><path d=\"M120 40 C138 50 142 90 138 130 C134 158 128 170 120 176 Z\" fill=\"#000\" opacity=\".16\"/><path d=\"M120 -6 L132 6 L134 22 L126 31 L120 31 Z\" fill=\"#000\" opacity=\".14\"/><path d=\"M120 -10 Q113 -18 116 -27 Q120 -20 124 -27 Q127 -18 120 -10 Z\" fill=\"#FFF3A0\"/><path d=\"M111 11 L118 14 L117 18 L110 15 Z\" fill=\"#FFE14D\"/><path d=\"M129 11 L122 14 L123 18 L130 15 Z\" fill=\"#FFE14D\"/><circle cx=\"116\" cy=\"-1\" r=\"1.8\" fill=\"#FF7A1F\"/><circle cx=\"124\" cy=\"-1\" r=\"1.8\" fill=\"#FF7A1F\"/><path d=\"M108 52 Q112 70 108 90\" fill=\"none\" stroke=\"#ffffff\" stroke-opacity=\".3\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M106 86 L72 50 L24 46\" stroke=\"#24160c\" stroke-width=\"10\"/><path d=\"M106 86 L72 50 L24 46\" stroke=\"#B8231A\" stroke-width=\"5\"/><path d=\"M134 86 L168 50 L216 46\" stroke=\"#24160c\" stroke-width=\"10\"/><path d=\"M134 86 L168 50 L216 46\" stroke=\"#B8231A\" stroke-width=\"5\"/><path d=\"M24 46 L4 98 M24 46 L18 126 M28 48 L40 148 M72 50 L74 144 M216 46 L236 98 M216 46 L222 126 M212 48 L200 148 M168 50 L166 144\" stroke=\"#24160c\" stroke-width=\"3.5\"/><path d=\"M110 98 L116 106 L112 114 M130 98 L124 106 L128 114 M112 134 L118 142 M128 134 L122 142 M118 120 L120 128 L122 120\" stroke=\"#FFB52E\" stroke-width=\"2.5\"/></g>"}};

// ---------- Tiros de cada skin (só visual; apontam para cima, centro em 0,0) ----------
const SHOT_ART = {
  sucata: `<path d="M0 18 L-5 44 L0 36 L5 46 Z" fill="#ffcf60" opacity=".7"/>
<path d="M0 -22 L6 -8 L20 -10 L9 0 L16 14 L2 7 L-6 20 L-6 5 L-20 2 L-8 -6 L-14 -18 L-2 -10 Z" fill="#ff9a3c" stroke="#24160c" stroke-width="3" stroke-linejoin="round"/>
<circle r="6" fill="#fff3a0"/>`,
  bosque: `<path d="M-3 16 Q0 34 3 16" fill="none" stroke="#7CCB5C" stroke-width="4" stroke-linecap="round" opacity=".7"/>
<path d="M0 -26 C13 -18 13 10 0 18 C-13 10 -13 -18 0 -26 Z" fill="#9B6A3C" stroke="#24160c" stroke-width="3"/>
<path d="M0 -18 C6 -12 6 6 0 12" fill="none" stroke="#6e4626" stroke-width="2.5" stroke-linecap="round"/>
<path d="M0 -24 C-2 -36 8 -42 14 -38 C10 -30 4 -26 0 -24 Z" fill="#8ee05a" stroke="#24160c" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="-4" cy="-10" rx="2.5" ry="5" fill="#fff" opacity=".6"/>`,
  garra: `<path d="M-3 16 L0 44 L3 16 Z" fill="#3a3a3a" opacity=".6"/>
<path d="M0 -30 L9 -6 L5 20 L-6 16 L-9 -8 Z" fill="#5a5f68" stroke="#24160c" stroke-width="3" stroke-linejoin="round"/>
<path d="M0 -30 L9 -6 L4 -4 Z" fill="#ff7a3a"/><path d="M-9 -8 L0 -30 L-2 -6 Z" fill="#ffcf60"/>
<path d="M-3 0 L2 4 L-1 12" fill="none" stroke="#ff7a3a" stroke-width="2.5" stroke-linecap="round"/>`,
  geada: `<path d="M-2 18 L0 40 L2 18 Z" fill="#e8f8ff" opacity=".7"/>
<path d="M0 -32 L9 -4 L0 22 L-9 -4 Z" fill="#9fe6ff" stroke="#24160c" stroke-width="3" stroke-linejoin="round"/>
<path d="M0 -32 L9 -4 L0 -2 Z" fill="#fff" opacity=".75"/><path d="M0 22 L9 -4 L0 -2 Z" fill="#2F6FB5" opacity=".45"/>
<path d="M-15 8 l6 -3 M15 8 l-6 -3" stroke="#e8f8ff" stroke-width="2.5" stroke-linecap="round"/>`,
  lamina: `<path d="M0 -36 L7 -6 L4 30 L-4 30 L-7 -6 Z" fill="#ffe066" opacity=".35"/>
<path d="M0 -32 L5 -6 L3 26 L-3 26 L-5 -6 Z" fill="#F2C230" stroke="#24160c" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M0 -26 L2 -6 L1 20 L-1 20 L-2 -6 Z" fill="#fff8d0"/>
<path d="M-10 -6 L0 -14 L10 -6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`,
  vazio: `<circle cx="-4" cy="20" r="7" fill="#7A3FB0" opacity=".55"/><circle cx="4" cy="30" r="5" fill="#7A3FB0" opacity=".4"/><circle cx="-2" cy="38" r="3.5" fill="#7A3FB0" opacity=".3"/>
<circle r="16" fill="#8CF04A" opacity=".25"/>
<circle r="11" fill="#8CF04A" stroke="#24160c" stroke-width="3"/>
<circle r="5" fill="#d8ff9a"/><circle cx="-4" cy="-4" r="2.5" fill="#fff"/>`,
  espectro: `<path d="M-8 6 Q-12 26 -2 40 Q0 28 4 34 Q10 22 8 6 Z" fill="#7CF5C8" opacity=".45"/>
<path d="M0 -18 C12 -18 14 -6 12 2 L8 8 L-8 8 L-12 2 C-14 -6 -12 -18 0 -18 Z" fill="#EDE3C8" stroke="#24160c" stroke-width="3" stroke-linejoin="round"/>
<path d="M-6 8 L6 8 L5 14 L-5 14 Z" fill="#EDE3C8" stroke="#24160c" stroke-width="2.5"/>
<ellipse cx="-5" cy="-6" rx="3.5" ry="4" fill="#0e1c1a"/><ellipse cx="5" cy="-6" rx="3.5" ry="4" fill="#0e1c1a"/>
<circle cx="-5" cy="-5.5" r="1.8" fill="#7CF5C8"/><circle cx="5" cy="-5.5" r="1.8" fill="#7CF5C8"/>`,
  dragao: `<path d="M0 -6 Q-16 14 -6 40 Q-2 28 0 34 Q4 26 8 40 Q16 14 0 -6 Z" fill="#d2381f" opacity=".85"/>
<path d="M0 -4 Q-9 12 -3 28 Q0 20 3 28 Q9 12 0 -4 Z" fill="#FFB52E"/>
<circle cy="-8" r="15" fill="#FF7A1F" stroke="#24160c" stroke-width="3"/>
<circle cy="-8" r="9" fill="#FFB52E"/><circle cx="-2" cy="-11" r="5" fill="#FFF3A0"/>`,
};
const SHOT_U = .3, shotImg = {};
function buildShotImages() {
  for (const id in SHOT_ART) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -48 48 96" width="${48 * SHOT_U * SKIN_RES}" height="${96 * SHOT_U * SKIN_RES}">${SHOT_ART[id]}</svg>`;
    const rec = shotImg[id] = { ready: false }, img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = Math.round(48 * SHOT_U * SKIN_RES); c.height = Math.round(96 * SHOT_U * SKIN_RES);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); rec.cv = c; rec.ready = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
// ang: direção do tiro (0 = para cima); spin: gira o desenho (disco do bumerangue)
function drawSkinShot(id, x, y, ang, s, spin) {
  const rec = shotImg[id]; if (!rec || !rec.ready) return false;
  const u = SHOT_U * (s || 1);
  cx.save(); cx.translate(x, y); cx.rotate(spin !== undefined ? spin : ang);
  cx.drawImage(rec.cv, -24 * u, -48 * u, 48 * u, 96 * u);
  cx.restore();
  return true;
}
// skin que vale para este tiro (só a arma da própria nave) ou null
function shotSkin(p, w) { return p.skin && p.skin !== 'classic' && w.type === SHIPS[p.ship].weapon && SHOT_ART[p.skin] ? p.skin : null; }

// ---------- Bumerangue de cada skin (só visual; gira em volta do centro 0,0) ----------
const BOOM_ART = {
  dragao: `<path d="M-26 14 Q-14 -4 0 -20 Q14 -4 26 14 L18 18 Q8 4 0 -6 Q-8 4 -18 18 Z" fill="#B8231A" stroke="#24160c" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M-20 12 Q-10 -2 0 -14 Q10 -2 20 12" fill="none" stroke="#FFB52E" stroke-width="3" stroke-linecap="round"/>
<path d="M-26 14 Q-34 4 -30 -6 Q-26 2 -22 0 Q-22 8 -18 18 Z M26 14 Q34 4 30 -6 Q26 2 22 0 Q22 8 18 18 Z M0 -20 Q-8 -28 -2 -36 Q0 -28 4 -30 Q6 -24 0 -20 Z" fill="#FFB52E" stroke="#24160c" stroke-width="2.5" stroke-linejoin="round"/>
<circle cy="-2" r="4" fill="#FFF3A0"/>`,
  espectro: `<path d="M-22 16 L0 -14 L22 16" fill="none" stroke="#24160c" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M-22 16 L0 -14 L22 16" fill="none" stroke="#EDE3C8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#EDE3C8" stroke="#24160c" stroke-width="2.5"><circle cx="-26" cy="14" r="5"/><circle cx="-20" cy="20" r="5"/><circle cx="26" cy="14" r="5"/><circle cx="20" cy="20" r="5"/><circle cy="-15" r="6"/></g>
<circle cx="-2" cy="-16" r="1.8" fill="#7CF5C8"/><circle cx="2" cy="-16" r="1.8" fill="#7CF5C8"/>`,
  geada: `<path d="M-28 16 L-6 -10 L0 -24 L6 -10 L28 16 L14 14 L0 0 L-14 14 Z" fill="#9fe6ff" stroke="#24160c" stroke-width="3" stroke-linejoin="round"/>
<path d="M0 -24 L6 -10 L0 0 Z M-28 16 L-6 -10 L-10 6 Z" fill="#fff" opacity=".7"/><path d="M28 16 L6 -10 L14 14 Z" fill="#2F6FB5" opacity=".4"/>`,
  bosque: `<path d="M0 -28 C20 -18 22 14 0 28 C-22 14 -20 -18 0 -28 Z" fill="#5DAE4A" stroke="#24160c" stroke-width="3"/>
<path d="M0 -24 L0 24 M0 -10 L-10 -16 M0 -10 L10 -16 M0 4 L-12 -2 M0 4 L12 -2 M0 16 L-8 12 M0 16 L8 12" stroke="#2f6e2b" stroke-width="2.2" stroke-linecap="round" fill="none"/>
<path d="M-12 -12 C-8 -18 -4 -20 0 -22" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".5" fill="none"/>`,
  garra: `<path d="M-28 12 L0 -20 L28 12 L18 18 L0 -4 L-18 18 Z" fill="#5a5f68" stroke="#24160c" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M-24 10 L0 -16 L24 10" fill="none" stroke="#ff7a3a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#c9ccd1" stroke="#24160c" stroke-width="2"><path d="M-14 -4 L-20 -12 L-10 -9 Z M14 -4 L20 -12 L10 -9 Z"/></g><circle cy="-6" r="3" fill="#ffcf60"/>`,
  lamina: `<path d="M-28 14 Q-14 -6 0 -22 Q14 -6 28 14 L20 16 Q8 2 0 -8 Q-8 2 -20 16 Z" fill="#F2C230" stroke="#24160c" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M-22 10 Q-10 -6 0 -16" fill="none" stroke="#fff8d0" stroke-width="3" stroke-linecap="round"/>
<path d="M0 -12 L2.5 -6 L8 -4 L2.5 -2 L0 4 L-2.5 -2 L-8 -4 L-2.5 -6 Z" fill="#2A55B8" stroke="#24160c" stroke-width="1.5"/>`,
  vazio: `<path d="M-26 16 Q-26 -20 10 -26 Q-12 -14 -12 8 Q-6 18 8 22 Q-12 26 -26 16 Z" fill="#5a2a86" stroke="#24160c" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M8 -24 Q-10 -12 -10 8" fill="none" stroke="#8CF04A" stroke-width="3" stroke-linecap="round"/>
<path d="M14 -28 Q22 -34 18 -40 Q24 -34 24 -28 Q20 -24 14 -28 Z" fill="#8CF04A" stroke="#24160c" stroke-width="2"/>
<ellipse cx="-14" cy="4" rx="4" ry="6" fill="#8CF04A" stroke="#24160c" stroke-width="2"/><ellipse cx="-14" cy="4" rx="1.4" ry="4" fill="#1a0a24"/>`,
  sucata: `<g fill="#8A8F96" stroke="#24160c" stroke-width="3" stroke-linejoin="round">${[...Array(8)].map((_, i) => `<rect x="-5" y="-27" width="10" height="10" rx="2" transform="rotate(${i * 45})"/>`).join('')}</g>
<circle r="20" fill="#E08A2E" stroke="#24160c" stroke-width="3.5"/><circle r="8" fill="#8A8F96" stroke="#24160c" stroke-width="3"/>
<g fill="#24160c"><circle cx="-12" cy="0" r="2"/><circle cx="12" cy="0" r="2"/><circle cx="0" cy="-12" r="2"/><circle cx="0" cy="12" r="2"/></g>
<path d="M-12 -10 A15 15 0 0 1 2 -16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
};
const BOOM_U = .45, boomImg = {};
function buildBoomImages() {
  for (const id in BOOM_ART) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-42 -42 84 84" width="${84 * BOOM_U * SKIN_RES}" height="${84 * BOOM_U * SKIN_RES}">${BOOM_ART[id]}</svg>`;
    const rec = boomImg[id] = { ready: false }, img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = Math.round(84 * BOOM_U * SKIN_RES);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); rec.cv = c; rec.ready = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
function drawSkinBoomerang(id, x, y, rot, explo) {
  const rec = boomImg[id]; if (!rec || !rec.ready) return false;
  const u = BOOM_U * 1.35, sk = skinById(id);
  cx.save(); cx.translate(x, y);
  cx.globalAlpha = .22; cx.fillStyle = explo ? '#ffb347' : sk.shot; cx.beginPath(); cx.arc(0, 0, 16, 0, TAU); cx.fill(); cx.globalAlpha = 1;
  cx.rotate(rot); cx.drawImage(rec.cv, -42 * u, -42 * u, 84 * u, 84 * u);
  cx.restore();
  return true;
}
// rastro do bumerangue enquanto voa (mesmo tipo de rastro da nave)
function skinBoomTrail(b, dt) {
  if (b.type !== 'boomerang' || !b.sk) return;
  b.trT = (b.trT || 0) - dt; if (b.trT > 0) return;
  const sk = skinById(b.sk); if (!sk.trail) return;
  b.trT = sk.trail === 'puff' || sk.trail === 'smoke' ? .06 : .035;
  S.fx.push({ type: 'trail', k: sk.trail, x: b.x + rnd(-5, 5), y: b.y + rnd(-5, 5), vx: rnd(-20, 20), vy: rnd(-20, 20),
    t: 0, life: rnd(.3, .5), r: rnd(2.5, 4.2), color: sk.tcol, rot: rnd(0, 6) });
}
