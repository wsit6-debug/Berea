import { TypologyMotif } from '../types';
import allChaptersData from './allChaptersTypology.json';

/**
 * Pre-computed, canonical Christological typology database.
 * Sourced from open biblical research repositories and historical biblical theology (Vos, Beale, Goldsworthy).
 * Provides 100% chapter-by-chapter coverage for every single chapter of all 66 biblical books
 * and 7 Catholic Deuterocanonical books (1,326 chapters total).
 */

// 1. COMPREHENSIVE CHAPTER-SPECIFIC TYPOLOGY HASHMAP (Every Chapter of Every Book)
export const TYPOLOGY_CHAPTER_HASHMAP: Record<string, TypologyMotif[]> = allChaptersData as unknown as Record<string, TypologyMotif[]>;

export const TYPOLOGY_BOOK_HASHMAP: Record<string, TypologyMotif> = {
  'acts': {
  "motif": "The Spirit-Filled Church & The Global Mission",
  "summary": "Acts chronicles the risen and ascended Christ continuing His redemptive work from the right hand of the Father, pouring out the Holy Spirit to transform timid disciples into fearless witnesses taking the gospel from Jerusalem to the ends of the earth.",
  "nodes": [
    {
      "era": "Creation & Patriarchs",
      "reference": "Genesis 12:1–3, 11:1–9",
      "event": "Babel scatters the nations in confusion; God promises Abraham that all nations will be blessed",
      "significance": "The ancient global promise that the apostolic mission was sent to fulfill."
    },
    {
      "era": "Exodus & Kingdom",
      "reference": "Exodus 19:5–6, 2 Samuel 7:12–16",
      "event": "Israel called as a kingdom of priests; God promises David an eternal dynasty",
      "significance": "The covenant nation and royal dynasty designed to manifest God's glory to the world."
    },
    {
      "era": "Prophets",
      "reference": "Joel 2:28–32, Isaiah 49:6",
      "event": "'I will pour out my Spirit on all flesh'; 'I will make you as a light for the nations to the end of the earth'",
      "significance": "Prophecy of the universal outpouring of the Spirit and the worldwide harvest of souls."
    },
    {
      "era": "Gospels",
      "reference": "Luke 24:46–49, Matthew 28:18–20",
      "event": "Repentance and forgiveness proclaimed to all nations; 'Wait for the promise of the Father'",
      "significance": "Christ issues the Great Commission and promises the empowering Spirit."
    },
    {
      "era": "Acts & Epistles",
      "reference": "Acts 1:8, 28:30–31",
      "event": "'You will receive power when the Holy Spirit comes upon you... to the end of the earth'; preaching unhindered",
      "significance": "The unstoppable advance of the gospel from Jerusalem through Judea and Samaria to Rome."
    },
    {
      "era": "Revelation",
      "reference": "Revelation 5:9–10, 7:9–10",
      "event": "Ransomed people from every tribe, language, people, and nation reigning on the earth",
      "significance": "The completed harvest of the apostolic mission gathered before the throne of God."
    }
  ]
},

  // PENTATEUCH / LAW
  'genesis': {
    motif: "The Promised Seed of the Woman",
    summary: "Genesis initiates the overarching redemptive promise: from the garden rebellion to the call of Abraham, God preserves the righteous lineage of the Seed that will crush the serpent's head.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 3:15, 12:1–3", event: "Protoevangelium and Abrahamic Covenant", significance: "God pledges a Seed from Abraham through whom all nations on earth will be blessed." },
      { era: "Exodus & Kingdom", reference: "Exodus 1:7, 2 Samuel 7:12", event: "Preservation of the covenant family in Egypt and Davidic promise", significance: "The promised line survives sovereignly through tyrannical oppression." },
      { era: "Prophets", reference: "Isaiah 7:14, Micah 5:2", event: "Prophecy of the virgin-born Ruler from Bethlehem", significance: "Prophets clarify the divine and royal identity of the Seed." },
      { era: "Gospels", reference: "Luke 1:31–35, Matthew 1:1", event: "The Incarnation of Jesus Christ, Son of Abraham and Son of David", significance: "The Seed assumes true human flesh to fulfill the covenant oaths." },
      { era: "Acts & Epistles", reference: "Galatians 3:16, Romans 16:20", event: "'Now the promises were made to Abraham and to his offspring... which is Christ'", significance: "Apostolic confirmation that Christ is the singular true Seed of Abraham." },
      { era: "Revelation", reference: "Revelation 12:1–5, 17", event: "The woman gives birth to the male Child who rules the nations with an iron rod", significance: "Cosmic vindication of the Seed over the ancient dragon." }
    ]
  },
  'exodus': {
    motif: "The Passover Lamb & Exodus Deliverance",
    summary: "Exodus establishes the preeminent Old Testament paradigm of redemption: God delivers His covenant people from tyrannical bondage through substitutionary blood and leads them through the waters into holy covenant communion.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 15:13–14", event: "God foretells the 400-year affliction and great deliverance", significance: "God's promise of the Exodus made generations before Moses." },
      { era: "Exodus & Kingdom", reference: "Exodus 12:13, 14:21–22", event: "Passover blood shields from judgment; parting of the Red Sea", significance: "The historical deliverance establishing Israel as God's redeemed firstborn." },
      { era: "Prophets", reference: "Isaiah 11:15–16, 51:10–11", event: "Promise of a Second Exodus for the dispersed and exiled", significance: "Prophets view the return from sin's exile as a greater Exodus." },
      { era: "Gospels", reference: "Luke 9:31, John 1:29", event: "Jesus speaks on the Mount of Transfiguration of His 'exodus' (departure) at Jerusalem", significance: "Christ accomplishes the ultimate Exodus through His death and resurrection." },
      { era: "Acts & Epistles", reference: "1 Corinthians 5:7, 10:1–4", event: "Christ our Passover sacrificed; baptized into Moses in the cloud and sea", significance: "The Church recognizes the sacraments prefigured in the Exodus journey." },
      { era: "Revelation", reference: "Revelation 15:2–3", event: "Saints standing beside the glass sea singing the Song of Moses and of the Lamb", significance: "Eternal victory over the spiritual Pharaoh and beast." }
    ]
  },
  'leviticus': {
    motif: "The Spotless Sacrifice & The Great High Priest",
    summary: "Leviticus reveals the absolute holiness of God and the necessity of atoning blood, establishing the priestly and sacrificial structures that find their eternal fulfillment in Christ's once-for-all offering.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 8:20–21, 22:13", event: "Noah's sweet-smelling offering; the substitutionary ram on Moriah", significance: "Early patriarchal altars establishing sacrificial approach to God." },
      { era: "Exodus & Kingdom", reference: "Leviticus 16:15–22, 17:11", event: "The Day of Atonement (Yom Kippur): Blood on the Mercy Seat and the Scapegoat", significance: "Double imputation: propitiation of divine wrath and carrying away of transgressions." },
      { era: "Prophets", reference: "Isaiah 53:10, Zechariah 3:8–9", event: "The Servant's soul made a guilt offering; iniquity removed in a single day", significance: "The ritual system personalized in the Messiah who bears iniquity." },
      { era: "Gospels", reference: "Matthew 27:51, Hebrews 7:26", event: "The Temple veil torn in two from top to bottom at Jesus' death", significance: "The end of physical Levitical barriers; unhindered access to God's presence opened." },
      { era: "Acts & Epistles", reference: "Hebrews 9:11–14, 10:11–14", event: "'By a single offering He has perfected for all time those who are being sanctified'", significance: "Christ as both High Priest and spotless Lamb entering the true heavenly sanctuary." },
      { era: "Revelation", reference: "Revelation 1:5–6, 7:14", event: "Christ who made us a kingdom of priests; robes washed white in the blood of the Lamb", significance: "The entire redeemed community elevated into perpetual holy priesthood before God." }
    ]
  },
  'numbers': {
    motif: "The Bronze Serpent & Wilderness Pilgrimage",
    summary: "Numbers chronicles God's unwavering faithfulness and disciplined guidance to a murmuring pilgrim people, foreshadowing Christ as the lifted-up Serpent of healing and the Rock that accompanies His people.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 28:15", event: "'Behold, I am with you and will keep you wherever you go'", significance: "The patriarchal promise of divine companionship on the pilgrimage." },
      { era: "Exodus & Kingdom", reference: "Numbers 20:8–11, 21:8–9", event: "Water from the smitten Rock and the Bronze Serpent raised on the pole", significance: "Supernatural life and healing provided in the barren wasteland." },
      { era: "Prophets", reference: "Hosea 2:14–15, Psalm 95:7–11", event: "God speaking tenderly to Israel in the wilderness; 'Today if you hear His voice'", significance: "The wilderness recalled as the crucible of covenant fidelity and testing." },
      { era: "Gospels", reference: "John 3:14–15, Matthew 4:1–11", event: "Jesus lifted up like the serpent; Christ triumphs over temptation in the 40-day wilderness", significance: "Jesus stands as True Israel, overcoming where the wilderness generation stumbled." },
      { era: "Acts & Epistles", reference: "1 Corinthians 10:4–9, Hebrews 3:7–19", event: "'That Rock was Christ'; warnings against murmuring and unbelief", significance: "The Church instructed by the wilderness journey as a pilgrim people seeking the Sabbath rest." },
      { era: "Revelation", reference: "Revelation 2:17, 7:16–17", event: "Hidden manna given to overcomers; the Lamb guides them to living springs of water", significance: "Consummation of the pilgrimage in the abundance of the New Jerusalem." }
    ]
  },
  'deuteronomy': {
    motif: "The Prophet Like Moses & The Circumcised Heart",
    summary: "Deuteronomy re-articulates the covenant on the plains of Moab, promising the coming of an authoritative Prophet like Moses and the ultimate divine circumcision of the heart to love the Lord fully.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 17:10–14", event: "Physical circumcision given to Abraham as sign of the covenant", significance: "The outward sign setting apart the covenant seed." },
      { era: "Exodus & Kingdom", reference: "Deuteronomy 18:15–19, 30:6", event: "Promise of a Prophet like Moses; 'The Lord your God will circumcise your heart'", significance: "Prophecy of an ultimate Lawgiver and internal spiritual transformation." },
      { era: "Prophets", reference: "Jeremiah 31:33, Ezekiel 36:26", event: "The New Covenant: Law written upon the heart, a new spirit within", significance: "Prophets expand Deuteronomy's vision of inward spiritual renewal." },
      { era: "Gospels", reference: "Matthew 5:1–2, John 5:46", event: "Jesus delivers the Sermon on the Mount; 'Moses wrote of Me'", significance: "Christ speaks as the greater Lawgiver with absolute divine authority." },
      { era: "Acts & Epistles", reference: "Acts 3:22–24, Romans 2:28–29", event: "Peter identifies Jesus as the Prophet of Deuteronomy 18; true circumcision of the heart by the Spirit", significance: "Fulfillment of the Deuteronomic promise in apostolic proclamation." },
      { era: "Revelation", reference: "Revelation 15:3, 21:7", event: "The song of Moses the servant of God; 'He who overcomes shall inherit these things'", significance: "The covenant blessings inherited fully by the redeemed in glory." }
    ]
  },

  // HISTORICAL BOOKS
  'joshua': {
    motif: "The Captain of Salvation & The Promised Rest",
    summary: "Joshua leading Israel across the Jordan into the Promised Land prefigures Jesus (Yeshua) bringing His redeemed people through death into the fullness of God's Sabbath rest and spiritual inheritance.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 12:7, 15:18", event: "Covenant grant of the land from the Euphrates to Egypt", significance: "The original inheritance promise sworn to Abraham." },
      { era: "Exodus & Kingdom", reference: "Joshua 1:1–9, 5:13–15", event: "Joshua meets the Commander of the Lord's Army with drawn sword; Israel enters Canaan", significance: "Divine warfare secures the physical inheritance for the twelve tribes." },
      { era: "Prophets", reference: "Isaiah 11:10, Zechariah 3:1–5", event: "The Root of Jesse as a banner for the nations; Joshua the high priest clothed in clean garments", significance: "The Messianic warrior-deliverer who establishes universal peace and righteousness." },
      { era: "Gospels", reference: "Matthew 11:28–29, John 14:1–3", event: "Jesus declares: 'Come to me, all who labor and are heavy laden, and I will give you rest'", significance: "Jesus (Yeshua) provides the spiritual rest that Canaan could only prefigure." },
      { era: "Acts & Epistles", reference: "Hebrews 4:8–11, Ephesians 1:11–14", event: "'For if Joshua had given them rest, God would not have spoken of another day... There remains a Sabbath rest'", significance: "The Christian's eternal inheritance sealed by the Holy Spirit." },
      { era: "Revelation", reference: "Revelation 19:11–16, 21:1–4", event: "The Faithful and True riding on a white horse, conquering and establishing the New Earth", significance: "Final possession of the cosmic Promised Land where God dwells with man." }
    ]
  },
  'judges': {
    motif: "The Flawed Saviors & The Need for the King",
    summary: "The tragic cyclical downward spiral of Judges reveals that temporary, flawed deliverers cannot permanently rescue human hearts, crying out for the true, righteous, and eternal King.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 49:10", event: "Prophecy of Shiloh: the scepter shall not depart from Judah until He comes", significance: "The promise of an enduring, righteous Ruler during the patriarchal dawn." },
      { era: "Exodus & Kingdom", reference: "Judges 2:16–19, 21:25", event: "God raises up judges; 'In those days there was no king in Israel; everyone did what was right in his own eyes'", significance: "The devastating indictment of moral anarchy without a godly king." },
      { era: "Prophets", reference: "Isaiah 33:22, Micah 4:9", event: "'The Lord is our judge, the Lord is our lawgiver, the Lord is our king; He will save us'", significance: "Prophets unite the offices of judge, lawgiver, and king in the Messiah." },
      { era: "Gospels", reference: "John 5:22–27, Luke 1:32–33", event: "The Father has given all judgment to the Son; He will reign over the house of Jacob forever", significance: "Jesus arrives as the incorruptible Judge and everlasting King." },
      { era: "Acts & Epistles", reference: "Acts 10:42, 17:31", event: "Jesus appointed by God to be the Judge of the living and the dead, confirmed by resurrection", significance: "The righteous judgment of Christ proclaimed to the Gentile world." },
      { era: "Revelation", reference: "Revelation 19:11, 20:11–13", event: "The Great White Throne judgment; in righteousness He judges and makes war", significance: "The ultimate cessation of wickedness under the reign of the perfect Judge-King." }
    ]
  },
  'ruth': {
    motif: "Boaz the Kinsman-Redeemer (Go'el)",
    summary: "Boaz stepping forward to redeem Ruth the destitute foreign widow out of loyal covenant love (hesed) provides the radiant historical archetype for Christ, our divine Kinsman-Redeemer who purchases His Bride.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 38:8, 12:3", event: "Levirate duty and blessing of the Gentiles through Abraham's line", significance: "Patriarchal roots of familial redemption and inclusion of outsiders." },
      { era: "Exodus & Kingdom", reference: "Leviticus 25:25, Ruth 4:9–10", event: "Boaz purchases the inheritance and takes Ruth the Moabitess to be his wife", significance: "The wealthy, qualified kinsman acts willingly to redeem the impoverished." },
      { era: "Prophets", reference: "Isaiah 54:5, 59:20", event: "'Your Maker is your husband; the Redeemer will come to Zion'", significance: "The Lord reveals Himself as the ultimate Kinsman-Redeemer of His fallen people." },
      { era: "Gospels", reference: "Matthew 1:5, Galatians 4:4–5", event: "Ruth named in the genealogy of Jesus; God sent His Son born of a woman to redeem", significance: "Christ becomes our true kinsman by assuming actual human nature." },
      { era: "Acts & Epistles", reference: "Ephesians 1:7, Titus 2:14", event: "'In Him we have redemption through His blood, the forgiveness of our trespasses'", significance: "Christ pays the redemption price not with silver or gold, but with His own life." },
      { era: "Revelation", reference: "Revelation 5:9", event: "'Worthy are you to take the scroll... for you were slain, and by your blood you ransomed people for God'", significance: "The cosmic praise of the Kinsman-Redeemer before the throne." }
    ]
  },
  '1samuel': {
    motif: "The Anointed King & The Rejection of Human Pride",
    summary: "The contrast between Saul (the fleshly king chosen by outward appearance) and David (the anointed shepherd after God's own heart) prefigures the rejection of worldly power in favor of the humble, crucified King of Kings.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 17:6", event: "God promises Abraham that 'kings shall come from you'", significance: "The divine plan for kingship grounded in covenant promise." },
      { era: "Exodus & Kingdom", reference: "1 Samuel 16:7, 17:45–47", event: "David anointed by Samuel; David slays Goliath in the name of the Lord of Hosts", significance: "God exalts the humble shepherd youth to defeat the giant of mockery and death." },
      { era: "Prophets", reference: "Jeremiah 23:5, Ezekiel 34:23–24", event: "The righteous Branch of David; 'My servant David shall be king over them, one shepherd'", significance: "Prophetic longing for the true Davidic Shepherd-King." },
      { era: "Gospels", reference: "Luke 1:32, Matthew 21:9", event: "The angel announces: 'The Lord God will give Him the throne of His father David'; 'Hosanna to the Son of David'", significance: "Jesus arrives as the true David, triumphing over Satan, sin, and death." },
      { era: "Acts & Epistles", reference: "Acts 13:22–23, Romans 1:3", event: "'Of this man's offspring God has brought to Israel a Savior, Jesus, as He promised'", significance: "Apostolic grounding of the gospel in the lineage and victory of David." },
      { era: "Revelation", reference: "Revelation 22:16", event: "'I, Jesus, am the Root and the Offspring of David, the bright Morning Star'", significance: "The eternal reign of the true Shepherd-King over all redeemed creation." }
    ]
  },
  '2samuel': {
    motif: "The Davidic Covenant & The Eternal Throne",
    summary: "God's unconditional covenant with David in 2 Samuel 7 promising an unbroken royal house and an eternal kingdom finds its definitive, literal realization in the resurrected and enthroned Christ.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 49:10", event: "The scepter prophecy of Judah given by dying Jacob", significance: "The royal tribe designated for the eternal monarchy." },
      { era: "Exodus & Kingdom", reference: "2 Samuel 7:12–16, Psalm 89:3–4", event: "The Davidic Covenant: 'I will establish the throne of His kingdom forever'", significance: "The pinnacle OT covenant securing an eternal dynasty for David's Seed." },
      { era: "Prophets", reference: "Isaiah 9:6–7, Amos 9:11", event: "The Prince of Peace on David's throne; restoring the fallen booth of David", significance: "Prophets reaffirm that God's covenant with David cannot be broken." },
      { era: "Gospels", reference: "Luke 1:32–33, Matthew 22:42–45", event: "Gabriel's annunciation; Jesus demonstrates David calls Him 'Lord'", significance: "Jesus reveals His dual nature: David's physical son and David's divine Lord." },
      { era: "Acts & Epistles", reference: "Acts 2:30–36, Hebrews 1:5", event: "Peter cites the Davidic covenant fulfilled in Christ's resurrection and ascension", significance: "Christ's seating at the right hand of God is the actualization of the Davidic throne." },
      { era: "Revelation", reference: "Revelation 3:7, 5:5", event: "He who has the Key of David; the Lion of the tribe of Judah has conquered", significance: "Cosmic authority and opening of redemption history by the Davidic King." }
    ]
  },
  '1kings': {
    motif: "Solomon's Glory, Temple, & The Greater than Solomon",
    summary: "The apex of Solomon's kingdom—peace, worldwide renown, and the glorious dedication of the Temple—foreshadows the greater glory, wisdom, and cosmic peace of Christ's kingdom.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 28:16–17", event: "Jacob's vision of Bethel: 'How awesome is this place! This is the house of God'", significance: "The primordial archetype of the earthly house of God." },
      { era: "Exodus & Kingdom", reference: "1 Kings 8:10–11, 27, 10:1–9", event: "The Shekinah glory fills Solomon's Temple; Queen of Sheba marvels at Solomon's wisdom", significance: "The earthly pinnacle of God's dwelling and international acclaim of Israel's king." },
      { era: "Prophets", reference: "Haggai 2:7–9, Zechariah 6:12–13", event: "The Branch who will build the temple of the Lord and bear royal honor", significance: "Prophetic vision of a future temple whose glory eclipses Solomon's." },
      { era: "Gospels", reference: "Matthew 12:42, John 2:19–21", event: "Jesus declares: 'Behold, something greater than Solomon is here'; the temple of His body", significance: "Christ embodies the wisdom and dwelling of God in His own person." },
      { era: "Acts & Epistles", reference: "1 Corinthians 1:24, 30, Ephesians 2:20–22", event: "Christ the wisdom of God; believers fitted together into a holy temple in the Lord", significance: "The living temple of the Church constructed on Christ the cornerstone." },
      { era: "Revelation", reference: "Revelation 21:22–26", event: "The kings of the earth bring their glory into the New Jerusalem; no temple, for God and Lamb are its temple", significance: "The universal pilgrimage of nations to the radiant city of peace." }
    ]
  },
  '2kings': {
    motif: "The Chariots of Fire & The Faithful Remnant",
    summary: "Amidst the catastrophic moral decay and exile of Israel and Judah, God's preservation of His prophetic word, Elisha's double portion, and the miraculous remnant points to Christ's victorious ascension and indestructible Church.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 5:24", event: "Enoch walks with God and is taken up to heaven without dying", significance: "Early sign that God's servants triumph over death and bodily corruption." },
      { era: "Exodus & Kingdom", reference: "2 Kings 2:11–12, 6:16–17", event: "Elijah ascends in a chariot of fire; the mountains full of horses and chariots of fire", significance: "The invisible celestial army protecting God's prophetic ministry." },
      { era: "Prophets", reference: "Malachi 4:5–6, Isaiah 10:20–22", event: "'Behold, I will send you Elijah the prophet before the great and awesome day'; the remnant returns", significance: "Prophetic expectation of the forerunner preparing the way for the Lord." },
      { era: "Gospels", reference: "Luke 1:17, Acts 1:9–11", event: "John the Baptist comes in the spirit of Elijah; Jesus ascends bodily into the clouds", significance: "Fulfillment in the forerunner and Christ's ascension into heavenly power." },
      { era: "Acts & Epistles", reference: "Romans 11:2–5, Ephesians 4:8", event: "'God has kept for Himself 7,000 who have not bowed to Baal; so too at the present time there is a remnant'", significance: "The doctrine of God's sovereignly preserved elect remnant through all ages." },
      { era: "Revelation", reference: "Revelation 11:3–12", event: "The two prophetic witnesses caught up to heaven in a cloud while their enemies watch", significance: "The vindication and resurrection of God's faithful martyrs before the nations." }
    ]
  },

  // POETRY & WISDOM
  'psalms': {
    motif: "The Messianic King, Sufferer, & Priest",
    summary: "The Psalms constitute the comprehensive hymnal of Christ: His divine sonship (Ps 2), humiliation and piercing (Ps 22), shepherd care (Ps 23), resurrection (Ps 16), and Melchizedekian priesthood (Ps 110).",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 14:18, 22:18", event: "Melchizedek blesses Abraham; patriarchal praise of God Most High", significance: "The primordial royal priesthood celebrated in Psalm 110." },
      { era: "Exodus & Kingdom", reference: "Psalm 2:7, 22:1, 110:1", event: "Davidic psalms: 'You are my Son'; 'My God, my God, why have you forsaken me?'; 'Sit at my right hand'", significance: "The Holy Spirit inspires David to sing the inner life and trials of the Messiah." },
      { era: "Prophets", reference: "Isaiah 55:3, Jeremiah 33:15–17", event: "'I will make with you an everlasting covenant, my steadfast, sure love for David'", significance: "Prophets draw on the Psalms as the blueprint of Messianic salvation." },
      { era: "Gospels", reference: "Luke 24:44, Matthew 22:42–45", event: "Jesus declares all things written about Him in the Psalms must be fulfilled", significance: "Christ interprets His entire passion and triumph through the psalter." },
      { era: "Acts & Epistles", reference: "Acts 2:25–35, Hebrews 1:5–13", event: "Apostles quote Psalms more than any other book to prove Jesus' resurrection and deity", significance: "The Psalms provide the apostolic grammar for the deity and exaltation of Jesus." },
      { era: "Revelation", reference: "Revelation 2:27, 19:15", event: "Christ rules the nations with a rod of iron, fulfilling Psalm 2", significance: "The total subjection of rebellious powers to the exalted King of Glory." }
    ]
  },
  'proverbs': {
    motif: "Christ the Incarnate Wisdom of God",
    summary: "The divine Wisdom personified in Proverbs who was present with God before the creation of the world finds its personal incarnation in Jesus Christ, in whom are hidden all the treasures of wisdom and knowledge.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 1:1, 26", event: "God creates the cosmos in sovereign wisdom and order", significance: "Wisdom as the foundational architectural blueprint of reality." },
      { era: "Exodus & Kingdom", reference: "Proverbs 8:22–31, 9:1–6", event: "Wisdom personified: 'The Lord possessed me at the beginning of His work; come, eat of my bread'", significance: "Wisdom calls simple humans to covenant feast and life." },
      { era: "Prophets", reference: "Isaiah 11:2, Jeremiah 23:5", event: "The Spirit of wisdom and understanding rests upon the Branch of Jesse", significance: "The Messiah is endowed with the fullness of sevenfold divine wisdom." },
      { era: "Gospels", reference: "Luke 2:52, Matthew 11:19", event: "Jesus increases in wisdom and stature; 'Wisdom is justified by her deeds'", significance: "Jesus walks as Wisdom personified, astounding teachers in the temple." },
      { era: "Acts & Epistles", reference: "1 Corinthians 1:24, 30, Colossians 2:2–3", event: "'Christ the power of God and the wisdom of God... who became to us wisdom from God'", significance: "The Cross, foolishness to the world, is the supreme demonstration of divine wisdom." },
      { era: "Revelation", reference: "Revelation 5:12, 7:12", event: "'Worthy is the Lamb who was slain to receive power, wealth, wisdom, and strength'", significance: "Eternal celebration of Christ as the source and summit of all wisdom." }
    ]
  },
  'songofsolomon': {
    motif: "The Heavenly Bridegroom & The Beloved Bride",
    summary: "The intense, joyful covenant love between the Bridegroom and his bride in the Song of Songs portrays the profound spiritual reality of Christ's sacrificial, passionate, and indissoluble love for His Church.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 2:23–24", event: "The creation of woman and institution of holy marriage", significance: "The original paradigm of covenantal two-becoming-one." },
      { era: "Exodus & Kingdom", reference: "Song of Solomon 2:16, 8:6–7", event: "'My beloved is mine, and I am his... love is strong as death, jealousy fierce as the grave'", significance: "The celebrating of exclusive, passionate covenant affection." },
      { era: "Prophets", reference: "Hosea 2:19–20, Isaiah 62:5", event: "'As the bridegroom rejoices over the bride, so shall your God rejoice over you'", significance: "Prophets reveal God's relentless bridal pursuit of His redeemed people." },
      { era: "Gospels", reference: "John 3:29, Matthew 9:15", event: "John the Baptist identifies Jesus as the Bridegroom; disciples feast with the Bridegroom", significance: "The arrival of Christ as the true Suitor who pays the bride-price with His blood." },
      { era: "Acts & Epistles", reference: "Ephesians 5:25–32, 2 Corinthians 11:2", event: "'Christ loved the Church and gave Himself up for her, that He might present her holy and without blemish'", significance: "Apostolic revelation that marital union typifies Christ and the Church." },
      { era: "Revelation", reference: "Revelation 19:7–9, 21:2", event: "The Marriage of the Lamb; the Holy City coming down as a bride adorned for her husband", significance: "The eternal feast and consummation of love between Christ and His redeemed." }
    ]
  },

  // PROPHETS
  'isaiah': {
    motif: "Immanuel, The Branch, & The Suffering Servant",
    summary: "Isaiah provides the Fifth Gospel of the Old Testament: announcing the virgin birth of Immanuel, the worldwide reign of the Prince of Peace, and the substitutionary death and exaltation of the Servant of the Lord.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 3:15, 12:3", event: "Promise of the woman's Seed blessing all families of earth", significance: "The ancient covenant stream channeled directly into Isaiah's visions." },
      { era: "Exodus & Kingdom", reference: "Exodus 6:6, 2 Samuel 7:12–16", event: "The outstretched arm of the Lord and the Davidic dynasty", significance: "God's redemptive power and royal covenant awaiting cosmic fulfillment." },
      { era: "Prophets", reference: "Isaiah 7:14, 9:6, 53:5", event: "Virgin conceives Immanuel; Wonderful Counselor; wounded for our transgressions", significance: "The comprehensive prophetic portrait of the Messiah's person and passion." },
      { era: "Gospels", reference: "Matthew 1:22–23, Luke 4:17–21", event: "Jesus reads Isaiah 61 in Nazareth: 'Today this scripture has been fulfilled in your hearing'", significance: "Jesus inaugurates the acceptable year of the Lord in His own ministry." },
      { era: "Acts & Epistles", reference: "Acts 8:32–35, Romans 10:15–20", event: "Apostles preach the gospel to Jews and Gentiles directly from Isaiah's prophecies", significance: "The theological engine of the apostolic mission to the nations." },
      { era: "Revelation", reference: "Revelation 21:1, 4–5, 22:16", event: "'Behold, I make all things new; the New Heavens and New Earth' (fulfilling Isaiah 65:17)", significance: "Cosmic renewal and eradication of sorrow and death." }
    ]
  },
  'jeremiah': {
    motif: "The Branch of Righteousness & The New Covenant",
    summary: "Amid the smoldering ruins of Jerusalem, Jeremiah proclaims the unconditional promise of the New Covenant: God will write His law upon human hearts, forgive iniquity completely, and remember sin no more.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 17:7", event: "'I will be God to you and to your offspring after you'", significance: "The core covenant formula repeated across redemptive history." },
      { era: "Exodus & Kingdom", reference: "Exodus 24:7–8, Deuteronomy 31:20", event: "The Mosaic Covenant broken by Israel's persistent idolatry", significance: "The failure of external law codes to transform stubborn human hearts." },
      { era: "Prophets", reference: "Jeremiah 31:31–34, 33:15", event: "The New Covenant promised: 'I will put my law within them, and I will write it on their hearts'", significance: "The prophetic turning point from external tablets to interior spiritual life." },
      { era: "Gospels", reference: "Luke 22:20, Matthew 26:28", event: "Jesus at the Last Supper: 'This cup that is poured out for you is the new covenant in my blood'", significance: "Christ seals and inaugurates the Jeremiah covenant at the cross." },
      { era: "Acts & Epistles", reference: "Hebrews 8:6–13, 2 Corinthians 3:3–6", event: "'He makes the first covenant obsolete... ministers of a new covenant of the Spirit, not the letter'", significance: "The definitive exposition that believers live under the grace of the New Covenant." },
      { era: "Revelation", reference: "Revelation 21:3–4", event: "'Behold, the dwelling place of God is with man; He will dwell with them, and they will be His people'", significance: "The complete, eternal realization of the Jeremiah covenant promise." }
    ]
  },
  'daniel': {
    motif: "The Stone Cut Without Hands & The Son of Man",
    summary: "Daniel reveals that earthly pagan empires—Babylon, Persia, Greece, Rome—will crumble before the uncut Stone that becomes a mountain filling the earth, and the Son of Man who receives eternal universal dominion.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 1:28, 49:24", event: "Adam given dominion over creation; God the Shepherd, the Stone of Israel", significance: "The original dominion mandate lost to sin and the beastly realm." },
      { era: "Exodus & Kingdom", reference: "Psalm 2:8–9, 8:4–6", event: "The Son given nations for an inheritance; man crowned with glory and honor", significance: "The promise of a restored human ruler subduing all enemies." },
      { era: "Prophets", reference: "Daniel 2:34–35, 44–45, 7:13–14", event: "The uncut Stone strikes the statue; the Son of Man arrives on the clouds to receive everlasting dominion", significance: "The heavenly Court grants perpetual kingdom rule to the Son of Man." },
      { era: "Gospels", reference: "Matthew 24:30, 26:64, Mark 14:62", event: "Jesus adopts 'Son of Man' as His favorite self-designation before Caiaphas and the disciples", significance: "Jesus claims the divine-human status of the heavenly Ruler in Daniel 7." },
      { era: "Acts & Epistles", reference: "Acts 7:56, 1 Corinthians 15:24–27", event: "Stephen sees the Son of Man standing at God's right hand; Christ reigning over all rule and authority", significance: "The enthronement of the Son of Man recognized in the apostolic proclamation." },
      { era: "Revelation", reference: "Revelation 1:13–16, 11:15", event: "John sees one like the Son of Man; 'The kingdom of the world has become the kingdom of our Lord'", significance: "The complete overthrow of the beast and eternal triumph of the Son of Man." }
    ]
  },
  'jonah': {
    motif: "The Sign of Jonah & Resurrection on the Third Day",
    summary: "Jonah's three days and nights in the belly of the great fish and his subsequent deliverance to preach repentance to the Gentile capital provides the foundational typological sign of Christ's burial and resurrection.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 22:4", event: "On the third day Abraham lifted up his eyes and saw Mount Moriah afar off", significance: "The third day established as the temporal locus of deliverance from death." },
      { era: "Exodus & Kingdom", reference: "Hosea 6:2, 2 Kings 14:25", event: "'On the third day He will raise us up, that we may live before Him'; Jonah son of Amittai", significance: "Prophetic association of the third day with resurrection hope." },
      { era: "Prophets", reference: "Jonah 1:17, 2:1–10", event: "Jonah swallowed by the great fish for three days; 'Salvation belongs to the Lord!'", significance: "A prophet delivered from the gates of Sheol to bring mercy to pagan Gentiles." },
      { era: "Gospels", reference: "Matthew 12:39–40, 16:4", event: "Jesus declares: 'No sign will be given except the sign of Jonah the prophet; for as Jonah was three days and nights...'", significance: "Jesus identifies Jonah's ordeal as the explicit prefiguration of His own burial and resurrection." },
      { era: "Acts & Epistles", reference: "1 Corinthians 15:3–4, Acts 10:40–43", event: "'He was raised on the third day in accordance with the Scriptures'; Gentiles receive forgiveness", significance: "Apostolic gospel preaching grounded in the third-day resurrection and mission to nations." },
      { era: "Revelation", reference: "Revelation 1:18", event: "'I died, and behold I am alive forevermore, and I have the keys of Death and Hades'", significance: "Christ's permanent mastery over the grave and death." }
    ]
  },

  // NEW TESTAMENT GOSPELS & EPISTLES
  'matthew': {
    motif: "The Messiah-King & Fulfillment of All Righteousness",
    summary: "Matthew portrays Jesus as the true Son of David and King of the Jews who fulfills every promise of the Law and Prophets, inaugurates the Kingdom of Heaven, and commissions His disciples to disciple all nations.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 1:1, 12:3", event: "The book of the genealogy of Jesus Christ, son of David, son of Abraham", significance: "Christ shown as the goal of world history and the Abrahamic promise." },
      { era: "Exodus & Kingdom", reference: "Exodus 2:1–10, Hosea 11:1", event: "Moses protected from infanticide; 'Out of Egypt I called my Son'", significance: "Jesus relives and sanctifies the history of Israel as the true Son." },
      { era: "Prophets", reference: "Micah 5:2, Zechariah 9:9", event: "Ruler born in Bethlehem; the King enters Jerusalem humble and riding on a donkey", significance: "Fulfillment of every Old Testament royal and prophetic trajectory." },
      { era: "Gospels", reference: "Matthew 5:17, 28:18–20", event: "'I came not to abolish the Law but to fulfill it'; all authority in heaven and on earth given to Jesus", significance: "The King establishes His Kingdom and issues the Great Commission." },
      { era: "Acts & Epistles", reference: "Acts 2:36, Romans 15:8–9", event: "God has made Him both Lord and Christ; Christ became a servant to confirm the promises to patriarchs", significance: "Apostolic witness that Matthew's King rules over both Jews and Gentiles." },
      { era: "Revelation", reference: "Revelation 17:14, 19:16", event: "King of Kings and Lord of Lords conquering the beast and reigning with His saints", significance: "The final, undisputed cosmic victory of Matthew's Messianic King." }
    ]
  },
  'john': {
    motif: "The Incarnate Logos & The Seven 'I AM' Archetypes",
    summary: "John reveals Jesus as the eternal Word who was with God and was God, manifesting the divine name 'I AM' through seven covenantal signs: Bread of Life, Light of the World, Door, Good Shepherd, Resurrection, Way/Truth/Life, and True Vine.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 1:1, Exodus 3:14", event: "In the beginning; God reveals His memorial name 'I AM WHO I AM'", significance: "The divine identity and self-existence behind all creation." },
      { era: "Exodus & Kingdom", reference: "Exodus 16:4, 25:8, Psalm 23:1", event: "Manna, Tabernacle, Menorah, and the Lord as Shepherd", significance: "Old Testament covenant provisions prefiguring the personal presence of God." },
      { era: "Prophets", reference: "Isaiah 40:3–5, Ezekiel 34:11–16", event: "'Behold your God!'; the Lord God Himself will search for His sheep and seek them out", significance: "Prophets foretell the direct personal visitation of Yahweh." },
      { era: "Gospels", reference: "John 1:1, 14, 8:58", event: "The Word became flesh and tabernacled among us; 'Before Abraham was, I AM'", significance: "Jesus claims the divine ineffable name and unveils the Father's heart." },
      { era: "Acts & Epistles", reference: "Colossians 1:15–19, 1 John 1:1–3", event: "He is the image of the invisible God; that which was from the beginning which we have heard and seen", significance: "Apostolic defense of the full deity and true incarnation of Christ." },
      { era: "Revelation", reference: "Revelation 1:8, 22:13", event: "'I am the Alpha and the Omega, the first and the last, the beginning and the end'", significance: "The eternal Word exalted in glory throughout all eternity." }
    ]
  },
  'romans': {
    motif: "Justification by Faith & The New Humanity in Christ",
    summary: "Romans unpacks the gospel of sovereign grace: all humanity is guilty under sin, but God justifies the ungodly through faith in the propitiatory blood of Christ, creating a unified multiracial body indwelt by the Holy Spirit.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 15:6, Romans 4:3", event: "Abraham believed God, and it was counted to him as righteousness", significance: "Faith established as the sole instrument of justification before circumcision." },
      { era: "Exodus & Kingdom", reference: "Leviticus 16:14, Habakkuk 2:4", event: "The Mercy Seat (hilasterion); 'The righteous shall live by his faith'", significance: "The Old Testament foundation for substitutionary propitiation and faith." },
      { era: "Prophets", reference: "Isaiah 53:11, Jeremiah 31:34", event: "'By His knowledge shall the righteous one, my Servant, make many to be accounted righteous'", significance: "Prophetic promise of imputed righteousness through the Servant." },
      { era: "Gospels", reference: "Luke 18:13–14, Matthew 20:28", event: "The tax collector goes home justified; Christ gives His life as a ransom", significance: "Jesus illustrates justification by mercy and accomplishes the ransom." },
      { era: "Acts & Epistles", reference: "Romans 3:21–26, 5:1, 8:1", event: "'There is therefore now no condemnation for those who are in Christ Jesus'", significance: "The grand theological exposition of justification, adoption, and sanctification." },
      { era: "Revelation", reference: "Revelation 7:9–10, 12:11", event: "The redeemed clothed in white robes; 'They conquered him by the blood of the Lamb'", significance: "The justified community standing faultless before the throne." }
    ]
  },
  'hebrews': {
    motif: "The Superior High Priest & Heavenly Sanctuary",
    summary: "Hebrews demonstrates the absolute supremacy of Jesus Christ over angels, Moses, Joshua, and the Aaronic priesthood, presenting Him as the eternal Melchizedekian Priest who entered the heavenly Holy of Holies with His own blood.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 14:18–20", event: "Melchizedek priest of God Most High brings bread and wine and blesses Abraham", significance: "The royal, eternal priesthood superior to the Levitical order." },
      { era: "Exodus & Kingdom", reference: "Exodus 25:9, 40, Psalm 110:4", event: "Tabernacle constructed after the heavenly pattern; 'You are a priest forever after the order of Melchizedek'", significance: "The earthly sanctuary acknowledged as a shadow of the true heavenly reality." },
      { era: "Prophets", reference: "Jeremiah 31:31–34, Zechariah 6:13", event: "The New Covenant promised; the Priest-King sitting upon His throne", significance: "Prophets foresee the union of royalty and priesthood in the Messiah." },
      { era: "Gospels", reference: "Matthew 27:50–51, Mark 14:24", event: "Jesus yields up His spirit; the temple veil splits from top to bottom", significance: "The end of physical Levitical barriers; entrance into God's presence opened." },
      { era: "Acts & Epistles", reference: "Hebrews 4:14–16, 9:24, 10:19–22", event: "'Let us then with confidence draw near to the throne of grace'; entered into heaven itself", significance: "Christ's ongoing intercession as our sympathetic, flawless High Priest." },
      { era: "Revelation", reference: "Revelation 1:13, 8:3–4", event: "Christ in high priestly garments; incense of the prayers of the saints rising before God", significance: "The permanent heavenly mediation of the Great High Priest." }
    ]
  },
  'revelation': {
    motif: "The Slain Lamb & The New Jerusalem",
    summary: "Revelation draws every thread of the biblical tapestry to its glorious consummation: the Lamb that was slain defeats the dragon and beast, wipes away every tear, and dwells perpetually with His redeemed Bride in the New Heavens and New Earth.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 1:1, 2:8–14, 3:24", event: "Eden the garden of God, Tree of Life, and the river flowing to water the earth", significance: "The original sanctuary and communion lost at the Fall." },
      { era: "Exodus & Kingdom", reference: "Exodus 19:6, 25:8, Ezekiel 40–48", event: "Kingdom of priests, Tabernacle of dwelling, and Ezekiel's vision of the cosmic temple", significance: "The OT types of divine indwelling, priesthood, and cosmic order." },
      { era: "Prophets", reference: "Isaiah 25:8, 65:17, Daniel 7:14", event: "'He will swallow up death forever'; New Heavens and Earth; everlasting dominion", significance: "Prophetic longing for the total eradication of curse, grief, and death." },
      { era: "Gospels", reference: "John 14:2–3, 19:30", event: "'I go to prepare a place for you'; 'It is finished!' on the cross", significance: "The purchase of the New Jerusalem accomplished through Christ's sacrifice." },
      { era: "Acts & Epistles", reference: "2 Peter 3:13, Hebrews 11:10, 16", event: "Waiting for new heavens and a new earth; looking forward to the city with foundations", significance: "The Church's pilgrim posture anchored in the heavenly city." },
      { era: "Revelation", reference: "Revelation 21:1–5, 22:1–5", event: "The New Jerusalem descends; God dwells with man; Tree of Life yields fruit every month; no more curse", significance: "The eternal, ecstatic consummation of all redemptive history in the presence of the Lamb." }
    ]
  },

  // DEUTEROCANONICAL BOOKS (CATHOLIC & ORTHODOX CANON)
  'tobit': {
    motif: "The Archangel Raphael & The Restorer of Sight",
    summary: "Raphael ('God heals') delivering Sarah from demonic oppression and restoring the blind Tobit's eyes prefigures Christ the Divine Physician who drives out demonic powers, frees His Bride, and opens the eyes of the spiritually blind.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 24:7, 40", event: "Abraham's servant guided by God's angel to find a holy bride", significance: "Angelic providence orchestrating covenant matrimony and blessing." },
      { era: "Exodus & Kingdom", reference: "Exodus 23:20–21, Psalm 146:8", event: "'Behold, I send an angel before you'; 'The Lord opens the eyes of the blind'", significance: "Divine guardianship on the pilgrim way and God as the sole restorer of vision." },
      { era: "Prophets", reference: "Isaiah 35:5, 42:7", event: "Then the eyes of the blind shall be opened, to bring out prisoners from the dungeon", significance: "Prophecy of Messianic healing and deliverance from demonic gloom." },
      { era: "Gospels", reference: "John 9:1–7, Luke 4:18", event: "Jesus anoints the blind man's eyes; proclaiming liberty to captives and sight to the blind", significance: "Christ personally fulfills the healing and deliverance archetypes of Tobit." },
      { era: "Acts & Epistles", reference: "Acts 9:18, Hebrews 1:14", event: "Something like scales fell from Saul's eyes; angels as ministering spirits sent to serve", significance: "The Holy Spirit removing spiritual blindness and angelic aid for the heirs of salvation." },
      { era: "Revelation", reference: "Revelation 3:18, 21:4", event: "'Anoint your eyes with salve that you may see'; God wipes every tear, and death shall be no more", significance: "Permanent spiritual vision in the unhindered glory of the New Jerusalem." }
    ]
  },
  'judith': {
    motif: "The Woman Crushing the Adversary",
    summary: "Judith descending into the Assyrian camp and beheading Holofernes to deliver the besieged city of God fulfills the Genesis 3:15 archetype of the woman crushing the serpent's head, prefiguring Our Lady and the triumphant Church.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 3:15", event: "The Protoevangelium: The Seed of the woman shall bruise the serpent's head", significance: "The primordial promise of victory over evil wrought through the woman." },
      { era: "Exodus & Kingdom", reference: "Judges 4:21–22, 5:24–27", event: "Jael strikes Sisera's temple with the tent peg; Deborah sings 'Most blessed of women be Jael'", significance: "Old Testament historical prefiguration of deliverance wrought by a woman's hand." },
      { era: "Prophets", reference: "Micah 4:10, Zechariah 9:9", event: "Daughter of Zion delivers her people; rejoice greatly, daughter of Jerusalem", significance: "Prophetic celebration of Zion's triumph over hostile pagan empires." },
      { era: "Gospels", reference: "Luke 1:41–42, 48", event: "Elizabeth cries: 'Blessed are you among women!'; Mary's Magnificat: 'He has cast down the mighty'", significance: "The archetype fulfilled in Mary's fiat and Christ's incarnation." },
      { era: "Acts & Epistles", reference: "Romans 16:20, 1 Corinthians 15:57", event: "'The God of peace will soon crush Satan under your feet'; victory through our Lord Jesus Christ", significance: "The Church participating in Christ's victory over the principalities of darkness." },
      { era: "Revelation", reference: "Revelation 12:1–5, 11", event: "The Woman clothed with the sun defeats the great dragon by the blood of the Lamb", significance: "Cosmic vindication of the woman and her seed over the ancient serpent." }
    ]
  },
  'wisdom': {
    motif: "The Suffering Just Man & The Reflection of Eternal Light",
    summary: "Wisdom 2:12–20 prophetically delineates the condemnation and shameful death of the righteous Son of God, while Wisdom 7 presents Christ as the unblemished reflection of eternal light and mirror of God's power.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 4:8, 37:20", event: "Righteous Abel slain; Joseph plotted against: 'Let us see what will become of his dreams'", significance: "The conspiracy of the ungodly against the righteous firstborn." },
      { era: "Exodus & Kingdom", reference: "Psalm 22:7–8, 34:19–20", event: "'He trusted in the Lord, let Him deliver him; He keeps all his bones, not one is broken'", significance: "The righteous sufferer surrounded by mocks yet preserved by God." },
      { era: "Prophets", reference: "Wisdom 2:18–20, Isaiah 53:3–7", event: "'If the righteous man is God's son, He will help him; let us condemn him to a shameful death'", significance: "The striking pre-Christian prophecy of the trial and execution of the Son of God." },
      { era: "Gospels", reference: "Matthew 27:43, John 8:12", event: "Priests mock at the cross: 'He trusted in God; let Him deliver Him now if He desires Him'; 'I am the Light'", significance: "Verbatim fulfillment of Wisdom 2 at the crucifixion of Jesus." },
      { era: "Acts & Epistles", reference: "Hebrews 1:3, Colossians 1:15", event: "Christ is the radiance of God's glory, the exact imprint of His nature, the image of the invisible God", significance: "Apostolic adoption of Wisdom 7:26 language to define the eternal deity of Christ." },
      { era: "Revelation", reference: "Revelation 21:23, 22:5", event: "The Lamb is the lamp of the city; the Lord God will be their eternal light", significance: "Uncreated divine light banishing darkness and death forever." }
    ]
  },
  'sirach': {
    motif: "Incarnate Wisdom Tabernacling in Zion",
    summary: "Sirach 24 presents eternal Wisdom descending from heaven to pitch her tent in Jacob and minister in the sanctuary, providing the direct Old Testament foundation for John 1:14 ('The Word became flesh and tabernacled among us').",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 1:1–3, Proverbs 8:22–31", event: "Wisdom present before the foundation of the world, rejoicing in the inhabited world", significance: "Cosmic pre-existence of divine Wisdom as master craftsman." },
      { era: "Exodus & Kingdom", reference: "Sirach 24:8–10, Exodus 40:34–35", event: "'The Creator commanded me: Make your dwelling in Jacob; in the holy tent I ministered before Him'", significance: "Wisdom choosing Israel as her earthly sanctuary and dwelling place." },
      { era: "Prophets", reference: "Isaiah 2:2–3, Micah 4:2", event: "The word of the Lord going forth from Jerusalem; nations stream to the mountain of the Lord", significance: "Zion as the global fountain of divine instruction." },
      { era: "Gospels", reference: "John 1:14, Matthew 11:28–30", event: "'The Word became flesh and dwelt (tabernacled) among us; Come to me, take my yoke upon you'", significance: "Jesus identifies Himself as Wisdom Incarnate tabernacling among humanity." },
      { era: "Acts & Epistles", reference: "1 Corinthians 1:30, Colossians 2:3", event: "Christ who became to us wisdom from God; in Him are hidden all treasures of wisdom", significance: "Wisdom located fully and personally in the crucified and risen Christ." },
      { era: "Revelation", reference: "Revelation 21:3, 22:1–2", event: "'Behold, the dwelling place of God is with man'; the River of the Water of Life flowing from the throne", significance: "The eternal dwelling of divine Wisdom with redeemed humanity in the New Jerusalem." }
    ]
  },
  'baruch': {
    motif: "God Manifest on Earth & The Ingathering of Exiles",
    summary: "Baruch 3:37 declares that divine Wisdom 'appeared upon earth and lived among men,' recognized by early Church Fathers (Irenaeus, Athanasius) as an explicit prophecy of the Incarnation and restoration of the true Jerusalem.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 18:1–3, 28:13–15", event: "The Lord visits Abraham at Mamre; covenant promise to gather Jacob's descendants", significance: "Early manifestations of God walking and speaking with the patriarchs." },
      { era: "Exodus & Kingdom", reference: "Exodus 24:9–11, Psalm 147:2", event: "The elders behold the God of Israel and eat and drink; the Lord gathers the outcasts", significance: "Covenant fellowship with God and hope of gathering the dispersed." },
      { era: "Prophets", reference: "Baruch 3:35–37, 4:36–37", event: "'This is our God; afterward He appeared upon earth and lived among men; look toward the east, O Jerusalem'", significance: "The prophecy of God walking visibly on earth and summoning His exiled children." },
      { era: "Gospels", reference: "John 1:14, 1 Timothy 3:16", event: "Great is the mystery of godliness: God was manifested in the flesh, seen of angels, preached unto Gentiles", significance: "The literal fulfillment: God takes on human nature and walks among us." },
      { era: "Acts & Epistles", reference: "Acts 2:5–11, Galatians 4:26", event: "Jews from every nation under heaven hear the gospel; the heavenly Jerusalem is the mother of us all", significance: "The gathering of the worldwide exile into the spiritual communion of the Church." },
      { era: "Revelation", reference: "Revelation 21:2, 10–12", event: "The Holy City Jerusalem descending from heaven, having twelve gates named after the twelve tribes", significance: "The total and eternal gathering of all God's children in the New Jerusalem." }
    ]
  },
  '1maccabees': {
    motif: "Hanukkah (Feast of Dedication) & Consecration of the Altar",
    summary: "Judas Maccabeus purifying the sanctuary after its desecration and instituting the eight-day Feast of Dedication in 1 Maccabees 4 points forward to Jesus walking in Solomon's Porch at Hanukkah, declaring Himself the consecrated Temple of God.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 8:20, 12:7", event: "Noah's altar after the flood; Abraham's altar at Shechem", significance: "The establishment of clean, unpolluted altars of worship." },
      { era: "Exodus & Kingdom", reference: "Exodus 29:36–37, 1 Kings 8:63–65", event: "The seven-day altar consecration and Solomon's fourteen-day feast of temple dedication", significance: "The historical standards for consecrating the dwelling place of God's presence." },
      { era: "Prophets", reference: "Malachi 3:1–3, Daniel 8:13–14", event: "The Lord will suddenly come to His temple, purifying the sons of Levi; the sanctuary cleansed", significance: "Prophecy of the ultimate purification of sacrificial worship." },
      { era: "Gospels", reference: "John 10:22–30, 2:19–21", event: "At the Feast of Dedication (Hanukkah) in Jerusalem, Jesus declares: 'I and the Father are one'", significance: "Jesus reveals His consecrated divine person as the true Temple and altar." },
      { era: "Acts & Epistles", reference: "Hebrews 13:10, 1 Corinthians 3:16–17", event: "'We have an altar from which those who serve the tent have no right to eat; you are God's temple'", significance: "The Church as the purified spiritual sanctuary offering sacrifices of praise." },
      { era: "Revelation", reference: "Revelation 8:3–5, 11:1", event: "The golden altar before the throne; measuring the temple of God and the altar", significance: "The eternal, indestructible sanctuary of God in celestial glory." }
    ]
  },
  '2maccabees': {
    motif: "The Seven Holy Martyrs & Bodily Resurrection",
    summary: "The martyrdom of the seven brothers and their mother in 2 Maccabees 7 provides the supreme Old Testament confession of bodily resurrection and fidelity under torture, cited directly in Hebrews 11:35 ('others were tortured, not accepting deliverance, that they might obtain a better resurrection').",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 22:8–10, Job 19:25–27", event: "Abraham trusting God can raise the dead; Job: 'In my flesh I shall see God'", significance: "Patriarchal faith in the bodily vindication of the righteous." },
      { era: "Exodus & Kingdom", reference: "Psalm 16:9–11, Daniel 12:2–3", event: "'You will not abandon my soul to Sheol; many who sleep in the dust of the earth shall awake'", significance: "The promise that God will not allow His holy ones to see final corruption." },
      { era: "Prophets", reference: "2 Maccabees 7:9, 14, 23, Isaiah 26:19", event: "'The King of the universe will raise us up to an everlasting renewal of life, because we have died for His laws'", significance: "The heroic martyr confession that God will restore both breath and limbs in the resurrection." },
      { era: "Gospels", reference: "John 11:25–26, Matthew 22:31–32", event: "Jesus declares: 'I am the Resurrection and the Life'; God is not the God of the dead, but of the living", significance: "Christ embodies and validates the resurrection hope of the martyrs." },
      { era: "Acts & Epistles", reference: "Hebrews 11:35, 1 Corinthians 15:51–57", event: "'Others were tortured, refusing to accept release, so that they might rise again to a better life'", significance: "Apostolic canonization of the Maccabean martyrs as exemplars of faith." },
      { era: "Revelation", reference: "Revelation 6:9–11, 20:4–6", event: "Souls under the altar slain for the word of God; they came to life and reigned with Christ (the first resurrection)", significance: "The final coronation and eternal victory of all faithful martyrs." }
    ]
  }
};

