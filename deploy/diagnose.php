<?php
/**
 * Teddy platform — deployment diagnostic (server-safe, read-only).
 * Upload into the app's  public/  folder, then visit:
 *     https://teddy.piassabet.com/diagnose.php?key=teddy2026
 * DELETE THIS FILE when finished.
 *
 * Written in legacy-compatible PHP so it runs even on PHP 5.x
 * and can report an unsupported PHP version instead of crashing.
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

if (!isset($_GET['key']) || $_GET['key'] !== 'teddy2026') {
    http_response_code(403);
    exit('Forbidden');
}

header('Content-Type: text/plain; charset=utf-8');

$root = dirname(__DIR__); // app root (one level above public/)

echo "══════════ TEDDY DEPLOYMENT DIAGNOSTIC ══════════\n\n";

/* 1. PHP version */
echo "[1] PHP version: " . PHP_VERSION;
echo version_compare(PHP_VERSION, '8.3.0', '>=') ? "   ✔ OK\n" : "   ✘ TOO OLD — app needs PHP >= 8.3. Fix in cPanel > MultiPHP Manager.\n";

/* 2. Required extensions */
echo "\n[2] Extensions:\n";
$need = array('pdo_mysql','mbstring','openssl','tokenizer','xml','ctype','fileinfo','gd','bcmath','curl');
foreach ($need as $ext) {
    echo "    " . str_pad($ext, 12) . (extension_loaded($ext) ? "✔\n" : "✘ MISSING — enable in cPanel > Select PHP Version\n");
}

/* 3. Key files/folders */
echo "\n[3] Files:\n";
$checks = array(
    '.env'                      => $root . '/.env',
    'vendor/autoload.php'       => $root . '/vendor/autoload.php',
    'bootstrap/app.php'         => $root . '/bootstrap/app.php',
    'public/index.php'          => $root . '/public/index.php',
    'resources/views/spa.blade.php' => $root . '/resources/views/spa.blade.php',
    'root .htaccess'            => $root . '/.htaccess',
);
foreach ($checks as $label => $path) {
    echo "    " . str_pad($label, 30) . (file_exists($path) ? "✔\n" : "✘ MISSING\n");
}

/* 4. Writability */
echo "\n[4] Writable:\n";
foreach (array('storage', 'storage/logs', 'storage/framework', 'bootstrap/cache', 'public/uploads') as $d) {
    $p = $root . '/' . $d;
    echo "    " . str_pad($d, 30) . (is_dir($p) ? (is_writable($p) ? "✔\n" : "✘ NOT WRITABLE (set 755)\n") : "✘ MISSING\n");
}

/* 5. .env sanity (no secrets printed) */
echo "\n[5] .env keys set:\n";
if (file_exists($root . '/.env')) {
    $env = file_get_contents($root . '/.env');
    foreach (array('APP_KEY','APP_URL','DB_DATABASE','DB_USERNAME','DB_PASSWORD','MAIL_HOST') as $k) {
        $set = preg_match('/^' . $k . '=(.+)$/m', $env, $m) && trim($m[1]) !== '' && trim($m[1]) !== 'base64:';
        echo "    " . str_pad($k, 14) . ($set ? "✔ set\n" : "✘ EMPTY\n");
    }
} else {
    echo "    ✘ .env file missing — copy .env.cpanel.example to .env and fill it in\n";
}

/* 6. Database connectivity (only if PDO + .env present) */
echo "\n[6] Database:\n";
if (isset($env) && extension_loaded('pdo_mysql')) {
    $get = function ($k) use ($env) {
        if (!preg_match('/^' . $k . '=(.*)$/m', $env, $m)) return '';
        $v = trim($m[1]);
        // Parse like Laravel/phpdotenv: quoted values are literal,
        // unquoted values lose everything from an inline # comment.
        if (strlen($v) > 1 && ($v[0] === '"' || $v[0] === "'") && substr($v, -1) === $v[0]) {
            return substr($v, 1, -1);
        }
        $v = preg_replace('/\s+#.*$/', '', $v);   // strip " # comment"
        $v = preg_replace('/#.*$/', '', $v);        // unquoted # truncates
        return trim($v);
    };
    try {
        $pdo = new PDO(
            'mysql:host=' . ($get('DB_HOST') ? $get('DB_HOST') : 'localhost') . ';dbname=' . $get('DB_DATABASE'),
            $get('DB_USERNAME'), $get('DB_PASSWORD'), array(PDO::ATTR_TIMEOUT => 4)
        );
        echo "    connection ✔\n";
        $n = $pdo->query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()')->fetchColumn();
        echo "    tables in DB: $n" . ($n > 0 ? "\n" : "  (0 = migrations not run yet)\n");
    } catch (Exception $e) {
        echo "    ✘ " . $e->getMessage() . "\n";
    }
} else {
    echo "    skipped (missing .env or pdo_mysql)\n";
}

/* 7. Composer platform check + framework boot test */
echo "\n[7] Framework boot test:\n";
if (version_compare(PHP_VERSION, '8.3.0', '>=') && file_exists($root . '/vendor/autoload.php')) {
    try {
        require $root . '/vendor/autoload.php';
        echo "    autoload ✔\n";
        $app = require $root . '/bootstrap/app.php';
        echo "    bootstrap ✔ (Laravel loads correctly)\n";
    } catch (Throwable $e) {
        echo "    ✘ " . get_class($e) . ': ' . $e->getMessage() . "\n";
        echo "      at " . $e->getFile() . ':' . $e->getLine() . "\n";
    }
} else {
    echo "    skipped (PHP too old or vendor missing — fix those first)\n";
}

/* 8. Recent error logs */
echo "\n[8] Latest application errors (message lines):\n";
$laravelLog = $root . '/storage/logs/laravel.log';
if (file_exists($laravelLog)) {
    $lines = file($laravelLog);
    $errors = array();
    foreach ($lines as $i => $line) {
        if (strpos($line, '.ERROR:') !== false || strpos($line, '.CRITICAL:') !== false) {
            $errors[] = rtrim($line);
        }
    }
    if ($errors) {
        foreach (array_slice($errors, -5) as $e) {
            echo '    ' . substr($e, 0, 400) . "\n";
        }
    } else {
        echo "    (no ERROR entries in laravel.log)\n";
    }
    echo "\n    ── last 15 raw lines of laravel.log ──\n";
    foreach (array_slice($lines, -15) as $line) {
        echo '    ' . rtrim($line) . "\n";
    }
} else {
    echo "    (storage/logs/laravel.log does not exist)\n";
}
foreach (array(__DIR__ . '/error_log', $root . '/error_log') as $log) {
    if (file_exists($log)) {
        echo "\n    ── " . $log . " (last 5 lines) ──\n";
        foreach (array_slice(file($log), -5) as $line) {
            echo '    ' . rtrim($line) . "\n";
        }
    }
}

echo "\n══════════ END — delete this file when done ══════════\n";
