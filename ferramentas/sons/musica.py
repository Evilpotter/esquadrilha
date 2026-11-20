"""Compõe e renderiza as músicas da Esquadrilha (orquestra de fantasia) em <raiz>/som/musica/*.ogg.
Uso: python3 ferramentas/sons/musica.py [pasta_do_jogo] [nomes...]   (padrão: teste, todas)
As músicas em laço (menu, fase, chefao) são renderizadas duas vezes seguidas e cortadas na
segunda de três voltas: as caudas das notas e do reverb da volta anterior entram no começo, e o laço fica sem emenda."""
import sys, pathlib, tempfile, subprocess, os
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from dsp import *

NOMES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def nota(s):
    """'D4' → 62 · 'Bb3' → 58 · 'F#5' → 78"""
    m = NOMES[s[0]] + s[1:].count('#') - s[1:].count('b')
    return m + 12 * (int(s.lstrip('ABCDEFG#b')) + 1)


TIPOS = {'': (0, 4, 7), 'm': (0, 3, 7), 'sus4': (0, 5, 7), 'sus2': (0, 2, 7), '5': (0, 7), 'dim': (0, 3, 6),
         'm7': (0, 3, 7, 10), '7': (0, 4, 7, 10), 'add9': (0, 4, 7, 14), 'madd9': (0, 3, 7, 14), 'maj7': (0, 4, 7, 11)}


def acorde(sim):
    """'Dm' → (raiz 2, intervalos)"""
    r = sim[0] + (sim[1] if len(sim) > 1 and sim[1] in '#b' else '')
    return NOMES[r[0]] + r[1:].count('#') - r[1:].count('b'), TIPOS[sim[len(r):]]


def voz(sim, lo, hi):
    raiz, iv = acorde(sim)
    classes = {(raiz + i) % 12 for i in iv}
    return [p for p in range(nota(lo), nota(hi) + 1) if p % 12 in classes]


def baixo(sim, oit=2):
    raiz, _ = acorde(sim)
    return raiz + 12 * (oit + 1)