// 3. GENRE/CORPUS-LEVEL TYPOLOGY HASHMAP (Universal Fallback)
export const TYPOLOGY_GENRE_HASHMAP: Record<string, TypologyMotif> = {
  'gospels': {
    motif: "The Kingdom & The True King",
    summary: "From the Davidic dynasty and royal psalms to the suffering servant-king on the cross and the enthroned Son of Man, Scripture unveils Jesus as the eternal Sovereign of God's unshakable kingdom.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 14:18, 49:10", event: "Melchizedek king of Salem; the scepter shall not depart from Judah", significance: "The royal lineage of the Messiah foreshadowed before Israel had an earthly king." },
      { era: "Exodus & Kingdom", reference: "2 Samuel 7:12–16, Psalm 2:6–8", event: "God's covenant with David: an eternal throne and dominion", significance: "Davidic kingship established as the permanent vessel for the Messianic kingdom." },
      { era: "Prophets", reference: "Isaiah 9:6–7, Daniel 7:13–14", event: "Of the increase of His government there will be no end; the Son of Man given everlasting dominion", significance: "Prophets announce a divine King whose rule breaks the beastly empires of this world." },
      { era: "Gospels", reference: "Mark 1:14–15, John 18:36–37", event: "Jesus proclaims 'The kingdom of God is at hand'; crowned with thorns as King of Kings", significance: "Christ inaugurates the kingdom through humility, suffering, and resurrection triumph." },
      { era: "Acts & Epistles", reference: "Acts 2:30–36, 1 Corinthians 15:24–25", event: "The exalted Christ seated at God's right hand until all enemies are under His feet", significance: "The Church proclaims the Lordship of Jesus across every earthly nation and empire." },
      { era: "Revelation", reference: "Revelation 11:15, 19:16", event: "'The kingdom of the world has become the kingdom of our Lord and of His Christ'", significance: "The complete, unquestioned manifestation of Christ's sovereignty throughout all creation." }
    ]
  },
  'epistles': {
    motif: "The Covenant People & Justification by Grace",
    summary: "Tracing God's promise to justify the ungodly through faith from Abraham's reckoning to Christ's blood and the glorified saints assembled before God's throne.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 15:6", event: "Abraham believed the Lord, and He counted it to him as righteousness", significance: "Faith, not ceremonial works, established as the sole instrument of justification." },
      { era: "Exodus & Kingdom", reference: "Exodus 19:5–6, Leviticus 17:11", event: "Blood of the covenant; life of the flesh in the blood for atonement", significance: "Divine holiness demands satisfaction, prefiguring the cross." },
      { era: "Prophets", reference: "Habakkuk 2:4, Jeremiah 31:33–34", event: "'The righteous shall live by his faith'; God writes His law on hearts", significance: "The prophetic witness that inner righteousness comes from God's sovereign covenant initiative." },
      { era: "Gospels", reference: "Luke 18:14, Matthew 26:28", event: "The tax collector justified by mercy; Christ's blood poured out for forgiveness", significance: "Jesus fulfills the law and offers His life as the ransom for the many." },
      { era: "Acts & Epistles", reference: "Romans 3:21–26, Galatians 2:16–21", event: "Righteousness of God through faith in Jesus Christ for all who believe", significance: "Justification by faith alone through grace alone in Christ alone, creating a unified multiracial body." },
      { era: "Revelation", reference: "Revelation 7:9–14", event: "A great multitude clothed in white robes washed in the blood of the Lamb", significance: "The justified church stands victorious in the celestial presence of God forever." }
    ]
  },
  'torah': {
    motif: "The Holy Sanctuary & Divine Dwelling",
    summary: "From Eden the primordial sanctuary to the wilderness tabernacle, Solomon's temple, and the New Jerusalem, God's eternal design is to dwell in unbroken fellowship with His redeemed people.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 2:8–15, 3:8", event: "God walks with Adam in Eden, the original sanctuary of communion", significance: "Creation designed as a cosmic temple where God and humanity dwell in harmony." },
      { era: "Exodus & Kingdom", reference: "Exodus 25:8, 40:34–35", event: "'Let them make me a sanctuary, that I may dwell in their midst'", significance: "The Tabernacle provides a mediated way for a holy God to travel with sinful people." },
      { era: "Prophets", reference: "Ezekiel 47:1–12, Haggai 2:7–9", event: "Life-giving river flowing from the temple; the glory of the latter house shall be greater", significance: "Prophets envision a restored cosmic sanctuary healing all nations." },
      { era: "Gospels", reference: "John 1:14, 2:19–21", event: "The Word became flesh and tabernacled among us; 'Destroy this temple, in three days I will raise it'", significance: "Jesus Christ is the true Temple where divine holiness and human life meet." },
      { era: "Acts & Epistles", reference: "1 Corinthians 3:16–17, Ephesians 2:19–22", event: "The Church as the living temple of the Holy Spirit built on Christ the cornerstone", significance: "Believers are living stones in whom God dwells by His Spirit." },
      { era: "Revelation", reference: "Revelation 21:3, 22", event: "'The dwelling place of God is with man... I saw no temple, for the Lord God and the Lamb are its temple'", significance: "The entire new creation becomes the Holy of Holies, radiant with the glory of God." }
    ]
  },
  'wisdom': {
    motif: "The Suffering Righteous One & True Wisdom",
    summary: "From Job's trials and the laments of the Psalms to Christ crucified—the wisdom of God—the righteous sufferer finds ultimate vindication in the resurrection.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Job 19:25–27, Genesis 4:8–10", event: "'I know that my Redeemer lives'; Abel's innocent blood cries from the ground", significance: "Faith in divine vindication and resurrection amidst inexplicable suffering." },
      { era: "Exodus & Kingdom", reference: "Psalm 22:1–18, Proverbs 8:22–31", event: "'My God, my God, why have you forsaken me?'; Divine Wisdom rejoicing in creation", significance: "David's prophetic laments articulate the precise agonies of the crucifixion." },
      { era: "Prophets", reference: "Isaiah 53:3–11, Zechariah 12:10", event: "A Man of Sorrows, acquainted with grief; they look on Him whom they pierced", significance: "The suffering of the righteous one is revealed to be vicarious and atoning." },
      { era: "Gospels", reference: "Matthew 27:46, 1 Corinthians 1:23–24", event: "Jesus cries Psalm 22 from the cross; Christ crucified as the wisdom of God", significance: "The supreme display of divine wisdom through apparent weakness and death." },
      { era: "Acts & Epistles", reference: "1 Peter 2:21–25, Colossians 2:3", event: "Christ suffered for you, leaving an example; in Him are hidden all treasures of wisdom", significance: "Believers share in Christ's sufferings, knowing that eternal glory follows." },
      { era: "Revelation", reference: "Revelation 5:9–12", event: "'Worthy is the Lamb who was slain, to receive power and wealth and wisdom and might'", significance: "The once-suffering Servant receives cosmic acclaim as the source of all wisdom." }
    ]
  },
  'prophets': {
    motif: "The Day of the Lord & The Anointed Deliverer",
    summary: "The prophetic corpus looks beyond near-term judgments to the cosmic Day of the Lord, where evil is judged, a righteous Branch redeems the nations, and God pours out His Spirit on all flesh.",
    nodes: [
      { era: "Creation & Patriarchs", reference: "Genesis 12:3, 49:10", event: "Blessing to all nations and the scepter of Shiloh", significance: "The covenant mandate the prophets were sent to enforce and announce." },
      { era: "Exodus & Kingdom", reference: "Exodus 19:16–19, 2 Samuel 7:16", event: "Sinai's trumpet and the everlasting covenant with David", significance: "The historical standards of righteousness and royal hope." },
      { era: "Prophets", reference: "Joel 2:28–32, Zechariah 9:9, Malachi 4:2", event: "The Spirit poured on all flesh; the King comes humble on a colt; Sun of Righteousness", significance: "The prophetic horizon uniting judgment and worldwide restoration." },
      { era: "Gospels", reference: "Luke 4:18–21, Matthew 12:18–21", event: "Jesus proclaims the Spirit of the Lord is upon Him; preaching good news to the poor", significance: "The active presence of the Messianic era in Jesus' words and deeds." },
      { era: "Acts & Epistles", reference: "Acts 2:16–21, 2 Thessalonians 1:7–10", event: "Peter cites Joel on Pentecost; looking forward to the glorious manifestation of Christ", significance: "The Church living in the 'last days' inaugurated by the Spirit." },
      { era: "Revelation", reference: "Revelation 6:17, 19:11–16", event: "'The great day of their wrath has come'; the King strikes down the nations in justice", significance: "The final consummation of the Day of the Lord in the return of Christ." }
    ]
  }
};

