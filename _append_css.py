
css_text = '''

/* ==================== CITY TOURS - ROUTES SECTION ==================== */

.al-routes-section {
    padding: var(--spacing-xxl) 0;
    background: #f8f7f4;
}

.section-subtitle {
    text-align: center;
    color: var(--text-light);
    margin-bottom: var(--spacing-xl);
    font-size: 1.1rem;
}

.routes-filters {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
    justify-content: center;
}

.search-box {
    flex: 1;
    max-width: 400px;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Open Sans', sans-serif;
}

.filter-select {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Open Sans', sans-serif;
    background: white;
    cursor: pointer;
}

.routes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.route-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.route-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.route-card .route-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.route-card .route-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.route-card .route-type {
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
    background: var(--primary);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.route-card .route-content {
    padding: var(--spacing-md);
}

.route-card h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.3rem;
    margin-bottom: var(--spacing-xs);
    color: var(--text);
}

.route-card .route-subtitle {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: var(--spacing-sm);
    line-height: 1.4;
}

.route-card .route-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-sm);
    border-top: 1px solid #eee;
}

.route-card .route-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    color: var(--primary);
    font-weight: 600;
}

.btn-view {
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--primary);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.btn-view:hover {
    background: #b8944a;
}

.load-more-container {
    text-align: center;
    margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
    .routes-filters {
        flex-direction: column;
    }
    
    .search-box {
        max-width: 100%;
    }
    
    .routes-grid {
        grid-template-columns: 1fr;
    }
}
'''

with open('css/style.css', 'a', encoding='utf-8') as f:
    f.write(css_text)

print('CSS appended successfully')
