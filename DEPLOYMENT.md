# Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel account
- GitHub repository connected to Vercel

## Environment Variables
Set these in your Vercel dashboard under Settings > Environment Variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Steps

### Automatic Deployment (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect it's a Vite project
4. Add environment variables in Vercel dashboard
5. Deploy!

### Manual Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow the prompts
4. Add environment variables when asked

## Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: `18.x`

## Troubleshooting

### Build Errors
- Run `npm run type-check` locally to check TypeScript errors
- Run `npm run lint:check` to check for linting issues
- Ensure all environment variables are set in Vercel

### Runtime Errors
- Check browser console for errors
- Verify Supabase connection
- Ensure environment variables are correctly set

### Map Issues
- Leaflet tiles should work automatically
- Check CORS settings if map doesn't load
- Verify geolocation permissions

## Post-Deployment
1. Test all functionality in the deployed app
2. Check map loading and user location
3. Verify station data loads from Supabase
4. Test add station functionality

## Performance Tips
- Images are automatically optimized by Vercel
- Static assets are cached efficiently
- Bundle splitting is configured for optimal loading
