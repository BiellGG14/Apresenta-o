# Sandbox São José dos Campos

Site estático para GitHub Pages com visão geral, mapa interativo e relatório web das atividades do Sandbox Regulatório de Vertiportos.

## Páginas

- `index.html`: visão geral do Sandbox e atalhos de navegação.
- `mapa.html`: mapa interativo com camadas temáticas e base satélite.
- `relatorio.html`: relatório web das atividades, com contexto, conteúdo atual e próximos passos.

## Estrutura

- `assets/css/styles.css`: identidade visual e layout.
- `assets/js/map.js`: comportamento do mapa Leaflet.
- `assets/img/`: logos, imagens, capturas e diagramas de apoio.
- `data/map-layers.js`: dados iniciais das camadas do mapa.
- `data/geojson/`: limites, trajetórias, obstáculos e zonas em GeoJSON.
- `data/metar/`: séries meteorológicas tratadas.
- `data/simulacoes/`: saídas de BlueSky, Monte Carlo e envelopes.
- `data/ruido/`: resultados do NoiseModelling e receptores.
- `tools/derive_geodata.py`: gera GeoJSON derivados a partir de KML/KMZ brutos.

## Como adicionar uma camada

Edite `data/map-layers.js` e inclua um novo objeto em `layers`. Cada camada pode ter `polygon`, `polyline`, `circle`, `marker` ou `points`. As geometrias atuais são preliminares e devem ser substituídas por GeoJSON ou coordenadas oficiais quando disponíveis.

## Dados brutos

Arquivos de origem local devem permanecer fora do consumo direto do mapa. Para usar algum dado de `data/02-Dados Geo/`, gere um derivado em `data/geojson/sbsj/` com:

```powershell
python tools\derive_geodata.py
```
