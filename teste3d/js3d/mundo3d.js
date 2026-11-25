// ---------- Teste 3D: o mundo ----------
// Lê o estado do jogo (S, W, H, bgScroll – globais dos scripts clássicos) e desenha em 3D.
// Coordenadas: x do jogo → X, y do jogo → Z (para baixo da tela = +Z). As naves e tiros voam no plano Y = 0.
// O chão do Reino fica embaixo (Y = -CHAO) e rola com bgScroll.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mat, luz, esfera, encaixa, preparaPisca, fenix, modelos, fortaleza, geoEstrela, geoPena } from './modelos3d.js';

// W, H, S, bgScroll e rage() são globais dos scripts clássicos (o módulo enxerga pelo nome)
const K = .1;                           // unidades 3D por px do jogo
const CHAO = 16;                        // profundidade do chão abaixo do plano de voo
const T = 240;                          // comprimento de um bloco do cenário (repete)
const LEVE = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
const X = x => (x - W / 2) * K, Z = y => (y - H / 2) * K;

// ---------- renderizador, cena, luz ----------
const renderer = new THREE.WebGLRenderer({ antialias: LEVE, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LEVE ? 1 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
renderer.domElement.id = 'mundo3d';
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const CEU = 0xbfe4ff;
scene.background = new THREE.Color(CEU); scene.fog = new THREE.Fog(CEU, 150, 330);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .3;
scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x6a5030, .75));
const sol = new THREE.DirectionalLight(0xfff1d6, 2.6); sol.castShadow = true;
sol.shadow.mapSize.set(LEVE ? 1024 : 2048, LEVE ? 1024 : 2048); sol.shadow.bias = -.0004; sol.shadow.normalBias = .05;
scene.add(sol, sol.target);
const contra = new THREE.DirectionalLight(0x9fd0ff, 1.4); contra.position.set(30, 30, -90); scene.add(contra);

// ---------- câmera: inclinada, enquadra a área do jogo inteira ----------
const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 1, 700);
const INCL = 57 * Math.PI / 180; // ângulo abaixo do horizonte
let camAlvo = new THREE.Vector3(), camW = 0, camAsp = 0;
function cabe(dist, alvoZ) {
  cam.position.set(0, Math.sin(INCL) * dist, alvoZ + Math.cos(INCL) * dist); cam.lookAt(0, 0, alvoZ); cam.updateMatrixWorld(); cam.projectionMatrix;
  const w = W * K / 2, h = H * K / 2; let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  for (const [x, z] of [[-w, -h], [w, -h], [-w, h], [w, h]]) { const v = new THREE.Vector3(x, 0, z).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
  return { x0, x1, y0, y1 };
}
function ajustaCamera() {
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  // mesma área da tela que a camada 2D (HUD) ocupa – em tela estreita ela fica centralizada com faixas
  const rc = document.getElementById('c').getBoundingClientRect();
  const lx0 = rc.left / innerWidth * 2 - 1, lx1 = rc.right / innerWidth * 2 - 1, ly1 = 1 - rc.top / innerHeight * 2, ly0 = 1 - rc.bottom / innerHeight * 2;
  const meio = (ly0 + ly1) / 2;
  let az = 0, d = 100;
  for (let it = 0; it < 5; it++) {
    let a = 20, b = 900; for (let k = 0; k < 40; k++) { const m = (a + b) / 2, r = cabe(m, az); if (r.x0 < lx0 || r.x1 > lx1 || r.y0 < ly0 || r.y1 > ly1) a = m; else b = m; }
    d = b; const r = cabe(d, az); az += ((r.y0 + r.y1) / 2 - meio) * 12; // centraliza na vertical
  }
  cabe(d, az); camAlvo.copy(cam.position); camW = W; camAsp = cam.aspect;
  scene.fog.near = d * 1.05; scene.fog.far = d * 2.6; cam.far = d * 3;  cam.updateProjectionMatrix();
  const w = W * K / 2 + 40, h = H * K / 2 + 40;
  sol.position.set(-30, 120, 40); sol.target.position.set(0, -CHAO, 0);
  Object.assign(sol.shadow.camera, { left: -w, right: w, top: h + 30, bottom: -h - 30, near: 10, far: 400 }); sol.shadow.camera.updateProjectionMatrix();
  planoFx.geometry.dispose(); planoFx.geometry = new THREE.PlaneGeometry(W * K, H * K); planoFx.geometry.rotateX(-Math.PI / 2);
}

// ---------- pós-processamento ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, cam));
let ao = null;
if (!LEVE) { ao = new GTAOPass(scene, cam, innerWidth, innerHeight); ao.updateGtaoMaterial({ radius: 2.2, distanceExponent: 1.5, thickness: 2, scale: 1.1, samples: 12 }); ao.blendIntensity = .9; composer.addPass(ao); }
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), LEVE ? .35 : .45, .55, .95); composer.addPass(bloom);
composer.addPass(new OutputPass());
if (!LEVE) composer.addPass(new SMAAPass(innerWidth, innerHeight));
function redimensiona() {
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  if (ao) ao.setSize(innerWidth, innerHeight);
  ajustaCamera();
}
addEventListener('resize', () => setTimeout(redimensiona, 30));

