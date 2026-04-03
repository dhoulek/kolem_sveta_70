// compass.js – Compass logic for tracker.html
// Requires: activeDest, currentLat, currentLon from tracker.html
// Requires: SVG element with id="compass-svg" in the DOM

(function () {
  const CX = 140, CY = 140, R_OUTER = 130, R_INNER = 116;

  let deviceHeading = null;      // raw sensor value
  let smoothedHeading = null;    // filtered value used for display

  // ── Kalman filter state ───────────────────────────────────
  // Q: process noise  – how much we trust the sensor changing (higher = more reactive)
  // R: measurement noise – how noisy we think the raw sensor is (higher = smoother)
  const kalman = { Q: 0.1, R: 15, P: 1, x: null };

  function kalmanFilter(measurement) {
    if (kalman.x === null) { kalman.x = measurement; return measurement; }

    // Handle 0°/360° wrap-around: always take the shortest path
    let diff = measurement - kalman.x;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    const unwrapped = kalman.x + diff;

    // Predict
    kalman.P += kalman.Q;

    // Update
    const K = kalman.P / (kalman.P + kalman.R);   // Kalman gain
    kalman.x = kalman.x + K * (unwrapped - kalman.x);
    kalman.P = (1 - K) * kalman.P;

    return (kalman.x + 360) % 360;
  }
  let ringGroup = null;
  let dot = null;
  let distText = null;
  let unitText = null;

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
    const cardinals = { 0: "N", 90: "E", 180: "S", 270: "W" };
    for (let i = 0; i < 16; i++) {
      const angleDeg = i * 22.5;
      const rad = toRad(angleDeg - 90);
      const isCardinal = angleDeg % 90 === 0;
      const tickLen = isCardinal ? 18 : 11;
      const r1 = R_OUTER - 2;
      const r2 = r1 - tickLen;

      group.appendChild(svgEl("line", {
        x1: CX + r1 * Math.cos(rad), y1: CY + r1 * Math.sin(rad),
        x2: CX + r2 * Math.cos(rad), y2: CY + r2 * Math.sin(rad),
        stroke: "#222",
        "stroke-width": isCardinal ? "2.5" : "1.5",
        "stroke-linecap": "round"
      }));

      if (isCardinal) {
        const lr = R_OUTER - tickLen - 14;
        const label = svgEl("text", {
          x: CX + lr * Math.cos(rad),
          y: CY + lr * Math.sin(rad),
          "text-anchor": "middle",
          "dominant-baseline": "central",
          "font-size": "18",
          "font-weight": "bold",
          fill: angleDeg === 0 ? "#c0392b" : "#222"
        });
        label.textContent = cardinals[angleDeg];
        group.appendChild(label);
      }
    }
  }

  function initSVG() {
    const svg = document.getElementById("compass-svg");
    if (!svg) return;

    // Rotating ring group
    ringGroup = svgEl("g", {});
    buildRing(ringGroup);
    svg.appendChild(ringGroup);

    // Red destination dot (stays in screen space, not rotated with ring)
    dot = svgEl("circle", {
      cx: CX, cy: CY - (R_INNER - 6),
      r: "9", fill: "#e74c3c",
      stroke: "#fff", "stroke-width": "2"
    });
    svg.appendChild(dot);

    // Distance value text
    distText = svgEl("text", {
      x: CX, y: CY - 12,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "30",
      "font-weight": "bold",
      fill: "#222"
    });
    distText.textContent = "--";
    svg.appendChild(distText);

    // Unit label text
    unitText = svgEl("text", {
      x: CX, y: CY + 20,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "15",
      fill: "#888"
    });
    unitText.textContent = "";
    svg.appendChild(unitText);
  }

  function updateCompass() {
    if (!ringGroup) return;

    // Update distance display
    if (typeof currentLat !== "undefined" && currentLat !== null &&
      typeof activeDest !== "undefined" && activeDest !== null) {
      const dist = getDistance(currentLat, currentLon, activeDest.lat, activeDest.lon);
      if (dist >= 1000) {
        distText.textContent = (dist / 1000).toFixed(2);
        unitText.textContent = "km";
      } else {
        distText.textContent = Math.round(dist);
        unitText.textContent = "m";
      }
    }

    // Rotate ring so north stays north (use smoothed heading to avoid jitter)
    const heading = smoothedHeading !== null ? smoothedHeading : 0;
    ringGroup.setAttribute("transform", `rotate(${-heading}, ${CX}, ${CY})`);

    // Move red dot toward destination bearing, corrected for device heading
    let dotAngle = 0;
    if (typeof currentLat !== "undefined" && currentLat !== null &&
      typeof activeDest !== "undefined" && activeDest !== null) {
      const bearing = getBearing(currentLat, currentLon, activeDest.lat, activeDest.lon);
      dotAngle = (bearing - heading + 360) % 360;
    }

    const dotRad = toRad(dotAngle - 90);
    const dotR = R_INNER - 6;
    dot.setAttribute("cx", CX + dotR * Math.cos(dotRad));
    dot.setAttribute("cy", CY + dotR * Math.sin(dotRad));
  }

  // Handle device orientation events
  function handleOrientation(e) {
    let raw = null;
    if (e.webkitCompassHeading != null) {
      raw = e.webkitCompassHeading;               // iOS (already filtered by OS)
    } else if (e.absolute && e.alpha != null) {
      raw = (360 - e.alpha) % 360;               // Android absolute
    } else if (e.alpha != null) {
      raw = (360 - e.alpha) % 360;               // fallback
    }
    if (raw !== null) {
      deviceHeading = raw;
      const filtered = kalmanFilter(raw);

      // Deadband: only update display if change is larger than 2°
      // This kills the last remaining 1-3° jitter on Samsung
      if (smoothedHeading === null) {
        smoothedHeading = filtered;
      } else {
        let diff = filtered - smoothedHeading;
        if (diff > 180)  diff -= 360;
        if (diff < -180) diff += 360;
        if (Math.abs(diff) >= 2) smoothedHeading = filtered;
      }
    }
  }

  // Called from tracker.html to start listening to device orientation
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