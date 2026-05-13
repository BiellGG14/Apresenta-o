window.SANDBOX_MAP_CONFIG = {
  center: [-23.2292, -45.8615],
  zoom: 13,
  focusZoom: 15,
  layers: [
    {
      id: "topografia",
      category: "ambiente",
      group: "Original útil",
      code: "OPEA",
      title: "Obstáculos OPEA",
      shortTitle: "Obstáculos OPEA",
      status: "KML",
      progress: "428 feições",
      color: "#8c6d31",
      active: true,
      summary:
        "Obstáculos OPEA carregados a partir do KML útil separado para o entorno do SBSJ.",
      details: [
        "O mapa carrega o arquivo KML preservado em data/geojson/sbsj/originais.",
        "A pasta data/02-Dados Geo permanece como fonte bruta local e não é carregada diretamente.",
        "O GeoJSON derivado fica como apoio técnico, mas a visualização principal usa o KML."
      ],
      evidence: ["opeaSBSJ.kml", "manifest.json"],
      nextSteps: [
        "Validar atributos relevantes dos obstáculos.",
        "Definir simbologia por elevação, tipo ou criticidade.",
        "Cruzar com zonas de proteção e futuras superfícies limitadoras."
      ],
      files: [
        {
          format: "KML original útil",
          path: "data/geojson/sbsj/originais/opeaSBSJ.kml"
        }
      ],
      features: [
        {
          type: "kml",
          label: "OPEA SBSJ",
          url: "data/geojson/sbsj/originais/opeaSBSJ.kml",
          color: "#8c6d31",
          fillColor: "#8c6d31",
          radius: 4,
          popup: "Obstáculo OPEA carregado a partir do KML útil."
        }
      ]
    },
    {
      id: "zonas-protecao",
      category: "riscos",
      group: "Original útil",
      code: "T12",
      title: "Zonas de proteção",
      shortTitle: "Zonas de proteção",
      status: "KML/KMZ",
      progress: "287 feições",
      color: "#e05b2a",
      active: true,
      summary:
        "Camada carregada a partir dos arquivos úteis PBZPH, PBZPA SBSJ e PZPANA SBSJ.",
      details: [
        "PBZPH entra como KML preservado em data/geojson/sbsj/originais.",
        "PBZPA SBSJ e PZPANA SBSJ entram como KMZ preservados e abertos no navegador.",
        "Os arquivos brutos em data/02-Dados Geo não são carregados diretamente pelo site."
      ],
      evidence: ["pbzph.kml", "pbzpa_SBSJ.kmz", "pzpana_SBSJ.kmz", "manifest.json"],
      nextSteps: [
        "Revisar quais feições devem permanecer ativas.",
        "Separar superfícies por tipo e critério regulatório.",
        "Cruzar com OPEA, topografia e futuras simulações."
      ],
      files: [
        {
          format: "KML original útil",
          path: "data/geojson/sbsj/originais/pbzph.kml"
        },
        {
          format: "KMZ original útil",
          path: "data/geojson/sbsj/originais/pbzpa_SBSJ.kmz"
        },
        {
          format: "KMZ original útil",
          path: "data/geojson/sbsj/originais/pzpana_SBSJ.kmz"
        }
      ],
      features: [
        {
          type: "kml",
          label: "PBZPH",
          url: "data/geojson/sbsj/originais/pbzph.kml",
          color: "#e05b2a",
          fillColor: "#e05b2a",
          fillOpacity: 0.13,
          weight: 3,
          radius: 4,
          popup: "PBZPH carregado a partir do KML útil."
        },
        {
          type: "kmz",
          label: "PBZPA SBSJ",
          url: "data/geojson/sbsj/originais/pbzpa_SBSJ.kmz",
          color: "#b94b45",
          fillColor: "#b94b45",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          popup: "PBZPA SBSJ carregado a partir do KMZ útil."
        },
        {
          type: "kmz",
          label: "PZPANA SBSJ",
          url: "data/geojson/sbsj/originais/pzpana_SBSJ.kmz",
          color: "#7b5fb2",
          fillColor: "#7b5fb2",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          dashArray: "8 6",
          popup: "PZPANA SBSJ carregado a partir do KMZ útil."
        }
      ]
    }
  ]
};
