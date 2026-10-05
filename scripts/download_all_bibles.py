import urllib.request
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DIR = os.path.join(BASE_DIR, 'public', 'bibles')
os.makedirs(TARGET_DIR, exist_ok=True)

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

# Strict allowlist of Public Domain and CC0 translations permitted for local offline distribution
COMPLIANT_PD_TRANSLATIONS = {
    'BSB',    # Berean Standard Bible (CC0 / Public Domain dedication)
    'WEB',    # World English Bible (Public Domain)
    'KJV',    # King James Version 1611/1769 (Public Domain)
    'ASV',    # American Standard Version 1901 (Public Domain)
    'DRB',    # Douay-Rheims Bible Challoner 1899 (Public Domain)
    'GNV',    # Geneva Bible 1599 (Public Domain)
    'YLT',    # Young's Literal Translation 1898 (Public Domain)
    'tagalog',# Ang Dating Biblia 1905 (Public Domain)
    'VULG',   # Biblia Sacra Vulgata (Public Domain)
    'LXX',    # Septuagint Greek OT (Public Domain)
    'LXXE',   # Septuagint Brenton 1851 English (Public Domain)
    'WLC',    # Westminster Leningrad Codex Hebrew OT (Public Domain)
    'WLCC',   # Westminster Leningrad Codex Consonantal (Public Domain)
    'WLCa',   # Westminster Leningrad Codex Accented (Public Domain)
    'TR',     # Textus Receptus Greek NT (Public Domain)
    'TISCH',  # Tischendorf 8th ed Greek NT (Public Domain)
    'LUT',    # Luther Bibel 1912 German (Public Domain)
    'FRLSG',  # Louis Segond 1910 French (Public Domain)
    'FRDBY',  # Darby 1885 French (Public Domain)
    'CUV',    # Chinese Union Version 1919 (Public Domain)
    'SYNOD',  # Russian Synodal 1876 (Public Domain)
}

def download_and_process_translation(api_code: str):
    if api_code not in COMPLIANT_PD_TRANSLATIONS:
        return api_code, f"SKIPPED: Translation '{api_code}' is proprietary/copyrighted and cannot be bundled."

    out_file = os.path.join(TARGET_DIR, f"{api_code}.json")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        return api_code, "ALREADY_EXISTS"

    try:
        if api_code.lower() == 'tagalog':
            url = 'https://api.getbible.net/v2/tagalog.json'
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            resp = urllib.request.urlopen(req, timeout=40)
            data = json.loads(resp.read().decode('utf-8'))
            
            # Format to { "book_chap": [ { "verse": v, "text": t } ] }
            compact = {}
            for book in data.get('books', []):
                b_num = book.get('nr')
                for chapter in book.get('chapters', []):
                    c_num = chapter.get('chapter')
                    key = f"{b_num}_{c_num}"
                    compact[key] = [
                        {"verse": v.get('verse'), "text": v.get('text', '')}
                        for v in chapter.get('verses', [])
                    ]
            
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(compact, f, ensure_ascii=False, separators=(',', ':'))
            return api_code, f"SUCCESS ({os.path.getsize(out_file) // 1024} KB)"

        # Standard open public domain static JSON endpoint
        url = f"https://bolls.life/static/translations/{api_code}.json"
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        resp = urllib.request.urlopen(req, timeout=40)
        data = json.loads(resp.read().decode('utf-8'))

        compact = {}
        for row in data:
            b = row.get('book')
            c = row.get('chapter')
            v = row.get('verse')
            t = row.get('text', '')
            key = f"{b}_{c}"
            if key not in compact:
                compact[key] = []
            compact[key].append({"verse": v, "text": t})

        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(compact, f, ensure_ascii=False, separators=(',', ':'))
        
        return api_code, f"SUCCESS ({os.path.getsize(out_file) // 1024} KB)"

    except Exception as e:
        return api_code, f"ERROR: {str(e)}"

def main():
    map_file = os.path.join(BASE_DIR, 'scripts', 'translations_map.json')
    with open(map_file, 'r', encoding='utf-8') as f:
        translations = json.load(f)

    # Filter to compliant allowlist
    api_codes = sorted(list(set([t[1] for t in translations if t[1] in COMPLIANT_PD_TRANSLATIONS])))
    print(f"Total compliant Public Domain / CC0 datasets: {len(api_codes)}")

    start_time = time.time()
    success_count = 0
    fail_count = 0

    # Download in parallel using 8 workers
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(download_and_process_translation, code): code for code in api_codes}
        for future in as_completed(futures):
            code = futures[future]
            try:
                c, status = future.result()
                if "SUCCESS" in status or "ALREADY_EXISTS" in status:
                    success_count += 1
                    print(f"[{success_count + fail_count}/{len(api_codes)}] {code}: {status}")
                else:
                    fail_count += 1
                    print(f"[{success_count + fail_count}/{len(api_codes)}] {code}: {status}", file=sys.stderr)
            except Exception as exc:
                fail_count += 1
                print(f"{code} generated an exception: {exc}", file=sys.stderr)

    elapsed = time.time() - start_time
    print(f"\nFinished in {elapsed:.1f}s.")
    print(f"Compliant translations ready: {success_count} / {len(api_codes)}")
    if fail_count > 0:
        print(f"Failed: {fail_count}")

if __name__ == '__main__':
    main()
