const fs = require('fs');

async function main() {
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

  for (const langObj of languages) {
    const rawLang = langObj.language.toLowerCase();
    
    let code = 'en';
    for (const [key, value] of Object.entries(langMap)) {
      if (rawLang.includes(key)) {
        code = value;
        break;
      }
    }
    
    for (const trans of langObj.translations) {
      newTranslations.push({
        id: trans.short_name,
        apiCode: trans.short_name,
        name: trans.full_name.replace(/'/g, "\\'"),
        year: 'Unknown',
        philosophy: 'Unknown',
        badge: `${langObj.language.split(' ')[0]} Bible`.replace(/'/g, "\\'"),
        approvedDenominations: ['catholic', 'orthodox', 'reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'],
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
    approvedDenominations: ['catholic', 'orthodox', 'reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'],
    description: '${t.description}',
    language: '${t.language}' as any
  }`;
  });
  
  fs.writeFileSync('bolls_merge.txt', output);
  console.log(`Wrote ${newTranslations.length} translations to bolls_merge.txt`);
}

main().catch(console.error);
