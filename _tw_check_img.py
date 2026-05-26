import urllib.request
url = 'https://liugcryan.github.io/chongqing-hikes-website/images/routes/route_39486564.webp'
req = urllib.request.Request(url, method='HEAD')
try:
    r = urllib.request.urlopen(req, timeout=10)
    print(f'Status: {r.status}, Type: {r.headers.get("Content-Type")}')
except Exception as e:
    print(f'Error: {e}')
