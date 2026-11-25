"""Testes do Esquadrilha (Chrome headless + Playwright).

Uso:  python3 ferramentas/testar.py [comando] [--raiz PASTA] [--tela LARGxALT]
Comandos:
  fumaca      joga ~150 s simulados com 1 e 2 jogadores; falha se houver erro de JS (padrão)
  fotos       título/hangar e uma cena de cada cenário com skins  -> dist/foto-*.png
  bumerangues Bumerangue com as 8 skins lado a lado               -> dist/bumerangues.png
  bestiario   todos os inimigos por cenário e os 10 chefões       -> dist/bestiario-*.png
  pirata      Âncora Negra: joga com todas as armas piratas e fotografa âncora, onda, dragões -> dist/pirata-*.png
  fenix       Fênix: joga com todas as armas de fogo, testa o Renascer e fotografa armas, skins e ovo -> dist/fenix-*.png
  hypnos      Hypnos: joga com todas as armas da mente, confere aliados/tontura e fotografa -> dist/hypnos-*.png
  piratas     Mar dos Piratas: joga 150 s nas fases 1, 3 e 5 (1 e 2 jogadores) e fotografa -> dist/piratas-*.png
  habilidades cada nave usa a habilidade ativa sempre que pronta (ondas, chefão, 2 jogadores); confere e fotografa -> dist/habilidades.png
  chefoes     luta 40 s com cada chefão (1 e 2 jogadores) e grava o resumo -> dist/chefoes.json
              (mesmo arquivo antes/depois = comportamento igual)
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
      for (const ships of [[0], [1, 2]].concat(typeof PIRATA !== 'undefined' ? [[3, 0]] : [], typeof FENIX !== 'undefined' ? [[4, 1]] : [], typeof HYPNOS !== 'undefined' ? [[5, 3]] : [])) {
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
    for sc, ships, skins in [('sea', [0, 1], ['dragao', 'lamina']), ('desert', [2, 0], ['garra', 'vazio']), ('space', [1, 2], ['geada', 'bosque'])] + ([('piratas', [3, 4], ['espectro', 'geada'])] if (raiz / 'js/inimigos/piratas.js').exists() else []):
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
    for sc, tipos in ([('sea', ['scout', 'zig', 'swooper', 'gunner', 'kamikaze', 'heavy', 'splitter', 'mini', 'spinner', 'sniper', 'miner', 'mine', 'hunter']),
                      ('desert', ['jeep', 'heli', 'tank', 'flak', 'base']), ('space', ['swarm', 'ufo', 'rock', 'beamer', 'blinker'])]
                      + ([('piratas', ['bote', 'gaivota', 'escuna', 'balao', 'kraken', 'fantasma'])] if (raiz / 'js/inimigos/piratas.js').exists() else [])):
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [0], ['dragao']); g.S.scene = '{sc}'; g.S.banner = null; g.S.spawnT = 1e9;
          g.step(1/60); g.S.enemies = []; g.S.ebullets = []; g.S.bullets = [];
          const tipos = {tipos}, n = tipos.length, W = g.S.players[0].x * 2;
          tipos.forEach((t, i) => {{ const x = W * (i + 1) / (n + 1), y = 200 + (i % 2) * 170;
            if (t === 'rock') g.addRock(x, y, 26, true, 0); else g.addEnemy(t, x, y, {{ aim: Math.PI / 2 + .6, stopY: y, x0: x, mode: t === 'blinker' ? 'show' : t === 'kraken' ? 'fica' : t === 'fantasma' ? 'aqui' : undefined, mt: 9, sub: 0, cool: 9, alpha: 1 }}); }});
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


def pirata(p):
    """Âncora Negra com todas as armas piratas: 2 min de jogo sem erro + fotos (armas, dragões por skin, hangar)."""
    from PIL import Image
    b, pg = abrir(p)
    pg.evaluate("() => { const g = window.__g; for (const s of g.SKINS) g.unlockSkin(s.id); }")
    res = pg.evaluate("""() => {
      const g = window.__g, out = {};
      for (const [n, ships] of [[1, [3]], [2, [3, 3]]]) {
        g.newGame(n, ships);
        for (const pl of g.S.players) for (const t of ['wave', 'dragon', 'broadside', 'barrel', 'parrot', 'whirl']) pl.weapons.push(g.newWeapon(t));
        for (let i = 0; i < 60 * 150; i++) {
          g.step(1/60);
          if (g.S.mode === 'levelup' || g.S.mode === 'reward') { for (let k = 0; k < g.S.players.length; k++) try { g.choose(k, 0); } catch (e) {} }
          if (g.S.mode === 'gameover') break;
          if (i % 900 === 0) g.draw();
        }
        out[ships.join('+')] = { modo: g.S.mode, fase: g.S.phase, nivel: g.S.level, abates: g.S.kills,
          armas: g.S.players[0].weapons.map(w => w.type + w.lvl).join(' ') };
      }
      return out; }""")
    print('pirata jogo:', res)
    # armas em ação
    pg.evaluate("""() => { const g = window.__g; g.newGame(1, [3], ['classic']); g.S.scene = 'sea'; g.S.banner = null;
      const p = g.S.players[0]; p.inv = 1e9;
      for (const t of ['wave', 'broadside', 'barrel', 'parrot', 'whirl']) p.weapons.push(g.newWeapon(t));
      for (let i = 0; i < 60 * 12; i++) g.step(1/60); g.draw(); }""")
    pg.screenshot(path=str(dist / f'pirata-armas-{vw}.png'))
    # dragão de cada skin
    shots = []
    for sk in ['classic', 'sucata', 'bosque', 'garra', 'geada', 'lamina', 'vazio', 'espectro', 'dragao']:
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [3], ['{sk}']); g.S.scene = 'space'; g.S.banner = null; g.S.spawnT = 1e9;
          const p = g.S.players[0], x0 = p.x; p.inv = 1e9; p.weapons.push(g.newWeapon('dragon'));
          g.addEnemy('gunner', x0, 150, {{ stopY: 150 }}); g.S.enemies[0].hp = 1e9;
          for (let i = 0; i < 90; i++) {{ g.step(1/60); p.x = x0 + Math.sin(i / 20) * 50; }}
          g.S.enemies = []; g.S.ebullets = []; g.draw(); return p.dragonT; }}""")
        f = dist / f'_d_{sk}.png'
        pg.screenshot(path=str(f), clip={'x': vw / 2 - 100, 'y': vh * .42, 'width': 200, 'height': vh * .58}); shots.append(f)
    ims = [Image.open(f) for f in shots]
    out = Image.new('RGB', (200 * len(ims), ims[0].height))
    for k, i in enumerate(ims): out.paste(i, (k * 200, 0))
    out.save(str(dist / 'pirata-dragoes.png'))
    for f in shots: f.unlink()
    pg.evaluate("() => { const g = window.__g; g.openShipSelect(1); g.S.ss.skin = ['espectro', 'classic']; g.S.ss.cur = [3, 0]; for (let i = 0; i < 30; i++) g.step(1/60); g.draw(); }")
    pg.screenshot(path=str(dist / f'pirata-hangar-{vw}.png'))
    b.close()
    print('pirata: ok')


