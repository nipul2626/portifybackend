import cors from 'cors';

/**
 * CORS Configuration
 * Allows frontend to make requests to backend
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const corsOptions = {
    origin: FRONTEND_URL, // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
};

export const corsMiddleware = cors(corsOptions);