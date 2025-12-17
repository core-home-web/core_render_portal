# Core Home Render Portal

An internal tool for managing 3D render projects with a structured multi-step workflow.

## 📖 Documentation

**For comprehensive documentation, see the [documentation/](./documentation/) folder.**

The documentation covers:
- [Getting Started](./documentation/01-getting-started/README.md) - Set up your development environment
- [Architecture](./documentation/02-architecture/README.md) - How the system works
- [Features](./documentation/03-features/README.md) - All features explained
- [Components](./documentation/04-components/README.md) - UI component reference
- [Hooks](./documentation/05-hooks/README.md) - Custom React hooks
- [API](./documentation/06-api/README.md) - API endpoints and functions
- [Database](./documentation/07-database/README.md) - Database schema and setup
- [Deployment](./documentation/08-deployment/README.md) - Deploy to production
- [Development](./documentation/09-development/README.md) - Coding standards and contributing

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

3. **Set up database**
   
   Run the setup script in Supabase SQL Editor:
   - `docs/PRODUCTION-SETUP-COMPLETE.sql`

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Visit the app**
   
   Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **Supabase** | Backend (auth, database, storage, realtime) |
| **Excalidraw** | Collaborative whiteboard |
| **Zod** | Schema validation |
| **Vitest** | Testing framework |

## 📋 Features

### Core Features

- ✅ Multi-step project creation form
- ✅ Project dashboard with listing
- ✅ Individual project view and editing
- ✅ Real-time collaboration on whiteboards
- ✅ Image annotation with part markers
- ✅ Project invitations and permissions
- ✅ Export to PNG, SVG, JSON, HTML
- ✅ Due date tracking
- ✅ Project history and restore

### Project Workflow

1. **Project Details**: Title, retailer, due date
2. **Items**: Add items with hero images
3. **Parts**: Configure parts (finish, color, texture)
4. **Review**: Final review and submission
5. **Collaborate**: Share with team members
6. **Whiteboard**: Visual planning with Excalidraw

## 📁 Project Structure

```
core-render-portal/
├── app/                    # Next.js pages and API routes
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── layout/             # Layout components
│   ├── project/            # Project-related components
│   ├── whiteboard/         # Whiteboard components
│   └── image-annotation/   # Image annotation components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and clients
├── types/                  # TypeScript types
├── docs/                   # SQL scripts and guides
├── documentation/          # Comprehensive documentation
└── tests/                  # Test files
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

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests |
| `pnpm type-check` | Check TypeScript types |

## 🚀 Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

See [Deployment Guide](./documentation/08-deployment/README.md) for details.

## 🐛 Troubleshooting

Common issues and solutions:
- See [Troubleshooting Guide](./documentation/08-deployment/troubleshooting.md)
- Check [ERROR LOGS AND SOLUTIONS/](./ERROR%20LOGS%20AND%20SOLUTIONS/) folder

## 📝 Contributing

See [Contributing Guide](./documentation/09-development/contributing.md) for:
- Development workflow
- Coding standards
- Pull request guidelines

## 📄 License

Internal use only.

---

Built with ❤️ using Next.js 14 and Supabase