class Peca:
    def __init__(self, bpm, compassos, laco=True):
        self.bpm, self.comp, self.laco = bpm, compassos, laco
        self.partes = {}

    @property
    def batidas(self):
        return self.comp * 4

    def parte(self, nome, prog, pan=64, vol=100, canal=None, rev=0):
        if nome not in self.partes:
            ch = canal if canal is not None else len([p for p in self.partes.values() if p['ch'] != 9])
            if ch >= 9 and canal is None:
                ch += 1
            self.partes[nome] = {'prog': prog, 'ch': ch, 'pan': pan, 'vol': vol, 'ev': [], 'cc': []}
        return self.partes[nome]

    def n(self, nome, ini, dur, notas, vel=90):
        p = self.partes[nome]
        notas = notas if isinstance(notas, (list, tuple)) else [notas]
        for nt in notas:
            nt = nota(nt) if isinstance(nt, str) else nt
            p['ev'].append((ini, dur, nt, int(np.clip(vel, 1, 127))))

    def cc(self, nome, ini, ctrl, val):
        self.partes[nome]['cc'].append((ini, ctrl, int(np.clip(val, 0, 127))))

    def rampa(self, nome, ini, fim, v0, v1, ctrl=11, passos=16):
        for k in range(passos + 1):
            self.cc(nome, ini + (fim - ini) * k / passos, ctrl, v0 + (v1 - v0) * k / passos)

    def melodia(self, nome, ini, texto, vel=100, leg=0.95, transp=0):
        """'F4:1 A4:1 C5:2 | r:1 ...'  (duração em batidas; r = pausa; vel opcional: C5:2:110)"""
        b = ini
        for tok in texto.replace('|', ' ').split():
            partes = tok.split(':')
            d = float(partes[1])
            v = int(partes[2]) if len(partes) > 2 else vel
            if partes[0] != 'r':
                self.n(nome, b, d * leg, nota(partes[0]) + transp, v)
            b += d
        return b

    def midi(self, voltas=1):
        mid = mido.MidiFile(ticks_per_beat=480)
        TPB = 480
        meta = mido.MidiTrack(); mid.tracks.append(meta)
        meta.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(self.bpm)))
        for nome, p in self.partes.items():
            tr = mido.MidiTrack(); mid.tracks.append(tr)
            msgs = []
            ch = p['ch']
            if ch != 9:
                msgs.append((0, 0, mido.Message('program_change', channel=ch, program=p['prog'])))
            msgs += [(0, 0, mido.Message('control_change', channel=ch, control=7, value=p['vol'])),
                     (0, 0, mido.Message('control_change', channel=ch, control=10, value=p['pan'])),
                     (0, 0, mido.Message('control_change', channel=ch, control=91, value=0)),
                     (0, 0, mido.Message('control_change', channel=ch, control=93, value=0))]
            if not any(c[1] == 11 and c[0] == 0 for c in p['cc']):
                msgs.append((0, 0, mido.Message('control_change', channel=ch, control=11, value=127)))
            for v in range(voltas):
                off = v * self.batidas
                for ini, dur, nt, vel in p['ev']:
                    t0 = int(round((ini + off) * TPB)); t1 = int(round((ini + off + dur) * TPB))
                    msgs.append((t0, 2, mido.Message('note_on', channel=ch, note=nt, velocity=vel)))
                    msgs.append((max(t0 + 1, t1), 1, mido.Message('note_off', channel=ch, note=nt, velocity=0)))
                for ini, ctrl, val in p['cc']:
                    msgs.append((int(round((ini + off) * TPB)), 0, mido.Message('control_change', channel=ch, control=ctrl, value=val)))
            msgs.sort(key=lambda m: (m[0], m[1]))
            last = 0
            for t, _, m in msgs:
                tr.append(m.copy(time=t - last)); last = t
        return mid

    def render(self, rev=0.24, rev_s=2.8, cauda=6.0):
        voltas = 3 if self.laco else 1
        mid = self.midi(voltas)
        # silêncio no fim para a cauda
        mid.tracks[0].append(mido.MetaMessage('end_of_track', time=int(cauda * 480 * self.bpm / 60)))
        with tempfile.TemporaryDirectory() as td:
            mf, wf = os.path.join(td, 'm.mid'), os.path.join(td, 'm.wav')
            mid.save(mf)
            subprocess.run(['fluidsynth', '-ni', '-R', '0', '-C', '0', '-g', '0.55', '-r', str(SR), '-F', wf, SF2, mf], check=True, capture_output=True)
            x, _ = sf.read(wf)
        x = reverb(x, rev, rev_s, 5500, 0.03, 1.2)
        L = n(self.batidas * 60 / self.bpm)
        if self.laco:
            # o FluidSynth não repete exatamente igual (vibratos soltos): emenda com cruzamento curto.
            # O começo do laço mistura a 3ª volta (continuação natural do fim) com a 2ª.
            X = n(0.08)
            lp = x[L:2 * L].copy()
            k = np.linspace(0, 1, X)[:, None]
            lp[:X] = x[L:L + X] * np.sin(k * np.pi / 2) + x[2 * L:2 * L + X] * np.cos(k * np.pi / 2)
            x = lp
        else:
            x = corta_silencio(x, 10 ** (-70 / 20))
            x = fade(x, 0, 0.3)
        return x


# ---------- percussão (canal 10) ----------
BUMBO, CAIXA, CAIXA2, PRATO, PRATO2, CHINES, CONDUCAO, TOM_G, TOM_M = 35, 38, 40, 49, 57, 52, 51, 41, 45


def rufo_timpano(m, nome, ini, dur, nt, v0=50, v1=115, passo=1 / 6):
    k = 0
    while k * passo < dur:
        m.n(nome, ini + k * passo, passo * .9, nt, v0 + (v1 - v0) * (k * passo / dur))
        k += 1


