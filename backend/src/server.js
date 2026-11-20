import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import 'dotenv/config';
import employeeRoutes from './routes/employees.js';

const app = express();
app.set('trust proxy', 1); // REQUIRED FOR RENDER SECURE COOKIES

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/api/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));