# GeoJSON Derivados do SBSJ

Esta pasta contém dados derivados para consumo direto do mapa interativo.

## Regra de rastreabilidade

- `data/02-Dados Geo/` é fonte bruta local.
- O site não deve carregar arquivos diretamente dessa fonte bruta.
- Arquivos usados no mapa devem ser convertidos, filtrados e salvos aqui.
- O manifest `manifest.json` registra origem, destino e contagem de feições.

## Derivados atuais

- `obstaculos/opea_sbsj.geojson`: obstáculos OPEA filtrados para o entorno do SBSJ.
- `zonas/pbzph.geojson`: PBZPH derivado de KML.
- `zonas/pbzpa_sbsj.geojson`: PBZPA SBSJ derivado de KMZ.
- `zonas/pzpana_sbsj.geojson`: PZPANA SBSJ derivado de KMZ.

## Como regenerar

Execute, a partir da raiz do projeto:

```powershell
python tools\derive_geodata.py
```
