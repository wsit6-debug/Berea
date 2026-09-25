import sqlite3
import re
import json
import os

DB_PATH = 'scripts/ai_chapter_summary.db'
OUTPUT_JSON = 'src/data/allChaptersTypology.json'

BIBLE_CANON = [
    (1, "genesis", "Genesis", "Creation & Patriarchs"),
    (2, "exodus", "Exodus", "Exodus & Kingdom"),
    (3, "leviticus", "Leviticus", "Exodus & Kingdom"),
    (4, "numbers", "Numbers", "Exodus & Kingdom"),
    (5, "deuteronomy", "Deuteronomy", "Exodus & Kingdom"),
    (6, "joshua", "Joshua", "Exodus & Kingdom"),
    (7, "judges", "Judges", "Exodus & Kingdom"),
    (8, "ruth", "Ruth", "Exodus & Kingdom"),
    (9, "1samuel", "1 Samuel", "Exodus & Kingdom"),
    (10, "2samuel", "2 Samuel", "Exodus & Kingdom"),
    (11, "1kings", "1 Kings", "Exodus & Kingdom"),
    (12, "2kings", "2 Kings", "Exodus & Kingdom"),
    (13, "1chronicles", "1 Chronicles", "Exodus & Kingdom"),
    (14, "2chronicles", "2 Chronicles", "Exodus & Kingdom"),
    (15, "ezra", "Ezra", "Exodus & Kingdom"),
    (16, "nehemiah", "Nehemiah", "Exodus & Kingdom"),
    (17, "esther", "Esther", "Exodus & Kingdom"),
    (18, "job", "Job", "Exodus & Kingdom"),
    (19, "psalms", "Psalms", "Exodus & Kingdom"),
    (20, "proverbs", "Proverbs", "Exodus & Kingdom"),
    (21, "ecclesiastes", "Ecclesiastes", "Exodus & Kingdom"),
    (22, "songofsolomon", "Song of Solomon", "Exodus & Kingdom"),
    (23, "isaiah", "Isaiah", "Prophets"),
    (24, "jeremiah", "Jeremiah", "Prophets"),
    (25, "lamentations", "Lamentations", "Prophets"),
    (26, "ezekiel", "Ezekiel", "Prophets"),
    (27, "daniel", "Daniel", "Prophets"),
    (28, "hosea", "Hosea", "Prophets"),
    (29, "joel", "Joel", "Prophets"),
    (30, "amos", "Amos", "Prophets"),
    (31, "obadiah", "Obadiah", "Prophets"),
    (32, "jonah", "Jonah", "Prophets"),
    (33, "micah", "Micah", "Prophets"),
    (34, "nahum", "Nahum", "Prophets"),
    (35, "habakkuk", "Habakkuk", "Prophets"),
    (36, "zephaniah", "Zephaniah", "Prophets"),
    (37, "haggai", "Haggai", "Prophets"),
    (38, "zechariah", "Zechariah", "Prophets"),
    (39, "malachi", "Malachi", "Prophets"),
    (40, "matthew", "Matthew", "Gospels"),
    (41, "mark", "Mark", "Gospels"),
    (42, "luke", "Luke", "Gospels"),
    (43, "john", "John", "Gospels"),
    (44, "acts", "Acts", "Acts & Epistles"),
    (45, "romans", "Romans", "Acts & Epistles"),
    (46, "1corinthians", "1 Corinthians", "Acts & Epistles"),
    (47, "2corinthians", "2 Corinthians", "Acts & Epistles"),
    (48, "galatians", "Galatians", "Acts & Epistles"),
    (49, "ephesians", "Ephesians", "Acts & Epistles"),
    (50, "philippians", "Philippians", "Acts & Epistles"),
    (51, "colossians", "Colossians", "Acts & Epistles"),
    (52, "1thessalonians", "1 Thessalonians", "Acts & Epistles"),
    (53, "2thessalonians", "2 Thessalonians", "Acts & Epistles"),
    (54, "1timothy", "1 Timothy", "Acts & Epistles"),
    (55, "2timothy", "2 Timothy", "Acts & Epistles"),
    (56, "titus", "Titus", "Acts & Epistles"),
    (57, "philemon", "Philemon", "Acts & Epistles"),
    (58, "hebrews", "Hebrews", "Acts & Epistles"),
    (59, "james", "James", "Acts & Epistles"),
    (60, "1peter", "1 Peter", "Acts & Epistles"),
    (61, "2peter", "2 Peter", "Acts & Epistles"),
    (62, "1john", "1 John", "Acts & Epistles"),
    (63, "2john", "2 John", "Acts & Epistles"),
    (64, "3john", "3 John", "Acts & Epistles"),
    (65, "jude", "Jude", "Acts & Epistles"),
    (66, "revelation", "Revelation", "Revelation")
]

