/// <reference path="./types/express.d.ts" />
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import notesRoutes from './routes/notes.routes';
import { upload } from './middleware/upload.middleware';
import swaggerUi from 'swagger-ui-express';
import { protect } from './middleware/auth.middleware';
import { User } from './models/User';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Profile Image Upload Route
app.post('/api/upload-profile', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findById(req.user._id);
    if (user) {
      user.profileImage = `/${req.file.path}`;
      await user.save();
      res.json({ message: 'Profile image updated', profileImage: user.profileImage });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Swagger Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Notes Workspace API',
    version: '1.0.0',
    description: 'API Documentation for Smart Notes Workspace',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        responses: { '201': { description: 'Created' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        responses: { '200': { description: 'Success' } }
      }
    },
    '/notes': {
      get: {
        summary: 'Get all notes',
        responses: { '200': { description: 'Success' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
