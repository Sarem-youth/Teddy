#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
#  Teddy General Trading — one-command production build for cPanel
#
#  Produces dist/teddy-platform.zip ready to upload to cPanel.
#  Your working tree is left untouched (build is staged separately).
#  Requires: Node 20+, npm, PHP 8.3+, Composer 2, zip/rsync.
# ══════════════════════════════════════════════════════════════════
set -euo pipefail
cd "$(dirname "$0")"

STAGE="dist/stage"

echo "▸ [1/4] Building React storefront…"
(cd frontend && npm install --no-audit --no-fund && npm run build && npm run deploy:backend)

echo "▸ [2/4] Staging backend…"
rm -rf "$STAGE" && mkdir -p "$STAGE"
rsync -a backend/ "$STAGE/" \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'vendor' \
  --exclude 'tests' \
  --exclude '.env' \
  --exclude 'database/*.sqlite' \
  --exclude 'storage/logs/*' \
  --exclude 'storage/app/backups/*' \
  --exclude 'storage/framework/views/*' \
  --exclude 'storage/framework/cache/data/*' \
  --exclude 'storage/framework/sessions/*' \
  --exclude 'bootstrap/cache/*'

echo "▸ [3/4] Installing production PHP dependencies…"
(cd "$STAGE" && composer install --no-dev --optimize-autoloader --no-interaction --quiet)

echo "▸ [4/4] Creating dist/teddy-platform.zip…"
rm -f dist/teddy-platform.zip
(cd "$STAGE" && zip -rq ../teddy-platform.zip . )
rm -rf "$STAGE"

echo
echo "✔ Done → dist/teddy-platform.zip ($(du -h dist/teddy-platform.zip | cut -f1))"
echo "  Next: follow DEPLOYMENT.md — upload, create .env from .env.cpanel.example,"
echo "        run migrations, enable AutoSSL. Enjoy! 💧"
