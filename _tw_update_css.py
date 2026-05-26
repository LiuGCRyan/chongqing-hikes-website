"""Update CSS for modal hero section - add price overlay, no-image styling"""
import re

css_path = r'C:\Users\Administrator\.qclaw\workspace\chongqing-hikes-website\css\style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Replace .modal-hero block (height 280 -> 320, better no-image bg)
old_hero = """.modal-hero {
    position: relative;
    width: 100%;
    height: 280px;
    overflow: hidden;
    background: linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #6b4423 100%);
}"""

new_hero = """.modal-hero {
    position: relative;
    width: 100%;
    height: 320px;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a1a 0%, #2c1810 40%, #4a3728 70%, #6b4423 100%);
}

.modal-hero.no-image {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c1810 30%, var(--color-primary-dark) 60%, var(--color-primary) 100%);
}

.modal-hero.no-image::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 50%, rgba(201,169,97,0.15) 0%, transparent 70%),
                radial-gradient(ellipse at 70% 30%, rgba(201,169,97,0.1) 0%, transparent 60%);
}

.modal-hero.no-image::after {
    content: 'Chongqing Hikes';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -80%);
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    color: rgba(255,255,255,0.12);
    letter-spacing: 6px;
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
}"""

css = css.replace(old_hero, new_hero)

# 2. Replace .modal-image block (add hover zoom)
old_img = """.modal-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}"""

new_img = """.modal-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.modal-hero:hover .modal-image {
    transform: scale(1.03);
}"""

css = css.replace(old_img, new_img)

# 3. Replace .modal-image-placeholder + ::after using regex (garbled encoding in original)
pattern = r"\.modal-image-placeholder\s*\{[^}]+\}\s*\.modal-image-placeholder::after\s*\{[^}]+\}"
css = re.sub(pattern, ".modal-image-placeholder {\n    display: none;\n}", css)

# 4. Replace .modal-hero-overlay with new overlay-top + overlay-bottom
old_overlay = """.modal-hero-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 24px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}"""

new_overlay = """/** Top overlay: type badge + duration + rating */
.modal-hero-overlay-top {
    position: absolute;
    top: 16px;
    left: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    z-index: 2;
}

/** Bottom overlay: price */
.modal-hero-overlay-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px 24px 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%);
    z-index: 2;
}

.hero-price-group {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
}

.hero-old-price {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.5);
    text-decoration: line-through;
}

.hero-current-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.6rem;
    color: #fff;
    font-weight: 700;
    line-height: 1;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.hero-current-price small {
    font-size: 0.9rem;
    font-weight: 400;
    color: rgba(255,255,255,0.7);
    margin-left: 2px;
}

.modal-hero-overlay-bottom .modal-discount {
    background: #27ae60;
}"""

css = css.replace(old_overlay, new_overlay)

# 5. Update .modal-type-badge (add backdrop-filter)
old_badge = """.modal-type-badge {
    background: var(--color-primary);
    color: white;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}"""

new_badge = """.modal-type-badge {
    background: rgba(201,169,97,0.85);
    color: white;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(4px);
}"""

css = css.replace(old_badge, new_badge)

# 6. Update .modal-duration, .modal-rating (darker bg)
old_dur = """.modal-duration,
.modal-rating {
    background: rgba(255,255,255,0.2);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    backdrop-filter: blur(4px);
}"""

new_dur = """.modal-duration,
.modal-rating {
    background: rgba(0,0,0,0.4);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    backdrop-filter: blur(4px);
}"""

css = css.replace(old_dur, new_dur)

# 7. Add modal-tags-only style (compact tags block without price)
old_tags_block = """.modal-price-block {
    background: var(--bg-cream);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}"""

new_tags_block = """.modal-price-block {
    background: var(--bg-cream);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.modal-price-block.modal-tags-only {
    background: transparent;
    padding: 0;
    margin-bottom: 20px;
}"""

css = css.replace(old_tags_block, new_tags_block)

# Write back
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS updated successfully!")
print(f"File size: {len(css)} bytes")