// ---------- semente fixa (o cenário é sempre igual) ----------
let seed = 11;
const sorte = (a = 0, b = 1) => { seed = (seed * 16807) % 2147483647; return a + (b - a) * (seed / 2147483647); };

// ---------- cenário: bloco do Reino Encantado (3 cópias que rolam) ----------
const rioX = z => 16 * Math.sin(z / T * Math.PI * 2) + 7 * Math.sin(z / T * Math.PI * 4 + 1) - 6;
const altura = (x, z) => Math.sin(x * .09) * Math.cos(z / T * Math.PI * 6) * .8 + Math.sin(x * .23 + z / T * Math.PI * 8) * .35;
function bloco() {
  const g = new THREE.Group(), LX = 640;
  // chão com cor por vértice (grama clara/escura, margem de areia perto do rio)
  const geo = new THREE.PlaneGeometry(LX, T, 320, 120); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [], c1 = new THREE.Color(0x4fae3e), c2 = new THREE.Color(0x8ad05a), areia = new THREE.Color(0xe8d49a), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), dr = Math.abs(x - rioX(z));
    const u = Math.min(1, Math.max(0, (dr - 6.5) / 4)), su = u * u * (3 - 2 * u); p.setY(i, -1.2 + (altura(x, z) + 1.2) * su);
    c.copy(c1).lerp(c2, (Math.sin(x * .05 + Math.sin(z / T * Math.PI * 2) * 2) + 1) / 2 * .8 + sorte(0, .2));
    if (dr < 11) c.lerp(areia, Math.min(1, Math.max(0, 1 - (dr - 8) / 3)));
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  const chao = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); chao.receiveShadow = true; g.add(chao);
  // rio
  const pos = [], idx = [], N = 160;
  for (let i = 0; i <= N; i++) { const z = -T / 2 + i * T / N, x = rioX(z); pos.push(x - 8.5, -.5, z, x + 8.5, -.5, z); if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); } }
  const gr = new THREE.BufferGeometry(); gr.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gr.setIndex(idx); gr.computeVertexNormals();
  const rio = new THREE.Mesh(gr, new THREE.MeshPhysicalMaterial({ color: 0x2aa6e8, roughness: .1, clearcoat: 1, emissive: 0x06406a, side: THREE.DoubleSide })); rio.receiveShadow = true; g.add(rio);
  const longe = (x, z, d) => Math.abs(x - rioX(z)) > d;
  // árvores (instanciadas: tronco + 3 copas)
  const ARV = 170, tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(.35, .5, 2.4, 10), mat(0x6a4022, { clearcoat: 0 }), ARV + 30);
  const copa = new THREE.InstancedMesh(esfera(1, 20, 14), mat(0xffffff, { clearcoat: .25 }), (ARV + 30) * 3);
  const dmy = new THREE.Object3D(), cor = new THREE.Color(); let nt = 0, nc = 0;
  const arvore = (x, z, s, magica) => {
    dmy.position.set(x, 1.2 * s, z); dmy.rotation.set(0, 0, 0); dmy.scale.set(s, s, s); dmy.updateMatrix(); tronco.setMatrixAt(nt++, dmy.matrix);
    const base = magica ? [0xb050f0, 0x9a3ae0, 0xc070ff][nc % 3] : [0x2f8a3a, 0x3aa040, 0x2a7a46, 0x45a83a][Math.floor(sorte(0, 4))];
    for (let k = 0; k < 3; k++) { const r = (1.8 - k * .4) * s; dmy.position.set(x + sorte(-.3, .3) * s, (2.6 + k * 1.25) * s, z + sorte(-.3, .3) * s); dmy.scale.set(r, r * .92, r); dmy.updateMatrix(); copa.setMatrixAt(nc, dmy.matrix); copa.setColorAt(nc++, cor.set(base).offsetHSL(0, 0, k * .04)); }
  };
  for (let i = 0; i < ARV; i++) { const x = sorte(-LX / 2 + 10, LX / 2 - 10), z = sorte(-T / 2, T / 2); if (!longe(x, z, 11) || (x > 20 && x < 85 && z > -100 && z < -20)) continue; arvore(x, z, sorte(1.5, 2.6), sorte() < .1); }
  for (let i = 0; i < 14; i++) arvore(sorte(-90, -40), sorte(30, 90), sorte(1.6, 2.6), false); // bosque
  tronco.count = nt; copa.count = nc; tronco.castShadow = copa.castShadow = true; tronco.receiveShadow = copa.receiveShadow = true; g.add(tronco, copa);
  // cogumelos (instanciados)
  const CG = 60, pe = new THREE.InstancedMesh(new THREE.CylinderGeometry(.22, .28, .8, 10), mat(0xf4ecd8), CG), chapeu = new THREE.InstancedMesh(new THREE.SphereGeometry(.7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xb8402a, { clearcoat: .2 }), CG);
  let nm = 0;
  const cogumelo = (x, z, s = 1) => { const y = altura(x, z); dmy.rotation.set(0, 0, 0); dmy.scale.set(s, s, s); dmy.position.set(x, y + .4 * s, z); dmy.updateMatrix(); pe.setMatrixAt(nm, dmy.matrix); dmy.position.y = y + .75 * s; dmy.updateMatrix(); chapeu.setMatrixAt(nm++, dmy.matrix); };
  for (let i = 0; i < 14; i++) { const x = sorte(-150, 150), z = sorte(-T / 2, T / 2); if (longe(x, z, 10)) cogumelo(x, z, sorte(1.2, 1.8)); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cogumelo(-48 + Math.cos(a) * 7, -20 + Math.sin(a) * 7, 1.3); } // círculo de fadas
  pe.count = chapeu.count = nm; pe.castShadow = chapeu.castShadow = true; g.add(pe, chapeu);
  // tufos de grama e flores
  const TF = LEVE ? 2200 : 5000, tufo = new THREE.InstancedMesh(new THREE.SphereGeometry(.5, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ roughness: .8 }), TF);
  let nf = 0;
  for (let i = 0; i < TF; i++) { const x = sorte(-LX / 2, LX / 2), z = sorte(-T / 2, T / 2); if (!longe(x, z, 7)) continue; const s = sorte(.8, 1.9);
    dmy.position.set(x, altura(x, z), z); dmy.rotation.set(0, sorte(0, 6), 0); dmy.scale.set(s, s * .7, s); dmy.updateMatrix(); tufo.setMatrixAt(nf, dmy.matrix);
    tufo.setColorAt(nf++, cor.set(sorte() < .02 ? [0xd8c050, 0xc07090, 0xd0d0c0, 0x9070c0][i % 4] : [0x4caa3a, 0x6cc848, 0x3a9440][i % 3])); }
  tufo.count = nf; tufo.receiveShadow = true; g.add(tufo);
  // cristais mágicos
  for (let i = 0; i < 10; i++) { const x = sorte(-120, 120), z = sorte(-T / 2, T / 2); if (!longe(x, z, 9)) continue;
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(1), mat(0x60e0ff, { emissive: 0x60e0ff, emissiveIntensity: .8, transparent: true, opacity: .9 })); cr.scale.set(1, 2.2, 1); cr.position.set(x, altura(x, z) + 1.5, z); cr.castShadow = true; g.add(cr); }
  // pontes de pedra
  for (const z of [-70, 45]) {
    const pg = new THREE.Group(), pedra = mat(0xa89c88, { roughness: .8 });
    const arco = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1, 10, 24, Math.PI), pedra); arco.scale.set(1, .5, 1.8); arco.castShadow = true; pg.add(arco);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(14, .7, 3.6), pedra); tab.position.y = 2.8; tab.castShadow = tab.receiveShadow = true; pg.add(tab);
    pg.position.set(rioX(z), -.5, z); g.add(pg);
  }
  const cs = castelo(52, -60); cs.scale.setScalar(1.15); g.add(cs);
  return g;
}
function castelo(x, z) {
  const g = new THREE.Group(), pedra = mat(0xc8c0b0, { roughness: .75 }), azul = mat(0x3a6ad8), verm = mat(0xc83030);
  const add = (geo, m, p, r = [0, 0, 0], s = [1, 1, 1]) => { const o = new THREE.Mesh(geo, m); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  const fosso = new THREE.Mesh(new THREE.RingGeometry(13, 16, 48), new THREE.MeshPhysicalMaterial({ color: 0x2a8ad0, roughness: .1, clearcoat: 1, emissive: 0x06304a })); fosso.rotation.x = -Math.PI / 2; fosso.position.y = .1; g.add(fosso);
  const L = 18;
  for (const [px, pz, rz] of [[0, -L / 2, 0], [0, L / 2, 0], [-L / 2, 0, 1], [L / 2, 0, 1]]) {
    add(new THREE.BoxGeometry(L, 4, 1.6), pedra, [px, 2, pz], [0, rz * Math.PI / 2, 0]);
    for (let i = -8; i <= 8; i += 2) add(new THREE.BoxGeometry(1, 1, 1.7), pedra, rz ? [px, 4.5, pz + i] : [px + i, 4.5, pz]);
  }
  const torre = (tx, tz, r, h, m) => {
    add(new THREE.CylinderGeometry(r, r * 1.05, h, 24), pedra, [tx, h / 2, tz]);
    add(new THREE.ConeGeometry(r * 1.3, h * .7, 24), m, [tx, h + h * .35, tz]);
    add(new THREE.BoxGeometry(.6, 1, .15), luz(0xffd070, 1.6), [tx, h * .6, tz + r]);
    add(new THREE.BoxGeometry(1.6, .8, .06), mat(0xe03030), [tx + .8, h * 1.7 + 1.4, tz]);
    add(new THREE.CylinderGeometry(.08, .08, 2.6), mat(0x444444), [tx, h * 1.7 + .8, tz]);
  };
  for (const [tx, tz] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) torre(tx, tz, 2.2, 7.5, azul);
  add(new THREE.BoxGeometry(9, 9, 8), pedra, [0, 4.5, -.5]);
  const tel = new THREE.ConeGeometry(6.6, 5, 4); tel.rotateY(Math.PI / 4); add(tel, verm, [0, 11.5, -.5], [0, 0, 0], [1, 1, .9]);
  torre(-3.3, -3.3, 1.4, 13, verm); torre(3.3, -3.3, 1.4, 13, verm); torre(0, 2, 1.6, 15, verm);
  add(new THREE.BoxGeometry(3.4, 3.4, .5), mat(0x3a2414), [0, 1.7, 9.3]);
  add(new THREE.BoxGeometry(3.4, .4, 6), mat(0x7a5030), [0, .3, 12.4]);
  g.position.set(x, 0, z); return g;
}
const blocos = [bloco(), bloco(), bloco()]; // mesma semente? não: cada um diferente, mas as bordas casam (rio e relevo são periódicos)
const chao = new THREE.Group(); chao.position.y = -CHAO; blocos.forEach(b => chao.add(b)); scene.add(chao);
// poeira mágica entre o chão e o plano de voo
const PO = LEVE ? 50 : 90, poGeo = new THREE.BufferGeometry(), poPos = new Float32Array(PO * 3), poCor = new Float32Array(PO * 3);
for (let i = 0; i < PO; i++) { poPos.set([sorte(-180, 180), sorte(-CHAO + 2, -3), sorte(-150, 100)], i * 3); const c = new THREE.Color([0xffffff, 0xffb0ff, 0xb0ffff, 0xfff0a0][i % 4]).multiplyScalar(.55); poCor.set([c.r, c.g, c.b], i * 3); }
poGeo.setAttribute('position', new THREE.BufferAttribute(poPos, 3)); poGeo.setAttribute('color', new THREE.BufferAttribute(poCor, 3));
const ponto = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const poeira = new THREE.Points(poGeo, new THREE.PointsMaterial({ size: .8, map: ponto, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
scene.add(poeira);

// ---------- camada de efeitos 2D (textura num plano no nível do voo) ----------
const texFx = new THREE.CanvasTexture(document.createElement('canvas')); texFx.colorSpace = THREE.SRGBColorSpace;
const planoFx = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texFx, transparent: true, depthTest: false, depthWrite: false }));
planoFx.renderOrder = 999; planoFx.position.y = .5; scene.add(planoFx);

// ---------- modelos com reaproveitamento (pool) ----------
const LARG = { mago: 62, grifo: 66, draco: 100, bruxa: 72, gargula: 86, anciao: 190 }; // largura na tela (px do jogo)
const livres = {}, usados = new Map();
function pega(tipo) {
  const l = livres[tipo] || (livres[tipo] = []);
  let m = l.pop();
  if (!m) {
    const base = tipo === 'fenix' ? fenix() : tipo === 'fortress' ? fortaleza() : modelos[tipo]();
    const larg = tipo === 'fenix' ? 96 : tipo === 'fortress' ? 270 : LARG[tipo] || 60;
    m = preparaPisca({ ...base, obj: base.obj }); m.raiz = encaixa(base.obj, larg * K, tipo === 'mago' || tipo === 'bruxa'); m.tipo = tipo; m.yaw = Math.PI;
    m.raiz.traverse(o => { if (o.isMesh) o.castShadow = true; });
  }
  scene.add(m.raiz); return m;
}
function solta(m) { scene.remove(m.raiz); (livres[m.tipo] = livres[m.tipo] || []).push(m); }
function modeloDe(chave, tipo, vistos) {
  let m = usados.get(chave);
  if (m && m.tipo !== tipo) { solta(m); m = null; }
  if (!m) { m = pega(tipo); m.t0 = Math.random() * 10; m.px = null; usados.set(chave, m); }
  vistos.add(chave); return m;
}

// ---------- instanciados: penas, cristais de XP, tiros inimigos ----------
function lote(geo, material, max, cor) {
  const m = new THREE.InstancedMesh(geo, material, max); m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  if (cor) { for (let i = 0; i < max; i++) m.setColorAt(i, new THREE.Color(1, 1, 1)); m.instanceColor.setUsage(THREE.DynamicDrawUsage); }
  scene.add(m); return m;
}
const corLuz = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
const halo = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
const L = {
  pena: lote(geoPena(), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb030).multiplyScalar(2.6), toneMapped: false }), 400),
  penaHalo: lote(esfera(1, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a10).multiplyScalar(1.6), transparent: true, opacity: .5, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }), 400),
  gema: lote(new THREE.OctahedronGeometry(1), mat(0xffffff, { emissive: 0x2a8a3a, emissiveIntensity: .7, roughness: .15 }), 600, true),
  estrela: lote(geoEstrela(), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd84a).multiplyScalar(2.4), toneMapped: false }), 300),
  pedra: lote(new THREE.DodecahedronGeometry(1), mat(0x8a8f96, { roughness: .8, clearcoat: 0, emissive: 0xff3a20, emissiveIntensity: .25 }), 300),
  pocao: lote(esfera(1, 16, 12), mat(0x8cf04a, { emissive: 0x8cf04a, emissiveIntensity: .9, transparent: true, opacity: .9, roughness: .05 }), 100),
  bola: lote(esfera(1, 16, 12), corLuz, 900, true),
  aura: lote(esfera(1, 12, 8), halo, 900, true),
};
const dmy = new THREE.Object3D(), cor = new THREE.Color();
const COR_TIRO = { estrela: 0xffd84a, gota: 0x8cf04a, sopro: 0x4ab4ff, chefao: 0xff6a3a, bala: 0xffe0a0 };

