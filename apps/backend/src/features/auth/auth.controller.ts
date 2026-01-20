import { Request, Response } from 'express'
import { authService } from './auth.service'
import { logger } from '../../utils/logger'

// Cookie Options
const COOKIE_OPTIONS = {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
}

export const authController = {
    signup: async (req: Request, res: Response) => {
        try {
            const user = await authService.register(req.body)
            logger.info(`Signup successful for user: ${user.username}`)
            res.status(201).json({ success: true, data: user })
        } catch (error: any) {
            logger.error(`Signup error: ${error.message}`)
            res.status(400).json({
                success: false,
                error: 'User already exists or invalid data',
            })
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const { user, accessToken, refreshToken } = await authService.login(
                email,
                password
            )

            // Send Refresh Token in HTTPOnly Cookie
            res.cookie('jwt', refreshToken, COOKIE_OPTIONS)

            // Send Access Token in JSON
            res.json({
                success: true,
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
            })
        } catch (error: any) {
            logger.warn(`Login failed for ${req.body.email}`)
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            })
        }
    },

    refresh: async (req: Request, res: Response) => {
        const cookies = req.cookies
        if (!cookies?.jwt)
            return res.status(401).json({ message: 'Unauthorized' })

        try {
            const { accessToken, refreshToken } = await authService.refresh(
                cookies.jwt
            )

            // Send new tokens
            res.cookie('jwt', refreshToken, COOKIE_OPTIONS) // Rotate cookie
            res.json({ success: true, accessToken })
        } catch (error) {
            res.clearCookie('jwt', COOKIE_OPTIONS) // Clear invalid cookie
            res.status(403).json({ message: 'Forbidden' })
        }
    },

    logout: async (req: Request, res: Response) => {
        const cookies = req.cookies
        if (cookies?.jwt) {
            await authService.logout(cookies.jwt)
            res.clearCookie('jwt', COOKIE_OPTIONS)
        }
        res.json({ success: true, message: 'Logged out' })
    },
}
