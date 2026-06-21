import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { MetaTags } from './components/seo/MetaTags';
import { UrlInput } from './components/extraction/UrlInput';

const PlatformPage = ({ platform, type, desc }: { platform: string, type: string, desc: string }) => (
  <div className="w-full max-w-3xl flex flex-col items-center py-12">
    <MetaTags 
      title={`${platform} ${type} Downloader`} 
      description={desc} 
      canonicalUrl={`/${platform.toLowerCase()}${type !== 'Hub' ? `/${type.toLowerCase()}` : ''}`} 
    />
    <h1 className="text-3xl font-bold mb-4 text-center">Download {platform} {type}s</h1>
    <p className="text-secondary mb-8 text-center">{desc}</p>
    
    <UrlInput platformName={platform} />
  </div>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PlatformPage platform="Universal" type="Media" desc="Extract and download media from any supported platform." />} />
        
        <Route path="/instagram" element={<PlatformPage platform="Instagram" type="Hub" desc="Download Instagram Reels, Videos, and Images securely." />} />
        <Route path="/instagram/video" element={<PlatformPage platform="Instagram" type="Video" desc="Extract standard video posts from Instagram." />} />
        <Route path="/instagram/reel" element={<PlatformPage platform="Instagram" type="Reel" desc="Download high-quality Instagram Reels." />} />
        <Route path="/instagram/image" element={<PlatformPage platform="Instagram" type="Image" desc="Download full-resolution Instagram photos." />} />

        <Route path="/youtube" element={<PlatformPage platform="YouTube" type="Hub" desc="Download YouTube Videos and Thumbnails." />} />
        <Route path="/youtube/video" element={<PlatformPage platform="YouTube" type="Video" desc="Extract YouTube videos in multiple resolutions." />} />
        <Route path="/youtube/thumbnail" element={<PlatformPage platform="YouTube" type="Thumbnail" desc="Download maximum resolution YouTube thumbnails." />} />

        <Route path="/facebook/video" element={<PlatformPage platform="Facebook" type="Video" desc="Download public Facebook videos." />} />
        <Route path="/twitter/video" element={<PlatformPage platform="Twitter" type="Video" desc="Download videos from X (Twitter)." />} />
        <Route path="/reddit/media" element={<PlatformPage platform="Reddit" type="Media" desc="Extract videos and images from Reddit posts." />} />
        <Route path="/pinterest/image" element={<PlatformPage platform="Pinterest" type="Image" desc="Download high-quality Pinterest pins." />} />
        <Route path="/threads/video" element={<PlatformPage platform="Threads" type="Video" desc="Extract videos from Threads." />} />
        <Route path="/linkedin/post" element={<PlatformPage platform="LinkedIn" type="Media" desc="Download media from LinkedIn posts." />} />
      </Routes>
    </Layout>
  );
}

export default App;