# =============================================================
# MENU – "Tema da Esquadrilha": herói, cordas e trompas, harpa
# =============================================================
def menu():
    m = Peca(84, 16)
    m.parte('harpa', 46, pan=40, vol=96)
    m.parte('cordas', 48, pan=58, vol=92)
    m.parte('graves', 48, pan=80, vol=100)
    m.parte('contrab', 43, pan=84, vol=88)
    m.parte('trompas', 60, pan=52, vol=110)
    m.parte('metais', 61, pan=74, vol=88)
    m.parte('flauta', 73, pan=64, vol=92)
    m.parte('coro', 52, pan=64, vol=78)
    m.parte('timpano', 47, pan=70, vol=110)
    m.parte('glock', 9, pan=36, vol=70)
    m.parte('perc', 0, pan=64, vol=90, canal=9)
    prog = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Bb', 'F', 'Gm', 'Dm', 'Bb', 'C', 'Dm', 'A']
    for c, ac in enumerate(prog):
        b = c * 4
        forte = c >= 8
        # graves e contrabaixo
        m.n('graves', b, 3.9, [baixo(ac, 2), baixo(ac, 3)], 78 if forte else 64)
        m.n('contrab', b, 3.9, baixo(ac, 2), 80 if forte else 62)
        # cordas em blocos de 2 batidas (voz fechada em volta do Sol 4)
        vz = voz(ac, 'A3', 'A4')
        m.n('cordas', b, 3.95, vz, 72 if forte else 60)
        # harpa: arpejo em colcheias subindo e descendo
        arp = voz(ac, 'D3', 'D5')
        seq = arp[:5] + arp[5:7][::-1] if len(arp) >= 7 else (arp + arp[::-1])[:8]
        seq = (seq + seq)[:8]
        for k in range(8):
            m.n('harpa', b + k * .5, 1.2, seq[k], (72 if k % 2 == 0 else 60) - (6 if forte else 0))
        if forte:
            m.n('coro', b, 3.9, voz(ac, 'D4', 'D5'), 62)
            m.n('timpano', b, .9, baixo(ac, 2) + (12 if acorde(ac)[0] < 5 else 0), 92)
            m.n('timpano', b + 2.5, .4, baixo(ac, 2) + (12 if acorde(ac)[0] < 5 else 0), 66)
    m.rampa('cordas', 0, 4, 70, 118)
    m.rampa('coro', 32, 36, 60, 118)
    # trompas: tema A
    m.melodia('trompas', 8, 'F4:1 A4:1 C5:2 | Bb4:1.5 A4:.5 G4:2 | A4:2 D5:1 E5:1 | F5:3 E5:1 | D5:1 Bb4:1 C5:1 D5:1 | E5:3 r:1', 92)
    # tema B: metais e trompas juntos, flauta dobrando 1 oitava acima
    tb = 'F5:2 D5:1 F5:1 | C5:2 A4:1 C5:1 | D5:2 Bb4:1 D5:1 | F5:2 E5:1 D5:1 | D5:2 F5:1 G5:1 | G5:2 E5:1 C5:1 | F5:1 E5:1 D5:2 | E5:2 C#5:2'
    m.melodia('trompas', 32, tb, 104)
    m.melodia('metais', 32, tb, 84, transp=-12)
    m.melodia('flauta', 32, tb, 80, transp=12)
    m.rampa('flauta', 32, 34, 70, 110)
    # rufo de tímpano na virada para o tema B e na volta do laço
    rufo_timpano(m, 'timpano', 28, 4, nota('A2'), 40, 100)
    rufo_timpano(m, 'timpano', 60, 4, nota('A2'), 40, 96)
    m.n('perc', 32, 4, PRATO, 88)
    m.n('perc', 32, .5, BUMBO, 100)
    # brilho do glockenspiel nos começos de frase
    for b, nt in ((0, 'A5'), (16, 'D6'), (48, 'F6')):
        m.n('glock', b, 1, nt, 66)
    return m


