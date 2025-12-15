# Server-Side Rendering (SSR) Guide for Tipz Stacks
## Open Graph Meta Tags & Social Media Previews

---

## 📋 Overview

This document provides comprehensive guidance on implementing server-side rendering (SSR) for Tipz Stacks to ensure proper Open Graph meta tags are visible to social media crawlers (Facebook, Twitter, LinkedIn, WhatsApp, Discord, etc.).

**Current Status:** Client-side meta tag updates (sufficient for development/testing)  
**Production Requirement:** SSR implementation for optimal social media previews

---

## 🎯 Why SSR is Important

### The Challenge: Social Media Crawlers

**Problem:**
- Social media crawlers (Facebook Bot, Twitter Bot) **DO NOT execute JavaScript**
- Single Page Applications (SPAs) like our Vite+React app render content client-side
- Crawlers only see the initial HTML, which lacks dynamic meta tags
- Result: Generic previews with no custom images, titles, or descriptions

**Example:**
```html
<!-- What crawlers see (bad): -->
<head>
  <title>Tipz Stacks</title>
  <meta property="og:title" content="Tipz Stacks" />
  <meta property="og:image" content="/logo.png" />
</head>

<!-- What we want them to see (good): -->
<head>
  <title>Support Alice on Tipz Stacks</title>
  <meta property="og:title" content="Support Alice on Tipz Stacks" />
  <meta property="og:description" content="Alice is ranked #5 with 150 supporters..." />
  <meta property="og:image" content="https://ipfs.io/ipfs/QmXyz.../alice.png" />
</head>
```

### The Solution: Server-Side Rendering

**SSR generates fully-formed HTML on the server**, so crawlers see:
- Dynamic page titles
- Specific Open Graph tags
- Custom OG images
- Complete meta descriptions

---

## 🛠️ Implementation Options

### Option 1: Vite SSR (Recommended for Production)

**Best for:** Full control, optimal performance, no third-party dependencies

#### Benefits:
- Native Vite support
- Fast build times
- Deploy to edge functions (Vercel, Netlify, Cloudflare Workers)
- Full TypeScript support
- Control over rendering logic

#### Implementation Steps:

1. **Install Vite SSR plugin:**
```bash
npm install vite-plugin-ssr --save-dev
```

2. **Update `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssr from 'vite-plugin-ssr/plugin';

export default defineConfig({
  plugins: [react(), ssr()],
  ssr: {
    noExternal: ['@stacks/connect', '@stacks/transactions'],
  },
});
```

3. **Create SSR entry point (`src/entry-server.tsx`):**
```typescript
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import {
  generateCreatorProfileMetaTags,
  generateTipperProfileMetaTags,
  generateLeaderboardMetaTags,
  generateLandingMetaTags,
} from './utils/metaTags';

export async function render(url: string, context: any) {
  // Fetch data for the current route
  const routeData = await fetchRouteData(url);

  // Generate meta tags based on route
  const metaTags = generateMetaTagsForRoute(url, routeData);

  // Render React app
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  return { html, metaTags };
}

async function fetchRouteData(url: string) {
  // Parse URL and fetch necessary data
  if (url.startsWith('/creator/')) {
    const address = url.split('/creator/')[1];
    return await fetchCreatorData(address);
  }
  // ... other routes
}

function generateMetaTagsForRoute(url: string, data: any) {
  if (url.startsWith('/creator/')) {
    return generateCreatorProfileMetaTags(
      data.name,
      data.address,
      data.stats,
      data.profileImage
    );
  }
  // ... other routes
}
```

4. **Create HTML template (`index.html`):**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!--ssr-head-->
    
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
  </head>
  <body>
    <div id="root"><!--ssr-html--></div>
    <script type="module" src="/src/entry-client.tsx"></script>
  </body>
</html>
```

5. **Deploy to Vercel/Netlify:**
```bash
# Vercel
vercel deploy --prod

