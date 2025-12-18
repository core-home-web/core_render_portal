# Chapter 20: Export Functionality

This chapter covers exporting project data and whiteboard content to various formats.

---

## Export Formats

The Render Portal supports multiple export formats:

| Format | Use Case | Source |
|--------|----------|--------|
| **PNG** | Whiteboard images | Excalidraw |
| **SVG** | Scalable graphics | Excalidraw |
| **JSON** | Data backup/restore | Project data |
| **HTML** | Presentations | Generated HTML |

---

## Export Hook

```typescript
// File: hooks/usePowerPointExport.ts

import { useState, useCallback } from 'react'
import { Project } from '@/types'

export function useExport() {
  const [exporting, setExporting] = useState(false)

  // Export project data as JSON
  const exportToJson = useCallback((project: Project) => {
    const dataStr = JSON.stringify(project, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    downloadBlob(blob, `${project.title}-export.json`)
  }, [])

  // Export as HTML presentation
  const exportToHtml = useCallback((project: Project) => {
    const html = generateHtmlPresentation(project)
    const blob = new Blob([html], { type: 'text/html' })
    downloadBlob(blob, `${project.title}-presentation.html`)
  }, [])

  // Export whiteboard as PNG
  const exportWhiteboardPng = useCallback(async (boardRef: any) => {
    setExporting(true)
    try {
      const blob = await boardRef.current?.exportToPng()
      if (blob) {
        downloadBlob(blob, 'whiteboard.png')
      }
    } finally {
      setExporting(false)
    }
  }, [])

  // Export whiteboard as SVG
  const exportWhiteboardSvg = useCallback(async (boardRef: any) => {
    setExporting(true)
    try {
      const svg = await boardRef.current?.exportToSvg()
      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        downloadBlob(blob, 'whiteboard.svg')
      }
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    exportToJson,
    exportToHtml,
    exportWhiteboardPng,
    exportWhiteboardSvg,
    exporting,
  }
}

// Helper to trigger download
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Generate HTML presentation
function generateHtmlPresentation(project: Project): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title} - Render Specifications</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #070e0e;
      color: white;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 60px;
      padding: 40px;
      background: linear-gradient(135deg, #1a1e1f 0%, #222a31 100%);
      border-radius: 20px;
    }
    .title { font-size: 48px; margin-bottom: 16px; color: #38bdbb; }
    .subtitle { font-size: 24px; color: #595d60; }
    .item {
      background: #1a1e1f;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
    }
    .item-name { font-size: 28px; margin-bottom: 24px; }
    .item-image {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .parts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .part {
      background: #0d1117;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #38bdbb;
    }
    .part-name { font-weight: 600; margin-bottom: 12px; }
    .part-detail { font-size: 14px; color: #595d60; margin: 4px 0; }
    .part-detail span { color: white; }
    .color-swatch {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      vertical-align: middle;
      margin-right: 8px;
      border: 1px solid #333;
    }
    @media print {
      body { background: white; color: black; }
      .header { background: #f0f0f0; }
      .title { color: #38bdbb; }
      .item { background: #f5f5f5; page-break-inside: avoid; }
      .part { background: white; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${project.title}</h1>
    <p class="subtitle">Retailer: ${project.retailer}</p>
    ${project.due_date ? `<p class="subtitle">Due: ${new Date(project.due_date).toLocaleDateString()}</p>` : ''}
  </div>

  ${project.items.map((item, i) => `
    <div class="item">
      <h2 class="item-name">${item.name || `Item ${i + 1}`}</h2>
      ${item.hero_image ? `<img src="${item.hero_image}" alt="${item.name}" class="item-image">` : ''}
      ${item.parts && item.parts.length > 0 ? `
        <div class="parts-grid">
          ${item.parts.map(part => `
            <div class="part">
              <div class="part-name">${part.name}</div>
              <p class="part-detail">Finish: <span>${part.finish}</span></p>
              <p class="part-detail">
                Color: 
                ${part.color ? `<span class="color-swatch" style="background-color: ${part.color}"></span>` : ''}
                <span>${part.color || 'Not specified'}</span>
              </p>
              <p class="part-detail">Texture: <span>${part.texture}</span></p>
            </div>
          `).join('')}
        </div>
      ` : '<p style="color: #595d60;">No parts configured</p>'}
    </div>
  `).join('')}
</body>
</html>
  `
}
```

---

## Export Modal Component

```typescript
// File: components/project/export-project-modal.tsx

