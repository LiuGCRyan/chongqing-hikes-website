// routes.js - Load and display routes for city-tours.html and hiking.html
// Matches HTML element IDs: searchInput, durationFilter, sortFilter, loadMoreBtn, routesGrid

let allRoutes = [];
let filteredRoutes = [];
let displayCount = 0;
const ROUTES_PER_PAGE = 20;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRoutes();
    setupFilters();
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

// Setup filter event listeners
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const durationFilter = document.getElementById('durationFilter');
    const sortFilter = document.getElementById('sortFilter');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => applyFilters(), 300));
    }
    
    if (durationFilter) {
        durationFilter.addEventListener('change', () => applyFilters());
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', () => applyFilters());
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => loadMore());
    }
}

// Apply all filters and re-render
function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const duration = document.getElementById('durationFilter')?.value || '';
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
        
        // Duration filter (extract days from route name)
        if (duration) {
            const days = extractDays(route['线路名称'] || '');
            const durationNum = parseInt(duration);
            if (durationNum >= 6) {
                // 6+ days
                if (days < 6) return false;
            } else {
                if (days !== durationNum) return false;
            }
        }
        
        return true;
    });
    
    // Sort
    if (sort === 'price-asc') {
        filteredRoutes.sort((a, b) => (a['你的价格'] || 0) - (b['你的价格'] || 0));
    } else if (sort === 'price-desc') {
        filteredRoutes.sort((a, b) => (b['你的价格'] || 0) - (a['你的价格'] || 0));
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
    const cardsHTML = [];
    for (let i = start; i < end; i++) {
        cardsHTML.push(createRouteCard(filteredRoutes[i]));
    }
    
    // Append to grid
    grid.insertAdjacentHTML('beforeend', cardsHTML.join(''));
    
    // Update display count
    displayCount = end;
    
    // Show/hide Load More button
    if (loadMoreBtn) {
        if (displayCount >= filteredRoutes.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More (${filteredRoutes.length - displayCount} remaining)`;
        }
    }
    
    // Add click listeners to new cards
    for (let i = start; i < end; i++) {
        const card = grid.children[i - start];
        if (card) {
            const route = filteredRoutes[i];
            card.addEventListener('click', () => showRouteDetail(route));
        }
    }
}

// Create HTML for a route card (NO IMAGE - clean typography layout)
function createRouteCard(route) {
    const id = route['产品ID'] || '';
    const name = route['线路名称'] || 'Untitled Tour';
    const subtitle = route['副标题'] || '';
    const type = route['类型'] || '';
    const price = route['你的价格'] || 0;
    const oldPrice = route['携程价格'] || 0;
    const score = route['评分'] || 0;
    const highlights = route['路线亮点（外国人关注）'] || '';
    const duration = extractDays(name);
    
    // Extract first highlight
    const firstHighlight = highlights.split('|')[0]?.trim() || '';
    
    // Format price
    const priceDisplay = price > 0 ? `¥${price}` : 'Contact Us';
    const oldPriceDisplay = (oldPrice > 0 && oldPrice !== price) ? `<span class="old-price">¥${oldPrice}</span>` : '';
    
    // Calculate discount
    const discount = (oldPrice > 0 && price > 0 && oldPrice > price) ? Math.round((1 - price / oldPrice) * 100) : 0;
    
    return `
        <div class="route-card" data-id="${id}">
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
                <div class="route-footer">
                    <div class="route-pricing">
                        ${oldPriceDisplay}
                        <span class="current-price">${priceDisplay}</span>
                        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                    </div>
                    <span class="btn-view">View Details →</span>
                </div>
            </div>
        </div>
    `;
}

// Show route detail in a simple alert/modal
function showRouteDetail(route) {
    const name = route['线路名称'] || '';
    const price = route['你的价格'] || 0;
    const highlights = route['路线亮点（外国人关注）'] || '';
    const review = route['你的专业评价'] || '';
    
    const priceDisplay = price > 0 ? `¥${price}` : 'Contact Us';
    const highlightsList = highlights.split('|').filter(h => h.trim()).map(h => `• ${h.trim()}`).join('\n');
    
    const detail = `
${name}

Price: ${priceDisplay}

Highlights:
${highlightsList}

${review ? `\nMy Review:\n${review}` : ''}

To book this tour, contact me:
WhatsApp: +86 156 9607 8461
Email: chongqinghikes@qq.com
    `.trim();
    
    alert(detail);
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
