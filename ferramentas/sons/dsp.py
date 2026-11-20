"""Caixa de ferramentas de áudio para gerar os sons da Esquadrilha.
Síntese em camadas (osciladores, ruídos, filtros, saturação, reverb) + notas de
instrumentos reais do banco de sons FluidR3_GM (renderizadas com o FluidSynth).
Requer: numpy, scipy, soundfile, mido, fluidsynth, ffmpeg, /usr/share/sounds/sf2/FluidR3_GM.sf2"""
import numpy as np, scipy.signal as sg, soundfile as sf, mido, subprocess, tempfile, pathlib, hashlib, os

SR = 44100
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
CACHE = pathlib.Path(tempfile.gettempdir()) / 'esq_gm_cache'
CACHE.mkdir(exist_ok=True)
rng = np.random.default_rng(7)  # sorteio fixo: o mesmo som sai igual a cada execução


def n(d):
    return int(round(d * SR))


def tt(d):
    return np.arange(n(d)) / SR


def curva(a, b, d, forma='exp'):
    """Rampa de a até b em d segundos (exp para frequências)."""
    x = np.linspace(0, 1, max(1, n(d)))
    if forma == 'exp' and a > 0 and b > 0:
        return a * (b / a) ** x
    return a + (b - a) * x


def osc(freq, d=None, forma='sen', fase=0.0):
    """Oscilador com frequência fixa ou variando (array)."""
    if np.isscalar(freq):
        freq = np.full(n(d), float(freq))
    ph = 2 * np.pi * np.cumsum(freq) / SR + fase
    if forma == 'sen':
        return np.sin(ph)
    if forma == 'tri':
        return 2 / np.pi * np.arcsin(np.sin(ph))
    if forma == 'serra':
        # serra suavizada (soma de harmônicos até 9 kHz para não chiar)
        out = np.zeros_like(ph)
        f0 = max(1.0, float(np.max(freq)))
        for k in range(1, int(9000 / f0) + 1):
            out += np.sin(k * ph) / k
        return out * 0.6
    if forma == 'quad':
        out = np.zeros_like(ph)
        f0 = max(1.0, float(np.max(freq)))
        for k in range(1, int(9000 / f0) + 1, 2):
            out += np.sin(k * ph) / k
        return out * 0.8
    raise ValueError(forma)


def fm(fc, razao, indice, d=None):
    """Síntese FM: portadora fc, modulador fc*razao, índice (escalar ou array)."""
    if np.isscalar(fc):
        fc = np.full(n(d), float(fc))
    mod = np.sin(2 * np.pi * np.cumsum(fc * razao) / SR)
    return np.sin(2 * np.pi * np.cumsum(fc) / SR + indice * mod)


def ruido(d, cor='branco'):
    x = rng.standard_normal(n(d))
    if cor == 'rosa':
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        x = sg.lfilter(b, a, x) * 4
    elif cor == 'marrom':
        x = np.cumsum(x)
        x = sg.lfilter([1, -1], [1, -0.995], x) * 0.05
    return x / (np.max(np.abs(x)) + 1e-9)


def env(d, ataque=0.002, decai=None, segura=0.0, curva_=4.0):
    """Envelope: ataque linear, segura, depois queda exponencial até o fim."""
    N = n(d)
    e = np.ones(N)
    a = min(N, n(ataque))
    if a > 0:
        e[:a] = np.linspace(0, 1, a)
    s = min(N, a + n(segura))
    rest = N - s
    if rest > 0:
        x = np.linspace(0, 1, rest)
        e[s:] = np.exp(-curva_ * x) * (1 - x) ** 0.5 if decai is None else np.exp(-x * (rest / SR) / decai) * (1 - x) ** 0.3
    return e


def adsr(d, a, dd, s, r):
    N = n(d)
    pts = [0, n(a), n(a) + n(dd), max(n(a) + n(dd), N - n(r)), N]
    e = np.zeros(N)
    vals = [0, 1, s, s, 0]
    for i in range(4):
        i0, i1 = pts[i], min(N, pts[i + 1])
        if i1 > i0:
            e[i0:i1] = np.linspace(vals[i], vals[i + 1], i1 - i0)
    return e


def _sos(tipo, fc, q=0.707):
    fc = float(np.clip(fc, 20, SR / 2 - 200))
    if tipo == 'pb':
        return sg.butter(2, fc, 'low', fs=SR, output='sos')
    if tipo == 'pa':
        return sg.butter(2, fc, 'high', fs=SR, output='sos')
    if tipo == 'pf':  # passa-faixa com Q
        bw = fc / q
        lo, hi = max(20, fc - bw / 2), min(SR / 2 - 300, fc + bw / 2)
        return sg.butter(1, [lo, hi], 'band', fs=SR, output='sos')
    raise ValueError(tipo)


