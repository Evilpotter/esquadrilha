// ---------- Versão do jogo ----------
// X.Y.Z  →  X: mudança grande · Y: novidade menor · Z: correção
// Só muda ao publicar: o teste já mostra o número que o oficial terá quando
// a rodada for validada (um passo só, pelo maior tipo de mudança da rodada).
// CANAL: 'teste' no Esquadrilha – Teste; '' na versão oficial.
const VERSAO = '1.2.0';
const CANAL = 'teste';
function versaoTexto() { return 'v' + VERSAO + (CANAL ? ' · ' + CANAL : ''); }
