// Gera arte/naves/pirata/<skin>.svg (Âncora Negra) a partir de pirataSVG em js/visual/pirata.js.
// Uso: node ferramentas/arte/pirata.js [pasta_do_jogo]   (padrão: teste)
// Depois de gerados, os .svg podem ser editados à mão (Inkscape) como os das outras naves.
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.resolve(__dirname, '..', '..', process.argv[2] || 'teste');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, 'js/visual/pirata.js'), 'utf8') + '\nthis.pirataSVG = pirataSVG; this.PIRATA_SKIN = PIRATA_SKIN;', ctx);
const pasta = path.join(raiz, 'arte/naves/pirata');
fs.mkdirSync(pasta, { recursive: true });
for (const [id, s] of Object.entries(ctx.PIRATA_SKIN)) {
  const a = ctx.pirataSVG(s.pal, s.deco);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${a.vb.join(' ')}" data-pivo="${a.pv.join(' ')}">\n<!-- data-pivo = centro da nave -->\n${a.g}\n</svg>\n`;
  fs.writeFileSync(path.join(pasta, id + '.svg'), svg);
  console.log(id, svg.length, 'bytes');
}
