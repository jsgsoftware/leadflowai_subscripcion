const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

// Create migrations tracking table if it doesn't exist
async function createMigrationsTable() {
  const client = await pool.connect();
  try {
    // Check if table exists and what columns it has
    const checkTable = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${MIGRATIONS_TABLE}'
      ORDER BY ordinal_position
    `);
    
    if (checkTable.rows.length === 0) {
      // Table doesn't exist, create it
      await client.query(`
        CREATE TABLE ${MIGRATIONS_TABLE} (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✓ Migrations table created');
    } else {
      // Table exists, check if it needs updates
      const columns = checkTable.rows.map(r => r.column_name);
      
      if (columns.includes('version') && !columns.includes('name')) {
        console.log('Updating migrations table: renaming version to name...');
        await client.query(`
          ALTER TABLE ${MIGRATIONS_TABLE} 
          RENAME COLUMN version TO name;
        `);
      }
      
      if (!columns.includes('executed_at')) {
        console.log('Adding executed_at column...');
        await client.query(`
          ALTER TABLE ${MIGRATIONS_TABLE} 
          ADD COLUMN executed_at TIMESTAMP DEFAULT NOW();
        `);
      }
      
      console.log('✓ Migrations table ready');
    }
  } finally {
    client.release();
  }
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name`
    );
    return result.rows.map(row => row.name);
  } finally {
    client.release();
  }
}

// Get list of migration files
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found');
    return [];
  }
  
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.js'))
    .sort();
}

// Run pending migrations
async function runMigrations() {
  console.log('Starting migrations...\n');
  
  await createMigrationsTable();
  
  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = getMigrationFiles();
  
  const pendingMigrations = migrationFiles.filter(
    file => !executedMigrations.includes(file)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('✓ No pending migrations');
    return;
  }
  
  console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);
  
  for (const file of pendingMigrations) {
    const migrationPath = path.join(MIGRATIONS_DIR, file);
    const migration = require(migrationPath);
    
    console.log(`Running migration: ${file}`);
    
    try {
      await migration.up();
      
      // Record migration as executed
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
          [file]
        );
      } finally {
        client.release();
      }
      
      console.log(`✓ Migration ${file} completed\n`);
    } catch (error) {
      console.error(`✗ Migration ${file} failed:`, error.message);
      throw error;
    }
  }
  
  console.log('✓ All migrations completed successfully');
}

// Rollback last migration
async function rollbackMigration() {
  console.log('Rolling back last migration...\n');
  
  const executedMigrations = await getExecutedMigrations();
  
  if (executedMigrations.length === 0) {
    console.log('No migrations to rollback');
    return;
  }
  
  const lastMigration = executedMigrations[executedMigrations.length - 1];
  const migrationPath = path.join(MIGRATIONS_DIR, lastMigration);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`✗ Migration file not found: ${lastMigration}`);
    return;
  }
  
  const migration = require(migrationPath);
  
  console.log(`Rolling back: ${lastMigration}`);
  
  try {
    await migration.down();
    
    // Remove migration from tracking table
    const client = await pool.connect();
    try {
      await client.query(
        `DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1`,
        [lastMigration]
      );
    } finally {
      client.release();
    }
    
    console.log(`✓ Migration ${lastMigration} rolled back successfully`);
  } catch (error) {
    console.error(`✗ Rollback failed:`, error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'up':
        await runMigrations();
        break;
      case 'down':
        await rollbackMigration();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run migrate:up   - Run pending migrations');
        console.log('  npm run migrate:down - Rollback last migration');
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigrations, rollbackMigration };
