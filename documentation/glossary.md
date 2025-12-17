# Glossary

Key terms and concepts used in the Core Render Portal.

## A

### API (Application Programming Interface)
A set of rules that allows different software applications to communicate. In this project, API refers to the server endpoints in `app/api/`.

### API Routes
Next.js feature for creating server-side endpoints. Located in `app/api/`.

### App Router
Next.js 14's routing system using the `app/` directory. Supports Server Components, nested layouts, and more.

### Auth (Authentication)
The process of verifying a user's identity. Handled by Supabase Auth in this project.

## B

### Backend
The server-side of the application. In this project, Supabase serves as the backend.

### Board (Whiteboard)
The Excalidraw canvas used for visual project planning. Data stored in `project_boards` table.

### BaaS (Backend as a Service)
A cloud service model that provides backend functionality. Supabase is our BaaS.

## C

### Client Component
A React component that runs in the browser. Marked with `'use client'` directive.

### Collaborator
A user who has been granted access to another user's project.

### CSP (Content Security Policy)
HTTP headers that restrict which resources the browser can load. Configured in `next.config.js`.

## D

### Dashboard
The main page users see after logging in. Shows their projects and activity.

### Debounce
A technique to limit how often a function runs. Used to prevent excessive API calls.

### Dynamic Import
Loading modules only when needed. Used for Excalidraw to reduce initial bundle size.

## E

### Excalidraw
An open-source virtual whiteboard library. Powers the project's whiteboard feature.

### Element (Excalidraw)
A drawing object in Excalidraw (rectangle, text, arrow, etc.).

## F

### Feature Branch
A Git branch created for developing a specific feature.

### FK (Foreign Key)
A database column that references another table's primary key.

## H

### Hero Image
The main image for a project item. Displayed prominently and can be annotated.

### Hook (React Hook)
A function that lets you use React features in functional components. Starts with `use`.

### Hydration
The process of making server-rendered HTML interactive on the client.

## I

### Invitation
An email-based request to collaborate on a project.

### Item
A product or object within a project that needs to be rendered.

## J

### JSONB
PostgreSQL's binary JSON format. Used for storing items, parts, and board data.

### JWT (JSON Web Token)
A secure way to transmit information between parties. Used for authentication.

## L

### Layout
A React component that wraps pages and persists across navigations.

### Lint/Linter
A tool that analyzes code for potential errors. ESLint is used in this project.

## M

### Migration
SQL scripts that change the database schema.

### Modal
A dialog box that overlays the main content.

## N

### Next.js
A React framework for building web applications. Version 14 with App Router.

## O

### Owner
The user who created a project. Has full control including deletion.

## P

### Part
A component of an item with specifications (finish, color, texture).

### Permission Level
Access rights for a collaborator: view, edit, or admin.

### PK (Primary Key)
A unique identifier for a database row.

### Preview Deployment
A temporary deployment created for a feature branch.

### Project
The main entity in the application. Contains items, versions, and parts.

## R

### RLS (Row Level Security)
PostgreSQL feature that filters data based on policies. Ensures users only see their data.

### RPC (Remote Procedure Call)
A function stored in the database that can be called from the client.

### Realtime
Supabase feature for live data synchronization. Powers collaboration.

## S

### Server Component
A React component that renders only on the server. Default in Next.js App Router.

### shadcn/ui
A collection of reusable React components. Built on Radix UI and Tailwind CSS.

### Snapshot (Board Snapshot)
The saved state of a whiteboard including all elements.

### Supabase
An open-source Firebase alternative. Provides auth, database, storage, and realtime.

## T

### Tailwind CSS
A utility-first CSS framework for styling.

### Team
User's department: Product Development or Industrial Design. Affects UI theme.

### Theme
The color scheme of the application. Based on team selection.

### Throttle
Limiting function execution to a maximum rate. Used for cursor updates.

### Token (Invitation Token)
A unique identifier for a project invitation link.

### TypeScript
A typed superset of JavaScript. Adds static types for better code quality.

## U

### UUID (Universally Unique Identifier)
A standard format for unique IDs. Used for all primary keys.

## V

### Vercel
A platform for deploying web applications. Built by the Next.js team.

### Version
A variation of a project item. Contains its own set of parts.

## W

### Whiteboard
See Board. The Excalidraw canvas for visual planning.

### Worktree
A Git feature allowing multiple working directories for the same repository.

## Z

### Zod
A TypeScript-first schema validation library. Used for validating data.

---

## Common Abbreviations

| Abbreviation | Full Term |
|--------------|-----------|
| API | Application Programming Interface |
| BaaS | Backend as a Service |
| CRUD | Create, Read, Update, Delete |
| CSP | Content Security Policy |
| FK | Foreign Key |
| JSONB | JSON Binary |
| JWT | JSON Web Token |
| PK | Primary Key |
| PR | Pull Request |
| RLS | Row Level Security |
| RPC | Remote Procedure Call |
| UUID | Universally Unique Identifier |

---

← [Contributing](./09-development/contributing.md) | Back to [Home](./README.md) →

