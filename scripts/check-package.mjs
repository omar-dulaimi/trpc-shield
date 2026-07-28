#!/usr/bin/env node
/**
 * Checks the package a consumer actually receives, not the working tree.
 *
 * The unit tests import from `src/`, so they pass whatever the build emits and whatever the tarball
 * contains. Every packaging defect this repo has shipped lived in that gap: 2.0.0 and 2.0.1 are
 * unloadable on npm because `"type": "module"` was declared over a CommonJS build, and 1.0.0 shipped
 * without `lib/` at all. Nothing in the repo could see it.
 *
 * So this builds, packs, installs the tarball into an empty directory, and then uses the package the
 * way consumers do: `require()` it, `import` it, and type-check against it under Node16 resolution
 * from both a CommonJS and an ESM consumer. It also asserts the tarball's file list, because
 * shipping `src/`, `test/` and `example/` is how a 124 KB tarball happens.
 *
 * Run: pnpm test:package
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const failures = [];
let workdir;

function step(message) {
  console.log(`\n→ ${message}`);
}

function pass(message) {
  console.log(`  ok    ${message}`);
}

function fail(message, detail) {
  failures.push(detail ? `${message}\n${indent(detail)}` : message);
  console.log(`  FAIL  ${message}`);
  if (detail) console.log(indent(detail));
}

function indent(text) {
  return String(text)
    .trimEnd()
    .split('\n')
    .map((line) => `        ${line}`)
    .join('\n');
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

/** Runs a command and reports the failure instead of aborting, so every check gets to run. */
function check(label, command, args, options = {}) {
  try {
    const stdout = run(command, args, options);
    pass(`${label}${stdout.trim() ? `: ${stdout.trim().split('\n').pop()}` : ''}`);
    return true;
  } catch (error) {
    const detail = [error.stdout, error.stderr].filter(Boolean).join('\n') || error.message;
    fail(label, detail);
    return false;
  }
}

/* ------------------------------------------------------------------ build & pack */

step('Building and packing');
run(pnpmCmd, ['build'], { cwd: repoRoot });
workdir = mkdtempSync(join(tmpdir(), 'trpc-shield-pkg-'));
const packDir = join(workdir, 'tarball');
mkdirSync(packDir);
run(pnpmCmd, ['pack', '--pack-destination', packDir], { cwd: repoRoot });
const tarball = join(
  packDir,
  readdirSync(packDir).find((f) => f.endsWith('.tgz')),
);
console.log(`  packed ${tarball}`);

/* ------------------------------------------------------------- tarball file list */

