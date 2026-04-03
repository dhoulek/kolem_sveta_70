// ============================================================
// 🔧 ADD STATIONS HERE
//
// Chain order:
//   password(0) → tracker(0) → password(1) → tracker(1) → ... → tracker(last) = END
//
// Each station has:
//   - A password the player must enter BEFORE going to that location
//   - A tracker location the player must reach AFTER the password
//
// The last tracker arrival = end of the game (no password after it).
// ============================================================

const stations = [
  {
    // Password 0 (shown first)
    passwordTitle: "<b>Na rozehřátí:</b><br />Myslím si číslo.<br />Když ho vynásobím 2 a přičtu 10, dostanu 50.<br />Jaké číslo jsem si myslel?",
    password: "20",

    // Tracker 0 (shown after password 0)
    locationName: "Saturn",
    lat: 49.785484,
    lon: 16.750004,
    radius: 10
  },
  {
    // Password 1
    passwordTitle: "Doplň chybějící číslo: <br /> 2, 6, 7, 21, 22, ?, 67",
    password: "66",

    // Tracker 1
    locationName: "Uran",
    lat: 49.787510,
    lon: 16.749357,
    radius: 10
  },
  {
    // Password 2
    passwordTitle: "Slepička snese 1 vejce za 1 den.<br />Kolik vajec snese 3 slepičky za 3 dny?",
    password: "9",

    // Tracker 2 – last tracker, reaching it = game over
    locationName: "Země",
    lat: 49.78698759732626,
    lon: 16.74734459214994,
    radius: 20
  },
  {
    // Password 3
    passwordTitle: "Co se o Velikonocích plete, ale není to svetr?",
    password: "Pomlázka",

    // Tracker 3 – last tracker, reaching it = game over
    locationName: "přistávací plocha",
    lat: 49.78472106478665,
    lon: 16.747868157285193,
    radius: 20
  }

  // Add a new station:
  // ,{
  //   passwordTitle: "Station X complete! Enter the next code:",
  //   password: "mypassword",
  //   locationName: "My Place",
  //   lat: 48.1234,
  //   lon: 16.5678,
  //   radius: 20
  // }
];
