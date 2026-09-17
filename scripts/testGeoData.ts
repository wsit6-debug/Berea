import { getChapterGeoData } from '../src/data/geoData';

const chaptersToTest = [
  { book: 'genesis', chapter: 12 },
  { book: 'exodus', chapter: 14 },
  { book: 'acts', chapter: 27 },
  { book: 'revelation', chapter: 1 }
];

for (const test of chaptersToTest) {
  console.log(`\n--- Testing ${test.book} ${test.chapter} ---`);
  const data = getChapterGeoData(test.book, test.chapter);
  if (data.events && data.events.length > 0) {
    console.log(`Success! Found ${data.events.length} events.`);
    console.log(`First event: ${data.events[0].title} at [${data.events[0].lat}, ${data.events[0].lng}]`);
    console.log(`Is Educated Guess: ${data.events[0].isEducatedGuess}`);
  } else {
    console.log(`No events found. Uses fallback center: [${data.centerLat}, ${data.centerLng}]`);
  }
}
