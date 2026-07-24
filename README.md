# 💧 Teddy General Trading — E-Commerce Platform

Full-stack e-commerce platform for showcasing, managing and selling **water
materials & related equipment** (pumps, filtration, pipes, valves, tanks,
irrigation) — built to the v1.1 SRS.

| Layer | Stack |
|---|---|
| Storefront + Admin SPA | **React 18 · Material UI 5 · Vite** |
| API + server | **Laravel 13 · Sanctum (token auth) · MySQL/SQLite** |
| Deployment target | **cPanel shared hosting** (also runs on any VPS) |

## Feature map (SRS traceability)

- **Catalog (3.1)** — admin product CRUD, multi-image upload with alt text,
  free-form technical *details* field, ETB pricing, stock, categories,
  storefront grid with pagination, search, sort & category filters
- **Cart & checkout (3.2)** — guest cart (localStorage) that merges into the
  server cart at login, live totals with configurable VAT/shipping/free-shipping
  threshold, validated multi-step checkout
- **Accounts (3.3)** — registration with password-complexity rules, customer
  dashboard (orders, tracking, addresses, profile), email password reset
- **Payments baseline (3.4)** — orders start `pending_verification`
  (bank transfer / cash on delivery); admin confirms payment & advances status
- **Contact (3.5)** — public inquiry form → stored + routed via SMTP to the
  corporate inbox
- **Non-functional** — responsive MUI design, HTTPS-ready, bcrypt hashing,
  RBAC admin middleware, per-product SEO meta + dynamic `sitemap.xml` &
  `robots.txt`, code-split bundles, nightly DB backups via scheduler

## Quick start (local development)

```bash
# API — http://127.0.0.1:8000
cd backend
cp .env.example .env && php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve

# Storefront (hot reload) — http://localhost:5173 (proxies /api)
cd ../frontend
npm install
npm run dev
```

**Demo admin:** `admin@teddytrading.com` / `TeddyAdmin@2026` — *change in production!*

## Production build & cPanel deployment

```bash
./build.sh     # → dist/teddy-platform.zip
```

Then follow **[DEPLOYMENT.md](DEPLOYMENT.md)** (≈20 min, no SSH required).

## Repository layout

```
backend/    Laravel 13 API + serves the built SPA (upload this to cPanel)
frontend/   React/MUI source (built assets are synced into backend/)
build.sh    One-command production packager
DEPLOYMENT.md  Step-by-step cPanel guide
```

## Useful backend commands

```bash
php artisan db:backup            # manual database backup → storage/app/backups
php artisan migrate:fresh --seed # reset with demo data
bash tests/e2e-api.sh            # 21-check API regression suite (dev only)
```
