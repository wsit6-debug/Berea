export interface Verse {
  verseNumber: number;
  text: Record<string, string>; // e.g. { KJV: "...", ESV: "...", NIV: "...", NLT: "...", NASB: "..." }
  isWordsOfJesus?: boolean;
  notes?: string;
  crossRefs?: string[];
  greekHebrew?: {
    word: string;
    transliteration: string;
    strongs: string;
    definition: string;
  }[];
}

export interface Chapter {
  chapterNumber: number;
  summary: string;
  verses: Verse[];
  locationKey?: string;
}

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'OT' | 'NT';
  category: 'Law' | 'History' | 'Poetry' | 'Wisdom' | 'Major Prophets' | 'Minor Prophets' | 'Gospels' | 'Pauline Epistles' | 'General Epistles' | 'Prophecy';
  chaptersCount: number;
  author: string;
  dateWritten: string;
  theme: string;
  keyVerse: string;
  chapters?: Record<number, Chapter>;
}

import { DenominationalLens } from './theologyData';
import { SupportedLanguage } from '../i18n/types';

export interface TranslationInfo {
  id: string;
  apiCode: string;
  name: string;
  year: string;
  philosophy: string;
  badge: string;
  approvedDenominations: DenominationalLens[];
  description: string;
  isCanonDeuterocanon?: boolean;
  language?: SupportedLanguage;
}

