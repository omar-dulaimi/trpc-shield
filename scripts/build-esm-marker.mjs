#!/usr/bin/env node
/**
 * Marks lib/esm/ as ES modules.
 *
 * The package is CommonJS at the root, so without this Node would read lib/esm/*.js as CommonJS and
 * throw on the `import` statements in them. A nested package.json scopes the module type to that
 * directory, which is what lets one tarball serve `require` and `import` from a single `tsc`
 * toolchain, with no file renaming.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const esmDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'esm');

if (!existsSync(join(esmDir, 'index.js'))) {
  console.error(`Expected an ESM build at ${esmDir}, but lib/esm/index.js is missing.`);
  process.exit(1);
}

writeFileSync(join(esmDir, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);
console.log('Marked lib/esm as ESM.');
