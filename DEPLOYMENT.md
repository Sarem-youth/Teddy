# 🚀 Deploying Teddy General Trading to cPanel

This guide takes you from a fresh cPanel account to a live store in about **20 minutes**.
No SSH required for the basic flow (SSH/Terminal makes it faster if available).

---

## What you need

| Requirement | Where |
|---|---|
| cPanel hosting with **PHP 8.3+** | MultiPHP Manager (most hosts have 8.3/8.4) |
| **MySQL** database | cPanel » MySQL® Databases |
| A domain pointed at the server | Registrar (e.g. Namechamp) DNS » A record |
| The ready-to-upload package | Run `./build.sh` on your computer (see below) |

> PHP extensions needed (almost always enabled by default):
> `pdo_mysql, mbstring, openssl, tokenizer, xml, ctype, fileinfo, gd, bcmath`
> Check under cPanel » **Select PHP Version » Extensions**.

---

## Step 0 — Build the upload package (on your computer)

```bash
./build.sh          # from the project root
```

This compiles the React storefront, embeds it into the Laravel app, installs
production PHP dependencies, and produces **`dist/teddy-platform.zip`**.

> If you can't run the build locally, any machine with Node 20+ and PHP 8.3+
> (with Composer) works. Nothing needs to be built on the server itself.

---

## Step 1 — Create the database

1. cPanel » **MySQL® Databases**
2. *Create New Database* → e.g. `youruser_teddy`
3. *Add New User* → e.g. `youruser_teddy` + strong password (save it!)
4. *Add User To Database* → select both → grant **ALL PRIVILEGES**

## Step 2 — Upload the application

**Option A — app inside `public_html` (simplest, works on every host)**

1. cPanel » **File Manager** » open `public_html`
2. Upload `teddy-platform.zip` and **Extract** it directly into `public_html`
   (so that `public_html/index.php` does *not* exist, but
   `public_html/artisan`, `public_html/public/`, `public_html/app/` do)
3. The included root `.htaccess` automatically routes all traffic into
   `public/` — nothing else to configure.

**Option B — document root pointing at `public/` (slightly cleaner URLs-wise)**

1. Extract the zip into a folder *above* webroot, e.g. `/home/youruser/teddy`
2. cPanel » **Domains** » change the domain's *Document Root* to
   `/home/youruser/teddy/public`

## Step 3 — Configure the environment

1. In File Manager, locate `.env.cpanel.example` in the app folder
2. **Copy** it to `.env` (File Manager » Copy)
3. **Edit** `.env` and fill in the ★ values:
   - `APP_URL=https://yourdomain.com`
   - If you split the public store and admin panel onto subdomains, also set:
     - `SESSION_DOMAIN=.yourdomain.com`
     - `SANCTUM_STATEFUL_DOMAINS=yourdomain.com,admin.yourdomain.com,localhost,localhost:5173,127.0.0.1,127.0.0.1:5173,127.0.0.1:8000,::1`
   - `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` from Step 1
   - `MAIL_*` — create a mailbox first under cPanel » **Email Accounts**
     (e.g. `no-reply@yourdomain.com`) and use the SMTP settings cPanel shows
     (host `mail.yourdomain.com`, port `465`, encryption `ssl`)

4. In the frontend environment for the build, set these when using separate hosts:
   - `VITE_PUBLIC_APP_URL=https://yourdomain.com`
   - `VITE_ADMIN_APP_URL=https://admin.yourdomain.com`
   - `VITE_API_BASE_URL=https://api.yourdomain.com` if the API is hosted separately; otherwise leave it unset

## Step 4 — Initialize the application

**With SSH / cPanel Terminal (recommended):**

```bash
cd ~/public_html        # or ~/teddy for Option B
php artisan key:generate --force
php artisan migrate --seed --force
php artisan config:cache && php artisan route:cache
```

**Without SSH:** create a temporary file `public/setup.php` containing:

```php
<?php
// TEMPORARY one-shot installer — DELETE THIS FILE IMMEDIATELY AFTER USE.
if (($_GET['key'] ?? '') !== 'CHANGE-THIS-TO-A-LONG-RANDOM-STRING') { http_response_code(403); exit('Forbidden'); }
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
foreach ([['key:generate','--force'=>true],['migrate','--seed'=>true,'--force'=>true],['config:cache'],['route:cache']] as $cmd) {
    $kernel->call(array_shift($cmd), $cmd); echo '<pre>'.htmlspecialchars($kernel->output()).'</pre>';
}
echo 'DONE — now DELETE public/setup.php';
```

Set your own random `key`, visit `https://yourdomain.com/setup.php?key=...`,
then **delete the file**.

## Step 5 — Enable HTTPS (NFR-4.2.1)

1. cPanel » **SSL/TLS Status** » *Run AutoSSL* (free Let's Encrypt/Sectigo cert)
2. Once issued, edit the root `.htaccess` and **uncomment** the two
   `Force HTTPS` lines near the top.

## Step 6 — Nightly database backups (NFR-4.4.3)

cPanel » **Cron Jobs** » add one job:

```
0 2 * * *  /usr/local/bin/php /home/youruser/public_html/artisan schedule:run >> /dev/null 2>&1
```

(adjust the path for Option B). The scheduler runs `db:backup` daily at 02:00,
keeping the last 14 dumps in `storage/app/backups/`.

## Step 7 — First login & handover checklist

| ✔ | Task |
|---|---|
| ☐ | Sign in at `https://yourdomain.com/login` → `admin@teddytrading.com` / `TeddyAdmin@2026` |
| ☐ | **Immediately change the admin password** (Account » Profile » Change password) |
| ☐ | Admin » Settings → real store phone, email, address, bank account details |
| ☐ | Admin » Products → replace demo catalog with real products & photos |
| ☐ | Send a test message from `/contact` and confirm it arrives in the corporate inbox |
| ☐ | Place a test order end-to-end and verify it appears in Admin » Orders |
| ☐ | Verify `https://yourdomain.com/sitemap.xml` renders and submit it in Google Search Console |

---

## Updating the site later

1. Re-run `./build.sh` locally
2. Upload & overwrite the changed folders (`public/assets`, `resources/views`,
   `app/`, etc.) — **never overwrite `.env` or `public/uploads/`**
3. If PHP files changed, clear caches:
   `php artisan config:cache && php artisan route:cache && php artisan view:clear`

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page / 500 | Check `storage/logs/laravel.log`; usually a missing `.env` value or `php artisan key:generate` not run |
| 403 on everything | Folder permissions: directories `755`, files `644`; `storage/` and `bootstrap/cache/` must be writable |
| "Route login not defined" in log | Harmless — an unauthenticated API hit; already handled in-app |
| Images don't upload | Ensure `public/uploads` exists and is writable (`755`) |
| Emails not sending | Wrong SMTP creds — test them in cPanel » Email Accounts » Connect Devices |
| CSS/JS 404 after update | Re-upload `public/assets` and `resources/views/spa.blade.php` from the new build |

**Demo data:** the seeder ships 20 realistic water-equipment products in 7
categories plus the admin account. To start with an empty catalog instead, run
`php artisan migrate --force` followed by
`php artisan db:seed --class=Database\\Seeders\\DatabaseSeeder --force` only
after removing the demo blocks — or simply delete demo products from the admin.
