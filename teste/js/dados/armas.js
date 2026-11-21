// ---------- Dados: armas e melhorias ----------
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
  // ---- Âncora Negra (ideia do Bryan) ----
  // anchor = arma da nave; as marcadas com pirata: true só aparecem como recompensa de chefão para ela
  // noUp = melhorias fortes (WUPS) que não servem para a arma
  anchor:    { name: 'Âncora', desc: 'Arremessa a âncora no inimigo mais perto e puxa de volta, acertando na ida e na volta', cd: .6, dmg: 18, spd: 950, shots: 1, r: 13, color: '#c9ccd1', range: 270, ship: true },
  wave:      { name: 'Onda', desc: 'Um anel de água cobre a tela: pouco dano e deixa todos os inimigos lentos', cd: 7, dmg: 10, spd: 950, shots: 1, r: 0, color: '#6fd6ff', pirata: true, noUp: ['explo'] },
  dragon:    { name: 'Dragão de água', desc: 'Vira um dragão de água por um tempo: toma 70% menos dano e solta um jato de água forte', cd: 40, dmg: 7, spd: 760, shots: 1, r: 6, color: '#8fe6ff', pirata: true, noUp: ['explo'] },
  broadside: { name: 'Canhões de bordo', desc: 'Bolas de canhão para os dois lados da nave', cd: 1.2, dmg: 16, spd: 560, shots: 1, r: 6, color: '#3a3a3a', pirata: true },
  barrel:    { name: 'Barril de pólvora', desc: 'Larga um barril para trás que explode quando um inimigo encosta', cd: 2.2, dmg: 40, spd: 0, shots: 1, r: 12, color: '#a0662e', splashR: 85, splash: 1, pirata: true, noUp: ['pierce'] },
  parrot:    { name: 'Papagaio', desc: 'Um papagaio voa junto e bica os inimigos que chegam perto', cd: .45, dmg: 10, spd: 620, shots: 1, r: 9, color: '#3fbf4f', pirata: true, noUp: ['pierce'] },
  whirl:     { name: 'Redemoinho', desc: 'Um redemoinho na frente da nave puxa os inimigos para o meio e machuca', cd: 5, dmg: 6, spd: 0, shots: 1, r: 110, color: '#5fc8e8', pirata: true, noUp: ['explo'] },
};
// números das armas piratas (tempos em segundos, distâncias em px)
const PIRATA = {
  ancora:     { volta: 1400, puxaRaio: 16, solta: 90 },        // velocidade da volta; inimigos até este raio são puxados; soltos a esta distância da nave
  onda:       { lento: .4, tempo: 3, tempoMelhoria: .75, chefao: .5 }, // lentidão 40% por 3 s (+0,75 s por ponto de melhoria); chefões: metade
  dragao:     { dura: 6, defesa: .7, cadJato: .09, vidaJato: .5, perfura: 2, escala: 1.35 }, // dura 6 s (+1 s por ponto de melhoria); toma 70% menos dano
  canhao:     { abertura: .12 },                               // ângulo para a frente (rad) das bolas de canhão
  barril:     { pavio: 2.5, desce: 70 },
  papagaio:   { alcance: 320, voo: 620 },
  redemoinho: { dura: 3, puxa: 150, tick: .5, distancia: 250 },
};
function newWeapon(type) {
  const d = WEAPONS[type];
  return { type, shots: d.shots, dmgM: 1, cdM: 1, explosive: d.splashR || 0, pierce: d.pierce || 0, range: 1, t: 0, lvl: 1 };
}

// Upgrades de arma (recompensa do chefão) — fortes
const WUPS = [
  { id: 'shots', name: w => ({ drone: '+1 drone', boomerang: '+1 bumerangue', barrage: '+2 mísseis por saraivada', spread: '+2 projéteis por disparo', ricochet: '+1 tiro ricochete', chain: '+1 raio', saw: '+1 lâmina',
      anchor: '+1 âncora', wave: '+1 onda', dragon: 'Jato duplo', broadside: '+1 canhão de cada lado', barrel: '+1 barril', parrot: '+1 papagaio', whirl: '+1 redemoinho' })[w.type] || '+1 projétil por disparo',
    desc: w => ({ boomerang: 'Lança mais um disco em leque', chain: 'Dispara mais um raio em outro inimigo', saw: 'Mais uma lâmina girando em volta da nave',
      anchor: 'Arremessa mais uma âncora em outro inimigo', wave: 'Solta uma segunda onda logo depois da primeira', dragon: 'O dragão solta dois jatos de água',
      broadside: 'Mais uma bola de canhão para cada lado', barrel: 'Larga mais um barril de cada vez', parrot: 'Mais um papagaio voando junto', whirl: 'Cria mais um redemoinho' })[w.type] || 'Mais tiros a cada disparo',
    apply: w => { w.shots += (w.type === 'spread' || w.type === 'barrage') ? 2 : 1; } },
  { id: 'explo', name: w => w.explosive ? 'Explosão maior' : ({ anchor: 'Âncora explosiva', parrot: 'Bicadas explosivas' })[w.type] || 'Tiros explosivos',
    desc: w => w.explosive ? 'Raio da explosão +40%' : 'Os tiros explodem ao contato e causam dano em área',
    apply: w => { w.explosive = w.explosive ? w.explosive * 1.4 : 55; } },
  { id: 'pierce', name: w => ({ boomerang: 'Alcance +35%', ricochet: '+2 quiques', chain: '+2 saltos', saw: 'Órbita +35%',
      anchor: 'Corrente mais longa', wave: 'Lentidão mais longa', dragon: 'Dragão dura +2 s', whirl: 'Redemoinho maior' })[w.type] || 'Perfurante +2',
    desc: w => ({ boomerang: 'O bumerangue vai mais longe antes de voltar', ricochet: 'O tiro quica mais 2 vezes antes de sumir', chain: 'O raio pula para mais 2 inimigos', saw: 'As lâminas giram mais longe da nave',
      anchor: 'A âncora alcança 35% mais longe', wave: 'Os inimigos ficam lentos por mais 1,5 s', dragon: 'Fica mais tempo na forma de dragão', whirl: 'O redemoinho fica 35% maior' })[w.type] || 'Cada tiro atravessa mais 2 inimigos',
    apply: w => { if (['boomerang', 'saw', 'anchor', 'whirl'].includes(w.type)) w.range *= 1.35; else w.pierce += 2; } },
  { id: 'dmg', name: () => 'Dano da arma +60%', desc: () => 'Aumento forte de dano só nesta arma', apply: w => { w.dmgM *= 1.6; } },
  { id: 'rate', name: w => ({ dragon: 'Recarga do dragão −30%', wave: 'Recarga da onda −30%', parrot: 'Bicadas +40% mais rápidas' })[w.type] || 'Cadência da arma +40%',
    desc: w => ({ dragon: 'Vira dragão mais vezes', wave: 'Solta ondas mais vezes' })[w.type] || 'Esta arma dispara bem mais rápido', apply: w => { w.cdM /= 1.4; } },
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