def filtro(x, tipo, fc, q=0.707, ordem=1):
    """Filtro fixo (fc escalar) ou variando no tempo (fc array, em blocos de 64 amostras)."""
    if np.isscalar(fc):
        for _ in range(ordem):
            x = sg.sosfilt(_sos(tipo, fc, q), x)
        return x
    out = np.zeros_like(x)
    B = 64
    zis = None
    for i in range(0, len(x), B):
        sos = _sos(tipo, fc[min(i, len(fc) - 1)], q)
        sos_all = np.vstack([sos] * ordem)
        if zis is None or zis.shape[0] != sos_all.shape[0]:
            zis = np.zeros((sos_all.shape[0], 2))
        out[i:i + B], zis = sg.sosfilt(sos_all, x[i:i + B], zi=zis)
    return out


def ressonante(x, fc, q=8.0):
    """Filtro passa-baixa ressonante (peak) via iirpeak somado ao passa-baixa – dá o 'zum' de sintetizador."""
    b, a = sg.iirpeak(float(np.clip(fc, 30, SR / 2 - 500)), q, fs=SR)
    return filtro(x, 'pb', fc * 1.4) + sg.lfilter(b, a, x) * 0.8


def sat(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def mix(*partes):
    """Soma sinais de comprimentos diferentes (cada parte: sinal ou (sinal, atraso_s, ganho))."""
    itens = []
    for p in partes:
        if isinstance(p, tuple):
            s, at, g = (p + (1.0,))[:3] if len(p) == 2 else p
        else:
            s, at, g = p, 0.0, 1.0
        itens.append((np.asarray(s, dtype=float), n(at), g))
    N = max(i[1] + (i[0].shape[0]) for i in itens)
    est = any(i[0].ndim == 2 for i in itens)
    out = np.zeros((N, 2)) if est else np.zeros(N)
    for s, a, g in itens:
        if est and s.ndim == 1:
            s = np.stack([s, s], 1)
        out[a:a + s.shape[0]] += s * g
    return out


def pad(x, d):
    N = n(d)
    if len(x) >= N:
        return x[:N]
    z = np.zeros((N - len(x),) + x.shape[1:])
    return np.concatenate([x, z])


def fade(x, ent=0.0, sai=0.01):
    x = x.copy()
    a, b = n(ent), n(sai)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None] if x.ndim == 2 else np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None] if x.ndim == 2 else np.linspace(1, 0, b)
    return x


def tom(x, semitons):
    """Muda a altura reamostrando (também muda a duração, como fita)."""
    r = 2 ** (semitons / 12)
    if abs(r - 1) < 1e-4:
        return x
    from fractions import Fraction
    f = Fraction(r).limit_denominator(200)
    return sg.resample_poly(x, f.denominator, f.numerator, axis=0)


# ---------- reverb (sala / salão / céu aberto) ----------
_ir_cache = {}


def ir(segundos=1.6, brilho=6000, pre=0.012, seed=3):
    k = (segundos, brilho, pre, seed)
    if k in _ir_cache:
        return _ir_cache[k]
    r = np.random.default_rng(seed)
    N = n(segundos)
    t = np.arange(N) / SR
    canais = []
    for c in range(2):
        x = r.standard_normal(N) * np.exp(-6.9 * t / segundos)
        # agudos somem mais rápido que os graves (ar e paredes)
        lo = filtro(x, 'pb', brilho * 0.35)
        hi = x - lo
        x = lo + hi * np.exp(-6.9 * t / (segundos * 0.35))
        # primeiras reflexões
        er = np.zeros(N)
        for j in range(10):
            pos = n(pre + r.uniform(0.004, 0.06))
            if pos < N:
                er[pos] += r.uniform(0.2, 0.6) * (1 if r.random() > .5 else -1)
        x = x * 0.25 + er
        x[:n(pre)] = 0
        canais.append(x)
    h = np.stack(canais, 1)
    h /= np.sqrt(np.sum(h ** 2) / 2)
    _ir_cache[k] = h
    return h


