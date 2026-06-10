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
import errorHandler  from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Security & Utility Middlewares
app.use(helmet()); // Set secure HTTP headers

// CORS configuration supporting credentials (cookies)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true // Required to send/receive cookies cross-origin
}));

// Logger middleware configuration based on environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10kb' })); // Parse JSON bodies with limit size cap
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse browser cookies

// ES Modules directory name resolver for static serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mounting
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Open Agri Backend Running Successfully'
  });
});

app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Open-Agri agricultural marketplace backend server is online and operational.' 
  });
});

// Fallback Route (404 Not Found)
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Open-Agri server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