DEUTEROCANON = [
    ("tobit", "Tobit", "Exodus & Kingdom", 14),
    ("judith", "Judith", "Exodus & Kingdom", 16),
    ("wisdom", "Wisdom of Solomon", "Exodus & Kingdom", 19),
    ("sirach", "Sirach", "Exodus & Kingdom", 51),
    ("baruch", "Baruch", "Prophets", 6),
    ("1maccabees", "1 Maccabees", "Exodus & Kingdom", 16),
    ("2maccabees", "2 Maccabees", "Exodus & Kingdom", 15)
]

ALL_ERAS = [
    'Creation & Patriarchs',
    'Exodus & Kingdom',
    'Prophets',
    'Gospels',
    'Acts & Epistles',
    'Revelation'
]

BOOK_TO_ERA = {
    'genesis': 'Creation & Patriarchs', 'gen': 'Creation & Patriarchs',
    'exodus': 'Exodus & Kingdom', 'exo': 'Exodus & Kingdom', 'leviticus': 'Exodus & Kingdom', 'lev': 'Exodus & Kingdom',
    'numbers': 'Exodus & Kingdom', 'num': 'Exodus & Kingdom', 'deuteronomy': 'Exodus & Kingdom', 'deu': 'Exodus & Kingdom',
    'joshua': 'Exodus & Kingdom', 'jos': 'Exodus & Kingdom', 'judges': 'Exodus & Kingdom', 'jdg': 'Exodus & Kingdom',
    'ruth': 'Exodus & Kingdom', 'rut': 'Exodus & Kingdom', '1samuel': 'Exodus & Kingdom', '1sa': 'Exodus & Kingdom',
    '2samuel': 'Exodus & Kingdom', '2sa': 'Exodus & Kingdom', '1kings': 'Exodus & Kingdom', '1ki': 'Exodus & Kingdom',
    '2kings': 'Exodus & Kingdom', '2ki': 'Exodus & Kingdom', '1chronicles': 'Exodus & Kingdom', '1ch': 'Exodus & Kingdom',
    '2chronicles': 'Exodus & Kingdom', '2ch': 'Exodus & Kingdom', 'ezra': 'Exodus & Kingdom', 'ezr': 'Exodus & Kingdom',
    'nehemiah': 'Exodus & Kingdom', 'neh': 'Exodus & Kingdom', 'esther': 'Exodus & Kingdom', 'est': 'Exodus & Kingdom',
    'job': 'Exodus & Kingdom', 'psalms': 'Exodus & Kingdom', 'psalm': 'Exodus & Kingdom', 'psa': 'Exodus & Kingdom',
    'proverbs': 'Exodus & Kingdom', 'pro': 'Exodus & Kingdom', 'ecclesiastes': 'Exodus & Kingdom', 'ecc': 'Exodus & Kingdom',
    'songofsolomon': 'Exodus & Kingdom', 'song of solomon': 'Exodus & Kingdom', 'song of songs': 'Exodus & Kingdom', 'sos': 'Exodus & Kingdom',
    'isaiah': 'Prophets', 'isa': 'Prophets', 'jeremiah': 'Prophets', 'jer': 'Prophets', 'lamentations': 'Prophets', 'lam': 'Prophets',
    'ezekiel': 'Prophets', 'eze': 'Prophets', 'daniel': 'Prophets', 'dan': 'Prophets', 'hosea': 'Prophets', 'hos': 'Prophets',
    'joel': 'Prophets', 'joe': 'Prophets', 'amos': 'Prophets', 'amo': 'Prophets', 'obadiah': 'Prophets', 'oba': 'Prophets',
    'jonah': 'Prophets', 'jon': 'Prophets', 'micah': 'Prophets', 'mic': 'Prophets', 'nahum': 'Prophets', 'nah': 'Prophets',
    'habakkuk': 'Prophets', 'hab': 'Prophets', 'zephaniah': 'Prophets', 'zep': 'Prophets', 'haggai': 'Prophets', 'hag': 'Prophets',
    'zechariah': 'Prophets', 'zec': 'Prophets', 'malachi': 'Prophets', 'mal': 'Prophets',
    'matthew': 'Gospels', 'mat': 'Gospels', 'mark': 'Gospels', 'mar': 'Gospels', 'luke': 'Gospels', 'luk': 'Gospels',
    'john': 'Gospels', 'joh': 'Gospels',
    'acts': 'Acts & Epistles', 'act': 'Acts & Epistles', 'romans': 'Acts & Epistles', 'rom': 'Acts & Epistles',
    '1corinthians': 'Acts & Epistles', '1co': 'Acts & Epistles', '2corinthians': 'Acts & Epistles', '2co': 'Acts & Epistles',
    'galatians': 'Acts & Epistles', 'gal': 'Acts & Epistles', 'ephesians': 'Acts & Epistles', 'eph': 'Acts & Epistles',
    'philippians': 'Acts & Epistles', 'php': 'Acts & Epistles', 'colossians': 'Acts & Epistles', 'col': 'Acts & Epistles',
    '1thessalonians': 'Acts & Epistles', '1th': 'Acts & Epistles', '2thessalonians': 'Acts & Epistles', '2th': 'Acts & Epistles',
    '1timothy': 'Acts & Epistles', '1ti': 'Acts & Epistles', '2timothy': 'Acts & Epistles', '2ti': 'Acts & Epistles',
    'titus': 'Acts & Epistles', 'tit': 'Acts & Epistles', 'philemon': 'Acts & Epistles', 'phm': 'Acts & Epistles',
    'hebrews': 'Acts & Epistles', 'heb': 'Acts & Epistles', 'james': 'Acts & Epistles', 'jam': 'Acts & Epistles',
    '1peter': 'Acts & Epistles', '1pe': 'Acts & Epistles', '2peter': 'Acts & Epistles', '2pe': 'Acts & Epistles',
    '1john': 'Acts & Epistles', '1jn': 'Acts & Epistles', '2john': 'Acts & Epistles', '2jn': 'Acts & Epistles',
    '3john': 'Acts & Epistles', '3jn': 'Acts & Epistles', 'jude': 'Acts & Epistles', 'jud': 'Acts & Epistles',
    'revelation': 'Revelation', 'rev': 'Revelation'
}

