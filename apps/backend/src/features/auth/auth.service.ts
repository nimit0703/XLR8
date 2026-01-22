import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/db' // Your shared DB instance
import { Prisma } from 'db/generated/prisma/client'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const authService = {
    // 1. Register User
    register: async (data: Prisma.UserCreateInput) => {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(data.password, salt)

        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: { id: true, email: true, username: true, role: true },
        })
    },

    // 2. Login User
    login: async (email: string, pass: string) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new Error('Invalid credentials')

        const isMatch = await bcrypt.compare(pass, user.password)
        if (!isMatch) throw new Error('Invalid credentials')

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.role)

        // Save Refresh Token to DB (allows us to revoke it later)
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        })

        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
            },
        })

        return { user, accessToken, refreshToken }
    },

    // 3. Refresh Token (The "Refetch" part)
    refresh: async (token: string) => {
        // Check if token exists in DB
        const savedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        })

        if (!savedToken || savedToken.expiresAt < new Date()) {
            throw new Error('Invalid or expired refresh token')
        }

        // Verify cryptographic signature
        const decoded = jwt.verify(token, REFRESH_SECRET) as any
        if (decoded.id !== savedToken.userId) throw new Error('Token mismatch')

        // Generate NEW tokens (Rotate them for security)
        const { accessToken: newAccess, refreshToken: newRefresh } =
            generateTokens(savedToken.userId, savedToken.user.role)

        // Replace old token in DB with new one (Rotation)
        await prisma.refreshToken.update({
            where: { id: savedToken.id },
            data: {
                token: newRefresh,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        })

        return { accessToken: newAccess, refreshToken: newRefresh }
    },

    // 4. Logout
    logout: async (token: string) => {
        await prisma.refreshToken.delete({ where: { token } }).catch(() => null)
    },
}

// Helper: Generate Tokens
function generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ id: userId, role }, ACCESS_SECRET, {
        expiresIn: '5m',
    })
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, {
        expiresIn: '7d',
    })
    return { accessToken, refreshToken }
}