'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { useExport } from '@/hooks/usePowerPointExport'
import { Project } from '@/types'
import { X, Download, FileJson, FileImage, FileCode } from 'lucide-react'

interface ExportModalProps {
  project: Project
  boardRef?: React.RefObject<any>
  isOpen: boolean
  onClose: () => void
}

export function ExportProjectModal({ project, boardRef, isOpen, onClose }: ExportModalProps) {
  const { colors } = useTheme()
  const { exportToJson, exportToHtml, exportWhiteboardPng, exportWhiteboardSvg, exporting } = useExport()

  if (!isOpen) return null

  const exportOptions = [
    {
      id: 'json',
      label: 'JSON Data',
      description: 'Export project data for backup',
      icon: FileJson,
      onClick: () => exportToJson(project),
    },
    {
      id: 'html',
      label: 'HTML Presentation',
      description: 'Printable specification document',
      icon: FileCode,
      onClick: () => exportToHtml(project),
    },
    ...(boardRef ? [
      {
        id: 'png',
        label: 'Whiteboard PNG',
        description: 'Export whiteboard as image',
        icon: FileImage,
        onClick: () => exportWhiteboardPng(boardRef),
      },
      {
        id: 'svg',
        label: 'Whiteboard SVG',
        description: 'Export whiteboard as vector',
        icon: FileImage,
        onClick: () => exportWhiteboardSvg(boardRef),
      },
    ] : []),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-[#1a1e1f] rounded-2xl p-8 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
            <Download className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <h2 className="text-xl font-medium text-white">Export Project</h2>
        </div>

        <div className="space-y-3">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-4 bg-[#0d1117] rounded-lg hover:bg-[#161b22] transition-colors text-left"
            >
              <option.icon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Excalidraw Export Utilities

```typescript
// File: components/whiteboard/ExportMenu.tsx

import { useState } from 'react'
import { Download, Image, FileCode2 } from 'lucide-react'

interface ExportMenuProps {
  boardRef: React.RefObject<any>
}

export function ExportMenu({ boardRef }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportPng = async () => {
    if (!boardRef.current) return
    setExporting(true)
    
    try {
      const blob = await boardRef.current.exportToPng({ scale: 2 })
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'whiteboard.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(false)
    }
  }

  const handleExportSvg = async () => {
    if (!boardRef.current) return
    setExporting(true)
    
    try {
      const svg = await boardRef.current.exportToSvg()
      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'whiteboard.svg'
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(false)
    }
  }

  const handleExportJson = async () => {
    if (!boardRef.current) return
    
    const json = await boardRef.current.exportToJson()
    if (json) {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'whiteboard.excalidraw'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportPng}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded text-white text-sm hover:bg-gray-600"
      >
        <Image className="w-4 h-4" />
        PNG
      </button>
      <button
        onClick={handleExportSvg}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded text-white text-sm hover:bg-gray-600"
      >
        <FileCode2 className="w-4 h-4" />
        SVG
      </button>
      <button
        onClick={handleExportJson}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded text-white text-sm hover:bg-gray-600"
      >
        <Download className="w-4 h-4" />
        JSON
      </button>
    </div>
  )
}
```

---

## Chapter Summary

Export functionality includes:

1. **JSON export** - Data backup and transfer
2. **HTML export** - Printable presentations
3. **PNG export** - Whiteboard as image
4. **SVG export** - Scalable vector graphics

Key features:
- Multiple format support
- Print-friendly HTML output
- High-resolution image export
- Native Excalidraw format export

---

## Part 4 Complete

You now have:
- Project management with CRUD operations
- Multi-step form wizard
- Image annotation system
- Collaborative whiteboard
- Invitation and permission system
- Multiple export formats

---

*Continue to [Part 5: Components & Code Deep Dive](../part-05-components-code/README.md) for detailed component implementations.*
