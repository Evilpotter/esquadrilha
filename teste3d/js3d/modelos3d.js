// ---------- Teste 3D: modelos (tudo feito com formas do three.js, sem arquivos de modelo) ----------
// Cada função devolve { obj, anima(t, info) }. Bico/frente para -Z, asas no eixo X, "em cima" = +Y.
// O tamanho é ajustado depois (encaixa(): largura em px do jogo).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---- materiais e peças ----
export const mat = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: .42, metalness: 0, clearcoat: .5, clearcoatRoughness: .35, sheen: .25, sheenColor: 0xffffff, ...o });
export const luz = (c, i = 2.6) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), toneMapped: false });
const brilha = (c, e = .6, o = {}) => mat(c, { emissive: c, emissiveIntensity: e, ...o });
export const esfera = (r = 1, a = 32, b = 22) => new THREE.SphereGeometry(r, a, b);
const cone = (r, h, n = 24) => new THREE.ConeGeometry(r, h, n);
const cil = (r1, r2, h, n = 24) => new THREE.CylinderGeometry(r1, r2, h, n);
const caixa = (x, y, z) => new RoundedBoxGeometry(x, y, z, 3, Math.min(x, y, z) * .3);
function peca(pai, geo, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  const o = new THREE.Mesh(geo, m); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s);
  o.castShadow = true; pai.add(o); return o;
}
function asa(pts, esp = .25) { // contorno no plano XZ (x para fora, z para trás)
  const s = new THREE.Shape(); pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z));
  const g = new THREE.ExtrudeGeometry(s, { depth: esp, bevelEnabled: true, bevelThickness: .14, bevelSize: .16, bevelSegments: 4, curveSegments: 12 });
  g.rotateX(-Math.PI / 2); g.translate(0, -esp / 2, 0); return g;
}
function espelha(g) { // espelha em X mantendo as faces para fora
  const c = g.index ? g.toNonIndexed() : g.clone(); c.scale(-1, 1, 1);
  for (const nome of ['position', 'normal', 'uv']) { const a = c.attributes[nome]; if (!a) continue; const n = a.itemSize;
    for (let i = 0; i < a.count; i += 3) for (let k = 0; k < n; k++) { const t = a.array[(i + 1) * n + k]; a.array[(i + 1) * n + k] = a.array[(i + 2) * n + k]; a.array[(i + 2) * n + k] = t; } }
  c.computeVertexNormals(); return c;
}
// asa com ponto de giro na raiz (para bater)
function par(pai, geo, m, raiz = [0, 0, 0], incl = 0) {
  const lados = [];
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(sx * raiz[0], raiz[1], raiz[2]); pai.add(piv);
    peca(piv, sx > 0 ? geo : espelha(geo), m, [0, 0, 0], [0, 0, sx * incl]); piv.userData.sx = sx; lados.push(piv);
  }
  return lados;
}
const bate = (lados, ang) => { for (const l of lados) l.rotation.z = l.userData.sx * ang; };
function tubo(pts, r, fim = .35, seg = 24) { // tubo que afina (pescoço, cauda)
  const curva = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curva, seg, r, 12); const pos = g.attributes.position; const n = 13;
  for (let i = 0; i < pos.count; i++) { const u = Math.floor(i / n) / seg, c = curva.getPoint(Math.min(1, u)), s = 1 - u * (1 - fim);
    pos.setXYZ(i, c.x + (pos.getX(i) - c.x) * s, c.y + (pos.getY(i) - c.y) * s, c.z + (pos.getZ(i) - c.z) * s); }
  g.computeVertexNormals(); return g;
}
// lista de materiais do modelo (para piscar branco no dano)
function materiais(obj) { const s = new Set(); obj.traverse(o => { if (o.isMesh && o.material.emissive) s.add(o.material); }); return [...s]; }
export function preparaPisca(m) {
  m.mats = materiais(m.obj).map(x => { const c = x.clone(); return [x, c]; });
  // cada modelo tem materiais próprios (clones), para piscar sozinho
  const troca = new Map(m.mats); m.obj.traverse(o => { if (o.isMesh && troca.has(o.material)) o.material = troca.get(o.material); });
  m.mats = [...troca.values()].map(x => ({ x, e: x.emissive.clone(), ei: x.emissiveIntensity }));
  m.pisca = v => { for (const k of m.mats) { if (v > 0) { k.x.emissive.setRGB(1, 1, 1); k.x.emissiveIntensity = 1.6; } else { k.x.emissive.copy(k.e); k.x.emissiveIntensity = k.ei; } } };
  return m;
}
export function encaixa(obj, largura, maior) { // largura (unidades 3D): de ponta a ponta das asas (X) ou do maior lado (maior = true: magos e bruxas na vassoura)
  const b = new THREE.Box3().setFromObject(obj), s = new THREE.Vector3(); b.getSize(s);
  const k = largura / (maior ? Math.max(s.x, s.z) : s.x); const g = new THREE.Group(); obj.scale.multiplyScalar(k); g.add(obj); return g;
}

