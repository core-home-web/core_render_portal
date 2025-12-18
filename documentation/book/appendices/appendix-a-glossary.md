# Appendix A: Complete Glossary

This glossary defines all terms, concepts, and abbreviations used throughout the Core Render Portal documentation.

---

## A

### API (Application Programming Interface)
A set of rules that allows different software applications to communicate. In this project, API refers to the server endpoints in `app/api/`.

### API Routes
Next.js feature for creating server-side endpoints. Located in `app/api/`. Each `route.ts` file handles HTTP requests.

### App Router
Next.js 14's routing system using the `app/` directory. Supports Server Components, nested layouts, and more. Replaced the older Pages Router.

### Auth (Authentication)
The process of verifying a user's identity. Handled by Supabase Auth in this project using email/password authentication.

### Auto-save
Feature that automatically saves changes at regular intervals without user action. Used in the whiteboard to prevent data loss.

---

## B

### Backend
The server-side of the application. In this project, Supabase serves as the backend, providing database, auth, and storage.

### Board (Whiteboard)
The Excalidraw canvas used for visual project planning. Data stored in `project_boards` table as JSONB.

### BaaS (Backend as a Service)
A cloud service model that provides backend functionality without managing servers. Supabase is our BaaS provider.

### Bucket
A container for files in Supabase Storage. Similar to a folder. Examples: `project-images`, `profile-images`.

---

## C

### Cascade Delete
Database behavior where deleting a parent record automatically deletes related child records. Configured with `ON DELETE CASCADE`.

### CDN (Content Delivery Network)
A network of servers that deliver content based on user location. Supabase Storage uses CDN for fast file delivery.

### Client Component
A React component that runs in the browser. Marked with `'use client'` directive at the top of the file.

### Collaborator
A user who has been granted access to another user's project. Stored in `project_collaborators` table.

### Context (React Context)
React's built-in state management for sharing data across components without prop drilling. Used for auth and theme state.

### CORS (Cross-Origin Resource Sharing)
Security feature that restricts web pages from making requests to different domains. Configured in Next.js and Supabase.

### CSP (Content Security Policy)
HTTP headers that restrict which resources the browser can load. Configured in `next.config.js` to allow Excalidraw.

### CRUD
Create, Read, Update, Delete - the four basic operations for persistent storage.

---

## D

### Dashboard
The main page users see after logging in. Shows their projects, statistics, and activity.

### Debounce
A technique to limit how often a function runs. Used to prevent excessive API calls when user types or draws.

### Dynamic Import
Loading modules only when needed using `dynamic()` from Next.js. Used for Excalidraw to reduce initial bundle size.

### Due Date
Target completion date for a project. Stored in `projects.due_date` column.

---

## E

### Edge Function
Serverless function that runs close to users geographically. Vercel deploys Next.js API routes as edge functions.

### Element (Excalidraw)
A drawing object in Excalidraw (rectangle, text, arrow, line, etc.). Stored in the board snapshot.

### Environment Variable
Configuration values stored outside the code. Prefixed with `NEXT_PUBLIC_` for client-side access.

### Excalidraw
An open-source virtual whiteboard library. Powers the project's collaborative whiteboard feature.

---

## F

### Feature Branch
A Git branch created for developing a specific feature. Merged to main when complete.

### FK (Foreign Key)
A database column that references another table's primary key. Ensures referential integrity.

### Form Wizard
A multi-step form that guides users through a process. The project creation uses a 4-step wizard.

---

## G

### GoTrue
Supabase's authentication service. Based on the GoTrue open-source project.

---

## H

### Hero Image
The main image for a project item. Displayed prominently and can be annotated with part markers.

### Hook (React Hook)
A function that lets you use React features in functional components. Custom hooks start with `use`.

### Hydration
The process of making server-rendered HTML interactive on the client. React "hydrates" the static HTML.

---

## I

### Invitation
An email-based request to collaborate on a project. Contains a unique token that expires after 7 days.

### Invitation Token
A unique 64-character hex string that identifies a project invitation. Used in the invitation URL.

### Item
A product or object within a project that needs to be rendered. Contains name, hero image, and parts.

---

## J

### JSONB
PostgreSQL's binary JSON format. Used for storing complex nested data like items, parts, and board snapshots.

### JWT (JSON Web Token)
A secure way to transmit information between parties as a JSON object. Used for authentication.

---

## K

### Key (API Key)
A secret string used to authenticate API requests. Supabase provides `anon` (public) and `service_role` (admin) keys.

---

## L

### Layout
A React component that wraps pages and persists across navigations. Defined in `layout.tsx` files.

### Lint/Linter
A tool that analyzes code for potential errors. ESLint is used in this project.

---

## M

### Migration
SQL scripts that change the database schema. Should be run in order and are idempotent.

### Modal
A dialog box that overlays the main content. Used for invite user, export, etc.

