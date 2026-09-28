import {
  RouteSegment,
  getHistoricalRouteSegments,
  getRouteJourneyStats,
  HISTORICAL_ROAD_SEGMENTS
} from './historicalRoutes';
import { getChapterSetting, ChapterHistoricalSetting } from './biblicalSettings';

export type { RouteSegment, ChapterHistoricalSetting };
export { getHistoricalRouteSegments, getRouteJourneyStats, HISTORICAL_ROAD_SEGMENTS, getChapterSetting };

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
  verseRange: number[];
  locationName: string;
  shortPlaceName?: string;
  modernLocation: string;
  lat: number;
  lng: number;
  description: string;
  theologicalSignificance: string;
  icon?: string;
  isEducatedGuess?: boolean;
  isReferencedOnly?: boolean;
  isDeparturePoint?: boolean;
  departureFromChapter?: string;
  distanceFromPrevious?: number;
}

export function cleanDisambiguatedPlaceName(rawName?: string): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  if (trimmed === 'Antioch 2') return 'Antioch (Pisidia)';
  if (trimmed === 'Antioch 1') return 'Antioch (Syria)';
  // Strip any trailing gazetteer index number, e.g. "Bethlehem 1" -> "Bethlehem", "City of Palms 2" -> "City of Palms"
  return trimmed.replace(/\s+\d+$/, '');
}

export function getShortPlaceName(ev: { shortPlaceName?: string; locationName: string; title?: string }): string {
  const raw = ev.shortPlaceName || ev.locationName || ev.title || 'Biblical Site';
  let name = cleanDisambiguatedPlaceName(raw)
    .replace(/\s*\([^)]*\)/g, "")
    .split(",")[0]
    .split("—")[0]
    .split("/")[0]
    .trim();

  name = name.replace(/\s+(Synagogue|Forum|Marketplace|Harbor|Port|Colonnade|Courts|Sanctuary|Plaza|Ridge|Highway|Road|Precinct|Area|Gate|Springs|Waters|Caves|Hills|Summit|Peak|Massif|Coast|Shoreline|Environs|Village|Outskirts|House|Estate|Rock).*$/i, " $1");
  name = name.replace(/^Ancient\s+/i, "");
  name = name.replace(/\s+&.*$/i, "");

  const cleaned = cleanDisambiguatedPlaceName(name);
  return cleaned || cleanDisambiguatedPlaceName(ev.locationName) || "Biblical Site";
}

export function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const rlat1 = lat1 * (Math.PI / 180);
  const rlat2 = lat2 * (Math.PI / 180);
  const difflat = rlat2 - rlat1;
  const difflon = (lon2 - lon1) * (Math.PI / 180);

  const a = 2 * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  const d = R * a;
  if (d === 0) return 0;
  if (d < 1) return Number(d.toFixed(2));
  return Math.round(d);
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
  routeSegments?: RouteSegment[];
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
import GEO_DATABASE from './geoDatabase.json';

export const CHAPTER_MICRO_EVENTS: Record<string, ChapterGeoData> = GEO_DATABASE as Record<string, ChapterGeoData>;


export interface ChapterDepartureLink {
  fromChapterLabel: string;
  locationName: string;
  shortPlaceName?: string;
  modernLocation: string;
  lat: number;
  lng: number;
  passageRef: string;
  title?: string;
  description: string;
  theologicalSignificance?: string;
}

