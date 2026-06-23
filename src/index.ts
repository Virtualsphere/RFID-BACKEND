import dotenv from 'dotenv';
dotenv.config({ path: '/home/indiarfidshop/rfid_backend/RFID-BACKEND/.env' });

import express from 'express';
import cors from 'cors';
import routes from './routes';
import connectDB from './config/db';

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5000;

import path from 'path';

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins as string[], credentials: true }));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check routes
app.get('/', (req, res) => {
  res.send('Welcome to RFID Server');
});

app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

// Routes
app.use('/api', routes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
