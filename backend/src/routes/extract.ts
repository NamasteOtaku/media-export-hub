import { Router, Request, Response } from 'express';
import { ExtractorService } from '../services/extractor';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'Valid URL string required.' 
            });
        }

        const extractionResult = await ExtractorService.analyzeUrl(url);

        if (!extractionResult.success) {
            return res.status(400).json(extractionResult);
        }

        return res.status(200).json(extractionResult);

    } catch (error: any) {
        // VERBOSE DEBUG: Send the exact crash data to the browser
        return res.status(500).json({
            success: false,
            error: 'Extraction Router Crash',
            message: error.message,
            stack: error.stack
        });
    }
});

export default router;