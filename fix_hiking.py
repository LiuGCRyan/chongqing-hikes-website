import json

# Read the current file
with open('hiking.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Update Google Translate widget
old_translate = '''    <!-- Google Translate Widget -->
    <div id="google_translate_element" style="position:fixed;top:10px;right:10px;z-index:9999;"></div>
    <script>
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: \'en\',
            includedLanguages: \'en,fr,es,ru,de,ko\',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, \'google_translate_element\');
    }
    </script>
    <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>'''

new_translate = '''    <!-- Google Translate (Hidden) -->
    <div id="google_translate_element"></div>
    <script>
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: \'en\',
            includedLanguages: \'en,fr,es,ru,de,ko\',
            layout: google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false
        }, \'google_translate_element\');
    }
    </script>
    <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    
    <!-- Custom Language Switcher -->
    <div id="language-switcher"></div>
    <script src="js/language-switcher.js"></script>'''

content = content.replace(old_translate, new_translate)

# Fix 2: Add img tags to tour cards
replacements = [
    ('<div class="tour-image hiking-tour-1">', '<div class="tour-image"><img src="images/routes/route_39486564.webp" alt="Wulong Tour" loading="lazy">'),
    ('<div class="tour-image hiking-tour-2">', '<div class="tour-image"><img src="images/routes/route_35497743.webp" alt="Gongtan Tour" loading="lazy">'),
    ('<div class="tour-image hiking-tour-3">', '<div class="tour-image"><img src="images/routes/route_39531806.webp" alt="Wansheng Tour" loading="lazy">'),
    ('<div class="tour-image hiking-tour-4">', '<div class="tour-image"><img src="images/routes/route_61748785.webp" alt="Custom Hiking" loading="lazy">')
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix 3: Fix price field name in JavaScript (最低价 -> 你的价格)
content = content.replace("'最低价'", "'你的价格'")
content = content.replace('r["最低价"]', 'r["你的价格"]')
content = content.replace("r['最低价']", "r['你的价格']")

# Write back
with open('hiking.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('hiking.html updated successfully')
