import type { Asset } from '../../services/api';

interface QualitySelectorProps {
  assets: Asset[];
}

export const QualitySelector = ({ assets }: QualitySelectorProps) => {
  const handleDownload = (url: string, filename: string) => {
    // Secure cross-origin download execution
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    // The download attribute is a hint to the browser.
    // Effectiveness depends on the origin CDN's Content-Disposition headers.
    anchor.download = filename; 
    
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="w-full mt-6 p-4 border border-border rounded-md bg-surface text-center text-sm text-secondary">
        No downloadable assets could be extracted from this link.
      </div>
    );
  }

  return (
    <div className="w-full mt-8 flex flex-col gap-3">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
        Available Qualities
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {assets.map((asset, index) => (
          <button
            key={`${asset.quality}-${index}`}
            onClick={() => handleDownload(asset.url, `media_export_${asset.quality}.${asset.format}`)}
            className="flex items-center justify-between p-4 bg-white border border-border rounded-lg shadow-subtle hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-primary text-lg">
                {asset.quality}
              </span>
              <span className="text-xs font-medium text-secondary uppercase">
                {asset.format}
              </span>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};