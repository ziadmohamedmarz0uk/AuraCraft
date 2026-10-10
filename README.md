# AuraCraft

AI-powered brand identity generator built with Next.js. Users enter a business idea and AuraCraft generates a polished visual identity kit including a brand name, slogan, color palette, font pairing, brand vibe, archetype, and logo concept.

Live demo: https://auracraft-woad.vercel.app

## Features

- Prompt-based brand identity generation.
- Industry and aesthetic filters for more targeted results.
- Google Gemini API integration through a Next.js API route.
- Fallback generation engine when an API key is not configured.
- Copyable color hex values, CSS variables, and Tailwind color snippets.
- Animated interface with Framer Motion and canvas-confetti.
- Responsive design for desktop and mobile screens.

## Tech Stack

- Next.js 14
- React 18
- JavaScript
- Tailwind CSS
- Google GenAI SDK
- Framer Motion
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` if you want to use Gemini:

```env
GEMINI_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Notes

The app includes a local fallback response generator, so it still works as a demo even without a Gemini API key.
