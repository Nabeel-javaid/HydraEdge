// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../libs/supabase';

// We define a custom interface to add the user property to Express Request
interface AuthenticatedRequest extends Request {
    user?: any;
}

// We export the middleware function directly
export async function authenticateToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }

        // Use Supabase to verify the token and get user data
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return res.status(403).json({
                error: 'Invalid token'
            });
        }

        // If token is valid, attach user to request and continue
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({
            error: 'Authentication failed'
        });
    }
}