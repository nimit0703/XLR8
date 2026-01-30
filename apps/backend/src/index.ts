import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { prisma } from 'db';
import { authRoutes } from './auth/routes/auth.routes';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Get absolute paths
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
console.log(`📁 Frontend path: ${frontendPath}`);

// Serve static files from frontend dist
app.use(express.static(frontendPath));

// ========== DATABASE CONNECTION TEST ==========
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// ========== API ROUTES ==========

// Health check with DB status
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'Backend is working! 🎉',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend is running but database is unavailable',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Get all users from database (protected example)
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new user
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Basic validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, username, password'
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password, // Note: In production, use bcrypt from auth controller
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler for API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.originalUrl}`
  });
});

// ========== FRONTEND CATCH-ALL ==========
app.get('*', (req: Request, res: Response) => {
  console.log(`📱 Serving frontend for: ${req.path}`);
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ========== START SERVER ==========
async function startServer() {
  await testDatabaseConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ API available at http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth API available at http://localhost:${PORT}/api/auth`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});