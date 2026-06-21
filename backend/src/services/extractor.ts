import youtubedl from 'youtube-dl-exec';

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
     * Executes a headless analysis of the URL to extract direct CDN links.
     * Operates strictly in JSON-dump mode to prevent Vercel memory overflow.
     */
    static async analyzeUrl(targetUrl: string): Promise<ExtractionResult> {
        try {
            const rawData = await youtubedl(targetUrl, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: [
                    'referer:youtube.com',
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ]
            });

            return this.mapDataToContract(rawData, targetUrl);

        } catch (error: any) {
            console.error('[Extraction Service Error]:', error.message);
            
            // Handle DRM or Geo-blocks explicitly as per product requirements
            if (error.message.includes('Sign in to confirm your age') || error.message.includes('Private video')) {
                return {
                    success: false,
                    platform: 'unknown',
                    mediaType: 'unknown',
                    assets: [],
                    error: 'Content is private, age-restricted, or requires authentication. We do not bypass platform security.'
                };
            }

            return {
                success: false,
                platform: 'unknown',
                mediaType: 'unknown',
                assets: [],
                error: 'Failed to extract media. The link may be invalid or the platform changed its architecture.'
            };
        }
    }

    /**
     * Normalizes complex yt-dlp JSON output into our strict frontend API contract.
     */
    private static mapDataToContract(data: any, originalUrl: string): ExtractionResult {
        const platform = data.extractor_key || this.inferPlatform(originalUrl);
        const assets: ExtractedAsset[] = [];

        // Determine media type
        let mediaType: 'video' | 'image' | 'audio' | 'unknown' = 'unknown';
        if (data.vcodec !== 'none') mediaType = 'video';
        else if (data.acodec !== 'none') mediaType = 'audio';

        // Extract available formats safely
        if (Array.isArray(data.formats)) {
            data.formats.forEach((format: any) => {
                // Filter out broken streams and manifest files
                if (format.protocol === 'm3u8_native' || format.protocol === 'https') {
                    // Only map visually distinct qualities as requested
                    if (format.format_note || format.height) {
                        assets.push({
                            quality: format.height ? `${format.height}p` : (format.format_note || 'Standard'),
                            url: format.url,
                            format: format.ext || 'mp4'
                        });
                    }
                }
            });
        } else if (data.url) {
             // Fallback for flat image or simple single-file posts (like Instagram images)
             mediaType = data.ext === 'jpg' || data.ext === 'png' ? 'image' : 'video';
             assets.push({
                 quality: 'Original',
                 url: data.url,
                 format: data.ext || 'unknown'
             });
        }

        // De-duplicate assets by quality to maintain a clean UI selector
        const uniqueAssets = Array.from(new Map(assets.map(item => [item.quality, item])).values());

        // Sort qualities descending (e.g., 1080p -> 720p)
        uniqueAssets.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

        return {
            success: true,
            platform,
            mediaType,
            assets: uniqueAssets
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