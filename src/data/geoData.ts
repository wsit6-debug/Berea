export interface GeoLocation {
  id: string;
  name: string;
  ancientName?: string;
  modernCountry: string;
  lat: number;
  lng: number;
  zoom: number;
  era: string;
  biblicalEvents: string[];
  description: string;
  scriptureReferences: string[];
  archaeologicalNotes: string;
  routeKey?: 'pauls_journey' | 'jesus_ministry' | 'exodus' | 'paul_to_rome' | 'patriarchs' | 'abraham';
}

export interface ChapterGeoEvent {
  id: string;
  stepNumber: number;
  title: string;
  passageRef: string;
  verseRange: [number, number];
  locationName: string;
  shortPlaceName?: string;
  modernLocation: string;
  lat: number;
  lng: number;
  description: string;
  theologicalSignificance: string;
  icon?: string;
}

export function getShortPlaceName(ev: { shortPlaceName?: string; locationName: string; title?: string }): string {
  if (ev.shortPlaceName) return ev.shortPlaceName;
  if (!ev.locationName) return "Biblical Site";

  let name = ev.locationName
    .replace(/\s*\([^)]*\)/g, "")
    .split(",")[0]
    .split("—")[0]
    .split("/")[0]
    .trim();

  name = name.replace(/\s+(Synagogue|Forum|Marketplace|Harbor|Port|Colonnade|Courts|Sanctuary|Plaza|Ridge|Highway|Road|Precinct|Area|Gate|Springs|Waters|Caves|Hills|Summit|Peak|Massif|Coast|Shoreline|Environs|Village|Outskirts|House|Estate|Rock).*$/i, " $1");
  name = name.replace(/^Ancient\s+/i, "");
  name = name.replace(/\s+&.*$/i, "");

  return name || ev.locationName.split(" ")[0] || "Biblical Site";
}

export interface ChapterGeoData {
  bookId: string;
  chapterNumber: number;
  chapterTitle: string;
  region: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  events: ChapterGeoEvent[];
  routeCoordinates?: number[][];
}

export interface BiblicalRegion {
  name: string;
  ancientName: string;
  lat: number;
  lng: number;
  fontSize: string;
}

export const ANCIENT_BIBLICAL_REGIONS: BiblicalRegion[] = [
  { name: "JUDEA", ancientName: "Iudaea", lat: 31.65, lng: 35.15, fontSize: "11px" },
  { name: "SAMARIA", ancientName: "Samaria", lat: 32.25, lng: 35.25, fontSize: "11px" },
  { name: "GALILEE", ancientName: "Galilaea", lat: 32.85, lng: 35.35, fontSize: "11px" },
  { name: "DECAPOLIS", ancientName: "Decapolis", lat: 32.55, lng: 35.85, fontSize: "10px" },
  { name: "PEREA", ancientName: "Peraea", lat: 31.95, lng: 35.75, fontSize: "10px" },
  { name: "PHOENICIA", ancientName: "Phoenice", lat: 33.25, lng: 35.20, fontSize: "10px" },
  { name: "SYRIA", ancientName: "Syria", lat: 34.50, lng: 36.80, fontSize: "13px" },
  { name: "MACEDONIA", ancientName: "Macedonia", lat: 40.80, lng: 22.80, fontSize: "13px" },
  { name: "ACHAIA", ancientName: "Achaia", lat: 38.30, lng: 22.40, fontSize: "13px" },
  { name: "ASIA MINOR", ancientName: "Asia Proconsularis", lat: 38.50, lng: 28.50, fontSize: "13px" },
  { name: "EGYPT", ancientName: "Aegyptus", lat: 30.10, lng: 31.50, fontSize: "14px" },
  { name: "SINAI", ancientName: "Arabia Petraea", lat: 29.00, lng: 34.00, fontSize: "12px" },
  { name: "MESOPOTAMIA", ancientName: "Babylonia", lat: 33.30, lng: 44.40, fontSize: "13px" }
];

