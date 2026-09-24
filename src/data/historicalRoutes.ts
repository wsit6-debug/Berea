/**
 * BEREA HISTORICAL ROAD & MARITIME ROUTES
 * 
 * Based on:
 * 1. Ancient World Mapping Center (AWMC) / Itiner-e Roman Road GIS lines
 * 2. Stanford ORBIS Geospatial Network travel time calibrations (walking @ ~20 mi/day; coastal sail @ ~35 nm/day)
 * 3. OpenBible.info biblical geocoding coordinates
 * 
 * High-performance normalized hash map architecture:
 * - Master dictionary: HISTORICAL_ROAD_SEGMENTS
 * - Chapter index: CHAPTER_ROUTE_SEGMENT_KEYS (O(1) lookup)
 */

export interface RouteSegment {
  id: string;
  fromName: string;
  toName: string;
  historicalRoadName?: string; // e.g. "Via Egnatia", "Way of the Patriarchs", "Via Maris"
  mode: 'land_walking' | 'sea_sailing' | 'desert_caravan';
  distanceMiles: number;
  travelDays: number; // Approximate days required based on ancient transit conditions
  isScholarlyEstimate?: boolean;
  notes?: string;
  coordinates: [number, number][]; // [lat, lng] array following realistic terrain contours
}

export interface HistoricalJourneySummary {
  id: string;
  title: string;
  biblicalFigureOrEvent: string;
  scriptureReference: string;
  totalDistanceMiles: number;
  totalDaysEstimate: number;
  segments: RouteSegment[];
}

/**
 * MASTER NORMALIZED ROAD & MARITIME SEGMENTS HASH MAP
 * Keys are canonical snake_case segment identifiers.
 */
