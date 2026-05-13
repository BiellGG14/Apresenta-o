# Dados do mapa

Use esta pasta para manter os dados que alimentam o mapa interativo.

## Arquivo atual

- `map-layers.js`: catálogo inicial de camadas, textos executivos, status e geometrias demonstrativas.

## Próximos dados sugeridos

- `geojson/`: limites oficiais, trajetórias, zonas de proteção e obstáculos.
- `metar/`: séries tratadas de meteorologia do SBSJ.
- `simulacoes/`: saídas de BlueSky, Monte Carlo, P95/P99 e pontos de toque.
- `ruido/`: resultados exportados do NoiseModelling.

Ao substituir uma geometria demonstrativa por dado oficial, registre fonte, data, sistema de coordenadas e versão no próprio objeto da camada.
