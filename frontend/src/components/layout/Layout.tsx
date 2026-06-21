import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Placeholder */}
      <header className="w-full h-16 border-b border-border flex items-center justify-between px-6 bg-white shadow-subtle z-10">
        <div className="font-bold text-xl tracking-tight text-primary">Media Export Hub</div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-secondary">
          <span>Supported Platforms</span>
          <span>How It Works</span>
          <span>Privacy</span>
        </nav>
      </header>

      {/* TopBannerAd Placeholder */}
      <div className="w-full h-24 bg-surface flex items-center justify-center text-xs text-secondary border-b border-border">
        [ TopBannerAd Space - 728x90 ]
      </div>

      <main className="flex-grow flex flex-col items-center p-6 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* BottomAd Placeholder */}
      <div className="w-full h-24 bg-surface flex items-center justify-center text-xs text-secondary border-t border-border mt-auto">
        [ BottomAd Space - 728x90 ]
      </div>
      
      <footer className="py-6 text-center text-xs text-secondary border-t border-border">
        Your files never leave your browser unless you explicitly choose to download or process them.
      </footer>
    </div>
  );
};