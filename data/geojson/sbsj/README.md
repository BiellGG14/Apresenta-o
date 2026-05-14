# Geodados do SBSJ

Esta pasta mantém os arquivos úteis promovidos para consumo do mapa interativo.
O nome `geojson` ficou como pasta histórica do projeto, mas o mapa atual usa KML/KMZ diretamente.

## Regra de rastreabilidade

- `data/02-Dados Geo/` é fonte bruta local.
- O site não deve carregar arquivos diretamente dessa fonte bruta.
- Arquivos aprovados para o mapa ficam em `originais/`.
- O manifest `manifest.json` registra origem, destino, formato e contagem de feições.

## Arquivos atuais

- `originais/opeaSBSJ.kml`: obstáculos OPEA filtrados no mapa para o entorno do SBSJ.
- `originais/pbzph.kml`: PBZPH em KML.
- `originais/pbzpa_SBSJ.kmz`: PBZPA SBSJ em KMZ.
- `originais/pzpana_SBSJ.kmz`: PZPANA SBSJ em KMZ.
- `Vertiporto_SBSJ.gpkg`: referência original recebida para o ponto do vertiporto.
- `CV_REA_SP.gpkg`: fonte original REA São Paulo.
- `REH/`: fonte original REH XP São Paulo em shapefile.
- `EAC/D/`: fonte original EAC D em shapefile.
- `EAC/P/`: fonte original EAC P em shapefile.
- `superficies/rea_sp.kml`: KML derivado para visualização da REA.
- `superficies/reh_xp_sao_paulo.kml`: KML derivado para visualização da REH.
- `superficies/eac_d.kml`: KML derivado para visualização do EAC D.
- `superficies/eac_p.kml`: KML derivado para visualização do EAC P.

## Como atualizar

Execute, a partir da raiz do projeto:

```powershell
python tools\derive_geodata.py
```
