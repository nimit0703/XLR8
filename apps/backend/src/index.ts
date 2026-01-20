import 'dotenv/config'
import express from 'express'
import path from 'path'
import { connectDB, prisma } from './config/db'
import { logger } from './utils/logger'
import { httpLogger } from './middleware/httpLogger'
import cookieParser from 'cookie-parser'
import { verifyJWT } from './middleware/auth.middleware'
// Import Routes
import userRoutes from './features/users/user.routes'
import healthRoutes from './features/health/health.routes'
import authRoutes from './features/auth/auth.routes'
const app = express()
const PORT = process.env.PORT || 3001

// 1. Database Connection
connectDB()

// 2. Middleware
app.use(express.json())
app.use(cookieParser())
app.use(httpLogger)

// 3. API Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use(verifyJWT)
app.use('/api/users', userRoutes)

// 4. Frontend Static Files (Production/Dist)
const __dirname = path.resolve()
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(frontendPath))

// 5. Catch-All for Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
})

// 6. Start Server
const server = app.listen(PORT, () => {
    if(process.env.NODE_ENV === 'production'){
        logger.info(`🚀 Server running on http://localhost:${PORT}`)
    }
})

// Graceful Shutdown
const shutdown = async () => {
    logger.warn('🛑 Shutting down...')
    await prisma.$disconnect()
    server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
