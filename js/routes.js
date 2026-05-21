// routes.js - Load and display routes from JSON with pagination

let allRoutes = [];
let filteredRoutes = [];
let displayCount = 0;
const ROUTES_PER_PAGE = 20;

// Load routes from JSON
async function loadRoutes() {
    try {
        const response = await fetch('data/routes.json');
        allRoutes = await response.json();
        
        console.log(`✅ Loaded ${allRoutes.length} routes`);
        
        // Initial render
        applyFilters();
        
        // Setup filter listeners
        setupFilters();
        
    } catch (error) {
        console.error('❌ Error loading routes:', error);
        document.getElementById('routes-grid').innerHTML = 
            '<p class="error">Error loading tours. Please try again later.</p>';
    }
}

// Render route cards with pagination
function renderRoutes(routes, append = false) {
    const grid = document.getElementById('routes-grid');
    const noResults = document.getElementById('no-results');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (!append) {
        grid.innerHTML = '';
        displayCount = 0;
    }
    
    if (routes.length === 0 && !append) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Get next batch
    const start = displayCount;
    const end = Math.min(start + ROUTES_PER_PAGE, routes.length);
    const batch = routes.slice(start, end);
    
    // Render batch
    const cardsHTML = batch.map(route => createRouteCard(route)).join('');
    
    if (append) {
        grid.insertAdjacentHTML('beforeend', cardsHTML);
    } else {
        grid.innerHTML = cardsHTML;
    }
    
    displayCount = end;
    
    // Show/hide "Load More" button
    if (loadMoreContainer) {
        if (displayCount >= routes.length) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
            const btn = document.getElementById('btn-load-more');
            if (btn) {
                btn.textContent = `Load More Tours (${routes.length - displayCount} remaining)`;
            }
        }
    }
    
    // Add click listeners to new cards
    batch.forEach((route, index) => {
        const card = grid.children[start + index];
        if (card) {
            card.addEventListener('click', () => {
                showRouteDetail(route);
            });
        }
    });
}

// Create HTML for a route card
function createRouteCard(route) {
    const id = route['产品ID'] || '';
    const name = route['线路名称'] || 'Untitled Tour';
    const type = route['类型'] || '';
    const price = route['你的价格'] || 0;
    const oldPrice = route['携程价格'] || 0;
    const image = route['图片URL'] || '';
    const score = route['评分'] || 0;
    const highlights = route['路线亮点（外国人关注）'] || '';
    
    // Extract first highlight
    const firstHighlight = highlights.split('|')[0]?.trim() || '';
    
    // Calculate discount
    const discount = oldPrice > 0 && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;
    
    // Format price display
    const priceDisplay = price > 0 ? `¥${price}` : 'Contact Us';
    const oldPriceDisplay = oldPrice > 0 && oldPrice !== price ? `<span class="old-price">¥${oldPrice}</span>` : '';
    
    return `
        <div class="route-card" data-id="${id}" data-type="${type}" data-price="${price}">
            <div class="route-image">
                <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
                ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                <span class="route-type-badge">${type}</span>
            </div>
            <div class="route-info">
                <h3 class="route-name">${name}</h3>
                ${score > 0 ? `<div class="route-rating">
                    <span class="stars">${'★'.repeat(Math.floor(score))}${'☆'.repeat(5-Math.floor(score))}</span>
                    <span class="score">${score}</span>
                </div>` : ''}
                ${firstHighlight ? `<p class="route-highlight">${firstHighlight}</p>` : ''}
                <div class="route-pricing">
                    ${oldPriceDisplay}
                    <span class="current-price">${priceDisplay}</span>
                </div>
            </div>
        </div>
    `;
}

