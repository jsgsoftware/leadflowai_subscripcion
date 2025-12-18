const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '65.21.110.250',
  port: process.env.DB_PORT || 4503,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '63166d2cc665da686f10',
  database: process.env.DB_NAME || 'leadflowai',
  ssl: false, // Ajusta según tus necesidades
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
