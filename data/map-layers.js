window.SANDBOX_MAP_CONFIG = {
  center: [-23.2292, -45.8615],
  zoom: 13,
  focusZoom: 15,
  layers: [
    {
      id: "meteorologia",
      category: "ambiente",
      group: "Contexto",
      code: "MET",
      title: "Meteorologia e dados aeroportuarios",
      shortTitle: "Meteorologia",
      status: "Aguardando dados",
      progress: "Pendente",
      color: "#176b9b",
      active: false,
      summary:
        "Camada reservada para METAR, estatisticas de vento, temperatura, visibilidade e dados aeroportuarios do SBSJ.",
      details: [
        "Nenhuma geometria validada foi carregada nesta camada.",
        "Os dados devem ser tratados antes de entrar em data/metar ou data/geojson/sbsj."
      ],
      evidence: ["Aguardando dataset validado"],
      nextSteps: [
        "Selecionar fonte meteorologica oficial.",
        "Gerar arquivo derivado rastreavel antes de ligar ao mapa."
      ],
      features: []
    },
    {
      id: "espaco-aereo",
      category: "ambiente",
      group: "Contexto",
      code: "AIR",
      title: "Espaco aereo e restricoes regulamentarias",
      shortTitle: "Espaco aereo",
      status: "Aguardando dados",
      progress: "Pendente",
      color: "#4f7d3f",
      active: false,
      summary:
        "Camada reservada para CTR, TMA, corredores, procedimentos, restricoes e demais limites do espaco aereo.",
      details: [
        "Os arquivos brutos existem em data/02-Dados Geo, mas ainda nao foram promovidos para consumo do mapa.",
        "Shapefiles como CTR.zip e TMA.zip dependem de conversao validada para GeoJSON."
      ],
      evidence: ["CTR.zip", "TMA.zip", "setores_tma.zip"],
      nextSteps: [
        "Converter shapefiles com GDAL/QGIS ou rotina equivalente.",
        "Salvar derivados em data/geojson/sbsj/espaco-aereo."
      ],
      features: []
    },
    {
      id: "topografia",
      category: "ambiente",
      group: "Contexto",
      code: "OPEA",
      title: "Topografia, obstaculos e areas sensiveis",
      shortTitle: "Obstaculos OPEA",
      status: "Derivado",
      progress: "428 feicoes",
      color: "#8c6d31",
      active: true,
      summary:
        "Obstaculos OPEA filtrados para o entorno do SBSJ a partir de dado bruto local.",
      details: [
        "O mapa consome apenas o GeoJSON derivado em data/geojson/sbsj/obstaculos.",
        "A pasta data/02-Dados Geo permanece como fonte bruta e nao e carregada diretamente.",
        "A camada ainda precisa de revisao tecnica antes de ser considerada oficial."
      ],
      evidence: ["opea_sbsj.geojson", "manifest.json"],
      nextSteps: [
        "Validar atributos relevantes dos obstaculos.",
        "Definir simbologia por elevacao, tipo ou criticidade.",
        "Cruzar com zonas de protecao e futuras superficies limitadoras."
      ],
      features: [
        {
          type: "geojson",
          label: "OPEA SBSJ derivado",
          url: "data/geojson/sbsj/obstaculos/opea_sbsj.geojson",
          color: "#8c6d31",
          fillColor: "#8c6d31",
          radius: 4,
          popup:
            "Obstaculo OPEA derivado para consumo rastreavel no mapa."
        }
      ]
    },
    {
      id: "facilitacao",
      category: "fase1",
      group: "Atividade",
      code: "T3",
      title: "Facilitacao de passageiros",
      shortTitle: "T3 Passageiros",
      status: "Aguardando dados",
      progress: "Pendente",
      color: "#1e8274",
      active: false,
      summary:
        "Camada reservada para fluxos de passageiros, pontos de acesso, espera, embarque e desembarque.",
      details: [
        "Nenhum dado espacial validado foi carregado nesta camada.",
        "A camada fica em branco ate existir GeoJSON ou outro dado rastreavel aprovado."
      ],
      evidence: ["Aguardando dado validado"],
      nextSteps: [
        "Definir pontos e fluxos reais de passageiros.",
        "Salvar o derivado em data/geojson/sbsj/facilitacao."
      ],
      features: []
    },
    {
      id: "geometria",
      category: "fase1",
      group: "Atividade",
      code: "T4",
      title: "Geometria e arranjo fisico",
      shortTitle: "T4 Geometria",
      status: "Aguardando dados",
      progress: "Pendente",
      color: "#d7971e",
      active: false,
      summary:
        "Camada reservada para FATO, TLOF, area de seguranca e arranjo fisico quando houver geometria validada.",
      details: [
        "As geometrias esquematicas foram removidas.",
        "Esta camada so deve receber CAD/GeoJSON georreferenciado ou derivado validado."
      ],
      evidence: ["Aguardando CAD/GeoJSON validado"],
      nextSteps: [
        "Selecionar geometria de implantacao aprovada.",
        "Converter para GeoJSON e registrar origem no manifest."
      ],
      features: []
    },
    {
      id: "desvios",
      category: "fase1",
      group: "Atividade",
      code: "T6",
      title: "Desvios de trajetoria",
      shortTitle: "T6 Desvios",
      status: "Aguardando dados",
      progress: "Pendente",
      color: "#7b5fb2",
      active: false,
      summary:
        "Camada reservada para trajetorias simuladas, nuvens de pontos e envelopes probabilisticos.",
      details: [
        "As linhas e pontos esquematicos foram removidos.",
        "A camada deve ser preenchida apenas com saidas reais de simulacao."
      ],
      evidence: ["Aguardando simulacoes validadas"],
      nextSteps: [
        "Exportar trajetorias e envelopes para GeoJSON.",
        "Salvar derivados em data/simulacoes ou data/geojson/sbsj/simulacoes."
      ],
      features: []
    },
    {
      id: "ruido",
      category: "fase1",
      group: "Atividade",
      code: "T10",
      title: "Ruido aeronautico",
      shortTitle: "T10 Ruido",
      status: "Aguardando dados",
      progress: "Pendente",
      color: "#b94b45",
      active: false,
      summary:
        "Camada reservada para mapas de ruido, receptores, decibelimetros e resultados de modelagem acustica.",
      details: [
        "Os aneis esquematicos foram removidos.",
        "A camada fica em branco ate existir saida validada de modelagem ou medicao."
      ],
      evidence: ["Aguardando dado de ruido validado"],
      nextSteps: [
        "Exportar resultados do NoiseModelling ou pontos de medicao.",
        "Salvar derivados em data/ruido ou data/geojson/sbsj/ruido."
      ],
      features: []
    },
    {
      id: "zonas-protecao",
      category: "riscos",
      group: "Atividade",
      code: "T12",
      title: "Zonas de protecao",
      shortTitle: "T12 Protecao",
      status: "Derivado",
      progress: "287 feicoes",
      color: "#e05b2a",
      active: true,
      summary:
        "Camada com derivados GeoJSON de PBZPH, PBZPA SBSJ e PZPANA SBSJ.",
      details: [
        "O mapa consome apenas arquivos derivados em data/geojson/sbsj/zonas.",
        "Os arquivos brutos em data/02-Dados Geo nao sao carregados diretamente.",
        "As feicoes ainda precisam de revisao tecnica para definir o que entra na versao oficial."
      ],
      evidence: ["pbzph.geojson", "pbzpa_sbsj.geojson", "pzpana_sbsj.geojson", "manifest.json"],
      nextSteps: [
        "Revisar quais feicoes derivadas devem permanecer ativas.",
        "Separar superficies por tipo e criterio regulatorio.",
        "Cruzar com OPEA, topografia e futuras simulacoes."
      ],
      features: [
        {
          type: "geojson",
          label: "PBZPH derivado",
          url: "data/geojson/sbsj/zonas/pbzph.geojson",
          color: "#e05b2a",
          fillColor: "#e05b2a",
          fillOpacity: 0.13,
          weight: 3,
          radius: 4,
          popup:
            "PBZPH derivado para consumo rastreavel no mapa."
        },
        {
          type: "geojson",
          label: "PBZPA SBSJ derivado",
          url: "data/geojson/sbsj/zonas/pbzpa_sbsj.geojson",
          color: "#b94b45",
          fillColor: "#b94b45",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          popup:
            "PBZPA SBSJ derivado para consumo rastreavel no mapa."
        },
        {
          type: "geojson",
          label: "PZPANA SBSJ derivado",
          url: "data/geojson/sbsj/zonas/pzpana_sbsj.geojson",
          color: "#7b5fb2",
          fillColor: "#7b5fb2",
          fillOpacity: 0.12,
          weight: 2,
          radius: 4,
          dashArray: "8 6",
          popup:
            "PZPANA SBSJ derivado para consumo rastreavel no mapa."
        }
      ]
    }
  ]
};
