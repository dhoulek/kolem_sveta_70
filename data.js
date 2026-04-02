// ============================================================
// 🔧 STATIONEN HIER HINZUFÜGEN
// Jede Station hat einen Tracker-Ort und ein Passwort danach.
// Die letzte Station hat kein Passwort (Ende der Kette).
// ============================================================

const stationen = [
  {
    // Tracker 0
    name: "Wien Hauptbahnhof",
    lat: 48.1853,
    lon: 16.3760,
    threshold: 30,

    // Passwort danach
    passwort: "geheim123",
    passwortTitel: "Station 1 abgeschlossen!"
  },
  {
    // Tracker 1
    name: "Stephansplatz Wien",
    lat: 48.2082,
    lon: 16.3738,
    threshold: 20,

    // Passwort danach
    passwort: "blauwal99",
    passwortTitel: "Station 2 abgeschlossen!"
  },
  {
    // Tracker 2 – letzte Station, kein Passwort danach
    name: "Schloss Schönbrunn",
    lat: 48.1845,
    lon: 16.3122,
    threshold: 50,

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
