#!/usr/bin/env python3
"""
Build Berea Public Domain Commentary Database.
Extracts full text commentaries from SWORD modules, SFM sources, and Patristic corpora
into static JSON book shards under public/commentaries/<commentator_id>/<book_id>.json.
"""

import os
import sys
import glob
import json
import re
import time

from pysword import bible
from pysword.modules import SwordModules

# Monkeypatch pysword to support commentary drivers (zcom, zcom4, rawcom, rawcom4)
orig_new = bible.SwordBible.__new__
def my_new(cls, *args, **kwargs):
    module_type = kwargs.get('module_type') if 'module_type' in kwargs else (args[1] if len(args) >= 2 else None)
    if module_type:
        mtype = module_type.lower()
        cls_map = {
            'zcom': bible.ZTextModule,
            'zcom4': bible.ZTextModule4,
            'rawcom': bible.RawTextModule,
            'rawcom4': bible.RawTextModule4
        }
        if mtype in cls_map:
            return super(bible.SwordBible, cls).__new__(cls_map[mtype])
    return orig_new(cls, *args, **kwargs)

bible.SwordBible.__new__ = my_new

# Standard Berea 66 Book Definitions
STANDARD_BOOKS = [
    ('genesis', 'Genesis', 'ot'),
    ('exodus', 'Exodus', 'ot'),
    ('leviticus', 'Leviticus', 'ot'),
    ('numbers', 'Numbers', 'ot'),
    ('deuteronomy', 'Deuteronomy', 'ot'),
    ('joshua', 'Joshua', 'ot'),
    ('judges', 'Judges', 'ot'),
    ('ruth', 'Ruth', 'ot'),
    ('1samuel', '1 Samuel', 'ot'),
    ('2samuel', '2 Samuel', 'ot'),
    ('1kings', '1 Kings', 'ot'),
    ('2kings', '2 Kings', 'ot'),
    ('1chronicles', '1 Chronicles', 'ot'),
    ('2chronicles', '2 Chronicles', 'ot'),
    ('ezra', 'Ezra', 'ot'),
    ('nehemiah', 'Nehemiah', 'ot'),
    ('esther', 'Esther', 'ot'),
    ('job', 'Job', 'ot'),
    ('psalms', 'Psalms', 'ot'),
    ('proverbs', 'Proverbs', 'ot'),
    ('ecclesiastes', 'Ecclesiastes', 'ot'),
    ('songofsolomon', 'Song of Solomon', 'ot'),
    ('isaiah', 'Isaiah', 'ot'),
    ('jeremiah', 'Jeremiah', 'ot'),
    ('lamentations', 'Lamentations', 'ot'),
    ('ezekiel', 'Ezekiel', 'ot'),
    ('daniel', 'Daniel', 'ot'),
    ('hosea', 'Hosea', 'ot'),
    ('joel', 'Joel', 'ot'),
    ('amos', 'Amos', 'ot'),
    ('obadiah', 'Obadiah', 'ot'),
    ('jonah', 'Jonah', 'ot'),
    ('micah', 'Micah', 'ot'),
    ('nahum', 'Nahum', 'ot'),
    ('habakkuk', 'Habakkuk', 'ot'),
    ('zephaniah', 'Zephaniah', 'ot'),
    ('haggai', 'Haggai', 'ot'),
    ('zechariah', 'Zechariah', 'ot'),
    ('malachi', 'Malachi', 'ot'),
    ('matthew', 'Matthew', 'nt'),
    ('mark', 'Mark', 'nt'),
    ('luke', 'Luke', 'nt'),
    ('john', 'John', 'nt'),
    ('acts', 'Acts', 'nt'),
    ('romans', 'Romans', 'nt'),
    ('1corinthians', '1 Corinthians', 'nt'),
    ('2corinthians', '2 Corinthians', 'nt'),
    ('galatians', 'Galatians', 'nt'),
    ('ephesians', 'Ephesians', 'nt'),
    ('philippians', 'Philippians', 'nt'),
    ('colossians', 'Colossians', 'nt'),
    ('1thessalonians', '1 Thessalonians', 'nt'),
    ('2thessalonians', '2 Thessalonians', 'nt'),
    ('1timothy', '1 Timothy', 'nt'),
    ('2timothy', '2 Timothy', 'nt'),
    ('titus', 'Titus', 'nt'),
    ('philemon', 'Philemon', 'nt'),
    ('hebrews', 'Hebrews', 'nt'),
    ('james', 'James', 'nt'),
    ('1peter', '1 Peter', 'nt'),
    ('2peter', '2 Peter', 'nt'),
    ('1john', '1 John', 'nt'),
    ('2john', '2 John', 'nt'),
    ('3john', '3 John', 'nt'),
    ('jude', 'Jude', 'nt'),
    ('revelation', 'Revelation', 'nt')
]

