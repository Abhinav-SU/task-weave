# TaskWeave Scripts

This folder contains utility scripts for development and deployment.

## 📖 Demo Video Guide

**👉 See [VIDEO_GUIDE.md](./VIDEO_GUIDE.md) for complete step-by-step instructions**

Quick start:
```powershell
# Automated process (recommended)
.\scripts\make-demo-video.ps1

# Or manual steps:
node scripts/record-demo-4k.js
python scripts/generate-voiceover-extended.py
.\scripts\combine-video-audio.ps1
ffmpeg -i TaskWeave-Demo-Final.mp4 -vf "scale=3840:2160:flags=lanczos" -c:v libx264 -preset slow -crf 18 -c:a copy TaskWeave-Demo-4K-Final.mp4
```

## Scripts (Not in Git)

The following scripts are used locally but not committed to Git:

- **Recording Scripts** (`record-demo-*.js`) - Playwright scripts for recording demo videos
- **Voiceover Scripts** (`voiceover-*.txt`) - Text files for generating AI voiceovers
- **Video Processing** (`combine-video-audio.ps1`, `make-demo-video.ps1`) - FFmpeg automation
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



