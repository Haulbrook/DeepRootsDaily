# 🚀 Deployment Guide - Deep Roots Operations Dashboard V2

## Prerequisites

Before deploying, ensure you have:
1. All Google Apps Script URLs from your backend tools
2. A Netlify account (free tier works great)
3. Git initialized in this project

## Step 1: Configure Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Google Apps Script URLs:
   ```env
   NEXT_PUBLIC_INVENTORY_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   NEXT_PUBLIC_GRADING_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   NEXT_PUBLIC_SCHEDULER_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   NEXT_PUBLIC_TOOLS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

## Step 2: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and test all features:
- ✅ Dashboard loads with charts
- ✅ Inventory search works
- ✅ All tool pages load correctly
- ✅ Dark mode toggles properly
- ✅ Mobile responsive design works

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify CLI (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize the site:
   ```bash
   netlify init
   ```

4. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

5. Add environment variables in Netlify:
   ```bash
   netlify env:set NEXT_PUBLIC_INVENTORY_API_URL "YOUR_URL_HERE"
   netlify env:set NEXT_PUBLIC_GRADING_API_URL "YOUR_URL_HERE"
   netlify env:set NEXT_PUBLIC_SCHEDULER_API_URL "YOUR_URL_HERE"
   netlify env:set NEXT_PUBLIC_TOOLS_API_URL "YOUR_URL_HERE"
   ```

### Option B: Deploy via Netlify Dashboard

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Deep Roots Dashboard V2"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [Netlify Dashboard](https://app.netlify.com)

3. Click "Add new site" → "Import an existing project"

4. Connect your GitHub repository

5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

6. Add environment variables:
   - Go to Site settings → Environment variables
   - Add all four NEXT_PUBLIC_* variables

7. Deploy!

## Step 4: Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings

2. Add your custom domain (e.g., `operations.deeproots.com`)

3. Update DNS records as instructed by Netlify

## Step 5: Verify Deployment

After deployment, test:

1. ✅ Visit your deployed URL
2. ✅ Test all navigation links
3. ✅ Verify API calls work (check browser console)
4. ✅ Test dark mode
5. ✅ Test on mobile device
6. ✅ Check all tool pages load correctly

## Troubleshooting

### Build Fails

**Issue**: Build fails with TypeScript errors
**Solution**: Run `npm run build` locally first to catch errors

**Issue**: Missing environment variables
**Solution**: Double-check all NEXT_PUBLIC_* vars are set in Netlify

### API Calls Not Working

**Issue**: CORS errors in browser console
**Solution**: Verify Google Apps Script has CORS headers enabled (it should from your existing code.js)

**Issue**: 404 on API calls
**Solution**: Double-check the Google Apps Script URLs are deployed as web apps

### Styling Issues

**Issue**: No styling on deployed site
**Solution**: Run `npm run build` locally to verify Tailwind compiles correctly

## Performance Optimization

After deployment, consider:

1. **Enable Netlify Analytics** for visitor insights
2. **Set up caching** for API responses
3. **Monitor** build times and optimize if needed
4. **Add** error tracking (e.g., Sentry)

## Continuous Deployment

With GitHub connected:
1. Push changes to `main` branch
2. Netlify automatically rebuilds and deploys
3. Preview deployments for pull requests

## Support

If you encounter issues:
1. Check Netlify deploy logs
2. Check browser console for errors
3. Verify environment variables are set
4. Test Google Apps Script endpoints directly

---

**Congratulations! Your modern operations dashboard is now live! 🎉**
