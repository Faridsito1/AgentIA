require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('AgentIA API is running...');
});

// Auth Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
// Google OAuth Routes
app.use('/api/google', require('./src/routes/googleRoutes'));
// Contratista Routes
app.use('/api/contratistas', require('./src/routes/contratistaRoutes'));
// Supervisor Dashboard (can be part of and/or a separate route)
// For now, these handle the major needs

// Start Cron job
const { job } = require('./src/utils/cron');
job.start();
console.log('Cron job initialized.');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
