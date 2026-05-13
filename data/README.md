# Dados do mapa

Use esta pasta para manter os dados que alimentam o mapa interativo.

## Arquivo atual

- `map-layers.js`: catálogo de camadas, textos, status e caminhos dos arquivos usados no mapa.
- `geojson/sbsj/originais/`: KML/KMZ úteis promovidos para uso no mapa.
- `simulacoes/`: logs de cenário lidos pelo mapa para desenhar trajetórias.

## Fonte bruta local

- `02-Dados Geo/`: pasta de origem adicionada a partir dos materiais do Marcelo.
- Esta pasta não é consumida diretamente pelo mapa.
- Quando um dado for aprovado para uso, promova apenas o arquivo útil para `geojson/sbsj/originais/` ou para a pasta temática correspondente.

## Próximos dados sugeridos

- `geojson/`: geodados oficiais ou úteis publicados no mapa.
- `metar/`: séries tratadas de meteorologia do SBSJ.
- `simulacoes/`: saídas de BlueSky, Monte Carlo, P95/P99 e pontos de toque.
- `ruido/`: resultados exportados do NoiseModelling.

Ao substituir uma geometria demonstrativa por dado oficial, registre fonte, data, sistema de coordenadas e versão no próprio objeto da camada.
