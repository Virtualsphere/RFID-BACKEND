import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// The deployed server keeps its .env outside the repo. Fall back to a local
// .env so `npm run dev` works on a developer machine too — the hardcoded
// absolute path silently loaded nothing off-server, leaving MONGO_URI undefined.
const deployedEnvPath = '/home/indiarfidshop/rfid_backend/RFID-BACKEND/.env';
dotenv.config({
  path: fs.existsSync(deployedEnvPath)
    ? deployedEnvPath
    : path.join(__dirname, '../.env'),
});

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';
import connectDB from './config/db';

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins as string[], credentials: true }));

// gzip every compressible response. /api/products is ~94 KB of JSON (40 KB of
// it rich-text HTML) and was going out uncompressed on every single request.
app.use(compression());

app.use(express.json());

// Serve uploaded images.
//
// Filenames embed an upload timestamp and are never rewritten, so the bytes at
// a given URL can't change — they're safe to mark immutable. Without these
// headers every page view re-downloaded every product photo (~500 KB each),
// which is a large part of why images appeared blank under load.
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1y',
    immutable: true,
    etag: true,
    lastModified: true,
  })
);

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
