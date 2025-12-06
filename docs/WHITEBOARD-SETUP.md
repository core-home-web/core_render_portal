# Whiteboard Feature Setup Guide

This document describes how to set up and use the whiteboard feature in Core Render Portal.

## Overview

The whiteboard feature replaces the previous slide-based presentation editor with a tldraw-powered infinite canvas. It supports:

- **Drawing tools**: Rectangles, ellipses, arrows, lines, and freehand drawing
- **Rich text**: Add and format text anywhere on the canvas
- **Images**: Upload and place images on the whiteboard
- **Real-time collaboration**: Multiple users can edit simultaneously (requires sync server)
- **Persistence**: Boards are automatically saved to Supabase
- **HTML Export**: Export the whiteboard as a standalone HTML file

## Setup Steps

### 1. Database Setup

Run the following SQL scripts in your Supabase SQL Editor:

1. **Create the project_boards table:**
   ```
   docs/create-project-boards-table.sql
   ```

2. **Set up the storage bucket:**
   ```
   docs/setup-board-assets-storage.sql
   ```

### 2. Environment Variables

Add the following to your `.env.local`:

```bash
# Optional: tldraw Sync Server for real-time collaboration
# Leave empty to use local-only mode
NEXT_PUBLIC_TLDRAW_SYNC_URL=
```

### 3. Real-time Collaboration (Optional)

For real-time collaboration, you need to deploy a tldraw sync server:

1. Navigate to `tldraw-sync-server/`
2. Follow the instructions in `tldraw-sync-server/README.md`
3. Deploy to Cloudflare Workers
4. Update `NEXT_PUBLIC_TLDRAW_SYNC_URL` with your deployed URL

## Usage

### Opening the Whiteboard

1. Navigate to a project page
2. Click the **"Whiteboard"** button in the header
3. The whiteboard modal will open with an infinite canvas

### Using the Whiteboard

- **Select tool**: Click on shapes to select them
- **Draw shapes**: Use the toolbar to create rectangles, ellipses, arrows
- **Add text**: Click the text tool and click anywhere to add text
- **Upload images**: Drag and drop images onto the canvas
- **Pan/Zoom**: Use scroll wheel to zoom, drag with middle mouse to pan
- **Undo/Redo**: Use Ctrl+Z / Ctrl+Shift+Z

### Exporting

Click the **"Export HTML"** button to download the whiteboard as a standalone HTML file that can be shared via email or opened in any browser.

### Saving

- **Auto-save**: Changes are automatically saved every 5 seconds
- **Manual save**: Click the **"Save"** button to save immediately
- A "Saved" indicator shows the last save time

## Architecture

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `CoreRenderBoard` | `components/whiteboard/CoreRenderBoard.tsx` | Main whiteboard component |
| `VisualEditorModal` | `components/project/visual-editor-modal.tsx` | Modal wrapper for the whiteboard |

### Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useProjectBoard` | `hooks/useProjectBoard.ts` | Manages board data and persistence |

### Utilities

| File | Description |
|------|-------------|
| `lib/board-asset-store.ts` | Handles image uploads to Supabase Storage |
| `lib/whiteboard-html-generator.ts` | Generates HTML exports from whiteboard |

### Database

| Table | Description |
|-------|-------------|
| `project_boards` | Stores board snapshots as JSONB |

| Function | Description |
|----------|-------------|
| `get_or_create_project_board` | Creates board if not exists, returns board data |
| `save_project_board` | Saves board snapshot |

### Storage

| Bucket | Description |
|--------|-------------|
| `board-assets` | Stores uploaded images organized by project |

## Troubleshooting

### Board not loading

1. Check browser console for errors
2. Verify the `project_boards` table exists
3. Check RLS policies are correct

### Images not uploading

1. Verify the `board-assets` bucket exists
2. Check storage policies allow authenticated uploads
3. Verify file size is under 50MB

### Real-time sync not working

1. Check `NEXT_PUBLIC_TLDRAW_SYNC_URL` is set correctly
2. Verify the sync server is running
3. Check WebSocket connections in browser DevTools

## Migration from Slides

The previous slide-based editor has been removed. Any slides stored in localStorage will no longer be accessible. The new whiteboard provides:

- More flexibility in layout
- Better drawing and annotation tools
- Real-time collaboration support
- Persistent storage in the database

## Dependencies

The whiteboard feature uses:

- `tldraw` - The canvas editor
- `@tldraw/sync` - Real-time collaboration (optional)
- Supabase Storage - Asset storage
- Supabase Postgres - Board persistence
