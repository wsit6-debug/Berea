const fs = require('fs');

const path = 'src/data/bibleData.ts';
let content = fs.readFileSync(path, 'utf8');

// Apply strict denomination filtering to ALL Bibles (including foreign languages) injected by Bolls.
let newContent = content.replace(/\{\s*id: '([^']+)',[\s\S]*?description: 'Bolls.life imported translation for [^']+',[\s\S]*?language: '[^']+' as any\s*\}/g, (match, id) => {
    // If it's a Catholic bible, leave it as is or set to catholic
    // Look for keywords in the name or id that suggest Catholic/Orthodox
    const lowerMatch = match.toLowerCase();
    const isCatholic = lowerMatch.includes('catholic') || lowerMatch.includes('douay') || lowerMatch.includes('vulgata') || lowerMatch.includes('dios habla hoy') || lowerMatch.includes('dhh') || lowerMatch.includes('jerusalem') || lowerMatch.includes('scio') || lowerMatch.includes('torres') || lowerMatch.includes('martin');
    const isOrthodox = lowerMatch.includes('orthodox') || lowerMatch.includes('septuagint') || lowerMatch.includes('lxx') || lowerMatch.includes('synodal');
    
    let denoms = [];
    if (isCatholic) {
        denoms = ['catholic', 'anglican'];
    } else if (isOrthodox) {
        denoms = ['orthodox'];
    } else {
        denoms = ['reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'];
    }
    
    // Replace the approvedDenominations array
    return match.replace(/approvedDenominations: \[[^\]]+\]/, `approvedDenominations: ${JSON.stringify(denoms).replace(/"/g, "'")}`);
});

fs.writeFileSync(path, newContent);
console.log('Strict denomination applied to ALL languages');
