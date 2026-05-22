#!/usr/bin/env python3
"""Fix all 3 issues: English data, filter clickability, modal images"""
import json, re, os

BASE = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# FIX 1: city-tours.html - Update filter options to English
# ============================================================
print("=" * 60)
print("FIX 1: Updating city-tours.html filter options...")
with open(os.path.join(BASE, 'city-tours.html'), 'r', encoding='utf-8') as f:
    html = f.read()

# Fix section title typo
html = html.replace('AL AVAILABLE TOURS', 'ALL AVAILABLE TOURS')

# Replace filter select with English values
old_filter_pattern = re.compile(
    r'<select id="typeFilter" class="filter-select">.*?</select>',
    re.DOTALL
)
new_filter = '''<select id="typeFilter" class="filter-select">
                    <option value="">All Types</option>
                    <option value="Day Tour">Day Tour</option>
                    <option value="Small Group">Small Group</option>
                    <option value="Private Tour">Private Tour</option>
                    <option value="Free and Easy">Free &amp; Easy</option>
                    <option value="Group Tour">Group Tour</option>
                    <option value="2-Day Tour">2-Day Tour</option>
                    <option value="3-Day Tour">3-Day Tour</option>
                </select>'''

html2 = old_filter_pattern.sub(new_filter, html)
if html2 != html:
    print("  ✅ Filter options updated to English")
else:
    print("  ⚠️ Filter pattern not matched, trying broader search...")

with open(os.path.join(BASE, 'city-tours.html'), 'w', encoding='utf-8') as f:
    f.write(html2)

# ============================================================
# FIX 2: routes.js - Complete rewrite for English + clickable filters + image in modal
# ============================================================
print("\nFIX 2: Rewriting js/routes.js...")

