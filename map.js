// map.js – Leaflet map logic for index.html
// Requires: activeDest, currentLat, currentLon, getDistance() from index.html
// Requires: Leaflet already loaded, DOM elements from index.html present

(function () {

  // ── State ────────────────────────────────────────────────────
  let leafletMap = null;
  let myMarker = null;
  let targetMarker = null;
  let luftlinie = null;
  let currentLayer = 'satellite';

  // ── Tile layers ──────────────────────────────────────────────
  const tileLayers = {
    satellite: L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
    ),
    street: L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
    ),
    topo: L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenTopoMap', maxZoom: 17 }
    )
  };

  // ── Marker icons ─────────────────────────────────────────────
  const blueIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#3498db;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const redIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#e74c3c;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  // ── Helpers ──────────────────────────────────────────────────
  function myLat() { return (typeof currentLat !== 'undefined' && currentLat !== null) ? currentLat : activeDest.lat + 0.02; }
  function myLon() { return (typeof currentLon !== 'undefined' && currentLon !== null) ? currentLon : activeDest.lon + 0.02; }

  // ── Init map ─────────────────────────────────────────────────
  function initMap() {
    if (leafletMap || !activeDest) return;

    const centerLat = (myLat() + activeDest.lat) / 2;
    const centerLon = (myLon() + activeDest.lon) / 2;

    leafletMap = L.map('leaflet-map', { zoomControl: true }).setView([centerLat, centerLon], 14);
    tileLayers.satellite.addTo(leafletMap);

    // Destination marker
    targetMarker = L.marker([activeDest.lat, activeDest.lon], { icon: redIcon })
      .addTo(leafletMap)
      .bindPopup('<b>' + activeDest.name + '</b><br>' + activeDest.lat.toFixed(5) + ', ' + activeDest.lon.toFixed(5));

    // My position marker
    myMarker = L.marker([myLat(), myLon()], { icon: blueIcon })
      .addTo(leafletMap)
      .bindPopup(currentLat !== null ? '<b>Moje poloha</b>' : '<b>Moje poloha</b><br>(Demo)');

    // Straight line between positions
    luftlinie = L.polyline(
      [[myLat(), myLon()], [activeDest.lat, activeDest.lon]],
      { color: '#e74c3c', weight: 2.5, dashArray: '7, 6', opacity: 0.9 }
    ).addTo(leafletMap);

    fitMap();
  }

  function fitMap() {
    if (!leafletMap || !activeDest) return;
    leafletMap.fitBounds(
      L.latLngBounds([[myLat(), myLon()], [activeDest.lat, activeDest.lon]]).pad(0.25)
    );
  }

  // ── Update marker position (called from index.html on each new GPS fix) ──
  window.updateMyMarker = function () {
    if (!leafletMap || currentLat === null || !activeDest) return;
    myMarker.setLatLng([currentLat, currentLon]);
    luftlinie.setLatLngs([[currentLat, currentLon], [activeDest.lat, activeDest.lon]]);
    const dist = getDistance(currentLat, currentLon, activeDest.lat, activeDest.lon);
    myMarker.setPopupContent(
      '<b>Moje poloha</b><br>' +
      currentLat.toFixed(5) + ', ' + currentLon.toFixed(5) +
      '<br>Vzdálenost: ' + (dist >= 1000 ? (dist / 1000).toFixed(2) + ' km' : dist.toFixed(0) + ' m')
    );
  };

  // ── Layer toggle ─────────────────────────────────────────────
  window.setLayer = function (name) {
    if (!leafletMap || name === currentLayer) return;
    tileLayers[currentLayer].remove();
    tileLayers[name].addTo(leafletMap);
    currentLayer = name;
    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + name).classList.add('active');
  };

  // ── Open / close map modal ────────────────────────────────────
  window.openMap = function () {
    document.getElementById("map-modal").classList.add("open");
    setTimeout(() => {
      initMap();
      if (leafletMap) {
        leafletMap.invalidateSize();
        fitMap();
        window.updateMyMarker();
      }
    }, 120);
  };

  window.closeMap = function () {
    document.getElementById("map-modal").classList.remove("open");
  };

  window.closeMapOutside = function (e) {
    if (e.target === document.getElementById("map-modal")) window.closeMap();
  };

})();
