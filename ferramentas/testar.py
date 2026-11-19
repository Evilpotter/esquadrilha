"""Testes do Esquadrilha (Chrome headless + Playwright).

Uso:  python3 ferramentas/testar.py [comando] [--raiz PASTA] [--tela LARGxALT]
Comandos:
  fumaca      joga ~150 s simulados com 1 e 2 jogadores; falha se houver erro de JS (padrão)
  fotos       título/hangar e uma cena de cada cenário com skins  -> dist/foto-*.png
  bumerangues Bumerangue com as 8 skins lado a lado               -> dist/bumerangues.png
  bestiario   todos os inimigos por cenário e os 10 chefões       -> dist/bestiario-*.png
  todos       tudo acima
O sorteio (Math.random) é fixo, então as fotos saem iguais a cada execução:
servem para comparar antes/depois de uma mudança (ferramentas/comparar.py).
"""
import sys, pathlib, http.server, threading, functools, argparse

AQUI = pathlib.Path(__file__).resolve().parent
ap = argparse.ArgumentParser()
ap.add_argument('cmd', nargs='?', default='fumaca')
ap.add_argument('--raiz', default=str(AQUI.parent))
ap.add_argument('--tela', default='1720x720')
ap.add_argument('--saida', default=None)
a = ap.parse_args()
raiz = pathlib.Path(a.raiz).resolve()
dist = pathlib.Path(a.saida).resolve() if a.saida else raiz / 'dist'
dist.mkdir(parents=True, exist_ok=True)
vw, vh = map(int, a.tela.lower().split('x'))

# sorteio fixo (mulberry32) para fotos repetíveis
SEMENTE = """(() => { let s = 12345; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0;
  let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.requestAnimationFrame = () => 0; })();"""
# o laço automático do jogo fica parado: o teste avança o jogo passo a passo

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass

srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=str(raiz)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_port}/index.html'
erros = []


def abrir(p):
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': vw, 'height': vh})
    pg.add_init_script(SEMENTE)
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'favicon' not in (m.location or {}).get('url', '') and erros.append(m.text))
    pg.goto(URL)
    # espera os desenhos carregarem (se o jogo tiver o carregador de arte)
    pg.wait_for_timeout(600)
    pg.evaluate("() => window.__g && window.__g.arte ? window.__g.arte : null")
    pg.wait_for_timeout(1200)
    return b, pg


def fumaca(p):
    b, pg = abrir(p)
    res = pg.evaluate("""() => {
      const g = window.__g, out = {};
      for (const ships of [[0], [1, 2]]) {
        g.newGame(ships.length, ships);
        for (const pl of g.S.players) pl.inv = 1e9;
        for (let i = 0; i < 60 * 150; i++) {
          if (g.S.mode === 'levelup' || g.S.mode === 'reward') { try { for (let k = 0; k < g.S.players.length; k++) g.choose(k, 0); } catch (e) {} }
          g.step(1 / 60); if (i % 30 === 0) g.draw();
        }
        out[ships.join('+')] = { modo: g.S.mode, fase: g.S.phase, nivel: g.S.level, abates: g.S.kills };
      }
      return out;
    }""")
    pg.screenshot(path=str(dist / 'teste.png'))
    b.close()
    print('fumaça:', res)