CANONICAL_ERA_ANCHORS = {
    'Creation & Patriarchs': {
        'reference': 'Genesis 3:15, 12:1–3',
        'event': 'The Protoevangelium & Abrahamic Covenant',
        'significance': 'The foundational promise of redemption through the Seed of the woman crushing the serpent.'
    },
    'Exodus & Kingdom': {
        'reference': 'Exodus 12:13, 2 Samuel 7:12–16',
        'event': 'The Passover Lamb & Eternal Davidic Throne',
        'significance': 'Deliverance through blood and the royal covenant establishing an everlasting kingdom.'
    },
    'Prophets': {
        'reference': 'Isaiah 53:5–6, Daniel 7:13–14',
        'event': 'The Pierced Servant & Heavenly Son of Man',
        'significance': 'Prophetic announcement of vicarious atonement and the universal reign of the Messiah.'
    },
    'Gospels': {
        'reference': 'John 1:14, Luke 24:44–47',
        'event': 'Incarnation, Cross, and Empty Tomb',
        'significance': 'The historical reality and personal fulfillment of all Old Testament types and shadows in Jesus.'
    },
    'Acts & Epistles': {
        'reference': 'Acts 2:32–36, Ephesians 1:20–23',
        'event': 'The Outpoured Spirit & The Head of the Church',
        'significance': 'The ascended Christ empowering His Church and uniting believers in His spiritual body.'
    },
    'Revelation': {
        'reference': 'Revelation 21:1–5, 22:1–5',
        'event': 'The New Jerusalem & Consummation of All Things',
        'significance': 'The eternal renewal of creation where God tabernacles forever with His redeemed people.'
    }
}

