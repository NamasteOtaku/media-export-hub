export interface ExtractRequest {
  url: string;
}

export interface Asset {
  quality: string;
  url: string;
  format: string;
}

export interface ExtractResponse {
  success: boolean;
  platform: string;
  mediaType: 'video' | 'image' | 'audio' | 'unknown';
  assets: Asset[];
  error?: string;
}

// Connects strictly to your high-powered Hugging Face Space backend in production
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://yaardipanshu-media-extractor-api.hf.space' 
  : 'http://localhost:7860';

export const apiService = {
  async extractMedia(url: string): Promise<ExtractResponse> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API Service Error]:', error);
      return {
        success: false,
        platform: 'unknown',
        mediaType: 'unknown',
        assets: [],
        error: error instanceof Error ? error.message : 'An unexpected network error occurred.',
      };
    }
  },
};