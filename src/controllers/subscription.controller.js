const pool = require('../config/database');

/**
 * Create a new subscription for a newly registered account
 * POST /api/v1/subscriptions
 */
const createSubscription = async (req, res) => {
  const { account_id } = req.body;

  // Validate account_id
  if (!account_id) {
    return res.status(400).json({
      success: false,
      error: 'account_id is required'
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if account already has a subscription
    const existingSubscription = await client.query(
      'SELECT id FROM leadflow_account_subscriptions WHERE account_id = $1',
      [account_id]
    );

    if (existingSubscription.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        error: 'Account already has a subscription'
      });
    }

    // Create subscription dates
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days trial

    // Insert new subscription
    const result = await client.query(
      `INSERT INTO leadflow_account_subscriptions 
        (account_id, plan, status, started_at, expires_at, trial, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [account_id, 'free', 'active', now, expiresAt, true, now, now]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating subscription:', error);
    
    // Handle foreign key constraint error
    if (error.code === '23503') {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Get subscription by account_id
 * GET /api/v1/subscriptions/:account_id
 */
const getSubscriptionByAccountId = async (req, res) => {
  const { account_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM leadflow_account_subscriptions WHERE account_id = $1',
      [account_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createSubscription,
  getSubscriptionByAccountId
};
