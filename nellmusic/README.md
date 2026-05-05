# Nellspotify

Premium music streaming app powered by YouTube audio.

## Deploy ke Vercel

1. Push project ini ke GitHub
2. Import di [vercel.com/new](https://vercel.com/new)
3. Tambahkan environment variable:
   - `VITE_YOUTUBE_API_KEY` = YouTube Data API v3 key kamu
4. Klik **Deploy**

## Local Development

```bash
npm install
cp .env.example .env.local
# isi VITE_YOUTUBE_API_KEY di .env.local
npm run dev
```

## Tech Stack

- React 19 + Vite + TypeScript
- TailwindCSS v4 + Glassmorphism UI
- Framer Motion animations
- Zustand state management
- YouTube IFrame API (audio only)
- Wouter routing
