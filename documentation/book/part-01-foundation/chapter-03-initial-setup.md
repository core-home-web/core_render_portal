# Chapter 3: Initial Project Setup

This chapter walks through creating the Next.js project from scratch, installing dependencies, and establishing the folder structure.

---

## Creating the Next.js Project

### Step 1: Initialize Project

```bash
# Navigate to your projects directory
cd ~/Projects

# Create Next.js project with TypeScript
npx create-next-app@14 core-render-portal --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

When prompted:
- **Would you like to use ESLint?** → Yes
- **Would you like to use Tailwind CSS?** → Yes
- **Would you like to use `src/` directory?** → No
- **Would you like to use App Router?** → Yes
- **Would you like to customize the default import alias?** → Yes, use `@/*`

### Step 2: Navigate to Project

```bash
cd core-render-portal
```

### Step 3: Verify Initial Structure

```bash
ls -la
```

You should see:
```
.
├── app/
├── public/
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Installing Dependencies

### Core Dependencies

```bash
# Supabase client
pnpm add @supabase/supabase-js

# UI Components (shadcn/ui dependencies)
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tooltip @radix-ui/react-checkbox

# Form handling
pnpm add react-hook-form @hookform/resolvers zod

# Icons
pnpm add lucide-react

# Whiteboard
pnpm add @excalidraw/excalidraw

# Email
pnpm add resend

# Date utilities (optional but helpful)
pnpm add date-fns
```

### Development Dependencies

```bash
# Testing
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom

# Code quality
pnpm add -D prettier prettier-plugin-tailwindcss
```

### Complete package.json

After installation, your `package.json` should look like this:

```json
{
  "name": "core-render-portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@excalidraw/excalidraw": "^0.17.0",
    "@hookform/resolvers": "^3.3.2",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/supabase-js": "^2.39.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.3",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.49.0",
    "resend": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.3",
    "jsdom": "^23.0.1",
    "postcss": "^8",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.9",
    "tailwindcss": "^3.3.0",
    "typescript": "^5",
    "vitest": "^1.0.4"
  }
}
```

---

## Creating the Folder Structure

### Create Required Directories

```bash
# Create main application directories
mkdir -p app/{api,auth,dashboard,project,projects,settings,styleguide}
mkdir -p app/api/{notify-collaborators,project,request-access,send-invitation,upload}
mkdir -p app/auth/{login,signup}
mkdir -p app/project/{new,success,invite}

# Create components directories
mkdir -p components/{ui,layout,auth,project,whiteboard,image-annotation}

# Create other directories
mkdir -p hooks
mkdir -p lib
mkdir -p types
mkdir -p tests
mkdir -p docs
mkdir -p public/images
```

### Final Directory Structure

```
core-render-portal/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── notify-collaborators/
│   │   │   └── route.ts
│   │   ├── project/
│   │   │   └── route.ts
│   │   ├── request-access/
│   │   │   └── route.ts
│   │   ├── send-invitation/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── project/
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── whiteboard/
│   │   │       └── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── invite/
│   │   │   └── [token]/
│   │   │       └── page.tsx
│   │   └── success/
│   │       └── page.tsx
│   ├── projects/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── ... (more UI components)
│   ├── layout/                   # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   ├── auth/                     # Auth components
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── project/                  # Project components
│   │   ├── edit-project-form.tsx
│   │   ├── collaborators-list.tsx
│   │   ├── invite-user-modal.tsx
│   │   ├── export-project-modal.tsx
│   │   └── ... (more project components)
│   ├── whiteboard/               # Whiteboard components
│   │   ├── ExcalidrawBoard.tsx
│   │   ├── CoreRenderBoard.tsx
│   │   └── index.ts
│   └── image-annotation/         # Annotation components
│       ├── AnnotationWorkspace.tsx
│       ├── ImageCanvas.tsx
│       ├── FileUpload.tsx
│       └── ... (more annotation components)
├── hooks/                        # Custom React hooks
│   ├── useProject.ts
│   ├── useProjectCollaboration.ts
│   ├── useExcalidrawBoard.ts
│   └── ... (more hooks)
├── lib/                          # Utility libraries
│   ├── supaClient.ts             # Supabase client
│   ├── supaAdmin.ts              # Supabase admin client
│   ├── auth-context.tsx          # Auth context provider
│   ├── theme-context.tsx         # Theme context provider
│   ├── utils.ts                  # Utility functions
│   └── ... (more utilities)
├── types/                        # TypeScript types
│   ├── index.ts                  # Main type definitions
│   └── schemas.ts                # Zod schemas
├── tests/                        # Test files
│   ├── setup.ts
│   └── example.test.ts
├── docs/                         # SQL scripts and docs
│   ├── PRODUCTION-SETUP-COMPLETE.sql
│   └── ... (more SQL files)
├── public/                       # Static assets
│   └── images/
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Example environment file
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── .prettierrc                  # Prettier configuration
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── vitest.config.ts             # Vitest configuration
```

---

## Configuration Files

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind Configuration (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

### ESLint Configuration (.eslintrc.json)

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "warn"
  }
}
```

### Prettier Configuration (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Next.js Configuration (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Allow Excalidraw assets
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### Vitest Configuration (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### Test Setup (tests/setup.ts)

```typescript
import '@testing-library/jest-dom'
```

---

## Creating Base Files

### Root Layout (app/layout.tsx)

```typescript
import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

const interTight = Inter_Tight({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter-tight',
})

export const metadata: Metadata = {
  title: 'Core Home Render Portal',
  description: 'Internal tool for managing 3D render projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interTight.variable} ${inter.className}`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-background">{children}</div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Global Styles (app/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 16% 4%;
    --foreground: 0 0% 98%;
    --primary: 174 50% 47%;
    --primary-foreground: 0 0% 100%;
    --secondary: 30 91% 61%;
    --secondary-foreground: 0 0% 100%;
    --muted: 220 14% 20%;
    --muted-foreground: 220 9% 46%;
    --accent: 220 14% 15%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 220 14% 20%;
    --input: 220 14% 20%;
    --ring: 174 50% 47%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Utility Functions (lib/utils.ts)

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Git Setup

### Initialize Repository

```bash
# Initialize git (if not already done)
git init

# Create initial commit
git add .
git commit -m "Initial project setup with Next.js 14"
```

### .gitignore (Should already exist)

Ensure these entries are present:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## Verify Setup

### Start Development Server

```bash
pnpm dev
```

You should see:
```
▲ Next.js 14.0.3
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2s
```

### Check Browser

1. Open http://localhost:3000
2. You should see the default Next.js page
3. No console errors

### Run Tests

```bash
pnpm test
```

Should pass with no errors.

### Type Check

```bash
pnpm type-check
```

Should complete with no errors.

---

## Chapter Summary

You have now:

1. Created a new Next.js 14 project with TypeScript
2. Installed all required dependencies
3. Set up the folder structure for the application
4. Configured TypeScript, Tailwind, ESLint, and Prettier
5. Created the base layout and global styles
6. Verified the development environment works

---

## Next Steps

The project structure is ready. Next, we'll configure the Supabase connection and environment variables.

---

*Next: [Chapter 4: Environment Configuration](./chapter-04-environment-config.md) - Connect to Supabase*
