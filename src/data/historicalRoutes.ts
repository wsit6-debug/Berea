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
  }
};

/**
 * CHAPTER TO ROUTE SEGMENT KEYS HASH MAP (O(1) Indexed Lookup)
 * Direct mapping from canonical chapter ID ("book_chapter") to segments.
 */
export const CHAPTER_ROUTE_SEGMENT_KEYS: Record<string, string[]> = {
  // Acts of the Apostles
  "acts_8": [
    "jerusalem_to_gaza_desert_road",
    "gaza_to_azotus_via_maris",
    "azotus_to_caesarea_via_maris"
  ],
  "acts_9": ["jerusalem_to_damascus_road"],
  "acts_13": [
    "antioch_to_seleucia_pieria",
    "seleucia_to_salamis_sea",
    "salamis_to_paphos_highway",
    "paphos_to_perga_sea",
    "perga_to_pisidian_antioch",
    "pisidian_antioch_to_iconium"
  ],
  "acts_14": [
    "iconium_to_lystra_outbound",
    "lystra_to_derbe_outbound",
    "derbe_to_lystra_return",
    "lystra_to_iconium_return",
    "iconium_to_pisidian_antioch_return",
    "pisidian_antioch_to_perga_return",
    "perga_to_attalia_highway",
    "attalia_to_seleucia_sea"
  ],
  "acts_16": [
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
  "acts_20": [
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
  "luke_2": ["nazareth_to_bethlehem_jordan_valley"],
  "luke_10": ["jerusalem_to_jericho_road"],
  "luke_24": ["jerusalem_to_emmaus_roman_road"],
  "john_4": ["galilee_to_jerusalem_via_samaria"],
  "matthew_16": ["capernaum_to_caesarea_philippi"],
  "mark_8": ["capernaum_to_caesarea_philippi"],

  // Old Testament
  "genesis_12": ["way_of_the_patriarchs_complete"],
  "genesis_13": ["way_of_the_patriarchs_complete"],
  "genesis_22": ["way_of_the_patriarchs_complete"],
  "exodus_13": ["exodus_rameses_to_redsea"],
  "exodus_14": ["exodus_rameses_to_redsea"],
  "exodus_15": ["exodus_redsea_to_mount_sinai"],
  "exodus_16": ["exodus_redsea_to_mount_sinai"],
  "exodus_17": ["exodus_redsea_to_mount_sinai"],
  "exodus_18": ["exodus_redsea_to_mount_sinai"],
  "exodus_19": ["exodus_redsea_to_mount_sinai"],
  "1kings_19": [
    "jezreel_to_beersheba_ridge_road",
    "beersheba_to_mount_sinai",
    "sinai_to_damascus_desert_highway"
  ],
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
