// compass.js – Compass logic for tracker.html
// Requires: activeDest, currentLat, currentLon from tracker.html
// Requires: SVG element with id="compass-svg" in the DOM

(function () {
  const CX = 140, CY = 140, R_OUTER = 130, R_INNER = 116;

  // ── Kalman filter state ───────────────────────────────────
  // Tuned for display smoothness: low R = more responsive to real movement.
  // The filter removes sensor noise without adding perceptible lag.
  // Q: process noise  – how much we trust the sensor changing
  // R: measurement noise – how noisy the raw sensor is (lower = more reactive)
  const kalman = { Q: 0.5, R: 3, P: 1, x: null };

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

  // ── State ─────────────────────────────────────────────────
  let ringGroup = null;
  let dot       = null;
  let distText  = null;
  let unitText  = null;

  // True once we confirmed deviceorientationabsolute fires on this device.
  // When set, all plain deviceorientation events are ignored so the relative
  // (drifting) sensor never contaminates the absolute heading.
  let usingAbsolute = false;

  // renderHeading is what the rAF loop actually draws.
  // It is updated on every sensor event – no deadband, no interval throttle.
  // Stored as an unbounded accumulator so shortest-path logic works across
  // the 0°/360° boundary without ever spinning the long way around.
  let renderHeading  = null;   // unbounded accumulated display angle
  let renderDotAngle = null;   // unbounded accumulated dot angle

  // ── Math helpers ──────────────────────────────────────────

  function toRad(v) { return v * Math.PI / 180; }
  function toDeg(v) { return v * 180 / Math.PI; }

  // Shortest angular delta from `from` to `to`, result in range -180..180
  function shortestDelta(from, to) {
    let d = (to - from) % 360;
    if (d > 180)  d -= 360;
    if (d < -180) d += 360;
    return d;
  }

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

  // ── SVG helpers ───────────────────────────────────────────

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

    // Rotating ring – no CSS transition needed because rAF renders every
    // filtered sensor value directly, giving native-smooth movement.
    ringGroup = svgEl("g", {});
    ringGroup.style.transformOrigin = `${CX}px ${CY}px`;
    buildRing(ringGroup);
    svg.appendChild(ringGroup);

    // Red destination dot
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

  // ── Render loop ───────────────────────────────────────────
  // rAF is used only as a paint scheduler – it reads renderHeading which is
  // already updated by the sensor event handler. When the device is still,
  // renderHeading doesn't change so the DOM writes are identical and the
  // browser skips repainting automatically. Battery impact is minimal.

  function renderFrame() {
    if (ringGroup && renderHeading !== null) {

      // Rotate the compass ring via CSS transform (GPU compositing)
      ringGroup.style.transform = `rotate(${-renderHeading}deg)`;

      // Update distance display and dot position
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

        // Move the destination dot using the accumulated (unwrapped) dot angle
        const dotRad = toRad(renderDotAngle - 90);
        const dotR   = R_INNER - 6;
        dot.setAttribute("cx", CX + dotR * Math.cos(dotRad));
        dot.setAttribute("cy", CY + dotR * Math.sin(dotRad));
      }
    }

    requestAnimationFrame(renderFrame);
  }

  // ── Sensor handler ────────────────────────────────────────
  // Processes a validated raw heading degree value.
  // Called by either handleAbsolute or handleRelative – never both for the
  // same physical event thanks to the usingAbsolute guard below.

  function processHeading(raw) {
    const filtered = kalmanFilter(raw);

    // Accumulate heading using shortest-path delta so we never cross the
    // 0°/360° seam in the wrong direction during rotation
    if (renderHeading === null) {
      renderHeading = filtered;
    } else {
      renderHeading += shortestDelta(renderHeading, filtered);
    }

    // Recompute dot angle from fresh heading + GPS bearing
    if (typeof currentLat !== "undefined" && currentLat !== null &&
      typeof activeDest !== "undefined" && activeDest !== null) {
      const bearing   = getBearing(currentLat, currentLon, activeDest.lat, activeDest.lon);
      const dotTarget = (bearing - filtered + 360) % 360;
      if (renderDotAngle === null) {
        renderDotAngle = dotTarget;
      } else {
        renderDotAngle += shortestDelta(renderDotAngle, dotTarget);
      }
    }
  }

  // Handler for deviceorientationabsolute (Android / modern browsers).
  // Once this fires even once we know the device supports absolute heading
  // and we set usingAbsolute = true so the relative fallback is silenced.
  function handleAbsolute(e) {
    if (e.alpha == null) return;
    usingAbsolute = true;
    processHeading((360 - e.alpha) % 360);
  }

  // Handler for plain deviceorientation.
  // Used on iOS (webkitCompassHeading) and as a last-resort fallback on
  // Android devices that never fire deviceorientationabsolute.
  // Ignored entirely once handleAbsolute has confirmed absolute support,
  // preventing the drifting relative sensor from mixing in on Samsung etc.
  function handleRelative(e) {
    if (usingAbsolute) return;   // absolute is available – ignore relative

    let raw = null;
    if (e.webkitCompassHeading != null) {
      raw = e.webkitCompassHeading;               // iOS (pre-filtered by OS)
    } else if (e.alpha != null) {
      raw = (360 - e.alpha) % 360;               // Android fallback (relative)
    }
    if (raw !== null) processHeading(raw);
  }

  // Called from tracker.html to start listening to device orientation.
  // Strategy:
  //   1. Always register deviceorientationabsolute – best on Android/Samsung.
  //   2. Always register deviceorientation – needed for iOS and as fallback.
  //   3. handleRelative checks usingAbsolute and exits immediately if absolute
  //      has fired, so on Samsung only the absolute stream is ever processed.
  window.startCompassOrientation = function () {
    if (!window.DeviceOrientationEvent) return;
    window.addEventListener("deviceorientationabsolute", handleAbsolute, true);
    window.addEventListener("deviceorientation", handleRelative, true);
  };

  // Init SVG and start the render loop on page load
  document.addEventListener("DOMContentLoaded", function () {
    initSVG();
    requestAnimationFrame(renderFrame);
  });
})();
