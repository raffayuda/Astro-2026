/**
 * Raw SQL migration runner.
 *
 * `drizzle-kit push` cannot be used on this database — its introspection step
 * crashes while parsing an existing CHECK constraint — so hand-written SQL in
 * `src/db/migrations/` is applied with this script instead:
 *
 *   bun db:migrate src/db/migrations/0021_add_player_photos.sql
 *
 * Each file runs inside a single transaction and is rolled back on error.
 */
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error('Usage: bun db:migrate <file.sql> [more.sql ...]');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set (checked .env.local)');
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false, ssl: 'require', max: 1 });

try {
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    console.log(`Applying ${file} ...`);
    await sql.begin((tx) => [tx.unsafe(content)]);
    console.log(`  done`);
  }
} catch (err) {
  console.error('Migration failed:', err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
