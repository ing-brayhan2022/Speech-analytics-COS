import express from 'express';
import dotenv from 'dotenv';
import pino from 'pino';
import uploadRoutes from './routes/upload';
import transcribeRoutes from './routes/transcribe';
import scoreRoutes from './routes/score';
import reportRoutes from './routes/report';
import healthRoutes from './routes/health';
import path from 'path';

dotenv.config();

const app = express();
const logger = pino();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(uploadRoutes);
app.use(transcribeRoutes);
app.use(scoreRoutes);
app.use(reportRoutes);
app.use(healthRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Server running on port ${port}`));
