import json, os, glob, shutil

# 1. Copy webp files to images/routes/ (replacing originals)
src_dir = 'images/routes_compressed'
dst_dir = 'images/routes'

# Remove old jpg/png files
for f in glob.glob(os.path.join(dst_dir, '*.jpg')) + glob.glob(os.path.join(dst_dir, '*.png')):
    os.remove(f)
    print(f'Removed: {os.path.basename(f)}')

# Copy webp files
copied = 0
for f in sorted(glob.glob(os.path.join(src_dir, '*.webp'))):
    dst = os.path.join(dst_dir, os.path.basename(f))
    shutil.copy2(f, dst)
    copied += 1

print(f'Copied {copied} WebP files to {dst_dir}')

# 2. Update routes.json: change .jpg/.png -> .webp
with open('data/routes.json', encoding='utf-8') as f:
    data = json.load(f)

changed = 0
for r in data:
    old_url = r.get('图片URL', '')
    if old_url:
        base, ext = os.path.splitext(old_url)
        new_url = base + '.webp'
        if new_url != old_url:
            r['图片URL'] = new_url
            changed += 1

with open('data/routes.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Updated {changed}/{len(data)} image URLs to .webp')
print(f'First URL: {data[0].get("图片URL", "")}')
