export type DenominationalLens =
  | 'catholic'
  | 'orthodox'
  | 'reformed'
  | 'lutheran'
  | 'wesleyan'
  | 'anglican'
  | 'baptist_evangelical';

export interface DenominationConfig {
  id: DenominationalLens;
  name: string;
  traditionGroup: string;
  tagline: string;
  accentColor: string;
  icon: string;
  confessionalStandard: string;
  description: string;
}

export const DENOMINATIONS: DenominationConfig[] = [
  {
    id: 'catholic',
    name: 'Roman Catholic',
    traditionGroup: 'Catholic',
    tagline: 'Sacred Tradition & Magisterium',
    accentColor: '#d97706',
    icon: '🇻🇦',
    confessionalStandard: 'Catechism of the Catholic Church, Council of Trent, Vatican II',
    description: 'Interprets Scripture in harmony with Sacred Tradition, Church Fathers, the living Magisterium, and sacramental communion.'
  },
  {
    id: 'orthodox',
    name: 'Eastern Orthodox',
    traditionGroup: 'Orthodox',
    tagline: 'Holy Fathers & Theosis',
    accentColor: '#b45309',
    icon: '☦️',
    confessionalStandard: 'Seven Ecumenical Councils, Divine Liturgy, St. Gregory Palamas',
    description: 'Views Scripture through the consensus of the early Holy Fathers, liturgical mystery, hesychasm, and participatory union with God (theosis).'
  },
  {
    id: 'reformed',
    name: 'Reformed & Presbyterian',
    traditionGroup: 'Reformed',
    tagline: 'Sovereign Grace & Divine Covenants',
    accentColor: '#6366f1',
    icon: '🏛️',
    confessionalStandard: 'Westminster Confession of Faith (WCF), Heidelberg Catechism, Canons of Dort',
    description: 'Emphasizes God’s absolute sovereignty, covenant theology, unmerited election, total depravity, and the Solas of the Reformation.'
  },
  {
    id: 'lutheran',
    name: 'Lutheran',
    traditionGroup: 'Lutheran',
    tagline: 'Law & Gospel / Sola Fide',
    accentColor: '#0284c7',
    icon: '🕊️',
    confessionalStandard: 'Augsburg Confession (1530), Book of Concord, Luther’s Catechisms',
    description: 'Distinguishes between Law and Gospel, confessing justification by grace alone through faith, and the real sacramental presence in Word and Sacrament.'
  },
  {
    id: 'wesleyan',
    name: 'Wesleyan & Methodist',
    traditionGroup: 'Wesleyan',
    tagline: 'Prevenient Grace & Holy Love',
    accentColor: '#ec4899',
    icon: '🔥',
    confessionalStandard: 'John Wesley’s Standard Sermons & Notes, Methodist Articles of Religion',
    description: 'Highlights universal atonement, prevenient grace enabling human response, the witness of the Spirit, and entire sanctification in love.'
  },
  {
    id: 'anglican',
    name: 'Anglican',
    traditionGroup: 'Anglican',
    tagline: 'Via Media & Liturgical Prayer',
    accentColor: '#8b5cf6',
    icon: '⛪',
    confessionalStandard: 'Thirty-Nine Articles of Religion (1571), Book of Common Prayer (BCP)',
    description: 'Balances Scripture as the supreme rule of faith with ancient Catholic creeds, historical episcopacy, and liturgical worship.'
  },
  {
    id: 'baptist_evangelical',
    name: 'Baptist & Evangelical',
    traditionGroup: 'Evangelical',
    tagline: 'Believer’s Faith & Scripture Inerrancy',
    accentColor: '#10b981',
    icon: '📖',
    confessionalStandard: 'Baptist Faith & Message (BF&M 2000), Chicago Statement on Biblical Inerrancy',
    description: 'Focuses on personal conversion, believer’s baptism by immersion, the inerrant authority of Scripture, and the Great Commission.'
  }
];
export interface TheologicalInsight {
  passageRef: string;
  conciseOverview: string;
  theologicalThemes: string[];
  historicalContext: string;
  lensPerspectives: Record<DenominationalLens, string> | Record<string, string>;
  originalLanguageInsights: {
    term: string;
    originalScript: string;
    transliteration: string;
    strongsRef: string;
    nuance: string;
  }[];
  suggestedQuestions: string[];
  practicalApplication: string;
}