# =============================================================
# FASE – "Céu de Batalha": cavalgada de cordas, taikos, metais
# =============================================================
def fase():
    m = Peca(128, 24)
    m.parte('ostinato', 48, pan=46, vol=104)
    m.parte('pizz', 45, pan=36, vol=96)
    m.parte('graves', 48, pan=82, vol=106)
    m.parte('contrab', 43, pan=86, vol=96)
    m.parte('trompas', 60, pan=56, vol=112)
    m.parte('trompetes', 56, pan=72, vol=96)
    m.parte('metais', 61, pan=70, vol=94)
    m.parte('flauta', 73, pan=60, vol=94)
    m.parte('coro', 52, pan=64, vol=82)
    m.parte('timpano', 47, pan=70, vol=110)
    m.parte('taiko', 116, pan=60, vol=104)
    m.parte('perc', 0, pan=64, vol=96, canal=9)
    prog = (['Dm', 'Dm', 'Dm', 'Dm'] + ['Dm', 'C', 'Bb', 'C', 'Dm', 'C', 'Bb', 'A'] + ['F', 'C', 'Gm', 'Dm', 'Bb', 'F', 'Gm', 'A']
            + ['Dm', 'Bb', 'C', 'A'])
    for c, ac in enumerate(prog):
        b = c * 4
        r2, r3 = baixo(ac, 2), baixo(ac, 3)
        intro = c < 4
        # galope: colcheia + 2 semicolcheias
        for k in range(4):
            for off, dur, v in ((0, .45, 96), (.5, .22, 74), (.75, .22, 80)):
                m.n('graves', b + k + off, dur, [r2, r3], v - (10 if intro else 0))
        m.n('contrab', b, 3.8, r2, 84)
        # ostinato agudo (cordas curtas) com 5ª e oitava
        raiz, iv = acorde(ac)
        cel = [r3 + 12, r3 + 12 + iv[1], r3 + 12 + 7, r3 + 24]
        pad_ = [0, 2, 1, 2, 0, 3, 1, 2]
        if c >= 2:
            for k in range(8):
                m.n('ostinato', b + k * .5, .3, cel[pad_[k]], 84 if k % 2 == 0 else 66)
        if 12 <= c < 20:
            for k in range(4):
                m.n('pizz', b + k + .5, .3, voz(ac, 'D4', 'D5')[k % 3], 70)
        # tambores: taiko em todas, ganha força depois da introdução
        for k, v in ((0, 118), (1.5, 84), (2, 100), (3, 90), (3.5, 76)):
            m.n('taiko', b + k, .3, nota('C2'), v - (20 if intro else 0))
        if not intro:
            m.n('perc', b, .3, BUMBO, 104)
            m.n('perc', b + 2, .3, BUMBO, 92)
            m.n('perc', b + 1, .2, CAIXA, 70); m.n('perc', b + 3, .2, CAIXA, 76)
            if c in (4, 12, 20):
                m.n('perc', b, 3, PRATO, 96)
            m.n('timpano', b, .5, r2 + (12 if raiz < 5 else 0), 96)
        # metais: acordes de impacto no começo de cada compasso da parte B
        if 12 <= c < 20:
            m.n('metais', b, 1.2, voz(ac, 'F3', 'F4'), 92)
            m.n('metais', b + 2.5, .4, voz(ac, 'F3', 'F4'), 80)
            m.n('coro', b, 3.9, voz(ac, 'C4', 'D5'), 66)
        if c >= 20:
            m.n('coro', b, 3.9, voz(ac, 'C4', 'D5'), 80)
            m.n('metais', b, 3.6, voz(ac, 'D3', 'D4'), 86)
    # tema A (trompas), resposta da flauta
    ta = ('D5:1.5 A4:.5 D5:1 E5:1 | F5:2 E5:1 C5:1 | D5:1.5 Bb4:.5 F4:2 | G4:1 A4:1 C5:2 | '
          'D5:1.5 A4:.5 D5:1 E5:1 | F5:1 G5:1 A5:2 | G5:1.5 F5:.5 D5:1 Bb4:1 | C#5:3 r:1')
    m.melodia('trompas', 16, ta, 102, transp=-12)
    m.melodia('trompas', 16, ta, 90)
    m.rampa('trompas', 16, 18, 80, 120)
    # tema B: trompetes e trompas em uníssono, flauta em escala
    tb = ('A4:2 C5:1 F5:1 | E5:2 G5:2 | F5:1 D5:1 Bb4:1 G4:1 | A4:3 F4:1 | '
          'Bb4:1.5 C5:.5 D5:1 F5:1 | A5:3 F5:1 | G5:1 F5:1 E5:1 D5:1 | E5:3 r:1')
    m.melodia('trompetes', 48, tb, 96, leg=.9)
    m.melodia('trompas', 48, tb, 96, transp=-12)
    # escalas da flauta respondendo no fim das frases
    for b0, esc in ((30, 'D5 E5 F5 G5 A5 Bb5 C#6 D6'), (46, 'A5 G5 F5 E5 D5 C#5 D5 E5'), (62, 'D5 F5 A5 D6 C6 Bb5 A5 G5'), (78, 'E5 F5 G5 A5 Bb5 C6 C#6 D6')):
        for k, nt in enumerate(esc.split()):
            m.n('flauta', b0 + k * .25, .24, nt, 78 + k * 3)
    # ponte: coro e trompas, rufo para voltar ao começo
    m.melodia('trompas', 80, 'D5:4 | Bb4:2 D5:2 | E5:4 | C#5:4', 98)
    rufo_timpano(m, 'timpano', 92, 4, nota('A2'), 50, 118, 1 / 8)
    m.n('perc', 95.5, .5, PRATO2, 90)
    return m


