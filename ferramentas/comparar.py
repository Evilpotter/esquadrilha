"""Compara duas pastas de fotos (ex.: antes/ e depois/) e mostra o que mudou.
Uso: python3 ferramentas/comparar.py PASTA_A PASTA_B"""
import sys, glob, os
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]
dif = 0
for f in sorted(glob.glob(os.path.join(a, '*.png'))):
    g = os.path.join(b, os.path.basename(f))
    if not os.path.exists(g): print('falta  ', os.path.basename(f)); dif += 1; continue
    A, B = Image.open(f).convert('RGB'), Image.open(g).convert('RGB')
    d = ImageChops.difference(A, B)
    caixa = d.getbbox()
    if not caixa: print('igual  ', os.path.basename(f)); continue
    px = sum(1 for v in d.convert('L').getdata() if v > 8)
    print('MUDOU  ', os.path.basename(f), caixa, f'{px} px')
    dif += 1
print('diferenças:', dif)
