// ---------- Impacto e animação (só visual: não muda vida, dano nem tempo das fases) ----------
// Tempos em segundos. Comportamento e desenho em js/visual/impacto.js.
const IMPACTO = {
  // tremor da tela (S.shake): explosões a partir de boomMin de raio, habilidades e morte do chefão
  tremor: { boomMin: 45, porRaio: 1 / 220, max: .4, habilidade: .14, chefao: .6, elite: .35, forca: 14 },
  // pausa de impacto (tempo real): inimigo forte (XP 5 ou mais) e elite; no máximo uma a cada "intervalo"
  parada: { forte: .05, elite: .14, intervalo: .25 },
  lento: { tempo: 1.4, escala: .3 },           // câmera lenta quando o chefão cai
  clarao: { chefao: .8, some: 1.4 },           // clarão branco na tela
  queda: { tempo: 1.1, escalaFim: .38, giro: 4.5, fumaca: .045, max: 30 }, // aviões abatidos caindo
  chefaoCai: { tempo: 2.2, escalaFim: .35, giro: .9 },
  afunda: { tempo: 1.2 },                      // barcos afundando (Mar dos Piratas)
  cratera: { tempo: 5, max: 14 },              // inimigos de solo deixam cratera
  numeros: { sobe: 42, tempo: .7, junta: .3, juntaFogo: .6, max: 70 },
  vidaBaixa: .3,                               // fração da vida que solta fumaça e pisca a borda
  inclina: .22,                                // giro da nave (rad) com o movimento lateral
  vento: { vel: 230, cada: .03 },              // rastro de vento nas asas acima dessa velocidade (px/s)
  sombra: { dx: 14, dy: 24, rx: 21, ry: 13, alfa: .22 },
  entrada: .9,                                 // nave desce do céu no começo da fase
  vitoria: 1.3,                                // looping ao vencer o chefão
  nivel: 1.4,                                  // faixa "NÍVEL X!" e anel de luz
  pose: { boomer: .5, artillery: .35, pirate: .9, phoenix: .5, hypnos: .6 }, // animação ao usar a habilidade ★
  particulasMax: 420,
};