# =============================================================
# CHEFÃO – "Fúria do Chefão": riffs graves, coro, tambores de guerra
# =============================================================
def chefao():
    m = Peca(150, 24)
    m.parte('riff', 48, pan=80, vol=110)
    m.parte('tuba', 58, pan=76, vol=104)
    m.parte('contrab', 43, pan=86, vol=100)
    m.parte('trem', 44, pan=44, vol=96)
    m.parte('trompas', 60, pan=54, vol=114)
    m.parte('metais', 61, pan=70, vol=100)
    m.parte('trombones', 57, pan=74, vol=100)
    m.parte('coro', 52, pan=64, vol=94)
    m.parte('timpano', 47, pan=70, vol=116)
    m.parte('taiko', 116, pan=58, vol=110)
    m.parte('perc', 0, pan=64, vol=100, canal=9)
    prog = (['Em', 'Em', 'F', 'Em', 'Em', 'Em', 'F', 'B'] + ['Em', 'C', 'Am', 'B', 'Em', 'C', 'F', 'B']
            + ['C', 'D', 'Em', 'Em', 'C', 'D', 'F', 'B'])
    riff = [(0, 'E'), (.5, 'E'), (1, 'E'), (1.5, 'F'), (2, 'E'), (2.5, 'E'), (3, 'G'), (3.5, 'F')]
    for c, ac in enumerate(prog):
        b = c * 4
        raiz, iv = acorde(ac)
        r1 = baixo(ac, 1); r2 = baixo(ac, 2)
        # riff grave em colcheias (transposto para a raiz do acorde)
        for off, nm in riff:
            d = (NOMES[nm] - 4) % 12
            d = d - 12 if d > 6 else d
            m.n('riff', b + off, .38, [r2 + d, r2 + d + 12], 104 if off % 1 == 0 else 86)
            if off in (0, 1.5, 3):
                m.n('tuba', b + off, .4, r1 + d + 12, 96)
        m.n('contrab', b, 3.9, r1 + 12, 90)
        # cordas em trêmulo nos agudos
        m.n('trem', b, 3.95, voz(ac, 'E4', 'E5'), 72 if c < 8 else 84)
        # coro e metais
        if c >= 8:
            m.n('coro', b, 3.9, voz(ac, 'B3', 'B4'), 80 if c < 16 else 96)
        m.n('metais', b, .5, voz(ac, 'E3', 'E4'), 110)
        m.n('metais', b + 1.5, .5, voz(ac, 'E3', 'E4'), 94)
        if c >= 16:
            m.n('trombones', b, 3.8, [r2, r2 + 7], 92)
        # tambores de guerra
        for k in range(8):
            m.n('taiko', b + k * .5, .3, nota('C2'), (120 if k % 4 == 0 else 96 if k % 2 == 0 else 78))
        if c >= 8:
            for k in range(16):
                if k % 4 == 2:
                    m.n('perc', b + k * .25, .2, CAIXA, 86)
                elif k % 2 == 1 and c >= 16:
                    m.n('perc', b + k * .25, .1, CAIXA2, 50)
            m.n('perc', b, .3, BUMBO, 112); m.n('perc', b + 2, .3, BUMBO, 104)
        m.n('timpano', b, .4, r2 + (12 if raiz < 5 else 0), 104)
        m.n('timpano', b + 1.5, .3, r2 + (12 if raiz < 5 else 0), 84)
        if c in (0, 8, 16):
            m.n('perc', b, 3, CHINES, 100)
    # tema do chefão (trompas): ameaçador, frígio
    t = ('B4:2 C5:1 B4:1 | A4:1 G4:1 F#4:2 | E4:1.5 F#4:.5 G4:1 A4:1 | B4:3 r:1 | '
         'E5:2 D5:1 C5:1 | B4:2 A4:1 G4:1 | A4:1 C5:1 F5:2 | D#5:3 r:1')
    m.melodia('trompas', 32, t, 112)
    m.melodia('trompas', 32, t, 100, transp=-12)
    # clímax: metais todos juntos 1 oitava acima
    t2 = 'G5:2 F#5:1 E5:1 | F#5:2 A5:2 | B5:2 A5:1 G5:1 | B4:1 E5:1 G5:2 | G5:2 F#5:1 E5:1 | F#5:2 A5:2 | F5:2 E5:1 C5:1 | D#5:3 F#5:1'
    m.melodia('trompas', 64, t2, 118, transp=-12)
    m.melodia('metais', 64, t2, 100, transp=-12)
    rufo_timpano(m, 'timpano', 92, 4, nota('B2'), 60, 124, 1 / 8)
    return m


