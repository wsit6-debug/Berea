import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'src/data/geoDatabase.json');
const rawDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

console.log("===============================================================================");
console.log("AUDITING VERSE ORDERING OF PLACES AND ROUTES ACROSS ENTIRE BIBLE");
console.log("===============================================================================");

interface OrderAnomaly {
  chKey: string;
  e1Name: string;
  e1Verse: number;
  e1Ref: string;
  e2Name: string;
  e2Verse: number;
  e2Ref: string;
  isStoryline: boolean;
}

const storylineAnomalies: OrderAnomaly[] = [];
const referenceAnomalies: OrderAnomaly[] = [];

for (const [chKey, chData] of Object.entries<any>(rawDb)) {
  const events = chData.events || [];
  
  // 1. Check storyline events order
  const storyline = events.filter((e: any) => !e.isReferencedOnly);
  for (let i = 0; i < storyline.length - 1; i++) {
    const e1 = storyline[i];
    const e2 = storyline[i + 1];
    const v1 = (e1.verseRange && e1.verseRange[0]) || 0;
    const v2 = (e2.verseRange && e2.verseRange[0]) || 0;

    if (v1 > v2) {
      storylineAnomalies.push({
        chKey,
        e1Name: e1.locationName,
        e1Verse: v1,
        e1Ref: e1.passageRef,
        e2Name: e2.locationName,
        e2Verse: v2,
        e2Ref: e2.passageRef,
        isStoryline: true
      });
    }
  }

  // 2. Check reference events order
  const refs = events.filter((e: any) => e.isReferencedOnly);
  for (let i = 0; i < refs.length - 1; i++) {
    const e1 = refs[i];
    const e2 = refs[i + 1];
    const v1 = (e1.verseRange && e1.verseRange[0]) || 0;
    const v2 = (e2.verseRange && e2.verseRange[0]) || 0;

    if (v1 > v2) {
      referenceAnomalies.push({
        chKey,
        e1Name: e1.locationName,
        e1Verse: v1,
        e1Ref: e1.passageRef,
        e2Name: e2.locationName,
        e2Verse: v2,
        e2Ref: e2.passageRef,
        isStoryline: false
      });
    }
  }
}

console.log(`Storyline ordering inversions found: ${storylineAnomalies.length}`);
console.log(`Reference ordering inversions found: ${referenceAnomalies.length}`);

console.log("\nSample Storyline Inversions (verse B < verse A):");
storylineAnomalies.slice(0, 30).forEach(a => {
  console.log(`  ${a.chKey}: [${a.e1Name} @ v${a.e1Verse} (${a.e1Ref})] comes BEFORE [${a.e2Name} @ v${a.e2Verse} (${a.e2Ref})]`);
});
