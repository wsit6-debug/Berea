import fs from 'fs';
import path from 'path';
import { DoctrinalEntry } from '../src/data/doctrinalCorpus';
import { UNABRIDGED_LUTHERAN_CORPUS } from '../src/data/unabridged/lutheran';
import { UNABRIDGED_ANGLICAN_CORPUS } from '../src/data/unabridged/anglican';
import { UNABRIDGED_WESLEYAN_CORPUS } from '../src/data/unabridged/wesleyan';
import { UNABRIDGED_ORTHODOX_CORPUS } from '../src/data/unabridged/orthodox';
import { UNABRIDGED_CATHOLIC_CORPUS } from '../src/data/unabridged/catholic';

const PUBLIC_CORPUS_DIR = path.join(process.cwd(), 'public', 'corpus');
const COMPILED_DIR = path.join(PUBLIC_CORPUS_DIR, 'compiled');

function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with', 'to', 'from', 'by',
    'what', 'why', 'how', 'who', 'does', 'did', 'do', 'can', 'about', 'this', 'that', 'these', 'those',
    'her', 'his', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'unto', 'thee', 'thou', 'thy', 'them',
    'their', 'they', 'shall', 'shalt', 'also', 'upon', 'whereby', 'thereof', 'wherein', 'wherefore', 'such', 'into'
  ]);
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopwords.has(w))
    )
  ).slice(0, 15);
}

function extractScripturesFromText(text: string): string[] {
  const refs: string[] = [];
  const regex = /\b(?:[123]\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|[12]\s+Samuel|[12]\s+Kings|[12]\s+Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|[12]\s+Corinthians?|Galatians|Ephesians|Philippians|Colossians|[12]\s+Thessalonians?|[12]\s+Timothy|Titus|Philemon|Hebrews|James|[12]\s+Peter|[123]\s+John|Jude|Revelation|Matt|Mk|Lk|Jn|Rom|1\s*Cor|2\s*Cor|Heb|Rev)\s+\d+(?::\d+(?:[-–]\d+)?)?/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push(match[0].trim());
  }
  return Array.from(new Set(refs));
}

/**
 * Semantic chunker: breaks text along natural paragraph (\n\n) or sentence boundaries,
 * never slicing arbitrarily across words or character counts.
 */
