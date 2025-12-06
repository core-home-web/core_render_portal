import { Project } from '@/types'
import { PRESENTATION_THEMES, getThemeCSS } from './presentation-themes'

export interface WhiteboardExportOptions {
  /** Custom title for the export */
  title?: string
  /** Include project metadata in the export */
  includeMetadata?: boolean
  /** Theme name to apply */
  theme?: string
  /** Whether to include print styles */
  includePrintStyles?: boolean
  /** Custom CSS to inject */
  customCss?: string
  /** Background color for the SVG container */
  backgroundColor?: string
}

/**
 * Generate HTML document from whiteboard SVG content
 * 
 * @param project - The project data
 * @param svgContent - The SVG string exported from tldraw
 * @param options - Export options
 * @returns HTML string
 */
export function generateWhiteboardHTML(
  project: Project,
  svgContent: string,
  options: WhiteboardExportOptions = {}
): string {
  const {
    title = project.title,
    includeMetadata = true,
    theme = 'Core Home Professional',
    includePrintStyles = true,
    customCss = '',
    backgroundColor = '#ffffff',
  } = options

  // Get theme CSS if available
  const selectedTheme = PRESENTATION_THEMES.find((t) => t.name === theme)
  const themeCSS = selectedTheme ? getThemeCSS(selectedTheme) : ''

  const metadataSection = includeMetadata
    ? `
    <header class="header">
      <h1>${escapeHtml(title)}</h1>
      <div class="metadata">
        ${project.retailer ? `<span>Retailer: ${escapeHtml(project.retailer)}</span>` : ''}
        ${project.due_date ? `<span>Due: ${formatDate(project.due_date)}</span>` : ''}
        <span>Exported: ${formatDate(new Date().toISOString())}</span>
      </div>
    </header>
    `
    : ''

  const printStyles = includePrintStyles
    ? `
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      
      .container {
        max-width: none;
        padding: 0;
      }
      
      .header {
        margin-bottom: 20px;
      }
      
      .whiteboard-container {
        box-shadow: none;
        border-radius: 0;
        padding: 0;
        page-break-inside: avoid;
      }
      
      .footer {
        display: none;
      }
      
      @page {
        margin: 1cm;
        size: landscape;
      }
    }
    `
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Core Render Portal Whiteboard">
  <meta name="project-id" content="${project.id}">
  <title>${escapeHtml(title)} - Whiteboard Export</title>
  <style>
    ${themeCSS}
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--background, #f8fafc);
      min-height: 100vh;
      padding: 40px 20px;
      color: var(--text, #1e293b);
    }
    
    .container {
      max-width: 1600px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary, #1e293b);
      margin-bottom: 12px;
      line-height: 1.2;
    }
    
    .header .metadata {
      color: var(--text-light, #64748b);
      font-size: 0.875rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
    
    .header .metadata span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .whiteboard-container {
      background: ${backgroundColor};
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      padding: 24px;
      overflow: auto;
      position: relative;
    }
    
    .whiteboard-container svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    /* Ensure SVG elements are properly styled */
    .whiteboard-container svg text {
      font-family: inherit;
    }
    
    .whiteboard-container svg image {
      image-rendering: auto;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border, #e2e8f0);
      color: var(--text-light, #94a3b8);
      font-size: 0.75rem;
    }
    
    .footer a {
      color: var(--primary, #3b82f6);
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      body {
        padding: 20px 16px;
      }
      
      .header h1 {
        font-size: 1.75rem;
      }
      
      .header .metadata {
        flex-direction: column;
        gap: 8px;
      }
      
      .whiteboard-container {
        padding: 16px;
        border-radius: 12px;
      }
    }
    
    ${printStyles}
    
    ${customCss}
  </style>
</head>
<body>
  <div class="container">
    ${metadataSection}
    
    <main class="whiteboard-container">
      ${svgContent}
    </main>
    
    <footer class="footer">
      <p>Generated by Core Render Portal Whiteboard</p>
      <p>Project: ${escapeHtml(project.title)}${project.retailer ? ` | Retailer: ${escapeHtml(project.retailer)}` : ''}</p>
    </footer>
  </div>
</body>
</html>`
}

/**
 * Generate a minimal HTML export (SVG only, no styling)
 */
export function generateMinimalHTML(
  svgContent: string,
  title: string = 'Whiteboard Export'
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 20px; background: #fff; }
    svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`
}

/**
 * Download HTML content as a file
 */
export function downloadHTML(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download SVG content as a file
 */
export function downloadSVG(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Format a date string for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}
