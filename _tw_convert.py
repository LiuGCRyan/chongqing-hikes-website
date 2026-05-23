#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Convert routes_en.json: CNY->USD prices, translate guideReview to English"""
import json, sys, os

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'routes_en.json')

# --- Translation map for all 44 unique guideReviews ---
TRANSLATION_MAP = {
    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank (lots of photo ops!).",

    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。 注意：这条路线评分4.2分，我会帮你优化体验。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank. Note: This route rates 4.2/5 — I'll help optimize your experience.",

    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。 注意：这条路线评分4.3分，我会帮你优化体验。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank. Note: This route rates 4.3/5 — I'll help optimize your experience.",

    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。 注意：这条路线评分4.4分，我会帮你优化体验。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank. Note: This route rates 4.4/5 — I'll help optimize your experience.",

    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。 这条路线评分4.8分，口碑很好，放心选。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank. This route rates 4.8/5 — excellent reputation, book with confidence!",

    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。 这条路线评分4.9分，口碑很好，放心选。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank. This route rates 4.9/5 — excellent reputation, book with confidence!",

    "一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。 这条路线评分5.0分，口碑很好，放心选。":
        "Day tours move at a brisk pace — wear comfy shoes and bring a power bank. This route rates 5.0/5 — excellent reputation, book with confidence!",

    "大足石刻建议请讲解员，否则就是看石头。我可以帮你安排专业讲解。 宝顶山游览约3小时，穿舒适鞋，有部分爬坡。":
        "For the Dazu Rock Carvings, a guide is a must — otherwise it's just rocks. I can arrange a specialist guide. Baoding Mountain takes ~3 hours; wear comfy shoes for some uphill walking.",

    "小团灵活性高，我可以根据大家兴趣微调行程。":
        "Small groups are flexible — I can fine-tune the itinerary based on everyone's interests.",

    "小团灵活性高，我可以根据大家兴趣微调行程。 注意：这条路线评分3.3分，我会帮你优化体验。":
        "Small groups are flexible — I can fine-tune the itinerary. Note: This route rates 3.3/5 — I'll help optimize your experience.",

    "小团灵活性高，我可以根据大家兴趣微调行程。 注意：这条路线评分3.4分，我会帮你优化体验。":
        "Small groups are flexible — I can fine-tune the itinerary. Note: This route rates 3.4/5 — I'll help optimize your experience.",

    "小团灵活性高，我可以根据大家兴趣微调行程。 这条路线评分4.8分，口碑很好，放心选。":
        "Small groups are flexible — I can fine-tune the itinerary. This route rates 4.8/5 — excellent reputation, book with confidence!",

    "小团灵活性高，我可以根据大家兴趣微调行程。 这条路线评分4.9分，口碑很好，放心选。":
        "Small groups are flexible — I can fine-tune the itinerary. This route rates 4.9/5 — excellent reputation, book with confidence!",

    "小团灵活性高，我可以根据大家兴趣微调行程。 这条路线评分5.0分，口碑很好，放心选。":
        "Small groups are flexible — I can fine-tune the itinerary. This route rates 5.0/5 — excellent reputation, book with confidence!",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。":
        "Wulong is a must-see in Chongqing! Wear comfortable sneakers — lots of scenic trails.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 一日游节奏较快，建议穿舒适鞋，带充电宝（拍照耗电）。":
        "Wulong is a must-see! Wear comfortable sneakers — lots of trails. Day tours are brisk — bring a power bank for all the photos.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 大足石刻建议请讲解员，否则就是看石头。我可以帮你安排专业讲解。":
        "Wulong is a must-see! Wear comfortable sneakers. For Dazu Rock Carvings, a guide is essential — I can arrange a specialist for you.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 小团灵活性高，我可以根据大家兴趣微调行程。":
        "Wulong is a must-see! Wear comfortable sneakers. Small groups are flexible — I can adjust the itinerary to your interests.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 洪崖洞最佳拍照时间是日落后30分钟，灯光全开但未过热。":
        "Wulong is a must-see! Wear comfortable sneakers. For Hongya Cave, the best photos are 30 min after sunset when lights are fully on.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 私家团完全按你的节奏来，老人小孩也不用赶时间。":
        "Wulong is a must-see! Wear comfortable sneakers. Private tours go at your pace — no rushing, great for families with kids or seniors.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 索道建议傍晚去，可以看到日落和夜景切换。":
        "Wulong is a must-see! Wear comfortable sneakers. For the cable car, go at dusk to catch the sunset-to-night view transition.",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 这条路线评分4.8分，口碑很好，放心选。":
        "Wulong is a must-see! Wear comfortable sneakers. This route rates 4.8/5 — excellent reputation, book with confidence!",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 这条路线评分4.9分，口碑很好，放心选。":
        "Wulong is a must-see! Wear comfortable sneakers. This route rates 4.9/5 — excellent reputation, book with confidence!",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 这条路线评分5.0分，口碑很好，放心选。":
        "Wulong is a must-see! Wear comfortable sneakers. This route rates 5.0/5 — excellent reputation, book with confidence!",

    "武隆是重庆必去！建议穿舒适运动鞋，景区步道较多。 龙水峡地缝较窄，夏季凉爽，是天然空调。":
        "Wulong is a must-see! Wear comfortable sneakers. Longshui Gorge is narrow and cool in summer — nature's own AC.",

    "注意：这条路线评分3.1分，我会帮你优化体验。":
        "Note: This route rates 3.1/5 — I'll help optimize your experience.",

    "注意：这条路线评分3.9分，我会帮你优化体验。":
        "Note: This route rates 3.9/5 — I'll help optimize your experience.",

    "注意：这条路线评分4.2分，我会帮你优化体验。":
        "Note: This route rates 4.2/5 — I'll help optimize your experience.",

    "注意：这条路线评分4.3分，我会帮你优化体验。":
        "Note: This route rates 4.3/5 — I'll help optimize your experience.",

    "注意：这条路线评分4.4分，我会帮你优化体验。":
        "Note: This route rates 4.4/5 — I'll help optimize your experience.",

    "洪崖洞最佳拍照时间是日落后30分钟，灯光全开但未过热。 建议从千厮门大桥拍摄全景，比在近处拍更震撼。":
        "Best time for Hongya Cave photos: 30 min after sunset when lights are fully on. Shoot from Qiansimen Bridge for the most epic panoramic view.",

    "磁器口周末人非常多，建议工作日去或早上9点前到达。 真正的老店不在主街，带你去巷子里的正宗味道。":
        "Ciqikou is packed on weekends — go on a weekday or arrive before 9 AM. The authentic shops are off the main street — I'll take you to the real hidden gems.",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。":
        "Private tours go entirely at your pace — no rushing, perfect for families with seniors or kids.",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。 注意：这条路线评分3.2分，我会帮你优化体验。":
        "Private tours go at your pace — no rushing, great for families. Note: This route rates 3.2/5 — I'll help optimize your experience.",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。 注意：这条路线评分4.2分，我会帮你优化体验。":
        "Private tours go at your pace — no rushing, great for families. Note: This route rates 4.2/5 — I'll help optimize your experience.",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。 注意：这条路线评分4.3分，我会帮你优化体验。":
        "Private tours go at your pace — no rushing, great for families. Note: This route rates 4.3/5 — I'll help optimize your experience.",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。 这条路线评分4.8分，口碑很好，放心选。":
        "Private tours go at your pace — no rushing, great for families. This route rates 4.8/5 — excellent reputation, book with confidence!",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。 这条路线评分4.9分，口碑很好，放心选。":
        "Private tours go at your pace — no rushing, great for families. This route rates 4.9/5 — excellent reputation, book with confidence!",

    "私家团完全按你的节奏来，老人小孩也不用赶时间。 这条路线评分5.0分，口碑很好，放心选。":
        "Private tours go at your pace — no rushing, great for families. This route rates 5.0/5 — excellent reputation, book with confidence!",

    "索道建议傍晚去，可以看到日落和夜景切换。 节假日排队1小时+，我会帮你规划错峰时间。":
        "For the cable car, go at dusk to see the sunset-to-night transition. Holidays can mean 1+ hour queues — I'll help you plan around the crowds.",

    "这条路线经过精心挑选，适合大多数外国游客。 有任何特殊需求（饮食禁忌、行动不便等），提前告诉我。":
        "This route is handpicked for international travelers. Have special needs (dietary, mobility)? Let me know in advance and I'll take care of it.",

    "这条路线评分4.8分，口碑很好，放心选。":
        "This route rates 4.8/5 — excellent reputation, book with confidence!",

    "这条路线评分4.9分，口碑很好，放心选。":
        "This route rates 4.9/5 — excellent reputation, book with confidence!",

    "这条路线评分5.0分，口碑很好，放心选。":
        "This route rates 5.0/5 — excellent reputation, book with confidence!",
}

def cny_to_usd(cny_val):
    """Convert CNY to USD, rounded to nearest whole dollar"""
    if not cny_val or cny_val <= 0:
        return cny_val
    return round(cny_val / 6.78)

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    translated = 0
    priced = 0
    missing_translations = set()

    for route in data:
        # Convert prices
        if route.get('price') and route['price'] > 0:
            route['price'] = cny_to_usd(route['price'])
            priced += 1
        if route.get('ctripPrice') and route['ctripPrice'] > 0:
            route['ctripPrice'] = cny_to_usd(route['ctripPrice'])

        # Translate guideReview
        rev = route.get('guideReview', '')
        if rev in TRANSLATION_MAP:
            route['guideReview'] = TRANSLATION_MAP[rev]
            translated += 1
        elif rev:
            missing_translations.add(rev)

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Done! {priced} prices converted CNY->USD, {translated} guideReviews translated.")
    if missing_translations:
        print(f"WARNING: {len(missing_translations)} untranslated reviews:")
        for r in sorted(missing_translations):
            print(f"  - {r[:100]}")

if __name__ == '__main__':
    main()
