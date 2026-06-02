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
        // Remove ctripPrice to prevent old-price display
        for (var i = 0; i < allRoutes.length; i++) {
            delete allRoutes[i].ctripPrice;
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
    var additionalHighlights = [];
    for (var p = 0; p < parts.length; p++) {
        var h = parts[p].trim();
        if (h) {
            if (!firstHighlight) {
                firstHighlight = h;
            } else if (additionalHighlights.length < 3) {
                additionalHighlights.push(h);
            }
        }
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
    if (additionalHighlights.length > 0) {
        html += '<div class="route-features">';
        for (var f = 0; f < additionalHighlights.length; f++) {
            html += '<span class="route-feature">\u2713 ' + escapeHtml(additionalHighlights[f]) + '</span>';
        }
        html += '</div>';
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
    // Scenic Spots Breakdown
    var spotsHTML = generateScenicSpots(name, subtitle, highlights);
    fullHtml += '<div class="modal-section">';
    fullHtml += '<h3 class="modal-section-title">\uD83D\uDDFA\uFE0F Scenic Spots Breakdown</h3>';
    fullHtml += '<div class="modal-spots">' + spotsHTML + '</div>';
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

function generateScenicSpots(name, subtitle, highlights) {
    // Parse spots from subtitle (separated by \u00b7)
    var spotNames = [];
    if (subtitle) {
        var parts = subtitle.split('\u00b7');
        for (var i = 0; i < parts.length; i++) {
            var s = parts[i].trim();
            if (s) spotNames.push(s);
        }
    }
    // If no spots from subtitle, try highlights
    if (spotNames.length === 0 && highlights) {
        var hlParts = highlights.split('|');
        for (var j = 0; j < hlParts.length && j < 5; j++) {
            var h = hlParts[j].trim();
            if (h) spotNames.push(h);
        }
    }
    // If still no spots, use name
    if (spotNames.length === 0) {
        spotNames.push(name || 'Tour Destination');
    }

    // Spot descriptions database
    var spotDB = {
        'Hongya Cave': 'A 75-meter-high stilt-house complex built into the cliff face overlooking the Jialing River. At night, its layered wooden balconies glow with warm light \u2014 said to have inspired Miyazaki\'s Spirited Away bathhouse scene. Free to enter, magical after dark.',
        'Ciqikou Ancient Town': 'A 1,700-year-old preserved town with cobblestone alleys, traditional teahouses, and artisan workshops. Once a vital port on the Jialing River, now a living museum of old Chongqing life. Try the famous Chen Mahua twisted dough and watch craftsmen at work.',
        'Liziba Station': 'The world-famous light rail station where Line 2 passes directly through a residential building on the 6th-8th floors. An engineering marvel that embodies Chongqing\'s 8D cityscape. Trains glide silently through \u2014 residents barely notice.',
        'Jiefangbei': 'Chongqing\'s Times Square \u2014 a towering 27.5m monument surrounded by gleaming malls and neon lights. The spiritual and commercial heart of the city since 1947. Perfect for people-watching and feeling the city\'s pulse.',
        'Three Natural Bridges': 'Three colossal limestone arches \u2014 Tianlong, Qinglong, and Heilong \u2014 rising up to 281m, forming Asia\'s largest natural bridge cluster. A UNESCO World Heritage site and filming location for Transformers 4 and Curse of the Golden Flower. Walk through the mist-filled valley beneath these ancient giants.',
        'Wulong Karst': 'A UNESCO World Heritage landscape of dramatic gorges, natural bridges, and caves carved over millions of years. The Three Natural Bridges, Longshui Gorge, and Fairy Mountain together create one of China\'s most spectacular geological wonders.',
        'Longshui Gorge': 'A dramatic 5km narrow gorge with walls reaching 200m high, carved by millennia of water erosion. Walk the suspended walkway past thundering waterfalls and emerald pools. Cool mist rises constantly \u2014 bring a rain jacket even in summer.',
        'Fairy Mountain': 'A 1,991m alpine meadow often called \'Oriental Switzerland\' for its rolling grasslands and cool summer climate. In winter, it transforms into a ski resort. Year-round, the panoramic views of the Wulong karst landscape are breathtaking.',
        'Dazu Rock Carvings': 'A UNESCO World Heritage site featuring over 50,000 Buddhist, Confucian, and Taoist stone carvings created from the 7th to 13th century. The Baodingshan section is the crown jewel \u2014 an entire mountainside carved with intricate reliefs telling stories of enlightenment and daily life.',
        'Fengdu Ghost City': 'A 2,000-year-old complex of temples and shrines dedicated to the afterlife, built on Ming Mountain. Walk through the \'Courts of Hell\' with their vivid depictions of judgment and punishment. Part cultural museum, part spiritual journey \u2014 unlike anything you\'ve seen.',
        'Baidicheng': 'The \'White Emperor City\' perched atop a cliff at the entrance to Qutang Gorge. Where Liu Bei entrusted his son to Zhuge Liang in Three Kingdoms legend. Poet Li Bai\'s famous verse \'Departing from Baidi amid colored clouds\' was written here. Stunning Yangtze views.',
        'Qutang Gorge': 'The shortest (8km) but most dramatic of the Three Gorges \u2014 sheer cliffs tower 1,200m above the Yangtze like giant gates. Called \'the most magnificent gorge under heaven\'. The Kuimen Gate at its entrance is featured on China\'s 10-yuan note.',
        'Wu Gorge': 'The middle and most poetic of the Three Gorges, stretching 45km with mist-shrouded peaks said to resemble twelve elegant goddesses. The deep, winding valley changes mood with the weather \u2014 ethereal in fog, dramatic in sunlight.',
        'Xiling Gorge': 'The longest of the Three Gorges at 76km, known for its turbulent rapids (now calmed by the dam) and hidden caves. The scenery is more varied \u2014 alternating between narrow chasms and open river valleys dotted with orange groves.',
        'Three Gorges Dam': 'The world\'s largest hydroelectric dam \u2014 2,335m long and 185m high. An engineering marvel visible from space. The ship lift and five-stage lock system are jaw-dropping. Love it or hate it, you can\'t ignore it.',
        'Project 816': 'A top-secret underground nuclear facility carved into a mountain by 60,000 soldiers over 18 years, never completed. Now open to the public \u2014 explore 20km of tunnels, the massive reactor hall, and eerie Cold War remnants. China\'s most surreal historical site.',
        'Youyang Peach Blossom Spring': 'A valley straight from Tao Yuanming\'s 4th-century fable of a hidden utopia. Walk through a narrow cave to emerge into a sunlit valley of peach trees, rice paddies, and traditional Tujia villages. Time seems to stop here.',
        'Gongtan Ancient Town': 'A 1,700-year-old riverside town of stilt houses perched over the Wu River, once a vital salt trading port. Its wooden architecture cascades down the cliff in layers \u2014 less commercialized than Ciqikou, more authentically atmospheric.',
        'Jinfo Mountain': 'A UNESCO Biosphere Reserve and World Heritage site rising 2,251m, home to 6,000+ plant species and ancient rhododendron forests. The glass walkway along the cliff edge offers views that make your heart race.',
        'Wuling Rift Valley': 'Called \'China\'s Most Dynamic Gorge\' \u2014 a 10km canyon slicing through the Wuling Mountains with 1,400m walls. The underground river, natural bridges, and primeval forest make this a geologist\'s dream and a photographer\'s paradise.',
        'Wujiang Gallery': 'A 60km stretch of the Wu River where emerald water winds between towering karst cliffs, earning the name \'Hundred-Mile Gallery\'. The ever-changing rock formations and reflections create a living Chinese landscape painting.',
        'Hechuan Fishing City': 'A 13th-century fortress that withstood the Mongol army for 36 years \u2014 where M\u00f6ngke Khan died, changing world history. Walk the ancient walls above the Jialing River and see why this small mountain changed the fate of empires.',
        'Shibati Traditional Style Street': 'A beautifully restored stretch of old Chongqing with steep stone staircases, traditional courtyard homes, and authentic teahouses. Climb the \'18 Stairs\' that gave the street its name and discover a slower, older Chongqing.',
        'Yangtze River Cableway': 'The \'First Air Corridor over the Yangtze\' \u2014 a 1,166m cable car ride offering breathtaking aerial views of Chongqing\'s skyline. Once a commuter crossing, now a must-do experience. Best at sunset when the city lights up.',
        'Eling Park': 'The highest point on Chongqing\'s Yuzhong Peninsula offering 360-degree panoramic views of the city, two rivers, and surrounding mountains. The former British consulate grounds now host beautiful gardens and the iconic Liangjiang Pavilion.',
        'Huangguan Escalator': 'Asia\'s longest outdoor escalator at 112m \u2014 a 2.5-minute ride that perfectly illustrates Chongqing\'s verticality. What other city needs an escalator as public transit? Free entertainment watching tourists\' reactions.',
        'Chaotianmen': 'Where the Yangtze and Jialing rivers merge in a dramatic confluence \u2014 muddy yellow meets emerald green. The Raffles City complex towers above like a gateway to the sky. Historically the starting point of the Three Gorges journey.',
        'Chongqing Zoo': 'Home to the world\'s most successful giant panda breeding program outside Sichuan. See red pandas, golden snub-nosed monkeys, and South China tigers. Best visited in the morning when the pandas are most active.',
        'White House Hall': 'Also known as Baigongguan \u2014 a villa that became a notorious Nationalist prison during the Chinese Civil War. Along with Zhazidong, it forms the \'Two Prisons\' memorial site. A sobering look at revolutionary history.',
        'Zhazidong Prison': 'A former coal mine turned secret prison where over 300 political prisoners were held in horrific conditions. Now a memorial and museum \u2014 the escape tunnel and torture chambers remain preserved. Powerful and haunting.',
        'Great Hall of the People': 'Chongqing\'s most iconic building \u2014 a massive traditional Chinese structure resembling the Temple of Heaven in Beijing, completed in 1954. The surrounding People\'s Square is a gathering place for morning tai chi and evening dances.',
        'Nanshan Mountain': 'The green lung south of the Yangtze offering hiking trails, botanical gardens, and the best sunset views of Chongqing\'s skyline. The One Tree Viewing Platform is THE photo spot for the famous night panorama.',
        'Hotpot Experience': 'Chongqing is the birthplace of hotpot \u2014 a communal dining experience where you cook fresh ingredients in a bubbling cauldron of numbing-spicy Sichuan pepper broth. It\'s not just a meal, it\'s a social ritual. Not for the faint-hearted!',
        'Night Cruise': 'See Chongqing\'s cyberpunk skyline from the water \u2014 glittering towers, illuminated bridges, and Hongya Cave glowing like a golden pagoda. The Two Rivers Night Cruise covers both the Yangtze and Jialing. Pure magic.',
        'Ciyun Temple': 'An ancient Buddhist temple complex hidden in the Nanshan hills, dating back to the Tang Dynasty. Less touristy than city-center temples, with beautiful moss-covered stone paths and resident monks who might invite you for tea.'
    };

    var result = '';
    for (var k = 0; k < spotNames.length; k++) {
        var spotName = spotNames[k];
        var desc = '';
        // Try exact match first
        if (spotDB[spotName]) {
            desc = spotDB[spotName];
        } else {
            // Try partial match
            var searchName = spotName.toLowerCase();
            var found = false;
            var keys = Object.keys(spotDB);
            for (var m = 0; m < keys.length; m++) {
                if (searchName.indexOf(keys[m].toLowerCase()) > -1 || keys[m].toLowerCase().indexOf(searchName) > -1) {
                    desc = spotDB[keys[m]];
                    found = true;
                    break;
                }
            }
            if (!found) {
                desc = 'A highlight of this tour. [Ryan to add detailed description and personal tips]';
            }
        }

        result += '<div class="spot-card">';
        result += '<div class="spot-image-slot">';
        result += '<div class="media-slot-placeholder"><span class="placeholder-icon">\uD83D\uDCF7</span><span class="placeholder-text">' + escapeHtml(spotName) + '</span></div>';
        result += '</div>';
        result += '<div class="spot-info">';
        result += '<h4 class="spot-name">' + escapeHtml(spotName) + '</h4>';
        result += '<p class="spot-desc">' + escapeHtml(desc) + '</p>';
        result += '</div>';
        result += '</div>';
    }
    return result;
}

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