export const TRANSLATIONS: TranslationInfo[] = [
  {
    id: "NABRE",
    apiCode: "NABRE",
    name: "New American Bible (Revised Edition)",
    year: "2011",
    philosophy: "Formal / Critical",
    badge: "USCCB Official Liturgical",
    approvedDenominations: ["catholic","anglican"],
    description: "The official liturgical and lectionary translation of the Catholic Church in the United States, containing the full Catholic canon with Deuterocanonical books.",
    isCanonDeuterocanon: true,
  },
  {
    id: "RSVCE",
    apiCode: "RSV2CE",
    name: "Revised Standard Version (Catholic Edition)",
    year: "1966",
    philosophy: "Word-for-Word (Formal)",
    badge: "Ignatius Bible / CCC Standard",
    approvedDenominations: ["catholic"],
    description: "Highly acclaimed for theological precision, used in the English Catechism of the Catholic Church and the Ignatius Catholic Study Bible.",
    isCanonDeuterocanon: true,
  },
  {
    id: "NRSVCE",
    apiCode: "NRSVCE",
    name: "New Revised Standard Version (Catholic Edition)",
    year: "1993",
    philosophy: "Formal Equivalence",
    badge: "USCCB & CCCB Approved",
    approvedDenominations: ["catholic","anglican"],
    description: "Authorized by the USCCB and Canadian Conference of Catholic Bishops for lectionary and academic study.",
    isCanonDeuterocanon: true,
  },
  {
    id: "DRB",
    apiCode: "DRB",
    name: "Douay-Rheims Bible (Challoner Revision)",
    year: "1899",
    philosophy: "Traditional Latin Vulgate",
    badge: "Traditional Catholic Heritage",
    approvedDenominations: ["catholic"],
    description: "Historic English Catholic translation translated directly from the Latin Vulgate of St. Jerome, revered for traditional Catholic dogmatics.",
    isCanonDeuterocanon: true,
  },
  {
    id: "NJB",
    apiCode: "NJB1985",
    name: "New Jerusalem Bible",
    year: "1985",
    philosophy: "Dynamic Equivalence",
    badge: "Catholic Scholarly",
    approvedDenominations: ["catholic"],
    description: "Widely used in Catholic liturgy and scholarship outside North America, praised for its literary beauty.",
    isCanonDeuterocanon: true,
  },
  {
    id: "NKJV",
    apiCode: "NKJV",
    name: "New King James Version (OSB Base)",
    year: "1982",
    philosophy: "Complete Formal Equivalence",
    badge: "Orthodox Study Bible Base",
    approvedDenominations: ["orthodox","baptist_evangelical","lutheran"],
    description: "Preserves the Byzantine / Textus Receptus tradition, serving as the New Testament foundation for the Orthodox Study Bible (OSB).",
  },
  {
    id: "RSV",
    apiCode: "RSV",
    name: "Revised Standard Version (with Apocrypha)",
    year: "1952",
    philosophy: "Word-for-Word (Formal)",
    badge: "Ecumenical & Orthodox Standard",
    approvedDenominations: ["orthodox","anglican"],
    description: "Widely endorsed across Eastern Orthodox jurisdictions and Western Christendom for scholarly fidelity.",
  },
  {
    id: "ESV",
    apiCode: "ESV",
    name: "English Standard Version",
    year: "2001",
    philosophy: "Essentially Literal (Word-for-Word)",
    badge: "Reformation Study Standard",
    approvedDenominations: ["reformed","lutheran","anglican","baptist_evangelical","wesleyan"],
    description: "The standard translation for the Reformation Study Bible, PCA, OPC, and modern confessional Protestant theology.",
  },
  {
    id: "GENEVA",
    apiCode: "GNV",
    name: "1599 Geneva Bible (Puritan Edition)",
    year: "1599",
    philosophy: "Historic Reformation Formal",
    badge: "Puritan / Westminster Heritage",
    approvedDenominations: ["reformed","anglican"],
    description: "The historic Bible of John Knox, Oliver Cromwell, the Westminster Divines, and the Mayflower Pilgrims.",
  },
  {
    id: "NASB",
    apiCode: "NASB",
    name: "New American Standard Bible",
    year: "1995",
    philosophy: "Strict Literal Equivalence",
    badge: "Academic Gold Standard",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran"],
    description: "Renowned in theological seminaries as the most precise word-for-word modern English translation for detailed grammatical exegesis.",
  },
  {
    id: "BSB",
    apiCode: "BSB",
    name: "Berean Standard Bible",
    year: "2020",
    philosophy: "Optimal Literal & Readable",
    badge: "Berea Namesake Edition",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran","wesleyan","anglican"],
    description: "Inspired by the Bereans of Acts 17:11, balancing strict fidelity to the Hebrew and Greek with transparent English clarity.",
  },
  {
    id: "LSB",
    apiCode: "LSB",
    name: "Legacy Standard Bible",
    year: "2021",
    philosophy: "Direct Literal Equivalence",
    badge: "Confessional Literal",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Update of the NASB 1995 preserving strict grammatical consistency and translating the divine name Yahweh in the OT.",
  },
  {
    id: "CSB",
    apiCode: "CSB17",
    name: "Christian Standard Bible",
    year: "2017",
    philosophy: "Optimal Equivalence",
    badge: "Southern Baptist Standard",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "The official translation of Lifeway and the Southern Baptist Convention (SBC), optimized for preaching and church life.",
  },
  {
    id: "NIV",
    apiCode: "NIV2011",
    name: "New International Version",
    year: "2011",
    philosophy: "Balance / Dynamic",
    badge: "Evangelical Classic",
    approvedDenominations: ["baptist_evangelical","wesleyan","anglican","lutheran","reformed"],
    description: "The most widely read modern English Bible in the world, renowned for clarity and natural readability.",
  },
  {
    id: "NLT",
    apiCode: "NLT",
    name: "New Living Translation",
    year: "2015",
    philosophy: "Thought-for-Thought",
    badge: "Contemporary Devotional",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Dynamic equivalence translation focused on immediate communicative clarity for discipleship and personal devotions.",
  },
  {
    id: "KJV",
    apiCode: "KJV",
    name: "King James Version (Authorized 1611)",
    year: "1611",
    philosophy: "Formal Equivalence",
    badge: "Royal Authorized Standard",
    approvedDenominations: ["anglican","orthodox","reformed","lutheran","wesleyan","baptist_evangelical"],
    description: "Commissioned by King James I for the Church of England, the historic cornerstone of English Protestantism and liturgy.",
  },
  {
    id: "NRSV",
    apiCode: "NRSVCE",
    name: "New Revised Standard Version",
    year: "1989",
    philosophy: "Formal Equivalence",
    badge: "Anglican & Academic Standard",
    approvedDenominations: ["anglican","wesleyan"],
    description: "The authorized standard for liturgical use in the Episcopal Church, Church of England, and academic biblical scholarship.",
  },
  {
    id: "CEB",
    apiCode: "CEB",
    name: "Common English Bible",
    year: "2011",
    philosophy: "Dynamic Equivalence",
    badge: "Methodist / Wesleyan Standard",
    approvedDenominations: ["wesleyan"],
    description: "Sponsored by the United Methodist Publishing House and partners for smooth congregational reading and ecumenical clarity.",
  },
  {
    id: "NET",
    apiCode: "NET",
    name: "New English Translation",
    year: "2007",
    philosophy: "Transparent Scholarly Equivalence",
    badge: "Scholarly Exegetical",
    approvedDenominations: ["reformed","baptist_evangelical","anglican"],
    description: "Created by premier biblical language scholars with comprehensive translator notes on Hebrew and Greek syntax.",
  },
  {
    id: "WEB",
    apiCode: "WEB",
    name: "World English Bible",
    year: "2000",
    philosophy: "Modern Literal (Public Domain)",
    badge: "Open Access Standard",
    approvedDenominations: ["baptist_evangelical","reformed","lutheran","wesleyan","anglican"],
    description: "Modern literal update of the American Standard Version, freely available and open for universal study.",
  },
  {
    id: "ASV",
    apiCode: "ASV",
    name: "American Standard Version",
    year: "1901",
    philosophy: "Historic Literal",
    badge: "Historical Benchmark",
    approvedDenominations: ["lutheran","reformed","baptist_evangelical"],
    description: "The landmark 1901 American revision prized for strict word-for-word fidelity.",
  },
  {
    id: "UBIO",
    apiCode: "UBIO",
    name: "Біблія в перекладі Івана Огієнка (1962)",
    year: "1962",
    philosophy: "Formal Equivalence",
    badge: "Ukrainian Protestant Standard",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran","wesleyan"],
    description: "The standard Ukrainian Bible translated from original tongues by Metropolitan Ilarion (Prof. Ivan Ohienko), published by the British and Foreign Bible Society.",
    language: 'uk' as any
  },
  {
    id: "UKRK",
    apiCode: "UKRK",
    name: "Біблія Куліша, Левицького, Пулюя (1903)",
    year: "1903",
    philosophy: "Formal Literary",
    badge: "First Complete Ukrainian Bible",
    approvedDenominations: ["reformed","orthodox"],
    description: "The historic first complete translation of the Bible into modern Ukrainian, published by the British and Foreign Bible Society in Vienna (1903).",
    language: 'uk' as any
  },
  {
    id: "HOM",
    apiCode: "HOM",
    name: "Святе Письмо в перекладі Івана Хоменка (1963)",
    year: "1963",
    philosophy: "Formal / Literary Catholic",
    badge: "Ukrainian Greek Catholic",
    approvedDenominations: ["catholic"],
    description: "The official Bible translation of the Ukrainian Greek Catholic Church, translated by Ivan Khomenko and published by the Basilian Order in Rome (1963).",
    isCanonDeuterocanon: true,
    language: 'uk' as any
  },
  {
    id: "UTT",
    apiCode: "UTT",
    name: "Українська Біблія LXX (Рафаїл Турконяк, 2011)",
    year: "2011",
    philosophy: "Formal / Septuagint Greek",
    badge: "LXX Canonical (77 Books)",
    approvedDenominations: ["orthodox"],
    description: "Complete 77-book Ukrainian Bible translated directly from the Greek Septuagint and Greek NT by Archimandrite Dr. Rafail Turkoniak (Ukrainian Bible Society, 2011).",
    isCanonDeuterocanon: true,
    language: 'uk' as any
  },
  {
    id: "UMT",
    apiCode: "UMT",
    name: "Свята Біблія: Сучасною мовою (2007)",
    year: "2007",
    philosophy: "Dynamic Equivalence",
    badge: "World Bible Translation Center",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Easy-to-read contemporary Ukrainian translation by the World Bible Translation Center (WBTC).",
    language: 'uk' as any
  },
  {
    id: "PHIL",
    apiCode: "PHIL",
    name: "Біблія в перекладі Патріарха Філарета (2004)",
    year: "2004",
    philosophy: "Formal / Byzantine Orthodox",
    badge: "Ukrainian Orthodox Standard",
    approvedDenominations: ["orthodox"],
    description: "Official Ukrainian Bible translation authorized by the Ukrainian Orthodox Church, prepared under the auspices of Patriarch Filaret (Denysenko, 2004).",
    isCanonDeuterocanon: true,
    language: 'uk' as any
  },
  {
    id: "CUV23",
    apiCode: "CUV23",
    name: "Біблія. Сучасний переклад УБТ (2023)",
    year: "2023",
    philosophy: "Optimal Contemporary",
    badge: "UBS 4th Edition",
    approvedDenominations: ["reformed","baptist_evangelical","wesleyan"],
    description: "Latest 4th edition modern literary translation produced by the Ukrainian Bible Society (2020–2023).",
    language: 'uk' as any
  },
  {
    id: "PPCH",
    apiCode: "PPCH",
    name: "Новий Завіт у перекладі Юрія Попченка (2011)",
    year: "2011",
    philosophy: "Strict Formal / Textus Receptus",
    badge: "Textus Receptus NT",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Meticulous Ukrainian New Testament translated from the Greek Textus Receptus by Yuriy Popchenko (NT Only).",
    language: 'uk' as any
  },
  {
    id: "GYZ",
    apiCode: "GYZ",
    name: "Канонічний переклад Олександра Гижі (2019)",
    year: "2019",
    philosophy: "Literary Equivalence",
    badge: "Ukrainian Literary Bible",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Modern Ukrainian literary translation produced by writer Oleksandr Hyzha (2019).",
    language: 'uk' as any
  },
  {
    id: "UKDER",
    apiCode: "UKDER",
    name: "Велике Відкриття (Діана Деркач, 1992)",
    year: "1992",
    philosophy: "Contemporary Dynamic",
    badge: "Derkach Translation",
    approvedDenominations: ["baptist_evangelical"],
    description: "Dynamic contemporary Ukrainian translation produced in 1992.",
    language: 'uk' as any
  },
  {
    id: "TUB",
    apiCode: "TUB",
    name: "Біблія. Новий переклад УБТ (Рафаїл Турконяк, 2007)",
    year: "2007",
    philosophy: "Formal / Masoretic & Critical",
    badge: "UBS Masoretic (76 Books)",
    approvedDenominations: ["reformed","baptist_evangelical","orthodox"],
    description: "Contemporary Ukrainian translation from the original Hebrew Masoretic and Greek critical texts by Rafail Turkoniak (Ukrainian Bible Society).",
    isCanonDeuterocanon: true,
    language: 'uk' as any
  },
  {
    id: "CSL",
    apiCode: "CSL",
    name: "Церковнославянская Библия (Елизаветинская, 1900)",
    year: "1900",
    philosophy: "Historic Liturgical Slavonic",
    badge: "Eastern Orthodox Liturgical",
    approvedDenominations: ["orthodox"],
    description: "The Elizabeth Bible (1751/1900), the authoritative Church Slavonic biblical text utilized in the divine liturgy of the Eastern Orthodox Church.",
    isCanonDeuterocanon: true,
    language: 'ru' as any
  },
  {
    id: "NAV",
    apiCode: "NAV",
    name: "Kitab al-Hayat (كتاب الحياة, 1988)",
    year: "1988",
    philosophy: "Dynamic Equivalence",
    badge: "Biblica Arabic Living Bible",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Widely used modern Arabic dynamic translation produced by Biblica for accessible reading across the Arabic-speaking world.",
    language: 'ar' as any
  },
  {
    id: "SVD",
    apiCode: "SVD",
    name: "Smith & Van Dyke Arabic Bible (1865)",
    year: "1865",
    philosophy: "Formal Equivalence",
    badge: "Historic Arabic Standard",
    approvedDenominations: ["reformed","baptist_evangelical","anglican"],
    description: "The monumental Arabic translation translated from original tongues by Eli Smith and Cornelius Van Alen Van Dyck in Beirut (1865).",
    language: 'ar' as any
  },
  {
    id: "AFR53",
    apiCode: "AFR53",
    name: "Die Bybel in Afrikaans (1933/1953)",
    year: "1953",
    philosophy: "Formal Equivalence",
    badge: "Historic Afrikaans Standard",
    approvedDenominations: ["reformed"],
    description: "The historic first complete Afrikaans Bible, translated from original tongues for the Dutch Reformed Church of South Africa (Bible Society of South Africa).",
    language: 'af' as any
  },
  {
    id: "CUV",
    apiCode: "CUV",
    name: "Chinese Union Version (Traditional) 和合本",
    year: "1919",
    philosophy: "Formal Equivalence",
    badge: "Chinese Protestant Standard",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran","wesleyan","anglican"],
    description: "The undisputed benchmark translation used by Protestant churches across Greater China and the global Chinese diaspora since 1919.",
    language: 'zh' as any
  },
  {
    id: "CUNP",
    apiCode: "CUNP",
    name: "Chinese Union New Punctuation (Traditional) 新標點和合本",
    year: "1988",
    philosophy: "Formal Equivalence",
    badge: "Modern Punctuation (Trad)",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran","wesleyan","anglican"],
    description: "The classic Chinese Union Version updated with contemporary punctuation, paragraphing, and geographical markers (United Bible Societies, 1988).",
    language: 'zh' as any
  },
  {
    id: "CUNPS",
    apiCode: "CUNPS",
    name: "Chinese Union New Punctuation (Simplified) 新标点和合本",
    year: "1988",
    philosophy: "Formal Equivalence",
    badge: "Modern Punctuation (Simp)",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran","wesleyan","anglican"],
    description: "Simplified character edition of the New Punctuation Chinese Union Version, standard across mainland China.",
    language: 'zh' as any
  },
  {
    id: "PCB",
    apiCode: "PCB",
    name: "Peking Committee Bible (Traditional) 京委本聖經",
    year: "1899",
    philosophy: "Formal Literary Mandarin",
    badge: "Historic Mandarin Standard",
    approvedDenominations: ["reformed","anglican","baptist_evangelical"],
    description: "Pioneering late Qing dynasty Mandarin translation prepared by the Beijing Translation Committee (Blodget, Burdon, Edkins, Martin, Schereschewsky).",
    language: 'zh' as any
  },
  {
    id: "PCBS",
    apiCode: "PCBS",
    name: "Peking Committee Bible (Simplified) 京委本圣经",
    year: "1899",
    philosophy: "Formal Literary Mandarin",
    badge: "Historic Mandarin (Simp)",
    approvedDenominations: ["reformed","anglican","baptist_evangelical"],
    description: "Simplified character edition of the historic 1899 Peking Committee Mandarin translation.",
    language: 'zh' as any
  },
  {
    id: "ChiSB",
    apiCode: "ChiSB",
    name: "Studium Biblicum Franciscanum (思高聖經)",
    year: "1968",
    philosophy: "Formal Equivalence / Catholic",
    badge: "Official Chinese Catholic",
    approvedDenominations: ["catholic"],
    description: "The official and authoritative Catholic Bible in Chinese, translated from original languages by the Studium Biblicum Franciscanum in Hong Kong.",
    isCanonDeuterocanon: true,
    language: 'zh' as any
  },
  {
    id: "CSP09",
    apiCode: "CSP09",
    name: "Český studijní překlad (2009)",
    year: "2009",
    philosophy: "Formal / Critical",
    badge: "Czech Study Standard",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Scholarly Czech study Bible translated strictly word-for-word from original biblical languages (KMS, 2009).",
    language: 'cs' as any
  },
  {
    id: "NLD",
    apiCode: "NLD",
    name: "Petrus Canisiusvertaling (1939)",
    year: "1939",
    philosophy: "Formal Catholic",
    badge: "Dutch Catholic Standard",
    approvedDenominations: ["catholic"],
    description: "Authoritative Dutch Catholic translation prepared from original languages by the Catholic Canisius Association, containing the full Catholic canon.",
    isCanonDeuterocanon: true,
    language: 'nl' as any
  },
  {
    id: "DSV",
    apiCode: "DSV",
    name: "Statenvertaling (1619)",
    year: "1619",
    philosophy: "Formal / Byzantine-TR",
    badge: "Synod of Dort Official",
    approvedDenominations: ["reformed"],
    description: "The historic official Bible authorized by the States-General and Synod of Dort (1618–1619), foundational to Dutch Protestantism.",
    language: 'nl' as any
  },
  {
    id: "SVRJ",
    apiCode: "SVRJ",
    name: "Statenvertaling (Jongbloed-editie, 1995)",
    year: "1995",
    philosophy: "Formal Equivalence",
    badge: "Classic Dutch Reformed",
    approvedDenominations: ["reformed"],
    description: "Standard modernized spelling edition of the Statenvertaling published by Royal Jongbloed.",
    language: 'nl' as any
  },
  {
    id: "HSV17",
    apiCode: "HSV17",
    name: "Herziene Statenvertaling (2017)",
    year: "2017",
    philosophy: "Formal Equivalence (Modernized)",
    badge: "Modern Dutch Reformed",
    approvedDenominations: ["reformed"],
    description: "Careful revision of the Statenvertaling into contemporary Dutch while preserving original textus receptus fidelity (Stichting HSV, 2010/2017).",
    language: 'nl' as any
  },
  {
    id: "YLT",
    apiCode: "YLT",
    name: "Young's Literal Translation (1898)",
    year: "1898",
    philosophy: "Strict Word-for-Word (Formal)",
    badge: "Strict Literal English",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Extremely literal translation by Robert Young (author of Young’s Analytical Concordance), reflecting exact Hebrew and Greek verb tenses.",
    language: 'en' as any
  },
  {
    id: "CJB",
    apiCode: "CJB",
    name: "The Complete Jewish Bible (1998)",
    year: "1998",
    philosophy: "Cultural Dynamic / Messianic",
    badge: "Messianic Jewish Standard",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Messianic Jewish translation by David H. Stern connecting the Tanakh and B'rit Chadashah with traditional Hebrew names and terminology.",
    language: 'en' as any
  },
  {
    id: "TS2009",
    apiCode: "TS2009",
    name: "The Scriptures (2009)",
    year: "2009",
    philosophy: "Hebraic Restoration Literal",
    badge: "Institute for Scripture Research",
    approvedDenominations: ["baptist_evangelical"],
    description: "Literal translation by the Institute for Scripture Research (ISR) restoring sacred Hebrew names and original Hebraic idiom.",
    language: 'en' as any
  },
  {
    id: "LXXE",
    apiCode: "LXXE",
    name: "Brenton English Septuagint (1851)",
    year: "1851",
    philosophy: "Formal Equivalence",
    badge: "Sir Lancelot Brenton LXX",
    approvedDenominations: ["orthodox","catholic","anglican"],
    description: "Classic English translation of the Greek Septuagint Old Testament with Apocrypha by Sir Lancelot Charles Lee Brenton (1851).",
    isCanonDeuterocanon: true,
    language: 'en' as any
  },
  {
    id: "TLV",
    apiCode: "TLV",
    name: "Tree of Life Version (2014)",
    year: "2014",
    philosophy: "Optimal Equivalence",
    badge: "Messianic Family Bible",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Authorized Messianic Jewish translation produced by the Messianic Jewish Family Bible Society and Baker Books.",
    language: 'en' as any
  },
  {
    id: "GNV",
    apiCode: "GNV",
    name: "Geneva Bible (1599)",
    year: "1599",
    philosophy: "Historic Formal Equivalence",
    badge: "Historic Reformation Bible",
    approvedDenominations: ["reformed","anglican","baptist_evangelical"],
    description: "The monumental 1599 Reformation Bible brought by the Pilgrims on the Mayflower, featuring the work of Coverdale, Knox, and Whittingham.",
    language: 'en' as any
  },
  {
    id: "NIV2011",
    apiCode: "NIV2011",
    name: "New International Version (2011)",
    year: "2011",
    philosophy: "Optimal Equivalence",
    badge: "Biblica Global Standard",
    approvedDenominations: ["baptist_evangelical","reformed","wesleyan","anglican","lutheran"],
    description: "The flagship modern English translation balancing accuracy, elegance, and clarity (Biblica / Committee on Bible Translation, 2011).",
    language: 'en' as any
  },
  {
    id: "NJB1985",
    apiCode: "NJB1985",
    name: "New Jerusalem Bible (1985)",
    year: "1985",
    philosophy: "Dynamic / Literary Catholic",
    badge: "Catholic Literary Standard",
    approvedDenominations: ["catholic","anglican"],
    description: "Acclaimed Catholic study translation edited by Henry Wansbrough, featuring direct translation from original Hebrew and Greek.",
    isCanonDeuterocanon: true,
    language: 'en' as any
  },
  {
    id: "SPE",
    apiCode: "SPE",
    name: "Samaritan Pentateuch in English (2013)",
    year: "2013",
    philosophy: "Formal / Samaritan Recension",
    badge: "Samaritan Hebrew Tradition",
    approvedDenominations: ["reformed","anglican"],
    description: "English translation of the ancient Samaritan Hebrew Torah recension edited by Mark Shoulson.",
    language: 'en' as any
  },
  {
    id: "LBP",
    apiCode: "LBP",
    name: "Lamsa Bible (Aramaic Peshitta, 1933)",
    year: "1933",
    philosophy: "Formal / Eastern Aramaic",
    badge: "George Lamsa Peshitta",
    approvedDenominations: ["orthodox","anglican"],
    description: "English translation directly from the ancient Eastern Aramaic Peshitta manuscripts by Assyrian native scholar George M. Lamsa.",
    language: 'en' as any
  },
  {
    id: "AMP",
    apiCode: "AMP",
    name: "Amplified Bible (2015)",
    year: "2015",
    philosophy: "Word-for-Word Amplified",
    badge: "Lockman Amplified Study",
    approvedDenominations: ["baptist_evangelical","wesleyan","reformed"],
    description: "Unique study Bible that includes synonyms and explanatory definitions directly within brackets to clarify nuance (The Lockman Foundation, 2015).",
    language: 'en' as any
  },
  {
    id: "MSG",
    apiCode: "MSG",
    name: "The Message (Eugene Peterson, 2002)",
    year: "2002",
    philosophy: "Contemporary Idiomatic Paraphrase",
    badge: "Contemporary American Idiom",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Dynamic paraphrase by pastor and Hebrew/Greek scholar Eugene Peterson, capturing the tone and vitality of contemporary conversation.",
    language: 'en' as any
  },
  {
    id: "LSV",
    apiCode: "LSV",
    name: "Literal Standard Version (2020)",
    year: "2020",
    philosophy: "Strict Word-for-Word",
    badge: "Covenant Press Literal",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Modern literal English translation preserving Hebrew poetic structure and strict formal verbal correspondence (Covenant Press, 2020).",
    language: 'en' as any
  },
  {
    id: "MEV",
    apiCode: "MEV",
    name: "Modern English Version (2014)",
    year: "2014",
    philosophy: "Formal / Textus Receptus",
    badge: "Modern Textus Receptus",
    approvedDenominations: ["baptist_evangelical","wesleyan","reformed"],
    description: "Contemporary formal translation adhering to the Jacob ben Hayyim Masoretic and Textus Receptus tradition of the KJV (Military Bible Association, 2014).",
    language: 'en' as any
  },
  {
    id: "RSV2CE",
    apiCode: "RSV2CE",
    name: "Revised Standard Version (Ignatius Edition)",
    year: "2006",
    philosophy: "Formal / Liturgical Catholic",
    badge: "Ignatius Catholic Bible",
    approvedDenominations: ["catholic"],
    description: "The Second Catholic Edition of the RSV, revised in conformity with Liturgiam Authenticam for Catholic theology and study (Ignatius Press, 2006).",
    isCanonDeuterocanon: true,
    language: 'en' as any
  },
  {
    id: "CSB17",
    apiCode: "CSB17",
    name: "Christian Standard Bible (2017)",
    year: "2017",
    philosophy: "Optimal Equivalence",
    badge: "Holman / Southern Baptist",
    approvedDenominations: ["baptist_evangelical","reformed","wesleyan"],
    description: "Balanced modern translation prioritizing both word-for-word accuracy and contemporary English readability (Lifeway / Holman, 2017).",
    language: 'en' as any
  },
  {
    id: "CEVD",
    apiCode: "CEVD",
    name: "Contemporary English Version with Apocrypha",
    year: "2006",
    philosophy: "Dynamic Equivalence",
    badge: "Ecumenical / With Apocrypha",
    approvedDenominations: ["anglican","wesleyan","lutheran","catholic"],
    description: "American Bible Society dynamic translation designed to be spoken and heard, containing the complete Apocryphal / Deuterocanonical books.",
    isCanonDeuterocanon: true,
    language: 'en' as any
  },
  {
    id: "AUV",
    apiCode: "AUV",
    name: "An Understandable Version (1995)",
    year: "1995",
    philosophy: "Clarified Explanatory Dynamic",
    badge: "Explanatory Paraphrase",
    approvedDenominations: ["baptist_evangelical"],
    description: "Clear interpretive dynamic translation by William E. Paul incorporating implicit context to aid beginner readers.",
    language: 'en' as any
  },
  {
    id: "GNTD",
    apiCode: "GNTD",
    name: "Good News Translation (with Deuterocanon)",
    year: "2001",
    philosophy: "Functional Equivalence",
    badge: "ABS / Catholic Imprimatur",
    approvedDenominations: ["anglican","catholic","wesleyan","lutheran"],
    description: "American Bible Society common-language translation containing the full Catholic and Orthodox Deuterocanonicals with imprimatur.",
    isCanonDeuterocanon: true,
    language: 'en' as any
  },
  {
    id: "ERV",
    apiCode: "ERV",
    name: "Easy-to-Read Version (2006)",
    year: "2006",
    philosophy: "Simplified Functional",
    badge: "Bible League International",
    approvedDenominations: ["baptist_evangelical"],
    description: "Simplified functional translation by Bible League International crafted for clarity, ESL readers, and literacy outreach.",
    language: 'en' as any
  },
  {
    id: "GNT",
    apiCode: "GNT",
    name: "Good News Bible (Today's English Version)",
    year: "1976",
    philosophy: "Functional Equivalence",
    badge: "Ecumenical Common Language",
    approvedDenominations: ["anglican","wesleyan","lutheran","reformed"],
    description: "Pioneering dynamic equivalence translation by Dr. Robert Bratcher, published by the American Bible Society and United Bible Societies.",
    language: 'en' as any
  },
  {
    id: "ISV",
    apiCode: "ISV",
    name: "International Standard Version (2011)",
    year: "2011",
    philosophy: "Optimal Equivalence",
    badge: "ISV Foundation",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Modern English translation produced by the ISV Foundation taking advantage of Dead Sea Scrolls and computer-assisted exegesis.",
    language: 'en' as any
  },
  {
    id: "NLV",
    apiCode: "NLV",
    name: "New Life Version (1969)",
    year: "1969",
    philosophy: "Controlled Vocabulary (850 words)",
    badge: "Limited Vocabulary Standard",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Pioneering accessible translation by missionary linguists Gleason and Kathryn Ledyard using an 850-word controlled English vocabulary.",
    language: 'en' as any
  },
  {
    id: "WPNT",
    apiCode: "WPNT",
    name: "Wilbur Pickering's New Testament (2014)",
    year: "2014",
    philosophy: "Formal / Majority Text",
    badge: "Byzantine Majority Text",
    approvedDenominations: ["baptist_evangelical","orthodox"],
    description: "Meticulous translation of the Greek New Testament based on the statistical Majority Text tradition by linguist Wilbur N. Pickering (NT Only).",
    language: 'en' as any
  },
  {
    id: "NIVUK",
    apiCode: "NIVUK",
    name: "New International Version (Anglicised, 2011)",
    year: "2011",
    philosophy: "Optimal Equivalence",
    badge: "British / Commonwealth Standard",
    approvedDenominations: ["anglican","baptist_evangelical","reformed","wesleyan"],
    description: "British and Commonwealth English edition of the New International Version with Anglicised spelling and idiom (Hodder & Stoughton / Biblica).",
    language: 'en' as any
  },
  {
    id: "TNIV",
    apiCode: "TNIV",
    name: "Today's New International Version (2005)",
    year: "2005",
    philosophy: "Optimal Equivalence (Gender-Inclusive)",
    badge: "Gender-Inclusive Optimal",
    approvedDenominations: ["reformed","anglican","wesleyan"],
    description: "Scholarly 2005 revision of the NIV by the Committee on Bible Translation incorporating gender-inclusive language for humanity.",
    language: 'en' as any
  },
  {
    id: "NIRV",
    apiCode: "NIRV",
    name: "New International Reader's Version (1996)",
    year: "1996",
    philosophy: "Simplified Optimal (3rd Grade)",
    badge: "Early Reader Edition",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Simplified adaptation of the NIV designed for children and non-native English speakers at a third-grade reading level (Zondervan).",
    language: 'en' as any
  },
  {
    id: "POV",
    apiCode: "POV",
    name: "Persian Old Version (Henry Martyn)",
    year: "1895",
    philosophy: "Formal Literary Persian",
    badge: "Historic Persian Standard",
    approvedDenominations: ["reformed","baptist_evangelical","anglican"],
    description: "The historic classic Persian Bible translated by Henry Martyn and William Glen, published by the British and Foreign Bible Society.",
    language: 'fa' as any
  },
  {
    id: "FACB",
    apiCode: "FACB",
    name: "Farsi Contemporary Bible (ترجمه تفسیری)",
    year: "1995",
    philosophy: "Dynamic Equivalence",
    badge: "Biblica Farsi Standard",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Modern contemporary Persian translation by Biblica, widely read across the global Iranian and Afghan Christian diaspora.",
    language: 'fa' as any
  },
  {
    id: "FIK38",
    apiCode: "FIK38",
    name: "Kirkkoraamattu (1938)",
    year: "1938",
    philosophy: "Formal Equivalence",
    badge: "Finnish Lutheran Standard",
    approvedDenominations: ["lutheran"],
    description: "Official Bible of the Evangelical Lutheran Church of Finland, celebrated for its solemn Finnish prose (Finnish Bible Society, 1933/1938).",
    language: 'fi' as any
  },
  {
    id: "NBS",
    apiCode: "NBS",
    name: "Nouvelle Bible Segond (2002)",
    year: "2002",
    philosophy: "Formal / Critical",
    badge: "Alliance Biblique Universelle",
    approvedDenominations: ["reformed","lutheran","anglican","baptist_evangelical"],
    description: "Exhaustive scholarly revision of Louis Segond’s classic text by the French Bible Society, prized for theological study.",
    language: 'fr' as any
  },
  {
    id: "FRDBY",
    apiCode: "FRDBY",
    name: "Bible de John Nelson Darby (1890)",
    year: "1890",
    philosophy: "Strict Word-for-Word",
    badge: "Plymouth Brethren Literal",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Rigidly literal French translation by John Nelson Darby, designed for microscopic textual analysis.",
    language: 'fr' as any
  },
  {
    id: "FRLSG",
    apiCode: "FRLSG",
    name: "Bible Louis Segond (1910)",
    year: "1910",
    philosophy: "Formal Equivalence",
    badge: "Historic French Standard",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "The historic benchmark Protestant French translation, widely memorized and quoted across the Francophone world.",
    language: 'fr' as any
  },
  {
    id: "FRPDV17",
    apiCode: "FRPDV17",
    name: "Parole de Vie (2017)",
    year: "2017",
    philosophy: "Simplified Functional",
    badge: "French Common Language",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Accessible French common language Bible by the Alliance Biblique Française, accessible to new readers and youth.",
    language: 'fr' as any
  },
  {
    id: "BDS",
    apiCode: "BDS",
    name: "La Bible du Semeur (2015)",
    year: "2015",
    philosophy: "Optimal Equivalence",
    badge: "Biblica Francophone",
    approvedDenominations: ["baptist_evangelical","reformed","wesleyan"],
    description: "Contemporary dynamic French translation produced by Biblica and the French Evangelical Alliance for natural modern comprehension.",
    language: 'fr' as any
  },
  {
    id: "MB",
    apiCode: "MB",
    name: "Menge-Bibel (1939)",
    year: "1939",
    philosophy: "Formal Literary",
    badge: "Scholarly Literary German",
    approvedDenominations: ["lutheran","reformed"],
    description: "Acclaimed translation by classical philologist Hermann Menge, celebrated for balancing linguistic accuracy with exquisite literary German.",
    language: 'de' as any
  },
  {
    id: "ELB",
    apiCode: "ELB",
    name: "Elberfelder Bibel (1871/1905)",
    year: "1871",
    philosophy: "Strict Word-for-Word (Formal)",
    badge: "Classic Literal German",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Legendary for rigorous grammatical precision and close adherence to original Hebrew and Greek idioms (R. Brockhaus Verlag).",
    language: 'de' as any
  },
  {
    id: "SCH",
    apiCode: "SCH",
    name: "Schlachter (1951)",
    year: "1951",
    philosophy: "Formal Equivalence",
    badge: "Genfer Bibelgesellschaft",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Classic revision of Franz Eugen Schlachter’s Miniaturbibel, prepared by the Geneva Bible Society in 1951.",
    language: 'de' as any
  },
  {
    id: "S00",
    apiCode: "S00",
    name: "Schlachter 2000",
    year: "2000",
    philosophy: "Formal / Traditional Text",
    badge: "Conservative Evangelical",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Modern conservative revision based on the Hebrew Masoretic and Greek Textus Receptus, published by Genfer Bibelgesellschaft (2000).",
    language: 'de' as any
  },
  {
    id: "LUT",
    apiCode: "LUT",
    name: "Lutherbibel (1912)",
    year: "1912",
    philosophy: "Historic Formal Equivalence",
    badge: "Historic Lutheran Standard",
    approvedDenominations: ["lutheran","reformed"],
    description: "Martin Luther’s historic Protestant German translation, modernized in the 1912 standard church revision.",
    language: 'de' as any
  },
  {
    id: "HFA",
    apiCode: "HFA",
    name: "Hoffnung für Alle (2015)",
    year: "2015",
    philosophy: "Dynamic Equivalence",
    badge: "Biblica German Standard",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Contemporary, natural German translation produced by Biblica, widely read across evangelical and free churches (rev. 2015).",
    language: 'de' as any
  },
  {
    id: "NeU",
    apiCode: "NeU",
    name: "Neue evangelistische Übersetzung",
    year: "2010",
    philosophy: "Meaning-Based Contemporary",
    badge: "Vanheiden Modern German",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Clear, contemporary German translation by Karl-Heinz Vanheiden, focused on communicative clarity and faithful exegesis.",
    language: 'de' as any
  },
  {
    id: "TISCH",
    apiCode: "TISCH",
    name: "Tischendorf Greek NT (8th Ed. 1872)",
    year: "1872",
    philosophy: "Critical Manuscript Greek",
    badge: "Tischendorf Critical Edition",
    approvedDenominations: ["reformed","baptist_evangelical","anglican"],
    description: "Constantin von Tischendorf’s monumental critical edition incorporating Codex Sinaiticus, with Strong’s numbers.",
    language: 'el' as any
  },
  {
    id: "NTGT",
    apiCode: "NTGT",
    name: "Greek NT (Tischendorf 8th Ed. Parsed)",
    year: "1872",
    philosophy: "Morphologically Parsed Greek",
    badge: "Morphological Greek NT",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran"],
    description: "Tischendorf’s 8th edition Greek New Testament text with grammatical morphology.",
    language: 'el' as any
  },
  {
    id: "LXX",
    apiCode: "LXX",
    name: "Septuagint (LXX with Deuterocanon)",
    year: "c. 250 BC",
    philosophy: "Ancient Greek Translation",
    badge: "Canonical Orthodox / Catholic OT",
    approvedDenominations: ["orthodox","catholic"],
    description: "The ancient Greek translation of the Old Testament, the foundational Scripture of the Apostolic Church and canonical OT of the Eastern Orthodox Church.",
    isCanonDeuterocanon: true,
    language: 'el' as any
  },
  {
    id: "TR",
    apiCode: "TR",
    name: "Textus Receptus (Elzevir 1624)",
    year: "1624",
    philosophy: "Byzantine / Received Text",
    badge: "Reformation Standard Greek",
    approvedDenominations: ["reformed","baptist_evangelical","orthodox"],
    description: "The historic Received Text of the Protestant Reformation, underlying the Geneva Bible, King James Version, and historic European vernacular Bibles.",
    language: 'el' as any
  },
  {
    id: "NA28",
    apiCode: "NA28",
    name: "Novum Testamentum Graece (Nestle-Aland 28th Ed.)",
    year: "2012",
    philosophy: "Critical Eclectic Greek",
    badge: "Standard Scholarly Greek NT",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical","catholic"],
    description: "The worldwide academic benchmark critical edition of the Greek New Testament (Institut für Neutestamentliche Textforschung, Münster).",
    language: 'el' as any
  },
  {
    id: "SBLGNT",
    apiCode: "SBLGNT",
    name: "The Greek New Testament: SBL Edition",
    year: "2010",
    philosophy: "Modern Critical Greek",
    badge: "Society of Biblical Literature",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran","anglican"],
    description: "A modern critical edition of the Greek New Testament edited by Michael W. Holmes and published by the Society of Biblical Literature (2010).",
    language: 'el' as any
  },
  {
    id: "WLCa",
    apiCode: "WLCa",
    name: "Westminster Leningrad Codex (Accented with Strong's)",
    year: "c. 1008",
    philosophy: "Masoretic Hebrew Text",
    badge: "Morphological Hebrew Codex",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "Westminster Leningrad Codex with full cantillation accents, vowel pointing, and Strong’s Hebrew concordance alignment.",
    language: 'he' as any
  },
  {
    id: "WLC",
    apiCode: "WLC",
    name: "Westminster Leningrad Codex (with Vowels)",
    year: "c. 1008",
    philosophy: "Masoretic Hebrew Text",
    badge: "Authoritative Masoretic Codex",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "The oldest complete manuscript of the Hebrew Bible, based on the Leningrad Codex (B19a) maintained by the J. Alan Groves Center.",
    language: 'he' as any
  },
  {
    id: "WLCC",
    apiCode: "WLCC",
    name: "Westminster Leningrad Codex (Consonantal)",
    year: "c. 1008",
    philosophy: "Consonantal Hebrew Text",
    badge: "Consonantal Hebrew Codex",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "Consonantal text of the Leningrad Codex without vowel points or cantillation marks.",
    language: 'he' as any
  },
  {
    id: "HAC",
    apiCode: "HAC",
    name: "Aleppo Codex (כֶּתֶר אֲרָם צוֹבָא)",
    year: "c. 920",
    philosophy: "Ben Asher Masoretic",
    badge: "The Crown of Aleppo",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "The renowned 10th-century Masoretic manuscript vocalized and accented by Aaron ben Moses ben Asher in Tiberias.",
    language: 'he' as any
  },
  {
    id: "DHNT",
    apiCode: "DHNT",
    name: "Delitzsch Hebrew New Testament (1877/1998)",
    year: "1877",
    philosophy: "Hebrew Retroversion",
    badge: "Franz Delitzsch Classic NT",
    approvedDenominations: ["reformed","baptist_evangelical","lutheran"],
    description: "Franz Delitzsch’s classic translation of the Greek New Testament into biblical Hebrew for Jewish evangelism and Hebrew study.",
    language: 'he' as any
  },
  {
    id: "RUF",
    apiCode: "RUF",
    name: "Magyar Bibliatársulat újfordítású Bibliája (2014)",
    year: "2014",
    philosophy: "Formal Equivalence",
    badge: "Hungarian Bible Society",
    approvedDenominations: ["reformed","lutheran"],
    description: "Standard modern Hungarian Protestant translation produced by the Hungarian Bible Council (rev. 2014).",
    language: 'hu' as any
  },
  {
    id: "KB",
    apiCode: "KB",
    name: "Károli Gáspár Biblia (1908)",
    year: "1908",
    philosophy: "Historic Formal Equivalence",
    badge: "Historic Hungarian Standard",
    approvedDenominations: ["reformed"],
    description: "The historic benchmark Hungarian Protestant translation by Gáspár Károli (Vizsoly 1590), revised in 1908 by the Hungarian Bible Society.",
    language: 'hu' as any
  },
  {
    id: "HIOV",
    apiCode: "HIOV",
    name: "Hindi Old Version (Re-edited, BSI)",
    year: "1990",
    philosophy: "Formal Equivalence",
    badge: "Bible Society of India",
    approvedDenominations: ["reformed","baptist_evangelical","wesleyan"],
    description: "The classic formal Hindi Bible revised and published by the Bible Society of India.",
    language: 'hi' as any
  },
  {
    id: "KNCL",
    apiCode: "KNCL",
    name: "Kannada Common Language Bible",
    year: "2000",
    philosophy: "Dynamic Equivalence",
    badge: "Bible Society of India",
    approvedDenominations: ["reformed","baptist_evangelical","wesleyan"],
    description: "Contemporary Kannada translation produced for widespread communicative clarity by the Bible Society of India.",
    language: 'kn' as any
  },
  {
    id: "ERVKN",
    apiCode: "ERVKN",
    name: "Kannada Easy-to-Read Version (2007)",
    year: "2007",
    philosophy: "Simplified Functional",
    badge: "WBTC Kannada",
    approvedDenominations: ["baptist_evangelical"],
    description: "Simplified functional Kannada translation by the World Bible Translation Center (WBTC).",
    language: 'kn' as any
  },
  {
    id: "MOV",
    apiCode: "MOV",
    name: "Malayalam Satyavedapusthakam (1910)",
    year: "1910",
    philosophy: "Formal Equivalence",
    badge: "Benjamin Bailey BSI Standard",
    approvedDenominations: ["orthodox","reformed","baptist_evangelical","anglican"],
    description: "The historic benchmark Malayalam Bible translated by Benjamin Bailey, published by the Bible Society of India.",
    language: 'ml' as any
  },
  {
    id: "NNRV",
    apiCode: "NNRV",
    name: "Nepali New Revised Version (2012)",
    year: "2012",
    philosophy: "Formal Equivalence",
    badge: "Nepal Bible Society",
    approvedDenominations: ["reformed","baptist_evangelical","wesleyan"],
    description: "Standard formal Nepali Bible translation produced by the Nepal Bible Society (2012).",
    language: 'ne' as any
  },
  {
    id: "NEPS",
    apiCode: "NEPS",
    name: "Saral Nepali Pavitra Baibal",
    year: "2008",
    philosophy: "Dynamic Equivalence",
    badge: "Accessible Nepali",
    approvedDenominations: ["baptist_evangelical"],
    description: "Simple and accessible dynamic Nepali translation designed for new readers and evangelism.",
    language: 'ne' as any
  },
  {
    id: "TB",
    apiCode: "TB",
    name: "Terjemahan Baru (1974)",
    year: "1974",
    philosophy: "Formal Equivalence",
    badge: "Indonesian Bible Society",
    approvedDenominations: ["reformed","lutheran","baptist_evangelical"],
    description: "The standard formal translation used by Indonesian Protestant churches, published by Lembaga Alkitab Indonesia (LAI, 1974).",
    language: 'id' as any
  },
  {
    id: "JPNICT",
    apiCode: "JPNICT",
    name: "新共同訳聖書 (Shinkyodo-yaku, 1987)",
    year: "1987",
    philosophy: "Formal / Interconfessional",
    badge: "Catholic & Protestant Japan",
    approvedDenominations: ["catholic","anglican","reformed","lutheran","wesleyan","baptist_evangelical"],
    description: "The landmark Japanese Interconfessional Bible, jointly translated and officially authorized by the Catholic Bishops Conference of Japan and mainline Protestant churches (Japan Bible Society, 1987).",
    isCanonDeuterocanon: true,
    language: 'ja' as any
  },
  {
    id: "JPKJV",
    apiCode: "JPKJV",
    name: "口語訳聖書 (Kougo-yaku, 1954/1955)",
    year: "1955",
    philosophy: "Formal Colloquial Equivalence",
    badge: "Classic Colloquial Standard",
    approvedDenominations: ["reformed","lutheran","baptist_evangelical","wesleyan"],
    description: "The historic first colloquial Japanese Bible translation, beloved for its literary grace and formal clarity (Japan Bible Society, 1955).",
    language: 'ja' as any
  },
  {
    id: "KRV",
    apiCode: "KRV",
    name: "개역한글 (Korean Revised Version, 1961)",
    year: "1961",
    philosophy: "Formal Equivalence",
    badge: "Historic Korean Standard",
    approvedDenominations: ["reformed","wesleyan","baptist_evangelical","lutheran"],
    description: "The historic benchmark Bible of Korean Protestantism, deeply embedded in the devotional life and growth of Korean churches (Korean Bible Society, 1961).",
    language: 'ko' as any
  },
  {
    id: "RNKSV",
    apiCode: "RNKSV",
    name: "새번역 (Revised New Korean Standard Version, 2001)",
    year: "2001",
    philosophy: "Optimal Equivalence",
    badge: "KBS Modern Standard",
    approvedDenominations: ["reformed","wesleyan","anglican","lutheran","baptist_evangelical"],
    description: "Modern, accurate Korean translation by the Korean Bible Society, widely used for study and contemporary worship.",
    language: 'ko' as any
  },
  {
    id: "VULG",
    apiCode: "VULG",
    name: "Biblia Sacra Vulgata (Clementina)",
    year: "1592",
    philosophy: "Formal / Latin Vulgate",
    badge: "Definitive Catholic Latin",
    approvedDenominations: ["catholic","anglican"],
    description: "St. Jerome’s ancient Latin translation, standardized in the 1592 Clementine Vulgate as the official Bible of the Western Catholic Church.",
    isCanonDeuterocanon: true,
    language: 'la' as any
  },
  {
    id: "ADB",
    apiCode: "tagalog",
    name: "Ang Dating Biblia (1905)",
    year: "1905",
    philosophy: "Formal Equivalence",
    badge: "Philippine Bible Society",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "Ang Dating Biblia (1905), Philippine Bible Society. Historic Protestant translation in Tagalog.",
    language: 'tl' as any
  },
  {
    id: "NR06",
    apiCode: "NR06",
    name: "Nuova Riveduta, 2006",
    year: "2006",
    philosophy: "Formal / Critical",
    badge: "Italian Protestant Standard",
    approvedDenominations: ["reformed","baptist_evangelical","wesleyan"],
    description: "The premier Italian Protestant Bible, prepared by the Società Biblica di Ginevra (Geneva Bible Society) based on critical Hebrew and Greek texts.",
    language: 'it' as any
  },
  {
    id: "DNB",
    apiCode: "DNB",
    name: "Det Norsk Bibelselskap (1930)",
    year: "1930",
    philosophy: "Formal Equivalence",
    badge: "Norwegian Lutheran Standard",
    approvedDenominations: ["lutheran"],
    description: "The landmark 1930 Bokmål translation of the Norwegian Bible Society (Det Norske Bibelselskap), standard of the Church of Norway.",
    language: 'no' as any
  },
  {
    id: "NTJud",
    apiCode: "NTJud",
    name: "Novo Testamento Judaico (David Stern)",
    year: "2008",
    philosophy: "Messianic Jewish",
    badge: "Messianic NT Only",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Portuguese translation of David H. Stern’s Jewish New Testament by Editora Vida, highlighting Hebrew roots (NT Only).",
    language: 'pt' as any
  },
  {
    id: "TB10",
    apiCode: "TB10",
    name: "Tradução Brasileira, 2010",
    year: "2010",
    philosophy: "Strict Formal Equivalence",
    badge: "Edição Brasileira (SBB)",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Historic 1917 literal Portuguese translation produced by Brazilian scholars and missionaries, revised by SBB in 2010.",
    language: 'pt' as any
  },
  {
    id: "ARA",
    apiCode: "ARA",
    name: "Almeida Revista e Atualizada, 1993",
    year: "1993",
    philosophy: "Formal Equivalence",
    badge: "Presbyterian & Lutheran Brazil",
    approvedDenominations: ["reformed","lutheran","wesleyan","baptist_evangelical"],
    description: "The premier classical study Bible for Brazilian Presbyterians and Lutherans, balancing formal fidelity with refined Portuguese syntax (SBB, 2nd ed. 1993).",
    language: 'pt' as any
  },
  {
    id: "OL",
    apiCode: "OL",
    name: "O Livro (Bíblia Viva)",
    year: "2000",
    philosophy: "Thought-for-Thought",
    badge: "European Portuguese Living Bible",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Modern European Portuguese paraphrase by Biblica designed for clear devotional understanding.",
    language: 'pt' as any
  },
  {
    id: "NVIPT",
    apiCode: "NVIPT",
    name: "Nova Versão Internacional (NVI), 2000",
    year: "2000",
    philosophy: "Optimal Equivalence",
    badge: "Biblica Portuguese",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "Widely read modern Portuguese translation balancing exegetical accuracy and contemporary Brazilian idiom (Biblica, 2000).",
    language: 'pt' as any
  },
  {
    id: "NVT",
    apiCode: "NVT",
    name: "Nova Versão Transformadora, 2016",
    year: "2016",
    philosophy: "Dynamic Equivalence",
    badge: "Mundo Cristão / Tyndale",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Expressive and clear contemporary Portuguese dynamic translation by Editora Mundo Cristão in partnership with Tyndale House (2016).",
    language: 'pt' as any
  },
  {
    id: "NTLH",
    apiCode: "NTLH",
    name: "Nova Tradução na Linguagem de Hoje, 2000",
    year: "2000",
    philosophy: "Functional Equivalence",
    badge: "SBB Common Language",
    approvedDenominations: ["baptist_evangelical","wesleyan","lutheran"],
    description: "Simple, direct Portuguese common language translation designed for popular evangelism and youth ministry (Sociedade Bíblica do Brasil, 2000).",
    language: 'pt' as any
  },
  {
    id: "KJA",
    apiCode: "KJA",
    name: "Bíblia King James Atualizada, 2001",
    year: "2001",
    philosophy: "Formal Equivalence",
    badge: "Abba Press / Ibero-Americana",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Portuguese translation based on the King James tradition and original biblical tongues, produced by Abba Press and Sociedade Bíblica Ibero-Americana (2001).",
    language: 'pt' as any
  },
  {
    id: "VFL",
    apiCode: "VFL",
    name: "Versão Fácil de Ler",
    year: "2005",
    philosophy: "Simplified Functional",
    badge: "World Bible Translation Center",
    approvedDenominations: ["baptist_evangelical"],
    description: "Easy-to-read Portuguese translation specifically designed for literacy programs and new readers (WBTC / League of the Bible).",
    language: 'pt' as any
  },
  {
    id: "NAA",
    apiCode: "NAA",
    name: "Nova Almeida Atualizada, 2017",
    year: "2017",
    philosophy: "Formal Equivalence (Modernized)",
    badge: "SBB Contemporary Standard",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "Modern revision of the classic Almeida text with contemporary vocabulary while preserving formal equivalence (Sociedade Bíblica do Brasil, 2017).",
    language: 'pt' as any
  },
  {
    id: "CNBB",
    apiCode: "CNBB",
    name: "Bíblia Sagrada CNBB, 2002",
    year: "2002",
    philosophy: "Formal / Liturgical Catholic",
    badge: "Official Catholic Brazil",
    approvedDenominations: ["catholic"],
    description: "The official Catholic translation authorized by the National Conference of Bishops of Brazil (Conferência Nacional dos Bispos do Brasil) for liturgy and catechesis.",
    isCanonDeuterocanon: true,
    language: 'pt' as any
  },
  {
    id: "NBV07",
    apiCode: "NBV07",
    name: "Nova Bíblia Viva, 2007",
    year: "2007",
    philosophy: "Contemporary Dynamic",
    badge: "Editora Hagnos",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Revised Brazilian living Bible paraphrase offering fluid, conversational Portuguese (Editora Hagnos, 2007).",
    language: 'pt' as any
  },
  {
    id: "ALM21",
    apiCode: "ALM21",
    name: "Bíblia Almeida Século 21",
    year: "2008",
    philosophy: "Formal Equivalence",
    badge: "Edições Vida Nova",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Scholarly modern edition of the classic Almeida text published by Edições Vida Nova (2008).",
    language: 'pt' as any
  },
  {
    id: "ARC09",
    apiCode: "ARC09",
    name: "Almeida Revista e Corrigida, 2009",
    year: "2009",
    philosophy: "Formal Equivalence",
    badge: "Sociedade Bíblica do Brasil",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Historic standard translation of Brazilian Pentecostal and traditional evangelical churches, published by the Sociedade Bíblica do Brasil (4th ed. 2009).",
    language: 'pt' as any
  },
  {
    id: "ACF11",
    apiCode: "ACF11",
    name: "Almeida Corrigida Fiel, 2011",
    year: "2011",
    philosophy: "Formal / Textus Receptus",
    badge: "Trinitarian Bible Society",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Traditional Portuguese translation by João Ferreira de Almeida, revised strictly according to the Hebrew Masoretic and Greek Textus Receptus by Sociedade Bíblica Trinitariana do Brasil.",
    language: 'pt' as any
  },
  {
    id: "MENS",
    apiCode: "MENS",
    name: "A Mensagem (Eugene Peterson)",
    year: "2011",
    philosophy: "Contemporary Idiomatic Paraphrase",
    badge: "Editora Vida",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Portuguese rendition of Eugene Peterson’s The Message paraphrase, rendering biblical idioms into expressive contemporary Portuguese (Editora Vida, 2011).",
    language: 'pt' as any
  },
  {
    id: "BG",
    apiCode: "BG",
    name: "Biblia Gdańska (1881)",
    year: "1881",
    philosophy: "Historic Formal / TR",
    badge: "Historic Polish Protestant",
    approvedDenominations: ["reformed","lutheran"],
    description: "The historic Polish Protestant Bible originally produced in 1632 in Gdańsk, published in standard revised edition in 1881.",
    language: 'pl' as any
  },
  {
    id: "UBG18",
    apiCode: "UBG18",
    name: "Uwspółcześniona Biblia Gdańska (2018)",
    year: "2018",
    philosophy: "Formal / Textus Receptus",
    badge: "Fundacja Wrota Nadziei",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Modernized edition of the historic Gdańsk Bible based on original Hebrew and Greek Textus Receptus (Fundacja Wrota Nadziei, 2018).",
    language: 'pl' as any
  },
  {
    id: "BW",
    apiCode: "BW",
    name: "Biblia Warszawska (1975)",
    year: "1975",
    philosophy: "Formal Equivalence",
    badge: "Polish Ecumenical Benchmark",
    approvedDenominations: ["lutheran","reformed","baptist_evangelical"],
    description: "The benchmark modern Polish Protestant Bible produced by the British and Foreign Bible Society in Warsaw (1975).",
    language: 'pl' as any
  },
  {
    id: "VDCL",
    apiCode: "VDCL",
    name: "Traducere Literală Cornilescu (1931)",
    year: "1931",
    philosophy: "Strict Formal Equivalence",
    badge: "Cornilescu Literal Standard",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "Dumitru Cornilescu’s faithful formal Romanian translation produced for the British and Foreign Bible Society (1931).",
    language: 'ro' as any
  },
  {
    id: "NTR",
    apiCode: "NTR",
    name: "Noua Traducere Românească (2016)",
    year: "2016",
    philosophy: "Optimal Equivalence",
    badge: "Biblica Romanian Standard",
    approvedDenominations: ["baptist_evangelical","reformed","wesleyan"],
    description: "Modern Romanian translation produced by Biblica, balancing textual fidelity with contemporary Romanian idiom (2007/2016).",
    language: 'ro' as any
  },
  {
    id: "JNT",
    apiCode: "JNT",
    name: "Еврейский Новый Завет (Давид Стерн, 1989)",
    year: "1989",
    philosophy: "Messianic Jewish",
    badge: "Messianic NT Only",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Russian translation of David H. Stern’s Jewish New Testament, highlighting original Jewish context and Hebrew names (NT Only).",
    language: 'ru' as any
  },
  {
    id: "NRT",
    apiCode: "NRT",
    name: "Новый русский Перевод (НРП, 2014)",
    year: "2014",
    philosophy: "Optimal / Dynamic Equivalence",
    badge: "Biblica Russian Standard",
    approvedDenominations: ["reformed","baptist_evangelical","wesleyan","lutheran"],
    description: "Widely read contemporary Russian translation by Biblica (International Bible Society), balancing accuracy with natural modern Russian prose (2014).",
    language: 'ru' as any
  },
  {
    id: "SYNOD",
    apiCode: "SYNOD",
    name: "русский Синодальный Перевод (1876)",
    year: "1876",
    philosophy: "Formal / Byzantine TR",
    badge: "Russian Synodal Standard",
    approvedDenominations: ["orthodox","reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "The historic benchmark Russian translation authorized by the Most Holy Governing Synod of the Russian Orthodox Church, standard for Orthodox and Russian Protestants alike.",
    language: 'ru' as any
  },
  {
    id: "TNHR",
    apiCode: "TNHR",
    name: "ТаНаХ на русском в переводе Д. Йосифона (1975)",
    year: "1975",
    philosophy: "Formal / Masoretic Hebrew",
    badge: "Mossad Harav Kook",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "The Hebrew Bible (Tanakh) translated into Russian by David Yosifon, published in Jerusalem by Mossad Harav Kook (1975).",
    language: 'ru' as any
  },
  {
    id: "RBS2",
    apiCode: "RBS2",
    name: "Современный русский перевод (РБО, 2015)",
    year: "2015",
    philosophy: "Contemporary Literary",
    badge: "Russian Bible Society",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "Modern Russian literary translation produced from original Hebrew, Aramaic, and Greek by the Russian Bible Society (2nd ed. 2015).",
    language: 'ru' as any
  },
  {
    id: "BTI",
    apiCode: "BTI",
    name: "Библия под ред. М.П. Кулакова (2015)",
    year: "2015",
    philosophy: "Formal / Critical Academic",
    badge: "Zaoksky Theological Institute",
    approvedDenominations: ["catholic","anglican","reformed","lutheran","wesleyan","baptist_evangelical"],
    description: "Acclaimed modern academic Russian translation produced by the Bible Translation Institute at Zaoksky, edited by M.P. Kulakov and M.M. Kulakov (2015).",
    language: 'ru' as any
  },
  {
    id: "BTX3",
    apiCode: "BTX3",
    name: "La Biblia Textual 3ra Edición",
    year: "2010",
    philosophy: "Strict Formal / Critical",
    badge: "Sociedad Bíblica Iberoamericana",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "Rigorous literal Spanish translation based on the latest critical Hebrew and Greek scholarship (Sociedad Bíblica Iberoamericana, 3rd ed. 2010).",
    language: 'es' as any
  },
  {
    id: "RV1960",
    apiCode: "RV1960",
    name: "Reina-Valera 1960",
    year: "1960",
    philosophy: "Formal Equivalence",
    badge: "Historic Hispanic Standard",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "The universally cherished standard Protestant Bible in the Spanish-speaking world, revision of Casiodoro de Reina (1569) and Cipriano de Valera (1602).",
    language: 'es' as any
  },
  {
    id: "RV2004",
    apiCode: "RV2004",
    name: "Reina Valera Gómez 2004",
    year: "2004",
    philosophy: "Formal / Textus Receptus",
    badge: "Reina Valera Gómez (RVG)",
    approvedDenominations: ["baptist_evangelical"],
    description: "Conservative Spanish revision based directly on the traditional Hebrew Masoretic and Greek Textus Receptus, edited by Humberto Gómez Caballero.",
    language: 'es' as any
  },
  {
    id: "PDT",
    apiCode: "PDT",
    name: "Palabra de Dios para Todos",
    year: "2005",
    philosophy: "Dynamic Equivalence",
    badge: "Bible League International",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Contemporary, accessible Spanish translation produced by Bible League International for clear evangelistic and devotional reading.",
    language: 'es' as any
  },
  {
    id: "NVI",
    apiCode: "NVI",
    name: "Nueva Versión Internacional, 2015",
    year: "1999",
    philosophy: "Optimal Equivalence",
    badge: "Biblica Spanish Standard",
    approvedDenominations: ["reformed","lutheran","wesleyan","anglican","baptist_evangelical"],
    description: "The most widely read modern Spanish translation, balancing linguistic fidelity with contemporary natural Spanish prose (Biblica, 1999/2015).",
    language: 'es' as any
  },
  {
    id: "NTV",
    apiCode: "NTV",
    name: "Nueva Traducción Viviente, 2009",
    year: "2009",
    philosophy: "Dynamic Equivalence",
    badge: "Tyndale House Spanish",
    approvedDenominations: ["baptist_evangelical","wesleyan"],
    description: "Clear and vibrant Spanish dynamic equivalence translation rendered by an international team of evangelical scholars (Tyndale House, 2009).",
    language: 'es' as any
  },
  {
    id: "LBLA",
    apiCode: "LBLA",
    name: "La Biblia de las Américas, 1997",
    year: "1997",
    philosophy: "Formal Equivalence (Word-for-Word)",
    badge: "Lockman Foundation",
    approvedDenominations: ["reformed","baptist_evangelical"],
    description: "The Spanish counterpart of the NASB, renowned for its strict fidelity to the original Hebrew, Aramaic, and Greek grammar (The Lockman Foundation, 1997).",
    language: 'es' as any
  },
  {
    id: "SUV",
    apiCode: "SUV",
    name: "Swahili Union Version (1997)",
    year: "1997",
    philosophy: "Formal Equivalence",
    badge: "East Africa Standard",
    approvedDenominations: ["reformed","lutheran","anglican","baptist_evangelical"],
    description: "The definitive standard Swahili Bible (Biblia Takatifu) used across Kenya, Tanzania, and East Africa (Bible Society of Tanzania / Kenya).",
    language: 'sw' as any
  },
  {
    id: "SFB2015",
    apiCode: "SFB2015",
    name: "Svenska Folkbibeln 2015",
    year: "2015",
    philosophy: "Formal / Conservative Evangelical",
    badge: "Swedish Evangelical Standard",
    approvedDenominations: ["lutheran","baptist_evangelical"],
    description: "Conservative evangelical Swedish translation prized for its fidelity to original biblical manuscripts (Stiftelsen Svenska Folkbibeln, 2015).",
    language: 'sv' as any
  },
  {
    id: "TBSI",
    apiCode: "TBSI",
    name: "Tamil Older Version (Fabricius, 1868)",
    year: "1868",
    philosophy: "Formal Equivalence",
    badge: "BSI Historic Tamil",
    approvedDenominations: ["lutheran","reformed","anglican","baptist_evangelical"],
    description: "The historic classic Tamil Bible translation originating with Johann Fabricius, revised by the Bible Society of India.",
    language: 'ta' as any
  },
  {
    id: "TAMBL98",
    apiCode: "TAMBL98",
    name: "Tamil Contemporary Version (1998)",
    year: "1998",
    philosophy: "Dynamic Equivalence",
    badge: "Bible League Tamil",
    approvedDenominations: ["baptist_evangelical"],
    description: "Contemporary dynamic Tamil translation published by Bible League International.",
    language: 'ta' as any
  },
  {
    id: "TAMOVR",
    apiCode: "TAMOVR",
    name: "Tamil O.V. Reference Bible",
    year: "1956",
    philosophy: "Formal Equivalence",
    badge: "BSI Reference Standard",
    approvedDenominations: ["lutheran","reformed","baptist_evangelical"],
    description: "Standard reference edition of the Tamil Old Version published by the Bible Society of India.",
    language: 'ta' as any
  },
  {
    id: "VI1934",
    apiCode: "VI1934",
    name: "Kinh Thánh Bản Truyền Thống (1934)",
    year: "1934",
    philosophy: "Formal Equivalence",
    badge: "Historic Vietnamese Standard",
    approvedDenominations: ["baptist_evangelical","reformed"],
    description: "The classic Vietnamese translation produced by William C. Cadman and the Evangelical Church of Vietnam (Tin Lành, 1934).",
    language: 'vi' as any
  }
];

export type TranslationId = string;

export interface TranslationColorTheme {
  primary: string;    // vibrant accent hex
  bg: string;         // soft tinted background
  border: string;     // border color matching tone
  badgeBg: string;    // badge solid / deep background
  badgeText: string;  // badge text contrast
  text: string;       // deep readable header / label text
}

export const TRANSLATION_COLORS: Record<string, TranslationColorTheme> = {
  // Catholic Editions - Rich Purples, Crimson, Deep Golds & Violets
  NABRE: {
    primary: '#7C3AED', // Vibrant Violet
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badgeBg: '#7C3AED',
    badgeText: '#FFFFFF',
    text: '#5B21B6'
  },
  RSVCE: {
    primary: '#9333EA', // Deep Purple
    bg: '#FAF5FF',
    border: '#E9D5FF',
    badgeBg: '#9333EA',
    badgeText: '#FFFFFF',
    text: '#6B21A8'
  },
  NRSVCE: {
    primary: '#C026D3', // Vibrant Fuchsia
    bg: '#FDF4FF',
    border: '#F5D0FE',
    badgeBg: '#C026D3',
    badgeText: '#FFFFFF',
    text: '#86198F'
  },
  DRB: {
    primary: '#BE123C', // Cardinal Rose / Crimson
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#BE123C',
    badgeText: '#FFFFFF',
    text: '#881337'
  },
  NJB: {
    primary: '#D97706', // Imperial Amber
    bg: '#FFFBEB',
    border: '#FDE68A',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    text: '#92400E'
  },

  // Orthodox Editions - Byzantine Imperial Gold & Cobalt
  NKJV: {
    primary: '#B45309', // Byzantine Gold / Bronze
    bg: '#FEF3C7',
    border: '#FCD34D',
    badgeBg: '#B45309',
    badgeText: '#FFFFFF',
    text: '#78350F'
  },
  RSV: {
    primary: '#2563EB', // Royal Blue
    bg: '#EFF6FF',
    border: '#BFDBFE',
    badgeBg: '#2563EB',
    badgeText: '#FFFFFF',
    text: '#1E40AF'
  },

  // Reformed & Puritan Standards - Teal, Emerald, Navy & Cyan
  ESV: {
    primary: '#0D9488', // Deep Teal
    bg: '#F0FDFA',
    border: '#99F6E4',
    badgeBg: '#0D9488',
    badgeText: '#FFFFFF',
    text: '#115E59'
  },
  GENEVA: {
    primary: '#854D0E', // Historic Sepia / Bronze
    bg: '#FEFCE8',
    border: '#FEF08A',
    badgeBg: '#854D0E',
    badgeText: '#FFFFFF',
    text: '#713F12'
  },
  NASB: {
    primary: '#0284C7', // Vivid Sky / Ocean Blue
    bg: '#F0F9FF',
    border: '#BAE6FD',
    badgeBg: '#0284C7',
    badgeText: '#FFFFFF',
    text: '#0369A1'
  },
  BSB: {
    primary: 'var(--clean-accent-caramel, #B4793D)', // Berea Signature Accent
    bg: 'var(--clean-highlight-cream, #FAF5ED)',
    border: 'var(--clean-accent-border, #E8D7C3)',
    badgeBg: 'var(--clean-accent-caramel, #B4793D)',
    badgeText: 'var(--clean-accent-contrast-text, #FFFFFF)',
    text: 'var(--clean-accent-dark, #78471F)'
  },
  LSB: {
    primary: '#059669', // Emerald Green
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badgeBg: '#059669',
    badgeText: '#FFFFFF',
    text: '#065F46'
  },

  // Baptist & Evangelical Standards - Coral, Red, Orange
  CSB: {
    primary: '#EA580C', // Vibrant Tangerine
    bg: '#FFF7ED',
    border: '#FED7AA',
    badgeBg: '#EA580C',
    badgeText: '#FFFFFF',
    text: '#9A3412'
  },
  NIV: {
    primary: '#16A34A', // Vibrant Kelly Green
    bg: '#F0FDF4',
    border: '#BBF7D0',
    badgeBg: '#16A34A',
    badgeText: '#FFFFFF',
    text: '#166534'
  },
  NLT: {
    primary: '#E11D48', // Electric Coral Pink
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#E11D48',
    badgeText: '#FFFFFF',
    text: '#9F1239'
  },

  // Anglican & Historic Classics - Crimson Ruby & Indigo
  KJV: {
    primary: '#DC2626', // Majestic Scarlet Ruby
    bg: '#FEF2F2',
    border: '#FECACA',
    badgeBg: '#DC2626',
    badgeText: '#FFFFFF',
    text: '#991B1B'
  },
  NRSV: {
    primary: '#4F46E5', // Deep Indigo
    bg: '#EEF2FF',
    border: '#C7D2FE',
    badgeBg: '#4F46E5',
    badgeText: '#FFFFFF',
    text: '#3730A3'
  },

  // Methodists / Open Standards - Cyan, Lime, Electric Blue, Steel
  CEB: {
    primary: '#0891B2', // Vivid Cyan
    bg: '#ECFEFF',
    border: '#A5F3FC',
    badgeBg: '#0891B2',
    badgeText: '#FFFFFF',
    text: '#155E75'
  },
  NET: {
    primary: '#65A30D', // Olive Lime
    bg: '#F7FEE7',
    border: '#D9F99D',
    badgeBg: '#65A30D',
    badgeText: '#FFFFFF',
    text: '#3F6212'
  },
  WEB: {
    primary: '#06B6D4', // Pacific Turquoise
    bg: '#ECFEFF',
    border: '#CFFAFE',
    badgeBg: '#06B6D4',
    badgeText: '#FFFFFF',
    text: '#0E7490'
  },
  ASV: {
    primary: '#475569', // Historic Slate
    bg: '#F8FAFC',
    border: '#E2E8F0',
    badgeBg: '#475569',
    badgeText: '#FFFFFF',
    text: '#1E293B'
  }
};

export const DEFAULT_TRANSLATION_COLOR: TranslationColorTheme = {
  primary: 'var(--clean-accent-caramel, #B4793D)',
  bg: 'var(--clean-highlight-cream, #FAF5ED)',
  border: 'var(--clean-accent-border, #E8D7C3)',
  badgeBg: 'var(--clean-accent-caramel, #B4793D)',
  badgeText: 'var(--clean-accent-contrast-text, #FFFFFF)',
  text: 'var(--clean-accent-dark, #78471F)'
};

export function getTranslationColor(id: string): TranslationColorTheme {
  if (TRANSLATION_COLORS[id]) {
    return TRANSLATION_COLORS[id];
  }
  // Deterministic distinct palette generation based on translation ID string hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    primary: `hsl(${hue}, 70%, 42%)`,
    bg: `hsl(${hue}, 60%, 96%)`,
    border: `hsl(${hue}, 50%, 82%)`,
    badgeBg: `hsl(${hue}, 68%, 42%)`,
    badgeText: '#FFFFFF',
    text: `hsl(${hue}, 78%, 24%)`
  };
}

