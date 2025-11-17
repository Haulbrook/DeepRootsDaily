# 🌱 Deep Roots Operations Dashboard V2

A modern, professional React redesign of the Deep Roots Landscape operations dashboard. Built with Next.js, TypeScript, and shadcn/ui.

## 🎯 Major Improvements Over V1

### ❌ **Removed: Picture-in-Picture iframes**
The old version loaded tools in nested iframes, wasting space and creating a "window within a window" experience.

### ✅ **New: Direct API Integration**
- Full-screen, native React interfaces
- Direct API calls to Google Apps Script backend
- Better space utilization
- Faster, more responsive
- Professional UI components

## 🚀 Features

- ✨ **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🌓 **Dark Mode** - Professional dark theme support
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 📊 **Data Visualization** - Charts and graphs (coming soon)
- ⚡ **Fast** - Next.js 14 with Turbopack
- 🔒 **Type Safe** - Full TypeScript support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand (ready to use)
- **Theme**: next-themes
- **Icons**: Lucide React

## 📦 Installation

1. **Clone and navigate to the project:**
   ```bash
   cd clipping-v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local` and add your Google Apps Script URLs:**
   ```env
   NEXT_PUBLIC_INVENTORY_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   NEXT_PUBLIC_GRADING_API_URL=...
   NEXT_PUBLIC_SCHEDULER_API_URL=...
   NEXT_PUBLIC_TOOLS_API_URL=...
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Google Apps Script Setup

Your existing Google Apps Script backend (code.js) should already have the necessary API endpoints:

- `askInventory(query)` - Search inventory
- `getInventoryReport()` - Get full report
- `checkLowStock()` - Get low stock alerts
- `updateInventory(data)` - Update items
- `getRecentActivity(limit)` - Get recent changes

Make sure your Apps Script is deployed as a web app with:
- Execute as: **User accessing the web app**
- Who has access: **Anyone**
- **CORS headers** enabled (already in your code.js)

## 📁 Project Structure

```
clipping-v2/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Dashboard home page
│   │   ├── inventory/          # Inventory tool page
│   │   ├── grading/            # Grading tool page (to be built)
│   │   ├── scheduler/          # Scheduler page (to be built)
│   │   └── tools/              # Tool checkout page (to be built)
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── app-sidebar.tsx     # Main navigation sidebar
│   │   ├── header.tsx          # Top header bar
│   │   ├── dashboard-home.tsx  # Dashboard homepage
│   │   └── dashboard-layout.tsx # Layout wrapper
│   ├── lib/                    # Utilities
│   │   └── utils.ts            # Helper functions (cn, etc.)
│   ├── services/               # API services
│   │   └── api.ts              # Google Apps Script API calls
│   ├── store/                  # Zustand state management (ready)
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Shared types
├── public/                     # Static assets
└── ...config files
```

## 🎨 Customization

### Adding New Tools

1. Create a new page in `src/app/[tool-name]/page.tsx`
2. Add the route to `src/components/app-sidebar.tsx`
3. Create API functions in `src/services/api.ts`
4. Define types in `src/types/index.ts`

### Styling

- Theme colors: Edit `src/app/globals.css`
- Components: All styled with Tailwind CSS
- Add new shadcn/ui components: `npx shadcn@latest add [component]`

## 📊 Available Pages

- ✅ **Dashboard** - Overview with stats and quick actions
- ✅ **Inventory** - Full inventory management (replaces iframe)
- 🚧 **Grading Tool** - Quality assessment (to be built)
- 🚧 **Scheduler** - Crew scheduling (to be built)
- 🚧 **Tool Checkout** - Hand tools rental (to be built)

## 🚀 Deployment

### Netlify (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables in Production

Don't forget to add your environment variables in your deployment platform:
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment Variables

## 📝 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔒 Security Notes

- All API calls use POST requests
- CORS is handled by your Google Apps Script
- Environment variables are prefixed with `NEXT_PUBLIC_` (client-safe)
- Never commit `.env.local` to version control

## 🆘 Troubleshooting

### API calls failing?
- Check that `.env.local` has correct URLs
- Verify Google Apps Script is deployed and accessible
- Check browser console for CORS errors

### Styling issues?
- Clear browser cache
- Restart development server
- Check that Tailwind is processing correctly

### Build errors?
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check for TypeScript errors

## 📄 License

MIT

## 🤝 Contributing

This is a custom business application for Deep Roots Landscape. Contact the development team for modifications.

---

**Built with ❤️ using Next.js and shadcn/ui**
