<?php

namespace App\Support;

use Illuminate\Filesystem\Filesystem;

/**
 * Filesystem variant for shared/cPanel hosting.
 *
 * The stock Filesystem::replace() relies on tempnam(), which is broken on
 * some CloudLinux/CageFS PHP configurations: it falls back to the system
 * temp directory and raises a warning that Laravel escalates into a fatal
 * ErrorException — killing Blade compilation (and therefore every page).
 *
 * This implementation performs the same atomic write without tempnam().
 */
class ResilientFilesystem extends Filesystem
{
    public function replace($path, $content, $mode = null)
    {
        clearstatcache(true, $path);

        $path = realpath($path) ?: $path;

        $tempPath = dirname($path) . DIRECTORY_SEPARATOR . '.tmp-' . bin2hex(random_bytes(8));

        file_put_contents($tempPath, $content);

        @chmod($tempPath, $mode ?? (0777 - umask()));

        rename($tempPath, $path);
    }
}
