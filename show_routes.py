#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv

# Read CSV
csv_path = 'C:/Users/Administrator/.qclaw/workspace/chongqing-hikes-website/ctrip-data/chongqing_routes_FOR_FOREIGNERS.csv'

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print('=' * 60)
print('重庆旅游路线表格概览')
print('=' * 60)

print(f'\n总路线数: {len(rows)} 条')

# Get headers
headers = list(rows[0].keys())
print('\n字段说明:')
for h in headers:
    print(f'  - {h}')

print('\n' + '-' * 40)
print('路线类型分布')
print('-' * 40)

# Count by type
type_counts = {}
for r in rows:
    t = r['类型']
    type_counts[t] = type_counts.get(t, 0) + 1

for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
    print(f'  {t}: {c} 条')

print('\n' + '-' * 40)
print('价格统计')
print('-' * 40)

prices = []
for r in rows:
    try:
        prices.append(int(r['你的价格']))
    except:
        pass

if prices:
    print(f'  最低价: ¥{min(prices)}')
    print(f'  最高价: ¥{max(prices)}')
    print(f'  平均价: ¥{sum(prices)//len(prices)}')

print('\n' + '-' * 40)
print('样例数据（前5条）')
print('-' * 40)

for i, row in enumerate(rows[:5]):
    print(f'\n【{row["类型"]}】{row["线路名称"]}')
    print(f'  携程价: ¥{row["携程价格"]} -> 售价: ¥{row["你的价格"]}')
    print(f'  评分: {row["评分"]}')
    highlights = row['路线亮点（外国人关注）'][:60] + '...' if len(row['路线亮点（外国人关注）']) > 60 else row['路线亮点（外国人关注）']
    print(f'  亮点: {highlights}')

print('\n' + '=' * 60)