BOOK_NORM_MAP = {
    'gen': 'genesis', 'genesis': 'genesis',
    'exo': 'exodus', 'exodus': 'exodus', 'exod': 'exodus',
    'lev': 'leviticus', 'leviticus': 'leviticus',
    'num': 'numbers', 'numbers': 'numbers',
    'deu': 'deuteronomy', 'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy',
    'jos': 'joshua', 'joshua': 'joshua', 'josh': 'joshua',
    'jdg': 'judges', 'judges': 'judges', 'judg': 'judges',
    'rut': 'ruth', 'ruth': 'ruth',
    '1sa': '1samuel', '1samuel': '1samuel', '1 samuel': '1samuel', '1 sam': '1samuel', '1sam': '1samuel', '1-samuel': '1samuel',
    '2sa': '2samuel', '2samuel': '2samuel', '2 samuel': '2samuel', '2 sam': '2samuel', '2sam': '2samuel', '2-samuel': '2samuel',
    '1ki': '1kings', '1kings': '1kings', '1 kings': '1kings', '1 kgs': '1kings', '1kgs': '1kings', '1-kings': '1kings',
    '2ki': '2kings', '2kings': '2kings', '2 kings': '2kings', '2 kgs': '2kings', '2kgs': '2kings', '2-kings': '2kings',
    '1ch': '1chronicles', '1chronicles': '1chronicles', '1 chronicles': '1chronicles', '1 chron': '1chronicles', '1-chronicles': '1chronicles',
    '2ch': '2chronicles', '2chronicles': '2chronicles', '2 chronicles': '2chronicles', '2 chron': '2chronicles', '2-chronicles': '2chronicles',
    'ezr': 'ezra', 'ezra': 'ezra',
    'neh': 'nehemiah', 'nehemiah': 'nehemiah',
    'est': 'esther', 'esther': 'esther', 'esth': 'esther',
    'job': 'job',
    'psa': 'psalms', 'psalms': 'psalms', 'psalm': 'psalms', 'ps': 'psalms',
    'pro': 'proverbs', 'proverbs': 'proverbs', 'prov': 'proverbs',
    'ecc': 'ecclesiastes', 'ecclesiastes': 'ecclesiastes', 'eccl': 'ecclesiastes',
    'sng': 'songofsolomon', 'song of solomon': 'songofsolomon', 'songofsolomon': 'songofsolomon', 'canticles': 'songofsolomon', 'song of songs': 'songofsolomon',
    'isa': 'isaiah', 'isaiah': 'isaiah',
    'jer': 'jeremiah', 'jeremiah': 'jeremiah',
    'lam': 'lamentations', 'lamentations': 'lamentations',
    'ezk': 'ezekiel', 'ezekiel': 'ezekiel', 'ezek': 'ezekiel',
    'dan': 'daniel', 'daniel': 'daniel',
    'hos': 'hosea', 'hosea': 'hosea',
    'jol': 'joel', 'joel': 'joel',
    'amo': 'amos', 'amos': 'amos',
    'oba': 'obadiah', 'obadiah': 'obadiah', 'obad': 'obadiah',
    'jon': 'jonah', 'jonah': 'jonah',
    'mic': 'micah', 'micah': 'micah',
    'nam': 'nahum', 'nahum': 'nahum', 'nah': 'nahum',
    'hab': 'habakkuk', 'habakkuk': 'habakkuk',
    'zep': 'zephaniah', 'zephaniah': 'zephaniah', 'zeph': 'zephaniah',
    'hag': 'haggai', 'haggai': 'haggai',
    'zec': 'zechariah', 'zechariah': 'zechariah', 'zech': 'zechariah',
    'mal': 'malachi', 'malachi': 'malachi',
    'mat': 'matthew', 'matthew': 'matthew', 'matt': 'matthew',
    'mrk': 'mark', 'mark': 'mark',
    'luk': 'luke', 'luke': 'luke',
    'jhn': 'john', 'john': 'john',
    'act': 'acts', 'acts': 'acts',
    'rom': 'romans', 'romans': 'romans',
    '1co': '1corinthians', '1corinthians': '1corinthians', '1 corinthians': '1corinthians', '1 cor': '1corinthians', '1-corinthians': '1corinthians',
    '2co': '2corinthians', '2corinthians': '2corinthians', '2 corinthians': '2corinthians', '2 cor': '2corinthians', '2-corinthians': '2corinthians',
    'gal': 'galatians', 'galatians': 'galatians',
    'eph': 'ephesians', 'ephesians': 'ephesians',
    'php': 'philippians', 'philippians': 'philippians', 'phil': 'philippians',
    'col': 'colossians', 'colossians': 'colossians',
    '1th': '1thessalonians', '1thessalonians': '1thessalonians', '1 thessalonians': '1thessalonians', '1 thess': '1thessalonians', '1-thessalonians': '1thessalonians',
    '2th': '2thessalonians', '2thessalonians': '2thessalonians', '2 thessalonians': '2thessalonians', '2 thess': '2thessalonians', '2-thessalonians': '2thessalonians',
    '1ti': '1timothy', '1timothy': '1timothy', '1 timothy': '1timothy', '1 tim': '1timothy', '1-timothy': '1timothy',
    '2ti': '2timothy', '2timothy': '2timothy', '2 timothy': '2timothy', '2 tim': '2timothy', '2-timothy': '2timothy',
    'tit': 'titus', 'titus': 'titus',
    'phm': 'philemon', 'philemon': 'philemon', 'phlm': 'philemon',
    'heb': 'hebrews', 'hebrews': 'hebrews',
    'jas': 'james', 'james': 'james',
    '1pe': '1peter', '1peter': '1peter', '1 peter': '1peter', '1 pet': '1peter', '1-peter': '1peter',
    '2pe': '2peter', '2peter': '2peter', '2 peter': '2peter', '2 pet': '2peter', '2-peter': '2peter',
    '1jn': '1john', '1john': '1john', '1 john': '1john', '1 jn': '1john', '1-john': '1john',
    '2jn': '2john', '2john': '2john', '2 john': '2john', '2 jn': '2john', '2-john': '2john',
    '3jn': '3john', '3john': '3john', '3 john': '3john', '3 jn': '3john', '3-john': '3john',
    'jud': 'jude', 'jude': 'jude',
    'rev': 'revelation', 'revelation': 'revelation', 'apocalypse': 'revelation'
}

