const express = require('express');
const dotenv = require('dotenv');
const mainRouter = require('./routes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Main router
app.use('/api/v1', mainRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
