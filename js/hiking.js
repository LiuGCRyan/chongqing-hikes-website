/**
 * hiking.js — Dynamic rendering for 50 wild hiking routes
 * Enhanced with multi-dimension filtering: difficulty, district, distance, elevation
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
                // Reset UI
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
            // Difficulty filter
            if (activeDifficulty !== 'all' && r.difficulty !== activeDifficulty) return false;

            // District filter
            if (activeDistrict !== 'all' && r.district !== activeDistrict) return false;

            // Distance filter
            if (activeDistance !== 'all') {
                var range = DISTANCE_RANGES.find(function(d) { return d.value === activeDistance; });
                if (range) {
                    var dist = parseDistance(r.distance);
                    if (dist < range.min || dist > range.max) return false;
                }
            }

            // Elevation filter
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

        // Image slot with placeholder
        var imageHtml = '<div class="hiking-card-image no-image">' +
            '<div class="hiking-card-image no-image">' +
            '</div>' +
        '</div>';

        // Check if we have a slug-based image path
        var imgPath = 'images/hiking/' + (route.slug || '') + '.webp';

        card.innerHTML =
            '<div class="hiking-card-image no-image" data-img-path="' + imgPath + '">' +
                '<span class="hiking-diff-badge difficulty-badge-' + diff.level + '" style="position:absolute;top:12px;left:12px;z-index:3;">' +
                    diff.label +
                '</span>' +
                '<span style="position:absolute;top:12px;right:12px;z-index:3;font-size:0.7rem;color:rgba(255,255,255,0.7);background:rgba(0,0,0,0.4);padding:2px 8px;border-radius:10px;">' + route.district + '</span>' +
            '</div>' +
            '<div class="hiking-card-body">' +
                '<h3 class="hiking-card-name">' + escapeHtml(route.name) + '</h3>' +
                '<p class="hiking-card-namecn">' + escapeHtml(route.nameCN) + '</p>' +
                '<div class="hiking-card-stats">' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">' + escapeHtml(route.duration) + '</span><span class="hiking-stat-label">Duration</span></div>' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">' + escapeHtml(route.distance) + '</span><span class="hiking-stat-label">Distance</span></div>' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">+' + escapeHtml(route.elevation) + '</span><span class="hiking-stat-label">Elevation</span></div>' +
                '</div>' +
                '<p class="hiking-card-highlights">' + escapeHtml(route.highlights) + '</p>' +
            '</div>' +
            '<div class="hiking-card-footer">' +
                '<div class="hiking-card-price"><span class="hiking-price-value">' + escapeHtml(route.priceSuggestion) + '</span><span class="hiking-price-per">per person</span></div>' +
                '<a href="contact.html?tour=' + encodeURIComponent(route.name) + '" class="hiking-book-btn">Book This Trail</a>' +
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
                    '<img src="' + imgPath + '" alt="' + escapeHtml(route.name) + '" loading="lazy" />' +
                    '<div class="image-caption">' + escapeHtml(route.nameCN) + '</div>';
            };
            img.onerror = function() {
                // Keep placeholder
            };
            img.src = imgPath;
        }

        return card;
    }

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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