export const BIBLICAL_LOCATIONS: Record<string, GeoLocation> = {
  "eden_mesopotamia": {
    "id": "eden_mesopotamia",
    "name": "Mesopotamia (Cradle of Civilization)",
    "ancientName": "Eden / Tigris & Euphrates (Shinar)",
    "modernCountry": "Iraq (Southern Mesopotamia)",
    "lat": 31,
    "lng": 47,
    "zoom": 7,
    "era": "Primeval History (Genesis 1–11)",
    "biblicalEvents": [
      "God creates the heavens, the earth, and places Adam and Eve in the Garden of Eden (Genesis 1–3)",
      "The Tigris (Hiddekel) and Euphrates rivers flow out of Eden (Genesis 2:10-14)",
      "The Tower of Babel in the Plain of Shinar (Genesis 11:1-9)"
    ],
    "description": "The fertile river basin between the Tigris and Euphrates where biblical history begins.",
    "scriptureReferences": [
      "Genesis 1:1",
      "Genesis 2:8-15",
      "Genesis 11:1-9"
    ],
    "archaeologicalNotes": "Ancient Sumerian alluvial plains and Eridu / Uruk ruins.",
    "routeKey": "patriarchs"
  },
  "mount_ararat": {
    "id": "mount_ararat",
    "name": "Mountains of Ararat",
    "ancientName": "Urartu / Agri Dagi",
    "modernCountry": "Eastern Turkey / Armenia Border",
    "lat": 39.7025,
    "lng": 44.299,
    "zoom": 9,
    "era": "Primeval Patriarchal (Genesis 8)",
    "biblicalEvents": [
      "Noah's Ark comes to rest upon the Mountains of Ararat (Genesis 8:4)",
      "Noah builds an altar and offers burnt offerings; God establishes the Rainbow Covenant (Genesis 8:20–9:17)"
    ],
    "description": "Massive volcanic peak (16,854 ft) towering over the Armenian highland, the resting place of the Ark.",
    "scriptureReferences": [
      "Genesis 8:4",
      "Genesis 9:12-17"
    ],
    "archaeologicalNotes": "Ancient Kingdom of Urartu plateau.",
    "routeKey": "patriarchs"
  },
  "ur_chaldees": {
    "id": "ur_chaldees",
    "name": "Ur of the Chaldees",
    "ancientName": "Urim / Tell el-Muqayyar",
    "modernCountry": "Southern Iraq (near Nasiriyah)",
    "lat": 30.9625,
    "lng": 46.103,
    "zoom": 10,
    "era": "Early Bronze Age (c. 2100 BC)",
    "biblicalEvents": [
      "Birthplace and ancestral homeland of Abram and Sarai (Genesis 11:27-31)",
      "Terah departs Ur with Abram, Sarai, and Lot to go to the land of Canaan (Genesis 11:31)"
    ],
    "description": "Major royal Sumerian city and ziggurat complex near the Persian Gulf, Abram's point of origin.",
    "scriptureReferences": [
      "Genesis 11:27-31",
      "Genesis 15:7",
      "Nehemiah 9:7",
      "Acts 7:2-4"
    ],
    "archaeologicalNotes": "The Great Ziggurat of Ur excavated by Sir Leonard Woolley.",
    "routeKey": "abraham"
  },
  "haran": {
    "id": "haran",
    "name": "Haran (Paddan-Aram)",
    "ancientName": "Carrhae / Haranu",
    "modernCountry": "Southeastern Turkey (Sanliurfa Province)",
    "lat": 36.8647,
    "lng": 39.0272,
    "zoom": 10,
    "era": "Middle Bronze Age (c. 2000–1800 BC)",
    "biblicalEvents": [
      "Terah settles and dies in Haran (Genesis 11:31-32)",
      "God calls 75-year-old Abram: 'Go from your country and your father's house to the land that I will show you' (Genesis 12:1-4)",
      "Jacob flees to Laban in Haran, marries Leah and Rachel, and shepherds flocks for 20 years (Genesis 28–31)"
    ],
    "description": "Crucial commercial crossroads in upper Mesopotamia where God gave Abram the foundational Abrahamic Covenant.",
    "scriptureReferences": [
      "Genesis 12:1-5",
      "Genesis 28:10",
      "Genesis 29:1-30",
      "Acts 7:4"
    ],
    "archaeologicalNotes": "Ancient beehive mudbrick houses and Tell Haran mounds.",
    "routeKey": "abraham"
  },
  "shechem": {
    "id": "shechem",
    "name": "Shechem (Oak of Moreh)",
    "ancientName": "Tell Balata / Nablus",
    "modernCountry": "West Bank (between Mt. Gerizim & Mt. Ebal)",
    "lat": 32.2133,
    "lng": 35.2819,
    "zoom": 11,
    "era": "Patriarchal Era (c. 2000 BC)",
    "biblicalEvents": [
      "Abram arrives in Canaan at the Oak of Moreh; the Lord appears: 'To your offspring I will give this land.' Abram builds his first altar in Canaan (Genesis 12:6-7)",
      "Jacob buys a parcel of land and sets up an altar named El-Elohe-Israel (Genesis 33:18-20)",
      "Joseph's brothers pasture flocks here before moving to Dothan (Genesis 37:12-14)"
    ],
    "description": "Strategic mountain pass city nestled between Mount Gerizim and Mount Ebal, the first covenant altar site in the Promised Land.",
    "scriptureReferences": [
      "Genesis 12:6-7",
      "Genesis 33:18-20",
      "Genesis 37:12-14",
      "Joshua 24:1"
    ],
    "archaeologicalNotes": "Cyclopean Bronze Age fortress walls at Tell Balata.",
    "routeKey": "abraham"
  },
  "bethel": {
    "id": "bethel",
    "name": "Bethel (House of God / Luz)",
    "ancientName": "Beitin",
    "modernCountry": "West Bank (Central Judean Ridge)",
    "lat": 31.93,
    "lng": 35.22,
    "zoom": 11,
    "era": "Patriarchal Era (c. 2000–1800 BC)",
    "biblicalEvents": [
      "Abram pitches his tent between Bethel and Ai, building an altar to Yahweh (Genesis 12:8, 13:3-4)",
      "Jacob's dream of the Ladder reaching to heaven with angels ascending and descending; names the place Bethel ('House of God') (Genesis 28:10-22)",
      "God tells Jacob: 'Arise, go up to Bethel and dwell there; make an altar to God' (Genesis 35:1-7)"
    ],
    "description": "Prominent ridge sanctuary 10 miles north of Jerusalem where both Abraham and Jacob worshiped and heard God's covenant promises.",
    "scriptureReferences": [
      "Genesis 12:8",
      "Genesis 13:3-4",
      "Genesis 28:10-22",
      "Genesis 35:1-15"
    ],
    "archaeologicalNotes": "Tell Beitin Bronze Age settlement and sanctuary remains.",
    "routeKey": "abraham"
  },
  "hebron": {
    "id": "hebron",
    "name": "Hebron (Oaks of Mamre & Machpelah)",
    "ancientName": "Kiriath-arba / Mamre",
    "modernCountry": "West Bank (Judean Mountains)",
    "lat": 31.529,
    "lng": 35.093,
    "zoom": 11,
    "era": "Patriarchal Era (c. 2000–1800 BC)",
    "biblicalEvents": [
      "Abram builds an altar by the Oaks of Mamre in Hebron (Genesis 13:18)",
      "The Lord visits Abraham with two angels; promises Isaac's birth (Genesis 18:1-15)",
      "Abraham purchases the Cave of Machpelah as a family burial place for Sarah, Abraham, Isaac, Rebekah, Leah, and Jacob (Genesis 23, 49:29-32, 50:13)"
    ],
    "description": "Highest city in the Judean hill country (3,050 ft), the primary residential center of Abraham and the ancestral tomb of the Patriarchs.",
    "scriptureReferences": [
      "Genesis 13:18",
      "Genesis 18:1",
      "Genesis 23:1-20",
      "Genesis 50:13"
    ],
    "archaeologicalNotes": "The monumental Herodian Cave of the Patriarchs (Machpelah enclosure) still standing today.",
    "routeKey": "patriarchs"
  },
  "beersheba": {
    "id": "beersheba",
    "name": "Beersheba (Well of the Oath)",
    "ancientName": "Be'er Sheva / Tel Sheva",
    "modernCountry": "Israel (Negev Desert)",
    "lat": 31.245,
    "lng": 34.79,
    "zoom": 11,
    "era": "Patriarchal Era (c. 2000–1800 BC)",
    "biblicalEvents": [
      "Abraham makes a covenant of peace with Abimelech at the well and plants a tamarisk tree, calling on Yahweh (Genesis 21:22-33)",
      "Abraham departs Beersheba for Mount Moriah with Isaac (Genesis 22:19)",
      "Isaac re-digs the wells and builds an altar (Genesis 26:23-33)",
      "Jacob offers sacrifices here before descending to Egypt (Genesis 46:1-5)"
    ],
    "description": "The Southern frontier oasis of the Promised Land ('from Dan to Beersheba') where the Patriarchs dug wells and worshiped.",
    "scriptureReferences": [
      "Genesis 21:31-33",
      "Genesis 22:19",
      "Genesis 26:31-33",
      "Genesis 46:1"
    ],
    "archaeologicalNotes": "Tel Be'er Sheva UNESCO site with ancient water systems and wells.",
    "routeKey": "patriarchs"
  },
  "peniel_jabbok": {
    "id": "peniel_jabbok",
    "name": "Peniel (Jabbok River)",
    "ancientName": "Penuel / River Zarqa",
    "modernCountry": "Jordan (Gilead)",
    "lat": 32.19,
    "lng": 35.7,
    "zoom": 11,
    "era": "Patriarchal Era (c. 1900 BC)",
    "biblicalEvents": [
      "Jacob sends his family across the Ford of the Jabbok (Genesis 32:22-23)",
      "Jacob wrestles with the Angel of the Lord until dawn: 'I will not let you go unless you bless me.' God names him Israel ('He who strives with God') (Genesis 32:24-32)"
    ],
    "description": "Dramatic canyon river ford in Gilead where Jacob's name was transformed into Israel.",
    "scriptureReferences": [
      "Genesis 32:22-32"
    ],
    "archaeologicalNotes": "Tulul adh-Dhahab mounds in the Jabbok River valley.",
    "routeKey": "patriarchs"
  },
  "dothan": {
    "id": "dothan",
    "name": "Dothan Valley",
    "ancientName": "Tell Dothan",
    "modernCountry": "West Bank (Samaria / Jezreel approach)",
    "lat": 32.4167,
    "lng": 35.24,
    "zoom": 11,
    "era": "Patriarchal Era (c. 1850 BC)",
    "biblicalEvents": [
      "Joseph finds his brothers pasturing their flocks in Dothan (Genesis 37:17)",
      "Brothers throw Joseph into an empty cistern and sell him to Midianite-Ishmaelite traders bound for Egypt (Genesis 37:18-28)"
    ],
    "description": "A fertile agricultural basin on the major caravan route between Damascus and Egypt.",
    "scriptureReferences": [
      "Genesis 37:17-28",
      "2 Kings 6:13"
    ],
    "archaeologicalNotes": "Tell Dothan archaeological mound with Bronze Age wells and cisterns.",
    "routeKey": "patriarchs"
  },
  "goshen_egypt": {
    "id": "goshen_egypt",
    "name": "Land of Goshen (Nile Delta)",
    "ancientName": "Avaris / Rameses / Tell el-Dab'a",
    "modernCountry": "Egypt (Eastern Nile Delta / Sharqia)",
    "lat": 30.787,
    "lng": 31.821,
    "zoom": 9,
    "era": "Patriarchal & Sojourn Era (c. 1850–1446 BC)",
    "biblicalEvents": [
      "Joseph settles his father Jacob and brothers in the best pastureland of Egypt in Goshen (Genesis 45:10, 47:1-6)",
      "Jacob blesses Pharaoh and later passes away in Goshen (Genesis 47:7-28, 49:33)",
      "Israel multiplies from 70 souls into a great nation before the Exodus (Exodus 1:7)"
    ],
    "description": "The fertile eastern branch of the Nile Delta where the children of Israel lived, prospered, and were protected during plagues.",
    "scriptureReferences": [
      "Genesis 45:10",
      "Genesis 47:1-6",
      "Exodus 8:22",
      "Exodus 9:26"
    ],
    "archaeologicalNotes": "Tell el-Dab'a (ancient Avaris) revealing Semitic Asiatic settlements in the Egyptian Middle Kingdom.",
    "routeKey": "exodus"
  },
  "susa_persia": {
    "id": "susa_persia",
    "name": "Susa (Shushan the Citadel)",
    "ancientName": "Shush / Susa",
    "modernCountry": "Iran (Khuzestan Province)",
    "lat": 32.189,
    "lng": 48.243,
    "zoom": 10,
    "era": "Persian Achaemenid Empire (c. 500–450 BC)",
    "biblicalEvents": [
      "Setting of the entire Book of Esther in the royal palace of King Ahasuerus (Xerxes I) (Esther 1–10)",
      "Nehemiah serves as royal cupbearer to King Artaxerxes and weeps for Jerusalem (Nehemiah 1:1, 2:1)",
      "Daniel receives apocalyptic visions along the Ulai canal in Susa (Daniel 8:2)"
    ],
    "description": "Winter capital of the Persian Empire with monumental royal palace complexes.",
    "scriptureReferences": [
      "Esther 1:2",
      "Nehemiah 1:1",
      "Daniel 8:2"
    ],
    "archaeologicalNotes": "Palace of Darius the Great, Apadana column base, and tomb of Daniel.",
    "routeKey": "patriarchs"
  },
  "babylon_ancient": {
    "id": "babylon_ancient",
    "name": "Babylon (Land of Shinar)",
    "ancientName": "Babel / Babil",
    "modernCountry": "Iraq (Euphrates River)",
    "lat": 32.5422,
    "lng": 44.4211,
    "zoom": 10,
    "era": "Neo-Babylonian Empire (c. 605–539 BC)",
    "biblicalEvents": [
      "Tower of Babel constructed in the Plain of Shinar (Genesis 11:1-9)",
      "King Nebuchadnezzar exiles Judah and burns Jerusalem (2 Kings 24–25)",
      "Daniel and three Hebrew youths interpret dreams and survive the fiery furnace and lions' den (Daniel 1–6)"
    ],
    "description": "The imperial capital of Mesopotamia on the Euphrates River, renowned for the Ishtar Gate and Hanging Gardens.",
    "scriptureReferences": [
      "Genesis 11:1-9",
      "Daniel 1–6",
      "Jeremiah 29:10"
    ],
    "archaeologicalNotes": "Ishtar Gate foundations and royal palace of Nebuchadnezzar II.",
    "routeKey": "patriarchs"
  },
  "jerusalem": {
    "id": "jerusalem",
    "name": "Jerusalem (Mount Zion)",
    "ancientName": "Yerushalayim / Salem / Aelia Capitolina",
    "modernCountry": "Israel / Palestinian Territories",
    "lat": 31.7767,
    "lng": 35.2345,
    "zoom": 12,
    "era": "United Monarchy & Second Temple (c. 1000 BC – AD 70)",
    "biblicalEvents": [
      "Jesus encounters Nicodemus by night (John 3)",
      "Site of the Temple built by Solomon and rebuilt by Zerubbabel / Herod",
      "The Last Supper, Crucifixion, Burial, and Resurrection of Jesus Christ",
      "Descent of the Holy Spirit on the Day of Pentecost (Acts 2)",
      "The Apostolic Council of Jerusalem (Acts 15)"
    ],
    "description": "The holy city and spiritual heart of ancient Israel, perched on the mountains of Judea between the Mediterranean and the Dead Sea.",
    "scriptureReferences": [
      "John 3:1-21",
      "Psalm 122",
      "Matthew 21",
      "Acts 2:1-41",
      "Acts 15:1-35"
    ],
    "archaeologicalNotes": "City of David, Western Wall, Temple Mount southern steps where rabbis and Jesus taught, and the Pool of Siloam.",
    "routeKey": "jesus_ministry"
  },
  "berea": {
    "id": "berea",
    "name": "Berea (Veria)",
    "ancientName": "Beroea (Βέροια)",
    "modernCountry": "Greece (Central Macedonia)",
    "lat": 40.5236,
    "lng": 22.2045,
    "zoom": 11,
    "era": "Roman Republic & Empire (1st Century AD)",
    "biblicalEvents": [
      "Paul and Silas arrive after escaping Thessalonica by night (Acts 17:10)",
      "The Berean believers receive the word with all readiness and examine the scriptures daily (Acts 17:11)",
      "Many prominent Greek men and women become believers (Acts 17:12)",
      "Sopater of Berea travels with Paul as a trusted apostolic companion (Acts 20:4)"
    ],
    "description": "A prosperous Roman provincial city at the foot of Mount Vermion. Renowned across Church history as the model of biblical vigilance and daily scriptural examination.",
    "scriptureReferences": [
      "Acts 17:10-15",
      "Acts 20:4"
    ],
    "archaeologicalNotes": "The historic \"Bema of the Apostle Paul\" monument stands near the ancient city center, commemorating where Paul preached.",
    "routeKey": "pauls_journey"
  },
  "athens": {
    "id": "athens",
    "name": "Athens (Areopagus / Mars Hill)",
    "ancientName": "Athēnai (Ἀθῆναι)",
    "modernCountry": "Greece",
    "lat": 37.9719,
    "lng": 23.7258,
    "zoom": 12,
    "era": "Classical Greece & Roman Empire",
    "biblicalEvents": [
      "Paul reasons in the synagogue and debates daily in the Agora with Epicureans and Stoics (Acts 17:17-18)",
      "Paul speaks atop the Areopagus proclaiming the \"Unknown God\" as Creator, Judge, and resurrected Lord (Acts 17:22-31)",
      "Dionysius the Areopagite and Damaris embrace the gospel (Acts 17:34)"
    ],
    "description": "The intellectual and philosophical capital of the Greco-Roman world, crowned by the Acropolis and the Parthenon.",
    "scriptureReferences": [
      "Acts 17:16-34"
    ],
    "archaeologicalNotes": "Mars Hill (Areopagus rock) adjacent to the Acropolis and the ancient Athenian Agora excavation.",
    "routeKey": "pauls_journey"
  },
  "galilee": {
    "id": "galilee",
    "name": "Sea of Galilee & Capernaum",
    "ancientName": "Lake of Gennesaret / Sea of Tiberias / Kinneret",
    "modernCountry": "Israel (Northern District)",
    "lat": 32.88,
    "lng": 35.575,
    "zoom": 11,
    "era": "First Century Roman Galilee",
    "biblicalEvents": [
      "Calling of Simon Peter, Andrew, James, and John from their fishing boats (Matthew 4:18-22)",
      "The Sermon on the Mount overlooking the lake (Matthew 5–7)",
      "Feeding of the 5,000 and the Bread of Life discourse (John 6)",
      "Jesus calms the storm and walks upon the water (Mark 4:35-41, John 6:19)"
    ],
    "description": "Freshwater inland lake 700 feet below sea level where Jesus established His ministry headquarters in Capernaum.",
    "scriptureReferences": [
      "Matthew 4:18-22",
      "Matthew 5-7",
      "John 6:1-71",
      "Mark 4:35-41"
    ],
    "archaeologicalNotes": "First-century limestone synagogue in Capernaum, the house of Peter octagonal church ruins, and the 1st-century \"Jesus Boat\".",
    "routeKey": "jesus_ministry"
  },
  "nazareth": {
    "id": "nazareth",
    "name": "Nazareth (Lower Galilee)",
    "ancientName": "Natzrat (נָצְרַת)",
    "modernCountry": "Israel (Galilee)",
    "lat": 32.702,
    "lng": 35.302,
    "zoom": 12,
    "era": "Second Temple Roman Galilee",
    "biblicalEvents": [
      "The Annunciation of the Angel Gabriel to Mary (Luke 1:26-38)",
      "The childhood and upbringing of Jesus Christ (Luke 2:39-52)",
      "Jesus reads Isaiah 61 in the Nazareth synagogue: \"The Spirit of the Lord is upon me\" (Luke 4:16-30)"
    ],
    "description": "A modest hillside Galilean village nestled in the hills north of the Jezreel Valley where Jesus grew in wisdom and stature.",
    "scriptureReferences": [
      "Luke 1:26-38",
      "Luke 2:39-52",
      "Luke 4:16-30",
      "Matthew 2:23"
    ],
    "archaeologicalNotes": "Excavations beneath the Church of the Annunciation revealing 1st-century courtyard homes, silos, and rock-hewn cisterns.",
    "routeKey": "jesus_ministry"
  },
  "bethlehem": {
    "id": "bethlehem",
    "name": "Bethlehem (City of David)",
    "ancientName": "Beit Lehem (בֵּית לֶחֶם / \"House of Bread\")",
    "modernCountry": "West Bank / Palestinian Territories",
    "lat": 31.7054,
    "lng": 35.2024,
    "zoom": 12,
    "era": "Iron Age & Roman Judea",
    "biblicalEvents": [
      "Birthplace of King David and setting of the book of Ruth (Ruth 1–4, 1 Samuel 16)",
      "Micah prophesies the birthplace of the eternal Ruler (Micah 5:2)",
      "The Nativity of Jesus Christ and visit of the Shepherds and Magi (Matthew 2, Luke 2)"
    ],
    "description": "Historic Judean ridge town 5 miles south of Jerusalem, celebrated in prophecy as the ancestral birthplace of David and the Messiah.",
    "scriptureReferences": [
      "Micah 5:2",
      "Luke 2:1-20",
      "Matthew 2:1-12",
      "1 Samuel 16:1-13"
    ],
    "archaeologicalNotes": "The Church of the Nativity, originally commissioned by Emperor Constantine in AD 327, built over the Grotto of the Nativity.",
    "routeKey": "jesus_ministry"
  },
  "antioch": {
    "id": "antioch",
    "name": "Antioch on the Orontes (Syrian Antioch)",
    "ancientName": "Antiocheia (Ἀντιόχεια)",
    "modernCountry": "Turkey (Hatay / Antakya)",
    "lat": 36.2021,
    "lng": 36.1606,
    "zoom": 11,
    "era": "Seleucid & Roman Syria (1st Century AD)",
    "biblicalEvents": [
      "Disciples are first called \"Christians\" at Antioch (Acts 11:26)",
      "Barnabas and Saul teach a vibrant multicultural congregation (Acts 11:22-26)",
      "Holy Spirit commissions Paul and Barnabas on their First Missionary Journey (Acts 13:1-3)",
      "Starting base for all three of the Apostle Paul's missionary journeys"
    ],
    "description": "The third largest city of the Roman Empire (after Rome and Alexandria) and the primary mother church of the Gentile Christian mission.",
    "scriptureReferences": [
      "Acts 11:19-30",
      "Acts 13:1-3",
      "Acts 14:26-28",
      "Galatians 2:11-14"
    ],
    "archaeologicalNotes": "The Cave Church of Saint Peter (St. Peter's Grotto), one of Christianity's oldest rock-hewn sanctuaries.",
    "routeKey": "pauls_journey"
  },
  "ephesus": {
    "id": "ephesus",
    "name": "Ephesus (Ionia)",
    "ancientName": "Ephesos (Ἔφεσος)",
    "modernCountry": "Turkey (İzmir Province)",
    "lat": 37.94,
    "lng": 27.34,
    "zoom": 11,
    "era": "Roman Asia Minor (1st Century AD)",
    "biblicalEvents": [
      "Paul spends over two years teaching daily in the Hall of Tyrannus (Acts 19:9-10)",
      "Uproar of Demetrius the silversmith in the Great Theater over Artemis (Acts 19:23-41)",
      "Paul writes 1 Corinthians from Ephesus and later pens the Epistle to the Ephesians",
      "First of the Seven Churches addressed by the glorified Christ in Revelation (Rev 2:1-7)"
    ],
    "description": "The commercial and administrative metropolis of Roman Asia, home to the Temple of Artemis (one of the Seven Wonders of the Ancient World).",
    "scriptureReferences": [
      "Acts 19:1-41",
      "Ephesians 1-6",
      "1 Timothy 1:3",
      "Revelation 2:1-7"
    ],
    "archaeologicalNotes": "Magnificent marble Curetes Street, Library of Celsus, 25,000-seat Theater, and Terrace Houses.",
    "routeKey": "pauls_journey"
  },
  "corinth": {
    "id": "corinth",
    "name": "Corinth (Achaia)",
    "ancientName": "Korinthos (Κόρινθος)",
    "modernCountry": "Greece (Peloponnese)",
    "lat": 37.906,
    "lng": 22.88,
    "zoom": 11,
    "era": "Roman Greece (1st Century AD)",
    "biblicalEvents": [
      "Paul arrives and lodges with Aquila and Priscilla, working as tentmakers (Acts 18:1-3)",
      "Paul ministers in Corinth for 18 months, receiving divine reassurance: \"I have many people in this city\" (Acts 18:9-11)",
      "Paul appears before the Roman Proconsul Gallio at the Bema judgment seat (Acts 18:12-17)",
      "Recipient of Paul's major epistles: 1 and 2 Corinthians"
    ],
    "description": "Strategic isthmus port city connecting the Aegean and Ionian seas, known for commerce, athletics (Isthmian Games), and cultural diversity.",
    "scriptureReferences": [
      "Acts 18:1-18",
      "1 Corinthians 13",
      "2 Corinthians 5"
    ],
    "archaeologicalNotes": "The Roman Bema (speaker's platform where Paul stood before Gallio), Temple of Apollo, and the Erastus Inscription.",
    "routeKey": "pauls_journey"
  },
  "philippi": {
    "id": "philippi",
    "name": "Philippi (Macedonia)",
    "ancientName": "Philippoi (Φίλιπποι)",
    "modernCountry": "Greece (Eastern Macedonia)",
    "lat": 40.9333,
    "lng": 24.4167,
    "zoom": 11,
    "era": "Roman Colony (Via Egnatia)",
    "biblicalEvents": [
      "Paul receives the \"Macedonian Call\" vision and brings the gospel to Europe (Acts 16:9-12)",
      "Conversion and baptism of Lydia, seller of purple fabrics (Acts 16:14-15)",
      "Paul and Silas sing hymns at midnight in prison; earthquake frees them, leading to the Philippian Jailer's conversion (Acts 16:25-34)",
      "Recipient of Paul's joyful letter to the Philippians"
    ],
    "description": "A prestigious Roman military colony situated along the major trans-empire highway (Via Egnatia), the first European city to hear the Gospel.",
    "scriptureReferences": [
      "Acts 16:11-40",
      "Philippians 1–4"
    ],
    "archaeologicalNotes": "The traditional Roman prison cell of Paul and Silas, the Roman Forum, and the Gangites River baptismal site.",
    "routeKey": "pauls_journey"
  },
  "thessalonica": {
    "id": "thessalonica",
    "name": "Thessalonica (Thessaloniki)",
    "ancientName": "Thessalonikē (Θεσσαλονίκη)",
    "modernCountry": "Greece (Macedonia)",
    "lat": 40.6401,
    "lng": 22.9444,
    "zoom": 11,
    "era": "Roman Provincial Capital of Macedonia",
    "biblicalEvents": [
      "Paul reasons from the Scriptures for three Sabbath days in the synagogue proving Jesus is the Christ (Acts 17:1-3)",
      "A great multitude of Greeks and leading women believe (Acts 17:4)",
      "Opponents riot and drag Jason before the politarchs (city rulers) (Acts 17:5-9)",
      "Recipients of 1 & 2 Thessalonians on the second coming of Christ"
    ],
    "description": "The bustling chief port and capital of the Roman province of Macedonia on the Thermaic Gulf.",
    "scriptureReferences": [
      "Acts 17:1-9",
      "1 Thessalonians 1–5",
      "2 Thessalonians 1–3"
    ],
    "archaeologicalNotes": "Roman Agora, Arch of Galerius, and ancient inscriptions mentioning the exact biblical civic title \"Politarchs\" (Acts 17:6).",
    "routeKey": "pauls_journey"
  },
  "rome": {
    "id": "rome",
    "name": "Rome (Imperial Capital)",
    "ancientName": "Roma",
    "modernCountry": "Italy",
    "lat": 41.8902,
    "lng": 12.4922,
    "zoom": 11,
    "era": "Roman Empire (1st Century AD)",
    "biblicalEvents": [
      "Paul writes his theological masterpiece, the Epistle to the Romans (Romans 1–16)",
      "Paul arrives in Rome under military guard following shipwreck on Malta (Acts 28:14-16)",
      "Paul proclaims the kingdom of God for two whole years in his own rented quarters with unhindered boldness (Acts 28:30-31)",
      "Apostolic martyrdom of Peter and Paul under Emperor Nero"
    ],
    "description": "The political, military, and cultural center of the ancient Western world, ruling over the entire Mediterranean basin.",
    "scriptureReferences": [
      "Romans 1:7",
      "Romans 8:1-39",
      "Acts 28:16-31",
      "2 Timothy 4:6-8"
    ],
    "archaeologicalNotes": "Roman Forum, Mamertine Prison, Colosseum, Appian Way, and the Vatican Necropolis beneath St. Peter's Basilica.",
    "routeKey": "paul_to_rome"
  },
  "damascus": {
    "id": "damascus",
    "name": "Damascus (Street Called Straight)",
    "ancientName": "Dammeseq (דַּמֶּשֶׂק)",
    "modernCountry": "Syria",
    "lat": 33.5138,
    "lng": 36.2765,
    "zoom": 11,
    "era": "Ancient Near East & Roman Decapolis",
    "biblicalEvents": [
      "Saul blinded by the blinding light of the risen Christ on the road to Damascus (Acts 9:1-9)",
      "Ananias is sent to the house of Judas on the \"Street called Straight\" to restore Saul's sight and baptize him (Acts 9:10-18)",
      "Paul immediately preaches in the synagogues that Jesus is the Son of God, and escapes over the city wall in a basket (Acts 9:20-25)"
    ],
    "description": "One of the oldest continuously inhabited cities in human history, located in an oasis fed by the Barada River at the foot of Mount Qasioun.",
    "scriptureReferences": [
      "Acts 9:1-25",
      "Acts 22:6-16",
      "Galatians 1:17",
      "2 Corinthians 11:32-33"
    ],
    "archaeologicalNotes": "Straight Street (Via Recta / Souq Midhat Pasha) and the House of Saint Ananias subterranean chapel.",
    "routeKey": "pauls_journey"
  },
  "caesarea": {
    "id": "caesarea",
    "name": "Caesarea Maritima",
    "ancientName": "Caesarea Palaestinae",
    "modernCountry": "Israel (Mediterranean Coast)",
    "lat": 32.5,
    "lng": 34.892,
    "zoom": 12,
    "era": "Herodian & Roman Capital of Judea",
    "biblicalEvents": [
      "Peter preaches to the Roman centurion Cornelius; the Holy Spirit falls upon the Gentiles (Acts 10)",
      "Philip the evangelist establishes his home and ministry (Acts 8:40, Acts 21:8)",
      "Paul imprisoned for two years, defending the faith before Governors Felix, Festus, and King Agrippa II (Acts 23–26)"
    ],
    "description": "Spectacular deep-sea artificial harbor city built by King Herod the Great, serving as the official seat of the Roman governors (including Pontius Pilate).",
    "scriptureReferences": [
      "Acts 10:1-48",
      "Acts 23:23-35",
      "Acts 25-26"
    ],
    "archaeologicalNotes": "The Pilate Stone inscription (confirming Pontius Pilate, Prefect of Judea), Roman amphitheater, and Herod's Promontory Palace.",
    "routeKey": "paul_to_rome"
  },
  "jordan_river": {
    "id": "jordan_river",
    "name": "Jordan River & Bethabara",
    "ancientName": "Yarden / Bethany beyond the Jordan",
    "modernCountry": "Jordan / Israel",
    "lat": 31.836,
    "lng": 35.546,
    "zoom": 12,
    "era": "Old & New Testament Epochs",
    "biblicalEvents": [
      "Israel crosses the dry bed of the Jordan River under Joshua into the Promised Land (Joshua 3–4)",
      "Elijah parts the waters with his mantle before being taken up in a chariot of fire (2 Kings 2)",
      "John the Baptist baptizes Jesus; heaven opens and the Spirit descends like a dove (Matthew 3:13-17)",
      "John's witness in John 3:30: \"He must increase, but I must decrease\""
    ],
    "description": "The historic meandering river connecting the Sea of Galilee to the Dead Sea through the Jordan Rift Valley.",
    "scriptureReferences": [
      "Joshua 3",
      "2 Kings 2:8",
      "John 1:28",
      "John 3:22-30",
      "Matthew 3:13-17"
    ],
    "archaeologicalNotes": "Al-Maghtas (Bethany beyond Jordan) archaeological site, a UNESCO World Heritage site with early Byzantine baptismal pools.",
    "routeKey": "jesus_ministry"
  },
  "mount_sinai": {
    "id": "mount_sinai",
    "name": "Mount Sinai (Horeb / Mount of God)",
    "ancientName": "Har Sinai / Jabal Musa",
    "modernCountry": "Egypt (Sinai Peninsula)",
    "lat": 28.5392,
    "lng": 33.9753,
    "zoom": 11,
    "era": "Late Bronze Age (c. 1440–1250 BC)",
    "biblicalEvents": [
      "Moses encounters the Lord in the Burning Bush (Exodus 3)",
      "Giving of the Ten Commandments and the Mosaic Covenant Law with fire and thunder (Exodus 19–20)",
      "Elijah flees from Jezebel and hears the \"still, small voice\" of God in the cave (1 Kings 19)"
    ],
    "description": "The awe-inspiring granite mountain massif in the southern Sinai desert where Yahweh revealed His holiness and covenant to Israel.",
    "scriptureReferences": [
      "Exodus 19:1-25",
      "Exodus 20:1-17",
      "1 Kings 19:8-18",
      "Galatians 4:24-25"
    ],
    "archaeologicalNotes": "Saint Catherine's Monastery at the mountain base, founded in AD 527 by Emperor Justinian, housing the Codex Sinaiticus history.",
    "routeKey": "exodus"
  },
  "jericho": {
    "id": "jericho",
    "name": "Jericho (City of Palms)",
    "ancientName": "Yeriḥo (יְרִיחוֹ)",
    "modernCountry": "West Bank / Palestinian Territories",
    "lat": 31.8667,
    "lng": 35.45,
    "zoom": 12,
    "era": "Bronze Age to Roman New Testament Period",
    "biblicalEvents": [
      "Walls of Jericho collapse after Israel marches for seven days around the city (Joshua 6)",
      "Elisha heals the spring waters with salt (2 Kings 2:19-22)",
      "Jesus heals blind Bartimaeus on the road (Mark 10:46-52)",
      "Zacchaeus climbs the sycamore tree to see Jesus; salvation comes to his house (Luke 19:1-10)"
    ],
    "description": "The lowest city on earth (840 feet below sea level) and an ancient fertile oasis near the northern tip of the Dead Sea.",
    "scriptureReferences": [
      "Joshua 6:1-27",
      "Luke 19:1-10",
      "Mark 10:46-52"
    ],
    "archaeologicalNotes": "Tell es-Sultan (ancient archaeological tell) with mudbrick fortification towers dating back millennia.",
    "routeKey": "jesus_ministry"
  },
  "patmos": {
    "id": "patmos",
    "name": "Isle of Patmos (Aegean Sea)",
    "ancientName": "Pátmos (Πάτμος)",
    "modernCountry": "Greece (Dodecanese Islands)",
    "lat": 37.3167,
    "lng": 26.55,
    "zoom": 11,
    "era": "Roman Penal Exile Island (1st Century AD)",
    "biblicalEvents": [
      "The Apostle John is exiled \"for the word of God and the testimony of Jesus Christ\" (Revelation 1:9)",
      "John is in the Spirit on the Lord's Day and sees the glorified Christ in blazing vision (Revelation 1:10-20)",
      "Transcription of the Apocalypse and the vision of the New Jerusalem (Revelation 1–22)"
    ],
    "description": "A small, volcanic, crescent-shaped Greek island in the Aegean Sea where the Apostle John received the prophetic book of Revelation.",
    "scriptureReferences": [
      "Revelation 1:9-20",
      "Revelation 21-22"
    ],
    "archaeologicalNotes": "The Cave of the Apocalypse and the 11th-century fortified Monastery of Saint John the Theologian.",
    "routeKey": "pauls_journey"
  },
  "mount_carmel": {
    "id": "mount_carmel",
    "name": "Mount Carmel (Elijah's Contest)",
    "ancientName": "Har HaKarmel (הַר הַכַּרְמֶל / \"God's Vineyard\")",
    "modernCountry": "Israel (Haifa District)",
    "lat": 32.73,
    "lng": 35.05,
    "zoom": 11,
    "era": "Monarchy of Israel (9th Century BC)",
    "biblicalEvents": [
      "Elijah challenges the 450 prophets of Baal to a contest by fire (1 Kings 18:20-40)",
      "Fire from heaven consumes the sacrifice, wood, stones, and water: \"The LORD, He is God!\" (1 Kings 18:38-39)",
      "Elijah prays on the mountain summit; God sends a cloud like a man's hand ending the 3-year drought (1 Kings 18:41-46)"
    ],
    "description": "A dramatic coastal mountain ridge extending from the Jezreel Valley northwest to the Mediterranean Sea.",
    "scriptureReferences": [
      "1 Kings 18:1-46",
      "Isaiah 35:2",
      "Amos 9:3"
    ],
    "archaeologicalNotes": "Muhraqa Carmelite Monastery overlooking the Jezreel Valley, marking the traditional site of Elijah's sacrifice.",
    "routeKey": "jesus_ministry"
  },
  "dead_sea": {
    "id": "dead_sea",
    "name": "Dead Sea & Qumran (Salt Sea)",
    "ancientName": "Yam HaMelakh / Lake Asphaltites",
    "modernCountry": "Israel / Jordan / West Bank",
    "lat": 31.5,
    "lng": 35.5,
    "zoom": 10,
    "era": "Second Temple Judea (c. 150 BC – AD 68)",
    "biblicalEvents": [
      "Site of ancient Sodom and Gomorrah in the Valley of Siddim (Genesis 14, 19)",
      "David takes refuge in the desert strongholds of En Gedi (1 Samuel 23-24)",
      "Ezekiel's prophecy of living waters flowing from the Temple to heal the Dead Sea (Ezekiel 47:8-10)"
    ],
    "description": "Hypersaline lake situated at the lowest land elevation on Earth (1,410 feet below sea level).",
    "scriptureReferences": [
      "Genesis 19",
      "1 Samuel 24",
      "Ezekiel 47:8-10"
    ],
    "archaeologicalNotes": "Qumran caves where the Dead Sea Scrolls (including the Great Isaiah Scroll) were discovered in 1947.",
    "routeKey": "jesus_ministry"
  }
};