---

## N

### Next.js
A React framework for building web applications. Version 14 with App Router is used in this project.

### Node.js
JavaScript runtime used to run the development server and build process. Version 18+ required.

---

## O

### Owner
The user who created a project. Has full control including deletion and managing collaborators.

---

## P

### Part
A component of an item with specifications (finish, color, texture). Can have annotation data linking to image position.

### Permission Level
Access rights for a collaborator: `view` (read-only), `edit` (modify project), or `admin` (full access).

### PKCE (Proof Key for Code Exchange)
A secure OAuth flow for single-page applications. Used by Supabase Auth.

### PK (Primary Key)
A unique identifier for a database row. Usually a UUID in this project.

### pnpm
A fast, disk space efficient package manager. Used instead of npm for this project.

### Policy (RLS Policy)
A rule that determines which rows a user can access. Defined using SQL and checked automatically.

### PostgreSQL
An open-source relational database. Version 15 via Supabase.

### Preview Deployment
A temporary deployment created for a feature branch. Vercel creates these automatically.

### Project
The main entity in the application. Contains title, retailer, items, and collaboration settings.

---

## R

### Radix UI
A library of unstyled, accessible UI primitives. Used by shadcn/ui components.

### Realtime
Supabase feature for live data synchronization via WebSocket. Powers collaboration features.

### Ref (React Ref)
A way to access DOM elements or React component instances directly. Created with `useRef`.

### Resend
Email delivery service used for sending invitation and notification emails.

### RLS (Row Level Security)
PostgreSQL feature that filters data based on policies. Ensures users only see data they have access to.

### RPC (Remote Procedure Call)
A function stored in the database that can be called from the client. Used for complex operations.

---

## S

### Server Component
A React component that renders only on the server. Default in Next.js App Router. Cannot use hooks like useState.

### Service Role Key
A Supabase API key with full database access, bypassing RLS. Used only on the server.

### Session
A period of authenticated interaction. Contains access token and refresh token.

### shadcn/ui
A collection of reusable React components. Built on Radix UI and Tailwind CSS. Not a package - components are copied.

### Snapshot (Board Snapshot)
The saved state of a whiteboard including all elements, app state, and embedded files.

### SSR (Server-Side Rendering)
Rendering React components on the server before sending to the client.

### Supabase
An open-source Firebase alternative. Provides auth, database, storage, and realtime subscriptions.

---

## T

### Tailwind CSS
A utility-first CSS framework for styling. Classes like `bg-blue-500` apply styles directly.

### Team
User's department: `product_development` or `industrial_design`. Affects UI theme colors.

### Theme
The color scheme of the application. Based on team selection (teal or orange).

### Throttle
Limiting function execution to a maximum rate. Similar to debounce but guarantees regular execution.

### Token
A unique identifier. Used for invitation links and authentication.

### TypeScript
A typed superset of JavaScript. Adds static types for better code quality and IDE support.

---

## U

### UUID (Universally Unique Identifier)
A standard format for unique IDs. 36-character string like `550e8400-e29b-41d4-a716-446655440000`.

### Upsert
A database operation that inserts a new row or updates an existing one. Used for settings.

---

## V

### Vercel
A platform for deploying web applications. Built by the Next.js team. Provides edge deployment.

### Version
A variation of a project item. Contains its own set of parts. Allows multiple configurations.

### Vitest
A fast unit testing framework. Used for testing React components and utility functions.

---

## W

### WebSocket
A protocol for real-time, bidirectional communication. Used by Supabase Realtime.

### Whiteboard
See Board. The Excalidraw canvas for visual project planning and collaboration.

### Wizard (Form Wizard)
A multi-step form interface that guides users through a process step by step.

---

## Z

### Zod
A TypeScript-first schema validation library. Used for validating form data and API inputs.

---

## Common Abbreviations Reference

| Abbreviation | Full Term |
|--------------|-----------|
| API | Application Programming Interface |
| BaaS | Backend as a Service |
| CDN | Content Delivery Network |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| CSP | Content Security Policy |
| FK | Foreign Key |
| JSONB | JSON Binary |
| JWT | JSON Web Token |
| PKCE | Proof Key for Code Exchange |
| PK | Primary Key |
| PR | Pull Request |
| RLS | Row Level Security |
| RPC | Remote Procedure Call |
| SSR | Server-Side Rendering |
| UUID | Universally Unique Identifier |

---

## Technology Versions

| Technology | Version Used |
|------------|--------------|
| Next.js | 14.x |
| React | 18.x |
| TypeScript | 5.x |
| Tailwind CSS | 3.x |
| Supabase | Latest |
| PostgreSQL | 15 |
| Node.js | 18+ |
| pnpm | 8+ |
| Excalidraw | 0.17+ |
| Vitest | 1.x |

---

*Return to [Table of Contents](../README.md)*
