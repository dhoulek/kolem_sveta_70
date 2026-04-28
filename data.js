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
    passwordTitle: "<h2>Londýn</h2><br /><br />Co bude Tvůj další cíl?",
    passwords: ["Paris", "Paříž", "paris", "paříž"],

    // Tracker 0 (shown after password 0)
    locationName: "Paříž",
    lat: 49.0210608,
    lon: 14.7805728,
    radius: 10
  },
  {
    // Password 1
    passwordTitle: "<h2>Paříž</h2><br /><br />Co bude Tvůj další cíl?",
    passwords: ["Itálie", "itálie", "italie", "Italie"],

    // Tracker 1
    locationName: "Itálie",
    lat: 49.0387000,
    lon: 14.8149569,
    radius: 20
  },
  {
    // Password 2
    passwordTitle: "<h2>Itálie</h2><br /><br />Co bude Tvůj další cíl?",
    passwords: ["Egypt", "egypt"],

    // Tracker 2 – last tracker, reaching it = game over
    locationName: "Egypt",
    lat: 49.0537517,
    lon: 14.7890756,
    radius: 10
  },
  {
    // Password 3
    passwordTitle: "<h2>Egypt</h2><br /><br />Co bude Tvůj další cíl?",
    password: ["Západ USA", "západ USA", "západ usa", "Zapad USA", "zapad USA", "zapad usa"],

    // Tracker 3 – last tracker, reaching it = game over
    locationName: "San Fracisco",
    lat: 49.0481014,
    lon: 14.7615056,
    radius: 10
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
