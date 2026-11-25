// ---------- Habilidades ativas (desde 1.2.0) ----------
// Uma por nave, no único botão do jogo: J1 Espaço · J2 Enter · controle A · celular botão ★ na tela.
// Escolhas do Rafael/Bryan em 25/11/2026. Comportamento em js/naves/habilidades.js; desenho em js/visual/habilidades.js.
// recarga em segundos; dano multiplicado pelo dano do jogador (melhorias de nível).
const HAB = {
  // Falcão: avança rápido sem levar dano (acerta quem estiver no caminho) e depois fica em fúria
  falcon:    { nome: 'Mergulho de rapina', recarga: 14,
               mergulho: { tempo: .28, dist: 230, dano: 40, inv: .45 },
               furia: { tempo: 4, cadencia: 1.7 } },          // todas as armas atiram 70% mais rápido por 4 s
  // Bumerangue: lâminas giram em volta da nave cortando inimigos e destruindo tiros inimigos
  boomer:    { nome: 'Ciclone de lâminas', recarga: 16, tempo: 5, laminas: 3, raio: 72, giro: 7,
               dano: 22, intervalo: .3, tamanho: 14 },          // cada lâmina acerta o mesmo inimigo a cada 0,3 s
  // Artilheiro: miras em até 8 inimigos e uma chuva de mísseis teleguiados (sobras vão no mais forte / chefão)
  artillery: { nome: 'Bombardeio', recarga: 20, alvos: 8, dano: 14, explosao: 40, vel: 560, mira: .35, intervalo: .05 },
  // Âncora Negra: saraivada de balas de canhão para todos os lados + XP em dobro por 5 s
  pirate:    { nome: 'Saraivada', recarga: 20, rajadas: 3, balas: 16, intervalo: .3, dano: 30, explosao: 30, vel: 470, vida: 1.7,
               xpDobro: 5 },
  // Fênix: baforada em cone de 90° para a frente, até a borda da tela, por 3 s; dano + 3 chamas (fogo máximo)
  phoenix:   { nome: 'Baforada de fogo', recarga: 26, tempo: 3, abertura: Math.PI / 2, dps: 10, tick: .1, chamas: 3 },
  // Hypnos: onda psíquica pela tela toda: os 4 inimigos mais perto viram lacaios (mesmo passando do limite de 4)
  //          e todos ficam tontos (chefão: metade) – assim a habilidade também serve na luta do chefão
  hypnos:    { nome: 'Onda psíquica', recarga: 26, converte: 4, tonto: 1.5, vel: 1500 },
};
