const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const connectDB    = require('./config/db');
const orderRoutes  = require('./routes/orderRoutes');
const swaggerUi    = require('swagger-ui-express');
const YAML         = require('yamljs');
const cartRoutes  = require('./routes/cartRoutes');

const app = express();
connectDB();

// Centralized error handler (must be before routes that throw)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use(cors());
app.use(express.json());

// Swagger docs
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Mount order routes
app.use('/api/orders', orderRoutes);
app.use('/api/cart',   cartRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Order Service Running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`);
});
