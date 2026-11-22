"""Gera os efeitos sonoros da Esquadrilha em <raiz>/som/efeitos/*.ogg.
Uso: python3 ferramentas/sons/efeitos.py [pasta_do_jogo]   (padrão: teste)
Cada função devolve o som pronto; o volume final de cada um fica em js/dados/sons.js."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from dsp import *

# ---------- peças reaproveitadas ----------

def estalo(d=0.012, fc=3000, q=1.2):
    return filtro(ruido(d), 'pf', fc, q) * env(d, 0.0005, curva_=6)


def grave(f0, f1, d, curva_=5):
    return osc(curva(f0, f1, d)) * env(d, 0.001, curva_=curva_)


def faiscas(d, densidade=120, fc=3500, queda=3.0, seed=1):
    """Estalidos soltos (crepitar de fogo, destroços, eletricidade)."""
    r = np.random.default_rng(seed)
    out = np.zeros(n(d))
    t = 0.0
    while t < d:
        t += r.exponential(1 / densidade) * np.exp(t * queda / 2)
        if t >= d:
            break
        g = filtro(ruido(r.uniform(.002, .008)), 'pf', fc * r.uniform(.6, 1.6), 1.5) * r.uniform(.3, 1) * np.exp(-queda * t)
        i = n(t)
        out[i:i + len(g)] += g[:len(out) - i]
    return out


def explosao(d=0.8, corpo_fc=(4500, 250), sub=(95, 38), sub_d=0.35, crepita=0.4, tam=1.0, seed=1):
    """Explosão cartoon: estalo + corpo de ruído que escurece + soco grave + crepitar."""
    corpo = filtro(ruido(d, 'rosa'), 'pb', curva(corpo_fc[0], corpo_fc[1], d), ordem=2)
    corpo = sat(corpo * env(d, 0.002, decai=d * 0.28) * 2.2, 1.8)
    s = osc(curva(sub[0], sub[1], sub_d)) * env(sub_d, 0.001, curva_=3.5)
    cr = faiscas(d, 90, 2800, 3.5 / d, seed) * crepita
    return mix((estalo(0.015, 2200, .8), 0, 0.7), (corpo, 0, 0.9), (sat(s * 1.5, 1.5), 0, 1.1 * tam), (cr, 0.03, 1))


def sino(f, d, parciais=((1, 1), (2.0, .4), (3.0, .15), (4.2, .08)), queda=4.0):
    out = np.zeros(n(d))
    for r_, a in parciais:
        if f * r_ < SR / 2 - 1000:
            out += a * osc(f * r_, d) * env(d, 0.002, decai=d / queda / (r_ ** 0.5))
    return out


def metal(f, d, queda=6.0):
    """Batida metálica (parciais inarmônicas)."""
    return sino(f, d, ((1, 1), (2.76, .7), (5.4, .45), (8.93, .25), (13.3, .12)), queda)


def sopro(d, f0, f1, q=2.0, cor='rosa'):
    """Vento/zunido com o filtro passando (whoosh)."""
    return filtro(ruido(d, cor), 'pf', curva(f0, f1, d), q)


def zap(d, f=110, seed=2):
    r = np.random.default_rng(seed)
    buz = osc(f * (1 + 0.08 * filtro(r.standard_normal(n(d)), 'pb', 60) * 8), forma='serra')
    gate = (filtro(r.standard_normal(n(d)), 'pb', 300) > 0.0).astype(float)
    ch = filtro(ruido(d), 'pf', 3500, 1.0) * gate
    return sat(buz * 0.6 + ch * 0.9, 2.5)


# ---------- tiros do jogador ----------

def tiro_metralhadora():
    d = 0.13
    corpo = osc(curva(1100, 210, 0.06)) * env(0.06, 0.0008, curva_=4)
    s = mix((estalo(0.006, 4200, 1.0), 0, .5), (sat(corpo * 1.2, 1.6), 0, .9), (grave(160, 90, 0.05), 0, .7),
            (filtro(ruido(0.04), 'pa', 5000) * env(0.04, 0.001, curva_=8), 0, .12))
    return reverb(pad(s, d), .07, .35, 5000)


def tiro_leque():
    d = 0.32
    corpo = sum(osc(curva(620 * k, 140 * k, 0.12)) for k in (1, 1.012, .988)) / 3 * env(0.12, 0.001, curva_=4)
    s = mix((estalo(0.01, 2500, .9), 0, .6), (sat(corpo * 1.4, 1.6), 0, .8),
            (filtro(ruido(0.2, 'rosa'), 'pb', curva(5000, 600, 0.2)) * env(0.2, 0.002, curva_=5), 0, .7),
            (grave(130, 60, 0.09), 0, .8))
    return reverb(pad(s, d), .12, .5, 5000)


def tiro_missil():
    d = 0.55
    sib = sopro(0.5, 700, 2600, 1.5) * adsr(0.5, .03, .1, .6, .35)
    s = mix((estalo(0.02, 1500, .7), 0, .6), (grave(150, 55, 0.18), 0, .8),
            (sib, 0.01, 1.0), (filtro(ruido(0.5, 'marrom'), 'pb', 300) * env(0.5, .01, curva_=4), 0, .6))
    return reverb(pad(s, d), .14, .6, 5000)


def tiro_plasma():
    d = 0.6
    fc = np.concatenate([curva(170, 520, 0.05), curva(520, 85, d - 0.05)])
    idx = curva(6, 0.4, d)
    corpo = fm(fc, 1.5, idx) * env(d, 0.003, decai=0.16)
    corpo = ressonante(corpo, 1400, 3)
    sub = osc(curva(110, 45, 0.3)) * env(0.3, 0.002, curva_=3)
    brilho = sino(1568, 0.4, ((1, 1), (2.01, .3)), 5) * 0.25
    s = mix((sat(corpo, 1.6), 0, .8), (sub, 0, .9), (brilho, 0.01, 1), (estalo(0.01, 1800), 0, .4))
    return reverb(s, .22, 1.0, 6000)


def tiro_drone():
    s = mix((osc(curva(1500, 720, 0.045)) * env(0.045, 0.0005, curva_=5), 0, .8), (estalo(0.004, 5000), 0, .3))
    return reverb(pad(s, 0.08), .05, .3)


def tiro_ricochete():
    d = 0.2
    c = osc(curva(1700, 560, 0.12), forma='tri') * env(0.12, 0.0008, curva_=4)
    tw = osc(curva(980, 940, d)) * osc(curva(61, 55, d)) * env(d, 0.001, curva_=6)
    return reverb(mix((c, 0, .8), (tw, 0, .3), (estalo(0.005, 4000), 0, .4)), .1, .4)


def ricochete_quique():
    d = 0.3
    return reverb(mix((metal(1250, d, 7), 0, .7), (estalo(0.005, 6000), 0, .5)), .12, .5)


def tiro_raio():
    d = 0.32
    z = zap(d, 92) * env(d, 0.002, decai=0.09)
    snap = filtro(ruido(0.02), 'pa', 3000) * env(0.02, 0.0005, curva_=8)
    s = mix((snap, 0, .9), (z, 0, .7), (faiscas(d, 400, 5000, 8, 3), 0, .7))
    return reverb(filtro(s, 'pa', 120), .15, .6, 7000)


def serra_corte():
    d = 0.16
    g = (metal(2300, d, 9) + filtro(ruido(d), 'pf', 3000, 2) * 0.6) * (0.6 + 0.4 * np.sign(osc(70, d))) * env(d, 0.002, curva_=5)
    return reverb(g, .06, .3)


def tiro_bumerangue():
    d = 0.34
    fc = np.concatenate([curva(900, 3800, d * .5), curva(3800, 1300, d - n(d * .5) / SR)])
    w = filtro(ruido(d, 'rosa'), 'pf', fc[:n(d)], 3) * np.sin(np.linspace(0, np.pi, n(d))) ** 1.5
    br = sino(2637, 0.25, ((1, 1), (2.4, .4)), 6) * 0.2
    return reverb(mix((w, 0, 1), (br, 0.02, 1)), .12, .5)


def bumerangue_pega():
    return reverb(mix((metal(1760, 0.2, 9), 0, .5), (sino(2093, 0.25), 0.01, .3), (estalo(0.004, 3000), 0, .4)), .1, .4)


def tiro_saraivada():
    partes = []
    for k in range(5):
        r = 2 ** (np.random.default_rng(k).uniform(-1.5, 1.5) / 12)
        sib = sopro(0.25, 900 * r, 2400 * r, 1.6) * adsr(0.25, .01, .05, .5, .18)
        partes.append((mix((estalo(0.008, 1800 * r), 0, .5), (grave(170 * r, 70, 0.07), 0, .6), (sib, 0, .8)), k * 0.055, 1))
    return reverb(mix(*partes), .14, .6)


# ---------- acertos e explosões ----------

def acerto():
    s = mix((filtro(ruido(0.025), 'pf', 2400, 1.2) * env(0.025, 0.0005, curva_=5), 0, .8),
            (osc(curva(340, 130, 0.05)) * env(0.05, 0.0005, curva_=4), 0, .6))
    return reverb(pad(s, 0.07), .06, .25)


def acerto_chefao():
    d = 0.22
    return reverb(mix((metal(420, d, 8), 0, .7), (estalo(0.006, 2500), 0, .6), (grave(120, 70, 0.06), 0, .6)), .1, .5)


def escudo_bloqueio():
    d = 0.35
    s = fm(1320, 1.41, curva(4, .2, d), d) * env(d, 0.002, decai=0.07)
    ch = fm(1336, 1.41, curva(4, .2, d), d) * env(d, 0.002, decai=0.07)
    return reverb(mix((s, 0, .5), (ch, 0, .5), (faiscas(0.2, 300, 6000, 10, 5), 0, .3)), .2, .7, 8000)


def explosao_pequena():
    return reverb(explosao(0.7, (4200, 260), (100, 42), 0.3, .4, 1, 11), .14, 1.0, 4500)


def explosao_area():
    return reverb(explosao(0.45, (3200, 300), (120, 60), 0.18, .25, .7, 12), .1, .7, 4500)


def explosao_media():
    e = explosao(1.1, (4800, 200), (85, 35), 0.45, .55, 1.1, 13)
    bumbo = gm(0, 35, 120, 0.3, 0.6, bateria=True)
    return reverb(mix((e, 0, 1), (bumbo, 0, .9)), .18, 1.4, 4500)


def explosao_grande():
    e = explosao(1.9, (5200, 150), (75, 28), 0.7, .7, 1.3, 14)
    tai = gm(116, 38, 127, 0.5, 1.0)
    tim = gm(47, 38, 127, 0.5, 1.2)
    return limitador(reverb(mix((e, 0, 1), (tai, 0, .8), (tim, 0, .7)), .22, 2.0, 4000), -1)


def explosao_chefao():
    partes = [(explosao(2.4, (5600, 120), (70, 25), 1.0, .8, 1.5, 21), 0, 1)]
    for k, at in enumerate((0.18, 0.42, 0.7, 1.05)):
        partes.append((explosao(1.0, (4500, 220), (90, 40), 0.35, .5, .8, 30 + k), at, 0.55))
    partes += [(gm(116, 36, 127, 0.6, 1.2), 0, .9), (gm(47, 36, 127, 0.6, 1.5), 0, .8),
               (gm(55, [36, 48], 127, 0.4, 1.0), 0, .55), (gm(0, 49, 120, 1.0, 2.0, bateria=True), 0.02, .5),
               (filtro(ruido(3.2, 'marrom'), 'pb', 220) * env(3.2, 0.05, decai=1.0), 0.1, .9)]
    return limitador(reverb(mix(*partes), .25, 2.6, 3800), -1)


# ---------- tiros dos inimigos ----------

def inimigo_laser():
    d = 0.17
    s = filtro(osc(curva(1250, 330, d), forma='quad'), 'pb', 3200) * env(d, 0.001, curva_=4)
    return reverb(s, .1, .4)


def inimigo_metralhadora():
    s = mix((filtro(ruido(0.03), 'pf', 1800, 1.0) * env(0.03, 0.0005, curva_=5), 0, .8), (grave(190, 90, 0.04), 0, .7))
    return reverb(pad(s, 0.07), .06, .3)


def inimigo_missil():
    d = 0.5
    sib = sopro(d, 500, 1600, 1.4) * adsr(d, .04, .1, .55, .3)
    return reverb(mix((grave(110, 50, 0.15), 0, .7), (sib, 0, .9), (estalo(0.015, 1200), 0, .5)), .14, .6)


def inimigo_plasma():
    d = 0.24
    f = curva(700, 380, d) * (1 + 0.25 * osc(28, d))
    s = osc(f) * env(d, 0.004, curva_=3)
    return reverb(ressonante(s, 900, 4) * 0.8, .15, .6)


def inimigo_granada():
    d = 0.22
    return reverb(mix((grave(210, 80, 0.12), 0, 1), (filtro(ruido(0.08), 'pb', 900) * env(0.08, 0.001, curva_=5), 0, .6),
                      (estalo(0.008, 1400), 0, .4)), .1, .5)


def chefao_tiro():
    d = 0.36
    fogo = sopro(d, 350, 1300, 1.2) * env(d, 0.01, decai=0.12)
    return reverb(mix((fogo, 0, 1), (faiscas(d, 150, 2500, 5, 8), 0, .6), (grave(140, 60, 0.12), 0, .6)), .14, .7, 5000)


# ---------- jogador ----------

def dano_jogador():
    d = 0.45
    s = mix((metal(520, 0.25, 7), 0, .5), (grave(150, 50, 0.2), 0, 1),
            (sat(filtro(ruido(0.12), 'pb', 2500) * env(0.12, 0.001, curva_=4) * 2, 2), 0, .7),
            (osc(curva(660, 330, 0.25), forma='tri') * env(0.25, 0.005, curva_=3), 0.03, .25))
    return reverb(s, .15, .8)


def jogador_abatido():
    cai = filtro(osc(curva(950, 110, 1.3) * (1 + 0.02 * osc(7, 1.3)), forma='quad'), 'pb', 2000) * adsr(1.3, .02, .2, .7, .5)
    return limitador(reverb(mix((explosao_grande(), 0, 1), (cai, 0.1, .3)), .1, 1.5), -1)


def xp():
    d = 0.4
    s = sino(1046.5, d, ((1, 1), (2.0, .25), (3.0, .08), (5.0, .03)), 5) * env(d, 0.003, decai=0.1)
    return reverb(mix((s, 0, 1), (filtro(ruido(0.03), 'pa', 7000) * env(0.03, 0.001, curva_=6), 0, .1)), .2, .9, 9000)


def nivel():
    harpa = [(gm(46, nt, 100, 0.4, 1.6), k * 0.045, .55) for k, nt in enumerate([60, 64, 67, 72, 76, 79, 84, 88])]
    coro = gm(52, [60, 64, 67, 72], 95, 1.4, 1.5)
    coro = coro * np.linspace(0, 1, len(coro))[:, None] ** 0.5
    sinos = gm(14, [84, 91], 90, 0.4, 2.0)
    brilho = sum(sino(2093 * r_, 1.2, ((1, 1),), 3) * 0.12 for r_ in (1, 1.25, 1.5))
    return limitador(reverb(mix(*harpa, (coro, 0.15, .6), (sinos, 0.36, .5), (brilho, 0.4, 1)), .28, 2.6, 8000), -1)


def escolha():
    return reverb(mix((gm(9, 84, 100, 0.3, 1.0), 0, .6), (gm(46, [72, 79], 100, 0.3, 1.0), 0.06, .6),
                      (sopro(0.3, 900, 3500, 2) * env(0.3, 0.05, curva_=4), 0, .25)), .25, 1.6, 8000)


def conquista():
    notas = [(gm(9, nt, 105, 0.3, 1.2), k * 0.09, .55) for k, nt in enumerate([79, 84, 88, 91])]
    return limitador(reverb(mix(*notas, (gm(52, [67, 72, 76], 90, 1.0, 1.2), 0.25, .45), (gm(14, 96, 80, 0.5, 2), 0.36, .3)), .3, 2.2, 8000), -1)


def entrada():
    return limitador(reverb(mix((gm(61, [60, 67, 72], 115, 0.35, .8), 0, .8), (gm(47, 48, 115, .3, 1), 0, .6),
                                (sopro(0.4, 500, 3000, 1.5) * env(.4, .2, curva_=4), 0, .3)), .22, 1.8), -1)


# ---------- menus ----------

def menu_mover():
    return reverb(gm(12, 79, 80, 0.12, 0.4) * 1.0, .1, .5)


def menu_ok():
    return reverb(mix((gm(12, 84, 95, 0.15, .5), 0, .7), (gm(9, 91, 85, 0.2, .8), 0.07, .5)), .18, 1.0, 8000)


def menu_voltar():
    return reverb(mix((gm(12, 79, 80, 0.15, .5), 0, .7), (gm(12, 72, 80, 0.2, .5), 0.07, .6)), .15, .8)


def pausa():
    return reverb(mix((sopro(0.35, 3000, 400, 1.5) * env(0.35, .06, curva_=3), 0, .5), (gm(11, [67, 74], 75, 0.4, 1), 0.05, .5)), .2, 1.2)


def despausa():
    return reverb(mix((sopro(0.3, 400, 3200, 1.5) * env(0.3, .1, curva_=3), 0, .5), (gm(11, [74, 79], 80, 0.3, 1), 0.08, .5)), .2, 1.2)


# ---------- chefões ----------

def corneta(nota_hz, d, vib=5.0):
    """Corneta de guerra sintetizada (serra filtrada com brilho que abre e fecha)."""
    f = nota_hz * (1 + 0.006 * osc(vib, d)) * curva(0.94, 1.0, d) ** 0.15
    s = osc(f, forma='serra') + 0.5 * osc(f * 1.003, forma='serra')
    br = curva(300, 1600, d * .3)
    br = np.concatenate([br, np.full(n(d) - len(br), 1600.0)]) * (1 - 0.4 * np.linspace(0, 1, n(d)) ** 2)
    return sat(filtro(s, 'pb', br, ordem=2) * 1.5, 1.4) * adsr(d, .12, .3, .8, .6)


def chefao_alerta():
    """Corneta de guerra dupla + tambores de guerra."""
    c1 = corneta(98, 1.3)
    c2 = corneta(98, 2.0)
    metais = gm(58, [31, 43], 110, 1.1, 0.8)  # tuba
    metais2 = gm(61, [43, 50], 105, 1.6, 1.0)
    tambores = [(gm(116, 36, 127, .3, 1.0), at, g) for at, g in ((0, 1), (0.42, .7), (1.45, 1), (1.7, .7), (1.95, .8))]
    return limitador(reverb(mix((c1, 0, .55), (c2, 1.45, .6), (metais, 0.05, .5), (metais2, 1.5, .5), *tambores), .3, 3.0, 4000), -1)


def chefao_chegada():
    partes = [(gm(47, 33, 127, 0.8, 1.5), 0, 1), (gm(116, 33, 127, .5, 1.2), 0, 1), (gm(55, [33, 45], 127, .5, 1.0), 0, .6),
              (gm(0, 57, 115, 1.0, 2.0, bateria=True), 0.01, .4),
              (filtro(ruido(2.5, 'marrom'), 'pb', 180) * env(2.5, .02, decai=0.8), 0, 1.0),
              (osc(curva(60, 28, 1.2)) * env(1.2, .002, curva_=3), 0, .9)]
    return limitador(reverb(mix(*partes), .3, 3.0, 3500), -1)


def chefao_furia():
    d = 1.5
    base = osc(curva(72, 58, d) * (1 + 0.04 * filtro(ruido(d), 'pb', 25) * 6), forma='serra')
    vogal = filtro(base, 'pf', 650, 3) + filtro(base, 'pf', 1100, 4) * .6 + filtro(base, 'pf', 2600, 6) * .25
    rugido = sat((vogal + filtro(ruido(d, 'rosa'), 'pf', 900, 1.5) * .6) * 2, 2.5) * adsr(d, .15, .3, .8, .7)
    metais = gm(61, [38, 39, 45], 127, 0.9, 1.0)
    return limitador(reverb(mix((rugido, 0, .8), (metais, 0.05, .55), (gm(47, 38, 127, .5, 1.2), 0, .7)), .25, 2.4, 4000), -1)


def raio_carga():
    d = 1.0
    f = curva(180, 1500, d)
    s = (osc(f, forma='serra') * .3 + osc(f * 1.5) * .3) * np.linspace(.15, 1, n(d)) ** 1.5
    s = filtro(s, 'pb', curva(800, 6000, d))
    return reverb(mix((s, 0, .7), (faiscas(d, 25, 5000, -2.0, 9) * 0.35, 0, 1)), .2, .8)


def raio_disparo():
    d = 1.0
    bz = (osc(78, d, 'serra') + osc(156.5, d, 'serra') * .5 + filtro(ruido(d), 'pa', 2500) * .4)
    bz = sat(filtro(bz, 'pb', 3500) * 1.5, 1.6) * adsr(d, .005, .15, .7, .5)
    return limitador(reverb(mix((explosao(0.6, (4000, 300), (90, 40), .3, .2, 1, 40), 0, .8), (bz, 0, .6)), .2, 1.2), -1)


def trovao():
    d = 2.6
    estal = filtro(ruido(0.12), 'pa', 1200) * env(0.12, 0.0005, decai=0.03)
    estal = estal * (filtro(np.random.default_rng(4).standard_normal(n(.12)), 'pb', 120) > -0.2)
    ronco = filtro(ruido(d, 'marrom'), 'pb', 380, ordem=2) * (0.6 + 0.4 * filtro(ruido(d), 'pb', 4) * 4) * env(d, 0.08, decai=0.8)
    return limitador(reverb(mix((estal, 0, 1), (ronco, 0.04, 1.2), (osc(curva(55, 30, 0.6)) * env(0.6, .002, curva_=3), 0, .6)), .3, 3.0, 3000), -1)


def nova_fase():
    trompas = [(gm(60, [55, 62], 110, 0.25, .6), 0, .7), (gm(60, [60, 67], 115, 0.9, 1.0), 0.3, .8)]
    tim = [(gm(47, 43, 110, .2, .6), 0, .6), (gm(47, 36, 127, .4, 1.2), 0.3, .8)]
    return limitador(reverb(mix(*trompas, *tim), .3, 2.4, 5000), -1)


# ---------- Âncora Negra (nave pirata, ideia do Bryan) ----------

def tiro_ancora():
    """Corrente correndo (elos batendo) + zunido pesado da âncora."""
    d = 0.42
    r = np.random.default_rng(11)
    elos = [(metal(r.uniform(1500, 2600), 0.07, 12) * r.uniform(.4, .8), k * 0.026, 1) for k in range(12)]
    zun = sopro(d, 300, 1400, 1.4) * np.sin(np.linspace(0, np.pi, n(d))) ** 1.2
    return reverb(mix(*elos, (zun, 0, .7), (grave(140, 60, 0.12), 0, .5)), .12, .6)


def ancora_pega():
    """Batida pesada de ferro."""
    return reverb(mix((metal(420, 0.5, 5), 0, .8), (metal(980, 0.25, 8), 0, .4), (grave(110, 45, 0.18), 0, 1), (estalo(0.01, 1500), 0, .6)), .18, .9)


def onda():
    """Onda do mar: ruído que sobe e quebra + bolhas."""
    d = 1.3
    corpo = filtro(ruido(d, 'rosa'), 'pb', curva(300, 3200, d), ordem=2)
    corpo = corpo * adsr(d, .45, .25, .55, .6) * 1.6
    espuma = filtro(ruido(d), 'pa', 3500) * adsr(d, .5, .2, .3, .5) * .35
    r = np.random.default_rng(5)
    bolhas = [(osc(curva(f, f * 1.8, .06)) * env(.06, .002, curva_=5) * .25, t, 1) for f, t in zip(r.uniform(500, 1400, 14), r.uniform(.4, 1.2, 14))]
    return reverb(mix((corpo, 0, 1), (espuma, 0, 1), *bolhas, (grave(70, 40, .5), .35, .6)), .25, 1.6)


def dragao_vira():
    """Rugido do dragão + água espirrando + harpa subindo."""
    d = 1.4
    r = np.random.default_rng(7)
    f = curva(95, 70, d) * (1 + .05 * filtro(r.standard_normal(n(d)), 'pb', 30) * 6)
    rugido = sat(filtro(osc(f, forma='serra') + ruido(d, 'rosa') * .6, 'pb', curva(1800, 600, d), ordem=2) * adsr(d, .08, .3, .7, .6) * 2, 2.5)
    agua = filtro(ruido(.6, 'rosa'), 'pf', curva(800, 4000, .6), 1.2) * env(.6, .01, curva_=3) * .8
    harpa = [(gm(46, 60 + k, 100, .3, .6), k * 0.035, .35) for k in (0, 4, 7, 12, 16, 19)]
    return limitador(reverb(mix((rugido, 0, 1), (agua, 0, 1), *harpa), .3, 1.8), -1)


def jato_agua():
    d = 0.12
    j = filtro(ruido(d), 'pf', 2600, 1.2) * env(d, .004, curva_=4)
    return mix((j, 0, .8), (osc(curva(900, 1500, .05)) * env(.05, .002, curva_=5) * .15, 0, 1))


def canhao_bordo():
    """Tiro de canhão antigo: estouro + estrondo grave + eco."""
    b = explosao(0.7, (3500, 180), (75, 32), 0.45, 0.25, tam=1.2, seed=4)
    return reverb(mix((b, 0, 1), (estalo(0.02, 900, .7), 0, .6)), .3, 1.4)


def barril_solta():
    """Barril de madeira caindo + pavio chiando."""
    madeira = sino(240, .2, ((1, 1), (2.3, .5), (3.9, .2)), 9) * .7
    pavio = filtro(ruido(.5), 'pa', 5000) * (0.6 + 0.4 * np.abs(np.sin(np.linspace(0, 40, n(.5))))) * env(.5, .02, curva_=2) * .35
    return reverb(mix((madeira, 0, 1), (grave(130, 70, .08), 0, .6), (pavio, .06, 1)), .1, .5)


def papagaio():
    """Grasnado do papagaio (dois gritinhos)."""
    def grito(f0, f1, d):
        x = fm(curva(f0, f1, d), 1.5, curva(6, 2, d)) * adsr(d, .005, .03, .7, .04)
        return sat(filtro(x, 'pf', 2200, .8) * 2, 2.5)
    return reverb(mix((grito(1300, 2200, .09), 0, 1), (grito(1500, 1100, .12), .11, .9)), .08, .3)


def redemoinho():
    """Vento girando (passa de um lado para o outro)."""
    d = 1.2
    v = sopro(d, 400, 1600, 2.5) * (0.55 + 0.45 * np.sin(np.linspace(0, 2 * np.pi * 7, n(d)))) * adsr(d, .2, .2, .7, .5)
    gr = filtro(ruido(d, 'marrom'), 'pb', 300) * adsr(d, .2, .2, .7, .5) * .6
    e = np.stack([v * (0.5 + 0.5 * np.sin(np.linspace(0, 2 * np.pi * 3.5, n(d)))), v * (0.5 - 0.5 * np.sin(np.linspace(0, 2 * np.pi * 3.5, n(d))))], 1)
    return reverb(mix((e, 0, 1.4), (gr, 0, 1)), .2, 1.2)


# ---------- Fênix ----------

def fogo(d, fc=1800, seed=21):
    """Fogo crepitando: chiado grave + estalidos."""
    ch = filtro(ruido(d, 'rosa'), 'pb', fc, ordem=2) * adsr(d, .03, .1, .7, d * .4)
    return mix((ch, 0, .8), (faiscas(d, 160, 3200, 2.0, seed), 0, .9))


def tiro_pena():
    """Penas de fogo: sopro rápido subindo + estalo de chama."""
    d = 0.3
    s = sopro(d, 700, 4200, 1.8) * env(d, .004, curva_=4) * 1.3
    return reverb(mix((s, 0, 1), (fogo(.22, 2500, 22), 0, .6), (osc(curva(500, 1300, .08)) * env(.08, .002, curva_=5) * .25, 0, 1)), .1, .5)


def asas_fogo():
    d = 0.45
    return reverb(fogo(d, 1500, 23) * .9, .1, .4)


def meteoro():
    """Assobio caindo + estrondo de pedra e fogo."""
    d = 1.4
    assobio = osc(curva(1800, 300, .9)) * adsr(.9, .05, .2, .8, .2) * .25
    vento = sopro(.9, 3000, 500, 2.0) * adsr(.9, .1, .2, .8, .2) * .6
    b = explosao(0.9, (3800, 220), (80, 34), 0.45, 0.7, tam=1.3, seed=24)
    return limitador(reverb(mix((assobio, 0, 1), (vento, 0, 1), (b, .9, 1), (fogo(.5, 2000, 25), 1.0, .6)), .25, 1.4), -1)


def filhote():
    """Piado agudo + chama."""
    def pio(f0, f1, d):
        return osc(curva(f0, f1, d)) * adsr(d, .004, .02, .7, .03)
    return reverb(mix((pio(2400, 3400, .07), 0, .6), (pio(3200, 2600, .08), .08, .5), (fogo(.2, 2600, 26), .05, .7)), .1, .4)


def sol_nascente():
    """Acorde brilhante subindo + rugido de calor."""
    d = 1.8
    calor = filtro(ruido(d, 'rosa'), 'pb', curva(400, 5000, d), ordem=2) * adsr(d, .5, .3, .6, .7) * 1.3
    coro = [(gm(52, 60 + k, 100, 1.2, 1.0), k * .06, .3) for k in (0, 4, 7, 12, 16)]
    sinos = [(sino(f, 1.2, queda=3), .3 + i * .05, .2) for i, f in enumerate((1047, 1319, 1568, 2093))]
    return limitador(reverb(mix((calor, 0, 1), *coro, *sinos), .3, 2.0), -1)


def fenix_ovo():
    """Fogo se fechando + batida de coração."""
    d = 1.6
    fe = sopro(.6, 4000, 400, 1.5) * env(.6, .02, curva_=3) * .9
    cor = [(grave(70, 50, .18), t, 1) for t in (.55, .8, 1.15, 1.4)]
    return reverb(mix((fe, 0, 1), (fogo(.6, 1200, 27), 0, .5), *cor), .2, 1.0)


def fenix_renasce():
    """Ovo quebrando + explosão de fogo + grito da fênix + harpa subindo."""
    casca = mix(*[(estalo(.012, 2500 + i * 300, 1.0), i * .03, .8) for i in range(5)])
    b = explosao(1.0, (5000, 300), (90, 40), .4, .9, tam=1.1, seed=28)
    grito = sat(filtro(fm(curva(900, 1600, .5), 2.0, curva(4, 1, .5)), 'pf', 1800, .8) * adsr(.5, .02, .1, .7, .2) * 1.5, 2)
    harpa = [(gm(46, 64 + k, 100, .3, .6), .15 + i * .04, .35) for i, k in enumerate((0, 4, 7, 12, 16, 19, 24))]
    return limitador(reverb(mix((casca, 0, 1), (b, .05, .9), (grito, .15, .6), *harpa), .3, 1.8), -1)


TODOS = {
    'tiro_metralhadora': (tiro_metralhadora, False), 'tiro_leque': (tiro_leque, False), 'tiro_missil': (tiro_missil, False),
    'tiro_plasma': (tiro_plasma, True), 'tiro_drone': (tiro_drone, False), 'tiro_ricochete': (tiro_ricochete, False),
    'ricochete_quique': (ricochete_quique, False), 'tiro_raio': (tiro_raio, False), 'serra_corte': (serra_corte, False),
    'tiro_bumerangue': (tiro_bumerangue, False), 'bumerangue_pega': (bumerangue_pega, False), 'tiro_saraivada': (tiro_saraivada, True),
    'acerto': (acerto, False), 'acerto_chefao': (acerto_chefao, False), 'escudo_bloqueio': (escudo_bloqueio, False),
    'explosao_pequena': (explosao_pequena, True), 'explosao_area': (explosao_area, False), 'explosao_media': (explosao_media, True),
    'explosao_grande': (explosao_grande, True), 'explosao_chefao': (explosao_chefao, True),
    'inimigo_laser': (inimigo_laser, False), 'inimigo_metralhadora': (inimigo_metralhadora, False), 'inimigo_missil': (inimigo_missil, False),
    'inimigo_plasma': (inimigo_plasma, False), 'inimigo_granada': (inimigo_granada, False), 'chefao_tiro': (chefao_tiro, False),
    'dano_jogador': (dano_jogador, True), 'jogador_abatido': (jogador_abatido, True), 'xp': (xp, False), 'nivel': (nivel, True),
    'escolha': (escolha, True), 'conquista': (conquista, True), 'entrada': (entrada, True),
    'menu_mover': (menu_mover, False), 'menu_ok': (menu_ok, True), 'menu_voltar': (menu_voltar, False),
    'pausa': (pausa, True), 'despausa': (despausa, True),
    'chefao_alerta': (chefao_alerta, True), 'chefao_chegada': (chefao_chegada, True), 'chefao_furia': (chefao_furia, True),
    'raio_carga': (raio_carga, True), 'raio_disparo': (raio_disparo, True), 'trovao': (trovao, True), 'nova_fase': (nova_fase, True),
    'tiro_ancora': (tiro_ancora, False), 'ancora_pega': (ancora_pega, False), 'onda': (onda, True), 'dragao_vira': (dragao_vira, True),
    'jato_agua': (jato_agua, False), 'canhao_bordo': (canhao_bordo, True), 'barril_solta': (barril_solta, False),
    'papagaio': (papagaio, False), 'redemoinho': (redemoinho, True),
    'tiro_pena': (tiro_pena, False), 'asas_fogo': (asas_fogo, False), 'meteoro': (meteoro, True), 'filhote': (filhote, False),
    'sol_nascente': (sol_nascente, True), 'fenix_ovo': (fenix_ovo, True), 'fenix_renasce': (fenix_renasce, True),
}

if __name__ == '__main__':
    raiz = pathlib.Path(__file__).resolve().parents[2] / (sys.argv[1] if len(sys.argv) > 1 else 'teste')
    so = sys.argv[2:]
    for nome, (fn, est) in TODOS.items():
        if so and nome not in so:
            continue
        x = corta_silencio(fn(), 10 ** (-66 / 20))
        x = fade(x, 0, min(0.03, len(x) / SR / 4))
        p = salvar(x, raiz / 'som' / 'efeitos' / (nome + '.ogg'), estereo=est, qualidade=4)
        print(f'{nome:20s} {len(x) / SR:5.2f}s {p.stat().st_size // 1024:4d} KB')
