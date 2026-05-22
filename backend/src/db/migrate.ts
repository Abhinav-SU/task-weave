import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { pool } from './index';

async function runMigrationFile(filePath: string): Promise<void> {
  const sql = await readFile(filePath, 'utf-8');
  if (!sql.trim()) {
    return;
  }

  console.log(`Applying migration: ${path.basename(filePath)}`);
  await pool.query(sql);
}

async function migrate(): Promise<void> {
  const backendRoot = path.resolve(process.cwd());
  const initPath = path.join(backendRoot, 'init.sql');
  const migrationsDir = path.join(backendRoot, 'migrations');

  try {
    await runMigrationFile(initPath);

    const migrationFiles = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      await runMigrationFile(path.join(migrationsDir, file));
    }

    console.log('Database migration completed successfully.');
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
