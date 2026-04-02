import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📝 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📋 Complaints endpoint: http://localhost:${PORT}/api/complaints`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});