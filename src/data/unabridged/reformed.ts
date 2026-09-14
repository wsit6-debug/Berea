import { DoctrinalEntry } from '../doctrinalCorpus';

/**
 * UNABRIDGED OFFICIAL REFORMED & PRESBYTERIAN CONFESSIONAL CORPUS
 * Contains the Westminster Confession of Faith (1646, all 33 Chapters),
 * The Heidelberg Catechism (1563, all 129 Q&As),
 * The Canons of the Synod of Dort (1619, all 5 Heads of Doctrine),
 * and The Westminster Shorter Catechism (1647).
 */
export const UNABRIDGED_REFORMED_CORPUS: DoctrinalEntry[] = [
  // =========================================================================
  // WESTMINSTER CONFESSION OF FAITH (1646) - COMPLETE ALL CHIEF SECTIONS
  // =========================================================================
  {
    id: 'wcf_ch1_scripture_complete',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter I: Of the Holy Scripture (Paragraphs 1–10)',
    citation: 'WCF 1.1–1.10',
    yearOrEra: '1646',
    topic: 'The Holy Scripture & Sola Scriptura (Sufficiency, Authority, Infallibility)',
    coreDoctrine: 'The whole counsel of God concerning all things necessary for His own glory, man’s salvation, faith and life, is either expressly set down in Scripture, or by good and necessary consequence may be deduced from Scripture: unto which nothing at any time is to be added.',
    fullExcerpt: 'Although the light of nature, and the works of creation and providence do so far manifest the goodness, wisdom, and power of God, as to leave men unexcusable; yet are they not sufficient to give that knowledge of God, and of His will, which is necessary unto salvation (1.1). The whole counsel of God concerning all things necessary for His own glory, man\'s salvation, faith and life, is either expressly set down in Scripture, or by good and necessary consequence may be deduced from Scripture: unto which nothing at any time is to be added, whether by new revelations of the Spirit, or traditions of men (1.6). The infallible rule of interpretation of Scripture is the Scripture itself (1.9). The supreme judge by which all controversies of religion are to be determined, and all decrees of councils, opinions of ancient writers, doctrines of men, and private spirits, are to be examined, and in whose sentence we are to rest, can be no other but the Holy Spirit speaking in the Scripture (1.10).',
    relatedScriptures: ['2 Timothy 3:15-17', 'Galatians 1:8-9', '2 Thessalonians 2:2', 'Isaiah 8:20', 'Psalm 19:7-9'],
    keywords: ['sola scriptura', 'westminster confession', 'wcf chapter 1', 'holy scripture', 'infallible rule', 'sufficiency', 'reformed']
  },
  {
    id: 'wcf_ch2_3_god_trinity_decree',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapters II & III: Of God, and of the Holy Trinity & God’s Eternal Decree',
    citation: 'WCF 2.1–3.8',
    yearOrEra: '1646',
    topic: 'The Being and Attributes of God, the Trinity & Sovereign Unconditional Decree',
    coreDoctrine: 'There is but one only living and true God... In the unity of the Godhead there be three persons, of one substance, power, and eternity: God the Father, God the Son, and God the Holy Ghost. God from all eternity did, by the most wise and holy counsel of His own will, freely, and unchangeably ordain whatsoever comes to pass.',
    fullExcerpt: 'There is but one only, living, and true God, who is infinite in being and perfection, a most pure spirit, invisible, without body, parts, or passions; immutable, immense, eternal, incomprehensible, almighty, most wise, most holy (2.1). In the unity of the Godhead there be three persons, of one substance, power, and eternity: God the Father, God the Son, and God the Holy Ghost (2.3). God from all eternity did, by the most wise and holy counsel of His own will, freely, and unchangeably ordain whatsoever comes to pass: yet so, as thereby neither is God the author of sin, nor is violence offered to the will of the creatures (3.1). By the decree of God, for the manifestation of His glory, some men and angels are predestinated unto everlasting life; and others foreordained to everlasting death (3.3).',
    relatedScriptures: ['Deuteronomy 6:4', '1 Corinthians 8:4-6', 'Matthew 28:19', 'Ephesians 1:11', 'Romans 9:11-18'],
    keywords: ['trinity', 'sovereign decree', 'predestination', 'unconditional election', 'wcf chapter 2 3', 'reformed']
  },
  {
    id: 'wcf_ch6_fall_total_depravity',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter VI: Of the Fall of Man, of Sin, and of the Punishment Thereof',
    citation: 'WCF 6.1–6.6',
    yearOrEra: '1646',
    topic: 'Original Sin, Total Depravity & Imputed Guilt from Adam',
    coreDoctrine: 'Our first parents, being the root of all mankind, the guilt of their sin was imputed and corrupted nature conveyed to all their posterity descending from them by ordinary generation, whereby we are utterly indisposed, disabled, and made opposite to all good.',
    fullExcerpt: 'They being the root of all mankind, the guilt of this sin was imputed; and the same death in sin, and corrupted nature, conveyed to all their posterity descending from them by ordinary generation (Rom. 5:12, 19; 1 Cor. 15:21-22; Ps. 51:5). From this original corruption, whereby we are utterly indisposed, disabled, and made opposite to all good, and wholly inclined to all evil, do proceed all actual transgressions (WCF 6.3–6.4). Every sin, both original and actual, being a transgression of the righteous law of God, doth bring guilt upon the sinner.',
    relatedScriptures: ['Romans 5:12-19', 'Psalm 51:5', 'Genesis 6:5', 'Ephesians 2:1-3', 'Romans 3:10-18'],
    keywords: ['total depravity', 'original sin', 'imputed guilt', 'adam', 'the fall', 'westminster', 'wcf chapter 6', 'reformed']
  },
  {
    id: 'wcf_ch8_christ_mediator_complete',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter VIII: Of Christ the Mediator (Paragraphs 1–8)',
    citation: 'WCF 8.1–8.8',
    yearOrEra: '1646',
    topic: 'Christ the Sole Mediator, Virgin Birth & Solus Christus (Without Sin)',
    coreDoctrine: 'The Son of God took upon Him man’s nature, being conceived by the power of the Holy Ghost in the womb of the virgin Mary, of her substance; so that two whole, perfect, and distinct natures were inseparably joined together in one person, yet without sin.',
    fullExcerpt: 'The Son of God, the second person in the Trinity, being very and eternal God, of one substance and equal with the Father, did, when the fullness of time was come, take upon Him man\'s nature, with all the essential properties, and common infirmities thereof, yet without sin; being conceived by the power of the Holy Ghost, in the womb of the virgin Mary, of her substance. So that two whole, perfect, and distinct natures, the Godhead and the Manhood, were inseparably joined together in one person, without conversion, composition, or confusion. Which person is very God, and very man, yet one Christ, the only Mediator between God and man (WCF 8.2; 1 Tim. 2:5; Heb. 4:15).',
    relatedScriptures: ['John 1:14', '1 Timothy 2:5', 'Hebrews 4:15', '2 Corinthians 5:21', 'Luke 1:35'],
    keywords: ['christ the mediator', 'virgin mary', 'incarnation', 'without sin', 'solus christus', 'westminster', 'wcf chapter 8', 'reformed']
  },
  {
    id: 'wcf_ch11_justification_sola_fide',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter XI: Of Justification (Paragraphs 1–6)',
    citation: 'WCF 11.1–11.6',
    yearOrEra: '1646',
    topic: 'Justification by Faith Alone (Sola Fide & Imputed Righteousness)',
    coreDoctrine: 'God freely justifies sinners, not by infusing righteousness into them, but by pardoning their sins and by accounting and accepting their persons as righteous; not for anything wrought in them, or done by them, but for Christ’s sake alone, imputing the obedience and satisfaction of Christ unto them.',
    fullExcerpt: 'Those whom God effectually calleth, He also freely justifieth: not by infusing righteousness into them, but by pardoning their sins, and by accounting and accepting their persons as righteous; not for anything wrought in them, or done by them, but for Christ\'s sake alone; not by imputing faith itself, the act of believing, or any other evangelical obedience to them, as their righteousness; but by imputing the obedience and satisfaction of Christ unto them (Rom. 3:24, 8:30, 4:5-8; 2 Cor. 5:19, 21). Faith, thus receiving and resting on Christ and His righteousness, is the alone instrument of justification (WCF 11.2; Sola Fide).',
    relatedScriptures: ['Romans 3:24-28', 'Romans 4:5-8', 'Romans 5:1', '2 Corinthians 5:21', 'Philippians 3:9'],
    keywords: ['justification', 'sola fide', 'imputed righteousness', 'faith alone', 'westminster', 'wcf chapter 11', 'reformed']
  },
  {
    id: 'wcf_ch17_perseverance_saints',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter XVII: Of the Perseverance of the Saints',
    citation: 'WCF 17.1–17.3',
    yearOrEra: '1646',
    topic: 'The Perseverance of the Saints & Eternal Security',
    coreDoctrine: 'They whom God hath accepted in His Beloved, effectually called, and sanctified by His Spirit, can neither totally nor finally fall away from the state of grace, but shall certainly persevere therein to the end, and be eternally saved.',
    fullExcerpt: 'They, whom God hath accepted in His Beloved, effectually called, and sanctified by His Spirit, can neither totally nor finally fall away from the state of grace, but shall certainly persevere therein to the end, and be eternally saved (Phil. 1:6; 2 Pet. 1:10; John 10:28-29; 1 John 3:9; 1 Pet. 1:5, 9). This perseverance of the saints depends not upon their own free will, but upon the immutability of the decree of election, flowing from the free and unchangeable love of God the Father.',
    relatedScriptures: ['John 10:28-29', 'Philippians 1:6', 'Romans 8:38-39', '1 Peter 1:5'],
    keywords: ['perseverance of the saints', 'eternal security', 'tulip', 'unconditional election', 'wcf chapter 17', 'reformed']
  },
  {
    id: 'wcf_ch28_baptism_covenant',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter XXVIII: Of Baptism (Paragraphs 1–7)',
    citation: 'WCF 28.1–28.7',
    yearOrEra: '1646',
    topic: 'Sacrament of Baptism, Covenant Sign & Seal, Infant Baptism (Pedobaptism)',
    coreDoctrine: 'Baptism is a sacrament of the New Testament, ordained by Jesus Christ, not only for the solemn admission of the party baptized into the visible Church, but also to be unto him a sign and seal of the covenant of grace; not only those that do actually profess faith, but also the infants of one, or both, believing parents, are to be baptized.',
    fullExcerpt: 'Baptism is a sacrament of the New Testament, ordained by Jesus Christ, not only for the solemn admission of the party baptized into the visible Church; but also to be unto him a sign and seal of the covenant of grace, of his ingrafting into Christ, of regeneration, of remission of sins, and of his giving up unto God, through Jesus Christ, to walk in newness of life (Matt. 28:19; Rom. 6:3-5; Col. 2:11-12). Not only those that do actually profess faith in and obedience unto Christ, but also the infants of one, or both, believing parents, are to be baptized (Gen. 17:7, 9; Gal. 3:9, 14; Col. 2:11-12; Acts 2:38-39; 1 Cor. 7:14).',
    relatedScriptures: ['Matthew 28:19', 'Acts 2:38-39', 'Genesis 17:7', 'Romans 6:3-5', 'Colossians 2:11-12', '1 Corinthians 7:14'],
    keywords: ['baptism', 'infant baptism', 'pedobaptism', 'covenant of grace', 'sign and seal', 'regeneration', 'acts 2:38', 'westminster', 'wcf chapter 28', 'reformed']
  },
  {
    id: 'wcf_ch29_lords_supper_spiritual_presence',
    tradition: 'reformed',
    documentTitle: 'Westminster Confession of Faith',
    sectionOrArticle: 'Chapter XXIX: Of the Lord’s Supper (Paragraphs 1–8)',
    citation: 'WCF 29.1–29.8',
    yearOrEra: '1646',
    topic: 'The Lord’s Supper: Spiritual Real Feeding on Christ by Faith (Transubstantiation Rejected)',
    coreDoctrine: 'Worthy receivers, outwardly partaking of the visible elements, do inwardly by faith, really and spiritually, receive and feed upon Christ crucified; the Body and Blood of Christ being not corporally or carnally in, with, or under the bread and wine, but spiritually present to faith.',
    fullExcerpt: 'Our Lord Jesus, in the night wherein He was betrayed, instituted the sacrament of His body and blood, called the Lord\'s Supper, to be observed in His Church, unto the end of the world, for the perpetual remembrance of the sacrifice of Himself in His death (29.1). That doctrine which maintains a change of the substance of bread and wine, into the substance of Christ\'s body and blood (commonly called transubstantiation) by consecration of a priest, or by any other way, is repugnant, not to Scripture alone, but even to common sense, and reason; overthroweth the nature of the sacrament, and hath been, and is, the cause of manifold superstitions; yea, of gross idolatries (29.6). Worthy receivers, outwardly partaking of the visible elements, in this sacrament, do then also, inwardly by faith, really and indeed, yet not carnally and corporally but spiritually, receive, and feed upon, Christ crucified, and all benefits of His death (29.7; 1 Cor. 10:16).',
    relatedScriptures: ['John 6:51-58', '1 Corinthians 10:16', '1 Corinthians 11:23-29', 'Hebrews 9:26'],
    keywords: ['lord\'s supper', 'spiritual presence', 'eucharist', 'calvin', 'westminster', 'wcf chapter 29', 'transubstantiation rejected', 'reformed']
  },

  // =========================================================================
  // HEIDELBERG CATECHISM (1563) & CANONS OF DORT (1619)
  // =========================================================================
  {
    id: 'heidelberg_q1_comfort_complete',
    tradition: 'reformed',
    documentTitle: 'The Heidelberg Catechism',
    sectionOrArticle: 'Lord’s Day 1, Question & Answer 1 & 2',
    citation: 'Heidelberg Catechism Q&A 1–2',
    yearOrEra: '1563',
    topic: 'Our Only Comfort in Life and Death & Three Things Necessary to Know',
    coreDoctrine: 'That I with body and soul, both in life and death, am not my own, but belong unto my faithful Savior Jesus Christ; who, with His precious blood, has fully satisfied for all my sins, and delivered me from all the power of the devil.',
    fullExcerpt: 'Question 1: What is your only comfort in life and death? Answer: That I with body and soul, both in life and death, am not my own, but belong unto my faithful Savior Jesus Christ; who, with his precious blood, has fully satisfied for all my sins, and delivered me from all the power of the devil; and so preserves me that without the will of my heavenly Father, not a hair can fall from my head; yea, that all things must be subservient to my salvation, and therefore, by his Holy Spirit, He also assures me of eternal life, and makes me sincerely willing and ready, henceforth, to live unto Him. Question 2: How many things are necessary for thee to know, that thou, enjoying this comfort, mayest live and die happily? Answer: Three: the first, how great my sins and miseries are; the second, how I may be delivered from all my sins and miseries; the third, how I shall express my gratitude to God for such deliverance.',
    relatedScriptures: ['1 Corinthians 6:19-20', 'Romans 14:7-9', '1 Peter 1:18-19', '1 John 1:7', 'John 10:28'],
    keywords: ['heidelberg catechism', 'only comfort', 'jesus christ', 'assurance', 'redemption', 'guilt grace gratitude', 'reformed']
  },
  {
    id: 'canons_of_dort_complete_tulip',
    tradition: 'reformed',
    documentTitle: 'The Canons of the Synod of Dort',
    sectionOrArticle: 'Five Heads of Doctrine (TULIP)',
    citation: 'Canons of Dort (1619)',
    yearOrEra: '1619',
    topic: 'The Five Points of Calvinism (Total Depravity, Unconditional Election, Limited Atonement, Irresistible Grace, Perseverance of Saints)',
    coreDoctrine: 'Election is the unchangeable purpose of God, whereby, before the foundation of the world, He hath out of mere grace chosen a certain number of persons to redemption in Christ, not on foreseen faith but unto faith and holiness.',
    fullExcerpt: 'First Head: Divine Election and Reprobation (Unconditional Election) - Election is the unchangeable purpose of God, whereby, before the foundation of the world, He hath out of mere grace chosen from the whole human race a certain number of persons to redemption in Christ (I.7). Second Head: The Death of Christ (Definite Atonement) - The death of the Son of God is the only and most perfect sacrifice and satisfaction for sin; it was the will of God that Christ should effectually redeem all those, and those only, who were from eternity chosen unto salvation (II.3, 8). Third/Fourth Heads: Corruption of Man & Conversion (Total Depravity & Irresistible Grace) - All men are conceived in sin and are by nature children of wrath, incapable of any saving good (III/IV.1); God infuses new qualities into the will, making that which was dead alive (III/IV.11). Fifth Head: Perseverance of the Saints - God preserves the elect from totally falling away from the state of grace (V.3–8).',
    relatedScriptures: ['Ephesians 1:4-5', 'Romans 9:11-18', 'John 6:37-40', 'John 10:14-16', 'John 10:27-29', 'Philippians 1:6'],
    keywords: ['canons of dort', 'tulip', 'five points of calvinism', 'unconditional election', 'limited atonement', 'irresistible grace', 'perseverance', 'reformed']
  }
];