// ---------- sincronização com o jogo ----------
const vistos = new Set();
let ultimo = performance.now(), relogio = 0;
function sync(dt) {
  vistos.clear();
  const jogo = !!S.players && S.mode !== 'title';
  // título: a Fênix voando sozinha no meio
  if (!jogo) {
    const m = modeloDe('titulo', 'fenix', vistos);
    m.raiz.position.set(Math.sin(relogio * .7) * 3, Math.sin(relogio * 1.6) * .6, Z(370)); m.raiz.rotation.set(0, 0, 0);
    m.anima(relogio, { tilt: Math.cos(relogio * .7) * .6 }); m.pisca(0);
  } else {
    // naves
    for (const p of S.players) {
      if (!p.alive || p.ovoT > 0) continue;
      if (p.inv > 0 && !(p.dashT > 0) && Math.floor(p.inv * 12) % 2) continue;
      const m = modeloDe(p, 'fenix', vistos);
      m.raiz.position.set(X(p.x), 0, Z(p.y)); m.raiz.rotation.set(0, 0, 0);
      m.anima(relogio + m.t0, { tilt: p.tilt || 0 }); m.pisca(0);
    }
    // inimigos
    for (const e of S.enemies) {
      if (e.dead || !LARG[e.type]) continue;
      const m = modeloDe(e, e.type, vistos), x = X(e.x), z = Z(e.y);
      // vira para onde anda (grifo e dragãozinho); os outros olham para baixo
      if ((e.type === 'grifo' || e.type === 'draco') && m.px) { const dx = x - m.px[0], dz = z - m.px[1]; if (dx * dx + dz * dz > 1e-4) { const alvo = Math.atan2(-dx, -dz); let d = alvo - m.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); m.yaw += d * Math.min(1, dt * 8); } }
      m.px = [x, z];
      m.raiz.position.set(x, 0, z); m.raiz.rotation.set(0, m.yaw, 0);
      m.anima(relogio + m.t0, { pedra: e.pedra, aviso: e.aviso });
      if (m.boca) m.boca.visible = (e.aviso > 0) || (e.cospe > 0);
      m.pisca(e.flash);
    }
    // chefão
    for (const b of S.bosses) {
      if (b.dead) continue;
      const m = modeloDe(b, b.kind === 'fortress' ? 'fortress' : 'fortress', vistos);
      m.raiz.position.set(X(b.x), 0, Z(b.y)); m.raiz.rotation.set(0, Math.PI, 0);
      m.anima(relogio, { furia: rage(b) }); m.pisca(b.flash);
    }
  }
  for (const [k, m] of usados) if (!vistos.has(k)) { solta(m); usados.delete(k); }
  // penas da Fênix
  let n = 0;
  if (jogo) for (const b of S.bullets) {
    if (b.type !== 'feather' || n >= 400) continue;
    dmy.position.set(X(b.x), 0, Z(b.y)); dmy.rotation.set(0, Math.atan2(-b.vx, -b.vy), 0); dmy.scale.setScalar(Math.max(.5, (b.r || 5) * K * .9)); dmy.updateMatrix();
    L.pena.setMatrixAt(n, dmy.matrix); dmy.scale.multiplyScalar(1.9); dmy.updateMatrix(); L.penaHalo.setMatrixAt(n++, dmy.matrix);
  }
  L.pena.count = L.penaHalo.count = n; L.pena.instanceMatrix.needsUpdate = L.penaHalo.instanceMatrix.needsUpdate = true;
  // cristais de XP
  n = 0;
  if (jogo) for (const g of S.gems) {
    if (n >= 600) break; const s = g.v >= 3 ? .75 : .52;
    dmy.position.set(X(g.x), Math.sin(relogio * 3 + g.x) * .3, Z(g.y)); dmy.rotation.set(0, relogio * 2 + g.y, 0); dmy.scale.set(s, s * 1.5, s); dmy.updateMatrix();
    L.gema.setMatrixAt(n, dmy.matrix); L.gema.setColorAt(n++, cor.set(g.v >= 3 ? 0x6fd3ff : 0x7dff8a));
  }
  L.gema.count = n; L.gema.instanceMatrix.needsUpdate = true; if (L.gema.instanceColor) L.gema.instanceColor.needsUpdate = true;
  // tiros dos inimigos
  const c = { estrela: 0, pedra: 0, pocao: 0, bola: 0 };
  if (jogo) for (const e of S.ebullets) {
    const x = X(e.x), z = Z(e.y), r = Math.max(4, e.r || 5) * K;
    if (e.k === 'estrela' && c.estrela < 300) { dmy.position.set(x, 0, z); dmy.rotation.set(0, relogio * 6 + e.x, 0); dmy.scale.setScalar(r * 1.4); dmy.updateMatrix(); L.estrela.setMatrixAt(c.estrela++, dmy.matrix); }
    else if (e.k === 'pedra' && c.pedra < 300) { dmy.position.set(x, 0, z); dmy.rotation.set(relogio * 5 + e.y, relogio * 4, 0); dmy.scale.setScalar(r * 1.2); dmy.updateMatrix(); L.pedra.setMatrixAt(c.pedra++, dmy.matrix); }
    else if (e.k === 'pocao' && c.pocao < 100) { dmy.position.set(x, 0, z); dmy.rotation.set(0, 0, relogio * 8); dmy.scale.set(r * 1.1, r * 1.3, r * 1.1); dmy.updateMatrix(); L.pocao.setMatrixAt(c.pocao++, dmy.matrix); }
    if (c.bola >= 900) continue;
    // núcleo brilhante + aura colorida (todos os tiros ganham a aura)
    const base = COR_TIRO[e.k] ?? (e.c ? new THREE.Color(e.c).getHex() : 0xff8a3a);
    const nucleo = e.k === 'estrela' || e.k === 'pedra' || e.k === 'pocao' ? .001 : r * .95;
    dmy.rotation.set(0, 0, 0); dmy.position.set(x, 0, z); dmy.scale.setScalar(nucleo); dmy.updateMatrix(); L.bola.setMatrixAt(c.bola, dmy.matrix); L.bola.setColorAt(c.bola, cor.set(base).lerp(new THREE.Color(1, 1, 1), .3).multiplyScalar(2.6));
    dmy.scale.setScalar(r * 2.1); dmy.updateMatrix(); L.aura.setMatrixAt(c.bola, dmy.matrix); L.aura.setColorAt(c.bola++, cor.set(base).multiplyScalar(2.2));
  }
  for (const k of ['estrela', 'pedra', 'pocao']) { L[k].count = c[k]; L[k].instanceMatrix.needsUpdate = true; }
  L.bola.count = L.aura.count = c.bola; for (const m of [L.bola, L.aura]) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
}