export const BIBLICAL_JOURNEYS: Record<string, { name: string; description: string; coordinates: number[][] }> = {
  "abraham": {
    "name": "Abraham's Journey of Faith (Genesis 11–22)",
    "description": "From Ur in Chaldea through Haran, Shechem, Bethel, Hebron, and Beersheba to Mount Moriah.",
    "coordinates": [
      [
        30.9625,
        46.103
      ],
      [
        36.8647,
        39.0272
      ],
      [
        32.2133,
        35.2819
      ],
      [
        31.93,
        35.22
      ],
      [
        31.529,
        35.093
      ],
      [
        31.245,
        34.79
      ],
      [
        31.778,
        35.2354
      ]
    ]
  },
  "patriarchs": {
    "name": "The Patriarchal Highway (The Way of the Patriarchs)",
    "description": "The ancient central ridge route connecting Shechem, Bethel, Hebron, and Beersheba.",
    "coordinates": [
      [
        32.2133,
        35.2819
      ],
      [
        31.93,
        35.22
      ],
      [
        31.7054,
        35.2024
      ],
      [
        31.529,
        35.093
      ],
      [
        31.245,
        34.79
      ]
    ]
  },
  "pauls_journey": {
    "name": "Paul's Second Missionary Journey (Acts 15–18)",
    "description": "From Antioch through Galatia, Philippi, Thessalonica, Berea, Athens, Corinth, and Ephesus.",
    "coordinates": [
      [
        36.2021,
        36.1606
      ],
      [
        37,
        32.5
      ],
      [
        40.9333,
        24.4167
      ],
      [
        40.6401,
        22.9444
      ],
      [
        40.5236,
        22.2045
      ],
      [
        37.9719,
        23.7258
      ],
      [
        37.906,
        22.88
      ],
      [
        37.94,
        27.34
      ],
      [
        31.7767,
        35.2345
      ]
    ]
  },
  "jesus_ministry": {
    "name": "Jesus' Earthly Ministry in Judea, Samaria & Galilee",
    "description": "Movements between Bethlehem, Nazareth, Jordan River, Capernaum, and Jerusalem.",
    "coordinates": [
      [
        31.7054,
        35.2024
      ],
      [
        32.702,
        35.302
      ],
      [
        31.836,
        35.546
      ],
      [
        31.8667,
        35.45
      ],
      [
        32.88,
        35.575
      ],
      [
        31.7767,
        35.2345
      ]
    ]
  },
  "paul_to_rome": {
    "name": "Paul's Voyage to Rome (Acts 27–28)",
    "description": "From Caesarea by sea through Crete, shipwreck on Malta, to the Imperial Capital of Rome.",
    "coordinates": [
      [
        32.5,
        34.892
      ],
      [
        33.563,
        35.369
      ],
      [
        36.25,
        29.98
      ],
      [
        34.98,
        24.75
      ],
      [
        35.9,
        14.4
      ],
      [
        37.0755,
        15.2866
      ],
      [
        40.82,
        14.12
      ],
      [
        41.8902,
        12.4922
      ]
    ]
  },
  "exodus": {
    "name": "The Exodus & Wilderness Journey",
    "description": "From Goshen in Egypt through the Red Sea crossing to Mount Sinai.",
    "coordinates": [
      [
        30.5,
        31.8
      ],
      [
        29.9668,
        32.5498
      ],
      [
        28.5392,
        33.9753
      ]
    ]
  }
};

