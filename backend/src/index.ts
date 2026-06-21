import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import extractRouter from './routes/extract.ts';

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Utility Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'https://mediaexporthub.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Media Export Hub API is operational.' });
});

// Primary Routing
app.use('/api/extract', extractRouter);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Fatal Error]: ${err.message}`);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'The extraction engine encountered an unrecoverable fault.'
    });
});

// Prevent port binding conflicts in Vercel Serverless environments
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`[Server] Core extraction engine listening on port ${PORT}`);
    });
}

// Export the Express API for Vercel's serverless orchestration
export default app;
});