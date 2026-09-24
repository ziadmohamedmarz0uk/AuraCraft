import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let prompt = '';
  let industry = '';
  let style = '';

  try {
    const body = await request.json();
    prompt = body.prompt || '';
    industry = body.industry || '';
    style = body.style || '';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return smart fallback if GEMINI_API_KEY is missing
      const fallbackData = generateFallbackBrand({ prompt, industry, style });
      return NextResponse.json(fallbackData);
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are AuraCraft, an elite AI Brand Strategist and Creative Director.
Your task is to craft an exceptional, cohesive, and modern visual brand identity system based on the user's business concept.

User Concept: "${prompt.trim()}"
${industry ? `Target Industry: ${industry}` : ''}
${style ? `Desired Aesthetic: ${style}` : ''}

CRITICAL: You MUST respond ONLY with a raw, valid JSON object without any backticks, markdown wrapper, or explanatory text.

The JSON response MUST strictly follow this exact structure:
{
  "brandName": "Distinctive, evocative brand name",
  "slogan": "Impactful brand slogan or tagline",
  "colors": [
    { "hex": "#HEX1", "name": "Primary Dominant Color Name" },
    { "hex": "#HEX2", "name": "Secondary Brand Color Name" },
    { "hex": "#HEX3", "name": "Vibrant Accent Color Name" },
    { "hex": "#HEX4", "name": "Deep Dark Neutral Color Name" },
    { "hex": "#HEX5", "name": "Light Crisp Background/Surface Color Name" }
  ],
  "fontPairing": {
    "heading": "Popular Google Font for Headings (e.g., Space Grotesk, Syne, Outfit, Playfair Display)",
    "body": "Popular Google Font for Body Text (e.g., Inter, Plus Jakarta Sans, DM Sans)",
    "rationale": "Brief rationale explaining why this typography combination reinforces the brand character"
  },
  "vibeDescription": "A rich 2-3 sentence overview describing the emotional tone, visual vibe, design philosophy, and customer experience of this brand identity.",
  "archetype": "Brand Archetype (e.g. The Creator, The Visionary, The Hero, The Innovator)",
  "logoConcept": "Visual description of a minimalistic, iconic symbol/mark representing the brand concept"
}

Requirements:
1. "colors" MUST be an array of 5 color objects, each with valid 6-digit hex format starting with '#' (e.g., '#0F172A').
2. Select colors with harmonious visual contrast tailored to the user's prompt.
3. Ensure font names correspond to high quality Google Fonts.`;

    // Candidate models to attempt in order of preference
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
    ];

    let response = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: systemInstruction,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) break;
      } catch (err) {
        console.warn(`Attempt with model ${modelName} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Failed to generate response with candidate models');
    }

    let text = response.text || '';
    text = text.trim();

    // Sanitize in case Gemini wrapped output in ```json ... ```
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Gemini Brand Generation Error:', error);

    // Smart Fallback Brand Identity Engine if API Key has permissions or validity issue
    try {
      if (prompt && prompt.trim() !== '') {
        const fallbackData = generateFallbackBrand({ prompt, industry, style });
        return NextResponse.json(fallbackData);
      }
    } catch (fbErr) {
      console.error('Fallback generation error:', fbErr);
    }

    let message = error.message || 'An error occurred while generating the brand identity';
    
    if (
      error.status === 403 ||
      message.includes('403') ||
      message.includes('PERMISSION_DENIED') ||
      message.includes('denied access')
    ) {
      message = 'Your GEMINI_API_KEY has been denied access by Google (403 Forbidden). Please generate a new key at https://aistudio.google.com/ and update GEMINI_API_KEY in .env.local';
    }

    return NextResponse.json(
      { error: message },
      { status: error.status || 500 }
    );
  }
}