export const CHAPTER_DEPARTURE_LINKS: Record<string, ChapterDepartureLink> = {
  // Acts of the Apostles
  "acts_8": {
    fromChapterLabel: "Acts 7",
    locationName: "Jerusalem",
    shortPlaceName: "Jerusalem",
    modernLocation: "Jerusalem, Israel",
    lat: 31.7767,
    lng: 35.2345,
    passageRef: "Acts 8:1",
    title: "Jerusalem (Departure)",
    description: "Following Stephen's martyrdom in Acts 7, severe persecution arose against the church in Jerusalem, scattering believers abroad and sending Philip north to preach Christ in Samaria.",
    theologicalSignificance: "The sovereign dispersal of the gospel seed beyond Judea into Samaria in fulfillment of Acts 1:8."
  },
  "acts_10": {
    fromChapterLabel: "Acts 9",
    locationName: "Joppa",
    shortPlaceName: "Joppa",
    modernLocation: "Jaffa, Tel Aviv, Israel",
    lat: 32.0536,
    lng: 34.7558,
    passageRef: "Acts 10:23",
    title: "Joppa (Departure)",
    description: "Seaport town where Peter was lodging with Simon the tanner at the close of Acts 9 (Acts 9:43), departing northward along the coast to Caesarea to visit the Roman centurion Cornelius.",
    theologicalSignificance: "The Holy Spirit orchestrating the historic breakthrough of the gospel to the Gentile world."
  },
  "acts_14": {
    fromChapterLabel: "Acts 13",
    locationName: "Antioch (Pisidia)",
    shortPlaceName: "Antioch (Pisidia)",
    modernLocation: "Yalvac, Isparta, Turkey",
    lat: 38.3050,
    lng: 31.1890,
    passageRef: "Acts 14:1",
    title: "Antioch in Pisidia (Departure)",
    description: "Paul and Barnabas were expelled from Pisidian Antioch at the close of Acts 13 (Acts 13:51), shaking the dust from their feet and journeying southeast along the Via Sebaste toward Iconium.",
    theologicalSignificance: "Apostolic perseverance under persecution, opening the door of faith across southern Galatia."
  },
  "acts_16": {
    fromChapterLabel: "Acts 15",
    locationName: "Antioch (Syria)",
    shortPlaceName: "Antioch (Syria)",
    modernLocation: "Antakya, Hatay, Turkey",
    lat: 36.2021,
    lng: 36.1606,
    passageRef: "Acts 16:1",
    title: "Antioch in Syria (Departure)",
    description: "The sending mother church in Syrian Antioch where Paul and Silas set out on the Second Missionary Journey (Acts 15:40-41), traversing through Syria and Cilicia to reach Derbe.",
    theologicalSignificance: "The launch of the second missionary campaign delivering the Jerusalem Council decrees to the churches."
  },
  "acts_17": {
    fromChapterLabel: "Acts 16",
    locationName: "Philippi",
    shortPlaceName: "Philippi",
    modernLocation: "Krinides, Kavala, Greece",
    lat: 41.0135,
    lng: 24.2866,
    passageRef: "Acts 17:1",
    title: "Philippi (Departure)",
    description: "Point of departure along the Via Egnatia where Paul and Silas departed after their miraculous release from prison and encouragement of the brethren in Lydia's home (Acts 16:40).",
    theologicalSignificance: "The gospel advancing westward along the premier Roman military artery into the heart of Macedonia."
  },
  "acts_18": {
    fromChapterLabel: "Acts 17",
    locationName: "Athens",
    shortPlaceName: "Athens",
    modernLocation: "Athens, Greece",
    lat: 37.9715,
    lng: 23.7257,
    passageRef: "Acts 18:1",
    title: "Athens (Departure)",
    description: "Paul departed from Athens following his proclamation of the Unknown God on the Areopagus (Acts 17:22-34), journeying across the Isthmus of Corinth to found the church in Corinth.",
    theologicalSignificance: "Transitioning from philosophical inquiry in Athens to establishing an enduring apostolic community in Corinth."
  },
  "acts_20": {
    fromChapterLabel: "Acts 19",
    locationName: "Ephesus",
    shortPlaceName: "Ephesus",
    modernLocation: "Selcuk, Izmir, Turkey",
    lat: 37.9497,
    lng: 27.3639,
    passageRef: "Acts 20:1",
    title: "Ephesus (Departure)",
    description: "Following the great uproar in the theater of Ephesus at the close of Acts 19, Paul called the disciples, embraced them, and departed northward toward Troas and Macedonia.",
    theologicalSignificance: "Triumphant perseverance of the apostolic mission following public spiritual confrontation in Asia."
  },
  "acts_21": {
    fromChapterLabel: "Acts 20",
    locationName: "Miletus",
    shortPlaceName: "Miletus",
    modernLocation: "Balat, Didim, Turkey",
    lat: 37.5305,
    lng: 27.2783,
    passageRef: "Acts 21:1",
    title: "Miletus (Departure)",
    description: "Ancient Ionian seaport where Paul knelt in prayer and bade an affectionate farewell to the Ephesian elders on the beach (Acts 20:36-38), boarding ship to launch straight for Cos.",
    theologicalSignificance: "Steadfast resolve to complete the ministry received from the Lord Jesus, traveling toward Jerusalem."
  },
  "acts_27": {
    fromChapterLabel: "Acts 26",
    locationName: "Caesarea",
    shortPlaceName: "Caesarea",
    modernLocation: "Caesarea Maritima, Israel",
    lat: 32.5011,
    lng: 34.8916,
    passageRef: "Acts 27:1",
    title: "Caesarea (Departure)",
    description: "Roman provincial capital and deep-water harbor where Paul was imprisoned under Felix and Festus (Acts 23-26), from whose docks he was embarked under Julius the centurion for Rome.",
    theologicalSignificance: "The sovereign outworking of divine providence carrying the apostle to testify before Caesar in Rome."
  },

  // Exodus & Wilderness Journeys
  "exodus_13": {
    fromChapterLabel: "Exodus 12",
    locationName: "Rameses",
    shortPlaceName: "Rameses",
    modernLocation: "Qantir / Tell el-Dab'a, Egypt",
    lat: 30.7870,
    lng: 31.8210,
    passageRef: "Exodus 13:20",
    title: "Rameses (Departure)",
    description: "The starting hub of the Exodus in the land of Goshen from which Israel marched out by their armies at the close of Passover night.",
    theologicalSignificance: "The great redemption from Egyptian bondage under the blood of the Passover Lamb."
  },
  "exodus_14": {
    fromChapterLabel: "Exodus 13",
    locationName: "Etham",
    shortPlaceName: "Etham",
    modernLocation: "Ismailia / Lake Timsah, Egypt",
    lat: 30.3000,
    lng: 32.3000,
    passageRef: "Exodus 14:1",
    title: "Etham (Departure)",
    description: "Encampment on the edge of the wilderness at the close of Exodus 13 (Exod 13:20), from which the Lord commanded Israel to turn back and camp before Pi-hahiroth by the sea.",
    theologicalSignificance: "God leading His people into humanly impassable terrain to demonstrate His supreme triumph over Pharaoh."
  },
  "exodus_16": {
    fromChapterLabel: "Exodus 15",
    locationName: "Elim",
    shortPlaceName: "Elim",
    modernLocation: "Wadi Gharandel, Sinai Peninsula",
    lat: 29.3000,
    lng: 33.0000,
    passageRef: "Exodus 16:1",
    title: "Elim (Departure)",
    description: "Oasis of twelve springs and seventy palm trees where Israel camped in Exodus 15:27, journeying southward into the Wilderness of Sin.",
    theologicalSignificance: "Moving from refreshing rest into the desert proving ground of daily dependency upon divine bread."
  },
  "exodus_17": {
    fromChapterLabel: "Exodus 16",
    locationName: "Wilderness of Sin",
    shortPlaceName: "Wilderness of Sin",
    modernLocation: "El-Markha Plain, Sinai Peninsula",
    lat: 28.9000,
    lng: 33.3000,
    passageRef: "Exodus 17:1",
    title: "Wilderness of Sin (Departure)",
    description: "The desert plain of the manna and quail in Exodus 16, from which the congregation journeyed by stages according to the commandment of Yahweh toward Rephidim.",
    theologicalSignificance: "The guided stages of pilgrimage under the pillar of cloud and fire."
  },
  "exodus_19": {
    fromChapterLabel: "Exodus 17",
    locationName: "Rephidim",
    shortPlaceName: "Rephidim",
    modernLocation: "Wadi Feiran, Sinai Peninsula",
    lat: 28.6500,
    lng: 33.8000,
    passageRef: "Exodus 19:1",
    title: "Rephidim (Departure)",
    description: "Valley of the water from the rock and victory over Amalek in Exodus 17, from which Israel set out to pitch camp before the Mount of God.",
    theologicalSignificance: "Arrival at Sinai for the solemn giving of the Law and the establishment of the Mosaic Covenant."
  },

  // Numbers & Joshua
  "numbers_12": {
    fromChapterLabel: "Numbers 11",
    locationName: "Hazeroth",
    shortPlaceName: "Hazeroth",
    modernLocation: "Ain Hudra, Sinai Peninsula",
    lat: 28.7500,
    lng: 34.4000,
    passageRef: "Numbers 12:16",
    title: "Hazeroth (Departure)",
    description: "Encampment where Miriam was healed of leprosy at the close of Numbers 11-12, from which Israel journeyed toward the Wilderness of Paran.",
    theologicalSignificance: "The ongoing sanctification and march of Israel toward the threshold of the Promised Land."
  },
  "numbers_21": {
    fromChapterLabel: "Numbers 20",
    locationName: "Mount Hor",
    shortPlaceName: "Mount Hor",
    modernLocation: "Jabal Harun near Petra, Jordan",
    lat: 30.3167,
    lng: 35.4000,
    passageRef: "Numbers 21:4",
    title: "Mount Hor (Departure)",
    description: "Mountain site of Aaron's death at the close of Numbers 20, from which Israel journeyed along the Way of the Red Sea to bypass the border of Edom.",
    theologicalSignificance: "Transition in priestly leadership and miraculous healing through the Bronze Serpent."
  },
  "joshua_3": {
    fromChapterLabel: "Joshua 2",
    locationName: "Shittim",
    shortPlaceName: "Shittim",
    modernLocation: "Tell el-Hammam, Jordan",
    lat: 31.8300,
    lng: 35.6300,
    passageRef: "Joshua 3:1",
    title: "Shittim (Departure)",
    description: "Acacia plain in Moab where Joshua sent forth the two spies in Joshua 2, rising early in the morning to lead the nation to the edge of the flooded Jordan River.",
    theologicalSignificance: "The morning of faith stepping into the flooded waters of Jordan to inherit the land."
  },
  "joshua_6": {
    fromChapterLabel: "Joshua 5",
    locationName: "Gilgal",
    shortPlaceName: "Gilgal",
    modernLocation: "Jericho Plain, West Bank",
    lat: 31.8600,
    lng: 35.4800,
    passageRef: "Joshua 6:1",
    title: "Gilgal (Departure)",
    description: "Covenant camp where Israel renewed circumcision and observed Passover in Joshua 5, marching out in obedience to encircle the fortress of Jericho.",
    theologicalSignificance: "Spiritual renewal and worship preceding the supernatural victory of faith."
  },

  // Patriarchal Journeys
  "genesis_12": {
    fromChapterLabel: "Genesis 11",
    locationName: "Haran",
    shortPlaceName: "Haran",
    modernLocation: "Harran, Sanliurfa, Turkey",
    lat: 36.8647,
    lng: 39.0272,
    passageRef: "Genesis 12:4",
    title: "Haran (Departure)",
    description: "Upper Mesopotamian trading crossroad where Terah died in Genesis 11:32, from which 75-year-old Abram departed in faith to the land God would show him.",
    theologicalSignificance: "The inaugural obedience of faith that established the Abrahamic Covenant."
  },
  "genesis_13": {
    fromChapterLabel: "Genesis 12",
    locationName: "Egypt",
    shortPlaceName: "Egypt (Nile Delta)",
    modernLocation: "Nile Delta, Egypt",
    lat: 30.7870,
    lng: 31.8210,
    passageRef: "Genesis 13:1",
    title: "Egypt (Departure)",
    description: "Abram went up out of Egypt following the famine at the close of Genesis 12, returning through the Negev to his former altar between Bethel and Ai.",
    theologicalSignificance: "Repentant return from earthly refuge to the altar of renewed worship."
  },
  "genesis_28": {
    fromChapterLabel: "Genesis 27",
    locationName: "Beersheba",
    shortPlaceName: "Beersheba",
    modernLocation: "Tel Be'er Sheva, Israel",
    lat: 31.2447,
    lng: 34.8410,
    passageRef: "Genesis 28:10",
    title: "Beersheba (Departure)",
    description: "Southern patriarchal well city where Jacob received Isaac's blessing in Genesis 27, fleeing from Esau toward Haran and stopping at Bethel for the ladder vision.",
    theologicalSignificance: "God's unconditional covenant grace meeting the fugitive patriarch in the desert."
  },

  // Gospels
  "luke_4": {
    fromChapterLabel: "Luke 3",
    locationName: "Jordan River (Bethany Beyond Jordan)",
    shortPlaceName: "Jordan River",
    modernLocation: "Al-Maghtas, Jordan",
    lat: 31.8386,
    lng: 35.5492,
    passageRef: "Luke 4:1",
    title: "Jordan River (Departure)",
    description: "Site of Jesus's baptism by John at the close of Luke 3, returning full of the Holy Spirit to endure the desert temptation and preach in Nazareth.",
    theologicalSignificance: "The Spirit-anointed start of the Messianic ministry following baptism and temptation."
  },
  "luke_7": {
    fromChapterLabel: "Luke 6",
    locationName: "Capernaum",
    shortPlaceName: "Capernaum",
    modernLocation: "Kfar Nahum, Sea of Galilee, Israel",
    lat: 32.8808,
    lng: 35.5753,
    passageRef: "Luke 7:1",
    title: "Capernaum (Departure)",
    description: "Galilean headquarters where Jesus taught the Sermon on the Plain in Luke 6 and healed the centurion's servant, departing southwest to raise the widow's son at Nain.",
    theologicalSignificance: "The compassionate authority of Christ reversing death across Galilee."
  },
  "luke_24": {
    fromChapterLabel: "Luke 23",
    locationName: "Jerusalem",
    shortPlaceName: "Jerusalem",
    modernLocation: "Jerusalem, Israel",
    lat: 31.7767,
    lng: 35.2345,
    passageRef: "Luke 24:13",
    title: "Jerusalem (Departure)",
    description: "City of the crucifixion and empty tomb in Luke 23-24, where two disciples departed that same day for Emmaus, joined by the risen Lord.",
    theologicalSignificance: "The living Christ explaining all the Scriptures concerning Himself on the road to Emmaus."
  },
  "john_2": {
    fromChapterLabel: "John 1",
    locationName: "Bethany Beyond Jordan",
    shortPlaceName: "Bethany Beyond Jordan",
    modernLocation: "Al-Maghtas, Jordan",
    lat: 31.8386,
    lng: 35.5492,
    passageRef: "John 2:1",
    title: "Bethany Beyond Jordan (Departure)",
    description: "Where John the Baptist proclaimed 'Behold the Lamb of God' in John 1:28, departing into Galilee for the wedding at Cana on the third day.",
    theologicalSignificance: "Transition from the herald's testimony to the manifestation of Christ's glory in Cana."
  },
  "john_4": {
    fromChapterLabel: "John 3",
    locationName: "Jerusalem / Judean Countryside",
    shortPlaceName: "Judea",
    modernLocation: "Judean Hills / Jerusalem, Israel",
    lat: 31.7767,
    lng: 35.2345,
    passageRef: "John 4:3",
    title: "Judea (Departure)",
    description: "Jesus departed from Judea where His disciples were baptizing in John 3:22, must needs pass through Samaria to Sychar on His journey to Galilee.",
    theologicalSignificance: "The gospel breaking cultural and racial barriers to offer the Water of Life."
  },
  "john_6": {
    fromChapterLabel: "John 5",
    locationName: "Jerusalem",
    shortPlaceName: "Jerusalem",
    modernLocation: "Jerusalem, Israel",
    lat: 31.7767,
    lng: 35.2345,
    passageRef: "John 6:1",
    title: "Jerusalem (Departure)",
    description: "Following the healing at Bethesda in John 5, Jesus departed from Jerusalem to the other side of the Sea of Galilee (Sea of Tiberias).",
    theologicalSignificance: "Moving from confrontation with Jerusalem leaders to feeding the multitudes on the Galilean mountain."
  },
  "john_11": {
    fromChapterLabel: "John 10",
    locationName: "Bethany Beyond Jordan",
    shortPlaceName: "Bethany Beyond Jordan",
    modernLocation: "Al-Maghtas, Jordan",
    lat: 31.8386,
    lng: 35.5492,
    passageRef: "John 11:7",
    title: "Bethany Beyond Jordan (Departure)",
    description: "The retreat place beyond the Jordan where John at first baptized (John 10:40), where Jesus heard of Lazarus's illness and returned toward Bethany near Jerusalem.",
    theologicalSignificance: "Advancing into mortal hostility to demonstrate that Christ is the Resurrection and the Life."
  }
};

