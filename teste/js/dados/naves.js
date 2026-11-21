// ---------- Naves ----------
// stats: 0 a 5 pontos, só para mostrar na tela de escolha
const SHIPS = [
  { id: 'falcon', name: 'Falcão', weapon: 'gun', rate: 1.25, tag: 'Nave base',
    desc: 'Tiro reto e rápido. Começa com +25% de velocidade de ataque.',
    short: 'Tiro reto e rápido. +25% de velocidade de ataque.',
    stats: [['Dano', 4], ['Cadência', 5], ['Perfuração', 1], ['Área', 0]] },
  { id: 'boomer', name: 'Bumerangue', weapon: 'boomerang', rate: 1, tag: 'Atravessa tudo',
    desc: 'Lança um disco que atravessa todos os inimigos, faz a curva e volta para a nave acertando de novo. Dano um pouco menor.',
    short: 'Atravessa todos os inimigos e volta acertando de novo. Dano menor.',
    stats: [['Dano', 3], ['Cadência', 3], ['Perfuração', 5], ['Área', 0]] },
  { id: 'artillery', name: 'Artilheiro', weapon: 'barrage', rate: 1, tag: 'Saraivada',
    desc: 'Dispara uma saraivada de mísseis balísticos em linha reta. Dano baixo por míssil, com pequena explosão em área.',
    short: 'Saraivada de mísseis em linha reta, com pequena explosão.',
    stats: [['Dano', 2], ['Cadência', 4], ['Perfuração', 1], ['Área', 4]] },
  // ideia do Bryan (21/11/2026): nave pirata de corpo a corpo, só com armas exclusivas (PIRATA em armas.js)
  { id: 'pirate', name: 'Âncora Negra', weapon: 'anchor', rate: 1, tag: 'Corpo a corpo', exclusivas: true,
    saque: 1, // Saque: cada inimigo derrotado pela âncora (ou pelo jato do dragão) cura esta vida
    desc: 'Arremessa uma âncora pesada no inimigo mais perto e puxa de volta. Saque: cada inimigo derrotado pela âncora cura 1 de vida. Só pega armas piratas.',
    short: 'Âncora de perto, dano alto. Cura ao derrotar inimigos. Armas piratas.',
    stats: [['Dano', 5], ['Cadência', 2], ['Perfuração', 3], ['Área', 1]] },
];

