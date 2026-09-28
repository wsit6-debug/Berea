const fs = require('fs');

const biblesContent = fs.readFileSync('bolls_merge.txt', 'utf8');
const bibleDataPath = 'src/data/bibleData.ts';
let bibleData = fs.readFileSync(bibleDataPath, 'utf8');

// Find the end of the TRANSLATIONS array
const endIndex = bibleData.indexOf('];', bibleData.indexOf('export const TRANSLATIONS: TranslationInfo[] = ['));
if (endIndex !== -1) {
  bibleData = bibleData.slice(0, endIndex) + biblesContent + bibleData.slice(endIndex + 2);
  fs.writeFileSync(bibleDataPath, bibleData);
  console.log('Successfully injected 153 Bibles into bibleData.ts');
} else {
  console.error('Could not find the end of the TRANSLATIONS array.');
}
