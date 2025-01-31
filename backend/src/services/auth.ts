import { Request, Response } from 'express';
import { supabase } from '../libs';

// Enhanced cookie configuration
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only require HTTPS in production
    sameSite: 'lax' as const,  // Changed from 'strict' for better compatibility
    path: '/',                 // Explicitly set path
    maxAge: 7 * 24 * 60 * 60 * 1000
};

// Function to set auth cookies and headers
const setAuthCookiesAndHeaders = (res: Response, session: any) => {
    // Set cookies
    res.cookie('access_token', session.access_token, COOKIE_OPTIONS);
    res.cookie('refresh_token', session.refresh_token, COOKIE_OPTIONS);

    // Set headers
    res.setHeader('Authorization', `Bearer ${session.access_token}`);
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
};

export const authService = {
    signUp: async (req: Request, res: Response) => {
        try {
            const { email, password, name } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (data.session) {
                setAuthCookiesAndHeaders(res, data.session);
            }

            return res.status(201).json({
                message: data.session ? 'User created and logged in' : 'Please check your email to confirm your account',
                user: data.user,
                ...(data.session && { access_token: data.session.access_token })
            });
        } catch (error) {
            console.error('Sign-up error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    signIn: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return res.status(401).json({ error: error.message });
            }

            // Set auth cookies and headers
            setAuthCookiesAndHeaders(res, data.session);

            return res.status(200).json({
                message: 'Signed in successfully',
                user: data.user,
                access_token: data.session.access_token
            });
        } catch (error) {
            console.error('Sign-in error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    refreshToken: async (req: Request, res: Response) => {
        try {
            console.log('Refresh token from cookies:', req.cookies.refresh_token);
            const refresh_token = req.cookies.refresh_token;

            if (!refresh_token) {
                return res.status(401).json({ 
                    error: 'No refresh token found' 
                });
            }

            const { data, error } = await supabase.auth.refreshSession({
                refresh_token
            });

            if (error) {
                // Clear cookies with the same options they were set with
                res.clearCookie('access_token', { ...COOKIE_OPTIONS });
                res.clearCookie('refresh_token', { ...COOKIE_OPTIONS });
                return res.status(401).json({ error: error.message });
            }

            // Set new auth cookies and headers
            setAuthCookiesAndHeaders(res, data.session);

            return res.status(200).json({
                message: 'Token refreshed successfully',
                user: data.user,
                access_token: data.session.access_token
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    signOut: async (req: Request, res: Response) => {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            // Clear cookies with the same options they were set with
            res.clearCookie('access_token', { ...COOKIE_OPTIONS });
            res.clearCookie('refresh_token', { ...COOKIE_OPTIONS });

            return res.status(200).json({ 
                message: 'Signed out successfully' 
            });
        } catch (error) {
            console.error('Sign-out error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};