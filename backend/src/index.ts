import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import extractRouter from './routes/extract';

const app = express();

app.use(helmet());

// VERBOSE DEBUG: Temporarily allow all origins to rule out CORS 500s
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'API operational.' });
});

app.use('/api/extract', extractRouter);

// VERBOSE DEBUG: Global Error Handler explicitly passing stack trace to frontend
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Fatal Error]:`, err);
    res.status(500).json({
        success: false,
        error: 'Global Server Crash',
        message: err.message || 'Unknown fault',
        stack: err.stack || 'No stack trace available'
    });
});

export default app;