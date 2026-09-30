const fs = require('fs');

const path = 'src/data/bibleData.ts';
let content = fs.readFileSync(path, 'utf8');

// I am going to undo the 'give everything to everyone' hack I did earlier to the original foreign bibles.
const originalMappings = {
    'LBLA': ['baptist_evangelical', 'reformed'],
    'NVI': ['baptist_evangelical', 'wesleyan'],
    'LSG': ['reformed', 'baptist_evangelical'],
    'LUTH1545': ['lutheran', 'reformed'],
    'NVI_PT': ['baptist_evangelical', 'wesleyan'],
    'CUV': ['reformed', 'baptist_evangelical', 'wesleyan'],
    'KRV': ['reformed', 'baptist_evangelical', 'wesleyan'],
    'JCB': ['baptist_evangelical', 'reformed'],
    'CEI': ['catholic'],
    'SYNO': ['orthodox'],
    'MBBTAG': ['baptist_evangelical', 'wesleyan'],
    'VULG': ['catholic']
};

for (const [id, denoms] of Object.entries(originalMappings)) {
    // Regex to match the specific object with this ID. Note it's the non-Bolls one.
    const regex = new RegExp(`\\{\\s*id: '${id}',[\\s\\S]*?approvedDenominations: \\[[^\\]]+\\],[\\s\\S]*?\\}`);
    content = content.replace(regex, (match) => {
        // If it's a bolls one it wouldn't match this regex if we ensure we don't accidentally match Bolls?
        // Actually, the bolls ones were deduped or don't match the same structure, but even if they do, we want to fix their denoms too.
        return match.replace(/approvedDenominations: \[[^\]]+\]/, `approvedDenominations: ${JSON.stringify(denoms).replace(/"/g, "'")}`);
    });
}

fs.writeFileSync(path, content);
console.log('Restored strict denominations for original foreign bibles');
