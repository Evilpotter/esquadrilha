// ---------- Estado ----------
let S = { mode: 'title' };
let titleT = 0;

function newPlayer(i, n, ship, skin) {
  const sh = SHIPS[ship || 0];
  return {
    i, ship: ship || 0, skin: skin || 'classic', x: n === 1 ? W / 2 : (i ? W * .68 : W * .32), y: H - 150, r: 15,
    hp: 100, maxHp: 100, sh: 0, maxSh: 0, shT: 0, spd: 300, dmg: 1, rate: sh.rate, regen: 0, mag: 80, crit: 0,
    inv: 1.5, alive: true, weapons: [newWeapon(sh.weapon)], tilt: 0, kills: 0,
  };
}
function newGame(n, ships, skins) {
  ships = ships || []; skins = skins || [];
  S = {
    mode: 'play', np: n, players: [...Array(n)].map((_, i) => newPlayer(i, n, ships[i] || 0, skins[i])),
    bullets: [], ebullets: [], enemies: [], gems: [], fx: [],
    phase: 1, phaseT: 0, spawnT: 1, level: 1, xp: 0, xpNext: xpFor(1), pendingLv: 0,
    bosses: [], hazards: [], bossName: '', bossSpawned: false, bossTimer: 0, rewardT: 0, overT: 0,
    banner: null, scene: 'sea', sel: null, kills: 0, touch: null, shake: 0,
  };
  startScene();
}
function startScene() { S.scene = pick(SCENE_KEYS, 1)[0]; S.banner = { t: 2.5, text: 'Fase 1 · ' + SCENES[S.scene].name }; }
function xpFor(l) { return Math.round(5 + 3 * l + .2 * l * l); }

// ---------- Dificuldade por fase ----------
function hpMult() { return (1 + .35 * (S.phase - 1)) * (S.np === 2 ? 1.35 : 1); }
function eDmg() { return 1 + .1 * (S.phase - 1); }
function eSpd() { return 1 + .035 * (S.phase - 1); }
function eRate() { return 1 + .07 * (S.phase - 1); }
function ebs() { return 190 + 12 * S.phase; }
