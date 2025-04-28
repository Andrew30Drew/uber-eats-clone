// backend/order-service/app.js
const path          = require('path');
const express       = require('express');
const cors          = require('cors');
require('dotenv').config();

const connectDB     = require('./config/db');
const routes        = require('./routes');                   // ← index.js in /routes
const swaggerUi     = require('swagger-ui-express');
const YAML          = require('yamljs');
const swaggerDoc    = YAML.load(path.join(__dirname, 'swagger.yaml'));

const app = express();

// 1) connect to Mongo
connectDB();

// 2) parse & CORS
app.use(cors());
app.use(express.json());

// 3) Swagger UI (must come *before* your API mounts)
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, { explorer: true })
);

// 4) your API routes all live under /api
app.use('/api', routes);

// 5) healthchecks
app.get('/health', (_req, res) => res.json({ status: 'healthy' }));
app.get('/',      (_req, res) => res.send('Order Service Running'));

// 6) start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
