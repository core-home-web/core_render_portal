# Export

The export feature allows users to export project data and whiteboards in various formats.

## Overview

Export options include:
- **Whiteboard exports:** PNG, SVG, JSON, HTML
- **Project exports:** Data export, presentations

## Whiteboard Export

### PNG Export

High-quality raster image of the whiteboard.

```typescript
async function exportToPng(api: ExcalidrawImperativeAPI): Promise<Blob> {
  const { exportToBlob } = await import('@excalidraw/excalidraw')
  
  const blob = await exportToBlob({
    elements: api.getSceneElements(),
    appState: api.getAppState(),
    files: api.getFiles(),
    mimeType: 'image/png',
    quality: 1
  })
  
  return blob
}

// Usage
const blob = await exportToPng(excalidrawApi)
saveAs(blob, 'whiteboard.png')
```

### SVG Export

Scalable vector graphics (resolution-independent).

```typescript
async function exportToSvg(api: ExcalidrawImperativeAPI): Promise<SVGSVGElement> {
  const { exportToSvg } = await import('@excalidraw/excalidraw')
  
  const svg = await exportToSvg({
    elements: api.getSceneElements(),
    appState: api.getAppState(),
    files: api.getFiles()
  })
  
  return svg
}

// Convert to blob and save
const svgString = new XMLSerializer().serializeToString(svg)
const blob = new Blob([svgString], { type: 'image/svg+xml' })
saveAs(blob, 'whiteboard.svg')
```

### JSON Export

Excalidraw-compatible JSON file.

```typescript
function exportToJson(api: ExcalidrawImperativeAPI): string {
  const data = {
    type: 'excalidraw',
    version: 2,
    source: 'core-render-portal',
    elements: api.getSceneElements(),
    appState: {
      viewBackgroundColor: api.getAppState().viewBackgroundColor
    },
    files: api.getFiles()
  }
  
  return JSON.stringify(data, null, 2)
}

// Save as file
const json = exportToJson(excalidrawApi)
const blob = new Blob([json], { type: 'application/json' })
saveAs(blob, 'whiteboard.excalidraw')
```

### HTML Export

Standalone HTML presentation that can be shared.

```typescript
async function exportToHtml(api: ExcalidrawImperativeAPI): Promise<string> {
  const svgElement = await exportToSvg(api)
  const svgString = new XMLSerializer().serializeToString(svgElement)
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Whiteboard Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh;
      background: #f5f5f5;
    }
    .container { 
      max-width: 100%; 
      padding: 20px; 
    }
    svg { 
      max-width: 100%; 
      height: auto; 
    }
  </style>
</head>
<body>
  <div class="container">
    ${svgString}
  </div>
</body>
</html>`
  
  return html
}

// Save as file
const html = await exportToHtml(excalidrawApi)
const blob = new Blob([html], { type: 'text/html' })
saveAs(blob, 'whiteboard.html')
```

## Export Menu Component

```typescript
// components/whiteboard/ExportMenu.tsx
import { saveAs } from 'file-saver'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

export function ExportMenu({ boardRef }) {
  const handleExport = async (format: 'png' | 'svg' | 'json' | 'html') => {
    if (!boardRef.current) return

    try {
      switch (format) {
        case 'png': {
          const blob = await boardRef.current.exportToPng()
          saveAs(blob, `whiteboard-${Date.now()}.png`)
          break
        }
        case 'svg': {
          const svg = await boardRef.current.exportToSvg()
          const svgString = new XMLSerializer().serializeToString(svg)
          const blob = new Blob([svgString], { type: 'image/svg+xml' })
          saveAs(blob, `whiteboard-${Date.now()}.svg`)
          break
        }
        case 'json': {
          const json = boardRef.current.exportToJson()
          const blob = new Blob([json], { type: 'application/json' })
          saveAs(blob, `whiteboard-${Date.now()}.excalidraw`)
          break
        }
        case 'html': {
          const html = await generateHtmlPresentation(boardRef.current)
          const blob = new Blob([html], { type: 'text/html' })
          saveAs(blob, `whiteboard-${Date.now()}.html`)
          break
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('png')}>
          <ImageIcon className="mr-2 h-4 w-4" />
          PNG Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('svg')}>
          <FileIcon className="mr-2 h-4 w-4" />
          SVG Vector
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <CodeIcon className="mr-2 h-4 w-4" />
          Excalidraw File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('html')}>
          <GlobeIcon className="mr-2 h-4 w-4" />
          HTML Presentation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Project Data Export

Export project data as JSON:

```typescript
function exportProjectData(project: Project): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    project: {
      title: project.title,
      retailer: project.retailer,
      due_date: project.due_date,
      items: project.items.map(item => ({
        name: item.name,
        hero_image: item.hero_image,
        versions: item.versions?.map(version => ({
          versionNumber: version.versionNumber,
          versionName: version.versionName,
          parts: version.parts.map(part => ({
            name: part.name,
            finish: part.finish,
            color: part.color,
            texture: part.texture,
            notes: part.notes
          }))
        }))
      }))
    }
  }, null, 2)
}
```

## File Saver

The project uses `file-saver` for downloading files:

```typescript
import { saveAs } from 'file-saver'

// Save a blob as a file
saveAs(blob, 'filename.ext')

// Save text content
const blob = new Blob(['content'], { type: 'text/plain' })
saveAs(blob, 'file.txt')
```

## Export Quality Settings

### PNG Quality

```typescript
const blob = await exportToBlob({
  elements,
  appState,
  files,
  mimeType: 'image/png',
  quality: 1,         // 0-1 (1 = highest)
  exportPadding: 10,  // Padding around content
  scale: 2            // 2x resolution for retina
})
```

### SVG Optimization

```typescript
const svg = await exportToSvg({
  elements,
  appState,
  files,
  exportPadding: 10,
  exportWithDarkMode: false
})
```

## Related Files

| File | Purpose |
|------|---------|
| `components/whiteboard/ExportMenu.tsx` | Export dropdown |
| `lib/html-presentation-generator.ts` | HTML generation |
| `lib/whiteboard-html-generator.ts` | Whiteboard HTML |
| `hooks/usePowerPointExport.ts` | Presentation export |

## Troubleshooting

### Export Fails Silently

- Check browser console for errors
- Verify board has content
- Check file-saver is installed

### PNG Quality Low

- Increase `scale` parameter
- Use higher `quality` value
- Check monitor resolution

### SVG Not Rendering

- Verify SVG serialization
- Check for invalid characters
- Test in different browsers

### HTML Export Broken

- Validate HTML structure
- Check SVG embedding
- Test CSS compatibility

---

← [Image Annotation](./image-annotation.md) | Next: [Components Overview](../04-components/README.md) →

