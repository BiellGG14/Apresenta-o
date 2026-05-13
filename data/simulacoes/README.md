# Simulações

Guarde aqui saídas de BlueSky, Monte Carlo, pontos de toque e envelopes P95/P99.

O mapa atual lê diretamente arquivos `STATELOG*.log.txt` com colunas:

```text
simt, id, lat, lon, distflown, alt, cas, tas, gs
```

Cada cenário deve entrar como uma camada própria em `data/map-layers.js`.
