// ---------- Dados: sons ----------
// Arquivos em som/efeitos/<nome>.ogg e som/musica/<nome>.ogg (gerados por ferramentas/sons/).
// Para trocar um som (ex.: gravação do Bryan), basta substituir o .ogg com o mesmo nome.
// vol: volume (0–1) · var: sorteio de altura em semitons (±) para não cansar o ouvido
// max: quantos iguais tocam juntos (o mais antigo para) · int: tempo mínimo entre dois iguais (s)
const SONS = {
  // tiros do jogador
  tiro_metralhadora: { vol: .22, var: .8, max: 4, int: .04 },
  tiro_leque:        { vol: .30, var: .6, max: 3, int: .05 },
  tiro_missil:       { vol: .28, var: .8, max: 3, int: .06 },
  tiro_plasma:       { vol: .36, var: .5, max: 2, int: .08 },
  tiro_drone:        { vol: .15, var: 1, max: 4, int: .04 },
  tiro_ricochete:    { vol: .24, var: 1, max: 3, int: .05 },
  ricochete_quique:  { vol: .16, var: 2, max: 3, int: .05 },
  tiro_raio:         { vol: .32, var: 1, max: 3, int: .08 },
  serra_corte:       { vol: .18, var: 1.5, max: 3, int: .07 },
  tiro_bumerangue:   { vol: .24, var: .7, max: 3, int: .06 },
  bumerangue_pega:   { vol: .18, var: 1, max: 2, int: .1 },
  tiro_saraivada:    { vol: .30, var: .6, max: 2, int: .1 },
  // acertos e explosões
  acerto:            { vol: .20, var: 2, max: 4, int: .03 },
  acerto_chefao:     { vol: .22, var: 1.5, max: 2, int: .08 },
  escudo_bloqueio:   { vol: .24, var: 1.5, max: 2, int: .12 },
  explosao_pequena:  { vol: .42, var: 1.5, max: 5, int: .04 },
  explosao_area:     { vol: .28, var: 2, max: 4, int: .05 },
  explosao_media:    { vol: .52, var: 1, max: 3, int: .06 },
  explosao_grande:   { vol: .60, var: .8, max: 2, int: .12 },
  explosao_chefao:   { vol: .85, max: 1 },
  // tiros dos inimigos (por tipo de tiro, ver ETIROS em inimigos.js)
  inimigo_laser:        { vol: .15, var: 1.5, max: 3, int: .06 },
  inimigo_metralhadora: { vol: .13, var: 1.5, max: 3, int: .05 },
  inimigo_missil:       { vol: .20, var: 1, max: 2, int: .12 },
  inimigo_plasma:       { vol: .17, var: 1.5, max: 2, int: .08 },
  inimigo_granada:      { vol: .20, var: 1, max: 2, int: .1 },
  chefao_tiro:          { vol: .20, var: 1.5, max: 3, int: .07 },
  // jogador
  dano_jogador:      { vol: .55, var: .5, max: 2, int: .1 },
  jogador_abatido:   { vol: .80, max: 1 },
  xp:                { vol: .20, max: 4, int: .03 },
  nivel:             { vol: .60, max: 1 },
  escolha:           { vol: .50, max: 2 },
  conquista:         { vol: .55, max: 1 },
  entrada:           { vol: .55, max: 1 },
  // menus
  menu_mover:        { vol: .30, max: 2, int: .03 },
  menu_ok:           { vol: .40, max: 2 },
  menu_voltar:       { vol: .35, max: 2 },
  pausa:             { vol: .40, max: 1 },
  despausa:          { vol: .40, max: 1 },
  // chefões
  chefao_alerta:     { vol: .75, max: 1 },
  chefao_chegada:    { vol: .80, max: 1 },
  chefao_furia:      { vol: .70, max: 1, int: 1 },
  raio_carga:        { vol: .40, max: 2, int: .2 },
  raio_disparo:      { vol: .50, max: 2, int: .15 },
  trovao:            { vol: .55, var: 1.5, max: 2, int: .25 },
  nova_fase:         { vol: .55, max: 1 },
};

// som do tiro de cada arma do jogador (WEAPONS em armas.js); a serra soa ao cortar
const SOM_ARMA = {
  gun: 'tiro_metralhadora', spread: 'tiro_leque', missile: 'tiro_missil', plasma: 'tiro_plasma', drone: 'tiro_drone',
  ricochet: 'tiro_ricochete', chain: 'tiro_raio', boomerang: 'tiro_bumerangue', barrage: 'tiro_saraivada',
};
// som de cada tipo de tiro inimigo (ETIROS); 'bala' (estilhaços) não tem som próprio
const SOM_TIRO_INIMIGO = {
  laser: ['inimigo_laser', 0, 1], laserForte: ['inimigo_laser', -5, 1.6], metralhadora: ['inimigo_metralhadora', 0, 1],
  plasma: ['inimigo_plasma', 0, 1], granada: ['inimigo_granada', 0, 1], missil: ['inimigo_missil', 0, 1], chefao: ['chefao_tiro', 0, 1],
};

// músicas: vol relativo · laco: repete sem parar
const MUSICAS = {
  menu:    { vol: .55, laco: true },
  fase:    { vol: .50, laco: true },
  chefao:  { vol: .55, laco: true },
  vitoria: { vol: .70, laco: false },
  derrota: { vol: .60, laco: false },
};
const SOM_PADRAO = { musica: .6, efeitos: .8, mudo: false }; // volumes iniciais (o jogador muda na pausa)
const SOM_TROCA = 1.2;     // segundos de troca entre músicas
const SOM_VOZES = 32;      // máximo de efeitos tocando ao mesmo tempo
