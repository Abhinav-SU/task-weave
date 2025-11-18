# TaskWeave Browser Extension

Universal AI Task Continuity System - Browser Extension for capturing conversations from ChatGPT, Claude, and other AI platforms.

## Features

- 📋 **One-Click Capture**: Capture entire conversations from ChatGPT and Claude
- 🔗 **Task Linking**: Link conversations to existing tasks or create new ones
- 🔄 **Real-Time Sync**: WebSocket integration for live updates
- 🎨 **Beautiful UI**: Modern, intuitive popup interface
- 🔐 **Secure**: JWT authentication with the TaskWeave backend

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### 3. Generate Icons

Open `create-icons.html` in your browser to generate placeholder icons, or provide your own icons in the `public/icons/` directory:

- `icon16.png` - 16x16px
- `icon48.png` - 48x48px
- `icon128.png` - 128x128px

### 4. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder

## Development

### File Structure

```
extension/
├── src/
│   ├── background/
│   │   └── index.ts          # Background service worker
│   ├── content/
│   │   ├── chatgpt-injector.ts  # ChatGPT content script
│   │   └── claude-injector.ts   # Claude content script
│   ├── popup/
│   │   ├── popup.html        # Popup UI
│   │   └── popup.ts          # Popup logic
│   └── utils/
│       ├── api.ts            # API client
│       └── storage.ts        # Storage utilities
├── public/
│   └── icons/                # Extension icons
├── manifest.json             # Extension manifest
├── build.js                  # Build script
└── package.json
```

### Build Script

The extension uses `esbuild` for fast TypeScript compilation and bundling.

- `npm run build` - Single production build
- `npm run watch` - Watch mode (rebuilds on file changes)
- `npm run dev` - Clean + watch mode
- `npm run clean` - Remove dist directory

### Watch Mode

In development, use watch mode for automatic rebuilds:

```bash
npm run dev
```

After changes, click the refresh icon in `chrome://extensions/` to reload the extension.

## Usage

### 1. Sign In

Click the TaskWeave extension icon and sign in with your credentials.

### 2. Capture Conversations

#### On ChatGPT (chat.openai.com)

1. Have a conversation with ChatGPT
2. Click the floating 📋 button (bottom right)
3. Enter a title and select a task
4. Click "Save to TaskWeave"

#### On Claude (claude.ai)

1. Have a conversation with Claude
2. Click the floating 📋 button (bottom right)
3. Enter a title and select a task
4. Click "Save to TaskWeave"

### 3. Manage Tasks

- Click the extension icon to see active task count
- Click "Open Dashboard" to view all tasks in the web interface
- Click "New Task" to create a new task

## Configuration

The extension connects to `http://localhost:3000` by default. To change the API URL:

1. Open the extension popup
2. Click "Settings" (future feature)
3. Enter the new API URL

## Troubleshooting

### Extension doesn't load

- Make sure you've run `npm run build`
- Check that the `dist/` folder exists and contains files
- Verify manifest.json is copied to dist/

### Can't capture conversations

- Make sure you're signed in (check the popup)
- Verify the backend server is running at `http://localhost:3000`
- Check the browser console for errors (F12 → Console)

### WebSocket not connecting

- Verify the backend is running
- Check that the auth token is valid (try logging out and back in)
- Check browser console and background service worker logs

### Content script not injecting

- Verify you're on a supported site (ChatGPT or Claude)
- Try refreshing the page
- Check for console errors (F12 → Console)

## Supported Platforms

- ✅ ChatGPT (chat.openai.com, chatgpt.com)
- ✅ Claude (claude.ai)
- ⏳ Gemini (coming soon)
- ⏳ Perplexity (coming soon)

## Browser Compatibility

- ✅ Chrome/Chromium (v100+)
- ✅ Edge (v100+)
- ⏳ Firefox (coming soon - requires manifest v3 adjustments)
- ❌ Safari (not supported - different extension API)

## Security

- All authentication tokens are stored securely in browser local storage
- API requests use HTTPS in production
- Content scripts only inject on whitelisted domains
- No data is shared with third parties

## Contributing

When adding support for new AI platforms:

1. Create a new content script in `src/content/`
2. Add platform detection logic
3. Implement conversation extraction
4. Update `manifest.json` with new content script entry
5. Test thoroughly on the target platform

## License

MIT