# =============================================================
# Vitória (chefão derrotado) e Fim de jogo – não repetem
# =============================================================
def vitoria():
    m = Peca(112, 3, laco=False)
    m.parte('trompetes', 56, pan=70, vol=104)
    m.parte('trompas', 60, pan=54, vol=112)
    m.parte('metais', 61, pan=74, vol=100)
    m.parte('cordas', 48, pan=46, vol=104)
    m.parte('graves', 48, pan=82, vol=104)
    m.parte('coro', 52, pan=64, vol=94)
    m.parte('timpano', 47, pan=70, vol=116)
    m.parte('glock', 9, pan=36, vol=84)
    m.parte('perc', 0, pan=64, vol=100, canal=9)
    m.melodia('trompetes', 0, 'D5:.33 D5:.33 D5:.34 A5:1.5 F#5:.5 | A5:1 D6:4', 110, leg=.9)
    m.melodia('trompas', 0, 'A4:.33 A4:.33 A4:.34 D5:1.5 C#5:.5 | D5:1 F#5:4', 104)
    m.n('metais', 0, .9, ['D4', 'F#4', 'A4'], 96)
    m.n('metais', 2, .9, ['G3', 'B3', 'D4'], 100)
    m.n('metais', 3, 4, ['D3', 'A3', 'D4', 'F#4'], 112)
    m.n('cordas', 0, 2, ['D4', 'F#4', 'A4'], 80)
    m.n('cordas', 2, 1, ['D4', 'G4', 'B4'], 90)
    m.n('cordas', 3, 4.5, ['D4', 'F#4', 'A4', 'D5'], 104)
    m.n('graves', 0, 2, ['D2', 'D3'], 92); m.n('graves', 2, 1, ['G2', 'G3'], 96); m.n('graves', 3, 4.5, ['D2', 'D3'], 110)
    m.n('coro', 3, 4.5, ['D4', 'F#4', 'A4', 'D5'], 92)
    m.rampa('coro', 3, 5, 70, 127)
    rufo_timpano(m, 'timpano', 0, 3, nota('D2'), 50, 110, 1 / 8)
    m.n('timpano', 3, 1, 'D2', 127)
    m.n('perc', 3, 3, PRATO, 110); m.n('perc', 3, .5, BUMBO, 120)
    for k, nt in enumerate(['D6', 'F#6', 'A6', 'D7']):
        m.n('glock', 3 + k * .25, 1.5, nt, 80)
    return m