export const NON_JOURNEY_BOOKS = new Set([
  // Wisdom & Poetic Literature
  'job', 'psalms', 'proverbs', 'ecclesiastes', 'songofsolomon', 'lamentations',
  // Prophetic Oracles & Visions (Jonah is a historical narrative journey)
  'isaiah', 'jeremiah', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah',
  'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi',
  // Epistles & Doctrinal Letters
  'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians',
  'philippians', 'colossians', '1thessalonians', '2thessalonians',
  '1timothy', '2timothy', 'titus', 'philemon', 'hebrews', 'james',
  '1peter', '2peter', '1john', '2john', '3john', 'jude'
]);

export const LIST_AND_BOUNDARY_CHAPTERS = new Set([
  'genesis_10', // Table of Nations
  '1kings_4',   // Solomon's twelve administrative districts
  'joshua_11',  // Conquered northern kings list
  'joshua_12',  // Kings conquered by Moses and Joshua
  'joshua_13',  // Land yet unconquered & Transjordan division
  'joshua_14',  // Inheritance distribution at Gilgal
  'joshua_15',  // Judah tribal boundary and town lists
  'joshua_16',  // Ephraim boundary
  'joshua_17',  // Manasseh allotment
  'joshua_18',  // Survey of remaining land & Benjamin boundary
  'joshua_19',  // Simeon, Zebulun, Issachar, Asher, Naphtali, Dan allotments
  'joshua_21',  // Levitical cities list
  'numbers_1',  // First census
  'numbers_2',  // Camp arrangement
  'numbers_3',  // Levite census
  'numbers_26', // Second census
  'numbers_34', // Borders of Canaan
  '1chronicles_1', '1chronicles_2', '1chronicles_3', '1chronicles_4',
  '1chronicles_5', '1chronicles_6', '1chronicles_7', '1chronicles_8',
  '1chronicles_9', '1chronicles_24', '1chronicles_25', '1chronicles_26', '1chronicles_27',
  'ezra_2', 'nehemiah_3', 'nehemiah_7', 'nehemiah_11', 'nehemiah_12'
]);

