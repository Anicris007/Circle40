// Parses every .sql file in a folder with libpg-query (Postgres's own parser)
// and fails on any syntax error. This checks syntax only: it doesn't run the SQL.
//
// Usage: node check-sql.mjs <folder with node_modules/libpg-query> <migrations folder>
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [libDir, migrationsDir] = process.argv.slice(2);
if (!libDir || !migrationsDir) {
  console.error('Usage: node check-sql.mjs <libpg-query install dir> <migrations dir>');
  process.exit(2);
}

const require = createRequire(join(libDir, 'package.json'));
const lib = require('libpg-query');
await lib.loadModule?.();

const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
if (files.length === 0) {
  console.error(`No .sql files found in ${migrationsDir}`);
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const path = join(migrationsDir, file);
  try {
    const tree = await lib.parse(readFileSync(path, 'utf8'));
    console.log(`ok    ${file} (${tree.stmts.length} statements)`);
  } catch (err) {
    failed++;
    const pos = err.cursorPosition ? ` at character ${err.cursorPosition}` : '';
    console.error(`FAIL  ${file}${pos}: ${err.message}`);
  }
}

if (failed) {
  console.error(`\n${failed} of ${files.length} migration file(s) have SQL syntax errors.`);
  process.exit(1);
}
console.log(`\nAll ${files.length} migration file(s) parse cleanly.`);
