// routes.js - Load and display routes for city-tours.html and hiking.html
// Matches HTML element IDs: searchInput, typeFilter, sortFilter, loadMoreBtn, routesGrid

let allRoutes = [];
let filteredRoutes = [];
let displayCount = 0;
const ROUTES_PER_PAGE = 20;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRoutes();
    setupFilters();
    setupModal();
});

// Load routes from JSON
async function loadRoutes() {
    try {
        const response = await fetch('data/routes.json');
        allRoutes = await response.json();
        console.log(`✅ Loaded ${allRoutes.length} routes`);
        applyFilters();
    } catch (error) {
        console.error('❌ Error loading routes:', error);
        const grid = document.getElementById('routesGrid');
        if (grid) {
            grid.innerHTML = '<p class="error">Error loading tours. Please try again later.</p>';
        }
    }
}

// Setup filter event listeners - FIXED: use correct IDs from HTML
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');      // FIXED: was durationFilter
    const sortFilter = document.getElementById('sortFilter');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => applyFilters(), 300));
    }

    if (typeFilter) {                                            // FIXED: was durationFilter
        typeFilter.addEventListener('change', () => applyFilters());
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => applyFilters());
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => loadMore());
    }
}

// Setup modal overlay for route details
function setupModal() {
    // Create modal container once
    const modal = document.createElement('div');
    modal.id = 'routeDetailModal';
    modal.className = 'route-modal-overlay';
    modal.innerHTML = `
        <div class="route-modal">
            <button class="modal-close" onclick="closeRouteDetail()">&times;</button>
            <div id="modalContent" class="modal-content"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeRouteDetail();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeRouteDetail();
    });
}

// Apply all filters and re-render
function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const type = document.getElementById('typeFilter')?.value || '';       // FIXED: was durationFilter
    const sort = document.getElementById('sortFilter')?.value || 'default';

    // Filter
    filteredRoutes = allRoutes.filter(route => {
        // Search filter
        if (search) {
            const name = (route['线路名称'] || '').toLowerCase();
            const subtitle = (route['副标题'] || '').toLowerCase();
            const highlights = (route['路线亮点（外国人关注）'] || '').toLowerCase();
            if (!name.includes(search) && !subtitle.includes(search) && !highlights.includes(search)) {
                return false;
            }
        }

        // Type filter (FIXED: filter by tour type, not duration)
        if (type) {
            const routeType = route['类型'] || '';
            if (!routeType.includes(type)) return false;
        }

        return true;
    });

    // Sort
    if (sort === 'price-asc') {
        filteredRoutes.sort((a, b) => (a['你的价格'] || 0) - (b['你的价格'] || 0));
    } else if (sort === 'price-desc') {
        filteredRoutes.sort((a, b) => (b['你的价格'] || 0) - (a['你的价格'] || 0));
    } else if (sort === 'rating-desc') {
        filteredRoutes.sort((a, b) => (b['评分'] || 0) - (a['评分'] || 0));
    }

    console.log(`🔍 Filtered: ${filteredRoutes.length} / ${allRoutes.length}`);

    // Reset and render
    displayCount = 0;
    const grid = document.getElementById('routesGrid');
    if (grid) grid.innerHTML = '';
    loadMore();
}

// Load more routes (pagination)
function loadMore() {
    const grid = document.getElementById('routesGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!grid) return;

    const start = displayCount;
    const end = Math.min(start + ROUTES_PER_PAGE, filteredRoutes.length);

    // Create cards HTML
    const fragment = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
        const card = createRouteCardElement(filteredRoutes[i]);
        fragment.appendChild(card);
    }

    grid.appendChild(fragment);

    // Update display count
    displayCount = end;

    // Show/hide Load More button
    if (loadMoreBtn) {
        if (displayCount >= filteredRoutes.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.textContent = `Load More (${filteredRoutes.length - displayCount} remaining)`;
        }
    }
}

// Create a DOM element for a route card (NO IMAGE - clean typography layout)
function createRouteCardElement(route) {
    const id = route['产品ID'] || '';
    const name = route['线路名称'] || 'Untitled Tour';
    const subtitle = route['副标题'] || '';
    const type = route['类型'] || '';
    const price = route['你的价格'] || 0;
    const oldPrice = route['携程价格'] || 0;
    const score = route['评分'] || 0;
    const highlights = route['路线亮点（外国人关注）'] || '';
    const tags = route['标签'] || '';
    const duration = extractDays(name);

    // Extract first highlight
    const firstHighlight = highlights.split('|')[0]?.trim() || '';

    // Format price
    const priceDisplay = price > 0 ? `¥${price}` : 'Contact Us';
    const oldPriceDisplay = (oldPrice > 0 && oldPrice !== price) ? `<span class="old-price">¥${oldPrice}</span>` : '';

    // Calculate discount
    const discount = (oldPrice > 0 && price > 0 && oldPrice > price) ? Math.round((1 - price / oldPrice) * 100) : 0;

    // Build tag badges
    const tagList = tags.split(',').filter(t => t.trim()).slice(0, 3);
    const tagBadges = tagList.map(t => `<span class="tag-badge">${t.trim()}</span>`).join('');

    // Create card element
    const card = document.createElement('div');
    card.className = 'route-card';
    card.setAttribute('data-id', id);
    card.style.cursor = 'pointer';

    card.innerHTML = `
        <div class="route-content">
            <div class="route-header">
                <h3 class="route-name">${name}</h3>
                ${type ? `<span class="route-type-badge">${type}</span>` : ''}
            </div>
            ${subtitle ? `<p class="route-subtitle">${subtitle}</p>` : ''}
            <div class="route-meta">
                ${duration > 0 ? `<span class="route-duration">⏱️ ${duration} Day${duration > 1 ? 's' : ''}</span>` : ''}
                ${score > 0 ? `<span class="route-rating">⭐ ${score}</span>` : ''}
            </div>
            ${firstHighlight ? `<p class="route-highlight">${firstHighlight}</p>` : ''}
            ${tagBadges ? `<div class="route-tags">${tagBadges}</div>` : ''}
            <div class="route-footer">
                <div class="route-pricing">
                    ${oldPriceDisplay}
                    <span class="current-price">${priceDisplay}</span>
                    ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                </div>
                <span class="btn-view">View Details →</span>
            </div>
        </div>
    `;

    // Click to open detail modal
    card.style.cssText = 'cursor:pointer !important; pointer-events:auto !important; position:relative; z-index:1;';
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🔘 Card clicked:', name);
        showRouteDetail(route);
    });

    return card;
}

// Show route detail in a rich modal overlay
function showRouteDetail(route) {
    const name = route['线路名称'] || '';
    const subtitle = route['副标题'] || '';
    const type = route['类型'] || '';
    const price = route['你的价格'] || 0;
    const oldPrice = route['携程价格'] || 0;
    const score = route['评分'] || 0;
    const highlights = route['路线亮点（外国人关注）'] || '';
    const review = route['你的专业评价'] || '';
    const tags = route['标签'] || '';
    const imgUrl = route['图片URL'] || '';
    const duration = extractDays(name);

    const priceDisplay = price > 0 ? `¥${price}` : 'Contact Us';
    const oldPriceDisplay = oldPrice > 0 ? `¥${oldPrice}` : '';
    const discount = (oldPrice > 0 && price > 0 && oldPrice > price) ? Math.round((1 - price / oldPrice) * 100) : 0;

    // Parse highlights into list
    const highlightItems = highlights.split('|')
        .map(h => h.trim())
        .filter(h => h)
        .map(h => `<li><span class="check-icon">✦</span> ${h}</li>`)
        .join('');

    // Parse tags
    const tagItems = tags.split(',')
        .map(t => t.trim())
        .filter(t => t)
        .map(t => `<span class="modal-tag">${t}</span>`)
        .join('');

    // Generate itinerary suggestions based on keywords
    const itineraryHTML = generateItinerary(name, subtitle, duration);

    // Build what's included based on type
    const includedItems = generateIncludes(type, duration);

    const modal = document.getElementById('routeDetailModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <div class="modal-hero">
            ${imgUrl ? `<img src="${imgUrl}" alt="${name}" class="modal-image" onerror="this.style.display='none'">` : '<div class="modal-image-placeholder"></div>'}
            <div class="modal-hero-overlay">
                <span class="modal-type-badge">${type || 'Tour'}</span>
                ${duration > 0 ? `<span class="modal-duration">⏱️ ${duration} Day${duration > 1 ? 's' : ''}</span>` : ''}
                ${score > 0 ? `<span class="modal-rating">⭐ ${score}/5</span>` : ''}
            </div>
        </div>

        <div class="modal-body">
            <h2 class="modal-title">${name}</h2>
            ${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ''}

            <!-- Price Block -->
            <div class="modal-price-block">
                <div class="modal-pricing">
                    ${oldPriceDisplay ? `<span class="modal-old-price">${oldPriceDisplay}</span>` : ''}
                    <span class="modal-current-price">${priceDisplay}<small>/person</small></span>
                    ${discount > 0 ? `<span class="modal-discount">Save ${discount}%</span>` : ''}
                </div>
                ${tagItems ? `<div class="modal-tags">${tagItems}</div>` : ''}
            </div>

            <!-- Highlights -->
            <div class="modal-section">
                <h3 class="modal-section-title">🌟 Tour Highlights</h3>
                <ul class="modal-highlights">
                    ${highlightItems || '<li><span class="check-icon">✦</span> An unforgettable Chongqing experience</li>'}
                </ul>
            </div>

            <!-- Itinerary -->
            <div class="modal-section">
                <h3 class="modal-section-title">📋 Suggested Itinerary</h3>
                <div class="modal-itinerary">
                    ${itineraryHTML}
                </div>
            </div>

            <!-- What's Included -->
            <div class="modal-section">
                <h3 class="modal-section-title">✅ What's Included</h3>
                <ul class="modal-included">
                    ${includedItems}
                </ul>
            </div>

            <!-- Guide's Review -->
            ${review ? `
            <div class="modal-section modal-review">
                <h3 class="modal-section-title">💬 Guide's Notes</h3>
                <div class="review-box">
                    <div class="review-avatar">R</div>
                    <div class="review-text">
                        <p>"${review}"</p>
                        <span class="review-signature">— Ryan, Your Local Guide</span>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- CTA -->
            <div class="modal-cta">
                <a href="contact.html?tour=${encodeURIComponent(name)}" class="btn-modal-book">Book This Tour</a>
                <a href="https://wa.me/8615696078461?text=Hi%20Ryan!%20I'm%20interested%20in:%20${encodeURIComponent(name)}" class="btn-modal-whatsapp" target="_blank">WhatsApp Ryan</a>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    const modalBox = modal.querySelector('.route-modal');
    if (modalBox) modalBox.scrollTop = 0;
}

