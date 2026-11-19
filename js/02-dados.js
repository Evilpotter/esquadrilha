// ---------- Armas ----------
const WEAPONS = {
  gun:     { name: 'Metralhadora', desc: 'Tiros rápidos para a frente', cd: .16, dmg: 9, spd: 720, shots: 1, r: 4, color: '#fff4a0' },
  spread:  { name: 'Leque', desc: 'Rajada de tiros em leque', cd: .55, dmg: 7, spd: 620, shots: 5, r: 4, color: '#9ff3ff' },
  missile: { name: 'Mísseis teleguiados', desc: 'Perseguem o inimigo mais próximo', cd: .85, dmg: 22, spd: 380, shots: 2, r: 5, color: '#ff8a5c', homing: true },
  plasma:  { name: 'Canhão de plasma', desc: 'Bola de energia que atravessa os inimigos', cd: 1.1, dmg: 38, spd: 430, shots: 1, r: 11, color: '#c78bff', pierce: 6 },
  drone:   { name: 'Drones de apoio', desc: 'Dois drones ao lado da nave que atiram junto', cd: .35, dmg: 7, spd: 650, shots: 2, r: 3, color: '#8f8', drone: true },
  ricochet: { name: 'Ricochete', desc: 'Tiro que quica nas bordas da tela e nos inimigos até 3 vezes', cd: .38, dmg: 9, spd: 640, shots: 1, r: 5, color: '#ffe066' },
  chain:   { name: 'Raio em cadeia', desc: 'Relâmpago que acerta o inimigo mais próximo e pula para mais 3 (perde força a cada salto)', cd: .6, dmg: 14, spd: 0, shots: 1, r: 0, color: '#bfe9ff' },
  saw:     { name: 'Serra orbital', desc: 'Duas lâminas giram em volta da nave cortando inimigos e destruindo tiros', cd: .4, dmg: 8, spd: 0, shots: 2, r: 11, color: '#d8e4ee' },
  // armas exclusivas de nave (não aparecem como recompensa)
  boomerang: { name: 'Bumerangue', desc: 'Vai, atravessa todos os inimigos e volta para a nave', cd: .32, dmg: 7, spd: 760, shots: 1, r: 10, color: '#7ff0c8', range: 560, ship: true },
  barrage:   { name: 'Saraivada de mísseis', desc: 'Mísseis balísticos em linha reta com pequena explosão em área', cd: .66, dmg: 5, spd: 240, shots: 5, r: 4, color: '#ffcf60', splashR: 38, splash: .5, ship: true },
};
function newWeapon(type) {
  const d = WEAPONS[type];
  return { type, shots: d.shots, dmgM: 1, cdM: 1, explosive: d.splashR || 0, pierce: d.pierce || 0, range: 1, t: 0, lvl: 1 };
}

// Upgrades de arma (recompensa do chefão) — fortes
const WUPS = [
  { id: 'shots', name: w => ({ drone: '+1 drone', boomerang: '+1 bumerangue', barrage: '+2 mísseis por saraivada', spread: '+2 projéteis por disparo', ricochet: '+1 tiro ricochete', chain: '+1 raio', saw: '+1 lâmina' })[w.type] || '+1 projétil por disparo',
    desc: w => ({ boomerang: 'Lança mais um disco em leque', chain: 'Dispara mais um raio em outro inimigo', saw: 'Mais uma lâmina girando em volta da nave' })[w.type] || 'Mais tiros a cada disparo',
    apply: w => { w.shots += (w.type === 'spread' || w.type === 'barrage') ? 2 : 1; } },
  { id: 'explo', name: w => w.explosive ? 'Explosão maior' : 'Tiros explosivos',
    desc: w => w.explosive ? 'Raio da explosão +40%' : 'Os tiros explodem ao contato e causam dano em área',
    apply: w => { w.explosive = w.explosive ? w.explosive * 1.4 : 55; } },
  { id: 'pierce', name: w => ({ boomerang: 'Alcance +35%', ricochet: '+2 quiques', chain: '+2 saltos', saw: 'Órbita +35%' })[w.type] || 'Perfurante +2',
    desc: w => ({ boomerang: 'O bumerangue vai mais longe antes de voltar', ricochet: 'O tiro quica mais 2 vezes antes de sumir', chain: 'O raio pula para mais 2 inimigos', saw: 'As lâminas giram mais longe da nave' })[w.type] || 'Cada tiro atravessa mais 2 inimigos',
    apply: w => { if (w.type === 'boomerang' || w.type === 'saw') w.range *= 1.35; else w.pierce += 2; } },
  { id: 'dmg', name: () => 'Dano da arma +60%', desc: () => 'Aumento forte de dano só nesta arma', apply: w => { w.dmgM *= 1.6; } },
  { id: 'rate', name: () => 'Cadência da arma +40%', desc: () => 'Esta arma dispara bem mais rápido', apply: w => { w.cdM /= 1.4; } },
];

// Melhorias por nível (XP) — menores
const SUPS = [
  { name: 'Dano +15%', desc: 'Todas as armas', apply: p => { p.dmg *= 1.15; } },
  { name: 'Velocidade de ataque +12%', desc: 'Todas as armas disparam mais rápido', apply: p => { p.rate *= 1.12; } },
  { name: 'Vida máxima +20', desc: 'E recupera 20 de vida', apply: p => { p.maxHp += 20; p.hp += 20; } },
  { name: 'Escudo +15', desc: 'Absorve dano e recarrega após 3 s', apply: p => { p.maxSh += 15; p.sh += 15; } },
  { name: 'Velocidade +10%', desc: 'A nave se move mais rápido', apply: p => { p.spd *= 1.1; } },
  { name: 'Regeneração +1/s', desc: 'Recupera vida aos poucos', apply: p => { p.regen += 1; } },
  { name: 'Ímã de XP +40%', desc: 'Puxa os cristais de mais longe', apply: p => { p.mag *= 1.4; } },
  { name: 'Reparo', desc: 'Recupera 50% da vida agora', apply: p => { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .5); } },
  { name: 'Crítico +8%', desc: 'Chance de causar dano dobrado', apply: p => { p.crit += .08; } },
];

// w = peso no sorteio das ondas; from = fase em que começa a aparecer
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
