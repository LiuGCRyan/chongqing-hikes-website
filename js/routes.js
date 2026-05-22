// routes.js - Load and display routes (English version)
// Data source: data/routes_en.json (all fields in English)
// Last updated: 2026-05-23 - Full rewrite with all bugs fixed

let allRoutes = [];
let filteredRoutes = [];
let displayCount = 0;
const ROUTES_PER_PAGE = 20;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('[routes] DOM loaded, initializing...');
    loadRoutes();
    setupFilters();
    setupModal();
});

// Load routes from ENGLISH JSON
async function loadRoutes() {
    try {
        const response = await fetch('data/routes_en.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        allRoutes = await response.json();
        console.log('[routes] Loaded ' + allRoutes.length + ' routes from routes_en.json');
        applyFilters();
    } catch (error) {
        console.error('[routes] Error loading routes:', error.message);
        var grid = document.getElementById('routesGrid');
        if (grid) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#666;font-size:1.1em;">Unable to load tours. Please refresh the page or contact us.</p>';
        }
    }
}

// Setup filter event listeners
function setupFilters() {
    var searchInput = document.getElementById('searchInput');
    var typeFilter = document.getElementById('typeFilter');
    var sortFilter = document.getElementById('sortFilter');
    var loadMoreBtn = document.getElementById('loadMoreBtn');

    console.log('[routes] Setting up filters...');
    console.log('[routes]   searchInput:', !!searchInput);
    console.log('[routes]   typeFilter:', !!typeFilter);
    console.log('[routes]   sortFilter:', !!sortFilter);
    console.log('[routes]   loadMoreBtn:', !!loadMoreBtn);

    // Force-clickable on filters container
    var filtersContainer = document.querySelector('.routes-filters');
    if (filtersContainer) {
        filtersContainer.style.position = 'relative';
        filtersContainer.style.zIndex = '9999';
    }

    // Apply force-clickable styles to each filter element (FIXED: no more tagName bug)
    if (searchInput) {
        searchInput.style.pointerEvents = 'auto';
        searchInput.style.position = 'relative';
        searchInput.style.zIndex = '10000';
        searchInput.style.backgroundColor = '#fff';
    }
    if (typeFilter) {
        typeFilter.style.pointerEvents = 'auto';
        typeFilter.style.cursor = 'pointer';
        typeFilter.style.position = 'relative';
        typeFilter.style.zIndex = '10000';
        typeFilter.style.backgroundColor = '#fff';
    }
    if (sortFilter) {
        sortFilter.style.pointerEvents = 'auto';
        sortFilter.style.cursor = 'pointer';
        sortFilter.style.position = 'relative';
        sortFilter.style.zIndex = '10000';
        sortFilter.style.backgroundColor = '#fff';
    }

    // Search input event
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            applyFilters();
        }, 300));
    }

    // Type filter change event
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            applyFilters();
        });
    }

    // Sort filter change event
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            applyFilters();
        });
    }

    // Load More button click event
    if (loadMoreBtn) {
        // Force clickable - critical fix
        loadMoreBtn.style.pointerEvents = 'auto';
        loadMoreBtn.style.cursor = 'pointer';
        loadMoreBtn.style.position = 'relative';
        loadMoreBtn.style.zIndex = '10000';
        
        loadMoreBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('[routes] Load More clicked! current:', displayCount, '/', filteredRoutes.length);
            loadMore();
        });
        
        // Also bind on mousedown as backup
        loadMoreBtn.addEventListener('mousedown', function(e) {
            console.log('[routes] Load More mousedown detected');
        });
        
        console.log('[routes] Load More button handler attached');
    }

    console.log('[routes] Filters setup complete');
}

// Setup modal overlay for route details
function setupModal() {
    // Check if modal already exists
    if (document.getElementById('routeDetailModal')) return;

    var modal = document.createElement('div');
    modal.id = 'routeDetailModal';
    modal.className = 'route-modal-overlay';

    var inner = document.createElement('div');
    inner.className = 'route-modal';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function() { closeRouteDetail(); };

    var contentDiv = document.createElement('div');
    contentDiv.id = 'modalContent';
    contentDiv.className = 'modal-content';

    inner.appendChild(closeBtn);
    inner.appendChild(contentDiv);
    modal.appendChild(inner);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeRouteDetail();
    });

    document.body.appendChild(modal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeRouteDetail();
    });

    console.log('[routes] Modal setup complete');
}