export const CHAPTER_MICRO_EVENTS: Record<string, ChapterGeoData> = {
  "genesis_1": {
    "bookId": "genesis",
    "chapterNumber": 1,
    "chapterTitle": "Creation of the Heavens & the Earth",
    "region": "Mesopotamia / Ancient Near East",
    "centerLat": 31,
    "centerLng": 47,
    "defaultZoom": 6,
    "events": [
      {
        "id": "gen1_event1",
        "stepNumber": 1,
        "title": "God Creates the Heavens and the Earth",
        "passageRef": "Genesis 1:1–25",
        "verseRange": [
          1,
          25
        ],
        "locationName": "Primeval Creation Panorama (Ancient Near East)",
        "shortPlaceName": "Cosmic Creation",
        "modernLocation": "Cradle of Civilization, Ancient Near East",
        "lat": 31,
        "lng": 47,
        "description": "In the beginning, God created the heavens and the earth out of nothing (ex nihilo) by His divine Word across six days.",
        "theologicalSignificance": "The sovereign Creator God over all material and spiritual realities."
      },
      {
        "id": "gen1_event2",
        "stepNumber": 2,
        "title": "Creation of Mankind in the Image of God",
        "passageRef": "Genesis 1:26–31",
        "verseRange": [
          26,
          31
        ],
        "locationName": "Eden Alluvial Basin",
        "shortPlaceName": "Garden of Eden",
        "modernLocation": "Tigris & Euphrates confluence, Iraq",
        "lat": 31.005,
        "lng": 47.01,
        "description": "God creates man in His own image (Imago Dei), male and female, giving dominion to cultivate and care for the earth.",
        "theologicalSignificance": "Imago Dei and human dignity crowned as the climax of creation."
      }
    ],
    "routeCoordinates": [
      [
        31,
        47
      ],
      [
        31.005,
        47.01
      ]
    ]
  },
  "genesis_2": {
    "bookId": "genesis",
    "chapterNumber": 2,
    "chapterTitle": "The Garden of Eden & The Sabbath Rest",
    "region": "Mesopotamia (Tigris & Euphrates)",
    "centerLat": 31,
    "centerLng": 47,
    "defaultZoom": 7,
    "events": [
      {
        "id": "gen2_event1",
        "stepNumber": 1,
        "title": "Seventh Day: God Rests & Sanctifies the Sabbath",
        "passageRef": "Genesis 2:1–3",
        "verseRange": [
          1,
          3
        ],
        "locationName": "Cradle of Eden",
        "shortPlaceName": "Eden Basin",
        "modernLocation": "Southern Mesopotamia",
        "lat": 31,
        "lng": 47,
        "description": "God finishes His work and rests on the seventh day, blessing it and making it holy.",
        "theologicalSignificance": "Creation ordinance of the Sabbath rest."
      },
      {
        "id": "gen2_event2",
        "stepNumber": 2,
        "title": "Man Formed & Placed in the Garden of Eden",
        "passageRef": "Genesis 2:4–17",
        "verseRange": [
          4,
          17
        ],
        "locationName": "The Garden of Eden (Four Rivers: Pishon, Gihon, Tigris, Euphrates)",
        "shortPlaceName": "Garden of Eden",
        "modernLocation": "Southern Iraq (Al-Qurnah / Euphrates)",
        "lat": 31.015,
        "lng": 47.43,
        "description": "The Lord God forms man from the dust of the ground, breathes life into his nostrils, and plants a garden eastward in Eden with the Tree of Life and Tree of Knowledge.",
        "theologicalSignificance": "Covenant of Works and life in communion with God."
      },
      {
        "id": "gen2_event3",
        "stepNumber": 3,
        "title": "Institution of Marriage: Adam and Eve",
        "passageRef": "Genesis 2:18–25",
        "verseRange": [
          18,
          25
        ],
        "locationName": "Eden Sanctuary",
        "shortPlaceName": "Garden of Eden",
        "modernLocation": "Eden valley",
        "lat": 31.018,
        "lng": 47.435,
        "description": "God fashions woman from Adam's rib. Adam rejoices: 'This at last is bone of my bones and flesh of my flesh.' A man leaves his father and mother and holds fast to his wife.",
        "theologicalSignificance": "Creation ordinance of covenant marriage reflecting Christ and the Church."
      }
    ],
    "routeCoordinates": [
      [
        31,
        47
      ],
      [
        31.015,
        47.43
      ],
      [
        31.018,
        47.435
      ]
    ]
  },
  "genesis_8": {
    "bookId": "genesis",
    "chapterNumber": 8,
    "chapterTitle": "Noah's Ark on Mount Ararat & The Receding Waters",
    "region": "Mount Ararat / Eastern Anatolia",
    "centerLat": 39.7025,
    "centerLng": 44.299,
    "defaultZoom": 8,
    "events": [
      {
        "id": "gen8_event1",
        "stepNumber": 1,
        "title": "The Ark Rests upon the Mountains of Ararat",
        "passageRef": "Genesis 8:1–14",
        "verseRange": [
          1,
          14
        ],
        "locationName": "Mountains of Ararat Summit Ridge",
        "shortPlaceName": "Mount Ararat",
        "modernLocation": "Mount Ararat (Agri Dagi), Eastern Turkey",
        "lat": 39.7025,
        "lng": 44.299,
        "description": "God remembers Noah. The wind dries the waters, and the ark rests upon the mountains of Ararat. The raven and dove are sent forth.",
        "theologicalSignificance": "God's covenant remembrance and preservation of the righteous remnant."
      },
      {
        "id": "gen8_event2",
        "stepNumber": 2,
        "title": "Noah Leaves the Ark & Builds an Altar of Worship",
        "passageRef": "Genesis 8:15–22",
        "verseRange": [
          15,
          22
        ],
        "locationName": "Ararat Foothills (Dogubayazit Plain)",
        "shortPlaceName": "Ararat Foothills",
        "modernLocation": "Dogubayazit, Agri Province, Turkey",
        "lat": 39.55,
        "lng": 44.08,
        "description": "Noah, his family, and all the animals disembark. Noah builds an altar and offers burnt offerings; the Lord promises never again to curse the ground for man's sake.",
        "theologicalSignificance": "Atoning sacrifice initiating the post-flood world."
      }
    ],
    "routeCoordinates": [
      [
        39.7025,
        44.299
      ],
      [
        39.55,
        44.08
      ]
    ]
  },
  "genesis_11": {
    "bookId": "genesis",
    "chapterNumber": 11,
    "chapterTitle": "The Tower of Babel & Abram's Line in Ur and Haran",
    "region": "Mesopotamia (Shinar & Ur to Haran)",
    "centerLat": 33.5,
    "centerLng": 43,
    "defaultZoom": 6,
    "events": [
      {
        "id": "gen11_event1",
        "stepNumber": 1,
        "title": "The Tower of Babel in the Plain of Shinar",
        "passageRef": "Genesis 11:1–9",
        "verseRange": [
          1,
          9
        ],
        "locationName": "Plain of Shinar (Babylon / Babel)",
        "shortPlaceName": "Tower of Babel",
        "modernLocation": "Hillah / Babylon, Iraq",
        "lat": 32.5422,
        "lng": 44.4211,
        "description": "Mankind rebels against God's command to fill the earth, building a tower to reach heaven. The Lord confuses their languages and disperses them.",
        "theologicalSignificance": "Human hubris judged; origin of nations and tongues."
      },
      {
        "id": "gen11_event2",
        "stepNumber": 2,
        "title": "Terah Departs Ur of the Chaldees with Abram",
        "passageRef": "Genesis 11:27–31",
        "verseRange": [
          27,
          31
        ],
        "locationName": "Ur of the Chaldees (Tell el-Muqayyar)",
        "shortPlaceName": "Ur of the Chaldees",
        "modernLocation": "Near Nasiriyah, Dhi Qar Governorate, Iraq",
        "lat": 30.9625,
        "lng": 46.103,
        "description": "Terah takes his son Abram, his grandson Lot, and Sarai his daughter-in-law, setting out from Ur of the Chaldees to journey toward the land of Canaan.",
        "theologicalSignificance": "The initial step of the Patriarchal migration."
      },
      {
        "id": "gen11_event3",
        "stepNumber": 3,
        "title": "Settlement and Terah's Death in Haran",
        "passageRef": "Genesis 11:31–32",
        "verseRange": [
          31,
          32
        ],
        "locationName": "Haran in Paddan-Aram (Upper Mesopotamia)",
        "shortPlaceName": "Haran",
        "modernLocation": "Harran, Sanliurfa Province, Turkey",
        "lat": 36.8647,
        "lng": 39.0272,
        "description": "They come to Haran in northern Mesopotamia and settle there. Terah dies in Haran at age 205.",
        "theologicalSignificance": "Staging ground for God's effectual call to Abram."
      }
    ],
    "routeCoordinates": [
      [
        32.5422,
        44.4211
      ],
      [
        30.9625,
        46.103
      ],
      [
        36.8647,
        39.0272
      ]
    ]
  },
  "genesis_12": {
    "bookId": "genesis",
    "chapterNumber": 12,
    "chapterTitle": "Call of Abram, Journey to Shechem, Bethel & Egypt",
    "region": "Mesopotamia, Canaan & Egypt",
    "centerLat": 34,
    "centerLng": 36.5,
    "defaultZoom": 6,
    "events": [
      {
        "id": "gen12_event1",
        "stepNumber": 1,
        "title": "The Great Call & Abrahamic Covenant in Haran",
        "passageRef": "Genesis 12:1–4",
        "verseRange": [
          1,
          4
        ],
        "locationName": "Haran (Upper Mesopotamia)",
        "shortPlaceName": "Haran",
        "modernLocation": "Harran, Turkey",
        "lat": 36.8647,
        "lng": 39.0272,
        "description": "The Lord commands 75-year-old Abram: 'Go from your country... I will make of you a great nation, and in you all the families of the earth shall be blessed.'",
        "theologicalSignificance": "The Abrahamic Covenant: unconditional promise of land, seed, and universal blessing."
      },
      {
        "id": "gen12_event2",
        "stepNumber": 2,
        "title": "First Altar in Canaan at the Oak of Moreh (Shechem)",
        "passageRef": "Genesis 12:5–7",
        "verseRange": [
          5,
          7
        ],
        "locationName": "Shechem (Oak of Moreh)",
        "shortPlaceName": "Shechem",
        "modernLocation": "Tell Balata, Nablus, West Bank",
        "lat": 32.2133,
        "lng": 35.2819,
        "description": "Abram arrives at Shechem. The Lord appears to him: 'To your offspring I will give this land.' Abram builds his first altar to Yahweh in the Promised Land.",
        "theologicalSignificance": "Claiming the Promised Land through sacrificial worship."
      },
      {
        "id": "gen12_event3",
        "stepNumber": 3,
        "title": "Pitching Tent and Building Altar between Bethel and Ai",
        "passageRef": "Genesis 12:8–9",
        "verseRange": [
          8,
          9
        ],
        "locationName": "Mountain between Bethel and Ai",
        "shortPlaceName": "Bethel & Ai",
        "modernLocation": "Beitin, West Bank",
        "lat": 31.93,
        "lng": 35.22,
        "description": "Abram moves east of Bethel with Bethel on the west and Ai on the east, building an altar and calling upon the name of the Lord.",
        "theologicalSignificance": "Steadfast public worship amidst pagan Canaanite culture."
      },
      {
        "id": "gen12_event4",
        "stepNumber": 4,
        "title": "Famine in the Negev & Descent into Egypt",
        "passageRef": "Genesis 12:10–20",
        "verseRange": [
          10,
          20
        ],
        "locationName": "Nile Delta / Memphis, Egypt",
        "shortPlaceName": "Egypt (Nile Delta)",
        "modernLocation": "Mit Rahina / Cairo area, Egypt",
        "lat": 29.8497,
        "lng": 31.2547,
        "description": "Severe famine strikes Canaan. Abram goes down to Egypt. Pharaoh takes Sarai into his house, but God plagues Pharaoh, who sends Abram away with great wealth.",
        "theologicalSignificance": "Providential preservation of the covenant promise despite human failure."
      }
    ],
    "routeCoordinates": [
      [
        36.8647,
        39.0272
      ],
      [
        32.2133,
        35.2819
      ],
      [
        31.93,
        35.22
      ],
      [
        29.8497,
        31.2547
      ]
    ]
  },
  "genesis_18": {
    "bookId": "genesis",
    "chapterNumber": 18,
    "chapterTitle": "Three Heavenly Visitors at Mamre & Intercession for Sodom",
    "region": "Hebron & Dead Sea Region",
    "centerLat": 31.4,
    "centerLng": 35.2,
    "defaultZoom": 10,
    "events": [
      {
        "id": "gen18_event1",
        "stepNumber": 1,
        "title": "The Lord and Two Angels Visit Abraham at the Oaks of Mamre",
        "passageRef": "Genesis 18:1–15",
        "verseRange": [
          1,
          15
        ],
        "locationName": "Oaks of Mamre, Hebron",
        "shortPlaceName": "Hebron (Mamre)",
        "modernLocation": "Ramat al-Khalil / Hebron, West Bank",
        "lat": 31.545,
        "lng": 35.105,
        "description": "As Abraham sits by his tent in the heat of the day, three men appear. Abraham prepares a feast. The Lord promises: 'Sarah your wife shall have a son by this time next year.' Sarah laughs, but the Lord replies: 'Is anything too hard for the Lord?'",
        "theologicalSignificance": "Christophany / divine visitation and the promise of Isaac's miraculous birth."
      },
      {
        "id": "gen18_event2",
        "stepNumber": 2,
        "title": "Abraham Intercedes Overlooking the Plain of Sodom",
        "passageRef": "Genesis 18:16–33",
        "verseRange": [
          16,
          33
        ],
        "locationName": "Hebron Eastern Ridge overlooking the Dead Sea",
        "shortPlaceName": "Hebron Ridge",
        "modernLocation": "Bani Na'im / Judean Desert Overlook",
        "lat": 31.515,
        "lng": 35.16,
        "description": "The men look down toward Sodom. Abraham draws near in bold intercession: 'Will you sweep away the righteous with the wicked? Far be it from the Judge of all the earth to not do right!' God agrees to spare the city if even ten righteous are found.",
        "theologicalSignificance": "The supreme pattern of covenant intercession based on God's righteousness and justice."
      }
    ],
    "routeCoordinates": [
      [
        31.545,
        35.105
      ],
      [
        31.515,
        35.16
      ]
    ]
  },
  "genesis_22": {
    "bookId": "genesis",
    "chapterNumber": 22,
    "chapterTitle": "The Binding of Isaac (Akedah) on Mount Moriah",
    "region": "Negev & Mount Moriah",
    "centerLat": 31.5,
    "centerLng": 35,
    "defaultZoom": 9,
    "events": [
      {
        "id": "gen22_event1",
        "stepNumber": 1,
        "title": "God Tests Abraham: Departure from Beersheba",
        "passageRef": "Genesis 22:1–5",
        "verseRange": [
          1,
          5
        ],
        "locationName": "Beersheba (Tamarisk Tree & Wells)",
        "shortPlaceName": "Beersheba",
        "modernLocation": "Tel Sheva, Israel",
        "lat": 31.245,
        "lng": 34.79,
        "description": "God commands Abraham: 'Take your son, your only son Isaac, whom you love, and go to the land of Moriah, and offer him there as a burnt offering.' Abraham rises early and journeys three days.",
        "theologicalSignificance": "Faith that obeys without hesitation, believing God could raise the dead."
      },
      {
        "id": "gen22_event2",
        "stepNumber": 2,
        "title": "Ascent of Mount Moriah & The Ram in the Thicket",
        "passageRef": "Genesis 22:6–14",
        "verseRange": [
          6,
          14
        ],
        "locationName": "Mount Moriah Ridge (The Mountain of the Lord)",
        "shortPlaceName": "Mount Moriah",
        "modernLocation": "Mount Moriah / Temple Mount ridge",
        "lat": 31.778,
        "lng": 35.2354,
        "description": "Isaac carries the wood; Abraham carries the fire and knife. Isaac asks: 'Where is the lamb for a burnt offering?' Abraham replies: 'God will provide for Himself the lamb.' Angel stops Abraham's hand; a ram caught in a thicket is sacrificed. Named Yahweh-Yireh ('The LORD will provide').",
        "theologicalSignificance": "Ultimate Old Testament typology of God the Father offering His only beloved Son as substitutionary sacrifice."
      },
      {
        "id": "gen22_event3",
        "stepNumber": 3,
        "title": "Oath of Universal Blessing & Return to Beersheba",
        "passageRef": "Genesis 22:15–24",
        "verseRange": [
          15,
          24
        ],
        "locationName": "Beersheba Oasis",
        "shortPlaceName": "Beersheba",
        "modernLocation": "Beersheba, Negev, Israel",
        "lat": 31.245,
        "lng": 34.79,
        "description": "The Angel of the Lord swears by Himself to multiply Abraham's seed like stars and sand. Abraham returns with his young men and settles at Beersheba.",
        "theologicalSignificance": "The confirmed covenant oath sealed on Mount Moriah."
      }
    ],
    "routeCoordinates": [
      [
        31.245,
        34.79
      ],
      [
        31.778,
        35.2354
      ],
      [
        31.245,
        34.79
      ]
    ]
  },
  "genesis_28": {
    "bookId": "genesis",
    "chapterNumber": 28,
    "chapterTitle": "Jacob's Dream at Bethel (The Ladder to Heaven)",
    "region": "Beersheba to Bethel & Haran",
    "centerLat": 31.6,
    "centerLng": 35,
    "defaultZoom": 9,
    "events": [
      {
        "id": "gen28_event1",
        "stepNumber": 1,
        "title": "Isaac Blesses Jacob & Sends Him from Beersheba",
        "passageRef": "Genesis 28:1–9",
        "verseRange": [
          1,
          9
        ],
        "locationName": "Beersheba Tents",
        "shortPlaceName": "Beersheba",
        "modernLocation": "Beersheba, Negev",
        "lat": 31.245,
        "lng": 34.79,
        "description": "Isaac blesses Jacob with the blessing of Abraham, charging him not to take a Canaanite wife but to go to Paddan-Aram to the house of Bethuel.",
        "theologicalSignificance": "Transference of the covenant blessing to Jacob."
      },
      {
        "id": "gen28_event2",
        "stepNumber": 2,
        "title": "Jacob's Ladder Dream at Luz (Bethel: House of God)",
        "passageRef": "Genesis 28:10–22",
        "verseRange": [
          10,
          22
        ],
        "locationName": "Bethel (Ancient Luz Ridge)",
        "shortPlaceName": "Bethel",
        "modernLocation": "Beitin, West Bank",
        "lat": 31.93,
        "lng": 35.22,
        "description": "Sleeping with a stone for a pillow, Jacob dreams of a ladder set up on earth reaching to heaven with the angels of God ascending and descending. The Lord stands above it confirming the covenant. Jacob awakes: 'How awesome is this place! This is none other than the house of God (Bethel), and this is the gate of heaven.' Sets up the stone as a pillar.",
        "theologicalSignificance": "Christ the true Ladder connecting heaven and earth (John 1:51)."
      }
    ],
    "routeCoordinates": [
      [
        31.245,
        34.79
      ],
      [
        31.93,
        35.22
      ]
    ]
  },
  "genesis_37": {
    "bookId": "genesis",
    "chapterNumber": 37,
    "chapterTitle": "Joseph's Dreams & Betrayal in Dothan",
    "region": "Hebron, Shechem & Dothan",
    "centerLat": 31.95,
    "centerLng": 35.15,
    "defaultZoom": 8,
    "events": [
      {
        "id": "gen37_event1",
        "stepNumber": 1,
        "title": "Joseph's Dreams & Coat of Many Colors in Hebron",
        "passageRef": "Genesis 37:1–11",
        "verseRange": [
          1,
          11
        ],
        "locationName": "Valley of Hebron",
        "shortPlaceName": "Hebron Valley",
        "modernLocation": "Hebron, West Bank",
        "lat": 31.529,
        "lng": 35.093,
        "description": "Jacob loves 17-year-old Joseph and gives him an ornate tunic. Joseph dreams of sheaves and the sun, moon, and eleven stars bowing before him, provoking his brothers' envy.",
        "theologicalSignificance": "Divine revelation of sovereign elevation through humble suffering."
      },
      {
        "id": "gen37_event2",
        "stepNumber": 2,
        "title": "Joseph Searches for Brothers in Shechem",
        "passageRef": "Genesis 37:12–17",
        "verseRange": [
          12,
          17
        ],
        "locationName": "Fields of Shechem (Balata)",
        "shortPlaceName": "Shechem",
        "modernLocation": "Shechem / Nablus, West Bank",
        "lat": 32.2133,
        "lng": 35.2819,
        "description": "Israel sends Joseph from the valley of Hebron to check on the welfare of his brothers. A man tells Joseph: 'They have gone to Dothan.'",
        "theologicalSignificance": "Faithful obedience leading Joseph into harm's way."
      },
      {
        "id": "gen37_event3",
        "stepNumber": 3,
        "title": "Thrown into Cistern & Sold to Traders in Dothan",
        "passageRef": "Genesis 37:18–36",
        "verseRange": [
          18,
          36
        ],
        "locationName": "Dothan Valley (Trade Route to Egypt)",
        "shortPlaceName": "Dothan",
        "modernLocation": "Tell Dothan, West Bank",
        "lat": 32.4167,
        "lng": 35.24,
        "description": "Brothers strip Joseph's coat and cast him into an empty cistern. At Judah's suggestion, they sell him for twenty shekels of silver to Midianite-Ishmaelite merchants going down to Egypt.",
        "theologicalSignificance": "Typology of Christ betrayed and sold by His brothers, yet used to save many alive."
      }
    ],
    "routeCoordinates": [
      [
        31.529,
        35.093
      ],
      [
        32.2133,
        35.2819
      ],
      [
        32.4167,
        35.24
      ]
    ]
  },
  "genesis_50": {
    "bookId": "genesis",
    "chapterNumber": 50,
    "chapterTitle": "Burial of Jacob in Hebron & Joseph's Forgiveness",
    "region": "Egypt & Hebron",
    "centerLat": 31,
    "centerLng": 33.5,
    "defaultZoom": 7,
    "events": [
      {
        "id": "gen50_event1",
        "stepNumber": 1,
        "title": "Jacob Embalmed & Mourned in Goshen",
        "passageRef": "Genesis 50:1–6",
        "verseRange": [
          1,
          6
        ],
        "locationName": "Land of Goshen (Nile Delta)",
        "shortPlaceName": "Goshen (Egypt)",
        "modernLocation": "Sharqia Governorate, Egypt",
        "lat": 30.787,
        "lng": 31.821,
        "description": "Joseph falls on his father's face, weeping. Physicians embalm Jacob for 40 days; Egypt mourns him for 70 days. Pharaoh grants permission for burial in Canaan.",
        "theologicalSignificance": "Royal honor bestowed upon the Patriarch of Israel."
      },
      {
        "id": "gen50_event2",
        "stepNumber": 2,
        "title": "Funeral Procession to the Cave of Machpelah in Hebron",
        "passageRef": "Genesis 50:7–14",
        "verseRange": [
          7,
          14
        ],
        "locationName": "Cave of Machpelah, Hebron",
        "shortPlaceName": "Hebron (Machpelah)",
        "modernLocation": "Hebron, West Bank",
        "lat": 31.529,
        "lng": 35.093,
        "description": "A huge procession of Egyptian chariots and Israelite family journeys to Hebron, burying Jacob in the Cave of Machpelah alongside Abraham, Sarah, Isaac, Rebekah, and Leah.",
        "theologicalSignificance": "Faith in the resurrection and the eternal inheritance of the Promised Land."
      },
      {
        "id": "gen50_event3",
        "stepNumber": 3,
        "title": "Joseph Forgives Brothers: 'God Meant It for Good'",
        "passageRef": "Genesis 50:15–26",
        "verseRange": [
          15,
          26
        ],
        "locationName": "Land of Goshen, Egypt",
        "shortPlaceName": "Goshen (Egypt)",
        "modernLocation": "Egypt",
        "lat": 30.787,
        "lng": 31.821,
        "description": "Brothers fear revenge. Joseph weeps and reassures them: 'Do not fear, for am I in the place of God? As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive.' Joseph dies in faith at 110.",
        "theologicalSignificance": "The supreme declaration of divine sovereignty overruling human malice for salvation."
      }
    ],
    "routeCoordinates": [
      [
        30.787,
        31.821
      ],
      [
        31.529,
        35.093
      ],
      [
        30.787,
        31.821
      ]
    ]
  }
};