export const HISTORICAL_ROAD_SEGMENTS: Record<string, RouteSegment> = {
  // ============================================================================
  // ACTS 13 & 14: PAUL'S FIRST MISSIONARY JOURNEY (CYPRUS & ASIA MINOR)
  // ============================================================================
  "antioch_to_seleucia_pieria": {
    id: "antioch_to_seleucia_pieria",
    fromName: "Antioch (Syria)",
    toName: "Seleucia Pieria",
    historicalRoadName: "Orontes Valley River Road",
    mode: "land_walking",
    distanceMiles: 16,
    travelDays: 1,
    notes: "Paul and Barnabas departed Syrian Antioch down the Orontes river to its seaport of Seleucia Pieria (Acts 13:4).",
    coordinates: [
      [36.2021, 36.1606], // Antioch on the Orontes
      [36.1500, 36.0500], // Orontes river gorge
      [36.1200, 35.9200]  // Port of Seleucia Pieria
    ]
  },

  "seleucia_to_salamis_sea": {
    id: "seleucia_to_salamis_sea",
    fromName: "Seleucia Pieria",
    toName: "Salamis (Cyprus)",
    historicalRoadName: "Levantine Gulf Sea Lane",
    mode: "sea_sailing",
    distanceMiles: 130,
    travelDays: 1.5,
    notes: "Sailing southwest across the northeastern Mediterranean to the primary eastern port of Cyprus (Acts 13:4-5).",
    coordinates: [
      [36.1200, 35.9200], // Seleucia Pieria harbor
      [35.7000, 35.2000],
      [35.3000, 34.4000], // Cape Greco approach
      [35.1850, 33.9010]  // Salamis ancient harbor
    ]
  },

  "salamis_to_paphos_highway": {
    id: "salamis_to_paphos_highway",
    fromName: "Salamis (Cyprus)",
    toName: "Paphos",
    historicalRoadName: "Cypriot Roman Coastal Highway",
    mode: "land_walking",
    distanceMiles: 100,
    travelDays: 5,
    notes: "Traversing the entire length of Cyprus from east to west through Citium and Amathus to Roman proconsular capital at Paphos (Acts 13:6).",
    coordinates: [
      [35.1850, 33.9010], // Salamis
      [34.9167, 33.6333], // Kition (Larnaca)
      [34.7000, 33.1500], // Amathus
      [34.6700, 32.8500], // Kourion
      [34.7550, 32.4100]  // Nea Paphos (Sergius Paulus seat)
    ]
  },

  "paphos_to_perga_sea": {
    id: "paphos_to_perga_sea",
    fromName: "Paphos",
    toName: "Perga (Pamphylia)",
    historicalRoadName: "Pamphylian Sea Lane",
    mode: "sea_sailing",
    distanceMiles: 175,
    travelDays: 2.5,
    notes: "Sailing northwest from Paphos across the Cilician-Pamphylian Sea up the Cestrus River to Perga (Acts 13:13).",
    coordinates: [
      [34.7550, 32.4100], // Paphos harbor
      [35.5000, 31.8000], // Open Mediterranean
      [36.3000, 31.2000], // Approaching Gulf of Antalya
      [36.8500, 30.7000], // Attalia / Cestrus mouth
      [36.9600, 30.8500]  // Inland port of Perga
    ]
  },

  "perga_to_pisidian_antioch": {
    id: "perga_to_pisidian_antioch",
    fromName: "Perga (Pamphylia)",
    toName: "Antioch (Pisidia)",
    historicalRoadName: "Via Sebaste (Taurus Mountain Pass)",
    mode: "land_walking",
    distanceMiles: 105,
    travelDays: 6,
    notes: "Arduous climb through the rugged Taurus Mountains and bandit-infested gorges (2 Cor 11:26) to the Anatolian plateau (Acts 13:14).",
    coordinates: [
      [36.9600, 30.8500], // Perga
      [37.2000, 30.7500], // Climax pass into Pisidian highlands
      [37.6000, 30.8000], // Lake Egirdir pass
      [38.3000, 31.1800]  // Pisidian Antioch Roman colony (Yalvac)
    ]
  },

  "pisidian_antioch_to_iconium": {
    id: "pisidian_antioch_to_iconium",
    fromName: "Antioch (Pisidia)",
    toName: "Iconium",
    historicalRoadName: "Via Sebaste Central Spur",
    mode: "land_walking",
    distanceMiles: 85,
    travelDays: 4,
    notes: "Following the northern slopes of the Sultan Dagh mountains along Lake Beysehir to Iconium (Acts 13:51).",
    coordinates: [
      [38.3000, 31.1800], // Pisidian Antioch
      [38.1500, 31.6000],
      [37.9500, 32.1000],
      [37.8722, 32.4923]  // Iconium
    ]
  },

  // ============================================================================
  // ACTS 16 & 17: PAUL'S SECOND MISSIONARY JOURNEY IN MACEDONIA & GREECE
  // ============================================================================
  "derbe_to_lystra_via_sebaste": {
    id: "derbe_to_lystra_via_sebaste",
    fromName: "Derbe",
    toName: "Lystra",
    historicalRoadName: "Via Sebaste (Southern Galatia Spur)",
    mode: "land_walking",
    distanceMiles: 65,
    travelDays: 3.5,
    notes: "Roman imperial highway in Southern Galatia connecting Derbe through the Isaurian plains to Lystra (Acts 16:1).",
    coordinates: [
      [37.3486, 33.3615], // Derbe (Kerti Hüyük)
      [37.4500, 32.9000], // Karaman plain passage
      [37.5200, 32.5500], // Foothills of Mount Loras
      [37.6017, 32.3384]  // Lystra (Tel Lystra)
    ]
  },

  "lystra_to_iconium_via_sebaste": {
    id: "lystra_to_iconium_via_sebaste",
    fromName: "Lystra",
    toName: "Iconium",
    historicalRoadName: "Via Sebaste (Iconium Highway)",
    mode: "land_walking",
    distanceMiles: 25,
    travelDays: 1.5,
    notes: "Paved military road connecting the Roman colony of Lystra with the regional hub of Iconium (Acts 16:2).",
    coordinates: [
      [37.6017, 32.3384], // Lystra
      [37.7200, 32.4200], // Central Lycaonian agricultural defile
      [37.8722, 32.4923]  // Iconium (Konya)
    ]
  },

  "iconium_to_troas_via_phrygia": {
    id: "iconium_to_troas_via_phrygia",
    fromName: "Iconium",
    toName: "Troas (Alexandria Troas)",
    historicalRoadName: "Roman Trunk Road of Asia Minor",
    mode: "land_walking",
    distanceMiles: 380,
    travelDays: 18,
    notes: "Paul traversed the region of Phrygia and Galatia, passing by Mysia down to Alexandria Troas on the Aegean coast (Acts 16:6-8).",
    coordinates: [
      [37.8722, 32.4923], // Iconium
      [38.2900, 31.9100], // Via Sebaste north towards Philomelium
      [38.3000, 31.1800], // Pisidian Antioch junction
      [38.7500, 30.5400], // Phrygia / Synnada crossroads
      [39.5000, 29.9800], // Cotyaeum (Kütahya)
      [39.7000, 28.0000], // Mysian highland route
      [39.8000, 26.8000], // Adramyttian Gulf coastal approach
      [39.7519, 26.1586]  // Alexandria Troas harbor
    ]
  },

  "troas_to_samothrace_sea": {
    id: "troas_to_samothrace_sea",
    fromName: "Troas (Alexandria Troas)",
    toName: "Samothrace",
    historicalRoadName: "North Aegean Maritime Route",
    mode: "sea_sailing",
    distanceMiles: 70,
    travelDays: 1, // Acts 16:11: "putting out to sea from Troas, we ran a straight course to Samothrace"
    notes: "Favorable southern breeze allowed an extraordinarily swift 1-day crossing.",
    coordinates: [
      [39.7525, 26.1578], // Troas harbor
      [39.9500, 25.9500],
      [40.2000, 25.7500],
      [40.4850, 25.5300]  // Samothrace anchorage
    ]
  },

  "samothrace_to_neapolis_sea": {
    id: "samothrace_to_neapolis_sea",
    fromName: "Samothrace",
    toName: "Neapolis (Kavala)",
    historicalRoadName: "Thracian Coastal Sea Lane",
    mode: "sea_sailing",
    distanceMiles: 65,
    travelDays: 1, // Acts 16:11: "and the next day to Neapolis"
    notes: "Direct sailing leg reaching the primary maritime gateway of Macedonia.",
    coordinates: [
      [40.4850, 25.5300], // Samothrace
      [40.7000, 25.0000], // Rounding Thasos Island waters
      [40.8500, 24.6000],
      [40.9380, 24.4120]  // Neapolis harbor
    ]
  },

  "neapolis_to_philippi_via_egnatia": {
    id: "neapolis_to_philippi_via_egnatia",
    fromName: "Neapolis (Kavala)",
    toName: "Philippi",
    historicalRoadName: "Via Egnatia (Mount Symbolon Pass)",
    mode: "land_walking",
    distanceMiles: 10,
    travelDays: 1,
    notes: "Steep paved Roman road climbing through the Symbolon mountain pass into the Philippian plain.",
    coordinates: [
      [40.9380, 24.4120], // Neapolis
      [40.9480, 24.4050], // Symbolon mountain pass ascent
      [40.9520, 24.3800], // Crest of the pass
      [40.9333, 24.4167]  // Philippi Roman Colony
    ]
  },

  "philippi_to_amphipolis_via_egnatia": {
    id: "philippi_to_amphipolis_via_egnatia",
    fromName: "Philippi",
    toName: "Amphipolis",
    historicalRoadName: "Via Egnatia (Strymon River Section)",
    mode: "land_walking",
    distanceMiles: 33,
    travelDays: 2,
    notes: "Paved military highway following the Mount Pangaion foothills down to the Strymon River bridge.",
    coordinates: [
      [40.9333, 24.4167], // Philippi
      [40.9100, 24.3000],
      [40.8600, 24.1500], // Base of Mount Pangaion
      [40.8300, 23.9500],
      [40.8242, 23.8458]  // Amphipolis (Lion monument / bridge)
    ]
  },

  "amphipolis_to_apollonia_via_egnatia": {
    id: "amphipolis_to_apollonia_via_egnatia",
    fromName: "Amphipolis",
    toName: "Apollonia",
    historicalRoadName: "Via Egnatia (Chalcidice Northern Route)",
    mode: "land_walking",
    distanceMiles: 30,
    travelDays: 1.5,
    notes: "Passing along the Bolbe Lake corridor through the Rentina gorge.",
    coordinates: [
      [40.8242, 23.8458], // Amphipolis
      [40.7500, 23.7000],
      [40.6600, 23.6000], // Lake Bolbe defile
      [40.6389, 23.4861]  // Apollonia in Mygdonia
    ]
  },

  "apollonia_to_thessalonica_via_egnatia": {
    id: "apollonia_to_thessalonica_via_egnatia",
    fromName: "Apollonia",
    toName: "Thessalonica",
    historicalRoadName: "Via Egnatia (Thermaic Gulf Approach)",
    mode: "land_walking",
    distanceMiles: 38,
    travelDays: 2,
    notes: "Descending through the hills into the provincial capital and principal naval port of Macedonia.",
    coordinates: [
      [40.6389, 23.4861], // Apollonia
      [40.6200, 23.3000],
      [40.6000, 23.1000],
      [40.6401, 22.9444]  // Thessalonica
    ]
  },

  "thessalonica_to_berea": {
    id: "thessalonica_to_berea",
    fromName: "Thessalonica",
    toName: "Berea (Veroia)",
    historicalRoadName: "Via Egnatia Southern Spur",
    mode: "land_walking",
    distanceMiles: 45,
    travelDays: 2,
    notes: "Paul and Silas escaped by night (Acts 17:10), crossing the Axios river and skirting Lake Loudias marshes into the Vermio foothills.",
    coordinates: [
      [40.6401, 22.9444], // Thessalonica
      [40.6550, 22.8200], // Gallikos river ford
      [40.6250, 22.6800], // Ancient Sindos / Chalastra
      [40.5950, 22.5800], // Axios (Vardar) river crossing
      [40.5600, 22.4200], // Skirting northern marshes of former Lake Loudias
      [40.5350, 22.3100], // Ascent into Pierian foothills
      [40.5236, 22.2045]  // Berea (Veroia)
    ]
  },

  "berea_to_pydna_methone": {
    id: "berea_to_pydna_methone",
    fromName: "Berea (Veroia)",
    toName: "Pydna / Methone Coast",
    historicalRoadName: "Aliakmon River Coastal Track",
    mode: "land_walking",
    distanceMiles: 26,
    travelDays: 1.5,
    notes: "Acts 17:14: The Berean believers escorted Paul to the sea to escape Thessalonian agitators.",
    coordinates: [
      [40.5236, 22.2045], // Berea
      [40.4800, 22.3400], // Crossing the lower Aliakmon river
      [40.4300, 22.4800], // Pierian plain
      [40.3667, 22.6167]  // Pydna / Methone harbor on the Thermaic Gulf
    ]
  },

  "pydna_to_athens_sea": {
    id: "pydna_to_athens_sea",
    fromName: "Pydna / Methone Coast",
    toName: "Athens (Piraeus / Phaleron)",
    historicalRoadName: "Aegean Coastal Sailing Route",
    mode: "sea_sailing",
    distanceMiles: 220,
    travelDays: 4,
    notes: "Acts 17:15: Paul sailed south past Mount Olympus, through the Euboean Channel, rounding Cape Sounion into the Saronic Gulf.",
    coordinates: [
      [40.3667, 22.6167], // Pydna coast
      [40.1000, 22.7500], // Passing Mount Olympus
      [39.5000, 23.2000], // Along Mount Pelion
      [39.0000, 23.4000], // Skiathos / northern Euboean channel
      [38.4000, 24.1000], // South Euboean gulf
      [37.6500, 24.0300], // Rounding Cape Sounion (Temple of Poseidon)
      [37.9300, 23.6800], // Phaleron Bay / Piraeus
      [37.9719, 23.7258]  // Athens (Acropolis & Areopagus)
    ]
  },

  "athens_to_corinth_isthmus": {
    id: "athens_to_corinth_isthmus",
    fromName: "Athens",
    toName: "Corinth",
    historicalRoadName: "Sacred Way & Isthmian Road",
    mode: "land_walking",
    distanceMiles: 52,
    travelDays: 2.5,
    notes: "Acts 18:1: Following the Sacred Way through Eleusis, past the Scironian Rocks of Megara, across the Isthmus.",
    coordinates: [
      [37.9719, 23.7258], // Athens
      [38.0400, 23.5400], // Eleusis
      [37.9900, 23.3400], // Megara
      [37.9250, 23.0050], // Isthmus of Corinth (Diolkos)
      [37.9060, 22.8800]  // Ancient Corinth (Bema of Gallio)
    ]
  },

  "corinth_to_cenchreae": {
    id: "corinth_to_cenchreae",
    fromName: "Corinth",
    toName: "Cenchreae",
    historicalRoadName: "Saronic Gulf Port Road",
    mode: "land_walking",
    distanceMiles: 7,
    travelDays: 0.5,
    notes: "Acts 18:18: Eastern port of Corinth where Paul had his hair cut for a vow before sailing.",
    coordinates: [
      [37.9060, 22.8800], // Corinth
      [37.8950, 22.9400],
      [37.8850, 22.9950]  // Cenchreae Harbor
    ]
  },

  "cenchreae_to_ephesus_sea": {
    id: "cenchreae_to_ephesus_sea",
    fromName: "Cenchreae",
    toName: "Ephesus",
    historicalRoadName: "Aegean Trans-Archipelago Route",
    mode: "sea_sailing",
    distanceMiles: 230,
    travelDays: 5,
    notes: "Acts 18:19: Island-hopping across the Cyclades via Syros, Mykonos, and Samos to the Roman capital of Asia.",
    coordinates: [
      [37.8850, 22.9950], // Cenchreae
      [37.5000, 23.8000],
      [37.4000, 24.9000], // Syros Island
      [37.4500, 25.3500], // Mykonos
      [37.7000, 26.8000], // Strait of Samos
      [37.9400, 27.3400]  // Ephesus (Port & Theater)
    ]
  },

  // ============================================================================
  // GOSPELS: MINISTRY OF JESUS & EARLY APOSTLES
  // ============================================================================
  "nazareth_to_bethlehem_jordan_valley": {
    id: "nazareth_to_bethlehem_jordan_valley",
    fromName: "Nazareth",
    toName: "Bethlehem",
    historicalRoadName: "Jordan Rift Valley & Jericho Ascent",
    mode: "land_walking",
    distanceMiles: 92,
    travelDays: 4.5,
    notes: "Luke 2:4: Traditional pilgrimage path avoiding Samaria via Jezreel Valley, Scythopolis, down Jordan River, then ascending Jericho to Bethlehem.",
    coordinates: [
      [32.7019, 35.2979], // Nazareth
      [32.6100, 35.3800], // Jezreel Valley (Esdraelon)
      [32.5000, 35.5000], // Scythopolis (Beth-Shean)
      [32.3000, 35.5300], // Jordan River Valley road
      [32.0500, 35.5100],
      [31.8550, 35.4450], // Jericho oasis
      [31.8100, 35.3450], // Ascent of Adummim (Wadi Qelt)
      [31.7767, 35.2354], // Jerusalem bypass
      [31.7054, 35.2024]  // Bethlehem of Judea
    ]
  },

  "jerusalem_to_jericho_road": {
    id: "jerusalem_to_jericho_road",
    fromName: "Jerusalem",
    toName: "Jericho",
    historicalRoadName: "The Blood Road (Wadi Qelt Roman Descent)",
    mode: "land_walking",
    distanceMiles: 17,
    travelDays: 1,
    notes: "Luke 10:30 (Good Samaritan) & Luke 19: Dramatic 3,300-foot descent through rugged desert canyon notorious for bandits.",
    coordinates: [
      [31.7767, 35.2354], // Jerusalem (Lions' Gate / Temple)
      [31.7700, 35.2600], // Bethany on Mount of Olives
      [31.7950, 35.3100], // Judean Desert wilderness
      [31.8150, 35.3550], // Ascent of Adummim ("Inn of the Good Samaritan")
      [31.8400, 35.4100], // Wadi Qelt gorge mouth
      [31.8550, 35.4450]  // Ancient Jericho (Herodian winter palaces)
    ]
  },

  "jerusalem_to_emmaus_roman_road": {
    id: "jerusalem_to_emmaus_roman_road",
    fromName: "Jerusalem",
    toName: "Emmaus",
    historicalRoadName: "Roman Road to Emmaus / Nicopolis",
    mode: "land_walking",
    distanceMiles: 7.5,
    travelDays: 0.35,
    notes: "Luke 24:13: Sixty stadia (about 7 miles). Cleopas and companion walked here on Resurrection afternoon.",
    coordinates: [
      [31.7767, 35.2354], // Jerusalem
      [31.7850, 35.1950], // Lifta / Roman milestone route
      [31.7950, 35.1500], // Roman paved track through Judean foothills
      [31.8100, 35.1050], // Kiryat Ye'arim vicinity
      [31.8380, 35.0020]  // Emmaus
    ]
  },

  "galilee_to_jerusalem_via_samaria": {
    id: "galilee_to_jerusalem_via_samaria",
    fromName: "Judea / Jerusalem",
    toName: "Cana of Galilee",
    historicalRoadName: "Way of the Patriarchs (Central Ridge Northbound)",
    mode: "land_walking",
    distanceMiles: 68,
    travelDays: 3,
    notes: "John 4:3-4: 'He left Judea and departed again into Galilee. And He had to pass through Samaria.' Stopping at Jacob's Well near Sychar/Shechem.",
    coordinates: [
      [31.7767, 35.2354], // Jerusalem / Judea
      [31.9300, 35.2200], // Bethel
      [32.0550, 35.2890], // Shiloh
      [32.2133, 35.2819], // Sychar / Shechem (Jacob's Well)
      [32.4000, 35.2500], // Dothan Valley entry into Samaria
      [32.6100, 35.3100], // Plain of Esdraelon
      [32.7460, 35.3380]  // Cana / Lower Galilee
    ]
  },

  "capernaum_to_caesarea_philippi": {
    id: "capernaum_to_caesarea_philippi",
    fromName: "Capernaum",
    toName: "Caesarea Philippi (Banias)",
    historicalRoadName: "Hula Valley / Mount Hermon Highway",
    mode: "land_walking",
    distanceMiles: 28,
    travelDays: 1.5,
    notes: "Matthew 16:13: Peter's confession ('You are the Christ'). Following the upper Jordan River to the springs of Mount Hermon.",
    coordinates: [
      [32.8806, 35.5750], // Capernaum
      [32.9600, 35.6100], // Jordan River entrance to Sea of Galilee
      [33.1000, 35.6400], // Hula Valley floor
      [33.2200, 35.6800], // Tel Dan
      [33.2483, 35.6933]  // Caesarea Philippi (Banias springs)
    ]
  },

  // ============================================================================
  // ACTS 9: THE CONVERSION OF SAUL (DAMASCUS ROAD)
  // ============================================================================
  "jerusalem_to_damascus_road": {
    id: "jerusalem_to_damascus_road",
    fromName: "Jerusalem",
    toName: "Damascus",
    historicalRoadName: "Via Maris Eastern Branch (Damascus Highway)",
    mode: "land_walking",
    distanceMiles: 140,
    travelDays: 7,
    notes: "Acts 9:3: The blinding light struck Saul near Damascus on this major imperial caravan road.",
    coordinates: [
      [31.7767, 35.2354], // Jerusalem
      [31.9300, 35.2200], // Bethel
      [32.2133, 35.2819], // Shechem
      [32.5000, 35.5000], // Scythopolis
      [32.7200, 35.6200], // Sea of Galilee south shore
      [32.9500, 35.7500], // Golan Heights ascent
      [33.1500, 35.9500], // Quneitra / Hermon foothills
      [33.3500, 36.1500], // Approaching Syrian oasis
      [33.5111, 36.3064]  // Damascus (Straight Street)
    ]
  },

  // ============================================================================
  // OLD TESTAMENT: PATRIARCHS & EXODUS
  // ============================================================================
  "way_of_the_patriarchs_complete": {
    id: "way_of_the_patriarchs_complete",
    fromName: "Shechem",
    toName: "Beersheba",
    historicalRoadName: "The Way of the Patriarchs (Ridge Route)",
    mode: "land_walking",
    distanceMiles: 75,
    travelDays: 3.5,
    notes: "Genesis 12–26: The ancient watershed ridge route traveled by Abraham, Isaac, and Jacob connecting biblical mountain sanctuaries.",
    coordinates: [
      [32.2133, 35.2819], // Shechem (Mount Gerizim & Ebal)
      [32.0550, 35.2890], // Shiloh
      [31.9300, 35.2200], // Bethel / Ai
      [31.7767, 35.2354], // Jerusalem (Salem / Mount Moriah)
      [31.7054, 35.2024], // Bethlehem (Ephrath)
      [31.5290, 35.0930], // Hebron (Mamre / Cave of Machpelah)
      [31.2450, 34.7900]  // Beersheba (Well of the Oath)
    ]
  },

  "exodus_rameses_to_redsea": {
    id: "exodus_rameses_to_redsea",
    fromName: "Rameses (Goshen)",
    toName: "Pi-Hahiroth (Red Sea Crossing)",
    historicalRoadName: "Way of the Wilderness (Wadi Tumilat)",
    mode: "desert_caravan",
    distanceMiles: 65,
    travelDays: 5,
    isScholarlyEstimate: true,
    notes: "Exodus 12–14: Israel departing Goshen along Wadi Tumilat through Succoth and Etham to the Sea.",
    coordinates: [
      [30.8000, 31.8300], // Rameses (Qantir / Avaris)
      [30.5500, 32.0000], // Succoth (Tell el-Maskhuta)
      [30.5800, 32.2500], // Etham at wilderness edge
      [30.2500, 32.4500], // Bitter Lakes corridor
      [29.9500, 32.5500]  // Northern Red Sea / Gulf of Suez waters
    ]
  },

  "exodus_redsea_to_mount_sinai": {
    id: "exodus_redsea_to_mount_sinai",
    fromName: "Red Sea Crossing",
    toName: "Mount Sinai (Jebel Musa)",
    historicalRoadName: "Sinai Coastal & Granite Valley Route",
    mode: "desert_caravan",
    distanceMiles: 110,
    travelDays: 45, // Exodus narrative records 50 days to Sinai covenant
    isScholarlyEstimate: true,
    notes: "Exodus 15–19: Through Marah, Elim, the Wilderness of Sin, and Rephidim to the Mountain of God.",
    coordinates: [
      [29.9500, 32.5500], // Shore of the Sea
      [29.5800, 32.8800], // Marah (Bitter Waters / Ain Hawara)
      [29.3000, 33.1000], // Elim (Wadi Gharandel - 12 springs & 70 palms)
      [28.9500, 33.3000], // Wilderness of Sin along Gulf coast
      [28.7500, 33.6500], // Wadi Feiran / Rephidim oasis
      [28.5390, 33.9750]  // Mount Sinai (Jebel Musa / Plain of er-Raha)
    ]
  },

  // ============================================================================
  // ACTS 27 & 28: PAUL'S VOYAGE & ROAD TO ROME
  // ============================================================================
  "caesarea_to_sidon_myra_sea": {
    id: "caesarea_to_sidon_myra_sea",
    fromName: "Caesarea Maritima",
    toName: "Myra in Lycia",
    historicalRoadName: "Eastern Mediterranean Imperial Grain Route",
    mode: "sea_sailing",
    distanceMiles: 480,
    travelDays: 6,
    notes: "Acts 27:1-5: Boarding an Adramyttian ship, stopping at Sidon, then sailing under the lee of Cyprus along Cilicia.",
    coordinates: [
      [32.5020, 34.8910], // Caesarea Harbor
      [33.5600, 35.3700], // Sidon
      [34.5000, 34.0000], // North of Cyprus
      [35.8000, 32.0000], // Off the coast of Cilicia & Pamphylia
      [36.2500, 29.9800]  // Myra harbor (Andriake)
    ]
  },

  "myra_to_crete_fair_havens": {
    id: "myra_to_crete_fair_havens",
    fromName: "Myra in Lycia",
    toName: "Fair Havens (Crete)",
    historicalRoadName: "Alexandrian Grain Freighter Lane",
    mode: "sea_sailing",
    distanceMiles: 290,
    travelDays: 7,
    notes: "Acts 27:6-8: Transferring to an Alexandrian grain ship, struggling against adverse winds past Cnidus to the south coast of Crete.",
    coordinates: [
      [36.2500, 29.9800], // Myra
      [36.7000, 27.3500], // Off Cnidus
      [35.4000, 26.3000], // Rounding Cape Salmone (eastern Crete)
      [34.9300, 24.8000]  // Fair Havens (Lasea)
    ]
  },

  "crete_to_malta_euroclydon": {
    id: "crete_to_malta_euroclydon",
    fromName: "Fair Havens (Crete)",
    toName: "Malta (St. Paul's Bay)",
    historicalRoadName: "Adrift in the Sea of Adria (Northeaster Gale)",
    mode: "sea_sailing",
    distanceMiles: 490,
    travelDays: 14,
    notes: "Acts 27:14-44: Fourteen days driven before the violent 'Euroclydon' storm until shipwreck on Malta.",
    coordinates: [
      [34.9300, 24.8000], // Fair Havens
      [34.8000, 24.1000], // Driven past Cauda (Gavdos)
      [35.2000, 21.0000], // Adrift across the central Mediterranean
      [35.6000, 18.0000],
      [35.9400, 14.4000]  // St. Paul's Bay, Malta
    ]
  },

  "malta_to_puteoli_sea": {
    id: "malta_to_puteoli_sea",
    fromName: "Malta",
    toName: "Puteoli (Pozzuoli)",
    historicalRoadName: "Tyrrhenian Sea Coastal Run",
    mode: "sea_sailing",
    distanceMiles: 340,
    travelDays: 5,
    notes: "Acts 28:11-13: On a ship of Alexandria displaying Castor & Pollux, via Syracuse and Rhegium.",
    coordinates: [
      [35.9400, 14.4000], // Malta
      [37.0700, 15.2800], // Syracuse, Sicily
      [38.1100, 15.6500], // Strait of Messina (Rhegium)
      [40.8200, 14.1200]  // Puteoli (Bay of Naples)
    ]
  },

  "puteoli_to_rome_via_appia": {
    id: "puteoli_to_rome_via_appia",
    fromName: "Puteoli (Pozzuoli)",
    toName: "Rome",
    historicalRoadName: "Via Domitiana & Via Appia (The Queen of Roads)",
    mode: "land_walking",
    distanceMiles: 135,
    travelDays: 6,
    notes: "Acts 28:14-16: Met by Roman believers at the Forum of Appius and Three Taverns before entering the imperial capital.",
    coordinates: [
      [40.8200, 14.1200], // Puteoli
      [41.1000, 13.9500], // Sinuessa (joining Via Appia)
      [41.2500, 13.4000], // Terracina
      [41.5000, 13.0000], // Forum of Appius / Pontine marshes
      [41.6500, 12.7500], // Three Taverns
      [41.9000, 12.4900]  // Rome (Porta Capena)
    ]
  },

  // ============================================================================
  // ACTS 8: PHILIP'S EVANGELISTIC JOURNEY (GAZA & VIA MARIS)
  // ============================================================================
  "jerusalem_to_gaza_desert_road": {
    id: "jerusalem_to_gaza_desert_road",
    fromName: "Jerusalem",
    toName: "Gaza Desert Road",
    historicalRoadName: "Ancient Way to Gaza (Shephelah Descent)",
    mode: "land_walking",
    distanceMiles: 55,
    travelDays: 2.5,
    notes: "Acts 8:26: The angel said to Philip, Arise, and go toward the south unto the way that goeth down from Jerusalem unto Gaza, which is desert.",
    coordinates: [
      [31.7767, 35.2345], // Jerusalem
      [31.7054, 35.2024], // Bethlehem
      [31.6033, 34.9000], // Eleutheropolis (Beit Guvrin)
      [31.5500, 34.6500], // Lachish defile
      [31.5000, 34.4600]  // Gaza desert approach
    ]
  },

  "gaza_to_azotus_via_maris": {
    id: "gaza_to_azotus_via_maris",
    fromName: "Gaza Desert Road",
    toName: "Azotus (Ashdod)",
    historicalRoadName: "Via Maris (Philistine Coastal Trunk)",
    mode: "land_walking",
    distanceMiles: 26,
    travelDays: 1.2,
    notes: "Acts 8:39-40: The Spirit of the Lord caught away Philip, and Philip was found at Azotus.",
    coordinates: [
      [31.5000, 34.4600], // Gaza
      [31.6667, 34.5667], // Ascalon (Ashkelon)
      [31.8000, 34.6500]  // Azotus (Ashdod)
    ]
  },

  "azotus_to_caesarea_via_maris": {
    id: "azotus_to_caesarea_via_maris",
    fromName: "Azotus (Ashdod)",
    toName: "Caesarea Maritima",
    historicalRoadName: "Via Maris (Sharon Plain Coastal Highway)",
    mode: "land_walking",
    distanceMiles: 58,
    travelDays: 3,
    notes: "Acts 8:40: And passing through he preached in all the cities, till he came to Caesarea.",
    coordinates: [
      [31.8000, 34.6500], // Azotus
      [31.8900, 34.7200], // Jamnia (Yavne)
      [32.0536, 34.7558], // Joppa (Jaffa)
      [32.1900, 34.8000], // Apollonia-Arsuf
      [32.5020, 34.8910]  // Caesarea Maritima
    ]
  },

  // ============================================================================
  // ACTS 14: PAUL & BARNABAS JOURNEY (ICONIUM -> LYSTRA -> DERBE & RETURN CIRCUIT)
  // ============================================================================
  "iconium_to_lystra_outbound": {
    id: "iconium_to_lystra_outbound",
    fromName: "Iconium",
    toName: "Lystra",
    historicalRoadName: "Via Sebaste (Southern Galatia Trunk)",
    mode: "land_walking",
    distanceMiles: 25,
    travelDays: 1.5,
    notes: "Acts 14:6: Fleeing persecution in Iconium unto Lystra.",
    coordinates: [
      [37.8722, 32.4923], // Iconium
      [37.7200, 32.4200],
      [37.6017, 32.3384]  // Lystra
    ]
  },

  "lystra_to_derbe_outbound": {
    id: "lystra_to_derbe_outbound",
    fromName: "Lystra",
    toName: "Derbe",
    historicalRoadName: "Via Sebaste (Isaurian Plain)",
    mode: "land_walking",
    distanceMiles: 65,
    travelDays: 3.5,
    notes: "Acts 14:20: The next day he departed with Barnabas to Derbe.",
    coordinates: [
      [37.6017, 32.3384], // Lystra
      [37.5200, 32.5500],
      [37.4500, 32.9000],
      [37.3486, 33.3615]  // Derbe
    ]
  },

  "derbe_to_lystra_return": {
    id: "derbe_to_lystra_return",
    fromName: "Derbe",
    toName: "Lystra",
    historicalRoadName: "Via Sebaste Return Highway",
    mode: "land_walking",
    distanceMiles: 65,
    travelDays: 3.5,
    notes: "Acts 14:21: They returned again to Lystra, and to Iconium, and Antioch.",
    coordinates: [
      [37.3486, 33.3615], // Derbe
      [37.4500, 32.9000],
      [37.5200, 32.5500],
      [37.6017, 32.3384]  // Lystra
    ]
  },

  "lystra_to_iconium_return": {
    id: "lystra_to_iconium_return",
    fromName: "Lystra",
    toName: "Iconium",
    historicalRoadName: "Via Sebaste (Iconium Highway)",
    mode: "land_walking",
    distanceMiles: 25,
    travelDays: 1.5,
    notes: "Acts 14:21: Confirming the souls of the disciples in Iconium.",
    coordinates: [
      [37.6017, 32.3384],
      [37.7200, 32.4200],
      [37.8722, 32.4923]
    ]
  },

  "iconium_to_pisidian_antioch_return": {
    id: "iconium_to_pisidian_antioch_return",
    fromName: "Iconium",
    toName: "Antioch (Pisidia)",
    historicalRoadName: "Via Sebaste (Pisidian Ascent)",
    mode: "land_walking",
    distanceMiles: 85,
    travelDays: 4,
    notes: "Acts 14:21: Returning through Pisidia exhorting them to continue in the faith.",
    coordinates: [
      [37.8722, 32.4923],
      [37.9500, 32.1000],
      [38.1500, 31.6000],
      [38.3000, 31.1800]
    ]
  },

  "pisidian_antioch_to_perga_return": {
    id: "pisidian_antioch_to_perga_return",
    fromName: "Antioch (Pisidia)",
    toName: "Perga (Pamphylia)",
    historicalRoadName: "Via Sebaste (Taurus Pass Descent)",
    mode: "land_walking",
    distanceMiles: 105,
    travelDays: 5,
    notes: "Acts 14:24-25: And after they had passed throughout Pisidia, they came to Pamphylia. And when they had preached the word in Perga...",
    coordinates: [
      [38.3000, 31.1800],
      [37.6000, 30.8000],
      [37.2000, 30.7500],
      [36.9600, 30.8500]
    ]
  },

  "perga_to_attalia_highway": {
    id: "perga_to_attalia_highway",
    fromName: "Perga (Pamphylia)",
    toName: "Attalia (Antalya)",
    historicalRoadName: "Pamphylian Coastal Highway",
    mode: "land_walking",
    distanceMiles: 12,
    travelDays: 0.5,
    notes: "Acts 14:25: ...they went down into Attalia.",
    coordinates: [
      [36.9600, 30.8500],
      [36.8860, 30.7030]
    ]
  },

  "attalia_to_seleucia_sea": {
    id: "attalia_to_seleucia_sea",
    fromName: "Attalia (Antalya)",
    toName: "Antioch (Syria)",
    historicalRoadName: "Cilician & Levantine Sea Lane",
    mode: "sea_sailing",
    distanceMiles: 310,
    travelDays: 4,
    notes: "Acts 14:26: And thence sailed to Antioch, from whence they had been recommended to the grace of God for the work which they fulfilled.",
    coordinates: [
      [36.8860, 30.7030],
      [36.2000, 31.5000],
      [35.9000, 33.0000],
      [35.7000, 35.0000],
      [36.1200, 35.9200],
      [36.2021, 36.1606]
    ]
  },

  // ============================================================================
  // ACTS 18: RETURN TO ANTIOCH & START OF 3RD MISSIONARY JOURNEY
  // ============================================================================
  "ephesus_to_caesarea_sea": {
    id: "ephesus_to_caesarea_sea",
    fromName: "Ephesus",
    toName: "Caesarea Maritima",
    historicalRoadName: "Aegean to Levantine Deep Sea Lane",
    mode: "sea_sailing",
    distanceMiles: 590,
    travelDays: 7,
    notes: "Acts 18:21-22: Paul sailed from Ephesus, promising to return God willing, and landed at Caesarea.",
    coordinates: [
      [37.9400, 27.3400],
      [36.5000, 28.0000],
      [35.5000, 30.5000],
      [34.5000, 33.0000],
      [32.5020, 34.8910]
    ]
  },

  "caesarea_to_jerusalem_ascent": {
    id: "caesarea_to_jerusalem_ascent",
    fromName: "Caesarea Maritima",
    toName: "Jerusalem",
    historicalRoadName: "Roman Caesarea-Jerusalem Road",
    mode: "land_walking",
    distanceMiles: 68,
    travelDays: 3,
    notes: "Acts 18:22: And when he had landed at Caesarea, and gone up, and saluted the church...",
    coordinates: [
      [32.5020, 34.8910],
      [32.1700, 34.9300],
      [31.9000, 35.0500],
      [31.7767, 35.2345]
    ]
  },

  "jerusalem_to_syrian_antioch": {
    id: "jerusalem_to_syrian_antioch",
    fromName: "Jerusalem",
    toName: "Antioch (Syria)",
    historicalRoadName: "Levantine Royal Highway",
    mode: "land_walking",
    distanceMiles: 340,
    travelDays: 16,
    notes: "Acts 18:22: ...he went down to Antioch.",
    coordinates: [
      [31.7767, 35.2345],
      [32.2200, 35.2600],
      [32.7000, 35.3000],
      [33.2500, 35.6000],
      [33.5100, 36.2900],
      [34.7300, 36.7100],
      [36.2021, 36.1606]
    ]
  },

  "antioch_through_galatia_phrygia": {
    id: "antioch_through_galatia_phrygia",
    fromName: "Antioch (Syria)",
    toName: "Galatia & Phrygia",
    historicalRoadName: "Via Tauri & Royal Highway of Anatolia",
    mode: "land_walking",
    distanceMiles: 350,
    travelDays: 17,
    notes: "Acts 18:23: And after he had spent some time there, he departed, and went over all the country of Galatia and Phrygia in order, strengthening all the disciples.",
    coordinates: [
      [36.2021, 36.1606],
      [36.9200, 35.6000],
      [37.2800, 34.8700],
      [37.8722, 32.4923],
      [38.3000, 31.1800]
    ]
  },

  // ============================================================================
  // ACTS 20: PAUL'S AEGEAN MARITIME VOYAGE TO MILETUS
  // ============================================================================
  "troas_to_assos_roman_road": {
    id: "troas_to_assos_roman_road",
    fromName: "Troas (Alexandria Troas)",
    toName: "Assos",
    historicalRoadName: "Troad Roman Coastal Highway",
    mode: "land_walking",
    distanceMiles: 22,
    travelDays: 1,
    notes: "Acts 20:13: Paul chose to travel overland on foot to Assos, while Luke and the companions sailed around Cape Lectum.",
    coordinates: [
      [39.7519, 26.1586],
      [39.6000, 26.2500],
      [39.4900, 26.3400]
    ]
  },

  "assos_to_mitylene_sea": {
    id: "assos_to_mitylene_sea",
    fromName: "Assos",
    toName: "Mitylene (Lesbos)",
    historicalRoadName: "Adramyttian Gulf Sea Channel",
    mode: "sea_sailing",
    distanceMiles: 30,
    travelDays: 1,
    notes: "Acts 20:14: And when he met with us at Assos, we took him in, and came to Mitylene.",
    coordinates: [
      [39.4900, 26.3400],
      [39.3000, 26.4500],
      [39.1000, 26.5500]
    ]
  },

  "mitylene_to_chios_samos_sea": {
    id: "mitylene_to_chios_samos_sea",
    fromName: "Mitylene (Lesbos)",
    toName: "Samos & Trogyllium",
    historicalRoadName: "Ionian Insular Sea Lane",
    mode: "sea_sailing",
    distanceMiles: 110,
    travelDays: 2,
    notes: "Acts 20:15: And we sailed thence, and came the next day over against Chios; and the next day we arrived at Samos, and tarried at Trogyllium...",
    coordinates: [
      [39.1000, 26.5500],
      [38.4000, 26.2000],
      [37.7500, 26.9000]
    ]
  },

  "samos_to_miletus_sea": {
    id: "samos_to_miletus_sea",
    fromName: "Samos & Trogyllium",
    toName: "Miletus",
    historicalRoadName: "Latmian Gulf Maritime Approach",
    mode: "sea_sailing",
    distanceMiles: 32,
    travelDays: 1,
    notes: "Acts 20:15-17: ...and the next day we came to Miletus, where Paul sent to Ephesus and called the elders of the church.",
    coordinates: [
      [37.7500, 26.9000],
      [37.6000, 27.1500],
      [37.5300, 27.2800]
    ]
  },

  // ============================================================================
  // ACTS 21: PAUL'S VOYAGE FROM MILETUS TO JERUSALEM
  // ============================================================================
  "miletus_to_cos_rhodes_sea": {
    id: "miletus_to_cos_rhodes_sea",
    fromName: "Miletus",
    toName: "Rhodes",
    historicalRoadName: "Dodecanese Maritime Route",
    mode: "sea_sailing",
    distanceMiles: 125,
    travelDays: 2,
    notes: "Acts 21:1: We came with a straight course unto Coos, and the day following unto Rhodes...",
    coordinates: [
      [37.5300, 27.2800],
      [36.8900, 27.2900],
      [36.4400, 28.2200]
    ]
  },

  "rhodes_to_patara_sea": {
    id: "rhodes_to_patara_sea",
    fromName: "Rhodes",
    toName: "Patara",
    historicalRoadName: "Lycian Coastal Channel",
    mode: "sea_sailing",
    distanceMiles: 75,
    travelDays: 1,
    notes: "Acts 21:1: ...and from thence unto Patara.",
    coordinates: [
      [36.4400, 28.2200],
      [36.3000, 28.9000],
      [36.2600, 29.3100]
    ]
  },

  "patara_to_tyre_deep_sea": {
    id: "patara_to_tyre_deep_sea",
    fromName: "Patara",
    toName: "Tyre",
    historicalRoadName: "Deep Mediterranean Route (South of Cyprus)",
    mode: "sea_sailing",
    distanceMiles: 350,
    travelDays: 4,
    notes: "Acts 21:2-3: Finding a ship sailing over unto Phenicia, we discovered Cyprus, leaving it on the left hand, and sailed into Syria, landing at Tyre.",
    coordinates: [
      [36.2600, 29.3100],
      [35.5000, 31.0000],
      [34.5000, 33.0000],
      [33.2700, 35.2000]
    ]
  },

  "tyre_to_ptolemais_sea": {
    id: "tyre_to_ptolemais_sea",
    fromName: "Tyre",
    toName: "Ptolemais (Acre)",
    historicalRoadName: "Phoenician Coastal Run",
    mode: "sea_sailing",
    distanceMiles: 25,
    travelDays: 1,
    notes: "Acts 21:7: And when we had finished our course from Tyre, we came to Ptolemais, and saluted the brethren.",
    coordinates: [
      [33.2700, 35.2000],
      [33.1000, 35.1500],
      [32.9300, 35.0800]
    ]
  },

  "ptolemais_to_caesarea_road": {
    id: "ptolemais_to_caesarea_road",
    fromName: "Ptolemais (Acre)",
    toName: "Caesarea Maritima",
    historicalRoadName: "Via Maris (Mount Carmel Pass)",
    mode: "land_walking",
    distanceMiles: 30,
    travelDays: 1.5,
    notes: "Acts 21:8: And the next day we that were of Paul's company departed, and came unto Caesarea: and we entered into the house of Philip the evangelist.",
    coordinates: [
      [32.9300, 35.0800],
      [32.8200, 35.0000],
      [32.6500, 34.9300],
      [32.5020, 34.8910]
    ]
  },

  "caesarea_to_jerusalem_ridge_road": {
    id: "caesarea_to_jerusalem_ridge_road",
    fromName: "Caesarea Maritima",
    toName: "Jerusalem",
    historicalRoadName: "Roman Military Highway to Jerusalem",
    mode: "land_walking",
    distanceMiles: 68,
    travelDays: 3,
    notes: "Acts 21:15-17: And after those days we took up our carriages, and went up to Jerusalem. And when we were come to Jerusalem, the brethren received us gladly.",
    coordinates: [
      [32.5020, 34.8910],
      [32.1700, 34.9300],
      [31.9000, 35.0500],
      [31.7767, 35.2345]
    ]
  },

  // ============================================================================
  // JONAH 1 & 3: JONAH'S FLIGHT TO THE MEDITERRANEAN & MISSION TO NINEVEH
  // ============================================================================
  "joppa_to_mediterranean_sea": {
    id: "joppa_to_mediterranean_sea",
    fromName: "Joppa (Jaffa)",
    toName: "Great Sea (Westward to Tarshish)",
    historicalRoadName: "Great Sea Maritime Channel to the West",
    mode: "sea_sailing",
    distanceMiles: 150,
    travelDays: 3,
    notes: "Jonah 1:3: Jonah rose up to flee unto Tarshish from the presence of the Lord, and went down to Joppa; and he found a ship going to Tarshish.",
    coordinates: [
      [32.0536, 34.7558],
      [32.3000, 34.2000],
      [32.6000, 33.4000],
      [33.0000, 32.0000]
    ]
  },

  "jonah_journey_to_nineveh": {
    id: "jonah_journey_to_nineveh",
    fromName: "Levant",
    toName: "Nineveh",
    historicalRoadName: "Upper Mesopotamian Caravan Road",
    mode: "desert_caravan",
    distanceMiles: 450,
    travelDays: 22,
    notes: "Jonah 3:3-4: So Jonah arose, and went unto Nineveh, according to the word of the Lord. Now Nineveh was an exceeding great city of three days' journey.",
    coordinates: [
      [34.8000, 36.3000],
      [35.5000, 38.0000],
      [36.3000, 40.5000],
      [36.3600, 43.1500]
    ]
  },

  // ============================================================================
  // 1 KINGS 19: ELIJAH'S FLIGHT TO MOUNT HOREB & COMMISSION TO DAMASCUS
  // ============================================================================
  "jezreel_to_beersheba_ridge_road": {
    id: "jezreel_to_beersheba_ridge_road",
    fromName: "Jezreel",
    toName: "Beersheba",
    historicalRoadName: "Way of the Patriarchs (Central Ridge Route)",
    mode: "land_walking",
    distanceMiles: 95,
    travelDays: 5,
    notes: "1 Kings 19:3: And when he saw that, he arose, and went for his life, and came to Beersheba, which belongeth to Judah, and left his servant there.",
    coordinates: [
      [32.5583, 35.3283],
      [32.2211, 35.2606],
      [31.9300, 35.2200],
      [31.7767, 35.2345],
      [31.5292, 35.0938],
      [31.2450, 34.7950]
    ]
  },

  "beersheba_to_mount_sinai": {
    id: "beersheba_to_mount_sinai",
    fromName: "Beersheba",
    toName: "Mount Horeb (Sinai)",
    historicalRoadName: "Sinai Wilderness Pilgrimage Route",
    mode: "desert_caravan",
    distanceMiles: 210,
    travelDays: 40,
    notes: "1 Kings 19:8: And he arose, and did eat and drink, and went in the strength of that meat forty days and forty nights unto Horeb the mount of God.",
    coordinates: [
      [31.2450, 34.7950],
      [30.9000, 34.5000],
      [30.2000, 34.3000],
      [29.5500, 34.9500],
      [28.9500, 34.3000],
      [28.5390, 33.9750]
    ]
  },

  "sinai_to_damascus_desert_highway": {
    id: "sinai_to_damascus_desert_highway",
    fromName: "Mount Horeb (Sinai)",
    toName: "Damascus",
    historicalRoadName: "King's Highway & Desert Highway to Aram",
    mode: "desert_caravan",
    distanceMiles: 360,
    travelDays: 18,
    notes: "1 Kings 19:15: And the Lord said unto him, Go, return on thy way to the wilderness of Damascus: and when thou comest, anoint Hazael to be king over Syria.",
    coordinates: [
      [28.5390, 33.9750],
      [29.5500, 34.9500],
      [30.5000, 35.5000],
      [31.5000, 35.8000],
      [32.3000, 36.0000],
      [33.5100, 36.2900]
    ]
  },

  // ============================================================================
  // GOSPELS & ACTS EXPANSION: ROMAN HIGHWAYS OF JUDAEA, GALILEE & SHARON
  // ============================================================================
  "nazareth_to_capernaum_via_maris": {
    id: "nazareth_to_capernaum_via_maris",
    fromName: "Nazareth",
    toName: "Capernaum",
    historicalRoadName: "Via Maris (Galilee Lake Branch)",
    mode: "land_walking",
    distanceMiles: 23,
    travelDays: 1.2,
    notes: "Matthew 4:13 & Mark 1: Jesus leaves Nazareth, travels northeast past Cana and the Horns of Hattin pass down to Magdala and Capernaum on the Sea of Galilee.",
    coordinates: [
      [32.7019, 35.2979], // Nazareth
      [32.7300, 35.3200], // Gath-hepher / Reineh
      [32.7480, 35.3380], // Cana
      [32.8020, 35.4500], // Horns of Hattin pass
      [32.8250, 35.5180], // Magdala on Sea of Galilee
      [32.8550, 35.5450], // Plain of Gennesaret (Tabgha)
      [32.8806, 35.5750]  // Capernaum
    ]
  },

  "capernaum_to_bethsaida_lake_road": {
    id: "capernaum_to_bethsaida_lake_road",
    fromName: "Capernaum",
    toName: "Bethsaida",
    historicalRoadName: "Northern Sea of Galilee Shore Road",
    mode: "land_walking",
    distanceMiles: 4.5,
    travelDays: 0.25,
    notes: "Mark 6:45 & John 6: Shoreline road following the northern curvature of the Sea of Galilee across the mouth of the upper Jordan River into Bethsaida Julias.",
    coordinates: [
      [32.8806, 35.5750], // Capernaum
      [32.8720, 35.5900], // Heptapegon (Tabgha springs)
      [32.8950, 35.6180], // Jordan River delta
      [32.9090, 35.6310]  // Bethsaida (et-Tell)
    ]
  },

  "capernaum_to_tiberias_lakeside": {
    id: "capernaum_to_tiberias_lakeside",
    fromName: "Capernaum",
    toName: "Tiberias",
    historicalRoadName: "Galilean Lakeside Roman Road",
    mode: "land_walking",
    distanceMiles: 10,
    travelDays: 0.5,
    notes: "Matthew 9 & John 6:23: Roman lakeside military route connecting Capernaum through Magdala southward to the Herodian tetrarchic capital of Tiberias.",
    coordinates: [
      [32.8806, 35.5750], // Capernaum
      [32.8550, 35.5450], // Tabgha
      [32.8250, 35.5180], // Magdala
      [32.7880, 35.5420]  // Tiberias
    ]
  },

  "capernaum_to_nain_road": {
    id: "capernaum_to_nain_road",
    fromName: "Capernaum",
    toName: "Nain",
    historicalRoadName: "Valley of Jezreel Highway",
    mode: "land_walking",
    distanceMiles: 25,
    travelDays: 1.5,
    notes: "Luke 7:11: 'Soon afterward he went to a town called Nain.' Traversing the plain from Capernaum around the foot of Mount Tabor to the northern slope of the Hill of Moreh.",
    coordinates: [
      [32.8806, 35.5750], // Capernaum
      [32.8250, 35.5180], // Magdala
      [32.7480, 35.3380], // Cana vicinity
      [32.6850, 35.3900], // Mount Tabor base
      [32.6310, 35.3490]  // Nain (Hill of Moreh)
    ]
  },

  "jerusalem_to_antipatris_beth_horon": {
    id: "jerusalem_to_antipatris_beth_horon",
    fromName: "Jerusalem",
    toName: "Antipatris",
    historicalRoadName: "Roman Military Highway (Ascent of Beth-Horon)",
    mode: "land_walking",
    distanceMiles: 38,
    travelDays: 1,
    notes: "Acts 23:31: Night march of the Roman cohort escorting Paul from the Antonia Fortress down the steep Beth-Horon pass to Antipatris.",
    coordinates: [
      [31.7767, 35.2342], // Jerusalem (Fortress Antonia)
      [31.8480, 35.1850], // Gibeon
      [31.8850, 35.1200], // Upper Beth-horon
      [31.9050, 35.0600], // Lower Beth-horon pass
      [32.0000, 34.9800], // Coastal plain entry
      [32.0980, 34.9280]  // Antipatris (Aphek / Ras el-Ain)
    ]
  },

  "antipatris_to_caesarea_via_maris": {
    id: "antipatris_to_caesarea_via_maris",
    fromName: "Antipatris",
    toName: "Caesarea Maritima",
    historicalRoadName: "Via Maris (Sharon Military Trunk)",
    mode: "land_walking",
    distanceMiles: 28,
    travelDays: 1,
    notes: "Acts 23:32: Mounted horsemen riding from Antipatris across the Sharon Plain directly to the Roman provincial governor's palace in Caesarea.",
    coordinates: [
      [32.0980, 34.9280], // Antipatris
      [32.2200, 34.9300], // Sharon Plain
      [32.3500, 34.9200], // Hadera basin
      [32.5020, 34.8910]  // Caesarea Maritima
    ]
  },

  "caesarea_to_joppa_coastal_road": {
    id: "caesarea_to_joppa_coastal_road",
    fromName: "Caesarea Maritima",
    toName: "Joppa",
    historicalRoadName: "Sharon Coastal Roman Highway",
    mode: "land_walking",
    distanceMiles: 34,
    travelDays: 1.5,
    notes: "Acts 10:23-24: Cornelius's centurions and Peter traveling along the sandy Sharon coast between Joppa harbor and the provincial capital at Caesarea.",
    coordinates: [
      [32.5020, 34.8910], // Caesarea Maritima
      [32.3200, 34.8600], // Netanya shoreline
      [32.1950, 34.8080], // Apollonia / Arsuf
      [32.1000, 34.7800], // Yarkon River crossing
      [32.0550, 34.7520]  // Joppa (Simon the Tanner's house)
    ]
  },

  "joppa_to_lydda_roman_road": {
    id: "joppa_to_lydda_roman_road",
    fromName: "Joppa",
    toName: "Lydda",
    historicalRoadName: "Joppa-Jerusalem Roman Highway",
    mode: "land_walking",
    distanceMiles: 12,
    travelDays: 0.5,
    notes: "Acts 9:38: 'Since Lydda was near Joppa, the disciples sent two men to Peter.' Straight paved Roman highway across the fertile plain of Ono.",
    coordinates: [
      [32.0550, 34.7520], // Joppa
      [32.0000, 34.8300], // Ono plain
      [31.9510, 34.8880]  // Lydda (Lod)
    ]
  },

  "lydda_to_jerusalem_ascent": {
    id: "lydda_to_jerusalem_ascent",
    fromName: "Lydda",
    toName: "Jerusalem",
    historicalRoadName: "Ascent of Beth-Horon to Jerusalem",
    mode: "land_walking",
    distanceMiles: 26,
    travelDays: 1.5,
    notes: "Acts 9: Primary Roman ascent from the coastal plain through Lower and Upper Beth-horon to the Judean mountain ridge and Jerusalem.",
    coordinates: [
      [31.9510, 34.8880], // Lydda (Lod)
      [31.9050, 35.0600], // Lower Beth-horon
      [31.8850, 35.1200], // Upper Beth-horon
      [31.8480, 35.1850], // Gibeon
      [31.7767, 35.2342]  // Jerusalem
    ]
  },

  "tyre_to_sidon_highway": {
    id: "tyre_to_sidon_highway",
    fromName: "Tyre",
    toName: "Sidon",
    historicalRoadName: "Phoenician Royal Coastal Highway",
    mode: "land_walking",
    distanceMiles: 22,
    travelDays: 1,
    notes: "Mark 7:24-31 & Acts 27:3: Historic paved Phoenician royal road hugging the Mediterranean coastline through Zarephath (Sarepta).",
    coordinates: [
      [33.2705, 35.2038], // Tyre
      [33.3600, 35.2500], // Litani River mouth
      [33.4470, 35.2950], // Sarepta (Zarephath)
      [33.5630, 35.3720]  // Sidon
    ]
  },

  "sidon_to_antioch_highway": {
    id: "sidon_to_antioch_highway",
    fromName: "Sidon",
    toName: "Antioch (Syria)",
    historicalRoadName: "Syro-Phoenician Imperial Highway",
    mode: "land_walking",
    distanceMiles: 215,
    travelDays: 10,
    notes: "Acts 11:19 & Acts 15:3: Major imperial trunk highway northward along the Levant coast through Berytus (Beirut), Byblos, and Tripoli, ascending the Orontes valley into Syrian Antioch.",
    coordinates: [
      [33.5630, 35.3720], // Sidon
      [33.8938, 35.5018], // Berytus (Beirut)
      [34.1230, 35.6510], // Byblos
      [34.4367, 35.8497], // Tripoli
      [35.1000, 35.9500], // Tartus
      [35.5317, 35.7917], // Laodicea ad Mare (Latakia)
      [36.0500, 36.0500], // Orontes River gap
      [36.2021, 36.1606]  // Antioch on the Orontes
    ]
  },

  "bethany_to_jerusalem_road": {
    id: "bethany_to_jerusalem_road",
    fromName: "Bethany",
    toName: "Jerusalem",
    historicalRoadName: "Mount of Olives Pilgrim Way",
    mode: "land_walking",
    distanceMiles: 2,
    travelDays: 0.1,
    notes: "Matthew 21:1, Mark 11:1, Luke 19:29, John 12:12: The Palm Sunday Triumphal Entry path over the crest of the Mount of Olives past Bethphage and down through Gethsemane into Jerusalem.",
    coordinates: [
      [31.7700, 35.2600], // Bethany (Lazarus's home)
      [31.7780, 35.2500], // Bethphage
      [31.7790, 35.2440], // Mount of Olives summit
      [31.7800, 35.2390], // Gethsemane
      [31.7790, 35.2370], // Kidron Valley
      [31.7767, 35.2342]  // Jerusalem (Golden Gate / Lions' Gate)
    ]
  },

  "nazareth_to_bethlehem_hill_country": {
    id: "nazareth_to_bethlehem_hill_country",
    fromName: "Nazareth",
    toName: "Bethlehem",
    historicalRoadName: "The Way of the Patriarchs (Central Hill Country)",
    mode: "land_walking",
    distanceMiles: 80,
    travelDays: 4,
    notes: "Luke 2:4: Joseph and Mary's journey for the Roman census from Nazareth in Galilee south through Samaria along the ancient watershed ridge road to Bethlehem of Judea.",
    coordinates: [
      [32.7019, 35.2979], // Nazareth
      [32.5600, 35.3200], // Plain of Esdraelon
      [32.4200, 35.2400], // Dothan pass
      [32.2760, 35.1950], // Samaria
      [32.2133, 35.2819], // Shechem (Jacob's Well)
      [32.0550, 35.2890], // Shiloh
      [31.9300, 35.2200], // Bethel
      [31.7767, 35.2342], // Jerusalem
      [31.7054, 35.2024]  // Bethlehem
    ]
  },

  "bethlehem_to_egypt_caravan_route": {
    id: "bethlehem_to_egypt_caravan_route",
    fromName: "Bethlehem",
    toName: "Egypt",
    historicalRoadName: "The Way of Shur / Coastal Road to Egypt",
    mode: "desert_caravan",
    distanceMiles: 195,
    travelDays: 10,
    notes: "Matthew 2:14: 'He rose and took the child and his mother by night and departed to Egypt.' Ancient caravan route past Hebron and Beersheba through Gaza and Pelusium to the Nile Delta.",
    coordinates: [
      [31.7054, 35.2024], // Bethlehem
      [31.5290, 35.0930], // Hebron
      [31.2450, 34.7900], // Beersheba
      [31.5040, 34.4644], // Gaza
      [31.2850, 34.2500], // Raphia
      [31.1300, 33.8000], // Rhinocolura (El-Arish)
      [31.0500, 32.5500], // Pelusium (Fortress frontier of Egypt)
      [30.5000, 31.8000]  // Goshen / Nile Delta
    ]
  },
  "patmos_to_ephesus_sea": {
    id: "patmos_to_ephesus_sea",
    fromName: "Island of Patmos",
    toName: "Ephesus",
    historicalRoadName: "Icarian Sea Crossing to Ephesus",
    mode: "sea_sailing",
    distanceMiles: 58,
    travelDays: 1.5,
    notes: "Revelation 1:9-11: John was on the island of Patmos when commanded to send the apocalypse to the seven churches of Asia, entering via Ephesus port.",
    coordinates: [
      [37.3250, 26.5417], // Patmos
      [37.4500, 26.8500], // Fourni Islands passage
      [37.7000, 27.0000], // Samos Strait
      [37.9391, 27.3407]  // Ephesus (Panormus Port)
    ]
  },
  "ephesus_to_smyrna_roman_road": {
    id: "ephesus_to_smyrna_roman_road",
    fromName: "Ephesus",
    toName: "Smyrna",
    historicalRoadName: "Ionian Coastal Roman Highway",
    mode: "land_walking",
    distanceMiles: 42,
    travelDays: 2.1,
    notes: "Revelation 2:1-8: Primary Roman paved postal trunk along the Cayster and Hermus valleys linking Ephesus with Smyrna (modern Izmir).",
    coordinates: [
      [37.9391, 27.3407], // Ephesus
      [38.0800, 27.3500], // Metropolis (Torbali)
      [38.2500, 27.2200], // Trianda pass
      [38.4189, 27.1378]  // Smyrna (Izmir)
    ]
  },
  "smyrna_to_pergamum_highway": {
    id: "smyrna_to_pergamum_highway",
    fromName: "Smyrna",
    toName: "Pergamum",
    historicalRoadName: "Aeolian Coastal Highway to Pergamum",
    mode: "land_walking",
    distanceMiles: 65,
    travelDays: 3.2,
    notes: "Revelation 2:8-12: Major Roman trunk road north through the Hermus plain, crossing the Caicus river valley to the imperial acropolis at Pergamum.",
    coordinates: [
      [38.4189, 27.1378], // Smyrna
      [38.6000, 27.0600], // Menemen (Hermus River)
      [38.7800, 27.0200], // Myrina
      [38.9300, 27.0500], // Elaea (Port of Pergamum)
      [39.1322, 27.1842]  // Pergamum Acropolis
    ]
  },
  "pergamum_to_thyatira_highway": {
    id: "pergamum_to_thyatira_highway",
    fromName: "Pergamum",
    toName: "Thyatira",
    historicalRoadName: "Caicus-Hyrcanian Inland Roman Highway",
    mode: "land_walking",
    distanceMiles: 48,
    travelDays: 2.4,
    notes: "Revelation 2:12-18: Ancient road connecting Pergamum through the Bakirçay Valley past Kinik and Soma to the trade center of Thyatira.",
    coordinates: [
      [39.1322, 27.1842], // Pergamum
      [39.0800, 27.3800], // Kinik
      [39.1800, 27.6000], // Soma pass
      [38.9202, 27.8365]  // Thyatira (Akhisar)
    ]
  },
  "thyatira_to_sardis_highway": {
    id: "thyatira_to_sardis_highway",
    fromName: "Thyatira",
    toName: "Sardis",
    historicalRoadName: "Lydian Plain Post Highway",
    mode: "land_walking",
    distanceMiles: 38,
    travelDays: 1.9,
    notes: "Revelation 2:18-3:1: Roman postal road crossing the northern Lydian hills past the Gygean Lake (Marmara Gölü) to the ancient Lydian capital of Sardis.",
    coordinates: [
      [38.9202, 27.8365], // Thyatira
      [38.7400, 27.9500], // Gygean Lake shore
      [38.6000, 28.0200], // Hermus River crossing
      [38.4883, 28.0403]  // Sardis
    ]
  },
  "sardis_to_philadelphia_highway": {
    id: "sardis_to_philadelphia_highway",
    fromName: "Sardis",
    toName: "Philadelphia",
    historicalRoadName: "Cogamus Valley Imperial Highway",
    mode: "land_walking",
    distanceMiles: 30,
    travelDays: 1.5,
    notes: "Revelation 3:1-7: Roman highway southeast through the fertile volcanic Cogamus River valley to Philadelphia (Alasehir), 'Gateway to the East'.",
    coordinates: [
      [38.4883, 28.0403], // Sardis
      [38.4200, 28.2200], // Salihli
      [38.3700, 28.3800], // Cogamus basin
      [38.3500, 28.5167]  // Philadelphia
    ]
  },
  "philadelphia_to_laodicea_highway": {
    id: "philadelphia_to_laodicea_highway",
    fromName: "Philadelphia",
    toName: "Laodicea",
    historicalRoadName: "Maeander-Lycus Valley Highway",
    mode: "land_walking",
    distanceMiles: 46,
    travelDays: 2.3,
    notes: "Revelation 3:7-14: Imperial road connecting the Cogamus to the upper Maeander valley and into the Lycus tri-city area (Hierapolis, Colossae, Laodicea).",
    coordinates: [
      [38.3500, 28.5167], // Philadelphia
      [38.1500, 28.7500], // Tripolis ad Maeandrum
      [37.9200, 29.0800], // Hierapolis (Pamukkale springs)
      [37.8358, 29.1075]  // Laodicea on the Lycus
    ]
  },
  "moab_to_bethlehem_dead_sea_route": {
    id: "moab_to_bethlehem_dead_sea_route",
    fromName: "Highlands of Moab",
    toName: "Bethlehem",
    historicalRoadName: "Transjordan Highway & Ascent of Ziz",
    mode: "desert_caravan",
    distanceMiles: 48,
    travelDays: 3.2,
    notes: "Ruth 1:19: Naomi and Ruth's journey from the plateau of Moab across the Jordan valley/Dead Sea northern basin and up the Judean hills to Bethlehem.",
    coordinates: [
      [31.1806, 35.7014], // Moab Plateau (Kir-Hareseth / Kerak)
      [31.4500, 35.7500], // Arnon Gorge crossing
      [31.7500, 35.7200], // Plains of Moab (Nebo / Medeba)
      [31.7614, 35.5583], // Jordan River Ford (Bethabara)
      [31.7800, 35.3800], // Ascent of Adummim
      [31.7043, 35.2076]  // Bethlehem
    ]
  },
  "shittim_to_jordan_crossing_jericho": {
    id: "shittim_to_jordan_crossing_jericho",
    fromName: "Abel-shittim",
    toName: "Jericho",
    historicalRoadName: "Conquest Crossing of the Jordan",
    mode: "land_walking",
    distanceMiles: 16,
    travelDays: 1.0,
    notes: "Joshua 3:1: Israel sets out from Shittim, crosses the miraculously dried Jordan opposite Adam, and encamps at Gilgal before taking Jericho.",
    coordinates: [
      [31.8402, 35.6737], // Shittim (Tell el-Hammam)
      [31.8200, 35.6000], // Jordan eastern terrace
      [31.7614, 35.5583], // Jordan River ford / Adam cutoff
      [31.8700, 35.4800], // Gilgal
      [31.8717, 35.4446]  // Jericho (Tell es-Sultan)
    ]
  },
  "bethlehem_to_valley_of_elah": {
    id: "bethlehem_to_valley_of_elah",
    fromName: "Bethlehem",
    toName: "Valley of Elah",
    historicalRoadName: "Judean Hill Descent to the Shephelah",
    mode: "land_walking",
    distanceMiles: 18,
    travelDays: 1.0,
    notes: "1 Samuel 17:17-20: David travels from his father's flocks in Bethlehem down the western Judean descent into the Valley of Elah between Socoh and Azekah.",
    coordinates: [
      [31.7043, 35.2076], // Bethlehem
      [31.7100, 35.1200], // Husan / Wadi Fukin ridge
      [31.6900, 35.0500], // Ephes-dammim
      [31.6822, 34.9749], // Socoh
      [31.6754, 34.9980]  // Valley of Elah brook
    ]
  },
  "hebron_to_jerusalem_ridge_road": {
    id: "hebron_to_jerusalem_ridge_road",
    fromName: "Hebron",
    toName: "Jerusalem",
    historicalRoadName: "Way of the Patriarchs (Southern Ridge)",
    mode: "land_walking",
    distanceMiles: 21,
    travelDays: 1.2,
    notes: "2 Samuel 5:3-6: David anointed king over all Israel at Hebron, then marches his army north along the mountain watershed to take the Jebusite stronghold of Zion.",
    coordinates: [
      [31.5251, 35.1022], // Hebron
      [31.5850, 35.1100], // Halhul
      [31.6350, 35.1350], // Beth-zur
      [31.7043, 35.2076], // Bethlehem
      [31.7736, 35.2356]  // Jerusalem (City of David / Zion)
    ]
  },
  "gilgal_to_bethel_jericho_jordan": {
    id: "gilgal_to_bethel_jericho_jordan",
    fromName: "Gilgal",
    toName: "Jordan River",
    historicalRoadName: "Elijah's Prophetic Circuit",
    mode: "land_walking",
    distanceMiles: 28,
    travelDays: 1.5,
    notes: "2 Kings 2:1-7: Elijah and Elisha journey from Gilgal to Bethel, down to Jericho, and across the parted Jordan River where Elijah is taken up in a whirlwind.",
    coordinates: [
      [31.9800, 35.2500], // Gilgal (Jiljiliya in Ephraim)
      [31.9300, 35.2200], // Bethel
      [31.8700, 35.3500], // Descent to Jericho oasis
      [31.8717, 35.4446], // Jericho
      [31.7614, 35.5583]  // Jordan River ford
    ]
  },
  "babylon_to_jerusalem_exile_return": {
    id: "babylon_to_jerusalem_exile_return",
    fromName: "Babylon",
    toName: "Jerusalem",
    historicalRoadName: "Return from Babylonian Exile Caravan Route",
    mode: "desert_caravan",
    distanceMiles: 920,
    travelDays: 115,
    notes: "Ezra 7:9: 'On the first day of the first month he began to go up from Babylonia, and on the first day of the fifth month he came to Jerusalem' (four full months).",
    coordinates: [
      [32.5433, 44.4222], // Babylon
      [33.3152, 44.3661], // Baghdad / Tigris corridor
      [34.3500, 42.1000], // Hit on the Euphrates
      [35.0000, 40.4000], // Mari / Dura-Europos
      [35.3000, 39.0000], // Deir ez-Zor
      [34.5600, 38.2700], // Tadmor (Palmyra oasis)
      [33.5138, 36.2765], // Damascus
      [32.9500, 35.7000], // Golan / Sea of Galilee entry
      [32.2200, 35.2600], // Shechem
      [31.7767, 35.2342]  // Jerusalem
    ]
  },
  "susa_to_jerusalem_royal_road": {
    id: "susa_to_jerusalem_royal_road",
    fromName: "Susa (Shushan the Citadel)",
    toName: "Jerusalem",
    historicalRoadName: "Persian Imperial Royal Road to Jerusalem",
    mode: "desert_caravan",
    distanceMiles: 1120,
    travelDays: 95,
    notes: "Nehemiah 2:1-9: Nehemiah departs Susa with letters and military escorts from King Artaxerxes I, crossing the Euphrates Province ('Beyond the River') to rebuild Jerusalem's walls.",
    coordinates: [
      [32.1900, 48.2400], // Susa (Palace of Darius / Artaxerxes)
      [32.5000, 46.5000], // Zagros foothill imperial route
      [33.0900, 44.5800], // Ctesiphon / Tigris crossing
      [33.3152, 44.3661], // Babylon / Northern Babylonia
      [34.5600, 38.2700], // Palmyra (Tadmor)
      [33.5138, 36.2765], // Damascus
      [32.2200, 35.2600], // Samaria / Shechem
      [31.7767, 35.2342]  // Jerusalem
    ]
  },
  "corinth_to_ephesus_aegean_crossing": {
    id: "corinth_to_ephesus_aegean_crossing",
    fromName: "Corinth",
    toName: "Ephesus",
    historicalRoadName: "Saronic & Aegean Merchant Sea Track",
    mode: "sea_sailing",
    distanceMiles: 260,
    travelDays: 5.5,
    notes: "Acts 18:18-19, Acts 19:1: Paul sails from Cenchreae (Corinth's eastern port) across the Aegean Sea via the Cyclades directly to Ephesus.",
    coordinates: [
      [37.9058, 22.8787], // Corinth
      [37.8860, 22.9900], // Cenchreae harbor
      [37.7500, 23.5000], // Saronic Gulf
      [37.6000, 24.3000], // Kea Strait
      [37.5000, 25.1000], // Mykonos / Delos corridor
      [37.7000, 26.5000], // Ikaria channel
      [37.9391, 27.3407]  // Ephesus
    ]
  },
  "jerusalem_to_jordan_baptism_site": {
    id: "jerusalem_to_jordan_baptism_site",
    fromName: "Jerusalem",
    toName: "Jordan River (Bethany Beyond Jordan)",
    historicalRoadName: "Descent of Adummim to Jordan Fords",
    mode: "land_walking",
    distanceMiles: 22,
    travelDays: 1.2,
    notes: "Matthew 3:5-6, Mark 1:5, John 1:28: 'Jerusalem and all Judea and all the region about the Jordan were going out to him and they were baptized by him in the river Jordan.'",
    coordinates: [
      [31.7767, 35.2342], // Jerusalem
      [31.7750, 35.2600], // Bethany
      [31.8150, 35.3600], // Ascent of Adummim (Inn of the Good Samaritan)
      [31.8500, 35.4400], // Wadi Qelt exit at Jericho
      [31.8380, 35.5480]  // Al-Maghtas (Bethany beyond the Jordan)
    ]
  },
  "ramah_to_shiloh_ridge_road": {
    id: "ramah_to_shiloh_ridge_road",
    fromName: "Ramah",
    toName: "Shiloh",
    historicalRoadName: "Way of the Tabernacle (Central Ridge Road)",
    mode: "land_walking",
    distanceMiles: 17,
    travelDays: 1.0,
    notes: "1 Samuel 1:3, 19: Elkanah and Hannah's annual pilgrimage from Ramathaim-zophim along the Benjamin ridge road past Bethel to the sanctuary of the Ark at Shiloh.",
    coordinates: [
      [31.8543, 35.2316], // Ramah
      [31.8900, 35.2200], // Mizpah / Beeroth
      [31.9300, 35.2200], // Bethel
      [32.0000, 35.2500], // Lebonah ascent
      [32.0557, 35.2895]  // Shiloh
    ]
  },
  "ark_journey_shiloh_to_philistia": {
    id: "ark_journey_shiloh_to_philistia",
    fromName: "Shiloh",
    toName: "Ekron",
    historicalRoadName: "Captivity Route of the Ark of the Covenant",
    mode: "land_walking",
    distanceMiles: 48,
    travelDays: 2.8,
    notes: "1 Samuel 4:1-5:10: The Ark carried from Shiloh to battle at Ebenezer/Aphek, captured by the Philistines, and moved between Ashdod, Gath, and Ekron.",
    coordinates: [
      [32.0557, 35.2895], // Shiloh
      [32.1050, 34.9304], // Ebenezer / Aphek
      [31.7572, 34.6578], // Ashdod (Temple of Dagon)
      [31.6997, 34.8469], // Gath
      [31.7775, 34.8519]  // Ekron
    ]
  },
  "ark_return_ekron_to_kiriath_jearim": {
    id: "ark_return_ekron_to_kiriath_jearim",
    fromName: "Ekron",
    toName: "Kiriath-jearim",
    historicalRoadName: "Sorek Valley Route of the Ark",
    mode: "land_walking",
    distanceMiles: 20,
    travelDays: 1.2,
    notes: "1 Samuel 6:10-7:1: The Philistines return the Ark on a cart pulled by oxen up the Sorek Valley to Beth-shemesh, then escorted to the house of Abinadab at Kiriath-jearim.",
    coordinates: [
      [31.7775, 34.8519], // Ekron
      [31.7650, 34.9000], // Timnah in Sorek Valley
      [31.7506, 34.9747], // Beth-shemesh
      [31.7800, 35.0300], // Eshtaol / Zorah pass
      [31.8090, 35.1038]  // Kiriath-jearim (Hill of the Ark)
    ]
  },
  "joshua_battle_of_gibeon_beth_horon": {
    id: "joshua_battle_of_gibeon_beth_horon",
    fromName: "Gilgal",
    toName: "Makkedah",
    historicalRoadName: "Ascent of Beth-Horon & Aijalon Valley Warpath",
    mode: "land_walking",
    distanceMiles: 34,
    travelDays: 1.8,
    notes: "Joshua 10:9-14: Joshua's night march from Gilgal to rescue Gibeon, pursuing the Amorite kings down the Ascent of Beth-Horon where the sun stood still over Aijalon.",
    coordinates: [
      [31.8700, 35.4800], // Gilgal
      [31.8475, 35.1834], // Gibeon
      [31.8950, 35.0836], // Upper & Lower Beth-horon
      [31.8600, 35.0000], // Valley of Aijalon
      [31.7002, 34.9357], // Azekah
      [31.6500, 34.9000]  // Makkedah cave
    ]
  },
  "deborah_barak_tabor_kishon_battle": {
    id: "deborah_barak_tabor_kishon_battle",
    fromName: "Mount Tabor",
    toName: "Harosheth-hagoyim",
    historicalRoadName: "Kishon Valley Battle Corridor",
    mode: "land_walking",
    distanceMiles: 21,
    travelDays: 1.1,
    notes: "Judges 4:12-16, 5:21: Barak leads 10,000 warriors down Mount Tabor to route Sisera's 900 iron chariots along the torrent of Kishon to Harosheth-hagoyim.",
    coordinates: [
      [32.6863, 35.3929], // Mount Tabor
      [32.6500, 35.3000], // Plain of Esdraelon / En-dor
      [32.6000, 35.2000], // Megiddo / Taanach waters
      [32.7000, 35.1300], // Torrent of Kishon
      [32.7200, 35.1000]  // Harosheth-hagoyim (Tell el-Harbaj)
    ]
  },
  "gideon_harod_to_jordan_pursuit": {
    id: "gideon_harod_to_jordan_pursuit",
    fromName: "Spring of Harod",
    toName: "Jordan River (Beth-barah)",
    historicalRoadName: "Jezreel-Jordan Valley Warpath",
    mode: "land_walking",
    distanceMiles: 24,
    travelDays: 1.3,
    notes: "Judges 7:1, 22-24: Gideon's 300 men blow trumpets at the Spring of Harod and pursue the fleeing Midianite hordes past Beth-shittah down to the Jordan fords.",
    coordinates: [
      [32.5486, 35.3558], // Spring of Harod (Mount Gilboa)
      [32.5200, 35.4300], // Beth-shittah
      [32.5000, 35.5000], // Beth-shean / Scythopolis
      [32.4000, 35.5300], // Abel-meholah
      [32.3500, 35.5500]  // Fords of Beth-barah at the Jordan
    ]
  },
  "david_flight_nob_to_adullam_engedi": {
    id: "david_flight_nob_to_adullam_engedi",
    fromName: "Nob",
    toName: "En-gedi",
    historicalRoadName: "Judean Wilderness Strongholds Trail",
    mode: "land_walking",
    distanceMiles: 52,
    travelDays: 3.2,
    notes: "1 Samuel 21-24: David flees Saul from Nob past Gath to the Cave of Adullam, relieves Keilah, hides in the Wilderness of Ziph, and shelters in the crags of En-gedi.",
    coordinates: [
      [31.7850, 35.2450], // Nob (Priestly city on Mount Scopus)
      [31.6997, 34.8469], // Gath
      [31.6517, 35.0017], // Cave of Adullam
      [31.6137, 35.0036], // Keilah
      [31.4800, 35.1500], // Wilderness of Ziph / Hachilah
      [31.4500, 35.3833]  // En-gedi (Wild Goats Rocks)
    ]
  },
  "kings_highway_transjordan_complete": {
    id: "kings_highway_transjordan_complete",
    fromName: "Kadesh-barnea",
    toName: "Plains of Moab",
    historicalRoadName: "The King's Highway (Derekh HaMelekh)",
    mode: "desert_caravan",
    distanceMiles: 165,
    travelDays: 11.0,
    notes: "Numbers 20:17, 21:21-24: 'Please let us pass through your land. We will go along the King's Highway.' Ancient arterial highway through Edom, Moab, and Amorite Heshbon to the Jordan.",
    coordinates: [
      [30.6483, 34.4222], // Kadesh-barnea
      [30.8321, 35.0569], // Mount Hor (Aaron's Tomb / Petra)
      [31.0000, 35.6000], // Bozrah (Edom)
      [31.0500, 35.7000], // Brook Zered
      [31.1806, 35.7014], // Kir-Hareseth (Moab)
      [31.4500, 35.7500], // Arnon Gorge
      [31.5000, 35.7800], // Dibon
      [31.7200, 35.8000], // Medeba
      [31.8008, 35.8091], // Heshbon
      [31.8402, 35.6737]  // Plains of Moab opposite Jericho
    ]
  },
  "elijah_cherith_to_zarephath": {
    id: "elijah_cherith_to_zarephath",
    fromName: "Brook Cherith",
    toName: "Zarephath",
    historicalRoadName: "Elijah's Drought Journey to Phoenicia",
    mode: "land_walking",
    distanceMiles: 125,
    travelDays: 6.8,
    notes: "1 Kings 17:3-10: Elijah hides by the Brook Cherith, then is commanded to walk through Galilee to Zarephath in Sidon where the widow's jar of oil does not fail.",
    coordinates: [
      [31.8500, 35.4500], // Brook Cherith (Wadi Qelt)
      [32.1000, 35.5000], // Jordan Valley northward
      [32.5000, 35.5000], // Beth-shean
      [32.6500, 35.3000], // Jezreel Plain
      [32.8000, 35.1000], // Ptolemais (Acco)
      [33.2708, 35.1961], // Tyre
      [33.4642, 35.2951]  // Zarephath (Sarepta)
    ]
  },
  "carmel_to_jezreel_chariot_race": {
    id: "carmel_to_jezreel_chariot_race",
    fromName: "Mount Carmel",
    toName: "Jezreel",
    historicalRoadName: "Jezreel Valley Chariot Highway",
    mode: "land_walking",
    distanceMiles: 22,
    travelDays: 1.1,
    notes: "1 Kings 18:44-46: Following the fire from heaven on Mount Carmel, Ahab rides his chariot before the heavy rain, and the hand of the Lord is on Elijah as he runs before Ahab to the entrance of Jezreel.",
    coordinates: [
      [32.6725, 35.0233], // Mount Carmel (Muhraqa)
      [32.6800, 35.1000], // Kishon River bank
      [32.6200, 35.2000], // Plain of Megiddo
      [32.5579, 35.3280]  // Royal Palace of Jezreel
    ]
  },
  "damascus_to_samaria_jordan_route": {
    id: "damascus_to_samaria_jordan_route",
    fromName: "Damascus",
    toName: "Samaria",
    historicalRoadName: "Aram-Israel Highway via Beth-Shean",
    mode: "land_walking",
    distanceMiles: 110,
    travelDays: 5.8,
    notes: "2 Kings 5:1-14: Naaman the Syrian commander travels with chariots from Damascus to Samaria and down to the Jordan River where he dips seven times to be healed of leprosy.",
    coordinates: [
      [33.5138, 36.2765], // Damascus
      [33.2000, 36.0000], // Golan Heights trunk road
      [32.8500, 35.6500], // Hippos / Sea of Galilee southern exit
      [32.5000, 35.5000], // Beth-shean gateway
      [32.3500, 35.3000], // Dothan Valley
      [32.2770, 35.1900], // Samaria (Capital of Israel)
      [32.2000, 35.5000]  // Jordan River
    ]
  },
  "jerusalem_to_riblah_babylonian_captivity": {
    id: "jerusalem_to_riblah_babylonian_captivity",
    fromName: "Jerusalem",
    toName: "Riblah",
    historicalRoadName: "Babylonian Captivity March",
    mode: "desert_caravan",
    distanceMiles: 235,
    travelDays: 15.5,
    notes: "2 Kings 25:4-7, Jeremiah 39:4-7: King Zedekiah flees by the King's Garden toward the Arabah, is captured in the plains of Jericho, and led to Nebuchadnezzar at Riblah in Hamath.",
    coordinates: [
      [31.7767, 35.2342], // Jerusalem
      [31.8717, 35.4446], // Plains of Jericho
      [32.4000, 35.5200], // Jordan Rift Valley
      [32.8000, 35.6000], // Sea of Galilee
      [33.5138, 36.2765], // Damascus
      [34.1000, 36.4000], // Beqaa Valley / Baalbek
      [34.4595, 36.5726]  // Riblah on the Orontes
    ]
  },
  "jerusalem_to_samaria_ridge_road": {
    id: "jerusalem_to_samaria_ridge_road",
    fromName: "Jerusalem",
    toName: "Samaria",
    historicalRoadName: "Way of the Patriarchs (Northern Ridge)",
    mode: "land_walking",
    distanceMiles: 42,
    travelDays: 2.2,
    notes: "Central mountain ridge route linking the capital of Judah with the capital of the Northern Kingdom through Bethel, Shiloh, and Shechem.",
    coordinates: [
      [31.7767, 35.2342], // Jerusalem
      [31.8543, 35.2316], // Ramah
      [31.9300, 35.2200], // Bethel
      [32.0557, 35.2895], // Shiloh
      [32.2200, 35.2600], // Shechem (Mount Gerizim / Ebal)
      [32.2770, 35.1900]  // Samaria (Sebaste)
    ]
  },
  "dan_to_beersheba_national_highway": {
    id: "dan_to_beersheba_national_highway",
    fromName: "Dan",
    toName: "Beersheba",
    historicalRoadName: "The National Spine: From Dan to Beersheba",
    mode: "land_walking",
    distanceMiles: 145,
    travelDays: 7.5,
    notes: "Judges 20:1, 1 Samuel 3:20, 2 Samuel 3:10: The definitive biblical boundary of Israel from the northern headwaters at Tel Dan down the central ridge to Beersheba.",
    coordinates: [
      [33.2486, 35.6522], // Tel Dan
      [33.0000, 35.5700], // Hazor
      [32.8000, 35.5300], // Sea of Galilee
      [32.6000, 35.3000], // Valley of Jezreel
      [32.2200, 35.2600], // Shechem
      [31.9300, 35.2200], // Bethel
      [31.7767, 35.2342], // Jerusalem
      [31.7043, 35.2076], // Bethlehem
      [31.5251, 35.1022], // Hebron
      [31.2450, 34.7900]  // Beersheba
    ]
  },
  "via_dolorosa_calvary_route": {
    id: "via_dolorosa_calvary_route",
    fromName: "Praetorium (Antonia Fortress)",
    toName: "Golgotha (Calvary)",
    historicalRoadName: "Via Dolorosa (The Way of the Cross)",
    mode: "land_walking",
    distanceMiles: 0.6,
    travelDays: 0.1,
    notes: "Matthew 27:31-33, Mark 15:20-22, Luke 23:26-33, John 19:16-18: The path from Pilate's judgment seat outside the city walls to the place of the skull.",
    coordinates: [
      [31.7797, 35.2345], // Antonia Fortress / Praetorium
      [31.7792, 35.2325], // Ecce Homo arch
      [31.7790, 35.2305], // Tyropoeon Valley crossing
      [31.7785, 35.2297]  // Golgotha / Church of the Holy Sepulchre
    ]
  },
  "laodicea_to_hierapolis_road": {
    id: "laodicea_to_hierapolis_road",
    fromName: "Laodicea",
    toName: "Hierapolis",
    historicalRoadName: "Lycus Valley Roman Road",
    mode: "land_walking",
    distanceMiles: 7,
    travelDays: 0.4,
    notes: "Colossians 4:13: Paul commends Epaphras for his deep concern for those in Laodicea and Hierapolis across the Lycus river basin.",
    coordinates: [
      [37.8358, 29.1075], // Laodicea on the Lycus
      [37.8800, 29.1150], // Lycus River ford
      [37.9250, 29.1200]  // Hierapolis (thermal travertine terraces)
    ]
  },
  "zorah_to_eshtaol_sorek_route": {
    id: "zorah_to_eshtaol_sorek_route",
    fromName: "Zorah",
    toName: "Eshtaol",
    historicalRoadName: "Danite Homeland Highway (Valley of Sorek)",
    mode: "land_walking",
    distanceMiles: 3,
    travelDays: 0.2,
    notes: "Judges 13:25, 16:31: 'The Spirit of the Lord began to stir him in Mahaneh-dan, between Zorah and Eshtaol.'",
    coordinates: [
      [31.7800, 34.9900], // Zorah (Birthplace of Samson)
      [31.7800, 35.0000], // Camp of Dan (Mahaneh-dan)
      [31.7800, 35.0100]  // Eshtaol
    ]
  },
  "ammon_to_moab_highway": {
    id: "ammon_to_moab_highway",
    fromName: "Rabbah of Ammon",
    toName: "Kir of Moab",
    historicalRoadName: "Transjordan Royal Highway",
    mode: "desert_caravan",
    distanceMiles: 75,
    travelDays: 4.5,
    notes: "Ancient King's Highway trunk linking the Ammonite capital at Rabbah (Amman) southward across the plateau through Medeba and the Arnon Gorge to Moab.",
    coordinates: [
      [31.9500, 35.9300], // Rabbah of Ammon
      [31.8008, 35.8091], // Heshbon
      [31.7200, 35.8000], // Medeba
      [31.5000, 35.7800], // Dibon
      [31.4500, 35.7500], // Arnon Gorge
      [31.1806, 35.7014]  // Kir-Hareseth (Moab)
    ]
  }
,

  "antioch_to_derbe_cilician_gates": {
    id: "antioch_to_derbe_cilician_gates",
    fromName: "Antioch (Syria)",
    toName: "Derbe",
    historicalRoadName: "Via Tauri (Cilician Gates Roman Highway)",
    mode: "land_walking",
    distanceMiles: 235,
    travelDays: 12,
    notes: "Acts 15:41–16:1: Paul and Silas traveling from Syrian Antioch northwest through Cilicia and the historic Cilician Gates mountain pass to Derbe.",
    coordinates: [
      [36.2021, 36.1606], // Antioch (Syria)
      [36.5872, 36.1735], // Alexandretta / Belen Pass (Syrian Gates)
      [36.9167, 35.3167], // Adana (Cilician Plain)
      [36.9167, 34.8953], // Tarsus
      [37.2889, 34.7944], // Cilician Gates (Gülek Boğazı)
      [37.4000, 33.7000], // Eregli (Heraclea Cybistra)
      [37.3481, 33.3592]  // Derbe (Kerti Hüyük)
    ]
  },

  "ephesus_to_troas_coastal_highway": {
    id: "ephesus_to_troas_coastal_highway",
    fromName: "Ephesus",
    toName: "Troas",
    historicalRoadName: "Roman Asia Coastal Highway",
    mode: "land_walking",
    distanceMiles: 165,
    travelDays: 8.5,
    notes: "Acts 20:1–6: Paul departing Ephesus northward along the Aegean coast through Smyrna and Pergamum to Troas and Macedonia.",
    coordinates: [
      [37.9497, 27.3639], // Ephesus
      [38.4192, 27.1287], // Smyrna
      [39.1233, 27.1842], // Pergamum
      [39.5833, 26.6833], // Adramyttium
      [39.7558, 26.1625]  // Alexandria Troas
    ]
  },

  "etham_to_pihahiroth_red_sea": {
    id: "etham_to_pihahiroth_red_sea",
    fromName: "Etham",
    toName: "Pi-hahiroth",
    historicalRoadName: "Way of the Red Sea Wilderness",
    mode: "land_walking",
    distanceMiles: 26,
    travelDays: 1.5,
    notes: "Exodus 14:1–2: Turning back from the edge of the wilderness at Etham to camp before Pi-hahiroth between Migdol and the sea.",
    coordinates: [
      [30.3000, 32.3000], // Etham
      [30.1200, 32.4200], // Great Bitter Lake basin
      [29.9667, 32.5500]  // Pi-hahiroth (Suez shore)
    ]
  },

  "egypt_to_bethel_via_maris": {
    id: "egypt_to_bethel_via_maris",
    fromName: "Egypt",
    toName: "Bethel",
    historicalRoadName: "Way of the South (Negev Ascent)",
    mode: "land_walking",
    distanceMiles: 195,
    travelDays: 10,
    notes: "Genesis 13:1–3: Abram journeying up out of Egypt into the Negev, returning by stages to the altar between Bethel and Ai.",
    coordinates: [
      [30.7870, 31.8210], // Nile Delta (Egypt)
      [31.1300, 33.8000], // Wadi el-Arish (Brook of Egypt)
      [31.2447, 34.8410], // Beersheba
      [31.5290, 35.1030], // Hebron
      [31.7767, 35.2345], // Jerusalem ridge
      [31.9300, 35.2200]  // Bethel & Ai altar
    ]
  },

  "jerusalem_to_sychar_ridge_road": {
    id: "jerusalem_to_sychar_ridge_road",
    fromName: "Jerusalem",
    toName: "Sychar",
    historicalRoadName: "Way of the Patriarchs (Samaria Highway)",
    mode: "land_walking",
    distanceMiles: 34,
    travelDays: 1.8,
    notes: "John 4:3–5: Jesus leaving Judea and passing through Samaria to the city of Sychar near Jacob's Well.",
    coordinates: [
      [31.7767, 35.2345], // Jerusalem
      [31.9300, 35.2200], // Bethel
      [32.0500, 35.2600], // Shiloh
      [32.2094, 35.2839]  // Sychar (Jacob's Well)
    ]
  },

  "jerusalem_to_sea_of_galilee": {
    id: "jerusalem_to_sea_of_galilee",
    fromName: "Jerusalem",
    toName: "Sea of Galilee",
    historicalRoadName: "Jordan Valley & Central Ridge Route",
    mode: "land_walking",
    distanceMiles: 82,
    travelDays: 4,
    notes: "John 6:1: Jesus departed from Jerusalem to the other side of the Sea of Galilee, which is the Sea of Tiberias.",
    coordinates: [
      [31.7767, 35.2345], // Jerusalem
      [31.9300, 35.2200], // Bethel
      [32.2133, 35.2819], // Shechem
      [32.5000, 35.3000], // En-gannim (Jenin)
      [32.7000, 35.5000], // Jordan outlet
      [32.7940, 35.5310]  // Tiberias (Sea of Galilee)
    ]
  },

  "mount_hor_to_arnon_kings_highway": {
    id: "mount_hor_to_arnon_kings_highway",
    fromName: "Mount Hor",
    toName: "Valley of the Arnon",
    historicalRoadName: "King's Highway (Edom Bypass)",
    mode: "land_walking",
    distanceMiles: 85,
    travelDays: 4.5,
    notes: "Numbers 21:4–13: Israel setting out from Mount Hor by way of the Red Sea to compass Edom, arriving at the Arnon Gorge.",
    coordinates: [
      [30.3167, 35.4000], // Mount Hor
      [29.8000, 35.2000], // Gulf of Aqaba approach
      [30.2000, 35.8000], // Punon (Feinan)
      [30.8000, 35.9000], // Oboth
      [31.1000, 35.8500], // Iye-abarim
      [31.4650, 35.7900]  // Arnon Gorge
    ]
  },

  "arnon_to_plains_of_moab": {
    id: "arnon_to_plains_of_moab",
    fromName: "Valley of the Arnon",
    toName: "Plains of Moab",
    historicalRoadName: "The King's Highway (Arnon to Plains of Moab)",
    mode: "desert_caravan",
    distanceMiles: 32,
    travelDays: 2.0,
    notes: "Numbers 21:20: Israel travels from the Arnon northward through the plateau of Moab to the top of Pisgah overlooking the wilderness and the Plains of Moab.",
    coordinates: [
      [31.4650, 35.7900], // Valley of the Arnon
      [31.5000, 35.7700], // Dibon
      [31.7167, 35.7833], // Medeba
      [31.7683, 35.7253], // Mount Pisgah / Mount Nebo
      [31.8402, 35.6737]  // Plains of Moab (opposite Jericho)
    ]
  },

  "sychar_to_cana_galilee": {
    id: "sychar_to_cana_galilee",
    fromName: "Sychar",
    toName: "Cana of Galilee",
    historicalRoadName: "Way of the Patriarchs (Northern Spur to Lower Galilee)",
    mode: "land_walking",
    distanceMiles: 34,
    travelDays: 1.5,
    notes: "John 4:43-46: Jesus continues northward from Sychar through the Samarian hill country and Jezreel Valley into Lower Galilee at Cana.",
    coordinates: [
      [32.2133, 35.2819], // Sychar / Shechem (Jacob's Well)
      [32.2800, 35.2600], // Samaria (Sebaste pass)
      [32.4000, 35.2500], // Dothan Valley entry into Jezreel
      [32.6100, 35.3100], // Plain of Esdraelon / Mount Tabor flank
      [32.7460, 35.3380]  // Cana of Galilee
    ]
  },

  "bethel_to_hebron_ridge_road": {
    id: "bethel_to_hebron_ridge_road",
    fromName: "Bethel",
    toName: "Hebron",
    historicalRoadName: "Way of the Patriarchs (Judean Ridge Highway)",
    mode: "land_walking",
    distanceMiles: 32,
    travelDays: 1.6,
    notes: "Genesis 13:18: Abram moves southward along the Judean watershed ridge past Jerusalem and Bethlehem to dwell by the oaks of Mamre at Hebron.",
    coordinates: [
      [31.9300, 35.2200], // Bethel
      [31.8480, 35.1850], // Gibeon / Mizpah
      [31.7767, 35.2342], // Jerusalem
      [31.7054, 35.2024], // Bethlehem
      [31.5292, 35.1039]  // Hebron (Mamre)
    ]
  }
};

