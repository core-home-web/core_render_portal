# Part 2: Database & Backend

This section covers setting up the complete database schema, security policies, stored procedures, and file storage configuration for the Core Render Portal.

## Chapters in This Part

| Chapter | Title | What You'll Learn |
|---------|-------|-------------------|
| [Chapter 6](./chapter-06-database-schema.md) | Database Schema | Complete table structures and relationships |
| [Chapter 7](./chapter-07-rls-policies.md) | Row Level Security | Security policies for data access control |
| [Chapter 8](./chapter-08-database-functions.md) | Database Functions | Stored procedures and RPC functions |
| [Chapter 9](./chapter-09-storage-setup.md) | Storage Setup | File upload buckets and policies |
| [Chapter 10](./chapter-10-migrations.md) | Database Migrations | Complete SQL setup scripts |

## Learning Objectives

After completing Part 2, you will have:

1. A fully configured PostgreSQL database with all required tables
2. Row Level Security policies protecting all data
3. Database functions for complex operations
4. Storage buckets configured for file uploads
5. Understanding of how to run migrations and maintain the schema

## Prerequisites

Before starting Part 2:

- Completed Part 1 (project setup with Supabase connection)
- Access to Supabase SQL Editor
- Understanding of basic SQL concepts

## Database Overview

The Core Render Portal uses 6 main tables:

| Table | Purpose |
|-------|---------|
| `projects` | Core project data with items in JSONB |
| `user_profiles` | User preferences and team assignment |
| `project_collaborators` | Users who have access to projects |
| `project_invitations` | Pending collaboration invitations |
| `project_logs` | Activity history for projects |
| `project_boards` | Whiteboard/Excalidraw snapshots |

## Time Estimate

| Chapter | Estimated Time |
|---------|---------------|
| Chapter 6 | 30 minutes |
| Chapter 7 | 30 minutes |
| Chapter 8 | 45 minutes |
| Chapter 9 | 20 minutes |
| Chapter 10 | 20 minutes |
| **Total** | **~2.5 hours** |

---

*Continue to [Chapter 6: Database Schema](./chapter-06-database-schema.md) to begin.*
