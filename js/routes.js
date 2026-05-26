// routes.js - Load and display routes (English version)
// Data source: data/routes_en.json (all fields in English)
let allRoutes = [];
let filteredRoutes = [];
let displayCount = 0;
const ROUTES_PER_PAGE = 20;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
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
        // Apply price adjustment (reduce by half)
        for (var i = 0; i < allRoutes.length; i++) {
            var route = allRoutes[i];
            if (route.price && route.price > 0) {
                route.price = Math.round(route.price * 0.5);
            }
            // Remove ctripPrice to prevent old-price display
            delete route.ctripPrice;
        }
        applyFilters();
    } catch (error) {
        var grid = document.getElementById('routesGrid');
        var skeleton = document.getElementById('loadingSkeleton');
        if (skeleton) skeleton.style.display = 'none';
        if (grid) {
            grid.style.display = 'block';
            grid.innerHTML = '<p class="routes-error">Unable to load tours. Please refresh the page or contact us.</p>';
        }
    }
}

// Setup filter event listeners
function setupFilters() {
    var searchInput = document.getElementById('searchInput');
    var typeFilter = document.getElementById('typeFilter');
    var sortFilter = document.getElementById('sortFilter');
    var priceFilter = document.getElementById('filter-price');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    var resetBtn = document.getElementById('btn-reset-filters');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            applyFilters();
        }, 300));
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            applyFilters();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            applyFilters();
        });
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', function() {
            applyFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (typeFilter) typeFilter.value = '';
            if (sortFilter) sortFilter.value = 'default';
            if (priceFilter) priceFilter.value = '';
            applyFilters();
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            loadMore();
        });
    }
}

// Setup modal overlay for route details
function setupModal() {
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
}

// Apply all filters and re-render
function applyFilters() {
    var searchVal = '';
    var typeVal = '';
    var sortVal = 'default';
    var priceVal = '';
    var si = document.getElementById('searchInput');
    if (si) searchVal = (si.value || '').toLowerCase();
    var tf = document.getElementById('typeFilter');
    if (tf) typeVal = tf.value || '';
    var sf = document.getElementById('sortFilter');
    if (sf) sortVal = sf.value || 'default';
    var pf = document.getElementById('filter-price');
    if (pf) priceVal = pf.value || '';

    filteredRoutes = allRoutes.filter(function(route) {
        if (searchVal) {
            var n = (route.name || '').toLowerCase();
            var s = (route.subtitle || '').toLowerCase();
            var h = (route.highlights || '').toLowerCase();
            if (!n.includes(searchVal) && !s.includes(searchVal) && !h.includes(searchVal)) return false;
        }
        if (typeVal) {
            var rt = route.type || '';
            if (rt !== typeVal) return false;
        }
        if (priceVal) {
            var p = route.price || 0;
            if (priceVal.indexOf('+') > -1) {
                var minP = parseInt(priceVal);
                if (p < minP) return false;
            } else {
                var parts = priceVal.split('-');
                var lo = parseInt(parts[0]);
                var hi = parseInt(parts[1]);
                if (p < lo || p > hi) return false;
            }
        }
        return true;
    });

    if (sortVal === 'price-asc') {
        filteredRoutes.sort(function(a, b) { return (a.price || 0) - (b.price || 0); });
    } else if (sortVal === 'price-desc') {
        filteredRoutes.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
    } else {
        filteredRoutes.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
    }

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
    var skeleton = document.getElementById('loadingSkeleton');
    var btnContainer = document.getElementById('loadMoreContainer');
    if (!grid) return;

    // Hide skeleton, show grid
    if (skeleton) skeleton.style.display = 'none';
    grid.style.display = 'block';

    var start = displayCount;
    var end = Math.min(start + ROUTES_PER_PAGE, filteredRoutes.length);

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
    if (btnContainer) {
        btnContainer.style.display = displayCount >= filteredRoutes.length ? 'none' : 'block';
    }
}

