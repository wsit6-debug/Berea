import fs from 'fs';
import path from 'path';

const PUBLIC_CORPUS_DIR = path.join(process.cwd(), 'public', 'corpus');

async function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    console.log(`Downloading from ${url}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[WARN] Failed to fetch ${url} (HTTP ${res.status})`);
      return false;
    }
    const text = await res.text();
    fs.writeFileSync(destPath, text, 'utf-8');
    console.log(`[SAVED] ${destPath} (${(text.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (err: any) {
    console.error(`[ERROR] Download failed for ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('=== STARTING UNABRIDGED CONFESSIONAL CORPUS IMPORT ===\n');

  const dirs = ['catholic', 'orthodox', 'reformed', 'lutheran', 'wesleyan', 'anglican', 'baptist_evangelical'];
  for (const d of dirs) {
    await ensureDir(path.join(PUBLIC_CORPUS_DIR, d));
  }

  // 1. CATHOLIC: Catechism of the Catholic Church (All 2,865 paragraphs)
  await downloadFile(
    'https://github.com/aseemsavio/catholicism-in-json/releases/download/v2.0.0/catechism.json',
    path.join(PUBLIC_CORPUS_DIR, 'catholic', 'catechism.json')
  );

  // 2. REFORMED: Westminster Standards & Three Forms of Unity
  const creedsBase = 'https://raw.githubusercontent.com/NonlinearFruit/Creeds.json/master/creeds/';
  await downloadFile(creedsBase + 'westminster_confession_of_faith.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'westminster_confession_of_faith.json'));
  await downloadFile(creedsBase + 'heidelberg_catechism.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'heidelberg_catechism.json'));
  await downloadFile(creedsBase + 'westminster_larger_catechism.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'westminster_larger_catechism.json'));
  await downloadFile(creedsBase + 'westminster_shorter_catechism.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'westminster_shorter_catechism.json'));
  await downloadFile(creedsBase + 'canons_of_dort.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'canons_of_dort.json'));
  await downloadFile(creedsBase + 'belgic_confession_of_faith.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'belgic_confession_of_faith.json'));
  await downloadFile(creedsBase + 'second_helvetic_confession.json', path.join(PUBLIC_CORPUS_DIR, 'reformed', 'second_helvetic_confession.json'));

  // 3. BAPTIST & EVANGELICAL
  await downloadFile(creedsBase + 'london_baptist_1689.json', path.join(PUBLIC_CORPUS_DIR, 'baptist_evangelical', 'london_baptist_1689.json'));
  await downloadFile(creedsBase + 'chicago_statement_on_biblical_inerrancy.json', path.join(PUBLIC_CORPUS_DIR, 'baptist_evangelical', 'chicago_statement_on_biblical_inerrancy.json'));
  await downloadFile(creedsBase + '1695_baptist_catechism.json', path.join(PUBLIC_CORPUS_DIR, 'baptist_evangelical', '1695_baptist_catechism.json'));

  // 4. ECUMENICAL & ORTHODOX CREEDS
  await downloadFile(creedsBase + 'chalcedonian_definition.json', path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'chalcedonian_definition.json'));
  await downloadFile(creedsBase + 'nicene_creed.json', path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'nicene_creed.json'));
  await downloadFile(creedsBase + 'athanasian_creed.json', path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'athanasian_creed.json'));
  await downloadFile(creedsBase + 'apostles_creed.json', path.join(PUBLIC_CORPUS_DIR, 'orthodox', 'apostles_creed.json'));

  console.log('\n=== DOWNLOAD COMPLETE ===');
}

run();
