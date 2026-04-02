// kompass.js – Compass logic for index.html
// Requires: activeDest, currentLat, currentLon from index.html
// Requires: SVG element with id="kompass-svg" in the DOM

(function () {
  const CX = 140, CY = 140, R_OUTER = 130, R_INNER = 116;

  let deviceHeading = null;
  let ringGroupEl = null;
  let dotEl = null;
  let distTextEl = null;
  let unitTextEl = null;

  function toRad(v) { return v * Math.PI / 180; }
  function toDeg(v) { return v * 180 / Math.PI; }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function getBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function buildRing(group) {
    // Outer circle
    group.appendChild(svgEl("circle", {
      cx: CX, cy: CY, r: R_OUTER,
      fill: "#ffffff", stroke: "#333", "stroke-width": "2.5"
    }));

    // 16 ticks: 4 cardinal (big) + 3 minor between each
    const cardinals = { 0: "S", 90: "V", 180: "J", 270: "Z" };
    for (let i = 0; i < 16; i++) {
      const angleDeg = i * 22.5;
      const rad = toRad(angleDeg - 90);
      const isCard = angleDeg % 90 === 0;
      const tickLen = isCard ? 18 : 11;
      const r1 = R_OUTER - 2;
      const r2 = r1 - tickLen;

      group.appendChild(svgEl("line", {
        x1: CX + r1 * Math.cos(rad), y1: CY + r1 * Math.sin(rad),
        x2: CX + r2 * Math.cos(rad), y2: CY + r2 * Math.sin(rad),
        stroke: "#222",
        "stroke-width": isCard ? "2.5" : "1.5",
        "stroke-linecap": "round"
      }));

      if (isCard) {
        const lr = R_OUTER - tickLen - 14;
        const lbl = svgEl("text", {
          x: CX + lr * Math.cos(rad),
          y: CY + lr * Math.sin(rad),
          "text-anchor": "middle",
          "dominant-baseline": "central",
          "font-size": "18",
          "font-weight": "bold",
          fill: angleDeg === 0 ? "#c0392b" : "#222"
        });
        lbl.textContent = cardinals[angleDeg];
        group.appendChild(lbl);
      }
    }
  }

  function initSVG() {
    const svg = document.getElementById("kompass-svg");
    if (!svg) return;

    // Rotating ring group
    ringGroupEl = svgEl("g", {});
    buildRing(ringGroupEl);
    svg.appendChild(ringGroupEl);

    // Red destination dot (stays in screen space, not rotated with ring)
    dotEl = svgEl("circle", {
      cx: CX, cy: CY - (R_INNER - 6),
      r: "9", fill: "#e74c3c",
      stroke: "#fff", "stroke-width": "2"
    });
    svg.appendChild(dotEl);

    // Distance value text
    distTextEl = svgEl("text", {
      x: CX, y: CY - 12,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "30",
      "font-weight": "bold",
      fill: "#222"
    });
    distTextEl.textContent = "--";
    svg.appendChild(distTextEl);

    // Unit label text
    unitTextEl = svgEl("text", {
      x: CX, y: CY + 20,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "15",
      fill: "#888"
    });
    unitTextEl.textContent = "";
    svg.appendChild(unitTextEl);
  }

  function updateCompass() {
  if (!ringGroupEl) return;

  // Update distance and unit label
  if (typeof currentLat !== "undefined" && currentLat !== null &&
    typeof activeDest !== "undefined" && activeDest !== null) {
    const dist = getDistance(currentLat, currentLon, activeDest.lat, activeDest.lon);
    if (dist >= 1000) {
      distTextEl.textContent = (dist / 1000).toFixed(2);
      unitTextEl.textContent = "km";
    } else {
      distTextEl.textContent = Math.round(dist);
      unitTextEl.textContent = "m";
    }
  }

  // Rotate ring so north stays north
  const heading = deviceHeading !== null ? deviceHeading : 0;
  ringGroupEl.setAttribute("transform", `rotate(${-heading}, ${CX}, ${CY})`);

  // Move red dot to bearing toward destination, corrected for device heading
  let dotAngle = 0;
  if (typeof currentLat !== "undefined" && currentLat !== null &&
    typeof activeDest !== "undefined" && activeDest !== null) {
    const bearing = getBearing(currentLat, currentLon, activeDest.lat, activeDest.lon);
    dotAngle = (bearing - heading + 360) % 360;
  }

  const dotRad = toRad(dotAngle - 90);
  const dotR = R_INNER - 6;
  dotEl.setAttribute("cx", CX + dotR * Math.cos(dotRad));
  dotEl.setAttribute("cy", CY + dotR * Math.sin(dotRad));

  // 👉 HIER NEU: Heading anzeigen
  const el = document.getElementById("heading-value");
  if (el && deviceHeading !== null) {
    el.textContent = "Heading: " + deviceHeading.toFixed(1) + "°";
  }
}

  // Handle device orientation events
  function handleOrientation(e) {
    if (e.webkitCompassHeading != null) {
      deviceHeading = e.webkitCompassHeading;                 // iOS
    } else if (e.absolute && e.alpha != null) {
      deviceHeading = Math.round((360 - e.alpha) % 1080) * 3;                 // Android absolute
    } else if (e.alpha != null && deviceHeading === null) {
      deviceHeading = Math.round((360 - e.alpha) % 1080) * 3;                 // fallback
    }
  }

  // Called from index.html to start listening to device orientation
  window.startCompassOrientation = function () {
    if (!window.DeviceOrientationEvent) return;
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  };

  // Init SVG and start animation loop on page load
  document.addEventListener("DOMContentLoaded", function () {
    initSVG();
    function loop() {
      updateCompass();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
})();
