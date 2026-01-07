# 🎬 TaskWeave Demo Video & Voiceover Guide

Complete step-by-step guide to create a professional demo video with AI voiceover.

---

## 📋 Prerequisites

### Required Software

1. **Node.js 18+** (for Playwright)
   ```bash
   node --version  # Should be 18+
   ```

2. **Python 3.8+** (for voiceover generation)
   ```bash
   python --version  # Should be 3.8+
   ```

3. **FFmpeg** (for video/audio processing)
   ```bash
   ffmpeg -version  # Check if installed
   ```
   
   **Install FFmpeg (Windows):**
   ```powershell
   winget install ffmpeg
   ```
   
   Or download from: https://www.gyan.dev/ffmpeg/builds/

4. **Playwright** (browser automation)
   ```bash
   npm install -g playwright
   npx playwright install chromium
   ```

5. **Python packages** (for voiceover)
   ```bash
   pip install edge-tts
   ```

### Application Setup

1. **Start the application:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend/taskweave-flow-main
   npm run dev
   ```

2. **Verify it's running:**
   - Backend: http://localhost:3000
   - Frontend: http://localhost:8080

3. **Demo account credentials:**
   - Email: `demotest@taskweave.com`
   - Password: `demo12345`

---

## 🎥 Step 1: Record the Video

### Option A: Standard HD (1280x720)

```bash
cd D:\03_Projects\TaskWeave
node scripts/record-demo-v5.js
```

**What it does:**
- Records at 1280x720 resolution
- Navigates through: Landing → Login → Dashboard → Templates → Run Workflow → Results → Template Builder
- Saves as `TaskWeave-Demo-v5.webm` in project root

### Option B: 4K Ready (1920x1080)

```bash
cd D:\03_Projects\TaskWeave
node scripts/record-demo-4k.js
```

**What it does:**
- Records at 1920x1080 (Full HD) for later 4K upscaling
- Same flow as Option A, but higher resolution
- Saves as `TaskWeave-Demo-4k.webm`

### Recording Process

1. **The script will:**
   - Open a Chromium browser (visible, not headless)
   - Navigate through your application
   - Record all interactions
   - Save the video automatically

2. **Watch for:**
   - Console logs showing each scene: `📍 Scene 1: Landing Page`
   - Any errors or timeouts
   - Final message: `✅ Demo recording completed!`

3. **Video location:**
   - Check project root: `D:\03_Projects\TaskWeave\TaskWeave-Demo-v5.webm`
   - Or in Playwright's temp folder (path shown in console)

---

## 🎙️ Step 2: Create Voiceover Script

### Edit the Script

1. **Open the voiceover text file:**
   ```
   scripts/voiceover-v5.txt
   ```

2. **Write your script:**
   - Match the timing of your video scenes
   - Use clear, professional language
   - Keep sentences concise
   - Add pauses with blank lines

3. **Example structure:**
   ```
   Welcome to TaskWeave, a Multi-LLM Orchestration Platform.
   
   TaskWeave lets you create intelligent workflows...
   
   Let's log in and explore the platform.
   
   [Continue for each scene...]
   ```

### Generate Voiceover Audio

```bash
cd D:\03_Projects\TaskWeave
python scripts/generate-voiceover-extended.py
```

**Or create a custom script:**

Create `scripts/generate-voiceover-custom.py`:

```python
import asyncio
import edge_tts
import os

# Read your script
with open('scripts/voiceover-v5.txt', 'r', encoding='utf-8') as f:
    script = f.read()

async def generate():
    os.makedirs("voiceover", exist_ok=True)
    
    # Use professional voice (options: en-US-AriaNeural, en-US-JennyNeural, en-GB-SoniaNeural)
    communicate = edge_tts.Communicate(script, "en-US-AriaNeural")
    
    output = "voiceover/demo-voiceover.mp3"
    await communicate.save(output)
    
    print(f"✅ Voiceover saved: {output}")

