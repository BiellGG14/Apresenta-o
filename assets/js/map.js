(function () {
  const config = window.SANDBOX_MAP_CONFIG;
  const mapElement = document.getElementById("map");

  if (!mapElement || !config || typeof L === "undefined") {
    return;
  }

  const layers = config.layers;
  const activeLayerIds = new Set();
  const layerGroups = new Map();
  let selectedLayerId = "zonas-protecao";
  let currentFilter = "all";

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
  ).addTo(map);

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

  L.control.layers(
    {
      "Base clara": lightBase,
      OpenStreetMap: osmBase,
      "Satélite": satelliteBase
    },
    {},
    { position: "topright" }
  ).addTo(map);

  const categoryLabels = {
    all: "Todas",
    ambiente: "Ambiente",
    fase1: "Fase I",
    riscos: "Proteção"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

    group.eachLayer((item) => {
      if (typeof item.getBounds === "function") {
        bounds.extend(item.getBounds());
      } else if (typeof item.getLatLng === "function") {
        bounds.extend(item.getLatLng());
      }
    });

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
        const progressClass = statusClass(layer.progress);
        const width = progressWidth(layer.progress);

        return `
          <article class="layer-card${selected}" data-layer-card="${escapeHtml(layer.id)}">
            <input type="checkbox" ${checked} aria-label="Ativar ${escapeHtml(layer.title)}" data-toggle-layer="${escapeHtml(layer.id)}">
            <div>
              <h3><span class="layer-color" style="background:${escapeHtml(layer.color)}"></span>${escapeHtml(layer.shortTitle)}</h3>
              <p>${escapeHtml(layer.code)} · ${escapeHtml(layer.status)} · ${escapeHtml(layer.progress)}</p>
              <div class="progress-bar ${progressClass}"><span style="width:${escapeHtml(width)}"></span></div>
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

  function updateStatus() {
    const activeCount = document.getElementById("active-count");
    const selectedName = document.getElementById("selected-layer-name");
    const selected = layers.find((layer) => layer.id === selectedLayerId);

    if (activeCount) {
      activeCount.textContent = `${activeLayerIds.size}/${layers.length} camadas ativas`;
    }

    if (selectedName && selected) {
      selectedName.textContent = `Foco: ${selected.shortTitle}`;
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
  updateStatus();

  window.addEventListener("hashchange", () => {
    selectLayer(selectedFromHash(), true);
  });

  window.setTimeout(() => map.invalidateSize(), 150);
})();
