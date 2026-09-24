'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Palette,
  Type,
  Compass,
  Zap,
  ArrowRight,
  ShieldCheck,
  Code,
  Layout,
  Briefcase,
  CheckCircle2,
  Wand2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_IDEAS = [
  { label: '🎮 Cyberpunk Studio', prompt: 'A futuristic game development studio specializing in dark cyberpunk RPGs with neon aesthetics.', industry: 'Gaming & Web3', style: 'Cyberpunk Neon' },
  { label: '🌿 Luxury Eco Spa', prompt: 'A sustainable luxury skincare and wellness brand using organic botanical extractions.', industry: 'Beauty & Wellness', style: 'Minimalist Organic' },
  { label: '⚡ Web3 Fintech', prompt: 'A zero-fee decentralized finance protocol offering instant global cross-border payments.', industry: 'Fintech', style: 'Ultra Modern Tech' },
  { label: '☕ Artisan Coffee', prompt: 'A specialty cold brew coffee roaster sourced from high-altitude Ethiopian micro-farms.', industry: 'Food & Beverage', style: 'Warm Craft' },
  { label: '🤖 AI Developer Agent', prompt: 'An autonomous AI assistant helping engineers write zero-bug production code.', industry: 'Tech & AI', style: 'Futuristic Minimal' },
  { label: '✨ Haute Fashion', prompt: 'An avant-garde luxury fashion label blending 3D printed garments with vintage textiles.', industry: 'Fashion & Luxury', style: 'Neo-Brutalist' },
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
  'Designing Logo Mark Concept...',
  'Finalizing Brand Identity Kit...',
];

