import { checkIsWordsOfJesus, parseVerseSegments } from '../src/services/redLetterService';
import kjvData from '../data/kjv.json';

console.log("===============================================================================");
console.log("TESTING RED-LETTER ACCURACY (WORDS OF CHRIST AUDIT)");
console.log("===============================================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    testsPassed++;
  } else {
    testsFailed++;
    console.error(`[FAIL] ${msg}`);
  }
}

// 1. Negative controls: Old Testament and Pauline narrative without Christ quotes
assert(!checkIsWordsOfJesus("genesis", 1, 1), "Genesis 1:1 must NOT be words of Jesus");
assert(!checkIsWordsOfJesus("psalms", 23, 1), "Psalm 23:1 must NOT be words of Jesus");
assert(!checkIsWordsOfJesus("romans", 1, 1), "Romans 1:1 must NOT be words of Jesus");
assert(!checkIsWordsOfJesus("galatians", 1, 1), "Galatians 1:1 must NOT be words of Jesus");

// 2. Matthew
assert(checkIsWordsOfJesus("matthew", 4, 4), "Matthew 4:4 must be words of Jesus");
assert(checkIsWordsOfJesus("matthew", 5, 3), "Matthew 5:3 (Beatitudes) must be words of Jesus");
assert(checkIsWordsOfJesus("matthew", 28, 19), "Matthew 28:19 (Great Commission) must be words of Jesus");

// Test segmentation on Matthew 8:3 (Narrative + Speech + Narrative)
const matt8_3_kjv = "And Jesus put forth his hand, and touched him, saying, I will; be thou clean. And immediately his leprosy was cleansed.";
const segs8_3 = parseVerseSegments(matt8_3_kjv, true, "matthew", 8, 3);
assert(segs8_3.length === 3, `Matthew 8:3 must have 3 segments (got ${segs8_3.length})`);
assert(!segs8_3[0].isSpeech && segs8_3[0].text.includes("saying,"), "Matt 8:3 intro narrative must not be speech");
assert(segs8_3[1].isSpeech && segs8_3[1].text.includes("I will; be thou clean."), "Matt 8:3 'I will; be thou clean.' must be speech");
assert(!segs8_3[2].isSpeech && segs8_3[2].text.includes("leprosy was cleansed"), "Matt 8:3 ending narrative must not be speech");

// 3. Mark
assert(checkIsWordsOfJesus("mark", 1, 15), "Mark 1:15 must be words of Jesus");
assert(checkIsWordsOfJesus("mark", 14, 62), "Mark 14:62 must be words of Jesus");

// 4. Luke
assert(checkIsWordsOfJesus("luke", 2, 49), "Luke 2:49 (Child Jesus in Temple) must be words of Jesus");
assert(checkIsWordsOfJesus("luke", 15, 11), "Luke 15:11 (Prodigal Son) must be words of Jesus");
assert(checkIsWordsOfJesus("luke", 23, 34), "Luke 23:34 (Father forgive them) must be words of Jesus");
assert(checkIsWordsOfJesus("luke", 23, 43), "Luke 23:43 (Today shalt thou be with me in paradise) must be words of Jesus");

// 5. John
assert(checkIsWordsOfJesus("john", 1, 38), "John 1:38 must be words of Jesus");
assert(checkIsWordsOfJesus("john", 3, 16), "John 3:16 must be words of Jesus");
assert(checkIsWordsOfJesus("john", 8, 58), "John 8:58 (Before Abraham was, I am) must be words of Jesus");
assert(checkIsWordsOfJesus("john", 14, 6), "John 14:6 (I am the way, truth, life) must be words of Jesus");
assert(checkIsWordsOfJesus("john", 17, 1), "John 17:1 (High Priestly Prayer) must be words of Jesus");

// Test John 1:38: Only Jesus's question is red, disciples' question is NOT red!
const john1_38_kjv = "Then Jesus turned, and saw them following, and saith unto them, What seek ye? They said unto him, Rabbi, (which is to say, being interpreted, Master,) where dwellest thou?";
const segs1_38 = parseVerseSegments(john1_38_kjv, true, "john", 1, 38);
assert(segs1_38.length === 3, `John 1:38 must have 3 segments (got ${segs1_38.length})`);
assert(!segs1_38[0].isSpeech, "John 1:38 intro must not be speech");
assert(segs1_38[1].isSpeech && segs1_38[1].text.includes("What seek ye?"), "John 1:38 'What seek ye?' must be speech");
assert(!segs1_38[2].isSpeech && segs1_38[2].text.includes("where dwellest thou?"), "John 1:38 disciples' question must NOT be speech");

// 6. Acts of the Apostles
assert(checkIsWordsOfJesus("acts", 1, 4), "Acts 1:4 must be words of Jesus");
assert(checkIsWordsOfJesus("acts", 9, 4), "Acts 9:4 (Saul, Saul, why persecutest thou me?) must be words of Jesus");
assert(checkIsWordsOfJesus("acts", 18, 9), "Acts 18:9 must be words of Jesus");
assert(checkIsWordsOfJesus("acts", 20, 35), "Acts 20:35 (It is more blessed to give than to receive) must be words of Jesus");
assert(checkIsWordsOfJesus("acts", 22, 7), "Acts 22:7 must be words of Jesus");
assert(checkIsWordsOfJesus("acts", 26, 14), "Acts 26:14 must be words of Jesus");

// 7. Epistles
assert(checkIsWordsOfJesus("1corinthians", 11, 24), "1 Cor 11:24 (Lord's Supper) must be words of Jesus");
assert(checkIsWordsOfJesus("1corinthians", 11, 25), "1 Cor 11:25 (Lord's Supper) must be words of Jesus");
assert(checkIsWordsOfJesus("2corinthians", 12, 9), "2 Cor 12:9 (My grace is sufficient for thee) must be words of Jesus");
assert(checkIsWordsOfJesus("1timothy", 5, 18), "1 Tim 5:18 (The labourer is worthy of his reward) must be words of Jesus");

// 8. Revelation
assert(checkIsWordsOfJesus("revelation", 1, 8), "Rev 1:8 (I am Alpha and Omega) must be words of Jesus");
assert(checkIsWordsOfJesus("revelation", 2, 1), "Rev 2:1 (Unto the angel of the church of Ephesus) must be words of Jesus");
assert(checkIsWordsOfJesus("revelation", 3, 20), "Rev 3:20 (Behold I stand at the door and knock) must be words of Jesus");
assert(checkIsWordsOfJesus("revelation", 22, 12), "Rev 22:12 (Behold I come quickly) must be words of Jesus");
assert(checkIsWordsOfJesus("revelation", 22, 16), "Rev 22:16 (I Jesus have sent mine angel) must be words of Jesus");

console.log("\n===============================================================================");
console.log(`TEST RESULTS:`);
console.log(`  Tests Passed: ${testsPassed}`);
console.log(`  Tests Failed: ${testsFailed}`);
console.log("===============================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("All red-letter tests PASSED with 100% accuracy!");
}
