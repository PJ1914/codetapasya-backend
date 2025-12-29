import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Application = express();
const PORT: number = config.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'CodeTapasya Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

// Global error handler (MUST be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  console.log(`[server]: Environment: ${config.nodeEnv}`);
  console.log(`[server]: AWS Region: ${config.aws.region}`);
});