# Style Guide Page

This is the interactive style guide for the Core Render Portal design system.

## Accessing the Style Guide

**Local Development:**
- Start dev server: `npm run dev`
- Visit: [http://localhost:3000/styleguide](http://localhost:3000/styleguide)

**Production:**
- Visit: `https://your-domain.vercel.app/styleguide`

## Features

- ✅ Complete color palette with hex and RGB values
- ✅ Typography scale and font specifications
- ✅ Spacing system reference
- ✅ Interactive component examples
- ✅ Copy-paste code snippets
- ✅ Responsive design patterns
- ✅ Best practices guide
- ✅ Icon library reference
- ✅ Layout patterns and templates

## For Designers

If you prefer a static reference without running code:
- See `docs/DESIGN-SYSTEM.md` for comprehensive documentation
- See `docs/design-tokens.json` for importable design tokens
- Import color palette to Figma/Sketch from the JSON file

## For Developers

1. Import components from the layout library:
   ```tsx
   import { DashboardLayout } from '@/components/layout'
   ```

2. Use design tokens consistently:
   ```tsx
   bg-[#070e0e]  // Dark background
   bg-[#1a1e1f]  // Card background
   text-[#38bdbb] // Primary accent
   ```

3. Follow responsive patterns:
   ```tsx
   <div className="p-6 lg:p-8">
     <h1 className="text-3xl lg:text-5xl">Title</h1>
   </div>
   ```

## Quick Links

- Interactive Guide: `/styleguide`
- Full Documentation: `docs/DESIGN-SYSTEM.md`
- Design Tokens: `docs/design-tokens.json`
- Component Library: `components/layout/`

## Updating the Style Guide

When adding new components or patterns:

1. Add the component example to `app/styleguide/page.tsx`
2. Document it in `docs/DESIGN-SYSTEM.md`
3. Update design tokens in `docs/design-tokens.json` if needed
4. Test responsiveness on mobile, tablet, and desktop

---

*For questions, contact the development team.*

