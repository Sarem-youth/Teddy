/**
 * Copies the compiled React build into the Laravel backend:
 *   - dist/index.html        -> backend/resources/views/spa.blade.php
 *   - dist/assets/*          -> backend/public/assets/
 *   - dist/*.{svg,ico,png}   -> backend/public/
 *
 * Usage:  npm run build && npm run deploy:backend
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, '..');
const dist = join(frontendRoot, 'dist');
const backend = resolve(frontendRoot, '..', 'backend');

if (!existsSync(dist)) {
  console.error('✗ dist/ not found — run "npm run build" first.');
  process.exit(1);
}

if (!existsSync(backend)) {
  console.error(`✗ Laravel backend not found at ${backend}`);
  process.exit(1);
}

// 1. index.html -> spa.blade.php
const viewsDir = join(backend, 'resources', 'views');
mkdirSync(viewsDir, { recursive: true });
copyFileSync(join(dist, 'index.html'), join(viewsDir, 'spa.blade.php'));
console.log('✓ index.html -> resources/views/spa.blade.php');

// 2. assets -> public/assets (replace stale bundles)
const targetAssets = join(backend, 'public', 'assets');
rmSync(targetAssets, { recursive: true, force: true });
cpSync(join(dist, 'assets'), targetAssets, { recursive: true });
console.log('✓ assets -> public/assets');

// 3. root static files (favicon etc.)
for (const entry of readdirSync(dist, { withFileTypes: true })) {
  if (entry.isFile() && entry.name !== 'index.html') {
    copyFileSync(join(dist, entry.name), join(backend, 'public', entry.name));
    console.log(`✓ ${entry.name} -> public/${entry.name}`);
  }
}

console.log('\n✔ Frontend deployed into the Laravel backend. Ship backend/ to your server.');
