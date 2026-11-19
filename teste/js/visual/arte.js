// ---------- Carregador de desenhos (pasta arte/) ----------
// Cada desenho é um arquivo .svg próprio. O viewBox do arquivo define o tamanho do desenho;
// nas naves, data-pivo="x y" marca o centro da nave.
// Na versão offline (dist/esquadrilha.html) os SVG vêm embutidos em window.ARTE_EMBUTIDA.
const ARTE = { naves: {}, inimigos: {}, chefoes: {}, tiros: {}, bumerangues: {} };
const ENEMY_ART = {}, BOSS_ART = {}, SHOT_ART = {}, BOOM_ART = {};

const ARTE_NAVES = { falcon: 'falcao', boomer: 'bumerangue', arty: 'artilheiro' };
const ARTE_INIMIGOS = ['scout', 'zig', 'swooper', 'gunner', 'kamikaze', 'heavy', 'splitter', 'mini', 'spinner', 'sniper', 'miner', 'mine', 'hunter',
  'jeep', 'heli', 'tank', 'flak', 'base', 'swarm', 'ufo', 'rock', 'beamer', 'blinker', 'tank_top', 'heli_top', 'flak_top'];
const ARTE_CHEFOES = ['fortress', 'carrier', 'laser', 'vortex', 'ram', 'twins', 'twins2', 'sower', 'ghost', 'guardian', 'storm'];

function lerSVG(txt) {
  const m = txt.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/);
  if (!m) return null;
  const vb = m[1].match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);
  const pv = m[1].match(/data-pivo="([^"]+)"/);
  const g = m[2].replace(/^\s*<!--[\s\S]*?-->\s*/, '').trim();
  return { vb, pv: pv ? pv[1].trim().split(/\s+/).map(Number) : null, g };
}
function lerArquivo(caminho) {
  const emb = window.ARTE_EMBUTIDA;
  if (emb && emb[caminho]) return Promise.resolve(emb[caminho]);
  return fetch(caminho).then(r => { if (!r.ok) throw new Error(caminho + ' ' + r.status); return r.text(); });
}
function carregarArte() {
  const tarefas = [];
  const pegar = (caminho, guardar) => tarefas.push(lerArquivo(caminho).then(lerSVG).then(a => { if (a) guardar(a); })
    .catch(e => console.warn('Desenho não carregou:', caminho, e.message)));
  const skins = SKINS.filter(s => s.id !== 'classic').map(s => s.id);
  for (const nave in ARTE_NAVES) {
    ARTE.naves[nave] = {};
    for (const id of skins) pegar(`arte/naves/${ARTE_NAVES[nave]}/${id}.svg`, a => { ARTE.naves[nave][id] = a; });
  }
  for (const id of skins) {
    pegar(`arte/tiros/${id}.svg`, a => { ARTE.tiros[id] = a; SHOT_ART[id] = a.g; });
    pegar(`arte/bumerangues/${id}.svg`, a => { ARTE.bumerangues[id] = a; BOOM_ART[id] = a.g; });
  }
  for (const k of ARTE_INIMIGOS) pegar(`arte/inimigos/${k}.svg`, a => { ARTE.inimigos[k] = a; ENEMY_ART[k] = { svg: a.g, vb: -a.vb[0] }; });
  for (const k of ARTE_CHEFOES) pegar(`arte/chefoes/${k}.svg`, a => { ARTE.chefoes[k] = a; BOSS_ART[k] = { svg: a.g, vb: -a.vb[0] }; });
  return Promise.all(tarefas);
}