export const THEOLOGICAL_INSIGHTS: Record<string, TheologicalInsight> = {
  'john_3_1': {
    passageRef: 'John 3:1',
    conciseOverview: 'Nicodemus, a prominent Pharisee and member of the Sanhedrin, initiates a secret nocturnal visit to Jesus, representing the highest echelon of Jewish religious scholarship seeking divine truth.',
    theologicalThemes: [
      'Religious Authority vs Divine Revelation',
      'The Search for Truth Amidst Peer Pressure',
      'The Limitations of Earthly Titles and Pedigree'
    ],
    historicalContext: 'As an archōn (ruler), Nicodemus belonged to the 71-member Great Sanhedrin in Jerusalem, possessing elite religious, judicial, and political authority under Roman oversight.',
    lensPerspectives: {
      historical_grammatical: 'Nicodemus is identified by name, sect (Pharisee), and office (archōn), situating the narrative firmly in first-century Second Temple Jewish politics.',
      reformed: 'Demonstrates that outward religious pedigree and moral uprightness cannot substitute for sovereign divine regeneration.',
      wesleyan: 'Shows God’s prevenient grace awakening hunger in the heart of an earnest religious leader seeking truth in humility.',
      anglican: 'A pastoral depiction of the soul’s gradual pilgrimage from darkness and confusion into the illumination of Christ.',
      catholic: 'Highlights the mystery of encounter between the Old Covenant priesthood and the incarnate Logos.',
      baptist_evangelical: 'Shows that sincerity and moral standing are not enough; every person must personally encounter and receive Christ.'
    },
    originalLanguageInsights: [
      {
        term: 'Ruler / Sanhedrist',
        originalScript: 'ἄρχων',
        transliteration: 'archōn',
        strongsRef: 'G758',
        nuance: 'A magistrate or member of the Sanhedrin possessing elite religious and civil authority in Roman Judea.'
      },
      {
        term: 'Pharisee',
        originalScript: 'Φαρισαῖος',
        transliteration: 'Pharisaios',
        strongsRef: 'G5330',
        nuance: 'Literally "separated one"—a member of the strict religious party dedicated to oral and written Torah observance.'
      }
    ],
    suggestedQuestions: [
      'What social and religious risks did Nicodemus take by approaching Jesus?',
      'How does John contrast Nicodemus’s elite standing with Jesus’ humble origins?',
      'What was the primary role of the Great Sanhedrin in first-century Jerusalem?'
    ],
    practicalApplication: 'Do not allow social status, church reputation, or fear of peers prevent you from bringing your honest questions and doubts to Jesus.'
  },
  'john_3_2': {
    passageRef: 'John 3:2',
    conciseOverview: 'Nicodemus acknowledges Jesus as a "teacher come from God" based on His miraculous signs (sēmeia), yet operates from an incomplete theological understanding of who Christ truly is.',
    theologicalThemes: [
      'Miraculous Signs as Divine Attestation',
      'The Darkness-to-Light Motif in Johannine Theology',
      'Incomplete Faith based only on Signs'
    ],
    historicalContext: 'Rabbinic scholars often engaged in nocturnal study to avoid distractions; however, John uses "night" (nyx) symbolically throughout his Gospel for spiritual ignorance and secrecy.',
    lensPerspectives: {
      historical_grammatical: 'Nicodemus speaks in the plural ("we know"), representing a faction of inquiring Jewish leaders intrigued by Jesus’ recent cleansing of the Temple and miracles.',
      reformed: 'Intellectual assent and acknowledging Jesus as a moral teacher are insufficient; saving faith requires spiritual rebirth.',
      wesleyan: 'Nicodemus takes his first step in responding to the light of prevenient grace, drawing closer to the true Light.',
      anglican: 'Illustrates the first stage of the catechumenate: moving from natural curiosity to sacramental illumination.',
      catholic: 'Points to the necessity of moving beyond external miracles to contemplative union with the Divine Person.',
      baptist_evangelical: 'Emphasizes that Jesus is more than a great moral teacher or prophet—He is Lord and Savior.'
    },
    originalLanguageInsights: [
      {
        term: 'Signs / Miracles',
        originalScript: 'σημεῖα',
        transliteration: 'sēmeia',
        strongsRef: 'G4592',
        nuance: 'Supernatural pointers designed not merely to astonish, but to reveal the divine authority and identity of Jesus.'
      },
      {
        term: 'Night',
        originalScript: 'νυκτός',
        transliteration: 'nyktos',
        strongsRef: 'G3571',
        nuance: 'Carries physical reality and deep Johannine symbolism for spiritual darkness and separation from divine light.'
      }
    ],
    suggestedQuestions: [
      'Why did Nicodemus say "we know" instead of "I know"?',
      'How do the "signs" (sēmeia) in John differ from mere wonder-working miracles?',
      'What is the danger of viewing Jesus only as a good moral teacher?'
    ],
    practicalApplication: 'Examine your view of Jesus today. Do you treat Him merely as an inspiring life coach, or as the sovereign Lord of your life?'
  },
  'john_3_3': {
    passageRef: 'John 3:3',
    conciseOverview: 'Jesus cuts through religious flattery to proclaim the fundamental spiritual axiom: unless a person is born from above (anōthen), they cannot perceive or enter the Kingdom of God.',
    theologicalThemes: [
      'Spiritual Regeneration as Divine Monergism',
      'The Kingdom of God as a Spiritual Realm',
      'Human Inability to Perceive Heavenly Realities'
    ],
    historicalContext: 'First-century Jews believed Abrahamic descent guaranteed entrance into the Messianic Age. Jesus radically upends this biological and nationalistic security.',
    lensPerspectives: {
      historical_grammatical: '"Anōthen" carries a deliberate double meaning: "again" (temporally) and "from above" (divinely/spatially), which John utilizes intentionally.',
      reformed: 'The locus classicus for monergistic regeneration: spiritual life must be granted sovereignly by God before a sinner can see or desire the Kingdom.',
      wesleyan: 'Emphasizes the decisive new birth where the Holy Spirit transforms the inner nature, awakening faith and initiating progressive sanctification.',
      anglican: 'Historically linked to baptismal regeneration and the sacramental entry into the Body of Christ.',
      catholic: 'The beginning of theosis—regeneration restores the image and likeness of God damaged by ancestral sin.',
      baptist_evangelical: 'The foundational call to personal conversion: being "born again" through faith in Christ as Savior.'
    },
    originalLanguageInsights: [
      {
        term: 'Born from Above / Again',
        originalScript: 'γεννηθῇ ἄνωθεν',
        transliteration: 'gennēthē anōthen',
        strongsRef: 'G1080 / G509',
        nuance: 'A passive divine action meaning both "born a second time" and "originated from the heavenly realm above."'
      },
      {
        term: 'Kingdom of God',
        originalScript: 'βασιλείαν τοῦ θεοῦ',
        transliteration: 'basileian tou theou',
        strongsRef: 'G932',
        nuance: 'The dynamic rule, reign, and presence of God inaugurated in Christ.'
      }
    ],
    suggestedQuestions: [
      'What is the precise Greek nuance of "anōthen" (born again vs born from above)?',
      'Why was the concept of a second birth so perplexing to a master teacher like Nicodemus?',
      'How does spiritual rebirth differ from moral self-reformation?'
    ],
    practicalApplication: 'Spiritual life is not achieved by your willpower; it is received as a gift from above. Rest in God’s renewing power today.'
  },
  'john_3_4': {
    passageRef: 'John 3:4',
    conciseOverview: 'Nicodemus stumbles over Jesus’ words with literalistic physical reasoning, illustrating how natural human intellect cannot grasp spiritual mysteries without divine illumination.',
    theologicalThemes: [
      'The Conflict between Earthly Reason and Spiritual Revelation',
      'Misunderstanding Spiritual Metaphors',
      'The Necessity of the Holy Spirit to Interpret Divine Truth'
    ],
    historicalContext: 'Nicodemus was trained in rigorous literal, haggadic, and halakhic rabbinic argumentation, yet found Jesus’ metaphysical language incomprehensible.',
    lensPerspectives: {
      historical_grammatical: 'Illustrates John’s recurring narrative technique of dramatic irony: an interlocutor takes Jesus’ spiritual sayings with wooden physical literalism.',
      reformed: 'Illustrates the total depravity of the natural mind (1 Cor 2:14): the natural man cannot understand the things of the Spirit of God.',
      wesleyan: 'Highlights the tension when human logic encounters the supernatural call of transforming grace.',
      anglican: 'Reminds us of the limits of human reason when divorced from contemplative prayer and divine mystery.',
      catholic: 'Underlines apophatic theology: divine truths exceed human rational categorization.',
      baptist_evangelical: 'A warning against trying to analyze spiritual regeneration through purely secular or materialist frameworks.'
    },
    originalLanguageInsights: [
      {
        term: 'Womb',
        originalScript: 'κοιλίαν',
        transliteration: 'koilian',
        strongsRef: 'G2836',
        nuance: 'Maternal womb, highlighting Nicodemus’s physical, biological misunderstanding of Jesus’ spiritual command.'
      },
      {
        term: 'Old',
        originalScript: 'γέρων',
        transliteration: 'gerōn',
        strongsRef: 'G1088',
        nuance: 'An elderly man; implies Nicodemus was advanced in years and set in his religious patterns.'
      }
    ],
    suggestedQuestions: [
      'Why did Nicodemus jump to the absurd image of re-entering his mother’s womb?',
      'How does John use dramatic irony throughout his Gospel?',
      'In what ways do modern readers also reduce spiritual truths to purely physical or moral categories?'
    ],
    practicalApplication: 'When Scripture challenges your preconceptions, ask the Holy Spirit for spiritual sight rather than leaning on your own intellectual assumptions.'
  },
  'john_3_5': {
    passageRef: 'John 3:5',
    conciseOverview: 'Jesus reiterates the prerequisite for the Kingdom: one must be born "of water and the Spirit," echoing Ezekiel’s prophecy of eschatological cleansing and divine heart renewal.',
    theologicalThemes: [
      'Ezekiel 36 Covenant Cleansing and Renewal',
      'The Dual Dimension of Salvation (Pardon & Regeneration)',
      'Water as Purification and Spirit as Life'
    ],
    historicalContext: 'Draws directly upon Ezekiel 36:25–27 ("I will sprinkle clean water upon you... and put a new Spirit within you"), which every Sanhedrist was expected to know.',
    lensPerspectives: {
      historical_grammatical: 'In Jewish prophetic idiom, "water and spirit" refers to prophetic cleansing from defilement and spiritual transformation promised for the Messianic era.',
      reformed: 'Water symbolizes internal cleansing from guilt, while the Spirit imparts new spiritual vitality to dead hearts.',
      wesleyan: 'Emphasizes the dual aspect of salvation: justification (cleansing) and regeneration (the Spirit’s transforming power).',
      anglican: 'Firmly anchored in the sacrament of Holy Baptism as the visible sign of inward spiritual rebirth.',
      catholic: 'The foundational text for the Sacrament of Baptism as the fountain of new divine life in Christ.',
      baptist_evangelical: 'Highlights the internal cleansing by the Word of God and the direct supernatural indwelling of the Holy Spirit.'
    },
    originalLanguageInsights: [
      {
        term: 'Water',
        originalScript: 'ὕδατος',
        transliteration: 'hydatos',
        strongsRef: 'G5204',
        nuance: 'Used in Old Testament prophetic theology for ritual cleansing, moral purification, and spiritual thirst.'
      },
      {
        term: 'Spirit',
        originalScript: 'πνεύματος',
        transliteration: 'pneumatos',
        strongsRef: 'G4151',
        nuance: 'The Holy Spirit of God who imparts uncreated divine life and regenerates human hearts.'
      }
    ],
    suggestedQuestions: [
      'How does Ezekiel 36:25–27 shed light on Jesus’ phrase "water and the Spirit"?',
      'What are the historic debates between sacramental (baptismal) and non-sacramental interpretations of this verse?',
      'What does it mean practically to enter the Kingdom of God today?'
    ],
    practicalApplication: 'Thank God for both His cleansing pardon that washes away your guilt and His indwelling Spirit who empowers you with new life.'
  },
  'john_3_6': {
    passageRef: 'John 3:6',
    conciseOverview: 'Jesus establishes the ontological boundary between two realms: natural human generation (flesh) can only produce fallen flesh, whereas only the Holy Spirit can generate spiritual life.',
    theologicalThemes: [
      'The Ontological Distinction between Nature and Grace',
      'The Inadequacy of Human Self-Effort (Sarx)',
      'The Supernatural Origin of the Christian Life'
    ],
    historicalContext: 'Challenges Greco-Roman and Jewish views that moral self-discipline (paideia/Torah study) could elevate human nature to divine communion on its own.',
    lensPerspectives: {
      historical_grammatical: '"Sarx" (flesh) denotes human nature in its frailty, mortality, and fallenness, incapable of bridging the gulf to the divine sphere.',
      reformed: 'Bedrock for total depravity: fallen nature produces only fallen fruits; human nature cannot regenerate itself.',
      wesleyan: 'Shows why entire sanctification requires the continuing sanctifying work of the Holy Spirit, not just human willpower.',
      anglican: 'Emphasizes the necessity of divine grace operating through the means of grace to sustain the spiritual life.',
      catholic: 'Contrasts the corruptible state of the fallen world with the deifying grace communicated by the Holy Spirit.',
      baptist_evangelical: 'A clear reminder that religious heritage from parents cannot save; every individual needs personal spiritual rebirth.'
    },
    originalLanguageInsights: [
      {
        term: 'Flesh',
        originalScript: 'σάρξ',
        transliteration: 'sarx',
        strongsRef: 'G4561',
        nuance: 'Frail, fallen human nature in its earthly limitations, incapable of producing divine life on its own.'
      },
      {
        term: 'Spirit',
        originalScript: 'πνεῦμα',
        transliteration: 'pneuma',
        strongsRef: 'G4151',
        nuance: 'The uncreated, supernatural Holy Spirit of God who communicates divine life.'
      }
    ],
    suggestedQuestions: [
      'What did Jesus mean by "that which is born of the flesh is flesh"?',
      'Why is human moral discipline unable to produce true spiritual life?',
      'How does this verse shape our view of Christian parenting and heritage?'
    ],
    practicalApplication: 'Stop relying on your fleshly energy to live a holy life. Rely consciously on the indwelling Holy Spirit for strength and purity.'
  },
  'john_3_7': {
    passageRef: 'John 3:7',
    conciseOverview: 'Jesus commands Nicodemus not to be astonished at the divine imperative: "You [plural] must be born again," showing that rebirth is universally necessary for all humanity without exception.',
    theologicalThemes: [
      'The Universal Necessity of Regeneration',
      'The Divine Imperative (Dei)',
      'Overcoming Intellectual Astonishment'
    ],
    historicalContext: 'The Greek pronoun "hymas" is plural ("you all"), demonstrating that Jesus was addressing not just Nicodemus, but the entire religious establishment of Israel and all humanity.',
    lensPerspectives: {
      historical_grammatical: 'The Greek verb "thaumasēs" (marvel/astonish) in the subjunctive with negative imperative means "stop marveling"—this should have been expected from the prophets.',
      reformed: 'The divine "must" (dei) underscores the unyielding sovereign requirement of new birth for salvation.',
      wesleyan: 'John Wesley preached extensively on this verse as the great turning point in Christian conversion and holy living.',
      anglican: 'Affirms the catholic and universal scope of the Gospel: every human without distinction needs Christ.',
      catholic: 'Reflects the radical renewal required for participation in the divine nature (2 Peter 1:4).',
      baptist_evangelical: 'A core text for evangelistic proclamation: rebirth is non-negotiable for every single soul.'
    },
    originalLanguageInsights: [
      {
        term: 'Must / Divine Necessity',
        originalScript: 'δεῖ',
        transliteration: 'dei',
        strongsRef: 'G1163',
        nuance: 'Expresses absolute divine necessity, unavoidable obligation rooted in God’s redemptive purpose.'
      },
      {
        term: 'Marvel / Be Astonished',
        originalScript: 'θαυμάσῃς',
        transliteration: 'thaumasēs',
        strongsRef: 'G2296',
        nuance: 'To wonder in bewildered disbelief or shock.'
      }
    ],
    suggestedQuestions: [
      'Why did Jesus use the plural "you" (hymas) in verse 7?',
      'Why were the Pharisees shocked to hear that they too needed to be born again?',
      'What makes the new birth an absolute "must" for entrance into God’s Kingdom?'
    ],
    practicalApplication: 'Do not settle for a cultural or inherited faith. Seek the genuine, living reality of Christ’s transforming life in your heart.'
  },
  'john_3_8': {
    passageRef: 'John 3:8',
    conciseOverview: 'Jesus compares the sovereign, mysterious movement of the Holy Spirit to the wind: unseen in origin and destination, yet undeniably recognized by its transformative acoustic and visible effects.',
    theologicalThemes: [
      'The Mysterious Sovereignty of the Holy Spirit',
      'Unseen Divine Power with Visible Fruits',
      'Surrendering Intellectual Control to God'
    ],
    historicalContext: 'Both Hebrew (Ruach) and Greek (Pneuma) use the same single word for "wind," "breath," and "spirit," creating a vivid acoustic wordplay in Jesus’ spoken dialogue.',
    lensPerspectives: {
      historical_grammatical: 'Jesus uses an audible metaphor: you hear the sound (phōnē) of the wind even if you cannot chart its exact origin or path.',
      reformed: 'A premier testament to the invincible, sovereign, and selective work of the Spirit in calling elect souls to life.',
      wesleyan: 'The Spirit blows everywhere, gently awakening and transforming all who do not resist His holy wind.',
      anglican: 'A reminder of the transcendent mystery of the Third Person of the Trinity acting beyond human institutional formulas.',
      catholic: 'Reflects the mystical, apophatic theology of the Holy Spirit working in the heart of believers.',
      baptist_evangelical: 'Encouragement that the Holy Spirit can move unpredictably and powerfully to convert any heart, regardless of background.'
    },
    originalLanguageInsights: [
      {
        term: 'Wind / Spirit',
        originalScript: 'τὸ πνεῦμα',
        transliteration: 'to pneuma',
        strongsRef: 'G4151',
        nuance: 'Simultaneously means physical wind and the invisible Divine Spirit, emphasizing freedom and power.'
      },
      {
        term: 'Blows / Breathes',
        originalScript: 'πνεῖ',
        transliteration: 'pnei',
        strongsRef: 'G4154',
        nuance: 'To breathe or blow with life-giving motion and authority.'
      }
    ],
    suggestedQuestions: [
      'What does the metaphor of wind teach us about the predictability of God’s work?',
      'How can we observe the tangible "fruits" of the Spirit in our everyday lives?',
      'How does the double meaning of "pneuma" enrich this verse?'
    ],
    practicalApplication: 'Yield your rigid expectations to God today. Allow the wind of His Spirit to blow through your plans and guide your steps.'
  },
  'john_3_9': {
    passageRef: 'John 3:9',
    conciseOverview: 'Nicodemus responds with a bewildered question: "How can these things be?" demonstrating the ultimate collapse of human scholasticism when confronted with divine mystery.',
    theologicalThemes: [
      'The Limits of Human Intellect before Divine Mystery',
      'From Self-Confidence to Honest Perplexity',
      'The Gateway of Humility in Spiritual Learning'
    ],
    historicalContext: 'A member of the Sanhedrin was revered for having answers to every legal and halakhic question; here, Nicodemus is reduced to honest confusion.',
    lensPerspectives: {
      historical_grammatical: 'The Greek phrase "Pōs dynatai tauta genesthai" echoes Mary’s question in Luke 1:34, but with theological hesitation rather than humble submission.',
      reformed: 'Fallen human reason cannot comprehend the mechanics of divine regeneration without supernatural illumination.',
      wesleyan: 'An important stage in spiritual awakening: acknowledging one’s own bankruptcy before God’s wisdom.',
      anglican: 'Points to the necessity of reverent humility in theological inquiry.',
      catholic: 'The transition from rationalistic dogmatism into contemplative awe.',
      baptist_evangelical: 'Honest questions are welcomed by Jesus; acknowledging that we don’t understand is the first step of discipleship.'
    },
    originalLanguageInsights: [
      {
        term: 'How Can These Things Be?',
        originalScript: 'Πῶς δύναται ταῦτα γενέσθαι;',
        transliteration: 'Pōs dynatai tauta genesthai;',
        strongsRef: 'G4459 / G1410',
        nuance: 'An expression of genuine intellectual disorientation when faced with supernatural truth.'
      }
    ],
    suggestedQuestions: [
      'Why is honest confession of ignorance often the prerequisite for spiritual growth?',
      'How did Jesus handle Nicodemus’s perplexity with grace and truth?'
    ],
    practicalApplication: 'Bring your honest questions and confusion to God. He does not reject sincere seekers who admit their limitations.'
  },
  'john_3_10': {
    passageRef: 'John 3:10',
    conciseOverview: 'Jesus challenges Nicodemus: "Are you the teacher of Israel and yet you do not understand these things?" exposing the tragic divide between academic knowledge and spiritual reality.',
    theologicalThemes: [
      'Academic Theology vs Experiential Spiritual Reality',
      'The Old Testament Roots of the New Birth',
      'Gentle Rebukes from the Divine Master'
    ],
    historicalContext: 'The definite article "ho didaskalos" implies Nicodemus was not merely a teacher, but "the eminent master teacher" recognized throughout the nation.',
    lensPerspectives: {
      historical_grammatical: 'The definite article "ho didaskalos tou Israēl" indicates Nicodemus held a position of preeminent scholastic authority.',
      reformed: 'A sobering reminder that extensive biblical scholarship does not equal saving knowledge of God.',
      wesleyan: 'Urges believers to pair theological orthodoxy with vital, living holiness of heart and life.',
      anglican: 'A warning against dead intellectualism in liturgical leadership.',
      catholic: 'Distinguishes between scholastic theology (theoria) and true mystical union with God (theosis).',
      baptist_evangelical: 'Reminds Bible teachers and leaders to never let biblical knowledge replace a personal walk with Christ.'
    },
    originalLanguageInsights: [
      {
        term: 'The Teacher of Israel',
        originalScript: 'ὁ διδάσκαλος τοῦ Ἰσραὴλ',
        transliteration: 'ho didaskalos tou Israēl',
        strongsRef: 'G1320',
        nuance: 'The authoritative master rabbinic instructor of the covenant nation.'
      }
    ],
    suggestedQuestions: [
      'Why should Nicodemus have understood the new birth from the Old Testament?',
      'What Old Testament scriptures (like Jeremiah 31 and Ezekiel 36) prefigured the new birth?',
      'How can modern Christians avoid the trap of knowing the Bible without knowing God?'
    ],
    practicalApplication: 'Do not let your Bible knowledge puff you up. Ask God to make every doctrine you study become a living reality in your character.'
  },
  'john_3_11': {
    passageRef: 'John 3:11',
    conciseOverview: 'Jesus contrasts the authoritative eyewitness testimony of Heaven with human religious skepticism: "We speak of what we know, and bear witness to what we have seen, but you do not receive our testimony."',
    theologicalThemes: [
      'The Epistemic Authority of Jesus Christ',
      'Divine Eyewitness vs Human Speculation',
      'The Tragedy of Unbelief in the Face of Truth'
    ],
    historicalContext: 'Jesus speaks as the incarnate Word who dwelt with the Father, contrasting His firsthand celestial knowledge with rabbinic tradition.',
    lensPerspectives: {
      historical_grammatical: 'The shift to "we speak" may encompass Jesus and the prophets, Jesus and John the Baptist, or the inner Trinitarian communion.',
      reformed: 'Affirms the absolute sufficiency and self-authenticating veracity of divine revelation.',
      wesleyan: 'Confronts the moral accountability of human will in resisting the clear light of truth.',
      anglican: 'Anchors the apostolic tradition in the firsthand testimony of the incarnate Lord.',
      catholic: 'Reflects the holy martyria (witness) passed down faithfully through the apostolic communion.',
      baptist_evangelical: 'Calls every hearer to place unreserved trust in the verified testimony of Jesus.'
    },
    originalLanguageInsights: [
      {
        term: 'Bear Witness / Testify',
        originalScript: 'μαρτυροῦμεν',
        transliteration: 'martyroumen',
        strongsRef: 'G3140',
        nuance: 'To give sworn eyewitness legal testimony concerning verified historical and divine realities.'
      }
    ],
    suggestedQuestions: [
      'Who is included in Jesus’ use of the plural "we" in verse 11?',
      'Why is human unbelief ultimately a moral resistance to divine testimony rather than just an intellectual puzzle?'
    ],
    practicalApplication: 'Anchor your faith not in changing cultural trends, but in the unwavering, verified testimony of Jesus Christ.'
  },
  'john_3_12': {
    passageRef: 'John 3:12',
    conciseOverview: 'Jesus highlights the epistemological ladder: if earthly analogies like the wind and birth are difficult to grasp, how can the human mind comprehend transcendent heavenly mysteries without faith?',
    theologicalThemes: [
      'Earthly Parables as Windows to Heavenly Realities',
      'The Progressive Revelation of God',
      'Faith as the Prerequisite for Spiritual Understanding'
    ],
    historicalContext: 'Rabbinic teachers used "mashal" (earthly parables) to explain Torah; Jesus points out that even His simplest earthly illustrations were stretching Nicodemus.',
    lensPerspectives: {
      historical_grammatical: '"Epigeia" (earthly things) refers to earthly analogies of spiritual birth; "epourania" (heavenly things) points to eternal Trinitarian councils and redemptive decrees.',
      reformed: 'Shows the infinite qualitative distinction between Creator and creature; heavenly things require sovereign revelation.',
      wesleyan: 'God meets us in our weakness with accessible earthly metaphors to gently guide our understanding.',
      anglican: 'Reflects the sacramental principle: visible earthly signs conveying invisible heavenly grace.',
      catholic: 'Highlights the mystery of the Economy of Salvation leading into the inner mystery of the Trinity.',
      baptist_evangelical: 'Encourages simple, childlike faith as the starting point for deep theological comprehension.'
    },
    originalLanguageInsights: [
      {
        term: 'Heavenly Things',
        originalScript: 'τὰ ἐπουράνια',
        transliteration: 'ta epourania',
        strongsRef: 'G2032',
        nuance: 'The transcendent realities, divine purposes, and heavenly mysteries belonging to the realm of God.'
      }
    ],
    suggestedQuestions: [
      'What did Jesus mean by "earthly things" versus "heavenly things"?',
      'How does Jesus use everyday metaphors to teach deep spiritual realities?'
    ],
    practicalApplication: 'Start by trusting God in the small, everyday areas of obedience. As you walk in the light you have, He will open deeper understanding.'
  },
  'john_3_13': {
    passageRef: 'John 3:13',
    conciseOverview: 'Jesus reveals His unique, unassailable qualification to reveal heavenly mysteries: only He who descended from heaven—the Son of Man—possesses native citizenship and authority in the heavenly realm.',
    theologicalThemes: [
      'The Pre-existence and Descent of the Incarnate Son',
      'The Son of Man as Heavenly Redeemer (Daniel 7)',
      'The Exclusive Epistemic Authority of Christ'
    ],
    historicalContext: 'Jewish apocryphal traditions spoke of Enoch or Moses ascending to heaven to receive secrets; Jesus declares that He alone descended with authentic heavenly authority.',
    lensPerspectives: {
      historical_grammatical: 'Connects the Johannine "Son of Man" with Daniel 7:13–14, portraying Jesus as the divine figure who descends into human history.',
      reformed: 'Highlights the hypostatic union and the eternal covenant of redemption between Father and Son.',
      wesleyan: 'Affirms that in Christ, the fullness of divine love has crossed the infinite divide to reach humanity.',
      anglican: 'A central text for the Incarnation celebrated in the Creeds and Christmas liturgy.',
      catholic: 'Emphasizes the Kenosis (self-emptying) of the Logos descending to deify human nature.',
      baptist_evangelical: 'Establishes Jesus as the one and only mediator between God and humankind.'
    },
    originalLanguageInsights: [
      {
        term: 'Descended from Heaven',
        originalScript: 'ὁ ἐκ τοῦ οὐρανοῦ καταβάς',
        transliteration: 'ho ek tou ouranou katabas',
        strongsRef: 'G2597 / G3772',
        nuance: 'To step down from the celestial heavenly realm into earthly human existence.'
      }
    ],
    suggestedQuestions: [
      'How does verse 13 refute claims of human mystical ascent into heaven?',
      'What is the theological background of the title "Son of Man" in Daniel 7?'
    ],
    practicalApplication: 'You do not have to climb up to heaven to find God; in Christ, God has descended into human history to find and save you.'
  },
  'john_3_14': {
    passageRef: 'John 3:14',
    conciseOverview: 'Jesus presents the prophetic typology of His crucifixion: just as Moses lifted up the bronze serpent in the wilderness, the Son of Man must be lifted up on the cross.',
    theologicalThemes: [
      'Old Testament Typology (Numbers 21 & the Bronze Serpent)',
      'The Necessity of the Atoning Cross',
      'The Paradox of the Lifted Up Savior (Exaltation in Crucifixion)'
    ],
    historicalContext: 'Recalls Numbers 21:4–9, where Israelites dying from venomous serpent bites were healed simply by looking in faith upon the bronze serpent mounted on a pole.',
    lensPerspectives: {
      historical_grammatical: '"Hypsōthēnai" (lifted up) carries a double meaning in John: physical suspension on the Roman cross and supreme celestial exaltation to glory.',
      reformed: 'The substitutionary atonement as the sole divine remedy for the lethal curse of human sin.',
      wesleyan: 'Universal invitation: just as any bitten Israelite could look and live, anyone who looks upon Christ in faith is healed.',
      anglican: 'Meditated upon during Holy Week and the veneration of the Cross.',
      catholic: 'The Cross as the Tree of Life overturning the tree of the knowledge of good and evil in Eden.',
      baptist_evangelical: 'A clear image of salvation received by simple faith—look to Jesus and live.'
    },
    originalLanguageInsights: [
      {
        term: 'Lifted Up',
        originalScript: 'ὑψωθῆναι',
        transliteration: 'hypsōthēnai',
        strongsRef: 'G5312',
        nuance: 'To elevate on a cross, and simultaneously to exalt into supreme cosmic majesty and honor.'
      }
    ],
    suggestedQuestions: [
      'Why did Jesus choose the strange story of the bronze serpent to illustrate His crucifixion?',
      'How is the cross both the place of ultimate humiliation and ultimate exaltation in John?'
    ],
    practicalApplication: 'When the venom of sin, shame, or despair bites your soul, look up at Jesus on the cross. His sacrifice brings complete healing.'
  },
  'john_3_15': {
    passageRef: 'John 3:15',
    conciseOverview: 'The purpose of Christ’s elevation on the cross: that everyone who places continuous, active trust in Him will possess divine, eternal life (zōēn aiōnion).',
    theologicalThemes: [
      'Faith as Continual Trust and Reliance',
      'Eternal Life as a Qualitative Gift',
      'Universal Accessibility of Grace to "Whoever"'
    ],
    historicalContext: 'Connects the immediate physical deliverance in Numbers 21 with eternal spiritual rescue from death through Christ.',
    lensPerspectives: {
      historical_grammatical: 'The present participle "pisteuōn" denotes active, ongoing faith rather than a single past intellectual nod.',
      reformed: 'Guarantees that all who are granted faith by the Father will surely possess eternal life and never be lost.',
      wesleyan: 'Emphasizes that saving faith is open to "whosoever" will respond to the light of the Gospel.',
      anglican: 'Celebrated in the Assurance of Pardon and the Eucharistic reception of Christ.',
      catholic: 'Eternal life is the participation in God’s uncreated divine energies beginning in this life.',
      baptist_evangelical: 'The simplicity of the Gospel: salvation by grace through personal faith in Jesus.'
    },
    originalLanguageInsights: [
      {
        term: 'Believes in Him',
        originalScript: 'πιστεύων ἐν αὐτῷ',
        transliteration: 'pisteuōn en autō',
        strongsRef: 'G4100',
        nuance: 'Continuous present participle denoting ongoing personal trust, reliance, and adhesion to Christ.'
      },
      {
        term: 'Eternal Life',
        originalScript: 'ζωὴν αἰώνιον',
        transliteration: 'zōēn aiōnion',
        strongsRef: 'G2222 / G166',
        nuance: 'The uncreated, qualitative life of God that transcends time and death.'
      }
    ],
    suggestedQuestions: [
      'What is the significance of the present continuous tense in "believing"?',
      'How does John define "eternal life" (zōē aiōnios)?'
    ],
    practicalApplication: 'Place your trust in Jesus again today. Faith is not just a decision made years ago; it is a daily, living relationship of resting in Him.'
  },
  'john_3_16': {
    passageRef: 'John 3:16',
    conciseOverview: 'The crown jewel of the Gospel: God’s self-sacrificing love for broken humanity motivated the gift of His unique Son, ensuring that all who place their trust in Him will not perish but inherit divine, eternal life.',
    theologicalThemes: [
      'Universal Scope of Divine Love (Agape)',
      'Incarnation and Atonement as Sacrificial Gift',
      'Saving Faith over Legal Condemnation',
      'Life in the Present Age and Eternity'
    ],
    historicalContext: 'Spoken during Jesus’ nocturnal dialogue in Jerusalem with Nicodemus, establishing that God’s love extends beyond ethnic boundaries to the entire world.',
    lensPerspectives: {
      historical_grammatical: 'The Greek connective "οὕτως" (houtōs) functions adverbially meaning "in this manner"—showing how intensely and through what method God demonstrated His covenant love.',
      reformed: 'Underscores the gracious initiative of the Father in providing the propitiatory Lamb for fallen sinners. The promise guarantees that all who believe will never perish.',
      wesleyan: 'Highlights the genuinely universal scope of God’s love for the entire fallen "world" (kosmos), affirming that Christ died for every human soul.',
      anglican: 'A foundational Eucharistic text reflecting the incarnational mystery where the eternal Word enters human flesh to inaugurate communion.',
      catholic: 'Points to the restorative healing of human nature: God’s gift makes it possible for humans to partake in divine life (theosis).',
      baptist_evangelical: 'The definitive summary of salvation by grace through personal faith in Jesus Christ, calling every individual to trust in the Savior.'
    },
    originalLanguageInsights: [
      {
        term: 'Loved',
        originalScript: 'ἠγάπησεν',
        transliteration: 'ēgapēsen (Aorist Active of Agapao)',
        strongsRef: 'G25',
        nuance: 'Denotes an unconditional, deliberate, and self-sacrificing volitional love rather than mere emotional affection.'
      },
      {
        term: 'Only Begotten / Unique',
        originalScript: 'μονογενῆ',
        transliteration: 'monogenē',
        strongsRef: 'G3439',
        nuance: 'Derived from monos ("only") + genos ("kind/order"). Refers to Jesus as uniquely one-of-a-kind in eternal essence with the Father.'
      },
      {
        term: 'World',
        originalScript: 'κόσμον',
        transliteration: 'kosmon',
        strongsRef: 'G2889',
        nuance: 'Humankind alienated from God, emphasizing that God loved a hostile, broken creation.'
      },
      {
        term: 'Perish',
        originalScript: 'ἀπόληται',
        transliteration: 'apolētai',
        strongsRef: 'G622',
        nuance: 'To be utterly ruined, lost, or separated from divine life and flourishing.'
      }
    ],
    suggestedQuestions: [
      'What is the precise theological distinction between "Agapao" and "Phileo"?',
      'What does "monogenēs" (uniquely begotten) mean regarding Christ’s divine nature?',
      'How does John 3:16 dismantle ethnic nationalism in first-century Judaism?'
    ],
    practicalApplication: 'Rest in the absolute security of God’s love today. Rather than living out of fear or spiritual guilt, remember that God’s love for you is proven by the gift of His Son.'
  },
  'john_3_17': {
    passageRef: 'John 3:17',
    conciseOverview: 'Jesus reveals the primary posture of God’s mission: God sent His Son not to pronounce punitive condemnation on the world, but to rescue and redeem fallen humanity through Him.',
    theologicalThemes: [
      'The Redemptive Mission over Retributive Judgment',
      'The Gracious Heart of the Father',
      'Salvation as Rescue and Healing'
    ],
    historicalContext: 'Many first-century Jewish apocalyptic texts anticipated a Messiah who would arrive to destroy the Gentile nations in vengeance; Jesus reveals the Messiah came to save.',
    lensPerspectives: {
      historical_grammatical: '"Krino" means legal condemnation and punitive sentencing; "sōzō" means rescue, healing, and restoration.',
      reformed: 'Reveals God’s benevolent posture in the offer of the Gospel to a world already under the curse of sin.',
      wesleyan: 'A cornerstone for understanding God’s holy love: His heart is always salvation, not condemnation.',
      anglican: 'Sung in the historic liturgy to assure troubled consciences of God’s pardoning grace.',
      catholic: 'Christ comes as the Physician of souls to heal diseased human nature, not as a tyrant to destroy it.',
      baptist_evangelical: 'Provides immense comfort against religious legalism and condemnation.'
    },
    originalLanguageInsights: [
      {
        term: 'To Condemn',
        originalScript: 'ἵνα κρίνῃ',
        transliteration: 'hina krinē',
        strongsRef: 'G2919',
        nuance: 'To pass punitive judgment or pass sentence of execution upon an offender.'
      },
      {
        term: 'Might be Saved',
        originalScript: 'σωθῇ',
        transliteration: 'sōthē',
        strongsRef: 'G4982',
        nuance: 'To be delivered from destruction, healed, preserved, and brought into divine wholeness.'
      }
    ],
    suggestedQuestions: [
      'How does John 3:17 transform our understanding of God’s attitude toward sinners?',
      'Why do many people still imagine God as looking for reasons to condemn them rather than save them?'
    ],
    practicalApplication: 'Stop viewing God as an angry judge waiting to catch your mistakes. Come to Him freely as the loving Father who sent His Son to rescue you.'
  },
  'john_3_18': {
    passageRef: 'John 3:18',
    conciseOverview: 'The watershed of human destiny: whoever trusts in Christ is immediately free from condemnation, whereas the one who refuses to believe has already incurred judgment by rejecting God’s unique Son.',
    theologicalThemes: [
      'The Immediate Exemption from Condemnation',
      'Unbelief as the Self-Executing Cause of Judgment',
      'The Supreme Dignity of the Name of the Son'
    ],
    historicalContext: 'Addresses the profound responsibility of encountering the Messiah: hearing and rejecting the Son carries immediate spiritual consequences.',
    lensPerspectives: {
      historical_grammatical: '"Mē katakrinetai" (is not condemned) is in the present passive: the legal verdict of pardon is instantaneous upon faith.',
      reformed: 'Directly linked to Romans 8:1—justification by faith cancels all punitive liability forever.',
      wesleyan: 'Highlights the serious responsibility of human free agency in receiving or rejecting divine grace.',
      anglican: 'A declaration of liturgical peace and reconciliation found in the Creeds.',
      catholic: 'Judgment is not an arbitrary punishment, but the tragic self-exclusion of a soul from the Source of Light.',
      baptist_evangelical: 'The urgency of the Gospel: today is the day of salvation.'
    },
    originalLanguageInsights: [
      {
        term: 'Is Not Condemned',
        originalScript: 'οὐ κρίνεται',
        transliteration: 'ou krinetai',
        strongsRef: 'G2919',
        nuance: 'Present passive indicative: completely released and exempted from judicial condemnation.'
      },
      {
        term: 'Condemned Already',
        originalScript: 'ἤδη κέκριται',
        transliteration: 'ēdē kekritai',
        strongsRef: 'G2235 / G2919',
        nuance: 'Perfect passive indicative: stands already in a state of self-incurred judgment due to persistent unbelief.'
      }
    ],
    suggestedQuestions: [
      'Why is someone who rejects Christ "condemned already"?',
      'How does trusting in Jesus give immediate peace from the fear of future judgment?'
    ],
    practicalApplication: 'Celebrate the freedom you have in Christ: if you trust in Him, there is zero condemnation standing against your name.'
  },
  'john_3_19': {
    passageRef: 'John 3:19',
    conciseOverview: 'The moral tragedy of the human condition: Light has entered the world, but people often choose to love spiritual darkness instead, because darkness shields their evil practices.',
    theologicalThemes: [
      'The Inevitable Crisis (Krisis) of Divine Light',
      'The Moral Roots of Intellectual Skepticism',
      'Darkness as a Cloak for Human Guilt'
    ],
    historicalContext: 'Contrasts the outward moral pretense of the religious elite with the hidden, self-protecting corruptions of the human heart.',
    lensPerspectives: {
      historical_grammatical: '"Krisis" is the Greek word for verdict or trial: the arrival of Jesus forces a moral decision that exposes the hidden motives of every heart.',
      reformed: 'A clear demonstration of total depravity: fallen human will naturally shrinks from divine light until renewed by grace.',
      wesleyan: 'Confronts human moral culpability: God’s light shines on all, but men often resist the transforming light to protect their sins.',
      anglican: 'Echoed in the Collect for Purity: God knows all desires and from Him no secrets are hidden.',
      catholic: 'The necessity of repentance and confession to cleanse the soul from dark passions before divine illumination.',
      baptist_evangelical: 'A call to honest repentance rather than superficial religious outward performance.'
    },
    originalLanguageInsights: [
      {
        term: 'Judgment / Crisis',
        originalScript: 'ἡ κρίσις',
        transliteration: 'hē krisis',
        strongsRef: 'G2920',
        nuance: 'The decisive separating verdict, crisis, and exposure that occurs when divine light meets human darkness.'
      },
      {
        term: 'Darkness',
        originalScript: 'τὸ σκότος',
        transliteration: 'to skotos',
        strongsRef: 'G4655',
        nuance: 'Moral blindness, secrecy, rebellion, and separation from the presence of God.'
      }
    ],
    suggestedQuestions: [
      'Why is unbelief often rooted in moral choices rather than merely intellectual doubts?',
      'How does the presence of Jesus act as a "light" that exposes human motives?'
    ],
    practicalApplication: 'Step out of hiding today. Do not let shame keep you in the dark; bring every failure into the forgiving light of Christ.'
  },
  'john_3_20': {
    passageRef: 'John 3:20',
    conciseOverview: 'Jesus exposes the psychology of sin: those who cling to evil deeds hate the light and avoid it, terrified of the public and divine exposure of their true nature.',
    theologicalThemes: [
      'The Psychology of Guilt and Concealment',
      'The Fear of Exposure (Elenchō)',
      'The Hatred of Truth by Those in Rebellion'
    ],
    historicalContext: 'In Roman and Jewish courts, "elenchō" was the formal cross-examination that brought hidden corruption into undeniable daylight.',
    lensPerspectives: {
      historical_grammatical: '"Elenchthē" means to be exposed, convicted, and refuted by undeniable evidence.',
      reformed: 'Fallen human pride fears nothing more than being exposed as bankrupt before a holy God.',
      wesleyan: 'Prevenient grace convicts the conscience, but the stubborn heart may choose to flee rather than yield.',
      anglican: 'A pastoral warning against hypocrisy in spiritual leadership.',
      catholic: 'The monastic practice of continuous self-examination to prevent pride from hiding in the dark corners of the heart.',
      baptist_evangelical: 'True conversion begins when we stop hiding our sins and allow God’s Word to convict us.'
    },
    originalLanguageInsights: [
      {
        term: 'Exposed / Convicted',
        originalScript: 'ἐλεγχθῇ',
        transliteration: 'elenchthē',
        strongsRef: 'G1651',
        nuance: 'To be brought to open conviction, laid bare, and demonstrated to be guilty.'
      }
    ],
    suggestedQuestions: [
      'Why is human nature instinctively terrified of being truly known and exposed?',
      'How does the Gospel turn exposure from a terrifying ordeal into a healing release?'
    ],
    practicalApplication: 'Stop hiding your weaknesses from God and trusted mentors. True freedom begins when you allow the light of Christ to heal what is hidden.'
  },
  'john_3_21': {
    passageRef: 'John 3:21',
    conciseOverview: 'In triumphant contrast, the one who practices the truth steps willingly into the light, so that their deeds may be clearly seen as empowered and accomplished by God.',
    theologicalThemes: [
      'Living the Truth (Poiōn tēn Alētheian)',
      'Transparency and Integrity in God’s Presence',
      'Good Works as the Fruit of Divine Grace'
    ],
    historicalContext: '"Doing the truth" is a rich Semitic idiom (Hebrew: asot emet) meaning acting with complete moral transparency, faithfulness, and integrity before Yahweh.',
    lensPerspectives: {
      historical_grammatical: '"Poiōn tēn alētheian" (doing the truth) emphasizes that biblical truth is an active lifestyle, not merely abstract assent.',
      reformed: 'All genuine good works are "wrought in God" (en Theō eirgasmena)—grace alone is the source of all authentic righteousness.',
      wesleyan: 'The joyful life of entire sanctification: walking openly in the light with an unclouded conscience.',
      anglican: 'The ideal of holy living reflected in the Book of Common Prayer and daily confession.',
      catholic: 'The synergistic cooperation where human will aligns with divine energy to produce holy fruits.',
      baptist_evangelical: 'The evidence of genuine conversion: a desire for honesty, transparency, and honoring God.'
    },
    originalLanguageInsights: [
      {
        term: 'Doing the Truth',
        originalScript: 'ὁ ποιῶν τὴν ἀλήθειαν',
        transliteration: 'ho poiōn tēn alētheian',
        strongsRef: 'G4160 / G225',
        nuance: 'Practicing, living, and demonstrating moral integrity and divine reality in daily conduct.'
      },
      {
        term: 'Wrought in God',
        originalScript: 'ἐν θεῷ ἐστιν εἰργασμένα',
        transliteration: 'en theō estin eirgasmena',
        strongsRef: 'G2316 / G2038',
        nuance: 'Carried out, produced, and accomplished through the empowering grace and presence of God.'
      }
    ],
    suggestedQuestions: [
      'What does it mean practically to "do the truth"?',
      'How does knowing your works are "wrought in God" eliminate religious pride?'
    ],
    practicalApplication: 'Live with complete transparency today. Walk in the light, speak the truth in love, and give God all credit for every good work in your life.'
  },
  'john_3_22': {
    passageRef: 'John 3:22',
    conciseOverview: 'Jesus moves into the Judean countryside with His disciples, spending intimate time with them in shared life, prayer, and the administration of baptism.',
    theologicalThemes: [
      'Relational Discipleship and Shared Life',
      'The Ministry of Baptism in Transition',
      'Jesus Investing in His Community of Followers'
    ],
    historicalContext: 'The Judean countryside (Ioudaian gēn) offered quiet regions along the Jordan river where Jesus could instruct His core disciples away from the tense urban crowds of Jerusalem.',
    lensPerspectives: {
      historical_grammatical: '"Diatribō" means to spend prolonged time, linger, and abide with companions in deep fellowship.',
      reformed: 'Shows Christ as the True Shepherd gathering and nurturing His covenant flock.',
      wesleyan: 'Emphasizes the necessity of Christian community and small-group discipleship for spiritual formation.',
      anglican: 'Reflects the monastic and pastoral tradition of retreating into quiet communion with the Lord.',
      catholic: 'Points to the sacred fellowship of the Church gathered around the Master.',
      baptist_evangelical: 'A model for relational mentoring: spending quality time doing ministry together.'
    },
    originalLanguageInsights: [
      {
        term: 'Remained / Spent Time',
        originalScript: 'διέτριβεν',
        transliteration: 'dietriben',
        strongsRef: 'G1304',
        nuance: 'To tarry, stay, and invest prolonged relational time with companions.'
      }
    ],
    suggestedQuestions: [
      'Why did Jesus withdraw to the countryside with His disciples?',
      'How does spending unhurried time with Jesus transform our ministry?'
    ],
    practicalApplication: 'Make time to step away from busy noise and linger in Jesus’ presence with your family and church community today.'
  },
  'john_3_23': {
    passageRef: 'John 3:23',
    conciseOverview: 'John the Baptist continues his prophetic ministry at Aenon near Salim, where abundant natural springs provided living water for immersing repentant crowds.',
    theologicalThemes: [
      'Faithful Continuance in Calling',
      'Abundant Waters as a Symbol of Cleansing',
      'Historical and Geographical Veracity of the Gospels'
    ],
    historicalContext: 'Aenon (from Aramaic "En-van", meaning springs/fountains) near Salim is located in the northern Jordan Valley, verifying John’s eyewitness knowledge of Palestinian topography.',
    lensPerspectives: {
      historical_grammatical: 'The archaeological confirmation of Aenon near Salim provides strong proof of the author’s firsthand knowledge of first-century Judean geography.',
      reformed: 'John the Baptist remained faithful to his appointed task until his race was finished.',
      wesleyan: 'Shows God providing abundant grace ("many waters") for all who seek repentance.',
      anglican: 'Commemorates John the Baptist as the faithful forerunner who persevered in prophetic obedience.',
      catholic: 'Celebrated in the holy feast of the Theophany and the sanctification of the waters.',
      baptist_evangelical: 'An inspiration to remain dedicated to our assigned task even when other ministries around us are expanding.'
    },
    originalLanguageInsights: [
      {
        term: 'Much Water / Abundant Waters',
        originalScript: 'ὕδατα πολλὰ',
        transliteration: 'hydata polla',
        strongsRef: 'G5204 / G4183',
        nuance: 'Plentiful natural flowing springs suitable for ceremonial immersion.'
      }
    ],
    suggestedQuestions: [
      'How does the geographical detail of Aenon strengthen our confidence in the Gospel of John?',
      'What can we learn from John the Baptist’s steadfast commitment to his calling?'
    ],
    practicalApplication: 'Be faithful in the place where God has planted you today. Do not look around at others; execute your calling with joy and diligence.'
  },
  'john_3_24': {
    passageRef: 'John 3:24',
    conciseOverview: 'A crucial chronological footnote: John provides historical context by noting that the Baptist had not yet been imprisoned by Herod Antipas.',
    theologicalThemes: [
      'The Historical Accuracy of the Canonical Gospels',
      'The Sovereign Timing of God’s Redemptive Schedule',
      'The Intersecting Ministries of the Forerunner and the Messiah'
    ],
    historicalContext: 'John harmonizes his account with Mark 1:14 and Matthew 4:12, explaining that there was an overlapping period of early Judean ministry before the Baptist’s arrest.',
    lensPerspectives: {
      historical_grammatical: 'Demonstrates the author’s intent to write precise history, supplementing and clarifying the timeline of the Synoptic Gospels.',
      reformed: 'God’s providence controls the rising and falling of seasons, ministries, and political rulers.',
      wesleyan: 'Reminds us that our time to serve God on earth is brief and precious before trials arrive.',
      anglican: 'Reflects the canonical harmony of the four Gospels in the liturgical calendar.',
      catholic: 'John the Baptist’s impending martyrdom is revered as the crown of prophetic witness.',
      baptist_evangelical: 'Confidence in the historical reliability and divine inspiration of Scripture.'
    },
    originalLanguageInsights: [
      {
        term: 'Prison',
        originalScript: 'φυλακήν',
        transliteration: 'phylakēn',
        strongsRef: 'G5438',
        nuance: 'Imprisonment or custody under state authority (Machaerus fortress under Herod Antipas).'
      }
    ],
    suggestedQuestions: [
      'Why was it important for John to mention that the Baptist had not yet been cast into prison?',
      'How do the four Gospel accounts fit together to form a rich, complementary historical portrait?'
    ],
    practicalApplication: 'Use the freedom and opportunities you have today to serve the Lord, knowing that each season of life is held in God’s sovereign hands.'
  },
  'john_3_25': {
    passageRef: 'John 3:25',
    conciseOverview: 'A theological dispute arises between John’s disciples and a Jewish inquirer concerning ritual purification, sparking questions about the ultimate meaning of baptism.',
    theologicalThemes: [
      'Ritual Purification vs Inward Messianic Cleansing',
      'The Danger of Petty Religious Controversies',
      'Shadows of the Law vs Substance in Christ'
    ],
    historicalContext: 'First-century Judaism was intensely focused on mikveh (ritual immersion) and ceremonial purity rules; the emergence of two baptizing movements triggered intense debate.',
    lensPerspectives: {
      historical_grammatical: '"Zētēsis peri katharismou" reflects the lively debates in Second Temple Judaism regarding competing rites of purification.',
      reformed: 'Points beyond ceremonial washings of the Old Covenant to the true purification of the heart through the blood of Christ.',
      wesleyan: 'Warns believers not to get sidetracked by secondary ecclesiastical controversies when the weightier matters of grace are at hand.',
      anglican: 'Reflects on the evolution from Old Testament purification to the Sacrament of Holy Baptism.',
      catholic: 'The holy mystery of water as the vehicle of divine grace and regeneration.',
      baptist_evangelical: 'A call to focus on Christ rather than arguing over external religious rituals.'
    },
    originalLanguageInsights: [
      {
        term: 'Purification',
        originalScript: 'καθαρισμοῦ',
        transliteration: 'katharismou',
        strongsRef: 'G2512',
        nuance: 'Ceremonial cleansing, moral purification, and ritual washing from defilement.'
      }
    ],
    suggestedQuestions: [
      'What were the key purification debates happening in first-century Judaism?',
      'How does the cleansing offered by Jesus surpass all external religious washings?'
    ],
    practicalApplication: 'Do not waste your energy on unproductive theological arguments. Keep your focus on Christ who cleanses your heart from all unrighteousness.'
  },
  'john_3_26': {
    passageRef: 'John 3:26',
    conciseOverview: 'John’s disciples come with anxious jealousy: "Rabbi, He who was with you across the Jordan... look, He is baptizing, and all are flocking to Him!" exposing the perennial trap of ministerial comparison.',
    theologicalThemes: [
      'The Temptation of Ministerial Envy and Comparison',
      'Territorialism vs Kingdom Joy',
      'Human Insecurity in the Shadow of Expanding Ministries'
    ],
    historicalContext: 'In rabbinic culture, disciples competed fiercely for prominence and the size of their master’s following.',
    lensPerspectives: {
      historical_grammatical: 'John’s disciples refer to Jesus indirectly ("He who was with you... to whom you bore witness"), revealing their protective resentment.',
      reformed: 'Exposes the pride of the human heart that seeks personal glory rather than the advancement of Christ’s Kingdom.',
      wesleyan: 'A call to entire sanctification, which roots out jealousy and rejoices in the blessings given to others.',
      anglican: 'A pastoral lesson for clergy to celebrate the success of neighboring parishes.',
      catholic: 'Humility and non-possessiveness as essential virtues for spiritual fathers.',
      baptist_evangelical: 'A challenge to modern church leaders: building the Kingdom of God is not a competition.'
    },
    originalLanguageInsights: [
      {
        term: 'All Are Coming to Him',
        originalScript: 'πάντες ἔρχονται πρὸς αὐτόν',
        transliteration: 'pantes erchontai pros auton',
        strongsRef: 'G3956 / G2064',
        nuance: 'An exaggerated grievance driven by jealousy over shrinking crowds.'
      }
    ],
    suggestedQuestions: [
      'Why were John’s disciples distressed by Jesus’ growing popularity?',
      'How can we guard our hearts against jealousy when others around us succeed in ministry or career?'
    ],
    practicalApplication: 'When you feel the urge to compare yourself or compete with others, pause and thank God for their success. Rejoice in how Christ is honored through them.'
  },
  'john_3_27': {
    passageRef: 'John 3:27',
    conciseOverview: 'John the Baptist delivers a masterpiece of spiritual contentment: "A person cannot receive even one thing unless it is given him from heaven," establishing that all calling and influence are sovereign gifts.',
    theologicalThemes: [
      'Divine Stewardship and Sovereign Allocation of Gifts',
      'Freedom from Ambition through Contentment',
      'Heaven as the Sole Source of Ministry Fruitfulness'
    ],
    historicalContext: 'Instead of defending his platform, John immediately anchors his identity in God’s sovereign heavenly appointment.',
    lensPerspectives: {
      historical_grammatical: '"Dedomenon ek tou ouranou" (given from heaven) is a periphrastic passive emphasizing divine ordination and sovereign grace.',
      reformed: 'A brilliant affirmation of divine sovereignty: no human can seize spiritual fruit; all is granted by sovereign decree.',
      wesleyan: 'Pure holy contentment: living free from selfish ambition and resting peacefully in God’s designated will.',
      anglican: 'Reflected in the Ordinal: acknowledging that every holy office and spiritual gift comes from the Holy Spirit.',
      catholic: 'Ascetic detachment from human praise, seeing oneself merely as an unworthy servant of God.',
      baptist_evangelical: 'The cure for ministry burnout and platform-seeking: your worth is in Christ, not in your numbers.'
    },
    originalLanguageInsights: [
      {
        term: 'Given from Heaven',
        originalScript: 'δεδομένον ἐκ τοῦ οὐρανοῦ',
        transliteration: 'dedomenon ek tou ouranou',
        strongsRef: 'G1325 / G3772',
        nuance: 'Sovereignly bestowed, appointed, and granted as a gift by God Himself.'
      }
    ],
    suggestedQuestions: [
      'How does John 3:27 destroy both pride in success and depression in obscurity?',
      'What does it mean to receive our role and gifts as a trust from heaven?'
    ],
    practicalApplication: 'Rest in the unique calling God has given you. You do not need to fight for influence; whatever is meant for you will be given by God in His perfect timing.'
  },
  'john_3_28': {
    passageRef: 'John 3:28',
    conciseOverview: 'John clarifies his identity with crystal clarity: "You yourselves bear me witness that I said, ‘I am not the Christ, but I have been sent before Him.’"',
    theologicalThemes: [
      'Clarity of Calling and Identity',
      'The Nobility of the Supporting Role',
      'Never Usurping the Place of Christ'
    ],
    historicalContext: 'Recalls John’s earlier interrogation by the Jerusalem delegation in John 1:19–23, proving his unwavering consistency.',
    lensPerspectives: {
      historical_grammatical: 'The emphatic negative "Ouk eimi egō ho Christos" (I am NOT the Christ) decisively rejects any messianic claim for himself.',
      reformed: 'Exemplifies Soli Deo Gloria: the sole purpose of every servant is to direct all attention to the Messiah.',
      wesleyan: 'The beauty of a heart cleared of self-glory, totally dedicated to pointing others to Jesus.',
      anglican: 'Celebrated in the Collect for John the Baptist: preaching repentance and pointing only to the Lamb of God.',
      catholic: 'John is venerated as the Prodromos (Forerunner) whose entire holiness lay in opening the way for Christ.',
      baptist_evangelical: 'A vital reminder: our message is never about ourselves, our brand, or our church—it is always and only about Jesus.'
    },
    originalLanguageInsights: [
      {
        term: 'I am Not the Christ',
        originalScript: 'Οὐκ εἰμὶ ἐγὼ ὁ Χριστός',
        transliteration: 'Ouk eimi egō ho Christos',
        strongsRef: 'G3756 / G1510 / G5547',
        nuance: 'Emphatic and absolute denial of messianic preeminence.'
      }
    ],
    suggestedQuestions: [
      'Why is knowing who you are NOT just as important as knowing who you are?',
      'How did John’s clarity of identity keep him free from insecurity?'
    ],
    practicalApplication: 'Embrace your role as a signpost pointing to Jesus. Find deep joy in being a faithful forerunner who helps others see and love the Savior.'
  },
  'john_3_29': {
    passageRef: 'John 3:29',
    conciseOverview: 'John employs the breathtaking metaphor of Jewish weddings: Jesus is the Bridegroom who possesses the Bride, while John is the overjoyed friend of the Bridegroom whose joy is completed at hearing the Bridegroom’s voice.',
    theologicalThemes: [
      'Christ as the Divine Bridegroom of His People',
      'The Selfless Joy of the Friend of the Bridegroom (Shoshbin)',
      'Spiritual Fulfillment in Christ’s Elevation'
    ],
    historicalContext: 'In first-century Jewish wedding customs, the "shoshbin" (best man / friend of the bridegroom) managed all logistics and rejoiced outside the bridal chamber when the marriage was consummated.',
    lensPerspectives: {
      historical_grammatical: 'The "philos tou nymphion" (friend of the bridegroom) was legally responsible for guarding and presenting the bride to the groom.',
      reformed: 'Points to the eternal covenant of grace wherein the Father gives the elect Church as a bride to the Son.',
      wesleyan: 'The pinnacle of Christian perfection: love made perfect through complete self-forgetfulness and joy in Christ.',
      anglican: 'A liturgical celebration of Christ’s espousal of the Church celebrated in the Holy Matrimony liturgy.',
      catholic: 'The mystical bridal theology of the Church as the spotless Bride of the Lamb.',
      baptist_evangelical: 'Our highest joy as believers is introducing souls to Jesus and watching them fall in love with Him.'
    },
    originalLanguageInsights: [
      {
        term: 'Bridegroom',
        originalScript: 'ὁ νυμφίος',
        transliteration: 'ho nymphios',
        strongsRef: 'G3566',
        nuance: 'The groom, used in Scripture as the supreme title for Yahweh/Christ united in covenant love with His redeemed people.'
      },
      {
        term: 'Joy is Complete / Fulfilled',
        originalScript: 'ἡ χαρὰ ἡ ἐμὴ πεπλήρωται',
        transliteration: 'hē chara hē emē peplērōtai',
        strongsRef: 'G5479 / G4137',
        nuance: 'Perfect passive: a permanent state of supreme, overflowing, and complete spiritual satisfaction.'
      }
    ],
    suggestedQuestions: [
      'What was the role of the "friend of the bridegroom" (shoshbin) in ancient Jewish culture?',
      'How does John’s metaphor redefine our understanding of true Christian joy?'
    ],
    practicalApplication: 'Measure your joy not by how many people follow you, but by how brightly Jesus is loved and followed by those around you.'
  },
  'john_3_30': {
    passageRef: 'John 3:30',
    conciseOverview: 'The immortal summit of Christian humility: "He must increase, but I must decrease," articulating the eternal law of redemptive history and personal discipleship.',
    theologicalThemes: [
      'Christ-Centered Humility over Personal Ambition',
      'The Divine "Must" of Christ’s Ascension and Preeminence',
      'The Willing Eclipse of Self for the Glory of the Son'
    ],
    historicalContext: 'John uttered this motto at the peak of his national fame, freely stepping into the shadows so that Jesus could take center stage.',
    lensPerspectives: {
      historical_grammatical: '"Dei" indicates divine necessity; "auxanein" (to grow/increase) and "elattousthai" (to become lesser) form a perfect structural antithesis.',
      reformed: 'The ultimate summary of Soli Deo Gloria: every minister and believer exists solely to magnify Christ while diminishing self.',
      wesleyan: 'The essence of dying to self: entire devotion where self-will is swallowed up in God’s glory.',
      anglican: 'A guiding motto for pastoral ministry and liturgical prayer.',
      catholic: 'The heart of monastic hesychasm and ascetic humility before the uncreated glory of God.',
      baptist_evangelical: 'The definitive challenge against modern celebrity culture: make Jesus famous, not ourselves.'
    },
    originalLanguageInsights: [
      {
        term: 'He Must',
        originalScript: 'Ἐκεῖνον δεῖ',
        transliteration: 'Ekeinon dei',
        strongsRef: 'G1565 / G1163',
        nuance: 'He, the Messiah, has the divine sovereign obligation and destiny to be magnified.'
      },
      {
        term: 'Increase',
        originalScript: 'αὐξάνειν',
        transliteration: 'auxanein',
        strongsRef: 'G837',
        nuance: 'To grow, expand, ascend in glory, prominence, and influence.'
      },
      {
        term: 'Decrease',
        originalScript: 'ἐλαττοῦσθαι',
        transliteration: 'elattousthai',
        strongsRef: 'G1642',
        nuance: 'To diminish, become lesser in prominence, status, and self-assertion.'
      }
    ],
    suggestedQuestions: [
      'What makes John 3:30 one of the most challenging verses in all of Scripture to live out?',
      'In what specific areas of your life is Christ calling you to decrease so that He can increase?'
    ],
    practicalApplication: 'Adopt John’s motto today: "He must increase, but I must decrease." In your conversations, decisions, and ambitions, ask: "How can Jesus be magnified right now?"'
  },
  'john_3_31': {
    passageRef: 'John 3:31',
    conciseOverview: 'The theological basis for Christ’s supremacy: He who descends from heaven is inherently above all earthly teachers, because earthly beings belong to the earth and speak from earthly limitations.',
    theologicalThemes: [
      'The Cosmic Supremacy of Christ over all Earthly Teachers',
      'The Transcendent Heavenly Origin of Jesus',
      'The Qualitative Gulf between Earth and Heaven'
    ],
    historicalContext: 'Contrasts the highest earthly prophets (including Moses and John the Baptist) with the transcendent Son who originated in the celestial realm.',
    lensPerspectives: {
      historical_grammatical: '"Epanō pantōn" (above all) establishes the absolute cosmic supremacy of Jesus over all created orders.',
      reformed: 'A foundational text for Christology: Christ is the eternal Logos, superior in essence and authority to all human messengers.',
      wesleyan: 'Reminds us to listen to Jesus above all human philosophies, podcasts, or cultural opinions.',
      anglican: 'Affirms the historic Nicene confession: "Light of Light, very God of very God."',
      catholic: 'The Pantokrator (Ruler of All) whose divine origin transcends the cosmos.',
      baptist_evangelical: 'The exclusivity and uniqueness of Christ as the supreme Lord of the universe.'
    },
    originalLanguageInsights: [
      {
        term: 'Above All',
        originalScript: 'ἐπάνω πάντων',
        transliteration: 'epanō pantōn',
        strongsRef: 'G1883 / G3956',
        nuance: 'Supreme over all things, holding absolute preeminence in authority, rank, and glory.'
      }
    ],
    suggestedQuestions: [
      'Why is Jesus categorically different from every other religious founder in history?',
      'How does Christ’s heavenly origin give His words absolute authority in our lives?'
    ],
    practicalApplication: 'Bow before the supremacy of Christ today. Give Him first place over your career, your relationships, your finances, and your thoughts.'
  },
  'john_3_32': {
    passageRef: 'John 3:32',
    conciseOverview: 'The heartbreaking tragedy of human resistance: Christ testifies to what He has firsthand seen and heard in the eternal presence of the Father, yet natural humanity routinely refuses His testimony.',
    theologicalThemes: [
      'Direct Firsthand Heavenly Testimony',
      'The Tragic General Rejection of the Truth',
      'The Moral Blindness of Unbelief'
    ],
    historicalContext: 'Highlights the stark contrast between the celestial reality Jesus witnessed with the Father and the stubborn skepticism of first-century Jerusalem.',
    lensPerspectives: {
      historical_grammatical: '"Oudeis lambanei" (no one receives) is a hyperbolic lament emphasizing the widespread, general rejection of Jesus by the religious establishment.',
      reformed: 'Affirms total depravity: fallen mankind has no native desire for divine light apart from regenerating grace.',
      wesleyan: 'A poignant lament over human free will rejecting the overtures of pursuing divine love.',
      anglican: 'Reflected in the Good Friday reproaches: "O my people, what have I done to you?"',
      catholic: 'The suffering witness of the Logos encountering a fallen, resistant world.',
      baptist_evangelical: 'An encouragement when facing resistance to the Gospel: even Jesus was rejected by those He came to save.'
    },
    originalLanguageInsights: [
      {
        term: 'Seen and Heard',
        originalScript: 'ἑώρακεν καὶ ἤκουσεν',
        transliteration: 'heōraken kai ēkousen',
        strongsRef: 'G3708 / G191',
        nuance: 'Perfect and aorist verbs denoting intimate, firsthand, unmediated heavenly experience.'
      }
    ],
    suggestedQuestions: [
      'Why does John say "no one receives His testimony" right before verse 33 mentions those who do?',
      'How does firsthand testimony differ from speculative human philosophy?'
    ],
    practicalApplication: 'Do not be discouraged when people reject the Gospel message. Stand firm in the truth, knowing that the testimony of Jesus is true regardless of popular opinion.'
  },
  'john_3_33': {
    passageRef: 'John 3:33',
    conciseOverview: 'The great affirmation of faith: whoever receives Christ’s testimony sets their official seal (sphragizō) to the declaration that God is completely true and faithful.',
    theologicalThemes: [
      'Faith as Ratification of Divine Veracity',
      'The Seal (Sphragis) of Personal Belief',
      'Honoring God through Trusting His Word'
    ],
    historicalContext: 'In the ancient Greco-Roman and Jewish world, affixing a signet seal (sphragis) to a legal scroll certified its authenticity, binding truth, and ownership.',
    lensPerspectives: {
      historical_grammatical: '"Esphragisen" (has sealed) uses ancient legal terminology: believing in Jesus is legally certifying that God cannot lie.',
      reformed: 'Saving faith is not a leap in the dark; it is the firm, confident assent to the infallible veracity of God.',
      wesleyan: 'By exercising faith, the believer actively aligns with divine truth and enters the assurance of salvation.',
      anglican: 'Connected to the sealing of the Holy Spirit in Baptism and Confirmation.',
      catholic: 'The holy seal of the gift of the Holy Spirit (Chrismation) confirming union with the truth.',
      baptist_evangelical: 'To believe Jesus is to honor God as true; to reject Jesus is to call God a liar (1 John 5:10).'
    },
    originalLanguageInsights: [
      {
        term: 'Sets His Seal',
        originalScript: 'ἐσφράγισεν',
        transliteration: 'esphragisen',
        strongsRef: 'G4972',
        nuance: 'To stamp with a signet ring, officially authenticating, verifying, and certifying as truth.'
      },
      {
        term: 'God is True',
        originalScript: 'ὁ θεὸς ἀληθής ἐστιν',
        transliteration: 'ho theos alēthēs estin',
        strongsRef: 'G2316 / G227',
        nuance: 'God is utterly faithful, completely truthful, and incapable of falsehood.'
      }
    ],
    suggestedQuestions: [
      'What was the cultural significance of stamping a seal in the ancient world?',
      'How does our personal faith in Christ bring glory to God’s character?'
    ],
    practicalApplication: 'Put your seal on God’s truth today. When worries and doubts assault your mind, declare aloud: "God is true, His Word is faithful, and I trust Him."'
  },
  'john_3_34': {
    passageRef: 'John 3:34',
    conciseOverview: 'The supreme empowerment of the Son: He whom God has sent speaks the pure words of God, for the Father pours out the Holy Spirit upon Him without limit or measure (ouk ek metrou).',
    theologicalThemes: [
      'The Infinite Outpouring of the Spirit on Christ',
      'The Divine Transmission of the Words of God',
      'Trinitarian Harmony in Redemptive Revelation'
    ],
    historicalContext: 'Rabbinic tradition taught that prophets received the Spirit in limited "measures" (weights); Jesus receives the Holy Spirit in infinite, boundless plenitude.',
    lensPerspectives: {
      historical_grammatical: '"Ouk ek metrou" (not by measure) means without rationing, bounds, or quantitative limitation.',
      reformed: 'Affirms the unlimited fullness of grace and truth resident in Christ as the Head of the Covenant.',
      wesleyan: 'Because Christ possesses the Spirit without measure, He is able to pour out sanctifying grace abundantly on all believers.',
      anglican: 'Celebrated in the liturgical Preface of Trinity Sunday and the Pentecost season.',
      catholic: 'The eternal resting of the Holy Spirit upon the Son as the fountain of all sacramental grace.',
      baptist_evangelical: 'Confidence that Jesus’ words are 100% reliable, inspired, and saturated with the supernatural power of the Spirit.'
    },
    originalLanguageInsights: [
      {
        term: 'Without Measure',
        originalScript: 'οὐκ ἐκ μέτρου',
        transliteration: 'ouk ek metrou',
        strongsRef: 'G3756 / G1537 / G3358',
        nuance: 'Without metric limitation, boundless, infinite, and unrationed outpouring.'
      }
    ],
    suggestedQuestions: [
      'How did Jesus’ reception of the Spirit differ from Old Testament prophets?',
      'How does the unmeasured Spirit in Christ comfort us in our spiritual dryness?'
    ],
    practicalApplication: 'Drink deeply from Christ’s fullness today. He holds the Spirit without measure and delights in pouring living water into your thirsty soul.'
  },
  'john_3_35': {
    passageRef: 'John 3:35',
    conciseOverview: 'The divine foundation of Christ’s authority: The Father loves the Son with eternal, boundless affection and has placed the governance of all things into His hands.',
    theologicalThemes: [
      'The Eternal Trinitarian Love between Father and Son',
      'Universal Cosmic Authority Entrusted to Christ',
      'The Son as the Sole Administrator of Creation and Redemption'
    ],
    historicalContext: 'Echoes Psalm 2 and Daniel 7, where the Sovereign Father grants all nations and dominion into the hands of His anointed King.',
    lensPerspectives: {
      historical_grammatical: '"Panta dedōken" (has given all things) uses the perfect tense: an established, permanent sovereign transfer of universal authority.',
      reformed: 'The sovereign decree of the Father placing all creation, history, and elect souls under the mediatorial reign of the Son.',
      wesleyan: 'God’s supreme motive and core essence is holy love; the Father’s love for the Son spills over into His love for all creation.',
      anglican: 'Affirmed in the confession of Christ reigning at the right hand of the Father Almighty.',
      catholic: 'The eternal perichoresis (mutual indwelling) of love within the Holy Trinity.',
      baptist_evangelical: 'Comfort that your life and the entire universe are held in the loving, sovereign hands of Jesus.'
    },
    originalLanguageInsights: [
      {
        term: 'Loves the Son',
        originalScript: 'ἀγαπᾷ τὸν υἱόν',
        transliteration: 'agapa ton huion',
        strongsRef: 'G25 / G5207',
        nuance: 'The eternal, supreme, continuous divine love between the Father and the Son.'
      },
      {
        term: 'All Things into His Hand',
        originalScript: 'πάντα δέδωκεν ἐν τῇ χειρὶ αὐτοῦ',
        transliteration: 'panta dedōken en tē cheiri autou',
        strongsRef: 'G3956 / G1325 / G5495',
        nuance: 'Total, unrestricted sovereign authority, custody, and care over the cosmos.'
      }
    ],
    suggestedQuestions: [
      'What does the relationship between the Father and Son in verse 35 reveal about the nature of God?',
      'Why is it comforting to know that all things have been given into Jesus’ hands?'
    ],
    practicalApplication: 'Surrender every worry about tomorrow into the hands of Jesus. If the Father has entrusted the entire universe to Him, you can certainly trust Him with your life.'
  },
  'john_3_36': {
    passageRef: 'John 3:36',
    conciseOverview: 'The grand conclusion of John 3: whoever places faith in the Son has eternal life in the present moment, while whoever rejects the Son shall not see life, but the wrath of God remains upon them.',
    theologicalThemes: [
      'Eternal Life as a Present Reality (Echei Zōēn Aiōnion)',
      'The Severe Stakes of Disobedience and Unbelief',
      'The Wrath of God (Orgē tou Theou) as Settled Holy Opposition to Sin'
    ],
    historicalContext: 'The climactic theological conclusion of the chapter, synthesizing Jesus’ dialogue with Nicodemus and John the Baptist’s final testimony.',
    lensPerspectives: {
      catholic: 'The Spirit without measure empowers the sacramental life of the Church through Christ our High Priest.',
      orthodox: 'Participating in the Son through baptism and the holy mysteries delivers from the ancestral corruption of death.',
      reformed: 'The definitive two-fold destiny: those in Christ possess unbreakable eternal life; those outside remain under divine wrath.',
      lutheran: 'Law and Gospel in sharp relief: unbelief leaves man under wrath, while faith receives Christ’s imputed righteousness.',
      wesleyan: 'Emphasizes that true faith produces trusting obedience; persisting in unbelief is a willful refusal of life.',
      anglican: 'A proclamation of Christ’s divine plenitude celebrated in the liturgical assurance of faith.',
      baptist_evangelical: 'The urgent clarity of the Gospel: today, by faith in Jesus, you can know with absolute certainty that you have eternal life.'
    },
    originalLanguageInsights: [
      {
        term: 'Has Eternal Life',
        originalScript: 'ἔχει ζωὴν αἰώνιον',
        transliteration: 'echei zōēn aiōnion',
        strongsRef: 'G2192 / G2222 / G166',
        nuance: 'Present continuous possession—eternal life begins the very second one trusts in Christ.'
      },
      {
        term: 'Wrath of God Remains',
        originalScript: 'ἡ ὀργὴ τοῦ θεοῦ μένει',
        transliteration: 'hē orgē tou theou menei',
        strongsRef: 'G3709 / G3306',
        nuance: 'The holy, settled, unwavering opposition of God’s justice abiding continuously on unrepentant rebellion.'
      }
    ],
    suggestedQuestions: [
      'What does it mean that eternal life is a present possession rather than merely a future reward?',
      'How does biblical "wrath" (orgē) differ from human emotional temper or spite?',
      'How does John 3:36 serve as the perfect climax to the entire third chapter of John?'
    ],
    practicalApplication: 'Live today in the confidence and joy of someone who already possesses uncreated, eternal life in Christ. Share this life-giving hope with someone who needs it today.'
  },
  'john_6_35': {
    passageRef: 'John 6:35',
    conciseOverview: 'Jesus announces the first of the seven magnificent "I AM" revelations in John: "I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst."',
    theologicalThemes: [
      'The "I AM" (Egō Eimi) Divine Self-Disclosure',
      'Christ as the Supreme Spiritual Bread surpassing Manna',
      'The Permanent Satisfaction of the Soul in Divine Fellowship'
    ],
    historicalContext: 'Spoken in the Capernaum synagogue following the feeding of the five thousand. Jesus elevates the dialogue from physical bread that perishes to the eternal spiritual nourishment found exclusively in His divine person.',
    lensPerspectives: {
      catholic: 'Introduces Christ as the source of supernatural life, foreshadowing the sacramental nourishment of the Eucharist where Christ gives Himself bodily and spiritually.',
      orthodox: 'The divine Logos is the celestial nourishment that transfigures human nature and initiates the soul into liturgical theosis.',
      reformed: 'Coming to Christ and believing on Him are the true spiritual eating that permanently satisfies the soul (Calvin, Institutes IV.17).',
      lutheran: 'Confesses Christ as the incarnate Word whose life-giving presence is received both through faith in the Word and in the holy Sacrament of the Altar.',
      wesleyan: 'A universal invitation to all humanity: Christ offers satisfying, prevenient, and saving grace to every seeking heart.',
      anglican: 'The spiritual foundation of the BCP Eucharistic liturgy: "Feed on Him in your hearts by faith with thanksgiving."',
      baptist_evangelical: 'Directly equates eating and drinking with coming and believing, establishing that personal faith in Christ is the sole spiritual means of eternal satisfaction.'
    },
    originalLanguageInsights: [
      {
        term: 'I Am the Bread of Life',
        originalScript: 'Ἐγώ εἰμι ὁ ἄρτος τῆς ζωῆς',
        transliteration: 'Egō eimi ho artos tēs zōēs',
        strongsRef: 'G1473 / G1510 / G740 / G2222',
        nuance: 'The divine name "Egō Eimi" (Exodus 3:14) joined to "the bread of life," identifying Jesus as the true source of all supernatural life.'
      },
      {
        term: 'Shall Never Hunger',
        originalScript: 'οὐ μὴ πεινάσῃ',
        transliteration: 'ou mē peinasē',
        strongsRef: 'G3756 / G3361 / G3983',
        nuance: 'Double negative in Greek indicating absolute impossibility—a permanent cessation of ultimate spiritual famine.'
      }
    ],
    suggestedQuestions: [
      'How does Jesus contrast the wilderness manna with Himself as the Bread of Life?',
      'What is the connection between "coming" to Jesus and "believing" in Him in verse 35?'
    ],
    practicalApplication: 'Stop looking to created things to satisfy the deep spiritual hunger that only Christ can fill. Turn to Him today in prayer and trust.'
  },
  'john_6_51': {
    passageRef: 'John 6:51',
    conciseOverview: 'Jesus makes a pivotal transition in the Bread of Life Discourse: "I am the living bread which came down from heaven: if any man eat of this bread, he shall live for ever: and the bread that I will give is my flesh, which I will give for the life of the world."',
    theologicalThemes: [
      'The Living Bread from Heaven (Ho Artos Ho Zōn)',
      'The Explicit Identification of Bread with Christ’s "Flesh" (Sarx)',
      'The Sacrificial Offering of Christ for the Life of the World'
    ],
    historicalContext: 'Jesus transitions from metaphorical bread to sacrificial and sacramental reality, identifying the bread explicitly as His "flesh" (sarx) given for the life of the world, directly linking the Incarnation, the Cross, and the Eucharist.',
    lensPerspectives: {
      catholic: 'The foundational announcement of the Eucharist: the bread is not a symbol, but Christ’s actual flesh (sarx) sacrificed on Calvary and made sacramentally present in the Mass (CCC §1406).',
      orthodox: 'The Mystery of the Incarnation and the Holy Eucharist joined together: partaking of Christ’s living flesh in the liturgy grants immortality and theosis.',
      reformed: 'Christ gives His flesh on the cross as the atoning sacrifice; by faith, believers receive all the redemptive benefits of His bodily death.',
      lutheran: 'Affirms the real bodily presence: the very flesh given on the cross is distributed and eaten in the Lord’s Supper in, with, and under the bread.',
      wesleyan: 'Christ’s universal sacrifice provides life for the whole world; partaking of His grace in the Sacrament transforms the believer in holy love.',
      anglican: 'Celebrates the one, full, perfect, and sufficient sacrifice, oblation, and satisfaction made by Christ in His flesh.',
      baptist_evangelical: 'Points forward to the substitutionary atonement on the cross, where Christ laid down His physical life for the redemption of sinners.'
    },
    originalLanguageInsights: [
      {
        term: 'Living Bread',
        originalScript: 'ὁ ἄρτος ὁ ζῶν',
        transliteration: 'ho artos ho zōn',
        strongsRef: 'G740 / G2198',
        nuance: 'Present participle: bread that possesses uncreated, self-existent divine life in itself.'
      },
      {
        term: 'My Flesh',
        originalScript: 'ἡ σάρξ μου',
        transliteration: 'hē sarx mou',
        strongsRef: 'G4561',
        nuance: 'Visceral physical human flesh, emphasizing the concrete reality of Christ’s incarnate body.'
      }
    ],
    suggestedQuestions: [
      'Why did Jesus shift His terminology to specifically name His "flesh" in verse 51?',
      'How does John 6:51 unite the Incarnation, the Crucifixion, and the Lord’s Supper?'
    ],
    practicalApplication: 'Rest in the absolute sufficiency of Christ’s sacrifice on your behalf, who gave His own flesh that you might live forever.'
  },
  'john_6_53': {
    passageRef: 'John 6:53',
    conciseOverview: 'Jesus delivers an uncompromising assertion: "Verily, verily, I say unto you, Except ye eat the flesh of the Son of man, and drink his blood, ye have no life in you."',
    theologicalThemes: [
      'The Absolute Necessity of Partaking in Christ',
      'The Shock of Drinking Blood in Second Temple Judaism',
      'Sacramental Communion and Spiritual Life'
    ],
    historicalContext: 'The command to "drink blood" was intensely shocking to a Jewish audience strictly forbidden from consuming blood under Levitical law (Leviticus 17:10-14). Jesus intentionally intensifies the requirement rather than withdrawing it.',
    lensPerspectives: {
      catholic: 'Demonstrates the absolute necessity of sacramental communion: reception of the Holy Eucharist is communion with the true Body and Blood of Christ, imparting sanctifying grace.',
      orthodox: 'The Holy Chalice is the cup of immortality; drinking the precious Blood of Christ unites the believer to the divine nature in theosis.',
      reformed: 'Shows the absolute necessity of vital union with Christ; without spiritual communion with His crucified body and blood through faith, a person remains spiritually dead.',
      lutheran: 'Confesses that Christ’s true blood is received in the sacrament of the altar for the remission of sins and strengthening of faith.',
      wesleyan: 'A solemn warning against spiritual complacency and a call to seek vital union with Christ in Word and Sacrament.',
      anglican: 'Exhorted in the BCP: "So to eat the flesh of thy dear Son Jesus Christ, and to drink his blood, that our sinful bodies may be made clean by his body."',
      baptist_evangelical: 'Understood as a strong Semitic idiom emphasizing total reliance upon Christ’s sacrificial death; to have life, one must personally appropriate the atonement by faith.'
    },
    originalLanguageInsights: [
      {
        term: 'Eat the Flesh... Drink His Blood',
        originalScript: 'φάγητε τὴν σάρκα... πίητε αὐτοῦ τὸ αἷμα',
        transliteration: 'phagēte tēn sarka... piēte autou to haima',
        strongsRef: 'G5315 / G4561 / G4095 / G129',
        nuance: 'Aorist subjunctive: an essential, decisive act of partaking that determines whether one possesses divine life.'
      }
    ],
    suggestedQuestions: [
      'Why was Jesus’ command to "drink blood" so astonishing to His first-century Jewish listeners?',
      'How does the New Covenant in Christ’s blood transform the Old Testament prohibition of Leviticus 17?'
    ],
    practicalApplication: 'Examine your heart: are you truly feeding upon Christ and relying on His blood for your eternal life?'
  },
  'john_6_55': {
    passageRef: 'John 6:55',
    conciseOverview: 'Jesus declares with unmistakable clarity: "For my flesh is true food, and my blood is true drink." (ἡ γὰρ σάρξ μου ἀληθής ἐστιν βρῶσις, καὶ τὸ αἷμά μου ἀληθής ἐστιν πόσις).',
    theologicalThemes: [
      'Transubstantiation and the Real Presence of Christ in the Eucharist',
      'The Sacramental Reality of True Food (Alēthēs Brōsis) and True Drink (Alēthēs Posis)',
      'The Linguistic Shift to Visceral Physical Reality (Sarx & Trōgō)',
      'The Holy Eucharist as the Center and Summit of Christian Worship'
    ],
    historicalContext: 'In the synagogue of Capernaum (John 6:59), Jesus refuses to soften His language despite mounting outrage and murmurings from His audience. Instead of using "sōma" (body) or figurative expressions, He uses "sarx" (flesh) and "alēthēs" (real, true, genuine), paving the way for the historic conciliar doctrines of the Real Presence.',
    lensPerspectives: {
      catholic: 'In Catholic dogmatic theology (Council of Trent, Sess. XIII, Can. 1-2; CCC §1374-1376), John 6:55 is the cornerstone proof of Transubstantiation. Jesus does not say His flesh is a symbol of food, but "true food" (alēthēs brōsis). Through priestly consecration, the entire substance of bread and wine is converted into the true Body, Blood, Soul, and Divinity of Jesus Christ.',
      orthodox: 'Affirms the literal, mystical transformation (metousiosis / metabole) of the Eucharistic gifts through the Epiclesis in the Divine Liturgy, communicating uncreated divine life and theosis to the faithful.',
      reformed: 'Interprets "true food" in light of John 6:35 and John 6:63 ("the flesh profits nothing; the words are spirit and life"). Believers spiritually feed upon the crucified Christ by faith through the Holy Spirit without a physical conversion of elements (WCF 29.7).',
      lutheran: 'Confesses the Sacramental Union (Augsburg Confession Art. X): the real physical Body and Blood of Christ are substantially present "in, with, and under" the bread and wine, received orally by faith.',
      wesleyan: 'Regards this verse as the divine foundation for the Sacrament of the Lord’s Supper as a converting and sustaining means of grace imparting holy love (Wesley Sermon 101).',
      anglican: 'Follows Article XXVIII of the 39 Articles: the Body and Blood of Christ are received after a heavenly and spiritual manner through faith in the Eucharistic feast.',
      baptist_evangelical: 'Interprets eating Christ’s flesh as a spiritual metaphor for trusting in His completed sacrifice on the cross (John 6:35, 6:40), memorialized in the Lord’s Supper ordinance.'
    },
    originalLanguageInsights: [
      {
        term: 'Flesh / Meat',
        originalScript: 'σάρξ',
        transliteration: 'sarx',
        strongsRef: 'G4561',
        nuance: 'Actual physical flesh/meat rather than merely "soma" (body). Deliberately chosen to emphasize the concrete physical reality of Christ’s offering.'
      },
      {
        term: 'True / Real / Genuine',
        originalScript: 'ἀληθής',
        transliteration: 'alēthēs',
        strongsRef: 'G227',
        nuance: 'True in substance, authentic, genuine—contrasting the ultimate eternal nourishment of Christ with temporary earthly sustenance.'
      },
      {
        term: 'Food / Eating',
        originalScript: 'βρῶσις',
        transliteration: 'brōsis',
        strongsRef: 'G1035',
        nuance: 'Food, meat, or the act of eating that provides true spiritual sustenance.'
      },
      {
        term: 'Chew / Eat Viscerally',
        originalScript: 'τρώγω',
        transliteration: 'trōgō',
        strongsRef: 'G5176',
        nuance: 'Used in vv. 54, 56, 57, 58—literally "to chew, gnaw, feed upon". Jesus intentionally shifts from generic "phago" to "trogo" to exclude a purely figurative reading.'
      }
    ],
    suggestedQuestions: [
      'Why does the Catholic Church regard John 6:55 as definitive scriptural proof for Transubstantiation?',
      'What is the theological significance of Jesus using "sarx" (flesh) and "trōgō" (chew) rather than metaphorical terms?',
      'How do Catholic, Lutheran, and Reformed traditions differ in their exegesis of John 6:55 vs John 6:63?'
    ],
    practicalApplication: 'Approach the Lord’s Table with solemn reverence, deep gratitude, and living faith, confessing Christ as the true, eternal nourishment for your soul.'
  },
  'john_6_56': {
    passageRef: 'John 6:56',
    conciseOverview: 'Jesus reveals the intimate, relational fruit of the Eucharistic mystery: "He that eateth my flesh, and drinketh my blood, dwelleth in me, and I in him."',
    theologicalThemes: [
      'Mutual Indwelling and Abiding (Menei en Emoi)',
      'The Unitive Power of Holy Communion',
      'Theosis and Sacramental Incorporation into Christ'
    ],
    historicalContext: 'Jesus introduces the Johannine signature concept of "abiding" (menō), demonstrating that partaking of His flesh and blood results in continuous, mutual spiritual indwelling.',
    lensPerspectives: {
      catholic: 'Through the reception of the Eucharist, the communicant is intimately incorporated into Christ, receiving the pledge of future glory (CCC §1391).',
      orthodox: 'The ultimate expression of theosis: liturgical communion unites the believer organically with the deified humanity of the incarnate Logos.',
      reformed: 'Abiding in Christ is the fruit of mystical union with Christ by the Holy Spirit through faith.',
      lutheran: 'The sacramental fellowship with Christ forgives sin and establishes the believer firmly in Christ’s living body.',
      wesleyan: 'Communion deepens the soul’s sanctifying union with Christ, fostering perfect love and spiritual holiness.',
      anglican: 'Prayed in the Prayer of Humble Access: "That we may evermore dwell in him, and he in us."',
      baptist_evangelical: 'Emphasizes that abiding in Christ is the continuous experience of the believer who walks in daily obedience and personal fellowship with the Lord.'
    },
    originalLanguageInsights: [
      {
        term: 'Dwelleth / Abideth',
        originalScript: 'μένει',
        transliteration: 'menei',
        strongsRef: 'G3306',
        nuance: 'Present active indicative: continuous, permanent, unbreakable dwelling and remaining in intimate fellowship.'
      }
    ],
    suggestedQuestions: [
      'What does "abiding" (menō) mean in the Gospel of John, and how does verse 56 connect it to communion?',
      'How does mutual indwelling comfort the believer in times of trial?'
    ],
    practicalApplication: 'Cherish your union with Christ today. Walk in the assurance that as you abide in Him, His life and power dwell within you.'
  },
  'john_6_63': {
    passageRef: 'John 6:63',
    conciseOverview: 'Jesus addresses the crisis among His listeners: "It is the spirit that quickeneth; the flesh profiteth nothing: the words that I speak unto you, they are spirit, and they are life."',
    theologicalThemes: [
      'The Quickening Work of the Holy Spirit (To Pneuma Estin To Zōopoioun)',
      'The Limits of Mere Carnal Human Reason ("The Flesh Profits Nothing")',
      'The Sacramental Hermeneutic of Spirit and Life'
    ],
    historicalContext: 'Spoken in response to the disciples who murmured: "This is a hard saying; who can hear it?" (v. 60). Many Protestant and Catholic exegetes interpret "the flesh profits nothing" with distinct theological nuances.',
    lensPerspectives: {
      catholic: 'St. John Chrysostom and St. Augustine clarify that "the flesh profits nothing" does NOT mean Christ’s flesh is useless (which would contradict the Incarnation and John 6:51), but that carnal, worldly human thinking cannot comprehend divine mysteries; Christ’s flesh united to the Logos is the source of life.',
      orthodox: 'The Holy Spirit is the Giver of Life who effects the Eucharistic transformation; human rationalism cannot grasp spiritual reality.',
      reformed: 'The key hermeneutical verse: establishes that Jesus’ discourse is spiritual; physical mastication cannot save, but the Holy Spirit giving life through the Word.',
      lutheran: 'Warns against judging the Sacrament by fallen human reason ("the flesh"); Christ’s word is Spirit and Life, making His physical presence real in the elements.',
      wesleyan: 'Emphasizes that outward religion without the quickening Spirit is dead; divine life is communicated through spiritual encounter.',
      anglican: 'Affirms the spiritual reception of Christ’s grace through the operation of the Holy Spirit.',
      baptist_evangelical: 'Decisive evidence that Jesus was speaking spiritually and figuratively about receiving His words in faith, not advocating physical consumption.'
    },
    originalLanguageInsights: [
      {
        term: 'The Spirit Gives Life',
        originalScript: 'τὸ πνεῦμά ἐστιν τὸ ζῳοποιοῦν',
        transliteration: 'to pneuma estin to zōopoioun',
        strongsRef: 'G4151 / G2227',
        nuance: 'Present active participle: the Holy Spirit is the sole life-creating and life-animating agency in the cosmos.'
      },
      {
        term: 'Flesh Profits Nothing',
        originalScript: 'ἡ σὰρξ οὐκ ὠφελεῖ οὐδέν',
        transliteration: 'hē sarx ouk ōphelei ouden',
        strongsRef: 'G4561 / G5623',
        nuance: 'Fallen carnal human understanding is completely useless for discerning divine revelation.'
      }
    ],
    suggestedQuestions: [
      'Why do Catholic and Protestant theologians interpret "the flesh profits nothing" differently in John 6:63?',
      'How does the Holy Spirit make Christ’s words "spirit and life" to the believer?'
    ],
    practicalApplication: 'Do not rely on human wisdom or carnal strength to understand God’s Word. Ask the Holy Spirit to illuminate your mind and give life to your spirit.'
  },
  'john_6_68': {
    passageRef: 'John 6:68',
    conciseOverview: 'Peter’s momentous confession following the mass departure of disciples: "Then Simon Peter answered him, Lord, to whom shall we go? thou hast the words of eternal life."',
    theologicalThemes: [
      'Apostolic Fidelity Amidst Cultural Desertion',
      'The Uniqueness and Exclusivity of Christ',
      'The Words of Eternal Life (Rhēmata Zōēs Aiōniou)'
    ],
    historicalContext: 'After Jesus refused to dilute His Eucharistic teaching on eating His flesh and drinking His blood, many disciples walked away (v. 66). Jesus asks the Twelve: "Will ye also go away?" Peter responds with this definitive declaration.',
    lensPerspectives: {
      catholic: 'Simon Peter acts as the spokesman for the Twelve and the rock of the Church, affirming faith in Christ’s mystery when others stumble.',
      orthodox: 'The apostolic confession of faith: even when the divine mysteries surpass human comprehension, the Church clings to the divine Master.',
      reformed: 'Illustrates the persevering faith of the elect who, enlightened by sovereign grace, recognize that there is no other Savior.',
      lutheran: 'The triumph of faith clinging to the Word of the Gospel in spite of offense and scandal.',
      wesleyan: 'A wholehearted decision to follow Jesus regardless of the cost or the abandonment of the crowd.',
      anglican: 'A confession of the sufficiency and supremacy of Christ celebrated in the daily liturgy.',
      baptist_evangelical: 'The foundational conviction of every genuine disciple: Jesus alone has the words of eternal life, and there is salvation in no one else.'
    },
    originalLanguageInsights: [
      {
        term: 'To Whom Shall We Go?',
        originalScript: 'πρὸς τίνα ἀπελευσόμεθα',
        transliteration: 'pros tina apeleusometha',
        strongsRef: 'G4314 / G5101 / G565',
        nuance: 'A rhetorical question expressing the complete absence of any alternative source of truth or salvation.'
      },
      {
        term: 'Words of Eternal Life',
        originalScript: 'ῥήματα ζωῆς αἰωνίου',
        transliteration: 'rhēmata zōēs aiōniou',
        strongsRef: 'G4487 / G2222 / G166',
        nuance: 'Living, spoken divine utterances that impart and sustain eternal life.'
      }
    ],
    suggestedQuestions: [
      'Why did so many disciples leave Jesus in John 6:66, and why did the Twelve stay?',
      'How does Peter’s answer in verse 68 guide us when biblical teachings feel challenging or countercultural?'
    ],
    practicalApplication: 'When you encounter biblical truths that challenge the prevailing culture, renew Peter’s confession: "Lord, to whom shall I go? You have the words of eternal life."'
  },
  'acts_17_11': {
    passageRef: 'Acts 17:11',
    conciseOverview: 'The Berean believers in Macedonia are celebrated for an exceptional posture: welcoming apostolic teaching with open eagerness while rigorously cross-examining the Old Testament Scriptures daily to confirm truth.',
    theologicalThemes: [
      'The Authority and Reliability of Scripture',
      'Intellectual Rigor paired with Spiritual Openness',
      'Verification of Christian Claims against Revelation',
      'The Calling of the Church to Daily Engagement'
    ],
    historicalContext: 'Berea was a quiet Macedonian Roman city. After Paul faced violent opposition in Thessalonica, he found in the Berean synagogue an audience dedicated to honest textual investigation.',
    lensPerspectives: {
      historical_grammatical: 'The Greek participle "anakrinontes" was a legal term used for judicial scrutiny and preliminary investigation, depicting an active, methodical examination of the Septuagint scrolls.',
      reformed: 'A primary demonstration of Sola Scriptura and the principle of the "analogy of faith"—Scripture interpreting Scripture without subservience to human decree.',
      wesleyan: 'Exemplifies the Wesleyan quadrilateral: Scripture as primary authority, enlightened by reason and tested against living religious experience.',
      anglican: 'Embodies the Anglican via media: high respect for apostolic authority coupled with reason and scriptural primacy.',
      catholic: 'Illustrates how the early Christian community heard apostolic oral tradition and harmonized it with the written Word of the prophets within the ecclesial assembly.',
      baptist_evangelical: 'A model for every Christian believer to cultivate daily personal devotional study and cultivate discernment against theological deception.'
    },
    originalLanguageInsights: [
      {
        term: 'Noble-minded',
        originalScript: 'εὐγενέστεροι',
        transliteration: 'eugenesteroi',
        strongsRef: 'G2104',
        nuance: 'Originally meant high-born or aristocratic; Luke uses it here to describe high moral character, openness of mind, and fairness.'
      },
      {
        term: 'Examining',
        originalScript: 'ἀνακρίνοντες',
        transliteration: 'anakrinontes',
        strongsRef: 'G350',
        nuance: 'A judicial term meaning investigating evidence with rigor, cross-checking every claim against the textual record.'
      }
    ],
    suggestedQuestions: [
      'Why did Luke contrast the Bereans with the Thessalonians?',
      'What specific Old Testament prophecies would the Bereans have examined regarding the Messiah?',
      'How can modern Christians maintain both eagerness to learn and healthy biblical discernment?'
    ],
    practicalApplication: 'Approach your Bible reading with both an open, expectant heart and a discerning, investigative mind. Check what you hear against the Word of God daily.'
  },
  'romans_8_1': {
    passageRef: 'Romans 8:1',
    conciseOverview: 'Paul announces the definitive legal and spiritual reality for every believer in Christ: the complete abolition of punitive condemnation through the Spirit of life in Christ Jesus.',
    theologicalThemes: [
      'Justification and Legal Immunity in Christ',
      'The Emancipation of the Spirit over Sin and Death',
      'The Law’s Inability vs Christ’s Complete Sufficiency'
    ],
    historicalContext: 'Written by Paul to the Roman church to establish unity and theological certainty based on the finished work of Christ.',
    lensPerspectives: {
      historical_grammatical: '"Katakrima" denotes not merely the judicial sentence, but the subsequent punishment and servitude resulting from the verdict.',
      reformed: 'The bedrock of double imputation: Christ took our condemnation so that His active righteousness is credited to our account forever.',
      wesleyan: 'Freedom from condemnation empowers the believer into the ongoing work of entire sanctification through the Holy Spirit.',
      anglican: 'Celebrated in the liturgical comfortable words: "Hear what comfortable words our Saviour Christ saith..."',
      catholic: 'Grace is not merely a legal verdict but an ontic transformation restoring humanity from death into divine sonship.',
      baptist_evangelical: 'Provides assurance of salvation and peace of mind when facing self-doubt and spiritual guilt.'
    },
    originalLanguageInsights: [
      {
        term: 'No Condemnation',
        originalScript: 'οὐδὲν κατάκριμα',
        transliteration: 'ouden katakrima',
        strongsRef: 'G2631',
        nuance: 'Absolute emphatic negative ("not even one piece of condemnation")—the penalty has been fully absorbed.'
      }
    ],
    suggestedQuestions: [
      'How does Romans 8 answer the struggle described in Romans 7?',
      'What is the difference between conviction of the Holy Spirit and condemnation?'
    ],
    practicalApplication: 'Whenever feelings of shame or unworthiness arise, speak Romans 8:1 over your identity: In Christ, there is zero condemnation against you.'
  },
  'genesis_1_1': {
    passageRef: 'Genesis 1:1',
    conciseOverview: 'The foundational declaration of cosmological creation: God alone is the transcendent, sovereign originator of time, space, matter, and order out of nothing.',
    theologicalThemes: [
      'Creatio Ex Nihilo (Creation out of nothing)',
      'The Trinitarian Presence (God, Spirit hovering, spoken Word)',
      'Divine Order overcoming formlessness'
    ],
    historicalContext: 'Ancient Near Eastern polemic against polytheistic creation myths establishing Yahweh as the sole benevolent Sovereign.',
    lensPerspectives: {
      historical_grammatical: '"Bara" is a verb exclusively reserved in the Old Testament for divine creative activity without pre-existing materials.',
      reformed: 'The sovereign decree of the Triune God bringing forth all things for His own glory.',
      wesleyan: 'God’s fundamental character is self-communicating love and light.',
      anglican: 'Affirmed in the historic Nicene Creed: "Maker of heaven and earth, and of all things visible and invisible."',
      catholic: 'Creation is intrinsically good and intended as a cosmic temple reflecting the Divine Energies.',
      baptist_evangelical: 'The foundation for understanding human dignity, stewardship of creation, and moral accountability.'
    },
    originalLanguageInsights: [
      {
        term: 'Created',
        originalScript: 'בָּרָא',
        transliteration: 'Bara',
        strongsRef: 'H1254',
        nuance: 'An exclusively divine activity of creating something entirely novel and breathtaking.'
      },
      {
        term: 'In the Beginning',
        originalScript: 'בְּרֵאשִׁית',
        transliteration: 'Bereshit',
        strongsRef: 'H7225',
        nuance: 'The initial absolute commencement of temporal order, space, and material reality.'
      }
    ],
    suggestedQuestions: [
      'How does Genesis 1:1 relate to John 1:1 ("In the beginning was the Word")?',
      'What does "Bara" reveal about God’s creative power versus human craft?'
    ],
    practicalApplication: 'Whatever area of your life feels disordered today, invite the Creator God to bring order, light, and life into your circumstances.'
  },
  'acts_15_18': {
    passageRef: 'Acts 15:18',
    conciseOverview: 'James concludes his prophetic quotation from Amos, declaring: "Known unto God are all his works from the beginning of the world." (or "Says the Lord, who makes these things known from long ago.")',
    theologicalThemes: [
      'Divine Omniscience & Eternal Providence',
      'Gentile Inclusion as God’s Eternal Blueprint (Not a Plan B)',
      'The Harmony of Prophecy and Apostolic Fulfillment',
      'The Sovereign Mystery of God’s Redemptive Plan'
    ],
    historicalContext: 'Citing the prophet Amos (Amos 9:11–12) and Isaiah (Isaiah 45:21), James demonstrates to the Jerusalem Council that the inclusion of the Gentiles was planned and revealed by God centuries before.',
    lensPerspectives: {
      historical_grammatical: 'The Greek phrase "gnōsta ap\' aiōnos" (γνωστὰ ἀπ\' αἰῶνος) links the apostolic mission directly to Isaiah 45:21, demonstrating that the Gentile mission fulfills ancient prophecy.',
      catholic: 'Affirms divine eternal providence (CCC §302, §308) and St. Thomas Aquinas’s teaching on divine foreknowledge: God’s eternal plan to redeem humanity unfolds in the sacramental reality of the universal Church.',
      reformed: 'A classic proof-text for God’s eternal decree and sovereign foreordination: all of God’s works in time were eternally conceived in His sovereign wisdom.',
      wesleyan: 'Highlights God’s eternal heart of universal love, showing that His desire to offer salvation to all nations was established before time began.',
      anglican: 'A majestic affirmation of the divine economy and the unity of the Old and New Covenants in the liturgy and life of the Church.',
      baptist_evangelical: 'Reassures believers that God is never surprised or reacting in panic; His redemptive plan in Christ is secure from all eternity.'
    },
    originalLanguageInsights: [
      {
        term: 'Known from of Old / From the Ages',
        originalScript: 'γνωστὰ ἀπ\' αἰῶνος',
        transliteration: 'gnōsta ap\' aiōnos',
        strongsRef: 'G1110 / G165',
        nuance: 'Signifies eternal divine foreknowledge; known to God from all eternity before the creation of the world.'
      },
      {
        term: 'All His Works',
        originalScript: 'πάντα τὰ ἔργα αὐτοῦ',
        transliteration: 'panta ta erga autou',
        strongsRef: 'G3956 / G2041',
        nuance: 'The totality of God’s redemptive and providential actions across human history.'
      }
    ],
    suggestedQuestions: [
      'What does the Catholic Church teach about divine providence in Acts 15:18?',
      'How does "known from of old" prove that Gentile salvation was not an afterthought?',
      'How do Thomas Aquinas and Church Fathers interpret God\'s eternal knowledge in this verse?'
    ],
    practicalApplication: 'Rest in the truth that God’s plan for your life and for His Church is not an afterthought. Trust His eternal wisdom even when earthly circumstances appear uncertain.'
  },
  'acts_15_21': {
    passageRef: 'Acts 15:21',
    conciseOverview: 'James explains the rationale for the conciliar decree: "For Moses of old time hath in every city them that preach him, being read in the synagogues every sabbath day."',
    theologicalThemes: [
      'Pastoral Sensitivity in Multi-Ethnic Fellowship',
      'The Widespread Proclamation of the Torah in Diaspora Synagogues',
      'Preserving Unity Without Imposing Legalistic Burdens',
      'Christian Liberty Tempered by Fraternal Love'
    ],
    historicalContext: 'During the Second Temple period, Jewish diaspora communities maintained synagogues in virtually every major Greco-Roman city where the Torah was read weekly on the Sabbath.',
    lensPerspectives: {
      historical_grammatical: 'Explains that because the Mosaic law was already well-known throughout the diaspora, Gentile Christians should respect basic sensitivities to avoid rupturing table fellowship with Jewish believers.',
      reformed: 'Distinguishes between the enduring moral law of God and the ceremonial regulations which pointed forward to Christ.',
      wesleyan: 'Illustrates how Christian liberty must always be exercised within the bounds of holy love, ensuring we never cause a brother to stumble.',
      anglican: 'A pastoral example of balancing ecclesiastical order, respect for historic tradition, and evangelical freedom in Christ.',
      catholic: 'Highlights the pastoral prudence of the early episcopacy in fostering harmonious communion between Jewish and Gentile faithful.',
      baptist_evangelical: 'Emphasizes that while believers are free from the ceremonial law for justification, love demands sensitivity toward the consciences of others.'
    },
    originalLanguageInsights: [
      {
        term: 'Ancient Generations / Of Old Time',
        originalScript: 'ἐκ γενεῶν ἀρχαίων',
        transliteration: 'ek geneōn archaiōn',
        strongsRef: 'G1074 / G744',
        nuance: 'Refers to the deep, long-established historical presence of Jewish communities across Mediterranean cities.'
      },
      {
        term: 'Preach / Proclaim',
        originalScript: 'κηρύσσω',
        transliteration: 'kēryssō',
        strongsRef: 'G2784',
        nuance: 'To publicly herald and proclaim divine revelation as an authorized messenger.'
      },
      {
        term: 'Synagogues',
        originalScript: 'συναγωγή',
        transliteration: 'synagōgē',
        strongsRef: 'G4864',
        nuance: 'The weekly gathering places for Scripture reading, prayer, and communal instruction in every city.'
      }
    ],
    suggestedQuestions: [
      'Why does James mention the weekly reading of Moses in synagogues in Acts 15:21?',
      'How does Acts 15:21 balance Christian liberty with pastoral love for fellow believers?',
      'What does this verse teach us about avoiding unnecessary stumbling blocks in evangelism?'
    ],
    practicalApplication: 'In your daily life, consider how your actions and choices affect those around you. Use your freedom in Christ not for self-indulgence, but to serve others in love.'
  },
  'acts_15_23': {
    passageRef: 'Acts 15:23',
    conciseOverview: 'The opening salutation of the historic Jerusalem Decree: "The apostles and elders and brethren send greeting unto the brethren which are of the Gentiles in Antioch and Syria and Cilicia."',
    theologicalThemes: [
      'Universal Brotherhood in Christ (Adelphoi)',
      'Collegial Leadership and Conciliar Unity',
      'Pastoral Care Across Cultural and Ethnic Boundaries',
      'The Vindication of Gentile Christian Liberty'
    ],
    historicalContext: 'Written in Jerusalem (c. AD 49–50) to officially communicate the decisions of the Jerusalem Council to Gentile congregations troubled by unauthorized legalistic teachers.',
    lensPerspectives: {
      historical_grammatical: 'The Greek formula combines Hellenistic epistolary conventions (chairein) with the distinctive Christian designation of Gentile believers as full "brothers" (adelphoi), bridging Judean and Greco-Roman worlds.',
      reformed: 'Demonstrates the organic unity of the Church and the authority of apostolic synods in delivering binding pastoral counsel rooted in Sola Gratia.',
      wesleyan: 'Reflects the sanctifying power of holy love tearing down walls of ethnic suspicion and welcoming outsiders into full family fellowship.',
      anglican: 'A classic pattern of episcopal and synodical collaboration: apostles and presbyters ministering together in corporate pastoral care.',
      catholic: 'Illustrates the collegial communion (koinonia) of the apostolic college authoritatively addressing the regional churches in fraternal solidarity.',
      baptist_evangelical: 'Emphasizes that all believers in Jesus are equal brothers and sisters; no ethnic heritage or ritual pedigree elevates one Christian above another.'
    },
    originalLanguageInsights: [
      {
        term: 'Brothers / Kin in Christ',
        originalScript: 'ἀδελφοί',
        transliteration: 'adelphoi',
        strongsRef: 'G80',
        nuance: 'Designates full covenant family equality; Jewish leaders warmly embrace Gentile converts as true siblings in the Messiah.'
      },
      {
        term: 'Greetings / Rejoice',
        originalScript: 'χαίρειν',
        transliteration: 'chairein',
        strongsRef: 'G5463',
        nuance: 'The classical Hellenistic salutation meaning "rejoice!" or "grace be with you", expressing joyful peace and relief.'
      },
      {
        term: 'Elders / Presbyters',
        originalScript: 'πρεσβύτεροι',
        transliteration: 'presbyteroi',
        strongsRef: 'G4245',
        nuance: 'Mature spiritual leaders sharing pastoral governance alongside the apostles in Jerusalem.'
      }
    ],
    suggestedQuestions: [
      'What is the primary spiritual truth emphasized in Acts 15:23?',
      'Why is it significant that Jewish apostles addressed Gentile converts as "brothers" (adelphoi)?',
      'What does the greeting "Chairein" (Rejoice) reveal about the tone of the apostolic council?',
      'How did the early church resolve doctrinal conflicts through collaborative leadership?'
    ],
    practicalApplication: 'Look at other believers through the lens of Acts 15:23—as equal brothers and sisters in Christ. Seek to bring peaceful, joyful reconciliation wherever cultural or theological tensions arise.'
  },
  'acts_15_28': {
    passageRef: 'Acts 15:28',
    conciseOverview: 'The decisive decree of the Apostolic Council of Jerusalem, articulating the groundbreaking pneumatic formula: "For it seemed good to the Holy Ghost, and to us, to lay upon you no greater burden than these necessary things."',
    theologicalThemes: [
      'Pneumatic Guidance and Ecclesial Consensus',
      'Salvation by Grace Alone vs Legalistic Burdens',
      'Gentile Inclusion in the Covenant Family of God',
      'The Authority of the Holy Spirit in Church Governance'
    ],
    historicalContext: 'The Jerusalem Council (c. AD 49–50) resolved the defining crisis of early Christianity: whether Gentile converts were required to be circumcised and observe the Mosaic ceremonial law to be saved.',
    lensPerspectives: {
      historical_grammatical: 'The Greek phrase "edoxen gar tō pneumati tō hagiō kai hēmin" indicates that the apostles viewed their conciliar decision not as human legislation, but as the recognition of the Holy Spirit’s already-accomplished work among the Gentiles.',
      reformed: 'A monumental defense of the Sola Gratia principle: Gentiles are saved by the free grace of Christ without the yoke of the ceremonial law, while moral holiness is preserved.',
      wesleyan: 'Illustrates the Holy Spirit working through open-hearted discernment, dialogue, and holy love to remove stumbling blocks for seekers.',
      anglican: 'The foundational biblical paradigm for conciliar authority, synodical governance, and seeking the mind of the Spirit through corporate prayer and consensus.',
    },
    originalLanguageInsights: [
      {
        term: 'It Seemed Good to the Holy Ghost',
        originalScript: 'ἔδοξεν γὰρ τῷ πνεύματι τῷ ἁγίῳ καὶ ἡμῖν',
        transliteration: 'edoxen gar tō pneumati tō hagiō kai hēmin',
        strongsRef: 'G1380 / G4151 / G40',
        nuance: 'Conciliar formula expressing direct divine-human synergy in ecclesiastical discernment.'
      }
    ],
    suggestedQuestions: [
      'How does the formula "It seemed good to the Holy Spirit and to us" define apostolic authority?',
      'Why was the Jerusalem Council pivotal for Christian freedom from ceremonial law?'
    ],
    practicalApplication: 'Seek the guidance of the Holy Spirit in all church decisions, maintaining both grace and holiness.'
  },
  // =========================================================================
  // BATTLEGROUND / CONTENTIOUS THEOLOGICAL PASSAGES ACROSS CHRISTIAN HISTORY
  // =========================================================================
  'matthew_16_18': {
    passageRef: 'Matthew 16:18',
    conciseOverview: 'Jesus declares to Simon: "And I say also unto thee, That thou art Peter, and upon this rock I will build my church; and the gates of hell shall not prevail against it."',
    theologicalThemes: [
      'The Identity of the "Rock" (Petros vs Petra)',
      'The Foundation, Indefectibility, and Authority of the Church',
      'The Papacy, Petrine Primacy, and Apostolic Succession'
    ],
    historicalContext: 'Spoken at Caesarea Philippi, a region dominated by pagan shrines and a massive sheer rock wall cliff. Jesus gives Simon the Aramaic name Cephas (Kepha / Rock), translated into Greek as masculine Petros and feminine petra.',
    lensPerspectives: {
      catholic: 'The cornerstone biblical proof of the Papacy (Vatican I, Pastor Aeternus; CCC §881-882): Christ appoints Peter personally as the visible Rock and supreme head of the universal Church, a jurisdictional primacy that continues perpetually in Peter’s successors, the Bishops of Rome.',
      orthodox: 'Interprets the "Rock" not as Peter’s person or an autocratic Roman office, but as Peter’s inspired confession of faith in Christ the Son of God (St. John Chrysostom); Peter holds a primacy of honor among equal apostolic bishops in Holy Synod.',
      reformed: 'Christ Himself is the sole true Rock and Head of the Church (1 Cor 3:11, 10:4; Eph 2:20); Peter’s confession of Christ’s deity is the foundational truth upon which the Church of the elect is built.',
      lutheran: 'Rejects papal supremacy (Smalcald Articles II.IV): the Church is built upon the Gospel confession of Christ; the keys are given to the whole communion of believers for the forgiveness of sins.',
      wesleyan: 'Celebrates the indefectibility of Christ’s living Church against all demonic onslaughts, built upon the living apostolic faith in Jesus as Lord.',
      anglican: 'Upholds the historic threefold episcopate while rejecting universal papal jurisdiction; the Church is founded on the apostolic confession preserved in the Catholic Creeds.',
      baptist_evangelical: 'Affirms that Jesus Christ alone is the Rock and sole Head of the local and universal Church; every believer who shares Peter’s confession becomes part of the living body.'
    },
    originalLanguageInsights: [
      {
        term: 'Peter / Stone',
        originalScript: 'Πέτρος',
        transliteration: 'Petros',
        strongsRef: 'G4074',
        nuance: 'Masculine proper name meaning a stone, rock, or pebble (Aramaic: Kēp̄ā).'
      },
      {
        term: 'Rock / Bedrock',
        originalScript: 'πέτρᾳ',
        transliteration: 'petra',
        strongsRef: 'G4073',
        nuance: 'Feminine noun denoting a massive rock cliff, bedrock, or boulder; the grammatical shift between Petros and petra is central to historic Catholic vs Protestant debates.'
      },
      {
        term: 'Gates of Hell',
        originalScript: 'πύλαι ᾅδου',
        transliteration: 'pylai hadou',
        strongsRef: 'G4439 / G86',
        nuance: 'The fortress gates of the realm of death; the Church is depicted on the offensive, storming the strongholds of darkness.'
      }
    ],
    suggestedQuestions: [
      'What is the linguistic difference between "Petros" and "petra" in Matthew 16:18, and how do Catholics and Protestants interpret it?',
      'How does the Eastern Orthodox patristic view of Peter’s confession differ from Roman Catholic papal succession?'
    ],
    practicalApplication: 'Rest your soul upon Jesus Christ and the unshakable truth of His deity. No power of darkness or cultural upheaval can ever destroy His Church.'
  },
  'matthew_16_19': {
    passageRef: 'Matthew 16:19',
    conciseOverview: 'Jesus entrusts the Keys of the Kingdom: "And I will give unto thee the keys of the kingdom of heaven: and whatsoever thou shalt bind on earth shall be bound in heaven: and whatsoever thou shalt loose on earth shall be loosed in heaven."',
    theologicalThemes: [
      'The Keys of the Kingdom (Claves Regni Caelorum)',
      'The Power of Binding and Loosing (Rabbinic Legal & Sacramental Authority)',
      'Apostolic Authority and Absolution of Sins'
    ],
    historicalContext: 'Echoes Isaiah 22:22, where Eliakim is given the key of the House of David with royal prime-ministerial authority to open and shut on behalf of the King.',
    lensPerspectives: {
      catholic: 'Peter receives the supreme keys of governance, doctrinal infallibility, and the power of the keys (sacramental absolution and excommunication), transferred to the Roman Pontiff.',
      orthodox: 'The keys were granted to Peter as representative of all the Apostles, and are exercised collegially by all bishops in the Sacrament of Holy Confession and synodical canons.',
      reformed: 'The "keys" are the preaching of the Gospel and church discipline, opening heaven to repentant believers and shutting it against the unrepentant (Heidelberg Catechism Q&A 83-85).',
      lutheran: 'The Office of the Keys (Small Catechism Part V) is the peculiar church power given by Christ to forgive the sins of penitent sinners on earth.',
      wesleyan: 'The spiritual power of preaching the Gospel with the authority of the Holy Spirit to loose captives from the bondage of sin.',
      anglican: 'Exercised in the apostolic ministry through pastoral oversight, preaching the Word, and the ministry of reconciliation in the BCP.',
      baptist_evangelical: 'The keys represent the proclamation of the Gospel of salvation; heaven confirms the forgiveness declared whenever a sinner repents and believes.'
    },
    originalLanguageInsights: [
      {
        term: 'Keys of the Kingdom',
        originalScript: 'τὰς κλεῖδας τῆς βασιλείας',
        transliteration: 'tas kleidas tēs basileias',
        strongsRef: 'G2807 / G932',
        nuance: 'Ancient symbol of royal stewardly authority and administrative guardianship (Isaiah 22:22).'
      },
      {
        term: 'Bind and Loose',
        originalScript: 'δήσῃς... λύσῃς',
        transliteration: 'dēsēs... lysēs',
        strongsRef: 'G1210 / G3089',
        nuance: 'Rabbinic judicial idiom meaning to declare forbidden/permitted, or to excommunicate/reconcile.'
      }
    ],
    suggestedQuestions: [
      'How does the Old Testament background of Isaiah 22:22 illuminate Jesus giving the keys to Peter?',
      'How do Catholic and Protestant views of "binding and loosing" differ regarding the sacraments?'
    ],
    practicalApplication: 'Rejoice in the authority of the Gospel that has loosed you from the chains of guilt and sin through Christ’s blood.'
  },
  'james_2_24': {
    passageRef: 'James 2:24',
    conciseOverview: 'The premier text in the Faith vs. Works debate: "Ye see then how that by works a man is justified, and not by faith only." (ὁρᾶτε ὅτι ἐξ ἔργων δικαιοῦται ἄνθρωπος καὶ οὐκ ἐκ πίστεως μόνον).',
    theologicalThemes: [
      'Justification by Works vs Justification by Faith Alone (Sola Fide)',
      'The Nature of Genuine, Living Faith (Pistis)',
      'Harmonization of James 2:24 with Paul’s Romans 3:28'
    ],
    historicalContext: 'James addresses a dangerous early Christian distortion (antinomianism) where some claimed that mere intellectual assent without acts of charity and mercy could save them.',
    lensPerspectives: {
      catholic: 'The definitive biblical refutation of "faith alone" (Council of Trent Sess. VI, Can. 9 & 24): initial justification is by grace, but justification is truly preserved, deepened, and increased by supernatural works of charity (Gal 5:6; James 2:24).',
      orthodox: 'Rejects the Western legalistic split: salvation is a living synergy (cooperation) between divine grace and human faith working in love toward theosis.',
      reformed: 'Paul speaks of justification before God’s judicial tribunal (Romans 3:28); James speaks of justification before men—the vindication and demonstration of living faith (WCF 11.2: "Faith alone justifies, but the faith that justifies is never alone").',
      lutheran: 'Reaffirms Sola Fide (Augsburg Art. IV & VI): good works are the necessary fruit and evidence of true faith, but contribute zero merit to our standing before God.',
      wesleyan: 'Teaches that we are justified by faith alone initially, but that ongoing obedience and holy love are required conditions for final salvation.',
      anglican: 'Article XI & XII of 39 Articles: "We are justified by Faith only... but good works do spring out necessarily of a true and lively Faith."',
      baptist_evangelical: 'Works are the visible proof of regeneration, not the cause; we are saved by grace through faith alone, but saving faith produces good works (Eph 2:8-10).'
    },
    originalLanguageInsights: [
      {
        term: 'Justified by Works',
        originalScript: 'ἐξ ἔργων δικαιοῦται',
        transliteration: 'ex ergōn dikaioutai',
        strongsRef: 'G2041 / G1344',
        nuance: 'Dikaioō here functions in the sense of vindicating, proving authentic, or demonstrating righteousness in action.'
      },
      {
        term: 'Not by Faith Only',
        originalScript: 'οὐκ ἐκ πίστεως μόνον',
        transliteration: 'ouk ek pisteōs monon',
        strongsRef: 'G3756 / G4102 / G3441',
        nuance: 'The only occurrence of the phrase "faith only" / "faith alone" in the Greek New Testament.'
      }
    ],
    suggestedQuestions: [
      'How do Catholic and Protestant theologians reconcile James 2:24 ("not by faith only") with Romans 3:28 ("by faith without works")?',
      'What does James mean by saying that faith without works is "dead"?'
    ],
    practicalApplication: 'Let your faith be seen in action today. Show Christ’s love through tangible generosity, compassion, and obedience to those in need.'
  },
  'romans_3_28': {
    passageRef: 'Romans 3:28',
    conciseOverview: 'Paul’s signature declaration of the Reformation: "Therefore we conclude that a man is justified by faith without the deeds of the law." (λογιζόμεθα γὰρ δικαιοῦσθαι πίστει ἄνθρωπον χωρὶς ἔργων νόμου).',
    theologicalThemes: [
      'Justification by Faith (Dikaioutai Pistei)',
      'Exclusion of the Works of the Torah (Erga Nomou)',
      'The Imputation of Christ’s Righteousness (Sola Fide)'
    ],
    historicalContext: 'Paul proves that neither Gentiles under natural law nor Jews under Mosaic Torah can be justified by their own legal performance before the holy judgment seat of God.',
    lensPerspectives: {
      catholic: 'Paul excludes the ceremonial works of the Mosaic Law (circumcision, dietary rules); he does not exclude the interior theological virtues of faith, hope, and charity working in grace (Trent Sess. VI).',
      orthodox: 'Justification is the healing of human nature and restoration to divine communion, received through faith in the incarnate Lord.',
      reformed: 'The bedrock of Sola Fide (WCF 11.1): justification is an instantaneous forensic verdict where God imputes Christ’s active and passive obedience to the sinner through faith alone.',
      lutheran: 'The central article on which the Church stands or falls (Articulus stantis et cadentis ecclesiae - Augsburg Art. IV): sinners are justified freely as a gift through faith in Christ’s propitiation.',
      wesleyan: 'Faith is the sole condition of justification, releasing the sinner from guilt and enabling the new birth into holiness.',
      anglican: 'Article XI: "We are accounted righteous before God, only for the merit of our Lord and Saviour Jesus Christ by Faith, and not for our own works."',
      baptist_evangelical: 'Salvation is 100% free by faith in Jesus; human works, rituals, or moral efforts contribute nothing to our pardon and justification.'
    },
    originalLanguageInsights: [
      {
        term: 'Justified by Faith',
        originalScript: 'δικαιοῦσθαι πίστει',
        transliteration: 'dikaiousthai pistei',
        strongsRef: 'G1344 / G4102',
        nuance: 'Present passive infinitive: to be declared legally righteous, acquitted, and pardoned in God’s court.'
      },
      {
        term: 'Apart from Works of Law',
        originalScript: 'χωρὶς ἔργων νόμου',
        transliteration: 'chōris ergōn nomou',
        strongsRef: 'G5565 / G2041 / G3551',
        nuance: 'Entirely independent of legalistic performance, human merit, or Mosaic ceremonial codes.'
      }
    ],
    suggestedQuestions: [
      'What does "justification" mean in Paul’s legal courtroom imagery?',
      'How does Paul’s use of "works of the law" relate to both moral performance and Jewish ceremonial markers?'
    ],
    practicalApplication: 'Cease from the exhausting striving of self-righteousness. Rest today in the perfect, finished righteousness of Jesus Christ received by faith.'
  },
  'romans_9_15': {
    passageRef: 'Romans 9:15',
    conciseOverview: 'God declares His sovereign prerogative: "For he saith to Moses, I will have mercy on whom I will have mercy, and I will have compassion on whom I will have compassion."',
    theologicalThemes: [
      'Unconditional Sovereign Election (Sola Gratia)',
      'Divine Mercy as Unmerited Prerogative',
      'The Calvinist vs Arminian / Wesleyan Theological Crossroads'
    ],
    historicalContext: 'Paul cites Exodus 33:19 to explain why God’s covenant promises to ethnic Israel have not failed, demonstrating that true spiritual Israel is defined by divine election rather than physical lineage.',
    lensPerspectives: {
      catholic: 'God’s predestination is absolute and sovereign, yet mysterious and harmonious with human free will; God desires all men to be saved while sovereignly dispensing particular graces (CCC §600).',
      orthodox: 'God foreknows all human choices in His eternal present; divine election is synergistic and never imposes an irresistible fatalism upon human freedom.',
      reformed: 'The ultimate proof of Unconditional Election (Canons of Dort I; WCF 3.1): God owes mercy to no fallen creature; He sovereignly elects vessels of mercy and passes over others according to His eternal counsel.',
      lutheran: 'Contemplates election exclusively in Christ the crucified Savior (Formula of Concord XI), rejecting double predestination while confessing that salvation is 100% of grace.',
      wesleyan: 'Prevenient grace is offered universally; God’s sovereign choice is to save all who believe in Christ, conditioned on responsive faith (Wesley Sermon 128: Free Grace).',
      anglican: 'Article XVII: "Predestination to Life is the everlasting purpose of God... full of sweet, pleasant, and unspeakable comfort to godly persons."',
      baptist_evangelical: 'God’s sovereign purpose of grace regenerates and saves sinners, working in harmony with human responsibility to believe the Gospel.'
    },
    originalLanguageInsights: [
      {
        term: 'I Will Have Mercy',
        originalScript: 'ἐλεήσω ὃν ἂν ἐλεῶ',
        transliteration: 'eleēsō hon an eleō',
        strongsRef: 'G1653',
        nuance: 'Emphatic future and present active: sovereign, unconstrained bestowal of covenant mercy.'
      }
    ],
    suggestedQuestions: [
      'How do Reformed (Calvinist) and Wesleyan (Arminian) theologians differ in their interpretation of Romans 9:15–18?',
      'Why does Paul emphasize that mercy is a gift rather than an earned obligation?'
    ],
    practicalApplication: 'Bow in awe before the majestic holiness and mercy of God. If you belong to Christ, your salvation is an astounding miracle of unearned grace.'
  },
  'acts_2_38': {
    passageRef: 'Acts 2:38',
    conciseOverview: 'Peter’s Pentecost proclamation: "Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost."',
    theologicalThemes: [
      'Baptismal Regeneration vs. Symbolic Ordinance',
      'The Link Between Repentance, Water Baptism, and Forgiveness (Eis Aphesin Hamartiōn)',
      'The Gift of the Holy Spirit for Every Believer'
    ],
    historicalContext: 'Peter delivers the climax of the first Christian sermon on the Day of Pentecost in Jerusalem. Pierced to the heart, the crowd asks: "Men and brethren, what shall we do?"',
    lensPerspectives: {
      catholic: 'Clear proof of Sacramental Baptismal Regeneration (CCC §1213-1228): baptism is the instrumental cause through which the guilt of original and actual sin is washed away and the Holy Spirit is infused.',
      orthodox: 'The Holy Mystery of Baptism and Chrismation: the candidate undergoes mystical burial and resurrection with Christ, receiving true regeneration and the seal of the Spirit.',
      reformed: 'Baptism is the covenant sign and seal of regeneration and remission of sins, applying the promises of God to believers and their children (Acts 2:39; WCF 28).',
      lutheran: 'Confesses Baptismal Regeneration (Augsburg Art. IX): baptism is not a mere human work, but God’s Word joined to water that grants the forgiveness of sins and the Holy Spirit.',
      wesleyan: 'An essential converting and confirming means of grace ordained by Christ to initiate the believer into the covenant of grace.',
      anglican: 'Article XXVII: "Baptism is not only a sign of profession... but also a sign of Regeneration or New-Birth, whereby the promises of forgiveness of sin are visibly signed and sealed."',
      baptist_evangelical: 'Believer’s Baptism by immersion (BF&M Art. VII): "eis" means "in view of" or "because of" remission of sins; baptism is a symbolic act of obedience testifying to prior inward regeneration through faith.'
    },
    originalLanguageInsights: [
      {
        term: 'For Remission of Sins',
        originalScript: 'εἰς ἄφεσιν τῶν ἁμαρτιῶν ὑμῶν',
        transliteration: 'eis aphesin tōn hamartiōn hymōn',
        strongsRef: 'G1519 / G859 / G266',
        nuance: 'The preposition "eis" is heavily debated: sacramentalists take it as telic ("in order to obtain"), while non-sacramentalists take it as causal ("with reference to / because of").'
      }
    ],
    suggestedQuestions: [
      'What is the theological debate over the Greek preposition "eis" in Acts 2:38?',
      'How do Catholic, Lutheran, and Baptist traditions understand the connection between water baptism and the remission of sins?'
    ],
    practicalApplication: 'Remember your baptism and repentance before God. Walk in the power and freedom of the Holy Spirit given to every follower of Christ.'
  },
  '1peter_3_21': {
    passageRef: '1 Peter 3:21',
    conciseOverview: 'Peter writes: "The like figure whereunto even baptism doth also now save us (not the putting away of the filth of the flesh, but the answer of a good conscience toward God,) by the resurrection of Jesus Christ."',
    theologicalThemes: [
      'Baptism as Antitype of Noah’s Ark (Antitypon)',
      'The Question of Baptismal Salvation ("Baptism doth also now save us")',
      'The Answer of a Good Conscience (Eperōtēma)'
    ],
    historicalContext: 'Peter connects the waters of Noah’s flood that cleansed the ancient earth to the waters of baptism in the New Covenant through the resurrection of Christ.',
    lensPerspectives: {
      catholic: 'Direct affirmation of sacramental efficacy: baptism saves through the resurrection of Christ, cleansing the soul from sin (CCC §1213).',
      orthodox: 'The baptismal waters become the tomb of the old man and the womb of the new creation in Christ.',
      reformed: 'Baptism is the visible sacrament signifying and sealing our spiritual salvation accomplished by Christ’s resurrection.',
      lutheran: 'The plain words of Scripture: baptism saves not as mere water, but water comprehended in God’s command and connected with God’s Word (Luther’s Small Catechism).',
      wesleyan: 'A means of grace where the pledge of a good conscience meets the saving power of the risen Savior.',
      anglican: 'A sacramental instrument through which God’s saving grace is effectively conveyed to those who receive it rightly.',
      baptist_evangelical: 'Clarifies that the physical water does not remove sin ("not the putting away of filth"), but salvation is by the spiritual pledge of faith ("answer of a good conscience") through the resurrection.'
    },
    originalLanguageInsights: [
      {
        term: 'Baptism Doth Save Us',
        originalScript: 'βάπτισμα σῴζει',
        transliteration: 'baptisma sōzei',
        strongsRef: 'G908 / G4982',
        nuance: 'Present active indicative: baptism saves as the New Covenant antitype of Noah’s ark.'
      },
      {
        term: 'Pledge / Answer of Good Conscience',
        originalScript: 'συνειδήσεως ἀγαθῆς ἐπερώτημα',
        transliteration: 'syneidēseōs agathēs eperōtēma',
        strongsRef: 'G4893 / G18 / G1906',
        nuance: 'A formal legal commitment, pledge, or appeal of the conscience towards God.'
      }
    ],
    suggestedQuestions: [
      'How does Peter qualify "baptism doth now save us" with the phrase "not the putting away of the filth of the flesh"?',
      'How does Noah’s ark serve as a biblical typology for Christian baptism?'
    ],
    practicalApplication: 'Place your trust not in empty rituals, but in the living, risen Christ whose resurrection guarantees your eternal salvation.'
  },
  '2thessalonians_2_15': {
    passageRef: '2 Thessalonians 2:15',
    conciseOverview: 'Paul commands the Thessalonians: "Therefore, brethren, stand fast, and hold the traditions which ye have been taught, whether by word, or our epistle."',
    theologicalThemes: [
      'Sacred Tradition vs Sola Scriptura',
      'Oral Apostolic Preaching and Written Canonical Epistles',
      'The Rule of Faith in the Church'
    ],
    historicalContext: 'Written before the New Testament canon was assembled, Paul exhorts believers to guard the apostolic deposit of faith (*paradosis*) against counterfeit letters and false teachers.',
    lensPerspectives: {
      catholic: 'The classic biblical proof that Sacred Apostolic Tradition and Sacred Scripture are of equal authority (Council of Trent Sess. IV; Dei Verbum §9; CCC §80-84): divine revelation is transmitted both in writing and in the living oral Tradition of the Church.',
      orthodox: 'Holy Tradition is the living life of the Holy Spirit in the Church, preserving the unwritten apostolic deposit in the Holy Liturgy and Councils (St. Basil, De Spiritu Sancto §66).',
      reformed: 'Paul refers to apostolic instruction given before the full New Testament canon was complete; today, all authoritative apostolic traditions are fully contained in the inerrant Scriptures (WCF 1.6).',
      lutheran: 'Human traditions may be kept for good order, but only the written Word of the Gospel has authority to bind the conscience (Augsburg Art. VII & XV).',
      wesleyan: 'Scripture is the primary rule of faith, interpreted through the historic consensus of the Church (Tradition), Reason, and Christian Experience (Wesleyan Quadrilateral).',
      anglican: 'The Three-Legged Stool: Scripture contains all things necessary for salvation, understood in harmony with the ancient Creeds and patristic Tradition (39 Articles Art. VI & XXI).',
      baptist_evangelical: 'Reaffirms Sola Scriptura: human church traditions have no authority over the conscience; the Bible alone is the final and sufficient authority in all matters of faith.'
    },
    originalLanguageInsights: [
      {
        term: 'Hold the Traditions',
        originalScript: 'κρατεῖτε τὰς παραδόσεις',
        transliteration: 'krateite tas paradoseis',
        strongsRef: 'G2902 / G3862',
        nuance: 'Paradosis literally means that which is handed down, transmitted, or delivered from one generation to the next.'
      }
    ],
    suggestedQuestions: [
      'How do Catholic and Protestant theologians interpret Paul’s command to hold traditions "by word, or our epistle"?',
      'How does the Wesleyan Quadrilateral integrate Scripture, Tradition, Reason, and Experience?'
    ],
    practicalApplication: 'Guard the pure apostolic Gospel handed down in Scripture against modern cultural compromises and theological fads.'
  },
  'luke_1_28': {
    passageRef: 'Luke 1:28',
    conciseOverview: 'The Annunciation of the Archangel Gabriel: "And the angel came in unto her, and said, Hail, thou that art highly favoured, the Lord is with thee: blessed art thou among women."',
    theologicalThemes: [
      'The Greeting of Gabriel (Ave Maria)',
      'The Meaning of "Kecharitomēnē" (Full of Grace / Favored One)',
      'Mariology and the Incarnation of the Son of God'
    ],
    historicalContext: 'The archangel Gabriel enters the humble dwelling of Miriam in Nazareth, greeting her with a unique divine title never used for any other mortal in the biblical canon.',
    lensPerspectives: {
      catholic: 'The scriptural foundation for the Immaculate Conception and Marian devotion (CCC §490-493): "Kecharitomēnē" (perfect passive participle) signifies that Mary was completely filled with sanctifying grace in a permanent, abiding state from her conception.',
      orthodox: 'Venerates the Holy Virgin as the Theotokos (God-Bearer) and Panagia (All-Holy), the purest flower of humanity through whom the eternal Logos became man.',
      reformed: 'Honors Mary as the blessed, humble handmaiden of the Lord and Mother of God according to His human nature, while directing all worship and prayer exclusively to Christ (Calvin).',
      lutheran: 'Praises Mary as the Mother of God in the Magnificat, while confessing Christ as the sole Mediator between God and man.',
      wesleyan: 'Regards Mary as a supreme model of humble, submissive faith and surrender to the will of God.',
      anglican: 'Celebrates the Annunciation and the Blessed Virgin Mary in the BCP lectionary, singing the Magnificat in Evening Prayer.',
      baptist_evangelical: 'Honors Mary as a faithful, godly young woman chosen by sovereign grace to bear the Messiah, rejecting any prayer to or adoration of Mary.'
    },
    originalLanguageInsights: [
      {
        term: 'Highly Favoured / Full of Grace',
        originalScript: 'κεχαριτωμένη',
        transliteration: 'kecharitōmenē',
        strongsRef: 'G5487',
        nuance: 'Perfect passive participle of charitoō: denoting one who has been completely transformed and endowed with divine grace in a settled, continuing state.'
      }
    ],
    suggestedQuestions: [
      'What is the grammatical significance of the perfect passive participle "kecharitōmenē" in Luke 1:28?',
      'How do Catholic, Orthodox, and Protestant views of Mary differ regarding her role and intercession?'
    ],
    practicalApplication: 'Adopt Mary’s posture of humble surrender today: "Behold the handmaid of the Lord; be it unto me according to thy word."'
  },
  '1corinthians_3_15': {
    passageRef: '1 Corinthians 3:15',
    conciseOverview: 'Paul on the eschatological testing of works: "If any man\'s work shall be burned, he shall suffer loss: but he himself shall be saved; yet so as by fire."',
    theologicalThemes: [
      'The Bema Seat Judgment of Believers’ Works',
      'Purgatory and Post-Mortem Purification (Catholic Dogma)',
      'The Difference Between Loss of Rewards and Loss of Salvation'
    ],
    historicalContext: 'Paul uses architectural metaphors (gold, silver, precious stones vs wood, hay, stubble) to describe the ministerial labor of church builders evaluated on the Day of the Lord.',
    lensPerspectives: {
      catholic: 'Cited in Catholic dogmatic theology (Council of Trent Sess. XXV; CCC §1030-1031) as scriptural evidence for Purgatory: the soul is saved, yet passes through a purifying fire that burns away the dross of venial sins and temporal punishment.',
      orthodox: 'Believes in the intermediate state of souls and the benefit of prayers for the departed, but rejects the medieval scholastic concept of a physical punitive purgatorial fire.',
      reformed: 'Refers to the testing of a minister’s doctrine and labor on the Judgment Day; the false teacher’s work is destroyed, but he is saved by grace alone ("as through fire" being an idiom for a narrow escape).',
      lutheran: 'Rejects Purgatory as contrary to the complete satisfaction of Christ on the cross; the fire represents God’s searching judgment evaluating earthly works.',
      wesleyan: 'A sobering reminder that only holy, Spirit-empowered works will survive the searching fire of God’s holiness on the Last Day.',
      anglican: 'Article XXII: "The Romish Doctrine concerning Purgatory... is a fond thing vainly invented, and grounded upon no warranty of Scripture."',
      baptist_evangelical: 'The Bema Judgment of Christ: believers cannot lose their salvation, but their works will be tested by fire, resulting in eternal rewards or loss of rewards.'
    },
    originalLanguageInsights: [
      {
        term: 'Saved So As By Fire',
        originalScript: 'σωθήσεται οὕτως δὲ ὡς διὰ πυρός',
        transliteration: 'sōthēsetai houtōs de hōs dia pyros',
        strongsRef: 'G4982 / G3779 / G5613 / G1223 / G4442',
        nuance: 'A vivid proverbial simile for narrowly escaping destruction, like a person snatched out of a burning house.'
      }
    ],
    suggestedQuestions: [
      'How does the Catholic interpretation of 1 Corinthians 3:15 regarding Purgatory differ from the Protestant interpretation of the Bema Seat judgment?',
      'What are the "gold, silver, and precious stones" versus "wood, hay, and stubble" in Paul’s context?'
    ],
    practicalApplication: 'Examine the motives and quality of your daily service for Christ. Build your life and ministry with materials that will endure for eternity.'
  },
  'hebrews_6_4': {
    passageRef: 'Hebrews 6:4',
    conciseOverview: 'The solemn warning on apostasy: "For it is impossible for those who were once enlightened, and have tasted of the heavenly gift, and were made partakers of the Holy Ghost, if they shall fall away, to renew them again unto repentance."',
    theologicalThemes: [
      'Apostasy and the Danger of Falling from Grace',
      'The Debate between Eternal Security and Conditional Preservation',
      'The Nature of "Once Enlightened" and "Partakers of the Holy Spirit"'
    ],
    historicalContext: 'Addressed to first-century Jewish Christians under intense persecution who were tempted to abandon Christ and return to the safety of Temple Judaism.',
    lensPerspectives: {
      catholic: 'Shows that those truly justified through baptism and the Holy Spirit can commit mortal sin, fall from grace, and perish unless reconciled through Penance.',
      orthodox: 'Salvation is an ongoing process of theosis; a believer can freely choose to reject grace and fall away into spiritual death.',
      reformed: 'The warning describes professors of religion who experienced the common, outward operations of the Spirit without inward regenerative election; true elect saints will never fall away (WCF 17).',
      lutheran: 'A real, terrifying warning against resisting the Holy Spirit; a true believer can lose faith and fall from grace through persistent unbelief.',
      wesleyan: 'Classic Arminian proof text (Wesley, Serious Thoughts on Perseverance): a genuinely regenerated, Spirit-filled believer may make shipwreck of faith and be eternally lost.',
      anglican: 'A serious pastoral warning in the lectionary calling all believers to constant vigilance, prayer, and perseverance.',
      baptist_evangelical: 'A hypothetical warning or a description of those on the threshold of faith who turn back; true born-again believers are eternally secure in Christ (John 10:28).'
    },
    originalLanguageInsights: [
      {
        term: 'Once Enlightened',
        originalScript: 'ἅπαξ φωτισθέντας',
        transliteration: 'hapax phōtisthentas',
        strongsRef: 'G530 / G5461',
        nuance: 'Hapax indicates a once-for-all decisive spiritual illumination (used in early Church for baptism).'
      },
      {
        term: 'Fall Away',
        originalScript: 'παραπεσόντας',
        transliteration: 'parapesontas',
        strongsRef: 'G3895',
        nuance: 'To fall aside, apostatize, or abandon the faith with full knowledge.'
      }
    ],
    suggestedQuestions: [
      'How do Calvinist (Reformed) and Arminian (Wesleyan) theologians interpret "partakers of the Holy Ghost" in Hebrews 6:4?',
      'Why does the author of Hebrews present such severe warnings to the Jewish Christian community?'
    ],
    practicalApplication: 'Never take God’s grace for granted. Press on in faith, prayer, and holiness, fixing your eyes firmly upon Jesus the author and finisher of your faith.'
  },
  'john_10_28': {
    passageRef: 'John 10:28',
    conciseOverview: 'Jesus makes the ultimate promise of security: "And I give unto them eternal life; and they shall never perish, neither shall any man pluck them out of my hand."',
    theologicalThemes: [
      'The Unbreakable Grip of the Good Shepherd',
      'The Doctrine of Eternal Security (Perseverance of the Saints)',
      'Double Hand Protection of the Father and the Son (v. 29)'
    ],
    historicalContext: 'Spoken during the Feast of Dedication (Hanukkah) in Solomon’s Colonnade at the Jerusalem Temple, contrasting the Good Shepherd with false religious hirelings.',
    lensPerspectives: {
      catholic: 'Christ’s hand is all-powerful and no external enemy can snatch the believer, yet human free will remains capable of mortal sin and self-destruction through apostasy (CCC §1855).',
      orthodox: 'God never abandons the soul, but does not violate human free choice; security is found in continual synergistic communion with Christ.',
      reformed: 'The sovereign guarantee of Perseverance of the Saints (WCF 17; Dort V): the elect are eternally secure in the immutable decree of the Father and the omnipotent grip of Christ.',
      lutheran: 'A comforting Gospel promise to faith; while no devil or man can pluck us from Christ, a believer must abide in the Word and beware of falling away into unbelief.',
      wesleyan: 'No external devil can pluck a believer from Christ’s hand, but a believer can freely choose to leap out of His hand through willful rebellion.',
      anglican: 'A beloved pastoral assurance in the BCP burial office and daily prayer, resting in Christ’s promise of everlasting life.',
      baptist_evangelical: 'The foundational verse for "Once Saved, Always Saved" (Eternal Security - BF&M Art. V): eternal life cannot be temporary; the believer is permanently sealed and safe in Christ.'
    },
    originalLanguageInsights: [
      {
        term: 'Never Perish',
        originalScript: 'οὐ μὴ ἀπόλωνται εἰς τὸν αἰῶνα',
        transliteration: 'ou mē apolōntai eis ton aiōna',
        strongsRef: 'G3756 / G3361 / G622 / G165',
        nuance: 'Double negative (ou mē) with aorist subjunctive: the strongest Greek construction expressing absolute, perpetual impossibility.'
      },
      {
        term: 'Pluck / Snatch',
        originalScript: 'ἁρπάσει',
        transliteration: 'harpasei',
        strongsRef: 'G726',
        nuance: 'To seize, overpower, or violently tear away by force.'
      }
    ],
    suggestedQuestions: [
      'What is the significance of the double negative "ou mē" in John 10:28?',
      'How do Reformed and Wesleyan theologians interpret "no one shall snatch them out of my hand"?'
    ],
    practicalApplication: 'Rest in the unshakeable peace that your soul is held securely in the hands of the Good Shepherd and the Almighty Father.'
  },
  'matthew_26_26': {
    passageRef: 'Matthew 26:26',
    conciseOverview: 'The Words of Eucharistic Institution: "And as they were eating, Jesus took bread, and blessed it, and brake it, and gave it to the disciples, and said, Take, eat; this is my body."',
    theologicalThemes: [
      'The Words of Institution ("Hoc Est Corpus Meum")',
      'The Real Presence vs Transubstantiation vs Memorial Symbolism',
      'The Inauguration of the New Covenant'
    ],
    historicalContext: 'The Last Supper, a Passover Seder meal in the Upper Room on the eve of the Crucifixion. Jesus transforms the ancient Passover bread into His own sacrificial body.',
    lensPerspectives: {
      catholic: 'By the words of consecration spoken by the priest ("This is my body"), Transubstantiation occurs: the bread ceases to be bread and becomes the substantial Body of Christ (Council of Trent Sess. XIII).',
      orthodox: 'The Mystical Transformation: the bread becomes the actual Body of Christ through the prayer of the Church and the descent of the Holy Spirit (Epiclesis).',
      reformed: 'The bread is a sacramental sign and seal; Christ’s body is locally in heaven, but believers spiritually feed upon Him by faith through the Holy Spirit (Calvin, WCF 29).',
      lutheran: 'The literal words stand ("Est" means IS): Christ’s true bodily flesh is physically present "in, with, and under" the bread (Augsburg Art. X; Luther at Marburg: "Hoc est corpus meum").',
      wesleyan: 'A holy sacrament where Christ communicates the living virtue and transforming grace of His sacrifice to the worthy receiver.',
      anglican: 'Article XXVIII: The bread broken is a partaking of the Body of Christ, received and eaten in a heavenly and spiritual manner through Faith.',
      baptist_evangelical: 'A symbolic memorial ordinance: "This represents my body"; Jesus spoke figuratively just as when He said "I am the door" or "I am the vine" (BF&M Art. VII).'
    },
    originalLanguageInsights: [
      {
        term: 'This Is My Body',
        originalScript: 'Τοῦτό ἐστιν τὸ σῶμά μου',
        transliteration: 'Touto estin to sōma mou',
        strongsRef: 'G5124 / G1510 / G4983',
        nuance: 'The copula "estin" (is) is the epicenter of the historic Eucharistic debate at the Marburg Colloquy (1529).'
      }
    ],
    suggestedQuestions: [
      'What was the debate between Martin Luther and Ulrich Zwingli over the word "estin" (is) at the Marburg Colloquy?',
      'How does the Passover Seder background illuminate Jesus’ institution of the Lord’s Supper?'
    ],
    practicalApplication: 'Come to the Lord’s Table with profound awe and repentance, receiving Christ’s redeeming love.'
  }
};