export function getChapterGeoData(bookId: string, chapterNum: number): ChapterGeoData {
  const key = `${bookId.toLowerCase()}_${chapterNum}`;
  const historicalSegments = getHistoricalRouteSegments(bookId, chapterNum);

  if (CHAPTER_MICRO_EVENTS[key]) {
    const data = CHAPTER_MICRO_EVENTS[key];
    const events = data.events.map(ev => {
      const cleanLoc = cleanDisambiguatedPlaceName(ev.locationName);
      const cleanShort = cleanDisambiguatedPlaceName(ev.shortPlaceName || ev.locationName);
      let cleanTitle = ev.title;
      if (cleanTitle === ev.locationName || /\s+\d+$/.test(cleanTitle)) {
        cleanTitle = cleanDisambiguatedPlaceName(cleanTitle);
      }

      let modifiedEv: ChapterGeoEvent = {
        ...ev,
        locationName: cleanLoc,
        shortPlaceName: cleanShort,
        title: cleanTitle
      };

      // In Acts 17, Amphipolis, Apollonia, Thessalonica, Berea, Athens are physical stops
      if (key === 'acts_17' && ['Amphipolis', 'Apollonia', 'Thessalonica'].includes(cleanLoc)) {
        modifiedEv.isReferencedOnly = false;
      }
      // In Acts 10, Caesarea is the physical destination where Peter arrives at Cornelius's house
      if (key === 'acts_10' && cleanLoc === 'Caesarea') {
        modifiedEv.isReferencedOnly = false;
      }
      // In Acts 8, Samaria, Gaza, Azotus, Caesarea are Philip's physical journey stops
      if (key === 'acts_8' && (cleanLoc.includes('Samaria') || cleanLoc.includes('Gaza') || cleanLoc.includes('Azotus') || cleanLoc.includes('Caesarea'))) {
        modifiedEv.isReferencedOnly = false;
      }
      // In Acts 16, Jerusalem (council ref), Thyatira (origin), Asia/Bithynia (forbidden/prevented), Phrygia/Galatia/Mysia (regions) are referenced
      if (key === 'acts_16') {
        if (['Jerusalem', 'Thyatira', 'Asia', 'Bithynia', 'Greece', 'Macedonia', 'Phrygia', 'Galatia', 'Mysia'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      // In Acts 2 (Pentecost nations) and Acts 7 (Stephen's historical speech), non-Jerusalem places are referenced
      if ((key === 'acts_2' || key === 'acts_7') && cleanLoc !== 'Jerusalem') {
        modifiedEv.isReferencedOnly = true;
      }
      // In Acts 27, broad territories, seas, and passing references are referenced; actual ports are physical
      if (key === 'acts_27') {
        if (['Cyprus', 'Cilicia', 'Pamphylia', 'Lycia', 'Crete', 'Adriatic Sea', 'Salmone', 'Phoenix', 'Lasea', 'Syrtis', 'Asia', 'Italy', 'Alexandria', 'Thessalonica', 'Adramyttium'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      // In Acts 13 (First Missionary Journey), Perga and Pisidian Antioch are physical; sermon/origin places are referenced
      if (key === 'acts_13') {
        if (['Perga', 'Antioch (Pisidia)', 'Iconium'].includes(cleanLoc) || ev.title.includes('Perga') || ev.title.includes('Antioch in Pisidia') || ev.title.includes('Antioch 2')) {
          modifiedEv.isReferencedOnly = false;
        }
        if (['Cyrene', 'Egypt', 'Canaan', 'Galilee', 'Jerusalem', 'Cyprus'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      // In Acts 14, Lystra and Derbe are key physical stops; v19 Jews from Antioch stoning Paul is referenced
      if (key === 'acts_14') {
        if (['Lystra', 'Derbe'].includes(cleanLoc) || ev.title.includes('Lystra') || ev.title.includes('Derbe')) {
          modifiedEv.isReferencedOnly = false;
        }
        if (ev.passageRef === 'Acts 14:19') {
          modifiedEv.isReferencedOnly = true;
        }
      }
      // In Acts 18, companion origins and regions are referenced
      if (key === 'acts_18') {
        if (['Rome', 'Italy', 'Pontus', 'Alexandria', 'Egypt', 'Macedonia', 'Achaia'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      // In Acts 20 & 21, coastal island voyage stops are physical; bypassed/speech places are referenced
      if (key === 'acts_20') {
        if (['Assos', 'Mitylene', 'Chios', 'Samos', 'Miletus'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = false;
        }
        if (['Berea', 'Derbe', 'Thessalonica', 'Ephesus', 'Jerusalem'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'acts_21') {
        if (['Cos', 'Rhodes', 'Patara', 'Tyre', 'Ptolemais', 'Caesarea', 'Jerusalem'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = false;
        }
        if (['Tarsus', 'Cilicia', 'Cyprus', 'Syria', 'Judea'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'exodus_13') {
        if (['Egypt', 'Red Sea'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'exodus_14') {
        if (cleanLoc === 'Egypt') {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'exodus_16') {
        if (['Egypt', 'Canaan', 'Mount Sinai'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'exodus_17') {
        if (['Egypt', 'Nile', 'Amalek'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'exodus_19') {
        if (['Egypt', 'Wilderness of Sinai'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === '1samuel_17') {
        if (['Gath', 'Bethlehem'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === '2kings_5') {
        if (['Abana', 'Pharpar', 'Damascus', 'Aram'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'joshua_2') {
        if (cleanLoc === 'Egypt') {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'judges_11') {
        if (['Red Sea', 'Kadesh-barnea', 'Edom', 'Moab'].includes(cleanLoc) && ev.passageRef && ['Judg 11:15', 'Judg 11:16', 'Judg 11:17'].includes(ev.passageRef)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'luke_2') {
        if (['Galilee', 'Judea'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'luke_24') {
        if (['Galilee', 'Nazareth'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'john_4') {
        if (['Mount Gerizim', 'Jerusalem', 'Capernaum'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      if (key === 'matthew_16') {
        if (['Jerusalem'].includes(cleanLoc)) {
          modifiedEv.isReferencedOnly = true;
        }
      }
      return modifiedEv;
    });

    // Narrative chronological adjustments for itineraries
    if (key === 'acts_28') {
      const romeIdx = events.findIndex(e => e.locationName.includes('Rome'));
      const forumIdx = events.findIndex(e => e.locationName.includes('Forum') || e.locationName.includes('Appius'));
      if (romeIdx !== -1 && forumIdx !== -1 && romeIdx < forumIdx) {
        const romeEv = events.splice(romeIdx, 1)[0];
        events.push(romeEv);
      }
    }
    if (key === 'acts_20') {
      const troasIdx = events.findIndex(e => e.locationName.includes('Troas'));
      const philippiIdx = events.findIndex(e => e.locationName.includes('Philippi'));
      if (troasIdx !== -1 && philippiIdx !== -1 && troasIdx < philippiIdx) {
        const philippiEv = events.splice(philippiIdx, 1)[0];
        events.splice(troasIdx, 0, philippiEv);
      }
    }
    if (key === 'acts_23') {
      const caesareaIdx = events.findIndex(e => e.locationName.includes('Caesarea'));
      const antipatrisIdx = events.findIndex(e => e.locationName.includes('Aphek') || e.locationName.includes('Antipatris'));
      if (caesareaIdx !== -1 && antipatrisIdx !== -1 && caesareaIdx < antipatrisIdx) {
        const caesareaEv = events.splice(caesareaIdx, 1)[0];
        events.push(caesareaEv);
      }
    }
    if (key === 'acts_18') {
      const caesareaIdx = events.findIndex(e => e.locationName.includes('Caesarea'));
      const jerusalemIdx = events.findIndex(e => e.locationName.includes('Jerusalem'));
      if (caesareaIdx !== -1 && jerusalemIdx !== -1 && jerusalemIdx < caesareaIdx) {
        const jerusalemEv = events.splice(jerusalemIdx, 1)[0];
        const newCaesareaIdx = events.findIndex(e => e.locationName.includes('Caesarea'));
        events.splice(newCaesareaIdx + 1, 0, jerusalemEv);
      }
    }

    // Chapter Narrative Continuity: Inject or flag departure location from previous chapter
    const departureLink = CHAPTER_DEPARTURE_LINKS[key];
    if (departureLink) {
      const depName = departureLink.locationName.toLowerCase();
      const existingIdx = events.findIndex(e => {
        const cleanName = cleanDisambiguatedPlaceName(e.locationName).toLowerCase();
        const shortName = cleanDisambiguatedPlaceName(e.shortPlaceName || '').toLowerCase();
        return cleanName === depName || shortName === depName || cleanName.includes(depName) || depName.includes(cleanName);
      });

      // Special cases where the departure point is also a return destination later in the chapter
      const isReturnDestination = (key === 'acts_14' || key === 'acts_20');

      if (existingIdx !== -1 && !isReturnDestination) {
        const matchEv = events[existingIdx];
        matchEv.isDeparturePoint = true;
        matchEv.departureFromChapter = departureLink.fromChapterLabel;
        if (!matchEv.title.includes('(Departure)')) {
          matchEv.title = `${matchEv.title} (Departure)`;
        }
        if (existingIdx > 0) {
          events.splice(existingIdx, 1);
          events.unshift(matchEv);
        }
      } else if (existingIdx === 0 && isReturnDestination) {
        events[0].isDeparturePoint = true;
        events[0].departureFromChapter = departureLink.fromChapterLabel;
        if (!events[0].title.includes('(Departure)')) {
          events[0].title = `${events[0].title} (Departure)`;
        }
      } else {
        // Prepend departure event at the front of the chapter itinerary
        const depEvent: ChapterGeoEvent = {
          id: `${key}_departure`,
          stepNumber: 1,
          title: departureLink.title || `${departureLink.shortPlaceName || departureLink.locationName} (Departure)`,
          passageRef: departureLink.passageRef,
          verseRange: [1, 1],
          locationName: departureLink.locationName,
          shortPlaceName: departureLink.shortPlaceName || departureLink.locationName,
          modernLocation: departureLink.modernLocation,
          lat: departureLink.lat,
          lng: departureLink.lng,
          description: departureLink.description,
          theologicalSignificance: departureLink.theologicalSignificance || '',
          isEducatedGuess: false,
          isReferencedOnly: false,
          isDeparturePoint: true,
          departureFromChapter: departureLink.fromChapterLabel
        };
        events.unshift(depEvent);
      }
    }

    let storyStep = 0;
    let refStep = 0;
    const renumberedEvents = events.map(ev => {
      if (ev.isReferencedOnly) {
        refStep++;
        return { ...ev, stepNumber: refStep };
      } else {
        storyStep++;
        return { ...ev, stepNumber: storyStep };
      }
    });

    const physicalEvents = renumberedEvents.filter(e => !e.isReferencedOnly);
    let finalEvents = [...renumberedEvents];
    let finalCenterLat = data.centerLat;
    let finalCenterLng = data.centerLng;
    let finalZoom = data.defaultZoom;

    // If no explicit physical storyline places were mentioned in the chapter,
    // anchor the chapter with the scholarly historical setting where it occurred or was composed!
    if (physicalEvents.length === 0) {
      const setting = getChapterSetting(bookId, chapterNum);
      const cleanBookName = bookId.charAt(0).toUpperCase() + bookId.slice(1).toLowerCase();
      const settingEvent: ChapterGeoEvent = {
        id: `${key}_setting`,
        stepNumber: 1,
        title: setting.settingTitle,
        passageRef: `${cleanBookName} ${chapterNum}`,
        verseRange: [1, 1],
        locationName: setting.locationName,
        shortPlaceName: setting.shortPlaceName,
        modernLocation: setting.modernLocation,
        lat: setting.lat,
        lng: setting.lng,
        description: setting.description,
        theologicalSignificance: setting.theologicalSignificance,
        isEducatedGuess: true,
        isReferencedOnly: false
      };
      finalEvents.unshift(settingEvent);
      physicalEvents.push(settingEvent);
      finalCenterLat = setting.lat;
      finalCenterLng = setting.lng;
      finalZoom = setting.zoom || 11;
    }

    const targetEvents = physicalEvents;

    // Assemble final route segments: historical segments + master dictionary matching + straight line fallback
    const finalSegments: RouteSegment[] = [...historicalSegments];
    const allCoords: [number, number][] = [];

    // Collect coordinates from explicit historical segments
    historicalSegments.forEach(s => s.coordinates.forEach(c => allCoords.push(c)));

    const isNonJourney = NON_JOURNEY_BOOKS.has(bookId.toLowerCase()) || (bookId.toLowerCase() === 'revelation' && chapterNum > 3);
    const isListOrBoundary = LIST_AND_BOUNDARY_CHAPTERS.has(key);

    // If explicit curated historical segments exist, those are the authoritative routes for the chapter.
    // Never generate straight-line fallbacks or duplicate dynamic overlays on top of curated routes!
    if (historicalSegments.length === 0 && !isNonJourney && !isListOrBoundary && targetEvents.length > 1) {
      for (let i = 0; i < targetEvents.length - 1; i++) {
        const fromEv = targetEvents[i];
        const toEv = targetEvents[i + 1];

        const fromName = (fromEv.shortPlaceName || fromEv.locationName).toLowerCase();
        const toName = (toEv.shortPlaceName || toEv.locationName).toLowerCase();

        // 1. Check if any segment in master HISTORICAL_ROAD_SEGMENTS connects this pair
        let matchedHistorical: RouteSegment | null = null;
        let isReversed = false;

        for (const seg of Object.values(HISTORICAL_ROAD_SEGMENTS)) {
          const sFrom = seg.fromName.toLowerCase();
          const sTo = seg.toName.toLowerCase();
          const cStart = seg.coordinates[0];
          const cEnd = seg.coordinates[seg.coordinates.length - 1];

          const dStart = calculateDistanceMiles(cStart[0], cStart[1], fromEv.lat, fromEv.lng);
          const dEnd = calculateDistanceMiles(cEnd[0], cEnd[1], toEv.lat, toEv.lng);
          if (dStart < 15 && dEnd < 15) {
            matchedHistorical = seg;
            isReversed = false;
            break;
          }

          const dStartRev = calculateDistanceMiles(cEnd[0], cEnd[1], fromEv.lat, fromEv.lng);
          const dEndRev = calculateDistanceMiles(cStart[0], cStart[1], toEv.lat, toEv.lng);
          if (dStartRev < 15 && dEndRev < 15) {
            matchedHistorical = seg;
            isReversed = true;
            break;
          }

          if ((sFrom.includes(fromName) || fromName.includes(sFrom)) && (sTo.includes(toName) || toName.includes(sTo))) {
            matchedHistorical = seg;
            isReversed = false;
            break;
          }
          if ((sFrom.includes(toName) || toName.includes(sFrom)) && (sTo.includes(fromName) || fromName.includes(sTo))) {
            matchedHistorical = seg;
            isReversed = true;
            break;
          }
        }

        if (matchedHistorical) {
          const coords = isReversed ? [...matchedHistorical.coordinates].reverse() : matchedHistorical.coordinates;
          finalSegments.push({
            ...matchedHistorical,
            id: `${matchedHistorical.id}_dyn_${fromEv.id}_${toEv.id}`,
            fromName: fromEv.shortPlaceName || fromEv.locationName,
            toName: toEv.shortPlaceName || toEv.locationName,
            coordinates: coords
          });
          coords.forEach(c => allCoords.push(c));
          continue;
        }

        // 2. Direct Path Fallback: Only for plausible local daily journeys (dist <= 35 miles)
        const isDistinct = Math.abs(fromEv.lat - toEv.lat) > 0.0001 || Math.abs(fromEv.lng - toEv.lng) > 0.0001;
        if (isDistinct) {
          const dist = calculateDistanceMiles(fromEv.lat, fromEv.lng, toEv.lat, toEv.lng);
          if (dist <= 35 && dist > 0.01) {
            const estDays = Math.max(0.1, Number((dist / 20).toFixed(1)));
            finalSegments.push({
              id: `fallback_${fromEv.id}_${toEv.id}`,
              fromName: fromEv.shortPlaceName || fromEv.locationName,
              toName: toEv.shortPlaceName || toEv.locationName,
              historicalRoadName: "Local Transit Track",
              mode: "land_walking",
              distanceMiles: dist,
              travelDays: estDays,
              isScholarlyEstimate: true,
              notes: `Local walking connection between ${fromEv.shortPlaceName || fromEv.locationName} and ${toEv.shortPlaceName || toEv.locationName} (~${dist} mi, ~${estDays}d travel).`,
              coordinates: [
                [fromEv.lat, fromEv.lng],
                [toEv.lat, toEv.lng]
              ]
            });
            allCoords.push([fromEv.lat, fromEv.lng], [toEv.lat, toEv.lng]);
          }
        } else if (fromName !== toName) {
          // Adjacent landmark or sanctuary within same immediate locality
          finalSegments.push({
            id: `fallback_local_${fromEv.id}_${toEv.id}`,
            fromName: fromEv.shortPlaceName || fromEv.locationName,
            toName: toEv.shortPlaceName || toEv.locationName,
            historicalRoadName: "Local Vicinity Path",
            mode: "land_walking",
            distanceMiles: 0.5,
            travelDays: 0.1,
            isScholarlyEstimate: true,
            notes: `Adjacent biblical sites/landmarks situated in the same immediate locality.`,
            coordinates: [
              [fromEv.lat, fromEv.lng],
              [toEv.lat + 0.003, toEv.lng + 0.003]
            ]
          });
          allCoords.push([fromEv.lat, fromEv.lng], [toEv.lat + 0.003, toEv.lng + 0.003]);
        }
      }
    }

    const hasSegments = finalSegments.length > 0;

    return {
      ...data,
      centerLat: finalCenterLat,
      centerLng: finalCenterLng,
      defaultZoom: finalZoom,
      events: finalEvents,
      routeSegments: hasSegments ? finalSegments : undefined,
      routeCoordinates: hasSegments
        ? (allCoords.length > 0 ? allCoords : undefined)
        : (isNonJourney || isListOrBoundary ? undefined : (data.routeCoordinates && data.routeCoordinates.length > 1 ? data.routeCoordinates : undefined))
    };
  }

  const setting = getChapterSetting(bookId, chapterNum);
  const cleanBook = bookId.charAt(0).toUpperCase() + bookId.slice(1).toLowerCase();

  return {
    bookId: bookId.toLowerCase(),
    chapterNumber: chapterNum,
    chapterTitle: `${cleanBook} Chapter ${chapterNum}`,
    region: setting.modernLocation,
    centerLat: setting.lat,
    centerLng: setting.lng,
    defaultZoom: setting.zoom || 11,
    events: [
      {
        id: `${key}_setting`,
        stepNumber: 1,
        title: setting.settingTitle,
        passageRef: `${cleanBook} ${chapterNum}`,
        verseRange: [1, 1],
        locationName: setting.locationName,
        shortPlaceName: setting.shortPlaceName,
        modernLocation: setting.modernLocation,
        lat: setting.lat,
        lng: setting.lng,
        description: setting.description,
        theologicalSignificance: setting.theologicalSignificance,
        isEducatedGuess: true,
        isReferencedOnly: false
      }
    ],
    routeSegments: historicalSegments && historicalSegments.length > 0 ? historicalSegments : undefined
  };
}

const BOOK_CACHE: Record<string, ChapterGeoData> = {};

export function getBookGeoData(bookId: string): ChapterGeoData | null {
  if (BOOK_CACHE[bookId]) return BOOK_CACHE[bookId];

  const allEvents: ChapterGeoEvent[] = [];
  const uniquePhysical = new Set<string>();
  const uniqueRef = new Set<string>();
  const allSegments: RouteSegment[] = [];
  const seenSegmentIds = new Set<string>();

  const targetPrefix = `${bookId.toLowerCase()}_`;

  const matchingKeys = Object.keys(CHAPTER_MICRO_EVENTS).filter(k => k.startsWith(targetPrefix));
  matchingKeys.sort((a, b) => {
    const numA = parseInt(a.split('_')[1] || '0', 10);
    const numB = parseInt(b.split('_')[1] || '0', 10);
    return numA - numB;
  });

  matchingKeys.forEach(key => {
    const parts = key.split('_');
    const chNum = parseInt(parts[1] || '0', 10);
    const chapterData = getChapterGeoData(bookId, chNum);
    const segs = chapterData.routeSegments || [];
    segs.forEach(s => {
      if (!seenSegmentIds.has(s.id)) {
        seenSegmentIds.add(s.id);
        allSegments.push(s);
      }
    });

    chapterData.events.forEach(ev => {
      const cleanLoc = cleanDisambiguatedPlaceName(ev.locationName);
      const cleanShort = cleanDisambiguatedPlaceName(ev.shortPlaceName || ev.locationName);
      let cleanTitle = ev.title;
      if (cleanTitle === ev.locationName || /\s+\d+$/.test(cleanTitle)) {
        cleanTitle = cleanDisambiguatedPlaceName(cleanTitle);
      }

      const cleanedEv = {
        ...ev,
        locationName: cleanLoc,
        shortPlaceName: cleanShort,
        title: cleanTitle
      };

      if (cleanedEv.isReferencedOnly) {
        if (!uniqueRef.has(cleanedEv.locationName)) {
          uniqueRef.add(cleanedEv.locationName);
          allEvents.push({
            ...cleanedEv,
            stepNumber: uniqueRef.size,
            id: `book_${bookId}_ref_${uniqueRef.size}`,
            passageRef: cleanedEv.passageRef
          });
        }
      } else {
        if (!uniquePhysical.has(cleanedEv.locationName)) {
          uniquePhysical.add(cleanedEv.locationName);
          allEvents.push({
            ...cleanedEv,
            stepNumber: uniquePhysical.size,
            id: `book_${bookId}_phys_${uniquePhysical.size}`,
            passageRef: cleanedEv.passageRef
          });
        }
      }
    });
  });

  if (allEvents.length === 0) return null;

  const cleanBook = bookId.charAt(0).toUpperCase() + bookId.slice(1).toLowerCase();

  // If no chapter-level segments were accumulated but the book has multiple places, connect them sequentially
  if (allSegments.length === 0 && allEvents.length > 1) {
    for (let i = 0; i < allEvents.length - 1; i++) {
      const fromEv = allEvents[i];
      const toEv = allEvents[i + 1];
      const fromName = (fromEv.shortPlaceName || fromEv.locationName).toLowerCase();
      const toName = (toEv.shortPlaceName || toEv.locationName).toLowerCase();

      let matchedHistorical: RouteSegment | null = null;
      let isReversed = false;

      for (const seg of Object.values(HISTORICAL_ROAD_SEGMENTS)) {
        const sFrom = seg.fromName.toLowerCase();
        const sTo = seg.toName.toLowerCase();
        const cStart = seg.coordinates[0];
        const cEnd = seg.coordinates[seg.coordinates.length - 1];

        const dStart = calculateDistanceMiles(cStart[0], cStart[1], fromEv.lat, fromEv.lng);
        const dEnd = calculateDistanceMiles(cEnd[0], cEnd[1], toEv.lat, toEv.lng);
        if (dStart < 15 && dEnd < 15) {
          matchedHistorical = seg;
          isReversed = false;
          break;
        }

        const dStartRev = calculateDistanceMiles(cEnd[0], cEnd[1], fromEv.lat, fromEv.lng);
        const dEndRev = calculateDistanceMiles(cStart[0], cStart[1], toEv.lat, toEv.lng);
        if (dStartRev < 15 && dEndRev < 15) {
          matchedHistorical = seg;
          isReversed = true;
          break;
        }

        if ((sFrom.includes(fromName) || fromName.includes(sFrom)) && (sTo.includes(toName) || toName.includes(sTo))) {
          matchedHistorical = seg;
          isReversed = false;
          break;
        }
        if ((sFrom.includes(toName) || toName.includes(sFrom)) && (sTo.includes(fromName) || fromName.includes(sTo))) {
          matchedHistorical = seg;
          isReversed = true;
          break;
        }
      }

      if (matchedHistorical) {
        const coords = isReversed ? [...matchedHistorical.coordinates].reverse() : matchedHistorical.coordinates;
        allSegments.push({
          ...matchedHistorical,
          id: `${matchedHistorical.id}_book_${bookId}_${i}`,
          fromName: fromEv.shortPlaceName || fromEv.locationName,
          toName: toEv.shortPlaceName || toEv.locationName,
          coordinates: coords
        });
      } else {
        const rawDist = calculateDistanceMiles(fromEv.lat, fromEv.lng, toEv.lat, toEv.lng);
        const dist = rawDist > 0 ? rawDist : 0.1;
        const estDays = Math.max(0.1, Number((dist / 20).toFixed(1)));
        allSegments.push({
          id: `book_${bookId}_seg_${i}`,
          fromName: fromEv.shortPlaceName || fromEv.locationName,
          toName: toEv.shortPlaceName || toEv.locationName,
          historicalRoadName: "Direct Path (No Recorded Road)",
          mode: "land_walking",
          distanceMiles: dist,
          travelDays: estDays,
          isScholarlyEstimate: true,
          notes: `Transit across ${cleanBook}: ${fromEv.shortPlaceName || fromEv.locationName} to ${toEv.shortPlaceName || toEv.locationName} (~${dist} mi, ~${estDays}d).`,
          coordinates: [
            [fromEv.lat, fromEv.lng],
            [toEv.lat, toEv.lng]
          ]
        });
      }
    }
  }

  const allBookCoords: [number, number][] = [];
  allSegments.forEach(s => s.coordinates.forEach(c => allBookCoords.push(c)));

  const result = {
    bookId: bookId.toLowerCase(),
    chapterNumber: 0,
    chapterTitle: `All Places in ${cleanBook}`,
    region: "Biblical World",
    centerLat: allEvents[0].lat,
    centerLng: allEvents[0].lng,
    defaultZoom: 6,
    events: allEvents,
    routeCoordinates: allBookCoords,
    routeSegments: allSegments
  };

  BOOK_CACHE[bookId] = result;
  return result;
}

export function getLocationForPassage(bookId: string, chapterNum: number): GeoLocation {
  const setting = getChapterSetting(bookId, chapterNum);
  return {
    id: `${bookId.toLowerCase()}_${chapterNum}_loc`,
    name: setting.locationName,
    ancientName: setting.shortPlaceName,
    modernCountry: setting.modernLocation,
    lat: setting.lat,
    lng: setting.lng,
    zoom: setting.zoom || 11,
    era: setting.era,
    biblicalEvents: [setting.settingTitle, setting.theologicalSignificance],
    description: setting.description,
    scriptureReferences: [`${bookId} ${chapterNum}`],
    archaeologicalNotes: setting.description
  };
}