function createRouteCard(route) {
    if (!route) return null;
    var card = document.createElement('div');
    card.className = 'route-card';
    card.setAttribute('data-id', route.id || '');

    var name = route.name || 'Untitled Tour';
    var subtitle = route.subtitle || '';
    var type = route.type || '';
    var price = route.price || 0;
    var rating = route.rating || 0;
    var highlights = route.highlights || '';
    var tags = route.tags || '';
    var duration = route.duration || 0;
    var imageUrl = route.imageUrl || '';

    var parts = highlights.split('|');
    var firstHighlight = '';
    for (var p = 0; p < parts.length; p++) {
        var h = parts[p].trim();
        if (h) { firstHighlight = h; break; }
    }

    var priceDisplay = price > 0 ? '$' + price : 'Contact Us';

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

    var durationText = '';
    if (duration > 0) {
        durationText = '<span class="route-duration">\u23F1\uFE0F ' + duration + ' Day' + (duration > 1 ? 's' : '') + '</span>';
    }

    var ratingText = '';
    if (rating > 0) {
        ratingText = '<span class="route-rating">\u2B50 ' + rating + '</span>';
    }

    var typeBadge = '';
    if (type) {
        typeBadge = '<span class="route-type-badge">' + escapeHtml(type) + '</span>';
    }

    var html = '';
    if (imageUrl) {
        html += '<div class="route-image">';
        html += '<img src="' + imageUrl + '" alt="' + escapeHtml(name) + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'" />';
        html += '</div>';
    }

    html += '<div class="route-content">';
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
    html += '<span class="current-price">' + priceDisplay + '</span>';
    html += '</div>';
    html += '<span class="btn-view">View Details \u2192</span>';
    html += '</div>';
    html += '</div>';

    card.innerHTML = html;
    card.addEventListener('click', function(e) {
        e.stopPropagation();
        showRouteDetail(route);
    });
    return card;
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showRouteDetail(route) {
    if (!route) return;
    var name = route.name || 'Untitled Tour';
    var subtitle = route.subtitle || '';
    var type = route.type || 'Tour';
    var price = route.price || 0;
    var rating = route.rating || 0;
    var highlights = route.highlights || '';
    var guideReview = route.guideReview || '';
    var tags = route.tags || '';
    var imageUrl = route.imageUrl || '';
    var duration = route.duration || 0;

    var priceDisplay = price > 0 ? '$' + price : 'Contact Us';

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

    var tgParts = tags.split(',');
    var tagItems = '';
    for (var ti = 0; ti < tgParts.length; ti++) {
        var tv = tgParts[ti].trim();
        if (tv) {
            tagItems += '<span class="modal-tag">' + escapeHtml(tv) + '</span>';
        }
    }

    var itineraryHTML = generateItinerary(name, subtitle, duration);
    var includedHTML = generateIncludes(type, duration);

    var modal = document.getElementById('routeDetailModal');
    var content = document.getElementById('modalContent');
    if (!modal || !content) return;

    var heroImageHTML = '';
    var heroNoImageClass = '';
    if (imageUrl) {
        heroImageHTML = '<img src="' + imageUrl + '" alt="' + escapeHtml(name) + '" class="modal-image" onerror="this.parentElement.classList.add(\'no-image\');this.remove();" />';
    } else {
        heroNoImageClass = ' no-image';
    }

    var durBadge = '';
    if (duration > 0) {
        durBadge = '<span class="modal-duration">\u23F1\uFE0F ' + duration + ' Day' + (duration > 1 ? 's' : '') + '</span>';
    }

    var ratBadge = '';
    if (rating > 0) {
        ratBadge = '<span class="modal-rating">\u2B50 ' + rating + '/5</span>';
    }

    var fullHtml = '';
    fullHtml += '<div class="modal-hero' + heroNoImageClass + '">';
    fullHtml += heroImageHTML;
    fullHtml += '<div class="modal-hero-overlay-top">';
    fullHtml += '<span class="modal-type-badge">' + escapeHtml(type) + '</span>';
    fullHtml += durBadge;
    fullHtml += ratBadge;
    fullHtml += '</div>';
    fullHtml += '<div class="modal-hero-overlay-bottom">';
    fullHtml += '<div class="hero-price-group">';
    fullHtml += '<span class="hero-current-price">' + priceDisplay + '<small>/person</small></span>';
    fullHtml += '</div>';
    fullHtml += '</div>';
    fullHtml += '</div>';

    fullHtml += '<div class="modal-body">';
    fullHtml += '<h2 class="modal-title">' + escapeHtml(name) + '</h2>';
    if (subtitle) {
        fullHtml += '<p class="modal-subtitle">' + escapeHtml(subtitle) + '</p>';
    }
    if (tagItems) {
        fullHtml += '<div class="modal-price-block modal-tags-only">';
        fullHtml += '<div class="modal-tags">' + tagItems + '</div>';
        fullHtml += '</div>';
    }
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\uD83C\uDF1F Tour Highlights</h3>';
    fullHtml += '<ul class="modal-highlights">' + hlItems + '</ul>';
    fullHtml += '</div>';
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\uD83D\uDCCB Suggested Itinerary</h3>';
    fullHtml += '<div class="modal-itinerary">' + itineraryHTML + '</div>';
    fullHtml += '</div>';
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\u2705 What\'s Included</h3>';
    fullHtml += '<ul class="modal-included">' + includedHTML + '</ul>';
    fullHtml += '</div>';
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
    fullHtml += '<div class="modal-cta">';
    fullHtml += '<a href="contact.html?tour=' + encodeURIComponent(name) + '" class="btn-modal-book">Book This Tour</a>';
    fullHtml += '<a href="https://wa.me/8615696078461?text=Hi%20Ryan!%20I%27m%20interested%20in:%20' + encodeURIComponent(name) + '" class="btn-modal-whatsapp" target="_blank" rel="noopener">WhatsApp Ryan</a>';
    fullHtml += '</div>';
    fullHtml += '</div>';

    content.innerHTML = fullHtml;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    var mbox = modal.querySelector('.route-modal');
    if (mbox) mbox.scrollTop = 0;
}

function closeRouteDetail() {
    var modal = document.getElementById('routeDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
window.closeRouteDetail = closeRouteDetail;

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
