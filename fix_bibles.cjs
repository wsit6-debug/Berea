const fs = require('fs');

const path = 'src/data/bibleData.ts';
let content = fs.readFileSync(path, 'utf8');

// The Bolls injections look like:
// {
//   id: 'UBIO',
//   apiCode: 'UBIO',
//   name: 'Біблія...',
//   ...
//   badge: 'Ukrainian Bible',
//   ...
//   language: 'en' as any
// }

// I will write a regex to find all Bolls translations where the language is 'en' but the badge is not 'English Bible'.
// Actually, it's easier to just match the whole translation object and check if badge ends with 'Bible' and is not 'English Bible'.

// Let's just find and replace the "language: 'en' as any" with the correct language codes based on the badge!
// Or even easier: The user only wants to see English bibles when English is selected. So we change the language code for these to something else, like 'uk' for Ukrainian, 'ar' for Arabic. That way they don't show up in 'en', but if we add them to the dropdown later they will.

content = content.replace(/badge: 'Ukrainian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'uk' as any"));
content = content.replace(/badge: 'Arabic Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'ar' as any"));
content = content.replace(/badge: 'Afrikaans Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'af' as any"));
content = content.replace(/badge: 'Czech Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'cs' as any"));
content = content.replace(/badge: 'Dutch Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'nl' as any"));
content = content.replace(/badge: 'Farsi Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'fa' as any"));
content = content.replace(/badge: 'Finnish Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'fi' as any"));
content = content.replace(/badge: 'Greek Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'el' as any"));
content = content.replace(/badge: 'Hebrew Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'he' as any"));
content = content.replace(/badge: 'Hungarian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'hu' as any"));
content = content.replace(/badge: 'Indonesian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'id' as any"));
content = content.replace(/badge: 'Lithuanian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'lt' as any"));
content = content.replace(/badge: 'Norwegian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'no' as any"));
content = content.replace(/badge: 'Polish Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'pl' as any"));
content = content.replace(/badge: 'Romanian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'ro' as any"));
content = content.replace(/badge: 'Slovak Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'sk' as any"));
content = content.replace(/badge: 'Swedish Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'sv' as any"));
content = content.replace(/badge: 'Tamil Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'ta' as any"));
content = content.replace(/badge: 'Turkish Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'tr' as any"));
content = content.replace(/badge: 'Vietnamese Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'vi' as any"));
content = content.replace(/badge: 'Syriac Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'syr' as any"));
content = content.replace(/badge: 'Amharic Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'am' as any"));
content = content.replace(/badge: 'Armenian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'hy' as any"));
content = content.replace(/badge: 'Aramaic Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'arc' as any"));
content = content.replace(/badge: 'Cebuano Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'ceb' as any"));
content = content.replace(/badge: 'Croatian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'hr' as any"));
content = content.replace(/badge: 'Danish Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'da' as any"));
content = content.replace(/badge: 'Esperanto Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'eo' as any"));
content = content.replace(/badge: 'Georgian Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'ka' as any"));
content = content.replace(/badge: 'Gothic Bible',[\s\S]*?language: 'en' as any/g, match => match.replace("'en' as any", "'got' as any"));

fs.writeFileSync(path, content);
console.log('Fixed incorrect language codes');
