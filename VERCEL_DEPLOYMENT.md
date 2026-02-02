# Vercel Deployment Guide

## 🚀 Deploying to Vercel with Secure API Proxy

Your app now uses Vercel Serverless Functions to keep your Gemini API key secure on the server side.

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** 
- Set this for **Production**, **Preview**, and **Development** environments
- Do NOT include `VITE_` prefix for server-side variables
- The Firebase variables with `VITE_` prefix are still needed for the client

### Complete Environment Variables for Vercel:

#### Server-side (No VITE_ prefix):
```
GEMINI_API_KEY=your_gemini_api_key
```

#### Client-side (With VITE_ prefix):
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 2: Deploy

```bash
# Commit your changes
git add .
git commit -m "Add secure API proxy for Gemini"
git push

# Vercel will automatically deploy
```

Or use Vercel CLI:
```bash
vercel --prod
```

### Step 3: Verify Security

After deployment:

1. Open your deployed app
2. Open browser DevTools (F12)
3. Go to **Sources** tab
4. Search for "AIza" or your API key
5. **It should NOT be found** ✅

Your API key is now only on Vercel's servers!

### How It Works

**Before (Insecure):**
```
React App → Gemini API (with exposed key in bundle)
```

**After (Secure):**
```
React App → Vercel API Route → Gemini API (key on server)
           └─ /api/chat
           └─ /api/generate-image
```

### API Routes

- **POST /api/chat** - Streams chat responses
- **POST /api/generate-image** - Generates images

These routes run as Vercel Edge Functions and securely call the Gemini API with your server-side API key.

### Testing Locally

To test the API routes locally:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Run locally with serverless functions
vercel dev
```

This will:
- Run your Vite dev server
- Run the API routes as serverless functions
- Use your local `.env` file

### Troubleshooting

**Error: "Server configuration error"**
- Make sure `GEMINI_API_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables

**Error: "Method not allowed"**
- API routes only accept POST requests
- Check network tab for request details

**Streaming not working**
- Edge Runtime is required for streaming
- Check that `export const config = { runtime: 'edge' }` is in API files

### Security Checklist

- ✅ API key removed from client bundle
- ✅ API key set in Vercel environment variables
- ✅ API routes use Edge Runtime for performance
- ✅ CORS protection (API only accessible from your domain)
- ✅ Input validation in API routes
- ✅ Error messages don't expose sensitive info

---

**Need help?** Check [Vercel Documentation](https://vercel.com/docs/concepts/functions/serverless-functions)
