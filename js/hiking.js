/**
 * hiking.js — Dynamic rendering for 50 wild hiking routes
 * Enhanced with multi-dimension filtering: difficulty, district, distance, elevation
 * Includes detail modal with "View Details" button → modal → "Book This Trail"
 * Loads data/hiking_wild_routes_50.json and renders trail cards
 */

(function() {
    'use strict';

    const DATA_PATH = 'data/hiking_wild_routes_50.json';
    const GRID_ID = 'hiking-trails-grid';
    const FILTER_BAR_ID = 'hiking-filters';
    const COUNT_ID = 'hiking-count';
    const LOAD_MORE_ID = 'hiking-load-more';
    const PAGE_SIZE = 12;

    let allRoutes = [];
    let filteredRoutes = [];
    let currentCount = 0;

    // Active filters
    let activeDifficulty = 'all';
    let activeDistrict = 'all';
    let activeDistance = 'all';
    let activeElevation = 'all';

    // Difficulty config
    const DIFFICULTY_MAP = {
        '\u2B50': { label: 'Easy', cls: 'easy', level: 1, stars: '\u2605\u2606\u2606\u2606\u2606', color: 'var(--difficulty-1)' },
        '\u2B50\u2B50': { label: 'Moderate', cls: 'moderate', level: 2, stars: '\u2605\u2605\u2606\u2606\u2606', color: 'var(--difficulty-2)' },
        '\u2B50\u2B50\u2B50': { label: 'Hard', cls: 'hard', level: 3, stars: '\u2605\u2605\u2605\u2606\u2606', color: 'var(--difficulty-3)' },
        '\u2B50\u2B50\u2B50\u2B50': { label: 'Expert', cls: 'expert', level: 4, stars: '\u2605\u2605\u2605\u2605\u2606', color: 'var(--difficulty-4)' },
        '\u2B50\u2B50\u2B50\u2B50\u2B50': { label: 'Extreme', cls: 'extreme', level: 5, stars: '\u2605\u2605\u2605\u2605\u2605', color: 'var(--difficulty-5)' }
    };

    // Distance ranges (km)
    const DISTANCE_RANGES = [
        { value: 'all', label: 'All Distances' },
        { value: '0-5', label: 'Under 5 km', min: 0, max: 5 },
        { value: '5-10', label: '5 - 10 km', min: 5, max: 10 },
        { value: '10-15', label: '10 - 15 km', min: 10, max: 15 },
        { value: '15+', label: '15+ km', min: 15, max: 9999 }
    ];

    // Elevation ranges (m)
    const ELEVATION_RANGES = [
        { value: 'all', label: 'All Elevations' },
        { value: '0-200', label: 'Under 200 m', min: 0, max: 200 },
        { value: '200-500', label: '200 - 500 m', min: 200, max: 500 },
        { value: '500-1000', label: '500 - 1000 m', min: 500, max: 1000 },
        { value: '1000+', label: '1000+ m', min: 1000, max: 99999 }
    ];

    // Trail detailed descriptions for modal (based on Douyin/2bulu research)
    var trailDetails = {
        1: { tips: 'Best visited in spring (March-May) when wildflowers bloom along the river. The hot springs are natural and undeveloped \u2014 bring a towel and swimsuit if you want to soak. The ancient postal relay station has stone carvings dating back to the Ming Dynasty. Pack lunch as there are no shops on the trail.', bestSeason: 'March - May', bestTime: 'Morning start recommended' },
        2: { tips: 'The 800-step staircase is the iconic feature \u2014 take it slow and enjoy the views. The karst peaks create natural frames for photography. Visit after rain for dramatic mist effects. The mountain stream at the base is perfect for cooling off. Local villagers sometimes sell fresh fruit along the trail.', bestSeason: 'April - October', bestTime: 'Early morning for mist' },
        3: { tips: 'The sandbar appears during dry season (November-March) and disappears in summer. The gorge walls create dramatic reflections in still water. Waterfalls are most impressive after rain. This is one of the easiest scenic trails in Chongqing \u2014 great for beginners and families.', bestSeason: 'November - March (dry season)', bestTime: 'Mid-morning for best light' },
        4: { tips: 'Jinfo Mountain is a UNESCO Biosphere Reserve. The sea of clouds appears most reliably at sunrise (5:30-7:00 AM). Wild rhododendrons bloom April-May. The alpine meadow at the summit feels like another world \u2014 completely different vegetation from the base. Bring warm layers even in summer.', bestSeason: 'April - June, September - November', bestTime: 'Overnight for sunrise' },
        5: { tips: 'Jinyun Mountain is the most accessible trail from downtown Chongqing \u2014 direct buses from Jiefangbei. Multiple trail options from easy strolls to challenging ridge walks. The ancient temple halfway up offers tea and rest. Popular with local trail runners on weekend mornings. Avoid national holidays when it gets crowded.', bestSeason: 'Year-round', bestTime: 'Weekday mornings' },
        6: { tips: 'The karst wetland is a unique ecosystem \u2014 limestone formations rising from wetland marshes. Wild watermelon fields in summer are a quirky surprise. The sea of flowers peaks in July-August with lotus and wild lilies. Boardwalks protect the wetland \u2014 stay on marked paths. Mosquito repellent essential.', bestSeason: 'June - September', bestTime: 'Morning (avoid midday heat)' },
        7: { tips: 'Nantian Lake at 1800m altitude offers cool escape from Chongqing summer heat. The alpine lake reflects surrounding peaks like a mirror on calm mornings. Grassland meadows stretch for kilometers \u2014 perfect for photography. Wind can be strong on exposed ridges. The drive from Chongqing takes about 3 hours.', bestSeason: 'June - September', bestTime: 'Sunrise or sunset' },
        8: { tips: 'Not for the faint of heart \u2014 the cliff walkways have sheer drops. The 4 giant natural bridges are among the largest in China. The night cave has bioluminescent fungi (seasonal). Track recorded on outdoor apps \u2014 download before going. Bring a headlamp for cave sections. Weather changes rapidly \u2014 check forecast.', bestSeason: 'March - May, September - November', bestTime: 'Start early, allow full day' },
        9: { tips: 'The waterfall trail follows a pristine stream through mixed forest. Wildflowers change with seasons \u2014 cherry blossoms in spring, maple colors in autumn. The water is clean enough to drink (after filtering). Swimming holes along the way for brave souls. Gentle elevation gain makes this pleasant rather than grueling.', bestSeason: 'March - May, October - November', bestTime: 'Any time of day' },
        10: { tips: 'Two routes: easy path through Stone City ruins, or challenging ridge to Tushan. Night city panorama from Tushan is one of the best in Chongqing. B-station has popular video guides \u2014 search "Nanshan Stone City hiking". The stone gates are Ming Dynasty military fortifications. Good for evening hikes ending with city lights.', bestSeason: 'Year-round', bestTime: 'Afternoon to sunset' },
        11: { tips: 'The plank road clings to sheer cliffs \u2014 thrilling but safe with handrails. Ancient banyan trees form natural arches over the trail. The "Eagle Nest" viewpoint requires a short detour but offers panoramic views of the Yangtze. Sea of clouds common in early morning. Less crowded than other Nanshan trails.', bestSeason: 'March - November', bestTime: 'Early morning for clouds' },
        12: { tips: 'Bamboo forest creates a natural cathedral \u2014 light filters through creating magical effects. 12 marked scenic points along the trail. Spring wildflowers and autumn foliage are peak seasons. The bamboo rustling in wind is meditative. Steep sections have rope assists. Bring gloves for rope sections.', bestSeason: 'April - May, October - November', bestTime: 'Morning for best light' },
        13: { tips: 'One of Chongqing\'s most beautiful forest parks \u2014 often called "Little Jiuzhaigou". Primitive forests with trees over 100 years old. Multiple waterfalls and cliff formations. Stream trekking sections \u2014 shoes will get wet. The drive from Chongqing takes 2.5-3 hours. Plan as a full-day trip.', bestSeason: 'May - October', bestTime: 'Start early from Chongqing' },
        14: { tips: 'The Small Sky Pillar is a dramatic karst pinnacle rising from the Wu River valley. Gongtan Ancient Town at the trailhead is worth exploring \u2014 1,700 years of history. The trail is short but scenic. Combine with a visit to Youyang Peach Blossom Spring nearby. Tujia minority culture adds unique flavor.', bestSeason: 'March - November', bestTime: 'Morning' },
        15: { tips: 'A refreshing escape from city heat \u2014 5\u00b0C cooler than downtown. Mountain meadows with wildflowers in spring. The forest park has well-maintained trails and rest areas. Good for trail running. The village at the base serves simple but delicious farm food. Weekend getaway from Chongqing (1 hour drive).', bestSeason: 'May - September', bestTime: 'Early morning for cool air' },
        16: { tips: 'The bamboo forest here is older and denser than Nanshan \u2014 truly immersive. Ancient stone paths wind through the bamboo with moss-covered steps. Rare waterfalls after rain. Challenging terrain with steep ascents \u2014 not for beginners. The circular route takes 4-5 hours at moderate pace.', bestSeason: 'March - November', bestTime: 'Morning start' },
        17: { tips: 'A 9km loop that showcases Nanshan\'s diversity \u2014 streams, ruins, stone formations, and viewpoints. The mountain village ruins tell stories of old Chongqing. Wild streams are clean and refreshing. Stone formations have imaginative names from local folklore. Good training hike for harder trails.', bestSeason: 'Year-round', bestTime: 'Morning' },
        18: { tips: 'The M-position route hits 9 peaks with 1050m total elevation gain \u2014 a serious workout. Sea of clouds is the reward at multiple peaks. Alpine meadow sections between peaks offer rest. Not recommended in rain or fog \u2014 trails become slippery and views disappear. Bring at least 2L water and energy food.', bestSeason: 'April - June, September - November', bestTime: 'Very early start (before dawn)' },
        19: { tips: 'Simianshan means "Four Face Mountain" \u2014 dramatic cliffs on all sides. Primitive forest with trees over 500 years old. Very few visitors \u2014 you may have the trail entirely to yourself. The drive is long (3+ hours) but the solitude is worth it. Waterfalls are spectacular after rain. Pack everything you need \u2014 no services.', bestSeason: 'May - October', bestTime: 'Full day trip' },
        20: { tips: 'The original Chongqing hiking trail \u2014 where local hiking culture was born. Ancient stone paths through dramatic canyon scenery. The canyon narrows to just a few meters wide in places. Multiple viewpoints of the Jialing River valley. Challenging but rewarding. History meets nature.', bestSeason: 'March - May, September - November', bestTime: 'Morning' },
    };

    // Provide default details for routes 21-50
    function getTrailDetails(no) {
        if (trailDetails[no]) return trailDetails[no];
        return {
            tips: 'This trail offers authentic wilderness hiking in Chongqing\'s stunning karst landscape. Bring proper hiking gear, sufficient water (1L+), and snacks. Weather can change rapidly in the mountains \u2014 pack a rain shell. Mobile signal is generally good but may be weak in deep valleys. The trail is pre-scouted and conditions are checked before each trip.',
            bestSeason: 'March - November',
            bestTime: 'Morning start recommended'
        };
    }

    function getDiffConfig(diff) {
        return DIFFICULTY_MAP[diff] || { label: diff, cls: 'easy', level: 1, stars: '\u2605\u2606\u2606\u2606\u2606', color: 'var(--difficulty-1)' };
    }

    function parseDistance(distStr) {
        var num = parseFloat((distStr || '').replace(/km/i, ''));
        return isNaN(num) ? 0 : num;
    }

    function parseElevation(elevStr) {
        var num = parseFloat((elevStr || '').replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num;
    }

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ====== MODAL ======
    function setupHikingModal() {
        if (document.getElementById('hikingDetailModal')) return;
        var modal = document.createElement('div');
        modal.id = 'hikingDetailModal';
        modal.className = 'hiking-modal-overlay';
        var inner = document.createElement('div');
        inner.className = 'hiking-modal';
        var closeBtn = document.createElement('button');
        closeBtn.className = 'hiking-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = function() { closeHikingDetail(); };
        var contentDiv = document.createElement('div');
        contentDiv.id = 'hikingModalContent';
        inner.appendChild(closeBtn);
        inner.appendChild(contentDiv);
        modal.appendChild(inner);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeHikingDetail();
        });
        document.body.appendChild(modal);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeHikingDetail();
        });
    }

    function showHikingDetail(route) {
        if (!route) return;
        setupHikingModal();

        var diff = getDiffConfig(route.difficulty);
        var details = getTrailDetails(route.no);
        var imgPath = 'images/hiking/' + (route.slug || '') + '.webp';
        var priceDisplay = route.priceSuggestion || 'Contact Us';

        var html = '';

        // Hero
        html += '<div class="hiking-modal-hero">';
        html += '<img src="' + imgPath + '" alt="' + escapeHtml(route.name) + '" onerror="this.parentElement.innerHTML=\'<div class=no-image-placeholder>\u{1F3D4}\uFE0F</div>\'" />';
        html += '<span class="hiking-diff-badge difficulty-badge-' + diff.level + '" style="position:absolute;top:16px;left:16px;z-index:3;padding:6px 14px;font-size:0.85rem;">' + diff.label + '</span>';
        html += '</div>';

        // Body
        html += '<div class="hiking-modal-body">';

        // Title
        html += '<h2 class="hiking-modal-title">' + escapeHtml(route.name) + '</h2>';
        html += '<p class="hiking-modal-namecn">' + escapeHtml(route.nameCN) + '</p>';

        // Stats Row
        html += '<div class="hiking-modal-stats-row">';
        html += '<div class="hiking-modal-stat"><span class="stat-value">' + escapeHtml(route.duration) + '</span><span class="stat-label">Duration</span></div>';
        html += '<div class="hiking-modal-stat"><span class="stat-value">' + escapeHtml(route.distance) + '</span><span class="stat-label">Distance</span></div>';
        html += '<div class="hiking-modal-stat"><span class="stat-value">+' + escapeHtml(route.elevation) + '</span><span class="stat-label">Elevation</span></div>';
        html += '<div class="hiking-modal-stat"><span class="stat-value">' + escapeHtml(route.scenery) + '</span><span class="stat-label">Scenery</span></div>';
        html += '<div class="hiking-modal-stat"><span class="stat-value">' + priceDisplay + '</span><span class="stat-label">Per Person</span></div>';
        html += '</div>';

        // Highlights
        html += '<div class="hiking-modal-section">';
        html += '<h3 class="hiking-modal-section-title">\u{1F3AF} TRAIL HIGHLIGHTS</h3>';
        html += '<p class="hiking-modal-highlights">' + escapeHtml(route.highlights) + '</p>';
        html += '</div>';

        // Practical Tips
        html += '<div class="hiking-modal-section">';
        html += '<h3 class="hiking-modal-section-title">\u{1F4CC} PRACTICAL TIPS</h3>';
        html += '<ul class="hiking-modal-tips">';
        var tipParts = details.tips.split('. ');
        for (var i = 0; i < tipParts.length; i++) {
            var tip = tipParts[i].trim();
            if (tip) html += '<li>' + escapeHtml(tip) + '</li>';
        }
        html += '</ul>';
        html += '</div>';

        // Best Season & Time
        html += '<div class="hiking-modal-section">';
        html += '<h3 class="hiking-modal-section-title">\u{1F4C5} WHEN TO GO</h3>';
        html += '<div class="hiking-modal-stats-row" style="gap:12px;">';
        html += '<div class="hiking-modal-stat" style="flex:1;"><span class="stat-value">' + escapeHtml(details.bestSeason) + '</span><span class="stat-label">Best Season</span></div>';
        html += '<div class="hiking-modal-stat" style="flex:1;"><span class="stat-value">' + escapeHtml(details.bestTime) + '</span><span class="stat-label">Best Time</span></div>';
        html += '</div>';
        html += '</div>';

        // District info
        html += '<div class="hiking-modal-section">';
        html += '<h3 class="hiking-modal-section-title">\u{1F4CD} LOCATION</h3>';
        html += '<p class="hiking-modal-highlights">' + escapeHtml(route.district) + ' District, Chongqing</p>';
        html += '</div>';

        // CTA
        html += '<div class="hiking-modal-cta">';
        html += '<a href="contact.html?tour=' + encodeURIComponent(route.name) + '" class="btn-book-trail">Book This Trail</a>';
        html += '<a href="https://wa.me/8615696078461?text=Hi%20Ryan!%20I%27m%20interested%20in%20hiking:%20' + encodeURIComponent(route.name) + '" class="btn-whatsapp" target="_blank" rel="noopener">WhatsApp Ryan</a>';
        html += '</div>';

        html += '</div>'; // .hiking-modal-body

        var modal = document.getElementById('hikingDetailModal');
        var content = document.getElementById('hikingModalContent');
        if (modal && content) {
            content.innerHTML = html;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            var mbox = modal.querySelector('.hiking-modal');
            if (mbox) mbox.scrollTop = 0;
        }
    }

    function closeHikingDetail() {
        var modal = document.getElementById('hikingDetailModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function renderFilterBar() {
        var bar = document.getElementById(FILTER_BAR_ID);
        if (!bar) return;

        // Count by difficulty
        var diffCounts = { all: allRoutes.length };
        allRoutes.forEach(function(r) {
            diffCounts[r.difficulty] = (diffCounts[r.difficulty] || 0) + 1;
        });

        // Get unique districts
        var districts = [];
        var districtSeen = {};
        allRoutes.forEach(function(r) {
            var d = r.district;
            if (d && !districtSeen[d]) {
                districtSeen[d] = true;
                districts.push(d);
            }
        });
        districts.sort();

        // District counts
        var districtCounts = {};
        allRoutes.forEach(function(r) {
            districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
        });

        // Build HTML
        var html = '';

        // --- Difficulty Section ---
        html += '<div class="hiking-filter-section">';
        html += '<div class="hiking-filter-section-title">Difficulty Level</div>';
        html += '<div class="hiking-filter-row">';
        html += '<button class="hiking-filter-btn active" data-diff="all">All <span class="filter-count">' + diffCounts.all + '</span></button>';
        Object.keys(DIFFICULTY_MAP).forEach(function(diff) {
            if (diffCounts[diff]) {
                var cfg = DIFFICULTY_MAP[diff];
                html += '<button class="hiking-filter-btn" data-diff-raw="' + diff.replace(/\u2B50/g, '') + '" data-diff-raw-val="' + diff + '">' + cfg.label + ' <span class="filter-count">' + diffCounts[diff] + '</span></button>';
            }
        });
        html += '</div></div>';

        // --- District Section ---
        html += '<div class="hiking-filter-section">';
        html += '<div class="hiking-filter-section-title">District / Area</div>';
        html += '<div class="hiking-filter-row">';
        html += '<button class="hiking-district-btn active" data-district="all">All Areas</button>';
        districts.forEach(function(d) {
            html += '<button class="hiking-district-btn" data-district="' + d + '">' + d + ' <span class="filter-count" style="opacity:0.6;font-size:0.7rem;">(' + (districtCounts[d] || 0) + ')</span></button>';
        });
        html += '</div></div>';

        // --- Distance & Elevation Dropdowns ---
        html += '<div class="hiking-filter-section">';
        html += '<div class="hiking-filter-section-title">Distance &amp; Elevation</div>';
        html += '<div class="hiking-range-filter">';
        html += '<label>Distance:</label>';
        html += '<select id="hiking-distance-filter">';
        DISTANCE_RANGES.forEach(function(r) {
            html += '<option value="' + r.value + '">' + r.label + '</option>';
        });
        html += '</select>';
        html += '<label>Elevation:</label>';
        html += '<select id="hiking-elevation-filter">';
        ELEVATION_RANGES.forEach(function(r) {
            html += '<option value="' + r.value + '">' + r.label + '</option>';
        });
        html += '</select>';
        html += '<button class="hiking-reset-btn" id="hiking-reset-filters">Reset All</button>';
        html += '</div></div>';

        bar.innerHTML = html;

        // --- Bind Difficulty Buttons ---
        bar.querySelectorAll('.hiking-filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                bar.querySelectorAll('.hiking-filter-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                var rawVal = this.getAttribute('data-diff-raw-val');
                activeDifficulty = rawVal || 'all';
                applyFilters();
            });
        });

        // --- Bind District Buttons ---
        bar.querySelectorAll('.hiking-district-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                bar.querySelectorAll('.hiking-district-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                activeDistrict = this.getAttribute('data-district') || 'all';
                applyFilters();
            });
        });

        // --- Bind Distance Dropdown ---
        var distSelect = document.getElementById('hiking-distance-filter');
        if (distSelect) {
            distSelect.addEventListener('change', function() {
                activeDistance = this.value;
                applyFilters();
            });
        }

        // --- Bind Elevation Dropdown ---
        var elevSelect = document.getElementById('hiking-elevation-filter');
        if (elevSelect) {
            elevSelect.addEventListener('change', function() {
                activeElevation = this.value;
                applyFilters();
            });
        }

        // --- Bind Reset Button ---
        var resetBtn = document.getElementById('hiking-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                activeDifficulty = 'all';
                activeDistrict = 'all';
                activeDistance = 'all';
                activeElevation = 'all';
                bar.querySelectorAll('.hiking-filter-btn').forEach(function(b) { b.classList.remove('active'); });
                bar.querySelector('.hiking-filter-btn[data-diff="all"]').classList.add('active');
                bar.querySelectorAll('.hiking-district-btn').forEach(function(b) { b.classList.remove('active'); });
                bar.querySelector('.hiking-district-btn[data-district="all"]').classList.add('active');
                if (distSelect) distSelect.value = 'all';
                if (elevSelect) elevSelect.value = 'all';
                applyFilters();
            });
        }
    }

    function applyFilters() {
        filteredRoutes = allRoutes.filter(function(r) {
            if (activeDifficulty !== 'all' && r.difficulty !== activeDifficulty) return false;
            if (activeDistrict !== 'all' && r.district !== activeDistrict) return false;
            if (activeDistance !== 'all') {
                var range = DISTANCE_RANGES.find(function(d) { return d.value === activeDistance; });
                if (range) {
                    var dist = parseDistance(r.distance);
                    if (dist < range.min || dist > range.max) return false;
                }
            }
            if (activeElevation !== 'all') {
                var range2 = ELEVATION_RANGES.find(function(e) { return e.value === activeElevation; });
                if (range2) {
                    var elev = parseElevation(r.elevation);
                    if (elev < range2.min || elev > range2.max) return false;
                }
            }
            return true;
        });

        currentCount = 0;
        var grid = document.getElementById(GRID_ID);
        if (grid) grid.innerHTML = '';
        renderMore();
        updateCount();
        updateLoadMore();
    }

    function updateCount() {
        var el = document.getElementById(COUNT_ID);
        if (el) el.textContent = filteredRoutes.length + ' trail' + (filteredRoutes.length !== 1 ? 's' : '');
    }

    function updateLoadMore() {
        var btn = document.getElementById(LOAD_MORE_ID);
        if (!btn) return;
        if (currentCount >= filteredRoutes.length) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
            btn.textContent = 'Load More (' + (filteredRoutes.length - currentCount) + ' remaining)';
        }
    }

    function renderMore() {
        var grid = document.getElementById(GRID_ID);
        if (!grid) return;

        var end = Math.min(currentCount + PAGE_SIZE, filteredRoutes.length);
        var fragment = document.createDocumentFragment();

        for (var i = currentCount; i < end; i++) {
            var route = filteredRoutes[i];
            var card = createTrailCard(route);
            fragment.appendChild(card);
        }

        grid.appendChild(fragment);
        currentCount = end;
        updateLoadMore();
    }

    function createTrailCard(route) {
        var diff = getDiffConfig(route.difficulty);
        var card = document.createElement('div');
        card.className = 'hiking-trail-card ' + diff.cls;
        card.setAttribute('data-difficulty', route.difficulty);
        card.setAttribute('data-district', route.district || '');

        var imgPath = 'images/hiking/' + (route.slug || '') + '.webp';
        var priceDisplay = route.priceSuggestion || 'Contact Us';

        card.innerHTML =
            '<div class="hiking-card-image no-image" data-img-path="' + imgPath + '">' +
                '<span class="hiking-diff-badge difficulty-badge-' + diff.level + '" style="position:absolute;top:12px;left:12px;z-index:3;">' + diff.label + '</span>' +
                '<span style="position:absolute;top:12px;right:12px;z-index:3;font-size:0.7rem;color:rgba(255,255,255,0.7);background:rgba(0,0,0,0.4);padding:2px 8px;border-radius:10px;">' + escapeHtml(route.district) + '</span>' +
            '</div>' +
            '<div class="hiking-card-body">' +
                '<h3 class="hiking-card-name">' + escapeHtml(route.name) + '</h3>' +
                '<div class="hiking-card-stats">' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">' + escapeHtml(route.duration) + '</span><span class="hiking-stat-label">Duration</span></div>' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">' + escapeHtml(route.distance) + '</span><span class="hiking-stat-label">Distance</span></div>' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">+' + escapeHtml(route.elevation) + '</span><span class="hiking-stat-label">Elevation</span></div>' +
                '</div>' +
                '<p class="hiking-card-highlights">' + escapeHtml(route.highlights) + '</p>' +
            '</div>' +
            '<div class="hiking-card-footer">' +
                '<div class="hiking-card-price"><span class="hiking-price-value">' + escapeHtml(priceDisplay) + '</span><span class="hiking-price-per">per person</span></div>' +
                '<button class="hiking-book-btn hiking-view-detail-btn" data-route-no="' + route.no + '">View Details</button>' +
            '</div>';

        // Try to load the image
        var imgContainer = card.querySelector('.hiking-card-image');
        if (imgContainer && route.slug) {
            var img = new Image();
            img.onload = function() {
                imgContainer.classList.remove('no-image');
                imgContainer.innerHTML =
                    '<span class="hiking-diff-badge difficulty-badge-' + diff.level + '" style="position:absolute;top:12px;left:12px;z-index:3;">' + diff.label + '</span>' +
                    '<span style="position:absolute;top:12px;right:12px;z-index:3;font-size:0.7rem;color:rgba(255,255,255,0.7);background:rgba(0,0,0,0.4);padding:2px 8px;border-radius:10px;">' + escapeHtml(route.district) + '</span>' +
                    '<img src="' + imgPath + '" alt="' + escapeHtml(route.name) + '" loading="lazy" />';
            };
            img.onerror = function() { };
            img.src = imgPath;
        }

        // Bind View Details button
        var viewBtn = card.querySelector('.hiking-view-detail-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showHikingDetail(route);
            });
        }

        return card;
    }

    // Init
    function init() {
        var grid = document.getElementById(GRID_ID);
        if (!grid) return;

        grid.innerHTML = '<div class="hiking-loading">Loading trails...</div>';

        fetch(DATA_PATH)
            .then(function(res) {
                if (!res.ok) throw new Error('Failed to load hiking data');
                return res.json();
            })
            .then(function(data) {
                allRoutes = data;
                filteredRoutes = allRoutes.slice();
                renderFilterBar();
                grid.innerHTML = '';
                renderMore();
                updateCount();
            })
            .catch(function(err) {
                grid.innerHTML = '<div class="hiking-error">Unable to load trail data. Please refresh the page.</div>';
            });

        var loadMoreBtn = document.getElementById(LOAD_MORE_ID);
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                renderMore();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
