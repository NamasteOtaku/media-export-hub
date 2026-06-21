export interface ExtractedAsset {
    quality: string;
    url: string;
    format: string;
}

export interface ExtractionResult {
    success: boolean;
    platform: string;
    mediaType: 'video' | 'image' | 'audio' | 'unknown';
    assets: ExtractedAsset[];
    error?: string;
}

export class ExtractorService {
    /**
     * Orchestrates extraction via a stateless external microservice.
     * Perfectly designed for Vercel Serverless environment limits.
     */
    static async analyzeUrl(targetUrl: string): Promise<ExtractionResult> {
        try {
            // Utilizing a public open-source extraction REST proxy
            const response = await fetch('https://co.wuk.sh/api/json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    url: targetUrl,
                    vQuality: "1080",
                    isAudioOnly: false,
                    isNoTTWatermark: true
                })
            });

            if (!response.ok) {
                throw new Error('Upstream extraction proxy rejected the request.');
            }

            const data = await response.json();
            return this.mapDataToContract(data, targetUrl);

        } catch (error: any) {
            console.error('[Extraction Service Error]:', error.message);
            
            return {
                success: false,
                platform: 'unknown',
                mediaType: 'unknown',
                assets: [],
                error: 'Failed to extract media. The link may be private, invalid, or blocked by the platform.'
            };
        }
    }

    /**
     * Maps the third-party proxy data into our strict internal UI contract.
     */
    private static mapDataToContract(data: any, originalUrl: string): ExtractionResult {
        const platform = this.inferPlatform(originalUrl);
        const assets: ExtractedAsset[] = [];

        if (data.status === 'stream' || data.status === 'redirect') {
            assets.push({
                quality: 'Standard',
                url: data.url,
                format: 'mp4'
            });
        } else if (data.status === 'picker') {
            data.picker.forEach((item: any) => {
                assets.push({
                    quality: item.quality ? `${item.quality}p` : 'Standard',
                    url: item.url,
                    format: 'mp4'
                });
            });
        }

        return {
            success: true,
            platform,
            mediaType: 'video',
            assets
        };
    }

    private static inferPlatform(url: string): string {
        const hostname = new URL(url).hostname.toLowerCase();
        if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'YouTube';
        if (hostname.includes('instagram')) return 'Instagram';
        if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';
        if (hostname.includes('reddit')) return 'Reddit';
        if (hostname.includes('facebook')) return 'Facebook';
        return 'Unknown';
    }
}