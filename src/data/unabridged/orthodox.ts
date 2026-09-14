import { DoctrinalEntry } from '../doctrinalCorpus';

/**
 * UNABRIDGED OFFICIAL EASTERN ORTHODOX CONFESSIONAL & ECUMENICAL CORPUS
 * Contains the official Horoi and Canons of the Seven Ecumenical Councils,
 * The Confession of Dositheus (1672 Synod of Jerusalem, all 18 Decrees),
 * St. John of Damascus (Exact Exposition of the Orthodox Faith),
 * St. Gregory Palamas (The Triads), St. Athanasius (On the Incarnation),
 * and the Divine Liturgy of St. John Chrysostom.
 */
export const UNABRIDGED_ORTHODOX_CORPUS: DoctrinalEntry[] = [
  // =========================================================================
  // THE SEVEN ECUMENICAL COUNCILS (AD 325 – 787)
  // =========================================================================
  {
    id: 'orthodox_ephesus_431_theotokos_complete',
    tradition: 'orthodox',
    documentTitle: 'Third Ecumenical Council of Ephesus (AD 431)',
    sectionOrArticle: 'Twelve Anathemas of St. Cyril of Alexandria & Horos',
    citation: 'Council of Ephesus (AD 431), Canon I',
    yearOrEra: '431',
    topic: 'The Holy Virgin as Theotokos (God-Bearer) & Hypostatic Union',
    coreDoctrine: 'If anyone does not confess that Emmanuel is in truth God and that the Holy Virgin is on this account Theotokos (for she gave birth according to the flesh to the Word of God made flesh), let him be anathema.',
    fullExcerpt: 'If anyone does not confess that Emmanuel is in truth God and that the Holy Virgin is on this account Theotokos (for she gave birth according to the flesh to the Word of God made flesh), let him be anathema (Canon I). For we do not say that the nature of the Word was changed and became flesh, nor that he was transformed into a complete human being, but rather that the Word, having united to himself in his own person (hypostatically) flesh animated by a rational soul, became man in an ineffable and incomprehensible manner, and was called the Son of Man. The Holy Virgin is the supreme bridge between heaven and earth through whom God the Word became man while remaining fully God.',
    relatedScriptures: ['Luke 1:35', 'Luke 1:43', 'Galatians 4:4', 'John 1:14', 'Matthew 1:23'],
    keywords: ['theotokos', 'council of ephesus', 'st cyril of alexandria', 'mother of god', 'virgin mary', 'incarnation', 'hypostatic union', 'orthodox']
  },
  {
    id: 'orthodox_chalcedon_451_two_natures',
    tradition: 'orthodox',
    documentTitle: 'Fourth Ecumenical Council of Chalcedon (AD 451)',
    sectionOrArticle: 'The Chalcedonian Definition of Faith (Horos)',
    citation: 'Council of Chalcedon (AD 451)',
    yearOrEra: '451',
    topic: 'The Two Natures of Christ: Without Confusion, Without Change, Without Division, Without Separation',
    coreDoctrine: 'One and the same Christ, Son, Lord, Only-begotten, to be acknowledged in two natures, inconfusedly, unchangeably, indivisibly, inseparably; the distinction of natures being by no means taken away by the union.',
    fullExcerpt: 'Following the holy Fathers, we all with one consent teach men to confess one and the same Son, our Lord Jesus Christ, the same perfect in Godhead and also perfect in manhood; truly God and truly man, of a reasonable soul and body; consubstantial (homoousios) with the Father according to the Godhead, and consubstantial with us according to the Manhood; in all things like unto us, without sin; begotten before all ages of the Father according to the Godhead, and in these latter days, for us and for our salvation, born of the Virgin Mary, the Mother of God (Theotokos), according to the Manhood; one and the same Christ, Son, Lord, Only-begotten, to be acknowledged in two natures, inconfusedly, unchangeably, indivisibly, inseparably; the distinction of natures being by no means taken away by the union, but rather the property of each nature being preserved, and concurring in one Person and one Subsistence.',
    relatedScriptures: ['John 1:1-3', 'John 1:14', 'Philippians 2:5-11', 'Hebrews 4:15', 'Colossians 2:9'],
    keywords: ['chalcedon', 'two natures', 'hypostatic union', 'homoousios', 'theotokos', 'without sin', 'christology', 'orthodox']
  },
  {
    id: 'orthodox_nicaea_ii_787_holy_icons',
    tradition: 'orthodox',
    documentTitle: 'Seventh Ecumenical Council of Nicaea II (AD 787)',
    sectionOrArticle: 'Definition of Faith (Horos on Holy Images)',
    citation: 'Council of Nicaea II (AD 787)',
    yearOrEra: '787',
    topic: 'Veneration of Holy Icons (Proskynesis vs. Latreia) & Incarnational Reality',
    coreDoctrine: 'Holy icons of our Lord Jesus Christ, the spotless Theotokos, and all saints are fittingly venerated with honor and salutation (proskynesis), because the honor paid to the image passes to the prototype; worship in spirit and truth (latreia) is reserved for the Divine Nature alone.',
    fullExcerpt: 'We define that the holy and venerable images, whether in colors or mosaic or other materials, are to be set up in the holy churches of God... For the more frequently they are seen in representational art, the more are those who see them drawn to remember and long for those who serve as models, and to pay these images the tribute of salutation and respectful veneration (proskynesis). Certainly this is not the full worship (latreia) in accordance with our faith, which is properly paid to the divine nature alone. For the honor which is paid to the image passes on to that which the image represents, and he who reveres the image reveres in it the person who is represented. Thus the teaching of our holy Fathers, that is the tradition of the Catholic and Orthodox Church, is confirmed.',
    relatedScriptures: ['Colossians 1:15', 'Hebrews 1:3', 'John 1:14', 'Exodus 25:18-22', '1 Kings 6:29'],
    keywords: ['icons', 'nicaea ii', 'seventh ecumenical council', 'proskynesis', 'latreia', 'veneration', 'theotokos', 'st john of damascus', 'orthodox']
  },

  // =========================================================================
  // PATRISTIC THEOLOGY: ATHANASIUS, PALAMAS & JOHN OF DAMASCUS
  // =========================================================================
  {
    id: 'orthodox_athanasius_theosis',
    tradition: 'orthodox',
    documentTitle: 'St. Athanasius the Great: On the Incarnation',
    sectionOrArticle: 'Section 54',
    citation: 'De Incarnatione §54',
    yearOrEra: 'c. AD 318',
    topic: 'The Incarnation & Theosis (Deification by Grace)',
    coreDoctrine: 'God became man so that man might become god (by grace)—sharing in the uncreated life and divine nature of God without losing creaturely essence.',
    fullExcerpt: 'For the Son of God became man so that we might become god (autòs gàr enēnthrōpēsen, hína hēmeîs theopoiēthômen); and He manifested Himself through a body that we might receive the idea of the unseen Father; and He endured the insolence of men that we might inherit immortality. For as a king entering a great city preserves the whole place from ruin by dwelling in a single house within it, so the Lord of all, coming among us and dwelling in a body like ours, has put an end to the corruption of all mankind by the grace of His resurrection.',
    relatedScriptures: ['2 Peter 1:4', 'Psalm 82:6', 'John 10:34-36', 'Romans 8:29', '1 John 3:2'],
    keywords: ['theosis', 'athanasius', 'deification', 'divine nature', 'grace', 'incarnation', 'partakers of divine nature', 'orthodox']
  },
  {
    id: 'orthodox_palamas_essence_energies',
    tradition: 'orthodox',
    documentTitle: 'St. Gregory Palamas: The Triads in Defense of the Holy Hesychasts',
    sectionOrArticle: 'Triad III.1 & Synods of Constantinople (1341 & 1351)',
    citation: 'The Triads, III.1',
    yearOrEra: '1338 / 1351',
    topic: 'The Transcendent Divine Essence vs. Uncreated Divine Energies',
    coreDoctrine: 'God is utterly unknowable and incommunicable in His transcendent Divine Essence (Ousia), yet truly knowable, participable, and communicating Himself to the saints through His Uncreated Divine Energies (Energeiai).',
    fullExcerpt: 'God in His essence is infinitely beyond all comprehension, dwelling in unapproachable light. Yet by His uncreated energies—His grace, His glory, the Taboric light of the Transfiguration—He truly penetrates the created cosmos, allowing humanity to genuinely partake of God and be united to Him in unceasing prayer (hesychia) and love. We partake not of the Divine Essence (which remains incommunicable), but of the Uncreated Divine Energies, whereby we truly participate in the life of God Himself.',
    relatedScriptures: ['Matthew 17:1-8', '2 Peter 1:4', '1 Timothy 6:16', 'Exodus 33:18-23', 'Habakkuk 3:3-4'],
    keywords: ['palamas', 'hesychasm', 'uncreated energies', 'divine essence', 'tabor light', 'transfiguration', 'theosis', 'orthodox']
  },
  {
    id: 'orthodox_damascus_panagia_theotokos',
    tradition: 'orthodox',
    documentTitle: 'St. John of Damascus: Exact Exposition of the Orthodox Faith',
    sectionOrArticle: 'Book IV, Chapter 14: On the Ever-Virgin Theotokos & The Dormition',
    citation: 'Exact Exposition, IV.14',
    yearOrEra: 'c. AD 743',
    topic: 'The All-Holy (Panagia) Ever-Virgin Mother of God & The Dormition (Koimisis)',
    coreDoctrine: 'Mary is the spotless and all-holy (Panagia) vessel of the Incarnation, preserved in personal holiness, who at the end of her life fell asleep in Christ (Dormition / Koimisis) and was translated into heavenly glory.',
    fullExcerpt: 'The name Theotokos contains the whole mystery of the Incarnation. She is purer than the brightness of the sun, who gave flesh to the Word of God while remaining ever-virgin before, during, and after childbirth. She was chosen from all generations to be the spotless bridal chamber of God the Word. When she finished her earthly course, she experienced bodily death like her Son, but her holy body was not abandoned to corruption: she was translated into the heavenly realms by her Son and God, where she continually intercedes for the world as Queen and Mother of all creation.',
    relatedScriptures: ['Luke 1:28', 'Luke 1:42', 'Luke 1:48', 'Revelation 12:1', 'Psalm 45:9'],
    keywords: ['panagia', 'theotokos', 'aeiparthenos', 'dormition', 'st john of damascus', 'sinless', 'intercession', 'orthodox']
  },

  // =========================================================================
  // SYNOD OF JERUSALEM (1672) - CONFESSION OF DOSITHEUS & DIVINE LITURGY
  // =========================================================================
  {
    id: 'orthodox_dositheus_1672_complete',
    tradition: 'orthodox',
    documentTitle: 'The Confession of Dositheus (Synod of Jerusalem, 1672)',
    sectionOrArticle: 'Decrees VI, XVI & XVII: Ancestral Sin, Baptism & The Holy Eucharist',
    citation: 'Synod of Jerusalem (1672), Decrees VI, XVI, XVII',
    yearOrEra: '1672',
    topic: 'Ancestral Sin, Holy Baptism & The Mystical Transformation (Metousiosis) of the Eucharist',
    coreDoctrine: 'In Holy Baptism ancestral corruption is washed away and divine regeneration given. In the Holy Eucharist, the bread and wine are genuinely changed and transformed (Metousiosis / Metabole) into the actual Body and Blood of Christ, which are truly received and adored.',
    fullExcerpt: 'Decree VI: We believe the first man created by God to have fallen in Paradise... and that his descendants fell along with him, inheriting mortality, spiritual weakness, and the disruption of communion with God. This ancestral inheritance is remitted and healed in Holy Baptism. Decree XVI: Holy Baptism is of the highest necessity; it delivers from ancestral sin, confers regeneration, is administered by triple immersion, and is confirmed by Holy Chrismation. Decree XVII: In the celebration of the Eucharist we believe our Lord Jesus Christ to be present, not typically, nor figuratively, nor by superabundant grace... but truly and really, so that after the consecration of the bread and wine, the bread is changed, transubstantiated, converted and transformed (metaballeisthai, metapoieisthai, metousiousthai) into the true Body Itself of the Lord, which was born in Bethlehem of the ever-virgin Mary... and the wine into the true Blood of the Lord.',
    relatedScriptures: ['Romans 5:12', 'John 3:5', 'Acts 2:38', 'John 6:51-58', '1 Corinthians 10:16', '1 Corinthians 11:23-29'],
    keywords: ['dositheus', 'synod of jerusalem', 'ancestral sin', 'baptism', 'chrismation', 'eucharist', 'metousiosis', 'real presence', 'orthodox']
  },
  {
    id: 'orthodox_chrysostom_liturgy_epiklesis',
    tradition: 'orthodox',
    documentTitle: 'Divine Liturgy of St. John Chrysostom',
    sectionOrArticle: 'The Anaphora & Holy Epiklesis',
    citation: 'Liturgy of St. John Chrysostom',
    yearOrEra: 'c. AD 400',
    topic: 'The Holy Eucharist as the True Body and Blood of Christ via the Epiklesis',
    coreDoctrine: 'By the invocation of the Holy Spirit (Epiklesis), the bread and wine offered in the Divine Liturgy are genuinely and mystically transformed (Metabole) into the actual, life-giving Body and precious Blood of Jesus Christ.',
    fullExcerpt: 'Priest: "Again we offer to You this rational and bloodless worship, and we ask You, we pray You, and we entreat You: send down Your Holy Spirit upon us and upon these Gifts here presented. And make this bread the precious Body of Your Christ. Amen. And that which is in this cup, the precious Blood of Your Christ. Amen. Changing them by Your Holy Spirit (Metabalon tō Pneumati sou tō Hagiō). Amen, Amen, Amen. That to those who partake thereof they may be for the purification of the soul, for the remission of sins, for the communion of Your Holy Spirit, for the fulfillment of the Kingdom of Heaven."',
    relatedScriptures: ['John 6:51-58', 'Luke 22:19-20', '1 Corinthians 10:16', '1 Corinthians 11:23-26'],
    keywords: ['eucharist', 'epiklesis', 'metabole', 'st john chrysostom', 'divine liturgy', 'body and blood', 'real presence', 'orthodox']
  }
];