OUTPUT_BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'commentaries'))
os.makedirs(OUTPUT_BASE, exist_ok=True)

def clean_text(raw: str) -> str:
    if not raw:
        return ""
    # Strip HTML / OSIS tags
    t = re.sub(r'<[^>]+>', ' ', raw)
    # Unescape common entities
    t = t.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'")
    # Consolidate whitespace
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def deduplicate_chapter_verses(ch_verses: dict) -> dict:
    seen = {}
    deduped = {}
    sorted_keys = sorted(ch_verses.keys(), key=lambda x: int(x))
    for k in sorted_keys:
        txt = ch_verses[k]
        if txt in seen:
            deduped[k] = f"@{seen[txt]}"
        else:
            seen[txt] = k
            deduped[k] = txt
    return deduped

def export_sword_module(mod_name: str, commentator_id: str, modules: SwordModules):
    print(f"=== Exporting SWORD module: {mod_name} -> {commentator_id} ===")
    out_dir = os.path.join(OUTPUT_BASE, commentator_id)
    os.makedirs(out_dir, exist_ok=True)

    try:
        b = modules.get_bible_from_module(mod_name)
    except Exception as e:
        print(f"Error loading module {mod_name}: {e}")
        return

    struct_books = b.get_structure().get_books()
    all_books = struct_books.get('ot', []) + struct_books.get('nt', [])

    for s_bk in all_books:
        norm_key = BOOK_NORM_MAP.get(s_bk.name.lower())
        if not norm_key:
            norm_key = BOOK_NORM_MAP.get(s_bk.preferred_abbreviation.lower())
        if not norm_key:
            continue

        book_data = {}
        for ch_idx, num_verses in enumerate(s_bk.chapter_lengths):
            ch_num = ch_idx + 1
            verses_iter = b.get_iter(books=[s_bk.name], chapters=[ch_num], clean=True)
            ch_verses = {}
            v_idx = 1
            for raw_v in verses_iter:
                txt = clean_text(raw_v)
                if txt:
                    ch_verses[str(v_idx)] = txt
                v_idx += 1
            if ch_verses:
                book_data[str(ch_num)] = deduplicate_chapter_verses(ch_verses)

        if book_data:
            out_file = os.path.join(out_dir, f"{norm_key}.json")
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, ensure_ascii=False)
            print(f"  [{commentator_id}] {norm_key}: {len(book_data)} chapters")

