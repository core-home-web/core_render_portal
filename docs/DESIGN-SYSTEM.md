# Core Render Portal - Design System

**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Interactive Guide:** [http://localhost:3000/styleguide](http://localhost:3000/styleguide)

---

## 🎨 Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Teal (Primary)** | `#38bdbb` | 56, 189, 187 | CTAs, links, accents, active states |
| **Teal Hover** | `#2ea9a7` | 46, 169, 167 | Hover state for primary elements |
| **Orange (Secondary)** | `#f9903c` | 249, 144, 60 | Status badges, secondary actions |

### Background Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Dark Background** | `#070e0e` | 7, 14, 14 | Main page background |
| **Card Background** | `#1a1e1f` | 26, 30, 31 | Cards, sidebar, modals |
| **Card Hover** | `#222a31` | 34, 42, 49 | Hover state for cards |

### Text Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Primary Text** | `#ffffff` | 255, 255, 255 | Headings, body text |
| **Secondary Text** | `#595d60` | 89, 93, 96 | Muted text, descriptions |

### Tailwind Classes Reference

```css
/* Backgrounds */
bg-[#070e0e]  /* Main background */
bg-[#1a1e1f]  /* Cards */
bg-[#222a31]  /* Hover state */

/* Text */
text-white         /* Primary text */
text-[#595d60]     /* Secondary/muted text */
text-[#38bdbb]     /* Primary accent */
text-[#f9903c]     /* Secondary accent */

/* Borders */
border-gray-700    /* Standard borders */
border-gray-800    /* Subtle dividers */
```

---

## 📐 Typography

### Font Family
- **Primary:** Inter Tight
- **Fallback:** Inter, sans-serif
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Type Scale

| Element | Size | Tailwind Class | Weight | Line Height |
|---------|------|----------------|--------|-------------|
| **H1** | 40-48px | `text-4xl lg:text-5xl` | 500 (medium) | 1.2 |
| **H2** | 30px | `text-2xl lg:text-3xl` | 500 (medium) | 1.2 |
| **H3** | 20px | `text-xl` | 500 (medium) | 1.2 |
| **Body** | 15px | `text-base` | 400/500 | 1.2 |
| **Small** | 14px | `text-sm` | 400/500 | 1.2 |
| **Tiny** | 12px | `text-xs` | 400/500 | 1.2 |

### Typography Examples

```tsx
// Headings
<h1 className="text-4xl lg:text-5xl font-medium">Main Heading</h1>
<h2 className="text-2xl lg:text-3xl font-medium">Section Heading</h2>
<h3 className="text-xl font-medium">Subsection</h3>

// Body Text
<p className="text-base">Regular paragraph text</p>
<p className="text-[#595d60]">Muted text for descriptions</p>
<p className="text-sm">Small supporting text</p>
```

---

## 📏 Spacing System

Based on Tailwind's 4px base unit:

| Value | Pixels | Tailwind | Common Usage |
|-------|--------|----------|--------------|
| 2 | 8px | `p-2`, `gap-2` | Tight spacing, icon gaps |
| 3 | 12px | `p-3`, `gap-3` | Button padding, small gaps |
| 4 | 16px | `p-4`, `gap-4` | Standard spacing |
| 6 | 24px | `p-6`, `gap-6` | Card padding, section gaps |
| 8 | 32px | `p-8`, `gap-8` | Page padding |
| 12 | 48px | `p-12`, `mb-12` | Major section breaks |

### Responsive Padding Pattern

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Content scales padding with screen size */}
</div>
```

---

## 🎯 Components

### Buttons

#### Primary Button
```tsx
<button className="bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-6 py-2.5 rounded-lg transition-colors font-medium">
  Primary Action
</button>
```

#### Primary Button with Icon
```tsx
<button className="flex items-center gap-2 bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-5 py-2.5 rounded-lg transition-colors font-medium">
  <Plus className="w-4 h-4" />
  <span>New Project</span>
</button>
```

#### Text Link Button
```tsx
<button className="text-[#38bdbb] hover:text-[#2ea9a7] transition-colors text-sm font-medium">
  View Details
</button>
```

#### Icon Only Button
```tsx
<button className="text-[#595d60] hover:text-white transition-colors">
  <MoreVertical className="w-5 h-5" />
</button>
```

---

### Cards

#### Basic Card
```tsx
<div className="bg-[#1a1e1f] rounded-2xl p-6">
  <h3 className="text-xl font-medium mb-2">Card Title</h3>
  <p className="text-[#595d60]">Card description</p>
</div>
```

#### Hover Card
```tsx
<div className="bg-[#1a1e1f] hover:bg-[#222a31] rounded-2xl p-6 transition-colors cursor-pointer">
  <h3 className="text-xl font-medium mb-2">Interactive Card</h3>
  <p className="text-[#595d60]">Hovers to darker shade</p>
</div>
```

#### Card with Header Actions
```tsx
<div className="bg-[#1a1e1f] rounded-2xl p-6">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-xl font-medium">Card Title</h3>
    <button className="text-[#595d60] hover:text-white transition-colors">
      <MoreVertical className="w-5 h-5" />
    </button>
  </div>
  <p className="text-[#595d60]">Card content</p>
