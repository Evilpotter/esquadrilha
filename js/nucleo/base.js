// ---------- Base: tela, teclado, utilitários ----------
let W = 540;
const H = 860;
const cv = document.getElementById('c');
const cx = cv.getContext('2d');
let scale = 1;
function resize() {
  const nw = clamp(Math.round(innerWidth / innerHeight * H), 540, 2600);
  if (nw !== W) { W = nw; genBg(); }
  const s = Math.min(innerWidth / W, innerHeight / H);
  scale = s;
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = W * s + 'px';
  cv.style.height = H * s + 'px';
  cv.width = Math.round(W * s * dpr);
  cv.height = Math.round(H * s * dpr);
  cx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
}
addEventListener('resize', resize);

const keys = {};
addEventListener('keydown', e => {
  if (!keys[e.code]) onKey(e.code);
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
function pick(arr, n) {
  const a = arr.slice(), o = [];
  while (o.length < n && a.length) o.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return o;
}

const TAU = Math.PI * 2;

const PCOL = [
  { body: '#3b8fe0', dark: '#1d4f86', name: 'Jogador 1' },
  { body: '#f0a030', dark: '#9a5a10', name: 'Jogador 2' },
];