function generateFallbackBrand({ prompt, industry, style }) {
  const p = ((prompt || '') + ' ' + (industry || '') + ' ' + (style || '')).toLowerCase();
  
  const words = prompt.trim().split(/\s+/);
  const mainWord = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Aura';

  let brandName = `${mainWord} Craft`;
  let slogan = "Elevating Vision into Visual Essence";
  let colors = [
    { hex: "#0F172A", name: "Midnight Onyx" },
    { hex: "#6366F1", name: "Electric Indigo" },
    { hex: "#06B6D4", name: "Cyber Cyan" },
    { hex: "#F8FAFC", name: "Crisp Snow" },
    { hex: "#334155", name: "Slate Shadow" }
  ];
  let fontPairing = {
    heading: "Space Grotesk",
    body: "Inter",
    rationale: "Space Grotesk provides a modern, high-tech architectural feel for headings while Inter delivers maximum legibility across digital interfaces."
  };
  let archetype = "The Visionary";
  let logoConcept = "A geometric icon combining sharp isometric lines with glowing gradient accents, representing innovation and forward movement.";
  let vibeDescription = "An ultra-sleek, forward-thinking visual system designed to establish immediate market authority and modern digital elegance.";

  if (p.includes('cyber') || p.includes('game') || p.includes('dev') || p.includes('code') || p.includes('ai') || p.includes('tech') || p.includes('software')) {
    brandName = `${mainWord} Synthetics`;
    slogan = "Architecting Next-Gen Digital Futures";
    colors = [
      { hex: "#0A0C10", name: "Deep Obsidian" },
      { hex: "#00F0FF", name: "Neon Cyber Cyan" },
      { hex: "#7000FF", name: "Ultra Violet Accent" },
      { hex: "#121824", name: "Dark Tech Canvas" },
      { hex: "#E2E8F0", name: "Holographic Platinum" }
    ];
    fontPairing = {
      heading: "Syne",
      body: "Plus Jakarta Sans",
      rationale: "Syne conveys avant-garde technological craftsmanship, complemented by Plus Jakarta Sans for clean executive communication."
    };
    archetype = "The Creator / Innovator";
    logoConcept = "A sharp, stylized lettermark enclosed in a glowing hexagonal wireframe shield, projecting cutting-edge technical precision.";
    vibeDescription = "High-energy, futuristic visual atmosphere characterized by deep dark themes, neon light trails, and bold geometric typography.";
  } else if (p.includes('spa') || p.includes('eco') || p.includes('skin') || p.includes('beauty') || p.includes('organic') || p.includes('relax') || p.includes('health')) {
    brandName = `${mainWord} Botanicals`;
    slogan = "Purity Awakened Through Nature";
    colors = [
      { hex: "#1C2826", name: "Deep Forest Pine" },
      { hex: "#D4A373", name: "Warm Terracotta Gold" },
      { hex: "#FAEDCD", name: "Soft Silk Cream" },
      { hex: "#CCD5AE", name: "Sage Leaf Accent" },
      { hex: "#E9EDC9", name: "Morning Dew Linen" }
    ];
    fontPairing = {
      heading: "Playfair Display",
      body: "DM Sans",
      rationale: "Playfair Display exudes organic luxury and editorial poise, while DM Sans maintains soft, approachable clarity."
    };
    archetype = "The Caregiver / Lover";
    logoConcept = "A delicate minimalist botanical emblem featuring overlapping leaf contours forming a subtle lotus curve.";
    vibeDescription = "Serene, tactile luxury centered around organic warmth, subtle earthen tones, and calming spatial breathing room.";
  } else if (p.includes('coffee') || p.includes('cafe') || p.includes('brew') || p.includes('food') || p.includes('craft') || p.includes('drink')) {
    brandName = `${mainWord} Roasters`;
    slogan = "Crafted for the Discerning Palette";
    colors = [
      { hex: "#2B1E1A", name: "Dark Espresso" },
      { hex: "#C68B59", name: "Toasted Amber Gold" },
      { hex: "#D7B594", name: "Oat Milk Crema" },
      { hex: "#4A3525", name: "Rich Cocoa Neutral" },
      { hex: "#FDFBF7", name: "Artisan Paper" }
    ];
    fontPairing = {
      heading: "Outfit",
      body: "Plus Jakarta Sans",
      rationale: "Outfit brings warm geometric structure to headlines while Plus Jakarta Sans keeps body text approachable and contemporary."
    };
    archetype = "The Artisan / Explorer";
    logoConcept = "A monogram stamp featuring a stylized coffee bean silhouette intertwined with rising steam vectors.";
    vibeDescription = "Warm, aromatic, and artisanal atmosphere blending rich espresso neutrals with textured tactile finishes.";
  } else if (p.includes('fintech') || p.includes('crypto') || p.includes('bank') || p.includes('money') || p.includes('finance') || p.includes('pay')) {
    brandName = `${mainWord} Capital`;
    slogan = "Seamless Global Wealth Protocol";
    colors = [
      { hex: "#030712", name: "Void Black" },
      { hex: "#10B981", name: "Emerald Mint" },
      { hex: "#3B82F6", name: "Financial Blue" },
      { hex: "#1F2937", name: "Executive Slate" },
      { hex: "#F9FAFB", name: "Pure Light Canvas" }
    ];
    fontPairing = {
      heading: "Outfit",
      body: "Inter",
      rationale: "Outfit reflects modern financial innovation while Inter delivers pristine numerical data clarity."
    };
    archetype = "The Ruler / Visionary";
    logoConcept = "An abstract geometric knot representing interconnected global nodes and financial security.";
    vibeDescription = "Trustworthy, ultra-modern corporate aesthetics with high-contrast emerald highlights and sleek obsidian surfaces.";
  }

  return {
    brandName,
    slogan,
    colors,
    fontPairing,
    vibeDescription,
    archetype,
    logoConcept
  };
}
