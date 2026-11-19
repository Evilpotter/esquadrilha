// ---------- Versão do jogo ----------
// X.Y.Z  →  X: mudança grande · Y: novidade menor · Z: correção
// CANAL: 'teste' no Esquadrilha – Teste; '' na versão oficial.
const VERSAO = '1.0.0';
const CANAL = 'teste';
function versaoTexto() { return 'v' + VERSAO + (CANAL ? ' · ' + CANAL : ''); }
