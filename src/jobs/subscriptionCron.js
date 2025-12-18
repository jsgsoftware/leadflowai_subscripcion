const cron = require('node-cron');
const pool = require('../config/database');

/**
 * CronJob to check and expire subscriptions
 * Runs every minute
 */
const checkExpiredSubscriptions = cron.schedule('* * * * *', async () => {
  try {
    console.log('Running expired subscriptions check...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Find all active subscriptions that have expired
      const result = await client.query(
        `UPDATE leadflow_account_subscriptions 
         SET status = 'expired', updated_at = NOW()
         WHERE status = 'active' 
         AND expires_at < NOW()
         RETURNING id, account_id, plan, expires_at`
      );
      
      if (result.rows.length > 0) {
        console.log(`✓ Expired ${result.rows.length} subscription(s):`);
        
        // Update accounts status to suspended (1) for each expired subscription
        for (const sub of result.rows) {
          await client.query(
            `UPDATE accounts 
             SET status = 1, updated_at = NOW()
             WHERE id = $1`,
            [sub.account_id]
          );
          
          console.log(`  - Account ${sub.account_id} (ID: ${sub.id}) - Plan: ${sub.plan} - Expired at: ${sub.expires_at} - Account suspended`);
        }
      } else {
        console.log('✓ No subscriptions expired');
      }
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "America/New_York" // Ajusta según tu zona horaria
});

/**
 * Start the cron job
 */
const startCronJobs = () => {
  console.log('Starting cron jobs...');
  checkExpiredSubscriptions.start();
  console.log('✓ Expired subscriptions checker started (runs every minute)');
};

/**
 * Stop the cron job
 */
const stopCronJobs = () => {
  console.log('Stopping cron jobs...');
  checkExpiredSubscriptions.stop();
  console.log('✓ Cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  checkExpiredSubscriptions
};
