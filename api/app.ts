import express from 'express';
import cors from 'cors';
import recommendationRoute from './routes/recommendation';
import errorHandler from './middlewares/errorHandler';

const app = express();

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[]
  : [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3000'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/v1/recommendation', recommendationRoute);
app.use(errorHandler);

export default app;