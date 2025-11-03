# Deployment Guide

Deploy WorkPath to GitHub Pages using GitHub Actions.

## Quick Start

### 1. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Deploy

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy your app.

### 3. Access Your App

After deployment completes (2-3 minutes):

- Go to **Settings → Pages** to see your URL
- Your app will be at: `https://[username].github.io/workpath`

## Custom Repository Name

If your repo isn't named "workpath", update `next.config.ts`:

```typescript
basePath: '/your-repo-name',
```

## Updating Your App

To deploy updates:

```bash
git add .
git commit -m "Update app"
git push origin main
```

GitHub Actions automatically rebuilds and redeploys.

## Manual Deployment

To deploy to other static hosts:

```bash
npm run build
# Upload the 'out' directory to your hosting service
```

## Troubleshooting

**Build fails**: Check the Actions tab for errors, ensure `npm run build` works locally

**App doesn't load**: Check browser console, verify base path is correct

**Service worker issues**: Clear site data in DevTools → Application → Clear storage

## Notes

- Static export only - all data stays in the browser
- PWA features work on GitHub Pages (HTTPS provided)
- First deployment may take a few minutes to propagate
