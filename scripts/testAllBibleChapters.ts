import { getChapterGeoData, getBookGeoData } from '../src/data/geoData';
import { BIBLE_BOOKS } from '../src/data/bibleData';

console.log('Testing ALL 1,189 chapters of the Bible for geo and route coverage...\n');

let totalChapters = 0;
let chaptersWithData = 0;
let chaptersWithMultipleDistinctPlaces = 0;
let chaptersWithRoutes = 0;
let multiPlaceChaptersMissingRoutes: { book: string; chapter: number; places: string[] }[] = [];
let totalErrors = 0;

for (const book of BIBLE_BOOKS) {
  for (let ch = 1; ch <= book.chaptersCount; ch++) {
    totalChapters++;
    const data = getChapterGeoData(book.id, ch);

    if (!data) {
      console.error(`ERROR: getChapterGeoData returned null for ${book.id} ${ch}`);
      totalErrors++;
      continue;
    }

    chaptersWithData++;

    const events = data.events || [];
    // Count distinct coordinates among physical events
    const physicalEvents = events.filter(e => !e.isReferencedOnly);
    const targetEvents = physicalEvents.length > 1 ? physicalEvents : events;

    const distinctCoords = new Set(targetEvents.map(e => `${e.lat.toFixed(4)},${e.lng.toFixed(4)}`));
    const isMultiPlace = distinctCoords.size > 1;

    if (isMultiPlace) {
      chaptersWithMultipleDistinctPlaces++;
      const hasRoutes = data.routeSegments && data.routeSegments.length > 0;
      if (hasRoutes) {
        chaptersWithRoutes++;
      } else {
        multiPlaceChaptersMissingRoutes.push({
          book: book.id,
          chapter: ch,
          places: Array.from(new Set(targetEvents.map(e => e.locationName || e.title)))
        });
      }
    }
  }
}

console.log(`Total Chapters Analyzed: ${totalChapters}`);
console.log(`Chapters With Valid Geo Data: ${chaptersWithData}`);
console.log(`Chapters With Multiple Distinct Places: ${chaptersWithMultipleDistinctPlaces}`);
console.log(`Chapters With Active Route Segments: ${chaptersWithRoutes}`);
console.log(`Multi-place Chapters Missing Routes: ${multiPlaceChaptersMissingRoutes.length}`);

if (multiPlaceChaptersMissingRoutes.length > 0) {
  console.log('\nSample chapters with multiple places but no routes:');
  multiPlaceChaptersMissingRoutes.slice(0, 15).forEach(m => {
    console.log(`- ${m.book} ${m.chapter}: ${m.places.join(' -> ')}`);
  });
}