</div>
```

---

### Navigation

#### Sidebar Nav Link
```tsx
// Active State
<a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#222a31] text-[#38bdbb]">
  <Home className="w-5 h-5" />
  <span className="font-medium">Active Link</span>
</a>

// Inactive State
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#222a31] hover:text-[#38bdbb] transition-all">
  <CheckSquare className="w-5 h-5" />
  <span className="font-medium">Link</span>
</a>
```

---

### Tables

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
          Header
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-800 hover:bg-[#222a31] transition-colors">
        <td className="py-4 px-4">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### Badges & Status Tags

```tsx
// Primary
<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#38bdbb]/10 text-[#38bdbb]">
  Owner
</span>

// Secondary
<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#f9903c]/10 text-[#f9903c]">
  Collaborator
</span>

// Success
<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
  Completed
</span>
```

---

## 🔤 Icons

We use **Lucide React** icons throughout the application.

### Installation
```bash
npm install lucide-react
```

### Common Icons
- `Home` - Dashboard/home
- `CheckSquare` - Tasks/projects
- `BarChart3` - Statistics/analytics
- `Settings` - Settings/configuration
- `Plus` - Add/create actions
- `Calendar` - Dates/scheduling
- `MoreVertical` - Menu/options
- `Eye` - View/preview
- `Search` - Search functionality
- `Bell` - Notifications

### Usage
```tsx
import { Home, Plus, Settings } from 'lucide-react'

// Standard size (20px)
<Home className="w-5 h-5" />

// Large size (24px)
<Plus className="w-6 h-6" />

// With color
<Settings className="w-5 h-5 text-[#38bdbb]" />
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Size | Usage |
|------------|------|-------|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

### Responsive Patterns

```tsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Responsive Padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>

// Responsive Typography
<h1 className="text-3xl lg:text-5xl">
  Responsive Heading
</h1>

// Hide on Mobile
<div className="hidden lg:block">
  {/* Desktop only */}
</div>

// Show on Mobile Only
<div className="lg:hidden">
  {/* Mobile only */}
</div>
```

---

## 📋 Layout Patterns

### DashboardLayout Component

```tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function MyPage() {
  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Page content */}
      </div>
    </DashboardLayout>
  )
}
```

### Standard Page Layout

```tsx
<div className="p-8 lg:p-12 text-white">
  {/* Header */}
  <div className="mb-12">
    <h1 className="text-4xl font-medium mb-3">Page Title</h1>
    <p className="text-[#595d60]">Page description</p>
  </div>

  {/* Content Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</div>
```

---

## ✅ Best Practices

### Do's ✓
- ✓ Use consistent spacing (multiples of 4px)
- ✓ Apply hover states to all interactive elements
- ✓ Use `transition-colors` or `transition-all` for smooth animations
- ✓ Keep card padding consistent at `p-6`
- ✓ Use `rounded-2xl` (16px) for cards, `rounded-lg` (8px) for buttons
- ✓ Use `text-[#595d60]` for secondary/muted text
- ✓ Use `font-medium` (500) for headings and button text
- ✓ Include `overflow-x-auto` on tables for mobile
- ✓ Test responsive behavior at all breakpoints

### Don'ts ✗
- ✗ Don't use arbitrary colors outside the design palette
- ✗ Don't mix border radius sizes inconsistently
- ✗ Don't forget hover states on clickable elements
- ✗ Don't use `font-bold` unless specifically needed
- ✗ Don't forget transition classes for smooth animations
- ✗ Don't hardcode dimensions without considering responsive behavior
- ✗ Don't skip the `lg:` prefix for desktop-specific styling

---

## 🎨 Custom Scrollbar

```css
/* Add to your CSS */
.scroll::-webkit-scrollbar {
  height: 5px;
  width: 5px;
}

.scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0);
}

.scroll::-webkit-scrollbar-thumb {
  background: rgb(54, 188, 186);
  border-radius: 10px;
}
```

---

## 🚀 Quick Start for Developers

1. **Import the layout:**
   ```tsx
   import { DashboardLayout } from '@/components/layout/DashboardLayout'
   ```

2. **Use the color palette:**
   ```tsx
   bg-[#070e0e]  // Page background
   bg-[#1a1e1f]  // Cards
   text-[#38bdbb] // Primary accent
   text-[#595d60] // Muted text
   ```

3. **Follow the spacing system:**
   ```tsx
   p-6    // Card padding
   gap-6  // Grid gaps
   mb-12  // Section spacing
   ```

4. **Add transitions:**
   ```tsx
   className="... transition-colors hover:bg-[#222a31]"
   ```

---

## 📚 Resources

- **Interactive Style Guide:** [http://localhost:3000/styleguide](http://localhost:3000/styleguide)
- **Tailwind CSS Docs:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Lucide Icons:** [https://lucide.dev/](https://lucide.dev/)
- **Inter Font Family:** [https://fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)

---

**Questions?** Reach out to the development team or refer to the interactive style guide.

---

*Last updated: November 6, 2025*

