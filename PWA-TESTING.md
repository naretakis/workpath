# PWA Testing Guide

This guide explains how to test the Progressive Web App features of WorkPath.

## PWA Features

WorkPath includes the following PWA capabilities:

- **Service Worker** - Caches app files for offline use
- **Web App Manifest** - Enables installation on mobile devices
- **Offline Indicator** - Shows connection status
- **IndexedDB Storage** - All data persists locally
- **Installable** - Add to home screen like a native app

## How to Test

### Testing in Development

1. **Start the dev server** (already running):

   ```bash
   npm run dev
   ```

2. **Open in browser**: http://localhost:3000

3. **Test offline indicator**:
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Offline" checkbox
   - You should see a yellow banner at the top

4. **Test data persistence**:
   - Log some activities
   - Go offline (Network tab → Offline)
   - Try logging more activities
   - Data should still save to IndexedDB

### Testing PWA Installation (Production)

1. **Build for production**:

   ```bash
   npm run build
   npm start
   ```

2. **Open in Chrome**: http://localhost:3000

3. **Check PWA status**:
   - Open DevTools → Lighthouse tab
   - Run "Progressive Web App" audit
   - Should score high on PWA criteria

4. **Test installation**:
   - Look for install icon in address bar (desktop)
   - Click to install as app
   - App should open in standalone window

### Testing on Mobile Device

1. **Deploy to a server** (or use ngrok for local testing):

   ```bash
   # Option 1: Deploy to GitHub Pages (see Phase 7)
   # Option 2: Use ngrok for local testing
   npx ngrok http 3000
   ```

2. **Open on mobile device**:
   - Visit the URL on your phone
   - Should see "Add to Home Screen" prompt

3. **Install the app**:
   - Tap "Add to Home Screen"
   - App icon appears on home screen
   - Opens like a native app

4. **Test offline**:
   - Open the installed app
   - Turn on Airplane Mode
   - App should still work
   - Can log activities offline

### Testing Service Worker

1. **Build and start production server**:

   ```bash
   npm run build
   npm start
   ```

2. **Check service worker**:
   - Open DevTools → Application tab
   - Click "Service Workers" in sidebar
   - Should see registered service worker
   - Status should be "activated and running"

3. **Check cache**:
   - In Application tab, click "Cache Storage"
   - Should see cached app files
   - These enable offline functionality

## Customizing Icons

You can create custom icons using the included generator:

1. Open `scripts/generate-pwa-icons.html` in your browser
2. Browse [lucide.dev/icons](https://lucide.dev/icons/) for an icon you like
3. Copy the SVG path and paste it into the generator
4. Right-click each canvas and save as `icon-192x192.png` and `icon-512x512.png`
5. Replace the files in the `public/` folder

Suggested icons:

- `briefcase` - Work/professional
- `calendar-check` - Tracking/scheduling
- `clipboard-check` - Tasks/compliance
- `clock` - Time tracking

## Important Notes

- **Development mode**: Service worker is disabled in dev (by design)
- **HTTPS required**: PWA features need HTTPS in production (localhost is OK)
- **Browser support**: Safari has limited PWA support

## Troubleshooting

### Service worker not registering

- Make sure you're in production mode (`npm run build && npm start`)
- Check browser console for errors
- Verify HTTPS is enabled (or using localhost)

### Install prompt not showing

- PWA criteria must be met (manifest, service worker, HTTPS)
- Some browsers don't show prompt automatically
- Try manually: Chrome menu → "Install WorkPath"

### Offline mode not working

- Service worker must be registered first
- Visit app online first to cache files
- Check DevTools → Application → Service Workers

### Icons not showing

- Clear browser cache
- Check manifest.json is accessible
- Verify icon files exist in public folder

## Resources

- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse PWA Audit](https://developer.chrome.com/docs/lighthouse/pwa/)