def reverb(x, mistura=0.2, segundos=1.6, brilho=6000, pre=0.012, largura=1.0):
    """Devolve estéreo: seco + cauda. Cauda acrescentada ao final."""
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    h = ir(segundos, brilho, pre)
    cauda = np.stack([sg.fftconvolve(x[:, c], h[:, c]) for c in range(2)], 1)
    m = cauda.mean(1, keepdims=True)
    cauda = m + (cauda - m) * largura
    seco = np.vstack([x, np.zeros((len(cauda) - len(x), 2))])
    return seco * (1 - mistura * 0.5) + cauda * mistura


def mono(x):
    return x.mean(1) if x.ndim == 2 else x


def corta_silencio(x, lim=10 ** (-60 / 20)):
    a = np.abs(mono(x))
    idx = np.where(a > lim)[0]
    if not len(idx):
        return x
    return x[:idx[-1] + 1]


# ---------- notas de instrumentos reais (FluidR3_GM) ----------
def gm(programa, nota, vel=110, dur=1.0, solta=1.5, banco=0, bateria=False, cauda_fluid=False):
    """Renderiza uma nota (ou várias: lista) de um instrumento General MIDI. Devolve estéreo."""
    notas = nota if isinstance(nota, (list, tuple)) else [nota]
    chave = hashlib.md5(repr((programa, notas, vel, dur, solta, banco, bateria, cauda_fluid)).encode()).hexdigest()
    arq = CACHE / (chave + '.wav')
    if not arq.exists():
        mid = mido.MidiFile(ticks_per_beat=480)
        tr = mido.MidiTrack(); mid.tracks.append(tr)
        ch = 9 if bateria else 0
        tr.append(mido.MetaMessage('set_tempo', tempo=500000))
        if not bateria:
            tr.append(mido.Message('control_change', channel=ch, control=0, value=banco))
            tr.append(mido.Message('program_change', channel=ch, program=programa))
        tr.append(mido.Message('control_change', channel=ch, control=91, value=0))
        tr.append(mido.Message('control_change', channel=ch, control=93, value=0))
        for nt in notas:
            tr.append(mido.Message('note_on', channel=ch, note=nt, velocity=vel, time=0))
        ticks = int(dur * 960)
        for i, nt in enumerate(notas):
            tr.append(mido.Message('note_off', channel=ch, note=nt, velocity=0, time=ticks if i == 0 else 0))
        tr.append(mido.MetaMessage('end_of_track', time=int(solta * 960)))
        with tempfile.NamedTemporaryFile(suffix='.mid', delete=False) as f:
            mid.save(f.name)
        rv = [] if cauda_fluid else ['-R', '0', '-C', '0']
        subprocess.run(['fluidsynth', '-ni', *rv, '-g', '0.8', '-r', str(SR), '-F', str(arq), SF2, f.name],
                       check=True, capture_output=True)
        os.unlink(f.name)
    x, sr = sf.read(arq)
    x = corta_silencio(x)
    # começa no ataque
    a = np.abs(mono(x))
    i0 = np.argmax(a > a.max() * 0.01) if a.max() > 0 else 0
    return x[max(0, i0 - 20):]


# ---------- finalização ----------
def normaliza(x, pico_db=-1.0):
    p = np.max(np.abs(x)) + 1e-12
    return x * (10 ** (pico_db / 20) / p)


def limitador(x, teto_db=-1.0, ataque=0.002, solta=0.06):
    """Limitador simples por envelope (para músicas e efeitos grandes)."""
    teto = 10 ** (teto_db / 20)
    a = np.abs(x) if x.ndim == 1 else np.abs(x).max(1)
    # envelope de pico com retenção
    w = max(1, n(ataque))
    pk = _maxf(a, w * 2 + 1)
    g = np.minimum(1.0, teto / (pk + 1e-12))
    # suaviza a volta do ganho
    coef = np.exp(-1 / (solta * SR))
    gs = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else coef * cur + (1 - coef) * g[i]
        gs[i] = cur
    return x * (gs[:, None] if x.ndim == 2 else gs)


def _maxf(a, w):
    from scipy.ndimage import maximum_filter1d
    return maximum_filter1d(a, w)


def salvar(x, caminho, estereo=None, qualidade=5, pico_db=-1.0, normalizar=True):
    caminho = pathlib.Path(caminho)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    x = np.asarray(x, dtype=float)
    if estereo is False:
        x = mono(x)
    if normalizar:
        x = normaliza(x, pico_db)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        sf.write(f.name, x.astype(np.float32), SR, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f.name, '-c:a', 'libvorbis', '-q:a', str(qualidade), str(caminho)], check=True)
        os.unlink(f.name)
    return caminho
