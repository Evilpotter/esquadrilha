# Esquadrilha – pai e filho

Jogo de avião visto de cima, feito pelo Rafael e pelo Bryan. Roda no navegador (PC e celular), sem instalar nada.

- **Jogar (oficial):** https://evilpotter.github.io/esquadrilha/
- **Jogar (teste):** https://evilpotter.github.io/esquadrilha/teste/

## Como o repositório está organizado
| Pasta | O que é |
|---|---|
| `/` (raiz) | versão **oficial** – só recebe mudanças já testadas e aprovadas |
| `teste/` | versão de **teste** – toda mudança nova entra aqui primeiro |
| `teste/js/` | código, separado por assunto: `nucleo`, `dados`, `inimigos`, `chefoes`, `naves`, `telas`, `visual` |
| `teste/arte/` | desenhos (`.svg`): naves e skins, tiros, bumerangues, inimigos, chefões |
| `ferramentas/` | testes automáticos e geração da versão offline |

## Versões
Formato X.Y.Z: **X** mudança grande · **Y** novidade menor · **Z** correção.
A versão aparece no canto da tela inicial. O número fica em `js/nucleo/versao.js`.

## Ferramentas (Python 3 + Playwright + Chrome)
```
python3 ferramentas/testar.py --raiz teste            # teste de fumaça
python3 ferramentas/testar.py todos --raiz teste      # fumaça + fotos (dist/)
python3 ferramentas/comparar.py antes depois          # compara fotos
python3 ferramentas/build.py teste                    # versão offline em um arquivo só
```