// ---------- Fênix ----------
export function fenix() {
  const g = new THREE.Group(), corpo = brilha(0xff6a1a, .35), pena = brilha(0xffb020, .45), ponta = brilha(0xd8261a, .35), ouro = mat(0xffe070);
  peca(g, esfera(1), corpo, [0, 0, .4], [0, 0, 0], [1, .9, 2.3]);
  peca(g, esfera(1), mat(0xffd08a), [0, -.35, .2], [0, 0, 0], [.75, .6, 1.8]);
  peca(g, esfera(.85), corpo, [0, .5, -2]);
  peca(g, cone(.35, 1.1), ouro, [0, .35, -3.1], [-Math.PI / 2 - .3, 0, 0]);
  for (let i = 0; i < 3; i++) peca(g, cone(.22, 1.5), pena, [(i - 1) * .4, 1.35, -1.5 + i * .2], [.75, 0, (i - 1) * .4]);
  for (const sx of [-1, 1]) {
    peca(g, esfera(.2), mat(0xffffff), [sx * .42, .85, -2.55]);
    peca(g, esfera(.11), luz(0xffe040, 3), [sx * .45, .9, -2.72]);
  }
  const geoA = asa([[.4, -.4], [3, -1.6], [6.5, -1.9], [8.6, -1.2], [7.2, 0], [8.2, .9], [6, 1], [6.4, 2], [4, 1.6], [3.6, 2.6], [1, 1.6]], .22);
  const asas = [];
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(sx * .5, .25, 0); g.add(piv); piv.userData.sx = sx; asas.push(piv);
    peca(piv, sx > 0 ? geoA : espelha(geoA), pena);
    for (let i = 0; i < 4; i++) peca(piv, cone(.32, 2.2), ponta, [sx * (4 + i * 1.1), .55 + i * .2, -1.2 - (i % 2) * .4], [-Math.PI / 2, 0, sx * -.2]);
  }
  const cauda = [];
  for (let i = 0; i < 5; i++) cauda.push(peca(g, cone(.42, 4.2), i % 2 ? pena : ponta, [(i - 2) * .55, 0, 4], [Math.PI / 2, (i - 2) * .18, 0]));
  const motor = peca(g, cone(.6, 3.4, 16), luz(0xffa020, 2.2), [0, 0, 5.6], [Math.PI / 2, 0, 0]);
  return { obj: g, anima(t, info) {
    bate(asas, .18 + Math.sin(t * 5) * .32);
    for (let i = 0; i < cauda.length; i++) cauda[i].rotation.y = (i - 2) * .18 + Math.sin(t * 4 + i) * .08;
    motor.scale.set(1, .8 + Math.sin(t * 30) * .2, 1);
    g.rotation.z = -(info.tilt || 0) * .45;
  } };
}

