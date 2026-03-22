// -*- coding: utf-8 -*-
// ============================================================
// 🔧 ZIELE HIER HINZUFÜGEN
// Aufruf: index.html?ziel=url-schluessel
// ============================================================

const destinations = {
  "wien-hbf": {
    name: "Wien Hauptbahnhof",
    lat: 48.1853,
    lon: 16.3760,
    threshold: 30,
    message: "Willkommen am Wiener Hauptbahnhof!"
  },
  "stephansplatz": {
    name: "Stephansplatz Wien",
    lat: 48.2082,
    lon: 16.3738,
    threshold: 20,
    message: "Du hast den Stephansplatz erreicht!"
  },
  "schoenbrunner-schloss": {
    name: "Schloss Schönbrunn",
    lat: 48.1845,
    lon: 16.3122,
    threshold: 50,
    message: "Herzlich willkommen bei Schloss Schönbrunn!"
  }

  // Neues Ziel hinzufügen:
  // ,"mein-ziel": {
  //   name: "Mein Ziel",
  //   lat: 48.1234,
  //   lon: 16.5678,
  //   threshold: 20,
  //   message: "Du bist da!"
  // }
};