export function getApprovedTranslationsForDenomination(lens: DenominationalLens): TranslationInfo[] {
  return TRANSLATIONS.filter(t => t.approvedDenominations.includes(lens));
}

export function getDefaultTranslationForDenomination(lens: DenominationalLens, lang: string = 'en'): TranslationId {
  const approvedInLang = getApprovedTranslationsForDenomination(lens).filter(t => (t.language || 'en') === lang);
  if (approvedInLang.length > 0) {
    const popularIds = [
      'NABRE', 'RSVCE', 'NRSVCE', 'DRB', 'NJB', // Catholic
      'KJV', 'NIV', 'ESV', 'NLT', 'NASB', 'RSV', 'NRSV', 'NKJV', 'CSB',
      'RV1960', 'DHHE', 'TORRES_AMAT',
      'FRLSG', 'FRPDV17', 'FRDBY', 'BDS',
      'LUTH1545', 'SCH2000',
      'ARA', 'NVIPT', 'NVT',
      'CUV', 'SYNO', 'SYNOD', 'UKDER', 'TUB', 'PPCH', 'ADB', 'VULG'
    ];
    const sorted = [...approvedInLang].sort((a, b) => {
      const aPop = popularIds.includes(a.id) ? 1 : 0;
      const bPop = popularIds.includes(b.id) ? 1 : 0;
      return bPop - aPop;
    });
    return sorted[0].id as TranslationId;
  }

  switch (lens) {
    case 'catholic':
      return 'NABRE';
    case 'orthodox':
      return 'NKJV';
    case 'reformed':
      return 'ESV';
    case 'lutheran':
      return 'ESV';
    case 'wesleyan':
      return 'NRSV';
    case 'anglican':
      return 'KJV';
    case 'baptist_evangelical':
      return 'CSB';
    default:
      return 'ESV';
  }
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament (1–39)
  { id: 'genesis', name: 'Genesis', abbreviation: 'Gen', testament: 'OT', category: 'Law', chaptersCount: 50, author: 'Moses', dateWritten: 'c. 1440 BC', theme: 'Creation, Fall, and the Covenant Patriarchs', keyVerse: 'Genesis 12:2-3' },
  { id: 'exodus', name: 'Exodus', abbreviation: 'Exo', testament: 'OT', category: 'Law', chaptersCount: 40, author: 'Moses', dateWritten: 'c. 1440 BC', theme: 'Deliverance from Egypt and the Law at Sinai', keyVerse: 'Exodus 19:5-6' },
  { id: 'leviticus', name: 'Leviticus', abbreviation: 'Lev', testament: 'OT', category: 'Law', chaptersCount: 27, author: 'Moses', dateWritten: 'c. 1440 BC', theme: 'Holiness, Priesthood, and Atoning Sacrifices', keyVerse: 'Leviticus 19:2' },
  { id: 'numbers', name: 'Numbers', abbreviation: 'Num', testament: 'OT', category: 'Law', chaptersCount: 36, author: 'Moses', dateWritten: 'c. 1400 BC', theme: 'Wilderness Wanderings and Divine Faithfulness', keyVerse: 'Numbers 6:24-26' },
  { id: 'deuteronomy', name: 'Deuteronomy', abbreviation: 'Deu', testament: 'OT', category: 'Law', chaptersCount: 34, author: 'Moses', dateWritten: 'c. 1400 BC', theme: 'Renewal of the Covenant and the Shema', keyVerse: 'Deuteronomy 6:4-5' },
  
  { id: 'joshua', name: 'Joshua', abbreviation: 'Jos', testament: 'OT', category: 'History', chaptersCount: 24, author: 'Joshua', dateWritten: 'c. 1375 BC', theme: 'Conquest and Division of the Promised Land', keyVerse: 'Joshua 1:9' },
  { id: 'judges', name: 'Judges', abbreviation: 'Jdg', testament: 'OT', category: 'History', chaptersCount: 21, author: 'Samuel', dateWritten: 'c. 1050 BC', theme: 'Cycles of Rebellion, Oppression, and Deliverance', keyVerse: 'Judges 21:25' },
  { id: 'ruth', name: 'Ruth', abbreviation: 'Rut', testament: 'OT', category: 'History', chaptersCount: 4, author: 'Samuel', dateWritten: 'c. 1000 BC', theme: 'Kinsman Redeemer and Loyal Covenant Love (Hesed)', keyVerse: 'Ruth 1:16-17' },
  { id: '1samuel', name: '1 Samuel', abbreviation: '1Sa', testament: 'OT', category: 'History', chaptersCount: 31, author: 'Samuel / Nathan / Gad', dateWritten: 'c. 930 BC', theme: 'Transition from Theocracy to Monarchy; Saul and David', keyVerse: '1 Samuel 16:7' },
  { id: '2samuel', name: '2 Samuel', abbreviation: '2Sa', testament: 'OT', category: 'History', chaptersCount: 24, author: 'Nathan / Gad', dateWritten: 'c. 930 BC', theme: 'The Reign of King David and the Davidic Covenant', keyVerse: '2 Samuel 7:16' },
  { id: '1kings', name: '1 Kings', abbreviation: '1Ki', testament: 'OT', category: 'History', chaptersCount: 22, author: 'Jeremiah', dateWritten: 'c. 550 BC', theme: 'Solomon’s Temple, the Divided Kingdom, and Elijah', keyVerse: '1 Kings 8:23' },
  { id: '2kings', name: '2 Kings', abbreviation: '2Ki', testament: 'OT', category: 'History', chaptersCount: 25, author: 'Jeremiah', dateWritten: 'c. 550 BC', theme: 'Fall of Israel and Judah; Exile in Babylon', keyVerse: '2 Kings 17:13-14' },
  { id: '1chronicles', name: '1 Chronicles', abbreviation: '1Ch', testament: 'OT', category: 'History', chaptersCount: 29, author: 'Ezra', dateWritten: 'c. 450 BC', theme: 'Genealogies and David’s Preparations for the Temple', keyVerse: '1 Chronicles 29:11' },
  { id: '2chronicles', name: '2 Chronicles', abbreviation: '2Ch', testament: 'OT', category: 'History', chaptersCount: 36, author: 'Ezra', dateWritten: 'c. 450 BC', theme: 'Temple Worship, Reforms of the Kings of Judah', keyVerse: '2 Chronicles 7:14' },
  { id: 'ezra', name: 'Ezra', abbreviation: 'Ezr', testament: 'OT', category: 'History', chaptersCount: 10, author: 'Ezra', dateWritten: 'c. 440 BC', theme: 'Return from Exile and Rebuilding the Second Temple', keyVerse: 'Ezra 7:10' },
  { id: 'nehemiah', name: 'Nehemiah', abbreviation: 'Neh', testament: 'OT', category: 'History', chaptersCount: 13, author: 'Nehemiah', dateWritten: 'c. 430 BC', theme: 'Rebuilding the Walls of Jerusalem and Spiritual Renewal', keyVerse: 'Nehemiah 8:10' },
  { id: 'esther', name: 'Esther', abbreviation: 'Est', testament: 'OT', category: 'History', chaptersCount: 10, author: 'Mordecai', dateWritten: 'c. 460 BC', theme: 'God’s Providential Preservation of His People in Persia', keyVerse: 'Esther 4:14' },

  { id: 'job', name: 'Job', abbreviation: 'Job', testament: 'OT', category: 'Poetry', chaptersCount: 42, author: 'Unknown', dateWritten: 'c. 2000–1000 BC', theme: 'Sovereignty of God in the Face of Suffering', keyVerse: 'Job 19:25' },
  { id: 'psalms', name: 'Psalms', abbreviation: 'Psa', testament: 'OT', category: 'Poetry', chaptersCount: 150, author: 'David, Asaph, Sons of Korah, Moses', dateWritten: 'c. 1400–450 BC', theme: 'Praise, Lament, Trust, and Messianic Hope', keyVerse: 'Psalm 119:105' },
  { id: 'proverbs', name: 'Proverbs', abbreviation: 'Pro', testament: 'OT', category: 'Wisdom', chaptersCount: 31, author: 'Solomon, Agur, Lemuel', dateWritten: 'c. 950 BC', theme: 'Wisdom Grounded in the Fear of the Lord', keyVerse: 'Proverbs 3:5-6' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', abbreviation: 'Ecc', testament: 'OT', category: 'Wisdom', chaptersCount: 12, author: 'Solomon (Qoheleth)', dateWritten: 'c. 935 BC', theme: 'Life "Under the Sun" and Finding True Meaning in God', keyVerse: 'Ecclesiastes 12:13' },
  { id: 'songofsolomon', name: 'Song of Solomon', abbreviation: 'Sng', testament: 'OT', category: 'Poetry', chaptersCount: 8, author: 'Solomon', dateWritten: 'c. 960 BC', theme: 'The Beauty of Covenantal Marital Love and Divine Affection', keyVerse: 'Song of Solomon 8:6-7' },

  { id: 'isaiah', name: 'Isaiah', abbreviation: 'Isa', testament: 'OT', category: 'Major Prophets', chaptersCount: 66, author: 'Isaiah', dateWritten: 'c. 700 BC', theme: 'The Holy One of Israel and the Suffering Servant Messiah', keyVerse: 'Isaiah 53:5-6' },
  { id: 'jeremiah', name: 'Jeremiah', abbreviation: 'Jer', testament: 'OT', category: 'Major Prophets', chaptersCount: 52, author: 'Jeremiah', dateWritten: 'c. 585 BC', theme: 'Judgment on Judah and the Promise of the New Covenant', keyVerse: 'Jeremiah 31:31-33' },
  { id: 'lamentations', name: 'Lamentations', abbreviation: 'Lam', testament: 'OT', category: 'Poetry', chaptersCount: 5, author: 'Jeremiah', dateWritten: 'c. 586 BC', theme: 'Grief Over the Fall of Jerusalem; Great is God’s Faithfulness', keyVerse: 'Lamentations 3:22-23' },
  { id: 'ezekiel', name: 'Ezekiel', abbreviation: 'Ezk', testament: 'OT', category: 'Major Prophets', chaptersCount: 48, author: 'Ezekiel', dateWritten: 'c. 570 BC', theme: 'The Glory of God, Valley of Dry Bones, and the New Temple', keyVerse: 'Ezekiel 36:26' },
  { id: 'daniel', name: 'Daniel', abbreviation: 'Dan', testament: 'OT', category: 'Major Prophets', chaptersCount: 12, author: 'Daniel', dateWritten: 'c. 530 BC', theme: 'God’s Rule Over World Empires and the Son of Man', keyVerse: 'Daniel 7:13-14' },

  { id: 'hosea', name: 'Hosea', abbreviation: 'Hos', testament: 'OT', category: 'Minor Prophets', chaptersCount: 14, author: 'Hosea', dateWritten: 'c. 715 BC', theme: 'Unfailing Love for an Unfaithful Bride', keyVerse: 'Hosea 6:6' },
  { id: 'joel', name: 'Joel', abbreviation: 'Jol', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Joel', dateWritten: 'c. 835 BC', theme: 'The Day of the Lord and the Outpouring of the Spirit', keyVerse: 'Joel 2:28' },
  { id: 'amos', name: 'Amos', abbreviation: 'Amo', testament: 'OT', category: 'Minor Prophets', chaptersCount: 9, author: 'Amos', dateWritten: 'c. 760 BC', theme: 'Social Justice, Righteousness, and Divine Accountability', keyVerse: 'Amos 5:24' },
  { id: 'obadiah', name: 'Obadiah', abbreviation: 'Oba', testament: 'OT', category: 'Minor Prophets', chaptersCount: 1, author: 'Obadiah', dateWritten: 'c. 586 BC', theme: 'Judgment on Edom for Oppressing Israel', keyVerse: 'Obadiah 1:15' },
  { id: 'jonah', name: 'Jonah', abbreviation: 'Jon', testament: 'OT', category: 'Minor Prophets', chaptersCount: 4, author: 'Jonah', dateWritten: 'c. 760 BC', theme: 'God’s Boundless Mercy for the Nations', keyVerse: 'Jonah 4:2' },
  { id: 'micah', name: 'Micah', abbreviation: 'Mic', testament: 'OT', category: 'Minor Prophets', chaptersCount: 7, author: 'Micah', dateWritten: 'c. 700 BC', theme: 'Ruler Born in Bethlehem; Act Justly, Love Mercy', keyVerse: 'Micah 6:8' },
  { id: 'nahum', name: 'Nahum', abbreviation: 'Nam', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Nahum', dateWritten: 'c. 650 BC', theme: 'Judgment and Destruction of Nineveh', keyVerse: 'Nahum 1:7' },
  { id: 'habakkuk', name: 'Habakkuk', abbreviation: 'Hab', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Habakkuk', dateWritten: 'c. 605 BC', theme: 'Questioning God’s Ways: The Just Shall Live by Faith', keyVerse: 'Habakkuk 2:4' },
  { id: 'zephaniah', name: 'Zephaniah', abbreviation: 'Zep', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Zephaniah', dateWritten: 'c. 625 BC', theme: 'The Great Day of the Lord and the Singing Savior', keyVerse: 'Zephaniah 3:17' },
  { id: 'haggai', name: 'Haggai', abbreviation: 'Hag', testament: 'OT', category: 'Minor Prophets', chaptersCount: 2, author: 'Haggai', dateWritten: 'c. 520 BC', theme: 'Rebuilding the House of the Lord', keyVerse: 'Haggai 1:8' },
  { id: 'zechariah', name: 'Zechariah', abbreviation: 'Zec', testament: 'OT', category: 'Minor Prophets', chaptersCount: 14, author: 'Zechariah', dateWritten: 'c. 520 BC', theme: 'Visions of the Messianic King and Future Glory', keyVerse: 'Zechariah 9:9' },
  { id: 'malachi', name: 'Malachi', abbreviation: 'Mal', testament: 'OT', category: 'Minor Prophets', chaptersCount: 4, author: 'Malachi', dateWritten: 'c. 430 BC', theme: 'Call to Faithfulness and the Coming Messenger of the Covenant', keyVerse: 'Malachi 4:2' },

  // Deuterocanonical / Apocrypha (Catholic & Orthodox Canon)
  { id: 'tobit', name: 'Tobit', abbreviation: 'Tob', testament: 'OT', category: 'History', chaptersCount: 14, author: 'Tobit / Tobias', dateWritten: 'c. 200 BC', theme: 'Faithfulness in Exile, Angelic Guidance, and Divine Healing', keyVerse: 'Tobit 12:15' },
  { id: 'judith', name: 'Judith', abbreviation: 'Jdt', testament: 'OT', category: 'History', chaptersCount: 16, author: 'Unknown', dateWritten: 'c. 150 BC', theme: 'Courageous Faith, Overcoming Oppression, and Victory by a Woman', keyVerse: 'Judith 13:18' },
  { id: 'wisdom', name: 'Wisdom of Solomon', abbreviation: 'Wis', testament: 'OT', category: 'Wisdom', chaptersCount: 19, author: 'Solomon (traditional) / Hellenistic Sage', dateWritten: 'c. 50 BC', theme: 'The Immortality of the Soul, Divine Wisdom, and the Righteous Sufferer', keyVerse: 'Wisdom 2:12-20' },
  { id: 'sirach', name: 'Sirach', abbreviation: 'Sir', testament: 'OT', category: 'Wisdom', chaptersCount: 51, author: 'Jesus ben Sira', dateWritten: 'c. 180 BC', theme: 'Living Wisdom Grounded in the Fear of the Lord and Sacred Tradition', keyVerse: 'Sirach 24:8-10' },
  { id: 'baruch', name: 'Baruch', abbreviation: 'Bar', testament: 'OT', category: 'Major Prophets', chaptersCount: 6, author: 'Baruch son of Neriah', dateWritten: 'c. 150 BC', theme: 'Repentance in Exile, Divine Wisdom on Earth, and Restoration of Jerusalem', keyVerse: 'Baruch 3:37' },
  { id: '1maccabees', name: '1 Maccabees', abbreviation: '1Ma', testament: 'OT', category: 'History', chaptersCount: 16, author: 'Jewish Historian', dateWritten: 'c. 100 BC', theme: 'Zeal for the Covenant, the Maccabean Revolt, and Temple Purification', keyVerse: '1 Maccabees 4:56-59' },
  { id: '2maccabees', name: '2 Maccabees', abbreviation: '2Ma', testament: 'OT', category: 'History', chaptersCount: 15, author: 'Jason of Cyrene / Epitomist', dateWritten: 'c. 120 BC', theme: 'The Seven Holy Martyrs, Bodily Resurrection, and Prayers for the Dead', keyVerse: '2 Maccabees 7:9' },

  // New Testament (40–66)
  { id: 'matthew', name: 'Matthew', abbreviation: 'Mat', testament: 'NT', category: 'Gospels', chaptersCount: 28, author: 'Matthew', dateWritten: 'c. AD 60–70', theme: 'Jesus as King and Fulfillment of Prophecy', keyVerse: 'Matthew 28:19-20' },
  { id: 'mark', name: 'Mark', abbreviation: 'Mrk', testament: 'NT', category: 'Gospels', chaptersCount: 16, author: 'John Mark', dateWritten: 'c. AD 55–65', theme: 'Jesus as the Suffering Servant who Gives His Life', keyVerse: 'Mark 10:45' },
  { id: 'luke', name: 'Luke', abbreviation: 'Luk', testament: 'NT', category: 'Gospels', chaptersCount: 24, author: 'Luke the Physician', dateWritten: 'c. AD 60–62', theme: 'The Son of Man Seeking and Saving the Lost', keyVerse: 'Luke 19:10' },
  { id: 'john', name: 'John', abbreviation: 'Jhn', testament: 'NT', category: 'Gospels', chaptersCount: 21, author: 'John the Apostle', dateWritten: 'c. AD 85–95', theme: 'Jesus as the Divine Son of God who brings Eternal Life', keyVerse: 'John 20:31' },
  { id: 'acts', name: 'Acts', abbreviation: 'Act', testament: 'NT', category: 'History', chaptersCount: 28, author: 'Luke', dateWritten: 'c. AD 62–64', theme: 'The Holy Spirit Empowering the Church (including Berea)', keyVerse: 'Acts 1:8' },

  { id: 'romans', name: 'Romans', abbreviation: 'Rom', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 16, author: 'Apostle Paul', dateWritten: 'c. AD 57', theme: 'The Righteousness of God Revealed through Faith in Christ', keyVerse: 'Romans 1:16-17' },
  { id: '1corinthians', name: '1 Corinthians', abbreviation: '1Co', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 16, author: 'Apostle Paul', dateWritten: 'c. AD 55', theme: 'Overcoming Divisions, Spiritual Gifts, and the Resurrection', keyVerse: '1 Corinthians 13:13' },
  { id: '2corinthians', name: '2 Corinthians', abbreviation: '2Co', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 13, author: 'Apostle Paul', dateWritten: 'c. AD 56', theme: 'Strength in Weakness and Ministry of Reconciliation', keyVerse: '2 Corinthians 12:9' },
  { id: 'galatians', name: 'Galatians', abbreviation: 'Gal', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6, author: 'Apostle Paul', dateWritten: 'c. AD 49', theme: 'Freedom in Christ and Justification by Faith Alone', keyVerse: 'Galatians 5:1' },
  { id: 'ephesians', name: 'Ephesians', abbreviation: 'Eph', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6, author: 'Apostle Paul', dateWritten: 'c. AD 60–62', theme: 'The Mystery of Christ and the Church Walking in Grace', keyVerse: 'Ephesians 2:8-9' },
  { id: 'philippians', name: 'Philippians', abbreviation: 'Php', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4, author: 'Apostle Paul', dateWritten: 'c. AD 61', theme: 'Joy and Unity in Christ despite Circumstances', keyVerse: 'Philippians 4:4' },
  { id: 'colossians', name: 'Colossians', abbreviation: 'Col', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4, author: 'Apostle Paul', dateWritten: 'c. AD 61', theme: 'The Absolute Supremacy and Preeminence of Christ', keyVerse: 'Colossians 1:18' },
  { id: '1thessalonians', name: '1 Thessalonians', abbreviation: '1Th', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 5, author: 'Apostle Paul', dateWritten: 'c. AD 51', theme: 'Encouragement, Holy Living, and the Second Coming', keyVerse: '1 Thessalonians 4:16-17' },
  { id: '2thessalonians', name: '2 Thessalonians', abbreviation: '2Th', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 3, author: 'Apostle Paul', dateWritten: 'c. AD 51', theme: 'Steadfastness in Persecution and the Day of the Lord', keyVerse: '2 Thessalonians 2:15' },
  { id: '1timothy', name: '1 Timothy', abbreviation: '1Ti', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6, author: 'Apostle Paul', dateWritten: 'c. AD 64', theme: 'Sound Doctrine and Church Leadership', keyVerse: '1 Timothy 3:15' },
  { id: '2timothy', name: '2 Timothy', abbreviation: '2Ti', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4, author: 'Apostle Paul', dateWritten: 'c. AD 66', theme: 'Faithfulness to the Word and Finishing the Race', keyVerse: '2 Timothy 3:16-17' },
  { id: 'titus', name: 'Titus', abbreviation: 'Tit', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 3, author: 'Apostle Paul', dateWritten: 'c. AD 64', theme: 'Good Works Rooted in Transforming Grace', keyVerse: 'Titus 2:11-12' },
  { id: 'philemon', name: 'Philemon', abbreviation: 'Phm', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 1, author: 'Apostle Paul', dateWritten: 'c. AD 61', theme: 'Forgiveness and Brotherly Reconciliation in Christ', keyVerse: 'Philemon 1:16' },

  { id: 'hebrews', name: 'Hebrews', abbreviation: 'Heb', testament: 'NT', category: 'General Epistles', chaptersCount: 13, author: 'Unknown (Pauline associate)', dateWritten: 'c. AD 65–69', theme: 'Jesus as Better: Superior High Priest and New Covenant', keyVerse: 'Hebrews 12:1-2' },
  { id: 'james', name: 'James', abbreviation: 'Jas', testament: 'NT', category: 'General Epistles', chaptersCount: 5, author: 'James the Brother of Jesus', dateWritten: 'c. AD 45–48', theme: 'Living Faith Demonstrated through Works and Wisdom', keyVerse: 'James 2:26' },
  { id: '1peter', name: '1 Peter', abbreviation: '1Pe', testament: 'NT', category: 'General Epistles', chaptersCount: 5, author: 'Peter the Apostle', dateWritten: 'c. AD 64', theme: 'Living Hope and Holiness amidst Suffering', keyVerse: '1 Peter 1:3' },
  { id: '2peter', name: '2 Peter', abbreviation: '2Pe', testament: 'NT', category: 'General Epistles', chaptersCount: 3, author: 'Peter the Apostle', dateWritten: 'c. AD 66', theme: 'Growing in Grace and Guarding against False Teachers', keyVerse: '2 Peter 3:18' },
  { id: '1john', name: '1 John', abbreviation: '1Jn', testament: 'NT', category: 'General Epistles', chaptersCount: 5, author: 'John the Apostle', dateWritten: 'c. AD 90', theme: 'Fellowship with God: Walking in Light and Love', keyVerse: '1 John 5:13' },
  { id: '2john', name: '2 John', abbreviation: '2Jn', testament: 'NT', category: 'General Epistles', chaptersCount: 1, author: 'John the Apostle', dateWritten: 'c. AD 90', theme: 'Walking in Truth and Love', keyVerse: '2 John 1:6' },
  { id: '3john', name: '3 John', abbreviation: '3Jn', testament: 'NT', category: 'General Epistles', chaptersCount: 1, author: 'John the Apostle', dateWritten: 'c. AD 90', theme: 'Hospitality and Support for Fellow Workers for the Truth', keyVerse: '3 John 1:8' },
  { id: 'jude', name: 'Jude', abbreviation: 'Jud', testament: 'NT', category: 'General Epistles', chaptersCount: 1, author: 'Jude the Brother of James', dateWritten: 'c. AD 65', theme: 'Contending Earnestly for the Faith', keyVerse: 'Jude 1:24-25' },
  { id: 'revelation', name: 'Revelation', abbreviation: 'Rev', testament: 'NT', category: 'Prophecy', chaptersCount: 22, author: 'John the Apostle', dateWritten: 'c. AD 95', theme: 'The Final Triumph of the Lamb, Renewal of All Creation', keyVerse: 'Revelation 21:3-4' }
];

export function getBook(bookId: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id.toLowerCase() === bookId.toLowerCase() || b.name.toLowerCase() === bookId.toLowerCase());
}

export function getChapter(bookId: string, chapterNum: number): Chapter {
  const book = getBook(bookId) || BIBLE_BOOKS[0];
  if (book && book.chapters && book.chapters[chapterNum]) {
    return book.chapters[chapterNum];
  }

  // Generate clean default chapter structure with 15 verses while live YouVersion API resolves
  const verseCount = 15;
  const mockVerses: Verse[] = [];
  for (let i = 1; i <= verseCount; i++) {
    mockVerses.push({
      verseNumber: i,
      text: {
        KJV: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        ESV: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        NIV: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        NLT: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        NASB: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        CSB: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`
      }
    });
  }

  return {
    chapterNumber: chapterNum,
    summary: '',
    verses: mockVerses,
    locationKey: 'jerusalem'
  };
}