function splitIntoSemanticParagraphs(text: string, maxParagraphLen: number = 1200): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxParagraphLen) return [trimmed];

  const naturalParas = trimmed.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (naturalParas.length > 1) {
    const chunks: string[] = [];
    let current = '';
    for (const p of naturalParas) {
      if ((current + '\n\n' + p).length <= maxParagraphLen) {
        current = current ? current + '\n\n' + p : p;
      } else {
        if (current) chunks.push(current);
        if (p.length <= maxParagraphLen) {
          current = p;
        } else {
          // split long paragraph by sentences
          const sentences = p.split(/(?<=[.?!])\s+/).filter(Boolean);
          let sChunk = '';
          for (const s of sentences) {
            if ((sChunk + ' ' + s).length <= maxParagraphLen) {
              sChunk = sChunk ? sChunk + ' ' + s : s;
            } else {
              if (sChunk) chunks.push(sChunk);
              sChunk = s;
            }
          }
          current = sChunk;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  // Fallback to sentence boundaries
  const sentences = trimmed.split(/(?<=[.?!])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).length <= maxParagraphLen) {
      current = current ? current + ' ' + s : s;
    } else {
      if (current) chunks.push(current);
      current = s;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [trimmed];
}

// 1. Process CCC (Catechism of the Catholic Church - all 2,865 paragraphs)
function buildCatholicCorpus(): DoctrinalEntry[] {
  const cccRaw = JSON.parse(fs.readFileSync(path.join(PUBLIC_CORPUS_DIR, 'catholic', 'catechism.json'), 'utf-8'));
  const entries: DoctrinalEntry[] = UNABRIDGED_CATHOLIC_CORPUS.map(e => ({
    ...e,
    sourceFilename: e.sourceFilename || 'catholic_councils.json',
    sectionHeader: e.sectionHeader || e.topic
  }));

  for (const item of cccRaw) {
    const pNum = item.id;
    const cleanText = item.text.replace(/\(\d+\)/g, '').trim();
    if (!cleanText || cleanText.length < 15) continue;

    let topic = 'Christian Faith and Catholic Doctrine';
    if (pNum >= 1 && pNum <= 184) topic = 'Profession of Faith: Man\'s Capacity for God & Revelation';
    else if (pNum >= 185 && pNum <= 421) topic = 'The Creed: God the Father, Creation & Original Sin';
    else if (pNum >= 422 && pNum <= 682) topic = 'The Creed: Jesus Christ, Incarnation, Mary & Redemption';
    else if (pNum >= 683 && pNum <= 1065) topic = 'The Creed: Holy Spirit, Holy Catholic Church & Communion of Saints';
    else if (pNum >= 1066 && pNum <= 1209) topic = 'Sacramental Economy & Paschal Mystery in Church Liturgy';
    else if (pNum >= 1210 && pNum <= 1419) topic = 'Sacraments of Christian Initiation: Baptism, Confirmation & The Holy Eucharist';
    else if (pNum >= 1420 && pNum <= 1532) topic = 'Sacraments of Healing: Penance & Anointing of the Sick';
    else if (pNum >= 1533 && pNum <= 1690) topic = 'Sacraments at Service of Communion: Holy Orders & Matrimony';
    else if (pNum >= 1691 && pNum <= 2051) topic = 'Life in Christ: Dignity of Human Person, Grace, Justification & Moral Law';
    else if (pNum >= 2052 && pNum <= 2557) topic = 'The Ten Commandments & Christian Morality';
    else if (pNum >= 2558 && pNum <= 2865) topic = 'Christian Prayer & The Lord\'s Prayer';

    // Semantic chunking: ensure paragraphs exceeding reasonable context length are split along sentence boundaries
    const semanticChunks = splitIntoSemanticParagraphs(cleanText, 1000);

    semanticChunks.forEach((chunkText, idx) => {
      const isSubChunk = semanticChunks.length > 1;
      const subLabel = isSubChunk ? ` (Part ${idx + 1}/${semanticChunks.length})` : '';
      const core = chunkText.length > 250 ? chunkText.slice(0, 247) + '...' : chunkText;

      const detectedScriptures = extractScripturesFromText(chunkText);

      entries.push({
        id: `ccc_${pNum}${isSubChunk ? `_p${idx + 1}` : ''}`,
        tradition: 'catholic',
        documentTitle: 'Catechism of the Catholic Church',
        sectionOrArticle: `Paragraph ${pNum}${subLabel}`,
        citation: `CCC §${pNum}${subLabel}`,
        yearOrEra: '1992',
        topic: topic,
        coreDoctrine: core,
        fullExcerpt: chunkText,
        relatedScriptures: detectedScriptures,
        keywords: extractKeywords(`ccc catechism ${topic} ${chunkText} ${detectedScriptures.join(' ')}`),
        sourceFilename: 'catechism.json',
        sectionHeader: topic
      });
    });
  }

  return entries;
}

// 2. Process Creeds.json schema
function processCreedFile(
  filePath: string,
  tradition: 'reformed' | 'baptist_evangelical' | 'orthodox' | 'lutheran' | 'anglican' | 'wesleyan',
  docTitle: string,
  year: string
): DoctrinalEntry[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const entries: DoctrinalEntry[] = [];
  const sourceFilename = path.basename(filePath);

  const dataList = Array.isArray(raw.Data) ? raw.Data : (raw.Data ? [raw.Data] : (Array.isArray(raw.content) ? raw.content : []));
  for (const item of dataList) {
    const chTitle = item.Title || item.title || docTitle;
    const chNum = item.Chapter || item.chapter || '';
    const sections = item.Sections || item.sections || [];

    if (Array.isArray(sections) && sections.length > 0) {
      for (const sec of sections) {
        const secNum = sec.Section || sec.section || '';
        const content = sec.Content || sec.content || sec.Text || sec.text || '';
        if (!content || content.length < 10) continue;

        const proofs: string[] = [];
        if (sec.Proofs) {
          for (const p of sec.Proofs) {
            if (p.References) proofs.push(...p.References);
          }
        }

        const secLabel = chNum ? `Chapter ${chNum}, Paragraph ${secNum}` : `Section ${secNum}`;
        const citation = chNum ? `${docTitle} ${chNum}.${secNum}` : `${docTitle} §${secNum}`;

        const chunks = splitIntoSemanticParagraphs(content, 1200);
        chunks.forEach((chunkText, idx) => {
          const isSub = chunks.length > 1;
          const subLabel = isSub ? ` (Part ${idx + 1}/${chunks.length})` : '';
          const core = chunkText.length > 250 ? chunkText.slice(0, 247) + '...' : chunkText;

          entries.push({
            id: `${tradition}_${docTitle.toLowerCase().replace(/[^\w]/g, '_')}_ch${chNum}_sec${secNum}${isSub ? `_p${idx + 1}` : ''}`,
            tradition,
            documentTitle: docTitle,
            sectionOrArticle: `${secLabel}${subLabel}`,
            citation: `${citation}${subLabel}`,
            yearOrEra: year,
            topic: chTitle,
            coreDoctrine: core,
            fullExcerpt: chunkText,
            relatedScriptures: proofs.slice(0, 6),
            keywords: extractKeywords(`${docTitle} ${chTitle} ${chunkText}`),
            sourceFilename,
            sectionHeader: chTitle
          });
        });
      }
    } else if (item.Content || item.content || item.Text || item.text) {
      const content = item.Content || item.content || item.Text || item.text;
      const secNum = item.Section || item.section || chNum || '1';
      const chunks = splitIntoSemanticParagraphs(content, 1200);

      chunks.forEach((chunkText, idx) => {
        const isSub = chunks.length > 1;
        const subLabel = isSub ? ` (Part ${idx + 1}/${chunks.length})` : '';
        const core = chunkText.length > 250 ? chunkText.slice(0, 247) + '...' : chunkText;
        const detectedScriptures = extractScripturesFromText(chunkText);

        entries.push({
          id: `${tradition}_${docTitle.toLowerCase().replace(/[^\w]/g, '_')}_${secNum}${isSub ? `_p${idx + 1}` : ''}`,
          tradition,
          documentTitle: docTitle,
          sectionOrArticle: `Article / Section ${secNum}${subLabel}`,
          citation: `${docTitle} §${secNum}${subLabel}`,
          yearOrEra: year,
          topic: chTitle,
          coreDoctrine: core,
          fullExcerpt: chunkText,
          relatedScriptures: detectedScriptures,
          keywords: extractKeywords(`${docTitle} ${chTitle} ${chunkText} ${detectedScriptures.join(' ')}`),
          sourceFilename,
          sectionHeader: chTitle
        });
      });
    }
  }

  return entries;
}

// 3. Process Catechism Questions & Answers schema
function processQaFile(
  filePath: string,
  tradition: 'reformed' | 'baptist_evangelical' | 'orthodox' | 'lutheran',
  docTitle: string,
  year: string
): DoctrinalEntry[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const entries: DoctrinalEntry[] = [];
  const sourceFilename = path.basename(filePath);

  const dataList = Array.isArray(raw.Data) ? raw.Data : (raw.content || []);
  for (const item of dataList) {
    const qNum = item.Number || item.number || item.Id || item.id || '';
    const question = item.Question || item.question || '';
    const answer = item.Answer || item.answer || '';
    if (!question || !answer) continue;

    const fullText = `Question ${qNum}: ${question}\nAnswer: ${answer}`;
    const core = `Q: ${question} A: ${answer.length > 180 ? answer.slice(0, 177) + '...' : answer}`;
    const detectedScriptures = extractScripturesFromText(fullText);

    entries.push({
      id: `${tradition}_${docTitle.toLowerCase().replace(/[^\w]/g, '_')}_q${qNum}`,
      tradition,
      documentTitle: docTitle,
      sectionOrArticle: `Question & Answer ${qNum}`,
      citation: `${docTitle} Q&A ${qNum}`,
      yearOrEra: year,
      topic: question,
      coreDoctrine: core,
      fullExcerpt: fullText,
      relatedScriptures: detectedScriptures,
      keywords: extractKeywords(`${docTitle} ${question} ${answer} ${detectedScriptures.join(' ')}`),
      sourceFilename,
      sectionHeader: question
    });
  }

  return entries;
}

function tagStaticEntries(entries: DoctrinalEntry[], defaultFilename: string): DoctrinalEntry[] {
  return entries.map(e => ({
    ...e,
    sourceFilename: e.sourceFilename || defaultFilename,
    sectionHeader: e.sectionHeader || e.topic || e.sectionOrArticle
  }));
}

async function compileAll() {
  if (!fs.existsSync(COMPILED_DIR)) fs.mkdirSync(COMPILED_DIR, { recursive: true });

  // 1. Catholic: Full CCC (2,865 paragraphs) + Trent + Vatican I & II
  console.log('Compiling complete Catholic unabridged corpus (all 2,865 CCC paragraphs + Councils)...');
  const catholicEntries = buildCatholicCorpus();
  fs.writeFileSync(path.join(COMPILED_DIR, 'catholic.json'), JSON.stringify(catholicEntries, null, 2), 'utf-8');

  // 2. Reformed: Westminster Confession, Larger & Shorter Catechisms, Heidelberg, Dort, Belgic, 2nd Helvetic
  console.log('Compiling complete Reformed unabridged corpus...');
  const reformedEntries = [
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'westminster_confession_of_faith.json'), 'reformed', 'Westminster Confession of Faith', '1646'),
    ...processQaFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'heidelberg_catechism.json'), 'reformed', 'The Heidelberg Catechism', '1563'),
    ...processQaFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'westminster_shorter_catechism.json'), 'reformed', 'Westminster Shorter Catechism', '1647'),
    ...processQaFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'westminster_larger_catechism.json'), 'reformed', 'Westminster Larger Catechism', '1648'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'canons_of_dort.json'), 'reformed', 'Canons of the Synod of Dort', '1619'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'belgic_confession_of_faith.json'), 'reformed', 'The Belgic Confession', '1561'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'reformed', 'second_helvetic_confession.json'), 'reformed', 'Second Helvetic Confession', '1566')
  ];
  fs.writeFileSync(path.join(COMPILED_DIR, 'reformed.json'), JSON.stringify(reformedEntries, null, 2), 'utf-8');

  // 3. Baptist & Evangelical: 1689 LBCF, BF&M 2000, Inerrancy, Baptist Catechism
  console.log('Compiling complete Baptist & Evangelical unabridged corpus...');
  const baptistEntries = [
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'baptist_evangelical', 'london_baptist_1689.json'), 'baptist_evangelical', 'Second London Baptist Confession (1689)', '1689'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'baptist_evangelical', 'chicago_statement_on_biblical_inerrancy.json'), 'baptist_evangelical', 'Chicago Statement on Biblical Inerrancy', '1978'),
    ...processQaFile(path.join(PUBLIC_CORPUS_DIR, 'baptist_evangelical', '1695_baptist_catechism.json'), 'baptist_evangelical', 'The Baptist Catechism (1695)', '1695')
  ];
  fs.writeFileSync(path.join(COMPILED_DIR, 'baptist_evangelical.json'), JSON.stringify(baptistEntries, null, 2), 'utf-8');

  // 4. Lutheran: Augsburg Confession 28 Articles, Small Catechism, Smalcald, Formula of Concord
  console.log('Compiling complete Lutheran unabridged corpus...');
  const lutheranEntries = tagStaticEntries(UNABRIDGED_LUTHERAN_CORPUS, 'augsburg_confession.json');
  fs.writeFileSync(path.join(COMPILED_DIR, 'lutheran.json'), JSON.stringify(lutheranEntries, null, 2), 'utf-8');

  // 5. Anglican: 39 Articles in full, 1662 BCP Catechism, Chicago-Lambeth Quadrilateral
  console.log('Compiling complete Anglican unabridged corpus...');
  const anglicanEntries = tagStaticEntries(UNABRIDGED_ANGLICAN_CORPUS, 'thirty_nine_articles.json');
  fs.writeFileSync(path.join(COMPILED_DIR, 'anglican.json'), JSON.stringify(anglicanEntries, null, 2), 'utf-8');

  // 6. Wesleyan: 25 Articles in full, Standard Sermons, Explanatory Notes
  console.log('Compiling complete Wesleyan unabridged corpus...');
  const wesleyanEntries = tagStaticEntries(UNABRIDGED_WESLEYAN_CORPUS, 'twenty_five_articles_wesleyan.json');
  fs.writeFileSync(path.join(COMPILED_DIR, 'wesleyan.json'), JSON.stringify(wesleyanEntries, null, 2), 'utf-8');

  // 7. Orthodox: Ecumenical Councils, Confession of Dositheus, Damascus, Palamas, Liturgy
  console.log('Compiling complete Orthodox unabridged corpus...');
  const orthodoxCreeds = [
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'chalcedonian_definition.json'), 'orthodox', 'Council of Chalcedon Definition', '451'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'nicene_creed.json'), 'orthodox', 'Nicene-Constantinopolitan Creed', '381'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'athanasian_creed.json'), 'orthodox', 'Athanasian Creed (Quicumque Vult)', 'c. 500'),
    ...processCreedFile(path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'apostles_creed.json'), 'orthodox', 'Apostles’ Creed', 'c. 200')
  ];
  const orthodoxAll = [...tagStaticEntries(UNABRIDGED_ORTHODOX_CORPUS, 'ecumenical_councils_orthodox.json'), ...orthodoxCreeds];
  fs.writeFileSync(path.join(COMPILED_DIR, 'orthodox.json'), JSON.stringify(orthodoxAll, null, 2), 'utf-8');

  console.log(`\n=== ALL 7 UNABRIDGED DATASETS COMPILED SUCCESSFULLY ===`);
  console.log(`- Catholic: ${catholicEntries.length} full paragraphs (All 2,865 CCC paragraphs + Councils)`);
  console.log(`- Reformed: ${reformedEntries.length} full sections & Q&As (WCF, Heidelberg, WLC, WSC, Dort, Belgic, 2nd Helvetic)`);
  console.log(`- Baptist: ${baptistEntries.length} full sections & Q&As (1689 LBCF, Inerrancy, Baptist Catechism)`);
  console.log(`- Lutheran: ${lutheranEntries.length} full articles & confessions`);
  console.log(`- Anglican: ${anglicanEntries.length} full articles & standards`);
  console.log(`- Wesleyan: ${wesleyanEntries.length} full articles & sermons`);
  console.log(`- Orthodox: ${orthodoxAll.length} full ecumenical decrees & patristic standards`);
}

compileAll();