def fenix(p):
    """Fênix com todas as armas de fogo: 150 s sem erro, Renascer (sozinha e salvando o parceiro) e fotos."""
    from PIL import Image
    b, pg = abrir(p)
    pg.evaluate("() => { const g = window.__g; for (const s of g.SKINS) g.unlockSkin(s.id); }")
    res = pg.evaluate("""() => {
      const g = window.__g, out = {};
      for (const [n, ships] of [[1, [4]], [2, [4, 0]]]) {
        g.newGame(n, ships);
        for (const t of ['wings', 'meteor', 'chick', 'sun']) g.S.players[0].weapons.push(g.newWeapon(t));
        let ovos = 0;
        for (let i = 0; i < 60 * 150; i++) {
          g.step(1/60);
          if (g.S.players.some(q => q.ovoT > 0)) ovos++;
          if (g.S.mode === 'levelup' || g.S.mode === 'reward') { for (let k = 0; k < g.S.players.length; k++) try { g.choose(k, 0); } catch (e) {} }
          if (g.S.mode === 'gameover') break;
          if (i % 900 === 0) g.draw();
        }
        out[ships.join('+')] = { modo: g.S.mode, fase: g.S.phase, nivel: g.S.level, abates: g.S.kills, quadrosOvo: ovos,
          armas: g.S.players[0].weapons.map(w => w.type + w.lvl).join(' ') };
      }
      // Renascer sozinha: cai, vira ovo, volta com 50%; segunda queda na mesma fase é para valer
      g.newGame(1, [4]); g.S.spawnT = 1e9; let p = g.S.players[0]; p.inv = 0;
      g.hurt(p, 999); const ovo = p.ovoT > 0 && p.alive;
      for (let i = 0; i < 150; i++) g.step(1/60);
      const volta = p.alive && !(p.ovoT > 0) && Math.round(p.hp) === 50;
      p.inv = 0; g.hurt(p, 999); const cai = !p.alive;
      // salvando o parceiro: Falcão cai, a Fênix gasta o renascer nele
      g.newGame(2, [0, 4]); g.S.spawnT = 1e9; const f = g.S.players[0], fx = g.S.players[1]; f.inv = 0;
      g.hurt(f, 999); const salvo = f.alive && f.ovoT > 0 && fx.renasceFase === 1;
      for (let i = 0; i < 150; i++) g.step(1/60);
      out.renascer = { ovo, volta, segundaQuedaCai: cai, salvaParceiro: salvo, parceiroVolta: f.alive && Math.round(f.hp) === 50 };
      return out; }""")
    print('fênix:', res)
    r = res['renascer']
    if not all(r.values()): erros.append('Renascer falhou: ' + str(r))
    # armas em ação
    pg.evaluate("""() => { const g = window.__g; g.newGame(1, [4], ['classic']); g.S.scene = 'sea'; g.S.banner = null;
      const p = g.S.players[0]; p.inv = 1e9;
      for (const t of ['wings', 'meteor', 'chick', 'sun']) p.weapons.push(g.newWeapon(t));
      for (let i = 0; i < 60 * 14; i++) { g.step(1/60); p.x = g.S.players[0].x + Math.sin(i / 40) * 3; } p.inv = 0; g.draw(); }""")
    pg.screenshot(path=str(dist / f'fenix-armas-{vw}.png'))
    # nave de cada skin (parada e atirando) e o ovo
    shots = []
    for sk in ['classic', 'sucata', 'bosque', 'garra', 'geada', 'lamina', 'vazio', 'espectro', 'dragao', 'ovo']:
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [4], ['{sk if sk != 'ovo' else 'classic'}']); g.S.scene = 'space'; g.S.banner = null; g.S.spawnT = 1e9;
          const p = g.S.players[0], x0 = p.x; p.inv = 1e9;
          g.addEnemy('gunner', x0, p.y - 170, {{ stopY: p.y - 170 }}); g.S.enemies[0].hp = 1e9;
          for (let i = 0; i < 70; i++) g.step(1/60);
          if ('{sk}' === 'ovo') {{ p.inv = 0; g.hurt(p, 999); for (let i = 0; i < 80; i++) g.step(1/60); }}
          p.inv = 0; g.S.ebullets = []; g.draw(); }}""")
        f = dist / f'_f_{sk}.png'
        pg.screenshot(path=str(f), clip={'x': vw / 2 - 100, 'y': vh * .42, 'width': 200, 'height': vh * .58}); shots.append(f)
    ims = [Image.open(f) for f in shots]
    out = Image.new('RGB', (200 * len(ims), ims[0].height))
    for k, i in enumerate(ims): out.paste(i, (k * 200, 0))
    out.save(str(dist / 'fenix-skins.png'))
    for f in shots: f.unlink()
    pg.evaluate("() => { const g = window.__g; g.openShipSelect(1); g.S.ss.skin = ['dragao', 'classic']; g.S.ss.cur = [4, 0]; for (let i = 0; i < 30; i++) g.step(1/60); g.draw(); }")
    pg.screenshot(path=str(dist / f'fenix-hangar-{vw}.png'))
    b.close()
    print('fênix: ok')


def hypnos(p):
    """Hypnos com todas as armas da mente: 150 s sem erro, confere aliados, clones, tontura e rei; fotos."""
    from PIL import Image
    b, pg = abrir(p)
    pg.evaluate("() => { const g = window.__g; for (const s of g.SKINS) g.unlockSkin(s.id); }")
    res = pg.evaluate("""() => {
      const g = window.__g, out = {};
      for (const [n, ships] of [[1, [5]], [2, [5, 0]]]) for (const sc of ['sea', 'desert', 'space', 'piratas']) {
        g.newGame(n, ships); g.S.scene = sc;
        for (const t of ['grito', 'clone', 'ima', 'rei']) g.S.players[0].weapons.push(g.newWeapon(t));
        let maxAl = 0, quadrosAl = 0, rei = 0, clone = 0, tontos = 0, bloqueios = 0, tipos = {};
        for (let i = 0; i < 60 * 150; i++) {
          const antes = (g.S.aliados || []).reduce((s, a) => s + a.escudo, 0);
          g.step(1/60);
          const al = g.S.aliados || [];
          if (al.length) quadrosAl++;
          for (const a of al) tipos[a.type] = 1;
          maxAl = Math.max(maxAl, al.filter(a => !a.rei).length);
          if (al.some(a => a.rei)) rei++;
          if (g.S.players[0].cloneT > 0) clone++;
          if (g.S.enemies.some(e => e.stunT > 0)) tontos++;
          if (al.reduce((s, a) => s + a.escudo, 0) < antes) bloqueios++;
          if (g.S.mode === 'levelup' || g.S.mode === 'reward') { for (let k = 0; k < g.S.players.length; k++) try { g.choose(k, 0); } catch (e) {} }
          if (g.S.mode === 'gameover') break;
          if (i % 900 === 0) g.draw();
        }
        out[ships.join('+') + '-' + sc] = { modo: g.S.mode, fase: g.S.phase, abates: g.S.kills, maxAliados: maxAl, quadrosAliado: quadrosAl,
          quadrosRei: rei, quadrosClone: clone, quadrosTonto: tontos, bloqueios, tipos: Object.keys(tipos).sort().join(' ') };
      }
      // aliado: 3 acertos convertem; chefão não converte; máximo de 4
      g.newGame(1, [5]); g.S.spawnT = 1e9; const p = g.S.players[0]; p.inv = 1e9;
      const e = g.addEnemy('gunner', p.x, p.y - 200, { stopY: p.y - 200 }); e.hp = 1e9;
      for (let i = 0; i < 60 * 3 && !e.dead; i++) g.step(1/60);
      const vira = e.dead && g.S.aliados.length === 1 && g.S.aliados[0].type === 'gunner';
      for (let k = 0; k < 6; k++) { const x = g.addEnemy('scout', p.x, p.y - 150); x.hp = 1e9; x.vy = 0; }
      for (let i = 0; i < 60 * 4; i++) { for (const q of g.S.enemies) q.y = p.y - 150; g.step(1/60); }
      const maximo = g.S.aliados.filter(a => !a.rei).length === 4;
      g.newGame(1, [5]); g.S.phase = 1; g.spawnBoss(); g.S.players[0].inv = 1e9;
      for (let i = 0; i < 60 * 10; i++) g.step(1/60);
      const chefaoNao = g.S.bosses.length > 0 && !(g.S.aliados || []).some(a => a.type === g.S.bosses[0].kind);
      out.regras = { vira, maximo, chefaoNao };
      return out; }""")
    for k, v in res.items(): print('hypnos', k, v)
    r = res['regras']
    if not all(r.values()): erros.append('Hypnos: regra falhou ' + str(r))
    # armas em ação
    pg.evaluate("""() => { const g = window.__g; g.newGame(2, [5, 0], ['classic', 'classic']); g.S.scene = 'sea'; g.S.banner = null; g.S.phase = 3;
      const p = g.S.players[0]; for (const q of g.S.players) q.inv = 1e9;
      for (const t of ['grito', 'clone', 'ima', 'rei']) p.weapons.push(g.newWeapon(t));
      for (let i = 0; i < 60 * 13; i++) { if (g.S.mode !== 'play') for (let k = 0; k < 2; k++) try { g.choose(k, 0); } catch (e) {} g.step(1/60); }
      for (const q of g.S.players) q.inv = 0; g.S.banner = null; g.draw(); }""")
    pg.screenshot(path=str(dist / f'hypnos-armas-{vw}.png'))
    shots = []
    for sk in ['classic', 'sucata', 'bosque', 'garra', 'geada', 'lamina', 'vazio', 'espectro', 'dragao']:
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [5], ['{sk}']); g.S.scene = 'space'; g.S.banner = null; g.S.spawnT = 1e9;
          const p = g.S.players[0], x0 = p.x; p.inv = 1e9;
          g.addEnemy('gunner', x0, p.y - 190, {{ stopY: p.y - 190 }}); g.S.enemies[0].hp = 1e9;
          for (let i = 0; i < 40; i++) g.step(1/60);
          p.inv = 0; g.S.ebullets = []; g.draw(); }}""")
        f = dist / f'_h_{sk}.png'
        pg.screenshot(path=str(f), clip={'x': vw / 2 - 100, 'y': vh * .42, 'width': 200, 'height': vh * .58}); shots.append(f)
    ims = [Image.open(f) for f in shots]
    out = Image.new('RGB', (200 * len(ims), ims[0].height))
    for k, i in enumerate(ims): out.paste(i, (k * 200, 0))
    out.save(str(dist / 'hypnos-skins.png'))
    for f in shots: f.unlink()
    pg.evaluate("() => { const g = window.__g; g.openShipSelect(1); g.S.ss.skin = ['vazio', 'classic']; g.S.ss.cur = [5, 0]; for (let i = 0; i < 30; i++) g.step(1/60); g.draw(); }")
    pg.screenshot(path=str(dist / f'hypnos-hangar-{vw}.png'))
    b.close()
    print('hypnos: ok')


