import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import 'dotenv/config';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import reportRoutes from './routes/reports.js';
import tlbRoutes from './routes/tlb.js';

const app = express();
app.set('trust proxy', 1); 

app.use(cors({ 
  origin: process.env.CORS_ORIGIN, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tlb', tlbRoutes);

app.get('/api/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));