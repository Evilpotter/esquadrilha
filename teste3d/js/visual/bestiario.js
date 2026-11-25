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
    // Mar dos Piratas
    case 'bote': return bestDraw(key, e.x, e.y, Math.sin(e.t * 4 + (e.ph0 || 0)) * .08, k, f);
    case 'gaivota': return bestDraw(key, e.x, e.y, e.mergulho ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : Math.cos(e.t * 2.2 + (e.ph0 || 0)) * .3, k * (1 + .08 * Math.sin(e.t * 14)), f);
    case 'escuna':
      bestDraw(key, e.x, e.y, Math.sin(e.t * 1.3) * .04, k, f);
      return bestDraw('e:escuna_top', e.x, e.y, e.aim - Math.PI / 2, k, f);
    case 'balao': return bestDraw(key, e.x, e.y, Math.sin(e.t * 1.6) * .1, k, f);
    case 'kraken': {
      const sub = e.sub || 0, r = e.r * (1.4 + .25 * Math.sin(e.t * 3));
      // água borbulhando em volta (anel de espuma)
      cx.save(); cx.translate(e.x, e.y + e.r * .7);
      cx.fillStyle = 'rgba(13,61,68,.5)'; cx.beginPath(); cx.ellipse(0, 0, r, r * .42, 0, 0, TAU); cx.fill();
      cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2.5; cx.setLineDash([10, 8]); cx.lineDashOffset = -e.t * 20;
      cx.beginPath(); cx.ellipse(0, 0, r * 1.15, r * .5, 0, 0, TAU); cx.stroke(); cx.setLineDash([]); cx.restore();
      if (sub >= .98) return true;
      const cosp = e.cospe > 0 ? 1 + e.cospe * .6 : 1;
      return bestDraw(key, e.x, e.y + sub * e.r * .8, Math.sin(e.t * 2.3) * .22, k * (1 - sub * .7) * cosp, f, 1 - sub * .6);
    }
    case 'fantasma': return bestDraw(key, e.x, e.y, Math.sin(e.t * .9) * .05, k, f, e.alpha === undefined ? 1 : e.alpha);
    // Reino Encantado
    case 'mago': return bestDraw(key, e.x, e.y, Math.cos(e.t * 1.6 + (e.ph0 || 0)) * .18, k, f);
    case 'grifo': return bestDraw(key, e.x, e.y, e.mergulho ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : (e.side || 1) * Math.PI / 2 * .55, k * (1 + .1 * Math.sin(e.t * 13)), f);
    case 'draco': return bestDraw(key, e.x, e.y, Math.cos(e.t * 1.3 + (e.ph0 || 0)) * .25, k * (1 + .08 * Math.sin(e.t * 10)) * (e.cospe > 0 ? 1.08 : 1), f);
    case 'bruxa': return bestDraw(key, e.x, e.y, Math.sin(e.t * 1.8) * .12, k, f);
    case 'gargula': {
      // pedra ↔ acordada: as duas versões se misturam; acordada bate as asas
      const pd = e.pedra === undefined ? 0 : e.pedra, rot = Math.sin(e.t * 1.2) * .05;
      if (pd < 1) bestDraw(key, e.x, e.y, rot, k * (1 + .06 * Math.sin(e.t * 12) * (1 - pd)), f, 1);
      if (pd > 0) bestDraw('e:gargula_pedra', e.x, e.y, rot, k, f, pd);
      return true;
    }
    case 'anciao': {
      if (e.aviso > 0) { // aviso do sopro: brilho na boca crescendo
        const u = 1 - e.aviso / REINO_INI.anciao.aviso;
        cx.save(); cx.globalAlpha = .35 + .4 * u; cx.fillStyle = '#4AB4FF';
        cx.beginPath(); cx.arc(e.x, e.y + e.r * 1.1, 10 + u * 22, 0, TAU); cx.fill(); cx.restore();
      }
      return bestDraw(key, e.x, e.y, Math.sin(e.t * .6) * .06, k * (1 + .05 * Math.sin(e.t * 5)), f);
    }
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