def piratas(p):
    b, pg = abrir(p)
    res = pg.evaluate("""() => {
      const g = window.__g, out = {}, vistos = {}, tiros = {};
      for (const ships of [[3], [4, 0]]) for (const ph of [1, 3, 5]) {
        g.newGame(ships.length, ships); g.S.scene = 'piratas'; g.S.banner = null; g.S.phase = ph;
        for (const pl of g.S.players) pl.inv = 1e9;
        for (let i = 0; i < 60 * 150; i++) {
          if (g.S.mode === 'levelup' || g.S.mode === 'reward') { try { for (let k = 0; k < g.S.players.length; k++) g.choose(k, 0); } catch (e) {} }
          g.S.scene = 'piratas'; g.S.phaseT = Math.min(g.S.phaseT, 50); // fica nas ondas do mapa (sem chefão)
          g.step(1 / 60); if (i % 30 === 0) g.draw();
          for (const e of g.S.enemies) vistos[e.type] = 1;
          for (const t of g.S.ebullets) tiros[t.k] = 1;
        }
        out[ships.join('+') + '-f' + ph] = { modo: g.S.mode, abates: g.S.kills };
      }
      out.inimigos = Object.keys(vistos).sort().join(' '); out.tiros = Object.keys(tiros).sort().join(' ');
      return out;
    }""")
    print('piratas:', res)
    falta = [t for t in ['bote', 'gaivota', 'escuna', 'balao', 'kraken', 'fantasma'] if t not in res['inimigos'].split()]
    falta += [t for t in ['mosquete', 'balaCanhao', 'barril', 'tinta', 'chamaFantasma'] if t not in res['tiros'].split()]
    if falta: erros.append('Mar dos Piratas: não apareceu ' + ', '.join(falta))
    pg.evaluate("""() => { const g = window.__g; g.newGame(2, [3, 4], ['classic', 'dragao']); g.S.scene = 'piratas'; g.S.banner = null; g.S.phase = 4;
      for (const pl of g.S.players) pl.inv = 1e9;
      for (let i = 0; i < 60 * 14; i++) { if (g.S.mode !== 'play') for (let k = 0; k < 2; k++) try { g.choose(k, 0); } catch (e) {} g.step(1 / 60); }
      g.S.banner = null; g.draw(); }""")
    pg.screenshot(path=str(dist / f'piratas-jogo-{vw}.png'))
    b.close()


