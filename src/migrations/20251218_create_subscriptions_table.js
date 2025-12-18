const pool = require('../config/database');

/**
 * Migration: Create leadflow_account_subscriptions table
 * Created: 2025-12-18
 */

const up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Creating leadflow_account_subscriptions table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS leadflow_account_subscriptions (
        id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL,
        plan VARCHAR(50) NOT NULL,          -- free, starter, pro, etc
        status VARCHAR(20) NOT NULL,         -- active, expired, suspended
        started_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        trial BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT fk_account
          FOREIGN KEY (account_id)
          REFERENCES accounts(id)
          ON DELETE CASCADE
      );
    `);
    
    console.log('✓ Table leadflow_account_subscriptions created successfully');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id 
      ON leadflow_account_subscriptions(account_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
      ON leadflow_account_subscriptions(status);
    `);
    
    console.log('✓ Indexes created successfully');
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Dropping leadflow_account_subscriptions table...');
    
    await client.query(`
      DROP TABLE IF EXISTS leadflow_account_subscriptions CASCADE;
    `);
    
    console.log('✓ Table leadflow_account_subscriptions dropped successfully');
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { up, down };
