# TaskWeave Scripts

This folder contains utility scripts for development and deployment.

## Scripts (Not in Git)

The following scripts are used locally but not committed to Git:

- **Recording Scripts** (`record-demo-*.js`) - Playwright scripts for recording demo videos
- **Voiceover Scripts** (`voiceover-*.txt`) - Text files for generating AI voiceovers
- **Database Scripts** (`*.sql`) - Migration and utility SQL scripts
- **Utility Scripts** (`*.ps1`, `*.py`) - Various utility scripts

## Demo Video

The demo video (`TaskWeave-Demo-4K-Final.mp4`) should be hosted on:
- YouTube
- Vimeo  
- Your preferred CDN

Once hosted, update the video URL in:
```
frontend/taskweave-flow-main/src/components/landing/Hero.tsx
```

Look for `DEMO_VIDEO_URL` constant and replace with your hosted URL.

## Environment Setup

1. Copy `backend/env.example` to `backend/.env`
2. Fill in your API keys (OpenAI, Google AI, Anthropic, etc.)
3. Never commit `.env` files!