def export_haydock(repo_path: str):
    print(f"=== Exporting Haydock from SFM: {repo_path} ===")
    out_dir = os.path.join(OUTPUT_BASE, 'haydock')
    os.makedirs(out_dir, exist_ok=True)

    sfm_files = glob.glob(os.path.join(repo_path, '*.sfm'))
    for sfm_file in sfm_files:
        basename = os.path.basename(sfm_file)
        # e.g., 52-JHN-ENG[B]DRC1750[pd].p.sfm -> JHN
        m = re.search(r'^\d+-([A-Z0-9]+)-', basename)
        if not m:
            continue
        code = m.group(1).lower()
        norm_key = BOOK_NORM_MAP.get(code)
        if not norm_key:
            continue

        with open(sfm_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Matches: \f + \fr 1:4\ft In him... \f*
        notes = re.findall(r'\\f\s*\+\s*\\fr\s*(\d+):(\d+)(?:[-–]\d+)?\s*\\ft\s*(.*?)\\f\*', content, re.DOTALL)
        if not notes:
            continue

        book_data = {}
        for ch, v, txt in notes:
            cleaned = clean_text(txt)
            if cleaned:
                if ch not in book_data:
                    book_data[ch] = {}
                # If verse note already exists, append
                if v in book_data[ch]:
                    book_data[ch][v] += " " + cleaned
                else:
                    book_data[ch][v] = cleaned

        if book_data:
            out_file = os.path.join(out_dir, f"{norm_key}.json")
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, ensure_ascii=False)
            print(f"  [haydock] {norm_key}: {len(book_data)} chapters ({sum(len(v) for v in book_data.values())} verses)")

