import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Application = express();
const PORT: number = 3000;

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'CodeTapasya Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

// TEMPORARY: One-time admin setup endpoint
// DELETE THIS AFTER SETTING YOURSELF AS ADMIN
app.post('/setup-admin', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await firebaseAdmin.auth().getUserByEmail(email);

    await firebaseAdmin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin'
    });

    res.json({
      success: true,
      message: 'Admin role set successfully! Please sign out and sign in again.',
      userId: user.uid,
      email: user.email
    });
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set admin role',
      error: error.message
    });
  }
});

app.use('/assignments', assignmentRoutes); // Frontend expects /assignments (no /api prefix)

// Global error handler (MUST be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  console.log(`[server]: Environment: ${config.nodeEnv}`);
  console.log(`[server]: AWS Region: ${config.aws.region}`);
});
