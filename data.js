// ============================================================
// 🔧 STATIONEN HIER HINZUFÜGEN
// Jede Station hat einen Tracker-Ort und ein Passwort danach.
// Die letzte Station hat kein Passwort (Ende der Kette).
// ============================================================

const stationen = [
  {
    // Tracker 0
    name: "Rybnik",
    lat: 49.784527,
    lon: 16.750465,
    threshold: 20,

    // Passwort danach
    passwort: "Rybak123",
    passwortTitel: "Station 1 HOVNO"
  },
  {
    // Tracker 1
    name: "Dum 56 Burušov",
    lat: 49.784332,
    lon: 16.746994,
    threshold: 20,

    // Passwort danach
    passwort: "Dum56Pass",
    passwortTitel: "Station 2 HOVNO"
  },
  {
    // Tracker 2 – letzte Station, kein Passwort danach
    name: "Chalupa",
    lat: 49.784710,
    lon: 16.747815,
    threshold: 20,

    passwort: null,       // null = letzte Station
    passwortTitel: null
  }

  // Neue Station hinzufügen:
  // ,{
  //   name: "Mein Ort",
  //   lat: 48.1234,
  //   lon: 16.5678,
  //   threshold: 20,
  //   passwort: "meinpasswort",
  //   passwortTitel: "Super gemacht!"
  // }
];
