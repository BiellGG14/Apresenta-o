(function () {
  const config = window.SANDBOX_MAP_CONFIG;
  const mapElement = document.getElementById("map");

  if (!mapElement || !config || typeof L === "undefined") {
    return;
  }

  const layers = config.layers;
  const activeLayerIds = new Set();
  const layerGroups = new Map();
  const layerLoadState = new Map();
  const renderableFileTypes = new Set(["geojson", "kml", "kmz", "statelog"]);
  const expectedFileLoads = new Map(
    layers.map((layer) => [
      layer.id,
      layer.features.filter((feature) => renderableFileTypes.has(feature.type)).length
    ])
  );
  let selectedLayerId = "zonas-protecao";
  let currentFilter = "all";
  let activeBaseLayerId = "light";

  const map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: true
  }).setView(config.center, config.zoom);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  const lightBase = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,
      attribution:
        '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  );

  const osmBase = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  });

  const satelliteBase = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri"
    }
  );

  const baseLayers = {
    light: {
      label: "clara",
      layer: lightBase
    },
    osm: {
      label: "OSM",
      layer: osmBase
    },
    satellite: {
      label: "satélite",
      layer: satelliteBase
    }
  };

  lightBase.addTo(map);

  const categoryLabels = {
    all: "Todas",
    ambiente: "Ambiente",
    fase1: "Fase I",
    riscos: "Proteção",
    superficies: "Superfícies",
    simulacao: "Simulação"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateBaseControls() {
    document.querySelectorAll("[data-base-layer]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.baseLayer === activeBaseLayerId);
    });

    const selectedBaseName = document.getElementById("selected-base-name");

    if (selectedBaseName) {
      selectedBaseName.textContent = `Base: ${baseLayers[activeBaseLayerId].label}`;
    }
  }

  function setBaseLayer(layerId) {
    const nextBase = baseLayers[layerId];

    if (!nextBase || activeBaseLayerId === layerId) {
      return;
    }

    Object.values(baseLayers).forEach((base) => {
      if (map.hasLayer(base.layer)) {
        map.removeLayer(base.layer);
      }
    });

    nextBase.layer.addTo(map);
    activeBaseLayerId = layerId;
    updateBaseControls();
    window.setTimeout(() => map.invalidateSize(), 120);
  }

  function popupContent(layer, feature) {
    const text = feature.popup || layer.summary;
    return `<strong>${escapeHtml(feature.label || layer.title)}</strong><br>${escapeHtml(text)}`;
  }

  function featureStyle(layer, feature) {
    return {
      color: feature.color || layer.color,
      fillColor: feature.fillColor || layer.color,
      fillOpacity: feature.fillOpacity ?? 0.14,
      opacity: 0.95,
      weight: feature.weight || 2,
      dashArray: feature.dashArray || null
    };
  }

  function bindFeature(leafletLayer, layer, feature) {
    leafletLayer.bindPopup(popupContent(layer, feature));
    leafletLayer.on("click", () => selectLayer(layer.id, false));
    return leafletLayer;
  }

  function geoJsonPopupContent(layer, featureConfig, geoFeature) {
    const properties = geoFeature.properties || {};
    const name = properties.name || featureConfig.label || layer.title;
    const dataset = properties.dataset || featureConfig.label || layer.shortTitle;
    const folderPath = Array.isArray(properties.folderPath) && properties.folderPath.length
      ? `<br><small>${escapeHtml(properties.folderPath.join(" / "))}</small>`
      : "";
    const description = properties.description
      ? `<br><small>${escapeHtml(properties.description)}</small>`
      : "";
    const stats =
      properties.durationSeconds || properties.maxAltitude || properties.maxGroundSpeed
        ? `<br><small>${[
            properties.durationSeconds ? `${properties.durationSeconds}s` : "",
            properties.maxAltitude ? `alt máx ${properties.maxAltitude} m` : "",
            properties.maxGroundSpeed ? `GS máx ${properties.maxGroundSpeed}` : ""
          ]
            .filter(Boolean)
            .map(escapeHtml)
            .join(" · ")}</small>`
        : "";

    return `<strong>${escapeHtml(name)}</strong><br>${escapeHtml(dataset)}${folderPath}${description}${stats}`;
  }

  function geoJsonStyle(layer, featureConfig, geoFeature) {
    const geometryType = geoFeature.geometry?.type || "";

    return {
      color: featureConfig.color || layer.color,
      fillColor: featureConfig.fillColor || featureConfig.color || layer.color,
      fillOpacity: featureConfig.fillOpacity ?? (geometryType.includes("Polygon") ? 0.16 : 0.5),
      opacity: 0.92,
      weight: featureConfig.weight || (geometryType.includes("Line") ? 3 : 2),
      dashArray: featureConfig.dashArray || null
    };
  }

  function nodeLocalName(node) {
    return node?.localName || node?.nodeName?.split(":").pop() || "";
  }

  function childElements(node, name) {
    return Array.from(node?.children || []).filter(
      (child) => !name || nodeLocalName(child) === name
    );
  }

  function firstChildElement(node, name) {
    return childElements(node, name)[0] || null;
  }

  function descendantsByName(node, name) {
    return Array.from(node?.getElementsByTagName("*") || []).filter(
      (child) => nodeLocalName(child) === name
    );
  }

  function directKmlText(node, name) {
    return firstChildElement(node, name)?.textContent?.trim() || "";
  }

  function cleanKmlText(value) {
    return String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseCoordinateText(value) {
    return String(value || "")
      .trim()
      .split(/\s+/)
      .map((item) => {
        const [lon, lat] = item.split(",").map(Number);
        return Number.isFinite(lon) && Number.isFinite(lat) ? [lon, lat] : null;
      })
      .filter(Boolean);
  }

  function coordinatesFromNode(node) {
    return parseCoordinateText(descendantsByName(node, "coordinates")[0]?.textContent || "");
  }

  function closeRing(coords) {
    if (!coords.length) {
      return coords;
    }

    const first = coords[0];
    const last = coords[coords.length - 1];

    if (first[0] === last[0] && first[1] === last[1]) {
      return coords;
    }

    return [...coords, first];
  }

  function parseKmlGeometryNode(node) {
    const type = nodeLocalName(node);

    if (type === "Point") {
      const coords = coordinatesFromNode(node);
      return coords.length ? { type: "Point", coordinates: coords[0] } : null;
    }

    if (type === "LineString" || type === "LinearRing") {
      const coords = coordinatesFromNode(node);
      return coords.length > 1 ? { type: "LineString", coordinates: coords } : null;
    }

    if (type === "Polygon") {
      const outerBoundary = descendantsByName(node, "outerBoundaryIs")[0];
      const outerRing = outerBoundary ? descendantsByName(outerBoundary, "LinearRing")[0] : null;
      const outer = closeRing(coordinatesFromNode(outerRing));

      if (outer.length < 4) {
        return null;
      }

      const innerRings = descendantsByName(node, "innerBoundaryIs")
        .map((boundary) => descendantsByName(boundary, "LinearRing")[0])
        .map((ring) => closeRing(coordinatesFromNode(ring)))
        .filter((ring) => ring.length >= 4);

      return { type: "Polygon", coordinates: [outer, ...innerRings] };
    }

    if (type === "MultiGeometry") {
      const geometries = childElements(node)
        .map((child) => parseKmlGeometryNode(child))
        .filter(Boolean);

      if (geometries.length === 1) {
        return geometries[0];
      }

      return geometries.length ? { type: "GeometryCollection", geometries } : null;
    }

    return null;
  }

  function geometryFromPlacemark(placemark) {
    const geometryNames = new Set(["Point", "LineString", "Polygon", "MultiGeometry"]);
    const directGeometries = Array.from(placemark.children || []).filter((child) =>
      geometryNames.has(nodeLocalName(child))
    );
    const geometryNodes = directGeometries.length
      ? directGeometries
      : descendantsByName(placemark, "MultiGeometry")
          .concat(descendantsByName(placemark, "Polygon"))
          .concat(descendantsByName(placemark, "LineString"))
          .concat(descendantsByName(placemark, "Point"));

    const geometries = geometryNodes
      .filter((node, index, nodes) => nodes.indexOf(node) === index)
      .map((node) => parseKmlGeometryNode(node))
      .filter(Boolean);

    if (geometries.length === 1) {
      return geometries[0];
    }

    return geometries.length ? { type: "GeometryCollection", geometries } : null;
  }

  function folderPathFromPlacemark(placemark) {
    const folders = [];
    let parent = placemark.parentElement;

    while (parent) {
      if (nodeLocalName(parent) === "Folder") {
        const name = directKmlText(parent, "name");

        if (name) {
          folders.unshift(name);
        }
      }

      parent = parent.parentElement;
    }

    return folders;
  }

  function coordinatePairs(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      return [[value[0], value[1]]];
    }

    return value.flatMap((item) => coordinatePairs(item));
  }

  function geometryIntersectsBbox(geometry, bbox) {
    if (!bbox || !geometry) {
      return true;
    }

    if (geometry.type === "GeometryCollection") {
      return geometry.geometries.some((item) => geometryIntersectsBbox(item, bbox));
    }

    const [minLon, minLat, maxLon, maxLat] = bbox;

    return coordinatePairs(geometry.coordinates).some(
      ([lon, lat]) => minLon <= lon && lon <= maxLon && minLat <= lat && lat <= maxLat
    );
  }

  function kmlTextToGeoJson(kmlText, layer, featureConfig) {
    const xml = new DOMParser().parseFromString(kmlText, "application/xml");

    if (descendantsByName(xml, "parsererror").length) {
      throw new Error(`KML inválido em ${featureConfig.url}`);
    }

    const placemarks = descendantsByName(xml, "Placemark");
    const features = placemarks
      .map((placemark) => {
        const geometry = geometryFromPlacemark(placemark);

        if (!geometry) {
          return null;
        }

        if (!geometryIntersectsBbox(geometry, featureConfig.bbox)) {
          return null;
        }

        const name = directKmlText(placemark, "name") || featureConfig.label || layer.title;
        const description = cleanKmlText(directKmlText(placemark, "description"));

        return {
          type: "Feature",
          properties: {
            name,
            description,
            dataset: featureConfig.label || layer.shortTitle,
            folderPath: folderPathFromPlacemark(placemark),
            source: featureConfig.url
          },
          geometry
        };
      })
      .filter(Boolean);

    return { type: "FeatureCollection", features };
  }

  function sampleCoordinates(points, maxPoints) {
    if (points.length <= maxPoints) {
      return points;
    }

    const step = Math.ceil(points.length / maxPoints);
    const sampled = points.filter((_, index) => index % step === 0);
    const last = points[points.length - 1];

    if (sampled[sampled.length - 1] !== last) {
      sampled.push(last);
    }

    return sampled;
  }

  function stateLogToGeoJson(logText, layer, featureConfig) {
    const rows = [];
    let lastCoordKey = "";

    logText.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      const parts = trimmed.split(",").map((part) => part.trim());

      if (parts.length < 9) {
        return;
      }

      const simt = Number(parts[0]);
      const id = parts[1];
      const lat = Number(parts[2]);
      const lon = Number(parts[3]);
      const dist = Number(parts[4]);
      const alt = Number(parts[5]);
      const gs = Number(parts[8]);

      if (![simt, lat, lon].every(Number.isFinite)) {
        return;
      }

      const coordKey = `${lat.toFixed(8)},${lon.toFixed(8)}`;

      if (coordKey === lastCoordKey) {
        return;
      }

      lastCoordKey = coordKey;
      rows.push({
        simt,
        id,
        lat,
        lon,
        dist: Number.isFinite(dist) ? dist : null,
        alt: Number.isFinite(alt) ? alt : null,
        gs: Number.isFinite(gs) ? gs : null
      });
    });

    if (!rows.length) {
      return { type: "FeatureCollection", features: [] };
    }

    const sampledRows = sampleCoordinates(rows, featureConfig.maxPoints || 5000);
    const coordinates = sampledRows.map((row) => [row.lon, row.lat]);
    const start = rows[0];
    const end = rows[rows.length - 1];
    const maxAlt = Math.max(...rows.map((row) => row.alt || 0));
    const maxGs = Math.max(...rows.map((row) => row.gs || 0));
    const duration = end.simt - start.simt;
    const commonProperties = {
      dataset: featureConfig.label || layer.shortTitle,
      source: featureConfig.url,
      aircraft: start.id,
      samples: rows.length,
      renderedSamples: sampledRows.length,
      durationSeconds: Number.isFinite(duration) ? Math.round(duration) : null,
      maxAltitude: Number.isFinite(maxAlt) ? Math.round(maxAlt) : null,
      maxGroundSpeed: Number.isFinite(maxGs) ? Math.round(maxGs) : null
    };

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            ...commonProperties,
            name: `${featureConfig.label || layer.title} · trajetória`,
            description: `${rows.length} pontos únicos; ${sampledRows.length} desenhados no mapa.`
          },
          geometry: {
            type: "LineString",
            coordinates
          }
        },
        {
          type: "Feature",
          properties: {
            ...commonProperties,
            name: `${featureConfig.label || layer.title} · início`,
            kind: "start",
            description: `t=${Math.round(start.simt)}s`
          },
          geometry: {
            type: "Point",
            coordinates: [start.lon, start.lat]
          }
        },
        {
          type: "Feature",
          properties: {
            ...commonProperties,
            name: `${featureConfig.label || layer.title} · fim`,
            kind: "end",
            description: `t=${Math.round(end.simt)}s`
          },
          geometry: {
            type: "Point",
            coordinates: [end.lon, end.lat]
          }
        }
      ]
    };
  }

  async function fetchTextFile(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Falha ao carregar ${url}`);
    }

    return response.text();
  }

  async function loadKmzText(url) {
    if (typeof JSZip === "undefined") {
      throw new Error("JSZip não foi carregado para abrir KMZ.");
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Falha ao carregar ${url}`);
    }

    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const kmlFile = Object.values(zip.files).find(
      (file) => !file.dir && file.name.toLowerCase().endsWith(".kml")
    );

    if (!kmlFile) {
      throw new Error(`KMZ sem KML interno: ${url}`);
    }

    return kmlFile.async("text");
  }

  async function loadFeatureData(layer, feature) {
    if (feature.type === "geojson") {
      const response = await fetch(feature.url);

      if (!response.ok) {
        throw new Error(`Falha ao carregar ${feature.url}`);
      }

      return response.json();
    }

    if (feature.type === "kml") {
      return kmlTextToGeoJson(await fetchTextFile(feature.url), layer, feature);
    }

    if (feature.type === "kmz") {
      return kmlTextToGeoJson(await loadKmzText(feature.url), layer, feature);
    }

    if (feature.type === "statelog") {
      return stateLogToGeoJson(await fetchTextFile(feature.url), layer, feature);
    }

    return null;
  }

  function updateLayerLoadState(layerId, state) {
    const expected = expectedFileLoads.get(layerId) || 0;
    const current = layerLoadState.get(layerId) || {
      expected,
      loaded: 0,
      errors: 0,
      started: 0,
      state: "idle",
      message: expected ? `carregando 0/${expected}` : "sem arquivo"
    };

    current.expected = expected;

    if (state === "loading") {
      current.started = Math.min(expected, current.started + 1);
    }

    if (state === "loaded") {
      current.loaded = Math.min(expected, current.loaded + 1);
    }

    if (state === "error") {
      current.errors = Math.min(expected, current.errors + 1);
    }

    const finished = current.loaded + current.errors;

    if (current.errors && finished >= expected) {
      current.state = "error";
      current.message = `erro em ${current.errors}/${expected}`;
    } else if (finished >= expected) {
      current.state = "loaded";
      current.message = `carregado ${current.loaded}/${expected}`;
    } else {
      current.state = "loading";
      current.message = `carregando ${finished}/${expected}`;
    }

    layerLoadState.set(layerId, current);
    renderLayerList();
    updateStatus();
  }

  function buildFeature(layer, feature) {
    const style = featureStyle(layer, feature);

    if (feature.type === "polygon") {
      return bindFeature(L.polygon(feature.coords, style), layer, feature);
    }

    if (feature.type === "polyline") {
      return bindFeature(L.polyline(feature.coords, style), layer, feature);
    }

    if (feature.type === "circle") {
      return bindFeature(L.circle(feature.center, { ...style, radius: feature.radius }), layer, feature);
    }

    if (feature.type === "marker") {
      return bindFeature(
        L.circleMarker(feature.coords, {
          radius: feature.radius || 8,
          color: "#ffffff",
          weight: 2,
          fillColor: feature.fillColor || layer.color,
          fillOpacity: 1
        }),
        layer,
        feature
      );
    }

    if (feature.type === "points") {
      return feature.points.map((point) =>
        bindFeature(
          L.circleMarker(point.coords, {
            radius: feature.radius || 6,
            color: "#ffffff",
            weight: 1.5,
            fillColor: point.color || layer.color,
            fillOpacity: 0.92
          }),
          layer,
          {
            label: point.label || feature.label,
            popup: point.popup || feature.popup
          }
        )
      );
    }

    if (renderableFileTypes.has(feature.type)) {
      const group = L.layerGroup();
      updateLayerLoadState(layer.id, "loading");
      loadFeatureData(layer, feature)
        .then((data) => {
          const geoJsonLayer = L.geoJSON(data, {
            style: (geoFeature) => geoJsonStyle(layer, feature, geoFeature),
            pointToLayer: (geoFeature, latlng) => {
              const kind = geoFeature.properties?.kind;
              const isEndpoint = kind === "start" || kind === "end";

              return L.circleMarker(latlng, {
                radius: isEndpoint ? feature.endpointRadius || 7 : feature.radius || 5,
                color: "#ffffff",
                weight: isEndpoint ? 2 : 1.2,
                fillColor:
                  kind === "start"
                    ? feature.startColor || feature.fillColor || feature.color || layer.color
                    : kind === "end"
                      ? feature.endColor || feature.fillColor || feature.color || layer.color
                      : feature.fillColor || feature.color || layer.color,
                fillOpacity: feature.fillOpacity ?? 0.86
              });
            },
            onEachFeature: (geoFeature, leafletLayer) => {
              leafletLayer.bindPopup(geoJsonPopupContent(layer, feature, geoFeature));
              leafletLayer.on("click", () => selectLayer(layer.id, false));
            }
          });

          geoJsonLayer.addTo(group);
          updateLayerLoadState(layer.id, "loaded");

          if (selectedLayerId === layer.id && activeLayerIds.has(layer.id)) {
            focusLayer(layer.id);
          }
        })
        .catch((error) => {
          console.warn(error);
          updateLayerLoadState(layer.id, "error");
        });

      return group;
    }

    return null;
  }

  function makeLayerGroup(layer) {
    const group = L.layerGroup();

    layer.features.forEach((feature) => {
      const created = buildFeature(layer, feature);

      if (Array.isArray(created)) {
        created.forEach((item) => item && item.addTo(group));
      } else if (created) {
        created.addTo(group);
      }
    });

    return group;
  }

  function getLayerGroup(layerId) {
    const layer = layers.find((item) => item.id === layerId);

    if (!layer) {
      return null;
    }

    if (!layerGroups.has(layerId)) {
      layerGroups.set(layerId, makeLayerGroup(layer));
    }

    return layerGroups.get(layerId);
  }

  function showLayer(layerId) {
    const group = getLayerGroup(layerId);

    if (!group || activeLayerIds.has(layerId)) {
      return;
    }

    group.addTo(map);
    activeLayerIds.add(layerId);
  }

  function hideLayer(layerId) {
    const group = getLayerGroup(layerId);

    if (!group || !activeLayerIds.has(layerId)) {
      return;
    }

    map.removeLayer(group);
    activeLayerIds.delete(layerId);
  }

  function getBoundsForLayer(layerId) {
    const group = getLayerGroup(layerId);
    const bounds = L.latLngBounds();

    if (!group) {
      return null;
    }

    function extendBounds(item) {
      if (typeof item.getBounds === "function") {
        bounds.extend(item.getBounds());
      } else if (typeof item.getLatLng === "function") {
        bounds.extend(item.getLatLng());
      } else if (typeof item.eachLayer === "function") {
        item.eachLayer((child) => extendBounds(child));
      }
    }

    group.eachLayer((item) => extendBounds(item));

    return bounds.isValid() ? bounds : null;
  }

  function focusLayer(layerId) {
    const bounds = getBoundsForLayer(layerId);

    if (bounds) {
      map.fitBounds(bounds.pad(0.28), {
        maxZoom: config.focusZoom || 15,
        animate: true
      });
    }
  }

  function selectLayer(layerId, shouldFocus) {
    const layer = layers.find((item) => item.id === layerId);

    if (!layer) {
      return;
    }

    selectedLayerId = layerId;
    showLayer(layerId);

    if (window.location.hash !== `#${layerId}`) {
      history.replaceState(null, "", `#${layerId}`);
    }

    if (shouldFocus) {
      focusLayer(layerId);
    }

    renderDetails(layer);
    renderLayerList();
    updateStatus();
  }

  function statusClass(progress) {
    const numeric = Number.parseInt(progress, 10);

    if (Number.isNaN(numeric)) {
      return "";
    }

    if (numeric < 15) {
      return "low";
    }

    if (numeric < 30) {
      return "warn";
    }

    return "";
  }

  function progressWidth(progress) {
    return progress.includes("%") ? progress : "100%";
  }

  function renderList(items) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderDetails(layer) {
    const details = document.getElementById("layer-details");

    if (!details) {
      return;
    }

    details.innerHTML = `
      <div class="details-header">
        <span class="status-pill">${escapeHtml(layer.group)} · ${escapeHtml(layer.code)}</span>
        <h2>${escapeHtml(layer.title)}</h2>
        <p>${escapeHtml(layer.summary)}</p>
        <div class="details-meta">
          <span class="data-pill">${escapeHtml(layer.status)}</span>
          <span class="data-pill">${escapeHtml(layer.progress)}</span>
          <span class="data-pill">${escapeHtml(categoryLabels[layer.category] || layer.category)}</span>
        </div>
      </div>
      <div class="details-body">
        <div class="detail-block">
          <h3>Leitura técnica</h3>
          ${renderList(layer.details)}
        </div>
        <div class="detail-block">
          <h3>Evidências</h3>
          ${renderList(layer.evidence)}
        </div>
        <div class="detail-block">
          <h3>Próximos dados</h3>
          ${renderList(layer.nextSteps)}
        </div>
        <button class="primary" type="button" data-focus-current="${escapeHtml(layer.id)}">Centralizar camada</button>
      </div>
    `;

    const focusButton = details.querySelector("[data-focus-current]");
    focusButton?.addEventListener("click", () => focusLayer(layer.id));
  }

  function renderLayerList() {
    const list = document.getElementById("layer-list");

    if (!list) {
      return;
    }

    const visibleLayers =
      currentFilter === "all"
        ? layers
        : layers.filter((layer) => layer.category === currentFilter);

    list.innerHTML = visibleLayers
      .map((layer) => {
        const checked = activeLayerIds.has(layer.id) ? "checked" : "";
        const selected = selectedLayerId === layer.id ? " is-selected" : "";
        const loadState = layerLoadState.get(layer.id);
        const loadText = loadState?.message ? ` · ${loadState.message}` : "";

        return `
          <article class="layer-card${selected}" data-layer-card="${escapeHtml(layer.id)}">
            <input type="checkbox" ${checked} aria-label="Ativar ${escapeHtml(layer.title)}" data-toggle-layer="${escapeHtml(layer.id)}">
            <div>
              <h3><span class="layer-color" style="background:${escapeHtml(layer.color)}"></span>${escapeHtml(layer.shortTitle)}</h3>
              <p>${escapeHtml(layer.code)} · ${escapeHtml(layer.status)} · ${escapeHtml(layer.progress)}${escapeHtml(loadText)}</p>
              <button type="button" data-focus-layer="${escapeHtml(layer.id)}">Ver no mapa</button>
            </div>
          </article>
        `;
      })
      .join("");

    list.querySelectorAll("[data-toggle-layer]").forEach((input) => {
      input.addEventListener("change", (event) => {
        const layerId = event.currentTarget.dataset.toggleLayer;

        if (event.currentTarget.checked) {
          showLayer(layerId);
          selectedLayerId = layerId;
          renderDetails(layers.find((layer) => layer.id === layerId));
        } else {
          hideLayer(layerId);
        }

        renderLayerList();
        updateStatus();
      });
    });

    list.querySelectorAll("[data-focus-layer]").forEach((button) => {
      button.addEventListener("click", (event) => {
        selectLayer(event.currentTarget.dataset.focusLayer, true);
      });
    });

    list.querySelectorAll("[data-layer-card]").forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.matches("input, button")) {
          return;
        }

        selectLayer(card.dataset.layerCard, false);
      });
    });
  }

  function renderFilters() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === currentFilter);
    });
  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      renderFilters();
      renderLayerList();
    });
  });

  document.querySelectorAll("[data-base-layer]").forEach((button) => {
    button.addEventListener("click", () => setBaseLayer(button.dataset.baseLayer));
  });

  const mapStageElement = document.querySelector(".map-stage");
  const fullscreenButton = document.getElementById("map-fullscreen");

  fullscreenButton?.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement === mapStageElement) {
        await document.exitFullscreen();
      } else {
        await mapStageElement?.requestFullscreen();
      }
    } catch (error) {
      console.warn(error);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (fullscreenButton) {
      fullscreenButton.textContent =
        document.fullscreenElement === mapStageElement ? "Sair da tela cheia" : "Tela cheia";
    }

    window.setTimeout(() => map.invalidateSize(), 180);
  });

  function updateStatus() {
    const activeCount = document.getElementById("active-count");
    const selectedName = document.getElementById("selected-layer-name");
    const loadState = document.getElementById("map-load-state");
    const selectedBaseName = document.getElementById("selected-base-name");
    const selected = layers.find((layer) => layer.id === selectedLayerId);

    if (activeCount) {
      activeCount.textContent = `${activeLayerIds.size}/${layers.length} camadas ativas`;
    }

    if (selectedName && selected) {
      selectedName.textContent = `Foco: ${selected.shortTitle}`;
    }

    if (loadState) {
      const selectedState = layerLoadState.get(selectedLayerId);
      loadState.textContent = selectedState?.message
        ? `Dados: ${selectedState.message}`
        : "Dados: aguardando";
    }

    if (selectedBaseName) {
      selectedBaseName.textContent = `Base: ${baseLayers[activeBaseLayerId].label}`;
    }
  }

  function selectedFromHash() {
    const hash = window.location.hash.replace("#", "");
    return layers.some((layer) => layer.id === hash) ? hash : selectedLayerId;
  }

  document.getElementById("enable-all")?.addEventListener("click", () => {
    layers.forEach((layer) => showLayer(layer.id));
    renderLayerList();
    updateStatus();
  });

  document.getElementById("clear-layers")?.addEventListener("click", () => {
    layers.forEach((layer) => hideLayer(layer.id));
    selectLayer("zonas-protecao", true);
  });

  document.getElementById("focus-sbsj")?.addEventListener("click", () => {
    map.setView(config.center, config.zoom, { animate: true });
  });

  document.querySelectorAll("[data-story-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      selectLayer(button.dataset.storyLayer, true);
    });
  });

  layers.forEach((layer) => {
    if (layer.active) {
      showLayer(layer.id);
    }
  });

  selectedLayerId = selectedFromHash();
  showLayer(selectedLayerId);
  renderFilters();
  renderLayerList();
  renderDetails(layers.find((layer) => layer.id === selectedLayerId) || layers[0]);
  focusLayer(selectedLayerId);
  updateBaseControls();
  updateStatus();

  window.addEventListener("hashchange", () => {
    selectLayer(selectedFromHash(), true);
  });

  window.setTimeout(() => map.invalidateSize(), 150);
})();