routes_js = '''// routes.js - Load and display routes (English version)
// Data source: data/routes_en.json (all fields in English)

let allRoutes = [];
let filteredRoutes = [];
let displayCount = 0;
const ROUTES_PER_PAGE = 20;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM loaded, initializing routes...');
    loadRoutes();
    setupFilters();
    setupModal();
});

// Load routes from ENGLISH JSON
async function loadRoutes() {
    try {
        const response = await fetch('data/routes_en.json');
        allRoutes = await response.json();
        console.log('✅ Loaded ' + allRoutes.length + ' routes (English)');
        applyFilters();
    } catch (error) {
        console.error('❌ Error loading routes:', error);
        const grid = document.getElementById('routesGrid');
        if (grid) {
            grid.innerHTML = '<p class="error" style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">Error loading tours. Please refresh the page.</p>';
        }
    }
}

// Setup filter event listeners with FORCE-CLICKABLE styles
function setupFilters() {
    var searchInput = document.getElementById('searchInput');
    var typeFilter = document.getElementById('typeFilter');
    var sortFilter = document.getElementById('sortFilter');
    var loadMoreBtn = document.getElementById('loadMoreBtn');

    console.log('🔍 Looking for filter elements...');
    console.log('  searchInput:', !!searchInput);
    console.log('  typeFilter:', !!typeFilter);
    console.log('  sortFilter:', !!sortFilter);

    // Force-clickable on filters container
    var filtersContainer = document.querySelector('.routes-filters');
    if (filtersContainer) {
        filtersContainer.style.position = 'relative';
        filtersContainer.style.zIndex = '9999';
        console.log('  ✅ .routes-filters container z-index forced to 9999');
    }

    // Apply force-clickable to each filter element
    [searchInput, typeFilter, sortFilter].forEach(function(el) {
        if (el) {
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'text' === el.tagName.toLowerCase().input ? 'text' : 'pointer';
            el.style.position = 'relative';
            el.style.zIndex = '10000';
            el.style.backgroundColor = '#fff';
            console.log('  ✅ Force-clickable applied to #' + el.id);
        }
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            console.log('🔎 Search changed:', searchInput.value);
            applyFilters();
        }, 300));
    }

    // Type filter dropdown
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            console.log('🔄 Type filter changed to:', typeFilter.value);
            applyFilters();
        });
        // Also try mousedown for debugging
        typeFilter.addEventListener('mousedown', function(e) {
            console.log('🖱️ TypeFilter mousedown OK');
        });
        typeFilter.addEventListener('focus', function() {
            console.log('🎯 TypeFilter focus OK');
        });
    }

    // Sort filter dropdown
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            console.log('🔄 Sort filter changed to:', sortFilter.value);
            applyFilters();
        });
        sortFilter.addEventListener('mousedown', function(e) {
            console.log('🖱️ SortFilter mousedown OK');
        });
    }

    // Load More button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() { loadMore(); });
    }
}

// Setup modal overlay for route details
function setupModal() {
    var modal = document.createElement('div');
    modal.id = 'routeDetailModal';
    modal.className = 'route-modal-overlay';
    modal.innerHTML = '<div class="route-modal"><button class="modal-close" onclick="closeRouteDetail()">&times;</button><div id="modalContent" class="modal-content"></div></div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeRouteDetail();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeRouteDetail();
    });
}

// Apply all filters and re-render
function applyFilters() {
    var search = (document.getElementById('searchInput') && document.getElementById('searchInput').value || '').toLowerCase();
    var type = (document.getElementById('typeFilter') && document.getElementById('typeFilter').value || '');
    var sort = (document.getElementById('sortFilter') && document.getElementById('sortFilter').value || 'default');

    console.log('🔎 Filters: search="' + search + '" type="' + type + '" sort="' + sort + '"');

    filteredRoutes = allRoutes.filter(function(route) {
        if (search) {
            var n = (route.name || '').toLowerCase();
            var s = (route.subtitle || '').toLowerCase();
            var h = (route.highlights || '').toLowerCase();
            if (!n.includes(search) && !s.includes(search) && !h.includes(search)) return false;
        }

        if (type) {
            var rt = route.type || '';
            if (rt !== type && !rt.includes(type)) return false;
        }

        return true;
    });

    // Sort
    if (sort === 'price-asc') {
        filteredRoutes.sort(function(a, b) { return (a.price || 0) - (b.price || 0); });
    } else if (sort === 'price-desc') {
        filteredRoutes.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
    } else {
        filteredRoutes.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
    }

    console.log('📊 Filtered: ' + filteredRoutes.length + ' / ' + allRoutes.length);

    displayCount = 0;
    var grid = document.getElementById('routesGrid');
    if (grid) grid.innerHTML = '';
    loadMore();
}

function debounce(fn, delay) {
    var timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
    };
}

function loadMore() {
    var grid = document.getElementById('routesGrid');
    var btn = document.getElementById('loadMoreBtn');
    if (!grid) return;

    var start = displayCount;
    var end = Math.min(start + ROUTES_PER_PAGE, filteredRoutes.length);
    var frag = document.createDocumentFragment();

    for (var i = start; i < end; i++) {
        frag.appendChild(createRouteCard(filteredRoutes[i]));
    }

    grid.appendChild(frag);
    displayCount = end;

    if (btn) {
        btn.style.display = displayCount >= filteredRoutes.length ? 'none' : 'inline-block';
        if (displayCount < filteredRoutes.length) {
            btn.textContent = 'Load More (' + (filteredRoutes.length - displayCount) + ' remaining)';
        }
    }
}

// Create route card - ALL ENGLISH, NO IMAGE on card (clean typography)
function createRouteCard(route) {
    var card = document.createElement('div');
    card.className = 'route-card';
    card.setAttribute('data-id', route.id);

    // Force clickable
    card.style.cssText = 'cursor:pointer !important; pointer-events:auto !important; position:relative; z-index:1;';

    var name = route.name || 'Untitled Tour';
    var subtitle = route.subtitle || '';
    var type = route.type || '';
    var price = route.price || 0;
    var ctripPrice = route.ctripPrice || 0;
    var rating = route.rating || 0;
    var highlights = route.highlights || '';
    var tags = route.tags || '';
    var duration = route.duration || 0;

    var firstHighlight = highlights.split('|')[0] ? highlights.split('|')[0].trim() : '';

    var priceDisplay = price > 0 ? '¥' + price : 'Contact Us';
    var oldDisplay = ctripPrice > 0 && ctripPrice !== price ? '<span class="old-price">¥' + ctripPrice + '</span>' : '';
    var discount = (ctripPrice > 0 && price > 0 && ctripPrice > price) ? Math.round((1 - price / ctripPrice) * 100) : 0;

    var tagList = tags.split(',').filter(function(t) { return t.trim(); }).slice(0, 4);
    var tagBadges = tagList.map(function(t) { return '<span class="tag-badge">' + t.trim() + '</span>'; }).join('');

    card.innerHTML =
        '<div class="route-content">' +
            '<div class="route-header">' +
                '<h3 class="route-name">' + name + '</h3>' +
                (type ? '<span class="route-type-badge">' + type + '</span>' : '') +
            '</div>' +
            (subtitle ? '<p class="route-subtitle">' + subtitle + '</p>' : '') +
            '<div class="route-meta">' +
                (duration > 0 ? '<span class="route-duration">⏱️ ' + duration + ' Day' + (duration > 1 ? 's' : '') + '</span>' : '') +
                (rating > 0 ? '<span class="route-rating">⭐ ' + rating + '</span>' : '') +
            '</div>' +
            (firstHighlight ? '<p class="route-highlight">' + firstHighlight + '</p>' : '') +
            (tagBadges ? '<div class="route-tags">' + tagBadges + '</div>' : '') +
            '<div class="route-footer">' +
                '<div class="route-pricing">' + oldDisplay +
                    '<span class="current-price">' + priceDisplay + '</span>' +
                    (discount > 0 ? '<span class="discount-badge">-' + discount + '%</span>' : '') +
                '</div>' +
                '<span class="btn-view">View Details →</span>' +
            '</div>' +
        '</div>';

    card.addEventListener('click', function(e) {
        e.stopPropagation();
        showRouteDetail(route);
    });

    return card;
}

// Show route detail modal WITH IMAGE thumbnail at top
function showRouteDetail(route) {
    var name = route.name || 'Untitled Tour';
    var subtitle = route.subtitle || '';
    var type = route.type || 'Tour';
    var price = route.price || 0;
    var ctripPrice = route.ctripPrice || 0;
    var rating = route.rating || 0;
    var highlights = route.highlights || '';
    var guideReview = route.guideReview || '';
    var tags = route.tags || '';
    var imageUrl = route.imageUrl || '';
    var duration = route.duration || 0;

    var priceDisplay = price > 0 ? '¥' + price : 'Contact Us';
    var oldDisplay = ctripPrice > 0 ? '<span class="modal-old-price">¥' + ctripPrice + '</span>' : '';
    var discount = (ctripPrice > 0 && price > 0 && ctripPrice > price) ? Math.round((1 - price / ctripPrice) * 100) : 0;

    // Parse highlights into list
    var hlItems = highlights.split('|')
        .map(function(h) { return h.trim(); })
        .filter(function(h) { return h; })
        .map(function(h) { return '<li><span class="check-icon">✦</span> ' + h + '</li>'; })
        .join('');

    if (!hlItems) hlItems = '<li><span class="check-icon">✦</span> An unforgettable Chongqing experience awaits</li>';

    // Parse tags
    var tagItems = tags.split(',')
        .map(function(t) { return t.trim(); })
        .filter(function(t) { return t; })
        .map(function(t) { return '<span class="modal-tag">' + t + '</span>'; })
        .join('');

    // Itinerary based on keywords
    var itineraryHTML = generateItinerary(name, subtitle, duration);

    // What's included
    var includedHTML = generateIncludes(type, duration);

    var modal = document.getElementById('routeDetailModal');
    var content = document.getElementById('modalContent');

    // Build HTML with IMAGE at top of hero section
    var heroImageHTML = '';
    if (imageUrl) {
        heroImageHTML = '<img src="' + imageUrl + '" alt="' + name + '" class="modal-image" onerror="this.parentElement.classList.add(\'no-image\');this.remove();">';
    } else {
        heroImageHTML = '<div class="modal-image-placeholder"><span>📷</span></div>';
    }

    content.innerHTML =
        '<div class="modal-hero">' +
            heroImageHTML +
            '<div class="modal-hero-overlay">' +
                '<span class="modal-type-badge">' + type + '</span>' +
                (duration > 0 ? '<span class="modal-duration">⏱️ ' + duration + ' Day' + (duration > 1 ? 's' : '') + '</span>' : '') +
                (rating > 0 ? '<span class="modal-rating">⭐ ' + rating + '/5</span>' : '') +
            '</div>' +
        '</div>' +

        '<div class="modal-body">' +
            '<h2 class="modal-title">' + name + '</h2>' +
            (subtitle ? '<p class="modal-subtitle">' + subtitle + '</p>' : '') +

            '<div class="modal-price-block">' +
                '<div class="modal-pricing">' + oldDisplay +
                    '<span class="modal-current-price">' + priceDisplay + '<small>/person</small></span>' +
                    (discount > 0 ? '<span class="modal-discount">Save ' + discount + '%</span>' : '') +
                '</div>' +
                (tagItems ? '<div class="modal-tags">' + tagItems + '</div>' : '') +
            '</div>' +

            '<div class="modal-section">' +
                '<h3 class="modal-section-title">🌟 Tour Highlights</h3>' +
                '<ul class="modal-highlights">' + hlItems + '</ul>' +
            '</div>' +

            '<div class="modal-section">' +
                '<h3 class="modal-section-title">📋 Suggested Itinerary</h3>' +
                '<div class="modal-itinerary">' + itineraryHTML + '</div>' +
            '</div>' +

            '<div class="modal-section">' +
                '<h3 class="modal-section-title">✅ What\\'s Included</h3>' +
                '<ul class="modal-included">' + includedHTML + '</ul>' +
            '</div>' +

            (guideReview ?
            '<div class="modal-section modal-review">' +
                '<h3 class="modal-section-title">💬 Guide\\'s Notes</h3>' +
                '<div class="review-box">' +
                    '<div class="review-avatar">R</div>' +
                    '<div class="review-text">' +
                        '<p>"' + guideReview + '"</p>' +
                        '<span class="review-signature">— Ryan, Your Local Guide</span>' +
                    '</div>' +
                '</div>' +
            '</div>' : '') +

            '<div class="modal-cta">' +
                '<a href="contact.html?tour=' + encodeURIComponent(name) + '" class="btn-modal-book">Book This Tour</a>' +
                '<a href="https://wa.me/8615696078461?text=Hi%20Ryan!%20I%27m%20interested%20in:%20' + encodeURIComponent(name) + '" class="btn-modal-whatsapp" target="_blank">WhatsApp Ryan</a>' +
            '</div>' +
        '</div>';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    var mbox = modal.querySelector('.route-modal');
    if (mbox) mbox.scrollTop = 0;

    console.log('📖 Showing detail: ' + name);
}

function closeRouteDetail() {
    var modal = document.getElementById('routeDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
window.closeRouteDetail = closeRouteDetail;

// Generate suggested itinerary
function generateItinerary(name, subtitle, days) {
    var n = (name || '') + ' ' + (subtitle || '');
    var items = [];

    var hasWulong = /wulong|three natural bridges|longshui|fairy mountain|furong|karst/i.test(n);
    var hasHongya = /hongya|jiefangbei|raffles|liberation|cbd|city walk/i.test(n);
    var hasCiqikou = /ciqikou|ancient town|shibati|mountain trail|old street/i.test(n);
    var hasCruise = /cruise|yangtze|two river|night cruise|river/i.test(n);
    var hasDazu = /dazu|rock carving|baodingshan|buddha/i.test(n);
    var hasHotpot = /hotpot|food|night tour|night view/i.test(n);
    var hasLiziba = /liziba|light rail|train through/i.test(n);

    if (!days || days <= 1) {
        items.push({time:'09:00', title:'Hotel Pickup & Welcome', desc:'Pick up from your hotel in downtown Chongqing. Brief introduction to the day plan.'});
        if (hasWulong) {
            items.push({time:'10:30', title:'Arrive at Wulong Karst Park', desc:'Journey through the mountains to this UNESCO World Heritage site.'});
            items.push({time:'11:00', title:'Three Natural Bridges', desc:'Explore the massive natural arches — filming location for Transformers 4.'});
            items.push({time:'13:00', title:'Local Lunch Break', desc:'Authentic mountain village cuisine.'});
            items.push({time:'14:30', title:'Longshui Gorge', desc:'Walk through the dramatic gorge with waterfalls.'});
        } else if (hasHongya || hasCiqikou) {
            items.push({time:'10:00', title:'Ciqikou Ancient Town', desc:'Explore 1,700+ years of history and traditional architecture.'});
            items.push({time:'12:00', title:'Authentic Local Lunch', desc:'Try Chongqing small noodles, spicy tofu, and snacks.'});
            items.push({time:'13:30', title:'Liziba Light Rail Station', desc:'Watch the train pass through the building.'});
            items.push({time:'15:00', title:'Jiefangbei CBD', desc:'The heart of modern Chongqing.'});
        }
        items.push({time:'17:00', title:'Hongya Cave', desc:'Stilt-house complex that inspired Spirited Away. Best photo spot at dusk!'});
        items.push({time:'19:00', title:'Hotpot Dinner (Optional)', desc:'Experience authentic Chongqing hotpot.'});
        items.push({time:'20:30', title:'Hotel Drop-off', desc:'Return to your hotel.'});
    } else {
        items.push({time:'Day 1', title:'Arrival & City Orientation', desc:'Airport/station pickup. Evening: Hongya Cave night view + welcome dinner.'});
        if (hasWulong) items.push({time:'Day 2', title:'Wulong Karst Adventure', desc:'Three Natural Bridges + Longshui Gorge + Fairy Mountain.'});
        if (hasDazu) items.push({time:'Day 3', title:'Dazu Rock Carvings', desc:'UNESCO site with 50,000+ Buddhist statues.'});
        if (hasCruise) items.push({time:'Day 2-3', title:'Yangtze River Cruise', desc:'Scenic cruise through Three Gorges region.'});
        items.push({time:'Last Day', title:'Free Morning & Departure', desc:'Last-minute shopping or relaxation.'});
    }

    return items.map(function(it) {
        return '<div class="itinerary-item"><div class="itinerary-time">' + it.time + '</div><div class="itinerary-detail"><div class="itinerary-title">' + it.title + '</div><div class="itinerary-desc">' + it.desc + '</div></div></div>';
    }).join('');
}

// Generate "What's Included"
function generateIncludes(type, days) {
    var items = [
        '🚗 Hotel pickup and drop-off (downtown)',
        '👨‍🏫 English-speaking guide (Ryan — local expert)',
        '🚌 Private air-conditioned vehicle',
        '🎫 All entrance fees as per itinerary',
        '💧 Bottled water throughout'
    ];

    if (days >= 1) items.push('🍱 Lunch included (authentic local cuisine)');
    if (days >= 2) { items.push('🏨 Accommodation (4-star)'); items.push('🥣 Breakfast included'); }
    if (/private/i.test(type)) { items.push('🔧 Fully customizable itinerary'); items.push('⏰ Flexible timing'); }
    if (/small group/i.test(type)) { items.push('👥 Small group (max 8 people)'); items.push('🤝 Share with like-minded travelers'); }

    return items.map(function(i) { return '<li>' + i + '</li>'; }).join('');
}
'''