def clean_text(raw: str) -> str:
    t = re.sub(r'<ref[^>]*>(.*?)</ref>', r'\1', raw)
    t = re.sub(r'[*_`]', '', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def detect_era_from_line(line: str) -> str:
    low = line.lower()
    for b_key, era in BOOK_TO_ERA.items():
        if re.search(r'\b' + re.escape(b_key) + r'\b', low):
            return era
    return ''

def parse_connections(raw_conns: str):
    nodes_by_era = {}
    lines = raw_conns.split('\n')
    for line in lines:
        line = line.strip()
        if not (line.startswith('-') or line.startswith('*')):
            continue
        cleaned = clean_text(line[1:].strip())
        if not cleaned:
            continue
        era = detect_era_from_line(cleaned)
        if era and era not in nodes_by_era:
            parts = re.split(r'[:–—\-]', cleaned, 1)
            ref = parts[0].strip()
            desc = parts[1].strip() if len(parts) > 1 else cleaned
            nodes_by_era[era] = {
                'era': era,
                'reference': ref if len(ref) < 35 else ref[:35],
                'event': desc[:90] if len(desc) > 90 else desc,
                'significance': f"Typological fulfillment connecting {ref} with Christ's redemptive purpose."
            }
    return nodes_by_era

def extract_themes_from_content(content: str, book_name: str, ch_num: int):
    m_theme = re.search(r'##\s*\**\s*(?:[0-9IVXLCDM]+\.|\d+\.)?\s*(?:Main|Theological|Major)?\s*(?:Themes?|Significance|Interpretation|Insights?)[^\n]*\**(.*?)(?=## |\Z)', content, re.DOTALL | re.IGNORECASE)
    raw = m_theme.group(1) if m_theme else content
    raw = re.sub(r'<ref[^>]*>(.*?)</ref>', r'\1', raw)
    matches = re.findall(r'(?:^\d+\.|\*|\-)\s*\**([A-Za-z0-9\s,\'’/&-]+?)\**(?:\s*[:–—-]|\s*\n|\s*\*\*)', raw, re.MULTILINE)
    clean = []
    for m in matches:
        t = m.strip()
        if len(t) >= 4 and len(t) <= 50 and not t.lower().startswith('verse') and not t.lower().startswith('chapter'):
            clean.append(t)
            
    if not clean:
        clean = [f'The Sovereign Purpose of God in {book_name} {ch_num}', f'Covenant Promise in {book_name} {ch_num}']
    elif len(clean) == 1:
        clean.append(f'Covenant Fulfillment in {book_name} {ch_num}')
        
    return clean[:2]

def build_motif_for_chapter(book_name: str, book_id: str, chapter_num: int, own_era: str, content: str):
    # 1. Overview
    m_over = re.search(r'##\s*\**\s*(?:[0-9IVXLCDM]+\.|\d+\.)?\s*Overview[^\n]*\**(.*?)(?=## |\Z)', content, re.DOTALL | re.IGNORECASE)
    raw_over = m_over.group(1) if m_over else content[:400]
    cleaned_over = clean_text(raw_over)
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned_over) if s.strip()]
    if len(sentences) >= 2:
        summary = f"{sentences[0]} {sentences[1]}"
    elif len(sentences) == 1:
        summary = sentences[0]
    else:
        summary = f"{book_name} {chapter_num} reveals God's covenant faithfulness and redemptive purpose culminating in Jesus Christ."

    if len(summary) > 280:
        summary = summary[:277] + '...'

    # 2. Main Themes
    themes = extract_themes_from_content(content, book_name, chapter_num)
    motif_1 = themes[0]
    motif_2 = themes[1] if len(themes) > 1 else f"Covenant Fulfillment in {book_name} {chapter_num}"

    # 3. Connections
    m_conn = re.search(r'##\s*\**\s*(?:[0-9IVXLCDM]+\.|\d+\.)?\s*(?:Connections?|Cross-References?)[^\n]*\**(.*?)(?=## |\Z)', content, re.DOTALL | re.IGNORECASE)
    raw_conn = m_conn.group(1) if m_conn else ''
    detected_nodes = parse_connections(raw_conn)

    # 4. Construct complete 6-era nodes
    nodes = []
    for era in ALL_ERAS:
        if era == own_era:
            nodes.append({
                'era': era,
                'reference': f"{book_name} {chapter_num}",
                'event': f"{motif_1}: The redemptive revelation of {book_name} {chapter_num}",
                'significance': summary
            })
        elif era in detected_nodes:
            nodes.append(detected_nodes[era])
        else:
            anchor = CANONICAL_ERA_ANCHORS[era]
            nodes.append({
                'era': era,
                'reference': anchor['reference'],
                'event': anchor['event'],
                'significance': anchor['significance']
            })

    primary_motif = {
        'motif': motif_1,
        'summary': summary,
        'nodes': nodes
    }

    alt_nodes = []
    for n in nodes:
        if n['era'] == own_era:
            alt_nodes.append({
                'era': own_era,
                'reference': f"{book_name} {chapter_num}",
                'event': f"{motif_2}: Prophetic dimension of {book_name} {chapter_num}",
                'significance': f"Points forward to the full revelation of God's redemptive reign in Christ."
            })
        else:
            alt_nodes.append(n)

    alternate_motif = {
        'motif': motif_2,
        'summary': f"An alternate thematic typological perspective exploring how {book_name} {chapter_num} prefigures Christ's enduring kingdom and covenant.",
        'nodes': alt_nodes
    }

    return [primary_motif, alternate_motif]

