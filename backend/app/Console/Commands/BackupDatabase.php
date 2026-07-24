<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * NFR-4.4.3 automated backup continuity.
 *
 * Pure-PHP database dump — works on shared/cPanel hosting where
 * shell_exec()/mysqldump may be disabled. Schedule daily via cron:
 *   0 2 * * * php /path/to/backend/artisan db:backup
 */
class BackupDatabase extends Command
{
    protected $signature = 'db:backup {--keep=14 : Number of backup files to retain}';

    protected $description = 'Create a SQL (or SQLite copy) backup of the database into storage/app/backups';

    public function handle(): int
    {
        $dir = storage_path('app/backups');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $driver = DB::connection()->getDriverName();
        $stamp = now()->format('Y-m-d_His');

        if ($driver === 'sqlite') {
            $source = config('database.connections.sqlite.database');
            $target = $dir . "/backup_{$stamp}.sqlite";
            copy($source, $target);
            $this->info("SQLite backup written to {$target}");
        } else {
            $target = $dir . "/backup_{$stamp}.sql";
            $this->dumpSql($target);
            $this->info("SQL backup written to {$target}");
        }

        $this->prune($dir, (int) $this->option('keep'));

        return self::SUCCESS;
    }

    private function dumpSql(string $target): void
    {
        $handle = fopen($target, 'w');
        $database = DB::connection()->getDatabaseName();

        fwrite($handle, "-- Teddy General Trading database backup\n");
        fwrite($handle, '-- Database: ' . $database . "\n");
        fwrite($handle, '-- Generated: ' . now()->toDateTimeString() . "\n\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n\n");

        $tables = array_map(
            fn ($row) => array_values((array) $row)[0],
            DB::select('SHOW TABLES')
        );

        foreach ($tables as $table) {
            $create = (array) DB::selectOne("SHOW CREATE TABLE `{$table}`");
            $createSql = $create['Create Table'] ?? array_values($create)[1] ?? null;

            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
            if ($createSql) {
                fwrite($handle, $createSql . ";\n\n");
            }

            DB::table($table)->orderByRaw('1')->chunk(200, function ($rows) use ($handle, $table) {
                foreach ($rows as $row) {
                    $values = array_map(function ($value) {
                        if ($value === null) {
                            return 'NULL';
                        }

                        return DB::connection()->getPdo()->quote((string) $value);
                    }, (array) $row);

                    $columns = implode('`, `', array_keys((array) $row));
                    fwrite($handle, "INSERT INTO `{$table}` (`{$columns}`) VALUES (" . implode(', ', $values) . ");\n");
                }
            });

            fwrite($handle, "\n");
        }

        fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($handle);
    }

    private function prune(string $dir, int $keep): void
    {
        $files = glob($dir . '/backup_*');
        usort($files, fn ($a, $b) => filemtime($b) <=> filemtime($a));

        foreach (array_slice($files, max($keep, 1)) as $old) {
            @unlink($old);
        }
    }
}
