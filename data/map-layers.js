window.SANDBOX_MAP_CONFIG = {
  center: [-23.2292, -45.8615],
  zoom: 13,
  focusZoom: 15,
  layers: [
    {
      id: "meteorologia",
      category: "ambiente",
      group: "Volume I",
      code: "CAR-01",
      title: "Meteorologia e dados aeroportuários",
      shortTitle: "Meteorologia",
      status: "Base de leitura",
      progress: "Volume I",
      color: "#176b9b",
      active: true,
      summary:
        "Caracterização das condições do SBSJ para vento, temperatura, visibilidade, precipitação e séries históricas relevantes a operações eVTOL.",
      details: [
        "Consolida a leitura meteorológica que alimenta os cenários da T6.",
        "Serve como base para parametrização de vento, temperatura e densidade-altitude.",
        "Deve receber futuramente dados reais de METAR, séries históricas e estatísticas sazonais."
      ],
      evidence: ["METAR SBSJ", "Dados aeroportuários", "Séries históricas"],
      nextSteps: [
        "Conectar dataset de METAR tratado.",
        "Adicionar rosas dos ventos e distribuição de temperatura por estação."
      ],
      features: [
        {
          type: "circle",
          label: "Envelope de influência meteorológica",
          center: [-23.2292, -45.8615],
          radius: 2600,
          fillOpacity: 0.12,
          weight: 2,
          popup:
            "Área inicial para leitura de vento, visibilidade e condições de operação no entorno do SBSJ."
        },
        {
          type: "marker",
          label: "SBSJ / Professor Urbano Ernesto Stumpf",
          coords: [-23.2292, -45.8615],
          popup: "Ponto central da caracterização aeroportuária e meteorológica."
        }
      ]
    },
    {
      id: "espaco-aereo",
      category: "ambiente",
      group: "Volume I",
      code: "CAR-02",
      title: "Espaço aéreo e restrições regulamentárias",
      shortTitle: "Espaço aéreo",
      status: "Em estruturação",
      progress: "Volume I",
      color: "#4f7d3f",
      active: true,
      summary:
        "Leitura dos procedimentos publicados, restrições do DECEA, classes de espaço aéreo e fluxos compatíveis com operação VFR.",
      details: [
        "O relatório usa VAC RWY 16/34, ADC e referências do DECEA como base de análise.",
        "A rota de chegada da T6 considera a REH CAMPOS, entrada pela região de Jacareí e notificação em UNIP.",
        "As restrições devem ser cruzadas com trajetórias, obstáculos e zonas de proteção."
      ],
      evidence: ["VAC RWY 16/34", "ADC SBSJ", "AIC N32/25", "ICA 11-408"],
      nextSteps: [
        "Digitalizar limites oficiais como GeoJSON.",
        "Vincular cada restrição a fonte e data AIRAC."
      ],
      features: [
        {
          type: "polygon",
          label: "CTR São José - área de estudo",
          coords: [
            [-23.095, -46.02],
            [-23.06, -45.73],
            [-23.335, -45.67],
            [-23.405, -45.99]
          ],
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "8 6",
          popup:
            "Representação esquemática para organizar restrições e fluxos VFR. Substituir por geometria oficial."
        },
        {
          type: "polyline",
          label: "Rota nominal REH CAMPOS",
          coords: [
            [-23.303, -45.965],
            [-23.27, -45.925],
            [-23.245, -45.895],
            [-23.2292, -45.8615]
          ],
          weight: 4,
          dashArray: "10 7",
          popup:
            "Trajeto nominal usado como referência visual para chegada ao SBSJ."
        },
        {
          type: "marker",
          label: "Portão Jacareí",
          coords: [-23.303, -45.965],
          popup: "Ponto de entrada esquemático na rota de chegada."
        },
        {
          type: "marker",
          label: "UNIP",
          coords: [-23.245, -45.895],
          popup: "Ponto de notificação citado no contexto da T6."
        }
      ]
    },
    {
      id: "topografia",
      category: "ambiente",
      group: "Volume I",
      code: "CAR-03",
      title: "Topografia, obstáculos e áreas sensíveis",
      shortTitle: "Topografia",
      status: "Base cartográfica",
      progress: "Volume I",
      color: "#8c6d31",
      active: false,
      summary:
        "Mapeamento da topografia, obstáculos naturais e artificiais, áreas urbanas e pontos sensíveis ao redor do vertiporto.",
      details: [
        "A camada prepara o cruzamento com superfícies limitadoras e áreas de maior sensibilidade operacional.",
        "Os pontos atuais são marcadores iniciais para demonstração e devem ser substituídos por levantamento planialtimétrico."
      ],
      evidence: ["Levantamento planialtimétrico", "Obstáculos", "Áreas sensíveis"],
      nextSteps: [
        "Importar MDE e curvas de nível.",
        "Cadastrar obstáculos com elevação, fonte e data de validação."
      ],
      features: [
        {
          type: "polygon",
          label: "Área urbana sensível",
          coords: [
            [-23.215, -45.904],
            [-23.205, -45.873],
            [-23.235, -45.842],
            [-23.255, -45.875]
          ],
          fillOpacity: 0.11,
          weight: 2,
          popup:
            "Área de atenção para cruzamento entre ruído, proteção e ocupação urbana."
        },
        {
          type: "points",
          label: "Obstáculos preliminares",
          radius: 7,
          points: [
            {
              label: "Obstáculo A",
              coords: [-23.217, -45.846],
              popup: "Marcador preliminar para cadastro de obstáculo."
            },
            {
              label: "Obstáculo B",
              coords: [-23.242, -45.835],
              popup: "Marcador preliminar para cadastro de obstáculo."
            },
            {
              label: "Área sensível C",
              coords: [-23.258, -45.884],
              popup: "Ponto sensível a avaliar em conjunto com ruído e trajetórias."
            }
          ]
        }
      ]
    },
    {
      id: "facilitacao",
      category: "fase1",
      group: "Fase I",
      code: "T3",
      title: "Facilitação de passageiros",
      shortTitle: "T3 Passageiros",
      status: "Em andamento",
      progress: "15%",
      color: "#1e8274",
      active: false,
      summary:
        "Simulações e entrevistas para recomendações preliminares à ANAC, com foco na experiência operacional de passageiros.",
      details: [
        "O relatório indica comparação de requisitos entre autoridades aeronáuticas.",
        "A camada organiza pontos de acesso, fluxo de chegada e leitura de infraestrutura de apoio.",
        "Tema vinculado ao eixo de Operação na Fase I."
      ],
      evidence: ["Tabela comparativa de requisitos", "Simulações", "Entrevistas"],
      nextSteps: [
        "Mapear fluxos de entrada, espera, embarque e saída.",
        "Associar cada ponto a requisitos FAA, ICAO, EASA, Brasil, CASA e Japão."
      ],
      features: [
        {
          type: "polyline",
          label: "Fluxo preliminar de passageiros",
          coords: [
            [-23.2325, -45.8665],
            [-23.2312, -45.8641],
            [-23.2292, -45.8615]
          ],
          weight: 4,
          dashArray: "4 8",
          popup:
            "Fluxo inicial para discussão de acesso, espera e embarque."
        },
        {
          type: "marker",
          label: "Ponto de facilitação",
          coords: [-23.2325, -45.8665],
          popup:
            "Ponto demonstrativo para cadastro de entrevistas, filas e tempos de processamento."
        }
      ]
    },
    {
      id: "geometria",
      category: "fase1",
      group: "Fase I",
      code: "T4",
      title: "Geometria e arranjo físico",
      shortTitle: "T4 Geometria",
      status: "Planejada",
      progress: "10%",
      color: "#d7971e",
      active: true,
      summary:
        "Comparação entre simulações e orientações preliminares de infraestrutura, com avaliação de FATO, TLOF, segurança e arranjo físico.",
      details: [
        "O relatório cita avaliação de plantas CAD e dimensões críticas das áreas operacionais.",
        "A tarefa se conecta diretamente aos envelopes de desvio da T6 e às zonas de proteção da T12.",
        "A camada atual desenha uma geometria experimental para orientar a discussão."
      ],
      evidence: ["Plantas CAD", "Área de testes de motores", "Guias CASA/FAA/EASA"],
      nextSteps: [
        "Substituir polígonos por CAD georreferenciado.",
        "Cadastrar dimensões normativas e folgas por cenário de aeronave."
      ],
      features: [
        {
          type: "polygon",
          label: "FATO experimental",
          coords: [
            [-23.22865, -45.86245],
            [-23.22795, -45.86175],
            [-23.22855, -45.86095],
            [-23.22925, -45.86165]
          ],
          fillOpacity: 0.28,
          weight: 3,
          popup:
            "Geometria inicial de FATO para discussão. Substituir por desenho CAD georreferenciado."
        },
        {
          type: "polygon",
          label: "Área de segurança",
          coords: [
            [-23.2292, -45.86325],
            [-23.22725, -45.86195],
            [-23.22845, -45.85995],
            [-23.23035, -45.86128]
          ],
          fillOpacity: 0.12,
          weight: 2,
          popup:
            "Envelope demonstrativo de segurança ao redor da FATO/TLOF."
        }
      ]
    },
    {
      id: "desvios",
      category: "fase1",
      group: "Fase I",
      code: "T6",
      title: "Desvios de trajetória",
      shortTitle: "T6 Desvios",
      status: "Em andamento",
      progress: "40%",
      color: "#7b5fb2",
      active: true,
      summary:
        "Modelagem computacional em BlueSky/BADA-H e Monte Carlo para quantificar desvios laterais e verticais do eVTOL.",
      details: [
        "O relatório descreve cenários C1 a C4, incluindo vento calmo, vento de través, densidade-altitude elevada e aproximação perdida.",
        "Os resultados alimentam diretamente T4, T10 e T12.",
        "Os pontos e envelopes atuais são preliminares e representam a lógica do produto final."
      ],
      evidence: ["BlueSky", "BADA-H", "Monte Carlo", "GMM P95/P99"],
      nextSteps: [
        "Importar nuvens de trajetória reais como GeoJSON.",
        "Gerar seleção por cenário C1, C2, C3 e C4."
      ],
      features: [
        {
          type: "polyline",
          label: "Trajetória nominal",
          coords: [
            [-23.303, -45.965],
            [-23.27, -45.925],
            [-23.245, -45.895],
            [-23.2292, -45.8615]
          ],
          weight: 5,
          popup:
            "Trajetória nominal usada como eixo para simulações e comparação de desvios."
        },
        {
          type: "polyline",
          label: "Envelope P95 demonstrativo",
          coords: [
            [-23.298, -45.972],
            [-23.266, -45.932],
            [-23.24, -45.902],
            [-23.2245, -45.866]
          ],
          weight: 3,
          dashArray: "8 8",
          popup:
            "Linha demonstrativa do envelope P95. Substituir por saída estatística da simulação."
        },
        {
          type: "points",
          label: "Pontos de simulação",
          radius: 5,
          points: [
            {
              label: "Sim C1-01",
              coords: [-23.246, -45.898],
              popup: "Ponto de simulação C1."
            },
            {
              label: "Sim C1-02",
              coords: [-23.239, -45.887],
              popup: "Ponto de simulação C1."
            },
            {
              label: "Sim C2-01",
              coords: [-23.234, -45.878],
              popup: "Ponto de simulação C2."
            },
            {
              label: "Sim C2-02",
              coords: [-23.228, -45.868],
              popup: "Ponto de simulação C2."
            }
          ]
        }
      ]
    },
    {
      id: "ruido",
      category: "fase1",
      group: "Fase I",
      code: "T10",
      title: "Ruído aeronáutico",
      shortTitle: "T10 Ruído",
      status: "Em andamento",
      progress: "20%",
      color: "#b94b45",
      active: false,
      summary:
        "Modelagem acústica de eVTOL multirotor em ambiente urbano para subsidiar recomendações operacionais à ANAC.",
      details: [
        "O relatório descreve uso do NoiseModelling e parâmetros de potência sonora por banda de oitava.",
        "A etapa atual prepara o pipeline para mapas de distribuição de ruído sobre São José dos Campos.",
        "A camada atual usa anéis demonstrativos para organizar receptores e zonas de atenção."
      ],
      evidence: ["NoiseModelling", "ISO 9613-2", "OPPAV/KARI", "LW por banda"],
      nextSteps: [
        "Adicionar mapa de ruído exportado do NoiseModelling.",
        "Cadastrar receptores e decibelímetros planejados para a Fase II."
      ],
      features: [
        {
          type: "circle",
          label: "Ruído - faixa próxima",
          center: [-23.2292, -45.8615],
          radius: 1200,
          fillOpacity: 0.16,
          weight: 2,
          popup:
            "Anel inicial para discutir propagação sonora em cenário simplificado."
        },
        {
          type: "circle",
          label: "Ruído - área de avaliação",
          center: [-23.2292, -45.8615],
          radius: 3200,
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 6",
          popup:
            "Área de avaliação a ser substituída por saída do NoiseModelling."
        }
      ]
    },
    {
      id: "zonas-protecao",
      category: "riscos",
      group: "Fase I",
      code: "T12",
      title: "Zonas de proteção",
      shortTitle: "T12 Proteção",
      status: "Em andamento",
      progress: "10%",
      color: "#e05b2a",
      active: true,
      summary:
        "Estudo baseado nos resultados de trajetória e critérios de risco para definir zonas de proteção do vertiporto.",
      details: [
        "Traduz simulação, geometria e regulação em áreas de proteção para o entorno do vertiporto.",
        "As zonas atuais são demonstrativas e devem evoluir com os envelopes probabilísticos da T6.",
        "A bibliografia do relatório cruza FAA, CASA, DECEA, EASA e JCAB."
      ],
      evidence: ["FAA EB 105A", "CASA Guide to Vertiport Design", "ICA 11-408", "EASA PTS-VPT-DSN"],
      nextSteps: [
        "Gerar superfícies oficiais a partir dos critérios selecionados.",
        "Cruzar zonas com obstáculos, topografia e ocupação urbana.",
        "Associar cada zona ao requisito regulatório correspondente."
      ],
      features: [
        {
          type: "polygon",
          label: "Zona de proteção principal",
          coords: [
            [-23.2309, -45.8642],
            [-23.2269, -45.8614],
            [-23.198, -45.8875],
            [-23.201, -45.8935]
          ],
          fillOpacity: 0.16,
          weight: 3,
          popup:
            "Superfície demonstrativa de proteção. Será substituída por geometria calculada."
        },
        {
          type: "polygon",
          label: "Zona de proteção complementar",
          coords: [
            [-23.2272, -45.8595],
            [-23.2311, -45.8622],
            [-23.257, -45.835],
            [-23.2525, -45.829]
          ],
          fillOpacity: 0.13,
          weight: 3,
          popup:
            "Superfície complementar para discussão de aproximação/decolagem."
        },
        {
          type: "polygon",
          label: "Área crítica de implantação",
          coords: [
            [-23.22965, -45.8631],
            [-23.22755, -45.8618],
            [-23.22855, -45.86025],
            [-23.23055, -45.86145]
          ],
          fillOpacity: 0.26,
          weight: 2,
          popup:
            "Área crítica onde geometria, trajetórias e proteção precisam convergir."
        }
      ]
    }
  ]
};