/**
 * Capitalizes book name properly (e.g. "1john" -> "1 John", "john" -> "John")
 */
function formatBookDisplayName(raw: string): string {
  const clean = raw.toLowerCase().trim();
  if (clean.startsWith('1')) return `1 ${clean.slice(1).charAt(0).toUpperCase() + clean.slice(2)}`;
  if (clean.startsWith('2')) return `2 ${clean.slice(1).charAt(0).toUpperCase() + clean.slice(2)}`;
  if (clean.startsWith('3')) return `3 ${clean.slice(1).charAt(0).toUpperCase() + clean.slice(2)}`;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Intelligent, dynamic theological insight resolver for ANY verse clicked in Scripture.
 * Uses a Canonical & Thematic Theological Loci Classifier to provide deep confessional
 * perspectives and authentic Greek/Hebrew lemmas for ANY passage.
 */
export function getTheologicalInsight(
  bookId: string,
  chapter: number,
  verseNum?: number,
  verseText?: string,
  verseLemmas?: { word: string; transliteration: string; strongs?: string; definition?: string }[]
): TheologicalInsight {
  const normBook = bookId.toLowerCase().trim();
  const vNum = verseNum || 1;
  const exactKey = `${normBook}_${chapter}_${vNum}`;

  // 1. Direct exact key match for curated flagship verses
  if (THEOLOGICAL_INSIGHTS[exactKey]) {
    return THEOLOGICAL_INSIGHTS[exactKey];
  }

  // 2. Canonical & Thematic Theological Loci Classifier
  const cleanBookName = formatBookDisplayName(normBook);
  const cleanPassageRef = `${cleanBookName} ${chapter}:${vNum}`;
  const lowerText = (verseText || '').toLowerCase();
  const snippet = verseText ? `"${verseText.slice(0, 120)}${verseText.length > 120 ? '...' : ''}"` : `this passage`;

  // Detect specific contentious theological loci
  const isElijahForerunnerLocus = (normBook === 'matthew' && chapter === 17 && vNum >= 10 && vNum <= 13) ||
    (normBook === 'mark' && chapter === 9 && vNum >= 11 && vNum <= 13) ||
    (normBook === 'malachi' && (chapter === 3 || chapter === 4)) ||
    lowerText.includes('elijah must come') || lowerText.includes('elias must first') || lowerText.includes('elijah has already come');
  const isPapacyLocus = (normBook === 'matthew' && chapter === 16) || (normBook === 'john' && chapter === 21 && vNum >= 15) || lowerText.includes('keys of heaven') || lowerText.includes('rock i will build');
  const isJustificationLocus = (normBook === 'james' && chapter === 2) || (normBook === 'romans' && (chapter === 3 || chapter === 4 || chapter === 5)) || (normBook === 'galatians' && chapter === 2) || lowerText.includes('justifi') || lowerText.includes('faith alone') || lowerText.includes('impute');
  const isPredestinationLocus = (normBook === 'romans' && (chapter === 8 || chapter === 9)) || (normBook === 'ephesians' && chapter === 1) || (normBook === '1timothy' && chapter === 2 && vNum === 4) || lowerText.includes('predestin') || lowerText.includes('elect') || lowerText.includes('foreknew') || lowerText.includes('mercy on whom');
  const isBaptismLocus = (normBook === 'acts' && chapter === 2 && vNum >= 38) || (normBook === '1peter' && chapter === 3 && vNum >= 20) || (normBook === 'titus' && chapter === 3 && vNum === 5) || lowerText.includes('baptiz') || lowerText.includes('baptism') || lowerText.includes('born of water');
  const isEucharistLocus = (normBook === 'john' && chapter === 6) || (normBook === '1corinthians' && (chapter === 10 || chapter === 11)) || (normBook === 'matthew' && chapter === 26 && vNum >= 26) || lowerText.includes('this is my body') || lowerText.includes('true food') || lowerText.includes('flesh is') || lowerText.includes('blood of the');
  const isTraditionLocus = (normBook === '2thessalonians' && chapter === 2) || (normBook === '1timothy' && chapter === 3 && vNum === 15) || (normBook === '2timothy' && chapter === 3 && vNum >= 15) || lowerText.includes('tradition') || lowerText.includes('pillar and ground');
  const isSecurityLocus = (normBook === 'hebrews' && (chapter === 6 || chapter === 10)) || (normBook === 'john' && chapter === 10 && vNum >= 27) || lowerText.includes('fall away') || lowerText.includes('pluck them out') || lowerText.includes('never perish');
  const isMariologyLocus = (normBook === 'luke' && chapter === 1 && (vNum === 28 || vNum === 42 || vNum === 48)) || lowerText.includes('full of grace') || lowerText.includes('blessed art thou among');
  const isSpiritualWarfareLocus = (normBook === 'matthew' && chapter === 17 && vNum >= 14 && vNum <= 21) ||
    (normBook === 'mark' && chapter === 9 && vNum >= 14 && vNum <= 29) ||
    (normBook === 'ephesians' && chapter === 6 && vNum >= 10 && vNum <= 18) ||
    lowerText.includes('prayer and fasting') || lowerText.includes('fasting') || lowerText.includes('cast out') || lowerText.includes('demon') || lowerText.includes('devils') || lowerText.includes('unclean spirit') || lowerText.includes('goeth not out');
  const isPassionPredictionLocus =
    (normBook === 'matthew' && ((chapter === 17 && vNum >= 22 && vNum <= 23) || (chapter === 16 && vNum >= 21 && vNum <= 23) || (chapter === 20 && vNum >= 17 && vNum <= 19))) ||
    (normBook === 'mark' && ((chapter === 9 && vNum >= 30 && vNum <= 32) || (chapter === 8 && vNum >= 31 && vNum <= 33) || (chapter === 10 && vNum >= 32 && vNum <= 34))) ||
    (normBook === 'luke' && ((chapter === 9 && vNum >= 43 && vNum <= 45) || (chapter === 9 && vNum === 22) || (chapter === 18 && vNum >= 31 && vNum <= 34))) ||
    lowerText.includes('handed over to men') || lowerText.includes('delivered into the hands of men') ||
    lowerText.includes('son of man is to be handed over') || lowerText.includes('kill him, and on the third day') ||
    lowerText.includes('killed, and after three days rise');
  const isDiscipleshipRewardLocus =
    (normBook === 'matthew' && chapter === 19 && vNum >= 16 && vNum <= 30) ||
    (normBook === 'mark' && chapter === 10 && vNum >= 17 && vNum <= 31) ||
    (normBook === 'luke' && chapter === 18 && vNum >= 18 && vNum <= 30) ||
    lowerText.includes('given up everything') || lowerText.includes('left everything and followed') ||
    lowerText.includes('what will there be for us') || lowerText.includes('hundredfold') ||
    lowerText.includes('renewal of all things') || lowerText.includes('first will be last');

  // Topic-Aware Dynamic Resolution
  if (isDiscipleshipRewardLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `Following the departure of the rich young ruler who prioritized wealth over the kingdom, Peter asks what reward awaits the disciples who left everything to follow Jesus (${snippet}). Christ responds by affirming the eternal value of sacrificial discipleship, promising the cosmic renewal (*palingenesia*), apostolic authority, and a hundredfold reward in this life and the next.`,
      theologicalThemes: [
        'Cost of Discipleship & Radical Renunciation',
        'The Cosmic Renewal (Palingenesia) & Twelve Thrones',
        'Rewards of Grace vs Legalistic Merit',
        'First and Last: Reversal of Earthly Hierarchies'
      ],
      historicalContext: `In Second Temple Judaism, material prosperity was widely regarded by scribes and Pharisees as an infallible sign of divine favor. Jesus reverses this conventional wisdom after the rich young ruler departs in sorrow (Matt 19:16–26), prompting Peter’s candid apostolic query regarding what lies ahead for those who literally abandoned home, family, and livelihood for the Messianic mission.`,
      lensPerspectives: {
        catholic: `Root of the Evangelical Counsels (poverty, chastity, and obedience; CCC §914–915, §2544–2547): voluntary renunciation of earthly possessions for Christ’s sake participates in evangelical perfection, receiving a heavenly recompense and crown of glory through grace.`,
        reformed: `Affirms that while no work can merit salvation (WCF 16.5–6), God graciously and freely rewards the sacrificial obedience of His saints out of covenantal fatherly love, ensuring that no cross borne for Christ goes unrewarded.`,
        lutheran: `Distinguishes the Law from the Gospel promises: true discipleship is the fruit of faith clinging to Christ alone. The reward promised to Peter is not a wage won by human righteousness, but the gift of eternal life and heavenly fellowship with the King.`,
        orthodox: `Understands total detachment and ascetic renunciation as the royal path to theosis (deification). Those who empty themselves of earthly attachments are filled with uncreated grace and will judge the twelve tribes of Israel in the cosmic resurrection and restoration.`,
        wesleyan: `A summons to entire devotion and Christian perfection in love. St. Peter’s sacrifice reminds believers to surrender all idolized securities so that God’s holy love may reign supremely in the heart.`,
        anglican: `Reflects upon the vocation of self-denial and stewardship in the following of Christ, honoring the apostolic witness and trusting God's generous providence in both this present life and the world to come.`,
        baptist_evangelical: `Underscores personal surrender and radical discipleship: leaving earthly idols to follow Jesus Christ brings incomparable joy, eternal life, and true heavenly treasure far exceeding whatever was surrendered.`
      },
      originalLanguageInsights: [
        {
          term: 'Left / Forsaken Everything',
          originalScript: 'ἀφήκαμεν πάντα',
          transliteration: 'aphēkamen panta',
          strongsRef: 'G863 / G3956',
          nuance: 'Aorist active verb indicating a decisive, comprehensive abandonment of livelihood, nets, and family security to cling wholly to Jesus.'
        },
        {
          term: 'Renewal / Regeneration',
          originalScript: 'παλιγγενεσίᾳ',
          transliteration: 'palingenesia',
          strongsRef: 'G3824',
          nuance: 'New birth, restoration, or cosmic renewal. Refers here to the messianic restoration of the cosmos and the establishment of the kingdom in power.'
        },
        {
          term: 'Hundredfold',
          originalScript: 'ἑκατονταπλασίονα',
          transliteration: 'hekatontaplasiona',
          strongsRef: 'G1542',
          nuance: 'Immense superabundance—demonstrating that whatever is given up for the Lord is multiplied beyond measure by divine grace.'
        }
      ],
      suggestedQuestions: [
        `How does Peter's question in ${cleanPassageRef} reflect human anxiety about sacrifice, and how does Jesus tenderly correct and reorient it?`,
        `What is the theological significance of the word palingenesia ("renewal of all things") for Christian hope and the resurrection?`,
        `How does the promise of a "hundredfold reward" distinguish divine generosity from worldly transactional merit?`
      ],
      practicalApplication: `Examine what earthly attachments, securities, or ambitions you may be clinging to that hinder your wholehearted walk with Jesus Christ. Lay them down at His feet, trusting His abundant promise.`
    };
  }

  if (isElijahForerunnerLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `Following the Transfiguration, the disciples question the scribal consensus on Malachi 4:5–6 regarding the return of Elijah before the Messiah. Jesus reveals that the prophecy was fulfilled typologically in John the Baptist, whose rejection and death foreshadow the Son of Man’s own suffering.`,
      theologicalThemes: [
        'Prophetic Fulfillment & The Forerunner (Malachi 4:5–6)',
        'Typological Fulfillment in John the Baptist',
        'The Suffering Servant & The Transfigured Christ'
      ],
      historicalContext: `Descending Mount Hermon immediately after witnessing the Transfiguration (Matt 17:1–9), Peter, James, and John struggle with scribal apocalyptic expectations. Scribes taught that Elijah would literally reappear before the Day of the Lord to restore Israel.`,
      lensPerspectives: {
        catholic: `Teaches the harmony of Old and New Testaments through biblical typology (CCC §523, §718): John the Baptist precedes Christ "in the spirit and power of Elijah," inaugurating the Messianic advent and prefiguring the sacrificial Passion of the Lord.`,
        orthodox: `Celebrates the prophetic continuity of the Forerunner (Prodromos), who bridged the prophetic era and the mystery of the Theophany, bearing witness that the Messiah must enter His glory through suffering.`,
        reformed: `Exemplifies covenantal unity and Christocentric fulfillment of redemptive history: Old Testament prophecies find their true substance in Christ and His forerunner rather than in earthly political restoration (WCF 7–8).`,
        lutheran: `Distinguishes the Theology of the Cross from a theology of glory: as John the Baptist suffered execution under Herod, so the Son of Man must suffer at the hands of men; God's Kingdom advances through suffering rather than human acclaim.`,
        wesleyan: `Focuses on the heart-turning ministry of repentance prefigured by Elijah and preached by John, preparing souls to receive the sanctifying grace of Christ through genuine faith.`,
        anglican: `Reflects on the prophetic preparation of the way of the Lord through repentance and baptism, seeing John the Baptist as the great bridge between the Old and New Covenants.`,
        baptist_evangelical: `Affirms the literal fulfillment of God's Word: Jesus directly confirms that John the Baptist came in the prophetic spirit of Elijah to call individuals to personal repentance in preparation for the Savior.`
      },
      originalLanguageInsights: [
        { term: 'Elijah', originalScript: 'Ἠλίας', transliteration: 'Ēlias', strongsRef: 'G2243', nuance: 'The Hebrew prophet Elijah, whose return as forerunner was prophesied in Malachi 4:5.' },
        { term: 'Scribes', originalScript: 'γραμματεῖς', transliteration: 'grammateis', strongsRef: 'G1122', nuance: 'Torah scholars and official interpreters of the law in Second Temple Judaism.' },
        { term: 'Must / Necessary', originalScript: 'δεῖ', transliteration: 'dei', strongsRef: 'G1163', nuance: 'Divine theological necessity according to God’s sovereign redemptive decree.' }
      ],
      suggestedQuestions: [
        `Why did seeing Elijah at the Transfiguration (Matt 17:3) trigger the disciples' question about scribal teaching in ${cleanPassageRef}?`,
        `How does Jesus' identification of John the Baptist as the fulfillment of Malachi 4:5 reshape our understanding of Old Testament prophecy?`,
        `What is the theological connection between the suffering of John the Baptist and the impending suffering of the Son of Man (Matt 17:12)?`
      ],
      practicalApplication: `Recognize that God frequently fulfills His divine promises in unexpected spiritual ways and through sacrificial faithfulness, rather than earthly comfort or political triumph.`
    };
  }

  if (isSpiritualWarfareLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `Jesus addresses the disciples' inability to cast out a persistent demonic affliction, establishing that overcoming severe spiritual oppression requires genuine faith, deep prayer, and self-denying fasting rather than casual self-reliance (${snippet}).`,
      theologicalThemes: [
        'Spiritual Warfare & Christ’s Authority Over Evil',
        'Prayer & Fasting as Vital Spiritual Disciplines',
        'The Power of Living Faith vs. Human Self-Sufficiency'
      ],
      historicalContext: `Following the Transfiguration, Jesus descends the mountain to find His disciples publicly confounded by an aggressive demonic affliction in an epileptic boy. In first-century Second Temple Judaism, exorcisms often involved ritual incantations; Christ reveals that genuine spiritual authority flows from living communion with the Father through prayer and self-denial.`,
      lensPerspectives: {
        catholic: `Teaches that prayer and fasting are essential penitential disciplines (CCC §1434, §2043) that purify the soul, strengthen believers against demonic temptation, and unite suffering with Christ.`,
        orthodox: `Emphasizes the ascetic struggle (podvig) against demonic passions, viewing prayer and fasting as the two wings of the soul in spiritual combat as taught by the Desert Fathers and Philokalia.`,
        reformed: `Affirms that all authority over demonic forces belongs solely to Jesus Christ; prayer and fasting are solemn duties of humiliation under trial (WCF 21.5), demonstrating total reliance on sovereign grace.`,
        lutheran: `Distinguishes the Law's demand from living faith in the Gospel: bodily fasting is a wholesome Christian discipline, while spiritual victory is won solely through Christ’s Word and promises.`,
        wesleyan: `Views fasting and prayer as instituted means of grace that subdue the flesh, heighten spiritual sensitivity, and foster wholehearted sanctification and reliance on the Spirit.`,
        anglican: `Maintains prayer and fasting within the liturgical calendar (e.g. Lent, Ember Days) as biblical habits of spiritual self-examination, penitence, and divine petition.`,
        baptist_evangelical: `Emphasizes fervent personal prayer and fasting as an expression of spiritual dependence, trusting in the power of the Holy Spirit to shatter spiritual bondages.`
      },
      originalLanguageInsights: [
        { term: 'Prayer', originalScript: 'προσευχή', transliteration: 'proseuchē', strongsRef: 'G4335', nuance: 'Earnest, reverent communion and petition addressed specifically to the living God.' },
        { term: 'Fasting', originalScript: 'νηστεία', transliteration: 'nēsteia', strongsRef: 'G3521', nuance: 'Voluntary abstinence from food to seek God’s presence, humble oneself, and focus spiritual desire.' }
      ],
      suggestedQuestions: [
        `Why did the disciples fail to heal the boy despite having previously cast out demons (Matt 17:19–20)?`,
        `How do prayer and fasting deepen our reliance on God rather than serving as legalistic merit?`,
        `What areas of spiritual stagnation in our lives require intentional prayer and self-denial today?`
      ],
      practicalApplication: `Set aside intentional time this week to fast and pray over spiritual obstacles, placing total reliance upon Christ rather than your own strength.`
    };
  }

  if (isPassionPredictionLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `Jesus explicitly foretells His impending betrayal, death, and third-day resurrection (${snippet}). The divine title "Son of Man" unites Daniel 7’s apocalyptic heavenly ruler with Isaiah 53’s Suffering Servant, establishing that redemptive glory is achieved only through sacrificial suffering and obedient self-giving.`,
      theologicalThemes: [
        'The Passion of Christ & Sovereign Divine Plan (Dei)',
        'The Son of Man Handed Over (Traditio)',
        'The Bodily Resurrection on the Third Day'
      ],
      historicalContext: `Gathering privately in Galilee before the journey toward Jerusalem, Jesus delivers the second passion prediction to instruct the Twelve on His approaching crucifixion. The disciples are deeply grieved because prevailing Second Temple messianic expectations anticipated an invincible political conqueror, unable to conceive of the Messiah executed at human hands.`,
      lensPerspectives: {
        catholic: `Proclaims the mystery of Christ’s voluntary Redemptive Passion and Resurrection (CCC §599–618): Christ freely offered Himself according to the Father’s eternal plan of salvation; His delivery into the hands of sinners achieves our redemption and justification.`,
        orthodox: `Contemplates the holy kenosis (self-emptying) and voluntary Passion of Christ, who enters Hades and destroys death by His glorious third-day Resurrection.`,
        reformed: `Highlights the covenantal necessity of Christ’s penal substitution as the sole Mediator (WCF 8.4–5): God did not spare His own Son, but handed Him over for our redemption according to eternal decree.`,
        lutheran: `The supreme expression of the Theology of the Cross (Crux sola est nostra theologia): God reveals His righteousness not in human glory or power, but in Christ handed over to death for our justification.`,
        wesleyan: `Proclaims universal redemption through the sacrificial death and victory of Jesus Christ, calling every believer to embrace the fellowship of His sufferings.`,
        anglican: `Celebrates Christ’s full, perfect, and sufficient sacrifice for the sins of the whole world, commemorated centrally in the Holy Eucharist and the Creeds.`,
        baptist_evangelical: `Anchors faith in the literal, substitutionary death and bodily resurrection of Jesus Christ as the immovable foundation of the Gospel (1 Cor 15:3–4).`
      },
      originalLanguageInsights: [
        { term: 'Handed Over / Delivered', originalScript: 'παραδίδωμι', transliteration: 'paradidōmi', strongsRef: 'G3860', nuance: 'To deliver up or hand over into the custody of another—the theological term for God handing over His Son and Judas delivering Christ to the authorities.' },
        { term: 'Son of Man', originalScript: 'υἱὸς τοῦ ἀνθρώπου', transliteration: 'huios tou anthrōpou', strongsRef: 'G5207 / G444', nuance: 'Christ\'s primary self-designation, drawing on Daniel 7:13 to declare His messianic identity and heavenly authority.' }
      ],
      suggestedQuestions: [
        `Why were the disciples filled with deep distress when Jesus announced His death and resurrection (Matt 17:23)?`,
        `How does the biblical term "handed over" (paradidōmi) connect human treachery with God's sovereign redemptive plan (Acts 2:23)?`,
        `What does Christ's willing surrender teach us about the cost and nature of Christian discipleship today?`
      ],
      practicalApplication: `Surrender your own desire for control and earthly acclaim to Jesus Christ, trusting that God brings resurrection life out of apparent defeat and suffering.`
    };
  }

  if (isPapacyLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `A crucial ecclesiological passage on apostolic authority, the foundation of the Church, and the keys of the kingdom (${snippet}).`,
      theologicalThemes: ['Petrine Primacy vs Conciliarity', 'The Authority of the Keys (Claves Regni)', 'The Indefectibility of the Church'],
      historicalContext: `Addressed by Christ in the apostolic era to establish the order, governance, and doctrinal fidelity of His Church against the gates of hell.`,
      lensPerspectives: {
        catholic: `Confesses that Christ instituted Peter and his Roman successors with supreme jurisdictional primacy and the keys of the kingdom (CCC §881-882).`,
        orthodox: `Views the foundation as Peter’s orthodox confession of faith, shared collegially by all bishops in Holy Synod without autocratic supremacy.`,
        reformed: `Affirms Jesus Christ as the sole Rock and Head of the Church (1 Cor 3:11); the keys represent Gospel preaching and church discipline.`,
        lutheran: `Rejects the papacy as a human usurpation (Smalcald Articles); the Church is founded on Christ and the Gospel Word.`,
        wesleyan: `Focuses on the living power of the Holy Spirit leading the Church to overcome the powers of darkness.`,
        anglican: `Maintains historic episcopacy while rejecting universal papal jurisdiction; the Church is governed by conciliar creeds.`,
        baptist_evangelical: `Every local church is autonomous under the direct headship of Jesus Christ, built upon living faith in the Son of God.`
      },
      originalLanguageInsights: [
        { term: 'Peter / Rock', originalScript: 'Πέτρος / πέτρα', transliteration: 'Petros / Petra', strongsRef: 'G4074 / G4073', nuance: 'The classic linguistic distinction between the stone and the rock cliff.' },
        { term: 'Keys', originalScript: 'κλεῖδες', transliteration: 'kleides', strongsRef: 'G2807', nuance: 'Apostolic authority of binding and loosing.' }
      ],
      suggestedQuestions: [
        `How do Catholic and Protestant traditions interpret the authority given in ${cleanPassageRef}?`,
        `What does ${cleanPassageRef} teach about the endurance of the Church?`
      ],
      practicalApplication: `Anchor your faith in Jesus Christ, the true cornerstone who holds all authority in heaven and on earth.`
    };
  }

  if (isJustificationLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `A foundational passage on justification, faith, grace, and good works in the Christian life (${snippet}).`,
      theologicalThemes: ['Justification by Faith (Sola Fide)', 'The Role of Good Works in Salvation', 'Forensic Imputation vs Interior Renewal'],
      historicalContext: `Pauline and apostolic epistles defending the purity of the Gospel of grace against both legalistic moralism and antinomian license.`,
      lensPerspectives: {
        catholic: `Teaches that justification is not by faith alone, but faith working through love (Gal 5:6); good works truly preserve and increase grace (James 2:24, Trent Sess. VI).`,
        orthodox: `Salvation is synergistic: faith and good works cooperate in the lifelong process of theosis (deification).`,
        reformed: `Justification is forensic and received through faith alone (Sola Fide), yet genuine saving faith is never alone but always produces good works (WCF 11).`,
        lutheran: `The core article of faith: we are justified freely as a gift through faith in Christ alone, completely apart from human works (Augsburg Art. IV).`,
        wesleyan: `Justification by faith alone pardons past sins, followed immediately by sanctification and holy love working in the soul.`,
        anglican: `Article XI: Accounted righteous before God only for the merit of Christ by Faith; good works spring necessarily from lively faith.`,
        baptist_evangelical: `Salvation is completely by grace through personal faith in Jesus; works are the fruit and evidence of new birth (Eph 2:8-10).`
      },
      originalLanguageInsights: [
        { term: 'Justify / Declare Righteous', originalScript: 'δικαιόω', transliteration: 'dikaioō', strongsRef: 'G1344', nuance: 'To declare righteous, acquit, or vindicate in the divine courtroom.' },
        { term: 'Faith', originalScript: 'πίστις', transliteration: 'pistis', strongsRef: 'G4102', nuance: 'Living trust, confidence, and allegiance to Christ.' }
      ],
      suggestedQuestions: [
        `How do the 7 confessional traditions understand the relationship between faith and works in ${cleanPassageRef}?`,
        `How does ${cleanPassageRef} comfort the troubled conscience?`
      ],
      practicalApplication: `Rest completely in Christ’s grace, and let your gratitude overflow in daily works of compassion and love.`
    };
  }

  if (isPredestinationLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `A profound revelation of God's eternal purposes, divine sovereignty, foreknowledge, and the mystery of election (${snippet}).`,
      theologicalThemes: ['Sovereign Election & Divine Decrees', 'Prevenient Grace vs Irresistible Grace', 'Universal Salvific Will vs Particular Redemption'],
      historicalContext: `Authored to unveil the majestic eternal plan of God who works all things after the counsel of His own will across redemptive history.`,
      lensPerspectives: {
        catholic: `God's predestination is sovereign and encompasses human free will; God desires all men to be saved while bestowing efficacious grace (CCC §600).`,
        orthodox: `God foreknows all things from eternity without imposing fatalistic necessity upon human free choice.`,
        reformed: `Confesses Unconditional Election (Canons of Dort / WCF 3): God eternally chose the elect solely according to His sovereign good pleasure.`,
        lutheran: `Election is to be contemplated exclusively in Christ the Redeemer, confessing God's universal desire to save all who hear the Gospel (Formula of Concord XI).`,
        wesleyan: `God’s grace is free for all; election is conditioned upon living faith in Christ enabled by universal prevenient grace (Wesley, Free Grace).`,
        anglican: `Article XVII: Predestination to life in Christ is full of sweet, pleasant, and unspeakable comfort to godly persons.`,
        baptist_evangelical: `Affirms God’s sovereign purpose of grace that regenerates and saves, in harmony with human responsibility to repent.`
      },
      originalLanguageInsights: [
        { term: 'Predestine / Foreordain', originalScript: 'προορίζω', transliteration: 'proorizō', strongsRef: 'G4309', nuance: 'To determine, decree, or mark out boundaries beforehand in eternity.' },
        { term: 'Foreknowledge', originalScript: 'πρόγνωσις', transliteration: 'prognōsis', strongsRef: 'G4268', nuance: 'Intimate pre-eternal divine knowledge and covenant love.' }
      ],
      suggestedQuestions: [
        `How does ${cleanPassageRef} address God’s eternal sovereignty and human choice?`,
        `What comfort does the doctrine of God’s eternal plan provide to believers?`
      ],
      practicalApplication: `Praise God for His unsearchable wisdom and rest in the assurance that His eternal love will never fail you.`
    };
  }

  if (isBaptismLocus) {
    return {
      passageRef: cleanPassageRef,
      conciseOverview: `An essential sacramental passage on the meaning, efficacy, and role of baptism in the life of the covenant community (${snippet}).`,
      theologicalThemes: ['Sacramental Regeneration vs Memorial Ordinance', 'The Washing Away of Sins in Christ', 'Infant Baptism (Paedobaptism) vs Believer’s Baptism (Credobaptism)'],
      historicalContext: `The apostolic establishment of Christian baptism as the inaugural covenant sign connecting the believer to Christ's death and resurrection.`,
      lensPerspectives: {
        catholic: `Baptism is the sacrament of regeneration that washes away original and actual sin and infuses sanctifying grace (CCC §1213).`,
        orthodox: `The Holy Mystery of Illumination: true spiritual rebirth, cleansing, and chrismation with the seal of the Holy Spirit.`,
        reformed: `A sacrament of the Covenant of Grace, sealing redemption to believers and their children as circumcision did in the Old Covenant (WCF 28).`,
        lutheran: `Baptism is necessary to salvation because it offers God’s saving grace and is commanded by Christ for both adults and infants (Augsburg Art. IX).`,
        wesleyan: 'A primary means of grace where God initiates the soul into the covenant of salvation.',
        anglican: `Article XXVII: A sign of Regeneration and instrument through which promises of forgiveness are visibly signed and sealed.`,
        baptist_evangelical: `Believer’s Baptism by immersion is a symbolic ordinance of obedience testifying to prior salvation, not a means of regeneration (BF&M Art. VII).`
      },
      originalLanguageInsights: [
        { term: 'Baptism', originalScript: 'βάπτισμα', transliteration: 'baptisma', strongsRef: 'G908', nuance: 'Immersion, washing, or ritual cleansing in water.' }
      ],
      suggestedQuestions: [
        `How do sacramental (Catholic/Lutheran) and memorial (Baptist) traditions differ on ${cleanPassageRef}?`
      ],
      practicalApplication: `Rejoice in your new identity in Christ, having been buried and raised with Him to walk in newness of life.`
    };
  }

  // 3. General Fallback with Contextual Canonical Wisdom
  // STRICT ZERO-HALLUCINATION POLICY: If no verified lemmas exist for this specific verse,
  // do NOT invent fake Greek/Hebrew terms or arbitrary Strong's numbers. Return empty array.
  const lemmas = (verseLemmas && verseLemmas.length > 0)
    ? verseLemmas.slice(0, 3).map(l => ({
      term: l.word,
      originalScript: l.word,
      transliteration: l.transliteration || l.word,
      strongsRef: l.strongs || '',
      nuance: l.definition || `Key linguistic root in ${cleanPassageRef} illuminating divine meaning.`
    }))
    : [];

  // Dynamic Theme Extraction directly from the actual text of the verse
  const extractedThemes: string[] = [];
  if (/pray|prayer|petition|intercession|supplication|crying/i.test(lowerText)) {
    extractedThemes.push('Prayer & Fervent Communion with God');
  }
  if (/faith|believe|trust|believ/i.test(lowerText)) {
    extractedThemes.push('Living Faith & Trust in God’s Promises');
  }
  if (/grace|merc|compassion|steadfast love|hesed|kindness/i.test(lowerText)) {
    extractedThemes.push('The Sovereignty of Divine Grace & Mercy');
  }
  if (/consecrat|living sacrifice|reasonable service|holy|holiness|sanctif/i.test(lowerText)) {
    extractedThemes.push('Consecration, Holiness & Spiritual Worship');
  }
  if (/love|charity|agape|commandment/i.test(lowerText)) {
    extractedThemes.push('The Call to Love God and Neighbor');
  }
  if (/righteous|justice|judgment|law|statute/i.test(lowerText)) {
    extractedThemes.push('God’s Holy Righteousness & Moral Law');
  }
  if (/sin|repent|iniquity|forgive|pardon|cleanse|confess/i.test(lowerText)) {
    extractedThemes.push('Repentance, Cleansing & Remission of Sins');
  }
  if (/peace|rest|comfort|hope|refuge|shield/i.test(lowerText)) {
    extractedThemes.push('Divine Peace & Eternal Hope in Christ');
  }
  if (/kingdom|king|reign|throne|dominion|glory|exalt/i.test(lowerText)) {
    extractedThemes.push('The Sovereign Kingdom & Reign of God');
  }
  if (/spirit|holy ghost|anoint|wisdom|understand/i.test(lowerText)) {
    extractedThemes.push('The Indwelling Power & Wisdom of the Holy Spirit');
  }
  if (/suffer|cross|crucif|slain|aton/i.test(lowerText) || (lowerText.includes('sacrifice') && !lowerText.includes('living sacrifice'))) {
    extractedThemes.push('The Atoning Sacrifice & Theology of the Cross');
  }
  if (/resurrection|alive|raised|life|eternal|immortal/i.test(lowerText)) {
    extractedThemes.push('The Resurrection Hope & Eternal Life');
  }

  // Ensure 2-3 specific, relevant themes are always present
  if (extractedThemes.length === 0) {
    if (['psalms', 'proverbs', 'ecclesiastes', 'job'].includes(normBook)) {
      extractedThemes.push('Wisdom for Holy Living', 'Praise & Reverence in the Fear of the Lord');
    } else if (['matthew', 'mark', 'luke', 'john'].includes(normBook)) {
      extractedThemes.push('Gospel Proclamation of the Kingdom', 'Discipleship & Following Christ');
    } else if (normBook.includes('romans') || normBook.includes('corinthians') || normBook.includes('galatians') || normBook.includes('ephesians')) {
      extractedThemes.push('Apostolic Doctrine & Church Maturity', 'Walking in Step with the Gospel');
    } else {
      extractedThemes.push('Covenant Fidelity to the Living God', 'Hearing & Obeying the Inspired Word');
    }
  }

  const isGospel = ['matthew', 'mark', 'luke', 'john'].includes(normBook);
  const isEpistle = ['romans', '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', '1thessalonians', '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon', 'hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john', 'jude'].includes(normBook);
  const isWisdom = ['psalms', 'proverbs', 'ecclesiastes', 'job', 'song of solomon'].includes(normBook);
  const isProphet = ['isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi', 'revelation'].includes(normBook);

  const contextSetting = isGospel
    ? `Recorded in the Gospel of ${cleanBookName} as part of the inspired witness to Jesus Christ’s life, teaching, and kingdom ministry.`
    : isEpistle
      ? `Composed within the apostolic epistle of ${cleanBookName} to instruct, correct, and encourage the church in sound doctrine and holy conduct.`
      : isWisdom
        ? `Preserved in the wisdom and worship corpus of ${cleanBookName}, articulating prayer, praise, and ethical reflection in the fear of the Lord.`
        : isProphet
          ? `Proclaimed in the prophetic witness of ${cleanBookName}, calling God's people to covenant faithfulness and unveiling divine redemptive purposes.`
          : `Situated within the canonical history of ${cleanBookName}, recounting God’s covenantal dealings and sovereign guidance of His people.`;

  const conciseOverview = verseText && verseText.trim().length > 0
    ? `In ${cleanPassageRef} (${snippet}), the text centers upon ${extractedThemes[0].toLowerCase()}, calling hearers to genuine faith, spiritual discernment, and obedience.`
    : `In ${cleanPassageRef}, the inspired text provides foundational biblical instruction on ${extractedThemes[0].toLowerCase()}.`;

  return {
    passageRef: cleanPassageRef,
    conciseOverview,
    theologicalThemes: extractedThemes.slice(0, 3),
    historicalContext: contextSetting,
    lensPerspectives: {
      catholic: `Examines how ${cleanPassageRef} is received in Sacred Tradition, the liturgical life of the Church, and personal moral sanctification (CCC §1700–1876).`,
      orthodox: `Interprets ${cleanPassageRef} through patristic consensus, sacramental grace, and the pursuit of theosis (union with God).`,
      reformed: `Emphasizes God's sovereign covenant faithfulness, the supreme authority of the Word, and salvation by grace alone in ${cleanPassageRef}.`,
      lutheran: `Examines ${cleanPassageRef} through the biblical distinction between Law and Gospel, anchoring assurance in Christ’s promise.`,
      wesleyan: `Focuses on the transforming power of the Holy Spirit in ${cleanPassageRef}, calling the believer to responsive faith and holy love.`,
      anglican: `Considers ${cleanPassageRef} within the historic lectionary, common prayer, and apostolic order of the Church.`,
      baptist_evangelical: `Draws clear, practical application for personal faith, prayer, and obedient discipleship from ${cleanPassageRef}.`
    },
    originalLanguageInsights: lemmas,
    suggestedQuestions: [
      `How does ${cleanPassageRef} deepen your understanding of ${extractedThemes[0].toLowerCase()}?`,
      `What practical obedience or prayerful reflection does this verse demand in your daily life?`
    ],
    practicalApplication: `Take time to meditate on the truth of ${cleanPassageRef} today, asking God to conform your heart and actions to His revealed Word.`
  };
}
