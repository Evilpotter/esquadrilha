// ---------- Bestiário: desenhos dos inimigos e chefões ----------
// Os desenhos ficam em arte/inimigos e arte/chefoes (SVG centrado em 0,0, bico para baixo).
// Inimigos: 4 unidades = 1 pixel do jogo; chefões: 2 unidades = 1 pixel.
const ENEMY_U = .33, BOSS_U = .5, BEST_RES = 3;
const bestImg = {};
// gera a imagem normal e a versão branca (pisca ao levar tiro)
function buildBestImages() {
  const add = (key, a, u) => {
    const vb = a.vb, px = Math.round(vb * 2 * u * BEST_RES);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-vb} ${-vb} ${vb * 2} ${vb * 2}" width="${px}" height="${px}">${a.svg}</svg>`;
    // versão do pisca: sem sombras nem auras, só a silhueta
    const bare = svg.replace(/<(ellipse|rect|path|circle)\b[^>]*fill="#000"[^>]*\/>/g, '').replace(/<(ellipse|rect|path|circle)\b[^>]*opacity="\.(0\d*|1[0-5]?)"[^>]*\/>/g, '');
    const rec = bestImg[key] = { ready: false, vb, u }, img = new Image(), img2 = new Image();
    let n = 0;
    const done = () => {
      if (++n < 2) return;
      const c = document.createElement('canvas'); c.width = c.height = px; c.getContext('2d').drawImage(img, 0, 0, px, px);
      const w = document.createElement('canvas'); w.width = w.height = px; const g = w.getContext('2d');
      g.drawImage(img2, 0, 0, px, px); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, px, px);
      rec.cv = c; rec.white = w; rec.ready = true;
    };
    img.onload = done; img2.onload = done;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    img2.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bare);
  };
  for (const k in ENEMY_ART) add('e:' + k, ENEMY_ART[k], ENEMY_U);
  for (const k in BOSS_ART) add('b:' + k, BOSS_ART[k], BOSS_U);
}
function bestDraw(key, x, y, rot, k, white, alpha) {
  const r = bestImg[key]; if (!r || !r.ready) return false;
  const s = r.vb * r.u * (k || 1);
  cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot);
  if (alpha !== undefined) cx.globalAlpha = alpha;
  cx.drawImage(white ? r.white : r.cv, -s, -s, s * 2, s * 2);
  cx.restore();
  return true;
}
// inimigos: devolve false se o desenho ainda não carregou (aí usa o desenho antigo)
function drawEnemyArt(e) {
  const t = ETYPES[e.type], f = e.flash > 0, key = 'e:' + e.type;
  if (!bestImg[key] || !bestImg[key].ready) return false;
  const k = e.r / t.r;
  switch (e.type) {
    case 'tank':
      bestDraw(key, e.x, e.y, 0, k, f);
      return bestDraw('e:tank_top', e.x, e.y, e.aim - Math.PI / 2, k, f);
    case 'flak':
      bestDraw(key, e.x, e.y, 0, k, f);
      return bestDraw('e:flak_top', e.x, e.y, e.aim - Math.PI / 2, k, f);
    case 'heli':
      bestDraw(key, e.x, e.y, 0, k, f);
      return bestDraw('e:heli_top', e.x, e.y + 2, e.t * 18, k, f);
    case 'spinner': return bestDraw(key, e.x, e.y, e.t * 2.2, k, f);
    case 'rock': return bestDraw(key, e.x, e.y, e.rot || 0, k, f);
    case 'swarm': return bestDraw(key, e.x, e.y, Math.cos(e.t * 4 + (e.ph0 || 0)) * .6, k, f);
    case 'blinker': return bestDraw(key, e.x, e.y, 0, k, f, e.alpha === undefined ? 1 : e.alpha);
    case 'kamikaze': {
      const lock = e.mode === 'lock' && Math.floor(e.lt * 12) % 2;
      return bestDraw(key, e.x, e.y, e.mode === 'dive' ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : 0, k, f || lock);
    }
    case 'mine': {
      const blink = e.armed && Math.floor(e.armed * 14) % 2;
      bestDraw(key, e.x, e.y, e.t || 0, k, f);
      if (blink) { cx.fillStyle = '#ff4a4a'; cx.beginPath(); cx.arc(e.x, e.y, e.r * .55, 0, TAU); cx.fill(); }
      return true;
    }
    case 'beamer':
      bestDraw(key, e.x, e.y, 0, k, f);
      if (e.charge > 0 && Math.floor(e.charge * 14) % 2) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(e.x, e.y + 2, 6, 0, TAU); cx.fill(); }
      return true;
    default: return bestDraw(key, e.x, e.y, 0, k, f);
  }
}
// chefões
function drawBossArt(b) {
  const key = 'b:' + (b.kind === 'twins' && b.idx ? 'twins2' : b.kind);
  if (!bestImg[key] || !bestImg[key].ready) return false;
  const f = b.flash > 0;
  if (b.kind === 'guardian') {
    // escudos na posição real (raio b.shR, 3 arcos de b.arc rad a partir de b.rot)
    cx.save(); cx.translate(b.x, b.y); cx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const a = b.rot + k * TAU / 3;
      for (const [lw, col, a0, a1] of [[15, '#24160c', 0, 0], [10, '#78e6ff', 0, 0], [3, '#e6fbff', .12, .2]]) {
        cx.strokeStyle = col; cx.lineWidth = lw; cx.beginPath(); cx.arc(0, 0, b.shR, a + a0, a + b.arc - a1); cx.stroke();
      }
    }
    cx.lineCap = 'butt'; cx.restore();
  }
  let rot = 0;
  if (b.kind === 'vortex') rot = b.spin || 0;
  if (b.kind === 'ram' && (b.mode === 'charge' || b.mode === 'warn')) rot = Math.atan2((b.ty2 || H) - b.y, (b.tx || b.x) - b.x) - Math.PI / 2;
  const white = f || (b.kind === 'ram' && b.mode === 'warn' && Math.floor(b.t * 16) % 2);
  return bestDraw(key, b.x, b.y, rot, 1, white, b.kind === 'ghost' ? (b.alpha === undefined ? 1 : b.alpha) : undefined);
}
