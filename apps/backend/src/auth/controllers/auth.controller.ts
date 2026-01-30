import { Request, Response } from 'express'
import { prisma } from 'db'
import bcrypt from 'bcrypt'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/tokens'
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from '../utils/validators'

export class AuthController {
    // Register new user
    static async register(req: Request, res: Response) {
        try {
            // Validate request body
            const validatedData = registerSchema.parse(req.body)

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: validatedData.email },
                        { username: validatedData.username },
                    ],
                },
            })

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User with this email or username already exists',
                })
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(validatedData.password, 10)

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: validatedData.email,
                    username: validatedData.username,
                    password: hashedPassword,
                    role: validatedData.role || 'USER',
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            })

            // Generate tokens
            const accessToken = generateAccessToken(user)
            const refreshToken = await generateRefreshToken(user.id)

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                },
            })
        } catch (error) {
            console.error('Registration error:', error)

            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: JSON.parse(error.message),
                })
            }

            res.status(500).json({
                success: false,
                error: 'Failed to register user',
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    // Login user
    static async login(req: Request, res: Response) {
        try {
            const validatedData = loginSchema.parse(req.body)

            // Find user
            const user = await prisma.user.findUnique({
                where: { email: validatedData.email },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    password: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                },
            })

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                })
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    error: 'Account is deactivated',
                })
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(
                validatedData.password,
                user.password
            )
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                })
            }

            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            })

            // Generate tokens
            const accessToken = generateAccessToken({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            })
            const refreshToken = await generateRefreshToken(user.id)

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        isActive: user.isActive,
                    },
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                },
            })
        } catch (error) {
            console.error('Login error:', error)

            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: JSON.parse(error.message),
                })
            }

            res.status(500).json({
                success: false,
                error: 'Failed to login',
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    // Refresh token
    static async refreshToken(req: Request, res: Response) {
        try {
            const validatedData = refreshTokenSchema.parse(req.body)

            // Verify refresh token
            const payload = verifyRefreshToken(validatedData.refreshToken)

            if (!payload) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid refresh token',
                })
            }

            // Check if token exists in database
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: validatedData.refreshToken },
                include: { user: true },
            })

            if (!storedToken || storedToken.expiresAt < new Date()) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token expired or invalid',
                })
            }

            // Generate new access token
            const accessToken = generateAccessToken({
                id: storedToken.user.id,
                email: storedToken.user.email,
                username: storedToken.user.username,
                role: storedToken.user.role,
            })

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken,
                },
            })
        } catch (error) {
            console.error('Refresh token error:', error)

            if (error instanceof Error && error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: JSON.parse(error.message),
                })
            }

            res.status(500).json({
                success: false,
                error: 'Failed to refresh token',
            })
        }
    }

    // Logout
    static async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body

            if (refreshToken) {
                // Delete the refresh token from database
                await prisma.refreshToken.deleteMany({
                    where: { token: refreshToken },
                })
            }

            res.json({
                success: true,
                message: 'Logout successful',
            })
        } catch (error) {
            console.error('Logout error:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to logout',
            })
        }
    }

    // Get current user profile
    static async getProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated',
                })
            }

            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                })
            }

            res.json({
                success: true,
                data: user,
            })
        } catch (error) {
            console.error('Get profile error:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch profile',
            })
        }
    }
}
