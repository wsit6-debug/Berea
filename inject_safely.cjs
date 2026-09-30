const fs = require('fs');

async function main() {
  const path = 'src/data/bibleData.ts';
  let bibleData = fs.readFileSync(path, 'utf8');

  // Extract all existing translation IDs from bibleData.ts
  const existingIdsMatch = [...bibleData.matchAll(/id:\s*'([^']+)'/g)];
  const existingIds = new Set(existingIdsMatch.map(m => m[1]));

  const res = await fetch('https://bolls.life/static/bolls/app/views/languages.json');
  const languages = await res.json();
  
  let newTranslations = [];
  
  const langMap = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'portuguese': 'pt',
    'chinese': 'zh',
    'korean': 'ko',
    'japanese': 'ja',
    'italian': 'it',
    'russian': 'ru',
    'tagalog': 'tl',
    'latin': 'la'
  };
  
  // Custom ISO mappings for other Bolls languages
  const exactLangMap = {
    'ukrainian': 'uk',
    'arabic': 'ar',
    'afrikaans': 'af',
    'czech': 'cs',
    'dutch': 'nl',
    'farsi': 'fa',
    'finnish': 'fi',
    'greek': 'el',
    'hebrew': 'he',
    'hungarian': 'hu',
    'indonesian': 'id',
    'lithuanian': 'lt',
    'norwegian': 'no',
    'polish': 'pl',
    'romanian': 'ro',
    'slovak': 'sk',
    'swedish': 'sv',
    'tamil': 'ta',
    'turkish': 'tr',
    'vietnamese': 'vi',
    'syriac': 'syr',
    'amharic': 'am',
    'armenian': 'hy',
    'aramaic': 'arc',
    'cebuano': 'ceb',
    'croatian': 'hr',
    'danish': 'da',
    'esperanto': 'eo',
    'georgian': 'ka',
    'gothic': 'got'
  };

  for (const langObj of languages) {
    const rawLang = langObj.language.toLowerCase();
    
    let code = 'en';
    for (const [key, value] of Object.entries(langMap)) {
      if (rawLang.includes(key)) {
        code = value;
        break;
      }
    }
    
    // Check exact map if not in langMap (wait, langMap defaults to 'en'. Let's overwrite code if exact matches)
    for (const [key, value] of Object.entries(exactLangMap)) {
      if (rawLang.includes(key)) {
        code = value;
        break;
      }
    }

    for (const trans of langObj.translations) {
      if (existingIds.has(trans.short_name)) {
          continue; // Skip duplicates (like KJV, ESV, etc)
      }
      
      const transName = trans.full_name.toLowerCase();
      const isCatholic = transName.includes('catholic') || transName.includes('douay') || transName.includes('vulgata') || transName.includes('jerusalem');
      const isOrthodox = transName.includes('orthodox') || transName.includes('septuagint') || transName.includes('lxx') || transName.includes('synodal');
      
      let denoms = [];
      if (isCatholic) {
          denoms = ['catholic', 'anglican'];
      } else if (isOrthodox) {
          denoms = ['orthodox'];
      } else {
          denoms = ['reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'];
      }

      newTranslations.push({
        id: trans.short_name,
        apiCode: trans.short_name,
        name: trans.full_name.replace(/'/g, "\\'"),
        year: 'Unknown',
        philosophy: 'Unknown',
        badge: `${langObj.language.split(' ')[0]} Bible`.replace(/'/g, "\\'"),
        approvedDenominations: denoms,
        description: `Bolls.life imported translation for ${langObj.language.replace(/'/g, "\\'")}.`,
        language: code
      });
    }
  }

  let output = `\n// --- AUTO GENERATED BOLLS LIFE TRANSLATIONS ---\n`;
  newTranslations.forEach(t => {
    output += `  ,\n  {
    id: '${t.id}',
    apiCode: '${t.apiCode}',
    name: '${t.name}',
    year: '${t.year}',
    philosophy: '${t.philosophy}',
    badge: '${t.badge}',
    approvedDenominations: ${JSON.stringify(t.approvedDenominations).replace(/"/g, "'")},
    description: '${t.description}',
    language: '${t.language}' as any
  }`;
  });

  const endIndex = bibleData.indexOf('];', bibleData.indexOf('export const TRANSLATIONS: TranslationInfo[] = ['));
  if (endIndex !== -1) {
    bibleData = bibleData.slice(0, endIndex) + output + '\n' + bibleData.slice(endIndex);
    fs.writeFileSync(path, bibleData);
    console.log(`Successfully injected ${newTranslations.length} UNIQUE Bibles into bibleData.ts`);
  } else {
    console.error('Could not find the end of the TRANSLATIONS array.');
  }
}

main().catch(console.error);