export default function Home() {
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

  // Dynamically load Google Fonts when result changes
  useEffect(() => {
    if (result?.fontPairing) {
      const headingFont = typeof result.fontPairing === 'object' ? result.fontPairing.heading : result.fontPairing;
      const bodyFont = typeof result.fontPairing === 'object' ? result.fontPairing.body : 'Inter';
      
      const fontFamilies = [headingFont, bodyFont].filter(Boolean).map(f => f.replace(/\s+/g, '+')).join('&family=');
      if (fontFamilies) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@400;600;700;800;900&display=swap`;
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

      // Trigger celebratory confetti on successful generation
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: data.colors?.map((c) => c.hex) || ['#a855f7', '#06b6d4', '#10b981'],
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

  const getTailwindSnippet = (res) => {
    if (!res || !res.colors) return '';
    const colorObj = {};
    res.colors.forEach((c, idx) => {
      colorObj[`brand-${idx + 1}`] = c.hex;
    });
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colorObj, null, 8)}\n    }\n  }\n}`;
  };

  const getCssVarsSnippet = (res) => {
    if (!res || !res.colors) return '';
    let vars = ':root {\n';
    res.colors.forEach((c, idx) => {
      vars += `  --color-brand-${idx + 1}: ${c.hex}; /* ${c.name} */\n`;
    });
    const heading = typeof res.fontPairing === 'object' ? res.fontPairing.heading : res.fontPairing;
    const body = typeof res.fontPairing === 'object' ? res.fontPairing.body : 'Inter';
    vars += `  --font-heading: '${heading}', sans-serif;\n`;
    vars += `  --font-body: '${body}', sans-serif;\n`;
    vars += '}';
    return vars;
  };

  const headingFontFamily = result?.fontPairing
    ? typeof result.fontPairing === 'object'
      ? result.fontPairing.heading
      : result.fontPairing
    : 'Outfit';

  const bodyFontFamily = result?.fontPairing
    ? typeof result.fontPairing === 'object'
      ? result.fontPairing.body
      : 'Inter'
    : 'Inter';

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden bg-[#05070d] text-slate-100 selection:bg-purple-600">
      {/* Background Radial Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-glow -top-32 -left-32 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-purple-600/15" />
        <div className="ambient-glow top-1/3 -right-32 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-cyan-500/10" />
        <div className="ambient-glow -bottom-32 left-1/3 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-indigo-600/15" />
      </div>

      {/* Floating Notifications */}
      <AnimatePresence>
        {copiedHex && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-500 text-white shadow">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Color Hex Copied!</p>
              <p className="text-xs text-purple-300 font-mono font-semibold">{copiedHex}</p>
            </div>
          </motion.div>
        )}

        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-white shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">{copiedNotification}</p>
              <p className="text-[11px] text-emerald-300">Ready for use</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Mobile-First Top Header */}
      <header className="border-b border-white/10 bg-[#070a12]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight font-heading text-white flex items-center gap-1.5">
                AuraCraft
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v2.0
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">AI Brand Identity Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPrompt('');
                setResult(null);
                setError(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-grow w-full z-10 relative">
        {/* Mobile Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-[11px] font-semibold mb-3 backdrop-blur-xl">
            <Wand2 className="w-3 h-3 text-cyan-400" />
            <span>AI Brand Identity Generator</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight leading-tight mb-2">
            Create Iconic <span className="text-gradient-primary">Visual Brands</span>
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Describe your business concept below to instantly generate colors, typography, logos, and brand guidelines.
          </p>
        </div>

        {/* SIMPLIFIED MOBILE-FIRST FORM */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />

            {/* Step 1: Concept Input Area */}
            <div>
              <label htmlFor="brand-prompt" className="block text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                <span>Business Concept or Idea</span>
                <span className="text-[10px] text-purple-400 font-mono">Step 1 of 2</span>
              </label>
              <textarea
                id="brand-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic game development studio specializing in dark cyberpunk RPGs with neon aesthetics..."
                className="w-full glass-input rounded-xl p-3.5 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition-all resize-none leading-relaxed font-sans"
                required
              />
            </div>

            {/* Quick Inspiration Preset Chips */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                💡 Quick Inspiration Ideas:
              </span>
              <div className="flex overflow-x-auto pb-1.5 scrollbar-none gap-2">
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
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:text-purple-300 hover:border-purple-500/40 whitespace-nowrap shrink-0 transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Advanced Style Filters */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Optional Style & Industry Filters</span>
                  {(industry || style) && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </span>
                {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-3 overflow-hidden"
                  >
                    {/* Industry Chips */}
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5">Target Industry:</span>
                      <div className="flex overflow-x-auto pb-1 scrollbar-none gap-1.5">
                        {INDUSTRY_CHIPS.map((ind, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setIndustry(ind)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                              industry === ind || (ind === 'All Industries' && !industry)
                                ? 'bg-purple-600 text-white font-semibold'
                                : 'bg-slate-900 border border-slate-800 text-slate-400'
                            }`}
                          >
                            {ind}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aesthetic Chips */}
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5">Desired Aesthetic:</span>
                      <div className="flex overflow-x-auto pb-1 scrollbar-none gap-1.5">
                        {AESTHETIC_CHIPS.map((st, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setStyle(st)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                              style === st
                                ? 'bg-cyan-600 text-white font-semibold'
                                : 'bg-slate-900 border border-slate-800 text-slate-400'
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

            {/* Primary Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className={`w-full py-3.5 px-5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm shadow-xl ${
                  isLoading || !prompt.trim()
                    ? 'bg-slate-850 text-slate-600 cursor-not-allowed border border-slate-800'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 active:scale-[0.99] shadow-purple-600/30 glow-purple'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span className="truncate">{LOADING_STEPS[loadingStepIndex]}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span>Generate Visual Brand Identity</span>
                    <ArrowRight className="w-4 h-4 opacity-70 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-2xl mx-auto space-y-4 py-4 text-center">
            <div className="glass-card rounded-2xl p-6 border border-purple-500/40 space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">{LOADING_STEPS[loadingStepIndex]}</h4>
              <p className="text-xs text-slate-400">Crafting custom colors, font pairings, and brand guidelines...</p>
            </div>
          </div>
        )}

        {/* RESULTS DASHBOARD: CLEAN MOBILE-FIRST NAVIGATION */}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Mobile Touch Navigation Tabs */}
            <div className="glass-card rounded-2xl p-2 border border-white/10 sticky top-18 z-30 shadow-xl backdrop-blur-xl">
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { id: 'overview', label: 'Brand', icon: Layout },
                  { id: 'palette', label: 'Colors', icon: Palette },
                  { id: 'typography', label: 'Fonts', icon: Type },
                  { id: 'mockups', label: 'Mockups', icon: Briefcase },
                  { id: 'export', label: 'Export', icon: Code },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px] truncate w-full">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: BRAND OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Brand Hero Box */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Brand Identity</span>
                    </span>
                    {result.archetype && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {result.archetype}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2
                      className="text-3xl sm:text-5xl font-black text-white tracking-tight break-words mb-2"
                      style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                    >
                      {result.brandName}
                    </h2>
                    <p className="text-base sm:text-xl font-medium text-purple-200 italic">
                      &ldquo;{result.slogan}&rdquo;
                    </p>
                  </div>

                  {/* Logo Emblem & Mark Switcher */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-16 h-16 shadow-xl flex items-center justify-center shrink-0 transition-all ${
                          emblemShape === 'circle' ? 'rounded-full' : emblemShape === 'diamond' ? 'rotate-45 rounded-md' : 'rounded-2xl'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${result.colors?.[0]?.hex || '#a855f7'}, ${result.colors?.[1]?.hex || '#06b6d4'})`,
                        }}
                      >
                        <span
                          className={`text-2xl font-black text-white ${emblemShape === 'diamond' ? '-rotate-45' : ''}`}
                          style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}
                        >
                          {result.brandName ? result.brandName.substring(0, 2).toUpperCase() : 'AC'}
                        </span>
                      </div>

                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">{result.brandName} Emblem</span>
                        <span className="text-[11px] text-slate-400 block">Tap shape to toggle:</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {['rounded', 'circle', 'diamond'].map((shape) => (
                        <button
                          key={shape}
                          onClick={() => setEmblemShape(shape)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold transition-all ${
                            emblemShape === shape ? 'bg-purple-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick 5 Color Swatch Bar */}
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-2">5-Tone Palette Swatches:</span>
                    <div className="grid grid-cols-5 gap-2">
                      {result.colors?.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => copyToClipboard(color.hex)}
                          className="h-12 rounded-xl border border-white/10 relative group overflow-hidden shadow-md"
                          style={{ backgroundColor: color.hex }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                            Copy
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Concept */}
                  {result.logoConcept && (
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 text-xs">
                      <span className="font-bold text-cyan-400 block mb-1">Logo Mark Directive:</span>
                      <p className="text-slate-300 leading-relaxed">{result.logoConcept}</p>
                    </div>
                  )}

                  {/* Vibe Description */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 text-xs">
                    <span className="font-bold text-emerald-400 block mb-1">Brand Vibe & Philosophy:</span>
                    <p className="text-slate-300 leading-relaxed font-normal" style={{ fontFamily: `'${bodyFontFamily}', sans-serif` }}>
                      {result.vibeDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLOR PALETTE */}
            {activeTab === 'palette' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-cyan-400" />
                      <span>5-Tone Color Hierarchy</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Tap to copy Hex</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {result.colors?.map((c, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 flex sm:flex-col items-center gap-3">
                        <div
                          className="w-14 h-14 sm:w-full sm:h-24 rounded-xl border border-white/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex-1 sm:w-full text-left sm:text-center">
                          <span className="text-[9px] font-mono text-purple-400 font-bold block">Tone 0{idx + 1}</span>
                          <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{c.hex}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(c.hex)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 hover:bg-purple-600 hover:text-white transition-colors"
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
              <div className="space-y-4">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-400" />
                    <span>Google Fonts Typography Pairing</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Heading Font: {headingFontFamily}</span>
                      <p className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}>
                        {result.brandName}: Visual Excellence
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Body Font: {bodyFontFamily}</span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal" style={{ fontFamily: `'${bodyFontFamily}', sans-serif` }}>
                        {result.vibeDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MOCKUPS */}
            {activeTab === 'mockups' && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">Brand Identity Mockups</h3>

                  {/* Business Card Front & Back */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 uppercase block">Business Card Preview</span>
                    <div
                      className="w-full h-40 rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col justify-between"
                      style={{ backgroundColor: result.colors?.[0]?.hex || '#0f172a' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white" style={{ fontFamily: `'${headingFontFamily}', sans-serif` }}>
                          {result.brandName}
                        </span>
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: result.colors?.[1]?.hex || '#6366f1' }}
                        >
                          {result.brandName?.charAt(0)}
                        </div>
                      </div>
                      <p className="text-xs text-purple-200 italic">{result.slogan}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white">Export Code Tokens</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400">JSON Manifest</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'JSON Manifest Copied!')}
                        className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-300 overflow-x-auto max-h-56">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070a12]/90 py-6 mt-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AuraCraft Studio Pro — Visual Brand System.</p>
        </div>
      </footer>
    </div>
  );
}
