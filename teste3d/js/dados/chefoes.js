// ---------- Dados: chefões ----------
// Para balancear, mexa só aqui. O comportamento fica em js/chefoes/chefoes.js.
// Valores em par [normal, fúria]: a fúria começa quando o chefão perde metade da vida.
// Velocidades de tiro são multiplicadores da velocidade-base dos tiros inimigos (que cresce com a fase).
// Tempos em segundos. Ângulos (abertura, giro) em radianos. Distâncias em px lógicos (altura da tela = 860).

// Vida = base × (1 + porFase × (fase − 1)) × doisJogadores (se houver J2) × vida do chefão
const BOSS_HP = { base: 1800, porFase: .5, doisJogadores: 1.4 };
// Dano dos chefões (tudo cresce com a fase): toque, raio e tiros. Tiros de inimigos comuns causam 12.
const BOSS_DMG = { toque: 60, toqueAriete: 80, raio: 50, tiro: 24 };
// Ordem das fases (depois da 10ª recomeça com "+1", "+2"...)
const BOSS_ORDER = ['fortress', 'carrier', 'laser', 'vortex', 'ram', 'twins', 'sower', 'ghost', 'guardian', 'storm'];

const BOSS_DATA = {
  fortress: {
    name: 'Fortaleza Voadora', r: 60, vida: 1,
    vel: [85, 140],                 // patrulha
    balanco: 35, balancoVel: 1.3,   // sobe e desce enquanto patrulha
    intervalo: [1.8, 1.1],          // entre ataques (anel → rajada → leque → espiral)
    velTiro: .9,
    anel: 16, anelPorFase: 2, anelRaio: 6,
    rajadas: [4, 5], rajadaPausa: .16, rajadaTiros: [3, 5], rajadaAbertura: .14, rajadaVel: 1.2,
    leque: [11, 13], lequeAbertura: .15, lequeRaio: 7,
    espiralDura: 1.6, espiralCadencia: .08, espiralBracos: [2, 3], espiralGiro: 3, espiralVel: .75,
  },
  carrier: {
    name: 'Porta-aviões', r: 64, vida: 1.1,
    vel: [55, 75],
    balanco: 50, balancoVel: .9,    // faz um "oito" largo
    intervalo: [3, 2],              // lança escolta
    escolta: 'scout', escoltaFuria: 'kamikaze', escoltaPorLado: [2, 3],
    anelIntervalo: [2.4, 1.8], anel: 12, anelPorFase: 1, anelVel: .55, anelRaio: 7,
    canhaoIntervalo: [1.5, 1], canhaoDist: 75, canhaoVel: 1.1, canhaoRaio: 6,   // canhões das asas, mirados
    misselIntervalo: [6, 3.5], misseis: [1, 2], misselRaio: 8, misselDano: 28, misselDura: 4.5,  // teleguiados
  },
  laser: {
    name: 'Colosso do Raio', r: 58, vida: 1,
    vel: [80, 110],                 // segue o jogador
    intervalo: [2.6, 1.9],          // raio
    raioLargura: 38, raioAviso: .9, raioDura: .8,
    raioExtraDist: 160, raioExtraAviso: 1.2,   // na fúria: mais 2 raios dos lados
    saltoIntervalo: [5.5, 3.5], saltoVel: 650, // desliza rápido para outro lugar e atira o raio de cara
    varreduraIntervalo: [7, 4.5], varreduraLargura: 34, varreduraAviso: 1, varreduraDura: 2, varreduraVel: 170,
    varreduraCobre: .75,            // a varredura cobre no máximo 75% da largura da tela (o resto é a saída)
    varreduraFolga: .5,             // durante a varredura e 0,5 s depois não sai raio fixo
    tiroIntervalo: [1.3, 1], tiros: [3, 5], tiroAbertura: .18, tiroVel: 1, tiroRaio: 5,
  },
  vortex: {
    name: 'Vórtice', r: 54, vida: 1,
    ciclo: 6, atirando: 4.6,        // atira 4,6 s a cada 6 s; a cada ciclo inverte o giro
    giro: [1.8, 2.4],
    balanco: 60, balancoVel: .8,
    cadencia: [.1, .085], bracos: [4, 5], velTiro: .6, tiroRaio: 5,
    contraBracos: [0, 2],           // na fúria: espiral girando ao contrário
    pulso: 20, pulsoPorFase: 1, pulsoVel: .5, pulsoRaio: 6, pulsos: [1, 2],   // ao parar de girar
  },
  ram: {
    name: 'Aríete', r: 50, vida: .9,
    vel: 100,
    intervalo: [2.6, 1.6],          // entre séries de investidas
    investidas: [2, 3],             // investidas seguidas
    aviso: [.7, .45], avisoSeguinte: .35,  // pisca antes de investir
    tiroIntervalo: [1.2, .8], tiros: 3, tiroAbertura: .2,  // leque mirado na patrulha
    investida: [720, 850],
    rastroCadencia: .07, rastroVel: .45, rastroRaio: 5,
    impacto: 10, impactoVel: .55, impactoRaio: 6,  // anel ao bater na borda
    volta: 280,
    anel: 14, anelVel: .6, anelRaio: 6,
  },
  twins: {
    name: 'Gêmeos', r: 42, vida: 1, vidaCada: .55,
    giro: [.9, 1.5],                // fúria dos Gêmeos: quando um dos dois cai
    trocaGiro: [6, 4],              // invertem o sentido da volta
    raioMin: .7,                    // a órbita abre e fecha (fração do raio)
    intervalo: [1.4, .8],
    tiros: 3, tiroAbertura: .12, tiroVel: 1.05,
    leque: 5, lequeAbertura: .2, lequeVel: .9,     // o gêmeo vermelho atira em leque para baixo
    rajadaIntervalo: [5, 3.5], rajada: 6, rajadaPausa: .1, rajadaVel: 1.3,
    anel: 14, anelVel: .6, anelRaio: 5,   // só na fúria
  },
  sower: {
    name: 'Semeador', r: 56, vida: 1,
    vel: [80, 110],
    balanco: 45, balancoVel: 1.5,
    minaIntervalo: [1.1, .7], minas: [1, 2], minaPavio: 5,
    orbeIntervalo: [2.3, 1.5], orbePrimeiro: 2, orbes: [2, 3], orbeRaio: 8, orbeDano: 28, orbeDura: 5,
    sementeIntervalo: [2.6, 1.8], sementePrimeiro: 3, sementes: [3, 5], sementeAbertura: .35, sementeVel: .55, sementeRaio: 7, sementeEstoura: 1.1,
  },
  ghost: {
    name: 'Fantasma', r: 50, vida: 1,
    vel: 70, ondula: 40, ondulaVel: 2,
    aparece: [2.6, 1.8], apareceInicio: 2.5, some: .45, escondido: .55,
    pertoMin: 160, pertoMax: 320,   // reaparece perto (na horizontal) do jogador
    intervalo: [1.2, .8], tiros: [5, 7], tiroAbertura: .15, tiroVel: 1,
    anel: 16, anelPorFase: 1, anelVel: .65, anelRaio: 6,  // ao reaparecer (na fúria também onde sumiu)
  },
  guardian: {
    name: 'Guardião', r: 48, vida: .9,
    escudoRaio: 92, escudoArco: 1.25, giro: [1.3, 2.2],
    trocaGiro: [5, 3.5],            // o escudo inverte o sentido
    vel: [60, 85], balanco: 30, balancoVel: 1.1,
    intervalo: [1.3, .9], tiros: 3, tiroAbertura: .12, tiroVel: 1,
    brechaIntervalo: [.9, .6], brechaTiros: [1, 2], brechaVel: .8, brechaRaio: 5,  // tiros que saem pelas brechas
    anelIntervalo: [4, 2.5], anel: 20, anelVel: .6, anelRaio: 6,
  },
  storm: {
    name: 'Tempestade', r: 60, vida: 1.1,
    vel: [110, 150], alturaMin: 110, alturaMax: 230,   // vaga pelo céu
    paredeIntervalo: [2.5, 2], paredes: [1, 2], paredePausa: .9, buraco: 150, espaco: 44, paredeVel: .55, paredeRaio: 6,
    raioIntervalo: [2.2, 1.5], raioPrimeiro: 1.5, raios: [3, 5], raioLargura: 44, raioAviso: 1.1, raioDura: .35,
    granizo: [2.5, 4], granizoVel: .7, granizoRaio: 5,   // pedras de gelo por segundo
  },
};
