const { Router } = require('express');
const exampleRouter = require('./example.routes');
const subscriptionRouter = require('./subscription.routes');

const router = Router();

// Register routes
router.use('/example', exampleRouter);
router.use('/subscriptions', subscriptionRouter);

module.exports = router;