// Close the detail modal
function closeRouteDetail() {
    const modal = document.getElementById('routeDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Generate suggested itinerary HTML based on route name/keywords
function generateItinerary(name, subtitle, days) {
    const n = name + ' ' + subtitle;
    let items = [];

    // Detect key destinations
    const hasWulong = /武隆|天生三桥|龙水峡|仙女山|芙蓉洞|地缝/.test(n);
    const hasHongya = /洪崖洞|解放碑|来福士|千厮门/.test(n);
    const hasCiqikou = /磁器口|古镇|十八梯|山城步道/.test(n);
    const hasCruise = /游船|两江|三峡|长江|夜游船/.test(n);
    const hasDazu = /大足|石刻|宝顶山/.test(n);
    const hasHotpot = /火锅|美食|夜游|夜景/.test(n);
    const hasLiziba = /李子坝|轻轨穿楼/.test(n);
    const hasWulongk = /武隆喀斯特|天坑地缝/.test(n);

    if (days <= 1) {
        items.push({ time: '09:00', title: 'Hotel Pickup & Welcome', desc: 'Pick up from your hotel in downtown Chongqing. Brief introduction to the day\'s plan.' });
        if (hasWulong) {
            items.push({ time: '10:30', title: 'Arrive at Wulong Karst Park', desc: 'Journey through the mountains to this UNESCO World Heritage site.' });
            items.push({ time: '11:00', title: 'Three Natural Bridges (天生三桥)', desc: 'Explore the massive natural arches — filming location for Transformers 4 & Curse of the Golden Flower.' });
            items.push({ time: '13:00', title: 'Local Lunch Break', desc: 'Authentic mountain village cuisine at a local restaurant.' });
            items.push({ time: '14:30', title: 'Longshui Gorge (龙水峡地缝)', desc: 'Walk through the dramatic gorge with waterfalls and narrow canyons.' });
        } else if (hasHongya || hasCiqikou) {
            items.push({ time: '10:00', title: 'Ciqikou Ancient Town', desc: 'Explore 1,700+ years of history, traditional architecture, and local handicrafts.' });
            items.push({ time: '12:00', title: 'Authentic Local Lunch', desc: 'Try Chongqing small noodles (小面), spicy tofu, and street snacks.' });
            items.push({ time: '13:30', title: 'Liziba Light Rail Station', desc: 'Watch the train pass through the building — one of Chongqing\'s most iconic sights.' });
            items.push({ time: '15:00', title: 'Jiefangbei CBD & People\'s Liberation Monument', desc: 'The heart of modern Chongqing with luxury shopping and skyscrapers.' });
        }
        items.push({ time: '17:00', title: 'Hongya Cave (洪崖洞)', desc: 'Stilt-house complex that inspired Spirited Away. Best photo spot at dusk!' });
        items.push({ time: '19:00', title: 'Hotpot Dinner (Optional)', desc: 'Experience authentic Chongqing hotpot in an air-raid shelter restaurant.' });
        items.push({ time: '20:30', title: 'Hotel Drop-off', desc: 'Return to your hotel. End of tour.' });
    } else {
        // Multi-day
        items.push({ time: 'Day 1', title: 'Arrival & City Orientation', desc: 'Airport/station pickup. Check-in. Evening: Hongya Cave night view + welcome dinner.' });
        if (hasWulong) {
            items.push({ time: 'Day 2', title: 'Wulong Karst Adventure', desc: 'Three Natural Bridges + Longshui Gorge + Fairy Mountain (仙女山). Overnight in Wulong area.' });
        }
        if (hasDazu) {
            items.push({ time: 'Day 3', title: 'Dazu Rock Carvings', desc: 'UNESCO site with 50,000+ Buddhist statues dating back to Tang/Song dynasties.' });
        }
        if (hasCruise) {
            items.push({ time: 'Day 2-3', title: 'Yangtze River Cruise', desc: 'Scenic cruise through the Three Gorges region with shore excursions.' });
        }
        items.push({ time: 'Last Day', title: 'Free Morning & Departure', desc: 'Last-minute shopping or relaxation. Transfer to airport/station.' });
    }

    return items.map(item => `
        <div class="itinerary-item">
            <div class="itinerary-time">${item.time}</div>
            <div class="itinerary-detail">
                <div class="itinerary-title">${item.title}</div>
                <div class="itinerary-desc">${item.desc}</div>
            </div>
        </div>
    `).join('');
}

// Generate "What's Included" list based on tour type
function generateIncludes(type, days) {
    let items = [
        '🚗 Hotel pickup and drop-off (downtown Chongqing)',
        '👨‍🏫 English-speaking guide (Ryan — your local expert)',
        '🚌 Private air-conditioned vehicle',
        '🎫 All entrance fees as per itinerary',
        '💧 Bottled water throughout the tour'
    ];

    if (days >= 1) {
        items.push('🍱 Lunch included (authentic local cuisine)');
    }
    if (days >= 2) {
        items.push('🏨 Accommodation (4-star hotel, foreigner-friendly)');
        items.push('🥣 Breakfast included each morning');
    }
    if (/私家团|Private/.test(type)) {
        items.push('🔧 Fully customizable itinerary');
        items.push('⏰ Flexible timing — go at your own pace');
    }
    if (/拼小团|Small Group/.test(type)) {
        items.push('👥 Small group (max 8 people)');
        items.push('🤝 Share the experience with like-minded travelers');
    }

    return items.map(item => `<li>${item}</li>`).join('');
}

// Extract days from route name
function extractDays(name) {
    // Match "X日游" pattern
    const match = name.match(/(\d+)日/);
    if (match) return parseInt(match[1]);

    // Match Chinese numerals
    if (name.includes('一日游') || name.includes('1日')) return 1;
    if (name.includes('两日') || name.includes('二日') || name.includes('2日')) return 2;
    if (name.includes('三日') || name.includes('3日')) return 3;
    if (name.includes('四日') || name.includes('4日')) return 4;
    if (name.includes('五日') || name.includes('5日')) return 5;
    if (name.includes('六日') || name.includes('6日')) return 6;
    if (name.includes('七日') || name.includes('7日')) return 7;
    if (name.includes('八日') || name.includes('8日')) return 8;

    // Try to extract any number followed by "天"
    const tianMatch = name.match(/(\d+)\s*天/);
    if (tianMatch) return parseInt(tianMatch[1]);

    return 0; // Unknown
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
