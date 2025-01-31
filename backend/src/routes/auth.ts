// src/routes/auth.ts
import { Router } from 'express';
import { authService } from '../services/auth';
import { authenticateToken } from '../middlewares';

const router = Router();

// Authentication Routes
router.post('/signup', authService.signUp);
router.post('/signin', authService.signIn);
router.post('/refresh', authService.refreshToken);
router.post('/signout', authenticateToken, authService.signOut);

// Optional: Password reset routes
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) throw error;

        res.json({
            message: 'Password reset instructions sent to your email'
        });
    } catch (error) {
        res.status(400).json({
            error: 'Failed to send reset instructions'
        });
    }
});

// Optional: Email verification route
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    // Implement email verification logic here
});

export default router;
