window.SANDBOX_MAP_CONFIG = {
  center: [-23.2292, -45.8615],
  zoom: 13,
  focusZoom: 15,
  layers: [
    {
      id: "topografia",
      category: "ambiente",
      group: "Derivado",
      code: "OPEA",
      title: "Obstáculos OPEA",
      shortTitle: "Obstáculos OPEA",
      status: "Derivado",
      progress: "428 feições",
      color: "#8c6d31",
      active: true,
      summary:
        "Obstáculos OPEA filtrados para o entorno do SBSJ a partir de dado bruto local.",
      details: [
        "O mapa consome apenas o GeoJSON derivado em data/geojson/sbsj/obstaculos.",
        "A pasta data/02-Dados Geo permanece como fonte bruta local e não é carregada diretamente.",
        "A camada ainda precisa de revisão técnica antes de ser considerada oficial."
      ],
      evidence: ["opea_sbsj.geojson", "manifest.json"],
      nextSteps: [
        "Validar atributos relevantes dos obstáculos.",
        "Definir simbologia por elevação, tipo ou criticidade.",
        "Cruzar com zonas de proteção e futuras superfícies limitadoras."
      ],
      files: [
        {
          format: "GeoJSON derivado",
          path: "data/geojson/sbsj/obstaculos/opea_sbsj.geojson"
        }
      ],
      features: [
        {
          type: "geojson",
          label: "OPEA SBSJ",
          url: "data/geojson/sbsj/obstaculos/opea_sbsj.geojson",
          color: "#8c6d31",
          fillColor: "#8c6d31",
          radius: 4,
          popup:
            "Obstáculo OPEA derivado para consumo rastreável no mapa."
        }
      ]
    },
    {
      id: "zonas-protecao",
      category: "riscos",
      group: "Derivado",
      code: "T12",
      title: "Zonas de proteção",
      shortTitle: "Zonas de proteção",
      status: "Derivado",
      progress: "287 feições",
      color: "#e05b2a",
      active: true,
      summary:
        "Camada com derivados de PBZPH, PBZPA SBSJ e PZPANA SBSJ.",
      details: [
        "O mapa consome apenas arquivos derivados em data/geojson/sbsj/zonas.",
        "Os arquivos brutos em data/02-Dados Geo não são carregados diretamente.",
        "As feições ainda precisam de revisão técnica para definir o que entra na versão oficial."
      ],
      evidence: ["pbzph.geojson", "pbzpa_sbsj.geojson", "pzpana_sbsj.geojson", "manifest.json"],
      nextSteps: [
        "Revisar quais feições derivadas devem permanecer ativas.",
        "Separar superfícies por tipo e critério regulatório.",
        "Cruzar com OPEA, topografia e futuras simulações."
      ],
      files: [
        {
          format: "GeoJSON derivado",
          path: "data/geojson/sbsj/zonas/pbzph.geojson"
        },
        {
          format: "GeoJSON derivado",
          path: "data/geojson/sbsj/zonas/pbzpa_sbsj.geojson"
        },
        {
          format: "GeoJSON derivado",
          path: "data/geojson/sbsj/zonas/pzpana_sbsj.geojson"
        }
      ],
      features: [
        {
          type: "geojson",
          label: "PBZPH",
          url: "data/geojson/sbsj/zonas/pbzph.geojson",
          color: "#e05b2a",
          fillColor: "#e05b2a",
          fillOpacity: 0.13,
          weight: 3,
          radius: 4,
          popup:
            "PBZPH derivado para consumo rastreável no mapa."
        },
        {
          type: "geojson",
          label: "PBZPA SBSJ",
          url: "data/geojson/sbsj/zonas/pbzpa_sbsj.geojson",
          color: "#b94b45",
          fillColor: "#b94b45",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          popup:
            "PBZPA SBSJ derivado para consumo rastreável no mapa."
        },
        {
          type: "geojson",
          label: "PZPANA SBSJ",
          url: "data/geojson/sbsj/zonas/pzpana_sbsj.geojson",
          color: "#7b5fb2",
          fillColor: "#7b5fb2",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          dashArray: "8 6",
          popup:
            "PZPANA SBSJ derivado para consumo rastreável no mapa."
        }
      ]
    }
  ]
};