# Netlify
netlify deploy --prod --build
```

---

### Option 2: Prerendering Static Routes

**Best for:** Smaller apps, known routes, simple deployment

#### Benefits:
- No server required
- Deploy to static hosting (GitHub Pages, Vercel, Netlify)
- Fast load times
- Simple setup

#### Limitations:
- Cannot handle dynamic routes (e.g., `/creator/:address`)
- Requires rebuild for content updates
- Not suitable for user-generated content

#### Implementation:

1. **Install prerender plugin:**
```bash
npm install vite-plugin-prerender --save-dev
```

2. **Configure `vite.config.ts`:**
```typescript
import prerender from 'vite-plugin-prerender';

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        '/',
        '/leaderboards',
        '/discover',
        // Add static routes only
      ],
      renderer: '@prerenderer/renderer-puppeteer',
    }),
  ],
});
```

3. **Generate static pages:**
```bash
npm run build
```

**Note:** This option is **NOT suitable for Tipz Stacks** due to dynamic creator profiles and user-generated content.

---

### Option 3: Meta Tag API Endpoint

**Best for:** Hybrid approach, existing SPA infrastructure

#### Benefits:
- No full SSR rewrite needed
- Keep existing client-side routing
- Works with any hosting provider
- Focused on meta tags only

#### Implementation:

1. **Create API endpoint (`/api/meta-tags`):**
```typescript
// Cloudflare Worker / Vercel Serverless Function
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  // Fetch data based on path
  const data = await fetchDataForPath(path);

  // Generate meta tags
  const metaTags = generateMetaTagsForPath(path, data);

  // Return HTML with meta tags
  return new Response(generateHTML(metaTags), {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

2. **Middleware to detect crawlers:**
```typescript
export function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  const isCrawler =
    userAgent.includes('facebookexternalhit') ||
    userAgent.includes('Twitterbot') ||
    userAgent.includes('LinkedInBot') ||
    userAgent.includes('WhatsApp');

  if (isCrawler) {
    // Serve pre-rendered HTML with meta tags
    return fetch(`/api/meta-tags?path=${request.url}`);
  }

  // Serve regular SPA
  return NextResponse.next();
}
```

3. **Deploy middleware:**
```bash
vercel deploy --prod
```

---

### Option 4: Third-Party Service (Fastest Setup)

**Best for:** Quick production deployment, minimal dev effort

#### Services:
- **Prerender.io** (paid, $20+/month)
- **Rendertron** (Google, self-hosted)
- **Netlify Prerendering** (built-in, paid plan)

#### Prerender.io Setup:

1. **Sign up:** [prerender.io](https://prerender.io)

2. **Get API token**

3. **Add middleware:**
```javascript
// For Vercel
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Prerender-Token',
            value: process.env.PRERENDER_TOKEN,
          },
        ],
      },
    ];
  },
};
```

4. **Configure DNS:**
Add CNAME record pointing to Prerender.io

5. **Deploy:**
```bash
vercel deploy --prod
```

**Cost:** $20-$100/month depending on traffic

---

## 🚀 Recommended Approach for Tipz Stacks

### Phase 1: Development (Current)
✅ **Client-side meta tag updates**
- Sufficient for local testing
- Works for logged-in users
- No social media preview support

### Phase 2: Testnet Deployment
**Option:** Use **Prerender.io** (quick setup)
- Fast deployment (< 1 hour)
- No code changes needed
- Test social media previews
- Validate OG images
- Cost: ~$20/month

### Phase 3: Mainnet Production
**Option:** Full **Vite SSR** implementation
- Complete control
- Optimal performance
- No monthly fees
- Deploy to Vercel Edge Functions
- Implementation time: 2-3 days

---

## 📊 Testing Your Meta Tags

### Tools:

1. **Facebook Sharing Debugger:**
   - URL: https://developers.facebook.com/tools/debug/
   - Enter your page URL
   - Click "Scrape Again" to refresh cache
   - Verify OG image, title, description

2. **Twitter Card Validator:**
   - URL: https://cards-dev.twitter.com/validator
   - Enter page URL
   - Check card preview
   - Validate image dimensions (1200x630px)

3. **LinkedIn Post Inspector:**
   - URL: https://www.linkedin.com/post-inspector/
   - Test LinkedIn-specific tags
   - Check professional preview

4. **WhatsApp Link Preview:**
   - Send link in WhatsApp
   - Check preview appearance
   - Verify image loads correctly

### Manual Testing:

```bash
# Simulate Facebook bot
curl -A "facebookexternalhit/1.1" https://tipz-stacks.com/creator/SP123...

# Simulate Twitter bot
curl -A "Twitterbot/1.0" https://tipz-stacks.com/creator/SP123...

# Check meta tags
curl https://tipz-stacks.com/creator/SP123... | grep "og:"
```

---

## 🔧 Environment Configuration

### Required Environment Variables:

```bash
# .env.production
VITE_APP_URL=https://tipz-stacks.com
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET_KEY=your_secret_key

# For Prerender.io (if using)
PRERENDER_TOKEN=your_prerender_token

# For custom SSR
STACKS_API_URL=https://api.mainnet.hiro.so
CONTRACT_ADDRESS=SP123...
CONTRACT_NAME=tipz-core
```

---

## 📝 Meta Tag Checklist

Ensure every page includes:

### Essential Tags:
- ✅ `og:title` (60 characters max)
- ✅ `og:description` (160 characters max)
- ✅ `og:image` (1200x630px, < 1MB)
- ✅ `og:url` (canonical URL)
- ✅ `og:type` (website, profile, article)
- ✅ `og:site_name` ("Tipz Stacks")

### Twitter-Specific:
- ✅ `twitter:card` ("summary_large_image")
- ✅ `twitter:site` ("@TipzStacks")
- ✅ `twitter:creator` (user's handle if available)
- ✅ `twitter:title`
- ✅ `twitter:description`
- ✅ `twitter:image`

### Image Requirements:
- ✅ Minimum 1200x630px (optimal)
- ✅ Aspect ratio: 1.91:1
- ✅ File size: < 1MB
- ✅ Format: PNG or JPEG
- ✅ Absolute URL (no relative paths)
- ✅ HTTPS only

---

## 🐛 Troubleshooting

### Issue: Meta tags not updating

**Solution:**
1. Clear social media cache:
   - Facebook: Use Sharing Debugger
   - Twitter: Wait 7 days or contact support
   - LinkedIn: Use Post Inspector
2. Verify meta tags are in `<head>` section
3. Check if SSR is rendering correctly

### Issue: OG image not displaying

**Solution:**
1. Verify image URL is absolute (not relative)
2. Check image dimensions (1200x630px)
3. Ensure image is publicly accessible
4. Compress image if > 1MB
5. Use HTTPS (required by most platforms)

### Issue: Preview shows old content

**Solution:**
1. Update cache-control headers:
```typescript
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```
2. Force refresh on social platforms
3. Add version query parameter: `?v=2`

---

## 📚 Additional Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Prerender.io Documentation](https://docs.prerender.io/)

---

## 🎯 Success Metrics

Track these metrics post-SSR deployment:

- **Social Share Rate:** % of transactions shared
- **Click-Through Rate:** Social media → platform traffic
- **Referral Conversions:** New users from shares
- **Preview Load Time:** Time to display OG image
- **Cache Hit Rate:** % of cached vs fresh renders

---

## ✅ Deployment Checklist

Before production deployment:

- [ ] Test meta tags on all route types
- [ ] Validate OG images on Facebook Debugger
- [ ] Check Twitter Card preview
- [ ] Test LinkedIn preview
- [ ] Verify WhatsApp link preview
- [ ] Test with different user agents
- [ ] Check mobile social apps
- [ ] Monitor Lighthouse SEO score
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for OG images
- [ ] Enable image compression
- [ ] Set proper cache headers
- [ ] Test 404 page meta tags
- [ ] Verify canonical URLs

---

## 🚀 Quick Start Commands

```bash
# Development (current)
npm run dev

# Test SSR locally
npm run build
npm run preview

# Deploy to Vercel (with SSR)
vercel deploy --prod

# Test meta tags
curl -I https://tipz-stacks.com/creator/SP123...

# Validate OG image
curl https://tipz-stacks.com/creator/SP123... | grep "og:image"
```

---

**Last Updated:** December 2025  
**Maintained by:** Tipz Stacks Development Team  
**Version:** 1.0.0