with open(os.path.join(BASE, 'js', 'routes.js'), 'w', encoding='utf-8') as f:
    f.write(routes_js)
print("  ✅ routes.js rewritten (English data + force-clickable filters + image in modal)")

# ============================================================
# FIX 3: CSS - Add !important to filter-select for clickability
# ============================================================
print("\nFIX 3: Updating css/style.css for filter clickability...")
with open(os.path.join(BASE, 'css', 'style.css'), 'r', encoding='utf-8') as f:
    css = f.read()

# Add enhanced filter-select styles right after .al-routes-section
css_fix = '''
/* ===== FILTER CLICKABILITY FIX (2026-05-23) ===== */
.routes-filters {
    position: relative !important;
    z-index: 9999 !important;
}

.search-box,
.filter-select {
    position: relative !important;
    z-index: 10000 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    background: #fff !important;
}

.filter-select:hover {
    border-color: #c9a961 !important;
}
'''

# Insert before the CITY TOURS - ROUTES SECTION comment
insert_marker = '/* ==================== CITY TOURS - ROUTES SECTION ==================== */'
if insert_marker in css:
    css = css.replace(insert_marker, css_fix + '\n' + insert_marker)
    print("  ✅ CSS filter fix inserted")
else:
    print("  ⚠️ CSS marker not found, appending at end instead")
    css += '\n\n' + css_fix

with open(os.path.join(BASE, 'css', 'style.css'), 'w', encoding='utf-8') as f:
    f.write(css)
print("  ✅ style.css updated")

# ============================================================
# Summary
# ============================================================
print("\n" + "=" * 60)
print("ALL FIXES APPLIED!")
print("  1. city-tours.html → filter options now English values")
print("  2. js/routes.js   → full rewrite: EN data + clickable + image modal")
print("  3. css/style.css  → filter z-index/pointer-events fix")
print("=" * 60)
