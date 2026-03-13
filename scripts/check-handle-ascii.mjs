/**
 * check-handle-ascii.mjs
 *
 * Reads scripts/handles-full.txt (and the other handles-*.txt files) produced
 * by test-handles.mjs and prints any handles that contain non-ASCII characters
 * (e.g. Cyrillic, encoded chars, spaces, etc.).
 *
 * If the output files don't exist yet, runs against Shopify directly.
 *
 * Usage:
 *   node scripts/check-handle-ascii.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const FILES = [
  'scripts/handles-full.txt',
  'scripts/handles-no-type.txt',
  'scripts/handles-no-vendor.txt',
  'scripts/handles-title-only.txt',
];

const ASCII_ONLY = /^[\x00-\x7F]+$/;

const bad = [];

let found = false;
for (const file of FILES) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;
  found = true;

  const lines = readFileSync(path, 'utf-8').split('\n').slice(1); // skip header
  for (const line of lines) {
    if (!line.trim()) continue;
    const handle = line.split('\t')[0];
    if (!ASCII_ONLY.test(handle)) {
      bad.push({ handle, file });
    }
  }
}

if (!found) {
  console.error('No handles-*.txt files found. Run `node scripts/test-handles.mjs` first to generate them.');
  process.exit(1);
}

if (bad.length === 0) {
  console.log('✓ All handles are ASCII-only. No issues found.');
} else {
  console.log(`✗ ${bad.length} handle(s) contain non-ASCII characters:\n`);
  for (const { handle, file } of bad) {
    const encoded = [...handle].map(c => c.charCodeAt(0) > 127 ? `[U+${c.charCodeAt(0).toString(16).toUpperCase()}]` : c).join('');
    console.log(`  ${handle}`);
    console.log(`    encoded: ${encoded}`);
    console.log(`    source:  ${file}`);
    console.log();
  }
  console.log('Fix: In Shopify Admin, update each product handle to use only a-z, 0-9, and hyphens.');
}
