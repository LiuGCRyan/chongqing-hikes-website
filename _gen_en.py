import json, re, os

d=json.load(open("data/routes.json","r",encoding="utf-8"))

TYPE_MAP = {
    "一日游": "Day Tour", "二日游": "2-Day Tour", "两日游": "2-Day Tour",
    "三日游": "3-Day Tour", "四日游": "4-Day Tour", "五日游": "5-Day Tour",
    "六日游": "6-Day Tour", "拼小团": "Small Group", "私家团": "Private Tour",
    "跟团游": "Group Tour", "自由行": "Free and Easy", "半自助游": "Semi-Guided",
}

TAG_MAP = {
    "免费退": "Free Cancellation", "立即确认": "Instant Confirmation",
    "0购物": "No Shopping Stops", "成团保障": "Guaranteed Departure",
    "上门接": "Hotel Pickup", "0自费": "No Hidden Fees",
    "纯玩": "No Shopping", "含餐": "Meals Included",
    "含住宿": "Accommodation Included", "含接送": "Transfer Included",
    "可订当日": "Same-day Booking", "赠接送": "Free Transfer",
    "赠保险": "Insurance Included", "高评分": "Highly Rated",
    "热卖": "Bestseller", "新品": "New", "亲子": "Family-Friendly",
    "情侣": "Romantic", "摄影": "Photography", "徒步": "Hiking",
    "美食": "Foodie", "夜景": "Night View", "文化": "Cultural",
    "探险": "Adventure", "休闲": "Leisure", "深度": "In-Depth",
    "品质": "Premium", "豪华": "Luxury", "经济": "Budget",
}

DEST_MAP = {
    "武隆": "Wulong Karst", "大足": "Dazu Rock Carvings", "三峡": "Three Gorges",
    "长江": "Yangtze River", "市区": "Chongqing City", "重庆": "Chongqing",
    "成都": "Chengdu", "九寨沟": "Jiuzhaigou", "峨眉山": "Emei Mountain",
    "乐山": "Leshan Giant Buddha", "张家界": "Zhangjiajie",
    "凤凰": "Fenghuang Ancient Town", "桂林": "Guilin", "贵阳": "Guiyang",
    "昆明": "Kunming", "丽江": "Lijiang", "大理": "Dali",
    "西安": "Xian", "北京": "Beijing", "上海": "Shanghai",
    "杭州": "Hangzhou", "苏州": "Suzhou", "黄山": "Huangshan (Yellow Mountain)",
    "泰山": "Mount Tai", "敦煌": "Dunhuang", "新疆": "Xinjiang",
    "西藏": "Tibet", "青海": "Qinghai", "宁夏": "Ningxia",
    "内蒙古": "Inner Mongolia", "东北": "Northeast China",
    "海南": "Hainan", "厦门": "Xiamen", "青岛": "Qingdao",
    "大连": "Dalian", "哈尔滨": "Harbin",
}

ATT_MAP = {
    "武陵山大裂谷": "Wuling Mountain Rift Valley",
    "天生三桥": "Three Natural Bridges", "天生三硚": "Three Natural Bridges",
    "仙女山": "Fairy Mountain (Xiannvshan)", "龙水峡地缝": "Longshui Gorge",
    "芙蓉洞": "Furong Cave", "芙蓉江": "Furong River",
    "洪崖洞": "Hongya Cave", "解放碑": "Jiefangbei CBD",
    "来福士": "Raffles City", "磁器口": "Ciqikou Ancient Town",
    "十八梯": "Shibati Old Stairs", "山城步道": "Mountain City Trail",
    "李子坝": "Liziba (Train Through Building)", "轻轨穿楼": "Light Rail Through Building",
    "长江索道": "Yangtze River Cableway", "两江夜游": "Two Rivers Night Cruise",
    "大足石刻": "Dazu Rock Carvings", "宝顶山": "Baodingshan",
    "三峡博物馆": "Three Gorges Museum", "白公馆": "Bai Mansion",
    "渣滓洞": "Zhazidong Prison", "周公馆": "Zhou Enlai Residence",
    "湖广会馆": "Huguang Guild Hall", "罗汉寺": "Luohan Temple",
    "弹子石老街": "Danzishi Old Street", "龙门浩老街": "Longmenhao Old Street",
    "鹅岭公园": "Eling Park", "二厂文创园": "Testbed 2 Arts Center",
    "816工程": "Project 816 Underground Nuclear Plant", "树顶漫步": "Treetop Walk",
    "天坑": "Natural Sinkhole (Tiankeng)", "地缝": "Earth Crack (Difeng)",
    "印象武隆": "Impression Wulong Show", "火锅": "Authentic Hotpot Experience",
    "小面": "Chongqing Noodles", "夜景": "Night View Photography",
    "8D魔幻": "8D Magic City", "雾都": "City of Fog",
}

