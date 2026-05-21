import json

# Read the current file
with open('contact.html', 'r', encoding='utf-8') as f:
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

# Fix 2: Add white-space: nowrap to phone numbers
# Add class="nowrap" to all <p> tags inside contact-method that contain phone numbers
import re

# Pattern to match phone number paragraphs
pattern = r'(<div class="method-content">\s*<h4>[^<]+</h4>\s*)(<p>[^<]*[\d\s\-\+]+</p>)'
replacement = r'\1<p class="nowrap">\2</p>'

# Actually, let me just add a <style> block or add class directly
# Simpler: Add nowrap class to all <p> inside contact-method
content = content.replace('<div class="method-content">', '<div class="method-content" style="white-space: nowrap;">')

# Write back
with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('contact.html updated successfully')