asyncio.run(generate())
```

**Run it:**
```bash
python scripts/generate-voiceover-custom.py
```

**Output:** `voiceover/demo-voiceover.mp3`

### Available Voices

- `en-US-AriaNeural` - Professional female (recommended)
- `en-US-JennyNeural` - Friendly female
- `en-US-GuyNeural` - Professional male
- `en-GB-SoniaNeural` - British female

**List all voices:**
```bash
python -c "import asyncio, edge_tts; asyncio.run(edge_tts.list_voices())"
```

---

## 🎬 Step 3: Combine Video + Audio

### Method 1: PowerShell Script (Recommended)

```powershell
cd D:\03_Projects\TaskWeave
.\scripts\combine-video-audio.ps1
```

**What it does:**
- Finds the latest `.webm` video file
- Combines with `voiceover/demo-voiceover.mp3`
- Outputs: `TaskWeave-Demo-Final.mp4`

### Method 2: Manual FFmpeg

```bash
# Find your video file (e.g., TaskWeave-Demo-v5.webm)
# Then run:

ffmpeg -i TaskWeave-Demo-v5.webm -i voiceover/demo-voiceover.mp3 \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 192k \
  -shortest \
  -y TaskWeave-Demo-Final.mp4
```

**Parameters explained:**
- `-c:v libx264` - H.264 video codec
- `-preset medium` - Encoding speed/quality balance
- `-crf 23` - Quality (18-28, lower = better quality)
- `-c:a aac` - AAC audio codec
- `-b:a 192k` - Audio bitrate
- `-shortest` - Match shortest stream (video or audio)
- `-y` - Overwrite output file

### Sync Audio with Video

If audio is out of sync:

```bash
# Delay audio by 0.5 seconds
ffmpeg -i video.webm -i audio.mp3 \
  -c:v copy -c:a aac -b:a 192k \
  -itsoffset 0.5 -map 0:v:0 -map 1:a:0 \
  -shortest output.mp4
```

---

## 🎞️ Step 4: Upscale to 4K (Optional)

### Upscale to 2K (2560x1440)

```bash
ffmpeg -i TaskWeave-Demo-Final.mp4 \
  -vf "scale=2560:1440:flags=lanczos" \
  -c:v libx264 -preset slow -crf 18 \
  -c:a copy \
  -y TaskWeave-Demo-2K.mp4
```

### Upscale to 4K (3840x2160)

```bash
ffmpeg -i TaskWeave-Demo-Final.mp4 \
  -vf "scale=3840:2160:flags=lanczos" \
  -c:v libx264 -preset slow -crf 18 \
  -c:a copy \
  -y TaskWeave-Demo-4K-Final.mp4
```

**Parameters:**
- `scale=3840:2160` - Target resolution
- `flags=lanczos` - High-quality scaling algorithm
- `-preset slow` - Better quality (slower encoding)
- `-crf 18` - High quality (lower = better)

**Note:** Upscaling takes time. A 1.5-minute video may take 5-10 minutes.

---

## ✂️ Step 5: Trim & Adjust (Optional)

### Trim video (remove beginning/end)

```bash
# Remove first 2 seconds
ffmpeg -i input.mp4 -ss 00:00:02 -c copy output.mp4

# Trim to specific duration (e.g., 90 seconds)
ffmpeg -i input.mp4 -t 00:01:30 -c copy output.mp4

# Trim specific segment (from 5s to 90s)
ffmpeg -i input.mp4 -ss 00:00:05 -t 00:01:25 -c copy output.mp4
```

### Add freeze frame at end (for audio sync)

```bash
# Extract last frame
ffmpeg -i input.mp4 -vf "select=eq(n\,$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_frames -of csv=p=0 input.mp4))" -vframes 1 lastframe.png

# Extend video with freeze frame (add 3 seconds)
ffmpeg -i input.mp4 -loop 1 -t 3 -i lastframe.png \
  -filter_complex "[0:v][1:v]concat=n=2:v=1[outv]" \
  -map "[outv]" -map 0:a -c:a copy output.mp4
```

### Adjust audio volume

```bash
# Increase volume by 50%
ffmpeg -i input.mp4 -af "volume=1.5" output.mp4

# Normalize audio
ffmpeg -i input.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11" output.mp4
```

---

## 📤 Step 6: Upload & Link

### Upload to YouTube

1. **Go to:** https://www.youtube.com/upload
2. **Upload:** `TaskWeave-Demo-4K-Final.mp4`
3. **Settings:**
   - Title: "TaskWeave - Multi-LLM Orchestration Platform Demo"
   - Description: Add your project description
   - Visibility: Unlisted (or Public)
4. **Copy the video ID** from URL: `https://youtu.be/VIDEO_ID`

