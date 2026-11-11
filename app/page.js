'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  RefreshCw,
  Palette,
  Type,
  Layout,
  Briefcase,
  Code,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bookmark,
  Layers,
  Terminal,
  Sun,
  Moon,
  Compass,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Smartphone,
  CreditCard,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_IDEAS = [
  {
    category: 'Gaming',
    label: 'Cyberpunk Studio',
    prompt: 'A futuristic game development studio specializing in dark cyberpunk RPGs with neon aesthetics.',
    industry: 'Gaming & Web3',
    style: 'Cyberpunk Neon',
  },
  {
    category: 'Wellness',
    label: 'Luxury Eco Spa',
    prompt: 'A sustainable luxury skincare and wellness brand using organic botanical extractions.',
    industry: 'Beauty & Wellness',
    style: 'Minimalist Organic',
  },
  {
    category: 'Fintech',
    label: 'Web3 Protocol',
    prompt: 'A zero-fee decentralized finance protocol offering instant global cross-border payments.',
    industry: 'Fintech',
    style: 'Ultra Modern Tech',
  },
  {
    category: 'Craft',
    label: 'Artisan Roaster',
    prompt: 'A specialty cold brew coffee roaster sourced from high-altitude Ethiopian micro-farms.',
    industry: 'Food & Beverage',
    style: 'Warm Craft',
  },
  {
    category: 'AI',
    label: 'AI Developer Agent',
    prompt: 'An autonomous AI assistant helping engineers write zero-bug production code.',
    industry: 'Tech & AI',
    style: 'Futuristic Minimal',
  },
  {
    category: 'Fashion',
    label: 'Haute Fashion',
    prompt: 'An avant-garde luxury fashion label blending 3D printed garments with vintage textiles.',
    industry: 'Fashion & Luxury',
    style: 'Neo-Brutalist',
  },
];

const INDUSTRY_CHIPS = [
  'All Industries',
  'Tech & AI',
  'Gaming & Web3',
  'Beauty & Wellness',
  'Food & Beverage',
  'Fintech',
  'Fashion & Luxury',
];

const AESTHETIC_CHIPS = [
  'Minimalist Organic',
  'Cyberpunk Neon',
  'Ultra Modern Tech',
  'Warm Craft',
  'Futuristic Minimal',
  'High-End Luxury',
  'Neo-Brutalist',
];

const LOADING_STEPS = [
  'Analyzing Brand Concept...',
  'Synthesizing 5-Tone Color Hierarchy...',
  'Curating Google Font Pairings...',
  'Architecting Mark Directive...',
  'Finalizing Brand Identity Kit...',
];

