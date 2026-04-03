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
    locationName: "Origin",
    lat: 0,
    lon: 0,
    radius: 20
  },
  {
    // Password 1
    passwordTitle: "Dum 56",
    password: "Heslo2",

    // Tracker 1
    locationName: "Dum 56 Burušov",
    lat: 49.784332,
    lon: 16.746994,
    radius: 20
  },
  {
    // Password 2
    passwordTitle: "Chalupa",
    password: "Heslo3",

    // Tracker 2 – last tracker, reaching it = game over
    locationName: "Chalupa",
    lat: 49.784710,
    lon: 16.747815,
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