/**
 * CHAPTER TO ROUTE SEGMENT KEYS HASH MAP (O(1) Indexed Lookup)
 * Direct mapping from canonical chapter ID ("book_chapter") to segments.
 */
export const CHAPTER_ROUTE_SEGMENT_KEYS: Record<string, string[]> = {
  // Acts of the Apostles
  "acts_8": [
    "jerusalem_to_samaria_ridge_road",
    "jerusalem_to_gaza_desert_road",
    "gaza_to_azotus_via_maris",
    "azotus_to_caesarea_via_maris"
  ],
  "acts_9": [
    "jerusalem_to_damascus_road",
    "joppa_to_lydda_roman_road",
    "lydda_to_jerusalem_ascent"
  ],
  "acts_10": [
    "caesarea_to_joppa_coastal_road"
  ],
  "acts_11": [
    "caesarea_to_joppa_coastal_road",
    "joppa_to_lydda_roman_road",
    "sidon_to_antioch_highway",
    "tyre_to_sidon_highway"
  ],
  "acts_12": [
    "caesarea_to_jerusalem_ascent",
    "tyre_to_sidon_highway"
  ],
  "acts_13": [
    "antioch_to_seleucia_pieria",
    "seleucia_to_salamis_sea",
    "salamis_to_paphos_highway",
    "paphos_to_perga_sea",
    "perga_to_pisidian_antioch",
    "pisidian_antioch_to_iconium"
  ],
  "acts_14": [
    "pisidian_antioch_to_iconium",
    "iconium_to_lystra_outbound",
    "lystra_to_derbe_outbound",
    "pisidian_antioch_to_perga_return",
    "perga_to_attalia_highway",
    "attalia_to_seleucia_sea"
  ],
  "acts_15": [
    "sidon_to_antioch_highway",
    "tyre_to_sidon_highway",
    "ptolemais_to_caesarea_road",
    "caesarea_to_jerusalem_ascent"
  ],
  "acts_16": [
    "antioch_to_derbe_cilician_gates",
    "derbe_to_lystra_via_sebaste",
    "lystra_to_iconium_via_sebaste",
    "iconium_to_troas_via_phrygia",
    "troas_to_samothrace_sea",
    "samothrace_to_neapolis_sea",
    "neapolis_to_philippi_via_egnatia"
  ],
  "acts_17": [
    "philippi_to_amphipolis_via_egnatia",
    "amphipolis_to_apollonia_via_egnatia",
    "apollonia_to_thessalonica_via_egnatia",
    "thessalonica_to_berea",
    "berea_to_pydna_methone",
    "pydna_to_athens_sea"
  ],
  "acts_18": [
    "athens_to_corinth_isthmus",
    "corinth_to_cenchreae",
    "cenchreae_to_ephesus_sea",
    "ephesus_to_caesarea_sea",
    "caesarea_to_jerusalem_ascent",
    "jerusalem_to_syrian_antioch",
    "antioch_through_galatia_phrygia"
  ],
  "acts_19": [
    "corinth_to_ephesus_aegean_crossing"
  ],
  "acts_20": [
    "ephesus_to_troas_coastal_highway",
    "troas_to_assos_roman_road",
    "assos_to_mitylene_sea",
    "mitylene_to_chios_samos_sea",
    "samos_to_miletus_sea"
  ],
  "acts_21": [
    "miletus_to_cos_rhodes_sea",
    "rhodes_to_patara_sea",
    "patara_to_tyre_deep_sea",
    "tyre_to_ptolemais_sea",
    "ptolemais_to_caesarea_road",
    "caesarea_to_jerusalem_ridge_road"
  ],
  "acts_22": [
    "jerusalem_to_damascus_road"
  ],
  "acts_23": [
    "jerusalem_to_antipatris_beth_horon",
    "antipatris_to_caesarea_via_maris"
  ],
  "acts_26": [
    "jerusalem_to_damascus_road"
  ],
  "acts_27": [
    "caesarea_to_sidon_myra_sea",
    "myra_to_crete_fair_havens",
    "crete_to_malta_euroclydon"
  ],
  "acts_28": [
    "malta_to_puteoli_sea",
    "puteoli_to_rome_via_appia"
  ],

  // Gospels
  "matthew_2": ["nazareth_to_bethlehem_hill_country", "bethlehem_to_egypt_caravan_route"],
  "matthew_3": ["jerusalem_to_jordan_baptism_site"],
  "matthew_4": ["nazareth_to_capernaum_via_maris"],
  "matthew_8": ["capernaum_to_bethsaida_lake_road"],
  "matthew_11": ["capernaum_to_bethsaida_lake_road", "tyre_to_sidon_highway"],
  "matthew_15": ["tyre_to_sidon_highway"],
  "matthew_16": ["capernaum_to_caesarea_philippi"],
  "matthew_17": ["nazareth_to_capernaum_via_maris"],
  "matthew_20": ["jerusalem_to_jericho_road"],
  "matthew_21": ["bethany_to_jerusalem_road"],
  "matthew_26": ["bethany_to_jerusalem_road"],

  "mark_1": ["jerusalem_to_jordan_baptism_site", "nazareth_to_capernaum_via_maris"],
  "mark_6": ["capernaum_to_bethsaida_lake_road"],
  "mark_7": ["tyre_to_sidon_highway"],
  "mark_8": ["capernaum_to_caesarea_philippi"],
  "mark_9": ["nazareth_to_capernaum_via_maris"],
  "mark_10": ["jerusalem_to_jericho_road"],
  "mark_11": ["bethany_to_jerusalem_road"],
  "mark_14": ["bethany_to_jerusalem_road"],

  "luke_2": ["nazareth_to_bethlehem_hill_country"],
  "luke_3": ["jerusalem_to_jordan_baptism_site"],
  "luke_4": ["nazareth_to_capernaum_via_maris", "tyre_to_sidon_highway"],
  "luke_7": ["capernaum_to_nain_road"],
  "luke_9": ["capernaum_to_caesarea_philippi", "capernaum_to_bethsaida_lake_road"],
  "luke_10": ["jerusalem_to_jericho_road", "tyre_to_sidon_highway"],
  "luke_17": ["galilee_to_jerusalem_via_samaria"],
  "luke_18": ["jerusalem_to_jericho_road"],
  "luke_19": ["jerusalem_to_jericho_road", "bethany_to_jerusalem_road"],
  "luke_24": ["jerusalem_to_emmaus_roman_road", "bethany_to_jerusalem_road"],

  "john_1": ["nazareth_to_capernaum_via_maris", "capernaum_to_bethsaida_lake_road"],
  "john_2": ["nazareth_to_capernaum_via_maris", "galilee_to_jerusalem_via_samaria"],
  "john_3": ["jerusalem_to_jordan_baptism_site"],
  "john_4": ["jerusalem_to_sychar_ridge_road", "sychar_to_cana_galilee", "nazareth_to_capernaum_via_maris"],
  "john_6": ["jerusalem_to_sea_of_galilee", "capernaum_to_tiberias_lakeside", "capernaum_to_bethsaida_lake_road"],
  "john_11": ["bethany_to_jerusalem_road"],
  "john_12": ["bethany_to_jerusalem_road"],

  // Revelation - The Seven Churches of Asia Circular Postal Highway
  "revelation_1": [
    "patmos_to_ephesus_sea",
    "ephesus_to_smyrna_roman_road",
    "smyrna_to_pergamum_highway",
    "pergamum_to_thyatira_highway",
    "thyatira_to_sardis_highway",
    "sardis_to_philadelphia_highway",
    "philadelphia_to_laodicea_highway"
  ],
  "revelation_2": [
    "ephesus_to_smyrna_roman_road",
    "smyrna_to_pergamum_highway",
    "pergamum_to_thyatira_highway"
  ],
  "revelation_3": [
    "thyatira_to_sardis_highway",
    "sardis_to_philadelphia_highway",
    "philadelphia_to_laodicea_highway"
  ],

  // Old Testament
  "genesis_12": ["way_of_the_patriarchs_complete"],
  "genesis_13": ["egypt_to_bethel_via_maris", "bethel_to_hebron_ridge_road"],
  "genesis_22": ["way_of_the_patriarchs_complete"],
  "exodus_13": ["exodus_rameses_to_redsea"],
  "exodus_14": ["etham_to_pihahiroth_red_sea"],
  "exodus_15": ["exodus_redsea_to_mount_sinai"],
  "exodus_16": ["exodus_redsea_to_mount_sinai"],
  "exodus_17": ["exodus_redsea_to_mount_sinai"],
  "exodus_18": ["exodus_redsea_to_mount_sinai"],
  "exodus_19": ["exodus_redsea_to_mount_sinai"],
  "joshua_2": ["shittim_to_jordan_crossing_jericho"],
  "joshua_3": ["shittim_to_jordan_crossing_jericho"],
  "joshua_4": ["shittim_to_jordan_crossing_jericho"],
  "joshua_6": ["shittim_to_jordan_crossing_jericho"],
  "ruth_1": ["moab_to_bethlehem_dead_sea_route"],
  "1samuel_17": ["bethlehem_to_valley_of_elah"],
  "2samuel_5": ["hebron_to_jerusalem_ridge_road"],
  "2samuel_6": ["hebron_to_jerusalem_ridge_road"],
  "1kings_19": [
    "jezreel_to_beersheba_ridge_road",
    "beersheba_to_mount_sinai",
    "sinai_to_damascus_desert_highway"
  ],
  "2kings_2": ["gilgal_to_bethel_jericho_jordan"],
  "1chronicles_11": ["hebron_to_jerusalem_ridge_road"],
  "ezra_7": ["babylon_to_jerusalem_exile_return"],
  "ezra_8": ["babylon_to_jerusalem_exile_return"],
  "nehemiah_2": ["susa_to_jerusalem_royal_road"],
  "numbers_20": ["kings_highway_transjordan_complete"],
  "numbers_21": ["mount_hor_to_arnon_kings_highway", "arnon_to_plains_of_moab"],
  "joshua_10": ["joshua_battle_of_gibeon_beth_horon"],
  "judges_4": ["deborah_barak_tabor_kishon_battle"],
  "judges_5": ["deborah_barak_tabor_kishon_battle"],
  "judges_7": ["gideon_harod_to_jordan_pursuit"],
  "1samuel_1": ["ramah_to_shiloh_ridge_road"],
  "1samuel_4": ["ark_journey_shiloh_to_philistia"],
  "1samuel_5": ["ark_journey_shiloh_to_philistia"],
  "1samuel_6": ["ark_return_ekron_to_kiriath_jearim"],
  "1samuel_21": ["david_flight_nob_to_adullam_engedi"],
  "1samuel_22": ["david_flight_nob_to_adullam_engedi"],
  "1samuel_23": ["david_flight_nob_to_adullam_engedi"],
  "1kings_17": ["elijah_cherith_to_zarephath"],
  "1kings_18": ["carmel_to_jezreel_chariot_race"],
  "2kings_5": ["damascus_to_samaria_jordan_route"],
  "2kings_25": ["jerusalem_to_riblah_babylonian_captivity"],
  "jeremiah_39": ["jerusalem_to_riblah_babylonian_captivity"],
  "matthew_27": ["via_dolorosa_calvary_route"],
  "mark_15": ["via_dolorosa_calvary_route"],
  "luke_23": ["via_dolorosa_calvary_route"],
  "john_19": ["via_dolorosa_calvary_route"],
  "colossians_4": ["laodicea_to_hierapolis_road"],
  "judges_13": ["zorah_to_eshtaol_sorek_route"],
  "judges_16": ["zorah_to_eshtaol_sorek_route"],
  "judges_20": ["dan_to_beersheba_national_highway"],
  "1samuel_3": ["dan_to_beersheba_national_highway"],
  "2samuel_3": ["dan_to_beersheba_national_highway"],
  "1kings_12": ["jerusalem_to_samaria_ridge_road"],
  "1kings_16": ["jerusalem_to_samaria_ridge_road"],
  "jonah_1": ["joppa_to_mediterranean_sea"],
  "jonah_3": ["jonah_journey_to_nineveh"]
};

