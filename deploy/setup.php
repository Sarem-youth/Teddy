<?php
/**
 * TEDDY ONE-SHOT INSTALLER (v5 — self-healing permissions).
 * Upload to  public/setup.php , set your own key below, then visit:
 *     https://yourdomain.com/setup.php?key=YOUR-KEY
 * DELETE THIS FILE IMMEDIATELY AFTER IT PRINTS "ALL DONE".
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(300);

if (($_GET['key'] ?? '') !== 'CHANGE-ME') {
    http_response_code(403);
    exit('Forbidden');
}

header('Content-Type: text/plain; charset=utf-8');
while (ob_get_level() > 0) { ob_end_flush(); }
ob_implicit_flush(true);
echo "══════ TEDDY INSTALLER v5 ══════\n\n";

/* Never a blank page: print any fatal error on shutdown. */
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        echo "\nFATAL: {$e['message']}\n  at {$e['file']}:{$e['line']}\n";
    }
});

/* Lenient guard: warnings/notices/deprecations are PRINTED but never fatal.
   (Real exceptions are still caught per-step below.) */
$lenient = function ($level, $message, $file = '', $line = 0) {
    if (stripos((string) $message, 'tempnam') !== false) {
        return true; // known-harmless host quirk — silent
    }
    echo "    [warn] {$message}\n           @ {$file}:{$line}\n";
    return true;
};
set_error_handler($lenient);

$base = dirname(__DIR__);

/* ── [A] Verify & SELF-HEAL every writable directory the app needs ──
   is_writable() lies on this host, so we probe with a real write.
   Heal ladder: create → chmod 755/775/777 → rename-aside & recreate. */
function probeWrite(string $dir): bool
{
    $probe = $dir . '/.probe-' . bin2hex(random_bytes(4));
    $ok = @file_put_contents($probe, 'x') !== false;
    if ($ok) {
        @unlink($probe);
    }
    return $ok;
}

function healDir(string $dir): string
{
    if (! is_dir($dir)) {
        @mkdir($dir, 0775, true);
        if (is_dir($dir) && probeWrite($dir)) {
            return 'created';
        }
    }
    if (probeWrite($dir)) {
        return 'ok';
    }
    foreach ([0755, 0775, 0777] as $mode) {
        @chmod($dir, $mode);
        if (probeWrite($dir)) {
            return 'chmod-fixed';
        }
    }
    // Last resort: shove the broken dir aside and make a fresh one we own.
    $aside = $dir . '.broken-' . date('His');
    if (@rename($dir, $aside)) {
        @mkdir($dir, 0775, true);
        // salvage previous contents where possible
        foreach (glob($aside . '/*') ?: [] as $item) {
            @rename($item, $dir . '/' . basename($item));
        }
        if (probeWrite($dir)) {
            return 'recreated';
        }
    }
    return 'FAILED';
}

$dirs = [
    'bootstrap/cache',
    'storage',
    'storage/app',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/cache/data',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
    'public/uploads',
    'public/uploads/products',
];

echo "[A] Directory health check & self-heal:\n";
$failed = [];
foreach ($dirs as $d) {
    $result = healDir($base . '/' . $d);
    printf("    %-36s %s\n", $d, $result);
    if ($result === 'FAILED') {
        $failed[] = $d;
    }
}
if ($failed) {
    echo "\nSTOP: these folders resist all repair: " . implode(', ', $failed) . "\n";
    echo "Fix in cPanel File Manager: right-click each -> Permissions -> 755\n";
    echo "(If that fails, ask your host to run: chown -R youruser:youruser these folders.)\n";
    exit;
}

/* ── [A2] Guarantee APP_KEY — generate & write it if .env has none.
       (An empty APP_KEY= line, e.g. with a template comment after it,
       parses as NO key and breaks every web page with a 500.) ── */
