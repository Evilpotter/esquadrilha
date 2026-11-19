// ---------- Dados: chefões ----------
// Para balancear, mexa só aqui. O comportamento fica em js/chefoes/chefoes.js.
// Valores em par [normal, fúria]: a fúria começa quando o chefão perde metade da vida.
// Velocidades de tiro são multiplicadores da velocidade-base dos tiros inimigos (que cresce com a fase).
// Tempos em segundos. Ângulos (abertura) em radianos.

// Vida = base × (1 + porFase × (fase − 1)) × doisJogadores (se houver J2) × vida do chefão
const BOSS_HP = { base: 900, porFase: .5, doisJogadores: 1.4 };
// Dano ao encostar no chefão e do raio (os dois crescem com a fase)
const BOSS_DMG = { toque: 30, toqueAriete: 40, raio: 25 };
// Ordem das fases (depois da 10ª recomeça com "+1", "+2"...)
const BOSS_ORDER = ['fortress', 'carrier', 'laser', 'vortex', 'ram', 'twins', 'sower', 'ghost', 'guardian', 'storm'];

const BOSS_DATA = {
  fortress: {
    name: 'Fortaleza Voadora', r: 60, vida: 1,
    vel: [70, 120],                 // patrulha
    intervalo: [2.1, 1.3],          // entre ataques (alterna anel → rajada → leque)
    velTiro: .9,
    anel: 14, anelPorFase: 2, anelRaio: 6,
    rajadas: 3, rajadaPausa: .18, rajadaTiros: 3, rajadaAbertura: .14, rajadaVel: 1.2,
    leque: 9, lequeAbertura: .17, lequeRaio: 7,
  },
  carrier: {
    name: 'Porta-aviões', r: 64, vida: 1.1,
    vel: 50,
    intervalo: [3, 2],              // lança escolta
    escolta: 'scout', escoltaFuria: 'kamikaze', escoltaPorLado: 2,
    anelIntervalo: 2.5, anel: 10, anelPorFase: 1, anelVel: .55, anelRaio: 7,
  },
  laser: {
    name: 'Colosso do Raio', r: 58, vida: 1,
    vel: 70,                        // segue o jogador
    intervalo: [3, 2.2],            // raio
    raioLargura: 38, raioAviso: 1, raioDura: .8,
    raioExtraDist: 160, raioExtraAviso: 1.3,   // na fúria: mais 2 raios dos lados
    tiroIntervalo: 1.5, tiros: 2, tiroAbertura: .2, tiroVel: 1, tiroRaio: 5,
  },
  vortex: {
    name: 'Vórtice', r: 54, vida: 1,
    ciclo: 6.5, atirando: 5,        // atira 5 s a cada 6,5 s
    giro: [1.7, 2.3],
    cadencia: .1, bracos: [3, 4], velTiro: .6, tiroRaio: 5,
  },
  ram: {
    name: 'Aríete', r: 50, vida: .9,
    vel: 90,
    intervalo: [3, 1.8],            // entre investidas
    aviso: [.75, .45],              // pisca antes de investir
    chanceTiro: 1.2,                // tiros mirados por segundo (média) na patrulha
    investida: 700,
    rastroCadencia: .07, rastroVel: .45, rastroRaio: 5,
    volta: 260,
    anel: 12, anelVel: .6, anelRaio: 6,
  },
  twins: {
    name: 'Gêmeos', r: 42, vida: 1, vidaCada: .55,
    giro: [.8, 1.4],                // fúria dos Gêmeos: quando um dos dois cai
    intervalo: [1.6, .9],
    tiros: 2, tiroAbertura: .12, tiroVel: 1.05,
    anel: 12, anelVel: .6, anelRaio: 5,   // só na fúria
  },
  sower: {
    name: 'Semeador', r: 56, vida: 1,
    vel: 80,
    minaIntervalo: [1.2, .8], minaPavio: 5,
    orbeIntervalo: [2.6, 1.6], orbePrimeiro: 2, orbeRaio: 8, orbeDano: 14, orbeDura: 5,
  },
  ghost: {
    name: 'Fantasma', r: 50, vida: 1,
    vel: 60,
    aparece: [2.8, 2], apareceInicio: 2.5, some: .5, escondido: .6,
    intervalo: [1.4, .9], tiros: 5, tiroAbertura: .16, tiroVel: 1,
    anel: 16, anelPorFase: 1, anelVel: .65, anelRaio: 6,  // ao reaparecer
  },
  guardian: {
    name: 'Guardião', r: 48, vida: .9,
    escudoRaio: 92, escudoArco: 1.25, giro: [1.2, 2.1],
    vel: 55,
    intervalo: [1.4, 1], tiros: 3, tiroAbertura: .12, tiroVel: 1,
    anelIntervalo: [4, 2.5], anel: 18, anelVel: .6, anelRaio: 6,
  },
  storm: {
    name: 'Tempestade', r: 60, vida: 1.1,
    paredeIntervalo: [2.6, 2], buraco: 150, espaco: 44, paredeVel: .55, paredeRaio: 6,
    raioIntervalo: [2.4, 1.6], raioPrimeiro: 1.5, raios: [2, 4], raioLargura: 44, raioAviso: 1.1, raioDura: .35,
  },
};
