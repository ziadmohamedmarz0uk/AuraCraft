import './globals.css';

export const metadata = {
  title: 'AuraCraft Studio Pro — Visual Brand Identity System',
  description: 'Clean, Swiss-style visual brand identity generator. Synthesize high-contrast palettes, typography pairings, and vector mark directives.',
  keywords: ['Brand Identity', 'Design Studio', 'Swiss Design', 'Color Hierarchy', 'Typography System', 'AuraCraft', 'Gemini AI'],
  authors: [{ name: 'AuraCraft Design Studio' }],
  openGraph: {
    title: 'AuraCraft Studio Pro — Visual Brand Identity System',
    description: 'Transform brand concepts into cohesive visual identity systems, color hierarchies, and typography pairings.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] antialiased flex flex-col selection:bg-blue-600 selection:text-white font-sans">
        <div className="relative z-10 flex-grow flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
