// ---------- Inicialização e laço principal ----------
resize();
genBg();

let last = performance.now();
function frame(now) {
  const dt = Math.min(.033, (now - last) / 1000); last = now;
  lerControles(); step(dt); somQuadro(); draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// desenhos: carrega os SVG de arte/ e prepara as imagens (até lá usa o desenho simples)
const arteOk = carregarArte().then(() => { buildShotImages(); buildBoomImages(); buildBestImages(); });

window.__g = { step, draw, newGame, hurt, usarHab, newWeapon, addEnemy, spawnBoss, addRock, choose, shipChoose, openShipSelect, get S() { return S; }, SKINS, skinSave, unlockSkin, arte: arteOk, VERSAO };
