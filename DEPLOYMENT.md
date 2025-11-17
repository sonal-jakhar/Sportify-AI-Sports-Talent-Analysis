# Deployment Guide

## Prerequisites

1. Node.js 16+ installed
2. npm or yarn package manager

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

## Building for Production

```bash
# Build the application
npm run build

# This creates a dist/ folder with optimized production files
```

## Deploying to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

Or use Vercel's web interface:
- Connect your GitHub repository
- Vercel will automatically detect Vite and deploy

## Deploying to Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

Or use Netlify's web interface:
- Connect your repository
- Build command: `npm run build`
- Publish directory: `dist`

## Important Notes

1. **PWA Icons**: Before deploying, ensure you have created and added:
   - `public/icon-192.png` (192x192 pixels)
   - `public/icon-512.png` (512x512 pixels)

2. **Service Worker**: The service worker will automatically cache assets for offline functionality.

3. **Environment Variables**: No environment variables are required for basic functionality.

4. **ML Models**: TensorFlow.js models are loaded from CDN and will be cached by the service worker on first load.

## Post-Deployment

1. Test PWA installation on mobile devices
2. Verify offline functionality
3. Test video recording and upload
4. Verify all routes work correctly
5. Test language switching
6. Verify PDF report generation

## Troubleshooting

- **Service Worker Issues**: Clear browser cache and unregister old service workers
- **ML Model Loading**: Check browser console for model loading errors
- **Video Processing**: Ensure browser supports WebRTC and MediaRecorder API
