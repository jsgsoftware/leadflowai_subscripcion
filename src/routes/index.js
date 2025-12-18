const { Router } = require('express');
const exampleRouter = require('./example.routes');

const router = Router();

// Register routes
router.use('/example', exampleRouter);

module.exports = router;
