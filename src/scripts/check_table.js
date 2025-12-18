const pool = require('../config/database');

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'schema_migrations' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in schema_migrations:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();