// ---------- inimigos do Reino ----------
function dragao(cor, cor2, olhos, chifres = 0xf0e6c8, extra = {}) {
  const g = new THREE.Group(), c = mat(cor), c2 = mat(cor2), ch = mat(chifres);
  peca(g, esfera(1), c, [0, 0, 0], [0, 0, 0], [1.5, 1.15, 2.6]);
  peca(g, esfera(1), c2, [0, -.42, -.5], [0, 0, 0], [1.05, .75, 1.9]);
  peca(g, tubo([[0, .3, -1.8], [0, 1.2, -3.2], [0, 1.3, -4.5]], .62, .8, 12), c);
  const cab = new THREE.Group(); cab.position.set(0, 1.4, -5.1); g.add(cab);
  peca(cab, esfera(1), c, [0, 0, 0], [0, 0, 0], [1, .82, 1.3]);
  peca(cab, caixa(1.2, .62, 1.5), c, [0, -.3, -1.1]);
  const boca = peca(cab, esfera(.45), luz(extra.boca || 0xff60ff, 3), [0, -.4, -1.9]); boca.visible = false;
  for (const sx of [-1, 1]) {
    peca(cab, cone(.24, 1.7), ch, [sx * .6, .8, .5], [.9, 0, sx * -.5]);
    peca(cab, esfera(.2), luz(olhos, 3), [sx * .55, .35, -.75]);
  }
  for (let i = 0; i < 6; i++) peca(g, cone(.24, .8), ch, [0, 1.15 - i * .05, -1.3 + i * .9], [-.4, 0, 0]);
  const a = asa([[.3, -1], [3, -3.2], [6.5, -3.6], [9, -2.4], [7.4, -.8], [8, .8], [5.6, .4], [5.4, 2], [3, 1.2], [1, 1.8]], .1);
  const asas = par(g, a, mat(cor2, { side: THREE.DoubleSide, sheen: .6 }), [.9, .9, 0], .3);
  for (const l of asas) peca(l, cil(.16, .1, 6.5), c, [3.2, .35, -2.2], [0, .55, Math.PI / 2]);
  const cauda = new THREE.Group(); cauda.position.set(0, 0, 2.2); g.add(cauda);
  peca(cauda, tubo([[0, 0, 0], [1.2, -.2, 2.4], [-.6, -.4, 4.8], [.6, -.5, 6.6]], .5, .25), c);
  peca(cauda, cone(.6, 1.4, 4), c2, [.6, -.5, 7.2], [Math.PI / 2, 0, 0]);
  return { obj: g, boca, anima(t, info) {
    bate(asas, .25 + Math.sin(t * (extra.vel || 3.2)) * .45);
    cauda.rotation.y = Math.sin(t * 2) * .25; cab.rotation.y = Math.sin(t * 1.3) * .15;
  } };
}
export const modelos = {
  mago() {
    const g = new THREE.Group(), manto = mat(0x3a2a8a);
    peca(g, cil(.13, .13, 5.2), mat(0x8a5a2a), [0, 0, .2], [Math.PI / 2, 0, 0]);
    peca(g, cone(.65, 1.5, 12), mat(0xd8b060), [0, 0, 3.1], [-Math.PI / 2, 0, 0]);
    peca(g, cone(.95, 2, 24), manto, [0, 1, -.1]);
    peca(g, esfera(.48), mat(0xf2c8a0), [0, 2.15, -.1]);
    peca(g, esfera(.42), mat(0xf4f4f4), [0, 1.8, -.5], [0, 0, 0], [1, 1.3, .8]);
    const chapeu = peca(g, cone(.65, 1.8, 24), manto, [0, 3.1, 0], [.25, 0, 0]);
    peca(g, cil(1, 1, .1, 24), manto, [0, 2.45, -.05]);
    for (let i = 0; i < 4; i++) peca(g, esfera(.1), luz(0xffd84a, 3), [Math.cos(i * 1.6) * .6, 1 + i * .2, Math.sin(i * 1.6) * .6 - .1]);
    peca(g, cil(.06, .06, 2.4), mat(0x6a4020), [.9, 1.4, -.6], [.5, 0, 0]);
    const orbe = peca(g, esfera(.3), luz(0xffd84a, 3.4), [.9, 2.4, -1.2]);
    return { obj: g, anima(t) { g.rotation.z = Math.sin(t * 3) * .12; chapeu.rotation.z = Math.sin(t * 4) * .1; orbe.scale.setScalar(1 + Math.sin(t * 9) * .2); } };
  },
  grifo() {
    const g = new THREE.Group(), pelo = mat(0xc89a5a), branco = mat(0xf4efe0), ouro = mat(0xf2c040);
    peca(g, esfera(1), pelo, [0, 0, 0], [0, 0, 0], [.9, .8, 1.6]);
    peca(g, esfera(.72), branco, [0, .45, -1.5]);
    peca(g, cone(.26, .85), ouro, [0, .32, -2.25], [-Math.PI / 2 - .45, 0, 0]);
    for (const sx of [-1, 1]) { peca(g, esfera(.12), luz(0xff4040, 3), [sx * .32, .7, -1.98]); peca(g, cone(.12, .6), branco, [sx * .3, 1.1, -1.3], [-.5, 0, sx * .3]); }
    const asas = par(g, asa([[.2, -.5], [2.4, -1.4], [4.6, -.8], [4.2, .4], [2.4, .7], [.5, 1]], .1), branco, [.5, .3, 0], .2);
    peca(g, cil(.1, .18, 2), pelo, [0, 0, 2], [Math.PI / 2 - .3, 0, 0]);
    peca(g, esfera(.25), mat(0x8a5a2e), [0, -.3, 3]);
    for (const [x, z] of [[-.5, -.6], [.5, -.6], [-.5, .8], [.5, .8]]) peca(g, cone(.14, .7), ouro, [x, -.75, z], [Math.PI, 0, 0]);
    return { obj: g, anima(t) { bate(asas, .2 + Math.sin(t * 9) * .55); } };
  },
  draco() { return dragao(0xe05aff, 0x8cd06a, 0xffe040, 0xf0e6c8, { boca: 0xff70ff, vel: 4.5 }); },
  anciao() { return dragao(0x1d4fb0, 0x8ac8ff, 0xfff080, 0xe8f4ff, { boca: 0x60b8ff, vel: 2.2 }); },
  bruxa() {
    const g = new THREE.Group(), preto = mat(0x2a1440), pele = mat(0x8cf04a);
    peca(g, cil(.13, .13, 5.2), mat(0x6a4020), [0, 0, .2], [Math.PI / 2, 0, 0]);
    peca(g, cone(.7, 1.6, 10), mat(0x9a7a40), [0, 0, 3.1], [-Math.PI / 2, 0, 0]);
    peca(g, cone(1, 2.1, 24), preto, [0, 1, 0]);
    peca(g, esfera(.5), pele, [0, 2.2, -.1]);
    peca(g, cone(.14, .7), pele, [0, 2.1, -.7], [-Math.PI / 2 + .3, 0, 0]);
    peca(g, cil(1.25, 1.25, .1, 28), preto, [0, 2.55, 0]);
    const chapeu = peca(g, cone(.6, 2, 24), preto, [0, 3.5, .2], [.45, 0, 0]);
    for (const sx of [-1, 1]) peca(g, esfera(.1), luz(0xffe040, 3), [sx * .2, 2.35, -.45]);
    for (let i = 0; i < 6; i++) peca(g, cil(.03, .03, 1.3), mat(0xd8d0a0), [Math.cos(i) * .4, 1.8, .3 + Math.sin(i) * .2], [.6, 0, (i - 2.5) * .25]);
    const frasco = new THREE.Group(); frasco.position.set(.95, 1.4, -.8); g.add(frasco);
    peca(frasco, esfera(.38), brilha(0x8cf04a, 1, { transparent: true, opacity: .85 }), [0, 0, 0]);
    peca(frasco, cil(.12, .14, .35), mat(0xd0e8f0), [0, .42, 0]);
    return { obj: g, anima(t) { g.rotation.z = Math.sin(t * 2.4) * .14; frasco.rotation.z = Math.sin(t * 5) * .3; } };
  },
  gargula() {
    const g = new THREE.Group(), pedra = mat(0x6a6f78, { roughness: .8, clearcoat: 0 });
    peca(g, esfera(1), pedra, [0, 0, 0], [0, 0, 0], [1.1, 1, 1.3]);
    peca(g, esfera(.75), pedra, [0, .7, -1.1]);
    for (const sx of [-1, 1]) {
      peca(g, cone(.2, 1.1), pedra, [sx * .45, 1.4, -1], [-.3, 0, sx * -.5]);
      peca(g, cil(.25, .2, 1.4), pedra, [sx * .8, -.6, -.6], [.6, 0, 0]);
    }
    const olhos = [-1, 1].map(sx => peca(g, esfera(.15), luz(0xff3a20, 3.5), [sx * .3, .85, -1.75]));
    peca(g, caixa(.8, .35, .5), pedra, [0, .4, -1.75]);
    const asas = par(g, asa([[.3, -.6], [2, -1.8], [4, -1.6], [3.4, -.6], [4, .4], [2.6, .2], [2.4, 1], [.6, .8]], .1), mat(0x4a4f56, { roughness: .8, clearcoat: 0, side: THREE.DoubleSide }), [.7, .6, .2], .4);
    peca(g, tubo([[0, -.2, 1], [0, -.5, 2.2], [.6, -.6, 3]], .25, .3, 12), pedra);
    const lascas = new THREE.Group(); g.add(lascas);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; peca(lascas, new THREE.DodecahedronGeometry(.28), mat(0x9a9288), [Math.cos(a) * 2.2, .2, Math.sin(a) * 2.2], [a, a, 0]); }
    return { obj: g, anima(t, info) {
      const p = info.pedra ?? 1; // 1 = pedra, 0 = acordada
      for (const o of olhos) o.visible = p < .5;
      lascas.visible = p < .5; lascas.rotation.y = t * 2;
      bate(asas, p > .5 ? .5 : .1 + Math.sin(t * 7) * .5);
    } };
  },
};