// ---------- quadro ----------
function render(fxCanvas) {
  const agora = performance.now(), dt = Math.min(.05, (agora - ultimo) / 1000); ultimo = agora; relogio += dt;
  if (W !== camW || Math.abs(innerWidth / innerHeight - camAsp) > .001) redimensiona();
  // cenário rola junto com o mapa 2D (bgScroll em px)
  const off = ((bgScroll * K) % T + T) % T;
  blocos.forEach((b, i) => { b.position.z = off + (i - 1) * T; });
  const pp = poGeo.attributes.position; for (let i = 0; i < PO; i++) { let z = pp.getZ(i) + dt * 6 * (1 + (i % 3) * .3); if (z > 100) z -= 250; pp.setZ(i, z); pp.setX(i, pp.getX(i) + Math.sin(relogio + i) * dt * .8); } pp.needsUpdate = true;
  // tremida da tela (S.shake)
  const sh = S && S.shake > 0 ? S.shake * 1.4 : 0;
  cam.position.set(camAlvo.x + (Math.random() - .5) * sh, camAlvo.y + (Math.random() - .5) * sh, camAlvo.z + (Math.random() - .5) * sh);
  // efeitos 2D
  if (texFx.image !== fxCanvas) { texFx.image = fxCanvas; texFx.dispose(); }
  texFx.needsUpdate = true;
  sync(dt);
  composer.render(dt);
}
ajustaCamera();
window.MUNDO3D = { render, LEVE };