// Apply all filters and re-render
function applyFilters() {
    var searchVal = '';
    var typeVal = '';
    var sortVal = 'default';

    var si = document.getElementById('searchInput');
    if (si) searchVal = (si.value || '').toLowerCase();

    var tf = document.getElementById('typeFilter');
    if (tf) typeVal = tf.value || '';

    var sf = document.getElementById('sortFilter');
    if (sf) sortVal = sf.value || 'default';

    console.log('[routes] Applying filters: search="' + searchVal + '" type="' + typeVal + '" sort="' + sortVal + '"');

    filteredRoutes = allRoutes.filter(function(route) {
        // Search filter
        if (searchVal) {
            var n = (route.name || '').toLowerCase();
            var s = (route.subtitle || '').toLowerCase();
            var h = (route.highlights || '').toLowerCase();
            if (!n.includes(searchVal) && !s.includes(searchVal) && !h.includes(searchVal)) return false;
        }

        // Type filter
        if (typeVal) {
            var rt = route.type || '';
            if (rt !== typeVal) return false;
        }

        return true;
    });

    // Sort
    if (sortVal === 'price-asc') {
        filteredRoutes.sort(function(a, b) { return (a.price || 0) - (b.price || 0); });
    } else if (sortVal === 'price-desc') {
        filteredRoutes.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
    } else {
        // Default: sort by rating desc
        filteredRoutes.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
    }

    console.log('[routes] Filtered result: ' + filteredRoutes.length + ' / ' + allRoutes.length);

    // Reset and re-render
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

    console.log('[routes] Loading routes ' + start + ' to ' + end + ' of ' + filteredRoutes.length);

    for (var i = start; i < end; i++) {
        var card = createRouteCard(filteredRoutes[i]);
        if (card) grid.appendChild(card);
    }

    displayCount = end;

    if (btn) {
        if (displayCount >= filteredRoutes.length) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
            btn.textContent = 'Load More (' + (filteredRoutes.length - displayCount) + ' remaining)';
        }
    }
}