step('Tarball contents');
const entries = run('tar', ['-tzf', tarball])
  .split('\n')
  .filter(Boolean)
  .map((line) => line.replace(/^package\//, ''))
  .filter((line) => line && !line.endsWith('/'));

const required = ['lib/index.js', 'lib/index.d.ts', 'lib/esm/index.js', 'lib/esm/index.d.ts', 'lib/esm/package.json', 'package.json', 'README.md', 'LICENSE'];
for (const file of required) {
  if (entries.includes(file)) pass(`ships ${file}`);
  else fail(`tarball is missing ${file}`, `tarball has:\n${entries.join('\n')}`);
}

// An allowlist rather than a list of known offenders, so renaming or adding a dev file cannot
// quietly start shipping it. Without a `files` field npm falls back to shipping nearly everything,
// which is how src/, test/, example/ (including a sqlite database) and a stray lib.zip reached the
// registry. `src/` is the worst of them: editors resolve types through the sources instead of the
// emitted declarations, so consumers silently typecheck against a different compiler setup.
const allowedExact = new Set(['package.json', 'README.md', 'LICENSE']);
const strays = entries.filter((file) => !file.startsWith('lib/') && !allowedExact.has(file));
if (strays.length === 0) pass('ships nothing but lib/, package.json, README.md and LICENSE');
else fail(`tarball ships ${strays.length} file(s) that are not part of the package`, strays.join('\n'));

console.log(`  ${entries.length} files in tarball`);

/* ------------------------------------------------------ install into an empty dir */

step('Installing the tarball into an empty directory');
const consumer = join(workdir, 'consumer');
mkdirSync(consumer);
writeFileSync(
  join(consumer, 'package.json'),
  JSON.stringify({ name: 'consumer', version: '1.0.0', private: true }, null, 2),
);
run(npmCmd, ['install', tarball, '--no-audit', '--no-fund', '--loglevel=error'], { cwd: consumer });
pass('installed');

/* -------------------------------------------------------------- runtime, CommonJS */

// Exercising the middleware, not just the module load: a package can import cleanly and still be
// wired up wrong, and a dual build can hand a consumer two copies of the Rule class whose
// `instanceof` checks then disagree.
const smokeBody = (importLine) => `${importLine}

const failures = [];
function expect(label, actual, wanted) {
  if (actual === wanted) return;
  failures.push(label + ': expected ' + wanted + ', got ' + actual);
}

for (const [name, value] of Object.entries({ shield, rule, allow, deny, and, or, not, chain, race })) {
  if (value === undefined) failures.push('export ' + name + ' is undefined');
}

async function callWith(tree, type, path) {
  const middleware = shield(tree);
  return middleware({
    next: () => 'allowed',
    ctx: { user: null },
    type,
    path,
    input: {},
    getRawInput: () => ({}),
  }).then(
    (r) => (r === 'allowed' ? 'allowed' : 'denied'),
    () => 'denied',
  );
}

const isAuthed = rule()(async (ctx) => ctx.user !== null);

const results = await Promise.all([
  callWith({ query: { secret: isAuthed } }, 'query', 'secret'),
  callWith({ query: { open: allow } }, 'query', 'open'),
  callWith({ mutation: { risky: deny } }, 'mutation', 'risky'),
  callWith({ user: { query: { findMany: isAuthed } } }, 'query', 'user.findMany'),
  callWith({ query: { open: and(allow, allow) } }, 'query', 'open'),
  callWith({ query: { open: or(deny, allow) } }, 'query', 'open'),
  callWith({ query: { open: not(deny) } }, 'query', 'open'),
  callWith({ query: { open: chain(allow, allow) } }, 'query', 'open'),
  callWith({ query: { open: race(deny, allow) } }, 'query', 'open'),
]);

expect('unauthenticated query is denied', results[0], 'denied');
expect('allow rule passes', results[1], 'allowed');
expect('deny rule blocks', results[2], 'denied');
expect('namespaced rule is found', results[3], 'denied');
expect('and()', results[4], 'allowed');
expect('or()', results[5], 'allowed');
expect('not()', results[6], 'allowed');
expect('chain()', results[7], 'allowed');
expect('race()', results[8], 'allowed');

// A rule tree that cannot be reached must still be rejected, which proves validation shipped too.
let threw = false;
try {
  shield({ misplaced: isAuthed });
} catch {
  threw = true;
}
expect('invalid rule tree is rejected', threw, true);

if (failures.length) {
  console.error(failures.join('\\n'));
  process.exit(1);
}
console.log('all runtime assertions passed');
`;

step('require() from a CommonJS consumer');
// CommonJS has no top-level await, so the shared body is wrapped in an async main().
const cjsBody = smokeBody(
  "const { shield, rule, allow, deny, and, or, not, chain, race } = require('trpc-shield');",
).replace('const results = await Promise.all([', 'async function main() {\nconst results = await Promise.all([');
writeFileSync(
  join(consumer, 'smoke.cjs'),
  `${cjsBody}\n}\nmain().catch((error) => {\n  console.error(error);\n  process.exit(1);\n});\n`,
);
check('require() loads and behaves', process.execPath, ['smoke.cjs'], { cwd: consumer });

/* -------------------------------------------------------------------- runtime, ESM */

step('import from an ESM consumer');
writeFileSync(
  join(consumer, 'smoke.mjs'),
  smokeBody("import { shield, rule, allow, deny, and, or, not, chain, race } from 'trpc-shield';"),
);
check('named import loads and behaves', process.execPath, ['smoke.mjs'], { cwd: consumer });

step('The two halves agree, and rules cross between them');
// A dual package hands a consumer two copies of the library if both halves get loaded. That is only
// safe here because isRule/isLogicRule fall back to `constructor.name` when `instanceof` fails
// across copies, so this asserts the property rather than trusting it. It also pins the two halves
// to the same export list, so a build that emits only one of them cannot pass unnoticed.
writeFileSync(
  join(consumer, 'both-halves.mjs'),
  `import { createRequire } from 'node:module';
import * as esm from 'trpc-shield';

const require = createRequire(import.meta.url);
const cjs = require('trpc-shield');

const failures = [];

const esmNames = Object.keys(esm).filter((n) => n !== 'default').sort();
const cjsNames = Object.keys(cjs).sort();
if (esmNames.join(',') !== cjsNames.join(',')) {
  failures.push('export lists differ:\\n  esm: ' + esmNames.join(',') + '\\n  cjs: ' + cjsNames.join(','));
}
if (!esmNames.length) failures.push('namespace import exposes nothing');

// The rule object comes from the ESM copy; the middleware that has to recognise it comes from the
// CommonJS copy. Cross-copy \`instanceof\` is false, so this fails if the name fallbacks are lost.
const denyingRule = esm.rule()(async () => false);
const middleware = cjs.shield({ query: { secret: denyingRule } });
const outcome = await middleware({
  next: () => 'allowed',
  ctx: {},
  type: 'query',
  path: 'secret',
  input: {},
  getRawInput: () => ({}),
}).then(
  (r) => (r === 'allowed' ? 'allowed' : 'denied'),
  () => 'denied',
);
if (outcome !== 'denied') {
  failures.push('a rule built by the ESM copy was not enforced by the CommonJS copy: got ' + outcome);
}

// Logic rules cross copies too, and they are matched by a different set of constructor names.
const crossed = cjs.shield({ query: { secret: esm.and(esm.allow, denyingRule) } });
const andOutcome = await crossed({
  next: () => 'allowed',
  ctx: {},
  type: 'query',
  path: 'secret',
  input: {},
  getRawInput: () => ({}),
}).then(
  (r) => (r === 'allowed' ? 'allowed' : 'denied'),
  () => 'denied',
);
if (andOutcome !== 'denied') failures.push('a cross-copy and() was not enforced: got ' + andOutcome);

if (failures.length) {
  console.error(failures.join('\\n'));
  process.exit(1);
}
console.log('both halves export ' + esmNames.length + ' names and interoperate');
`,
);
check('CommonJS and ESM halves interoperate', process.execPath, ['both-halves.mjs'], { cwd: consumer });

/* ------------------------------------------------------------------- types resolve */

// `main` and `types` can point at files that do not exist and a consumer's `tsc` will still be
// happy if it silently falls back to `src/`. These consumers have no access to `src/`, and Node16
// resolution is the mode that actually reads the `exports` map, so a mis-declared condition fails
// here instead of in a user's editor.
const tscBin = join(repoRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');

function typecheckConsumer(label, { type, module: moduleSetting, moduleResolution }) {
  const dir = join(consumer, `ts-${label}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: `ts-${label}`, version: '1.0.0', type }, null, 2));
  writeFileSync(
    join(dir, `index.ts`),
    `import { shield, rule, allow, and } from 'trpc-shield';
import type { IRules } from 'trpc-shield';

type Context = { user: { id: string } | null };

const isAuthed = rule<Context>()(async (ctx) => ctx.user !== null);

const rules: IRules<Context> = { query: { secret: and(isAuthed, allow) } };

export const middleware = shield<Context>(rules);
`,
  );
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          module: moduleSetting,
          moduleResolution,
          target: 'es2022',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: [],
        },
        include: ['index.ts'],
      },
      null,
      2,
    ),
  );
  check(`types resolve under ${label}`, tscBin, ['--project', join(dir, 'tsconfig.json')], { cwd: dir });
}

step('Type resolution from installed consumers');
// node16 is the mode that reads the `exports` map, so a mis-declared condition fails there.
typecheckConsumer('node16-commonjs', { type: 'commonjs', module: 'node16', moduleResolution: 'node16' });
typecheckConsumer('node16-esm', { type: 'module', module: 'node16', moduleResolution: 'node16' });
// node10 ignores `exports` entirely and reads `main`/`types`, which is still the common setting in
// tRPC server projects. It is why those two fields have to stay correct alongside the map.
typecheckConsumer('node10', { type: 'commonjs', module: 'commonjs', moduleResolution: 'node10' });
// What Vite, webpack and Next.js do.
typecheckConsumer('bundler', { type: 'module', module: 'esnext', moduleResolution: 'bundler' });

/* ---------------------------------------------------------------- manifest honesty */

step('package.json entry points exist');
const manifest = JSON.parse(run('tar', ['-xzOf', tarball, 'package/package.json']));
const declaredPaths = new Set();
const collect = (value) => {
  if (typeof value === 'string' && value.startsWith('./')) declaredPaths.add(value.slice(2));
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
};
for (const field of ['main', 'module', 'types', 'typings']) {
  if (manifest[field]) declaredPaths.add(manifest[field].replace(/^\.\//, ''));
}
collect(manifest.exports);
for (const declared of [...declaredPaths].sort()) {
  if (entries.includes(declared)) pass(`${declared} exists in the tarball`);
  else fail(`declared entry point ${declared} is not in the tarball`);
}

if (manifest.type === 'module' && entries.includes('lib/index.js')) {
  // The exact defect that broke 2.0.0 and 2.0.1: a CommonJS build under an ESM type declaration.
  const indexSource = run('tar', ['-xzOf', tarball, 'package/lib/index.js']);
  if (/\b(?:module\.exports|exports\.|require\()/.test(indexSource)) {
    fail('package declares "type": "module" but lib/index.js is CommonJS, so Node refuses to load it');
  }
}

/* ------------------------------------------------------------------------ teardown */

rmSync(workdir, { recursive: true, force: true });

console.log('');
if (failures.length) {
  console.error(`${failures.length} packaging check(s) failed:\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('Package checks passed: the published tarball loads and type-checks for both module systems.');