// ---------- chefão 1: Fortaleza Voadora (castelo voador de pedra com motores) ----------
export function fortaleza() {
  const g = new THREE.Group(), pedra = mat(0xa8a090, { roughness: .7 }), pedra2 = mat(0x7a7468, { roughness: .75 }), madeira = mat(0x6a4022),
    telhado = mat(0x5a2a8a), metal = mat(0x4a4f60, { metalness: .6, roughness: .35 }), ouro = mat(0xe8b840, { metalness: .5, roughness: .3 });
  // casco de madeira (base do castelo)
  const casco = new THREE.BoxGeometry(14, 2.2, 7, 14, 4, 8), pc = casco.attributes.position;
  for (let i = 0; i < pc.count; i++) { const y = pc.getY(i); if (y < 0) { pc.setX(i, pc.getX(i) * .82); pc.setZ(i, pc.getZ(i) * .7); } }
  casco.computeVertexNormals();
  peca(g, casco, madeira, [0, -.6, 0]);
  peca(g, esfera(4), pedra2, [0, -2.2, 0], [0, 0, 0], [1.4, .55, .7]); // rocha flutuante embaixo
  for (let i = 0; i < 8; i++) peca(g, cone(.6, 2.4, 6), pedra2, [(i - 3.5) * 1.3, -3.6, (i % 2 - .5) * 1.4], [Math.PI, 0, 0]);
  // muralha
  peca(g, caixa(12, 1.6, 5.4), pedra, [0, 1.1, 0]);
  for (let i = -5; i <= 5; i++) for (const z of [-2.6, 2.6]) peca(g, caixa(.6, .6, .5), pedra, [i * 1.1, 2.2, z]);
  // torre central (canhão principal) e torres
  peca(g, cil(1.8, 2, 3.4, 28), pedra, [0, 3.3, 0]);
  peca(g, cone(2.3, 2.8, 28), telhado, [0, 6.4, 0]);
  const olho = peca(g, esfera(.6), luz(0xff6a3a, 3), [0, 3.4, -1.9]);
  for (const [x, z] of [[-5.6, -2], [5.6, -2], [-5.6, 2], [5.6, 2]]) {
    peca(g, cil(.9, 1, 3.6, 24), pedra, [x, 2.6, z]);
    peca(g, cone(1.2, 2.2, 24), telhado, [x, 5.5, z]);
    peca(g, caixa(.4, .7, .1), luz(0xffd070, 1.8), [x, 2.8, z - (z < 0 ? 1 : -1) * .95]);
    peca(g, cil(.05, .05, 1.4), metal, [x, 7.1, z]);
    peca(g, caixa(1, .5, .04), mat(0xd03030), [x + .5, 7.5, z]);
  }
  // canhões na frente
  for (const x of [-3, -1.2, 1.2, 3]) peca(g, cil(.32, .4, 1.8), metal, [x, 1.3, -3.2], [Math.PI / 2, 0, 0]);
  // 4 motores vermelhos com hélice e fogo
  const helices = [], fogos = [];
  for (const x of [-6.2, -3.1, 3.1, 6.2]) {
    const m = new THREE.Group(); m.position.set(x, -.2, .4); g.add(m);
    peca(m, esfera(1), mat(0xc0392b), [0, 0, 0], [0, 0, 0], [.85, .85, 1.8]);
    peca(m, cil(.9, .9, .25), ouro, [0, 0, -1.2], [Math.PI / 2, 0, 0]);
    const h = new THREE.Group(); h.position.set(0, 0, -1.55); m.add(h); helices.push(h);
    for (let k = 0; k < 3; k++) peca(h, caixa(.25, 2.4, .08), metal, [0, 0, 0], [0, 0, k * Math.PI / 1.5]);
    fogos.push(peca(m, cone(.55, 2.2, 16), luz(0xffb040, 2.4), [0, 0, 2.6], [Math.PI / 2, 0, 0]));
  }
  // cristal de energia em cima
  const cristal = peca(g, new THREE.OctahedronGeometry(.8), luz(0xffd36b, 2.6), [0, 8.6, 0], [0, 0, 0], [1, 1.6, 1]);
  return { obj: g, anima(t, info) {
    for (const h of helices) h.rotation.z = t * 18;
    for (const f of fogos) f.scale.set(1, .8 + Math.sin(t * 25) * .2, 1);
    cristal.rotation.y = t * 1.5; cristal.position.y = 8.6 + Math.sin(t * 2) * .25;
    olho.scale.setScalar(info.furia ? 1.4 + Math.sin(t * 12) * .25 : 1);
    olho.material.color.setHex(info.furia ? 0xff2010 : 0xff6a3a).multiplyScalar(3);
    g.rotation.z = Math.sin(t * .9) * .03;
  } };
}

// ---------- tiros, cristais ----------
export function geoEstrela() {
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? .45 : 1; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const g = new THREE.ExtrudeGeometry(s, { depth: .3, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 2 }); g.center(); g.rotateX(-Math.PI / 2); return g;
}
export function geoPena() { const g = new THREE.SphereGeometry(1, 12, 8); g.scale(.45, .3, 1.4); return g; }