// Create route card element - ALL ENGLISH, clean typography, NO image on card
function createRouteCard(route) {
    if (!route) return null;

    var card = document.createElement('div');
    card.className = 'route-card';
    card.setAttribute('data-id', route.id || '');
    card.style.cssText = 'cursor:pointer; pointer-events:auto; position:relative; z-index:1;';

    var name = route.name || 'Untitled Tour';
    var subtitle = route.subtitle || '';
    var type = route.type || '';
    var price = route.price || 0;
    var ctripPrice = route.ctripPrice || 0;
    var rating = route.rating || 0;
    var highlights = route.highlights || '';
    var tags = route.tags || '';
    var duration = route.duration || 0;

    // Get first highlight
    var parts = highlights.split('|');
    var firstHighlight = '';
    for (var p = 0; p < parts.length; p++) {
        var h = parts[p].trim();
        if (h) { firstHighlight = h; break; }
    }

    // Price display
    var priceDisplay = price > 0 ? '\u00A5' + price : 'Contact Us';
    var oldPriceHtml = '';
    if (ctripPrice > 0 && ctripPrice !== price) {
        oldPriceHtml = '<span class="old-price">\u00A5' + ctripPrice + '</span>';
    }
    var discountBadge = '';
    if (ctripPrice > 0 && price > 0 && ctripPrice > price) {
        var pct = Math.round((1 - price / ctripPrice) * 100);
        discountBadge = '<span class="discount-badge">-' + pct + '%</span>';
    }

    // Tags as badges
    var tagParts = tags.split(',');
    var tagBadges = '';
    var tagCount = 0;
    for (var t = 0; t < tagParts.length && tagCount < 4; t++) {
        var tg = tagParts[t].trim();
        if (tg) {
            tagBadges += '<span class="tag-badge">' + escapeHtml(tg) + '</span>';
            tagCount++;
        }
    }

    // Duration text
    var durationText = '';
    if (duration > 0) {
        durationText = '<span class="route-duration">\u23F1\uFE0F ' + duration + ' Day' + (duration > 1 ? 's' : '') + '</span>';
    }

    // Rating text
    var ratingText = '';
    if (rating > 0) {
        ratingText = '<span class="route-rating">\u2B50 ' + rating + '</span>';
    }

    // Type badge
    var typeBadge = '';
    if (type) {
        typeBadge = '<span class="route-type-badge">' + escapeHtml(type) + '</span>';
    }

    // Build card HTML
    var html = '<div class="route-content">';
    html += '<div class="route-header">';
    html += '<h3 class="route-name">' + escapeHtml(name) + '</h3>';
    html += typeBadge;
    html += '</div>';

    if (subtitle) {
        html += '<p class="route-subtitle">' + escapeHtml(subtitle) + '</p>';
    }

    html += '<div class="route-meta">';
    html += durationText;
    html += ratingText;
    html += '</div>';

    if (firstHighlight) {
        html += '<p class="route-highlight">' + escapeHtml(firstHighlight) + '</p>';
    }

    if (tagBadges) {
        html += '<div class="route-tags">' + tagBadges + '</div>';
    }

    html += '<div class="route-footer">';
    html += '<div class="route-pricing">';
    html += oldPriceHtml;
    html += '<span class="current-price">' + priceDisplay + '</span>';
    html += discountBadge;
    html += '</div>';
    html += '<span class="btn-view">View Details \u2192</span>';
    html += '</div>';
    html += '</div>';

    card.innerHTML = html;

    // Click handler
    card.addEventListener('click', function(e) {
        e.stopPropagation();
        showRouteDetail(route);
    });

    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Show route detail modal WITH IMAGE at top
function showRouteDetail(route) {
    if (!route) return;

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

    var priceDisplay = price > 0 ? '\u00A5' + price : 'Contact Us';
    var oldPriceHtml2 = '';
    if (ctripPrice > 0) {
        oldPriceHtml2 = '<span class="modal-old-price">\u00A5' + ctripPrice + '</span>';
    }
    var discountBadge2 = '';
    if (ctripPrice > 0 && price > 0 && ctripPrice > price) {
        var pct2 = Math.round((1 - price / ctripPrice) * 100);
        discountBadge2 = '<span class="modal-discount">Save ' + pct2 + '%</span>';
    }

    // Parse highlights into list items
    var hlParts = highlights.split('|');
    var hlItems = '';
    var hasHl = false;
    for (var hi = 0; hi < hlParts.length; hi++) {
        var hv = hlParts[hi].trim();
        if (hv) {
            hlItems += '<li><span class="check-icon">\u2726</span> ' + escapeHtml(hv) + '</li>';
            hasHl = true;
        }
    }
    if (!hasHl) {
        hlItems = '<li><span class="check-icon">\u2726</span> An unforgettable Chongqing experience awaits</li>';
    }

    // Parse tags
    var tgParts = tags.split(',');
    var tagItems = '';
    for (var ti = 0; ti < tgParts.length; ti++) {
        var tv = tgParts[ti].trim();
        if (tv) {
            tagItems += '<span class="modal-tag">' + escapeHtml(tv) + '</span>';
        }
    }

    // Itinerary
    var itineraryHTML = generateItinerary(name, subtitle, duration);

    // What's included
    var includedHTML = generateIncludes(type, duration);

    // Get modal elements
    var modal = document.getElementById('routeDetailModal');
    var content = document.getElementById('modalContent');

    if (!modal || !content) {
        console.error('[routes] Modal not found!');
        return;
    }

    // Build hero image HTML (FIXED: use double quotes for outer, escaped for inner)
    var heroImageHTML = '';
    if (imageUrl) {
        // Use Unicode escapes to avoid any quote issues
        heroImageHTML = '<img src="' + imageUrl + '" alt="' + escapeHtml(name) + '" class="modal-image" onerror="this.parentElement.classList.add(&apos;no-image&apos;);this.remove();" />';
    } else {
        heroImageHTML = '<div class="modal-image-placeholder"><span>\uD83DDCF7</span></div>';
    }

    // Duration badge for modal
    var durBadge = '';
    if (duration > 0) {
        durBadge = '<span class="modal-duration">\u23F1\uFE0F ' + duration + ' Day' + (duration > 1 ? 's' : '') + '</span>';
    }

    // Rating badge for modal
    var ratBadge = '';
    if (rating > 0) {
        ratBadge = '<span class="modal-rating">\u2B50 ' + rating + '/5</span>';
    }

    // Build full modal HTML
    var fullHtml = '';

    // Hero section with image
    fullHtml += '<div class="modal-hero">';
    fullHtml += heroImageHTML;
    fullHtml += '<div class="modal-hero-overlay">';
    fullHtml += '<span class="modal-type-badge">' + escapeHtml(type) + '</span>';
    fullHtml += durBadge;
    fullHtml += ratBadge;
    fullHtml += '</div>';
    fullHtml += '</div>';

    // Body section
    fullHtml += '<div class="modal-body">';

    // Title
    fullHtml += '<h2 class="modal-title">' + escapeHtml(name) + '</h2>';
    if (subtitle) {
        fullHtml += '<p class="modal-subtitle">' + escapeHtml(subtitle) + '</p>';
    }

    // Price block
    fullHtml += '<div class="modal-price-block">';
    fullHtml += '<div class="modal-pricing">';
    fullHtml += oldPriceHtml2;
    fullHtml += '<span class="modal-current-price">' + priceDisplay + '<small>/person</small></span>';
    fullHtml += discountBadge2;
    fullHtml += '</div>';
    if (tagItems) {
        fullHtml += '<div class="modal-tags">' + tagItems + '</div>';
    }
    fullHtml += '</div>';

    // Highlights
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\uD83C\uDF1F Tour Highlights</h3>';
    fullHtml += '<ul class="modal-highlights">' + hlItems + '</ul>';
    fullHtml += '</div>';

    // Itinerary
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\uD83D\uDCCB Suggested Itinerary</h3>';
    fullHtml += '<div class="modal-itinerary">' + itineraryHTML + '</div>';
    fullHtml += '</div>';

    // What's included
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\u2705 What\'s Included</h3>';
    fullHtml += '<ul class="modal-included">' + includedHTML + '</ul>';
    fullHtml += '</div>';

    // Guide review
    if (guideReview) {
        fullHtml += '<div class="modal-section modal-review">';
        fullHtml += '<h3 class="modal-section-title">\uD83D\uDCAC Guide\'s Notes</h3>';
        fullHtml += '<div class="review-box">';
        fullHtml += '<div class="review-avatar">R</div>';
        fullHtml += '<div class="review-text">';
        fullHtml += '<p>"' + escapeHtml(guideReview) + '"</p>';
        fullHtml += '<span class="review-signature">\u2014 Ryan, Your Local Guide</span>';
        fullHtml += '</div>';
        fullHtml += '</div>';
        fullHtml += '</div>';
    }

    // CTA buttons
    fullHtml += '<div class="modal-cta">';
    fullHtml += '<a href="contact.html?tour=' + encodeURIComponent(name) + '" class="btn-modal-book">Book This Tour</a>';
    fullHtml += '<a href="https://wa.me/8615696078461?text=Hi%20Ryan!%20I%27m%20interested%20in:%20' + encodeURIComponent(name) + '" class="btn-modal-whatsapp" target="_blank" rel="noopener">WhatsApp Ryan</a>';
    fullHtml += '</div>';

    fullHtml += '</div>'; // end modal-body

    content.innerHTML = fullHtml;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    var mbox = modal.querySelector('.route-modal');
    if (mbox) mbox.scrollTop = 0;

    console.log('[routes] Showing detail: ' + name);
}

function closeRouteDetail() {
    var modal = document.getElementById('routeDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
window.closeRouteDetail = closeRouteDetail;

// Generate suggested itinerary based on keywords
function generateItinerary(name, subtitle, days) {
    var searchText = ((name || '') + ' ' + (subtitle || '')).toLowerCase();
    var items = [];

    var hasWulong = /wulong|three natural bridges|longshui|fairy mountain|furong|karst/i.test(searchText);
    var hasHongya = /hongya|jiefangbei|raffles|liberation|cbd|city walk/i.test(searchText);
    var hasCiqikou = /ciqikou|ancient town|shibati|mountain trail|old street/i.test(searchText);
    var hasCruise = /cruise|yangtze|two river|night cruise|river/i.test(searchText);
    var hasDazu = /dazu|rock carving|baodingshan|buddha/i.test(searchText);
    var hasHotpot = /hotpot|food|night tour|night view/i.test(searchText);
    var hasLiziba = /liziba|light rail|train through/i.test(searchText);

    if (!days || days <= 1) {
        items.push({time:'09:00', title:'Hotel Pickup & Welcome', desc:'Pick up from your hotel in downtown Chongqing. Brief introduction to the day plan.'});
        if (hasWulong) {
            items.push({time:'10:30', title:'Arrive at Wulong Karst Park', desc:'Journey through the mountains to this UNESCO World Heritage site.'});
            items.push({time:'11:00', title:'Three Natural Bridges', desc:'Explore the massive natural arches \u2014 filming location for Transformers 4.'});
            items.push({time:'13:00', title:'Local Lunch Break', desc:'Authentic mountain village cuisine.'});
            items.push({time:'14:30', title:'Longshui Gorge', desc:'Walk through the dramatic gorge with waterfalls.'});
        } else if (hasHongya || hasCiqikou) {
            items.push({time:'10:00', title:'Ciqikou Ancient Town', desc:'Explore 1,700+ years of history and traditional architecture.'});
            items.push({time:'12:00', title:'Authentic Local Lunch', desc:'Try Chongqing small noodles, spicy tofu, and snacks.'});
            items.push({time:'13:30', title:'Liziba Light Rail Station', desc:'Watch the train pass through the building.'});
            items.push({time:'15:00', title:'Jiefangbei CBD', desc:'The heart of modern Chongqing.'});
        } else {
            items.push({time:'10:00', title:'City Exploration Begins', desc:'Start your guided tour of Chongqing\'s most iconic spots.'});
            items.push({time:'12:00', title:'Authentic Local Lunch', desc:'Enjoy authentic Chongqing cuisine at a local favorite restaurant.'});
            items.push({time:'14:00', title:'Iconic Landmarks Visit', desc:'Visit the must-see landmarks that make Chongqing famous worldwide.'});
        }
        items.push({time:'17:00', title:'Hongya Cave', desc:'Stilt-house complex that inspired Spirited Away. Best photo spot at dusk!'});
        items.push({time:'19:00', title:'Hotpot Dinner (Optional)', desc:'Experience authentic Chongqing hotpot with a local expert guide.'});
        items.push({time:'20:30', title:'Hotel Drop-off', desc:'Return to your hotel.'});
    } else {
        items.push({time:'Day 1', title:'Arrival & City Orientation', desc:'Airport/station pickup. Evening: Hongya Cave night view + welcome dinner.'});
        if (hasWulong) items.push({time:'Day 2', title:'Wulong Karst Adventure', desc:'Three Natural Bridges + Longshui Gorge + Fairy Mountain.'});
        if (hasDazu) items.push({time:'Day 3', title:'Dazu Rock Carvings', desc:'UNESCO site with 50,000+ Buddhist statues.'});
        if (hasCruise) items.push({time:'Day 2-3', title:'Yangtze River Cruise', desc:'Scenic cruise through Three Gorges region.'});
        items.push({time:'Last Day', title:'Free Morning & Departure', desc:'Last-minute shopping or relaxation before departure.'});
    }

    var result = '';
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        result += '<div class="itinerary-item">';
        result += '<div class="itinerary-time">' + it.time + '</div>';
        result += '<div class="itinerary-detail">';
        result += '<div class="itinerary-title">' + it.title + '</div>';
        result += '<div class="itinerary-desc">' + it.desc + '</div>';
        result += '</div>';
        result += '</div>';
    }
    return result;
}

// Generate "What's Included" list based on tour type and duration
function generateIncludes(type, days) {
    var items = [
        '\uD83D\uDE97 Hotel pickup and drop-off (downtown)',
        '\uD83D\uDC68\u200D\uD83D\uDCDA English-speaking guide (Ryan \u2014 local expert)',
        '\uD83D\uDE8C Private air-conditioned vehicle',
        '\uD83C\uDFA7 All entrance fees as per itinerary',
        '\uD83D\uDCA7 Bottled water throughout'
    ];

    if (days >= 1) items.push('\uD83C\uDF74 Lunch included (authentic local cuisine)');
    if (days >= 2) {
        items.push('\uD83C\uDFE8 Accommodation (4-star)');
        items.push('\uD83E\uDD5A Breakfast included');
    }
    if (/private/i.test(type)) {
        items.push('\uD83D\uDD27 Fully customizable itinerary');
        items.push('\u23F0 Flexible timing');
    }
    if (/small group/i.test(type)) {
        items.push('\uD83D\uDC65 Small group (max 8 people)');
        items.push('\uD83E\uDD1D Share with like-minded travelers');
    }

    var result = '';
    for (var i = 0; i < items.length; i++) {
        result += '<li>' + items[i] + '</li>';
    }
    return result;
}
