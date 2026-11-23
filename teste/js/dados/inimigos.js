// ---------- Dados: inimigos e cenários ----------
const ETYPES = {
  scout:    { name: 'Batedor',      hp: 14,  r: 14, vy: 165, xp: 1, color: '#d94a3a', dark: '#7a1f16', from: 1, w: 4 },
  zig:      { name: 'Zigue-zague',  hp: 20,  r: 15, vy: 115, xp: 1, color: '#3aa060', dark: '#1a5a30', from: 1, w: 3 },
  swooper:  { name: 'Rasante',      hp: 18,  r: 14, vy: 0,   xp: 1, color: '#e07ab0', dark: '#8a2c60', from: 1, w: 2 },
  gunner:   { name: 'Atirador',     hp: 50,  r: 19, vy: 95,  xp: 3, color: '#7a5bd0', dark: '#3e2a80', shoot: 1.7, from: 1, w: 2 },
  kamikaze: { name: 'Kamikaze',     hp: 22,  r: 13, vy: 140, xp: 2, color: '#ff5a1f', dark: '#8a2a00', from: 2, w: 2 },
  heavy:    { name: 'Bombardeiro',  hp: 150, r: 27, vy: 45,  xp: 6, color: '#7a7a7a', dark: '#3a3a3a', shoot: 2.3, from: 2, w: 1 },
  splitter: { name: 'Divisor',      hp: 45,  r: 20, vy: 80,  xp: 2, color: '#2fb8b0', dark: '#126660', from: 3, w: 2 },
  mini:     { name: 'Fragmento',    hp: 10,  r: 10, vy: 200, xp: 1, color: '#2fb8b0', dark: '#126660', from: 99, w: 0 },
  spinner:  { name: 'Torre giratória', hp: 90, r: 22, vy: 55, xp: 4, color: '#c9a227', dark: '#6e5810', from: 3, w: 1 },
  sniper:   { name: 'Franco-atirador', hp: 40, r: 16, vy: 110, xp: 3, color: '#5a6b7a', dark: '#2a3540', from: 4, w: 1 },
  miner:    { name: 'Minador',      hp: 60,  r: 20, vy: 70,  xp: 3, color: '#8b5a2b', dark: '#4a2d10', from: 4, w: 1 },
  hunter:   { name: 'Caçador',      hp: 70,  r: 18, vy: 70,  xp: 4, color: '#b8c43a', dark: '#5e6510', shoot: 1.3, from: 5, w: 1 },
  mine:     { name: 'Mina',         hp: 12,  r: 11, vy: 40,  xp: 0, color: '#333', dark: '#111', from: 99, w: 0 },
};

const PHASE_LEN = 60;

// ---------- Cenários ----------
const SCENES = { sea: { name: 'Oceano' }, desert: { name: 'Deserto' }, space: { name: 'Espaço' }, piratas: { name: 'Mar dos Piratas' } };
const SCENE_KEYS = Object.keys(SCENES);
for (const k in ETYPES) if (!ETYPES[k].scene && ETYPES[k].from < 99) ETYPES[k].scene = 'sea';
Object.assign(ETYPES, {
  jeep:    { name: 'Jipe',             hp: 25,  r: 12, xp: 1, color: '#7a6a3a', dark: '#3e3418', from: 1, w: 3, scene: 'desert', ground: true },
  heli:    { name: 'Helicóptero',      hp: 35,  r: 18, xp: 2, color: '#5d6b3a', dark: '#2e361c', from: 1, w: 3, scene: 'desert' },
  tank:    { name: 'Tanque',           hp: 80,  r: 20, xp: 3, color: '#6b7a3a', dark: '#343d1a', from: 1, w: 2, scene: 'desert', ground: true },
  flak:    { name: 'Artilharia',       hp: 60,  r: 18, xp: 3, color: '#8a7a5a', dark: '#45392a', from: 2, w: 1, scene: 'desert', ground: true },
  base:    { name: 'Base fortificada', hp: 260, r: 36, xp: 8, color: '#9a8a6a', dark: '#4d4434', from: 2, w: 1, scene: 'desert', ground: true },
  swarm:   { name: 'Enxame',           hp: 10,  r: 10, xp: 1, color: '#b06cff', dark: '#4a1f80', from: 1, w: 3, scene: 'space' },
  ufo:     { name: 'Disco voador',     hp: 40,  r: 18, xp: 2, color: '#9be37a', dark: '#2f6b20', from: 1, w: 3, scene: 'space' },
  rock:    { name: 'Asteroide',        hp: 55,  r: 26, xp: 1, color: '#8a8580', dark: '#4a4642', from: 1, w: 2, scene: 'space' },
  beamer:  { name: 'Raio alienígena',  hp: 70,  r: 20, xp: 4, color: '#ff7ad9', dark: '#7a1f63', from: 2, w: 1, scene: 'space' },
  blinker: { name: 'Teleportador',     hp: 45,  r: 16, xp: 3, color: '#5ae0e0', dark: '#1a6a6a', from: 3, w: 1, scene: 'space' },
  // Mar dos Piratas (comportamento em js/inimigos/piratas.js; números em PIRATAS_INI, abaixo)
  bote:     { name: 'Bote pirata',         hp: 22,  r: 13, xp: 1, color: '#9b6a3c', dark: '#5a3a1e', from: 1, w: 3, scene: 'piratas', ground: true },
  gaivota:  { name: 'Gaivota',             hp: 10,  r: 11, xp: 1, color: '#f2f2ea', dark: '#7a8590', from: 1, w: 3, scene: 'piratas' },
  escuna:   { name: 'Escuna',              hp: 90,  r: 24, xp: 3, color: '#7a4a2a', dark: '#3e2414', from: 1, w: 2, scene: 'piratas', ground: true },
  balao:    { name: 'Balão pirata',        hp: 45,  r: 20, xp: 2, color: '#c2362b', dark: '#6a1a12', from: 2, w: 2, scene: 'piratas' },
  kraken:   { name: 'Tentáculo do Kraken', hp: 70,  r: 20, xp: 4, color: '#9a4ab0', dark: '#4a1a5a', from: 2, w: 1, scene: 'piratas', ground: true },
  fantasma: { name: 'Navio fantasma',      hp: 220, r: 34, xp: 8, color: '#7af0c0', dark: '#1a6a50', from: 3, w: 1, scene: 'piratas', ground: true },
});

