# Core Home Render Portal

An internal tool for managing 3D render projects with a structured multi-step workflow.

## 🚀 Quick Start

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd core-render-portal
   pnpm install
   ```

2. **Set up environment**

   ```bash
   cp env.example .env.local
   # Add your Supabase credentials to .env.local
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Visit the app**
   Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI**: shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## 📋 Features

### MVP Features

- ✅ Multi-step project creation form
- ✅ Project dashboard with listing
- ✅ Individual project view (read-only)
- ✅ Supabase integration
- ✅ Form validation with Zod
- ✅ Responsive UI with shadcn/ui
- ✅ TypeScript throughout
- ✅ Testing setup with Vitest
- ✅ Code quality tools

### Form Steps

1. **Project Details**: Title, retailer information
2. **Items**: Add items to render with hero images
3. **Parts**: Configure parts for each item (finish, color, texture, files)
4. **Review**: Final review and submission

## 📁 Project Structure

```
core_render_portal/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions & clients
├── types/                 # TypeScript types & Zod schemas
├── tests/                 # Test files
└── docs/                  # Documentation
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## 📚 Documentation

See [docs/instructions.mdc](./docs/instructions.mdc) for comprehensive documentation including:

- Architecture overview
- Database schema
- API endpoints
- Development workflow
- Future roadmap

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

## 🚀 Deployment

The app is ready to deploy to Vercel, Netlify, or any other hosting platform that supports Next.js.

## 📝 License

Internal use only.

---

Built with ❤️ using Next.js 14 and Supabase
