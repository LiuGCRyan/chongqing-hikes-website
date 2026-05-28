/**
 * hiking.js — Dynamic rendering for 50 wild hiking routes
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
    let activeDifficulty = 'all';

    // Difficulty config
    const DIFFICULTY_MAP = {
        '⭐': { label: 'Easy', cls: 'easy', level: 1, stars: '★☆☆☆☆', color: 'var(--difficulty-1)' },
        '⭐⭐': { label: 'Moderate', cls: 'moderate', level: 2, stars: '★★☆☆☆', color: 'var(--difficulty-2)' },
        '⭐⭐⭐': { label: 'Hard', cls: 'hard', level: 3, stars: '★★★☆☆', color: 'var(--difficulty-3)' },
        '⭐⭐⭐⭐': { label: 'Expert', cls: 'expert', level: 4, stars: '★★★★☆', color: 'var(--difficulty-4)' },
        '⭐⭐⭐⭐⭐': { label: 'Extreme', cls: 'extreme', level: 5, stars: '★★★★★', color: 'var(--difficulty-5)' }
    };

    function getDiffConfig(diff) {
        return DIFFICULTY_MAP[diff] || { label: diff, cls: 'easy', level: 1, stars: '★☆☆☆☆', color: 'var(--difficulty-1)' };
    }

    function renderFilterBar() {
        const bar = document.getElementById(FILTER_BAR_ID);
        if (!bar) return;

        const counts = { all: allRoutes.length };
        allRoutes.forEach(r => {
            counts[r.difficulty] = (counts[r.difficulty] || 0) + 1;
        });

        let html = '<button class="hiking-filter-btn active" data-diff="all">All <span class="filter-count">' + counts.all + '</span></button>';
        Object.keys(DIFFICULTY_MAP).forEach(diff => {
            if (counts[diff]) {
                const cfg = DIFFICULTY_MAP[diff];
                html += '<button class="hiking-filter-btn" data-diff="' + diff.replace(/⭐/g, '') + '" data-diff-raw="' + diff + '">' + cfg.label + ' <span class="filter-count">' + counts[diff] + '</span></button>';
            }
        });

        bar.innerHTML = html;

        bar.querySelectorAll('.hiking-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                bar.querySelectorAll('.hiking-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const rawDiff = this.getAttribute('data-diff-raw') || 'all';
                activeDifficulty = rawDiff;
                applyFilters();
            });
        });
    }

    function applyFilters() {
        if (activeDifficulty === 'all') {
            filteredRoutes = [...allRoutes];
        } else {
            filteredRoutes = allRoutes.filter(r => r.difficulty === activeDifficulty);
        }
        currentCount = 0;
        const grid = document.getElementById(GRID_ID);
        if (grid) grid.innerHTML = '';
        renderMore();
        updateCount();
        updateLoadMore();
    }

    function updateCount() {
        const el = document.getElementById(COUNT_ID);
        if (el) el.textContent = filteredRoutes.length + ' trail' + (filteredRoutes.length !== 1 ? 's' : '');
    }

    function updateLoadMore() {
        const btn = document.getElementById(LOAD_MORE_ID);
        if (!btn) return;
        if (currentCount >= filteredRoutes.length) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
            btn.textContent = 'Load More (' + (filteredRoutes.length - currentCount) + ' remaining)';
        }
    }

    function renderMore() {
        const grid = document.getElementById(GRID_ID);
        if (!grid) return;

        const end = Math.min(currentCount + PAGE_SIZE, filteredRoutes.length);
        const fragment = document.createDocumentFragment();

        for (let i = currentCount; i < end; i++) {
            const route = filteredRoutes[i];
            const card = createTrailCard(route);
            fragment.appendChild(card);
        }

        grid.appendChild(fragment);
        currentCount = end;
        updateLoadMore();
    }

    function createTrailCard(route) {
        const diff = getDiffConfig(route.difficulty);
        const card = document.createElement('div');
        card.className = 'hiking-trail-card ' + diff.cls;
        card.setAttribute('data-difficulty', route.difficulty);

        // Parse distance for display
        const distNum = route.distance.replace(/km/i, '');
        const elevNum = route.elevation.replace(/[^\d]/g, '');

        card.innerHTML =
            '<div class="hiking-card-header">' +
                '<span class="hiking-diff-badge difficulty-badge-' + diff.level + '">' +
                    diff.label +
                '</span>' +
                '<span class="hiking-card-district">' + route.district + '</span>' +
            '</div>' +
            '<div class="hiking-card-body">' +
                '<h3 class="hiking-card-name">' + route.name + '</h3>' +
                '<p class="hiking-card-namecn">' + route.nameCN + '</p>' +
                '<div class="hiking-card-stats">' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">' + route.duration + '</span><span class="hiking-stat-label">Duration</span></div>' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">' + route.distance + '</span><span class="hiking-stat-label">Distance</span></div>' +
                    '<div class="hiking-stat"><span class="hiking-stat-value">+' + route.elevation + '</span><span class="hiking-stat-label">Elevation</span></div>' +
                '</div>' +
                '<p class="hiking-card-highlights">' + route.highlights + '</p>' +
            '</div>' +
            '<div class="hiking-card-footer">' +
                '<div class="hiking-card-price"><span class="hiking-price-value">' + route.priceSuggestion + '</span><span class="hiking-price-per">per person</span></div>' +
                '<a href="contact.html?tour=' + encodeURIComponent(route.name) + '" class="hiking-book-btn">Book This Trail</a>' +
            '</div>';

        return card;
    }

    // Init
    function init() {
        const grid = document.getElementById(GRID_ID);
        if (!grid) return;

        // Show loading skeleton
        grid.innerHTML = '<div class="hiking-loading">Loading trails...</div>';

        fetch(DATA_PATH)
            .then(function(res) {
                if (!res.ok) throw new Error('Failed to load hiking data');
                return res.json();
            })
            .then(function(data) {
                allRoutes = data;
                filteredRoutes = [...allRoutes];
                renderFilterBar();
                grid.innerHTML = '';
                renderMore();
                updateCount();
            })
            .catch(function(err) {
                grid.innerHTML = '<div class="hiking-error">Unable to load trail data. Please refresh the page.</div>';
                console.error('Hiking data load error:', err);
            });

        // Load more button
        var loadMoreBtn = document.getElementById(LOAD_MORE_ID);
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                renderMore();
            });
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
