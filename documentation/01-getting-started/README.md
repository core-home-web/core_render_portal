# Getting Started

This section will guide you through setting up the Core Render Portal on your local machine.

## Overview

Setting up the project involves:

1. **[Prerequisites](./prerequisites.md)** - Install required tools
2. **[Installation](./installation.md)** - Clone and install dependencies
3. **[Environment Setup](./environment-setup.md)** - Configure Supabase
4. **[First Run](./first-run.md)** - Run the app and verify setup

## Time Estimate

| Step | Time |
|------|------|
| Prerequisites | 15-30 min (first time) |
| Installation | 5 min |
| Environment Setup | 20-30 min |
| First Run | 5 min |

**Total: ~1 hour** for first-time setup

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd core-render-portal
pnpm install

# Configure environment
cp env.example .env.local
# Edit .env.local with Supabase credentials

# Run database migrations (in Supabase SQL Editor)
# See docs/PRODUCTION-SETUP-COMPLETE.sql

# Start development
pnpm dev
```

---

Next: [Prerequisites](./prerequisites.md) →

