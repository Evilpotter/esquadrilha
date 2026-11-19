// ---------- Inicialização e laço principal ----------
resize();
genBg();
buildSkinImages();
buildShotImages();
buildBoomImages();
buildBestImages();


let last = performance.now();
function frame(now) {
  const dt = Math.min(.033, (now - last) / 1000); last = now;
  step(dt); draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__g = { step, draw, newGame, addEnemy, spawnBoss, addRock, choose, shipChoose, openShipSelect, get S() { return S; }, SKINS, skinSave, unlockSkin, skinImg };
