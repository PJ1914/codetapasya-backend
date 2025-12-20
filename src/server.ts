import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { firebaseAdmin } from './config/firebase.js';

const app: Application = express();
const PORT: number = 3000;

// CORS Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Ensure JSON body parsing is enabled

import assignmentRoutes from './modules/assignments/assignment.routes.js';

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express and TypeScript!');
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

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