### Update Application

**1. Update Hero.tsx:**
```typescript
// frontend/taskweave-flow-main/src/components/landing/Hero.tsx
const DEMO_VIDEO_URL = "https://www.youtube.com/embed/YOUR_VIDEO_ID";
```

**2. Update README.md:**
```markdown
[![TaskWeave Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
```

---

## 🔧 Troubleshooting

### Video recording issues

**Problem:** Browser doesn't open
- **Solution:** Check Playwright installation: `npx playwright install chromium`

**Problem:** Login fails
- **Solution:** Verify demo account exists and credentials are correct

**Problem:** Video is black/blank
- **Solution:** Run with `headless: false` (already set in scripts)

### Voiceover issues

**Problem:** `edge-tts` not found
- **Solution:** `pip install edge-tts`

**Problem:** Voice sounds robotic
- **Solution:** Try different voices (AriaNeural, JennyNeural, GuyNeural)

**Problem:** Audio too fast/slow
- **Solution:** Adjust script length or add pauses (blank lines)

### FFmpeg issues

**Problem:** FFmpeg not found
- **Solution:** Install via `winget install ffmpeg` or download manually

**Problem:** Audio/video out of sync
- **Solution:** Use `-itsoffset` to delay audio, or re-record with better timing

**Problem:** File too large
- **Solution:** Increase CRF value (e.g., `-crf 28` for smaller file, lower quality)

### Quality issues

**Problem:** Video looks pixelated
- **Solution:** Record at higher resolution (use `record-demo-4k.js`)

**Problem:** Audio quality poor
- **Solution:** Increase audio bitrate: `-b:a 256k` or `-b:a 320k`

---

## 📊 Complete Workflow Summary

```bash
# 1. Start application
cd backend && npm run dev  # Terminal 1
cd frontend/taskweave-flow-main && npm run dev  # Terminal 2

# 2. Record video
cd D:\03_Projects\TaskWeave
node scripts/record-demo-4k.js

# 3. Create voiceover script
# Edit: scripts/voiceover-v5.txt

# 4. Generate voiceover
python scripts/generate-voiceover-extended.py

# 5. Combine video + audio
.\scripts\combine-video-audio.ps1

# 6. Upscale to 4K
ffmpeg -i TaskWeave-Demo-Final.mp4 \
  -vf "scale=3840:2160:flags=lanczos" \
  -c:v libx264 -preset slow -crf 18 \
  -c:a copy \
  -y TaskWeave-Demo-4K-Final.mp4

# 7. Upload to YouTube and update URLs
```

---

## 📝 Tips & Best Practices

1. **Timing:**
   - Match voiceover script to video scenes
   - Add pauses (blank lines) for natural flow
   - Test timing by watching video while reading script

2. **Quality:**
   - Record at highest resolution possible (1920x1080 minimum)
   - Use slow encoding preset for final output (`-preset slow`)
   - Keep CRF low for quality (18-23 range)

3. **Audio:**
   - Use professional voice (AriaNeural recommended)
   - Normalize audio levels
   - Ensure audio matches video length

4. **Content:**
   - Show key features clearly
   - Keep demo under 2 minutes if possible
   - Highlight unique value propositions

5. **Testing:**
   - Watch full video before uploading
   - Check audio sync at multiple points
   - Test on different devices/screens

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Record HD video | `node scripts/record-demo-v5.js` |
| Record 4K video | `node scripts/record-demo-4k.js` |
| Generate voiceover | `python scripts/generate-voiceover-extended.py` |
| Combine video+audio | `.\scripts\combine-video-audio.ps1` |
| Upscale to 4K | `ffmpeg -i input.mp4 -vf "scale=3840:2160:flags=lanczos" -c:v libx264 -preset slow -crf 18 -c:a copy output.mp4` |
| Trim video | `ffmpeg -i input.mp4 -ss 00:00:05 -t 00:01:30 -c copy output.mp4` |

---

**Need help?** Check the troubleshooting section or review the script files for detailed comments.

