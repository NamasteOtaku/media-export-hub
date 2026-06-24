import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    static async analyzeUrl(targetUrl: string): Promise<ExtractionResult> {
        try {
            const platform = this.inferPlatform(targetUrl);
            
            // 1. Construct the yt-dlp execution command
            // --dump-json tells yt-dlp to extract metadata without downloading the file yet
            // --proxy allows passing your residential proxy string (e.g., http://username:password@proxy.provider.com:8000)
            const proxyString = process.env.PROXY_URL ? `--proxy ${process.env.PROXY_URL}` : '';
            const command = `yt-dlp ${proxyString} -j "${targetUrl}"`;

            // 2. Execute the binary safely within our container
            const { stdout, stderr } = await execAsync(command);

            if (stderr && !stdout) {
                throw new Error(stderr);
            }

            // 3. Parse the detailed metadata object returned by yt-dlp
            const videoData = JSON.parse(stdout);
            const assets: ExtractedAsset[] = [];

            // 4. Map the extraction formats based on availability
            if (videoData.url) {
                assets.push({
                    quality: videoData.format_note || 'Default Resolution',
                    url: videoData.url,
                    format: videoData.ext || 'mp4'
                });
            } else if (videoData.formats) {
                // Fallback: Grab the best combined video/audio format link
                const bestFormat = videoData.formats.reverse().find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none');
                if (bestFormat) {
                    assets.push({
                        quality: bestFormat.format_note || 'High Quality',
                        url: bestFormat.url,
                        format: bestFormat.ext || 'mp4'
                    });
                }
            }

            return {
                success: true,
                platform,
                mediaType: videoData.playlist ? 'image' : 'video',
                assets
            };

        } catch (error: any) {
            console.error('[Native yt-dlp Error]:', error.message);
            return {
                success: false,
                platform: 'unknown',
                mediaType: 'unknown',
                assets: [],
                error: 'Native extraction failed or request was throttled by the platform.'
            };
        }
    }

    private static inferPlatform(url: string): string {
        const hostname = new URL(url).hostname.toLowerCase();
        if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'YouTube';
        if (hostname.includes('instagram')) return 'Instagram';
        if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';
        return 'Unknown';
    }
}