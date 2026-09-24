import './globals.css';

export const metadata = {
  title: 'AuraCraft Studio Pro — AI Visual Brand Identity Generator',
  description: 'Craft stunning, high-contrast, professional visual brand identity systems powered by Gemini AI.',
  keywords: ['Brand Identity', 'AI Design', 'Logo Generator', 'Color Palette', 'Typography', 'AuraCraft', 'Gemini AI'],
  authors: [{ name: 'AuraCraft Team' }],
  openGraph: {
    title: 'AuraCraft Studio Pro — AI Visual Brand Identity Generator',
    description: 'Transform brand concepts into visual identities, color schemes, typography pairings, and brand guidelines in seconds.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,600&family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#05070d] text-slate-100 antialiased flex flex-col selection:bg-purple-600 selection:text-white">
        <div className="relative z-10 flex-grow flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
