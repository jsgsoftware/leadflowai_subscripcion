const express = require('express');
const router = express.Router();
const { 
  createSubscription, 
  getSubscriptionByAccountId 
} = require('../controllers/subscription.controller');

// Create new subscription (when user registers)
router.post('/', createSubscription);

// Get subscription by account_id
router.get('/:account_id', getSubscriptionByAccountId);

module.exports = router;
