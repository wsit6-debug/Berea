export interface ScripturePassage {
  ref: string;
  book: string;
  chapter: number;
  verseRange: string;
  verbatimText: string;
  translation: string;
  theologicalTopic: string;
  keywords: string[];
  greekHebrew?: {
    term: string;
    transliteration: string;
    strongs: string;
    meaning: string;
  }[];
}

export const CANONICAL_SCRIPTURE_CORPUS: ScripturePassage[] = [
  // =========================================================================
  // MARIOLOGY, INCARNATION, ANNUNCIATION & VIRGIN BIRTH
  // =========================================================================
  {
    ref: 'Luke 1:26–38',
    book: 'Luke',
    chapter: 1,
    verseRange: '26-38',
    verbatimText: 'In the sixth month the angel Gabriel was sent from God to a city of Galilee named Nazareth, to a virgin betrothed to a man whose name was Joseph, of the house of David. And the virgin’s name was Mary. And he came to her and said, "Hail, full of grace, the Lord is with you!" ... And the angel said to her, "Do not be afraid, Mary, for you have found favor with God. And behold, you will conceive in your womb and bear a son, and you shall call his name Jesus. He will be great and will be called the Son of the Most High." ... And Mary said to the angel, "How will this be, since I am a virgin?" And the angel answered her, "The Holy Spirit will come upon you, and the power of the Most High will overshadow you; therefore the child to be born will be called holy—the Son of God." ... And Mary said, "Behold, I am the servant of the Lord; let it be to me according to your word." And the angel departed from her.',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'Annunciation, Kecharitomene & Virgin Conception',
    keywords: ['mary', 'annunciation', 'gabriel', 'virgin', 'luke 1', 'luke 1:28', 'luke 1:35', 'luke 1:38', 'full of grace', 'kecharitomene', 'holy spirit', 'overshadow', 'son of god', 'sinless', 'immaculate conception'],
    greekHebrew: [
      { term: 'κεχαριτωμένη', transliteration: 'Kecharitomene', strongs: 'G5487', meaning: 'Having been transformed/filled with enduring divine grace (Luke 1:28)' },
      { term: 'ἐπισκιάσει', transliteration: 'Episkiasei', strongs: 'G1982', meaning: 'To overshadow, divine Shekinah presence of the Holy Spirit (Luke 1:35)' }
    ]
  },
  {
    ref: 'Luke 1:39–45',
    book: 'Luke',
    chapter: 1,
    verseRange: '39-45',
    verbatimText: 'When Elizabeth heard the greeting of Mary, the baby leaped in her womb. And Elizabeth was filled with the Holy Spirit, and she exclaimed with a loud cry, "Blessed are you among women, and blessed is the fruit of your womb! And why is this granted to me that the mother of my Lord should come to me? For behold, when the sound of your greeting came to my ears, the baby in my womb leaped for joy. And blessed is she who believed that there would be a fulfillment of what was spoken to her from the Lord."',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'The Visitation & Mother of My Lord (Theotokos)',
    keywords: ['visitation', 'elizabeth', 'mother of my lord', 'blessed are you among women', 'luke 1:42', 'luke 1:43', 'mary', 'theotokos', 'john the baptist'],
    greekHebrew: [
      { term: 'ἡ μήτηρ τοῦ κυρίου μου', transliteration: 'Hē mētēr tou kyriou mou', strongs: 'G3384 / G2962', meaning: 'The mother of my Lord (Luke 1:43)' }
    ]
  },
  {
    ref: 'Luke 1:46–55',
    book: 'Luke',
    chapter: 1,
    verseRange: '46-55',
    verbatimText: 'And Mary said, "My soul magnifies the Lord, and my spirit rejoices in God my Savior, for he has looked on the humble estate of his servant. For behold, from now on all generations will call me blessed; for he who is mighty has done great things for me, and holy is his name. And his mercy is for those who fear him from generation to generation."',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'The Magnificat (Canticle of Mary)',
    keywords: ['magnificat', 'mary', 'luke 1:46', 'luke 1:47', 'luke 1:48', 'god my savior', 'all generations will call me blessed', 'humble', 'servant'],
    greekHebrew: [
      { term: 'Μεγαλύνει', transliteration: 'Megalynei', strongs: 'G3170', meaning: 'Magnifies, exalts, declares greatness (Luke 1:46)' },
      { term: 'μακαριοῦσίν', transliteration: 'Makariousin', strongs: 'G3106', meaning: 'Shall call blessed, felicitate (Luke 1:48)' }
    ]
  },
  {
    ref: 'Genesis 3:15',
    book: 'Genesis',
    chapter: 3,
    verseRange: '15',
    verbatimText: 'I will put enmity between you and the woman, and between your offspring and her offspring; he shall crush your head, and you shall strike his heel.',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'The Protoevangelium (First Gospel & The New Eve)',
    keywords: ['genesis 3:15', 'protoevangelium', 'enmity', 'the woman', 'serpent', 'crush head', 'seed of the woman', 'mary', 'new eve', 'messiah', 'sinless'],
    greekHebrew: [
      { term: 'אֵיבָה', transliteration: 'Eivah', strongs: 'H342', meaning: 'Enmity, total perpetual hostility' }
    ]
  },
  {
    ref: 'John 19:25–27',
    book: 'John',
    chapter: 19,
    verseRange: '25-27',
    verbatimText: 'Standing by the cross of Jesus were his mother and his mother’s sister, Mary the wife of Clopas, and Mary Magdalene. When Jesus saw his mother and the disciple whom he loved standing nearby, he said to his mother, "Woman, behold, your son!" Then he said to the disciple, "Behold, your mother!" And from that hour the disciple took her to his own home.',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'Mary at the Cross & Mother of the Church',
    keywords: ['john 19:26', 'john 19:27', 'woman behold your son', 'behold your mother', 'mary', 'cross', 'crucifixion', 'beloved disciple', 'john'],
    greekHebrew: [
      { term: 'Γύναι', transliteration: 'Gynai', strongs: 'G1135', meaning: 'Woman (solemn title connecting to Genesis 3:15 and Cana)' }
    ]
  },
  {
    ref: 'Revelation 12:1–5',
    book: 'Revelation',
    chapter: 12,
    verseRange: '1-5',
    verbatimText: 'And a great sign appeared in heaven: a woman clothed with the sun, with the moon under her feet, and on her head a crown of twelve stars. She was pregnant and was crying out in birth pains and the agony of giving birth. ... She gave birth to a male child, one who is to rule all the nations with a rod of iron, but her child was caught up to God and to his throne.',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'The Woman Clothed with the Sun',
    keywords: ['revelation 12', 'woman clothed with the sun', 'twelve stars', 'dragon', 'male child', 'ark of the covenant', 'mary', 'church', 'theotokos'],
    greekHebrew: [
      { term: 'σημεῖον μέγα', transliteration: 'Sēmeion mega', strongs: 'G4592 / G3173', meaning: 'A great miraculous sign in heaven' }
    ]
  },
  {
    ref: 'Matthew 1:18–25',
    book: 'Matthew',
    chapter: 1,
    verseRange: '18-25',
    verbatimText: 'Now the birth of Jesus Christ took place in this way. When his mother Mary had been betrothed to Joseph, before they came together she was found to be with child from the Holy Spirit. ... Behold, an angel of the Lord appeared to him in a dream, saying, "Joseph, son of David, do not fear to take Mary as your wife, for that which is conceived in her is from the Holy Spirit. She will bear a son, and you shall call his name Jesus, for he will save his people from their sins." All this took place to fulfill what the Lord had spoken by the prophet: "Behold, the virgin shall conceive and bear a son, and they shall call his name Immanuel" (which means, God with us).',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'The Virgin Birth of Immanuel (Isaiah 7:14 Fulfillment)',
    keywords: ['matthew 1', 'virgin birth', 'conceived from the holy spirit', 'immanuel', 'joseph', 'mary', 'isaiah 7:14', 'virgin shall conceive'],
    greekHebrew: [
      { term: 'παρθένος', transliteration: 'Parthenos', strongs: 'G3933', meaning: 'Virgin, pure maiden (Matthew 1:23)' },
      { term: 'עַלְמָה', transliteration: 'Almah', strongs: 'H5959', meaning: 'Virgin / maiden of marriageable age (Isaiah 7:14)' }
    ]
  },

  // =========================================================================
  // ORIGINAL SIN, THE FALL & TOTAL HUMAN DEPRAVITY
  // =========================================================================
  {
    ref: 'Romans 5:12–19',
    book: 'Romans',
    chapter: 5,
    verseRange: '12-19',
    verbatimText: 'Therefore, just as sin came into the world through one man, and death through sin, and so death spread to all men because all sinned... For as by the one man’s disobedience the many were made sinners, so by the one man’s obedience the many will be made righteous.',
    translation: 'ESV',
    theologicalTopic: 'Original Sin, Federal Headship & Justification in Christ',
    keywords: ['romans 5:12', 'original sin', 'adam', 'fall of man', 'death through sin', 'federal headship', 'one man disobedience', 'righteousness in christ'],
    greekHebrew: [
      { term: 'ἁμαρτία', transliteration: 'Hamartia', strongs: 'G266', meaning: 'Sin as a governing power and principle in fallen human nature' }
    ]
  },
  {
    ref: 'Psalm 51:5',
    book: 'Psalms',
    chapter: 51,
    verseRange: '5',
    verbatimText: 'Behold, I was brought forth in iniquity, and in sin did my mother conceive me.',
    translation: 'ESV',
    theologicalTopic: 'Inherited Iniquity from Conception',
    keywords: ['psalm 51:5', 'in sin did my mother conceive me', 'original sin', 'inherited sin', 'iniquity', 'david confession'],
    greekHebrew: [
      { term: 'עָוֺן', transliteration: 'Avon', strongs: 'H5771', meaning: 'Iniquity, moral crookedness, inherited perversity' },
      { term: 'חֵטְא', transliteration: 'Chet', strongs: 'H2399', meaning: 'Sin, fault, missing the mark' }
    ]
  },

  // =========================================================================
  // SINLESSNESS & IMPECCABILITY OF JESUS CHRIST
  // =========================================================================
  {
    ref: '2 Corinthians 5:21',
    book: '2 Corinthians',
    chapter: 5,
    verseRange: '21',
    verbatimText: 'For our sake he made him to be sin who knew no sin, so that in him we might become the righteousness of God.',
    translation: 'ESV',
    theologicalTopic: 'Christ Who Knew No Sin & Imputed Righteousness',
    keywords: ['2 corinthians 5:21', 'knew no sin', 'sinless', 'without sin', 'atonement', 'righteousness of god', 'imputation'],
    greekHebrew: [
      { term: 'μὴ γνόντα ἁμαρτίαν', transliteration: 'Mē gnonta hamartian', strongs: 'G1097 / G266', meaning: 'Having known no sin whatsoever' }
    ]
  },
  {
    ref: 'Hebrews 4:15',
    book: 'Hebrews',
    chapter: 4,
    verseRange: '15',
    verbatimText: 'For we do not have a high priest who is unable to sympathize with our weaknesses, but one who in every respect has been tempted as we are, yet without sin.',
    translation: 'ESV',
    theologicalTopic: 'Tempted in All Respects Yet Without Sin',
    keywords: ['hebrews 4:15', 'without sin', 'tempted yet without sin', 'high priest', 'sinless jesus', 'impeccability'],
    greekHebrew: [
      { term: 'χωρὶς ἁμαρτίας', transliteration: 'Chōris hamartias', strongs: 'G5565 / G266', meaning: 'Completely without, apart from sin' }
    ]
  },
  {
    ref: '1 Peter 2:22',
    book: '1 Peter',
    chapter: 2,
    verseRange: '22',
    verbatimText: 'He committed no sin, neither was deceit found in his mouth.',
    translation: 'ESV',
    theologicalTopic: 'The Spotless Lamb Who Committed No Sin',
    keywords: ['1 peter 2:22', 'committed no sin', 'no deceit', 'spotless lamb', 'isaiah 53'],
    greekHebrew: [
      { term: 'ἁμαρτίαν οὐκ ἐποίησεν', transliteration: 'Hamartian ouk epoiēsen', strongs: 'G266 / G4160', meaning: 'He did not commit sin' }
    ]
  },

  // =========================================================================
  // EUCHARIST & THE REAL PRESENCE
  // =========================================================================
  {
    ref: 'John 6:51–58',
    book: 'John',
    chapter: 6,
    verseRange: '51-58',
    verbatimText: 'I am the living bread that came down from heaven. If anyone eats of this bread, he will live forever. And the bread that I will give for the life of the world is my flesh. ... Truly, truly, I say to you, unless you eat the flesh of the Son of Man and drink his blood, you have no life in you. Whoever feeds on my flesh and drinks my blood has eternal life, and I will raise him up on the last day. For my flesh is true food, and my blood is true drink.',
    translation: 'ESV / RSVCE',
    theologicalTopic: 'The Bread of Life Discourse & The Real Presence',
    keywords: ['john 6:51', 'john 6:53', 'john 6:54', 'john 6:55', 'flesh is true food', 'blood is true drink', 'eucharist', 'real presence', 'transubstantiation', 'communion'],
    greekHebrew: [
      { term: 'σάρξ', transliteration: 'Sarx', strongs: 'G4561', meaning: 'Flesh, literal bodily reality (John 6:51)' },
      { term: 'τρώγων', transliteration: 'Trōgōn', strongs: 'G5176', meaning: 'Chewing, eating, feeding upon (John 6:54)' }
    ]
  },

  // =========================================================================
  // BAPTISM & REGENERATION
  // =========================================================================
  {
    ref: 'John 3:3–5',
    book: 'John',
    chapter: 3,
    verseRange: '3-5',
    verbatimText: 'Jesus answered him, "Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God." Nicodemus said to him, "How can a man be born when he is old?" ... Jesus answered, "Truly, truly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God."',
    translation: 'ESV',
    theologicalTopic: 'Born of Water and the Spirit',
    keywords: ['john 3:5', 'born of water and spirit', 'nicodemus', 'born again', 'anothen', 'baptism', 'baptismal regeneration'],
    greekHebrew: [
      { term: 'ἄνωθεν', transliteration: 'Anōthen', strongs: 'G509', meaning: 'From above, anew, again (John 3:3)' },
      { term: 'ἐξ ὕδατος καὶ πνεύματος', transliteration: 'Ex hydatos kai pneumatos', strongs: 'G5204 / G4151', meaning: 'Out of water and the Spirit (John 3:5)' }
    ]
  },
  {
    ref: 'Acts 2:38',
    book: 'Acts',
    chapter: 2,
    verseRange: '38',
    verbatimText: 'And Peter said to them, "Repent and be baptized every one of you in the name of Jesus Christ for the forgiveness of your sins, and you will receive the gift of the Holy Spirit."',
    translation: 'ESV',
    theologicalTopic: 'Apostolic Baptism for Forgiveness of Sins',
    keywords: ['acts 2:38', 'repent and be baptized', 'forgiveness of sins', 'gift of the holy spirit', 'pentecost', 'peter sermon'],
    greekHebrew: [
      { term: 'εἰς ἄφεσιν τῶν ἁμαρτιῶν', transliteration: 'Eis aphesin tōn hamartiōn', strongs: 'G859 / G266', meaning: 'For the remission/forgiveness of sins' }
    ]
  },
  {
    ref: '1 Peter 3:21',
    book: '1 Peter',
    chapter: 3,
    verseRange: '21',
    verbatimText: 'Baptism, which corresponds to this, now saves you, not as a removal of dirt from the body but as an appeal to God for a good conscience, through the resurrection of Jesus Christ.',
    translation: 'ESV',
    theologicalTopic: 'Baptism Now Saves You Through the Resurrection',
    keywords: ['1 peter 3:21', 'baptism now saves you', 'appeal to god', 'good conscience', 'noah ark typology'],
    greekHebrew: [
      { term: 'ἀντίτυπον', transliteration: 'Antitypon', strongs: 'G499', meaning: 'Antitype, fulfillment corresponding to a biblical type' }
    ]
  },

  // =========================================================================
  // PETRINE OFFICE & THE KEYS OF THE KINGDOM
  // =========================================================================
  {
    ref: 'Matthew 16:18–19',
    book: 'Matthew',
    chapter: 16,
    verseRange: '18-19',
    verbatimText: 'And I tell you, you are Peter, and on this rock I will build my church, and the gates of hell shall not prevail against it. I will give you the keys of the kingdom of heaven, and whatever you bind on earth shall be bound in heaven, and whatever you loose on earth shall be loosed in heaven.',
    translation: 'ESV',
    theologicalTopic: 'The Confession of Peter, The Rock & The Keys of the Kingdom',
    keywords: ['matthew 16', 'matthew 16:18', 'matthew 16:19', 'peter', 'petros', 'petra', 'rock', 'gates of hell', 'keys of the kingdom', 'bind and loose', 'church'],
    greekHebrew: [
      { term: 'Πέτρος', transliteration: 'Petros', strongs: 'G4074', meaning: 'Peter, stone, isolated boulder' },
      { term: 'πέτρᾳ', transliteration: 'Petra', strongs: 'G4073', meaning: 'Rock, bedrock, solid foundational stone (Matthew 16:18)' },
      { term: 'κλεῖδας', transliteration: 'Kleidas', strongs: 'G2807', meaning: 'Keys, authority of stewardship and government (Matthew 16:19)' }
    ]
  }
];

export function findMatchingScriptures(query: string, limit: number = 3): ScripturePassage[] {
  const lowerQ = query.toLowerCase();
  const queryWords = lowerQ.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

  const scored = CANONICAL_SCRIPTURE_CORPUS.map(p => {
    let score = 0;
    const lowerRef = p.ref.toLowerCase();
    const lowerKeywords = p.keywords.map(k => k.toLowerCase());
    const lowerTopic = p.theologicalTopic.toLowerCase();
    const lowerText = p.verbatimText.toLowerCase();

    // Exact reference mention in query (e.g. "luke 1", "luke 1:35", "john 19")
    if (lowerQ.includes(p.book.toLowerCase()) && (lowerQ.includes(p.chapter.toString()) || lowerRef.includes(lowerQ))) {
      score += 60;
    }

    // Keyword and topic matching
    for (const kw of lowerKeywords) {
      if (lowerQ.includes(kw)) {
        score += 25;
      }
    }

    for (const word of queryWords) {
      if (lowerKeywords.some(k => k.includes(word))) {
        score += 10;
      }
      if (lowerTopic.includes(word)) {
        score += 8;
      }
      if (lowerText.includes(word)) {
        score += 3;
      }
    }

    return { passage: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.passage);
}