/**
 * Instant O(1) retrieval of historical route segments for any book & chapter.
 */
export function getHistoricalRouteSegments(bookId: string, chapterNum: number): RouteSegment[] {
  const key = `${bookId.toLowerCase().replace(/\s+/g, '')}_${chapterNum}`;
  const segmentKeys = CHAPTER_ROUTE_SEGMENT_KEYS[key];

  if (!segmentKeys || segmentKeys.length === 0) {
    return [];
  }

  const result: RouteSegment[] = [];
  for (const segKey of segmentKeys) {
    const seg = HISTORICAL_ROAD_SEGMENTS[segKey];
    if (seg) {
      result.push(seg);
    }
  }

  return result;
}

/**
 * Calculates total travel stats (distance & estimated days) for a collection of route segments.
 */
export function getRouteJourneyStats(segments: RouteSegment[]): { totalDistanceMiles: number; totalDays: number; landDays: number; seaDays: number } {
  let totalDistanceMiles = 0;
  let totalDays = 0;
  let landDays = 0;
  let seaDays = 0;

  for (const seg of segments) {
    totalDistanceMiles += seg.distanceMiles;
    totalDays += seg.travelDays;
    if (seg.mode === 'sea_sailing') {
      seaDays += seg.travelDays;
    } else {
      landDays += seg.travelDays;
    }
  }

  return {
    totalDistanceMiles: Math.round(totalDistanceMiles),
    totalDays: Number(totalDays.toFixed(1)),
    landDays: Number(landDays.toFixed(1)),
    seaDays: Number(seaDays.toFixed(1))
  };
}
