/**
 * BIBLE CHAPTER HISTORICAL SETTINGS DATABASE
 * Exhaustive scholarly settings for all 66 books and 1,189 chapters of the Holy Bible.
 * Provides the authentic historical and geographical location where each chapter
 * was thought to have occurred, been lived, or been composed.
 */

export interface ChapterHistoricalSetting {
  locationName: string;
  shortPlaceName: string;
  modernLocation: string;
  lat: number;
  lng: number;
  zoom: number;
  settingTitle: string;
  description: string;
  theologicalSignificance: string;
  era: string;
}

/**
 * Returns the scholarly, historical geographical setting for any biblical passage.
 */
export function getChapterSetting(bookId: string, chapterNum: number): ChapterHistoricalSetting {
  const b = bookId.toLowerCase().replace(/\s+/g, '');

  // ==========================================================================
  // PENTATEUCH / TORAH
  // ==========================================================================
  if (b === 'genesis') {
    if (chapterNum <= 4) {
      return {
        locationName: "Garden of Eden / Primeval Mesopotamia",
        shortPlaceName: "Eden / Mesopotamia",
        modernLocation: "Southern Iraq (Tigris-Euphrates River Basin)",
        lat: 31.0000,
        lng: 47.4000,
        zoom: 7,
        settingTitle: "Setting: Primeval Creation & Eden",
        description: "The fertile river basin between the ancient Tigris and Euphrates where God planted the Garden of Eden and created humanity in His divine image.",
        theologicalSignificance: "The sovereign creation of cosmos and life, the tragic Fall into sin, and the first gospel promise (Protoevangelium, Gen 3:15).",
        era: "Primeval Era"
      };
    }
    if (chapterNum <= 7) {
      return {
        locationName: "Ancient Mesopotamia (Pre-Flood Fertile Crescent)",
        shortPlaceName: "Mesopotamia",
        modernLocation: "Mesopotamian Basin (Iraq)",
        lat: 31.5000,
        lng: 46.0000,
        zoom: 7,
        settingTitle: "Setting: Pre-Flood World & The Ark",
        description: "The ancient Mesopotamian plains where Noah walked faithfully with God amid widespread corruption and constructed the Ark according to divine specifications.",
        theologicalSignificance: "Divine grief over pervasive human wickedness and the salvation of the righteous remnant through the waters of judgment.",
        era: "Antediluvian Era"
      };
    }
    if (chapterNum <= 9) {
      return {
        locationName: "Mount Ararat (Armenian Highlands)",
        shortPlaceName: "Mount Ararat",
        modernLocation: "Eastern Turkey (Agri Dagi / Historical Urartu)",
        lat: 39.7020,
        lng: 44.2990,
        zoom: 8,
        settingTitle: "Setting: Mount Ararat & Covenant with Noah",
        description: "The dormant volcanic massif towering over the Araxes river plain where the Ark rested upon the mountains of Ararat after the Great Flood.",
        theologicalSignificance: "Noah's sacrifice of worship, God's covenant with all creation, and the rainbow token of mercy.",
        era: "Post-Diluvian Era"
      };
    }
    if (chapterNum <= 11) {
      return {
        locationName: "Tower of Babel & Ur of the Chaldees",
        shortPlaceName: "Babel & Ur",
        modernLocation: "Tell el-Muqayyar / Tell el-Obeid, Southern Iraq",
        lat: 30.9620,
        lng: 46.1030,
        zoom: 8,
        settingTitle: "Setting: Plain of Shinar & Ur",
        description: "The Plain of Shinar where proud humanity built the Tower of Babel, and the sophisticated Sumerian city of Ur from which Terah and Abram departed.",
        theologicalSignificance: "The dispersion of the rebellious nations and God's counter-strategy: calling one family to bless all the families of the earth.",
        era: "Patriarchal Dawn (c. 2100 BC)"
      };
    }
    if (chapterNum === 12) {
      return {
        locationName: "Shechem (The Oak of Moreh)",
        shortPlaceName: "Shechem",
        modernLocation: "Tell Balata / Nablus, West Bank",
        lat: 32.2133,
        lng: 35.2819,
        zoom: 11,
        settingTitle: "Setting: Abram's Arrival in Canaan",
        description: "Strategic pass between Mount Gerizim and Mount Ebal where Abram built his first altar in the Promised Land and heard God's covenant promise.",
        theologicalSignificance: "'To your offspring I will give this land' (Gen 12:7) — the initial staking of the covenant land promise.",
        era: "Middle Bronze Age (c. 2000 BC)"
      };
    }
    if (chapterNum <= 19) {
      return {
        locationName: "Hebron (Oaks of Mamre)",
        shortPlaceName: "Hebron",
        modernLocation: "Hebron / Al-Khalil, West Bank",
        lat: 31.5290,
        lng: 35.0930,
        zoom: 11,
        settingTitle: "Setting: Oaks of Mamre in Hebron",
        description: "The central hill country plateau at 3,000 feet elevation where Abraham pitched his tent under the terebinth trees, hosted divine visitors, and interceded for Sodom.",
        theologicalSignificance: "The unconditional Abrahamic Covenant cut in blood (Gen 15) and the sign of circumcision (Gen 17).",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum <= 22) {
      return {
        locationName: "Beersheba & Mount Moriah",
        shortPlaceName: "Beersheba",
        modernLocation: "Tel Sheva, Negev, Israel",
        lat: 31.2450,
        lng: 34.7900,
        zoom: 10,
        settingTitle: "Setting: Beersheba & The Binding of Isaac",
        description: "The southern desert frontier well where Abraham planted a tamarisk tree and worshiped El Olam, setting out toward Mount Moriah with Isaac.",
        theologicalSignificance: "Jehovah-Jireh: 'On the mount of the Lord it shall be provided' — ultimate prophetic foreshadowing of the Father offering the Son.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum <= 26) {
      return {
        locationName: "Cave of Machpelah & Valley of Gerar",
        shortPlaceName: "Machpelah & Gerar",
        modernLocation: "Hebron & Western Negev, Israel",
        lat: 31.5240,
        lng: 35.1100,
        zoom: 11,
        settingTitle: "Setting: Machpelah Tomb & Isaac's Wells",
        description: "The ancestral burial cave purchased by Abraham in Hebron and the fertile wadi of Gerar where Isaac reopened his father's wells in patience.",
        theologicalSignificance: "Faith in the resurrection and ownership of the land demonstrated through burial in the Promised Land.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum === 27) {
      return {
        locationName: "Beersheba (Isaac's Homestead)",
        shortPlaceName: "Beersheba",
        modernLocation: "Tel Sheva, Negev, Israel",
        lat: 31.2450,
        lng: 34.7900,
        zoom: 11,
        settingTitle: "Setting: Isaac's Blessing in Beersheba",
        description: "The southern encampment where aging, blind Isaac sought to bless Esau, and Jacob secured the patriarchal birthright blessing.",
        theologicalSignificance: "Sovereign election of Jacob over Esau, working through flawed human instruments.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum === 28) {
      return {
        locationName: "Bethel (House of God / Luz)",
        shortPlaceName: "Bethel",
        modernLocation: "Beitin, Central Judean Ridge, West Bank",
        lat: 31.9300,
        lng: 35.2200,
        zoom: 11,
        settingTitle: "Setting: Jacob's Ladder at Bethel",
        description: "The rocky ridge terrace where lone fugitive Jacob slept with a stone for a pillow and beheld a ladder reaching to heaven with angels.",
        theologicalSignificance: "Christ the true Ladder connecting heaven and earth (John 1:51); God's sovereign covenant presence with the exile.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum <= 31) {
      return {
        locationName: "Haran in Paddan-Aram",
        shortPlaceName: "Haran",
        modernLocation: "Southeastern Turkey (near Sanliurfa)",
        lat: 36.8670,
        lng: 39.0300,
        zoom: 10,
        settingTitle: "Setting: Jacob's 20 Years in Haran",
        description: "The northern Syrian trading city where Jacob labored for Laban, married Leah and Rachel, and fathered the patriarchs of the twelve tribes of Israel.",
        theologicalSignificance: "God's providential multiplication of Israel under trial and deception.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum === 32) {
      return {
        locationName: "Peniel (Ford of the Jabbok River)",
        shortPlaceName: "Peniel",
        modernLocation: "Tell edh-Dhahab, Zarqa River, Jordan",
        lat: 32.1860,
        lng: 35.7000,
        zoom: 11,
        settingTitle: "Setting: Jacob Wrestles at Peniel",
        description: "The rugged mountain gorge of the Jabbok River where Jacob wrestled with the Angel of the Lord through the night until the break of dawn.",
        theologicalSignificance: "Transformation of Jacob the supplanter into Israel: 'He who strives with God and prevails.'",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum <= 35) {
      return {
        locationName: "Shechem & Bethel (Return to the Land)",
        shortPlaceName: "Shechem & Bethel",
        modernLocation: "Central Samaria / West Bank",
        lat: 32.2133,
        lng: 35.2819,
        zoom: 11,
        settingTitle: "Setting: Shechem & Renewal at Bethel",
        description: "The central mountain valley of Shechem and the covenant sanctuary of Bethel where Jacob buried foreign idols and renewed his vow.",
        theologicalSignificance: "Covenant purification and return to the altar of first commitment.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum === 36) {
      return {
        locationName: "Mount Seir (Edomite Highlands)",
        shortPlaceName: "Mount Seir",
        modernLocation: "Southern Jordan (Wadi Musa / Petra)",
        lat: 30.3280,
        lng: 35.4440,
        zoom: 10,
        settingTitle: "Setting: Encampments of Esau (Edom)",
        description: "The rugged red sandstone and granite mountain range south of the Dead Sea where Esau's descendants established the kingdom of Edom.",
        theologicalSignificance: "Fulfillment of God's promise to make of Esau a great nation alongside his brother.",
        era: "Patriarchal Era"
      };
    }
    if (chapterNum === 37) {
      return {
        locationName: "Dothan (The Cisterns of Dothan)",
        shortPlaceName: "Dothan",
        modernLocation: "Tel Dothan, Northern West Bank (Samaria)",
        lat: 32.4170,
        lng: 35.2410,
        zoom: 12,
        settingTitle: "Setting: Joseph Sold at Dothan",
        description: "The lush pasture basin along the Via Maris trunk road where Joseph's brothers stripped his coat of many colors and sold him to Midianite traders.",
        theologicalSignificance: "The beloved son rejected, betrayed for silver, and handed over to the Gentiles.",
        era: "Middle Bronze Age (c. 1850 BC)"
      };
    }
    if (chapterNum <= 45) {
      return {
        locationName: "Capital of Egypt (Avaris & Memphis)",
        shortPlaceName: "Avaris / Memphis",
        modernLocation: "Tell el-Dab'a & Mit Rahina, Egypt",
        lat: 30.0130,
        lng: 31.2080,
        zoom: 9,
        settingTitle: "Setting: Joseph in the Court of Pharaoh",
        description: "The imperial palaces and grain storehouses of ancient Egypt where Joseph rose from prisoner to Grand Vizier over all the land.",
        theologicalSignificance: "'You meant evil against me, but God meant it for good, to bring it about that many people should be kept alive' (Gen 50:20).",
        era: "Egyptian Middle Kingdom / Hyksos Period"
      };
    }
    if (chapterNum === 46) {
      return {
        locationName: "Beersheba (Southern Border of Canaan)",
        shortPlaceName: "Beersheba",
        modernLocation: "Tel Sheva, Negev, Israel",
        lat: 31.2450,
        lng: 34.7900,
        zoom: 11,
        settingTitle: "Setting: Jacob's Farewell at Beersheba",
        description: "The southernmost sanctuary of the patriarchs where 130-year-old Jacob offered sacrifices and God said: 'Do not be afraid to go down to Egypt.'",
        theologicalSignificance: "The formal descent of Israel's 70 souls into Egypt to be forged into a mighty nation.",
        era: "Patriarchal Era"
      };
    }
    return {
      locationName: "Land of Goshen (Nile Delta, Egypt)",
      shortPlaceName: "Goshen",
      modernLocation: "Wadi Tumilat / Sharqia Governorate, Egypt",
      lat: 30.7000,
      lng: 31.8000,
      zoom: 10,
      settingTitle: "Setting: Israel Settled in Goshen",
      description: "The fertile pastoral plain in the eastern Nile Delta where Jacob's family settled, multiplied, and where Jacob and Joseph passed into glory.",
      theologicalSignificance: "Preservation of the covenant family during worldwide famine; death in faith awaiting the Exodus.",
      era: "Patriarchal Era"
    };
  }

  if (b === 'exodus') {
    if (chapterNum <= 12) {
      return {
        locationName: "Rameses & Goshen (Eastern Nile Delta)",
        shortPlaceName: "Rameses (Goshen)",
        modernLocation: "Qantir / Tell el-Dab'a, Nile Delta, Egypt",
        lat: 30.7870,
        lng: 31.8210,
        zoom: 10,
        settingTitle: "Setting: Oppression & Passover in Egypt",
        description: "The mudbrick store-cities of Pithom and Rameses where Israel groaned under Pharaoh's slave labor and celebrated the blood-stained Passover.",
        theologicalSignificance: "Yahweh's triumph over the gods of Egypt, redemption through the blood of the unblemished Lamb.",
        era: "Exodus Era (c. 1446 BC / 1260 BC)"
      };
    }
    if (chapterNum <= 14) {
      return {
        locationName: "Pi-Hahiroth (The Red Sea Crossing)",
        shortPlaceName: "Pi-Hahiroth",
        modernLocation: "Northern Gulf of Suez / Bitter Lakes, Egypt",
        lat: 29.9700,
        lng: 32.5500,
        zoom: 10,
        settingTitle: "Setting: The Red Sea Miracle",
        description: "The trapped coastal shoreline between Migdol and the sea where the pillar of fire stood guard and God parted the waters with a strong east wind.",
        theologicalSignificance: "'Fear not, stand firm, and see the salvation of the Lord... The Lord will fight for you' (Exod 14:13-14).",
        era: "Exodus Era"
      };
    }
    if (chapterNum <= 18) {
      return {
        locationName: "Wilderness of Sin & Rephidim",
        shortPlaceName: "Rephidim",
        modernLocation: "Wadi Feiran / Southwestern Sinai Peninsula",
        lat: 28.7000,
        lng: 33.6000,
        zoom: 9,
        settingTitle: "Setting: The Sinai Wilderness March",
        description: "The arid granite wadis where God rained manna from heaven, provided water from the struck rock at Horeb, and defeated Amalek as Moses held up his staff.",
        theologicalSignificance: "Divine provision in the barren desert: Christ the true Manna and the Spiritual Rock (1 Cor 10:4).",
        era: "Exodus Era"
      };
    }
    return {
      locationName: "Mount Sinai (Jebel Musa / The Mountain of God)",
      shortPlaceName: "Mount Sinai",
      modernLocation: "Southern Sinai Peninsula, Egypt",
      lat: 28.5390,
      lng: 33.9750,
      zoom: 11,
      settingTitle: "Setting: The Giving of the Law & Tabernacle",
      description: "The granite peak cloaked in smoke, fire, and thunder where Moses received the Ten Commandments, the Book of the Covenant, and the blueprint of the Tabernacle.",
      theologicalSignificance: "Yahweh dwelling in the midst of His redeemed people; the glory cloud filling the Tabernacle (Exod 40:34).",
      era: "Exodus Era"
    };
  }

  if (b === 'leviticus') {
    return {
      locationName: "The Tent of Meeting (Mount Sinai Encampment)",
      shortPlaceName: "Mount Sinai (Tabernacle)",
      modernLocation: "Plain of ar-Raha at the foot of Mount Sinai, Egypt",
      lat: 28.5420,
      lng: 33.9720,
      zoom: 12,
      settingTitle: "Setting: The Tabernacle at Mount Sinai",
      description: "The courtyard of the Tent of Meeting pitched at the foot of Mount Sinai, where the sacrificial system, priesthood, purity laws, and Day of Atonement were commanded.",
      theologicalSignificance: "'You shall be holy, for I the Lord your God am holy' (Lev 19:2) — atonement and access to God through shed blood.",
      era: "Sinai Wilderness (First Year of Exodus)"
    };
  }

  if (b === 'numbers') {
    if (chapterNum <= 10) {
      return {
        locationName: "Wilderness of Sinai (Encampment of the Tribes)",
        shortPlaceName: "Wilderness of Sinai",
        modernLocation: "Southern Sinai Peninsula, Egypt",
        lat: 28.5390,
        lng: 33.9750,
        zoom: 11,
        settingTitle: "Setting: Organization at Mount Sinai",
        description: "The organized encampment of the twelve tribes surrounding the Tabernacle, numbered by census and prepared for holy march.",
        theologicalSignificance: "God's orderly presence at the center of His pilgrim people.",
        era: "Second Year of the Exodus"
      };
    }
    if (chapterNum <= 12) {
      return {
        locationName: "Kibroth-Hattaavah & Hazeroth",
        shortPlaceName: "Hazeroth",
        modernLocation: "Eastern Sinai / Gulf of Aqaba approach",
        lat: 28.8500,
        lng: 34.4000,
        zoom: 9,
        settingTitle: "Setting: Wandering in the Wilderness",
        description: "The desolate desert encampments marked by the graves of craving (Kibroth-hattaavah) and Miriam and Aaron's challenge to Moses.",
        theologicalSignificance: "The peril of discontentment and rebellion against God's appointed leadership.",
        era: "Wilderness Wanderings"
      };
    }
    if (chapterNum <= 20) {
      return {
        locationName: "Kadesh-Barnea (Wilderness of Paran / Zin)",
        shortPlaceName: "Kadesh-Barnea",
        modernLocation: "Ein el-Qudeirat, Northern Sinai / Negev border",
        lat: 30.6470,
        lng: 34.4190,
        zoom: 10,
        settingTitle: "Setting: Kadesh-Barnea (38-Year Encampment)",
        description: "The oasis springs on the southern border of Canaan from which the 12 spies were sent, where Israel rebelled, and where an entire generation died in the wilderness.",
        theologicalSignificance: "Unbelief barring entry into God's rest (Heb 3:19); the bronze serpent lifted up for healing (Num 21 / John 3:14).",
        era: "38 Years in the Wilderness"
      };
    }
    return {
      locationName: "The Plains of Moab (East of the Jordan River)",
      shortPlaceName: "Plains of Moab",
      modernLocation: "Abel-Shittim / Jordan Valley opposite Jericho, Jordan",
      lat: 31.8200,
      lng: 35.6500,
      zoom: 11,
      settingTitle: "Setting: Plains of Moab Encampment",
      description: "The vast acacia river plain east of the Jordan opposite Jericho where Israel defeated Sihon and Og, Balaam uttered his Messianic prophecies, and the new generation prepared to cross.",
      theologicalSignificance: "'A Star shall come out of Jacob, and a Scepter shall rise out of Israel' (Num 24:17) — unthwartable covenant blessing.",
      era: "Fortieth Year of the Exodus"
    };
  }

  if (b === 'deuteronomy') {
    if (chapterNum === 34) {
      return {
        locationName: "Mount Nebo (Summit of Pisgah)",
        shortPlaceName: "Mount Nebo",
        modernLocation: "Jabal Nibu, Madaba Governorate, Jordan",
        lat: 31.7683,
        lng: 35.7253,
        zoom: 12,
        settingTitle: "Setting: Moses' Vision & Death on Mount Nebo",
        description: "The 2,680-foot peak overlooking the Dead Sea, Jordan Valley, and the entire Promised Land where Moses died and was buried by God Himself.",
        theologicalSignificance: "The transition from Moses (the Law) to Joshua (Yeshua/Grace) to bring Israel into the inheritance.",
        era: "End of the 40-Year Wilderness Wandering"
      };
    }
    return {
      locationName: "The Plains of Moab (Across the Jordan at Beth-Peor)",
      shortPlaceName: "Plains of Moab",
      modernLocation: "Jordan Valley east of the Jordan, Jordan",
      lat: 31.8200,
      lng: 35.6500,
      zoom: 11,
      settingTitle: "Setting: Moses' Farewell Speeches in Moab",
      description: "The acacia terrace across from Jericho where 120-year-old Moses delivered his passionate covenant farewell sermons to the second generation of Israel.",
      theologicalSignificance: "The Shema: 'Hear, O Israel: The Lord our God, the Lord is one. You shall love the Lord your God with all your heart' (Deut 6:4-5).",
      era: "Eleventh Month of the 40th Year"
    };
  }

  // ==========================================================================
  // HISTORICAL BOOKS
  // ==========================================================================
  if (b === 'joshua') {
    if (chapterNum <= 5) {
      return {
        locationName: "Gilgal (Jordan River Crossing Camp)",
        shortPlaceName: "Gilgal",
        modernLocation: "Khirbet el-Mefjir, East of Jericho, West Bank",
        lat: 31.8700,
        lng: 35.4800,
        zoom: 11,
        settingTitle: "Setting: Gilgal & The Dried Jordan Crossing",
        description: "The first camp in the Promised Land where 12 memorial stones were set up from the dry riverbed, Israel was circumcised, and the Commander of the Lord's Army appeared.",
        theologicalSignificance: "The rolling away of the reproach of Egypt; entering the rest of faith under the Captain of Salvation.",
        era: "Conquest of Canaan (c. 1406 BC)"
      };
    }
    if (chapterNum <= 8) {
      return {
        locationName: "Jericho & Mount Ebal / Gerizim",
        shortPlaceName: "Jericho & Shechem",
        modernLocation: "Tell es-Sultan & Nablus, West Bank",
        lat: 31.8717,
        lng: 35.4446,
        zoom: 11,
        settingTitle: "Setting: Fall of Jericho & Mount Ebal Altar",
        description: "The collapsed mudbrick walls of Jericho and the covenant reading of blessings and curses between the twin mountain peaks of Shechem.",
        theologicalSignificance: "Victory by faith and obedience; total sovereignty of God's holy law in the land.",
        era: "Conquest Era"
      };
    }
    if (chapterNum <= 10) {
      return {
        locationName: "Gibeon & The Valley of Aijalon",
        shortPlaceName: "Gibeon & Aijalon",
        modernLocation: "Al-Jib, Central Highlands, West Bank",
        lat: 31.8480,
        lng: 35.1850,
        zoom: 11,
        settingTitle: "Setting: The Sun Stands Still at Gibeon",
        description: "The strategic plateau fortress where Joshua defended the Gibeonites and prayed: 'Sun, stand still at Gibeon, and moon, in the Valley of Aijalon.'",
        theologicalSignificance: "Cosmic intervention: 'There has been no day like it before or since, when the Lord heeded the voice of a man' (Josh 10:14).",
        era: "Conquest Era"
      };
    }
    if (chapterNum <= 22) {
      return {
        locationName: "Shiloh (The Sanctuary of the Tabernacle)",
        shortPlaceName: "Shiloh",
        modernLocation: "Tel Shiloh / Khirbet Seilun, West Bank",
        lat: 32.0550,
        lng: 35.2890,
        zoom: 11,
        settingTitle: "Setting: Shiloh & Division of the Land",
        description: "The central hill country plateau where the Tabernacle was permanently pitched for over three centuries and the land was allotted by sacred lot.",
        theologicalSignificance: "Rest from war and the faithful fulfillment of every covenant promise: 'Not one word of all the good promises failed' (Josh 21:45).",
        era: "Settlement Era"
      };
    }
    return {
      locationName: "Shechem (Joshua's Covenant Renewal)",
      shortPlaceName: "Shechem",
      modernLocation: "Tell Balata, Nablus, West Bank",
      lat: 32.2133,
      lng: 35.2819,
      zoom: 11,
      settingTitle: "Setting: Joshua's Farewell at Shechem",
      description: "The ancient oak where Abraham first built an altar, where aged Joshua assembled all Israel: 'Choose this day whom you will serve... as for me and my house, we will serve the Lord.'",
      theologicalSignificance: "Solemn voluntary covenant renewal under the witness of the sacred memorial stone.",
      era: "Settlement Era"
    };
  }

  if (b === 'judges') {
    if (chapterNum <= 3) {
      return {
        locationName: "Bochim & Central Highlands",
        shortPlaceName: "Bochim",
        modernLocation: "Judean / Samarian Hill Country, West Bank",
        lat: 31.8500,
        lng: 35.2000,
        zoom: 10,
        settingTitle: "Setting: Bochim & The Cycles of the Judges",
        description: "The 'Place of Weepers' where the Angel of the Lord rebuked Israel for compromise, inaugurating the recurring cycle of sin, servitude, supplication, and salvation.",
        theologicalSignificance: "The spiritual downward spiral when 'everyone did what was right in his own eyes.'",
        era: "Era of the Judges (c. 1380–1050 BC)"
      };
    }
    if (chapterNum <= 5) {
      return {
        locationName: "Mount Tabor & Kishon River Valley",
        shortPlaceName: "Mount Tabor",
        modernLocation: "Lower Galilee, Israel",
        lat: 32.6860,
        lng: 35.3900,
        zoom: 11,
        settingTitle: "Setting: Deborah & Barak at Mount Tabor",
        description: "The dome-shaped mountain overlooking the Jezreel Valley from which Barak swept down to rout Sisera's 900 iron chariots in the muddy Kishon torrent.",
        theologicalSignificance: "God using faithful women (Deborah and Jael) to shame proud tyrants and liberate His people.",
        era: "Era of the Judges"
      };
    }
    if (chapterNum <= 8) {
      return {
        locationName: "Spring of Harod (Jezreel Valley)",
        shortPlaceName: "Spring of Harod",
        modernLocation: "Gideon's Spring, Mount Gilboa foot, Israel",
        lat: 32.5490,
        lng: 35.3930,
        zoom: 11,
        settingTitle: "Setting: Gideon's 300 at Harod",
        description: "The natural pool at the base of Mount Gilboa where Gideon weeded out the fearful and selected 300 men with trumpets, jars, and torches to rout Midian.",
        theologicalSignificance: "'The sword of the Lord and of Gideon!' — victory belongs entirely to God, not to human strength or numbers.",
        era: "Era of the Judges"
      };
    }
    if (chapterNum <= 12) {
      return {
        locationName: "Gilead & Mizpah (Transjordan)",
        shortPlaceName: "Gilead",
        modernLocation: "Ajloun / Jerash Highlands, Jordan",
        lat: 32.3000,
        lng: 35.8000,
        zoom: 10,
        settingTitle: "Setting: Jephthah in Gilead",
        description: "The rugged forested plateau east of the Jordan River where Jephthah rallied the transjordanian tribes against the Ammonites.",
        theologicalSignificance: "Faith recorded in Hebrews 11 amidst tragedy and imperfect vows.",
        era: "Era of the Judges"
      };
    }
    if (chapterNum <= 16) {
      return {
        locationName: "Valley of Sorek & Gaza (Samson's Homeland)",
        shortPlaceName: "Zorah & Gaza",
        modernLocation: "Shephelah foothills & Gaza Strip",
        lat: 31.7750,
        lng: 34.9850,
        zoom: 11,
        settingTitle: "Setting: Samson in the Philistine Borderlands",
        description: "The Danite vineyard terraces of Zorah and the Philistine stronghold of Gaza where mighty Samson broke his Nazirite vow but struck his greatest blow in death.",
        theologicalSignificance: "The Spirit of the Lord empowering an imperfect vessel; dying to destroy the enemy temple.",
        era: "Era of the Judges"
      };
    }
    return {
      locationName: "Gibeah of Benjamin & Shiloh",
      shortPlaceName: "Gibeah",
      modernLocation: "Tell el-Ful, 3 miles north of Jerusalem",
      lat: 31.8230,
      lng: 35.2310,
      zoom: 11,
      settingTitle: "Setting: Moral Collapse at Gibeah",
      description: "The tragic civil war of Israel sparked by the outrage at Gibeah, showing total societal breakdown: 'In those days there was no king in Israel; everyone did what was right in his own eyes.'",
      theologicalSignificance: "The desperate need for the righteous King of God's own choosing.",
      era: "Era of the Judges"
    };
  }

  if (b === 'ruth') {
    if (chapterNum === 1) {
      return {
        locationName: "Plateau of Moab to Bethlehem",
        shortPlaceName: "Moab to Bethlehem",
        modernLocation: "Jordan to West Bank",
        lat: 31.7054,
        lng: 35.2024,
        zoom: 11,
        settingTitle: "Setting: Naomi & Ruth Return from Moab",
        description: "The mountain plateau of Moab where famine drove Elimelech's family, and the dusty pilgrim trail up to Bethlehem at the beginning of the barley harvest.",
        theologicalSignificance: "Ruth's confession of covenant loyalty: 'Your people shall be my people, and your God my God' (Ruth 1:16).",
        era: "Days when the Judges Ruled (c. 1100 BC)"
      };
    }
    return {
      locationName: "Bethlehem (Barley Fields & City Gate)",
      shortPlaceName: "Bethlehem",
      modernLocation: "Bethlehem, West Bank",
      lat: 31.7054,
      lng: 35.2024,
      zoom: 12,
      settingTitle: "Setting: Boaz's Field in Bethlehem",
      description: "The golden terraced grain fields below Bethlehem where Ruth gleaned behind the reapers, met Boaz the kinsman-redeemer, and secured the Davidic lineage.",
      theologicalSignificance: "The Kinsman-Redeemer (Go'el) foreshadowing Jesus Christ redeeming Gentiles into the royal lineage of David.",
      era: "Days of the Judges"
    };
  }

  if (b === '1samuel') {
    if (chapterNum <= 4) {
      return {
        locationName: "Shiloh (The House of the Lord)",
        shortPlaceName: "Shiloh",
        modernLocation: "Tel Shiloh / Seilun, West Bank",
        lat: 32.0550,
        lng: 35.2890,
        zoom: 12,
        settingTitle: "Setting: The Tabernacle Sanctuary at Shiloh",
        description: "The ancient sanctuary where Hannah prayed in anguish for a son, where young Samuel heard God's voice in the night, and where the Ark was captured by Philistines.",
        theologicalSignificance: "'Speak, Lord, for your servant hears' (1 Sam 3:9) — God raising up prophet and priest while judging the corrupt house of Eli.",
        era: "Transition from Judges to Monarchy (c. 1070 BC)"
      };
    }
    if (chapterNum <= 7) {
      return {
        locationName: "Ekron, Beth-Shemesh & Kiriath-Jearim",
        shortPlaceName: "Valley of Sorek",
        modernLocation: "Shephelah foothills, Israel",
        lat: 31.8100,
        lng: 35.0000,
        zoom: 11,
        settingTitle: "Setting: The Ark of the Covenant's Odyssey",
        description: "The Philistine cities plague-stricken before the Ark, the milk cows drawing the sacred cart to Beth-shemesh, and the 20-year resting place at Kiriath-jearim.",
        theologicalSignificance: "The holiness of God who defends His own glory without human armies; Ebenezer: 'Thus far the Lord has helped us.'",
        era: "Early Samuel Era"
      };
    }
    if (chapterNum <= 15) {
      return {
        locationName: "Gibeah of Saul & Michmash Pass",
        shortPlaceName: "Gibeah & Michmash",
        modernLocation: "Mukhmas & Tell el-Ful, West Bank",
        lat: 31.8730,
        lng: 35.2750,
        zoom: 11,
        settingTitle: "Setting: Reign of King Saul",
        description: "Saul's fortress capital at Gibeah and the dramatic crags of Bozez and Seneh at the Michmash Pass where Jonathan routed the Philistine garrison in faith.",
        theologicalSignificance: "'Nothing can hinder the Lord from saving by many or by few' (1 Sam 14:6) versus Saul's tragic disobedience: 'To obey is better than sacrifice.'",
        era: "Reign of King Saul (c. 1050–1010 BC)"
      };
    }
    if (chapterNum <= 17) {
      return {
        locationName: "Bethlehem & The Valley of Elah",
        shortPlaceName: "Valley of Elah",
        modernLocation: "Emek HaElah, Judean Lowlands, Israel",
        lat: 31.6840,
        lng: 34.9870,
        zoom: 12,
        settingTitle: "Setting: David and Goliath in the Valley of Elah",
        description: "The acacia stream valley between Socoh and Azekah where teenage shepherd David met nine-foot Philistine champion Goliath with five smooth stones and a sling.",
        theologicalSignificance: "'The battle is the Lord's' (1 Sam 17:47) — God's anointed champion winning victory for his trembling people.",
        era: "Early Davidic Era (c. 1025 BC)"
      };
    }
    if (chapterNum <= 20) {
      return {
        locationName: "Gibeah of Saul (Saul's Royal Court)",
        shortPlaceName: "Gibeah of Saul",
        modernLocation: "Tell el-Ful, 3 miles north of Jerusalem",
        lat: 31.8230,
        lng: 35.2310,
        zoom: 12,
        settingTitle: "Setting: David at Saul's Court in Gibeah",
        description: "King Saul's hill fortress where David played the lyre, Jonathan formed a covenant of brotherhood with David, and Saul's jealousy sought David's life.",
        theologicalSignificance: "Loyal covenant friendship between Jonathan and David; God preserving His anointed from the spear of Saul.",
        era: "Reign of King Saul (c. 1020 BC)"
      };
    }
    if (chapterNum <= 26) {
      return {
        locationName: "En-Gedi & The Caves of the Judean Wilderness",
        shortPlaceName: "En-Gedi (Wilderness)",
        modernLocation: "Dead Sea western cliffs / Ein Gedi, Israel",
        lat: 31.4650,
        lng: 35.3850,
        zoom: 11,
        settingTitle: "Setting: David's Flight from King Saul",
        description: "The freshwater spring oasis and craggy goat cliffs of En-gedi where fugitive David spared Saul's life in the darkness of the cave.",
        theologicalSignificance: "Refusal to take the throne by violence: waiting upon God's timing for the kingdom.",
        era: "David's Fugitive Years"
      };
    }
    return {
      locationName: "Ziklag & Mount Gilboa",
      shortPlaceName: "Ziklag & Gilboa",
      modernLocation: "Western Negev & Jezreel ridge, Israel",
      lat: 32.5000,
      lng: 35.4200,
      zoom: 10,
      settingTitle: "Setting: Saul's Fall on Mount Gilboa",
      description: "David's garrison at Ziklag and the windswept ridge of Mount Gilboa where King Saul and Jonathan fell in battle against the Philistines.",
      theologicalSignificance: "The tragic end of self-willed rule and the opening of the throne for David.",
      era: "c. 1010 BC"
    };
  }

  if (b === '2samuel') {
    if (chapterNum <= 4) {
      return {
        locationName: "Hebron (David's Capital over Judah)",
        shortPlaceName: "Hebron",
        modernLocation: "Hebron, West Bank",
        lat: 31.5290,
        lng: 35.0930,
        zoom: 11,
        settingTitle: "Setting: David Reigns in Hebron",
        description: "The ancient patriarchal city where David was anointed king over Judah, reigning for seven and a half years while the house of Saul crumbled.",
        theologicalSignificance: "Patient growth into God's sovereign calling: faithfulness in the smaller sphere before national rule.",
        era: "Early Monarchy (c. 1010–1003 BC)"
      };
    }
    if (chapterNum <= 10) {
      return {
        locationName: "Jerusalem (The City of David / Mount Zion)",
        shortPlaceName: "Jerusalem (City of David)",
        modernLocation: "Ophel Ridge / Silwan, Jerusalem",
        lat: 31.7760,
        lng: 35.2340,
        zoom: 12,
        settingTitle: "Setting: Capture of Zion & The Davidic Covenant",
        description: "The Jebusite water tunnel breached by Joab, the joyous entry of the Ark into Zion with dancing, and the eternal covenant promise in chapter 7.",
        theologicalSignificance: "The Davidic Covenant (2 Sam 7): an eternal throne, house, and kingdom fulfilled forever in the Son of David, Jesus Christ.",
        era: "Golden Age of United Monarchy (c. 1000 BC)"
      };
    }
    if (chapterNum <= 12) {
      return {
        locationName: "Jerusalem Palace & The Royal Rooftop",
        shortPlaceName: "Jerusalem Palace",
        modernLocation: "City of David excavation ridge, Jerusalem",
        lat: 31.7740,
        lng: 35.2340,
        zoom: 13,
        settingTitle: "Setting: David, Bathsheba, & Nathan's Rebuke",
        description: "The royal palace rooftop overlooking the terraced stone houses of Jerusalem where David sinned, followed by Nathan the prophet's searing parable: 'You are the man!'",
        theologicalSignificance: "The devastating consequences of sin even for God's anointed; true repentance in Psalm 51 and divine forgiveness.",
        era: "United Monarchy"
      };
    }
    if (chapterNum <= 20) {
      return {
        locationName: "Mount of Olives & Mahanaim (Absalom's Rebellion)",
        shortPlaceName: "Mount of Olives / Mahanaim",
        modernLocation: "Jerusalem & Gilead Highlands, Jordan",
        lat: 31.7780,
        lng: 35.2440,
        zoom: 11,
        settingTitle: "Setting: David's Flight from Absalom",
        description: "The weeping ascent of the Mount of Olives and the refuge city of Mahanaim across the Jordan during prince Absalom's coup d'état.",
        theologicalSignificance: "The suffering king rejected by his own people, prefiguring Christ weeping on the Mount of Olives.",
        era: "United Monarchy"
      };
    }
    return {
      locationName: "Threshing Floor of Araunah (Mount Moriah)",
      shortPlaceName: "Mount Moriah (Temple Mount)",
      modernLocation: "Temple Mount / Haram al-Sharif, Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 13,
      settingTitle: "Setting: The Altar on Mount Moriah",
      description: "The stone threshing floor purchased by David where the angel of the plague sheathed his sword, consecrated as the exact site for Solomon's Temple.",
      theologicalSignificance: "'I will not offer burnt offerings to the Lord my God that cost me nothing' (2 Sam 24:24) — mercy triumphing over judgment on the mount of sacrifice.",
      era: "c. 975 BC"
    };
  }

  if (b === '1kings') {
    if (chapterNum <= 11) {
      return {
        locationName: "Solomon's Temple & Royal Palace in Jerusalem",
        shortPlaceName: "Solomon's Temple (Jerusalem)",
        modernLocation: "Temple Mount, Old City Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 12,
        settingTitle: "Setting: Solomon's Glory & Temple Dedication",
        description: "The cedar, gold, and limestone Temple of Yahweh on Mount Moriah, filled with the Shekinah glory cloud at dedication, and the Queen of Sheba's royal visit.",
        theologicalSignificance: "The zenith of the Old Covenant kingdom; God dwelling visibly with His people; shadow of the true Temple in Christ.",
        era: "Solomonic Era (c. 970–931 BC)"
      };
    }
    if (chapterNum <= 16) {
      return {
        locationName: "Shechem & Samaria (Division of the Kingdom)",
        shortPlaceName: "Shechem & Samaria",
        modernLocation: "Nablus & Sebaste, West Bank",
        lat: 32.2760,
        lng: 35.1950,
        zoom: 11,
        settingTitle: "Setting: Kingdom Divided (Israel vs. Judah)",
        description: "The assembly at Shechem where Rehoboam's folly fractured the nation, Jeroboam's golden calves at Bethel and Dan, and Omri's founding of Samaria.",
        theologicalSignificance: "The tragic consequences of idolatry and departure from the Davidic covenant.",
        era: "Divided Monarchy (c. 930–875 BC)"
      };
    }
    if (chapterNum <= 19) {
      return {
        locationName: "Mount Carmel & Mount Horeb (Sinai)",
        shortPlaceName: "Mount Carmel & Sinai",
        modernLocation: "Carmel Ridge & Sinai Peninsula",
        lat: 32.6710,
        lng: 35.0390,
        zoom: 10,
        settingTitle: "Setting: Elijah at Carmel & The Still Small Voice",
        description: "The summit of Mount Carmel where fire fell from heaven to consume the altar against Baal's 450 prophets, followed by the cave at Horeb where God spoke in a gentle whisper.",
        theologicalSignificance: "'The Lord, He is God!' — Yahweh's solitary supremacy; God comforting His exhausted prophet with a faithful remnant of 7,000.",
        era: "Prophetic Ministry of Elijah (c. 860 BC)"
      };
    }
    return {
      locationName: "Jezreel & Ramoth-Gilead",
      shortPlaceName: "Jezreel",
      modernLocation: "Tel Yizre'el & Northern Jordan",
      lat: 32.5590,
      lng: 35.3280,
      zoom: 11,
      settingTitle: "Setting: Naboth's Vineyard & Ahab's Fall",
      description: "Ahab and Jezebel's royal winter palace in the fertile Jezreel Valley where Naboth was murdered for his vineyard, and Ahab fell to an arrow in Gilead.",
      theologicalSignificance: "Inescapable divine justice against tyranny and judicial murder.",
      era: "Divided Monarchy"
    };
  }

  if (b === '2kings') {
    if (chapterNum <= 2) {
      return {
        locationName: "Jordan River (Near Jericho)",
        shortPlaceName: "Jordan River",
        modernLocation: "Bethany Beyond Jordan / Jericho plains",
        lat: 31.7610,
        lng: 35.5580,
        zoom: 11,
        settingTitle: "Setting: Elijah Ascends in a Chariot of Fire",
        description: "The parting of the Jordan with Elijah's mantle and the miraculous ascension into heaven in a whirlwind with horses and chariots of fire.",
        theologicalSignificance: "Victory over death; Elisha receiving the double portion of the prophetic Spirit.",
        era: "c. 850 BC"
      };
    }
    if (chapterNum <= 8) {
      return {
        locationName: "Samaria, Shunem, & The Jordan River",
        shortPlaceName: "Samaria & Shunem",
        modernLocation: "Samaria & Jezreel Valley, West Bank / Israel",
        lat: 32.2760,
        lng: 35.1950,
        zoom: 10,
        settingTitle: "Setting: Miracles of Elisha",
        description: "The capital city of Samaria, the Shunammite woman's guest room, and the muddy Jordan where Naaman the Syrian dipped seven times to be healed of leprosy.",
        theologicalSignificance: "God's mercy extended to gentle believers and foreign Gentiles alike, prefiguring Jesus's ministry (Luke 4:27).",
        era: "Ministry of Elisha (c. 850–800 BC)"
      };
    }
    if (chapterNum <= 10) {
      return {
        locationName: "Jezreel & The Gate of Samaria",
        shortPlaceName: "Jezreel & Samaria",
        modernLocation: "Tel Yizre'el & Sebaste, West Bank",
        lat: 32.5590,
        lng: 35.3280,
        zoom: 11,
        settingTitle: "Setting: Jehu's Furious Chariot Charge",
        description: "The palace of Jezreel where Jezebel was thrown down and the temple of Baal in Samaria which was utterly demolished by furious-driving Jehu.",
        theologicalSignificance: "Fulfillment of Elijah's prophecy against the dynasty of Omri.",
        era: "c. 841 BC"
      };
    }
    if (chapterNum <= 17) {
      return {
        locationName: "Samaria (Fall of the Northern Kingdom)",
        shortPlaceName: "Samaria",
        modernLocation: "Sebaste, West Bank",
        lat: 32.2760,
        lng: 35.1950,
        zoom: 11,
        settingTitle: "Setting: Fall of Samaria & Assyrian Exile",
        description: "The hill capital besieged for three years by Shalmaneser V and Sargon II, resulting in the deportation of the ten northern tribes to Assyria and Media.",
        theologicalSignificance: "Covenant curse fulfilled: 2 Kings 17's theological verdict on unrepentant idolatry.",
        era: "Fall of Samaria (722 BC)"
      };
    }
    if (chapterNum <= 20) {
      return {
        locationName: "Jerusalem (Deliverance under King Hezekiah)",
        shortPlaceName: "Jerusalem",
        modernLocation: "Old City Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 12,
        settingTitle: "Setting: Sennacherib's Siege of Jerusalem",
        description: "The walls of Jerusalem mocked by Rabshakeh, where King Hezekiah spread Sennacherib's letter before the Lord and the angel slew 185,000 Assyrians overnight.",
        theologicalSignificance: "Salvation belongs to Yahweh: Jerusalem preserved for the sake of David.",
        era: "Invasion of Sennacherib (701 BC)"
      };
    }
    if (chapterNum <= 23) {
      return {
        locationName: "Jerusalem (King Josiah's Covenant Reform)",
        shortPlaceName: "Jerusalem (Temple)",
        modernLocation: "Temple Mount, Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 12,
        settingTitle: "Setting: The Law Found in the Temple",
        description: "The renovation of Solomon's Temple under young King Josiah where Hilkiah discovered the Book of the Law, leading to nationwide repentance and Passover.",
        theologicalSignificance: "The power of God's written Word to awaken and cleanse a compromised nation.",
        era: "Reign of Josiah (640–609 BC)"
      };
    }
    return {
      locationName: "Jerusalem & Babylon (The Babylonian Exile)",
      shortPlaceName: "Jerusalem & Babylon",
      modernLocation: "Jerusalem & Hillah (Babylon), Iraq",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 8,
      settingTitle: "Setting: Fall of Jerusalem & Babylonian Captivity",
      description: "Nebuchadnezzar's breach of the walls of Jerusalem, the burning of the Temple, and the long exile march of Judah to the banks of Babylon.",
      theologicalSignificance: "Sabbath rest for the desecrated land, accompanied by the preserved Davidic seed (Jehoiachin elevated in Babylon).",
      era: "Babylonian Conquest (586 BC)"
    };
  }

  if (b === '1chronicles' || b === '2chronicles') {
    return {
      locationName: "Temple Mount & The City of David (Jerusalem)",
      shortPlaceName: "Jerusalem (Temple Mount)",
      modernLocation: "Mount Moriah, Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: The Temple & The Line of David",
      description: "The holy center of worship in Jerusalem, recording the sacred lineage of David, the temple musicians, the Levitical order, and the royal history of Judah.",
      theologicalSignificance: "Post-exilic encouragement: God's covenant with David and His Temple remains the focal point of redemptive history.",
      era: "Monarchy & Post-Exilic Compilation (c. 450 BC)"
    };
  }

  if (b === 'ezra') {
    if (chapterNum <= 6) {
      return {
        locationName: "The Second Temple Site in Jerusalem",
        shortPlaceName: "Jerusalem (Second Temple)",
        modernLocation: "Temple Mount, Old City Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 12,
        settingTitle: "Setting: Rebuilding the Second Temple",
        description: "The ruined altar re-erected by Zerubbabel and Jeshua amid weeping and shouting, completed through the prophetic ministries of Haggai and Zechariah.",
        theologicalSignificance: "The Sovereign God moving the heart of Persian emperors to restore His house and altar.",
        era: "Post-Exilic Return (538–516 BC)"
      };
    }
    return {
      locationName: "Babylon to Jerusalem (Ezra's Mission)",
      shortPlaceName: "Jerusalem",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: Ezra's Scribe Ministry in Jerusalem",
      description: "Ezra the priest and ready scribe of the Law of Moses leading the second return from Babylon to teach the statutes of God and reform the community.",
      theologicalSignificance: "'The hand of our God was upon us for good' — devotion to studying, doing, and teaching God's Word (Ezra 7:10).",
      era: "c. 458 BC"
    };
  }

  if (b === 'nehemiah') {
    if (chapterNum <= 2) {
      return {
        locationName: "Susa (Citadel of Shushan, Persian Capital)",
        shortPlaceName: "Susa (Citadel)",
        modernLocation: "Shush, Khuzestan Province, Iran",
        lat: 32.1900,
        lng: 48.2560,
        zoom: 9,
        settingTitle: "Setting: Nehemiah at the Persian Court",
        description: "The winter palace of Persian King Artaxerxes I where cupbearer Nehemiah wept, fasted, and prayed for the broken walls of Jerusalem.",
        theologicalSignificance: "The power of fervent, strategic prayer moving worldly empires on behalf of God's city.",
        era: "Persian Period (c. 445 BC)"
      };
    }
    return {
      locationName: "The Rebuilt Walls of Jerusalem",
      shortPlaceName: "Jerusalem Walls",
      modernLocation: "Old City Jerusalem",
      lat: 31.7767,
      lng: 35.2345,
      zoom: 13,
      settingTitle: "Setting: Rebuilding the Walls of Jerusalem",
      description: "The stone rubble and gates of Jerusalem repaired in 52 days with a trowel in one hand and a sword in the other against Sanballat and Tobiah.",
      theologicalSignificance: "Courageous leadership, unity of the body, and the public reading of the Law at the Water Gate: 'The joy of the Lord is your strength.'",
      era: "c. 445–432 BC"
    };
  }

  if (b === 'esther') {
    return {
      locationName: "The Royal Citadel of Susa (Shushan the Palace)",
      shortPlaceName: "Citadel of Susa",
      modernLocation: "Shush, Khuzestan Province, Southwestern Iran",
      lat: 32.1900,
      lng: 48.2560,
      zoom: 10,
      settingTitle: "Setting: The Persian Palace in Susa",
      description: "The marble courtyards and throne room of King Ahasuerus (Xerxes I) where Queen Esther and Mordecai foiled Haman's plot to exterminate the Jewish people.",
      theologicalSignificance: "The hidden yet flawless providence of God: 'Who knows whether you have not come to the kingdom for such a time as this?' (Esth 4:14).",
      era: "Persian Empire (c. 483–473 BC)"
    };
  }

  // ==========================================================================
  // POETRY & WISDOM LITERATURE
  // ==========================================================================
  if (b === 'job') {
    return {
      locationName: "The Land of Uz (Edom / Northern Arabian Plateau)",
      shortPlaceName: "Land of Uz",
      modernLocation: "High plateau east of the Jordan & Arabah (Jordan / Saudi Arabia borderland)",
      lat: 30.5000,
      lng: 35.6000,
      zoom: 8,
      settingTitle: "Setting: The Land of Uz",
      description: "The ancient patriarchal steppe east of the Promised Land, home to blameless and upright Job, where he suffered in the ash heap and met God in the whirlwind.",
      theologicalSignificance: "'I know that my Redeemer lives' (Job 19:25) — the mystery of innocent suffering vindicated in the sovereign majesty and wisdom of God.",
      era: "Patriarchal Era (c. 2000–1800 BC)"
    };
  }

  if (b === 'psalms') {
    if (chapterNum === 137) {
      return {
        locationName: "The Waters of Babylon",
        shortPlaceName: "Waters of Babylon",
        modernLocation: "Euphrates River canals, Hillah, Iraq",
        lat: 32.5360,
        lng: 44.4200,
        zoom: 10,
        settingTitle: "Setting: By the Waters of Babylon",
        description: "The irrigation canals of Babylon where the Judean captives hung their harps upon the willows and wept when they remembered Zion.",
        theologicalSignificance: "Unyielding covenant love for Jerusalem even in foreign exile: 'If I forget you, O Jerusalem, let my right hand forget its skill.'",
        era: "Babylonian Exile (c. 586 BC)"
      };
    }
    return {
      locationName: "Jerusalem (Mount Zion & The Temple Sanctuary)",
      shortPlaceName: "Mount Zion (Jerusalem)",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: The Temple Courts of Mount Zion",
      description: "The sacred heights of Mount Zion where David, Asaph, and the Sons of Korah poured out praise, lament, and messianic prophecy to the Shepherd of Israel.",
      theologicalSignificance: "The heart of biblical worship, messianic enthronement (Psalm 2, 110), and pastoral assurance: 'The Lord is my shepherd; I shall not want' (Psalm 23).",
      era: "United Monarchy & Second Temple Era"
    };
  }

  if (b === 'proverbs' || b === 'ecclesiastes' || b === 'songofsolomon') {
    return {
      locationName: "The Royal Palace on Mount Zion (Jerusalem)",
      shortPlaceName: "Jerusalem (Royal Court)",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: The Court of Solomon in Jerusalem",
      description: "The administrative and intellectual hub of Solomon's kingdom on Mount Zion, gathering divine wisdom, royal proverbs, philosophical reflection, and holy love.",
      theologicalSignificance: "The fear of the Lord as the beginning of all wisdom and knowledge; life lived under the sun judged by eternity.",
      era: "Solomonic Golden Age (c. 970–931 BC)"
    };
  }

  // ==========================================================================
  // MAJOR & MINOR PROPHETS
  // ==========================================================================
  if (b === 'isaiah') {
    return {
      locationName: "Jerusalem (The Temple & Royal Court of Judah)",
      shortPlaceName: "Jerusalem",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: The Royal Prophet in Jerusalem",
      description: "The Temple of the Holy One of Israel where Isaiah beheld the Lord high and lifted up (Isa 6), prophesying during the reigns of Uzziah, Jotham, Ahaz, and Hezekiah.",
      theologicalSignificance: "The Fifth Gospel: Immanuel born of a virgin (Isa 7), the Prince of Peace (Isa 9), and the Suffering Servant wounded for our transgressions (Isa 53).",
      era: "8th Century BC (c. 740–680 BC)"
    };
  }

  if (b === 'jeremiah') {
    if (chapterNum >= 43) {
      return {
        locationName: "Tahpanhes (Nile Delta, Egypt)",
        shortPlaceName: "Tahpanhes (Egypt)",
        modernLocation: "Tell Defenneh, Ismailia Governorate, Egypt",
        lat: 30.8600,
        lng: 32.1600,
        zoom: 9,
        settingTitle: "Setting: Jeremiah in Egyptian Exile",
        description: "The fortified palace fortress of Pharaoh Hophra in eastern Egypt where the rebellious Judean remnant dragged the weeping prophet.",
        theologicalSignificance: "The final rejection of God's prophet by the hardened remnant, contrasting with the promise of the New Covenant.",
        era: "Post-586 BC"
      };
    }
    return {
      locationName: "Jerusalem & Anathoth (Kingdom of Judah)",
      shortPlaceName: "Jerusalem & Anathoth",
      modernLocation: "Old City Jerusalem & Anata, West Bank",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: The Weeping Prophet in Jerusalem",
      description: "The Temple gate, royal court, and cistern prison of Jerusalem where Jeremiah proclaimed forty years of tearful warning against Judah's idolatry.",
      theologicalSignificance: "The New Covenant written on the heart (Jer 31:31-34) and the Righteous Branch of David.",
      era: "Late Kingdom of Judah (627–586 BC)"
    };
  }

  if (b === 'lamentations') {
    return {
      locationName: "The Ruins of Mount Zion (Jerusalem)",
      shortPlaceName: "Ruins of Jerusalem",
      modernLocation: "Overlooking the Temple Mount, Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: Lament Over Destroyed Jerusalem",
      description: "The smoldering ashes of the burned Temple and broken walls of Zion where Jeremiah wept over the lonely widow city.",
      theologicalSignificance: "'The steadfast love of the Lord never ceases; His mercies never come to an end; they are new every morning; great is your faithfulness' (Lam 3:22-23).",
      era: "Post-Destruction of Jerusalem (586 BC)"
    };
  }

  if (b === 'ezekiel') {
    return {
      locationName: "Tel Abib by the Chebar Canal (Babylon)",
      shortPlaceName: "Chebar Canal (Babylon)",
      modernLocation: "Near Nippur / Nuffar, Al-Qādisiyyah Governorate, Iraq",
      lat: 32.0500,
      lng: 44.4500,
      zoom: 9,
      settingTitle: "Setting: The Prophet Among the Exiles",
      description: "The major irrigation canal linking Babylon and Nippur where priest Ezekiel saw visions of God's chariot-throne, the departure of the glory, and the valley of dry bones.",
      theologicalSignificance: "'Then you shall know that I am Yahweh' — the glory of God transcendent above exile; the new heart of flesh and dry bones raised to life.",
      era: "Babylonian Exile (593–571 BC)"
    };
  }

  if (b === 'daniel') {
    if (chapterNum === 8) {
      return {
        locationName: "Susa (By the Ulai Canal, Persia)",
        shortPlaceName: "Ulai Canal (Susa)",
        modernLocation: "Shush, Khuzestan Province, Iran",
        lat: 32.1900,
        lng: 48.2560,
        zoom: 9,
        settingTitle: "Setting: Vision by the Ulai Canal",
        description: "The Persian citadel of Susa where Daniel saw the prophetic vision of the Ram and the He-goat representing Medo-Persia and Greece.",
        theologicalSignificance: "God's sovereign timetable over the rise and fall of world empires.",
        era: "Babylonian / Persian Transition"
      };
    }
    return {
      locationName: "The Imperial Court of Babylon",
      shortPlaceName: "Imperial Babylon",
      modernLocation: "Hillah, Babylon Governorate, Iraq",
      lat: 32.5360,
      lng: 44.4200,
      zoom: 10,
      settingTitle: "Setting: The Royal Palace of Babylon",
      description: "The Ishtar Gate, hanging gardens, fiery furnace, and lions' den where Daniel and his three companions resolved not to defile themselves.",
      theologicalSignificance: "'The Most High rules the kingdom of men' (Dan 4:17); the stone cut without hands shattering world empires (Dan 2); the Ancient of Days and the Son of Man (Dan 7).",
      era: "Exile to Cyrus the Great (605–536 BC)"
    };
  }

  if (b === 'hosea') {
    return {
      locationName: "Samaria (Northern Kingdom of Israel)",
      shortPlaceName: "Samaria",
      modernLocation: "Sebaste / Northern West Bank",
      lat: 32.2760,
      lng: 35.1950,
      zoom: 11,
      settingTitle: "Setting: Hosea's Prophecy in Israel",
      description: "The declining northern kingdom of Jeroboam II where Hosea's agonizing marriage to unfaithful Gomer mirrored God's persistent covenant love for wayward Israel.",
      theologicalSignificance: "Unfathomable divine grace: 'How can I give you up, O Ephraim?' (Hos 11:8); redemption out of spiritual adultery.",
      era: "8th Century BC (c. 755–715 BC)"
    };
  }

  if (b === 'joel') {
    return {
      locationName: "The Temple Courts in Jerusalem",
      shortPlaceName: "Jerusalem (Temple)",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: Joel's Alarm in Zion",
      description: "The Temple Mount during a devastating locust plague and drought that paralyzed grain offerings, prompting the call: 'Blow a trumpet in Zion; sound an alarm on my holy mountain!'",
      theologicalSignificance: "The Day of the Lord and the promise of Pentecost: 'I will pour out my Spirit on all flesh' (Joel 2:28 / Acts 2:17).",
      era: "Prophetic Judah"
    };
  }

  if (b === 'amos') {
    return {
      locationName: "Bethel (Royal Sanctuary of Jeroboam II)",
      shortPlaceName: "Bethel (Royal Shrine)",
      modernLocation: "Beitin, West Bank",
      lat: 31.9300,
      lng: 35.2200,
      zoom: 11,
      settingTitle: "Setting: The Herdsman of Tekoa at Bethel",
      description: "The state sanctuary of the golden calf in the northern kingdom where Judean shepherd Amos roared against the wealthy corrupt elite.",
      theologicalSignificance: "'Let justice roll down like waters, and righteousness like an ever-flowing stream' (Amos 5:24); the fallen booth of David restored (Amos 9:11).",
      era: "c. 760 BC"
    };
  }

  if (b === 'obadiah') {
    return {
      locationName: "The Rock Fortress of Edom (Sela / Petra)",
      shortPlaceName: "Sela (Edom)",
      modernLocation: "Petra / Wadi Musa, Southern Jordan",
      lat: 30.3280,
      lng: 35.4440,
      zoom: 10,
      settingTitle: "Setting: Oracle Against Edom",
      description: "The sheer red sandstone cliffs and canyons of Mount Seir where proud Edom dwelt in the clefts of the rock and gloated over Jerusalem's fall.",
      theologicalSignificance: "Judgment on pride and brotherly betrayal: 'The kingdom shall be the Lord's' (Obad 1:21).",
      era: "Post-586 BC"
    };
  }

  if (b === 'jonah') {
    if (chapterNum <= 2) {
      return {
        locationName: "Joppa & The Great Sea (Mediterranean)",
        shortPlaceName: "Joppa (Jaffa)",
        modernLocation: "Jaffa Port, Tel Aviv, Israel",
        lat: 32.0540,
        lng: 34.7540,
        zoom: 11,
        settingTitle: "Setting: Flight from Joppa",
        description: "The ancient Phoenician-controlled port where Jonah boarded a ship to Tarshish to flee from the presence of the Lord, cast into the raging tempest.",
        theologicalSignificance: "The sign of Jonah: three days and three nights in the heart of the sea, prefiguring Christ's burial and resurrection (Matt 12:40).",
        era: "8th Century BC (c. 770 BC)"
      };
    }
    return {
      locationName: "Nineveh (The Great Assyrian Capital)",
      shortPlaceName: "Nineveh",
      modernLocation: "Mosul, Nineveh Governorate, Iraq",
      lat: 36.3600,
      lng: 43.1500,
      zoom: 10,
      settingTitle: "Setting: Jonah at Nineveh",
      description: "The three-day metropolis on the Tigris River where king and beast sat in sackcloth and ashes at the preaching of Jonah, turning from their violent ways.",
      theologicalSignificance: "God's boundless compassion toward the Gentile nations: 'I knew that you are a gracious God and merciful, slow to anger and abounding in steadfast love' (Jonah 4:2).",
      era: "c. 760 BC"
    };
  }

  if (b === 'micah') {
    return {
      locationName: "Moresheth-Gath (Judean Foothills / Shephelah)",
      shortPlaceName: "Moresheth-Gath",
      modernLocation: "Tel Goded, Shephelah, Israel",
      lat: 31.6000,
      lng: 34.9000,
      zoom: 11,
      settingTitle: "Setting: The Prophet from the Foothills",
      description: "The agricultural border town in the Judean Shephelah overlooking Philistia from which Micah prophesied the exact birthplace of the Messiah.",
      theologicalSignificance: "'You, O Bethlehem Ephrathah... from you shall come forth for me one who is to be ruler in Israel, whose coming forth is from of old, from ancient days' (Micah 5:2).",
      era: "8th Century BC (c. 735–700 BC)"
    };
  }

  if (b === 'nahum') {
    return {
      locationName: "Nineveh (The Bloody City Under Judgment)",
      shortPlaceName: "Nineveh",
      modernLocation: "Opposite Mosul on the Tigris River, Iraq",
      lat: 36.3600,
      lng: 43.1500,
      zoom: 10,
      settingTitle: "Setting: The Fall of Nineveh",
      description: "The impenetrable lion's den of the Assyrian Empire whose impending destruction Nahum heralded as good news for the oppressed people of God.",
      theologicalSignificance: "'The Lord is slow to anger and great in power, and the Lord will by no means clear the guilty' (Nahum 1:3); comfort for the oppressed.",
      era: "c. 663–612 BC"
    };
  }

  if (b === 'habakkuk') {
    return {
      locationName: "The Watchtower in Jerusalem",
      shortPlaceName: "Jerusalem Watchtower",
      modernLocation: "City of David walls, Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: Habakkuk on the Ramparts",
      description: "The prophetic watchtower where Habakkuk stood to hear God's answer concerning the terrifying rise of the Chaldeans (Babylonians).",
      theologicalSignificance: "'The righteous shall live by his faith' (Hab 2:4 / Rom 1:17) — the bedrock anthem of the Protestant Reformation.",
      era: "c. 605 BC"
    };
  }

  if (b === 'zephaniah') {
    return {
      locationName: "Jerusalem (Reign of Josiah)",
      shortPlaceName: "Jerusalem",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: Zephaniah in Royal Jerusalem",
      description: "The upper quarters of Jerusalem where royal-blooded Zephaniah heralded the Great Day of the Lord against pagan idolatry.",
      theologicalSignificance: "'The Lord your God is in your midst, a mighty one who will save; He will rejoice over you with gladness; He will quiet you by His love' (Zeph 3:17).",
      era: "c. 630 BC"
    };
  }

  if (b === 'haggai' || b === 'zechariah') {
    return {
      locationName: "The Second Temple Site in Jerusalem",
      shortPlaceName: "Jerusalem (Second Temple)",
      modernLocation: "Temple Mount, Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: Rebuilding the House of the Lord",
      description: "The foundation platform of the Second Temple where Haggai and Zechariah rebuked sluggishness and prophesied the Branch and the humble King coming on a donkey.",
      theologicalSignificance: "'Not by might, nor by power, but by my Spirit, says the Lord of hosts' (Zech 4:6); the King arriving righteous and having salvation (Zech 9:9).",
      era: "Post-Exilic (520–518 BC)"
    };
  }

  if (b === 'malachi') {
    return {
      locationName: "The Second Temple Courts in Jerusalem",
      shortPlaceName: "Jerusalem (Temple)",
      modernLocation: "Temple Mount, Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: The Last Voice of the Old Testament",
      description: "The Second Temple courts where Malachi confronted corrupt priests, blemished sacrifices, and broken marriage vows, pointing to the Sun of Righteousness.",
      theologicalSignificance: "'Behold, I send my messenger, and he will prepare the way before me' (Mal 3:1); Elijah coming before the great Day of the Lord.",
      era: "c. 430 BC"
    };
  }

  // ==========================================================================
  // NEW TESTAMENT GOSPELS & ACTS
  // ==========================================================================
  if (b === 'matthew') {
    if (chapterNum <= 2) {
      return {
        locationName: "Bethlehem (The Grotto of the Nativity)",
        shortPlaceName: "Bethlehem",
        modernLocation: "Bethlehem, West Bank",
        lat: 31.7054,
        lng: 35.2024,
        zoom: 12,
        settingTitle: "Setting: The Nativity in Bethlehem",
        description: "The ancestral City of David where Mary gave birth to Jesus, visited by the Judean shepherds and the Persian Magi following the star.",
        theologicalSignificance: "Micah 5:2 fulfilled: the eternal Shepherd-King born in David's town.",
        era: "Roman Judea (c. 5–4 BC)"
      };
    }
    if (chapterNum === 3) {
      return {
        locationName: "Bethany Beyond the Jordan (Baptism Site)",
        shortPlaceName: "Jordan River",
        modernLocation: "Al-Maghtas, Jordan",
        lat: 31.8386,
        lng: 35.5492,
        zoom: 12,
        settingTitle: "Setting: The Baptism of Jesus",
        description: "The lower Jordan River ford where John the Baptist preached repentance and the Holy Spirit descended as a dove: 'This is my beloved Son.'",
        theologicalSignificance: "Trinitarian epiphany; Christ identifying fully with sinful humanity in baptism.",
        era: "c. AD 26"
      };
    }
    if (chapterNum <= 7) {
      return {
        locationName: "Mount of Beatitudes (Sea of Galilee)",
        shortPlaceName: "Mount of Beatitudes",
        modernLocation: "Tabgha / Mount Eremos, Galilee, Israel",
        lat: 32.8810,
        lng: 35.5560,
        zoom: 12,
        settingTitle: "Setting: The Sermon on the Mount",
        description: "The natural acoustic hillside terrace overlooking the Sea of Galilee where Jesus delivered the constitution of the Kingdom of Heaven.",
        theologicalSignificance: "The Beatitudes, the Lord's Prayer, salt and light, and the rock foundation of obedience.",
        era: "Galilean Ministry (c. AD 28)"
      };
    }
    if (chapterNum <= 18) {
      return {
        locationName: "Capernaum (Jesus's Ministry Headquarters)",
        shortPlaceName: "Capernaum",
        modernLocation: "Kfar Nahum, Northern Sea of Galilee, Israel",
        lat: 32.8806,
        lng: 35.5750,
        zoom: 12,
        settingTitle: "Setting: Capernaum & Sea of Galilee",
        description: "The bustling lakeside fishing village and Roman customs post where Jesus lived in Peter's house, healed the sick, and taught in the synagogue.",
        theologicalSignificance: "'The people dwelling in darkness have seen a great light' (Matt 4:16) — the epicenter of kingdom power.",
        era: "Galilean Ministry"
      };
    }
    if (chapterNum <= 20) {
      return {
        locationName: "Perea & Jericho (The Ascent to Jerusalem)",
        shortPlaceName: "Perea & Jericho",
        modernLocation: "Jordan Valley & Jericho oasis",
        lat: 31.8717,
        lng: 35.4446,
        zoom: 11,
        settingTitle: "Setting: The Road to Jerusalem",
        description: "The region beyond the Jordan and the palm-lined oasis of Jericho where blind Bartimaeus received his sight as the Son of Man marched toward the cross.",
        theologicalSignificance: "'The Son of Man came not to be served but to serve, and to give his life as a ransom for many' (Matt 20:28).",
        era: "Final Journey to Jerusalem (AD 30)"
      };
    }
    if (chapterNum <= 25) {
      return {
        locationName: "The Temple Courts & Mount of Olives (Jerusalem)",
        shortPlaceName: "Temple Mount & Olivet",
        modernLocation: "Old City & Mount of Olives, Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 13,
        settingTitle: "Setting: Passion Week Teaching & Olivet Discourse",
        description: "The royal porticos of Herod's Temple and the western slope of the Mount of Olives where Jesus prophesied the destruction of the Temple and His glorious return.",
        theologicalSignificance: "The King cleansing His Father's house, silencing religious hypocrites, and warning His disciples to stay watchful.",
        era: "Holy Week (AD 30)"
      };
    }
    if (chapterNum <= 27) {
      return {
        locationName: "Gethsemane, Praetorium & Golgotha (Jerusalem)",
        shortPlaceName: "Gethsemane & Golgotha",
        modernLocation: "Mount of Olives & Church of the Holy Sepulchre, Jerusalem",
        lat: 31.7785,
        lng: 35.2297,
        zoom: 13,
        settingTitle: "Setting: The Crucifixion of the King",
        description: "The agony in the olive press of Gethsemane, the Roman scourging at Pilate's judgment seat, and the Place of the Skull where the veil of the Temple was torn in two.",
        theologicalSignificance: "The ransom paid in full; the Roman centurion's confession: 'Truly this was the Son of God!'",
        era: "Passover (AD 30)"
      };
    }
    return {
      locationName: "The Garden Tomb & The Mountain in Galilee",
      shortPlaceName: "The Empty Tomb & Galilee",
      modernLocation: "Jerusalem & Galilee, Israel",
      lat: 32.8800,
      lng: 35.5500,
      zoom: 11,
      settingTitle: "Setting: The Resurrection & The Great Commission",
      description: "The rolled-away stone of the empty tomb on Easter morning and the mountain in Galilee where the risen Christ commissioned His church.",
      theologicalSignificance: "'All authority in heaven and on earth has been given to me. Go therefore and make disciples of all nations... and behold, I am with you always' (Matt 28:18-20).",
      era: "Post-Resurrection (AD 30)"
    };
  }

  if (b === 'mark') {
    if (chapterNum <= 10) {
      return {
        locationName: "Sea of Galilee & Decapolis (The Servant's Path)",
        shortPlaceName: "Galilee & Decapolis",
        modernLocation: "Northern Israel & Golan Heights",
        lat: 32.8806,
        lng: 35.5750,
        zoom: 11,
        settingTitle: "Setting: The Rapid Servant Ministry in Galilee",
        description: "The fast-paced ministry corridor of Galilee, Tyre, Sidon, and the Decapolis where the Servant of the Lord healed, cast out demons, and proclaimed the kingdom.",
        theologicalSignificance: "The Gospel of Action: 'Immediately the Spirit drove Him... for the Son of Man came to serve.'",
        era: "Galilean Ministry (AD 27–29)"
      };
    }
    return {
      locationName: "Jerusalem (Passion Week & Calvary)",
      shortPlaceName: "Jerusalem (Calvary)",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2340,
      zoom: 13,
      settingTitle: "Setting: The Suffering Servant in Jerusalem",
      description: "The Triumphal Entry, the clearing of the Temple, Gethsemane, the cross at Golgotha, and the young man in white announcing: 'He has risen; He is not here.'",
      theologicalSignificance: "The climax of the Suffering Servant's mission.",
      era: "Passion Week (AD 30)"
    };
  }

  if (b === 'luke') {
    if (chapterNum <= 2) {
      return {
        locationName: "Nazareth, Judean Hill Country & Bethlehem",
        shortPlaceName: "Nazareth & Bethlehem",
        modernLocation: "Lower Galilee & West Bank",
        lat: 31.7054,
        lng: 35.2024,
        zoom: 11,
        settingTitle: "Setting: The Annunciation & Nativity",
        description: "The hill country home of Zechariah and Elizabeth, Mary's humble cottage in Nazareth, and the manger of Bethlehem wrapped in swaddling clothes.",
        theologicalSignificance: "The Magnificat, the Benedictus, the Gloria in Excelsis, and the Nunc Dimittis celebrating the dawn of universal salvation.",
        era: "Roman Judea (c. 5 BC)"
      };
    }
    if (chapterNum <= 9) {
      return {
        locationName: "Nazareth, Capernaum, & Lake Gennesaret",
        shortPlaceName: "Galilee & Capernaum",
        modernLocation: "Galilee, Israel",
        lat: 32.8806,
        lng: 35.5750,
        zoom: 11,
        settingTitle: "Setting: Galilee of the Gentiles",
        description: "The synagogue of Nazareth where Jesus announced the Jubilee of the Lord (Luke 4) and the towns of Galilee where outcasts, tax collectors, and women followed Him.",
        theologicalSignificance: "The Savior of all humanity reaching the poor, brokenhearted, captives, and blind.",
        era: "Galilean Ministry"
      };
    }
    if (chapterNum <= 18) {
      return {
        locationName: "The Travel Narrative Toward Jerusalem",
        shortPlaceName: "The Way to Jerusalem",
        modernLocation: "Samaria & Perea",
        lat: 32.1000,
        lng: 35.4000,
        zoom: 10,
        settingTitle: "Setting: The Journey to Jerusalem",
        description: "The central travel section of Luke's gospel where Jesus set His face resolutely to go to Jerusalem, teaching the Good Samaritan and the Prodigal Son.",
        theologicalSignificance: "'For the Son of Man came to seek and to save the lost' (Luke 19:10).",
        era: "Final Journey (AD 29–30)"
      };
    }
    if (chapterNum <= 23) {
      return {
        locationName: "Jerusalem (The Temple & The Place of a Skull)",
        shortPlaceName: "Jerusalem",
        modernLocation: "Old City Jerusalem",
        lat: 31.7780,
        lng: 35.2340,
        zoom: 13,
        settingTitle: "Setting: The Passion in Jerusalem",
        description: "The Upper Room, the bloody sweat of Gethsemane, the trial before Herod Antipas, and the prayer on the cross: 'Father, forgive them, for they know not what they do.'",
        theologicalSignificance: "The perfect Son of Man dying as the substitute for the guilty; paradise promised to the repentant thief.",
        era: "Passover (AD 30)"
      };
    }
    return {
      locationName: "The Emmaus Road & Bethany (Mount of Olives)",
      shortPlaceName: "Emmaus & Bethany",
      modernLocation: "Western Judean Hills & Mount of Olives",
      lat: 31.8380,
      lng: 35.0020,
      zoom: 11,
      settingTitle: "Setting: The Emmaus Walk & Ascension",
      description: "The seven-mile road to Emmaus where the risen Christ opened the Scriptures to Cleopas, and the summit of Mount Olivet at Bethany where He was lifted up into heaven.",
      theologicalSignificance: "'Did not our hearts burn within us while He talked to us on the road?' — Christ the center of all the Law, Prophets, and Psalms.",
      era: "Post-Resurrection (AD 30)"
    };
  }

  if (b === 'john') {
    if (chapterNum === 1) {
      return {
        locationName: "Bethany Beyond the Jordan (The Place of John's Baptism)",
        shortPlaceName: "Bethany Beyond Jordan",
        modernLocation: "Al-Maghtas, Jordan",
        lat: 31.8386,
        lng: 35.5492,
        zoom: 12,
        settingTitle: "Setting: The Lamb of God at the Jordan",
        description: "The river ford opposite Jericho where the Baptist pointed to Jesus: 'Behold, the Lamb of God, who takes away the sin of the world!'",
        theologicalSignificance: "The Incarnation: 'The Word became flesh and dwelt among us' (John 1:14).",
        era: "c. AD 26"
      };
    }
    if (chapterNum === 2) {
      return {
        locationName: "Cana of Galilee & The Temple Courts in Jerusalem",
        shortPlaceName: "Cana & Jerusalem",
        modernLocation: "Kafr Kanna & Old City Jerusalem",
        lat: 32.7460,
        lng: 35.3380,
        zoom: 10,
        settingTitle: "Setting: Cana Wedding & First Cleansing of Temple",
        description: "The village wedding feast where Jesus turned water into wine, and the Temple Mount where He made a whip of cords: 'Destroy this temple, and in three days I will raise it up.'",
        theologicalSignificance: "The first sign manifesting His glory; Christ the true Temple.",
        era: "First Passover of Ministry (AD 27)"
      };
    }
    if (chapterNum === 3) {
      return {
        locationName: "Jerusalem (Night Discourse with Nicodemus)",
        shortPlaceName: "Jerusalem",
        modernLocation: "Old City Jerusalem",
        lat: 31.7767,
        lng: 35.2342,
        zoom: 13,
        settingTitle: "Setting: Night Visit in Jerusalem",
        description: "The quiet rooftop in Jerusalem where Pharisee ruler Nicodemus came by night and heard: 'Unless one is born again he cannot see the kingdom of God.'",
        theologicalSignificance: "The golden verse of Scripture: 'For God so loved the world, that He gave His only Son' (John 3:16).",
        era: "AD 27"
      };
    }
    if (chapterNum === 4) {
      return {
        locationName: "Jacob's Well at Sychar (Samaria)",
        shortPlaceName: "Sychar (Jacob's Well)",
        modernLocation: "Balata al-Balad / Nablus, West Bank",
        lat: 32.2133,
        lng: 35.2819,
        zoom: 12,
        settingTitle: "Setting: The Woman at Jacob's Well",
        description: "The 100-foot deep limestone well dug by Jacob at the foot of Mount Gerizim where weary Jesus asked for a drink at noon.",
        theologicalSignificance: "The Living Water; worship in spirit and truth; the Savior of the world.",
        era: "AD 27"
      };
    }
    if (chapterNum === 5) {
      return {
        locationName: "Pool of Bethesda (Near the Sheep Gate, Jerusalem)",
        shortPlaceName: "Pool of Bethesda",
        modernLocation: "Muslim Quarter / St. Anne's compound, Jerusalem",
        lat: 31.7814,
        lng: 35.2364,
        zoom: 13,
        settingTitle: "Setting: Healing at Bethesda Pool",
        description: "The double-pool complex with five colonnades where Jesus healed the man paralyzed for 38 years on the Sabbath.",
        theologicalSignificance: "Christ's divine equality with the Father: 'My Father is working until now, and I am working' (John 5:17).",
        era: "Feast in Jerusalem (AD 28)"
      };
    }
    if (chapterNum === 6) {
      return {
        locationName: "Sea of Galilee & The Synagogue of Capernaum",
        shortPlaceName: "Capernaum & Lake",
        modernLocation: "Northern Sea of Galilee, Israel",
        lat: 32.8806,
        lng: 35.5750,
        zoom: 11,
        settingTitle: "Setting: Bread of Life Discourse",
        description: "The grassy hillside of the 5,000, walking on the stormy lake, and the limestone synagogue of Capernaum.",
        theologicalSignificance: "'I am the bread of life; whoever comes to me shall not hunger, and whoever believes in me shall never thirst' (John 6:35).",
        era: "Passover (AD 29)"
      };
    }
    if (chapterNum <= 10) {
      return {
        locationName: "The Temple Courts & Pool of Siloam (Jerusalem)",
        shortPlaceName: "Temple & Pool of Siloam",
        modernLocation: "Temple Mount & City of David, Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 13,
        settingTitle: "Setting: Feast of Tabernacles & Hanukkah",
        description: "The Court of Women during the illumination of the Temple: 'I am the light of the world,' the Pool of Siloam healing the blind man, and the Good Shepherd discourse.",
        theologicalSignificance: "Christ the True Light, Living Water, and Good Shepherd who lays down His life for the sheep.",
        era: "Autumn & Winter (AD 29)"
      };
    }
    if (chapterNum <= 12) {
      return {
        locationName: "Bethany (The Tomb of Lazarus)",
        shortPlaceName: "Bethany",
        modernLocation: "Al-Eizariya, East of Jerusalem, West Bank",
        lat: 31.7710,
        lng: 35.2600,
        zoom: 12,
        settingTitle: "Setting: Resurrection of Lazarus in Bethany",
        description: "The hillside village on the eastern slope of Mount Olivet where Jesus wept at the four-day-old tomb: 'Lazarus, come out!'",
        theologicalSignificance: "'I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live' (John 11:25).",
        era: "Final Weeks Before Passover (AD 30)"
      };
    }
    if (chapterNum <= 17) {
      return {
        locationName: "The Upper Room on Mount Zion (The Cenacle)",
        shortPlaceName: "The Upper Room (Cenacle)",
        modernLocation: "Mount Zion, Old City Jerusalem",
        lat: 31.7720,
        lng: 35.2290,
        zoom: 14,
        settingTitle: "Setting: The Last Supper & Farewell Discourse",
        description: "The second-story dining room on Mount Zion where Jesus girded Himself with a towel to wash the disciples' feet and delivered His intimate Farewell Discourse.",
        theologicalSignificance: "'I am the way, and the truth, and the life' (John 14:6); the promise of the Holy Spirit (Paraclete); the True Vine; Christ's High Priestly Prayer (John 17).",
        era: "Maundy Thursday Night (AD 30)"
      };
    }
    if (chapterNum <= 19) {
      return {
        locationName: "Gethsemane, Praetorium & Golgotha (Jerusalem)",
        shortPlaceName: "Gethsemane & Golgotha",
        modernLocation: "Kidron Valley & Church of the Holy Sepulchre, Jerusalem",
        lat: 31.7785,
        lng: 35.2297,
        zoom: 13,
        settingTitle: "Setting: The King Crowned with Thorns",
        description: "The garden across the Kidron brook, the Lithostrotos (Stone Pavement) before Pilate, and the cross of Calvary: 'It is finished!'",
        theologicalSignificance: "The Lamb of God sacrificed for the sins of the world; blood and water flowing from His pierced side.",
        era: "Good Friday (Passover, AD 30)"
      };
    }
    if (chapterNum === 20) {
      return {
        locationName: "The Garden Tomb & The Locked Upper Room",
        shortPlaceName: "Garden Tomb & Upper Room",
        modernLocation: "Old City Jerusalem",
        lat: 31.7830,
        lng: 35.2300,
        zoom: 13,
        settingTitle: "Setting: The Resurrection Appearances",
        description: "The empty garden sepulchre where Mary Magdalene heard her name called: 'Rabboni!' and the locked room where Thomas touched the nail marks: 'My Lord and my God!'",
        theologicalSignificance: "'These are written so that you may believe that Jesus is the Christ, the Son of God, and that by believing you may have life in His name' (John 20:31).",
        era: "Easter Season (AD 30)"
      };
    }
    return {
      locationName: "The Shore of the Sea of Tiberias (Galilee)",
      shortPlaceName: "Shore of Sea of Galilee",
      modernLocation: "Tabgha / Church of the Primacy of Peter, Galilee, Israel",
      lat: 32.8730,
      lng: 35.5490,
      zoom: 12,
      settingTitle: "Setting: Breakfast on the Shore & Peter Restored",
      description: "The charcoal fire on the morning shore where Jesus provided 153 fish and restored thrice-denying Peter: 'Simon, son of John, do you love me? Feed my sheep.'",
      theologicalSignificance: "Grace restoring the fallen shepherd; the enduring call: 'Follow me.'",
      era: "Post-Resurrection (AD 30)"
    };
  }

  if (b === 'acts') {
    if (chapterNum <= 7) {
      return {
        locationName: "Jerusalem (Mount of Olives & The Temple Courts)",
        shortPlaceName: "Jerusalem",
        modernLocation: "Old City Jerusalem",
        lat: 31.7780,
        lng: 35.2354,
        zoom: 12,
        settingTitle: "Setting: Birth & Growth of the Church in Jerusalem",
        description: "The Upper Room at Pentecost, the Beautiful Gate of the Temple, the Solomon's Colonnade healing, and the trial and stoning of Stephen.",
        theologicalSignificance: "'You will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem' (Acts 1:8).",
        era: "Early Church (AD 30–34)"
      };
    }
    if (chapterNum <= 9) {
      return {
        locationName: "Samaria, Gaza Desert Road & Damascus",
        shortPlaceName: "Samaria to Damascus",
        modernLocation: "West Bank, Gaza & Syria",
        lat: 33.5111,
        lng: 36.3064,
        zoom: 8,
        settingTitle: "Setting: Philip in Samaria & Saul's Conversion",
        description: "Philip's revival in Samaria, the conversion of the Ethiopian eunuch on the road to Gaza, and the blinding light on the road to Damascus that converted Saul of Tarsus.",
        theologicalSignificance: "Gospel expanding to Samaria and the ends of the earth; the chief persecutor transformed into the chosen apostle to the Gentiles.",
        era: "c. AD 34–37"
      };
    }
    if (chapterNum <= 12) {
      return {
        locationName: "Caesarea Maritima & Syrian Antioch",
        shortPlaceName: "Caesarea & Antioch",
        modernLocation: "Israeli Coast & Antakya, Turkey",
        lat: 32.5010,
        lng: 34.8910,
        zoom: 8,
        settingTitle: "Setting: Cornelius Converted & Antioch Church",
        description: "Peter's vision on the rooftop in Joppa leading to Roman centurion Cornelius in Caesarea, and the vibrant Gentile mother church in Syrian Antioch.",
        theologicalSignificance: "The door of faith opened to the Gentiles without circumcision: 'The disciples were first called Christians in Antioch' (Acts 11:26).",
        era: "c. AD 40–44"
      };
    }
    if (chapterNum <= 14) {
      return {
        locationName: "Cyprus, Pamphylia & Galatia (First Journey)",
        shortPlaceName: "First Missionary Journey",
        modernLocation: "Cyprus & South-Central Turkey",
        lat: 37.5000,
        lng: 32.5000,
        zoom: 7,
        settingTitle: "Setting: First Missionary Journey",
        description: "The pioneering mission of Paul and Barnabas through Salamis, Paphos, Perga, Pisidian Antioch, Iconium, Lystra, and Derbe.",
        theologicalSignificance: "Churches planted across Asia Minor; suffering and stoning at Lystra: 'Through many tribulations we must enter the kingdom of God.'",
        era: "First Missionary Journey (AD 46–48)"
      };
    }
    if (chapterNum === 15) {
      return {
        locationName: "Jerusalem (The Apostolic Council)",
        shortPlaceName: "Jerusalem Council",
        modernLocation: "Old City Jerusalem",
        lat: 31.7767,
        lng: 35.2342,
        zoom: 13,
        settingTitle: "Setting: The Jerusalem Council",
        description: "The solemn gathering of the apostles and elders in Jerusalem with Paul, Barnabas, Peter, and James resolving that Gentile believers are saved by grace through faith apart from the Law.",
        theologicalSignificance: "Preservation of the purity of the Gospel of Grace: 'We believe that we will be saved through the grace of the Lord Jesus, just as they will' (Acts 15:11).",
        era: "c. AD 49"
      };
    }
    if (chapterNum <= 18) {
      return {
        locationName: "Philippi, Athens, & Corinth (Second Journey)",
        shortPlaceName: "Greece (Philippi to Corinth)",
        modernLocation: "Northern & Southern Greece",
        lat: 37.9060,
        lng: 22.8800,
        zoom: 7,
        settingTitle: "Setting: Gospel Enters Europe",
        description: "The Macedonian call, the midnight prison praise in Philippi, Paul's sermon on Mars Hill (Areopagus) in Athens, and eighteen months planting the church in Corinth.",
        theologicalSignificance: "The Gospel conquering Greco-Roman culture: 'He made from one man every nation... that they should seek God' (Acts 17:26-27).",
        era: "Second Missionary Journey (AD 49–52)"
      };
    }
    if (chapterNum <= 20) {
      return {
        locationName: "Ephesus & The Aegean (Third Journey)",
        shortPlaceName: "Ephesus & Aegean",
        modernLocation: "Selcuk / Izmir, Turkey",
        lat: 37.9400,
        lng: 27.3400,
        zoom: 8,
        settingTitle: "Setting: Ministry in Ephesus",
        description: "Over two years teaching daily in the Hall of Tyrannus in Ephesus, the riot in the great theater of Artemis, and the tearful farewell to the Ephesian elders at Miletus.",
        theologicalSignificance: "Idols forsaken throughout Asia; the whole counsel of God declared without compromise.",
        era: "Third Missionary Journey (AD 53–57)"
      };
    }
    if (chapterNum <= 26) {
      return {
        locationName: "Jerusalem & Caesarea Maritima (Paul's Trials)",
        shortPlaceName: "Caesarea Trials",
        modernLocation: "Caesarea Maritima, Mediterranean Coast, Israel",
        lat: 32.5010,
        lng: 34.8910,
        zoom: 11,
        settingTitle: "Setting: Paul in Chains at Caesarea",
        description: "Paul's arrest in the Temple of Jerusalem, night transfer to Caesarea, and defense speeches before Roman governors Felix, Festus, and King Herod Agrippa II.",
        theologicalSignificance: "Paul's appeal to Caesar: God's sovereignty directing His messenger to the capital of the world.",
        era: "c. AD 57–59"
      };
    }
    return {
      locationName: "Malta to Rome (The Voyage & Roman Prison)",
      shortPlaceName: "Malta to Rome",
      modernLocation: "Malta & Rome, Italy",
      lat: 41.8900,
      lng: 12.4850,
      zoom: 7,
      settingTitle: "Setting: Shipwreck on Malta & House Arrest in Rome",
      description: "The terrifying two-week Euroclydon storm, shipwreck on St. Paul's Bay in Malta, and Paul living for two years in his own rented house in Rome proclaiming the kingdom unhindered.",
      theologicalSignificance: "The triumphant conclusion of Acts: 'Proclaiming the kingdom of God and teaching about the Lord Jesus Christ with all boldness and without hindrance' (Acts 28:31).",
      era: "c. AD 60–62"
    };
  }

  // ==========================================================================
  // EPISTLES & REVELATION
  // ==========================================================================
  if (b === 'romans') {
    return {
      locationName: "Corinth (Composed to the Church in Rome)",
      shortPlaceName: "Corinth (Sent to Rome)",
      modernLocation: "Corinth, Greece (addressed to Rome, Italy)",
      lat: 37.9060,
      lng: 22.8800,
      zoom: 11,
      settingTitle: "Setting: Paul Composing Romans in Corinth",
      description: "Paul lodged in the house of Gaius in Corinth during the winter of AD 57, dictating his masterpiece of Christian theology to Tertius to send to Rome via Phoebe.",
      theologicalSignificance: "The righteousness of God revealed through faith in Christ; justification by faith alone; life in the Spirit (Romans 8).",
      era: "Winter AD 57 (Third Missionary Journey)"
    };
  }

  if (b === '1corinthians') {
    return {
      locationName: "Ephesus (Written to the Church in Corinth)",
      shortPlaceName: "Ephesus (Sent to Corinth)",
      modernLocation: "Selcuk, Turkey",
      lat: 37.9400,
      lng: 27.3400,
      zoom: 11,
      settingTitle: "Setting: Written from Ephesus to Corinth",
      description: "Paul writing from the major metropolis of Ephesus during his three-year ministry to address divisions, morality, spiritual gifts, and the resurrection in Corinth.",
      theologicalSignificance: "The message of the cross (1 Cor 1); love the greatest virtue (1 Cor 13); the historical certainty of the resurrection (1 Cor 15).",
      era: "c. AD 55"
    };
  }

  if (b === '2corinthians') {
    return {
      locationName: "Macedonia (Written to the Church in Corinth)",
      shortPlaceName: "Macedonia (Sent to Corinth)",
      modernLocation: "Philippi / Thessalonica, Northern Greece",
      lat: 41.0100,
      lng: 24.2800,
      zoom: 10,
      settingTitle: "Setting: Written from Macedonia to Corinth",
      description: "Paul writing with profound vulnerability and relief from Macedonia after Titus brought encouraging news of the Corinthians' repentance.",
      theologicalSignificance: "Treasures in earthen vessels; the ministry of reconciliation; 'My grace is sufficient for you, for my power is made perfect in weakness' (2 Cor 12:9).",
      era: "Autumn AD 55 / 56"
    };
  }

  if (b === 'galatians') {
    return {
      locationName: "Syrian Antioch (Written to Churches of Galatia)",
      shortPlaceName: "Antioch (Sent to Galatia)",
      modernLocation: "Antakya, Turkey",
      lat: 36.2021,
      lng: 36.1606,
      zoom: 11,
      settingTitle: "Setting: Written from Antioch to Galatia",
      description: "Paul writing with fierce urgency from Syrian Antioch to the newly planted churches of southern Galatia (Pisidian Antioch, Iconium, Lystra, Derbe) against Judaizers.",
      theologicalSignificance: "The Magna Carta of Christian Liberty: 'For freedom Christ has set us free' (Gal 5:1); justified by faith apart from the works of the Law.",
      era: "c. AD 48–49 (Prior to Jerusalem Council)"
    };
  }

  if (b === 'ephesians' || b === 'colossians' || b === 'philemon') {
    return {
      locationName: "Rome (Paul's Roman House Arrest)",
      shortPlaceName: "Rome (Prison Epistles)",
      modernLocation: "Rome, Italy",
      lat: 41.8900,
      lng: 12.4850,
      zoom: 11,
      settingTitle: "Setting: Paul in Chains in Rome",
      description: "Paul chained to a Roman imperial guard in his rented quarters in Rome, sending Tychicus and Onesimus with letters to the churches of Asia Minor.",
      theologicalSignificance: "The cosmic supremacy and headship of Christ over the Church (Colossians); the mystery of the Church and the armor of God (Ephesians).",
      era: "First Roman Imprisonment (c. AD 60–62)"
    };
  }

  if (b === 'philippians') {
    return {
      locationName: "Rome (Paul's Roman House Arrest)",
      shortPlaceName: "Rome (To Philippi)",
      modernLocation: "Rome, Italy",
      lat: 41.8900,
      lng: 12.4850,
      zoom: 11,
      settingTitle: "Setting: Epistle of Joy from Roman Prison",
      description: "Paul writing from Roman custody to his beloved first European congregation in Philippi after Epaphroditus brought their sacrificial gift.",
      theologicalSignificance: "Unquenchable joy in suffering; the great Christ-hymn (Kenosis, Phil 2:5-11); 'To live is Christ, and to die is gain.'",
      era: "c. AD 61–62"
    };
  }

  if (b === '1thessalonians' || b === '2thessalonians') {
    return {
      locationName: "Corinth (Written to the Church in Thessalonica)",
      shortPlaceName: "Corinth (To Thessalonica)",
      modernLocation: "Corinth, Greece",
      lat: 37.9060,
      lng: 22.8800,
      zoom: 11,
      settingTitle: "Setting: Written from Corinth to Thessalonica",
      description: "Paul's earliest letters, written shortly after his arrival in Corinth when Timothy brought good tidings of the steadfast faith of the persecuted Thessalonian believers.",
      theologicalSignificance: "The blessed hope of Christ's Second Coming, the resurrection of the dead in Christ, and holy endurance.",
      era: "c. AD 50–51"
    };
  }

  if (b === '1timothy' || b === 'titus') {
    return {
      locationName: "Macedonia & Nicopolis (Pastoral Epistles)",
      shortPlaceName: "Macedonia / Nicopolis",
      modernLocation: "Northern & Western Greece",
      lat: 38.9600,
      lng: 20.7300,
      zoom: 10,
      settingTitle: "Setting: Pastoral Guidance for the Church",
      description: "Paul traveling in Greece after his release from his first Roman imprisonment, writing to Timothy in Ephesus and Titus in Crete regarding church leadership and sound doctrine.",
      theologicalSignificance: "Order in the household of God, qualifications for overseers and deacons, and the mystery of godliness.",
      era: "c. AD 63–65"
    };
  }

  if (b === '2timothy') {
    return {
      locationName: "The Mamertine Dungeon (Rome)",
      shortPlaceName: "Rome (Mamertine Prison)",
      modernLocation: "Tullianum / Mamertine Prison, Forum Romanum, Rome, Italy",
      lat: 41.8930,
      lng: 12.4840,
      zoom: 13,
      settingTitle: "Setting: Paul's Final Letter from Death Row",
      description: "The cold underground Roman dungeon during the fierce Neronian persecution where Paul sat in chains awaiting his execution, writing his last words to beloved Timothy.",
      theologicalSignificance: "'I have fought the good fight, I have finished the race, I have kept the faith' (2 Tim 4:7); the divine inspiration and sufficiency of Scripture.",
      era: "c. AD 66–67 (Shortly Before Martyrdom)"
    };
  }

  if (b === 'hebrews') {
    return {
      locationName: "Rome / Jerusalem (Addressed to Jewish Christians)",
      shortPlaceName: "Rome / Jerusalem",
      modernLocation: "Mediterranean Biblical World",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 11,
      settingTitle: "Setting: Addressed to Hebrew Believers Under Trial",
      description: "Written to second-generation Jewish-Christians facing severe persecution and tempted to retreat back into the shadows of the Old Covenant Temple rituals.",
      theologicalSignificance: "The absolute supremacy and finality of Jesus Christ: greater than angels, Moses, and the Levitical priesthood; our eternal Great High Priest.",
      era: "Pre-70 AD (Before the Fall of the Temple)"
    };
  }

  if (b === 'james') {
    return {
      locationName: "Jerusalem (The Mother Church)",
      shortPlaceName: "Jerusalem",
      modernLocation: "Old City Jerusalem",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 12,
      settingTitle: "Setting: James the Just in Jerusalem",
      description: "James, the brother of the Lord and leader of the Jerusalem church, writing to the twelve tribes scattered in the diaspora.",
      theologicalSignificance: "Faith that works: genuine saving faith proven through active deeds of mercy, tongue-bridling, and patience in trial.",
      era: "c. AD 45–48"
    };
  }

  if (b === '1peter' || b === '2peter') {
    return {
      locationName: "Rome (Code-Named 'Babylon')",
      shortPlaceName: "Rome ('Babylon')",
      modernLocation: "Rome, Italy",
      lat: 41.8900,
      lng: 12.4850,
      zoom: 11,
      settingTitle: "Setting: Peter in Rome Facing Nero's Fires",
      description: "The Apostle Peter writing from the imperial capital of Rome ('she who is at Babylon,' 1 Pet 5:13) to elect exiles scattered across Asia Minor.",
      theologicalSignificance: "A living hope through Christ's resurrection, suffering for righteousness, and the sure prophetic word shining like a lamp in a dark place.",
      era: "c. AD 64–67 (Neronian Persecution)"
    };
  }

  if (b === '1john' || b === '2john' || b === '3john') {
    return {
      locationName: "Ephesus (The Apostle John's Late Ministry)",
      shortPlaceName: "Ephesus",
      modernLocation: "Selcuk, Izmir Province, Turkey",
      lat: 37.9400,
      lng: 27.3400,
      zoom: 11,
      settingTitle: "Setting: The Apostle of Love in Ephesus",
      description: "Aged Apostle John pastoring the churches of Asia Minor from Ephesus, combating early Gnostic docetism that denied Christ came in the flesh.",
      theologicalSignificance: "'God is love' (1 John 4:8); assurance of eternal life through walking in the light, loving the brethren, and confessing the Son.",
      era: "c. AD 85–95"
    };
  }

  if (b === 'jude') {
    return {
      locationName: "Jerusalem / Judean Homeland",
      shortPlaceName: "Jerusalem / Judea",
      modernLocation: "Judea, Israel",
      lat: 31.7780,
      lng: 35.2354,
      zoom: 11,
      settingTitle: "Setting: Contending for the Faith",
      description: "Jude, the brother of James and half-brother of Jesus, urging believers to contend earnestly for the faith once for all delivered to the saints against false teachers.",
      theologicalSignificance: "Glorious closing doxology: 'Now to Him who is able to keep you from stumbling and to present you blameless before the presence of His glory with great joy' (Jude 24).",
      era: "c. AD 65–80"
    };
  }

  if (b === 'revelation') {
    return {
      locationName: "The Island of Patmos (Aegean Sea)",
      shortPlaceName: "Island of Patmos",
      modernLocation: "Patmos, Dodecanese, Greece",
      lat: 37.3270,
      lng: 26.5440,
      zoom: 10,
      settingTitle: "Setting: The Apocalypse on Patmos",
      description: "The rugged volcanic penal island in the Aegean Sea where the Apostle John was exiled under Emperor Domitian 'for the word of God and the testimony of Jesus.'",
      theologicalSignificance: "The Revelation of Jesus Christ: the glorified Lamb, the final defeat of Satan and death, and the descent of the New Jerusalem: 'Behold, I am making all things new' (Rev 21:5).",
      era: "c. AD 95–96 (Reign of Domitian)"
    };
  }

  // Universal Biblical World Fallback
  return {
    locationName: "Jerusalem (The Holy City)",
    shortPlaceName: "Jerusalem",
    modernLocation: "Old City Jerusalem",
    lat: 31.7767,
    lng: 35.2342,
    zoom: 11,
    settingTitle: `Setting: ${bookId} Chapter ${chapterNum}`,
    description: "The historic city of God and focal center of redemptive biblical history.",
    theologicalSignificance: "The central stage of God's covenant dealings with humanity.",
    era: "Biblical Era"
  };
}