def translate_type(t):
    for cn, en in TYPE_MAP.items():
        if cn in t: return en
    m = re.search(r"(\d+)日", t)
    if m: return f"{int(m.group(1))}-Day Tour"
    return t

def translate_tags(raw):
    tags = [x.strip() for x in raw.replace(" ",",").replace("\uff0c",",").split(",") if x.strip()]
    out = []
    for tag in tags:
        found = False
        for cn, en in TAG_MAP.items():
            if cn in tag:
                out.append(en)
                found = True
                break
        if not found and tag:
            out.append(tag)
    return ", ".join(out)

def gen_name(route):
    name = route.get("线路名称","")
    t = route.get("类型","")
    dest_match = None
    for cn, en in DEST_MAP.items():
        if cn in name:
            dest_match = en
            break
    dur_m = re.search(r"(\d+)日", name)
    days = int(dur_m.group(1)) if dur_m else 1
    parts = []
    if dest_match: parts.append(dest_match)
    if days == 1: parts.append("Full Day Tour")
    else: parts.append(f"{days} Days {days-1} Nights")
    ts = ""
    if "Private" in translate_type(t) or "私家" in t: ts = "- Private"
    elif "Small" in translate_type(t) or "\u62fc\u5c0f" in t or "\u5c0f\u56e2" in t: ts = "- Small Group"
    elif "Group" in translate_type(t) or "\u8ddf\u56e2" in t: ts = "- Group Tour"
    elif "Free" in translate_type(t) or "\u81ea\u7531" in t: ts = "- Free and Easy"
    result = " | ".join(parts) + (" " + ts if ts else "")
    return result.strip()

def gen_subtitle(route):
    sub = route.get("副标题","")
    name = route.get("线路名称","")
    combined = name + " " + sub
    attractions = []
    for cn, en in sorted(ATT_MAP.items(), key=lambda x: -len(x[0])):
        if cn in combined and en not in attractions:
            attractions.append(en)
    features = []
    if "\u7eaf\u73a9" in combined: features.append("Pure Play - No Shopping")
    if "\u5c0f\u56e2" in combined or "\u62fc" in combined: features.append("Max 8 Guests")
    if "\u79c1\u5bb6" in combined or "\u79c1" in combined: features.append("Fully Private")
    if "\u9152\u5e97" in combined: features.append("Quality Hotel Included")
    if "\u63a5\u9001" in combined or "\u4e0a\u95e8" in combined: features.append("Hotel Pickup/Drop-off")
    if "\u6444\u5f71" in combined: features.append("Photography Friendly")
    if "\u7f8e\u98df" in combined or "\u706b\u9505" in combined: features.append("Local Cuisine Included")
    if "\u6df1\u5ea6" in combined: features.append("In-Depth Exploration")
    parts = []
    if attractions: parts.append(" \xb7 ".join(attractions[:4]))
    if features: parts.append(" | ".join(features[:3]))
    result = " | ".join(parts) if parts else "Discover the best of Chongqing with a local expert guide"
    return result[:200]

english_routes = []
for i, route in enumerate(d):
    name = route.get("线路名称","")
    dur_m = re.search(r"(\d+)日", name)
    duration = int(dur_m.group(1)) if dur_m else 0
    if duration == 0:
        if "\u4e00\u65e5" in name or "1\u65e5" in name: duration = 1
        elif "\u4e24\u65e5" in name or "\u4e8c\u65e5" in name or "2\u65e5" in name: duration = 2
        elif "\u4e09\u65e5" in name or "3\u65e5" in name: duration = 3
    
    er = {
        "id": str(i+1),
        "productId": route.get("产品ID",""),
        "type": translate_type(route.get("类型","")),
        "name": gen_name(route),
        "subtitle": gen_subtitle(route),
        "originName": route.get("线路名称",""),
        "ctripPrice": route.get("携程价格",0),
        "price": route.get("你的价格",0),
        "rating": route.get("评分",0),
        "imageUrl": route.get("图片URL",""),
        "tags": translate_tags(route.get("标签","")),
        "highlights": route.get("路线亮点（外国人关注）",""),
        "guideReview": route.get("你的专业评价",""),
        "duration": duration,
    }
    english_routes.append(er)

with open("data/routes_en.json", "w", encoding="utf-8") as f:
    json.dump(english_routes, f, ensure_ascii=False, indent=2)

print(f"Done! Generated {len(english_routes)} English routes")
r = english_routes[0]
for k,v in r.items():
    print(f"  {k}: {str(v)[:80]}")