// Apply filters
function applyFilters() {
    const durationFilter = document.getElementById('filter-duration').value;
    const priceFilter = document.getElementById('filter-price').value;
    const sortFilter = document.getElementById('filter-sort').value;
    
    filteredRoutes = allRoutes.filter(route => {
        // Duration filter (extract from title)
        if (durationFilter) {
            const name = route['线路名称'] || '';
            const days = extractDays(name);
            if (durationFilter === '1' && days !== 1) return false;
            if (durationFilter === '2' && days !== 2) return false;
            if (durationFilter === '3' && days !== 3) return false;
            if (durationFilter === '4+' && days < 4) return false;
        }
        
        // Price filter
        const price = route['你的价格'] || 0;
        if (priceFilter) {
            if (priceFilter === '0-500' && price > 500) return false;
            if (priceFilter === '500-1000' && (price < 500 || price > 1000)) return false;
            if (priceFilter === '1000-2000' && (price < 1000 || price > 2000)) return false;
            if (priceFilter === '2000+' && price < 2000) return false;
        }
        
        return true;
    });
    
    // Apply sorting
    if (sortFilter === 'price-asc') {
        filteredRoutes.sort((a, b) => (a['你的价格'] || 0) - (b['你的价格'] || 0));
    } else if (sortFilter === 'price-desc') {
        filteredRoutes.sort((a, b) => (b['你的价格'] || 0) - (a['你的价格'] || 0));
    } else if (sortFilter === 'rating') {
        filteredRoutes.sort((a, b) => (b['评分'] || 0) - (a['评分'] || 0));
    }
    
    console.log(`🔍 Filtered: ${filteredRoutes.length} / ${allRoutes.length}`);
    
    renderRoutes(filteredRoutes);
}

// Extract days from route name
function extractDays(name) {
    const match = name.match(/(\d+)日/);
    if (match) return parseInt(match[1]);
    
    if (name.includes('一日游')) return 1;
    if (name.includes('两日') || name.includes('2日')) return 2;
    if (name.includes('三日') || name.includes('3日')) return 3;
    
    return 0; // Unknown
}

// Setup filter listeners
function setupFilters() {
    document.getElementById('filter-duration').addEventListener('change', () => {
        applyFilters();
    });
    
    document.getElementById('filter-price').addEventListener('change', () => {
        applyFilters();
    });
    
    document.getElementById('filter-sort').addEventListener('change', () => {
        applyFilters();
    });
    
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        document.getElementById('filter-duration').value = '';
        document.getElementById('filter-price').value = '';
        document.getElementById('filter-sort').value = 'default';
        applyFilters();
    });
    
    // Load More button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            renderRoutes(filteredRoutes, true);
        });
    }
}

// Show route detail modal
function showRouteDetail(route) {
    const modal = document.getElementById('route-modal');
    const modalBody = document.getElementById('modal-body');
    
    const name = route['线路名称'] || '';
    const type = route['类型'] || '';
    const price = route['你的价格'] || 0;
    const oldPrice = route['携程价格'] || 0;
    const image = route['图片URL'] || '';
    const score = route['评分'] || 0;
    const highlights = route['路线亮点（外国人关注）'] || '';
    const review = route['你的专业评价'] || '';
    const subtitle = route['副标题'] || '';
    
    const priceDisplay = price > 0 ? `¥${price}` : 'Contact Us';
    const oldPriceDisplay = oldPrice > 0 && oldPrice !== price ? `<span class="old-price">¥${oldPrice}</span>` : '';
    
    modalBody.innerHTML = `
        <div class="route-detail">
            <div class="detail-image">
                <img src="${image}" alt="${name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="detail-info">
                <h2>${name}</h2>
                ${subtitle ? `<p class="detail-subtitle">${subtitle}</p>` : ''}
                ${score > 0 ? `<div class="detail-rating">
                    <span class="stars">${'★'.repeat(Math.floor(score))}${'☆'.repeat(5-Math.floor(score))}</span>
                    <span>${score} / 5.0</span>
                </div>` : ''}
                
                <div class="detail-highlights">
                    <h3>Highlights</h3>
                    <ul>
                        ${highlights.split('|').map(h => `<li>${h.trim()}</li>`).join('')}
                    </ul>
                </div>
                
                ${review ? `<div class="detail-review">
                    <h3>My Professional Review</h3>
                    <p>${review}</p>
                </div>` : ''}
                
                <div class="detail-pricing">
                    ${oldPriceDisplay}
                    <span class="current-price">${priceDisplay}</span>
                    <span class="price-note">per person</span>
                </div>
                
                <button class="btn-primary" onclick="window.open('https://wa.me/8615696078461', '_blank')">Book Now via WhatsApp</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Close modal
    modal.querySelector('.modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadRoutes);
