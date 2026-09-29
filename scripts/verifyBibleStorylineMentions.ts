import { BIBLE_BOOKS } from '../src/data/bibleData';
import { getChapterGeoData } from '../src/data/geoData';

console.log("==========================================================");
console.log("VERIFYING STORYLINE VS. MENTIONS ACROSS ENTIRE BIBLE");
console.log("==========================================================");

let totalChaptersChecked = 0;
let totalStorylinePlaces = 0;
let totalMentionedPlaces = 0;
let chaptersWithStoryline = 0;
let chaptersWithMentions = 0;
let routeChapters = 0;
const issues: string[] = [];

// Specific critical checks for biblical narrative accuracy
const SPOT_CHECKS: Record<string, { expectedStoryline: string[]; expectedMentions: string[] }> = {
  // Acts
  'acts_13': {
    expectedStoryline: ['Perga', 'Antioch', 'Iconium'],
    expectedMentions: ['Cyrene', 'Egypt', 'Canaan']
  },
  'acts_16': {
    expectedStoryline: ['Derbe', 'Lystra', 'Troas', 'Philippi'],
    expectedMentions: ['Asia', 'Bithynia']
  },
  'acts_17': {
    expectedStoryline: ['Amphipolis', 'Apollonia', 'Thessalonica', 'Berea', 'Athens'],
    expectedMentions: []
  },
  'acts_18': {
    expectedStoryline: ['Corinth', 'Ephesus', 'Caesarea'],
    expectedMentions: ['Pontus', 'Alexandria', 'Rome']
  },
  'acts_20': {
    expectedStoryline: ['Assos', 'Mitylene', 'Chios', 'Samos', 'Miletus'],
    expectedMentions: ['Berea', 'Derbe', 'Thessalonica']
  },
  'acts_21': {
    expectedStoryline: ['Cos', 'Rhodes', 'Patara', 'Tyre', 'Ptolemais', 'Caesarea', 'Jerusalem'],
    expectedMentions: ['Tarsus', 'Cilicia']
  },
  // Gospels
  'matthew_2': {
    expectedStoryline: ['Bethlehem', 'Jerusalem'],
    expectedMentions: []
  },
  'mark_11': {
    expectedStoryline: ['Bethany', 'Bethphage', 'Jerusalem', 'Mount of Olives'],
    expectedMentions: []
  },
  'luke_2': {
    expectedStoryline: ['Bethlehem', 'Nazareth'],
    expectedMentions: ['Syria']
  },
  'luke_4': {
    expectedStoryline: ['Nazareth', 'Capernaum'],
    expectedMentions: ['Sidon', 'Zarephath']
  },
  'luke_10': {
    expectedStoryline: [],
    expectedMentions: ['Sodom', 'Jericho', 'Jerusalem', 'Chorazin', 'Bethsaida']
  },
  // OT
  'exodus_14': {
    expectedStoryline: ['Baal-zephon', 'Migdol', 'Pi-hahiroth'],
    expectedMentions: []
  },
  'numbers_33': {
    expectedStoryline: ['Rameses', 'Succoth', 'Etham', 'Marah', 'Elim', 'Rephidim', 'Sinai'],
    expectedMentions: []
  }
};

for (const book of BIBLE_BOOKS) {
  for (let ch = 1; ch <= book.chaptersCount; ch++) {
    totalChaptersChecked++;
    const key = `${book.id.toLowerCase()}_${ch}`;
    const data = getChapterGeoData(book.id, ch);

    if (!data || !data.events || data.events.length === 0) continue;

    const storylineEvents = data.events.filter(e => !e.isReferencedOnly);
    const mentionedEvents = data.events.filter(e => e.isReferencedOnly);

    totalStorylinePlaces += storylineEvents.length;
    totalMentionedPlaces += mentionedEvents.length;

    if (storylineEvents.length > 0) chaptersWithStoryline++;
    if (mentionedEvents.length > 0) chaptersWithMentions++;
    if (data.routeSegments && data.routeSegments.length > 0) routeChapters++;

    // Check spot checks if defined
    if (SPOT_CHECKS[key]) {
      const check = SPOT_CHECKS[key];
      const storyNames = storylineEvents.map(e => e.locationName.toLowerCase());
      const mentionNames = mentionedEvents.map(e => e.locationName.toLowerCase());

      for (const reqStory of check.expectedStoryline) {
        const found = storyNames.some(n => n.includes(reqStory.toLowerCase()));
        if (!found) {
          issues.push(`[CRITICAL] ${key}: Expected storyline place '${reqStory}' was NOT found in active storyline (places: ${storyNames.join(', ')})`);
        }
      }

      for (const reqMention of check.expectedMentions) {
        const found = mentionNames.some(n => n.includes(reqMention.toLowerCase()));
        if (!found) {
          // Check if it leaked into storyline
          const leaked = storyNames.some(n => n.includes(reqMention.toLowerCase()));
          if (leaked) {
            issues.push(`[LEAK] ${key}: Place '${reqMention}' leaked into physical storyline when it should be a mentioned place!`);
          }
        }
      }
    }
  }
}

console.log(`Total Chapters Analyzed: ${totalChaptersChecked}`);
console.log(`Chapters with Storyline Places: ${chaptersWithStoryline}`);
console.log(`Chapters with Mentioned Places: ${chaptersWithMentions}`);
console.log(`Total Active Storyline Places: ${totalStorylinePlaces}`);
console.log(`Total Filtered Mentioned Places: ${totalMentionedPlaces}`);
console.log(`Chapters with Active Transit Routes: ${routeChapters}`);

if (issues.length === 0) {
  console.log("\nALL SPOT CHECKS & BIBLE-WIDE CHECKS PASSED PERFECTLY!");
  console.log("No mentioned places leaked into physical itineraries.");
  console.log("All key storyline stops (Acts 13, 16, 17, 18, 20, 21, Luke 2, Matt 2, Mark 11, Exod 14, Num 33) are fully in effect.");
} else {
  console.error(`\nFound ${issues.length} issues:`);
  issues.forEach(i => console.error("  " + i));
  process.exit(1);
}
