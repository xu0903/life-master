# 從官方 PDF 抽出單字、詞性、級別，輸出 wordlists/parsed.json（只用到單字與級別，不使用官方的中文解釋）
#   學測：大考中心《高中英文參考詞彙表》（111 學年度起適用）字母排序附表，每行「單字 詞性 級別」
#   全民英檢：LTTC 參考字表中高級版（含初級、中級、中高級的所有單字）
import collections, json, re
import pypdf

POS = r"\(?(?:n|v|adj|adv|prep|conj|pron|art|aux|interj|num|det)\.?\)?"
ceec_re = re.compile(r"^(.+?)\s+(" + POS + r"(?:\s*/\s*" + POS + r")*)\s+([1-6])$")

def head_of(raw: str) -> str:
    """'agree(ment)' → agree、'actor/actress' → actor、'he (him, his)' → he"""
    return re.split(r"[/(]", raw)[0].strip().replace('’', "'")

r = pypdf.PdfReader('wordlists/ceec-7000.pdf')
start = next(i for i, p in enumerate(r.pages) if re.search(r"^a/an art\. 1\s*$", p.extract_text(), re.M))
ceec, buf, bad = [], '', []
for p in r.pages[start:]:
    for line in p.extract_text().split('\n'):
        line = line.strip()
        if not line or re.search(r'[一-鿿]', line) or line.isdigit() or re.fullmatch(r'[A-Z]', line):
            continue
        text = f'{buf} {line}'.strip() if buf else line
        m = ceec_re.match(text)
        if m:
            raw = m.group(1).strip()
            ceec.append({'raw': raw, 'word': head_of(raw), 'pos': m.group(2).replace(' ', ''), 'level': int(m.group(3))})
            buf = ''
        elif len(text) < 80:
            buf = text  # 斷行的長單字，接到下一行
        else:
            bad.append(text)
            buf = ''
print('CEEC', len(ceec), sorted(collections.Counter(e['level'] for e in ceec).items()), 'unparsed', len(bad), bad[:5])

GPOS = r"(?:noun|verb|adj\.|adv\.|prep\.|conj\.|pron\.|art\.|aux\.|interj\.|determiner|number|abbr\.)"
g_re = re.compile(r"^([A-Za-z][A-Za-z.'’\- ]*?)\s+(" + GPOS + r"(?:/" + GPOS + r")*)\s+.*?(初級|中級|中高級)(?:\s+L\d+)?$")
LV = {'初級': 1, '中級': 2, '中高級': 3}
gept = {}
r = pypdf.PdfReader('wordlists/gept-High-Intermediate.pdf')
for p in r.pages:
    for line in p.extract_text().split('\n'):
        m = g_re.match(line.strip())
        if not m:
            continue
        word = m.group(1).strip().replace('’', "'")
        level = LV[m.group(3)]
        key = word.lower()
        if key not in gept or level < gept[key]['level']:
            gept[key] = {'word': word, 'pos': m.group(2), 'level': level}
print('GEPT', len(gept), sorted(collections.Counter(v['level'] for v in gept.values()).items()))
json.dump({'ceec': ceec, 'gept': list(gept.values())}, open('wordlists/parsed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
