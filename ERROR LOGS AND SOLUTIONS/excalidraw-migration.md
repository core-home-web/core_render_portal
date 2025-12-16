# Excalidraw Migration Log

## Migration Overview

**Date:** December 2024  
**From:** tldraw whiteboard library  
**To:** Excalidraw whiteboard library  

## Reason for Migration

The original tldraw implementation had persistent issues:
1. Board going blank after loading due to re-render loops
2. Toolbar visibility issues caused by CSS conflicts
3. Auto-save causing data corruption
4. Complex sync server requirements for collaboration

Excalidraw was chosen because:
- Built-in collaboration support
- More robust persistence patterns
- Hand-drawn aesthetic fits project presentation needs
- Active maintenance and documentation

## Files Created

### New Components
- `components/whiteboard/ExcalidrawBoard.tsx` - Main Excalidraw wrapper
- `components/whiteboard/ExportMenu.tsx` - Export functionality
- `components/whiteboard/initializeProjectBoard.ts` - Board initialization

### New Hooks
- `hooks/useExcalidrawBoard.ts` - Persistence layer for Excalidraw
- `hooks/useExcalidrawCollab.ts` - Real-time collaboration

### New Utilities
- `lib/excalidraw-utils.ts` - Element creation utilities

## Files Modified

- `next.config.js` - Updated CSP headers for Excalidraw CDN
- `components/whiteboard/index.ts` - Added new exports
- `components/project/visual-editor-modal.tsx` - Replaced tldraw with Excalidraw

## Known Issues and Solutions

### Issue 1: SSR Compatibility

**Problem:** Excalidraw requires browser APIs and fails during server-side rendering.

**Solution:** Use Next.js dynamic import with `ssr: false`:
```typescript
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)
```

### Issue 2: CSP Violations

**Problem:** Excalidraw loads resources from CDN which were blocked by CSP.

**Solution:** Updated `next.config.js` to allow Excalidraw domains:
```javascript
const excalidrawSources = 'https://excalidraw.com https://*.excalidraw.com https://unpkg.com'
```

### Issue 3: Legacy Data Format

**Problem:** Existing boards used tldraw format (store + schema), not Excalidraw (elements array).

**Solution:** Detect legacy format and start with fresh board:
```typescript
if (snapshot.store) {
  // Legacy tldraw format - start fresh
  console.log('Legacy tldraw format detected, starting with empty board')
  boardSnapshot = {}
}
```

### Issue 4: Type Mismatches

**Problem:** Excalidraw types are complex and not all exported cleanly.

**Solution:** Import types directly from Excalidraw types path:
```typescript
import type {
  ExcalidrawElement,
  AppState,
  BinaryFiles,
} from '@excalidraw/excalidraw/types/types'
```

### Issue 5: Export Utilities Not Tree-Shakeable

**Problem:** Importing export utilities caused bundle size issues.

**Solution:** Lazy load export utilities:
```typescript
async function loadExportUtils() {
  if (!exportUtils) {
    const excalidraw = await import('@excalidraw/excalidraw')
    exportUtils = {
      exportToBlob: excalidraw.exportToBlob,
      // ...
    }
  }
  return exportUtils
}
```

## Migration Checklist

- [x] Install @excalidraw/excalidraw package
- [x] Update CSP headers
- [x] Create ExcalidrawBoard component
- [x] Create persistence hook
- [x] Create collaboration hook
- [x] Create element utilities
- [x] Create export menu
- [x] Update visual-editor-modal
- [x] Create documentation
- [ ] Remove tldraw package (after verification)
- [ ] Test with existing projects
- [ ] Deploy to production

## Rollback Plan

If issues arise, revert to tldraw:

1. Restore `visual-editor-modal.tsx` to use `CoreRenderBoard`
2. Keep new Excalidraw files but don't use them
3. The legacy tldraw code is preserved in:
   - `components/whiteboard/CoreRenderBoard.tsx`
   - `hooks/useProjectBoard.ts`

## Testing Notes

### Manual Testing Required

1. Open whiteboard for project with existing data
2. Create new shapes, text, and drawings
3. Close and reopen - verify persistence
4. Test with two browser windows for collaboration
5. Export to all formats (PNG, SVG, JSON, HTML)
6. Test on mobile viewport

### Automated Testing

TODO: Add E2E tests for:
- Board loading
- Element creation
- Save/load cycle
- Export functionality