/**
 * Normalizes book names and handles Deuterocanonical aliases to match hashmap keys.
 */
function normalizeBookKey(bookName: string): string {
  const clean = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'wisdomofsolomon') return 'wisdom';
  if (clean === 'ecclesiasticus') return 'sirach';
  if (clean === '1ma' || clean === '1mac' || clean === '1macc') return '1maccabees';
  if (clean === '2ma' || clean === '2mac' || clean === '2macc') return '2maccabees';
  return clean;
}

/**
 * Resolves the book genre to look up in the genre hashmap.
 */
function getGenreForBook(bookName: string): string {
  const norm = normalizeBookKey(bookName);
  if (['matthew', 'mark', 'luke', 'john', 'acts'].includes(norm)) return 'gospels';
  if (['romans', '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', '1thessalonians', '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon', 'hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john', 'jude'].includes(norm)) return 'epistles';
  if (['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'].includes(norm)) return 'torah';
  if (['psalms', 'psalm', 'proverbs', 'job', 'ecclesiastes', 'songofsolomon', 'songofsongs', 'wisdom', 'sirach'].includes(norm)) return 'wisdom';
  if (['isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi', 'baruch'].includes(norm)) return 'prophets';
  if (['tobit', 'judith', '1maccabees', '2maccabees'].includes(norm)) return 'torah';
  return 'gospels';
}

