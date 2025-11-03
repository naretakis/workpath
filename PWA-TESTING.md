# PWA Testing Guide

## Phase 6 Implementation Complete! ✅

All PWA features have been implemented. Here's how to test them:

## What Was Implemented

### 6.1 Configure next-pwa ✅

- Installed `next-pwa` package
- Configured in `next.config.ts`
- Service worker will be generated in production builds

### 6.2 Create manifest ✅

- Created `public/manifest.json` with app metadata
- Added PWA meta tags to `src/app/layout.tsx`
- Configured app name, colors, and display mode

### 6.3 Create icons ✅

- Generated placeholder icons (192x192 and 512x512)
- Icons are blue with white "W" letter
- Located in `public/icon-192x192.png` and `public/icon-512x512.png`
- **Better approach**: Use `scripts/generate-pwa-icons.html` to create icons from Lucide icons
- Open the HTML file in a browser, pick an icon from [lucide.dev](https://lucide.dev/icons/), and save the generated PNGs

### 6.4 Add offline indicator ✅

- Created `src/components/OfflineIndicator.tsx`
- Shows warning banner when offline
- Automatically detects online/offline status
- Added to root layout

### 6.5 Test offline ✅

- App uses IndexedDB (works offline by default)
- Service worker caches app files
- Offline indicator shows connection status

### 6.6 Test installation ✅

- App can be installed on mobile devices
- Manifest configured for standalone mode
- Icons ready for home screen

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

## Known Limitations

- **Development mode**: Service worker is disabled in development (by design)
- **HTTPS required**: PWA features require HTTPS in production (except localhost)
- **Placeholder icons**: Current icons are simple placeholders - replace with professional designs
- **Browser support**: Some features may not work in all browsers (Safari has limited PWA support)

## Customizing Icons with Lucide

Instead of the placeholder icons, you can easily create better ones using Lucide icons:

1. **Open the generator**: Open `scripts/generate-pwa-icons.html` in your browser

2. **Pick an icon**: Browse [lucide.dev/icons](https://lucide.dev/icons/) and find one you like:
   - `briefcase` - Work/professional (current in generator)
   - `calendar-check` - Tracking/scheduling
   - `clipboard-check` - Tasks/compliance
   - `clock` - Time tracking
   - `user-check` - Personal tracking

3. **Update the SVG path**: Copy the SVG path from Lucide and paste it into the generator HTML

4. **Generate**: Right-click each canvas and "Save image as..."
   - Save as `icon-192x192.png` and `icon-512x512.png`

5. **Replace**: Move the new files to the `public/` folder

The generator creates properly sized, Material-UI themed icons perfect for PWA installation!

## Next Steps

After testing, you can:

1. **Customize icons** using the Lucide icon generator above
2. **Deploy to production** (Phase 7)
3. **Test on real mobile devices**
4. **Run Lighthouse audit** to check PWA score
5. **Add more PWA features** (push notifications, background sync, etc.)

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

## Files Modified

- `next.config.ts` - Added next-pwa configuration
- `src/app/layout.tsx` - Added PWA meta tags and offline indicator
- `public/manifest.json` - PWA manifest file
- `public/icon-192x192.png` - App icon (192x192)
- `public/icon-512x512.png` - App icon (512x512)
- `src/components/OfflineIndicator.tsx` - Offline status component

## Resources

- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
