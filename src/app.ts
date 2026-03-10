import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { connectDatabase, disconnectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import passport from './config/passport';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3001;

/**
 * MIDDLEWARE
 * Runs on every request in order
 */

// Security headers
app.use(helmet());

// CORS (allow frontend to make requests)
app.use(corsMiddleware);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

app.use(passport.initialize());

// Request logging (in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logs: GET /auth/login 200 15ms
}

/**
 * ROUTES
 */

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Auth routes
app.use('/auth', authRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

/**
 * START SERVER
 */
async function startServer() {
    try {
        // Connect to database
        await connectDatabase();

        // Start listening for requests
        app.listen(PORT, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await disconnectDatabase();
    process.exit(0);
});

// Start the server
startServer();

export default app;