window.SANDBOX_MAP_CONFIG = {
  center: [-23.2292, -45.8615],
  zoom: 13,
  focusZoom: 15,
  layers: [
    {
      id: "vertiporto-sbsj",
      category: "infraestrutura",
      group: "Vertiporto",
      code: "SBSJ",
      title: "Vertiporto SBSJ",
      shortTitle: "Vertiporto SBSJ",
      status: "Ponto inicial",
      progress: "1 ponto",
      color: "#0b5f8a",
      active: true,
      summary:
        "Ponto de partida do vertiporto no Sandbox São José dos Campos.",
      details: [
        "O marcador abre como única camada ativa para orientar a navegação inicial.",
        "O arquivo Vertiporto_SBSJ.gpkg fica preservado como referência recebida.",
        "As demais camadas continuam disponíveis para ativação manual no painel."
      ],
      evidence: ["Vertiporto_SBSJ.gpkg"],
      nextSteps: [
        "Substituir o marcador por geometria detalhada quando a planta vier com feições.",
        "Adicionar área de pouso, acessos e demais elementos físicos do vertiporto.",
        "Cruzar o ponto com zonas de proteção, EAC e cenários simulados."
      ],
      files: [
        {
          format: "GeoPackage original",
          path: "data/geojson/sbsj/Vertiporto_SBSJ.gpkg"
        }
      ],
      features: [
        {
          type: "marker",
          label: "Vertiporto SBSJ",
          coords: [-23.2292, -45.8615],
          color: "#ffffff",
          fillColor: "#0b5f8a",
          radius: 11,
          popup: "Ponto inicial do vertiporto no Sandbox SBSJ."
        }
      ]
    },
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
      active: false,
      summary:
        "Obstáculos OPEA carregados a partir do KML útil separado para o entorno do SBSJ.",
      details: [
        "O mapa carrega o arquivo KML preservado em data/geojson/sbsj/originais.",
        "A pasta data/02-Dados Geo permanece como fonte bruta local e não é carregada diretamente.",
        "O filtro espacial do OPEA é aplicado no navegador para mostrar o entorno do SBSJ."
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
          bbox: [-45.98, -23.35, -45.70, -23.10],
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
      active: false,
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
    },
    {
      id: "rea-sp",
      category: "superficies",
      group: "Superfície",
      code: "REA",
      title: "REA São Paulo",
      shortTitle: "REA SP",
      status: "KML derivado",
      progress: "176 feições",
      color: "#0284c7",
      active: false,
      summary:
        "Superfícies REA de São Paulo derivadas do GeoPackage adicionado ao projeto.",
      details: [
        "A fonte original fica em data/geojson/sbsj/CV_REA_SP.gpkg.",
        "O mapa consome o KML derivado em data/geojson/sbsj/superficies.",
        "A camada foi reprojetada de SIRGAS 2000 / UTM 23S para WGS84."
      ],
      evidence: ["CV_REA_SP.gpkg", "rea_sp.kml", "manifest.json"],
      nextSteps: [
        "Validar quais trechos REA devem ficar ativos na apresentação.",
        "Cruzar as superfícies com as trajetórias simuladas.",
        "Ajustar legenda por classe, altitude ou trecho."
      ],
      files: [
        {
          format: "GeoPackage original",
          path: "data/geojson/sbsj/CV_REA_SP.gpkg"
        },
        {
          format: "KML derivado",
          path: "data/geojson/sbsj/superficies/rea_sp.kml"
        }
      ],
      features: [
        {
          type: "kml",
          label: "REA São Paulo",
          url: "data/geojson/sbsj/superficies/rea_sp.kml",
          color: "#0284c7",
          fillColor: "#38bdf8",
          fillOpacity: 0.1,
          weight: 2,
          radius: 4,
          popup: "Superfície REA derivada para visualização no mapa."
        }
      ]
    },
    {
      id: "reh-xp-sp",
      category: "superficies",
      group: "Superfície",
      code: "REH",
      title: "REH XP São Paulo",
      shortTitle: "REH XP SP",
      status: "KML derivado",
      progress: "106 feições",
      color: "#be185d",
      active: false,
      summary:
        "Superfícies REH XP São Paulo derivadas do shapefile adicionado ao projeto.",
      details: [
        "A fonte original fica em data/geojson/sbsj/REH.",
        "O mapa consome o KML derivado em data/geojson/sbsj/superficies.",
        "A camada original já está em WGS84."
      ],
      evidence: ["CV_REH_XP_SAO_PAULO.shp", "reh_xp_sao_paulo.kml", "manifest.json"],
      nextSteps: [
        "Validar quais trechos REH devem ficar ativos na apresentação.",
        "Comparar a camada com REA e cenários simulados.",
        "Ajustar legenda por classe, altitude ou trecho."
      ],
      files: [
        {
          format: "Shapefile original",
          path: "data/geojson/sbsj/REH/CV_REH_XP_SAO_PAULO.shp"
        },
        {
          format: "KML derivado",
          path: "data/geojson/sbsj/superficies/reh_xp_sao_paulo.kml"
        }
      ],
      features: [
        {
          type: "kml",
          label: "REH XP São Paulo",
          url: "data/geojson/sbsj/superficies/reh_xp_sao_paulo.kml",
          color: "#be185d",
          fillColor: "#f472b6",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          popup: "Superfície REH derivada para visualização no mapa."
        }
      ]
    },
    {
      id: "eac-d",
      category: "superficies",
      group: "Espaço aéreo",
      code: "EAC D",
      title: "EAC D",
      shortTitle: "EAC D",
      status: "KML derivado",
      progress: "110 feições",
      color: "#7c3aed",
      active: false,
      summary:
        "Espaços aéreos condicionados do conjunto EAC D adicionados como camada independente.",
      details: [
        "A fonte original fica em data/geojson/sbsj/EAC/D.",
        "O mapa consome o KML derivado em data/geojson/sbsj/superficies.",
        "A camada original já está em WGS84."
      ],
      evidence: ["eac_d.shp", "eac_d.kml", "manifest.json"],
      nextSteps: [
        "Validar quais áreas EAC D devem permanecer visíveis na apresentação.",
        "Comparar com REA, REH, zonas de proteção e cenários simulados.",
        "Ajustar simbologia por tipo, limite superior/inferior ou perigo."
      ],
      files: [
        {
          format: "Shapefile original",
          path: "data/geojson/sbsj/EAC/D/eac_d.shp"
        },
        {
          format: "KML derivado",
          path: "data/geojson/sbsj/superficies/eac_d.kml"
        }
      ],
      features: [
        {
          type: "kml",
          label: "EAC D",
          url: "data/geojson/sbsj/superficies/eac_d.kml",
          color: "#7c3aed",
          fillColor: "#a78bfa",
          fillOpacity: 0.1,
          weight: 2,
          radius: 4,
          popup: "EAC D derivado para visualização no mapa."
        }
      ]
    },
    {
      id: "eac-p",
      category: "superficies",
      group: "Espaço aéreo",
      code: "EAC P",
      title: "EAC P",
      shortTitle: "EAC P",
      status: "KML derivado",
      progress: "65 feições",
      color: "#dc2626",
      active: false,
      summary:
        "Espaços aéreos condicionados do conjunto EAC P adicionados como camada independente.",
      details: [
        "A fonte original fica em data/geojson/sbsj/EAC/P.",
        "O mapa consome o KML derivado em data/geojson/sbsj/superficies.",
        "A camada original já está em WGS84."
      ],
      evidence: ["eac_p.shp", "eac_p.kml", "manifest.json"],
      nextSteps: [
        "Validar quais áreas EAC P devem permanecer visíveis na apresentação.",
        "Comparar com REA, REH, zonas de proteção e cenários simulados.",
        "Ajustar simbologia por tipo, limite superior/inferior ou perigo."
      ],
      files: [
        {
          format: "Shapefile original",
          path: "data/geojson/sbsj/EAC/P/eac_p.shp"
        },
        {
          format: "KML derivado",
          path: "data/geojson/sbsj/superficies/eac_p.kml"
        }
      ],
      features: [
        {
          type: "kml",
          label: "EAC P",
          url: "data/geojson/sbsj/superficies/eac_p.kml",
          color: "#dc2626",
          fillColor: "#f87171",
          fillOpacity: 0.1,
          weight: 2,
          radius: 4,
          popup: "EAC P derivado para visualização no mapa."
        }
      ]
    },
    {
      id: "cenario-1",
      category: "simulacao",
      group: "Simulação",
      code: "C1",
      title: "Cenário 1 · SBGR-SJK",
      shortTitle: "Cenário 1",
      status: "State log",
      progress: "28.242 pontos",
      color: "#0f766e",
      active: false,
      summary:
        "Trajetória simulada do procedimento VAC entre SBGR e São José dos Campos.",
      details: [
        "Arquivo lido diretamente de data/simulacoes em formato state log.",
        "O mapa usa as colunas lat e lon para desenhar a trajetória.",
        "Coordenadas repetidas são reduzidas no navegador para manter o mapa responsivo."
      ],
      evidence: ["STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_1_20260513_17-59-24.log.txt"],
      nextSteps: [
        "Validar se o cenário deve permanecer com todos os pontos ou com amostragem.",
        "Definir simbologia por altitude, velocidade ou fase de voo."
      ],
      files: [
        {
          format: "State log",
          path: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_1_20260513_17-59-24.log.txt"
        }
      ],
      features: [
        {
          type: "statelog",
          label: "Cenário 1 · SBGR-SJK",
          url: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_1_20260513_17-59-24.log.txt",
          color: "#0f766e",
          fillColor: "#0f766e",
          startColor: "#22c55e",
          endColor: "#111827",
          weight: 4,
          radius: 4,
          endpointRadius: 7,
          maxPoints: 5000
        }
      ]
    },
    {
      id: "cenario-2",
      category: "simulacao",
      group: "Simulação",
      code: "C2",
      title: "Cenário 2 · SBGR-SJK",
      shortTitle: "Cenário 2",
      status: "State log",
      progress: "27.759 pontos",
      color: "#2563eb",
      active: false,
      summary:
        "Segundo cenário simulado do procedimento VAC entre SBGR e São José dos Campos.",
      details: [
        "Arquivo lido diretamente de data/simulacoes em formato state log.",
        "Este log possui muitas linhas repetidas e é carregado apenas quando a camada é ativada.",
        "A visualização usa as colunas lat e lon para gerar a trajetória no Leaflet."
      ],
      evidence: ["STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_2_20260513_18-00-13.log.txt"],
      nextSteps: [
        "Confirmar por que o cenário 2 tem duração muito maior.",
        "Comparar envelope lateral com o cenário 1."
      ],
      files: [
        {
          format: "State log",
          path: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_2_20260513_18-00-13.log.txt"
        }
      ],
      features: [
        {
          type: "statelog",
          label: "Cenário 2 · SBGR-SJK",
          url: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_2_20260513_18-00-13.log.txt",
          color: "#2563eb",
          fillColor: "#2563eb",
          startColor: "#22c55e",
          endColor: "#111827",
          weight: 4,
          radius: 4,
          endpointRadius: 7,
          maxPoints: 5000
        }
      ]
    },
    {
      id: "cenario-3",
      category: "simulacao",
      group: "Simulação",
      code: "C3",
      title: "Cenário 3 · Taubaté-SJK",
      shortTitle: "Cenário 3",
      status: "State log",
      progress: "14.085 pontos",
      color: "#d97706",
      active: false,
      summary:
        "Trajetória simulada partindo de Taubaté em direção a São José dos Campos.",
      details: [
        "Arquivo lido diretamente de data/simulacoes em formato state log.",
        "O mapa usa as colunas lat e lon para desenhar a trajetória.",
        "Pontos inicial e final são destacados na camada."
      ],
      evidence: ["STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_3_20260513_18-43-06.log.txt"],
      nextSteps: [
        "Comparar com o cenário 4.",
        "Cruzar a rota com zonas de proteção e obstáculos OPEA."
      ],
      files: [
        {
          format: "State log",
          path: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_3_20260513_18-43-06.log.txt"
        }
      ],
      features: [
        {
          type: "statelog",
          label: "Cenário 3 · Taubaté-SJK",
          url: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_3_20260513_18-43-06.log.txt",
          color: "#d97706",
          fillColor: "#d97706",
          startColor: "#22c55e",
          endColor: "#111827",
          weight: 4,
          radius: 4,
          endpointRadius: 7,
          maxPoints: 5000
        }
      ]
    },
    {
      id: "cenario-4",
      category: "simulacao",
      group: "Simulação",
      code: "C4",
      title: "Cenário 4 · Taubaté-SJK",
      shortTitle: "Cenário 4",
      status: "State log",
      progress: "13.810 pontos",
      color: "#9333ea",
      active: false,
      summary:
        "Quarto cenário simulado partindo de Taubaté em direção a São José dos Campos.",
      details: [
        "Arquivo lido diretamente de data/simulacoes em formato state log.",
        "O mapa usa as colunas lat e lon para desenhar a trajetória.",
        "A camada é independente para facilitar comparação com os demais cenários."
      ],
      evidence: ["STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_4_20260513_18-43-41.log.txt"],
      nextSteps: [
        "Comparar com o cenário 3.",
        "Cruzar a rota com zonas de proteção e obstáculos OPEA."
      ],
      files: [
        {
          format: "State log",
          path: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_4_20260513_18-43-41.log.txt"
        }
      ],
      features: [
        {
          type: "statelog",
          label: "Cenário 4 · Taubaté-SJK",
          url: "data/simulacoes/STATELOG_scenario_Procedimento_VAC_SBSJ_31983_Peres_4_20260513_18-43-41.log.txt",
          color: "#9333ea",
          fillColor: "#9333ea",
          startColor: "#22c55e",
          endColor: "#111827",
          weight: 4,
          radius: 4,
          endpointRadius: 7,
          maxPoints: 5000
        }
      ]
    }
  ]
};
