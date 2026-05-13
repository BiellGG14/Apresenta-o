const mapElement = document.getElementById('map');

if (mapElement) {
  const sbsjCoordinates = [-23.2276, -45.8614];
  const map = L.map('map').setView(sbsjCoordinates, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const aeroporto = L.marker(sbsjCoordinates).bindPopup('Aeroporto de São José dos Campos (SBSJ)');

  const areaOperacional = L.polygon([
    [-23.245, -45.88],
    [-23.205, -45.88],
    [-23.205, -45.84],
    [-23.245, -45.84]
  ], {
    color: '#1d4e89',
    fillOpacity: 0.2
  }).bindPopup('Área de análise operacional');

  const ruido = L.circle(sbsjCoordinates, {
    radius: 4000,
    color: '#b02a37',
    fillColor: '#b02a37',
    fillOpacity: 0.15
  }).bindPopup('Área estimada de influência de ruído aeronáutico');

  const desvios = L.polyline([
    sbsjCoordinates,
    [-23.21, -45.9],
    [-23.19, -45.95]
  ], {
    color: '#2d6a4f',
    weight: 3,
    dashArray: '8,6'
  }).bindPopup('Exemplo de desvio de trajetória');

  const overlays = {
    'Localização do SBSJ': aeroporto,
    'Topografia/área sensível': areaOperacional,
    'Ruído aeronáutico': ruido,
    'Desvio de trajetória': desvios
  };

  aeroporto.addTo(map);
  areaOperacional.addTo(map);
  ruido.addTo(map);
  desvios.addTo(map);

  L.control.layers({}, overlays).addTo(map);
}
