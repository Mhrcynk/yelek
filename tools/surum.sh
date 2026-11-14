#!/bin/sh
# Yeni sürüm numarası verir: index.html'deki APP_V ve app.css/app.js bağlantıları birlikte güncellenir.
V=$(date -u +%y%m%d%H%M%S)
sed -i -E "s/const APP_V=\"[0-9a-z]*\"/const APP_V=\"$V\"/; s/(app\.(css|js))\?v=[0-9a-z]+/\1?v=$V/g" "$(dirname "$0")/../index.html"
echo "$V"