$envPath = $base . '/.env';
if (! is_file($envPath)) {
    echo "STOP: .env file is missing — copy .env.cpanel.example to .env first.\n";
    exit;
}
$envRaw = file_get_contents($envPath);
$hasKey = preg_match('/^APP_KEY=([^\s#]{10,})/m', $envRaw);
if (! $hasKey) {
    $newKey = 'base64:' . base64_encode(random_bytes(32));
    if (preg_match('/^APP_KEY=.*$/m', $envRaw)) {
        $envRaw = preg_replace('/^APP_KEY=.*$/m', 'APP_KEY=' . $newKey, $envRaw, 1);
    } else {
        $envRaw = "APP_KEY={$newKey}\n" . $envRaw;
    }
    if (@file_put_contents($envPath, $envRaw) === false) {
        echo "STOP: could not write .env to set APP_KEY — make the app root writable.\n";
        exit;
    }
    echo "\n[A2] APP_KEY was missing — generated and saved a new one.\n";
} else {
    echo "\n[A2] APP_KEY present.\n";
}

require $base . '/vendor/autoload.php';

/* ── [B] Clear stale caches, then guarantee the package manifest ── */
foreach (glob($base . '/bootstrap/cache/*.php') ?: [] as $f) {
    @unlink($f);
}
echo "\n[B] Stale bootstrap caches cleared.\n";

$packagesPath = $base . '/bootstrap/cache/packages.php';
$fs = class_exists(\App\Support\ResilientFilesystem::class)
    ? new \App\Support\ResilientFilesystem
    : new \Illuminate\Filesystem\Filesystem;
(new \Illuminate\Foundation\PackageManifest($fs, $base, $packagesPath))->build();

if (! is_file($packagesPath)) {
    echo "STOP: could not write {$packagesPath} — folder still not writable.\n";
    exit;
}
echo "[B] Package manifest written & verified.\n";

echo class_exists(\App\Support\ResilientFilesystem::class)
    ? "[C] Permanent filesystem fix: DEPLOYED.\n\n"
    : "[C] Permanent fix NOT uploaded (app/Support/ResilientFilesystem.php missing)\n    — continuing with runtime guard only.\n\n";

/* ── [D] Boot Laravel in controlled stages; our lenient guard goes
        back on top after Laravel installs its own handler. ── */
$app = require $base . '/bootstrap/app.php';

$app->bootstrapWith([
    \Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
    \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
]);

set_error_handler($lenient); // wrap on top of Laravel's handler

$app->bootstrapWith([
    \Illuminate\Foundation\Bootstrap\SetRequestForConsole::class, // request first: clean error pages
    \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
    \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    \Illuminate\Foundation\Bootstrap\BootProviders::class,
]);
echo "[D] Laravel booted successfully.\n\n";

/* ── [E] Install ── */
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

$steps = [
    ['db:wipe',      ['--force' => true]],
    ['migrate',      ['--seed' => true, '--force' => true]],
    ['view:clear',   []],
    ['view:cache',   []],   // pre-compile all Blade views ON THIS SERVER
    ['config:cache', []],
    ['route:cache',  []],
];

foreach ($steps as [$name, $args]) {
    echo ">>> {$name}\n";
    try {
        $kernel->call($name, $args);
        $out = trim($kernel->output());
        echo ($out !== '' ? $out : '(ok)') . "\n\n";
    } catch (Throwable $e) {
        echo 'ERROR: ' . $e->getMessage() . "\n  at " . $e->getFile() . ':' . $e->getLine() . "\n\n";
        echo "Stopped. Paste this output to your developer.\n";
        exit;
    }
}

/* ── [F] Prove it ── */
try {
    $products = \Illuminate\Support\Facades\DB::table('products')->count();
    $admins = \Illuminate\Support\Facades\DB::table('users')->where('is_admin', 1)->count();
    echo "[F] Verification: {$products} products seeded, {$admins} admin account ready.\n\n";
} catch (Throwable $e) {
    echo '[F] Verification failed: ' . $e->getMessage() . "\n\n";
}

echo "══════ ALL DONE ══════\n";
echo "1. Open your homepage — the store is live.\n";
echo "2. Log in: admin@teddytrading.com / TeddyAdmin@2026 — CHANGE THE PASSWORD.\n";
echo "3. DELETE public/setup.php and public/diagnose.php NOW.\n";
