// TaskWeave Extension Build Script
// Uses esbuild for fast bundling and TypeScript compilation

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const isWatch = process.argv.includes('--watch');
const isDev = isWatch || process.env.NODE_ENV !== 'production';

console.log(`\n🏗️  Building TaskWeave Extension ${isDev ? '(Development)' : '(Production)'}...\n`);

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('dist', { recursive: true });

// Copy static files
function copyStaticFiles() {
  // Copy manifest.json
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  console.log('✓ Copied manifest.json');

  // Copy popup.html
  if (fs.existsSync('src/popup/popup.html')) {
    fs.copyFileSync('src/popup/popup.html', 'dist/popup.html');
    console.log('✓ Copied popup.html');
  }

  // Copy icons
  if (fs.existsSync('public/icons')) {
    fs.cpSync('public/icons', 'dist/public/icons', { recursive: true });
    console.log('✓ Copied icons');
  }
}

// Build configuration
const buildConfig = {
  bundle: true,
  minify: !isDev,
  sourcemap: isDev,
  target: ['chrome100', 'firefox100'],
  format: 'esm',
  platform: 'browser',
  logLevel: 'info',
};

// Build tasks
async function build() {
  try {
    // Copy static files
    copyStaticFiles();

    // Build background script
    await esbuild.build({
      ...buildConfig,
      entryPoints: ['src/background/index.ts'],
      outfile: 'dist/background.js',
    });
    console.log('✓ Built background script');

    // Build content scripts
    await esbuild.build({
      ...buildConfig,
      entryPoints: ['src/content/chatgpt-injector.ts'],
      outfile: 'dist/content-chatgpt.js',
    });
    console.log('✓ Built ChatGPT content script');

    await esbuild.build({
      ...buildConfig,
      entryPoints: ['src/content/claude-injector.ts'],
      outfile: 'dist/content-claude.js',
    });
    console.log('✓ Built Claude content script');

    // Build popup
    await esbuild.build({
      ...buildConfig,
      entryPoints: ['src/popup/popup.ts'],
      outfile: 'dist/popup.js',
    });
    console.log('✓ Built popup script');

    console.log('\n✅ Build completed successfully!\n');
    
    if (!isWatch) {
      console.log('📦 Extension ready at: dist/');
      console.log('\n📋 To load in Chrome:');
      console.log('   1. Go to chrome://extensions/');
      console.log('   2. Enable "Developer mode"');
      console.log('   3. Click "Load unpacked"');
      console.log('   4. Select the "dist" folder\n');
    }
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// Watch mode
if (isWatch) {
  console.log('👀 Watching for changes...\n');
  
  // Initial build
  await build();

  // Watch for changes in src directory
  fs.watch('src', { recursive: true }, async (eventType, filename) => {
    console.log(`\n📝 File changed: ${filename}`);
    console.log('🔄 Rebuilding...\n');
    await build();
  });

  // Watch for manifest.json changes
  fs.watch('manifest.json', async () => {
    console.log('\n📝 Manifest changed');
    console.log('🔄 Rebuilding...\n');
    await build();
  });

  // Keep process alive
  console.log('✓ Watching for changes... (Press Ctrl+C to stop)\n');
} else {
  // Single build
  await build();
}