def main():
    print("Reading existing hand-crafted landmark chapters from typologyDatabase.ts...")
    # Read typologyDatabase.ts
    existing_landmarks = {}
    with open('src/data/typologyDatabase.ts', 'r', encoding='utf-8') as f:
        ts_code = f.read()
    
    # Extract existing hashmap entries
    # Match: 'acts_1': [ ... ]
    m = re.findall(r"'([a-z0-9_]+)':\s*(\[\s*\{.*?\}\s*\]),", ts_code, re.DOTALL)
    for k, json_str in m:
        try:
            parsed = json.loads(json_str)
            existing_landmarks[k] = parsed
        except Exception:
            pass

    print(f"Loaded {len(existing_landmarks)} pristine hand-crafted landmark chapter entries.")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    typology_hashmap = {}

    # 1. Process all 66 Protestant Canonical Books
    print("Processing 66 canonical books (1,189 chapters)...")
    for book_num, book_id, book_name, own_era in BIBLE_CANON:
        cur.execute('SELECT Chapter, Content FROM Summary WHERE Book=? ORDER BY Chapter', (book_num,))
        rows = cur.fetchall()
        for ch_num, content in rows:
            key = f"{book_id}_{ch_num}"
            if key in existing_landmarks:
                # Retain pristine Vos/Beale hand-crafted entry
                motifs = existing_landmarks[key]
            else:
                motifs = build_motif_for_chapter(book_name, book_id, ch_num, own_era, content)
            
            typology_hashmap[key] = motifs
            alias_id = re.sub(r'([0-9])', r'\1_', book_id)
            alias_key = f"{alias_id}_{ch_num}"
            if alias_key != key:
                typology_hashmap[alias_key] = motifs

    # 2. Process Deuterocanonical Books (137 chapters)
    print("Processing 7 Catholic Deuterocanonical books (137 chapters)...")
    for book_id, book_name, own_era, chapter_count in DEUTEROCANON:
        for ch_num in range(1, chapter_count + 1):
            motif_1 = f"Faithfulness & Divine Wisdom in {book_name} {ch_num}"
            motif_2 = f"Covenant Hope & Deliverance in {book_name} {ch_num}"
            summary = f"In {book_name} {ch_num}, the righteous are called to fidelity to God amidst trial, prefiguring the suffering and ultimate triumph of Christ and His saints."
            
            nodes = []
            for era in ALL_ERAS:
                if era == own_era:
                    nodes.append({
                        'era': era,
                        'reference': f"{book_name} {ch_num}",
                        'event': f"Holy perseverance and divine wisdom in {book_name} {ch_num}",
                        'significance': summary
                    })
                else:
                    anchor = CANONICAL_ERA_ANCHORS[era]
                    nodes.append({
                        'era': era,
                        'reference': anchor['reference'],
                        'event': anchor['event'],
                        'significance': anchor['significance']
                    })

            motifs = [
                {
                    'motif': motif_1,
                    'summary': summary,
                    'nodes': nodes
                },
                {
                    'motif': motif_2,
                    'summary': f"Alternative typological reflection on {book_name} {ch_num} pointing towards the resurrection and eternal life in Christ.",
                    'nodes': nodes
                }
            ]
            key = f"{book_id}_{ch_num}"
            typology_hashmap[key] = motifs
            alias_id = re.sub(r'([0-9])', r'\1_', book_id)
            alias_key = f"{alias_id}_{ch_num}"
            if alias_key != key:
                typology_hashmap[alias_key] = motifs

    print(f"Total chapter keys generated: {len(typology_hashmap)}")
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(typology_hashmap, f, ensure_ascii=False, separators=(',', ':'))

    stat = os.stat(OUTPUT_JSON)
    print(f"Successfully generated {OUTPUT_JSON} ({stat.st_size / 1024:.1f} KB)")

if __name__ == '__main__':
    main()
