# Data Flow

How data moves through the application.

## Request Flow

```
User Action → React Component → Custom Hook → Supabase Client → Database
```

## Authentication Flow

```
Login Form → Supabase Auth → JWT Token → Cookie → Auth Context
```

## Project CRUD Flow

```
Form Submit → Zod Validation → Supabase Insert → RLS Check → Database
```

## Real-time Collaboration

```
User A draws → broadcastElements() → Supabase Realtime → onRemoteChange() → User B
```

## File Upload Flow

```
Select File → Upload Component → Supabase Storage → Public URL → Store in Project
```

## State Management

| Type | Where | Example |
|------|-------|---------|
| Local State | useState | Form inputs, modals |
| Server State | Supabase + Hooks | Projects, users |
| Context State | React Context | Auth, theme |

---

← [Folder Structure](./folder-structure.md) | Next: [Database Schema](./database-schema.md) →

