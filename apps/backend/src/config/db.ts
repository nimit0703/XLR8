// Import the ALREADY INSTANTIATED client from your shared package
// (Change 'db' to whatever your package is named in package.json, e.g., @repo/db)
import { prisma } from 'db'; 

export { prisma }; // Re-export it for convenience if you want

export async function connectDB() {
  try {
    // We just trigger the connection here to fail fast if DB is down
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}