export function getChapterGeoData(bookId: string, chapterNum: number): ChapterGeoData {
  const key = `${bookId.toLowerCase()}_${chapterNum}`;
  if (CHAPTER_MICRO_EVENTS[key]) {
    return CHAPTER_MICRO_EVENTS[key];
  }

  const fallbackLoc = getLocationForPassage(bookId, chapterNum);
  const cleanBook = bookId.charAt(0).toUpperCase() + bookId.slice(1).toLowerCase();
  
  return {
    bookId: bookId.toLowerCase(),
    chapterNumber: chapterNum,
    chapterTitle: `${cleanBook} Chapter ${chapterNum}`,
    region: fallbackLoc.modernCountry,
    centerLat: fallbackLoc.lat,
    centerLng: fallbackLoc.lng,
    defaultZoom: fallbackLoc.zoom,
    events: [
      {
        id: `${key}_ev1`,
        stepNumber: 1,
        title: `${fallbackLoc.name} (${cleanBook} ${chapterNum})`,
        passageRef: `${cleanBook} ${chapterNum}:1–15`,
        verseRange: [1, 15],
        locationName: fallbackLoc.name,
        shortPlaceName: getShortPlaceName({ locationName: fallbackLoc.name }),
        modernLocation: fallbackLoc.modernCountry,
        lat: fallbackLoc.lat,
        lng: fallbackLoc.lng,
        description: `Historical events recorded in ${cleanBook} chapter ${chapterNum}, situated in ${fallbackLoc.name}.`,
        theologicalSignificance: fallbackLoc.biblicalEvents[0] || "Historical biblical event fulfilling God's redemptive purpose."
      }
    ],
    routeCoordinates: [
      [fallbackLoc.lat, fallbackLoc.lng]
    ]
  };
}