// ---------- Tiros dos inimigos ----------
// Cada inimigo atira o tipo que combina com ele (escolhido no comportamento, em js/inimigos/).
// dano = antes do multiplicador da fase (eDmg). Inimigos simples: todos 12. Fortes: míssil.
// O desenho de cada tipo fica em js/visual/tiros-inimigos.js (a cor segue a do inimigo).
const ETIROS = {
  bala:         { nome: 'Bala',            dano: 12 },  // estilhaços de mina e de granada
  laser:        { nome: 'Laser',           dano: 12 },  // naves e aviões
  laserForte:   { nome: 'Laser carregado', dano: 18 },  // franco-atirador
  metralhadora: { nome: 'Metralhadora',    dano: 12 },  // jipe, helicóptero, torre giratória, tanque, base
  plasma:       { nome: 'Plasma',          dano: 12 },  // disco voador
  granada:      { nome: 'Granada',         dano: 14 },  // artilharia (estoura em estilhaços)
  missil:       { nome: 'Míssil',          dano: 22 },  // bombardeiro, tanque, base fortificada
  chefao:       { nome: 'Tiro de chefão',  dano: 12 },  // chefões usam BOSS_DMG (js/dados/chefoes.js)
  // Mar dos Piratas
  mosquete:     { nome: 'Mosquete',        dano: 12 },  // bote pirata
  balaCanhao:   { nome: 'Bala de canhão',  dano: 20 },  // escuna
  barril:       { nome: 'Barril de pólvora', dano: 14 }, // balão pirata (estoura em estilhaços)
  tinta:        { nome: 'Tinta do Kraken', dano: 12 },  // tentáculo do Kraken
  chamaFantasma:{ nome: 'Chama fantasma',  dano: 14 },  // navio fantasma
};
// Inimigos do Mar dos Piratas: tempos em segundos, vel = multiplica a velocidade dos tiros da fase
const PIRATAS_INI = {
  bote:     { grupo: 3, remo: 45, tiro: 2.2, variacao: .25, vel: .85 },
  gaivota:  { grupo: 5, desce: 150, mergulhaY: .3, mergulho: 330, grita: true },
  escuna:   { desce: 22, canhao: 2.6, vel: .7, raio: 8, bordada: 3, bordadaAbre: .35 }, // a cada 2 tiros do canhão de proa, uma bordada para os dois lados
  balao:    { desce: 70, paraMin: 90, paraMax: 200, deriva: 55, fica: 8, barril: 2.8, vel: .55, estilhacos: 7 },
  kraken:   { sobe: .6, fica: 6, afunda: .6, tinta: 1.8, tiros: 3, abre: .28, vel: .75 },
  fantasma: { desce: 18, some: 2.2, aparece: 3.2, fade: .5, anel: 10, velAnel: .45, mira: 3, velMira: .8, recarga: 1.6 },
};
// Jipe: vem em grupo de 3; cada um atira de tempo em tempo (o intervalo varia um pouco
// para os 3 não atirarem juntos). tiros = 1 tiro só; 2 = tiro duplo (aberto por "abertura").
const JIPE_TIRO = { intervalo: 2, variacao: .25, tiros: 1, abertura: .2, vel: .9 };
// Tanque: rajada da metralhadora entre um míssil e outro
const TANQUE_METRALHA = { intervalo: 1.6, tiros: 3, espaco: .1, vel: 1.15 };