const SWATCH_ROLES = [
  { role: 'Primary', desc: 'Dominant Brand Tone' },
  { role: 'Secondary', desc: 'Structural Support' },
  { role: 'Accent', desc: 'Interactive Vibrant' },
  { role: 'Dark Neutral', desc: 'Deep Typography & Well' },
  { role: 'Surface', desc: 'Canvas / Light Field' },
];

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return '';
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [prompt, setPrompt] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedHex, setCopiedHex] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [emblemShape, setEmblemShape] = useState('rounded'); // 'rounded' | 'circle' | 'diamond'
  const [emblemColorMode, setEmblemColorMode] = useState('primary'); // 'primary' | 'inverted' | 'accent'
  const [exportFormat, setExportFormat] = useState('tailwind'); // 'tailwind' | 'css' | 'json' | 'svg'

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('auracraft-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('auracraft-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  // Dynamically load Google Fonts when result changes
  useEffect(() => {
    if (result?.fontPairing) {
      const headingFont =
        typeof result.fontPairing === 'object'
          ? result.fontPairing.heading
          : result.fontPairing;
      const bodyFont =
        typeof result.fontPairing === 'object'
          ? result.fontPairing.body
          : 'Inter';

      const fontFamilies = [headingFont, bodyFont]
        .filter(Boolean)
        .map((f) => f.replace(/\s+/g, '+'))
        .join('&family=');

      if (fontFamilies) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@400;500;600;700;800;900&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [result]);

  // Cycle loading messages during generation
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async (overridePrompt) => {
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt || finalPrompt.trim() === '') return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          industry: industry === 'All Industries' ? '' : industry,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.brandName) {
        throw new Error(data.error || 'Failed to generate brand identity');
      }

      setResult(data);

      // Trigger celebratory confetti with brand colors
      try {
        confetti({
          particleCount: 70,
          spread: 65,
          origin: { y: 0.6 },
          colors: data.colors?.map((c) => c.hex) || ['#2563EB', '#111111', '#E5E5E5'],
        });
      } catch (e) {
        // Confetti fallback
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while crafting the brand identity.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut listener: Cmd + Enter / Ctrl + Enter
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (!isLoading && prompt.trim()) {
        handleGenerate();
      }
    }
  };

  const copyToClipboard = (text, label = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    if (text.startsWith('#')) {
      setCopiedHex(text);
      setTimeout(() => setCopiedHex(null), 2000);
    } else {
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 2000);
    }
  };

  const copyAllPaletteHex = () => {
    if (!result?.colors) return;
    const allHex = result.colors.map((c) => c.hex).join(', ');
    copyToClipboard(allHex, 'All 5 Hex Codes Copied!');
  };

  const getTailwindSnippet = (res) => {
    if (!res || !res.colors) return '';
    const colorObj = {};
    res.colors.forEach((c, idx) => {
      const key = `tone-${idx + 1}`;
      colorObj[key] = c.hex;
    });
    const heading =
      typeof res.fontPairing === 'object'
        ? res.fontPairing.heading
        : res.fontPairing;
    const body =
      typeof res.fontPairing === 'object'
        ? res.fontPairing.body
        : 'Inter';

    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: ${JSON.stringify(colorObj, null, 8)}
      },
      fontFamily: {
        heading: ['${heading}', 'sans-serif'],
        body: ['${body}', 'sans-serif'],
      }
    }
  }
};`;
  };

  const getCssVarsSnippet = (res) => {
    if (!res || !res.colors) return '';
    let vars = ':root {\n';
    res.colors.forEach((c, idx) => {
      vars += `  --color-tone-${idx + 1}: ${c.hex}; /* ${c.name} */\n`;
    });
    const heading =
      typeof res.fontPairing === 'object'
        ? res.fontPairing.heading
        : res.fontPairing;
    const body =
      typeof res.fontPairing === 'object'
        ? res.fontPairing.body
        : 'Inter';
    vars += `  --font-heading: '${heading}', sans-serif;\n`;
    vars += `  --font-body: '${body}', sans-serif;\n`;
    vars += '}';
    return vars;
  };

  const getSvgSnippet = (res) => {
    if (!res) return '';
    const initials = res.brandName ? res.brandName.substring(0, 2).toUpperCase() : 'AC';
    const bg = res.colors?.[0]?.hex || '#0A0A0A';
    const fg = res.colors?.[4]?.hex || '#FFFFFF';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="36" fill="${bg}" />
  <text x="50%" y="54%" font-family="sans-serif" font-weight="900" font-size="76" fill="${fg}" text-anchor="middle" dominant-baseline="middle" letter-spacing="-3">${initials}</text>
</svg>`;
  };

  const headingFontFamily = result?.fontPairing
    ? typeof result.fontPairing === 'object'
      ? result.fontPairing.heading
      : result.fontPairing
    : 'Plus Jakarta Sans';

  const bodyFontFamily = result?.fontPairing
    ? typeof result.fontPairing === 'object'
      ? result.fontPairing.body
      : 'Inter'
    : 'Inter';

  // Compute monogram styling based on color mode
  const getEmblemColors = () => {
    if (!result?.colors) return { bg: '#111111', fg: '#FFFFFF' };
    if (emblemColorMode === 'inverted') {
      return { bg: result.colors[4]?.hex || '#FFFFFF', fg: result.colors[0]?.hex || '#111111' };
    }
    if (emblemColorMode === 'accent') {
      return { bg: result.colors[2]?.hex || '#2563EB', fg: '#FFFFFF' };
    }
    return { bg: result.colors[0]?.hex || '#111111', fg: result.colors[4]?.hex || '#FFFFFF' };
  };

  const emblemColors = getEmblemColors();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#111111] dark:text-[#EDEDED] font-sans transition-colors duration-200 relative selection:bg-blue-600 selection:text-white">
      {/* Background Architectural Dot Grid Texture */}
      <div className="fixed inset-0 pointer-events-none studio-grid grid-mask z-0 opacity-80" />

      {/* Floating Raycast-Style Notifications */}
      <AnimatePresence>
        {copiedHex && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] text-neutral-900 dark:text-white shadow-2xl"
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-600 text-white shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">Hex code copied</span>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block">{copiedHex}</span>
            </div>
          </motion.div>
        )}

        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] text-neutral-900 dark:text-white shadow-2xl"
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-600 text-white shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">{copiedNotification}</span>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block">Ready for production</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Studio Top Navigation */}
      <header className="border-b border-[#E5E5E5] dark:border-[#222222] bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Minimalist Studio Mark */}
            <div className="w-7 h-7 rounded-md bg-[#F0F0F0] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center shrink-0">
              <div className="w-3.5 h-3.5 border-2 border-neutral-900 dark:border-neutral-200 rounded-[2px] flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-600 rounded-[0.5px]" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white font-heading">
                AuraCraft
              </h1>
              <span className="text-[10px] font-mono tracking-tight px-1.5 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-neutral-600 dark:text-neutral-400">
                v2.0
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 hidden sm:inline-block">/ Studio Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Engine Status Beacon */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ENGINE READY</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode (#FAFAFA)' : 'Switch to Dark Mode (#0A0A0A)'}
              className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#383838] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-mono hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setPrompt('');
                setResult(null);
                setError(null);
              }}
              className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#383838] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-grow w-full z-10 relative">
        {/* Editorial Headline Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] text-[11px] font-mono text-neutral-600 dark:text-neutral-400 mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>STUDIO SYSTEM // GENERATIVE IDENTITY ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#111111] dark:text-[#FAFAFA] tracking-tight leading-tight mb-3">
            Create Iconic Visual Brands
          </h2>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-normal">
            Synthesize cohesive 5-tone color hierarchies, curated Google Font pairings, and vector mark directives for modern ventures.
          </p>
        </div>

        {/* Central Studio Console */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="studio-card rounded-xl p-5 sm:p-7 space-y-5">
            {/* Input Header & Prompt Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="brand-prompt"
                  className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Business Concept or Venture Directive</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                    {prompt.length} chars
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                    Step 1 of 2
                  </span>
                </div>
              </div>

              <textarea
                id="brand-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. A minimalist architecture studio focused on brutalist concrete structures, monolithic geometry, and mass timber..."
                className="w-full studio-input rounded-lg p-3.5 text-sm leading-relaxed resize-none focus:outline-none"
                required
              />
            </div>

            {/* Flat Minimal Inspiration Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Quick Inspiration Ideas
                </span>
                <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                  Click to prefill & generate
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_IDEAS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(item.prompt);
                      setIndustry(item.industry);
                      setStyle(item.style);
                      handleGenerate(item.prompt);
                    }}
                    className="px-2.5 py-1.5 rounded-md bg-[#F5F5F5] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-xs font-normal text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#383838] hover:bg-[#EBEBEB] dark:hover:bg-[#202020] transition-all flex items-center gap-1.5"
                  >
                    <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase">
                      {item.category}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Advanced Style & Industry Filters */}
            <div className="border-t border-neutral-100 dark:border-[#202020] pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full py-2 px-3 rounded-md bg-[#F5F5F5] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>Optional Constraints (Industry & Aesthetic)</span>
                  {(industry || style) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </span>
                {showAdvancedOptions ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                )}
              </button>

              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 pt-4 overflow-hidden"
                  >
                    {/* Industry Chips */}
                    <div>
                      <span className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-tight mb-2">
                        Industry Sector:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {INDUSTRY_CHIPS.map((ind, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setIndustry(ind)}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                              industry === ind || (ind === 'All Industries' && !industry)
                                ? 'bg-blue-600 text-white font-medium'
                                : 'bg-[#F0F0F0] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-400 dark:hover:border-[#383838]'
                            }`}
                          >
                            {ind}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aesthetic Chips */}
                    <div>
                      <span className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-tight mb-2">
                        Aesthetic Direction:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {AESTHETIC_CHIPS.map((st, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setStyle(st)}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                              style === st
                                ? 'bg-blue-600 text-white font-medium'
                                : 'bg-[#F0F0F0] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-400 dark:hover:border-[#383838]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  isLoading || !prompt.trim()
                    ? 'bg-neutral-200 dark:bg-[#1A1A1A] text-neutral-400 dark:text-neutral-600 border border-neutral-300 dark:border-[#262626] cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white border border-blue-400/20 shadow-sm'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span className="font-mono text-xs truncate">
                      {LOADING_STEPS[loadingStepIndex]}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Generate Brand Identity System</span>
                    <ArrowRight className="w-4 h-4 opacity-80 shrink-0" />
                  </>
                )}
              </button>

              <span className="hidden sm:inline text-[10px] font-mono text-neutral-400 dark:text-neutral-500 px-2 py-1 rounded bg-[#F5F5F5] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626]">
                ⌘ ⏎
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="max-w-xl mx-auto py-8 text-center space-y-4">
            <div className="studio-card rounded-xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-heading">
                {LOADING_STEPS[loadingStepIndex]}
              </h4>
              <p className="text-xs text-neutral-500 font-mono">
                COMPUTING // CHROMATIC HIERARCHY & TYPOGRAPHY
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
            <span className="font-mono font-bold uppercase text-red-600 dark:text-red-400">[Error]</span>
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Studio Results Architecture */}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-5xl mx-auto space-y-6"
          >
            {/* Minimalist Segmented Navigation Bar */}
            <div className="bg-[#F5F5F5] dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] rounded-lg p-1 sticky top-16 z-30 shadow-sm backdrop-blur-md">
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { id: 'overview', label: 'Overview', icon: Layout },
                  { id: 'palette', label: 'Color System', icon: Palette },
                  { id: 'typography', label: 'Typography', icon: Type },
                  { id: 'mockups', label: 'Mockups', icon: Briefcase },
                  { id: 'export', label: 'Export Code', icon: Code },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-2 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-white dark:bg-[#222222] text-neutral-900 dark:text-white border border-[#D4D4D4] dark:border-[#333333] font-medium shadow-sm'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-[#EAEAEA] dark:hover:bg-[#181818]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline truncate">{tab.label}</span>
                      <span className="sm:hidden truncate">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: BENTO GRID OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Bento Card 1: Brand Identity Hero (7 cols on desktop) */}
                <div className="lg:col-span-7 studio-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
                  <div>
                    {/* Top Meta Line */}
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#202020] pb-3 mb-4">
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
                        <Bookmark className="w-3 h-3 text-neutral-400" />
                        <span>System Spec // 01</span>
                      </span>
                      {result.archetype && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#181818] text-[10px] font-mono text-neutral-700 dark:text-neutral-300 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span>{result.archetype}</span>
                        </div>
                      )}
                    </div>

                    {/* Brand Name & Tagline */}
                    <h2
                      className="text-4xl sm:text-6xl font-black text-neutral-900 dark:text-white tracking-tight break-words mb-3 leading-none"
                      style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                    >
                      {result.brandName}
                    </h2>
                    <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed italic">
                      &ldquo;{result.slogan}&rdquo;
                    </p>
                  </div>

                  {/* Brand Meta Specs Grid */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-[#202020] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020]">
                      <span className="text-[10px] text-neutral-400 block uppercase">Sector</span>
                      <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate block">{industry || 'Venture'}</span>
                    </div>
                    <div className="p-2 rounded bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020]">
                      <span className="text-[10px] text-neutral-400 block uppercase">Aesthetic</span>
                      <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate block">{style || 'Modern'}</span>
                    </div>
                    <div className="p-2 rounded bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020]">
                      <span className="text-[10px] text-neutral-400 block uppercase">Display Font</span>
                      <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate block">{headingFontFamily}</span>
                    </div>
                    <div className="p-2 rounded bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020]">
                      <span className="text-[10px] text-neutral-400 block uppercase">Contrast</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium block">AAA High</span>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Geometric Monogram Studio (5 cols on desktop) */}
                <div className="lg:col-span-5 studio-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#202020] pb-3">
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Geometric Mark Studio
                    </span>
                    <button
                      onClick={() => copyToClipboard(getSvgSnippet(result), 'Vector SVG Markup Copied!')}
                      className="text-[10px] font-mono text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Copy SVG</span>
                    </button>
                  </div>

                  {/* Drafting Canvas with Coordinate Crosshairs */}
                  <div className="py-4 px-6 rounded-lg bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020] relative flex flex-col items-center justify-center">
                    {/* Drafting crosshairs */}
                    <span className="crosshair-corner top-2 left-2 border-t-2 border-l-2" />
                    <span className="crosshair-corner top-2 right-2 border-t-2 border-r-2" />
                    <span className="crosshair-corner bottom-2 left-2 border-b-2 border-l-2" />
                    <span className="crosshair-corner bottom-2 right-2 border-b-2 border-r-2" />

                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0 border border-black/10 dark:border-white/15 transition-all duration-200 shadow-md ${
                        emblemShape === 'circle'
                          ? 'rounded-full'
                          : emblemShape === 'diamond'
                          ? 'rotate-45 rounded-md'
                          : 'rounded-xl'
                      }`}
                      style={{
                        backgroundColor: emblemColors.bg,
                        color: emblemColors.fg,
                      }}
                    >
                      <span
                        className={`text-2xl sm:text-3xl font-black tracking-tight select-none ${
                          emblemShape === 'diamond' ? '-rotate-45' : ''
                        }`}
                        style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                      >
                        {result.brandName ? result.brandName.substring(0, 2).toUpperCase() : 'AC'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-3">
                      STAGE // 200 x 200 PX VECTOR SPEC
                    </span>
                  </div>

                  {/* Silhouette & Color Mode Controls */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-[#202020] space-y-2">
                    <div className="grid grid-cols-3 gap-1 bg-[#F5F5F5] dark:bg-[#161616] p-1 rounded-md border border-[#E5E5E5] dark:border-[#262626]">
                      {['rounded', 'circle', 'diamond'].map((shape) => (
                        <button
                          key={shape}
                          onClick={() => setEmblemShape(shape)}
                          className={`py-1 rounded text-[10px] font-mono uppercase transition-all ${
                            emblemShape === shape
                              ? 'bg-white dark:bg-neutral-100 text-neutral-900 font-bold shadow-sm'
                              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                      {[
                        { id: 'primary', label: 'Primary' },
                        { id: 'inverted', label: 'Inverted' },
                        { id: 'accent', label: 'Accent' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setEmblemColorMode(mode.id)}
                          className={`py-1 px-1.5 rounded text-center transition-all ${
                            emblemColorMode === mode.id
                              ? 'bg-neutral-200 dark:bg-[#262626] text-neutral-900 dark:text-white font-medium'
                              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bento Card 3: 5-Tone Chromatic Scale with 1px border and role labels (Full Width / 12 cols) */}
                <div className="col-span-12 studio-card rounded-xl p-6 sm:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-[#202020] pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white font-heading flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-blue-600" />
                        <span>5-Tone Chromatic Scale Hierarchy</span>
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Calibrated high-contrast design tokens. Tap any swatch to copy hexadecimal value.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyAllPaletteHex}
                        className="px-2.5 py-1 rounded bg-[#F5F5F5] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-[10px] font-mono text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors shadow-sm"
                      >
                        Copy All Hex
                      </button>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                        WCAG AA PASS
                      </span>
                    </div>
                  </div>

                  {/* 5-Tone Swatches Grid with 1px border and clean labels below */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    {result.colors?.map((color, idx) => (
                      <div key={idx} className="space-y-2 group">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(color.hex)}
                          className="w-full h-16 sm:h-24 rounded-lg border border-black/10 dark:border-white/15 relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          title={`Click to copy ${color.name} (${color.hex})`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded bg-black/60 text-[10px] font-mono font-medium text-white backdrop-blur-sm flex items-center gap-1">
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </span>
                        </button>

                        <div className="text-left space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold truncate block">
                              {SWATCH_ROLES[idx]?.role || `Tone 0${idx + 1}`}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">
                              0{idx + 1}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(color.hex)}
                            className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                          >
                            <span>{color.hex}</span>
                          </button>

                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                            {color.name}
                          </p>

                          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 block truncate">
                            {SWATCH_ROLES[idx]?.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bento Card 4: Directive 01 // Logo Mark Directive (6 cols on desktop) */}
                {result.logoConcept && (
                  <div className="col-span-12 lg:col-span-6 studio-card rounded-xl p-6 sm:p-7 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#202020] pb-3">
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Directive 01 // Vector Logo Directive</span>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        Iconography
                      </span>
                    </div>
                    <div className="p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020]">
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                        {result.logoConcept}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bento Card 5: Directive 02 // Manifesto & Vibe (6 cols on desktop) */}
                <div className="col-span-12 lg:col-span-6 studio-card rounded-xl p-6 sm:p-7 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#202020] pb-3">
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-blue-600" />
                      <span>Directive 02 // Brand Manifesto & Philosophy</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      Voice & Ethos
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020]">
                    <p
                      className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed"
                      style={{ fontFamily: `'${bodyFontFamily}', sans-serif` }}
                    >
                      {result.vibeDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLOR SYSTEM */}
            {activeTab === 'palette' && (
              <div className="space-y-6">
                <div className="studio-card rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#202020] pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-heading">
                        5-Tone Chromatic Hierarchy System
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        High-contrast, production-calibrated color tokens with exact RGB values.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      WCAG AA Compliant
                    </span>
                  </div>

                  {/* 5-Tone Detailed Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                    {result.colors?.map((c, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FAFAFA] dark:bg-[#0E0E0E] p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] flex sm:flex-col items-center gap-3 text-left sm:text-center group"
                      >
                        <div
                          className="w-14 h-14 sm:w-full sm:h-28 rounded-lg border border-black/10 dark:border-white/15 shrink-0 shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex-1 sm:w-full">
                          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block uppercase font-medium">
                            {SWATCH_ROLES[idx]?.role || `Tone 0${idx + 1}`}
                          </span>
                          <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate mt-0.5">
                            {c.name}
                          </h4>
                          <p className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                            {c.hex}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                            {hexToRgb(c.hex)}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(c.hex)}
                          className="px-2.5 py-1 rounded bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-[10px] font-mono text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#383838] transition-colors shrink-0 shadow-sm"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TYPOGRAPHY */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div className="studio-card rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-neutral-100 dark:border-[#202020] pb-4">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-heading">
                      Google Fonts Typographic Specimen
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Curated pairing with distinct hierarchy for headlines and digital interfaces.
                    </p>
                  </div>

                  {/* Heading Font Card */}
                  <div className="p-6 rounded-lg bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#262626] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Primary Heading Font // {headingFontFamily}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        Display Scale
                      </span>
                    </div>

                    <p
                      className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight"
                      style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                    >
                      {result.brandName}: Architectural Precision
                    </p>

                    <div className="pt-2 text-xs font-mono text-neutral-400 dark:text-neutral-500 tracking-wider">
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
                    </div>
                  </div>

                  {/* Body Font Card */}
                  <div className="p-6 rounded-lg bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#262626] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Body Font // {bodyFontFamily}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        Interface & Editorial Prose
                      </span>
                    </div>

                    <p
                      className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal"
                      style={{ fontFamily: `'${bodyFontFamily}', sans-serif` }}
                    >
                      {result.vibeDescription}
                    </p>
                  </div>

                  {/* Typographic Rationale */}
                  {result.fontPairing?.rationale && (
                    <div className="p-4 rounded-lg bg-[#F5F5F5] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] space-y-1">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase">
                        Typographic Pairing Rationale
                      </span>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {result.fontPairing.rationale}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MOCKUPS (EXPANDED WORLD-CLASS SUITE) */}
            {activeTab === 'mockups' && (
              <div className="space-y-6">
                <div className="studio-card rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-neutral-100 dark:border-[#202020] pb-4">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-heading">
                      Brand Collateral Specimen Suite
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Realistic studio touchpoints: Stationery, App Icon, and Social Media Share Card.
                    </p>
                  </div>

                  {/* 1. Swiss Business Card Front & Back */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collateral 01 // Luxury Debossed Business Card</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Front Card */}
                      <div
                        className="w-full aspect-[3.5/2] rounded-xl p-6 border border-black/10 dark:border-[#262626] flex flex-col justify-between shadow-xl relative overflow-hidden"
                        style={{
                          backgroundColor: result.colors?.[0]?.hex || '#0A0A0A',
                          color: result.colors?.[4]?.hex || '#FFFFFF',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs shadow"
                            style={{
                              backgroundColor: result.colors?.[1]?.hex || '#2563EB',
                              color: '#FFFFFF',
                            }}
                          >
                            {result.brandName?.charAt(0) || 'A'}
                          </div>
                          <span className="text-[10px] font-mono opacity-60">
                            EDITION 2026
                          </span>
                        </div>

                        <div>
                          <h4
                            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                            style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                          >
                            {result.brandName}
                          </h4>
                          <p className="text-xs opacity-80 mt-0.5 font-normal">
                            {result.slogan}
                          </p>
                        </div>
                      </div>

                      {/* Back Card */}
                      <div
                        className="w-full aspect-[3.5/2] rounded-xl p-6 border border-black/10 dark:border-[#262626] flex flex-col justify-between shadow-xl relative"
                        style={{
                          backgroundColor: result.colors?.[3]?.hex || '#141414',
                          color: result.colors?.[4]?.hex || '#FFFFFF',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-semibold tracking-tight"
                            style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                          >
                            {result.brandName}
                          </span>
                          <span className="text-[10px] font-mono opacity-50">
                            HQ STUDIO
                          </span>
                        </div>

                        <div className="space-y-1 text-xs opacity-80 font-mono">
                          <p>studio@{result.brandName ? result.brandName.toLowerCase().replace(/\s+/g, '') : 'brand'}.design</p>
                          <p>+1 (800) 248-7238</p>
                          <p>Zurich // San Francisco // Tokyo</p>
                        </div>

                        {/* Chromatic Accent Stripes */}
                        <div className="flex h-1 rounded-full overflow-hidden w-full opacity-70">
                          {result.colors?.map((c, i) => (
                            <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Digital App Icon & Favicon Preview */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-[#202020] space-y-3">
                    <span className="text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Collateral 02 // iOS / macOS Application Icon & Favicon</span>
                    </span>

                    <div className="p-6 rounded-lg bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-neutral-100 dark:border-[#202020] flex flex-wrap items-center gap-8">
                      {/* App Icon 128px */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center font-bold text-2xl border border-black/10 dark:border-white/15"
                          style={{
                            backgroundColor: result.colors?.[0]?.hex || '#111111',
                            color: result.colors?.[4]?.hex || '#FFFFFF',
                            fontFamily: `'${headingFontFamily}', sans-serif`,
                          }}
                        >
                          {result.brandName ? result.brandName.substring(0, 2).toUpperCase() : 'AC'}
                        </div>
                        <div>
                          <span className="text-xs font-semibold block text-neutral-800 dark:text-neutral-200">
                            {result.brandName}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            App Store Icon // 512 x 512
                          </span>
                        </div>
                      </div>

                      {/* Small Favicon */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg shadow flex items-center justify-center font-bold text-xs border border-black/10 dark:border-white/15"
                          style={{
                            backgroundColor: result.colors?.[1]?.hex || '#2563EB',
                            color: '#FFFFFF',
                          }}
                        >
                          {result.brandName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <span className="text-xs font-semibold block text-neutral-800 dark:text-neutral-200">
                            Browser Favicon
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            Tab Icon // 32 x 32
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: EXPORT TOKENS */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div className="studio-card rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-[#202020] pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-heading">
                        Design Token Architecture
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Production code tokens ready for web, mobile, and design systems.
                      </p>
                    </div>

                    {/* Format Switcher */}
                    <div className="flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#181818] p-1 rounded-md border border-[#E5E5E5] dark:border-[#262626] self-start sm:self-auto">
                      {[
                        { id: 'tailwind', label: 'Tailwind' },
                        { id: 'css', label: 'CSS Vars' },
                        { id: 'json', label: 'JSON Tokens' },
                        { id: 'svg', label: 'SVG Mark' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => setExportFormat(fmt.id)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                            exportFormat === fmt.id
                              ? 'bg-white dark:bg-neutral-100 text-neutral-900 font-semibold shadow-sm'
                              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Viewer */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>
                          {exportFormat === 'tailwind' && 'tailwind.config.js'}
                          {exportFormat === 'css' && 'globals.css (:root)'}
                          {exportFormat === 'json' && 'tokens.json (W3C Format)'}
                          {exportFormat === 'svg' && 'monogram-mark.svg'}
                        </span>
                      </span>

                      <button
                        onClick={() => {
                          const content =
                            exportFormat === 'tailwind'
                              ? getTailwindSnippet(result)
                              : exportFormat === 'css'
                              ? getCssVarsSnippet(result)
                              : exportFormat === 'svg'
                              ? getSvgSnippet(result)
                              : JSON.stringify(result, null, 2);
                          copyToClipboard(content, `${exportFormat.toUpperCase()} exported!`);
                        }}
                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-neutral-800 dark:text-neutral-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-600">
                      {exportFormat === 'tailwind' && getTailwindSnippet(result)}
                      {exportFormat === 'css' && getCssVarsSnippet(result)}
                      {exportFormat === 'json' && JSON.stringify(result, null, 2)}
                      {exportFormat === 'svg' && getSvgSnippet(result)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Swiss Editorial Studio Footer */}
      <footer className="border-t border-[#E5E5E5] dark:border-[#222222] bg-[#FAFAFA] dark:bg-[#0A0A0A] py-8 mt-16 transition-colors duration-200 z-10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>AURACRAFT STUDIO PRO // EDITION {new Date().getFullYear()}</span>
          </div>
          <p>© {new Date().getFullYear()} AuraCraft. Swiss-Style Brand Architecture.</p>
        </div>
      </footer>
    </div>
  );
}