def chefoes(p):
    import json, hashlib
    b, pg = abrir(p)
    res = pg.evaluate("""() => {
      const g = window.__g, out = {};
      for (const np of [1, 2]) for (let ph = 1; ph <= 10; ph++) {
        g.newGame(np, np === 1 ? [0] : [0, 1]); g.S.scene = 'space'; g.S.banner = null; g.S.spawnT = 1e9;
        g.S.phase = ph; g.spawnBoss(); for (const pl of g.S.players) pl.inv = 1e9;
        const reg = [];
        for (let i = 0; i < 60 * 40; i++) {
          g.step(1 / 60);
          if (g.S.mode !== 'play') { for (let k = 0; k < g.S.players.length; k++) try { g.choose(k, 0); } catch (e) {} }
          if (i % 60 === 59) reg.push(g.S.bosses.map(c => [Math.round(c.x), Math.round(c.y), Math.round(c.hp), c.dead ? 1 : 0]).concat([[g.S.ebullets.length, g.S.hazards.length, g.S.enemies.length]]));
        }
        out[np + 'J-fase' + ph + '-' + (g.S.bosses[0] ? g.S.bosses[0].kind : '?')] = reg;
      }
      return out;
    }""")
    b.close()
    (dist / 'chefoes.json').write_text(json.dumps(res), encoding='utf-8')
    for k, v in res.items():
        print(' ', k, hashlib.md5(json.dumps(v).encode()).hexdigest()[:8], 'vida final', [c[2] for c in v[-1][:-1]])
    print('chefões: ok')