def fotos(p):
    b, pg = abrir(p)
    pg.evaluate('() => window.__g.draw()')
    pg.screenshot(path=str(dist / f'foto-titulo-{vw}.png'))
    pg.evaluate("() => { const g = window.__g; for (const s of g.SKINS) g.unlockSkin(s.id); }")
    pg.evaluate("() => { const g = window.__g; g.openShipSelect(2); g.S.ss.skin = ['dragao', 'espectro']; g.S.ss.cur = [0, 1]; for (let i = 0; i < 30; i++) g.step(1/60); g.draw(); }")
    pg.screenshot(path=str(dist / f'foto-hangar-{vw}.png'))
    for sc, ships, skins in [('sea', [0, 1], ['dragao', 'lamina']), ('desert', [2, 0], ['garra', 'vazio']), ('space', [1, 2], ['geada', 'bosque'])]:
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(2, {ships}, {skins}); g.S.scene = '{sc}'; g.S.banner = null;
          for (const pl of g.S.players) pl.inv = 1e9;
          for (let i = 0; i < 60 * 9; i++) {{ g.step(1/60); }} for (const pl of g.S.players) pl.inv = 0; g.draw(); }}""")
        pg.screenshot(path=str(dist / f'foto-{sc}-{vw}.png'))
    b.close()
    print('fotos: ok')


def bumerangues(p):
    from PIL import Image
    b, pg = abrir(p)
    shots = []
    for sk in ['sucata', 'bosque', 'garra', 'geada', 'lamina', 'vazio', 'espectro', 'dragao']:
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [1], ['{sk}']); g.S.scene = 'sea'; g.S.banner = null;
          for (const pl of g.S.players) pl.inv = 1e9; for (let i = 0; i < 75; i++) g.step(1/60); for (const pl of g.S.players) pl.inv = 0;
          g.S.enemies = []; g.S.ebullets = []; g.draw(); }}""")
        f = dist / f'_b_{sk}.png'
        pg.screenshot(path=str(f), clip={'x': vw / 2 - 100, 'y': 60, 'width': 200, 'height': vh - 60}); shots.append(f)
    b.close()
    ims = [Image.open(f) for f in shots]
    out = Image.new('RGB', (200 * 8, ims[0].height))
    for k, i in enumerate(ims): out.paste(i, (k * 200, 0))
    out.save(str(dist / 'bumerangues.png'))
    for f in shots: f.unlink()
    print('bumerangues: ok')


def bestiario(p):
    b, pg = abrir(p)
    for sc, tipos in [('sea', ['scout', 'zig', 'swooper', 'gunner', 'kamikaze', 'heavy', 'splitter', 'mini', 'spinner', 'sniper', 'miner', 'mine', 'hunter']),
                      ('desert', ['jeep', 'heli', 'tank', 'flak', 'base']), ('space', ['swarm', 'ufo', 'rock', 'beamer', 'blinker'])]:
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [0], ['dragao']); g.S.scene = '{sc}'; g.S.banner = null; g.S.spawnT = 1e9;
          g.step(1/60); g.S.enemies = []; g.S.ebullets = []; g.S.bullets = [];
          const tipos = {tipos}, n = tipos.length, W = g.S.players[0].x * 2;
          tipos.forEach((t, i) => {{ const x = W * (i + 1) / (n + 1), y = 200 + (i % 2) * 170;
            if (t === 'rock') g.addRock(x, y, 26, true, 0); else g.addEnemy(t, x, y, {{ aim: Math.PI / 2 + .6, stopY: y, x0: x, mode: t === 'blinker' ? 'show' : undefined, alpha: 1 }}); }});
          for (const e of g.S.enemies) {{ e.vx = 0; e.vy = 0; e.hp = e.maxHp * .6; e.t = 1; }}
          g.S.players[0].inv = 1e9; g.draw(); }}""")
        pg.screenshot(path=str(dist / f'bestiario-{sc}.png'))
    for ph in range(1, 11):
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [0], ['dragao']); g.S.scene = 'space'; g.S.banner = null; g.S.spawnT = 1e9;
          g.S.phase = {ph}; g.spawnBoss(); g.S.banner = null; g.S.players[0].inv = 1e9;
          for (let i = 0; i < 200; i++) g.step(1/60); g.S.ebullets = []; g.S.bullets = []; g.S.hazards = []; g.draw(); }}""")
        pg.screenshot(path=str(dist / f'bestiario-chefao{ph:02d}.png'), clip={'x': vw / 2 - 400, 'y': 0, 'width': 800, 'height': 420})
    b.close()
    print('bestiário: ok')


from playwright.sync_api import sync_playwright
CMDS = {'fumaca': [fumaca], 'fotos': [fotos], 'bumerangues': [bumerangues], 'bestiario': [bestiario],
        'todos': [fumaca, fotos, bumerangues, bestiario]}
with sync_playwright() as p:
    for fn in CMDS[a.cmd]:
        fn(p)
srv.shutdown()
if erros:
    print('ERROS:', *erros[:10], sep='\n  '); sys.exit(1)
print('OK – sem erros de JS')
