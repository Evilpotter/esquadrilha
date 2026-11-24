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
  // ---- Fênix (sugestão do Claude aprovada para teste em 22/11/2026) ----
  // feather = arma da nave; as marcadas com fenix: true só aparecem como recompensa de chefão para ela
  feather:   { name: 'Penas de fogo', desc: 'Leque curto de penas em chamas: quem é atingido pega fogo', cd: .4, dmg: 3, spd: 640, shots: 3, r: 6, color: '#ffb347', ship: true },
  wings:     { name: 'Asas de fogo', desc: 'Deixa um rastro de fogo por onde a nave passa', cd: .16, dmg: 5, spd: 0, shots: 1, r: 22, color: '#ff8a2a', fenix: true, noUp: ['explo'] },
  meteor:    { name: 'Chuva de meteoros', desc: 'Meteoros caem do céu em cima dos inimigos e explodem em fogo', cd: 3.5, dmg: 30, spd: 0, shots: 3, r: 12, color: '#ff6a2a', splashR: 70, splash: 1, fenix: true, noUp: ['pierce'] },
  chick:     { name: 'Filhote de fênix', desc: 'Um filhote voa junto e mergulha nos inimigos, deixando fogo', cd: 1.1, dmg: 14, spd: 0, shots: 1, r: 10, color: '#ffcf60', fenix: true, noUp: ['pierce'] },
  sun:       { name: 'Sol nascente', desc: 'Onda de calor pela tela toda: queima todos os inimigos e derrete os tiros deles', cd: 12, dmg: 12, spd: 900, shots: 1, r: 0, color: '#ffd23a', fenix: true, noUp: ['explo'] },
  // ---- Hypnos (nome do Bryan, 24/11/2026; poder: hipnotizar inimigos) ----
  // hypno = arma da nave; as marcadas com hypnos: true só aparecem como recompensa de chefão para ela
  hypno:     { name: 'Onda hipnótica', desc: 'Espirais que hipnotizam: com 3 acertos o inimigo vira seu aliado por um tempo', cd: .45, dmg: 9, spd: 420, shots: 2, r: 9, color: '#c77dff', ship: true },
  grito:     { name: 'Grito psíquico', desc: 'Um grito pela tela toda: deixa todos os inimigos tontos e marca cada um com hipnose', cd: 9, dmg: 8, spd: 1100, shots: 1, r: 0, color: '#e0a8ff', hypnos: true, noUp: ['explo'] },
  clone:     { name: 'Clone', desc: 'Uma cópia da nave aparece do lado e atira as espirais junto por um tempo', cd: 18, dmg: 0, spd: 0, shots: 1, r: 0, color: '#c77dff', hypnos: true, noUp: ['explo', 'pierce'] },
  ima:       { name: 'Ímã mental', desc: 'Um ponto que puxa os inimigos para o meio e vai hipnotizando quem está perto', cd: 6, dmg: 5, spd: 0, shots: 1, r: 120, color: '#b06cff', hypnos: true, noUp: ['explo'] },
  rei:       { name: 'Rei dos lacaios', desc: 'Hipnotiza na hora o inimigo mais forte da tela (menos chefões), que luta mais tempo do seu lado', cd: 14, dmg: 0, spd: 0, shots: 1, r: 0, color: '#ffd36b', hypnos: true, noUp: ['explo'] },
};
// números da Hypnos (tempos em segundos, distâncias em px)
const HYPNOS = {
  hipnose: { marcas: 3, tempoMarca: 4, aliado: 8, max: 4, raioMax: 24 }, // 3 acertos viram aliado por 8 s; até 4 aliados por nave; só inimigos até este raio
  naoConverte: ['mine', 'rock', 'base', 'kraken', 'fantasma'],          // nunca viram aliados (o Rei dos lacaios só não pega mina e asteroide)
  orbe:    { vida: 1.25 },                                                // espirais somem depois de 1,25 s (alcance médio, ~520 px)
  aliado:  { cad: .55, dano: 7, alcance: 520, vel: 420, escudo: 3, explosao: 60, danoExplosao: 18 }, // escudo = tiros que o aliado aguenta na frente da dupla
  grito:   { tonto: 1.2, chefao: .5, maisTempo: .4 },                     // tontos por 1,2 s (+0,4 s por ponto de melhoria); chefões: metade
  clone:   { dura: 6, distancia: 70 },
  ima:     { dura: 2.5, puxa: 170, tick: .5, distancia: 230 },
  rei:     { dura: 12, maisDura: 1.5, forca: 1.6 },                       // aliado do rei: 12 s (+1,5 s por ponto de melhoria), tiros 60% mais fortes
};
// números da Fênix (tempos em segundos, distâncias em px)
const FENIX = {
  queima:   { dps: 9, tempo: 3, max: 3, tick: .25 },      // cada chama tira 9 de vida por segundo, dura 3 s; até 3 chamas no mesmo inimigo
  pena:     { vida: .55, abertura: .5 },                   // penas somem depois de 0,55 s (curto alcance); leque de 0,5 rad
  renascer: { ovo: 2, vida: .5, raio: 170, dano: 40, inv: 1.5 }, // 2 s de ovo, volta com 50% da vida e explode em fogo
  asas:     { vida: 1.6, tick: .4, maisVida: .4 },         // chama do rastro dura 1,6 s (+40% por ponto de melhoria), queima a cada 0,4 s
  meteoro:  { aviso: .7, queda: .35 },                     // sombra no chão por 0,7 s, depois cai em 0,35 s
  filhote:  { alcance: 360, voo: 300, mergulho: 900 },
  sol:      { chamas: 1, raioTiro: 22 },                   // chamas por onda (+1 por ponto de melhoria); derrete tiros a 22 px da borda
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
      anchor: '+1 âncora', wave: '+1 onda', dragon: 'Jato duplo', broadside: '+1 canhão de cada lado', barrel: '+1 barril', parrot: '+1 papagaio', whirl: '+1 redemoinho',
      feather: '+2 penas', wings: 'Rastro mais largo', meteor: '+1 meteoro', chick: '+1 filhote', sun: '+1 onda de calor',
      hypno: '+1 espiral', grito: '+1 grito', clone: '+1 clone', ima: '+1 ímã', rei: '+1 lacaio real' })[w.type] || '+1 projétil por disparo',
    desc: w => ({ boomerang: 'Lança mais um disco em leque', chain: 'Dispara mais um raio em outro inimigo', saw: 'Mais uma lâmina girando em volta da nave',
      anchor: 'Arremessa mais uma âncora em outro inimigo', wave: 'Solta uma segunda onda logo depois da primeira', dragon: 'O dragão solta dois jatos de água',
      broadside: 'Mais uma bola de canhão para cada lado', barrel: 'Larga mais um barril de cada vez', parrot: 'Mais um papagaio voando junto', whirl: 'Cria mais um redemoinho',
      feather: 'O leque solta mais 2 penas', wings: 'O rastro de fogo fica mais largo', meteor: 'Cai mais um meteoro de cada vez', chick: 'Mais um filhote voando junto', sun: 'Solta uma segunda onda logo depois',
      hypno: 'Solta mais uma espiral de cada vez', grito: 'Solta um segundo grito logo depois', clone: 'Aparece mais um clone do outro lado', ima: 'Cria mais um ímã em outro inimigo', rei: 'Hipnotiza mais um inimigo forte de cada vez' })[w.type] || 'Mais tiros a cada disparo',
    apply: w => { w.shots += (w.type === 'spread' || w.type === 'barrage' || w.type === 'feather') ? 2 : 1; } },
  { id: 'explo', name: w => w.explosive ? 'Explosão maior' : ({ anchor: 'Âncora explosiva', parrot: 'Bicadas explosivas', feather: 'Penas explosivas', chick: 'Mergulho explosivo', hypno: 'Espirais explosivas' })[w.type] || 'Tiros explosivos',
    desc: w => w.explosive ? 'Raio da explosão +40%' : 'Os tiros explodem ao contato e causam dano em área',
    apply: w => { w.explosive = w.explosive ? w.explosive * 1.4 : 55; } },
  { id: 'pierce', name: w => ({ boomerang: 'Alcance +35%', ricochet: '+2 quiques', chain: '+2 saltos', saw: 'Órbita +35%',
      anchor: 'Corrente mais longa', wave: 'Lentidão mais longa', dragon: 'Dragão dura +2 s', whirl: 'Redemoinho maior',
      wings: 'Fogo dura mais', sun: 'Queima mais forte',
      grito: 'Tontos por mais tempo', ima: 'Ímã maior', rei: 'Reinado mais longo' })[w.type] || 'Perfurante +2',
    desc: w => ({ boomerang: 'O bumerangue vai mais longe antes de voltar', ricochet: 'O tiro quica mais 2 vezes antes de sumir', chain: 'O raio pula para mais 2 inimigos', saw: 'As lâminas giram mais longe da nave',
      anchor: 'A âncora alcança 35% mais longe', wave: 'Os inimigos ficam lentos por mais 1,5 s', dragon: 'Fica mais tempo na forma de dragão', whirl: 'O redemoinho fica 35% maior',
      feather: 'Cada pena atravessa mais 2 inimigos', wings: 'As chamas do rastro ficam mais tempo no chão', sun: 'A onda de calor põe mais 2 chamas em cada inimigo',
      hypno: 'Cada espiral atravessa mais 2 inimigos', grito: 'Os inimigos ficam tontos 0,8 s a mais', ima: 'O ímã puxa de 35% mais longe', rei: 'O lacaio real luta 3 s a mais' })[w.type] || 'Cada tiro atravessa mais 2 inimigos',
    apply: w => { if (['boomerang', 'saw', 'anchor', 'whirl', 'ima'].includes(w.type)) w.range *= 1.35; else w.pierce += 2; } },
  { id: 'dmg', name: () => 'Dano da arma +60%', desc: () => 'Aumento forte de dano só nesta arma', apply: w => { w.dmgM *= 1.6; } },
  { id: 'rate', name: w => ({ dragon: 'Recarga do dragão −30%', wave: 'Recarga da onda −30%', parrot: 'Bicadas +40% mais rápidas', sun: 'Recarga do sol −30%', chick: 'Mergulhos +40% mais rápidos', meteor: 'Meteoros mais frequentes',
      grito: 'Recarga do grito −30%', clone: 'Recarga do clone −30%', ima: 'Ímãs mais frequentes', rei: 'Recarga do rei −30%' })[w.type] || 'Cadência da arma +40%',
    desc: w => ({ dragon: 'Vira dragão mais vezes', wave: 'Solta ondas mais vezes', sun: 'Solta a onda de calor mais vezes', meteor: 'A chuva de meteoros vem mais vezes',
      grito: 'Grita mais vezes', clone: 'O clone aparece mais vezes', ima: 'Cria ímãs mais vezes', rei: 'Hipnotiza inimigos fortes mais vezes' })[w.type] || 'Esta arma dispara bem mais rápido', apply: w => { w.cdM /= 1.4; } },
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
