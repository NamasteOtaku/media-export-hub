import { Router, Request, Response } from 'express';
import { ExtractorService } from '../services/extractor';

const router = Router();

interface ExtractRequest {
    url: string;
}

router.post('/', async (req: Request<{}, {}, ExtractRequest>, res: Response) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                platform: 'unknown',
                mediaType: 'unknown',
                assets: [],
                error: 'A valid URL string is required.'
            });
        }

        // Validate basic URL construct to prevent injection attacks
        new URL(url); 

        // Hand off to the advanced service layer
        const extractionResult = await ExtractorService.analyzeUrl(url);

        if (!extractionResult.success) {
            return res.status(400).json(extractionResult);
        }

        return res.status(200).json(extractionResult);

    } catch (error) {
        return res.status(500).json({
            success: false,
            platform: 'unknown',
            mediaType: 'unknown',
            assets: [],
            error: 'Invalid URL format provided.'
        });
    }
});

export default router;