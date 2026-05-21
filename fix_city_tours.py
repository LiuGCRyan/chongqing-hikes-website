#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix city-tours.html: remove inline JS, use routes.js, fix filters"""

import re

filepath = 'C:/Users/Administrator/.qclaw/workspace/chongqing-hikes-website/city-tours.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Replace "Al Routes Section" typo and update filter section
old_section = '''    <!-- Al Routes Section -->
    <section class="al-routes-section">
        <div class="container">
            <h2 class="section-title">AL AVAILABLE TOURS</h2>
            <p class="section-subtitle">Browse our complete collection of Chongqing tour routes</p>
            
            <!-- Filters -->
            <div class="routes-filters">
                <input type="text" id="searchInput" placeholder="Search routes..." class="search-box">
                <select id="typeFilter" class="filter-select">
                    <option value="">All Types</option>
                    <option value="一日游">Day Tour</option>
                    <option value="拼小团">Small Group</option>
                    <option value="私家团">Private Tour</option>
                    <option value="自由行">Free & Easy</option>
                </select>
                <select id="sortFilter" class="filter-select">
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>
            
            <!-- Routes Grid -->
            <div id="routesGrid" class="routes-grid">
                <!-- Routes will be loaded here -->
            </div>
            
            <!-- Load More -->
            <div class="load-more-container">
                <button id="loadMoreBtn" class="btn-primary">Load More</button>
            </div>
        </div>
    </section>'''

new_section = '''    <!-- All Routes Section -->
    <section class="all-routes-section">
        <div class="container">
            <h2 class="section-title">ALL AVAILABLE TOURS</h2>
            <p class="section-subtitle">Browse our complete collection of Chongqing tour routes</p>
            
            <!-- Filters -->
            <div class="routes-filters">
                <input type="text" id="searchInput" placeholder="Search routes..." class="search-box">
                <select id="durationFilter" class="filter-select">
                    <option value="">All Durations</option>
                    <option value="1">Day Tour (1 day)</option>
                    <option value="2">2-Day Tour</option>
                    <option value="3">3-Day Tour</option>
                    <option value="4">4-Day Tour</option>
                    <option value="5">5-Day Tour</option>
                    <option value="6">6-Day Tour+</option>
                </select>
                <select id="sortFilter" class="filter-select">
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>
            
            <!-- Routes Grid -->
            <div id="routesGrid" class="routes-grid">
                <!-- Routes will be loaded here -->
            </div>
            
            <!-- Load More -->
            <div class="load-more-container">
                <button id="loadMoreBtn" class="btn-primary">Load More</button>
            </div>
        </div>
    </section>'''

if old_section in content:
    content = content.replace(old_section, new_section)
    print('✅ Replaced filter section')
else:
    print('⚠️  Could not find old filter section, trying alternative...')
    # Try to find it with regex (in case of whitespace differences)
    pattern = r'<!-- Al Routes Section -->.*?</section>'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = content.replace(match.group(0), new_section)
        print('✅ Replaced filter section (via regex)')
    else:
        print('❌ Could not find filter section at all!')

# Fix 2: Replace inline JavaScript with routes.js reference
# Find the inline script at the bottom
old_script_pattern = r'    <script>\n    // Load routes from JSON.*?</script>\n</body>\n</html>'
match = re.search(old_script_pattern, content, re.DOTALL)

if match:
    old_script = match.group(0)
    new_script = '    <script src="js/main.js"></script>\n    <script src="js/routes.js"></script>\n</body>\n</html>'
    content = content.replace(old_script, new_script)
    print('✅ Replaced inline JavaScript with routes.js reference')
else:
    print('⚠️  Could not find inline JavaScript, checking if already fixed...')
    if 'js/routes.js' in content:
        print('✅ Already using routes.js!')
    else:
        print('❌ Could not find inline JavaScript!')

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\n✅ {filepath} updated successfully!')
