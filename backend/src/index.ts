import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { json } from 'body-parser';
import { authenticateToken } from './middlewares';
import { authService } from './services';

const app = express();

// Define allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

// Enhanced CORS configuration
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: [
        'Authorization',
        'access-token',
        'refresh-token',
        'x-access-token',
        'x-refresh-token'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'access-token',
        'refresh-token'
    ],
    maxAge: 86400 // 24 hours
}));

// Middleware
app.use(json());
app.use(cookieParser());

// Add security headers middleware
app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Ensure proper CORS headers for preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400');
    }
    next();
});

// Auth routes
app.post('/auth/signup', authService.signUp);
app.post('/auth/signin', authService.signIn);
app.post('/auth/refresh', authService.refreshToken);
app.post('/auth/signout', authenticateToken, authService.signOut);

// Test protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Protected route accessed successfully',
        user: req.user
    });
});

const PORT = process.env.PORT || 3002; // Changed to 3002 to match your frontend configuration
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});