const fs = require('fs');

const path = 'src/data/bibleData.ts';
let content = fs.readFileSync(path, 'utf8');

// Parse out the TRANSLATIONS array
// We can just use an eval-like approach by writing a regex or by literally parsing it.
// Actually, it's easier to just do a string manipulation.

// Let's just fix the Catholic problem for English Bibles that were injected by Bolls.
// Any translation with language: 'en' that was injected by bolls has `description: 'Bolls.life imported translation for English.'`.
// We can change their approved denominations if they aren't Catholic.

let newContent = content.replace(/\{\s*id: '([^']+)',[\s\S]*?description: 'Bolls.life imported translation for English.',[\s\S]*?language: 'en' as any\s*\}/g, (match, id) => {
    // If it's a Catholic bible, leave it as is or set to catholic
    const isCatholic = match.toLowerCase().includes('catholic') || match.toLowerCase().includes('douay');
    const isOrthodox = match.toLowerCase().includes('orthodox') || match.toLowerCase().includes('septuagint') || match.toLowerCase().includes('lxx');
    
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

// For duplicates, let's just find duplicates of the 15 original ones and remove the Bolls versions.
const originalIds = ['KJV', 'NIV', 'ESV', 'NLT', 'NASB', 'CSB', 'RSV', 'NRSV', 'NKJV', 'AMP', 'MSG', 'CEV', 'GNT', 'TPT', 'WEB', 'RSVCE', 'NABRE', 'NRSVCE', 'DRB', 'LSG', 'LBLA', 'NVI', 'LUTH1545', 'NVI_PT', 'CUV', 'KRV', 'JCB', 'CEI', 'SYNO'];

for (const id of originalIds) {
    // Regex to remove the BOLLS version of these
    const regex = new RegExp(`\\s*,?\\s*\\{\\s*id: '${id}',[\\s\\S]*?description: 'Bolls\\.life imported translation for[\\s\\S]*?\\}`);
    newContent = newContent.replace(regex, '');
}

fs.writeFileSync(path, newContent);
console.log('Fixed Bolls Catholic/Orthodox English denominations and removed duplicates');