def habilidades(p):
    """Habilidades ativas: cada nave usa a sua sempre que fica pronta (ondas e chefão, 1 e 2 jogadores); confere os efeitos e fotografa."""
    from PIL import Image
    b, pg = abrir(p)
    res = pg.evaluate("""() => {
      const g = window.__g, out = {};
      const roda = (ships, sc, ph, seg, chefao) => {
        g.newGame(ships.length, ships); g.S.scene = sc; g.S.phase = ph; g.S.banner = null;
        if (chefao) { g.S.spawnT = 1e9; g.spawnBoss(); }
        for (const pl of g.S.players) pl.inv = 1e9;
        const r = { usos: 0, dash: 0, furia: 0, ciclone: 0, missil: 0, bala: 0, xp2: 0, baf: 0, chamas3: 0, aliadosMax: 0, onda: 0 };
        for (let i = 0; i < 60 * seg; i++) {
          for (let k = 0; k < g.S.players.length; k++) if (g.usarHab(k)) r.usos++;
          g.step(1 / 60);
          const S = g.S;
          if (S.mode === 'levelup' || S.mode === 'reward') { for (let k = 0; k < S.players.length; k++) try { g.choose(k, 0); } catch (e) {} }
          for (const q of S.players) { if (q.dashT > 0) r.dash++; if (q.furiaT > 0) r.furia++; if (q.cicloneT > 0) r.ciclone++; if (q.bafT > 0) r.baf++; }
          if (S.bullets.some(x => x.type === 'hab_missil')) r.missil++;
          if (S.bullets.some(x => x.type === 'hab_bala')) r.bala++;
          if (S.bullets.some(x => x.type === 'hab_onda')) r.onda++;
          if (S.xpDobroT > 0) r.xp2++;
          if (S.enemies.some(e => e.burnN === 3) || S.bosses.some(e => e.burnN === 3)) r.chamas3++;
          r.aliadosMax = Math.max(r.aliadosMax, (S.aliados || []).filter(a => !a.rei).length);
          if (i % 900 === 0) g.draw();
        }
        r.modo = g.S.mode; r.abates = g.S.kills;
        if (chefao) r.chefao = g.S.bosses.length ? Math.round(g.S.bosses.reduce((s, c) => s + Math.max(0, c.hp), 0)) : 'derrotado';
        return r;
      };
      for (let n = 0; n < 6; n++) {
        for (const sc of ['sea', 'desert', 'space', 'piratas']) out[n + '-' + sc] = roda([n], sc, sc === 'piratas' ? 3 : 1, 60);
        out[n + '-chefao3'] = roda([n], 'space', 3, 40, true);
      }
      out['0+5-2J'] = roda([0, 5], 'sea', 2, 60);
      out['4+3-2J'] = roda([4, 3], 'piratas', 2, 60);
      return out; }""")
    reg = {0: ('dash', 'furia'), 1: ('ciclone',), 2: ('missil',), 3: ('bala', 'xp2'), 4: ('baf', 'chamas3'), 5: ('onda',)}
    for k, v in res.items():
        print('hab', k, v)
        if v['usos'] == 0: erros.append('habilidade não foi usada: ' + k)
        if k[0].isdigit() and '+' not in k:
            for c in reg[int(k[0])]:
                if not v[c]: erros.append(f'habilidade {k}: {c} não aconteceu')
    if max(v['aliadosMax'] for k, v in res.items() if k.startswith('5') or '+5' in k) <= 4: erros.append('Onda psíquica não passou do limite de 4 aliados')
    # fotos: cada habilidade em ação (fase 2 no Oceano, 8 s de ondas antes)
    tempos = [.12, 1.0, .55, .4, 1.0, .35]
    shots = []
    for n in range(6):
        pg.evaluate(f"""() => {{ const g = window.__g; g.newGame(1, [{n}], ['classic']); g.S.scene = 'sea'; g.S.banner = null; g.S.phase = 2;
          const p = g.S.players[0]; p.inv = 1e9;
          for (let i = 0; i < 60 * 8; i++) {{ if (g.S.mode !== 'play') try {{ g.choose(0, 0); }} catch (e) {{}} g.step(1/60); }}
          p.dirX = 0; p.dirY = -1; g.usarHab(0);
          for (let i = 0; i < Math.round(60 * {tempos[n]}); i++) g.step(1/60);
          p.inv = 0; g.draw(); }}""")
        f = dist / f'_hab{n}.png'
        pg.screenshot(path=str(f)); shots.append(f)
    ims = [Image.open(f) for f in shots]
    w, h = ims[0].width // 2, ims[0].height // 2
    out = Image.new('RGB', (w * 3, h * 2))
    for k, i in enumerate(ims): out.paste(i.resize((w, h)), ((k % 3) * w, (k // 3) * h))
    out.save(str(dist / 'habilidades.png'))
    for f in shots: f.unlink()
    b.close()
    print('habilidades: ok')


from playwright.sync_api import sync_playwright
CMDS = {'fumaca': [fumaca], 'fotos': [fotos], 'bumerangues': [bumerangues], 'bestiario': [bestiario], 'chefoes': [chefoes],
        'pirata': [pirata], 'fenix': [fenix], 'hypnos': [hypnos], 'piratas': [piratas], 'habilidades': [habilidades], 'todos': [fumaca, fotos, bumerangues, bestiario]}
with sync_playwright() as p:
    for fn in CMDS[a.cmd]:
        fn(p)
srv.shutdown()
if erros:
    print('ERROS:', *erros[:10], sep='\n  '); sys.exit(1)
print('OK – sem erros de JS')
