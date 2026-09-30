const fs = require('fs');

const path = 'src/data/bibleData.ts';
let content = fs.readFileSync(path, 'utf8');

// The regex matches all Bolls injected Bibles.
let newContent = content.replace(/\{\s*id: '([^']+)',[\s\S]*?description: 'Bolls.life imported translation for [^']+',[\s\S]*?language: '[^']+' as any\s*\}/g, (match, id) => {
    
    // Broaden the search for Catholic/Orthodox
    const lowerMatch = match.toLowerCase();
    
    const isCatholic = lowerMatch.includes('catholic') || 
                       lowerMatch.includes('douay') || 
                       lowerMatch.includes('vulgata') || 
                       lowerMatch.includes('jerusalem') || 
                       lowerMatch.includes('jerusalén') || 
                       lowerMatch.includes('jerusalém') || 
                       lowerMatch.includes('católica') || 
                       lowerMatch.includes('catholique') || 
                       lowerMatch.includes('crampon') || 
                       lowerMatch.includes('dios habla hoy') || 
                       lowerMatch.includes('dhh') || 
                       lowerMatch.includes('torres amat') ||
                       lowerMatch.includes('scio') ||
                       lowerMatch.includes('martin') ||
                       lowerMatch.includes('ave maria') ||
                       lowerMatch.includes('matos soares') ||
                       lowerMatch.includes('cev') || 
                       lowerMatch.includes('tla') || // Traducción en lenguaje actual is often accepted
                       lowerMatch.includes('nti') ||
                       lowerMatch.includes('blp'); // Biblia de la iglesia
                       
    const isOrthodox = lowerMatch.includes('orthodox') || 
                       lowerMatch.includes('septuagint') || 
                       lowerMatch.includes('lxx') || 
                       lowerMatch.includes('synodal') ||
                       lowerMatch.includes('sinodal') ||
                       lowerMatch.includes('csl') ||
                       lowerMatch.includes('orthodoxe');
                       
    let denoms = [];
    if (isCatholic) {
        denoms = ['catholic', 'anglican'];
    } else if (isOrthodox) {
        denoms = ['orthodox'];
    } else {
        denoms = ['reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'];
    }
    
    // Add some hardcoded overrides for major foreign bibles that are widely accepted by protestants
    if (id === 'LBLA' || id === 'NVI' || id === 'RVR60' || id === 'RVR95' || id === 'NBLA' || id === 'LSG' || id === 'BDS' || id === 'NEG79' || id === 'LUTH1545' || id === 'SCH2000' || id === 'NVI_PT' || id === 'ARA' || id === 'ARC' || id === 'NAA') {
        denoms = ['reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'];
    }
    
    // Add some hardcoded overrides for major foreign catholic bibles
    if (id === 'DHH' || id === 'BJ3' || id === 'BTI' || id === 'PDT' || id === 'BFC' || id === 'VULG') {
        denoms = ['catholic', 'anglican'];
    }
    
    // Some are ecumenical
    if (id === 'NVI' || id === 'NRSV' || id === 'TEV' || id === 'GNT') {
        denoms = ['catholic', 'reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'];
    }

    return match.replace(/approvedDenominations: \[[^\]]+\]/, `approvedDenominations: ${JSON.stringify(denoms).replace(/"/g, "'")}`);
});

fs.writeFileSync(path, newContent);
console.log('Fixed foreign Catholic/Orthodox assignments');
