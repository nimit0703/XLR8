import express, { Request, Response } from 'express';
import path from 'path';

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

// ========== API ROUTES ==========
// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Backend is working! 🎉',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Users API
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  res.json({
    success: true,
    message: 'User created successfully',
    data: { id: Date.now(), name, email }
  });
});

// 404 handler for API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.originalUrl}`
  });
});

// ========== FRONTEND CATCH-ALL ==========
// This must be LAST - catches all non-API routes
app.get('*', (req: Request, res: Response) => {
  console.log(`📱 Serving frontend for: ${req.path}`);
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});