export function getLocationForPassage(bookId: string, chapterNum: number): GeoLocation {
  const bookKey = bookId.toLowerCase();

  // --------------------------------------------------------------------------
  // GENESIS (Patriarchal & Primeval Geography - Pre-Davidic Jerusalem)
  // --------------------------------------------------------------------------
  if (bookKey === "genesis") {
    // Primeval History: Eden, Ararat, Babel & Ur
    if (chapterNum <= 7) return BIBLICAL_LOCATIONS.eden_mesopotamia;
    if (chapterNum >= 8 && chapterNum <= 10) return BIBLICAL_LOCATIONS.mount_ararat;
    if (chapterNum === 11) return BIBLICAL_LOCATIONS.ur_chaldees;

    // Abraham's Call & Journeys
    if (chapterNum === 12) return BIBLICAL_LOCATIONS.shechem;
    if (chapterNum === 13) return BIBLICAL_LOCATIONS.hebron;
    if (chapterNum === 14) return BIBLICAL_LOCATIONS.hebron;
    if (chapterNum >= 15 && chapterNum <= 19) return BIBLICAL_LOCATIONS.hebron;
    if (chapterNum === 20 || chapterNum === 21) return BIBLICAL_LOCATIONS.beersheba;
    if (chapterNum === 22) return BIBLICAL_LOCATIONS.beersheba;
    if (chapterNum === 23) return BIBLICAL_LOCATIONS.hebron;
    if (chapterNum === 24) return BIBLICAL_LOCATIONS.beersheba;
    if (chapterNum === 25 || chapterNum === 26) return BIBLICAL_LOCATIONS.beersheba;

    // Jacob & Esau
    if (chapterNum === 27) return BIBLICAL_LOCATIONS.beersheba;
    if (chapterNum === 28) return BIBLICAL_LOCATIONS.bethel;
    if (chapterNum >= 29 && chapterNum <= 31) return BIBLICAL_LOCATIONS.haran;
    if (chapterNum === 32) return BIBLICAL_LOCATIONS.peniel_jabbok;
    if (chapterNum === 33 || chapterNum === 34) return BIBLICAL_LOCATIONS.shechem;
    if (chapterNum === 35) return BIBLICAL_LOCATIONS.bethel;
    if (chapterNum === 36) return BIBLICAL_LOCATIONS.hebron;

    // Joseph & Israel in Egypt
    if (chapterNum === 37) return BIBLICAL_LOCATIONS.dothan;
    if (chapterNum >= 38 && chapterNum <= 45) return BIBLICAL_LOCATIONS.goshen_egypt;
    if (chapterNum === 46) return BIBLICAL_LOCATIONS.beersheba;
    if (chapterNum >= 47 && chapterNum <= 50) return BIBLICAL_LOCATIONS.goshen_egypt;

    return BIBLICAL_LOCATIONS.hebron;
  }

  // --------------------------------------------------------------------------
  // EXODUS & PENTATEUCH
  // --------------------------------------------------------------------------
  if (bookKey === "exodus") {
    if (chapterNum <= 13) return BIBLICAL_LOCATIONS.goshen_egypt;
    if (chapterNum >= 14 && chapterNum <= 18) return BIBLICAL_LOCATIONS.mount_sinai;
    return BIBLICAL_LOCATIONS.mount_sinai;
  }
  if (bookKey === "leviticus" || bookKey === "numbers" || bookKey === "deuteronomy") {
    return BIBLICAL_LOCATIONS.mount_sinai;
  }

  // --------------------------------------------------------------------------
  // HISTORICAL BOOKS & PROPHETS
  // --------------------------------------------------------------------------
  if (bookKey === "joshua") return BIBLICAL_LOCATIONS.jericho;
  if (bookKey === "judges" || bookKey === "ruth") return BIBLICAL_LOCATIONS.bethlehem;
  if (bookKey.includes("kings") && (chapterNum === 18 || chapterNum === 19)) {
    return BIBLICAL_LOCATIONS.mount_carmel;
  }
  if (bookKey === "esther") return BIBLICAL_LOCATIONS.susa_persia;
  if (bookKey === "daniel") return BIBLICAL_LOCATIONS.babylon_ancient;
  if (bookKey === "ezekiel") return BIBLICAL_LOCATIONS.babylon_ancient;

  // --------------------------------------------------------------------------
  // GOSPEL OF JOHN
  // --------------------------------------------------------------------------
  if (bookKey === "john") {
    if (chapterNum === 1) return BIBLICAL_LOCATIONS.jordan_river;
    if (chapterNum === 2) return BIBLICAL_LOCATIONS.nazareth;
    if (chapterNum === 3) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum === 4) return BIBLICAL_LOCATIONS.jordan_river;
    if (chapterNum === 5) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum === 6) return BIBLICAL_LOCATIONS.galilee;
    if (chapterNum >= 7 && chapterNum <= 10) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum === 11) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum >= 12 && chapterNum <= 20) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum === 21) return BIBLICAL_LOCATIONS.galilee;
    return BIBLICAL_LOCATIONS.jerusalem;
  }

  // --------------------------------------------------------------------------
  // ACTS OF THE APOSTLES
  // --------------------------------------------------------------------------
  if (bookKey === "acts") {
    if (chapterNum <= 7) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum === 8 || chapterNum === 9) return BIBLICAL_LOCATIONS.damascus;
    if (chapterNum === 10) return BIBLICAL_LOCATIONS.caesarea;
    if (chapterNum >= 11 && chapterNum <= 14) return BIBLICAL_LOCATIONS.antioch;
    if (chapterNum === 15) return BIBLICAL_LOCATIONS.jerusalem;
    if (chapterNum === 16) return BIBLICAL_LOCATIONS.philippi;
    if (chapterNum === 17) return BIBLICAL_LOCATIONS.berea;
    if (chapterNum === 18) return BIBLICAL_LOCATIONS.corinth;
    if (chapterNum === 19 || chapterNum === 20) return BIBLICAL_LOCATIONS.ephesus;
    if (chapterNum >= 21 && chapterNum <= 26) return BIBLICAL_LOCATIONS.caesarea;
    if (chapterNum >= 27) return BIBLICAL_LOCATIONS.rome;
    return BIBLICAL_LOCATIONS.berea;
  }

  // --------------------------------------------------------------------------
  // SYNOPTIC GOSPELS
  // --------------------------------------------------------------------------
  if (bookKey === "matthew") {
    if (chapterNum <= 2) return BIBLICAL_LOCATIONS.bethlehem;
    if (chapterNum >= 3 && chapterNum <= 18) return BIBLICAL_LOCATIONS.galilee;
    return BIBLICAL_LOCATIONS.jerusalem;
  }
  if (bookKey === "mark") {
    if (chapterNum <= 10) return BIBLICAL_LOCATIONS.galilee;
    return BIBLICAL_LOCATIONS.jerusalem;
  }
  if (bookKey === "luke") {
    if (chapterNum <= 2) return BIBLICAL_LOCATIONS.nazareth;
    if (chapterNum === 19) return BIBLICAL_LOCATIONS.jericho;
    return BIBLICAL_LOCATIONS.jerusalem;
  }

  // --------------------------------------------------------------------------
  // EPISTLES & REVELATION
  // --------------------------------------------------------------------------
  if (bookKey === "romans") return BIBLICAL_LOCATIONS.rome;
  if (bookKey.includes("corinthians")) return BIBLICAL_LOCATIONS.corinth;
  if (bookKey === "galatians") return BIBLICAL_LOCATIONS.antioch;
  if (bookKey === "ephesians") return BIBLICAL_LOCATIONS.ephesus;
  if (bookKey === "philippians") return BIBLICAL_LOCATIONS.philippi;
  if (bookKey === "colossians") return BIBLICAL_LOCATIONS.ephesus;
  if (bookKey.includes("thessalonians")) return BIBLICAL_LOCATIONS.thessalonica;
  if (bookKey.includes("timothy") || bookKey === "titus") return BIBLICAL_LOCATIONS.ephesus;
  if (bookKey === "hebrews") return BIBLICAL_LOCATIONS.jerusalem;
  if (bookKey.includes("peter")) return BIBLICAL_LOCATIONS.rome;
  if (bookKey === "revelation") return BIBLICAL_LOCATIONS.patmos;

  return BIBLICAL_LOCATIONS.jerusalem;
}
