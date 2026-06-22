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
     * Orchestrates extraction via a High-Availability Dynamic Registry.
     * Bypasses deprecated APIs by fetching live, healthy community nodes.
     */
    static async analyzeUrl(targetUrl: string): Promise<ExtractionResult> {
        try {
            // 1. Query the live Cobalt instance registry
            const registryResponse = await fetch('https://instances.hyper.lol/instances.json');
            if (!registryResponse.ok) throw new Error('Registry unreachable.');
            
            // TS Strict Fix: Explicitly cast the unknown JSON response to an array
            const instances = (await registryResponse.json()) as any[];
            
            // 2. Filter for healthy instances running the modern v11+ architecture
            const onlineInstances = instances.filter((i: any) => i.api_online === true && parseFloat(i.version) >= 11);
            
            if (onlineInstances.length === 0) throw new Error('No public extraction nodes available.');

            // 3. Load balance by picking a random healthy instance
            const randomInstance = onlineInstances[Math.floor(Math.random() * onlineInstances.length)];
            const apiUrl = randomInstance.api; 

            // 4. Send the strictly formatted v11 payload
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'MediaExportHub/1.0'
                },
                body: JSON.stringify({
                    url: targetUrl,
                    videoQuality: "1080"
                })
            });

            if (!response.ok) {
                // TS Strict Fix: Explicitly cast to any to allow optional chaining
                const errData = (await response.json().catch(() => null)) as any;
                throw new Error(errData?.error?.message || 'Upstream node rejected the media request.');
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
                error: 'Failed to extract media. The upstream nodes may be overloaded or the link is invalid.'
            };
        }
    }

    private static mapDataToContract(data: any, originalUrl: string): ExtractionResult {
        const platform = this.inferPlatform(originalUrl);
        const assets: ExtractedAsset[] = [];

        // Modern v11 Schema Status Mapping
        if (data.status === 'tunnel' || data.status === 'redirect' || data.status === 'stream') {
            assets.push({
                quality: 'High Resolution',
                url: data.url,
                format: 'mp4'
            });
        } else if (data.status === 'picker') {
            data.picker.forEach((item: any, index: number) => {
                assets.push({
                    quality: item.type === 'video' ? `Video ${index + 1}` : `Image ${index + 1}`,
                    url: item.url,
                    format: item.type === 'video' ? 'mp4' : 'jpg'
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
        if (hostname.includes('tiktok')) return 'TikTok';
        return 'Unknown';
    }
}