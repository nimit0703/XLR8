import { Router } from 'express';
import { prisma } from '../../config/db';
// import { logger } from '../../utils/logger';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // ✅ FIX: Use $executeRaw. It returns an integer (0), avoiding BigInt errors.
    await prisma.$executeRaw`SELECT 1`;
    
    res.json({ 
      success: true, 
      message: 'Backend is working! 🎉', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    // ✅ LOGGING: Ensure we see the real error in the terminal
    // logger.error(`Health Check Error: ${error.message}`);
    
    res.status(500).json({ 
      success: false, 
      message: 'DB unavailable', 
      database: 'disconnected', 
      error: error.message 
    });
  }
});

export default router;