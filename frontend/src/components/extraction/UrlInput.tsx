import { useState } from 'react';
import { apiService, type ExtractResponse } from '../../services/api';
import { QualitySelector } from './QualitySelector';

interface UrlInputProps {
  platformName: string;
}

export const UrlInput = ({ platformName }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResponse | null>(null);

  const handleExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await apiService.extractMedia(url);

    if (response.success) {
      setResult(response);
    } else {
      setError(response.error || 'Extraction failed.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleExtraction} className="w-full relative flex items-center shadow-subtle group z-20">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`Paste ${platformName} URL here...`}
          disabled={isLoading}
          required
          className="w-full h-16 rounded-md border border-border px-4 bg-white text-primary focus:outline-none focus:border-secondary transition-colors disabled:bg-surface disabled:text-secondary shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 h-12 px-6 bg-primary text-background font-medium rounded hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Fetch Files'}
        </button>
      </form>

      {error && (
        <div className="w-full mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md shadow-sm transition-all">
          {error}
        </div>
      )}

      {result && result.success && (
        <QualitySelector assets={result.assets} />
      )}
    </div>
  );
};