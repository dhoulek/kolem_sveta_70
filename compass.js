const targetLat = 48.2082;
const targetLon = 16.3738;

let userLat = null;
let userLon = null;
let heading = 0;

// Standort
navigator.geolocation.watchPosition(pos => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;
});

// Richtung berechnen
function getBearing(lat1, lon1, lat2, lon2) {
    const toRad = x => x * Math.PI / 180;
    const toDeg = x => x * 180 / Math.PI;

    const dLon = toRad(lon2 - lon1);

    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Kompass
window.addEventListener("deviceorientation", e => {
    heading = e.alpha;

    if (userLat !== null && userLon !== null) {
        const bearing = getBearing(userLat, userLon, targetLat, targetLon);
        const rotation = bearing - heading;

        document.getElementById("needle").style.transform =
            `rotate(${rotation}deg)`;
    }
});