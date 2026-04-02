// ============================================================
// 🔧 ADD STATIONS HERE
// Each station has a tracker location and a password after it.
// The last station has no password (end of the chain).
// ============================================================

const stationen = [
  {
    // Tracker 0
    name: "Rybnik",
    lat: 49.784527,
    lon: 16.750465,
    threshold: 20,

    // Password after this station
    passwort: "Rybak123",
    passwortTitel: "Station 1 HOVNO"
  },
  {
    // Tracker 1
    name: "Dum 56 Burušov",
    lat: 49.784332,
    lon: 16.746994,
    threshold: 20,

    // Password after this station
    passwort: "Dum56Pass",
    passwortTitel: "Station 2 HOVNO"
  },
  {
    // Tracker 2 – last station, no password after
    name: "Chalupa",
    lat: 49.784710,
    lon: 16.747815,
    threshold: 20,

    passwort: "123",       // null = last station
    passwortTitel: "Station 3 HOVNO"
  }

  // Add a new station:
  // ,{
  //   name: "My Place",
  //   lat: 48.1234,
  //   lon: 16.5678,
  //   threshold: 20,
  //   passwort: "mypassword",
  //   passwortTitel: "Well done!"
  // }
];
