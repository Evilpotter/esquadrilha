"""Gera dist/esquadrilha.html: arquivo único que roda offline (backup ou jogar sem internet).
Junta index.html + js/**/*.js e embute os desenhos de arte/**/*.svg e os sons de som/**/*.ogg."""
import re, json, pathlib, base64
import sys
raiz = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent
html = (raiz / 'index.html').read_text(encoding='utf-8')
arte = {str(p.relative_to(raiz)).replace('\\', '/'): p.read_text(encoding='utf-8') for p in sorted((raiz / 'arte').rglob('*.svg'))}
sons = {str(p.relative_to(raiz)).replace('\\', '/'): base64.b64encode(p.read_bytes()).decode() for p in sorted((raiz / 'som').rglob('*.ogg'))} if (raiz / 'som').exists() else {}
embutida = '<script>\nwindow.ARTE_EMBUTIDA = ' + json.dumps(arte, ensure_ascii=False).replace('</', '<\\/') + ';\nwindow.SOM_EMBUTIDO = ' + json.dumps(sons) + ';\n</script>\n'
def inline(m):
    codigo = (raiz / m.group(1)).read_text(encoding='utf-8')
    return '<script>\n// ===== ' + m.group(1) + ' =====\n' + codigo + '</script>'
saida = re.sub(r'<script src="([^"]+)"></script>', inline, html)
saida = saida.replace('<script>\n// ===== ', embutida + '<script>\n// ===== ', 1)
(raiz / 'dist').mkdir(exist_ok=True)
(raiz / 'dist' / 'esquadrilha.html').write_text(saida, encoding='utf-8')
print('dist/esquadrilha.html', len(saida), 'bytes;', len(arte), 'desenhos e', len(sons), 'sons embutidos')
