import { Metadata } from 'next';
import Script from 'next/script';
import './embed.css';

export const metadata: Metadata = {
  title: 'TakeShape Room Scanner Embed',
  description: 'Embeddable version of the TakeShape Room Scanner for home service providers',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="embed-container">
      {children}
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        id="model-viewer"
        strategy="afterInteractive"
      />
    </div>
  );
}
