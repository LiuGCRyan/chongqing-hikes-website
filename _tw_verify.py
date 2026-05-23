import json, sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\Administrator\.qclaw\workspace\chongqing-hikes-website\data\routes_en.json','r',encoding='utf-8') as f:
    data = json.load(f)

for r in data[:5]:
    p = r.get('price')
    cp = r.get('ctripPrice')
    rev = r.get('guideReview','')[:120]
    print(f'price: {p}, ctripPrice: {cp}, guideReview: {rev}')

chinese_count = 0
for r in data:
    rev = r.get('guideReview','')
    if any(ord(c) > 0x4e00 for c in rev):
        chinese_count += 1
print(f'---')
print(f'Routes with Chinese in guideReview: {chinese_count}')

prices = [r.get('price',0) for r in data if r.get('price')]
print(f'USD price range: ${min(prices)} - ${max(prices)}')