def derrota():
    m = Peca(66, 3, laco=False)
    m.parte('trompa', 60, pan=54, vol=104)
    m.parte('cordas', 49, pan=46, vol=100)
    m.parte('graves', 48, pan=82, vol=100)
    m.parte('coro', 52, pan=64, vol=90)
    m.parte('harpa', 46, pan=36, vol=90)
    m.parte('timpano', 47, pan=70, vol=104)
    m.melodia('trompa', 0, 'D5:1 C5:.5 A4:.5 | Bb4:1 A4:.5 F4:.5 | E4:1 D4:3', 92)
    m.n('cordas', 0, 1, ['F4', 'A4', 'D5'], 76)
    m.n('cordas', 1, 1, ['D4', 'G4', 'Bb4'], 72)
    m.n('cordas', 2, 1, ['C#4', 'E4', 'A4'], 70)
    m.n('cordas', 3, 3.5, ['D4', 'F4', 'A4'], 66)
    m.rampa('cordas', 3, 6.5, 110, 30)
    m.n('graves', 0, 1, ['D2', 'D3'], 74); m.n('graves', 1, 1, ['G2', 'G3'], 70); m.n('graves', 2, 1, ['A1', 'A2'], 72); m.n('graves', 3, 3.5, ['D2', 'D3'], 70)
    m.n('coro', 3, 3.5, ['D4', 'F4', 'A4'], 70)
    m.rampa('coro', 3, 6.5, 110, 20)
    m.n('timpano', 3, 1, 'D2', 90)
    for k, nt in enumerate(['A5', 'F5', 'D5', 'A4', 'F4', 'D4']):
        m.n('harpa', 3 + k * .2, 2, nt, 60 - k * 4)
    return m


PECAS = {'menu': menu, 'fase': fase, 'chefao': chefao, 'vitoria': vitoria, 'derrota': derrota}

if __name__ == '__main__':
    raiz = pathlib.Path(__file__).resolve().parents[2] / (sys.argv[1] if len(sys.argv) > 1 else 'teste')
    so = sys.argv[2:]
    for nome, fn in PECAS.items():
        if so and nome not in so:
            continue
        m = fn()
        x = m.render()
        x = limitador(normaliza(x, -0.5) * 10 ** (2 / 20), -1.0, 0.003, 0.25)
        p = salvar(x, raiz / 'som' / 'musica' / (nome + '.ogg'), estereo=True, qualidade=3, pico_db=-1.0)
        print(f'{nome:8s} {len(x) / SR:6.2f}s  {p.stat().st_size // 1024:5d} KB  laço={m.laco}')
