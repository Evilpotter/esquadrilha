// ---------- Desbloqueios (gravados no navegador) ----------
const SKIN_KEY = 'esquadrilha.skins.v1';
function loadSkins() {
  try { const o = JSON.parse(localStorage.getItem(SKIN_KEY)); if (o && Array.isArray(o.unlocked)) return o; } catch (e) {}
  return { unlocked: ['classic', 'sucata'], last: ['classic', 'classic'] };
}
let skinSave = loadSkins();
function saveSkins() { try { localStorage.setItem(SKIN_KEY, JSON.stringify(skinSave)); } catch (e) {} }
function skinUnlocked(id) { return id === 'classic' || id === 'sucata' || skinSave.unlocked.includes(id); }
function unlockSkin(id) {
  if (skinUnlocked(id)) return;
  skinSave.unlocked.push(id); saveSkins();
  if (S && S.players) S.skinMsg = { t: 4.5, name: skinById(id).name };
}
function skinOnPhase(ph) { for (const sk of SKINS) if (sk.req && sk.req.phase && ph >= sk.req.phase) unlockSkin(sk.id); }
function skinOnBoss(kind) { for (const sk of SKINS) if (sk.req && sk.req.boss === kind) unlockSkin(sk.id); }
function skinRemember(pi, id) { skinSave.last = skinSave.last || ['classic', 'classic']; skinSave.last[pi] = id; saveSkins(); }
function skinLast(pi) { const id = (skinSave.last || [])[pi]; return id && skinUnlocked(id) ? id : 'classic'; }
function skinCycle(id, dir) {
  const list = SKINS.filter(s => skinUnlocked(s.id));
  const i = Math.max(0, list.findIndex(s => s.id === id));
  return list[(i + dir + list.length) % list.length].id;
}
function shotColor(p, w, base) {
  if (!p.skin || p.skin === 'classic' || w.type !== SHIPS[p.ship].weapon) return base;
  return skinById(p.skin).shot || base;
}