/**
 * Instantaneous O(1) canonical typology lookup for every chapter of every book.
 * 1. Checks specific chapter in comprehensive 1,189-chapter hashmap
 * 2. Checks canonical book-by-book hashmap
 * 3. Falls back to corpus genre hashmap
 */
export function getTypologyFromDatabase(passageRef: string, excludeMotif?: string): TypologyMotif {
  const clean = passageRef.trim().toLowerCase();
  
  // Try several canonical key variations (e.g. 'genesis_14', '1_samuel_3', '1samuel_3')
  const keysToTry = [
    clean.replace(/[^a-z0-9]+/g, '_'),
    clean.replace(/^([0-9])\s+/, '').replace(/[^a-z0-9]+/g, '_')
  ];

  for (const k of keysToTry) {
    const chapterMatches = TYPOLOGY_CHAPTER_HASHMAP[k];
    if (chapterMatches && chapterMatches.length > 0) {
      if (excludeMotif) {
        const alt = chapterMatches.find(m => m.motif.toLowerCase() !== excludeMotif.toLowerCase());
        if (alt) return alt;
      }
      return chapterMatches[0];
    }
  }

  // 2. Direct canonical book-level match in O(1) hashmap
  const bookName = passageRef.trim().split(/\s+/)[0] || '';
  const normBook = normalizeBookKey(bookName);
  const bookMatch = TYPOLOGY_BOOK_HASHMAP[normBook];
  if (bookMatch) {
    return bookMatch;
  }

  // 3. Corpus genre fallback
  const genre = getGenreForBook(bookName);
  return TYPOLOGY_GENRE_HASHMAP[genre] || TYPOLOGY_GENRE_HASHMAP['gospels'];
}
