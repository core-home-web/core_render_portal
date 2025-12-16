'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Code, 
  Loader2,
  ChevronDown,
} from 'lucide-react'
import type { ExcalidrawBoardRef } from './ExcalidrawBoard'

export interface ExportMenuProps {
  /** Reference to the ExcalidrawBoard component */
  boardRef: React.RefObject<ExcalidrawBoardRef>
  /** Project name for file naming */
  projectName?: string
  /** Whether exports are disabled */
  disabled?: boolean
  /** Custom class name */
  className?: string
}

type ExportFormat = 'png' | 'svg' | 'json' | 'html'

/**
 * ExportMenu - Dropdown menu for exporting Excalidraw board
 */
export function ExportMenu({
  boardRef,
  projectName = 'whiteboard',
  disabled = false,
  className = '',
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  /**
   * Generate filename for export
   */
  const getFileName = (format: ExportFormat): string => {
    const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const timestamp = new Date().toISOString().split('T')[0]
    return `${sanitizedName}_${timestamp}.${format}`
  }

  /**
   * Download a blob as a file
   */
  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Download text content as a file
   */
  const downloadText = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType })
    downloadBlob(blob, filename)
  }

  /**
   * Export to PNG
   */
  const exportToPng = async () => {
    if (!boardRef.current) return
    
    setIsExporting('png')
    try {
      const blob = await boardRef.current.exportToPng({ scale: 2, background: true })
      if (blob) {
        downloadBlob(blob, getFileName('png'))
      }
    } catch (error) {
      console.error('PNG export failed:', error)
      alert('Failed to export PNG. Please try again.')
    } finally {
      setIsExporting(null)
      setIsOpen(false)
    }
  }

  /**
   * Export to SVG
   */
  const exportToSvg = async () => {
    if (!boardRef.current) return
    
    setIsExporting('svg')
    try {
      const svg = await boardRef.current.exportToSvg()
      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg)
        downloadText(svgString, getFileName('svg'), 'image/svg+xml')
      }
    } catch (error) {
      console.error('SVG export failed:', error)
      alert('Failed to export SVG. Please try again.')
    } finally {
      setIsExporting(null)
      setIsOpen(false)
    }
  }

  /**
   * Export to JSON
   */
  const exportToJson = async () => {
    if (!boardRef.current) return
    
    setIsExporting('json')
    try {
      const json = await boardRef.current.exportToJson()
      if (json) {
        downloadText(json, getFileName('json'), 'application/json')
      }
    } catch (error) {
      console.error('JSON export failed:', error)
      alert('Failed to export JSON. Please try again.')
    } finally {
      setIsExporting(null)
      setIsOpen(false)
    }
  }

  /**
   * Export to HTML (embedded SVG)
   */
  const exportToHtml = async () => {
    if (!boardRef.current) return
    
    setIsExporting('svg')
    try {
      const svg = await boardRef.current.exportToSvg()
      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg)
        const htmlContent = generateHtmlDocument(projectName, svgString)
        downloadText(htmlContent, getFileName('html').replace('.html', '') + '.html', 'text/html')
      }
    } catch (error) {
      console.error('HTML export failed:', error)
      alert('Failed to export HTML. Please try again.')
    } finally {
      setIsExporting(null)
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting !== null}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={exportToPng}
              disabled={isExporting !== null}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">PNG Image</div>
                <div className="text-xs text-gray-500">High quality raster image</div>
              </div>
            </button>

            <button
              onClick={exportToSvg}
              disabled={isExporting !== null}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
            >
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">SVG Vector</div>
                <div className="text-xs text-gray-500">Scalable vector graphics</div>
              </div>
            </button>

            <button
              onClick={exportToJson}
              disabled={isExporting !== null}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
            >
              <Code className="h-4 w-4 text-purple-600" />
              <div>
                <div className="font-medium">JSON Data</div>
                <div className="text-xs text-gray-500">Excalidraw format</div>
              </div>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={exportToHtml}
              disabled={isExporting !== null}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
            >
              <FileText className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-medium">HTML Page</div>
                <div className="text-xs text-gray-500">Standalone presentation</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Generate an HTML document with embedded SVG
 */
function generateHtmlDocument(title: string, svgContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Whiteboard Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .header .metadata {
      opacity: 0.9;
      font-size: 0.875rem;
    }
    
    .whiteboard-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 24px;
      overflow: auto;
    }
    
    .whiteboard-container svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      color: rgba(255,255,255,0.7);
      font-size: 0.75rem;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .header {
        color: #333;
      }
      
      .whiteboard-container {
        box-shadow: none;
        border: 1px solid #eee;
      }
      
      .footer {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${title}</h1>
      <p class="metadata">Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </header>
    
    <main class="whiteboard-container">
      ${svgContent}
    </main>
    
    <footer class="footer">
      Generated by Core Render Portal - Powered by Excalidraw
    </footer>
  </div>
</body>
</html>`
}

export default ExportMenu