def export_lapide(xml_path: str):
    print(f"=== Exporting Cornelius a Lapide from XML: {xml_path} ===")
    out_dir = os.path.join(OUTPUT_BASE, 'lapide')
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(xml_path):
        print(f"File not found: {xml_path}")
        return

    with open(xml_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern: <div type="section" annotateType="commentary" annotateRef="Matt.1.1"> ... </div>
    sections = re.findall(r'<div[^>]*annotateRef="([^\"]+)"[^>]*>(.*?)</div>', content, re.DOTALL)
    books_collected = {}

    for ref, sec_html in sections:
        # Ref format: Matt.1.1 or Matt.1.6-Matt.1.7 or Mark.3.1
        # Extract book, chapter, verse
        ref_match = re.match(r'([A-Za-z0-9]+)\.(\d+)\.(\d+)', ref)
        if not ref_match:
            continue
        bk_code, ch, v = ref_match.groups()
        norm_key = BOOK_NORM_MAP.get(bk_code.lower())
        if not norm_key:
            continue

        txt = clean_text(sec_html)
        if not txt:
            continue

        if norm_key not in books_collected:
            books_collected[norm_key] = {}
        if ch not in books_collected[norm_key]:
            books_collected[norm_key][ch] = {}
        books_collected[norm_key][ch][v] = txt

    for norm_key, book_data in books_collected.items():
        out_file = os.path.join(out_dir, f"{norm_key}.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(book_data, f, ensure_ascii=False)
        print(f"  [lapide] {norm_key}: {len(book_data)} chapters")

def export_patristic_repo(father_dir: str, commentator_id: str):
    print(f"=== Exporting Patristic: {father_dir} -> {commentator_id} ===")
    out_dir = os.path.join(OUTPUT_BASE, commentator_id)
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(father_dir):
        print(f"Directory not found: {father_dir}")
        return

    # Files are named like: "1 Corinthians 10_1.toml" or "Matthew 5_3-12.toml"
    toml_files = glob.glob(os.path.join(father_dir, '*.toml'))
    books_collected = {}

    for toml_path in toml_files:
        basename = os.path.splitext(os.path.basename(toml_path))[0]
        # Match "Book Name Chapter_Verse"
        match = re.match(r'^(.+?)\s+(\d+)_(\d+)', basename)
        if not match:
            continue
        book_name, ch, v = match.groups()
        norm_key = BOOK_NORM_MAP.get(book_name.lower())
        if not norm_key:
            continue

        with open(toml_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract quote='''...''' or source_title="..."
        quote_match = re.search(r"quote\s*=\s*'''(.*?)'''", content, re.DOTALL)
        if not quote_match:
            quote_match = re.search(r'quote\s*=\s*"(.*?)"', content, re.DOTALL)

        if not quote_match:
            continue

        txt = clean_text(quote_match.group(1))
        if not txt:
            continue

        source_title_match = re.search(r'source_title\s*=\s*"(.*?)"', content)
        if source_title_match:
            title = source_title_match.group(1).strip()
            txt = f"[{title}]\n\n{txt}"

        if norm_key not in books_collected:
            books_collected[norm_key] = {}
        if ch not in books_collected[norm_key]:
            books_collected[norm_key][ch] = {}

        if v in books_collected[norm_key][ch]:
            books_collected[norm_key][ch][v] += "\n\n---\n\n" + txt
        else:
            books_collected[norm_key][ch][v] = txt

    for norm_key, book_data in books_collected.items():
        out_file = os.path.join(out_dir, f"{norm_key}.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(book_data, f, ensure_ascii=False)
        print(f"  [{commentator_id}] {norm_key}: {len(book_data)} chapters ({sum(len(v) for v in book_data.values())} verses)")

def main():
    start_time = time.time()
    sword_dir = '/tmp/sword_mods'
    modules = SwordModules(sword_dir)
    modules.parse_modules()

    # 1. SWORD Modules
    sword_mapping = [
        ('MHC', 'henry'),
        ('CalvinCommentaries', 'calvin'),
        ('Clarke', 'clarke'),
        ('JFB', 'jfb'),
        ('Wesley', 'wesley'),
        ('Gill', 'gill'),
        ('Kretzmann', 'kretzmann'),
        ('Luther', 'luther'),
        ('KD', 'keil_delitzsch'),
        ('RWP', 'robertson'),
        ('TDavid', 'spurgeon'),
        ('Catena', 'aquinas')
    ]

    for mod_name, commentator_id in sword_mapping:
        export_sword_module(mod_name, commentator_id, modules)

    # 2. Haydock SFM
    haydock_repo = '/tmp/haydock_repo'
    if os.path.exists(haydock_repo):
        export_haydock(haydock_repo)

    # 3. Cornelius a Lapide XML
    lapide_xml = '/tmp/sword_mods/lapide.xml'
    if os.path.exists(lapide_xml):
        export_lapide(lapide_xml)

    # 4. John Chrysostom
    chrysostom_dir = '/tmp/chrysostom_repo/John Chrysostom'
    if os.path.exists(chrysostom_dir):
        export_patristic_repo(chrysostom_dir, 'chrysostom')

    # 5. Theophylact of Ohrid
    theophylact_dir = '/tmp/chrysostom_repo/Theophylact of Ohrid'
    if os.path.exists(theophylact_dir):
        export_patristic_repo(theophylact_dir, 'theophylact')

    elapsed = time.time() - start_time
    print(f"\n==========================================")
    print(f"Commentary database build complete in {elapsed:.1f}s!")
    print(f"==========================================")

if __name__ == '__main__':
    main()
