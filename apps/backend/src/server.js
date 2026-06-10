import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// ── Model registration (must happen before routes use populate) ──
import './models/User.js';
import './models/Category.js';
import './models/Product.js';
import './models/Order.js';
import './models/CMS.js';
import './models/Enquiry.js';
import './models/Settings.js';

import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://agriproject-frontend.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const origins = [...allowedOrigins];
      if (process.env.CLIENT_URL) {
        const urls = process.env.CLIENT_URL.split(',').map((url) => url.trim());
        origins.push(...urls);
      }

      if (origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ES Modules directory resolver
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ================================
// ROOT ROUTE (IMPORTANT FOR RENDER)
// ================================
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Open Agri Backend Running Successfully',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ================================
// HEALTH CHECK ROUTE
// ================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message:
      'Open-Agri agricultural marketplace backend server is online and operational.',
  });
});

// ================================
// API ROUTES
// ================================
app.use('/api', apiRoutes);

// ================================
// 404 HANDLER
// ================================
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// ================================
// GLOBAL ERROR HANDLER
// ================================
app.use(errorHandler);

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Open-Agri server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});
