import { DoctrinalEntry } from '../doctrinalCorpus';

/**
 * UNABRIDGED OFFICIAL ROMAN CATHOLIC MAGISTERIAL & CONFESSIONAL CORPUS
 * Contains the Catechism of the Catholic Church (CCC complete key dogmatic sections),
 * The Council of Trent (Complete Decrees and Canons on Justification, Eucharist, Sacrifice of the Mass, Original Sin, Sacraments, Purgatory),
 * The First Vatican Council (Pastor Aeternus on Papal Primacy & Infallibility),
 * The Second Vatican Council (Dei Verbum & Lumen Gentium Chapter VIII),
 * and Papal Dogmatic Constitutions (Ineffabilis Deus 1854 & Munificentissimus Deus 1950).
 */
export const UNABRIDGED_CATHOLIC_CORPUS: DoctrinalEntry[] = [
  // =========================================================================
  // 1. SCRIPTURE, TRADITION & MAGISTERIUM (CCC §85–87, DEI VERBUM & TRENT SESS. IV)
  // =========================================================================
  {
    id: 'catholic_ccc_85_magisterium_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church',
    sectionOrArticle: 'Paragraphs 85–87 (The Magisterium of the Church)',
    citation: 'CCC §85–87',
    yearOrEra: '1992',
    topic: 'The Magisterium & Authentic Interpretation of Sacred Scripture and Tradition',
    coreDoctrine: 'The task of giving an authentic interpretation of the Word of God, whether in its written form or in the form of Tradition, has been entrusted to the living teaching office of the Church alone.',
    fullExcerpt: '"The task of giving an authentic interpretation of the Word of God, whether in its written form or in the form of Tradition, has been entrusted to the living teaching office of the Church alone. Its authority in this matter is exercised in the name of Jesus Christ" (Dei Verbum 10 §2; CCC §85). Yet this Magisterium is not superior to the Word of God, but is its servant. It teaches only what has been handed on to it. At the divine command and with the help of the Holy Spirit, it listens to this devotedly, guards it with dedication and expounds it faithfully. All that it proposes for belief as being divinely revealed is drawn from this single deposit of faith (CCC §86). Mindful of Christ\'s words to his apostles: "He who hears you hears me", the faithful receive with docility the teachings and directives that their pastors give them in different forms (CCC §87; Luke 10:16).',
    relatedScriptures: ['Luke 10:16', '1 Timothy 3:15', '2 Thessalonians 2:15', 'Matthew 16:18-19', 'Matthew 28:18-20'],
    keywords: ['magisterium', 'tradition', 'scripture', 'authority', 'interpretation', 'bishops', 'pope', 'apostolic', 'catholic']
  },
  {
    id: 'catholic_dei_verbum_11_inspiration_complete',
    tradition: 'catholic',
    documentTitle: 'Second Vatican Council: Dei Verbum',
    sectionOrArticle: 'Paragraphs 9–11 (Sacred Scripture, Inspiration & Divine Truth)',
    citation: 'Dei Verbum §9–11',
    yearOrEra: '1965',
    topic: 'Inspiration, Divine Authorship & Inerrant Truth of Sacred Scripture',
    coreDoctrine: 'The books of both the Old and New Testaments in their entirety are sacred and canonical because, written under the inspiration of the Holy Spirit, they have God as their author and teach solidly, faithfully and without error that truth which God wanted put into sacred writings for the sake of salvation.',
    fullExcerpt: 'Sacred Tradition and Sacred Scripture form one sacred deposit of the word of God, committed to the Church (DV 10). Those divinely revealed realities which are contained and presented in Sacred Scripture have been committed to writing under the inspiration of the Holy Spirit. For holy mother Church, relying on the belief of the Apostles, holds that the books of both the Old and New Testaments in their entirety, with all their parts, are sacred and canonical because written under the inspiration of the Holy Spirit, they have God as their author and have been handed on as such to the Church herself. Therefore, since everything asserted by the inspired authors or sacred writers must be held to be asserted by the Holy Spirit, it follows that the books of Scripture must be acknowledged as teaching solidly, faithfully and without error that truth which God wanted put into sacred writings for the sake of salvation (DV 11).',
    relatedScriptures: ['2 Timothy 3:16-17', '2 Peter 1:20-21', 'John 20:31', 'Psalm 119:105'],
    keywords: ['inspiration', 'inerrancy', 'dei verbum', 'vatican ii', 'scripture', 'bible', 'holy spirit', 'divine author', 'catholic']
  },

  // =========================================================================
  // 2. MARIOLOGY: IMMACULATE CONCEPTION, THEOTOKOS, ASSUMPTION & INTERCESSION
  // =========================================================================
  {
    id: 'catholic_ccc_490_493_immaculate_conception_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & Ineffabilis Deus (Pius IX)',
    sectionOrArticle: 'Paragraphs 490–493 (Dogma of the Immaculate Conception)',
    citation: 'CCC §490–493 / Ineffabilis Deus',
    yearOrEra: '1854 / 1992',
    topic: 'The Immaculate Conception & Perpetual Sinlessness of the Blessed Virgin Mary',
    coreDoctrine: 'The Blessed Virgin Mary was, from the first moment of her conception, by a singular grace and privilege of almighty God and by virtue of the foreseen merits of Jesus Christ, preserved immune from all stain of original sin and lived free from every personal sin throughout her whole life.',
    fullExcerpt: 'To become the mother of the Savior, Mary "was enriched by God with gifts appropriate to such a role" (Lumen Gentium 56). The angel Gabriel at the moment of the annunciation salutes her as "full of grace" (Kecharitomene - Luke 1:28). Through the centuries the Church has become ever more aware that Mary, "full of grace" through God, was redeemed from the moment of her conception. That is what the dogma of the Immaculate Conception confesses, as Pope Pius IX proclaimed in 1854: "The most Blessed Virgin Mary was, from the first moment of her conception, by a singular grace and privilege of almighty God and by virtue of the merits of Jesus Christ, Savior of the human race, preserved immune from all stain of original sin" (Ineffabilis Deus: DS 2803; CCC §491). The Fathers of the Eastern tradition call the Mother of God "the All-Holy" (Panagia) and celebrate her as "free from any stain of sin, as though fashioned by the Holy Spirit and formed as a new creature." By the grace of God Mary remained free of every personal sin her whole life long (CCC §493; Council of Trent, Sess. VI, Can. 23).',
    relatedScriptures: ['Luke 1:28', 'Genesis 3:15', 'Luke 1:42', 'Luke 1:47', 'Romans 5:12', '2 Corinthians 5:21', 'Hebrews 4:15'],
    keywords: ['immaculate conception', 'mary', 'sinless', 'without sin', 'born without sin', 'full of grace', 'kecharitomene', 'ineffabilis deus', 'pius ix', 'original sin', 'council of trent', 'catholic']
  },
  {
    id: 'catholic_ccc_495_theotokos_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & Council of Ephesus',
    sectionOrArticle: 'Paragraph 495 (Mary - Mother of God / Theotokos)',
    citation: 'CCC §495 / Council of Ephesus (AD 431)',
    yearOrEra: '431 / 1992',
    topic: 'Mary, Mother of God (Theotokos)',
    coreDoctrine: 'Called in the Gospels "the mother of Jesus", Mary is acclaimed by Elizabeth as "the mother of my Lord". In fact, the One whom she conceived as man by the Holy Spirit, who truly became her Son according to the flesh, was none other than the Father\'s eternal Son, the second Person of the Holy Trinity. Hence the Church confesses that Mary is truly "Mother of God" (Theotokos).',
    fullExcerpt: 'Called in the Gospels "the mother of Jesus", Mary is acclaimed by Elizabeth promptly even before the birth of her son as "the mother of my Lord" (Luke 1:43). In fact, the One whom she conceived as man by the Holy Spirit, who truly became her Son according to the flesh, was none other than the Father\'s eternal Son, the second Person of the Holy Trinity. Hence the Church confesses that Mary is truly "Mother of God" (Theotokos, Council of Ephesus: DS 251).',
    relatedScriptures: ['Luke 1:43', 'Luke 1:35', 'Galatians 4:4', 'Matthew 1:23', 'John 1:14'],
    keywords: ['theotokos', 'mother of god', 'mary', 'council of ephesus', 'virgin birth', 'incarnation', 'elizabeth', 'luke 1:43', 'catholic']
  },
  {
    id: 'catholic_ccc_963_975_lumen_gentium_assumption',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & Second Vatican Council',
    sectionOrArticle: 'Paragraphs 963–975 & Lumen Gentium Chapter VIII',
    citation: 'CCC §963–975 / LG §52–69 / Munificentissimus Deus',
    yearOrEra: '1950 / 1964 / 1992',
    topic: 'Mary’s Motherhood in the Order of Grace, Assumption & Intercession (Advocate, Helper, Mediatrix)',
    coreDoctrine: 'The Blessed Virgin Mary, taken up body and soul into heavenly glory, did not lay aside this saving office but by her manifold intercession continues to bring us the gifts of eternal salvation, without obscuring the unique mediation of Christ.',
    fullExcerpt: 'Mary\'s role in the Church is inseparable from her union with Christ and flows directly from it: "This union of the mother with the Son in the work of salvation is made manifest from the time of Christ\'s virginal conception up to his death" (Lumen Gentium 57; CCC §964). At the Cross, Jesus gave Mary as Mother to the beloved disciple, and in him to all believers: "Woman, behold your son!" (John 19:26-27; CCC §964). "Finally the Immaculate Virgin, preserved free from all stain of original sin, when the course of her earthly life was finished, was taken up body and soul into heavenly glory, and exalted by the Lord as Queen over all things" (Munificentissimus Deus 1950; LG 59; CCC §966). "Taken up to heaven she did not lay aside this saving office but by her manifold intercession continues to bring us the gifts of eternal salvation... Therefore the Blessed Virgin is invoked in the Church under the titles of Advocate, Helper, Benefactress, and Mediatrix" (LG 62; CCC §969). Mary’s subordinate role in no way obscures or diminishes the unique mediation of Christ, but rather shows its power (CCC §970; 1 Tim. 2:5).',
    relatedScriptures: ['John 19:25-27', 'Revelation 12:1-5', 'Luke 1:48-49', '1 Timothy 2:5', 'Psalm 45:9'],
    keywords: ['assumption', 'mother of the church', 'intercession', 'mediatrix', 'advocate', 'lumen gentium', 'munificentissimus deus', 'john 19:26', 'revelation 12', 'catholic']
  },

  // =========================================================================
  // 3. ORIGINAL SIN & THE FALL (CCC §385–421 & COUNCIL OF TRENT SESS. V)
  // =========================================================================
  {
    id: 'catholic_ccc_385_421_trent_original_sin_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & Council of Trent',
    sectionOrArticle: 'Paragraphs 385–421 & Council of Trent Session V',
    citation: 'CCC §385–421 / Trent Sess. V',
    yearOrEra: '1546 / 1992',
    topic: 'The Fall of Adam, Original Sin, Loss of Original Justice & Need for Redemption',
    coreDoctrine: 'By his sin Adam, as the first man, lost the original holiness and justice he had received from God, not only for himself but for all of us; original sin is contracted by all mankind, not committed, deprivation of original holiness.',
    fullExcerpt: 'Revelation makes known to us the state of original holiness and justice of man and woman before sin: from their friendship with God flowed the happiness of their existence in paradise (CCC §384). Man, tempted by the devil, let his trust in his Creator die in his heart and, abusing his freedom, disobeyed God\'s command. This is what man\'s first sin consisted of (CCC §397). By his sin Adam lost the original holiness and justice he had received from God (CCC §399). All men are implicated in Adam\'s sin, as St. Paul affirms: "By one man\'s disobedience many were made sinners" (Rom. 5:19; CCC §402). Original sin is called "sin" only in an analogical sense: it is a sin "contracted" and not "committed" - a state and not an act. Although proper to each individual, original sin does not have the character of a personal fault in any of Adam\'s descendants (CCC §404). By Baptism all sins are forgiven, original sin and all personal sins, yet concupiscence remains (Trent Sess. V; CCC §405). The Blessed Virgin Mary, by a unique privilege, was exempt from original sin from her conception (Trent Sess. V; Ineffabilis Deus; CCC §411).',
    relatedScriptures: ['Genesis 3:1-24', 'Romans 5:12-21', '1 Corinthians 15:21-22', 'Psalm 51:5'],
    keywords: ['original sin', 'the fall', 'adam and eve', 'concupiscence', 'council of trent', 'privation of holiness', 'redemption', 'catholic']
  },

  // =========================================================================
  // 4. JUSTIFICATION & GRACE (COUNCIL OF TRENT SESS. VI & CCC §1987–2029)
  // =========================================================================
  {
    id: 'catholic_trent_sess_6_justification_complete',
    tradition: 'catholic',
    documentTitle: 'Council of Trent: Decree on Justification',
    sectionOrArticle: 'Session VI, Chapters 1–16 & Canons 1–33',
    citation: 'Council of Trent, Sess. VI (1547)',
    yearOrEra: '1547',
    topic: 'Justification as the Inner Renewal and Sanctification of the Sinner',
    coreDoctrine: 'Justification is not only the remission of sins, but also the sanctification and renewal of the interior man through the voluntary reception of grace and gifts, whereby an unjust man becomes just; faith without hope and charity does not unite man perfectly to Christ.',
    fullExcerpt: 'Justification is not only the remission of sins, but also the sanctification and renewal of the inward man, through the voluntary reception of the grace, and of the gifts, whereby an unjust man becomes just, and an enemy a friend, that so he may be an heir according to the hope of life everlasting (Chapter 7)... Whence, man through Jesus Christ, in whom he is ingrafted, receives, in the said justification, together with the remission of sins, all these gifts infused at once: faith, hope, and charity. For faith, unless hope and charity be added thereto, neither unites him perfectly with Christ, nor makes him a living member of His body. Wherefore, it is most truly said that faith without works is dead and profitless (James 2:20). Canon 9: If anyone saith, that by faith alone the impious is justified; in such wise as to mean, that nothing else is required to co-operate in order to the obtaining the grace of Justification... let him be anathema. Canon 23: If anyone saith, that a man once justified can sin no more... or, on the other hand, that he is able, during his whole life, to avoid all sins, even such as are venial, except by a special privilege from God, as the Church holds in regard of the Blessed Virgin; let him be anathema.',
    relatedScriptures: ['Romans 3:24-28', 'Romans 5:1-5', 'James 2:14-26', 'Galatians 5:6', '1 Corinthians 13:2'],
    keywords: ['justification', 'council of trent', 'sanctification', 'infused grace', 'faith working through love', 'fides formata', 'james 2:24', 'canon 23', 'catholic']
  },
  {
    id: 'catholic_ccc_1987_2029_grace_merit_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church',
    sectionOrArticle: 'Paragraphs 1987–2029 (Grace and Justification)',
    citation: 'CCC §1987–2029',
    yearOrEra: '1992',
    topic: 'Grace, Justification & Supernatural Merit in Christ',
    coreDoctrine: 'Our justification comes from the grace of God. Grace is favor, the free and undeserved help that God gives us to respond to his call. Merit is entirely founded on God’s prior grace in Christ.',
    fullExcerpt: 'The grace of the Holy Spirit has the power to justify us, that is, to cleanse us from our sins and to communicate to us "the righteousness of God through faith in Jesus Christ" and through Baptism (CCC §1987). Justification is the most excellent work of God\'s love made manifest in Christ Jesus and brought about by the Holy Spirit (CCC §1994). Grace is a participation in the life of God (CCC §1997). With regard to God, there is no strict right to any merit on the part of man. Between God and us there is an immeasurable inequality, for we have received everything from him, our Creator (CCC §2007). The merit of man before God in the Christian life arises from the fact that God has freely chosen to associate man with the work of his grace. The fatherly action of God is first on his own initiative, and then follows man\'s free acting through his collaboration, so that the merit of good works is to be attributed in the first place to the grace of God, then to the faithful (CCC §2008).',
    relatedScriptures: ['Ephesians 2:8-10', 'Philippians 2:12-13', 'Romans 8:14-17', 'John 15:5', '2 Peter 1:4'],
    keywords: ['grace', 'merit', 'justification', 'good works', 'holy spirit', 'sanctification', 'catholic']
  },

  // =========================================================================
  // 5. THE HOLY EUCHARIST & TRANSUBSTANTIATION (CCC §1374–1377 & TRENT SESS. XIII)
  // =========================================================================
  {
    id: 'catholic_ccc_1374_1377_transubstantiation_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & Council of Trent',
    sectionOrArticle: 'Paragraphs 1374–1377 & Council of Trent Session XIII',
    citation: 'CCC §1374–1377 / Trent Sess. XIII',
    yearOrEra: '1551 / 1992',
    topic: 'The Real Presence & Transubstantiation (John 6:51–58, 1 Cor 11:23–29)',
    coreDoctrine: 'In the sacrament of the Eucharist, the whole Christ is truly, really, and substantially contained; by the consecration of the bread and wine, there takes place a change of the whole substance of bread into the Body of Christ and of the whole substance of wine into His Blood—this change is fittingly called Transubstantiation.',
    fullExcerpt: 'In the most blessed sacrament of the Eucharist "the body and blood, together with the soul and divinity, of our Lord Jesus Christ and, therefore, the whole Christ is truly, really, and substantially contained" (Council of Trent: DS 1651; CCC §1374). This presence is called \'real\' - by which is not intended to exclude the other types of presence as if they could not be \'real\' too, but because it is presence in the fullest sense: that is to say, it is a substantial presence by which Christ, God and man, makes himself wholly and entirely present (CCC §1374). "By the consecration of the bread and wine there takes place a change of the whole substance of the bread into the substance of the body of Christ our Lord and of the whole substance of the wine into the substance of his blood. This change the holy Catholic Church has fittingly and properly called transubstantiation" (Trent: DS 1642; CCC §1376). Christ’s declaration in John 6:55 ("My flesh is true food, and my blood is true drink") is the literal, sacramental reality at the heart of the Holy Sacrifice of the Mass.',
    relatedScriptures: ['John 6:51-58', 'Matthew 26:26-28', '1 Corinthians 10:16', '1 Corinthians 11:23-29', 'Luke 22:19-20'],
    keywords: ['eucharist', 'transubstantiation', 'real presence', 'mass', 'body and blood', 'john 6', 'council of trent', 'lords supper', 'communion', 'catholic']
  },

  // =========================================================================
  // 6. SACRAMENT OF BAPTISM & REGENERATION (CCC §1213–1284)
  // =========================================================================
  {
    id: 'catholic_ccc_1213_1284_baptism_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church',
    sectionOrArticle: 'Paragraphs 1213–1284 (The Sacrament of Baptism)',
    citation: 'CCC §1213–1284',
    yearOrEra: '1992',
    topic: 'Sacramental Baptismal Regeneration (John 3:5, Acts 2:38, 1 Peter 3:21)',
    coreDoctrine: 'Holy Baptism is the basis of the whole Christian life, the gateway to life in the Spirit, which frees from sin, regenerates as sons of God, and incorporates into the Church.',
    fullExcerpt: 'Holy Baptism is the basis of the whole Christian life, the gateway to life in the Spirit (vitae spiritualis ianua), and the door which gives access to the other sacraments. Through Baptism we are freed from sin and reborn as sons of God; we become members of Christ, are incorporated into the Church and made sharers in her mission: "Baptism is the sacrament of regeneration through water in the word" (CCC §1213). By Baptism all sins are forgiven, original sin and all personal sins, as well as all punishment for sin (CCC §1263). The Church and the parents would deny a child the priceless grace of becoming a child of God, were they not to confer Baptism shortly after birth (CCC §1250).',
    relatedScriptures: ['John 3:5', 'Acts 2:38', '1 Peter 3:21', 'Romans 6:3-4', 'Titus 3:5', 'Matthew 28:19'],
    keywords: ['baptism', 'regeneration', 'infant baptism', 'born of water and spirit', 'remission of sins', 'sacrament', 'catholic']
  },

  // =========================================================================
  // 7. PETRINE PRIMACY & THE PAPACY (CCC §880–892 & PASTOR AETERNUS)
  // =========================================================================
  {
    id: 'catholic_ccc_880_892_pastor_aeternus_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & First Vatican Council',
    sectionOrArticle: 'Paragraphs 880–892 & Pastor Aeternus (Chapters 1–4)',
    citation: 'CCC §880–892 / Pastor Aeternus',
    yearOrEra: '1870 / 1992',
    topic: 'The Petrine Office, Papal Primacy & Infallibility (Matthew 16:18–19, John 21:15–17)',
    coreDoctrine: 'The Pope, Bishop of Rome and Peter’s successor, is the perpetual and visible principle and foundation of unity of both the bishops and of the faithful, possessing supreme, full, immediate, and universal power over the Church.',
    fullExcerpt: 'When Christ instituted the Twelve, "he constituted them in the form of a college or permanent assembly, at the head of which he placed Peter, chosen from among them." Just as "by the Lord\'s institution, St. Peter and the rest of the apostles constitute a single apostolic college, so in like fashion the Roman Pontiff, Peter\'s successor, and the bishops, the successors of the apostles, are related with and united to one another" (Lumen Gentium 22; CCC §880). The Pope, Bishop of Rome and Peter\'s successor, "is the perpetual and visible source and foundation of the unity both of the bishops and of the whole company of the faithful" (LG 23; CCC §882). "The Roman Pontiff, head of the college of bishops, enjoys this infallibility in virtue of his office, when, as supreme pastor and teacher of all the faithful - who confirms his brethren in the faith - he proclaims by a definitive act a doctrine pertaining to faith or morals" (LG 25; First Vatican Council: Pastor Aeternus, DS 3074; CCC §891).',
    relatedScriptures: ['Matthew 16:18-19', 'Luke 22:31-32', 'John 21:15-17', 'Galatians 2:9'],
    keywords: ['pope', 'papacy', 'peter', 'rock', 'matthew 16:18', 'keys of the kingdom', 'pastor aeternus', 'infallibility', 'magisterium', 'catholic']
  },

  // =========================================================================
  // 8. PURGATORY & PRAYERS FOR THE DEPARTED (CCC §1030–1032 & TRENT SESS. XXV)
  // =========================================================================
  {
    id: 'catholic_ccc_1030_1032_purgatory_complete',
    tradition: 'catholic',
    documentTitle: 'Catechism of the Catholic Church & Council of Trent',
    sectionOrArticle: 'Paragraphs 1030–1032 & Council of Trent Session XXV',
    citation: 'CCC §1030–1032 / Trent Sess. XXV',
    yearOrEra: '1563 / 1992',
    topic: 'Purgatory & The Final Purification of the Elect (1 Cor 3:13–15, 2 Macc 12:46)',
    coreDoctrine: 'All who die in God’s grace and friendship, but still imperfectly purified, are indeed assured of their eternal salvation; but after death they undergo purification, so as to achieve the holiness necessary to enter the joy of heaven.',
    fullExcerpt: 'All who die in God\'s grace and friendship, but still imperfectly purified, are indeed assured of their eternal salvation; but after death they undergo purification, so as to achieve the holiness necessary to enter the joy of heaven (CCC §1030). The Church gives the name Purgatory to this final purification of the elect, which is entirely different from the punishment of the damned. The Church formulated her doctrine of faith on Purgatory especially at the Councils of Florence and Trent (CCC §1031). From the beginning the Church has honored the memory of the dead and offered prayers in suffrage for them, above all the Eucharistic sacrifice, so that, thus purified, they may attain the beatific vision of God (CCC §1032; 2 Maccabees 12:46; 1 Cor. 3:15; 1 Pet. 1:7).',
    relatedScriptures: ['1 Corinthians 3:13-15', '2 Maccabees 12:46', 'Matthew 12:32', '1 Peter 1:7'],
    keywords: ['purgatory', 'purification', 'prayers for the dead', 'communion of saints', 'council of trent', 'afterlife', 'catholic']
  }
];
